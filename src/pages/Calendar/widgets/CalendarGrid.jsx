import { clsx } from 'clsx';
import {
  monthGridDays, weekDays, weekdayShort, isSameDay, isSameMonth, toApiDate,
} from '../../../shared/lib/date.js';


const statusDot = {
  completed: 'bg-accent',
  planned: 'bg-text-muted',
  skipped: 'bg-crimson',
};

export const CalendarGrid = ({ anchorDate, view, workouts, selectedDate, onSelectDate }) => {
  const days = view === 'month' ? monthGridDays(anchorDate) : weekDays(anchorDate);

  const byDate = (workouts || []).reduce((acc, w) => {
    (acc[w.date] = acc[w.date] || []).push(w);
    return acc;
  }, {});

  return (
    <div>
      <div className="mb-2 grid grid-cols-7 gap-1">
        {weekdayShort.map((d) => (
          <div key={d} className="py-1 text-center text-xs font-medium text-text-muted">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const key = toApiDate(day);
          const dayWorkouts = byDate[key] || [];
          const isCurrentMonth = view === 'week' || isSameMonth(day, anchorDate);
          const isToday = isSameDay(day, new Date());
          const isSelected = selectedDate && isSameDay(day, selectedDate);

          return (
            <button
              key={key}
              onClick={() => onSelectDate(day)}
              className={clsx(
                'relative flex aspect-square flex-col items-center justify-start rounded-xl p-1.5 transition-colors sm:aspect-auto sm:min-h-[64px]',
                isSelected ? 'bg-accent/10 ring-1 ring-accent' : 'hover:bg-surface-2',
                !isCurrentMonth && 'opacity-40'
              )}
            >
              <span
                className={clsx(
                  'flex h-6 w-6 items-center justify-center rounded-full text-sm',
                  isToday ? 'bg-accent font-semibold text-white' : 'text-text'
                )}
              >
                {day.getDate()}
              </span>

              {dayWorkouts.length > 0 && (
                <div className="mt-1 flex flex-wrap justify-center gap-0.5">
                  {dayWorkouts.slice(0, 3).map((w) => (
                    <span key={w.id} className={clsx('h-1.5 w-1.5 rounded-full', statusDot[w.status])} />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};