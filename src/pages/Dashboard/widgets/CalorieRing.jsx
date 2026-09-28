export const CalorieRing = ({ consumed = 0, target = 2000, size = 96 }) => {
  const stroke = size >= 120 ? 10 : 8;
  const radius = size / 2 - stroke;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(consumed / target, 1);
  const over = consumed > target;

  return (
    <div className="relative flex shrink-0 items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={radius} fill="none" strokeWidth={stroke} className="stroke-surface-2" />
        <circle
          cx={size/2} cy={size/2} r={radius} fill="none" strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - progress)}
          className={over ? 'stroke-danger' : 'stroke-accent'}
          style={{ transition: 'stroke-dashoffset .6s cubic-bezier(.16,1,.3,1)' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center leading-none">
        <span className="font-display text-xl font-bold tabular-nums text-text">{consumed}</span>
        <span className="mt-0.5 text-[10px] text-text-muted">из {target}</span>
      </div>
    </div>
  );
};