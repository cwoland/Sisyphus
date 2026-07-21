import { LogOut, Moon, Sun, User, Sparkles, Download, Bell, BellOff } from 'lucide-react';

import { useAuthStore } from '../../entities/user/auth.store.js';
import { useThemeStore } from '../../entities/theme/theme.store.js';
import { logoutRequest } from '../../entities/user/auth.api.js';
import { useInstallPrompt } from '../../shared/pwa/useInstallPrompt.js';
import { usePushNotifications } from '../../features/push/usePushNotifications.js';
import { Avatar } from '../../shared/ui/Avatar.jsx';
import { Button } from '../../shared/ui/Button.jsx';
import { toast } from '../../shared/ui/toast/toast.store.js';
import { useQueryClient } from '@tanstack/react-query';

export const ProfilePage = () => {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const { theme, toggleTheme } = useThemeStore();
  const qc = useQueryClient();
  const { isInstallable, promptInstall } = useInstallPrompt();
  const push = usePushNotifications();

  const handleLogout = async () => {
    try {
      await logoutRequest();
    } catch {
      
    } finally {
      qc.clear();
      logout();
      toast.info('Вы вышли. Камень подождёт до следующего раза.');
    }
  };

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="font-display text-2xl font-bold text-text">Профиль</h1>

      <div className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-5">
        <Avatar name={user?.name} src={user?.avatar_url} size="lg" />
        <div className="min-w-0">
          <p className="truncate font-display text-lg font-semibold text-text">{user?.name}</p>
          <p className="truncate text-sm text-text-muted">{user?.email}</p>
        </div>
      </div>

      <div className="space-y-2">
        <p className="px-1 text-sm font-medium text-text-muted">Настройки</p>

        <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface">          <button
            onClick={toggleTheme}
            className="flex w-full items-center justify-between p-4 transition-colors hover:bg-surface-2"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface-2 text-text">
                {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
              </div>
              <span className="text-sm font-medium text-text">Тема</span>
            </div>
            <span className="text-sm text-text-muted">{theme === 'dark' ? 'Тёмная' : 'Светлая'}</span>
          </button>

          {push.isSupported && (
            <button
            onClick={push.isSubscribed ? push.unsubscribe : push.subscribe}
            disabled={push.isLoading}
            className="flex w-full items-center justify-between p-4 transition-colors hover:bg-surface-2 disabled:opacity-60"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface-2 text-text">
                  {push.isSubscribed ? <Bell size={18} /> : <BellOff size={18} />}
                </div>
                <span className="text-sm font-medium text-text">Уведомления</span>
              </div>
              <span className="text-sm text-text-muted">{push.isSubscribed ? 'Вкл' : 'Выкл'}</span>
            </button>
          )}

          <div className="flex w-full items-center justify-between p-4 opacity-60">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface-2 text-text">
                <User size={18} />
              </div>
              <span className="text-sm font-medium text-text">Аватар</span>
            </div>
            <span className="text-xs text-text-muted">Скоро</span>
          </div>
        </div>
      </div>

      {isInstallable && (
        <Button variant="secondary" className="w-full" onClick={promptInstall}>
          <Download size={18} /> Установить приложение
        </Button>
      )}

      <Button variant="danger" className="w-full" onClick={handleLogout}>
        <LogOut size={18} /> Выйти
      </Button>

      <p className="flex items-center justify-center gap-1.5 text-center text-xs text-text-muted">
        <Sparkles size={12} />
        Нужно представлять Сизифа счастливым
      </p>
    </div>
  );
};