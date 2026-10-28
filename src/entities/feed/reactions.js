import { Heart, BicepsFlexed } from 'lucide-react';
import { ClapIcon } from '../../shared/ui/icons/ClapIcon.jsx';

export const REACTIONS = [
    { kind: 'heart', icon: Heart,        label: 'Нравится', tone: 'bg-crimson/10 text-crimson' },
    { kind: 'bicep', icon: BicepsFlexed, label: 'Сила',     tone: 'bg-terracotta/15 text-terracotta-ink' },
    { kind: 'clap',  icon: ClapIcon,     label: 'Браво',    tone: 'bg-gold/15 text-gold-ink' },
];