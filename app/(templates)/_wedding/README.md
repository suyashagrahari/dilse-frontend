# Wedding kit (`app/(templates)/_wedding`)

Shared foundation for the three paid wedding tiers — `wedding-invitation` ($5),
`wedding-invitation-premium` ($10), `royal-wedding-invitation` ($20). A private
folder (leading `_`): nothing here is a route. Import everything from the barrel:

```ts
import { WeddingRoot, WeddingMasonry, MasonryEditor, Countdown, EventsTimeline, RSVPBlock, … } from "../_wedding";
```

Server half: branch `feat/wedding-kit` of the server repo (`config/weddingShared.ts`,
`models/WeddingRsvp.ts`, `models/WeddingBlessing.ts`, `controllers/weddingGuest.controller.ts`,
`routes/weddingGuest.routes.ts`, mailer `sendWeddingRsvpEmail` / `sendWeddingRsvpDigestEmail`).

---

## 1. Page shell, themes, fonts

```tsx
<WeddingRoot theme={data.extras.theme}>   {/* "blush" | "champagne" | "powder" | "maroon" | "noir" | "emerald" */}
  …sections…
</WeddingRoot>
```

| export | what |
|---|---|
| `WeddingRoot` `{ theme, children, background?=true, chrome?, as?, className?, style? }` | Sets the theme's `--wk-*` tokens + `--font-wk-*` faces, paints the wash + linen texture, sets `<meta theme-color>`, injects the kit CSS once. `background={false}` = tokens/fonts only (editor panels). |
| `WeddingKitStyles` | The stylesheet alone (deduped `<style href>`), for kit pieces rendered outside a root. `ThemePicker`, `MasonryEditor`, `RsvpDashboard` mount it themselves. |
| `WEDDING_THEMES`, `WEDDING_THEME_IDS`, `LIGHT_THEMES`, `DARK_THEMES`, `DEFAULT_WEDDING_THEME` ("maroon"), `weddingTheme(id)`, `themeVars(id)`, `isWeddingThemeId` | Token sets. Store the id as a plain enum extra (`theme`, options = `WEDDING_THEME_IDS`). |
| `ThemePicker` `{ value, onChange(id), sample?="A & R", themes?, grouped?=true, label? }` | Radiogroup of six live mini-invitations (Light / Dark rows). Arrow keys move. |
| `Reveal` `{ as?, delay?, effect?: "rise"\|"fade"\|"zoom"\|"blur" }` | One-shot entrance on scroll (transform/opacity, reduced-motion aware). |
| `useWeddingReducedMotion()` | `prefers-reduced-motion`. |

**Tokens** (use them, never hard-code colours): `--wk-bg --wk-bg2 --wk-surface --wk-surface-solid
--wk-surface-2 --wk-ink --wk-muted --wk-accent --wk-accent-ink --wk-foil (gradient) --wk-gold
--wk-gold-ink (text-safe) --wk-border --wk-shadow --wk-glow --wk-texture --wk-paper
--wk-texture-opacity --wk-placeholder --wk-scrim`; root carries `data-wk-theme` and `data-wk-dark`.

**Fonts** (self-hosted `localFont`, `display: swap`): `--wk-font-display` Cormorant Garamond ·
`--wk-font-caps` Cinzel · `--wk-font-script` Great Vibes · `--wk-font-sans` DM Sans ·
`--wk-font-deva` Tiro Devanagari Hindi. Every stack falls back to Devanagari, so Hindi
renders in a matching serif. Put `lang="hi"` on Hindi blocks (line-height/letter-spacing fix).

**Utility classes**: `wk-foil-text` (gradient text), `wk-shimmer` (slow light sweep — add to
foil text / foil borders / foil ornaments), `wk-foil-border` (hairline foil border; on `wk-card`
too), `wk-foil-rule`, `wk-card`, `wk-paper` (silk paper card), `wk-eyebrow`, `wk-h2`, `wk-script`,
`wk-btn` / `wk-btn-ghost` / `wk-btn-sm` / `wk-btn-lg`, `wk-input`, `wk-field`, `wk-section`.

