import { clsx } from 'clsx';

import { Skeleton } from '../../../shared/ui/Skeleton.jsx';
import { StreakFlame } from '../../../shared/ui/StreakFlame.jsx';
import { plural } from '../../../shared/lib/plural.js';

export const StreakCard = ({ query }) => {
    if (query.isLoading) return <Skeleton className="h-24 w-full rounded-2xl" />;

    const data = query.data;
    if (!data) return null;

    const { current, longest, days, broken } = data;
    const lit = current > 0 && !broken;

    return (
        <section
            aria-label="Огонь"
            className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-4"
        >
            <StreakFlame lit={lit} size={40} />

            <div className="min-w-0 flex-1">
                {lit ? (
                    <p className="font-display text-2xl font-extrabold leading-none tabular-nums text-text">
                        {current}
                        <span className="ml-2 text-sm font-medium text-text-muted">
                            {plural(current, ['день', 'дня', 'дней'])} подряд
                        </span>
                    </p>
                ) : (
                    <p className="font-display text-lg font-bold leading-tight text-text">
                        {broken ? 'Огонь погас' : 'Разжигаем огонь'}
                    </p>
                )}

                <ol className="mt-2 flex gap-1.5" aria-hidden="true">
                    {days.map((d) => (
                        <li
                            key={d.date}
                            className={clsx(
                                'h-1.5 w-1.5 rounded-full',
                                d.visited ? 'bg-terracotta' : 'bg-surface-2 ring-1 ring-inset ring-border'
                            )}
                        />
                    ))}
                </ol>

                <p className="mt-2 text-xs text-text-muted">
                    {broken ? (
                        <span className="tabular-nums">
                            Серия прервана — было {broken.from}{' '}
                            {plural(broken.from, ['день', 'дня', 'дней'])}. Начинаем заново.
                        </span>
                    ) : longest > current ? (
                        <span className="tabular-nums">
                            Рекорд — {longest} {plural(longest, ['день', 'дня', 'дней'])}
                        </span>
                    ) : current > 1 ? (
                        <span>Это ваш рекорд. Не дайте огню погаснуть.</span>
                    ) : (
                        <span>Заходите каждый день — огонь будет расти.</span>
                    )}
                </p>
            </div>
        </section>
    );
};