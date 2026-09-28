"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { type ContentData, type HomeCoverPhoto, type PhotoItem, type TabId, type EditMode, DEMO_CONTENT, EMPTY_HOME_COVER, clampHomeCoverCrop } from "../components/types";
import { API_URL, IS_NGROK } from "@/lib/config";
import { EVENTS } from "@/lib/analytics/events";
import { track } from "@/lib/analytics/track";
import { useStoryFill } from "@/hooks/useStoryFill";
import { ensurePublishAllowed } from "@/lib/paywall/publishRequest";
import { useDraft } from "@/lib/draft/useDraft";
import { useToast } from "@/lib/toast/useToast";
import { openShareSheet } from "@/lib/share/shareBus";
import { useResumeDraft } from "@/lib/draft/resume";
import { clearScratch } from "@/lib/draft/localScratch";

/** Slug reported on every analytics event from this editor. */
const TEMPLATE = "darling";

function normalizePhoto(p: unknown): PhotoItem {
  if (typeof p === "string") return { url: p, letter: "", cropX: 50, cropY: 50 };
  const obj = p as Record<string, unknown>;
  return {
    url:    String(obj.url    ?? ""),
    letter: String(obj.letter ?? ""),
    cropX:  Number(obj.cropX  ?? 50),
    cropY:  Number(obj.cropY  ?? 50),
  };
}

function normalizeHomeCoverFromApi(raw: unknown): HomeCoverPhoto {
  if (!raw || typeof raw !== "object") return { ...EMPTY_HOME_COVER };
  const o = raw as Record<string, unknown>;
  return clampHomeCoverCrop({
    url: String(o.url ?? ""),
    cropX: Number(o.cropX ?? 50),
    cropY: Number(o.cropY ?? 50),
    scale: Number(o.scale ?? 100),
  });
}

