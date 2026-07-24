import { useState } from 'react';
import { Scale, Plus, Trash2, TrendingDown, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

import { useBodyMetrics, useBodyMutations } from './body.hooks.js';
import { Sheet } from '../../shared/ui/Sheet.jsx';
import { Button } from '../../shared/ui/Button.jsx';
import { todayApi } from '../../shared/lib/date.js';

const FIELDS = [
  { key: 'weight', label: 'Вес, кг', step: '0.1' },
  { key: 'biceps', label: 'Бицепс, см', step: '0.5' },
  { key: 'chest', label: 'Грудь, см', step: '0.5' },
  { key: 'waist', label: 'Талия, см', step: '0.5' },
  { key: 'hip', label: 'Бедро, см', step: '0.5' },
];

const empty = { date: todayApi(), weight: '', biceps: '', chest: '', waist: '', hip: '' };

export const BodyMetricsCard = () => {
  const metricsQuery = useBodyMetrics();
  const { save, remove } = useBodyMutations();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);

  const metrics = metricsQuery.data || [];
  const current = metrics[0];
  const prev = metrics[1];

  const delta = (key) => {
    if (!current?.[key] || !prev?.[key]) return null;
    const d = Number(current[key]) - Number(prev[key]);
    return Math.abs(d) < 0.05 ? null : d;
  };

  const submit = () => {
    const payload = { date: form.date };
    let hasValue = false;
    for (const f of FIELDS) {
      if (form[f.key] !== '') { payload[f.key] = Number(form[f.key]); hasValue = true; }
    }
    if (!hasValue) return;
    save.mutate(payload, { onSuccess: () => { setOpen(false); setForm(empty); } });
  };

  return (
    <div className="space-y-2">
      <p className="px-1 text-sm font-medium text-text-muted">Тело</p>

      <div className="rounded-2xl border border-border bg-surface p-4">
        {!current ? (
          <div className="py-2 text-center">
            <Scale size={22} className="mx-auto mb-2 text-text-muted" />
            <p className="text-sm text-text-muted">Замеров пока нет</p>
          </div>
        ) : (
          <>
            <div className="mb-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
              {FIELDS.map((f) => {
                const value = current[f.key];
                const d = delta(f.key);
                return (
                  <div key={f.key} className="rounded-xl bg-surface-2 p-2 text-center">
                    <p className="font-display text-base font-bold text-text">
                      {value != null ? Number(value) : '—'}
                    </p>
                    <p className="text-[11px] text-text-muted">{f.label.split(',')[0]}</p>
                    {d != null && (
                      <p className={`flex items-center justify-center gap-0.5 text-[11px] ${d < 0 ? 'text-accent' : 'text-text-muted'}`}>
                        {d < 0 ? <TrendingDown size={10} /> : <TrendingUp size={10} />}
                        {Math.abs(d).toFixed(1)}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-text-muted">
              Последний замер: {format(new Date(current.date), 'd MMMM', { locale: ru })}
            </p>
          </>
        )}

        <Button variant="secondary" size="sm" className="mt-3 w-full" onClick={() => setOpen(true)}>
          <Plus size={16} /> Записать замеры
        </Button>
      </div>

      {metrics.length > 1 && (
        <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface">
          {metrics.slice(0, 6).map((m) => (
            <div key={m.id} className="flex items-center justify-between p-3">
              <span className="text-sm text-text">
                {format(new Date(m.date), 'd MMM yyyy', { locale: ru })}
              </span>
              <div className="flex items-center gap-3">
                <span className="text-sm text-text-muted">
                  {m.weight != null ? `${Number(m.weight)} кг` : '—'}
                </span>
                <button
                  onClick={() => remove.mutate(m.id)}
                  className="text-text-muted hover:text-crimson"
                  aria-label="Удалить"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Sheet isOpen={open} onClose={() => setOpen(false)} title="Замеры">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-text">Дата</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm text-text focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {FIELDS.map((f) => (
              <div key={f.key} className="space-y-1">
                <label className="block text-xs text-text-muted">{f.label}</label>
                <input
                  type="number" inputMode="decimal" step={f.step} min="0"
                  value={form[f.key]}
                  onChange={(e) => setForm((s) => ({ ...s, [f.key]: e.target.value }))}
                  placeholder="—"
                  className="w-full rounded-lg border border-border bg-surface px-2 py-2 text-center text-sm text-text focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>
            ))}
          </div>

          <p className="text-xs text-text-muted">
            Заполняйте только то, что меряли — пустые поля не затрут прошлые значения за эту дату.
          </p>

          <div className="flex gap-2">
            <Button variant="ghost" className="flex-1" onClick={() => setOpen(false)}>Отмена</Button>
            <Button className="flex-1" onClick={submit} isLoading={save.isPending}>Сохранить</Button>
          </div>
        </div>
      </Sheet>
    </div>
  );
};