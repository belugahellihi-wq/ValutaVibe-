// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import App from '../src/App';

const sample = [
  { date: '2026-11-12', base: 'KGS', quote: 'USD', rate: 1/80 },
  { date: '2026-11-13', base: 'KGS', quote: 'USD', rate: 1/88 },
  { date: '2026-11-12', base: 'KGS', quote: 'EUR', rate: 1/90 },
  { date: '2026-11-13', base: 'KGS', quote: 'EUR', rate: 1/96 },
];
beforeEach(() => {
  localStorage.clear();
  vi.stubGlobal('scrollTo', vi.fn());
  Object.defineProperty(window, 'matchMedia', { configurable: true, value: vi.fn().mockReturnValue({ matches: true, addListener: vi.fn(), removeListener: vi.fn(), addEventListener: vi.fn(), removeEventListener: vi.fn() }) });
  vi.stubGlobal('fetch', vi.fn(async (url: string) => {
    const p = new URL(url).searchParams;
    if (p.get('base') === 'KGS') return { ok: true, json: async () => sample };
    return { ok: true, json: async () => [{ date: '2026-11-12', base: p.get('base'), quote: p.get('quotes'), rate: 80 }, { date: '2026-11-13', base: p.get('base'), quote: p.get('quotes'), rate: 88 }] };
  }));
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

describe('Application flows', () => {
  it('loads rates, converts comma decimals and changes direction', async () => {
    render(<App/>);
    await waitFor(() => expect(document.querySelector('.hero-value')?.textContent).toContain('88,00'));
    fireEvent.click(screen.getByRole('button', { name: 'Расчёт' }));
    const input = await screen.findByLabelText('Сумма');
    fireEvent.change(input, { target: { value: '12,50' } });
    expect(document.querySelector('.conversion-result')?.textContent?.replace(/\s/g, '')).toContain('1100,00');
    fireEvent.click(screen.getByRole('button', { name: 'Поменять валюты местами' }));
    expect((screen.getByLabelText('Исходная валюта') as HTMLSelectElement).value).toBe('KGS');
    expect(document.querySelector('.conversion-result')?.textContent).toContain('0,14');
    fireEvent.change(input, { target: { value: '-1' } });
    expect(document.querySelector('.conversion-result')?.textContent).toContain('—');
  });
  it('searches currencies and opens the selected chart', async () => {
    render(<App/>);
    fireEvent.click(screen.getByRole('button', { name: 'Валюты' }));
    fireEvent.change(await screen.findByLabelText('Поиск валюты'), { target: { value: 'евро' } });
    expect(document.querySelectorAll('.currency-row')).toHaveLength(1);
    fireEvent.click(screen.getByRole('button', { name: 'График EUR к KGS' }));
    await waitFor(() => expect((screen.getByRole('combobox', { name: 'Валюта графика' }) as HTMLSelectElement).value).toBe('EUR'));
  });
  it('preserves cached rates on failure and shows the offline notice', async () => {
    const { unmount } = render(<App/>);
    await waitFor(() => expect(document.querySelector('.hero-value')?.textContent).toContain('88,00'));
    unmount();
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Нет соединения')));
    render(<App/>);
    await waitFor(() => expect(screen.getByRole('status').textContent).toContain('Нет соединения'));
    expect(screen.getByRole('status').textContent).toContain('Сохранённые курсы');
    expect(document.querySelector('.hero-value')?.textContent).toContain('88,00');
    fireEvent(window, new Event('offline'));
    await waitFor(() => expect(screen.getByRole('status').textContent).toContain('Нет подключения к интернету'));
  });
  it('never substitutes fake rates when the first request fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Сервис недоступен')));
    render(<App/>);
    await waitFor(() => expect(screen.getByRole('status').textContent).toContain('Сервис недоступен'));
    expect(document.querySelector('.hero-value')?.textContent).toContain('—');
  });
});
