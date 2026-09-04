"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { API_URL, IS_NGROK } from "@/lib/config";
import { EVENTS } from "@/lib/analytics/events";
import { track } from "@/lib/analytics/track";
import { useStoryFill } from "@/hooks/useStoryFill";

/** Slug reported on every analytics event from this editor. */
const TEMPLATE = "missyou-gf";
import {
  type MissYouData,
  type EditMode,
  type Toast,
  type EngagementData,
  DEMO_DATA,
  missYouDataToBody,
  dbToMissYouData,
  dbToEngagement,
} from "../components/types";
import { openShareSheet } from "@/lib/share/shareBus";
import { ensurePublishAllowed } from "@/lib/paywall/publishRequest";
import { useDraft } from "@/lib/draft/useDraft";
import { persistDraft } from "@/lib/draft/persistDraft";

const DRAFT_KEY = "missyou_draft";
const BASE = `${API_URL}/missyou-gf-pages`;

// Draft persists to localStorage so a refresh keeps everything filled in.
// Falls back to sessionStorage if localStorage is unavailable.
const draftStore = (): Storage | null => {
  try { return window.localStorage; } catch { try { return window.sessionStorage; } catch { return null; } }
};
const saveDraft = (payload: unknown) => {
  try { draftStore()?.setItem(DRAFT_KEY, JSON.stringify(payload)); } catch {}
};
const clearDraft = () => {
  try { window.localStorage.removeItem(DRAFT_KEY); } catch {}
  try { window.sessionStorage.removeItem(DRAFT_KEY); } catch {}
};
const readDraft = (): { data?: MissYouData; password?: string; completed?: boolean } | null => {
  try {
    const raw = draftStore()?.getItem(DRAFT_KEY) ?? window.sessionStorage.getItem(DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
};

export function useMissYouEditor() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, accessToken } = useAppSelector((s) => s.auth);

  const [content, setContent] = useState<MissYouData>(DEMO_DATA);
  const [mf, setMf] = useState<MissYouData>({ ...DEMO_DATA });
  const [editMode, setEditMode] = useState<EditMode>(null);
  const [pagePassword, setPagePassword] = useState("");
  const [pageId, setPageId] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [isPersonalized, setIsPersonalized] = useState(false);
  // bumped whenever a *new* preview should show → remounts the viewer so the
  // envelope re-seals, scratch re-covers, hug counter resets, chosen song plays.
  const [previewVersion, setPreviewVersion] = useState(0);
  const bumpPreview = useCallback(() => setPreviewVersion((v) => v + 1), []);

  // ── AI story fill ──────────────────────────────────────────────────────────
  // Completely inert when the server has no schema for this slug: `schema`
  // stays null, StoryStarter renders nothing, and the entry point below falls
  // straight back to the form this editor has always opened.
  const storyFill = useStoryFill<MissYouData>({
    slug: "missyou-gf",
    demo: DEMO_DATA,
    current: mf,
    onFilled: setMf,
  });
  const { schema: storySchema, setMode: setStoryMode, persistStory } = storyFill;
  const [storyStarted, setStoryStarted] = useState(false);

  const [showAuth, setShowAuth] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [engagement, setEngagement] = useState<EngagementData | null>(null);
  const saving = false; // save-to-preview is local/synchronous; kept for EditSheet API parity
  const [publishing, setPublishing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastIdRef = useRef(0);

  // Holds the draft when the user tries to publish while logged out → auto-resume after login.
  const pendingPublishRef = useRef<{ data: MissYouData; password: string } | null>(null);

  const headers = useCallback(
    () => ({
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      ...(IS_NGROK ? { "ngrok-skip-browser-warning": "true" } : {}),
    }),
    [accessToken],
  );

  const pushToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = ++toastIdRef.current;
    setToasts((prev) => [...prev, { ...toast, id }]);
    const delay = toast.type === "publish" ? 1000 : 3500;
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), delay);
  }, []);

  const dismissToast = useCallback((id: number) => setToasts((prev) => prev.filter((t) => t.id !== id)), []);

  // ── Load existing page (?edit=<id>) or restore a completed local draft ──────
  useEffect(() => {
    const id = searchParams.get("edit") || searchParams.get("id");
    if (id && isAuthenticated && accessToken) {
      fetch(`${BASE}/${id}`, { headers: headers() })
        .then((r) => r.json())
        .then((result) => {
          if (result.success && result.data) {
            const d = dbToMissYouData(result.data);
            setContent(d);
            setMf(d);
            setPageId(id);
            setIsPersonalized(true);
            setEditMode("preview");
            bumpPreview();
            if (result.data.isPublished && result.data.shareUrl) setShareUrl(String(result.data.shareUrl));
          }
        })
        .catch(() => {});
      return;
    }

    const draft = readDraft();
    if (draft?.data) {
      setMf(draft.data);
      if (draft.password) setPagePassword(draft.password);
      if (draft.completed) {
        setContent(draft.data);
        setIsPersonalized(true);
        setEditMode("preview");
        bumpPreview();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, accessToken, searchParams]);

  // ── Auto-resume publish after successful auth ───────────────────────────────
  useEffect(() => {
    if (!isAuthenticated || !accessToken || !pendingPublishRef.current) return;
    const { data, password } = pendingPublishRef.current;
    pendingPublishRef.current = null;

    setPublishing(true);
    setEditMode("preview");
    bumpPreview();
    (async () => {
      try {
        const res = await fetch(BASE, { method: "POST", headers: headers(), body: JSON.stringify(missYouDataToBody(data, password)) });
        const result = await res.json();
        if (!result.success) throw new Error("Save failed");
        const savedId = result.data._id as string;
        setPageId(savedId);
        setContent(data);
        setIsPersonalized(true);

        // Clear the paywall BEFORE publishing, so nothing spins behind the sheet,
        // and the publish request is only made when it will succeed.
        const gate = await ensurePublishAllowed(
          { slug: TEMPLATE, templateType: "missyou-gf", pageId: savedId, templateTitle: "Miss You" },
          setPublishing,
        );
        if (gate === "cancelled") return;

        const pubRes = await fetch(`${BASE}/${savedId}/publish`, { method: "POST", headers: headers() });
        const pubResult = await pubRes.json();
        if (pubResult.success) {
          setShareUrl(String(pubResult.data.shareUrl));
          await persistStory();
          clearDraft();
          pushToast({ type: "publish", title: "Published! 🤍", message: "Your letter is now live" });
        } else {
          pushToast({ type: "info", title: "Publish failed", message: "Saved — tap Publish to go live" });
        }
      } catch {
        pushToast({ type: "info", title: "Save failed", message: "Please try again" });
      } finally {
        setPublishing(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, accessToken]);

  // ── Auto-save WIP draft while editing ───────────────────────────────────────
  useEffect(() => {
    if (editMode !== "manual" && editMode !== "choose") return;
    saveDraft({ data: mf, password: pagePassword, completed: false });
  }, [mf, pagePassword, editMode]);

  const displayData = editMode === "manual" || editMode === "choose" ? mf : content;

  const updateMf = useCallback((key: keyof MissYouData, val: unknown) => setMf((p) => ({ ...p, [key]: val })), []);

  /** Seeds the form exactly as opening it does, without opening it. */
  const seedManualForm = useCallback(() => {
    setMf(isPersonalized ? { ...content } : { ...DEMO_DATA });
  }, [isPersonalized, content]);

  const handleEditClick = useCallback(() => {
    seedManualForm();
    setEditMode("manual");
  }, [seedManualForm]);

  // ── StoryStarter entry point ────────────────────────────────────────────────
  // `mf` is seeded up front — from the loaded page or the demo, whichever the
  // form would have used — so a generated draft lands on the right base and
  // `onManual` can open the untouched form without re-seeding over the AI's work.
  /** Create. Falls back to today's form when there is no schema. */
  const handleStartCreate = useCallback(() => {
    if (!storySchema) { handleEditClick(); return; }
    seedManualForm();
    setStoryMode("idle");
    setStoryStarted(true);
  }, [storySchema, handleEditClick, seedManualForm, setStoryMode]);

  /** StoryStarter's way out — the normal form, every field still hand-editable. */
  const handleStoryManual = useCallback(() => {
    setEditMode("manual");
  }, []);

  const handleEditFromPreview = useCallback(() => {
    setMf({ ...content });
    setEditMode("manual");
  }, [content]);

  // Save (locally) & jump to preview
  const handleSave = useCallback(() => {
    if (!mf.senderName.trim()) { pushToast({ type: "info", title: "Add your name first" }); return; }
    setContent(mf);
    setIsPersonalized(true);
    setEditMode("preview");
    bumpPreview();
    saveDraft({ data: mf, password: pagePassword, completed: true });
    pushToast({ type: "success", title: "Saved!", message: "Preview it, then publish 🤍" });
  }, [mf, pagePassword, pushToast, bumpPreview]);

  const create = useCallback(async (): Promise<string | null> => {
    const res = await fetch(BASE, { method: "POST", headers: headers(), body: JSON.stringify(missYouDataToBody(content, pagePassword)) });
    const result = await res.json();
    if (!result.success) return null;
    setPageId(result.data._id);
    return result.data._id as string;
  }, [content, pagePassword, headers]);

  const update = useCallback(async (id: string) => {
    await fetch(`${BASE}/${id}`, { method: "PUT", headers: headers(), body: JSON.stringify(missYouDataToBody(content, pagePassword)) });
  }, [content, pagePassword, headers]);

  // ── Auto-draft ────────────────────────────────────────────────────────────
  //
  // What this adds that `create`/`update` did not: work built while signed OUT
  // is held in the browser and promoted to a real draft — photos to S3 — the
  // moment the visitor signs up or logs in. Both of those only ever ran with a
  // token, so everything built before signing in was lost at the first
  // navigation.
  //
  // `enabled: isPersonalized` keeps every visitor who merely opened the editor
  // out of their own profile: the demo content is not a draft.
  //
  // It does not reuse `create`/`update`, because those read `content` from the
  // closure and adoption has to write the payload that came out of the scratch —
  // which during a sign-in is not what the editor is showing. It reuses
  // `missYouDataToBody`, the one description of this template's wire shape.
  const draft = useDraft({
    templateType: TEMPLATE,
    content,
    enabled: isPersonalized,
    busy: publishing,
    isAuthenticated,
    accessToken,
    pageId,
    persist: (d) =>
      persistDraft({
        base: BASE,
        headers: headers(),
        pageId,
        setPageId,
        body: missYouDataToBody(d, pagePassword),
      }),
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
  // sets it. Closing the sheet (`null`) and entering preview are the two moments
  // the user has decided something is worth keeping, and a transition is
  // impossible to forget in a way a call site is not.
  //
  // Leaving the editor and backgrounding the tab are handled inside the hook.
  useEffect(() => {
    if (editMode === null || editMode === "preview") void draft.saveNow();
  }, [editMode, draft]);

  const publish = useCallback(async () => {
    track(EVENTS.PUBLISH_CLICKED, { template: TEMPLATE, is_authenticated: isAuthenticated });
    if (!content.senderName.trim()) {
      track(EVENTS.PUBLISH_FAILED, { template: TEMPLATE, reason: "missing_sender_name" });
      pushToast({ type: "info", title: "Add your name first", message: "Open Edit and fill in your name" });
      setEditMode("manual");
      setMf({ ...content });
      return;
    }
    if (!isAuthenticated || !accessToken) {
      track(EVENTS.AUTH_REQUIRED, { template: TEMPLATE });
      pendingPublishRef.current = { data: content, password: pagePassword };
      setShowAuth(true);
      return;
    }
    setPublishing(true);
    try {
      let id = pageId;
      if (!id) id = await create();
      else await update(id);
      if (!id) throw new Error("Save failed");

      // Clear the paywall BEFORE publishing, so nothing spins behind the sheet,
      // and the publish request is only made when it will succeed.
      const gate = await ensurePublishAllowed(
        { slug: TEMPLATE, templateType: "missyou-gf", pageId: id, templateTitle: "Miss You" },
        setPublishing,
      );
      if (gate === "cancelled") return;

      const pubRes = await fetch(`${BASE}/${id}/publish`, { method: "POST", headers: headers() });
      const pubResult = await pubRes.json();
      if (pubResult.success) {
        setShareUrl(String(pubResult.data.shareUrl));
        await persistStory();
        clearDraft();
        track(EVENTS.PUBLISH_SUCCESS, { template: TEMPLATE, source: "direct" });
        pushToast({ type: "publish", title: "Published! 🤍", message: "Your letter is now live" });
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
  }, [content, pagePassword, isAuthenticated, accessToken, pageId, create, update, headers, pushToast, persistStory]);

  const closeAuth = useCallback(() => { setShowAuth(false); pendingPublishRef.current = null; }, []);
  const closeAuthSuccess = useCallback(() => { setShowAuth(false); }, []);

  // ── History: the sender's view of recipient engagement (hugs + love-map) ────
  const openHistory = useCallback(async () => {
    setShowHistory(true);
    if (!pageId || !accessToken) return;
    setHistoryLoading(true);
    try {
      const r = await fetch(`${BASE}/${pageId}`, { headers: headers() });
      const j = await r.json();
      if (j.success && j.data) setEngagement(dbToEngagement(j.data));
    } catch {
      /* keep whatever we had; the sheet shows an empty state */
    } finally {
      setHistoryLoading(false);
    }
  }, [pageId, accessToken, headers]);
  const closeHistory = useCallback(() => setShowHistory(false), []);

  const handleCopy = useCallback((url?: string) => {
    const link = url || shareUrl;
    if (link) {
      navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      if (!url) pushToast({ type: "success", title: "Link copied!" });
    }
  }, [shareUrl, pushToast]);

  const handleShare = useCallback(() => {
    if (!shareUrl) return;
    const text = "I made you something. Don't open it till you're alone tonight 🤍";
    openShareSheet({
      url: shareUrl,
      password: pagePassword,
      title: "A letter for you 💌",
      text,
      accent: "#4f46e5",
      senderName: content.senderName,
      slug: "missyou-gf",
    });
  }, [shareUrl, content.senderName, pagePassword]);

  const goBack = useCallback(() => router.push("/templates"), [router]);

  const shareId = shareUrl ? shareUrl.split("/").pop() ?? null : null;

  return {
    content, mf, displayData, editMode, pagePassword, pageId, shareUrl, shareId,
    isPersonalized, showAuth, saving, publishing, copied, toasts, previewVersion,

    setEditMode, setPagePassword, updateMf, setMf,
    storyFill, storyStarted, handleStartCreate, handleStoryManual,
    handleEditClick, handleEditFromPreview, handleSave,
    create, update, publish,
    closeAuth, closeAuthSuccess, handleCopy, handleShare, goBack,
    pushToast, dismissToast,

    // history
    showHistory, historyLoading, engagement, openHistory, closeHistory,
    canViewHistory: !!pageId && !!shareUrl,

    showPublish: isPersonalized && !shareUrl && !publishing,
    showShare: !!shareUrl,
    shareLabel: copied ? "Copied!" : "Share",
  };
}
