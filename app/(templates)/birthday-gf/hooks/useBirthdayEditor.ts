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
import { EVENTS } from "@/lib/analytics/events";
import { track } from "@/lib/analytics/track";
import { ensurePublishAllowed } from "@/lib/paywall/publishRequest";
import { useDraft } from "@/lib/draft/useDraft";
import { useResumeDraft } from "@/lib/draft/resume";
import { requestFeedback } from "@/lib/feedback/feedbackBus";

/** Slug reported on every analytics event from this editor. */
const TEMPLATE = "birthday-gf";

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

  // Holds draft data when user tries to publish without being authenticated
  const pendingPublishRef = useRef<{ data: BirthdayData; password: string } | null>(null);

  // Game data from DB (persisted across refreshes)
  const [gameResponsesFromDB, setGameResponsesFromDB] = useState<Record<string, unknown>[]>([]);
  const [quizAttemptsFromDB, setQuizAttemptsFromDB]   = useState<{ score: number; total: number; playedAt: string }[]>([]);

  // Load existing page from searchParams or sessionStorage prefill/draft
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
              sharePhoto:         d.sharePhoto         || "",
            }));
            setPageId(id);
            setIsPersonalized(true);
            if (d.isPublished) {
              if (d.shareUrl) setShareUrl(String(d.shareUrl));
            } else {
              setShareUrl(null);
            }
            if (Array.isArray(d.gameResponses)) setGameResponsesFromDB(d.gameResponses);
            if (Array.isArray(d.quizAttempts))  setQuizAttemptsFromDB(d.quizAttempts);
          }
        })
        .catch(() => {});
      return; // skip sessionStorage when loading from backend
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
      return;
    }

    // Restore completed draft: user filled the form and saved preview but hasn't published yet
    try {
      const saved = sessionStorage.getItem("birthday_gf_draft");
      if (saved) {
        const draft = JSON.parse(saved);
        if (draft?.completed && draft.data?.recipientName) {
          setContent(draft.data);
          setMf(draft.data);
          setIsPersonalized(true);
          if (draft.password) setPagePassword(draft.password);
        }
      }
    } catch {}
  }, [isAuthenticated, accessToken, searchParams]);

  // After successful auth: if there's a pending draft, save it + auto-publish
  useEffect(() => {
    if (!isAuthenticated || !accessToken || !pendingPublishRef.current) return;

    const { data, password } = pendingPublishRef.current;
    pendingPublishRef.current = null;

    const authHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      ...(IS_NGROK ? { "ngrok-skip-browser-warning": "true" } : {}),
    };

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
      sharePhoto:         data.sharePhoto         || "",
      password:           password || "",
    };

    setSaving(true);
    setPublishing(true);
    setEditMode(null);

    (async () => {
      try {
        const res = await fetch(`${API_URL}/birthday-gf-pages`, {
          method: "POST",
          headers: authHeaders,
          body: JSON.stringify(body),
        });
        const result = await res.json();
        if (!result.success) throw new Error("Save failed");

        const savedId = result.data._id as string;
        setPageId(savedId);
        setContent(data);
        setIsPersonalized(true);
        setShareUrl(null);

        // Clear the paywall BEFORE publishing, so nothing spins behind the sheet,
        // and the publish request is only made when it will succeed.
        const gate = await ensurePublishAllowed(
          { slug: TEMPLATE, templateType: "birthday", pageId: savedId, templateTitle: "Happy Birthday My Love" },
          setPublishing,
        );
        if (gate === "cancelled") return;

        const pubRes = await fetch(`${API_URL}/birthday-gf-pages/${savedId}/publish`, { method: "POST", headers: authHeaders, });
        const pubResult = await pubRes.json();
        if (pubResult.success) {
          const url = pubResult.data.shareUrl as string;
          setShareUrl(url);
          try { sessionStorage.removeItem("birthday_gf_draft"); } catch {}
          pushToast({
            type: "publish",
            title: "Published! 🎂",
            message: "Your birthday page is now live",
            shareUrl: url,
          });
        } else {
          pushToast({ type: "info", title: "Publish failed", message: "Saved — tap Publish to go live" });
        }
      } catch {
        pushToast({ type: "info", title: "Save failed", message: "Please try again" });
      } finally {
        setSaving(false);
        setPublishing(false);
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, accessToken]);

  // Auto-save WIP draft to sessionStorage while user is filling the form
  useEffect(() => {
    if (editMode !== "manual" && editMode !== "ai-review") return;
    try {
      sessionStorage.setItem(
        "birthday_gf_draft",
        JSON.stringify({ data: mf, step: manualStep, completed: false }),
      );
    } catch {}
  }, [mf, manualStep, editMode]);

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
  const closeAuth = useCallback(() => {
    setShowAuth(false);
    pendingPublishRef.current = null; // discard draft if user dismisses auth
  }, []);

  const closeAuthSuccess = useCallback(() => {
    setShowAuth(false);
    // If no pending draft, open the edit sheet as normal
    // If there IS a pending draft, the useEffect handles save+publish automatically
    if (!pendingPublishRef.current) {
      setEditMode("choose");
    }
  }, []);

  const handleEditClick = useCallback(() => {
    preEditContentRef.current = content;
    setEditMode("choose");
  }, [content]);

  const startAiMode = useCallback(() => {
    setAiName(isPersonalized ? content.recipientName : "");
    setAiSender(isPersonalized ? content.senderName : "");
    setAiPrompt("");
    setEditMode("ai");
  }, [isPersonalized, content.recipientName, content.senderName]);

  const startManualMode = useCallback(() => {
    let initialData: BirthdayData = isPersonalized ? { ...content } : { ...DEMO_DATA };
    let initialStep = 0;
    // Restore WIP draft if one exists and isn't a completed preview
    try {
      const saved = sessionStorage.getItem("birthday_gf_draft");
      if (saved) {
        const draft = JSON.parse(saved);
        if (draft?.data && !draft.completed) {
          initialData = draft.data;
          initialStep = typeof draft.step === "number" ? draft.step : 0;
        }
      }
    } catch {}
    setMf(initialData);
    setManualStep(initialStep);
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
        sharePhoto:         data.sharePhoto         || "",
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

  // Step 8: save locally as preview — no backend, no auth required
  const handleManualSave = useCallback(
    (data: BirthdayData, pw: string) => {
      setContent(data);
      setMf(data);
      setIsPersonalized(true);
      setPagePassword(pw);
      setEditMode(null);
      setPendingContent(null);
      try {
        sessionStorage.setItem(
          "birthday_gf_draft",
          JSON.stringify({ data, password: pw, completed: true }),
        );
      } catch {}
    },
    [],
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

  // ── Reopening from the profile ────────────────────────────────────────────
  //
  // This editor ignored `?edit=<id>` entirely, so the profile's Edit button
  // opened it on demo content — and saving from there overwrote the user's page
  // with a fresh one. Nothing about that was visible: no error, no empty state,
  // just the wrong page.
  //
  // The fields come from DEMO_DATA rather than a hand-written list, so a field
  // added to this template later survives a reopen without anyone remembering.
  useResumeDraft({
    base: `${API_URL}/birthday-gf-pages`,
    editId: searchParams.get("edit"),
    accessToken,
    defaults: DEMO_DATA,
    onLoaded: (data, id) => {
      setContent(data);
      setMf({ ...data });
      setPageId(id);
      setIsPersonalized(true);
    },
  });

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
    // This one already answers with the id rather than a result envelope, which
    // is the shape `persist` wants — nothing to unwrap.
    persist: (d) => saveToServer(d, pagePassword),
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
    track(EVENTS.PUBLISH_CLICKED, { template: TEMPLATE, is_authenticated: isAuthenticated });
    // Not authenticated: store draft and show auth modal
    if (!isAuthenticated || !accessToken) {
      track(EVENTS.AUTH_REQUIRED, { template: TEMPLATE });
      pendingPublishRef.current = { data: content, password: pagePassword };
      setShowAuth(true);
      return;
    }
    setPublishing(true);
    try {
      let id = pageId;
      // If data not yet on backend (user filled form without being logged in), create it first
      if (!id) {
        const body = {
          recipientName:      content.recipientName,
          senderName:         content.senderName,
          birthdayDate:       content.birthdayDate,
          birthdayWish:       content.birthdayWish,
          personalMessage:    content.personalMessage,
          homeCoverPhoto:     content.homeCoverPhoto,
          homePhoto1:         content.homePhoto1 || "",
          homePhoto2:         content.homePhoto2 || "",
          galleryPhotos:      content.galleryPhotos      || [],
          musicTracks:        content.musicTracks        || [],
          quizQuestions:      content.quizQuestions      || [],
          truthDareQuestions: content.truthDareQuestions || [],
          surprisePhoto:      content.surprisePhoto      || "",
          surpriseAudioUrl:   content.surpriseAudioUrl   || "",
          sharePhoto:         content.sharePhoto         || "",
          password:           pagePassword || "",
        };
        const res = await fetch(`${API_URL}/birthday-gf-pages`, {
          method: "POST",
          headers: headers(),
          body: JSON.stringify(body),
        });
        const result = await res.json();
        if (!result.success) throw new Error("Save failed");
        id = result.data._id as string;
        setPageId(id);
      }
      // Clear the paywall BEFORE publishing, so nothing spins behind the sheet,
      // and the publish request is only made when it will succeed.
      const gate = await ensurePublishAllowed(
        { slug: TEMPLATE, templateType: "birthday", pageId: id, templateTitle: "Happy Birthday My Love" },
        setPublishing,
      );
      if (gate === "cancelled") return;

      const pubRes = await fetch(`${API_URL}/birthday-gf-pages/${id}/publish`, { method: "POST", headers: headers(), });
      const pubResult = await pubRes.json();
      if (pubResult.success) {
        const url = pubResult.data.shareUrl as string;
        setShareUrl(url);
        try { sessionStorage.removeItem("birthday_gf_draft"); } catch {}
        track(EVENTS.PUBLISH_SUCCESS, { template: TEMPLATE, source: "direct" });
        // Ask how it went, before this editor's own "Published!" panel takes
        // over. Unlike most templates it does not raise the house share sheet,
        // so the interception inside `openShareSheet` never runs here — see
        // lib/feedback/feedbackBus. Asking twice is impossible: the bus marks
        // the page the moment it raises, and this is a no-op if it already has.
        requestFeedback({ templateSlug: TEMPLATE, pageUrl: url }, () => {});
        pushToast({
          type: "publish",
          title: "Published! 🎂",
          message: "Your birthday page is now live",
          shareUrl: url,
        });
      } else {
        track(EVENTS.PUBLISH_FAILED, {
          template: TEMPLATE,
          reason: typeof pubResult?.error === "string" ? pubResult.error : "publish_rejected",
        });
        pushToast({ type: "info", title: "Publish failed", message: "Please try again" });
      }
    } catch {
      track(EVENTS.PUBLISH_FAILED, { template: TEMPLATE, reason: "network_error" });
      pushToast({ type: "info", title: "Publish failed", message: "Please try again" });
    } finally {
      setPublishing(false);
    }
  }, [isAuthenticated, accessToken, pageId, content, pagePassword, headers, pushToast]);

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
