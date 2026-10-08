const UNIT = 1024.0;
const UNITS = ['KB', 'MB', 'GB', 'TB', 'PB'];

export function formatBytes(bytes: number | null | undefined): string {
  if (bytes === null || bytes === undefined || bytes < 0) return '—';
  if (bytes < 1024) return `${bytes} B`;

  let value = bytes / UNIT;
  let index = 0;
  while (value >= UNIT && index < UNITS.length - 1) {
    value /= UNIT;
    index++;
  }

  const pattern = value >= 100 ? value.toFixed(0) : value.toFixed(1);
  return `${pattern} ${UNITS[index]}`;
}

export function formatBytesPerSecond(bytesPerSecond: number): string {
  return `${formatBytes(Math.max(0, bytesPerSecond))}/s`;
}

export function formatDuration(totalSeconds: number): string {
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');
  if (hrs > 0) {
    return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
  }
  return `${pad(mins)}:${pad(secs)}`;
}
