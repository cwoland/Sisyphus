import { api } from '../../shared/lib/axios.js';

export const getShares = () =>
    api.get('/shares').then((r) => r.data.shares);

export const getShare = (id) =>
    api.get(`/shares/${id}`).then((r) => r.data);

export const shareProgram = ({ toUserId, programId }) =>
    api.post('/shares/programs', { toUserId, programId }).then((r) => r.data.share);

export const shareWorkout = ({ toUserId, workoutId }) =>
    api.post('/shares/workouts', { toUserId, workoutId }).then((r) => r.data.share);

export const removeShare = (id) => 
    api.delete(`/shares/${id}`).then((r) => r.data);