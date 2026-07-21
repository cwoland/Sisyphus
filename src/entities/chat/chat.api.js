import { api } from '../../shared/lib/axios.js';

export const getChats = () =>
  api.get('/chats').then((r) => r.data.chats);

export const startChat = (friendId) =>
  api.post('/chats', { friendId }).then((r) => r.data.chat);

export const getMessages = (chatId, { after, limit } = {}) =>
  api.get(`/chats/${chatId}/messages`, { params: { after, limit } }).then((r) => r.data.messages);

export const sendMessage = ({ chatId, text }) =>
  api.post(`/chats/${chatId}/messages`, { text }).then((r) => r.data.message);

export const markChatRead = (chatId) =>
  api.patch(`/chats/${chatId}/read`).then((r) => r.data);