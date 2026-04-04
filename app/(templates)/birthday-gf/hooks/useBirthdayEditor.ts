"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import {
  type BirthdayData,
  type HomeCoverPhoto,
  type PhotoItem,
  type TabId,
  type EditMode,
  type Toast,
  DEMO_DATA,
  EMPTY_HOME_COVER,
  clampHomeCoverCrop,
} from "../components/types";
import { API_URL, IS_NGROK } from "@/lib/config";

function normalizePhoto(p: unknown): PhotoItem {
  if (typeof p === "string") return { url: p, caption: "", cropX: 50, cropY: 50 };
  const obj = p as Record<string, unknown>;
  return {
    url:     String(obj.url     ?? ""),
    caption: String(obj.caption ?? ""),
    cropX:   Number(obj.cropX   ?? 50),
    cropY:   Number(obj.cropY   ?? 50),
  };
}

function normalizeHomeCoverFromApi(raw: unknown): HomeCoverPhoto {
  if (!raw || typeof raw !== "object") return { ...EMPTY_HOME_COVER };
  const o = raw as Record<string, unknown>;
  return clampHomeCoverCrop({
    url:   String(o.url   ?? ""),
    cropX: Number(o.cropX ?? 50),
    cropY: Number(o.cropY ?? 50),
    scale: Number(o.scale ?? 100),
  });
}

