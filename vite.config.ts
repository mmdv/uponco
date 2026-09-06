import inertia from '@inertiajs/vite';
import { wayfinder } from '@laravel/vite-plugin-wayfinder';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { bunny } from 'laravel-vite-plugin/fonts';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
    server: {
        host: process.env.VITE_DEV_HOST ?? '0.0.0.0',
        hmr: {
            host: process.env.VITE_DEV_HOST ?? 'localhost',
        },
    },
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            refresh: true,
            fonts: [
                bunny('Instrument Sans', {
                    weights: [400, 500, 600],
                }),
            ],
        }),
        inertia(),
        react({
            babel: {
                plugins: ['babel-plugin-react-compiler'],
            },
        }),
        tailwindcss(),
        wayfinder({
            formVariants: true,
        }),
        // Offline support. injectManifest keeps our own service-worker source
        // (resources/js/sw.ts) — which still handles Web Push — while Workbox
        // injects the precache manifest of built assets into it.
        VitePWA({
            strategies: 'injectManifest',
            srcDir: 'resources/js',
            filename: 'sw.ts',
            // We register the worker ourselves (components/pwa-update-prompt) so
            // we can surface the "new version" toast, and we keep the existing
            // hand-written public/app.webmanifest.
            injectRegister: null,
            registerType: 'prompt',
            manifest: false,
            // The worker must control root navigations (/dashboard,
            // /appointments), so it is registered at the site root `/sw.js`
            // (root scope needs no `Service-Worker-Allowed` header) even though
            // the file itself is written under /build. `buildBase: '/'` sets
            // that registration URL; a Laravel route streams the built file at
            // `/sw.js` (see routes/web.php).
            scope: '/',
            buildBase: '/',
            injectManifest: {
                // Built JS/CSS/fonts only — never the mutable manifest.json.
                globPatterns: ['**/*.{js,css,woff,woff2}'],
                // Served from `/sw.js` at the root, so the precached asset URLs
                // must be absolute under /build rather than relative to the
                // worker's location.
                modifyURLPrefix: {
                    '': '/build/',
                },
            },
            // PWA/offline behaviour is a production concern; dev keeps today's
            // no-service-worker experience so HMR and Vite are untouched.
            devOptions: {
                enabled: false,
            },
        }),
    ],
});
