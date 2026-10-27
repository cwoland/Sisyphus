import { ru } from 'date-fns/locale';
import { clsx } from 'clsx';

import { Skeleton } from '../../../shared/ui/Skeleton';
import { format, addMonths } from '../../../shared/lib/date.js';
import { plural } from '../../../shared/lib/plural.js';
import { SectionLink } from '../../../shared/ui/SectionLink.jsx';

export const ContinuityStrip = ({ query }) => {
    if (query.isLoading) return <Skeleton className="h-28 w-full rounded-2xl" />;

    const data = query.data;
    if (!data) return null;

    const { current, longest, thisWeekClosed, weeks, thisMonth, lastMonth } = data;

    const thisMonthName = format(new Date(), 'LLLL', { locale: ru });
    const lastMonthName = format(addMonths(new Date(), -1), 'LLLL', { locale: ru });

    return (
        <section aria-label="Непрерывность" className="rounded-2xl border border-border bg-surface p-4">
            <div className="flex items-baseline justify-between gap-3">
                <h2 className="font-display text-sm font-semibold uppercase tracking-[0.14em] text-text-muted">
                    Непрерывность
                </h2>
                <SectionLink to="/stats">Нагрузка</SectionLink>
            </div>

            {current > 0 ? (
                <p className="mt-2 font-display text-3xl font-extrabold leading-none tabular-nums text-text">
                    {current}
                    <span className="ml-2 text-base font-medium text-text-muted">
                        {plural(current, ['неделя', 'недели', 'недель'])} подряд
                    </span>
                </p>
                ) : (
                    <p className="mt-2 font-display text-xl font-bold leading-tight text-text">
                        {longest > 0 ? 'Серия прервана' : 'Пока ни одной закрытой недели'}
                    </p>
                )}

                <ol className="mt-3 flex gap-1" aria-hidden="true">
                    {weeks.map((w, i) => (
                        <li 
                            key={w.week}
                            className={clsx(
                                'h-2 flex-1 rounded-full',
                                w.closed
                                    ? 'bg-terracotta'
                                    : i === weeks.length - 1
                                        ? 'bg-surface-2 ring-1 ring-inset ring-border-strong'
                                        : 'bg-surface-2'
                            )}
                        />
                    ))}
                </ol>

                <p className="mt-2.5 text-xs capitalize text-text-muted">
                    {longest > 0 && <span className="tabular-nums">Рекорд {longest}</span>}
                    <span className="tabular-nums">
                        {thisMonthName}: {thisMonth}
                    </span>
                    {lastMonth > 0 && (
                        <span className="tabular-nums"> · {lastMonthName}: {lastMonth}</span>
                    )}
                    {current > 0 && !thisWeekClosed && (
                        <span className="lowercase"> · эта неделя ещё открыта</span>
                    )}
                </p>
        </section>
    );
};