import { clsx } from 'clsx';
import { Spinner } from './Spinner.jsx';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  className,
  ...props
}) => {
  const base = 'inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-accent text-white hover:bg-accent-hover',
    secondary: 'bg-surface-2 text-text hover:bg-border',
    ghost: 'text-text hover:bg-surface-2',
    danger: 'bg-crimson text-white hover:bg-burgundy',
  };

  const sizes = {
    sm: 'h-9 px-3 text-sm',
    md: 'h-11 px-5 text-sm',
    lg: 'h-12 px-6 text-base',
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={clsx(base, variants[variant], sizes[size], className)}
      {...props}
    >
      {isLoading && <Spinner size="sm" className="border-current border-t-transparent" />}
      {children}
    </button>
  );
};