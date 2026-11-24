import { QuickWorkoutSheet } from './widgets/QuickWorkoutSheet.jsx';
import { WorkoutHistorySheet } from './widgets/WorkoutHistorySheet.jsx';
import { useState, useMemo, useEffect, useRef } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react';

import { useCalendarWorkouts, useWorkoutDetails, useWorkoutMutations, useRecords, useStartWorkout } from './calendar.hooks.js';
import { CalendarGrid } from './widgets/CalendarGrid.jsx';
import { DayPanel } from './widgets/DayPanel.jsx';
import { BestResultCard } from './widgets/BestResultCard.jsx';
import { ExerciseSets } from './widgets/SetEditor.jsx';
import { SupersetLink } from './widgets/SupersetLink.jsx';
import { ExercisePicker } from '../../features/exercise-picker/ExercisePicker.jsx';
import { Sheet } from '../../shared/ui/Sheet.jsx';
import { Skeleton } from '../../shared/ui/Skeleton.jsx';
import { completionPhrases, pickRandom } from '../../shared/lib/sisyphusPhrases.js';
import { toast } from '../../shared/ui/toast/toast.store.js';
import { SavedHint } from '../../shared/ui/SavedHint.jsx';
import {
  monthTitle, addMonths, safeDate, toApiDate,
} from '../../shared/lib/date.js';


