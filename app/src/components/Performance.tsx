import { IconLineChartDetailed, IconGaugeChart, IconBarChartDetailed } from './Icons';

export const Performance = () => {
  return (
    <div className="py-12 border-b border-grid">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
                 <h2 className="font-serif text-5xl text-paper mb-4">Protocol Stats</h2>
                 <p className="font-mono text-paper/60 text-sm tracking-wide">ALEO_TESTNET // ZK_VERIFIED</p>
            </div>
            <div className="hidden md:block w-1/3 h-px bg-grid mb-4 relative">
                <div className="absolute right-0 -top-1 w-2 h-2 bg-accent rounded-full animate-pulse" />
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Metric Card 1 */}
            <div className="bg-paper text-ink clip-chamfer-md p-6 min-h-[240px] flex flex-col justify-between group hover:bg-white transition-colors duration-500">
                <div className="flex justify-between items-start border-b border-ink/10 pb-4">
                    <span className="font-mono text-xs uppercase tracking-widest font-bold">Privacy Level</span>
                    <div className="w-12 h-8">
                      <IconGaugeChart />
                    </div>
                </div>
                <div className="flex items-baseline gap-2">
                    <span className="font-serif text-7xl tracking-tighter">100</span>
                    <span className="font-sans text-xl font-bold">%</span>
                </div>
                <div className="text-sm font-medium opacity-70">
                    Orders encrypted with zero-knowledge proofs.
                </div>
            </div>

            {/* Metric Card 2 */}
            <div className="bg-paper text-ink clip-chamfer-md p-6 min-h-[240px] flex flex-col justify-between group hover:bg-white transition-colors duration-500">
                <div className="flex justify-between items-start border-b border-ink/10 pb-4">
                    <span className="font-mono text-xs uppercase tracking-widest font-bold">Proof Time</span>
                    <div className="w-16 h-8 text-accent">
                        <IconLineChartDetailed />
                    </div>
                </div>
                <div className="flex items-baseline gap-2">
                    <span className="font-serif text-7xl tracking-tighter">&lt;2</span>
                    <span className="font-sans text-xl font-bold">sec</span>
                </div>
                <div className="text-sm font-medium opacity-70">
                    ZK proof generation on client side.
                </div>
            </div>

            {/* Metric Card 3 */}
            <div className="bg-paper text-ink clip-chamfer-md p-6 min-h-[240px] flex flex-col justify-between group hover:bg-white transition-colors duration-500">
                 <div className="flex justify-between items-start border-b border-ink/10 pb-4">
                    <span className="font-mono text-xs uppercase tracking-widest font-bold">Data Exposed</span>
                    <div className="w-12 h-8 text-accent">
                        <IconBarChartDetailed />
                    </div>
                </div>
                <div className="flex items-baseline gap-2">
                    <span className="font-serif text-7xl tracking-tighter">0</span>
                    <span className="font-sans text-xl font-bold">bytes</span>
                </div>
                <div className="text-sm font-medium opacity-70">
                    No order details visible on-chain.
                </div>
            </div>
        </div>
    </div>
  );
};