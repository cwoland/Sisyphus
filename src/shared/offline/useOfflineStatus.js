import { useState, useEffect } from 'react';
import { replayQueue } from './queue.js';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../entities/user/auth.store.js';

export const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const qc = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);

  useEffect(() => {
    const flush = () => {
      if (userId) replayQueue(() => qc.invalidateQueries()).catch(() => {});
    };

    const goOnline = () => { setIsOnline(true); flush(); };
    const goOffline = () => setIsOnline(false);

    const onVisible = () => { if (document.visibilityState === 'visible') flush(); };

    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    document.addEventListener('visibilitychange', onVisible);

    if (navigator.onLine) flush();

    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [qc, userId]);

  return isOnline;
};
