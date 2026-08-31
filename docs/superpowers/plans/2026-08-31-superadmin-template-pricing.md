# Super-Admin Template Pricing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A super admin sets any template free or paid — price, discount and points cost — from `/admin/pricing` with no deploy, and every one of the 42 publishable templates shows a correct paywall at Publish and goes live only once paid.

**Architecture:** Pricing moves from two hardcoded mirrored files into a `TemplatePricing` collection keyed by template slug, read through a 30s-cached config module (the shape `config/templateVisibility.ts` already uses). Integer paise is the single source of truth; the struck-out MRP is derived, never stored. On the client the mirror is deleted and numbers come from the existing public pricing endpoint; a single global paywall host plus one `usePublishGate` hook replaces per-editor 402 handling, so each of the 40 remaining editors needs one ~6-line edit in one file.

**Tech Stack:** Node 22 / Express / Mongoose / TypeScript (server), Next.js 15 App Router / React / Redux Toolkit / framer-motion / lucide-react (client), Razorpay Checkout, `node --import tsx --test` for unit tests (zero new dependencies), standalone integration scripts in `server/scripts/` for endpoint tests, Playwright via MCP for browser flows.

**Spec:** `client/docs/superpowers/specs/2026-08-31-superadmin-template-pricing-design.md`

## Global Constraints

- **Branch:** `feat/superadmin-template-pricing`, already created off `dev` in **both** `client/` and `server/`. Never commit to `main` or `dev` directly. Merge target is `dev`.
- **Verify on staging, not dev:** a `dev` deploy serves `stag.subhsandesh.in`. `dev.subhsandesh.in` serves the production build.
- **No new dependencies** in either repo. Unit tests run through the already-installed `tsx`.
- **Money is integer paise everywhere.** Never store, transmit, or compare rupees as a float. `finalPricePaise` is the only authoritative amount.
- **MRP is always derived, never stored:** `mrpPaise = Math.round(finalPricePaise / (1 - discountPercent / 100))`.
- **`discountPercent` is an integer 0–99.** 100 divides by zero and must be rejected by validation.
- **A paid template must have `finalPricePaise >= 100`** (₹1). A paid template priced at 0 is rejected, not stored.
- **A template with no `TemplatePricing` row is FREE.** Never default to paid.
- **Fail open, always.** If pricing cannot be read — client or server — treat the template as free. A missed charge is recoverable; a Publish button that cannot work is not.
- **Rows are keyed by slug** (e.g. `eid-mubarak`), not `templateType` (e.g. `eid`). One slug, `birthday-gf`, is served by two templateTypes (`birthday` and `birthday-gf`); both resolve to the same price, which is intended.
- **Super admin only.** Pricing reads and writes use `requireSuperAdmin`, not `requireAdmin`. `admin/layout.tsx` gates on `isAdmin` and admits plain admins, so the pricing page performs its own check.
- **Every pricing write is audited** through the existing `audit()` service in `server/src/services/adminAudit.ts`.
- **Theme:** all new and restyled client UI uses the SubhSandesh **new** theme. Invoke the `subhsandesh-theme` skill before writing any styles. Never the old cream+gold Playfair palette.
- **Commit after every task.** Conventional Commits, and end every commit message with:
  `Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>`

## Reference Data

### The 42 publishable slugs, their file, and their templateType

`REWIRE` = already handles the 402, gets converted to the new hook (regression cover).
`SWEEP` = receives the paywall for the first time.

| Slug | File under `client/app/(templates)/<slug>/` | templateType | Task |
|---|---|---|---|
| apology-dashboard | `hooks/useApologyEditor.ts` | `apology-dashboard` | 14 (REWIRE) |
| holi | `hooks/useHoliEditor.ts` | `holi` | 14 (REWIRE) |
| app | `hooks/useAppEditor.ts` | `app` | 15 |
| birthday-gf | `hooks/useBirthdayEditor.ts` | `birthday-gf` | 15 |
| bouquet-gf | `hooks/useBouquetEditor.ts` | `bouquet-gf` | 15 |
| call | `hooks/useCallEditor.ts` | `call` | 15 |
| capsule | `hooks/useCapsuleEditor.ts` | `capsule` | 15 |
| catch | `hooks/useCatchEditor.ts` | `catch` | 15 |
| challan | `hooks/useChallanEditor.ts` | `challan` | 15 |
| christian-wedding | `hooks/useChristianWeddingEditor.ts` | `christian-wedding` | 16 |
| court-marriage | `hooks/useCourtMarriageEditor.ts` | `court-marriage` | 16 |
| court-of-love | `hooks/useCourtOfLoveEditor.ts` | `court-of-love` | 16 |
| darling | `hooks/useDarlingEditor.ts` | `darling` | 16 |
| date-invitation | `hooks/useDateInvitationEditor.ts` | `date-invitation` | 16 |
| dedication | `hooks/useDedicationEditor.ts` | `dedication` | 16 |
| eid-mubarak | `hooks/useEidEditor.ts` | `eid` | 16 |
| flags | `hooks/useFlagsEditor.ts` | `flags` | 16 |
| happy-rakshabandhan-to-brother | `hooks/useRakhiEditor.ts` | `raksha-bandhan` | 17 |
| happy-rakshabandhan-to-sister | `hooks/useSisterEditor.ts` | `raksha-bandhan-sister` | 17 |
| hold-my-hand | `hooks/useHoldMyHandEditor.ts` | `hold-my-hand` | 17 |
| kundli-milan | `hooks/useKundliMilanEditor.ts` | `kundli-milan` | 17 |
| legal-notice | `hooks/useLegalNoticeEditor.ts` | `legal-notice` | 17 |
| love-gf | `hooks/useLoveEditor.ts` | `love-gf` | 17 |
| loveflix | `hooks/useLoveflixEditor.ts` | `loveflix` | 17 |
| missyou-gf | `hooks/useMissYouEditor.ts` | `missyou-gf` | 17 |
| nutrition | `hooks/useNutritionEditor.ts` | `nutrition` | 18 |
| photo-puzzle | `hooks/usePhotoPuzzleEditor.ts` | `photo-puzzle` | 18 |
| product | `hooks/useProductEditor.ts` | `product` | 18 |
| profile-pro | `hooks/useProfileEditor.ts` | `profile-pro` | 18 |
| proposal | `hooks/useProposalEditor.ts` | `proposal` | 18 |
| reception | `hooks/useReceptionEditor.ts` | `reception` | 18 |
| recharge | `hooks/useRechargeEditor.ts` | `recharge` | 18 |
| rewind | `hooks/useRewindEditor.ts` | `rewind` | 18 |
| searched | `hooks/useSearchedEditor.ts` | `searched` | 19 |
| shaadi-card | `hooks/useShaadiCardEditor.ts` | `shaadi` | 19 |
| streak | `hooks/useStreakEditor.ts` | `streak` | 19 |
| train-ticket | `hooks/useTrainTicketEditor.ts` | `train-ticket` | 19 |
| us | `hooks/useUsEditor.ts` | `us` | 19 |
| valentine-gf | `page.tsx` (**not** a hook) | `valentine` | 19 |
| vending-machine | `hooks/useVendingMachineEditor.ts` | `vending-machine` | 19 |
| watch | `hooks/useWatchEditor.ts` | `watch` | 19 |
| wedding-shaadi | `hooks/useWeddingEditor.ts` | `wedding` | 19 |

### The 10 slugs that CANNOT be priced

These appear in the gallery but have no publish path, so a price on them would never be charged. The panel must label them, not silently accept a price (Task 13).

`anniversary-parents`, `birthday-bestfriend`, `birthday-friend`, `birthday-parents`, `christian-wedding-2`, `missyou-bestfriend`, `sorry-friend`, `sorry-gf`, `valentine-bestfriend` — static pages: empty `hooks/`, no Publish button, no API calls at all.

`anniversary-gf` — **pre-existing break, not caused by this work.** `hooks/useAnniversaryEditor.ts` POSTs to `/anniversary-pages/:id/publish`, but the server has no anniversary controller, model or route. That publish already 404s. Do not fix it here; record it and move on.

### The seven ungated publish handlers (server)

`birthdayPage`, `christianWeddingPage`, `eidPage`, `receptionPage`, `shaadiCardPage`, `valentinePage`, `weddingPage` — Task 5.

---

## Task 1: Pricing math

The pure functions every other task depends on. No database, no Express.

**Files:**
- Create: `server/src/config/pricingMath.ts`
- Create: `server/src/config/pricingMath.test.ts`
- Modify: `server/package.json` (add `test:unit` script)

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `interface PricingRow { slug: string; isFree: boolean; finalPricePaise: number; discountPercent: number; pointsCost: number }`
  - `interface ResolvedPricing { slug: string; isFree: boolean; finalPricePaise: number; finalPrice: number; mrpPaise: number; mrp: number; savingsPaise: number; savings: number; discountPercent: number; pointsCost: number }`
  - `derivePricing(row: PricingRow): ResolvedPricing`
  - `freePricing(slug: string): ResolvedPricing`
  - `validatePricingInput(input: unknown): { ok: true; value: PricingRow } | { ok: false; error: string }`

- [ ] **Step 1: Add the test script**

In `server/package.json`, add to `"scripts"`:

```json
"test:unit": "node --import tsx --test \"src/**/*.test.ts\""
```

- [ ] **Step 2: Write the failing test**

Create `server/src/config/pricingMath.test.ts`:

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { derivePricing, freePricing, validatePricingInput } from "./pricingMath";

const paid = (finalPricePaise: number, discountPercent: number) =>
  derivePricing({ slug: "holi", isFree: false, finalPricePaise, discountPercent, pointsCost: 50 });

test("the spec example: ₹10 at 90% off implies an MRP of ₹100", () => {
  const p = paid(1000, 90);
  assert.equal(p.finalPrice, 10);
  assert.equal(p.mrp, 100);
  assert.equal(p.savings, 90);
  assert.equal(p.discountPercent, 90);
});

test("zero discount means MRP equals the price and nothing is saved", () => {
  const p = paid(9900, 0);
  assert.equal(p.mrp, 99);
  assert.equal(p.finalPrice, 99);
  assert.equal(p.savings, 0);
});

test("99% off is allowed and does not overflow", () => {
  const p = paid(100, 99);
  assert.equal(p.finalPrice, 1);
  assert.equal(p.mrp, 100);
});

test("paise stay integers through derivation", () => {
  const p = paid(333, 67);
  assert.ok(Number.isInteger(p.mrpPaise), `mrpPaise was ${p.mrpPaise}`);
  assert.ok(Number.isInteger(p.savingsPaise), `savingsPaise was ${p.savingsPaise}`);
  assert.equal(p.savingsPaise, p.mrpPaise - p.finalPricePaise);
});

test("a free row prices at zero and never claims a discount", () => {
  const p = freePricing("eid-mubarak");
  assert.equal(p.isFree, true);
  assert.equal(p.finalPricePaise, 0);
  assert.equal(p.mrpPaise, 0);
  assert.equal(p.discountPercent, 0);
  assert.equal(p.savings, 0);
});

test("a free row ignores any price that came with it", () => {
  const p = derivePricing({ slug: "x", isFree: true, finalPricePaise: 5000, discountPercent: 80, pointsCost: 9 });
  assert.equal(p.finalPricePaise, 0);
  assert.equal(p.mrpPaise, 0);
  assert.equal(p.discountPercent, 0);
});

test("validation accepts a well-formed paid row", () => {
  const r = validatePricingInput({ isFree: false, finalPricePaise: 1000, discountPercent: 90, pointsCost: 50 });
  assert.equal(r.ok, true);
});

test("validation rejects a 100% discount, which would divide by zero", () => {
  const r = validatePricingInput({ isFree: false, finalPricePaise: 1000, discountPercent: 100, pointsCost: 0 });
  assert.equal(r.ok, false);
});

test("validation rejects a paid template priced below ₹1", () => {
  for (const finalPricePaise of [0, 99, -100]) {
    const r = validatePricingInput({ isFree: false, finalPricePaise, discountPercent: 0, pointsCost: 0 });
    assert.equal(r.ok, false, `accepted ${finalPricePaise}`);
  }
});

test("validation rejects non-integer money and percentages", () => {
  assert.equal(validatePricingInput({ isFree: false, finalPricePaise: 1000.5, discountPercent: 90, pointsCost: 0 }).ok, false);
  assert.equal(validatePricingInput({ isFree: false, finalPricePaise: 1000, discountPercent: 90.5, pointsCost: 0 }).ok, false);
  assert.equal(validatePricingInput({ isFree: false, finalPricePaise: 1000, discountPercent: 90, pointsCost: -1 }).ok, false);
});

test("validation accepts a free row without requiring a price", () => {
  const r = validatePricingInput({ isFree: true });
  assert.equal(r.ok, true);
  if (r.ok) {
    assert.equal(r.value.finalPricePaise, 0);
    assert.equal(r.value.discountPercent, 0);
  }
});
```

- [ ] **Step 3: Run it and confirm it fails**

Run: `cd server && npm run test:unit`
Expected: FAIL — `Cannot find module './pricingMath'`.

- [ ] **Step 4: Implement the math**

Create `server/src/config/pricingMath.ts`:

```ts
// ─── Pricing arithmetic ──────────────────────────────────────────────────────
//
// Pure functions, no database and no Express, because both the publish gate and
// the admin panel's live preview must agree to the rupee and the only way to be
// sure of that is for them to run the same code.
//
// ── WHY THE PRICE IS THE INPUT AND THE MRP IS DERIVED ───────────────────────
//
// The number that has to be exact is the one being charged. Deriving the charge
// from an MRP and a percentage puts rounding in control of what the customer
// pays — which is how the config this replaces ended up advertising "80% off
// ₹499" while charging ₹99, when 499 × 0.20 is ₹99.80. Deriving the MRP instead
// puts the rounding on the strike-through, where nobody is counting.
//
// ── WHY INTEGER PAISE ───────────────────────────────────────────────────────
//
// Razorpay charges in paise, and floats do not add up. `finalPricePaise` is the
// only stored amount; rupees exist for display and are computed at the edges.

