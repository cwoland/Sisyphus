import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { clsx } from 'clsx';
import { lockScroll, unlockScroll } from '../lib/scrollLock.js';

export const Sheet = ({ isOpen, onClose, title, headerActions, children }) => {
  const [vv, setVv] = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    lockScroll();
    return unlockScroll;
  }, [isOpen]);

  useEffect(() => {
    const onEsc = (e) => e.key === 'Escape' && onClose();
    if (isOpen) window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [isOpen, onClose]);

  useEffect(() => {
    const viewport = window.visualViewport;
    if (!isOpen || !viewport) return;

    const sync = () => setVv({ height: viewport.height, top: viewport.offsetTop });
    sync();
    viewport.addEventListener('resize', sync);
    viewport.addEventListener('scroll', sync);

    return () => {
      viewport.removeEventListener('resize', sync);
      viewport.removeEventListener('scroll', sync);
      setVv(null);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      style={vv ? { height: `${vv.height}px`, top: `${vv.top}px`, bottom: 'auto' } : undefined}
    >
      <div className="absolute inset-0 bg-black/40 animate-fade-in" onClick={onClose} aria-hidden="true" />

      <div
        role="dialog"
        aria-modal="true"
        className={clsx(
          'relative z-10 flex w-full flex-col bg-surface shadow-xl',
          'h-[92dvh] max-h-full rounded-t-2xl pad-safe-bottom',
          'sm:h-auto sm:max-w-2xl sm:min-h-[70dvh] sm:max-h-[88dvh] sm:rounded-2xl',
          'animate-fade-in'
        )}
      >
        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border px-5 py-4">
          <h2 className="min-w-0 flex-1 truncate font-display text-lg font-semibold text-text">{title}</h2>
          <div className="flex items-center gap-1">
            {headerActions}
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-text-muted hover:bg-surface-2 hover:text-text"
              aria-label="Закрыть"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4 no-scrollbar">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};