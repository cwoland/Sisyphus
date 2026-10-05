import { clsx } from 'clsx';

const VALUES = [6, 7, 8, 9, 10];

export const RpePicker = ({ value, onChange }) => {
  const current = value == null ? null : Number(value);

  return (
    <div className="flex flex-col items-center gap-2">
      <span className="font-display text-[11px] font-semibold uppercase tracking-[0.16em] text-text-muted">
        Тяжесть
      </span>

      <div className="flex items-center gap-1" role="group" aria-label="Оценка тяжести подхода по шкале RPE">
        {VALUES.map((v) => {
          const active = current === v;
          return (
            <button
              key={v}
              type="button"
              onClick={() => onChange(active ? null : v)}
              aria-pressed={active}
              className={clsx(
                'relative flex h-10 w-10 items-center justify-center rounded-xl',
                'font-display text-sm font-bold tabular-nums transition-colors',
                'after:absolute after:-inset-0.5 after:content-[""]',
                active ? 'bg-gold text-on-gold' : 'bg-surface-2 text-text-muted hover:text-text'
              )}
            >
              {v}
            </button>
          );
        })}
      </div>
    </div>
  );
};