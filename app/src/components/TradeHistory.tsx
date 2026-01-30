import { useState, useEffect } from 'react';
import { Shield, RefreshCw, Loader2 } from 'lucide-react';
import { useTradeHistory } from '../hooks/useDarkpool.ts';
import { useWallet } from '@demox-labs/aleo-wallet-adapter-react';
import { createMockTrades, type TradeEntry } from '../aleo/index.ts';

interface TradeHistoryProps {
  /** Base price for generating trades */
  basePrice?: number;
  /** Number of trades to display */
  tradeCount?: number;
}

/**
 * TradeHistory Component
 * Displays recent trade executions with real-time updates
 * Uses real on-chain data when wallet is connected
 */
const TradeHistory: React.FC<TradeHistoryProps> = ({
  basePrice = 2983.18,
  tradeCount = 30,
}) => {
  const { connected } = useWallet();
  const { trades: realTrades, loading } = useTradeHistory();

  const [mockTrades, setMockTrades] = useState<TradeEntry[]>([]);
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now());

  /** Use real trades when connected, mock otherwise */
  const trades = connected && realTrades.length > 0 ? realTrades : mockTrades;

  /** Generate mock trade history when not connected */
  useEffect(() => {
    if (connected) return;

    const updateTrades = () => {
      const data = createMockTrades(tradeCount, basePrice);
      setMockTrades(data);
      setLastUpdate(Date.now());
    };

    updateTrades();

    /** Add new trades periodically to simulate real-time activity */
    const interval = setInterval(() => {
      setMockTrades(prev => {
        const newTrade: TradeEntry = {
          id: `trade-${Date.now()}`,
          matchId: `match-${Date.now()}`,
          price: basePrice + (Math.random() - 0.5) * 10,
          amount: Math.random() * 5 + 0.01,
          side: Math.random() > 0.5 ? 'buy' : 'sell',
          timestamp: new Date(),
          isMine: Math.random() > 0.95,
        };
        setLastUpdate(Date.now());
        return [newTrade, ...prev.slice(0, tradeCount - 1)];
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [basePrice, tradeCount, connected]);

  /** Update timestamp when connected - manual refresh only to avoid wallet popups */
  useEffect(() => {
    if (connected) {
      setLastUpdate(Date.now());
    }
  }, [connected]);

  /** Format timestamp */
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  /** Time since last update */
  const updateAgo = Math.floor((Date.now() - lastUpdate) / 1000);

  return (
    <div className="flex flex-col h-full">
      <div className="grid grid-cols-3 gap-4 px-2 pb-2 text-[10px] font-bold text-q-muted uppercase tracking-wider border-b border-q-border mb-2">
        <span>Price</span>
        <span className="text-right">Size</span>
        <span className="text-right">Time</span>
      </div>
      <div className="flex-1 overflow-y-auto pr-1 space-y-0.5">
        {trades.map((trade) => (
          <div
            key={trade.id}
            className={`grid grid-cols-3 gap-4 py-2 px-1 text-xs font-mono font-medium hover:bg-q-bg/50 rounded-lg transition-colors cursor-pointer group ${trade.isMine ? 'bg-accent/5 border-l-2 border-accent' : ''}`}
          >
            <span className={`${trade.side === 'buy' ? 'text-q-green' : 'text-q-red'} pl-1`}>
              {trade.price.toFixed(2)}
            </span>
            <span className={`text-right flex items-center justify-end gap-1 ${trade.amount > 3 ? 'text-q-text font-bold' : 'text-q-text/70'}`}>
              {trade.amount.toFixed(3)}
              {trade.amount > 3 && <Shield size={10} className="text-q-black" />}
            </span>
            <span className="text-right text-q-muted">
              {formatTime(trade.timestamp)}
            </span>
          </div>
        ))}
      </div>

      {/* Update indicator */}
      <div className="mt-2 flex items-center justify-center gap-1.5 text-[10px] text-paper/30 font-mono border-t border-paper/10 pt-2">
        {loading ? (
          <Loader2 size={10} className="animate-spin" />
        ) : (
          <RefreshCw size={10} className="animate-spin" style={{ animationDuration: '3s' }} />
        )}
        {loading ? 'LOADING...' : connected ? (updateAgo < 1 ? 'LIVE' : `${updateAgo}s ago`) : 'DEMO'}
      </div>
    </div>
  );
};

export default TradeHistory;
