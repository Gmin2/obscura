import React from 'react';
import { MOCK_POSITIONS } from '../constants';

const PositionsTable: React.FC = () => {
  return (
    <div className="w-full">
       <table className="w-full text-left">
          <thead>
              <tr className="text-[10px] font-bold text-q-muted uppercase tracking-wider">
                  <th className="pb-3 pl-4">Asset</th>
                  <th className="pb-3 text-right">Size</th>
                  <th className="pb-3 text-right">Value</th>
                  <th className="pb-3 text-right">Entry</th>
                  <th className="pb-3 text-right">PnL</th>
                  <th className="pb-3 text-right pr-4">Action</th>
              </tr>
          </thead>
          <tbody>
              {MOCK_POSITIONS.map((pos, i) => (
                  <tr key={i} className="text-sm font-medium border-t border-q-border/50 group hover:bg-gray-50 transition-colors">
                      <td className="py-3 pl-4">
                          <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold">Ξ</div>
                              <span className="text-q-text">{pos.symbol}</span>
                              <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-md font-bold">{pos.leverage}x</span>
                          </div>
                      </td>
                      <td className="py-3 text-right font-mono text-q-green">{pos.size.toFixed(2)}</td>
                      <td className="py-3 text-right font-mono text-q-text">{(pos.size * pos.markPrice).toLocaleString('en-US', {style:'currency', currency:'USD'})}</td>
                      <td className="py-3 text-right font-mono text-q-muted">{pos.entryPrice.toLocaleString()}</td>
                      <td className="py-3 text-right">
                          <div className="font-mono text-q-red font-bold">{pos.pnl.toFixed(2)}</div>
                          <div className="text-[10px] text-q-red font-mono">{pos.pnlPercent}%</div>
                      </td>
                      <td className="py-3 text-right pr-4">
                          <button className="text-xs font-bold text-q-black bg-white border border-q-border shadow-sm px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-all">
                              Close
                          </button>
                      </td>
                  </tr>
              ))}
          </tbody>
       </table>
    </div>
  );
};

export default PositionsTable;