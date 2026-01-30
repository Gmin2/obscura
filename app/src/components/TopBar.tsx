import React from 'react';
import { DiamondIcon } from './Icons';

export const TopBar = () => {
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  
  return (
    <div className="w-full border-b border-grid bg-paper text-ink font-mono text-xs tracking-wider uppercase sticky top-0 z-50">
        <div className="max-w-7xl mx-auto border-l border-r border-grid">
            {/* Row 1: Timeline */}
            <div className="flex border-b border-grid h-12 items-center">
                <div className="w-16 sm:w-24 border-r border-grid flex items-center justify-center h-full text-ink/50 bg-paper">
                    026
                </div>
                {/* Scrollable container for months on mobile */}
                <div className="flex-1 flex justify-between px-4 sm:px-6 h-full items-center overflow-x-auto scrollbar-hide bg-paper">
                    <div className="flex justify-between w-full min-w-[300px] gap-4 sm:gap-0">
                        {months.map(m => (
                            <span key={m} className={m === 'FEB' ? 'text-ink font-bold' : 'text-ink/40'}>{m}</span>
                        ))}
                    </div>
                </div>
                <div className="w-16 sm:w-24 border-l border-grid flex items-center justify-center h-full text-ink/50 bg-paper">
                    027
                </div>
            </div>

            {/* Row 2: Performance Strip */}
            <div className="flex h-12 items-center px-4 sm:px-8 justify-between relative overflow-hidden bg-paper">
                <div className="flex items-center gap-4 sm:gap-12 font-bold font-sans tracking-wide text-sm whitespace-nowrap">
                    <span>PERFORMANCE</span>
                </div>
                
                {/* Dotted fill - hidden on very small screens */}
                <div className="flex-1 mx-4 sm:mx-8 opacity-40 overflow-hidden whitespace-nowrap text-[10px] tracking-[4px] hidden sm:block">
                    +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
                </div>

                <div className="flex items-center gap-4 sm:gap-8 text-sm">
                    <div className="flex items-center gap-2">
                         <span className="w-3 h-3 rotate-45 border border-current block" />
                         <span className="hidden sm:inline">Resolution rate</span>
                         <span className="sm:hidden">Res</span>
                    </div>
                    <div className="flex items-center gap-2">
                         <span className="w-3 h-3 rotate-45 bg-ink block" />
                         <span className="hidden sm:inline">Quality rate</span>
                         <span className="sm:hidden">Qual</span>
                    </div>
                </div>
            </div>
        </div>
        <style>{`
          .scrollbar-hide::-webkit-scrollbar {
              display: none;
          }
          .scrollbar-hide {
              -ms-overflow-style: none;
              scrollbar-width: none;
          }
        `}</style>
    </div>
  );
};