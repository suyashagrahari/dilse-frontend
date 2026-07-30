# Analytics setup — day-one checklist

The code on this branch is complete and inert. **Nothing is tracked until you
create the accounts and add two secrets.** That is deliberate: the branch is safe
to merge before you have any IDs.

Work through this in order. The steps marked ⚠️ are the ones that silently ruin
the data if skipped — they are not optional polish.

---

## 1. Create the GA4 property

1. <https://analytics.google.com> → Admin → Create → Property
2. Name it `SubhSandesh`, time zone **(GMT+05:30) India**, currency **INR**.
3. Create a **Web** data stream for `https://subhsandesh.in`.
   Under *Enhanced measurement*, leave everything **on** — scroll depth, outbound
   clicks and site search are free and need no code.
4. Copy the **Measurement ID** (`G-XXXXXXXXXX`).

### ⚠️ 1a. Unwanted referrals — do this now, not later

Admin → Data Streams → your stream → **Configure tag settings** → Show all →
**List unwanted referrals** → add:

```
subhsandesh.in
```

**Why this matters more than anything else here.** Share links live on
`alice.subhsandesh.in`. When a recipient clicks "Create" they cross to
`subhsandesh.in`, and without this entry GA4 treats that as an external referral:
the session ends, a new one starts, and the signup is attributed to
`alice.subhsandesh.in / referral` instead of to the original source. Your viral
loop becomes two unlinked halves and the viral coefficient is unmeasurable.

The code half of this fix (`cookie_domain: '.subhsandesh.in'`) is already in
`components/analytics/AnalyticsProvider.tsx`. Both halves are required.

### ⚠️ 1b. Data retention

Admin → Data Settings → **Data Retention** → change **2 months → 14 months**.

The 2-month default is silent and irreversible. Data older than the window is
permanently deleted; raising it later does not bring anything back.

### ⚠️ 1c. Register custom dimensions

Admin → **Custom definitions** → Create custom dimension, once per row.
Events are collected correctly without this, but **no breakdown will render in any
report** until each parameter is registered. This is the single most common
"analytics is broken" false alarm.

| Dimension name | Scope | Event parameter |
|---|---|---|
| Template | Event | `template` |
| Failure reason | Event | `reason` |
| Method | Event | `method` |
| Source | Event | `source` |
| Is authenticated | Event | `is_authenticated` |
| Web vital rating | Event | `metric_rating` |
| Visitor type | **User** | `visitor_type` |

Do **not** register `share_id`. It is one value per share link ever created;
registering it would exhaust GA4's cardinality budget and push `template` into
the `(other)` bucket, taking your most useful dimension down with it.

### 1d. Internal traffic filter

Admin → Data Streams → Configure tag settings → **Define internal traffic** → add
your office/home IP. Then Admin → Data Settings → **Data Filters** → the
"Internal Traffic" filter → set state to **Active**.

It ships as *Testing*, which does nothing. At low traffic your own clicking
through templates will otherwise dominate the numbers.

---

## 2. Create the Clarity project

1. <https://clarity.microsoft.com> → new project for `subhsandesh.in`.
2. Copy the **Project ID**.

### ⚠️ 2a. Set masking to Strict — before any real traffic

Settings → **Masking** → **Strict**.

Clarity's default ("Balanced") masks form inputs but **not rendered page text**.
This product's content is private messages — apology letters, love notes, names.
On Balanced, a session replay would contain the full text of a user's letter,
readable by anyone with dashboard access.

Verify by opening your own replay and confirming the message text is redacted.
Do this before you have real users, not after.

What the code already does for you:

- Clarity is **not loaded at all** when a visit *starts* on a share page
  (`app/[id]/**`) — recipients arrive from a WhatsApp link and never consented to
  being recorded.
- `setClarityConsent()` exists in `lib/analytics/track.ts` for when/if you add a
  consent banner. Clarity ignores GA4 Consent Mode, so it needs its own call.

### 2b. Link Clarity to GA4 (optional, high value)

Clarity → Settings → Integrations → Google Analytics. This lets you jump from a
GA4 segment straight to the matching session replays — the fastest path from
"where they drop" to "why they dropped".

