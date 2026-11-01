// Decode only to partition local caches. The API still verifies the JWT itself.
export const apiCacheName = (authorization) => {
  try {
    if (!authorization?.startsWith('Bearer ')) return null;
    const encoded = authorization.slice(7).split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const { sub } = JSON.parse(atob(encoded.padEnd(Math.ceil(encoded.length / 4) * 4, '=')));
    return /^[0-9a-f-]{36}$/i.test(sub) ? `api-cache:${sub}` : null;
  } catch { return null; }
};
