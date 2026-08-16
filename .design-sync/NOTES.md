# design-sync notes — uponco

Repo-specific gotchas for future syncs. Read this before re-running the converter.

## Remote is page-scoped (as of 2026-08-16)

The claude.ai/design project `d7db5cd6-56ea-464a-bb5c-960eb890a80d` ("Uponco") now
holds **only the Public Booking page** — 28 components: `general/PublicBookingFlow`,
`general/StepDateTime`, all of `public-booking/*` (16), the 9 `ui/*` primitives the
page uses (Avatar, Button, Dialog, Input, Textarea, Label, Popover, Skeleton,
InternationalPhoneInput), and `app/InputError`. Everything else was trimmed.

Planned follow-on passes (each just a different component set through the recipe
below, **no more trimming needed**): Onboarding, then Dashboard (service editing,
locations, team members, branding).

### Scoped re-sync recipe (fast path)

1. `npm run build && node .design-sync/prepare-css.mjs` — refresh compiled CSS.
2. Author previews in `.design-sync/previews/<Name>.tsx` (import from `'uponco'`;
   real Baku/London copy). Add `cfg.overrides.<Name>` for tall/in-flow cards
   (`cardMode: "column"`) or portal/fixed cards (`cardMode: "single"` +
   `primaryStory`).
3. Build the bundle: `node .ds-sync/package-build.mjs --config
   .design-sync/config.json --node-modules ./node_modules --out ./ds-bundle`
   then `node .design-sync/stage-assets.mjs`. **`--node-modules ./node_modules`
   is required** (the `uponco` symlink lives there). Add `--skip-dts` ONLY for a
   quick render check — the uploader refuses a stubbed bundle (`[DTS_STUBBED]`),
   so the real push needs a full build. Full d.ts build ≈ 5–8 min for 323
   components; scope render/capture with `--components A,B`.
4. Validate: `node .ds-sync/package-validate.mjs ./ds-bundle`. Per-component
   render results are in `ds-bundle/.render-check.json`; screenshots in
   `ds-bundle/_screenshots/<group>__<Name>.png`. GRID_OVERFLOW warns for
   out-of-scope components are noise. Targeted card-mode fixes:
   `node .ds-sync/lib/preview-rebuild.mjs --config … --node-modules ./node_modules
   --out ./ds-bundle --components A,B`.
5. Push via the `DesignSync` tool: `list_files` → `finalize_plan` → `write_files`.
   Push each component's 4 files (`.html/.jsx/.d.ts/.prompt.md`), its
   `_preview/<Name>.js`, and the shared root (`_ds_bundle.*`, `styles.css`,
   `_ds_sync.json`, `_ds_needs_recompile`, `_vendor/*`, `icons/*`).

### DesignSync tool gotchas (learned the hard way, 2026-08-16)

- **`finalize_plan` requires BOTH `writes` and `deletes`** (pass `[]` for the unused
  side). `writes`/`deletes` accept globs (`components/foo/**`) as *bounds* — max 256.
- **`write_files`/`delete_files` need EXPLICIT file paths, NOT globs.** A `**` path
  passed to `delete_files` matches nothing (it deleted only the literal non-glob
  entries and reported `deleted: 3`). Enumerate real files; each must fall under a
  finalized glob. Batch ≤256/call (we used 200). Paths absent on the remote are
  silently skipped, so over-including local-only components is safe.
- `localDir` for writes = the bundle dir (`ds-bundle`); `localPath` is relative to it.
- Grouping: `public-booking/*` land in group `public-booking`, **but
  PublicBookingFlow and StepDateTime land in `general`** (verify actual groups from
  `.render-check.json` `rel` paths before building a keep/delete set).

## What this repo is

Not a design-system package — a Laravel + Inertia application. There is no
publishable entry, no `dist/`, and no Storybook. The converter therefore runs in
**synth-entry mode**: it bundles straight from `resources/js/components/` source
with esbuild. That is the sub-skill's documented last resort, and everything
below exists to make it work.

