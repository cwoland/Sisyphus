import { useQuery } from '@tanstack/react-query';
import { pingVisit } from './stats.api.js';
import { useToday } from '../../shared/lib/useToday.js';
import { useAuthStore } from '../user/auth.store.js';
import { claimDailyCelebration } from '../../features/visit-streak/dailyCelebration.js';
import { useVisitCelebration } from '../../features/visit-streak/celebration.store.js';

export const useVisitStreak = () => {
  const today = useToday();
  const userId = useAuthStore((s) => s.user?.id);
  return useQuery({
    queryKey: ['stats', 'visits', userId, today],
    queryFn: async () => {
      const data = await pingVisit(today);
      if (useAuthStore.getState().user?.id === userId && claimDailyCelebration(userId, today, data)) {
        useVisitCelebration.getState().show({ userId, date: today, current: Number(data.current) });
      }
      return data;
    },
    enabled: !!userId,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    retry: 1,
  });
};
