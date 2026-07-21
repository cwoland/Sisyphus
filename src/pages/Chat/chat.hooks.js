import { useState, useRef, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getChats, startChat, getMessages, sendMessage, markChatRead,
} from '../../entities/chat/chat.api.js';
import { toast } from '../../shared/ui/toast/toast.store.js';

export const useChats = () =>
  useQuery({
    queryKey: ['chats'],
    queryFn: getChats,
    refetchInterval: 15_000,
  });

export const useStartChat = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: startChat,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['chats'] }),
    onError: (e) => toast.error(e.response?.data?.message || 'Не удалось открыть чат'),
  });
};

export const useChatMessages = (chatId) => {
  const [messages, setMessages] = useState([]);
  const cursorRef = useRef(null);

  const mergeMessages = useCallback((incoming) => {
    if (!incoming?.length) return;
    setMessages((prev) => {
      const map = new Map(prev.map((m) => [m.id, m]));
      let changed = false;

      for (const msg of incoming) {
        const existing = map.get(msg.id);
        if (!existing) {
          map.set(msg.id, msg);
          changed = true;
        } else if (existing.read_at !== msg.read_at) {
          map.set(msg.id, { ...existing, read_at: msg.read_at });
          changed = true;
        }
      }

      if (!changed) return prev;

      const merged = [...map.values()].sort(
        (a, b) => new Date(a.created_at) - new Date(b.created_at)
      );
      const lastReal = [...merged].reverse().find((m) => !String(m.id).startsWith('temp-'));
      if (lastReal) cursorRef.current = lastReal.created_at;
      return merged;
    });
  }, []);

  useEffect(() => {
    setMessages([]);
    cursorRef.current = null;
  }, [chatId]);

  const incrementalQuery = useQuery({
    queryKey: ['messages', chatId, 'incremental'],
    queryFn: () => getMessages(chatId, { after: cursorRef.current }),
    enabled: !!chatId,
    refetchInterval: 4000,
  });

  const statusQuery = useQuery({
    queryKey: ['messages', chatId, 'status'],
    queryFn: () => getMessages(chatId, { limit: 20 }),
    enabled: !!chatId,
    refetchInterval: 6000,
  });

  useEffect(() => { mergeMessages(incrementalQuery.data); }, [incrementalQuery.data, mergeMessages]);
  useEffect(() => { mergeMessages(statusQuery.data); }, [statusQuery.data, mergeMessages]);

  return {
    messages,
    isLoading: incrementalQuery.isLoading && messages.length === 0,
    appendLocal: mergeMessages,
  };
};

export const useSendMessage = (chatId, onSent) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (text) => sendMessage({ chatId, text }),
    onSuccess: (message) => {
      onSent?.([message]);
      qc.invalidateQueries({ queryKey: ['chats'] });
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Сообщение не отправлено'),
  });
};

export const useMarkRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: markChatRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['chats'] }),
  });
};