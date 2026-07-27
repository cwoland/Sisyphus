import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getWorkouts, getWorkout, createWorkout, updateWorkout, updateWorkoutStatus, syncWorkout,
  upsertWorkoutSet, deleteWorkoutSet, deleteWorkout,
  getActiveWorkout,
} from '../../entities/workout/workout.api.js';
import { getRecords } from '../../entities/records/record.api.js';
import { monthGridRange, weekRange } from '../../shared/lib/date.js';
import { toast } from '../../shared/ui/toast/toast.store.js';


export const useCalendarWorkouts = (anchorDate, view) => {
  const range = view === 'month' ? monthGridRange(anchorDate) : weekRange(anchorDate);
  return useQuery({
    queryKey: ['workouts', view, range.from, range.to],
    queryFn: () => getWorkouts(range),
  });
};

export const useActiveWorkout = () =>
  useQuery({ queryKey: ['workouts', 'active'], queryFn: getActiveWorkout });

export const useStartWorkout = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: startWorkout,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['workouts'] });
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Не удалось начать тренировку'),
  });
};

export const useWorkoutDetails = (workoutId) =>
  useQuery({
    queryKey: ['workout', workoutId],
    queryFn: () => getWorkout(workoutId),
    enabled: !!workoutId,
  });

export const useRecords = () =>
  useQuery({
    queryKey: ['records'],
    queryFn: getRecords,
  });

export const useWorkoutMutations = () => {
  const qc = useQueryClient();

  const invalidateAll = (workoutId) => {
    qc.invalidateQueries({ queryKey: ['workouts'] });
    if (workoutId) qc.invalidateQueries({ queryKey: ['workout', workoutId] });
  };

  const patchLists = (fn) => {
    const snapshot = qc.getQueriesData({ queryKey: ['workouts'] });
    qc.setQueriesData({ queryKey: ['workouts'] }, (old) =>
      Array.isArray(old) ? fn(old) : old
    );
    return snapshot;
  };

  const restore = (snapshot) => {
    snapshot?.forEach(([key, data]) => qc.setQueryData(key, data));
  };

  const statusMutation = useMutation({
    mutationFn: updateWorkoutStatus,
    onMutate: async ({ id, status }) => {
      await qc.cancelQueries({ queryKey: ['workouts'] });
      const lists = patchLists((old) => old.map((w) => (w.id === id ? { ...w, status } : w)));

      const detailKey = ['workout', id];
      const detail = qc.getQueryData(detailKey);
      if (detail) qc.setQueryData(detailKey, { ...detail, status });

      return { lists, detailKey, detail };
    },
    onError: (e, vars, ctx) => {
      restore(ctx?.lists);
      if (ctx?.detail) qc.setQueryData(ctx.detailKey, ctx.detail);
      toast.error(e.response?.data?.message || 'Не удалось изменить статус');
    },
    onSettled: (_d, _e, vars) => {
      invalidateAll(vars.id);
      qc.invalidateQueries({ queryKey: ['records'] });
    },
  });

  const createMutation = useMutation({
    mutationFn: createWorkout,
    onSuccess: (w) => { invalidateAll(w.id); toast.success('Тренировка добавлена'); },
    onError: (e) => toast.error(e.response?.data?.message || 'Не удалось добавить тренировку'),
  });

  const syncMutation = useMutation({
    mutationFn: syncWorkout,
    onSuccess: (w) => { invalidateAll(w.id); toast.success('Тренировка синхронизирована с программой'); },
    onError: (e) => toast.error(e.response?.data?.message || 'Ошибка синхронизации'),
  });

  const setMutation = useMutation({
    mutationFn: upsertWorkoutSet,
    onMutate: async (vars) => {
      const key = ['workout', vars.workoutId];
      await qc.cancelQueries({ queryKey: key });
      const previous = qc.getQueryData(key);

      qc.setQueryData(key, (old) => {
        if (!old) return old;
        const sets = old.sets || [];

        if (vars.setId) {
          return {
            ...old,
            sets: sets.map((s) =>
              s.id === vars.setId
                ? { ...s, weight: vars.weight, reps: vars.reps, is_completed: vars.isCompleted ?? s.is_completed }
                : s
            ),
          };
        }

        const sameExercise = [...sets].reverse().find((s) => s.exercise_id === vars.exerciseId);
        return {
          ...old,
          sets: [...sets, {
            id: `temp-${Date.now()}`,
            workout_id: vars.workoutId,
            exercise_id: vars.exerciseId,
            exercise_name: vars.exerciseName || sameExercise?.exercise_name || 'Упражнение',
            muscle_group: sameExercise?.muscle_group,
            weight: vars.weight ?? sameExercise?.weight ?? null,
            reps: vars.reps ?? sameExercise?.reps ?? null,
            is_completed: false,
            order_index: sets.length,
          }],
        };
      });

      return { previous, key };
    },
    onError: (e, vars, ctx) => {
      if (ctx?.previous) qc.setQueryData(ctx.key, ctx.previous);
      toast.error(e.response?.data?.message || 'Не удалось сохранить подход');
    },
    onSettled: (_d, _e, vars) => invalidateAll(vars.workoutId),
  });

  const deleteSetMutation = useMutation({
    mutationFn: deleteWorkoutSet,
    onMutate: async (vars) => {
      const key = ['workout', vars.workoutId];
      await qc.cancelQueries({ queryKey: key });
      const previous = qc.getQueryData(key);

      qc.setQueryData(key, (old) =>
        old ? { ...old, sets: (old.sets || []).filter((s) => s.id !== vars.setId) } : old
      );

      return { previous, key };
    },
    onError: (e, vars, ctx) => {
      if (ctx?.previous) qc.setQueryData(ctx.key, ctx.previous);
      toast.error(e.response?.data?.message || 'Не удалось удалить подход');
    },
    onSettled: (_d, _e, vars) => invalidateAll(vars.workoutId),
  });

  const updateMutation = useMutation({
    mutationFn: updateWorkout,
    onMutate: async (vars) => {
      const key = ['workout', vars.id];
      await qc.cancelQueries({ queryKey: key });
      const previous = qc.getQueryData(key);
      if (previous) qc.setQueryData(key, { ...previous, ...vars });
      const lists = patchLists((old) => old.map((w) => (w.id === vars.id ? { ...w, ...vars } : w)));
      return { previous, key, lists };
    },
    onError: (e, vars, ctx) => {
      if (ctx?.previous) qc.setQueryData(ctx.key, ctx.previous);
      restore(ctx?.lists);
      toast.error(e.response?.data?.message || 'Не удалось сохранить изменения');
    },
    onSettled: (_d, _e, vars) => invalidateAll(vars.id),
  });

  const deleteWorkoutMutation = useMutation({
    mutationFn: deleteWorkout,
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ['workouts'] });
      return { lists: patchLists((old) => old.filter((w) => w.id !== id)) };
    },
    onError: (e, _id, ctx) => {
      restore(ctx?.lists);
      toast.error(e.response?.data?.message || 'Не удалось удалить тренировку');
    },
    onSuccess: () => toast.success('Тренировка удалена'),
    onSettled: () => invalidateAll(),
  });

  return { statusMutation, createMutation, syncMutation, setMutation, deleteSetMutation, updateMutation, deleteWorkoutMutation };
};