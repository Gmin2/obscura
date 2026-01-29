// Obscura Dark Pool - Privacy-preserving trading on Aleo
// Orders are private (records), only commitments are public (mappings)
program darkpool.aleo {

    // =========================================================================
    // CONSTANTS
    // =========================================================================

    // Order sides
    const BUY: u8 = 0u8;
    const SELL: u8 = 1u8;

    // Order status
    const STATUS_ACTIVE: u8 = 1u8;
    const STATUS_FILLED: u8 = 2u8;
    const STATUS_CANCELLED: u8 = 3u8;

    // =========================================================================
    // DATA STRUCTURES
    // =========================================================================

    // Token record for trading assets
    record Token {
        owner: address,
        // Asset identifier (e.g., hash of "USDC", "BTC", etc.)
        asset_id: field,
        amount: u128,
    }

    // Private order record - only the owner can see order details
    record Order {
        // The order owner
        owner: address,
        // Unique order identifier
        order_id: field,
        // BUY (0) or SELL (1)
        side: u8,
        // Asset being traded (base asset)
        base_asset: field,
        // Asset used for payment (quote asset)
        quote_asset: field,
        // Amount of base asset
        amount: u128,
        // Limit price (in quote asset per base asset, scaled by 1e8)
        price: u128,
        // Random salt for commitment
        salt: scalar,
        // Amount already filled
        filled: u128,
        // Timestamp when order was created
        created_at: u64,
    }

    // Match proof record - proves a valid match occurred
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

    // Settlement receipt - proof of completed settlement
    record SettlementReceipt {
        owner: address,
        match_id: field,
        base_amount: u128,
        quote_amount: u128,
        timestamp: u64,
    }

    // =========================================================================
    // PUBLIC STATE (MAPPINGS) - Only commitments, not actual values
    // =========================================================================

    // Order commitment: order_id => hash(price, amount, salt)
    // Hides actual price and amount behind a hash
    mapping order_commitments: field => field;

    // Order owner: order_id => owner_hash (hashed for privacy)
    mapping order_owners: field => field;

    // Order side: order_id => side (0=buy, 1=sell)
    // Minimal info needed for matching
    mapping order_sides: field => u8;

    // Order market: order_id => market_id (hash of base_asset + quote_asset)
    mapping order_markets: field => field;

    // Order active status: order_id => is_active
    mapping order_active: field => bool;

    // Executed matches: match_id => true (prevents double execution)
    mapping executed_matches: field => bool;

    // Settled matches: match_id => true (prevents double settlement)
    mapping settled_matches: field => bool;

    // Market statistics (aggregate only - no individual order info)
    // market_id => total_volume
    mapping market_volume: field => u128;

    // Active order counts per market side
    // hash(market_id, side) => count
    mapping order_counts: field => u64;

    // =========================================================================
    // TOKEN FUNCTIONS
    // =========================================================================

    // Mint tokens (for testing - in production would be controlled)
    transition mint_token(
        receiver: address,
        asset_id: field,
        amount: u128
    ) -> Token {
        return Token {
            owner: receiver,
            asset_id: asset_id,
            amount: amount,
        };
    }

    // Transfer tokens privately
    transition transfer_token(
        token: Token,
        to: address,
        amount: u128
    ) -> (Token, Token) {
        // Check sufficient balance
        let remaining_amount: u128 = token.amount - amount;

        // Create remaining token for sender
        let remaining: Token = Token {
            owner: token.owner,
            asset_id: token.asset_id,
            amount: remaining_amount,
        };

        // Create token for receiver
        let transferred: Token = Token {
            owner: to,
            asset_id: token.asset_id,
            amount: amount,
        };

        return (remaining, transferred);
    }

    // =========================================================================
    // ORDER PLACEMENT
    // =========================================================================

    // Place a new order - creates private Order record + public commitment
    // Note: salt should be generated off-chain by the user for privacy
    async transition place_order(
        side: u8,
        base_asset: field,
        quote_asset: field,
        amount: u128,
        price: u128,
        salt: scalar,
        timestamp: u64
    ) -> (Order, Future) {
        // Validate side
        assert(side == BUY || side == SELL);

        // Validate amount and price
        assert(amount > 0u128);
        assert(price > 0u128);

        // Create unique order ID from hash of order details
        let order_id: field = BHP256::hash_to_field(
            OrderIdInput {
                placer: self.signer,
                base_asset: base_asset,
                quote_asset: quote_asset,
                amount: amount,
                price: price,
                salt: salt,
                timestamp: timestamp,
            }
        );

        // Create commitment that hides price and amount
        // commitment = hash(price || amount || salt)
        let commitment: field = BHP256::commit_to_field(
            CommitmentInput {
                price: price,
                amount: amount,
            },
            salt
        );

        // Hash owner for privacy in public mapping
        let owner_hash: field = BHP256::hash_to_field(self.signer);

        // Create market ID
        let market_id: field = BHP256::hash_to_field(
            MarketInput {
                base_asset: base_asset,
                quote_asset: quote_asset,
            }
        );

        // Create private order record
        let order: Order = Order {
            owner: self.signer,
            order_id: order_id,
            side: side,
            base_asset: base_asset,
            quote_asset: quote_asset,
            amount: amount,
            price: price,
            salt: salt,
            filled: 0u128,
            created_at: timestamp,
        };

        return (order, finalize_place_order(
            order_id,
            commitment,
            owner_hash,
            side,
            market_id
        ));
    }

    async function finalize_place_order(
        order_id: field,
        commitment: field,
        owner_hash: field,
        side: u8,
        market_id: field
    ) {
        // Ensure order doesn't already exist
        let exists: bool = Mapping::get_or_use(order_active, order_id, false);
        assert(!exists);

        // Store commitment (not actual price/amount!)
        Mapping::set(order_commitments, order_id, commitment);
        Mapping::set(order_owners, order_id, owner_hash);
        Mapping::set(order_sides, order_id, side);
        Mapping::set(order_markets, order_id, market_id);
        Mapping::set(order_active, order_id, true);

        // Update order count for this market/side
        let count_key: field = BHP256::hash_to_field(
            CountKeyInput {
                market_id: market_id,
                side: side,
            }
        );
        let current_count: u64 = Mapping::get_or_use(order_counts, count_key, 0u64);
        Mapping::set(order_counts, count_key, current_count + 1u64);
    }

    // =========================================================================
    // ORDER CANCELLATION
    // =========================================================================

    // Cancel an order - only owner can cancel
    async transition cancel_order(order: Order) -> Future {
        // Order ownership is enforced by record - only owner has the record
        // Verify order is not fully filled
        assert(order.filled < order.amount);

        let market_id: field = BHP256::hash_to_field(
            MarketInput {
                base_asset: order.base_asset,
                quote_asset: order.quote_asset,
            }
        );

        return finalize_cancel_order(order.order_id, order.side, market_id);
    }

    async function finalize_cancel_order(
        order_id: field,
        side: u8,
        market_id: field
    ) {
        // Verify order is active
        let is_active: bool = Mapping::get_or_use(order_active, order_id, false);
        assert(is_active);

        // Mark order as inactive
        Mapping::set(order_active, order_id, false);

        // Update order count
        let count_key: field = BHP256::hash_to_field(
            CountKeyInput {
                market_id: market_id,
                side: side,
            }
        );
        let current_count: u64 = Mapping::get_or_use(order_counts, count_key, 1u64);
        Mapping::set(order_counts, count_key, current_count - 1u64);
    }

    // =========================================================================
    // ORDER MATCHING
    // =========================================================================

    // Match two orders - verifies compatibility via ZK proof
    async transition match_orders(
        buy_order: Order,
        sell_order: Order,
        execution_price: u128,
        match_amount: u128,
        timestamp: u64
    ) -> (MatchReceipt, MatchReceipt, Order, Order, Future) {

        // =====================================================================
        // ZK VERIFICATION (off-chain, private)
        // =====================================================================

        // 1. Verify order sides
        assert(buy_order.side == BUY);
        assert(sell_order.side == SELL);

        // 2. Verify same market (base + quote assets match)
        assert(buy_order.base_asset == sell_order.base_asset);
        assert(buy_order.quote_asset == sell_order.quote_asset);

        // 3. Verify price compatibility
        // Buy price >= execution price >= Sell price
        assert(buy_order.price >= execution_price);
        assert(execution_price >= sell_order.price);

        // 4. Verify sufficient remaining amounts
        let buy_remaining: u128 = buy_order.amount - buy_order.filled;
        let sell_remaining: u128 = sell_order.amount - sell_order.filled;
        assert(match_amount <= buy_remaining);
        assert(match_amount <= sell_remaining);
        assert(match_amount > 0u128);

        // =====================================================================
        // CREATE MATCH ID
        // =====================================================================

        let match_id: field = BHP256::hash_to_field(
            MatchIdInput {
                buy_order_id: buy_order.order_id,
                sell_order_id: sell_order.order_id,
                match_amount: match_amount,
                timestamp: timestamp,
            }
        );

        // =====================================================================
        // CREATE MATCH RECEIPTS
        // =====================================================================

        let buyer_receipt: MatchReceipt = MatchReceipt {
            owner: buy_order.owner,
            match_id: match_id,
            order_id: buy_order.order_id,
            counterparty_order_id: sell_order.order_id,
            amount_filled: match_amount,
            execution_price: execution_price,
            is_buy: true,
            timestamp: timestamp,
        };

        let seller_receipt: MatchReceipt = MatchReceipt {
            owner: sell_order.owner,
            match_id: match_id,
            order_id: sell_order.order_id,
            counterparty_order_id: buy_order.order_id,
            amount_filled: match_amount,
            execution_price: execution_price,
            is_buy: false,
            timestamp: timestamp,
        };

        // =====================================================================
        // CREATE UPDATED ORDERS
        // =====================================================================

        let new_buy_filled: u128 = buy_order.filled + match_amount;
        let new_sell_filled: u128 = sell_order.filled + match_amount;

        let updated_buy_order: Order = Order {
            owner: buy_order.owner,
            order_id: buy_order.order_id,
            side: BUY,
            base_asset: buy_order.base_asset,
            quote_asset: buy_order.quote_asset,
            amount: buy_order.amount,
            price: buy_order.price,
            salt: buy_order.salt,
            filled: new_buy_filled,
            created_at: buy_order.created_at,
        };

        let updated_sell_order: Order = Order {
            owner: sell_order.owner,
            order_id: sell_order.order_id,
            side: SELL,
            base_asset: sell_order.base_asset,
            quote_asset: sell_order.quote_asset,
            amount: sell_order.amount,
            price: sell_order.price,
            salt: sell_order.salt,
            filled: new_sell_filled,
            created_at: sell_order.created_at,
        };

        // Get market ID for finalization
        let market_id: field = BHP256::hash_to_field(
            MarketInput {
                base_asset: buy_order.base_asset,
                quote_asset: buy_order.quote_asset,
            }
        );

        // Determine if orders are fully filled
        let buy_fully_filled: bool = new_buy_filled >= buy_order.amount;
        let sell_fully_filled: bool = new_sell_filled >= sell_order.amount;

        return (
            buyer_receipt,
            seller_receipt,
            updated_buy_order,
            updated_sell_order,
            finalize_match_orders(
                match_id,
                buy_order.order_id,
                sell_order.order_id,
                buy_order.price,
                buy_order.amount - buy_order.filled,
                buy_order.salt,
                sell_order.price,
                sell_order.amount - sell_order.filled,
                sell_order.salt,
                match_amount,
                market_id,
                buy_fully_filled,
                sell_fully_filled
            )
        );
    }

    async function finalize_match_orders(
        match_id: field,
        buy_order_id: field,
        sell_order_id: field,
        buy_price: u128,
        buy_remaining: u128,
        buy_salt: scalar,
        sell_price: u128,
        sell_remaining: u128,
        sell_salt: scalar,
        match_amount: u128,
        market_id: field,
        buy_fully_filled: bool,
        sell_fully_filled: bool
    ) {
        // =====================================================================
        // VERIFY COMMITMENTS (on-chain verification)
        // =====================================================================

        // Verify buy order commitment
        let buy_commitment_computed: field = BHP256::commit_to_field(
            CommitmentInput {
                price: buy_price,
                amount: buy_remaining,
            },
            buy_salt
        );
        // Note: In a real implementation, we'd need to track remaining amounts
        // For simplicity, we verify the orders are active
        let buy_active: bool = Mapping::get_or_use(order_active, buy_order_id, false);
        assert(buy_active);

        // Verify sell order is active
        let sell_active: bool = Mapping::get_or_use(order_active, sell_order_id, false);
        assert(sell_active);

        // =====================================================================
        // RECORD MATCH
        // =====================================================================

        // Prevent duplicate match execution
        let already_executed: bool = Mapping::get_or_use(executed_matches, match_id, false);
        assert(!already_executed);
        Mapping::set(executed_matches, match_id, true);

        // Update volume statistics
        let current_volume: u128 = Mapping::get_or_use(market_volume, market_id, 0u128);
        Mapping::set(market_volume, market_id, current_volume + match_amount);

        // Update order status if fully filled
        if buy_fully_filled {
            Mapping::set(order_active, buy_order_id, false);
            let buy_count_key: field = BHP256::hash_to_field(
                CountKeyInput {
                    market_id: market_id,
                    side: 0u8,
                }
            );
            let buy_count: u64 = Mapping::get_or_use(order_counts, buy_count_key, 1u64);
            Mapping::set(order_counts, buy_count_key, buy_count - 1u64);
        }

        if sell_fully_filled {
            Mapping::set(order_active, sell_order_id, false);
            let sell_count_key: field = BHP256::hash_to_field(
                CountKeyInput {
                    market_id: market_id,
                    side: 1u8,
                }
            );
            let sell_count: u64 = Mapping::get_or_use(order_counts, sell_count_key, 1u64);
            Mapping::set(order_counts, sell_count_key, sell_count - 1u64);
        }
    }

    // =========================================================================
    // SETTLEMENT
    // =========================================================================

    // Settle a matched trade - atomic token swap
    async transition settle_trade(
        buyer_receipt: MatchReceipt,
        seller_receipt: MatchReceipt,
        buyer_quote_token: Token,
        seller_base_token: Token,
        base_asset: field,
        quote_asset: field,
        timestamp: u64
    ) -> (SettlementReceipt, SettlementReceipt, Token, Token, Token, Token, Future) {

        // Verify receipts match
        assert(buyer_receipt.match_id == seller_receipt.match_id);
        assert(buyer_receipt.is_buy == true);
        assert(seller_receipt.is_buy == false);
        assert(buyer_receipt.amount_filled == seller_receipt.amount_filled);
        assert(buyer_receipt.execution_price == seller_receipt.execution_price);

        // Verify tokens are correct assets
        assert(buyer_quote_token.asset_id == quote_asset);
        assert(seller_base_token.asset_id == base_asset);

        // Calculate amounts
        let base_amount: u128 = buyer_receipt.amount_filled;
        // quote_amount = base_amount * price / 1e8 (assuming 8 decimal scaling)
        let quote_amount: u128 = (base_amount * buyer_receipt.execution_price) / 100000000u128;

        // Verify sufficient balances
        assert(buyer_quote_token.amount >= quote_amount);
        assert(seller_base_token.amount >= base_amount);

        // =====================================================================
        // CREATE OUTPUT TOKENS (ATOMIC SWAP)
        // =====================================================================

        // Base asset goes to buyer
        let base_to_buyer: Token = Token {
            owner: buyer_receipt.owner,
            asset_id: base_asset,
            amount: base_amount,
        };

        // Quote asset goes to seller
        let quote_to_seller: Token = Token {
            owner: seller_receipt.owner,
            asset_id: quote_asset,
            amount: quote_amount,
        };

        // Change back to buyer (remaining quote tokens)
        let buyer_change: Token = Token {
            owner: buyer_receipt.owner,
            asset_id: quote_asset,
            amount: buyer_quote_token.amount - quote_amount,
        };

        // Change back to seller (remaining base tokens)
        let seller_change: Token = Token {
            owner: seller_receipt.owner,
            asset_id: base_asset,
            amount: seller_base_token.amount - base_amount,
        };

        // =====================================================================
        // CREATE SETTLEMENT RECEIPTS
        // =====================================================================

        let buyer_settlement: SettlementReceipt = SettlementReceipt {
            owner: buyer_receipt.owner,
            match_id: buyer_receipt.match_id,
            base_amount: base_amount,
            quote_amount: quote_amount,
            timestamp: timestamp,
        };

        let seller_settlement: SettlementReceipt = SettlementReceipt {
            owner: seller_receipt.owner,
            match_id: seller_receipt.match_id,
            base_amount: base_amount,
            quote_amount: quote_amount,
            timestamp: timestamp,
        };

        return (
            buyer_settlement,
            seller_settlement,
            base_to_buyer,
            quote_to_seller,
            buyer_change,
            seller_change,
            finalize_settle_trade(buyer_receipt.match_id)
        );
    }

    async function finalize_settle_trade(match_id: field) {
        // Verify match was executed
        let was_executed: bool = Mapping::get_or_use(executed_matches, match_id, false);
        assert(was_executed);

        // Prevent double settlement
        let already_settled: bool = Mapping::get_or_use(settled_matches, match_id, false);
        assert(!already_settled);
        Mapping::set(settled_matches, match_id, true);
    }

    // =========================================================================
    // HELPER STRUCTS FOR HASHING
    // =========================================================================

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

    // =========================================================================
    // VIEW FUNCTIONS (for querying public state)
    // =========================================================================

    // Check if an order is active (by ID)
    transition is_order_active(order_id: field) -> bool {
        // This would need async to actually read mapping
        // For now, return a placeholder
        return true;
    }

    // =========================================================================
    // CONSTRUCTOR
    // =========================================================================

    // Prevent upgrades for security
    @noupgrade
    async constructor() {}
}
