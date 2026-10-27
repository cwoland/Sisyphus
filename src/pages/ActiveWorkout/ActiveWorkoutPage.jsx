import { useState, useMemo, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Flag, Pause, Play, ChevronLeft, ChevronRight, Check, ArrowRight, TrendingDown, X } from 'lucide-react';
import { clsx } from 'clsx';

import { useWorkoutDetails, useWorkoutMutations } from '../Calendar/calendar.hooks.js';
import { ProgressRings } from '../../features/active-workout/ProgressRings.jsx';
import { SetTicks } from '../../features/active-workout/SetTicks.jsx';
import { NumberStepper } from '../../features/active-workout/NumberStepper.jsx';
import { DurationStepper } from '../../features/active-workout/DurationStepper.jsx';
import { RpePicker } from '../../features/active-workout/RpePicker.jsx';
import { useElapsed } from '../../features/active-workout/useElapsed.js';
import { useRestTimer } from '../../features/active-workout/useRestTimer.js';
import { WorkoutFinale } from '../../features/active-workout/WorkoutFinale.jsx';
import { RecordBanner } from '../../features/active-workout/RecordBanner.jsx';
import { isQueuedError } from '../../shared/offline/isQueued.js';
import { Skeleton } from '../../shared/ui/Skeleton.jsx';
import { Button } from '../../shared/ui/Button.jsx';
import { IconButton } from '../../shared/ui/IconButton.jsx';
import { Sheet } from '../../shared/ui/Sheet.jsx';
import { BottomNav } from '../../widgets/layout/BottomNav.jsx';
import { epley1RM } from '../../shared/lib/oneRepMax.js';
import { completionPhrases, pickRandom } from '../../shared/lib/sisyphusPhrases.js';
import { trackingOf, formatDuration, describeSet } from '../../entities/exercise/tracking.js';

const mmss = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

const numStr = (v) => (v == null || v === '' ? '' : String(Number(v)));

const RING_SIZE = 240;
const SEAL_MS = 700;
const MIN_FINALE_MS = 1200;
const RECORD_MS = 4800;

