import { CalendarPlus, Trash2, Globe, Lock, Pencil, Copy } from 'lucide-react';
import { Button } from '../../../shared/ui/Button.jsx';
import { Skeleton } from '../../../shared/ui/Skeleton.jsx';
import { muscleGroupLabel } from '../../../entities/exercise/muscleGroups.js';
import { plural } from '../../../shared/lib/plural.js';

export const ProgramDetail = ({ program, isLoading, isOwner, onSchedule, onEdit, onDelete, onFork, isForking }) => {
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

  const totalExercises = program.days.reduce((sum, d) => sum + d.exercises.length, 0);

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center gap-2">
          <h2 className="min-w-0 font-display text-xl font-bold text-text">{program.title}</h2>
          {program.is_public
            ? <Globe size={16} className="shrink-0 text-terracotta-ink" aria-label="Публичная" />
            : <Lock size={16} className="shrink-0 text-text-muted" aria-label="Личная" />}
        </div>

        <p className="mt-1 font-display text-xs uppercase tracking-[0.1em] text-text-muted">
          {program.days.length} {plural(program.days.length, ['день', 'дня', 'дней'])}
          {totalExercises > 0 && ` · ${totalExercises} ${plural(totalExercises, ['упражнение', 'упражнения', 'упражнений'])}`}
        </p>

        {program.description && <p className="mt-2 text-sm text-text-muted">{program.description}</p>}
      </div>

      <div className="flex flex-wrap gap-2">
        {isOwner ? (
          <>
            <Button size="sm" onClick={() => onSchedule(program)}>
              <CalendarPlus size={16} /> В календарь
            </Button>
            <Button size="sm" variant="secondary" onClick={() => onEdit(program)}>
              <Pencil size={16} /> Изменить
            </Button>
            <Button
              size="sm" variant="ghost"
              className="text-danger hover:bg-danger/10"
              onClick={() => onDelete(program.id)}
            >
              <Trash2 size={16} /> Удалить
            </Button>
          </>
        ) : (
          <Button size="sm" onClick={() => onFork(program.id)} isLoading={isForking}>
            <Copy size={16} /> Скопировать себе
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {program.days.map((day, i) => (
          <div key={day.id} className="rounded-2xl border border-border bg-surface p-4">
            <div className="mb-3 flex items-baseline gap-2">
              <span className="font-display text-xs tabular-nums text-text-muted">{i + 1}</span>
              <h3 className="min-w-0 flex-1 font-display font-semibold text-text">{day.title}</h3>
            </div>

            <ol className="space-y-1.5">
              {day.exercises.map((ex) => (
                <li key={ex.id} className="flex items-center gap-3 rounded-lg bg-surface-2 px-3 py-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-text">{ex.exercise_name}</p>
                    <p className="text-xs text-text-muted">{muscleGroupLabel(ex.muscle_group)}</p>
                  </div>
                  <span className="shrink-0 font-display text-sm font-bold tabular-nums text-text">
                    {ex.target_sets}
                    <span className="font-normal text-text-muted">×{ex.target_reps}</span>
                  </span>
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>
    </div>
  );
};