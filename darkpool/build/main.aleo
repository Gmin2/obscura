program obscuradarkpool.aleo;

record Token:
    owner as address.private;
    asset_id as field.private;
    amount as u128.private;

record Order:
    owner as address.private;
    order_id as field.private;
    side as u8.private;
    base_asset as field.private;
    quote_asset as field.private;
    amount as u128.private;
    price as u128.private;
    salt as scalar.private;
    filled as u128.private;
    created_at as u64.private;

record MatchReceipt:
    owner as address.private;
    match_id as field.private;
    order_id as field.private;
    counterparty_order_id as field.private;
    amount_filled as u128.private;
    execution_price as u128.private;
    is_buy as boolean.private;
    timestamp as u64.private;

record SettlementReceipt:
    owner as address.private;
    match_id as field.private;
    base_amount as u128.private;
    quote_amount as u128.private;
    timestamp as u64.private;

struct OrderIdInput:
    placer as address;
    base_asset as field;
    quote_asset as field;
    amount as u128;
    price as u128;
    salt as scalar;
    timestamp as u64;

struct CommitmentInput:
    price as u128;
    amount as u128;

struct MarketInput:
    base_asset as field;
    quote_asset as field;

struct MatchIdInput:
    buy_order_id as field;
    sell_order_id as field;
    match_amount as u128;
    timestamp as u64;

struct CountKeyInput:
    market_id as field;
    side as u8;

mapping order_commitments:
    key as field.public;
    value as field.public;

mapping order_owners:
    key as field.public;
    value as field.public;

mapping order_sides:
    key as field.public;
    value as u8.public;

mapping order_markets:
    key as field.public;
    value as field.public;

mapping order_active:
    key as field.public;
    value as boolean.public;

mapping executed_matches:
    key as field.public;
    value as boolean.public;

mapping settled_matches:
    key as field.public;
    value as boolean.public;

mapping market_volume:
    key as field.public;
    value as u128.public;

mapping order_counts:
    key as field.public;
    value as u64.public;

function mint_token:
    input r0 as address.private;
    input r1 as field.private;
    input r2 as u128.private;
    cast r0 r1 r2 into r3 as Token.record;
    output r3 as Token.record;

function transfer_token:
    input r0 as Token.record;
    input r1 as address.private;
    input r2 as u128.private;
    sub r0.amount r2 into r3;
    cast r0.owner r0.asset_id r3 into r4 as Token.record;
    cast r1 r0.asset_id r2 into r5 as Token.record;
    output r4 as Token.record;
    output r5 as Token.record;

function split_token:
    input r0 as Token.record;
    input r1 as u128.private;
    cast r0.owner r0.asset_id r1 into r2 as Token.record;
    sub r0.amount r1 into r3;
    cast r0.owner r0.asset_id r3 into r4 as Token.record;
    output r2 as Token.record;
    output r4 as Token.record;

function combine_tokens:
    input r0 as Token.record;
    input r1 as Token.record;
    assert.eq r0.asset_id r1.asset_id;
    assert.eq r0.owner r1.owner;
    add r0.amount r1.amount into r2;
    cast r0.owner r0.asset_id r2 into r3 as Token.record;
    output r3 as Token.record;

function place_order:
    input r0 as u8.private;
    input r1 as field.private;
    input r2 as field.private;
    input r3 as u128.private;
    input r4 as u128.private;
    input r5 as scalar.private;
    input r6 as u64.private;
    is.eq r0 0u8 into r7;
    is.eq r0 1u8 into r8;
    or r7 r8 into r9;
    assert.eq r9 true;
    gt r3 0u128 into r10;
    assert.eq r10 true;
    gt r4 0u128 into r11;
    assert.eq r11 true;
    cast self.signer r1 r2 r3 r4 r5 r6 into r12 as OrderIdInput;
    hash.bhp256 r12 into r13 as field;
    cast r4 r3 into r14 as CommitmentInput;
    commit.bhp256 r14 r5 into r15 as field;
    hash.bhp256 self.signer into r16 as field;
    cast r1 r2 into r17 as MarketInput;
    hash.bhp256 r17 into r18 as field;
    cast self.signer r13 r0 r1 r2 r3 r4 r5 0u128 r6 into r19 as Order.record;
    async place_order r13 r15 r16 r0 r18 into r20;
    output r19 as Order.record;
    output r20 as obscuradarkpool.aleo/place_order.future;

