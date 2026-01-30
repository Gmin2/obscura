/**
 * Aleo Type Definitions for Darkpool Program
 * Maps Leo types to TypeScript interfaces
 */

/** Price scale: 1e8 for 8 decimal places */
export const PRICE_SCALE = 100_000_000n;

/** Program ID on Aleo network */
export const PROGRAM_ID = 'obscuradarkpool.aleo';

/** Order side constants matching Leo */
export const OrderSide = {
  BUY: 0,
  SELL: 1,
} as const;

export type OrderSide = (typeof OrderSide)[keyof typeof OrderSide];

/** Base interface for all Aleo records */
export interface AleoRecord {
  owner: string;
  _nonce?: string;
}

/** Leo: record Token */
export interface TokenRecord extends AleoRecord {
  asset_id: string;
  amount: string;
}

/** Parsed token for display */
export interface Token {
  owner: string;
  assetId: string;
  amount: number;
  rawAmount: bigint;
}

/** Leo: record Order */
export interface OrderRecord extends AleoRecord {
  order_id: string;
  side: number;
  base_asset: string;
  quote_asset: string;
  amount: string;
  price: string;
  salt: string;
  filled: string;
  created_at: number;
}

/** Parsed order for display */
export interface Order {
  orderId: string;
  owner: string;
  side: OrderSide;
  baseAsset: string;
  quoteAsset: string;
  amount: number;
  price: number;
  filled: number;
  remaining: number;
  percentFilled: number;
  createdAt: Date;
  rawRecord?: OrderRecord;
}

/** Order book entry for display */
export interface OrderBookEntry {
  price: number;
  size: number;
  total: number;
  orderCount: number;
  side: 'buy' | 'sell';
  isDark?: boolean;
}

/** Leo: record MatchReceipt */
export interface MatchReceiptRecord extends AleoRecord {
  match_id: string;
  order_id: string;
  counterparty_order_id: string;
  amount_filled: string;
  execution_price: string;
  is_buy: boolean;
  timestamp: number;
}

/** Parsed match receipt for display */
export interface MatchReceipt {
  matchId: string;
  orderId: string;
  counterpartyOrderId: string;
  amountFilled: number;
  executionPrice: number;
  isBuy: boolean;
  timestamp: Date;
  rawRecord?: MatchReceiptRecord;
}

/** Leo: record SettlementReceipt */
export interface SettlementReceiptRecord extends AleoRecord {
  match_id: string;
  base_amount: string;
  quote_amount: string;
  timestamp: number;
}

/** Parsed settlement receipt for display */
export interface SettlementReceipt {
  matchId: string;
  baseAmount: number;
  quoteAmount: number;
  timestamp: Date;
  rawRecord?: SettlementReceiptRecord;
}

/** Input for placing an order */
export interface PlaceOrderInput {
  side: OrderSide;
  baseAsset: string;
  quoteAsset: string;
  amount: number;
  price: number;
  salt?: string;
  timestamp?: number;
}

/** Input for canceling an order */
export interface CancelOrderInput {
  orderRecord: OrderRecord;
}

/** Input for matching orders */
export interface MatchOrdersInput {
  buyOrder: OrderRecord;
  sellOrder: OrderRecord;
  executionPrice: number;
  matchAmount: number;
  timestamp?: number;
}

/** Input for settling a trade */
export interface SettleTradeInput {
  buyerReceipt: MatchReceiptRecord;
  sellerReceipt: MatchReceiptRecord;
  buyerQuoteToken: TokenRecord;
  sellerBaseToken: TokenRecord;
  baseAsset: string;
  quoteAsset: string;
  timestamp?: number;
}

/** Input for minting tokens */
export interface MintTokenInput {
  receiver: string;
  assetId: string;
  amount: number;
}

/** Input for transferring tokens */
export interface TransferTokenInput {
  token: TokenRecord;
  to: string;
  amount: number;
}

/** Result from place_order execution */
export interface PlaceOrderResult {
  order: OrderRecord;
  future: string;
}

/** Result from match_orders execution */
export interface MatchOrdersResult {
  buyerReceipt: MatchReceiptRecord;
  sellerReceipt: MatchReceiptRecord;
  updatedBuyOrder: OrderRecord;
  updatedSellOrder: OrderRecord;
  future: string;
}

/** Result from settle_trade execution */
export interface SettleTradeResult {
  buyerSettlement: SettlementReceiptRecord;
  sellerSettlement: SettlementReceiptRecord;
  buyerBaseToken: TokenRecord;
  sellerQuoteToken: TokenRecord;
  buyerQuoteChange: TokenRecord;
  sellerBaseChange: TokenRecord;
  future: string;
}

/** Market pair definition */
export interface Market {
  id: string;
  baseAsset: string;
  quoteAsset: string;
  baseSymbol: string;
  quoteSymbol: string;
  pricePrecision: number;
  amountPrecision: number;
}

/** Trade history entry */
export interface TradeEntry {
  id: string;
  matchId: string;
  price: number;
  amount: number;
  side: 'buy' | 'sell';
  timestamp: Date;
  isMine?: boolean;
}

/** User account state */
export interface AccountState {
  address: string;
  publicBalance: bigint;
  tokens: TokenRecord[];
  orders: OrderRecord[];
  matchReceipts: MatchReceiptRecord[];
  settlementReceipts: SettlementReceiptRecord[];
}

/** Wallet connection state */
export interface WalletState {
  connected: boolean;
  address: string | null;
  publicKey: string | null;
  loading: boolean;
  error: string | null;
}
