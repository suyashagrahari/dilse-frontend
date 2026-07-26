# Shared / recipient viewer reference (apology-dashboard)

Base: `client/app/[id]/`. The dynamic segment folder is literally `[id]` (param `id`), not `[shareId]`. A username-scoped variant exists at `app/[id]/[shareId]/page.tsx`.

## 1. SSR metadata — `app/[id]/page.tsx` (GENERIC, no change per template)

- `fetchShareData(shareId)` → `fetch(`${API_URL}/share/${shareId}`, { next: { revalidate: 60 } })` (server-side, 60s ISR). Hits the generic `share.controller` registry lookup.
- `generateMetadata` → `getSharePageMeta({ templateType, recipientName, senderName, shareId })` from `@/lib/seo`; OG image from `data.sharePhoto` (only if it `startsWith("http")`); `alternates.canonical = `${SITE_URL}/${shareId}``. On fetch failure returns `robots:{index:false}`.
- Default export renders `<SharePageJsonLd />` + `<SharePageWrapper />`. **SSR only produces `<head>` metadata/JSON-LD — the page body is client-only.**

`SharePageWrapper.tsx`:
```tsx
"use client";
import dynamic from "next/dynamic";
const SharePageClient = dynamic(() => import("./SharePageClient"), { ssr: false });
export default function SharePageWrapper() { return <SharePageClient />; }
```
`SharePageClient` **re-fetches** `/share/:shareId` on the client for the render payload (data is not passed down from SSR).

## 2. `SharePageClient.tsx` — register the dedicated viewer

Two strategies: `TEMPLATE_REGISTRY` (only `birthday`, `valentine` — generic shell) vs **dedicated full-page viewers** (holi, eid, wedding, reception, shaadi, christian-wedding, love-gf, darling, birthday-gf, apology-dashboard, **xxx**).

Two edits for a new dedicated viewer `xxx`:

**(a) Register the dynamic import** (top of file, alongside the others):
```tsx
const XxxViewer = dynamic(() => import("./XxxViewer"), { ssr: false, loading: ViewerSkeleton });
```

**(b) Early-return raw data + dispatch guard.** In the data-load `useEffect`, add `"xxx"` to the list that stores raw `result.data` and returns early:
```ts
if (result.templateType === "holi" || /* … */ || result.templateType === "xxx") {
  setData(result.data); setLoading(false); return;
}
```
Then add the render guard (near the other viewer guards):
```tsx
if (!loading && templateType === "xxx" && data) {
  return <XxxViewer rawData={data} hasPassword={hasPassword} shareId={shareId} />;
}
```
Response fields consumed: `success, data, templateType, templateVariant, hasPassword, senderUserId, editorRoute`. `shareId = shareIdOverride || params.shareId || params.id`.

## 3. `app/[id]/XxxViewer.tsx`

```tsx
"use client";
import { useState } from "react";
import { API_URL, IS_NGROK } from "@/lib/config";
import { dbToXxxData } from "@/app/(templates)/xxx/components/types";
import XxxTemplate from "@/app/(templates)/xxx/components/XxxTemplate";

function XxxPasswordGate({ shareId, onUnlocked }: { shareId: string; onUnlocked: () => void }) {
  const [pw, setPw] = useState(""); const [err, setErr] = useState("");
  async function submit() {
    const res = await fetch(`${API_URL}/xxx-pages/share/${shareId}/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json",
        ...(IS_NGROK ? { "ngrok-skip-browser-warning": "true" } : {}) },
      body: JSON.stringify({ password: pw }),
    });
    const j = await res.json();
    if (j.success && j.verified) {
      sessionStorage.setItem(`xxx_unlocked_${shareId}`, "true");
      onUnlocked();
    } else { setErr("Wrong password. Try again!"); setPw(""); }
  }
  return (/* fixed inset-0 z-[200] themed lock card: input + eye toggle + Enter-to-submit + err */);
}

export default function XxxViewer({ rawData, hasPassword, shareId }: {
  rawData: Record<string, unknown>; hasPassword: boolean; shareId: string;
}) {
  const [unlocked, setUnlocked] = useState(() =>
    !hasPassword || (typeof window !== "undefined"
      && sessionStorage.getItem(`xxx_unlocked_${shareId}`) === "true"));
  if (hasPassword && !unlocked)
    return <XxxPasswordGate shareId={shareId} onUnlocked={() => setUnlocked(true)} />;
  const data = dbToXxxData(rawData);
  return <XxxTemplate data={data} mode="live" shareId={shareId} hasPassword={hasPassword} />;
}
```
`mode` values: `"preview"` in the editor, `"live"` on the recipient page. Password gate is **whole-page** for dedicated viewers (registry templates gate per-tab via `SharePageClient.handleVerify`).

## 4. Brand logo top-right + Create CTA (inside the template, `mode==="live"`)

Every dedicated viewer inlines this (asset `/logo.webp`). In dedicated viewers **the logo IS the "create your own" affordance** — it links to `/templates`.

```tsx
{mode === "live" && (
  <Link href="/templates" aria-label="SubhSandesh"
    style={{ position: "fixed", top: 12, right: 12, zIndex: 46,
             display: "flex", flexDirection: "column", alignItems: "center",
             gap: 2, textDecoration: "none" }}>
    <span style={{ width: 38, height: 38, borderRadius: 11, overflow: "hidden",
        background: "rgba(255,245,245,.9)", backdropFilter: "blur(10px)",
        border: "1px solid #ffd6e2", display: "grid", placeItems: "center",
        boxShadow: "0 6px 18px -6px rgba(230,64,114,.45)" }}>
      <img src="/logo.webp" alt="SubhSandesh" width={30} height={30} style={{ objectFit: "contain" }} />
    </span>
    <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: ".04em", opacity: .85 }}>
      SubhSandesh
    </span>
  </Link>
)}
```
Match the template's palette (recolor the badge bg/border/shadow). Keep `position:fixed`, top-right, high z-index, wrapped in `<Link href="/templates">`.

**Separate bottom-right "Create" button** (only if the user explicitly asks for one in addition to the logo):
```tsx
{mode === "live" && (
  <Link href="/templates"
    style={{ position: "fixed", bottom: 14, right: 14, zIndex: 46,
             padding: "8px 14px", borderRadius: 999, fontSize: 12, fontWeight: 700,
             background: "<template accent>", color: "#fff", textDecoration: "none",
             boxShadow: "0 8px 22px -8px rgba(0,0,0,.35)" }}>
    ✨ Create yours
  </Link>
)}
```
(Watch for collisions with an existing bottom-right FAB, e.g. apology's `MusicFab` — offset one of them.)
