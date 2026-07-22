export const GreekPatternBg = ({ opacity = 0.05 }: { opacity?: number }) => (
  <div
    className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    aria-hidden="true"
    style={{ opacity }}
  >
    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="meander" width="72" height="48" patternUnits="userSpaceOnUse">
          <path
           d="M0 0 H24 V24 H12 V12 H0 V48"
           fill="none"
           stroke="rgb(var(--accent))"
           strokeWidth="2.5"
           strokeLinecap="square"
           />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#meander)" />
    </svg>
  </div>
);