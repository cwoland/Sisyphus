import { useState, useEffect } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { Plus, Dumbbell, Compass, User, Search } from 'lucide-react';
import { clsx } from 'clsx';

import { usePrograms, useProgram, useProgramMutations, usePublicPrograms } from './programs.hooks.js';
import { useAuthStore } from '../../entities/user/auth.store.js';
import { ProgramBuilder } from './widgets/ProgramBuilder.jsx';
import { ProgramDetail } from './widgets/ProgramDetail.jsx';
import { ProgramCard } from './widgets/ProgramCard.jsx';
import { ScheduleDialog } from './widgets/ScheduleDialog.jsx';
import { Sheet } from '../../shared/ui/Sheet.jsx';
import { Button } from '../../shared/ui/Button.jsx';
import { CardArt } from '../../shared/ui/CardArt.jsx';
import { EmptyState } from '../../shared/ui/EmptyState.jsx';
import { SkeletonList } from '../../shared/ui/Skeleton.jsx';
import { emptyStates } from '../../shared/lib/sisyphusPhrases.js';
import { plural } from '../../shared/lib/plural.js';

const TABS = [
  { id: 'mine', label: 'Мои', icon: User },
  { id: 'catalog', label: 'Каталог', icon: Compass },
];

const programToBuilderShape = (program) => ({
  title: program.title,
  description: program.description || '',
  isPublic: program.is_public,
  days: program.days.map((day) => ({
    tempId: crypto.randomUUID(),
    title: day.title,
    exercises: day.exercises.map((ex) => ({
      tempId: crypto.randomUUID(),
      exerciseId: ex.exercise_id,
      name: ex.exercise_name,
      muscleGroup: ex.muscle_group,
      targetSets: ex.target_sets,
      targetReps: ex.target_reps,
    })),
  })),
});

