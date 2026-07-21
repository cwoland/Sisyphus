import { Trophy } from 'lucide-react';
import { bestSetsByExercise } from '../../../shared/lib/oneRepMax.js';
import { EmptyState } from '../../../shared/ui/EmptyState.jsx';

export const BestResultCard = ({ sets }) => {
  const best = bestSetsByExercise(sets);

  if (best.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-4">
        <EmptyState
          icon={Trophy}
          title="Пока нет рекордов"
          description="Отметьте выполненные подходы — и вершина покажет ваш максимум."
        />
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <div className="mb-3 flex items-center gap-2">
        <Trophy size={18} className="text-accent" />
        <h3 className="font-display font-semibold text-text">Лучший результат</h3>
        <span className="text-xs text-text-muted">расчётный 1ПМ</span>
      </div>
      <div className="space-y-2">
        {best.map((b) => (
          <div key={b.exerciseId} className="flex items-center justify-between rounded-xl bg-surface-2 px-3 py-2">
            <span className="text-sm text-text">{b.exerciseName}</span>
            <div className="text-right">
              <span className="font-display font-bold text-text">{b.oneRM} кг</span>
              <span className="ml-2 text-xs text-text-muted">{b.weight}×{b.reps}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};