import {
    LayoutDashboard,
    Calendar,
    Dumbbell,
    Apple,
    Users,
    MessageCircle,
    Sparkles,
    User,
} from 'lucide-react';

export const navItems = [
    { to: '/', label: 'Главная', icon: LayoutDashboard, end: true },
    { to: '/calendar', label: 'Календарь', icon: Calendar },
    { to: '/programs', label: 'Программы', icon: Dumbbell },
    { to: '/nutrition', label: 'Питание', icon: Apple },
    { to: '/friends', label: 'Друзья', icon: Users },
    { to: '/chat', label: 'Чат', icon: MessageCircle },
    { to: '/ai', label: 'ИИ-тренер', icon: Sparkles },
    { to: '/profile', label: 'Профиль', icon: User },
];

export const bottomNavItems = navItems.filter((i) => 
['/', '/calendar', '/programs', '/chat'].includes(i.to)
);