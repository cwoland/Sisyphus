import { GreekPatternBg } from '../../shared/ui/GreekPatternBg.tsx';

export const AuthLayout = ({ title, subtitle, children, footer }) => (
  <div className="relative isolate min-h-[100dvh] overflow-hidden bg-bg">
    <GreekPatternBg />

    <img
      src="/art/scenes/login-page-light.webp"
      alt="" aria-hidden="true" draggable="false"
      width={667} height={1000} decoding="async"
      className="auth-figure auth-figure-light"
    />
    <img
      src="/art/scenes/login-page-dark.webp"
      alt="" aria-hidden="true" draggable="false"
      width={667} height={1000} decoding="async"
      className="auth-figure auth-figure-dark"
    />

    <div className="relative z-10 flex min-h-[100dvh] items-center px-5 py-10 pad-safe-top pad-safe-bottom sm:px-8 lg:px-16 xl:px-24">
      <div className="w-full max-w-[27rem] rounded-2xl border border-border bg-surface/90 p-6 shadow-[0_18px_50px_-12px_rgb(26_24_22/0.22)] backdrop-blur-sm sm:p-8">
        <span className="block font-logo text-4xl leading-none tracking-wide text-text sm:text-5xl">
          SISYPHUS
        </span>

        <h1 className="mt-7 font-display text-2xl font-extrabold leading-tight tracking-tight text-text sm:text-3xl">
          {title}
        </h1>
        {subtitle && <p className="mt-2 text-sm text-text-muted">{subtitle}</p>}

        <div className="mt-7">{children}</div>

        {footer && <div className="mt-7 text-sm text-text-muted">{footer}</div>}
      </div>
    </div>
  </div>
);
