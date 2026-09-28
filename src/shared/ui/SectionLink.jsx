import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';

export const SectionLink = ({ to, children, onField = true, className }) => (
  <Link
    to={to}
    className={clsx(
      'inline-flex items-center gap-1 text-sm font-medium underline-offset-4 hover:underline',
      onField ? 'text-text' : 'text-accent hover:text-accent-hover',
      className
    )}
  >
    {children}
    <ChevronRight size={16} />
  </Link>
);
