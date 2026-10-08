import React, { useState } from 'react';
import { ArrowLeft, RefreshCw, UserCircle, ShieldCheck, Zap } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatBytes } from '../utils/format';

export const AccountScreen: React.FC = () => {
  const { goBack, auth, refreshEntitlement } = useApp();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshEntitlement();
    setIsRefreshing(false);
  };

  const user = auth?.user;
  const quotaRemaining = user?.quotaRemaining;
  const maxBytes = user?.maxBytes;

  return (
    <div className="flex flex-col min-h-screen p-4 max-w-md mx-auto text-slate-100 bg-[#0B0F19]">
      {/* Top Header */}
      <header className="flex items-center justify-between py-2 border-b border-slate-800 mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={goBack}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-slate-800 transition text-slate-400 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-bold text-lg text-white">AIRVPN Identity</h1>
        </div>

        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-slate-800 transition text-slate-400 hover:text-white disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      </header>

      {/* Main Content */}
      <div className="space-y-4">
        {/* User Card */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 font-bold text-lg shadow-[0_0_15px_rgba(6,182,212,0.3)]">
            AIR
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">
              {auth?.email || 'pilot@airvpn.io'}
            </h2>
            <p className="text-xs text-slate-400 flex items-center gap-1 font-mono mt-0.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>AIRVPN Quantum Pass Active</span>
            </p>
          </div>
        </div>

        {/* Info Rows */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs pb-3 border-b border-slate-800">
            <span className="text-slate-400">Subscription Status</span>
            <span className="font-bold text-emerald-400">Active (VIP Unlimited)</span>
          </div>

          <div className="flex items-center justify-between text-xs pb-3 border-b border-slate-800">
            <span className="text-slate-400">Client UID</span>
            <span className="font-mono text-cyan-300">{user?.uid || 'air_usr_quantum77'}</span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Monthly High-Speed Allowance</span>
            <span className="font-mono font-bold text-slate-200">
              {maxBytes ? formatBytes(maxBytes) : '100 GB'}
            </span>
          </div>
        </div>

        {/* Progress Bar of Monthly Cap */}
        {maxBytes && quotaRemaining !== null && quotaRemaining !== undefined && (
          <div className="space-y-2 p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Traffic Used</span>
              <span className="font-mono text-cyan-400 font-semibold">
                {Math.round(((maxBytes - quotaRemaining) / maxBytes) * 100)}%
              </span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-cyan-400 to-blue-500 h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, Math.max(0, ((maxBytes - quotaRemaining) / maxBytes) * 100))}%`,
                }}
              />
            </div>
            <div className="flex justify-between text-[11px] font-mono text-slate-500">
              <span>{formatBytes(maxBytes - quotaRemaining)} consumed</span>
              <span>{formatBytes(quotaRemaining)} remaining</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
