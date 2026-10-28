import { useState, useEffect } from 'react';
import { todayApi } from './date.js';

export const useToday = () => {
    const [day, setDay] = useState(todayApi);

    useEffect(() => {
        const check = () => setDay((prev) => (prev === todayApi() ? prev : todayApi()));

        document.addEventListener('visibilitychange', check);
        window.addEventListener('focus', check);
        const timer = setInterval(check, 60_000);

        return () => {
            document.removeEventListener('visibilitychange', check);
            window.removeEventListener('focus', check);
            clearInterval(timer);
        };
    }, []);

    return day;
};