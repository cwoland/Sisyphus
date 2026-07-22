import { api } from '../../shared/lib/axios.js';

export const getWorkouts = ({ from, to }) =>
    api.get('/workouts', { params: { from, to } }).then((r) => r.data.workouts);

export const getWorkout = (id) =>
    api.get(`/workouts/${id}`).then((r) => r.data.workout);

export const createWorkout = (payload) =>
    api.post('/workouts', payload).then((r) => r.data.workout);

export const updateWorkout = ({ id, ...body }) =>
    api.patch(`/workouts/${id}`, body).then((r) => r.data.workout);

export const deleteWorkout = (id) =>
    api.delete(`/workouts/${id}`).then((r) => r.data);

export const updateWorkoutStatus = ({ id, status }) =>
    api.patch(`/workouts/${id}/status`, { status }).then((r) => r.data.workout);

export const syncWorkout = (id) =>
    api.post(`/workouts/${id}/sync`).then((r) => r.data.workout);

export const scheduleProgram = (payload) =>
    api.post('/workouts/schedule-program', payload).then((r) => r.data.workouts);

export const upsertWorkoutSet = ({ workoutId, ...body }) => 
    api.put(`/workouts/${workoutId}/sets`, body).then((r) => r.data.set);

export const deleteWorkoutSet = ({ workoutId, setId }) =>
    api.delete(`/workouts/${workoutId}/sets/${setId}`).then((r) => r.data);