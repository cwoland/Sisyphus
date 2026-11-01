import { api } from '../../shared/lib/axios.js';

export const registerRequest = (payload) => api.post('/auth/register', payload).then((res) => res.data);

export const loginRequest = (payload) => api.post('/auth/login', payload).then((res) => res.data);

export const logoutRequest = async () => {
  const registration = await navigator.serviceWorker?.getRegistration().catch(() => null);
  const subscription = await registration?.pushManager?.getSubscription().catch(() => null);
  const response = await api.post('/auth/logout', { pushEndpoint: subscription?.endpoint });
  await subscription?.unsubscribe().catch(() => {});
  return response.data;
};

export const meRequest = () => api.get('/auth/me').then((res) => res.data);

export const updateProfileRequest = (payload) =>
  api.patch('/users/me', payload).then((r) => r.data.user);

export const changePasswordRequest = (payload) =>
  api.patch('/users/me/password', payload).then((r) => r.data);