import { NavLink } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { clsx } from 'clsx';
import { bottomNavItems } from '../../app/config/navigation.js';
import { prefetchRoute } from '../../app/router/routeLoaders.js';

const item = 'flex flex-1 flex-col items-center gap-1 py-3 text-[11px] font-medium transition-colors';

export const BottomNav = ({ onOpenMenu }) => (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-rail-edge bg-rail pad-safe-bottom lg:hidden">
        <div className="flex items-stretch justify-around">
            {bottomNavItems.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                    key={to}
                    to={to}
                    end={end}
                    onTouchStart={() => prefetchRoute(to)}
                    onMouseEnter={() => prefetchRoute(to)}
                    className={({ isActive }) => clsx(item, isActive ? 'text-rail-ink' : 'text-rail-ink-muted')
                }
                >
                    {({ isActive }) => (
                        <>
                            <Icon size={22} strokeWidth={2} className={isActive ? 'text-rail-mark' : undefined} />
                            <span>{label}</span>
                        </>
                    )}
                </NavLink>
            ))}

            <button onClick={onOpenMenu} className={clsx(item, 'text-rail-ink-muted')}>
                <Menu size={22} strokeWidth={2} />
                <span>Меню</span>
            </button>
        </div>
    </nav>
);