## Setup that must be redone on a fresh clone

- `ln -sfn .. node_modules/uponco` — the converter resolves the package as
  `<node-modules>/<pkg>`, so this symlink is what makes `PKG_DIR` the repo root.
  Gitignored; recreate it every clone.
- `ln -sfn ../.ds-sync/node_modules .design-sync/node_modules` — the
  `overrides/source-kit.mjs` fork imports `ts-morph` by bare name.
- `npm run build && node .design-sync/prepare-css.mjs` (this is `cfg.buildCmd`)
  before every converter run. See "Styling" below.

## Fixes that are load-bearing

- **`package.json` needed a `name`.** It had none (private app). `loadDts` walks
  up for the nearest package.json *with a name*; without one it walked to `/` and
  crashed on `ENOENT: /package.json`. `"name": "uponco"` was added.
- **`@/localisation` had to be shimmed** (`shims/localisation.ts`, wired through
  `cfg.tsconfig`). The real module builds its tree with Vite's
  `import.meta.glob`, which esbuild turns into `{}.glob(...)` — a TypeError at
  module init that takes the entire bundle down. The shim imports the same JSON
  statically. **Regenerate it when a locale or namespace is added**, or previews
  silently fall back to raw keys for the new namespace.
- **`@inertiajs/react` had to be shimmed** (`shims/inertia-react.ts`). Everything
  is re-exported untouched except `usePage()`, which throws outside a live
  Inertia app. `useTranslation()` calls it, so unshimmed it takes down nearly
  every card *and every design the agent builds*. The shim returns a static page
  object shaped like `HandleInertiaRequests::share()`.
- **`.design-sync/tsconfig.ds-sync.json` carries ONLY the two shim aliases.** It
  must not repeat `@/*`: the converter's paths plugin tries extensionless matches
  first, so `@/routes/company` resolves to the *directory* and esbuild fails with
  "is a directory". Left out, esbuild's own tsconfig auto-detection handles `@/*`
  correctly, including directory/index resolution.
