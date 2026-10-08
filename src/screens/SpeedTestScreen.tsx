import React from 'react';
import { Play, RotateCw, Gauge, Activity, ArrowDown, ArrowUp, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const SpeedTestScreen: React.FC = () => {
  const { speedTestState, startSpeedTest, selectedProxy, connectionState } = useApp();

  const isConnected = connectionState === 'CONNECTED';
  const { running, phase, pingMs, jitterMs, downloadMbps, uploadMbps, packetLoss, progress } =
    speedTestState;

  // Calculate speedometer needle angle (-110 deg to +110 deg)
  const currentSpeed = phase === 'download' ? downloadMbps : phase === 'upload' ? uploadMbps : 0;
  const maxScaleSpeed = 250; // 250 Mbps
  const ratio = Math.min(1, currentSpeed / maxScaleSpeed);
  const needleAngle = -110 + ratio * 220;

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] p-4 max-w-md mx-auto text-slate-100 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between py-2 border-b border-slate-800 mb-4">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-400 font-semibold">
            Diagnostics
          </span>
          <h1 className="text-xl font-bold tracking-tight">Speed Test</h1>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-mono">
          <span
            className={`w-2 h-2 rounded-full ${
              isConnected ? 'bg-emerald-400' : 'bg-amber-400'
            }`}
          />
          <span>{isConnected ? 'VPN Active' : 'Direct'}</span>
        </div>
      </div>

      {/* Target Server Card */}
      <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Gauge className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block">Test Target</span>
            <span className="text-sm font-semibold text-slate-200">
              {selectedProxy?.countryName || 'Global Edge'} ({selectedProxy?.cityCode || 'FASTEST'})
            </span>
          </div>
        </div>
        <span className="text-xs font-mono text-cyan-400">
          {selectedProxy?.host?.split('.')[0] || 'air-node'}
        </span>
      </div>

      {/* Speedometer Gauge */}
      <div className="relative flex flex-col items-center justify-center py-6 my-2">
        {/* Circular Gauge Graphic (SVG) */}
        <div className="relative w-64 h-64 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
            {/* Background Arc */}
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="#1E293B"
              strokeWidth="7"
              strokeDasharray="188.5 251.3"
              strokeLinecap="round"
              fill="transparent"
            />
            {/* Active Colored Arc */}
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="url(#speedGrad)"
              strokeWidth="7"
              strokeDasharray={`${(ratio * 188.5).toFixed(1)} 251.3`}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-300"
            />
            <defs>
              <linearGradient id="speedGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00F2FE" />
                <stop offset="100%" stopColor="#00F298" />
              </linearGradient>
            </defs>
          </svg>

          {/* Needle / Value Center Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-xs uppercase font-mono tracking-widest text-slate-400">
              {phase === 'ping'
                ? 'TESTING PING'
                : phase === 'download'
                ? 'DOWNLOADING'
                : phase === 'upload'
                ? 'UPLOADING'
                : phase === 'completed'
                ? 'RESULT'
                : 'IDLE'}
            </span>

            <span className="text-5xl font-extrabold font-mono tracking-tight text-white mt-1">
              {phase === 'download'
                ? downloadMbps.toFixed(1)
                : phase === 'upload'
                ? uploadMbps.toFixed(1)
                : phase === 'completed'
                ? downloadMbps.toFixed(1)
                : '0.0'}
            </span>

            <span className="text-xs font-semibold text-cyan-400 mt-0.5">
              Mbps
            </span>

            {running && (
              <div className="w-24 mt-2 bg-slate-800 h-1 rounded-full overflow-hidden">
                <div
                  className="bg-cyan-400 h-full transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Metrics Row (Ping, Jitter, Download, Upload) */}
      <div className="grid grid-cols-4 gap-2 mb-6 text-center">
        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] text-slate-400 block">Ping</span>
          <span className="font-mono text-sm font-bold text-slate-200 mt-0.5 block">
            {pingMs > 0 ? `${pingMs}ms` : '—'}
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] text-slate-400 block">Jitter</span>
          <span className="font-mono text-sm font-bold text-slate-200 mt-0.5 block">
            {jitterMs > 0 ? `${jitterMs}ms` : '—'}
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] text-emerald-400 flex items-center justify-center gap-0.5">
            <ArrowDown className="w-2.5 h-2.5" /> Down
          </span>
          <span className="font-mono text-sm font-bold text-slate-200 mt-0.5 block">
            {downloadMbps > 0 ? `${downloadMbps.toFixed(1)}M` : '—'}
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] text-cyan-400 flex items-center justify-center gap-0.5">
            <ArrowUp className="w-2.5 h-2.5" /> Up
          </span>
          <span className="font-mono text-sm font-bold text-slate-200 mt-0.5 block">
            {uploadMbps > 0 ? `${uploadMbps.toFixed(1)}M` : '—'}
          </span>
        </div>
      </div>

      {/* Primary Action Button */}
      <button
        onClick={startSpeedTest}
        disabled={running}
        className="w-full py-3.5 rounded-xl font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.35)] disabled:opacity-50 transition transform active:scale-98"
      >
        {running ? (
          <>
            <RotateCw className="w-5 h-5 animate-spin" />
            <span>Running Test ({progress}%)…</span>
          </>
        ) : (
          <>
            <Play className="w-5 h-5 fill-current" />
            <span>{phase === 'completed' ? 'Test Again' : 'Start Speed Test'}</span>
          </>
        )}
      </button>
    </div>
  );
};
