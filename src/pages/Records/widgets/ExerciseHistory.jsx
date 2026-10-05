import { useMemo } from 'react';
import { Trophy } from 'lucide-react';
import { ru } from 'date-fns/locale';
import { clsx } from 'clsx';

import { useExerciseHistory } from '../records.hooks.js';
import { Sparkline } from '../../../shared/ui/Sparkline.jsx';
import { Skeleton } from '../../../shared/ui/Skeleton.jsx';
import { epley1RM } from '../../../shared/lib/oneRepMax.js';
import { safeFormat } from '../../../shared/lib/date.js';
import { muscleGroupLabel } from '../../../entities/exercise/muscleGroups.js';
import { plural } from '../../../shared/lib/plural.js';

const num = (v) => (v == null ? null : Number(v));

export const ExerciseHistory = ({ exerciseId }) => {
  const { data, isLoading } = useExerciseHistory(exerciseId);

  const sessions = useMemo(() => {
    const map = new Map();
    for (const s of data?.sets || []) {
      if (!map.has(s.workout_id)) {
        map.set(s.workout_id, {
          id: s.workout_id,
          date: s.date,
          title: s.workout_title,
          sets: [],
          bestOneRm: 0,
          volume: 0,
        });
      }
      const session = map.get(s.workout_id);
      session.sets.push(s);
      session.bestOneRm = Math.max(session.bestOneRm, epley1RM(s.weight, s.reps));
      session.volume += Number(s.weight) * Number(s.reps);
    }
    return [...map.values()];
  }, [data]);

  const chartPoints = useMemo(
    () =>
      [...sessions]
        .reverse()
        .slice(-16)
        .map((s) => ({ date: s.date, value: Math.round(s.bestOneRm * 10) / 10 })),
    [sessions]
  );

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (!data) return null;

  const { exercise, record } = data;

  if (sessions.length === 0) {
    return (
      <div className="py-10 text-center">
        <p className="font-display text-base font-semibold text-text">{exercise.name}</p>
        <p className="mt-2 text-sm text-text-muted">
          Выполненных подходов пока нет. Отметьте подход в тренировке — он появится здесь.
        </p>
      </div>
    );
  }

  const totalSets = sessions.reduce((sum, s) => sum + s.sets.length, 0);

  return (
    <div className="space-y-5">
      <div>
        <p className="font-display text-xs uppercase tracking-[0.14em] text-text-muted">
          {muscleGroupLabel(exercise.muscle_group)}
        </p>
        <h3 className="mt-1 font-display text-xl font-extrabold tracking-tight text-text">
          {exercise.name}
        </h3>
        <p className="mt-1 text-xs text-text-muted">
          {sessions.length} {plural(sessions.length, ['тренировка', 'тренировки', 'тренировок'])}
          {' · '}
          {totalSets} {plural(totalSets, ['подход', 'подхода', 'подходов'])}
        </p>
      </div>

      {record && (
        <div className="flex items-center gap-3 rounded-2xl border border-gold bg-gold/5 p-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold text-on-gold">
            <Trophy size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-display text-[11px] font-semibold uppercase tracking-[0.14em] text-gold-ink">
              Личный рекорд
            </p>
            <p className="text-sm text-text">
              <span className="font-display font-bold tabular-nums">
                {Math.round(num(record.one_rm))} кг
              </span>
              <span className="text-text-muted">
                {' · '}
                {num(record.weight)}×{record.reps}
                {record.achieved_at && `, ${safeFormat(record.achieved_at, 'd MMMM yyyy', { locale: ru })}`}
              </span>
            </p>
          </div>
        </div>
      )}

      {chartPoints.length > 1 && (
        <div className="rounded-2xl border border-border bg-surface p-4">
          <div className="mb-2 flex items-baseline justify-between">
            <span className="font-display text-xs uppercase tracking-[0.14em] text-text-muted">
              Расчётный максимум
            </span>
            <span className="font-display text-lg font-bold tabular-nums text-text">
              {Math.round(chartPoints[chartPoints.length - 1].value)}
              <span className="text-xs font-normal text-text-muted"> кг</span>
            </span>
          </div>

          <Sparkline points={chartPoints} className="h-20 w-full" />

          <div className="mt-2 flex justify-between text-[11px] tabular-nums text-text-muted">
            <span>{safeFormat(chartPoints[0].date, 'd MMM', { locale: ru })}</span>
            <span>{safeFormat(chartPoints[chartPoints.length - 1].date, 'd MMM', { locale: ru })}</span>
          </div>
        </div>
      )}

      <ol className="space-y-2">
        {sessions.map((session) => (
          <li key={session.id} className="rounded-2xl border border-border bg-surface p-3">
            <div className="mb-2 flex items-baseline justify-between gap-2">
              <p className="min-w-0 truncate text-sm font-medium text-text">
                {safeFormat(session.date, 'd MMMM yyyy', { locale: ru })}
              </p>
              <span className="shrink-0 text-xs tabular-nums text-text-muted">
                {Math.round(session.volume)} кг объём
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {session.sets.map((s) => {
                const isBest = epley1RM(s.weight, s.reps) >= session.bestOneRm - 0.01;
                return (
                  <span
                    key={s.id}
                    className={clsx(
                      'inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs tabular-nums',
                      isBest ? 'bg-accent/10 text-text' : 'bg-surface-2 text-text-muted'
                    )}
                  >
                    {num(s.weight)}×{s.reps}
                    {s.rpe != null && (
                      <span className="text-[10px] font-medium text-gold-ink">
                        RPE {num(s.rpe)}
                      </span>
                    )}
                  </span>
                );
              })}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
};
