import { useNavigate } from 'react-router-dom';
import { Inbox, X, BookOpen, Dumbbell } from 'lucide-react';
import { ru } from 'date-fns/locale';

import { useShares, useShareMutations } from '../shares.hooks.js';
import { Avatar } from '../../../shared/ui/Avatar.jsx';
import { Button } from '../../../shared/ui/Button.jsx';
import { IconButton } from '../../../shared/ui/IconButton.jsx';
import { EmptyState } from '../../../shared/ui/EmptyState.jsx';
import { SkeletonList } from '../../../shared/ui/Skeleton.jsx';
import { useProgramMutations } from '../../Programs/programs.hooks.js';
import { safeDistanceToNow, safeFormat } from '../../../shared/lib/date.js';

export const SharesInbox = () => {
  const navigate = useNavigate();
  const sharesQuery = useShares();
  const { dismiss } = useShareMutations();
  const { fork } = useProgramMutations();

  if (sharesQuery.isLoading) return <SkeletonList count={3} />;

  const shares = sharesQuery.data || [];

  if (shares.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-surface">
        <EmptyState
          icon={Inbox}
          title="Пусто"
          description="Здесь появятся программы и тренировки, которые вам прислали друзья."
        />
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {shares.map((s) => {
        const isProgram = Boolean(s.program_id);
        const Icon = isProgram ? BookOpen : Dumbbell;

        return (
          <li key={s.id} className="rounded-2xl border border-border bg-surface p-3">
            <div className="flex items-start gap-3">
              <Avatar name={s.from_user_name} src={s.from_user_avatar} size="sm" />

              <div className="min-w-0 flex-1">
                <p className="text-sm leading-snug text-text-muted">
                  <b className="font-medium text-text">{s.from_user_name}</b>{' '}
                  {isProgram ? 'прислал программу' : 'прислал тренировку'}
                </p>
                <p className="mt-0.5 flex items-center gap-1.5 text-sm font-medium text-text">
                  <Icon size={14} className="shrink-0 text-terracotta-ink" />
                  <span className="min-w-0 truncate">
                    {isProgram
                      ? s.program_title
                      : `${s.workout_title}${s.workout_date ? `, ${safeFormat(s.workout_date, 'd MMM', { locale: ru })}` : ''}`}
                  </span>
                </p>
                <p className="mt-0.5 text-xs text-text-muted">
                  {safeDistanceToNow(s.created_at, { locale: ru, addSuffix: true })}
                </p>
              </div>

              <IconButton
                icon={X} size={16}
                onClick={() => dismiss.mutate(s.id)}
                className="text-text-muted hover:text-text"
                aria-label="Убрать из присланного"
              />
            </div>

            {isProgram && (
              <div className="mt-3 flex gap-2">
                <Button
                  size="sm"
                  onClick={() =>
                    fork.mutate(s.program_id, {
                      onSuccess: () => { dismiss.mutate(s.id); navigate('/programs'); },
                    })
                  }
                  isLoading={fork.isPending}
                >
                  Скопировать себе
                </Button>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
};