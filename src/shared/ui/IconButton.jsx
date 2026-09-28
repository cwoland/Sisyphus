import { clsx } from 'clsx';

export const IconButton = ({ icon: Icon, size = 16, box = 'h-10 w-10', className, ...props }) => (
  <button
    type="button"
    {...props}
    className={clsx(
      'relative inline-flex shrink-0 items-center justify-center rounded-lg transition-colors',
      'after:absolute after:-inset-1 after:content-[""]',
      box,
      className
    )}
  >
    <Icon size={size} />
  </button>
);
