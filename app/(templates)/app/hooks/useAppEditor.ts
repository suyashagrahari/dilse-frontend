"use client";

// ─── useAppEditor — the whole state machine for /app ─────────────────────────
//
// One controller hook. `page.tsx` is a thin renderer over it, and three
// booleans (`isPersonalized`, `shareUrl`, `publishing`) drive the polymorphic
// top-bar button: Create → Publish → Share.
//
// ── PUBLISH IS AUTH-DEFERRED, NEVER AUTH-GATED ───────────────────────────────
// Anyone can open the editor and fill the whole form. Login is asked for at the
// Publish click and only there: the payload is stashed in a ref, AuthModal
// opens, and the effect below resumes the publish the moment the token lands.
//
// ── TWO SECRETS ──────────────────────────────────────────────────────────────
// The create/read responses carry `contribToken` as well as `shareId`.
// `contribToken` is the friends' WRITE link — the one that goes in the group
// chat — and `shareId` is the recipient's READ link. The review link is built
// from `contribToken` and nothing else; `shareId` rides along only as the `sid`
// decoration the contributor page uses to poll the live listing after a
// submission, which is a published, password-gated address either way.
//
// ── AI STORY FILL ────────────────────────────────────────────────────────────
// `useStoryFill` is inert when the server has no schema for this slug, so Create
// falls back to the plain form and nothing breaks. `persistStory()` runs in BOTH
// publish paths — the direct one and the auto-resume-after-login one — right
// after the publish succeeds and before `clearDraft()`. Missing it in the resume
// path silently degrades the feature for exactly the users who were logged out
// when they pressed Publish, i.e. most first-time senders.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { API_URL, IS_NGROK } from "@/lib/config";
import { EVENTS } from "@/lib/analytics/events";
import { track } from "@/lib/analytics/track";
import { useStoryFill } from "@/hooks/useStoryFill";

import { DEMO_APP, appDataToBody, dbToAppData } from "../components/demo";
import type { AppData } from "../components/types";
import { openShareSheet } from "@/lib/share/shareBus";
import { ensurePublishAllowed } from "@/lib/paywall/publishRequest";
import { useDraft } from "@/lib/draft/useDraft";
import { useToast } from "@/lib/toast/useToast";
import { persistDraft } from "@/lib/draft/persistDraft";

/** Slug reported on every analytics event from this editor. */
const TEMPLATE = "app";

const DRAFT_KEY = "app_listing_draft";
const BASE = `${API_URL}/app-pages`;

/** Which surface the sheet is showing. `null` is "just the preview". */
export type EditMode = null | "manual" | "choose" | "preview";

export interface Toast {
  id: number;
  type: "success" | "info" | "publish";
  title: string;
  message?: string;
}

/* ── Draft ─────────────────────────────────────────────────────────────────── */

