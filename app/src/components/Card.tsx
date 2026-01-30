import React from 'react';
import type { CardProps } from '../types';

export const Card: React.FC<CardProps> = ({ variant, number, title, description, icon }) => {
  const isAccent = variant === 'accent';
  
  const bgClass = isAccent ? 'bg-accent' : 'bg-paper';
  const textClass = 'text-ink';
  // Use a darker dot pattern for better contrast on cards
  const patternClass = 'bg-dot-pattern opacity-10'; 

  return (
    <div className={`flex flex-col h-full ${textClass}`}>
        
        {/* TOP SECTION: Header + Visual */}
        {/* We use flex-none to ensure the top part height is determined by content (square aspect ratio) 
            so that the 'waist' aligns across the grid row */}
        <div className={`flex flex-col gap-6 p-6 pb-8 ${bgClass} clip-chamfer-4`}>
            
            {/* Header Row */}
            <div className="flex justify-between items-baseline border-b border-ink/10 pb-4">
                <h3 className="text-3xl font-sans font-bold tracking-tight leading-none">
                    {title}
                </h3>
                <span className="font-mono text-xs tracking-widest opacity-50 font-semibold">{number}</span>
            </div>

            {/* Visual Box - Square Aspect Ratio */}
            <div className="relative aspect-square w-full border border-ink/5">
                {/* Background Pattern */}
                <div className={`absolute inset-0 ${patternClass}`} />

                {/* Corner Crop Marks (L-Shapes) - INSIDE the box */}
                {/* Top Left */}
                <div className="absolute top-2 left-2 w-3 h-3 border-t-[1.5px] border-l-[1.5px] border-ink" />
                {/* Top Right */}
                <div className="absolute top-2 right-2 w-3 h-3 border-t-[1.5px] border-r-[1.5px] border-ink" />
                {/* Bottom Left */}
                <div className="absolute bottom-2 left-2 w-3 h-3 border-b-[1.5px] border-l-[1.5px] border-ink" />
                {/* Bottom Right */}
                <div className="absolute bottom-2 right-2 w-3 h-3 border-b-[1.5px] border-r-[1.5px] border-ink" />

                {/* Centered Icon */}
                <div className="absolute inset-0 flex items-center justify-center p-8">
                     <div className="w-full h-full">
                        {icon}
                     </div>
                </div>
            </div>
        </div>

        {/* GAP for the 'waist' / diamond cutouts */}
        {/* A small gap creates the visual separation and allows the clipped corners to form the diamond shape */}
        <div className="h-[2px]" />

        {/* BOTTOM SECTION: Footer Text */}
        {/* flex-grow ensures all cards in the grid extend to the same bottom line */}
        <div className={`flex-grow p-6 flex justify-between items-center ${bgClass} clip-chamfer-4`}>
            <p className="font-sans text-base leading-snug font-medium max-w-[85%] pr-4">
                {description}
            </p>
            
            {/* Vertical Dots */}
            <div className="flex flex-col gap-2 justify-center opacity-100">
                <div className="w-[2px] h-[2px] bg-ink rounded-full" />
                <div className="w-[2px] h-[2px] bg-ink rounded-full" />
                <div className="w-[2px] h-[2px] bg-ink rounded-full" />
                <div className="w-[2px] h-[2px] bg-ink rounded-full" />
                <div className="w-[2px] h-[2px] bg-ink rounded-full" />
            </div>
        </div>

    </div>
  );
};