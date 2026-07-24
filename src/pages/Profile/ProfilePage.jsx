import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  LogOut, Moon, Sun, Monitor, Sparkles, Download, Bell, BellOff,
  Pencil, KeyRound, Check, UserCircle,
} from 'lucide-react';
import { clsx } from 'clsx';

import { useAuthStore } from '../../entities/user/auth.store.js';
import { useThemeStore } from '../../entities/theme/theme.store.js';
import {
  logoutRequest, updateProfileRequest, changePasswordRequest,
} from '../../entities/user/auth.api.js';
import { avatarIcons, avatarIconNames } from '../../entities/user/avatarIcons.js';
import { useInstallPrompt } from '../../shared/pwa/useInstallPrompt.js';
import { usePushNotifications } from '../../features/push/usePushNotifications.js';
import { Avatar } from '../../shared/ui/Avatar.jsx';
import { Button } from '../../shared/ui/Button.jsx';
import { Input } from '../../shared/ui/Input.jsx';
import { PasswordInput } from '../../shared/ui/PasswordInput.jsx';
import { Sheet } from '../../shared/ui/Sheet.jsx';
import { BodyMetricsCard } from '../../features/body/BodyMetricsCard.jsx';
import { toast } from '../../shared/ui/toast/toast.store.js';

const THEME_MODES = [
  { value: 'light', label: 'Светлая', icon: Sun },
  { value: 'dark', label: 'Тёмная', icon: Moon },
  { value: 'system', label: 'Системная', icon: Monitor },
];

