/**
 * Obscura Matching Engine Module
 * Handles order matching with ZK verification.
 */
program obscura_matching.aleo {

    const BUY: u8 = 0u8;
    const SELL: u8 = 1u8;

    /** Match receipt - proof of successful order match */
    record MatchReceipt {
        owner: address,
        match_id: field,
        order_id: field,
        counterparty_order_id: field,
        base_asset: field,
        quote_asset: field,
        amount: u128,
        price: u128,
        is_buy: bool,
        timestamp: u64,
    }

    struct MatchIdInput {
        buy_order_id: field,
        sell_order_id: field,
        amount: u128,
        timestamp: u64,
    }

    struct MarketInput {
        base_asset: field,
        quote_asset: field,
    }

    /** Executed matches: match_id => true */
    mapping executed: field => bool;

    /** Market volume: market_id => volume */
    mapping volume: field => u128;

    /**
     * Verify and record a match between two orders.
     * All verification happens in ZK - only match_id is stored publicly.
     */
    async transition execute(
        buy_order_id: field,
        buy_owner: address,
        buy_price: u128,
        sell_order_id: field,
        sell_owner: address,
        sell_price: u128,
        base_asset: field,
        quote_asset: field,
        execution_price: u128,
        amount: u128,
        timestamp: u64
    ) -> (MatchReceipt, MatchReceipt, Future) {
        // Verify price compatibility
        assert(buy_price >= execution_price);
        assert(execution_price >= sell_price);
        assert(amount > 0u128);

        let match_id: field = BHP256::hash_to_field(MatchIdInput {
            buy_order_id,
            sell_order_id,
            amount,
            timestamp,
        });

        let buyer_receipt: MatchReceipt = MatchReceipt {
            owner: buy_owner,
            match_id,
            order_id: buy_order_id,
            counterparty_order_id: sell_order_id,
            base_asset,
            quote_asset,
            amount,
            price: execution_price,
            is_buy: true,
            timestamp,
        };

        let seller_receipt: MatchReceipt = MatchReceipt {
            owner: sell_owner,
            match_id,
            order_id: sell_order_id,
            counterparty_order_id: buy_order_id,
            base_asset,
            quote_asset,
            amount,
            price: execution_price,
            is_buy: false,
            timestamp,
        };

        let market_id: field = BHP256::hash_to_field(MarketInput { base_asset, quote_asset });

        return (buyer_receipt, seller_receipt, finalize_execute(match_id, market_id, amount));
    }

    async function finalize_execute(match_id: field, market_id: field, amount: u128) {
        let already_executed: bool = Mapping::get_or_use(executed, match_id, false);
        assert(!already_executed);
        Mapping::set(executed, match_id, true);

        let current_volume: u128 = Mapping::get_or_use(volume, market_id, 0u128);
        Mapping::set(volume, market_id, current_volume + amount);
    }

    /** Check if a match has been executed */
    async transition is_executed(match_id: field) -> Future {
        return finalize_is_executed(match_id);
    }

    async function finalize_is_executed(match_id: field) {
        let was_executed: bool = Mapping::get_or_use(executed, match_id, false);
        assert(was_executed);
    }

    @noupgrade
    async constructor() {}
}
