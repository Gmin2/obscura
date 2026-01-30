/**
 * App Top Bar
 * Shared navigation header for Terminal, Portfolio, History, and Profile pages
 */

import { Link, useLocation } from 'react-router-dom';
import { WalletMultiButton } from '@demox-labs/aleo-wallet-adapter-reactui';
import {
  Bell,
  Search,
  LayoutGrid,
  Folder,
  FileText,
  User,
  Home,
} from 'lucide-react';
import Tooltip from './Tooltip';

interface AppTopBarProps {
  /** Optional search placeholder text */
  searchPlaceholder?: string;
}

/**
 * App Top Bar Component
 * Provides consistent navigation and wallet connection across app pages
 */
export function AppTopBar({ searchPlaceholder = 'Search' }: AppTopBarProps) {
  const location = useLocation();
  const currentPath = location.pathname;

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/terminal', icon: LayoutGrid, label: 'Terminal' },
    { path: '/portfolio', icon: Folder, label: 'Portfolio' },
    { path: '/history', icon: FileText, label: 'History' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <header className="flex items-center justify-between shrink-0 relative z-20 py-1">
      <div className="flex items-center gap-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-7 h-7 bg-accent rounded flex items-center justify-center text-ink group-hover:bg-accent/80 transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <span className="font-mono font-bold text-xs tracking-widest text-paper uppercase">Obscura</span>
        </Link>

        {/* Nav Bar */}
        <div className="bg-ink border border-paper/10 rounded-lg p-0.5 flex items-center gap-0.5">
          {navItems.map(({ path, icon: Icon, label }) => {
            const isActive = currentPath === path;
            return (
              <Tooltip key={path} text={label} position="bottom">
                <Link
                  to={path}
                  className={`p-1.5 rounded transition-colors ${
                    isActive
                      ? 'bg-accent text-ink'
                      : 'hover:bg-paper/10 text-paper/50'
                  }`}
                >
                  <Icon size={14} />
                </Link>
              </Tooltip>
            );
          })}
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        <div className="relative hidden md:block">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-paper/40" size={12} />
          <input
            type="text"
            placeholder={searchPlaceholder}
            className="bg-ink border border-paper/10 pl-7 pr-3 py-1 rounded text-xs outline-none text-paper placeholder-paper/40 focus:border-accent/50 w-32 font-mono"
          />
        </div>
        <Tooltip text="Notifications" position="bottom">
          <button className="w-7 h-7 bg-ink border border-paper/10 rounded flex items-center justify-center text-paper/50 hover:text-paper hover:border-paper/20 transition-colors">
            <Bell size={14} />
          </button>
        </Tooltip>
        <WalletMultiButton className="!bg-accent !text-ink !px-3 !py-1.5 !rounded !font-mono !text-[10px] !uppercase !tracking-wider !flex !items-center !gap-2 hover:!bg-accent/90 !transition-colors !h-auto !leading-normal" />
      </div>
    </header>
  );
}

export default AppTopBar;
