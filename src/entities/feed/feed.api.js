import { api } from '../../shared/lib/axios.js';

export const getFeed = (cursor) => 
    api
        .get('/feed', {
            params: cursor ? { before: cursor.before, beforeId: cursor.beforeId } : {},
        })
        .then((r) => r.data.feed);

export const reactToEvent = ({ type, id }) => 
    api.post(`/feed/reactions/${type}/${id}`).then((r) => r.data);

export const unreactToEvent = ({ type, id }) =>
    api.delete(`/feed/reactions/${type}/${id}`).then((r) => r.data);