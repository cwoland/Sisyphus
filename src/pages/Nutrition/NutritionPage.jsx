import { useState } from 'react';
import { Plus, Settings2, Pencil, Trash2, ChevronLeft, ChevronRight, Apple } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { ru } from 'date-fns/locale';

import { useDayEntries, useDaySummary, useTargets, useNutritionMutations, useTargetsMutation } from './nutrition.hooks.js';
import { EntryForm } from './widgets/EntryForm.jsx';
import { TargetsForm } from './widgets/TargetsForm.jsx';
import { MacroProgress } from './widgets/MacroProgress.jsx';
import { Sheet } from '../../shared/ui/Sheet.jsx';
import { Button } from '../../shared/ui/Button.jsx';
import { EmptyState } from '../../shared/ui/EmptyState.jsx';
import { Skeleton } from '../../shared/ui/Skeleton.jsx';
import { mealTypes, mealTypeLabel, mealTypeIcon } from '../../entities/nutrition/mealTypes.js';
import { emptyStates } from '../../shared/lib/sisyphusPhrases.js';
import { toApiDate, todayApi } from '../../shared/lib/date.js';

export const NutritionPage = () => {
  const [date, setDate] = useState(todayApi());
  const [entryForm, setEntryForm] = useState(null);
  const [targetsOpen, setTargetsOpen] = useState(false);

  const entriesQuery = useDayEntries(date);
  const summaryQuery = useDaySummary(date);
  const targetsQuery = useTargets();
  const { create, update, remove } = useNutritionMutations(date);
  const targetsMutation = useTargetsMutation();

  const shiftDay = (dir) => setDate((d) => toApiDate(addDays(new Date(d), dir)));

  const byMeal = (entriesQuery.data || []).reduce((acc, e) => {
    (acc[e.meal_type] = acc[e.meal_type] || []).push(e);
    return acc;
  }, {});

  const handleSubmitEntry = (payload) => {
    if (entryForm?.entry) {
      update.mutate({ id: entryForm.entry.id, ...payload }, { onSuccess: () => setEntryForm(null) });
    } else {
      create.mutate(payload, { onSuccess: () => setEntryForm(null) });
    }
  };

  const isEmpty = !entriesQuery.isLoading && (entriesQuery.data?.length === 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-text">Питание</h1>
        <Button variant="secondary" size="sm" onClick={() => setTargetsOpen(true)}>
          <Settings2 size={16} /> Цели
        </Button>
      </div>

      <div className="flex items-center justify-between rounded-2xl border border-border bg-surface p-3">
        <button onClick={() => shiftDay(-1)} className="rounded-lg p-2 text-text-muted hover:bg-surface-2 hover:text-text" aria-label="Предыдущий день">
          <ChevronLeft size={20} />
        </button>
        <div className="text-center">
          <p className="font-medium capitalize text-text">
            {format(new Date(date), 'd MMMM', { locale: ru })}
          </p>
          <p className="text-xs capitalize text-text-muted">
            {format(new Date(date), 'EEEE', { locale: ru })}
          </p>
        </div>
        <button onClick={() => shiftDay(1)} className="rounded-lg p-2 text-text-muted hover:bg-surface-2 hover:text-text" aria-label="Следующий день">
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-4">
        {summaryQuery.isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-6 w-full" />)}
          </div>
        ) : (
          <MacroProgress consumed={summaryQuery.data?.consumed} target={targetsQuery.data} />
        )}
      </div>

      {entriesQuery.isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
      ) : isEmpty ? (
        <div className="rounded-2xl border border-border bg-surface">
          <EmptyState
            icon={Apple}
            {...emptyStates.nutrition}
            action={<Button onClick={() => setEntryForm({})}><Plus size={18} /> Добавить приём</Button>}
          />
        </div>
      ) : (
        <div className="space-y-4">
          {mealTypes.map((meal) => {
            const entries = byMeal[meal.value] || [];
            if (entries.length === 0) return null;
            const Icon = meal.icon;
            const mealCalories = entries.reduce((sum, e) => sum + (Number(e.calories) || 0), 0);

            return (
              <div key={meal.value} className="rounded-2xl border border-border bg-surface p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon size={18} className="text-accent" />
                    <h3 className="font-medium text-text">{meal.label}</h3>
                  </div>
                  <span className="text-sm text-text-muted">{mealCalories} ккал</span>
                </div>

                <div className="space-y-2">
                  {entries.map((e) => (
                    <div key={e.id} className="flex items-center justify-between rounded-xl bg-surface-2 px-3 py-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm text-text">{e.name}</p>
                        <p className="text-xs text-text-muted">
                          {Number(e.calories)} ккал · Б{Math.round(Number(e.protein))} Ж{Math.round(Number(e.fat))} У{Math.round(Number(e.carbs))}
                        </p>
                      </div>
                      <div className="flex shrink-0 gap-1">
                        <button onClick={() => setEntryForm({ entry: e })} className="rounded-lg p-1.5 text-text-muted hover:text-accent" aria-label="Изменить">
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => remove.mutate(e.id)} className="rounded-lg p-1.5 text-text-muted hover:text-crimson" aria-label="Удалить">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          <Button variant="secondary" className="w-full" onClick={() => setEntryForm({})}>
            <Plus size={18} /> Добавить приём пищи
          </Button>
        </div>
      )}

      <Sheet
        isOpen={!!entryForm}
        onClose={() => setEntryForm(null)}
        title={entryForm?.entry ? 'Изменить приём' : 'Добавить приём'}
      >
        {entryForm && (
          <EntryForm
            date={date}
            entry={entryForm.entry}
            defaultMealType={entryForm.defaultMealType}
            onSubmit={handleSubmitEntry}
            onCancel={() => setEntryForm(null)}
            isSubmitting={create.isPending || update.isPending}
          />
        )}
      </Sheet>

      <Sheet isOpen={targetsOpen} onClose={() => setTargetsOpen(false)} title="Цели по КБЖУ">
        <TargetsForm
          targets={targetsQuery.data}
          onSubmit={(payload) => targetsMutation.mutate(payload, { onSuccess: () => setTargetsOpen(false) })}
          onCancel={() => setTargetsOpen(false)}
          isSubmitting={targetsMutation.isPending}
        />
      </Sheet>
    </div>
  );
};