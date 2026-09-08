---
name: theme-design-system
description: >
  The canonical design system for the "new" in-house theme (fonts, colors,
  radii, shadows, aesthetic). USE THIS whenever the user asks to build, edit,
  restyle, or extend anything in the new theme / refreshed look — including
  when they say "new theme", "new ui", "the new one",
  "match the landing", "new design", or reference the landing page. When
  active, ALWAYS use these exact fonts, colors, and tokens; never fall back to
  the old "classic" cream+gold luxury palette or Playfair Display in new-theme
  work.
---

# SubhSandesh New Theme — Design System

When the user references the "new theme" / SubhSandesh look, everything you
build or edit MUST follow the tokens below. Do not invent new colors or fonts,
and do not use the classic luxury palette (`#f5ede6`, `#c9a84c`, Playfair
Display) — that is the OTHER theme.

## Fonts (always)
- **Headings / display:** `Space Grotesk` (weights 500/600/700)
- **Body / UI:** `Inter` (400/500/600/700)
- **Handwritten accent:** `Caveat` (600/700) — for playful flourishes only
- Loaded in `client/app/layout.tsx` via next/font as CSS vars:
  `--font-space-grotesk`, `--font-inter`, `--font-caveat`.
- Apply via the theme tokens/utilities below, e.g. `font-family: var(--site-heading-font)`
  or Tailwind `font-site-heading` / `font-site-body` / `font-site-script`.

## Color palette (exact hex — SubhSandesh)
| Role | Hex | Token | Tailwind |
|------|-----|-------|----------|
| Canvas / bg | `#FAFAF7` | `--site-bg` | `bg-site-bg` |
| Alt bg | `#F3F1EA` | `--site-bg-alt` | `bg-site-bg-alt` |
| Surface / card | `#FFFFFF` | `--site-surface` | `bg-site-surface` |
| Surface alt (indigo-soft) | `#EFEDFD` | `--site-surface-alt` | `bg-site-surface-alt` |
| Text | `#0E0E12` | `--site-text` | `text-site-text` |
| Muted text | `#5B5B66` | `--site-text-muted` | `text-site-muted` |
| Border | `#ECEAE3` | `--site-border` | `border-site-border` |
| **Indigo (primary accent)** | `#6C5CE7` | `--site-accent` | `text/bg-site-accent` |
| Indigo strong | `#5646C9` | `--site-accent-strong` | `site-accent-strong` |
| **Pink (accent 2)** | `#F72585` | `--site-accent-2` | `site-accent-2` |
| **Lime (accent 3 / CTA)** | `#C6FF3D` | `--site-accent-3` | `site-accent-3` |
| On-accent text | `#FFFFFF` | `--site-on-accent` | `site-on-accent` |
| Amber / stars | `#FFB020` | (literal) | — |
| Green | `#3AA76D` | (literal) | — |

Brand gradient: `linear-gradient(135deg, #6C5CE7, #F72585)` (`--site-gradient-brand`).
Primary CTA color is **lime `#C6FF3D`** with dark (`#0E0E12`) text.

## Shape & depth
- Radius: `20px` (`--site-radius`), large `28px` (`--site-radius-lg`), pills `999px`.
- Card shadow: `0 8px 24px rgba(14,14,18,.06)` (`--site-shadow-card`).
- Elevated: `0 40px 80px -20px rgba(14,14,18,.38)` (`--site-shadow-elevated`).

## Aesthetic principles
- Warm cream canvas with soft corner **radial-gradient blobs** in indigo/pink/lime
  at low alpha (`--site-hero-glow`).
- **Tilted "sticker" cards** (small rotations ~-1.5°..1.1°), rounded, soft shadow.
- Bold geometric Space Grotesk headings; Caveat for a handwritten line.
- Playful, celebratory, Indian-family-friendly; emoji and confetti welcome.
- Glassy sticky nav: `backdrop-filter: blur(14px)`, translucent white.

## How the theme system works (do not break)
- Site-wide theme is chosen by the superadmin at `/admin/appearance`
  (`admin/appearance/page.tsx`), stored in `SiteConfig` (backend
  `server/src/models/SiteConfig.ts`, routes `/site-config`).
- Applied via `data-sitetheme="subhsandesh"` on `<html>` (set server-side in
  `app/layout.tsx` from `lib/siteTheme.ts`).
- Tokens live in `client/app/globals.css` under `[data-sitetheme="subhsandesh"]`;
  Tailwind utilities (`site-*`, `font-site-*`, `rounded-site`) in `tailwind.config.ts`.
- Prefer `--site-*` tokens / `site-*` Tailwind classes so anything you build
  automatically flips with the theme. Use the raw hex only for one-off pieces
  that are subhsandesh-only.

## The exact landing (reference of record)
- The homepage for this theme is a pixel-exact reproduction of
  `~/Desktop/_!DOCTYPE.../SubhSandesh Landing.dc.html`, rendered by
  `client/app/(app)/components/subhsandesh/SubhSandeshExact.tsx` (CSS + markup +
  ported animation in `subhSandeshExact.data.ts`). Match its look for any new
  new-theme surfaces. It ships a branded loader (rotating conic indigo→pink→lime
  ring + SubhSandesh wordmark) — reuse that loader style for new-theme loading states.

## Rules
1. New-theme work → these fonts + colors + radii ONLY.
2. Never introduce Playfair Display or the cream/gold luxury palette here.
3. Reach for `--site-*` tokens first; hardcode the hex above only when needed.
4. Keep it responsive and smooth (avoid `background-attachment:fixed`; use
   `overflow-x: clip` not `hidden` so sticky nav works).
5. Primary CTAs = lime `#C6FF3D`; links/accents = indigo `#6C5CE7`; highlights = pink `#F72585`.

See `[[project-site-theme-toggle]]` memory for the full architecture.
