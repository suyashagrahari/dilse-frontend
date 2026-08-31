# Template early access

**Date:** 2026-08-31
**Branch:** `feat/template-early-access` (client + server, both off `dev`)
**Status:** design approved

---

## 1. What this is

A super admin gives one registered user access to a template that is hidden from
everyone else. That user sees it in the gallery, can build with it, and can
publish — including when the template is paid, which the grant waives. Everyone
else still gets "Not available yet".

The use case is a pre-release: you finish a template, hold it back from the
public, and hand it to a client or a tester first.

## 2. What already exists

| Piece | Where | State |
|---|---|---|
| Per-template visibility decisions | `models/TemplateVisibility.ts` | works |
| Cached resolve + `isTemplateLive(slug)` | `config/templateVisibility.ts` | works |
| Public hidden list | `GET /api/template-visibility` | works, **edge-cached 60s, unauthenticated** |
| SSR resolve of the hidden list | `lib/templateVisibility.server.ts` | works, **shared 60s cache** |
| Client gallery filter | `hooks/useHiddenTemplates.ts` | works |
| Client builder gate | `components/TemplateAvailabilityGate.tsx` | works |
| Server write gate | `middleware/templateGate.ts` | works, **applied to 2 of 43 route files** |
| Admin visibility screen | `/admin/templates` | works |
| Super-admin surfaces + audit | `superAdmin.controller.ts`, `services/adminAudit.ts` | works |
| Paid-publish gate | `services/publishGate.service.ts` | works |
| User search for admin | `GET /api/admin/users?search=` | works |

## 3. The constraint that shapes everything

**Grants cannot ride on the public visibility response.**

`GET /api/template-visibility` is unauthenticated and sets
`Cache-Control: public, max-age=60, stale-while-revalidate=300`. A CDN or a
browser cache will hand one visitor's body to the next. `getHiddenTemplatesServer()`
compounds it: it resolves during the server render with `next: { revalidate: 60 }`,
which is one cache entry shared by every request in the process.

So making that response per-user is not an option in either direction — it would
either leak one user's grants to another, or force the endpoint uncacheable and
undo a deliberate optimisation on the busiest read in the app.

Grants therefore travel on a **separate, authenticated, uncached** channel, and
the client combines the two. That is not a workaround; it is the correct shape:
"what is public" and "what is true for you" are different facts with different
cacheability, and the bug is conflating them.

## 4. Decisions taken

**4.1 Registered users only.** A grant stores a `userId`. Granting to an email
with no account — a grant that waits and binds on signup — was considered and
rejected: it adds a second, pending state to reason about, and the super admin can
simply grant after the client signs up.

**4.2 A grant waives payment.** A tester invited to try an unreleased template
should not be charged for it. It becomes rule 4 of the publish gate, after free,
already-published and paid.

**4.3 No expiry.** A grant lasts until revoked. Once the template goes live to
everyone the grant is redundant and harmless. An expiry date is a grant that
lapses mid-demo with no warning, and a background job to enforce it.

**4.4 A dedicated collection, echoed into `/auth/me`.** Storage is its own
collection so the audit trail exists and both directions are indexed. The user's
granted slugs are also returned by `GET /auth/me`, which the client already
fetches on boot — so there is no extra request and no render where the user is
known but their access is not. That second part is load-bearing; see §6.

**4.5 The gate is swept to all 43 route files.** Beyond the original ask, and
included deliberately: a release control applied to 2 of 43 templates is not a
release control. Hiding any other template today stops the gallery and the
builder but leaves create/update/publish open to a direct call.

## 5. Data model

**New: `models/TemplateGrant.ts`** — one row per live grant.

```ts
{
  userId:         ObjectId,  // ref User, indexed
  slug:           String,    // lowercase, indexed
  grantedBy:      ObjectId,  // ref User — the super admin
  grantedByEmail: String,    // denormalised so the list renders without a join
  note:           String,    // optional: "Sharma wedding demo, 3 Sep"
  createdAt, updatedAt
}
```

Compound unique index on `(userId, slug)`, so granting twice is an upsert rather
than two rows. Separate index on `slug` for the template-first list.

Revoking **deletes** the row. The collection stays a list of grants that are in
force, the way `TemplateVisibility` is a list of decisions that have been made —
a `revoked: true` tombstone would make every read filter for it and every count
wrong by default.

## 6. Architecture

### 6.1 Server

**New: `config/templateAccess.ts`** — the one place access is decided.

- `grantedSlugsFor(userId): Promise<string[]>` — cached per user, 30s TTL.
- `hasGrant(userId, slug): Promise<boolean>`
- `canUseTemplate(userId, slug): Promise<boolean>` — `isTemplateLive(slug) || hasGrant(...)`
- `invalidateGrantCache(userId?)` — one user, or all.

Cache shape and reasoning copied from `config/templateVisibility.ts`: a
module-level map, a short TTL, and invalidation on every mutation. Keyed per user
rather than one global map, because a global one would be a copy of the whole
collection to serve a question about one person.

