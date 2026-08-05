import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react';
import { clsx } from 'clsx';

import { useCalendarWorkouts, useWorkoutDetails, useWorkoutMutations, useRecords, useStartWorkout } from './calendar.hooks.js';
import { CalendarGrid } from './widgets/CalendarGrid.jsx';
import { DayPanel } from './widgets/DayPanel.jsx';
import { BestResultCard } from './widgets/BestResultCard.jsx';
import { ExerciseSets } from './widgets/SetEditor.jsx';
import { ExercisePicker } from '../../features/exercise-picker/ExercisePicker.jsx';
import { Sheet } from '../../shared/ui/Sheet.jsx';
import { Skeleton } from '../../shared/ui/Skeleton.jsx';
import { completionPhrases, pickRandom } from '../../shared/lib/sisyphusPhrases.js';
import { toast } from '../../shared/ui/toast/toast.store.js';
import { SavedHint } from '../../shared/ui/SavedHint.jsx';
import {
  monthTitle, isSameDay, isSameMonth, addMonths, addWeeks, weekRangeLabel, toApiDate, format,
} from '../../shared/lib/date.js';


const useResponsiveView = () => {
  const [view, setView] = useState(() =>
    window.matchMedia('(min-width: 1024px)').matches ? 'month' : 'week'
  );
  return [view, setView];
};

export const CalendarPage = () => {
  const [anchorDate, setAnchorDate] = useState(new Date());
  const [view] = useResponsiveView();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [openWorkoutId, setOpenWorkoutId] = useState(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  const workoutsQuery = useCalendarWorkouts(anchorDate, view);
  const detailsQuery = useWorkoutDetails(openWorkoutId);
  const { statusMutation, syncMutation, setMutation, deleteSetMutation, createMutation, updateMutation, deleteWorkoutMutation } = useWorkoutMutations();
  const recordsQuery = useRecords();

  const navigate = useNavigate();

  const shiftAnchor = (dir) => {
    setAnchorDate((d) => (view === 'month' ? addMonths(d, dir) : addWeeks(d, dir)));
  };

  const dayWorkouts = useMemo(
    () => (workoutsQuery.data || []).filter((w) => isSameDay(new Date(w.date), selectedDate)),
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
    setMutation.mutate({ workoutId: openWorkoutId, exerciseId, weight: null, reps: null, isCompleted: false });
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold capitalize text-text">
          {view === 'month' ? monthTitle(anchorDate) : weekRangeLabel(anchorDate)}
        </h1>
        <div className="flex gap-1">
          <button onClick={() => shiftAnchor(-1)} className="rounded-lg p-2 text-text-muted hover:bg-surface-2 hover:text-text" aria-label="Назад">
            <ChevronLeft size={20} />
          </button>
          <button onClick={() => { setAnchorDate(new Date()); setSelectedDate(new Date()); }} className="rounded-lg px-3 py-2 text-sm text-text-muted hover:bg-surface-2 hover:text-text">
            Сегодня
          </button>
          <button onClick={() => shiftAnchor(1)} className="rounded-lg p-2 text-text-muted hover:bg-surface-2 hover:text-text" aria-label="Вперёд">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr,1fr]">
        <div className="rounded-2xl border border-border bg-surface p-3 sm:p-4">
          {workoutsQuery.isLoading ? (
            <Skeleton className="h-72 w-full" />
          ) : (
            <CalendarGrid
              anchorDate={anchorDate}
              view={view}
              workouts={workoutsQuery.data}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
            />
          )}
        </div>

        <div className="space-y-6">
          <DayPanel
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
              workout={detailsQuery.data}
              onSave={(data) => updateMutation.mutate({ id: openWorkoutId, ...data })} />
            {groupedSets.length === 0 ? (
              <p className="py-6 text-center text-sm text-text-muted">
                В этой тренировке пока нет упражнений. Добавь первое.
              </p>
            ) : (
              groupedSets.map((group) => (
                <ExerciseSets
                key={group.exerciseId}
                {...group}
                workoutId={openWorkoutId}
                onSaveSet={(data) => setMutation.mutate(data)}
                onDeleteSet={(data) => deleteSetMutation.mutate(data)}
                onAddSet={handleAddSet} />
              ))
            )}

            <button
              onClick={() => setPickerOpen(true)}
              className="flex w-full items-center justify-center gap-1 rounded-xl border border-dashed border-border py-3 text-sm text-text-muted hover:border-accent hover:text-accent">
                <Plus size={16} /> Добавить упражнение
              </button>

              <WorkoutNotes
                workout={detailsQuery.data}
                onSave={(data) => updateMutation.mutate({ id: openWorkoutId, ...data })} />

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

  useEffect(() => {
    setTitle(workout?.title ?? '');
    setDate(workout?.date ?? '');
  }, [workout?.id]);

  if (!workout) return null;

  const commit = () => {
    const patch = {};
    if (title.trim() && title !== workout.title) patch.title = title.trim();
    if (date && date !== workout.date) patch.date = date;
    if (Object.keys(patch).length) {
      onSave(patch);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    };
  };

  return (
    <div className="border-b border-border pb-4">
      <div className="mb-1.5 flex h-4 items-center justify-end">
        <SavedHint show={saved} />
      </div>
    <div className="flex flex-col gap-2 sm:flex-row">
      <input 
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onBlur={commit}
        placeholder="Название тренировки"
        className="flex-1 rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm text-text focus:outline-none focus:ring-1 focus:ring-accent" />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          onBlur={commit}
          className="rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm text-text focus:outline-none focus:ring-accent" />
    </div>
    </div>
  );
}

const WorkoutNotes = ({ workout, onSave }) => {
  const [value, setValue] = useState(workout?.notes ?? '');
  const [saved, setSaved] = useState(false);

  useEffect(() => { setValue(workout?.notes ?? ''); }, [workout?.id]);

  if (!workout) return null;

  const commit = () => {
    const next = value.trim();
    if (next === (workout.notes ?? '')) return;
    onSave({ notes: next || null });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
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
        className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent" />
    </div>
  );
}