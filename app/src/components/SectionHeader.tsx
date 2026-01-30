import React from 'react';
import { DiamondIcon } from './Icons';

export const SectionHeader = ({ title }: { title: string }) => {
  return (
    <div className="relative flex items-center h-16 border-y border-grid my-8">
       {/* Left Icon Container */}
       <div className="w-16 h-full border-r border-grid flex items-center justify-center">
         <DiamondIcon />
       </div>
       
       {/* Text */}
       <div className="px-6 font-mono text-sm uppercase tracking-widest text-paper">
         {title}
       </div>
       
       {/* Dotted Line filler */}
       <div className="flex-1 text-grid/50 overflow-hidden whitespace-nowrap text-xs select-none">
         +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
       </div>
    </div>
  );
};
