"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { type TabId, type EditMode, type Toast, type ReceptionData, DEMO_DATA } from "../components/types";

import { API_URL, IS_NGROK } from "@/lib/config";

export function useReceptionEditor() {
  const router = useRouter();
  const { isAuthenticated, accessToken } = useAppSelector((s) => s.auth);

  const [darkMode, setDarkMode] = useState(true);
  const [themeReady, setThemeReady] = useState(false);
  const toggleDark = useCallback(() => setDarkMode((d) => !d), []);

  useEffect(() => {
    const saved = localStorage.getItem("reception-theme");
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
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("reception-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("reception-theme", "light");
    }
  }, [darkMode, themeReady]);

  // Restore global theme when navigating away so next-themes stays in sync
  useEffect(() => {
    return () => {
      const global = localStorage.getItem("theme");
      if (global === "light") {
        document.documentElement.classList.remove("dark");
      } else {
        document.documentElement.classList.add("dark");
      }
    };
  }, []);

  const [tab, setTab] = useState<TabId>("home");
  const [content, setContent] = useState<ReceptionData>(DEMO_DATA);
  const [isPersonalized, setIsPersonalized] = useState(false);
  const [pageId, setPageId] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [showShareSheet, setShowShareSheet] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [copied, setCopied] = useState(false);

  const [editMode, setEditMode] = useState<EditMode>(null);
  const [pendingContent, setPendingContent] = useState<ReceptionData | null>(null);
  const [saving, setSaving] = useState(false);
  const [pagePassword, setPagePassword] = useState("");
  const [showPwValue, setShowPwValue] = useState(false);
  const [hasPasswordSet, setHasPasswordSet] = useState(false);

  // AI text mode
  const [aiName, setAiName] = useState("");
  const [aiSender, setAiSender] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  // AI card extraction
  const [extractLoading, setExtractLoading] = useState(false);

  // Shared form data (used for manual + ai-edit modes)
  const [mf, setMf] = useState<ReceptionData>({ ...DEMO_DATA });
  const [manualStep, setManualStep] = useState(0);
  const preEditContentRef = useRef<ReceptionData>(DEMO_DATA);
  const previewSourceRef = useRef<"manual" | "ai-edit" | null>(null);

  // Persist draft to sessionStorage
  useEffect(() => {
    const isDemoData = mf.brideName === DEMO_DATA.brideName && mf.groomName === DEMO_DATA.groomName && !mf.bride.photo && !mf.groom.photo;
    if (!isDemoData) {
      try { sessionStorage.setItem("reception_mf_draft", JSON.stringify(mf)); } catch {}
    }
  }, [mf]);

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
    () => ({
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      ...(IS_NGROK ? { "ngrok-skip-browser-warning": "true" } : {}),
    }),
    [accessToken],
  );

  const handleTabChange = useCallback((id: TabId) => setTab(id), []);
  const goBack = useCallback(() => router.push("/templates"), [router]);
  const closeAuth = useCallback(() => setShowAuth(false), []);

  // After successful auth, open edit sheet
  const closeAuthSuccess = useCallback(() => {
    setShowAuth(false);
    setEditMode("choose");
  }, []);

  const handleEditClick = useCallback(() => {
    if (!isAuthenticated) { setShowAuth(true); return; }
    setEditMode("choose");
  }, [isAuthenticated]);

  const startAiTextMode = useCallback(() => {
    setAiName(isPersonalized ? content.brideName : "");
    setAiSender(isPersonalized ? content.groomName : "");
    setAiPrompt("");
    setMf(isPersonalized ? { ...content } : { ...DEMO_DATA });
    setEditMode("ai-text");
  }, [isPersonalized, content]);

  const startAiCardMode = useCallback(() => {
    setEditMode("ai-card");
  }, []);

  const startManualMode = useCallback(() => {
    if (isPersonalized) {
      setMf({ ...content });
    } else {
      try {
        const draft = sessionStorage.getItem("reception_mf_draft");
        setMf(draft ? JSON.parse(draft) : { ...DEMO_DATA });
      } catch {
        setMf({ ...DEMO_DATA });
      }
    }
    setManualStep(0);
    setEditMode("manual");
  }, [isPersonalized, content]);

  const updateMf = useCallback(
    (key: keyof ReceptionData, val: unknown) => setMf((p) => ({ ...p, [key]: val })),
    [],
  );

  const bulkUpdateMf = useCallback(
    (data: Partial<ReceptionData>) => setMf((p) => ({ ...p, ...data })),
    [],
  );

  // AI text generation → goes to ai-edit mode for review
  const handleAiGenerate = useCallback(async () => {
    if (!aiName.trim() || !aiPrompt.trim()) return;
    setAiLoading(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({
          prompt: `Reception invitation for ${aiName} & ${aiSender}. ${aiPrompt}`,
          templateId: "reception",
          templateType: "reception",
        }),
      });
      const data = await res.json();
      if (data.body || data.brideDescription || data.tagline) {
        const generated = data;
        // Merge AI output into mf so user can review in ai-edit mode
        setMf((prev) => ({
          ...prev,
          brideName: aiName.trim() || prev.brideName,
          groomName: aiSender.trim() || prev.groomName,
          tagline: generated.tagline || prev.tagline,
          venueTimings: generated.venueTimings || prev.venueTimings,
          bride: {
            ...prev.bride,
            name: aiName.trim() || prev.bride.name,
            description: generated.brideDescription || generated.body || prev.bride.description,
          },
          groom: {
            ...prev.groom,
            name: aiSender.trim() || prev.groom.name,
            description: generated.groomDescription || prev.groom.description,
          },
        }));
        setEditMode("ai-edit");
      } else {
        pushToast({ type: "info", title: "Generation failed", message: "Please try again" });
      }
    } catch {
      pushToast({ type: "info", title: "Generation failed", message: "Please try again" });
    } finally {
      setAiLoading(false);
    }
  }, [aiName, aiSender, aiPrompt, headers, pushToast]);

  // Card extraction via OpenAI Vision → goes to ai-edit for review
  const handleCardExtract = useCallback(async (images: string[]) => {
    if (images.length === 0) return;
    setExtractLoading(true);
    try {
      const res = await fetch(`${API_URL}/reception-pages/extract-card`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({ images }),
      });
      const result = await res.json();
      if (result.success && result.data) {
        const d = result.data;
        setMf((prev) => ({
          ...prev,
          brideName: d.brideName || prev.brideName,
          groomName: d.groomName || prev.groomName,
          receptionDate: d.receptionDate || prev.receptionDate,
          venue: d.venue || prev.venue,
          venueAddress: d.venueAddress || prev.venueAddress,
          venueMapQuery: d.venueMapQuery || prev.venueMapQuery,
          venueTimings: d.venueTimings || prev.venueTimings,
          tagline: d.tagline || prev.tagline,
          bride: {
            ...prev.bride,
            name: d.brideName || prev.bride.name,
            description: d.brideDescription || prev.bride.description,
          },
          groom: {
            ...prev.groom,
            name: d.groomName || prev.groom.name,
            description: d.groomDescription || prev.groom.description,
          },
          families: {
            bride: d.familyBride || prev.families.bride,
            groom: d.familyGroom || prev.families.groom,
          },
        }));
        setEditMode("ai-edit");
      } else {
        pushToast({ type: "info", title: "Extraction failed", message: result.error || "Please try again" });
      }
    } catch {
      pushToast({ type: "info", title: "Extraction failed", message: "Please try again" });
    } finally {
      setExtractLoading(false);
    }
  }, [headers, pushToast]);

  // After ai-edit review → preview
  const handleAiEditPreview = useCallback(() => {
    if (!mf.brideName.trim()) return;
    setPendingContent(mf);
    setContent((prev) => { preEditContentRef.current = prev; return mf; });
    previewSourceRef.current = "ai-edit";
    setEditMode("preview");
  }, [mf]);

  const handleManualPreview = useCallback(() => {
    if (!mf.brideName.trim()) return;
    setPendingContent(mf);
    setContent((prev) => { preEditContentRef.current = prev; return mf; });
    previewSourceRef.current = "manual";
    setEditMode("preview");
  }, [mf]);

  const saveToServer = useCallback(
    async (data: ReceptionData, password?: string) => {
      if (!accessToken) return;
      const body = {
        brideName: data.brideName,
        groomName: data.groomName,
        receptionDate: data.receptionDate,
        venue: data.venue,
        venueAddress: data.venueAddress,
        venueMapQuery: data.venueMapQuery,
        venueTimings: data.venueTimings,
        tagline: data.tagline,
        heroImage: data.heroImage,
        bride: data.bride,
        groom: data.groom,
        families: data.families,
        galleryImages: data.galleryImages,
        password: password || "",
      };
      if (pageId) {
        await fetch(`${API_URL}/reception-pages/${pageId}`, {
          method: "PUT", headers: headers(), body: JSON.stringify(body),
        });
      } else {
        const res = await fetch(`${API_URL}/reception-pages`, {
          method: "POST", headers: headers(), body: JSON.stringify(body),
        });
        const result = await res.json();
        if (result.success) setPageId(result.data._id);
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
      try { sessionStorage.removeItem("reception_mf_draft"); } catch {}
      pushToast({
        type: "success",
        title: pagePassword ? "Saved with password!" : "Changes saved!",
        message: pagePassword ? "Share the password with your guests" : "Your invitation is ready to publish",
      });
    } catch {
      pushToast({ type: "info", title: "Save failed", message: "Please try again" });
    } finally {
      setSaving(false);
    }
  }, [pendingContent, pagePassword, saveToServer, pushToast]);

  // Keep handlePasswordDone for any legacy callers
  const handlePasswordDone = handleConfirmSave;

  const handleDiscardPreview = useCallback(() => {
    if (!pendingContent) { setEditMode(null); return; }
    setContent(preEditContentRef.current);
    setPendingContent(null);
    const source = previewSourceRef.current;
    previewSourceRef.current = null;
    if (source === "manual") {
      setManualStep(5);
      setEditMode("manual");
    } else if (source === "ai-edit") {
      setEditMode("ai-edit");
    } else {
      setEditMode("choose");
    }
  }, [pendingContent]);

  const handlePublish = useCallback(async () => {
    if (!pageId) return;
    setPublishing(true);
    try {
      const res = await fetch(`${API_URL}/reception-pages/${pageId}/publish`, {
        method: "POST", headers: headers(),
      });
      const result = await res.json();
      if (result.success) {
        const url = result.data.shareUrl;
        setShareUrl(url);
        // Keep pageId so user can edit + republish
        setHasPasswordSet(false);
        pushToast({
          type: "publish",
          title: "Published!",
          message: hasPasswordSet ? "Invitation is password-protected" : "Your reception invitation is now live",
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

  const handleShare = useCallback(() => {
    if (!shareUrl) return;
    setShowShareSheet(true);
  }, [shareUrl]);

  const closeShareSheet = useCallback(() => setShowShareSheet(false), []);

  return {
    tab, content, editMode, isPersonalized, shareUrl, showShareSheet, copied, showAuth,
    toasts, saving, publishing, pagePassword, showPwValue,
    aiName, aiSender, aiPrompt, aiLoading, extractLoading,
    mf, manualStep,
    darkMode, themeReady, toggleDark,

    setEditMode, setAiName, setAiSender, setAiPrompt, setManualStep,
    setPagePassword, setShowPwValue, setMf,
    updateMf, bulkUpdateMf, handleTabChange,

    goBack, closeAuth, closeAuthSuccess, closeShareSheet,
    handleEditClick, startAiTextMode, startAiCardMode, startManualMode,
    handleAiGenerate, handleCardExtract, handleAiEditPreview, handleManualPreview,
    handleConfirmSave, handlePasswordDone, handleDiscardPreview,
    handlePublish, handleCopy, handleShare,
    pushToast, dismissToast,

    showPublish: isPersonalized && !publishing,
    showShare: !!shareUrl,
    shareLabel: copied ? "Copied!" : "Share",
  };
}
