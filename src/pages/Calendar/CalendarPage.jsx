import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { clsx } from 'clsx';

import { useCalendarWorkouts, useWorkoutDetails, useWorkoutMutations } from './calendar.hooks.js';
import { CalendarGrid } from './widgets/CalendarGrid.jsx';
import { DayPanel } from './widgets/DayPanel.jsx';
import { BestResultCard } from './widgets/BestResultCard.jsx';
import { ExerciseSets } from './widgets/SetEditor.jsx';
import { ExercisePicker } from '../../features/exercise-picker/ExercisePicker.jsx';
import { Sheet } from '../../shared/ui/Sheet.jsx';
import { Skeleton } from '../../shared/ui/Skeleton.jsx';
import { completionPhrases, pickRandom } from '../../shared/lib/sisyphusPhrases.js';
import { toast } from '../../shared/ui/toast/toast.store.js';
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
  const { statusMutation, syncMutation, setMutation, deleteSetMutation, createMutation } = useWorkoutMutations();

  const navigate = (dir) => {
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
      weight: null,
      reps: null,
      isCompleted: false,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold capitalize text-text">
          {view === 'month' ? monthTitle(anchorDate) : weekRangeLabel(anchorDate)}
        </h1>
        <div className="flex gap-1">
          <button onClick={() => navigate(-1)} className="rounded-lg p-2 text-text-muted hover:bg-surface-2 hover:text-text" aria-label="Назад">
            <ChevronLeft size={20} />
          </button>
          <button onClick={() => { setAnchorDate(new Date()); setSelectedDate(new Date()); }} className="rounded-lg px-3 py-2 text-sm text-text-muted hover:bg-surface-2 hover:text-text">
            Сегодня
          </button>
          <button onClick={() => navigate(1)} className="rounded-lg p-2 text-text-muted hover:bg-surface-2 hover:text-text" aria-label="Вперёд">
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
            date={selectedDate}
            workouts={dayWorkouts}
            onOpenWorkout={(w) => setOpenWorkoutId(w.id)}
            onSync={(id) => syncMutation.mutate(id)}
            onSetStatus={handleSetStatus}
            onAddWorkout={handleAddWorkout}
          />
          <BestResultCard sets={detailsQuery.data?.sets || []} />
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