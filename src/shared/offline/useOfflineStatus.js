import { useState, useEffect } from 'react';
import { replayQueue } from './queue.js';
import { useQueryClient } from '@tanstack/react-query';

export const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const qc = useQueryClient();

  useEffect(() => {
    const goOnline = () => {
      setIsOnline(true);
      replayQueue(() => qc.invalidateQueries());
    };
    const goOffline = () => setIsOnline(false);

    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);

    if (navigator.onLine) replayQueue(() => qc.invalidateQueries());

    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, [qc]);

  return isOnline;
};