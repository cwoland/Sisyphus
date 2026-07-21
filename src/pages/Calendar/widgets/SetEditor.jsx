import { useState } from 'react';
import { Check, Trash2, Plus } from 'lucide-react';
import { clsx } from 'clsx';
import { epley1RM } from '../../../shared/lib/oneRepMax.js';


const SetRow = ({ set, index, onSave, onDelete, isSaving }) => {
  const [weight, setWeight] = useState(set.weight ?? '');
  const [reps, setReps] = useState(set.reps ?? '');
  const [completed, setCompleted] = useState(set.is_completed);

  const save = (nextCompleted = completed) => {
    onSave({
      setId: set.id,
      weight: weight === '' ? null : Number(weight),
      reps: reps === '' ? null : Number(reps),
      isCompleted: nextCompleted,
    });
  };

  const oneRM = epley1RM(weight, reps);

  return (
    <div className="flex items-center gap-2 rounded-xl border border-border bg-surface-2 p-2">
      <span className="w-6 text-center text-sm font-medium text-text-muted">{index + 1}</span>

      <input
        type="number"
        inputMode="decimal"
        value={weight}
        onChange={(e) => setWeight(e.target.value)}
        onBlur={() => save()}
        placeholder="кг"
        className="w-16 rounded-lg border border-border bg-surface px-2 py-1.5 text-center text-sm text-text focus:outline-none focus:ring-1 focus:ring-accent"
      />
      <span className="text-text-muted">×</span>
      <input
        type="number"
        inputMode="numeric"
        value={reps}
        onChange={(e) => setReps(e.target.value)}
        onBlur={() => save()}
        placeholder="повт"
        className="w-16 rounded-lg border border-border bg-surface px-2 py-1.5 text-center text-sm text-text focus:outline-none focus:ring-1 focus:ring-accent"
      />

      {oneRM > 0 && (
        <span className="hidden text-xs text-text-muted xs:inline">
          ≈{Math.round(oneRM)}
        </span>
      )}

      <button
        onClick={() => { setCompleted((c) => { const n = !c; save(n); return n; }); }}
        className={clsx(
          'ml-auto flex h-8 w-8 items-center justify-center rounded-lg transition-colors',
          completed ? 'bg-accent text-white' : 'bg-surface text-text-muted hover:text-text'
        )}
        aria-label={completed ? 'Отметить невыполненным' : 'Отметить выполненным'}
      >
        <Check size={16} />
      </button>

      <button
        onClick={() => onDelete(set.id)}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted hover:text-crimson"
        aria-label="Удалить подход"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
};

export const ExerciseSets = ({ exerciseId, exerciseName, sets, workoutId, onSaveSet, onDeleteSet, onAddSet }) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <h3 className="font-medium text-text">{exerciseName}</h3>
      <button
        onClick={() => onAddSet(exerciseId)}
        className="flex items-center gap-1 text-sm text-accent hover:text-accent-hover"
      >
        <Plus size={16} /> Подход
      </button>
    </div>
    <div className="space-y-2">
      {sets.map((set, i) => (
        <SetRow
          key={set.id}
          set={set}
          index={i}
          onSave={(data) => onSaveSet({ workoutId, ...data })}
          onDelete={(setId) => onDeleteSet({ workoutId, setId })}
        />
      ))}
    </div>
  </div>
);