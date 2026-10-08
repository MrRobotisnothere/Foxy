import React, { useState, useEffect } from 'react';
import { ArrowLeft, Copy, Trash2, Download, Check, Terminal } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { logger } from '../services/logger';
import { LogEntry } from '../types';

type LogFilter = 'ALL' | 'INFO' | 'PROBLEMS';

export const LogsScreen: React.FC = () => {
  const { goBack } = useApp();
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [filter, setFilter] = useState<LogFilter>('ALL');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const unsubscribe = logger.subscribe((newEntries) => {
      setEntries(newEntries);
    });
    return unsubscribe;
  }, []);

  const countsByFilter = {
    ALL: entries.length,
    INFO: entries.filter((e) => e.level === 'INFO').length,
    PROBLEMS: entries.filter((e) => e.level === 'WARN' || e.level === 'ERROR').length,
  };

  const visibleEntries = entries.filter((e) => {
    if (filter === 'ALL') return true;
    if (filter === 'INFO') return e.level === 'INFO';
    if (filter === 'PROBLEMS') return e.level === 'WARN' || e.level === 'ERROR';
    return true;
  });

  const handleCopy = () => {
    const text = logger.exportAsText();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const text = logger.exportAsText();
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `airvpn-telemetry-${new Date().toISOString().replace(/[:.]/g, '-')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    logger.clear();
  };

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  };

  return (
    <div className="flex flex-col min-h-screen p-4 max-w-md mx-auto text-slate-100 bg-[#0B0F19]">
      {/* Top Header */}
      <header className="flex items-center justify-between py-2 border-b border-slate-800 mb-3">
        <div className="flex items-center gap-3">
          <button
            onClick={goBack}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-slate-800 transition text-slate-400 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <h1 className="font-bold text-base text-white">
              Diagnostics ({visibleEntries.length})
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleDownload}
            title="Download Logs"
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={handleCopy}
            title="Copy Logs"
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
          <button
            onClick={handleClear}
            title="Clear Logs"
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs mb-3">
        {(['ALL', 'INFO', 'PROBLEMS'] as LogFilter[]).map((opt) => (
          <button
            key={opt}
            onClick={() => setFilter(opt)}
            className={`flex-1 py-1.5 rounded-lg font-medium transition ${
              filter === opt
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {opt} ({countsByFilter[opt]})
          </button>
        ))}
      </div>

      {/* Log Feed */}
      <div className="flex-1 overflow-y-auto space-y-2 font-mono text-xs pr-1">
        {visibleEntries.length === 0 ? (
          <div className="text-center py-24 text-slate-500">
            No diagnostic events matching filter.
          </div>
        ) : (
          [...visibleEntries].reverse().map((entry) => (
            <div
              key={entry.id}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800/80 leading-relaxed break-words"
            >
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[10px] text-slate-500">
                  {formatTime(entry.timestampMillis)}
                </span>
                <span
                  className={`text-[10px] font-bold ${
                    entry.level === 'ERROR'
                      ? 'text-red-400'
                      : entry.level === 'WARN'
                      ? 'text-amber-400'
                      : 'text-cyan-400'
                  }`}
                >
                  {entry.level}
                </span>
                <span className="text-[10px] text-slate-400">[{entry.tag}]</span>
              </div>
              <p className="text-slate-300 font-mono text-[11px]">{entry.message}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
