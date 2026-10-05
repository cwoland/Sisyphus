import { Trophy, X } from 'lucide-react';
import { IconButton } from '../../shared/ui/IconButton.jsx';

export const RecordBanner = ({ record, onDismiss }) => (
  <div className="pointer-events-none fixed inset-x-0 top-[calc(env(safe-area-inset-top)+4.75rem)] z-30 flex justify-center px-4">
    <div
      role="status"
      className="animate-record-flash pointer-events-auto flex w-full max-w-md items-center gap-3 rounded-2xl border border-gold bg-surface p-3 shadow-lg"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold text-on-gold">
        <Trophy size={20} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="font-display text-[11px] font-semibold uppercase tracking-[0.14em] text-gold-ink">
          {record.previousOneRm == null ? 'Первый результат' : 'Личный рекорд'}
        </p>
        <p className="truncate text-sm text-text">
          <b className="font-semibold">{record.exerciseName}</b>{' '}
          <span className="tabular-nums">{Math.round(record.oneRm)} кг</span>
          {record.previousOneRm != null && (
            <span className="text-text-muted"> · было {Math.round(record.previousOneRm)}</span>
          )}
        </p>
      </div>

      <IconButton
        icon={X} size={16} onClick={onDismiss}
        className="text-text-muted hover:text-text"
        aria-label="Скрыть"
      />
    </div>
  </div>
);
