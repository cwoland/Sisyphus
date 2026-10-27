import { useState } from 'react';
import { Send, Users } from 'lucide-react';
import { clsx } from 'clsx';

import { useFriends } from '../../pages/Friends/friends.hooks.js';
import { useShareMutations } from '../../pages/Friends/shares.hooks.js';
import { Sheet } from '../../shared/ui/Sheet.jsx';
import { Button } from '../../shared/ui/Button.jsx';
import { Avatar } from '../../shared/ui/Avatar.jsx';
import { EmptyState } from '../../shared/ui/EmptyState.jsx';
import { SkeletonList } from '../../shared/ui/Skeleton.jsx';

export const ShareDialog = ({ isOpen, onClose, title, programId, workoutId }) => {
  const friendsQuery = useFriends();
  const { sendProgram, sendWorkout } = useShareMutations();
  const [picked, setPicked] = useState(null);

  const friends = friendsQuery.data || [];
  const isSending = sendProgram.isPending || sendWorkout.isPending;

  const send = () => {
    if (!picked) return;
    const done = { onSuccess: () => { setPicked(null); onClose(); } };

    if (programId) sendProgram.mutate({ toUserId: picked, programId }, done);
    else if (workoutId) sendWorkout.mutate({ toUserId: picked, workoutId }, done);
  };

  return (
    <Sheet isOpen={isOpen} onClose={onClose} title="Отправить другу">
      <div className="space-y-4">
        {title && (
          <p className="rounded-xl bg-surface-2 px-3 py-2 text-sm text-text">{title}</p>
        )}

        {friendsQuery.isLoading ? (
          <SkeletonList count={3} />
        ) : friends.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Некому отправить"
            description="Сначала добавьте друга — делиться можно только со своими."
          />
        ) : (
          <>
            <ul className="space-y-2">
              {friends.map((f) => (
                <li key={f.id}>
                  <button
                    onClick={() => setPicked(f.id)}
                    aria-pressed={picked === f.id}
                    className={clsx(
                      'flex min-h-[60px] w-full items-center gap-3 rounded-2xl border p-3 text-left transition-colors',
                      picked === f.id
                        ? 'border-cta bg-cta/10'
                        : 'border-border bg-surface hover:bg-surface-2'
                    )}
                  >
                    <Avatar name={f.name} src={f.avatar_url} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-text">{f.name}</p>
                      <p className="truncate text-xs text-text-muted">@{f.username}</p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>

            <div className="flex gap-2">
              <Button variant="ghost" className="flex-1" onClick={onClose}>Отмена</Button>
              <Button className="flex-1" onClick={send} disabled={!picked} isLoading={isSending}>
                <Send size={16} /> Отправить
              </Button>
            </div>
          </>
        )}
      </div>
    </Sheet>
  );
};