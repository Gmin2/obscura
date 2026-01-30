/**
 * Darkpool Service
 * High-level API for interacting with the darkpool program
 */

import { getAleoWorker } from '../workers/AleoWorker.ts';
import {
  PROGRAM_ID,
  OrderSide,
  type PlaceOrderInput,
  type SettleTradeInput,
  type OrderRecord,
  type TokenRecord,
  type MatchReceiptRecord,
  type SettlementReceiptRecord,
  type Order,
  type OrderBookEntry,
  type TradeEntry,
} from './types.ts';
import {
  formatPlaceOrderInputs,
  formatCancelOrderInputs,
  formatMatchOrdersInputs,
  formatSettleTradeInputs,
  formatMintTokenInputs,
  formatRecord,
  format,
  parseOrderRecord,
  parseTokenRecord,
  parseMatchReceiptRecord,
  parseSettlementReceiptRecord,
  orderToDisplay,
  tokenToDisplay,
  matchReceiptToDisplay,
  settlementReceiptToDisplay,
  generateSalt,
  toScaled,
  fromScaled,
} from './utils.ts';

/** Asset IDs matching USER_FLOW.md */
export const ASSETS = {
  USDC: { id: '1', symbol: 'USDC', name: 'USD Coin', isQuote: true },
  BTC: { id: '2', symbol: 'BTC', name: 'Bitcoin', isQuote: false },
  ETH: { id: '3', symbol: 'ETH', name: 'Ethereum', isQuote: false },
  ALEO: { id: '4', symbol: 'ALEO', name: 'Aleo', isQuote: false },
} as const;

/** Default asset IDs for the trading pair */
export const DEFAULT_BASE_ASSET = ASSETS.ETH.id; // ETH
export const DEFAULT_QUOTE_ASSET = ASSETS.USDC.id; // USDC

/** Asset symbols mapping */
export const ASSET_SYMBOLS: Record<string, string> = {
  [ASSETS.USDC.id]: ASSETS.USDC.symbol,
  [ASSETS.BTC.id]: ASSETS.BTC.symbol,
  [ASSETS.ETH.id]: ASSETS.ETH.symbol,
  [ASSETS.ALEO.id]: ASSETS.ALEO.symbol,
};

/** Get list of tradeable base assets (non-quote) */
export const TRADEABLE_ASSETS = Object.values(ASSETS).filter(a => !a.isQuote);

