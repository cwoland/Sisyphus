import { createPortal } from 'react-dom';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';
import { clsx } from 'clsx';
import { useToastStore } from './toast.store.js';

const icons = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
};

const accents = {
  success: 'text-green-500',
  error: 'text-crimson',
  info: 'text-accent',
};

export const ToastContainer = () => {
  const { toasts, removeToast } = useToastStore();

  return createPortal(
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[100] flex flex-col items-end gap-2 px-4 pt-safe-top sm:px-6">
      <div className="mt-3 flex w-full max-w-sm flex-col gap-2">
        {toasts.map((t) => {
          const Icon = icons[t.type] || Info;
          return (
            <div
              key={t.id}
              className="pointer-events-auto flex items-start gap-3 rounded-xl border border-border bg-surface px-4 py-3 shadow-lg animate-toast-in"
            >
              <Icon size={20} className={clsx('shrink-0 mt-0.5', accents[t.type])} />
              <p className="flex-1 text-sm text-text break-words">{t.message}</p>
              <button
                onClick={() => removeToast(t.id)}
                className="shrink-0 text-text-muted hover:text-text transition-colors"
                aria-label="Закрыть"
              >
                <X size={18} />
              </button>
            </div>
          );
        })}
      </div>
    </div>,
    document.body
  );
};