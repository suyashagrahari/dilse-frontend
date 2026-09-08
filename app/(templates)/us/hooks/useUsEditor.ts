"use client";

// ─── Us — the editor ─────────────────────────────────────────────────────────
//
// Same shape as every other editor in the repo: demo preview → Create → sheet →
// Save (local, instant) → Publish (auth-deferred, never auth-gated) → Share.
//
// ONE DELIBERATE DEPARTURE. The sibling editors mirror the draft into
// localStorage on every keystroke. This one does not touch localStorage or
// sessionStorage at all — the draft lives in `mf` and nowhere else. The cost is
// honest and small: a hard refresh loses unsaved typing. The benefit is that a
// profile full of someone's private photo URLs, their partner's name and their
// jokes leaves no trace on a shared or borrowed device.
//
// The other thing worth knowing: `handleSave` cleans by round-tripping the form
// through the wire coercer — `dbToProfileData(usDataToBody(mf))`. That is the
// exact transformation the recipient's page will apply, so what the sender
// previews after Save is byte-for-byte what the recipient will be shown. A
// hand-rolled second cleaner here would drift from `coerce.ts` within a month.

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { useStoryFill } from "@/hooks/useStoryFill";
import { API_URL, IS_NGROK } from "@/lib/config";
import { EVENTS } from "@/lib/analytics/events";
import { track } from "@/lib/analytics/track";
import { DEMO_DATA, usDataToBody } from "../components/data";
import { dbToProfileData } from "../components/coerce";
import type { ProfileData } from "../components/types";
import { openShareSheet } from "@/lib/share/shareBus";
import { ensurePublishAllowed } from "@/lib/paywall/publishRequest";
import { useDraft } from "@/lib/draft/useDraft";
import { useToast } from "@/lib/toast/useToast";
import { persistDraft } from "@/lib/draft/persistDraft";

const BASE = `${API_URL}/us-pages`;
const TEMPLATE = "us";

export type EditMode = null | "manual" | "preview";

export interface Toast {
  id: number;
  type: "success" | "info" | "publish";
  title: string;
  message?: string;
}

/** A profile with no handle and no photos is not a profile. */
export function validate(d: ProfileData): string | null {
  if (!d.handle.trim()) return "The account needs a handle";
  if (!d.displayName.trim()) return "Whose account is this?";
  if (!d.posts.some((p) => p.imageUrl.trim() || p.caption.trim())) return "Add at least one post";
  return null;
}

