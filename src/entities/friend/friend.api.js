import { api } from '../../shared/lib/axios.js';

export const getFriends = () =>
  api.get('/friends').then((r) => r.data.friends);

export const searchUsers = (q) => 
  api.get('/friends/search', { params: { q } }).then((r) => r.data.users);

export const getPendingRequests = () =>
  api.get('/friends/requests').then((r) => r.data.requests);

export const sendFriendRequest = (username) =>
  api.post('/friends/requests', { username }).then((r) => r.data.friendship);

export const respondToRequest = ({ id, accept }) =>
  api.patch(`/friends/requests/${id}`, { accept }).then((r) => r.data.result);

export const removeFriend = (id) =>
  api.delete(`/friends/${id}`).then((r) => r.data);