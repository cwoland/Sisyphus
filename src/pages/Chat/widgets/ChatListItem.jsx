import { clsx } from "clsx";
import { ru } from "date-fns/locale";
import { Avatar } from '../../../shared/ui/Avatar.jsx';
import { safeFormat, safeDate } from '../../../shared/lib/date.js';

const stamp = (value) => {
    const d = safeDate(value);
    if (!d) return '';
    const sameDay = new Date().toDateString() === d.toDateString();
    return safeFormat(value, sameDay ? 'HH:mm' : 'd MMM', { locale: ru });
};

export const ChatListItem = ({ chat, isActive, onSelect }) => {
    const unread = Number(chat.unread_count) || 0;

    return (
        <li>
            <button
                onClick={() => onSelect(chat.chat_id)}
                className={clsx(
                    'flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition-colors',
                        isActive
                            ? 'border-accent bg-accent/5'
                            : 'border-border bg-surface hover:bg-surface-2'
                )}
            >
                <Avatar name={chat.friend_name} src={chat.friend_avatar} />

                <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                        <p className="min-w-0 flex-1 truncate font-medium text-text">{chat.friend_name}</p>
                        <span className="shrink-0 text-[11px] tabular-nums text-text-muted">
                            {stamp(chat.last_message_at)}
                        </span>
                    </div>

                    <div className="mt-0.5 flex items-center gap-2">
                        <p className={clsx('min-w-0 flex-1 truncate text-xs', unread > 0 ? 'text-text' : 'text-text-muted')}>
                            {chat.last_message_text || 'Нет сообщений'}
                        </p>
                        {unread > 0 && (
                            <span
                                className="flex h-5 min-w-[1.25rem] shrink-0 items-center justify-center rounded-full bg-cta px-1 text-[11px] font-bold tabular-nums text-on-cta"
                                aria-label={`Непрочитанных: ${unread}`}
                            >
                                {unread}
                            </span>
                        )}
                    </div>
                </div>
            </button>
        </li>
    );
};