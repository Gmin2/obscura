/**
 * Obscura Order Book Module
 * Manages private order records and public commitments.
 */
program obscura_orderbook.aleo {

    const BUY: u8 = 0u8;
    const SELL: u8 = 1u8;

    /**
     * Private order record.
     * Only the owner can see the full order details.
     */
    record Order {
        owner: address,
        order_id: field,
        side: u8,
        base_asset: field,
        quote_asset: field,
        amount: u128,
        price: u128,
        salt: scalar,
        filled: u128,
        created_at: u64,
    }

    struct OrderIdInput {
        placer: address,
        base_asset: field,
        quote_asset: field,
        amount: u128,
        price: u128,
        salt: scalar,
        timestamp: u64,
    }

    struct CommitmentInput {
        price: u128,
        amount: u128,
    }

    struct MarketInput {
        base_asset: field,
        quote_asset: field,
    }

    struct CountKey {
        market_id: field,
        side: u8,
    }

    /** Order commitments: order_id => hash(price, amount, salt) */
    mapping commitments: field => field;

    /** Order owners: order_id => hash(owner) */
    mapping owners: field => field;

    /** Order sides: order_id => side */
    mapping sides: field => u8;

    /** Order markets: order_id => market_id */
    mapping markets: field => field;

    /** Order active status: order_id => is_active */
    mapping active: field => bool;

    /** Order counts: hash(market_id, side) => count */
    mapping counts: field => u64;

    /**
     * Place a new order.
     * Creates private Order record and stores commitment publicly.
     */
    async transition place(
        side: u8,
        base_asset: field,
        quote_asset: field,
        amount: u128,
        price: u128,
        salt: scalar,
        timestamp: u64
    ) -> (Order, Future) {
        assert(side == BUY || side == SELL);
        assert(amount > 0u128);
        assert(price > 0u128);

        let order_id: field = BHP256::hash_to_field(OrderIdInput {
            placer: self.signer,
            base_asset,
            quote_asset,
            amount,
            price,
            salt,
            timestamp,
        });

        let commitment: field = BHP256::commit_to_field(
            CommitmentInput { price, amount },
            salt
        );

        let owner_hash: field = BHP256::hash_to_field(self.signer);
        let market_id: field = BHP256::hash_to_field(MarketInput { base_asset, quote_asset });

        let order: Order = Order {
            owner: self.signer,
            order_id,
            side,
            base_asset,
            quote_asset,
            amount,
            price,
            salt,
            filled: 0u128,
            created_at: timestamp,
        };

        return (order, finalize_place(order_id, commitment, owner_hash, side, market_id));
    }

    async function finalize_place(
        order_id: field,
        commitment: field,
        owner_hash: field,
        side: u8,
        market_id: field
    ) {
        let exists: bool = Mapping::get_or_use(active, order_id, false);
        assert(!exists);

        Mapping::set(commitments, order_id, commitment);
        Mapping::set(owners, order_id, owner_hash);
        Mapping::set(sides, order_id, side);
        Mapping::set(markets, order_id, market_id);
        Mapping::set(active, order_id, true);

        let count_key: field = BHP256::hash_to_field(CountKey { market_id, side });
        let current: u64 = Mapping::get_or_use(counts, count_key, 0u64);
        Mapping::set(counts, count_key, current + 1u64);
    }

    /** Cancel an active order */
    async transition cancel(order: Order) -> Future {
        assert(order.filled < order.amount);

        let market_id: field = BHP256::hash_to_field(MarketInput {
            base_asset: order.base_asset,
            quote_asset: order.quote_asset,
        });

        return finalize_cancel(order.order_id, order.side, market_id);
    }

    async function finalize_cancel(order_id: field, side: u8, market_id: field) {
        let is_active: bool = Mapping::get_or_use(active, order_id, false);
        assert(is_active);

        Mapping::set(active, order_id, false);

        let count_key: field = BHP256::hash_to_field(CountKey { market_id, side });
        let current: u64 = Mapping::get_or_use(counts, count_key, 1u64);
        Mapping::set(counts, count_key, current - 1u64);
    }

    /** Update order after partial fill - returns new order record */
    transition update_fill(order: Order, fill_amount: u128) -> Order {
        assert(fill_amount <= order.amount - order.filled);

        return Order {
            owner: order.owner,
            order_id: order.order_id,
            side: order.side,
            base_asset: order.base_asset,
            quote_asset: order.quote_asset,
            amount: order.amount,
            price: order.price,
            salt: order.salt,
            filled: order.filled + fill_amount,
            created_at: order.created_at,
        };
    }

    /** Mark order as filled on-chain */
    async transition mark_filled(order_id: field, market_id: field, side: u8) -> Future {
        return finalize_mark_filled(order_id, market_id, side);
    }

    async function finalize_mark_filled(order_id: field, market_id: field, side: u8) {
        Mapping::set(active, order_id, false);

        let count_key: field = BHP256::hash_to_field(CountKey { market_id, side });
        let current: u64 = Mapping::get_or_use(counts, count_key, 1u64);
        Mapping::set(counts, count_key, current - 1u64);
    }

    @noupgrade
    async constructor() {}
}
