"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { API_URL, IS_NGROK } from "@/lib/config";
import {
  type ApologyData,
  type EditMode,
  type Toast,
  DEMO_DATA,
  apologyDataToBody,
  dbToApologyData,
} from "../components/types";

const DRAFT_KEY = "apology_draft";
const BASE = `${API_URL}/apology-dashboard-pages`;

export function useApologyEditor() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, accessToken } = useAppSelector((s) => s.auth);

  const [content, setContent] = useState<ApologyData>(DEMO_DATA);
  const [mf, setMf] = useState<ApologyData>({ ...DEMO_DATA });
  const [editMode, setEditMode] = useState<EditMode>(null);
  const [pagePassword, setPagePassword] = useState("");
  const [pageId, setPageId] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [isPersonalized, setIsPersonalized] = useState(false);

  const [showAuth, setShowAuth] = useState(false);
  const saving = false; // save-to-preview is local/synchronous; kept for EditSheet API parity
  const [publishing, setPublishing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastIdRef = useRef(0);

  // Holds draft when user tries to publish while unauthenticated → auto-resume after login.
  const pendingPublishRef = useRef<{ data: ApologyData; password: string } | null>(null);

  const headers = useCallback(
    () => ({
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      ...(IS_NGROK ? { "ngrok-skip-browser-warning": "true" } : {}),
    }),
    [accessToken],
  );

  const pushToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = ++toastIdRef.current;
    setToasts((prev) => [...prev, { ...toast, id }]);
    const delay = toast.type === "publish" ? 1000 : 3500;
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), delay);
  }, []);

  const dismissToast = useCallback((id: number) => setToasts((prev) => prev.filter((t) => t.id !== id)), []);

  // ── Load existing page (?edit=<id>) or restore a completed local draft ──────
  useEffect(() => {
    const id = searchParams.get("edit") || searchParams.get("id");
    if (id && isAuthenticated && accessToken) {
      fetch(`${BASE}/${id}`, { headers: headers() })
        .then((r) => r.json())
        .then((result) => {
          if (result.success && result.data) {
            const d = dbToApologyData(result.data);
            setContent(d);
            setMf(d);
            setPageId(id);
            setIsPersonalized(true);
            setEditMode("preview");
            if (result.data.isPublished && result.data.shareUrl) setShareUrl(String(result.data.shareUrl));
          }
        })
        .catch(() => {});
      return;
    }

    try {
      const saved = sessionStorage.getItem(DRAFT_KEY);
      if (saved) {
        const draft = JSON.parse(saved);
        if (draft?.completed && draft.data) {
          setContent(draft.data);
          setMf(draft.data);
          setIsPersonalized(true);
          setEditMode("preview");
          if (draft.password) setPagePassword(draft.password);
        }
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, accessToken, searchParams]);

  // ── Auto-resume publish after successful auth ───────────────────────────────
  useEffect(() => {
    if (!isAuthenticated || !accessToken || !pendingPublishRef.current) return;
    const { data, password } = pendingPublishRef.current;
    pendingPublishRef.current = null;

    setPublishing(true);
    setEditMode("preview");
    (async () => {
      try {
        const res = await fetch(BASE, { method: "POST", headers: headers(), body: JSON.stringify(apologyDataToBody(data, password)) });
        const result = await res.json();
        if (!result.success) throw new Error("Save failed");
        const savedId = result.data._id as string;
        setPageId(savedId);
        setContent(data);
        setIsPersonalized(true);

        const pubRes = await fetch(`${BASE}/${savedId}/publish`, { method: "POST", headers: headers() });
        const pubResult = await pubRes.json();
        if (pubResult.success) {
          setShareUrl(String(pubResult.data.shareUrl));
          try { sessionStorage.removeItem(DRAFT_KEY); } catch {}
          pushToast({ type: "publish", title: "Published! 💗", message: "Your apology is now live" });
        } else {
          pushToast({ type: "info", title: "Publish failed", message: "Saved — tap Publish to go live" });
        }
      } catch {
        pushToast({ type: "info", title: "Save failed", message: "Please try again" });
      } finally {
        setPublishing(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, accessToken]);

  // ── Auto-save WIP draft while editing ───────────────────────────────────────
  useEffect(() => {
    if (editMode !== "manual" && editMode !== "choose") return;
    try {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ data: mf, password: pagePassword, completed: false }));
    } catch {}
  }, [mf, pagePassword, editMode]);

  const displayData = editMode === "manual" || editMode === "choose" ? mf : content;

  const updateMf = useCallback((key: keyof ApologyData, val: unknown) => setMf((p) => ({ ...p, [key]: val })), []);

  const handleEditClick = useCallback(() => {
    setMf(isPersonalized ? { ...content } : { ...DEMO_DATA });
    setEditMode("manual");
  }, [isPersonalized, content]);

  const handleEditFromPreview = useCallback(() => {
    setMf({ ...content });
    setEditMode("manual");
  }, [content]);

  // Save (locally) & jump to preview
  const handleSave = useCallback(() => {
    if (!mf.senderName.trim()) { pushToast({ type: "info", title: "Add your name first" }); return; }
    setContent(mf);
    setIsPersonalized(true);
    setEditMode("preview");
    try { sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ data: mf, password: pagePassword, completed: true })); } catch {}
    pushToast({ type: "success", title: "Saved!", message: "Preview it, then publish 💗" });
  }, [mf, pagePassword, pushToast]);

  const create = useCallback(async (): Promise<string | null> => {
    const res = await fetch(BASE, { method: "POST", headers: headers(), body: JSON.stringify(apologyDataToBody(content, pagePassword)) });
    const result = await res.json();
    if (!result.success) return null;
    setPageId(result.data._id);
    return result.data._id as string;
  }, [content, pagePassword, headers]);

  const update = useCallback(async (id: string) => {
    await fetch(`${BASE}/${id}`, { method: "PUT", headers: headers(), body: JSON.stringify(apologyDataToBody(content, pagePassword)) });
  }, [content, pagePassword, headers]);

  const publish = useCallback(async () => {
    if (!content.deliveryEmail.trim()) {
      pushToast({ type: "info", title: "Delivery email required", message: "Add it in Edit so signed cards reach you" });
      setEditMode("manual");
      setMf({ ...content });
      return;
    }
    if (!isAuthenticated || !accessToken) {
      pendingPublishRef.current = { data: content, password: pagePassword };
      setShowAuth(true);
      return;
    }
    setPublishing(true);
    try {
      let id = pageId;
      if (!id) id = await create();
      else await update(id);
      if (!id) throw new Error("Save failed");

      const pubRes = await fetch(`${BASE}/${id}/publish`, { method: "POST", headers: headers() });
      const pubResult = await pubRes.json();
      if (pubResult.success) {
        setShareUrl(String(pubResult.data.shareUrl));
        try { sessionStorage.removeItem(DRAFT_KEY); } catch {}
        pushToast({ type: "publish", title: "Published! 💗", message: "Your apology is now live" });
      } else {
        pushToast({ type: "info", title: "Publish failed", message: "Please try again" });
      }
    } catch {
      pushToast({ type: "info", title: "Publish failed", message: "Please try again" });
    } finally {
      setPublishing(false);
    }
  }, [content, pagePassword, isAuthenticated, accessToken, pageId, create, update, headers, pushToast]);

  const closeAuth = useCallback(() => { setShowAuth(false); pendingPublishRef.current = null; }, []);
  const closeAuthSuccess = useCallback(() => { setShowAuth(false); }, []);

  const handleCopy = useCallback((url?: string) => {
    const link = url || shareUrl;
    if (link) {
      navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      if (!url) pushToast({ type: "success", title: "Link copied!" });
    }
  }, [shareUrl, pushToast]);

  const handleShare = useCallback(() => {
    if (!shareUrl) return;
    if (typeof navigator !== "undefined" && "share" in navigator) {
      navigator.share({ title: "A little apology, just for you 💗", url: shareUrl }).catch(() => {});
    } else {
      handleCopy();
    }
  }, [shareUrl, handleCopy]);

  const goBack = useCallback(() => router.push("/templates"), [router]);

  const shareId = shareUrl ? shareUrl.split("/").pop() ?? null : null;

  return {
    content, mf, displayData, editMode, pagePassword, pageId, shareUrl, shareId,
    isPersonalized, showAuth, saving, publishing, copied, toasts,

    setEditMode, setPagePassword, updateMf,
    handleEditClick, handleEditFromPreview, handleSave,
    create, update, publish,
    closeAuth, closeAuthSuccess, handleCopy, handleShare, goBack,
    pushToast, dismissToast,

    showPublish: isPersonalized && !shareUrl && !publishing,
    showShare: !!shareUrl,
    shareLabel: copied ? "Copied!" : "Share",
  };
}
