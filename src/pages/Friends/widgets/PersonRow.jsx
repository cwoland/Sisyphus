import { Avatar } from '../../../shared/ui/Avatar.jsx';

export const PersonRow = ({ name, username, avatar, children }) => 
(
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-3">
        <Avatar name={name} src={avatar} />
        <div className="min-w-0 flex-1">
            <p className="truncate text-xs text-text-muted">@{username}</p>
        </div>
        <div className="flex shrink-0 items-center gap-1">{children}</div>
    </div>
);