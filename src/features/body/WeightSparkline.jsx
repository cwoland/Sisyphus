import { clsx } from 'clsx';

export const WeightSparkline = ({ points, className }) => {
  if (!points || points.length < 2) return null;

  const values = points.map((p) => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;

  const at = (i, value) => ({
    x: (i / (points.length - 1)) * 100,
    y: 100 - ((value - min) / span) * 100,
  });

  const d = points
    .map((p, i) => {
      const { x, y } = at(i, p.value);
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(' ');

  const lastY = at(points.length - 1, values[values.length - 1]).y;

  return (
    <div className={clsx('relative h-14 w-full', className)}>
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="h-full w-full"
        aria-hidden="true"
      >
        <path
          d={d}
          fill="none"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          className="stroke-accent"
        />
      </svg>
      <span
        className="absolute h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent"
        style={{ left: '100%', top: `${lastY}%` }}
      />
    </div>
  );
};