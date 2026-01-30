import React, { useMemo } from 'react';
import { ResponsiveContainer, ComposedChart, XAxis, YAxis, Tooltip, Bar, ReferenceLine, CartesianGrid, Area, Line } from 'recharts';
import type { CandleData } from '../types';

export type ChartType = 'candle' | 'bar' | 'line' | 'area';

export interface HoveredCandle {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
  change: number;
  changePercent: number;
}

interface CandleChartProps {
  data: CandleData[];
  isDark?: boolean;
  type?: ChartType;
  onHover?: (candle: HoveredCandle | null) => void;
  zoomDomain?: { start: number; end: number } | null;
}

const CustomCandle = (props: any) => {
  const { x, y, width, height, payload } = props;
  const isUp = payload.close > payload.open;
  const color = isUp ? '#4ADE80' : '#F87171';

  const { open, close, high, low } = payload;
  const totalRange = high - low;
  const bodyTop = Math.max(open, close);
  const bodyBottom = Math.min(open, close);

  const bodyY = ((high - bodyTop) / totalRange) * height;
  const bodyH = ((bodyTop - bodyBottom) / totalRange) * height;
  const visualBodyH = Math.max(bodyH, 2);

  return (
    <g>
      <line x1={x + width / 2} y1={y} x2={x + width / 2} y2={y + height} stroke={color} strokeWidth={1.5} opacity={0.8} />
      <rect x={x} y={y + bodyY} width={width} height={visualBodyH} fill={color} rx={1} ry={1} />
    </g>
  );
};

const CustomBar = (props: any) => {
  const { x, y, width, height, payload } = props;
  const isUp = payload.close > payload.open;
  const color = isUp ? '#4ADE80' : '#F87171';

  const { open, close, high, low } = payload;
  const totalRange = high - low;

  const openOffset = ((high - open) / totalRange) * height;
  const closeOffset = ((high - close) / totalRange) * height;

  const center = x + width / 2;
  const halfWidth = width / 2;

  return (
    <g stroke={color} strokeWidth={1.5}>
       <line x1={center} y1={y} x2={center} y2={y + height} />
       <line x1={center} y1={y + openOffset} x2={center - halfWidth} y2={y + openOffset} />
       <line x1={center} y1={y + closeOffset} x2={center + halfWidth} y2={y + closeOffset} />
    </g>
  )
}

// Custom OHLC Tooltip
const CustomTooltip = ({ active, payload, onHover }: any) => {
  if (active && payload && payload.length > 0) {
    const data = payload[0].payload;
    const change = data.close - data.open;
    const changePercent = ((change / data.open) * 100);
    const isUp = change >= 0;

    // Report to parent
    if (onHover) {
      onHover({
        time: data.time,
        open: data.open,
        high: data.high,
        low: data.low,
        close: data.close,
        volume: data.volume,
        change,
        changePercent
      });
    }

    const greenColor = '#4ADE80';
    const redColor = '#F87171';
    const paperColor = '#E6E2D6';
    const mutedColor = 'rgba(230, 226, 214, 0.5)';

    // Show tooltip on chart
    return (
      <div
        style={{
          backgroundColor: 'rgba(31, 31, 31, 0.95)',
          border: '1px solid rgba(230, 226, 214, 0.2)',
          borderRadius: '8px',
          padding: '8px 12px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(8px)',
          fontFamily: 'JetBrains Mono, monospace',
          minWidth: '100px',
        }}
      >
        <div style={{ fontSize: '10px', color: mutedColor, marginBottom: '6px' }}>{data.time}</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px 12px', fontSize: '11px' }}>
          <span style={{ color: mutedColor }}>O</span>
          <span style={{ color: paperColor, textAlign: 'right' }}>{data.open.toFixed(2)}</span>
          <span style={{ color: mutedColor }}>H</span>
          <span style={{ color: greenColor, textAlign: 'right' }}>{data.high.toFixed(2)}</span>
          <span style={{ color: mutedColor }}>L</span>
          <span style={{ color: redColor, textAlign: 'right' }}>{data.low.toFixed(2)}</span>
          <span style={{ color: mutedColor }}>C</span>
          <span style={{ color: isUp ? greenColor : redColor, textAlign: 'right' }}>{data.close.toFixed(2)}</span>
        </div>
        <div style={{
          marginTop: '6px',
          paddingTop: '6px',
          borderTop: '1px solid rgba(230, 226, 214, 0.1)',
          fontSize: '10px',
          textAlign: 'center',
          color: isUp ? greenColor : redColor,
        }}>
          {isUp ? '+' : ''}{changePercent.toFixed(2)}%
        </div>
      </div>
    );
  } else if (onHover) {
    onHover(null);
  }

  return null;
};

const CandleChart: React.FC<CandleChartProps> = ({ data, isDark, type = 'candle', onHover, zoomDomain }) => {
  const processedData = useMemo(() => {
    let slicedData = data;

    // Apply zoom domain (data slicing)
    if (zoomDomain) {
      const startIdx = Math.max(0, Math.floor(zoomDomain.start));
      const endIdx = Math.min(data.length, Math.ceil(zoomDomain.end));
      slicedData = data.slice(startIdx, endIdx);
    }

    return slicedData.map(d => ({
      ...d,
      range: [d.low, d.high]
    }));
  }, [data, zoomDomain]);

  const axisColor = isDark ? '#8A8A7A' : '#9CA3AF';
  const gridColor = isDark ? '#333333' : '#E5E7EB';
  const mainColor = '#4ADE80';

  return (
    <div className="h-full w-full select-none">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={processedData} margin={{ top: 10, right: 50, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorClose" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={mainColor} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={mainColor} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke={gridColor} strokeDasharray="3 3" />
          <XAxis
            dataKey="time"
            axisLine={false}
            tickLine={false}
            tick={{ fill: axisColor, fontSize: 10, fontFamily: 'JetBrains Mono' }}
            minTickGap={60}
            dy={10}
          />
          <YAxis
            domain={['auto', 'auto']}
            orientation="right"
            axisLine={false}
            tickLine={false}
            tick={{ fill: axisColor, fontSize: 10, fontFamily: 'JetBrains Mono' }}
            tickFormatter={(val) => val.toFixed(2)}
            width={55}
          />
          <Tooltip
            content={<CustomTooltip onHover={onHover} />}
            cursor={{ stroke: '#F25C33', strokeWidth: 1, strokeDasharray: '4 4' }}
            wrapperStyle={{ zIndex: 100, outline: 'none' }}
            allowEscapeViewBox={{ x: true, y: true }}
          />
          <ReferenceLine y={2983.18} stroke="#F25C33" strokeDasharray="3 3" strokeOpacity={0.5} />

          {(type === 'candle' || type === 'bar') && (
             <Bar
               dataKey="range"
               shape={type === 'candle' ? <CustomCandle /> : <CustomBar />}
               barSize={type === 'bar' ? 6 : 8}
               isAnimationActive={false}
             />
          )}

          {type === 'line' && (
             <Line type="monotone" dataKey="close" stroke={mainColor} strokeWidth={2} dot={false} isAnimationActive={false} />
          )}

          {type === 'area' && (
             <Area type="monotone" dataKey="close" stroke={mainColor} fillOpacity={1} fill="url(#colorClose)" strokeWidth={2} isAnimationActive={false} />
          )}

        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CandleChart;
