# Client editor reference (apology-dashboard)

Base: `client/app/(templates)/apology-dashboard/`
- `page.tsx` — thin renderer: top bar, live preview, edit sheet, AuthModal, toasts.
- `hooks/useApologyEditor.ts` — the whole state machine, draft storage, create/update/publish/share/auth.
- `components/EditSheet.tsx` — the Create form (bottom sheet, all fields + password + Save).
- `components/types.ts` — `XxxData` shape, `DEMO_DATA`, `xxxDataToBody`, `dbToXxxData`.

The hook is instantiated once (`const e = useXxxEditor()`); every button is a field on `e`.

## State machine (4 vars)

`editMode: null | "choose" | "manual" | "preview"` · `isPersonalized: bool` · `shareUrl: string|null` · `publishing: bool` (+ `previewVersion` remount key, `showAuth`).

```
[LANDING/DEMO]   editMode=null, isPersonalized=false, shareUrl=null
   displayData = content (= DEMO_DATA); top button = "Create"
      │ handleEditClick → seed mf from content|DEMO_DATA; setEditMode("manual")
      ▼
[CREATE-FORM]    editMode="manual"  (EditSheet visible; displayData = mf)
   autosave draft {completed:false} on every mf/pagePassword change
      │ handleSave (needs senderName) → setContent(mf); setIsPersonalized(true);
      │                                  setEditMode("preview"); bumpPreview();
      │                                  saveDraft({completed:true})
      ▼
[SAVED-PREVIEW]  editMode="preview", isPersonalized=true, shareUrl=null
   top button = "Publish" (showPublish); "Edit" button visible
      │ publish → guard(required fields) → guard(auth)
      │    ├ logged out → showAuth=true + pendingPublishRef set → [AUTH]
      │    └ logged in → publishing=true (POST create/PUT + POST publish)
      ▼
[PUBLISHING]     publishing=true (full-screen overlay)
      │ success → setShareUrl; clearDraft; publish-toast
      ▼
[PUBLISHED/SHARE] shareUrl set → showShare; top button = "Share"
   handleShare / handleCopy; shareId = shareUrl.split("/").pop()

[AUTH] modal over SAVED-PREVIEW: onClose=closeAuth (clears pendingPublishRef);
       onSuccess=closeAuthSuccess (closes) → auth effect auto-resumes publish
```

Derived flags:
```ts
displayData = (editMode === "manual" || editMode === "choose") ? mf : content;
showPublish = isPersonalized && !shareUrl && !publishing;
showShare   = !!shareUrl;
```
Extra entry: `?edit=<id>` / `?id=<id>` while authed loads an existing page straight into SAVED-PREVIEW (or PUBLISHED). On refresh, a `completed:true` draft restores SAVED-PREVIEW; a `completed:false` draft restores only form data into `mf`.

## Draft storage (localStorage-first, sessionStorage fallback)

```ts
const DRAFT_KEY = "xxx_draft";
const draftStore = () => { try { return window.localStorage; }
  catch { try { return window.sessionStorage; } catch { return null; } } };
const saveDraft  = (p: any) => draftStore()?.setItem(DRAFT_KEY, JSON.stringify(p));
const clearDraft = () => { try { localStorage.removeItem(DRAFT_KEY); } catch {}
                           try { sessionStorage.removeItem(DRAFT_KEY); } catch {} };
const readDraft  = () => { const raw = draftStore()?.getItem(DRAFT_KEY)
                             ?? (typeof sessionStorage !== "undefined" ? sessionStorage.getItem(DRAFT_KEY) : null);
                           return raw ? JSON.parse(raw) : null; };
```
Shape: `{ data: <XxxData>, password: "<pagePassword>", completed: false|true }`.
- Autosave `completed:false` — effect that runs while `editMode` is `"manual"`/`"choose"` on any `mf`/`pagePassword` change.
- Finished snapshot `completed:true` — inside `handleSave`.
- Restore — mount effect (AFTER any backend fetch): restore `mf`+`pagePassword`; if `completed:true` also restore `content`/`isPersonalized`/`editMode:"preview"`.
- `clearDraft()` — only on publish success (both the direct publish and the auto-resume effect).

## page.tsx skeleton

