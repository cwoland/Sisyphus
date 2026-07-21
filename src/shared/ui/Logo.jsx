export const Logo = ({ size = 'md', showText = true }) => {
  const dimensions = { sm: 24, md: 32, lg: 40 };
  const px = dimensions[size] || 32;

  return (
    <div className="flex items-center gap-2 select-none">
      <svg
        width={px}
        height={px}
        viewBox="0 0 48 48"
        fill="none"
        className="text-accent shrink-0"
        aria-hidden="true"
      >

        <rect x="2" y="2" width="44" height="44" rx="8" stroke="currentColor" strokeWidth="2.5" />

        <path
          d="M12 12h12v6h-6v12h18v-6h-6v-6h12"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
      {showText && (
        <span className="font-display font-bold tracking-tight text-lg text-text">
          SISYPHUS
        </span>
      )}
    </div>
  );
};