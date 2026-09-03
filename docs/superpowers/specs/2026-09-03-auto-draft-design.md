# Auto-Draft Across Every Template — Design

**Date:** 2026-09-03
**Branch:** `feat/auto-draft` (client + server)
**Status:** built. Three decisions changed during implementation — see *Corrections* at the end.

## Goal

Every page a user builds becomes a draft automatically. Drafts appear in the
user's profile marked **Draft**; published pages are marked **Live**. Clicking a
draft reopens the editor with the work exactly where it was left, photos
included.

## What already exists (do not rebuild)

| Piece | State |
|---|---|
| `isPublished` on page models | present on 44 models |
| `TEMPLATE_LOOKUPS` (model + templateType + editorRoute) | the single registry, `server/src/controllers/share.controller.ts:84` |
| Profile Draft/Live badges | already rendered, `client/app/(app)/profile/page.tsx:859,939` |
| Profile Edit button | already pushes `{editorRoute}?edit={pageId}`, line 867 |
| `?edit=` resume | works in 45 of 51 editors |
| `POST /media/upload` → S3 → CDN | `server/src/routes/media.routes.ts`, auth-protected, 20MB, image processing |
| Local autosave | 29 editors, ad-hoc `localStorage` keys, no shared abstraction |

## The gaps this closes

1. A page row is created **only when Publish is pressed while signed in**. Build
   a page and walk away and nothing reaches the profile.
2. Anonymous work sits in one `localStorage` slot per template and is never
   promoted to a server draft on sign-in.
3. Six editors ignore `?edit=` — the profile's Edit button opens a blank editor
   for them: `anniversary-gf`, `birthday-gf`, `capsule`, `darling`, `love-gf`,
   `reception`.
4. 29 bespoke autosave implementations with no shared contract.
5. 38 templates store photos as base64 data URLs inside the page document.
   Drafts multiply those documents, and `localStorage` cannot hold them.

## Lifecycle

    anonymous editing ──▶ local scratch (IndexedDB, one slot per templateType)
            │
            │ signup / login  ──▶ ADOPT
            │                     1. media → S3
            │                     2. POST /{apiBase} → row, isPublished:false
            │                     3. clear scratch
            ▼
       server draft ──▶ milestone saves (PUT /{apiBase}/:id)
            │
            └──▶ publish ──▶ isPublished:true
                  profile: "Draft" ────────────▶ "Live"

## Decisions (settled with the user)

- **Anonymous work is local-first.** No anonymous rows in Mongo. It is promoted
  the moment the user signs up or logs in.
- **Saves are milestone-based**, not per-keystroke: edit sheet closes, preview
  entered, `visibilitychange` to hidden, `pagehide`.
- **Photos are uploaded to S3 at adoption time**, and the draft stores real CDN
  URLs. A returning user sees their pictures. This also moves the 38 base64
  templates off in-document blobs.
- **One profile list** with All / Drafts / Live filter chips. No second tab.

## Components

### `client/lib/draft/localScratch.ts`
Replaces 29 ad-hoc `localStorage` keys with one IndexedDB store.

    interface Scratch {
      schemaVersion: number;   // bump rejects incompatible old scratch
      templateType: string;
      data: unknown;           // the editor's own payload shape, untouched
      updatedAt: number;
    }

IndexedDB rather than `localStorage` because a base64 photo overruns the ~5MB
quota — a live bug in the 38 data-URL templates today. One slot per
`templateType`: a signed-out visitor cannot own two drafts of the same template
because they have no identity to own them with.

### `client/lib/draft/mediaRefs.ts`
Pure functions. Walks an arbitrary editor payload and finds every image
reference, classifying each as `data-url`, `blob-ref`, or `remote`.

**`remote` must be returned untouched.** Re-uploading an existing CDN URL on a
second adoption is the one bug that would silently multiply S3 objects.

### `client/lib/draft/adopt.ts`
Runs on auth success. Ordered, and the order is load-bearing:

1. Read scratch. Nothing there → no-op.
2. For each non-remote media ref: `POST /media/upload` → CDN URL.
3. Rewrite the payload with the returned URLs.
4. `POST /{apiBase}` → draft row (`isPublished:false`).
5. Only once an id comes back: clear the scratch.

Wired once in `AuthModal.onSuccess`, which covers all four auth paths
(register+OTP, login, OTP verify, Google) instead of only a remembered one.

### `client/lib/draft/useDraft.ts`
The single hook each editor wires in. Owns milestone triggers, dirty-checking,
and the local↔server switch. Editors call `draft.touch(data)`.

### `client/lib/draft/resume.ts`
One `?edit=<id>` loader, retro-fitted to the six editors that ignore it.

## Server changes

