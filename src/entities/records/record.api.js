import { api } from '../../shared/lib/axios.js';

export const getRecords = () =>
  api.get('/records').then((r) => (Array.isArray(r.data) ? r.data : r.data.records ?? []));