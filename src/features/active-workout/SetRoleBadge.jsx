import { clsx } from 'clsx';

const ROLES = {
  normal: { short: 'N', label: 'Обычный подход', className: 'bg-surface-2 text-text-muted' },
  warmup: { short: 'W', label: 'Разминочный подход', className: 'bg-gold/15 text-gold-ink' },
  failure: { short: 'F', label: 'Подход до отказа', className: 'bg-danger/10 text-danger' },
  drop: { short: 'D', label: 'Дроп-подход', className: 'bg-terracotta/15 text-terracotta-ink' },
};

export const SetRoleBadge = ({ set, compact = false, className }) => {
  if (!set) return null;
  const key = set.set_kind === 'drop' ? 'drop' : set.set_role || 'normal';
  const role = ROLES[key] || ROLES.normal;

  return (
    <span
      className={clsx(
        'inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg font-semibold',
        compact ? 'min-h-7 min-w-7 px-1.5 text-[11px]' : 'min-h-9 px-3 text-xs',
        role.className,
        className
      )}
      aria-label={role.label}
      title={role.label}
    >
      <span aria-hidden="true">{role.short}</span>
      {!compact && <span>{role.label}</span>}
    </span>
  );
};