export function useBirthdayEditor() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, accessToken } = useAppSelector((s) => s.auth);

  const [tab, setTab] = useState<TabId>("home");
  const [content, setContent] = useState<BirthdayData>(DEMO_DATA);
  const [isPersonalized, setIsPersonalized] = useState(false);
  const [pageId, setPageId] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [copied, setCopied] = useState(false);

  const [editMode, setEditMode] = useState<EditMode>(null);
  const [pendingContent, setPendingContent] = useState<BirthdayData | null>(null);
  const [saving, setSaving] = useState(false);
  const [pagePassword, setPagePassword] = useState("");
  const [showPwValue, setShowPwValue] = useState(false);

  const [aiName, setAiName] = useState("");
  const [aiSender, setAiSender] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const [mf, setMf] = useState<BirthdayData>({ ...DEMO_DATA });
  const [manualStep, setManualStep] = useState(0);

  const [publishing, setPublishing] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastIdRef = useRef(0);

  const preEditContentRef = useRef<BirthdayData>(DEMO_DATA);

  // Game data from DB (persisted across refreshes)
  const [gameResponsesFromDB, setGameResponsesFromDB] = useState<Record<string, unknown>[]>([]);
  const [quizAttemptsFromDB, setQuizAttemptsFromDB]   = useState<{ score: number; total: number; playedAt: string }[]>([]);

  // Load existing page from searchParams or sessionStorage prefill
  useEffect(() => {
    const id = searchParams.get("id");
    if (id && isAuthenticated && accessToken) {
      fetch(`${API_URL}/birthday-gf-pages/${id}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          ...(IS_NGROK ? { "ngrok-skip-browser-warning": "true" } : {}),
        },
      })
        .then((r) => r.json())
        .then((result) => {
          if (result.success && result.data) {
            const d = result.data;
            setContent((prev) => ({
              ...prev,
              recipientName:      d.recipientName      || prev.recipientName,
              senderName:         d.senderName         || prev.senderName,
              personalMessage:    d.personalMessage    || prev.personalMessage,
              birthdayWish:       d.birthdayWish       || prev.birthdayWish,
              birthdayDate:       d.birthdayDate       || prev.birthdayDate,
              homeCoverPhoto:     normalizeHomeCoverFromApi(d.homeCoverPhoto),
              homePhoto1:         d.homePhoto1         || "",
              homePhoto2:         d.homePhoto2         || "",
              galleryPhotos:      (d.galleryPhotos  || []).map(normalizePhoto),
              musicTracks:        d.musicTracks        || [],
              quizQuestions:      d.quizQuestions      || [],
              truthDareQuestions: d.truthDareQuestions || [],
              surprisePhoto:      d.surprisePhoto      || "",
              surpriseAudioUrl:   d.surpriseAudioUrl   || "",
            }));
            setPageId(id);
            setIsPersonalized(true);
            if (d.isPublished) {
              if (d.shareUrl) setShareUrl(String(d.shareUrl));
            } else {
              setShareUrl(null);
            }
            // Persist game data across refreshes
            if (Array.isArray(d.gameResponses)) setGameResponsesFromDB(d.gameResponses);
            if (Array.isArray(d.quizAttempts))  setQuizAttemptsFromDB(d.quizAttempts);
          }
        })
        .catch(() => {});
    }

    // sessionStorage prefill from viewer
    const prefill = sessionStorage.getItem("birthday_gf_prefill");
    if (prefill) {
      try {
        const data = JSON.parse(prefill);
        sessionStorage.removeItem("birthday_gf_prefill");
        setContent((prev) => ({ ...prev, ...data }));
        setMf((prev) => ({ ...prev, ...data }));
        if (isAuthenticated) setEditMode("manual");
      } catch {}
    }
  }, [isAuthenticated, accessToken, searchParams]);

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
  const goToGallery = useCallback(() => setTab("gallery"), []);
  const goBack = useCallback(() => router.push("/templates"), [router]);
  const closeAuth = useCallback(() => setShowAuth(false), []);

  const closeAuthSuccess = useCallback(() => {
    setShowAuth(false);
    setEditMode("choose");
  }, []);

  const handleEditClick = useCallback(() => {
    if (!isAuthenticated) { setShowAuth(true); return; }
    preEditContentRef.current = content;
    setEditMode("choose");
  }, [isAuthenticated, content]);

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

  const saveToServer = useCallback(
    async (data: BirthdayData, password?: string): Promise<string | null> => {
      if (!accessToken) return null;
      const body = {
        recipientName:      data.recipientName,
        senderName:         data.senderName,
        birthdayDate:       data.birthdayDate,
        birthdayWish:       data.birthdayWish,
        personalMessage:    data.personalMessage,
        homeCoverPhoto:     data.homeCoverPhoto,
        homePhoto1:         data.homePhoto1 || "",
        homePhoto2:         data.homePhoto2 || "",
        galleryPhotos:      data.galleryPhotos      || [],
        musicTracks:        data.musicTracks        || [],
        quizQuestions:      data.quizQuestions      || [],
        truthDareQuestions: data.truthDareQuestions || [],
        surprisePhoto:      data.surprisePhoto      || "",
        surpriseAudioUrl:   data.surpriseAudioUrl   || "",
        password:           password || "",
      };
      if (pageId) {
        await fetch(`${API_URL}/birthday-gf-pages/${pageId}`, {
          method: "PUT",
          headers: headers(),
          body: JSON.stringify(body),
        });
        return pageId;
      } else {
        const res = await fetch(`${API_URL}/birthday-gf-pages`, {
          method: "POST",
          headers: headers(),
          body: JSON.stringify(body),
        });
        const result = await res.json();
        if (result.success) {
          setPageId(result.data._id);
          return result.data._id as string;
        }
        return null;
      }
    },
    [accessToken, pageId, headers],
  );

  // Direct save — shows PublishSheet after success (called from EditSheet final step)
  const handleManualSave = useCallback(
    async (data: BirthdayData, pw: string) => {
      setSaving(true);
      try {
        const savedId = await saveToServer(data, pw);
        if (!savedId) {
          pushToast({ type: "info", title: "Save failed", message: "Please log in and try again" });
          return;
        }
        setContent(data);
        setIsPersonalized(true);
        setShareUrl(null);
        setEditMode(null);
        setPendingContent(null);
        // Show the publish sheet so the user can publish (payment gate can be added here later)
        setShowPublishSheet(true);
      } catch {
        pushToast({ type: "info", title: "Save failed", message: "Please try again" });
      } finally {
        setSaving(false);
      }
    },
    [saveToServer, pushToast],
  );

  const handleAiGenerate = useCallback(async () => {
    if (!aiName.trim() || !aiPrompt.trim()) return;
    setAiLoading(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({
          prompt: `Birthday message for ${aiName} from ${aiSender || "your friend"}. ${aiPrompt}`,
          templateId: "birthday-gf",
          templateType: "birthday-gf",
        }),
      });
      const data = await res.json();
      if (data.personalMessage || data.body) {
        const newContent: BirthdayData = {
          ...content,
          recipientName:   aiName.trim(),
          senderName:      aiSender.trim() || content.senderName,
          personalMessage: data.personalMessage || data.body || content.personalMessage,
          birthdayWish:    data.birthdayWish || data.wishMessage || content.birthdayWish,
          quizQuestions:   data.quizQuestions || content.quizQuestions || [],
          truthDareQuestions: [
            ...(data.truthQuestions || []).map((text: string) => ({ type: "truth" as const, text })),
            ...(data.dareQuestions || []).map((text: string) => ({ type: "dare" as const, text })),
            ...(content.truthDareQuestions || []),
          ].slice(0, 20),
        };
        setMf(newContent);
        setManualStep(0);
        setEditMode("ai-review");
      } else {
        pushToast({ type: "info", title: "Generation failed", message: "Please try again" });
      }
    } catch {
      pushToast({ type: "info", title: "Generation failed", message: "Please try again" });
    } finally {
      setAiLoading(false);
    }
  }, [aiName, aiPrompt, aiSender, headers, content, pushToast]);

  const updateMf = useCallback(
    (key: keyof BirthdayData, val: unknown) => setMf((p) => ({ ...p, [key]: val })),
    [],
  );

  // Legacy preview/password flow (kept for compatibility)
  const handleManualPreview = useCallback(() => {
    if (!mf.recipientName.trim()) return;
    setPendingContent(mf);
    setContent(mf);
    setEditMode("preview");
  }, [mf]);

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
        pushToast({
          type: "success",
          title: pw ? "Saved with password!" : "Changes saved!",
          message: pw ? "Share the password with your friend" : "Ready to publish 🎂",
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
      const res = await fetch(`${API_URL}/birthday-gf-pages/${pageId}/publish`, {
        method: "POST",
        headers: headers(),
      });
      const result = await res.json();
      if (result.success) {
        const url = result.data.shareUrl;
        setShareUrl(url);
        pushToast({
          type: "publish",
          title: "Published! 🎂",
          message: "Your birthday page is now live",
          shareUrl: url,
        });
      }
    } catch {
      pushToast({ type: "info", title: "Publish failed", message: "Please try again" });
    } finally {
      setPublishing(false);
    }
  }, [pageId, headers, pushToast]);

  const [showShareSheet, setShowShareSheet] = useState(false);
  const [showPublishSheet, setShowPublishSheet] = useState(false);

  const handleCopy = useCallback(
    (url?: string) => {
      const link = url || shareUrl;
      if (link) {
        navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        if (!url) pushToast({ type: "success", title: "Link copied!", message: "Share link is on your clipboard." });
      }
    },
    [shareUrl, pushToast],
  );

  const handleShare = useCallback(() => {
    if (shareUrl) setShowShareSheet(true);
  }, [shareUrl]);

  // Extract shareId from shareUrl (last path segment)
  const shareId = shareUrl ? shareUrl.split("/").pop() ?? null : null;

  return {
    tab, content, editMode, isPersonalized, shareUrl, shareId, copied, showAuth,
    toasts, saving, publishing, pagePassword, showPwValue,
    aiName, aiSender, aiPrompt, aiLoading,
    mf, manualStep, pendingContent,
    showShareSheet, setShowShareSheet,
    showPublishSheet, setShowPublishSheet,

    setEditMode, setAiName, setAiSender, setAiPrompt, setManualStep,
    setPagePassword, setShowPwValue,
    updateMf, handleTabChange, goToGallery,

    goBack, closeAuth, closeAuthSuccess,
    handleEditClick, startAiMode, startManualMode,
    handleAiGenerate, handleManualPreview, handleManualSave,
    handleConfirmSave, handlePasswordDone, handleDiscardPreview,
    handlePublish, handleCopy, handleShare,
    pushToast, dismissToast,

    gameResponsesFromDB, quizAttemptsFromDB,

    showPublish: isPersonalized && !shareUrl && !publishing,
    showShare: !!shareUrl,
    shareLabel: copied ? "Copied!" : "Share",
  };
}
