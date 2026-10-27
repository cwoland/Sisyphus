import { useQuery } from '@tanstack/react-query';
import { getVolume } from '../../entities/stats/stats.api.js';

export const useVolume = (weeks) =>
  useQuery({
    queryKey: ['stats', 'volume', weeks],
    queryFn: () => getVolume(weeks),
    placeholderData: (prev) => prev,
  });