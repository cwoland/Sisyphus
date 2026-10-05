import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Trophy, Search, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';
import { ru } from 'date-fns/locale';

import { useRecords } from './records.hooks.js';
import { ExerciseHistory } from './widgets/ExerciseHistory.jsx';
import { Sheet } from '../../shared/ui/Sheet.jsx';
import { CardArt } from '../../shared/ui/CardArt.jsx';
import { EmptyState } from '../../shared/ui/EmptyState.jsx';
import { SkeletonList } from '../../shared/ui/Skeleton.jsx';
import { safeDistanceToNow } from '../../shared/lib/date.js';
import { muscleGroups, muscleGroupLabel } from '../../entities/exercise/muscleGroups.js';
import { plural } from '../../shared/lib/plural.js';

export const RecordsPage = () => {
  const [params, setParams] = useSearchParams();
  const openId = params.get('ex');

  const recordsQuery = useRecords();
  const [search, setSearch] = useState('');
  const [group, setGroup] = useState('all');

  const records = useMemo(() => recordsQuery.data || [], [recordsQuery.data]);

  const presentGroups = useMemo(() => {
    const used = new Set(records.map((r) => r.muscle_group));
    return muscleGroups.filter((g) => used.has(g.value));
  }, [records]);

  const shown = useMemo(() => {
    const term = search.trim().toLowerCase();
    return records.filter((r) => {
      if (group !== 'all' && r.muscle_group !== group) return false;
      if (term && !r.exercise_name.toLowerCase().includes(term)) return false;
      return true;
    });
  }, [records, search, group]);

  const open = (exerciseId) => setParams({ ex: exerciseId });
  const close = () => setParams({}, { replace: true });

  return (
    <div className="space-y-5">
      <section
        aria-label="Рекорды"
        className="relative isolate clip-card-art overflow-hidden rounded-2xl border border-border bg-surface p-5 sm:p-7"
      >
        <CardArt name="smith" className="card-art-hero" />

        <div className="relative pr-[34%] sm:pr-40">
          <p className="font-display text-sm font-semibold uppercase tracking-[0.14em] text-text-muted">
            Рекорды
          </p>
          <h1 className="mt-2 font-display text-3xl font-extrabold leading-tight tracking-tight text-text sm:text-4xl">
            {records.length
              ? `${records.length} ${plural(records.length, ['вершина', 'вершины', 'вершин'])}`
              : 'Вершин пока нет'}
          </h1>
          <p className="mt-2 max-w-[38ch] text-sm text-text-muted">
            Расчётный максимум по формуле Эпли. Нажмите на упражнение, чтобы увидеть всю историю.
          </p>
        </div>
      </section>

      {recordsQuery.isLoading ? (
        <SkeletonList count={5} />
      ) : records.length === 0 ? (
        <div className="rounded-2xl border border-border bg-surface">
          <EmptyState
            icon={Trophy}
            title="Пока нет рекордов"
            description="Отметьте выполненные подходы — максимум запомнится сам."
          />
        </div>
      ) : (
        <>
          <div className="space-y-3">
            <div className="relative">
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Поиск упражнения"
                aria-label="Поиск упражнения среди рекордов"
                className="w-full rounded-xl border border-border-strong bg-surface py-2.5 pl-9 pr-3 text-sm text-text placeholder:text-text-muted transition-colors focus:border-cta focus:outline-none"
              />
            </div>

            {presentGroups.length > 1 && (
              <div className="flex flex-wrap gap-1.5">
                <GroupChip label="Все" active={group === 'all'} onClick={() => setGroup('all')} />
                {presentGroups.map((g) => (
                  <GroupChip
                    key={g.value}
                    label={g.label}
                    active={group === g.value}
                    onClick={() => setGroup(g.value)}
                  />
                ))}
              </div>
            )}
          </div>

          {shown.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border px-4 py-6 text-center text-sm text-text-muted">
              Ничего не нашлось. Попробуйте другое слово или снимите фильтр.
            </p>
          ) : (
            <ol className="space-y-2">
              {shown.map((r) => (
                <li key={r.id}>
                  <button
                    onClick={() => open(r.exercise_id)}
                    className="group flex min-h-[64px] w-full items-center gap-3 rounded-2xl border border-border bg-surface p-3 text-left transition-colors hover:border-border-strong hover:bg-surface-2"
                  >
                    <Trophy size={18} className="shrink-0 text-gold-ink" />

                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-text">{r.exercise_name}</p>
                      <p className="truncate text-xs text-text-muted">
                        {muscleGroupLabel(r.muscle_group)}
                        {r.updated_at && ` · ${safeDistanceToNow(r.updated_at, { locale: ru, addSuffix: true })}`}
                      </p>
                    </div>

                    <span className="shrink-0 text-right">
                      <span className="block font-display font-bold tabular-nums text-text">
                        {Math.round(Number(r.one_rm))} кг
                      </span>
                      <span className="block text-xs tabular-nums text-text-muted">
                        {Number(r.weight)}×{r.reps}
                      </span>
                    </span>

                    <ChevronRight
                      size={18}
                      className="shrink-0 text-text-muted transition-colors group-hover:text-text"
                    />
                  </button>
                </li>
              ))}
            </ol>
          )}
        </>
      )}

      <Sheet isOpen={!!openId} onClose={close} title="История упражнения">
        {openId && <ExerciseHistory key={openId} exerciseId={openId} />}
      </Sheet>
    </div>
  );
};

const GroupChip = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    aria-pressed={active}
    className={clsx(
      'min-h-[36px] rounded-xl border px-3 text-sm font-medium transition-colors',
      active
        ? 'border-cta bg-cta/10 text-text'
        : 'border-border text-text-muted hover:bg-surface-2 hover:text-text'
    )}
  >
    {label}
  </button>
);
