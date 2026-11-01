import { ru } from 'date-fns/locale';
import { Link, useNavigate } from 'react-router-dom';
import { Play, Check, ArrowUpRight, RotateCcw, CalendarDays } from 'lucide-react';
import { useAuthStore } from '../../entities/user/auth.store.js';
import { useWeekWorkouts, useTodayNutrition, useTopRecords, useContinuity } from './dashboard.hooks.js';
import { useActiveWorkout, useStartWorkout } from '../Calendar/calendar.hooks.js';
import { WeekStrip } from './widgets/WeekStrip.jsx';
import { StreakCard } from './widgets/StreakCard.jsx';
import { ContinuityStrip } from './widgets/ContinuityStrip.jsx';
import { CalorieRing } from '../../shared/ui/CalorieRing.jsx';
import { Skeleton } from '../../shared/ui/Skeleton.jsx';
import { SectionLink } from '../../shared/ui/SectionLink.jsx';
import { Button } from '../../shared/ui/Button.jsx';
import { GreekMedallion } from '../../shared/ui/GreekMedallion.jsx';
import { Reveal } from '../../shared/ui/Reveal.jsx';
import { useVisitStreak } from '../../entities/stats/visit.hooks.js';
import { todayApi, safeFormat } from '../../shared/lib/date.js';
import '../../shared/ui/epic.css';

const num = (value) => Math.round(Number(value) || 0);
const ErrorState = ({ text, onRetry }) => <div role="status" className="space-y-3 rounded-xl border border-border bg-surface-2 p-4">
  <p className="text-sm text-text-muted">{text}</p>
  <Button size="sm" variant="secondary" onClick={onRetry}><RotateCcw size={15} /> Повторить</Button>
</div>;

