export const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center text-center py-16 px-4">
    {Icon && (
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-2 text-text-muted">
        <Icon size={32} strokeWidth={1.5} />
      </div>
    )}
    <h3 className="font-display text-lg font-semibold text-text">{title}</h3>
    {description && <p className="mt-1 max-w-sm text-sm text-text-muted">{description}</p>}
    {action && <div className="mt-6">{action}</div>}
  </div>
);