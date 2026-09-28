export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: 'rgb(var(--bg) / <alpha-value>)',
        surface: 'rgb(var(--surface) / <alpha-value>)',
        'surface-2': 'rgb(var(--surface-2) / <alpha-value>)',
        border: 'rgb(var(--border) / <alpha-value>)',
        'border-strong': 'rgb(var(--border-strong) / <alpha-value>)',
        text: 'rgb(var(--text) / <alpha-value>)',
        'text-muted': 'rgb(var(--text-muted) / <alpha-value>)',
        accent: 'rgb(var(--accent) / <alpha-value>)',
        'accent-hover': 'rgb(var(--accent-hover) / <alpha-value>)',
        'on-accent': 'rgb(var(--on-accent) / <alpha-value>)',
        terracotta: 'rgb(var(--terracotta) / <alpha-value>)',
        'terracotta-ink': 'rgb(var(--terracotta-ink) / <alpha-value>)',
        gold: 'rgb(var(--gold) / <alpha-value>)',
        'gold-ink': 'rgb(var(--gold-ink) / <alpha-value>)',
        'on-gold': 'rgb(var(--on-gold) / <alpha-value>)',
        danger: 'rgb(var(--danger) / <alpha-value>)',
        'on-danger': 'rgb(var(--on-danger) / <alpha-value>)',
        alert: 'rgb(var(--alert) / <alpha-value>)',
        'on-alert': 'rgb(var(--on-alert) / <alpha-value>)',
        crimson: 'rgb(var(--danger) / <alpha-value>)',
        'on-crimson': 'rgb(var(--on-danger) / <alpha-value>)',
        burgundy: 'rgb(var(--danger) / <alpha-value>)',

        rail: 'rgb(var(--rail) / <alpha-value>)',
        'rail-hover': 'rgb(var(--rail-hover) / <alpha-value>)',
        'rail-ink': 'rgb(var(--rail-ink) / <alpha-value>)',
        'rail-ink-muted': 'rgb(var(--rail-ink-muted) / <alpha-value>)',
        'rail-mark': 'rgb(var(--rail-mark) / <alpha-value>)',
        'rail-edge': 'rgb(var(--rail-edge) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['Archivo', 'system-ui', 'sans-serif'],
        display: ['Archivo', 'system-ui', 'sans-serif'],
        logo: ['Skaldheim', 'Archivo', 'serif'],
      },
      spacing: {
        'safe-top':    'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left':   'env(safe-area-inset-left)',
        'safe-right':  'env(safe-area-inset-right)',
      },
      maxWidth: {
        app: '1400px',
      },
      screens: {
        xs: '400px',
      },
      keyframes: {
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        'toast-in': {
          from: { opacity: '0', transform: 'translateX(100%)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%, 60%': { transform: 'translateX(-8px)' },
          '40%, 80%': { transform: 'translateX(8px)' },
        },
        'loading-bar': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(400%)' },
        },
      },
      animation: {
        shimmer:       'shimmer 1.5s infinite',
        'toast-in':    'toast-in 0.3s ease-out',
        'fade-in':     'fade-in 0.2s ease-out',
        'shake':       'shake 0.4s ease-in-out',
        'loading-bar': 'loading-bar 1.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};