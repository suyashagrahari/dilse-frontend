"use client";

// ─── The watch editor ────────────────────────────────────────────────────────
//
// One controller hook owns every piece of state on `/watch`; `page.tsx` is a
// thin renderer over it. Three booleans drive the polymorphic top-bar button —
// `isPersonalized`, `shareUrl`, `publishing` — and that is the entire state
// machine behind Create → Publish → Share.
//
// Publish is AUTH-DEFERRED, never auth-gated: anybody can open the editor and
// fill the whole thing in, and the login only appears at the moment they press
// Publish, after which it resumes itself.
//
// The AI story fill is wired here and is inert when the server has no schema
// for this slug — `schema` stays null, StoryStarter renders nothing, and Create
// falls straight back to the form.

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { API_URL, IS_NGROK } from "@/lib/config";
import { EVENTS } from "@/lib/analytics/events";
import { track } from "@/lib/analytics/track";
import { useStoryFill } from "@/hooks/useStoryFill";
import { DEMO_DATA, dbToWatchData, watchDataToBody, type WatchData } from "../components/types";
import { openShareSheet } from "@/lib/share/shareBus";
import { ensurePublishAllowed } from "@/lib/paywall/publishRequest";
import { useDraft } from "@/lib/draft/useDraft";
import { useToast } from "@/lib/toast/useToast";
import { persistDraft } from "@/lib/draft/persistDraft";

/** Slug reported on every analytics event from this editor. */
const TEMPLATE = "watch";
const DRAFT_KEY = "watch_draft";
const BASE = `${API_URL}/watch-pages`;

/** `null` = the live demo. `manual` = the form. `preview` = their own page. */
export type EditMode = null | "manual" | "preview";

export interface Toast {
  id: number;
  type: "success" | "info" | "publish";
  title: string;
  message?: string;
}

