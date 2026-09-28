import axios from 'axios';
import { useAuthStore } from '../../entities/user/auth.store.js';
import { enqueueMutation } from '../offline/queue.js';
import { toast } from '../ui/toast/toast.store.js';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const COLD_START_DELAY = 3000;
const WARN_COOLDOWN = 60_000;

let pending = 0;
let timer = null;
let lastWarnedAt = 0;

const stopTimer = () => {
  pending = Math.max(0, pending - 1);
  if (pending === 0) {
    clearTimeout(timer);
    timer = null;
  }
};

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshPromise = null;

export const refreshSession = () => {
  if (!refreshPromise) {
    refreshPromise = api
      .post('/auth/refresh')
      .then(({ data }) => {
        useAuthStore.getState().setAccessToken(data.accessToken);
        return data.accessToken;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status !== 401 || originalRequest?._retry) {
      return Promise.reject(error);
    }

    if (originalRequest.url?.includes('/auth/refresh') || originalRequest.url?.includes('/auth/login')) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const newAccessToken = await refreshSession();
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      useAuthStore.getState().logout();
      return Promise.reject(refreshError);
    }
  }
);

const MUTATION_METHODS = ['post', 'put', 'patch', 'delete'];

const OFFLINE_QUEUEABLE = ['/workouts', '/nutrition/entries'];

const OFFLINE_EXCLUDED = ['/workouts/schedule-program'];

const isQueueable = (config) => {
  const method = config.method?.toLowerCase();
  if (!MUTATION_METHODS.includes(method)) return false;
  const url = config.url;
  if (!url) return false;
  if (OFFLINE_EXCLUDED.some((prefix) => url.startsWith(prefix))) return false;
  return OFFLINE_QUEUEABLE.some((prefix) => url.startsWith(prefix));
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (!error.response && error.config && isQueueable(error.config)) {
      await enqueueMutation({
        method: error.config.method,
        url: error.config.url,
        data: error.config.data ? JSON.parse(error.config.data) : undefined,
      });
      toast.info('Нет сети — действие сохранено и выполнится позже');

      error.isQueued = true;
      return Promise.reject(error);
    }
    return Promise.reject(error);
  }
);

api.interceptors.request.use((config) => {
  if (config.url?.includes('/ai')) return config;
  pending += 1;
  if (pending === 1 && !timer) {
    timer = setTimeout(() => {
      if (Date.now() - lastWarnedAt > WARN_COOLDOWN) {
        lastWarnedAt = Date.now();
        toast.info('Пробуждаем сервер - это займет 20-30 сек.');
      }
    }, COLD_START_DELAY);
  }
  return config;
});

api.interceptors.response.use(
  (res) => { stopTimer(); return res; },
  (err) => { stopTimer(); return Promise.reject(err); }
);