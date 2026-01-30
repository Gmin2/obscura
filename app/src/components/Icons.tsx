import { 
  Activity, 
  ArrowDown, 
  ArrowUp, 
  BarChart2, 
  BookOpen, 
  ChevronDown, 
  Clock, 
  CreditCard, 
  EyeOff, 
  Globe, 
  History, 
  Layout, 
  Lock, 
  Maximize2, 
  Menu, 
  Moon, 
  Settings, 
  Shield, 
  Terminal, 
  Wallet,
  Zap
} from 'lucide-react';


// --- Feature Icons (Privacy Theme) ---

// Icon 1: Private Records - Encrypted document with lock
export const IconSmartActions = () => (
  <svg viewBox="0 0 200 200" className="w-full h-full text-ink" fill="none" stroke="currentColor" strokeWidth="1.5">
    <style>{`
      .lock-pulse { animation: lockPulse 2s ease-in-out infinite; }
      .encrypt-float { animation: encryptFloat 3s ease-in-out infinite; }
      .encrypt-float-2 { animation: encryptFloat 3s ease-in-out infinite; animation-delay: 1s; }
      .encrypt-float-3 { animation: encryptFloat 3s ease-in-out infinite; animation-delay: 2s; }

      @keyframes lockPulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.7; transform: scale(1.05); }
      }
      @keyframes encryptFloat {
        0%, 100% { opacity: 0.3; transform: translateY(0); }
        50% { opacity: 0.8; transform: translateY(-5px); }
      }
    `}</style>

    {/* Document outline */}
    <rect x="45" y="30" width="110" height="140" rx="4" strokeWidth="2" />
    <path d="M45 30 L45 50 L65 50 L65 30" strokeWidth="2" fill="none" />

    {/* Encrypted content lines */}
    <g className="encrypt-float">
      <rect x="60" y="70" width="80" height="8" rx="2" fill="currentColor" opacity="0.2" stroke="none" />
    </g>
    <g className="encrypt-float-2">
      <rect x="60" y="90" width="65" height="8" rx="2" fill="currentColor" opacity="0.2" stroke="none" />
    </g>
    <g className="encrypt-float-3">
      <rect x="60" y="110" width="75" height="8" rx="2" fill="currentColor" opacity="0.2" stroke="none" />
    </g>

    {/* Lock icon in center-bottom */}
    <g className="lock-pulse" style={{ transformOrigin: '100px 150px' }}>
      {/* Lock body */}
      <rect x="85" y="145" width="30" height="24" rx="3" strokeWidth="2" />
      {/* Lock shackle */}
      <path d="M90 145 L90 138 A10 10 0 0 1 110 138 L110 145" strokeWidth="2" fill="none" />
      {/* Keyhole */}
      <circle cx="100" cy="155" r="3" fill="currentColor" stroke="none" />
      <rect x="98" y="155" width="4" height="6" fill="currentColor" stroke="none" />
    </g>

    {/* Corner markers */}
    <path d="M45 45 L35 45 L35 30" strokeWidth="1" opacity="0.4" />
    <path d="M155 170 L165 170 L165 155" strokeWidth="1" opacity="0.4" />
  </svg>
);

// Icon 2: Commitment Scheme - Value transforms to hash
export const IconAutoResolve = () => (
  <svg viewBox="0 0 200 200" className="w-full h-full text-ink" fill="none" stroke="currentColor" strokeWidth="1.5">
    <style>{`
      .hash-reveal { animation: hashReveal 4s ease-in-out infinite; }
      .arrow-pulse { animation: arrowPulse 2s ease-in-out infinite; }

      @keyframes hashReveal {
        0%, 20% { opacity: 1; }
        40%, 60% { opacity: 0.3; }
        80%, 100% { opacity: 1; }
      }
      @keyframes arrowPulse {
        0%, 100% { opacity: 0.5; transform: translateX(0); }
        50% { opacity: 1; transform: translateX(3px); }
      }
    `}</style>

    {/* Left box - Value (hidden) */}
    <g>
      <rect x="20" y="70" width="60" height="60" rx="4" strokeWidth="2" />
      <text x="50" y="105" textAnchor="middle" fontSize="14" fontFamily="monospace" fill="currentColor" stroke="none">$$$</text>
      <text x="50" y="145" textAnchor="middle" fontSize="8" fontFamily="monospace" fill="currentColor" opacity="0.5" stroke="none">VALUE</text>
    </g>

    {/* Arrow with hash function */}
    <g className="arrow-pulse" style={{ transformOrigin: '100px 100px' }}>
      <path d="M85 100 L115 100" strokeWidth="2" />
      <path d="M110 95 L115 100 L110 105" strokeWidth="2" fill="none" />
    </g>
    <text x="100" y="85" textAnchor="middle" fontSize="8" fontFamily="monospace" fill="currentColor" opacity="0.6" stroke="none">Poseidon</text>

    {/* Right box - Commitment (hash) */}
    <g className="hash-reveal">
      <rect x="120" y="70" width="60" height="60" rx="4" strokeWidth="2" />
      <text x="150" y="98" textAnchor="middle" fontSize="10" fontFamily="monospace" fill="currentColor" stroke="none">0x7f</text>
      <text x="150" y="112" textAnchor="middle" fontSize="10" fontFamily="monospace" fill="currentColor" stroke="none">8a3b</text>
      <text x="150" y="145" textAnchor="middle" fontSize="8" fontFamily="monospace" fill="currentColor" opacity="0.5" stroke="none">COMMIT</text>
    </g>

    {/* Salt indicator */}
    <g>
      <text x="100" y="165" textAnchor="middle" fontSize="8" fontFamily="monospace" fill="currentColor" opacity="0.4" stroke="none">+ salt</text>
    </g>

    {/* Technical frame */}
    <rect x="15" y="55" width="170" height="120" rx="2" strokeWidth="1" strokeDasharray="4 4" opacity="0.2" />
  </svg>
);

