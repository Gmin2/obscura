/**
 * Test suite for Obscura Dark Pool
 */
import darkpool.aleo;

program test_darkpool.aleo {

    /** Test token minting */
    @test
    transition test_mint_token() {
        let receiver: address = aleo1ashyu96tjwe63u0gtnnv8z5lhapdu4l5pjsl2kha7fv7hvz2eqxs5dz0rg;
        let asset_id: field = 1field;
        let amount: u128 = 1000000u128;

        let token: darkpool.aleo/Token = darkpool.aleo/mint_token(receiver, asset_id, amount);

        assert_eq(token.asset_id, asset_id);
        assert_eq(token.amount, amount);
    }

    /** Test token creation with correct fields */
    @test
    transition test_token_creation() {
        let receiver: address = aleo1ashyu96tjwe63u0gtnnv8z5lhapdu4l5pjsl2kha7fv7hvz2eqxs5dz0rg;
        let asset_id: field = 1field;

        let token: darkpool.aleo/Token = darkpool.aleo/mint_token(receiver, asset_id, 1000u128);

        assert_eq(token.amount, 1000u128);
        assert_eq(token.asset_id, asset_id);
    }

    /** Test transfer fails with insufficient balance */
    @test
    @should_fail
    transition test_transfer_insufficient() {
        let sender: address = aleo1ashyu96tjwe63u0gtnnv8z5lhapdu4l5pjsl2kha7fv7hvz2eqxs5dz0rg;
        let receiver: address = aleo1rhgdu77hgyqd3xjj8ucu3jj9r2krwz6mnzyd80gncr5fxcwlh5rsvzp9px;
        let asset_id: field = 1field;

        let initial_token: darkpool.aleo/Token = darkpool.aleo/mint_token(sender, asset_id, 100u128);

        let (remaining, transferred): (darkpool.aleo/Token, darkpool.aleo/Token) =
            darkpool.aleo/transfer_token(initial_token, receiver, 200u128);
    }

    /** Test placing a buy order */
    @test
    script test_place_buy_order() {
        let side: u8 = 0u8;
        let base_asset: field = 1field;
        let quote_asset: field = 2field;
        let amount: u128 = 100u128;
        let price: u128 = 5000000000000u128;
        let salt: scalar = 123scalar;
        let timestamp: u64 = 1704067200u64;

        let (order, future): (darkpool.aleo/Order, Future) = darkpool.aleo/place_order(
            side, base_asset, quote_asset, amount, price, salt, timestamp
        );

        future.await();

        assert_eq(order.side, 0u8);
        assert_eq(order.base_asset, base_asset);
        assert_eq(order.quote_asset, quote_asset);
        assert_eq(order.amount, amount);
        assert_eq(order.price, price);
        assert_eq(order.filled, 0u128);
    }

    /** Test placing a sell order */
    @test
    script test_place_sell_order() {
        let side: u8 = 1u8;
        let base_asset: field = 1field;
        let quote_asset: field = 2field;
        let amount: u128 = 50u128;
        let price: u128 = 4900000000000u128;
        let salt: scalar = 456scalar;
        let timestamp: u64 = 1704067200u64;

        let (order, future): (darkpool.aleo/Order, Future) = darkpool.aleo/place_order(
            side, base_asset, quote_asset, amount, price, salt, timestamp
        );

        future.await();

        assert_eq(order.side, 1u8);
        assert_eq(order.amount, amount);
    }

    /** Test order placement fails with invalid side */
    @test
    @should_fail
    script test_place_order_invalid_side() {
        let (order, future): (darkpool.aleo/Order, Future) = darkpool.aleo/place_order(
            2u8, 1field, 2field, 100u128, 5000000000000u128, 123scalar, 1704067200u64
        );
        future.await();
    }

    /** Test order placement fails with zero amount */
    @test
    @should_fail
    script test_place_order_zero_amount() {
        let (order, future): (darkpool.aleo/Order, Future) = darkpool.aleo/place_order(
            0u8, 1field, 2field, 0u128, 5000000000000u128, 123scalar, 1704067200u64
        );
        future.await();
    }

    /** Test order cancellation */
    @test
    script test_cancel_order() {
        let (order, place_future): (darkpool.aleo/Order, Future) = darkpool.aleo/place_order(
            0u8, 1field, 2field, 100u128, 5000000000000u128, 123scalar, 1704067200u64
        );
        place_future.await();

        let cancel_future: Future = darkpool.aleo/cancel_order(order);
        cancel_future.await();
    }

    /** Test full order matching */
    @test
    script test_match_orders_full_fill() {
        let base_asset: field = 1field;
        let quote_asset: field = 2field;
        let timestamp: u64 = 1704067200u64;

        let (buy_order, buy_future): (darkpool.aleo/Order, Future) = darkpool.aleo/place_order(
            0u8, base_asset, quote_asset, 100u128, 5000000000000u128, 111scalar, timestamp
        );
        buy_future.await();

        let (sell_order, sell_future): (darkpool.aleo/Order, Future) = darkpool.aleo/place_order(
            1u8, base_asset, quote_asset, 100u128, 4900000000000u128, 222scalar, timestamp
        );
        sell_future.await();

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
            buy_order, sell_order, execution_price, match_amount, timestamp + 1u64
        );
        match_future.await();

        assert_eq(buyer_receipt.amount_filled, 100u128);
        assert_eq(buyer_receipt.execution_price, execution_price);
        assert_eq(buyer_receipt.is_buy, true);
        assert_eq(seller_receipt.amount_filled, 100u128);
        assert_eq(seller_receipt.is_buy, false);
        assert_eq(buyer_receipt.match_id, seller_receipt.match_id);
        assert_eq(updated_buy.filled, 100u128);
        assert_eq(updated_sell.filled, 100u128);
    }

    /** Test partial order matching */
    @test
    script test_match_orders_partial_fill() {
        let base_asset: field = 1field;
        let quote_asset: field = 2field;
        let timestamp: u64 = 1704067200u64;

        let (buy_order, buy_future): (darkpool.aleo/Order, Future) = darkpool.aleo/place_order(
            0u8, base_asset, quote_asset, 100u128, 5000000000000u128, 333scalar, timestamp
        );
        buy_future.await();

        let (sell_order, sell_future): (darkpool.aleo/Order, Future) = darkpool.aleo/place_order(
            1u8, base_asset, quote_asset, 100u128, 4900000000000u128, 444scalar, timestamp
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
            buy_order, sell_order, 4950000000000u128, 30u128, timestamp + 1u64
        );
        match_future.await();

        assert_eq(buyer_receipt.amount_filled, 30u128);
        assert_eq(updated_buy.filled, 30u128);
        assert_eq(updated_sell.filled, 30u128);
    }

    /** Test matching fails when both orders are same side */
    @test
    @should_fail
    script test_match_orders_wrong_sides() {
        let base_asset: field = 1field;
        let quote_asset: field = 2field;
        let timestamp: u64 = 1704067200u64;

        let (order1, future1): (darkpool.aleo/Order, Future) = darkpool.aleo/place_order(
            0u8, base_asset, quote_asset, 100u128, 5000000000000u128, 555scalar, timestamp
        );
        future1.await();

        let (order2, future2): (darkpool.aleo/Order, Future) = darkpool.aleo/place_order(
            0u8, base_asset, quote_asset, 100u128, 4900000000000u128, 666scalar, timestamp
        );
        future2.await();

        let (
            r1, r2, o1, o2, match_future
        ): (
            darkpool.aleo/MatchReceipt,
            darkpool.aleo/MatchReceipt,
            darkpool.aleo/Order,
            darkpool.aleo/Order,
            Future
        ) = darkpool.aleo/match_orders(
            order1, order2, 4950000000000u128, 100u128, timestamp + 1u64
        );
        match_future.await();
    }

    /** Test matching fails when prices don't overlap */
    @test
    @should_fail
    script test_match_bad_price() {
        let base_asset: field = 1field;
        let quote_asset: field = 2field;
        let timestamp: u64 = 1704067200u64;

        let (buy_order, buy_future): (darkpool.aleo/Order, Future) = darkpool.aleo/place_order(
            0u8, base_asset, quote_asset, 100u128, 4500000000000u128, 777scalar, timestamp
        );
        buy_future.await();

        let (sell_order, sell_future): (darkpool.aleo/Order, Future) = darkpool.aleo/place_order(
            1u8, base_asset, quote_asset, 100u128, 5000000000000u128, 888scalar, timestamp
        );
        sell_future.await();

        let (
            r1, r2, o1, o2, match_future
        ): (
            darkpool.aleo/MatchReceipt,
            darkpool.aleo/MatchReceipt,
            darkpool.aleo/Order,
            darkpool.aleo/Order,
            Future
        ) = darkpool.aleo/match_orders(
            buy_order, sell_order, 4750000000000u128, 100u128, timestamp + 1u64
        );
        match_future.await();
    }

    /** Test complete trade settlement flow */
    @test
    script test_settle_trade() {
        let base_asset: field = 1field;
        let quote_asset: field = 2field;
        let timestamp: u64 = 1704067200u64;

        let (buy_order, buy_future): (darkpool.aleo/Order, Future) = darkpool.aleo/place_order(
            0u8, base_asset, quote_asset, 100u128, 5000000000000u128, 999scalar, timestamp
        );
        buy_future.await();

        let (sell_order, sell_future): (darkpool.aleo/Order, Future) = darkpool.aleo/place_order(
            1u8, base_asset, quote_asset, 100u128, 4900000000000u128, 1000scalar, timestamp
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
            buy_order, sell_order, 4950000000000u128, 100u128, timestamp + 1u64
        );
        match_future.await();

        let buyer_quote: darkpool.aleo/Token = darkpool.aleo/mint_token(
            buyer_receipt.owner, quote_asset, 5000000000u128
        );

        let seller_base: darkpool.aleo/Token = darkpool.aleo/mint_token(
            seller_receipt.owner, base_asset, 100u128
        );

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

        assert_eq(buyer_settlement.base_amount, 100u128);
        assert_eq(base_to_buyer.amount, 100u128);
        assert_eq(base_to_buyer.asset_id, base_asset);
        assert_eq(quote_to_seller.asset_id, quote_asset);
    }

    @noupgrade
    async constructor() {}
}
