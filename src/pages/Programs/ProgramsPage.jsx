import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Plus, Dumbbell, Globe, Lock, ChevronRight, Compass, User } from 'lucide-react';

import { usePrograms, useProgram, useProgramMutations, usePublicPrograms } from './programs.hooks.js';
import { useAuthStore } from '../../entities/user/auth.store.js';
import { ProgramBuilder } from './widgets/ProgramBuilder.jsx';
import { ProgramDetail } from './widgets/ProgramDetail.jsx';
import { ScheduleDialog } from './widgets/ScheduleDialog.jsx';
import { Sheet } from '../../shared/ui/Sheet.jsx';
import { Button } from '../../shared/ui/Button.jsx';
import { EmptyState } from '../../shared/ui/EmptyState.jsx';
import { SkeletonList } from '../../shared/ui/Skeleton.jsx';
import { emptyStates } from '../../shared/lib/sisyphusPhrases.js';

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

  const programsQuery = usePrograms();
  const { create, update, remove, schedule, fork } = useProgramMutations();

  const [tab, setTab] = useState('mine');
  const [editProgram, setEditProgram] = useState(null);
  const [builderOpen, setBuilderOpen] = useState(false);
  const [detailId, setDetailId] = useState(null);
  const [scheduleProgram, setScheduleProgram] = useState(null);

  const detailQuery = useProgram(detailId);
  const publicQuery = usePublicPrograms('', { enabled: tab === 'catalog' });

  useEffect(() => {
    if (location.state?.programId) setDetailId(location.state.programId);
  }, [location.state]);

  const handleCreate = (payload) => {
    create.mutate(payload, { onSuccess: () => setBuilderOpen(false) });
  };

  const handleUpdate = (payload) => {
    update.mutate({ id: editProgram.id, ...payload }, {
      onSuccess: () => { setEditProgram(null); setDetailId(null); },
    });
  };

  const handleDelete = (id) => {
    remove.mutate(id, { onSuccess: () => setDetailId(null) });
  };

  const handleFork = (id) => {
    fork.mutate(id, { onSuccess: () => { setDetailId(null); setTab('mine'); } });
  };

  const isOwner = detailQuery.data?.owner_id === me?.id;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-text">Программы</h1>
        <Button onClick={() => setBuilderOpen(true)}>
          <Plus size={18} /> Создать
        </Button>
      </div>

      <div className="flex gap-1 rounded-xl bg-surface-2 p-1">
        <button
          onClick={() => setTab('mine')}
          className={`flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-medium transition-colors ${
            tab === 'mine' ? 'bg-surface text-text shadow-sm' : 'text-text-muted'
          }`}
        >
          <User size={16} /> Мои
        </button>
        <button
          onClick={() => setTab('catalog')}
          className={`flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-medium transition-colors ${
            tab === 'catalog' ? 'bg-surface text-text shadow-sm' : 'text-text-muted'
          }`}
        >
          <Compass size={16} /> Каталог
        </button>
      </div>

      {tab === 'mine' && (
        programsQuery.isLoading ? (
          <SkeletonList count={3} />
        ) : programsQuery.data?.length === 0 ? (
          <div className="rounded-2xl border border-border bg-surface">
            <EmptyState
              icon={Dumbbell}
              {...emptyStates.programs}
              action={<Button onClick={() => setBuilderOpen(true)}><Plus size={18} /> Создать программу</Button>}
            />
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {programsQuery.data.map((p) => (
              <button
                key={p.id}
                onClick={() => setDetailId(p.id)}
                className="flex items-center justify-between rounded-2xl border border-border bg-surface p-4 text-left transition-colors hover:bg-surface-2"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-medium text-text">{p.title}</p>
                    {p.is_public
                      ? <Globe size={14} className="shrink-0 text-accent" />
                      : <Lock size={14} className="shrink-0 text-text-muted" />}
                  </div>
                  {p.description && <p className="mt-0.5 truncate text-sm text-text-muted">{p.description}</p>}
                </div>
                <ChevronRight size={18} className="shrink-0 text-text-muted" />
              </button>
            ))}
          </div>
        )
      )}

      {tab === 'catalog' && (
        publicQuery.isLoading ? (
          <SkeletonList count={3} />
        ) : publicQuery.data?.length === 0 ? (
          <div className="rounded-2xl border border-border bg-surface">
            <EmptyState
              icon={Compass}
              title="Каталог пуст"
              description="Пока никто не открыл свою программу. Будь первым — отметь свою как публичную."
            />
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {publicQuery.data.map((p) => (
              <button
                key={p.id}
                onClick={() => setDetailId(p.id)}
                className="flex items-center justify-between rounded-2xl border border-border bg-surface p-4 text-left transition-colors hover:bg-surface-2"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-text">{p.title}</p>
                  <p className="mt-0.5 truncate text-xs text-text-muted">
                    @{p.author_username} · {p.days_count} дн.
                  </p>
                  {p.description && <p className="mt-0.5 truncate text-sm text-text-muted">{p.description}</p>}
                </div>
                <ChevronRight size={18} className="shrink-0 text-text-muted" />
              </button>
            ))}
          </div>
        )
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
          onSchedule={(p) => setScheduleProgram(p)}
          onEdit={(p) => setEditProgram(p)}
          onDelete={handleDelete}
          onFork={handleFork}
          isForking={fork.isPending}
        />
      </Sheet>

      <ScheduleDialog
        isOpen={!!scheduleProgram}
        onClose={() => setScheduleProgram(null)}
        program={scheduleProgram}
        onSchedule={(payload) => schedule.mutate(payload, { onSuccess: () => setScheduleProgram(null) })}
        isScheduling={schedule.isPending}
      />
    </div>
  );
};