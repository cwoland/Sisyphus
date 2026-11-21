import { useEffect, useState } from 'react';
import { PencilLine, Search } from 'lucide-react';
import { useFoodSearch } from '../food.hooks.js';
import { Button } from '../../../shared/ui/Button.jsx';
import { Skeleton } from '../../../shared/ui/Skeleton.jsx';

export const FoodSearch = ({ onPick, onManual }) => {
  const [input, setInput] = useState('');
  const [term, setTerm] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setTerm(input.trim()), 300);
    return () => clearTimeout(timer);
  }, [input]);

  const query = useFoodSearch(term);
  const items = query.data ?? [];
  const waiting = input.trim() !== term || query.isLoading;

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search
          size={18}
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
        />
        <input
          autoFocus
          type="search"
          value={input}
          maxLength={200}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Название продукта или бренд"
          aria-label="Поиск продукта"
          className="w-full rounded-xl border border-border-strong bg-surface py-3 pl-10 pr-3 text-base text-text placeholder:text-text-muted focus:border-cta focus:outline-none"
        />
      </div>

      {waiting ? (
        <div aria-label="Загружаем продукты" className="space-y-2">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : query.isError && !items.length ? (
        <div className="space-y-2 py-3 text-center">
          <p role="status" className="text-sm text-text-muted">
            Не удалось загрузить продукты.
          </p>
          <Button variant="ghost" onClick={() => query.refetch()}>
            Повторить
          </Button>
        </div>
      ) : items.length === 0 ? (
        <p role="status" className="py-4 text-center text-sm text-text-muted">
          {term ? `По запросу «${term}» ничего не найдено` : 'Пока нет продуктов'}
        </p>
      ) : (
        <ul className="space-y-1.5">
          {items.map((item) => (
            <li key={item.key}>
              <button
                type="button"
                onClick={() => onPick(item)}
                className="flex min-h-14 w-full items-center gap-3 rounded-xl border border-border bg-surface p-3 text-left transition-colors hover:bg-surface-2"
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-text">
                    {item.name}
                  </span>

                  {(item.brand || item.entry || item.kcal_100g == null) && (
                    <span className="block truncate text-xs text-text-muted">
                      {item.brand || (item.entry ? 'Из вашего дневника' : 'Ввести КБЖУ')}
                    </span>
                  )}
                </span>

                {item.kcal_100g != null && (
                  <span className="shrink-0 text-right">
                    <span className="block text-sm font-semibold tabular-nums text-text">
                      {Math.round(Number(item.kcal_100g))}
                    </span>
                    <span className="block text-xs text-text-muted">ккал/100 г</span>
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