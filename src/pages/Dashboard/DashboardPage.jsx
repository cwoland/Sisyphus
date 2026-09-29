import { useNavigate } from 'react-router-dom';
import { Play, Check, Plus, Trophy, Flame } from 'lucide-react';

import { useAuthStore } from '../../entities/user/auth.store.js';
import { useWeekWorkouts, useTodayNutrition, useTopRecords } from './dashboard.hooks.js';
import { useActiveWorkout, useStartWorkout } from '../Calendar/calendar.hooks.js';
import { WeekStrip } from './widgets/WeekStrip.jsx';
import { CalorieRing } from './widgets/CalorieRing.jsx';
import { Skeleton, SkeletonCard } from '../../shared/ui/Skeleton.jsx';
import { CardArt } from '../../shared/ui/CardArt.jsx';
import { SectionLink } from '../../shared/ui/SectionLink.jsx';
import { Button } from '../../shared/ui/Button.jsx';
import { todayApi } from '../../shared/lib/date.js';

const num = (v) => Math.round(Number(v) || 0);

export const DashboardPage = () => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const workoutsQuery = useWeekWorkouts();
  const nutritionQuery = useTodayNutrition();
  const recordsQuery = useTopRecords();
  const activeQuery = useActiveWorkout();
  const startWorkout = useStartWorkout();

  const active = activeQuery.data;
  const week = workoutsQuery.data || [];
  const today = todayApi();

  const todayWorkout =
    active ?? week.find((w) => w.date === today && w.status !== 'skipped') ?? null;

  const open = () => {
    if (!todayWorkout) return;
    if (todayWorkout.status === 'in_progress') {
      return navigate(`/workout/${todayWorkout.id}/active`);
    }
    startWorkout.mutate(todayWorkout.id, {
      onSuccess: () => navigate(`/workout/${todayWorkout.id}/active`),
    });
  };

  const consumed = num(nutritionQuery.data?.consumed?.total_calories);
  const target = nutritionQuery.data?.target?.calories || 2000;
  const records = (recordsQuery.data || []).slice(0, 3);

  return (
    <div className="space-y-10">
      <TodayBlock
        name={user?.name}
        workout={todayWorkout}
        isLoading={workoutsQuery.isLoading || activeQuery.isLoading}
        isStarting={startWorkout.isPending}
        onOpen={open}
        onPlan={() => navigate('/calendar')}
      />

      {workoutsQuery.isLoading ? (
        <Skeleton className="h-20 w-full" />
      ) : (
        <WeekStrip workouts={week} />
      )}

      <section aria-label="Питание">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-sm font-semibold uppercase tracking-[0.14em] text-text-muted">
            Питание
          </h2>
          <SectionLink to="/nutrition">Дневник</SectionLink>
        </div>

        {nutritionQuery.isLoading ? (
          <Skeleton className="h-28 w-full" />
        ) : (
          <div className="relative isolate clip-card-art flex items-center gap-5 overflow-hidden rounded-2xl border border-border bg-surface p-4 sm:gap-7 sm:p-5">
            <CardArt name="back" />
            <div className="relative flex min-w-0 flex-1 items-center gap-5 sm:gap-7">
              <CalorieRing consumed={consumed} target={target} />
              <dl className="grid min-w-0 flex-1 grid-cols-3 gap-3">
                <Macro label="Белки" value={nutritionQuery.data?.consumed?.total_protein} />
                <Macro label="Жиры" value={nutritionQuery.data?.consumed?.total_fat} />
                <Macro label="Углеводы" value={nutritionQuery.data?.consumed?.total_carbs} />
              </dl>
            </div>
          </div>
        )}
      </section>

      <section aria-label="Рекорды">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-sm font-semibold uppercase tracking-[0.14em] text-text-muted">
            Рекорды
          </h2>
          <SectionLink to="/calendar">Все</SectionLink>
        </div>

        {recordsQuery.isLoading ? (
          <SkeletonCard />
        ) : records.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border px-4 py-5 text-sm text-text-muted">
            Завершите тренировку с отмеченными подходами — максимум запомнится сам.
          </p>
        ) : (
          <ol className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface">
            {records.map((r) => (
              <li key={r.id} className="flex items-center gap-3 px-4 py-3">
                <Trophy size={16} className="shrink-0 text-gold-ink" />
                <span className="min-w-0 flex-1 truncate text-sm text-text">{r.exercise_name}</span>
                <span className="shrink-0 text-right">
                  <span className="font-display font-bold tabular-nums text-text">
                    {num(r.one_rm)} кг
                  </span>
                  <span className="ml-2 text-xs tabular-nums text-text-muted">
                    {Number(r.weight)}×{r.reps}
                  </span>
                </span>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
};

const TodayBlock = ({ name, workout, isLoading, isStarting, onOpen, onPlan }) => {
  if (isLoading) return <Skeleton className="h-64 w-full rounded-2xl" />;

  const running = workout?.status === 'in_progress';
  const done = workout?.status === 'completed';

  return (
    <section
      aria-label="Сегодня"
      className="relative isolate clip-card-art overflow-hidden rounded-2xl border border-border bg-surface p-5 sm:p-7"
    >
      <CardArt name="warrior" />

      <div className="relative max-w-[32ch] pr-16 sm:pr-24">
        <p className="font-display text-sm font-semibold uppercase tracking-[0.14em] text-text-muted">
          {running ? 'Тренировка идёт' : done ? 'Сегодня закрыто' : 'Сегодня'}
        </p>

        {workout ? (
          <>
            <h1 className="mt-2 font-display text-3xl font-extrabold leading-tight tracking-tight text-text sm:text-4xl">
              {workout.title}
            </h1>

            <div className="mt-6">
              {done ? (
                <p className="flex items-center gap-2 text-sm font-medium text-accent">
                  <Check size={18} /> Камень на вершине
                </p>
              ) : (
                <Button size="lg" onClick={onOpen} isLoading={isStarting}>
                  {running ? <Flame size={18} /> : <Play size={18} />}
                  {running ? 'Продолжить' : 'Начать тренировку'}
                </Button>
              )}
            </div>
          </>
        ) : (
          <>
            <h1 className="mt-2 font-display text-3xl font-extrabold leading-tight tracking-tight text-text sm:text-4xl">
              День отдыха
            </h1>
            <p className="mt-2 text-sm text-text-muted">
              {name ? `${name}, отдых — часть маршрута.` : 'Отдых — часть маршрута.'}
              {' '}Или поставьте тренировку в календарь.
            </p>
            <div className="mt-6">
              <Button variant="secondary" size="lg" onClick={onPlan}>
                <Plus size={18} /> В календарь
              </Button>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

const Macro = ({ label, value }) => (
  <div className="min-w-0">
    <dt className="truncate text-xs text-text-muted">{label}</dt>
    <dd className="font-display text-xl font-bold tabular-nums text-text">
      {num(value)}
      <span className="text-xs font-normal text-text-muted"> г</span>
    </dd>
  </div>
);