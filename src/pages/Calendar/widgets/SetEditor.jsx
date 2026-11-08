import { useEffect, useMemo, useState } from 'react';
import {
  Check,
  ChevronDown,
  Plus,
  Trash2,
  TrendingDown,
} from 'lucide-react';
import { clsx } from 'clsx';

import {
  formatDuration,
  trackingOf,
} from '../../../entities/exercise/tracking.js';

const inputClass =
  'h-11 w-full min-w-0 rounded-lg border border-border-strong bg-surface px-1.5 text-center text-base tabular-nums text-text focus:outline-none focus:ring-1 focus:ring-cta';

const iconButtonClass =
  'flex h-11 w-11 shrink-0 items-center justify-center rounded-lg transition-colors';

const actionClass =
  'inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg px-2 text-sm font-medium text-terracotta-ink hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-40';

const ROLE_LABELS = {
  normal: 'Обычный',
  warmup: 'Разминочный',
  failure: 'До отказа',
};

const SetRow = ({
  set,
  index,
  isDrop,
  onSave,
  onDelete,
}) => {
  const mode = trackingOf(set);
  const role = set.set_role || 'normal';

  const [duration, setDuration] = useState(
    set.duration_sec ?? ''
  );
  const [weight, setWeight] = useState(set.weight ?? '');
  const [reps, setReps] = useState(set.reps ?? '');

  useEffect(() => {
    setDuration(set.duration_sec ?? '');
    setWeight(set.weight ?? '');
    setReps(set.reps ?? '');
  }, [
    set.id,
    set.duration_sec,
    set.weight,
    set.reps,
  ]);

  const completed = Boolean(set.is_completed);

  const save = (nextCompleted = completed) => {
    const base = {
      setId: set.id,
      isCompleted: nextCompleted,
    };

    if (mode === 'duration') {
      onSave({
        ...base,
        weight: null,
        reps: null,
        durationSec:
          duration === '' ? null : Number(duration),
      });
      return;
    }

    onSave({
      ...base,

      // Для упражнений со своим весом сохраняем уже
      // существующий дополнительный вес, если он есть.
      weight:
        mode === 'reps'
          ? set.weight == null
            ? null
            : Number(set.weight)
          : weight === ''
            ? null
            : Number(weight),

      reps: reps === '' ? null : Number(reps),
      durationSec: null,
    });
  };

  const changeRole = (event) => {
    onSave({
      setId: set.id,
      setRole: event.target.value,
    });
  };

  return (
    <div
      className={clsx(
        'rounded-xl border p-2',
        isDrop
          ? 'ml-4 border-terracotta/30 bg-terracotta/5'
          : role === 'warmup'
            ? 'border-gold/40 bg-gold/5'
            : role === 'failure'
              ? 'border-danger/40 bg-danger/5'
              : 'border-border bg-surface-2'
      )}
    >
      <div className="grid min-w-0 grid-cols-[2.75rem_minmax(0,1fr)_2.75rem_2.75rem] items-center gap-1.5">
        {isDrop ? (
          <span
            className="flex h-11 w-11 items-center justify-center rounded-lg bg-terracotta/15 text-sm font-bold text-terracotta-ink"
            aria-label="Дропсет"
            title="Дропсет"
          >
            D
          </span>
        ) : (
          <span
            className={clsx(
              'relative flex h-11 w-11 items-center justify-center rounded-lg border text-sm font-bold focus-within:ring-1 focus-within:ring-cta',
              role === 'warmup'
                ? 'border-gold/40 bg-gold/15 text-fold-ink'
                : role === 'failure'
                  ? 'border-danger/40 bg-danger/10 text-danger'
                  : 'border-border bg-surface text-text-muted'
            )}
          >
            <span aria-hidden="true">
              {role === 'warmup'
                ? 'W'
                : role === 'failure'
                  ? 'F'
                  : 'N'}
            </span>

            <select 
              value={role}
              onChange={changeRole}
              aria-label={`Тип подхода ${index}`}
              title={ROLE_LABELS[role] || 'Подход'}
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            >
              <option value="normal">Подход</option>
              <option value="warmup">Разминочный</option>
              <option value="failure">До отказа</option>
            </select>
          </span>
        )}

        <div className="grid min-w-0 flex-1 grid-cols-2 gap-1.5 max-[400px]:col-span-3">
          {mode === 'duration' ? (
            <div className="col-span-2">
              <input
                type="number"
                inputMode="numeric"
                min="0"
                max="86400"
                step="1"
                value={duration}
                onChange={(event) =>
                  setDuration(event.target.value)
                }
                onBlur={() => save()}
                placeholder="Секунды"
                aria-label={
                  isDrop
                    ? 'Дроп: время в секундах'
                    : `Подход ${index}: время в секундах`
                }
                className={inputClass}
              />
            </div>
          ) : (
            <>
              {mode === 'weight_reps' ? (
                <input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  max="9999"
                  step="0.5"
                  value={weight}
                  onChange={(event) =>
                    setWeight(event.target.value)
                  }
                  onBlur={() => save()}
                  placeholder="кг"
                  aria-label={
                    isDrop
                      ? 'Дроп: вес'
                      : `Подход ${index}: вес`
                  }
                  className={inputClass}
                />
              ) : (
                <div className="flex h-11 items-center justify-center rounded-lg border border-border bg-surface text-xs text-text-muted">
                  Свой вес
                </div>
              )}

              <input
                type="number"
                inputMode="numeric"
                min="0"
                max="10000"
                step="1"
                value={reps}
                onChange={(event) =>
                  setReps(event.target.value)
                }
                onBlur={() => save()}
                placeholder="Повт."
                aria-label={
                  isDrop
                    ? 'Дроп: повторения'
                    : `Подход ${index}: повторения`
                }
                className={inputClass}
              />
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => save(!completed)}
          aria-label={
            completed
              ? 'Отметить подход невыполненным'
              : 'Отметить подход выполненным'
          }
          aria-pressed={completed}
          className={clsx(
            iconButtonClass,
            'max-[400px]:col-start-3 max-[400px]:row-start-2',
            completed
              ? 'bg-accent text-on-accent'
              : 'bg-surface text-text-muted hover:text-text'
          )}
        >
          <Check size={17} />
        </button>

        <button
          type="button"
          onClick={() => onDelete(set.id)}
          aria-label={
            isDrop
              ? 'Удалить дроп-подход'
              : `Удалить подход ${index}`
          }
          className={clsx(
            iconButtonClass,
            'max-[400px]:col-start-4 max-[400px]:row-start-2',
            'text-text-muted hover:bg-surface hover:text-danger'
          )}
        >
          <Trash2 size={17} />
        </button>
      </div>

      <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 pl-[2.875rem] text-xs text-text-muted">
        <span>
          {isDrop
            ? 'Дроп'
            : `${index} · ${ROLE_LABELS[role] || 'Обычный'}`}
        </span>

        {mode === 'duration' && duration !== '' && (
          <span>{formatDuration(duration)}</span>
        )}

        {set.rpe != null && (
          <span>RPE {Number(set.rpe)}</span>
        )}
      </div>
    </div>
  );
};

export const ExerciseSets = ({
  exerciseId,
  exerciseName,
  sets,
  workoutId,
  onSaveSet,
  onDeleteSet,
  onAddSet,
  onAddDrop,
}) => {
  const [expanded, setExpanded] = useState(true);

  const {
    parents,
    dropsByParent,
    orphanDrops,
  } = useMemo(() => {
    const parentSets = [];
    const children = new Map();
    const allIds = new Set(sets.map((set) => set.id));
    const orphans = [];

    for (const set of sets) {
      if (set.set_kind !== 'drop') {
        parentSets.push(set);
        continue;
      }

      if (
        !set.parent_set_id ||
        !allIds.has(set.parent_set_id)
      ) {
        orphans.push(set);
        continue;
      }

      const list = children.get(set.parent_set_id) || [];
      list.push(set);
      children.set(set.parent_set_id, list);
    }

    return {
      parents: parentSets,
      dropsByParent: children,
      orphanDrops: orphans,
    };
  }, [sets]);

  const mode = trackingOf(parents[0] || sets[0]);

  const lastParent = parents.at(-1);
  const lastDrop = lastParent
    ? (dropsByParent.get(lastParent.id) || []).at(-1)
    : null;

  const handleAddDrop = () => {
    if (!lastParent) return;

    const source = lastDrop || lastParent;

    onAddDrop({
      workoutId,
      exerciseId,
      exerciseName,
      parentSetId: lastParent.id,
      weight:
        source.weight == null
          ? null
          : Number(source.weight),
      reps:
        source.reps == null
          ? null
          : Number(source.reps),
      durationSec:
        source.duration_sec == null
          ? null
          : Number(source.duration_sec),
    });
  };

  return (
    <section
      aria-label={exerciseName}
      className="min-w-0 overflow-hidden rounded-2xl border border-border bg-surface"
    >
      <div className="flex items-center gap-2 p-4">
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          aria-expanded={expanded}
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
        >
          <ChevronDown
            size={18}
            className={clsx(
              'shrink-0 text-text-muted transition-transform',
              !expanded && '-rotate-90'
            )}
          />

          <span className="min-w-0 flex-1">
            <span className="block break-words font-semibold text-text">
              {exerciseName}
            </span>

            <span className="mt-1 block text-xs text-text-muted">
              {mode === 'duration'
                ? 'Время'
                : mode === 'reps'
                  ? 'Без веса'
                  : 'Вес и повторения'}
              {' · '}
              {parents.length} осн.
            </span>
          </span>
        </button>
      </div>

      {expanded && (
        <div className="space-y-3 border-t border-border p-3">
          {parents.length === 0 && orphanDrops.length === 0 ? (
            <p className="py-3 text-center text-sm text-text-muted">
              Подходов пока нет.
            </p>
          ) : (
            <div className="space-y-2">
              {parents.map((parent, index) => (
                <div key={parent.id} className="space-y-2">
                  <SetRow
                    set={parent}
                    index={index + 1}
                    isDrop={false}
                    onSave={(data) =>
                      onSaveSet({ workoutId, ...data })
                    }
                    onDelete={(setId) =>
                      onDeleteSet({ workoutId, setId })
                    }
                  />

                  {(dropsByParent.get(parent.id) || []).map(
                    (drop) => (
                      <SetRow
                        key={drop.id}
                        set={{
                          ...drop,
                          tracking:
                            drop.tracking || parent.tracking,
                        }}
                        index={index + 1}
                        isDrop
                        onSave={(data) =>
                          onSaveSet({ workoutId, ...data })
                        }
                        onDelete={(setId) =>
                          onDeleteSet({ workoutId, setId })
                        }
                      />
                    )
                  )}
                </div>
              ))}

              {orphanDrops.map((drop) => (
                <SetRow
                  key={drop.id}
                  set={drop}
                  index={0}
                  isDrop
                  onSave={(data) =>
                    onSaveSet({ workoutId, ...data })
                  }
                  onDelete={(setId) =>
                    onDeleteSet({ workoutId, setId })
                  }
                />
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-2 border-t border-border pt-2">
            <button
              type="button"
              onClick={() => onAddSet(exerciseId)}
              className={actionClass}
            >
              <Plus size={16} />
              Добавить подход
            </button>

            <button
              type="button"
              onClick={handleAddDrop}
              disabled={!lastParent}
              className={actionClass}
            >
              <TrendingDown size={16} />
              Добавить дроп
            </button>
          </div>
        </div>
      )}
    </section>
  );
};