import { chromium, webkit, devices, expect } from '@playwright/test';
import assert from 'node:assert/strict';
const userId = '11111111-1111-4111-8111-111111111111';
const workoutId = '22222222-2222-4222-8222-222222222222';
const exerciseA = '33333333-3333-4333-8333-333333333333';
const exerciseB = '44444444-4444-4444-8444-444444444444';
for (const [engine, browserType] of [['chromium', chromium], ['webkit', webkit]]) {
 if (process.env.ENGINE && process.env.ENGINE !== engine) continue;
 const watchdog = setTimeout(() => { console.error(`${engine}: browser test timed out`); process.exit(1); }, 90_000);
 console.log(`${engine}: launching`);
 const browser = await browserType.launch({ timeout: 30_000, headless: true, channel: engine === 'chromium' ? 'chromium' : undefined });
 console.log(`${engine}: creating context`);
 const context = await browser.newContext({ ...devices['iPhone 12'], defaultBrowserType: undefined,
   timezoneId: 'America/Los_Angeles', locale: 'ru-RU', serviceWorkers: 'block' });
 console.log(`${engine}: opening page`);
 const page = await context.newPage();
 page.setDefaultTimeout(20_000);
 page.setDefaultNavigationTimeout(20_000);
 await page.route('https://fonts.googleapis.com/**', (route) => route.abort());
 console.log(`${engine}: started`);
 await page.clock.setFixedTime(new Date('2026-11-01T12:00:00-08:00'));
 const errors = [];
 page.on('pageerror', (error) => errors.push(error.message));
 const user = { id: userId, name: 'Тест', username: 'test', settings: { timeZone: 'America/Los_Angeles' } };
 const workout = { id: workoutId, user_id: userId, date: '2026-11-01', title: 'Тренировка с очень длинным названием без потери доступности кнопок', status: 'planned' };
 const sets = [];
 for (let round = 0; round < 2; round++) for (const [slot, ex] of [[0, exerciseA], [1, exerciseB]]) {
  sets.push({ id: `${round}${slot}000000-0000-4000-8000-000000000000`, workout_id: workoutId,
    exercise_id: ex, exercise_name: slot ? 'Скручивания' : 'Подъёмы ног', tracking: 'reps',
    group_index: 0, round_index: round, order_index: round * 100 + slot,
    set_kind: 'normal', parent_set_id: null, is_completed: false, reps: 10, weight: null });
 }
 let failChat = false;
 await page.route('**/api/**', async (route) => {
  const request = route.request();
  const path = new URL(request.url()).pathname.replace(/^\/api/, '');
  const method = request.method();
  let status = 200, body = {};
  if (method === 'OPTIONS') return route.fulfill({ status: 204, headers: {
    'access-control-allow-origin': 'http://127.0.0.1:5173', 'access-control-allow-credentials': 'true',
    'access-control-allow-headers': 'authorization,content-type' } });
  if (path === '/auth/refresh') body = { accessToken: 'test-token' };
  else if (path === '/auth/me') body = { user };
  else if (path === '/users/me') body = { user };
  else if (path === '/workouts/active') body = { workout: workout.status === 'in_progress' ? workout : null };
  else if (path === '/workouts') body = { workouts: [workout] };
  else if (path === `/workouts/${workoutId}/start`) { workout.status = 'in_progress'; workout.started_at = new Date().toISOString(); body = { workout: { ...workout, sets } }; }
  else if (path === `/workouts/${workoutId}/sets` && method === 'PUT') {
    const data = request.postDataJSON();
    let set = sets.find((s) => s.id === data.setId);
    if (!set) {
      const parent = sets.find((s) => s.id === data.parentSetId);
      set = { ...parent, id: data.clientId, set_kind: 'drop', parent_set_id: parent.id };
      sets.push(set);
    }
    for (const [from, to] of [['weight','weight'],['reps','reps'],['isCompleted','is_completed'],['durationSec','duration_sec']]) {
      if (data[from] !== undefined) set[to] = data[from];
    }
    body = { set, record: null };
  }
  else if (path === `/workouts/${workoutId}`) body = { workout: { ...workout, sets } };
  else if (path === '/records') body = { records: [] };
  else if (path.startsWith('/stats')) body = { current: 0, longest: 0, days: [], todayCounted: true };
  else if (path === '/exercises') body = { exercises: [] };
  else if (path === '/programs') body = { programs: [] };
  else if (path === '/chats') body = { chats: [{ chat_id: 'chat-1', friend_id: 'friend', friend_name: 'Друг', unread_count: 0 }] };
  else if (path === '/chats/chat-1/messages' && method === 'POST') { status = failChat ? 503 : 200; body = { message: 'Ошибка отправки' }; }
  else if (path === '/chats/chat-1/messages') body = { messages: [] };
  return route.fulfill({ status, contentType: 'application/json', headers: {
    'access-control-allow-origin': 'http://127.0.0.1:5173', 'access-control-allow-credentials': 'true' }, body: JSON.stringify(body) });
 });
 await page.goto('http://127.0.0.1:5173/calendar');
 console.log(`${engine}: calendar loaded`);
 await expect(page.getByRole('button', { name: 'Начать тренировку', exact: true })).toBeVisible();
 for (const width of [320, 375, 390, 430]) {
  await page.setViewportSize({ width, height: 844 });
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${engine}: page overflows ${width}`);
  for (const name of ['Начать тренировку', 'Открыть', 'Пропустить']) {
   const box = await page.getByRole('button', { name, exact: true }).boundingBox();
   assert.ok(box.x >= 0 && box.x + box.width <= width, `${engine}: ${name} outside ${width}`);
  }
 }
 await page.setViewportSize({ width: 390, height: 844 });
 await page.getByRole('button', { name: 'Открыть', exact: true }).click();
 await expect(page.getByRole('dialog')).toBeVisible();
 const date = page.locator('input[type=date]');
 await date.focus();
 assert.ok(await date.evaluate((el) => parseFloat(getComputedStyle(el).fontSize) >= 16));
 const box = await date.boundingBox();
 assert.ok(box.x + box.width <= 390);
 await page.getByRole('button', { name: 'Добавить упражнение', exact: true }).click();
 await expect(page.getByRole('dialog')).toHaveCount(2);
 await page.getByRole('button', { name: 'Закрыть', exact: true }).last().click();
 assert.equal(await page.evaluate(() => document.body.style.position), 'fixed');
 await page.getByRole('button', { name: 'Закрыть', exact: true }).click();
 assert.equal(await page.evaluate(() => document.body.style.position), '');
 await page.evaluate(() => scrollTo(0, document.body.scrollHeight));
 assert.ok(await page.evaluate(() => scrollY > 0));
 await page.screenshot({ path: `/tmp/sisyphus-calendar-${engine}.png`, fullPage: true, timeout: 20_000 });
 console.log(`${engine}: calendar verified`);
 await page.getByRole('button', { name: 'Начать тренировку', exact: true }).click();
 await expect(page.getByRole('button', { name: 'Подъёмы ног: готово', exact: true })).toBeVisible();
 await page.getByRole('button', { name: 'Подъёмы ног: готово', exact: true }).click();
 await expect(page.getByRole('button', { name: 'Скручивания: готово', exact: true })).toBeEnabled();
 await expect(page.getByText('Отдых', { exact: true })).toHaveCount(0);
 await page.getByRole('button', { name: 'Дроп к прошлому подходу', exact: true }).click();
 await page.getByRole('button', { name: 'Ступень выполнена', exact: true }).click();
 await expect(page.getByRole('button', { name: 'Ступень выполнена', exact: true })).toBeEnabled();
 await expect(page.getByText('Отдых', { exact: true })).toHaveCount(0);
 await page.getByRole('button', { name: 'Закончить дропсет', exact: true }).click();
 await expect(page.getByText('Отдых', { exact: true })).toHaveCount(0);
 await page.getByRole('button', { name: 'Скручивания: готово', exact: true }).click();
 await expect(page.getByText('Отдых', { exact: true })).toBeVisible();
 await page.screenshot({ path: `/tmp/sisyphus-workout-${engine}.png`, fullPage: true, timeout: 20_000 });
 console.log(`${engine}: workout verified`);
 failChat = true;
 await page.goto('http://127.0.0.1:5173/chat?chat=chat-1');
 const text = page.getByRole('textbox', { name: 'Текст сообщения' });
 await text.fill('Сообщение, которое нельзя потерять');
 await page.getByRole('button', { name: 'Отправить', exact: true }).click();
 await expect(page.getByRole('button', { name: 'Отправить', exact: true })).toBeEnabled();
 await expect(text).toHaveValue('Сообщение, которое нельзя потерять');
 assert.deepEqual(errors, [], `${engine}: page errors`);
 console.log(`${engine}: mobile layout, modal scrolling, superset/drop rest and failed chat passed`);
 await browser.close();
 clearTimeout(watchdog);
}
