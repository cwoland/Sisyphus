import { useId } from 'react';
import { clsx } from 'clsx';

const FLAME =
    'M12.6 1C11.9 6 9.6 9.3 7.2 11.7 4.6 14.3 3 17 3 20.3 3 26.2 7 31 12 31s9-4.8 9-10.7' +
    'c0-2.7-1-5-2.6-7.1.2 2.4-.5 4-2 4.8.6-3.6-.6-8.7-3.8-17Z';

const CORE =
    'M12 14.6c0 0 4 4.3 4 8.5 0 3.5-1.8 5.8-4 5.8s-4-2.3-4-5.8c0-2.8 2.2-5.8 4-8.5Z';

export const StreakFlame = ({ lit, size = 40, className }) => {
    const id = useId();

    return (
        <svg
            viewBox="0 0 24 32"
            width={size}
            height={Math.round((size * 32) / 24)}
            aria-hidden="true"
            className={clsx('shrink-0', className)}
        >
            <defs>
                <linearGradient id={id} x1="0" y1="1" x2="0" y2="0">
                    <stop offset="0%" stopColor="rgb(var(--gold))" />
                    <stop offset="52%" stopColor="rgb(var(--terracotta))" />
                    <stop offset="100%" stopColor="rgb(var(--terracotta-ink))" />
                </linearGradient>
            </defs>

            <g
                className={lit ? 'animate-flame-flicker' : undefined}
                style={{ transformOrigin: '50% 100%' }}
            >
                <path d={FLAME} fill={lit ? `url(#${id})` : 'rgb(var(--border-strong))'} />
                <path
                    d={CORE}
                    className={lit ? undefined : 'animate-ember-glow'}
                    fill={lit ? 'rgb(var(--gold))' : 'rgb(var(--terracotta))'}
                    opacity={lit ? 0.85 : 0.5}
                />
            </g>
        </svg>
    );
};