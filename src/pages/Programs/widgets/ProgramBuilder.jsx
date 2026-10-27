import { useState } from 'react';
import { Plus } from 'lucide-react';
import { clsx } from 'clsx';
import { Button } from '../../../shared/ui/Button.jsx';
import { Input } from '../../../shared/ui/Input.jsx';
import { inputVariants, idleBorder } from '../../../shared/ui/field.styles.js';
import { ExercisePicker } from '../../../features/exercise-picker/ExercisePicker.jsx';
import { DayCard } from './builder/DayCard.jsx';
import { clampSets } from './builder/clampSets.js';
import { PROGRAM_KINDS } from '../../../entities/program/programKinds.js';
import { plural } from '../../../shared/lib/plural.js';

const AUTO_DAY = /^День \d+$/;

const emptyDay = () => ({
  tempId: crypto.randomUUID(),
  title: '',
  rounds: 3,
  exercises: [],
});

const renumber = (list) =>
  list.map((day, i) => (AUTO_DAY.test(day.title.trim()) ? { ...day, title: `День ${i + 1}` } : day));

const groupIndexes = (exercises) => {
  const seen = new Map();
  return exercises.map((ex) => {
    if (!seen.has(ex.groupId)) seen.set(ex.groupId, seen.size);
    return seen.get(ex.groupId);
  });
};

