import React, { useState } from 'react';
import { Copy, Download, Check, X, FileCode, Terminal, Globe } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose }) => {
  const { selectedProxy, settings } = useApp();
  const [activeTab, setActiveTab] = useState<'wireguard' | 'socks5' | 'pac'>('wireguard');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const targetHost = selectedProxy?.host || 'us-nyc-wg-001.airvpn.network';
  const targetPort = selectedProxy?.port || 443;
  const socksPort = settings.socksPort || 1080;
  const socksHost = settings.socksBindAddress || '127.0.0.1';

  const wireguardConfig = `[Interface]
PrivateKey = aGly...[REDACTED_CLIENT_KEY]...kM=
Address = 10.64.0.2/32, fd7d:76ee:e68f:a993::2/128
DNS = 1.1.1.1, 8.8.8.8

[Peer]
PublicKey = bmXOC+F1FxEMF9dyiK2H5/1SUtzH0JuVo51h2wPfgyo=
Endpoint = ${targetHost}:${targetPort}
AllowedIPs = 0.0.0.0/0, ::/0
PersistentKeepalive = 25`;

  const socks5Script = `# AIRVPN SOCKS5 Tunnel Proxy Command
export ALL_PROXY="socks5://${socksHost}:${socksPort}"
curl --socks5-hostname ${socksHost}:${socksPort} https://ipinfo.io/json`;

  const pacScript = `function FindProxyForURL(url, host) {
  // AIRVPN Smart PAC Routing
  if (isPlainHostName(host) || dnsDomainIs(host, ".local") || isInNet(host, "127.0.0.0", "255.0.0.0")) {
    return "DIRECT";
  }
  return "SOCKS5 ${socksHost}:${socksPort}; SOCKS ${socksHost}:${socksPort}; DIRECT";
}`;

  const currentContent =
    activeTab === 'wireguard'
      ? wireguardConfig
      : activeTab === 'socks5'
      ? socks5Script
      : pacScript;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const filename =
      activeTab === 'wireguard'
        ? `airvpn-${selectedProxy?.cityCode || 'node'}.conf`
        : activeTab === 'socks5'
        ? 'airvpn-proxy.sh'
        : 'proxy.pac';
    const blob = new Blob([currentContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-cyan-500/30 p-6 shadow-2xl flex flex-col space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Export Tunnel Profile</h3>
              <p className="text-xs text-slate-400">
                Use AIRVPN with any external client or CLI tool
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('wireguard')}
            className={`flex-1 py-1.5 rounded-lg font-medium transition ${
              activeTab === 'wireguard'
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            WireGuard .conf
          </button>
          <button
            onClick={() => setActiveTab('socks5')}
            className={`flex-1 py-1.5 rounded-lg font-medium transition ${
              activeTab === 'socks5'
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            SOCKS5 Script
          </button>
          <button
            onClick={() => setActiveTab('pac')}
            className={`flex-1 py-1.5 rounded-lg font-medium transition ${
              activeTab === 'pac'
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Browser PAC
          </button>
        </div>

        {/* Code Preview Area */}
        <div className="relative rounded-2xl bg-slate-950 border border-slate-800 p-4 font-mono text-xs text-slate-300 max-h-56 overflow-y-auto leading-relaxed select-text">
          <pre className="whitespace-pre-wrap">{currentContent}</pre>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            onClick={handleCopy}
            className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white flex items-center gap-1.5 transition"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
          <button
            onClick={handleDownload}
            className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-[0_0_15px_rgba(6,182,212,0.3)] transition"
          >
            <Download className="w-4 h-4" />
            <span>Download File</span>
          </button>
        </div>
      </div>
    </div>
  );
};
