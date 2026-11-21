import { useQuery } from '@tanstack/react-query';
import { searchFood } from '../../entities/nutrition/food.api.js';
import { useAuthStore } from '../../entities/user/auth.store.js';

export const useFoodSearch = (term = '') => {
  const userId = useAuthStore((state) => state.user?.id);

  return useQuery({
    queryKey: ['food', 'picker', userId, term],
    queryFn: () => searchFood(term),
    enabled: Boolean(userId),
    staleTime: 0,
  });
};