/** Get the darkpool service instance */
export function getDarkpoolService() {
  const worker = getAleoWorker();

  return {
    /** Place a new order */
    async placeOrder(
      input: PlaceOrderInput,
      privateKey: string,
      programSource: string,
      useNetwork: boolean = false
    ): Promise<{ order: OrderRecord; txId?: string }> {
      const inputs = formatPlaceOrderInputs(input);

      if (useNetwork) {
        const txId = await worker.executeProgram(
          PROGRAM_ID,
          'place_order',
          inputs,
          privateKey
        );
        return { order: {} as OrderRecord, txId };
      }

      const outputs = await worker.localProgramExecution(
        programSource,
        'place_order',
        inputs
      );

      return {
        order: parseOrderRecord(outputs[0]),
      };
    },

    /** Cancel an existing order */
    async cancelOrder(
      order: OrderRecord,
      privateKey: string,
      programSource: string,
      useNetwork: boolean = false
    ): Promise<{ txId?: string }> {
      const inputs = formatCancelOrderInputs(order);

      if (useNetwork) {
        const txId = await worker.executeProgram(
          PROGRAM_ID,
          'cancel_order',
          inputs,
          privateKey
        );
        return { txId };
      }

      await worker.localProgramExecution(
        programSource,
        'cancel_order',
        inputs
      );

      return {};
    },

    /** Match two orders */
    async matchOrders(
      buyOrder: OrderRecord,
      sellOrder: OrderRecord,
      executionPrice: number,
      matchAmount: number,
      privateKey: string,
      programSource: string,
      useNetwork: boolean = false
    ): Promise<{
      buyerReceipt?: MatchReceiptRecord;
      sellerReceipt?: MatchReceiptRecord;
      txId?: string;
    }> {
      const inputs = formatMatchOrdersInputs({
        buyOrder,
        sellOrder,
        executionPrice,
        matchAmount,
      });

      if (useNetwork) {
        const txId = await worker.executeProgram(
          PROGRAM_ID,
          'match_orders',
          inputs,
          privateKey
        );
        return { txId };
      }

      const outputs = await worker.localProgramExecution(
        programSource,
        'match_orders',
        inputs
      );

      return {
        buyerReceipt: parseMatchReceiptRecord(outputs[0]),
        sellerReceipt: parseMatchReceiptRecord(outputs[1]),
      };
    },

    /** Mint tokens (for testing) */
    async mintToken(
      receiver: string,
      assetId: string,
      amount: number,
      programSource: string
    ): Promise<TokenRecord> {
      const inputs = formatMintTokenInputs({ receiver, assetId, amount });

      const outputs = await worker.localProgramExecution(
        programSource,
        'mint_token',
        inputs
      );

      return parseTokenRecord(outputs[0]);
    },

    /** Transfer tokens */
    async transferToken(
      token: TokenRecord,
      to: string,
      amount: number,
      programSource: string
    ): Promise<{ sender: TokenRecord; receiver: TokenRecord }> {
      const inputs = [
        formatRecord(token),
        format.address(to),
        format.u128(toScaled(amount)),
      ];

      const outputs = await worker.localProgramExecution(
        programSource,
        'transfer_token',
        inputs
      );

      return {
        sender: parseTokenRecord(outputs[0]),
        receiver: parseTokenRecord(outputs[1]),
      };
    },

    /** Get mapping value from chain */
    async getMappingValue(mappingName: string, key: string): Promise<string | null> {
      return await worker.getMappingValue(PROGRAM_ID, mappingName, key);
    },

    /** Check if an order is active */
    async isOrderActive(orderId: string): Promise<boolean> {
      const value = await worker.getMappingValue(PROGRAM_ID, 'order_active', orderId);
      return value === 'true';
    },

    /** Get market volume */
    async getMarketVolume(marketId: string): Promise<number> {
      const value = await worker.getMappingValue(PROGRAM_ID, 'market_volume', marketId);
      if (!value) return 0;
      return fromScaled(value);
    },

    /** Check if a match has been executed */
    async isMatchExecuted(matchId: string): Promise<boolean> {
      const value = await worker.getMappingValue(PROGRAM_ID, 'executed_matches', matchId);
      return value === 'true';
    },

    /** Check if a match has been settled */
    async isMatchSettled(matchId: string): Promise<boolean> {
      const value = await worker.getMappingValue(PROGRAM_ID, 'settled_matches', matchId);
      return value === 'true';
    },

    /** Settle a matched trade */
    async settleTrade(
      input: SettleTradeInput,
      privateKey: string,
      programSource: string,
      useNetwork: boolean = false
    ): Promise<{
      buyerSettlement?: SettlementReceiptRecord;
      sellerSettlement?: SettlementReceiptRecord;
      txId?: string;
    }> {
      const inputs = formatSettleTradeInputs(input);

      if (useNetwork) {
        const txId = await worker.executeProgram(
          PROGRAM_ID,
          'settle_trade',
          inputs,
          privateKey
        );
        return { txId };
      }

      const outputs = await worker.localProgramExecution(
        programSource,
        'settle_trade',
        inputs
      );

      return {
        buyerSettlement: parseSettlementReceiptRecord(outputs[0]),
        sellerSettlement: parseSettlementReceiptRecord(outputs[1]),
      };
    },

    /** Split a token into two */
    async splitToken(
      token: TokenRecord,
      amount: number,
      programSource: string
    ): Promise<{ first: TokenRecord; second: TokenRecord }> {
      const inputs = [
        formatRecord(token),
        format.u128(toScaled(amount)),
      ];

      const outputs = await worker.localProgramExecution(
        programSource,
        'split_token',
        inputs
      );

      return {
        first: parseTokenRecord(outputs[0]),
        second: parseTokenRecord(outputs[1]),
      };
    },

    /** Combine two tokens into one */
    async combineTokens(
      tokenA: TokenRecord,
      tokenB: TokenRecord,
      programSource: string
    ): Promise<TokenRecord> {
      const inputs = [
        formatRecord(tokenA),
        formatRecord(tokenB),
      ];

      const outputs = await worker.localProgramExecution(
        programSource,
        'combine_tokens',
        inputs
      );

      return parseTokenRecord(outputs[0]);
    },

    /** Convert order record to display format */
    orderToDisplay,

    /** Convert token record to display format */
    tokenToDisplay,

    /** Convert match receipt to display format */
    matchReceiptToDisplay,

    /** Convert settlement receipt to display format */
    settlementReceiptToDisplay,
  };
}

