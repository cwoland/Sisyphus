import { Minus, Plus } from 'lucide-react';
import { clsx } from 'clsx';

export const NumberStepper = ({ label, value, onChange, step = 1, min = 0, max, suffix, className }) => {
  const num = value === '' || value == null ? null : Number(value);

  const nudge = (delta) => {
    const base = num ?? 0;
    const next = Math.round((base + delta) * 100) / 100;
    if (next < min) return;
    if (max != null && next > max) return;
    onChange(String(next));
  };

  return (
    <div className={clsx('flex flex-col items-center gap-2', className)}>
      <span className="font-display text-[11px] font-semibold uppercase tracking-[0.16em] text-text-muted">
        {suffix ? `${label}, ${suffix}` : label}
      </span>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => nudge(-step)}
          className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-surface-2 text-text transition-colors hover:bg-border after:absolute after:-inset-0.5 after:content-['']"
          aria-label={`${label}: меньше на ${step}`}
        >
          <Minus size={18} />
        </button>

        <input
          type="number"
          inputMode="decimal"
          step={step}
          min={min}
          max={max}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          aria-label={label}
          className="h-11 w-20 rounded-xl border border-border-strong bg-surface text-center font-display text-xl font-bold tabular-nums text-text focus:outline-none focus:ring-2 focus:ring-accent"
        />

        <button
          type="button"
          onClick={() => nudge(step)}
          className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-surface-2 text-text transition-colors hover:bg-border after:absolute after:-inset-0.5 after:content-['']"
          aria-label={`${label}: больше на ${step}`}
        >
          <Plus size={18} />
        </button>
      </div>
    </div>
  );
};