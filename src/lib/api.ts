import { codes, type Currency } from './currencies';
export interface Rate { date: string; base: string; quote: string; rate: number }
export interface Point { date: string; value: number }
export const API = 'https://api.frankfurter.dev/v2';
export function parseRates(value: unknown): Rate[] {
  if (!Array.isArray(value)) throw new Error('Неверный ответ сервиса');
  const rows = value.filter((r): r is Rate => r && /^\d{4}-\d{2}-\d{2}$/.test(r.date) && typeof r.base === 'string' && typeof r.quote === 'string' && typeof r.rate === 'number' && Number.isFinite(r.rate) && r.rate > 0);
  if (!rows.length) throw new Error('Курсы для этой пары недоступны');
  return rows.sort((a, b) => a.date.localeCompare(b.date));
}
export async function requestRates(query: string, signal: AbortSignal): Promise<Rate[]> {
  const response = await fetch(`${API}/rates?${query}`, { signal, credentials: 'omit' });
  if (!response.ok) throw new Error(response.status === 429 ? 'Слишком много запросов. Попробуй чуть позже.' : 'Сервис курсов временно недоступен');
  return parseRates(await response.json());
}
export function dayAgo(days: number) {
  const d = new Date(); d.setUTCDate(d.getUTCDate() - days); return d.toISOString().slice(0, 10);
}
export const marketQuery = (base: Currency) => new URLSearchParams({ base, quotes: codes.filter(c => c !== base).join(','), from: dayAgo(12), to: dayAgo(0) }).toString();
export const historyQuery = (from: Currency, to: Currency, days: number) => new URLSearchParams({ base: from, quotes: to, from: dayAgo(days), to: dayAgo(0) }).toString();
export function cacheKey(query: string) {
  const params = new URLSearchParams(query);
  const days = Math.round((Date.parse(params.get('to')!) - Date.parse(params.get('from')!)) / 86400000);
  return `${params.get('base')}:${params.get('quotes')}:${days}`;
}
export function series(rows: Rate[], from: string, to: string): Point[] {
  return rows.filter(r => r.base === from && r.quote === to).map(r => ({ date: r.date, value: r.rate }));
}
export function market(rows: Rate[], base: Currency) {
  return codes.filter(c => c !== base).flatMap(code => {
    const points = rows.filter(r => r.base === base && r.quote === code).map(r => ({ date: r.date, value: 1 / r.rate }));
    const last = points.at(-1); const previous = points.at(-2);
    return last ? [{ code, ...last, previousDate: previous?.date, change: previous ? (last.value / previous.value - 1) * 100 : null, points }] : [];
  });
}
export function convert(amount: number, fromValue: number, toValue: number) { return amount * fromValue / toValue; }
export function parseAmount(text: string): number | null {
  if (!/^\d{1,12}([.,]\d{0,6})?$/.test(text)) return null;
  const n = Number(text.replace(',', '.')); return Number.isFinite(n) ? n : null;
}
