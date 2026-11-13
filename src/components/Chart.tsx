import { useId, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { dateLabel, format } from '../lib/currencies';
import type { Point } from '../lib/api';

export function Chart({ points, unit, compact = false }: { points: Point[]; unit: string; compact?: boolean }) {
  const gradient = useId().replace(/:/g, '');
  const reduced = useReducedMotion();
  const [selected, setSelected] = useState<number | null>(null);
  if (!points.length) return <div className="chart-empty">История пока недоступна</div>;
  const w = 340; const h = compact ? 48 : 180; const pad = compact ? 3 : 10;
  const values = points.map(p => p.value); const min = Math.min(...values); const max = Math.max(...values);
  const span = max - min || Math.max(Math.abs(max) * .01, .0001);
  const firstTime = Date.parse(points[0].date); const timeSpan = Date.parse(points.at(-1)!.date) - firstTime;
  const coords = points.map(p => ({ x: timeSpan ? pad + (Date.parse(p.date) - firstTime) / timeSpan * (w - 2 * pad) : w / 2, y: pad + (max - p.value + span * .15) / (span * 1.3) * (h - pad * 2) }));
  const path = coords.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ');
  const active = selected === null ? null : Math.min(selected, points.length - 1);
  const color = values.at(-1)! >= values[0] ? '#63e8b5' : '#fb829e';
  const point = active === null ? null : points[active];
  return <div className={compact ? 'mini-chart' : 'chart'}>
    {!compact && <div className="chart-readout" aria-live="polite"><span>{point ? dateLabel(point.date) : 'Динамика курса'}</span><span>{point ? `${format(point.value)} ${unit}` : 'Проведи по графику'}</span></div>}
    <svg viewBox={`0 0 ${w} ${h}`} role={compact ? 'img' : 'slider'} aria-label={compact ? 'Динамика курса' : 'История курса: стрелки влево и вправо выбирают дату'} aria-valuemin={compact ? undefined : 0} aria-valuemax={compact ? undefined : points.length - 1} aria-valuenow={compact ? undefined : active ?? points.length - 1} aria-valuetext={compact ? undefined : `${dateLabel((point ?? points.at(-1)!).date)}, ${format((point ?? points.at(-1)!).value)} ${unit}`} tabIndex={compact ? undefined : 0}
      onKeyDown={e => { if (compact) return; if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); setSelected(Math.max(0, Math.min(points.length - 1, (active ?? points.length - 1) + (e.key === 'ArrowLeft' ? -1 : 1)))); } if (e.key === 'Escape') setSelected(null); }}
      onPointerDown={e => { if (!compact) { e.currentTarget.setPointerCapture(e.pointerId); const x = (e.clientX - e.currentTarget.getBoundingClientRect().left) / e.currentTarget.getBoundingClientRect().width * w; setSelected(coords.reduce((best, p, i) => Math.abs(p.x - x) < Math.abs(coords[best].x - x) ? i : best, 0)); } }}
      onPointerMove={e => { if (compact || (!e.buttons && e.pointerType !== 'mouse')) return; const bounds = e.currentTarget.getBoundingClientRect(); const x = (e.clientX - bounds.left) / bounds.width * w; setSelected(coords.reduce((best, p, i) => Math.abs(p.x - x) < Math.abs(coords[best].x - x) ? i : best, 0)); }}
      onPointerLeave={() => setSelected(null)}>
      <defs><linearGradient id={gradient} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity=".24"/><stop offset="100%" stopColor={color} stopOpacity="0"/></linearGradient></defs>
      {!compact && [0.2, .5, .8].map(n => <line key={n} x1="0" x2={w} y1={h*n} y2={h*n} stroke="#ffffff0c" strokeDasharray="3 6"/>)}
      <path d={`${path} L${coords.at(-1)!.x},${h} L${coords[0].x},${h} Z`} fill={`url(#${gradient})`}/>
      <motion.path d={path} fill="none" stroke={color} strokeWidth={compact ? 3 : 2.5} strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: reduced ? 1 : 0 }} animate={{ pathLength: 1 }} transition={{ duration: .65 }}/>
      <circle cx={coords.at(-1)!.x} cy={coords.at(-1)!.y} r={compact ? 2 : 4} fill={color}/>
      {active !== null && !compact && <g><line x1={coords[active].x} x2={coords[active].x} y1="0" y2={h} stroke={color} strokeOpacity=".5" strokeDasharray="3 4"/><circle cx={coords[active].x} cy={coords[active].y} r="5" stroke="#07110d" strokeWidth="3" fill={color}/></g>}
    </svg>
    {!compact && <><div className="chart-dates"><span>{dateLabel(points[0].date)}</span><span>{points.length === 1 ? 'Одна дата' : dateLabel(points.at(-1)!.date)}</span></div><div className="chart-stats"><div><span>Минимум</span><strong>{format(min)}</strong></div><div><span>Максимум</span><strong>{format(max)}</strong></div><div><span>Точек</span><strong>{points.length}</strong></div></div></>}
  </div>;
}
