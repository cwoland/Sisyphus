import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Apple, ChevronRight, CheckCircle2 } from 'lucide-react';

import { useAuthStore } from '../../entities/user/auth.store.js';
import { useWeekWorkouts, useTodayNutrition } from './dashboard.hooks.js';
import { CalorieRing } from './widgets/CalorieRing.jsx';
import { Skeleton, SkeletonCard } from '../../shared/ui/Skeleton.jsx';
import { EmptyState } from '../../shared/ui/EmptyState.jsx';
import { greetings, pickRandom } from '../../shared/lib/sisyphusPhrases.js';
import { todayApi } from '../../shared/lib/date.js';

export const DashboardPage = () => {
  const user = useAuthStore((s) => s.user);
  const workoutsQuery = useWeekWorkouts();
  const nutritionQuery = useTodayNutrition();

  const greeting = useMemo(() => pickRandom(greetings), []);

  const today = todayApi();
  const todayWorkouts = (workoutsQuery.data || []).filter((w) => w.date === today);

  return (
    <div className="space-y-6">
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
          <div className="rounded-2xl border border-border bg-surface p-6">
            <EmptyState
              icon={Calendar}
              title="Сегодня подъёма нет"
              description="Отдых — часть маршрута. Или добавьте тренировку в календаре."
            />
          </div>
        ) : (
          <div className="space-y-3">
            {todayWorkouts.map((w) => (
              <Link
                key={w.id}
                to={`/calendar`}
                className="flex items-center justify-between rounded-2xl border border-border bg-surface p-4 transition-colors hover:bg-surface-2"
              >
                <div className="flex items-center gap-3">
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
                <ChevronRight size={18} className="text-text-muted" />
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
          <div className="rounded-2xl border border-border bg-surface p-6">
            <div className="flex flex-col items-center gap-6 sm:flex-row">
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
    </div>
  );
};

const Macro = ({ label, value }) => (
  <div className="rounded-xl bg-surface-2 p-3">
    <p className="font-display text-lg font-bold text-text">{Math.round(Number(value) || 0)}<span className="text-xs font-normal text-text-muted"> г</span></p>
    <p className="text-xs text-text-muted">{label}</p>
  </div>
);