# Super-admin template pricing

**Date:** 2026-08-31
**Branch:** `feat/superadmin-template-pricing` (client + server, both off `dev`)
**Status:** design approved, awaiting spec review

---

## 1. What this is

A super admin decides, per template, whether publishing it is free or paid — and
at what price — from `/admin/pricing`, without a deploy. A user who builds a paid
template sees the price at the moment they press Publish, pays, and the page goes
live and shareable. A user who builds a free template notices nothing new.

## 2. What already exists

This is not a greenfield payment system. The engine shipped and is on `main` in
both repos. Reading it first is the difference between a two-day change and a
two-week one.

| Piece | Where | State |
|---|---|---|
| Razorpay order + signature verify | `server/src/services/razorpay.service.ts` | works |
| Payment record | `server/src/models/PaymentOrder.ts` | works, indexed for the gate |
| Publish gate | `server/src/services/publishGate.service.ts` | works |
| Gate wired into publish endpoints | ~36 `*Page.controller.ts` files | works |
| Payment endpoints | `/api/payment/{pricing,create-order,verify,spend-points}` | works |
| Paywall modal | `client/components/PaymentModal.tsx` | works, wrong theme |
| Checkout hook | `client/hooks/useTemplatePayment.ts` | works |
| Points-as-payment | `POST /api/payment/spend-points` | works |

So the gate already returns `402 PAYMENT_REQUIRED`, the modal already opens
Razorpay, and a payment already unlocks a publish.

## 3. What is actually broken

Four defects, and they are the whole scope of this work.

**3.1 Pricing is hardcoded, in two files that must agree.**
`server/src/config/templatePricing.ts` and `client/config/templatePricing.ts` are
manual mirrors of each other. Changing a price means editing both and deploying
both. They have already drifted in spirit: the server says Holi is `originalPrice
499, discountPercent 80, finalPrice 99`, and 499 × 0.20 is 99.80, not 99. Three
stored numbers where two would do, and nothing enforces that the third is
consistent.

**3.2 Only 2 of 43 editors handle the paywall.**
`grep -rl PAYMENT_REQUIRED "client/app/(templates)"` returns exactly
`holi/hooks/useHoliEditor.ts` and `apology-dashboard/hooks/useApologyEditor.ts`.
The other 41 editor hooks receive the 402, fall into a generic `catch`, and show
"Publish failed. Please try again." — so making any other template paid today
produces a template that simply cannot be published, with no explanation.

**3.3 `create-order` 403s for 39 of 45 templates.**
`payment.controller.ts` verifies page ownership through a local `PAGE_MODELS`
map that lists **six** templateTypes: `holi, eid, wedding, reception, birthday,
valentine`. `verifyPageOwnership` returns `false` for anything else, so
`POST /payment/create-order` answers `403 Page not found or access denied`.
Even with 3.2 fixed, a paid Rakhi template would show a paywall that cannot take
money. This is the defect most likely to be missed, because nothing fails until
a super admin prices the 7th template.

**3.4 Seven publish endpoints have no gate at all.**
36 controllers call `checkPublishAccess`; 46 have a publish handler. Excluding
`activity`, `admin` and `share`, which do not publish pages, the gap is:

```
birthdayPage  christianWeddingPage  eidPage  receptionPage
shaadiCardPage  valentinePage  weddingPage
```

Five of those seven are exactly the templates the current config marks free —
`eid, wedding, reception, birthday, valentine` — which is why nobody noticed: a
gate that is never called is invisible while everything is free. The moment a
super admin prices one, it publishes for free anyway, and the panel reports a
price that is not being charged. A silent hole rather than a visible failure,
which makes it the most important item in this list.

**3.5 There is no super-admin pricing UI.** Nothing to build on; `/admin/templates`
(visibility) is the pattern to copy.

## 4. Decisions taken

Recorded because each rules out an alternative someone will reach for later.

**4.1 The super admin types the final price. MRP is derived.**
Two inputs, `finalPrice` and `discountPercent`; the struck-out MRP is computed:

```
mrpPaise = round(finalPricePaise / (1 - discountPercent / 100))
```

