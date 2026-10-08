import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Search,
  Signal,
  Zap,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { VpnCountry, ProxyCandidate } from '../types';

type RegionTab = 'ALL' | 'Americas' | 'Europe' | 'Asia-Pacific';

export const ServerListScreen: React.FC = () => {
  const { selectedProxy, setSelectedProxy, setActiveTab } = useApp();
  const [countries, setCountries] = useState<VpnCountry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [regionFilter, setRegionFilter] = useState<RegionTab>('ALL');

  const [pingResults, setPingResults] = useState<Record<string, number>>({});
  const [pingStatus, setPingStatus] = useState<Record<string, 'pending' | 'done' | 'failed'>>({});

  useEffect(() => {
    let isMounted = true;
    const fetchServers = async () => {
      try {
        setIsLoading(true);
        const resp = await fetch('/api/servers');
        if (resp.ok) {
          const data = await resp.json();
          if (isMounted) setCountries(data.countries || []);
        }
      } catch (err) {
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchServers();
    return () => {
      isMounted = false;
    };
  }, []);

  // Ping test
  useEffect(() => {
    if (countries.length === 0) return;

    countries.forEach((country) => {
      country.cities.forEach((city) => {
        const pingKey = `${country.code}:${city.code}`;
        if (pingStatus[pingKey]) return;

        const s = city.servers[0];
        if (!s) return;

        setPingStatus((prev) => ({ ...prev, [pingKey]: 'pending' }));

        fetch('/api/ping', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ host: s.hostname, port: s.port || 443 }),
        })
          .then((res) => res.json())
          .then((data) => {
            if (data && typeof data.latencyMs === 'number') {
              setPingResults((prev) => ({ ...prev, [pingKey]: data.latencyMs }));
              setPingStatus((prev) => ({ ...prev, [pingKey]: 'done' }));
            } else {
              setPingStatus((prev) => ({ ...prev, [pingKey]: 'failed' }));
            }
          })
          .catch(() => setPingStatus((prev) => ({ ...prev, [pingKey]: 'failed' })));
      });
    });
  }, [countries]);

  const handleSelect = (candidate: ProxyCandidate) => {
    setSelectedProxy(candidate);
    setActiveTab('dashboard');
  };

  // Filter countries by search query and region
  const filteredCountries = countries.filter((c) => {
    if (c.code === 'REC') return true;
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.cities.some(
        (city) =>
          city.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          city.code.toLowerCase().includes(searchQuery.toLowerCase())
      );
    if (!matchesSearch) return false;

    if (regionFilter !== 'ALL' && c.region !== regionFilter) {
      return false;
    }
    return true;
  });

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] p-4 max-w-md mx-auto text-slate-100 pb-20 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between py-1 border-b border-slate-800">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-400 font-semibold">
            Global Infrastructure
          </span>
          <h1 className="text-xl font-bold tracking-tight">Worldwide Servers</h1>
        </div>
        <div className="flex items-center gap-1 text-xs font-mono text-cyan-400">
          <Zap className="w-3.5 h-3.5 fill-current" />
          <span>{countries.length * 3}+ Nodes</span>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search country, city, or airport code..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-cyan-500/50 text-sm placeholder-slate-500 focus:outline-none transition"
        />
      </div>

      {/* Region Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs overflow-x-auto">
        {(['ALL', 'Americas', 'Europe', 'Asia-Pacific'] as RegionTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setRegionFilter(tab)}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition ${
              regionFilter === tab
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Server List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Loader2 className="w-7 h-7 animate-spin text-cyan-400 mb-2" />
            <span className="text-xs font-mono">Syncing server topology…</span>
          </div>
        ) : filteredCountries.length === 0 ? (
          <div className="text-center py-16 text-slate-400 text-xs">
            No servers match "{searchQuery}"
          </div>
        ) : (
          filteredCountries.map((country) => {
            if (country.code === 'REC') {
              const isSelected = selectedProxy?.countryCode === 'REC';
              return (
                <div
                  key="rec"
                  onClick={() =>
                    handleSelect({
                      host: 'us-nyc-wg-001.airvpn.network',
                      port: 443,
                      countryCode: 'REC',
                      countryName: 'Recommended',
                      cityCode: 'AUTO',
                    })
                  }
                  className={`p-4 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                    isSelected
                      ? 'bg-cyan-950/40 border-cyan-500/60 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold font-mono text-xs">
                      ⚡
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">Recommended</span>
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800">
                          AUTO-BEST
                        </span>
                      </div>
                      <span className="text-xs text-slate-400 block mt-0.5">
                        Lowest latency quantum route
                      </span>
                    </div>
                  </div>
                  {isSelected && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  )}
                </div>
              );
            }

            return (
              <div
                key={country.code}
                className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2"
              >
                {/* Country Header */}
                <div className="flex items-center justify-between px-1">
                  <span className="font-bold text-xs uppercase tracking-wider text-cyan-400">
                    {country.name}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {country.code}
                  </span>
                </div>

                {/* Cities */}
                <div className="divide-y divide-slate-800/60">
                  {country.cities.map((city, idx) => {
                    const isSelected =
                      selectedProxy?.countryCode === country.code &&
                      selectedProxy?.cityCode === city.code;
                    const pingKey = `${country.code}:${city.code}`;
                    const ping = pingResults[pingKey];
                    const server = city.servers[0];

                    return (
                      <div
                        key={city.code || idx}
                        onClick={() =>
                          handleSelect({
                            host: server?.hostname || 'edge.airvpn.network',
                            port: server?.port || 443,
                            countryCode: country.code,
                            countryName: country.name,
                            cityCode: city.code,
                          })
                        }
                        className="py-2.5 px-2 rounded-xl flex items-center justify-between hover:bg-slate-800/50 cursor-pointer transition"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-slate-200">
                              {city.name}
                            </span>
                            <span className="text-xs font-mono text-slate-400">
                              [{city.code}]
                            </span>
                          </div>
                          <span className="text-[11px] font-mono text-slate-400 block">
                            {server?.hostname || 'air-node-edge'}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1 font-mono text-xs">
                            <Signal
                              className={`w-3.5 h-3.5 ${
                                ping && ping < 50
                                  ? 'text-emerald-400'
                                  : ping && ping < 100
                                  ? 'text-cyan-400'
                                  : 'text-amber-400'
                              }`}
                            />
                            <span
                              className={
                                ping && ping < 50
                                  ? 'text-emerald-400 font-semibold'
                                  : ping && ping < 100
                                  ? 'text-cyan-400'
                                  : 'text-slate-400'
                              }
                            >
                              {ping ? `${ping}ms` : '—'}
                            </span>
                          </span>

                          {isSelected && (
                            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
