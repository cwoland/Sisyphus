import { clsx } from 'clsx';

const MacroBar = ({ label, consumed, target, unit = 'г' }) => {
  const c = Math.round(Number(consumed) || 0);
  const t = Math.round(Number(target) || 0);
  const ratio = t > 0 ? Math.min(c / t, 1) : 0;
  const over = t > 0 && c > t;

  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="text-text-muted">{label}</span>
        <span className="text-text">
          {c}<span className="text-text-muted"> / {t} {unit}</span>
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-surface-2">
        <div
          className={clsx('h-full rounded-full transition-all duration-500', over ? 'bg-crimson' : 'bg-accent')}
          style={{ width: `${ratio * 100}%` }}
        />
      </div>
    </div>
  );
};

export const MacroProgress = ({ consumed, target }) => {
  if (!target) {
    return (
      <p className="text-sm text-text-muted">
        Цели не заданы. Установите их, чтобы видеть прогресс.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <MacroBar label="Калории" consumed={consumed?.total_calories} target={target.calories} unit="ккал" />
      <MacroBar label="Белки" consumed={consumed?.total_protein} target={target.protein} />
      <MacroBar label="Жиры" consumed={consumed?.total_fat} target={target.fat} />
      <MacroBar label="Углеводы" consumed={consumed?.total_carbs} target={target.carbs} />
    </div>
  );
};