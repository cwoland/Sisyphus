import { Globe, Lock, ChevronRight } from 'lucide-react';
import { plural } from '../../../shared/lib/plural.js';

export const ProgramCard = ({ program, onOpen, showAuthor = false }) => {
  const days = Number(program.days_count) || 0;
  const exercises = Number(program.exercises_count) || 0;

  return (
    <button
      onClick={() => onOpen(program)}
      className="group flex min-h-[104px] w-full items-start gap-3 rounded-2xl border border-border bg-surface p-4 text-left transition-colors hover:border-border-strong hover:bg-surface-2"
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="min-w-0 truncate font-display text-base font-bold text-text">
            {program.title}
          </h3>
          {!showAuthor && (
            program.is_public
              ? <Globe size={14} className="shrink-0 text-terracotta-ink" aria-label="Публичная" />
              : <Lock size={14} className="shrink-0 text-text-muted" aria-label="Личная" />
          )}
        </div>

        {showAuthor && program.author_username && (
          <p className="mt-0.5 truncate text-xs text-text-muted">@{program.author_username}</p>
        )}

        {program.description && (
          <p className="mt-1 line-clamp-2 text-sm text-text-muted">{program.description}</p>
        )}

        <p className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 font-display text-xs uppercase tracking-[0.1em] text-text-muted">
          <span className="tabular-nums">
            {days} {plural(days, ['день', 'дня', 'дней'])}
          </span>
          {exercises > 0 && (
            <span className="tabular-nums">
              {exercises} {plural(exercises, ['упражнение', 'упражнения', 'упражнений'])}
            </span>
          )}
        </p>
      </div>

      <ChevronRight size={18} className="mt-0.5 shrink-0 text-text-muted transition-colors group-hover:text-text" />
    </button>
  );
};