finalize place_order:
    input r0 as field.public;
    input r1 as field.public;
    input r2 as field.public;
    input r3 as u8.public;
    input r4 as field.public;
    get.or_use order_active[r0] false into r5;
    not r5 into r6;
    assert.eq r6 true;
    set r1 into order_commitments[r0];
    set r2 into order_owners[r0];
    set r3 into order_sides[r0];
    set r4 into order_markets[r0];
    set true into order_active[r0];
    cast r4 r3 into r7 as CountKeyInput;
    hash.bhp256 r7 into r8 as field;
    get.or_use order_counts[r8] 0u64 into r9;
    add r9 1u64 into r10;
    set r10 into order_counts[r8];

function cancel_order:
    input r0 as Order.record;
    lt r0.filled r0.amount into r1;
    assert.eq r1 true;
    cast r0.base_asset r0.quote_asset into r2 as MarketInput;
    hash.bhp256 r2 into r3 as field;
    async cancel_order r0.order_id r0.side r3 into r4;
    output r4 as obscuradarkpool.aleo/cancel_order.future;

finalize cancel_order:
    input r0 as field.public;
    input r1 as u8.public;
    input r2 as field.public;
    get.or_use order_active[r0] false into r3;
    assert.eq r3 true;
    set false into order_active[r0];
    cast r2 r1 into r4 as CountKeyInput;
    hash.bhp256 r4 into r5 as field;
    get.or_use order_counts[r5] 1u64 into r6;
    sub r6 1u64 into r7;
    set r7 into order_counts[r5];

function match_orders:
    input r0 as Order.record;
    input r1 as Order.record;
    input r2 as u128.private;
    input r3 as u128.private;
    input r4 as u64.private;
    is.eq r0.side 0u8 into r5;
    is.eq r1.side 1u8 into r6;
    and r5 r6 into r7;
    assert.eq r7 true;
    is.eq r0.base_asset r1.base_asset into r8;
    assert.eq r8 true;
    is.eq r0.quote_asset r1.quote_asset into r9;
    assert.eq r9 true;
    gte r0.price r2 into r10;
    gte r2 r1.price into r11;
    and r10 r11 into r12;
    assert.eq r12 true;
    sub r0.amount r0.filled into r13;
    sub r1.amount r1.filled into r14;
    lte r3 r13 into r15;
    lte r3 r14 into r16;
    and r15 r16 into r17;
    gt r3 0u128 into r18;
    and r17 r18 into r19;
    assert.eq r19 true;
    cast r0.order_id r1.order_id r3 r4 into r20 as MatchIdInput;
    hash.bhp256 r20 into r21 as field;
    cast r0.owner r21 r0.order_id r1.order_id r3 r2 true r4 into r22 as MatchReceipt.record;
    cast r1.owner r21 r1.order_id r0.order_id r3 r2 false r4 into r23 as MatchReceipt.record;
    add r0.filled r3 into r24;
    add r1.filled r3 into r25;
    cast r0.owner r0.order_id 0u8 r0.base_asset r0.quote_asset r0.amount r0.price r0.salt r24 r0.created_at into r26 as Order.record;
    cast r1.owner r1.order_id 1u8 r1.base_asset r1.quote_asset r1.amount r1.price r1.salt r25 r1.created_at into r27 as Order.record;
    cast r0.base_asset r0.quote_asset into r28 as MarketInput;
    hash.bhp256 r28 into r29 as field;
    gte r24 r0.amount into r30;
    gte r25 r1.amount into r31;
    async match_orders r21 r0.order_id r1.order_id r3 r29 r30 r31 into r32;
    output r22 as MatchReceipt.record;
    output r23 as MatchReceipt.record;
    output r26 as Order.record;
    output r27 as Order.record;
    output r32 as obscuradarkpool.aleo/match_orders.future;

