"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { type ContentData, type TabId, type EditMode, type Toast, DEMO_CONTENT } from "../components/types";

import { API_URL, IS_NGROK } from "@/lib/config";
import { EVENTS } from "@/lib/analytics/events";
import { track } from "@/lib/analytics/track";

/** Slug reported on every analytics event from this editor. */
const TEMPLATE = "anniversary-gf";

export function useAnniversaryEditor() {
  const router = useRouter();
  const { isAuthenticated, accessToken } = useAppSelector((s) => s.auth);

  const [tab, setTab] = useState<TabId>("cover");
  const [content, setContent] = useState<ContentData>(DEMO_CONTENT);
  const [isPersonalized, setIsPersonalized] = useState(false);
  const [pageId, setPageId] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [copied, setCopied] = useState(false);

  const [editMode, setEditMode] = useState<EditMode>(null);
  const [pendingContent, setPendingContent] = useState<ContentData | null>(null);
  const [saving, setSaving] = useState(false);
  const [pagePassword, setPagePassword] = useState("");
  const [showPwValue, setShowPwValue] = useState(false);
  const [hasPasswordSet, setHasPasswordSet] = useState(false);

  const [aiName, setAiName] = useState("");
  const [aiSender, setAiSender] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const [mf, setMf] = useState<ContentData>({ ...DEMO_CONTENT });
  const [manualStep, setManualStep] = useState(0);
  const [photoInput, setPhotoInput] = useState("");

  const [publishing, setPublishing] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastIdRef = useRef(0);

  /* ── helpers ── */

  const pushToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = ++toastIdRef.current;
    setToasts((prev) => [...prev, { ...toast, id }]);
    if (toast.type !== "publish") {
      setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
    }
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const headers = useCallback(
    () => ({
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      ...(IS_NGROK ? { "ngrok-skip-browser-warning": "true" } : {}),
    }),
    [accessToken],
  );

  /* ── tab navigation ── */

  const handleTabChange = useCallback(
    (t: TabId) => {
      setTab(t);
      if (editMode !== "preview" && editMode !== "password") setEditMode(null);
    },
    [editMode],
  );

  const goToGames = useCallback(() => setTab("games"), []);
  const goBack = useCallback(() => router.push("/templates"), [router]);
  const closeAuth = useCallback(() => setShowAuth(false), []);

  /* ── editing ── */

  const handleEditClick = useCallback(() => {
    if (!isAuthenticated) { setShowAuth(true); return; }
    setEditMode("choose");
  }, [isAuthenticated]);

  const startAiMode = useCallback(() => {
    setAiName(isPersonalized ? content.recipientName : "");
    setAiSender(isPersonalized ? content.senderName : "");
    setAiPrompt("");
    setEditMode("ai");
  }, [isPersonalized, content.recipientName, content.senderName]);

  const startManualMode = useCallback(() => {
    setMf(isPersonalized ? { ...content } : { ...DEMO_CONTENT });
    setManualStep(0);
    setEditMode("manual");
  }, [isPersonalized, content]);

  const handleAiGenerate = useCallback(async () => {
    if (!aiName.trim() || !aiPrompt.trim()) return;
    setAiLoading(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({
          prompt: `Anniversary message for ${aiName}. ${aiPrompt}`,
          templateId: "anniversary-gf",
          templateType: "anniversary",
        }),
      });
      const data = await res.json();
      if (data.heading || data.body) {
        const newContent: ContentData = {
          recipientName: aiName.trim(),
          senderName: aiSender.trim() || "With Love ❤️",
          anniversaryDate: DEMO_CONTENT.anniversaryDate,
          personalMessage: data.body || DEMO_CONTENT.personalMessage,
          quizQuestions: DEMO_CONTENT.quizQuestions,
          spinItems: DEMO_CONTENT.spinItems,
          galleryPhotos: [],
          musicTracks: DEMO_CONTENT.musicTracks,
        };
        setPendingContent(newContent);
        setContent(newContent);
        setEditMode("preview");
      }
    } catch {
      pushToast({ type: "info", title: "Generation failed", message: "Please try again" });
    } finally {
      setAiLoading(false);
    }
  }, [aiName, aiPrompt, aiSender, headers, pushToast]);

  const handleManualPreview = useCallback(() => {
    if (!mf.recipientName.trim()) return;
    setPendingContent(mf);
    setContent(mf);
    setEditMode("preview");
  }, [mf]);

  const updateMf = useCallback(
    (key: keyof ContentData, val: unknown) => setMf((p) => ({ ...p, [key]: val })),
    [],
  );

  /* ── save / publish ── */

  const saveToServer = useCallback(
    async (data: ContentData, password?: string) => {
      if (!accessToken) return;
      const body = { ...data, password: password || "" };
      if (pageId) {
        await fetch(`${API_URL}/anniversary-pages/${pageId}`, { method: "PUT", headers: headers(), body: JSON.stringify(body) });
      } else {
        const res = await fetch(`${API_URL}/anniversary-pages`, { method: "POST", headers: headers(), body: JSON.stringify(body) });
        const result = await res.json();
        if (result.success) setPageId(result.data._id);
      }
    },
    [accessToken, pageId, headers],
  );

  const handleConfirmSave = useCallback(() => {
    if (!pendingContent) return;
    setPagePassword("");
    setShowPwValue(false);
    setEditMode("password");
  }, [pendingContent]);

  const handlePasswordDone = useCallback(
    async (pw: string) => {
      if (!pendingContent) return;
      setSaving(true);
      try {
        await saveToServer({ ...pendingContent }, pw);
        setIsPersonalized(true);
        setShareUrl(null);
        setEditMode(null);
        setTab("cover");
        setPendingContent(null);
        setHasPasswordSet(!!pw);
        pushToast({
          type: "success",
          title: pw ? "Saved with password protection!" : "Changes saved!",
          message: pw ? "Share the password with your special someone" : "Your page is ready to publish",
        });
      } catch {
        pushToast({ type: "info", title: "Save failed", message: "Please try again" });
      } finally {
        setSaving(false);
      }
    },
    [pendingContent, saveToServer, pushToast],
  );

  const handleDiscardPreview = useCallback(() => {
    if (!pendingContent) { setEditMode(null); return; }
    setContent(isPersonalized ? content : DEMO_CONTENT);
    setPendingContent(null);
    setEditMode("choose");
  }, [pendingContent, isPersonalized, content]);

  const handlePublish = useCallback(async () => {
    if (!pageId) return;
    track(EVENTS.PUBLISH_CLICKED, { template: TEMPLATE, is_authenticated: true });
    setPublishing(true);
    try {
      const res = await fetch(`${API_URL}/anniversary-pages/${pageId}/publish`, { method: "POST", headers: headers() });
      const result = await res.json();
      if (result.success) {
        const url = result.data.shareUrl;
        setShareUrl(url);
        setPageId(null);
        setIsPersonalized(false);
        setHasPasswordSet(false);
        track(EVENTS.PUBLISH_SUCCESS, { template: TEMPLATE, source: "direct" });
        pushToast({
          type: "publish",
          title: "Published!",
          message: hasPasswordSet ? "Surprise tab is password-protected" : "Your page is now live",
          shareUrl: url,
        });
      } else {
        // No user-facing feedback existed on this path; the click silently did
        // nothing. Recorded so the failure stops being invisible.
        track(EVENTS.PUBLISH_FAILED, {
          template: TEMPLATE,
          reason: typeof result?.error === "string" ? result.error : "publish_rejected",
        });
      }
    } catch {
      track(EVENTS.PUBLISH_FAILED, { template: TEMPLATE, reason: "network_error" });
      pushToast({ type: "info", title: "Publish failed", message: "Please try again" });
    } finally {
      setPublishing(false);
    }
  }, [pageId, headers, hasPasswordSet, pushToast]);

  const handleCopy = useCallback(
    (url?: string) => {
      const link = url || shareUrl;
      if (link) {
        navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        if (!url) pushToast({ type: "success", title: "Link copied!" });
      }
    },
    [shareUrl, pushToast],
  );

  const handleShare = useCallback(() => handleCopy(), [handleCopy]);

  return {
    tab, content, editMode, isPersonalized, shareUrl, copied, showAuth,
    toasts, saving, publishing, pagePassword, showPwValue,
    aiName, aiSender, aiPrompt, aiLoading,
    mf, manualStep, photoInput,

    setEditMode, setAiName, setAiSender, setAiPrompt, setManualStep, setPhotoInput,
    setPagePassword, setShowPwValue,
    updateMf,

    handleTabChange, goToGames, goBack, closeAuth,
    handleEditClick, startAiMode, startManualMode,
    handleAiGenerate, handleManualPreview,
    handleConfirmSave, handlePasswordDone, handleDiscardPreview,
    handlePublish, handleCopy, handleShare,
    pushToast, dismissToast,

    showPublish: isPersonalized && !shareUrl && !publishing,
    showShare: !!shareUrl,
    shareLabel: copied ? "Copied!" : "Share",
  };
}
