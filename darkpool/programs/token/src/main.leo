/**
 * Obscura Token Module
 * Handles private token records for trading assets.
 */
program obscura_token.aleo {

    /** Private token record */
    record Token {
        owner: address,
        asset_id: field,
        amount: u128,
    }

    /** Public balance mapping for hybrid privacy */
    mapping public_balances: field => u128;

    /** Mint new private tokens */
    transition mint(receiver: address, asset_id: field, amount: u128) -> Token {
        return Token { owner: receiver, asset_id, amount };
    }

    /** Transfer tokens privately */
    transition transfer(token: Token, to: address, amount: u128) -> (Token, Token) {
        let remaining: Token = Token {
            owner: token.owner,
            asset_id: token.asset_id,
            amount: token.amount - amount,
        };

        let transferred: Token = Token {
            owner: to,
            asset_id: token.asset_id,
            amount,
        };

        return (remaining, transferred);
    }

    /** Split a token into two parts */
    transition split(token: Token, amount: u128) -> (Token, Token) {
        let first: Token = Token {
            owner: token.owner,
            asset_id: token.asset_id,
            amount,
        };

        let second: Token = Token {
            owner: token.owner,
            asset_id: token.asset_id,
            amount: token.amount - amount,
        };

        return (first, second);
    }

    /** Combine two tokens of same asset */
    transition combine(first: Token, second: Token) -> Token {
        assert_eq(first.asset_id, second.asset_id);
        assert_eq(first.owner, second.owner);

        return Token {
            owner: first.owner,
            asset_id: first.asset_id,
            amount: first.amount + second.amount,
        };
    }

    /** Deposit private tokens to public balance */
    async transition deposit_public(token: Token) -> Future {
        let key: field = BHP256::hash_to_field(BalanceKey {
            owner: token.owner,
            asset_id: token.asset_id,
        });
        return finalize_deposit(key, token.amount);
    }

    async function finalize_deposit(key: field, amount: u128) {
        let current: u128 = Mapping::get_or_use(public_balances, key, 0u128);
        Mapping::set(public_balances, key, current + amount);
    }

    /** Withdraw from public balance to private token */
    async transition withdraw_private(
        asset_id: field,
        amount: u128
    ) -> (Token, Future) {
        let token: Token = Token {
            owner: self.signer,
            asset_id,
            amount,
        };

        let key: field = BHP256::hash_to_field(BalanceKey {
            owner: self.signer,
            asset_id,
        });

        return (token, finalize_withdraw(key, amount));
    }

    async function finalize_withdraw(key: field, amount: u128) {
        let current: u128 = Mapping::get_or_use(public_balances, key, 0u128);
        assert(current >= amount);
        Mapping::set(public_balances, key, current - amount);
    }

    /** Balance key for mapping lookups */
    struct BalanceKey {
        owner: address,
        asset_id: field,
    }

    @noupgrade
    async constructor() {}
}
