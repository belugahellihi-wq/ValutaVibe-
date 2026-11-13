import { useEffect, useState } from 'react';
import { cacheKey, parseRates, requestRates, type Rate } from '../lib/api';
import { pruneCache, read, write } from '../lib/storage';
interface Result { key: string; rows: Rate[]; loading: boolean; cached: boolean; error: string | null; savedAt: number | null }
function initial(key: string): Result {
  const saved = read<{ rows: unknown; savedAt: number } | null>('rates:' + cacheKey(key), null);
  try { if (saved) return { key, rows: parseRates(saved.rows), savedAt: saved.savedAt, loading: true, cached: true, error: null }; } catch { /* Reject corrupt cache. */ }
  return { key, rows: [], loading: true, cached: false, error: null, savedAt: null };
}
export function useRates(query: string, revision: number, online: boolean) {
  const [state, setState] = useState<Result>(() => initial(query));
  useEffect(() => {
    const controller = new AbortController();
    const cached = initial(query);
    setState(cached);
    if (!online) { setState({ ...cached, loading: false, error: 'Нет подключения к интернету' }); return; }
    let active = true;
    const timer = setTimeout(() => controller.abort(), 15000);
    requestRates(query, controller.signal).then(rows => {
      if (!active) return;
      const savedAt = Date.now(); write('rates:' + cacheKey(query), { rows, savedAt }); pruneCache();
      setState({ key: query, rows, savedAt, loading: false, cached: false, error: null });
    }).catch((error: unknown) => {
      if (!active) return;
      const message = controller.signal.aborted ? 'Сервис долго не отвечает. Попробуй ещё раз.' : error instanceof Error ? error.message : 'Не удалось загрузить курсы';
      setState({ ...cached, loading: false, error: message });
    }).finally(() => clearTimeout(timer));
    return () => { active = false; clearTimeout(timer); controller.abort(); };
  }, [query, revision, online]);
  return state.key === query ? state : initial(query);
}