₹10 at 90% off displays as `₹̶1̶0̶0̶  ₹10  ·  90% OFF  ·  You save ₹90`.

Why this direction and not MRP-first: the number that must be exact is the one
being charged. Deriving the charge from an MRP and a percentage means rounding
decides what the customer pays, which is how `499 @ 80%` became a charge of
₹99.80 rounded to ₹99 with a badge that no longer tells the truth. Deriving the
display instead puts the rounding somewhere harmless — nobody audits a
strike-through.

**4.2 Money is stored as integer paise, and MRP is never stored.**
One field, `finalPricePaise`, is the source of truth for both the Razorpay charge
and every display. Rupees are a presentation concern, computed at the edges.
Storing a derived MRP would create a third number that can disagree with the
other two, which is defect 3.1 rebuilt in the database.

**4.3 Rows are keyed by slug.**
The admin panel, the gallery, the editor route and `client/data/template-registry.ts`
are all keyed by slug. `templateType` is a server-internal name that is often a
near-synonym of the slug (`eid` / `eid-mubarak`, `birthday` / `birthday-gf`) and
covers 45 entries against the registry's 52. Keying on slug means the price a
super admin sets, the badge in the gallery, and the number in the paywall are
looked up by the same string.

The gate receives `templateType`, so exactly one translation is needed. It is
derived, not written by hand — `TEMPLATE_LOOKUPS` already carries
`editorRoute: "/eid-mubarak"`, and the slug is that minus the leading slash.

**4.4 Pages already published stay free, forever.**
A super admin turning a template paid must never break something already shared.
The existing gate rule 2 (`isAlreadyPublished` → allowed) is exactly this
behaviour, and it also delivers "paid once, re-publish free" for free. The
`allowRePublishFree` config flag is therefore **removed** rather than exposed:
it is a knob whose only wrong setting silently breaks live pages, and there is no
scenario in which we want it off.

**4.5 Points stay, as a second button.** `spend-points` works and the points
economy exists; the pricing row gains a `pointsCost` field so a super admin sets
both prices for a template together.

**4.6 A template with no row is free.** New templates arrive in production the
moment their code does. Defaulting them to paid would put a paywall in front of
a page nobody has priced.

## 5. Architecture

### 5.1 Server

**New: `models/TemplatePricing.ts`** — one row per template a super admin has
decided about, mirroring `TemplateVisibility` (same shape, same reasoning: a list
of decisions, not a mirror of the app).

```ts
{
  slug:             String,   // unique, lowercase, indexed
  isFree:           Boolean,
  finalPricePaise:  Number,   // integer; 0 when isFree
  discountPercent:  Number,   // 0..99
  pointsCost:       Number,   // integer >= 0
  updatedByEmail:   String,
  createdAt, updatedAt
}
```

**Rewritten: `config/templatePricing.ts`** — keeps the type and the math, gains a
cached DB read. Structure copied from `config/templateVisibility.ts`:
30s TTL, module-level cache, `invalidatePricingCache()` called by every mutation.

Exports:
- `derivePricing(row) → ResolvedPricing` — pure; the MRP formula lives here alone.
- `getPricingBySlug(slug) → Promise<ResolvedPricing>` — row or free default.
- `getPricing(templateType) → Promise<ResolvedPricing>` — translates, then above.
  Signature becomes async; every caller already sits in an async function.
- `allPricing() → Promise<Record<slug, ResolvedPricing>>` — for the public endpoint.
- `invalidatePricingCache()`.

**New: `config/templateSlugs.ts`** — the `templateType ↔ slug` map, derived from
`TEMPLATE_LOOKUPS` at module load, plus a boot-time assertion that every lookup
yields a non-empty slug. A silent gap here prices the wrong template.

**Changed: `services/publishGate.service.ts`** — same four rules, `await`ed
pricing, `allowRePublishFree` removed (rule 2 becomes unconditional). The 402
payload keeps its shape so the two editors that already read it keep working.

**Gate added to the seven ungated publish handlers** (defect 3.4):
`birthdayPage`, `christianWeddingPage`, `eidPage`, `receptionPage`,
`shaadiCardPage`, `valentinePage`, `weddingPage`. Each gets the same block the
other 36 already have. A test asserts the invariant rather than the list: every
`TEMPLATE_LOOKUPS` templateType must reach a publish handler that consults the
gate, so the next template added cannot reintroduce the hole.

