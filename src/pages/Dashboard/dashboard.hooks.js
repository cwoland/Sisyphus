import { useQuery } from '@tanstack/react-query';
import { getWorkouts } from '../../entities/workout/workout.api.js';
import { getDailySummary } from '../../entities/nutrition/nutrition.api.js';
import { todayApi, weekRange } from '../../shared/lib/date.js';

export const useWeekWorkouts = () => {
    const { from, to } = weekRange();
    return useQuery({
        queryKey: ['workouts', 'week', from, to],
        queryFn: () => getWorkouts({ from, to }),
    });
};

export const useTodayNutrition = () => {
    const date = todayApi();
    return useQuery({
        queryKey: ['nutrition', 'summary', date],
        queryFn: () => getDailySummary(date),
    });
};