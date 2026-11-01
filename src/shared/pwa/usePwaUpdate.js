import { useEffect, useState, useRef } from 'react';
import { registerSW } from 'virtual:pwa-register';


export const usePwaUpdate = () => {
  const [needRefresh, setNeedRefresh] = useState(false);
  const updateSW = useRef(null);

  useEffect(() => {
    const update = registerSW({
      onNeedRefresh() {
        setNeedRefresh(true);
      },
      onOfflineReady() {
      },
    });
    updateSW.current = update;
  }, []);

  const applyUpdate = () => {
    updateSW.current?.(true);
    setNeedRefresh(false);
  };

  return { needRefresh, applyUpdate, dismiss: () => setNeedRefresh(false) };
};