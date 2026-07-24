import { useState, useEffect } from 'react';
import { Logo } from './Logo.jsx';
import { GreekPatternBg } from './GreekPatternBg.tsx';

export const SplashScreen = () => {
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setSlow(true), 4000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="relative isolate flex min-h-[100dvh] flex-col items-center justify-center gap-8 bg-bg px-6">
      <GreekPatternBg />

      <div className="relative flex flex-col items-center gap-6">
        <Logo size="lg" />

        <div className="h-1 w-40 overflow-hidden rounded-full bg-surface-2">
          <div className="h-full w-1/4 rounded-full bg-accent animate-loading-bar" />
        </div>

        <p className="max-w-xs text-center text-sm text-text-muted">
          {slow ? 'Пробуждаем сервер — это займёт 20–30 секунд' : 'Камень уже ждёт'}
        </p>
      </div>
    </div>
  );
};