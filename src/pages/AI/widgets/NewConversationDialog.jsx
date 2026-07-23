import { useState } from 'react';
import { clsx } from 'clsx';
import { Sheet } from '../../../shared/ui/Sheet.jsx';
import { Button } from '../../../shared/ui/Button.jsx';
import { contextTypes } from '../../../entities/ai/ContextTypes.js';
import { usePrograms } from '../../Programs/programs.hooks.js';

export const NewConversationDialog = ({ isOpen, onClose, onCreate, isCreating }) => {
  const [contextType, setContextType] = useState('free');
  const [contextId, setContextId] = useState(null);
  const programsQuery = usePrograms();

  const needsProgram = contextType === 'program';

  const handleCreate = () => {
    console.log('handleCreate done', { contextType, contextId });
    onCreate({
      contextType,
      contextId: needsProgram ? contextId : undefined,
      title: contextTypes.find((c) => c.value === contextType)?.label,
    });
  };

  const canCreate = !needsProgram || !!contextId;

  return (
    <Sheet isOpen={isOpen} onClose={onClose} title="Новый диалог с AI-тренером">
      <div className="space-y-4">
        <div>
          <p className="mb-2 text-sm font-medium text-text">Тема</p>
          <div className="grid grid-cols-2 gap-2">
            {contextTypes.map((c) => {
              const Icon = c.icon;
              return (
                <button
                  key={c.value}
                  onClick={() => { setContextType(c.value); setContextId(null); }}
                  className={clsx(
                    'flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition-colors',
                    contextType === c.value ? 'border-accent bg-accent/10' : 'border-border hover:bg-surface-2'
                  )}
                >
                  <Icon size={20} className={contextType === c.value ? 'text-accent' : 'text-text-muted'} />
                  <span className="text-sm font-medium text-text">{c.label}</span>
                  <span className="text-xs text-text-muted">{c.description}</span>
                </button>
              );
            })}
          </div>
        </div>

        {needsProgram && (
          <div>
            <p className="mb-2 text-sm font-medium text-text">Выберите программу</p>
            {programsQuery.isLoading ? (
              <p className="text-sm text-text-muted">Загрузка...</p>
            ) : programsQuery.data?.length === 0 ? (
              <p className="text-sm text-text-muted">У вас пока нет программ.</p>
            ) : (
              <div className="space-y-1.5">
                {programsQuery.data.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setContextId(p.id)}
                    className={clsx(
                      'w-full rounded-xl border p-3 text-left text-sm transition-colors',
                      contextId === p.id ? 'border-accent bg-accent/10 text-text' : 'border-border text-text-muted hover:bg-surface-2'
                    )}
                  >
                    {p.title}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <Button className="w-full" onClick={handleCreate} isLoading={isCreating} disabled={!canCreate}>
          Начать диалог
        </Button>
      </div>
    </Sheet>
  );
};