import React from 'react';
import { ProxyCandidate } from '../types';

interface WorldMapProps {
  selectedProxy: ProxyCandidate | null;
  onSelectNode: (candidate: ProxyCandidate) => void;
  isConnected: boolean;
}

interface MapNode {
  id: string;
  name: string;
  code: string;
  country: string;
  countryCode: string;
  x: number; // 0 to 100%
  y: number; // 0 to 100%
  host: string;
  port: number;
}

const GLOBAL_NODES: MapNode[] = [
  { id: 'NYC', name: 'New York', code: 'NYC', country: 'United States', countryCode: 'US', x: 26, y: 35, host: 'us-nyc-wg-001.airvpn.network', port: 443 },
  { id: 'LAX', name: 'Los Angeles', code: 'LAX', country: 'United States', countryCode: 'US', x: 16, y: 39, host: 'us-lax-wg-001.airvpn.network', port: 443 },
  { id: 'MIA', name: 'Miami', code: 'MIA', country: 'United States', countryCode: 'US', x: 25, y: 44, host: 'us-mia-wg-001.airvpn.network', port: 443 },
  { id: 'LON', name: 'London', code: 'LON', country: 'United Kingdom', countryCode: 'GB', x: 48, y: 28, host: 'gb-lon-wg-001.airvpn.network', port: 443 },
  { id: 'FRA', name: 'Frankfurt', code: 'FRA', country: 'Germany', countryCode: 'DE', x: 53, y: 30, host: 'de-fra-wg-001.airvpn.network', port: 443 },
  { id: 'AMS', name: 'Amsterdam', code: 'AMS', country: 'Netherlands', countryCode: 'NL', x: 50, y: 27, host: 'nl-ams-wg-001.airvpn.network', port: 443 },
  { id: 'ZRH', name: 'Zurich', code: 'ZRH', country: 'Switzerland', countryCode: 'CH', x: 52, y: 33, host: 'ch-zrh-wg-001.airvpn.network', port: 443 },
  { id: 'TYO', name: 'Tokyo', code: 'TYO', country: 'Japan', countryCode: 'JP', x: 86, y: 38, host: 'jp-tyo-wg-001.airvpn.network', port: 443 },
  { id: 'SIN', name: 'Singapore', code: 'SIN', country: 'Singapore', countryCode: 'SG', x: 77, y: 58, host: 'sg-sin-wg-001.airvpn.network', port: 443 },
  { id: 'SYD', name: 'Sydney', code: 'SYD', country: 'Australia', countryCode: 'AU', x: 89, y: 78, host: 'au-syd-wg-001.airvpn.network', port: 443 },
  { id: 'YYZ', name: 'Toronto', code: 'YYZ', country: 'Canada', countryCode: 'CA', x: 25, y: 32, host: 'ca-yyz-wg-001.airvpn.network', port: 443 },
];

