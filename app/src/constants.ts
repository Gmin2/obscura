import type { CandleData, Order, Trade, Position, OrderHistoryItem } from './types';

// Helper to generate realistic-looking random walk data
export const generateCandleData = (count: number, volatilityMultiplier: number = 1): CandleData[] => {
  const data: CandleData[] = [];
  let price = 2980.00;
  const now = new Date();
  
  for (let i = 0; i < count; i++) {
    // 5 min candles by default, but we just use the count to spacing
    const time = new Date(now.getTime() - (count - i) * 60000 * 5); 
    const volatility = (Math.random() - 0.5) * 10 * volatilityMultiplier;
    const open = price;
    const close = price + volatility;
    const high = Math.max(open, close) + Math.random() * 5 * volatilityMultiplier;
    const low = Math.min(open, close) - Math.random() * 5 * volatilityMultiplier;
    const volume = Math.floor(Math.random() * 1000) + 50;
    
    data.push({
      time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      open,
      high,
      low,
      close,
      volume
    });
    
    price = close;
  }
  return data;
};

export const MOCK_CANDLES = generateCandleData(60);

export const getCandlesForTimeframe = (tf: string): CandleData[] => {
    switch(tf) {
        case '1H': return generateCandleData(60, 0.5); // Less volatile
        case '1D': return generateCandleData(24, 2); // More volatile
        case '1W': return generateCandleData(7, 5); 
        case '1M': return generateCandleData(30, 8);
        case '1Y': return generateCandleData(12, 20);
        default: return generateCandleData(60);
    }
}

export const MOCK_BIDS: Order[] = Array.from({ length: 15 }).map((_, i) => ({
  price: 2983.00 - (i * 0.5) - (Math.random() * 0.2),
  size: Math.random() * 10 + 0.1,
  total: 0,
  type: 'buy' as const,
  isDark: Math.random() > 0.8
})).map((o, i, arr) => ({ ...o, total: arr.slice(0, i + 1).reduce((acc, curr) => acc + curr.size, 0) }));

export const MOCK_ASKS: Order[] = Array.from({ length: 15 }).map((_, i) => ({
  price: 2983.50 + (i * 0.5) + (Math.random() * 0.2),
  size: Math.random() * 10 + 0.1,
  total: 0,
  type: 'sell' as const,
  isDark: Math.random() > 0.8
})).map((o, i, arr) => ({ ...o, total: arr.slice(0, i + 1).reduce((acc, curr) => acc + curr.size, 0) })).reverse();

export const MOCK_TRADES: Trade[] = Array.from({ length: 30 }).map((_, i) => ({
  id: Math.random().toString(36).substring(7),
  price: 2983.00 + (Math.random() - 0.5) * 5,
  size: Math.random() * 10,
  time: new Date(Date.now() - i * 5000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
  side: (Math.random() > 0.5 ? 'buy' : 'sell') as 'buy' | 'sell',
  isBlockTrade: Math.random() > 0.85
}));

export const MOCK_POSITIONS: Position[] = [
  {
    symbol: 'ETH-USD',
    size: 80.23,
    entryPrice: 2983.823,
    markPrice: 2983.185,
    pnl: -51.16,
    pnlPercent: -1.07,
    leverage: 50
  }
];

export const MOCK_ORDER_HISTORY: OrderHistoryItem[] = [
  { id: '1', symbol: 'ETH-USD', type: 'Limit', side: 'buy', price: 2950.00, amount: 10.5, filled: 10.5, status: 'Filled', time: '10:23:45' },
  { id: '2', symbol: 'BTC-USD', type: 'Market', side: 'sell', price: 42100.00, amount: 0.5, filled: 0.5, status: 'Filled', time: '09:15:00' },
  { id: '3', symbol: 'ETH-USD', type: 'Limit', side: 'sell', price: 3050.00, amount: 5.0, filled: 0, status: 'Cancelled', time: 'Yesterday' },
  { id: '4', symbol: 'SOL-USD', type: 'Limit', side: 'buy', price: 105.20, amount: 100, filled: 100, status: 'Filled', time: 'Yesterday' },
  { id: '5', symbol: 'ETH-USD', type: 'Limit', side: 'buy', price: 2900.00, amount: 20, filled: 0, status: 'Cancelled', time: '2 days ago' },
];