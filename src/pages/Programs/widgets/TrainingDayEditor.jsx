import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  GripVertical,
  Plus,
  Trash2,
  Link2,
  Link2Off,
} from 'lucide-react';
import {
  dayBlocks,
  normalizeSetPlan,
} from '../../../entities/program/setPlan.js';
import { targetLabel } from '../../../entities/exercise/tracking.js';

const field =
  'w-full min-w-0 rounded-lg border border-border-strong bg-surface px-3 py-2 text-base text-text';

const action =
  'inline-flex min-h-11 items-center justify-center gap-1 rounded-lg px-3 py-2 text-sm text-accent hover:bg-surface-2';

const NumberField = ({
  label,
  value,
  onChange,
  min = 0,
  max = 900,
  step = 1,
}) => (
  <label className="block min-w-0 space-y-1 text-sm text-text-muted">
    <span>{label}</span>
    <input
      type="number"
      inputMode={step === 1 ? 'numeric' : 'decimal'}
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={field}
    />
  </label>
);

const SortableBlock = ({
  block,
  isCircuit,
  canMerge,
  onChange,
  onRemove,
  onMerge,
  onSplit,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: block.id });

  const first = block.exercises[0];
  const plan = normalizeSetPlan(first.setPlan);
  const paired = block.exercises.length === 2 && !isCircuit;
  const drop = plan.mode === 'drop';

  const patchExercise = (id, patch) => {
    onChange(
      block.exercises.map((ex) =>
        ex.tempId === id ? { ...ex, ...patch } : ex
      )
    );
  };

  const patchShared = (patch) => {
    onChange(
      block.exercises.map((ex) => ({ ...ex, ...patch }))
    );
  };

  const patchRest = (restSec) => {
    onChange(
      block.exercises.map((ex) => ({
        ...ex,
        setPlan: {
          ...normalizeSetPlan(ex.setPlan),
          restSec,
        },
      }))
    );
  };

  const patchSteps = (steps) => {
    patchExercise(first.tempId, {
      setPlan: { ...plan, steps },
    });
  };

  const setMode = (mode) => {
    patchExercise(first.tempId, {
      targetSets: mode === 'drop' ? 1 : 3,
      setPlan: {
        ...plan,
        mode,
        steps: mode === 'drop'
          ? [
              { weight: '', reps: 10 },
              { weight: '', reps: 10 },
            ]
          : [],
      },
    });
  };

  return (
    <section
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className="min-w-0 space-y-3 rounded-xl border border-border bg-surface-2 p-3"
    >
      <div className="flex items-center gap-2">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="touch-none rounded-lg p-2 text-text-muted"
          aria-label={`Перетащить ${paired ? 'суперсет' : first.name}`}
        >
          <GripVertical size={18} />
        </button>

        <p className="min-w-0 flex-1 font-semibold text-text">
          {isCircuit
            ? 'Круг'
            : paired
              ? 'Суперсет'
              : drop
                ? 'Дропсет'
                : 'Обычное упражнение'}
        </p>

        {paired && (
          <button
            type="button"
            className={action}
            onClick={onSplit}
          >
            <Link2Off size={16} /> Разделить
          </button>
        )}
      </div>

      {!isCircuit &&
        !paired &&
        (first.tracking || 'weight_reps') === 'weight_reps' && (
          <label className="block text-sm text-text-muted">
            Режим
            <select
              aria-label="Режим"
              value={plan.mode}
              onChange={(e) => setMode(e.target.value)}
              className={`${field} mt-1`}
            >
              <option value="normal">Обычные подходы</option>
              <option value="drop">Дропсет</option>
            </select>
          </label>
        )}

      <div className="grid grid-cols-2 gap-3">
        {!drop && (
          <NumberField
            label={paired || isCircuit ? 'Раундов' : 'Подходов'}
            value={first.targetSets}
            min={1}
            max={20}
            onChange={(targetSets) => patchShared({ targetSets })}
          />
        )}

        <NumberField
          label={
            paired || isCircuit
              ? 'Отдых после раунда, сек'
              : drop
                ? 'Отдых после серии, сек'
                : 'Отдых, сек'
          }
          value={plan.restSec}
          onChange={patchRest}
        />
      </div>

      {(paired || isCircuit || drop) && (
        <p className="text-sm text-terracotta-ink">
          {drop
            ? 'Все ступени подряд без отдыха.'
            : 'Упражнения раунда выполняются подряд без отдыха.'}
        </p>
      )}

      {block.exercises.map((ex, i) => (
        <div
          key={ex.tempId}
          className="space-y-2 rounded-lg border border-border bg-surface p-3"
        >
          <div className="flex items-start justify-between gap-2">
            <p className="min-w-0 break-words font-medium text-text">
              {paired || isCircuit ? `${i + 1}. ` : ''}
              {ex.name}
            </p>

            <button
              type="button"
              onClick={() => onRemove(ex.tempId)}
              className="shrink-0 rounded-lg p-2 text-danger"
              aria-label={`Убрать ${ex.name}`}
            >
              <Trash2 size={16} />
            </button>
          </div>

          {!drop && (
            <label className="block space-y-1 text-sm text-text-muted">
              <span>{targetLabel(ex.tracking)}</span>
              <input
                value={ex.targetReps}
                onChange={(e) =>
                  patchExercise(ex.tempId, {
                    targetReps: e.target.value,
                  })
                }
                className={field}
                placeholder={ex.tracking === 'duration' ? '60' : '8-12'}
              />
            </label>
          )}

          <label className="block space-y-1 text-sm text-text-muted">
            <span>Заметка к упражнению</span>
            <input
              value={ex.notes || ''}
              onChange={(e) =>
                patchExercise(ex.tempId, {
                  notes: e.target.value,
                })
              }
              className={field}
            />
          </label>
        </div>
      ))}

      {drop && (
        <div className="space-y-3">
          {plan.steps.map((step, i) => (
            <div
              key={i}
              className="grid grid-cols-[1.25rem_minmax(0,1fr)_minmax(0,1fr)_2.5rem] items-end gap-2"
            >
              <span className="pb-3 text-sm text-text-muted">
                {i + 1}
              </span>

              <NumberField
                label="Вес, кг"
                value={step.weight}
                max={9999}
                step={0.5}
                onChange={(weight) =>
                  patchSteps(
                    plan.steps.map((s, n) =>
                      n === i ? { ...s, weight } : s
                    )
                  )
                }
              />

              <NumberField
                label="Повторы"
                value={step.reps}
                min={1}
                max={200}
                onChange={(reps) =>
                  patchSteps(
                    plan.steps.map((s, n) =>
                      n === i ? { ...s, reps } : s
                    )
                  )
                }
              />

              <button
                type="button"
                disabled={plan.steps.length <= 2}
                className="min-h-11 rounded-lg text-danger disabled:opacity-30"
                onClick={() =>
                  patchSteps(
                    plan.steps.filter((_, n) => n !== i)
                  )
                }
                aria-label={`Удалить ступень ${i + 1}`}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}

          <button
            type="button"
            disabled={plan.steps.length >= 10}
            className={action}
            onClick={() =>
              patchSteps([
                ...plan.steps,
                { ...plan.steps.at(-1) },
              ])
            }
          >
            <Plus size={16} /> Добавить ступень
          </button>
        </div>
      )}

      {canMerge && (
        <button
          type="button"
          className={action}
          onClick={onMerge}
        >
          <Link2 size={16} />
          Суперсет со следующим упражнением
        </button>
      )}
    </section>
  );
};

export const TrainingDayEditor = ({
  day,
  isCircuit,
  canRemove,
  onChange,
  onRemove,
  onAddExercise,
}) => {
  const blocks = dayBlocks(day.exercises);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    })
  );

  const replaceBlock = (id, exercises) => {
    onChange({
      ...day,
      exercises: blocks.flatMap((b) =>
        b.id === id ? exercises : b.exercises
      ),
    });
  };

  const removeExercise = (id) => {
    onChange({
      ...day,
      exercises: day.exercises.filter(
        (ex) => ex.tempId !== id
      ),
    });
  };

  const merge = (index) => {
    const a = blocks[index];
    const b = blocks[index + 1];
    const first = a.exercises[0];

    replaceBlock(
      b.id,
      b.exercises.map((ex) => ({
        ...ex,
        groupId: a.id,
        targetSets: first.targetSets,
        setPlan: {
          ...normalizeSetPlan(ex.setPlan),
          restSec: first.setPlan.restSec,
        },
      }))
    );
  };

  return (
    <section className="min-w-0 space-y-4 rounded-2xl border border-border bg-surface p-4">
      <div className="flex items-center gap-2">
        <input
          value={day.title}
          onChange={(e) =>
            onChange({ ...day, title: e.target.value })
          }
          aria-label="Название дня"
          className={field}
        />

        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="p-2 text-danger"
            aria-label="Удалить день"
          >
            <Trash2 size={18} />
          </button>
        )}
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={({ active, over }) => {
          if (!over || active.id === over.id) return;

          const from = blocks.findIndex(
            (b) => b.id === active.id
          );
          const to = blocks.findIndex(
            (b) => b.id === over.id
          );

          if (from >= 0 && to >= 0) {
            onChange({
              ...day,
              exercises: arrayMove(blocks, from, to).flatMap(
                (b) => b.exercises
              ),
            });
          }
        }}
      >
        <SortableContext
          items={blocks.map((b) => b.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {blocks.map((block, i) => {
              const next = blocks[i + 1];

              const canMerge =
                !isCircuit &&
                block.exercises.length === 1 &&
                next?.exercises.length === 1 &&
                block.exercises[0].setPlan.mode === 'normal' &&
                next.exercises[0].setPlan.mode === 'normal' &&
                block.exercises[0].exerciseId !==
                  next.exercises[0].exerciseId;

              return (
                <SortableBlock
                  key={block.id}
                  block={block}
                  isCircuit={isCircuit}
                  canMerge={canMerge}
                  onChange={(exercises) =>
                    replaceBlock(block.id, exercises)
                  }
                  onRemove={removeExercise}
                  onMerge={() => merge(i)}
                  onSplit={() =>
                    replaceBlock(
                      block.id,
                      block.exercises.map((ex) => ({
                        ...ex,
                        groupId: crypto.randomUUID(),
                      }))
                    )
                  }
                />
              );
            })}
          </div>
        </SortableContext>
      </DndContext>

      <button
        type="button"
        className={`${action} w-full border border-dashed border-border`}
        onClick={onAddExercise}
      >
        <Plus size={16} /> Добавить упражнение
      </button>
    </section>
  );
};