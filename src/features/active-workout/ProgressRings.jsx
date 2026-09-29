import { clsx } from 'clsx';

const circumference = (r) => 2 * Math.PI * r;

export const ProgressRings = ({ done, total, restLeft, restTotal, isResting, size = 240, children }) => {
    const center = size / 2;
    const restR = size * 0.457;
    const activityR = size * 0.371;
    const activityStroke = Math.round(size * 0.05);
    const restStroke = Math.max(4, Math.round(size * 0.022));

    const activity = total > 0 ? done / total : 0;
    const rest = restTotal > 0 ? restLeft / restTotal : 0;

    return (
        <div className="relative shrink-0" style={{ width: size, height: size }}>
            <svg
                width={size} height={size} viewBox={`0 0 ${size} ${size}`}
                className="-rotate-90" aria-hidden="true"
            >
                <circle cx={center} cy={center} r={restR} fill="none" strokeWidth={restStroke}
                    className={clsx('transition-opacity', isResting ? 'stroke-surface-2 opacity-100' : 'opacity-0')} />
                <circle cx={center} cy={center} r={restR} fill="none" strokeWidth={restStroke} strokeLinecap="round"
                    strokeDasharray={circumference(restR)}
                    strokeDashoffset={circumference(restR) * (1 - rest)}
                    className={clsx('stroke-terracotta', isResting ? 'opacity-100' : 'opacity-0')}
                    style={{ transition: 'stroke-dashoffset 1s linear, opacity .25s' }} />

                <circle cx={center} cy={center} r={activityR} fill="none" strokeWidth={activityStroke}
                    className="stroke-surface-2" />
                <circle cx={center} cy={center} r={activityR} fill="none" strokeWidth={activityStroke} strokeLinecap="round"
                    strokeDasharray={circumference(activityR)}
                    strokeDashoffset={circumference(activityR) * (1 - activity)}
                    className="stroke-accent"
                    style={{ transition: 'stroke-dashoffset .6s cubic-bezier(.16,1,.3,1)' }} />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                {children}
            </div>
        </div>
    );
};
