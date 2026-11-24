import { useRef, useState } from 'react';
import { ru } from 'date-fns/locale';
import { useQueryClient } from '@tanstack/react-query';
import { Sheet } from '../../../shared/ui/Sheet.jsx';
import { Button } from '../../../shared/ui/Button.jsx';
import { safeFormat, todayApi } from '../../../shared/lib/date.js';
import { isQueuedError } from '../../../shared/offline/isQueued.js';
import { useAuthStore } from '../../../entities/user/auth.store.js';

export function QuickWorkoutSheet({ create, onClose, onCreated }) {
  const [title, setTitle] = useState('Быстрая тренировка');
  const [clientId] = useState(() => crypto.randomUUID());
  const [date] = useState(todayApi);
  const busy = useRef(false);
  const qc = useQueryClient();

  async function submit(event) {
    event.preventDefault();
    if (busy.current || !title.trim()) return;
    busy.current = true;
    const owner = useAuthStore.getState().user?.id;
    const payload = { title: title.trim(), date, clientId };
    try {
      let workout;
      try {
        workout = await create.mutateAsync(payload);
      } catch (error) {
        if (!isQueuedError(error) || useAuthStore.getState().user?.id !== owner) return;
        workout = { id: clientId, user_id: owner, title: payload.title, date, status: 'planned', sets: [] };
        qc.setQueryData(['workout', clientId], workout);
        qc.setQueriesData({ predicate: ({ queryKey: [root, view, from, to] }) =>
          root === 'workouts' && ['month', 'week'].includes(view) && from <= date && date <= to
        }, (rows) => rows && !rows.some((w) => w.id === clientId) ? [...rows, workout] : rows);
      }
      if (useAuthStore.getState().user?.id === owner) onCreated(workout);
    } finally {
      busy.current = false;
    }
  }

  return (
    <Sheet isOpen onClose={() => { if (!busy.current) onClose(); }} title="Быстрая тренировка">
      <form onSubmit={submit} className="space-y-4">
        <p className="text-sm text-text-muted">Сегодня, {safeFormat(date, 'd MMMM', { locale: ru })}</p>
        <label className="block text-sm font-medium">Название
          <input required maxLength={150} value={title} onChange={(e) => setTitle(e.target.value)}
            className="mt-2 block w-full rounded-xl border border-border bg-surface px-3 py-3 text-base" />
        </label>
        <Button type="submit" className="w-full" disabled={!title.trim()} isLoading={create.isPending}>
          Создать и выбрать упражнения
        </Button>
      </form>
    </Sheet>
  );
}
