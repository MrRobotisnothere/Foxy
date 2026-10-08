import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  ConnectionState,
  ThemeMode,
  NavTab,
  NavRoute,
  AppSettings,
  ProxyCandidate,
  RuntimeAuth,
  Entitlement,
  SecurityFeatures,
  SpeedTestState,
} from '../types';
import { logger } from '../services/logger';

interface AppContextType {
  route: NavRoute;
  navigate: (route: NavRoute) => void;
  goBack: () => void;

  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;

  themeMode: ThemeMode;
  effectiveTheme: 'light' | 'dark';
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;

  auth: RuntimeAuth | null;
  setAuth: (auth: RuntimeAuth | null) => void;
  signOut: () => void;

  settings: AppSettings;
  updateSettings: (partial: Partial<AppSettings>) => void;

  securityFeatures: SecurityFeatures;
  updateSecurityFeatures: (partial: Partial<SecurityFeatures>) => void;

  selectedProxy: ProxyCandidate | null;
  setSelectedProxy: (proxy: ProxyCandidate | null) => void;

  connectionState: ConnectionState;
  lastError: string | null;
  connectDuration: number;
  downloadSpeed: number;
  uploadSpeed: number;
  totalDownloaded: number;
  totalUploaded: number;
  verifiedExitCountry: string | null;

  throughputHistory: number[];
  uploadHistory: number[];

  speedTestState: SpeedTestState;
  startSpeedTest: () => void;

  isExportModalOpen: boolean;
  setIsExportModalOpen: (open: boolean) => void;

  requestConnect: () => void;
  disconnect: () => void;
  refreshEntitlement: () => Promise<Entitlement | null>;
}

const DEFAULT_SETTINGS: AppSettings = {
  themeMode: 'DARK',
  exitCheckEnabled: true,
  socksBindAddress: '127.0.0.1',
  socksPort: 1080,
  dohProvider: 'AUTOMATIC',
  customDnsEnabled: false,
  customDnsServer: '1.1.1.1',
  proxyOnlyMode: false,
  customEdgeAddress: '',
  upstreamProxyEnabled: false,
  upstreamProxyType: 'SOCKS5',
  upstreamProxyHost: '',
  upstreamProxyPort: 1080,
  upstreamProxyUsername: '',
  upstreamProxyPassword: '',
  excludedApps: ['org.mozilla.firefox', 'com.android.chrome', 'com.spotify.music'],
  protocol: 'WireGuard',
};

const DEFAULT_SECURITY: SecurityFeatures = {
  killSwitch: true,
  adBlocker: true,
  malwareShield: true,
  autoReconnect: true,
  blockedTrackersCount: 2481,
};

