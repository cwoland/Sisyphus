import { api } from '../../shared/lib/axios.js';

export const getPrograms = () =>
  api.get('/programs').then((r) => r.data.programs);

export const getProgram = (id) =>
  api.get(`/programs/${id}`).then((r) => r.data.program);

export const createProgram = (payload) =>
  api.post('/programs', payload).then((r) => r.data.program);

export const updateProgram = ({ id, ...payload }) =>
  api.put(`/programs/${id}`, payload).then((r) => r.data.program);

export const deleteProgram = (id) =>
  api.delete(`/programs/${id}`).then((r) => r.data);

export const forkProgram = (id) =>
  api.post(`/programs/${id}/fork`).then((r) => r.data.program);