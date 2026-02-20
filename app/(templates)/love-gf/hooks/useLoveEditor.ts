"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { type ContentData, type TabId, type EditMode, type Toast, DEMO_CONTENT } from "../components/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export function useLoveEditor() {
  const router = useRouter();
  const { isAuthenticated, accessToken } = useAppSelector((s) => s.auth);

  const [darkMode, setDarkMode] = useState(false);
  const [themeReady, setThemeReady] = useState(false);
  const toggleDark = useCallback(() => setDarkMode((d) => !d), []);

  useEffect(() => {
    const saved = localStorage.getItem("love-gf-theme");
    if (saved === "dark") setDarkMode(true);
    else if (saved === "light") setDarkMode(false);
    else setDarkMode(window.matchMedia("(prefers-color-scheme: dark)").matches);
    setThemeReady(true);
  }, []);

  useEffect(() => {
    if (!themeReady) return;
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("love-gf-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("love-gf-theme", "light");
    }
  }, [darkMode, themeReady]);

  const [tab, setTab] = useState<TabId>("home");
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
  const goToGallery = useCallback(() => setTab("gallery"), []);
  const goToNotes = useCallback(() => setTab("notes"), []);
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
          prompt: `Love message for ${aiName}. ${aiPrompt}`,
          templateId: "love-gf",
          templateType: "love",
        }),
      });
      const data = await res.json();
      if (data.heading || data.body) {
        const newContent: ContentData = {
          recipientName: aiName.trim(),
          senderName: aiSender.trim() || "With Love 💕",
          loveDate: DEMO_CONTENT.loveDate,
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

  const saveToServer = useCallback(
    async (data: ContentData, password?: string) => {
      if (!accessToken) return;
      const body = { ...data, password: password || "" };
      if (pageId) {
        await fetch(`${API_URL}/love-pages/${pageId}`, { method: "PUT", headers: headers(), body: JSON.stringify(body) });
      } else {
        const res = await fetch(`${API_URL}/love-pages`, { method: "POST", headers: headers(), body: JSON.stringify(body) });
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
          title: pw ? "Saved with password protection!" : "Changes saved!",
          message: pw ? "Share the password with your special someone" : "Your love page is ready to publish",
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
    setPublishing(true);
    try {
      const res = await fetch(`${API_URL}/love-pages/${pageId}/publish`, { method: "POST", headers: headers() });
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
          message: hasPasswordSet ? "Page is password-protected" : "Your love page is now live",
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
    mf, manualStep, photoInput,
    darkMode, toggleDark,

    setEditMode, setAiName, setAiSender, setAiPrompt, setManualStep, setPhotoInput,
    setPagePassword, setShowPwValue,
    updateMf, handleTabChange, goToGallery, goToNotes,

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
