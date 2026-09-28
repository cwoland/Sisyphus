import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getEntries, getRecentFoods, createEntry, updateEntry, deleteEntry, getDailySummary,
  getTargets, updateTargets,
} from '../../entities/nutrition/nutrition.api.js';
import { toast } from '../../shared/ui/toast/toast.store.js';
import { isQueuedError } from '../../shared/offline/isQueued.js';


const onMutationError = (rollback, fallbackMessage) => (error, vars, ctx) => {
  if (isQueuedError(error)) return;
  rollback?.(ctx);
  toast.error(error.response?.data?.message || fallbackMessage);
};

const skipWhenQueued = (fn) => (data, error, vars, ctx) => {
  if (isQueuedError(error)) return;
  fn(data, error, vars, ctx);
};

export const useDayEntries = (date) =>
  useQuery({
    queryKey: ['nutrition', 'entries', date],
    queryFn: () => getEntries({ from: date, to: date }),
    enabled: !!date,
  });

export const useDaySummary = (date) =>
  useQuery({
    queryKey: ['nutrition', 'summary', date],
    queryFn: () => getDailySummary(date),
    enabled: !!date,
  });

export const useTargets = () =>
  useQuery({ queryKey: ['nutrition', 'targets'], queryFn: getTargets });

export const useRecentFoods = (q, options = {}) =>
  useQuery({
    queryKey: ['nutrition', 'recent', q],
    queryFn: () => getRecentFoods(q),
    ...options,
  });

export const useNutritionMutations = (date) => {
  const qc = useQueryClient();
  const entriesKey = ['nutrition', 'entries', date];

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: entriesKey });
    qc.invalidateQueries({ queryKey: ['nutrition', 'summary', date] });
  };

  const snapshot = async () => {
    await qc.cancelQueries({ queryKey: entriesKey });
    return qc.getQueryData(entriesKey);
  };

  const create = useMutation({
    mutationFn: createEntry,
    onMutate: async (vars) => {
      const previous = await snapshot();
      qc.setQueryData(entriesKey, (old) => [
        ...(old || []),
        { id: `temp-${Date.now()}`, meal_type: vars.mealType, ...vars },
      ]);
      return { previous };
    },
    onError: onMutationError((ctx) => qc.setQueryData(entriesKey, ctx?.previous), 'Не удалось добавить'),
    onSettled: skipWhenQueued(invalidate),
  });

  const update = useMutation({
    mutationFn: updateEntry,
    onMutate: async (vars) => {
      const previous = await snapshot();
      qc.setQueryData(entriesKey, (old) =>
        (old || []).map((e) => (e.id === vars.id ? { ...e, ...vars, meal_type: vars.mealType } : e))
      );
      return { previous };
    },
    onError: onMutationError((ctx) => qc.setQueryData(entriesKey, ctx?.previous), 'Не удалось изменить'),
    onSettled: skipWhenQueued(invalidate),
  });

  const remove = useMutation({
    mutationFn: deleteEntry,
    onMutate: async (id) => {
      const previous = await snapshot();
      qc.setQueryData(entriesKey, (old) => (old || []).filter((e) => e.id !== id));
      return { previous };
    },
    onError: onMutationError((ctx) => qc.setQueryData(entriesKey, ctx?.previous), 'Не удалось удалить'),
    onSuccess: () => toast.success('Запись удалена'),
    onSettled: skipWhenQueued(invalidate),
  });

  return { create, update, remove };
};

export const useTargetsMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateTargets,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['nutrition', 'targets'] });
      qc.invalidateQueries({ queryKey: ['nutrition', 'summary'] });
      toast.success('Цели обновлены');
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Не удалось сохранить цели'),
  });
};