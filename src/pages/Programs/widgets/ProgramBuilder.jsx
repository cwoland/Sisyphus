import { useState } from 'react';
import { Plus } from 'lucide-react';
import { clsx } from 'clsx';
import { Button } from '../../../shared/ui/Button.jsx';
import { Input } from '../../../shared/ui/Input.jsx';
import { inputVariants, idleBorder } from '../../../shared/ui/field.styles.js';
import { ExercisePicker } from '../../../features/exercise-picker/ExercisePicker.jsx';
import { DayCard, clampSets } from './builder/DayCard.jsx';
import { plural } from '../../../shared/lib/plural.js';

const AUTO_DAY = /^День \d+$/;

const emptyDay = () => ({ tempId: crypto.randomUUID(), title: '', exercises: [] });

const renumber = (list) =>
  list.map((day, i) => (AUTO_DAY.test(day.title.trim()) ? { ...day, title: `День ${i + 1}` } : day));

export const ProgramBuilder = ({ initial, submitLabel = 'Создать программу', onSubmit, isSubmitting, onCancel }) => {
  const [title, setTitle] = useState(initial?.title || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [isPublic, setIsPublic] = useState(initial?.isPublic ?? false);
  const [days, setDays] = useState(
    initial?.days?.length ? initial.days : [{ ...emptyDay(), title: 'День 1' }]
  );
  const [pickerForDay, setPickerForDay] = useState(null);
  const [errors, setErrors] = useState({});

  const patchDay = (tempId, patch) =>
    setDays((d) => d.map((day) => (day.tempId === tempId ? { ...day, ...patch } : day)));

  const addDay = () => setDays((d) => [...d, { ...emptyDay(), title: `День ${d.length + 1}` }]);

  const removeDay = (tempId) =>
    setDays((d) => renumber(d.filter((day) => day.tempId !== tempId)));

  const addExerciseToDay = (dayTempId, exercise) =>
    setDays((d) =>
      d.map((day) =>
        day.tempId === dayTempId
          ? {
              ...day,
              exercises: [
                ...day.exercises,
                {
                  tempId: crypto.randomUUID(),
                  exerciseId: exercise.id,
                  name: exercise.name,
                  muscleGroup: exercise.muscle_group,
                  targetSets: 3,
                  targetReps: '8-12',
                },
              ],
            }
          : day
      )
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

  const validate = () => {
    const errs = {};
    if (title.trim().length < 2) errs.title = 'Название минимум 2 символа';
    if (days.some((d) => d.title.trim().length === 0)) errs.days = 'У каждого дня должно быть название';
    else if (days.some((d) => d.exercises.length === 0)) errs.days = 'В каждом дне должно быть хотя бы одно упражнение';
    else if (days.some((d) => d.exercises.some((ex) => !(Number(ex.targetSets) >= 1)))) {
      errs.days = 'У каждого упражнения должен быть хотя бы один подход';
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
      days: days.map((day) => ({
        title: day.title.trim(),
        exercises: day.exercises.map((ex) => ({
          exerciseId: ex.exerciseId,
          targetSets: clampSets(ex.targetSets),
          targetReps: String(ex.targetReps).trim() || '8-12',
        })),
      })),
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
            canRemove={days.length > 1}
            onTitleChange={(tempId, value) => patchDay(tempId, { title: value })}
            onRemoveDay={removeDay}
            onReorder={(tempId, exercises) => patchDay(tempId, { exercises })}
            onUpdateExercise={updateExercise}
            onRemoveExercise={removeExercise}
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