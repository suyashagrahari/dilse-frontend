"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { API_URL, IS_NGROK } from "@/lib/config";
import { EVENTS } from "@/lib/analytics/events";
import { track } from "@/lib/analytics/track";
import {
  type CourtOfLoveData,
  type EditMode,
  type Toast,
  DEMO_DATA,
  courtOfLoveDataToBody,
  dbToCourtOfLoveData,
} from "../components/types";

const DRAFT_KEY = "court_of_love_draft";
const BASE = `${API_URL}/court-of-love-pages`;

/** Slug reported on every analytics event from this editor. */
const TEMPLATE = "court-of-love";

// Draft is persisted to localStorage so a page refresh (or accidental tab close)
// keeps everything the user filled in. Falls back to sessionStorage if unavailable.
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
const readDraft = (): {
  data?: CourtOfLoveData;
  password?: string;
  completed?: boolean;
  story?: string;
} | null => {
  try {
    const raw = draftStore()?.getItem(DRAFT_KEY) ?? window.sessionStorage.getItem(DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
};

/** Matches MIN_STORY_CHARS on the server; keeps the button honest before we call. */
const MIN_STORY_CHARS = 20;
export const MAX_STORY_CHARS = 4000;

export function useCourtOfLoveEditor() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, accessToken } = useAppSelector((s) => s.auth);

  const [content, setContent] = useState<CourtOfLoveData>(DEMO_DATA);
  const [mf, setMf] = useState<CourtOfLoveData>({ ...DEMO_DATA });
  const [editMode, setEditMode] = useState<EditMode>(null);
  const [pagePassword, setPagePassword] = useState("");
  const [pageId, setPageId] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [isPersonalized, setIsPersonalized] = useState(false);
  // Bumped whenever a *new* preview should be shown → remounts the trial so it
  // restarts at the summons screen with the latest questions.
  const [previewVersion, setPreviewVersion] = useState(0);
  const bumpPreview = useCallback(() => setPreviewVersion((v) => v + 1), []);

  const [showAuth, setShowAuth] = useState(false);
  const saving = false; // save-to-preview is local/synchronous; kept for EditSheet API parity
  const [publishing, setPublishing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastIdRef = useRef(0);

  // Holds draft when user tries to publish while unauthenticated → auto-resume after login.
  const pendingPublishRef = useRef<{ data: CourtOfLoveData; password: string } | null>(null);

  // ── AI: the sender's story → a whole case file ─────────────────────────────
  const [story, setStory] = useState("");
  const [generating, setGenerating] = useState(false);
  /** Language the last generation came back in, echoed to the sender. */
  const [generatedLanguage, setGeneratedLanguage] = useState<string | null>(null);
  const [hasGenerated, setHasGenerated] = useState(false);
  // Same deferred-auth trick as publish: AI generation needs a login, but we
  // don't want a wall in front of the form, so the intent waits here and the
  // effect below resumes it once the user is authenticated.
  const pendingGenerateRef = useRef<string | null>(null);

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
            const d = dbToCourtOfLoveData(result.data);
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

    // Restore a locally-saved draft on refresh. The typed form data (mf) always comes
    // back; if it was saved from the preview ("completed"), we also reopen the preview.
    const draft = readDraft();
    if (draft?.story) setStory(draft.story);
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
        const res = await fetch(BASE, {
          method: "POST",
          headers: headers(),
          body: JSON.stringify(courtOfLoveDataToBody(data, password)),
        });
        const result = await res.json();
        if (!result.success) throw new Error("Save failed");
        const savedId = result.data._id as string;
        setPageId(savedId);
        setContent(data);
        setIsPersonalized(true);

        const pubRes = await fetch(`${BASE}/${savedId}/publish`, { method: "POST", headers: headers() });
        const pubResult = await pubRes.json();
        if (pubResult.success) {
          setShareUrl(String(pubResult.data.shareUrl));
          clearDraft();
          // The auth-deferred path: user hit Publish while logged out, logged in,
          // and this resumed automatically. Tracked separately from the direct
          // path so the login detour's completion rate is visible.
          track(EVENTS.PUBLISH_SUCCESS, { template: TEMPLATE, source: "auth_deferred" });
          pushToast({ type: "publish", title: "Case filed! ⚖️", message: "Your Court of Love is live" });
        } else {
          track(EVENTS.PUBLISH_FAILED, {
            template: TEMPLATE,
            source: "auth_deferred",
            reason: typeof pubResult?.error === "string" ? pubResult.error : "publish_rejected",
          });
          pushToast({ type: "info", title: "Publish failed", message: "Saved — tap Publish to go live" });
        }
      } catch {
        track(EVENTS.PUBLISH_FAILED, { template: TEMPLATE, source: "auth_deferred", reason: "save_error" });
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
    // The story rides along so a refresh mid-edit doesn't lose what they wrote
    // and they can regenerate without retyping it.
    saveDraft({ data: mf, password: pagePassword, completed: false, story });
  }, [mf, pagePassword, editMode, story]);

  const displayData = editMode === "manual" || editMode === "choose" ? mf : content;

  const updateMf = useCallback(
    (key: keyof CourtOfLoveData, val: unknown) => setMf((p) => ({ ...p, [key]: val })),
    [],
  );

  /** Patch one field of one hearing without disturbing the others. */
  const updateQuestion = useCallback((qIndex: number, patch: Partial<CourtOfLoveData["questions"][number]>) => {
    setMf((p) => ({
      ...p,
      questions: p.questions.map((q, i) => (i === qIndex ? { ...q, ...patch } : q)),
    }));
  }, []);

  /** Patch one option of one hearing. */
  const updateOption = useCallback((qIndex: number, optIndex: number, value: string) => {
    setMf((p) => ({
      ...p,
      questions: p.questions.map((q, i) =>
        i === qIndex ? { ...q, options: q.options.map((o, j) => (j === optIndex ? value : o)) } : q,
      ),
    }));
  }, []);

  /**
   * Ask the server to turn `text` into a case file and drop it into the form.
   *
   * Everything it returns is written into `mf`, not `content`, so it lands in the
   * editable form exactly as if the sender had typed it — they can then change
   * any hearing before saving. The story itself is never sent to the page.
   */
  const runGenerate = useCallback(
    async (text: string) => {
      setGenerating(true);
      try {
        const res = await fetch(`${BASE}/generate`, {
          method: "POST",
          headers: headers(),
          body: JSON.stringify({
            story: text,
            plaintiffName: mf.plaintiffName,
            accusedName: mf.accusedName,
          }),
        });
        const result = await res.json();

        if (!res.ok || !result.success) {
          // Deliberately NOT tracked as PUBLISH_FAILED: that event measures the
          // publish drop-off funnel, and a failed AI draft is not a failed
          // publish. Mixing them would quietly corrupt that metric.
          console.warn("Court of Love AI generation failed:", res.status, result?.error);
          pushToast({
            type: "info",
            title: "Couldn't write the hearings",
            message: typeof result?.error === "string" ? result.error : "Please try again.",
          });
          return;
        }

        const d = result.data as {
          language?: string;
          languageName?: string;
          headline?: string;
          oathText?: string;
          secretLetter?: string;
          certificateTitle?: string;
          questions?: CourtOfLoveData["questions"];
        };

        setMf((prev) => ({
          ...prev,
          // Only overwrite what the model actually returned, so a sender who
          // already tweaked a field doesn't silently lose it to a blank.
          headline: d.headline?.trim() || prev.headline,
          oathText: d.oathText?.trim() || prev.oathText,
          secretLetter: d.secretLetter?.trim() || prev.secretLetter,
          certificateTitle: d.certificateTitle?.trim() || prev.certificateTitle,
          questions: Array.isArray(d.questions) && d.questions.length ? d.questions : prev.questions,
          language: d.language?.trim() || prev.language,
        }));

        setGeneratedLanguage(d.languageName?.trim() || d.language?.trim() || null);
        setHasGenerated(true);
        pushToast({
          type: "success",
          title: "Your case file is ready ✨",
          message: d.languageName ? `Written in ${d.languageName}` : "Edit anything you like",
        });
      } catch {
        pushToast({ type: "info", title: "Network error", message: "Couldn't reach the AI. Try again." });
      } finally {
        setGenerating(false);
      }
    },
    [mf.plaintiffName, mf.accusedName, headers, pushToast],
  );

  /** Generate from the story box. Defers to login when needed, then resumes. */
  const generateFromStory = useCallback(() => {
    const text = story.trim();
    if (text.length < MIN_STORY_CHARS) {
      pushToast({
        type: "info",
        title: "Tell us a bit more",
        message: `A sentence or two is enough (${MIN_STORY_CHARS}+ characters).`,
      });
      return;
    }
    if (!isAuthenticated || !accessToken) {
      track(EVENTS.AUTH_REQUIRED, { template: TEMPLATE, source: "ai_generate" });
      pendingGenerateRef.current = text;
      setShowAuth(true);
      return;
    }
    void runGenerate(text);
  }, [story, isAuthenticated, accessToken, runGenerate, pushToast]);

  // Resume a deferred generation once the user logs in.
  useEffect(() => {
    if (!isAuthenticated || !accessToken || !pendingGenerateRef.current) return;
    const text = pendingGenerateRef.current;
    pendingGenerateRef.current = null;
    void runGenerate(text);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, accessToken]);

  const handleEditClick = useCallback(() => {
    setMf(isPersonalized ? { ...content } : { ...DEMO_DATA });
    setEditMode("manual");
  }, [isPersonalized, content]);

  const handleEditFromPreview = useCallback(() => {
    setMf({ ...content });
    setEditMode("manual");
  }, [content]);

  // Save (locally) & jump to preview
  const handleSave = useCallback(() => {
    if (!mf.plaintiffName.trim()) { pushToast({ type: "info", title: "Add your name first" }); return; }
    if (!mf.accusedName.trim()) { pushToast({ type: "info", title: "Who's on trial?", message: "Add their name" }); return; }
    setContent(mf);
    setIsPersonalized(true);
    setEditMode("preview");
    bumpPreview(); // fresh preview: the trial restarts from the summons screen
    saveDraft({ data: mf, password: pagePassword, completed: true });
    track(EVENTS.PAGE_SAVED, { template: TEMPLATE, has_password: Boolean(pagePassword) });
    pushToast({ type: "success", title: "Saved!", message: "Play it through, then publish ⚖️" });
  }, [mf, pagePassword, pushToast, bumpPreview]);

  const create = useCallback(async (): Promise<string | null> => {
    const res = await fetch(BASE, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify(courtOfLoveDataToBody(content, pagePassword)),
    });
    const result = await res.json();
    if (!result.success) return null;
    setPageId(result.data._id);
    return result.data._id as string;
  }, [content, pagePassword, headers]);

  const update = useCallback(async (id: string) => {
    await fetch(`${BASE}/${id}`, {
      method: "PUT",
      headers: headers(),
      body: JSON.stringify(courtOfLoveDataToBody(content, pagePassword)),
    });
  }, [content, pagePassword, headers]);

  const publish = useCallback(async () => {
    // Recorded before any validation or auth check so this measures *intent*.
    // The gap between this and PUBLISH_SUCCESS is the entire publish drop-off.
    track(EVENTS.PUBLISH_CLICKED, { template: TEMPLATE, is_authenticated: isAuthenticated });

    if (!content.accusedName.trim()) {
      track(EVENTS.PUBLISH_FAILED, { template: TEMPLATE, reason: "missing_accused_name" });
      pushToast({ type: "info", title: "Who's on trial?", message: "Add their name in Edit" });
      setEditMode("manual");
      setMf({ ...content });
      return;
    }
    if (!isAuthenticated || !accessToken) {
      // The auth wall. The pending intent lives in a ref, so it does not survive
      // the Google subdomain-bridge redirect — this event makes that loss visible.
      // `source` discriminates this from the AI-generate auth wall, so the
      // publish funnel stays countable on its own.
      track(EVENTS.AUTH_REQUIRED, { template: TEMPLATE, source: "publish" });
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

      const pubRes = await fetch(`${BASE}/${id}/publish`, { method: "POST", headers: headers() });
      const pubResult = await pubRes.json();
      if (pubResult.success) {
        setShareUrl(String(pubResult.data.shareUrl));
        clearDraft();
        track(EVENTS.PUBLISH_SUCCESS, { template: TEMPLATE, source: "direct" });
        pushToast({ type: "publish", title: "Case filed! ⚖️", message: "Your Court of Love is live" });
      } else {
        track(EVENTS.PUBLISH_FAILED, {
          template: TEMPLATE,
          source: "direct",
          reason: typeof pubResult?.error === "string" ? pubResult.error : "publish_rejected",
        });
        pushToast({ type: "info", title: "Publish failed", message: "Please try again" });
      }
    } catch {
      track(EVENTS.PUBLISH_FAILED, { template: TEMPLATE, source: "direct", reason: "network_error" });
      pushToast({ type: "info", title: "Publish failed", message: "Please try again" });
    } finally {
      setPublishing(false);
    }
  }, [content, pagePassword, isAuthenticated, accessToken, pageId, create, update, headers, pushToast]);

  // Cancelling the login modal must drop BOTH pending intents, or closing it
  // after an AI prompt would fire a generation the next time they log in.
  const closeAuth = useCallback(() => {
    setShowAuth(false);
    pendingPublishRef.current = null;
    pendingGenerateRef.current = null;
  }, []);
  const closeAuthSuccess = useCallback(() => { setShowAuth(false); }, []);

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
    if (typeof navigator !== "undefined" && "share" in navigator) {
      navigator
        .share({ title: "You've been summoned to The Court of Love ⚖️", url: shareUrl })
        .catch(() => {});
    } else {
      handleCopy();
    }
  }, [shareUrl, handleCopy]);

  const goBack = useCallback(() => router.push("/templates"), [router]);

  const shareId = shareUrl ? shareUrl.split("/").pop() ?? null : null;

  return {
    content, mf, displayData, editMode, pagePassword, pageId, shareUrl, shareId,
    isPersonalized, showAuth, saving, publishing, copied, toasts, previewVersion,

    // AI story → case file
    story, setStory, generating, generatedLanguage, hasGenerated, generateFromStory,

    setEditMode, setPagePassword, updateMf, updateQuestion, updateOption,
    handleEditClick, handleEditFromPreview, handleSave,
    create, update, publish,
    closeAuth, closeAuthSuccess, handleCopy, handleShare, goBack,
    pushToast, dismissToast,

    showPublish: isPersonalized && !shareUrl && !publishing,
    showShare: !!shareUrl,
    shareLabel: copied ? "Copied!" : "Share",
  };
}