## 2. Gallery

```tsx
<WeddingMasonry photos={data.photos} mask="arch" frame="foil" tileCaptions />
```

`WeddingMasonry` props: `photos` (engine `LovePhoto[]`), `gutter?` (10 / 16 px), `columns?`
(`ColumnRule[]`, default 2/3/4 at container width 0/600/1024), `mask?` `"rounded"|"soft"|"square"|"arch"`,
`radius?=14`, `frame?` `"none"|"foil"|"mat"`, `lightbox?=true`, `tileCaptions?`, `animate?=true`,
`label?`, plus editor hooks (`renderOverlay`, `onTileClick`, `animateLayout`, `layoutRef`,
`dragPos`, `selectedIndex`, `onMeasured`).

- Shortest-column JS placement (`layoutMasonry`, pure) — order stays left→right; wide spans
  pull up to two following photos into the hole they would leave.
- Photo fields: `cropX/cropY` = focal point (object-position %), `scale` = zoom 100–300,
  `span` = `"wide"` (2 cols) · `"tall"` (1.5× height) · `"large"` (both), `w/h` = natural size.
  Aspects clamp to 1:2…2.2:1; a wide tile is never taller than 1.35× its width.
- Height is reserved from stored `w/h` (no CLS); lazy images blur up over `--wk-placeholder`;
  tiles rise in with a stagger; tap → `Lightbox` (swipe, ← → Esc, double-tap / pinch /
  ctrl-wheel zoom, drag to pan, swipe down to close, captions + notes, counter).

```tsx
<MasonryEditor photos={mf.photos} onChange={(p) => updateMf("photos", p)} max={WEDDING_TIER_LIMITS[slug].photos} upsell="Want 20 photos? Premium…" />
```

`MasonryEditor` props: `photos, onChange, max, mask?, title?, hint?, upsell?, className?, style?`.
Add (picker or drop) → `compressImage` (≤1400 px data URL) + measured `w/h`; uploaded at publish by
the engine (server `sanitizeLovePhotos` → S3 → CDN, which now keeps `span/w/h`). Drag the ⠿
handle to reorder (touch + mouse, live reflow, edge auto-scroll; ← → on the focused handle).
Tap a photo → size segment, focal-point picker with live crop preview, zoom, caption,
earlier/later, replace, remove (6 s undo). Set the day's `maxPhotos` to the tier limit —
`parseLovePhotos` now honours it (it used to cap at 10).

## 3. Sections

| component | props |
|---|---|
| `Section` | `id?, eyebrow?, title?, foilTitle?=true, ornament?="divider-lotus"\|null, width?: "narrow"\|"normal"\|"wide"\|"full"` |
| `WeddingCard` | `foil?=true, paper?, corners?: CornerId\|null, as?` |
| `Countdown` | `date "YYYY-MM-DD", time? "HH:mm", tz?="+05:30", variant?: "flip"\|"roll"\|"plain", labels?, doneText?, hideSeconds?` — Normal tier `roll`, Premium/Royal `flip` (split-flap). |
| `EventsTimeline` | `events: WeddingEvent[], couple, calendar?: "all"\|"main"\|"none", mainEventId?, url?, tz?, locale?, layout?: "timeline"\|"cards", showSwatch?, labels?` — Normal/Premium `calendar="main"`, Royal `"all"` (+ "Save all dates"). |
| `VenueCard` | `name, address?, mapUrl?, eyebrow?, note?, embed? (tap-to-load map), ornament?` |
| `MessageBlock` | `text, hindi? (side by side ≥860px), eyebrow?, heading? (script), signature?, ornament?="ganesha", align?, dropCap?` |
| `FamiliesBlock` | `bride: FamilySide, groom: FamilySide, heading?, first?: "bride"\|"groom", photos?` |
| `Monogram` | `a, b (full names), variant?: "text"\|"foil"\|"crest", size?=160, caption?, animate?` — Devanagari-safe initials. |
| `RSVPBlock` | `mode, couple?, events?, perEvent?, meal?, askPhone?, allowMaybe?=true, maxGuests?=6, deadline?, title?, intro?, share?, onSubmitted?, locale?` |
| `BlessingsWall` | `mode, title?, intro?, sample?, refreshMs?=20000, share?` (Royal only — server 404s it elsewhere) |
| `RsvpDashboard` | `slug, pageId, token, csvName?, className?` — owner view: totals, per-function heads, filter/search, blessings hide/show, CSV export. Mount it in the editor (published pages) or My Pages. |
| `PetalBurst` | `kind?, count?, mode?: "fall"\|"burst", seed?` |
| `Ornament` | `id: OrnamentId, width?, height?, tone?: "foil"\|"ink"\|"baked", shimmer?, flip?: "x"\|"y"\|"xy", label?` |
| `Divider` / `Corners` | `ornament?, width?/size?, tone?, shimmer?, space?/inset?` |

