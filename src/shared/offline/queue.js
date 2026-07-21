import { api } from '../lib/axios.js';
import { queueAdd, queueGetAll, queueDelete } from './db.js';
import { toast } from '../ui/toast/toast.store.js';

export const enqueueMutation = async ({ method, url, data }) => {
  await queueAdd({ method, url, data });
};

let isReplaying = false;

export const replayQueue = async (onSuccess) => {
  if (isReplaying) return;
  isReplaying = true;

  try {
    const items = await queueGetAll();
    if (items.length === 0) return;

    let replayed = 0;
    for (const item of items) {
      try {
        await api.request({ method: item.method, url: item.url, data: item.data });
        await queueDelete(item.id);
        replayed++;
      } catch (e) {

        if (e.response) {
          await queueDelete(item.id);
        } else {
          break;
        }
      }
    }

    if (replayed > 0) {
      toast.success(`Синхронизировано офлайн-действий: ${replayed}`);
      onSuccess?.();
    }
  } finally {
    isReplaying = false;
  }
};