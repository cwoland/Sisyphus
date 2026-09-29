import { Plus, Trash2, GripVertical, X } from 'lucide-react';
import { clsx } from 'clsx';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { muscleGroupLabel } from '../../../../entities/exercise/muscleGroups.js';
import { plural } from '../../../../shared/lib/plural.js';

export const clampSets = (v) => Math.min(20, Math.max(1, Math.round(Number(v) || 3)));

const numberField =
  'w-full rounded-lg border border-border-strong bg-surface px-2 py-1.5 text-center text-sm text-text transition-colors focus:border-cta focus:outline-none';

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
          aria-label={`Перетащить: ${ex.name}`}
        >
          <GripVertical size={16} />
        </button>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-text">{ex.name}</p>
          <p className="text-xs text-text-muted">{muscleGroupLabel(ex.muscleGroup)}</p>
        </div>

        <button
          type="button"
          onClick={() => onRemove(dayTempId, ex.tempId)}
          className="shrink-0 rounded-lg p-1 text-text-muted hover:text-danger"
          aria-label={`Убрать: ${ex.name}`}
        >
          <X size={16} />
        </button>
      </div>

      <div className="flex gap-2">
        <div className="flex-1">
          <label className="text-xs text-text-muted" htmlFor={`sets-${ex.tempId}`}>Подходы</label>
          <input
            id={`sets-${ex.tempId}`}
            type="number" inputMode="numeric" min="1" max="20"
            value={ex.targetSets}
            onChange={(e) => onUpdate(dayTempId, ex.tempId, { targetSets: e.target.value })}
            onBlur={() => onUpdate(dayTempId, ex.tempId, { targetSets: clampSets(ex.targetSets) })}
            className={numberField}
          />
        </div>
        <div className="flex-1">
          <label className="text-xs text-text-muted" htmlFor={`reps-${ex.tempId}`}>Повторы</label>
          <input
            id={`reps-${ex.tempId}`}
            value={ex.targetReps}
            onChange={(e) => onUpdate(dayTempId, ex.tempId, { targetReps: e.target.value })}
            onBlur={() => onUpdate(dayTempId, ex.tempId, { targetReps: ex.targetReps.trim() || '8-12' })}
            placeholder="8-12"
            className={numberField}
          />
        </div>
      </div>
    </div>
  );
};

export const DayCard = ({ day, canRemove, onTitleChange, onRemoveDay, onReorder, onUpdateExercise, onRemoveExercise, onAddExercise }) => {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const count = day.exercises.length;

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;
    const from = day.exercises.findIndex((ex) => ex.tempId === active.id);
    const to = day.exercises.findIndex((ex) => ex.tempId === over.id);
    if (from === -1 || to === -1) return;
    onReorder(day.tempId, arrayMove(day.exercises, from, to));
  };

  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <div className="mb-1 flex items-center gap-2">
        <input
          value={day.title}
          onChange={(e) => onTitleChange(day.tempId, e.target.value)}
          placeholder="Название дня"
          aria-label="Название дня"
          className="min-w-0 flex-1 rounded-lg border border-border-strong bg-surface-2 px-3 py-2 text-sm font-medium text-text transition-colors focus:border-cta focus:outline-none"
        />
        {canRemove && (
          <button
            type="button"
            onClick={() => onRemoveDay(day.tempId)}
            className="shrink-0 rounded-lg p-2 text-text-muted hover:text-danger"
            aria-label={`Удалить день: ${day.title || 'без названия'}`}
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      <p className="mb-3 text-xs text-text-muted">
        {count
          ? `${count} ${plural(count, ['упражнение', 'упражнения', 'упражнений'])}`
          : 'Пока пусто'}
      </p>

      <div className="space-y-2">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={day.exercises.map((ex) => ex.tempId)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {day.exercises.map((ex) => (
                <SortableExercise
                  key={ex.tempId}
                  ex={ex}
                  dayTempId={day.tempId}
                  onUpdate={onUpdateExercise}
                  onRemove={onRemoveExercise}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        <button
          type="button"
          onClick={() => onAddExercise(day.tempId)}
          className="flex min-h-[44px] w-full items-center justify-center gap-1 rounded-xl border border-dashed border-border text-sm text-text-muted transition-colors hover:border-cta hover:text-text"
        >
          <Plus size={16} /> Добавить упражнение
        </button>
      </div>
    </div>
  );
};