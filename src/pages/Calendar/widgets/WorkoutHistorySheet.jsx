import { Sheet } from '../../../shared/ui/Sheet.jsx';
import { useWorkoutDetails } from '../calendar.hooks.js';
import { workoutSummary } from '../../../entities/workout/summary.js';
import { describeSet } from '../../../entities/exercise/tracking.js';
import { safeFormat } from '../../../shared/lib/date.js';

export function WorkoutHistorySheet({ id, onClose }) {
    const query = useWorkoutDetails(id);
    const workout = query.data;
    const result = workout && workoutSummary(workout);

    return (
        <Sheet isOpen={Boolean(id)} onClose={onClose} title="Итоги тренировки">
            {!result ? (
                <div role="status" className="p-4 text-sm text-text-muted">
                    {query.isError ? (
                        <button onClick={() => query.refetch()}>
                            Не удалось загрузить итоги. Повторить попытку
                        </button>) : 'Загружаем тренировку...'}
                </div>
            ) : (
                <div className="space-y-4">
                    <header className="relative isolate overflow-hidden rounded-2xl bg-[#251810] p-5 pt-24 text-white">
                        <img
                            src="/art/ui/workout-summit.webp"
                            alt=""
                            className="absolute inset-0 -z-20 h-full w-full object-cover object-center"
                        />
                        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/90 to-black/5" />
                        <p className="text-sm">
                            {safeFormat(workout.date, 'dd.MM.yyyy')}
                        </p>
                        <h2 className="break-words font-display text-2xl font-bold">{result.title}</h2>
                    </header>

                    <dl className="grid grid-cols-2 gap-2">
                        {[
                            ['Время', result.duration],
                            ['Упражнения', result.exercises],
                            ['Подходы', result.sets],
                            ['Тоннаж', result.tonnage.toLocaleString('ru-RU', { maximumFractionDigits: 1 }) + ' кг'],
                        ].map(([label, value]) => (
                            <div key={label} className="rounded-xl bg-surface-2 p-3">
                                <dt className="text-xs text-text-muted">{label}</dt>
                                <dd className="mt-1 font-display text-lg font-bold tabular-nums">{value}</dd>
                            </div>
                        ))}
                    </dl>

                    {result.groups.map((group) => (
                        <section
                            key={group.id}
                            className="rounded-xl border border-border p-3"
                        >
                            <h3 className="break-words font-semibold">{group.name}</h3>
                            <ol className="mt-2 space-y-1 text-sm text-text-muted">
                                {group.sets.map((set) => (
                                    <li key={set.id}>
                                        {set.set_kind === 'drop' ? 'Дроп' : set.set_role === 'warmup' ? 'Разминка' : 'Подход'}
                                        {' · '}{describeSet(set)}{set.rpe != null && ' · RPE ' + Number(set.rpe)}
                                    </li>
                                ))}
                            </ol>
                        </section>
                    ))}

                    {!result.sets && (
                        <p className="text-sm text-text-muted">Выполненных подходов не записано.</p>
                    )}
                </div>
            )}
        </Sheet>
    );
}