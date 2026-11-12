import { programToBuilder } from '../../entities/program/setPlan.js';
import { useState, useEffect } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { Plus, Dumbbell, Compass, User, Search, Sparkles } from 'lucide-react';
import { clsx } from 'clsx';

import { usePrograms, useProgram, useProgramMutations, usePublicPrograms } from './programs.hooks.js';
import { useAuthStore } from '../../entities/user/auth.store.js';
import { ProgramBuilder } from './widgets/ProgramBuilder.jsx';
import { AiProgramQuiz } from './widgets/AiProgramQuiz.jsx';
import { ProgramDetail } from './widgets/ProgramDetail.jsx';
import { ProgramCard } from './widgets/ProgramCard.jsx';
import { ScheduleDialog } from './widgets/ScheduleDialog.jsx';
import { OfficialPrograms } from './widgets/OfficialPrograms.jsx';
import { ExerciseLibrary } from './widgets/ExerciseLibrary.jsx';
import { Sheet } from '../../shared/ui/Sheet.jsx';
import { Button } from '../../shared/ui/Button.jsx';
import { CardArt } from '../../shared/ui/CardArt.jsx';
import { EmptyState } from '../../shared/ui/EmptyState.jsx';
import { SkeletonList } from '../../shared/ui/Skeleton.jsx';
import { emptyStates } from '../../shared/lib/sisyphusPhrases.js';
import { plural } from '../../shared/lib/plural.js';
import { ShareDialog } from '../../features/share/ShareDialog.jsx';
import { da } from 'date-fns/locale';

const TABS = [
  { id: 'mine', label: 'Мои', icon: User },
  { id: 'official', label: 'От Sisyphus', icon: Dumbbell },
  { id: 'catalog', label: 'Каталог', icon: Compass },
];

const generatedProgramToBuilder = (program) => ({
  title: program.title,
  description: program.description || '',
  isPublic: false,
  kind: 'strength',
  days: program.days.map((day) => ({
    tempId: crypto.randomUUID(),
    title: day.title,
    exercises: day.exercises.map((exercise) => ({ 
      tempId: crypto.randomUUID(),
      groupId: crypto.randomUUID(),
      exerciseId: exercise.exerciseId,
      name: exercise.name,
      tracking: exercise.tracking || 'weight_reps',
      muscleGroup: exercise.muscleGroup,
      targetSets: exercise.targetSets,
      targetReps: exercise.targetReps,
      notes: exercise.notes || '',
      setPlan: exercise.setPlan,
    })),
  })),
});

