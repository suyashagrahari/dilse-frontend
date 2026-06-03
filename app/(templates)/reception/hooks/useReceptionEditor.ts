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
  const pendingPublishRef = useRef<{ data: ReceptionData; password: string } | null>(null);
  const fromPreviewRef = useRef(false);

  // Persist WIP draft to sessionStorage while filling the form
  useEffect(() => {
    if (editMode !== "manual") return;
    try { sessionStorage.setItem("reception_mf_draft", JSON.stringify(mf)); } catch {}
  }, [mf, editMode]);

  // Restore completed draft on mount (user filled form, saved preview, then refreshed)
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("reception_draft");
      if (raw) {
        const saved = JSON.parse(raw);
        setContent((prev) => ({ ...prev, ...saved }));
        setMf((prev) => ({ ...prev, ...saved }));
        if (saved.password) setPagePassword(saved.password);
        if (saved.completed) {
          setIsPersonalized(true);
          setEditMode("preview");
        }
      }
    } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [publishing, setPublishing] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastIdRef = useRef(0);

  const pushToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = ++toastIdRef.current;
    setToasts((prev) => [...prev, { ...toast, id }]);
    const delay = toast.type === "publish" ? 1000 : 3500;
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), delay);
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

  const closeAuth = useCallback(() => {
    setShowAuth(false);
    pendingPublishRef.current = null;
  }, []);

  const closeAuthSuccess = useCallback(() => {
    setShowAuth(false);
    if (!pendingPublishRef.current) {
      setEditMode("choose");
    }
    // if pendingPublishRef.current exists, the auto-publish useEffect will fire
  }, []);

  // No auth check — anyone can open the form and fill it
  const handleEditClick = useCallback(() => {
    setEditMode("choose");
  }, []);

  // Wrapped setEditMode for EditSheet: if user dismisses while in fromPreview flow,
  // return to "preview" instead of null so Edit+Publish buttons remain visible.
  const setEditModeFromSheet = useCallback((mode: EditMode) => {
    if (mode === null && fromPreviewRef.current) {
      fromPreviewRef.current = false;
      setEditMode("preview");
    } else {
      if (mode === null || mode === "preview") fromPreviewRef.current = false;
      setEditMode(mode);
    }
  }, []);

  // From preview: go back into the form to edit
  const handleEditFromPreview = useCallback(() => {
    fromPreviewRef.current = true;
    setMf({ ...content });
    const source = previewSourceRef.current;
    if (source === "ai-edit") {
      setEditMode("ai-edit");
    } else {
      setManualStep(0);
      setEditMode("manual");
    }
  }, [content]);

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
    setIsPersonalized(true);
    setEditMode("preview");
    try {
      sessionStorage.setItem("reception_draft", JSON.stringify({ ...mf, password: pagePassword, completed: true }));
    } catch {}
  }, [mf, pagePassword]);

  const handleManualPreview = useCallback(() => {
    if (!mf.brideName.trim()) return;
    setPendingContent(mf);
    setContent((prev) => { preEditContentRef.current = prev; return mf; });
    previewSourceRef.current = "manual";
    setIsPersonalized(true);
    setEditMode("preview");
    try {
      sessionStorage.setItem("reception_draft", JSON.stringify({ ...mf, password: pagePassword, completed: true, step: manualStep }));
    } catch {}
  }, [mf, pagePassword, manualStep]);

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
        sharePhoto: data.sharePhoto || "",
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
    if (!isAuthenticated || !accessToken) {
      pendingPublishRef.current = { data: content, password: pagePassword };
      setShowAuth(true);
      return;
    }
    setPublishing(true);
    try {
      let id = pageId;
      const body = {
        brideName: content.brideName, groomName: content.groomName,
        receptionDate: content.receptionDate, venue: content.venue,
        venueAddress: content.venueAddress, venueMapQuery: content.venueMapQuery,
        venueTimings: content.venueTimings, tagline: content.tagline,
        heroImage: content.heroImage, bride: content.bride, groom: content.groom,
        families: content.families, galleryImages: content.galleryImages,
        sharePhoto: content.sharePhoto || "",
        password: pagePassword || "",
      };
      if (!id) {
        const res = await fetch(`${API_URL}/reception-pages`, {
          method: "POST", headers: headers(), body: JSON.stringify(body),
        });
        const result = await res.json();
        if (!result.success) throw new Error("Create failed");
        id = result.data._id as string;
        setPageId(id);
      } else {
        await fetch(`${API_URL}/reception-pages/${id}`, {
          method: "PUT", headers: headers(), body: JSON.stringify(body),
        });
      }
      const pubRes = await fetch(`${API_URL}/reception-pages/${id}/publish`, {
        method: "POST", headers: headers(),
      });
      const pubResult = await pubRes.json();
      if (pubResult.success) {
        const url = pubResult.data.shareUrl as string;
        setShareUrl(url);
        setEditMode(null);
        try { sessionStorage.removeItem("reception_draft"); } catch {}
        pushToast({ type: "publish", title: "Published!", message: "Your reception invitation is now live", shareUrl: url });
      } else {
        pushToast({ type: "info", title: "Publish failed", message: "Please try again" });
      }
    } catch {
      pushToast({ type: "info", title: "Publish failed", message: "Please try again" });
    } finally {
      setPublishing(false);
    }
  }, [isAuthenticated, accessToken, pageId, content, pagePassword, headers, pushToast]);

  // Auto-publish after login when pendingPublishRef is set
  useEffect(() => {
    if (!isAuthenticated || !accessToken || !pendingPublishRef.current) return;
    const { data, password } = pendingPublishRef.current;
    pendingPublishRef.current = null;
    const authHeaders = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      ...(IS_NGROK ? { "ngrok-skip-browser-warning": "true" } : {}),
    };
    (async () => {
      setPublishing(true);
      try {
        const body = {
          brideName: data.brideName, groomName: data.groomName,
          receptionDate: data.receptionDate, venue: data.venue,
          venueAddress: data.venueAddress, venueMapQuery: data.venueMapQuery,
          venueTimings: data.venueTimings, tagline: data.tagline,
          heroImage: data.heroImage, bride: data.bride, groom: data.groom,
          families: data.families, galleryImages: data.galleryImages,
          sharePhoto: data.sharePhoto || "",
          password: password || "",
        };
        const res = await fetch(`${API_URL}/reception-pages`, {
          method: "POST", headers: authHeaders, body: JSON.stringify(body),
        });
        const result = await res.json();
        if (!result.success) throw new Error("Create failed");
        const id = result.data._id as string;
        setPageId(id);
        const pubRes = await fetch(`${API_URL}/reception-pages/${id}/publish`, {
          method: "POST", headers: authHeaders,
        });
        const pubResult = await pubRes.json();
        if (pubResult.success) {
          const url = pubResult.data.shareUrl as string;
          setShareUrl(url);
          setEditMode(null);
          try { sessionStorage.removeItem("reception_draft"); } catch {}
          pushToast({ type: "publish", title: "Published!", message: "Your reception invitation is now live", shareUrl: url });
        }
      } catch {
        pushToast({ type: "info", title: "Publish failed", message: "Please try again" });
      } finally {
        setPublishing(false);
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, accessToken]);

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

    setEditMode, setEditModeFromSheet, setAiName, setAiSender, setAiPrompt, setManualStep,
    setPagePassword, setShowPwValue, setMf,
    updateMf, bulkUpdateMf, handleTabChange,

    goBack, closeAuth, closeAuthSuccess, closeShareSheet,
    handleEditClick, handleEditFromPreview, startAiTextMode, startAiCardMode, startManualMode,
    handleAiGenerate, handleCardExtract, handleAiEditPreview, handleManualPreview,
    handleConfirmSave, handlePasswordDone, handleDiscardPreview,
    handlePublish, handleCopy, handleShare,
    pushToast, dismissToast,

    showPublish: isPersonalized && !shareUrl && !publishing,
    showShare: !!shareUrl,
    shareLabel: copied ? "Copied!" : "Share",
  };
}
