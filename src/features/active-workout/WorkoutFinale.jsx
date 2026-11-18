import { Check, Clock3, Dumbbell, Layers3, Weight } from 'lucide-react';

import { Button } from '../../shared/ui/Button.jsx';
import { Spinner } from '../../shared/ui/Spinner.jsx';

const formatTonnage = (value) => new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 1 }).format(value);

const Stat = ({ icon: Icon, label, value, unit }) => (
  <div className="min-w-0 rounded-2xl border border-white/15 bg-black/30 p-3 backdrop-filter-blur-sm">
    <div className="flex items-center gap-2 text-[#e9b68a]">
      <Icon
        size={15}
        aria-hidden="true"
      />

      <span className="text-[11px] font-semibold uppercase tracking-[0.08em]">
        {label}
      </span>
    </div>

    <p className="mt-2 break-words font-display text-xl font-extrabold leading-tight tabular-nums text-white">
      {value}

      {unit && (
        <span className="ml-1 text-xs font-medium text-white/65">
          {unit}
        </span>
      )}
    </p>
  </div>
);

export const WorkoutFinale = ({ phrase, summary, saveState, onClose }) => {
  const isSaving = saveState === 'saving';
  const isQueued = saveState === 'queued';
  const canClose = saveState === 'saved' || isQueued;

  return (
    <div 
      role="dialog"
      aria-modal="true"
      aria-labelledby="workout-finale-title"
      className="fixed inset-0 z-[70] overflow-y-auto bg-[#17100c] text-white overscroll-contain"
    >
      <div className="relative isolate flex min-h-[100dvh] flex-col overflow-hidden">
        <img
          src="/art/ui/workout-summit.webp"
          alt=""
          aria-hidden="true"
          draggable="false"
          className="pointer-events-none absolute inset-0 -z-20 h-full w-full select-none object-cover object-top"
        />

        <div 
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-black/10 via-[#17100c]/55 to-[#17100c]"
        />

        <div className="mx-auto flex min-h-[100dvh] w-full max-w-xl flex-col px-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-[calc(1.5rem+env(safe-area-inset-top))] sm:px-8">
          <div className="animate-rise-in pt-3">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#f2c69d]">
              Тренировка завершена
            </p>

            <h1
              id="workout-finale-title"
              className="mt-3 max-w-[12ch] font-display text-4xl font-extrabold leading-[0.95] tracking-tight text-white sm:text-5xl"
            >
              Вершина взята
            </h1>
          </div>

          <div className="min-h-32 flex-1" aria-hidden="true" />

          <div className="animate-rise-in space-y-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#e9b68a]">
                {summary.title}
              </p>

              <p className="mt-2 max-w-[32ch] font-display text-xl font-bold leading-snug text-white">
                {phrase}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Stat
                icon={Clock3}
                label="Время"
                value={summary.duration}
              />

              <Stat
                icon={Dumbbell}
                label="Упражнения"
                value={summary.exercises}
              />

              <Stat
                icon={Layers3}
                label="Подходы"
                value={summary.sets}
              />

              <Stat
                icon={Weight}
                label="Тоннаж"
                value={formatTonnage(summary.tonnage)}
                unit="кг"
              />
            </div>

            <p className="text-xs leading-relaxed text-white/60">
            Тоннаж считается по выполненным подходам, в которых указаны вес и повторения. Упражнения с собственным весом не учитываются, если вес не записан.</p>

            <div 
              role="status"
              aria-live="polite"
              className="flex min-h-10 items-center gap-2 text-sm text-white/80"
            >
              {isSaving ? (
                <>
                  <Spinner size="sm" />
                  Сохраняем тренировку...
                </>
              ) : isQueued ? (
                <>
                  <Check size={16} />
                  Сохранено на устройстве. Синхронизируем при подключении к сети.
                </>
              ) : (
                <>
                  <Check size={16} />
                  Тренировка сохранена
                </>
              )}
            </div>

            <Button
              type="button"
              size="lg"
              onClick={onClose}
              disabled={!canClose}
              className="w-full"
            >
              На главную
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};