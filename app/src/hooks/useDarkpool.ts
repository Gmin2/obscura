/**
 * Darkpool Hooks
 * React hooks for interacting with the Obscura darkpool contract
 */

import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@demox-labs/aleo-wallet-adapter-react';
import { getAleoWorker } from '../workers/AleoWorker.ts';
import {
  PROGRAM_ID,
  OrderSide,
  type OrderRecord,
  type TokenRecord,
  type MatchReceiptRecord,
  type Order,
  type Token,
  type TradeEntry,
  type OrderBookEntry,
} from '../aleo/types.ts';
import {
  orderToDisplay,
  tokenToDisplay,
  fromScaled,
} from '../aleo/utils.ts';

/** Asset configuration */
export const ASSETS = {
  '1field': { symbol: 'ETH', name: 'Ethereum', decimals: 8 },
  '2field': { symbol: 'USDC', name: 'USD Coin', decimals: 6 },
  '3field': { symbol: 'BTC', name: 'Bitcoin', decimals: 8 },
  '4field': { symbol: 'ALEO', name: 'Aleo', decimals: 6 },
} as const;

/** Get asset symbol from field ID */
export function getAssetSymbol(assetId: string): string {
  const normalized = assetId.endsWith('field') ? assetId : `${assetId}field`;
  return ASSETS[normalized as keyof typeof ASSETS]?.symbol ?? 'UNKNOWN';
}