```tsx
const e = useXxxEditor();
const topAction = e.showShare
  ? { label: "Share", onClick: e.handleShare, icon: <Share2 size={14} /> }
  : e.showPublish
    ? { label: e.publishing ? "Publishing…" : "Publish", onClick: e.publish, icon: <Heart size={14} /> }
    : { label: "Create", onClick: e.handleEditClick, icon: <PenLine size={14} /> };

return (
  <>
    {/* live preview backdrop (also the "gallery" landing state) */}
    <XxxTemplate key={e.previewVersion} data={e.displayData} mode="preview" />

    {/* fixed top bar */}
    <div className="fixed top-3 left-0 right-0 z-[120] px-3 flex items-center gap-2">
      <button onClick={e.goBack}><ArrowLeft size={15} /> Back</button>
      <div className="flex-1" />
      {e.isPersonalized && !e.showShare && (
        <button onClick={e.handleEditFromPreview}><PenLine size={14} /> Edit</button>
      )}
      <button onClick={topAction.onClick} disabled={e.publishing}>
        {topAction.icon} {topAction.label}
      </button>
    </div>

    <EditSheet {...e} />   {/* visible when editMode !== null && editMode !== "preview" */}

    <AnimatePresence>
      {e.showAuth && <AuthModal onClose={e.closeAuth} onSuccess={e.closeAuthSuccess} />}
    </AnimatePresence>

    {/* toast stack: publish toast carries shareUrl + Copy button */}
  </>
);
// goBack → router.push("/templates")
```

## Hook: create / update / publish / deferred-publish

```ts
const { isAuthenticated, accessToken } = useAppSelector((s) => s.auth);
const BASE = `${API_URL}/xxx-pages`;
const headers = () => ({ "Content-Type": "application/json",
  ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  ...(IS_NGROK ? { "ngrok-skip-browser-warning": "true" } : {}) });

const pendingPublishRef = useRef<{ data: XxxData; password: string } | null>(null);

async function create() {
  const res = await fetch(BASE, { method: "POST", headers: headers(),
    body: JSON.stringify(xxxDataToBody(content, pagePassword)) });
  const j = await res.json(); const id = j.data._id; setPageId(id); return id;
}
async function update(id: string) {
  await fetch(`${BASE}/${id}`, { method: "PUT", headers: headers(),
    body: JSON.stringify(xxxDataToBody(content, pagePassword)) });
}

async function publish() {
  if (!content.deliveryEmail?.trim()) {           // required-field guard(s)
    pushToast({ type: "info", title: "Delivery email required" });
    setEditMode("manual"); setMf({ ...content }); return;
  }
  if (!isAuthenticated || !accessToken) {         // DEFER
    pendingPublishRef.current = { data: content, password: pagePassword };
    setShowAuth(true); return;
  }
  setPublishing(true);
  try {
    let id = pageId; if (!id) id = await create(); else await update(id);
    const r = await fetch(`${BASE}/${id}/publish`, { method: "POST", headers: headers() });
    const j = await r.json();
    if (j.success) { setShareUrl(String(j.data.shareUrl)); clearDraft();
      pushToast({ type: "publish", title: "Published! 💗" }); }
  } finally { setPublishing(false); }
}

// AUTO-RESUME after login
useEffect(() => {
  if (!isAuthenticated || !accessToken || !pendingPublishRef.current) return;
  const { data, password } = pendingPublishRef.current;
  pendingPublishRef.current = null;
  setPublishing(true); setEditMode("preview"); bumpPreview();
  (async () => {
    const res = await fetch(BASE, { method: "POST", headers: headers(),
      body: JSON.stringify(xxxDataToBody(data, password)) });
    const id = (await res.json()).data._id; setPageId(id);
    setContent(data); setIsPersonalized(true);
    const r = await fetch(`${BASE}/${id}/publish`, { method: "POST", headers: headers() });
    const j = await r.json();
    if (j.success) { setShareUrl(String(j.data.shareUrl)); clearDraft();
      pushToast({ type: "publish", title: "Published! 💗" }); }
    setPublishing(false);
  })();
}, [isAuthenticated, accessToken]);

function closeAuth()        { setShowAuth(false); pendingPublishRef.current = null; } // cancel
function closeAuthSuccess() { setShowAuth(false); } // effect resumes publish

async function handleShare() {
  if (navigator.share) { try { await navigator.share({ url: shareUrl! }); return; } catch {} }
  handleCopy(shareUrl!);
}
```

## types.ts round-trip

```ts
export interface XxxData { /* every content field the form edits */ }
export const DEMO_DATA: XxxData = { /* nice demo defaults for the landing preview */ };

// client → server body (flat whitelist + password)
export function xxxDataToBody(d: XxxData, password: string) {
  return { /* ...whitelisted d fields... */, password: password || undefined };
}
// server doc → view model
export function dbToXxxData(raw: Record<string, unknown>): XxxData {
  return { /* map raw → XxxData with safe defaults */ };
}
```

## EditSheet (Create form)

Bottom sheet visible when `editMode !== null && editMode !== "preview"`. Each input → `updateMf(key, value)`. Include the template's content fields, a **required** field (e.g. `senderName`) that disables Save until filled, a **delivery email** (if the template emails a PDF/notification), and an **optional Password** field bound to separate `pagePassword` state (sent in the create/publish body). Images → base64 data URLs via a `fileToDataUrl` helper (cap ~6MB). Save button → `handleSave`.
