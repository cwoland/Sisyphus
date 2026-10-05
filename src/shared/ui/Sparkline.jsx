import { clsx } from 'clsx';

export const Sparkline = ({ points, className, tone = 'stroke-accent', dotTone = 'bg-accent' }) => {
  if (!points || points.length < 2) return null;

  const values = points.map((p) => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;

  const yAt = (value) => 100 - ((value - min) / span) * 100;

  const d = points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * 100;
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${yAt(p.value).toFixed(2)}`;
    })
    .join(' ');

  const lastY = yAt(values[values.length - 1]);

  return (
    <div className={clsx('relative', className)}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full" aria-hidden="true">
        <path
          d={d}
          fill="none"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          className={tone}
        />
      </svg>
      <span
        className={clsx('absolute h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full', dotTone)}
        style={{ left: '100%', top: `${lastY}%` }}
      />
    </div>
  );
};
