import { useState } from 'react';
import {
  Bell,
  Shield,
  Key,
  Wallet,
  Globe,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  Copy,
  Check,
  LogOut,
  ChevronRight,
  Lock,
  Mail,
  Smartphone,
  AlertTriangle
} from 'lucide-react';
import AppTopBar from '../components/AppTopBar';
import { useWallet } from '@demox-labs/aleo-wallet-adapter-react';

function Profile() {
  const [darkMode, setDarkMode] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [copied, setCopied] = useState(false);
  const [twoFAEnabled, setTwoFAEnabled] = useState(true);

  /** Get wallet connection state */
  const { publicKey, connected, disconnect } = useWallet();

  /** Use connected address or fallback to mock */
  const walletAddress = publicKey || 'aleo1qnr4dj8sf9h2xc7n5q4z9m3p8r7t6y5w4e3r2t1q0p9o8i7u6y5t4r3e2w1';

  const handleCopy = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
    } catch (err) {
      console.error('Failed to disconnect:', err);
    }
  };

  return (
    <div className="h-screen w-full bg-charcoal p-3 font-sans text-paper overflow-hidden flex flex-col gap-2 relative">

      {/* Dotted Grid Background */}
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-20"
        style={{
          backgroundImage: 'radial-gradient(#555 1px, transparent 1px)',
          backgroundSize: '16px 16px'
        }}
      />

      {/* Navigation Header */}
      <AppTopBar />

      {/* Main Content */}
      <main className="flex-1 grid grid-cols-12 gap-3 min-h-0 relative z-10 overflow-auto">

        {/* Left Column: Profile Info */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-3">

          {/* Profile Card */}
          <div className="bg-ink border border-paper/10 rounded-lg p-6">
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-accent overflow-hidden mb-4 ring-4 ring-accent/20">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" className="w-full h-full" />
              </div>
              <h2 className="font-serif text-xl text-paper">TRADER_01</h2>
              <span className="text-paper/40 text-xs font-mono mt-1">Member since Jan 2024</span>

              <div className="flex items-center gap-2 mt-4">
                <span className="bg-q-green/10 text-q-green text-[10px] font-mono uppercase px-2 py-1 rounded flex items-center gap-1">
                  <Shield size={10} /> Verified
                </span>
                <span className="bg-accent/10 text-accent text-[10px] font-mono uppercase px-2 py-1 rounded">
                  Pro Trader
                </span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-paper/10">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-paper/40 text-xs">Email</span>
                  <span className="font-mono text-xs text-paper">trader@obscura.io</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-paper/40 text-xs">User ID</span>
                  <span className="font-mono text-xs text-paper/70">#USR-84721</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-paper/40 text-xs">Trading Level</span>
                  <span className="font-mono text-xs text-accent">Level 3</span>
                </div>
              </div>
            </div>
          </div>

          {/* Wallet Card */}
          <div className="bg-ink border border-paper/10 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-4">
              <Wallet size={14} className="text-accent" />
              <span className="font-mono text-xs uppercase tracking-wider text-paper/50">Connected Wallet</span>
            </div>

            <div className="bg-paper/5 rounded-lg p-3 mb-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-paper/40 font-mono">Aleo Address</span>
                <button
                  onClick={handleCopy}
                  className="text-accent hover:text-accent/80 transition-colors flex items-center gap-1"
                  disabled={!connected}
                >
                  {copied ? <Check size={12} /> : <Copy size={12} />}
                  <span className="text-[10px] font-mono">{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
              <div className="font-mono text-xs text-paper break-all leading-relaxed">
                {connected ? `${walletAddress.slice(0, 20)}...${walletAddress.slice(-10)}` : 'Not connected'}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button className="bg-accent text-ink py-2 rounded font-mono text-xs uppercase tracking-wider hover:bg-accent/90 transition-colors">
                Change Wallet
              </button>
              <button
                onClick={handleDisconnect}
                disabled={!connected}
                className="bg-paper/10 text-paper py-2 rounded font-mono text-xs uppercase tracking-wider hover:bg-paper/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Disconnect
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Settings */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-3">

          {/* Security Settings */}
          <div className="bg-ink border border-paper/10 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-4">
              <Shield size={14} className="text-accent" />
              <span className="font-mono text-xs uppercase tracking-wider text-paper/50">Security</span>
            </div>

            <div className="space-y-3">
              {/* 2FA */}
              <div className="flex items-center justify-between p-3 bg-paper/5 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                    <Smartphone size={16} />
                  </div>
                  <div>
                    <div className="font-mono text-sm text-paper">Two-Factor Authentication</div>
                    <div className="text-[10px] text-paper/40">Secure your account with 2FA</div>
                  </div>
                </div>
                <button
                  onClick={() => setTwoFAEnabled(!twoFAEnabled)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${twoFAEnabled ? 'bg-q-green' : 'bg-paper/20'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-paper transition-transform ${twoFAEnabled ? 'left-6' : 'left-1'}`} />
                </button>
              </div>

              {/* Password */}
              <div className="flex items-center justify-between p-3 bg-paper/5 rounded-lg hover:bg-paper/10 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-paper/10 flex items-center justify-center text-paper/60">
                    <Key size={16} />
                  </div>
                  <div>
                    <div className="font-mono text-sm text-paper">Change Password</div>
                    <div className="text-[10px] text-paper/40">Last changed 30 days ago</div>
                  </div>
                </div>
                <ChevronRight size={16} className="text-paper/40" />
              </div>

              {/* Sessions */}
              <div className="flex items-center justify-between p-3 bg-paper/5 rounded-lg hover:bg-paper/10 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-paper/10 flex items-center justify-center text-paper/60">
                    <Globe size={16} />
                  </div>
                  <div>
                    <div className="font-mono text-sm text-paper">Active Sessions</div>
                    <div className="text-[10px] text-paper/40">2 devices currently active</div>
                  </div>
                </div>
                <ChevronRight size={16} className="text-paper/40" />
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="bg-ink border border-paper/10 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-4">
              <Globe size={14} className="text-accent" />
              <span className="font-mono text-xs uppercase tracking-wider text-paper/50">Preferences</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Theme */}
              <div className="flex items-center justify-between p-3 bg-paper/5 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-paper/10 flex items-center justify-center text-paper/60">
                    {darkMode ? <Moon size={16} /> : <Sun size={16} />}
                  </div>
                  <div>
                    <div className="font-mono text-sm text-paper">Dark Mode</div>
                    <div className="text-[10px] text-paper/40">Toggle theme</div>
                  </div>
                </div>
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${darkMode ? 'bg-accent' : 'bg-paper/20'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-paper transition-transform ${darkMode ? 'left-6' : 'left-1'}`} />
                </button>
              </div>

              {/* Sound */}
              <div className="flex items-center justify-between p-3 bg-paper/5 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-paper/10 flex items-center justify-center text-paper/60">
                    {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                  </div>
                  <div>
                    <div className="font-mono text-sm text-paper">Sound Effects</div>
                    <div className="text-[10px] text-paper/40">Trade notifications</div>
                  </div>
                </div>
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${soundEnabled ? 'bg-accent' : 'bg-paper/20'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-paper transition-transform ${soundEnabled ? 'left-6' : 'left-1'}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-ink border border-paper/10 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-4">
              <Bell size={14} className="text-accent" />
              <span className="font-mono text-xs uppercase tracking-wider text-paper/50">Notifications</span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-paper/5 rounded-lg hover:bg-paper/10 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-paper/10 flex items-center justify-center text-paper/60">
                    <Mail size={16} />
                  </div>
                  <div>
                    <div className="font-mono text-sm text-paper">Email Notifications</div>
                    <div className="text-[10px] text-paper/40">Order fills, deposits, withdrawals</div>
                  </div>
                </div>
                <ChevronRight size={16} className="text-paper/40" />
              </div>

              <div className="flex items-center justify-between p-3 bg-paper/5 rounded-lg hover:bg-paper/10 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-paper/10 flex items-center justify-center text-paper/60">
                    <AlertTriangle size={16} />
                  </div>
                  <div>
                    <div className="font-mono text-sm text-paper">Price Alerts</div>
                    <div className="text-[10px] text-paper/40">3 active alerts</div>
                  </div>
                </div>
                <ChevronRight size={16} className="text-paper/40" />
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-ink border border-q-red/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-4">
              <Lock size={14} className="text-q-red" />
              <span className="font-mono text-xs uppercase tracking-wider text-q-red/70">Danger Zone</span>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-mono text-sm text-paper">Sign Out</div>
                <div className="text-[10px] text-paper/40">Sign out from all devices</div>
              </div>
              <button className="flex items-center gap-2 bg-q-red/10 text-q-red px-4 py-2 rounded font-mono text-xs uppercase tracking-wider hover:bg-q-red/20 transition-colors">
                <LogOut size={14} /> Sign Out
              </button>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

export default Profile;
