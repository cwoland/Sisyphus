import { useSearchParams } from "react-router-dom";
import { MessageCircle } from "lucide-react";

import { useChats } from './chat.hooks.js';
import { Conversation } from './widgets/Conversation.jsx';
import { ChatListItem } from './widgets/ChatListItem.jsx';
import { SplitPane } from '../../shared/ui/SplitPane.jsx';
import { Button } from '../../shared/ui/Button.jsx';
import { EmptyState } from '../../shared/ui/EmptyState.jsx';
import { SkeletonList } from '../../shared/ui/Skeleton.jsx';
import { Spinner } from "../../shared/ui/Spinner.jsx";
import { emptyStates } from '../../shared/lib/sisyphusPhrases.js';

export const ChatPage = () => {
  const [params, setParams] = useSearchParams();
  const activeChatId = params.get('chat');

  const chatsQuery = useChats();
  const chats = chatsQuery.data || [];
  const activeChat = chats.find((c) => c.chat_id === activeChatId);

  const openChat = (id) => setParams({ chat: id });
  const closeChat = () => setParams({}, { replace: true });

  const list = (
    <>
      <h1 className="mb-4 font-display text-2xl font-bold text-text">Чат</h1>

      {chatsQuery.isLoading ? (
        <SkeletonList count={4} />
      ) : chats.length === 0 ? (
        <div className="rounded-2xl border border-border bg-surface">
          <EmptyState icon={MessageCircle} {...emptyStates.chat} />
        </div>
      ) : (
        <ul className="space-y-1.5">
          {chats.map((chat) => (
            <ChatListItem
              key={chat.chat_id}
              chat={chat}
              isActive={chat.chat_id === activeChatId}
              onSelect={openChat}
            />
          ))}
        </ul>
      )}
    </>
  );

  const detail = activeChat ? (
    <Conversation key={activeChat.chat_id} chat={activeChat} onBack={closeChat} />
  ) : chatsQuery.isLoading ? (
    <div className="flex h-full items-center justify-center">
      <Spinner />
    </div>
  ) : (
    <div className="flex h-full items-center justify-center p-6">
      <EmptyState
        icon={MessageCircle}
        title="Диалог не найден"
        description="Возможно, он был удалён или вы больше не друзья."
        action={<Button variant="secondary" onClick={closeChat}>К списку</Button>}
      />
    </div>
  );

  return (
    <SplitPane
      isDetailOpen={Boolean(activeChatId)}
      list={list}
      detail={detail}
      placeholder={
       <EmptyState
        icon={MessageCircle}
        title="Выберите диалог"
        description="Слева - список бесед." 
      />
      }
    />
  );
};