finalize match_orders:
    input r0 as field.public;
    input r1 as field.public;
    input r2 as field.public;
    input r3 as u128.public;
    input r4 as field.public;
    input r5 as boolean.public;
    input r6 as boolean.public;
    get.or_use order_active[r1] false into r7;
    assert.eq r7 true;
    get.or_use order_active[r2] false into r8;
    assert.eq r8 true;
    get.or_use executed_matches[r0] false into r9;
    not r9 into r10;
    assert.eq r10 true;
    set true into executed_matches[r0];
    get.or_use market_volume[r4] 0u128 into r11;
    add r11 r3 into r12;
    set r12 into market_volume[r4];
    branch.eq r5 false to end_then_0_0;
    set false into order_active[r1];
    cast r4 0u8 into r13 as CountKeyInput;
    hash.bhp256 r13 into r14 as field;
    get.or_use order_counts[r14] 1u64 into r15;
    sub r15 1u64 into r16;
    set r16 into order_counts[r14];
    branch.eq true true to end_otherwise_0_1;
    position end_then_0_0;
    position end_otherwise_0_1;
    branch.eq r6 false to end_then_0_2;
    set false into order_active[r2];
    cast r4 1u8 into r17 as CountKeyInput;
    hash.bhp256 r17 into r18 as field;
    get.or_use order_counts[r18] 1u64 into r19;
    sub r19 1u64 into r20;
    set r20 into order_counts[r18];
    branch.eq true true to end_otherwise_0_3;
    position end_then_0_2;
    position end_otherwise_0_3;

function settle_trade:
    input r0 as MatchReceipt.record;
    input r1 as MatchReceipt.record;
    input r2 as Token.record;
    input r3 as Token.record;
    input r4 as field.private;
    input r5 as field.private;
    input r6 as u64.private;
    is.eq r0.match_id r1.match_id into r7;
    assert.eq r7 true;
    not r1.is_buy into r8;
    and r0.is_buy r8 into r9;
    assert.eq r9 true;
    is.eq r0.amount_filled r1.amount_filled into r10;
    assert.eq r10 true;
    is.eq r2.asset_id r5 into r11;
    assert.eq r11 true;
    is.eq r3.asset_id r4 into r12;
    assert.eq r12 true;
    mul r0.amount_filled r0.execution_price into r13;
    div r13 100000000u128 into r14;
    gte r2.amount r14 into r15;
    assert.eq r15 true;
    gte r3.amount r0.amount_filled into r16;
    assert.eq r16 true;
    cast r0.owner r0.match_id r0.amount_filled r14 r6 into r17 as SettlementReceipt.record;
    cast r1.owner r1.match_id r0.amount_filled r14 r6 into r18 as SettlementReceipt.record;
    cast r0.owner r4 r0.amount_filled into r19 as Token.record;
    cast r1.owner r5 r14 into r20 as Token.record;
    sub r2.amount r14 into r21;
    cast r0.owner r5 r21 into r22 as Token.record;
    sub r3.amount r0.amount_filled into r23;
    cast r1.owner r4 r23 into r24 as Token.record;
    async settle_trade r0.match_id into r25;
    output r17 as SettlementReceipt.record;
    output r18 as SettlementReceipt.record;
    output r19 as Token.record;
    output r20 as Token.record;
    output r22 as Token.record;
    output r24 as Token.record;
    output r25 as obscuradarkpool.aleo/settle_trade.future;

finalize settle_trade:
    input r0 as field.public;
    get.or_use executed_matches[r0] false into r1;
    assert.eq r1 true;
    get.or_use settled_matches[r0] false into r2;
    not r2 into r3;
    assert.eq r3 true;
    set true into settled_matches[r0];

constructor:
    assert.eq edition 0u16;
