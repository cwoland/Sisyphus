import { api } from '../../shared/lib/axios.js';
import { isQueuedError } from '../../shared/offline/isQueued.js';
import { useAuthStore } from '../../entities/user/auth.store.js';

const slotOf = (set) => set.original_exercise_id ?? set.exercise_id;
const familyOf = (set) => set.parent_set_id ?? set.id;

export function changeTargets(sets, anchor) {
  const group = sets.filter((set) => set.group_index === anchor.group_index);

  const startedFamilies = new Set(
    group.filter((set) => set.is_completed).map(familyOf)
  );

  const remaining = group.filter((set) =>
    slotOf(set) === slotOf(anchor) &&
    set.exercise_id === anchor.exercise_id &&
    !set.is_completed &&
    !set.is_skipped
  );

  return {
    remaining,
    replaceable: remaining.filter((set) => !startedFamilies.has(familyOf(set))),
    occupied: new Set(
      group
        .filter((set) => slotOf(set) !== slotOf(anchor) && !set.is_skipped)
        .map((set) => set.exercise_id)
    ),
  };
}

function previewChange(workout, anchor, replacement) {
  const { remaining, replaceable, occupied } = changeTargets(workout.sets, anchor);
  if (!remaining.some((set) => set.id === anchor.id)) {
    throw new Error('Этот подход уже изменился. Открой действия заново.');
  }

  if (replacement && (
    replacement.id === anchor.exercise_id ||
    occupied.has(replacement.id) ||
    !replaceable.length
  )) {
    throw new Error('Эта замена больше недоступна.');
  }

  const affected = new Set(remaining.map((set) => set.id));
  const transferable = new Set(replaceable.map((set) => set.id));

  return {
    ...workout,
    sets: workout.sets.map((set) => {
      if (!affected.has(set.id)) return set;

      if (!replacement || !transferable.has(set.id)) {
        return { ...set, is_skipped: true };
      }

      return {
        ...set,
        original_exercise_id: slotOf(set),
        exercise_id: replacement.id,
        exercise_name: replacement.name,
        tracking: replacement.tracking,
        muscle_group: replacement.muscle_group,
        weight: null,
        reps: null,
        rpe: null,
        duration_sec: null,
        target_reps: null,
      };
    }),
  };
}

export async function changeExercise(queryClient, workout, anchor, replacement) {
  const userId = useAuthStore.getState().user?.id;
  const key = ['workout', workout.id];

  await queryClient.cancelQueries({ queryKey: key, exact: true });
  const latest = queryClient.getQueryData(key) ?? workout;
  const preview = previewChange(latest, anchor, replacement);

  const body = {
    requestId: crypto.randomUUID(),
    anchorId: anchor.id,
    exerciseId: anchor.exercise_id,
    replacementId: replacement?.id ?? null,
  };

  let updated;
  try {
    const { data } = await api.patch(`/workouts/${workout.id}/active-exercise`, body);
    updated = data.workout;
  } catch (error) {
    if (!isQueuedError(error)) {
      if (error.response?.status === 409) {
        void queryClient.invalidateQueries({ queryKey: key, exact: true });
      }
      throw error;
    }
    updated = preview;
  }

  if (useAuthStore.getState().user?.id !== userId) {
    throw new Error('Аккаунт изменился.');
  }

  await queryClient.cancelQueries({ queryKey: key, exact: true });
  queryClient.setQueryData(key, updated);
  void queryClient.invalidateQueries({ queryKey: ['exercises'] });
  return updated;
}