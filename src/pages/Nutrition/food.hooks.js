import { useQuery } from '@tanstack/react-query';
import { searchFood } from '../../entities/nutrition/food.api.js';

export const useFoodSearch = (term, options = {}) =>
  useQuery({
    queryKey: ['food', 'search', term],
    queryFn: () => searchFood(term),
    enabled: term.trim().length >= 2,
    staleTime: 10 * 60 * 1000,
    ...options,
  });