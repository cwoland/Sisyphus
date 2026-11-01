import {
  CalendarPlus,
  Trash2,
  Pencil,
  Copy,
  Share2,
  Globe,
  Lock,
} from 'lucide-react';
import { plural } from '../../../shared/lib/plural.js';
import { Button } from '../../../shared/ui/Button.jsx';
import { Skeleton } from '../../../shared/ui/Skeleton.jsx';
import { normalizeSetPlan } from '../../../entities/program/setPlan.js';
import { programKindLabel } from '../../../entities/program/programKinds.js';
import {
  trackingOf,
  formatDuration,
} from '../../../entities/exercise/tracking.js';

const grouped = (exercises) => {
  const blocks = [];

  for (const ex of exercises) {
    if (blocks.at(-1)?.key === ex.group_index) {
      blocks.at(-1).exercises.push(ex);
    } else {
      blocks.push({
        key: ex.group_index,
        exercises: [ex],
      });
    }
  }

  return blocks;
};

export const ProgramDetail = ({
  program,
  isLoading,
  isOwner,
  onSchedule,
  onEdit,
  onShare,
  onDelete,
  onFork,
  isForking,
}) => {
  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-8" />
        <Skeleton className="h-32" />
      </div>
    );
  }

  if (!program) return null;

  const circuit = program.kind === 'crossfit';

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center gap-2">
          <h2 className="min-w-0 break-words font-display text-xl font-bold text-text">
            {program.title}
          </h2>
          {program.is_public
            ? <Globe size={16} className="shrink-0" />
            : <Lock size={16} className="shrink-0" />}
        </div>

        <p className="mt-1 text-sm text-terracotta-ink">
          {programKindLabel(program.kind || 'strength')}
        </p>

        {program.description && (
          <p className="mt-2 whitespace-pre-wrap text-sm text-text-muted">
            {program.description}
          </p>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {isOwner ? (
          <>
            <Button
              size="sm"
              onClick={() => onSchedule(program)}
            >
              <CalendarPlus size={16} /> В календарь
            </Button>

            <Button
              size="sm"
              variant="secondary"
              onClick={() => onEdit(program)}
            >
              <Pencil size={16} /> Изменить
            </Button>

            <Button
              size="sm"
              variant="secondary"
              onClick={() => onShare(program)}
            >
              <Share2 size={16} /> Поделиться
            </Button>

            <Button
              size="sm"
              variant="ghost"
              className="text-danger"
              onClick={() => onDelete(program.id)}
            >
              <Trash2 size={16} /> Удалить
            </Button>
          </>
        ) : (
          <Button
            size="sm"
            onClick={() => onFork(program.id)}
            isLoading={isForking}
          >
            <Copy size={16} /> Скопировать себе
          </Button>
        )}
      </div>

      {program.days.map((day) => (
        <section
          key={day.id}
          className="space-y-3 rounded-2xl border border-border p-4"
        >
          <h3 className="font-display font-semibold text-text">
            {day.title}
          </h3>

          {grouped(day.exercises).map((block) => {
            const first = block.exercises[0];
            const plan = normalizeSetPlan(first.set_plan);
            const drop = plan.mode === 'drop';
            const group = block.exercises.length > 1;

            return (
              <div
                key={block.key}
                className="space-y-2 rounded-xl border border-border bg-surface-2 p-3"
              >
                <p className="text-sm font-semibold text-terracotta-ink">
                  {drop
                    ? `Дропсет · ${plan.steps.length} ${plural(
                        plan.steps.length,
                        ['ступень', 'ступени', 'ступеней']
                      )}`
                    : group
                      ? `${circuit ? 'Круг' : 'Суперсет'} · ${first.target_sets} ${plural(
                          first.target_sets,
                          ['раунд', 'раунда', 'раундов']
                        )}`
                      : `${first.target_sets} ${plural(
                          first.target_sets,
                          ['подход', 'подхода', 'подходов']
                        )}`}
                </p>

                {block.exercises.map((ex) => (
                  <div key={ex.id}>
                    <p className="break-words font-medium text-text">
                      {ex.exercise_name}
                    </p>

                    {!drop && (
                      <p className="text-sm text-text-muted">
                        {trackingOf(ex) === 'duration'
                          ? `${ex.target_reps} сек`
                          : `${ex.target_reps} повторений`}
                      </p>
                    )}

                    {ex.notes && (
                      <p className="whitespace-pre-wrap text-sm text-text-muted">
                        {ex.notes}
                      </p>
                    )}
                  </div>
                ))}

                {drop && (
                  <ol className="space-y-1">
                    {plan.steps.map((s, i) => (
                      <li
                        key={i}
                        className="text-sm tabular-nums text-text"
                      >
                        {i + 1}. {s.weight} кг × {s.reps}
                      </li>
                    ))}
                  </ol>
                )}

                <p className="text-xs text-text-muted">
                  {(group || drop) && 'Внутри без отдыха. '}
                  {plan.restSec > 0
                    ? `Отдых после ${
                        drop
                          ? 'серии'
                          : group
                            ? 'раунда'
                            : 'подхода'
                      }: ${formatDuration(plan.restSec)}.`
                    : 'После блока без отдыха.'}
                </p>
              </div>
            );
          })}
        </section>
      ))}
    </div>
  );
};