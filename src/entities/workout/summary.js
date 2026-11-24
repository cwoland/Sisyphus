export function workoutSummary(workout, seconds = workout.elapsed_seconds) {
    const done = (workout.sets ?? []).filter((s) => s.is_completed && !s.is_skipped);
    const groups = new Map();
    let tonnage = 0;

    for (const set of done) {
        if (!groups.has(set.exercise_id)) {
            groups.set(set.exercise_id, {
                id: set.exercise_id,
                name: set.exercise_name,
                sets: [],
            });
        }
        groups.get(set.exercise_id).sets.push(set);
        tonnage += Number(set.weight ?? 0) * Number(set.reps ?? 0);
    }

    const duration = seconds == null ? '—' : [
        ...(seconds >= 3600 ? [Math.floor(seconds / 3600)] : []),
        Math.floor(seconds / 60) % 60,
        seconds % 60,
    ].map((v, i) => i ? String(v).padStart(2, '0') : String(v)).join(':');

    return {
        title: workout.title,
        duration,
        exercises: groups.size,
        sets: done.length,
        tonnage,
        groups: [...groups.values()],
    };
}