# New template checklist — copy/paste order

When the user hands you a new template (mockup, design, or "make X a template"), work in this order. Pick the kebab route `xxx`, the type string `"xxx"`, the model name `XxxPage`.

## 0. Decide the identity
- Route folder: `client/app/(templates)/xxx/` → URL `/xxx`.
- Type string (used in `TEMPLATE_LOOKUPS`, `SharePageClient`, share response): `"xxx"` (can differ from route, e.g. route `/eid-mubarak` but type `"eid"`).
- API namespace: `/api/xxx-pages` (plural `-pages`).
- Draft key `xxx_draft`; unlock key `xxx_unlocked_${shareId}`.
- If it's the new SubhSandesh look → also load the `subhsandesh-theme` skill.

## 1. Server (do first — the client depends on the contract)
- [ ] `server/src/models/XxxPage.ts` — schema per `reference/server.md` (shareId `randomUUID()` on create; bcrypt `password` + `passwordRaw select:false`; `isPublished`, `viewCount`, `comparePassword`).
- [ ] `server/src/controllers/xxxPage.controller.ts` — 8 handlers (create, getMy, getById-owner, update, publish→`buildShareUrl`, getShared-public, verify-public, delete).
- [ ] `server/src/routes/xxxPage.routes.ts` — public `/share/:shareId` + `/share/:shareId/verify` BEFORE `router.use(protect)`, then owner CRUD (`/my` before `/:id`).
- [ ] `server/src/routes/index.ts` — `router.use("/xxx-pages", xxxPageRoutes)`.
- [ ] `server/src/controllers/share.controller.ts` — add `{ model: XxxPage, templateType: "xxx", editorRoute: "/xxx" }` to `TEMPLATE_LOOKUPS`.

## 2. Client editor
- [ ] `client/app/(templates)/xxx/components/types.ts` — `XxxData`, `DEMO_DATA`, `xxxDataToBody`, `dbToXxxData`.
- [ ] `client/app/(templates)/xxx/components/XxxTemplate.tsx` — the visual template. Accepts `{ data, mode: "preview"|"live", shareId?, hasPassword? }`. Inline the `mode==="live"` brand logo top-right (`reference/shared-viewer.md` §4).
- [ ] `client/app/(templates)/xxx/hooks/useXxxEditor.ts` — the state machine + draft + create/update/publish + deferred-publish effect + share/copy (`reference/client-editor.md`).
- [ ] `client/app/(templates)/xxx/components/EditSheet.tsx` — the Create form (required field, delivery email if needed, optional Password → `pagePassword`, image→base64).
- [ ] `client/app/(templates)/xxx/page.tsx` — thin renderer: preview backdrop, top bar (Back + polymorphic Create/Publish/Share + Edit), EditSheet, `<AuthModal onClose={e.closeAuth} onSuccess={e.closeAuthSuccess}/>` when `e.showAuth`, toast stack.
- [ ] (optional) `config.ts` — the `/templates` gallery card metadata (slug, type, coverImage, previewText, emoji).

## 3. Shared / recipient page
- [ ] `client/app/[id]/XxxViewer.tsx` — `unlocked` state + `XxxPasswordGate` (POST verify) + `dbToXxxData` → `<XxxTemplate mode="live" />`.
- [ ] `client/app/[id]/SharePageClient.tsx` — (a) `const XxxViewer = dynamic(...)`; (b) add `"xxx"` to the early-return raw-data list; (c) add the `templateType === "xxx"` render guard.
- [ ] `client/app/[id]/page.tsx` — **no change** (generic SSR via `/share/:shareId` + `getSharePageMeta`).

## 4. Verify the whole flow
1. `/xxx` opens → live demo preview + Back/Create top bar.
2. Create → form → fill → refresh page → draft restores.
3. Save → preview shows your data → top bar shows Edit + Publish.
4. Publish while logged out → AuthModal → after login it auto-publishes → Share button appears.
5. Open the share URL in another browser/incognito → recipient viewer renders with SubhSandesh logo top-right (→ `/templates`).
6. If a password was set → password gate appears; correct password unlocks and caches in sessionStorage.

Use the `verify` / `run` skills to drive the app and confirm each step end-to-end before declaring done.

## Common pitfalls
- Forgetting the `share.controller.ts` `TEMPLATE_LOOKUPS` entry → SSR metadata + `/api/share/:shareId` 404 for the new type.
- Forgetting the `SharePageClient` early-return list entry → viewer never renders (falls through).
- Auth-gating the editor instead of only the Publish click → breaks the "fill first, login later" UX.
- Constructing the share URL on the client → use `data.shareUrl` from the publish response.
- Overwriting `password` with an empty string on update → wipes the recipient's password.
- `mode` mismatch: editor uses `"preview"`, viewer must pass `"live"` (that's what shows the brand logo).
