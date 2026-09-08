---
name: share-page-builder
description: >
  The canonical end-to-end pattern for building a personalised "share card"
  template (editor page → live preview → Create form → sessionStorage draft →
  auth-deferred Publish → password-protected shared page → recipient viewer with
  brand logo + Create CTA). USE THIS whenever the user gives you a new template
  (an HTML/React mockup, a design, a "make this a template", "add a template
  page", "wire up X template", "birthday/holi/eid-style template", "gift card
  page"), or asks to edit the editor flow, publish flow, share flow, share
  links, password gate, or shared/recipient page for any template. When active,
  reproduce the apology-dashboard flow exactly: gallery/preview → Back+Create top
  bar → AI story fill panel (schema + useStoryFill + persistStory — every template
  gets it) → form saved to sessionStorage → Save shows preview → Publish (login if
  logged-out, then auto-publish) → Share option → shared page with the brand's
  logo top-right + small Create CTA + password logic.
---

# SubhSandesh Template Flow — End-to-End Pattern

This skill encodes the exact flow used by **`/apology-dashboard`** (the reference
of record). Every new template MUST reproduce this flow. Do not invent a new
architecture — copy this one, changing only the template's own content/fields.

**The user-facing flow to reproduce, verbatim:**
1. Open `/<template>` → the template renders immediately as a **live demo preview** (seeded with demo data). This is the "gallery" state.
2. A floating **top bar** shows **Back** (left) and a polymorphic primary button (right) that starts as **Create**.
3. Click **Create** → a **form** (bottom sheet) opens to fill in details. Every keystroke is saved to **sessionStorage/localStorage draft** so it survives refresh.
4. Click **Save** → sheet closes, top bar's **Edit** appears, primary button flips to **Publish**, and the preview now shows the user's data.
5. Click **Publish**:
   - **Logged out** → stash the payload in a ref, open **AuthModal**. After successful login the publish **auto-resumes** (deferred publish).
   - **Logged in** → create page → publish → success toast → primary button flips to **Share**.
6. **Share** copies/shares the link. If the user set a **password**, the shared page is gated.
7. The **shared/recipient page** (`/[shareId]`) renders a dedicated full-page viewer with the **SubhSandesh logo top-right** (which doubles as the "create your own" CTA → `/templates`), plus a password gate when required.

Read the reference files for exact code before writing anything:
- `reference/server.md` — model, controller, routes, share registry, API contracts.
- `reference/client-editor.md` — the editor hook state machine, sessionStorage draft, deferred publish, top bar, EditSheet form.
- `reference/shared-viewer.md` — `[id]` SSR, `SharePageClient` registration, `XxxViewer`, password gate, brand logo / Create CTA.
- `reference/new-template-checklist.md` — the copy-paste file checklist for a brand-new template.
- `reference/ai-story-fill.md` — **AI story fill**: the schema file, the registry
  line, the `useStoryFill` wiring, and `persistStory()`. Every template gets this.

---

## The 11 files a new template touches

Reference template = **apology-dashboard**, type string `"apology-dashboard"`, route `/apology-dashboard`, API namespace `/api/apology-dashboard-pages`. For a new template `xxx`:

**Server (`server/src/`)**
1. `models/XxxPage.ts` — Mongoose schema. `userId`, `shareId` (`randomUUID()` in `pre("save")`, `unique/sparse/index`), template content fields, `password` (bcrypt-hashed in pre-save) + `passwordRaw` (`select:false`), `isPublished`, `viewCount`, `comparePassword()`.
2. `controllers/xxxPage.controller.ts` — `createXxxPage`, `getMyXxxPages`, `getXxxPage`, `updateXxxPage`, `publishXxxPage`, `getSharedXxxPage`, `verifyXxxPagePassword`, `deleteXxxPage`.
3. `routes/xxxPage.routes.ts` — public `GET /share/:shareId` + `POST /share/:shareId/verify` **before** `router.use(protect)`, then owner CRUD.
4. `routes/index.ts` — `router.use("/xxx-pages", xxxPageRoutes)`.
5. `controllers/share.controller.ts` — add a `TEMPLATE_LOOKUPS` entry `{ model, templateType: "xxx", editorRoute: "/xxx" }`.
6. `config/aiFill/xxx.ts` — **the AI fill schema.** `slug`, `audience`, `premise`, and one `fields[]` entry per text leaf the model may write. See `reference/ai-story-fill.md`.
7. `config/aiFill/registry.generated.ts` — two alphabetical lines: the import and the `SCHEMAS` entry. That is the whole registration.

**Client (`client/`)**
8. `app/(templates)/xxx/page.tsx` + `app/(templates)/xxx/hooks/useXxxEditor.ts` + `components/` + `components/types.ts` (with `xxxDataToBody` / `dbToXxxData`). The hook calls `useStoryFill({ slug: "xxx", demo: DEMO_DATA, current: mf, onFilled: setMf })`; the page mounts `<StoryStarter>` and points **Create** at `handleStartCreate`.
9. `app/[id]/XxxViewer.tsx` — dedicated full-page recipient viewer with password gate + brand logo.
10. `app/[id]/SharePageClient.tsx` — add `"xxx"` to the early-return list and add a dispatch guard returning `<XxxViewer rawData hasPassword shareId />`.
11. (SSR `app/[id]/page.tsx` needs **no change** — it is generic via `/share/:shareId` + `getSharePageMeta`.)

---

## Non-negotiable contracts (get these exactly right)

### Auth (client)
```ts
const { isAuthenticated, accessToken } = useAppSelector((s) => s.auth);
```
`AuthModal` from `@/components/AuthModal`, props `{ onClose, onSuccess, defaultMode? }`.

### Deferred publish (the core pattern)
```ts
const pendingPublishRef = useRef<{ data: XxxData; password: string } | null>(null);

async function publish() {
  if (!content.deliveryEmail?.trim()) { /* guard required fields */ return; }
  if (!isAuthenticated || !accessToken) {
    pendingPublishRef.current = { data: content, password: pagePassword };
    setShowAuth(true);            // open AuthModal, DEFER
    return;
  }
  /* create/update → POST /:id/publish → setShareUrl → clearDraft → toast */
}

// auto-resume after login
useEffect(() => {
  if (!isAuthenticated || !accessToken || !pendingPublishRef.current) return;
  const { data, password } = pendingPublishRef.current;
  pendingPublishRef.current = null;
  /* create + publish, then setShareUrl, clearDraft */
}, [isAuthenticated, accessToken]);

// AuthModal wiring in page.tsx:
// onClose = closeAuth  (clears pendingPublishRef → cancel)
// onSuccess = closeAuthSuccess  (just closes; the effect auto-resumes)
```

### AI story fill (every template — read `reference/ai-story-fill.md`)

**Create** opens the AI panel, not the blank form. The panel offers "Use my
story" to a signed-in sender who has one, or a composer with a highlighted
sample paragraph to everyone else; **Generate** fills every declared field; the
review screen lets them edit each one; anything unfilled is a normal form field.

```ts
// useXxxEditor.ts — inert when the server has no schema for this slug
const storyFill = useStoryFill<XxxData>({ slug: "xxx", demo: DEMO_DATA, current: mf, onFilled: setMf });
const { schema: storySchema, setMode: setStoryMode, persistStory } = storyFill;
const [storyStarted, setStoryStarted] = useState(false);

const handleStartCreate = useCallback(() => {
  if (!storySchema) { handleEditClick(); return; }   // no schema → today's form
  seedManualForm();                                   // seed `mf` first
  setStoryMode("idle");
  setStoryStarted(true);
}, [storySchema, handleEditClick, seedManualForm, setStoryMode]);

const handleStoryManual = useCallback(() => setEditMode("manual"), []);
```

```tsx
// page.tsx — Create points at handleStartCreate; StoryStarter mounts AFTER EditSheet
: { label: "Create", onClick: e.handleStartCreate }
…
{e.storyStarted && <StoryStarter fill={e.storyFill} onManual={e.handleStoryManual} />}
```

`await persistStory()` goes in **both** publish paths — the direct one and the
auto-resume-after-login effect — right after the publish succeeds and before
`clearDraft()`. That is what makes the sender's *next* template pre-fill itself.

### sessionStorage draft
- One key: **`"xxx_draft"`** (apology uses `"apology_draft"`).
- Store `localStorage`-first, `sessionStorage` fallback (the user asked for session storage; the repo uses a store-picker that prefers localStorage and falls back to sessionStorage — keep that helper).
- Shape: `{ data: <XxxData>, password: "<pagePassword>", completed: false|true }`.
- Autosave `completed:false` on every form change; write `completed:true` in `handleSave`; **`clearDraft()` only on publish success**. Restore on mount (after any backend fetch).

### Polymorphic top-bar button (page.tsx)
```tsx
const topAction = e.showShare
  ? { label: "Share", onClick: e.handleShare }
  : e.showPublish
    ? { label: e.publishing ? "Publishing…" : "Publish", onClick: e.publish }
    : { label: "Create", onClick: e.handleEditClick };
// Back button (left) → router.push("/templates")
// Edit button shows once isPersonalized && !showShare
// showPublish = isPersonalized && !shareUrl && !publishing;  showShare = !!shareUrl;
```

### API endpoints (base = `${API_URL}/xxx-pages`)
| Op | Method | URL | Auth | Body |
|---|---|---|---|---|
| Create | POST | `/xxx-pages` | Bearer | `xxxDataToBody(data, password)` |
| Update | PUT | `/xxx-pages/:id` | Bearer | `xxxDataToBody(data, password)` |
| Publish | POST | `/xxx-pages/:id/publish` | Bearer | none → returns `data.shareUrl` |
| My pages | GET | `/xxx-pages/my` | Bearer | — |
| Get one (owner) | GET | `/xxx-pages/:id` | Bearer | — |
| Delete | DELETE | `/xxx-pages/:id` | Bearer | — |
| **Shared (public)** | GET | `/xxx-pages/share/:shareId` | none | → `{success,data,hasPassword,templateType}` |
| **Verify (public)** | POST | `/xxx-pages/share/:shareId/verify` | none | `{password}` → `{success,verified}` |

Headers: `Content-Type: application/json`, `Authorization: Bearer <accessToken>`, and `ngrok-skip-browser-warning: true` when `IS_NGROK`.

### Shared page (recipient)
- `SharePageClient` stores **raw** `result.data` for dedicated viewers and returns `<XxxViewer rawData hasPassword shareId />`.
- `XxxViewer`: `unlocked` state = `!hasPassword || sessionStorage[`xxx_unlocked_${shareId}`]==="true"`. If gated, render a password-gate that POSTs to `/xxx-pages/share/:shareId/verify` `{password}`; on `{verified:true}` set the sessionStorage key + unlock. Else `dbToXxxData(rawData)` → `<XxxTemplate mode="live" shareId hasPassword />`.
- **Brand logo + Create CTA**: inside the template, gated on `mode === "live"`, render a fixed **top-right** `<Link href="/templates">` badge with `/logo.webp` + "SubhSandesh" label. In dedicated viewers **this logo IS the "create your own" affordance** — it links to `/templates`. (Add a small bottom-right "Create" `<Link href="/templates">` too if the user explicitly asks for a separate corner button.)

---

## Rules

1. **Copy apology-dashboard, don't reinvent.** One controller hook owns all state; `page.tsx` is a thin renderer; three booleans (`isPersonalized`, `shareUrl`, `publishing`) drive the polymorphic top bar.
2. **`shareId = randomUUID()`** in the model's `pre("save")` on create — NOT an 8-char base64url (the memory note is outdated for this family). Publish only flips `isPublished`.
3. **Password = bcrypt** hashed in pre-save (cost 10) with plaintext mirrored in `passwordRaw` (`select:false`); `comparePassword` returns `true` when no password is set. Never ship `password`/`passwordRaw` to the client — the shared GET returns only `hasPassword`.
4. **Publish is auth-deferred**, never auth-gated at edit time. Anyone can open the editor and fill the form; login is required only at the Publish click, and it auto-resumes.
5. **Draft key + unlock key are namespaced** per template: `xxx_draft`, `xxx_unlocked_${shareId}`.
6. **Register everywhere**: model → controller → routes → `routes/index.ts` mount (`/xxx-pages`, plural) → `share.controller.ts` `TEMPLATE_LOOKUPS` → `config/aiFill/xxx.ts` + `registry.generated.ts` → `SharePageClient` early-return list + dispatch guard. Missing any one breaks the shared page or the fill button, silently.
6a. **AI fill ships in the same commit as the template**, never "later". It fails
   soft by design — no schema means the hook goes inert and Create falls back to
   the plain form — so a missing schema is invisible in review and glaring to the
   sender, who gets a blank form on your template and an AI writer on every other
   one. The schema declares **text leaves only**: `FieldKind` has no media member
   and `assertNoMediaPaths` rejects photo/audio/url paths, because the model must
   never invent a URL. Boot the server and confirm there is no
   `[aiFill] schema "xxx" has N problem(s)` line — validation is non-fatal, so
   nothing else will tell you.
7. **Share URL comes from the server** (`buildShareUrl` in `server/src/utils/shareUrl.ts`, returned in the publish response as `data.shareUrl`) — do not construct it on the client. `shareId = shareUrl.split("/").pop()`.
8. **Brand logo top-right on `mode==="live"`** in every dedicated viewer, wrapped in `<Link href="/templates">` (the recipient's create path).
9. If the template belongs to the **new SubhSandesh look**, also load the `theme-design-system` skill for fonts/colors. This skill governs *flow*; that one governs *visual design*.

See memory: [[project_apology_dashboard]], [[auth-deferred-publish]] (slash command), and the template-pattern notes in `MEMORY.md`.
