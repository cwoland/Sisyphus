import { useState, useMemo, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Flag, Pause, Play, ChevronLeft, ChevronRight, Check, ArrowRight } from 'lucide-react';
import { clsx } from 'clsx';

import { useWorkoutDetails, useWorkoutMutations } from '../Calendar/calendar.hooks.js';
import { ProgressRings } from '../../features/active-workout/ProgressRings.jsx';
import { SetTicks } from '../../features/active-workout/SetTicks.jsx';
import { NumberStepper } from '../../features/active-workout/NumberStepper.jsx';
import { useElapsed } from '../../features/active-workout/useElapsed.js';
import { useRestTimer } from '../../features/active-workout/useRestTimer.js';
import { WorkoutFinale } from '../../features/active-workout/WorkoutFinale.jsx';
import { isQueuedError } from '../../shared/offline/isQueued.js';
import { Skeleton } from '../../shared/ui/Skeleton.jsx';
import { Button } from '../../shared/ui/Button.jsx';
import { IconButton } from '../../shared/ui/IconButton.jsx';
import { Sheet } from '../../shared/ui/Sheet.jsx';
import { BottomNav } from '../../widgets/layout/BottomNav.jsx';
import { epley1RM } from '../../shared/lib/oneRepMax.js';
import { completionPhrases, pickRandom } from '../../shared/lib/sisyphusPhrases.js';

const mmss = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

const numStr = (v) => (v == null || v === '' ? '' : String(Number(v)));

const RING_SIZE = 240;

const SEAL_MS = 700;
const MIN_FINALE_MS = 1200;

