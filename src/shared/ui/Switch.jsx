import { clsx } from 'clsx';

export const Switch = ({ checked, onChange, disabled, label }) => (
    <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={clsx(
            'relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors',
            'disabled:cursor-not-allowed disabled:opacity-60',
            checked ? 'bg-accent' : 'bg-surface-2 ring-1 ring-inset ring-border-strong'
        )}
    >
        <span
            className={clsx(
                'inline-block h-5 w-5 rounded-full transition-transform', checked ? 'translate-x-6 bg-on-accent' : 'translate-x-1 bg-text-muted'
            )}
        />
    </button>
);