**Changed: `controllers/payment.controller.ts`**
- `getPricingConfig` becomes async, returns `allPricing()` keyed by slug, and
  sets `Cache-Control: public, max-age=60, stale-while-revalidate=300` — the
  header `/api/template-visibility` already uses, for the same reason.
- `PAGE_MODELS` (6 entries) is **deleted** and ownership resolves through
  `TEMPLATE_LOOKUPS` (45 entries). This is defect 3.3.
- `createOrder` reads the DB price, so the amount charged cannot be stale.

**New: `controllers/templatePricing.controller.ts`** — `requireSuperAdmin`, and
audited through the existing `audit()` service on every write:

| Route | Does |
|---|---|
| `GET /api/admin/template-pricing` | rows + defaults, for the panel |
| `PATCH /api/admin/template-pricing` | bulk write (mirrors `pinAll`) |
| `PATCH /api/admin/template-pricing/:slug` | one template |
| `DELETE /api/admin/template-pricing/:slug` | drop the decision → free |

Route order matters: the bulk `PATCH` is registered before `PATCH /:slug`, for the
reason already commented in `admin.routes.ts`.

Validation, server-side and total: slug matches `SLUG_RE`; `discountPercent` is an
integer 0–99 (100 would divide by zero); `finalPricePaise` is an integer ≥ 100
(₹1) when paid; `pointsCost` is an integer ≥ 0. A paid template with a price of
zero is rejected rather than stored — it would render a paywall asking for ₹0.

### 5.2 Client

**`config/templatePricing.ts` stops holding numbers.** It keeps the types and
`derivePricing()` and nothing else. This deletes the mirror, and with it 3.1.

**New: `hooks/useTemplatePricing.ts`** — reads `GET /api/payment/pricing` once per
session into a module-level cache (the pattern `lib/templateVisibility.ts`
already uses for the gallery), exposes `pricingFor(slug)`. Failure mode is
**free**: if this request fails, publishing must not break, and a missed charge is
cheaper than a template nobody can publish.

**`hooks/useTemplatePayment.ts` → `hooks/usePublishGate.ts`** — the one piece of
new logic. It owns the whole publish path, so no editor has to:

1. not signed in → open `AuthModal`, park the intent
2. signed in → run the caller's `publish()`
3. `402 PAYMENT_REQUIRED` → open `PaymentModal` with the priced row
4. paid, by card or points → re-run `publish()`
5. success / failure → toast

Adapter surface, deliberately tiny:

```ts
const gate = usePublishGate({ slug, templateType, pageId, publish });
```

Each editor's change is then replacing its inline 402 branch with
`gate.handlePublishResult(result)` — about five lines. 41 mechanical edits, not
41 new implementations. Existing per-template login handling stays where it is;
this hook does not try to unify the editors' auth-deferred publish, which already
works.

**`components/PaymentModal.tsx`** — restyled to the SubhSandesh new theme (load
the `subhsandesh-theme` skill first; the current modal is dark navy and gold).
Content: template name, `90% OFF` badge, struck MRP beside the price, "You save
₹90", `Pay ₹10` primary, `Use 50 points` secondary with the user's balance and a
disabled state when short.

**`components/TemplateCard.tsx`** — paid cards show the live discount and price;
free cards a quiet "Free" pill. Numbers come from the pricing hook, so a
super admin's change reaches the gallery within the cache window.

**New: `app/(app)/admin/pricing/page.tsx`** — visual language of
`/admin/templates`, including its "editing `<host>`" banner. Per row: a Free/Paid
control; when paid, final price, discount and points cost, beside a live render of
the actual paywall card as they type. Search, Free/Paid filter, counts.

`admin/layout.tsx` gates on `isAdmin`, which admits a plain admin, so this page
does its own `isSuperAdmin` check and redirects otherwise. `/admin` is already
`Disallow`ed in `lib/site-routes.ts`, which covers `/admin/*`, so `seo:check`
needs nothing.

