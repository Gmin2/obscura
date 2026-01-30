import { useState, useEffect, useRef, useCallback } from 'react';
import CandleChart, { type ChartType, type HoveredCandle } from '../components/CandleChart';
import ChartOverlay, { type DrawingTool } from '../components/ChartOverlay';
import OrderBook from '../components/OrderBook';
import OrderEntry from '../components/OrderEntry';
import Tooltip from '../components/Tooltip';
import { MOCK_CANDLES, getCandlesForTimeframe } from '../constants';
import {
  Bell,
  Search,
  LayoutGrid,
  Folder,
  FileText,
  User,
  Plus,
  ChevronDown,
  BarChart2,
  Activity,
  Layers,
  TrendingUp,
  Crosshair,
  Brush,
  Type,
  Ruler,
  Magnet,
  Lock,
  EyeOff,
  Eye,
  Trash2,
  GanttChartSquare,
  Smile,
  Home,
  Unlock,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Hand
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface Drawing {
  id: string;
  type: DrawingTool;
  points: { x: number; y: number }[];
  text?: string;
}

function Terminal() {
  const [activeTab, setActiveTab] = useState<'book' | 'trades'>('book');
  const [timeFrame, setTimeFrame] = useState('1H');
  const [chartData, setChartData] = useState(MOCK_CANDLES);
  const [chartType, setChartType] = useState<ChartType>('candle');
  const [showChartMenu, setShowChartMenu] = useState(false);
  const [activeTool, setActiveTool] = useState<DrawingTool>('crosshair');

  // Drawing state
  const [drawings, setDrawings] = useState<Drawing[]>([]);
  const [showDrawings, setShowDrawings] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const [magnetEnabled, setMagnetEnabled] = useState(false);

  // Zoom state - data-based zoom for sticky axes
  const [zoomDomain, setZoomDomain] = useState<{ start: number; end: number } | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1); // For display percentage
  const chartContainerRef = useRef<HTMLDivElement>(null);

  // Hovered candle state for OHLC display
  const [hoveredCandle, setHoveredCandle] = useState<HoveredCandle | null>(null);

  useEffect(() => {
    setChartData(getCandlesForTimeframe(timeFrame));
  }, [timeFrame]);

  // Native wheel event listener to prevent browser zoom
  const handleWheelZoom = useCallback((e: WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      e.stopPropagation();

      const dataLength = chartData.length;
      const zoomStep = Math.max(1, Math.floor(dataLength * 0.1)); // 10% of data

      setZoomDomain(prev => {
        const currentStart = prev?.start ?? 0;
        const currentEnd = prev?.end ?? dataLength;
        const currentRange = currentEnd - currentStart;

        if (e.deltaY < 0) {
          // Zoom in - show fewer candles
          const newRange = Math.max(5, currentRange - zoomStep);
          const center = (currentStart + currentEnd) / 2;
          const newStart = Math.max(0, center - newRange / 2);
          const newEnd = Math.min(dataLength, newStart + newRange);
          setZoomLevel(dataLength / newRange);
          return { start: newStart, end: newEnd };
        } else {
          // Zoom out - show more candles
          const newRange = Math.min(dataLength, currentRange + zoomStep);
          const center = (currentStart + currentEnd) / 2;
          const newStart = Math.max(0, center - newRange / 2);
          const newEnd = Math.min(dataLength, newStart + newRange);
          setZoomLevel(dataLength / newRange);
          if (newRange >= dataLength) {
            return null; // Reset to show all data
          }
          return { start: newStart, end: newEnd };
        }
      });
    }
  }, [chartData.length]);

  useEffect(() => {
    const container = chartContainerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheelZoom, { passive: false });
      return () => {
        container.removeEventListener('wheel', handleWheelZoom);
      };
    }
  }, [handleWheelZoom]);

  const tools: { id: DrawingTool; icon: any; label: string }[] = [
    { id: 'hand', icon: Hand, label: 'Pan / Grab' },
    { id: 'crosshair', icon: Crosshair, label: 'Crosshair' },
    { id: 'trend', icon: TrendingUp, label: 'Trend Line' },
    { id: 'fib', icon: GanttChartSquare, label: 'Fibonacci' },
    { id: 'brush', icon: Brush, label: 'Free Draw' },
    { id: 'text', icon: Type, label: 'Add Text' },
    { id: 'patterns', icon: Activity, label: 'Patterns' },
    { id: 'icons', icon: Smile, label: 'Emoji' },
    { id: 'measure', icon: Ruler, label: 'Measure' },
  ];

  const clearAllDrawings = () => {
    setDrawings([]);
  };

  const handleZoomIn = () => {
    const dataLength = chartData.length;
    const zoomStep = Math.max(1, Math.floor(dataLength * 0.15));

    setZoomDomain(prev => {
      const currentStart = prev?.start ?? 0;
      const currentEnd = prev?.end ?? dataLength;
      const currentRange = currentEnd - currentStart;
      const newRange = Math.max(5, currentRange - zoomStep);
      const center = (currentStart + currentEnd) / 2;
      const newStart = Math.max(0, center - newRange / 2);
      const newEnd = Math.min(dataLength, newStart + newRange);
      setZoomLevel(dataLength / newRange);
      return { start: newStart, end: newEnd };
    });
  };

  const handleZoomOut = () => {
    const dataLength = chartData.length;
    const zoomStep = Math.max(1, Math.floor(dataLength * 0.15));

    setZoomDomain(prev => {
      const currentStart = prev?.start ?? 0;
      const currentEnd = prev?.end ?? dataLength;
      const currentRange = currentEnd - currentStart;
      const newRange = Math.min(dataLength, currentRange + zoomStep);
      const center = (currentStart + currentEnd) / 2;
      const newStart = Math.max(0, center - newRange / 2);
      const newEnd = Math.min(dataLength, newStart + newRange);
      setZoomLevel(dataLength / newRange);
      if (newRange >= dataLength) {
        return null;
      }
      return { start: newStart, end: newEnd };
    });
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
    setZoomDomain(null);
  };

  const handlePan = (dx: number) => {
    const dataLength = chartData.length;
    // Pan by shifting the zoom domain left/right
    const panStep = Math.max(1, Math.floor(Math.abs(dx) / 10));

    setZoomDomain(prev => {
      if (!prev) return null; // Can't pan when showing all data
      const shift = dx > 0 ? -panStep : panStep;
      const newStart = Math.max(0, Math.min(dataLength - (prev.end - prev.start), prev.start + shift));
      const newEnd = newStart + (prev.end - prev.start);
      return { start: newStart, end: Math.min(dataLength, newEnd) };
    });
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
      <header className="flex items-center justify-between shrink-0 relative z-10 py-1">
        <div className="flex items-center gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-accent rounded flex items-center justify-center text-ink">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <span className="font-mono font-bold text-xs tracking-widest text-paper uppercase">DarkPool</span>
          </div>

          {/* Nav Bar */}
          <div className="bg-ink border border-paper/10 rounded-lg p-0.5 flex items-center gap-0.5">
             <Link to="/" className="p-1.5 hover:bg-paper/10 text-paper/50 rounded transition-colors"><Home size={14} /></Link>
             <button className="p-1.5 bg-accent text-ink rounded"><LayoutGrid size={14} /></button>
             <button className="p-1.5 hover:bg-paper/10 text-paper/50 rounded transition-colors"><Folder size={14} /></button>
             <button className="p-1.5 hover:bg-paper/10 text-paper/50 rounded transition-colors"><FileText size={14} /></button>
             <button className="p-1.5 hover:bg-paper/10 text-paper/50 rounded transition-colors"><User size={14} /></button>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <div className="relative hidden md:block">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-paper/40" size={12} />
            <input
              type="text"
              placeholder="Search"
              className="bg-ink border border-paper/10 pl-7 pr-3 py-1 rounded text-xs outline-none text-paper placeholder-paper/40 focus:border-accent/50 w-32 font-mono"
            />
          </div>
          <button className="w-6 h-6 bg-ink border border-paper/10 rounded flex items-center justify-center text-paper/50 hover:text-paper hover:border-paper/20 transition-colors">
            <Bell size={12} />
          </button>
          <div className="flex items-center gap-2 pl-2 border-l border-paper/10">
             <div className="w-6 h-6 rounded-full bg-accent overflow-hidden">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" />
             </div>
             <span className="font-mono text-[10px] text-paper/60 hidden md:block">TRADER_01</span>
             <ChevronDown size={10} className="text-paper/40" />
          </div>
        </div>
      </header>

      {/* Main Dashboard Grid */}
      <main className="flex-1 grid grid-cols-12 gap-2 min-h-0 relative z-10">

        {/* Left Column: Chart */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-2 min-h-0">

           {/* Chart Card */}
           <div className="bg-ink border border-paper/10 rounded-lg flex-1 flex flex-col overflow-hidden">
              {/* Chart Header */}
              <div className="flex items-center justify-between px-4 py-2 border-b border-paper/10">
                 <div className="flex items-center gap-4">
                    <h2 className="font-serif text-xl text-paper">Ethereum</h2>
                    <span className="text-[10px] font-mono text-paper/40 bg-paper/5 px-1.5 py-0.5 rounded">ETH-USD</span>

                    {/* OHLC Display - shows hovered candle data or default price */}
                    {hoveredCandle ? (
                      <div className="flex items-center gap-3 font-mono text-xs">
                        <span className="text-paper/40">O:</span>
                        <span className="text-paper">{hoveredCandle.open.toFixed(2)}</span>
                        <span className="text-paper/40">H:</span>
                        <span className="text-q-green">{hoveredCandle.high.toFixed(2)}</span>
                        <span className="text-paper/40">L:</span>
                        <span className="text-q-red">{hoveredCandle.low.toFixed(2)}</span>
                        <span className="text-paper/40">C:</span>
                        <span className={hoveredCandle.change >= 0 ? 'text-q-green' : 'text-q-red'}>
                          {hoveredCandle.close.toFixed(2)}
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${hoveredCandle.changePercent >= 0 ? 'text-q-green bg-q-green/10' : 'text-q-red bg-q-red/10'}`}>
                          {hoveredCandle.changePercent >= 0 ? '+' : ''}{hoveredCandle.changePercent.toFixed(2)}%
                        </span>
                      </div>
                    ) : (
                      <>
                        <span className="text-lg font-mono font-bold text-paper">$2,983.18</span>
                        <span className="text-xs font-mono text-q-green bg-q-green/10 px-1.5 py-0.5 rounded">+1.28%</span>
                      </>
                    )}
                 </div>

                 <div className="flex items-center gap-2">
                    {/* Drawing count indicator */}
                    {drawings.length > 0 && (
                      <span className="text-[10px] font-mono text-accent bg-accent/10 px-2 py-0.5 rounded">
                        {drawings.length} drawing{drawings.length > 1 ? 's' : ''}
                      </span>
                    )}

                    {/* Zoom Controls */}
                    <div className="flex items-center gap-1 bg-charcoal rounded p-0.5">
                      <Tooltip text="Zoom Out" position="bottom">
                        <button
                          onClick={handleZoomOut}
                          disabled={zoomLevel <= 1}
                          className={`p-1 rounded text-paper/50 hover:text-paper hover:bg-paper/10 transition-colors ${zoomLevel <= 1 ? 'opacity-30 cursor-not-allowed' : ''}`}
                        >
                          <ZoomOut size={14} />
                        </button>
                      </Tooltip>
                      <span className="text-[10px] font-mono text-paper/60 min-w-[40px] text-center">
                        {Math.round(zoomLevel * 100)}%
                      </span>
                      <Tooltip text="Zoom In" position="bottom">
                        <button
                          onClick={handleZoomIn}
                          disabled={zoomLevel >= 10}
                          className={`p-1 rounded text-paper/50 hover:text-paper hover:bg-paper/10 transition-colors ${zoomLevel >= 10 ? 'opacity-30 cursor-not-allowed' : ''}`}
                        >
                          <ZoomIn size={14} />
                        </button>
                      </Tooltip>
                      <Tooltip text="Reset Zoom" position="bottom">
                        <button
                          onClick={handleResetZoom}
                          className="p-1 rounded text-paper/50 hover:text-paper hover:bg-paper/10 transition-colors"
                        >
                          <Maximize2 size={14} />
                        </button>
                      </Tooltip>
                    </div>

                    {/* Timeframes */}
                    <div className="bg-charcoal rounded p-0.5 flex font-mono text-[10px]">
                       {['1H', '1D', '1W', '1M', '1Y'].map((tf) => (
                         <button
                            key={tf}
                            onClick={() => setTimeFrame(tf)}
                            className={`px-2 py-1 rounded transition-all ${timeFrame === tf ? 'bg-accent text-ink' : 'text-paper/50 hover:text-paper'}`}
                         >
                           {tf}
                         </button>
                       ))}
                    </div>

                    {/* Chart Type */}
                    <div className="relative">
                      <button
                         onClick={() => setShowChartMenu(!showChartMenu)}
                         className="w-7 h-7 rounded border border-paper/20 flex items-center justify-center hover:bg-paper/5 text-paper/60 hover:text-paper transition-colors"
                      >
                         {chartType === 'candle' && <BarChart2 size={14} className="rotate-90" />}
                         {chartType === 'bar' && <BarChart2 size={14} />}
                         {chartType === 'line' && <Activity size={14} />}
                         {chartType === 'area' && <Layers size={14} />}
                      </button>

                      {showChartMenu && (
                        <div className="absolute top-8 right-0 bg-ink border border-paper/20 shadow-lg rounded p-1 flex flex-col gap-0.5 w-24 z-30">
                           <button onClick={() => { setChartType('candle'); setShowChartMenu(false); }} className={`flex items-center gap-2 px-2 py-1 rounded text-[10px] font-mono ${chartType === 'candle' ? 'bg-accent text-ink' : 'text-paper/60 hover:text-paper hover:bg-paper/5'}`}>
                              <BarChart2 size={12} className="rotate-90" /> Candles
                           </button>
                           <button onClick={() => { setChartType('bar'); setShowChartMenu(false); }} className={`flex items-center gap-2 px-2 py-1 rounded text-[10px] font-mono ${chartType === 'bar' ? 'bg-accent text-ink' : 'text-paper/60 hover:text-paper hover:bg-paper/5'}`}>
                              <BarChart2 size={12} /> Bars
                           </button>
                           <button onClick={() => { setChartType('line'); setShowChartMenu(false); }} className={`flex items-center gap-2 px-2 py-1 rounded text-[10px] font-mono ${chartType === 'line' ? 'bg-accent text-ink' : 'text-paper/60 hover:text-paper hover:bg-paper/5'}`}>
                              <Activity size={12} /> Line
                           </button>
                           <button onClick={() => { setChartType('area'); setShowChartMenu(false); }} className={`flex items-center gap-2 px-2 py-1 rounded text-[10px] font-mono ${chartType === 'area' ? 'bg-accent text-ink' : 'text-paper/60 hover:text-paper hover:bg-paper/5'}`}>
                              <Layers size={12} /> Area
                           </button>
                        </div>
                      )}
                    </div>

                    <button className="bg-accent text-ink px-3 py-1.5 rounded font-mono text-[10px] uppercase tracking-wider flex items-center gap-1.5 hover:opacity-90 transition-opacity">
                       <Plus size={12} /> Alert
                    </button>
                 </div>
              </div>

              {/* Chart Body */}
              <div className="flex-1 w-full min-h-0 relative flex flex-row">
                  {/* Left Drawing Toolbar */}
                  <div className="w-12 border-r border-paper/10 flex flex-col items-center py-2 gap-1 bg-ink/50">
                      {tools.map((tool) => {
                          const Icon = tool.icon;
                          const isActive = activeTool === tool.id;
                          return (
                            <Tooltip key={tool.id} text={tool.label} position="right">
                               <button
                                 onClick={() => !isLocked && setActiveTool(tool.id)}
                                 className={`p-2 rounded transition-all ${isActive ? 'text-accent bg-accent/10' : 'text-paper/40 hover:text-paper hover:bg-paper/5'} ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                               >
                                  <Icon size={18} strokeWidth={1.5} />
                               </button>
                            </Tooltip>
                          );
                      })}
                      <div className="flex-1" />
                      <div className="w-6 h-px bg-paper/10 my-1" />

                      {/* Magnet */}
                      <Tooltip text="Magnet Mode" position="right">
                        <button
                          onClick={() => setMagnetEnabled(!magnetEnabled)}
                          className={`p-2 rounded transition-all ${magnetEnabled ? 'text-accent bg-accent/10' : 'text-paper/40 hover:text-paper hover:bg-paper/5'}`}
                        >
                          <Magnet size={18} />
                        </button>
                      </Tooltip>

                      {/* Lock */}
                      <Tooltip text={isLocked ? "Unlock" : "Lock"} position="right">
                        <button
                          onClick={() => setIsLocked(!isLocked)}
                          className={`p-2 rounded transition-all ${isLocked ? 'text-accent bg-accent/10' : 'text-paper/40 hover:text-paper hover:bg-paper/5'}`}
                        >
                          {isLocked ? <Lock size={18} /> : <Unlock size={18} />}
                        </button>
                      </Tooltip>

                      {/* Hide/Show */}
                      <Tooltip text={showDrawings ? "Hide" : "Show"} position="right">
                        <button
                          onClick={() => setShowDrawings(!showDrawings)}
                          className={`p-2 rounded transition-all ${!showDrawings ? 'text-accent bg-accent/10' : 'text-paper/40 hover:text-paper hover:bg-paper/5'}`}
                        >
                          {showDrawings ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </Tooltip>

                      {/* Delete All */}
                      <Tooltip text="Clear All" position="right">
                        <button
                          onClick={clearAllDrawings}
                          className={`p-2 rounded transition-all text-paper/40 hover:text-q-red hover:bg-q-red/10 ${drawings.length === 0 ? 'opacity-30 cursor-not-allowed' : ''}`}
                          disabled={drawings.length === 0}
                        >
                          <Trash2 size={18} />
                        </button>
                      </Tooltip>
                  </div>

                  {/* Chart Area */}
                  <div
                    ref={chartContainerRef}
                    className="flex-1 relative w-full h-full p-2 overflow-hidden"
                  >
                      <div className="w-full h-full">
                        <CandleChart
                          data={chartData}
                          isDark={true}
                          type={chartType}
                          onHover={setHoveredCandle}
                          zoomDomain={zoomDomain}
                        />
                      </div>
                      {!isLocked && (
                        <ChartOverlay
                          activeTool={activeTool}
                          drawings={drawings}
                          setDrawings={setDrawings}
                          showDrawings={showDrawings}
                          onPan={handlePan}
                        />
                      )}
                  </div>
              </div>
           </div>
        </div>

        {/* Right Column: Order Entry & Book */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-2 min-h-0">

           {/* Order Entry Card */}
           <div className="bg-ink border border-paper/10 rounded-lg p-3">
              <OrderEntry />
           </div>

           {/* Order Book Card */}
           <div className="bg-ink border border-paper/10 rounded-lg p-3 flex-1 flex flex-col min-h-0 overflow-hidden">
               <div className="flex items-center gap-4 mb-2 border-b border-paper/10 pb-2">
                   <button
                     onClick={() => setActiveTab('book')}
                     className={`font-mono text-xs uppercase tracking-wider transition-colors relative ${activeTab === 'book' ? 'text-accent' : 'text-paper/40 hover:text-paper'}`}
                   >
                     Order Book
                     {activeTab === 'book' && <div className="absolute -bottom-2 left-0 right-0 h-0.5 bg-accent"></div>}
                   </button>
                   <button
                     onClick={() => setActiveTab('trades')}
                     className={`font-mono text-xs uppercase tracking-wider transition-colors relative ${activeTab === 'trades' ? 'text-accent' : 'text-paper/40 hover:text-paper'}`}
                   >
                     Trades
                     {activeTab === 'trades' && <div className="absolute -bottom-2 left-0 right-0 h-0.5 bg-accent"></div>}
                   </button>
               </div>
               <div className="flex-1 overflow-hidden">
                   <OrderBook />
               </div>
           </div>

        </div>

      </main>
    </div>
  );
}

export default Terminal;
