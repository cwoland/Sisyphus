import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getFriends, getPendingRequests, sendFriendRequest, respondToRequest, removeFriend, searchUsers,
} from '../../entities/friend/friend.api.js';
import { getFeed, reactToEvent, unreactToEvent } from '../../entities/feed/feed.api.js';
import { toast } from '../../shared/ui/toast/toast.store.js';
import { pollWhenVisible } from '../../shared/lib/pollWhenVisible.js';
import { isQueuedError } from '../../shared/offline/isQueued.js';

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

export const useFeedReaction = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ type, id, kind }) =>
      kind ? reactToEvent({ type, id, kind }) : unreactToEvent({ type, id }),

    onMutate: async ({ type, id, kind }) => {
      await qc.cancelQueries({ queryKey: ['feed'] });
      const previous = qc.getQueryData(['feed']);

      qc.setQueryData(['feed'], (old) => {
        if (!old) return old;

        return {
          ...old,
          pages: old.pages.map((page) =>
            page.map((item) => {
              if (item.type !== type || item.id !== id) return item;

              const counts = { ...(item.reaction_counts || {}) };
              const was = item.my_reaction;

              if (was) counts[was] = Math.max(0, (counts[was] || 1) - 1);
              if (kind) counts[kind] = (counts[kind] || 0) + 1;

              return {
                ...item,
                my_reaction: kind,
                reaction_counts: counts,
                reacted: Boolean(kind),
                reactions: Math.max(0, (item.reactions || 0) + (was ? 0 : 1) - (kind ? 0 : 1)),
              };
            })
          ),
        };
      });

      return { previous };
    },

    onError: (error, _vars, ctx) => {
      if (isQueuedError(error)) return;
      qc.setQueryData(['feed'], ctx?.previous);
      toast.error('Не удалось отметить');
    },
  });
};