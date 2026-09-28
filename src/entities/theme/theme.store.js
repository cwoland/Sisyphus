import { create } from 'zustand';

const MODES = ['light', 'dark', 'system'];
const prefersDark = () => window.matchMedia('(prefers-color-scheme: dark)').matches;
const resolve = (mode) => (mode === 'system' ? (prefersDark() ? 'dark' : 'light') : mode);
const THEME_COLOR = { light: '#D2D5DC', dark: '#121622' };

const apply = (theme) => {
  document.documentElement.classList.toggle('dark', theme === 'dark');
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLOR[theme]);
};

const readStoredMode = () => {
  try {
    return localStorage.getItem('theme-mode');
  } catch {
    return null;
  }
};

const writeStoredMode = (mode) => {
  try {
    localStorage.setItem('theme-mode', mode);
    return true;
  } catch {
    return false;
  }
};

const stored = readStoredMode();
const initialMode = MODES.includes(stored) ? stored : 'system';

export const useThemeStore = create((set, get) => ({
  mode: initialMode,
  theme: resolve(initialMode),

  setMode: (mode) => {
    writeStoredMode(mode);
    const theme = resolve(mode);
    apply(theme);
    set({ mode, theme });
  },

  toggleTheme: () => get().setMode(get().theme === 'dark' ? 'light' : 'dark'),
  initTheme: () => get().setMode(get().mode),
}));

apply(resolve(initialMode));

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
  if (useThemeStore.getState().mode !== 'system') return;
  const theme = resolve('system');
  apply(theme);
  useThemeStore.setState({ theme });
});

export const initTheme = () => {
  const { mode } = useThemeStore.getState();
  const theme = resolve(mode);
  apply(theme);
  useThemeStore.setState({ theme });
};