/** What a super admin decided, as stored. */
export interface PricingRow {
  slug: string;
  isFree: boolean;
  finalPricePaise: number;
  discountPercent: number;
  pointsCost: number;
}

/** What every surface renders — stored values plus everything derived. */
export interface ResolvedPricing {
  slug: string;
  isFree: boolean;
  finalPricePaise: number;
  finalPrice: number;
  mrpPaise: number;
  mrp: number;
  savingsPaise: number;
  savings: number;
  discountPercent: number;
  pointsCost: number;
}

const toRupees = (paise: number): number => Math.round(paise) / 100;

/**
 * The MRP implied by a price and a discount.
 *
 * A 100% discount is unrepresentable — it divides by zero — and is rejected by
 * `validatePricingInput` long before it reaches here. The clamp is a second
 * line of defence for a row written before that validation existed.
 */
export function deriveMrpPaise(finalPricePaise: number, discountPercent: number): number {
  const pct = Math.min(Math.max(discountPercent, 0), 99);
  if (pct === 0) return finalPricePaise;
  return Math.round(finalPricePaise / (1 - pct / 100));
}

export function derivePricing(row: PricingRow): ResolvedPricing {
  // A free template has no price, no MRP and no discount, whatever the row says.
  // Rows can carry stale numbers from before they were switched to free, and a
  // paywall that reads "80% off ₹0" is worse than no paywall.
  if (row.isFree) {
    return {
      slug: row.slug,
      isFree: true,
      finalPricePaise: 0, finalPrice: 0,
      mrpPaise: 0, mrp: 0,
      savingsPaise: 0, savings: 0,
      discountPercent: 0,
      pointsCost: 0,
    };
  }

  const finalPricePaise = Math.round(row.finalPricePaise);
  const mrpPaise = deriveMrpPaise(finalPricePaise, row.discountPercent);
  const savingsPaise = mrpPaise - finalPricePaise;

  return {
    slug: row.slug,
    isFree: false,
    finalPricePaise, finalPrice: toRupees(finalPricePaise),
    mrpPaise, mrp: toRupees(mrpPaise),
    savingsPaise, savings: toRupees(savingsPaise),
    discountPercent: row.discountPercent,
    pointsCost: Math.max(0, Math.round(row.pointsCost)),
  };
}

/** The default for every template nobody has priced. */
export function freePricing(slug: string): ResolvedPricing {
  return derivePricing({ slug, isFree: true, finalPricePaise: 0, discountPercent: 0, pointsCost: 0 });
}

const isInt = (v: unknown): v is number => typeof v === "number" && Number.isInteger(v);

/**
 * Validate an admin's pricing input. Total, and server-side: the panel's own
 * checks are a convenience for the person typing, not a boundary.
 */
export function validatePricingInput(
  input: unknown
): { ok: true; value: PricingRow } | { ok: false; error: string } {
  if (typeof input !== "object" || input === null) {
    return { ok: false, error: "Body must be an object" };
  }
  const o = input as Record<string, unknown>;

  if (typeof o.isFree !== "boolean") {
    return { ok: false, error: "isFree must be true or false" };
  }

  if (o.isFree) {
    // Nothing else matters, and requiring a price to declare something free
    // would mean the panel had to invent one.
    return {
      ok: true,
      value: { slug: "", isFree: true, finalPricePaise: 0, discountPercent: 0, pointsCost: 0 },
    };
  }

  if (!isInt(o.finalPricePaise) || o.finalPricePaise < 100) {
    return { ok: false, error: "A paid template needs a whole price of at least ₹1 (100 paise)" };
  }
  if (!isInt(o.discountPercent) || o.discountPercent < 0 || o.discountPercent > 99) {
    return { ok: false, error: "discountPercent must be a whole number from 0 to 99" };
  }
  const pointsCost = o.pointsCost === undefined ? 0 : o.pointsCost;
  if (!isInt(pointsCost) || pointsCost < 0) {
    return { ok: false, error: "pointsCost must be a whole number of 0 or more" };
  }

  return {
    ok: true,
    value: {
      slug: "",
      isFree: false,
      finalPricePaise: o.finalPricePaise,
      discountPercent: o.discountPercent,
      pointsCost,
    },
  };
}
```

- [ ] **Step 5: Run the tests and confirm they pass**

Run: `cd server && npm run test:unit`
Expected: PASS, 11 tests, 0 failures.

- [ ] **Step 6: Commit**

```bash
cd server
git add package.json src/config/pricingMath.ts src/config/pricingMath.test.ts
git commit -m "feat(pricing): derive the MRP from the price, not the price from the MRP

The number that must be exact is the one being charged. The config this
replaces advertised 80% off 499 while charging 99, because 499 x 0.20 is
99.80 and something had to round. Deriving the strike-through instead puts
the rounding where nobody is counting, and integer paise keeps floats out
of money.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

## Task 2: The slug map

`checkPublishAccess` is handed a `templateType`; pricing rows are keyed by slug. This is the one translation, and it is derived rather than hand-written so a new template cannot be priced against a slug nobody wrote down.

**Files:**
- Create: `server/src/config/templateSlugs.ts`
- Create: `server/src/config/templateSlugs.test.ts`

**Interfaces:**
- Consumes: `TEMPLATE_LOOKUPS` from `server/src/controllers/share.controller.ts` (each entry has `templateType` and `editorRoute` like `"/eid-mubarak"`).
- Produces:
  - `slugForTemplateType(templateType: string): string`
  - `templateTypesForSlug(slug: string): string[]`
  - `allTemplateTypeSlugPairs(): Array<{ templateType: string; slug: string }>`

- [ ] **Step 1: Write the failing test**

Create `server/src/config/templateSlugs.test.ts`:

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { slugForTemplateType, templateTypesForSlug, allTemplateTypeSlugPairs } from "./templateSlugs";

test("translates the templateTypes whose slug differs from their name", () => {
  assert.equal(slugForTemplateType("eid"), "eid-mubarak");
  assert.equal(slugForTemplateType("wedding"), "wedding-shaadi");
  assert.equal(slugForTemplateType("valentine"), "valentine-gf");
  assert.equal(slugForTemplateType("shaadi"), "shaadi-card");
  assert.equal(slugForTemplateType("raksha-bandhan"), "happy-rakshabandhan-to-brother");
  assert.equal(slugForTemplateType("raksha-bandhan-sister"), "happy-rakshabandhan-to-sister");
});

test("passes through the templateTypes that already are their slug", () => {
  assert.equal(slugForTemplateType("holi"), "holi");
  assert.equal(slugForTemplateType("apology-dashboard"), "apology-dashboard");
});

test("both birthday templateTypes share one slug, so both take one price", () => {
  assert.equal(slugForTemplateType("birthday"), "birthday-gf");
  assert.equal(slugForTemplateType("birthday-gf"), "birthday-gf");
  assert.deepEqual(templateTypesForSlug("birthday-gf").sort(), ["birthday", "birthday-gf"]);
});

test("an unknown templateType maps to itself rather than throwing", () => {
  // A template can reach the gate before anyone adds it to TEMPLATE_LOOKUPS.
  // Returning the input means it gets the free default, not a 500.
  assert.equal(slugForTemplateType("not-a-real-template"), "not-a-real-template");
});

test("every lookup yields a non-empty slug", () => {
  const pairs = allTemplateTypeSlugPairs();
  assert.ok(pairs.length >= 43, `only ${pairs.length} pairs found`);
  for (const { templateType, slug } of pairs) {
    assert.ok(slug && slug.length > 0, `${templateType} produced an empty slug`);
    assert.ok(!slug.startsWith("/"), `${templateType} kept its leading slash: ${slug}`);
  }
});
```

- [ ] **Step 2: Run it and confirm it fails**

Run: `cd server && npm run test:unit`
Expected: FAIL — `Cannot find module './templateSlugs'`.

- [ ] **Step 3: Implement the map**

Create `server/src/config/templateSlugs.ts`:

```ts
// ─── templateType ↔ slug ─────────────────────────────────────────────────────
//
// The gate is handed a `templateType`. Pricing rows are keyed by slug, because
// the admin panel, the gallery and `client/data/template-registry.ts` all key on
// slug and a price is only useful if all three agree which template it is on.
// So exactly one translation is needed, and this is it.
//
// ── WHY DERIVED AND NOT A SECOND LIST ───────────────────────────────────────
//
// `TEMPLATE_LOOKUPS` already carries both halves: `templateType: "eid"` and
// `editorRoute: "/eid-mubarak"`, and the slug is the editor route minus its
// leading slash. A hand-written map here would be a second list to keep in step,
// and the failure mode of forgetting is a template priced against a slug that
// nothing reads — a price the panel shows and nobody is charged.

import { TEMPLATE_LOOKUPS } from "../controllers/share.controller";

const typeToSlug = new Map<string, string>();
const slugToTypes = new Map<string, string[]>();

