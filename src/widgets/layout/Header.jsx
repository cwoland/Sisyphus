import { Link } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { Logo } from '../../shared/ui/Logo.jsx';
import { GreekMedallion } from '../../shared/ui/GreekMedallion.jsx';
import { StreakFlame } from '../../shared/ui/StreakFlame.jsx';
import '../../shared/ui/epic.css';


export const Header = ({ onOpenMenu, visitStreak }) => {
  const current = Number(visitStreak?.current) || 0;
  const lit = current > 0 && !visitStreak?.broken;
  
  return (
    <header className="epic-rail sticky top-0 z-30 bg-rail text-rail-ink pad-safe-top lg:hidden">
      <div className="flex h-16 items-center gap-3 px-3">
        <button
          type="button"
          onClick={onOpenMenu}
          aria-label="Открыть меню"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-rail-ink-muted transition-colors hover:bg-rail-hover hover:text-rail-ink"
        >
          <Menu size={22} />
        </button>

        <Link
          to="/"
          aria-label="Sisyphus"
          className="min-w-0 rounded-lg"
        >
          <Logo size="m" />

          <span className="mt-0.5 block text-[9px] font-semibold uppercase tracking-[.22em] text-rail-ink-muted">
            Сила в возвращении
          </span>
        </Link>

        <div className="ml-auto flex shrink-0 items-center gap-3">
          {visitStreak && (
            <Link
              to="/"
              aria-label={`Серия посещений: ${current}`}
              className="flex min-h-11 items-center gap-1 rounded-xl px-1 text-rail-ink"
            >
              <StreakFlame
                lit={lit}
                size={18}
              />

              <span className="font-display text-sm font-bold tabular-nums">
                {current}
              </span>
            </Link>
          )}

          <GreekMedallion
            size={36}
            className="shrink-0 text-rail-mark"
          />
        </div>
      </div>
    </header>
  );
};
