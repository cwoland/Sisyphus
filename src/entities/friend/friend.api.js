import { api } from '../../shared/lib/axios.js';

export const getFriends = () =>
  api.get('/friends').then((r) => r.data.friends);

export const getPendingRequests = () =>
  api.get('/friends/requests').then((r) => r.data.requests);

export const sendFriendRequest = (email) =>
  api.post('/friends/requests', { email }).then((r) => r.data.friendship);

export const respondToRequest = ({ id, accept }) =>
  api.patch(`/friends/requests/${id}`, { accept }).then((r) => r.data.result);

export const removeFriend = (id) =>
  api.delete(`/friends/${id}`).then((r) => r.data);