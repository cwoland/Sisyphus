import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getWorkouts, getWorkout, createWorkout, updateWorkout, updateWorkoutStatus, syncWorkout,
  upsertWorkoutSet, deleteWorkoutSet, deleteWorkout,
  getActiveWorkout, startWorkout,
} from '../../entities/workout/workout.api.js';
import { getRecords } from '../../entities/records/record.api.js';
import { monthGridRange, weekRange } from '../../shared/lib/date.js';
import { toast } from '../../shared/ui/toast/toast.store.js';
import { isQueuedError } from '../../shared/offline/isQueued.js';


const onMutationError = (rollback, fallbackMessage) => (error, vars, ctx) => {
  if (isQueuedError(error)) return;
  rollback?.(ctx, vars);
  toast.error(error.response?.data?.message || fallbackMessage);
};

const skipWhenQueued = (fn) => (data, error, vars, ctx) => {
  if (isQueuedError(error)) return;
  fn(data, error, vars, ctx);
};

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
    networkMode: 'always',
    mutationFn: startWorkout,
    onSuccess: (workout) => {
      qc.setQueryData(['workout', workout.id], workout);
      qc.invalidateQueries({ queryKey: ['workouts'] });
    },
    onError: onMutationError(null, 'Не удалось начать тренировку'),
  });
};

