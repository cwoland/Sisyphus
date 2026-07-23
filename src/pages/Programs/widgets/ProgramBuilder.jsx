import { useState } from 'react';
import { Plus, Trash2, GripVertical, X } from 'lucide-react';
import { clsx } from 'clsx';
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors,
} from '@dnd-kit/core';
import {
  SortableContext, verticalListSortingStrategy, useSortable, arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '../../../shared/ui/Button.jsx';
import { Input } from '../../../shared/ui/Input.jsx';
import { ExercisePicker } from '../../../features/exercise-picker/ExercisePicker.jsx';
import { muscleGroupLabel } from '../../../entities/exercise/muscleGroups.js';

const emptyDay = () => ({ tempId: crypto.randomUUID(), title: '', exercises: [] });

const SortableExercise = ({ ex, dayTempId, onUpdate, onRemove }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: ex.tempId });

  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={clsx(
        'rounded-xl border border-border bg-surface-2 p-3',
        isDragging && 'relative z-10 opacity-80 shadow-lg'
      )}
    >
      <div className="mb-2 flex items-center gap-2">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="shrink-0 cursor-grab touch-none rounded-lg p-1 text-text-muted hover:text-text active:cursor-grabbing"
          aria-label="Перетащить"
        >
          <GripVertical size={16} />
        </button>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-text">{ex.name}</p>
          <p className="text-xs text-text-muted">{muscleGroupLabel(ex.muscleGroup)}</p>
        </div>

        <button
          onClick={() => onRemove(dayTempId, ex.tempId)}
          className="shrink-0 text-text-muted hover:text-crimson"
          aria-label="Убрать"
        >
          <X size={16} />
        </button>
      </div>

      <div className="flex gap-2">
        <div className="flex-1">
          <label className="text-xs text-text-muted">Подходы</label>
          <input
            type="number" min="1" max="20"
            value={ex.targetSets}
            onChange={(e) => onUpdate(dayTempId, ex.tempId, { targetSets: e.target.value })}
            className="w-full rounded-lg border border-border bg-surface px-2 py-1.5 text-center text-sm text-text focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>
        <div className="flex-1">
          <label className="text-xs text-text-muted">Повторы</label>
          <input
            value={ex.targetReps}
            onChange={(e) => onUpdate(dayTempId, ex.tempId, { targetReps: e.target.value })}
            placeholder="8-12"
            className="w-full rounded-lg border border-border bg-surface px-2 py-1.5 text-center text-sm text-text focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>
      </div>
    </div>
  );
};

export const ProgramBuilder = ({ initial, submitLabel = 'Создать программу', onSubmit, isSubmitting, onCancel }) => {
  const [title, setTitle] = useState(initial?.title || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [isPublic, setIsPublic] = useState(initial?.isPublic ?? false);
  const [days, setDays] = useState(
    initial?.days?.length
    ? initial.days
    : [{ ...emptyDay(), title: 'День 1' }]
  );
  const [pickerForDay, setPickerForDay] = useState(null);
  const [errors, setErrors] = useState({});
  const sensors = useSensors(
    useSensors(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragEnd = (dayTempId, event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setDays((d) =>
      d.map((day) => {
        if (day.tempId !== dayTempId) return day;
        const from = day.exercises.findIndex((ex) => ex.tempId === active.id);
        const to = day.exercises.findIndex((ex) => ex.tempId === over.id);
        return { ...day, exercises: arrayMove(day.exercises, from, to) };
      })
    );
  };

  const addDay = () =>
    setDays((d) => [...d, { ...emptyDay(), title: `День ${d.length + 1}` }]);

  const removeDay = (tempId) =>
    setDays((d) => d.filter((day) => day.tempId !== tempId));

  const updateDayTitle = (tempId, value) =>
    setDays((d) => d.map((day) => (day.tempId === tempId ? { ...day, title: value } : day)));

  const addExerciseToDay = (dayTempId, exercise) => {
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
  };

  const updateExercise = (dayTempId, exTempId, patch) => {
    setDays((d) =>
      d.map((day) =>
        day.tempId === dayTempId
          ? {
              ...day,
              exercises: day.exercises.map((ex) =>
                ex.tempId === exTempId ? { ...ex, ...patch } : ex
              ),
            }
          : day
      )
    );
  };

  const removeExercise = (dayTempId, exTempId) => {
    setDays((d) =>
      d.map((day) =>
        day.tempId === dayTempId
          ? { ...day, exercises: day.exercises.filter((ex) => ex.tempId !== exTempId) }
          : day
      )
    );
  };

  const validate = () => {
    const errs = {};
    if (title.trim().length < 2) errs.title = 'Название минимум 2 символа';
    if (days.some((d) => d.exercises.length === 0)) errs.days = 'В каждом дне должно быть хотя бы одно упражнение';
    if (days.some((d) => d.title.trim().length === 0)) errs.days = 'У каждого дня должно быть название';
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
          targetSets: Number(ex.targetSets),
          targetReps: ex.targetReps,
        })),
      })),
    });
  };

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
        <label className="block text-sm font-medium text-text">Описание (необязательно)</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          placeholder="Кратко о целях и структуре"
          className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent"
        />
      </div>

      <label className="flex items-center gap-3 rounded-xl border border-border bg-surface p-3">
        <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)}
          className="h-4 w-4 accent-[rgb(var(--accent))]" />
        <div>
          <p className="text-sm font-medium text-text">Публичная программа</p>
          <p className="text-xs text-text-muted">Другие смогут найти и скопировать её</p>
        </div>
      </label>

      <div className="space-y-4">
        {days.map((day, dayIdx) => (
          <div key={day.tempId} className="rounded-2xl border border-border bg-surface p-4">
            <div className="mb-3 flex items-center gap-2">
              <input
                value={day.title}
                onChange={(e) => updateDayTitle(day.tempId, e.target.value)}
                className="flex-1 rounded-lg bg-surface-2 px-3 py-2 text-sm font-medium text-text focus:outline-none focus:ring-1 focus:ring-accent"
              />
              {days.length > 1 && (
                <button onClick={() => removeDay(day.tempId)} className="rounded-lg p-2 text-text-muted hover:text-crimson" aria-label="Удалить день">
                  <Trash2 size={16} />
                </button>
              )}
            </div>

            <div className="space-y-2">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={(e) => handleDragEnd(day.tempId, e)}
              >
                <SortableContext
                  items={day.exercises.map((ex) => ex.tempId)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2">
                    {day.exercises.map((ex) => (
                      <SortableExercise
                        key={ex.tempId}
                        ex={ex}
                        dayTempId={day.tempId}
                        onUpdate={updateExercise}
                        onRemove={removeExercise}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>

              <button
                onClick={() => setPickerForDay(day.tempId)}
                className="flex w-full items-center justify-center gap-1 rounded-xl border border-dashed border-border py-2.5 text-sm text-text-muted hover:border-accent hover:text-accent"
              >
                <Plus size={16} /> Добавить упражнение
              </button>
            </div>
          </div>
        ))}
      </div>

      {errors.days && <p className="text-sm text-crimson">{errors.days}</p>}

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