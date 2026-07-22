import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getWorkouts, getWorkout, createWorkout, updateWorkout, updateWorkoutStatus, syncWorkout,
  upsertWorkoutSet, deleteWorkoutSet, deleteWorkout,
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

  const statusMutation = useMutation({
    mutationFn: updateWorkoutStatus,
    onSuccess: (w) => {
      invalidateAll(w.id);
      qc.invalidateQueries({ queryKey: ['records'] });
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Не удалось изменить статус'),
  });

  const createMutation = useMutation({
    mutationFn: createWorkout,
    onSuccess: (w) => { invalidateAll(w.id); toast.success('Тренировка добавлена'); },
    onError: (e) => toast.error(e.response?.data?.message || 'Не удалось добавить тренировку'),
  });

  const updateMutation = useMutation({
    mutationFn: updateWorkout,
    onSuccess: (w) => invalidateAll(w.id),
    onError: (e) => toast.error(e.response?.data?.message || 'Не удалось сохранить изменения'),
  });

  const syncMutation = useMutation({
    mutationFn: syncWorkout,
    onSuccess: (w) => {
      invalidateAll(w.id);
      toast.success('Тренировка синхронизирована с программой');
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Ошибка синхронизации'),
  });

  const setMutation = useMutation({
    mutationFn: upsertWorkoutSet,
    onSuccess: (set) => invalidateAll(set.workout_id),
    onError: (e) => toast.error(e.response?.data?.message || 'Не удалось сохранить подход'),
  });

  const deleteSetMutation = useMutation({
    mutationFn: deleteWorkoutSet,
    onSuccess: (_, vars) => invalidateAll(vars.workoutId),
    onError: (e) => toast.error(e.response?.data?.message || 'Не удалось удалить подход'),
  });

  const deleteWorkoutMutation = useMutation({
    mutationFn: deleteWorkout,
    onSuccess: () => {
      invalidateAll();
      toast.success('Тренировка удалена');
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Не удалось удалить тренировку'),
  });

  return { statusMutation, createMutation, updateMutation, syncMutation, setMutation, deleteSetMutation, deleteWorkoutMutation };
};