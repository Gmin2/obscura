import React, { useState, useRef } from 'react';

export type DrawingTool = 'hand' | 'crosshair' | 'trend' | 'fib' | 'brush' | 'text' | 'patterns' | 'icons' | 'measure';

interface Point {
  x: number;
  y: number;
}

interface Drawing {
  id: string;
  type: DrawingTool;
  points: Point[];
  text?: string;
}

interface ChartOverlayProps {
  activeTool: DrawingTool;
  drawings: Drawing[];
  setDrawings: React.Dispatch<React.SetStateAction<Drawing[]>>;
  showDrawings: boolean;
  onPan?: (dx: number, dy: number) => void;
}

const ChartOverlay: React.FC<ChartOverlayProps> = ({
  activeTool,
  drawings,
  setDrawings,
  showDrawings,
  onPan
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [currentPoints, setCurrentPoints] = useState<Point[]>([]);
  const [mousePos, setMousePos] = useState<Point | null>(null);
  const [lastPanPos, setLastPanPos] = useState<Point | null>(null);
  const [textInput, setTextInput] = useState<{ show: boolean; pos: Point | null }>({ show: false, pos: null });
  const [textValue, setTextValue] = useState('');

  const getMousePos = (e: React.MouseEvent): Point => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const pos = getMousePos(e);
    setMousePos(pos);

    if (isPanning && activeTool === 'hand' && lastPanPos && onPan) {
      const dx = pos.x - lastPanPos.x;
      const dy = pos.y - lastPanPos.y;
      onPan(dx, dy);
      setLastPanPos(pos);
    }

    if (isDrawing && activeTool === 'brush') {
      setCurrentPoints(prev => [...prev, pos]);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const pos = getMousePos(e);

    if (activeTool === 'hand') {
      setIsPanning(true);
      setLastPanPos(pos);
      return;
    }

    if (activeTool === 'text') {
      setTextInput({ show: true, pos });
      return;
    }

    if (activeTool === 'crosshair') return;

    setIsDrawing(true);
    setCurrentPoints([pos]);
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (isPanning) {
      setIsPanning(false);
      setLastPanPos(null);
      return;
    }

    if (!isDrawing) return;

    const pos = getMousePos(e);

    if (activeTool === 'trend' || activeTool === 'fib' || activeTool === 'measure') {
      const newDrawing: Drawing = {
        id: Date.now().toString(),
        type: activeTool,
        points: [currentPoints[0], pos]
      };
      setDrawings(prev => [...prev, newDrawing]);
    } else if (activeTool === 'brush' && currentPoints.length > 1) {
      const newDrawing: Drawing = {
        id: Date.now().toString(),
        type: 'brush',
        points: currentPoints
      };
      setDrawings(prev => [...prev, newDrawing]);
    }

    setIsDrawing(false);
    setCurrentPoints([]);
  };

  const handleTextSubmit = () => {
    if (textValue.trim() && textInput.pos) {
      const newDrawing: Drawing = {
        id: Date.now().toString(),
        type: 'text',
        points: [textInput.pos],
        text: textValue
      };
      setDrawings(prev => [...prev, newDrawing]);
    }
    setTextInput({ show: false, pos: null });
    setTextValue('');
  };

  const renderDrawing = (drawing: Drawing) => {
    if (!showDrawings) return null;

    switch (drawing.type) {
      case 'trend':
        return (
          <line
            key={drawing.id}
            x1={drawing.points[0].x}
            y1={drawing.points[0].y}
            x2={drawing.points[1].x}
            y2={drawing.points[1].y}
            stroke="#F25C33"
            strokeWidth={2}
          />
        );

      case 'fib':
        const [p1, p2] = drawing.points;
        const height = p2.y - p1.y;
        const levels = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1];
        return (
          <g key={drawing.id}>
            {levels.map((level, i) => {
              const y = p1.y + height * level;
              return (
                <g key={i}>
                  <line
                    x1={Math.min(p1.x, p2.x)}
                    y1={y}
                    x2={Math.max(p1.x, p2.x)}
                    y2={y}
                    stroke="#F25C33"
                    strokeWidth={1}
                    strokeDasharray={level === 0 || level === 1 ? "0" : "4 2"}
                    opacity={0.7}
                  />
                  <text
                    x={Math.max(p1.x, p2.x) + 5}
                    y={y + 4}
                    fill="#F25C33"
                    fontSize={10}
                    fontFamily="JetBrains Mono"
                  >
                    {(level * 100).toFixed(1)}%
                  </text>
                </g>
              );
            })}
          </g>
        );

      case 'brush':
        if (drawing.points.length < 2) return null;
        const pathData = drawing.points.map((p, i) =>
          `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
        ).join(' ');
        return (
          <path
            key={drawing.id}
            d={pathData}
            stroke="#F25C33"
            strokeWidth={2}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        );

      case 'text':
        return (
          <text
            key={drawing.id}
            x={drawing.points[0].x}
            y={drawing.points[0].y}
            fill="#E6E2D6"
            fontSize={12}
            fontFamily="JetBrains Mono"
          >
            {drawing.text}
          </text>
        );

      case 'measure':
        const [m1, m2] = drawing.points;
        const dx = m2.x - m1.x;
        const dy = m2.y - m1.y;
        const distance = Math.sqrt(dx * dx + dy * dy).toFixed(0);
        const midX = (m1.x + m2.x) / 2;
        const midY = (m1.y + m2.y) / 2;
        return (
          <g key={drawing.id}>
            <line
              x1={m1.x}
              y1={m1.y}
              x2={m2.x}
              y2={m2.y}
              stroke="#4ADE80"
              strokeWidth={1}
              strokeDasharray="4 2"
            />
            <circle cx={m1.x} cy={m1.y} r={4} fill="#4ADE80" />
            <circle cx={m2.x} cy={m2.y} r={4} fill="#4ADE80" />
            <rect
              x={midX - 25}
              y={midY - 10}
              width={50}
              height={20}
              fill="#1A1A1A"
              rx={4}
            />
            <text
              x={midX}
              y={midY + 4}
              fill="#4ADE80"
              fontSize={10}
              fontFamily="JetBrains Mono"
              textAnchor="middle"
            >
              {distance}px
            </text>
          </g>
        );

      default:
        return null;
    }
  };

  const renderCurrentDrawing = () => {
    if (!isDrawing || currentPoints.length === 0 || !mousePos) return null;

    if (activeTool === 'trend' || activeTool === 'fib' || activeTool === 'measure') {
      return (
        <line
          x1={currentPoints[0].x}
          y1={currentPoints[0].y}
          x2={mousePos.x}
          y2={mousePos.y}
          stroke="#F25C33"
          strokeWidth={2}
          strokeDasharray="4 4"
          opacity={0.7}
        />
      );
    }

    if (activeTool === 'brush' && currentPoints.length > 1) {
      const pathData = currentPoints.map((p, i) =>
        `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
      ).join(' ');
      return (
        <path
          d={pathData}
          stroke="#F25C33"
          strokeWidth={2}
          fill="none"
          strokeLinecap="round"
          opacity={0.7}
        />
      );
    }

    return null;
  };

  const renderCrosshair = () => {
    if (activeTool !== 'crosshair' || !mousePos) return null;

    const svg = svgRef.current;
    if (!svg) return null;
    const { width, height } = svg.getBoundingClientRect();

    return (
      <g>
        <line
          x1={0}
          y1={mousePos.y}
          x2={width}
          y2={mousePos.y}
          stroke="#F25C33"
          strokeWidth={1}
          strokeDasharray="4 4"
          opacity={0.5}
        />
        <line
          x1={mousePos.x}
          y1={0}
          x2={mousePos.x}
          y2={height}
          stroke="#F25C33"
          strokeWidth={1}
          strokeDasharray="4 4"
          opacity={0.5}
        />
        <circle
          cx={mousePos.x}
          cy={mousePos.y}
          r={4}
          fill="none"
          stroke="#F25C33"
          strokeWidth={2}
        />
      </g>
    );
  };

  const getCursor = () => {
    switch (activeTool) {
      case 'hand':
        return isPanning ? 'grabbing' : 'grab';
      case 'crosshair':
        return 'crosshair';
      case 'text':
        return 'text';
      default:
        return 'crosshair';
    }
  };

  return (
    <div className="absolute inset-0 z-10">
      <svg
        ref={svgRef}
        className="w-full h-full"
        style={{ cursor: getCursor() }}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {
          setMousePos(null);
          if (isDrawing) {
            setIsDrawing(false);
            setCurrentPoints([]);
          }
          if (isPanning) {
            setIsPanning(false);
            setLastPanPos(null);
          }
        }}
      >
        {drawings.map(renderDrawing)}
        {renderCurrentDrawing()}
        {renderCrosshair()}
      </svg>

      {/* Text Input Modal */}
      {textInput.show && textInput.pos && (
        <div
          className="absolute bg-ink border border-paper/20 rounded-lg p-2 shadow-lg"
          style={{ left: textInput.pos.x, top: textInput.pos.y }}
        >
          <input
            autoFocus
            type="text"
            value={textValue}
            onChange={(e) => setTextValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleTextSubmit();
              if (e.key === 'Escape') setTextInput({ show: false, pos: null });
            }}
            className="bg-charcoal border border-paper/10 rounded px-2 py-1 text-xs font-mono text-paper outline-none focus:border-accent w-32"
            placeholder="Enter text..."
          />
          <div className="flex gap-1 mt-1">
            <button
              onClick={handleTextSubmit}
              className="flex-1 bg-accent text-ink text-[10px] font-mono py-1 rounded hover:opacity-90"
            >
              Add
            </button>
            <button
              onClick={() => setTextInput({ show: false, pos: null })}
              className="flex-1 bg-paper/10 text-paper/60 text-[10px] font-mono py-1 rounded hover:bg-paper/20"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChartOverlay;