- **No `//` comment keys in that tsconfig.** The converter strips `//` comments
  with a regex that also eats a `"//":` JSON key, breaking the parse — and a
  failed parse silently disables the plugin (no error, shims just don't apply).
- Shim files import the repo's JSON/modules by **relative path**, not `@/`:
  esbuild does not apply tsconfig `paths` to files it reaches through
  `node_modules`, and the package dir is a symlink into this repo.

## Styling

`cfg.cssEntry` points at `.design-sync/.cache/css/app.css`, a staged copy of the
**compiled** stylesheet. Pointing it at `resources/css/app.css` ships a
stylesheet that defines nothing — that file is Tailwind v4 source and opens with
`@import "tailwindcss"` (validate flags `[CSS_IMPORT_MISSING]`). The compiled
file only exists after `npm run build` and is content-hashed, so
`prepare-css.mjs` copies it to a stable path. It also stages the Instrument Sans
`@font-face` sheet, rewriting its absolute `/build/assets/…` urls so the woff2
files can be found and shipped.

## The lib fork

`.design-sync/overrides/source-kit.mjs` (declared in `cfg.libOverrides`) makes
three changes, all commented `// FORK:` in the file:

1. `ui` removed from `GENERIC_DIR` — otherwise all 137 primitives collapse into
   one 210-component `general` group.
2. Components sitting directly in the source root group as `app`, not `general`.
3. Subparts with no file of their own (`DialogContent`, `SidebarMenuButton`)
   inherit the group of their longest matching PascalCase-prefix parent.
4. The synthesized entry re-exports **default** exports under their declared
   name. `export *` skips defaults, and this repo's app components are
   overwhelmingly `export default function Foo()` — without it 135 of 323
   components were discovered but never reached `window.Uponco`
   (`[BUNDLE_EXPORT]`).

On re-sync, diff this fork against `.ds-sync/lib/source-kit.mjs` for upstream
changes.

## Re-sync risks

- **The two shims can rot silently.** A new locale/namespace, or a change to the
  shared props in `HandleInertiaRequests::share()`, will not fail the build — it
  degrades previews (raw keys, missing user/team data). Re-check both shims
  whenever either source changes.
- **The staged CSS is gitignored** (`.design-sync/.cache/`). A fresh clone that
  skips `cfg.buildCmd` silently syncs with no stylesheet at all.
- **`node_modules/uponco` and `.design-sync/node_modules` are gitignored
  symlinks.** Both must be recreated per clone; the second one's absence is a
  hard crash, the first one's is a confusing `[NO_DIST]`.
- Component discovery is a **content scan**, not a shipped `.d.ts` tree, so the
  323-component list shifts whenever a file gains or loses a PascalCase export.
  Prop contracts are correspondingly weaker than a real build would give.

## Authoring previews — calibration learnings

Established by authoring Button, Dialog and StatCard end-to-end first.

- **Import from `'uponco'`.** That specifier is shimmed straight to
  `window.Uponco` by the preview compiler, so the card renders the shipped
  bundle rather than a second source copy with its own React contexts.
  Relative/`@/` imports also work but are not worth the risk.
- **Tailwind utilities are available in previews** — the compiled app
  stylesheet ships with the bundle, so `className="flex flex-wrap gap-3"` for
  layout glue behaves exactly as it does in the app.
- **Overlays render open and in-flow** with `<Dialog open modal={false}>` plus
  `className="relative"` on the content. `modal={false}` keeps Radix from
  locking scroll and painting a full-viewport overlay over the card; `relative`
  pulls the content out of `fixed` positioning so it sits inside the cell.
  Pair with `cfg.overrides.<Name>: {"cardMode": "single"}` for the card view.
- **Suppress Radix autofocus** in any preview containing a form field:
  `onOpenAutoFocus={(event) => event.preventDefault()}`. Without it the first
  input screenshots with its text selected, which reads as a rendering bug.
- **Inertia `<Link>` renders fine** as a plain anchor under the shim — components
  like StatCard that wrap themselves in one need no special handling.
- Use real domain copy (service names, specialist names, Baku/London
  timezones), never `foo`/`test`. These cards are what the design agent imitates.

## Preview-authoring rules learned across waves 1–2

Folded from the per-batch learnings files (since deleted). Hand these to any
future authoring pass.

### Styling

- **Only Tailwind utilities the app source already uses exist in previews.** The
  bundle ships the app's *compiled* stylesheet and nothing scans preview files,
  so an invented class is silently absent — and `cn()` may merge away the real
  class it was meant to replace, producing a subtly wrong render with no error.
  Stick to the standard scale; grep `resources/js` before using a bracket value;
  otherwise use an inline `style`.
- **Breakpoint variants can't be demonstrated.** Cells capture at a fixed 900×700
  viewport, so `md:`/`lg:` branches never fire from a narrow wrapper. Don't
  budget a cell for a component's mobile layout.

### Statically rendering interactive components

- Each cell is its own page load at 900×700 with `fullPage: false`, so portals to
  `document.body` and `fixed` overlays are correct renders, not bleed.
- Pin overlays via the **root's** controlled prop (`<NavigationMenu value="…">`,
  `<Dialog open>`, `<Popover open>`), not by rendering the subpart alone.
- `modal={false}` makes Radix skip the overlay entirely — right for Sheet, wrong
  for `DialogOverlay` (whose preview needs plain `<Dialog open>`).
- Put `onOpenAutoFocus={(event) => event.preventDefault()}` on **every** open
  overlay, not just ones with inputs: a ghost button as first child screenshots
  with a focus ring that reads as a bug.
- Radix indicators/viewports never re-measure in a static render — "the indicator
  slides" is not a provable axis; use open-vs-closed instead.
- The `Sidebar*` family renders in-flow through its real `collapsible="none"`
  branch: `<SidebarProvider className="min-h-0 w-auto">` +
  `<Sidebar collapsible="none" className="h-auto rounded-lg border">`.
- Don't preview pre-animation states (`mounted={false}`) — they screenshot empty
  and read as broken.
