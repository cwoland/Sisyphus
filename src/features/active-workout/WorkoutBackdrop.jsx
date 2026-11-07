export const WorkoutBackdrop = () => (
  <div
    aria-hidden="true"
    className="pointer-events-none absolute inset-0 -z-10 select-none overflow-hidden"
  >
    <div
      className="absolute inset-0"
      style={{
        background:
          'radial-gradient(ellipse at 100% 100%, rgb(var(--terracotta) / .10), transparent 65%)',
      }}
    />

    <img
      src="/art/ui/workout-resolve.webp"
      width="877"
      height="960"
      alt=""
      draggable="false"
      decoding="async"
      className="absolute -right-10 bottom-[calc(4rem+env(safe-area-inset-bottom))] h-auto w-[72%] max-w-[24rem] object-contain opacity-[0.20] dark:opacity-[0.24]"
    />
  </div>
);