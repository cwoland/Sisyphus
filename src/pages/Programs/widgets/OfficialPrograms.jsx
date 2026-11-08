import { useState } from 'react';
import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  CalendarDays,
  Clock3,
  Copy,
  Dumbbell,
  SlidersHorizontal,
} from 'lucide-react';
import { clsx } from 'clsx';

import { api } from '../../../shared/lib/axios.js';
import { Button } from '../../../shared/ui/Button.jsx';
import { Sheet } from '../../../shared/ui/Sheet.jsx';
import { SkeletonList } from '../../../shared/ui/Skeleton.jsx';
import { toast } from '../../../shared/ui/toast/toast.store.js';
import { plural } from '../../../shared/lib/plural.js';

const LEVELS = {
  beginner: 'Новичок',
  intermediate: 'Опытный атлет',
  advanced: 'Про',
};

const GOALS = {
  fitness: 'Общая форма',
  strength: 'Сила',
  muscle: 'Набор мышц',
};

const IMAGES = {
  'temple-foundation': '/art/ui/temple-foundation.webp',
  'sisyphus-ascent': '/art/ui/sisyphus-ascent.webp',
  'athena-wisdom': '/art/ui/athena-wisdom.webp',
  'spartan-discipline': '/art/ui/spartan-discipline.webp',
};

const PROGRAM_IMAGES = {
  'first-ascent': '/art/ui/program-first-ascent.webp',
  'athlete-path': '/art/ui/program-athlete-path.webp',
  olympus: '/art/ui/program-olympus.webp',
};

const getProgramImage = (program) => PROGRAM_IMAGES[program.slug] || IMAGES[program.image];

const LEVEL_FILTERS = [
  { value: 'all', label: 'Все уровни' },
  { value: 'beginner', label: 'Новичок' },
  { value: 'intermediate', label: 'Опытный атлет' },
  { value: 'advanced', label: 'Про' },
];

const GOAL_FILTERS = [
  { value: 'all', label: 'Все цели' },
  { value: 'fitness', label: 'Общая форма' },
  { value: 'strength', label: 'Сила' },
  { value: 'muscle', label: 'Набор мышц' },
];

const FilterButton = ({
  active,
  children,
  onClick,
}) => (
  <button
    type="button"
    aria-pressed={active}
    onClick={onClick}
    className={clsx(
      'min-h-11 shrink-0 rounded-xl border px-3 text-sm font-medium transition-colors',
      active
        ? 'border-cta bg-cta/10 text-text'
        : 'border-border bg-surface text-text-muted hover:text-text'
    )}
  >
    {children}
  </button>
);

const OfficialProgramCard = ({
  program,
  onOpen,
}) => {
  const image = getProgramImage(program);
  const isProgramImage = Boolean(PROGRAM_IMAGES[program.slug]);

  return (
    <button
      type="button"
      onClick={() => onOpen(program)}
      className="group relative isolate flex min-h-44 w-full overflow-hidden rounded-2xl border border-border bg-surface p-4 text-left transition-colors hover:border-border-strong sm:min-h-48 sm:p-5"
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-transparent via-transparent to-terracotta/10"
      />

      {image && (
        <img
          src={image}
          alt=""
          aria-hidden="true"
          draggable="false"
          loading="lazy"
          decoding="async"
          className={clsx('pointer-events-none absolute -z-10 select-none', isProgramImage
            ? 'right-0 top-0 h-full w-[55%] object-cover object-right opacity-75 [mask-image:linear-gradient(to_right,transparent,black_40%)]'
            : '-right-2 bottom-0 h-[92%] w-[36%] object-contain object-bottom opacity-75')}
        />
      )}

      <span className="flex min-w-0 max-w-[68%] flex-col">
        <span className="flex flex-wrap gap-1.5">
          <span className="rounded-lg bg-terracotta/10 px-2 py-1 text-[11px] font-semibold text-terracotta-ink">
            {LEVELS[program.level] || program.level}
          </span>

          <span className="rounded-lg bg-surface-2 px-2 py-1 text-[11px] font-medium text-text-muted">
            {GOALS[program.goal] || program.goal}
          </span>
        </span>

        <span className="mt-3 break-words font-display text-xl font-bold leading-tight text-text">
          {program.title}
        </span>

        <span className="mt-2 text-xs leading-relaxed text-text-muted">
          Спортзал
        </span>

        <span className="mt-auto flex flex-wrap gap-x-3 gap-y-1 pt-4 text-xs font-medium text-text-muted">
          <span className="inline-flex items-center gap-1">
            <CalendarDays size={14} />

            {program.days_count}{' '}
            {plural(
              Number(program.days_count),
              ['день', 'дня', 'дней']
            )}{' '}
            в неделю
          </span>

          <span className="inline-flex items-center gap-1">
            <Clock3 size={14} />
            ≈ {program.minutes} мин
          </span>
        </span>
      </span>
    </button>
  );
};

