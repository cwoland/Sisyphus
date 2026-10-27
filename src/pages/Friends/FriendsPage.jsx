import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { UserPlus, Check, X, MessageCircle, UserMinus, Users, Newspaper, Inbox } from 'lucide-react';
import { clsx } from 'clsx';

import { useFriends, usePendingRequests, useFriendMutations, useFriendsFeed } from './friends.hooks.js';
import { useShares } from './shares.hooks.js';
import { useStartChat } from '../Chat/chat.hooks.js';
import { AddFriendForm } from '../../features/add-friend/AddFriendForm.jsx';
import { PersonRow } from './widgets/PersonRow.jsx';
import { FeedList } from './widgets/FeedList.jsx';
import { SharesInbox } from './widgets/SharesInbox.jsx';
import { IconButton } from '../../shared/ui/IconButton.jsx';
import { Sheet } from '../../shared/ui/Sheet.jsx';
import { Button } from '../../shared/ui/Button.jsx';
import { EmptyState } from '../../shared/ui/EmptyState.jsx';
import { SkeletonList } from '../../shared/ui/Skeleton.jsx';
import { emptyStates } from '../../shared/lib/sisyphusPhrases.js';
import { plural } from '../../shared/lib/plural.js';

const TABS = [
  { id: 'feed', label: 'Лента', icon: Newspaper },
  { id: 'friends', label: 'Друзья', icon: Users },
  { id: 'inbox', label: 'Присланное', icon: Inbox },
];

export const FriendsPage = () => {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const tabParam = params.get('tab');
  const tab = TABS.some((t) => t.id === tabParam) ? tabParam : 'feed';
  const setTab = (next) => setParams(next === 'feed' ? {} : { tab: next }, { replace: true });

  const friendsQuery = useFriends();
  const requestsQuery = usePendingRequests();
  const { respond, remove } = useFriendMutations();
  const startChat = useStartChat();

  const [addOpen, setAddOpen] = useState(false);
  const feedQuery = useFriendsFeed({ enabled: tab === 'feed' });

  const friends = friendsQuery.data || [];
  const requests = requestsQuery.data || [];

  const sharesQuery = useShares();
  const shares = sharesQuery.data || [];

  const openChatWith = (friendId) => {
    startChat.mutate(friendId, {
      onSuccess: (chat) => navigate(`/chat?chat=${chat.chat_id ?? chat.id}`), 
    });
  };

  const removeFriend = (friend) => {
    if (!window.confirm(`Удалить ${friend.name} из друзей?`)) return;
    remove.mutate(friend.friendship_id);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-bold text-text">Друзья</h1>
          {friends.length > 0 && (
            <p className="text-sm text-text-muted">
              {friends.length} {plural(friends.length, ['человек', 'человека', 'человек'])} рядом
            </p>
          )}
        </div>
        <Button onClick={() => setAddOpen(true)}>
          <UserPlus size={18} /> Добавить
        </Button>
      </div>

      <div role="tablist" aria-label="Раздел" className="flex gap-1 border-b border-border">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={clsx(
              '-mb-px flex min-h-[44px] items-center gap-2 border-b-2 px-3 text-sm font-medium transition-colors',
              tab === id
                ? 'border-cta text-text'
                : 'border-transparent text-text-muted hover:text-text'
            )}
          >
            <Icon size={16} /> {label}
            {id === 'friends' && requests.length > 0 && <TabBadge count={requests.length} label="заявок" />}
            {id === 'inbox' && shares.length > 0 && <TabBadge count={shares.length} label="присланного" />}
          </button>
        ))}
      </div>

      {tab === 'feed' && <FeedList query={feedQuery} />}

      {tab === 'friends' && (
        <div className="space-y-6">
          {requests.length > 0 && (
            <section aria-label="Входящие заявки" className="space-y-2">
              <h2 className="px-1 font-display text-xs font-semibold uppercase tracking-[0.14em] text-text-muted">
                Заявки
              </h2>
              {requests.map((req) => (
                <PersonRow
                  key={req.friendship_id}
                  name={req.name}
                  username={req.username}
                  avatar={req.avatar_url}
                >
                  <IconButton
                    icon={Check} size={18}
                    onClick={() => respond.mutate({ id: req.friendship_id, accept: true })}
                    className="bg-accent text-on-accent hover:bg-accent-hover"
                    aria-label={`Принять заявку: ${req.name}`}
                  />
                  <IconButton
                    icon={X} size={18}
                    onClick={() => respond.mutate({ id: req.friendship_id, accept: false })}
                    className="bg-surface-2 text-text-muted hover:text-danger"
                    aria-label={`Отклонить заявку: ${req.name}`}
                  />
                </PersonRow>
              ))}
            </section>
          )}

          {tab === 'inbox' && <SharesInbox />}

          <section aria-label="Мои друзья" className="space-y-2">
            {requests.length > 0 && (
              <h2 className="px-1 font-display text-xs font-semibold uppercase tracking-[0.14em] text-text-muted">
                Мои друзья
              </h2>
            )}

            {friendsQuery.isLoading ? (
              <SkeletonList count={3} />
            ) : friends.length === 0 ? (
              <div className="rounded-2xl border border-border bg-surface">
                <EmptyState
                  icon={Users}
                  {...emptyStates.friends}
                  action={
                    <Button onClick={() => setAddOpen(true)}>
                      <UserPlus size={18} /> Добавить друга
                    </Button>
                  }
                />
              </div>
            ) : (
              friends.map((friend) => (
                <PersonRow
                  key={friend.friendship_id}
                  name={friend.name}
                  username={friend.username}
                  avatar={friend.avatar_url}
                >
                  <IconButton
                    icon={MessageCircle} size={18}
                    onClick={() => openChatWith(friend.id)}
                    className="bg-surface-2 text-text-muted hover:text-text"
                    aria-label={`Написать: ${friend.name}`}
                  />
                  <IconButton
                    icon={UserMinus} size={18}
                    onClick={() => removeFriend(friend)}
                    className="bg-surface-2 text-text-muted hover:text-danger"
                    aria-label={`Удалить из друзей: ${friend.name}`}
                  />
                </PersonRow>
              ))
            )}
          </section>
        </div>
      )}

      <Sheet isOpen={addOpen} onClose={() => setAddOpen(false)} title="Добавить друга">
        <AddFriendForm onDone={() => setAddOpen(false)} />
      </Sheet>
    </div>
  );
};

const TabBadge = ({ count, label }) => (
  <span 
    className="ml-0.5 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-cta px-1 text-[11px] font-bold tabular-nums text-on-cta" aria-label={`${count} ${label}`}
  >
    {count}
  </span>
);