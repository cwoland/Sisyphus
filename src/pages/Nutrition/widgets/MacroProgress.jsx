import { clsx } from 'clsx';

const num = (v) => Math.round(Number(v) || 0);

const MacroRule = ({ label, consumed, target }) => {
  const c = num(consumed);
  const t = num(target);
  const ratio = t > 0 ? Math.min(c / t, 1) : 0;
  const over = t > 0 && c > t;

  return (
    <div className="min-w-0">
      <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
        <div
          className={clsx('h-full rounded-full transition-[width] duration-500', over ? 'bg-gold' : 'bg-accent')}
          style={{ width: `${ratio * 100}%` }}
        />
      </div>
      <dt className="mt-2 truncate text-xs text-text-muted">{label}</dt>
      <dd className="font-display text-base font-bold tabular-nums text-text">
        {c}
        <span className="text-xs font-normal text-text-muted"> / {t} г</span>
      </dd>
    </div>
  );
};

export const MacroProgress = ({ consumed, target, onSetTargets }) => {
  if (!target) {
    return (
      <p className="text-sm text-text-muted">
        Цели не заданы.{' '}
        <button onClick={onSetTargets} className="font-medium text-terracotta-ink underline-offset-4 hover:underline">
          Задайте их
        </button>
        , чтобы видеть прогресс.
      </p>
    );
  }

  return (
    <dl className="grid grid-cols-1 gap-3 xs:grid-cols-3 xs:gap-4">
      <MacroRule label="Белки" consumed={consumed?.total_protein} target={target.protein} />
      <MacroRule label="Жиры" consumed={consumed?.total_fat} target={target.fat} />
      <MacroRule label="Углеводы" consumed={consumed?.total_carbs} target={target.carbs} />
    </dl>
  );
};