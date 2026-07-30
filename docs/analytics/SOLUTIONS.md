# Solutions + additional bugs found

Companion to `PLAN.md` (design) and `RISKS.md` (what breaks).
This file is the fix for each item, with the actual code.

---

# PART 1 — New bugs found on second pass

## N1 — Cross-subdomain tracking breaks your growth loop 🔴 worst bug in the whole feature

I missed this in the first pass. It is more damaging than anything in `RISKS.md`.

Your share links live on `{username}.subhsandesh.in/{shareId}` (`middleware.ts:98`). The growth loop is:

```
alice.subhsandesh.in/abc12345   →  clicks "Create"  →  subhsandesh.in/templates  →  signup
        (recipient)                                          (new creator)
```

That arrow crosses a subdomain boundary. With default GA4 config, three things go wrong at once:

1. **New session starts.** Cross-domain navigation without configuration terminates the session and begins a fresh one.
2. **Self-referral.** The new session's source becomes `alice.subhsandesh.in / referral` instead of carrying the original acquisition source.
3. **User is double-counted** if the `_ga` cookie lands on the subdomain rather than the registrable root.

Net effect: `create_cta_clicked` and the resulting `sign_up` land in **two unlinked sessions**, so your viral coefficient — the single most valuable number in this product — is unmeasurable. And it fails *silently*: the events all show up, they just can't be joined.

**Fix (two parts, both mandatory):**

```js
// 1. In code — pin the cookie to the registrable domain
gtag("config", GA_ID, {
  send_page_view: false,
  cookie_domain: ".subhsandesh.in",   // NOT the default per-host cookie
  cookie_flags: "SameSite=None;Secure",
});
```

```
// 2. In the GA4 UI — this cannot be done from code
Admin → Data Streams → your stream → Configure tag settings
  → Show all → List unwanted referrals
  → add:  subhsandesh.in
```

Step 2 is what stops the self-referral. Skipping it leaves the attribution broken even with the cookie fixed.

**Verify:** open a share link, click Create, then in GA4 Realtime confirm it's **one** session with the original source intact — not two sessions with a `subhsandesh.in` referral.

## N2 — `tsc --noEmit` will fail immediately

`window.gtag`, `window.dataLayer` and `window.clarity` don't exist on `Window`. This is a hard build break, not a warning.

```ts
// types/analytics.d.ts
declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    clarity?: (...args: unknown[]) => void;
    __ANALYTICS_DEBUG__?: boolean;
  }
}
export {};
```

## N3 — Dev and ngrok traffic will pollute the production property

Every `npm run dev` session, every ngrok demo, every Playwright run becomes real production data. Unfixable retroactively — GA4 cannot delete events by source.

