import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig(({ mode }) => {
  const isDev = mode === 'development';

  return {
    plugins: [
      react({
        // Enable Fast Refresh for development
        fastRefresh: true,
      }),

      VitePWA({
        registerType: 'prompt',
        includeAssets: ['favicon.ico', 'robots.txt'],
        manifest: {
          name: 'Playwright & Selenium Learning Platform',
          short_name: 'Test Automation Academy',
          description: 'Master Playwright and Selenium with spaced repetition',
          theme_color: '#4F46E5',
          background_color: '#ffffff',
          display: 'standalone',
          orientation: 'portrait',
          scope: '/',
          start_url: '/',
          icons: [
            {
              src: '/icon-192x192.png',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: '/icon-512x512.png',
              sizes: '512x512',
              type: 'image/png',
            }
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
          cleanupOutdatedCaches: true,
          skipWaiting: false,
          clientsClaim: true,
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365
                },
              }
            },
            {
              urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
              handler: 'CacheFirst',
              options: {
                cacheName: 'images-cache',
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 60 * 60 * 24 * 30
                },
              }
            },
            {
              urlPattern: /^https?:\/\/.*\/api\/.*/i,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'api-cache',
                networkTimeoutSeconds: 10,
                expiration: {
                  maxEntries: 150,
                  maxAgeSeconds: 60 * 60 * 24
                },
              }
            },
          ],
        },
        devOptions: {
          enabled: true,
          type: 'module',
        }
      })
    ],

    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      }
    },

    server: {
      port: 3000,
      hmr: {
        overlay: true
      },
      proxy: {
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true,
        },
        '/data': {
          target: 'http://localhost:3001',
          changeOrigin: true,
        },
      },
    },

    build: {
      target: 'es2020',
      minify: 'terser',
      sourcemap: false,
      cssCodeSplit: true,

      rollupOptions: {
        output: {
          manualChunks: (id) => {
            if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
              return 'react-core';
            }
            if (id.includes('node_modules/react-router-dom')) {
              return 'react-router';
            }
            if (id.includes('node_modules')) {
              return 'vendor';
            }
          },
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: (assetInfo) => {
            const name = assetInfo.name || '';
            if (/\.(png|jpe?g|svg|gif)$/i.test(name)) {
              return 'assets/images/[name]-[hash][extname]';
            }
            if (/\.css$/i.test(name)) {
              return 'assets/css/[name]-[hash][extname]';
            }
            return 'assets/[name]-[hash][extname]';
          }
        },
      },

      chunkSizeWarningLimit: 500,
    },

    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
      ],
    },

    css: {
      devSourcemap: isDev,
    },
  };
});
