import React from 'react';
import { ArrowDown, ArrowUp, Zap } from 'lucide-react';
import { formatBytesPerSecond } from '../utils/format';

interface NetworkWaveProps {
  downloadHistory: number[];
  uploadHistory: number[];
  currentDown: number;
  currentUp: number;
  isConnected: boolean;
}

export const NetworkWave: React.FC<NetworkWaveProps> = ({
  downloadHistory,
  uploadHistory,
  currentDown,
  currentUp,
  isConnected,
}) => {
  const pointsCount = 24;
  const history = downloadHistory.length > 0 ? downloadHistory.slice(-pointsCount) : Array(pointsCount).fill(0);
  const upHist = uploadHistory.length > 0 ? uploadHistory.slice(-pointsCount) : Array(pointsCount).fill(0);

  const maxVal = Math.max(...history, ...upHist, 100000); // at least 100 KB
  const height = 48;
  const width = 280;

  // Build SVG path
  const step = width / (pointsCount - 1);
  const pathD = history
    .map((val, i) => {
      const x = i * step;
      const y = height - (val / maxVal) * (height - 6) - 3;
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');

  const areaD = `${pathD} L ${width} ${height} L 0 ${height} Z`;

  return (
    <div className="w-full p-3 rounded-2xl bg-slate-900/90 border border-cyan-500/20 backdrop-blur-md">
      <div className="flex items-center justify-between mb-1.5 text-xs">
        <div className="flex items-center gap-1.5 text-cyan-400 font-semibold font-mono">
          <Zap className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span>LIVE TELEMETRY</span>
        </div>
        <div className="flex items-center gap-3 font-mono text-[11px]">
          <span className="flex items-center gap-0.5 text-emerald-400">
            <ArrowDown className="w-3 h-3" />
            {formatBytesPerSecond(currentDown)}
          </span>
          <span className="flex items-center gap-0.5 text-cyan-400">
            <ArrowUp className="w-3 h-3" />
            {formatBytesPerSecond(currentUp)}
          </span>
        </div>
      </div>

      {/* SVG Waveform Canvas */}
      <div className="relative w-full h-12 overflow-hidden rounded-xl bg-slate-950/70">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full" preserveAspectRatio="none">
          <defs>
            <linearGradient id="waveFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00F298" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#00F298" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Area Fill */}
          <path d={areaD} fill="url(#waveFill)" />

          {/* Stroke Line */}
          <path
            d={pathD}
            fill="none"
            stroke={isConnected ? '#00F298' : '#64748B'}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        {/* Center Grid Hairline */}
        <div className="absolute inset-x-0 top-1/2 border-b border-cyan-500/10 pointer-events-none" />
      </div>
    </div>
  );
};
