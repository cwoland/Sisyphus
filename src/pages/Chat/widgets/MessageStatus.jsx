import { Check, CheckCheck } from 'lucide-react';

export const MessageStatus = ({ message, isOwn }) => {
  if (!isOwn) return null;

  const isPending = String(message.id).startsWith('temp-');

  if (isPending) {
    return <Check size={13} className="text-on-accent/40" />;
  }

  return message.read_at
    ? <CheckCheck size={13} className="text-on-accent/90" />
    : <Check size={13} className="text-on-accent/70" />;
};