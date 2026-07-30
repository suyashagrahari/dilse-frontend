# Pre-mortem: what breaks when GA4 + Clarity go in

Branch: `feat/analytics-ga4-clarity`. Read alongside `PLAN.md`.
Ordered by how badly it hurts, not by likelihood.

---

## A. Will break the app or the data if not handled

### A1 — `useSearchParams()` deopts the ENTIRE app out of static rendering ⚠️ worst one

`AnalyticsProvider` needs the query string to build `page_location`, so the obvious code is `usePathname()` + `useSearchParams()`. But in App Router, `useSearchParams()` in a component **not** wrapped in `<Suspense>` forces the whole route to client-side render during static generation.

Because the provider mounts inside `components/Providers.tsx`, which wraps every route via `app/layout.tsx`, this would deopt **every page in the app** — including all template landing pages and blog posts. You'd lose static HTML, LCP would regress, and crawlers would get an empty shell. That single mistake undoes the LCP work documented in `app/layout.tsx:1-60`.

- **Symptom:** build logs `useSearchParams() should be wrapped in a suspense boundary`, and `.next/server/app/**` emits fewer prerendered `.html` files.
- **Fix:** isolate the hook in a leaf component wrapped in `<Suspense fallback={null}>`. Better: skip the hook entirely and read `window.location.search` inside the effect — the effect only runs client-side, so no deopt is possible. Plan takes the second route.
- **Verify:** `npm run build` and diff the prerendered-route count against `dev`.

### A2 — `fetch` wrapping can corrupt Next.js caching and break callers

Three separate failure modes, all real:

1. **Server-side patching.** Next patches global `fetch` for ISR/`revalidate: 60` (used at `app/[id]/[shareId]/page.tsx:18-28`). Wrapping it in a module that also evaluates on the server would sit *on top of* Next's cache layer and can break revalidation. → Guard with `typeof window === "undefined"` return, and install only from a `"use client"` effect.
2. **Body consumption.** Detecting `reason: PAYMENT_REQUIRED` requires reading the JSON body. `await res.json()` **consumes the stream**, so the real caller in `useHoliEditor.ts:368` then gets an empty body and publish breaks. → Must use `res.clone()`, and only clone on non-2xx responses to instrumented URLs (small bodies) so we don't double-buffer large payloads.
3. **Double-install on Fast Refresh.** Dev hot reload re-runs the effect and wraps the already-wrapped fetch → every event fires 2×, 4×, 8×. → Idempotency flag on the function object.

Also: the wrapper must `throw` the original error unchanged and never `await` anything before returning the promise, or network errors get swallowed and publish appears to hang.

### A3 — Login events fire on every page load

`handleAuthFulfilled` in `store/authSlice.ts:356` is shared by `loginUser`, `registerUser`, `verifyOtp`, `googleLogin` **and `refreshAuth`**. A redux middleware listening on that state transition would count every silent token refresh as a login. Since `Providers.tsx:35` runs `checkAuth()` on every mount, "logins" would roughly equal pageviews.

- **Fix:** match on the four explicit action types only. Never on `refreshAuth.fulfilled` or `hydrateAuth`.

### A4 — Page views double-count on first load, then stop entirely

GA4's default `send_page_view: true` fires on script load. Add a manual fire on mount and load #1 is counted twice. Set `send_page_view: false` but forget the route listener and you only ever record the landing page — every client navigation invisible.

- **Fix:** `send_page_view: false` + a `usePathname` effect that fires manually. Skip nothing on mount (the effect *is* the first page_view).
- **React 19 StrictMode** double-invokes effects in dev, so expect 2× locally and 1× in prod. Don't "fix" a dev-only doubling.

### A5 — Build-time env vars (from `PLAN.md` F3)

Works perfectly on localhost, ships completely dead. `NEXT_PUBLIC_*` is inlined at `npm run build`; `scripts/deploy.sh:82` supplies env via `--env-file` *after* the image is built.

- **Verify:** `grep -r "G-" .next/static/chunks | head` after build. If the measurement ID isn't in the bundle, it will never work in prod.
- Note the BuildKit `cache-from: type=gha` + `.next/cache` mount could serve a stale chunk on the first deploy after adding the ID. Confirm against the shipped JS, not the local build.

---

## B. Won't crash, but the numbers will be wrong

### B1 — Recipients destroy your conversion math 📉

Share pages are public and heavily visited by people who are *not* customers. One share link opened 50 times = 50 GA4 users who "never converted". Blended conversion rate collapses and every funnel report becomes meaningless.

- **Fix:** set a user property / `content_group` distinguishing `creator` vs `recipient` from the first event, and build all funnel reports on the creator segment. This is a *design* requirement, not an optimisation — retrofitting it means discarding the first month of data.

### B2 — Custom parameters are invisible until registered by hand

`template`, `reason`, `method` will be sent correctly and show up in **nothing**. GA4 only surfaces custom event params in reports after you register each one as a custom dimension in Admin → Custom definitions (50 max). This is the single most common "analytics is broken" false alarm.

### B3 — Cardinality and value limits

Event name ≤40 chars, param name ≤40, **param value ≤100 chars** (silently truncated). High-cardinality params like `share_id` get bucketed into `(other)` once GA4's row limit is hit, taking legitimate dimensions down with them. Keep `share_id` as a debug-only param, never a registered dimension. Path normalization (`PLAN.md` F4) is the same class of problem.

