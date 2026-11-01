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

const readEndsAt = (key) => {
  try {
    const v = Number(localStorage.getItem(key));
    return v > Date.now() ? v : null;
  } catch {
    return null;
  }
};

const persistEndsAt = (key, v) => {
  try {
    if (v) localStorage.setItem(key, String(v));
    else localStorage.removeItem(key);
  } catch { /* приватный режим */ }
};

const leftFrom = (endsAt) => (endsAt ? Math.max(0, Math.ceil((endsAt - Date.now()) / 1000)) : 0);

export const useRestTimer = (workoutId) => {
  const endsKey = `sisyphus-rest-ends-at:${workoutId}`;
  const [duration, setDuration] = useState(readPreferred);
  const [endsAt, setEndsAt] = useState(() => readEndsAt(endsKey));
  const [left, setLeft] = useState(() => leftFrom(readEndsAt(endsKey)));
  const wakeLock = useRef(null);

  useEffect(() => {
    persistEndsAt(endsKey, endsAt);
    if (!endsAt) return;

    let fired = false;
    const tick = () => {
      const l = leftFrom(endsAt);
      setLeft(l);
      if (l === 0 && !fired) {
        fired = true;
        if (navigator.vibrate) navigator.vibrate([180, 90, 180]);
        setEndsAt(null);
      }
    };

    tick();
    const id = setInterval(tick, 250);
    document.addEventListener('visibilitychange', tick);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', tick);
    };
  }, [endsAt, endsKey]);

  useEffect(() => {
    if (!endsAt || !('wakeLock' in navigator)) return;

    let alive = true;
    const acquire = async () => {
      if (!alive || document.visibilityState !== 'visible') return;
      try {
        const lock = await navigator.wakeLock.request('screen');
        if (!alive) await lock.release();
        else wakeLock.current = lock;
      } catch { /* низкий заряд или вкладка в фоне */ }
    };

    acquire();
    document.addEventListener('visibilitychange', acquire);
    return () => {
      alive = false;
      document.removeEventListener('visibilitychange', acquire);
      wakeLock.current?.release?.().catch(() => {});
      wakeLock.current = null;
    };
  }, [endsAt, endsKey]);

  const start = useCallback((seconds) => {
    const d = seconds ?? duration;
    setLeft(d);
    setEndsAt(Date.now() + d * 1000);
  }, [duration]);

  const stop = useCallback(() => {
    setEndsAt(null);
    setLeft(0);
  }, []);

  const choose = useCallback((seconds) => {
    setDuration(seconds);
    try { localStorage.setItem(STORAGE_KEY, String(seconds)); } catch { /* приватный режим */ }
    setEndsAt((cur) => (cur ? Date.now() + seconds * 1000 : cur));
  }, []);

  return { duration, presets: PRESETS, left, isResting: endsAt !== null, start, stop, choose };
};