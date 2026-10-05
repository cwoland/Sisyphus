import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getFriends, getPendingRequests, sendFriendRequest, respondToRequest, removeFriend, searchUsers,
} from '../../entities/friend/friend.api.js';
import { getFeed } from '../../entities/feed/feed.api.js';
import { toast } from '../../shared/ui/toast/toast.store.js';
import { pollWhenVisible } from '../../shared/lib/pollWhenVisible.js';

const requestsKey = ['friends', 'requests'];

export const useFriends = () =>
  useQuery({ queryKey: ['friends'], queryFn: getFriends });

export const useUserSearch = (q) =>
  useQuery({
    queryKey: ['friends', 'search', q],
    queryFn: () => searchUsers(q),
    enabled: q.trim().length >= 2,
  });

export const usePendingRequests = () =>
  useQuery({
    queryKey: ['friends', 'requests'],
    queryFn: getPendingRequests,
    refetchInterval: pollWhenVisible(30_000),
    refetchOnWindowFocus: true,
  });

const FEED_PAGE = 30;

export const useFriendsFeed = (options = {}) =>
  useInfiniteQuery({
    queryKey: ['feed'],
    queryFn: ({ pageParam }) => getFeed(pageParam),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => {
      if (!lastPage || lastPage.length < FEED_PAGE) return undefined;
      const last = lastPage[lastPage.length - 1];
      return { before: last.occurred_at, beforeId: last.id };
    },
    ...options,
  });

export const useFriendMutations = () => {
  const qc = useQueryClient();

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['friends'] });
    qc.invalidateQueries({ queryKey: ['feed'] });
  };

  const sendRequest = useMutation({
    mutationFn: sendFriendRequest,
    onSuccess: () => toast.success('Заявка отправлена'),
    onError: (e) => toast.error(e.response?.data?.message || 'Не удалось отправить заявку'),
  });

  const respond = useMutation({
    mutationFn: respondToRequest,
    onMutate: async ({ id }) => {
      await qc.cancelQueries({ queryKey: requestsKey });
      const previous = qc.getQueryData(requestsKey);
      qc.setQueryData(requestsKey, (old) => (old || []).filter((r) => r.friendship_id !== id));
      return { previous };
    },
    onError: (e, _v, ctx) => {
      qc.setQueryData(requestsKey, ctx?.previous);
      toast.error(e.response?.data?.message || 'Ошибка');
    },
    onSuccess: (_d, vars) => toast.success(vars.accept ? 'Заявка принята' : 'Заявка отклонена'),
    onSettled: invalidate,
  });

  const remove = useMutation({
    mutationFn: removeFriend,
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ['friends'] });
      const previous = qc.getQueryData(['friends']);
      qc.setQueryData(['friends'], (old) => (old || []).filter((f) => f.friendship_id !== id));
      return { previous };
    },
    onError: (e, _v, ctx) => {
      qc.setQueryData(['friends'], ctx?.previous);
      toast.error(e.response?.data?.message || 'Не удалось удалить');
    },
    onSuccess: () => toast.success('Удалено из друзей'),
    onSettled: invalidate,
  });

  return { sendRequest, respond, remove };
};