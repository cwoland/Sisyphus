import { trackingOf } from '../../entities/exercise/tracking.js';

export const buildWorkoutGroups = (sets = []) => {
  const drops = new Map();

  for (const set of sets) {
    if (set.set_kind !== 'drop' || !set.parent_set_id) {
      continue;
    }

    const list = drops.get(set.parent_set_id) || [];
    list.push(set);
    drops.set(set.parent_set_id, list);
  }

  const groups = new Map();

  for (const set of sets) {
    if (set.set_kind === 'drop') continue;

    const key = set.group_index ?? set.exercise_id;

    if (!groups.has(key)) {
      groups.set(key, {
        key: `g${key}`,
        sets: [],
        exercises: [],
      });
    }

    const group = groups.get(key);

    group.sets.push({
      ...set,
      drops: drops.get(set.id) || [],
    });

    if (
      !group.exercises.some(
        (ex) => ex.id === set.exercise_id
      )
    ) {
      group.exercises.push({
        id: set.exercise_id,
        name: set.exercise_name,
        tracking: trackingOf(set),
      });
    }
  }

  return [...groups.values()].map((group) => {
    group.sets.sort(
      (a, b) =>
        (a.round_index ?? 0) - (b.round_index ?? 0) ||
        a.order_index - b.order_index
    );

    group.exercises.sort(
      (a, b) =>
        group.sets.findIndex(
          (s) => s.exercise_id === a.id
        ) -
        group.sets.findIndex(
          (s) => s.exercise_id === b.id
        )
    );

    const steps = group.sets.flatMap((set) => [
      set,
      ...set.drops.map((drop) => ({
        ...drop,
        tracking: set.tracking,
      })),
    ]);

    const isDropSet =
      group.exercises.length === 1 &&
      group.sets.length === 1 &&
      group.sets[0].drops.length > 0;

    const roundList = [
      ...new Set(
        group.sets.map((s) => s.round_index ?? 0)
      ),
    ].sort((a, b) => a - b);

    return {
      ...group,
      steps,
      isDropSet,
      roundList,
      rounds: roundList.length,
      doneRounds: roundList.filter((r) =>
        steps
          .filter((s) => (s.round_index ?? 0) === r)
          .every((s) => s.is_completed)
      ).length,
      isSuperset: group.exercises.length > 1,
      name:
        group.exercises.length > 2
          ? 'Круг'
          : group.exercises.length > 1
            ? 'Суперсет'
            : group.exercises[0]?.name || '',
    };
  });
};

export const restSecondsForGroup = (
  group,
  fallback = 120
) => {
  const planned = group?.steps.findLast(
    (s) => Number.isInteger(s.rest_after_sec)
  );

  return planned ? planned.rest_after_sec : fallback;
};

export function buildSessionGroups(sets = []) {
  return buildWorkoutGroups(sets).flatMap((group) => {
    const visible = group.steps.filter((set) => !set.is_skipped);
    if (!visible.length) return [];

    const slotOf = (set) => set.original_exercise_id ?? set.exercise_id;
    const roundOf = (set) => set.round_index ?? 0;
    const rounds = [...new Set(visible.map(roundOf))];
    const steps = [];
    let plannedRest = null;

    for (const round of rounds) {
      const original = group.steps.filter((set) => roundOf(set) === round);
      const active = visible.filter((set) => roundOf(set) === round);

      const explicitRest = original.findLast((set) => set.rest_after_sec > 0);
      const allExplicit = original.every((set) => set.rest_after_sec != null);
      const rest = explicitRest?.rest_after_sec ?? (allExplicit ? 0 : null);
      if (rest != null) plannedRest = rest;

      active.forEach((set, index) => {
        steps.push({
          ...set,
          rest_after_sec: index === active.length - 1 ? rest : 0,
        });
      });
    }

    const parents = group.sets
      .filter((set) => !set.is_skipped)
      .map((set) => ({ ...set, drops: set.drops.filter((drop) => !drop.is_skipped) }));

    const slots = [...new Set(steps.map(slotOf))];
    const exercises = slots.map((slot) => {
      const members = steps.filter((set) => slotOf(set) === slot);
      const displayed = members.find((set) => !set.is_completed) ?? members.at(-1);

      return {
        id: displayed.exercise_id,
        name: displayed.exercise_name,
        tracking: displayed.tracking,
        slot,
      };
    });

    return [{
      ...group,
      sets: parents,
      steps,
      exercises,
      roundList: rounds,
      rounds: rounds.length,
      doneRounds: rounds.filter((round) =>
        steps.filter((set) => roundOf(set) === round).every((set) => set.is_completed)
      ).length,
      plannedRest,
      isDropSet: slots.length === 1 && parents.length === 1 && parents[0].drops.length > 0,
      isSuperset: slots.length > 1,
      name: slots.length > 2 ? 'Круг' : slots.length === 2 ? 'Суперсет' : exercises[0].name,
    }];
  });
}