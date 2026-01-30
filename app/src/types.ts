export interface CandleData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface Order {
  price: number;
  size: number;
  total: number;
  type: 'buy' | 'sell';
  isDark?: boolean; // Hidden liquidity marker
}

export interface Trade {
  id: string;
  price: number;
  size: number;
  time: string;
  side: 'buy' | 'sell';
  isBlockTrade?: boolean;
}

export interface Position {
  symbol: string;
  size: number;
  entryPrice: number;
  markPrice: number;
  pnl: number;
  pnlPercent: number;
  leverage: number;
}

export interface OrderHistoryItem {
  id: string;
  symbol: string;
  type: 'Limit' | 'Market';
  side: 'buy' | 'sell';
  price: number;
  amount: number;
  filled: number;
  status: 'Filled' | 'Cancelled' | 'Partially Filled';
  time: string;
}

export type CardVariant = 'accent' | 'default';

export interface CardProps {
  variant: CardVariant;
  number: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}