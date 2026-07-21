import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { Button } from '../../shared/ui/Button.jsx';

export const NotFoundPage = () => (
  <div className="flex min-h-[100dvh] flex-col items-center justify-center px-4 text-center">
    <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-surface-2 text-accent">
      <Compass size={40} strokeWidth={1.5} />
    </div>
    <p className="font-display text-6xl font-bold text-accent">404</p>
    <h1 className="mt-2 font-display text-xl font-semibold text-text">Страница не найдена</h1>
    <p className="mt-1 max-w-sm text-sm text-text-muted">
      Похоже, этот камень укатился слишком далеко. Вернёмся к началу подъёма.
    </p>
    <Link to="/" className="mt-6">
      <Button>На главную</Button>
    </Link>
  </div>
);