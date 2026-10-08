export type ConnectionState = 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED';

export type ThemeMode = 'SYSTEM' | 'LIGHT' | 'DARK';

export type NavTab = 'dashboard' | 'servers' | 'speedtest' | 'shield' | 'settings';

export type NavRoute = 'splash' | 'login' | 'main' | 'account' | 'logs';

export type DohProvider = 'AUTOMATIC' | 'CLOUDFLARE' | 'GOOGLE' | 'QUAD9' | 'OFF';

export type UpstreamProxyType = 'SOCKS5' | 'HTTP';

export type VpnProtocolType = 'WireGuard' | 'OpenVPN UDP' | 'OpenVPN TCP' | 'Shadowsocks' | 'IKEv2';

export interface VpnProtocol {
  name: string;
  host: string;
  port: number;
  scheme: string;
  templateString: string;
}

export interface VpnServerNode {
  hostname: string;
  port: number;
  quarantined: boolean;
  protocols: VpnProtocol[];
}

export interface VpnCity {
  name: string;
  code: string;
  servers: VpnServerNode[];
  lat?: number;
  lng?: number;
}

export interface VpnCountry {
  name: string;
  code: string;
  region?: 'Americas' | 'Europe' | 'Asia-Pacific';
  cities: VpnCity[];
}

export interface ProxyCandidate {
  host: string;
  port: number;
  countryCode: string;
  countryName: string;
  cityCode: string;
  lat?: number;
  lng?: number;
}

export interface Entitlement {
  subscribed: boolean;
  uid: string;
  maxBytes: number | null;
  limitedBandwidth: boolean;
  quotaRemaining: number | null;
}

export interface RuntimeAuth {
  email: string;
  accessToken: string;
  refreshToken: string | null;
  expiresAtEpochSeconds: number;
  user: {
    uid: string;
    subscribed: boolean;
    maxBytes: number;
    limitedBandwidth: boolean;
    quotaRemaining: number;
  };
}

export interface SecurityFeatures {
  killSwitch: boolean;
  adBlocker: boolean;
  malwareShield: boolean;
  autoReconnect: boolean;
  blockedTrackersCount: number;
}

export interface AppSettings {
  themeMode: ThemeMode;
  exitCheckEnabled: boolean;
  socksBindAddress: string;
  socksPort: number;
  dohProvider: DohProvider;
  customDnsEnabled: boolean;
  customDnsServer: string;
  proxyOnlyMode: boolean;
  customEdgeAddress: string;
  upstreamProxyEnabled: boolean;
  upstreamProxyType: UpstreamProxyType;
  upstreamProxyHost: string;
  upstreamProxyPort: number;
  upstreamProxyUsername: string;
  upstreamProxyPassword: string;
  excludedApps: string[];
  protocol: VpnProtocolType;
}

export interface SpeedTestState {
  running: boolean;
  phase: 'idle' | 'ping' | 'download' | 'upload' | 'completed';
  pingMs: number;
  jitterMs: number;
  downloadMbps: number;
  uploadMbps: number;
  packetLoss: number;
  progress: number;
}

export type LogLevel = 'INFO' | 'WARN' | 'ERROR';

export interface LogEntry {
  id: number;
  timestampMillis: number;
  level: LogLevel;
  tag: string;
  message: string;
}
