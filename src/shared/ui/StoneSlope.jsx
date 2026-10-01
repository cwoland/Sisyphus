import { clsx } from 'clsx';

const STONE = { transformBox: 'fill-box', transformOrigin: 'center' };

export const StoneSlope = ({ variant = 'climb', className }) => (
  <svg viewBox="0 0 246 146" className={clsx('w-60 max-w-full', className)} aria-hidden="true">
    <path
      d="M6 134 L210 41"
      fill="none" strokeWidth="2" strokeLinecap="round"
      className="stroke-border-strong"
    />
    <path
      d="M210 41 L240 27"
      fill="none" strokeWidth="2" strokeLinecap="round" strokeDasharray="3 6"
      className="stroke-border-strong opacity-50"
    />
    <circle
      cx="12" cy="120" r="10"
      style={STONE}
      className={clsx(
        'fill-terracotta',
        variant === 'summit'
          ? 'animate-stone-summit'
          : 'animate-stone-climb motion-reduce:animate-none'
      )}
    />
  </svg>
);