// Icon 3: ZK Matching - Two orders match via proof
export const IconAgentAssist = () => (
  <svg viewBox="0 0 200 200" className="w-full h-full text-ink" fill="none" stroke="currentColor" strokeWidth="1.5">
    <style>{`
      .order-left { animation: orderLeft 3s ease-in-out infinite; }
      .order-right { animation: orderRight 3s ease-in-out infinite; }
      .proof-glow { animation: proofGlow 3s ease-in-out infinite; }
      .check-appear { animation: checkAppear 3s ease-in-out infinite; }

      @keyframes orderLeft {
        0%, 100% { transform: translateX(0); opacity: 0.6; }
        50% { transform: translateX(10px); opacity: 1; }
      }
      @keyframes orderRight {
        0%, 100% { transform: translateX(0); opacity: 0.6; }
        50% { transform: translateX(-10px); opacity: 1; }
      }
      @keyframes proofGlow {
        0%, 100% { opacity: 0.3; }
        50% { opacity: 1; }
      }
      @keyframes checkAppear {
        0%, 30% { opacity: 0; transform: scale(0.5); }
        50%, 100% { opacity: 1; transform: scale(1); }
      }
    `}</style>

    {/* Left order (BUY) */}
    <g className="order-left" style={{ transformOrigin: '50px 80px' }}>
      <rect x="25" y="55" width="50" height="50" rx="4" strokeWidth="2" />
      <text x="50" y="85" textAnchor="middle" fontSize="12" fontFamily="monospace" fill="currentColor" stroke="none">BUY</text>
      <rect x="30" y="60" width="15" height="6" rx="1" fill="currentColor" opacity="0.3" stroke="none" />
    </g>

    {/* Right order (SELL) */}
    <g className="order-right" style={{ transformOrigin: '150px 80px' }}>
      <rect x="125" y="55" width="50" height="50" rx="4" strokeWidth="2" />
      <text x="150" y="85" textAnchor="middle" fontSize="12" fontFamily="monospace" fill="currentColor" stroke="none">SELL</text>
      <rect x="155" y="60" width="15" height="6" rx="1" fill="currentColor" opacity="0.3" stroke="none" />
    </g>

    {/* Connection lines to center */}
    <path d="M75 80 L90 100" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.4" />
    <path d="M125 80 L110 100" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.4" />

    {/* Center proof circle */}
    <g className="proof-glow" style={{ transformOrigin: '100px 115px' }}>
      <circle cx="100" cy="115" r="25" strokeWidth="2" />
      <text x="100" y="112" textAnchor="middle" fontSize="8" fontFamily="monospace" fill="currentColor" stroke="none">ZK</text>
      <text x="100" y="122" textAnchor="middle" fontSize="8" fontFamily="monospace" fill="currentColor" stroke="none">PROOF</text>
    </g>

    {/* Checkmark below */}
    <g className="check-appear" style={{ transformOrigin: '100px 160px' }}>
      <circle cx="100" cy="160" r="15" strokeWidth="2" />
      <path d="M92 160 L98 166 L110 154" strokeWidth="2.5" fill="none" />
    </g>

    {/* Label */}
    <text x="100" y="190" textAnchor="middle" fontSize="8" fontFamily="monospace" fill="currentColor" opacity="0.5" stroke="none">VERIFIED</text>
  </svg>
);

// --- Improved Performance Charts ---

export const IconGaugeChart = () => (
  <svg viewBox="0 0 100 60" className="w-full h-full text-accent" fill="none" stroke="currentColor" strokeWidth="2">
    {/* Arc Background */}
    <path d="M10 50 A 40 40 0 1 1 90 50" strokeOpacity="0.2" strokeWidth="4" />
    {/* Arc Progress */}
    <path d="M10 50 A 40 40 0 1 1 88 45" strokeWidth="4" strokeLinecap="round" />
    
    {/* Needle */}
    <line x1="50" y1="50" x2="85" y2="20" strokeWidth="2" />
    <circle cx="50" cy="50" r="3" fill="currentColor" />
  </svg>
);