Fails **closed on the grant half, open on the live half**: if the grant read
throws, `hasGrant` is false, so a hidden template stays hidden and the user sees
the normal "not available" rather than being let in by a database hiccup. The
`isTemplateLive` half keeps its existing fail-open, because a live template
becoming unreachable during a blip is the worse outcome.

**Changed: `middleware/templateGate.ts`** — `requireTemplateLive(slug)` becomes
`requireTemplateAccess(slug)`, now reading `req.userId`. Every route file applies
it after `router.use(protect)`, so the id is always present. The old name is
removed rather than aliased: two names for one gate is how half the call sites
end up on the one that ignores grants.

Keeps its 403 + `TEMPLATE_NOT_LIVE` shape, so the client needs no new branch.

**Swept:** all 43 template route files gain the gate on `POST /`, `PUT /:id`,
`POST /:id/publish`. Reads and recipient-facing routes stay untouched, for the
reason already written at the top of that middleware: a page already sent must
keep opening.

**Changed: `services/publishGate.service.ts`** — rule 4:

```
1. template is free              → allow
2. page is already published     → allow
3. a paid/points PaymentOrder    → allow
4. an early-access grant         → allow   ← new
5. otherwise                     → 402
```

Rule 4 sits after 3 so a user who has already paid is never re-checked against
grants, and before the 402 so a granted tester is never charged.

**Changed: `controllers/auth.controller.ts`** — `getMe` returns
`earlyAccess: string[]`. Under impersonation this answers with the impersonated
user's grants, which is correct: an admin viewing as a user should see what that
user sees.

**New: `controllers/templateGrant.controller.ts`** — `requireSuperAdmin`, audited:

| Route | Does |
|---|---|
| `GET /api/admin/template-grants` | counts per slug, for the index |
| `GET /api/admin/template-grants/:slug` | who has access to one template |
| `GET /api/admin/template-grants/user/:userId` | what one user has |
| `POST /api/admin/template-grants` | grant `{ userId, slug, note? }` |
| `DELETE /api/admin/template-grants/:slug/:userId` | revoke |

Validation: slug matches `SLUG_RE` **and** exists in the catalogue — granting
access to a typo is a grant that silently does nothing. `userId` must be a valid
ObjectId belonging to a real, non-banned user.

### 6.2 Client

**New: `hooks/useTemplateAccess.ts`** — returns the **effective** hidden set,
`hidden − granted`. The gallery, the favourites list and the builder gate all
switch to it, and none of them learns what a grant is. One concept, one hook.

**Changed: `components/TemplateAvailabilityGate.tsx`** — reads the effective set,
and holds a spinner instead of the blocked screen while a token exists but the
user object has not landed.

That last part is the detail that makes this feel finished. Grants arrive with
`/auth/me`, which resolves after the first paint. Without the hold, a granted
user opening their pre-release link sees "Not available yet", then the builder —
which reads as the grant not working. The same reasoning is already written in
`app/(app)/admin/layout.tsx`: a token in storage means an answer is on its way.

**Changed: `store/authSlice.ts`** — the user type gains `earlyAccess?: string[]`.

**New: `app/(app)/admin/early-access/page.tsx`** — super-admin only, in the
visual language of `/admin/templates` and phone-first like `/admin/pricing`. Lists
every template with its grant count; opening one shows who has access, a search
over registered users to add, and revoke. An optional note per grant, because in
six weeks "why does this client have this" is the question.

**Changed: `app/(app)/admin/users/[userId]/`** — an Access section listing that
user's grants with a revoke, read-only otherwise.

## 7. Failure modes

| If | Then |
|---|---|
| grant read fails (server) | treated as no grant — hidden stays hidden |
| visibility read fails (server) | unchanged: fails open, template treated live |
| `/auth/me` fails or is slow | gate holds a spinner while a token exists; no flash of the blocked screen |
| grant exists for a slug that no longer ships | harmless; the admin list marks it unknown |
| user is banned after being granted | `protect` refuses them first; the grant never gets consulted |
| template goes live while granted | grant becomes redundant, nothing changes for the user |
| revoked mid-session | next write is refused; the cache TTL bounds it to 30s |
| granted user on a paid template | publishes free, rule 4 |

## 8. Testing

**Unit** — `canUseTemplate` across live × granted (four cases); `grantedSlugsFor`
caching and invalidation; slug and userId validation rejections.

**Invariant** — every template route file that has a write route applies the gate,
asserted across the route directory rather than a list, so the 44th template
cannot reopen the hole §4.5 closes.

**Integration** (extends `scripts/pricing-integration.js` pattern, new script) —
auth tiers on every grant route; a hidden template refuses create/publish for a
normal user and allows both for a granted one; a grant waives the 402 on a paid
hidden template; revoking closes access; `/auth/me` carries `earlyAccess`;
granting twice yields one row.

**Browser** — a granted user opening a hidden template sees the builder with no
flash of the blocked screen; a non-granted user sees "Not available yet"; the
template is absent from the gallery for one and present for the other.

## 9. Out of scope

Grant expiry, granting by email before signup, granting to a group or role,
self-service request-access, per-grant permission levels (see/build/publish as
separate switches), and notifying the user that they have been granted access.
