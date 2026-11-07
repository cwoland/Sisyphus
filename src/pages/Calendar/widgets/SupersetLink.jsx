import { Link2, Link2Off } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '../../../shared/lib/axios.js';
import { toast } from '../../../shared/ui/toast/toast.store.js';

const groupOf = (exercise) =>
  exercise.sets.find((set) => set.set_kind !== 'drop')
    ?.group_index;

export const SupersetLink = ({
  workoutId,
  workoutStatus,
  first,
  second,
  exercises,
  disabled,
}) => {
  const queryClient = useQueryClient();

  const firstGroup = groupOf(first);
  const secondGroup = groupOf(second);

  const linked =
    firstGroup != null &&
    firstGroup === secondGroup;

  const membersIn = (groupIndex) =>
    exercises.filter(
      (exercise) => groupOf(exercise) === groupIndex
    ).length;

  const canLink =
    !linked &&
    firstGroup != null &&
    secondGroup != null &&
    membersIn(firstGroup) === 1 &&
    membersIn(secondGroup) === 1;

  const canSplit =
    linked &&
    membersIn(firstGroup) === 2;

  const mutation = useMutation({
    networkMode: 'always',

    mutationFn: async (action) => {
      if (!navigator.onLine) {
        throw new Error(
          'Для изменения суперсета нужно подключение к интернету'
        );
      }

      const { data } = await api.patch(
        `/workouts/${workoutId}/groups`,
        {
          action,
          firstExerciseId: first.exerciseId,
          secondExerciseId: second.exerciseId,
        },
        {
          _offlineReplay: true,
        }
      );

      return data.workout;
    },

    onSuccess: (workout, action) => {
      queryClient.setQueryData(
        ['workout', workoutId],
        workout
      );

      queryClient.invalidateQueries({
        queryKey: ['workouts'],
      });

      toast.success(
        action === 'link'
          ? 'Суперсет создан'
          : 'Упражнения разделены'
      );
    },

    onError: (error) => {
      toast.error(
        error.response?.data?.message ||
        error.message ||
        'Не удалось изменить суперсет'
      );
    },
  });

  if (!canLink && !canSplit) return null;

  const action = linked ? 'split' : 'link';
  const Icon = linked ? Link2Off : Link2;

  return (
    <div className="flex items-center gap-2 px-3">
      <span
        aria-hidden="true"
        className="h-px min-w-0 flex-1 bg-border"
      />

      <button
        type="button"
        disabled={
          disabled ||
          mutation.isPending ||
          workoutStatus !== 'planned'
        }
        onClick={() => mutation.mutate(action)}
        className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl border border-border bg-surface px-3 text-sm font-medium text-terracotta-ink disabled:cursor-not-allowed disabled:opacity-40"
        aria-label={
          linked
            ? `Разделить ${first.exerciseName} и ${second.exerciseName}`
            : `Объединить ${first.exerciseName} и ${second.exerciseName} в суперсет`
        }
      >
        <Icon size={16} />
        {mutation.isPending
          ? 'Сохраняем…'
          : linked
            ? 'Разделить'
            : 'Связать в суперсет'}
      </button>

      <span
        aria-hidden="true"
        className="h-px min-w-0 flex-1 bg-border"
      />
    </div>
  );
};