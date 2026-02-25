"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { type TabId, type EditMode, type Toast, type WeddingData, DEMO_DATA } from "../components/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// ── Helper: map DB fields → WeddingData ────────────────────────────────────────
function dbToWeddingData(d: Record<string, unknown>): WeddingData {
  return {
    ...DEMO_DATA,
    brideName: (d.brideName as string) || "",
    groomName: (d.groomName as string) || "",
    weddingDate: (d.weddingDate as string) || DEMO_DATA.weddingDate,
    venue: (d.venue as string) || DEMO_DATA.venue,
    blessing: (d.blessing as string) || DEMO_DATA.blessing,
    bride: {
      ...DEMO_DATA.bride,
      name: (d.brideName as string) || DEMO_DATA.bride.name,
      photo: (d.bridePhoto as string) || "",
      description: (d.brideDescription as string) || DEMO_DATA.bride.description,
      tags: (d.brideTags as { emoji: string; label: string }[]) || DEMO_DATA.bride.tags,
    },
    groom: {
      ...DEMO_DATA.groom,
      name: (d.groomName as string) || DEMO_DATA.groom.name,
      photo: (d.groomPhoto as string) || "",
      description: (d.groomDescription as string) || DEMO_DATA.groom.description,
      tags: (d.groomTags as { emoji: string; label: string }[]) || DEMO_DATA.groom.tags,
    },
    brideFamily: {
      title: "Bride's Family",
      parents: (d.brideFamilyParents as string) || DEMO_DATA.brideFamily.parents,
      grandparents: (d.brideFamilyGrandparents as string) || DEMO_DATA.brideFamily.grandparents,
    },
    groomFamily: {
      title: "Groom's Family",
      parents: (d.groomFamilyParents as string) || DEMO_DATA.groomFamily.parents,
      grandparents: (d.groomFamilyGrandparents as string) || DEMO_DATA.groomFamily.grandparents,
    },
    events: (d.events as WeddingData["events"]) || DEMO_DATA.events,
    galleryImages: ((d.galleryImages as { src: string; alt: string }[]) || []).map((g, i) => ({
      src: g.src,
      alt: g.alt || `Photo ${i + 1}`,
      span: i === 0 ? "col-span-2 row-span-2" : i === 3 ? "col-span-2" : "",
    })),
    wishes: (d.blessings as { name: string; message: string }[]) || DEMO_DATA.wishes,
  };
}

// ── Helper: WeddingData → DB body ─────────────────────────────────────────────
function weddingDataToBody(data: WeddingData, password?: string) {
  return {
    brideName: data.brideName,
    groomName: data.groomName,
    weddingDate: data.weddingDate,
    venue: data.venue,
    blessing: data.blessing,
    bridePhoto: data.bride.photo,
    brideDescription: data.bride.description,
    brideTags: data.bride.tags,
    brideFamilyParents: data.brideFamily.parents,
    brideFamilyGrandparents: data.brideFamily.grandparents,
    groomPhoto: data.groom.photo,
    groomDescription: data.groom.description,
    groomTags: data.groom.tags,
    groomFamilyParents: data.groomFamily.parents,
    groomFamilyGrandparents: data.groomFamily.grandparents,
    events: data.events,
    galleryImages: data.galleryImages.map((g) => ({ src: g.src, alt: g.alt })),
    password: password || "",
  };
}

