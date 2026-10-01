import { clsx } from "clsx";

export const SettingsRow = ({ icon: Icon, label, hint, action, onClick, as = 'button' }) => {
    const body = (
        <>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface-2 text-text">
                <Icon size={18} />
            </div>
            <div className="min-w-0 flex-1 text-left">
                <p className="truncate text-sm font-medium text-text">{label}</p>
                {hint && <p className="truncate text-xs text-text-muted">{hint}</p>}
            </div>
            {action}
        </>
    );

    const className = clsx(
        'flex w-full min-h-[60px] items-center gap-3 px-4 py-3', onClick && 'transition-colors hover:bg-surface-2'
    );

    if (as === 'div' || !onClick) {
        return <div className={className}>{body}</div>;
    }

    return (
        <button type="button" onClick={onClick} className={className}>
            {body}
        </button>
    );
};