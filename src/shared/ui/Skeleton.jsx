import { clsx } from 'clsx';

export const Skeleton = ({ className }) => (
  <div className={clsx('relative overflow-hidden rounded-lg bg-surface-2', className)}>
    <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent" />
  </div>
);

export const SkeletonCard = () => (
  <div className="rounded-2xl border border-border bg-surface p-4 space-y-3">
    <Skeleton className="h-5 w-1/2" />
    <Skeleton className="h-4 w-3/4" />
    <Skeleton className="h-4 w-2/3" />
  </div>
);

export const SkeletonList = ({ count = 4 }) => (
  <div className="space-y-3">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);