export const ProgramsPage = () => {
  const location = useLocation();
  const me = useAuthStore((s) => s.user);

  const [params, setParams] = useSearchParams();
  
  const requestedTab = params.get('tab');

  const tab = 
    requestedTab === 'official' || requestedTab === 'catalog'
      ? requestedTab
      : 'mine';

  const setTab = (next) =>
    setParams(next === 'mine' ? {} : { tab: next },
      { replace: true }
    );

  const programsQuery = usePrograms();
  const {
    create,
    update,
    remove,
    schedule,
    fork,
  } = useProgramMutations();

  const [editProgram, setEditProgram] = useState(null);
  const [builderOpen, setBuilderOpen] = useState(false);
  const [aiQuizOpen, setAiQuizOpen] = useState(false);
  const [generatedProgram, setGeneratedProgram] = useState(null);
  const [detailId, setDetailId] = useState(
    location.state?.programId ?? null
  );
  const [scheduleProgram, setScheduleProgram] = useState(null);
  const [shareProgram, setShareProgram] = useState(null);

  const [search, setSearch] = useState('');
  const [term, setTerm] = useState('');

  const [section, setSection] = useState('programs');

  useEffect(() => {
    const t = setTimeout(
      () => setTerm(search.trim()),
      300
    );

    return () => clearTimeout(t);
  }, [search]);

  const detailQuery = useProgram(detailId);
  const publicQuery = usePublicPrograms(term, {
    enabled: section === 'programs' && tab === 'catalog',
  });

  useEffect(() => {
    if (!location.state?.programId) return;
    window.history.replaceState({}, '');
  }, [location.state]);

  const handleAiGenerated = (program) => {
    setGeneratedProgram(generatedProgramToBuilder(program));
    setAiQuizOpen(false);
  };

  const handleCreateGenerated = (payload) => {
    create.mutate(payload, {
      onSuccess: (program) => {
        setGeneratedProgram(null);
        setTab('mine');
        setDetailId(program.id);
      },
    });
  };

  const handleCreate = (payload) => {
    create.mutate(payload, {
      onSuccess: () => setBuilderOpen(false),
    });
  };

  const handleUpdate = (payload) => {
    update.mutate(
      { id: editProgram.id, ...payload },
      { onSuccess: () => setEditProgram(null) }
    );
  };

  const handleDelete = (id) => {
    if (
      !window.confirm(
        'Удалить программу? Запланированные тренировки по ней будут удалены.'
      )
    ) {
      return;
    }

    remove.mutate(id, {
      onSuccess: () => setDetailId(null),
    });
  };

  const handleFork = (id) => {
    fork.mutate(id, {
      onSuccess: () => {
        setDetailId(null);
        setTab('mine');
      },
    });
  };

  const isOwner =
    detailQuery.data?.owner_id === me?.id;
  const mine = programsQuery.data || [];
  const mineCount = mine.length;

  return (
    <div className="space-y-5">
      <section
        aria-label="Программы"
        className="epic-feature-hero relative isolate clip-card-art overflow-hidden rounded-2xl border border-border bg-surface p-5 sm:p-7"
      >
        <CardArt name="spartan-discipline" className="card-art-hero" />
        <button
          type="button"
          onClick={() => setSection('programs')}
          aria-pressed={section === 'programs'}
          className={clsx(
            'rounded-xl px-4 py-2 text-sm font-semibold transition-colors',
            section === 'programs'
              ? 'bg-terracotta/15 text-terracotta-ink'
              : 'text-text-muted hover:bg-surface-2 hover:text-text'
          )}
        >Программы</button>
        <span aria-hidden="true" className="text-text-muted">/</span>
        <button
          type="button"
          onClick={() => setSection('exercises')}
          aria-pressed={section === 'exercises'}
          className={clsx(
            'rounded-xl px-4 py-2 text-sm font-semibold transition-colors',
            section === 'exercises'
              ? 'bg-terracotta/15 text-terracotta-ink'
              : 'text-text-muted hover:bg-surface-2 hover:text-text'
          )}
        >Упражнения</button>

        <div className="relative pr-[34%] sm:pr-40">
          <p className="font-display text-sm font-semibold uppercase tracking-[0.14em] text-text-muted">
            Программы
          </p>

          <h1 className="mt-2 font-display text-3xl font-extrabold leading-tight tracking-tight text-text sm:text-4xl">
            {mineCount
              ? `${mineCount} ${plural(
                  mineCount,
                  ['маршрут', 'маршрута', 'маршрутов']
                )}`
              : 'Маршрут не проложен'}
          </h1>

          <p className="mt-2 max-w-[38ch] text-sm text-text-muted">
            План на недели вперёд: дни, упражнения,
            подходы. Календарь разложит их сам.
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            <Button
              size="lg"
              onClick={() => setBuilderOpen(true)}
            >
              <Plus size={18} /> Создать программу
            </Button>

            <Button
              size="lg"
              variant="secondary"
              onClick={() => setAiQuizOpen(true)}
            >
              <Sparkles size={18} />
              Сгенерировать
            </Button>
          </div>
        </div>
      </section>

      {section === 'exercises' && <ExerciseLibrary />}

      {section === 'programs' && <div
        role="tablist"
        aria-label="Источник программ"
        className="flex gap-1 overflow-x-auto border-b border-border"
      >
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
      </div>}

      {section === 'programs' && tab === 'mine' && (
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
              <ProgramCard
                key={p.id}
                program={p}
                onOpen={(x) => setDetailId(x.id)}
              />
            ))}
          </div>
        )
      )}

      {section === 'programs' && tab === 'official' && (
        <OfficialPrograms
          onCopied={(program) => {
            setTab('mine');
            setDetailId(program.id);
          }}
        />
      )}

      {section === 'programs' && tab === 'catalog' && (
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
                title={
                  term ? 'Ничего не нашлось' : 'Каталог пуст'
                }
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
                <ProgramCard
                  key={p.id}
                  program={p}
                  showAuthor
                  onOpen={(x) => setDetailId(x.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <Sheet
        isOpen={aiQuizOpen}
        onClose={() => setAiQuizOpen(false)}
        title="Программа с ИИ"
      >
        {aiQuizOpen && (
          <AiProgramQuiz
            onGenerated={handleAiGenerated}
            onCancel={() => setAiQuizOpen(false)}
          />
        )}
      </Sheet>

      <Sheet
        isOpen={!!generatedProgram}
        onClose={() => setGeneratedProgram(null)}
        title="Проверь программу"
      >
        {generatedProgram && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-terracotta/25 bg-terracotta/10 p-4 text-sm leading-relaxed text-text">
            ИИ подготовил черновик. Проверь упражнения, подходы и отдых.
            </div>

            <ProgramBuilder
              initial={generatedProgram}
              submitLabel="Сохранить программу"
              onSubmit={handleCreateGenerated}
              isSubmitting={create.isPending}
              onCancel={() => setGeneratedProgram(null)}
            />
          </div>
        )}
      </Sheet>

      <Sheet
        isOpen={builderOpen}
        onClose={() => setBuilderOpen(false)}
        title="Новая программа"
      >
        <ProgramBuilder
          onSubmit={handleCreate}
          isSubmitting={create.isPending}
          onCancel={() => setBuilderOpen(false)}
        />
      </Sheet>

      <Sheet
        isOpen={!!editProgram}
        onClose={() => setEditProgram(null)}
        title="Редактировать программу"
      >
        {editProgram && (
          <ProgramBuilder
            initial={programToBuilder(editProgram)}
            submitLabel="Сохранить изменения"
            onSubmit={handleUpdate}
            isSubmitting={update.isPending}
            onCancel={() => setEditProgram(null)}
          />
        )}
      </Sheet>

      <Sheet
        isOpen={!!detailId}
        onClose={() => setDetailId(null)}
        title="Программа"
      >
        <ProgramDetail
          program={detailQuery.data}
          isLoading={detailQuery.isLoading}
          isOwner={isOwner}
          onSchedule={(p) => {
            setDetailId(null);
            setScheduleProgram(p);
          }}
          onEdit={(p) => {
            setDetailId(null);
            setEditProgram(p);
          }}
          onShare={(p) => {
            setDetailId(null);
            setShareProgram(p);
          }}
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
          onSchedule={(payload) =>
            schedule.mutate(payload, {
              onSuccess: () => setScheduleProgram(null),
            })
          }
          isScheduling={schedule.isPending}
        />
      )}

      <ShareDialog
        isOpen={!!shareProgram}
        onClose={() => setShareProgram(null)}
        title={shareProgram?.title}
        programId={shareProgram?.id}
      />
    </div>
  );
};
