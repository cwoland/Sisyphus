import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send } from 'lucide-react';
import { useChatMessages, useSendMessage, useMarkRead } from '../chat.hooks.js';
import { MessageBubble } from './MessageBubble.jsx';
import { Avatar } from '../../../shared/ui/Avatar.jsx';
import { Spinner } from '../../../shared/ui/Spinner.jsx';
import { IconButton } from '../../../shared/ui/IconButton.jsx';
import { useAuthStore } from '../../../entities/user/auth.store.js';

export const Conversation = ({ chat, onBack }) => {
  const currentUserId = useAuthStore((s) => s.user?.id);
  const { messages, isLoading, appendLocal } = useChatMessages(chat.chat_id);
  const sendMutation = useSendMessage(chat.chat_id, appendLocal);
  const markRead = useMarkRead();

  const [text, setText] = useState('');
  const bottomRef = useRef(null);
  const settled = useRef(false);

  useEffect(() => {
    if (!messages.length) return;
    // Первая прокрутка — мгновенная: плавная пролистывала бы всю историю.
    bottomRef.current?.scrollIntoView({ behavior: settled.current ? 'smooth' : 'auto' });
    settled.current = true;
  }, [messages.length]);

  const hasUnread = messages.some((m) => m.sender_id !== currentUserId && !m.read_at);
  const markReadRef = useRef(markRead.mutate);

  useEffect(() => {
    markReadRef.current = markRead.mutate;
  });

  useEffect(() => {
    if (hasUnread) markReadRef.current(chat.chat_id);
  }, [hasUnread, chat.chat_id]);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setText('');
    sendMutation.mutate(trimmed);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex shrink-0 items-center gap-3 border-b border-border p-3">
        <IconButton
          icon={ArrowLeft} size={20} onClick={onBack}
          className="text-text-muted hover:bg-surface-2 hover:text-text lg:hidden"
          aria-label="К списку диалогов"
        />
        <Avatar name={chat.friend_name} src={chat.friend_avatar} size="sm" />
        <p className="min-w-0 flex-1 truncate font-medium text-text">{chat.friend_name}</p>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto overscroll-contain p-4 no-scrollbar">
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

      <div className="flex shrink-0 items-end gap-2 border-t border-border p-3">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
          }}
          rows={1}
          placeholder="Сообщение…"
          aria-label="Текст сообщения"
          className="max-h-32 flex-1 resize-none rounded-xl border border-border-strong bg-surface px-3.5 py-2.5 text-sm text-text transition-colors focus:border-accent focus:outline-none"
        />
        <button
          onClick={handleSend}
          disabled={!text.trim() || sendMutation.isPending}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent text-on-accent transition-colors hover:bg-accent-hover disabled:opacity-50"
          aria-label="Отправить"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};