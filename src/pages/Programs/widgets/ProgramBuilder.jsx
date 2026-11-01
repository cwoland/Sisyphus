import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '../../../shared/ui/Button.jsx';
import { Input } from '../../../shared/ui/Input.jsx';
import { ExercisePicker } from '../../../features/exercise-picker/ExercisePicker.jsx';
import { PROGRAM_KINDS } from '../../../entities/program/programKinds.js';
import {
  defaultSetPlan,
  normalizeSetPlan,
  serializeDays,
  validateBuilder,
} from '../../../entities/program/setPlan.js';
import { TrainingDayEditor } from './TrainingDayEditor.jsx';

const newDay = (n) => ({
  tempId: crypto.randomUUID(),
  title: `День ${n}`,
  exercises: [],
});

export const ProgramBuilder = ({
  initial,
  submitLabel = 'Создать программу',
  onSubmit,
  isSubmitting,
  onCancel,
}) => {
  const [title, setTitle] = useState(initial?.title || '');
  const [description, setDescription] = useState(
    initial?.description || ''
  );
  const [isPublic, setIsPublic] = useState(
    initial?.isPublic ?? false
  );
  const [kind, setKind] = useState(
    initial?.kind || 'strength'
  );

  const [days, setDays] = useState(() =>
    initial?.days?.length
      ? initial.days.map((day) => ({
          ...day,
          exercises: day.exercises.map((ex) => ({
            ...ex,
            setPlan: normalizeSetPlan(ex.setPlan),
          })),
        }))
      : [newDay(1)]
  );

  const [pickerDay, setPickerDay] = useState(null);
  const [error, setError] = useState(null);
  const isCircuit = kind === 'crossfit';

  const changeKind = (next) => {
    if (next === kind) return;

    if (
      next === 'crossfit' &&
      days.some((d) =>
        d.exercises.some(
          (ex) => ex.setPlan.mode === 'drop'
        )
      ) &&
      !window.confirm(
        'В круговой программе дропсеты заменятся обычными упражнениями. Продолжить?'
      )
    ) {
      return;
    }

    setKind(next);

    setDays((list) =>
      list.map((day) => {
        const groupId = crypto.randomUUID();

        const rounds =
          day.exercises.find(
            (ex) => ex.setPlan.mode !== 'drop'
          )?.targetSets || 3;

        const restSec =
          day.exercises[0]?.setPlan.restSec ?? 120;

        return {
          ...day,
          exercises: day.exercises.map((ex) => ({
            ...ex,
            groupId:
              next === 'crossfit'
                ? groupId
                : crypto.randomUUID(),
            targetSets: rounds,
            setPlan: {
              ...defaultSetPlan(),
              restSec,
            },
          })),
        };
      })
    );
  };

  const addExercise = (exercise) => {
    setDays((list) =>
      list.map((day) => {
        if (day.tempId !== pickerDay) return day;

        const first = day.exercises[0];

        return {
          ...day,
          exercises: [
            ...day.exercises,
            {
              tempId: crypto.randomUUID(),
              groupId:
                isCircuit && first
                  ? first.groupId
                  : crypto.randomUUID(),
              exerciseId: exercise.id,
              name: exercise.name,
              tracking: exercise.tracking || 'weight_reps',
              muscleGroup: exercise.muscle_group,
              targetSets:
                isCircuit && first ? first.targetSets : 3,
              targetReps:
                exercise.tracking === 'duration'
                  ? '60'
                  : '8-12',
              setPlan: {
                ...defaultSetPlan(),
                restSec:
                  isCircuit && first
                    ? first.setPlan.restSec
                    : 120,
              },
            },
          ],
        };
      })
    );

    setPickerDay(null);
  };

  const submit = () => {
    const message = validateBuilder(title, days, kind);
    setError(message);

    if (message) return;

    onSubmit({
      title: title.trim(),
      description: description.trim() || undefined,
      isPublic,
      kind,
      days: serializeDays(days),
    });
  };

  return (
    <div className="space-y-5">
      <Input
        id="program-title"
        label="Название программы"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <div className="grid grid-cols-2 gap-2">
        {PROGRAM_KINDS.map((item) => (
          <button
            key={item.value}
            type="button"
            aria-pressed={kind === item.value}
            onClick={() => changeKind(item.value)}
            className={`rounded-xl border p-3 text-left text-sm ${
              kind === item.value
                ? 'border-cta bg-cta/10 text-text'
                : 'border-border text-text-muted'
            }`}
          >
            {item.label}
            <span className="mt-1 block text-xs">
              {item.hint}
            </span>
          </button>
        ))}
      </div>

      <label className="block space-y-1 text-sm text-text-muted">
        <span>Описание</span>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="w-full rounded-xl border border-border-strong bg-surface p-3 text-base text-text"
        />
      </label>

      <label className="flex items-center gap-3 text-sm text-text">
        <input
          type="checkbox"
          checked={isPublic}
          onChange={(e) => setIsPublic(e.target.checked)}
        />
        Публичная программа
      </label>

      {days.map((day) => (
        <TrainingDayEditor
          key={day.tempId}
          day={day}
          isCircuit={isCircuit}
          canRemove={days.length > 1}
          onChange={(updated) =>
            setDays((list) =>
              list.map((d) =>
                d.tempId === day.tempId ? updated : d
              )
            )
          }
          onRemove={() =>
            setDays((list) =>
              list.filter((d) => d.tempId !== day.tempId)
            )
          }
          onAddExercise={() => setPickerDay(day.tempId)}
        />
      ))}

      <Button
        variant="secondary"
        className="w-full"
        onClick={() =>
          setDays((list) => [
            ...list,
            newDay(list.length + 1),
          ])
        }
      >
        <Plus size={16} /> Добавить день
      </Button>

      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <Button variant="ghost" onClick={onCancel}>
          Отмена
        </Button>
        <Button
          className="flex-1"
          onClick={submit}
          isLoading={isSubmitting}
        >
          {submitLabel}
        </Button>
      </div>

      <ExercisePicker
        isOpen={!!pickerDay}
        onClose={() => setPickerDay(null)}
        onPick={addExercise}
      />
    </div>
  );
};