for (const { templateType, editorRoute } of TEMPLATE_LOOKUPS) {
  const slug = String(editorRoute || "").replace(/^\//, "").trim().toLowerCase();
  if (!templateType || !slug) continue;
  typeToSlug.set(templateType, slug);
  const list = slugToTypes.get(slug) ?? [];
  if (!list.includes(templateType)) list.push(templateType);
  slugToTypes.set(slug, list);
}

/**
 * The slug a templateType is priced under.
 *
 * An unknown templateType returns itself rather than throwing: a template can
 * reach the publish gate before anybody adds it to `TEMPLATE_LOOKUPS`, and the
 * right outcome then is the free default, not a 500 on Publish.
 */
export function slugForTemplateType(templateType: string): string {
  return typeToSlug.get(templateType) ?? templateType;
}

/**
 * Every templateType that shares a slug — currently only `birthday-gf`, served
 * by both `birthday` and `birthday-gf`. Both take the same price, which is what
 * you want: they are one template in the gallery.
 */
export function templateTypesForSlug(slug: string): string[] {
  return slugToTypes.get(slug) ?? [];
}

/** For the invariant tests. */
export function allTemplateTypeSlugPairs(): Array<{ templateType: string; slug: string }> {
  return [...typeToSlug].map(([templateType, slug]) => ({ templateType, slug }));
}
```

- [ ] **Step 4: Run the tests and confirm they pass**

Run: `cd server && npm run test:unit`
Expected: PASS. If the "every lookup yields a non-empty slug" test reports fewer than 43 pairs, `TEMPLATE_LOOKUPS` has an entry without an `editorRoute` — fix the lookup, not the test.

- [ ] **Step 5: Commit**

```bash
cd server
git add src/config/templateSlugs.ts src/config/templateSlugs.test.ts
git commit -m "feat(pricing): derive templateType to slug from the share lookups

Pricing keys on slug because the admin panel, the gallery and the template
registry all do. The gate speaks templateType. A hand-written map between
them would be a second list to forget, and forgetting means a price the
panel displays and nobody is charged.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

## Task 3: The model and the cached read

**Files:**
- Create: `server/src/models/TemplatePricing.ts`
- Rewrite: `server/src/config/templatePricing.ts` (currently a hardcoded `TEMPLATE_PRICING` record — replaced entirely)

**Interfaces:**
- Consumes: `PricingRow`, `ResolvedPricing`, `derivePricing`, `freePricing` (Task 1); `slugForTemplateType` (Task 2).
- Produces:
  - `getPricingBySlug(slug: string): Promise<ResolvedPricing>`
  - `getPricing(templateType: string): Promise<ResolvedPricing>` — **now async**; the old export was sync
  - `allPricing(): Promise<Record<string, ResolvedPricing>>`
  - `invalidatePricingCache(): void`
  - default export from the model file: the `TemplatePricing` mongoose model

- [ ] **Step 1: Create the model**

Create `server/src/models/TemplatePricing.ts`:

```ts
// ─── Template pricing ────────────────────────────────────────────────────────
//
// One row per template a super admin has priced. Nothing else.
//
// This is deliberately the same shape as `models/TemplateVisibility.ts`, for the
// same reason: the collection is a list of DECISIONS, not a mirror of the app. A
// template with no row is free, so a fresh database means everything is free —
// which is the safe direction. The alternative, a row per template, means the
// newest template is the one most likely to have no row, and "no row" would have
// to mean something.
//
// ── WHY `finalPricePaise` AND NOT A PRICE AND AN MRP ────────────────────────
//
// One authoritative amount. The MRP is derived in `config/pricingMath.ts`, so
// there is no second number that can disagree with the first. Storing the MRP
// too is the defect this collection exists to end.

import mongoose, { Schema, Document } from "mongoose";

export interface ITemplatePricing extends Document {
  slug: string;
  isFree: boolean;
  finalPricePaise: number;
  discountPercent: number;
  pointsCost: number;
  updatedByEmail: string;
  createdAt: Date;
  updatedAt: Date;
}

const templatePricingSchema = new Schema<ITemplatePricing>(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    isFree:          { type: Boolean, required: true },
    // Paise, integer. Zero whenever isFree.
    finalPricePaise: { type: Number, required: true, default: 0, min: 0 },
    discountPercent: { type: Number, required: true, default: 0, min: 0, max: 99 },
    pointsCost:      { type: Number, required: true, default: 0, min: 0 },
    updatedByEmail:  { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model<ITemplatePricing>("TemplatePricing", templatePricingSchema);
```

- [ ] **Step 2: Read the file being replaced, then rewrite it**

Run: `cat server/src/config/templatePricing.ts` — note its exports (`TemplatePricingConfig`, `TEMPLATE_PRICING`, `getPricing`) so Step 4's compile check tells you every caller to update.

Replace `server/src/config/templatePricing.ts` entirely with:

```ts
// ─── Template pricing: what a super admin decided, cached ────────────────────
//
// The rule, in one line:
//
//     price(slug) = row in TemplatePricing ? that row : FREE
//
// So a template is free until somebody prices it, and the only way to price it
// is the super-admin panel. There is no code-level default price and no list of
// paid templates in this file — that is the whole point of the change. This file
// used to BE that list, mirrored by hand in `client/config/templatePricing.ts`,
// and the two had already drifted.
//
// ── THE CACHE ───────────────────────────────────────────────────────────────
//
// Every publish and every gallery load asks this question; the answer changes a
// handful of times in the life of the deployment. Same 30s TTL and same
// invalidate-on-write as `config/templateVisibility.ts`: the mutation paths call
// `invalidatePricingCache()` so a super admin's edit is live immediately on the
// host that served it, and the TTL only exists to catch a second instance behind
// a load balancer that did not handle the write.
//
// ── FAILING OPEN ────────────────────────────────────────────────────────────
//
// A read failure returns FREE, not an error. If Mongo is unreachable the choice
// is between publishing something we might have charged for and a Publish button
// that does not work for anybody. The first is recoverable.

import TemplatePricing from "../models/TemplatePricing";
import { slugForTemplateType } from "./templateSlugs";
import {
  derivePricing,
  freePricing,
  type PricingRow,
  type ResolvedPricing,
} from "./pricingMath";

export type { PricingRow, ResolvedPricing } from "./pricingMath";

const TTL_MS = 30_000;

let cache: { rows: Map<string, PricingRow>; at: number } | null = null;

export function invalidatePricingCache(): void {
  cache = null;
}

async function rows(): Promise<Map<string, PricingRow>> {
  const now = Date.now();
  if (cache && now - cache.at < TTL_MS) return cache.rows;

  const map = new Map<string, PricingRow>();
  try {
    const docs = await TemplatePricing.find({})
      .select("slug isFree finalPricePaise discountPercent pointsCost")
      .lean();
    for (const d of docs) {
      const slug = String(d.slug);
      map.set(slug, {
        slug,
        isFree: Boolean(d.isFree),
        finalPricePaise: Number(d.finalPricePaise) || 0,
        discountPercent: Number(d.discountPercent) || 0,
        pointsCost: Number(d.pointsCost) || 0,
      });
    }
  } catch (err) {
    // Fail open. Do NOT cache a failed read — an empty map cached for 30s would
    // turn a blip into half a minute of free publishes.
    console.error("[pricing] read failed, treating every template as free:", err);
    return map;
  }

  cache = { rows: map, at: now };
  return map;
}

/** The price for a template slug. Unpriced slugs are free. */
export async function getPricingBySlug(slug: string): Promise<ResolvedPricing> {
  const key = String(slug || "").toLowerCase();
  if (!key) return freePricing(key);
  const map = await rows();
  const row = map.get(key);
  return row ? derivePricing(row) : freePricing(key);
}

/**
 * The price for a server-side templateType.
 *
 * Async, where the old hardcoded version was sync. Every caller already sits in
 * an async function, so this is an `await`, not a restructure.
 */
export async function getPricing(templateType: string): Promise<ResolvedPricing> {
  return getPricingBySlug(slugForTemplateType(templateType));
}

/** Every priced template, keyed by slug — for the public pricing endpoint. */
export async function allPricing(): Promise<Record<string, ResolvedPricing>> {
  const map = await rows();
  const out: Record<string, ResolvedPricing> = {};
  for (const [slug, row] of map) out[slug] = derivePricing(row);
  return out;
}
```

- [ ] **Step 3: Find every caller the rewrite broke**

Run: `cd server && npx tsc --noEmit 2>&1 | head -40`

Expected: errors in `services/publishGate.service.ts` and `controllers/payment.controller.ts` — the two importers of the old `TEMPLATE_PRICING` / sync `getPricing`. Tasks 4 and 6 fix them. Record the list; do not fix them here.

- [ ] **Step 4: Commit**

```bash
cd server
git add src/models/TemplatePricing.ts src/config/templatePricing.ts
git commit -m "feat(pricing): move prices into a collection a super admin owns

Prices lived in this file and were mirrored by hand in the client, so
changing one meant editing two files and deploying both. Now a template is
free until somebody prices it in the panel, reads are cached for 30s the way
template visibility is, and a read failure means free rather than a Publish
button that does not work.

Leaves publishGate and payment.controller failing to compile; the next two
commits are their callers.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

## Task 4: The publish gate

**Files:**
- Modify: `server/src/services/publishGate.service.ts` (whole file, it is ~60 lines)

**Interfaces:**
- Consumes: `getPricing`, `ResolvedPricing` (Task 3).
- Produces: `checkPublishAccess(params: { userId: string; templateType: string; pageId: string; isAlreadyPublished: boolean }): Promise<GateResult>` — signature unchanged; `GateDenied.pricing` is now a `ResolvedPricing`.

- [ ] **Step 1: Rewrite the service**

Replace `server/src/services/publishGate.service.ts` with:

```ts
import PaymentOrder from "../models/PaymentOrder";
import { getPricing } from "../config/templatePricing";
import type { ResolvedPricing } from "../config/pricingMath";

interface GateAllowed {
  allowed: true;
}

interface GateDenied {
  allowed: false;
  error: string;
  httpStatus: number;
  pricing: ResolvedPricing;
}

type GateResult = GateAllowed | GateDenied;

/**
 * Central publish gate — call this before every publish endpoint.
 *
 * Rules, in priority order:
 *  1. Free template                → allowed
 *  2. Page is already published    → allowed
 *  3. A successful PaymentOrder    → allowed
 *  4. Otherwise                    → 402 with the pricing the client renders
 *
 * ── WHY RULE 2 IS UNCONDITIONAL ────────────────────────────────────────────
 *
 * It used to depend on an `allowRePublishFree` config flag. The flag is gone.
 * It did two jobs and both want the same answer: it made "paid once, edit and
 * re-publish freely" work, and it is what stops a super admin pricing a template
 * from breaking pages people have already shared. Its only other setting silently
 * paywalls a live page whose owner published it for free last week, and there is
 * no situation where we want that — so it is behaviour now, not configuration.
 *
 * A consequence worth stating: publishing is charged per PAGE, once. That is the
 * intent. The thing being sold is a page going live, not a subscription.
 */
export async function checkPublishAccess(params: {
  userId: string;
  templateType: string;
  pageId: string;
  isAlreadyPublished: boolean;
}): Promise<GateResult> {
  const pricing = await getPricing(params.templateType);

  // Rule 1: nobody has priced this template.
  if (pricing.isFree) return { allowed: true };

  // Rule 2: it is already live. Never take that away.
  if (params.isAlreadyPublished) return { allowed: true };

  // Rule 3: paid, by card or by points.
  const payment = await PaymentOrder.findOne({
    userId: params.userId,
    pageId: params.pageId,
    status: { $in: ["paid", "points_used"] },
  });

  if (payment) return { allowed: true };

  // Rule 4: the paywall.
  return {
    allowed: false,
    error: "PAYMENT_REQUIRED",
    httpStatus: 402,
    pricing,
  };
}
```

- [ ] **Step 2: Confirm the gate compiles and its 36 existing callers still do**

Run: `cd server && npx tsc --noEmit 2>&1 | grep -c publishGate`
Expected: `0`.

Run: `cd server && npx tsc --noEmit 2>&1 | head -20`
Expected: only `payment.controller.ts` errors remain (Task 6).

- [ ] **Step 3: Commit**

```bash
cd server
git add src/services/publishGate.service.ts
git commit -m "feat(pricing): make grandfathering behaviour, not a config flag

allowRePublishFree did two jobs that want the same answer: paid-once
re-publishing, and not breaking pages people already shared when a template
becomes paid. Its only other setting silently paywalls a live page whose
owner published it for free last week. Nobody wants that, so it stops being
a switch someone can set wrong.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

## Task 5: Gate the seven ungated publish handlers

36 controllers call the gate; 46 have a publish handler. Five of the seven page controllers in the gap are exactly the templates the old config marked free, which is why nobody noticed — a gate that is never called is invisible while everything is free. Price one and it publishes for free while the panel reports a price.

**Files:**
- Modify: `server/src/controllers/birthdayPage.controller.ts`
- Modify: `server/src/controllers/christianWeddingPage.controller.ts`
- Modify: `server/src/controllers/eidPage.controller.ts`
- Modify: `server/src/controllers/receptionPage.controller.ts`
- Modify: `server/src/controllers/shaadiCardPage.controller.ts`
- Modify: `server/src/controllers/valentinePage.controller.ts`
- Modify: `server/src/controllers/weddingPage.controller.ts`
- Create: `server/src/services/publishGate.coverage.test.ts`

**Interfaces:**
- Consumes: `checkPublishAccess` (Task 4); `allTemplateTypeSlugPairs` (Task 2).
- Produces: nothing new; closes a hole.

- [ ] **Step 1: Write the failing coverage test**

This asserts the invariant, not the list, so the next template added cannot reopen the hole.

Create `server/src/services/publishGate.coverage.test.ts`:

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { allTemplateTypeSlugPairs } from "../config/templateSlugs";

const CONTROLLERS = path.join(__dirname, "..", "controllers");

/** Controllers that publish a page but are not a template page controller. */
const NOT_TEMPLATE_PAGES = new Set(["activity", "admin", "share"]);

function controllerFiles(): string[] {
  return fs.readdirSync(CONTROLLERS).filter((f) => f.endsWith(".controller.ts"));
}

test("every controller with a publish handler consults the publish gate", () => {
  const offenders: string[] = [];

  for (const file of controllerFiles()) {
    const name = file.replace(".controller.ts", "");
    if (NOT_TEMPLATE_PAGES.has(name)) continue;

    const body = fs.readFileSync(path.join(CONTROLLERS, file), "utf8");
    const publishes = /isPublished\s*=\s*true/.test(body) || /export const publish/.test(body);
    if (!publishes) continue;

    if (!body.includes("checkPublishAccess")) offenders.push(file);
  }

  assert.deepEqual(
    offenders,
    [],
    `these publish a page without consulting the gate, so pricing their template ` +
      `would charge nobody:\n  ${offenders.join("\n  ")}`
  );
});

test("every templateType in the lookups is priceable under a non-empty slug", () => {
  for (const { templateType, slug } of allTemplateTypeSlugPairs()) {
    assert.ok(slug, `${templateType} has no slug, so it cannot be priced`);
  }
});
```

- [ ] **Step 2: Run it and confirm it fails with exactly the seven**

Run: `cd server && npm run test:unit 2>&1 | grep -A 12 "without consulting"`

Expected: FAIL listing `birthdayPage`, `christianWeddingPage`, `eidPage`, `receptionPage`, `shaadiCardPage`, `valentinePage`, `weddingPage`. If the list differs, trust the test and gate what it names.

- [ ] **Step 3: Add the gate to each of the seven**

For each file, find the publish handler (`export const publish<Name>Page`), and insert the gate immediately after the page-not-found guard and before `page.isPublished = true`. This is the block the other 36 already use, copied from `holiPage.controller.ts`:

```ts
    // ── Payment gate ─────────────────────────────────────────────────────────
    const gate = await checkPublishAccess({
      userId:             String(req.userId),
      templateType:       "<TEMPLATE_TYPE>",
      pageId:             String(page._id),
      isAlreadyPublished: !!page.isPublished,
    });

    if (!gate.allowed) {
      res.status(gate.httpStatus).json({
        success:  false,
        error:    gate.error,
        pricing:  gate.pricing,
      });
      return;
    }
    // ─────────────────────────────────────────────────────────────────────────
```

And add the import at the top of each file:

```ts
import { checkPublishAccess } from "../services/publishGate.service";
```

`<TEMPLATE_TYPE>` per file — these are the strings `TEMPLATE_LOOKUPS` uses, and getting one wrong prices the wrong template:

| File | `<TEMPLATE_TYPE>` |
|---|---|
| `birthdayPage.controller.ts` | `birthday` |
| `christianWeddingPage.controller.ts` | `christian-wedding` |
| `eidPage.controller.ts` | `eid` |
| `receptionPage.controller.ts` | `reception` |
| `shaadiCardPage.controller.ts` | `shaadi` |
| `valentinePage.controller.ts` | `valentine` |
| `weddingPage.controller.ts` | `wedding` |

Note `isAlreadyPublished: !!page.isPublished` must be read **before** the assignment on the next line, or rule 2 always fires and nothing is ever charged.

- [ ] **Step 4: Run the coverage test and confirm it passes**

Run: `cd server && npm run test:unit`
Expected: PASS, all tests.

Run: `cd server && npx tsc --noEmit 2>&1 | grep -E "birthdayPage|eidPage|weddingPage|receptionPage|valentinePage|shaadiCardPage|christianWeddingPage"`
Expected: no output.

- [ ] **Step 5: Commit**

```bash
cd server
git add src/controllers/birthdayPage.controller.ts src/controllers/christianWeddingPage.controller.ts \
        src/controllers/eidPage.controller.ts src/controllers/receptionPage.controller.ts \
        src/controllers/shaadiCardPage.controller.ts src/controllers/valentinePage.controller.ts \
        src/controllers/weddingPage.controller.ts src/services/publishGate.coverage.test.ts
git commit -m "fix(pricing): seven publish handlers never consulted the gate

Five of the seven are exactly the templates the old config marked free,
which is why this went unnoticed: a gate that is never called is invisible
while everything is free. Pricing any of them would have shown a price in
the panel and charged nobody.

The test asserts the invariant rather than the list, so the next template
cannot reopen the hole.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

## Task 6: Payment controller — ownership for all templates

`verifyPageOwnership` resolves through a local 6-entry `PAGE_MODELS`, so `POST /payment/create-order` answers `403 Page not found or access denied` for the other 37 templateTypes. The paywall would open and be unable to take money.

**Files:**
- Modify: `server/src/controllers/payment.controller.ts`
- Create: `server/src/controllers/payment.ownership.test.ts`

**Interfaces:**
- Consumes: `TEMPLATE_LOOKUPS` (`share.controller.ts`); `getPricing`, `allPricing` (Task 3); `allTemplateTypeSlugPairs` (Task 2).
- Produces: `modelForTemplateType(templateType: string): mongoose.Model<unknown> | null` (exported for the test).

- [ ] **Step 1: Write the failing test**

Create `server/src/controllers/payment.ownership.test.ts`:

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { allTemplateTypeSlugPairs } from "../config/templateSlugs";
import { modelForTemplateType } from "./payment.controller";

test("every templateType that can be priced can also have its owner verified", () => {
  const missing: string[] = [];
  for (const { templateType } of allTemplateTypeSlugPairs()) {
    if (!modelForTemplateType(templateType)) missing.push(templateType);
  }
  assert.deepEqual(
    missing,
    [],
    `create-order would 403 for these, so their paywall could never take money:\n  ${missing.join("\n  ")}`
  );
});

test("an unknown templateType has no model rather than throwing", () => {
  assert.equal(modelForTemplateType("not-a-real-template"), null);
});
```

- [ ] **Step 2: Run it and confirm it fails**

Run: `cd server && npm run test:unit 2>&1 | grep -A 8 "403 for these"`
Expected: FAIL naming ~37 templateTypes.

- [ ] **Step 3: Replace `PAGE_MODELS` with the lookups**

In `server/src/controllers/payment.controller.ts`:

Delete the six model imports that exist only to build `PAGE_MODELS` (`HoliPage`, `EidPage`, `WeddingPage`, `ReceptionPage`, `BirthdayPage`, `ValentinePage`) **only if nothing else in the file uses them** — check with `grep -n "HoliPage\|EidPage\|WeddingPage\|ReceptionPage\|BirthdayPage\|ValentinePage" src/controllers/payment.controller.ts` first.

Delete the whole `PAGE_MODELS` block and replace it with:

```ts
import { TEMPLATE_LOOKUPS } from "./share.controller";

// ── Page ownership ──────────────────────────────────────────────────────────
//
// This used to be a hand-written map of six templateTypes, which meant
// `create-order` answered 403 for the other thirty-seven: a paywall that opens
// and cannot take money. Nothing failed while `holi` was the only paid template,
// and nothing would have failed until a super admin priced the seventh.
//
// `TEMPLATE_LOOKUPS` is already the single list of which templates exist and
// which model each one stores its pages in. Deriving from it means a new
// template is chargeable the moment it is shareable, with no second place to
// remember.
const MODEL_BY_TYPE = new Map<string, mongoose.Model<unknown>>(
  TEMPLATE_LOOKUPS.map(({ templateType, model }) => [templateType, model])
);

export function modelForTemplateType(templateType: string): mongoose.Model<unknown> | null {
  return MODEL_BY_TYPE.get(templateType) ?? null;
}
```

Rewrite `verifyPageOwnership` to use it:

```ts
/** Returns true if the page exists and belongs to the given userId. */
async function verifyPageOwnership(
  templateType: string,
  pageId: string,
  userId: string
): Promise<boolean> {
  const Model = modelForTemplateType(templateType);
  if (!Model) return false;
  try {
    const page = await Model.findOne({
      _id: new mongoose.Types.ObjectId(pageId),
      userId: new mongoose.Types.ObjectId(userId),
    });
    return !!page;
  } catch {
    return false;
  }
}
```

- [ ] **Step 4: Make the pricing endpoint DB-backed and cacheable**

Replace `getPricingConfig` with:

```ts
/**
 * GET /payment/pricing  — PUBLIC
 *
 * Every priced template, keyed by slug. The client reads this instead of
 * carrying a hardcoded mirror of the server's prices, which is what it used to
 * do and what made a price change a two-repo deploy.
 */
export const getPricingConfig = async (_req: Request, res: Response): Promise<void> => {
  try {
    const pricing = await allPricing();
    // Same header and same reasoning as GET /api/template-visibility: a super
    // admin's change reaching visitors about a minute later is worth not paying
    // for this read on every gallery load.
    res.set("Cache-Control", "public, max-age=60, stale-while-revalidate=300");
    res.json({ success: true, data: pricing });
  } catch (error) {
    console.error("Pricing config error:", error);
    // An empty map, not a 500. Empty means "everything is free", and the gallery
    // and the editors must not break because this read did.
    res.json({ success: true, data: {} });
  }
};
```

Update the import line to pull `allPricing` and drop `TEMPLATE_PRICING`:

```ts
import { getPricing, allPricing } from "../config/templatePricing";
```

- [ ] **Step 5: Await the now-async `getPricing` in `createOrder` and `spendPoints`**

Both call `getPricing(templateType)`. Add `await`:

```ts
const pricing = await getPricing(templateType);
```

Run: `cd server && grep -n "getPricing(" src/controllers/payment.controller.ts` — every hit must be `await getPricing(`.

`createOrder` already charges `pricing.finalPricePaise`, which now comes from the database, so the amount cannot be stale. `spendPoints` already compares `pricing.pointsCost`.

- [ ] **Step 6: Run the tests and the compiler**

Run: `cd server && npm run test:unit`
Expected: PASS, all tests including the two new ownership tests.

Run: `cd server && npx tsc --noEmit`
Expected: no output — the whole server compiles again.

- [ ] **Step 7: Commit**

```bash
cd server
git add src/controllers/payment.controller.ts src/controllers/payment.ownership.test.ts
git commit -m "fix(pricing): create-order 403'd for 37 of 43 templates

Page ownership resolved through a hand-written six-entry map, so the paywall
would open for any other template and then be unable to take money. Nothing
failed while holi was the only paid template and nothing would have failed
until the seventh was priced. It derives from TEMPLATE_LOOKUPS now, which is
already the list of which templates exist.

Also makes GET /payment/pricing read the collection, with the same cache
header template visibility uses.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

## Task 7: Admin pricing endpoints

**Files:**
- Create: `server/src/controllers/templatePricing.controller.ts`
- Modify: `server/src/routes/admin.routes.ts`
- Check: `server/src/models/AdminAuditLog.ts` — the `AuditAction` union needs a `template_pricing` member; add it if absent

**Interfaces:**
- Consumes: `validatePricingInput` (Task 1); `TemplatePricing` model, `invalidatePricingCache`, `allPricing` (Task 3); `audit()` from `services/adminAudit.ts`; `requireSuperAdmin` from `middleware/adminAuth.ts`.
- Produces:
  - `getAdminTemplatePricing`, `setTemplatePricing`, `setTemplatePricingBulk`, `clearTemplatePricing` — all `(req, res) => Promise<void>`

- [ ] **Step 1: Add the audit action if it is missing**

Run: `cd server && grep -n "AuditAction" src/models/AdminAuditLog.ts`

If the union has no pricing member, add `"template_pricing"` to it (both the TypeScript union and the schema `enum`, which mongoose validates against).

- [ ] **Step 2: Write the controller**

Create `server/src/controllers/templatePricing.controller.ts`:

```ts
// ─── Super-admin pricing endpoints ───────────────────────────────────────────
//
// `requireSuperAdmin`, not `requireAdmin`. Template VISIBILITY is an admin
// decision — staff decide what is in the gallery. Template PRICE is a different
// kind of power: it decides what users are charged, and it goes to the tier that
// already holds the money-and-identity capabilities.

import { Request, Response } from "express";
import TemplatePricing from "../models/TemplatePricing";
import { allPricing, invalidatePricingCache } from "../config/templatePricing";
import { validatePricingInput } from "../config/pricingMath";
import { audit } from "../services/adminAudit";

/** A slug is a URL segment. Anything else is a client bug or an attack. */
const SLUG_RE = /^[a-z0-9][a-z0-9-]{0,79}$/;

/**
 * GET /api/admin/template-pricing
 *
 * Every decision on record, resolved (so the panel shows the same derived MRP
 * the paywall will) — plus nothing else. A slug absent from `rows` is free.
 */
export const getAdminTemplatePricing = async (_req: Request, res: Response): Promise<void> => {
  try {
    const docs = await TemplatePricing.find({})
      .select("slug isFree finalPricePaise discountPercent pointsCost updatedByEmail updatedAt")
      .sort({ slug: 1 })
      .lean();

    res.json({
      success: true,
      data: {
        rows: docs.map((d) => ({
          slug:            String(d.slug),
          isFree:          Boolean(d.isFree),
          finalPricePaise: Number(d.finalPricePaise) || 0,
          discountPercent: Number(d.discountPercent) || 0,
          pointsCost:      Number(d.pointsCost) || 0,
          updatedByEmail:  d.updatedByEmail || "",
          updatedAt:       d.updatedAt,
        })),
        /** The resolved view, so the panel can render prices without recomputing. */
        resolved: await allPricing(),
      },
    });
  } catch (error) {
    console.error("Admin template pricing read error:", error);
    res.status(500).json({ success: false, error: "Could not read pricing" });
  }
};

async function writeOne(
  req: Request,
  slug: string,
  body: unknown
): Promise<{ ok: true } | { ok: false; status: number; error: string }> {
  if (!SLUG_RE.test(slug)) {
    return { ok: false, status: 400, error: `Invalid slug: ${slug}` };
  }

  const parsed = validatePricingInput(body);
  if (!parsed.ok) return { ok: false, status: 400, error: parsed.error };

  const before = await TemplatePricing.findOne({ slug }).lean();

  await TemplatePricing.findOneAndUpdate(
    { slug },
    {
      slug,
      isFree:          parsed.value.isFree,
      finalPricePaise: parsed.value.finalPricePaise,
      discountPercent: parsed.value.discountPercent,
      pointsCost:      parsed.value.pointsCost,
      updatedByEmail:  req.userEmail || "",
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  await audit(req, {
    action: "template_pricing",
    targetTemplateType: slug,
    changes: {
      isFree:          { from: before?.isFree ?? true,          to: parsed.value.isFree },
      finalPricePaise: { from: before?.finalPricePaise ?? 0,    to: parsed.value.finalPricePaise },
      discountPercent: { from: before?.discountPercent ?? 0,    to: parsed.value.discountPercent },
      pointsCost:      { from: before?.pointsCost ?? 0,         to: parsed.value.pointsCost },
    },
  });

  return { ok: true };
};

/** PATCH /api/admin/template-pricing/:slug */
export const setTemplatePricing = async (req: Request, res: Response): Promise<void> => {
  try {
    const slug = String(req.params.slug || "").toLowerCase();
    const result = await writeOne(req, slug, req.body);
    if (!result.ok) {
      res.status(result.status).json({ success: false, error: result.error });
      return;
    }
    invalidatePricingCache();
    res.json({ success: true, data: { slug, updatedByEmail: req.userEmail || "" } });
  } catch (error) {
    console.error("Set template pricing error:", error);
    res.status(500).json({ success: false, error: "Could not save pricing" });
  }
};

/**
 * PATCH /api/admin/template-pricing  — bulk.
 *
 * Validates EVERY update before writing ANY of them. A partial write across a
 * price list is worse than a rejection: the panel would show some templates
 * repriced and some not, with no indication which.
 */
export const setTemplatePricingBulk = async (req: Request, res: Response): Promise<void> => {
  try {
    const { updates } = req.body as { updates?: Array<Record<string, unknown>> };
    if (!Array.isArray(updates) || updates.length === 0) {
      res.status(400).json({ success: false, error: "updates must be a non-empty array" });
      return;
    }
    if (updates.length > 200) {
      res.status(400).json({ success: false, error: "Too many updates in one request" });
      return;
    }

    for (const u of updates) {
      const slug = String(u.slug || "").toLowerCase();
      if (!SLUG_RE.test(slug)) {
        res.status(400).json({ success: false, error: `Invalid slug: ${u.slug}` });
        return;
      }
      const parsed = validatePricingInput(u);
      if (!parsed.ok) {
        res.status(400).json({ success: false, error: `${slug}: ${parsed.error}` });
        return;
      }
    }

    for (const u of updates) {
      const result = await writeOne(req, String(u.slug).toLowerCase(), u);
      if (!result.ok) {
        invalidatePricingCache();
        res.status(result.status).json({ success: false, error: result.error });
        return;
      }
    }

    invalidatePricingCache();
    res.json({ success: true, data: { count: updates.length } });
  } catch (error) {
    console.error("Bulk template pricing error:", error);
    res.status(500).json({ success: false, error: "Could not save pricing" });
  }
};

/**
 * DELETE /api/admin/template-pricing/:slug
 *
 * Drops the decision, so the template is free again by default. Deleting rather
 * than writing `isFree: true` keeps the collection a list of decisions.
 */
export const clearTemplatePricing = async (req: Request, res: Response): Promise<void> => {
  try {
    const slug = String(req.params.slug || "").toLowerCase();
    if (!SLUG_RE.test(slug)) {
      res.status(400).json({ success: false, error: `Invalid slug: ${slug}` });
      return;
    }

    const before = await TemplatePricing.findOne({ slug }).lean();
    await TemplatePricing.deleteOne({ slug });

    await audit(req, {
      action: "template_pricing",
      targetTemplateType: slug,
      changes: { isFree: { from: before?.isFree ?? true, to: true } },
      reason: "pricing decision cleared — template is free by default",
    });

    invalidatePricingCache();
    res.json({ success: true, data: { slug } });
  } catch (error) {
    console.error("Clear template pricing error:", error);
    res.status(500).json({ success: false, error: "Could not clear pricing" });
  }
};
```

- [ ] **Step 3: Mount the routes**

In `server/src/routes/admin.routes.ts`, import the four handlers and `requireSuperAdmin`, then add — **bulk PATCH before the `:slug` PATCH**, for the reason already commented above the template-visibility block:

```ts
// Pricing is superadmin-only, unlike visibility above: this decides what users
// are charged. `requireSuperAdmin` is applied per-route because the router-level
// gate for this file is `requireAdmin`.
router.get("/template-pricing", requireSuperAdmin, getAdminTemplatePricing);
router.patch("/template-pricing", requireSuperAdmin, setTemplatePricingBulk);
router.patch("/template-pricing/:slug", requireSuperAdmin, setTemplatePricing);
router.delete("/template-pricing/:slug", requireSuperAdmin, clearTemplatePricing);
```

- [ ] **Step 4: Compile**

Run: `cd server && npx tsc --noEmit`
Expected: no output.

- [ ] **Step 5: Commit**

```bash
cd server
git add src/controllers/templatePricing.controller.ts src/routes/admin.routes.ts src/models/AdminAuditLog.ts
git commit -m "feat(pricing): super-admin endpoints to price a template

requireSuperAdmin rather than requireAdmin: visibility is staff deciding
what is in the gallery, price is deciding what users are charged, and that
belongs with the tier that already holds the money capabilities.

Bulk validates every update before writing any, because a half-applied
price list shows some templates repriced and some not with no way to tell
which.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

## Task 8: Integration script

The repo has no endpoint test framework; the house pattern is a standalone script that drops a scratch database. This one covers the invariants that are expensive to get wrong: role gating, the gate's four rules, grandfathering, and that a price change is visible immediately.

**Files:**
- Create: `server/scripts/pricing-integration.js`

**Interfaces:**
- Consumes: the built server in `server/dist/`, reached over HTTP.
- Produces: a pass/fail report on stdout, exit code 1 on any failure.

- [ ] **Step 1: Read the existing script to match its shape**

Run: `sed -n '1,60p' server/scripts/superadmin-integration.js`

Reuse its `check()`, `tok()`, `api()` helpers and its `.env.satest` convention verbatim.

- [ ] **Step 2: Write the script**

Create `server/scripts/pricing-integration.js`:

```js
/**
 * Integration checks for super-admin template pricing.
 *
 * The repo has no test framework, so this is a standalone script rather than a
 * suite. It DROPS THE DATABASE it points at, so it must only ever be aimed at a
 * scratch one.
 *
 *   1. cp .env .env.satest
 *   2. in .env.satest set APP_ENV=local, LOCAL_PORT=5099, and point
 *      LOCAL_MONGODB_URI at a throwaway database (e.g. .../gifts_pricetest)
 *   3. npm run build
 *   4. DOTENV_CONFIG_PATH=./.env.satest node -r dotenv/config dist/server.js &
 *   5. node scripts/pricing-integration.js
 *
 * Covers: who may price a template, that validation actually rejects, that the
 * gate's four rules hold, that a page already published stays publishable when
 * its template turns paid, and that a price change is visible without a restart.
 */

require("dotenv").config({ path: "./.env.satest" });
process.env.APP_ENV = "local";
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const BASE = "http://127.0.0.1:5099/api";
let pass = 0, fail = 0;
function check(name, cond, extra = "") {
  if (cond) { pass++; console.log(`  ✓ ${name}`); }
  else { fail++; console.log(`  ✗ ${name} ${extra}`); }
}
const tok = (id, email, tv = 0) =>
  jwt.sign({ userId: id, email, tv }, process.env.JWT_SECRET, { expiresIn: "1h" });
const api = async (path, opts = {}, token) => {
  const r = await fetch(BASE + path, {
    ...opts,
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(opts.headers || {}) },
  });
  let body = null; try { body = await r.json(); } catch {}
  return { status: r.status, body };
};

(async () => {
  await mongoose.connect(process.env.LOCAL_MONGODB_URI);
  await mongoose.connection.db.dropDatabase();

  const User = require("../dist/models/User").default;
  const HoliPage = require("../dist/models/HoliPage").default;
  const EidPage = require("../dist/models/EidPage").default;

  const sa = await User.create({ email: "suyashagrahari2121@gmail.com", name: "Super", provider: "local", password: "x1234567" });
  const admin = await User.create({ email: "admin@test.com", name: "Admin", provider: "local", password: "x1234567", role: "admin" });
  const user = await User.create({ email: "user@test.com", name: "User", provider: "local", password: "x1234567", points: 500 });

  const saT = tok(String(sa._id), sa.email);
  const adminT = tok(String(admin._id), admin.email);
  const userT = tok(String(user._id), user.email);

  console.log("\n── seeding ──");
  check("super admin auto-elevated", sa.role === "superadmin", `got ${sa.role}`);

  console.log("\n── who may price a template ──");
  check("anonymous cannot read pricing admin",
    (await api("/admin/template-pricing")).status === 401);
  check("normal user cannot read pricing admin",
    (await api("/admin/template-pricing", {}, userT)).status === 403);
  check("plain ADMIN cannot read pricing admin",
    (await api("/admin/template-pricing", {}, adminT)).status === 403);
  check("super admin can read pricing admin",
    (await api("/admin/template-pricing", {}, saT)).status === 200);
  check("plain ADMIN cannot set a price",
    (await api("/admin/template-pricing/holi", { method: "PATCH", body: JSON.stringify({ isFree: false, finalPricePaise: 1000, discountPercent: 90 }) }, adminT)).status === 403);

  console.log("\n── validation ──");
  const bad = async (body, why) => {
    const r = await api("/admin/template-pricing/holi", { method: "PATCH", body: JSON.stringify(body) }, saT);
    check(`rejects ${why}`, r.status === 400, `got ${r.status}`);
  };
  await bad({ isFree: false, finalPricePaise: 1000, discountPercent: 100 }, "a 100% discount");
  await bad({ isFree: false, finalPricePaise: 0, discountPercent: 0 }, "a paid template priced at zero");
  await bad({ isFree: false, finalPricePaise: 99, discountPercent: 0 }, "a paid template under ₹1");
  await bad({ isFree: false, finalPricePaise: 1000.5, discountPercent: 90 }, "fractional paise");
  await bad({ isFree: false, finalPricePaise: 1000, discountPercent: -1 }, "a negative discount");
  await bad({}, "a body with no isFree");
  {
    const r = await api("/admin/template-pricing/Not_A_Slug!", { method: "PATCH", body: JSON.stringify({ isFree: true }) }, saT);
    check("rejects a malformed slug", r.status === 400, `got ${r.status}`);
  }

  console.log("\n── the spec example: ₹10 at 90% off ──");
  {
    const r = await api("/admin/template-pricing/holi", { method: "PATCH", body: JSON.stringify({ isFree: false, finalPricePaise: 1000, discountPercent: 90, pointsCost: 50 }) }, saT);
    check("super admin priced holi", r.status === 200, JSON.stringify(r.body));

    const pub = await api("/payment/pricing");
    const holi = pub.body?.data?.holi;
    check("public pricing shows the price", holi?.finalPrice === 10, JSON.stringify(holi));
    check("public pricing derives the MRP as ₹100", holi?.mrp === 100, JSON.stringify(holi));
    check("public pricing reports the saving", holi?.savings === 90, JSON.stringify(holi));
    check("public pricing carries the points cost", holi?.pointsCost === 50, JSON.stringify(holi));
    check("a price change is visible with no restart", holi?.isFree === false);
  }

  console.log("\n── the gate's four rules ──");
  {
    // Rule 1: unpriced template is free.
    const eid = await EidPage.create({ userId: user._id, recipientName: "R", senderName: "S", shareId: "pt-eid-1" });
    const r = await api(`/eid-pages/${eid._id}/publish`, { method: "POST" }, userT);
    check("rule 1: an unpriced template publishes free", r.status === 200, JSON.stringify(r.body));
  }
  {
    // Rule 4: priced, unpaid → 402 carrying the pricing the client renders.
    const holi = await HoliPage.create({ userId: user._id, recipientName: "R", senderName: "S", shareId: "pt-holi-1" });
    const r = await api(`/holi-pages/${holi._id}/publish`, { method: "POST" }, userT);
    check("rule 4: a priced unpaid page is refused with 402", r.status === 402, `got ${r.status}`);
    check("rule 4: the 402 names the gate", r.body?.error === "PAYMENT_REQUIRED");
    check("rule 4: the 402 carries the price", r.body?.pricing?.finalPrice === 10, JSON.stringify(r.body?.pricing));
    check("rule 4: the 402 carries the derived MRP", r.body?.pricing?.mrp === 100);

    const fresh = await HoliPage.findById(holi._id);
    check("rule 4: the refused page did NOT go live", fresh.isPublished !== true);

    // Rule 3: points count as payment.
    const sp = await api("/payment/spend-points", { method: "POST", body: JSON.stringify({ templateType: "holi", pageId: String(holi._id) }) }, userT);
    check("points unlock the page", sp.status === 200, JSON.stringify(sp.body));
    const after = await api(`/holi-pages/${holi._id}/publish`, { method: "POST" }, userT);
    check("rule 3: publish is allowed after paying", after.status === 200, JSON.stringify(after.body));
  }
  {
    // Rule 2: a page already live stays publishable when its template turns paid.
    const eid2 = await EidPage.create({ userId: user._id, recipientName: "R", senderName: "S", shareId: "pt-eid-2", isPublished: true });
    await api("/admin/template-pricing/eid-mubarak", { method: "PATCH", body: JSON.stringify({ isFree: false, finalPricePaise: 4900, discountPercent: 50 }) }, saT);
    const r = await api(`/eid-pages/${eid2._id}/publish`, { method: "POST" }, userT);
    check("rule 2: an already-published page re-publishes free after repricing", r.status === 200, JSON.stringify(r.body));

    // …but a NEW page on that same template is now charged. This is the pair of
    // assertions that proves grandfathering without also proving nothing is sold.
    const eid3 = await EidPage.create({ userId: user._id, recipientName: "R", senderName: "S", shareId: "pt-eid-3" });
    const r3 = await api(`/eid-pages/${eid3._id}/publish`, { method: "POST" }, userT);
    check("a NEW page on a now-paid template is charged", r3.status === 402, `got ${r3.status}`);
  }

  console.log("\n── ownership for a template that is not one of the original six ──");
  {
    const other = await User.create({ email: "other@test.com", name: "Other", provider: "local", password: "x1234567" });
    const otherT = tok(String(other._id), other.email);
    const mine = await HoliPage.create({ userId: user._id, recipientName: "R", senderName: "S", shareId: "pt-holi-2" });
    const r = await api("/payment/create-order", { method: "POST", body: JSON.stringify({ templateType: "holi", pageId: String(mine._id) }) }, otherT);
    check("create-order refuses a page you do not own", r.status === 403, `got ${r.status}`);
  }

  console.log("\n── clearing a decision ──");
  {
    const r = await api("/admin/template-pricing/holi", { method: "DELETE" }, saT);
    check("super admin cleared holi's pricing", r.status === 200);
    const pub = await api("/payment/pricing");
    check("cleared template disappears from pricing", pub.body?.data?.holi === undefined, JSON.stringify(pub.body?.data));
    const fresh = await HoliPage.create({ userId: user._id, recipientName: "R", senderName: "S", shareId: "pt-holi-3" });
    const p = await api(`/holi-pages/${fresh._id}/publish`, { method: "POST" }, userT);
    check("a cleared template publishes free again", p.status === 200, JSON.stringify(p.body));
  }

  console.log(`\n── ${pass} passed, ${fail} failed ──\n`);
  await mongoose.disconnect();
  process.exit(fail === 0 ? 0 : 1);
})().catch((e) => { console.error(e); process.exit(1); });
```

- [ ] **Step 3: Run it**

```bash
cd server
cp .env .env.satest
# edit .env.satest: APP_ENV=local, LOCAL_PORT=5099,
# LOCAL_MONGODB_URI=mongodb://127.0.0.1:27017/gifts_pricetest
npm run build
DOTENV_CONFIG_PATH=./.env.satest node -r dotenv/config dist/server.js &
sleep 4
node scripts/pricing-integration.js
kill %1
```

Expected: every check passes, `0 failed`. If the `spend-points` check fails on the user's balance, raise the seeded `points` above the `pointsCost` being set.

- [ ] **Step 4: Commit**

```bash
cd server
git add scripts/pricing-integration.js
git commit -m "test(pricing): integration cover for the gate and the admin endpoints

Follows the house pattern of a standalone script against a scratch database.
Asserts the pair that matters most: an already-published page re-publishes
free after its template turns paid, AND a new page on that same template is
charged. Either alone can pass while the feature is broken.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

## Task 9: Client pricing — delete the mirror

**Files:**
- Rewrite: `client/config/templatePricing.ts` (currently a hardcoded mirror — replaced)
- Create: `client/lib/pricing.ts`
- Modify: `client/data/template-registry.ts` (its `isTemplatePremium` import breaks)

**Interfaces:**
- Consumes: `GET {API_URL}/payment/pricing` → `{ success, data: Record<slug, ResolvedPricing> }`.
- Produces:
  - `client/config/templatePricing.ts`: `interface ResolvedPricing` (mirrors the server type exactly), `derivePricing`, `freePricing`, `formatINR(rupees: number): string`
  - `client/lib/pricing.ts`: `loadPricing(): Promise<void>`, `pricingFor(slug: string): ResolvedPricing`, `isTemplatePremium(slug: string): boolean`, `onPricingChange(fn: () => void): () => void`

- [ ] **Step 1: Rewrite the config as math only**

Replace `client/config/templatePricing.ts` with:

```ts
/**
 * Pricing TYPES and MATH. Deliberately no numbers.
 *
 * This file used to be a hand-maintained mirror of the server's price list,
 * which meant changing a price required editing two repositories and deploying
 * both — and the two had already drifted (the server said Holi was 499 at 80%
 * off for 99, and 499 × 0.20 is 99.80). The numbers now come from
 * `GET /payment/pricing` via `lib/pricing.ts`.
 *
 * The math is duplicated from `server/src/config/pricingMath.ts` on purpose: the
 * admin panel's live preview has to agree with the paywall to the rupee, and the
 * server sends resolved values anyway. If you change the formula, change both —
 * the integration script in `server/scripts/pricing-integration.js` asserts the
 * server's half and will not catch a drift on this side.
 */

export interface ResolvedPricing {
  slug: string;
  isFree: boolean;
  finalPricePaise: number;
  finalPrice: number;
  mrpPaise: number;
  mrp: number;
  savingsPaise: number;
  savings: number;
  discountPercent: number;
  pointsCost: number;
}

export interface PricingRow {
  slug: string;
  isFree: boolean;
  finalPricePaise: number;
  discountPercent: number;
  pointsCost: number;
}

const toRupees = (paise: number): number => Math.round(paise) / 100;

export function deriveMrpPaise(finalPricePaise: number, discountPercent: number): number {
  const pct = Math.min(Math.max(discountPercent, 0), 99);
  if (pct === 0) return finalPricePaise;
  return Math.round(finalPricePaise / (1 - pct / 100));
}

export function derivePricing(row: PricingRow): ResolvedPricing {
  if (row.isFree) {
    return {
      slug: row.slug, isFree: true,
      finalPricePaise: 0, finalPrice: 0,
      mrpPaise: 0, mrp: 0,
      savingsPaise: 0, savings: 0,
      discountPercent: 0, pointsCost: 0,
    };
  }
  const finalPricePaise = Math.round(row.finalPricePaise);
  const mrpPaise = deriveMrpPaise(finalPricePaise, row.discountPercent);
  const savingsPaise = mrpPaise - finalPricePaise;
  return {
    slug: row.slug, isFree: false,
    finalPricePaise, finalPrice: toRupees(finalPricePaise),
    mrpPaise, mrp: toRupees(mrpPaise),
    savingsPaise, savings: toRupees(savingsPaise),
    discountPercent: row.discountPercent,
    pointsCost: Math.max(0, Math.round(row.pointsCost)),
  };
}

export function freePricing(slug: string): ResolvedPricing {
  return derivePricing({ slug, isFree: true, finalPricePaise: 0, discountPercent: 0, pointsCost: 0 });
}

/** ₹1,499 — no decimals, because every price here is whole rupees. */
export function formatINR(rupees: number): string {
  return "₹" + Math.round(rupees).toLocaleString("en-IN");
}
```

- [ ] **Step 2: Write the loader**

Create `client/lib/pricing.ts`:

```ts
/**
 * Live pricing, fetched once and cached at module scope.
 *
 * Same shape as `lib/templateVisibility.ts`: a module-level cache, an explicit
 * loader, and a synchronous reader that is safe to call during render. The
 * gallery renders fifty cards and the editors ask on every publish — neither can
 * afford a request each, and neither can wait on one.
 *
 * ── FAILING OPEN ────────────────────────────────────────────────────────────
 *
 * Every failure path returns FREE. If this request never lands, users publish
 * without being charged, which is a lost sale. The alternative — treating an
 * unknown price as paid — is a paywall shown for a template that may well be
 * free, in front of a person who cannot get past it. Lost sale wins.
 */

import { API_URL, IS_NGROK } from "@/lib/config";
import { freePricing, type ResolvedPricing } from "@/config/templatePricing";

let cache: Record<string, ResolvedPricing> | null = null;
let inflight: Promise<void> | null = null;
const listeners = new Set<() => void>();

function notify(): void {
  for (const fn of listeners) {
    try { fn(); } catch { /* a bad listener must not break pricing */ }
  }
}

/** Subscribe to pricing arriving or changing. Returns an unsubscribe. */
export function onPricingChange(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** Fetch pricing if it is not already loaded or in flight. Never throws. */
export function loadPricing(): Promise<void> {
  if (cache) return Promise.resolve();
  if (inflight) return inflight;

  inflight = (async () => {
    try {
      const res = await fetch(`${API_URL}/payment/pricing`, {
        headers: IS_NGROK ? { "ngrok-skip-browser-warning": "true" } : {},
      });
      const json = await res.json();
      cache = json?.success && json.data && typeof json.data === "object" ? json.data : {};
    } catch {
      // An empty map, not null: null would retry on every render.
      cache = {};
    } finally {
      inflight = null;
      notify();
    }
  })();

  return inflight;
}

/** Force a refetch — for the admin panel after it writes a price. */
export async function refreshPricing(): Promise<void> {
  cache = null;
  inflight = null;
  await loadPricing();
}

/**
 * The price for a slug. Synchronous, so it is safe in render.
 *
 * Returns FREE before pricing has loaded. That is deliberate: a card that shows
 * no badge for a moment and then shows one is better than a card that claims
 * "Free" and changes its mind, and the publish path re-reads this after the
 * server's 402 anyway — the server, not this cache, is what actually decides.
 */
export function pricingFor(slug: string): ResolvedPricing {
  if (!cache) return freePricing(slug);
  return cache[slug] ?? freePricing(slug);
}

export function isTemplatePremium(slug: string): boolean {
  return !pricingFor(slug).isFree;
}

/** Has pricing landed? For skeletons that would rather show nothing than "Free". */
export function isPricingLoaded(): boolean {
  return cache !== null;
}
```

- [ ] **Step 3: Fix the registry**

`client/data/template-registry.ts` imports `isTemplatePremium` from `@/config/templatePricing`, which no longer exports it.

The registry is imported by server components (it builds sitemaps and metadata), so it must not depend on a browser fetch. Remove the price from the static list entirely:

- Delete the import line `import { isTemplatePremium } from "@/config/templatePricing";`
- In `toListItem`, delete the `isPremium: isTemplatePremium(c.slug),` line.
- In `client/types/template-config.ts`, make `isPremium` optional on `TemplateListItem` (`isPremium?: boolean`) if it is currently required.

Pricing badges are read live by the card component in Task 12 instead.

- [ ] **Step 4: Find and fix the rest of the fallout**

Run: `cd client && npx tsc --noEmit 2>&1 | head -30`

Expected errors: the two editors importing `getClientPricing` (`holi`, `apology-dashboard` — Task 14 rewires them), `components/PaymentModal.tsx` and `hooks/useTemplatePayment.ts` importing `ClientTemplatePricing` (Tasks 10 and 11), and anything reading `isPremium`. Fix only the `isPremium` readers now; leave the rest for their tasks.

Run: `cd client && grep -rn "isPremium" app components data types | grep -v node_modules`
Update each reader to call `isTemplatePremium(slug)` from `@/lib/pricing` — but **only in client components** (`"use client"`). If a server component reads it, delete the badge there; a server component cannot know a live price.

- [ ] **Step 5: Commit**

```bash
cd client
git add config/templatePricing.ts lib/pricing.ts data/template-registry.ts types/template-config.ts
git commit -m "feat(pricing): stop mirroring the server's price list

This config was a hand-maintained copy of the server's prices, so changing
one price meant editing two repos and deploying both — and they had drifted.
Numbers now come from GET /payment/pricing; this file keeps only the types
and the formula the admin preview and the paywall must agree on.

Failure is free, everywhere: an unknown price shows no paywall rather than
one nobody can get past.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

## Task 10: The paywall store and one global host

The reason each editor needs only ~6 lines: the modal is mounted once for the whole app, so no template touches its `page.tsx`.

**Files:**
- Create: `client/store/paywallSlice.ts`
- Modify: `client/store/index.ts` (register the reducer)
- Create: `client/hooks/usePublishGate.ts`
- Create: `client/components/PaywallHost.tsx`
- Modify: `client/components/Providers.tsx` (mount the host)
- Delete: `client/hooks/useTemplatePayment.ts` — its checkout logic moves into `PaywallHost`

**Interfaces:**
- Consumes: `pricingFor`, `loadPricing` (Task 9); `PaymentModal` (Task 11 restyles it; this task keeps its current props working); `API_URL`, `IS_NGROK` from `@/lib/config`; `track`, `EVENTS` from `@/lib/analytics/*`; `setPoints` from `@/store/authSlice`.
- Produces:
  - `paywallSlice`: actions `openPaywall({ slug, templateType, pageId })`, `closePaywall()`, `setPaywallStatus(status)`, `setPaywallError(msg)`, `markPaid(pageId)`, `clearPaid()`; state `{ open, slug, templateType, pageId, status, error, paidPageId }`
  - `usePublishGate(): { maybePaywall(result: unknown, ctx: { slug: string; templateType: string; pageId: string }): boolean; paidFor(pageId: string | null): boolean; clearPaid(): void }`

- [ ] **Step 1: Write the slice**

Create `client/store/paywallSlice.ts`:

```ts
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type PaywallStatus = "idle" | "loading" | "error";

interface PaywallState {
  open: boolean;
  slug: string | null;
  templateType: string | null;
  pageId: string | null;
  status: PaywallStatus;
  error: string | null;
  /**
   * The page a payment just completed for.
   *
   * The editor that started the publish watches this and re-runs its publish
   * when it matches its own pageId. Keyed by page rather than a bare boolean so
   * two editors mounted at once — a preview behind a modal, say — cannot both
   * think the payment was theirs.
   */
  paidPageId: string | null;
}