/** Hook for managing user's orders */
export function useOrders() {
  const { publicKey, connected, requestRecords } = useWallet();
  const [orders, setOrders] = useState<Order[]>([]);
  const [rawOrders, setRawOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasFetched, setHasFetched] = useState(false);

  /** Fetch orders from wallet records - only call when user explicitly requests */
  const fetchOrders = useCallback(async () => {
    if (!connected || !publicKey) {
      setOrders([]);
      setRawOrders([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      /** Try to get records from wallet adapter */
      if (requestRecords) {
        const records = await requestRecords(PROGRAM_ID);
        const orderRecords = records
          .filter((r: { data: { order_id?: unknown } }) => r.data?.order_id)
          .map((r: { data: Record<string, unknown> }) => ({
            owner: r.data.owner as string,
            order_id: r.data.order_id as string,
            side: Number(r.data.side),
            base_asset: r.data.base_asset as string,
            quote_asset: r.data.quote_asset as string,
            amount: r.data.amount as string,
            price: r.data.price as string,
            salt: r.data.salt as string,
            filled: r.data.filled as string,
            created_at: Number(r.data.created_at),
          })) as OrderRecord[];

        setRawOrders(orderRecords);
        setOrders(orderRecords.map(orderToDisplay));
        setHasFetched(true);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch orders';
      setError(message);
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  }, [connected, publicKey, requestRecords]);

  /** Clear data on disconnect */
  useEffect(() => {
    if (!connected) {
      setOrders([]);
      setRawOrders([]);
      setHasFetched(false);
    }
  }, [connected]);

  /** Add a new order to local state (optimistic update) */
  const addOrder = useCallback((order: OrderRecord) => {
    setRawOrders(prev => [order, ...prev]);
    setOrders(prev => [orderToDisplay(order), ...prev]);
  }, []);

  /** Remove an order from local state */
  const removeOrder = useCallback((orderId: string) => {
    setRawOrders(prev => prev.filter(o => o.order_id !== orderId));
    setOrders(prev => prev.filter(o => o.orderId !== orderId));
  }, []);

  /** Update an order in local state */
  const updateOrder = useCallback((orderId: string, updates: Partial<OrderRecord>) => {
    setRawOrders(prev => prev.map(o =>
      o.order_id === orderId ? { ...o, ...updates } : o
    ));
    setOrders(prev => prev.map(o =>
      o.orderId === orderId ? { ...o, ...updates } as Order : o
    ));
  }, []);

  return {
    orders,
    rawOrders,
    loading,
    error,
    hasFetched,
    refresh: fetchOrders,
    addOrder,
    removeOrder,
    updateOrder,
    buyOrders: orders.filter(o => o.side === OrderSide.BUY),
    sellOrders: orders.filter(o => o.side === OrderSide.SELL),
    openOrders: orders.filter(o => o.filled < o.amount),
    filledOrders: orders.filter(o => o.filled >= o.amount),
  };
}

/** Hook for managing user's token balances */
export function useTokens() {
  const { publicKey, connected, requestRecords } = useWallet();
  const [tokens, setTokens] = useState<Token[]>([]);
  const [rawTokens, setRawTokens] = useState<TokenRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasFetched, setHasFetched] = useState(false);

  /** Fetch tokens from wallet records - only call when user explicitly requests */
  const fetchTokens = useCallback(async () => {
    if (!connected || !publicKey) {
      setTokens([]);
      setRawTokens([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (requestRecords) {
        const records = await requestRecords(PROGRAM_ID);
        const tokenRecords = records
          .filter((r: { data: { asset_id?: unknown; order_id?: unknown } }) =>
            r.data?.asset_id && !r.data?.order_id
          )
          .map((r: { data: Record<string, unknown> }) => ({
            owner: r.data.owner as string,
            asset_id: r.data.asset_id as string,
            amount: r.data.amount as string,
          })) as TokenRecord[];

        setRawTokens(tokenRecords);
        setTokens(tokenRecords.map(tokenToDisplay));
        setHasFetched(true);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch tokens';
      setError(message);
      console.error('Error fetching tokens:', err);
    } finally {
      setLoading(false);
    }
  }, [connected, publicKey, requestRecords]);

  /** Clear data on disconnect */
  useEffect(() => {
    if (!connected) {
      setTokens([]);
      setRawTokens([]);
      setHasFetched(false);
    }
  }, [connected]);

  /** Get balance for a specific asset */
  const getBalance = useCallback((assetId: string): number => {
    const normalized = assetId.endsWith('field') ? assetId : `${assetId}field`;
    return tokens
      .filter(t => t.assetId === normalized || t.assetId === assetId)
      .reduce((sum, t) => sum + t.amount, 0);
  }, [tokens]);

  /** Get total portfolio value in USD (requires price feed) */
  const getTotalValue = useCallback((prices: Record<string, number>): number => {
    return tokens.reduce((sum, t) => {
      const symbol = getAssetSymbol(t.assetId);
      const price = prices[symbol] ?? 0;
      return sum + t.amount * price;
    }, 0);
  }, [tokens]);

  return {
    tokens,
    rawTokens,
    loading,
    error,
    hasFetched,
    refresh: fetchTokens,
    getBalance,
    getTotalValue,
  };
}

/** Hook for fetching trade history (match receipts) */
export function useTradeHistory() {
  const { publicKey, connected, requestRecords } = useWallet();
  const [trades, setTrades] = useState<TradeEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasFetched, setHasFetched] = useState(false);

  /** Fetch trades - only call when user explicitly requests */
  const fetchTrades = useCallback(async () => {
    if (!connected || !publicKey) {
      setTrades([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (requestRecords) {
        const records = await requestRecords(PROGRAM_ID);
        const matchRecords = records
          .filter((r: { data: { match_id?: unknown } }) => r.data?.match_id)
          .map((r: { data: Record<string, unknown> }) => {
            const receipt: MatchReceiptRecord = {
              owner: r.data.owner as string,
              match_id: r.data.match_id as string,
              order_id: r.data.order_id as string,
              counterparty_order_id: r.data.counterparty_order_id as string,
              amount_filled: r.data.amount_filled as string,
              execution_price: r.data.execution_price as string,
              is_buy: r.data.is_buy === 'true' || r.data.is_buy === true,
              timestamp: Number(r.data.timestamp),
            };

            return {
              id: receipt.match_id,
              matchId: receipt.match_id,
              price: fromScaled(receipt.execution_price),
              amount: fromScaled(receipt.amount_filled),
              side: receipt.is_buy ? 'buy' : 'sell',
              timestamp: new Date(receipt.timestamp),
              isMine: true,
            } as TradeEntry;
          });

        setTrades(matchRecords.sort((a, b) =>
          b.timestamp.getTime() - a.timestamp.getTime()
        ));
        setHasFetched(true);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch trades';
      setError(message);
      console.error('Error fetching trades:', err);
    } finally {
      setLoading(false);
    }
  }, [connected, publicKey, requestRecords]);

  /** Clear data on disconnect */
  useEffect(() => {
    if (!connected) {
      setTrades([]);
      setHasFetched(false);
    }
  }, [connected]);

  /** Add a trade (optimistic update after match) */
  const addTrade = useCallback((trade: TradeEntry) => {
    setTrades(prev => [trade, ...prev]);
  }, []);

  return {
    trades,
    loading,
    error,
    hasFetched,
    refresh: fetchTrades,
    addTrade,
  };
}

/** Hook for building order book from on-chain data */
export function useOrderBook(_baseAsset: string = '1', _quoteAsset: string = '2') {
  const { buyOrders, sellOrders, loading } = useOrders();
  const [orderBook, setOrderBook] = useState<{
    bids: OrderBookEntry[];
    asks: OrderBookEntry[];
  }>({ bids: [], asks: [] });

  /** Build order book from user's orders */
  useEffect(() => {
    /** Aggregate orders by price level */
    const aggregateOrders = (orderList: Order[], side: 'buy' | 'sell'): OrderBookEntry[] => {
      const priceMap = new Map<number, { size: number; count: number }>();

      orderList.forEach(order => {
        const remaining = order.amount - order.filled;
        if (remaining <= 0) return;

        const rounded = Math.round(order.price * 100) / 100;
        const existing = priceMap.get(rounded) || { size: 0, count: 0 };
        priceMap.set(rounded, {
          size: existing.size + remaining,
          count: existing.count + 1,
        });
      });

      const entries: OrderBookEntry[] = [];
      let total = 0;

      const sortedPrices = Array.from(priceMap.keys()).sort((a, b) =>
        side === 'buy' ? b - a : a - b
      );

      sortedPrices.forEach(price => {
        const data = priceMap.get(price)!;
        total += data.size * price;
        entries.push({
          price,
          size: data.size,
          total,
          orderCount: data.count,
          side,
          isDark: true,
        });
      });

      return entries;
    };

    const bids = aggregateOrders(buyOrders, 'buy');
    const asks = aggregateOrders(sellOrders, 'sell');

    setOrderBook({ bids, asks });
  }, [buyOrders, sellOrders]);

  /** Calculate spread */
  const spread = orderBook.bids.length > 0 && orderBook.asks.length > 0
    ? {
        value: orderBook.asks[0].price - orderBook.bids[0].price,
        percent: ((orderBook.asks[0].price - orderBook.bids[0].price) / orderBook.bids[0].price) * 100,
      }
    : { value: 0, percent: 0 };

  return {
    orderBook,
    bids: orderBook.bids,
    asks: orderBook.asks,
    spread,
    loading,
    isEmpty: orderBook.bids.length === 0 && orderBook.asks.length === 0,
  };
}

/** Hook for market statistics from on-chain mappings */
export function useMarketStats(baseAsset: string = '1', quoteAsset: string = '2') {
  const [volume, setVolume] = useState<number>(0);
  const [orderCount] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  const worker = getAleoWorker();

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      /** Market ID is hash of base/quote assets */
      const marketId = `${baseAsset}${quoteAsset}`;

      const volumeValue = await worker.getMappingValue(PROGRAM_ID, 'market_volume', marketId);
      if (volumeValue) {
        setVolume(fromScaled(volumeValue));
      }
    } catch (err) {
      console.error('Error fetching market stats:', err);
    } finally {
      setLoading(false);
    }
  }, [baseAsset, quoteAsset, worker]);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  return {
    volume,
    orderCount,
    loading,
    refresh: fetchStats,
  };
}
