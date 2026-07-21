import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send } from 'lucide-react';
import { useChatMessages, useSendMessage, useMarkRead } from '../chat.hooks.js';
import { MessageBubble } from './MessageBubble.jsx';
import { Avatar } from '../../../shared/ui/Avatar.jsx';
import { Spinner } from '../../../shared/ui/Spinner.jsx';
import { useAuthStore } from '../../../entities/user/auth.store.js';

export const Conversation = ({ chat, onBack }) => {
  const currentUserId = useAuthStore((s) => s.user?.id);
  const { messages, isLoading, appendLocal } = useChatMessages(chat.chat_id);
  const sendMutation = useSendMessage(chat.chat_id, appendLocal);
  const markRead = useMarkRead();

  const [text, setText] = useState('');
  const scrollRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  useEffect(() => {
    if (chat.chat_id && messages.some((m) => m.sender_id !== currentUserId && !m.read_at)) {
      markRead.mutate(chat.chat_id);
    }
  }, [messages.length, chat.chat_id]);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setText('');
    sendMutation.mutate(trimmed);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-border p-3">
        <button onClick={onBack} className="rounded-lg p-1.5 text-text-muted hover:bg-surface-2 hover:text-text lg:hidden" aria-label="Назад">
          <ArrowLeft size={20} />
        </button>
        <Avatar name={chat.friend_name} src={chat.friend_avatar} size="sm" />
        <p className="font-medium text-text">{chat.friend_name}</p>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-2 overflow-y-auto p-4 no-scrollbar">
        {isLoading ? (
          <div className="flex justify-center py-8"><Spinner /></div>
        ) : messages.length === 0 ? (
          <p className="py-8 text-center text-sm text-text-muted">
            Начните диалог — тишина на склоне уже заждалась.
          </p>
        ) : (
          messages.map((m) => (
            <MessageBubble key={m.id} message={m} isOwn={m.sender_id === currentUserId} />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <div className="flex items-end gap-2 border-t border-border p-3 pad-safe-bottom">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
          }}
          rows={1}
          placeholder="Сообщение..."
          className="max-h-32 flex-1 resize-none rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm text-text focus:outline-none focus:ring-2 focus:ring-accent"
        />
        <button
          onClick={handleSend}
          disabled={!text.trim() || sendMutation.isPending}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent text-white transition-colors hover:bg-accent-hover disabled:opacity-50"
          aria-label="Отправить"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};