import { Minus, Plus } from 'lucide-react';
import { formatDuration } from '../../entities/exercise/tracking.js';

const STEP = 15;
const MAX = 3600;

export const DurationStepper = ({ value, onChange }) => {
  const seconds = Number(value) || 0;

  const nudge = (delta) => {
    const next = Math.min(MAX, Math.max(0, seconds + delta));
    onChange(next);
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <span className="font-display text-[11px] font-semibold uppercase tracking-[0.16em] text-text-muted">
        Время
      </span>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => nudge(-STEP)}
          className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-surface-2 text-text transition-colors hover:bg-border after:absolute after:-inset-0.5 after:content-['']"
          aria-label="Меньше на 15 секунд"
        >
          <Minus size={18} />
        </button>

        <output className="flex h-11 w-24 items-center justify-center rounded-xl border border-border-strong bg-surface font-display text-xl font-bold tabular-nums text-text">
          {formatDuration(seconds)}
        </output>

        <button
          type="button"
          onClick={() => nudge(STEP)}
          className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-surface-2 text-text transition-colors hover:bg-border after:absolute after:-inset-0.5 after:content-['']"
          aria-label="Больше на 15 секунд"
        >
          <Plus size={18} />
        </button>
      </div>
    </div>
  );
};