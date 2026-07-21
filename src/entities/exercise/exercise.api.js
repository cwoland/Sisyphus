import { api } from '../../shared/lib/axios.js';

export const getExercises = (params = {}) =>
    api.get('/exercises', { params }).then((r) => r.data.exercises);

export const createExercise = (payload) =>
    api.post('/exercises', payload).then((r) => r.data.exercise);