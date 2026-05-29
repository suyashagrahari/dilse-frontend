# Auth-Deferred Publish Flow

Implement the **fill-first, auth-on-publish** pattern for a template editor.

## What this pattern does

1. User clicks Create/Edit → form opens immediately (NO login required)
2. User fills the entire form → clicks "Save & Preview" → enters **preview mode**
3. In preview: top bar shows **Edit** + **Publish** buttons side by side
4. User clicks Publish:
   - **Not logged in** → store form data in `pendingPublishRef` → show Auth modal → after login → **auto-publish** + clear ref
   - **Already logged in** → create page on backend → publish → show 1-second toast → switch to Share button
5. Session storage persists draft so data survives page refresh

---

## Template: `$ARGUMENTS`

Implement this flow for the template named above. Follow the exact pattern below.

---

## Files to create/modify

### 1. `hooks/use<Template>Editor.ts` — core logic

Add these refs and state:

```typescript
const pendingPublishRef = useRef<{ data: ContentData; password: string } | null>(null);
const fromPreviewRef = useRef(false);
```

**`handleEditClick`** — remove ALL auth checks, open "choose" for everyone:
```typescript
function handleEditClick() {
  setEditMode("choose");
}
```

**`closeAuth`** — clear pending ref when user dismisses auth modal:
```typescript
function closeAuth() {
  setShowAuth(false);
  pendingPublishRef.current = null;
}
```

**`closeAuthSuccess`** — only open editor if NOT pending a publish (auto-publish useEffect handles it):
```typescript
function closeAuthSuccess() {
  setShowAuth(false);
  if (!pendingPublishRef.current) {
    setEditMode("choose");
  }
}
```

**`setEditModeFromSheet`** — return to preview if user was editing from preview:
```typescript
function setEditModeFromSheet(mode: EditMode) {
  if (mode === null && fromPreviewRef.current) {
    fromPreviewRef.current = false;
    setEditMode("preview");
    return;
  }
  fromPreviewRef.current = false;
  setEditMode(mode);
}
```

**`handleEditFromPreview`** — open form from preview, mark as from-preview:
```typescript
function handleEditFromPreview() {
  fromPreviewRef.current = true;
  // restore the saved draft step
  const raw = sessionStorage.getItem("<template>_draft");
  if (raw) {
    try {
      const saved = JSON.parse(raw);
      setStep(saved.step ?? 0);
    } catch {}
  }
  setEditMode("manual");
}
```

**`handleManualSave`** — go to preview (NOT backend save):
```typescript
async function handleManualSave(data: ContentData, password: string) {
  setContent(data);
  setPassword(password);
  // persist completed draft for auth recovery
  sessionStorage.setItem("<template>_draft", JSON.stringify({ ...data, password, completed: true, step: currentStep }));
  setEditMode("preview");
}
```

**`handlePublish`** — auth gate only at publish time:
```typescript
async function handlePublish() {
  if (!isAuthenticated || !accessToken) {
    pendingPublishRef.current = { data: content, password };
    setShowAuth(true);
    return;
  }
  setPublishing(true);
  try {
    let pid = pageId;
    if (!pid) {
      const res = await fetch(`${API}/template-pages`, { method: "POST", headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" }, body: JSON.stringify({ ...content }) });
      const json = await res.json();
      pid = json.data._id;
      setPageId(pid);
    }
    const pub = await fetch(`${API}/template-pages/${pid}/publish`, { method: "POST", headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
    const pj = await pub.json();
    setShareUrl(pj.data.shareUrl);
    setEditMode(null);
    sessionStorage.removeItem("<template>_draft");
    pushToast({ type: "publish", title: "Published!", shareUrl: pj.data.shareUrl });
  } finally {
    setPublishing(false);
  }
}
```

