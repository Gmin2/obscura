/**
 * Obscura Dark Pool
 *
 * A privacy-preserving decentralized exchange built on Aleo.
 * This is the main entry point that orchestrates all modules.
 *
 * Architecture:
 * - Token:      Private token records for trading
 * - OrderBook:  Order management with commitment scheme
 * - Matching:   ZK-verified order matching
 * - Settlement: Atomic token swaps
 */
program darkpool.aleo {

    const BUY: u8 = 0u8;
    const SELL: u8 = 1u8;
    const PRICE_SCALE: u128 = 100000000u128;

    /** Private token for trading */
    record Token {
        owner: address,
        asset_id: field,
        amount: u128,
    }

    /** Private order with hidden price/amount */
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

    /** Proof of order match */
    record MatchReceipt {
        owner: address,
        match_id: field,
        order_id: field,
        counterparty_order_id: field,
        amount_filled: u128,
        execution_price: u128,
        is_buy: bool,
        timestamp: u64,
    }

    /** Proof of settlement */
    record SettlementReceipt {
        owner: address,
        match_id: field,
        base_amount: u128,
        quote_amount: u128,
        timestamp: u64,
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

    struct MatchIdInput {
        buy_order_id: field,
        sell_order_id: field,
        match_amount: u128,
        timestamp: u64,
    }

    struct CountKeyInput {
        market_id: field,
        side: u8,
    }

    mapping order_commitments: field => field;
    mapping order_owners: field => field;
    mapping order_sides: field => u8;
    mapping order_markets: field => field;
    mapping order_active: field => bool;
    mapping executed_matches: field => bool;
    mapping settled_matches: field => bool;
    mapping market_volume: field => u128;
    mapping order_counts: field => u64;

    /** Mint tokens */
    transition mint_token(receiver: address, asset_id: field, amount: u128) -> Token {
        return Token { owner: receiver, asset_id, amount };
    }

    /** Transfer tokens */
    transition transfer_token(token: Token, to: address, amount: u128) -> (Token, Token) {
        return (
            Token { owner: token.owner, asset_id: token.asset_id, amount: token.amount - amount },
            Token { owner: to, asset_id: token.asset_id, amount }
        );
    }

    /** Split token into two */
    transition split_token(token: Token, amount: u128) -> (Token, Token) {
        return (
            Token { owner: token.owner, asset_id: token.asset_id, amount },
            Token { owner: token.owner, asset_id: token.asset_id, amount: token.amount - amount }
        );
    }

    /** Combine two tokens */
    transition combine_tokens(a: Token, b: Token) -> Token {
        assert_eq(a.asset_id, b.asset_id);
        assert_eq(a.owner, b.owner);
        return Token { owner: a.owner, asset_id: a.asset_id, amount: a.amount + b.amount };
    }

    /** Place a new order */
    async transition place_order(
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
            placer: self.signer, base_asset, quote_asset, amount, price, salt, timestamp
        });

        let commitment: field = BHP256::commit_to_field(CommitmentInput { price, amount }, salt);
        let owner_hash: field = BHP256::hash_to_field(self.signer);
        let market_id: field = BHP256::hash_to_field(MarketInput { base_asset, quote_asset });

        let order: Order = Order {
            owner: self.signer, order_id, side, base_asset, quote_asset,
            amount, price, salt, filled: 0u128, created_at: timestamp
        };

        return (order, finalize_place_order(order_id, commitment, owner_hash, side, market_id));
    }

    async function finalize_place_order(
        order_id: field, commitment: field, owner_hash: field, side: u8, market_id: field
    ) {
        assert(!Mapping::get_or_use(order_active, order_id, false));

        Mapping::set(order_commitments, order_id, commitment);
        Mapping::set(order_owners, order_id, owner_hash);
        Mapping::set(order_sides, order_id, side);
        Mapping::set(order_markets, order_id, market_id);
        Mapping::set(order_active, order_id, true);

        let count_key: field = BHP256::hash_to_field(CountKeyInput { market_id, side });
        Mapping::set(order_counts, count_key, Mapping::get_or_use(order_counts, count_key, 0u64) + 1u64);
    }

    /** Cancel an order */
    async transition cancel_order(order: Order) -> Future {
        assert(order.filled < order.amount);
        let market_id: field = BHP256::hash_to_field(MarketInput {
            base_asset: order.base_asset, quote_asset: order.quote_asset
        });
        return finalize_cancel_order(order.order_id, order.side, market_id);
    }

    async function finalize_cancel_order(order_id: field, side: u8, market_id: field) {
        assert(Mapping::get_or_use(order_active, order_id, false));
        Mapping::set(order_active, order_id, false);

        let count_key: field = BHP256::hash_to_field(CountKeyInput { market_id, side });
        Mapping::set(order_counts, count_key, Mapping::get_or_use(order_counts, count_key, 1u64) - 1u64);
    }

    /** Match two orders */
    async transition match_orders(
        buy_order: Order,
        sell_order: Order,
        execution_price: u128,
        match_amount: u128,
        timestamp: u64
    ) -> (MatchReceipt, MatchReceipt, Order, Order, Future) {
        assert(buy_order.side == BUY && sell_order.side == SELL);
        assert(buy_order.base_asset == sell_order.base_asset);
        assert(buy_order.quote_asset == sell_order.quote_asset);
        assert(buy_order.price >= execution_price && execution_price >= sell_order.price);

        let buy_remaining: u128 = buy_order.amount - buy_order.filled;
        let sell_remaining: u128 = sell_order.amount - sell_order.filled;
        assert(match_amount <= buy_remaining && match_amount <= sell_remaining && match_amount > 0u128);

        let match_id: field = BHP256::hash_to_field(MatchIdInput {
            buy_order_id: buy_order.order_id, sell_order_id: sell_order.order_id, match_amount, timestamp
        });

        let buyer_receipt: MatchReceipt = MatchReceipt {
            owner: buy_order.owner, match_id, order_id: buy_order.order_id,
            counterparty_order_id: sell_order.order_id, amount_filled: match_amount,
            execution_price, is_buy: true, timestamp
        };

        let seller_receipt: MatchReceipt = MatchReceipt {
            owner: sell_order.owner, match_id, order_id: sell_order.order_id,
            counterparty_order_id: buy_order.order_id, amount_filled: match_amount,
            execution_price, is_buy: false, timestamp
        };

        let new_buy_filled: u128 = buy_order.filled + match_amount;
        let new_sell_filled: u128 = sell_order.filled + match_amount;

        let updated_buy: Order = Order {
            owner: buy_order.owner, order_id: buy_order.order_id, side: BUY,
            base_asset: buy_order.base_asset, quote_asset: buy_order.quote_asset,
            amount: buy_order.amount, price: buy_order.price, salt: buy_order.salt,
            filled: new_buy_filled, created_at: buy_order.created_at
        };

        let updated_sell: Order = Order {
            owner: sell_order.owner, order_id: sell_order.order_id, side: SELL,
            base_asset: sell_order.base_asset, quote_asset: sell_order.quote_asset,
            amount: sell_order.amount, price: sell_order.price, salt: sell_order.salt,
            filled: new_sell_filled, created_at: sell_order.created_at
        };

        let market_id: field = BHP256::hash_to_field(MarketInput {
            base_asset: buy_order.base_asset, quote_asset: buy_order.quote_asset
        });

        return (
            buyer_receipt, seller_receipt, updated_buy, updated_sell,
            finalize_match(
                match_id, buy_order.order_id, sell_order.order_id,
                match_amount, market_id,
                new_buy_filled >= buy_order.amount,
                new_sell_filled >= sell_order.amount
            )
        );
    }

    async function finalize_match(
        match_id: field, buy_order_id: field, sell_order_id: field,
        match_amount: u128, market_id: field,
        buy_filled: bool, sell_filled: bool
    ) {
        assert(Mapping::get_or_use(order_active, buy_order_id, false));
        assert(Mapping::get_or_use(order_active, sell_order_id, false));
        assert(!Mapping::get_or_use(executed_matches, match_id, false));

        Mapping::set(executed_matches, match_id, true);
        Mapping::set(market_volume, market_id,
            Mapping::get_or_use(market_volume, market_id, 0u128) + match_amount);

        if buy_filled {
            Mapping::set(order_active, buy_order_id, false);
            let key: field = BHP256::hash_to_field(CountKeyInput { market_id, side: 0u8 });
            Mapping::set(order_counts, key, Mapping::get_or_use(order_counts, key, 1u64) - 1u64);
        }

        if sell_filled {
            Mapping::set(order_active, sell_order_id, false);
            let key: field = BHP256::hash_to_field(CountKeyInput { market_id, side: 1u8 });
            Mapping::set(order_counts, key, Mapping::get_or_use(order_counts, key, 1u64) - 1u64);
        }
    }

    /** Settle a matched trade */
    async transition settle_trade(
        buyer_receipt: MatchReceipt,
        seller_receipt: MatchReceipt,
        buyer_quote_token: Token,
        seller_base_token: Token,
        base_asset: field,
        quote_asset: field,
        timestamp: u64
    ) -> (SettlementReceipt, SettlementReceipt, Token, Token, Token, Token, Future) {
        assert(buyer_receipt.match_id == seller_receipt.match_id);
        assert(buyer_receipt.is_buy && !seller_receipt.is_buy);
        assert(buyer_receipt.amount_filled == seller_receipt.amount_filled);
        assert(buyer_quote_token.asset_id == quote_asset);
        assert(seller_base_token.asset_id == base_asset);

        let base_amount: u128 = buyer_receipt.amount_filled;
        let quote_amount: u128 = (base_amount * buyer_receipt.execution_price) / PRICE_SCALE;

        assert(buyer_quote_token.amount >= quote_amount);
        assert(seller_base_token.amount >= base_amount);

        return (
            SettlementReceipt {
                owner: buyer_receipt.owner, match_id: buyer_receipt.match_id,
                base_amount, quote_amount, timestamp
            },
            SettlementReceipt {
                owner: seller_receipt.owner, match_id: seller_receipt.match_id,
                base_amount, quote_amount, timestamp
            },
            Token { owner: buyer_receipt.owner, asset_id: base_asset, amount: base_amount },
            Token { owner: seller_receipt.owner, asset_id: quote_asset, amount: quote_amount },
            Token { owner: buyer_receipt.owner, asset_id: quote_asset, amount: buyer_quote_token.amount - quote_amount },
            Token { owner: seller_receipt.owner, asset_id: base_asset, amount: seller_base_token.amount - base_amount },
            finalize_settle(buyer_receipt.match_id)
        );
    }

    async function finalize_settle(match_id: field) {
        assert(Mapping::get_or_use(executed_matches, match_id, false));
        assert(!Mapping::get_or_use(settled_matches, match_id, false));
        Mapping::set(settled_matches, match_id, true);
    }

    @noupgrade
    async constructor() {}
}