const initialState: PaywallState = {
  open: false, slug: null, templateType: null, pageId: null,
  status: "idle", error: null, paidPageId: null,
};

const paywallSlice = createSlice({
  name: "paywall",
  initialState,
  reducers: {
    openPaywall(
      state,
      action: PayloadAction<{ slug: string; templateType: string; pageId: string }>
    ) {
      state.open = true;
      state.slug = action.payload.slug;
      state.templateType = action.payload.templateType;
      state.pageId = action.payload.pageId;
      state.status = "idle";
      state.error = null;
    },
    closePaywall(state) {
      state.open = false;
      state.status = "idle";
      state.error = null;
    },
    setPaywallStatus(state, action: PayloadAction<PaywallStatus>) {
      state.status = action.payload;
    },
    setPaywallError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
      state.status = action.payload ? "error" : "idle";
    },
    markPaid(state, action: PayloadAction<string>) {
      state.paidPageId = action.payload;
      state.open = false;
      state.status = "idle";
      state.error = null;
    },
    clearPaid(state) {
      state.paidPageId = null;
    },
  },
});

export const {
  openPaywall, closePaywall, setPaywallStatus, setPaywallError, markPaid, clearPaid,
} = paywallSlice.actions;

export default paywallSlice.reducer;
```

- [ ] **Step 2: Register the reducer**

In `client/store/index.ts`, add `paywall: paywallReducer` to the `reducer` map, importing it as `import paywallReducer from "./paywallSlice";`.

- [ ] **Step 3: Write the hook**

Create `client/hooks/usePublishGate.ts`:

```ts
"use client";

