import { useState, useEffect } from 'react';
import { Search, UserPlus, Check } from 'lucide-react';
import { useUserSearch, useFriendMutations } from '../../pages/Friends/friends.hooks.js';
import { Avatar } from '../../shared/ui/Avatar.jsx';
import { Button } from '../../shared/ui/Button.jsx';

export const AddFriendForm = ({ onDone }) => {
  const [input, setInput] = useState('');
  const [term, setTerm] = useState('');
  const [sentIds, setSentIds] = useState([]);
  const { sendRequest } = useFriendMutations();

  useEffect(() => {
    const t = setTimeout(() => setTerm(input.trim()), 300);
    return () => clearTimeout(t);
  }, [input]);

  const searchQuery = useUserSearch(term);
  const results = searchQuery.data || [];

  const handleAdd = (user) => {
    sendRequest.mutate(user.username, {
      onSuccess: () => setSentIds((ids) => [...ids, user.id]),
    });
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          autoFocus
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Введите никнейм"
          className="w-full rounded-xl border border-border bg-surface py-3 pl-10 pr-4 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent"
        />
      </div>

      {term.length < 2 ? (
        <p className="py-6 text-center text-sm text-text-muted">Введите минимум 2 символа</p>
      ) : searchQuery.isLoading ? (
        <p className="py-6 text-center text-sm text-text-muted">Ищем…</p>
      ) : results.length === 0 ? (
        <p className="py-6 text-center text-sm text-text-muted">Никого не нашли по «{term}»</p>
      ) : (
        <div className="space-y-2">
          {results.map((user) => {
            const sent = sentIds.includes(user.id);
            return (
              <div key={user.id} className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-3">
                <Avatar name={user.name} src={user.avatar_url} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-text">{user.name}</p>
                  <p className="truncate text-xs text-text-muted">@{user.username}</p>
                </div>
                <button
                  onClick={() => handleAdd(user)}
                  disabled={sent || sendRequest.isPending}
                  className="flex h-9 items-center gap-1 rounded-lg bg-accent px-3 text-sm text-white hover:bg-accent-hover disabled:opacity-60"
                >
                  {sent ? <><Check size={16} /> Отправлено</> : <><UserPlus size={16} /> Добавить</>}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {sentIds.length > 0 && (
        <Button variant="ghost" className="w-full" onClick={onDone}>Готово</Button>
      )}
    </div>
  );
};