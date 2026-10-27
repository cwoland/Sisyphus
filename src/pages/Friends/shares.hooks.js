import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getShares, shareProgram, shareWorkout, removeShare } from '../../entities/share/share.api.js';
import { toast } from '../../shared/ui/toast/toast.store.js';
import { pollWhenVisible } from '../../shared/lib/pollWhenVisible.js';

export const useShares = () =>
  useQuery({
    queryKey: ['shares'],
    queryFn: getShares,
    refetchInterval: pollWhenVisible(60_000),
    refetchOnWindowFocus: true,
  });

export const useShareMutations = () => {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ['shares'] });

  const sendProgram = useMutation({
    mutationFn: shareProgram,
    onSuccess: () => toast.success('Программа отправлена'),
    onError: (e) => toast.error(e.response?.data?.message || 'Не удалось отправить'),
  });

  const sendWorkout = useMutation({
    mutationFn: shareWorkout,
    onSuccess: () => toast.success('Тренировка отправлена'),
    onError: (e) => toast.error(e.response?.data?.message || 'Не удалось отправить'),
  });

  const dismiss = useMutation({
    mutationFn: removeShare,
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ['shares'] });
      const previous = qc.getQueryData(['shares']);
      qc.setQueryData(['shares'], (old) => (old || []).filter((s) => s.id !== id));
      return { previous };
    },
    onError: (e, _v, ctx) => {
      qc.setQueryData(['shares'], ctx?.previous);
      toast.error('Не удалось убрать');
    },
    onSettled: invalidate,
  });

  return { sendProgram, sendWorkout, dismiss };
};