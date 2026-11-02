import test from 'node:test';
import assert from 'node:assert/strict';
import { QueryClient } from '@tanstack/react-query';
import { createStore } from 'zustand/vanilla';
import { programToBuilder, serializeDays } from '../src/entities/program/setPlan.js';
import { claimDailyCelebration } from '../src/features/visit-streak/dailyCelebration.js';
import { installWorkoutPersistence, readOfflineUser, cachedWorkout } from '../src/shared/offline/workoutCache.js';

const memoryStorage = () => {
  const map = new Map();
  return { getItem: (key) => map.get(key) ?? null, setItem: (key, value) => map.set(key, value), removeItem: (key) => map.delete(key) };
};

test('editing preserves server exercise names and set plans through a save', () => {
  const program = { title: 'Сила', days: [{ id: 'day', title: 'День 1', exercises: [
    { exercise_id: 'a', exercise_name: 'Жим лёжа', group_index: 0, target_sets: 3, target_reps: '8-12', set_plan: { restSec: 90 } },
    { exercise_id: 'b', exercise_name: 'Бабочка', group_index: 1, target_sets: 1, target_reps: '10', set_plan: { mode: 'drop', restSec: 120, steps: [{ weight: 30, reps: 10 }, { weight: 20, reps: 12 }] } },
  ] }] };
  const builder = programToBuilder(program);
  assert.deepEqual(builder.days[0].exercises.map((ex) => ex.name), ['Жим лёжа', 'Бабочка']);
  assert.deepEqual(serializeDays(builder.days)[0].exercises.map((ex) => [ex.exerciseId, ex.setPlan.restSec]), [['a', 90], ['b', 120]]);
  assert.deepEqual(serializeDays(builder.days)[0].exercises[1].setPlan.steps, [{ weight: 30, reps: 10 }, { weight: 20, reps: 12 }]);
});

test('streak celebration requires a counted visit and runs once per account and day', () => {
  const storage = memoryStorage();
  const data = { current: 4, todayCounted: true, today: '2026-11-01' };
  assert.equal(claimDailyCelebration('alice', '2026-11-01', { ...data, todayCounted: false }, storage), false);
  assert.equal(claimDailyCelebration('alice', '2026-11-01', data, storage), true);
  assert.equal(claimDailyCelebration('alice', '2026-11-01', data, storage), false);
  assert.equal(claimDailyCelebration('bob', '2026-11-01', data, storage), true);
  assert.equal(claimDailyCelebration('alice', '2026-11-02', data, storage), false);
  assert.equal(claimDailyCelebration('alice', '2026-11-02', { ...data, today: '2026-11-02', current: 5 }, storage), true);
  storage.setItem('sisyphus-streak-celebrated:v1:carol', '2026-11-01');
  assert.equal(claimDailyCelebration('carol', '2026-11-01', data, storage), false);
});

test('optimistic sets and start time survive reload, without leaking to another account or storing tokens', () => {
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: memoryStorage() });
  const client = new QueryClient();
  const auth = createStore(() => ({ user: null, accessToken: null }));
  const stop = installWorkoutPersistence(client, auth);
  const workout = { id: 'w', started_at: '2026-11-01T12:00:00Z', sets: [{ id: 's', is_completed: true }] };
  auth.setState({ user: { id: 'alice', name: 'Алиса' }, accessToken: 'secret' });
  client.setQueryData(['workout', 'w'], workout);
  assert.deepEqual(cachedWorkout('alice', 'w'), workout);
  assert.equal(readOfflineUser().id, 'alice');
  assert.equal(JSON.stringify(readOfflineUser()).includes('secret'), false);
  const restored = new QueryClient();
  const restoredAuth = createStore(() => ({ user: null }));
  const stopRestored = installWorkoutPersistence(restored, restoredAuth);
  restoredAuth.setState({ user: readOfflineUser() });
  assert.deepEqual(restored.getQueryData(['workout', 'w']), workout);
  restoredAuth.setState({ user: { id: 'bob' } });
  assert.equal(restored.getQueryData(['workout', 'w']), undefined);
  restoredAuth.setState({ user: null });
  assert.equal(readOfflineUser(), null);
  stop(); stopRestored(); client.clear(); restored.clear();
  if (previous) Object.defineProperty(globalThis, 'localStorage', previous);
  else delete globalThis.localStorage;
});
