import { chromium, devices, expect } from '@playwright/test';
import assert from 'node:assert/strict';

const base = process.env.BASE_URL || 'http://127.0.0.1:5180';
const userId = '11111111-1111-4111-8111-111111111111';
const workoutId = '22222222-2222-4222-8222-222222222222';
const programId = '55555555-5555-4555-8555-555555555555';
const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Los_Angeles' }).format(new Date());
const token = `header.${Buffer.from(JSON.stringify({ sub: userId })).toString('base64url')}.signature`;
const browser = await chromium.launch({ channel: 'chromium', headless: true });
const context = await browser.newContext({ ...devices['iPhone 12'], timezoneId: 'America/Los_Angeles', locale: 'ru-RU' });
const page = await context.newPage();
page.setDefaultTimeout(15000);
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (msg) => { if(msg.type() === 'error') console.log('browser console:', msg.text()); });
const user = { id: userId, name: 'Александр', username: 'test', settings: { timeZone: 'America/Los_Angeles' } };
const sets = Array.from({ length: 2 }, (_, round) => ['Подъёмы ног', 'Скручивания'].map((name, slot) => ({
  id: `${round}${slot}000000-0000-4000-8000-000000000000`, exercise_id: slot ? 'b' : 'a', exercise_name: name,
  group_index: 0, round_index: round, order_index: round * 2 + slot, tracking: 'reps',
  set_kind: 'normal', is_completed: false, reps: 10, weight: null,
}))).flat();
const workout = { id: workoutId, title: 'Тест офлайн-тренировки', date: today, status: 'in_progress', started_at: new Date(Date.now() - 65_000).toISOString(), sets };
const program = { id: programId, owner_id: userId, title: 'Сила Спарты', kind: 'strength', days_count: 1, exercises_count: 2, days: [{ id: 'day', title: 'День 1', exercises: [
  { exercise_id: 'a', exercise_name: 'Жим лёжа', tracking: 'weight_reps', group_index: 0, target_sets: 3, target_reps: '8-12' },
  { exercise_id: 'b', exercise_name: 'Бабочка', tracking: 'weight_reps', group_index: 1, target_sets: 1, target_reps: '10', set_plan: { mode: 'drop', restSec: 120, steps: [{ weight: 30, reps: 10 }, { weight: 20, reps: 12 }] } },
] }] };
const writes = [];
await context.route('https://fonts.googleapis.com/**', (route) => route.abort());
await context.route('**/api/**', async (route) => {
  const req = route.request(), path = new URL(req.url()).pathname.replace(/^\/api/, '');
  let body = {};
  if (path === '/auth/refresh') body = { accessToken: token };
  else if (path === '/auth/me' || path === '/users/me') body = { user };
  else if (path === `/workouts/${workoutId}/sets` && req.method() === 'PUT') {
    const data = req.postDataJSON(); writes.push(data);
    let set = sets.find((s) => s.id === data.setId);
    if (!set) {
      const parent = sets.find((s) => s.id === data.parentSetId);
      set = { ...parent, id: data.clientId, set_kind: 'drop', parent_set_id: parent.id };
      sets.push(set);
    }
    Object.assign(set, { is_completed: data.isCompleted, reps: data.reps, weight: data.weight });
    body = { set, record: null };
  } else if (path === `/workouts/${workoutId}/status`) {
    workout.status = req.postDataJSON().status; body = { workout };
  } else if (path === `/workouts/${workoutId}`) body = { workout };
  else if (path === '/workouts/active') body = { workout: workout.status === 'in_progress' ? workout : null };
  else if (path === '/workouts') body = { workouts: [workout] };
  else if (path === '/programs') body = { programs: [program] };
  else if (path === `/programs/${programId}`) body = { program };
  else if (path === '/programs/public') body = { programs: [] };
  else if (path === '/records') body = { records: [] };
  else if (path === '/stats/visits') body = { today, todayCounted: true, current: 4, longest: 6, days: [{ date: today, visited: true }] };
  else if (path === '/stats/streak') body = { current: 2, longest: 3, weeks: [], thisMonth: 4, lastMonth: 0 };
  else if (path === '/stats/volume') body = { totals: { tonnage: 1000, sets: 12, sessions: 3 }, previous: {}, series: [], byMuscle: [] };
  else if (path === '/nutrition/summary') body = { summary: { consumed: { total_calories: 1200 }, target: { calories: 2200 } } };
  await route.fulfill({ json: body });
});
const queue = () => page.evaluate(() => new Promise((resolve, reject) => {
  const req = indexedDB.open('sisyphus-offline', 1);
  req.onsuccess = () => { const db = req.result; const get = db.transaction('mutation-queue').objectStore('mutation-queue').getAll(); get.onsuccess = () => { db.close(); resolve(get.result); }; };
  req.onerror = () => reject(req.error);
}));
try {
  await page.goto(`${base}/workout/${workoutId}/active`);
  await expect(page.getByRole('button', { name: 'Подъёмы ног: готово', exact: true })).toBeEnabled();
  await page.evaluate(() => Promise.race([navigator.serviceWorker.ready, new Promise((_, reject) => setTimeout(() => reject(new Error('Service worker activation timed out')), 15000))]));
  await expect(page.getByRole('status', { name: 'Серия продлена' })).toBeVisible();
  await page.screenshot({ path: '/tmp/sisyphus-streak-sprint2.png' });
  await page.getByRole('button', { name: 'Закрыть поздравление' }).click();
  await page.reload();
  await page.waitForFunction(() => !!navigator.serviceWorker.controller);
  await expect(page.getByRole('button', { name: 'Подъёмы ног: готово', exact: true })).toBeEnabled();
  console.log('PWA controlled; first daily visit celebrated');

  await context.setOffline(true);
  const initialTimer = await page.getByLabel('Время тренировки').textContent();
  await page.waitForTimeout(1600);
  assert.notEqual(await page.getByLabel('Время тренировки').textContent(), initialTimer);
  await page.getByRole('button', { name: 'Подъёмы ног: готово', exact: true }).dblclick({ delay: 10 });
  await expect(page.getByRole('button', { name: 'Скручивания: готово', exact: true })).toBeEnabled();
  assert.equal((await queue()).length, 1);
  await expect(page.getByText('Отдых', { exact: true })).toHaveCount(0);
  await page.reload();
  await expect(page.getByRole('button', { name: 'Скручивания: готово', exact: true })).toBeEnabled();
  assert.notEqual((await page.getByLabel('Время тренировки').textContent()).trim(), '0:00');
  await page.getByRole('button', { name: 'Скручивания: готово', exact: true }).click();
  await expect(page.getByText('Отдых', { exact: true })).toBeVisible();
  await expect.poll(async () => (await queue()).length).toBe(2);
  const cached = await page.evaluate((id) => JSON.parse(localStorage.getItem(`sisyphus-workouts:v1:${id}`)), userId);
  assert.equal(cached.find((e) => e.key[0] === 'workout').data.sets.filter((s) => s.is_completed).length, 2);
  console.log('Offline: timer, double tap, alternating superset, round rest, durable queue and PWA reload passed');

  await context.setOffline(false);
  await expect.poll(async () => (await queue()).length).toBe(0);
  assert.equal(writes.length, 2);
  assert.deepEqual(writes.map((w) => w.setId), sets.slice(0, 2).map((s) => s.id));
  await page.reload();
  await expect(page.getByRole('button', { name: 'Подъёмы ног: готово', exact: true })).toBeEnabled();
  await expect(page.getByRole('status', { name: 'Серия продлена' })).toHaveCount(0);
  console.log('Reconnect: writes replay once in order; daily celebration does not repeat');

  await context.setOffline(true);
  await page.getByRole('button', { name: 'Дроп к прошлому подходу', exact: true }).click();
  for (let i = 1; i <= 2; i++) {
    await page.getByRole('button', { name: 'Ступень выполнена', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Ступень выполнена', exact: true })).toBeEnabled();
    await expect.poll(async () => (await queue()).length).toBe(i);
    await expect(page.getByText('Отдых', { exact: true })).toHaveCount(0);
  }
  await page.getByRole('button', { name: 'Закончить дропсет', exact: true }).click();
  await page.getByRole('button', { name: 'Подъёмы ног: готово', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Скручивания: готово', exact: true })).toBeEnabled();
  await page.getByRole('button', { name: 'Скручивания: готово', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Завершить', exact: true })).toBeEnabled();
  await page.getByRole('button', { name: 'Завершить', exact: true }).click();
  await expect(page).toHaveURL(`${base}/`);
  await expect.poll(async () => (await queue()).length).toBe(5);
  await context.setOffline(false);
  await expect.poll(async () => (await queue()).length).toBe(0);
  assert.equal(writes.length, 6);
  assert.equal(new Set(writes.filter((w) => w.clientId).map((w) => w.clientId)).size, 2);
  assert.equal(workout.status, 'completed');
  console.log('Offline drops and completion: two independent steps, no inter-step rest, all data replayed once');


  await page.goto(`${base}/programs`);
  await page.getByRole('button', { name: /Сила Спарты/ }).click();
  await page.getByRole('button', { name: /Изменить/ }).click();
  await expect(page.getByRole('button', { name: 'Убрать Жим лёжа', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Убрать Бабочка', exact: true })).toBeVisible();
  await expect(page.getByText('Обычное упражнение', { exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Отмена', exact: true }).click();
  console.log('Program editor: existing exercise names and drop plan visible');

  for (const theme of ['light', 'dark']) {
    await page.emulateMedia({ colorScheme: theme });
    for (const [route, art] of [['programs', 'spartan-discipline'], ['records', 'athena-wisdom'], ['stats', 'temple-foundation']]) {
      await page.goto(`${base}/${route}`);
      const image = page.locator(`img[src="/art/ui/${art}.webp"]`);
      await expect(image).toBeVisible();
      await expect.poll(() => image.evaluate((img) => img.naturalWidth)).toBeGreaterThan(0);
      for (const width of [320, 390, 1440]) {
        await page.setViewportSize({ width, height: 844 });
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${route} overflows ${width}`);
      }
      await page.setViewportSize({ width: 390, height: 844 });
      await page.evaluate(() => scrollTo(0, 0));
      await page.screenshot({ path: `/tmp/sisyphus-${route}-${theme}-sprint2.png` });
    }
  }
  assert.deepEqual(errors, []);
  console.log('New artwork: light/dark, 320/390/1440px, no runtime errors passed');
} finally { await browser.close(); }
