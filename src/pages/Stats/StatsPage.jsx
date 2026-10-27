import { useState } from 'react';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { clsx } from 'clsx';

import { useVolume } from './stats.hooks.js';
import { VolumeBars } from './widgets/VolumeBars.jsx';
import { CardArt } from '../../shared/ui/CardArt.jsx';
import { Skeleton } from '../../shared/ui/Skeleton.jsx';
import { SectionLink } from '../../shared/ui/SectionLink.jsx';
import { muscleGroupLabel } from '../../entities/exercise/muscleGroups.js';

const PERIODS = [
    { weeks: 4, label: 'Месяц' },
    { weeks: 12, label: '3 месяца' },
    { weeks: 26, label: 'Полгода' },
    { weeks: 52, label: 'Год' },
];

const tonnage = (kg) =>
    kg >= 1000 ? `${(kg / 1000).toFixed(1)} т` : `${Math.round(kg)} кг`;

const change = (now, before) => {
    if (!before) return null;
    const pct = ((now - before) / before) * 100;
    return Math.abs(pct) < 1 ? null : Math.round(pct);
};

export const StatsPage = () => {
    const [weeks, setWeeks] = useState(12);
    const query = useVolume(weeks);
    const data = query.data;

    return (
        <div className="space-y-5">
            <section
                aria-label="Нагрузка"
                className="relative isolate clip-card-art overflow-hidden rounded-2xl border border-border bg-surface p-5 sm:p-7"
            >
                <CardArt name="black" className="card-art-hero" />

                <div className="relative pr-[34%] sm:pr-40">
                    <p className="font-display text-sm font-semibold uppercase tracking-[0.14em] text-text-muted">
                        Нагрузка
                    </p>
                    <h1 className="mt-2 font-display text-3xl font-extrabold leading-tight tracking-tight text-text sm:text-4xl">
                        {data ? tonnage(data.totals.tonnage) : '-'}
                    </h1>
                    <p className="mt-2 max-w-[34ch] text-sm text-text-muted">
                        Суммарный поднятый вес за период. Упражнения с собственным весом дают нулевой тоннаж, но считаются в подходах.
                    </p>
                    <div className="mt-4">
                        <SectionLink to="/records">Рекорды</SectionLink>
                    </div>
                </div>
            </section>

            <div className="flex flex-wrap gap-1.5" role="group" aria-label="Период">
                {PERIODS.map((p) => (
                    <button
                        key={p.weeks}
                        onClick={() => setWeeks(p.weeks)}
                        aria-pressed={weeks === p.weeks}
                        className={clsx(
                            'min-h-[36px] rounded-xl border px-3 text-sm font-medium transition-colors',
                            weeks === p.weeks
                                ? 'border-cta bg-cta/10 text-text'
                                : 'border-border text-text-muted hover:bg-surface-2 hover:text-text'
                        )}
                    >
                        {p.label}
                    </button>
                ))}
            </div>

            {query.isLoading || !data ? (
                <>
                    <Skeleton className="h-24 w-full rounded-2xl" />
                    <Skeleton className="h-48 w-full rounded-2xl" />
                </>
            ) : (
                <>
                    <dl className="grid grid-cols-3 gap-2">
                        <Tile label="Тоннаж" value={tonnage(data.totals.tonnage)} delta={change(data.totals.tonnage, data.previous.tonnage)} />
                        <Tile label="Подходы" value={data.totals.sets} delta={change(data.totals.sets, data.previous.sets)} />
                        <Tile label="Тренировки" value={data.totals.sessions} delta={change(data.totals.sessions, data.previous.sessions)} />
                    </dl>

                    <section aria-label="По неделям" className="rounded-2xl border border-border bg-surface p-4">
                        <h2 className="mb-3 font-display text-xs font-semibold uppercase tracking-[0.14em] text-text-muted">
                            По неделям
                        </h2>
                        <VolumeBars series={data.series} />
                    </section>

                    <section aria-label="По группам мышц" className="rounded-2xl border border-border bg-surface p-4">
                        <h2 className="mb-3 font-display text-xs font-semibold uppercase tracking-[0.14em] text-text-muted">
                            Куда уходит работа
                        </h2>

                        {data.byMuscle.length === 0 ? (
                            <p className="py-4 text-center text-sm text-text-muted">
                                За этот период завершенных подходов нет.
                            </p>
                            ) : (
                                <MuscleSplit rows={data.byMuscle} />
                            )}
                    </section>
                </>
            )}
        </div>
    );
};

const Tile = ({ label, value, delta }) => (
  <div className="rounded-2xl border border-border bg-surface p-3">
    <dd className="font-display text-xl font-bold tabular-nums text-text">{value}</dd>
    <dt className="truncate text-xs text-text-muted">{label}</dt>
    {delta != null && (
      <p className="mt-0.5 flex items-center gap-0.5 text-[11px] tabular-nums text-text-muted">
        {delta < 0 ? <TrendingDown size={11} /> : <TrendingUp size={11} />}
        {Math.abs(delta)}%
      </p>
    )}
  </div>
);

const MuscleSplit = ({ rows }) => {
  const totalSets = rows.reduce((sum, r) => sum + r.sets, 0) || 1;

  return (
    <ol className="space-y-3">
      {rows.map((r) => {
        const share = Math.round((r.sets / totalSets) * 100);

        return (
          <li key={r.muscleGroup}>
            <div className="mb-1 flex items-baseline justify-between gap-2 text-sm">
              <span className="min-w-0 truncate text-text">{muscleGroupLabel(r.muscleGroup)}</span>
              <span className="shrink-0 tabular-nums text-text-muted">
                {r.sets} × {share}%
                {r.tonnage > 0 && ` · ${tonnage(r.tonnage)}`}
                {r.avgRpe != null && <span className="text-gold-ink"> · RPE {r.avgRpe}</span>}
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
              <div
                className="h-full rounded-full bg-accent transition-[width] duration-ui ease-brand"
                style={{ width: `${share}%` }}
              />
            </div>
          </li>
        );
      })}
    </ol>
  );
};