import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Flag, Pause, Play, ChevronLeft, ChevronRight, Check, ArrowRight } from 'lucide-react';
import { clsx } from 'clsx';

import { useWorkoutDetails, useWorkoutMutations } from '../Calendar/calendar.hooks.js';
import { ProgressRings } from '../../features/active-workout/ProgressRings.jsx';
import { NumberStepper } from '../../features/active-workout/NumberStepper.jsx';
import { useElapsed } from '../../features/active-workout/useElapsed.js';
import { useRestTimer } from '../../features/active-workout/useRestTimer.js';
import { Skeleton } from '../../shared/ui/Skeleton.jsx';
import { Button } from '../../shared/ui/Button.jsx';
import { IconButton } from '../../shared/ui/IconButton.jsx';
import { BottomNav } from '../../widgets/layout/BottomNav.jsx';
import { epley1RM } from '../../shared/lib/oneRepMax.js';
import { completionPhrases, pickRandom } from '../../shared/lib/sisyphusPhrases.js';
import { toast } from '../../shared/ui/toast/toast.store.js';

const mmss = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

export const ActiveWorkoutPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const detailsQuery = useWorkoutDetails(id);
  const { setMutation, statusMutation } = useWorkoutMutations();
  const rest = useRestTimer();

  const workout = detailsQuery.data;
  const elapsed = useElapsed(workout?.started_at);

  const groups = useMemo(() => {
    const map = new Map();
    for (const s of workout?.sets || []) {
      if (!map.has(s.exercise_id)) {
        map.set(s.exercise_id, { id: s.exercise_id, name: s.exercise_name, sets: [] });
      }
      map.get(s.exercise_id).sets.push(s);
    }
    return [...map.values()];
  }, [workout]);

  const [index, setIndex] = useState(0);
  const current = groups[index];
  const prev = groups[index - 1];
  const next = groups[index + 1];

  const done = current ? current.sets.filter((s) => s.is_completed).length : 0;
  const total = current ? current.sets.length : 0;
  const pending = current?.sets.find((s) => !s.is_completed) ?? null;

  const [draft, setDraft] = useState({ weight: '', reps: '' });

  useEffect(() => {
    if (!pending) return;
    const lastDone = [...(current?.sets || [])].reverse().find((s) => s.is_completed);
    setDraft({
      weight: String(pending.weight ?? lastDone?.weight ?? ''),
      reps: String(pending.reps ?? lastDone?.reps ?? ''),
    });
  }, [pending?.id, current?.id]);

  const commitSet = () => {
    if (!pending) return;
    setMutation.mutate({
      workoutId: id,
      setId: pending.id,
      weight: draft.weight === '' ? null : Number(draft.weight),
      reps: draft.reps === '' ? null : Number(draft.reps),
      isCompleted: true,
    });
    rest.start();
  };

  const goNext = () => {
    rest.stop();
    setIndex((i) => Math.min(groups.length - 1, i + 1));
  };
  const goPrev = () => {
    rest.stop();
    setIndex((i) => Math.max(0, i - 1));
  };

  const finish = () => {
    statusMutation.mutate({ id, status: 'completed' }, {
      onSuccess: () => { toast.success(pickRandom(completionPhrases)); navigate('/'); },
    });
  };

  if (detailsQuery.isLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-4 p-4">
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-72 w-full" />
      </div>
    );
  }

  const exerciseDone = total > 0 && done >= total;

  return (
    <div className="relative isolate flex min-h-[100dvh] flex-col overflow-hidden bg-bg">
      <img
        src="/art/scenes/active-workout.webp"
        alt="" aria-hidden="true" draggable="false"
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[70%] w-full select-none object-cover object-top opacity-40"
      />

      <header className="sticky top-0 z-20 border-b border-border bg-surface/90 backdrop-blur pad-safe-top">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3">
          <div className="min-w-0 flex-1">
            <h1 className="truncate font-display text-lg font-bold text-text">{workout?.title}</h1>
            <p className="font-display text-sm tabular-nums text-text-muted">{elapsed}</p>
          </div>
          <Button size="sm" onClick={finish} isLoading={statusMutation.isPending}>
            <Flag size={16} /> Завершить
          </Button>
        </div>
      </header>

      <main className="relative mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center gap-7 px-4 py-8">
        {!current ? (
          <p className="text-center text-sm text-text-muted">
            В этой тренировке нет упражнений. Добавьте их в календаре перед стартом.
          </p>
        ) : (
          <>
            <nav className="flex w-full items-center justify-between gap-3">
              <button
                onClick={goPrev}
                disabled={!prev}
                className="flex min-w-0 flex-1 items-center gap-2 rounded-xl p-2 text-left text-sm text-text-muted transition-colors hover:text-text disabled:invisible"
              >
                <ChevronLeft size={20} className="shrink-0" />
                <span className="truncate">{prev?.name}</span>
              </button>

              <span className="shrink-0 font-display text-xs uppercase tracking-[0.16em] text-text-muted">
                {index + 1} / {groups.length}
              </span>

              <button
                onClick={goNext}
                disabled={!next}
                className="flex min-w-0 flex-1 items-center justify-end gap-2 rounded-xl p-2 text-right text-sm text-text-muted transition-colors hover:text-text disabled:invisible"
              >
                <span className="truncate">{next?.name}</span>
                <ChevronRight size={20} className="shrink-0" />
              </button>
            </nav>

            <ProgressRings
              done={done} total={total}
              restLeft={rest.left} restTotal={rest.duration} isResting={rest.isResting}
            >
              {rest.isResting ? (
                <>
                  <span className="font-display text-xs uppercase tracking-[0.16em] text-terracotta-ink">Отдых</span>
                  <span className="font-display text-5xl font-extrabold tabular-nums text-text">{mmss(rest.left)}</span>
                </>
              ) : (
                <>
                  <span className="max-w-[12rem] font-display text-sm font-semibold leading-tight text-text">
                    {current.name}
                  </span>
                  <span className="mt-1 font-display text-5xl font-extrabold tabular-nums text-text">
                    {done}<span className="text-2xl text-text-muted">/{total}</span>
                  </span>
                  <span className="text-xs text-text-muted">подходов</span>
                </>
              )}
            </ProgressRings>

            {exerciseDone ? (
              <div className="flex flex-col items-center gap-3">
                <p className="text-sm text-text-muted">Упражнение закрыто</p>
                {next ? (
                  <Button size="lg" onClick={goNext}>
                    Следующее: {next.name} <ArrowRight size={18} />
                  </Button>
                ) : (
                  <Button size="lg" onClick={finish} isLoading={statusMutation.isPending}>
                    <Flag size={18} /> Завершить тренировку
                  </Button>
                )}
              </div>
            ) : (
              <>
                <div className="flex items-end justify-center gap-4">
                  <NumberStepper
                    label="Вес" suffix="кг" step={2.5} min={0}
                    value={draft.weight}
                    onChange={(v) => setDraft((d) => ({ ...d, weight: v }))}
                  />
                  <NumberStepper
                    label="Повторы" step={1} min={0} max={200}
                    value={draft.reps}
                    onChange={(v) => setDraft((d) => ({ ...d, reps: v }))}
                  />
                </div>

                {epley1RM(draft.weight, draft.reps) > 0 && (
                  <p className="-mt-3 text-xs text-text-muted">
                    Расчётный максимум ≈ {Math.round(epley1RM(draft.weight, draft.reps))} кг
                  </p>
                )}

                <Button size="lg" onClick={commitSet} disabled={!pending}>
                  <Check size={18} /> Подход {done + 1} из {total} выполнен
                </Button>
              </>
            )}

            <div className="flex items-center gap-2">
              <IconButton
                icon={rest.isResting ? Play : Pause}
                onClick={() => (rest.isResting ? rest.stop() : rest.start())}
                className="bg-surface-2 text-text"
                aria-label={rest.isResting ? 'Прервать отдых' : 'Начать отдых'}
              />
              {rest.presets.map((sec) => (
                <button
                  key={sec}
                  onClick={() => rest.choose(sec)}
                  className={clsx(
                    'h-10 rounded-xl px-3 text-sm font-medium tabular-nums transition-colors',
                    rest.duration === sec
                      ? 'bg-accent text-on-accent'
                      : 'bg-surface-2 text-text-muted hover:text-text'
                  )}
                >
                  {mmss(sec)}
                </button>
              ))}
            </div>

            <ul className="flex w-full max-w-sm flex-col gap-1.5">
              {current.sets.map((s, i) => (
                <li
                  key={s.id}
                  className={clsx(
                    'flex items-center justify-between rounded-xl border px-3 py-2 text-sm',
                    s.is_completed
                      ? 'border-accent/40 bg-accent/5 text-text'
                      : s.id === pending?.id
                        ? 'border-accent bg-surface text-text'
                        : 'border-border bg-surface text-text-muted'
                  )}
                >
                  <span className="flex items-center gap-2 font-medium">
                    {s.is_completed && <Check size={14} className="text-accent" />}
                    Подход {i + 1}
                  </span>
                  <span className="tabular-nums">
                    {s.is_completed
                      ? `${s.weight ?? '—'} кг × ${s.reps ?? '—'}`
                      : s.id === pending?.id
                        ? `${draft.weight || '—'} кг × ${draft.reps || '—'}`
                        : '—'}
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
      </main>

      <BottomNav onOpenMenu={() => navigate('/')} />
    </div>
  );
};