import { useEffect } from 'react';
import { useAuthStore } from '../../entities/user/auth.store.js';
import { meRequest } from '../../entities/user/auth.api.js';
import { refreshSession } from '../../shared/lib/axios.js';
import { readOfflineUser, forgetOfflineUser } from '../../shared/offline/workoutCache.js';
import { SplashScreen } from '../../shared/ui/SplashScreen.jsx';

export const AuthProvider = ({ children }) => {
  const { login, logout, setAuthChecked, isAuthChecked } = useAuthStore();

  useEffect(() => {
    let alive = true;
    let restoring = false;
    const restoreLocal = () => {
      const user = readOfflineUser();
      if (user) login(user, null);
      else setAuthChecked(true);
    };
    const restoreSession = async () => {
      if (restoring || !alive) return;
      if (navigator.onLine === false) { restoreLocal(); return; }
      restoring = true;
      try {
        const token = await refreshSession();
        const { user } = await meRequest();
        if (alive) login(user, token);
      } catch (error) {
        if (!alive) return;
        if (!error.response) restoreLocal();
        else if (error.response.status === 401) { forgetOfflineUser(); logout(); }
        else setAuthChecked(true);
      } finally { restoring = false; }
    };
    const reconnect = () => {
      if (!useAuthStore.getState().accessToken) restoreSession();
    };
    restoreSession();
    window.addEventListener('online', reconnect);
    return () => { alive = false; window.removeEventListener('online', reconnect); };
  }, [login, logout, setAuthChecked]);

  return isAuthChecked ? children : <SplashScreen />;
};
