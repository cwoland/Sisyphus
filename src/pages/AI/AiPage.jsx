import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Sparkles } from 'lucide-react';
import { clsx } from 'clsx';
import { ru } from 'date-fns/locale';
import { safeDistanceToNow } from '../../shared/lib/date.js';

import { useConversations, useCreateConversation, useDeleteConversation } from './ai.hooks.js';
import { AiConversation } from './widgets/AiConversation.jsx';
import { NewConversationDialog } from './widgets/NewConversationDialog.jsx';
import { SplitPane } from '../../shared/ui/SplitPane.jsx';
import { Button } from '../../shared/ui/Button.jsx';
import { EmptyState } from '../../shared/ui/EmptyState.jsx';
import { SkeletonList } from '../../shared/ui/Skeleton.jsx';
import { emptyStates } from '../../shared/lib/sisyphusPhrases.js';
import { contextIcon, contextLabel } from '../../entities/ai/ContextTypes.js';

export const AiPage = () => {
  const [params, setParams] = useSearchParams();
  const activeId = params.get('c');

  const conversationsQuery = useConversations();
  const createMutation = useCreateConversation();
  const deleteMutation = useDeleteConversation();
  const [newOpen, setNewOpen] = useState(false);

  const conversations = conversationsQuery.data || [];
  const exists = conversations.some((c) => c.id === activeId);

  const open = (id) => setParams({ c: id });
  const close = () => setParams({}, { replace: true });

  const handleCreate = (payload) => {
    createMutation.mutate(payload, {
      onSuccess: (conv) => { setNewOpen(false); open(conv.id); },
    });
  };

  const handleDelete = (id) => {
    deleteMutation.mutate(id, {
      onSuccess: () => { if (activeId === id) close(); },
    });
  };

  const list = (
    <>
      <div className="mb-4 flex items-center justify-between gap-2">
        <h1 className="font-display text-2xl font-bold text-text">ИИ-тренер</h1>
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
        <ul className="space-y-1.5">
          {conversations.map((conv) => {
            const Icon = contextIcon(conv.context_type);
            return (
              <li key={conv.id}>
                <button
                  onClick={() => open(conv.id)}
                  className={clsx(
                    'flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition-colors',
                    conv.id === activeId
                      ? 'border-accent bg-accent/5'
                      : 'border-border bg-surface hover:bg-surface-2'
                  )}
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-terracotta/15 text-terracotta-ink">
                    <Icon size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-text">
                      {conv.title || contextLabel(conv.context_type)}
                    </p>
                    <p className="truncate text-xs text-text-muted">
                      {safeDistanceToNow(conv.created_at, { locale: ru, addSuffix: true })}
                    </p>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );

  const detail = exists ? (
    <AiConversation
      key={activeId}
      conversationId={activeId}
      onBack={close}
      onDelete={handleDelete}
    />
  ) : conversationsQuery.isLoading ? (
    <div className="flex h-full items-center justify-center p-6">
      <SkeletonList count={2} />
    </div>
  ) : (
    <div className="flex h-full items-center justify-center p-6">
      <EmptyState
        icon={Sparkles}
        title="Диалог не найден"
        description="Возможно, он был удалён."
        action={<Button variant="secondary" onClick={close}>К списку</Button>}
      />
    </div>
  );

  return (
    <>
      <SplitPane
        isDetailOpen={Boolean(activeId)}
        list={list}
        detail={detail}
        placeholder={
          <EmptyState
            icon={Sparkles}
            title="Выберите диалог"
            description="Или начните новый — оракул готов."
          />
        }
      />

      <NewConversationDialog
        isOpen={newOpen}
        onClose={() => setNewOpen(false)}
        onCreate={handleCreate}
        isCreating={createMutation.isPending}
      />
    </>
  );
};