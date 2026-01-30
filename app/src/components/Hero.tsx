import { Link } from 'react-router-dom';
import { Hero3D } from './Hero3D';

export const Hero = () => {
  return (
    <div className="relative mt-8 mb-16">
      <div className="clip-chamfer-lg bg-paper text-ink p-1">
        <div className="clip-chamfer-md border border-ink/10 bg-paper p-6 md:p-16 min-h-[600px] flex flex-col lg:flex-row relative overflow-hidden">
          
          {/* Background Grid */}
          <div className="absolute inset-0 bg-dot-pattern opacity-10 pointer-events-none" />

          {/* Left Column: Typography */}
          <div className="relative z-10 w-full lg:w-1/2 flex flex-col justify-center pr-0 lg:pr-12 pt-8 lg:pt-0">
             <div className="flex items-center gap-4 mb-8">
                <div className="h-px w-8 bg-accent" />
                <span className="font-mono text-xs tracking-[0.2em] uppercase font-bold text-accent">Zero-Knowledge Dark Pool</span>
             </div>

             <h1 className="font-serif text-5xl sm:text-7xl lg:text-8xl leading-[0.85] tracking-tight mb-8">
               Private<br />Trading
             </h1>

             <p className="font-sans text-lg sm:text-xl lg:text-2xl leading-relaxed font-medium opacity-80 max-w-md mb-12">
               Trade on Aleo with complete privacy. Your orders, prices, and amounts stay encrypted — verified by zero-knowledge proofs.
             </p>

             <div className="flex flex-col sm:flex-row gap-4">
               {/* Primary Button */}
               <Link to="/terminal" className="relative group bg-ink text-paper px-8 py-4 font-mono text-sm uppercase tracking-wider font-bold clip-chamfer-sm overflow-hidden transition-transform active:scale-95 text-center">
                 <span className="relative z-10">Launch App</span>
                 <div className="absolute inset-0 bg-accent translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out" />
               </Link>

               {/* Secondary Button - Fixed Chamfer Outline */}
               <Link to="/docs" className="group relative w-auto inline-flex items-center justify-center font-mono text-sm uppercase tracking-wider font-bold text-ink transition-transform active:scale-95">
                 {/* Outer container provides the border color (Ink) */}
                 <div className="absolute inset-0 bg-ink clip-chamfer-sm"></div>
                 {/* Inner container provides the background color (Paper) and creates the 'border' thickness */}
                 <div className="absolute inset-[2px] bg-paper clip-chamfer-sm group-hover:bg-ink transition-colors duration-300"></div>
                 {/* Text Content */}
                 <span className="relative z-10 px-8 py-4 group-hover:text-paper transition-colors duration-300">View Docs</span>
               </Link>
             </div>
          </div>

          {/* Right Column: Visual Schematic */}
          <div className="relative w-full lg:w-1/2 mt-16 lg:mt-0 flex items-center justify-center min-h-[400px]">
             <div className="w-full max-w-md aspect-square relative">
                {/* Outer Frame with Techncial Markings */}
                <div className="absolute inset-0 border border-ink/20 clip-chamfer-md">
                   {/* Axis Ticks */}
                   <div className="absolute top-1/2 -left-2 w-4 h-px bg-ink/30" />
                   <div className="absolute top-1/2 -right-2 w-4 h-px bg-ink/30" />
                   <div className="absolute left-1/2 -top-2 w-px h-4 bg-ink/30" />
                   <div className="absolute left-1/2 -bottom-2 w-px h-4 bg-ink/30" />
                </div>
                
                {/* Inner Frame */}
                <div className="absolute inset-8 border border-ink/10 clip-chamfer-md" />
                
                {/* Corner Markers */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-ink" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-ink" />
                <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-ink/40" />
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-ink/40" />
                
                {/* Central Schematic Animation */}
                <div className="absolute inset-0 flex items-center justify-center">
                   <div className="relative w-64 h-64 sm:w-80 sm:h-80">
                      
                      {/* Ring 1: Slow Rotate */}
                      <div className="absolute inset-0 rounded-full border border-ink/10 animate-[spin_20s_linear_infinite]" />
                      
                      {/* Ring 2: Medium Counter-Rotate Dashed */}
                      <div className="absolute inset-4 sm:inset-8 rounded-full border border-dashed border-ink/30 animate-[spin_15s_linear_infinite_reverse]" />
                      
                      {/* Ring 3: Fast Rotate with Gap */}
                      <div className="absolute inset-12 sm:inset-16 rounded-full border-2 border-transparent border-t-ink/60 border-l-ink/60 animate-[spin_3s_linear_infinite]" />
                      
                      {/* Scanner Effect */}
                      <div className="absolute inset-0 overflow-hidden rounded-full opacity-20 pointer-events-none">
                         <div className="w-full h-1/2 bg-gradient-to-b from-transparent to-ink/20 animate-[scan_3s_ease-in-out_infinite]" />
                      </div>

                      {/* 3D Core Element - Placed inside the rings */}
                      <div className="absolute inset-0 m-auto w-48 h-48 sm:w-64 sm:h-64 flex items-center justify-center z-10">
                         <Hero3D />
                      </div>

                      {/* Floating Technical Labels */}
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-paper px-2 font-mono text-[10px] border border-ink tracking-widest">ZK_PROOF</div>
                      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-paper px-2 font-mono text-[10px] border border-ink tracking-widest text-accent animate-pulse">CHAIN_SYNC</div>

                      {/* Corner Labels */}
                      <div className="absolute top-2 left-2 font-mono text-[9px] text-ink/40">PRIVATE</div>
                      <div className="absolute top-2 right-2 font-mono text-[9px] text-ink/40">VERIFIED</div>
                      <div className="absolute bottom-2 left-2 font-mono text-[9px] text-ink/40">ENCRYPTED</div>
                      <div className="absolute bottom-2 right-2 font-mono text-[9px] text-ink/40">ALEO_NET</div>
                      
                      {/* Data Stream Lines */}
                      <div className="absolute top-1/2 -right-12 w-12 h-px bg-ink/20" />
                      <div className="absolute top-1/2 -left-12 w-12 h-px bg-ink/20" />
                   </div>
                </div>
             </div>
          </div>
          
        </div>
      </div>
      <style>{`
        @keyframes scan {
            0%, 100% { transform: translateY(-100%); }
            50% { transform: translateY(100%); }
        }
      `}</style>
    </div>
  );
};