**Fix:** put the IDs in the per-env `configs` record in `lib/config.ts` (matching the file's existing convention) and leave `local` / `ngrok` **empty**. `track()` no-ops when the ID is absent, so dev is silent by construction rather than by discipline.

## N4 — PWA standalone mode reports all traffic as "direct"

`components/PwaProvider.tsx` — when the app launches from the home screen, `document.referrer` is empty, so every acquisition report attributes those users to `(direct)`. Their WhatsApp-link origin is lost.

Also check the service worker doesn't runtime-cache `googletagmanager.com` (stale gtag) and doesn't intercept `/g/collect` (offline beacons reject and can surface as unhandled rejections).

**Fix:** set a `launch_mode` user property from `window.matchMedia("(display-mode: standalone)")` so PWA traffic is at least identifiable, and add an explicit SW bypass for both analytics hosts.

## N5 — Your own admin traffic inflates everything

You have `app/(app)/admin/analytics`. You and your team clicking through templates all day is indistinguishable from customer behaviour, and at low traffic it dominates.

**Fix:** GA4 Admin → Data Streams → Configure tag settings → Define internal traffic (by IP), then activate the "Internal Traffic" filter in Data Settings → Data Filters. Note it defaults to *Testing* — it must be set to **Active** or it does nothing. Additionally, suppress tracking outright on `/admin/**`.

## N6 — Points-based purchases pollute revenue

`useTemplatePayment.ts:70` `handleSpendPoints` is a real conversion with **zero** INR. Firing GA4 `purchase` with `value: 0` makes average order value and revenue reports nonsense.

**Fix:** fire `purchase` only for the Razorpay path (real money, `value = amount / 100` since `:125` returns paise). Emit a distinct `spend_points` event for the points path. Also map `PAYMENT_CANCELLED` (`:168`) to a `checkout_cancelled` event rather than a failure — user intent, not an error.

## N7 — Clarity needs its own consent call

Clarity does not read GA4's Consent Mode. If you gate consent, you must call `clarity("consent")` / `clarity("consent", false)` separately, or Clarity keeps recording while GA4 is paused — the opposite of what you intended given the content sensitivity (`RISKS.md` C1).

---

# PART 2 — Solutions for the `RISKS.md` items

## A1 — Static-rendering deopt

Do **not** use `useSearchParams()`. Read the query string inside the effect, where it's client-only by definition and cannot affect prerendering.

```tsx
"use client";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

export function RouteTracker() {
  const pathname = usePathname();
  const last = useRef<string | null>(null);

  useEffect(() => {
    // window.location is the browser's truth — correct even when middleware
    // has rewritten the internal route (see PLAN.md F4), and reading it here
    // avoids useSearchParams()' prerender bailout entirely.
    const url = window.location.href;
    if (last.current === url) return;   // guards StrictMode double-invoke
    last.current = url;

    track("page_view", {
      page_path: normalizePath(window.location.pathname, window.location.hostname),
      page_location: url,
      page_title: document.title,
    });
  }, [pathname]);

  return null;
}
```

**Verify:** `npm run build` — prerendered route count must match `dev`. No `useSearchParams` warning in the log.

## A2 — Safe `fetch` instrumentation

Three defences: client-only, observer-not-wrapper, install-once.

```ts
let installed = false;

export function installNetworkTracking() {
  if (typeof window === "undefined") return;  // never patch Next's server fetch
  if (installed) return;                      // survives Fast Refresh
  installed = true;

  const original = window.fetch;

  window.fetch = function (input, init) {
    const promise = original.call(this, input, init);

    const desc = safeDescribe(input, init);   // pure; returns null if not ours
    if (desc) {
      // Side-observer only. The caller receives `promise` untouched, so
      // errors propagate unchanged and nothing is ever swallowed.
      promise.then(
        (res) => { void report(desc, res); },
        ()    => { void reportFailure(desc); },
      );
    }

    return promise;
  };
}

async function report(desc: Desc, res: Response) {
  try {
    let reason: string | undefined;
    if (!res.ok) {
      // clone() so the real caller's body stream stays intact —
      // res.json() here would break useHoliEditor.ts:368.
      // Only on failures: error bodies are small.
      reason = (await res.clone().json().catch(() => null))?.error;
    }
    const event = mapRequest(desc, res.status, reason);  // pure + unit-tested
    if (event) track(event.name, event.params);
  } catch { /* analytics must never affect the app */ }
}
```

`mapRequest` stays a pure function of `(url, method, status, reason)` so the whole funnel mapping is testable without a browser.

**Verify:** block `googletagmanager.com` in devtools, publish a page — it must still succeed. Then publish a premium template and confirm `publish_failed { reason: "PAYMENT_REQUIRED" }` fires *and* the payment modal still opens.

## A3 — Login counted once

```ts
const LOGIN_ACTIONS: Record<string, string> = {
  "auth/login/fulfilled":       "password",
  "auth/register/fulfilled":    "register",
  "auth/verifyOtp/fulfilled":   "otp",
  "auth/googleLogin/fulfilled": "google",
  // refreshAuth + hydrateAuth deliberately absent — they fire on every
  // page load via Providers.tsx:35 and are not logins.
};
```

Match exact action types, never the shared `handleAuthFulfilled` state transition. Plus a separate `login { method: "google_bridge" }` at `Providers.tsx:20-30`, which bypasses redux entirely (`RISKS.md` F5).

**Verify:** log in once, hard-refresh five times → exactly one `login` event.

## A4 — Page views counted once

`send_page_view: false` in the config call, and let `RouteTracker`'s effect fire every view including the first. The `last.current` ref guard above absorbs React 19 StrictMode's dev double-invoke. Expect 1 event in prod, 2 in dev — don't chase the dev number.

## A5 — Build-time env

Dockerfile needs **both** lines per var (ARG alone never reaches `npm run build`):

```dockerfile
ARG NEXT_PUBLIC_GA_ID
ARG NEXT_PUBLIC_CLARITY_ID
ENV NEXT_PUBLIC_GA_ID=$NEXT_PUBLIC_GA_ID
ENV NEXT_PUBLIC_CLARITY_ID=$NEXT_PUBLIC_CLARITY_ID
```

Then `build-args` in all three workflows: `client/.github/workflows/deploy-dev.yml:88`, `client/.github/workflows/deploy.yml:89`, `gifts/.github/workflows/frontend.yml:96`.

**Verify:** `grep -rl "G-XXXXXXX" .next/static/chunks`. No hit ⇒ dead in production.

## B1 — Creator vs recipient

Set a user property before the first event, derived from the route:

```ts
// /[id] and /[id]/[shareId] are recipient surfaces; everything else is creator
setUserProperties({ visitor_type: isSharePath(path) ? "recipient" : "creator" });
```

Build every funnel report on `visitor_type = creator`. Track `create_cta_clicked` on the recipient side as the bridge between the two populations — that's the viral coefficient, and N1 must be fixed for it to join up.

## B2 — Register the custom dimensions

Day-one checklist in GA4 Admin → Custom definitions, all **event-scoped** except the last:

`template` · `reason` · `method` · `source` · `is_authenticated` · `share_id` (debug only, never registered — see B3) · `visitor_type` (**user-scoped**)

Until these exist, events arrive but no breakdowns render. This is not a code bug.

## B3 — Cardinality

`normalizePath()` collapses unbounded segments before anything is sent:

```ts
/alice/abc12345  → /share/:shareId     // hostname carries the username; drop it
/blog/some-post  → /blog/:slug
/holi            → /holi               // bounded set — keep verbatim
```

Keep `share_id` as an unregistered debug param. Registering it as a dimension would blow the row limit and drag `template` into `(other)` with it.

## B4 — Retention

GA4 Admin → Data Settings → Data Retention → **14 months** on day one. The 2-month default silently discards history and cannot be recovered.

## B5 — Ad blockers

No fix; make it a documented convention instead. Never reconcile GA4 counts against DB rows. Read step-to-step **ratios**, which are unaffected by a uniform ~5–15% loss. If absolute truth is ever required, that's a server-side event pipeline — a different project.

## B6 — Consent Mode

Non-EEA (your traffic): `analytics_storage: "granted"` by default, ad storage denied. EEA: default-deny until a banner grants. Don't ship a default-deny-everywhere config with no banner — you'd get cookieless pings, events with near-zero users, and empty funnels.

## C1–C3 — Privacy (needs your decision, not a code fix)

1. Clarity project → Settings → Masking → **Strict**.
2. `data-clarity-mask="true"` on every message/letter/name container and editor textarea.
3. **Recommended:** skip Clarity entirely on `app/[id]/**`. Recipients arrived from a WhatsApp link, never consented, and that's exactly where the most sensitive rendered content lives.
4. Verify by watching your own replay and confirming the letter text is redacted. Do this before any real traffic.

## C4 — Disclosure

Edit the existing sections, don't add new ones: `privacy-policy/page.tsx:74` (§5 Cookies) and `:79` (§6 Third-Party) — name Google Analytics and Microsoft Clarity, and state that sessions may be recorded. Re-read §2 at `:61` ("we do not use... for profiling") and make sure the new setup doesn't contradict your own policy.

## D — Performance

GA4 `afterInteractive`; Clarity `lazyOnload`. `preconnect` both hosts. Capture Lighthouse mobile on `dev` before merging and compare after. Ship `web_vitals` → GA4 so you get field data, which beats lab numbers permanently.

Test the `html-to-image` card download with Clarity active — a corrupted share image would be a visible product regression.

---

# Ordered build sequence

1. `types/analytics.d.ts` (N2 — otherwise nothing compiles)
2. `lib/analytics/*` with per-env IDs (N3) and `normalizePath` (B3)
3. `RouteTracker` via `window.location` (A1)
4. GA4 config: `send_page_view: false` + `cookie_domain` (A4, **N1**)
5. `net.ts` observer pattern (A2)
6. Redux middleware on explicit action types (A3)
7. `visitor_type` user property (B1)
8. Explicit UI events — 6 shared files (`PLAN.md` Phase 4)
9. Clarity with Strict masking, excluded from `/[id]/**` (C1–C3)
10. Env + Dockerfile + 3 workflows (A5)
11. Privacy policy (C4)
12. Verify: `tsc --noEmit` → `lint` → `build` → prerender count → ID in bundle → Playwright funnel → publish-with-analytics-blocked

**Manual GA4 UI steps that no amount of code can cover:** unwanted referrals (N1), custom dimensions (B2), 14-month retention (B4), internal traffic filter set to Active (N5), Clarity Strict masking (C1).
