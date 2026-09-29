import { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { clsx } from 'clsx';
import { inputVariants, labelVariants, fieldSpacing, idleBorder } from './field.styles.js';

export const PasswordInput = forwardRef(
  ({ label, error, id, variant = 'box', ...props }, ref) => {
    const [visible, setVisible] = useState(false);

    return (
      <div className={fieldSpacing[variant]}>
        {label && (
          <label htmlFor={id} className={labelVariants[variant]}>
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            id={id}
            type={visible ? 'text' : 'password'}
            className={clsx(
              inputVariants[variant],
              'pr-12',
              error ? 'border-crimson' : idleBorder[variant]
            )}
            {...props}
          />
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            className={clsx(
              'absolute top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center text-text-muted transition-colors hover:text-text',
              variant === 'rule' ? 'right-0' : 'right-1.5'
            )}
            aria-label={visible ? 'Скрыть пароль' : 'Показать пароль'}
            tabIndex={-1}
          >
            {visible ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {error && <p className="text-xs text-crimson">{error}</p>}
      </div>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';
