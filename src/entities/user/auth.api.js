import { api } from '../../shared/lib/axios.js';

export const registerRequest = (payload) => api.post('/auth/register', payload).then((res) => res.data);

export const loginRequest = (payload) => api.post('/auth/login', payload).then((res) => res.data);

export const logoutRequest = () => api.post('/auth/logout').then((res) => res.data);

export const meRequest = () => api.get('/auth/me').then((res) => res.data);

export const updateProfileRequest = (payload) =>
  api.patch('/users/me', payload).then((r) => r.data.user);

export const changePasswordRequest = (payload) =>
  api.patch('/users/me/password', payload).then((r) => r.data);