- Relative timestamps read wrong: the capture browser's clock lags the repo's
  date, so `formatDistanceToNow` renders "in over 2 years". Pass a null date.

### This repo's specifics

- **The emitted `.d.ts` files carry no prop contract** — they are
  `{[key: string]: unknown}`. Previews must be written against
  `resources/js/components/**`. This is the cost of synth-entry mode; a real
  build with declarations would fix it.
- `Switch` is this repo's own controlled button, not Radix: `defaultChecked` is
  silently dropped, use `checked` + `onCheckedChange`.
- `ScheduleProvider` and `useSchedule` are exported, so schedule components
  preview for real; interaction-only state can be set by an in-tree helper
  calling the context setter in `useLayoutEffect`.
- `ACCENTS` is a plain const and is **not** exported — inline accent styles. The
  card graphics (`BusinessGraphic`, `ServicesGraphic`, …) are exported.
- `InternationalPhoneInput` guesses its country from the capture machine's
  timezone and degrades to a generic globe when a number doesn't parse.
- `StepSelection` needs **contiguous 30-minute** slot marks or
  `filterPreviewSlotsByDuration` empties every specialist.
- `BookingFooter` needs `embedded`; `DashboardStats` needs `mounted`.

### Known deviations recorded deliberately

- `previews/PushNotificationCard.tsx` mocks `Notification.permission` at module
  top. The capture browser reports `denied`, which pins the component to its
  "notifications are blocked" branch and makes the Switch — the state the
  settings page is built around — unreachable by any prop. **Re-sync risk**: this
  is a preview-local override of browser state, not a config setting; if the
  component's permission handling changes, the mock will quietly misrepresent it.

## Typography — a real mismatch in the app, mirrored deliberately

`resources/css/app.css` sets `--font-sans: 'Plus Jakarta Sans', ui-sans-serif, …`,
but the only webfont the app loads is **Instrument Sans** (`bunny('Instrument Sans')`
in `vite.config.ts`). Nothing ever references the Instrument Sans family, so:

- verified in a headless render of a built card — all 12 `@font-face` rules report
  `status: unloaded`, and `getComputedStyle` on a button returns the
  Plus-Jakarta-first stack, which resolves to the **system sans**;
- this is equally true of the live app (`<body class="font-sans">` resolves the
  same variable), so Instrument Sans is downloaded on every page load and never
  painted.

**Decision (user's, 2026-08-16): mirror the app exactly.** `cfg.extraFonts` was
removed so the bundle ships no webfont and designs render in the same system sans
the product does. Implemented designs therefore match production.

Consequence: `package-validate.mjs` prints `[FONT_MISSING] "Plus Jakarta Sans"`
on every run. **That warn is expected and correct** — the family really is
referenced and really is unresolved. Do not "fix" it by shipping a substitute.

If `--font-sans` is ever pointed at Instrument Sans in `app.css`, re-add
`"extraFonts": [".design-sync/.cache/css/fonts.css"]` to the config and re-sync;
`prepare-css.mjs` already stages that sheet.

## Known render warns (expected — a warn NOT in this list is new)

- `[FONT_MISSING] "Plus Jakarta Sans"` — see above.
- `[RENDER_THIN] AppLogoIcon` — it is a small square mark with no text; thin is
  the correct render.

## Capture-harness patch that must be reapplied after re-staging scripts

`.ds-sync/storybook/http-serve.mjs` ships a MIME map with no `.svg` entry, so
`/icons/horizontal-logo.svg` is served as `application/octet-stream` and Chromium
refuses to paint it — `SiteHeader`/`SiteFooter` screenshot with a broken-image
glyph. Add `'.svg': 'image/svg+xml'` (plus jpeg/webp/woff2) to that map after
every `cp -r` of the staged scripts. `.ds-sync/` is gitignored, so this is lost
on every fresh clone.

Related: `.design-sync/stage-assets.mjs` copies `public/icons` into the bundle
after each build (the build wipes the output dir). Run it every time.
