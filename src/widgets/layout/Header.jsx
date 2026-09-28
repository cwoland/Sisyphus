import { Link } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { Logo } from '../../shared/ui/Logo.jsx';

export const Header = ({ onOpenMenu }) => (
  <header className="sticky top-0 z-30 bg-rail text-rail-ink pad-safe-top lg:hidden">
    <div className="flex h-14 items-center gap-2 px-3">
      <button
        onClick={onOpenMenu}
        className="relative flex h-11 w-11 items-center justify-center rounded-xl text-rail-ink-muted transition-colors hover:bg-rail-hover hover:text-rail-ink"
        aria-label="Открыть меню"
      >
        <Menu size={22} />
      </button>

      <Link to="/" className="rounded-lg" aria-label="На главную">
        <Logo size="sm" />
      </Link>
    </div>
  </header>
);