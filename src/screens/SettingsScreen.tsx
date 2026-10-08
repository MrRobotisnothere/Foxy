import React, { useState } from 'react';
import {
  ChevronRight,
  LogOut,
  User,
  Code,
  FileText,
  Search,
  ExternalLink,
  Cpu,
  Layers,
  Network,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DohProvider, UpstreamProxyType } from '../types';

const DOH_PROVIDERS: { id: DohProvider; label: string; desc: string }[] = [
  { id: 'AUTOMATIC', label: 'Automatic (Fastest)', desc: '1.1.1.1, 8.8.8.8, 9.9.9.9' },
  { id: 'CLOUDFLARE', label: 'Cloudflare 1.1.1.1', desc: 'Privacy-first DNS resolver' },
  { id: 'GOOGLE', label: 'Google Public DNS', desc: '8.8.8.8, 8.8.4.4' },
  { id: 'QUAD9', label: 'Quad9 Security DNS', desc: 'Blocks malware & phishing domains' },
  { id: 'OFF', label: 'Off (System Resolver)', desc: "Uses your local ISP or network resolver" },
];

const DNS_PRESETS = [
  { address: '1.1.1.1', label: 'Cloudflare (1.1.1.1)' },
  { address: '8.8.8.8', label: 'Google (8.8.8.8)' },
  { address: '9.9.9.9', label: 'Quad9 (9.9.9.9)' },
];

const DEFAULT_APPS_LIST = [
  { id: 'org.mozilla.firefox', name: 'Mozilla Firefox' },
  { id: 'com.android.chrome', name: 'Google Chrome' },
  { id: 'com.spotify.music', name: 'Spotify' },
  { id: 'org.telegram.messenger', name: 'Telegram' },
  { id: 'com.discord', name: 'Discord' },
  { id: 'com.valvesoftware.android.steam.community', name: 'Steam' },
  { id: 'com.whatsapp', name: 'WhatsApp' },
  { id: 'com.netflix.mediaclient', name: 'Netflix' },
  { id: 'com.google.android.youtube', name: 'YouTube' },
];

