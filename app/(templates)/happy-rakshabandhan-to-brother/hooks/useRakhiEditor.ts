"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { API_URL, IS_NGROK } from "@/lib/config";
import { EVENTS } from "@/lib/analytics/events";
import { track } from "@/lib/analytics/track";
import { openShareSheet } from "@/lib/share/shareBus";
import {
  type RakhiData,
  type EditMode,
  type Toast,
  SAMPLE,
  DEMO,
  rakhiDataToBody,
  dbToRakhiData,
} from "../components/types";

/** Slug reported on every analytics event from this editor. */
const TEMPLATE = "happy-rakshabandhan-to-brother";
const BASE = `${API_URL}/raksha-bandhan-pages`;

// ─── NO DRAFT STORAGE ────────────────────────────────────────────────────────
//
// Most editors in this codebase autosave a work-in-progress draft to
// localStorage. This one deliberately does not — "No localStorage or
// sessionStorage" is an explicit constraint on this template.
//
// The cost is real and worth stating: if she reloads the tab mid-build, the form
// is empty again. What replaces it is the server — the moment she taps Save, the
// page is created and reachable at `?edit=<id>`, so anything she has actually
// finished survives. Only the unsaved half of a session is at risk.

export function useRakhiEditor() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, accessToken } = useAppSelector((s) => s.auth);

  // ── DEMO for the preview, SAMPLE for the form ────────────────────────────
  //
  // `content` is what the preview renders, so it starts as the filled demo —
  // otherwise a visitor evaluating this template sees an empty shell and never
  // learns that photos, memories and the shagun QR exist.
  //
  // `mf` is the form, so it starts as `SAMPLE`, which is empty by design. If
  // these were seeded from the same object she would open the builder holding
  // another family's photograph and their UPI ID, one Publish away from sending
  // it to her brother. They must never be merged.
  const [content, setContent] = useState<RakhiData>(DEMO);
  const [mf, setMf] = useState<RakhiData>({ ...SAMPLE });
  const [editMode, setEditMode] = useState<EditMode>(null);
  const [pagePassword, setPagePassword] = useState("");
  const [pageId, setPageId] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [isPersonalized, setIsPersonalized] = useState(false);
  const [previewVersion, setPreviewVersion] = useState(0);
  const bumpPreview = useCallback(() => setPreviewVersion((v) => v + 1), []);

  const [showAuth, setShowAuth] = useState(false);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastIdRef = useRef(0);

  const pendingPublishRef = useRef<{ data: RakhiData; password: string } | null>(null);

  const headers = useCallback(
    () => ({
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      ...(IS_NGROK ? { "ngrok-skip-browser-warning": "true" } : {}),
    }),
    [accessToken]
  );

  const pushToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = ++toastIdRef.current;
    setToasts((prev) => [...prev, { ...toast, id }]);
    const delay = toast.type === "publish" ? 1000 : 3500;
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), delay);
  }, []);

  const dismissToast = useCallback(
    (id: number) => setToasts((prev) => prev.filter((t) => t.id !== id)),
    []
  );

  // ── Load an existing page (?edit=<id>) ──
  useEffect(() => {
    const id = searchParams.get("edit") || searchParams.get("id");
    if (!id || !isAuthenticated || !accessToken) return;

    fetch(`${BASE}/${id}`, { headers: headers() })
      .then((r) => r.json())
      .then((result) => {
        if (!result.success || !result.data) return;
        const d = dbToRakhiData(result.data);
        setContent(d);
        setMf(d);
        setPageId(id);
        setIsPersonalized(true);
        setEditMode("preview");
        bumpPreview();
        if (result.data.isPublished && result.data.shareUrl) {
          setShareUrl(String(result.data.shareUrl));
        }
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, accessToken, searchParams]);

  // ── Resume a publish that was interrupted by the auth modal ──
  useEffect(() => {
    if (!isAuthenticated || !accessToken || !pendingPublishRef.current) return;
    const { data, password } = pendingPublishRef.current;
    pendingPublishRef.current = null;

    setPublishing(true);
    setEditMode("preview");
    bumpPreview();

    (async () => {
      try {
        const res = await fetch(BASE, {
          method: "POST",
          headers: headers(),
          body: JSON.stringify(rakhiDataToBody(data, password)),
        });
        const result = await res.json();
        if (!result.success) throw new Error("Save failed");

        const savedId = result.data._id as string;
        setPageId(savedId);
        setContent(data);
        setIsPersonalized(true);

        const pubRes = await fetch(`${BASE}/${savedId}/publish`, {
          method: "POST",
          headers: headers(),
        });
        const pubResult = await pubRes.json();
        if (pubResult.success) {
          setShareUrl(String(pubResult.data.shareUrl));
          pushToast({ type: "publish", title: "Sent! 🪢", message: "Your rakhi is live" });
        } else {
          pushToast({ type: "info", title: "Publish failed", message: "Saved — tap Send to go live" });
        }
      } catch {
        pushToast({ type: "info", title: "Save failed", message: "Please try again" });
      } finally {
        setPublishing(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, accessToken]);

  const displayData = editMode === "manual" || editMode === "choose" ? mf : content;

  const updateMf = useCallback(
    (key: keyof RakhiData, val: unknown) => setMf((p) => ({ ...p, [key]: val })),
    []
  );

  const handleEditClick = useCallback(() => {
    setMf(isPersonalized ? { ...content } : { ...SAMPLE });
    setEditMode("manual");
  }, [isPersonalized, content]);

  const handleEditFromPreview = useCallback(() => {
    setMf({ ...content });
    setEditMode("manual");
  }, [content]);

  const handleStartCreate = useCallback(() => {
    handleEditClick();
  }, [handleEditClick]);

  const handleSave = useCallback(() => {
    if (!mf.brotherName.trim()) {
      pushToast({ type: "info", title: "Add your bhai's name first" });
      return;
    }
    setSaving(true);
    setContent(mf);
    setIsPersonalized(true);
    setEditMode("preview");
    bumpPreview();
    setSaving(false);
    pushToast({ type: "success", title: "Saved!", message: "Preview it, then send 🪢" });
  }, [mf, pushToast, bumpPreview]);

  const create = useCallback(async (): Promise<string | null> => {
    const res = await fetch(BASE, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify(rakhiDataToBody(content, pagePassword)),
    });
    const result = await res.json();
    if (!result.success) return null;
    setPageId(result.data._id);
    return result.data._id as string;
  }, [content, pagePassword, headers]);

  const update = useCallback(
    async (id: string) => {
      await fetch(`${BASE}/${id}`, {
        method: "PUT",
        headers: headers(),
        body: JSON.stringify(rakhiDataToBody(content, pagePassword)),
      });
    },
    [content, pagePassword, headers]
  );

  const publish = useCallback(async () => {
    track(EVENTS.PUBLISH_CLICKED, { template: TEMPLATE, is_authenticated: isAuthenticated });

    if (!content.brotherName.trim()) {
      track(EVENTS.PUBLISH_FAILED, { template: TEMPLATE, reason: "missing_brother_name" });
      pushToast({ type: "info", title: "Add your bhai's name", message: "Open Edit and fill it in" });
      setEditMode("manual");
      setMf({ ...content });
      return;
    }

    if (!isAuthenticated || !accessToken) {
      track(EVENTS.AUTH_REQUIRED, { template: TEMPLATE });
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
        track(EVENTS.PUBLISH_SUCCESS, { template: TEMPLATE, source: "direct" });
        pushToast({ type: "publish", title: "Sent! 🪢", message: "Your rakhi is live" });
      } else {
        track(EVENTS.PUBLISH_FAILED, {
          template: TEMPLATE,
          reason: typeof pubResult?.error === "string" ? pubResult.error : "publish_rejected",
        });
        pushToast({ type: "info", title: "Publish failed", message: "Please try again" });
      }
    } catch {
      track(EVENTS.PUBLISH_FAILED, { template: TEMPLATE, reason: "network_error" });
      pushToast({ type: "info", title: "Publish failed", message: "Please try again" });
    } finally {
      setPublishing(false);
    }
  }, [content, pagePassword, isAuthenticated, accessToken, pageId, create, update, headers, pushToast]);

  const closeAuth = useCallback(() => {
    setShowAuth(false);
    pendingPublishRef.current = null;
  }, []);
  const closeAuthSuccess = useCallback(() => setShowAuth(false), []);

  const handleCopy = useCallback(
    (url?: string) => {
      const link = url || shareUrl;
      if (!link) return;
      navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      if (!url) pushToast({ type: "success", title: "Link copied!" });
    },
    [shareUrl, pushToast]
  );

  const handleShare = useCallback(() => {
    if (!shareUrl) return;
    openShareSheet({
      url: shareUrl,
      password: pagePassword,
      title: "Happy Raksha Bandhan 🪢",
      text: `${content.brotherName || "Bhai"} — I tied you a rakhi 🪢`,
      cardTitle: "Happy Raksha Bandhan",
      cardNote: "Scan to tie your rakhi",
      accent: "#9B2226",
      recipientName: content.brotherName,
      senderName: content.sisterName,
      slug: "happy-rakshabandhan-to-brother",
    });
  }, [shareUrl, content.brotherName, content.sisterName, pagePassword]);

  const goBack = useCallback(() => router.push("/templates"), [router]);

  const shareId = shareUrl ? shareUrl.split("/").pop() ?? null : null;

  return {
    content, mf, displayData, editMode, pagePassword, pageId, shareUrl, shareId,
    isPersonalized, showAuth, saving, publishing, copied, toasts, previewVersion,

    setEditMode, setPagePassword, updateMf, setMf,
    handleStartCreate, handleEditClick, handleEditFromPreview, handleSave,
    create, update, publish,
    closeAuth, closeAuthSuccess, handleCopy, handleShare, goBack,
    pushToast, dismissToast,

    showPublish: isPersonalized && !shareUrl && !publishing,
    showShare: !!shareUrl,
    shareLabel: copied ? "Copied!" : "Share",
  };
}
