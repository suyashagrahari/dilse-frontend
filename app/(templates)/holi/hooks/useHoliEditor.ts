"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { type TabId, type EditMode, type Toast, type HoliData, DEMO_DATA } from "../components/types";

import { API_URL, IS_NGROK } from "@/lib/config";
import { ensurePublishAllowed } from "@/lib/paywall/publishRequest";
import { EVENTS } from "@/lib/analytics/events";
import { track } from "@/lib/analytics/track";
import { requestFeedback } from "@/lib/feedback/feedbackBus";
import { useDraft } from "@/lib/draft/useDraft";

/** Slug reported on every analytics event from this editor. */
const TEMPLATE = "holi";

/**
 * Editor content → the shape `/holi-pages` accepts.
 *
 * Extracted from inside `saveToServer` because the draft hook has to send the
 * same body. Two copies of a field list is how a draft ends up saving eleven of
 * the twelve fields a publish sends, and the twelfth goes missing only for
 * people who left and came back.
 */
export function holiDataToBody(data: HoliData, password?: string) {
  return {
    senderName: data.senderName,
    senderFamily: data.senderFamily,
    senderMembers: data.senderMembers,
    senderPhoto: data.senderPhoto,
    recipientName: data.recipientName,
    homeWishMessage: data.homeWishMessage,
    congratsMessage: data.congratsMessage,
    hindiTitle: data.hindiTitle,
    hindiSubtitle: data.hindiSubtitle,
    englishSubtitle: data.englishSubtitle,
    holiDate: data.holiDate,
    password: password || "",
  };
}