## 6. Data flow

```
super admin types ₹10 / 90%
   → PATCH /api/admin/template-pricing/holi { isFree:false, finalPricePaise:1000, discountPercent:90 }
   → row written, audit written, invalidatePricingCache()

user presses Publish on /holi
   → not signed in? AuthModal, intent parked, replayed after login
   → POST /api/holi-pages/:id/publish
   → checkPublishAccess: not free, not already published, no PaymentOrder
   → 402 { error:"PAYMENT_REQUIRED", pricing:{ finalPrice:10, mrp:100, discountPercent:90, pointsCost:50 } }
   → PaymentModal: ₹̶1̶0̶0̶  ₹10  90% OFF
   → POST /payment/create-order (amount read from DB) → Razorpay → POST /payment/verify
   → PaymentOrder.status = "paid"
   → publish replayed → 200 → page live, share UI appears
```

## 7. Failure modes

| If | Then |
|---|---|
| pricing API unreachable (client) | treat every template as free; publishing never blocks on it |
| pricing DB read fails (server) | gate treats template as free — a missed charge beats a dead Publish button |
| payment succeeds, publish replay fails | `PaymentOrder` is `paid`; retrying Publish passes gate rule 3, no second charge |
| user closes Razorpay | `PAYMENT_CANCELLED` → back to idle, not an error (already handled) |
| template turned paid while a draft is open | paywall appears at Publish, which is where it would have appeared anyway |
| already-published page, template turned paid | rule 2: stays live, re-publishes free |
| `discountPercent` = 100 | rejected by validation; would divide by zero |

## 8. Testing

**Server unit** — MRP derivation (₹10/90% → ₹100; 0%; 99%; integer paise
preserved); gate across all four paths (free / grandfathered / paid-unpaid /
paid-paid); admin endpoint auth (normal, admin, superadmin, impersonated) and
every validation rejection; `templateType ↔ slug` map covers all 45 lookups.

**Server invariants** — two tests that fail when a future template reopens a hole
this work closed: every `TEMPLATE_LOOKUPS` templateType resolves to a page model
for ownership (3.3), and to a publish handler that consults the gate (3.4).

**Contract** — boot the server against an isolated Mongo and drive the client
against it, per house practice, to catch client/server drift before staging.

**Playwright on `stag.subhsandesh.in`** (CDP cache disabled first, or stale dev
chunks will be debugged instead of code):
1. free template — build, publish, no modal, page live
2. price a template from `/admin/pricing`, confirm the gallery badge
3. logged-out publish on it — login, then the paywall with the right numbers
4. Razorpay test card → page live and shareable
5. re-publish the same page → free
6. the same run against `eid-mubarak` — one of the seven previously ungated
   handlers, and the case that would silently publish free if 3.4 regressed
7. `/admin/pricing` as a plain admin → redirected

**Manual** — the panel's live preview matches the paywall exactly.

## 9. Sequencing

Server before client: the client's pricing hook needs a real endpoint, and the
gate must be correct before 43 editors start relying on it.

1. Model, config rewrite + math, slug map, unit tests
2. Gate change; gate added to the 7 ungated handlers (3.4) + the invariant test;
   `PAGE_MODELS` removal (3.3); payment controller
3. Admin endpoints + audit + validation tests
4. `/admin/pricing` panel
5. Client pricing hook, mirror deleted, `PaymentModal` retheme, `TemplateCard`
6. `usePublishGate`, proven on `holi` and `apology-dashboard` (the two that
   already work — regression cover for free)
7. The remaining 41 editors, in batches, typecheck between batches
8. Contract run, then staging, then merge to `dev`

Steps 2 and 3 are the ones that must be right. 3.3 and 3.4 are both invisible
until a super admin prices the wrong template, so each ships with a test that
asserts coverage across `TEMPLATE_LOOKUPS` rather than a list someone has to
remember to extend.

## 10. Out of scope

Refunds, coupons, subscriptions, per-user pricing, currencies other than INR,
regional pricing, a receipts page, and unifying the 43 editors' auth-deferred
publish into one hook. Each is a separate piece of work; naming them here is how
they stay out of this one.
