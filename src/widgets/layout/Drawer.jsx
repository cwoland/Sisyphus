import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { clsx } from 'clsx';
import { Sidebar } from './Sidebar.jsx';

export const Drawer = ({ isOpen, onClose }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [isOpen]);

  return createPortal(
    <>
      <div
        className={clsx(
          'fixed inset-0 z-50 bg-black/40 transition-opacity lg:hidden',
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-50 w-72 max-w-[85%] bg-surface shadow-xl transition-transform duration-300 pad-safe-top pad-safe-bottom lg:hidden',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        role="dialog"
        aria-modal="true"
      >
        <button
          onClick={onClose}
          className="absolute right-3 top-3 z-10 rounded-lg p-2 text-text-muted hover:bg-surface-2 hover:text-text"
          style={{ marginTop: 'env(safe-area-inset-top)' }}
          aria-label="Закрыть меню"
        >
          <X size={20} />
        </button>
        <Sidebar onNavigate={onClose} />
      </aside>
    </>,
    document.body
  );
};