import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Plus, Minus, X } from 'lucide-react';

export const RestTimer = ({ initial = 120, onClose }) => {
  const [total, setTotal] = useState(initial);
  const [left, setLeft] = useState(initial);
  const [running, setRunning] = useState(true);
  const ref = useRef(null);

  useEffect(() => {
    if (!running) return;
    ref.current = setInterval(() => {
      setLeft((l) => {
        if (l <= 1) {
          clearInterval(ref.current);
          if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
          setRunning(false);
          return 0;
        }
        return l - 1;
      });
    }, 1000);
    return () => clearInterval(ref.current);
  }, [running]);

  const adjust = (delta) => {
    setTotal((t) => Math.max(15, t + delta));
    setLeft((l) => Math.max(1, l + delta));
  };
  const reset = () => { setLeft(total); setRunning(true); };

  const mm = String(Math.floor(left / 60)).padStart(1, '0');
  const ss = String(left % 60).padStart(2, '0');
  const pct = (left / total) * 100;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface pad-safe-bottom">
      <div className="h-1 bg-surface-2">
        <div className="h-full bg-accent transition-all duration-1000 ease-linear" style={{ width: `${pct}%` }} />
      </div>
      <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3">
        <span className="text-xs font-medium text-text-muted">Отдых</span>
        <span className={`font-display text-2xl font-bold tabular-nums ${left === 0 ? 'text-accent' : 'text-text'}`}>
          {mm}:{ss}
        </span>

        <div className="ml-auto flex items-center gap-1">
          <button onClick={() => adjust(-15)} className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-2 text-text-muted hover:text-text" aria-label="-15 сек">
            <Minus size={16} />
          </button>
          <button onClick={() => adjust(15)} className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-2 text-text-muted hover:text-text" aria-label="+15 сек">
            <Plus size={16} />
          </button>
          <button onClick={running ? () => setRunning(false) : reset} className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-white" aria-label={running ? 'Пауза' : 'Заново'}>
            {running ? <Pause size={16} /> : <RotateCcw size={16} />}
          </button>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted hover:text-text" aria-label="Закрыть">
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};