const DEFAULT_RECOMMENDED_PROXY: ProxyCandidate = {
  host: 'us-nyc-wg-001.airvpn.network',
  port: 443,
  countryCode: 'REC',
  countryName: 'Recommended',
  cityCode: 'NYC',
  lat: 40.7128,
  lng: -74.006,
};

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [route, setRoute] = useState<NavRoute>('splash');
  const [routeHistory, setRouteHistory] = useState<NavRoute[]>(['splash']);
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');

  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem('airvpn_settings');
      if (saved) return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    } catch (e) {}
    return DEFAULT_SETTINGS;
  });

  const [securityFeatures, setSecurityFeatures] = useState<SecurityFeatures>(() => {
    try {
      const saved = localStorage.getItem('airvpn_security');
      if (saved) return { ...DEFAULT_SECURITY, ...JSON.parse(saved) };
    } catch (e) {}
    return DEFAULT_SECURITY;
  });

  const [auth, setAuth] = useState<RuntimeAuth | null>(() => {
    try {
      const saved = localStorage.getItem('airvpn_auth');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      email: 'quantum.pilot@airvpn.io',
      accessToken: 'air_acc_quantum77',
      refreshToken: 'air_ref_quantum77',
      expiresAtEpochSeconds: Math.floor(Date.now() / 1000) + 86400 * 30,
      user: {
        uid: 'air_usr_quantum77',
        subscribed: true,
        maxBytes: 107374182400,
        limitedBandwidth: false,
        quotaRemaining: 98765432100,
      },
    };
  });

  const [selectedProxy, setSelectedProxyState] = useState<ProxyCandidate | null>(() => {
    try {
      const saved = localStorage.getItem('airvpn_proxy_state');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return DEFAULT_RECOMMENDED_PROXY;
  });

  const [connectionState, setConnectionState] = useState<ConnectionState>('DISCONNECTED');
  const [lastError, setLastError] = useState<string | null>(null);
  const [connectDuration, setConnectDuration] = useState(0);
  const [downloadSpeed, setDownloadSpeed] = useState(0);
  const [uploadSpeed, setUploadSpeed] = useState(0);
  const [totalDownloaded, setTotalDownloaded] = useState(0);
  const [totalUploaded, setTotalUploaded] = useState(0);
  const [verifiedExitCountry, setVerifiedExitCountry] = useState<string | null>(null);

  const [throughputHistory, setThroughputHistory] = useState<number[]>(() => Array(24).fill(0));
  const [uploadHistory, setUploadHistory] = useState<number[]>(() => Array(24).fill(0));

  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const [speedTestState, setSpeedTestState] = useState<SpeedTestState>({
    running: false,
    phase: 'idle',
    pingMs: 0,
    jitterMs: 0,
    downloadMbps: 0,
    uploadMbps: 0,
    packetLoss: 0,
    progress: 0,
  });

  const connectTimerRef = useRef<NodeJS.Timeout | null>(null);
  const statsTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [systemIsDark, setSystemIsDark] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(prefers-color-scheme: dark)').matches : true
  );

  useEffect(() => {
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setSystemIsDark(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  const effectiveTheme: 'light' | 'dark' =
    settings.themeMode === 'SYSTEM'
      ? systemIsDark
        ? 'dark'
        : 'light'
      : settings.themeMode === 'DARK'
      ? 'dark'
      : 'light';

  useEffect(() => {
    if (effectiveTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [effectiveTheme]);

  const setThemeMode = useCallback((mode: ThemeMode) => {
    setSettings((prev) => {
      const updated = { ...prev, themeMode: mode };
      localStorage.setItem('airvpn_settings', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const toggleTheme = useCallback(() => {
    if (settings.themeMode === 'SYSTEM') {
      setThemeMode(systemIsDark ? 'LIGHT' : 'DARK');
    } else if (settings.themeMode === 'LIGHT') {
      setThemeMode('DARK');
    } else {
      setThemeMode('SYSTEM');
    }
  }, [settings.themeMode, systemIsDark, setThemeMode]);

  const updateSettings = useCallback((partial: Partial<AppSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...partial };
      localStorage.setItem('airvpn_settings', JSON.stringify(updated));
      logger.i('SettingsStore', `Updated settings: ${Object.keys(partial).join(', ')}`);
      return updated;
    });
  }, []);

  const updateSecurityFeatures = useCallback((partial: Partial<SecurityFeatures>) => {
    setSecurityFeatures((prev) => {
      const updated = { ...prev, ...partial };
      localStorage.setItem('airvpn_security', JSON.stringify(updated));
      logger.i('ThreatShield', `Updated security: ${Object.keys(partial).join(', ')}`);
      return updated;
    });
  }, []);

  const setSelectedProxy = useCallback((proxy: ProxyCandidate | null) => {
    setSelectedProxyState(proxy);
    if (proxy) {
      localStorage.setItem('airvpn_proxy_state', JSON.stringify(proxy));
      logger.i('ServerManager', `Target server set to ${proxy.countryName || proxy.countryCode} (${proxy.host})`);
    } else {
      localStorage.removeItem('airvpn_proxy_state');
    }
  }, []);

  const navigate = useCallback((to: NavRoute) => {
    setRouteHistory((prev) => [...prev, to]);
    setRoute(to);
  }, []);

  const goBack = useCallback(() => {
    setRouteHistory((prev) => {
      if (prev.length <= 1) return prev;
      const next = prev.slice(0, -1);
      setRoute(next[next.length - 1]);
      return next;
    });
  }, []);

  const handleSetAuth = useCallback((newAuth: RuntimeAuth | null) => {
    setAuth(newAuth);
    if (newAuth) {
      localStorage.setItem('airvpn_auth', JSON.stringify(newAuth));
    } else {
      localStorage.removeItem('airvpn_auth');
    }
  }, []);

  const signOut = useCallback(() => {
    disconnect();
    handleSetAuth(null);
    logger.i('AuthService', 'Session ended');
    navigate('login');
  }, [navigate]);

  const disconnect = useCallback(() => {
    logger.i('TunnelEngine', 'Tunnel disconnect requested');
    if (connectTimerRef.current) {
      clearTimeout(connectTimerRef.current);
      connectTimerRef.current = null;
    }
    if (statsTimerRef.current) {
      clearInterval(statsTimerRef.current);
      statsTimerRef.current = null;
    }
    setConnectionState('DISCONNECTED');
    setDownloadSpeed(0);
    setUploadSpeed(0);
    setVerifiedExitCountry(null);
  }, []);

  const requestConnect = useCallback(() => {
    if (!auth) {
      navigate('login');
      return;
    }

    setConnectionState('CONNECTING');
    setLastError(null);
    setConnectDuration(0);

    const target = selectedProxy || DEFAULT_RECOMMENDED_PROXY;
    logger.i('AIRVPN', `Initiating Quantum Handshake with ${target.host}:${target.port}`);
    logger.i('AIRVPN', `Protocol: ${settings.protocol} | Cipher: ChaCha20-Poly1305`);

    connectTimerRef.current = setTimeout(async () => {
      logger.i('AIRVPN', `Tunnel established! Zero-log gateway active at ${target.host}`);
      setConnectionState('CONNECTED');

      // Exit verification if enabled
      if (settings.exitCheckEnabled) {
        try {
          const resp = await fetch('/api/exit-check');
          if (resp.ok) {
            const data = await resp.json();
            const obs = data.loc || target.countryCode;
            setVerifiedExitCountry(obs);
            logger.i('ExitCheck', `Verified exit gateway in ${obs}`);
          }
        } catch (e) {}
      }

      // Start statistics timer with waveform updates
      statsTimerRef.current = setInterval(() => {
        setConnectDuration((prev) => prev + 1);

        const downBps = Math.floor(Math.random() * 850000 + 350000);
        const upBps = Math.floor(Math.random() * 180000 + 65000);

        setDownloadSpeed(downBps);
        setUploadSpeed(upBps);
        setTotalDownloaded((prev) => prev + downBps);
        setTotalUploaded((prev) => prev + upBps);

        setThroughputHistory((prev) => [...prev.slice(1), downBps]);
        setUploadHistory((prev) => [...prev.slice(1), upBps]);

        // Increment blocked trackers randomly to demonstrate active shield
        if (Math.random() > 0.6) {
          setSecurityFeatures((prev) => {
            const count = prev.blockedTrackersCount + 1;
            return { ...prev, blockedTrackersCount: count };
          });
        }
      }, 1000);
    }, 1200);
  }, [auth, selectedProxy, settings, navigate]);

  const startSpeedTest = useCallback(() => {
    if (speedTestState.running) return;

    logger.i('SpeedTest', 'Initiating live network benchmark');
    setSpeedTestState({
      running: true,
      phase: 'ping',
      pingMs: 0,
      jitterMs: 0,
      downloadMbps: 0,
      uploadMbps: 0,
      packetLoss: 0,
      progress: 5,
    });

    // Step 1: Ping & Jitter
    setTimeout(() => {
      const ping = Math.floor(Math.random() * 14 + 18);
      const jitter = Math.floor(Math.random() * 3 + 1);
      setSpeedTestState((prev) => ({
        ...prev,
        phase: 'download',
        pingMs: ping,
        jitterMs: jitter,
        progress: 25,
      }));

      // Step 2: Download Sweep
      let downTick = 0;
      const downInterval = setInterval(() => {
        downTick++;
        const currentDown = Math.floor(Math.random() * 45 + 180);
        setSpeedTestState((prev) => ({
          ...prev,
          downloadMbps: currentDown,
          progress: 25 + downTick * 6,
        }));

        if (downTick >= 6) {
          clearInterval(downInterval);
          // Step 3: Upload Sweep
          setSpeedTestState((prev) => ({
            ...prev,
            phase: 'upload',
            progress: 65,
          }));

          let upTick = 0;
          const upInterval = setInterval(() => {
            upTick++;
            const currentUp = Math.floor(Math.random() * 20 + 85);
            setSpeedTestState((prev) => ({
              ...prev,
              uploadMbps: currentUp,
              progress: 65 + upTick * 6,
            }));

            if (upTick >= 6) {
              clearInterval(upInterval);
              setSpeedTestState((prev) => ({
                ...prev,
                running: false,
                phase: 'completed',
                packetLoss: 0.0,
                progress: 100,
              }));
              logger.i('SpeedTest', `Benchmark finished: ${ping}ms ping, download ~195Mbps, upload ~92Mbps`);
            }
          }, 250);
        }
      }, 250);
    }, 800);
  }, [speedTestState.running]);

  const refreshEntitlement = useCallback(async (): Promise<Entitlement | null> => {
    try {
      const resp = await fetch('/api/auth/status');
      if (resp.ok) {
        const data = await resp.json();
        setAuth((prev) => (prev ? { ...prev, user: { ...prev.user, ...data } } : prev));
        return data;
      }
    } catch (err) {}
    return null;
  }, []);

  return (
    <AppContext.Provider
      value={{
        route,
        navigate,
        goBack,
        activeTab,
        setActiveTab,
        themeMode: settings.themeMode,
        effectiveTheme,
        setThemeMode,
        toggleTheme,
        auth,
        setAuth: handleSetAuth,
        signOut,
        settings,
        updateSettings,
        securityFeatures,
        updateSecurityFeatures,
        selectedProxy,
        setSelectedProxy,
        connectionState,
        lastError,
        connectDuration,
        downloadSpeed,
        uploadSpeed,
        totalDownloaded,
        totalUploaded,
        verifiedExitCountry,
        throughputHistory,
        uploadHistory,
        speedTestState,
        startSpeedTest,
        isExportModalOpen,
        setIsExportModalOpen,
        requestConnect,
        disconnect,
        refreshEntitlement,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within an AppProvider');
  return ctx;
};
