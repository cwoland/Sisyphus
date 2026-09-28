import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js',
      registerType: 'prompt',
      injectRegister: null,

      manifest: {
        name: 'Sisyphus',
        short_name: 'Sisyphus',
        description: 'Твой камень ждёт тебя',
        theme_color: '#CD7044',
        background_color: '#CD7044',
        display: 'standalone',
        orientation: 'any',
        scope: '/',
        start_url: '/',
        shortcuts: [
          { name: 'Начать тренировку', short_name: 'Тренировка', url: '/calendar' },
          { name: 'Добавить приём пищи', short_name: 'Питание', url: '/nutrition' },
        ],
        icons: [
          { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          {
            src: '/pwa-maskable-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },

      injectManifest: {
        globPatterns: ['**/*.{js,css,html,svg,png,webp,woff2}'],
        globIgnores: ['art/*.png', 'art/scenes/*'],
      },

      devOptions: {
        enabled: false,
        type: 'module',
      },
    }),
  ],
});