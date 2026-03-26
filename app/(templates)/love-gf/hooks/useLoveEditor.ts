"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { type ContentData, type TabId, type EditMode, type Toast, DEMO_CONTENT } from "../components/types";
import { API_URL, IS_NGROK } from "@/lib/config";

export function useLoveEditor() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, accessToken } = useAppSelector((s) => s.auth);

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

  const [aiName, setAiName] = useState("");
  const [aiSender, setAiSender] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const [mf, setMf] = useState<ContentData>({ ...DEMO_CONTENT });
  const [manualStep, setManualStep] = useState(0);

  const [publishing, setPublishing] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastIdRef = useRef(0);

  const preEditContentRef = useRef<ContentData>(DEMO_CONTENT);

  // Load existing page from searchParams or sessionStorage prefill
  useEffect(() => {
    const id = searchParams.get("id");
    if (id && isAuthenticated && accessToken) {
      fetch(`${API_URL}/love-gf-pages/${id}`, {
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
              recipientName: d.recipientName || prev.recipientName,
              senderName: d.senderName || prev.senderName,
              personalMessage: d.personalMessage || prev.personalMessage,
              wishMessage: d.wishMessage || prev.wishMessage,
              loveDate: d.loveDate || prev.loveDate,
              galleryPhotos: d.galleryPhotos || [],
            }));
            setPageId(id);
            setIsPersonalized(true);
            if (d.isPublished) {
              if (d.shareUrl) setShareUrl(String(d.shareUrl));
            } else {
              setShareUrl(null);
            }
          }
        })
        .catch(() => {});
    }

    // sessionStorage prefill from viewer
    const prefill = sessionStorage.getItem("love_gf_prefill");
    if (prefill) {
      try {
        const data = JSON.parse(prefill);
        sessionStorage.removeItem("love_gf_prefill");
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
  const goToNotes = useCallback(() => setTab("notes"), []);
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
          prompt: `Love message for ${aiName} from ${aiSender || "your partner"}. ${aiPrompt}`,
          templateId: "love-gf",
          templateType: "love-gf",
        }),
      });
      const data = await res.json();
      if (data.personalMessage || data.body) {
        const newContent: ContentData = {
          ...content,
          recipientName: aiName.trim(),
          senderName: aiSender.trim() || content.senderName,
          personalMessage: data.personalMessage || data.body || content.personalMessage,
          wishMessage: data.wishMessage || content.wishMessage,
        };
        setPendingContent(newContent);
        setContent(newContent);
        setEditMode("preview");
      } else {
        pushToast({ type: "info", title: "Generation failed", message: "Please try again" });
      }
    } catch {
      pushToast({ type: "info", title: "Generation failed", message: "Please try again" });
    } finally {
      setAiLoading(false);
    }
  }, [aiName, aiPrompt, aiSender, headers, content, pushToast]);

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
      const body = {
        recipientName: data.recipientName,
        senderName: data.senderName,
        personalMessage: data.personalMessage,
        wishMessage: data.wishMessage,
        loveDate: data.loveDate,
        galleryPhotos: data.galleryPhotos,
        password: password || "",
      };
      if (pageId) {
        await fetch(`${API_URL}/love-gf-pages/${pageId}`, {
          method: "PUT",
          headers: headers(),
          body: JSON.stringify(body),
        });
      } else {
        const res = await fetch(`${API_URL}/love-gf-pages`, {
          method: "POST",
          headers: headers(),
          body: JSON.stringify(body),
        });
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
        pushToast({
          type: "success",
          title: pw ? "Saved with password!" : "Changes saved!",
          message: pw ? "Share the password with your love" : "Ready to publish ♡",
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
      const res = await fetch(`${API_URL}/love-gf-pages/${pageId}/publish`, {
        method: "POST",
        headers: headers(),
      });
      const result = await res.json();
      if (result.success) {
        const url = result.data.shareUrl;
        setShareUrl(url);
        pushToast({
          type: "publish",
          title: "Published! ♡",
          message: "Your love page is now live",
          shareUrl: url,
        });
      }
    } catch {
      pushToast({ type: "info", title: "Publish failed", message: "Please try again" });
    } finally {
      setPublishing(false);
    }
  }, [pageId, headers, pushToast]);

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

  // Extract shareId from shareUrl (last path segment)
  const shareId = shareUrl ? shareUrl.split("/").pop() ?? null : null;

  return {
    tab, content, editMode, isPersonalized, shareUrl, shareId, copied, showAuth,
    toasts, saving, publishing, pagePassword, showPwValue,
    aiName, aiSender, aiPrompt, aiLoading,
    mf, manualStep,

    setEditMode, setAiName, setAiSender, setAiPrompt, setManualStep,
    setPagePassword, setShowPwValue,
    updateMf, handleTabChange, goToGallery, goToNotes,

    goBack, closeAuth, closeAuthSuccess,
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
