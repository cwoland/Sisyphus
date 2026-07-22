import { CalendarPlus, Trash2, Globe, Lock, Pencil } from 'lucide-react';
import { Button } from '../../../shared/ui/Button.jsx';
import { Skeleton } from '../../../shared/ui/Skeleton.jsx';
import { muscleGroupLabel } from '../../../entities/exercise/muscleGroups.js';

export const ProgramDetail = ({ program, isLoading, onSchedule, onEdit, onDelete }) => {
  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }
  if (!program) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-display text-xl font-bold text-text">{program.title}</h2>
            {program.is_public
              ? <Globe size={16} className="text-accent" />
              : <Lock size={16} className="text-text-muted" />}
          </div>
          {program.description && <p className="mt-1 text-sm text-text-muted">{program.description}</p>}
        </div>
      </div>

      <div className="flex gap-2">
        <Button size="sm" onClick={() => onSchedule(program)}>
          <CalendarPlus size={16} /> В календарь
        </Button>
        <Button size="sm" variant="secondary" onClick={() => onEdit(program)}>
          <Pencil size={16} /> Изменить
        </Button>
        <Button size="sm" variant="ghost" onClick={() => onDelete(program.id)}>
          <Trash2 size={16} /> Удалить
        </Button>
      </div>

      <div className="space-y-3">
        {program.days.map((day) => (
          <div key={day.id} className="rounded-2xl border border-border bg-surface p-4">
            <h3 className="mb-2 font-medium text-text">{day.title}</h3>
            <div className="space-y-1.5">
              {day.exercises.map((ex) => (
                <div key={ex.id} className="flex items-center justify-between rounded-lg bg-surface-2 px-3 py-2">
                  <div>
                    <p className="text-sm text-text">{ex.exercise_name}</p>
                    <p className="text-xs text-text-muted">{muscleGroupLabel(ex.muscle_group)}</p>
                  </div>
                  <span className="text-sm text-text-muted">{ex.target_sets}×{ex.target_reps}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};