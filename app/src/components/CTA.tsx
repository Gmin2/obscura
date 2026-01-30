export const CTA = () => {
  return (
    <div className="py-24 border-t border-grid relative overflow-hidden bg-accent text-ink selection:bg-ink selection:text-paper">

      {/* Background Texture */}
      <div className="absolute inset-0 opacity-10"
           style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-12">

            {/* Typography */}
            <div className="max-w-3xl">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-3 h-3 bg-ink animate-pulse" />
                    <span className="font-mono text-xs uppercase tracking-[0.3em] font-bold">Ready_To_Trade</span>
                </div>
                <h2 className="font-serif text-6xl md:text-8xl lg:text-9xl leading-[0.85] tracking-tighter mb-8">
                    Enter the<br/>Dark Pool
                </h2>
                <p className="font-sans text-xl font-medium max-w-xl border-l-2 border-ink/20 pl-6 leading-relaxed">
                    Start trading with complete privacy. Your orders are encrypted, your strategy stays hidden.
                </p>
            </div>

            {/* Action Area */}
            <div className="w-full lg:w-auto flex flex-col items-start gap-4">
                <div className="font-mono text-[10px] uppercase opacity-60 tracking-widest mb-2">
                    Connect wallet to begin...
                </div>

                <a href="/terminal" className="relative group w-full sm:w-auto min-w-[300px] h-20 bg-ink text-paper clip-chamfer-md flex items-center justify-between px-8 transition-transform hover:-translate-y-1 active:translate-y-0">
                    <span className="font-mono text-xl tracking-wider font-bold">START TRADING</span>
                    <span className="w-8 h-8 border border-paper/30 flex items-center justify-center group-hover:bg-accent group-hover:text-ink group-hover:border-transparent transition-colors">
                        →
                    </span>
                </a>

                <div className="flex gap-8 mt-4 font-mono text-xs border-t border-ink/20 pt-4 w-full">
                    <span>TESTNET_LIVE</span>
                    <span>NO_KYC_REQUIRED</span>
                </div>
            </div>

        </div>
      </div>

      {/* Decorative large marquee text moving slowly in background */}
      <div className="absolute -bottom-12 left-0 w-full overflow-hidden pointer-events-none opacity-5">
         <div className="whitespace-nowrap font-mono text-9xl font-bold tracking-tighter animate-[marquee_20s_linear_infinite]">
            PRIVACY FIRST // ZERO KNOWLEDGE // PRIVACY FIRST // ZERO KNOWLEDGE //
         </div>
      </div>
      <style>{`
        @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
};
