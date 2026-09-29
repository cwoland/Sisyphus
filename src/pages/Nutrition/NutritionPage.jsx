import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Settings2, ChevronLeft, ChevronRight, Scale } from 'lucide-react';
import { addDays } from 'date-fns';
import { ru } from 'date-fns/locale';
import { clsx } from 'clsx';

import { useDayEntries, useDaySummary, useTargets, useNutritionMutations, useTargetsMutation } from './nutrition.hooks.js';
import { EntryForm } from './widgets/EntryForm.jsx';
import { TargetsForm } from './widgets/TargetsForm.jsx';
import { MacroProgress } from './widgets/MacroProgress.jsx';
import { DayLedger } from './widgets/DayLedger.jsx';
import { Sheet } from '../../shared/ui/Sheet.jsx';
import { Button } from '../../shared/ui/Button.jsx';
import { IconButton } from '../../shared/ui/IconButton.jsx';
import { CardArt } from '../../shared/ui/CardArt.jsx';
import { CalorieRing } from '../../shared/ui/CalorieRing.jsx';
import { Skeleton } from '../../shared/ui/Skeleton.jsx';
import { emptyStates } from '../../shared/lib/sisyphusPhrases.js';
import { toApiDate, todayApi, safeFormat } from '../../shared/lib/date.js';
import { useLatestBody } from '../../features/body/body.hooks.js';

const num = (v) => Math.round(Number(v) || 0);

export const NutritionPage = () => {
  const [date, setDate] = useState(todayApi);
  const [entryForm, setEntryForm] = useState(null);
  const [targetsOpen, setTargetsOpen] = useState(false);

  const entriesQuery = useDayEntries(date);
  const summaryQuery = useDaySummary(date);
  const targetsQuery = useTargets();
  const { create, update, remove } = useNutritionMutations(date);
  const targetsMutation = useTargetsMutation();
  const latestBody = useLatestBody();

  const isToday = date === todayApi();
  const shiftDay = (dir) => setDate((d) => toApiDate(addDays(new Date(d), dir)));

  const byMeal = (entriesQuery.data || []).reduce((acc, e) => {
    (acc[e.meal_type] = acc[e.meal_type] || []).push(e);
    return acc;
  }, {});

  const consumed = summaryQuery.data?.consumed;
  const target = targetsQuery.data;
  const eaten = num(consumed?.total_calories);
  const goal = num(target?.calories);
  const remaining = goal - eaten;
  const over = goal > 0 && remaining < 0;

  const handleSubmitEntry = (payload) => {
    if (entryForm?.entry) {
      update.mutate({ id: entryForm.entry.id, ...payload }, { onSuccess: () => setEntryForm(null) });
    } else {
      create.mutate(payload, { onSuccess: () => setEntryForm(null) });
    }
  };

  const isEmptyDay = !entriesQuery.isLoading && (entriesQuery.data?.length ?? 0) === 0;
  const weight = latestBody.data?.current?.weight;
  const prevWeight = latestBody.data?.previous?.weight;
  const delta = weight != null && prevWeight != null ? Number(weight) - Number(prevWeight) : null;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="font-display text-2xl font-bold text-text">Питание</h1>

        <div className="flex items-center gap-2">
          {weight != null && (
            <Link
              to="/profile"
              className="flex min-h-[36px] items-center gap-1.5 rounded-xl border border-border bg-surface px-3 text-sm transition-colors hover:bg-surface-2"
            >
              <Scale size={15} className="text-text-muted" />
              <span className="font-display font-bold tabular-nums text-text">{Number(weight)} кг</span>
              {delta != null && delta !== 0 && (
                <span className="text-xs tabular-nums text-text-muted">
                  {delta > 0 ? '+' : ''}{delta.toFixed(1)}
                </span>
              )}
            </Link>
          )}

          <Button variant="secondary" size="sm" onClick={() => setTargetsOpen(true)}>
            <Settings2 size={16} /> Цели
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <IconButton
          icon={ChevronLeft} size={20} onClick={() => shiftDay(-1)}
          className="text-text-muted hover:bg-surface-2 hover:text-text"
          aria-label="Предыдущий день"
        />
        <p className="min-w-0 flex-1 truncate text-center">
          <span className="font-display font-semibold capitalize text-text">
            {safeFormat(date, 'd MMMM', { locale: ru })}
          </span>
          <span className="ml-2 text-sm capitalize text-text-muted">
            {safeFormat(date, 'EEEE', { locale: ru })}
          </span>
        </p>
        <button
          onClick={() => setDate(todayApi())}
          className={clsx(
            'shrink-0 rounded-lg px-3 py-2 text-sm text-text-muted transition-colors hover:bg-surface-2 hover:text-text',
            isToday && 'invisible'
          )}
          aria-label="Вернуться к сегодняшнему дню"
        >
          Сегодня
        </button>
        <IconButton
          icon={ChevronRight} size={20} onClick={() => shiftDay(1)}
          className="text-text-muted hover:bg-surface-2 hover:text-text"
          aria-label="Следующий день"
        />
      </div>

      {summaryQuery.isLoading ? (
        <Skeleton className="h-52 w-full rounded-2xl" />
      ) : (
        <section
          aria-label="Итог дня"
          className="relative isolate clip-card-art overflow-hidden rounded-2xl border border-border bg-surface p-5 sm:p-6"
        >
          <CardArt name="back" className="card-art-hero" />

          <div className="relative pr-[36%] sm:pr-40">
            <p className="font-display text-xs font-semibold uppercase tracking-[0.14em] text-text-muted">
              {goal > 0 ? `Съедено ${eaten} из ${goal}` : `Съедено ${eaten} ккал`}
            </p>

            <div className="mt-4 flex items-center gap-5">
              <CalorieRing
                consumed={eaten}
                target={goal || 2000}
                size={124}
                primary={goal > 0 ? Math.abs(remaining) : eaten}
                caption={goal > 0 ? (over ? 'перебор, ккал' : 'осталось, ккал') : 'ккал'}
                tone={over ? 'over' : undefined}
              />
            </div>

            <div className="mt-5">
              <MacroProgress
                consumed={consumed}
                target={target}
                onSetTargets={() => setTargetsOpen(true)}
              />
            </div>
          </div>
        </section>
      )}

      {entriesQuery.isLoading ? (
        <Skeleton className="h-72 w-full rounded-2xl" />
      ) : (
        <DayLedger
          byMeal={byMeal}
          hint={isEmptyDay ? emptyStates.nutrition.description : null}
          onAdd={(mealType) => setEntryForm({ defaultMealType: mealType })}
          onEdit={(entry) => setEntryForm({ entry })}
          onDelete={(entry) => remove.mutate(entry.id)}
        />
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