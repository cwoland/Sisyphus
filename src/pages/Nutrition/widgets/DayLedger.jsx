import { Plus, Pencil, Trash2 } from 'lucide-react';
import { clsx } from 'clsx';
import { IconButton } from '../../../shared/ui/IconButton.jsx';
import { mealTypes } from '../../../entities/nutrition/mealTypes.js';

const num = (v) => Math.round(Number(v) || 0);

export const DayLedger = ({ byMeal, hint, onAdd, onEdit, onDelete }) => (
  <section aria-label="Приёмы пищи" className="overflow-hidden rounded-2xl border border-border bg-surface">
    {hint && <p className="border-b border-border px-4 py-3 text-sm text-text-muted">{hint}</p>}

    {mealTypes.map((meal, i) => {
      const entries = byMeal[meal.value] || [];
      const kcal = entries.reduce((sum, e) => sum + num(e.calories), 0);
      const Icon = meal.icon;

      return (
        <div key={meal.value} className={clsx(i > 0 && 'border-t border-border')}>
          <div className="flex items-center gap-2 px-4 pb-1.5 pt-3.5">
            <Icon size={16} className="shrink-0 text-terracotta-ink" />
            <h3 className="flex-1 font-display text-xs font-semibold uppercase tracking-[0.14em] text-text-muted">
              {meal.label}
            </h3>
            {kcal > 0 && (
              <span className="font-display text-sm font-bold tabular-nums text-text">
                {kcal}
                <span className="text-xs font-normal text-text-muted"> ккал</span>
              </span>
            )}
          </div>

          <ul>
            {entries.map((e) => (
              <li key={e.id} className="flex items-center gap-1 px-4 py-1.5">
                <button
                  onClick={() => onEdit(e)}
                  className="min-w-0 flex-1 rounded-lg py-1 text-left"
                >
                  <span className="block truncate text-sm text-text">{e.name}</span>
                  <span className="block text-xs tabular-nums text-text-muted">
                    {num(e.calories)} ккал · Б{num(e.protein)} Ж{num(e.fat)} У{num(e.carbs)}
                  </span>
                </button>
                <IconButton
                  icon={Pencil} size={15} onClick={() => onEdit(e)}
                  className="text-text-muted hover:text-text"
                  aria-label={`Изменить: ${e.name}`}
                />
                <IconButton
                  icon={Trash2} size={15} onClick={() => onDelete(e)}
                  className="text-text-muted hover:text-danger"
                  aria-label={`Удалить: ${e.name}`}
                />
              </li>
            ))}
          </ul>

          <button
            onClick={() => onAdd(meal.value)}
            className="flex min-h-[44px] w-full items-center gap-2 px-4 text-sm text-text-muted transition-colors hover:bg-surface-2 hover:text-text"
          >
            <Plus size={16} className="shrink-0" />
            {entries.length ? 'Ещё' : `Добавить ${meal.label.toLowerCase()}`}
          </button>
        </div>
      );
    })}
  </section>
);