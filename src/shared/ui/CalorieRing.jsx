import { clsx } from 'clsx';

export const CalorieRing = ({ consumed = 0, target = 2000, size = 96, primary, caption, tone }) => {
  const stroke = size >= 120 ? 10 : 8;
  const radius = size / 2 - stroke;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(consumed / target, 1);
  const over = consumed > target;
  const big = size >= 116;

  return (
    <div className="relative flex shrink-0 items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" strokeWidth={stroke} className="stroke-surface-2" />
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none" strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - progress)}
          className={over ? 'stroke-danger' : 'stroke-accent'}
          style={{ transition: 'stroke-dashoffset .6s cubic-bezier(.16,1,.3,1)' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center leading-none">
        <span
          className={clsx(
            'font-display font-bold tabular-nums',
            big ? 'text-3xl' : 'text-xl',
            tone === 'over' ? 'text-danger' : 'text-text'
          )}
        >
          {primary ?? consumed}
        </span>
        <span className={clsx('mt-1 text-text-muted', big ? 'text-[11px]' : 'text-[10px]')}>
          {caption ?? `из ${target}`}
        </span>
      </div>
    </div>
  );
};