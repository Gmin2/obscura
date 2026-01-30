import { useState, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Eye,
  EyeOff,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  PieChart,
  RefreshCw,
  Loader2
} from 'lucide-react';
import AppTopBar from '../components/AppTopBar';
import { useWallet } from '@demox-labs/aleo-wallet-adapter-react';
import { useTokens, useTradeHistory, getAssetSymbol, ASSETS } from '../hooks/useDarkpool.ts';

/** Mock prices for demo mode */
const MOCK_PRICES: Record<string, number> = {
  ETH: 2974.18,
  BTC: 43612.00,
  ALEO: 0.80,
  USDC: 1.00,
};

/** Mock holdings for demo mode */
const MOCK_HOLDINGS = [
  { symbol: 'ETH', name: 'Ethereum', amount: 12.5847, value: 37425.82, change: 2.34, price: 2974.18 },
  { symbol: 'BTC', name: 'Bitcoin', amount: 0.8234, value: 35892.45, change: -0.87, price: 43612.00 },
  { symbol: 'ALEO', name: 'Aleo', amount: 15420.00, value: 12336.00, change: 5.21, price: 0.80 },
  { symbol: 'USDC', name: 'USD Coin', amount: 8500.00, value: 8500.00, change: 0.00, price: 1.00 },
];

const MOCK_ACTIVITY = [
  { type: 'deposit', asset: 'ETH', amount: 2.5, time: '2 hours ago', status: 'completed' },
  { type: 'trade', asset: 'ALEO', amount: 5000, time: '5 hours ago', status: 'completed' },
  { type: 'withdraw', asset: 'USDC', amount: 1500, time: '1 day ago', status: 'completed' },
  { type: 'trade', asset: 'BTC', amount: 0.15, time: '2 days ago', status: 'completed' },
];