export const WorldMap: React.FC<WorldMapProps> = ({
  selectedProxy,
  onSelectNode,
  isConnected,
}) => {
  // Find active node based on cityCode or countryCode
  const activeNode = GLOBAL_NODES.find(
    (n) =>
      (selectedProxy?.cityCode && n.code === selectedProxy.cityCode) ||
      (selectedProxy?.countryCode && n.countryCode === selectedProxy.countryCode)
  ) || GLOBAL_NODES[0];

  // User home anchor (e.g. Western US / Local)
  const homeNode = { x: 18, y: 40 };

  return (
    <div className="relative w-full h-48 md:h-56 rounded-2xl overflow-hidden bg-gradient-to-b from-[#111827] via-[#0E131F] to-[#0B0F19] border border-cyan-500/20 shadow-inner">
      {/* Background World Grid */}
      <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#00F2FE_1px,transparent_1px)] [background-size:16px_16px]" />

      {/* Stylized Continent Silhouette Outlines (SVG) */}
      <svg
        viewBox="0 0 1000 500"
        className="w-full h-full object-cover pointer-events-none opacity-30 select-none"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="mapGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00F2FE" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#4FACFE" stopOpacity="0.2" />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* North America */}
        <path
          d="M120,80 Q200,60 260,110 Q290,160 250,210 Q220,240 180,210 Q140,170 110,130 Z"
          fill="url(#mapGradient)"
        />
        {/* South America */}
        <path
          d="M260,260 Q340,290 320,380 Q300,440 270,470 Q240,400 230,330 Z"
          fill="url(#mapGradient)"
        />
        {/* Europe */}
        <path
          d="M450,110 Q540,90 570,160 Q530,200 480,210 Q440,170 450,110 Z"
          fill="url(#mapGradient)"
        />
        {/* Africa */}
        <path
          d="M460,220 Q560,230 550,340 Q510,420 460,370 Q430,300 460,220 Z"
          fill="url(#mapGradient)"
        />
        {/* Asia */}
        <path
          d="M580,90 Q780,70 850,170 Q790,270 700,260 Q630,210 580,140 Z"
          fill="url(#mapGradient)"
        />
        {/* Australia */}
        <path
          d="M780,330 Q880,340 890,410 Q830,450 780,410 Q760,360 780,330 Z"
          fill="url(#mapGradient)"
        />

        {/* Dynamic Curved Quantum Beam Arc when Connected */}
        {isConnected && activeNode && (
          <g>
            <path
              d={`M ${homeNode.x * 10} ${homeNode.y * 5} Q ${(homeNode.x + activeNode.x) * 5} ${
                Math.min(homeNode.y, activeNode.y) * 5 - 40
              } ${activeNode.x * 10} ${activeNode.y * 5}`}
              fill="none"
              stroke="#00F298"
              strokeWidth="2.5"
              strokeDasharray="6 4"
              className="animate-pulse"
              filter="url(#glow)"
            />
          </g>
        )}
      </svg>

      {/* Floating Status Indicator Overlay */}
      <div className="absolute top-2.5 left-3 flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur border border-cyan-500/30 text-[11px] font-mono text-cyan-300">
        <span
          className={`w-2 h-2 rounded-full ${
            isConnected ? 'bg-emerald-400 animate-ping' : 'bg-cyan-400'
          }`}
        />
        <span>{isConnected ? 'TUNNEL ENCRYPTED' : 'RADAR READY'}</span>
        <span>•</span>
        <span>{activeNode.name}</span>
      </div>

      {/* Interactive Server Nodes */}
      {GLOBAL_NODES.map((node) => {
        const isActive = activeNode.id === node.id;
        return (
          <button
            key={node.id}
            onClick={() =>
              onSelectNode({
                host: node.host,
                port: node.port,
                countryCode: node.countryCode,
                countryName: node.country,
                cityCode: node.code,
              })
            }
            title={`${node.name}, ${node.country} - Click to select`}
            style={{ left: `${node.x}%`, top: `${node.y}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer focus:outline-none"
          >
            {/* Ripple halo for selected node */}
            {isActive && (
              <span
                className={`absolute -inset-2 rounded-full opacity-75 animate-ping ${
                  isConnected ? 'bg-emerald-400' : 'bg-cyan-400'
                }`}
              />
            )}

            {/* Main Node Dot */}
            <span
              className={`relative block w-3.5 h-3.5 rounded-full border-2 transition-transform duration-200 group-hover:scale-150 ${
                isActive
                  ? isConnected
                    ? 'bg-emerald-400 border-white shadow-[0_0_12px_#00F298]'
                    : 'bg-cyan-400 border-white shadow-[0_0_12px_#00F2FE]'
                  : 'bg-slate-700 border-cyan-500/50 group-hover:bg-cyan-300'
              }`}
            />

            {/* City Tag Label */}
            <span
              className={`absolute top-4 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded text-[9px] font-mono tracking-tight whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-slate-900/95 text-cyan-300 border border-cyan-500/40 shadow-sm opacity-100'
                  : 'bg-slate-950/70 text-slate-400 opacity-0 group-hover:opacity-100'
              }`}
            >
              {node.code}
            </span>
          </button>
        );
      })}
    </div>
  );
};
