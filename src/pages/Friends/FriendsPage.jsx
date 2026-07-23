import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Check, X, MessageCircle, UserMinus, Users } from 'lucide-react';

import { useFriends, usePendingRequests, useFriendMutations } from './friends.hooks.js';
import { useStartChat } from '../Chat/chat.hooks.js';
import { AddFriendForm } from '../../features/add-friend/AddFriendForm.jsx';
import { Avatar } from '../../shared/ui/Avatar.jsx';
import { Sheet } from '../../shared/ui/Sheet.jsx';
import { Button } from '../../shared/ui/Button.jsx';
import { EmptyState } from '../../shared/ui/EmptyState.jsx';
import { SkeletonList } from '../../shared/ui/Skeleton.jsx';
import { emptyStates } from '../../shared/lib/sisyphusPhrases.js';

export const FriendsPage = () => {
  const navigate = useNavigate();
  const friendsQuery = useFriends();
  const requestsQuery = usePendingRequests();
  const { respond, remove } = useFriendMutations();
  const startChat = useStartChat();

  const [addOpen, setAddOpen] = useState(false);

  const openChatWith = (friendId) => {
    startChat.mutate(friendId, {
      onSuccess: (chat) => navigate('/chat', { state: { chatId: chat.id } }),
    });
  };

  const friends = friendsQuery.data || [];
  const requests = requestsQuery.data || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-text">Друзья</h1>
        <Button onClick={() => setAddOpen(true)}>
          <UserPlus size={18} /> Добавить
        </Button>
      </div>

      {requests.length > 0 && (
        <section>
          <h2 className="mb-3 font-display text-lg font-semibold text-text">
            Заявки <span className="text-sm font-normal text-text-muted">({requests.length})</span>
          </h2>
          <div className="space-y-2">
            {requests.map((req) => (
              <div key={req.friendship_id} className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-3">
                <Avatar name={req.name} src={req.avatar_url} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-text">{req.name}</p>
                  <p className="truncate text-xs text-text-muted">@{req.username}</p>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => respond.mutate({ id: req.friendship_id, accept: true })}
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-white hover:bg-accent-hover"
                    aria-label="Принять"
                  >
                    <Check size={18} />
                  </button>
                  <button
                    onClick={() => respond.mutate({ id: req.friendship_id, accept: false })}
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-2 text-text-muted hover:text-crimson"
                    aria-label="Отклонить"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-3 font-display text-lg font-semibold text-text">Мои друзья</h2>

        {friendsQuery.isLoading ? (
          <SkeletonList count={3} />
        ) : friendsQuery.data?.length === 0 ? (
          <div className="rounded-2xl border border-border bg-surface">
            <EmptyState
              icon={Users}
              {...emptyStates.friends}
              action={<Button onClick={() => setAddOpen(true)}><UserPlus size={18} /> Добавить друга</Button>}
            />
          </div>
        ) : (
          <div className="space-y-2">
            {friendsQuery.data.map((friend) => (
              <div key={friend.friendship_id} className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-3">
                <Avatar name={friend.name} src={friend.avatar_url} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-text">{friend.name}</p>
                  <p className="truncate text-xs text-text-muted">@{friend.username}</p>
                </div>
                <button
                  onClick={() => openChatWith(friend.id)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-2 text-text-muted hover:text-accent"
                  aria-label="Написать"
                >
                  <MessageCircle size={18} />
                </button>
                <button
                  onClick={() => remove.mutate(friend.friendship_id)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-2 text-text-muted hover:text-crimson"
                  aria-label="Удалить из друзей"
                >
                  <UserMinus size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <Sheet isOpen={addOpen} onClose={() => setAddOpen(false)} title="Добавить друга">
        <AddFriendForm onDone={() => setAddOpen(false)} />
      </Sheet>
    </div>
  );
};