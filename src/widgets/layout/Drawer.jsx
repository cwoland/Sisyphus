import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { clsx } from 'clsx';
import { Sidebar } from './Sidebar.jsx';
import { lockScroll, unlockScroll } from '../../shared/lib/scrollLock.js';

export const Drawer = ({ isOpen, onClose }) => {
  const panelRef = useRef(null);
  const restoreTo = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    restoreTo.current = document.activeElement;
    lockScroll();
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      unlockScroll();
      restoreTo.current?.focus?.();
    };
  }, [isOpen, onClose]);

    return createPortal(
    <>
      <div
        className={clsx(
          'fixed inset-0 z-50 bg-rail/60 transition-opacity duration-300 lg:hidden',
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        ref={panelRef}
        className={clsx(
          'fixed inset-y-0 left-0 z-50 w-72 max-w-[85%] bg-rail shadow-2xl lg:hidden',
          'transition-transform duration-300 ease-[cubic-bezier(.16,1,.3,1)]',
          'pad-safe-top pad-safe-bottom',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Меню"
      >
        <button
          onClick={onClose}
          className="absolute right-3 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-xl text-rail-ink-muted transition-colors hover:bg-rail-hover hover:text-rail-ink"
          style={{ marginTop: 'env(safe-area-inset-top)' }}
          aria-label="Закрыть меню"
        >
          <X size={20} />
        </button>
        <Sidebar onNavigate={onClose} withSearch />
      </aside>
    </>,
    document.body
  );
};