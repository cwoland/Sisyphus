import { useState, useMemo, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import {
  Flag,
  Pause,
  Play,
  ChevronLeft,
  ChevronRight,
  Check,
  ArrowRight,
  TrendingDown,
  X,
} from 'lucide-react';
import { clsx } from 'clsx';

import {
  useWorkoutDetails,
  useWorkoutMutations,
} from '../Calendar/calendar.hooks.js';
import { buildSessionGroups } from '../../features/active-workout/workoutFlow.js';
import { ProgressRings } from '../../features/active-workout/ProgressRings.jsx';
import { SetRoleBadge } from '../../features/active-workout/SetRoleBadge.jsx';
import { SetTicks } from '../../features/active-workout/SetTicks.jsx';
import { NumberStepper } from '../../features/active-workout/NumberStepper.jsx';
import { DurationStepper } from '../../features/active-workout/DurationStepper.jsx';
import { RpePicker } from '../../features/active-workout/RpePicker.jsx';
import { useElapsed } from '../../features/active-workout/useElapsed.js';
import { useRestTimer } from '../../features/active-workout/useRestTimer.js';
import { WorkoutFinale } from '../../features/active-workout/WorkoutFinale.jsx';
import { RecordBanner } from '../../features/active-workout/RecordBanner.jsx';
import { WorkoutBackdrop } from '../../features/active-workout/WorkoutBackdrop.jsx';
import { ExerciseActions } from '../../features/active-workout/ExerciseActions.jsx';
import { changeExercise } from '../../features/active-workout/changeExercise.js';
import { isQueuedError } from '../../shared/offline/isQueued.js';
import { Skeleton } from '../../shared/ui/Skeleton.jsx';
import { Button } from '../../shared/ui/Button.jsx';
import { IconButton } from '../../shared/ui/IconButton.jsx';
import { Sheet } from '../../shared/ui/Sheet.jsx';
import { BottomNav } from '../../widgets/layout/BottomNav.jsx';
import { epley1RM } from '../../shared/lib/oneRepMax.js';
import {
  completionPhrases,
  pickRandom,
} from '../../shared/lib/sisyphusPhrases.js';
import { plural } from '../../shared/lib/plural.js';
import {
  formatDuration,
  describeSet,
} from '../../entities/exercise/tracking.js';

const mmss = (s) =>
  `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

const numStr = (v) =>
  v == null || v === '' ? '' : String(Number(v));

const RING_SIZE = 240;
const MIN_FINALE_MS = 1200;
const RECORD_MS = 4800;

export const ActiveWorkoutPage = () => {
  const { id } = useParams();
  return <WorkoutSession key={id} id={id} />;
};

const WorkoutSession = ({ id }) => {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const detailsQuery = useWorkoutDetails(id);

  const {
    setMutation,
    statusMutation,
  } = useWorkoutMutations();

  const rest = useRestTimer(id);
  const workout = detailsQuery.data;
  const elapsed = useElapsed(workout?.started_at);

  const groups = useMemo(
    () => buildSessionGroups(workout?.sets),
    [workout?.sets]
  );

  const [index, setIndex] = useState(0);
  const [commitBusy, setCommitBusy] = useState(false);
  const [setsOpen, setSetsOpen] = useState(false);
  const [sealing, setSealing] = useState(false);
  const [finalePhrase, setFinalePhrase] = useState(null);
  const [finaleSummary, setFinaleSummary] = useState(null);
  const [finaleSaveState, setFinaleSaveState] = useState('saving');
  const [record, setRecord] = useState(null);
  const [dropFor, setDropFor] = useState(null);
  const [showWeight, setShowWeight] = useState(false);
  const [restOverrides, setRestOverrides] = useState({});

  const commitLock = useRef(false);
  const commitUnlock = useRef(null);
  const releaseCommit = () => {
    commitUnlock.current = setTimeout(() => {
      commitLock.current = false;
      setCommitBusy(false);
    }, 350);
  };
  const sealTimer = useRef(null);
  const finaleTimer = useRef(null);
  const recordTimer = useRef(null);

  useEffect(() => () => {
    clearTimeout(commitUnlock.current);
    clearTimeout(sealTimer.current);
    clearTimeout(finaleTimer.current);
    clearTimeout(recordTimer.current);
  }, []);

  const safeIndex = groups.length
    ? Math.min(index, groups.length - 1)
    : 0;

  const current = groups[safeIndex];
  const prev = groups[safeIndex - 1];
  const next = groups[safeIndex + 1];

  const done = current?.isDropSet
    ? current.steps.filter((s) => s.is_completed).length
    : current?.doneRounds ?? 0;

  const total = current?.isDropSet
    ? current.steps.length
    : current?.rounds ?? 0;

  const groupRest =
    restOverrides[current?.key] ??
    current?.plannedRest ?? rest.duration;

  const pending =
    current?.steps.find((s) => !s.is_completed) ?? null;

  const activeSet = dropFor
    ? current?.steps.find((s) => s.id === dropFor)
    : pending;

  const currentExercise = activeSet
    ? { id: activeSet.exercise_id, name: activeSet.exercise_name, tracking: activeSet.tracking }
    : current?.exercises.at(-1);

  const mode = currentExercise?.tracking || 'weight_reps';
  const lastCompleted = current?.steps.findLast(
    (set) => set.is_completed && set.exercise_id === currentExercise?.id
  );

  const previousSet = current
    ? [...current.steps].reverse().find(
        (s) => s.is_completed
      )
    : null;

  const roundSets = pending
    ? current.steps.filter(
        (s) =>
          (s.round_index ?? 0) ===
          (pending.round_index ?? 0)
      )
    : [];

  const isRoundEnd = pending
    ? roundSets[roundSets.length - 1]?.id === pending.id
    : false;

  const [draft, setDraft] = useState({
    weight: '',
    reps: '',
    duration: 60,
    rpe: null,
    forId: null,
  });

  const draftKey = dropFor
    ? `drop:${dropFor}`
    : pending ? `${pending.id}:${pending.exercise_id}` : null;

  if (draftKey && draft.forId !== draftKey) {
    const source = dropFor
      ? [...(current?.steps || [])].reverse().find(
          (s) =>
            s.id === dropFor ||
            s.parent_set_id === dropFor
        )
      : pending;

    setDraft({
      weight: numStr(
        source?.weight ?? lastCompleted?.weight
      ),
      reps: numStr(
        source?.reps ?? lastCompleted?.reps
      ),
      duration: Number(
        source?.duration_sec ??
        lastCompleted?.duration_sec ??
        60
      ),
      rpe: dropFor
        ? null
        : pending?.rpe != null
          ? Number(pending.rpe)
          : null,
      forId: draftKey,
    });
  }

  const payloadFor = (base) => {
    if (mode === 'duration') {
      return {
        ...base,
        weight: null,
        reps: null,
        durationSec: Number(draft.duration) || 0,
      };
    }

    if (mode === 'reps') {
      return {
        ...base,
        weight:
          draft.weight === ''
            ? null
            : Number(draft.weight),
        reps:
          draft.reps === ''
            ? null
            : Number(draft.reps),
        durationSec: null,
      };
    }

    return {
      ...base,
      weight:
        draft.weight === ''
          ? null
          : Number(draft.weight),
      reps:
        draft.reps === ''
          ? null
          : Number(draft.reps),
      durationSec: null,
    };
  };

  const onRecord = (exerciseName) => (data) => {
    if (!data?.record) return;

    clearTimeout(recordTimer.current);
    setRecord({ ...data.record, exerciseName });

    if (navigator.vibrate) {
      navigator.vibrate([40, 60, 40, 60, 140]);
    }

    recordTimer.current = setTimeout(
      () => setRecord(null),
      RECORD_MS
    );
  };

  const completeRound = () => {
    const pause =
      pending?.rest_after_sec ??
      (isRoundEnd ? groupRest : 0);

    if (pause > 0 && groupRest > 0) {
      if (navigator.vibrate) {
        navigator.vibrate([60, 50, 60]);
      }

      rest.start(groupRest);
    } else {
      rest.stop();
    }
  };

  const openDrop = (set) => {
    if (!set || (setMutation.isPending || commitBusy)) return;

    clearTimeout(sealTimer.current);
    setSealing(false);
    rest.stop();

    setDropFor(set.parent_set_id || set.id);
    setDraft((d) => ({ ...d, forId: null }));
  };

  const commitDrop = () => {
    if (!dropFor || (setMutation.isPending || commitBusy) || commitLock.current) return;
    commitLock.current = true;
    setCommitBusy(true);

    const parent = current.sets.find(
      (s) => s.id === dropFor
    );

    setMutation.mutate(
      payloadFor({
        workoutId: id,
        parentSetId: dropFor,
        exerciseId: parent.exercise_id,
        exerciseName: parent.exercise_name,
        isCompleted: true,
      }),
      {
        onSettled: releaseCommit,
        onSuccess: (data) => {
          onRecord(parent.exercise_name)(data);
          setDraft((d) => ({ ...d, forId: null }));
        },
        onError: (error) => {
          if (isQueuedError(error)) {
            setDraft((d) => ({ ...d, forId: null }));
          }
        },
      }
    );
  };

  const finishDrops = () => {
    if ((setMutation.isPending || commitBusy)) return;

    const parent = current?.sets.find(
      (s) => s.id === dropFor
    );

    setDropFor(null);

    const round = current?.steps.filter(
      (s) =>
        (s.round_index ?? 0) ===
        (parent?.round_index ?? 0)
    ) || [];

    // После дропа упражнения A в суперсете идёт B.
    if (
      round.length &&
      round.every((s) => s.is_completed) &&
      groupRest > 0
    ) {
      rest.start(groupRest);
    }
  };

  const commitSet = () => {
    if (!pending || (setMutation.isPending || commitBusy) || commitLock.current) return;
    commitLock.current = true;
    setCommitBusy(true);

    const exerciseName =
      currentExercise?.name || current.name;

    setMutation.mutate(
      payloadFor({
        workoutId: id,
        setId: pending.id,
        exerciseId: pending.exercise_id,
        rpe: draft.rpe,
        isCompleted: true,
      }),
      {
        onSettled: releaseCommit,
        onSuccess: (data) => {
          onRecord(exerciseName)(data);
          completeRound();
        },
        onError: (error) => {
          if (isQueuedError(error)) {
            completeRound();
          }
        },
      }
    );
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

    setIndex(
      Math.min(
        groups.length - 1,
        Math.max(0, safeIndex + delta)
      )
    );
  };

  const goNext = () => move(1);
  const goPrev = () => move(-1);

  const applyExerciseAction = async (replacement) => {
    if (!pending || dropFor || commitLock.current || setMutation.isPending ||
        statusMutation.isPending || finalePhrase) return false;

    commitLock.current = true;
    setCommitBusy(true);
    try {
      const updated = await changeExercise(qc, workout, pending, replacement);
      const after = buildSessionGroups(updated.sets);
      const sameIndex = after.findIndex((group) => group.key === current.key);
      const sameGroup = after[sameIndex];
      const hasPending = (group) => group.steps.some((set) => !set.is_completed);
      if (sameGroup && hasPending(sameGroup)) {
        setIndex(sameIndex);
      } else {
        const start = Math.max(0, Math.min(safeIndex, after.length - 1));
        let destination = after.findIndex((group, i) => i >= start && hasPending(group));
        if (destination < 0) destination = after.findIndex(hasPending);
        setIndex(destination >= 0 ? destination : start);
      }

      const round = sameGroup?.steps.filter(
        (set) => (set.round_index ?? 0) === (pending.round_index ?? 0)
      );
      if (!rest.isResting && round?.length && round.every((set) => set.is_completed) && groupRest > 0) {
        rest.start(groupRest);
      }

      stopSeal();
      setSetsOpen(false);
      setShowWeight(false);
      return true;
    } finally {
      commitLock.current = false;
      setCommitBusy(false);
    }
  };

  const dismissRecord = () => {
    clearTimeout(recordTimer.current);
    setRecord(null);
  };

  const finish = () => {
  if (
    finalePhrase ||
    setMutation.isPending ||
    commitBusy ||
    dropFor
  ) {
    return;
  }

  const phrase = pickRandom(completionPhrases);

  const completedSets = (workout?.sets || []).filter(
    (set) => set.is_completed
  );

  const exerciseIds = new Set(
    completedSets
      .map((set) => set.exercise_id)
      .filter(Boolean)
  );

  const tonnage = completedSets.reduce((sum, set) => {
    const weight = Number(set.weight);
    const reps = Number(set.reps);

    if (
      set.weight == null ||
      set.reps == null ||
      !Number.isFinite(weight) ||
      !Number.isFinite(reps) ||
      weight < 0 ||
      reps < 0
    ) {
      return sum;
    }

    return sum + weight * reps;
  }, 0);

  setFinaleSummary({
    title: workout?.title || 'Тренировка',
    duration: elapsed,
    exercises: exerciseIds.size,
    sets: completedSets.length,
    tonnage,
  });

  setFinaleSaveState('saving');
  setFinalePhrase(phrase);

  statusMutation.mutate(
    {
      id,
      status: 'completed',
    },
    {
      onSuccess: () => {
        rest.stop();
        setFinaleSaveState('saved');
      },

      onError: (error) => {
        if (isQueuedError(error)) {
          rest.stop();
          setFinaleSaveState('queued');
          return;
        }

        setFinalePhrase(null);
        setFinaleSummary(null);
        setFinaleSaveState('saving');
      },
    }
  );
};

  if (detailsQuery.isLoading && !workout) {
    return (
      <div className="mx-auto max-w-2xl space-y-4 p-4">
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-72 w-full" />
      </div>
    );
  }

  if (!workout) {
    return <main className="mx-auto max-w-2xl space-y-4 p-5 pad-safe-top">
      <h1 className="text-xl font-semibold text-text">Тренировка недоступна</h1>
      <p className="text-sm text-text-muted">Для офлайн-работы сначала открой эту тренировку с интернетом.</p>
      <Button onClick={() => detailsQuery.refetch()}>Повторить загрузку</Button>
      <Button variant="secondary" onClick={() => navigate('/calendar')}>В календарь</Button>
    </main>;
  }

  const exerciseDone = total > 0 && done >= total;
  const oneRm = mode === 'weight_reps'
    ? epley1RM(draft.weight, draft.reps)
    : 0;

  return (
    <div className="relative isolate flex h-[100dvh] flex-col overflow-hidden bg-bg">
      <WorkoutBackdrop />

      <header className="relative z-20 shrink-0 border-b border-border bg-surface/90 backdrop-blur pad-safe-top">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3">
          <div className="min-w-0 flex-1">
            <h1 className="truncate font-display text-lg font-bold text-text">
              {workout?.title}
            </h1>
            <p aria-label="Время тренировки" className="font-display text-sm tabular-nums text-text-muted">
              {elapsed}
            </p>
          </div>

          <Button
            size="sm"
            onClick={finish}
            disabled={(setMutation.isPending || commitBusy) || !!dropFor}
            isLoading={statusMutation.isPending}
          >
            <Flag size={16} /> Завершить
          </Button>
        </div>
      </header>

      <main className="relative flex-1 overflow-y-auto overscroll-contain">
        <div className="mx-auto flex min-h-full w-full max-w-2xl flex-col items-center justify-center gap-6 px-4 py-6 pb-[calc(6.5rem+env(safe-area-inset-bottom))] lg:pb-10">
          {!current ? (
            <p className="text-center text-sm text-text-muted">
              {workout.sets?.some((set) => set.is_skipped)
                ? 'Все оставшиеся упражнения пропущены. Можно завершить тренировку.'
                : 'В этой тренировке нет упражнений. Добавьте их в календаре перед стартом.'}
            </p>
          ) : (
            <>
              <nav className="grid w-full grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3">
                <button
                  onClick={goPrev}
                  disabled={!prev}
                  className="flex min-h-[44px] w-full min-w-0 items-center gap-2 rounded-xl p-2 text-left text-sm text-text-muted transition-colors hover:text-text disabled:invisible"
                >
                  <ChevronLeft
                    size={20}
                    className="shrink-0"
                  />
                  <span className="truncate">
                    {prev?.name}
                  </span>
                </button>

                <span className="font-display text-xs uppercase tracking-[0.16em] text-text-muted">
                  {safeIndex + 1} / {groups.length}
                </span>

                <button
                  onClick={goNext}
                  disabled={!next}
                  className="flex min-h-[44px] w-full min-w-0 items-center justify-end gap-2 rounded-xl p-2 text-right text-sm text-text-muted transition-colors hover:text-text disabled:invisible"
                >
                  <span className="truncate">
                    {next?.name}
                  </span>
                  <ChevronRight
                    size={20}
                    className="shrink-0"
                  />
                </button>
              </nav>

              {pending && !dropFor && workout.status === 'in_progress' && (
                <ExerciseActions
                  key={`${pending.id}:${pending.exercise_id}`}
                  workout={workout}
                  anchor={pending}
                  busy={commitBusy || setMutation.isPending || statusMutation.isPending}
                  onApply={applyExerciseAction}
                />
              )}

              <div className="flex items-center justify-center gap-3">
                <ProgressRings
                  size={RING_SIZE}
                  sealing={sealing}
                  done={done}
                  total={total}
                  restLeft={rest.left}
                  restTotal={groupRest || rest.duration}
                  isResting={rest.isResting}
                >
                  {rest.isResting ? (
                    <>
                      <span className="font-display text-xs uppercase tracking-[0.16em] text-terracotta-ink">
                        Отдых
                      </span>
                      <span className="font-display text-5xl font-extrabold tabular-nums text-text">
                        {mmss(rest.left)}
                      </span>
                    </>
                  ) : exerciseDone && !dropFor ? (
                    <div
                      key="sealed"
                      className="flex animate-fade-in flex-col items-center gap-2"
                    >
                      <Check
                        size={30}
                        className="text-gold-ink"
                      />
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
                        {done}
                        <span className="text-2xl text-text-muted">
                          /{total}
                        </span>
                      </span>

                      <span className="text-xs text-text-muted">
                        {current.isDropSet
                          ? 'ступеней'
                          : current.isSuperset
                            ? 'раундов'
                            : 'подходов'}
                      </span>
                    </>
                  )}
                </ProgressRings>

                <SetTicks
                  sets={
                    current.isDropSet
                      ? current.steps.map((s, i) => ({
                          id: s.id,
                          label: `Ступень ${i + 1}`,
                          is_completed: s.is_completed,
                        }))
                      : current.roundList.map((r) => {
                          const inRound = current.steps.filter(
                            (s) => (s.round_index ?? 0) === r
                          );

                          return {
                            id: `r${r}`,
                            label: current.isSuperset
                              ? `Раунд ${r + 1}`
                              : `Подход ${r + 1}`,
                            is_completed: inRound.every(
                              (s) => s.is_completed
                            ),
                          };
                        })
                  }
                  currentId={
                    pending
                      ? current.isDropSet
                        ? pending.id
                        : `r${pending.round_index ?? 0}`
                      : null
                  }
                  onOpen={() => setSetsOpen(true)}
                  maxHeight={RING_SIZE}
                />
              </div>

              {current.isSuperset && (
                <p className="text-center text-sm text-text-muted">
                  Упражнения подряд без отдыха. Отдых{' '}
                  {mmss(groupRest)} после всей группы.
                </p>
              )}

              {current.isDropSet && (
                <p className="text-center text-sm text-terracotta-ink">
                  Дропсет: {total}{' '}
                  {plural(
                    total,
                    ['ступень', 'ступени', 'ступеней']
                  )}{' '}
                  подряд. Отдых после серии {mmss(groupRest)}.
                </p>
              )}

              {current.isSuperset && (
                <ol className="flex flex-wrap items-center justify-center gap-1.5">
                  {current.exercises.map((e, i) => {
                    const activeSlot = activeSet?.original_exercise_id ?? activeSet?.exercise_id;
                    const isNow = e.slot === activeSlot;

                    const passed = activeSet
                      ? current.exercises.findIndex(
                          (x) => x.slot === activeSlot
                        ) > i
                      : true;

                    return (
                      <li
                        key={e.slot}
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
                  <p className="text-sm text-text-muted">
                    Упражнение закрыто
                  </p>

                  <div className="flex flex-wrap items-center justify-center gap-2">
                    {lastCompleted && !current.isDropSet && (
                      <Button
                        variant="secondary"
                        size="lg"
                        onClick={() => openDrop(previousSet)}
                      >
                        <TrendingDown size={18} /> Дроп
                      </Button>
                    )}

                    {next ? (
                      <Button size="lg" onClick={goNext}>
                        Следующее: {next.name}
                        <ArrowRight size={18} />
                      </Button>
                    ) : (
                      <Button
                        size="lg"
                        onClick={finish}
                        disabled={(setMutation.isPending || commitBusy) || !!dropFor}
                        isLoading={statusMutation.isPending}
                      >
                        <Flag size={18} />
                        Завершить тренировку
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  {dropFor && (
                    <div className="flex items-center gap-2 rounded-xl bg-terracotta/15 px-3 py-1.5 text-sm text-terracotta-ink">
                      <TrendingDown size={16} />
                      Дропсет · без отдыха между ступенями
                      <IconButton
                        icon={X}
                        size={14}
                        onClick={finishDrops}
                        className="text-terracotta-ink"
                        aria-label="Отменить дроп"
                      />
                    </div>
                  )}

                  {!dropFor && activeSet && (
                    <SetRoleBadge set={activeSet} />
                  )}

                  {!dropFor && pending?.target_reps && (
                    <p className="text-sm text-text-muted">
                      Цель: {pending.target_reps}{' '}
                      {mode === 'duration'
                        ? 'сек'
                        : 'повторений'}
                    </p>
                  )}

                  <div className="flex items-start justify-center gap-4">
                    {mode === 'duration' ? (
                      <DurationStepper
                        value={draft.duration}
                        onChange={(v) =>
                          setDraft((d) => ({
                            ...d,
                            duration: v,
                          }))
                        }
                      />
                    ) : (
                      <>
                        {(mode === 'weight_reps' ||
                          showWeight ||
                          draft.weight !== '') && (
                          <NumberStepper
                            label="Вес"
                            suffix="кг"
                            step={2.5}
                            min={0}
                            value={draft.weight}
                            onChange={(v) =>
                              setDraft((d) => ({
                                ...d,
                                weight: v,
                              }))
                            }
                          />
                        )}

                        <NumberStepper
                          label="Повторы"
                          step={1}
                          min={0}
                          max={200}
                          value={draft.reps}
                          onChange={(v) =>
                            setDraft((d) => ({
                              ...d,
                              reps: v,
                            }))
                          }
                        />
                      </>
                    )}
                  </div>

                  {mode === 'reps' &&
                    !showWeight &&
                    draft.weight === '' && (
                      <button
                        onClick={() => setShowWeight(true)}
                        className="-mt-3 text-xs font-medium text-terracotta-ink underline-offset-4 hover:underline"
                      >
                        + добавить вес
                      </button>
                    )}

                  {oneRm > 0 && (
                    <p className="-mt-3 text-xs text-text-muted">
                      Расчётный максимум ≈{' '}
                      {Math.round(oneRm)} кг
                    </p>
                  )}

                  {!dropFor && (
                    <RpePicker
                      value={draft.rpe}
                      onChange={(v) =>
                        setDraft((d) => ({
                          ...d,
                          rpe: v,
                        }))
                      }
                    />
                  )}

                  {dropFor ? (
                    <div className="flex flex-wrap justify-center gap-2">
                      <Button
                        size="lg"
                        onClick={commitDrop}
                        isLoading={(setMutation.isPending || commitBusy)}
                      >
                        <Check size={18} />
                        Ступень выполнена
                      </Button>

                      <Button
                        size="lg"
                        variant="secondary"
                        onClick={finishDrops}
                        disabled={(setMutation.isPending || commitBusy)}
                      >
                        Закончить дропсет
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="lg"
                      onClick={commitSet}
                      disabled={!pending || (setMutation.isPending || commitBusy)}
                    >
                      <Check size={18} />
                      {current.isDropSet
                        ? `Ступень ${done + 1} из ${total} выполнена`
                        : current.isSuperset
                          ? `${currentExercise?.name}: готово`
                          : `Подход ${done + 1} из ${total} выполнен`}
                    </Button>
                  )}

                  {!dropFor &&
                    lastCompleted &&
                    !current.isDropSet && (
                      <button
                        onClick={() => openDrop(previousSet)}
                        className="-mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-text-muted transition-colors hover:text-text"
                      >
                        <TrendingDown size={14} />
                        Дроп к прошлому подходу
                      </button>
                    )}
                </>
              )}

              <div className="flex items-center gap-2">
                <IconButton
                  icon={rest.isResting ? Play : Pause}
                  onClick={() =>
                    rest.isResting
                      ? rest.stop()
                      : rest.start(groupRest || rest.duration)
                  }
                  className="bg-surface-2 text-text"
                  aria-label={
                    rest.isResting
                      ? 'Прервать отдых'
                      : 'Начать отдых'
                  }
                />

                {rest.presets.map((sec) => (
                  <button
                    key={sec}
                    onClick={() => {
                      rest.choose(sec);
                      setRestOverrides((prev) => ({
                        ...prev,
                        [current.key]: sec,
                      }));
                    }}
                    className={clsx(
                      'h-10 rounded-xl px-3 text-sm font-medium tabular-nums transition-colors',
                      groupRest === sec
                        ? 'bg-accent text-on-accent'
                        : 'bg-surface-2 text-text-muted hover:text-text'
                    )}
                  >
                    {mmss(sec)}
                  </button>
                ))}
              </div>

              <Sheet
                isOpen={setsOpen}
                onClose={() => setSetsOpen(false)}
                title={current.name}
              >
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
                          {s.is_completed && (
                            <Check
                              size={14}
                              className="shrink-0 text-accent"
                            />
                          )}

                          <span className="min-w-0 truncate">
                            {current.isSuperset
                              ? `Раунд ${(s.round_index ?? 0) + 1} · ${s.exercise_name}`
                              : `Подход ${i + 1}`}
                          </span>
                          <SetRoleBadge set={s} compact />
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
                                <TrendingDown size={12} />
                                Дроп
                              </span>

                              <span className="tabular-nums text-text">
                                {describeSet({
                                  ...d,
                                  tracking: s.tracking,
                                })}
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

      {record && (
        <RecordBanner
          record={record}
          onDismiss={dismissRecord}
        />
      )}

      {finalePhrase && finaleSummary && (
        <WorkoutFinale
          phrase={finalePhrase}
          summary={finaleSummary}
          saveState={finaleSaveState}
          onClose={() => navigate('/')}
        />
      )}
    </div>
  );
};
