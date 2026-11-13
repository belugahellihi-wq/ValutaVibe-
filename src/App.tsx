import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Activity, ArrowDownLeft, ArrowLeftRight, ArrowUpRight, Check, ChevronDown, ChevronRight, Globe2, Heart, Info, RefreshCw, Search, ShieldCheck, SlidersHorizontal, Star, WifiOff, X } from 'lucide-react';
import { App as NativeApp } from '@capacitor/app';
import { Chart } from './components/Chart';
import { Sheet } from './components/Sheet';
import { currencies, codes, meta, format, dateLabel, type Currency } from './lib/currencies';
import { convert, historyQuery, market, marketQuery, parseAmount, series } from './lib/api';
import { useRates } from './hooks/useRates';
import { useConnection } from './hooks/useConnection';
import { haptic, isNative } from './lib/native';
import { read, write } from './lib/storage';

type Tab = 'overview' | 'currencies' | 'converter' | 'favorites';
const periods = [{ label: '1Н', days: 7 }, { label: '1М', days: 30 }, { label: '3М', days: 90 }, { label: '1Г', days: 365 }];
const tabs = [{ id: 'overview', label: 'Обзор', icon: Activity }, { id: 'currencies', label: 'Валюты', icon: Globe2 }, { id: 'converter', label: 'Расчёт', icon: ArrowLeftRight }, { id: 'favorites', label: 'Избранное', icon: Star }] as const;
const validCurrency = (value: unknown): value is Currency => codes.includes(value as Currency);
function Badge({ code }: { code: Currency }) { const c = meta(code); return <span className="currency-badge" style={{ color: c.color, backgroundColor: c.color + '13', borderColor: c.color + '24' }}>{c.symbol}</span>; }
function Change({ value, caption = '' }: { value: number | null; caption?: string }) { return <span className={`change ${value === null || value === 0 ? 'neutral' : value > 0 ? 'positive' : 'negative'}`}>{value !== null && (value >= 0 ? <ArrowUpRight size={14}/> : <ArrowDownLeft size={14}/>)}{value === null ? '—' : `${value > 0 ? '+' : ''}${format(value, 2)}%`}{caption && <span>{caption}</span>}</span>; }