const OfficialProgramDetail = ({
  program,
  isLoading,
  isError,
  onRetry,
  onCopy,
  isCopying,
}) => {
  if (isLoading) {
    return <SkeletonList count={3} />;
  }

  if (isError || !program) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-text-muted">
          Не удалось загрузить программу.
        </p>

        <Button variant="secondary" onClick={onRetry}>
          Повторить
        </Button>
      </div>
    );
  }

  const image = getProgramImage(program);
  const isProgramImage = Boolean(PROGRAM_IMAGES[program.slug]);

  return (
    <div className="space-y-5">
      <section className="relative isolate overflow-hidden rounded-2xl border border-border bg-surface-2 p-5">
        {image && (
          <img
            src={image}
            alt=""
            aria-hidden="true"
            draggable="false"
            className={clsx('pointer-events-none absolute -z-10 select-none', isProgramImage
              ? 'right-0 top-0 h-full w-[55%] object-cover object-right opacity-65 [mask-image:linear-gradient(to_right,transparent,black_40%)]'
              : '-right-3 bottom-0 h-full w-[38%] object-contain object-bottom opacity-65')}
          />
        )}

        <div className="relative max-w-[70%]">
          <p className="text-xs font-semibold uppercase tracking-wider text-terracotta-ink">
            От Sisyphus
          </p>

          <h2 className="mt-2 break-words font-display text-2xl font-bold text-text">
            {program.title}
          </h2>

          <p className="mt-2 text-sm text-text-muted">
            {LEVELS[program.level] || program.level}
            {' · '}
            {GOALS[program.goal] || program.goal}
          </p>

          <p className="mt-2 text-xs text-text-muted">
            Зал · {program.days.length}{' '}
            {plural(
              program.days.length,
              ['день', 'дня', 'дней']
            )}{' '}
            в неделю · ≈ {program.minutes} мин
          </p>
        </div>
      </section>

      <p className="text-sm leading-relaxed text-text-muted">
        {program.description}
      </p>

      <div className="rounded-xl border border-border bg-surface-2 p-3 text-sm text-text-muted">
        После копирования программу можно изменить и добавить
        в календарь. Время тренировки указано приблизительно.
      </div>

      <div className="space-y-3">
        {program.days.map((day, dayIndex) => (
          <section
            key={`${dayIndex}-${day.title}`}
            className="overflow-hidden rounded-2xl border border-border bg-surface"
          >
            <div className="border-b border-border px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-terracotta-ink">
                День {dayIndex + 1}
              </p>

              <h3 className="mt-1 font-semibold text-text">
                {day.title}
              </h3>
            </div>

            <ol className="divide-y divide-border">
              {day.exercises.map((exercise, exerciseIndex) => (
                <li
                  key={`${exerciseIndex}-${exercise.name}`}
                  className="flex items-start justify-between gap-3 px-4 py-3 text-sm"
                >
                  <span className="min-w-0 break-words text-text">
                    {exercise.name}
                  </span>

                  <span className="shrink-0 tabular-nums text-text-muted">
                    {exercise.sets} × {exercise.reps}
                    {exercise.name === 'Планка' ? ' сек' : ''}
                  </span>
                </li>
              ))}
            </ol>
          </section>
        ))}
      </div>

      <Button
        className="w-full"
        size="lg"
        onClick={onCopy}
        isLoading={isCopying}
      >
        <Copy size={18} />
        Скопировать себе
      </Button>
    </div>
  );
};

