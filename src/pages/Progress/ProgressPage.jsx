import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '../../entities/user/auth.store.js';
import { updateProfileRequest } from '../../entities/user/auth.api.js';
import { BodyMetricsCard } from '../../features/body/BodyMetricsCard.jsx';
import { BODY_FIELDS } from '../../features/body/bodyFields.js';
import { useBodyMetrics, useLatestBody } from '../../features/body/body.hooks.js';
import { useRecords } from '../Records/records.hooks.js';
import { safeFormat } from '../../shared/lib/date.js';
import { Button } from '../../shared/ui/Button.jsx';
import { ProgressPhotos } from './ProgressPhotos.jsx';

function Comparison({ metrics }) {
  const [first, setFirst] = useState('');
  const [second, setSecond] = useState('');
  if (metrics.length < 2) return null;

  const a = metrics.find((m) => m.date === first) ?? metrics[1];
  const b = metrics.find((m) => m.date === second) ?? metrics[0];
  const fields = BODY_FIELDS.filter((f) => a[f.key] != null && b[f.key] != null);

  return (
    <section className="epic-panel space-y-3 p-4">
      <h2 className="font-display text-xl font-bold">Сравнить замеры</h2>
      <div className="grid grid-cols-2 gap-2">
        {[[a, setFirst, 'От'], [b, setSecond, 'До']].map(([m, select, label]) => (
          <label key={label} className="text-xs">
            {label}
            <select
              className="block w-full rounded-lg bg-surface-2 p-2 text-base"
              value={m.date}
              onChange={(e) => select(e.target.value)}
            >
              {metrics.map((row) => (
                <option key={row.date} value={row.date}>
                  {safeFormat(row.date, 'dd.MM.yyyy')}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>

      {fields.map((f) => {
        const delta = Number((b[f.key] - a[f.key]).toFixed(1));
        return (
          <p key={f.key} className="text-sm">
            {f.label} · {Number(a[f.key])} → {Number(b[f.key])} {f.unit}
            {' ('}{delta > 0 ? '+' : ''}{delta}{' '}{f.unit}{')'}
          </p>
        );
      })}
      {!fields.length && <p className="text-sm">На эти даты записаны разные показатели.</p>}
    </section>
  );
}

function Bmi({ user }) {
  const latest = useLatestBody();
  const height = user.settings?.heightCm;
  const [input, setInput] = useState(height ?? '');

  const save = useMutation({
    mutationFn: () => updateProfileRequest({ heightCm: Number(input) }),
    onSuccess: (updated) => {
      if (useAuthStore.getState().user?.id === updated.id) {
        useAuthStore.getState().setUser(updated);
      }
    },
  });

  const weight = latest.data?.current?.weight;

  return (
    <section className="epic-panel space-y-2 p-4">
      <h2 className="font-display text-xl font-bold">Индекс массы тела</h2>
      {latest.isError ? (
        <button onClick={() => latest.refetch()}>Повторить загрузку веса</button>
      ) : latest.isLoading ? (
        <p>Загружаем вес…</p>
      ) : (
        <p>
          {height && weight
            ? (Number(weight) / (height / 100) ** 2).toFixed(1) + ' кг/м²'
            : 'Для расчёта нужны рост и запись веса.'}
        </p>
      )}

      <form
        className="flex flex-wrap items-end gap-3"
        onSubmit={(e) => { e.preventDefault(); save.mutate(); }}
      >
        <label className="text-sm">
          Рост, см
          <input
            className="block w-28 rounded-lg bg-surface-2 p-2 text-base"
            type="number"
            inputMode="decimal"
            required
            min="50"
            max="260"
            step="0.1"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </label>
        <Button
          type="submit"
          variant="secondary"
          disabled={!input || Number(input) === height || save.isPending}
        >
          Сохранить рост
        </Button>
      </form>
      {save.isError && <p role="alert">Не удалось сохранить рост.</p>}
    </section>
  );
}

export function ProgressPage() {
  const user = useAuthStore((s) => s.user);
  const metrics = useBodyMetrics();
  const records = useRecords();
  if (!user) return null;

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <header className="relative isolate flex min-h-40 items-end overflow-hidden rounded-2xl bg-[#33150b] p-5 sm:min-h-52 sm:p-7">
        <img src="/art/scenes/progress-ares.webp" alt="" width="1440" height="480" fetchPriority="high"
          className="absolute inset-0 -z-10 h-full w-full object-cover object-right" />
        <h1 className="max-w-[55%] font-display text-3xl font-bold leading-tight text-white drop-shadow-md sm:text-4xl">
          Храм прогресса
        </h1>
      </header>

      {metrics.isError ? (
        <Button onClick={() => metrics.refetch()}>Повторить загрузку замеров</Button>
      ) : metrics.isLoading ? (
        <p role="status">Загружаем замеры…</p>
      ) : (
        <BodyMetricsCard />
      )}

      <Comparison metrics={metrics.data ?? []} />
      <Bmi key={user.id} user={user} />
      <ProgressPhotos key={'photos-' + user.id} owner={user.id} />

      <section className="epic-panel space-y-2 p-4">
        <h2 className="font-display text-xl font-bold">Личные рекорды</h2>
        {records.isError ? (
          <button onClick={() => records.refetch()}>Повторить загрузку рекордов</button>
        ) : records.isLoading ? (
          <p>Загружаем результаты…</p>
        ) : !records.data?.length ? (
          <p>Рекордов пока нет.</p>
        ) : records.data.slice(0, 3).map((r) => (
          <Link
            key={r.exercise_id}
            to={'/records?ex=' + r.exercise_id}
            className="block rounded-xl bg-surface-2 p-3"
          >
            <strong>{r.exercise_name}</strong> · {Number(r.weight)} кг × {r.reps}
            <span className="block text-xs text-text-muted">
              Расчётный максимум · {Number(r.one_rm).toFixed(1)} кг
            </span>
          </Link>
        ))}
        <Link to="/records" className="inline-block py-2 text-sm text-accent">
          Все результаты →
        </Link>
      </section>
    </div>
  );
}
