export const defaultSetPlan = () => ({
    mode: 'normal',
    restSec: 120,
    steps: [],
});

export const normalizeSetPlan = (plan) => ({
    ...defaultSetPlan(),
    ...plan,
    steps: (plan?.steps || []).map((s) => ({ ...s })),
});

export const programToBuilder = (program) => ({
    title: program.title,
    description: program.description || '',
    isPublic: program.is_public,
    kind: program.kind || 'strength',
    days: program.days.map((day) => ({
        id: day.id,
        tempId: crypto.randomUUID(),
        title: day.title,
        rounds: Math.max(
            1,
            ...day.exercises.map((ex) => ex.target_sets)
        ),
        exercises: day.exercises.map((ex) => ({
            tempId: crypto.randomUUID(),
            groupId: `${day.id}:${ex.group_index ?? ex.order_index}`,
            exerciseId: ex.exercise_id,
            name: ex.exercise_name || ex.name || 'Упражнение без названия',
            muscleGroup: ex.muscle_group,
            tracking: ex.tracking || 'weight_reps',
            targetSets: ex.target_sets,
            targetReps: ex.target_reps,
            notes: ex.notes,
            setPlan: normalizeSetPlan(ex.set_plan),
        })),
    })),
});

export const dayBlocks = (exercises) => {
    const blocks = [];

    for (const ex of exercises) {
        const last = blocks.at(-1);

        if (last?.id === ex.groupId) {
            last.exercises.push(ex);
        } else {
            blocks.push({
                id: ex.groupId,
                exercises: [ex],
            });
        }
    }

    return blocks;
};

export const serializeDays = (days) => days.map((day) => ({
  id: day.id,
  title: day.title.trim(),
  exercises: dayBlocks(day.exercises).flatMap(
    (block, groupIndex) => block.exercises.map((ex) => {
      const plan = normalizeSetPlan(ex.setPlan);
      const drop = plan.mode === 'drop';

      return {
        exerciseId: ex.exerciseId,
        groupIndex,
        notes: ex.notes ?? undefined,
        targetSets: drop ? 1 : Number(ex.targetSets),
        targetReps: drop
          ? String(plan.steps[0]?.reps ?? '')
          : String(ex.targetReps).trim(),
        setPlan: {
          mode: plan.mode,
          restSec: Number(plan.restSec),
          steps: drop
            ? plan.steps.map((s) => ({
                weight: Number(s.weight),
                reps: Number(s.reps),
              }))
            : [],
        },
      };
    })
  ),
}));

export const validateBuilder = (title, days, kind) => {
  if (
    title.trim().length < 2 ||
    title.trim().length > 150
  ) {
    return 'Название: от 2 до 150 символов';
  }

  for (const day of days) {
    if (
      !day.title.trim() ||
      day.title.trim().length > 150
    ) {
      return 'Проверьте названия дней';
    }

    if (!day.exercises.length) {
      return 'Добавьте упражнения в каждый день';
    }

    for (const block of dayBlocks(day.exercises)) {
      if (
        kind !== 'crossfit' &&
        block.exercises.length > 2
      ) {
        return 'Суперсет состоит из двух упражнений';
      }

      if (
        new Set(
          block.exercises.map((ex) => ex.exerciseId)
        ).size !== block.exercises.length
      ) {
        return 'В группе должны быть разные упражнения';
      }

      if (
        new Set(
          block.exercises.map((ex) => Number(ex.targetSets))
        ).size > 1
      ) {
        return 'У группы должно быть общее число раундов';
      }

      if (
        new Set(
          block.exercises.map(
            (ex) => Number(ex.setPlan.restSec)
          )
        ).size > 1
      ) {
        return 'У группы должен быть общий отдых';
      }

      for (const ex of block.exercises) {
        const p = normalizeSetPlan(ex.setPlan);

        if (
          String(p.restSec).trim() === '' ||
          !Number.isInteger(Number(p.restSec)) ||
          Number(p.restSec) < 0 ||
          Number(p.restSec) > 900
        ) {
          return 'Отдых: от 0 до 900 секунд';
        }

        if (p.mode === 'drop') {
          if (
            kind === 'crossfit' ||
            block.exercises.length !== 1 ||
            ex.tracking !== 'weight_reps'
          ) {
            return 'Дропсет доступен отдельному упражнению с весом';
          }

          if (
            p.steps.length < 2 ||
            p.steps.length > 10
          ) {
            return 'Дропсет: от 2 до 10 ступеней';
          }

          if (
            p.steps.some(
              (s) =>
                String(s.weight).trim() === '' ||
                !Number.isFinite(Number(s.weight)) ||
                Number(s.weight) < 0 ||
                Number(s.weight) > 9999 ||
                !Number.isInteger(Number(s.reps)) ||
                Number(s.reps) < 1 ||
                Number(s.reps) > 200
            )
          ) {
            return 'Укажите вес и 1–200 повторений каждой ступени';
          }
        } else {
          if (
            !Number.isInteger(Number(ex.targetSets)) ||
            Number(ex.targetSets) < 1 ||
            Number(ex.targetSets) > 20
          ) {
            return 'Подходов или раундов должно быть от 1 до 20';
          }

          if (
            !String(ex.targetReps).trim() ||
            String(ex.targetReps).length > 20
          ) {
            return 'Проверьте целевые повторения или время';
          }
        }
      }
    }
  }

  return null;
};