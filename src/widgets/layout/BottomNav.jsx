import { NavLink } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { clsx } from 'clsx';
import { bottomNavItems } from '../../app/config/navigation.js';
import { prefetchRoute } from '../../app/router/routeLoaders.js';

const item = 'epic-nav-link flex min-h-16 flex-1 flex-col items-center justify-center gap-1 px-0.5 py-2.5 text-[10px] font-medium transition-colors';
export const BottomNav = ({ onOpenMenu }) => (
  <nav aria-label="Основная навигация" className="fixed inset-x-0 bottom-0 z-40 border-t border-rail-edge bg-rail pad-safe-bottom lg:hidden">
    <div className="mx-auto flex max-w-2xl items-stretch gap-0.5 px-2">
      {bottomNavItems.map(({ to, label, icon: Icon, end }) => <NavLink key={to} to={to} end={end}
        onTouchStart={() => prefetchRoute(to)} onMouseEnter={() => prefetchRoute(to)}
        className={({ isActive }) => clsx(item, isActive ? 'text-rail-ink' : 'text-rail-ink-muted hover:text-rail-ink')}>
        {({ isActive }) => <><Icon size={22} strokeWidth={isActive ? 2.2 : 1.7} className={isActive ? 'text-rail-mark' : undefined} /><span>{label}</span></>}
      </NavLink>)}
      <button type="button" onClick={onOpenMenu} className={clsx(item, 'text-rail-ink-muted hover:text-rail-ink')} aria-label="Открыть меню">
        <Menu size={22} strokeWidth={1.7} /><span>Меню</span>
      </button>
    </div>
  </nav>
);