---

## 3. Add the GitHub secrets

Repo → Settings → Secrets and variables → Actions:

| Secret | Value |
|---|---|
| `NEXT_PUBLIC_PROD_GA_ID` | `G-XXXXXXXXXX` |
| `NEXT_PUBLIC_PROD_CLARITY_ID` | Clarity project ID |
| `NEXT_PUBLIC_DEV_GA_ID` | leave unset, or a **separate** dev property |
| `NEXT_PUBLIC_DEV_CLARITY_ID` | leave unset |

Leave the DEV ones unset unless you want dev traffic tracked. An unset secret
resolves to an empty string, and an empty ID disables that tool entirely.

⚠️ `NEXT_PUBLIC_*` values are inlined at **build** time. Adding them to the
runtime env-file used by `scripts/deploy.sh` has **no effect** — the build has
already finished by then. The Dockerfile and all three workflows on this branch
already pass them as build-args.

---

## 4. Verify it actually works

After the first deploy:

```bash
# 1. Was the ID baked into the bundle? No hit = it will never work in prod.
grep -rl "G-XXXXXXXXXX" .next/static/chunks | head
```

In the browser on production:

```js
window.dataLayer   // array → gtag loaded
window.clarity     // function → Clarity loaded (undefined on share pages: correct)
```

DevTools → Network → filter `collect?v=2` → one request per event.

Then GA4 → **Reports → Realtime** (events appear in seconds) or **Admin →
DebugView** for full parameters. Standard reports lag 24–48h — that delay is
normal and not a bug.

Walk the funnel once: gallery → editor → save → publish → share → open the share
link → click Create. You should see `template_card_clicked`, `page_saved`,
`publish_clicked`, `publish_success`, `share`, `recipient_viewed`,
`create_cta_clicked`.

### Local debugging without sending anything

```js
window.__ANALYTICS_DEBUG__ = true
```

Every event is then logged to the console and **nothing is transmitted**. This is
also how you check for double-fires.

---

## 5. Build the reports that answer the original question

### Funnel exploration (where people drop)

Explore → Funnel exploration. Steps:

1. `template_card_clicked`
2. `page_saved`
3. `publish_clicked`
4. `publish_success`
5. `share`

⚠️ **Add a segment: `visitor_type = creator`.** Without it, recipients — who open
share links many times per link and are not customers — are counted as users who
never converted. Your conversion rate collapses and the report is worthless.

### The growth loop (your most important number)

`recipient_viewed` → `create_cta_clicked` → `sign_up`. The ratio of
`create_cta_clicked` to `recipient_viewed` is your viral coefficient. Requires
step 1a to be done.

### Where publishing breaks

Report on `publish_failed` broken down by `reason` and `template`.
Watch specifically for `reason = PAYMENT_REQUIRED` on any template other than
`holi` — that means a second template was priced on the server while only Holi's
editor knows how to show a payment modal (see `FINDINGS.md` P2), and those sales
are being lost silently.

Also compare `auth_required` against `publish_success`: the gap is people who hit
the login wall and never came back. Cross-reference with
`login { method: "google_bridge" }`, because that redirect path currently loses
the pending publish entirely (`FINDINGS.md` P3).

### Then watch the replays

Clarity → Recordings, filtered to the pages where GA4 shows the biggest drop.
Sort by **rage clicks** and **dead clicks** first — those usually explain most of
a drop-off in one sitting.

---

## What this does not do

- **No consent banner.** Consent Mode v2 defaults to granted analytics outside the
  EEA/UK/CH and denied inside, with advertising signals denied everywhere. If EEA
  traffic becomes material you need a banner plus `setClarityConsent()`.
- **Ad blockers** will hide roughly 5–15% of traffic, permanently. Read
  step-to-step *ratios*, never absolute counts, and never reconcile GA4 against
  your database row counts — they will not match, and that is expected.
- **`edit_started`** is defined in the taxonomy but not yet wired to a call site.
  Everything else in `lib/analytics/events.ts` fires.
