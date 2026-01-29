import darkpool.aleo;
program test_darkpool.aleo;

function test_mint_token:
    call darkpool.aleo/mint_token aleo1ashyu96tjwe63u0gtnnv8z5lhapdu4l5pjsl2kha7fv7hvz2eqxs5dz0rg 1field 1000000u128 into r0;
    assert.eq r0.asset_id 1field;
    assert.eq r0.amount 1000000u128;

function test_token_creation:
    call darkpool.aleo/mint_token aleo1ashyu96tjwe63u0gtnnv8z5lhapdu4l5pjsl2kha7fv7hvz2eqxs5dz0rg 1field 1000u128 into r0;
    assert.eq r0.amount 1000u128;
    assert.eq r0.asset_id 1field;

function test_transfer_insufficient:
    call darkpool.aleo/mint_token aleo1ashyu96tjwe63u0gtnnv8z5lhapdu4l5pjsl2kha7fv7hvz2eqxs5dz0rg 1field 100u128 into r0;
    call darkpool.aleo/transfer_token r0 aleo1rhgdu77hgyqd3xjj8ucu3jj9r2krwz6mnzyd80gncr5fxcwlh5rsvzp9px 200u128 into r1 r2;

constructor:
    assert.eq edition 0u16;
