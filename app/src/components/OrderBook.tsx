import { useState, useEffect, useMemo } from 'react';
import { EyeOff, RefreshCw, Loader2 } from 'lucide-react';
import { useOrderBook } from '../hooks/useDarkpool.ts';
import { useWallet } from '@demox-labs/aleo-wallet-adapter-react';
import { createMockOrderBook, type OrderBookEntry } from '../aleo/index.ts';

interface OrderRowProps {
  order: OrderBookEntry;
  type: 'buy' | 'sell';
  maxTotal: number;
}

const OrderRow: React.FC<OrderRowProps> = ({ order, type, maxTotal }) => {
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

interface OrderBookProps {
  /** Base price for the order book (mid price) */
  basePrice?: number;
  /** Callback when a price level is clicked */
  onPriceClick?: (price: number) => void;
}

/**
 * OrderBook Component
 * Displays real-time bid/ask levels with depth visualization
 * Uses real on-chain data when wallet is connected, mock data otherwise
 */
const OrderBook: React.FC<OrderBookProps> = ({
  basePrice = 2983.18,
  onPriceClick,
}) => {
  const { connected } = useWallet();
  const { orderBook: realOrderBook, loading } = useOrderBook();
  /** Manual refresh available via useOrders().refresh - not auto-called to avoid wallet popups */
  // const _ordersHook = useOrders();

  const [mockOrderBook, setMockOrderBook] = useState<{
    bids: OrderBookEntry[];
    asks: OrderBookEntry[];
  }>({ bids: [], asks: [] });
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now());

  /** Use real order book when connected, mock otherwise */
  const orderBook = connected && realOrderBook.bids.length > 0
    ? realOrderBook
    : mockOrderBook;

  /** Generate mock order book data when not connected */
  useEffect(() => {
    if (connected) return;

    const updateOrderBook = () => {
      const data = createMockOrderBook(basePrice, 0.5, 15);
      setMockOrderBook(data);
      setLastUpdate(Date.now());
    };

    updateOrderBook();

    /** Refresh mock order book every 2 seconds */
    const interval = setInterval(updateOrderBook, 2000);
    return () => clearInterval(interval);
  }, [basePrice, connected]);

  /** Update timestamp when connected - manual refresh only to avoid wallet popups */
  useEffect(() => {
    if (connected) {
      setLastUpdate(Date.now());
    }
  }, [connected]);

  /** Calculate max total for depth visualization */
  const maxTotal = useMemo(() => {
    const bidMax = orderBook.bids.length > 0
      ? orderBook.bids[orderBook.bids.length - 1].total
      : 0;
    const askMax = orderBook.asks.length > 0
      ? orderBook.asks[orderBook.asks.length - 1].total
      : 0;
    return Math.max(bidMax, askMax, 1);
  }, [orderBook]);

  /** Calculate spread */
  const spread = useMemo(() => {
    if (orderBook.bids.length === 0 || orderBook.asks.length === 0) {
      return { value: 0, percent: 0 };
    }
    const bestBid = orderBook.bids[0].price;
    const bestAsk = orderBook.asks[orderBook.asks.length - 1].price;
    const spreadValue = bestAsk - bestBid;
    return {
      value: spreadValue,
      percent: (spreadValue / bestBid) * 100,
    };
  }, [orderBook]);

  /** Handle row click */
  const handleRowClick = (price: number) => {
    onPriceClick?.(price);
  };

  /** Time since last update */
  const updateAgo = Math.floor((Date.now() - lastUpdate) / 1000);

  return (
    <div className="flex flex-col h-full">
      <div className="grid grid-cols-3 gap-4 px-2 pb-2 text-[10px] font-mono text-paper/40 uppercase tracking-wider border-b border-paper/10 mb-2">
        <span>Price</span>
        <span className="text-right">Size</span>
        <span className="text-right">Total</span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-0">
        {/* Asks (Sell) - Displayed in reverse so lowest ask is nearest to spread */}
        <div className="flex flex-col-reverse">
          {orderBook.asks.slice(-6).map((order, i) => (
            <div key={`ask-${i}`} onClick={() => handleRowClick(order.price)}>
              <OrderRow order={order} type="sell" maxTotal={maxTotal} />
            </div>
          ))}
        </div>

        {/* Spread Divider */}
        <div className="py-2 my-1 border-y border-dashed border-paper/10 flex items-center justify-center bg-charcoal rounded">
          <span className="text-accent font-bold font-mono text-sm">
            {basePrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
          <span className="text-[10px] text-paper/40 ml-2 font-mono">
            SPREAD_{spread.value.toFixed(2)}
          </span>
        </div>

        {/* Bids (Buy) */}
        <div>
          {orderBook.bids.slice(0, 6).map((order, i) => (
            <div key={`bid-${i}`} onClick={() => handleRowClick(order.price)}>
              <OrderRow order={order} type="buy" maxTotal={maxTotal} />
            </div>
          ))}
        </div>
      </div>

      {/* Update indicator */}
      <div className="mt-2 flex items-center justify-center gap-1.5 text-[10px] text-paper/30 font-mono">
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

export default OrderBook;