Helpers: `eventStart/eventEnd/formatEventDate/formatEventTime/mapLink/weddingIcs/downloadWeddingIcs/googleCalendarUrl`
(`ics.ts`), `submitRsvp/loadMyRsvp/postBlessing/fetchBlessings/fetchGuests/moderateBlessing/downloadGuestsCsv`
(`api.ts`), `WEDDING_TIER_LIMITS`, `WeddingEvent`, `FamilySide`, `RsvpDraft`, … (`types.ts`).

### Events data
Store events in `extras.events` as an engine `objlist` whose leaves are all text:
`id` (short stable slug — RSVPs refer to it; generate once, never from the title), `title`,
`date`, `time`, `endTime`, `venue`, `address`, `mapUrl`, `dressCode`, `dressColor`, `note`.
Cap the list with `WEDDING_TIER_LIMITS[slug].events`. Add a bool extra `rsvpMeal` to let the
sender ask for meals (the server only accepts `meal` when it is true).

### RSVP / blessings wiring
Nothing to register per tier beyond adding the slug to the engine: `makeValentineDayRouter`
mounts the guest routes for every slug in `WEDDING_TIER_LIMITS`. `RSVPBlock` / `BlessingsWall`
read `{ slug, shareId, hasPassword }` from `DayShareContext` (`_valentine/kit/shareInfo.ts`,
provided by `ValentineDayViewer` for every engine page) — in preview they work locally. Each
guest gets their own RSVP (one per device, editable via a stored token); the owner is emailed
per RSVP with running totals, or a digest when >10 arrive in an hour. Password-protected pages:
the gate now keeps the typed password for the tab (`page_pw_<shareId>`), and the block asks
inline if it is missing. Honeypot field `website`, light profanity filter, per-IP+page limits.

## 4. Ornaments & assets
`ORNAMENTS` (35 ids from the asset pack) render as CSS masks over **same-origin copies** in
`public/wedding/ornaments/` (the CDN sends no CORS header, so a mask over a CDN file fails).
`tone="foil"` paints the theme's own foil (rose-gold on Blush) and can shimmer; `"ink"` uses
`currentColor`; `"baked"` is the CDN's fixed champagne `svg/foil/<id>.svg` as an `<img>`.
Corners are drawn top-left — `flip` mirrors (`Corners` does all four). Two-tone pieces
(`gate-door-*`, `envelope-*`) read `--w-door / --w-paper / --w-paper-shade` and must be
**inlined** by the tier that animates them (fetch `/wedding/ornaments/<id>.svg`); as masks they
are silhouettes. `particleUrl(id)`, `textureUrl(id)` give CDN URLs for petals/confetti/textures.

## 5. Looking at it
`__dev__/KitDemo.tsx` is a playground (`?theme=noir&only=masonry|sections|rsvp|editor|themes|ornaments&mask=arch&frame=foil&n=12`).
Render it from a throwaway page (`app/wedding-kit-dev/page.tsx`, `dynamic(…, { ssr: false })`),
run `next dev --webpack`, and delete the page before committing.
