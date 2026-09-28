import { clsx } from 'clsx';

const SIZES = {
  sm: 'text-2xl',
  md: 'text-3xl',
  lg: 'text-5xl',
};

export const Logo = ({ size = 'md', className }) => (
  <span className={clsx('select-none font-logo tracking-wide', SIZES[size], className)}>
    SISYPHUS
  </span>
);