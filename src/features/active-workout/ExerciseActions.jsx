import { useMemo, useState } from 'react';
import { ArrowLeftRight, Search, SkipForward } from 'lucide-react';
import { Sheet } from '../../shared/ui/Sheet.jsx';
import { Button } from '../../shared/ui/Button.jsx';
import { equipmentTypes, muscleGroupLabel } from '../../entities/exercise/muscleGroups.js';
import { changeTargets } from './changeExercise.js';

const equipmentNames = {
    ...Object.fromEntries(equipmentTypes.map((item) => [item.value, item.label])),
    kettlebell: 'Гиря',
    resistance_band: 'Резинка',
    medicine_ball: 'Медбол',
    other: 'Другое оборудование',
};

const same = (a, b) => Boolean(a && a === b);

export function ExerciseActions({ workout, anchor, busy, onApply }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  const { remaining, replaceable, occupied } = useMemo(
    () => changeTargets(workout.sets, anchor),
    [workout.sets, anchor]
  );

  const catalog = workout.alternatives ?? [];
  const source = catalog.find((item) => item.id === anchor.exercise_id) ?? anchor;
  const term = search.trim().toLocaleLowerCase('ru');

  function score(item) {
    return (
      4 * Number(same(item.muscle_detail, source.muscle_detail)) +
      2 * Number(same(item.muscle_group, source.muscle_group)) +
      Number(same(item.equipment, source.equipment))
    );
  }

  const items = catalog
    .filter((item) => item.id !== anchor.exercise_id && !occupied.has(item.id))
    .filter((item) => {
      const label = [
        item.name,
        muscleGroupLabel(item.muscle_group),
        equipmentNames[item.equipment],
      ].filter(Boolean).join(' ').toLocaleLowerCase('ru');

      return label.includes(term);
    })
    .sort((a, b) => score(b) - score(a) || a.name.localeCompare(b.name, 'ru'));

  async function apply(replacement) {
    if (busy) return;
    setError('');
    try {
      if (await onApply(replacement)) setOpen(false);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Не удалось изменить упражнение');
    }
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        disabled={busy}
        onClick={() => {
          setSearch('');
          setError('');
          setOpen(true);
        }}
      >
        <ArrowLeftRight size={16} />
        Заменить или пропустить
      </Button>

      <Sheet
        isOpen={open}
        onClose={() => { if (!busy) setOpen(false); }}
        title={anchor.exercise_name}
      >
        <div className="space-y-4">
          <p className="text-sm text-text-muted">
            Изменение действует в этой тренировке. Выполненные подходы сохранятся.
          </p>

          <Button
            variant="secondary"
            className="w-full"
            disabled={busy}
            onClick={() => apply(null)}
          >
            <SkipForward size={17} />
            Пропустить оставшиеся подходы ({remaining.length})
          </Button>

          {error && <p role="alert" className="text-sm text-danger">{error}</p>}

          {!replaceable.length ? (
            <p className="text-sm text-text-muted">
              Остались ступени уже начатого дропсета. Можно закончить серию или пропустить остаток.
            </p>
          ) : !catalog.length ? (
            <p className="text-sm text-text-muted">
              Открой эту тренировку с интернетом один раз, чтобы сохранить варианты замены.
            </p>
          ) : (
            <>
              {replaceable.length < remaining.length && (
                <p className="text-sm text-text-muted">
                  Остаток начатой серии будет пропущен. Замена начнётся со следующей серии.
                </p>
              )}

              <label className="relative block">
                <Search
                  size={17}
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
                />
                <input
                  type="search"
                  value={search}
                  disabled={busy}
                  onChange={(event) => setSearch(event.target.value)}
                  aria-label="Найти замену"
                  placeholder="Упражнение, мышца или оборудование"
                  className="w-full rounded-xl border border-border bg-surface py-3 pl-10 pr-3 text-base text-text"
                />
              </label>

              <ul className="space-y-2">
                {items.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => apply(item)}
                      className="block min-h-14 w-full rounded-xl border border-border px-3 py-2 text-left hover:bg-surface-2 disabled:opacity-50"
                    >
                      <span className="block text-sm font-semibold text-text">{item.name}</span>
                      <span className="block text-xs text-text-muted">
                        {[muscleGroupLabel(item.muscle_group), equipmentNames[item.equipment]]
                          .filter(Boolean).join(' · ')}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>

              {!items.length && (
                <p className="text-sm text-text-muted">Подходящих упражнений не найдено.</p>
              )}
            </>
          )}
        </div>
      </Sheet>
    </>
  );
}