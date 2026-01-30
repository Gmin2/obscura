/**
 * Aleo Utilities for Darkpool
 * Input formatting, record parsing, and type conversions
 */

import {
  PRICE_SCALE,
  OrderSide,
  type TokenRecord,
  type OrderRecord,
  type MatchReceiptRecord,
  type SettlementReceiptRecord,
  type Token,
  type Order,
  type MatchReceipt,
  type SettlementReceipt,
  type PlaceOrderInput,
  type MatchOrdersInput,
  type SettleTradeInput,
  type MintTokenInput,
  type TransferTokenInput,
} from './types.ts';

/** Scaling functions */

export function toScaled(value: number): bigint {
  return BigInt(Math.floor(value * Number(PRICE_SCALE)));
}

export function fromScaled(value: string | bigint): number {
  const raw = typeof value === 'string' ? BigInt(value.replace(/u128$/, '')) : value;
  return Number(raw) / Number(PRICE_SCALE);
}

/** Input formatters - convert TypeScript values to Leo input strings */

export const format = {
  u8: (v: number) => `${v}u8`,
  u16: (v: number) => `${v}u16`,
  u32: (v: number) => `${v}u32`,
  u64: (v: number | bigint) => `${v}u64`,
  u128: (v: bigint | number | string) => `${v}u128`,
  i8: (v: number) => `${v}i8`,
  i16: (v: number) => `${v}i16`,
  i32: (v: number) => `${v}i32`,
  i64: (v: number | bigint) => `${v}i64`,
  i128: (v: bigint | number | string) => `${v}i128`,
  field: (v: string | number) => `${v}field`,
  scalar: (v: string | number) => `${v}scalar`,
  group: (v: string) => v,
  address: (v: string) => v,
  bool: (v: boolean) => v.toString(),
};

/** Generate a random salt for commitments */
export function generateSalt(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  const hex = Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
  return BigInt('0x' + hex).toString();
}

/** Format a record for use as transition input */
export function formatRecord<T extends object>(record: T): string {
  const entries = Object.entries(record)
    .filter(([key]) => !key.startsWith('_'))
    .map(([key, value]) => `${key}: ${value}`)
    .join(', ');
  return `{ ${entries} }`;
}

/** Format place_order inputs */
export function formatPlaceOrderInputs(input: PlaceOrderInput): string[] {
  const salt = input.salt ?? generateSalt();
  const timestamp = input.timestamp ?? Date.now();

  return [
    format.u8(input.side),
    format.field(input.baseAsset),
    format.field(input.quoteAsset),
    format.u128(toScaled(input.amount)),
    format.u128(toScaled(input.price)),
    format.scalar(salt),
    format.u64(timestamp),
  ];
}

/** Format cancel_order inputs */
export function formatCancelOrderInputs(order: OrderRecord): string[] {
  return [formatRecord(order)];
}

/** Format match_orders inputs */
export function formatMatchOrdersInputs(input: MatchOrdersInput): string[] {
  const timestamp = input.timestamp ?? Date.now();

  return [
    formatRecord(input.buyOrder),
    formatRecord(input.sellOrder),
    format.u128(toScaled(input.executionPrice)),
    format.u128(toScaled(input.matchAmount)),
    format.u64(timestamp),
  ];
}

/** Format settle_trade inputs */
export function formatSettleTradeInputs(input: SettleTradeInput): string[] {
  const timestamp = input.timestamp ?? Date.now();

  return [
    formatRecord(input.buyerReceipt),
    formatRecord(input.sellerReceipt),
    formatRecord(input.buyerQuoteToken),
    formatRecord(input.sellerBaseToken),
    format.field(input.baseAsset),
    format.field(input.quoteAsset),
    format.u64(timestamp),
  ];
}

/** Format mint_token inputs */
export function formatMintTokenInputs(input: MintTokenInput): string[] {
  return [
    format.address(input.receiver),
    format.field(input.assetId),
    format.u128(toScaled(input.amount)),
  ];
}

/** Format transfer_token inputs */
export function formatTransferTokenInputs(input: TransferTokenInput): string[] {
  return [
    formatRecord(input.token),
    format.address(input.to),
    format.u128(toScaled(input.amount)),
  ];
}

/** Record parsing - convert Aleo output strings to TypeScript objects */

/** Extract value from record field, removing visibility suffix */
function extractValue(value: string): string {
  return value.replace(/\.(private|public)$/, '').trim();
}

