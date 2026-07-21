import { NavLink } from 'react-router-dom';
import { clsx } from 'clsx';
import { navItems } from '../../app/config/navigation.js';
import { Logo } from '../../shared/ui/Logo.jsx';

export const Sidebar = ({ onNavigate }) => (
    <nav className="flex h-full flex-col gap-1 p-3">
        <div className="mb-4 px-2 pt-2">
            <Logo size="md" />
        </div>

        {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) =>
            clsx(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                isActive ? 'bg-accent/10 text-accent' : 'text-text-muted hover:bg-surface-2 hover:text-text'
            )
        }
        >
            <Icon size={20} strokeWidth={2} />
            <span>{label}</span>
        </NavLink>
        ))}
    </nav>
);