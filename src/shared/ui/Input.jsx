import { forwardRef } from 'react';
import { clsx } from 'clsx';

export const Input = forwardRef(({ label, error, className, id, ...props }, ref) => (
  <div className="space-y-1.5">
    {label && (
      <label htmlFor={id} className="block text-sm font-medium text-text">
        {label}
      </label>
    )}
    <input
      ref={ref}
      id={id}
      className={clsx(
        'w-full rounded-xl border bg-surface px-4 py-3 text-sm text-text placeholder:text-text-muted transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1 focus:ring-offset-bg',
        error ? 'border-crimson' : 'border-border',
        className
      )}
      {...props}
    />
    {error && <p className="text-xs text-crimson">{error}</p>}
  </div>
));

Input.displayName = 'Input';