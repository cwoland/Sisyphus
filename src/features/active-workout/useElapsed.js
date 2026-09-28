import { useState, useEffect } from 'react';

export const useElapsed = (startedAt) => {
    const [now, setNow] = useState(() => Date.now());

    useEffect(() => {
        if (!startedAt) return;
        const id = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(id);
    }, [startedAt]);

    if (!startedAt) return;
    const total = Math.max(0, Math.floor((now - new Date(startedAt).getTime()) / 1000));
    const h = Math.floor(total / 3600);
    const m = Math.floor((total / 3600) / 60);
    const s = total % 60;
    const mm = String(m).padStart(h ? 2 : 1, '0');
    return h ? `${h}:${mm}:${String(s).padStart(2, '0')}` : `${mm}:${String(s).padStart(2, '0')}`;
};