import { Sparkline } from '../../shared/ui/Sparkline.jsx';

export const WeightSparkline = ({ points, className }) => (
  <Sparkline points={points} className={className || 'h-14 w-full'} />
);
