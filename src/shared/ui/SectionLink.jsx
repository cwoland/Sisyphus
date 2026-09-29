import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';

export const SectionLink = ({ to, children, onField = false, className }) => (
  <Link
    to={to}
    className={clsx(
      'inline-flex items-center gap-1 text-sm font-medium underline-offset-4 hover:underline',
      onField ? 'text-text' : 'text-terracotta-ink hover:text-text',
      className
    )}
  >
    {children}
    <ChevronRight size={16} />
  </Link>
);
