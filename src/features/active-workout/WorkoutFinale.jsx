import { StoneSlope } from '../../shared/ui/StoneSlope.jsx';
import { Spinner } from '../../shared/ui/Spinner.jsx';

export const WorkoutFinale = ({ phrase, isSaving, onSkip }) => (
  <div
    onClick={onSkip}
    className="fixed inset-0 z-[70] flex cursor-pointer flex-col items-center justify-center gap-10 bg-bg px-8 pad-safe-top pad-safe-bottom"
  >
    <StoneSlope variant="summit" />

    <div className="flex max-w-sm flex-col items-center gap-4 text-center">
      <p
        role="status"
        className="animate-rise-in font-display text-xl font-bold leading-snug text-text [animation-delay:450ms] [animation-fill-mode:backwards]"
      >
        {phrase}
      </p>

      {isSaving && (
        <p className="flex animate-fade-in items-center gap-2 text-xs text-text-muted [animation-delay:1800ms] [animation-fill-mode:backwards]">
          <Spinner size="sm" /> Сохраняем
        </p>
      )}
    </div>
  </div>
);