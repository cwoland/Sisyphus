import { useState } from 'react';
import { Search, Plus, Dumbbell } from 'lucide-react';
import { clsx } from 'clsx';
import { Sheet } from '../../shared/ui/Sheet.jsx';
import { Button } from '../../shared/ui/Button.jsx';
import { useExercises, useCreateExercise } from '../../pages/Programs/programs.hooks.js';
import { muscleGroups, equipmentTypes, muscleGroupLabel } from '../../entities/exercise/muscleGroups.js';
import { Skeleton } from '../../shared/ui/Skeleton.jsx';

export const ExercisePicker = ({ isOpen, onClose, onPick }) => {
  const [search, setSearch] = useState('');
  const [group, setGroup] = useState(null);
  const [creating, setCreating] = useState(false);

  const { data: exercises, isLoading } = useExercises({
    ...(group && { muscleGroup: group }),
    ...(search && { search }),
  });

  return (
    <Sheet isOpen={isOpen} onClose={onClose} title="Выбрать упражнение">
      {creating ? (
        <NewExerciseForm onDone={() => setCreating(false)} onCreated={(ex) => { onPick(ex); onClose(); }} />
      ) : (
        <div className="space-y-3">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск упражнения"
              className="w-full rounded-xl border border-border bg-surface py-2.5 pl-10 pr-3 text-sm text-text focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            <FilterChip active={!group} onClick={() => setGroup(null)}>Все</FilterChip>
            {muscleGroups.map((g) => (
              <FilterChip key={g.value} active={group === g.value} onClick={() => setGroup(g.value)}>
                {g.label}
              </FilterChip>
            ))}
          </div>

          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : (
            <div className="space-y-1.5">
              {(exercises || []).map((ex) => (
                <button
                  key={ex.id}
                  onClick={() => { onPick(ex); onClose(); }}
                  className="flex w-full items-center gap-3 rounded-xl border border-border bg-surface p-3 text-left transition-colors hover:bg-surface-2"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10 text-accent">
                    <Dumbbell size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text">{ex.name}</p>
                    <p className="text-xs text-text-muted">{muscleGroupLabel(ex.muscle_group)}</p>
                  </div>
                </button>
              ))}
              {exercises?.length === 0 && (
                <p className="py-6 text-center text-sm text-text-muted">Ничего не найдено</p>
              )}
            </div>
          )}

          <Button variant="secondary" className="w-full" onClick={() => setCreating(true)}>
            <Plus size={18} /> Создать своё упражнение
          </Button>
        </div>
      )}
    </Sheet>
  );
};

const FilterChip = ({ active, children, ...props }) => (
  <button
    className={clsx(
      'shrink-0 rounded-full px-3 py-1.5 text-sm transition-colors',
      active ? 'bg-accent text-white' : 'bg-surface-2 text-text-muted hover:text-text'
    )}
    {...props}
  >
    {children}
  </button>
);

const NewExerciseForm = ({ onDone, onCreated }) => {
  const [name, setName] = useState('');
  const [muscleGroup, setMuscleGroup] = useState('chest');
  const [equipment, setEquipment] = useState('barbell');
  const createMutation = useCreateExercise();

  const submit = () => {
    if (name.trim().length < 2) return;
    createMutation.mutate(
      { name: name.trim(), muscleGroup, equipment },
      { onSuccess: (ex) => onCreated(ex) }
    );
  };

  return (
    <div className="space-y-3">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Название упражнения"
        className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text focus:outline-none focus:ring-1 focus:ring-accent"
      />
      <div className="grid grid-cols-2 gap-3">
        <select value={muscleGroup} onChange={(e) => setMuscleGroup(e.target.value)}
          className="rounded-xl border border-border bg-surface px-3 py-3 text-sm text-text focus:outline-none focus:ring-1 focus:ring-accent">
          {muscleGroups.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
        </select>
        <select value={equipment} onChange={(e) => setEquipment(e.target.value)}
          className="rounded-xl border border-border bg-surface px-3 py-3 text-sm text-text focus:outline-none focus:ring-1 focus:ring-accent">
          {equipmentTypes.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </div>
      <div className="flex gap-2">
        <Button variant="ghost" className="flex-1" onClick={onDone}>Назад</Button>
        <Button className="flex-1" onClick={submit} isLoading={createMutation.isPending}>Создать</Button>
      </div>
    </div>
  );
};