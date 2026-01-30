/**
 * Darkpool Hooks
 * React hooks for interacting with the Obscura darkpool contract
 *
 * NOTE: This version uses mock data for display and real transactions for execution.
 * Record fetching is intentionally disabled to avoid wallet popup spam.
 */

import { useState, useCallback } from 'react';
import { useWallet } from '@demox-labs/aleo-wallet-adapter-react';
import {
  createPlaceOrderTransaction,
  createMintTokenTransaction,
  createCancelOrderTransaction,
  type TransactionResult,
} from '../aleo/transactions.ts';
import { OrderSide, type Order, type Token, type TradeEntry, type OrderBookEntry } from '../aleo/types.ts';

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

/**
 * Hook for executing darkpool transactions
 * This is the main hook for placing orders and minting tokens
 */
export function useDarkpoolTransactions() {
  const { publicKey, connected, requestTransaction } = useWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastTxId, setLastTxId] = useState<string | null>(null);

  /** Place an order on the darkpool */
  const placeOrder = useCallback(async (
    side: 'buy' | 'sell',
    baseAsset: string,
    quoteAsset: string,
    amount: number,
    price: number
  ): Promise<TransactionResult> => {
    if (!connected || !publicKey || !requestTransaction) {
      return { success: false, error: 'Wallet not connected' };
    }

    setLoading(true);
    setError(null);

    try {
      const orderSide = side === 'buy' ? OrderSide.BUY : OrderSide.SELL;
      const tx = createPlaceOrderTransaction(
        publicKey,
        orderSide,
        baseAsset,
        quoteAsset,
        amount,
        price
      );

      const txId = await requestTransaction(tx);
      setLastTxId(txId);

      return { success: true, txId };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Transaction failed';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, [connected, publicKey, requestTransaction]);

  /** Mint tokens (for testing) */
  const mintToken = useCallback(async (
    assetId: string,
    amount: number,
    receiver?: string
  ): Promise<TransactionResult> => {
    if (!connected || !publicKey || !requestTransaction) {
      return { success: false, error: 'Wallet not connected' };
    }

    setLoading(true);
    setError(null);

    try {
      const tx = createMintTokenTransaction(
        publicKey,
        receiver || publicKey,
        assetId,
        amount
      );

      const txId = await requestTransaction(tx);
      setLastTxId(txId);

      return { success: true, txId };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Transaction failed';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, [connected, publicKey, requestTransaction]);

  /** Cancel an order */
  const cancelOrder = useCallback(async (
    orderRecord: string
  ): Promise<TransactionResult> => {
    if (!connected || !publicKey || !requestTransaction) {
      return { success: false, error: 'Wallet not connected' };
    }

    setLoading(true);
    setError(null);

    try {
      const tx = createCancelOrderTransaction(publicKey, orderRecord);
      const txId = await requestTransaction(tx);
      setLastTxId(txId);

      return { success: true, txId };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Transaction failed';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, [connected, publicKey, requestTransaction]);

  return {
    placeOrder,
    mintToken,
    cancelOrder,
    loading,
    error,
    lastTxId,
    connected,
    publicKey,
  };
}

/**
 * Hook for managing user's orders (mock data for display)
 * Real orders would require record fetching which causes wallet popups
 */
export function useOrders() {
  const { connected } = useWallet();
  const [orders] = useState<Order[]>([]);

  return {
    orders,
    loading: false,
    error: null,
    hasFetched: false,
    refresh: () => {},
    buyOrders: orders.filter(o => o.side === OrderSide.BUY),
    sellOrders: orders.filter(o => o.side === OrderSide.SELL),
    openOrders: orders.filter(o => o.filled < o.amount),
    filledOrders: orders.filter(o => o.filled >= o.amount),
    connected,
  };
}

/**
 * Hook for managing user's token balances (mock data for display)
 */
export function useTokens() {
  const { connected } = useWallet();
  const [tokens] = useState<Token[]>([]);

  const getBalance = useCallback((assetId: string): number => {
    const normalized = assetId.endsWith('field') ? assetId : `${assetId}field`;
    return tokens
      .filter(t => t.assetId === normalized || t.assetId === assetId)
      .reduce((sum, t) => sum + t.amount, 0);
  }, [tokens]);

  return {
    tokens,
    loading: false,
    error: null,
    hasFetched: false,
    refresh: () => {},
    getBalance,
    connected,
  };
}

/**
 * Hook for trade history (mock data for display)
 */
export function useTradeHistory() {
  const { connected } = useWallet();
  const [trades] = useState<TradeEntry[]>([]);

  return {
    trades,
    loading: false,
    error: null,
    hasFetched: false,
    refresh: () => {},
    connected,
  };
}

/**
 * Hook for order book (mock data for display)
 */
export function useOrderBook() {
  const { connected } = useWallet();
  const [orderBook] = useState<{ bids: OrderBookEntry[]; asks: OrderBookEntry[] }>({
    bids: [],
    asks: [],
  });

  return {
    orderBook,
    bids: orderBook.bids,
    asks: orderBook.asks,
    spread: { value: 0, percent: 0 },
    loading: false,
    isEmpty: true,
    connected,
  };
}