export function useHoliEditor() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, accessToken } = useAppSelector((s) => s.auth);

  const [darkMode, setDarkMode] = useState(false);
  const [themeReady, setThemeReady] = useState(false);
  const toggleDark = useCallback(() => setDarkMode((d) => !d), []);

  useEffect(() => {
    const saved = localStorage.getItem("holi-theme");
    if (saved) {
      setDarkMode(saved === "dark");
    } else {
      const global = localStorage.getItem("theme"); // set by next-themes
      setDarkMode(global === "dark"); // only dark if user explicitly chose dark (holi defaults light)
    }
    setThemeReady(true);
  }, []);

  useEffect(() => {
    if (!themeReady) return;
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add("holi-dark");
      localStorage.setItem("holi-theme", "dark");
    } else {
      root.classList.remove("holi-dark");
      localStorage.setItem("holi-theme", "light");
    }
  }, [darkMode, themeReady]);

  const [tab, setTab] = useState<TabId>("home");
  const [content, setContent] = useState<HoliData>(DEMO_DATA);
  const [isPersonalized, setIsPersonalized] = useState(false);
  const [pageId, setPageId] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [showShareSheet, setShowShareSheet] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [copied, setCopied] = useState(false);

  // Load AI-prefilled data from shared viewer (sessionStorage holi_prefill)
  useEffect(() => {
    if (!themeReady || !isAuthenticated) return;
    const raw = sessionStorage.getItem("holi_prefill");
    if (!raw) return;
    sessionStorage.removeItem("holi_prefill");
    try {
      const d = JSON.parse(raw) as Partial<HoliData>;
      const loaded: HoliData = { ...DEMO_DATA, ...d };
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
    fetch(`${API_URL}/holi-pages/${editId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        ...(IS_NGROK ? { "ngrok-skip-browser-warning": "true" } : {}),
      },
    })
      .then((r) => r.json())
      .then((result) => {
        if (result.success && result.data) {
          const d = result.data;
          const loaded: HoliData = {
            ...DEMO_DATA,
            recipientName: d.recipientName || "",
            senderName: d.senderName || "",
            senderFamily: d.senderFamily || "",
            senderMembers: d.senderMembers || [],
            senderPhoto: d.senderPhoto || "",
            homeWishMessage: d.homeWishMessage || DEMO_DATA.homeWishMessage,
            congratsMessage: d.congratsMessage || DEMO_DATA.congratsMessage,
            hindiTitle: d.hindiTitle || DEMO_DATA.hindiTitle,
            hindiSubtitle: d.hindiSubtitle || DEMO_DATA.hindiSubtitle,
            englishSubtitle: d.englishSubtitle || DEMO_DATA.englishSubtitle,
            holiDate: d.holiDate || DEMO_DATA.holiDate,
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

  const [editMode, setEditMode] = useState<EditMode>(null);
  const [pendingContent, setPendingContent] = useState<HoliData | null>(null);
  const [saving, setSaving] = useState(false);
  const [pagePassword, setPagePassword] = useState("");
  const [showPwValue, setShowPwValue] = useState(false);
  const [hasPasswordSet, setHasPasswordSet] = useState(false);

  const [aiName, setAiName] = useState("");
  const [aiSender, setAiSender] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const [mf, setMf] = useState<HoliData>({ ...DEMO_DATA });
  const [manualStep, setManualStep] = useState(0);
  const preEditContentRef = useRef<HoliData>(DEMO_DATA);
  const previewSourceRef = useRef<"manual" | "ai-edit" | null>(null);

  // Persist draft to sessionStorage
  useEffect(() => {
    const isDemoData = mf.senderName === DEMO_DATA.senderName && mf.recipientName === DEMO_DATA.recipientName && !mf.senderPhoto;
    if (!isDemoData) {
      try { sessionStorage.setItem("holi_mf_draft", JSON.stringify(mf)); } catch {}
    }
  }, [mf]);

  const [publishing, setPublishing] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);


  // Stable ref so the payment-complete effect can call the latest handlePublish
  const handlePublishRef = useRef<() => Promise<void>>(async () => {});
  const toastIdRef = useRef(0);

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

  const handleTabChange = useCallback((id: TabId) => setTab(id), []);
  const goBack = useCallback(() => router.push("/templates"), [router]);
  // Called when user dismisses auth without logging in → redirect away (private route)
  const closeAuth = useCallback(() => {
    setShowAuth(false);
    router.push("/templates");
  }, [router]);

  // Called when auth succeeds → just close the modal
  const closeAuthSuccess = useCallback(() => {
    setShowAuth(false);
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
        const draft = sessionStorage.getItem("holi_mf_draft");
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
            ? `Happy Holi greeting from ${aiSender} to ${aiName}. ${aiPrompt}`
            : `Happy Holi general greeting from ${aiSender}. ${aiPrompt}`,
          templateId: "holi",
          templateType: "festival",
        }),
      });
      const data = await res.json();

      // Build a prefilled HoliData from the AI response
      const aiContent: HoliData = {
        ...DEMO_DATA,
        recipientName: aiName.trim(),
        senderName: aiSender.trim() || data.senderName || "",
        hindiTitle: data.hindiTitle || DEMO_DATA.hindiTitle,
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
    (key: keyof HoliData, val: unknown) => setMf((p) => ({ ...p, [key]: val })),
    [],
  );

  const saveToServer = useCallback(
    async (data: HoliData, password?: string) => {
      if (!accessToken) return;
      const body = holiDataToBody(data, password);

      if (pageId) {
        const res = await fetch(`${API_URL}/holi-pages/${pageId}`, {
          method: "PUT",
          headers: headers(),
          body: JSON.stringify(body),
        });
        const result = await res.json();
        if (!result.success) throw new Error(result.error || "Save failed");
        return result;
      } else {
        const res = await fetch(`${API_URL}/holi-pages`, {
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
      try { sessionStorage.removeItem("holi_mf_draft"); } catch {}
      track(EVENTS.PAGE_SAVED, { template: TEMPLATE, has_password: Boolean(pagePassword) });
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
      setManualStep(3);
      setEditMode("manual");
    } else if (source === "ai-edit") {
      setEditMode("ai-edit");
    } else {
      setEditMode("choose");
    }
  }, [pendingContent]);

  // ── Auto-draft ────────────────────────────────────────────────────────────
  //
  // What this adds that `saveToServer` did not: a signed-OUT visitor's work is
  // held in the browser and promoted to a real draft — photos on S3 — the moment
  // they sign up or log in. `saveToServer` only ever ran with a token, so
  // everything built before signing in was lost at the first navigation.
  //
  // `enabled: isPersonalized` keeps every visitor who merely opened the editor
  // out of their own profile: the demo content is not a draft.
  const draft = useDraft<HoliData>({
    templateType: TEMPLATE,
    content,
    enabled: isPersonalized,
    busy: publishing || saving,
    isAuthenticated,
    accessToken,
    pageId,
    // The editor's own save, which already handles create vs update and already
    // sets `pageId` on create. Nothing about the wire shape is restated here.
    persist: async (d: HoliData) => {
      const r = await saveToServer(d, pagePassword);
      const id = r?.data?._id ? String(r.data._id) : pageId;
      return id || null;
    },
    onAdopted: (d: HoliData) => {
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
  // Watching `editMode` rather than calling `saveNow()` from each of the six
  // places that set it. Closing the sheet (`null`) and entering preview are the
  // two moments the user has decided something is worth keeping, and a
  // transition is impossible to forget in a way a call site is not.
  //
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
        { slug: TEMPLATE, templateType: "holi", pageId, templateTitle: "Holi card" },
        setPublishing,
      );
      if (gate === "cancelled") return;

      const res = await fetch(`${API_URL}/holi-pages/${pageId}/publish`, { method: "POST", headers: headers() });
      const result = await res.json();

      if (result.success) {
        const url = result.data.shareUrl;
        setShareUrl(url);
        track(EVENTS.PUBLISH_SUCCESS, { template: TEMPLATE, source: "direct" });
        // Ask how it went, before this editor's own "Published!" panel takes
        // over. Unlike most templates it does not raise the house share sheet,
        // so the interception inside `openShareSheet` never runs here — see
        // lib/feedback/feedbackBus. Asking twice is impossible: the bus marks
        // the page the moment it raises, and this is a no-op if it already has.
        requestFeedback({ templateSlug: TEMPLATE, pageUrl: url }, () => {});
        // Keep pageId so user can edit and republish to the same URL
        pushToast({
          type: "publish",
          title: "Published!",
          message: hasPasswordSet ? "Card is password-protected" : "Your Holi card is now live",
          shareUrl: url,
        });
      } else {
        track(EVENTS.PUBLISH_FAILED, {
          template: TEMPLATE,
          reason: typeof result?.error === "string" ? result.error : "publish_rejected",
        });
        pushToast({ type: "info", title: "Publish failed", message: result.error || "Please try again" });
      }
    } catch {
      track(EVENTS.PUBLISH_FAILED, { template: TEMPLATE, reason: "network_error" });
      pushToast({ type: "info", title: "Publish failed", message: "Please try again" });
    } finally {
      setPublishing(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageId, headers, hasPasswordSet, pushToast]);

  // Keep ref up to date so the effect below always calls the latest version
  useEffect(() => {
    handlePublishRef.current = handlePublish;
  }, [handlePublish]);


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
    setShowShareSheet(true);
  }, [shareUrl]);

  const closeShareSheet = useCallback(() => setShowShareSheet(false), []);

  return {
    saveDraftNow: draft.saveNow,
    tab, content, editMode, isPersonalized, shareUrl, showShareSheet, copied, showAuth,
    toasts, saving, publishing, pagePassword, showPwValue,
    aiName, aiSender, aiPrompt, aiLoading,
    mf, manualStep,
    darkMode, themeReady, toggleDark,

    setEditMode, setAiName, setAiSender, setAiPrompt, setManualStep,
    setPagePassword, setShowPwValue,
    updateMf, handleTabChange,

    goBack, closeAuth, closeAuthSuccess, closeShareSheet,
    handleEditClick, startAiMode, startManualMode,
    handleAiGenerate, handleManualPreview, handleAiEditPreview,
    handleConfirmSave, handlePasswordDone, handleDiscardPreview,
    handlePublish, handleCopy, handleShare,
    pushToast, dismissToast,


    // Show publish if user has personalized but not yet published
    showPublish: isPersonalized && !publishing,
    // Show share/copy after publishing
    showShare: !!shareUrl,
    shareLabel: copied ? "Copied!" : "Share",
  };
}
