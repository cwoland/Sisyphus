// Persist only workout data and the last verified account, never access tokens.
const USER_KEY = 'sisyphus-offline-user:v1';
const cacheKey = (userId) => `sisyphus-workouts:v1:${userId}`;
const isWorkoutKey = (key) => ['workout', 'workouts'].includes(key?.[0]);

export const forgetOfflineUser = () => {
  try { localStorage.removeItem(USER_KEY); } catch { /* unavailable storage */ }
};

export const readOfflineUser = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(USER_KEY));
    return saved?.id ? saved : null;
  } catch { return null; }
};

export const readWorkoutCache = (userId) => {
  if (!userId) return [];
  try {
    const entries = JSON.parse(localStorage.getItem(cacheKey(userId)));
    return Array.isArray(entries) ? entries.filter((entry) => isWorkoutKey(entry.key) && entry.data !== undefined) : [];
  } catch { return []; }
};

export const cachedWorkout = (userId, workoutId) =>
  readWorkoutCache(userId).find(({ key }) => key[0] === 'workout' && key[1] === workoutId)?.data;

export const installWorkoutPersistence = (client, auth) => {
  let restoring = false;
  const unsubscribeAuth = auth.subscribe((state, previous) => {
    const userId = state.user?.id;
    const previousId = previous.user?.id;
    if (userId !== previousId) {
      restoring = true;
      client.clear();
      if (previousId) {
        try { localStorage.removeItem(cacheKey(previousId)); } catch { /* unavailable storage */ }
        navigator.serviceWorker?.controller?.postMessage({ type: 'CLEAR_USER_CACHE', userId: previousId });
      }
      for (const entry of readWorkoutCache(userId)) {
        client.setQueryData(entry.key, entry.data, { updatedAt: entry.updatedAt });
      }
      restoring = false;
    }
    try {
      if (state.user) localStorage.setItem(USER_KEY, JSON.stringify(state.user));
      else if (previousId) localStorage.removeItem(USER_KEY);
    } catch { /* unavailable storage */ }
  });
  const unsubscribeCache = client.getQueryCache().subscribe((event) => {
    const userId = auth.getState().user?.id;
    if (restoring || !userId || event.type !== 'updated' || !isWorkoutKey(event.query.queryKey)) return;
    const entries = client.getQueryCache().getAll()
      .filter((q) => isWorkoutKey(q.queryKey) && q.state.data !== undefined)
      .sort((a, b) => b.state.dataUpdatedAt - a.state.dataUpdatedAt)
      .slice(0, 50)
      .map((q) => ({ key: q.queryKey, data: q.state.data, updatedAt: q.state.dataUpdatedAt }));
    try { localStorage.setItem(cacheKey(userId), JSON.stringify(entries)); } catch { /* unavailable storage */ }
  });
  return () => { unsubscribeAuth(); unsubscribeCache(); };
};
