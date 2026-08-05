import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getConversations, createConversation, getConversationMessages,
  sendAiMessage, deleteConversation,
} from '../../entities/ai/ai.api.js';
import { toast } from '../../shared/ui/toast/toast.store.js';

export const useConversations = () =>
  useQuery({ queryKey: ['ai', 'conversations'], queryFn: getConversations });

export const useConversationMessages = (id) =>
  useQuery({
    queryKey: ['ai', 'conversation', id],
    queryFn: () => getConversationMessages(id),
    enabled: !!id,
  });

export const useCreateConversation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createConversation,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ai', 'conversations'] }),
    onError: (e) => toast.error(e.response?.data?.message || 'Не удалось создать диалог'),
  });
};

export const useDeleteConversation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteConversation,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ai', 'conversations'] });
      toast.success('Диалог удалён');
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Не удалось удалить'),
  });
};

export const useSendAiMessage = (conversationId) => {
  const qc = useQueryClient();
  const queryKey = ['ai', 'conversation', conversationId];

  return useMutation({
    mutationFn: (message) => sendAiMessage({ id: conversationId, message }),

    onMutate: async (message) => {
      await qc.cancelQueries({ queryKey });
      const previous = qc.getQueryData(queryKey);

      qc.setQueryData(queryKey, (old) => {
        if (!old) return old;
        return {
          ...old,
          messages: [
            ...old.messages,
            { id: `temp-user-${Date.now()}`, role: 'user', content: message, created_at: new Date().toISOString() },
            { id: 'typing', role: 'assistant', content: '', isTyping: true, created_at: new Date().toISOString() },
          ],
        };
      });

      return { previous };
    },

    onError: (e, _msg, context) => {
      if (context?.previous) qc.setQueryData(queryKey, context.previous);
      toast.error(e.response?.data?.message || 'Оракул не ответил. Попробуйте ещё раз.');
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey });
    },
  });
};