export const ProgramsPage = () => {
  const location = useLocation();
  const me = useAuthStore((s) => s.user);

  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') === 'catalog' ? 'catalog' : 'mine';
  const setTab = (next) =>
    setParams(next === 'catalog' ? { tab: 'catalog' } : {}, { replace: true });

  const programsQuery = usePrograms();
  const { create, update, remove, schedule, fork } = useProgramMutations();

  const [editProgram, setEditProgram] = useState(null);
  const [builderOpen, setBuilderOpen] = useState(false);
  const [detailId, setDetailId] = useState(null);
  const [scheduleProgram, setScheduleProgram] = useState(null);

  const [search, setSearch] = useState('');
  const [term, setTerm] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setTerm(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  const detailQuery = useProgram(detailId);
  const publicQuery = usePublicPrograms(term, { enabled: tab === 'catalog' });

  useEffect(() => {
    if (!location.state?.programId) return;
    setDetailId(location.state.programId);
    window.history.replaceState({}, '');
  }, [location.state]);

  const handleCreate = (payload) => {
    create.mutate(payload, { onSuccess: () => setBuilderOpen(false) });
  };

  const handleUpdate = (payload) => {
    update.mutate({ id: editProgram.id, ...payload }, {
      onSuccess: () => setEditProgram(null),
    });
  };

  const handleDelete = (id) => {
    if (!window.confirm('Удалить программу? Уже запланированные тренировки останутся в календаре.')) return;
    remove.mutate(id, { onSuccess: () => setDetailId(null) });
  };

  const handleFork = (id) => {
    fork.mutate(id, { onSuccess: () => { setDetailId(null); setTab('mine'); } });
  };

  const isOwner = detailQuery.data?.owner_id === me?.id;
  const mine = programsQuery.data || [];
  const mineCount = mine.length;

  return (
    <div className="space-y-5">
      <section
        aria-label="Программы"
        className="relative isolate clip-card-art overflow-hidden rounded-2xl border border-border bg-surface p-5 sm:p-7"
      >
        <CardArt name="smith" className="card-art-hero" />

        <div className="relative pr-[34%] sm:pr-40">
          <p className="font-display text-sm font-semibold uppercase tracking-[0.14em] text-text-muted">
            Программы
          </p>
          <h1 className="mt-2 font-display text-3xl font-extrabold leading-tight tracking-tight text-text sm:text-4xl">
            {mineCount
              ? `${mineCount} ${plural(mineCount, ['маршрут', 'маршрута', 'маршрутов'])}`
              : 'Маршрут не проложен'}
          </h1>
          <p className="mt-2 max-w-[38ch] text-sm text-text-muted">
            План на недели вперёд: дни, упражнения, подходы. Календарь разложит их сам.
          </p>

          <div className="mt-6">
            <Button size="lg" onClick={() => setBuilderOpen(true)}>
              <Plus size={18} /> Создать программу
            </Button>
          </div>
        </div>
      </section>

      <div role="tablist" aria-label="Источник программ" className="flex gap-1 border-b border-border">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={clsx(
              '-mb-px flex min-h-[44px] items-center gap-2 border-b-2 px-3 text-sm font-medium transition-colors',
              tab === id
                ? 'border-cta text-text'
                : 'border-transparent text-text-muted hover:text-text'
            )}
          >
            <Icon size={16} /> {label}
          </button>
        ))}
      </div>

      {tab === 'mine' && (
        programsQuery.isLoading ? (
          <SkeletonList count={3} />
        ) : mineCount === 0 ? (
          <div className="rounded-2xl border border-border bg-surface">
            <EmptyState
              icon={Dumbbell}
              {...emptyStates.programs}
              action={
                <Button onClick={() => setBuilderOpen(true)}>
                  <Plus size={18} /> Создать программу
                </Button>
              }
            />
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {mine.map((p) => (
              <ProgramCard key={p.id} program={p} onOpen={(x) => setDetailId(x.id)} />
            ))}
          </div>
        )
      )}

      {tab === 'catalog' && (
        <div className="space-y-4">
          <div className="relative">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск по названию"
              aria-label="Поиск программ в каталоге"
              className="w-full rounded-xl border border-border-strong bg-surface py-2.5 pl-9 pr-3 text-sm text-text placeholder:text-text-muted transition-colors focus:border-cta focus:outline-none"
            />
          </div>

          {publicQuery.isLoading ? (
            <SkeletonList count={3} />
          ) : publicQuery.data?.length === 0 ? (
            <div className="rounded-2xl border border-border bg-surface">
              <EmptyState
                icon={Compass}
                title={term ? 'Ничего не нашлось' : 'Каталог пуст'}
                description={
                  term
                    ? `По запросу «${term}» программ нет. Попробуйте другое слово.`
                    : 'Пока никто не открыл свою программу. Будь первым — отметь свою как публичную.'
                }
              />
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {publicQuery.data.map((p) => (
                <ProgramCard key={p.id} program={p} showAuthor onOpen={(x) => setDetailId(x.id)} />
              ))}
            </div>
          )}
        </div>
      )}

      <Sheet isOpen={builderOpen} onClose={() => setBuilderOpen(false)} title="Новая программа">
        <ProgramBuilder
          onSubmit={handleCreate}
          isSubmitting={create.isPending}
          onCancel={() => setBuilderOpen(false)}
        />
      </Sheet>

      <Sheet isOpen={!!editProgram} onClose={() => setEditProgram(null)} title="Редактировать программу">
        {editProgram && (
          <ProgramBuilder
            initial={programToBuilderShape(editProgram)}
            submitLabel="Сохранить изменения"
            onSubmit={handleUpdate}
            isSubmitting={update.isPending}
            onCancel={() => setEditProgram(null)}
          />
        )}
      </Sheet>

      <Sheet isOpen={!!detailId} onClose={() => setDetailId(null)} title="Программа">
        <ProgramDetail
          program={detailQuery.data}
          isLoading={detailQuery.isLoading}
          isOwner={isOwner}
          onSchedule={(p) => { setDetailId(null); setScheduleProgram(p); }}
          onEdit={(p) => { setDetailId(null); setEditProgram(p); }}
          onDelete={handleDelete}
          onFork={handleFork}
          isForking={fork.isPending}
        />
      </Sheet>

      {scheduleProgram && (
        <ScheduleDialog
          key={scheduleProgram.id}
          isOpen
          onClose={() => setScheduleProgram(null)}
          program={scheduleProgram}
          onSchedule={(payload) => schedule.mutate(payload, { onSuccess: () => setScheduleProgram(null) })}
          isScheduling={schedule.isPending}
        />
      )}
    </div>
  );
};