export const DashboardPage = () => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const workoutsQuery = useWeekWorkouts();
  const nutritionQuery = useTodayNutrition();
  const recordsQuery = useTopRecords();
  const activeQuery = useActiveWorkout();
  const startWorkout = useStartWorkout();
  const continuityQuery = useContinuity();
  const visitQuery = useVisitStreak();
  const today = todayApi();
  const week = workoutsQuery.data || [];
  const daily = week.filter((w) => w.date === today);
  const workout = activeQuery.data ?? daily.find((w) => w.status === 'in_progress') ??
    daily.find((w) => w.status === 'planned') ?? daily.find((w) => w.status === 'completed') ?? null;
  const consumed = num(nutritionQuery.data?.consumed?.total_calories);
  const target = Number(nutritionQuery.data?.target?.calories);
  const hasTarget = Number.isFinite(target) && target > 0;
  const records = (recordsQuery.data || []).slice(0, 3);
  const openWorkout = () => {
    if (!workout) return;
    if (workout.status === 'in_progress') return navigate(`/workout/${workout.id}/active`);
    if (workout.status === 'completed') return navigate('/calendar');
    startWorkout.mutate(workout.id, { onSuccess: () => navigate(`/workout/${workout.id}/active`) });
  };
  return <div className="epic-dashboard space-y-6">
    <Reveal>
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="min-w-0 break-words text-sm text-text-muted">{user?.name ? `${user.name}, с возвращением.` : 'С возвращением.'}</p>
        <span className="shrink-0 text-xs capitalize text-text-muted">{safeFormat(new Date(), 'd MMMM', { locale: ru })}</span>
      </div>
      <TodayHero workout={workout} isLoading={workoutsQuery.isLoading || activeQuery.isLoading}
        hasError={workoutsQuery.isError || activeQuery.isError} isStarting={startWorkout.isPending}
        onRetry={() => { workoutsQuery.refetch(); activeQuery.refetch(); }} onOpen={openWorkout} onPlan={() => navigate('/calendar')} />
    </Reveal>

    <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,.9fr)]">
      <div className="min-w-0 space-y-6">
        <Reveal delay={0.04} className="epic-panel p-4 sm:p-5">
          {workoutsQuery.isLoading ? <Skeleton className="h-24 w-full" /> : workoutsQuery.isError
            ? <ErrorState text="Не удалось загрузить неделю." onRetry={() => workoutsQuery.refetch()} />
            : <WeekStrip workouts={week} />}
          <Link to="/calendar" className="mt-4 flex min-h-11 items-center justify-between gap-2 border-t border-border pt-3 text-sm font-medium text-terracotta-ink">
            Весь календарь <ArrowUpRight size={17} />
          </Link>
        </Reveal>
        <Reveal delay={0.08} className="epic-streak"><StreakCard query={visitQuery} /></Reveal>
        <Reveal delay={0.1} className="epic-continuity"><ContinuityStrip query={continuityQuery} /></Reveal>
      </div>
      <div className="min-w-0 space-y-6">
        <Reveal delay={0.06}>
          <section aria-labelledby="epic-nutrition-title" className="epic-panel overflow-hidden p-4 sm:p-5">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2"><GreekMedallion kind="amphora" size={34} className="shrink-0 text-terracotta-ink" />
                <h2 id="epic-nutrition-title" className="epic-section-title text-text">Питание</h2></div>
              <SectionLink to="/nutrition">Дневник</SectionLink>
            </div>
            {nutritionQuery.isLoading ? <Skeleton className="h-48 w-full" /> : nutritionQuery.isError
              ? <ErrorState text="Не удалось загрузить питание." onRetry={() => nutritionQuery.refetch()} />
              : <>
                <div className="relative flex min-w-0 items-center gap-4 pb-5">
                  <CalorieRing consumed={hasTarget ? consumed : 0} target={hasTarget ? target : 1}
                    primary={consumed} caption="ккал сегодня" size={108} />
                  <div className="relative z-10 min-w-0 flex-1 pr-5">
                    <p className="text-xs uppercase tracking-wider text-text-muted">{hasTarget ? consumed > target ? 'Сверх цели' : 'До цели' : 'Баланс дня'}</p>
                    <p className="mt-1 text-2xl font-bold tabular-nums text-text">{hasTarget ? Math.abs(target - consumed) : '—'}
                      {hasTarget && <span className="ml-1 text-xs font-normal text-text-muted">ккал</span>}</p>
                    <p className="mt-1 text-xs text-text-muted">{hasTarget ? `Цель: ${target} ккал` : 'Цель пока не задана'}</p>
                  </div>
                  <img src="/art/ui/amphora-nutrition.webp" width="1145" height="1374" alt="" aria-hidden="true"
                    loading="lazy" decoding="async" className="pointer-events-none absolute -right-7 bottom-0 h-32 w-28 select-none object-contain opacity-20" />
                </div>
                <dl className="grid grid-cols-3 gap-2 border-t border-border pt-4">
                  <Macro label="Белки" value={nutritionQuery.data?.consumed?.total_protein} />
                  <Macro label="Жиры" value={nutritionQuery.data?.consumed?.total_fat} />
                  <Macro label="Углеводы" value={nutritionQuery.data?.consumed?.total_carbs} />
                </dl>
              </>}
          </section>
        </Reveal>
        <Reveal delay={0.12}>
          <section aria-labelledby="epic-records-title" className="epic-panel overflow-hidden">
            <div className="flex items-center justify-between gap-3 p-4 pb-2 sm:px-5">
              <div className="flex min-w-0 items-center gap-2"><GreekMedallion kind="laurel" size={34} className="shrink-0 text-gold-ink" />
                <h2 id="epic-records-title" className="epic-section-title text-text">Личные вершины</h2></div>
              <SectionLink to="/records">Все</SectionLink>
            </div>
            <p className="px-4 pb-4 text-xs text-text-muted sm:px-5">Расчётный максимум на одно повторение</p>
            {recordsQuery.isLoading ? <div className="p-4"><Skeleton className="h-32 w-full" /></div>
              : recordsQuery.isError ? <div className="p-4"><ErrorState text="Не удалось загрузить рекорды." onRetry={() => recordsQuery.refetch()} /></div>
                : records.length ? <ol className="divide-y divide-border border-t border-border">{records.map((r) => <li key={r.id}>
                  <Link to={`/records?ex=${r.exercise_id}`} className="epic-record-link flex min-h-16 items-center gap-3 px-4 py-3 sm:px-5">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-gold-ink" />
                    <span className="min-w-0 flex-1 break-words text-sm font-medium text-text">{r.exercise_name}</span>
                    <span className="shrink-0 text-right"><span className="block text-lg font-bold tabular-nums text-text">{num(r.one_rm)} кг</span>
                      <span className="text-xs tabular-nums text-text-muted">{Number(r.weight)} × {r.reps}</span></span>
                  </Link>
                </li>)}</ol> : <div className="px-5 pb-7 pt-2 text-center">
                  <GreekMedallion kind="mountain" size={68} className="mx-auto mb-3 text-gold-ink" />
                  <p className="font-semibold text-text">Первая вершина впереди</p>
                  <p className="mx-auto mt-2 max-w-[30ch] text-sm text-text-muted">Отмечай выполненные подходы. Твои результаты появятся здесь.</p>
                </div>}
          </section>
        </Reveal>
      </div>
    </div>
  </div>;
};

