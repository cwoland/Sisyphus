import {
    LayoutDashboard,
    Calendar,
    Newspaper,
    Dumbbell,
    Apple,
    Users,
    MessageCircle,
    Sparkles,
    User,
    Landmark,
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
    { to: '/progress', label: 'Храм прогресса', icon: Landmark },
];

export const bottomNavItems = [
    navItems.find((item) => item.to === '/'),
    navItems.find((item) => item.to === '/calendar'),
    { to: '/friends', label: 'Лента', icon: Newspaper },
    navItems.find((item) => item.to === '/profile'),
];
