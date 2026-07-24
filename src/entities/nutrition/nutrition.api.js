import { api } from '../../shared/lib/axios.js';

export const getEntries = ({ from, to }) =>
  api.get('/nutrition/entries', { params: { from, to } }).then((r) => r.data.entries);

export const getRecentFoods = (q = '') =>
  api.get('/nutrition/recent', { params: q ? { q } : {} }).then((r) => r.data.foods);

export const createEntry = (payload) =>
  api.post('/nutrition/entries', payload).then((r) => r.data.entry);

export const updateEntry = ({ id, ...payload }) =>
  api.patch(`/nutrition/entries/${id}`, payload).then((r) => r.data.entry);

export const deleteEntry = (id) =>
  api.delete(`/nutrition/entries/${id}`).then((r) => r.data);

export const getDailySummary = (date) =>
  api.get('/nutrition/summary', { params: { date } }).then((r) => r.data.summary);

export const getTargets = () =>
  api.get('/nutrition/targets').then((r) => r.data.targets);

export const updateTargets = (payload) =>
  api.put('/nutrition/targets', payload).then((r) => r.data.targets);