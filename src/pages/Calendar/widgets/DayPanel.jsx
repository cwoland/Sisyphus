import { CheckCircle2, Circle, XCircle, RefreshCw, Dumbbell, Plus } from 'lucide-react';
import { clsx } from 'clsx';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Button } from '../../../shared/ui/Button.jsx';
import { EmptyState } from '../../../shared/ui/EmptyState.jsx';
import { emptyStates } from '../../../shared/lib/sisyphusPhrases.js';

const statusConfig = {
  planned: { icon: Circle, label: 'Запланирована', color: 'text-text-muted' },
  in_progress: { icon: Circle, label: 'В процессе', color: 'text-accent' },
  completed: { icon: CheckCircle2, label: 'Завершена', color: 'text-accent' },
  skipped: { icon: XCircle, label: 'Пропущена', color: 'text-crimson' },
};

export const DayPanel = ({ date, workouts, onOpenWorkout, onSync, onSetStatus, onAddWorkout, onStart }) => (
  <div className="rounded-2xl border border-border bg-surface p-4">
    <div className="mb-3 flex items-center justify-between">
    <h2 className="font-display text-lg font-semibold text-text">
      {format(date, 'd MMMM, EEEE', { locale: ru })}
    </h2>
    <button
    onClick={onAddWorkout}
    className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm text-accent hover:bg-surface-2">
      <Plus size={16} /> Тренировка
    </button>
    </div>

    {workouts.length === 0 ? (
      <EmptyState icon={Dumbbell} {...emptyStates.workouts} />
    ) : (
      <div className="space-y-3">
        {workouts.map((w) => {
          const cfg = statusConfig[w.status];
          const StatusIcon = cfg.icon;
          return (
            <div key={w.id} className="rounded-xl border border-border p-3">
              <div className="flex items-center justify-between">
                <button onClick={() => onOpenWorkout(w)} className="flex items-center gap-2 text-left">
                  <StatusIcon size={20} className={cfg.color} />
                  <div>
                    <p className="font-medium text-text">{w.title}</p>
                    <p className="text-xs text-text-muted">{cfg.label}</p>
                  </div>
                </button>

                {w.status === 'planned' && w.program_day_id && (
                  <button
                    onClick={() => onSync(w.id)}
                    className="rounded-lg p-2 text-text-muted hover:bg-surface-2 hover:text-accent"
                    aria-label="Синхронизировать с программой"
                  >
                    <RefreshCw size={16} />
                  </button>
                )}
              </div>

              <div className="mt-3 flex gap-2">
                {(w.status === 'planned' || w.status === 'in_progress') && (
                  <Button size="sm" onClick={() => onStart(w)}>
                    {w.status === 'in_progress' ? 'Продолжить' : 'Начать тренировку'}
                  </Button>
                )}
                <Button size="sm" variant="secondary" onClick={() => onOpenWorkout(w)}>
                  Открыть
                </Button>
                {w.status === 'planned' && (
                  <Button size="sm" variant="ghost" onClick={() => onSetStatus(w.id, 'skipped')}>
                    Пропустить
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    )}
  </div>
);