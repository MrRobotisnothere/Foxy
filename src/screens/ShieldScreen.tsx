import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  Globe,
  Sliders,
  Check,
  ExternalLink,
  Cpu,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { VpnProtocolType } from '../types';

const PROTOCOLS: { id: VpnProtocolType; name: string; desc: string; badge: string }[] = [
  { id: 'WireGuard', name: 'WireGuard® Turbo', desc: 'Fastest throughput, instant quantum handshake', badge: 'Recommended' },
  { id: 'OpenVPN UDP', name: 'OpenVPN UDP', desc: 'Resilient and dynamic protocol for gaming and streaming', badge: 'Standard' },
  { id: 'OpenVPN TCP', name: 'OpenVPN Stealth TCP', desc: 'Penetrates strict firewalls and deep packet inspection', badge: 'Stealth' },
  { id: 'Shadowsocks', name: 'Shadowsocks AEAD', desc: 'Obfuscated proxy for censored restricted networks', badge: 'Bypass' },
];

export const ShieldScreen: React.FC = () => {
  const { securityFeatures, updateSecurityFeatures, settings, updateSettings, navigate } = useApp();
  const [showProtocolModal, setShowProtocolModal] = useState(false);

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] p-4 max-w-md mx-auto text-slate-100 pb-20 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between py-2 border-b border-slate-800">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-400 font-semibold">
            Security & Privacy
          </span>
          <h1 className="text-xl font-bold tracking-tight">Threat Shield</h1>
        </div>
        <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
          <ShieldCheck className="w-5 h-5" />
        </div>
      </div>

      {/* Main Stats Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-cyan-500/30 shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-slate-400 uppercase font-mono tracking-wider">
            Active Protection
          </span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            SHIELD ENGAGED
          </span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold font-mono text-cyan-300">
            {securityFeatures.blockedTrackersCount.toLocaleString()}
          </span>
          <span className="text-xs text-slate-400">trackers & ads filtered</span>
        </div>
        <p className="text-xs text-slate-400 mt-2">
          AIRVPN DNS filter stops known tracking domains, crypto miners, and malicious malware hosts at the gateway level.
        </p>
      </div>

      {/* Security Switches List */}
      <div className="space-y-3">
        {/* Kill Switch */}
        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 mt-0.5">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <span className="text-sm font-semibold text-slate-100 block">Kill Switch</span>
              <span className="text-xs text-slate-400 block mt-0.5">
                Block all internet traffic instantly if the VPN connection drops
              </span>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={securityFeatures.killSwitch}
              onChange={(e) => updateSecurityFeatures({ killSwitch: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
          </label>
        </div>

        {/* Ad & Malware Blocker */}
        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 mt-0.5">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <span className="text-sm font-semibold text-slate-100 block">Malware & Ad Shield</span>
              <span className="text-xs text-slate-400 block mt-0.5">
                Block intrusive ads, malicious popups, and tracker telemetry
              </span>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={securityFeatures.adBlocker}
              onChange={(e) => updateSecurityFeatures({ adBlocker: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
          </label>
        </div>

        {/* Protocol Selector Row */}
        <div
          onClick={() => setShowProtocolModal(true)}
          className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 flex items-center justify-between cursor-pointer transition"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 mt-0.5">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <span className="text-sm font-semibold text-slate-100 block">VPN Protocol</span>
              <span className="text-xs text-cyan-400 font-mono block mt-0.5">
                {settings.protocol || 'WireGuard'}
              </span>
            </div>
          </div>
          <span className="text-xs font-semibold text-slate-400">Change</span>
        </div>

        {/* DNS Leak & IPv6 Shield Info */}
        <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">DNS Leak Protection</span>
            <span className="text-emerald-400 font-mono font-semibold flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> Enforced
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">IPv6 Leak Blackhole</span>
            <span className="text-emerald-400 font-mono font-semibold flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> Active
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Cipher Suite</span>
            <span className="text-cyan-400 font-mono">ChaCha20-Poly1305</span>
          </div>
        </div>
      </div>

      {/* Protocol Selection Modal */}
      {showProtocolModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 p-5 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">Choose Protocol</h3>
            <div className="space-y-2">
              {PROTOCOLS.map((p) => {
                const isSelected = (settings.protocol || 'WireGuard') === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => {
                      updateSettings({ protocol: p.id });
                      setShowProtocolModal(false);
                    }}
                    className={`p-3 rounded-2xl border cursor-pointer transition ${
                      isSelected
                        ? 'bg-cyan-950/40 border-cyan-500/50 text-white'
                        : 'bg-slate-950/50 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm">{p.name}</span>
                      <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-slate-800 text-cyan-300">
                        {p.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{p.desc}</p>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowProtocolModal(false)}
                className="px-4 py-2 text-sm font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