export const ProgramBuilder = ({ initial, submitLabel = 'Создать программу', onSubmit, isSubmitting, onCancel }) => {
  const [title, setTitle] = useState(initial?.title || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [isPublic, setIsPublic] = useState(initial?.isPublic ?? false);
  const [kind, setKind] = useState(initial?.kind || 'strength');
  const [days, setDays] = useState(
    initial?.days?.length ? initial.days : [{ ...emptyDay(), title: 'День 1' }]
  );
  const [pickerForDay, setPickerForDay] = useState(null);
  const [errors, setErrors] = useState({});

  const isCircuit = kind === 'crossfit';

  const changeKind = (next) => {
    setKind(next);

    if (next !== 'crossfit') return;

    setDays((d) =>
      d.map((day) => {
        if (!day.exercises.length) return day;
        const groupId = day.exercises[0].groupId;
        const rounds = Number(day.rounds) || 1;
        return {
          ...day,
          exercises: day.exercises.map((ex) => ({ ...ex, groupId, targetSets: rounds })),
        };
      })
    );
  };

  const patchDay = (tempId, patch) =>
    setDays((d) => d.map((day) => (day.tempId === tempId ? { ...day, ...patch } : day)));

  const addDay = () => setDays((d) => [...d, { ...emptyDay(), title: `День ${d.length + 1}` }]);

  const removeDay = (tempId) =>
    setDays((d) => renumber(d.filter((day) => day.tempId !== tempId)));

  const addExerciseToDay = (dayTempId, exercise) =>
    setDays((d) =>
      d.map((day) => {
        if (day.tempId !== dayTempId) return day;

        const groupId = isCircuit
          ? day.exercises[0]?.groupId || crypto.randomUUID()
          : crypto.randomUUID();

        return {
          ...day,
          exercises: [
            ...day.exercises,
            {
              tempId: crypto.randomUUID(),
              groupId,
              exerciseId: exercise.id,
              name: exercise.name,
              muscleGroup: exercise.muscle_group,
              tracking: exercise.tracking,
              targetSets: isCircuit ? day.rounds : 3,
              targetReps: exercise.tracking === 'duration' ? '60' : '8-12',
            },
          ],
        };
      })
    );

  const updateExercise = (dayTempId, exTempId, patch) =>
    setDays((d) =>
      d.map((day) =>
        day.tempId === dayTempId
          ? { ...day, exercises: day.exercises.map((ex) => (ex.tempId === exTempId ? { ...ex, ...patch } : ex)) }
          : day
      )
    );

  const removeExercise = (dayTempId, exTempId) =>
    setDays((d) =>
      d.map((day) =>
        day.tempId === dayTempId
          ? { ...day, exercises: day.exercises.filter((ex) => ex.tempId !== exTempId) }
          : day
      )
    );

  const toggleLink = (dayTempId, exTempId) =>
    setDays((d) =>
      d.map((day) => {
        if (day.tempId !== dayTempId) return day;

        const i = day.exercises.findIndex((ex) => ex.tempId === exTempId);
        if (i < 1) return day;

        const self = day.exercises[i];
        const before = day.exercises[i - 1];
        const linked = self.groupId === before.groupId;

        return {
          ...day,
          exercises: day.exercises.map((ex) =>
            ex.tempId === exTempId
              ? { ...ex, groupId: linked ? crypto.randomUUID() : before.groupId }
              : ex
          ),
        };
      })
    );

  const setRounds = (dayTempId, rounds) =>
    setDays((d) =>
      d.map((day) =>
        day.tempId === dayTempId
          ? { ...day, rounds, exercises: day.exercises.map((ex) => ({ ...ex, targetSets: rounds })) }
          : day
      )
    );

  const validate = () => {
    const errs = {};
    if (title.trim().length < 2) errs.title = 'Название минимум 2 символа';
    else if (days.some((d) => d.title.trim().length === 0)) errs.days = 'У каждого дня должно быть название';
    else if (days.some((d) => d.exercises.length === 0)) errs.days = 'В каждом дне должно быть хотя бы одно упражнение';
    else if (days.some((d) => d.exercises.some((ex) => !(Number(ex.targetSets) >= 1)))) {
      errs.days = isCircuit
        ? 'Количество раундов должно быть не меньше одного'
        : 'У каждого упражнения должен быть хотя бы один подход';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    onSubmit({
      title: title.trim(),
      description: description.trim() || undefined,
      isPublic,
      kind,
      days: days.map((day) => {
        const indexes = groupIndexes(day.exercises);
        return {
          title: day.title.trim(),
          exercises: day.exercises.map((ex, i) => ({
            exerciseId: ex.exerciseId,
            targetSets: clampSets(ex.targetSets),
            targetReps: String(ex.targetReps).trim() || '8-12',
            groupIndex: indexes[i],
          })),
        };
      }),
    });
  };

  const totalExercises = days.reduce((sum, d) => sum + d.exercises.length, 0);

  return (
    <div className="space-y-5">
      <Input
        label="Название программы"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Например, Push/Pull/Legs"
        error={errors.title}
      />

      <div className="space-y-1.5">
        <p className="text-sm font-medium text-text">Тип программы</p>
        <div className="grid grid-cols-2 gap-2">
          {PROGRAM_KINDS.map((k) => {
            const Icon = k.icon;
            const active = kind === k.value;
            return (
              <button
                key={k.value}
                type="button"
                onClick={() => changeKind(k.value)}
                aria-pressed={active}
                className={clsx(
                  'flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition-colors',
                  active ? 'border-cta bg-cta/10' : 'border-border hover:bg-surface-2'
                )}
              >
                <Icon size={20} className={active ? 'text-terracotta-ink' : 'text-text-muted'} />
                <span className="text-sm font-medium text-text">{k.label}</span>
                <span className="text-xs text-text-muted">{k.hint}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="program-description" className="block text-sm font-medium text-text">
          Описание (необязательно)
        </label>
        <textarea
          id="program-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          placeholder="Кратко о целях и структуре"
          className={clsx(inputVariants.box, idleBorder.box)}
        />
      </div>

      <label className="flex items-center gap-3 rounded-xl border border-border bg-surface p-3">
        <input
          type="checkbox"
          checked={isPublic}
          onChange={(e) => setIsPublic(e.target.checked)}
          className="h-4 w-4 accent-[rgb(var(--cta))]"
        />
        <div>
          <p className="text-sm font-medium text-text">Публичная программа</p>
          <p className="text-xs text-text-muted">Другие смогут найти и скопировать её</p>
        </div>
      </label>

      <div className="flex items-baseline justify-between">
        <h3 className="font-display text-sm font-semibold uppercase tracking-[0.14em] text-text-muted">
          Дни
        </h3>
        <p className="text-xs text-text-muted">
          {days.length} {plural(days.length, ['день', 'дня', 'дней'])}
          {totalExercises > 0 && ` · ${totalExercises} ${plural(totalExercises, ['упражнение', 'упражнения', 'упражнений'])}`}
        </p>
      </div>

      <div className="space-y-4">
        {days.map((day) => (
          <DayCard
            key={day.tempId}
            day={day}
            isCircuit={isCircuit}
            canRemove={days.length > 1}
            onTitleChange={(tempId, value) => patchDay(tempId, { title: value })}
            onRoundsChange={setRounds}
            onRemoveDay={removeDay}
            onReorder={(tempId, exercises) => patchDay(tempId, { exercises })}
            onUpdateExercise={updateExercise}
            onRemoveExercise={removeExercise}
            onToggleLink={toggleLink}
            onAddExercise={setPickerForDay}
          />
        ))}
      </div>

      {errors.days && <p className="text-sm text-danger">{errors.days}</p>}

      <Button variant="secondary" className="w-full" onClick={addDay}>
        <Plus size={18} /> Добавить день
      </Button>

      <div className="flex gap-2 pt-2">
        <Button variant="ghost" className="flex-1" onClick={onCancel}>Отмена</Button>
        <Button className="flex-1" onClick={handleSubmit} isLoading={isSubmitting}>
          {submitLabel}
        </Button>
      </div>

      <ExercisePicker
        isOpen={!!pickerForDay}
        onClose={() => setPickerForDay(null)}
        onPick={(ex) => addExerciseToDay(pickerForDay, ex)}
      />
    </div>
  );
};