import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { openPaywall, clearPaid as clearPaidAction } from "@/store/paywallSlice";
import { track } from "@/lib/analytics/track";
import { EVENTS } from "@/lib/analytics/events";

/**
 * The publish paywall, for an editor.
 *
 * Every editor's publish already does the same three things with the server's
 * answer: succeed, fail, or — for two of forty-two of them — notice a 402 and
 * open a paywall. This hook is that third branch, once, so adding it to the
 * other forty is one call rather than forty copies of the logic.
 *
 * The modal itself is mounted globally in `components/PaywallHost.tsx`, which is
 * why an editor needs no change to its `page.tsx`.
 */
export function usePublishGate() {
  const dispatch = useAppDispatch();
  const paidPageId = useAppSelector((s) => s.paywall.paidPageId);

  /**
   * Hand this the parsed publish response. Returns true if it was a paywall and
   * has been handled, so the caller can skip its own error toast.
   */
  const maybePaywall = useCallback(
    (
      result: unknown,
      ctx: { slug: string; templateType: string; pageId: string }
    ): boolean => {
      const error = (result as { error?: unknown } | null)?.error;
      if (error !== "PAYMENT_REQUIRED") return false;

      // Records that publish was BLOCKED, which is what makes the paywall a
      // visible funnel step rather than an invisible detour. begin_checkout is
      // fired by the host when the modal opens.
      track(EVENTS.PUBLISH_FAILED, { template: ctx.slug, reason: "PAYMENT_REQUIRED" });
      dispatch(openPaywall(ctx));
      return true;
    },
    [dispatch]
  );

  /** Did a payment just complete for this page? Drives the publish retry. */
  const paidFor = useCallback(
    (pageId: string | null): boolean => !!pageId && paidPageId === pageId,
    [paidPageId]
  );

  const clearPaid = useCallback(() => { dispatch(clearPaidAction()); }, [dispatch]);

  return { maybePaywall, paidFor, clearPaid };
}
```

- [ ] **Step 4: Write the host**

Create `client/components/PaywallHost.tsx`. This carries the checkout logic lifted from the deleted `useTemplatePayment.ts` — read that file first and preserve its Razorpay flow and its analytics calls exactly; only the state source changes from local `useState` to the Redux slice.

```tsx
"use client";