export const OfficialPrograms = ({ onCopied }) => {
  const queryClient = useQueryClient();

  const [level, setLevel] = useState('all');
  const [goal, setGoal] = useState('all');
  const [selected, setSelected] = useState(null);

  const programsQuery = useQuery({
    queryKey: ['official-programs'],
    queryFn: () =>
      api
        .get('/programs/official')
        .then((response) => response.data.programs),
  });

  const detailQuery = useQuery({
    queryKey: ['official-program', selected?.slug],
    queryFn: () =>
      api
        .get(
          `/programs/official/${encodeURIComponent(selected.slug)}`
        )
        .then((response) => response.data.program),
    enabled: Boolean(selected?.slug),
  });

  const copyMutation = useMutation({
    mutationFn: (slug) =>
      api
        .post(
          `/programs/official/${encodeURIComponent(slug)}/copy`
        )
        .then((response) => response.data.program),

    onSuccess: (program) => {
      queryClient.invalidateQueries({
        queryKey: ['programs'],
      });

      setSelected(null);
      toast.success('Программа добавлена в твои программы');
      onCopied?.(program);
    },

    onError: (error) => {
      toast.error(
        error.response?.data?.message ||
        'Не удалось скопировать программу'
      );
    },
  });

  const programs = (programsQuery.data || []).filter(
    (program) =>
      (level === 'all' || program.level === level) &&
      (goal === 'all' || program.goal === goal)
  );

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border bg-surface p-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-text">
          <SlidersHorizontal
            size={16}
            className="text-terracotta-ink"
          />
          Подбери свой маршрут
        </div>

        <p className="mt-2 text-sm text-text-muted">
          Готовые программы для зала. Скопируй подходящую
          и настрой под себя.
        </p>

        <div
          role="group"
          aria-label="Уровень подготовки"
          className="mt-4 flex gap-2 overflow-x-auto pb-1"
        >
          {LEVEL_FILTERS.map((filter) => (
            <FilterButton
              key={filter.value}
              active={level === filter.value}
              onClick={() => setLevel(filter.value)}
            >
              {filter.label}
            </FilterButton>
          ))}
        </div>

        <div
          role="group"
          aria-label="Цель программы"
          className="mt-2 flex gap-2 overflow-x-auto pb-1"
        >
          {GOAL_FILTERS.map((filter) => (
            <FilterButton
              key={filter.value}
              active={goal === filter.value}
              onClick={() => setGoal(filter.value)}
            >
              {filter.label}
            </FilterButton>
          ))}
        </div>
      </div>

      {programsQuery.isLoading ? (
        <SkeletonList count={3} />
      ) : programsQuery.isError ? (
        <div className="space-y-3 rounded-2xl border border-border bg-surface p-5">
          <p className="text-sm text-text-muted">
            Не удалось загрузить готовые программы.
          </p>

          <Button
            variant="secondary"
            onClick={() => programsQuery.refetch()}
          >
            Повторить
          </Button>
        </div>
      ) : programs.length === 0 ? (
        <div className="rounded-2xl border border-border bg-surface p-6 text-center">
          <Dumbbell
            size={24}
            className="mx-auto text-text-muted"
          />

          <p className="mt-3 font-medium text-text">
            Программы не найдены
          </p>

          <p className="mt-1 text-sm text-text-muted">
            Попробуй изменить уровень или цель.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {programs.map((program) => (
            <OfficialProgramCard
              key={program.slug}
              program={program}
              onOpen={setSelected}
            />
          ))}
        </div>
      )}

      <Sheet
        isOpen={Boolean(selected)}
        onClose={() => setSelected(null)}
        title="Готовая программа"
      >
        {selected && (
          <OfficialProgramDetail
            program={detailQuery.data}
            isLoading={detailQuery.isLoading}
            isError={detailQuery.isError}
            onRetry={() => detailQuery.refetch()}
            onCopy={() =>
              copyMutation.mutate(selected.slug)
            }
            isCopying={copyMutation.isPending}
          />
        )}
      </Sheet>
    </div>
  );
};
