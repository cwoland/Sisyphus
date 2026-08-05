import { useState } from 'react';
import { Plus, Sparkles } from 'lucide-react';
import { clsx } from 'clsx';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

import { useConversations, useCreateConversation, useDeleteConversation } from './ai.hooks.js';
import { AiConversation } from './widgets/AiConversation.jsx';
import { NewConversationDialog } from './widgets/NewConversationDialog.jsx';
import { Button } from '../../shared/ui/Button.jsx';
import { EmptyState } from '../../shared/ui/EmptyState.jsx';
import { SkeletonList } from '../../shared/ui/Skeleton.jsx';
import { emptyStates } from '../../shared/lib/sisyphusPhrases.js';
import { contextIcon, contextLabel } from '../../entities/ai/ContextTypes.js';

export const AiPage = () => {
  const conversationsQuery = useConversations();
  const createMutation = useCreateConversation();
  const deleteMutation = useDeleteConversation();

  const [activeId, setActiveId] = useState(null);
  const [newOpen, setNewOpen] = useState(false);

  const conversations = conversationsQuery.data || [];

  const handleCreate = (payload) => {
    createMutation.mutate(payload, {
      onSuccess: (conv) => { setNewOpen(false); setActiveId(conv.id); },
    });
  };

  const handleDelete = (id) => {
    deleteMutation.mutate(id, {
      onSuccess: () => { if (activeId === id) setActiveId(null); },
    });
  };

  return (
    <div className="lg:grid lg:grid-cols-[320px,1fr] lg:gap-6">
      <div className={clsx('lg:block', activeId && 'hidden')}>
        <div className="mb-4 flex items-center justify-between">
          <h1 className="font-display text-2xl font-bold text-text">AI-тренер</h1>
          <Button size="sm" onClick={() => setNewOpen(true)}>
            <Plus size={18} /> Диалог
          </Button>
        </div>

        {conversationsQuery.isLoading ? (
          <SkeletonList count={4} />
        ) : conversations.length === 0 ? (
          <div className="rounded-2xl border border-border bg-surface">
            <EmptyState
              icon={Sparkles}
              {...emptyStates.ai}
              action={<Button onClick={() => setNewOpen(true)}><Plus size={18} /> Начать диалог</Button>}
            />
          </div>
        ) : (
          <div className="space-y-1.5">
            {conversations.map((conv) => {
              const Icon = contextIcon(conv.context_type);
              return (
                <button
                  key={conv.id}
                  onClick={() => setActiveId(conv.id)}
                  className={clsx(
                    'flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition-colors',
                    conv.id === activeId ? 'border-accent bg-accent/5' : 'border-border bg-surface hover:bg-surface-2'
                  )}
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
                    <Icon size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-text">{conv.title || contextLabel(conv.context_type)}</p>
                    <p className="text-xs text-text-muted">
                      {safeDistanceToNow(conv.created_at, { locale: ru, addSuffix: true })}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className={clsx('lg:block', !activeId && 'hidden')}>
        {activeId ? (
          <div className="h-[calc(100dvh-8rem)] overflow-hidden rounded-2xl border border-border bg-surface lg:h-[calc(100dvh-6rem)]">
            <AiConversation
              conversationId={activeId}
              onBack={() => setActiveId(null)}
              onDelete={handleDelete}
            />
          </div>
        ) : (
          <div className="hidden h-full items-center justify-center rounded-2xl border border-border bg-surface lg:flex">
            <EmptyState icon={Sparkles} title="Выберите диалог" description="Или начните новый — оракул готов." />
          </div>
        )}
      </div>
      <NewConversationDialog
      isOpen={newOpen}
      onClose={() => setNewOpen(false)}
      onCreate={handleCreate}
      isCreating={createMutation.isPending}
      />
    </div>
  );
};