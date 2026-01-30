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


// --- Feature Icons ---

export const IconSmartActions = () => (
  <svg viewBox="0 0 200 200" className="w-full h-full text-ink" fill="none" stroke="currentColor" strokeWidth="1.5">
    <style>{`
      .spin-cw { animation: spin 12s linear infinite; }
      .spin-ccw { animation: spin 12s linear infinite reverse; }
      .spin-inner { animation: spin 6s linear infinite reverse; }
      
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
    `}</style>
    
    {/* 
       Circles are nested and touching the bottom (y=180).
       Gap Analysis:
       C1 Top: 20. C2 Top: 60. Midpoint: 40.
       C2 Top: 60. C3 Top: 100. Midpoint: 80.
       C3 Top: 100. C4 Top: 140. Midpoint: 120.
    */}

    {/* STATIC LABELS LAYER (Fixed in space - Upper Center in gaps) */}
    
    {/* Gap 1 (Between Outer and C2) - y=40 */}
    <g transform="translate(100, 40)">
        {/* Minus Sign */}
        <line x1="-8" y1="0" x2="8" y2="0" strokeWidth="2" />
    </g>
    
    {/* Gap 2 (Between C2 and C3) - y=80 */}
    <g transform="translate(100, 80)">
        {/* Plus Sign */}
        <line x1="-8" y1="0" x2="8" y2="0" strokeWidth="2" />
        <line x1="0" y1="-8" x2="0" y2="8" strokeWidth="2" />
    </g>
    
    {/* Gap 3 (Between C3 and Inner) - y=120 */}
    <g transform="translate(100, 120)">
        {/* Minus Sign */}
        <line x1="-8" y1="0" x2="8" y2="0" strokeWidth="2" />
    </g>


    {/* ANIMATED CIRCLES LAYER - Removed dashes (dots) */}
    
    {/* Circle 1 (Outer) - R=80, Center(100, 100) */}
    <g style={{ transformOrigin: '100px 100px' }} className="spin-cw">
       {/* Circle solid line */}
       <circle cx="100" cy="100" r="80" /> 
       {/* Small notches at cardinal points */}
       <path d="M100 20 L100 15" strokeWidth="2" /> 
       <path d="M100 185 L100 180" strokeWidth="2" /> 
       <path d="M180 100 L185 100" strokeWidth="2" />
       <path d="M20 100 L15 100" strokeWidth="2" />
    </g>

    {/* Circle 2 - R=60, Center(100, 120) */}
    <g style={{ transformOrigin: '100px 120px' }} className="spin-ccw">
       <circle cx="100" cy="120" r="60" />
       {/* Notch */}
       <path d="M100 60 L100 56" strokeWidth="2" />
    </g>

    {/* Circle 3 - R=40, Center(100, 140) */}
    <g style={{ transformOrigin: '100px 140px' }} className="spin-cw">
       <circle cx="100" cy="140" r="40" />
       {/* Notch */}
       <path d="M100 100 L100 96" strokeWidth="2" />
    </g>

    {/* Circle 4 (Core) - R=20, Center(100, 160) - THIS ONE SPINS WITH LABEL */}
    <g style={{ transformOrigin: '100px 160px' }} className="spin-inner">
       <circle cx="100" cy="160" r="20" />
       {/* Marker: Plus (Spins with the circle) - kept as requested for smallest circle */}
       <line x1="94" y1="160" x2="106" y2="160" strokeWidth="2" />
       <line x1="100" y1="154" x2="100" y2="166" strokeWidth="2" />
    </g>
  </svg>
);