const draftStore = (): Storage | null => {
  try {
    return window.localStorage;
  } catch {
    try {
      return window.sessionStorage;
    } catch {
      return null;
    }
  }
};
const saveDraft = (payload: unknown) => {
  try {
    draftStore()?.setItem(DRAFT_KEY, JSON.stringify(payload));
  } catch {
    /* private mode, quota, a locked-down browser — the form still works */
  }
};
const clearDraft = () => {
  try {
    window.localStorage.removeItem(DRAFT_KEY);
  } catch {
    /* nothing to clean up */
  }
  try {
    window.sessionStorage.removeItem(DRAFT_KEY);
  } catch {
    /* nothing to clean up */
  }
};
const readDraft = (): { data?: WatchData; password?: string; completed?: boolean } | null => {
  try {
    const raw = draftStore()?.getItem(DRAFT_KEY) ?? window.sessionStorage.getItem(DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export function useWatchEditor() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, accessToken } = useAppSelector((s) => s.auth);

  const [content, setContent] = useState<WatchData>(DEMO_DATA);
  const [mf, setMf] = useState<WatchData>({ ...DEMO_DATA });
  const [editMode, setEditMode] = useState<EditMode>(null);
  const [pagePassword, setPagePassword] = useState("");
  const [pageId, setPageId] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  /**
   * The friends' WRITE link, and a different secret from the share id.
   *
   * It comes back only on owner reads, so it lives here and never travels with
   * the recipient's payload. The contributor link is built from it.
   */
  const [contribToken, setContribToken] = useState<string | null>(null);
  const [isPersonalized, setIsPersonalized] = useState(false);
  const [previewVersion, setPreviewVersion] = useState(0);
  const bumpPreview = useCallback(() => setPreviewVersion((v) => v + 1), []);

  // ── AI story fill ──────────────────────────────────────────────────────────
  const storyFill = useStoryFill<WatchData>({
    slug: "watch",
    demo: DEMO_DATA,
    current: mf,
    onFilled: setMf,
  });
  const { schema: storySchema, setMode: setStoryMode, persistStory } = storyFill;
  const [storyStarted, setStoryStarted] = useState(false);

  const [showAuth, setShowAuth] = useState(false);
  const saving = false;
  const [publishing, setPublishing] = useState(false);
  const { pushToast } = useToast();
  const [copied, setCopied] = useState(false);

  const pendingPublishRef = useRef<{ data: WatchData; password: string } | null>(null);
  /**
   * True while the auth-deferred publish below is creating the row.
   *
   * Adoption in `useDraft` answers the same event — a token appearing — and
   * used to POST a row of its own, leaving a duplicate behind as a draft. This
   * tells it to stand down. A ref because both effects run in the same commit,
   * so a state flag would still read as the previous render's value.
   */

  const publishInFlightRef = useRef(false);

  const headers = useCallback(
    () => ({
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      ...(IS_NGROK ? { "ngrok-skip-browser-warning": "true" } : {}),
    }),
    [accessToken],
  );


  // ── Load an existing page (?edit=<id>) or restore a completed draft ────────
  useEffect(() => {
    const id = searchParams.get("edit") || searchParams.get("id");
    if (id && isAuthenticated && accessToken) {
      fetch(`${BASE}/${id}`, { headers: headers() })
        .then((r) => r.json())
        .then((result) => {
          if (result.success && result.data) {
            const d = dbToWatchData(result.data);
            setContent(d);
            setMf(d);
            setPageId(id);
            setIsPersonalized(true);
            setEditMode("preview");
            bumpPreview();
            if (typeof result.data.contribToken === "string") {
              setContribToken(result.data.contribToken);
            }
            if (result.data.isPublished && result.data.shareUrl) {
              setShareUrl(String(result.data.shareUrl));
            }
          }
        })
        .catch(() => {
          /* an unreachable API leaves the demo up, which is the right fallback */
        });
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

  // ── Auto-resume publish after auth ────────────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated || !accessToken || !pendingPublishRef.current) return;
    const { data, password } = pendingPublishRef.current;
    pendingPublishRef.current = null;
    // We own the row from here; adoption stands down (see useDraft).
    publishInFlightRef.current = true;

    setPublishing(true);
    setEditMode("preview");
    bumpPreview();
    (async () => {
      try {
        const res = await fetch(BASE, {
          method: "POST",
          headers: headers(),
          body: JSON.stringify(watchDataToBody(data, password)),
        });
        const result = await res.json();
        if (!result.success) throw new Error("Save failed");
        const savedId = result.data._id as string;
        setPageId(savedId);
        setContent(data);
        setIsPersonalized(true);
        if (typeof result.data.contribToken === "string") setContribToken(result.data.contribToken);

        // Clear the paywall BEFORE publishing, so nothing spins behind the sheet,
        // and the publish request is only made when it will succeed.
        const gate = await ensurePublishAllowed(
          { slug: TEMPLATE, templateType: "watch", pageId: savedId, templateTitle: "Watch" },
          setPublishing,
        );
        if (gate === "cancelled") return;

        const pubRes = await fetch(`${BASE}/${savedId}/publish`, { method: "POST", headers: headers() });
        const pubResult = await pubRes.json();
        if (pubResult.success) {
          setShareUrl(String(pubResult.data.shareUrl));
          await persistStory();
          clearDraft();
          track(EVENTS.PUBLISH_SUCCESS, { template: TEMPLATE, source: "auto_resume" });
          pushToast({ type: "publish", title: "It's live", message: "Tap Share to send it" });
        } else {
          pushToast({ type: "info", title: "Publish failed", message: "Saved — tap Publish to go live" });
        }
      } catch {
        pushToast({ type: "info", title: "Save failed", message: "Please try again" });
      } finally {
        publishInFlightRef.current = false;
        setPublishing(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, accessToken]);

  // ── Autosave the work-in-progress on every keystroke ──────────────────────
  useEffect(() => {
    if (editMode !== "manual") return;
    saveDraft({ data: mf, password: pagePassword, completed: false });
  }, [mf, pagePassword, editMode]);

  const displayData = editMode === "manual" ? mf : content;

  const updateMf = useCallback(
    <K extends keyof WatchData>(key: K, val: WatchData[K]) => setMf((p) => ({ ...p, [key]: val })),
    [],
  );

  /** Seeds the form exactly as opening it does, without opening it. */
  const seedManualForm = useCallback(() => {
    setMf(isPersonalized ? { ...content } : { ...DEMO_DATA });
  }, [isPersonalized, content]);

  const handleEditClick = useCallback(() => {
    seedManualForm();
    setEditMode("manual");
  }, [seedManualForm]);

  // ── StoryStarter entry point ──────────────────────────────────────────────
  /** Create. Falls back to today's form when there is no schema. */
  const handleStartCreate = useCallback(() => {
    if (!storySchema) {
      handleEditClick();
      return;
    }
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

  const handleSave = useCallback(() => {
    if (!mf.video.title.trim()) {
      pushToast({ type: "info", title: "Give it a title first" });
      return;
    }
    setContent(mf);
    setIsPersonalized(true);
    setEditMode("preview");
    bumpPreview();
    saveDraft({ data: mf, password: pagePassword, completed: true });
    pushToast({ type: "success", title: "Saved", message: "Watch it, then send it" });
  }, [mf, pagePassword, pushToast, bumpPreview]);

  const create = useCallback(async (): Promise<string | null> => {
    const res = await fetch(BASE, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify(watchDataToBody(content, pagePassword)),
    });
    const result = await res.json();
    if (!result.success) return null;
    setPageId(result.data._id);
    if (typeof result.data.contribToken === "string") setContribToken(result.data.contribToken);
    return result.data._id as string;
  }, [content, pagePassword, headers]);

  const update = useCallback(
    async (id: string) => {
      await fetch(`${BASE}/${id}`, {
        method: "PUT",
        headers: headers(),
        body: JSON.stringify(watchDataToBody(content, pagePassword)),
      });
    },
    [content, pagePassword, headers],
  );

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
  // `watchDataToBody`, the one description of this template's wire shape.
  const draft = useDraft({
    publishInFlight: publishInFlightRef,
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
        body: watchDataToBody(d, pagePassword),
      }),
    onAdopted: (d) => {
      // The adopted payload carries CDN URLs where the browser held base64, so
      // the form has to be told — otherwise the next save sends the base64 back
      // and re-uploads it.
      setContent(d);
      setMf({ ...d });
      setIsPersonalized(true);
      // ── AND RE-SEAT THE PREVIEW ──────────────────────────────────────────
      //
      // The preview component is keyed on `previewVersion` in page.tsx and
      // seeds its own state from `data` when that key changes. Setting
      // `content` alone is invisible: the key does not move, the component does
      // not remount, and it goes on showing the demo it seeded with at mount.
      //
      // That was the bug. A signed-out visitor who built a page, closed the tab
      // and came back got their work back in the edit sheet — which reads the
      // form directly and is not keyed — while the page behind it still showed
      // the demo names. The data was never lost and would have published
      // correctly; it only looked lost, which is the same thing to the person
      // looking at it.
      bumpPreview();
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
    if (!content.video.title.trim()) {
      track(EVENTS.PUBLISH_FAILED, { template: TEMPLATE, reason: "missing_title" });
      pushToast({ type: "info", title: "Give it a title first", message: "Open Edit and fill it in" });
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
        { slug: TEMPLATE, templateType: "watch", pageId: id, templateTitle: "Watch" },
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
        pushToast({ type: "publish", title: "It's live", message: "Tap Share to send it" });
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
  }, [
    content,
    pagePassword,
    isAuthenticated,
    accessToken,
    pageId,
    create,
    update,
    headers,
    pushToast,
    persistStory,
  ]);

  const closeAuth = useCallback(() => {
    setShowAuth(false);
    pendingPublishRef.current = null;
  }, []);
  const closeAuthSuccess = useCallback(() => setShowAuth(false), []);

  const handleCopy = useCallback(
    (url?: string) => {
      const link = url || shareUrl;
      if (!link) return;
      navigator.clipboard
        .writeText(link)
        .then(() => {
          setCopied(true);
          window.setTimeout(() => setCopied(false), 2000);
          if (!url) pushToast({ type: "success", title: "Link copied" });
        })
        .catch(() => pushToast({ type: "info", title: "Couldn't copy", message: "Long-press the link instead" }));
    },
    [shareUrl, pushToast],
  );

  const handleShare = useCallback(() => {
    if (!shareUrl) return;
    track(EVENTS.SHARE, { template: TEMPLATE });
    const text = "I made you a video. There is a whole page around it.";
    openShareSheet({
      url: shareUrl,
      password: pagePassword,
      title: content.video.title,
      text,
      accent: "#0284c7",
      slug: "watch",
    });
  }, [shareUrl, content.video.title, pagePassword]);

  const goBack = useCallback(() => router.push("/templates"), [router]);

  const shareId = shareUrl ? (shareUrl.split("/").pop() ?? null) : null;

  return {
    content,
    mf,
    displayData,
    editMode,
    pagePassword,
    pageId,
    shareUrl,
    shareId,
    contribToken,
    isPersonalized,
    showAuth,
    saving,
    publishing,
    copied,
    previewVersion,

    setEditMode,
    setPagePassword,
    updateMf,
    setMf,
    storyFill,
    storyStarted,
    handleStartCreate,
    handleStoryManual,
    handleEditClick,
    handleEditFromPreview,
    handleSave,
    create,
    update,
    publish,
    closeAuth,
    closeAuthSuccess,
    handleCopy,
    handleShare,
    goBack,
    pushToast,
    showPublish: isPersonalized && !shareUrl && !publishing,
    showShare: !!shareUrl,
    shareLabel: copied ? "Copied!" : "Share",
  };
}
