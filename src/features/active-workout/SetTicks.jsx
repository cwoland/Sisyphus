import { clsx } from 'clsx';

const describe = (set, index, isCurrent) => {
  const label = set.label || `Подход ${index + 1}`;

  if (set.is_completed) {
    if (set.duration_sec != null) return `${label}: ${set.duration_sec} секунд`;
    if (set.weight != null) return `${label}: ${Number(set.weight)} кг × ${set.reps ?? '—'}`;
    if (set.reps != null) return `${label}: ${set.reps} повторов`;
    return `${label}: выполнен`;
  }

  return `${label}: ${isCurrent ? 'текущий' : 'не выполнен'}`;
};

export const SetTicks = ({ sets, currentId, onOpen, maxHeight = 240 }) => (
  <ul
    className="flex flex-col flex-wrap content-start gap-1.5"
    style={{ maxHeight }}
    aria-label="Подходы упражнения"
  >
    {sets.map((set, i) => {
      const isCurrent = set.id === currentId;

      return (
        <li key={set.id}>
          <button
            type="button"
            onClick={onOpen}
            aria-label={describe(set, i, isCurrent)}
            className={clsx(
              'relative flex h-9 w-9 items-center justify-center rounded-lg',
              'font-display text-sm font-bold tabular-nums transition-colors',
              'after:absolute after:-inset-1 after:content-[""]',
              set.is_completed
                ? 'bg-accent text-on-accent'
                : isCurrent
                  ? 'border-2 border-accent bg-surface text-text'
                  : 'bg-surface-2/80 text-text-muted'
            )}
          >
            {i + 1}
          </button>
        </li>
      );
    })}
  </ul>
);
