import { Link } from 'react-router-dom';

export const TopBar = () => {
  return (
    <div className="w-full border-b border-grid bg-paper text-ink font-mono text-xs tracking-wider uppercase sticky top-0 z-50">
        <div className="max-w-7xl mx-auto border-l border-r border-grid">
            {/* Single Row: Logo + Nav + Actions */}
            <div className="flex h-14 items-center px-4 sm:px-6 justify-between relative overflow-hidden bg-paper">

                {/* Logo */}
                <Link to="/" className="flex items-center gap-3 group">
                    <div className="w-8 h-8 bg-ink rounded-lg flex items-center justify-center text-paper transition-colors group-hover:bg-accent">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                      </svg>
                    </div>
                    <span className="font-serif text-xl tracking-tight normal-case font-bold">Obscura</span>
                </Link>

                {/* Center Nav */}
                <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
                    <Link to="/terminal" className="text-ink/60 hover:text-ink transition-colors">Trade</Link>
                    <a href="https://github.com/Gmin2/obscura" target="_blank" rel="noopener noreferrer" className="text-ink/60 hover:text-ink transition-colors">Docs</a>
                </nav>

                {/* Right: Network Status + Launch Button */}
                <div className="flex items-center gap-4 sm:gap-6">
                    {/* Network Status */}
                    <div className="hidden sm:flex items-center gap-2 text-[10px] text-ink/50">
                        <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                        <span>ALEO_TESTNET</span>
                    </div>

                    {/* Launch App Button */}
                    <Link
                        to="/terminal"
                        className="bg-ink text-paper px-4 py-2 text-xs font-bold tracking-wider hover:bg-accent transition-colors clip-chamfer-sm"
                    >
                        Launch App
                    </Link>
                </div>
            </div>
        </div>
    </div>
  );
};