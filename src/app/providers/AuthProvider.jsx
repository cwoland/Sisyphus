import { useEffect } from 'react';
import { useAuthStore } from '../../entities/user/auth.store.js';
import { meRequest } from '../../entities/user/auth.api.js';
import { api } from '../../shared/lib/axios.js';

export const AuthProvider = ({ children }) => {
  const { login, setAuthChecked, isAuthChecked } = useAuthStore();

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const { data } = await api.post('/auth/refresh');
        useAuthStore.getState().setAccessToken(data.accessToken);

        const meData = await meRequest();
        login(meData.user, data.accessToken);
      } catch {
        setAuthChecked(true);
      }
    };

    restoreSession();
  }, []);

  if (!isAuthChecked) {
    return <div>Загрузка...</div>;
  }

  return children;
};