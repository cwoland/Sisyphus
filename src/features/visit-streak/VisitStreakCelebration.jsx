import { useEffect } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { X } from 'lucide-react';
import { useVisitStreak } from '../../entities/stats/visit.hooks.js';
import { useAuthStore } from '../../entities/user/auth.store.js';
import { StreakFlame } from '../../shared/ui/StreakFlame.jsx';
import { plural } from '../../shared/lib/plural.js';
import { useVisitCelebration } from './celebration.store.js';
import '../../shared/ui/epic.css';

export const VisitStreakCelebration = () => {
  useVisitStreak();
  const userId = useAuthStore((s) => s.user?.id);
  const { celebration, dismiss } = useVisitCelebration();
  const reduced = useReducedMotion();
  const visible = celebration?.userId === userId && !!userId;
  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(dismiss, 5200);
    return () => clearTimeout(timer);
  }, [celebration, visible, dismiss]);

  return <AnimatePresence>
    {visible && <motion.aside key={`${celebration.userId}:${celebration.date}`}
      role="status" aria-label="Серия продлена" aria-live="polite"
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: reduced ? 0 : 12 }}
      transition={{ duration: reduced ? 0 : 0.4 }}
      className="epic-streak-celebration fixed inset-x-4 z-[80] mx-auto flex max-w-md items-center gap-4 overflow-hidden rounded-3xl border border-gold-ink/30 bg-surface p-5 shadow-2xl">
      <motion.div aria-hidden="true" animate={reduced ? {} : { scale: [0.8, 1.18, 1], rotate: [-6, 4, 0] }}
        transition={{ duration: 0.8 }} className="relative shrink-0 rounded-2xl bg-terracotta/10 p-3">
        <StreakFlame lit size={32} />
      </motion.div>
      <div className="min-w-0 flex-1 pr-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-terracotta-ink">
          {celebration.current > 1 ? 'Огонь стал сильнее' : 'Огонь зажжён'}
        </p>
        <p className="mt-1 text-2xl font-bold tabular-nums text-text">
          <motion.span key={celebration.current} className="inline-block"
            initial={reduced ? false : { y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            transition={{ delay: reduced ? 0 : 0.25, duration: 0.35 }}>{celebration.current}</motion.span>
          <span className="ml-2 text-sm font-medium">{plural(celebration.current, ['день', 'дня', 'дней'])} подряд</span>
        </p>
        <p className="mt-1 text-xs text-text-muted">Ты вернулся. Ещё один день на пути.</p>
      </div>
      <button type="button" onClick={dismiss} aria-label="Закрыть поздравление"
        className="absolute right-1 top-1 flex h-11 w-11 items-center justify-center rounded-xl text-text-muted hover:bg-surface-2"><X size={18} /></button>
    </motion.aside>}
  </AnimatePresence>;
};