export function useUsEditor() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, accessToken } = useAppSelector((s) => s.auth);

  const [content, setContent] = useState<ProfileData>(DEMO_DATA);
  const [mf, setMf] = useState<ProfileData>(() => ({ ...DEMO_DATA }));
  const [editMode, setEditMode] = useState<EditMode>(null);
  const [pagePassword, setPagePassword] = useState("");
  const [pageId, setPageId] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [isPersonalized, setIsPersonalized] = useState(false);
  const [previewVersion, setPreviewVersion] = useState(0);

  const [showAuth, setShowAuth] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const { pushToast } = useToast();
  const [copied, setCopied] = useState(false);

  /** True from the first keystroke. Nothing may overwrite `mf` while it is set. */
  const hasWip = useRef(false);
  /** Holds the intent when Publish is pressed logged-out; the effect below resumes it. */
  const pendingPublish = useRef<{ data: ProfileData; password: string } | null>(null);

  // ── AI story fill ──────────────────────────────────────────────────────────
  //
  // Inert when the server has no schema for this slug: `schema` stays null,
  // StoryStarter renders nothing and every entry point below falls straight
  // back to the sheet this editor has always shown.
  /** Anything a fill writes is work in progress — a re-seed must never eat it. */
  const applyStoryFill = useCallback((next: ProfileData) => {
    hasWip.current = true;
    setMf(next);
  }, []);

  const storyFill = useStoryFill<ProfileData>({
    slug: "us",
    demo: DEMO_DATA,
    current: mf,
    onFilled: applyStoryFill,
  });
  const { schema: storySchema, setMode: setStoryMode, persistStory } = storyFill;
  const [storyStarted, setStoryStarted] = useState(false);

  const headers = useCallback(
    () => ({
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      ...(IS_NGROK ? { "ngrok-skip-browser-warning": "true" } : {}),
    }),
    [accessToken],
  );



  // ── Load an existing page (?edit=<id>) ──────────────────────────────────────
  useEffect(() => {
    const id = searchParams.get("edit") || searchParams.get("id");
    if (!id || !isAuthenticated || !accessToken) return;
    let live = true;
    fetch(`${BASE}/${id}`, { headers: headers() })
      .then((r) => r.json())
      .then((result) => {
        if (!live || !result?.success || !result.data) return;
        const d = dbToProfileData(result.data);
        setContent(d);
        setMf(d);
        // Server data is the baseline, not work in progress.
        hasWip.current = false;
        setPageId(id);
        setIsPersonalized(true);
        setEditMode("preview");
        setPreviewVersion((v) => v + 1);
        if (result.data.isPublished && result.data.shareUrl) {
          setShareUrl(String(result.data.shareUrl));
        }
      })
      .catch(() => {});
    return () => {
      live = false;
    };
    // `headers` is derived from `accessToken` alone, so listing it adds no runs.
    // Every setter below is inside a promise callback, never the effect body.
  }, [isAuthenticated, accessToken, searchParams, headers]);

  // ── Resume the publish the moment auth lands ────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated || !accessToken || !pendingPublish.current) return;
    const { data, password } = pendingPublish.current;
    pendingPublish.current = null;

    (async () => {
      setPublishing(true);
      setEditMode("preview");
      try {
        const res = await fetch(BASE, {
          method: "POST",
          headers: headers(),
          body: JSON.stringify(usDataToBody(data, password)),
        });
        const result = await res.json();
        if (!result?.success) throw new Error("save failed");
        const savedId = result.data._id as string;
        setPageId(savedId);
        setContent(data);
        setIsPersonalized(true);

        // Clear the paywall BEFORE publishing, so nothing spins behind the sheet,
        // and the publish request is only made when it will succeed.
        const gate = await ensurePublishAllowed(
          { slug: TEMPLATE, templateType: "us", pageId: savedId, templateTitle: "Us" },
          setPublishing,
        );
        if (gate === "cancelled") return;

        const pubRes = await fetch(`${BASE}/${savedId}/publish`, { method: "POST", headers: headers(), });
        const pub = await pubRes.json();
        if (pub?.success) {
          setShareUrl(String(pub.data.shareUrl));
          // Never throws, never blocks — the page is already live either way.
          await persistStory();
          track(EVENTS.PUBLISH_SUCCESS, { template: TEMPLATE, source: "auth_deferred" });
          pushToast({ type: "publish", title: "Published 📱", message: "Tap Share to send it" });
        } else {
          track(EVENTS.PUBLISH_FAILED, { template: TEMPLATE, source: "auth_deferred", reason: "publish_rejected" });
          pushToast({ type: "info", title: "Publish failed", message: "Saved — tap Publish to go live" });
        }
      } catch {
        track(EVENTS.PUBLISH_FAILED, { template: TEMPLATE, source: "auth_deferred", reason: "save_error" });
        pushToast({ type: "info", title: "Save failed", message: "Please try again" });
      } finally {
        setPublishing(false);
      }
    })();
    // The ref is consumed and nulled on entry, so a re-run for any other reason
    // is a no-op. `pushToast` is stable; `headers` tracks `accessToken`.
  }, [isAuthenticated, accessToken, headers, pushToast, persistStory]);

  const displayData = editMode === "manual" ? mf : content;

  const updateMf = useCallback(<K extends keyof ProfileData>(key: K, val: ProfileData[K]) => {
    hasWip.current = true;
    setMf((prev) => ({ ...prev, [key]: val }));
  }, []);

  const updatePassword = useCallback((v: string) => {
    hasWip.current = true;
    setPagePassword(v);
  }, []);

  /** Create tap. Never clobbers work in progress. */
  const handleEditClick = useCallback(() => {
    setMf((cur) => (hasWip.current ? cur : isPersonalized ? { ...content } : { ...DEMO_DATA }));
    setEditMode("manual");
  }, [isPersonalized, content]);

  const handleEditFromPreview = useCallback(() => {
    setMf((cur) => (hasWip.current ? cur : { ...content }));
    setEditMode("manual");
  }, [content]);

  // ── StoryStarter entry points ──────────────────────────────────────────────
  //
  // The manual form is opened and seeded FIRST, then StoryStarter is laid over
  // it. "I'll fill it in myself" therefore reveals exactly the sheet this
  // editor has always shown, and a generated draft lands in an `mf` that was
  // seeded from the right place. Nothing ever becomes read-only.
  const openStoryStarter = useCallback(() => {
    handleEditClick();
    setStoryMode("idle");
    setStoryStarted(true);
  }, [handleEditClick, setStoryMode]);

  /** Create tap. With no schema this is the old Create, unchanged. */
  const handleStartCreate = useCallback(() => {
    if (!storySchema) {
      handleEditClick();
      return;
    }
    openStoryStarter();
  }, [storySchema, handleEditClick, openStoryStarter]);

  /** StoryStarter's way out — the normal form, every field still editable. */
  const handleStoryManual = useCallback(() => setEditMode("manual"), []);

  const handleSave = useCallback(() => {
    const problem = validate(mf);
    if (problem) {
      pushToast({ type: "info", title: problem, message: "Then it can go live" });
      return;
    }
    // The recipient's exact transformation, applied here, so the preview after
    // Save is what the recipient will actually be shown.
    const cleaned = dbToProfileData(usDataToBody(mf));
    setContent(cleaned);
    setIsPersonalized(true);
    setEditMode("preview");
    setPreviewVersion((v) => v + 1);
    track(EVENTS.PAGE_SAVED, {
      template: TEMPLATE,
      has_password: Boolean(pagePassword),
      posts: cleaned.posts.length,
      highlights: cleaned.highlights.length,
    });
    pushToast({ type: "success", title: "Saved", message: "Scroll it, then publish 📱" });
  }, [mf, pagePassword, pushToast]);

  const create = useCallback(async (): Promise<string | null> => {
    const res = await fetch(BASE, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify(usDataToBody(content, pagePassword)),
    });
    const result = await res.json();
    if (!result?.success) return null;
    setPageId(result.data._id);
    return result.data._id as string;
  }, [content, pagePassword, headers]);

  const update = useCallback(
    async (id: string) => {
      await fetch(`${BASE}/${id}`, {
        method: "PUT",
        headers: headers(),
        body: JSON.stringify(usDataToBody(content, pagePassword)),
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
  // `usDataToBody`, the one description of this template's wire shape.
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
        body: usDataToBody(d, pagePassword),
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

    const problem = validate(content);
    if (problem) {
      track(EVENTS.PUBLISH_FAILED, { template: TEMPLATE, reason: "incomplete" });
      pushToast({ type: "info", title: problem });
      setEditMode("manual");
      return;
    }

    // Auth-deferred, never auth-gated.
    if (!isAuthenticated || !accessToken) {
      track(EVENTS.AUTH_REQUIRED, { template: TEMPLATE });
      pendingPublish.current = { data: content, password: pagePassword };
      setShowAuth(true);
      return;
    }

    setPublishing(true);
    try {
      let id = pageId;
      if (!id) id = await create();
      else await update(id);
      if (!id) throw new Error("save failed");

      // Clear the paywall BEFORE publishing, so nothing spins behind the sheet,
      // and the publish request is only made when it will succeed.
      const gate = await ensurePublishAllowed(
        { slug: TEMPLATE, templateType: "us", pageId: id, templateTitle: "Us" },
        setPublishing,
      );
      if (gate === "cancelled") return;

      const pubRes = await fetch(`${BASE}/${id}/publish`, { method: "POST", headers: headers() });
      const pub = await pubRes.json();
      if (pub?.success) {
        setShareUrl(String(pub.data.shareUrl));
        // Never throws, never blocks — the page is already live either way.
        await persistStory();
        track(EVENTS.PUBLISH_SUCCESS, { template: TEMPLATE, source: "direct" });
        pushToast({ type: "publish", title: "Published 📱", message: "Tap Share to send it" });
      } else {
        track(EVENTS.PUBLISH_FAILED, { template: TEMPLATE, source: "direct", reason: "publish_rejected" });
        pushToast({ type: "info", title: "Publish failed", message: "Please try again" });
      }
    } catch {
      track(EVENTS.PUBLISH_FAILED, { template: TEMPLATE, source: "direct", reason: "network_error" });
      pushToast({ type: "info", title: "Publish failed", message: "Please try again" });
    } finally {
      setPublishing(false);
    }
  }, [content, pagePassword, isAuthenticated, accessToken, pageId, create, update, headers, pushToast, persistStory]);

  const closeAuth = useCallback(() => {
    setShowAuth(false);
    pendingPublish.current = null;
  }, []);
  const closeAuthSuccess = useCallback(() => setShowAuth(false), []);

  const handleCopy = useCallback(
    (url?: string) => {
      const link = url || shareUrl;
      if (!link) return;
      navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      if (!url) pushToast({ type: "success", title: "Link copied" });
    },
    [shareUrl, pushToast],
  );

  const handleShare = useCallback(() => {
    if (!shareUrl) return;
    track(EVENTS.SHARE, { template: TEMPLATE });
    openShareSheet({
      url: shareUrl,
      password: pagePassword,
      title: "we got an account. 📱",
      accent: "#171717",
      slug: "us",
    });
  }, [shareUrl, pagePassword]);

  const goBack = useCallback(() => router.push("/templates"), [router]);

  return {
    content,
    mf,
    displayData,
    editMode,
    pagePassword,
    pageId,
    shareUrl,
    isPersonalized,
    showAuth,
    publishing,
    copied,
    previewVersion,

    storyFill,
    storyStarted,

    setEditMode,
    setPagePassword: updatePassword,
    updateMf,
    handleEditClick,
    handleStartCreate,
    handleStoryManual,
    handleEditFromPreview,
    handleSave,
    publish,
    closeAuth,
    closeAuthSuccess,
    handleCopy,
    handleShare,
    goBack,
    showPublish: isPersonalized && !shareUrl && !publishing,
    showShare: Boolean(shareUrl),
    shareLabel: copied ? "Copied" : "Share",
  };
}
