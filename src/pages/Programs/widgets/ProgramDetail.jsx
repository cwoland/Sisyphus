import { CalendarPlus, Trash2, Globe, Lock, Pencil, Copy, Share2, Link2 } from 'lucide-react';
import { clsx } from 'clsx';
import { Button } from '../../../shared/ui/Button.jsx';
import { Skeleton } from '../../../shared/ui/Skeleton.jsx';
import { muscleGroupLabel } from '../../../entities/exercise/muscleGroups.js';
import { trackingOf, formatDuration } from '../../../entities/exercise/tracking.js';
import { PROGRAM_KINDS, programKindLabel } from '../../../entities/program/programKinds.js';
import { plural } from '../../../shared/lib/plural.js';

const groupExercises = (exercises) => {
  const out = [];
  for (const ex of exercises) {
    const last = out[out.length - 1];
    if (last && last.groupIndex === ex.group_index) last.exercises.push(ex);
    else out.push({ groupIndex: ex.group_index, exercises: [ex] });
  }
  return out;
};

const targetOf = (ex) => {
  if (trackingOf(ex) !== 'duration') return `×${ex.target_reps}`;
  const seconds = Number(ex.target_reps);
  return Number.isFinite(seconds) ? `×${formatDuration(seconds)}` : `×${ex.target_reps}`;
};

export const ProgramDetail = ({ program, isLoading, isOwner, onSchedule, onEdit, onShare, onDelete, onFork, isForking }) => {
  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }
  if (!program) return null;

  const kind = program.kind || 'strength';
  const isCircuit = kind === 'crossfit';
  const KindIcon = PROGRAM_KINDS.find((k) => k.value === kind)?.icon;
  const totalExercises = program.days.reduce((sum, d) => sum + d.exercises.length, 0);

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center gap-2">
          <h2 className="min-w-0 font-display text-xl font-bold text-text">{program.title}</h2>
          {program.is_public
            ? <Globe size={16} className="shrink-0 text-terracotta-ink" aria-label="Публичная" />
            : <Lock size={16} className="shrink-0 text-text-muted" aria-label="Личная" />}
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span
            className={clsx(
              'inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium',
              isCircuit ? 'bg-terracotta/15 text-terracotta-ink' : 'bg-surface-2 text-text-muted'
            )}
          >
            {KindIcon && <KindIcon size={13} />}
            {programKindLabel(kind)}
          </span>

          <span className="font-display text-xs uppercase tracking-[0.1em] text-text-muted">
            {program.days.length} {plural(program.days.length, ['день', 'дня', 'дней'])}
            {totalExercises > 0 && ` · ${totalExercises} ${plural(totalExercises, ['упражнение', 'упражнения', 'упражнений'])}`}
          </span>
        </div>

        {program.description && <p className="mt-2 text-sm text-text-muted">{program.description}</p>}
      </div>

      <div className="flex flex-wrap gap-2">
        {isOwner ? (
          <>
            <Button size="sm" onClick={() => onSchedule(program)}>
              <CalendarPlus size={16} /> В календарь
            </Button>
            <Button size="sm" variant="secondary" onClick={() => onEdit(program)}>
              <Pencil size={16} /> Изменить
            </Button>
            <Button size="sm" variant="secondary" onClick={() => onShare(program)}>
              <Share2 size={16} /> Поделиться
            </Button>
            <Button
              size="sm" variant="ghost"
              className="text-danger hover:bg-danger/10"
              onClick={() => onDelete(program.id)}
            >
              <Trash2 size={16} /> Удалить
            </Button>
          </>
        ) : (
          <Button size="sm" onClick={() => onFork(program.id)} isLoading={isForking}>
            <Copy size={16} /> Скопировать себе
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {program.days.map((day, i) => {
          const groups = groupExercises(day.exercises);
          const rounds = Math.max(...day.exercises.map((ex) => ex.target_sets), 0);

          return (
            <div key={day.id} className="rounded-2xl border border-border bg-surface p-4">
              <div className="mb-3 flex items-baseline gap-2">
                <span className="font-display text-xs tabular-nums text-text-muted">{i + 1}</span>
                <h3 className="min-w-0 flex-1 font-display font-semibold text-text">{day.title}</h3>
                {isCircuit && rounds > 0 && (
                  <span className="shrink-0 font-display text-xs font-semibold uppercase tracking-[0.1em] text-terracotta-ink">
                    {rounds} {plural(rounds, ['раунд', 'раунда', 'раундов'])}
                  </span>
                )}
              </div>

              <ol className="space-y-2">
                {groups.map((group) => {
                  const isSuperset = group.exercises.length > 1;
                  const groupRounds = group.exercises[0].target_sets;

                  return (
                    <li
                      key={`${day.id}-${group.groupIndex}`}
                      className={clsx(isSuperset && !isCircuit && 'rounded-xl border border-terracotta/40 p-2')}
                    >
                      {isSuperset && !isCircuit && (
                        <p className="mb-1.5 flex items-center gap-1 px-1 text-[11px] font-medium uppercase tracking-[0.1em] text-terracotta-ink">
                          <Link2 size={11} /> суперсет, {groupRounds}{' '}
                          {plural(groupRounds, ['раунд', 'раунда', 'раундов'])}
                        </p>
                      )}

                      <ol className="space-y-1.5">
                        {group.exercises.map((ex) => (
                          <li key={ex.id} className="flex items-center gap-3 rounded-lg bg-surface-2 px-3 py-2">
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm text-text">{ex.exercise_name}</p>
                              <p className="text-xs text-text-muted">{muscleGroupLabel(ex.muscle_group)}</p>
                            </div>
                            <span className="shrink-0 font-display text-sm font-bold tabular-nums text-text">
                              {!isCircuit && !isSuperset && ex.target_sets}
                              <span className="font-normal text-text-muted">{targetOf(ex)}</span>
                            </span>
                          </li>
                        ))}
                      </ol>
                    </li>
                  );
                })}
              </ol>
            </div>
          );
        })}
      </div>
    </div>
  );
};
