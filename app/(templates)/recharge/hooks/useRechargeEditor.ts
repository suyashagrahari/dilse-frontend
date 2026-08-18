"use client";

// ─── The recharge editor ─────────────────────────────────────────────────────
//
// One controller hook owns every piece of state; `page.tsx` is a thin renderer
// driven by three booleans (`isPersonalized`, `shareUrl`, `publishing`). This is
// the apology-dashboard flow verbatim — demo preview → Create → AI story panel
// → form → Save → auth-deferred Publish → Share — and it is copied rather than
// reinvented because thirty other templates already behave exactly this way.

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { useStoryFill } from "@/hooks/useStoryFill";
import { API_URL, IS_NGROK } from "@/lib/config";
import { EVENTS } from "@/lib/analytics/events";
import { track } from "@/lib/analytics/track";
import { DEMO_DATA, dbToRechargeData, rechargeDataToBody, type RechargeData } from "../components/types";
import { normalizeData } from "../components/ui";
import type { EditMode } from "../components/EditSheet";
import { openShareSheet } from "@/lib/share/shareBus";

/** Slug reported on every analytics event from this editor. */
const TEMPLATE = "recharge";
const BASE = `${API_URL}/recharge-pages`;

/** The only storage key this template writes, alongside the unlock key in the viewer. */
const DRAFT_KEY = "recharge_draft";

export interface Toast {
  id: number;
  type: "info" | "success" | "publish";
  title: string;
  message?: string;
  shareUrl?: string;
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
    /* a full or blocked store is not worth interrupting a draft for */
  }
};

const clearDraft = () => {
  try {
    window.localStorage.removeItem(DRAFT_KEY);
  } catch {}
  try {
    window.sessionStorage.removeItem(DRAFT_KEY);
  } catch {}
};

