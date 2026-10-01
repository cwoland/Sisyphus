import { useState } from 'react';
import { Scale, Plus, Trash2, TrendingDown, TrendingUp, History } from 'lucide-react';
import { ru } from 'date-fns/locale';

import { useBodyMetrics, useBodyMutations } from './body.hooks.js';
import { WeightSparkline } from './WeightSparkline.jsx';
import { Sheet } from '../../shared/ui/Sheet.jsx';
import { Button } from '../../shared/ui/Button.jsx';
import { todayApi, safeFormat } from '../../shared/lib/date.js';

const FIELDS = [
  { key: 'weight', label: 'Вес, кг', step: '0.1' },
  { key: 'biceps', label: 'Бицепс, см', step: '0.5' },
  { key: 'chest', label: 'Грудь, см', step: '0.5' },
  { key: 'waist', label: 'Талия, см', step: '0.5' },
  { key: 'hip', label: 'Бедро, см', step: '0.5' },
];

const emptyForm = () => ({ date: todayApi(), weight: '', biceps: '', chest: '', waist: '', hip: '' });

export const BodyMetricsCard = () => {
  const metricsQuery = useBodyMetrics();
  const { save, remove } = useBodyMutations();
  const [formOpen, setFormOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const metrics = metricsQuery.data || [];
  const current = metrics[0];
  const prev = metrics[1];

  const delta = (key) => {
    if (current?.[key] == null || prev?.[key] == null) return null;
    const d = Number(current[key]) - Number(prev[key]);
    return Math.abs(d) < 0.05 ? null : d;
  };

  // metrics приходят по убыванию даты — для графика нужен обратный порядок.
  const weightPoints = [...metrics]
    .reverse()
    .filter((m) => m.weight != null)
    .slice(-14)
    .map((m) => ({ date: m.date, value: Number(m.weight) }));

  const submit = () => {
    const payload = { date: form.date };
    let hasValue = false;
    for (const f of FIELDS) {
      if (form[f.key] !== '') { payload[f.key] = Number(form[f.key]); hasValue = true; }
    }
    if (!hasValue) return;
    save.mutate(payload, { onSuccess: () => { setFormOpen(false); setForm(emptyForm()); } });
  };

  return (
    <section aria-label="Замеры тела" className="rounded-2xl border border-border bg-surface p-4">
      {!current ? (
        <div className="py-3 text-center">
          <Scale size={22} className="mx-auto mb-2 text-text-muted" />
          <p className="text-sm text-text-muted">Замеров пока нет</p>
        </div>
      ) : (
        <>
          {weightPoints.length > 1 && (
            <div className="mb-4">
              <div className="mb-1 flex items-baseline justify-between">
                <span className="font-display text-xs uppercase tracking-[0.14em] text-text-muted">Вес</span>
                <span className="font-display text-lg font-bold tabular-nums text-text">
                  {weightPoints[weightPoints.length - 1].value}
                  <span className="text-xs font-normal text-text-muted"> кг</span>
                </span>
              </div>
              <WeightSparkline points={weightPoints} />
              <div className="mt-1 flex justify-between text-[11px] text-text-muted">
                <span>{safeFormat(weightPoints[0].date, 'd MMM', { locale: ru })}</span>
                <span>{safeFormat(weightPoints[weightPoints.length - 1].date, 'd MMM', { locale: ru })}</span>
              </div>
            </div>
          )}

          <dl className="grid grid-cols-3 gap-2 sm:grid-cols-5">
            {FIELDS.map((f) => {
              const value = current[f.key];
              const d = delta(f.key);
              return (
                <div key={f.key} className="rounded-xl bg-surface-2 p-2 text-center">
                  <dd className="font-display text-base font-bold tabular-nums text-text">
                    {value != null ? Number(value) : '—'}
                  </dd>
                  <dt className="text-[11px] text-text-muted">{f.label.split(',')[0]}</dt>
                  {d != null && (
                    <p className="flex items-center justify-center gap-0.5 text-[11px] tabular-nums text-text-muted">
                      {d < 0 ? <TrendingDown size={10} /> : <TrendingUp size={10} />}
                      {Math.abs(d).toFixed(1)}
                    </p>
                  )}
                </div>
              );
            })}
          </dl>

          <p className="mt-3 text-xs text-text-muted">
            Последний замер: {safeFormat(current.date, 'd MMMM', { locale: ru })}
          </p>
        </>
      )}

      <div className="mt-3 flex gap-2">
        <Button variant="secondary" size="sm" className="flex-1" onClick={() => setFormOpen(true)}>
          <Plus size={16} /> Записать замеры
        </Button>
        {metrics.length > 1 && (
          <Button variant="ghost" size="sm" onClick={() => setHistoryOpen(true)}>
            <History size={16} /> История
          </Button>
        )}
      </div>

      <Sheet isOpen={formOpen} onClose={() => setFormOpen(false)} title="Замеры">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="body-date" className="block text-sm font-medium text-text">Дата</label>
            <input
              id="body-date"
              type="date"
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              className="w-full rounded-xl border border-border-strong bg-surface-2 px-3 py-2.5 text-sm text-text transition-colors focus:border-accent focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {FIELDS.map((f) => (
              <div key={f.key} className="space-y-1">
                <label htmlFor={`body-${f.key}`} className="block text-xs text-text-muted">{f.label}</label>
                <input
                  id={`body-${f.key}`}
                  type="number" inputMode="decimal" step={f.step} min="0"
                  value={form[f.key]}
                  onChange={(e) => setForm((s) => ({ ...s, [f.key]: e.target.value }))}
                  placeholder="—"
                  className="w-full rounded-lg border border-border-strong bg-surface px-2 py-2 text-center text-sm text-text transition-colors focus:border-accent focus:outline-none"
                />
              </div>
            ))}
          </div>

          <p className="text-xs text-text-muted">
            Заполняйте только то, что меряли — пустые поля не затрут прошлые значения за эту дату.
          </p>

          <div className="flex gap-2">
            <Button variant="ghost" className="flex-1" onClick={() => setFormOpen(false)}>Отмена</Button>
            <Button className="flex-1" onClick={submit} isLoading={save.isPending}>Сохранить</Button>
          </div>
        </div>
      </Sheet>

      <Sheet isOpen={historyOpen} onClose={() => setHistoryOpen(false)} title="История замеров">
        <ul className="divide-y divide-border">
          {metrics.map((m) => (
            <li key={m.id} className="flex items-center justify-between py-3">
              <span className="text-sm text-text">
                {safeFormat(m.date, 'd MMMM yyyy', { locale: ru })}
              </span>
              <div className="flex items-center gap-3">
                <span className="text-sm tabular-nums text-text-muted">
                  {m.weight != null ? `${Number(m.weight)} кг` : '—'}
                </span>
                <button
                  onClick={() => remove.mutate(m.id)}
                  className="rounded-lg p-1.5 text-text-muted transition-colors hover:text-danger"
                  aria-label={`Удалить замер за ${safeFormat(m.date, 'd MMMM yyyy', { locale: ru })}`}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </Sheet>
    </section>
  );
};