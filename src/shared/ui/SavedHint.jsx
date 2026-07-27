import { Check } from 'lucide-react';

export const SavedHint = ({ show }) =>
    show ? (
        <span className="flex items-center gap-1 text-xs text-accent animate-fade-in">
            <Check size={12} /> Сохранено
        </span>
    ) : null;