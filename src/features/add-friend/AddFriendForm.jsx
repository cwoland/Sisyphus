import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { Button } from '../../shared/ui/Button.jsx';
import { useFriendMutations } from '../../pages/Friends/friends.hooks.js';

export const AddFriendForm = ({ onDone }) => {
  const [email, setEmail] = useState('');
  const { sendRequest } = useFriendMutations();

  const submit = () => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) return;
    sendRequest.mutate(trimmed, {
      onSuccess: () => { setEmail(''); onDone?.(); },
    });
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-text-muted">
        Введите email друга — вместе катить камень веселее.
      </p>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && submit()}
        placeholder="friend@example.com"
        className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text focus:outline-none focus:ring-2 focus:ring-accent"
      />
      <Button className="w-full" onClick={submit} isLoading={sendRequest.isPending}>
        <UserPlus size={18} /> Отправить заявку
      </Button>
    </div>
  );
};