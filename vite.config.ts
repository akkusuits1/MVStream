import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
  const isAdmin = mode === 'admin';

  return {
    root: '.',
    base: './',
    publicDir: 'public',
    build: {
      outDir: isAdmin ? 'dist-admin' : 'dist',
      emptyOutDir: true,
      sourcemap: true,
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, isAdmin ? 'admin.html' : 'index.html'),
        },
        external: ['@rollup/rollup-android-arm64'],
      },
    },
    optimizeDeps: {
      exclude: ['@rollup/rollup-android-arm64'],
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
        '@components': path.resolve(__dirname, 'src/components'),
        '@pages': path.resolve(__dirname, 'src/pages'),
        '@admin': path.resolve(__dirname, 'src/admin'),
        '@core': path.resolve(__dirname, 'src/core'),
        '@services': path.resolve(__dirname, 'src/services'),
        '@styles': path.resolve(__dirname, 'src/styles'),
        '@types': path.resolve(__dirname, 'src/types'),
        '@hooks': path.resolve(__dirname, 'src/hooks'),
        '@utils': path.resolve(__dirname, 'src/utils'),
      },
    },
    server: {
      port: 3000,
      open: !isAdmin,
      cors: true,
    },
    plugins: [
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
        manifest: {
          name: 'MVStream',
          short_name: 'MVStream',
          description: 'Watch Movies & Series Online',
          theme_color: '#0A0A0A',
          background_color: '#0A0A0A',
          display: 'standalone',
          orientation: 'portrait-primary',
          scope: '/',
          start_url: '/',
          icons: [
            {
              src: 'pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any maskable',
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'gstatic-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /^https:\/\/image\.tmdb\.org\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'tmdb-images-cache',
                expiration: {
                  maxEntries: 500,
                  maxAgeSeconds: 60 * 60 * 24 * 30,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /^https:\/\/.*\.firebasedatabase\.app\/.*/i,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'firebase-api-cache',
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 60 * 60 * 24,
                },
                networkTimeoutSeconds: 10,
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
          ],
        },
      }),
    ],
    css: {
      devSourcemap: true,
    },
    esbuild: {
      treeShaking: true,
      legalComments: 'none',
    },
  };
});