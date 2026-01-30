import React from 'react';
import { MOCK_ASKS, MOCK_BIDS } from '../constants';
import { EyeOff } from 'lucide-react';

const OrderRow = ({ order, type, maxTotal }: { order: any, type: 'buy' | 'sell', maxTotal: number }) => {
  const isBuy = type === 'buy';
  const textColor = isBuy ? 'text-q-green' : 'text-q-red';
  const depthWidth = `${(order.total / maxTotal) * 100}%`;

  return (
    <div className="relative grid grid-cols-3 gap-4 py-1.5 px-2 text-xs font-mono hover:bg-paper/5 rounded group cursor-pointer">
      {/* Depth Bar */}
      <div
        className={`absolute top-0.5 bottom-0.5 right-0 opacity-10 rounded-l ${isBuy ? 'bg-q-green' : 'bg-q-red'}`}
        style={{ width: depthWidth }}
      />

      <span className={`${textColor}`}>
        {order.price.toFixed(2)}
      </span>
      <span className="text-right text-paper/80">
        {order.size.toFixed(3)}
      </span>
      <span className="text-right text-paper/40 relative z-10 flex items-center justify-end gap-1">
        {order.total.toFixed(2)}
        {order.isDark && <EyeOff size={10} className="text-accent" />}
      </span>
    </div>
  );
};

const OrderBook: React.FC = () => {
  const maxTotal = Math.max(
    MOCK_BIDS[MOCK_BIDS.length - 1].total,
    MOCK_ASKS[0].total
  );

  return (
    <div className="flex flex-col h-full">
      <div className="grid grid-cols-3 gap-4 px-2 pb-2 text-[10px] font-mono text-paper/40 uppercase tracking-wider border-b border-paper/10 mb-2">
        <span>Price</span>
        <span className="text-right">Size</span>
        <span className="text-right">Total</span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-0">
        {/* Asks (Sell) */}
        <div className="flex flex-col-reverse">
            {MOCK_ASKS.slice(0, 6).map((order, i) => (
            <OrderRow key={`ask-${i}`} order={order} type="sell" maxTotal={maxTotal} />
            ))}
        </div>

        {/* Spread Divider */}
        <div className="py-2 my-1 border-y border-dashed border-paper/10 flex items-center justify-center bg-charcoal rounded">
            <span className="text-accent font-bold font-mono text-sm">2,983.18</span>
            <span className="text-[10px] text-paper/40 ml-2 font-mono">SPREAD_0.1</span>
        </div>

        {/* Bids (Buy) */}
        <div>
            {MOCK_BIDS.slice(0, 6).map((order, i) => (
            <OrderRow key={`bid-${i}`} order={order} type="buy" maxTotal={maxTotal} />
            ))}
        </div>
      </div>
    </div>
  );
};

export default OrderBook;