import { useCallback, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setPoints } from "@/store/authSlice";
import {
  closePaywall, markPaid, setPaywallError, setPaywallStatus,
} from "@/store/paywallSlice";
import PaymentModal from "@/components/PaymentModal";
import { API_URL, IS_NGROK } from "@/lib/config";
import { loadPricing, pricingFor } from "@/lib/pricing";
import { track } from "@/lib/analytics/track";
import { EVENTS } from "@/lib/analytics/events";

/**
 * The one paywall in the app.
 *
 * Mounted once in `Providers`, so all forty-two template editors share it and
 * none of them renders a modal of its own. The previous arrangement — a hook
 * plus a `<PaymentModal>` in each template's page — is why only two templates
 * ever got a paywall: it was two files of work per template.
 */
export default function PaywallHost() {
  const dispatch = useAppDispatch();
  const { open, slug, templateType, pageId, status, error } = useAppSelector((s) => s.paywall);
  const accessToken = useAppSelector((s) => s.auth.accessToken);

  // The 402 tells us payment is needed; this tells us how much.
  useEffect(() => { if (open) void loadPricing(); }, [open]);

  const pricing = slug ? pricingFor(slug) : null;

  useEffect(() => {
    if (open && pricing && !pricing.isFree) {
      track(EVENTS.BEGIN_CHECKOUT, {
        template: slug, value: pricing.finalPrice, currency: "INR",
      });
    }
  }, [open, slug, pricing?.finalPrice, pricing?.isFree]);

  const headers = useCallback(
    () => ({
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      ...(IS_NGROK ? { "ngrok-skip-browser-warning": "true" } : {}),
    }),
    [accessToken]
  );

  const onSpendPoints = useCallback(async () => {
    if (!templateType || !pageId) return;
    dispatch(setPaywallStatus("loading"));
    dispatch(setPaywallError(null));
    try {
      const res = await fetch(`${API_URL}/payment/spend-points`, {
        method: "POST", headers: headers(),
        body: JSON.stringify({ templateType, pageId }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to spend points");
      if (typeof data.data?.pointsRemaining === "number") {
        dispatch(setPoints(data.data.pointsRemaining));
      }
      // Deliberately not `purchase`: a purchase worth ₹0 drags revenue and
      // average order value toward zero and makes both reports meaningless.
      track(EVENTS.SPEND_POINTS, { template: slug, points_cost: pricing?.pointsCost ?? 0 });
      dispatch(markPaid(pageId));
    } catch (err) {
      track(EVENTS.PAYMENT_FAILED, { template: slug, method: "points" });
      dispatch(setPaywallError(err instanceof Error ? err.message : "Failed to spend points"));
    }
  }, [dispatch, headers, templateType, pageId, slug, pricing?.pointsCost]);

  const onRazorpay = useCallback(async () => {
    if (!templateType || !pageId) return;
    dispatch(setPaywallStatus("loading"));
    dispatch(setPaywallError(null));
    try {
      const orderRes = await fetch(`${API_URL}/payment/create-order`, {
        method: "POST", headers: headers(),
        body: JSON.stringify({ templateType, pageId }),
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok || !orderData.success) {
        throw new Error(orderData.error || "Failed to create payment order");
      }
      const { orderId, amount, currency, keyId, name, description } = orderData.data;

      await loadRazorpayScript();

      await new Promise<void>((resolve, reject) => {
        const rzp = new (window as unknown as { Razorpay: new (o: unknown) => { open: () => void } }).Razorpay({
          key: keyId, amount, currency,
          name: name || "SubhSandesh",
          description: description || `Unlock ${slug}`,
          order_id: orderId,
          handler: async (r: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => {
            try {
              const v = await fetch(`${API_URL}/payment/verify`, {
                method: "POST", headers: headers(),
                body: JSON.stringify({
                  razorpayOrderId: r.razorpay_order_id,
                  razorpayPaymentId: r.razorpay_payment_id,
                  razorpaySignature: r.razorpay_signature,
                }),
              });
              const vd = await v.json();
              if (!v.ok || !vd.success) throw new Error(vd.error || "Payment verification failed");
              resolve();
            } catch (e) { reject(e); }
          },
          modal: { ondismiss: () => reject(new Error("PAYMENT_CANCELLED")) },
          prefill: {},
          theme: { color: "#FF6B35" },
        });
        rzp.open();
      });

      // Fired only after the server verified the signature, so this counts money
      // actually taken. `amount` is paise; GA4 revenue must be major units.
      track(EVENTS.PURCHASE, {
        template: slug,
        value: typeof amount === "number" ? amount / 100 : pricing?.finalPrice,
        currency: "INR",
        transaction_id: typeof orderId === "string" ? orderId : undefined,
      });
      dispatch(markPaid(pageId));
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Payment failed";
      if (msg === "PAYMENT_CANCELLED") {
        track(EVENTS.CHECKOUT_CANCELLED, {
          template: slug, value: pricing?.finalPrice, currency: "INR",
        });
        dispatch(setPaywallStatus("idle"));
        dispatch(setPaywallError(null));
      } else {
        track(EVENTS.PAYMENT_FAILED, { template: slug, method: "razorpay" });
        dispatch(setPaywallError(msg));
      }
    }
  }, [dispatch, headers, templateType, pageId, slug, pricing?.finalPrice]);

  if (!open || !pricing || pricing.isFree) return null;

  return (
    <PaymentModal
      open={open}
      pricing={pricing}
      paymentStatus={status === "loading" ? "loading" : status === "error" ? "error" : "idle"}
      paymentError={error}
      onClose={() => dispatch(closePaywall())}
      onSpendPoints={onSpendPoints}
      onRazorpay={onRazorpay}
    />
  );
}

function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if ((window as unknown as { Razorpay?: unknown }).Razorpay) { resolve(); return; }
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Failed to load Razorpay. Check your connection."));
    document.head.appendChild(s);
  });
}
```

- [ ] **Step 4a: Confirm the analytics event names exist**

Run: `cd client && grep -n "BEGIN_CHECKOUT\|CHECKOUT_CANCELLED\|SPEND_POINTS\|PURCHASE\|PAYMENT_FAILED\|PUBLISH_FAILED" lib/analytics/events.ts`

Every name used above must be present. If `BEGIN_CHECKOUT` is absent, use whatever the deleted `useTemplatePayment.ts` used for the same purpose — do not invent an event name.

- [ ] **Step 5: Mount the host and delete the old hook**

In `client/components/Providers.tsx`, render `<PaywallHost />` inside the Redux `<Provider>`, as a sibling of `{children}`.

Then: `cd client && rm hooks/useTemplatePayment.ts`

- [ ] **Step 6: Compile**

Run: `cd client && npx tsc --noEmit 2>&1 | head -20`

Expected: errors only in `PaymentModal.tsx` (Task 11) and the two editors that imported the deleted hook (Task 14).

- [ ] **Step 7: Commit**

```bash
cd client
git add store/paywallSlice.ts store/index.ts hooks/usePublishGate.ts \
        components/PaywallHost.tsx components/Providers.tsx
git rm hooks/useTemplatePayment.ts
git commit -m "feat(pricing): one paywall for the whole app, not one per template

The old arrangement needed a hook call in the editor AND a <PaymentModal> in
the template's page — two files per template, which is why only two of
forty-two templates ever got a paywall. Mounting the modal once in Providers
makes adding a template's paywall a single call in a single file.

Payment success is published as paidPageId rather than a boolean so two
editors mounted at once cannot both claim the payment.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

## Task 11: Restyle the paywall

**Files:**
- Modify: `client/components/PaymentModal.tsx` (312 lines; props change, layout is rebuilt)

**Interfaces:**
- Consumes: `ResolvedPricing`, `formatINR` (Task 9).
- Produces: `PaymentModal` with props `{ open: boolean; pricing: ResolvedPricing; paymentStatus: "idle" | "loading" | "error"; paymentError: string | null; onClose: () => void; onSpendPoints: () => void; onRazorpay: () => void }`

- [ ] **Step 1: Load the theme**

Invoke the `subhsandesh-theme` skill and read it before writing any styles. The current modal is dark navy with a gold shimmer, which is the old palette. Use the new theme's fonts, colors, radii and shadows exactly.

- [ ] **Step 2: Swap the pricing type**

Replace the `ClientTemplatePricing` import and prop type with `ResolvedPricing` from `@/config/templatePricing`.

Then replace every derived value with the ones the server already computed — the modal must not do its own arithmetic:

- `pricing.originalPrice` → `pricing.mrp`
- `const savings = pricing.originalPrice - pricing.finalPrice` → `pricing.savings`
- keep `pricing.finalPrice`, `pricing.discountPercent`, `pricing.pointsCost`
- render every rupee figure through `formatINR(...)`

Drop `pricing.name` — `ResolvedPricing` has no name. Title the modal from the template's own copy instead: add an optional `templateTitle?: string` prop, and when it is absent use "Publish this page".

- [ ] **Step 3: Rebuild the body**

Required content, in this order:

1. Title, and a one-line reassurance: "One-time payment. Edit and re-publish as often as you like." — true, because gate rule 2 is unconditional.
2. The price block: `discountPercent`% OFF badge, `formatINR(pricing.mrp)` struck through, `formatINR(pricing.finalPrice)` as the hero figure, and "You save `formatINR(pricing.savings)`".
3. Primary button: `Pay {formatINR(pricing.finalPrice)}` → `onRazorpay`.
4. Only when `pricing.pointsCost > 0`: an "or" divider and a secondary button `Use {pointsCost} points`, showing the user's balance, disabled when `userPoints < pricing.pointsCost` with the shortfall named.
5. `paymentError` in an alert row when present.
6. Every control disabled while `paymentStatus === "loading"`, and the backdrop non-dismissable then — a click that closes the sheet mid-charge looks like a cancelled payment that was in fact taken.

Hide the discount badge, the strike-through and the savings line entirely when `pricing.discountPercent === 0`: "0% OFF" beside an un-struck price reads as a bug.

- [ ] **Step 4: Verify against the real thing**

Run: `cd client && npx tsc --noEmit 2>&1 | grep PaymentModal`
Expected: no output.

Then, with the app running and a template priced at ₹10 / 90%, open the paywall and confirm it reads `₹100` struck, `₹10` hero, `90% OFF`, `You save ₹90`.

- [ ] **Step 5: Commit**

```bash
cd client
git add components/PaymentModal.tsx
git commit -m "feat(pricing): reprice the paywall in the new theme, off server numbers

Takes mrp, savings and discountPercent as the server derived them rather
than recomputing, so the panel's preview and the paywall cannot disagree.
Hides the discount furniture entirely at 0% — a struck-through price beside
'0% OFF' reads as a bug.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

## Task 12: Gallery badges

**Files:**
- Modify: `client/components/TemplateCard.tsx`
- Modify: `client/app/(app)/templates/page.tsx` (call `loadPricing()` on mount)
- Check: `client/components/ApologyTemplateCard.tsx` — same treatment if it renders a premium badge

**Interfaces:**
- Consumes: `pricingFor`, `loadPricing`, `onPricingChange`, `isPricingLoaded` (Task 9); `formatINR` (Task 9).
- Produces: no new exports.

- [ ] **Step 1: Load pricing where the gallery mounts**

In `client/app/(app)/templates/page.tsx`, inside the existing client component, add:

```tsx
useEffect(() => { void loadPricing(); }, []);
```

- [ ] **Step 2: Make the card re-render when pricing lands**

`pricingFor` reads a module cache, so a card rendered before the fetch resolves will not update on its own. Add a tiny subscription in `TemplateCard.tsx`:

```tsx
const [, setPricingTick] = useState(0);
useEffect(() => onPricingChange(() => setPricingTick((n) => n + 1)), []);

const pricing = pricingFor(slug);
```

- [ ] **Step 3: Render the badge**

Replace whatever reads `isPremium` with:

- `pricing.isFree` **and** `isPricingLoaded()` → a quiet "Free" pill, in the theme's muted surface.
- `!pricing.isFree` → a price badge: `{pricing.discountPercent}% OFF` plus `formatINR(pricing.finalPrice)`, with `formatINR(pricing.mrp)` struck through and smaller. When `discountPercent === 0`, show the price alone.
- pricing not loaded yet → render no badge at all. A card that says "Free" and then changes to "₹10" is worse than a card that says nothing for 200ms.

Use the theme's accent for the paid badge; do not invent a color.

- [ ] **Step 4: Verify**

Run: `cd client && npx tsc --noEmit 2>&1 | grep -i templatecard`
Expected: no output.

Price a template, hard-reload `/templates`, and confirm the badge appears and matches the paywall.

- [ ] **Step 5: Commit**

```bash
cd client
git add components/TemplateCard.tsx "app/(app)/templates/page.tsx" components/ApologyTemplateCard.tsx
git commit -m "feat(pricing): show live prices on the gallery cards

Reads the pricing endpoint rather than a build-time isPremium flag, so a
super admin's change reaches the gallery within the cache window instead of
the next deploy. Renders no badge until pricing lands — a card that says
Free and then changes its mind is worse than a card that waits.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

## Task 13: The super-admin pricing panel

**Files:**
- Create: `client/app/(app)/admin/pricing/page.tsx`
- Create: `client/app/(app)/admin/pricing/UNPRICEABLE.ts`
- Modify: `client/app/(app)/admin/analytics/page.tsx` (add a link to the new page, alongside the existing Templates link)

**Interfaces:**
- Consumes: `GET/PATCH/DELETE /api/admin/template-pricing` (Task 7); `templateList` from `@/data/template-registry`; `derivePricing`, `formatINR`, `ResolvedPricing` (Task 9); `isSuperAdmin` from `@/lib/roles`; `refreshPricing` (Task 9).
- Produces: no exports beyond the page.

- [ ] **Step 1: Read the page this one copies**

Run: `sed -n '1,120p' "client/app/(app)/admin/templates/page.tsx"`

Match its structure exactly: the `ArrowLeft` back link, the heading and explanatory paragraph, the "Editing `<apiHost>`" banner, the search box, the filter pills, the counts, and its inline-style approach. A second admin screen that looks unlike the first is a worse screen.

- [ ] **Step 2: Record the templates that cannot be priced**

Create `client/app/(app)/admin/pricing/UNPRICEABLE.ts`:

```ts
/**
 * Templates in the gallery with no publish path, so a price on them would never
 * be charged.
 *
 * The panel lists every template in the registry, because the registry is what
 * "exists". These ten cannot be sold, and a super admin typing a price into one
 * and seeing it saved — with nobody ever charged — is the failure this list
 * exists to prevent. The panel disables their controls and says why.
 *
 * Nine are static pages: an empty `hooks/` directory, no Publish button, no API
 * calls at all. `anniversary-gf` is different and worth its own note: its editor
 * POSTs to `/anniversary-pages/:id/publish`, but the server has no anniversary
 * controller, model or route, so that publish already 404s. That is a
 * pre-existing break, not something pricing caused.
 *
 * Verify with, from `client/`:
 *
 *   for d in app/\(templates\)/*/; do
 *     grep -rq '/publish' "$d" || echo "${d}"
 *   done
 */
export const UNPRICEABLE: Record<string, string> = {
  "anniversary-gf":        "Its publish endpoint does not exist on the server (pre-existing).",
  "anniversary-parents":   "Static page — no publish flow.",
  "birthday-bestfriend":   "Static page — no publish flow.",
  "birthday-friend":       "Static page — no publish flow.",
  "birthday-parents":      "Static page — no publish flow.",
  "christian-wedding-2":   "Reuses the Christian Wedding editor — price that instead.",
  "missyou-bestfriend":    "Static page — no publish flow.",
  "sorry-friend":          "Static page — no publish flow.",
  "sorry-gf":              "Static page — no publish flow.",
  "valentine-bestfriend":  "Static page — no publish flow.",
};
```

- [ ] **Step 3: Build the page**

Requirements, all of them:

**Access.** `admin/layout.tsx` gates on `isAdmin`, which admits plain admins. This page must additionally check `isSuperAdmin(user.role)` and `router.replace("/admin/analytics")` otherwise — after the same "wait for `checkAuth`" guard the layout uses, or a hard refresh bounces a legitimate super admin.

**Per row**, for each of the 52 templates in `templateList`:
- emoji, title, slug
- a Free / Paid segmented control
- when Paid: three number inputs — final price in **rupees**, discount %, points cost
- a live preview beside the inputs showing exactly what the paywall will say, computed with `derivePricing` from Task 9: `{pct}% OFF`, `formatINR(mrp)` struck, `formatINR(finalPrice)`, `You save formatINR(savings)`
- Save (`PATCH /admin/template-pricing/:slug`) and, when a row exists, "Reset to free" (`DELETE`)
- who last changed it and when, from `updatedByEmail` / `updatedAt`
- when the slug is in `UNPRICEABLE`: controls disabled, the reason shown

**Rupees in, paise out.** The input is rupees because that is what a person thinks in. Convert on submit with `Math.round(rupees * 100)` and send `finalPricePaise`. Never send a float.

**Client-side validation mirroring the server**, so a mistake is caught before a round trip — but treat the server as the authority and surface its error text when it rejects: discount 0–99 integer, price ≥ ₹1 when paid, points ≥ 0 integer.

**After every successful write**, call `refreshPricing()` from `@/lib/pricing` so the gallery in this same tab reflects the change — the module cache is why the visibility page has the same call.

**Search** by title or slug, **filter** by All / Paid / Free / Can't be priced, and **counts** for each.

- [ ] **Step 4: Verify the guard**

Run: `cd client && npx tsc --noEmit 2>&1 | grep -i "admin/pricing"`
Expected: no output.

Then, signed in as a plain admin, visit `/admin/pricing` and confirm the redirect. Signed in as the super admin, confirm the page renders 52 rows and the 10 unpriceable ones are visibly disabled.

- [ ] **Step 5: Commit**

```bash
cd client
git add "app/(app)/admin/pricing" "app/(app)/admin/analytics/page.tsx"
git commit -m "feat(admin): a super-admin screen for template pricing

Takes the final price and the discount and shows the derived strike-through
live, using the same formula the paywall uses, so what the super admin sees
while typing is what the user will see.

Guards on isSuperAdmin in the page: the shared admin layout gates on isAdmin
and would let staff reprice the catalogue. Ten templates have no publish
path and are disabled with the reason, rather than silently accepting a
price nobody would ever be charged.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

## Task 14: Rewire the two editors that already have a paywall

Doing these first is deliberate: they are the only two whose paywall works today, so if the new hook is wrong, it shows up here as a regression rather than in template thirty-eight.

**Files:**
- Modify: `client/app/(templates)/holi/hooks/useHoliEditor.ts`
- Modify: `client/app/(templates)/holi/page.tsx` (remove the local `<PaymentModal>`)
- Modify: `client/app/(templates)/apology-dashboard/hooks/useApologyEditor.ts`
- Check: `client/app/(templates)/apology-dashboard/page.tsx` for a local `<PaymentModal>`

**Interfaces:**
- Consumes: `usePublishGate` (Task 10).
- Produces: the editing pattern the sweep in Tasks 15–19 repeats.

- [ ] **Step 1: Rewire `useHoliEditor.ts`**

Remove:
- `import { useTemplatePayment } from "@/hooks/useTemplatePayment";`
- `import { getClientPricing } from "@/config/templatePricing";`
- `const payment = useTemplatePayment();`
- the `payment` entry from the hook's return object
- the old post-payment retry effect that reads `payment.paymentJustCompleted`

Add:
```ts
import { usePublishGate } from "@/hooks/usePublishGate";
```
and, beside the other hooks:
```ts
const gate = usePublishGate();
```

Replace the whole `else if (result.error === "PAYMENT_REQUIRED") { ... }` branch — the one that calls `getClientPricing("holi")` and `payment.openPaymentModal` — with:

```ts
      } else if (gate.maybePaywall(result, { slug: TEMPLATE, templateType: "holi", pageId })) {
        // Paywall is open; PaywallHost owns it from here.
```

Replace the old retry effect with:

```ts
  // A payment landed for this page — publish again, which the gate now allows.
  useEffect(() => {
    if (gate.paidFor(pageId)) {
      gate.clearPaid();
      handlePublishRef.current();
    }
  }, [gate, pageId]);
```

Add `gate.maybePaywall` to the `handlePublish` dependency array.

Confirm `TEMPLATE` is the slug `"holi"`: `grep -n 'const TEMPLATE' app/\(templates\)/holi/hooks/useHoliEditor.ts`. If it is not the slug, pass the literal `"holi"` as `slug`.

- [ ] **Step 2: Remove the local modal from `holi/page.tsx`**

Delete the `<PaymentModal ... />` block and the `import PaymentModal from "@/components/PaymentModal";` line. `PaywallHost` renders it now.

- [ ] **Step 3: Do the same for `apology-dashboard`**

Same edits in `useApologyEditor.ts`, with `slug: "apology-dashboard"` and `templateType: "apology-dashboard"`. Check its `page.tsx` for a `<PaymentModal>` and remove it if present.

- [ ] **Step 4: Compile and test the flow end to end**

Run: `cd client && npx tsc --noEmit`
Expected: no output — the whole client compiles.

Then, with a server running and `holi` priced at ₹10 / 90%: build a Holi card, press Publish, and confirm the paywall opens with the right numbers, the Razorpay test card completes, and the page goes live **without a second Publish click**. Then press Publish again and confirm it is free.

- [ ] **Step 5: Commit**

```bash
cd client
git add "app/(templates)/holi" "app/(templates)/apology-dashboard"
git commit -m "refactor(pricing): move the two working paywalls onto the shared gate

These are the only two editors whose paywall works today, so they go first:
if the shared hook is wrong it surfaces here as a regression rather than in
the thirty-eighth template.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

## Tasks 15–19: The sweep

Forty editors, one identical edit each. The recipe is below; each task applies it to its batch from the Reference Data table, then compiles and commits. Batches exist so a mistake in the recipe costs eight files, not forty.

### The recipe

For a template with slug `<SLUG>`, templateType `<TYPE>`, and editor file `<FILE>`:

**1.** Add the import beside the other hook imports:

```ts
import { usePublishGate } from "@/hooks/usePublishGate";
```

**2.** Inside the hook body, beside the other `useState`/`useCallback` declarations:

```ts
  const gate = usePublishGate();
```

**3.** Find the publish response handling. Every editor has this shape:

```ts
      if (result.success) {
        // …
      } else {
        pushToast({ type: "info", title: "Publish failed", message: "Please try again" });
      }
```

Insert a branch before the final `else`:

```ts
      } else if (gate.maybePaywall(result, { slug: "<SLUG>", templateType: "<TYPE>", pageId })) {
        // Paywall is open; PaywallHost owns it from here.
      } else {
```

`pageId` must be the id of the page just saved. If the editor's variable is named differently (`id`, `savedId`), use that — passing a stale or null id means the retry publishes nothing.

**4.** Ensure a stable ref to the publish function exists, so the retry effect calls the current one. Most editors already have `handlePublishRef`. If not, add:

```ts
  const handlePublishRef = useRef<() => void>(() => {});
  useEffect(() => { handlePublishRef.current = handlePublish; }, [handlePublish]);
```

**5.** Add the retry effect after `handlePublish` is defined:

```ts
  // A payment landed for this page — publish again, which the gate now allows.
  useEffect(() => {
    if (gate.paidFor(pageId)) {
      gate.clearPaid();
      handlePublishRef.current();
    }
  }, [gate, pageId]);
```

**6.** Add `gate.maybePaywall` to the `handlePublish` dependency array (or leave the existing `eslint-disable` comment if the file has one).

**7.** Do **not** add a `<PaymentModal>` to the page. `PaywallHost` renders it.

### Per-batch steps

Each of Tasks 15–19 runs these five steps against its own file list.

- [ ] **Step 1: Apply the recipe to every file in the batch**

Batch file lists — take `<SLUG>` and `<TYPE>` from the Reference Data table:

- **Task 15:** `app`, `birthday-gf`, `bouquet-gf`, `call`, `capsule`, `catch`, `challan`
- **Task 16:** `christian-wedding`, `court-marriage`, `court-of-love`, `darling`, `date-invitation`, `dedication`, `eid-mubarak`, `flags`
- **Task 17:** `happy-rakshabandhan-to-brother`, `happy-rakshabandhan-to-sister`, `hold-my-hand`, `kundli-milan`, `legal-notice`, `love-gf`, `loveflix`, `missyou-gf`
- **Task 18:** `nutrition`, `photo-puzzle`, `product`, `profile-pro`, `proposal`, `reception`, `recharge`, `rewind`
- **Task 19:** `searched`, `shaadi-card`, `streak`, `train-ticket`, `us`, `valentine-gf` (**`page.tsx`, not a hook**), `vending-machine`, `watch`, `wedding-shaadi`

- [ ] **Step 2: Confirm every file in the batch was actually changed**

Run, from `client/`:

```bash
git diff --name-only | sed 's|.*(templates)/||' | cut -d/ -f1 | sort -u
```

Every slug in the batch must appear. A slug missing means its publish branch did not match the expected shape — open it and place the branch by hand.

- [ ] **Step 3: Confirm the templateType strings are right**

Run, from `client/`:

```bash
grep -rho 'templateType: "[a-z0-9-]*"' "app/(templates)" | sort -u
```

Every value must appear in the Reference Data table's templateType column. A typo here paywalls the wrong template — or nothing.

- [ ] **Step 4: Compile**

Run: `cd client && npx tsc --noEmit`
Expected: no output.

Run: `cd client && npm run lint 2>&1 | tail -20`
Expected: no new errors.

- [ ] **Step 5: Commit**

```bash
cd client
git add "app/(templates)"
git commit -m "feat(pricing): wire the paywall into <BATCH> templates

<N> editors, one call each, because the modal is mounted globally. Before
this, a super admin pricing any of these produced a template that could not
be published and said only 'Publish failed'.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

## Task 20: Verify the whole thing, then merge

**Files:** none — this task produces evidence.

- [ ] **Step 1: Every automated check**

```bash
cd server && npm run test:unit && npx tsc --noEmit && npm run build
cd ../client && npx tsc --noEmit && npm run lint && npm run build && npm run seo:check
```

All must pass. `seo:check` should be unaffected — `/admin` is already `Disallow`ed in `lib/site-routes.ts`, which covers `/admin/*`.

- [ ] **Step 2: The integration script**

Run Task 8's script again against a fresh scratch database. Expected: `0 failed`.

- [ ] **Step 3: Contract run against a local full stack**

Boot the server on an isolated Mongo and point the client at it — this is the step that catches client/server contract drift before staging. Confirm by hand:

1. an unpriced template publishes with no modal
2. price a template in `/admin/pricing` → the gallery badge appears
3. logged out, publish it → login, then the paywall, with the numbers the panel previewed
4. pay with points → the page goes live with no second Publish click
5. press Publish again → free
6. `DELETE` the pricing row → the template publishes free again

- [ ] **Step 4: Push both branches and confirm staging**

```bash
cd server && git push -u origin feat/superadmin-template-pricing
cd ../client && git push -u origin feat/superadmin-template-pricing
```

Merge both into `dev`, let the deploy run, then verify on **`stag.subhsandesh.in`** — a `dev` deploy serves staging; `dev.subhsandesh.in` serves the production build and will show you the old code.

Before driving the browser, disable the cache over CDP, or you will debug stale chunks instead of this change.

Run, on staging, with a Razorpay **test** key configured:

1. free template → build, publish, no modal, page live
2. `/admin/pricing` as the super admin → price a template ₹10 / 90%
3. that template, logged out → Publish → login → paywall reads `₹100` struck, `₹10`, `90% OFF`, `You save ₹90`
4. Razorpay test card → page live and shareable, share link opens
5. re-publish the same page → free, no modal
6. **`eid-mubarak`** — one of the seven previously ungated handlers, and the case that silently publishes free if Task 5 regressed: price it, then confirm a new page is refused until paid
7. `/admin/pricing` as a plain admin → redirected

- [ ] **Step 5: Report**

State plainly what passed, what did not, and anything left undone. Do not claim the feature works on the strength of a compile.

---

## Self-Review

**Spec coverage.** Every numbered section of the spec maps to a task: 3.1 → Tasks 3, 9; 3.2 → Tasks 10, 14–19; 3.3 → Task 6; 3.4 → Task 5; 3.5 → Task 13; §4.1–4.2 → Task 1; §4.3 → Task 2; §4.4 → Task 4; §4.5 → Tasks 7, 11; §4.6 → Tasks 1, 3; §5.1 → Tasks 3–7; §5.2 → Tasks 9–13; §7 failure modes → Tasks 3, 9 (fail-open) and Task 4 (grandfathering); §8 → Tasks 1, 2, 5, 6, 8, 20.

**Two deliberate departures from the spec**, both recorded here rather than silently:

1. The spec described a `useTemplatePricing` hook and a per-editor `PaymentModal`. This plan mounts one `PaywallHost` globally and adds a Redux slice instead, because the per-editor approach needs two files changed per template — which is precisely why only two of forty-two templates ever got a paywall. Same behaviour, half the sweep, one place for the checkout logic to be wrong.
2. The spec said "43 editors"; the true count is 42 publishable templates (40 to sweep, 2 to rewire) plus 10 that cannot be priced at all. The reference table in this plan is authoritative.

**Placeholder scan.** No TBD, TODO, or "handle appropriately". Every code step carries real code. Task 11 Step 3 and Task 13 Step 3 specify required content rather than full JSX, because both must first read the `subhsandesh-theme` skill and the sibling admin page — prescribing exact markup before reading the theme would produce off-palette UI. Both list every required element and every edge case.

**Type consistency.** `ResolvedPricing` has the same field names in `server/src/config/pricingMath.ts` and `client/config/templatePricing.ts`, and the wire format is the server's. `PricingRow` matches the model. `slugForTemplateType` is spelled the same in Tasks 2, 3 and 6. `maybePaywall`, `paidFor`, `clearPaid` match between Tasks 10, 14 and the sweep recipe. `invalidatePricingCache` matches between Tasks 3 and 7. `finalPricePaise` is paise in every layer; rupees appear only in the panel's inputs and in `formatINR`.

**One known risk, stated rather than designed around.** Task 5's coverage test greps controller source for `checkPublishAccess`. It proves the gate is *mentioned*, not that it is reached on every path — a handler with an early `isPublished = true` above the gate would pass. Task 8's integration script is what actually proves the gate fires, and it covers `holi` and `eid` specifically. If a future template needs stronger proof, add it to the integration script, not to the grep.
