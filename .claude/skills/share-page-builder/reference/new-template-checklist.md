# New template checklist — copy/paste order

When the user hands you a new template (mockup, design, or "make X a template"), work in this order. Pick the kebab route `xxx`, the type string `"xxx"`, the model name `XxxPage`.

## 0. Decide the identity
- Route folder: `client/app/(templates)/xxx/` → URL `/xxx`.
- Type string (used in `TEMPLATE_LOOKUPS`, `SharePageClient`, share response): `"xxx"` (can differ from route, e.g. route `/eid-mubarak` but type `"eid"`).
- API namespace: `/api/xxx-pages` (plural `-pages`).
- Draft key `xxx_draft`; unlock key `xxx_unlocked_${shareId}`.
- If it's the new SubhSandesh look → also load the `theme-design-system` skill.

## 1. Server (do first — the client depends on the contract)
- [ ] `server/src/models/XxxPage.ts` — schema per `reference/server.md` (shareId `randomUUID()` on create; bcrypt `password` + `passwordRaw select:false`; `isPublished`, `viewCount`, `comparePassword`).
- [ ] `server/src/controllers/xxxPage.controller.ts` — 8 handlers (create, getMy, getById-owner, update, publish→`buildShareUrl`, getShared-public, verify-public, delete).
- [ ] `server/src/routes/xxxPage.routes.ts` — public `/share/:shareId` + `/share/:shareId/verify` BEFORE `router.use(protect)`, then owner CRUD (`/my` before `/:id`).
- [ ] `server/src/routes/index.ts` — `router.use("/xxx-pages", xxxPageRoutes)`.
- [ ] `server/src/controllers/share.controller.ts` — add `{ model: XxxPage, templateType: "xxx", editorRoute: "/xxx" }` to `TEMPLATE_LOOKUPS`.

## 1b. AI story fill schema (`reference/ai-story-fill.md`) — not optional
- [ ] `server/src/config/aiFill/xxx.ts` — `slug` (= route segment), `audience`, `premise`, and one `fields[]` entry per **text** leaf the model may write. Paths resolve against `XxxData`. Text leaves only: no photo/audio/url paths, no pure visual choices, no reserved envelope keys (`language`, `languageName`, `excludedKeywords`, `filled_values`), ≤ 40 fields. Add `forbiddenOutput` if the template parodies a real product.
- [ ] `server/src/config/aiFill/registry.generated.ts` — the import + the `SCHEMAS` entry, alphabetical. Two lines, and that is the entire registration.
- [ ] Boot the server and confirm **no** `[aiFill] schema "xxx" has N problem(s)` in the log. Validation is deliberately non-fatal, so a broken schema kills only its own fill button — nothing else will tell you.

## 2. Client editor
- [ ] `client/app/(templates)/xxx/components/types.ts` — `XxxData`, `DEMO_DATA`, `xxxDataToBody`, `dbToXxxData`.
- [ ] `client/app/(templates)/xxx/components/XxxTemplate.tsx` — the visual template. Accepts `{ data, mode: "preview"|"live", shareId?, hasPassword? }`. Inline the `mode==="live"` brand logo top-right (`reference/shared-viewer.md` §4).
- [ ] `client/app/(templates)/xxx/hooks/useXxxEditor.ts` — the state machine + draft + create/update/publish + deferred-publish effect + share/copy (`reference/client-editor.md`).
- [ ] Same hook — AI fill: `useStoryFill<XxxData>({ slug: "xxx", demo: DEMO_DATA, current: mf, onFilled: setMf })`, plus `seedManualForm` / `handleStartCreate` / `handleStoryManual` / `storyStarted`, and `await persistStory()` in **both** publish paths before `clearDraft()` (`reference/ai-story-fill.md`).
- [ ] `client/app/(templates)/xxx/components/EditSheet.tsx` — the Create form (required field, delivery email if needed, optional Password → `pagePassword`, image→base64).
- [ ] `client/app/(templates)/xxx/page.tsx` — thin renderer: preview backdrop, top bar (Back + polymorphic Create/Publish/Share + Edit), EditSheet, `{e.storyStarted && <StoryStarter fill={e.storyFill} onManual={e.handleStoryManual} />}` mounted **after** EditSheet, `<AuthModal onClose={e.closeAuth} onSuccess={e.closeAuthSuccess}/>` when `e.showAuth`, toast stack. **Create calls `e.handleStartCreate`, not `e.handleEditClick`.**
- [ ] (optional) `config.ts` — the `/templates` gallery card metadata (slug, type, coverImage, previewText, emoji).

## 3. Shared / recipient page
- [ ] `client/app/[id]/XxxViewer.tsx` — `unlocked` state + `XxxPasswordGate` (POST verify) + `dbToXxxData` → `<XxxTemplate mode="live" />`.
- [ ] `client/app/[id]/SharePageClient.tsx` — (a) `const XxxViewer = dynamic(...)`; (b) add `"xxx"` to the early-return raw-data list; (c) add the `templateType === "xxx"` render guard.
- [ ] `client/app/[id]/page.tsx` — **no change** (generic SSR via `/share/:shareId` + `getSharePageMeta`).

## 4. Verify the whole flow
1. `/xxx` opens → live demo preview + Back/Create top bar.
2. Create → **StoryStarter opens**, not the blank form. Write a real two-line story → Generate → every declared field fills, the review rows are editable, and "these still need you" lists the rest. Signed in with a saved story → "Use my story" fills it in one tap. Bail to the plain form → the AI's work is still there.
3. Form → fill → refresh page → draft restores.
4. Save → preview shows your data → top bar shows Edit + Publish.
5. Publish while logged out → AuthModal → after login it auto-publishes → Share button appears.
6. Open the share URL in another browser/incognito → recipient viewer renders with SubhSandesh logo top-right (→ `/templates`).
7. If a password was set → password gate appears; correct password unlocks and caches in sessionStorage.
8. After that publish, open a *different* template's Create → it should already offer "Use my story", built from the story just persisted. If it doesn't, `persistStory()` is missing from the auto-resume-after-login publish path.

Use the `verify` / `run` skills to drive the app and confirm each step end-to-end before declaring done.

## Common pitfalls
- Forgetting the `share.controller.ts` `TEMPLATE_LOOKUPS` entry → SSR metadata + `/api/share/:shareId` 404 for the new type.
- Forgetting the `SharePageClient` early-return list entry → viewer never renders (falls through).
- Auth-gating the editor instead of only the Publish click → breaks the "fill first, login later" UX.
- Constructing the share URL on the client → use `data.shareUrl` from the publish response.
- Overwriting `password` with an empty string on update → wipes the recipient's password.
- `mode` mismatch: editor uses `"preview"`, viewer must pass `"live"` (that's what shows the brand logo).
- Shipping the template without `config/aiFill/xxx.ts` → the hook goes inert, Create silently falls back to the blank form, and nothing errors anywhere. Your template is the only one in the gallery that can't write itself.
- `slug` differing between the route, the schema and `useStoryFill({ slug })` → the schema fetch 404s and the panel never appears. Same symptom as no schema at all.
- Create still wired to `handleEditClick` → schema exists, panel never opens.
- `persistStory()` only in the direct publish path → the story is never saved for anyone who was logged out when they clicked Publish, i.e. most first-time senders.
- Declaring a media path (`photoUrl`, `images`, `coverSrc`) → boot validation rejects the schema outright. Photos are a manual upload; the model must never invent a URL.
