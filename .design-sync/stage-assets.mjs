#!/usr/bin/env node
// Copies the app's static icon assets into the built bundle, at the same
// root-relative path the components ask for.
//
// A few app components hard-code their brand mark as
// `<img src="/icons/horizontal-logo.svg">` with no prop to override it — the
// path is served by Laravel from `public/` in the real app. Without this the
// preview cards (and any design built from those components) render a
// broken-image glyph. Run after every `package-build.mjs`, which wipes the
// output directory.
//
// Usage: node .design-sync/stage-assets.mjs [outDir=./ds-bundle]

import { cpSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const OUT = process.argv[2] ?? './ds-bundle';
const SRC = 'public/icons';

if (!existsSync(SRC)) {
    console.error(`✗ ${SRC} not found — nothing to stage`);
    process.exit(1);
}

cpSync(SRC, join(OUT, 'icons'), { recursive: true });
console.log(`staged ${SRC} → ${OUT}/icons`);
