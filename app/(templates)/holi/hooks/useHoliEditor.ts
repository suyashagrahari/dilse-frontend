"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { type TabId, type EditMode, type Toast, type HoliData, DEMO_DATA } from "../components/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

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
      headers: { Authorization: `Bearer ${accessToken}` },
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

  const [publishing, setPublishing] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
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
    () => ({ "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` }),
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
    setMf(isPersonalized ? { ...content } : { ...DEMO_DATA });
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
    setPendingContent(mf);
    setContent((prev) => {
      preEditContentRef.current = prev; // save pre-edit state for discard
      return mf;
    });
    setEditMode("preview");
  }, [mf]);

  const updateMf = useCallback(
    (key: keyof HoliData, val: unknown) => setMf((p) => ({ ...p, [key]: val })),
    [],
  );

  const saveToServer = useCallback(
    async (data: HoliData, password?: string) => {
      if (!accessToken) return;
      const body = {
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

      if (pageId) {
        const res = await fetch(`${API_URL}/holi-pages/${pageId}`, {
          method: "PUT",
          headers: headers(),
          body: JSON.stringify(body),
        });
        return res.json();
      } else {
        const res = await fetch(`${API_URL}/holi-pages`, {
          method: "POST",
          headers: headers(),
          body: JSON.stringify(body),
        });
        const result = await res.json();
        if (result.success) setPageId(result.data._id);
        return result;
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
        setEditMode(null);
        setPendingContent(null);
        setHasPasswordSet(!!pw);
        pushToast({
          type: "success",
          title: pw ? "Saved with password!" : "Changes saved!",
          message: pw ? "Share the password with recipients" : "Your Holi card is ready to publish",
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
    setContent(preEditContentRef.current); // restore pre-edit content
    setPendingContent(null);
    setEditMode("choose");
  }, [pendingContent]);

  const handlePublish = useCallback(async () => {
    if (!pageId) return;
    setPublishing(true);
    try {
      const res = await fetch(`${API_URL}/holi-pages/${pageId}/publish`, {
        method: "POST",
        headers: headers(),
      });
      const result = await res.json();
      if (result.success) {
        const url = result.data.shareUrl;
        setShareUrl(url);
        // Keep pageId so user can edit and republish to the same URL
        pushToast({
          type: "publish",
          title: "Published!",
          message: hasPasswordSet ? "Card is password-protected" : "Your Holi card is now live",
          shareUrl: url,
        });
      }
    } catch {
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
    mf, manualStep,
    darkMode, themeReady, toggleDark,

    setEditMode, setAiName, setAiSender, setAiPrompt, setManualStep,
    setPagePassword, setShowPwValue,
    updateMf, handleTabChange,

    goBack, closeAuth, closeAuthSuccess,
    handleEditClick, startAiMode, startManualMode,
    handleAiGenerate, handleManualPreview,
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