/** Create mock order book data for display */
export function createMockOrderBook(
  midPrice: number,
  spread: number = 0.5,
  levels: number = 15
): { bids: OrderBookEntry[]; asks: OrderBookEntry[] } {
  const bids: OrderBookEntry[] = [];
  const asks: OrderBookEntry[] = [];

  let bidTotal = 0;
  let askTotal = 0;

  for (let i = 0; i < levels; i++) {
    const bidPrice = midPrice - spread - (i * 0.5) - (Math.random() * 0.2);
    const bidSize = Math.random() * 10 + 0.1;
    bidTotal += bidSize * bidPrice;

    bids.push({
      price: bidPrice,
      size: bidSize,
      total: bidTotal,
      orderCount: Math.floor(Math.random() * 5) + 1,
      side: 'buy',
      isDark: Math.random() > 0.8,
    });

    const askPrice = midPrice + spread + (i * 0.5) + (Math.random() * 0.2);
    const askSize = Math.random() * 10 + 0.1;
    askTotal += askSize * askPrice;

    asks.push({
      price: askPrice,
      size: askSize,
      total: askTotal,
      orderCount: Math.floor(Math.random() * 5) + 1,
      side: 'sell',
      isDark: Math.random() > 0.8,
    });
  }

  return { bids, asks };
}

/** Create mock trade history */
export function createMockTrades(count: number, basePrice: number): TradeEntry[] {
  const trades: TradeEntry[] = [];
  const now = Date.now();

  for (let i = 0; i < count; i++) {
    const price = basePrice + (Math.random() - 0.5) * 10;
    const side = Math.random() > 0.5 ? 'buy' : 'sell';

    trades.push({
      id: `trade-${i}`,
      matchId: `match-${i}`,
      price,
      amount: Math.random() * 5 + 0.01,
      side,
      timestamp: new Date(now - i * 30000),
      isMine: Math.random() > 0.9,
    });
  }

  return trades;
}

/** Create mock user orders */
export function createMockOrders(count: number, address: string, basePrice: number): Order[] {
  const orders: Order[] = [];

  for (let i = 0; i < count; i++) {
    const side = Math.random() > 0.5 ? OrderSide.BUY : OrderSide.SELL;
    const price = side === OrderSide.BUY
      ? basePrice - Math.random() * 50
      : basePrice + Math.random() * 50;
    const amount = Math.random() * 10 + 0.1;
    const filled = Math.random() * amount * 0.5;

    orders.push({
      orderId: `order-${i}-${generateSalt().slice(0, 8)}`,
      owner: address,
      side,
      baseAsset: DEFAULT_BASE_ASSET,
      quoteAsset: DEFAULT_QUOTE_ASSET,
      amount,
      price,
      filled,
      remaining: amount - filled,
      percentFilled: (filled / amount) * 100,
      createdAt: new Date(Date.now() - Math.random() * 86400000),
    });
  }

  return orders;
}

export type DarkpoolService = ReturnType<typeof getDarkpoolService>;
