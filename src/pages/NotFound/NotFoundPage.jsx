import { Link } from 'react-router-dom';
import { Button } from '../../shared/ui/Button.jsx';
import { StoneSlope } from '../../shared/ui/StoneSlope.jsx';
import { GreekPatternBg } from '../../shared/ui/GreekPatternBg.tsx';

export const NotFoundPage = () => (
  <div className="relative isolate flex min-h-[100dvh] flex-col items-center justify-center gap-8 bg-bg px-6 text-center">
    <GreekPatternBg />

    <div className="relative flex flex-col items-center gap-6">
      <StoneSlope variant="rest" />

      <div className="flex max-w-sm flex-col items-center gap-2">
        <p className="font-display text-sm font-semibold uppercase tracking-[0.16em] text-text-muted">
          404
        </p>
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-text">
          Камень скатился
        </h1>
        <p className="text-sm text-text-muted">
          Такой страницы нет. Но подъём начинается заново — в этом вся суть.
        </p>
      </div>

      <Link to="/">
        <Button size="lg">К подножию</Button>
      </Link>
    </div>
  </div>
);