import { api } from '../../shared/lib/axios.js';

export const getFeed = (before) => 
    api.get('/feed', { params: before ? { before } : {} }).then((r) => r.data.feed);