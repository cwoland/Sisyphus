import { useAuthStore } from '../../entities/user/auth.store.js';
import { api } from '../lib/axios.js';
import { queueAdd, queueGetAll, queueDelete, queueUpdate } from './db.js';
import { toast } from '../ui/toast/toast.store.js';




const isPermanent = (status) =>
  status === 400 || status === 403 || status === 404 || status === 409 || status === 422;

export const enqueueMutation = async ({ userId, method, url, data }) => {
  if (!userId) throw new Error('Offline action requires an owner');
  await queueAdd({ userId, method, url, data });
};

let isReplaying = false;

export const replayQueue = async (onSuccess) => {
  const userId = useAuthStore.getState().user?.id;
  if (isReplaying || !userId) return;
  isReplaying = true;

  let replayed = 0;
  let dropped = 0;

  try {
    const items = await queueGetAll();
    if (items.length === 0) return;

    for (const item of items) {
      // Legacy entries without an owner must never be attributed to a new account.
      if (item.userId !== userId) continue;
      if (useAuthStore.getState().user?.id !== userId) break;
      try {
        await api.request({ method: item.method, url: item.url, data: item.data,
          _offlineReplay: true, _ownerId: userId });
        await queueDelete(item.id);
        replayed++;
        continue;
      } catch (e) {
        const status = e.response?.status;

        if (!status || status === 401) break;

        if (isPermanent(status)) {
          await queueDelete(item.id);
          dropped++;
          continue;
        }

        const attempts = (item.attempts ?? 0) + 1;
        await queueUpdate(item.id, { attempts });
        break;
      }
    }
  } finally {
    isReplaying = false;
  }

  if (replayed > 0) {
    toast.success(`Синхронизировано офлайн-действий: ${replayed}`);
    onSuccess?.();
  }
  if (dropped > 0) {
    toast.error(
      dropped === 1
        ? 'Одно офлайн-действие не удалось синхронизировать — проверьте данные'
        : `Не удалось синхронизировать действий: ${dropped}`
    );
    onSuccess?.();
  }
};
