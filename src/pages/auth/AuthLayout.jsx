import { Logo } from '../../shared/ui/Logo.jsx';

export const AuthLayout = ({ title, subtitle, children, footer }) => (
  <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-bg px-4 pad-safe-top pad-safe-bottom">
    <div className="w-full max-w-sm">
      <div className="mb-8 flex justify-center">
        <Logo size="lg" />
      </div>

      <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-8">
        <h1 className="font-display text-xl font-bold text-text">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-text-muted">{subtitle}</p>}

        <div className="mt-6">{children}</div>
      </div>

      {footer && <div className="mt-6 text-center text-sm text-text-muted">{footer}</div>}
    </div>
  </div>
);