export const IconLineChartDetailed = () => (
  <svg viewBox="0 0 100 60" className="w-full h-full text-accent" fill="none" stroke="currentColor" strokeWidth="1.5">
    {/* Grid Lines */}
    <line x1="0" y1="10" x2="100" y2="10" strokeOpacity="0.1" strokeDasharray="2 2" />
    <line x1="0" y1="30" x2="100" y2="30" strokeOpacity="0.1" strokeDasharray="2 2" />
    <line x1="0" y1="50" x2="100" y2="50" strokeOpacity="0.1" strokeDasharray="2 2" />
    
    {/* The Line */}
    <path d="M0 45 L 15 40 L 30 48 L 45 25 L 60 30 L 75 15 L 90 20 L 100 5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    
    {/* Gradient Fill Area */}
    <path d="M0 45 L 15 40 L 30 48 L 45 25 L 60 30 L 75 15 L 90 20 L 100 5 V 60 H 0 Z" fill="currentColor" fillOpacity="0.1" stroke="none" />
    
    {/* Active Dot */}
    <circle cx="100" cy="5" r="3" fill="currentColor" />
  </svg>
);

export const IconBarChartDetailed = () => (
  <svg viewBox="0 0 100 60" className="w-full h-full text-accent" fill="currentColor">
    {/* Bars */}
    <rect x="5" y="20" width="8" height="40" rx="1" opacity="0.4" />
    <rect x="18" y="15" width="8" height="45" rx="1" opacity="0.6" />
    <rect x="31" y="25" width="8" height="35" rx="1" opacity="0.5" />
    <rect x="44" y="10" width="8" height="50" rx="1" opacity="0.8" />
    <rect x="57" y="18" width="8" height="42" rx="1" opacity="0.6" />
    <rect x="70" y="5" width="8" height="55" rx="1" />
    <rect x="83" y="12" width="8" height="48" rx="1" opacity="0.9" />
  </svg>
);

// --- Infrastructure ---

export const IconGlobeAbstract = () => (
  <svg viewBox="0 0 200 200" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth="1">
    <style>
      {`
        .rotate-slow { animation: rotate 60s linear infinite; transform-origin: center; }
        .pulse-node { animation: pulse 2s ease-in-out infinite; }
        @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; r: 2; } 50% { opacity: 0.5; r: 3; } }
      `}
    </style>
    {/* Background Static Rings */}
    <circle cx="100" cy="100" r="80" strokeOpacity="0.1" />
    <circle cx="100" cy="100" r="60" strokeOpacity="0.1" strokeDasharray="4 4" />
    <circle cx="100" cy="100" r="40" strokeOpacity="0.1" />

    {/* Rotating Elements */}
    <g className="rotate-slow">
       <circle cx="100" cy="100" r="70" strokeOpacity="0.1" strokeDasharray="10 10" />
       <path d="M100 20 L 100 180" strokeOpacity="0.1" />
       <path d="M20 100 L 180 100" strokeOpacity="0.1" />
    </g>
    
    {/* Connections */}
    <path d="M100 30 Q 150 50 170 100" strokeOpacity="0.3" />
    <path d="M170 100 Q 150 150 100 170" strokeOpacity="0.3" />
    <path d="M100 170 Q 50 150 30 100" strokeOpacity="0.3" />
    <path d="M30 100 Q 50 50 100 30" strokeOpacity="0.3" />
    
    {/* Active Nodes */}
    <circle cx="100" cy="30" r="2" fill="#F25C33" className="pulse-node" style={{animationDelay: '0s'}} />
    <circle cx="170" cy="100" r="2" fill="#F25C33" className="pulse-node" style={{animationDelay: '0.5s'}} />
    <circle cx="30" cy="100" r="2" fill="#F25C33" className="pulse-node" style={{animationDelay: '1s'}} />
    <circle cx="100" cy="170" r="2" fill="#F25C33" className="pulse-node" style={{animationDelay: '1.5s'}} />
    
    {/* Extra nodes */}
    <circle cx="140" cy="60" r="1.5" fill="#F25C33" className="pulse-node" style={{animationDelay: '0.2s'}} />
    <circle cx="60" cy="140" r="1.5" fill="#F25C33" className="pulse-node" style={{animationDelay: '1.2s'}} />

  </svg>
);

// Misc
export const DiamondIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-paper">
    <rect x="10" y="2" width="11.31" height="11.31" transform="rotate(45 10 2)" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

export {
  Activity, ArrowDown, ArrowUp, BarChart2, BookOpen, ChevronDown, Clock, CreditCard,
  EyeOff, Globe, History, Layout, Lock, Maximize2, Menu, Moon, Settings, Shield,
  Terminal, Wallet, Zap
};