export default function App() {
  const [tab, setTab] = useState<Tab>('overview');
  const [base, setBase] = useState<Currency>(() => { const saved = read<unknown>('base', 'KGS'); return validCurrency(saved) ? saved : 'KGS'; });
  const [selected, setSelected] = useState<Currency>('USD');
  const [period, setPeriod] = useState(30);
  const [favorites, setFavorites] = useState<Currency[]>(() => { const saved = read<unknown>('favorites', ['USD', 'EUR', 'GBP']); return Array.isArray(saved) ? saved.filter(validCurrency) : ['USD', 'EUR', 'GBP']; });
  const [query, setQuery] = useState('');
  const [sheet, setSheet] = useState<'base' | 'about' | null>(null);
  const close = useCallback(() => setSheet(null), []);
  const [revision, setRevision] = useState(0);
  const refresh = useCallback(() => setRevision(n => n + 1), []);
  const online = useConnection(refresh);
  const reduced = useReducedMotion();
  const actualSelected = selected === base ? (base === 'USD' ? 'EUR' : 'USD') : selected;
  const rates = useRates(marketQuery(base), revision, online);
  const history = useRates(historyQuery(actualSelected, base, period), revision, online);
  const rows = useMemo(() => market(rates.rows, base), [rates.rows, base]);
  const points = useMemo(() => series(history.rows, actualSelected, base), [history.rows, actualSelected, base]);
  const current = rows.find(r => r.code === actualSelected);
  const periodChange = points.length > 1 ? (points.at(-1)!.value / points[0].value - 1) * 100 : null;
  const [from, setFrom] = useState<Currency>('USD'); const [to, setTo] = useState<Currency>('KGS'); const [amount, setAmount] = useState('100');
  const numericAmount = parseAmount(amount);
  const valueOf = (code: Currency) => code === base ? 1 : rows.find(r => r.code === code)?.value;
  const fromRate = valueOf(from); const toRate = valueOf(to);
  const conversion = numericAmount === null ? null : from === to ? numericAmount : fromRate && toRate ? convert(numericAmount, fromRate, toRate) : null;
  const conversionRows = rows.filter(r => r.code === from || r.code === to);
  const dates = [...new Set(conversionRows.map(r => r.date))];
  useEffect(() => { write('favorites', favorites); }, [favorites]);
  useEffect(() => { write('base', base); }, [base]);
  useEffect(() => {
    if (!isNative) return;
    const listener = NativeApp.addListener('backButton', () => { if (sheet) setSheet(null); else if (tab !== 'overview') setTab('overview'); else void NativeApp.exitApp(); });
    return () => { void listener.then(h => h.remove()); };
  }, [sheet, tab]);
  const go = (next: Tab) => { haptic(); setTab(next); window.scrollTo({ top: 0 }); };
  const toggle = (code: Currency) => { haptic(); setFavorites(f => f.includes(code) ? f.filter(c => c !== code) : [...f, code]); };
  const inspect = (code: Currency) => { setSelected(code); go('overview'); };
  const shown = currencies.filter(c => c.code !== base && (tab !== 'favorites' || favorites.includes(c.code)) && `${c.code} ${c.name}`.toLocaleLowerCase().includes(query.toLocaleLowerCase()));
  const currencyCards = (list: readonly { code: Currency }[]) => <div className="currency-list">{list.map(({ code }, index) => {
    const row = rows.find(r => r.code === code);
    return <motion.div key={code} className="currency-row" initial={{ opacity: 0, y: reduced ? 0 : 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(index, 5) * .035 }}>
      <motion.button whileTap={{ scale: .975 }} transition={{ type: 'spring', stiffness: 400, damping: 24 }} className="currency-main" onClick={() => inspect(code)} aria-label={`График ${code} к ${base}`}><Badge code={code}/><div className="currency-name"><strong>{code}</strong><span>{meta(code).name}</span></div><div className="currency-price"><strong>{row ? format(row.value) : '—'}</strong><Change value={row?.change ?? null}/><small>{row ? dateLabel(row.date) : 'Нет данных'}</small></div></motion.button>
      <button className={`favorite-button ${favorites.includes(code) ? 'is-favorite' : ''}`} aria-label={`${favorites.includes(code) ? 'Убрать' : 'Добавить'} ${code} ${favorites.includes(code) ? 'из избранного' : 'в избранное'}`} aria-pressed={favorites.includes(code)} onClick={() => toggle(code)}><Star size={17} fill={favorites.includes(code) ? 'currentColor' : 'none'}/></button>
    </motion.div>;
  })}</div>;
  return <>
    <div className="ambient" aria-hidden="true"/>
    <div className="app-shell" inert={sheet ? true : undefined}>
      <header className="app-header"><div className="brand"><img src="./icon.svg" alt=""/><span>Valuta<span>Vibe</span></span></div><button className="icon-button" onClick={() => setSheet('about')} aria-label="О приложении"><SlidersHorizontal size={19}/></button></header>
      <main>
        <div className="topline"><span className="eyebrow">ТВОЙ ВАЛЮТНЫЙ РИТМ</span><span className={`connection ${online ? '' : 'offline'}`}><i/>{online ? 'Справочные курсы' : 'Офлайн'}</span></div>
        <div className="page-heading"><h1>{tab === 'overview' ? 'Рынок в фокусе' : tab === 'currencies' ? 'Мировые валюты' : tab === 'converter' ? 'Простой расчёт' : 'Под наблюдением'}</h1><button className="icon-button" onClick={() => { haptic(); refresh(); }} disabled={rates.loading || history.loading} aria-label="Обновить курсы"><RefreshCw size={18} className={rates.loading ? 'spin' : ''}/></button></div>
        <div className="base-line"><span>{tab === 'converter' ? 'Без комиссий в расчёте' : 'Стоимость одной единицы в'}</span><button onClick={() => setSheet('base')}>{base}<ChevronDown size={14}/></button></div>
        {(rates.cached || rates.error) && <div className="notice" role="status">{!online ? <WifiOff size={17}/> : <Info size={17}/>}<div>{rates.rows.length ? 'Сохранённые курсы' : rates.error ?? 'Загрузка'}<small>{rates.error ? rates.error : 'Проверяем обновления…'}{rates.savedAt ? ` · Сохранено ${new Date(rates.savedAt).toLocaleString('ru-RU')}` : ''}</small></div>{!rates.loading && <button onClick={refresh} aria-label="Повторить загрузку"><RefreshCw size={17}/></button>}</div>}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={tab} initial={{ opacity: 0, y: reduced ? 0 : 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: reduced ? 0 : -6 }} transition={{ duration: .16 }}>
            {tab === 'overview' && <>
              <section className="hero-card glass">
                <div className="hero-heading"><div className="flex items-center gap-3"><Badge code={actualSelected}/><div><label className="pair-select"><select aria-label="Валюта графика" value={actualSelected} onChange={e => { haptic(); setSelected(e.target.value as Currency); }} >{currencies.filter(c => c.code !== base).map(c => <option key={c.code} value={c.code}>{c.code} / {base}</option>)}</select><ChevronDown size={14}/></label><p>{meta(actualSelected).name}</p></div></div><button className={`icon-button ${favorites.includes(actualSelected) ? 'is-favorite' : ''}`} aria-label="Избранная валюта графика" aria-pressed={favorites.includes(actualSelected)} onClick={() => toggle(actualSelected)}><Star size={18} fill={favorites.includes(actualSelected) ? 'currentColor' : 'none'}/></button></div>
                <div className="hero-value">{current ? format(current.value) : rates.loading ? <span className="skeleton value-skeleton"/> : '—'}<span>{base}</span></div>
                <div className="hero-meta"><Change value={current?.change ?? null}/><span>{current?.previousDate ? `к ${dateLabel(current.previousDate)}` : 'К предыдущей доступной дате'}</span></div>
                <div className="periods" role="group" aria-label="Период графика">{periods.map(p => <button key={p.days} aria-pressed={period === p.days} className={period === p.days ? 'selected' : ''} onClick={() => { haptic(); setPeriod(p.days); }}>{period === p.days && <motion.span className="period-highlight" layoutId="period" transition={{ type: 'spring', damping: 25, stiffness: 350 }}/>}<span>{p.label}</span></button>)}</div>
                {history.loading && !points.length ? <div className="skeleton chart-skeleton" aria-label="Загрузка графика"/> : points.length ? <Chart key={`${actualSelected}-${base}-${period}`} points={points} unit={base}/> : <div className="chart-empty"><Activity size={28}/><p>{history.error ?? 'Нет истории для этой пары'}</p><button className="text-button" onClick={refresh}>Попробовать ещё раз</button></div>}
                {(history.cached || history.error) && <p className="data-note">{history.cached ? 'График из сохранённых данных. ' : ''}{history.error ?? 'Проверяем обновления…'}</p>}
                <div className="period-total"><span>За выбранный период</span><Change value={periodChange}/></div>
              </section>
              <button className="insight-card" onClick={() => go('converter')}><div className="insight-icon"><ArrowLeftRight size={20}/></div><div><strong>Посчитай в своей валюте</strong><p>Понятный расчёт. Только цифры.</p></div><ChevronRight size={18}/></button>
              <div className="section-heading"><h2>На твоём радаре <span>{favorites.filter(c => c !== base).length}</span></h2><button className="text-button" onClick={() => go('currencies')}>Все валюты <ChevronRight size={14}/></button></div>
              {favorites.filter(c => c !== base).length ? currencyCards(currencies.filter(c => favorites.includes(c.code) && c.code !== base)) : <div className="empty-card"><Star/><p>Добавь валюты на свой радар</p><button className="text-button" onClick={() => go('currencies')}>Выбрать валюты</button></div>}
            </>}
            {(tab === 'currencies' || tab === 'favorites') && <><label className="search-box"><Search size={19}/><input placeholder="Код или название валюты" value={query} onChange={e => setQuery(e.target.value)} aria-label="Поиск валюты"/>{query && <button aria-label="Очистить поиск" onClick={() => setQuery('')}><X size={17}/></button>}</label><div className="list-heading"><span>ВАЛЮТА</span><span>КУРС / ИЗМЕНЕНИЕ</span></div>{shown.length ? currencyCards(shown) : <div className="empty-card"><Star/><p>{query ? 'Ничего не найдено' : 'Здесь появятся избранные валюты'}</p><button className="text-button" onClick={() => { setQuery(''); go('currencies'); }}>Посмотреть все валюты</button></div>}<p className="data-note">Изменение — к предыдущей доступной дате каждой пары. Базовая валюта {base} скрыта: её курс к себе равен 1.</p></>}
            {tab === 'converter' && <section className="converter glass"><div className="section-heading"><span className="eyebrow">КОНВЕРТЕР</span><span className="readonly-label"><ShieldCheck size={14}/> Только расчёт</span></div><label className="field-label" htmlFor="amount">Сумма</label><div className="amount-field"><input id="amount" inputMode="decimal" autoComplete="off" value={amount} onChange={e => setAmount(e.target.value)} maxLength={19} aria-invalid={numericAmount === null}/><select aria-label="Исходная валюта" value={from} onChange={e => setFrom(e.target.value as Currency)}>{currencies.map(c => <option key={c.code}>{c.code}</option>)}</select></div>{numericAmount === null && <p className="input-error">Введи положительное число или 0: до 12 цифр и 6 знаков после запятой.</p>}<div className="swap-row"><span/><motion.button whileTap={{ rotate: 180 }} className="swap-button" aria-label="Поменять валюты местами" onClick={() => { haptic(); setFrom(to); setTo(from); }}><ArrowLeftRight size={20}/></motion.button><span/></div><label className="field-label" htmlFor="to">Результат в валюте</label><select id="to" className="target-select" value={to} onChange={e => setTo(e.target.value as Currency)}>{currencies.map(c => <option key={c.code} value={c.code}>{c.code} — {c.name}</option>)}</select><div className="conversion-result" aria-live="polite"><span>Примерно</span><strong>{conversion === null ? '—' : format(conversion, 2)}</strong><span>{to}</span></div><div className="conversion-note"><Info size={17}/><p>{from === to ? 'Одинаковые валюты: курс равен 1.' : fromRate && toRate ? `1 ${from} ≈ ${format(fromRate / toRate, 6)} ${to}. Данные: ${dates.map(dateLabel).join(' / ')}.${dates.length > 1 ? ' Даты источников различаются.' : ''}` : 'Для расчёта нужны курсы обеих валют.'} {from !== to && rates.cached ? 'Использованы сохранённые данные.' : ''}</p></div><p className="data-note">Справочная оценка без банковского спреда и комиссий. Приложение не выполняет обмен или перевод денег.</p></section>}
            <footer className="data-footer"><span><i/> FRANKFURTER · СПРАВОЧНЫЕ ДАННЫЕ</span><p>{current ? `Пара ${actualSelected}/${base} · ${dateLabel(current.date)} ${current.date.slice(0, 4)}` : 'Дата курса появится после загрузки'}<br/>Курсы могут отличаться от предложений банков.</p></footer>
          </motion.div>
        </AnimatePresence>
      </main>
      <nav className="bottom-nav" aria-label="Главная навигация">{tabs.map(({ id, label, icon: Icon }) => <button key={id} aria-current={tab === id ? 'page' : undefined} className={tab === id ? 'active' : ''} onClick={() => go(id)}><span className="nav-icon">{tab === id && <motion.span layoutId="nav" className="nav-highlight"/>}<Icon size={21}/></span><span>{label}</span></button>)}</nav>
    </div>
    <AnimatePresence>{sheet && <Sheet title={sheet === 'base' ? 'В чём считать курс?' : 'Твой валютный ритм'} close={close}>{sheet === 'base' ? <><p className="sheet-description">Одна единица каждой валюты будет показана в выбранной валюте.</p><div className="base-options">{currencies.map(c => <button key={c.code} onClick={() => { haptic(); setBase(c.code); close(); }}><Badge code={c.code}/><div><strong>{c.code}</strong><span>{c.name}</span></div>{base === c.code && <Check size={20} className="positive"/>}</button>)}</div></> : <div className="about-content"><img src="./icon.svg" alt="Логотип ValutaVibe"/><h3>ValutaVibe <span>1.0</span></h3><p>Наблюдай за курсами, изучай историю и считай эквивалент суммы.</p><div className="about-feature"><ShieldCheck/><div><strong>Только информация</strong><p>Без счетов, кошельков, покупок и переводов.</p></div></div><div className="about-feature"><Activity/><div><strong>Прозрачные данные</strong><p>Frankfurter публикует справочные курсы из официальных источников. Это не котировки в реальном времени и не инвестиционные рекомендации.</p></div></div><div className="about-feature"><Heart/><div><strong>Твои настройки — на устройстве</strong><p>Избранное и последние загруженные курсы сохраняются локально. Запросы курсов идут напрямую к Frankfurter; сервис видит обычные сетевые данные, включая IP.</p></div></div></div>}</Sheet>}</AnimatePresence>
  </>;
}
