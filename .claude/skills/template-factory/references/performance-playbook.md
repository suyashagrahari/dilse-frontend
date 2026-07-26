# Performance Playbook (Stage 5)

Concrete, codebase-specific rules learned optimizing the SubhSandesh landing from a
flaky 47–79 mobile score to a stable high score. Apply all of them to every template.

## How to measure (don't guess)

```bash
CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
npx --yes lighthouse <URL> \
  --only-categories=performance,accessibility \
  --form-factor=mobile --screenEmulation.mobile \
  --quiet --chrome-flags="--headless --no-sandbox" \
  --output=json --output-path=/tmp/lh.json
```
- Extract culprits: `jq '.audits["layout-shifts"].details.items' /tmp/lh.json` and
  `jq '.audits["cls-culprits-insight"].details' /tmp/lh.json` (it names the CAUSE,
  e.g. "Web font").
- **CLS is intermittent** — a swap can miss the capture window. Run **≥5 times**;
  a single clean run is NOT proof.
- Local runs over a slow link inflate LCP/perf; trust CLS/a11y locally, trust
  PageSpeed for LCP/perf.

## Fonts — the #1 CLS source (this bit us repeatedly)

- Above-the-fold text fonts must be **self-hosted via `next/font`** with
  **`display:"optional"`**, NOT `"swap"`. `swap` lets the font load late and
  **re-wrap** large headings → the whole hero shifts down (~0.12 CLS). `optional`
  uses the metric-matched fallback and never swaps mid-view.
- **No duplicate `@font-face` for the same family.** Two pitfalls we hit:
  1. A second `next/font` instantiation elsewhere (another layout) declaring the
     same family as `swap` leaks onto every page. Make ALL instantiations of a
     family use the same `display`.
  2. Loading a family in `next/font` AND in an external Google-Fonts stylesheet
     creates a swap competitor for the same family name. The browser races the two
     sources. **Pick one source per family.** If `next/font` provides it, remove it
     from any external `<link>` URL.
- Verify what's actually served, both self-hosted and runtime-injected sheets:
  fetch the page + its CSS and grep `@font-face` for `font-family` + `font-display`.
  Every above-fold family must read `optional`.
- The body font counts. `globals.css` sets `body{font-family:'Inter'}` → Inter draws
  most text; it must be `optional` too.

## Splash / first paint

- The app has a full-screen splash (`components/AppSplash.tsx`). Reveal content on a
  **short fixed timer (~1.2s)**, never on `window 'load'` (fires many seconds into
  Slow-4G → LCP ~6s). Don't gate reveal on `document.fonts.ready` — the cap fires
  before fonts load on slow captures and hurts LCP without fixing CLS.

## Images

- Resize hero/preview images with **sharp** to the real display size, output **webp**:
  `sharp(src).resize({width, fit:'inside', withoutEnlargement:true}).webp({quality:90})`.
  (A 54 KB logo → 4.5 KB this way.)
- Use `next/image` with explicit `width`/`height` or a sized `fill` container so
  space is **reserved** (no image CLS). `priority` only the LCP image.
- Long-cache brand/static images via `next.config.ts` headers.

## JS / render path

- Above-the-fold hero elements: render at final state (`initial={false}` on
  framer-motion), not `opacity:0` fade-ins that wait on hydration (hurts Speed Index).
- `next/dynamic` code-splitting below-fold gave ~0 score gain here (TBT was already
  green) and risked CLS — only use it if TBT is actually the bottleneck. Keep
  `ssr:true` if you do, to preserve SEO HTML.
- Keep `optimizePackageImports` (framer-motion, lucide-react, etc.) in next.config.
- Don't add a custom webpack `splitChunks` that forces all vendors into one chunk.

## Definition of done

Artifact `04-optimize.md` must contain a before/after table (Perf, CLS, LCP, FCP,
TBT, a11y), evidence of **CLS ≤ 0.01 across ≥3 runs**, and a line confirming no
above-the-fold font serves `swap`.