export const ActiveWorkoutPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const detailsQuery = useWorkoutDetails(id);
  const { setMutation, statusMutation } = useWorkoutMutations();
  const rest = useRestTimer();

  const workout = detailsQuery.data;
  const elapsed = useElapsed(workout?.started_at);

  const groups = useMemo(() => {
    const all = workout?.sets || [];

    const dropsByParent = new Map();
    for (const s of all) {
      if (s.set_kind !== 'drop' || !s.parent_set_id) continue;
      const list = dropsByParent.get(s.parent_set_id) || [];
      list.push(s);
      dropsByParent.set(s.parent_set_id, list);
    }

    const byGroup = new Map();
    for (const s of all) {
      if (s.set_kind === 'drop') continue;
      const key = s.group_index ?? 0;

      if (!byGroup.has(key)) {
        byGroup.set(key, { key: `g${key}`, groupIndex: key, sets: [], exercises: [], rounds: new Set() });
      }

      const g = byGroup.get(key);
      g.sets.push({ ...s, drops: dropsByParent.get(s.id) || [] });
      g.rounds.add(s.round_index ?? 0);

      if (!g.exercises.some((e) => e.id === s.exercise_id)) {
        g.exercises.push({ id: s.exercise_id, name: s.exercise_name, tracking: trackingOf(s) });
      }
    }

    return [...byGroup.values()].map((g) => {
      const roundList = [...g.rounds].sort((a, b) => a - b);
      const doneRounds = roundList.filter((r) =>
        g.sets.filter((s) => (s.round_index ?? 0) === r).every((s) => s.is_completed)
      ).length;

      return {
        ...g,
        roundList,
        rounds: roundList.length,
        doneRounds,
        isSuperset: g.exercises.length > 1,
        name: g.exercises.length > 1 ? 'Суперсет' : g.exercises[0]?.name || '',
      };
    });
  }, [workout]);

  const [index, setIndex] = useState(0);
  const [setsOpen, setSetsOpen] = useState(false);
  const [sealing, setSealing] = useState(false);
  const [finalePhrase, setFinalePhrase] = useState(null);
  const [record, setRecord] = useState(null);
  const [dropFor, setDropFor] = useState(null);
  const [showWeight, setShowWeight] = useState(false);

  const sealTimer = useRef(null);
  const finaleTimer = useRef(null);
  const recordTimer = useRef(null);

  useEffect(() => () => {
    clearTimeout(sealTimer.current);
    clearTimeout(finaleTimer.current);
    clearTimeout(recordTimer.current);
  }, []);

  const safeIndex = groups.length ? Math.min(index, groups.length - 1) : 0;
  const current = groups[safeIndex];
  const prev = groups[safeIndex - 1];
  const next = groups[safeIndex + 1];

  const done = current ? current.doneRounds : 0;
  const total = current ? current.rounds : 0;
  const pending = current?.sets.find((s) => !s.is_completed) ?? null;

  const currentExercise = pending
    ? current.exercises.find((e) => e.id === pending.exercise_id)
    : current?.exercises[current.exercises.length - 1];

  const mode = currentExercise?.tracking || 'weight_reps';

  const lastCompleted = current
    ? [...current.sets].reverse().find((s) => s.is_completed && s.exercise_id === pending?.exercise_id)
      ?? [...current.sets].reverse().find((s) => s.is_completed)
    : null;

  const roundSets = pending
    ? current.sets.filter((s) => (s.round_index ?? 0) === (pending.round_index ?? 0))
    : [];
  const isRoundEnd = pending ? roundSets[roundSets.length - 1]?.id === pending.id : false;

  const [draft, setDraft] = useState({ weight: '', reps: '', duration: 60, rpe: null, forId: null });

  const draftKey = dropFor ? `drop:${dropFor}` : pending?.id ?? null;

  if (draftKey && draft.forId !== draftKey) {
    const source = dropFor ? lastCompleted : pending;
    setDraft({
      weight: numStr(source?.weight ?? lastCompleted?.weight),
      reps: numStr(source?.reps ?? lastCompleted?.reps),
      duration: Number(source?.duration_sec ?? lastCompleted?.duration_sec ?? 60),
      rpe: dropFor ? null : pending?.rpe != null ? Number(pending.rpe) : null,
      forId: draftKey,
    });
  }

  const payloadFor = (base) => {
    if (mode === 'duration') {
      return { ...base, weight: null, reps: null, durationSec: Number(draft.duration) || 0 };
    }
    if (mode === 'reps') {
      return {
        ...base,
        weight: draft.weight === '' ? null : Number(draft.weight),
        reps: draft.reps === '' ? null : Number(draft.reps),
        durationSec: null,
      };
    }
    return {
      ...base,
      weight: draft.weight === '' ? null : Number(draft.weight),
      reps: draft.reps === '' ? null : Number(draft.reps),
      durationSec: null,
    };
  };

  const onRecord = (exerciseName) => (data) => {
    if (!data?.record) return;
    clearTimeout(recordTimer.current);
    setRecord({ ...data.record, exerciseName });
    if (navigator.vibrate) navigator.vibrate([40, 60, 40, 60, 140]);
    recordTimer.current = setTimeout(() => setRecord(null), RECORD_MS);
  };

  const commitDrop = () => {
    if (!dropFor) return;
    const exerciseName = current.name;

    setMutation.mutate(
      payloadFor({ workoutId: id, parentSetId: dropFor, isCompleted: true }),
      { onSuccess: onRecord(exerciseName) }
    );

    setDropFor(null);
  };

  const commitSet = () => {
    if (!pending) return;
    const isClosing = isRoundEnd && done + 1 >= total;
    const exerciseName = currentExercise?.name || current.name;

    setMutation.mutate(
      payloadFor({ workoutId: id, setId: pending.id, rpe: draft.rpe, isCompleted: true }),
      { onSuccess: onRecord(exerciseName) }
    );

    if (!isRoundEnd) return;
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

  const move = (delta) => {
    stopSeal();
    rest.stop();
    setSetsOpen(false);
    setDropFor(null);
    setShowWeight(false);
    setIndex(Math.min(groups.length - 1, Math.max(0, safeIndex + delta)));
  };

  const goNext = () => move(1);
  const goPrev = () => move(-1);

  const dismissRecord = () => {
    clearTimeout(recordTimer.current);
    setRecord(null);
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
  const oneRm = mode === 'weight_reps' ? epley1RM(draft.weight, draft.reps) : 0;

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
                        {currentExercise?.name || current.name}
                      </span>
                      <span className="mt-1 font-display text-5xl font-extrabold tabular-nums text-text">
                        {done}<span className="text-2xl text-text-muted">/{total}</span>
                      </span>
                      <span className="text-xs text-text-muted">
                        {current.isSuperset ? 'раундов' : 'подходов'}
                      </span>
                    </>
                  )}
                </ProgressRings>

                <SetTicks
                  sets={current.roundList.map((r) => {
                    const inRound = current.sets.filter((s) => (s.round_index ?? 0) === r);
                    return {
                      id: `r${r}`,
                      label: current.isSuperset ? `Раунд ${r + 1}` : `Подход ${r + 1}`,
                      is_completed: inRound.every((s) => s.is_completed),
                    };
                  })}
                  currentId={pending ? `r${pending.round_index ?? 0}` : null}
                  onOpen={() => setSetsOpen(true)}
                  maxHeight={RING_SIZE}
                />
              </div>

              {current.isSuperset && (
                <ol className="flex flex-wrap items-center justify-center gap-1.5">
                  {current.exercises.map((e, i) => {
                    const isNow = e.id === pending?.exercise_id;
                    const passed = pending
                      ? current.exercises.findIndex((x) => x.id === pending.exercise_id) > i
                      : true;

                    return (
                      <li
                        key={e.id}
                        className={clsx(
                          'rounded-lg px-2.5 py-1 text-xs font-medium transition-colors',
                          isNow
                            ? 'bg-accent text-on-accent'
                            : passed
                              ? 'bg-accent/10 text-text'
                              : 'bg-surface-2 text-text-muted'
                        )}
                      >
                        {e.name}
                      </li>
                    );
                  })}
                </ol>
              )}

              {exerciseDone && !dropFor ? (
                <div className="flex flex-col items-center gap-3">
                  <p className="text-sm text-text-muted">Упражнение закрыто</p>
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    {lastCompleted && (
                      <Button variant="secondary" size="lg" onClick={() => setDropFor(lastCompleted.id)}>
                        <TrendingDown size={18} /> Дроп
                      </Button>
                    )}
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
                </div>
              ) : (
                <>
                  {dropFor && (
                    <div className="flex items-center gap-2 rounded-xl bg-terracotta/15 px-3 py-1.5 text-sm text-terracotta-ink">
                      <TrendingDown size={16} />
                      Дроп к подходу
                      <IconButton
                        icon={X} size={14} onClick={() => setDropFor(null)}
                        className="text-terracotta-ink"
                        aria-label="Отменить дроп"
                      />
                    </div>
                  )}

                  <div className="flex items-start justify-center gap-4">
                    {mode === 'duration' ? (
                      <DurationStepper
                        value={draft.duration}
                        onChange={(v) => setDraft((d) => ({ ...d, duration: v }))}
                      />
                    ) : (
                      <>
                        {(mode === 'weight_reps' || showWeight || draft.weight !== '') && (
                          <NumberStepper
                            label="Вес" suffix="кг" step={2.5} min={0}
                            value={draft.weight}
                            onChange={(v) => setDraft((d) => ({ ...d, weight: v }))}
                          />
                        )}
                        <NumberStepper
                          label="Повторы" step={1} min={0} max={200}
                          value={draft.reps}
                          onChange={(v) => setDraft((d) => ({ ...d, reps: v }))}
                        />
                      </>
                    )}
                  </div>

                  {mode === 'reps' && !showWeight && draft.weight === '' && (
                    <button
                      onClick={() => setShowWeight(true)}
                      className="-mt-3 text-xs font-medium text-terracotta-ink underline-offset-4 hover:underline"
                    >
                      + добавить вес
                    </button>
                  )}

                  {oneRm > 0 && (
                    <p className="-mt-3 text-xs text-text-muted">
                      Расчётный максимум ≈ {Math.round(oneRm)} кг
                    </p>
                  )}

                  {!dropFor && (
                    <RpePicker
                      value={draft.rpe}
                      onChange={(v) => setDraft((d) => ({ ...d, rpe: v }))}
                    />
                  )}

                  {dropFor ? (
                    <Button size="lg" onClick={commitDrop}>
                      <Check size={18} /> Дроп выполнен
                    </Button>
                  ) : (
                    <Button size="lg" onClick={commitSet} disabled={!pending}>
                      <Check size={18} />
                      {current.isSuperset
                        ? `${currentExercise?.name}: готово`
                        : `Подход ${done + 1} из ${total} выполнен`}
                    </Button>
                  )}

                  {!dropFor && lastCompleted && (
                    <button
                      onClick={() => setDropFor(lastCompleted.id)}
                      className="-mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-text-muted transition-colors hover:text-text"
                    >
                      <TrendingDown size={14} /> Дроп к прошлому подходу
                    </button>
                  )}
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
                    <li key={s.id}>
                      <div
                        className={clsx(
                          'flex items-center justify-between rounded-xl border px-3 py-2.5 text-sm',
                          s.is_completed
                            ? 'border-accent/40 bg-accent/5 text-text'
                            : s.id === pending?.id
                              ? 'border-accent bg-surface text-text'
                              : 'border-border bg-surface text-text-muted'
                        )}
                      >
                        <span className="flex min-w-0 items-center gap-2 font-medium">
                          {s.is_completed && <Check size={14} className="shrink-0 text-accent" />}
                          <span className="min-w-0 truncate">
                            {current.isSuperset
                              ? `Раунд ${(s.round_index ?? 0) + 1} · ${s.exercise_name}`
                              : `Подход ${i + 1}`}
                          </span>
                        </span>
                        <span className="flex shrink-0 items-center gap-2 tabular-nums">
                          {s.rpe != null && (
                            <span className="rounded-md bg-gold/15 px-1.5 py-0.5 text-[11px] font-medium text-gold-ink">
                              RPE {Number(s.rpe)}
                            </span>
                          )}
                          {s.is_completed
                            ? describeSet(s)
                            : s.id === pending?.id
                              ? mode === 'duration'
                                ? formatDuration(draft.duration)
                                : `${draft.weight || '—'} кг × ${draft.reps || '—'}`
                              : '—'}
                        </span>
                      </div>

                      {s.drops.length > 0 && (
                        <ol className="mt-1 space-y-1 pl-6">
                          {s.drops.map((d) => (
                            <li
                              key={d.id}
                              className="flex items-center justify-between rounded-lg border border-terracotta/30 bg-terracotta/5 px-3 py-1.5 text-xs"
                            >
                              <span className="flex items-center gap-1.5 font-medium text-terracotta-ink">
                                <TrendingDown size={12} /> Дроп
                              </span>
                              <span className="tabular-nums text-text">
                                {describeSet({ ...d, tracking: s.tracking })}
                              </span>
                            </li>
                          ))}
                        </ol>
                      )}
                    </li>
                  ))}
                </ol>
              </Sheet>
            </>
          )}
        </div>
      </main>

      <BottomNav onOpenMenu={() => navigate('/')} />

      {record && <RecordBanner record={record} onDismiss={dismissRecord} />}

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