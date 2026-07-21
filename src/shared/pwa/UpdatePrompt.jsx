import { RefreshCw, X } from 'lucide-react';
import { usePwaUpdate } from './usePwaUpdate.js';

export const UpdatePrompt = () => {
  const { needRefresh, applyUpdate, dismiss } = usePwaUpdate();

  if (!needRefresh) return null;

  return (
    <div className="fixed inset-x-4 bottom-24 z-[90] mx-auto max-w-sm rounded-2xl border border-border bg-surface p-4 shadow-lg pad-safe-bottom lg:bottom-6">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
          <RefreshCw size={18} />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-text">Доступно обновление</p>
          <p className="mt-0.5 text-xs text-text-muted">Новая версия готова к установке.</p>
          <button onClick={applyUpdate} className="mt-2 text-sm font-medium text-accent hover:text-accent-hover">
            Обновить
          </button>
        </div>
        <button onClick={dismiss} className="text-text-muted hover:text-text" aria-label="Закрыть">
          <X size={18} />
        </button>
      </div>
    </div>
  );
};