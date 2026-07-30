# Pre-existing bugs found while instrumenting

None of these were introduced by the analytics branch and none are fixed by it.
They are recorded here because each one is a conversion leak that the new funnel
will expose, and because two of them affect exactly the growth loop we are now
measuring.

---

## P1 — `middleware.ts` route list is stale, breaking templates on subdomains ✅ FIXED

> **Fixed on this branch.** The allowlist was replaced with a positive shareId
> test — see "Fix" at the end of this section. Kept here because the reasoning
> matters and because the funnel events described below are what will confirm the
> fix in production.


`middleware.ts:20` defines `GLOBAL_ROUTE_PREFIXES` — the paths that must behave
identically on the apex domain and on user subdomains. Anything *not* in that
list is rewritten to `/{username}{pathname}` and served by
`app/[id]/[shareId]/page.tsx` as if it were a share link.

The list has not kept up with the templates that shipped after it was written.

**Missing template slugs** (all exist under `app/(templates)/`):

- `apology-dashboard` ← the flagship; it has its own dedicated card component
- `bouquet-gf`
- `darling`
- `shaadi-card`
- `christian-wedding-2`

**Missing static routes** (all exist under `app/(app)/`):

- `/blog`, `/help`, `/about-us`, `/contact-us`, `/privacy-policy`,
  `/terms-of-service`, `/admin`

### Why this matters more than it looks

It breaks the last step of the viral loop:

```
recipient opens  alice.subhsandesh.in/{shareId}      ✅ works
clicks "Create"  → alice.subhsandesh.in/templates    ✅ works (listed at :21)
clicks a card    → alice.subhsandesh.in/apology-dashboard
                 → rewritten to /alice/apology-dashboard
                 → treated as a share link, share lookup fails               ❌
```

So a recipient who wants to make their own card is dropped on the floor for 5 of
the ~22 templates, including the flagship. Everything before that step works,
which is why it would look like a mysterious drop-off rather than a 404 pattern.
The blog being unreachable on subdomains is a separate SEO/content loss.

### Fix (applied)

Adding the missing entries would have worked but would rot again. Instead the
logic was **inverted**: rather than enumerating everything that is *not* a share
link, `middleware.ts` now tests positively for a shareId and passes everything
else through.

```ts
const SHARE_ID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

if (isShareIdPath(pathname)) {
  url.pathname = `/${subdomain}${pathname}`;   // share link → viewer
  return NextResponse.rewrite(url);
}
return NextResponse.next();                    // everything else → normal route
```

`GLOBAL_ROUTE_PREFIXES` and `isGlobalRoute` were deleted; the new gate subsumes
them. New templates and new pages now work on subdomains the day they ship, with
no edit to this file — the failure mode is designed out rather than patched.

**Why this is safe.** It relies on every shareId being a `randomUUID()`, which was
verified: 14 of 14 page models under `server/src/models/*Page.ts` assign
`shareId = randomUUID()`, and the server contains no other id generator (the only
other `randomBytes` uses are an agreement token, `apologyDashboardPage.controller.ts:256`,
and S3 filenames, `s3Media.service.ts:75`). `PageView.ts` and `SharedAccess.ts`
reference a shareId but never mint one.

A differential test over all 33 reachable path shapes on a subdomain confirmed:
**20 decisions unchanged, 13 fixed, 0 regressions.** Every path whose old
behaviour was a rewrite to `/{username}/<non-uuid>` was already broken — that
lookup cannot match, because no shareId is a non-UUID — so no working route
changed.

**One residual assumption worth checking before deploy.** If any page's shareId
was ever set by hand or by a seed/import script to a non-UUID value, its link
would now pass through and 404 instead of resolving. Nothing in the code does
this, but the data can confirm it:

```js
// mongo shell — expect 0 across every *pages collection
db.getCollectionNames()
  .filter(c => /pages$/i.test(c))
  .forEach(c => {
    const n = db[c].countDocuments({
      shareId: { $exists: true, $ne: null,
        $not: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i }
    });
    if (n) print(`${c}: ${n} non-UUID shareId(s)`);
  });
```

---

## P2 — `PAYMENT_REQUIRED` is handled in only one editor

`app/(templates)/holi/hooks/useHoliEditor.ts:368-372` is the only place in the
codebase that handles a `PAYMENT_REQUIRED` publish response, and the only caller
of `openPaymentModal`.

`holi` is currently the only paid template (`config/templatePricing.ts`), so this
is latent rather than live. But the moment a second template is priced, its
editor will drop that response into its generic error branch: the user sees a
vague publish failure, no payment modal appears, and the sale is lost silently.

**Fix:** hoist the `PAYMENT_REQUIRED` branch into shared code, or replicate it
per hook and add a test. Also note that ~15 templates are absent from
`CLIENT_TEMPLATE_PRICING` entirely and are treated as free only because
`isTemplatePremium()` returns `false` on a lookup miss — free by accident rather
than by declaration.

**Detection:** the new `publish_failed` event carries `reason`, so
`publish_failed { reason: "PAYMENT_REQUIRED" }` appearing on a non-holi template
is the signal that this has gone live.

---

## P3 — Auth-deferred publish intent is lost on the Google bridge flow

The "publish while logged out → log in → publish automatically" flow stores the
pending intent in a `useRef` (e.g. `useApologyEditor.ts:64`, and the same shape
in ~12 hooks).

`app/auth/google-bridge/page.tsx` performs a **full page redirect** to complete
Google OAuth on subdomains. That discards all in-memory React state, so the ref
is gone when the user returns. They log in successfully and their page is simply
not published — with no error, because nothing failed.

Users on the email/password and inline Google paths are unaffected; only the
subdomain bridge redirect loses it.

**Fix:** persist the pending-publish intent to `sessionStorage` alongside the
existing draft keys, and consume it in the same effect that already picks up the
auth tokens in `Providers.tsx:20-30`.

**Detection:** `auth_required` firing without a following `publish_success` in
the same session, correlated with `login { method: "google_bridge" }`.

---

## P4 — `SocialShareSheet` sixth tile is mislabelled

`components/SocialShareSheet.tsx:55-62` defines a tile with `key: "copy"` and
label `"SubhSandesh"`, but its `onClick` (`:61`) calls `router.push("/")` — it
navigates home rather than copying anything. The real copy action is the URL-bar
button at `:149`.

Harmless to users beyond the confusing label, but it is a trap for analytics:
instrumenting by `key` would report navigations home as link copies. The
instrumentation on this branch tracks by actual behaviour, so `copy_link` comes
from `:149` and the sixth tile is not reported as a share at all.

---

## Summary

| | Impact | Fix size | On this branch |
|---|---|---|---|
| P1 subdomain routes | High — breaks growth loop for 5 templates | ~10 lines of data | No |
| P2 payment handler | Latent, high when triggered | Small refactor | No |
| P3 lost publish intent | Medium, silent | Small | No |
| P4 mislabelled tile | Cosmetic | 1 line | Worked around |

P1 is worth fixing before or alongside shipping analytics — otherwise the first
thing the new funnel will show is a drop-off whose cause is already known.
