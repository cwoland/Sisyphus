import { clsx } from 'clsx';

export const Avatar = ({ name, src, size = 'md' }) => {
  const sizes = { sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-12 w-12 text-base' };
  const initial = (name || '?').charAt(0).toUpperCase();

  if (src) {
    return <img src={src} alt={name} className={clsx('rounded-full object-cover', sizes[size])} />;
  }

  return (
    <div className={clsx('flex items-center justify-center rounded-full bg-accent/15 font-semibold text-accent', sizes[size])}>
      {initial}
    </div>
  );
};