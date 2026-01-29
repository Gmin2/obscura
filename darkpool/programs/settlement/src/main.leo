/**
 * Obscura Settlement Module
 * Handles atomic token swaps for matched trades.
 */
program obscura_settlement.aleo {

    /** Token record for settlement */
    record Token {
        owner: address,
        asset_id: field,
        amount: u128,
    }

    /** Settlement receipt - proof of completed trade */
    record SettlementReceipt {
        owner: address,
        match_id: field,
        base_asset: field,
        quote_asset: field,
        base_amount: u128,
        quote_amount: u128,
        is_buyer: bool,
        timestamp: u64,
    }

    /** Settled trades: match_id => true */
    mapping settled: field => bool;

    /** Price scale factor (1e8) */
    const PRICE_SCALE: u128 = 100000000u128;

    /**
     * Settle a matched trade with atomic token swap.
     * Buyer receives base asset, seller receives quote asset.
     */
    async transition settle(
        match_id: field,
        buyer: address,
        seller: address,
        base_asset: field,
        quote_asset: field,
        base_amount: u128,
        price: u128,
        buyer_payment: Token,
        seller_asset: Token,
        timestamp: u64
    ) -> (SettlementReceipt, SettlementReceipt, Token, Token, Token, Token, Future) {
        // Calculate quote amount
        let quote_amount: u128 = (base_amount * price) / PRICE_SCALE;

        // Verify tokens
        assert_eq(buyer_payment.asset_id, quote_asset);
        assert_eq(seller_asset.asset_id, base_asset);
        assert(buyer_payment.amount >= quote_amount);
        assert(seller_asset.amount >= base_amount);

        // Base asset to buyer
        let base_to_buyer: Token = Token {
            owner: buyer,
            asset_id: base_asset,
            amount: base_amount,
        };

        // Quote asset to seller
        let quote_to_seller: Token = Token {
            owner: seller,
            asset_id: quote_asset,
            amount: quote_amount,
        };

        // Change to buyer
        let buyer_change: Token = Token {
            owner: buyer,
            asset_id: quote_asset,
            amount: buyer_payment.amount - quote_amount,
        };

        // Change to seller
        let seller_change: Token = Token {
            owner: seller,
            asset_id: base_asset,
            amount: seller_asset.amount - base_amount,
        };

        // Receipts
        let buyer_receipt: SettlementReceipt = SettlementReceipt {
            owner: buyer,
            match_id,
            base_asset,
            quote_asset,
            base_amount,
            quote_amount,
            is_buyer: true,
            timestamp,
        };

        let seller_receipt: SettlementReceipt = SettlementReceipt {
            owner: seller,
            match_id,
            base_asset,
            quote_asset,
            base_amount,
            quote_amount,
            is_buyer: false,
            timestamp,
        };

        return (
            buyer_receipt,
            seller_receipt,
            base_to_buyer,
            quote_to_seller,
            buyer_change,
            seller_change,
            finalize_settle(match_id)
        );
    }

    async function finalize_settle(match_id: field) {
        let already_settled: bool = Mapping::get_or_use(settled, match_id, false);
        assert(!already_settled);
        Mapping::set(settled, match_id, true);
    }

    /** Check if a trade has been settled */
    async transition is_settled(match_id: field) -> Future {
        return finalize_is_settled(match_id);
    }

    async function finalize_is_settled(match_id: field) {
        let was_settled: bool = Mapping::get_or_use(settled, match_id, false);
        assert(was_settled);
    }

    @noupgrade
    async constructor() {}
}
