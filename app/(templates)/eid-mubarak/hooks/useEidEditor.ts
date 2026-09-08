"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { type TabId, type EditMode, type EidData, DEMO_DATA } from "../components/types";

import { API_URL, IS_NGROK } from "@/lib/config";
import { EVENTS } from "@/lib/analytics/events";
import { track } from "@/lib/analytics/track";
import { ensurePublishAllowed } from "@/lib/paywall/publishRequest";
import { useDraft } from "@/lib/draft/useDraft";
import { useToast } from "@/lib/toast/useToast";
import { openShareSheet } from "@/lib/share/shareBus";

/** Slug reported on every analytics event from this editor. */
const TEMPLATE = "eid-mubarak";

export function useEidEditor() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, accessToken } = useAppSelector((s) => s.auth);

  const [darkMode, setDarkMode] = useState(true);
  const [themeReady, setThemeReady] = useState(false);
  const toggleDark = useCallback(() => setDarkMode((d) => !d), []);

  useEffect(() => {
    const saved = localStorage.getItem("eid-theme");
    if (saved) {
      setDarkMode(saved === "dark");
    } else {
      const global = localStorage.getItem("theme"); // set by next-themes
      setDarkMode(global !== "light"); // dark unless user explicitly chose light
    }
    setThemeReady(true);
  }, []);

  useEffect(() => {
    if (!themeReady) return;
    const root = document.documentElement;
    if (darkMode) {
      root.classList.remove("eid-light");
      localStorage.setItem("eid-theme", "dark");
    } else {
      root.classList.add("eid-light");
      localStorage.setItem("eid-theme", "light");
    }
  }, [darkMode, themeReady]);

  const [tab, setTab] = useState<TabId>("home");
  const [content, setContent] = useState<EidData>(DEMO_DATA);
  const [isPersonalized, setIsPersonalized] = useState(false);
  const [pageId, setPageId] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [copied, setCopied] = useState(false);

  const [editMode, setEditMode] = useState<EditMode>(null);
  const [pendingContent, setPendingContent] = useState<EidData | null>(null);
  const [saving, setSaving] = useState(false);
  const [pagePassword, setPagePassword] = useState("");
  const [showPwValue, setShowPwValue] = useState(false);
  const [hasPasswordSet, setHasPasswordSet] = useState(false);

  const [aiName, setAiName] = useState("");
  const [aiSender, setAiSender] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const [mf, setMf] = useState<EidData>({ ...DEMO_DATA });
  const [manualStep, setManualStep] = useState(0);
  const preEditContentRef = useRef<EidData>(DEMO_DATA);
  const previewSourceRef = useRef<"manual" | "ai-edit" | null>(null);

  // Persist draft to sessionStorage
  useEffect(() => {
    const isDemoData = mf.senderName === DEMO_DATA.senderName && mf.recipientName === DEMO_DATA.recipientName && !mf.senderPhoto;
    if (!isDemoData) {
      try { sessionStorage.setItem("eid_mf_draft", JSON.stringify(mf)); } catch {}
    }
  }, [mf]);

  const [publishing, setPublishing] = useState(false);
  const { pushToast } = useToast();



  const headers = useCallback(
    () => ({
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      ...(IS_NGROK ? { "ngrok-skip-browser-warning": "true" } : {}),
    }),
    [accessToken],
  );

  // Load AI-prefilled data from shared viewer (sessionStorage eid_prefill)
  useEffect(() => {
    if (!themeReady || !isAuthenticated) return;
    const raw = sessionStorage.getItem("eid_prefill");
    if (!raw) return;
    sessionStorage.removeItem("eid_prefill");
    try {
      const d = JSON.parse(raw) as Partial<EidData>;
      const loaded: EidData = { ...DEMO_DATA, ...d };
      setContent(loaded);
      setMf({ ...loaded });
      setIsPersonalized(false);
      setEditMode("manual");
    } catch { /* ignore bad data */ }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [themeReady, isAuthenticated]);

  // Load existing page when navigated from profile with ?edit=<id>
  useEffect(() => {
    const editId = searchParams.get("edit");
    if (!editId || !accessToken || !themeReady) return;
    fetch(`${API_URL}/eid-pages/${editId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        ...(IS_NGROK ? { "ngrok-skip-browser-warning": "true" } : {}),
      },
    })
      .then((r) => r.json())
      .then((result) => {
        if (result.success && result.data) {
          const d = result.data;
          const loaded: EidData = {
            ...DEMO_DATA,
            recipientName: d.recipientName || "",
            senderName: d.senderName || "",
            senderFamily: d.senderFamily || "",
            senderMembers: d.senderMembers || [],
            senderPhoto: d.senderPhoto || "",
            homeWishMessage: d.homeWishMessage || DEMO_DATA.homeWishMessage,
            congratsMessage: d.congratsMessage || DEMO_DATA.congratsMessage,
            urduTitle: d.urduTitle || DEMO_DATA.urduTitle,
            urduSubtitle: d.urduSubtitle || DEMO_DATA.urduSubtitle,
            englishSubtitle: d.englishSubtitle || DEMO_DATA.englishSubtitle,
            eidDate: d.eidDate || DEMO_DATA.eidDate,
          };
          setContent(loaded);
          setMf({ ...loaded });
          setPageId(editId);
          setIsPersonalized(true);
        }
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, themeReady]);

  const handleTabChange = useCallback((id: TabId) => setTab(id), []);
  const goBack = useCallback(() => router.push("/templates"), [router]);

  const closeAuth = useCallback(() => setShowAuth(false), []);

  // After successful login from edit click → show edit modal
  const closeAuthSuccess = useCallback(() => {
    setShowAuth(false);
    setEditMode("choose");
  }, []);

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
    if (isPersonalized) {
      setMf({ ...content });
    } else {
      try {
        const draft = sessionStorage.getItem("eid_mf_draft");
        setMf(draft ? JSON.parse(draft) : { ...DEMO_DATA });
      } catch {
        setMf({ ...DEMO_DATA });
      }
    }
    setManualStep(0);
    setEditMode("manual");
  }, [isPersonalized, content]);

  const handleAiGenerate = useCallback(async () => {
    if (!aiSender.trim() || !aiPrompt.trim()) return;
    setAiLoading(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({
          prompt: aiName.trim()
            ? `Eid Mubarak greeting from ${aiSender} to ${aiName}. ${aiPrompt}`
            : `Eid Mubarak general greeting from ${aiSender}. ${aiPrompt}`,
          templateId: "eid-mubarak",
          templateType: "eid",
        }),
      });
      const data = await res.json();

      const aiContent: EidData = {
        ...DEMO_DATA,
        recipientName: aiName.trim(),
        senderName: aiSender.trim() || data.senderName || "",
        urduTitle: data.urduTitle || DEMO_DATA.urduTitle,
        englishSubtitle: data.englishSubtitle || data.body || DEMO_DATA.englishSubtitle,
        homeWishMessage: data.homeWishMessage || data.body || DEMO_DATA.homeWishMessage,
        congratsMessage: data.congratsMessage || data.body || DEMO_DATA.congratsMessage,
      };

      // Switch to ai-edit mode so user can review/edit before preview
      setMf(aiContent);
      setManualStep(0);
      setEditMode("ai-edit");
    } catch {
      pushToast({ type: "info", title: "Generation failed", message: "Please try again" });
    } finally {
      setAiLoading(false);
    }
  }, [aiName, aiSender, aiPrompt, headers, pushToast]);

  const handleManualPreview = useCallback(() => {
    if (!mf.senderName.trim()) return;
    setPendingContent(mf);
    setContent((prev) => { preEditContentRef.current = prev; return mf; });
    previewSourceRef.current = "manual";
    setEditMode("preview");
  }, [mf]);

  const handleAiEditPreview = useCallback(() => {
    if (!mf.senderName.trim()) return;
    setPendingContent(mf);
    setContent((prev) => { preEditContentRef.current = prev; return mf; });
    previewSourceRef.current = "ai-edit";
    setEditMode("preview");
  }, [mf]);

  const updateMf = useCallback(
    (key: keyof EidData, val: unknown) => setMf((p) => ({ ...p, [key]: val })),
    [],
  );

  const saveToServer = useCallback(
    async (data: EidData, password?: string) => {
      if (!accessToken) return;
      const body = {
        senderName: data.senderName,
        senderFamily: data.senderFamily,
        senderMembers: data.senderMembers,
        senderPhoto: data.senderPhoto,
        recipientName: data.recipientName,
        homeWishMessage: data.homeWishMessage,
        congratsMessage: data.congratsMessage,
        urduTitle: data.urduTitle,
        urduSubtitle: data.urduSubtitle,
        englishSubtitle: data.englishSubtitle,
        eidDate: data.eidDate,
        password: password || "",
      };

      if (pageId) {
        const res = await fetch(`${API_URL}/eid-pages/${pageId}`, {
          method: "PUT",
          headers: headers(),
          body: JSON.stringify(body),
        });
        const result = await res.json();
        if (!result.success) throw new Error(result.error || "Save failed");
        return result;
      } else {
        const res = await fetch(`${API_URL}/eid-pages`, {
          method: "POST",
          headers: headers(),
          body: JSON.stringify(body),
        });
        const result = await res.json();
        if (!result.success) throw new Error(result.error || "Save failed");
        setPageId(result.data._id);
        return result;
      }
    },
    [accessToken, pageId, headers],
  );

  const handleConfirmSave = useCallback(async () => {
    if (!pendingContent) return;
    setSaving(true);
    try {
      await saveToServer({ ...pendingContent }, pagePassword);
      setIsPersonalized(true);
      setShareUrl(null);
      setEditMode(null);
      setPendingContent(null);
      setHasPasswordSet(!!pagePassword);
      try { sessionStorage.removeItem("eid_mf_draft"); } catch {}
      pushToast({
        type: "success",
        title: pagePassword ? "Saved with password!" : "Card saved!",
        message: pagePassword ? "Share the password with recipients" : "Tap Publish to make it live",
      });
    } catch {
      pushToast({ type: "info", title: "Save failed", message: "Please try again" });
    } finally {
      setSaving(false);
    }
  }, [pendingContent, pagePassword, saveToServer, pushToast]);

  // Keep for legacy callers
  const handlePasswordDone = handleConfirmSave;

  const handleDiscardPreview = useCallback(() => {
    if (!pendingContent) { setEditMode(null); return; }
    setContent(preEditContentRef.current);
    setPendingContent(null);
    const source = previewSourceRef.current;
    previewSourceRef.current = null;
    if (source === "manual") {
      setManualStep(4);
      setEditMode("manual");
    } else if (source === "ai-edit") {
      setEditMode("ai-edit");
    } else {
      setEditMode("choose");
    }
  }, [pendingContent]);

  // ── Auto-draft ────────────────────────────────────────────────────────────
  //
  // What this adds that `saveToServer` did not: work built while signed OUT is
  // held in the browser and promoted to a real draft — photos to S3 — the moment
  // the visitor signs up or logs in. `saveToServer` returns early without a
  // token, so everything built before signing in was lost at the first
  // navigation.
  //
  // `enabled: isPersonalized` keeps every visitor who merely opened the editor
  // out of their own profile: the demo content is not a draft.
  const draft = useDraft({
    templateType: TEMPLATE,
    content,
    enabled: isPersonalized,
    busy: publishing || saving,
    isAuthenticated,
    accessToken,
    pageId,
    // The editor's own save, which already handles create vs update and already
    // sets `pageId`. Nothing about the wire shape is restated here.
    persist: async (d) => {
      const r = await saveToServer(d, pagePassword);
      const id = r?.data?._id ? String(r.data._id) : pageId;
      return id || null;
    },
    onAdopted: (d) => {
      // The adopted payload carries CDN URLs where the browser held base64, so
      // the form has to be told — otherwise the next save sends the base64 back
      // and re-uploads it.
      setContent(d);
      setMf({ ...d });
      setIsPersonalized(true);
    },
  });

  // ── The milestones ────────────────────────────────────────────────────────
  //
  // Watching `editMode` rather than calling `saveNow()` from each place that
  // sets it: a transition is impossible to forget in a way a call site is not.
  // Leaving the editor and backgrounding the tab are handled inside the hook.
  useEffect(() => {
    if (editMode === null || editMode === "preview") void draft.saveNow();
  }, [editMode, draft]);

  const handlePublish = useCallback(async () => {
    if (!pageId) return;
    track(EVENTS.PUBLISH_CLICKED, { template: TEMPLATE, is_authenticated: true });
    setPublishing(true);
    try {
      // Clear the paywall BEFORE publishing, so nothing spins behind the sheet,
      // and the publish request is only made when it will succeed.
      const gate = await ensurePublishAllowed(
        { slug: TEMPLATE, templateType: "eid", pageId: pageId, templateTitle: "Eid Mubarak" },
        setPublishing,
      );
      if (gate === "cancelled") return;

      const res = await fetch(`${API_URL}/eid-pages/${pageId}/publish`, { method: "POST", headers: headers(), });
      const result = await res.json();
      if (result.success) {
        const url = result.data.shareUrl;
        setShareUrl(url);
        track(EVENTS.PUBLISH_SUCCESS, { template: TEMPLATE, source: "direct" });
        // Keep pageId so user can edit and republish to the same URL
        pushToast({
          type: "publish",
          title: "Published!",
          message: "Tap Share to send it",
        });
      } else {
        // This editor previously showed no feedback at all on a rejected publish —
        // the click just silently did nothing. Recording it is how that becomes
        // visible; the (missing) user-facing toast is left alone deliberately.
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

  const handleShare = useCallback(() => {
    if (!shareUrl) return;
    openShareSheet({
      url: shareUrl,
      password: pagePassword,
      text: `${content.senderName || "Someone"} is sharing Eid Mubarak wishes${content.recipientName ? ` for ${content.recipientName}` : ""} on SubhSandesh!`,
      title: "Eid Mubarak",
      cardTitle: "Eid Mubarak",
      cardNote: "Scan to open the wishes written for you.",
      senderName: content.senderName,
      recipientName: content.recipientName,
      accent: "#d97706",
      slug: "eid-mubarak",
    });
  }, [shareUrl, pagePassword, content]);


  return {
    tab, content, editMode, isPersonalized, shareUrl, copied, showAuth,
    saving, publishing, pagePassword, showPwValue,
    aiName, aiSender, aiPrompt, aiLoading,
    mf, manualStep,
    darkMode, themeReady, toggleDark,

    setEditMode, setAiName, setAiSender, setAiPrompt, setManualStep,
    setPagePassword, setShowPwValue,
    updateMf, handleTabChange,

    goBack, closeAuth, closeAuthSuccess, handleEditClick, startAiMode, startManualMode,
    handleAiGenerate, handleManualPreview, handleAiEditPreview,
    handleConfirmSave, handlePasswordDone, handleDiscardPreview,
    handlePublish, handleCopy, handleShare,
    pushToast, // Show publish if user has personalized but not yet publishing
    showPublish: isPersonalized && !publishing,
    // Show share/copy after publishing
    showShare: !!shareUrl,
    shareLabel: copied ? "Copied!" : "Share",
  };
}