/** Parse a raw record string into key-value pairs */
function parseRawRecord(recordString: string): Record<string, string> {
  const result: Record<string, string> = {};

  const content = recordString.trim().slice(1, -1).trim();
  const pairs = content.split(',');

  for (const pair of pairs) {
    const colonIndex = pair.indexOf(':');
    if (colonIndex === -1) continue;

    const key = pair.slice(0, colonIndex).trim();
    const value = extractValue(pair.slice(colonIndex + 1).trim());
    result[key] = value;
  }

  return result;
}

/** Parse a Token record */
export function parseTokenRecord(recordString: string): TokenRecord {
  const raw = parseRawRecord(recordString);
  return {
    owner: raw.owner,
    asset_id: raw.asset_id,
    amount: raw.amount,
    _nonce: raw._nonce,
  };
}

/** Parse an Order record */
export function parseOrderRecord(recordString: string): OrderRecord {
  const raw = parseRawRecord(recordString);
  return {
    owner: raw.owner,
    order_id: raw.order_id,
    side: parseInt(raw.side),
    base_asset: raw.base_asset,
    quote_asset: raw.quote_asset,
    amount: raw.amount,
    price: raw.price,
    salt: raw.salt,
    filled: raw.filled,
    created_at: parseInt(raw.created_at),
    _nonce: raw._nonce,
  };
}

/** Parse a MatchReceipt record */
export function parseMatchReceiptRecord(recordString: string): MatchReceiptRecord {
  const raw = parseRawRecord(recordString);
  return {
    owner: raw.owner,
    match_id: raw.match_id,
    order_id: raw.order_id,
    counterparty_order_id: raw.counterparty_order_id,
    amount_filled: raw.amount_filled,
    execution_price: raw.execution_price,
    is_buy: raw.is_buy === 'true',
    timestamp: parseInt(raw.timestamp),
    _nonce: raw._nonce,
  };
}

/** Parse a SettlementReceipt record */
export function parseSettlementReceiptRecord(recordString: string): SettlementReceiptRecord {
  const raw = parseRawRecord(recordString);
  return {
    owner: raw.owner,
    match_id: raw.match_id,
    base_amount: raw.base_amount,
    quote_amount: raw.quote_amount,
    timestamp: parseInt(raw.timestamp),
    _nonce: raw._nonce,
  };
}

/** Convert parsed records to display-friendly objects */

export function tokenToDisplay(record: TokenRecord): Token {
  const rawAmount = BigInt(record.amount.replace(/u128$/, ''));
  return {
    owner: record.owner,
    assetId: record.asset_id,
    amount: fromScaled(rawAmount),
    rawAmount,
  };
}

export function orderToDisplay(record: OrderRecord): Order {
  const amount = fromScaled(record.amount);
  const filled = fromScaled(record.filled);
  const remaining = amount - filled;

  return {
    orderId: record.order_id,
    owner: record.owner,
    side: record.side as OrderSide,
    baseAsset: record.base_asset,
    quoteAsset: record.quote_asset,
    amount,
    price: fromScaled(record.price),
    filled,
    remaining,
    percentFilled: amount > 0 ? (filled / amount) * 100 : 0,
    createdAt: new Date(record.created_at),
    rawRecord: record,
  };
}

export function matchReceiptToDisplay(record: MatchReceiptRecord): MatchReceipt {
  return {
    matchId: record.match_id,
    orderId: record.order_id,
    counterpartyOrderId: record.counterparty_order_id,
    amountFilled: fromScaled(record.amount_filled),
    executionPrice: fromScaled(record.execution_price),
    isBuy: record.is_buy,
    timestamp: new Date(record.timestamp),
    rawRecord: record,
  };
}

export function settlementReceiptToDisplay(record: SettlementReceiptRecord): SettlementReceipt {
  return {
    matchId: record.match_id,
    baseAmount: fromScaled(record.base_amount),
    quoteAmount: fromScaled(record.quote_amount),
    timestamp: new Date(record.timestamp),
    rawRecord: record,
  };
}

/** Display formatting helpers */

export function formatAmount(value: number, decimals: number = 4): string {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: decimals,
  });
}

export function formatPrice(value: number, decimals: number = 2): string {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatUSD(value: number): string {
  return `$${formatPrice(value)}`;
}

export function formatAddress(address: string, chars: number = 6): string {
  if (address.length <= chars * 2 + 3) return address;
  return `${address.slice(0, chars + 5)}...${address.slice(-chars)}`;
}

export function formatOrderSide(side: OrderSide): 'Buy' | 'Sell' {
  return side === OrderSide.BUY ? 'Buy' : 'Sell';
}

export function formatTimestamp(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}
