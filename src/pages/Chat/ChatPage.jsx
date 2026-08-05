import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { clsx } from 'clsx';

import { useChats } from './chat.hooks.js';
import { Conversation } from './widgets/Conversation.jsx';
import { Avatar } from '../../shared/ui/Avatar.jsx';
import { EmptyState } from '../../shared/ui/EmptyState.jsx';
import { SkeletonList } from '../../shared/ui/Skeleton.jsx';
import { emptyStates } from '../../shared/lib/sisyphusPhrases.js';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

export const ChatPage = () => {
  const location = useLocation();
  const chatsQuery = useChats();
  const [activeChatId, setActiveChatId] = useState(null);

  useEffect(() => {
    if (location.state?.chatId) setActiveChatId(location.state.chatId);
  }, [location.state]);

  const chats = chatsQuery.data || [];
  const activeChat = chats.find((c) => c.chat_id === activeChatId);

  return (
    <div className="lg:grid lg:grid-cols-[320px,1fr] lg:gap-6">
      <div className={clsx('lg:block', activeChatId && 'hidden')}>
        <h1 className="mb-4 font-display text-2xl font-bold text-text">Чат</h1>

        {chatsQuery.isLoading ? (
          <SkeletonList count={4} />
        ) : chats.length === 0 ? (
          <div className="rounded-2xl border border-border bg-surface">
            <EmptyState icon={MessageCircle} {...emptyStates.chat} />
          </div>
        ) : (
          <div className="space-y-1.5">
            {chats.map((chat) => (
              <button
                key={chat.chat_id}
                onClick={() => setActiveChatId(chat.chat_id)}
                className={clsx(
                  'flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition-colors',
                  chat.chat_id === activeChatId
                    ? 'border-accent bg-accent/5'
                    : 'border-border bg-surface hover:bg-surface-2'
                )}
              >
                <Avatar name={chat.friend_name} src={chat.friend_avatar} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate font-medium text-text">{chat.friend_name}</p>
                    {chat.last_message_at && (
                      <span className="shrink-0 text-[10px] text-text-muted">
                        {chat.last_message_at ? safeDistanceToNow(chat.last_message_at, { locale: ru, addSuffix: false }) : ''}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-xs text-text-muted">
                      {chat.last_message_text || 'Нет сообщений'}
                    </p>
                    {Number(chat.unread_count) > 0 && (
                      <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-accent px-1.5 text-[10px] font-semibold text-white">
                        {chat.unread_count}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className={clsx('lg:block', !activeChatId && 'hidden')}>
        {activeChat ? (
          <div className="h-[calc(100dvh-8rem)] overflow-hidden rounded-2xl border border-border bg-surface lg:h-[calc(100dvh-6rem)]">
            <Conversation chat={activeChat} onBack={() => setActiveChatId(null)} />
          </div>
        ) : (
          <div className="hidden h-full items-center justify-center rounded-2xl border border-border bg-surface lg:flex">
            <EmptyState icon={MessageCircle} title="Выберите диалог" description="Слева — список ваших бесед." />
          </div>
        )}
      </div>
    </div>
  );
};