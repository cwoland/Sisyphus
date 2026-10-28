import { useState, useEffect } from 'react';
import { Search, PencilLine } from 'lucide-react';

import { useFoodSearch } from '../food.hooks.js';
import { useRecentFoods } from '../nutrition.hooks.js';
import { Button } from '../../../shared/ui/Button.jsx';
import { Skeleton } from '../../../shared/ui/Skeleton.jsx';

export const FoodSearch = ({ onPick, onManual }) => {
    const [input, setInput] = useState('');
    const [term, setTerm] = useState('');

    useEffect(() => {
        const t = setTimeout(() => setTerm(input.trim()), 350);
        return () => clearTimeout(t);
    }, [input]);

    const recentQuery = useRecentFoods(term, { enabled: term.length >= 2 });
    const foodQuery = useFoodSearch(term);

    const recent = (recentQuery.data || []).map((r) => ({
        key: `recent-${r.name}`,
        name: r.name,
        brand: 'из ваших записей',
        kcal_100g: null,
        entry: r,
    }));

    const found = (foodQuery.data || []).map((p) => ({ key: p.barcode, ...p }));
    const items = [...recent, ...found];

    return (
        <div className="space-y-3">
            <div className="relative">
                <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                    autoFocus
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Название продукта"
                    aria-label="Поиск продукта"
                    className="w-full rounded-xl border border-border-strong bg-surface py-3 pl-10 pr-3 text-base text-text placeholder:text-text-muted transition-colors focus:border-cta focus:outline-none"
                />
            </div>

            {term.length < 2 ? (
                <p className="py-6 text-center text-sm text-text-muted">
                    Введите хотя бы два символа.
                </p>
                ) : foodQuery.isLoading && items.length === 0 ? (
                    <div className="space-y-2">
                        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
                    </div>
                    ) : items.length === 0 ? (
                        <p className="py-6 text-center text-sm text-text-muted">
                            Ничего не нашли по "{term}"
                        </p>
                    ): (
                        <ul className="space-y-1.5">
                            {items.map((item) => (
                                <li key={item.key}>
                                    <button
                                        onClick={() => onPick(item)}
                                        className="flex min-h-[56px] w-full items-center gap-3 rounded-xl border border-border bg-surface p-3 text-left transition-colors hover:bg-surface-2"
                                    >
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium text-text">{item.name}</p>
                                            {item.brand && <p className="truncate text-xs text-text-muted">
                                                {item.brand}</p>}
                                        </div>
                                        {item.kcal_100g != null && (
                                            <span className="shrink-0 text-right">
                                                <span className="block font-display text-sm font-bold tabular-nums text-text">
                                                    {Math.round(item.kcal_100g)}
                                                </span>
                                                <span className="block text-[10px] text-text-muted">ккал/100 г</span>
                                            </span>
                                        )}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}

                    <Button variant="ghost" className="w-full" onClick={onManual}>
                        <PencilLine size={16} /> Ввести вручную
                    </Button>
        </div>
    );
};