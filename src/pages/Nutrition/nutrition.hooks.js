import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getEntries, getRecentFoods, createEntry, updateEntry, deleteEntry, getDailySummary,
  getTargets, updateTargets,
} from '../../entities/nutrition/nutrition.api.js';
import { toast } from '../../shared/ui/toast/toast.store.js';

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
    onError: (e, _v, ctx) => {
      qc.setQueryData(entriesKey, ctx?.previous);
      toast.error(e.response?.data?.message || 'Не удалось добавить');
    },
    onSettled: invalidate,
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
    onError: (e, _v, ctx) => {
      qc.setQueryData(entriesKey, ctx?.previous);
      toast.error(e.response?.data?.message || 'Не удалось изменить');
    },
    onSettled: invalidate,
  });

  const remove = useMutation({
    mutationFn: deleteEntry,
    onMutate: async (id) => {
      const previous = await snapshot();
      qc.setQueryData(entriesKey, (old) => (old || []).filter((e) => e.id !== id));
      return { previous };
    },
    onError: (e, _v, ctx) => {
      qc.setQueryData(entriesKey, ctx?.previous);
      toast.error(e.response?.data?.message || 'Не удалось удалить');
    },
    onSuccess: () => toast.success('Запись удалена'),
    onSettled: invalidate,
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