const readDraft = (): { data?: RechargeData; password?: string; completed?: boolean } | null => {
  try {
    const raw = draftStore()?.getItem(DRAFT_KEY) ?? window.sessionStorage.getItem(DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

/** A page needs somebody to be for. Everything else has a house default. */
function validate(d: RechargeData): string | null {
  if (!d.subscriber.name.trim()) return "Their name goes under the number in the header.";
  if (!d.subscriber.number.trim()) return "The number is the biggest thing on the first screen.";
  if (d.plans.length === 0) return "One plan at least — the grid is the template.";
  return null;
}

export function useRechargeEditor() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, accessToken } = useAppSelector((s) => s.auth);

  const [content, setContent] = useState<RechargeData>(DEMO_DATA);
  const [mf, setMf] = useState<RechargeData>({ ...DEMO_DATA });
  const [editMode, setEditMode] = useState<EditMode>(null);
  const [pagePassword, setPagePassword] = useState("");
  const [pageId, setPageId] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [isPersonalized, setIsPersonalized] = useState(false);
  const [previewVersion, setPreviewVersion] = useState(0);
  const bumpPreview = useCallback(() => setPreviewVersion((v) => v + 1), []);

  const [showAuth, setShowAuth] = useState(false);
  const saving = false;
  const [publishing, setPublishing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastIdRef = useRef(0);

  const pendingPublishRef = useRef<{ data: RechargeData; password: string } | null>(null);

  // ── AI story fill ──────────────────────────────────────────────────────────
  //
  // Completely inert when the server has no schema for this slug: `schema` stays
  // null, StoryStarter renders nothing, and `handleStartCreate` falls straight
  // back to the form this editor has always opened.
  //
  // The fill is normalised on the way in, and that is not optional here. This
  // template's schema declares the plan grid as a FLAT LIST OF "Label: Value"
  // STRINGS — that is genuinely the right shape to ask a language model for —
  // so an unnormalised patch leaves `mf.plans` holding strings where the edit
  // sheet expects plan objects, and the sheet crashes the moment the sender
  // taps "I'll fill it in myself". `normalizeData` folds those strings back
  // into the recommended plan's rows.
  const applyStoryFill = useCallback((next: RechargeData) => setMf(normalizeData(next)), []);

  const storyFill = useStoryFill<RechargeData>({
    slug: "recharge",
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

  const pushToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = ++toastIdRef.current;
    setToasts((prev) => [...prev, { ...toast, id }]);
    const delay = toast.type === "publish" ? 6000 : 3500;
    window.setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), delay);
  }, []);

  const dismissToast = useCallback((id: number) => setToasts((prev) => prev.filter((t) => t.id !== id)), []);

  // ── Load an existing page (?edit=<id>) or restore a completed draft ────────
  useEffect(() => {
    const id = searchParams.get("edit") || searchParams.get("id");
    if (id && isAuthenticated && accessToken) {
      let cancelled = false;
      fetch(`${BASE}/${id}`, { headers: headers() })
        .then((r) => r.json())
        .then((result) => {
          if (cancelled || !result?.success || !result.data) return;
          const d = dbToRechargeData(result.data);
          setContent(d);
          setMf(d);
          setPageId(id);
          setIsPersonalized(true);
          setEditMode("preview");
          bumpPreview();
          if (result.data.isPublished && result.data.shareUrl) setShareUrl(String(result.data.shareUrl));
        })
        .catch(() => {});
      return () => {
        cancelled = true;
      };
    }

    const draft = readDraft();
    if (draft?.data) {
      // A draft is untrusted input too — it may predate a field, or have been
      // written by a fill that was mid-flight. Same coercer as the API payload,
      // then the structural repair, so a stale draft cannot crash the sheet.
      const restored = normalizeData(dbToRechargeData(draft.data as unknown as Record<string, unknown>));
      setMf(restored);
      if (draft.password) setPagePassword(draft.password);
      if (draft.completed) {
        setContent(restored);
        setIsPersonalized(true);
        setEditMode("preview");
        bumpPreview();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, accessToken, searchParams]);

  // ── Auto-resume the publish the moment they come back logged in ────────────
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
          body: JSON.stringify(rechargeDataToBody(data, password)),
        });
        const result = await res.json();
        if (!result?.success) throw new Error("Save failed");
        const savedId = result.data._id as string;
        setPageId(savedId);
        setContent(data);
        setIsPersonalized(true);

        const pubRes = await fetch(`${BASE}/${savedId}/publish`, { method: "POST", headers: headers() });
        const pubResult = await pubRes.json();
        if (pubResult?.success) {
          setShareUrl(String(pubResult.data.shareUrl));
          // Never throws and never blocks — the page is live either way.
          await persistStory();
          clearDraft();
          track(EVENTS.PUBLISH_SUCCESS, { template: TEMPLATE, source: "auth_deferred" });
          pushToast({
            type: "publish",
            title: "Recharge successful",
            message: "Send them the link.",
            shareUrl: String(pubResult.data.shareUrl),
          });
        } else {
          track(EVENTS.PUBLISH_FAILED, { template: TEMPLATE, source: "auth_deferred", reason: "publish_rejected" });
          pushToast({ type: "info", title: "Publish failed", message: "Saved — tap Publish to go live" });
        }
      } catch {
        track(EVENTS.PUBLISH_FAILED, { template: TEMPLATE, source: "auth_deferred", reason: "network_error" });
        pushToast({ type: "info", title: "Save failed", message: "Please try again" });
      } finally {
        setPublishing(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, accessToken]);

  // ── Autosave on every keystroke ────────────────────────────────────────────
  useEffect(() => {
    if (editMode !== "manual") return;
    saveDraft({ data: mf, password: pagePassword, completed: false });
  }, [mf, pagePassword, editMode]);

  const displayData = editMode === "manual" ? mf : content;

  const updateMf = useCallback((patch: Partial<RechargeData>) => setMf((p) => ({ ...p, ...patch })), []);

  /** Seeds the form exactly as opening it does, without opening it. */
  const seedManualForm = useCallback(() => {
    setMf(isPersonalized ? { ...content } : { ...DEMO_DATA });
  }, [isPersonalized, content]);

  const handleEditClick = useCallback(() => {
    seedManualForm();
    setEditMode("manual");
  }, [seedManualForm]);

  // ── StoryStarter entry point ───────────────────────────────────────────────
  //
  // `mf` is seeded up front — from the loaded page or the demo, whichever the
  // form would have used — so a generated draft lands on the right base and
  // `onManual` opens the untouched form without re-seeding over the AI's work.
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
  const handleStoryManual = useCallback(() => setEditMode("manual"), []);

  const handleEditFromPreview = useCallback(() => {
    setMf({ ...content });
    setEditMode("manual");
  }, [content]);

  const handleSave = useCallback(() => {
    const problem = validate(mf);
    if (problem) {
      pushToast({ type: "info", title: "Nearly", message: problem });
      return;
    }
    setContent(mf);
    setIsPersonalized(true);
    setEditMode("preview");
    bumpPreview();
    saveDraft({ data: mf, password: pagePassword, completed: true });
    track(EVENTS.PAGE_SAVED, { template: TEMPLATE, has_password: Boolean(pagePassword), plans: mf.plans.length });
    pushToast({ type: "success", title: "Saved", message: "Run the flow, then publish." });
  }, [mf, pagePassword, pushToast, bumpPreview]);

  const create = useCallback(async (): Promise<string | null> => {
    const res = await fetch(BASE, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify(rechargeDataToBody(content, pagePassword)),
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
        body: JSON.stringify(rechargeDataToBody(content, pagePassword)),
      });
    },
    [content, pagePassword, headers],
  );

  const publish = useCallback(async () => {
    track(EVENTS.PUBLISH_CLICKED, { template: TEMPLATE, is_authenticated: isAuthenticated });

    const problem = validate(content);
    if (problem) {
      track(EVENTS.PUBLISH_FAILED, { template: TEMPLATE, reason: "incomplete" });
      pushToast({ type: "info", title: "Finish it first", message: problem });
      setMf({ ...content });
      setEditMode("manual");
      return;
    }

    // Auth-deferred, never auth-gated.
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

      const pubRes = await fetch(`${BASE}/${id}/publish`, { method: "POST", headers: headers() });
      const pubResult = await pubRes.json();
      if (pubResult?.success) {
        setShareUrl(String(pubResult.data.shareUrl));
        await persistStory();
        clearDraft();
        track(EVENTS.PUBLISH_SUCCESS, { template: TEMPLATE, source: "direct" });
        pushToast({
          type: "publish",
          title: "Recharge successful",
          message: "Send them the link.",
          shareUrl: String(pubResult.data.shareUrl),
        });
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
    pendingPublishRef.current = null;
  }, []);
  const closeAuthSuccess = useCallback(() => setShowAuth(false), []);

  const handleCopy = useCallback(
    (url?: string) => {
      const link = url || shareUrl;
      if (!link) return;
      navigator.clipboard.writeText(link);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
      if (!url) pushToast({ type: "success", title: "Link copied" });
    },
    [shareUrl, pushToast],
  );

  const handleShare = useCallback(() => {
    if (!shareUrl) return;
    openShareSheet({
      url: shareUrl,
      password: pagePassword,
      title: "Your plan is about to expire.",
      accent: "#c026d3",
      slug: "recharge",
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
    saving,
    publishing,
    copied,
    toasts,
    previewVersion,
    storyFill,
    storyStarted,

    setEditMode,
    setPagePassword,
    updateMf,
    setMf,
    handleStartCreate,
    handleStoryManual,
    handleEditClick,
    handleEditFromPreview,
    handleSave,
    publish,
    closeAuth,
    closeAuthSuccess,
    handleCopy,
    handleShare,
    goBack,
    pushToast,
    dismissToast,

    showPublish: isPersonalized && !shareUrl && !publishing,
    showShare: Boolean(shareUrl),
    shareLabel: copied ? "Copied" : "Share",
  };
}
