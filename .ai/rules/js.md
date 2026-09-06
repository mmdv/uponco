---
paths:
  - 'resources/js/**'
  - resources/js/sw.ts
---

# Js

## Pin a subtree to light/dark with .theme-light / .theme-dark
To render a subtree in the opposite theme to the document (e.g. the brand preview showing the public booking page inside the dashboard), put `theme-light` or `theme-dark` on the wrapper — not `dark`.

Why: `@theme` declares the `--color-*` twins on `:root` as `var(--background)` etc. They resolve *there* and inherit down as already-computed colours, so re-declaring `--background` deeper in the tree never reaches `bg-background`. `.dark` only works because it sits on `<html>`, which is `:root`. The `.theme-*` classes in resources/css/app.css re-derive the twins on the same element, which is what makes a nested swap take. Same trap as `brandStyle()` in resources/js/lib/brand.ts.

Caveat: the `dark:` utility variant is `&:is(.dark *)`, so it still keys off an ancestor `.dark`. A pinned subtree must style with tokens (`bg-card`, `text-muted-foreground`), never `dark:` utilities.

## PWA service worker is served at /sw.js, not /build/sw.js
Offline support uses vite-plugin-pwa (injectManifest) with source at resources/js/sw.ts (keeps the Web Push handlers too). The built worker lands in public/build/sw.js but is registered at the site ROOT `/sw.js` so its scope covers /dashboard and /appointments. Achieved with VitePWA `buildBase: '/'` (registration URL) + `injectManifest.modifyURLPrefix: { '': '/build/' }` (absolute precache URLs), and a Laravel route `/sw.js` -> ServiceWorkerController@script that streams public/build/sw.js. Do NOT register it at /build/sw.js — that sub-path scope needs a `Service-Worker-Allowed: /` header, which `php artisan serve` won't send. Excluded from tsconfig (needs the WebWorker lib). Registration + the "new version" update toast live in components/pwa-update-prompt.tsx (useRegisterSW). Offline read-only writes are gated via hooks/use-offline-guard.ts.
