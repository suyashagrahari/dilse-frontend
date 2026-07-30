# Analytics Implementation Plan — GA4 + Microsoft Clarity

Branch: `feat/analytics-ga4-clarity`
Date: 2026-07-30
Goal: know **where** users drop off (GA4 funnel) and **why** (Clarity heatmaps + replays).

---

## 1. Findings that shape the design

Four parallel codebase audits produced these constraints. Each one changes the design.

| # | Finding | Consequence |
|---|---|---|
| F1 | **No shared publish abstraction.** `components/template-base/` is dead (1 importer). Each of ~20 templates has a standalone editor hook. 24 `/publish` fetch sites across 13 hooks + `valentine-gf/page.tsx:206`. Most hooks duplicate the publish block twice (manual + auth-deferred auto-publish). | Hand-editing 24 sites is unmaintainable and breaks for every new template. **Instrument at the network boundary instead.** |
| F2 | **No CSP anywhere.** `next.config.ts:149-166` sets security headers but no `Content-Security-Policy`; nginx configs have none. | Nothing to allowlist. GA4/Clarity load unblocked. No header changes needed. |
| F3 | **`NEXT_PUBLIC_*` are build-time only.** `Dockerfile:18-32` uses ARG→ENV; `scripts/deploy.sh:82` `--env-file` runs *after* build so it can never inline. Three workflow files pass build-args, one of them (`gifts/.github/workflows/frontend.yml`) is already missing two vars. | Must add ARG **and** ENV to Dockerfile + build-args to all 3 workflows, or analytics silently never loads in prod. |
| F4 | **`middleware.ts` rewrites subdomains.** Browser shows `alice.subhsandesh.in/abc12345`; `usePathname()` returns `/alice/abc12345`. | Raw paths give unbounded cardinality (one row per share link) and wrong host attribution. **Paths must be normalized before sending.** |
| F5 | **Google subdomain bridge bypasses redux.** `app/auth/google-bridge/page.tsx` full-redirects with tokens in the hash, consumed in `Providers.tsx:20-30` — never hits `googleLogin.fulfilled` or `onSuccess`. | Login event needs instrumentation at the hash-consume site too, not just the redux action. |
| F6 | **Auth-deferred publish intent is a `useRef`** (e.g. `useApologyEditor.ts:64`). | Does not survive the bridge's full page reload → that publish is silently lost. Pre-existing bug; the funnel will now *measure* it. Not fixed here. |
| F7 | Razorpay only. Order response carries `amount` (**paise**) + `currency` at `useTemplatePayment.ts:125`; verify resolves `:161`. Only `holi` is premium (`config/templatePricing.ts`). | Enables real GA4 ecommerce `purchase` with revenue. Divide paise by 100. |
| F8 | JSON-LD coverage is already strong (`WebSite`+`SearchAction`, FAQ, HowTo, Breadcrumb, Speakable, ArticleGraph). | No SEO rescue needed. Only in-scope SEO work is **Core Web Vitals → GA4** (CWV is a ranking factor) + privacy-policy disclosure. |
| F9 | Template cards are bare `<Link>` with no onClick (`TemplateCard.tsx:34`, `ApologyTemplateCard.tsx:61`); favorites button relies on `stopPropagation`. | Safe to add onClick, but must not disturb the existing propagation guard. |
| F10 | `SocialShareSheet.tsx:55-62` — 6th tile has key `copy` and label "SubhSandesh" but its onClick does `router.push("/")`. Real copy is the URL-bar button `:149`. | Pre-existing mislabel. Track by actual behaviour, not by key, or the data lies. |

---

## 2. Architecture

Five new files, one shared entry point. Nothing per-template.

```
lib/analytics/
  config.ts       # reads IDs via lib/config.ts convention (F3)
  events.ts       # the event taxonomy — single source of truth, typed
  track.ts        # track() / identify() — safe no-op when IDs absent
  path.ts         # normalizePath() — kills cardinality blowup (F4)
  net.ts          # fetch instrumentation → auto funnel events (F1)
components/analytics/
  AnalyticsProvider.tsx   # mounts GA4 + Clarity + route change + web vitals
  ConsentGate.tsx         # Consent Mode v2 default-deny for EEA
```

**Why network instrumentation (F1).** A single `install()` wraps `window.fetch` once and maps API calls to funnel events:

| Request | Event |
|---|---|
| `POST {API}/{tpl}-pages` | `page_created` |
| `PUT {API}/{tpl}-pages/{id}` | `page_saved` |
| `POST {API}/{tpl}-pages/{id}/publish` → 2xx | `publish_success` |
| same → non-2xx / `PAYMENT_REQUIRED` | `publish_failed` (with reason) |
| `POST {API}/payment/create-order` | `begin_checkout` |
| `POST {API}/payment/verify` → 2xx | `purchase` (F7) |
| `POST {API}/share/{id}/pw-verified` | `password_unlocked` |

This covers all 24 publish sites and **every future template automatically**, in one file. The template slug is parsed from the URL, so `template` is a dimension on every event for free. Trade-off: it's indirect. Mitigated by an explicit registry table, a `debug` mode that logs each mapping, and unit-testable pure mapping function (`mapRequest(url, method, status)`).

Only genuinely UI-only moments get explicit calls — 6 shared files, no template folders touched.

---

## 3. Event taxonomy (16 events)

GA4 free tier allows 500 distinct names. 16 well-chosen events beat 200 noisy ones.

