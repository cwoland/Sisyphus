import { Link } from 'react-router-dom';
import { Menu, Moon, Sun } from 'lucide-react';
import { Logo } from '../../shared/ui/Logo.jsx';
import { useThemeStore } from '../../entities/theme/theme.store.js';

export const Header = ({ onOpenMenu }) => {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-surface/95 backdrop-blur pad-safe-top">
      <div className="flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenMenu}
            className="rounded-lg p-2 text-text-muted hover:bg-surface-2 hover:text-text lg:hidden"
            aria-label="Открыть меню"
          >
            <Menu size={22} />
          </button>
          <div className="lg:hidden">
            <Link to="/" className="rounded-gl focus-visible:outline-none" aria-label="На главную">
            <Logo size="sm" />
            </Link>
          </div>
        </div>

        <button
          onClick={toggleTheme}
          className="rounded-lg p-2 text-text-muted hover:bg-surface-2 hover:text-text transition-colors"
          aria-label="Переключить тему"
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
    </header>
  );
};