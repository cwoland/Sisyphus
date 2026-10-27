import { api } from '../../shared/lib/axios.js';

export const getStreak = () => 
    api.get('/stats/streak').then((r) => r.data);

export const getVolume = (weeks) =>
    api.get('/stats/volume', { params: weeks ? { weeks } : {} }).then((r) => r.data);