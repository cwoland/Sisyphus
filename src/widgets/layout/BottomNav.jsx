import { useRef } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Dumbbell, Plus } from 'lucide-react';
import { clsx } from 'clsx';
import { bottomNavItems } from '../../app/config/navigation.js';
import { prefetchRoute } from '../../app/router/routeLoaders.js';

function Tab({ to, label, icon: Icon, end }) {
  return (
    <NavLink to={to} end={end}
      onTouchStart={() => prefetchRoute(to)} onMouseEnter={() => prefetchRoute(to)}
      className={({ isActive }) => clsx(
        'epic-nav-link flex min-h-16 min-w-0 flex-col items-center justify-center gap-1 text-[10px] font-medium',
        isActive ? 'text-rail-ink' : 'text-rail-ink-muted hover:text-rail-ink'
      )}>
      {({ isActive }) => <><Icon size={22} strokeWidth={isActive ? 2.2 : 1.7}
        className={isActive ? 'text-rail-mark' : undefined} /><span>{label}</span></>}
    </NavLink>
  );
}

export function BottomNav() {
  const menu = useRef(null);
  const close = () => menu.current?.close();
  return (
    <nav aria-label="Основная навигация" className="fixed inset-x-0 bottom-0 z-40 border-t border-rail-edge bg-rail pad-safe-bottom lg:hidden">
      <div className="mx-auto grid max-w-2xl grid-cols-5 items-center px-2">
        {bottomNavItems.slice(0, 2).map((tab) => <Tab key={tab.to} {...tab} />)}
        <button type="button" aria-label="Добавить тренировку" aria-haspopup="dialog"
          onClick={() => menu.current.showModal()}
          className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-cta text-on-cta shadow-md">
          <Plus size={26} />
        </button>
        {bottomNavItems.slice(2).map((tab) => <Tab key={tab.to} {...tab} />)}
      </div>
      <dialog ref={menu} aria-label="Действия с тренировками"
        className="fixed inset-x-0 top-auto mx-auto mb-0 w-64 max-w-[90vw] rounded-2xl border border-border bg-surface p-2 text-text shadow-xl backdrop:bg-black/35"
        style={{ bottom: 'calc(4.5rem + env(safe-area-inset-bottom))' }}
        onClick={(event) => { if (event.target === menu.current) close(); }}>
        <div className="space-y-1">
          <Link to="/calendar?quick=1" onClick={close}
            className="flex min-h-12 items-center gap-3 rounded-xl bg-cta px-3 font-semibold text-on-cta">
            <Plus size={18} /> Быстрая тренировка
          </Link>
          <Link to="/programs" onClick={close}
            className="flex min-h-12 items-center gap-3 rounded-xl px-3 hover:bg-surface-2">
            <Dumbbell size={18} /> Программы
          </Link>
          <button type="button" onClick={close} className="w-full rounded-lg py-2 text-sm text-text-muted">Закрыть</button>
        </div>
      </dialog>
    </nav>
  );
}
