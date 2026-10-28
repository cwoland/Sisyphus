import { useQuery } from '@tanstack/react-query';
import { pingVisit } from './stats.api.js';
import { useToday } from '../../shared/lib/useToday.js';

export const useVisitStreak = () => {
    const today = useToday();

    return useQuery({
        queryKey: ['stats', 'visits', today],
        queryFn: () => pingVisit(today),
        staleTime: Infinity,
        refetchOnWindowFocus: false,
        retry: 1,
    });
};