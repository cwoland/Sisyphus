export const GreekMedallion = ({ kind = 'mountain', size = 44, title, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none"
    role={title ? 'img' : undefined} aria-label={title} aria-hidden={title ? undefined : true}
    className={className}>
    <circle cx="32" cy="32" r="29" stroke="currentColor" strokeWidth="1" opacity=".3" />
    <circle cx="32" cy="32" r="25" stroke="currentColor" strokeWidth=".7" opacity=".18" />
    {kind === 'mountain' && <g stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 44 33 22l18 22H13Z" /><path d="m25 31 6 3 5-4 6 4M20 48h24" />
      <circle cx="40" cy="19" r="5" />
    </g>}
    {kind === 'amphora' && <g stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M26 16h12m-10 0v9c-7 7-9 19 4 23 13-4 11-16 4-23v-9M27 49h10M23 27c-11-9-13 8-2 9m20-9c11-9 13 8 2 9M25 38h14" />
    </g>}
    {kind === 'laurel' && <g stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M30 49C14 40 14 25 24 16m10 33c16-9 16-24 6-33M26 48h12" />
      <path d="m21 39-7-2 2-6 7 3m-3-6-5-4 4-5 5 5m19 15 7-2-2-6-7 3m3-6 5-4-4-5-5 5" />
      <path d="m32 24 2.3 5 5.5.7-4 3.8 1 5.5-4.8-2.7-4.8 2.7 1-5.5-4-3.8 5.5-.7L32 24Z" />
    </g>}
  </svg>
);
