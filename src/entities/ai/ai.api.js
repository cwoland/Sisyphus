import { api } from '../../shared/lib/axios.js';

export const getConversations = () =>
  api.get('/ai/conversations').then((r) => r.data.conversations);

export const createConversation = (payload) =>
  api.post('/ai/conversations', payload).then((r) => r.data.conversation);

export const getConversationMessages = (id) =>
  api.get(`/ai/conversations/${id}`).then((r) => r.data);

export const sendAiMessage = ({ id, message }) =>
  api.post(`/ai/conversations/${id}/messages`, { message }).then((r) => r.data.message);

export const deleteConversation = (id) =>
  api.delete(`/ai/conversations/${id}`).then((r) => r.data);