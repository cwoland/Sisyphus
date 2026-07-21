export const CalorieRing = ({ consumed = 0, target = 2000 }) => {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(consumed / target, 1);
  const offset = circumference * (1 - progress);
  const over = consumed > target;

  return (
    <div className="relative flex items-center justify-center">
      <svg width="128" height="128" className="-rotate-90">
        <circle cx="64" cy="64" r={radius} fill="none" strokeWidth="10" className="stroke-surface-2" />
        <circle
          cx="64"
          cy="64"
          r={radius}
          fill="none"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={over ? 'stroke-crimson' : 'stroke-accent'}
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="font-display text-2xl font-bold text-text">{consumed}</span>
        <span className="text-xs text-text-muted">из {target}</span>
      </div>
    </div>
  );
};