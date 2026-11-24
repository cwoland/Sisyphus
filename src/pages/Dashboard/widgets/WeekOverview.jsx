import { useQuery } from '@tanstack/react-query';
import { api } from '../../../shared/lib/axios.js';
import { weekRange } from '../../../shared/lib/date.js';
import { muscleGroupLabel } from '../../../entities/exercise/muscleGroups.js';
import { useAuthStore } from '../../../entities/user/auth.store.js';

export function WeekOverview() {
  const userId = useAuthStore((s) => s.user?.id);
  const { from } = weekRange();
  const query = useQuery({
    queryKey: ['stats', 'week', userId, from],
    enabled: Boolean(userId),
    queryFn: async () => (await api.get('/stats/week', { params: { date: from } })).data,
  });

  if (!query.data) {
    return <div role="status" className="mt-4 text-sm text-text-muted">
      {query.isError
        ? <button onClick={() => query.refetch()}>Не удалось загрузить обзор. Повторить</button>
        : 'Загружаем обзор…'}
    </div>;
  }

  const { sets, tonnage, muscles, heaviest } = query.data;
  return (
    <section aria-label="Нагрузка за неделю" className="mt-4 space-y-3 border-t border-border pt-4">
      {sets ? (
        <>
          <dl className="grid grid-cols-2 gap-2">
            <div><dt className="text-xs text-text-muted">Подходы</dt>
              <dd className="font-display text-xl font-bold">{sets}</dd></div>
            <div><dt className="text-xs text-text-muted">Тоннаж</dt>
              <dd className="font-display text-xl font-bold">{tonnage.toLocaleString('ru-RU')} кг</dd></div>
          </dl>
          {muscles.length > 0 && (
            <p className="text-sm text-text-muted">
              Рабочие подходы по группам мышц · {muscles.map((m) =>
                (muscleGroupLabel(m.muscle_group) || 'Без группы') + ' ' + m.sets
              ).join(' · ')}
            </p>
          )}
          {heaviest && <p className="text-sm">
            Самый тяжёлый подход · {heaviest.name} · {Number(heaviest.weight)} кг × {heaviest.reps}
          </p>}
        </>
      ) : <p className="text-sm text-text-muted">За неделю пока нет подходов в завершённых тренировках.</p>}
    </section>
  );
}
