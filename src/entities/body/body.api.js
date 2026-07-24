import { api } from '../../shared/lib/axios.js';

export const getBodyMetrics = () =>
  api.get('/body').then((r) => r.data.metrics);

export const getLatestBody = () =>
  api.get('/body/latest').then((r) => r.data.latest);

export const saveBodyMetric = (payload) =>
  api.post('/body', payload).then((r) => r.data.metric);

export const deleteBodyMetric = (id) =>
  api.delete(`/body/${id}`).then((r) => r.data);