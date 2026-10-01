import { Pencil } from 'lucide-react';
import { Avatar } from '../../../shared/ui/Avatar.jsx';
import { CardArt } from '../../../shared/ui/CardArt.jsx';

export const ProfileHero = ({ user, onEditAvatar }) => (
  <section
    aria-label="Профиль"
    className="relative isolate clip-card-art overflow-hidden rounded-2xl border border-border bg-surface p-5"
  >
    <CardArt name="warrior" className="card-art-hero" />

    <div className="relative flex items-center gap-4 pr-[30%] sm:pr-32">
      <button onClick={onEditAvatar} className="relative shrink-0 rounded-full" aria-label="Сменить аватар">
        <Avatar name={user?.name} src={user?.avatar_url} size="xl" />
        <span className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-surface bg-accent text-on-accent">
          <Pencil size={13} />
        </span>
      </button>

      <div className="min-w-0 flex-1">
        <p className="truncate font-display text-xl font-extrabold tracking-tight text-text">
          {user?.name}
        </p>
        <p className="truncate text-sm text-text-muted">@{user?.username}</p>
        <p className="truncate text-xs text-text-muted">{user?.email}</p>
      </div>
    </div>
  </section>
);