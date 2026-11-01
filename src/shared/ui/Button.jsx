import './epic.css';
import { clsx } from 'clsx';
import { Spinner } from './Spinner.jsx';

export const Button = ({ children, variant = 'primary', size = 'md', shape = 'rounded',
  isLoading = false, disabled, className, type = 'button', ...props }) => {
  const variants = {
    primary: 'bg-cta text-on-cta hover:bg-cta-hover',
    secondary: 'border border-text-muted bg-surface-2 text-text hover:bg-border',
    ghost: 'bg-transparent text-text hover:bg-surface-2',
    danger: 'bg-danger text-on-danger hover:brightness-95',
  };
  const sizes = { sm: 'min-h-11 px-3 py-2 text-sm', md: 'min-h-11 px-5 py-2.5 text-sm', lg: 'min-h-12 px-6 py-3 text-base' };
  return <button {...props} type={type} disabled={disabled || isLoading} aria-busy={isLoading || undefined}
    className={clsx('epic-button inline-flex min-w-0 items-center justify-center gap-2 text-center font-semibold leading-snug disabled:cursor-not-allowed disabled:opacity-50',
      shape === 'square' ? 'rounded-none' : 'rounded-xl', variants[variant] || variants.primary,
      sizes[size] || sizes.md, className)}>
    {isLoading && <Spinner size="sm" className="shrink-0 border-current border-t-transparent" />}
    {children}
  </button>;
};
