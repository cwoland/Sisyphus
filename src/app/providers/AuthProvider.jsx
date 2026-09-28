import { useEffect } from 'react';
import { useAuthStore } from '../../entities/user/auth.store.js';
import { meRequest } from '../../entities/user/auth.api.js';
import { refreshSession } from '../../shared/lib/axios.js';
import { SplashScreen } from '../../shared/ui/SplashScreen.jsx';

export const AuthProvider = ({ children }) => {
  const { login, setAuthChecked, isAuthChecked } = useAuthStore();

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const accessToken = await refreshSession();
        const meData = await meRequest();
        login(meData.user, accessToken);
      } catch {
        setAuthChecked(true);
      }
    };

    restoreSession();
  }, []);

  if (!isAuthChecked) {
    return <SplashScreen />;
  }

  return children;
};