import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: 'prompt',
            includeAssets: ['icons/*.png', 'favicon.ico'],
            devOptions: { enabled: false }, // desactivado en dev para evitar carga extra
            manifest: {
                name: 'MisSolucionesIA',
                short_name: 'MisSoluciones',
                description: 'Sistemas Inteligentes para Evolucionar tu Negocio',
                theme_color: '#6C63FF',
                background_color: '#0A0F2C',
                display: 'standalone',
                start_url: '/',
                orientation: 'portrait',
                icons: [
                    {
                        src: '/icons/icon-192.png',
                        sizes: '192x192',
                        type: 'image/png',
                    },
                    {
                        src: '/icons/icon-512.png',
                        sizes: '512x512',
                        type: 'image/png',
                    },
                    {
                        src: '/icons/icon-512.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'maskable',
                    },
                ],
            },
            workbox: {
                globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
                cleanupOutdatedCaches: true,
                runtimeCaching: [
                    {
                        urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'google-fonts-cache',
                            expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
                            cacheableResponse: { statuses: [0, 200] },
                        },
                    },
                ],
            },
        }),
    ],
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    // Vendors grandes separados → mejor cache del navegador entre versiones
                    'vendor-react':    ['react', 'react-dom', 'react-router-dom'],
                    'vendor-firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
                    'vendor-charts':   ['recharts'],
                    'vendor-motion':   ['framer-motion'],
                    'vendor-dnd':      ['@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities'],
                    'vendor-pdf':      ['jspdf'],
                    'vendor-gemini':   ['@google/generative-ai'],
                },
            },
        },
        // Aviso si algún chunk supera 400KB
        chunkSizeWarningLimit: 400,
        // Sin sourcemaps en producción (seguridad + tamaño)
        sourcemap: false,
    },
    define: {
        __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
    },
})
