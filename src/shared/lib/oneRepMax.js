export const epley1RM = (weight, reps) => {
  const w = Number(weight) || 0;
  const r = Number(reps) || 0;
  if (w <= 0 || r <= 0) return 0;
  return w * (1 + r / 30);
};

export const bestSetsByExercise = (sets = []) => {
  const map = new Map();

  for (const set of sets) {
    if (!set.is_completed) continue;
    const oneRM = epley1RM(set.weight, set.reps);
    if (oneRM <= 0) continue;

    const existing = map.get(set.exercise_id);
    if (!existing || oneRM > existing.oneRM) {
      map.set(set.exercise_id, {
        exerciseId: set.exercise_id,
        exerciseName: set.exercise_name,
        weight: Number(set.weight),
        reps: Number(set.reps),
        oneRM: Math.round(oneRM * 10) / 10,
      });
    }
  }

  return [...map.values()].sort((a, b) => b.oneRM - a.oneRM);
};