export const SettingsScreen: React.FC = () => {
  const { settings, updateSettings, signOut, navigate } = useApp();

  const [showDohDialog, setShowDohDialog] = useState(false);
  const [showCustomDnsDialog, setShowCustomDnsDialog] = useState(false);
  const [showSocksBindDialog, setShowSocksBindDialog] = useState(false);
  const [showSocksPortDialog, setShowSocksPortDialog] = useState(false);
  const [showEdgeAddressDialog, setShowEdgeAddressDialog] = useState(false);
  const [showSplitTunnelDialog, setShowSplitTunnelDialog] = useState(false);
  const [showUpstreamTypeDialog, setShowUpstreamTypeDialog] = useState(false);
  const [showUpstreamAddressDialog, setShowUpstreamAddressDialog] = useState(false);

  const [tempDns, setTempDns] = useState(settings.customDnsServer);
  const [tempPort, setTempPort] = useState(settings.socksPort.toString());
  const [tempEdge, setTempEdge] = useState(settings.customEdgeAddress);
  const [tempAppSearch, setTempAppSearch] = useState('');
  const [tempExcludedApps, setTempExcludedApps] = useState<string[]>(settings.excludedApps);

  const [tempUpstreamHost, setTempUpstreamHost] = useState(settings.upstreamProxyHost);
  const [tempUpstreamPort, setTempUpstreamPort] = useState(settings.upstreamProxyPort.toString());

  const filteredApps = DEFAULT_APPS_LIST.filter(
    (app) =>
      app.name.toLowerCase().includes(tempAppSearch.toLowerCase()) ||
      app.id.toLowerCase().includes(tempAppSearch.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] p-4 max-w-md mx-auto text-slate-100 pb-20 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between py-1 border-b border-slate-800">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-400 font-semibold">
            Preferences
          </span>
          <h1 className="text-xl font-bold tracking-tight">System Settings</h1>
        </div>
      </div>

      {/* Main Settings Sections */}
      <div className="space-y-4">
        {/* Section: Connection */}
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono px-1">
            Tunnel Connection
          </span>

          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-sm font-semibold text-slate-100 block">
                Verify Exit Location
              </span>
              <span className="text-xs text-slate-400 block mt-0.5">
                Check that public egress IP matches selected node
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={settings.exitCheckEnabled}
                onChange={(e) => updateSettings({ exitCheckEnabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
            </label>
          </div>
        </div>

        {/* Section: Encrypted DNS */}
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono px-1">
            Encrypted DNS (DoH)
          </span>

          <div
            onClick={() => setShowDohDialog(true)}
            className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 flex items-center justify-between cursor-pointer transition"
          >
            <div>
              <span className="text-sm font-semibold text-slate-100 block">
                DNS over HTTPS Provider
              </span>
              <span className="text-xs text-cyan-400 font-mono block mt-0.5">
                {DOH_PROVIDERS.find((p) => p.id === settings.dohProvider)?.label || 'Automatic'}
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-sm font-semibold text-slate-100 block">
                Custom DNS Server
              </span>
              <span className="text-xs text-slate-400 block mt-0.5">
                Override resolver with a designated IPv4 upstream
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={settings.customDnsEnabled}
                onChange={(e) => updateSettings({ customDnsEnabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
            </label>
          </div>

          {settings.customDnsEnabled && (
            <div
              onClick={() => {
                setTempDns(settings.customDnsServer);
                setShowCustomDnsDialog(true);
              }}
              className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 flex items-center justify-between cursor-pointer transition pl-4"
            >
              <div>
                <span className="text-xs font-semibold text-slate-300 block">Resolver IP</span>
                <span className="text-xs font-mono text-cyan-400 block">{settings.customDnsServer}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
          )}
        </div>

        {/* Section: Local Proxy */}
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono px-1">
            Local SOCKS5 Gateway
          </span>

          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-sm font-semibold text-slate-100 block">
                Proxy-Only Mode
              </span>
              <span className="text-xs text-slate-400 block mt-0.5">
                Run SOCKS5 listener without capturing default system interface
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={settings.proxyOnlyMode}
                onChange={(e) => updateSettings({ proxyOnlyMode: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
            </label>
          </div>

          <div
            onClick={() => setShowSocksBindDialog(true)}
            className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 flex items-center justify-between cursor-pointer transition"
          >
            <div>
              <span className="text-sm font-semibold text-slate-100 block">Bind Interface</span>
              <span className="text-xs font-mono text-cyan-400 block mt-0.5">{settings.socksBindAddress}</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>

          <div
            onClick={() => {
              setTempPort(settings.socksPort.toString());
              setShowSocksPortDialog(true);
            }}
            className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 flex items-center justify-between cursor-pointer transition"
          >
            <div>
              <span className="text-sm font-semibold text-slate-100 block">Local Port</span>
              <span className="text-xs font-mono text-cyan-400 block mt-0.5">{settings.socksPort}</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>
        </div>

        {/* Section: Split Tunneling */}
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono px-1">
            Traffic Routing
          </span>

          <div
            onClick={() => {
              setTempExcludedApps([...settings.excludedApps]);
              setShowSplitTunnelDialog(true);
            }}
            className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 flex items-center justify-between cursor-pointer transition"
          >
            <div>
              <span className="text-sm font-semibold text-slate-100 block">Split Tunneling Bypass</span>
              <span className="text-xs text-slate-400 block mt-0.5">
                {settings.excludedApps.length === 0
                  ? 'No applications bypassed'
                  : `${settings.excludedApps.length} application(s) bypass VPN`}
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>
        </div>

        {/* Section: Account & Logs */}
        <div className="space-y-1 pt-2">
          <div
            onClick={() => navigate('logs')}
            className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 flex items-center justify-between cursor-pointer transition"
          >
            <div className="flex items-center gap-3">
              <FileText className="w-4 h-4 text-cyan-400" />
              <div>
                <span className="text-sm font-semibold text-slate-100 block">Diagnostics Logs</span>
                <span className="text-xs text-slate-400 block">View tunnel lifecycle & socket stream</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>

          <div
            onClick={() => navigate('account')}
            className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 flex items-center justify-between cursor-pointer transition"
          >
            <div className="flex items-center gap-3">
              <User className="w-4 h-4 text-cyan-400" />
              <div>
                <span className="text-sm font-semibold text-slate-100 block">Subscription & Allowance</span>
                <span className="text-xs text-slate-400 block">100 GB Monthly High-Speed Allocation</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>

          <button
            onClick={signOut}
            className="w-full mt-2 py-3 px-4 rounded-xl font-bold bg-red-950/40 border border-red-500/30 text-red-400 hover:bg-red-950/60 flex items-center justify-center gap-2 text-xs transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out Account</span>
          </button>
        </div>
      </div>

      {/* MODAL: DoH Provider */}
      {showDohDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 p-5 shadow-2xl space-y-3">
            <h3 className="text-lg font-bold text-white">DNS over HTTPS</h3>
            <div className="space-y-2">
              {DOH_PROVIDERS.map((provider) => (
                <label
                  key={provider.id}
                  className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-950 border border-slate-800 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="doh"
                    checked={settings.dohProvider === provider.id}
                    onChange={() => {
                      updateSettings({ dohProvider: provider.id });
                      setShowDohDialog(false);
                    }}
                    className="mt-1 accent-cyan-400"
                  />
                  <div>
                    <span className="text-sm font-semibold text-white block">{provider.label}</span>
                    <span className="text-xs text-slate-400 block">{provider.desc}</span>
                  </div>
                </label>
              ))}
            </div>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowDohDialog(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Custom DNS Server */}
      {showCustomDnsDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 p-5 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">DNS Resolver IP</h3>
            <div className="space-y-2">
              {DNS_PRESETS.map((p) => (
                <label
                  key={p.address}
                  className="flex items-center gap-3 p-2 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="dnspreset"
                    checked={tempDns === p.address}
                    onChange={() => setTempDns(p.address)}
                    className="accent-cyan-400"
                  />
                  <span className="text-sm font-medium text-slate-200">{p.label}</span>
                </label>
              ))}
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Custom IPv4 Address</label>
              <input
                type="text"
                value={tempDns}
                onChange={(e) => setTempDns(e.target.value.trim())}
                placeholder="1.1.1.1"
                className="w-full px-3 py-2 rounded-xl border border-slate-800 bg-slate-950 font-mono text-sm text-cyan-300 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowCustomDnsDialog(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (tempDns) {
                    updateSettings({ customDnsServer: tempDns });
                    setShowCustomDnsDialog(false);
                  }
                }}
                className="px-4 py-2 text-xs font-bold bg-cyan-500 text-slate-950 rounded-lg hover:bg-cyan-400"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: SOCKS Bind */}
      {showSocksBindDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 p-5 shadow-2xl space-y-3">
            <h3 className="text-lg font-bold text-white">Local Gateway Interface</h3>
            <div className="space-y-2">
              {[
                { val: '127.0.0.1', label: 'Loopback Host Only (127.0.0.1)' },
                { val: '0.0.0.0', label: 'All LAN Interfaces (0.0.0.0)' },
              ].map((item) => (
                <label
                  key={item.val}
                  className="flex items-center gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="socksbind"
                    checked={settings.socksBindAddress === item.val}
                    onChange={() => {
                      updateSettings({ socksBindAddress: item.val });
                      setShowSocksBindDialog(false);
                    }}
                    className="accent-cyan-400"
                  />
                  <span className="text-sm font-medium text-slate-200">{item.label}</span>
                </label>
              ))}
            </div>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowSocksBindDialog(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Split Tunneling */}
      {showSplitTunnelDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl flex flex-col max-h-[80vh]">
            <h3 className="text-lg font-bold text-white">Split Tunneling</h3>
            <p className="text-xs text-slate-400 mt-1 mb-3">
              Selected applications route outside the encrypted tunnel.
            </p>

            <div className="relative mb-3">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={tempAppSearch}
                onChange={(e) => setTempAppSearch(e.target.value)}
                placeholder="Search app or package name..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
              {filteredApps.map((app) => {
                const isChecked = tempExcludedApps.includes(app.id);
                return (
                  <label
                    key={app.id}
                    className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setTempExcludedApps([...tempExcludedApps, app.id]);
                        } else {
                          setTempExcludedApps(tempExcludedApps.filter((id) => id !== app.id));
                        }
                      }}
                      className="accent-cyan-400 rounded"
                    />
                    <div>
                      <span className="text-sm font-semibold text-white block">{app.name}</span>
                      <span className="text-[11px] font-mono text-slate-500 block">{app.id}</span>
                    </div>
                  </label>
                );
              })}
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-800 mt-3">
              <button
                onClick={() => setShowSplitTunnelDialog(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  updateSettings({ excludedApps: tempExcludedApps });
                  setShowSplitTunnelDialog(false);
                }}
                className="px-4 py-2 text-xs font-bold bg-cyan-500 text-slate-950 rounded-lg hover:bg-cyan-400"
              >
                Apply Rules
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: SOCKS Port */}
      {showSocksPortDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 p-5 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">Local Gateway Port</h3>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Port (1–65535)</label>
              <input
                type="number"
                min="1"
                max="65535"
                value={tempPort}
                onChange={(e) => setTempPort(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-800 bg-slate-950 font-mono text-sm text-cyan-300 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowSocksPortDialog(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const p = parseInt(tempPort, 10);
                  if (p >= 1 && p <= 65535) {
                    updateSettings({ socksPort: p });
                    setShowSocksPortDialog(false);
                  }
                }}
                className="px-4 py-2 text-xs font-bold bg-cyan-500 text-slate-950 rounded-lg hover:bg-cyan-400"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
