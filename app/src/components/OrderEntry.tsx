import React, { useState } from 'react';
import { Lock, Zap, RefreshCw } from 'lucide-react';

const OrderEntry: React.FC = () => {
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [orderType, setOrderType] = useState('Limit');
  const [size, setSize] = useState('1.5');
  const [isDarkPool, setIsDarkPool] = useState(false);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
          <h2 className="font-mono text-xs uppercase tracking-widest text-paper/60">Trade</h2>
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-q-green">
             <span className="w-1.5 h-1.5 rounded-full bg-q-green animate-pulse"></span>
             MARKET_OPEN
          </div>
      </div>

      {/* Buy/Sell Switch */}
      <div className="grid grid-cols-2 gap-1 bg-charcoal p-1 rounded-lg mb-4">
         <button
           onClick={() => setSide('buy')}
           className={`py-2 rounded font-mono text-xs uppercase tracking-wider transition-all ${side === 'buy' ? 'bg-q-green text-ink font-bold' : 'text-paper/40 hover:text-paper'}`}
         >
           Buy
         </button>
         <button
           onClick={() => setSide('sell')}
           className={`py-2 rounded font-mono text-xs uppercase tracking-wider transition-all ${side === 'sell' ? 'bg-q-red text-white font-bold' : 'text-paper/40 hover:text-paper'}`}
         >
           Sell
         </button>
      </div>

      {/* Order Type */}
      <div className="flex gap-1 mb-4">
         {['Limit', 'Market', 'Stop'].map(type => (
            <button
              key={type}
              onClick={() => setOrderType(type)}
              className={`px-3 py-1.5 rounded text-[10px] font-mono uppercase tracking-wider border transition-all ${orderType === type ? 'border-accent bg-accent text-ink' : 'border-paper/10 text-paper/50 hover:border-paper/30 hover:text-paper'}`}
            >
              {type}
            </button>
         ))}
      </div>

      {/* Inputs */}
      <div className="space-y-3 mb-4">
        <div>
            <label className="text-[10px] font-mono text-paper/40 uppercase tracking-wider mb-1 block">Price (USD)</label>
            <input
              type="text"
              defaultValue="2,983.18"
              className="w-full bg-charcoal border border-paper/10 rounded py-2 px-3 font-mono text-sm text-paper outline-none focus:border-accent/50 transition-all"
            />
        </div>

        <div>
            <label className="text-[10px] font-mono text-paper/40 uppercase tracking-wider mb-1 block">Amount (ETH)</label>
            <div className="relative">
                <input
                  type="text"
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  className="w-full bg-charcoal border border-paper/10 rounded py-2 px-3 font-mono text-sm text-paper outline-none focus:border-accent/50 transition-all pr-14"
                />
                <button className="absolute right-1 top-1 bottom-1 px-2 text-[10px] font-mono text-accent hover:bg-accent/10 rounded transition-colors">MAX</button>
            </div>
        </div>

        {/* Range Slider */}
        <div className="py-1">
           <input type="range" className="w-full h-1 bg-paper/10 rounded appearance-none cursor-pointer accent-accent" />
           <div className="flex justify-between mt-1 text-[9px] font-mono text-paper/30">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
           </div>
        </div>
      </div>

      {/* Dark Pool Toggle */}
      <div
        onClick={() => setIsDarkPool(!isDarkPool)}
        className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all border ${isDarkPool ? 'bg-accent/10 border-accent' : 'bg-charcoal border-paper/10 hover:border-paper/20'}`}
      >
         <div className="flex items-center gap-2">
            <Lock size={14} className={isDarkPool ? 'text-accent' : 'text-paper/40'} />
            <div className="flex flex-col">
               <span className="font-mono text-xs text-paper">Dark Pool</span>
               <span className="text-[10px] text-paper/40 font-mono">HIDDEN_EXEC</span>
            </div>
         </div>
         <div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${isDarkPool ? 'bg-accent' : 'bg-paper/20'}`}>
            <div className={`w-3 h-3 rounded-full bg-paper shadow-sm transition-transform ${isDarkPool ? 'translate-x-4' : ''}`}></div>
         </div>
      </div>

      {/* Submit Button */}
      <button className={`mt-4 w-full py-3 rounded-lg font-mono text-xs uppercase tracking-widest font-bold active:scale-[0.98] transition-all flex items-center justify-center gap-2 ${side === 'buy' ? 'bg-q-green text-ink' : 'bg-q-red text-white'}`}>
         {side === 'buy' ? 'Place Buy Order' : 'Place Sell Order'}
         <Zap size={14} fill="currentColor" />
      </button>

      <div className="mt-3 flex items-center justify-center gap-1.5 text-[10px] text-paper/30 font-mono">
         <RefreshCw size={10} />
         UPDATED_14MS
      </div>
    </div>
  );
};

export default OrderEntry;
