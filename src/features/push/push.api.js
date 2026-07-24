import { api } from '../../shared/lib/axios.js';

export const getVapidPublicKey = () =>
    api.get('/push/public-key').then((r) => r.data.publicKey);

export const subscribePush = (subscription) =>
    api.post('/push/subscribe', subscription).then((r) => r.data);

export const unsubscribePush = (endpoint) =>
    api.post('/push/unsubscribe', { endpoint }).then((r) => r.data);