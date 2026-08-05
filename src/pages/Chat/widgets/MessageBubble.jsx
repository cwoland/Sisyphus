import { clsx } from 'clsx';
import { safeFormat } from '../../../shared/lib/date.js';
import { MessageStatus } from './MessageStatus.jsx';

export const MessageBubble = ({ message, isOwn }) => (
  <div className={clsx('flex', isOwn ? 'justify-end' : 'justify-start')}>
    <div
      className={clsx(
        'max-w-[75%] rounded-2xl px-3.5 py-2 text-sm',
        isOwn ? 'rounded-br-md bg-accent text-white' : 'rounded-bl-md bg-surface-2 text-text'
      )}
    >
      <p className="whitespace-pre-wrap break-words">{message.text}</p>
      <div className={clsx('mt-1 flex items-center justify-end gap-1', isOwn ? 'text-white/70' : 'text-text-muted')}>
        <span className="text-[10px]">{safeFormat(message.created_at, 'HH:mm')}</span>
        <MessageStatus message={message} isOwn={isOwn} />
      </div>
    </div>
  </div>
);