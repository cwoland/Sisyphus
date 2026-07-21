import { create } from 'zustand';

const STORAGE_KEY = 'sisyphus-theme';

const getInitialTheme = () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const applyTheme = (theme) => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
};

export const useThemeStore = create((set, get) => ({
    theme: 'light',
    isSystemPreference: !localStorage.getItem(STORAGE_KEY),

    initTheme: () => {
        const theme = getInitialTheme();
        applyTheme(theme);
        set({ theme });

        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (get().isSystemPreference) {
                const next = e.matches ? 'dark' : 'light';
                applyTheme(next);
                set({ theme: next });
            }
        });
    },

    toggleTheme: () => {
        const next = get().theme === 'dark' ? 'light' : 'dark';
        localStorage.setItem(STORAGE_KEY, next);
        applyTheme(next);
        set({ theme: next, isSystemPreference: false });
    },
}));