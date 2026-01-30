import React from 'react';
import { MOCK_ORDER_HISTORY } from '../constants';

const OrderHistory: React.FC = () => {
  return (
    <div className="w-full">
       <table className="w-full text-left">
          <thead>
              <tr className="text-[10px] font-bold text-q-muted uppercase tracking-wider">
                  <th className="pb-3 pl-4">Time</th>
                  <th className="pb-3">Symbol</th>
                  <th className="pb-3">Type</th>
                  <th className="pb-3 text-right">Side</th>
                  <th className="pb-3 text-right">Price</th>
                  <th className="pb-3 text-right">Amount</th>
                  <th className="pb-3 text-right">Status</th>
              </tr>
          </thead>
          <tbody>
              {MOCK_ORDER_HISTORY.map((order, i) => (
                  <tr key={i} className="text-sm font-medium border-t border-q-border/50 group hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="py-3 pl-4 text-q-muted font-mono text-xs">{order.time}</td>
                      <td className="py-3 text-q-text">{order.symbol}</td>
                      <td className="py-3 text-q-text">{order.type}</td>
                      <td className={`py-3 text-right font-bold uppercase text-xs ${order.side === 'buy' ? 'text-q-green' : 'text-q-red'}`}>
                        {order.side}
                      </td>
                      <td className="py-3 text-right font-mono text-q-text">{order.price.toFixed(2)}</td>
                      <td className="py-3 text-right font-mono text-q-text">
                        {order.filled}/{order.amount}
                      </td>
                      <td className="py-3 text-right pr-4">
                          <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide
                             ${order.status === 'Filled' ? 'bg-q-green/10 text-q-green' : 
                               order.status === 'Cancelled' ? 'bg-q-muted/10 text-q-muted' : 
                               'bg-yellow-500/10 text-yellow-500'}`}>
                              {order.status}
                          </span>
                      </td>
                  </tr>
              ))}
          </tbody>
       </table>
    </div>
  );
};

export default OrderHistory;