export function useDarlingEditor() {
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
  /** A half-filled form is sitting in storage (saved as the user typed). */
  const [hasWipDraft, setHasWipDraft] = useState(false);
  const [clearing, setClearing] = useState(false);

  // ── AI story fill ──────────────────────────────────────────────────────────
  // Completely inert when the server has no schema for this slug: `schema`
  // stays null, StoryStarter renders nothing, and the entry points below fall
  // straight back to the sheet this editor has always shown.
  const storyFill = useStoryFill<ContentData>({
    slug: "darling",
    demo: DEMO_CONTENT,
    current: mf,
    onFilled: setMf,
  });
  const { schema: storySchema, setMode: setStoryMode, persistStory } = storyFill;
  const [storyStarted, setStoryStarted] = useState(false);

  const [publishing, setPublishing] = useState(false);
  const { pushToast } = useToast();

  // Tracks when form is opened FROM preview — closing form returns to preview
  const fromPreviewRef = useRef(false);

  const preEditContentRef = useRef<ContentData>(DEMO_CONTENT);

  // Holds draft data when user tries to publish without being authenticated
  const pendingPublishRef = useRef<{ data: ContentData; password: string } | null>(null);
  // Set when the post-sign-in effect takes the pending publish. The effect runs
  // on the auth flip, BEFORE AuthModal's onSuccess, so by the time
  // closeAuthSuccess looks, pendingPublishRef is already empty and it used to
  // read that as "nothing to publish" and open the write-it / AI chooser over
  // the page that was publishing.
  const resumedPublishRef = useRef(false);
  /**
   * True while the auth-deferred publish below is creating the row.
   *
   * Adoption in `useDraft` answers the same event — a token appearing — and
   * used to POST a row of its own, leaving a duplicate behind as a draft. This
   * tells it to stand down. A ref because both effects run in the same commit,
   * so a state flag would still read as the previous render's value.
   */
  const publishInFlightRef = useRef(false);

  // Game data from DB (persisted across refreshes)
  const [gameResponsesFromDB, setGameResponsesFromDB] = useState<Record<string, unknown>[]>([]);
  const [quizAttemptsFromDB, setQuizAttemptsFromDB]   = useState<{ score: number; total: number; playedAt: string }[]>([]);

  // Load existing page from searchParams or sessionStorage prefill/draft
  useEffect(() => {
    const id = searchParams.get("id");
    if (id && isAuthenticated && accessToken) {
      fetch(`${API_URL}/darling-pages/${id}`, {
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
              recipientName:   d.recipientName   || prev.recipientName,
              senderName:      d.senderName      || prev.senderName,
              personalMessage: d.personalMessage || prev.personalMessage,
              wishMessage:     d.wishMessage     || prev.wishMessage,
              loveDate:        d.loveDate        || prev.loveDate,
              homeCoverPhoto:   normalizeHomeCoverFromApi(d.homeCoverPhoto),
              homePhotos:         Array.isArray(d.homePhotos) ? d.homePhotos : [],
              galleryPhotos:      (d.galleryPhotos  || []).map(normalizePhoto),
              quizQuestions:      d.quizQuestions      || [],
              truthDareQuestions: d.truthDareQuestions || [],
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
    const prefill = sessionStorage.getItem("darling_prefill");
    if (prefill) {
      try {
        const data = JSON.parse(prefill);
        sessionStorage.removeItem("darling_prefill");
        setContent((prev) => ({ ...prev, ...data }));
        setMf((prev) => ({ ...prev, ...data }));
        if (isAuthenticated) setEditMode("manual");
      } catch {}
      return;
    }

    // Restore completed draft: user filled form + saved preview but hasn't published yet
    try {
      const saved = sessionStorage.getItem("darling_draft");
      if (saved) {
        const draft = JSON.parse(saved);
        if (draft?.completed && draft.data?.recipientName) {
          setContent(draft.data);
          setMf(draft.data);
          setIsPersonalized(true);
          if (draft.password) setPagePassword(draft.password);
        } else if (draft?.data && !draft.completed) {
          setHasWipDraft(true);
        }
      }
    } catch {}
  }, [isAuthenticated, accessToken, searchParams]);

  // After successful auth: if there's a pending publish, save to backend + publish automatically
  useEffect(() => {
    if (!isAuthenticated || !accessToken || !pendingPublishRef.current) return;

    const { data, password } = pendingPublishRef.current;
    pendingPublishRef.current = null;
    resumedPublishRef.current = true;
    // We own the row from here; adoption stands down (see useDraft).
    publishInFlightRef.current = true;

    const authHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      ...(IS_NGROK ? { "ngrok-skip-browser-warning": "true" } : {}),
    };

    const body = {
      recipientName:      data.recipientName,
      senderName:         data.senderName,
      personalMessage:    data.personalMessage,
      wishMessage:        data.wishMessage,
      loveDate:           data.loveDate,
      homeCoverPhoto:     data.homeCoverPhoto,
      homePhotos:         data.homeCoverPhoto?.url?.trim() ? [] : (data.homePhotos || []),
      galleryPhotos:      data.galleryPhotos      || [],
      quizQuestions:      data.quizQuestions      || [],
      truthDareQuestions: data.truthDareQuestions || [],
      sharePhoto:         data.sharePhoto         || "",
      password:           password || "",
    };

    setSaving(true);
    setPublishing(true);
    setEditMode(null);

    (async () => {
      try {
        const res = await fetch(`${API_URL}/darling-pages`, {
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
          { slug: TEMPLATE, templateType: "darling", pageId: savedId, templateTitle: "My Darling" },
          setPublishing,
        );
        if (gate === "cancelled") return;

        const pubRes = await fetch(`${API_URL}/darling-pages/${savedId}/publish`, { method: "POST", headers: authHeaders, });
        const pubResult = await pubRes.json();
        if (pubResult.success) {
          const url = pubResult.data.shareUrl as string;
          setShareUrl(url);
          setEditMode(null); // published — no editor sheet stays open over it
          await persistStory();
          setEditMode(null);
          try { sessionStorage.removeItem("darling_draft"); } catch {}
          pushToast({ type: "publish", title: "Published! ♡", message: "Tap Share to send it" });
        } else {
          pushToast({ type: "info", title: "Publish failed", message: "Saved — tap Publish to go live" });
        }
      } catch {
        pushToast({ type: "info", title: "Save failed", message: "Please try again" });
      } finally {
        publishInFlightRef.current = false;
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
        "darling_draft",
        JSON.stringify({ data: mf, step: manualStep, completed: false }),
      );
      setHasWipDraft(true);
    } catch {}
  }, [mf, manualStep, editMode]);



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

  const closeAuth = useCallback(() => {
    setShowAuth(false);
    pendingPublishRef.current = null; // discard pending publish if user dismisses auth
  }, []);

  const closeAuthSuccess = useCallback(() => {
    setShowAuth(false);
    const resumed = resumedPublishRef.current;
    resumedPublishRef.current = false;
    if (!pendingPublishRef.current && !resumed) {
      setEditMode("choose");
    }
    // if pendingPublishRef.current exists, the auto-publish useEffect will fire
  }, []);

  // No auth check — anyone can open the form and fill it
  const handleEditClick = useCallback(() => {
    preEditContentRef.current = content;
    setEditMode("choose");
  }, [content]);

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

  // From preview: go back into the manual form to edit
  const handleEditFromPreview = useCallback(() => {
    fromPreviewRef.current = true;
    setMf({ ...content });
    setManualStep(0);
    setEditMode("manual");
  }, [content]);

  const startAiMode = useCallback(() => {
    setAiName(isPersonalized ? content.recipientName : "");
    setAiSender(isPersonalized ? content.senderName : "");
    setAiPrompt("");
    setEditMode("ai");
  }, [isPersonalized, content.recipientName, content.senderName]);

  /** Seeds the manual form exactly as opening it does, without opening it. */
  const seedManualForm = useCallback(() => {
    let initialData: ContentData = isPersonalized ? { ...content } : { ...DEMO_CONTENT };
    let initialStep = 0;
    try {
      const saved = sessionStorage.getItem("darling_draft");
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
  }, [isPersonalized, content]);

  const startManualMode = useCallback(() => {
    seedManualForm();
    setEditMode("manual");
  }, [seedManualForm]);

  // ── StoryStarter entry points ──────────────────────────────────────────────
  // `mf` is seeded up front — from the saved draft, the loaded page or the demo,
  // whichever the manual form would have used — so a generated draft lands on
  // the right base and `onManual` can open the untouched form over the top of it
  // without re-seeding and throwing the AI's work away.
  const openStoryStarter = useCallback(() => {
    seedManualForm();
    setStoryMode("idle");
    setStoryStarted(true);
  }, [seedManualForm, setStoryMode]);

  /** Create / Personalise. Falls back to today's chooser when there is no schema. */
  const handleStartCreate = useCallback(() => {
    if (!storySchema) { handleEditClick(); return; }
    preEditContentRef.current = content;
    openStoryStarter();
  }, [storySchema, handleEditClick, content, openStoryStarter]);

  /** The chooser's "AI" button. Falls back to the old prompt sheet with no schema. */
  const handleStartAi = useCallback(() => {
    if (!storySchema) { startAiMode(); return; }
    openStoryStarter();
  }, [storySchema, startAiMode, openStoryStarter]);

  /** StoryStarter's way out — the normal form, every field still hand-editable. */
  const handleStoryManual = useCallback(() => {
    setEditMode("manual");
  }, []);

  const saveToServer = useCallback(
    async (data: ContentData, password?: string) => {
      if (!accessToken) return;
      const body = {
        recipientName:      data.recipientName,
        senderName:         data.senderName,
        personalMessage:    data.personalMessage,
        wishMessage:        data.wishMessage,
        loveDate:           data.loveDate,
        homeCoverPhoto:     data.homeCoverPhoto,
        homePhotos:
          data.homeCoverPhoto?.url?.trim() ? [] : (data.homePhotos || []),
        galleryPhotos:      data.galleryPhotos      || [],
        quizQuestions:      data.quizQuestions      || [],
        truthDareQuestions: data.truthDareQuestions || [],
        sharePhoto:         data.sharePhoto         || "",
        password:           password || "",
      };
      if (pageId) {
        await fetch(`${API_URL}/darling-pages/${pageId}`, {
          method: "PUT",
          headers: headers(),
          body: JSON.stringify(body),
        });
      } else {
        const res = await fetch(`${API_URL}/darling-pages`, {
          method: "POST",
          headers: headers(),
          body: JSON.stringify(body),
        });
        const result = await res.json();
        if (result.success) setPageId(result.data._id);
        // Answered so the draft path can learn the id of a row it just created.
        // Without it a create looks like a failure, the content stays dirty, and
        // the next milestone creates a SECOND identical draft. The five other
        // saveToServer editors already returned it.
        return result;
      }
    },
    [accessToken, pageId, headers],
  );

  // Last step of manual form: save locally then enter preview so user can inspect + publish
  const handleManualSave = useCallback(
    (data: ContentData, pw: string) => {
      fromPreviewRef.current = false;
      setContent(data);
      setMf(data);
      setIsPersonalized(true);
      setPagePassword(pw);
      setPendingContent(null);
      setEditMode("preview");
      try {
        sessionStorage.setItem(
          "darling_draft",
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
          prompt: `Love message for ${aiName} from ${aiSender || "your partner"}. ${aiPrompt}`,
          templateId: "darling",
          templateType: "darling",
        }),
      });
      const data = await res.json();
      if (data.personalMessage || data.body) {
        const existing = (content.galleryPhotos || []).map(normalizePhoto);
        const photoLetters: string[] = data.photoLetters || [];
        const count = Math.max(existing.length, photoLetters.length);
        const galleryWithLetters = Array.from({ length: count }, (_, i) => ({
          url:    existing[i]?.url    ?? "",
          letter: photoLetters[i]    ?? existing[i]?.letter ?? "",
          cropX:  existing[i]?.cropX ?? 50,
          cropY:  existing[i]?.cropY ?? 50,
        }));

        const newContent: ContentData = {
          ...content,
          recipientName:   aiName.trim(),
          senderName:      aiSender.trim() || content.senderName,
          personalMessage: data.personalMessage || data.body || content.personalMessage,
          wishMessage:     data.wishMessage || content.wishMessage,
          galleryPhotos:   galleryWithLetters,
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
    (key: keyof ContentData, val: unknown) => setMf((p) => ({ ...p, [key]: val })),
    [],
  );

  // Legacy preview/password flow (kept for ?id= re-edit compatibility)
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

  // ── Reopening from the profile ────────────────────────────────────────────
  //
  // This editor ignored `?edit=<id>` entirely, so the profile's Edit button
  // opened it on demo content — and saving from there overwrote the user's page
  // with a fresh one. Nothing about that was visible: no error, no empty state,
  // just the wrong page.
  //
  // The fields come from DEMO_CONTENT rather than a hand-written list, so a field
  // added to this template later survives a reopen without anyone remembering.
  useResumeDraft({
    base: `${API_URL}/darling-pages`,
    editId: searchParams.get("edit"),
    accessToken,
    defaults: DEMO_CONTENT,
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
    publishInFlight: publishInFlightRef,
    templateType: TEMPLATE,
    content,
    enabled: isPersonalized,
    busy: publishing || saving,
    isAuthenticated,
    accessToken,
    pageId,
    // The editor's own save, which already handles create vs update and already
    // sets `pageId`. Nothing about the wire shape is restated here.
    persist: async (d) => {
      const r = await saveToServer(d, pagePassword);
      const id = r?.data?._id ? String(r.data._id) : pageId;
      return id || null;
    },
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
    // Not authenticated: stash data and show auth modal; auto-publish fires after login
    if (!isAuthenticated || !accessToken) {
      track(EVENTS.AUTH_REQUIRED, { template: TEMPLATE });
      resumedPublishRef.current = false;
      pendingPublishRef.current = { data: content, password: pagePassword };
      setShowAuth(true);
      return;
    }
    setPublishing(true);
    try {
      let id = pageId;
      // If no pageId yet, create the page first
      if (!id) {
        const body = {
          recipientName:      content.recipientName,
          senderName:         content.senderName,
          personalMessage:    content.personalMessage,
          wishMessage:        content.wishMessage,
          loveDate:           content.loveDate,
          homeCoverPhoto:     content.homeCoverPhoto,
          homePhotos:         content.homeCoverPhoto?.url?.trim() ? [] : (content.homePhotos || []),
          galleryPhotos:      content.galleryPhotos      || [],
          quizQuestions:      content.quizQuestions      || [],
          truthDareQuestions: content.truthDareQuestions || [],
          sharePhoto:         content.sharePhoto         || "",
          password:           pagePassword || "",
        };
        const res = await fetch(`${API_URL}/darling-pages`, {
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
        { slug: TEMPLATE, templateType: "darling", pageId: id, templateTitle: "My Darling" },
        setPublishing,
      );
      if (gate === "cancelled") return;

      const pubRes = await fetch(`${API_URL}/darling-pages/${id}/publish`, { method: "POST", headers: headers(), });
      const pubResult = await pubRes.json();
      if (pubResult.success) {
        const url = pubResult.data.shareUrl as string;
        setShareUrl(url);
        setEditMode(null); // published — no editor sheet stays open over it
        await persistStory();
        setEditMode(null);
        try { sessionStorage.removeItem("darling_draft"); } catch {}
        track(EVENTS.PUBLISH_SUCCESS, { template: TEMPLATE, source: "direct" });
        pushToast({ type: "publish", title: "Published! ♡", message: "Tap Share to send it" });
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
  }, [isAuthenticated, accessToken, pageId, content, pagePassword, headers, pushToast, persistStory]);


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
    openShareSheet({
      url: shareUrl,
      password: pagePassword,
      title: "A darling page for you",
      cardTitle: "There is a page waiting for you",
      cardNote: "Scan it and the whole page opens — no app, nothing to install.",
      accent: "#e11d48",
      slug: "darling",
    });
  }, [shareUrl, pagePassword]);

  // ── Start over ────────────────────────────────────────────────────────────
  //
  // Everything this browser holds for the template goes: the form buffer and
  // prefill (sessionStorage), any `darling_*` key left in localStorage, and the
  // signed-out scratch in IndexedDB that `useDraft` would otherwise put straight
  // back on screen at the next refresh. A draft already saved to the account
  // stays in the profile; this only forgets it here.
  //
  // `isPersonalized` drops first, which disables `useDraft`, so the unmount and
  // tab-hide saves cannot write the old content back behind us.
  const clearLocalData = useCallback(async () => {
    setClearing(true);
    setIsPersonalized(false);
    for (const store of [sessionStorage, localStorage]) {
      try {
        const keys: string[] = [];
        for (let i = 0; i < store.length; i++) {
          const k = store.key(i);
          if (k && k.startsWith("darling_") && !k.startsWith("darling_unlocked_")) keys.push(k);
        }
        keys.forEach((k) => store.removeItem(k));
      } catch {}
    }
    await clearScratch(TEMPLATE);

    pendingPublishRef.current = null;
    fromPreviewRef.current = false;
    preEditContentRef.current = DEMO_CONTENT;
    setContent(DEMO_CONTENT);
    setMf({ ...DEMO_CONTENT });
    setManualStep(0);
    setPendingContent(null);
    setPagePassword("");
    setShowPwValue(false);
    setPageId(null);
    setShareUrl(null);
    setEditMode(null);
    setStoryStarted(false);
    setHasWipDraft(false);
    setTab("home");
    setClearing(false);
    // A reopened page (?id= / ?edit=) would load itself again on the next render.
    if (searchParams.get("id") || searchParams.get("edit")) router.replace("/darling");
    pushToast({ type: "success", title: "All cleared", message: "Start fresh whenever you like ♡" });
  }, [router, searchParams, pushToast]);

  // Extract shareId from shareUrl (last path segment)
  const shareId = shareUrl ? shareUrl.split("/").pop() ?? null : null;

  return {
    tab, content, editMode, isPersonalized, shareUrl, shareId, copied, showAuth,
    saving, publishing, pagePassword, showPwValue,
    aiName, aiSender, aiPrompt, aiLoading,
    mf, setMf, manualStep, pendingContent,
    storyFill, storyStarted, handleStartCreate, handleStartAi, handleStoryManual,

    setEditMode, setEditModeFromSheet, setAiName, setAiSender, setAiPrompt, setManualStep,
    setPagePassword, setShowPwValue,
    updateMf, handleTabChange, goToGallery, goToNotes,

    goBack, closeAuth, closeAuthSuccess,
    handleEditClick, startAiMode, startManualMode,
    handleAiGenerate, handleManualPreview, handleManualSave,
    handleEditFromPreview,
    handleConfirmSave, handlePasswordDone, handleDiscardPreview,
    handlePublish, handleCopy, handleShare,
    pushToast, gameResponsesFromDB, quizAttemptsFromDB,

    clearLocalData, clearing,
    canClear: !shareUrl && !publishing && (isPersonalized || hasWipDraft),
    showPublish: isPersonalized && !shareUrl && !publishing,
    showShare: !!shareUrl,
    shareLabel: copied ? "Copied!" : "Share",
  };
}
