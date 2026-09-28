import { forwardRef } from 'react';
import { clsx } from 'clsx';
import { inputVariants, labelVariants, fieldSpacing, idleBorder } from './field.styles.js';

export const Input = forwardRef(
  ({ label, error, className, id, variant = 'box', ...props }, ref) => (
    <div className={fieldSpacing[variant]}>
      {label && (
        <label htmlFor={id} className={labelVariants[variant]}>
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={id}
        className={clsx(inputVariants[variant], error ? 'border-crimson' : idleBorder[variant], className)}
        {...props}
      />
      {error && <p className="text-xs text-crimson">{error}</p>}
    </div>
  )
);

Input.displayName = 'Input';
