import { Trophy } from 'lucide-react';
import { EmptyState } from '../../../shared/ui/EmptyState.jsx';

export const BestResultCard = ({ records, limit = 5 }) => {
  const shown = (records || []).slice(0, limit);

  if (shown.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-4">
        <EmptyState
          icon={Trophy}
          title="Пока нет рекордов"
          description="Отметьте выполненные подходы и завершите тренировку — вершина запомнит ваш максимум."
        />
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <div className="mb-3 flex items-center gap-2">
        <Trophy size={18} className="shrink-0 text-gold-ink" />
        <h3 className="font-display font-semibold text-text">Лучший результат</h3>
        <span className="text-xs text-text-muted">расчётный 1ПМ</span>
      </div>

      <ol className="space-y-2">
        {shown.map((r) => (
          <li key={r.id} className="flex items-center gap-3 rounded-xl bg-surface-2 px-3 py-2">
            <span className="min-w-0 flex-1 truncate text-sm text-text">{r.exercise_name}</span>
            <span className="shrink-0 text-right">
              <span className="font-display font-bold tabular-nums text-text">
                {Math.round(Number(r.one_rm))} кг
              </span>
              <span className="ml-2 text-xs tabular-nums text-text-muted">
                {Number(r.weight)}×{r.reps}
              </span>
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
};