import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getEntries, createEntry, updateEntry, deleteEntry, getDailySummary,
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

export const useNutritionMutations = (date) => {
  const qc = useQueryClient();

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['nutrition', 'entries', date] });
    qc.invalidateQueries({ queryKey: ['nutrition', 'summary', date] });
  };

  const create = useMutation({
    mutationFn: createEntry,
    onSuccess: invalidate,
    onError: (e) => toast.error(e.response?.data?.message || 'Не удалось добавить'),
  });

  const update = useMutation({
    mutationFn: updateEntry,
    onSuccess: invalidate,
    onError: (e) => toast.error(e.response?.data?.message || 'Не удалось изменить'),
  });

  const remove = useMutation({
    mutationFn: deleteEntry,
    onSuccess: () => { invalidate(); toast.success('Запись удалена'); },
    onError: (e) => toast.error(e.response?.data?.message || 'Не удалось удалить'),
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