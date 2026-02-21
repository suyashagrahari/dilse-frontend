"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { type TabId, type EditMode, type Toast, type EidData, DEMO_DATA } from "../components/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export function useEidEditor() {
  const router = useRouter();
  const { isAuthenticated, accessToken } = useAppSelector((s) => s.auth);

  const [darkMode, setDarkMode] = useState(true);
  const [themeReady, setThemeReady] = useState(false);
  const toggleDark = useCallback(() => setDarkMode((d) => !d), []);

  useEffect(() => {
    const saved = localStorage.getItem("eid-theme");
    if (saved === "light") setDarkMode(false);
    else setDarkMode(true);
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
  const closeAuth = useCallback(() => setShowAuth(false), []);

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
    if (!aiName.trim() || !aiPrompt.trim()) return;
    setAiLoading(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({
          prompt: `Eid Mubarak greeting for ${aiName}. ${aiPrompt}`,
          templateId: "eid-mubarak",
          templateType: "festival",
        }),
      });
      const data = await res.json();
      if (data.body) {
        const newContent: EidData = {
          ...DEMO_DATA,
          recipientName: aiName.trim(),
          senderName: aiSender.trim() || "",
          englishSubtitle: data.body,
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
  }, [aiName, aiSender, aiPrompt, headers, pushToast]);

  const handleManualPreview = useCallback(() => {
    setPendingContent(mf);
    setContent(mf);
    setEditMode("preview");
  }, [mf]);

  const updateMf = useCallback(
    (key: keyof EidData, val: unknown) => setMf((p) => ({ ...p, [key]: val })),
    [],
  );

  const saveToServer = useCallback(
    async (data: EidData, password?: string) => {
      if (!accessToken) return;
      const body = { ...data, password: password || "" };
      if (pageId) {
        await fetch(`${API_URL}/eid-pages/${pageId}`, { method: "PUT", headers: headers(), body: JSON.stringify(body) });
      } else {
        const res = await fetch(`${API_URL}/eid-pages`, { method: "POST", headers: headers(), body: JSON.stringify(body) });
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
        setPendingContent(null);
        setHasPasswordSet(!!pw);
        pushToast({
          type: "success",
          title: pw ? "Saved with password!" : "Changes saved!",
          message: pw ? "Share the password with recipients" : "Your Eid card is ready to publish",
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
    setContent(isPersonalized ? content : DEMO_DATA);
    setPendingContent(null);
    setEditMode("choose");
  }, [pendingContent, isPersonalized, content]);

  const handlePublish = useCallback(async () => {
    if (!pageId) return;
    setPublishing(true);
    try {
      const res = await fetch(`${API_URL}/eid-pages/${pageId}/publish`, { method: "POST", headers: headers() });
      const result = await res.json();
      if (result.success) {
        const url = result.data.shareUrl;
        setShareUrl(url);
        setPageId(null);
        setIsPersonalized(false);
        setHasPasswordSet(false);
        pushToast({
          type: "publish",
          title: "Published!",
          message: hasPasswordSet ? "Card is password-protected" : "Your Eid card is now live",
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

    goBack, closeAuth,
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
