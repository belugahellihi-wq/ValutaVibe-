export function read<T>(key: string, fallback: T): T {
  try { const value = localStorage.getItem('vv:' + key); return value ? JSON.parse(value) : fallback; }
  catch { return fallback; }
}
export function write(key: string, value: unknown) {
  try { localStorage.setItem('vv:' + key, JSON.stringify(value)); } catch { /* Storage may be full or disabled. */ }
}
export function pruneCache() {
  try {
    const keys = Object.keys(localStorage).filter(k => k.startsWith('vv:rates:'));
    keys.sort((a, b) => (JSON.parse(localStorage.getItem(b)!).savedAt ?? 0) - (JSON.parse(localStorage.getItem(a)!).savedAt ?? 0));
    keys.slice(28).forEach(k => localStorage.removeItem(k));
  } catch { /* Cache is optional. */ }
}
