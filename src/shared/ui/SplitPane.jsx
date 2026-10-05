import { clsx } from "clsx";

export const SplitPane = ({ isDetailOpen, list, detail, placeholder }) => (
    <div className="lg:grid lg:grid-cols-[clamp(260px,28vw,340px)_1fr] lg:gap-6">
        <div className={clsx('min-w-0', isDetailOpen && 'hidden lg:block')}>{list}</div>

        <div className={clsx('min-w-0', !isDetailOpen && 'hidden lg:block')}>
            <div className="pane-h overflow-hidden rounded-2xl border border-border bg-surface">
                {isDetailOpen ? detail : (
                    <div className="flex h-full items-center justify-center">{placeholder}</div>
                )}
            </div>
        </div>
    </div>
);