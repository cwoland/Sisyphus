import { useState, useMemo } from 'react';
import { Trash2, TrendingDown, TrendingUp } from 'lucide-react';
import { ru } from 'date-fns/locale';
import { clsx } from 'clsx';

import { BODY_FIELDS } from './bodyFields.js';
import { Sparkline } from '../../shared/ui/Sparkline.jsx';
import { IconButton } from '../../shared/ui/IconButton.jsx';
import { safeFormat } from '../../shared/lib/date.js';
import { plural } from '../../shared/lib/plural.js';

const show = (v) => (v == null ? '—' : String(Number(v)));

const signed = (d) => `${d > 0 ? '+' : '−'}${Math.abs(d).toFixed(1)}`;

export const BodyHistory = ({ metrics, onDelete }) => {
  const available = useMemo(
    () => BODY_FIELDS.filter((f) => metrics.some((m) => m[f.key] != null)),
    [metrics]
  );

  const [metric, setMetric] = useState(() => available[0]?.key ?? 'weight');
  const active = available.find((f) => f.key === metric) || available[0] || null;

  const points = useMemo(() => {
    if (!active) return [];
    return [...metrics]
      .reverse()
      .filter((m) => m[active.key] != null)
      .map((m) => ({ date: m.date, value: Number(m[active.key]) }));
  }, [metrics, active]);

  const deltas = useMemo(() => {
    const map = new Map();

    metrics.forEach((m, i) => {
      const row = {};

      for (const f of BODY_FIELDS) {
        if (m[f.key] == null) continue;

        let older = null;
        for (let j = i + 1; j < metrics.length; j += 1) {
          if (metrics[j][f.key] != null) {
            older = Number(metrics[j][f.key]);
            break;
          }
        }

        if (older == null) continue;
        const d = Number(m[f.key]) - older;
        if (Math.abs(d) >= 0.05) row[f.key] = d;
      }

      map.set(m.id, row);
    });

    return map;
  }, [metrics]);

  const total = points.length > 1 ? points[points.length - 1].value - points[0].value : null;

  return (
    <div className="space-y-5">
      {available.length > 1 && (
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Показатель для графика">
          {available.map((f) => (
            <button
              key={f.key}
              onClick={() => setMetric(f.key)}
              aria-pressed={active?.key === f.key}
              className={clsx(
                'min-h-[36px] rounded-xl border px-3 text-sm font-medium transition-colors',
                active?.key === f.key
                  ? 'border-cta bg-cta/10 text-text'
                  : 'border-border text-text-muted hover:bg-surface-2 hover:text-text'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      {active && points.length > 1 && (
        <div className="rounded-2xl border border-border bg-surface p-4">
          <div className="mb-2 flex items-baseline justify-between gap-2">
            <span className="font-display text-xs uppercase tracking-[0.14em] text-text-muted">
              {active.label}
            </span>
            <span className="font-display text-lg font-bold tabular-nums text-text">
              {points[points.length - 1].value}
              <span className="text-xs font-normal text-text-muted"> {active.unit}</span>
            </span>
          </div>

          <Sparkline points={points} className="h-16 w-full" />

          <div className="mt-2 flex items-baseline justify-between gap-2 text-[11px] tabular-nums text-text-muted">
            <span>{safeFormat(points[0].date, 'd MMM yyyy', { locale: ru })}</span>
            {total != null && (
              <span>
                за {points.length} {plural(points.length, ['замер', 'замера', 'замеров'])}:{' '}
                <b className="font-semibold text-text">{signed(total)} {active.unit}</b>
              </span>
            )}
          </div>
        </div>
      )}

      <ol className="space-y-2">
        {metrics.map((m) => {
          const row = deltas.get(m.id) || {};

          return (
            <li key={m.id} className="rounded-2xl border border-border bg-surface p-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="min-w-0 truncate text-sm font-medium text-text">
                  {safeFormat(m.date, 'd MMMM yyyy', { locale: ru })}
                </p>
                <IconButton
                  icon={Trash2} size={15}
                  onClick={() => onDelete(m)}
                  className="text-text-muted hover:text-danger"
                  aria-label={`Удалить замер за ${safeFormat(m.date, 'd MMMM yyyy', { locale: ru })}`}
                />
              </div>

              <dl className="grid grid-cols-3 gap-1.5 xs:grid-cols-5">
                {BODY_FIELDS.map((f) => {
                  const value = m[f.key];
                  const d = row[f.key];

                  return (
                    <div
                      key={f.key}
                      className={clsx(
                        'rounded-xl px-1.5 py-2 text-center',
                        value == null ? 'bg-surface-2/40' : 'bg-surface-2',
                        active?.key === f.key && value != null && 'ring-1 ring-inset ring-cta/40'
                      )}
                    >
                      <dd
                        className={clsx(
                          'font-display text-sm font-bold tabular-nums',
                          value == null ? 'text-text-muted' : 'text-text'
                        )}
                      >
                        {show(value)}
                      </dd>
                      <dt className="truncate text-[10px] text-text-muted">{f.label}</dt>
                      {d != null && (
                        <p className="flex items-center justify-center gap-0.5 text-[10px] tabular-nums text-text-muted">
                          {d < 0 ? <TrendingDown size={9} /> : <TrendingUp size={9} />}
                          {Math.abs(d).toFixed(1)}
                        </p>
                      )}
                    </div>
                  );
                })}
              </dl>
            </li>
          );
        })}
      </ol>
    </div>
  );
};
