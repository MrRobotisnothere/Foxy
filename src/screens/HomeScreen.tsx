import React from 'react';
import {
  Power,
  Globe,
  Share2,
  Terminal,
  Lock,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { WorldMap } from '../components/WorldMap';
import { NetworkWave } from '../components/NetworkWave';
import { ExportModal } from '../components/ExportModal';
import { formatDuration } from '../utils/format';

export const HomeScreen: React.FC = () => {
  const {
    connectionState,
    lastError,
    connectDuration,
    downloadSpeed,
    uploadSpeed,
    throughputHistory,
    uploadHistory,
    selectedProxy,
    setSelectedProxy,
    requestConnect,
    disconnect,
    verifiedExitCountry,
    setActiveTab,
    isExportModalOpen,
    setIsExportModalOpen,
    settings,
  } = useApp();

  const isConnected = connectionState === 'CONNECTED';
  const isConnecting = connectionState === 'CONNECTING';

  const handlePowerClick = () => {
    if (connectionState === 'DISCONNECTED') {
      requestConnect();
    } else {
      disconnect();
    }
  };

  const locationLabel = selectedProxy
    ? selectedProxy.countryName || selectedProxy.countryCode
    : 'Recommended Gateway';

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] p-4 max-w-md mx-auto text-slate-100 pb-20 space-y-4">
      {/* Top Header */}
      <header className="flex items-center justify-between py-1">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.4)] font-extrabold text-sm tracking-tighter">
            AIR
          </div>
          <div>
            <h1 className="text-lg font-extrabold tracking-tight text-white flex items-center gap-1.5">
              <span>AIRVPN</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                PRO
              </span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsExportModalOpen(true)}
            title="Export Profile"
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-400 transition"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Interactive Global Edge Map */}
      <WorldMap
        selectedProxy={selectedProxy}
        onSelectNode={setSelectedProxy}
        isConnected={isConnected}
      />

      {/* Quantum Power Core (Main Button) */}
      <div className="relative flex flex-col items-center justify-center py-4 select-none">
        {/* Holographic Glowing Outer Ring */}
        <div
          onClick={handlePowerClick}
          className="relative flex items-center justify-center cursor-pointer group active:scale-95 transition-transform"
          style={{ width: '190px', height: '190px' }}
        >
          {/* Ambient Glow Aura */}
          <div
            className={`absolute inset-0 rounded-full blur-xl transition-all duration-700 ${
              isConnected
                ? 'bg-emerald-500/35 shadow-[0_0_50px_rgba(16,185,129,0.5)]'
                : isConnecting
                ? 'bg-amber-500/30 animate-pulse'
                : 'bg-cyan-500/15 group-hover:bg-cyan-500/25'
            }`}
          />

          {/* Outer Rotating Cyber Border Ring */}
          <div
            className={`absolute inset-0 rounded-full border-2 transition-all duration-500 ${
              isConnected
                ? 'border-emerald-400 shadow-[0_0_25px_#10B981]'
                : isConnecting
                ? 'border-amber-400 border-dashed animate-spin'
                : 'border-slate-800 group-hover:border-cyan-500/40'
            }`}
          />

          {/* Inner Core Disc */}
          <div
            className={`w-36 h-36 rounded-full flex flex-col items-center justify-center transition-all duration-300 shadow-2xl ${
              isConnected
                ? 'bg-gradient-to-b from-emerald-950 via-slate-900 to-slate-950 border border-emerald-400/50'
                : isConnecting
                ? 'bg-slate-900 border border-amber-400/40'
                : 'bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-slate-700/60 group-hover:border-cyan-400/50'
            }`}
          >
            <Power
              className={`w-14 h-14 transition-all duration-300 ${
                isConnected
                  ? 'text-emerald-400 drop-shadow-[0_0_12px_#10B981]'
                  : isConnecting
                  ? 'text-amber-400 animate-pulse'
                  : 'text-slate-400 group-hover:text-cyan-400'
              }`}
              strokeWidth={2.4}
            />
            <span
              className={`text-[10px] font-mono tracking-widest uppercase mt-1 ${
                isConnected
                  ? 'text-emerald-400 font-bold'
                  : isConnecting
                  ? 'text-amber-400'
                  : 'text-slate-400'
              }`}
            >
              {isConnected ? 'SECURED' : isConnecting ? 'CONNECTING' : 'TAP TO AIR'}
            </span>
          </div>
        </div>

        {/* Status Subtitle */}
        <div className="mt-3 text-center">
          <div className="flex items-center justify-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                isConnected
                  ? 'bg-emerald-400'
                  : isConnecting
                  ? 'bg-amber-400 animate-ping'
                  : 'bg-slate-400'
              }`}
            />
            <span className="text-sm font-bold tracking-tight text-white">
              {isConnected && `Connected via ${verifiedExitCountry || selectedProxy?.cityCode || 'Edge'}`}
              {isConnecting && 'Establishing Quantum Tunnel…'}
              {!isConnected && !isConnecting && 'Disconnected (IP Exposed)'}
            </span>
          </div>

          {isConnected && (
            <p className="text-[11px] font-mono text-cyan-400 mt-0.5">
              Uptime: {formatDuration(connectDuration)} • {settings.protocol || 'WireGuard'}
            </p>
          )}

          {lastError && !isConnecting && (
            <p className="text-xs text-red-400 mt-1 max-w-xs">{lastError}</p>
          )}
        </div>
      </div>

      {/* Live Telemetry Waveform */}
      {isConnected && (
        <NetworkWave
          downloadHistory={throughputHistory}
          uploadHistory={uploadHistory}
          currentDown={downloadSpeed}
          currentUp={uploadSpeed}
          isConnected={isConnected}
        />
      )}

      {/* Target Server Card */}
      <div
        onClick={() => setActiveTab('servers')}
        className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/40 cursor-pointer transition flex items-center justify-between shadow-sm"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-mono block">
              Routing Location
            </span>
            <span className="text-sm font-bold text-white block">
              {locationLabel}
            </span>
            {selectedProxy?.cityCode && (
              <span className="text-xs text-cyan-400/80 font-mono">
                {selectedProxy.cityCode} • {selectedProxy.host.split('.')[0]}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs font-semibold text-cyan-400">
          <span>Change</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* Cyber Security Quick Strip */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center gap-2.5">
          <Lock className="w-4 h-4 text-emerald-400" />
          <div>
            <span className="text-slate-400 block text-[10px]">Virtual IP</span>
            <span className="font-mono font-semibold text-slate-200">
              {isConnected ? '198.51.100.84' : 'Protected'}
            </span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center gap-2.5">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <div>
            <span className="text-slate-400 block text-[10px]">Local Gateway</span>
            <span className="font-mono font-semibold text-slate-200">
              {settings.socksBindAddress}:{settings.socksPort}
            </span>
          </div>
        </div>
      </div>

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />
    </div>
  );
};
