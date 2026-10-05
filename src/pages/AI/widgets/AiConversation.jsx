import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, Sparkles, Trash2 } from 'lucide-react';
import { clsx } from 'clsx';
import { useConversationMessages, useSendAiMessage } from '../ai.hooks.js';
import { Spinner } from '../../../shared/ui/Spinner.jsx';
import { IconButton } from '../../../shared/ui/IconButton.jsx';
import { contextLabel } from '../../../entities/ai/ContextTypes.js';

export const AiConversation = ({ conversationId, onBack, onDelete }) => {
  const { data, isLoading } = useConversationMessages(conversationId);
  const sendMutation = useSendAiMessage(conversationId);
  const [text, setText] = useState('');
  const bottomRef = useRef(null);
  const settled = useRef(false);

  const messages = data?.messages || [];
  const conversation = data?.conversation;

  useEffect(() => {
    if (!messages.length) return;
    // Первая прокрутка — мгновенная: плавная пролистывала бы всю историю.
    bottomRef.current?.scrollIntoView({ behavior: settled.current ? 'smooth' : 'auto' });
    settled.current = true;
  }, [messages.length]);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || sendMutation.isPending) return;
    setText('');
    sendMutation.mutate(trimmed);
  };

  const handleDelete = () => {
    if (window.confirm('Удалить диалог? Переписка не восстановится.')) onDelete(conversationId);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex shrink-0 items-center gap-3 border-b border-border p-3">
        <IconButton
          icon={ArrowLeft} size={20} onClick={onBack}
          className="text-text-muted hover:bg-surface-2 hover:text-text lg:hidden"
          aria-label="К списку диалогов"
        />

        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-terracotta/15 text-terracotta-ink">
          <Sparkles size={18} />
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-text">ИИ-тренер</p>
          {conversation && (
            <p className="truncate text-xs text-text-muted">
              {contextLabel(conversation.context_type)}
            </p>
          )}
        </div>

        <IconButton
          icon={Trash2} size={18}
          onClick={handleDelete}
          className="text-text-muted hover:text-danger"
          aria-label="Удалить диалог"
        />
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto overscroll-contain p-4 no-scrollbar">
        {isLoading ? (
          <div className="flex justify-center py-8"><Spinner /></div>
        ) : messages.length === 0 ? (
          <div className="py-8 text-center">
            <Sparkles size={32} className="mx-auto mb-3 text-terracotta-ink" />
            <p className="mx-auto max-w-xs text-sm text-text-muted">
              Задайте вопрос оракулу — о технике, нагрузке или питании.
            </p>
          </div>
        ) : (
          messages.map((m) => <AiBubble key={m.id} message={m} />)
        )}
        <div ref={bottomRef} />
      </div>

      <div className="flex shrink-0 items-end gap-2 border-t border-border p-3">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
          }}
          rows={1}
          placeholder="Спросить ИИ-тренера…"
          aria-label="Вопрос ИИ-тренеру"
          disabled={sendMutation.isPending}
          className="max-h-32 flex-1 resize-none rounded-xl border border-border-strong bg-surface px-3.5 py-2.5 text-sm text-text transition-colors focus:border-accent focus:outline-none disabled:opacity-60"
        />
        <button
          onClick={handleSend}
          disabled={!text.trim() || sendMutation.isPending}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent text-on-accent transition-colors hover:bg-accent-hover disabled:opacity-50"
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
          'max-w-[80%] rounded-2xl px-4 py-2.5 text-sm shadow-sm',
          isUser ? 'rounded-br-md bg-accent text-on-accent' : 'rounded-bl-md bg-surface-2 text-text'
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
  <div className="flex gap-1 py-1" role="status" aria-label="Оракул печатает">
    {[0, 1, 2].map((i) => (
      <span
        key={i}
        className="h-1.5 w-1.5 animate-typing rounded-full bg-text-muted"
        style={{ animationDelay: `${i * 0.18}s` }}
      />
    ))}
  </div>
);