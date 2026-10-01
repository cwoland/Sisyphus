import { useState, useEffect } from 'react';
import { Logo } from './Logo.jsx';
import { GreekPatternBg } from './GreekPatternBg.tsx';
import { StoneSlope } from './StoneSlope.jsx';
import { loadingPhrases } from '../lib/sisyphusPhrases.js';

const SLOW_AFTER_MS = 4000;
const PHRASE_MS = 4000;

export const SplashScreen = () => {
  const [slow, setSlow] = useState(false);
  const [phrase, setPhrase] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setSlow(true), SLOW_AFTER_MS);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const i = setInterval(
      () => setPhrase((n) => (n + 1) % loadingPhrases.length),
      PHRASE_MS
    );
    return () => clearInterval(i);
  }, []);

  return (
    <div className="relative isolate flex min-h-[100dvh] flex-col items-center justify-center gap-10 bg-bg px-6">
      <GreekPatternBg />

      <div className="relative flex flex-col items-center gap-6">
        <Logo size="lg" />
        <StoneSlope />

        <div className="flex min-h-[3rem] max-w-xs flex-col items-center gap-1.5 text-center">
          <p key={phrase} className="animate-fade-in text-sm text-text-muted" aria-hidden="true">
            {loadingPhrases[phrase]}
          </p>
          {slow && (
            <p className="animate-fade-in text-xs text-text-muted/80" role="status">
              Сервер просыпается — это занимает 20–30 секунд
            </p>
          )}
        </div>
      </div>

      <p className="sr-only" role="status">Загрузка приложения</p>
    </div>
  );
};