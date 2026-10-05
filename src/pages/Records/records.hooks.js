import { useQuery } from '@tanstack/react-query';
import { getRecords, getExerciseHistory } from '../../entities/records/record.api.js';

export const useRecords = () =>
  useQuery({ queryKey: ['records'], queryFn: getRecords });

export const useExerciseHistory = (exerciseId) =>
  useQuery({
    queryKey: ['records', 'history', exerciseId],
    queryFn: () => getExerciseHistory(exerciseId),
    enabled: !!exerciseId,
  });
