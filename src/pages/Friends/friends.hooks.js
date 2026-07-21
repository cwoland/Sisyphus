import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getFriends, getPendingRequests, sendFriendRequest, respondToRequest, removeFriend,
} from '../../entities/friend/friend.api.js';
import { toast } from '../../shared/ui/toast/toast.store.js';

export const useFriends = () =>
  useQuery({ queryKey: ['friends'], queryFn: getFriends });

export const usePendingRequests = () =>
  useQuery({
    queryKey: ['friends', 'requests'],
    queryFn: getPendingRequests,
    refetchInterval: 30_000,
  });

export const useFriendMutations = () => {
  const qc = useQueryClient();

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['friends'] });
  };

  const sendRequest = useMutation({
    mutationFn: sendFriendRequest,
    onSuccess: () => toast.success('Заявка отправлена'),
    onError: (e) => toast.error(e.response?.data?.message || 'Не удалось отправить заявку'),
  });

  const respond = useMutation({
    mutationFn: respondToRequest,
    onSuccess: (_, vars) => {
      invalidate();
      toast.success(vars.accept ? 'Заявка принята' : 'Заявка отклонена');
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Ошибка'),
  });

  const remove = useMutation({
    mutationFn: removeFriend,
    onSuccess: () => { invalidate(); toast.success('Удалено из друзей'); },
    onError: (e) => toast.error(e.response?.data?.message || 'Не удалось удалить'),
  });

  return { sendRequest, respond, remove };
};