#!/usr/bin/env node
// Stages the app's COMPILED stylesheets for the design-sync converter.
//
// `resources/css/app.css` is Tailwind v4 source — it opens with
// `@import "tailwindcss"`, which the converter can't resolve, so pointing
// cfg.cssEntry at it ships a stylesheet that defines nothing. The real
// stylesheet only exists after `npm run build`, under a content-hashed name
// that changes every build. This copies the current build to stable paths the
// config can name, and rewrites the font css's absolute `/build/assets/…`
// urls to paths relative to the staged copy so the woff2/woff files can be
// found and shipped.
//
// Usage: npm run build && node .design-sync/prepare-css.mjs

import { copyFileSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ASSETS = 'public/build/assets';
const OUT = '.design-sync/.cache/css';

const pick = (prefix) => {
    const hit = readdirSync(ASSETS).filter((f) => f.startsWith(prefix) && f.endsWith('.css')).sort();

    if (hit.length !== 1) {
        console.error(`✗ expected exactly one ${prefix}*.css in ${ASSETS}, found ${hit.length} — run \`npm run build\` first`);
        process.exit(1);
    }

    return hit[0];
};

mkdirSync(OUT, { recursive: true });

const app = pick('app-');
copyFileSync(join(ASSETS, app), join(OUT, 'app.css'));

const fonts = pick('fonts-');
const rewritten = readFileSync(join(ASSETS, fonts), 'utf8')
    .replaceAll('/build/assets/', '../../../public/build/assets/');
writeFileSync(join(OUT, 'fonts.css'), rewritten);

console.log(`staged ${app} → ${OUT}/app.css`);
console.log(`staged ${fonts} → ${OUT}/fonts.css`);
