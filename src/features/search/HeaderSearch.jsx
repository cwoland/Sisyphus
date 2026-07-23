import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, UserPlus, Dumbbell } from 'lucide-react';
import { useUserSearch, useFriendMutations } from '../../pages/Friends/friends.hooks.js';
import { usePublicPrograms } from '../../pages/Programs/programs.hooks.js';
import { Avatar } from '../../shared/ui/Avatar.jsx';

export const HeaderSearch = () => {
  const navigate = useNavigate();
  const boxRef = useRef(null);
  const [input, setInput] = useState('');
  const [term, setTerm] = useState('');
  const [open, setOpen] = useState(false);
  const { sendRequest } = useFriendMutations();

  useEffect(() => {
    const t = setTimeout(() => setTerm(input.trim()), 300);
    return () => clearTimeout(t);
  }, [input]);

  useEffect(() => {
    const onClick = (e) => { if (!boxRef.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const active = term.length >= 2;
  const usersQuery = useUserSearch(term);
  const programsQuery = usePublicPrograms(term, { enabled: active });

  const users = usersQuery.data || [];
  const programs = programsQuery.data || [];
  const empty = active && !usersQuery.isLoading && !programsQuery.isLoading
    && users.length === 0 && programs.length === 0;

  const openProgram = (id) => {
    setOpen(false); setInput('');
    navigate('/programs', { state: { programId: id } });
  };

  return (
    <div ref={boxRef} className="relative w-full max-w-xs">
      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
      <input
        value={input}
        onChange={(e) => { setInput(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        placeholder="Люди и программы"
        className="w-full rounded-xl border border-border bg-surface-2 py-2 pl-9 pr-3 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent"
      />

      {open && active && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-80 overflow-y-auto rounded-2xl border border-border bg-surface p-2 shadow-xl">
          {empty && <p className="p-3 text-center text-sm text-text-muted">Ничего не нашли</p>}

          {users.length > 0 && (
            <>
              <p className="px-2 pb-1 pt-1 text-xs font-medium text-text-muted">Люди</p>
              {users.map((u) => (
                <div key={u.id} className="flex items-center gap-2 rounded-xl p-2 hover:bg-surface-2">
                  <Avatar name={u.name} src={u.avatar_url} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-text">{u.name}</p>
                    <p className="truncate text-xs text-text-muted">@{u.username}</p>
                  </div>
                  <button
                    onClick={() => sendRequest.mutate(u.username)}
                    className="rounded-lg p-1.5 text-text-muted hover:text-accent"
                    aria-label="Добавить в друзья"
                  >
                    <UserPlus size={16} />
                  </button>
                </div>
              ))}
            </>
          )}

          {programs.length > 0 && (
            <>
              <p className="px-2 pb-1 pt-2 text-xs font-medium text-text-muted">Программы</p>
              {programs.map((p) => (
                <button
                  key={p.id}
                  onClick={() => openProgram(p.id)}
                  className="flex w-full items-center gap-2 rounded-xl p-2 text-left hover:bg-surface-2"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
                    <Dumbbell size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-text">{p.title}</p>
                    <p className="truncate text-xs text-text-muted">@{p.author_username}</p>
                  </div>
                </button>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
};