**Auto-publish `useEffect`** — fires after login when pending ref exists:
```typescript
useEffect(() => {
  if (!isAuthenticated || !accessToken || !pendingPublishRef.current) return;
  const { data, password: pw } = pendingPublishRef.current;
  pendingPublishRef.current = null;
  setShowAuth(false);
  // run publish with the stored data
  (async () => {
    setPublishing(true);
    try {
      const res = await fetch(`${API}/template-pages`, { method: "POST", headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" }, body: JSON.stringify({ ...data }) });
      const json = await res.json();
      const pid = json.data._id;
      setPageId(pid);
      const pub = await fetch(`${API}/template-pages/${pid}/publish`, { method: "POST", headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" }, body: JSON.stringify({ password: pw }) });
      const pj = await pub.json();
      setShareUrl(pj.data.shareUrl);
      setEditMode(null);
      sessionStorage.removeItem("<template>_draft");
      pushToast({ type: "publish", title: "Published!", shareUrl: pj.data.shareUrl });
    } finally {
      setPublishing(false);
    }
  })();
}, [isAuthenticated, accessToken]);
```

**`pushToast`** — publish toast auto-dismisses in 1 second:
```typescript
function pushToast(toast: Omit<Toast, "id">) {
  const id = Date.now();
  setToasts((t) => [...t, { ...toast, id }]);
  const delay = toast.type === "publish" ? 1000 : 3500;
  setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), delay);
}
```

**Draft auto-save `useEffect`**:
```typescript
useEffect(() => {
  if (editMode !== "manual") return;
  sessionStorage.setItem("<template>_draft", JSON.stringify({ ...content, password, step: currentStep }));
}, [content, editMode, currentStep]);
```

**Load `useEffect`** — restore completed draft after page load:
```typescript
// inside the load useEffect, AFTER fetching from backend (return early if backend data found):
const raw = sessionStorage.getItem("<template>_draft");
if (raw) {
  try {
    const saved = JSON.parse(raw);
    setContent({ ...DEMO_DATA, ...saved });
    if (saved.password) setPassword(saved.password);
    if (saved.completed) {
      setEditMode("preview");  // go straight to preview if they had completed the form
    }
  } catch {}
}
```

**Return from hook** — export these extra functions:
```typescript
return {
  // ...existing exports...
  setEditModeFromSheet,
  handleEditFromPreview,
};
```

---

### 2. `page.tsx` — conditional preview UI

```typescript
const isPreview = editor.editMode === "preview";
```

**Mobile top bar** — show Edit+Publish when in preview, single action button otherwise:
```tsx
{isPreview ? (
  <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
    <button onClick={editor.handleEditFromPreview}
      style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", borderRadius: 20, padding: "5px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
      ✦ Edit
    </button>
    <button onClick={editor.handlePublish} disabled={editor.publishing}
      style={{ background: "linear-gradient(135deg,#ff3d6b,#ff6b9d)", color: "#fff", border: "none", borderRadius: 20, padding: "5px 14px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
      {editor.publishing ? "Publishing..." : "♡ Publish"}
    </button>
  </div>
) : (
  <button onClick={topAction.onClick}>
    {topAction.label}
  </button>
)}
```

**Desktop sidebar** — pass correct edit handler:
```tsx
<DesktopSidebar
  onEdit={isPreview ? editor.handleEditFromPreview : editor.handleEditClick}
  // ...
/>
```

**EditSheet** — use wrapped setter (not raw setEditMode):
```tsx
<EditSheet setEditMode={editor.setEditModeFromSheet} />
```

**Remove `<PreviewBar>`** — delete it entirely from JSX and its import.

---

## Rules to follow

- Replace `<template>` with the actual template name (e.g. `darling`, `holi`)
- Replace `<Template>` with PascalCase version
- Replace `template-pages` with the actual API route (e.g. `darling-pages`)
- Replace `ContentData` with the template's actual data type
- Replace `DEMO_DATA` with the template's actual demo constant
- `showPublish` should be: `isPersonalized && !shareUrl && !publishing` — hides after publish
- After publish succeeds: `setEditMode(null)` removes preview buttons, Share appears
- NEVER skip sessionStorage clear after successful publish
- NEVER show two publish toasts — use the 1-second delay pattern only

## Reference implementation

See `client/app/(templates)/darling/` for the complete working implementation.
Key files: `hooks/useDarlingEditor.ts`, `page.tsx`, `components/BackgroundMusic.tsx`