const TodayHero = ({ workout, isLoading, hasError, isStarting, onRetry, onOpen, onPlan }) => {
  if (isLoading) return <Skeleton className="h-80 w-full rounded-3xl" />;
  if (hasError) return <div className="epic-panel p-5"><ErrorState text="Не удалось загрузить тренировку. Проверь соединение и повтори запрос." onRetry={onRetry} /></div>;
  const running = workout?.status === 'in_progress';
  const done = workout?.status === 'completed';
  return <section aria-label="Тренировка сегодня" className="epic-hero p-5 pb-7 sm:p-8 sm:pb-10">
    <img src="/art/ui/sisyphus-ascent.webp" width="1312" height="1199" alt="" aria-hidden="true"
      fetchPriority="high" decoding="async" className="epic-hero-art" />
    <div className="epic-hero-copy">
      <p className="epic-kicker mb-4 text-terracotta-ink">{running ? 'Восхождение продолжается' : done ? 'Сегодня сделано' : workout ? 'Твой следующий шаг' : 'Восстановление'}</p>
      <h1 className="epic-title text-text">{running ? 'Продолжим восхождение.' : done ? 'Ты сделал своё.' : workout ? 'Камень уже ждёт.' : 'У силы есть ритм.'}</h1>
      <p className="mt-4 max-w-[26ch] break-words text-sm font-medium leading-relaxed text-text">{workout?.title || 'Отдых — часть пути. Завтра у камня снова будет твоё имя.'}</p>
      <p className="mt-2 text-xs text-text-muted">{running ? 'Возвращайся к текущему подходу.' : done ? 'Время восстановиться.' : workout ? 'Одна тренировка. Ещё один шаг.' : 'Или выбери тренировку в календаре.'}</p>
    </div>
    <div className="relative z-10 mt-6 flex max-w-full flex-wrap items-center gap-3">
      {done ? <><span className="flex items-center gap-2 text-sm font-medium text-accent"><Check size={18} /> Тренировка завершена</span>
        <Button size="sm" variant="secondary" onClick={onPlan}>В календарь</Button></>
        : <Button size="lg" onClick={workout ? onOpen : onPlan} isLoading={isStarting}>
          {workout ? <Play size={17} className="shrink-0" /> : <CalendarDays size={17} className="shrink-0" />}
          {running ? 'Продолжить тренировку' : workout ? 'Начать тренировку' : 'Открыть календарь'}
        </Button>}
    </div>
  </section>;
};

const Macro = ({ label, value }) => <div className="min-w-0">
  <dt className="text-xs text-text-muted">{label}</dt>
  <dd className="mt-1 text-xl font-bold tabular-nums text-text">{num(value)}<span className="ml-1 text-xs font-normal text-text-muted">г</span></dd>
</div>;
