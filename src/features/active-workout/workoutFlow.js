import { trackingOf } from '../../entities/exercise/tracking.js';

export const buildWorkoutGroups = (sets = []) => {
  const drops = new Map();
  for (const set of sets) {
    if (set.set_kind !== 'drop' || !set.parent_set_id) continue;
    const list = drops.get(set.parent_set_id) || [];
    list.push(set);
    drops.set(set.parent_set_id, list);
  }
  const groups = new Map();
  for (const set of sets) {
    if (set.set_kind === 'drop') continue;
    const key = set.group_index ?? set.exercise_id;
    if (!groups.has(key)) groups.set(key, { key: `g${key}`, sets: [], exercises: [] });
    const group = groups.get(key);
    group.sets.push({ ...set, drops: drops.get(set.id) || [] });
    if (!group.exercises.some((ex) => ex.id === set.exercise_id)) {
      group.exercises.push({ id: set.exercise_id, name: set.exercise_name, tracking: trackingOf(set) });
    }
  }
  return [...groups.values()].map((group) => {
    group.sets.sort((a, b) => (a.round_index ?? 0) - (b.round_index ?? 0) || a.order_index - b.order_index);
    group.exercises.sort((a, b) => group.sets.findIndex((s) => s.exercise_id === a.id) - group.sets.findIndex((s) => s.exercise_id === b.id));
    const steps = group.sets.flatMap((set) => [set, ...set.drops.map((drop) => ({ ...drop, tracking: set.tracking }))]);
    const roundList = [...new Set(group.sets.map((s) => s.round_index ?? 0))].sort((a, b) => a - b);
    return { ...group, steps, roundList, rounds: roundList.length,
      doneRounds: roundList.filter((r) => steps.filter((s) => (s.round_index ?? 0) === r).every((s) => s.is_completed)).length,
      isSuperset: group.exercises.length > 1,
      name: group.exercises.length > 2 ? 'Круг' : group.exercises.length > 1 ? 'Суперсет' : group.exercises[0]?.name || '',
    };
  });
};
