import { LogEntry, LogLevel } from '../types';

class AppLoggerService {
  private buffer: LogEntry[] = [];
  private maxEntries = 2000;
  private idCounter = 1;
  private listeners: Set<(entries: LogEntry[]) => void> = new Set();

  constructor() {
    this.i('AppLogger', 'Logger initialized');
  }

  private add(level: LogLevel, tag: string, message: string) {
    const entry: LogEntry = {
      id: this.idCounter++,
      timestampMillis: Date.now(),
      level,
      tag,
      message,
    };
    this.buffer.push(entry);
    if (this.buffer.length > this.maxEntries) {
      this.buffer.shift();
    }
    this.notify();
  }

  d(tag: string, message: string) {
    this.add('INFO', tag, message);
  }

  i(tag: string, message: string) {
    this.add('INFO', tag, message);
  }

  w(tag: string, message: string, error?: any) {
    const msg = error ? `${message}: ${error?.message || error}` : message;
    this.add('WARN', tag, msg);
  }

  e(tag: string, message: string, error?: any) {
    const msg = error ? `${message}: ${error?.message || error}` : message;
    this.add('ERROR', tag, msg);
  }

  getEntries(): LogEntry[] {
    return [...this.buffer];
  }

  clear() {
    this.buffer = [];
    this.notify();
  }

  subscribe(listener: (entries: LogEntry[]) => void): () => void {
    this.listeners.add(listener);
    listener([...this.buffer]);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    const copy = [...this.buffer];
    for (const l of this.listeners) {
      l(copy);
    }
  }

  exportAsText(): string {
    return this.buffer
      .map((entry) => {
        const d = new Date(entry.timestampMillis);
        const pad = (n: number) => n.toString().padStart(2, '0');
        const ms = entry.timestampMillis.toString().slice(-3);
        const time = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}.${ms}`;
        return `${time} ${entry.level.padEnd(5)} [${entry.tag}] ${entry.message}`;
      })
      .join('\n');
  }
}

export const logger = new AppLoggerService();
