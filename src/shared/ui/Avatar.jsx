import { clsx } from 'clsx';
import { parseAvatar } from '../../entities/user/avatarIcons.js';

export const Avatar = ({ name, src, size = 'md' }) => {
  const sizes = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
    xl: 'h-20 w-20 text-2xl',
  };
  const iconPx = { sm: 16, md: 20, lg: 24, xl: 36 };
  const avatar = parseAvatar(src);

  if (avatar.type === 'image') {
    return <img src={avatar.src} alt={name} className={clsx('shrink-0 rounded-full object-cover', sizes[size])} />;
  }

  if (avatar.type === 'icon' && avatar.Icon) {
    const Icon = avatar.Icon;
    return (
      <div className={clsx('flex shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent', sizes[size])}>
        <Icon size={iconPx[size]} />
      </div>
    );
  }

  const initial = (name || '?').charAt(0).toUpperCase();
  return (
    <div className={clsx('flex shrink-0 items-center justify-center rounded-full bg-accent/15 font-semibold text-accent', sizes[size])}>
      {initial}
    </div>
  );
};