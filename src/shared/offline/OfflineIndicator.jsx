import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from './useOfflineStatus.js';

export const OfflineIndicator = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed inset-x-0 top-0 z-[95] flex items-center justify-center gap-2 bg-alert py-1.5 text-center text-xs font-medium text-on-alert pad-safe-top">
      <WifiOff size={14} />
      Нет соединения — работаем офлайн
    </div>
  );
};