const seen = new Set();

export const claimDailyCelebration = (userId, date, data, storage) => {
  if (!userId || !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
      !data?.todayCounted || !Number.isInteger(Number(data.current)) || Number(data.current) < 1 ||
      (data.today && String(data.today).slice(0, 10) !== date)) return false;
  const key = `sisyphus-streak-celebrated:v1:${userId}`;
  const sessionKey = `${key}:${date}`;
  if (seen.has(sessionKey)) return false;
  try {
    storage ??= globalThis.localStorage;
    if (storage?.getItem(key) === date) { seen.add(sessionKey); return false; }
    storage?.setItem(key, date);
  } catch { /* Session-level deduplication still works with blocked storage. */ }
  seen.add(sessionKey);
  return true;
};
