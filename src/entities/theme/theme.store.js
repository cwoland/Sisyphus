import { create } from 'zustand';

const MODES = ['light', 'dark', 'system'];
const prefersDark = () => window.matchMedia('(prefers-color-scheme: dark)').matches;
const resolve = (mode) => (mode === 'system' ? (prefersDark() ? 'dark' : 'light') : mode);
const apply = (theme) => document.documentElement.classList.toggle('dark', theme === 'dark');

const stored = localStorage.getItem('theme-mode');
const initialMode = MODES.includes(stored) ? stored : 'system';

export const useThemeStore = create((set, get) => ({
  mode: initialMode,
  theme: resolve(initialMode),

  setMode: (mode) => {
    localStorage.setItem('theme-mode', mode);
    const theme = resolve(mode);
    apply(theme);
    set({ mode, theme });
  },

  toggleTheme: () => get().setMode(get().theme === 'dark' ? 'light' : 'dark'),
}));

apply(resolve(initialMode));

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
  if (useThemeStore.getState().mode !== 'system') return;
  const theme = resolve('system');
  apply(theme);
  useThemeStore.setState({ theme });
});