import { api } from '../lib/axios.js';
import { queueAdd, queueGetAll, queueDelete, queueUpdate } from './db.js';
import { toast } from '../ui/toast/toast.store.js';

const MAX_ATTEMPTS = 5;


const isPermanent = (status) =>
  status === 400 || status === 403 || status === 404 || status === 409 || status === 422;

export const enqueueMutation = async ({ method, url, data }) => {
  await queueAdd({ method, url, data });
};

let isReplaying = false;

export const replayQueue = async (onSuccess) => {
  if (isReplaying) return;
  isReplaying = true;

  let replayed = 0;
  let dropped = 0;

  try {
    const items = await queueGetAll();
    if (items.length === 0) return;

    for (const item of items) {
      try {
        await api.request({ method: item.method, url: item.url, data: item.data });
        await queueDelete(item.id);
        replayed++;
        continue;
      } catch (e) {
        const status = e.response?.status;

        if (!status) break;

        if (isPermanent(status)) {
          await queueDelete(item.id);
          dropped++;
          continue;
        }

        const attempts = (item.attempts ?? 0) + 1;
        if (attempts >= MAX_ATTEMPTS) {
          await queueDelete(item.id);
          dropped++;
          continue;
        }
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
