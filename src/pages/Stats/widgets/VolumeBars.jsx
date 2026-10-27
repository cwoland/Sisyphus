import { clsx } from 'clsx';
import { ru } from 'date-fns/locale';
import { safeFormat } from '../../../shared/lib/date.js';

export const VolumeBars = ({ series, metric = 'tonnage' }) => {
  const max = Math.max(...series.map((s) => s[metric]), 1);

  return (
    <div>
      <ol className="flex h-28 items-end gap-1" role="img" aria-label="Нагрузка по неделям">
        {series.map((s, i) => {
          const value = s[metric];
          const height = value > 0 ? Math.max(4, (value / max) * 100) : 2;
          const isLast = i === series.length - 1;

          return (
            <li
              key={s.week}
              className="flex-1"
              title={`${safeFormat(s.week, 'd MMM', { locale: ru })}: ${Math.round(value)}`}
            >
              <div
                className={clsx(
                  'w-full rounded-t-md transition-[height] duration-ui ease-brand',
                  value === 0 ? 'bg-border' : isLast ? 'bg-terracotta' : 'bg-accent'
                )}
                style={{ height: `${height}%` }}
              />
            </li>
          );
        })}
      </ol>

      <div className="mt-1.5 flex justify-between text-[11px] tabular-nums text-text-muted">
        <span>{safeFormat(series[0]?.week, 'd MMM', { locale: ru })}</span>
        <span>{safeFormat(series[series.length - 1]?.week, 'd MMM', { locale: ru })}</span>
      </div>
    </div>
  );
};