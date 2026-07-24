import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getBodyMetrics, getLatestBody, saveBodyMetric, deleteBodyMetric } from '../../entities/body/body.api.js';
import { toast } from '../../shared/ui/toast/toast.store.js';

export const useBodyMetrics = () =>
  useQuery({ queryKey: ['body'], queryFn: getBodyMetrics });

export const useLatestBody = () =>
  useQuery({ queryKey: ['body', 'latest'], queryFn: getLatestBody });

export const useBodyMutations = () => {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ['body'] });

  const save = useMutation({
    mutationFn: saveBodyMetric,
    onSuccess: () => { invalidate(); toast.success('Замеры сохранены'); },
    onError: (e) => toast.error(e.response?.data?.message || 'Не удалось сохранить'),
  });

  const remove = useMutation({
    mutationFn: deleteBodyMetric,
    onSuccess: () => { invalidate(); toast.success('Запись удалена'); },
    onError: (e) => toast.error(e.response?.data?.message || 'Не удалось удалить'),
  });

  return { save, remove };
};