function Portfolio() {
  const [showBalance, setShowBalance] = useState(true);
  const [activeTab, setActiveTab] = useState<'holdings' | 'activity'>('holdings');

  /** Get wallet connection state */
  const { publicKey, connected } = useWallet();

  /** Get real token holdings */
  const { tokens, loading: tokensLoading, refresh: refreshTokens } = useTokens();
  const { trades, loading: tradesLoading } = useTradeHistory();

  /** Convert real tokens to holdings format */
  const holdings = useMemo(() => {
    if (!connected || tokens.length === 0) {
      return MOCK_HOLDINGS;
    }

    /** Aggregate tokens by asset */
    const assetMap = new Map<string, number>();
    tokens.forEach(token => {
      const symbol = getAssetSymbol(token.assetId);
      assetMap.set(symbol, (assetMap.get(symbol) || 0) + token.amount);
    });

    return Array.from(assetMap.entries()).map(([symbol, amount]) => {
      const price = MOCK_PRICES[symbol] || 1;
      const assetConfig = Object.values(ASSETS).find(a => a.symbol === symbol);
      return {
        symbol,
        name: assetConfig?.name || symbol,
        amount,
        value: amount * price,
        change: Math.random() * 10 - 5, // TODO: Get real price change
        price,
      };
    });
  }, [connected, tokens]);

  /** Convert trades to activity format */
  const recentActivity = useMemo(() => {
    if (!connected || trades.length === 0) {
      return MOCK_ACTIVITY;
    }

    return trades.slice(0, 10).map(trade => ({
      type: 'trade' as const,
      asset: 'ETH', // TODO: Get from trade
      amount: trade.amount,
      time: formatTimeAgo(trade.timestamp),
      status: 'completed' as const,
    }));
  }, [connected, trades]);

  const totalValue = holdings.reduce((sum, h) => sum + h.value, 0);
  const totalChange = 2.18;

  const loading = tokensLoading || tradesLoading;

  /** Format time ago */
  const formatTimeAgo = (date: Date): string => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hours ago`;
    const days = Math.floor(hours / 24);
    return `${days} days ago`;
  };

  /** Format wallet address for display */
  const formatAddress = (addr: string) => {
    if (addr.length <= 20) return addr;
    return `${addr.slice(0, 12)}...${addr.slice(-8)}`;
  };

  return (
    <div className="h-screen w-full bg-charcoal p-3 font-sans text-paper overflow-hidden flex flex-col gap-2 relative">

      {/* Dotted Grid Background */}
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-20"
        style={{
          backgroundImage: 'radial-gradient(#555 1px, transparent 1px)',
          backgroundSize: '16px 16px'
        }}
      />

      {/* Navigation Header */}
      <AppTopBar />

      {/* Main Content */}
      <main className="flex-1 grid grid-cols-12 gap-3 min-h-0 relative z-10">

        {/* Left Column: Portfolio Overview */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-3 min-h-0">

          {/* Balance Card */}
          <div className="bg-ink border border-paper/10 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-paper/50 text-xs font-mono uppercase tracking-wider">Total Balance</span>
                  <button
                    onClick={() => setShowBalance(!showBalance)}
                    className="text-paper/40 hover:text-paper transition-colors"
                  >
                    {showBalance ? <Eye size={14} /> : <EyeOff size={14} />}
                  </button>
                </div>
                <div className="flex items-baseline gap-3">
                  <span className="font-serif text-3xl text-paper">
                    {showBalance ? `$${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '••••••••'}
                  </span>
                  <span className={`flex items-center gap-1 text-sm font-mono ${totalChange >= 0 ? 'text-q-green' : 'text-q-red'}`}>
                    {totalChange >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                    {totalChange >= 0 ? '+' : ''}{totalChange}%
                  </span>
                </div>
                <span className="text-paper/40 text-xs font-mono">24h change</span>
              </div>

              <div className="flex gap-2">
                <button className="bg-accent text-ink px-4 py-2 rounded font-mono text-xs uppercase tracking-wider flex items-center gap-2 hover:bg-accent/90 transition-colors">
                  <ArrowUpRight size={14} /> Deposit
                </button>
                <button className="bg-paper/10 text-paper px-4 py-2 rounded font-mono text-xs uppercase tracking-wider flex items-center gap-2 hover:bg-paper/20 transition-colors">
                  <ArrowDownRight size={14} /> Withdraw
                </button>
              </div>
            </div>
          </div>

          {/* Holdings Table */}
          <div className="bg-ink border border-paper/10 rounded-lg flex-1 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-paper/10">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setActiveTab('holdings')}
                  className={`font-mono text-xs uppercase tracking-wider transition-colors relative ${activeTab === 'holdings' ? 'text-accent' : 'text-paper/40 hover:text-paper'}`}
                >
                  Holdings
                  {activeTab === 'holdings' && <div className="absolute -bottom-3 left-0 right-0 h-0.5 bg-accent"></div>}
                </button>
                <button
                  onClick={() => setActiveTab('activity')}
                  className={`font-mono text-xs uppercase tracking-wider transition-colors relative ${activeTab === 'activity' ? 'text-accent' : 'text-paper/40 hover:text-paper'}`}
                >
                  Recent Activity
                  {activeTab === 'activity' && <div className="absolute -bottom-3 left-0 right-0 h-0.5 bg-accent"></div>}
                </button>
              </div>
              <button
                onClick={() => refreshTokens()}
                className="text-paper/40 hover:text-paper transition-colors"
                disabled={loading}
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
              </button>
            </div>

            <div className="flex-1 overflow-auto">
              {activeTab === 'holdings' ? (
                <table className="w-full">
                  <thead className="sticky top-0 bg-ink">
                    <tr className="text-paper/40 text-[10px] font-mono uppercase tracking-wider">
                      <th className="text-left py-2 px-4 font-normal">Asset</th>
                      <th className="text-right py-2 px-4 font-normal">Price</th>
                      <th className="text-right py-2 px-4 font-normal">Holdings</th>
                      <th className="text-right py-2 px-4 font-normal">Value</th>
                      <th className="text-right py-2 px-4 font-normal">24h</th>
                    </tr>
                  </thead>
                  <tbody>
                    {holdings.map((holding) => (
                      <tr key={holding.symbol} className="border-t border-paper/5 hover:bg-paper/5 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-paper/10 flex items-center justify-center">
                              <span className="font-mono text-xs text-accent">{holding.symbol.charAt(0)}</span>
                            </div>
                            <div>
                              <div className="font-mono text-sm text-paper">{holding.symbol}</div>
                              <div className="text-[10px] text-paper/40">{holding.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-sm text-paper">
                          ${holding.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-sm text-paper/70">
                          {holding.amount.toLocaleString('en-US', { maximumFractionDigits: 4 })}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-sm text-paper">
                          ${holding.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                        <td className={`py-3 px-4 text-right font-mono text-sm ${holding.change >= 0 ? 'text-q-green' : 'text-q-red'}`}>
                          {holding.change >= 0 ? '+' : ''}{holding.change}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-4 space-y-2">
                  {recentActivity.map((activity, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-paper/5 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          activity.type === 'deposit' ? 'bg-q-green/10 text-q-green' :
                          activity.type === 'withdraw' ? 'bg-q-red/10 text-q-red' :
                          'bg-accent/10 text-accent'
                        }`}>
                          {activity.type === 'deposit' ? <ArrowDownRight size={16} /> :
                           activity.type === 'withdraw' ? <ArrowUpRight size={16} /> :
                           <RefreshCw size={16} />}
                        </div>
                        <div>
                          <div className="font-mono text-sm text-paper capitalize">{activity.type}</div>
                          <div className="text-[10px] text-paper/40">{activity.time}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-sm text-paper">{activity.amount} {activity.asset}</div>
                        <div className="text-[10px] text-q-green capitalize">{activity.status}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Stats & Quick Actions */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-3 min-h-0">

          {/* Portfolio Allocation */}
          <div className="bg-ink border border-paper/10 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-4">
              <PieChart size={14} className="text-accent" />
              <span className="font-mono text-xs uppercase tracking-wider text-paper/50">Allocation</span>
            </div>
            <div className="space-y-3">
              {holdings.map((holding) => {
                const percentage = (holding.value / totalValue) * 100;
                return (
                  <div key={holding.symbol}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-xs text-paper">{holding.symbol}</span>
                      <span className="font-mono text-xs text-paper/50">{percentage.toFixed(1)}%</span>
                    </div>
                    <div className="h-1.5 bg-paper/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-accent rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Wallet Info */}
          <div className="bg-ink border border-paper/10 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-4">
              <Wallet size={14} className="text-accent" />
              <span className="font-mono text-xs uppercase tracking-wider text-paper/50">Connected Wallet</span>
            </div>
            <div className="bg-paper/5 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-paper/40 font-mono">Aleo Address</span>
                <span className={`text-[10px] font-mono ${connected ? 'text-q-green' : 'text-paper/40'}`}>
                  {connected ? 'Connected' : 'Not Connected'}
                </span>
              </div>
              <div className="font-mono text-xs text-paper break-all">
                {connected && publicKey ? formatAddress(publicKey) : 'Connect wallet to view'}
              </div>
            </div>
            <button className="w-full mt-3 bg-paper/10 text-paper py-2 rounded font-mono text-xs uppercase tracking-wider hover:bg-paper/20 transition-colors">
              Manage Wallets
            </button>
          </div>

          {/* Quick Stats */}
          <div className="bg-ink border border-paper/10 rounded-lg p-4 flex-1">
            <span className="font-mono text-xs uppercase tracking-wider text-paper/50">Quick Stats</span>
            <div className="mt-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-paper/50">Total Trades</span>
                <span className="font-mono text-sm text-paper">247</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-paper/50">Win Rate</span>
                <span className="font-mono text-sm text-q-green">68.4%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-paper/50">Avg. Trade Size</span>
                <span className="font-mono text-sm text-paper">$1,245</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-paper/50">Total P&L</span>
                <span className="font-mono text-sm text-q-green">+$12,847</span>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

export default Portfolio;
