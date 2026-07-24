import { Dumbbell, Trophy, BookOpen, Newspaper } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

import { Avatar } from '../../../shared/ui/Avatar.jsx';
import { EmptyState } from '../../../shared/ui/EmptyState.jsx';
import { SkeletonList } from '../../../shared/ui/Skeleton.jsx';

const CONFIG = {
  workout: { icon: Dumbbell, text: (m) => <>завершил тренировку <span className="font-medium text-text">{m.title}</span></> },
  record:  { icon: Trophy,   text: (m) => <>новый рекорд в <span className="font-medium text-text">{m.exercise}</span> — <span className="font-medium text-text">{Math.round(Number(m.oneRm))} кг</span> ({Number(m.weight)}×{m.reps})</> },
  program: { icon: BookOpen, text: (m) => <>опубликовал программу <span className="font-medium text-text">{m.title}</span></> },
};

export const FeedList = ({ query }) => {
  if (query.isLoading) return <SkeletonList count={4} />;

  const items = query.data || [];

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
      {items.map((item) => {
        const cfg = CONFIG[item.type];
        if (!cfg) return null;
        const Icon = cfg.icon;

        return (
          <div
            key={`${item.type}-${item.id}`}
            className="flex items-start gap-3 rounded-2xl border border-border bg-surface p-3"
          >
            <Avatar name={item.author_name} src={item.author_avatar} size="sm" />

            <div className="min-w-0 flex-1">
              <p className="text-sm text-text-muted">
                <span className="font-medium text-text">{item.author_name}</span>{' '}
                {cfg.text(item.meta)}
              </p>
              <p className="mt-0.5 text-xs text-text-muted">
                {formatDistanceToNow(new Date(item.occurred_at), { locale: ru, addSuffix: true })}
              </p>
            </div>

            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
              <Icon size={16} />
            </div>
          </div>
        );
      })}
    </div>
  );
};