### B4 — Reporting delay and retention

Standard reports lag 24–48h; only Realtime and DebugView are instant. Data retention defaults to **2 months** — must be raised to 14 in Admin → Data Settings on day one, or history is gone permanently.

### B5 — Ad blockers undercount

Expect roughly 5–15% of Indian mobile traffic to block `googletagmanager.com`; higher on desktop/Brave. Absolute totals are floors, not truth. **Ratios between steps stay valid** — which is all the drop-off analysis needs. Don't reconcile GA4 against your DB row counts; they will never match.

### B6 — Consent Mode misconfiguration

Default-deny `analytics_storage` with no path to granting it yields cookieless pings: events arrive, user/session counts stay near zero, funnels look empty. If no EEA banner ships, `analytics_storage` must be **granted** by default for non-EEA traffic.

---

## C. Privacy — the highest-consequence risk here 🔴

### C1 — Clarity replays record deeply personal content

This is not a generic analytics concern. The product's content *is* private messages: apology letters, love notes, names, photos. Session replay captures rendered DOM, so replays would contain the full text of a user's love letter, viewable by anyone with dashboard access.

- Clarity's default "Balanced" masking covers form inputs but **not** rendered page text.
- **Requirement, not a suggestion:** enable **Strict** masking in the Clarity project, and add `data-clarity-mask="true"` to message/letter/name containers and every editor textarea. Verify by watching your own replay and confirming the text is redacted.

### C2 — Password gate inputs

`ApologyDashboardViewer.tsx:20-36` and `SharePageClient.tsx:296-325` handle share-page passwords. Inputs are masked by Clarity by default — but confirm it, because a leak here is a security incident, not a privacy nit. Also ensure the password never becomes a GA4 event param.

### C3 — Recipients never consented

Recipients are third parties who arrived via a WhatsApp link. Recording their session is a materially weaker legal position than recording a signed-up user's. Consider disabling Clarity entirely on `app/[id]/**` routes: it's where consent is weakest and where content is most sensitive.

### C4 — Disclosure

`privacy-policy/page.tsx:74` (§5 Cookies) and `:79` (§6 Third-Party) currently say "analytics" generically without naming vendors. Under India's DPDP Act, naming Google Analytics and Microsoft Clarity plus stating that sessions may be recorded is the defensible position. Note §2 at `:61` claims "We do not use... for profiling" — check the new setup doesn't contradict your own stated policy.

---

## D. Performance — you have more to lose than most

~95KB extra JS (gtag ≈50KB, Clarity ≈45KB) on a codebase where `display: "optional"` was chosen specifically to save 0.12 CLS.

- **INP/TBT on low-end Android** is the real cost, not LCP. `afterInteractive` protects LCP but still lands script execution in the interaction window. Budget 100–200ms of main-thread work on a slow device.
- **Clarity × framer-motion × canvas-confetti**: Clarity's MutationObserver records DOM churn, and this app animates constantly. High mutation volume means CPU cost and bloated replays; confetti canvases replay poorly anyway.
- **Recommendation:** GA4 `afterInteractive`, Clarity `lazyOnload`. Consider sampling Clarity at <100% once traffic grows.
- **`html-to-image` interaction**: card download serializes live DOM. Any injected third-party node inside the captured subtree can corrupt or taint the output. Test the download flow on a page with Clarity active — a broken share-image would be a visible product regression.
- **Guard:** capture Lighthouse mobile scores on `dev` *before* merging, then compare. Web Vitals → GA4 gives ongoing field data (`PLAN.md` F8), which is better than lab numbers anyway.

---

## E. How to debug when it misbehaves

**Is it loading at all?**
1. `window.dataLayer` in console — undefined ⇒ script never ran (check A5, then ad blocker).
2. `window.clarity` — same test for Clarity.
3. Network tab, filter `collect?v=2` — one request per event. Present here but missing in GA4 ⇒ wrong measurement ID or consent (B6), not a code bug.

**Is the event right?** `?gtm_debug=x` or the GA Debugger extension → GA4 **DebugView** shows events within seconds with full params. This is the only fast feedback loop; Realtime is coarser and standard reports lag 48h (B4).

**Is it firing the right number of times?** Set `window.__ANALYTICS_DEBUG__ = true` to have `track()` `console.table` every event. Catches A2's double-install and A4's double page_view immediately.

**Did the network mapping match?** Debug mode logs `mapRequest()` input and output per call, so an unmatched publish URL is visible instead of silent.

**Automated regression:** Playwright over gallery → editor → save → publish → share, asserting the exact set of `collect?v=2` event names. This is the only check that catches a template rename silently breaking the URL mapping.

**Sanity check before merge**
- [ ] `tsc --noEmit`, `lint`, `build` clean
- [ ] Prerendered route count unchanged vs `dev` (A1)
- [ ] Measurement ID present in `.next/static` (A5)
- [ ] Publish still works with analytics **blocked** (A2 — pull the plug on `googletagmanager.com` in devtools and confirm publish succeeds)
- [ ] Own Clarity replay shows message text redacted (C1)
- [ ] One login = one `login` event, not one per reload (A3)

---

## Verdict

Nothing here argues against shipping. A1 and A2 are the two that could cause real damage, and both have concrete mitigations already folded into `PLAN.md`. **C1 is the item that most deserves a human decision** — recording replays of users' private love letters is a product and legal choice, not an engineering one.
