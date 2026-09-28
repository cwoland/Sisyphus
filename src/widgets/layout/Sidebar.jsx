import { NavLink } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { Moon, Sun } from 'lucide-react';
import { clsx } from 'clsx';
import { navItems } from '../../app/config/navigation.js';
import { prefetchRoute } from '../../app/router/routeLoaders.js';
import { Logo } from '../../shared/ui/Logo.jsx';
import { GreekPatternBg } from '../../shared/ui/GreekPatternBg.tsx';
import { HeaderSearch } from '../../features/search/HeaderSearch.jsx';
import { useThemeStore } from '../../entities/theme/theme.store.js';

export const Sidebar = ({ onNavigate, withSearch = false }) => {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <div className="relative isolate flex h-full flex-col overflow-hidden bg-rail text-rail-ink">
      <GreekPatternBg opacity={0.07} />

      <div className="relative px-5 pb-5 pt-6">
        <Link to="/" onClick={onNavigate} className="rounded-lg">
          <Logo size="md" />
        </Link>
      </div>

      {withSearch && (
        <div className="relative px-4 pb-4">
          <HeaderSearch onRail />
        </div>
      )}

      <nav className="relative flex flex-1 flex-col gap-1 overflow-y-auto px-3 no-scrollbar">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            onMouseEnter={() => prefetchRoute(to)}
            onFocus={() => prefetchRoute(to)}
            onTouchStart={() => prefetchRoute(to)}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-rail-hover text-rail-ink'
                  : 'text-rail-ink-muted hover:bg-rail-hover/60 hover:text-rail-ink'
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={20}
                  strokeWidth={2}
                  className={isActive ? 'text-rail-mark' : undefined}
                />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="relative px-3 pb-5 pt-4">
        <button
          onClick={toggleTheme}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-rail-ink-muted transition-colors hover:bg-rail-hover/60 hover:text-rail-ink"
          aria-label="Переключить тему"
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          <span>{theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}</span>
        </button>
      </div>
    </div>
  );
};