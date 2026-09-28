import { clsx } from 'clsx';

const SIZE = 280;
const CENTER = SIZE / 2;
const ACTIVITY_R = 104;
const REST_R = 128;

const ring = (r) => 2 * Math.PI * r;

export const ProgressRings = ({ done, total, restLeft, restTotal, isResting, children }) => {
    const activity = total > 0 ? done / total : 0;
    const rest = restTotal > 0 ? restLeft / restTotal : 0;

    return (
        <div className="relative mx-auto" style={{ width: SIZE, height: SIZE }}>
            <svg
                width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}
                className="-rotate-90" aria-hidden="true"
            >
                <circle cx={CENTER} cy={CENTER} r={REST_R} fill="none" strokeWidth="6"
                    className={clsx('transition-opacity', isResting ? 'stroke-surface-2 opacity-100' : 'opacity-0')} />
                <circle cx={CENTER} cy={CENTER} r={REST_R} fill="none" strokeWidth="6" strokeLinecap="round"
                    strokeDasharray={ring(REST_R)}
                    strokeDashoffset={ring(REST_R) * (1 - rest)}
                    className={clsx('stroke-terracotta transition-opacity', isResting ? 'opacity-100' : 'opacity-0')}
                    style={{ transition: 'stroke-dashoffset 1s linear, opacity .25s' }} />

                <circle cx={CENTER} cy={CENTER} r={ACTIVITY_R} fill="none" strokeWidth="14" className="stroke-surface-2" />
                <circle cx={CENTER} cy={CENTER} r={ACTIVITY_R} fill="none" strokeWidth="14" strokeLinecap="round"
                    strokeDasharray={ring(ACTIVITY_R)}
                    strokeDashoffset={ring(ACTIVITY_R) * (1 - activity)}
                    className="stroke-accent"
                    style={{ transition: 'stroke-dashoffset .6s cubic-bezier(.16,1,.3,1)' }} />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                {children}
            </div>
        </div>
    );
}