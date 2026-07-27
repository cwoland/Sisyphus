import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Flag, Check } from 'lucide-react';

import { useWorkoutDetails, useWorkoutMutations } from '../Calendar/calendar.hooks.js';
import { RestTimer } from '../../features/active-workout/RestTimer.jsx';
import { Skeleton } from '../../shared/ui/Skeleton.jsx';
import { Button } from '../../shared/ui/Button.jsx';
import { epley1RM } from '../../shared/lib/oneRepMax.js';
import { clsx } from 'clsx';
import { completionPhrases, pickRandom } from '../../shared/lib/sisyphusPhrases.js';
import { toast } from '../../shared/ui/toast/toast.store.js';

const REST_DEFAULT = 120;

const SetRow = ({ set, index, onSave, onRest }) => {
    const [weight, setWeight] = useState(set.weight ?? '');
    const [reps, setReps] = useState(set.reps ?? '');
    const [completed, setCompleted] = useState(set.is_completed);

    const save = (nextCompleted = completed) =>
        onSave({
            setId: set.id,
            weight: weight === '' ? null : Number(weight),
            reps: reps === '' ? null : Number(reps),
            isCompleted: nextCompleted,
        });

    const toggle = () => {
        setCompleted((c) => {
            const n = !c;
            save(n);
            if (n) onRest();
            return n;
        });
    };

    const oneRM = epley1RM(weight, reps);

    return (
        <div className={clsx('flex items-center gap-2 rounded-xl border p-2.5', completed ? 'border-accent/40 bg-accent/5' : 'border-border bg-surface-2')}>
            <span className="w-5 text-center text-sm font-medium text-text-muted">{index + 1}</span>
            <input 
                type="number" inputMode="decimal" value={weight}
                onChange={(e) => setWeight(e.target.value)} onBlur={() => save()}
                placeholder="кг"
                className="w-16 rounded-lg border border-border bg-surface px-2 py-2 text-center text-base text-text focus:outline-none focus:ring-1 focus:ring-accent" />
            <span className="text-text-muted">×</span>
            <input 
                type="number"
                inputMode="numeric" value={reps}
                onChange={(e) => setReps(e.target.value)} onBlur={() => save()}
                placeholder="повт"
                className="w-16 rounded-lg border border-border bg-surface px-2 py-2 text-center text-base text-text focus:outline-none focus:ring-1 focus:ring-accent" />
            {oneRM > 0 && <span className="hidden text-xs text-text-muted xs:inline">≈{Math.round(oneRm)}</span>}
            <button
                onClick={toggle}
                className={clsx('ml-auto flex h-10 w-10 items-center justify-center rounded-lg transition-colors',
                    completed ? 'bg-accent text-white' : 'bg-surface text-text-muted hover:text-text'
                )}
                aria-label="Выполнено">
                    <Check size={18} />
                </button>
        </div>
    );
};

export const ActiveWorkoutPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const detailsQuery = useWorkoutDetails(id);
  const { setMutation, statusMutation } = useWorkoutMutations();
  const [restKey, setRestKey] = useState(null);

  const sets = detailsQuery.data?.sets || [];
  const groups = [];
  const map = new Map();
  for (const s of sets) {
    if (!map.has(s.exercise_id)) { map.set(s.exercise_id, { id: s.exercise_id, name: s.exercise_name, sets: [] }); groups.push(map.get(s.exercise_id)); }
    map.get(s.exercise_id).sets.push(s);
  }

  const doneCount = sets.filter((s) => s.is_completed).length;
  const progress = sets.length ? Math.round((doneCount / sets.length) * 100) : 0;

  const finish = () => {
    statusMutation.mutate({ id, status: 'completed' }, {
      onSuccess: () => { toast.success(pickRandom(completionPhrases)); navigate('/'); },
    });
  };

  if (detailsQuery.isLoading) {
    return <div className="mx-auto max-w-2xl space-y-4 p-4"><Skeleton className="h-12 w-full" /><Skeleton className="h-40 w-full" /></div>;
  }

  return (
    <div className="min-h-[100dvh] bg-bg pb-32">
      <div className="sticky top-0 z-10 border-b border-border bg-surface/95 backdrop-blur pad-safe-top">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3">
          <button onClick={() => navigate('/')} className="rounded-lg p-1.5 text-text-muted hover:bg-surface-2" aria-label="Назад">
            <ChevronLeft size={22} />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="truncate font-display text-lg font-bold text-text">{detailsQuery.data?.title}</h1>
            <p className="text-xs text-text-muted">{doneCount} из {sets.length} подходов</p>
          </div>
          <Button size="sm" onClick={finish} isLoading={statusMutation.isPending}>
            <Flag size={16} /> Завершить
          </Button>
        </div>
        <div className="h-1 bg-surface-2">
          <div className="h-full bg-accent transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="mx-auto max-w-2xl space-y-6 px-4 py-4">
        {groups.map((g) => (
          <div key={g.id} className="space-y-2">
            <h2 className="font-medium text-text">{g.name}</h2>
            {g.sets.map((s, i) => (
              <SetRow
                key={s.id}
                set={s}
                index={i}
                onSave={(data) => setMutation.mutate({ workoutId: id, ...data })}
                onRest={() => setRestKey(Date.now())}
              />
            ))}
          </div>
        ))}
        {groups.length === 0 && (
          <p className="py-10 text-center text-sm text-text-muted">
            В этой тренировке нет упражнений. Добавьте их в календаре перед стартом.
          </p>
        )}
      </div>

      {restKey && <RestTimer key={restKey} initial={REST_DEFAULT} onClose={() => setRestKey(null)} />}
    </div>
  );
};