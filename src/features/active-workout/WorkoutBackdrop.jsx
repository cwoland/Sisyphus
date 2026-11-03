export const WorkoutBackdrop = () => (
    <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden select-none"
    >
        <div
            className="absolute inset-0"
            style={{
                background: 'radial-gradient(ellipse at 100% 100%, rgb(var(--terracotta) / .06), transparent 65%)',
            }}
        />
        <img
            src="/art/ui/workout-resolve.webp"
            width="877"
            height="960"
            alt=""
            draggable="false"
            decoding="async"
            className="absolute -right-6 bottom-[calc(6rem+env(safe-area-inset-bottom))] h-auto w-[42%] max-w-56 object-contain opacity-[0.07] dark:opacity-[0.10]"
        />
    </div>
);