export const ProfilePage = () => {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const logout = useAuthStore((s) => s.logout);
  const { mode, setMode } = useThemeStore();
  const qc = useQueryClient();
  const { isInstallable, promptInstall } = useInstallPrompt();
  const push = usePushNotifications();

  const [editOpen, setEditOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);

  const [form, setForm] = useState({ name: '', username: '' });
  const [pwd, setPwd] = useState({ current: '', next: '', confirm: '' });

  const profileMutation = useMutation({
    mutationFn: updateProfileRequest,
    onSuccess: (updated) => { setUser(updated); toast.success('Профиль обновлён'); },
    onError: (e) => toast.error(e.response?.data?.message || 'Не удалось сохранить'),
  });

  const passwordMutation = useMutation({
    mutationFn: changePasswordRequest,
    onSuccess: () => {
      setPasswordOpen(false);
      setPwd({ current: '', next: '', confirm: '' });
      toast.success('Пароль изменён. Другие устройства разлогинены.');
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Не удалось изменить пароль'),
  });

  const openEdit = () => {
    setForm({ name: user?.name || '', username: user?.username || '' });
    setEditOpen(true);
  };

  const submitProfile = () => {
    const patch = {};
    if (form.name.trim() && form.name !== user?.name) patch.name = form.name.trim();
    if (form.username.trim() && form.username !== user?.username) patch.username = form.username.trim();
    if (!Object.keys(patch).length) return setEditOpen(false);
    profileMutation.mutate(patch, { onSuccess: () => setEditOpen(false) });
  };

  const pickAvatar = (iconName) => {
    profileMutation.mutate(
      { avatarUrl: iconName ? `lucide:${iconName}` : null },
      { onSuccess: () => setAvatarOpen(false) }
    );
  };

  const submitPassword = () => {
    if (pwd.next.length < 8) return toast.error('Новый пароль — минимум 8 символов');
    if (pwd.next !== pwd.confirm) return toast.error('Пароли не совпадают');
    passwordMutation.mutate({ currentPassword: pwd.current, newPassword: pwd.next });
  };

  const handleLogout = async () => {
    try {
      await logoutRequest();
    } catch {
      /* сессия всё равно очищается локально */
    } finally {
      qc.clear();
      logout();
      toast.info('Вы вышли. Камень подождёт до следующего раза.');
    }
  };

  const currentIcon = user?.avatar_url?.startsWith('lucide:') ? user.avatar_url.slice(7) : null;

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <h1 className="font-display text-2xl font-bold text-text">Профиль</h1>

      <div className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-5">
        <button onClick={() => setAvatarOpen(true)} className="relative shrink-0" aria-label="Сменить аватар">
          <Avatar name={user?.name} src={user?.avatar_url} size="xl" />
          <span className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-surface bg-accent text-white">
            <Pencil size={13} />
          </span>
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-lg font-semibold text-text">{user?.name}</p>
          <p className="truncate text-sm text-text-muted">@{user?.username}</p>
          <p className="truncate text-xs text-text-muted">{user?.email}</p>
        </div>
      </div>

      <div className="space-y-2">
        <p className="px-1 text-sm font-medium text-text-muted">Аккаунт</p>
        <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface">
          <button onClick={openEdit} className="flex w-full items-center justify-between p-4 transition-colors hover:bg-surface-2">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface-2 text-text">
                <UserCircle size={18} />
              </div>
              <span className="text-sm font-medium text-text">Имя и юзернейм</span>
            </div>
            <Pencil size={16} className="text-text-muted" />
          </button>

          <button onClick={() => setPasswordOpen(true)} className="flex w-full items-center justify-between p-4 transition-colors hover:bg-surface-2">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface-2 text-text">
                <KeyRound size={18} />
              </div>
              <span className="text-sm font-medium text-text">Сменить пароль</span>
            </div>
            <Pencil size={16} className="text-text-muted" />
          </button>
        </div>
      </div>

      <BodyMetricsCard />

      <div className="space-y-2">
        <p className="px-1 text-sm font-medium text-text-muted">Оформление</p>
        <div className="rounded-2xl border border-border bg-surface p-4">
          <p className="mb-3 text-sm font-medium text-text">Тема</p>
          <div className="grid grid-cols-3 gap-2">
            {THEME_MODES.map((m) => {
              const Icon = m.icon;
              const active = mode === m.value;
              return (
                <button
                  key={m.value}
                  onClick={() => setMode(m.value)}
                  className={clsx(
                    'flex flex-col items-center gap-1.5 rounded-xl border p-3 text-xs font-medium transition-colors',
                    active ? 'border-accent bg-accent/10 text-accent' : 'border-border text-text-muted hover:bg-surface-2'
                  )}
                >
                  <Icon size={20} />
                  {m.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {push.isSupported && (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface">
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
        </div>
      )}

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

      <Sheet isOpen={avatarOpen} onClose={() => setAvatarOpen(false)} title="Аватар">
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-3">
            {avatarIconNames.map((iconName) => {
              const Icon = avatarIcons[iconName];
              const active = currentIcon === iconName;
              return (
                <button
                  key={iconName}
                  onClick={() => pickAvatar(iconName)}
                  disabled={profileMutation.isPending}
                  className={clsx(
                    'relative flex aspect-square items-center justify-center rounded-2xl border transition-colors',
                    active ? 'border-accent bg-accent/10 text-accent' : 'border-border text-text-muted hover:bg-surface-2'
                  )}
                >
                  <Icon size={26} />
                  {active && (
                    <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-white">
                      <Check size={11} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <Button variant="ghost" className="w-full" onClick={() => pickAvatar(null)}>
            Убрать аватар
          </Button>
        </div>
      </Sheet>

      <Sheet isOpen={editOpen} onClose={() => setEditOpen(false)} title="Имя и юзернейм">
        <div className="space-y-4">
          <Input
            label="Имя"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Как вас зовут?"
          />
          <Input
            label="Юзернейм"
            value={form.username}
            onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
            placeholder="например, ironsisyphus"
          />
          <p className="text-xs text-text-muted">
            3–20 символов: латиница, цифры и подчёркивание. По юзернейму вас найдут друзья.
          </p>
          <div className="flex gap-2">
            <Button variant="ghost" className="flex-1" onClick={() => setEditOpen(false)}>Отмена</Button>
            <Button className="flex-1" onClick={submitProfile} isLoading={profileMutation.isPending}>Сохранить</Button>
          </div>
        </div>
      </Sheet>

      <Sheet isOpen={passwordOpen} onClose={() => setPasswordOpen(false)} title="Сменить пароль">
        <div className="space-y-4">
          <PasswordInput
            label="Текущий пароль"
            autoComplete="current-password"
            value={pwd.current}
            onChange={(e) => setPwd((p) => ({ ...p, current: e.target.value }))}
          />
          <PasswordInput
            label="Новый пароль"
            placeholder="Минимум 8 символов"
            autoComplete="new-password"
            value={pwd.next}
            onChange={(e) => setPwd((p) => ({ ...p, next: e.target.value }))}
          />
          <PasswordInput
            label="Повторите новый пароль"
            autoComplete="new-password"
            value={pwd.confirm}
            onChange={(e) => setPwd((p) => ({ ...p, confirm: e.target.value }))}
          />
          <div className="flex gap-2">
            <Button variant="ghost" className="flex-1" onClick={() => setPasswordOpen(false)}>Отмена</Button>
            <Button className="flex-1" onClick={submitPassword} isLoading={passwordMutation.isPending}>Сменить</Button>
          </div>
        </div>
      </Sheet>
    </div>
  );
};