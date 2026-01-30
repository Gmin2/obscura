import { IconGlobeAbstract } from './Icons';

export const Infrastructure = () => {
  return (
    <div className="mt-0 py-24 relative border-t border-grid">
        
        {/* Dark Section Background */}
        <div className="absolute inset-0 bg-charcoal z-0">
             <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row mb-20 gap-12">
                <div className="md:w-1/2">
                    <h2 className="font-serif text-5xl md:text-7xl text-paper mb-6">
                        Global Edge<br/>Infrastructure
                    </h2>
                    <p className="font-sans text-paper/60 text-lg max-w-md">
                        Deployed on 34 regions worldwide. Zero-cold-start architecture ensures your agents are always online, everywhere.
                    </p>
                </div>
                <div className="md:w-1/2 flex items-end justify-end">
                    <div className="font-mono text-xs text-accent text-right border border-grid p-4 bg-ink/50 clip-chamfer-sm">
                        <div className="flex justify-between gap-8 mb-1"><span>STATUS:</span> <span className="text-paper">OPERATIONAL</span></div>
                        <div className="flex justify-between gap-8 mb-1"><span>LATENCY_CHECK:</span> <span className="text-paper">PASS</span></div>
                        <div className="flex justify-between gap-8"><span>REGION:</span> <span className="text-paper">US_EAST_1</span></div>
                    </div>
                </div>
            </div>

            {/* Visual Content - Grid with Stretch Items */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
                
                {/* Large Map Visual (Left - 2 Cols) */}
                <div className="lg:col-span-2 bg-ink clip-chamfer-md border border-grid p-8 min-h-[500px] flex items-center justify-center relative overflow-hidden group">
                    <div className="absolute inset-0 opacity-20 pointer-events-none">
                         {/* Scanlines */}
                         <div className="w-full h-full bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[size:100%_4px]" />
                    </div>
                    
                    {/* Abstract Globe */}
                    <div className="w-full h-full max-w-[500px] max-h-[500px] text-paper opacity-80 transition-opacity duration-700 group-hover:opacity-100">
                        <IconGlobeAbstract />
                    </div>

                    <div className="absolute bottom-4 left-4 font-mono text-[10px] text-paper/40 border border-paper/20 px-2 py-1">
                        FIG 04.2 // NODE_MAP
                    </div>
                    
                    <div className="absolute top-4 right-4 flex gap-1">
                        <div className="w-1 h-1 bg-accent rounded-full animate-pulse" />
                        <div className="w-1 h-1 bg-paper/20 rounded-full" />
                        <div className="w-1 h-1 bg-paper/20 rounded-full" />
                    </div>
                </div>

                {/* Specs Rack (Right - 1 Col) - Designed as physical server blades */}
                <div className="flex flex-col h-full gap-2">
                    
                    {/* Module 1: API Response - Blade Unit */}
                    <div className="flex-1 bg-ink/40 border border-grid clip-chamfer-sm p-6 relative overflow-hidden group hover:bg-ink/60 transition-colors">
                        {/* Rack Handle visuals */}
                        <div className="absolute left-0 top-0 bottom-0 w-2 bg-grid/50 flex flex-col justify-center gap-1 items-center py-4">
                            <div className="w-1 h-1 bg-paper/20 rounded-full" />
                            <div className="w-1 h-1 bg-paper/20 rounded-full" />
                            <div className="w-1 h-full bg-paper/5" />
                        </div>
                        
                        <div className="pl-6 flex flex-col justify-between h-full">
                            <div className="flex justify-between items-start">
                                <span className="font-mono text-[10px] uppercase tracking-widest text-paper/40 bg-ink px-1 border border-grid">UNIT_01</span>
                                <div className="flex gap-1.5">
                                    <div className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse shadow-[0_0_8px_#F25C33]" />
                                    <div className="w-1.5 h-1.5 bg-accent/20 rounded-full" />
                                </div>
                            </div>
                            
                            <div className="mt-4">
                                <div className="font-serif text-5xl text-paper mb-1 group-hover:translate-x-1 transition-transform">&lt;50ms</div>
                                <div className="font-mono text-xs text-accent flex items-center gap-2">
                                    <span className="w-2 h-px bg-accent"></span>
                                    Global API Latency
                                </div>
                            </div>
                            
                            {/* Decorative Ports */}
                            <div className="mt-auto pt-4 flex gap-2 opacity-30">
                                <div className="w-8 h-4 border border-paper/40 rounded-sm" />
                                <div className="w-8 h-4 border border-paper/40 rounded-sm" />
                                <div className="w-4 h-4 border border-paper/40 rounded-full" />
                            </div>
                        </div>
                    </div>

                    {/* Module 2: Redundancy - Blade Unit */}
                    <div className="flex-1 bg-ink/40 border border-grid clip-chamfer-sm p-6 relative overflow-hidden group hover:bg-ink/60 transition-colors">
                        <div className="absolute left-0 top-0 bottom-0 w-2 bg-grid/50 flex flex-col justify-center gap-1 items-center py-4">
                            <div className="w-1 h-1 bg-paper/20 rounded-full" />
                            <div className="w-1 h-1 bg-paper/20 rounded-full" />
                            <div className="w-1 h-full bg-paper/5" />
                        </div>
                        
                        <div className="pl-6 flex flex-col justify-between h-full">
                             <div className="flex justify-between items-start">
                                <span className="font-mono text-[10px] uppercase tracking-widest text-paper/40 bg-ink px-1 border border-grid">UNIT_02</span>
                                <div className="flex gap-1">
                                     <div className="w-1 h-3 bg-paper/60" />
                                     <div className="w-1 h-3 bg-paper/60" />
                                     <div className="w-1 h-3 bg-paper/20" />
                                </div>
                            </div>
                            
                            <div className="mt-4">
                                <div className="font-serif text-4xl text-paper mb-1 group-hover:translate-x-1 transition-transform">Multi-Zone</div>
                                <div className="font-mono text-xs text-paper/60">Auto-Failover Ready</div>
                            </div>
                        </div>
                    </div>

                    {/* Module 3: Security - Blade Unit */}
                    <div className="flex-1 bg-ink/40 border border-grid clip-chamfer-sm p-6 relative overflow-hidden group hover:bg-ink/60 transition-colors">
                        <div className="absolute left-0 top-0 bottom-0 w-2 bg-grid/50 flex flex-col justify-center gap-1 items-center py-4">
                             <div className="w-1 h-1 bg-paper/20 rounded-full" />
                             <div className="w-1 h-1 bg-paper/20 rounded-full" />
                             <div className="w-1 h-full bg-paper/5" />
                        </div>
                        
                        <div className="pl-6 flex flex-col justify-between h-full">
                             <div className="flex justify-between items-start">
                                <span className="font-mono text-[10px] uppercase tracking-widest text-paper/40 bg-ink px-1 border border-grid">UNIT_03</span>
                                <div className="font-mono text-[9px] text-paper/40 border border-paper/10 px-1 rounded-sm">LOCKED</div>
                            </div>
                            
                            <div className="mt-4">
                                <div className="font-serif text-4xl text-paper mb-1 group-hover:translate-x-1 transition-transform">SOC2 Type II</div>
                                <div className="font-mono text-xs text-paper/60">Enterprise Security</div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    </div>
  );
};