export const IconAutoResolve = () => (
  <svg viewBox="0 0 200 200" className="w-full h-full text-ink" fill="none" stroke="currentColor" strokeWidth="1.5">
    <style>{`
      /* Harmonic Resonance Animation */
      .resonance-bar { animation: resonance 3s ease-in-out infinite; }
      
      /* Staggered delays for wave effect */
      .res-1 { animation-delay: 0.0s; }
      .res-2 { animation-delay: 0.2s; }
      .res-3 { animation-delay: 0.4s; }
      .res-4 { animation-delay: 0.6s; }
      .res-5 { animation-delay: 0.8s; }
      .res-6 { animation-delay: 1.0s; }

      @keyframes resonance {
        0%, 100% { 
          opacity: 0.3; 
          stroke-width: 1.5px;
        }
        50% { 
          opacity: 1; 
          stroke-width: 2.5px;
          stroke-opacity: 0.6; /* Lighter shade of diagram color (Ink) via opacity */
        }
      }
    `}</style>
    
    {/* Base Structure (Static Outline) */}
    <path d="M30 170 L100 30 L170 170 Z" strokeWidth="2" />
    <line x1="100" y1="30" x2="100" y2="170" strokeWidth="2" />

    {/* Animated Levels */}
    <g>
        {/* Level 1 (Bottom) */}
        <path d="M30 170 L100 146.6 L170 170" className="resonance-bar res-1" />
        
        {/* Level 2 */}
        <path d="M30 170 L100 123.3 L170 170" className="resonance-bar res-2" />
        
        {/* Level 3 */}
        <path d="M30 170 L100 100 L170 170" className="resonance-bar res-3" />
        
        {/* Level 4 */}
        <path d="M30 170 L100 76.6 L170 170" className="resonance-bar res-4" />
        
        {/* Level 5 */}
        <path d="M30 170 L100 53.3 L170 170" className="resonance-bar res-5" />
        
        {/* Level 6 (Top) */}
        <path d="M30 170 L100 30 L170 170" className="resonance-bar res-6" fill="transparent"/>
    </g>

  </svg>
);

export const IconAgentAssist = () => (
  <svg viewBox="0 0 200 200" className="w-full h-full text-ink" fill="none" stroke="currentColor" strokeWidth="1.5">
    <style>{`
      .breathe-circle { animation: breathe 6s ease-in-out infinite; }
      .b-1 { animation-delay: 0s; }
      .b-2 { animation-delay: 2s; }
      .b-3 { animation-delay: 4s; }

      @keyframes breathe {
        0%, 100% { stroke-opacity: 0.4; }
        50% { stroke-opacity: 1; }
      }
    `}</style>

    {/* Definitions for strict clipping */}
    <defs>
      <clipPath id="clip-top"><circle cx="100" cy="80" r="45" /></clipPath>
      <clipPath id="clip-left"><circle cx="75" cy="125" r="45" /></clipPath>
      <clipPath id="clip-right"><circle cx="125" cy="125" r="45" /></clipPath>
    </defs>

    {/* Top Circle */}
    <circle cx="100" cy="80" r="45" className="breathe-circle b-1" />
    {/* Left Circle */}
    <circle cx="75" cy="125" r="45" className="breathe-circle b-2" />
    {/* Right Circle */}
    <circle cx="125" cy="125" r="45" className="breathe-circle b-3" />
    
    {/* 
        Hatching Lines confined STRICTLY to the triple intersection.
        We achieve this by nesting the clip paths.
        The lines will only appear where ALL THREE clip paths overlap.
    */}
    <g clipPath="url(#clip-top)">
      <g clipPath="url(#clip-left)">
        <g clipPath="url(#clip-right)">
           {/* Static Diagonal Lines (Bottom-Left to Top-Right) to match reference */}
           {/* Center of intersection is approx 100, 110. Lines span broadly and get clipped. */}
           <line x1="80" y1="130" x2="130" y2="80" strokeWidth="1.5" />
           <line x1="85" y1="135" x2="135" y2="85" strokeWidth="1.5" />
           <line x1="75" y1="125" x2="125" y2="75" strokeWidth="1.5" />
           <line x1="90" y1="140" x2="140" y2="90" strokeWidth="1.5" />
           <line x1="70" y1="120" x2="120" y2="70" strokeWidth="1.5" />
        </g>
      </g>
    </g>

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
