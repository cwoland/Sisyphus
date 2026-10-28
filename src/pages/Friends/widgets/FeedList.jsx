import { Dumbbell, Trophy, BookOpen, Newspaper } from 'lucide-react';
import { ru } from 'date-fns/locale';
import { clsx } from 'clsx';
import { safeDistanceToNow } from '../../../shared/lib/date.js';
import { useFeedReaction } from '../friends.hooks.js';

import { Avatar } from '../../../shared/ui/Avatar.jsx';
import { Button } from '../../../shared/ui/Button.jsx';
import { EmptyState } from '../../../shared/ui/EmptyState.jsx';
import { SkeletonList } from '../../../shared/ui/Skeleton.jsx';
import { REACTIONS } from '../../../entities/feed/reactions.js';

const CONFIG = {
  workout: {
    icon: Dumbbell,
    tone: 'bg-accent/10 text-accent',
    text: (m) => <>завершил тренировку <b className="font-medium text-text">{m.title}</b></>,
  },
  record: {
    icon: Trophy,
    tone: 'bg-gold/15 text-gold-ink',
    text: (m) => (
      <>
        новый рекорд в <b className="font-medium text-text">{m.exercise}</b> —{' '}
        <b className="font-medium text-text">{Math.round(Number(m.oneRm))} кг</b>{' '}
        <span className="tabular-nums">({Number(m.weight)}×{m.reps})</span>
      </>
    ),
  },
  program: {
    icon: BookOpen,
    tone: 'bg-terracotta/15 text-terracotta-ink',
    text: (m) => <>опубликовал программу <b className="font-medium text-text">{m.title}</b></>,
  },
};

export const FeedList = ({ query }) => {
  const reaction = useFeedReaction();

  if (query.isLoading) return <SkeletonList count={4} />;

  const items = (query.data?.pages || []).flat();

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-surface">
        <EmptyState
          icon={Newspaper}
          title="Пока тихо"
          description="Здесь появятся тренировки, рекорды и программы ваших друзей."
        />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <ol className="space-y-2">
        {items.map((item) => {
          const cfg = CONFIG[item.type];
          if (!cfg) return null;
          const Icon = cfg.icon;

          return (
            <li
              key={`${item.type}-${item.id}`}
              className="flex items-start gap-3 rounded-2xl border border-border bg-surface p-3"
            >
              <div className="relative shrink-0">
                <Avatar name={item.author_name} src={item.author_avatar} />
                <span
                  className={clsx(
                    'absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-surface',
                    cfg.tone
                  )}
                >
                  <Icon size={11} />
                </span>
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm leading-snug text-text-muted">
                  <b className="font-medium text-text">{item.author_name}</b> {cfg.text(item.meta)}
                </p>
                <p className="mt-1 text-xs text-text-muted">
                  {safeDistanceToNow(item.occurred_at, { locale: ru, addSuffix: true })}
                </p>

                <div className="-ml-1.5 mt-1.5 flex items-center gap-0.5">
                  {REACTIONS.map(({ kind, icon: ReactionIcon, label, tone }) => {
                    const mine = item.my_reaction === kind;
                    const count = item.reaction_counts?.[kind] || 0;

                    return (
                      <button
                        key={kind}
                        onClick={() => reaction.mutate({ type: item.type, id: item.id, kind: mine ? null : kind })}
                        aria-pressed={mine}
                        aria-label={label}
                        title={label}
                        className={clsx(
                          'inline-flex h-8 min-w-[2rem] items-center justify-center gap-1 rounded-lg px-1.5 transition-colors duration-tap',
                          mine ? tone : 'text-text-muted hover:bg-surface-2 hover:text-text'
                        )}
                      >
                        <ReactionIcon size={17} fill={mine && kind === 'heart' ? 'currentColor' : 'none'} />
                        {count > 0 && (
                          <span className="text-xs font-medium tabular-nums">{count}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      {query.hasNextPage && (
        <Button
          variant="secondary"
          className="w-full"
          onClick={() => query.fetchNextPage()}
          isLoading={query.isFetchingNextPage}
        >
          Показать ещё
        </Button>
      )}
    </div>
  );
};