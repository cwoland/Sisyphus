import { api } from '../../shared/lib/axios.js';

export const getRecords = () =>
  api.get('/records').then((r) => (Array.isArray(r.data) ? r.data : r.data.records ?? []));

export const getExerciseHistory = (exerciseId) =>
  api.get(`/records/history/${exerciseId}`).then((r) => r.data);
