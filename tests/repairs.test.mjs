import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { buildWorkoutGroups } from '../src/features/active-workout/workoutFlow.js';
import { apiCacheName } from '../src/shared/offline/cacheScope.js';
import { safeDate, safeFormat, toApiDate } from '../src/shared/lib/date.js';

const base = (id, exercise, round, order, done = false) => ({ id, exercise_id: exercise,
  exercise_name: exercise, group_index: 0, round_index: round, order_index: order,
  is_completed: done, set_kind: 'normal', tracking: 'weight_reps' });
test('supersets alternate A/B per round, including unordered server input', () => {
  const [group] = buildWorkoutGroups([base('b2', 'B', 1, 3), base('a1', 'A', 0, 0),
    base('b1', 'B', 0, 1), base('a2', 'A', 1, 2)]);
  assert.deepEqual(group.steps.map((s) => s.id), ['a1', 'b1', 'a2', 'b2']);
  assert.equal(group.rounds, 2);
  assert.equal(group.isSuperset, true);
  assert.deepEqual(group.exercises.map((ex) => ex.id), ['A', 'B']);
});
test('an unfinished drop keeps the round open and precedes the next exercise', () => {
  const [group] = buildWorkoutGroups([base('a', 'A', 0, 0, true), base('b', 'B', 0, 1, true),
    { ...base('d', 'A', 0, 0), set_kind: 'drop', parent_set_id: 'a' }]);
  assert.deepEqual(group.steps.map((s) => s.id), ['a', 'd', 'b']);
  assert.equal(group.doneRounds, 0);
  assert.equal(group.steps.find((s) => !s.is_completed).id, 'd');
});
test('calendar dates stay on the same local day across time zones and DST', () => {
  const previous = process.env.TZ;
  try {
    for (const zone of ['America/Los_Angeles', 'Europe/Moscow', 'Pacific/Auckland']) {
      process.env.TZ = zone;
      for (const date of ['2026-11-01', '2026-03-08', '2026-12-31']) {
        assert.equal(toApiDate(safeDate(date)), date);
        assert.equal(safeFormat(date, 'yyyy-MM-dd'), date);
      }
    }
  } finally { process.env.TZ = previous; }
});

async function queueHarness(items, request) {
  let user = { id: 'alice' };
  const state = { items, requests: [], notifications: [] };
  const dependencies = {
    useAuthStore: { getState: () => ({ user }) },
    api: { request: async (config) => { state.requests.push(config); await request?.(config, state); } },
    queueAdd: async (item) => { items.push({ id: items.length + 1, ...item }); },
    queueGetAll: async () => [...items],
    queueDelete: async (id) => { state.items = state.items.filter((item) => item.id !== id); },
    queueUpdate: async (id, patch) => Object.assign(items.find((item) => item.id === id), patch),
    toast: { success: (v) => state.notifications.push(v), error: (v) => state.notifications.push(v) },
  };
  const source = await readFile(new URL('../src/shared/offline/queue.js', import.meta.url), 'utf8');
  const key = `queueTest${Math.random()}`;
  globalThis[key] = dependencies;
  const module = await import('data:text/javascript;base64,' + Buffer.from(
    `const { ${Object.keys(dependencies).join(', ')} } = globalThis[${JSON.stringify(key)}];\n` +
    source.replace(/^import .*;\n/gm, '')).toString('base64'));
  delete globalThis[key];
  return { ...module, state, switchUser: (id) => { user = id ? { id } : null; } };
}
test('offline replay sends only the current account and never requeues a replay', async () => {
  const h = await queueHarness([{ id: 1, userId: 'bob', url: '/workouts' },
    { id: 2, url: '/workouts' }, { id: 3, userId: 'alice', url: '/nutrition/entries' }]);
  await h.replayQueue();
  assert.deepEqual(h.state.requests.map((c) => c.url), ['/nutrition/entries']);
  assert.equal(h.state.requests[0]._offlineReplay, true);
  assert.equal(h.state.requests[0]._ownerId, 'alice');
  assert.deepEqual(h.state.items.map((item) => item.id), [1, 2]);
});
test('network and authentication failures retain queued actions without duplication', async () => {
  for (const response of [undefined, { status: 401 }, { status: 503 }]) {
    const h = await queueHarness([{ id: 1, userId: 'alice', url: '/workouts' }], () => { throw { response }; });
    await h.replayQueue();
    assert.equal(h.state.items.length, 1);
    assert.equal(h.state.requests.length, 1);
  }
});
test('account changes stop replay before the following action', async () => {
  let h;
  h = await queueHarness([{ id: 1, userId: 'alice' }, { id: 2, userId: 'alice' }], () => h.switchUser('bob'));
  await h.replayQueue();
  assert.equal(h.state.requests.length, 1);
});

test('private offline API caches are partitioned by account, malformed tokens are not cached', () => {
  const token = (sub) => `Bearer header.${btoa(JSON.stringify({ sub }))}.signature`;
  assert.notEqual(apiCacheName(token('11111111-1111-4111-8111-111111111111')),
    apiCacheName(token('22222222-2222-4222-8222-222222222222')));
  assert.equal(apiCacheName('Bearer malformed'), null);
  assert.equal(apiCacheName(null), null);
});
