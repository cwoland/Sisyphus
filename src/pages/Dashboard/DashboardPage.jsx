import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ChevronRight, CheckCircle2, Trophy } from 'lucide-react';

import { useAuthStore } from '../../entities/user/auth.store.js';
import { useWeekWorkouts, useTodayNutrition, useTopRecords } from './dashboard.hooks.js';
import { CalorieRing } from './widgets/CalorieRing.jsx';
import { Skeleton, SkeletonCard } from '../../shared/ui/Skeleton.jsx';
import { EmptyState } from '../../shared/ui/EmptyState.jsx';
import { CardArt } from '../../shared/ui/CardArt.jsx';
import { greetings, pickRandom } from '../../shared/lib/sisyphusPhrases.js';
import { todayApi } from '../../shared/lib/date.js';

export const DashboardPage = () => {
  const user = useAuthStore((s) => s.user);
  const workoutsQuery = useWeekWorkouts();
  const nutritionQuery = useTodayNutrition();
  const recordsQuery = useTopRecords();

  const greeting = useMemo(() => pickRandom(greetings), []);

  const today = todayApi();
  const todayWorkouts = (workoutsQuery.data || []).filter((w) => w.date === today);
  const topRecords = (recordsQuery.data || []).slice(0, 3);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-2xl font-bold text-text">
          Привет, {user?.name || 'атлет'}
        </h1>
        <p className="mt-1 text-text-muted">{greeting}</p>
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-text">Сегодня</h2>
          <Link to="/calendar" className="flex items-center gap-1 text-sm text-accent hover:text-accent-hover">
            Календарь <ChevronRight size={16} />
          </Link>
        </div>

        {workoutsQuery.isLoading ? (
          <SkeletonCard />
        ) : todayWorkouts.length === 0 ? (
          <div className="relative isolate overflow-hidden rounded-2xl border border-border bg-surface p-6">
            <CardArt name="warrior" className="-right-4 top-0 h-full w-44" />
            <div className="relative">
              <EmptyState
                icon={Calendar}
                title="Сегодня подъёма нет"
                description="Отдых — часть маршрута. Или добавьте тренировку в календаре."
              />
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {todayWorkouts.map((w) => (
              <Link
                key={w.id}
                to="/calendar"
                className="relative isolate flex items-center justify-between overflow-hidden rounded-2xl border border-border bg-surface p-4 transition-colors hover:bg-surface-2"
              >
                <CardArt name="warrior" className="-right-4 top-0 h-full w-32" />
                <div className="relative flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
                    {w.status === 'completed' ? <CheckCircle2 size={20} /> : <Calendar size={20} />}
                  </div>
                  <div>
                    <p className="font-medium text-text">{w.title}</p>
                    <p className="text-xs text-text-muted">
                      {w.status === 'completed' ? 'Завершена' : w.status === 'skipped' ? 'Пропущена' : 'Запланирована'}
                    </p>
                  </div>
                </div>
                <ChevronRight size={18} className="relative text-text-muted" />
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-text">Питание</h2>
          <Link to="/nutrition" className="flex items-center gap-1 text-sm text-accent hover:text-accent-hover">
            Дневник <ChevronRight size={16} />
          </Link>
        </div>

        {nutritionQuery.isLoading ? (
          <div className="rounded-2xl border border-border bg-surface p-6">
            <div className="flex items-center gap-6">
              <Skeleton className="h-32 w-32 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          </div>
        ) : (
          <div className="relative isolate overflow-hidden rounded-2xl border border-border bg-surface p-6">
            <CardArt name="back" className="-right-6 top-0 h-full w-44" />
            <div className="relative flex flex-col items-center gap-6 sm:flex-row">
              <CalorieRing
                consumed={Number(nutritionQuery.data?.consumed?.total_calories) || 0}
                target={nutritionQuery.data?.target?.calories || 2000}
              />
              <div className="grid flex-1 grid-cols-3 gap-3 text-center sm:text-left">
                <Macro label="Белки" value={nutritionQuery.data?.consumed?.total_protein} />
                <Macro label="Жиры" value={nutritionQuery.data?.consumed?.total_fat} />
                <Macro label="Углеводы" value={nutritionQuery.data?.consumed?.total_carbs} />
              </div>
            </div>
          </div>
        )}
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-text">Рекорды</h2>
          <Link to="/calendar" className="flex items-center gap-1 text-sm text-accent hover:text-accent-hover">
            Все <ChevronRight size={16} />
          </Link>
        </div>

        {recordsQuery.isLoading ? (
          <SkeletonCard />
        ) : (
          <div className="relative isolate overflow-hidden rounded-2xl border border-border bg-surface p-6">
            <CardArt name="smith" className="-right-6 top-0 h-full w-44" />
            <div className="relative">
              {topRecords.length === 0 ? (
                <EmptyState
                  icon={Trophy}
                  title="Пока нет рекордов"
                  description="Завершите тренировку с отмеченными подходами — вершина запомнит максимум."
                />
              ) : (
                <div className="space-y-2">
                  {topRecords.map((r) => (
                    <div key={r.id} className="flex items-center justify-between rounded-xl bg-surface-2 px-3 py-2">
                      <span className="truncate text-sm text-text">{r.exercise_name}</span>
                      <div className="shrink-0 text-right">
                        <span className="font-display font-bold text-text">{Math.round(Number(r.one_rm))} кг</span>
                        <span className="ml-2 text-xs text-text-muted">{Number(r.weight)}×{r.reps}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

const Macro = ({ label, value }) => (
  <div className="rounded-xl bg-surface-2 p-3">
    <p className="font-display text-lg font-bold text-text">{Math.round(Number(value) || 0)}<span className="text-xs font-normal text-text-muted"> г</span></p>
    <p className="text-xs text-text-muted">{label}</p>
  </div>
);