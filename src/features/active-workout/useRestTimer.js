import { useState, useEffect, useRef, useCallback } from 'react';

const PRESETS = [60, 90, 120, 180];
const STORAGE_KEY = 'sisyphus-rest-seconds';

const readPreferred = () => {
  try {
    const v = Number(localStorage.getItem(STORAGE_KEY));
    return PRESETS.includes(v) ? v : 120;
  } catch {
    return 120;
  }
};

export const useRestTimer = () => {
  const [duration, setDuration] = useState(readPreferred);
  const [left, setLeft] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!isResting) return;
    ref.current = setInterval(() => {
      setLeft((l) => {
        if (l <= 1) {
          clearInterval(ref.current);
          if (navigator.vibrate) navigator.vibrate([180, 90, 180]);
          setIsResting(false);
          return 0;
        }
        return l - 1;
      });
    }, 1000);
    return () => clearInterval(ref.current);
  }, [isResting]);

  const start = useCallback((seconds) => {
    const d = seconds ?? duration;
    setLeft(d);
    setIsResting(true);
  }, [duration]);

  const stop = useCallback(() => {
    setIsResting(false);
    setLeft(0);
  }, []);

  const choose = useCallback((seconds) => {
    setDuration(seconds);
    try { localStorage.setItem(STORAGE_KEY, String(seconds)); } catch { /* приватный режим */ }
    if (isResting) setLeft(seconds);
  }, [isResting]);

  return { duration, presets: PRESETS, left, isResting, start, stop, choose };
};