- **`getMyCreations` projection + parallelism.** Today: 43 sequential
  `model.find({ userId })` calls returning whole documents. With base64 photos
  inside, a user with 20 drafts pulls tens of MB to render a list of titles.
  Auto-drafts make this the hottest endpoint in the app. Add an explicit
  `.select()` and run the lookups through `Promise.all`.
- **`DELETE /share/me/drafts/:templateType/:pageId`** — discard a draft,
  owner-scoped, refuses a published page.
- **No schema migration.** `isPublished:false` already means draft.

## Failure handling

Adoption is the only risky step, and it is atomic from the user's point of view:
the scratch is cleared *only* after the row returns an id.

- Media upload fails → scratch intact, no row created, toast naming the failed
  photo. Publish still works through the existing at-publish upload path.
- `POST /{apiBase}` fails → scratch intact, retried at the next milestone.
- `/media/upload` dead → degrades to today's behaviour. Never loses work.

## Testing

Pure functions, tested without importing frozen env (the `formatReplyToAddress`
pattern):

- scratch serialise / deserialise, and schema-version rejection
- `mediaRefs`: data URL, blob ref, and an already-remote CDN URL left alone
- dirty-check: identical payload produces no write
- adoption ordering: media before POST, scratch cleared only after an id

Then on dev: build anonymously → sign up → draft appears in the profile with
photos visible → resume → publish → shows Live.

## Rollout

Three reviewable stages on `feat/auto-draft`, each deployable to dev alone:

1. `lib/draft/` + server changes + 3 pilot templates
2. the 6 resume retrofits
3. roll `useDraft` across the remaining editors

Verify at **stag.subhsandesh.in** — `dev.subhsandesh.in` serves the prod build.


## Corrections made during implementation

Three things in the design above turned out to be wrong. They are recorded here
rather than edited away, because each was wrong for a reason worth keeping.

### 1. `adopt`/`useDraft` take the editor's save, not `apiBase` + `toBody`

The design had each editor hand over a REST base and a field-mapping function.
That means forty-three editors restating a field list each already states
inside its own `saveToServer`/`create`. A duplicated field list does not fail
loudly — it saves eleven of twelve fields, and the twelfth goes missing only
for people who left and came back.

They now take `persist: (data) => Promise<id | null>`. Each template's wire
shape is described exactly once, where it already lived.

The draft path still does not call `create`/`update` directly in the 31
editors that have them: both read `content` from the closure rather than taking
it as an argument, and adoption must write the payload that came out of the
scratch — which during a sign-in is not what the editor is showing. Those get
`persistDraft` plus the template's own `{x}DataToBody`.

### 2. `useResumeDraft` reads the URL itself

The design had each editor pass `searchParams.get("edit")`. For the forty that
already call `useSearchParams` that cost nothing. For the two that did not,
adding the call broke the production build:

    useSearchParams() should be wrapped in a suspense boundary
    at page "/anniversary-gf"

`useSearchParams` opts a page out of static prerendering unless it sits under
Suspense, and a hook meant to drop into any of forty-three editors cannot be
the thing that requires one. The id is now read from `window.location.search`
inside the effect — client-only by construction. Editors that already hold a
`searchParams` may still pass `editId`.

### 3. Media promotion is best-effort per photo, not all-or-nothing

The design implied adoption fails if a photo fails. It does not: an unmapped
ref stays in the payload and the rest of the draft is saved. Saving nine of ten
photos and re-adding the tenth is a better afternoon than losing all ten
because one was corrupt, and the ref is the only pointer to the local blob, so
blanking it would destroy the photo to make the payload tidy.

The publish path is where a failed photo must stop everything, and it still
does — it uploads independently and refuses to publish a page whose image would
404 for the recipient.

## What shipped

| | |
|---|---|
| `useDraft` coverage | **43/43** publishing templates |
| `?edit=` resume | **43/43**, up from 37 |
| Client unit tests | 35, all passing |
| Server unit tests | 251, all passing |
| `tsc --noEmit` | clean, both repos |
| `next build` | clean |
| Assertion | `npm run draft:check` fails CI if a publishing template stops keeping a draft or stops reopening |

Editors needing individual handling: `product` (normalises before mapping),
both rakhi templates (`idb:` blob refs, so they pass their own `getLocal`),
`streak` (its `mf` is a `StreakForm`, converted via `dataToForm`), `capsule`
(saves `capsule` not `draft`, milestone is sealing, and resume must rebuild the
form with `capsuleToDraft`), `valentine-gf` (lives in `page.tsx` with plain
async functions; its save answered only from the POST branch, so an update
always looked like a failure), and four whose `saveToServer` returned nothing —
which reads as a failed save and would have produced a second identical draft
at the next milestone.
