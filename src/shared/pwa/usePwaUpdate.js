import { useEffect, useState } from 'react';
import { registerSW } from 'virtual:pwa-register';


export const usePwaUpdate = () => {
  const [needRefresh, setNeedRefresh] = useState(false);
  const [updateSW, setUpdateSW] = useState(null);

  useEffect(() => {
    const update = registerSW({
      onNeedRefresh() {
        setNeedRefresh(true);
      },
      onOfflineReady() {
      },
    });
    setUpdateSW(() => update);
  }, []);

  const applyUpdate = () => {
    updateSW?.(true);
    setNeedRefresh(false);
  };

  return { needRefresh, applyUpdate, dismiss: () => setNeedRefresh(false) };
};