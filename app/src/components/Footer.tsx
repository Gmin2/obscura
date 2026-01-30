export const Footer = () => {
  return (
    <div className="mt-24 mb-12">
        <div className="bg-paperDark text-ink clip-chamfer-lg p-1 border-t-2 border-paper">
            <div className="border border-ink/10 clip-chamfer-md p-8 md:p-12 relative overflow-hidden min-h-[600px]">

                {/* Background Grid for this section specifically */}
                <div className="absolute inset-0 opacity-5 pointer-events-none"
                     style={{ backgroundImage: 'radial-gradient(#1A1A1A 1px, transparent 1px)', backgroundSize: '16px 16px' }}></div>

                {/* Header */}
                <div className="flex items-center mb-16 border-b border-ink/10 pb-4 relative z-10">
                    <span className="w-3 h-3 bg-accent block mr-4"></span>
                    <span className="font-mono text-sm uppercase tracking-widest font-bold">Privacy Architecture</span>
                    <div className="flex-1 ml-4 text-ink/20 overflow-hidden whitespace-nowrap text-[10px] font-mono">
                        ALEO_NETWORK // ZK_SNARK // ENCRYPTED // ----------------------------------------------------
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 relative z-10">
                    {/* Left: Text Content */}
                    <div className="flex flex-col justify-between h-full">
                        <div>
                            <h2 className="font-serif text-[4.5rem] md:text-[5.5rem] leading-[0.9] tracking-tighter mb-8 text-ink">
                                Multi-layer<br/>privacy stack
                            </h2>
                            <p className="font-sans text-xl leading-relaxed max-w-md font-medium text-ink/80 mb-12">
                                Built on Aleo's zero-knowledge architecture. Every layer protects your trading data from order placement to settlement.
                            </p>
                        </div>

                        {/* Technical List */}
                        <div className="space-y-5 font-mono text-xs md:text-sm tracking-wide mt-auto">
                            <div className="flex items-center gap-4 border-b border-ink/10 pb-3 group cursor-default">
                                 <div className="w-5 h-5 border border-ink/40 flex items-center justify-center text-[10px] group-hover:bg-ink group-hover:text-paper transition-colors">01</div>
                                 <span className="font-semibold">ENCRYPTED_RECORDS (UTXO)</span>
                            </div>
                            <div className="flex items-center gap-4 border-b border-ink/10 pb-3 group cursor-default">
                                 <div className="w-5 h-5 border border-ink/40 flex items-center justify-center text-[10px] group-hover:bg-ink group-hover:text-paper transition-colors">02</div>
                                 <span className="font-semibold">POSEIDON_COMMITMENTS</span>
                            </div>
                            <div className="flex items-center gap-4 border-b border-ink/10 pb-3 group cursor-default">
                                 <div className="w-5 h-5 border border-ink/40 flex items-center justify-center text-[10px] group-hover:bg-ink group-hover:text-paper transition-colors">03</div>
                                 <span className="font-semibold">VIEW_KEY_DISCLOSURE</span>
                            </div>
                        </div>
                    </div>

                    {/* Right: The Visual (Privacy Stack) */}
                    <div className="relative pt-8 lg:pt-0">
                        {/* A dark card representing the privacy layers */}
                        <div className="bg-ink text-paper p-6 clip-chamfer-md shadow-2xl relative overflow-hidden h-full flex flex-col min-h-[450px]">

                            {/* Terminal Header */}
                            <div className="flex justify-between items-center border-b border-paper/20 pb-4 mb-6 font-mono text-xs">
                                <span className="opacity-50 tracking-widest">PRIVACY_STACK.LEO</span>
                                <div className="flex gap-2">
                                    <div className="w-2 h-2 rounded-full bg-paper/20"></div>
                                    <div className="w-2 h-2 rounded-full bg-paper/20"></div>
                                    <div className="w-2 h-2 rounded-full bg-accent animate-pulse"></div>
                                </div>
                            </div>

                            {/* Privacy Layers */}
                            <div className="space-y-4 flex-1 font-mono text-sm relative z-10">
                                {/* Layer 1: Records */}
                                <div className="bg-paper/10 p-4 border-l-2 border-accent backdrop-blur-sm">
                                    <div className="flex justify-between mb-3 items-baseline">
                                        <span className="text-accent font-bold tracking-wider">RECORD_LAYER</span>
                                        <span className="opacity-40 text-[10px]">ENCRYPTED</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs opacity-80">
                                        <div className="flex items-center gap-2">
                                            <span className="text-accent font-bold">◆</span> owner: address
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-accent font-bold">◆</span> amount: u128
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-accent font-bold">◆</span> price: u128
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-accent font-bold">◆</span> salt: scalar
                                        </div>
                                    </div>
                                </div>

                                {/* Layer 2: Commitments */}
                                <div className="bg-paper/5 p-4 border-l-2 border-paper/30 opacity-70">
                                    <div className="flex justify-between mb-3 items-baseline">
                                        <span className="font-bold tracking-wider">COMMITMENT_LAYER</span>
                                        <span className="opacity-40 text-[10px]">HASHED</span>
                                    </div>
                                    <div className="text-xs opacity-60 font-mono">
                                        <div className="mb-2">Poseidon2::commit_to_field(</div>
                                        <div className="pl-4 text-accent">(price, amount), salt</div>
                                        <div>);</div>
                                    </div>
                                </div>

                                 {/* Layer 3: Proof */}
                                <div className="bg-paper/5 p-4 border-l-2 border-paper/10 opacity-50">
                                    <div className="flex justify-between items-baseline">
                                        <span className="font-bold tracking-wider">ZK_PROOF_LAYER</span>
                                        <span className="opacity-40 text-[10px]">VERIFIED</span>
                                    </div>
                                    <div className="text-xs opacity-60 mt-2">
                                        snarkVM generates proof → validators verify
                                    </div>
                                </div>
                            </div>

                            {/* Decorative bottom Code */}
                            <div className="mt-8 pt-4 border-t border-paper/10 text-[10px] font-mono opacity-30 break-all leading-relaxed">
                                0x7f8a3b2c...COMMITMENT_VALID...ZK_VERIFIED...<br/>
                                PROOF_GENERATED...ORDER_PRIVATE...
                            </div>
                        </div>

                        {/* Decorative Elements behind/around the dark card */}
                         <div className="absolute -top-6 -right-6 w-32 h-32 bg-accent opacity-10 blur-2xl rounded-full pointer-events-none"></div>
                    </div>
                </div>

                {/* Corner Accents on the main container */}
                <div className="absolute bottom-6 right-6 w-6 h-6 border-b-2 border-r-2 border-ink opacity-20" />
                <div className="absolute top-6 left-6 w-6 h-6 border-t-2 border-l-2 border-ink opacity-20" />
            </div>
        </div>
    </div>
  );
};
