export const inputVariants = {
  box: [
    'w-full rounded-xl border bg-surface px-4 py-3 text-sm text-text placeholder:text-text-muted transition-colors',
    'focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1 focus:ring-offset-bg',
  ].join(' '),
  rule: [
    'w-full rounded-none border-0 border-b-2 bg-transparent px-0 py-2.5 text-base text-text',
    'placeholder:text-text-muted transition-colors',
    'focus:outline-none focus:border-accent',
  ].join(' '),
  soft: [
    'w-full rounded-2xl border bg-surface/70 px-4 py-3.5 text-base text-text backdrop-blur-sm',
    'placeholder:text-text-muted transition-colors',
    'focus:outline-none focus:border-cta focus:bg-surface',
  ].join(' '),
};

export const labelVariants = {
  box: 'block text-sm font-medium text-text',
  rule: 'block text-xs font-semibold uppercase tracking-[0.14em] text-text-muted',
  soft: 'block text-xs font-semibold uppercase tracking-[0.14em] text-text-muted',
};

export const fieldSpacing = {
  box: 'space-y-1.5',
  rule: 'space-y-2',
  soft: 'space-y-2',
};

export const idleBorder = {
  box: 'border-border-strong',
  rule: 'border-border-strong',
  soft: 'border-border-strong',
};