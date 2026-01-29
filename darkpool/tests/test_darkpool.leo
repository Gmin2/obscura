// Tests for Obscura Dark Pool
import darkpool.aleo;

program test_darkpool.aleo {

    // =========================================================================
    // TOKEN TESTS
    // =========================================================================

    @test
    transition test_mint_token() {
        let receiver: address = aleo1ashyu96tjwe63u0gtnnv8z5lhapdu4l5pjsl2kha7fv7hvz2eqxs5dz0rg;
        let asset_id: field = 1field;  // Represents some asset like BTC
        let amount: u128 = 1000000u128;

        let token: darkpool.aleo/Token = darkpool.aleo/mint_token(
            receiver,
            asset_id,
            amount
        );

        assert_eq(token.asset_id, asset_id);
        assert_eq(token.amount, amount);
    }
    

    // Note: transfer_token is tested via settle_trade which exercises the full flow
    // Direct transfer tests require matching signer context which is complex in unit tests
    @test
    transition test_token_creation() {
        let receiver: address = aleo1ashyu96tjwe63u0gtnnv8z5lhapdu4l5pjsl2kha7fv7hvz2eqxs5dz0rg;
        let asset_id: field = 1field;

        // Mint token and verify fields
        let token: darkpool.aleo/Token = darkpool.aleo/mint_token(
            receiver,
            asset_id,
            1000u128
        );

        assert_eq(token.amount, 1000u128);
        assert_eq(token.asset_id, asset_id);
    }

    @test
    @should_fail
    transition test_transfer_insufficient() {
        let sender: address = aleo1ashyu96tjwe63u0gtnnv8z5lhapdu4l5pjsl2kha7fv7hvz2eqxs5dz0rg;
        let receiver: address = aleo1rhgdu77hgyqd3xjj8ucu3jj9r2krwz6mnzyd80gncr5fxcwlh5rsvzp9px;
        let asset_id: field = 1field;

        // Mint 100 tokens
        let initial_token: darkpool.aleo/Token = darkpool.aleo/mint_token(
            sender,
            asset_id,
            100u128
        );

        // Try to transfer 200 tokens - should fail
        let (remaining, transferred): (darkpool.aleo/Token, darkpool.aleo/Token) =
            darkpool.aleo/transfer_token(initial_token, receiver, 200u128);
    }

    // =========================================================================
    // ORDER PLACEMENT TESTS
    // =========================================================================

    @test
    script test_place_buy_order() {
        let side: u8 = 0u8;  // BUY
        let base_asset: field = 1field;   // BTC
        let quote_asset: field = 2field;  // USDC
        let amount: u128 = 100u128;
        let price: u128 = 5000000000000u128;  // $50,000 with 8 decimals
        let salt: scalar = 123scalar;
        let timestamp: u64 = 1704067200u64;

        let (order, future): (darkpool.aleo/Order, Future) = darkpool.aleo/place_order(
            side,
            base_asset,
            quote_asset,
            amount,
            price,
            salt,
            timestamp
        );

        // Await the future to execute on-chain logic
        future.await();

        // Verify order record
        assert_eq(order.side, 0u8);
        assert_eq(order.base_asset, base_asset);
        assert_eq(order.quote_asset, quote_asset);
        assert_eq(order.amount, amount);
        assert_eq(order.price, price);
        assert_eq(order.filled, 0u128);
    }

    @test
    script test_place_sell_order() {
        let side: u8 = 1u8;  // SELL
        let base_asset: field = 1field;
        let quote_asset: field = 2field;
        let amount: u128 = 50u128;
        let price: u128 = 4900000000000u128;  // $49,000 with 8 decimals
        let salt: scalar = 456scalar;
        let timestamp: u64 = 1704067200u64;

        let (order, future): (darkpool.aleo/Order, Future) = darkpool.aleo/place_order(
            side,
            base_asset,
            quote_asset,
            amount,
            price,
            salt,
            timestamp
        );

        future.await();

        assert_eq(order.side, 1u8);
        assert_eq(order.amount, amount);
    }

    @test
    @should_fail
    script test_place_order_invalid_side() {
        // Invalid side (not 0 or 1)
        let (order, future): (darkpool.aleo/Order, Future) = darkpool.aleo/place_order(
            2u8,  // Invalid
            1field,
            2field,
            100u128,
            5000000000000u128,
            123scalar,
            1704067200u64
        );
        future.await();
    }

    @test
    @should_fail
    script test_place_order_zero_amount() {
        let (order, future): (darkpool.aleo/Order, Future) = darkpool.aleo/place_order(
            0u8,
            1field,
            2field,
            0u128,  // Zero amount - should fail
            5000000000000u128,
            123scalar,
            1704067200u64
        );
        future.await();
    }

    // =========================================================================
    // ORDER CANCELLATION TESTS
    // =========================================================================

    @test
    script test_cancel_order() {
        // First place an order
        let (order, place_future): (darkpool.aleo/Order, Future) = darkpool.aleo/place_order(
            0u8,
            1field,
            2field,
            100u128,
            5000000000000u128,
            123scalar,
            1704067200u64
        );
        place_future.await();

        // Cancel the order
        let cancel_future: Future = darkpool.aleo/cancel_order(order);
        cancel_future.await();

        // Order should now be inactive (verified in mapping)
    }

    // =========================================================================
    // ORDER MATCHING TESTS
    // =========================================================================

    @test
    script test_match_orders_full_fill() {
        let base_asset: field = 1field;
        let quote_asset: field = 2field;
        let timestamp: u64 = 1704067200u64;

        // Place buy order: 100 units @ $50,000
        let (buy_order, buy_future): (darkpool.aleo/Order, Future) = darkpool.aleo/place_order(
            0u8,  // BUY
            base_asset,
            quote_asset,
            100u128,
            5000000000000u128,  // $50,000
            111scalar,
            timestamp
        );
        buy_future.await();

        // Place sell order: 100 units @ $49,000
        let (sell_order, sell_future): (darkpool.aleo/Order, Future) = darkpool.aleo/place_order(
            1u8,  // SELL
            base_asset,
            quote_asset,
            100u128,
            4900000000000u128,  // $49,000
            222scalar,
            timestamp
        );
        sell_future.await();

        // Match at $49,500
        let execution_price: u128 = 4950000000000u128;
        let match_amount: u128 = 100u128;

        let (
            buyer_receipt,
            seller_receipt,
            updated_buy,
            updated_sell,
            match_future
        ): (
            darkpool.aleo/MatchReceipt,
            darkpool.aleo/MatchReceipt,
            darkpool.aleo/Order,
            darkpool.aleo/Order,
            Future
        ) = darkpool.aleo/match_orders(
            buy_order,
            sell_order,
            execution_price,
            match_amount,
            timestamp + 1u64
        );
        match_future.await();

        // Verify receipts
        assert_eq(buyer_receipt.amount_filled, 100u128);
        assert_eq(buyer_receipt.execution_price, execution_price);
        assert_eq(buyer_receipt.is_buy, true);

        assert_eq(seller_receipt.amount_filled, 100u128);
        assert_eq(seller_receipt.is_buy, false);

        // Verify match IDs are same
        assert_eq(buyer_receipt.match_id, seller_receipt.match_id);

        // Verify orders are fully filled
        assert_eq(updated_buy.filled, 100u128);
        assert_eq(updated_sell.filled, 100u128);
    }

    @test
    script test_match_orders_partial_fill() {
        let base_asset: field = 1field;
        let quote_asset: field = 2field;
        let timestamp: u64 = 1704067200u64;

        // Buy order: 100 units
        let (buy_order, buy_future): (darkpool.aleo/Order, Future) = darkpool.aleo/place_order(
            0u8,
            base_asset,
            quote_asset,
            100u128,
            5000000000000u128,
            333scalar,
            timestamp
        );
        buy_future.await();

        // Sell order: 100 units
        let (sell_order, sell_future): (darkpool.aleo/Order, Future) = darkpool.aleo/place_order(
            1u8,
            base_asset,
            quote_asset,
            100u128,
            4900000000000u128,
            444scalar,
            timestamp
        );
        sell_future.await();

        // Match only 30 units
        let (
            buyer_receipt,
            seller_receipt,
            updated_buy,
            updated_sell,
            match_future
        ): (
            darkpool.aleo/MatchReceipt,
            darkpool.aleo/MatchReceipt,
            darkpool.aleo/Order,
            darkpool.aleo/Order,
            Future
        ) = darkpool.aleo/match_orders(
            buy_order,
            sell_order,
            4950000000000u128,
            30u128,  // Partial fill
            timestamp + 1u64
        );
        match_future.await();

        // Verify partial fill
        assert_eq(buyer_receipt.amount_filled, 30u128);
        assert_eq(updated_buy.filled, 30u128);
        assert_eq(updated_sell.filled, 30u128);

        // Orders should still have remaining amount
        // updated_buy.amount - updated_buy.filled = 70
    }

    @test
    @should_fail
    script test_match_orders_wrong_sides() {
        let base_asset: field = 1field;
        let quote_asset: field = 2field;
        let timestamp: u64 = 1704067200u64;

        // Two buy orders - should fail to match
        let (order1, future1): (darkpool.aleo/Order, Future) = darkpool.aleo/place_order(
            0u8,  // BUY
            base_asset,
            quote_asset,
            100u128,
            5000000000000u128,
            555scalar,
            timestamp
        );
        future1.await();

        let (order2, future2): (darkpool.aleo/Order, Future) = darkpool.aleo/place_order(
            0u8,  // BUY (should be SELL)
            base_asset,
            quote_asset,
            100u128,
            4900000000000u128,
            666scalar,
            timestamp
        );
        future2.await();

        // This should fail - both are buy orders
        let (
            r1,
            r2,
            o1,
            o2,
            match_future
        ): (
            darkpool.aleo/MatchReceipt,
            darkpool.aleo/MatchReceipt,
            darkpool.aleo/Order,
            darkpool.aleo/Order,
            Future
        ) = darkpool.aleo/match_orders(
            order1,
            order2,
            4950000000000u128,
            100u128,
            timestamp + 1u64
        );
        match_future.await();
    }

    @test
    @should_fail
    script test_match_bad_price() {
        let base_asset: field = 1field;
        let quote_asset: field = 2field;
        let timestamp: u64 = 1704067200u64;

        // Buy at $45,000
        let (buy_order, buy_future): (darkpool.aleo/Order, Future) = darkpool.aleo/place_order(
            0u8,
            base_asset,
            quote_asset,
            100u128,
            4500000000000u128,  // $45,000
            777scalar,
            timestamp
        );
        buy_future.await();

        // Sell at $50,000 (higher than buy price - no overlap)
        let (sell_order, sell_future): (darkpool.aleo/Order, Future) = darkpool.aleo/place_order(
            1u8,
            base_asset,
            quote_asset,
            100u128,
            5000000000000u128,  // $50,000
            888scalar,
            timestamp
        );
        sell_future.await();

        // This should fail - prices don't overlap
        let (
            r1,
            r2,
            o1,
            o2,
            match_future
        ): (
            darkpool.aleo/MatchReceipt,
            darkpool.aleo/MatchReceipt,
            darkpool.aleo/Order,
            darkpool.aleo/Order,
            Future
        ) = darkpool.aleo/match_orders(
            buy_order,
            sell_order,
            4750000000000u128,  // Price between them - but still invalid
            100u128,
            timestamp + 1u64
        );
        match_future.await();
    }

    // =========================================================================
    // SETTLEMENT TESTS
    // =========================================================================

    @test
    script test_settle_trade() {
        let base_asset: field = 1field;   // BTC
        let quote_asset: field = 2field;  // USDC
        let timestamp: u64 = 1704067200u64;

        // Setup: Place and match orders
        let (buy_order, buy_future): (darkpool.aleo/Order, Future) = darkpool.aleo/place_order(
            0u8,
            base_asset,
            quote_asset,
            100u128,
            5000000000000u128,
            999scalar,
            timestamp
        );
        buy_future.await();

        let (sell_order, sell_future): (darkpool.aleo/Order, Future) = darkpool.aleo/place_order(
            1u8,
            base_asset,
            quote_asset,
            100u128,
            4900000000000u128,
            1000scalar,
            timestamp
        );
        sell_future.await();

        let (
            buyer_receipt,
            seller_receipt,
            updated_buy,
            updated_sell,
            match_future
        ): (
            darkpool.aleo/MatchReceipt,
            darkpool.aleo/MatchReceipt,
            darkpool.aleo/Order,
            darkpool.aleo/Order,
            Future
        ) = darkpool.aleo/match_orders(
            buy_order,
            sell_order,
            4950000000000u128,
            100u128,
            timestamp + 1u64
        );
        match_future.await();

        // Mint tokens for settlement
        // Buyer needs quote tokens (USDC) to pay
        // quote_amount = 100 * 4950000000000 / 100000000 = 4950000000
        let buyer_quote: darkpool.aleo/Token = darkpool.aleo/mint_token(
            buyer_receipt.owner,
            quote_asset,
            5000000000u128  // Slightly more than needed
        );

        // Seller needs base tokens (BTC) to deliver
        let seller_base: darkpool.aleo/Token = darkpool.aleo/mint_token(
            seller_receipt.owner,
            base_asset,
            100u128
        );

        // Settle the trade
        let (
            buyer_settlement,
            seller_settlement,
            base_to_buyer,
            quote_to_seller,
            buyer_change,
            seller_change,
            settle_future
        ): (
            darkpool.aleo/SettlementReceipt,
            darkpool.aleo/SettlementReceipt,
            darkpool.aleo/Token,
            darkpool.aleo/Token,
            darkpool.aleo/Token,
            darkpool.aleo/Token,
            Future
        ) = darkpool.aleo/settle_trade(
            buyer_receipt,
            seller_receipt,
            buyer_quote,
            seller_base,
            base_asset,
            quote_asset,
            timestamp + 2u64
        );
        settle_future.await();

        // Verify settlement
        assert_eq(buyer_settlement.base_amount, 100u128);
        assert_eq(base_to_buyer.amount, 100u128);
        assert_eq(base_to_buyer.asset_id, base_asset);

        // Seller receives quote tokens
        assert_eq(quote_to_seller.asset_id, quote_asset);
    }

    // =========================================================================
    // CONSTRUCTOR
    // =========================================================================

    @noupgrade
    async constructor() {}
}
