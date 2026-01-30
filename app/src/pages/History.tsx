import { useState, useMemo } from 'react';
import {
  Filter,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ExternalLink,
  FileText,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import AppTopBar from '../components/AppTopBar';
import { useWallet } from '@demox-labs/aleo-wallet-adapter-react';
import { useOrders, getAssetSymbol } from '../hooks/useDarkpool.ts';
import { OrderSide as ContractOrderSide } from '../aleo/types.ts';

type OrderStatus = 'filled' | 'cancelled' | 'pending' | 'partial';
type OrderSide = 'buy' | 'sell';
type OrderType = 'market' | 'limit' | 'stop';

interface DisplayOrder {
  id: string;
  pair: string;
  side: OrderSide;
  type: OrderType;
  price: number;
  amount: number;
  filled: number;
  total: number;
  status: OrderStatus;
  time: string;
  txHash?: string;
}

/** Mock orders for demo mode */
const MOCK_ORDERS: DisplayOrder[] = [
  { id: 'ORD-001', pair: 'ETH/USDC', side: 'buy', type: 'limit', price: 2950.00, amount: 2.5, filled: 2.5, total: 7375.00, status: 'filled', time: '2024-01-15 14:32:18', txHash: '0x1a2b...3c4d' },
  { id: 'ORD-002', pair: 'ALEO/USDC', side: 'sell', type: 'market', price: 0.82, amount: 5000, filled: 5000, total: 4100.00, status: 'filled', time: '2024-01-15 12:18:45', txHash: '0x5e6f...7g8h' },
  { id: 'ORD-003', pair: 'BTC/USDC', side: 'buy', type: 'limit', price: 43000.00, amount: 0.5, filled: 0.25, total: 10750.00, status: 'partial', time: '2024-01-15 10:05:22' },
  { id: 'ORD-004', pair: 'ETH/USDC', side: 'sell', type: 'limit', price: 85.00, amount: 50, filled: 0, total: 4250.00, status: 'cancelled', time: '2024-01-14 22:45:10' },
  { id: 'ORD-005', pair: 'ETH/USDC', side: 'buy', type: 'limit', price: 2900.00, amount: 1.0, filled: 0, total: 2900.00, status: 'pending', time: '2024-01-14 18:30:00' },
  { id: 'ORD-006', pair: 'ALEO/USDC', side: 'buy', type: 'market', price: 0.78, amount: 10000, filled: 10000, total: 7800.00, status: 'filled', time: '2024-01-14 15:22:33', txHash: '0x9i0j...1k2l' },
];

const STATUS_CONFIG = {
  filled: { icon: CheckCircle, color: 'text-q-green', bg: 'bg-q-green/10', label: 'Filled' },
  cancelled: { icon: XCircle, color: 'text-q-red', bg: 'bg-q-red/10', label: 'Cancelled' },
  pending: { icon: Clock, color: 'text-accent', bg: 'bg-accent/10', label: 'Pending' },
  partial: { icon: AlertCircle, color: 'text-yellow-400', bg: 'bg-yellow-400/10', label: 'Partial' },
};

function History() {
  const [filter, setFilter] = useState<'all' | OrderStatus>('all');
  const [sideFilter, setSideFilter] = useState<'all' | OrderSide>('all');

  const { connected } = useWallet();
  const { orders: realOrders, loading, refresh: refreshOrders } = useOrders();

  /** Convert contract orders to display format */
  const displayOrders = useMemo((): DisplayOrder[] => {
    if (!connected || realOrders.length === 0) {
      return MOCK_ORDERS;
    }

    return realOrders.map(order => {
      const baseSymbol = getAssetSymbol(order.baseAsset);
      const quoteSymbol = getAssetSymbol(order.quoteAsset);
      const filledPercent = order.amount > 0 ? order.filled / order.amount : 0;

      let status: OrderStatus = 'pending';
      if (filledPercent >= 1) status = 'filled';
      else if (filledPercent > 0) status = 'partial';

      return {
        id: order.orderId.slice(0, 12),
        pair: `${baseSymbol}/${quoteSymbol}`,
        side: order.side === ContractOrderSide.BUY ? 'buy' : 'sell',
        type: 'limit' as OrderType,
        price: order.price,
        amount: order.amount,
        filled: order.filled,
        total: order.amount * order.price,
        status,
        time: order.createdAt.toLocaleString(),
      };
    });
  }, [connected, realOrders]);

  const filteredOrders = displayOrders.filter(order => {
    if (filter !== 'all' && order.status !== filter) return false;
    if (sideFilter !== 'all' && order.side !== sideFilter) return false;
    return true;
  });

  const stats = {
    total: displayOrders.length,
    filled: displayOrders.filter(o => o.status === 'filled').length,
    volume: displayOrders.filter(o => o.status === 'filled').reduce((sum, o) => sum + o.total, 0),
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
      <AppTopBar searchPlaceholder="Search orders..." />

      {/* Main Content */}
      <main className="flex-1 flex flex-col gap-3 min-h-0 relative z-10">

        {/* Stats Bar */}
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-ink border border-paper/10 rounded-lg p-3">
            <span className="text-paper/40 text-[10px] font-mono uppercase tracking-wider">Status</span>
            <div className="flex items-center gap-2 mt-1">
              <span className={`w-2 h-2 rounded-full ${connected ? 'bg-q-green animate-pulse' : 'bg-paper/30'}`}></span>
              <span className={`font-mono text-sm ${connected ? 'text-q-green' : 'text-paper/50'}`}>
                {connected ? 'LIVE' : 'DEMO'}
              </span>
            </div>
          </div>
          <div className="bg-ink border border-paper/10 rounded-lg p-3">
            <span className="text-paper/40 text-[10px] font-mono uppercase tracking-wider">Total Orders</span>
            <div className="font-serif text-2xl text-paper mt-1">{stats.total}</div>
          </div>
          <div className="bg-ink border border-paper/10 rounded-lg p-3">
            <span className="text-paper/40 text-[10px] font-mono uppercase tracking-wider">Filled Orders</span>
            <div className="font-serif text-2xl text-q-green mt-1">{stats.filled}</div>
          </div>
          <div className="bg-ink border border-paper/10 rounded-lg p-3">
            <span className="text-paper/40 text-[10px] font-mono uppercase tracking-wider">Total Volume</span>
            <div className="font-serif text-2xl text-paper mt-1">${stats.volume.toLocaleString()}</div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-ink border border-paper/10 rounded-lg flex-1 flex flex-col overflow-hidden">
          {/* Filters Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-paper/10">
            <div className="flex items-center gap-4">
              <h2 className="font-serif text-lg text-paper">Order History</h2>

              {/* Status Filter */}
              <div className="flex items-center gap-1 bg-charcoal rounded p-0.5">
                {(['all', 'filled', 'pending', 'partial', 'cancelled'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilter(status)}
                    className={`px-2 py-1 rounded font-mono text-[10px] uppercase transition-colors ${
                      filter === status
                        ? 'bg-accent text-ink'
                        : 'text-paper/50 hover:text-paper'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>

              {/* Side Filter */}
              <div className="flex items-center gap-1 bg-charcoal rounded p-0.5">
                {(['all', 'buy', 'sell'] as const).map((side) => (
                  <button
                    key={side}
                    onClick={() => setSideFilter(side)}
                    className={`px-2 py-1 rounded font-mono text-[10px] uppercase transition-colors ${
                      sideFilter === side
                        ? side === 'buy' ? 'bg-q-green text-ink' : side === 'sell' ? 'bg-q-red text-ink' : 'bg-accent text-ink'
                        : 'text-paper/50 hover:text-paper'
                    }`}
                  >
                    {side}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => refreshOrders()}
                disabled={loading}
                className="flex items-center gap-1.5 text-paper/50 hover:text-paper text-xs font-mono transition-colors disabled:opacity-50"
              >
                {loading ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
                {loading ? 'Loading...' : 'Refresh'}
              </button>
              <button className="flex items-center gap-1.5 text-paper/50 hover:text-paper text-xs font-mono transition-colors">
                <Filter size={12} /> Filter
              </button>
              <button className="flex items-center gap-1.5 text-paper/50 hover:text-paper text-xs font-mono transition-colors">
                <Download size={12} /> Export
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-auto">
            <table className="w-full">
              <thead className="sticky top-0 bg-ink">
                <tr className="text-paper/40 text-[10px] font-mono uppercase tracking-wider">
                  <th className="text-left py-2 px-4 font-normal">Order ID</th>
                  <th className="text-left py-2 px-4 font-normal">Pair</th>
                  <th className="text-left py-2 px-4 font-normal">Type</th>
                  <th className="text-left py-2 px-4 font-normal">Side</th>
                  <th className="text-right py-2 px-4 font-normal">Price</th>
                  <th className="text-right py-2 px-4 font-normal">Amount</th>
                  <th className="text-right py-2 px-4 font-normal">Filled</th>
                  <th className="text-right py-2 px-4 font-normal">Total</th>
                  <th className="text-center py-2 px-4 font-normal">Status</th>
                  <th className="text-left py-2 px-4 font-normal">Time</th>
                  <th className="text-center py-2 px-4 font-normal">Tx</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => {
                  const statusConfig = STATUS_CONFIG[order.status];
                  const StatusIcon = statusConfig.icon;
                  return (
                    <tr key={order.id} className="border-t border-paper/5 hover:bg-paper/5 transition-colors">
                      <td className="py-3 px-4 font-mono text-xs text-paper/70">{order.id}</td>
                      <td className="py-3 px-4 font-mono text-sm text-paper">{order.pair}</td>
                      <td className="py-3 px-4">
                        <span className="font-mono text-[10px] uppercase text-paper/50 bg-paper/10 px-1.5 py-0.5 rounded">
                          {order.type}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`flex items-center gap-1 font-mono text-xs uppercase ${order.side === 'buy' ? 'text-q-green' : 'text-q-red'}`}>
                          {order.side === 'buy' ? <ArrowDownRight size={12} /> : <ArrowUpRight size={12} />}
                          {order.side}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-sm text-paper">
                        ${order.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-sm text-paper/70">
                        {order.amount.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-sm text-paper/70">
                        {order.filled.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-sm text-paper">
                        ${order.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4">
                        <div className={`flex items-center justify-center gap-1 ${statusConfig.color} ${statusConfig.bg} px-2 py-1 rounded text-[10px] font-mono uppercase`}>
                          <StatusIcon size={10} />
                          {statusConfig.label}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-[10px] text-paper/50">{order.time}</td>
                      <td className="py-3 px-4 text-center">
                        {order.txHash ? (
                          <button className="text-accent hover:text-accent/80 transition-colors">
                            <ExternalLink size={12} />
                          </button>
                        ) : (
                          <span className="text-paper/20">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filteredOrders.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-paper/40">
                <FileText size={32} className="mb-2" />
                <span className="font-mono text-sm">No orders found</span>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default History;