export const CalendarPage = () => {
  const location = useLocation();
  const [params, setParams] = useSearchParams();
  const quickOpen = params.get('quick') === '1';
  const closeQuick = () => setParams((previous) => {
    const next = new URLSearchParams(previous);
    next.delete('quick');
    return next;
  }, { replace: true, state: location.state });
  const [selectedDate, setSelectedDate] = useState(() => safeDate(location.state?.date) ?? new Date());
  const anchorDate = selectedDate;
  const [historyId, setHistoryId] = useState(null);
  const [openWorkoutId, setOpenWorkoutId] = useState(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  const workoutsQuery = useCalendarWorkouts(anchorDate, 'month');
  const detailsQuery = useWorkoutDetails(openWorkoutId);
  const { statusMutation, syncMutation, setMutation, deleteSetMutation, createMutation, updateMutation, deleteWorkoutMutation } = useWorkoutMutations();
  const recordsQuery = useRecords();

  const navigate = useNavigate();

  const shiftAnchor = (dir) => {
    setSelectedDate((day) => addMonths(day, dir));
  };

  const dayWorkouts = useMemo(
    () => (workoutsQuery.data || []).filter((w) => w.date === toApiDate(selectedDate)),
    [workoutsQuery.data, selectedDate]
  );

  const groupedSets = useMemo(() => {
    const sets = detailsQuery.data?.sets || [];
    const map = new Map();
    for (const s of sets) {
      if (!map.has(s.exercise_id)) {
        map.set(s.exercise_id, { exerciseId: s.exercise_id, exerciseName: s.exercise_name, sets: [] });
      }
      map.get(s.exercise_id).sets.push(s);
    }
    return [...map.values()];
  }, [detailsQuery.data]);

  const startWorkout = useStartWorkout();
  const handleStart = (w) => {
    if (w.status === 'in_progress') return navigate(`/workout/${w.id}/active`);
    startWorkout.mutate(w.id, { onSuccess: () => navigate(`/workout/${w.id}/active`) });
  };

  const handleSetStatus = (id, status) => {
    statusMutation.mutate({ id, status }, {
      onSuccess: () => { if (status === 'completed') toast.success(pickRandom(completionPhrases)); },
    });
  };

  const handleAddWorkout = () => {
    createMutation.mutate(
      { title: 'Тренировка', date: toApiDate(selectedDate) },
      { onSuccess: (w) => setOpenWorkoutId(w.id) }
    );
  };

  const handleAddSet = (exerciseId) => {
    const previous = [...(detailsQuery.data?.sets || [])]
      .reverse()
      .find(
        (set) =>
          set.exercise_id === exerciseId && 
          set.set_kind !== 'drop'
      );

      setMutation.mutate({
        workoutId: openWorkoutId,
        exerciseId,
        exerciseName: previous?.exercise_name,
        weight:
          previous?.weight === null
            ? null
            : Number(previous.weight),
        reps:
          previous?.reps === null
            ? null
            : Number(previous.reps),
        durationSec:
          previous?.duration_sec === null
            ? null
            : Number(previous.duration_sec),
        isCompleted: false,
      });
  };

  const handleAddDrop = ({ workoutId, exerciseId, exerciseName, parentSetId, weight, reps, durationSec }) => {
    setMutation.mutate({ workoutId, exerciseId, exerciseName, parentSetId, setKind: 'drop', weight, reps, durationSec, isCompleted: false });
  };

  const handlePickExercise = (exercise) => {
    setMutation.mutate({
      workoutId: openWorkoutId,
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      weight: null,
      reps: null,
      isCompleted: false,
    });
  };

  const handleDeleteWorkout = () => {
    if (!openWorkoutId) return;
    if (!window.confirm('Удалить тренировку?')) return;
    deleteWorkoutMutation.mutate(openWorkoutId, {
      onSuccess: () => setOpenWorkoutId(null),
    });
  };

  return (
    <div className="min-w-0 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="min-w-0 break-words font-display text-xl font-bold capitalize text-text sm:text-2xl">
          {monthTitle(anchorDate)}
        </h1>
        <div className="ml-auto flex shrink-0 gap-1">
          <button onClick={() => shiftAnchor(-1)} className="rounded-lg p-2 text-text-muted hover:bg-surface-2 hover:text-text" aria-label="Назад">
            <ChevronLeft size={20} />
          </button>
          <button onClick={() => setSelectedDate(new Date())} className="rounded-lg px-3 py-2 text-sm text-text-muted hover:bg-surface-2 hover:text-text">
            Сегодня
          </button>
          <button onClick={() => shiftAnchor(1)} className="rounded-lg p-2 text-text-muted hover:bg-surface-2 hover:text-text" aria-label="Вперёд">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="min-w-0 rounded-2xl border border-border bg-surface p-3 sm:p-4">
          {workoutsQuery.isLoading ? (
            <Skeleton className="h-72 w-full" />
          ) : (
            <CalendarGrid
              anchorDate={anchorDate}
              view="month"
              workouts={workoutsQuery.data}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
            />
          )}
        </div>

        <div className="min-w-0 space-y-6">
          <DayPanel
            onShowSummary={setHistoryId}
            onStart={handleStart}
            date={selectedDate}
            workouts={dayWorkouts}
            onOpenWorkout={(w) => setOpenWorkoutId(w.id)}
            onSync={(id) => syncMutation.mutate(id)}
            onSetStatus={handleSetStatus}
            onAddWorkout={handleAddWorkout}
          />
          <BestResultCard records={recordsQuery.data || []} />
        </div>
      </div>

      {quickOpen && (
        <QuickWorkoutSheet create={createMutation} onClose={closeQuick} onCreated={(workout) => {
          closeQuick();
          setSelectedDate(safeDate(workout.date));
          setOpenWorkoutId(workout.id);
        }} />
      )}
      <WorkoutHistorySheet id={historyId} onClose={() => setHistoryId(null)} />

      <Sheet
        isOpen={!!openWorkoutId}
        onClose={() => setOpenWorkoutId(null)}
        title={detailsQuery.data?.title || 'Тренировка'}
      >
        {detailsQuery.isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : (
          <div className="space-y-6">
            <WorkoutMetaEditor
              key={`meta-${detailsQuery.data?.id}`}
              workout={detailsQuery.data}
              onSave={(data, options) => updateMutation.mutate({ id: openWorkoutId, ...data }, options)} />
            {groupedSets.length === 0 ? (
              <p className="py-6 text-center text-sm text-text-muted">
                В этой тренировке пока нет упражнений. Добавь первое.
              </p>
            ) : (
              groupedSets.map((group, index) => {
  const next = groupedSets[index + 1];

  const groupIndex = group.sets.find(
    (set) => set.set_kind !== 'drop'
  )?.group_index;

  const previousGroupIndex = groupedSets[index - 1]
    ?.sets.find((set) => set.set_kind !== 'drop')
    ?.group_index;

  const nextGroupIndex = next?.sets.find(
    (set) => set.set_kind !== 'drop'
  )?.group_index;

  const linkedToPrevious =
    groupIndex != null &&
    groupIndex === previousGroupIndex;

  const linkedToNext =
    groupIndex != null &&
    groupIndex === nextGroupIndex;

  return (
    <div key={group.exerciseId} className="space-y-2">
      <div
        className={
          linkedToPrevious || linkedToNext
            ? 'rounded-r-2xl border-l-4 border-terracotta pl-3'
            : ''
        }
      >
        {!linkedToPrevious && linkedToNext && (
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-terracotta-ink">
            Суперсет
          </p>
        )}

        <ExerciseSets
          {...group}
          workoutId={openWorkoutId}
          onSaveSet={(data) => setMutation.mutate(data)}
          onDeleteSet={(data) => deleteSetMutation.mutate(data)}
          onAddSet={handleAddSet}
          onAddDrop={handleAddDrop}
        />
      </div>

      {next && (
        <SupersetLink
          workoutId={openWorkoutId}
          workoutStatus={detailsQuery.data?.status}
          first={group}
          second={next}
          exercises={groupedSets}
          disabled={
            setMutation.isPending ||
            deleteSetMutation.isPending
          }
        />
      )}
    </div>
  );
})
            )}

            <button
              onClick={() => setPickerOpen(true)}
              className="flex w-full items-center justify-center gap-1 rounded-xl border border-dashed border-border py-3 text-sm text-text-muted hover:border-accent hover:text-accent">
                <Plus size={16} /> Добавить упражнение
              </button>

              <WorkoutNotes
                key={`notes-${detailsQuery.data?.id}`}
                workout={detailsQuery.data}
                onSave={(data, options) => updateMutation.mutate({ id: openWorkoutId, ...data }, options)} />

              <button 
                onClick={handleDeleteWorkout}
                className="flex w-full items-center justify-center gap-1 rounded-xl border border-red-500/30 py-3 text-sm text-red-500 hover:bg-red-500/10">
                  <Trash2 size={16} /> Удалить тренировку
                </button>
          </div>
        )}
        </Sheet>
        
        <ExercisePicker
        isOpen={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onPick={handlePickExercise} />
    </div>
  );
};

const WorkoutMetaEditor = ({ workout, onSave }) => {
  const [title, setTitle] = useState(workout?.title ?? '');
  const [date, setDate] = useState(workout?.date ?? '');
  const [saved, setSaved] = useState(false);
  const savedTimer = useRef(null);

  useEffect(() => () => clearTimeout(savedTimer.current), []);

  if (!workout) return null;

  const commit = () => {
    const patch = {};
    if (title.trim() && title !== workout.title) patch.title = title.trim();
    if (date && date !== workout.date) patch.date = date;
    if (!Object.keys(patch).length) return;

    onSave(patch, {
      onSuccess: () => {
        setSaved(true);
        clearTimeout(savedTimer.current);
        savedTimer.current = setTimeout(() => setSaved(false), 2000);
      },
    });
  };

  return (
    <div className="border-b border-border pb-4">
      <div className="mb-1.5 flex h-4 items-center justify-end">
        <SavedHint show={saved} />
      </div>
      <div className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,12rem)]">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={commit}
          placeholder="Название тренировки"
          aria-label="Название тренировки"
          className="block w-full min-w-0 max-w-full rounded-xl border border-border-strong bg-surface-2 px-3 py-2 text-base text-text focus:outline-none focus:ring-1 focus:ring-accent"
        />

        <div className="min-w-0 overflow-hidden rounded-xl border border-border-strong bg-surface-2">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            onBlur={commit}
            aria-label="Дата тренировки"
            className="block w-full min-w-0 max-w-full appearance-none bg-transparent px-3 py-2 text-base text-text focus:outline-none focus:ring-1 focus:ring-inset focus:ring-accent"
            style={{ WebkitAppearance: 'none' }}
          />
        </div>
      </div>
    </div>
  );
}

const WorkoutNotes = ({ workout, onSave }) => {
  const [value, setValue] = useState(workout?.notes ?? '');
  const [saved, setSaved] = useState(false);
  const savedTimer = useRef(null);

  useEffect(() => () => clearTimeout(savedTimer.current), []);

  if (!workout) return null;

  const commit = () => {
    const next = value.trim();
    if (next === (workout.notes ?? '')) return;
    onSave({ notes: next || null }, {
      onSuccess: () => {
        setSaved(true);
        clearTimeout(savedTimer.current);
        savedTimer.current = setTimeout(() => setSaved(false), 2000);
      },
    });
  };

  return (
    <div className="space-y-1.5 border-t border-border pt-4">
      <div className="flex items-center justify-between">
      <label className="block text-sm font-medium text-text">Заметки</label>
      <SavedHint show={saved} />
      </div>
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={commit}
        rows={3}
        placeholder="Самочувствие, техника, что поменять"
        className="w-full rounded-xl border border-border-strong bg-surface-2 px-3 py-2 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent" />
    </div>
  );
}
