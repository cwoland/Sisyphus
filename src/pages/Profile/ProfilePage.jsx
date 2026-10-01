import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  LogOut, Moon, Sun, Monitor, Sparkles, Download, Bell,
  Pencil, KeyRound, Check, UserCircle, ChevronRight, Palette,
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
import { Button } from '../../shared/ui/Button.jsx';
import { Input } from '../../shared/ui/Input.jsx';
import { PasswordInput } from '../../shared/ui/PasswordInput.jsx';
import { Sheet } from '../../shared/ui/Sheet.jsx';
import { Switch } from '../../shared/ui/Switch.jsx';
import { BodyMetricsCard } from '../../features/body/BodyMetricsCard.jsx';
import { ProfileHero } from './widgets/ProfileHero.jsx';
import { SettingsRow } from './widgets/SettingsRow.jsx';
import { toast } from '../../shared/ui/toast/toast.store.js';

const THEME_MODES = [
  { value: 'light', label: 'Светлая', icon: Sun },
  { value: 'dark', label: 'Тёмная', icon: Moon },
  { value: 'system', label: 'Системная', icon: Monitor },
];

const Group = ({ title, children }) => (
  <section className="space-y-2">
    <h2 className="px-1 font-display text-xs font-semibold uppercase tracking-[0.14em] text-text-muted">
      {title}
    </h2>
    {children}
  </section>
);

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
    await logoutRequest().catch(() => null);
    qc.clear();
    logout();
    toast.info('Вы вышли. Камень подождёт до следующего раза.');
  };

  const currentIcon = user?.avatar_url?.startsWith('lucide:') ? user.avatar_url.slice(7) : null;

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <ProfileHero user={user} onEditAvatar={() => setAvatarOpen(true)} />

      <Group title="Аккаунт">
        <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface">
          <SettingsRow
            icon={UserCircle}
            label="Имя и юзернейм"
            hint={user?.username ? `@${user.username}` : undefined}
            onClick={openEdit}
            action={<ChevronRight size={16} className="shrink-0 text-text-muted" />}
          />
          <SettingsRow
            icon={KeyRound}
            label="Сменить пароль"
            onClick={() => setPasswordOpen(true)}
            action={<ChevronRight size={16} className="shrink-0 text-text-muted" />}
          />
        </div>
      </Group>

      <Group title="Тело">
        <BodyMetricsCard />
      </Group>

      <Group title="Настройки">
        <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface">
          <div className="p-4">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface-2 text-text">
                <Palette size={18} />
              </div>
              <p className="text-sm font-medium text-text">Тема</p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {THEME_MODES.map((m) => {
                const Icon = m.icon;
                const active = mode === m.value;
                return (
                  <button
                    key={m.value}
                    onClick={() => setMode(m.value)}
                    aria-pressed={active}
                    className={clsx(
                      'flex min-h-[64px] flex-col items-center justify-center gap-1.5 rounded-xl border text-xs font-medium transition-colors',
                      active
                        ? 'border-accent bg-accent/10 text-accent'
                        : 'border-border text-text-muted hover:bg-surface-2'
                    )}
                  >
                    <Icon size={20} />
                    {m.label}
                  </button>
                );
              })}
            </div>
          </div>

          {push.isSupported && (
            <SettingsRow
              as="div"
              icon={Bell}
              label="Напоминания"
              hint="Утром в день тренировки"
              action={
                <Switch
                  checked={push.isSubscribed}
                  disabled={push.isLoading}
                  onChange={(next) => (next ? push.subscribe() : push.unsubscribe())}
                  label="Push-уведомления"
                />
              }
            />
          )}

          {isInstallable && (
            <SettingsRow
              icon={Download}
              label="Установить приложение"
              hint="Ярлык на экране и работа офлайн"
              onClick={promptInstall}
              action={<ChevronRight size={16} className="shrink-0 text-text-muted" />}
            />
          )}
        </div>
      </Group>

      <Button variant="ghost" className="w-full text-danger hover:bg-danger/10" onClick={handleLogout}>
        <LogOut size={18} /> Выйти
      </Button>

      <p className="flex items-center justify-center gap-1.5 pb-2 text-center text-xs text-text-muted">
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
                  aria-pressed={active}
                  className={clsx(
                    'relative flex aspect-square items-center justify-center rounded-2xl border transition-colors',
                    active
                      ? 'border-accent bg-accent/10 text-accent'
                      : 'border-border text-text-muted hover:bg-surface-2'
                  )}
                >
                  <Icon size={26} />
                  {active && (
                    <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-on-accent">
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
            id="profile-name"
            label="Имя"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Как вас зовут?"
          />
          <Input
            id="profile-username"
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
            id="pwd-current"
            label="Текущий пароль"
            autoComplete="current-password"
            value={pwd.current}
            onChange={(e) => setPwd((p) => ({ ...p, current: e.target.value }))}
          />
          <PasswordInput
            id="pwd-next"
            label="Новый пароль"
            placeholder="Минимум 8 символов"
            autoComplete="new-password"
            value={pwd.next}
            onChange={(e) => setPwd((p) => ({ ...p, next: e.target.value }))}
          />
          <PasswordInput
            id="pwd-confirm"
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