# Project Conventions (Stages 3 & 4)

## Stack
Next.js 16 (App Router, `output:"standalone"`, Turbopack), React 19, TypeScript,
framer-motion, Redux Toolkit + react-redux, Tailwind CSS (+ tailwindcss-animate),
lucide-react (icons), next/font/google (self-hosted fonts), @react-pdf/renderer
(PDF exports), @react-oauth/google (auth). Media on S3 + CloudFront (`cdn.subhsandesh.in`).

## Where templates live
`app/(templates)/<slug>/` — one folder per template, its own route group layout is
`app/(templates)/layout.tsx`. Study an existing rich one before building, e.g.
`wedding-shaadi` or `apology-dashboard`.

### Standard template anatomy (mirror this)
```
app/(templates)/<slug>/
  layout.tsx        # route metadata (title/description/canonical/OG) + font vars wrapper
  config.ts         # template config: default content, section order, theme tokens
  page.tsx          # assembles the sections; client component
  components/
    types.ts        # shared TS types for the template's data
    styles.ts       # shared style tokens / CSS-in-JS helpers
    CoverSection.tsx / <Section>.tsx ...   # one component per section
    BottomNav.tsx           # mobile section nav
    EditSheet.tsx           # inline edit UX for personalizing
    <Name>WelcomeOverlay.tsx / PublishingOverlay.tsx / PasswordSheet.tsx
    BackgroundMusic.tsx, Particles/decorations, ToastStack.tsx, PreviewBar.tsx
```

## Conventions
- **Client vs server:** template pages are `"use client"`; keep `metadata` in the
  template's `layout.tsx` (server) so SEO HTML is server-rendered.
- **Fonts:** never hardcode a raw Google-Fonts `<link>` or CSS `@import` in a template.
  Use the app's self-hosted next/font CSS variables (`var(--font-playfair)`,
  `var(--font-display)`/Outfit, `var(--font-script)`/Dancing, `var(--font-lora)`,
  Inter body). Above-the-fold text fonts must be `display:"optional"` (see perf
  playbook). New display face only if justified, added to `app/layout.tsx`.
- **Images:** `next/image`, sized containers, webp, `sizes` set; hosts already
  allow-listed in `next.config.ts` (`images.remotePatterns`).
- **Personalization/share:** follow the existing edit-sheet + publish-overlay +
  password-sheet pattern; share links use the app's slug-based routing.
- **Types:** everything typed; `npx tsc --noEmit` must stay at 0 errors.
- **A11y:** buttons have accessible names, touch targets ≥24px, sequential headings
  (no h2→h4 skips), `aria-hidden` on decorative SVGs, respect `prefers-reduced-motion`.

## Backend (Stage 4)
- API routes under `app/api/**` (or the pattern existing templates use). Validate
  input with zod. Never expose secrets to the client (`NEXT_PUBLIC_*` only for public
  values). Media uploads go through the existing S3/CDN flow. Handle errors + return
  typed responses.

## Build / verify
- `npx tsc --noEmit` → 0 errors.
- `NEXT_PUBLIC_APP_ENV=production npm run build` compiles the new route. (Local build
  may hang on `/blog/category/*` if Strapi CMS is unreachable — that's environmental,
  not your template. Confirm the "✓ Compiled successfully" line appears.)

## Deploy (only when the user approves)
- Repo root IS `client/`. Branches: **`main` → production**, **`dev` → staging
  (stag.subhsandesh.in)** via GitHub Actions blue-green to EC2.
- Flow: commit → push `main` (prod) → merge `main` into `dev` → push `dev` (stag).
- Occasional transient EC2 error `UtimesNanoAt ... no such file or directory` is a
  flaky containerd/overlayfs issue — re-run the failed job (`gh run rerun <id> --failed`).
- Commit trailer: `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`.
