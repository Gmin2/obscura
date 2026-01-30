import React from 'react';
import { MOCK_TRADES } from '../constants';
import { Shield } from 'lucide-react';

const TradeHistory: React.FC = () => {
  return (
    <div className="flex flex-col h-full">
      <div className="grid grid-cols-3 gap-4 px-2 pb-2 text-[10px] font-bold text-q-muted uppercase tracking-wider border-b border-q-border mb-2">
        <span>Price</span>
        <span className="text-right">Size</span>
        <span className="text-right">Time</span>
      </div>
      <div className="flex-1 overflow-y-auto pr-1 space-y-0.5">
        {MOCK_TRADES.map((trade) => (
          <div key={trade.id} className="grid grid-cols-3 gap-4 py-2 px-1 text-xs font-mono font-medium hover:bg-q-bg/50 rounded-lg transition-colors cursor-pointer group">
            <span className={`${trade.side === 'buy' ? 'text-q-green' : 'text-q-red'} pl-1`}>
              {trade.price.toFixed(2)}
            </span>
            <span className={`text-right flex items-center justify-end gap-1 ${trade.isBlockTrade ? 'text-q-text font-bold' : 'text-q-text/70'}`}>
              {trade.size.toFixed(3)}
              {trade.isBlockTrade && <Shield size={10} className="text-q-black" />}
            </span>
            <span className="text-right text-q-muted">
              {trade.time}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TradeHistory;