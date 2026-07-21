import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, Sparkles, Trash2 } from 'lucide-react';
import { clsx } from 'clsx';
import { useConversationMessages, useSendAiMessage } from '../ai.hooks.js';
import { Spinner } from '../../../shared/ui/Spinner.jsx';
import { contextLabel } from '../../../entities/ai/contextTypes.js';

export const AiConversation = ({ conversationId, onBack, onDelete }) => {
  const { data, isLoading } = useConversationMessages(conversationId);
  const sendMutation = useSendAiMessage(conversationId);
  const [text, setText] = useState('');
  const bottomRef = useRef(null);

  const messages = data?.messages || [];
  const conversation = data?.conversation;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || sendMutation.isPending) return;
    setText('');
    sendMutation.mutate(trimmed);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-border p-3">
        <button onClick={onBack} className="rounded-lg p-1.5 text-text-muted hover:bg-surface-2 hover:text-text lg:hidden" aria-label="Назад">
          <ArrowLeft size={20} />
        </button>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/10 text-accent">
          <Sparkles size={18} />
        </div>
        <div className="flex-1">
          <p className="font-medium text-text">AI-тренер</p>
          {conversation && (
            <p className="text-xs text-text-muted">{contextLabel(conversation.context_type)}</p>
          )}
        </div>
        <button onClick={() => onDelete(conversationId)} className="rounded-lg p-1.5 text-text-muted hover:text-crimson" aria-label="Удалить диалог">
          <Trash2 size={18} />
        </button>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4 no-scrollbar">
        {isLoading ? (
          <div className="flex justify-center py-8"><Spinner /></div>
        ) : messages.length === 0 ? (
          <div className="py-8 text-center">
            <Sparkles size={32} className="mx-auto mb-3 text-accent" />
            <p className="text-sm text-text-muted">
              Задайте вопрос оракулу — о технике, нагрузке или питании.
            </p>
          </div>
        ) : (
          messages.map((m) => <AiBubble key={m.id} message={m} />)
        )}
        <div ref={bottomRef} />
      </div>

      <div className="flex items-end gap-2 border-t border-border p-3 pad-safe-bottom">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
          }}
          rows={1}
          placeholder="Спросить AI-тренера..."
          disabled={sendMutation.isPending}
          className="max-h-32 flex-1 resize-none rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm text-text focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-60"
        />
        <button
          onClick={handleSend}
          disabled={!text.trim() || sendMutation.isPending}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent text-white transition-colors hover:bg-accent-hover disabled:opacity-50"
          aria-label="Отправить"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};

const AiBubble = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div className={clsx('flex', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={clsx(
          'max-w-[80%] rounded-2xl px-4 py-2.5 text-sm',
          isUser ? 'rounded-br-md bg-accent text-white' : 'rounded-bl-md bg-surface-2 text-text'
        )}
      >
        {message.isTyping ? (
          <TypingDots />
        ) : (
          <p className="whitespace-pre-wrap break-words leading-relaxed">{message.content}</p>
        )}
      </div>
    </div>
  );
};

const TypingDots = () => (
  <div className="flex gap-1 py-1">
    {[0, 1, 2].map((i) => (
      <span
        key={i}
        className="h-2 w-2 animate-bounce rounded-full bg-text-muted"
        style={{ animationDelay: `${i * 0.15}s` }}
      />
    ))}
  </div>
);