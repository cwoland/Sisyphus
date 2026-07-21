import { NavLink } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { clsx } from 'clsx';
import { bottomNavItems } from '../../app/config/navigation.js';

export const BottomNav = ({ onOpenMenu }) => (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 backdrop-blur pad-safe-bottom lg:hidden">
        <div className="flex items-stretch justify-around">
            {bottomNavItems.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                clsx(
                    'flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors',
                    isActive ? 'text-accent' : 'text-text-muted'
                )
            }
            >
                <Icon size={22} strokeWidth={2} />
                <span>{label}</span>
            </NavLink>
            ))}

            <button
            onClick={onOpenMenu}
            className="flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium text-text-muted"
            >
                <Menu size={22} strokeWidth={2} />
                <span>Меню</span>
            </button>
        </div>
    </nav>
);