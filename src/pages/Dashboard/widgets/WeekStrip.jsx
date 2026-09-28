import { Link } from 'react-router-dom';
import { clsx } from 'clsx';
import { weekDays, weekdayShort, toApiDate, todayApi, isSameDay } from '../../../shared/lib/date.js';

const MARK = {
  completed: 'bg-accent text-on-accent',
  in_progress: 'bg-rail-mark text-on-gold',
  skipped: 'bg-surface-2 text-text-muted line-through',
  planned: 'border-2 border-border-strong text-text-muted',
};

export const WeekStrip = ({ workouts = [] }) => {
  const days = weekDays();

  const byDate = workouts.reduce((acc, w) => {
    const prev = acc[w.date];
    // При нескольких тренировках в дне показываем самую «продвинутую»:
    // завершённая важнее идущей, идущая важнее запланированной.
    const rank = { completed: 3, in_progress: 2, planned: 1, skipped: 0 };
    if (!prev || rank[w.status] > rank[prev.status]) acc[w.date] = w;
    return acc;
  }, {});

  const doneCount = Object.values(byDate).filter((w) => w.status === 'completed').length;

  return (
    <section aria-label="Неделя">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="font-display text-sm font-semibold uppercase tracking-[0.14em] text-text-muted">
          Неделя
        </h2>
        <p className="text-sm text-text-muted">
          <span className="font-display font-bold text-text">{doneCount}</span>
          {' '}из {Object.keys(byDate).length || 0} закрыто
        </p>
      </div>

      <ol className="grid grid-cols-7 gap-1.5">
        {days.map((day, i) => {
          const key = toApiDate(day);
          const w = byDate[key];
          const isToday = isSameDay(day, new Date());
          const status = w?.status ?? 'rest';

          return (
            <li key={key}>
              <Link
                to="/calendar"
                aria-label={`${weekdayShort[i]}, ${day.getDate()}: ${w ? w.title : 'отдых'}`}
                className={clsx(
                  'flex min-h-[64px] flex-col items-center justify-center gap-1 rounded-xl transition-colors',
                  isToday && 'ring-2 ring-accent ring-offset-2 ring-offset-bg',
                  status === 'rest' ? 'bg-surface/60 hover:bg-surface' : 'bg-surface hover:bg-surface-2'
                )}
              >
                <span className="text-[11px] font-medium uppercase text-text-muted">
                  {weekdayShort[i]}
                </span>
                <span
                  className={clsx(
                    'flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold',
                    status === 'rest' ? 'text-text-muted' : MARK[status]
                  )}
                >
                  {day.getDate()}
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </section>
  );
};