export function useWeddingEditor() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, accessToken } = useAppSelector((s) => s.auth);

  const [darkMode, setDarkMode] = useState(true);
  const [themeReady, setThemeReady] = useState(false);
  const toggleDark = useCallback(() => setDarkMode((d) => !d), []);

  useEffect(() => {
    const saved = localStorage.getItem("wedding-shaadi-theme");
    if (saved) {
      // User previously changed theme within this template — respect it
      setDarkMode(saved === "dark");
    } else {
      // First visit — match the user's global app theme preference
      const global = localStorage.getItem("theme"); // set by next-themes
      setDarkMode(global !== "light"); // dark unless user explicitly chose light
    }
    setThemeReady(true);
  }, []);

  useEffect(() => {
    if (!themeReady) return;
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
      localStorage.setItem("wedding-shaadi-theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("wedding-shaadi-theme", "light");
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
  const [content, setContent] = useState<WeddingData>(DEMO_DATA);
  const [isPersonalized, setIsPersonalized] = useState(false);
  const [pageId, setPageId] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [shareId, setShareId] = useState<string | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [copied, setCopied] = useState(false);

  const [editMode, setEditMode] = useState<EditMode>(null);
  const [pendingContent, setPendingContent] = useState<WeddingData | null>(null);
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
  const [aiEditData, setAiEditData] = useState<WeddingData | null>(null);

  const [mf, setMf] = useState<WeddingData>({ ...DEMO_DATA });
  const [manualStep, setManualStep] = useState(0);
  const preEditContentRef = useRef<WeddingData>(DEMO_DATA);

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

  // Load existing page for editing (?edit=<id>)
  useEffect(() => {
    const editId = searchParams.get("edit");
    if (!editId || !accessToken || !themeReady) return;
    fetch(`${API_URL}/wedding-pages/${editId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then((r) => r.json())
      .then((result) => {
        if (result.success && result.data) {
          const loaded = dbToWeddingData(result.data as Record<string, unknown>);
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
  const closeAuthSuccess = useCallback(() => {
    setShowAuth(false);
    setEditMode("choose");
  }, []);

  const handleEditClick = useCallback(() => {
    if (!isAuthenticated) { setShowAuth(true); return; }
    setEditMode("choose");
  }, [isAuthenticated]);

  const startAiMode = useCallback(() => {
    setAiName(isPersonalized ? content.brideName : "");
    setAiSender(isPersonalized ? content.groomName : "");
    setAiPrompt("");
    setEditMode("ai");
  }, [isPersonalized, content.brideName, content.groomName]);

  const startManualMode = useCallback(() => {
    setMf(isPersonalized ? { ...content } : { ...DEMO_DATA });
    setManualStep(0);
    setEditMode("manual");
  }, [isPersonalized, content]);

  // ── AI: extract from shaadi card ──────────────────────────────────────────
  const handleCardExtract = useCallback(
    async (files: File[]) => {
      if (files.length === 0) return;
      setExtractLoading(true);
      try {
        // Convert each file to base64
        const images = await Promise.all(
          files.slice(0, 3).map(
            (file) =>
              new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(file);
              }),
          ),
        );

        const res = await fetch(`${API_URL}/wedding-pages/extract-card`, {
          method: "POST",
          headers: headers(),
          body: JSON.stringify({ images }),
        });
        const data = await res.json();

        if (data.success && data.data) {
          const d = data.data as Record<string, unknown>;
          const extracted: WeddingData = {
            ...DEMO_DATA,
            brideName: (d.brideName as string) || "",
            groomName: (d.groomName as string) || "",
            weddingDate: (d.weddingDate as string) || DEMO_DATA.weddingDate,
            venue: (d.venue as string) || "",
            blessing: (d.blessing as string) || DEMO_DATA.blessing,
            bride: {
              ...DEMO_DATA.bride,
              name: (d.brideName as string) || "",
              description: (d.brideDescription as string) || DEMO_DATA.bride.description,
              photo: "",
            },
            groom: {
              ...DEMO_DATA.groom,
              name: (d.groomName as string) || "",
              description: (d.groomDescription as string) || DEMO_DATA.groom.description,
              photo: "",
            },
            brideFamily: {
              title: "Bride's Family",
              parents: (d.brideFamilyParents as string) || "",
              grandparents: (d.brideFamilyGrandparents as string) || "",
            },
            groomFamily: {
              title: "Groom's Family",
              parents: (d.groomFamilyParents as string) || "",
              grandparents: (d.groomFamilyGrandparents as string) || "",
            },
            events: ((d.events as { name: string; date: string; time: string; venue: string }[]) || []).map((ev, i) => ({
              ...DEMO_DATA.events[i] || DEMO_DATA.events[4],
              date: ev.date || "",
              time: ev.time || "",
              venue: ev.venue || "",
            })),
          };
          setAiEditData(extracted);
          setMf(extracted);
          setEditMode("ai-edit");
        } else {
          pushToast({ type: "info", title: "Extraction failed", message: data.error || "Please try again" });
        }
      } catch {
        pushToast({ type: "info", title: "Extraction failed", message: "Could not read the card. Please try manual entry." });
      } finally {
        setExtractLoading(false);
      }
    },
    [headers, pushToast],
  );

  // ── AI: text prompt generate ──────────────────────────────────────────────
  const handleAiGenerate = useCallback(async () => {
    if (!aiName.trim() && !aiSender.trim()) return;
    setAiLoading(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({
          prompt: `Wedding invitation for ${aiName.trim() || "the bride"} & ${aiSender.trim() || "the groom"}. ${aiPrompt}`,
          templateId: "wedding-shaadi",
          templateType: "wedding",
        }),
      });
      const data = await res.json();

      const generated: WeddingData = {
        ...DEMO_DATA,
        brideName: aiName.trim() || DEMO_DATA.brideName,
        groomName: aiSender.trim() || DEMO_DATA.groomName,
        blessing: data.blessing || data.body || DEMO_DATA.blessing,
        bride: {
          ...DEMO_DATA.bride,
          name: aiName.trim() || DEMO_DATA.bride.name,
          photo: mf.bride.photo, // preserve uploaded photo from AiTextPanel
          description: data.brideDescription || data.body || DEMO_DATA.bride.description,
        },
        groom: {
          ...DEMO_DATA.groom,
          name: aiSender.trim() || DEMO_DATA.groom.name,
          photo: mf.groom.photo, // preserve uploaded photo from AiTextPanel
          description: data.groomDescription || data.body || DEMO_DATA.groom.description,
        },
      };

      setAiEditData(generated);
      setMf(generated);
      setEditMode("ai-edit");
    } catch {
      pushToast({ type: "info", title: "Generation failed", message: "Please try again" });
    } finally {
      setAiLoading(false);
    }
  }, [aiName, aiSender, aiPrompt, mf, headers, pushToast]);

  // When user confirms ai-edit, go to manual to fine-tune or preview directly
  const handleAiEditPreview = useCallback(() => {
    setPendingContent(mf);
    setContent((prev) => {
      preEditContentRef.current = prev;
      return mf;
    });
    setEditMode("preview");
  }, [mf]);

  const handleManualPreview = useCallback(() => {
    if (!mf.brideName.trim() && !mf.groomName.trim()) return;
    setPendingContent(mf);
    setContent((prev) => {
      preEditContentRef.current = prev;
      return mf;
    });
    setEditMode("preview");
  }, [mf]);

  const updateMf = useCallback(
    (key: keyof WeddingData, val: unknown) => setMf((p) => ({ ...p, [key]: val })),
    [],
  );

  const saveToServer = useCallback(
    async (data: WeddingData, password?: string) => {
      if (!accessToken) return;
      const body = weddingDataToBody(data, password);

      if (pageId) {
        const res = await fetch(`${API_URL}/wedding-pages/${pageId}`, {
          method: "PUT",
          headers: headers(),
          body: JSON.stringify(body),
        });
        return res.json();
      } else {
        const res = await fetch(`${API_URL}/wedding-pages`, {
          method: "POST",
          headers: headers(),
          body: JSON.stringify(body),
        });
        const result = await res.json();
        if (result.success) {
          setPageId(result.data._id);
          setShareId(result.data.shareId);
        }
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
          message: pw ? "Share the password with guests" : "Your invitation is ready to publish",
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
    setContent(preEditContentRef.current);
    setPendingContent(null);
    setEditMode("choose");
  }, [pendingContent]);

  const handlePublish = useCallback(async () => {
    if (!pageId) return;
    setPublishing(true);
    try {
      const res = await fetch(`${API_URL}/wedding-pages/${pageId}/publish`, {
        method: "POST",
        headers: headers(),
      });
      const result = await res.json();
      if (result.success) {
        const url = result.data.shareUrl;
        setShareUrl(url);
        setShareId(result.data.shareId);
        // Keep pageId so user can edit and republish
        pushToast({
          type: "publish",
          title: "Published! 🎊",
          message: hasPasswordSet ? "Invitation is password-protected" : "Your wedding invitation is now live",
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

  // Add blessing (from editor preview - same page)
  const addBlessing = useCallback(
    async (name: string, message: string) => {
      if (!shareId) return false;
      try {
        const res = await fetch(`${API_URL}/wedding-pages/share/${shareId}/blessings`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, message }),
        });
        const result = await res.json();
        if (result.success) {
          setContent((prev) => ({
            ...prev,
            wishes: result.data.map((b: { name: string; message: string }) => ({ name: b.name, message: b.message })),
          }));
          return true;
        }
      } catch { /* ignore */ }
      return false;
    },
    [shareId],
  );

  return {
    tab, content, editMode, isPersonalized, shareUrl, shareId, copied, showAuth,
    toasts, saving, publishing, pagePassword, showPwValue,
    aiName, aiSender, aiPrompt, aiLoading, extractLoading,
    mf, manualStep, aiEditData,
    darkMode, themeReady, toggleDark,

    setEditMode, setAiName, setAiSender, setAiPrompt, setManualStep,
    setPagePassword, setShowPwValue,
    updateMf, handleTabChange,

    goBack, closeAuth, closeAuthSuccess,
    handleEditClick, startAiMode, startManualMode,
    handleCardExtract, handleAiGenerate, handleAiEditPreview,
    handleManualPreview,
    handleConfirmSave, handlePasswordDone, handleDiscardPreview,
    handlePublish, handleCopy, handleShare,
    pushToast, dismissToast, addBlessing,

    showPublish: isPersonalized && !publishing,
    showShare: !!shareUrl,
    shareLabel: copied ? "Copied!" : "Share",
  };
}