export const useWorkoutDetails = (workoutId) =>
  useQuery({
    queryKey: ['workout', workoutId],
    networkMode: 'offlineFirst',
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
    networkMode: 'always',
    mutationFn: updateWorkoutStatus,
    onMutate: async ({ id, status }) => {
      await qc.cancelQueries({ queryKey: ['workouts'] });
      const lists = patchLists((old) => old.map((w) => (w.id === id ? { ...w, status } : w)));

      const detailKey = ['workout', id];
      const detail = qc.getQueryData(detailKey);
      if (detail) qc.setQueryData(detailKey, { ...detail, status });

      const active = qc.getQueryData(['workouts', 'active']);
      if (active?.id === id) qc.setQueryData(['workouts', 'active'], status === 'in_progress' ? { ...active, status } : null);
      return { lists, detailKey, detail, active };
    },
    onError: onMutationError((ctx) => {
      restore(ctx?.lists);
      if (ctx?.detail) qc.setQueryData(ctx.detailKey, ctx.detail);
      if (ctx?.active !== undefined) qc.setQueryData(['workouts', 'active'], ctx.active);
    }, 'Не удалось изменить статус'),
    onSettled: skipWhenQueued((_d, _e, vars) => {
      invalidateAll(vars.id);
      qc.invalidateQueries({ queryKey: ['records'] });
    }),
  });

  const createMutation = useMutation({
    networkMode: 'always',
    mutationFn: createWorkout,
    onSuccess: (w) => { invalidateAll(w.id); toast.success('Тренировка добавлена'); },
    onError: onMutationError(null, 'Не удалось добавить тренировку'),
  });

  const syncMutation = useMutation({
    networkMode: 'always',
    mutationFn: syncWorkout,
    onSuccess: (w) => { invalidateAll(w.id); toast.success('Тренировка синхронизирована с программой'); },
    onError: onMutationError(null, 'Ошибка синхронизации'),
  });

  const setMutation = useMutation({
    networkMode: 'always',
    mutationFn: upsertWorkoutSet,
    onMutate: async (vars) => {
      if (!vars.setId) vars.clientId ??= crypto.randomUUID();
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
              ? {
                ...s,
                weight: vars.weight !== undefined ? vars.weight : s.weight,
                reps: vars.reps !== undefined ? vars.reps : s.reps,
                duration_sec: vars.durationSec !== undefined ? vars.durationSec : s.duration_sec,
                rpe: vars.rpe !== undefined ? vars.rpe : s.rpe,
                is_completed: vars.isCompleted ?? s.is_completed,
              }
            : s
          ),
          };
        }

        const parent = sets.find((s) => s.id === vars.parentSetId);
        const exerciseId = parent?.exercise_id || vars.exerciseId;
        const sameExercise = [...sets].reverse().find((s) => s.exercise_id === exerciseId && s.set_kind !== 'drop');
        const groupIndex = parent?.group_index ?? sameExercise?.group_index ?? Math.max(-1, ...sets.map((s) => s.group_index ?? 0)) + 1;
        const roundIndex = parent?.round_index ?? Math.max(-1, ...sets.filter((s) => s.exercise_id === exerciseId).map((s) => s.round_index ?? 0)) + 1;
        return {
          ...old,
          sets: [...sets, {
            id: vars.clientId,
            workout_id: vars.workoutId,
            exercise_id: exerciseId,
            exercise_name: vars.exerciseName || parent?.exercise_name || sameExercise?.exercise_name || 'Упражнение',
            muscle_group: parent?.muscle_group || sameExercise?.muscle_group,
            tracking: parent?.tracking || sameExercise?.tracking,
            weight: vars.weight ?? null, reps: vars.reps ?? null,
            duration_sec: vars.durationSec ?? null, rpe: vars.rpe ?? null,
            is_completed: vars.isCompleted ?? false,
            set_kind: vars.parentSetId ? 'drop' : vars.setKind ?? 'normal',
            parent_set_id: vars.parentSetId ?? null,
            group_index: groupIndex, round_index: roundIndex,
            order_index: parent?.order_index ?? Math.max(-1, ...sets.map((s) => s.order_index)) + 1,
          }],
        };
      });

      return { previous, key };
    },
    onError: onMutationError((ctx) => {
      if (ctx?.previous) qc.setQueryData(ctx.key, ctx.previous);
    }, 'Не удалось сохранить подход'),
    onSettled: skipWhenQueued((data, _e, vars) => {
      invalidateAll(vars.workoutId);
      qc.invalidateQueries({ queryKey: ['records'] });
      qc.invalidateQueries({ queryKey: ['stats'] });
    }),
  });

  const deleteSetMutation = useMutation({
    networkMode: 'always',
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
    onError: onMutationError((ctx) => {
      if (ctx?.previous) qc.setQueryData(ctx.key, ctx.previous);
    }, 'Не удалось удалить подход'),
    onSettled: skipWhenQueued((_d, _e, vars) => {
      invalidateAll(vars.workoutId);
      qc.invalidateQueries({ queryKey: ['records'] });
      qc.invalidateQueries({ queryKey: ['stats'] });
    }),
  });

  const updateMutation = useMutation({
    networkMode: 'always',
    mutationFn: updateWorkout,
    onMutate: async (vars) => {
      const key = ['workout', vars.id];
      await qc.cancelQueries({ queryKey: key });
      const previous = qc.getQueryData(key);
      if (previous) qc.setQueryData(key, { ...previous, ...vars });
      const lists = patchLists((old) => old.map((w) => (w.id === vars.id ? { ...w, ...vars } : w)));
      return { previous, key, lists };
    },
    onError: onMutationError((ctx) => {
      if (ctx?.previous) qc.setQueryData(ctx.key, ctx.previous);
      restore(ctx?.lists);
    }, 'Не удалось сохранить изменения'),
    onSettled: skipWhenQueued((_d, _e, vars) => { 
      invalidateAll(vars.id);
      qc.invalidateQueries({ queryKey: ['records'] });
      qc.invalidateQueries({ queryKey: ['stats'] });
  }),
  });

  const deleteWorkoutMutation = useMutation({
    networkMode: 'always',
    mutationFn: deleteWorkout,
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ['workouts'] });
      return { lists: patchLists((old) => old.filter((w) => w.id !== id)) };
    },
    onError: onMutationError((ctx) => restore(ctx?.lists), 'Не удалось удалить тренировку'),
    onSuccess: () => toast.success('Тренировка удалена'),
    onSettled: skipWhenQueued(() => {
      invalidateAll();
      qc.invalidateQueries({ queryKey: ['records'] });
      qc.invalidateQueries({ queryKey: ['stats'] });
    }),
  });

  return { statusMutation, createMutation, syncMutation, setMutation, deleteSetMutation, updateMutation, deleteWorkoutMutation };
};