const draftStore = (): Storage | null => {
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
};
const saveDraft = (payload: unknown) => {
  try {
    draftStore()?.setItem(DRAFT_KEY, JSON.stringify(payload));
  } catch {
    /* a full or blocked store must never break typing */
  }
};
const clearDraft = () => {
  try {
    window.sessionStorage.removeItem(DRAFT_KEY);
  } catch {}
  try {
    window.localStorage.removeItem(DRAFT_KEY);
  } catch {}
};
const readDraft = (): { data?: AppData; password?: string; completed?: boolean } | null => {
  try {
    const raw = draftStore()?.getItem(DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

/* ── The hook ──────────────────────────────────────────────────────────────── */

export function useAppEditor() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, accessToken } = useAppSelector((s) => s.auth);

  const [content, setContent] = useState<AppData>(DEMO_APP);
  const [mf, setMf] = useState<AppData>({ ...DEMO_APP });
  const [editMode, setEditMode] = useState<EditMode>(null);
  const [pagePassword, setPagePassword] = useState("");
  const [pageId, setPageId] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [contribToken, setContribToken] = useState<string | null>(null);
  const [isPersonalized, setIsPersonalized] = useState(false);
  const [previewVersion, setPreviewVersion] = useState(0);
  const bumpPreview = useCallback(() => setPreviewVersion((v) => v + 1), []);

  // ── AI story fill ──────────────────────────────────────────────────────────
  // Completely inert when the server has no schema for this slug: `schema`
  // stays null, StoryStarter renders nothing, and the entry point below falls
  // straight back to the form this editor has always opened.
  const storyFill = useStoryFill<AppData>({
    slug: "app",
    demo: DEMO_APP,
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
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const pendingPublishRef = useRef<{ data: AppData; password: string } | null>(null);

  useEffect(
    () => () => {
      for (const t of timers.current) clearTimeout(t);
      timers.current = [];
    },
    []
  );

  const headers = useCallback(
    () => ({
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      ...(IS_NGROK ? { "ngrok-skip-browser-warning": "true" } : {}),
    }),
    [accessToken]
  );



  // ── Load an existing page (?edit=<id>) or restore a completed draft ────────
  useEffect(() => {
    const id = searchParams.get("edit") || searchParams.get("id");
    if (id && isAuthenticated && accessToken) {
      fetch(`${BASE}/${id}`, { headers: headers() })
        .then((r) => r.json())
        .then((result) => {
          if (!result.success || !result.data) return;
          const d = dbToAppData(result.data);
          setContent(d);
          setMf(d);
          setPageId(id);
          setIsPersonalized(true);
          setEditMode("preview");
          bumpPreview();
          if (typeof result.data.contribToken === "string") setContribToken(result.data.contribToken);
          if (result.data.isPublished && result.data.shareUrl) setShareUrl(String(result.data.shareUrl));
        })
        .catch(() => {});
      return;
    }
    const draft = readDraft();
    if (draft?.data) {
      const d = dbToAppData(draft.data as unknown as Record<string, unknown>);
      setMf(d);
      if (draft.password) setPagePassword(draft.password);
      if (draft.completed) {
        setContent(d);
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

    setPublishing(true);
    setEditMode("preview");
    bumpPreview();
    (async () => {
      try {
        const res = await fetch(BASE, {
          method: "POST",
          headers: headers(),
          body: JSON.stringify(appDataToBody(data, password)),
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
          { slug: TEMPLATE, templateType: "app", pageId: savedId, templateTitle: "The Listing" },
          setPublishing,
        );
        if (gate === "cancelled") return;

        const pubRes = await fetch(`${BASE}/${savedId}/publish`, { method: "POST", headers: headers() });
        const pubResult = await pubRes.json();
        if (pubResult.success) {
          setShareUrl(String(pubResult.data.shareUrl));
          await persistStory();
          clearDraft();
          track(EVENTS.PUBLISH_SUCCESS, { template: TEMPLATE, source: "auth_resume" });
          pushToast({ type: "publish", title: "Published.", message: "Tap Share to send it" });
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

  // ── Autosave the WIP draft on every keystroke ─────────────────────────────
  useEffect(() => {
    if (editMode !== "manual" && editMode !== "choose") return;
    saveDraft({ data: mf, password: pagePassword, completed: false });
  }, [mf, pagePassword, editMode]);

  const displayData = editMode === "manual" || editMode === "choose" ? mf : content;

  const updateMf = useCallback(
    (key: keyof AppData, val: unknown) => setMf((p) => ({ ...p, [key]: val }) as AppData),
    []
  );

  /** Seeds the form exactly as opening it does, without opening it. */
  const seedManualForm = useCallback(() => {
    setMf(isPersonalized ? { ...content } : { ...DEMO_APP });
  }, [isPersonalized, content]);

  const handleEditClick = useCallback(() => {
    seedManualForm();
    setEditMode("manual");
  }, [seedManualForm]);

  // ── StoryStarter entry point ──────────────────────────────────────────────
  // `mf` is seeded up front — from the loaded page or the demo, whichever the
  // form would have used — so a generated draft lands on the right base and
  // `onManual` can open the untouched form without re-seeding over the AI's work.
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
    if (!mf.app.name.trim()) {
      pushToast({ type: "info", title: "Add her name first", message: "The basics — it goes on the listing" });
      return;
    }
    setContent(mf);
    setIsPersonalized(true);
    setEditMode("preview");
    bumpPreview();
    saveDraft({ data: mf, password: pagePassword, completed: true });
    pushToast({ type: "success", title: "Saved!", message: "Have a look, then publish it ✨" });
  }, [mf, pagePassword, pushToast, bumpPreview]);

  const create = useCallback(async (): Promise<string | null> => {
    const res = await fetch(BASE, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify(appDataToBody(content, pagePassword)),
    });
    const result = await res.json();
    if (!result.success) return null;
    setPageId(result.data._id);
    if (typeof result.data.contribToken === "string") setContribToken(result.data.contribToken);
    return result.data._id as string;
  }, [content, pagePassword, headers]);

  const update = useCallback(
    async (id: string) => {
      const res = await fetch(`${BASE}/${id}`, {
        method: "PUT",
        headers: headers(),
        body: JSON.stringify(appDataToBody(content, pagePassword)),
      });
      const result = await res.json().catch(() => null);
      if (result?.success && typeof result.data?.contribToken === "string") {
        setContribToken(result.data.contribToken);
      }
    },
    [content, pagePassword, headers]
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
  // `appDataToBody`, the one description of this template's wire shape.
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
        body: appDataToBody(d, pagePassword),
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
    if (!content.app.name.trim()) {
      track(EVENTS.PUBLISH_FAILED, { template: TEMPLATE, reason: "missing_name" });
      pushToast({ type: "info", title: "Add her name first", message: "Open Edit and fill in the basics" });
      setMf({ ...content });
      setEditMode("manual");
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
        { slug: TEMPLATE, templateType: "app", pageId: id, templateTitle: "The Listing" },
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
        pushToast({ type: "publish", title: "Published.", message: "Tap Share to send it" });
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

  const closeAuth = useCallback(() => {
    setShowAuth(false);
    pendingPublishRef.current = null;
  }, []);
  const closeAuthSuccess = useCallback(() => setShowAuth(false), []);

  const handleCopy = useCallback(
    (url?: string) => {
      const link = url || shareUrl;
      if (!link) return;
      navigator.clipboard.writeText(link).catch(() => {});
      setCopied(true);
      timers.current.push(setTimeout(() => setCopied(false), 2000));
      if (!url) pushToast({ type: "success", title: "Link copied!" });
    },
    [shareUrl, pushToast]
  );

  const handleShare = useCallback(() => {
    if (!shareUrl) return;
    const text = "You have been listed. Version 4.0, and still my favourite. ✨";
    openShareSheet({
      url: shareUrl,
      password: pagePassword,
      title: "Your listing",
      text,
      accent: "#4f46e5",
      slug: "app",
    });
  }, [shareUrl, pagePassword]);

  const goBack = useCallback(() => router.push("/templates"), [router]);

  const shareId = shareUrl ? (shareUrl.split("/").pop() ?? null) : null;

  /**
   * The friends' write link. Built from `contribToken` — NEVER from `shareId`
   * alone, which is the recipient's read address. The two are separate secrets
   * on the document, and this is the only place the write one is used.
   *
   * The query string carries her name, her icon and the sender's prompt so the
   * contributor's landing can show who they are writing about, plus `sid` so it
   * can poll the published listing after a submission. It is decoration only:
   * none of it grants a write capability, the server ignores all of it, and a
   * link with the query stripped still works — the page falls back to neutral
   * copy. An icon is only attached when it is already a public http(s) URL and
   * short enough to survive being pasted into a chat.
   */
  const reviewLink = useMemo(() => {
    if (!contribToken || typeof window === "undefined") return null;
    const url = new URL(`/app/review/${contribToken}`, window.location.origin);
    const her = content.app.name.trim();
    if (her) url.searchParams.set("n", her.slice(0, 60));
    const dev = content.app.developer.trim();
    if (dev) url.searchParams.set("s", dev.slice(0, 60));
    if (content.contributorPrompt.trim()) {
      url.searchParams.set("p", content.contributorPrompt.trim().slice(0, 240));
    }
    const icon = content.app.iconUrl ?? "";
    if (/^https?:\/\//i.test(icon) && icon.length <= 500) url.searchParams.set("ph", icon);
    if (shareId) url.searchParams.set("sid", shareId);
    return url.toString();
  }, [contribToken, shareId, content.app.name, content.app.developer, content.app.iconUrl, content.contributorPrompt]);

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
    reviewLink,
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
