import { useState, useCallback, useRef, useEffect } from 'react';
import { Lock, Zap, RefreshCw, Loader2, ChevronDown } from 'lucide-react';
import { useAleo, useWallet } from '../hooks/useAleo.ts';
import { OrderSide, getDarkpoolService, DEFAULT_QUOTE_ASSET, TRADEABLE_ASSETS } from '../aleo/index.ts';

interface OrderEntryProps {
  programSource?: string;
  onOrderPlaced?: (order: { orderId: string; side: string; price: number; amount: number }) => void;
}

const OrderEntry: React.FC<OrderEntryProps> = ({ programSource, onOrderPlaced }) => {
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [orderType, setOrderType] = useState('Limit');
  const [price, setPrice] = useState('2983.18');
  const [amount, setAmount] = useState('1.5');
  const [isDarkPool, setIsDarkPool] = useState(false);
  const [sliderValue, setSliderValue] = useState(50);
  const [selectedAsset, setSelectedAsset] = useState(TRADEABLE_ASSETS[0]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { loading: executing, error: execError } = useAleo();
  const { connected, publicKey } = useWallet();

  const darkpool = getDarkpoolService();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSliderChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setSliderValue(value);
    const maxAmount = 10;
    setAmount((maxAmount * value / 100).toFixed(4));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!programSource) {
      console.warn('No program source provided, using mock mode');
      onOrderPlaced?.({
        orderId: `mock-${Date.now()}`,
        side,
        price: parseFloat(price),
        amount: parseFloat(amount),
      });
      return;
    }

    try {
      const orderSide = side === 'buy' ? OrderSide.BUY : OrderSide.SELL;

      const result = await darkpool.placeOrder(
        {
          side: orderSide,
          baseAsset: selectedAsset.id,
          quoteAsset: DEFAULT_QUOTE_ASSET,
          amount: parseFloat(amount),
          price: parseFloat(price.replace(/,/g, '')),
        },
        publicKey || '',
        programSource,
        false
      );

      console.log('Order placed:', result);

      onOrderPlaced?.({
        orderId: result.order.order_id || `order-${Date.now()}`,
        side,
        price: parseFloat(price.replace(/,/g, '')),
        amount: parseFloat(amount),
      });
    } catch (err) {
      console.error('Failed to place order:', err);
    }
  }, [side, price, amount, programSource, publicKey, darkpool, onOrderPlaced, selectedAsset]);

  const formatPrice = (value: string) => {
    const num = parseFloat(value.replace(/,/g, ''));
    if (isNaN(num)) return value;
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-mono text-xs uppercase tracking-widest text-paper/60">Trade</h2>
        <div className="flex items-center gap-1.5 text-[10px] font-mono text-q-green">
          <span className="w-1.5 h-1.5 rounded-full bg-q-green animate-pulse"></span>
          {connected ? 'CONNECTED' : 'MARKET_OPEN'}
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
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            onBlur={(e) => setPrice(formatPrice(e.target.value))}
            disabled={orderType === 'Market'}
            className="w-full bg-charcoal border border-paper/10 rounded py-2 px-3 font-mono text-sm text-paper outline-none focus:border-accent/50 transition-all disabled:opacity-50"
          />
        </div>

        <div>
          <label className="text-[10px] font-mono text-paper/40 uppercase tracking-wider mb-1 block">Amount</label>
          <div className="relative flex gap-2">
            <input
              type="text"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="flex-1 bg-charcoal border border-paper/10 rounded py-2 px-3 font-mono text-sm text-paper outline-none focus:border-accent/50 transition-all"
            />
            {/* Token Dropdown */}
            <div ref={dropdownRef} className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="h-full px-3 bg-charcoal border border-paper/10 rounded font-mono text-xs text-paper flex items-center gap-1.5 hover:border-accent/50 transition-all min-w-[90px] justify-between"
              >
                <span className="text-accent">{selectedAsset.symbol}</span>
                <ChevronDown size={12} className={`text-paper/40 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {isDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-ink border border-paper/20 rounded-lg shadow-xl z-50 overflow-hidden">
                  {TRADEABLE_ASSETS.map((asset) => (
                    <button
                      key={asset.id}
                      onClick={() => {
                        setSelectedAsset(asset);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full px-3 py-2 text-left font-mono text-xs flex items-center justify-between hover:bg-accent/10 transition-colors ${
                        selectedAsset.id === asset.id ? 'bg-accent/5 text-accent' : 'text-paper'
                      }`}
                    >
                      <span>{asset.symbol}</span>
                      <span className="text-paper/30 text-[10px]">{asset.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={() => { setAmount('10'); setSliderValue(100); }}
              className="px-2 text-[10px] font-mono text-accent hover:bg-accent/10 rounded transition-colors border border-paper/10"
            >
              MAX
            </button>
          </div>
        </div>

        {/* Range Slider */}
        <div className="py-1">
          <input
            type="range"
            min="0"
            max="100"
            value={sliderValue}
            onChange={handleSliderChange}
            className="w-full h-1 bg-paper/10 rounded appearance-none cursor-pointer accent-accent"
          />
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

      {/* Error Display */}
      {execError && (
        <div className="mt-2 p-2 bg-q-red/10 border border-q-red/30 rounded text-[10px] font-mono text-q-red">
          {execError}
        </div>
      )}

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={executing}
        className={`mt-4 w-full py-3 rounded-lg font-mono text-xs uppercase tracking-widest font-bold active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${side === 'buy' ? 'bg-q-green text-ink' : 'bg-q-red text-white'}`}
      >
        {executing ? (
          <>
            <Loader2 size={14} className="animate-spin" />
            Processing...
          </>
        ) : (
          <>
            {side === 'buy' ? `Buy ${selectedAsset.symbol}` : `Sell ${selectedAsset.symbol}`}
            <Zap size={14} fill="currentColor" />
          </>
        )}
      </button>

      {/* Order Summary */}
      <div className="mt-3 p-2 bg-charcoal/50 rounded text-[10px] font-mono text-paper/50">
        <div className="flex justify-between">
          <span>Pair</span>
          <span className="text-accent">{selectedAsset.symbol}/USDC</span>
        </div>
        <div className="flex justify-between mt-1">
          <span>Total</span>
          <span className="text-paper">
            ${(parseFloat(price.replace(/,/g, '')) * parseFloat(amount || '0')).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDC
          </span>
        </div>
        {isDarkPool && (
          <div className="flex justify-between mt-1 text-accent">
            <span>Execution</span>
            <span>HIDDEN</span>
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center justify-center gap-1.5 text-[10px] text-paper/30 font-mono">
        <RefreshCw size={10} />
        {executing ? 'EXECUTING...' : 'UPDATED_14MS'}
      </div>
    </div>
  );
};

export default OrderEntry;