export const ActiveWorkoutPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const detailsQuery = useWorkoutDetails(id);
  const { setMutation, statusMutation } = useWorkoutMutations();
  const rest = useRestTimer();

  const workout = detailsQuery.data;
  const elapsed = useElapsed(workout?.started_at);

  const groups = useMemo(() => {
    const out = [];
    for (const s of workout?.sets || []) {
      const last = out[out.length - 1];
      if (last && last.exerciseId === s.exercise_id) {
        last.sets.push(s);
      } else {
        out.push({
          key: `${s.exercise_id}:${out.length}`,
          exerciseId: s.exercise_id,
          name: s.exercise_name,
          sets: [s],
        });
      }
    }
    return out;
  }, [workout]);

  const [index, setIndex] = useState(0);
  const [setsOpen, setSetsOpen] = useState(false);
  const [sealing, setSealing] = useState(false);
  const [finalePhrase, setFinalePhrase] = useState(null);
  const sealTimer = useRef(null);
  const finaleTimer = useRef(null);

  useEffect(() => () => {
    clearTimeout(sealTimer.current);
    clearTimeout(finaleTimer.current);
  }, []);

  const safeIndex = groups.length ? Math.min(index, groups.length - 1) : 0;
  const current = groups[safeIndex];
  const prev = groups[safeIndex - 1];
  const next = groups[safeIndex + 1];

  const done = current ? current.sets.filter((s) => s.is_completed).length : 0;
  const total = current ? current.sets.length : 0;
  const pending = current?.sets.find((s) => !s.is_completed) ?? null;

  const [draft, setDraft] = useState({ weight: '', reps: '', forId: null });

  const lastDone = current ? [...current.sets].reverse().find((s) => s.is_completed) : null;

  if (pending && draft.forId !== pending.id) {
    setDraft({
      weight: numStr(pending.weight ?? lastDone?.weight),
      reps: numStr(pending.reps ?? lastDone?.reps),
      forId: pending.id,
    });
  }

  const commitSet = () => {
    if (!pending) return;
    const isClosing = done + 1 >= total;

    setMutation.mutate({
      workoutId: id,
      setId: pending.id,
      weight: draft.weight === '' ? null : Number(draft.weight),
      reps: draft.reps === '' ? null : Number(draft.reps),
      isCompleted: true,
    });

    if (!isClosing) return rest.start();

    if (navigator.vibrate) navigator.vibrate([60, 50, 60]);
    setSealing(true);
    clearTimeout(sealTimer.current);
    sealTimer.current = setTimeout(() => { setSealing(false); rest.start(); }, SEAL_MS);
  };

  const stopSeal = () => {
    clearTimeout(sealTimer.current);
    setSealing(false);
  };

  const goNext = () => {
    stopSeal();
    rest.stop();
    setSetsOpen(false);
    setIndex(Math.min(groups.length - 1, safeIndex + 1));
  };
  const goPrev = () => {
    stopSeal();
    rest.stop();
    setSetsOpen(false);
    setIndex(Math.max(0, safeIndex - 1));
  };

  const finish = () => {
    if (finalePhrase) return;

    const phrase = pickRandom(completionPhrases);
    const startedAt = Date.now();
    setFinalePhrase(phrase);

    statusMutation.mutate({ id, status: 'completed' }, {
      onSuccess: () => {
        const wait = Math.max(0, MIN_FINALE_MS - (Date.now() - startedAt));
        finaleTimer.current = setTimeout(() => navigate('/'), wait);
      },
      onError: (error) => {
        if (isQueuedError(error)) {
          const wait = Math.max(0, MIN_FINALE_MS - (Date.now() - startedAt));
          finaleTimer.current = setTimeout(() => navigate('/'), wait);
          return;
        }
        setFinalePhrase(null);
      },
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
    <div className="relative isolate flex h-[100dvh] flex-col overflow-hidden bg-bg">
      <img
        src="/art/scenes/active-workout.webp"
        alt="" aria-hidden="true" draggable="false"
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[70%] w-full select-none object-cover object-top opacity-40"
      />

      <header className="relative z-20 shrink-0 border-b border-border bg-surface/90 backdrop-blur pad-safe-top">
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

      <main className="relative flex-1 overflow-y-auto overscroll-contain">
        <div className="mx-auto flex min-h-full w-full max-w-2xl flex-col items-center justify-center gap-6 px-4 py-6 pb-[calc(6.5rem+env(safe-area-inset-bottom))] lg:pb-10">
          {!current ? (
            <p className="text-center text-sm text-text-muted">
              В этой тренировке нет упражнений. Добавьте их в календаре перед стартом.
            </p>
          ) : (
            <>
              <nav className="grid w-full grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3">
                <button
                  onClick={goPrev}
                  disabled={!prev}
                  className="flex min-h-[44px] w-full min-w-0 items-center gap-2 rounded-xl p-2 text-left text-sm text-text-muted transition-colors hover:text-text disabled:invisible"
                >
                  <ChevronLeft size={20} className="shrink-0" />
                  <span className="truncate">{prev?.name}</span>
                </button>

                <span className="font-display text-xs uppercase tracking-[0.16em] text-text-muted">
                  {safeIndex + 1} / {groups.length}
                </span>

                <button
                  onClick={goNext}
                  disabled={!next}
                  className="flex min-h-[44px] w-full min-w-0 items-center justify-end gap-2 rounded-xl p-2 text-right text-sm text-text-muted transition-colors hover:text-text disabled:invisible"
                >
                  <span className="truncate">{next?.name}</span>
                  <ChevronRight size={20} className="shrink-0" />
                </button>
              </nav>

              <div className="flex items-center justify-center gap-3">
                <ProgressRings
                  size={RING_SIZE}
                  sealing={sealing}
                  done={done} total={total}
                  restLeft={rest.left} restTotal={rest.duration} isResting={rest.isResting}
                >
                  {rest.isResting ? (
                    <>
                      <span className="font-display text-xs uppercase tracking-[0.16em] text-terracotta-ink">Отдых</span>
                      <span className="font-display text-5xl font-extrabold tabular-nums text-text">{mmss(rest.left)}</span>
                    </>
                  ) : exerciseDone ? (
                    <div key="sealed" className="flex animate-fade-in flex-col items-center gap-2">
                      <Check size={30} className="text-gold-ink" />
                      <span className="max-w-[9rem] font-display text-sm font-semibold leading-tight text-text">
                        Упражнение закрыто
                      </span>
                    </div>
                  ) : (
                    <>
                      <span className="max-w-[9rem] font-display text-sm font-semibold leading-tight text-text">
                        {current.name}
                      </span>
                      <span className="mt-1 font-display text-5xl font-extrabold tabular-nums text-text">
                        {done}<span className="text-2xl text-text-muted">/{total}</span>
                      </span>
                      <span className="text-xs text-text-muted">подходов</span>
                    </>
                  )}
                </ProgressRings>

                <SetTicks
                  sets={current.sets}
                  currentId={pending?.id}
                  onOpen={() => setSetsOpen(true)}
                  maxHeight={RING_SIZE}
                />
              </div>

              {exerciseDone ? (
                <div className="flex flex-col items-center gap-3">
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
                  <div className="flex items-start justify-center gap-4">
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

              <Sheet isOpen={setsOpen} onClose={() => setSetsOpen(false)} title={current.name}>
                <ol className="flex flex-col gap-1.5">
                  {current.sets.map((s, i) => (
                    <li
                      key={s.id}
                      className={clsx(
                        'flex items-center justify-between rounded-xl border px-3 py-2.5 text-sm',
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
                          ? `${numStr(s.weight) || '—'} кг × ${s.reps ?? '—'}`
                          : s.id === pending?.id
                            ? `${draft.weight || '—'} кг × ${draft.reps || '—'}`
                            : '—'}
                      </span>
                    </li>
                  ))}
                </ol>
              </Sheet>
            </>
          )}
        </div>
      </main>

      <BottomNav onOpenMenu={() => navigate('/')} />
      {finalePhrase && (
        <WorkoutFinale
          phrase={finalePhrase}
          isSaving={statusMutation.isPending}
          onSkip={() => navigate('/')}
        />
      )}
    </div>
  );
};
