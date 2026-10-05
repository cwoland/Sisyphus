import { api } from '../../shared/lib/axios.js';

export const getFeed = (cursor) => 
    api
        .get('/feed', {
            params: cursor ? { before: cursor.before, beforeId: cursor.beforeId } : {},
        })
        .then((r) => r.data.feed);