**Discovery**
1. `template_card_clicked` — {template, position, source} — the gallery→editor step
2. `editor_opened` — {template} — did the page actually load

**Creation funnel**
3. `edit_started` — {template, field} — first real interaction (fires once)
4. `page_created` — {template} — auto (net)
5. `page_saved` — {template} — auto (net)
6. `password_set` — {template, has_password}

**Publish funnel**
7. `publish_clicked` — {template, is_authenticated} — intent, incl. logged-out
8. `auth_required` — {template} — the auth wall (F6's drop-off)
9. `publish_success` — {template, share_id} — auto (net)
10. `publish_failed` — {template, reason} — auto (net)

**Auth**
11. `login` — {method: password|otp|google|google_bridge, mode: login|register} — F5

**Monetisation**
12. `begin_checkout` / 13. `purchase` — {template, value, currency} — auto (net), F7

**Share + growth loop**
14. `share` — {method: whatsapp|instagram|telegram|twitter|facebook|copy, template} — F10
15. `recipient_viewed` — {template, is_owner} — the shared page opened
16. `create_cta_clicked` — {template, source: viewer_logo|create_yours} — **the viral coefficient**

Plus free/zero-code: GA4 Enhanced Measurement (scroll, outbound clicks, site search, file downloads) and `web_vitals` (LCP/CLS/INP/FCP/TTFB) via `useReportWebVitals` — F8.

---

## 4. Phases

### Phase 1 — Core (no behaviour change)
- `lib/analytics/*` (5 files above). `track()` is a no-op when IDs are unset, so local dev and PR previews stay silent and nothing can crash.
- `normalizePath()`: `/alice/abc12345` → `/share/:shareId`; `/blog/some-post` → `/blog/:slug`; template routes kept verbatim. Sends `page_location` from `window.location.href` so the subdomain host is preserved (F4).
- Consent Mode v2: `default` deny for `ad_storage`/`ad_user_data`/`ad_personalization`; `analytics_storage` granted for India, denied-until-consent when the visitor looks EEA. Verdict on the banner is in §6.

### Phase 2 — Mount
- `components/analytics/AnalyticsProvider.tsx`: GA4 via `next/script` `afterInteractive` with `send_page_view: false` (App Router needs **manual** page_view on client nav, else you only ever record the first screen), Clarity same strategy, `usePathname`+`useSearchParams` route listener, `useReportWebVitals`.
- Mount inside `components/Providers.tsx` (client boundary already exists) — **not** `layout.tsx`, keeping the hand-tuned `<head>` untouched.
- Add `preconnect` for `googletagmanager.com` + `clarity.ms`.

### Phase 3 — Auto funnel
- Install `net.ts` from the provider. Covers events 4,5,9,10,12,13 and password unlock across all templates (F1).

### Phase 4 — Explicit UI events (6 shared files only)
| File | Event |
|---|---|
| `components/TemplateCard.tsx:34`, `ApologyTemplateCard.tsx:61` | 1 (guard `stopPropagation`, F9) |
| `store/analyticsMiddleware.ts` (new) on `loginUser/registerUser/verifyOtp/googleLogin.fulfilled` | 11 — one file instead of touching AuthModal; excludes silent `refreshAuth` |
| `components/Providers.tsx:20-30` | 11 with `method: google_bridge` (F5) |
| `components/SocialShareSheet.tsx:65-83` + `:149` | 14 (by behaviour, F10) |
| `app/[id]/SharePageClient.tsx` | 15 |
| `ApologyDashboard.tsx:256-268`, `BirthdayGfViewer.tsx:365-371` | 16 — growth loop |

Events 3, 7, 8 need one small edit in `useApologyEditor.ts` as the reference implementation; a follow-up can replicate to the other 12 hooks (documented, not done here — the auto layer already captures the outcomes).

### Phase 5 — Env + deploy wiring (F3)
- `lib/config.ts`: add `gaId` + `clarityId` per env, matching the existing `configs` record convention.
- `.env.example`: new `# ── ANALYTICS ──` block in the file's exact box-drawing style.
- `Dockerfile:18-32`: ARG **and** ENV for both IDs.
- Build-args in `client/.github/workflows/deploy-dev.yml:88`, `client/.github/workflows/deploy.yml:89`, `gifts/.github/workflows/frontend.yml:96`.

### Phase 6 — Privacy + verify
- `privacy-policy/page.tsx`: name Google Analytics + Microsoft Clarity in §5 (:74) and §6 (:79). Editing existing sections, not adding.
- `npx tsc --noEmit`, `npm run lint`, `npm run build`, then Playwright-drive the funnel and assert on `dataLayer` / network beacons.

---

## 5. Verification (evidence, not assertions)

1. `tsc --noEmit` + `lint` + `build` clean.
2. Grep built output for the measurement ID → proves build-time inlining worked (F3).
3. Playwright: gallery → editor → save → publish → share, capturing `collect?v=2` requests; assert each expected event name appears.
4. Assert `track()` is a silent no-op with IDs unset.
5. GA4 DebugView + Clarity live session as the final human check.

## 6. Open decisions

- **Consent banner.** Recommend: no banner for India (privacy-policy disclosure + Consent Mode v2 defaults), banner only if EEA traffic is material. Building the banner is out of scope for this branch.
- **Events 3/7/8 for the other 12 hooks.** Reference implementation only in this branch.
- **Optional SEO follow-up** (not in scope): `ReviewJsonLd` (`ReviewData` type already exists unused at `seo-data.ts:16`), Product/Offer, and `WebsiteJsonLd` on share routes.
