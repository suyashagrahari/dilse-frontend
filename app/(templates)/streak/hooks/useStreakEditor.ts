// ─── The editor ──────────────────────────────────────────────────────────────
//
// Same shape as `useRewindEditor`: demo preview → Create → sheet → Save →
// auth-deferred Publish → Share. One deliberate difference:
//
// NO localStorage, NO sessionStorage, ANYWHERE.
//
// The sibling editors persist the work-in-progress draft so a refresh does not
// eat it. This template may not, so the draft lives in React state under the
// `streak_draft` key and nothing else. The consequence is real and worth being
// plain about: a hard refresh before Save loses what the sender typed. There is
// no mitigation available inside the constraint — see TODO(draft-persistence).

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { useStoryFill } from "@/hooks/useStoryFill";
import { API_URL, IS_NGROK } from "@/lib/config";
import { EVENTS } from "@/lib/analytics/events";
import { track } from "@/lib/analytics/track";
import type { StreakData } from "../components/types";
import { dbToStreakData, streakDataToBody } from "../components/coerce";
import { makeDemoData } from "../components/demoData";
import {
  dataToForm,
  emptyForm,
  formToData,
  validateForm,
  type EditMode,
  type StreakForm,
  type Toast,
} from "../components/editorTypes";
import { openShareSheet } from "@/lib/share/shareBus";

const BASE = `${API_URL}/streak-pages`;
const TEMPLATE = "streak";

/**
 * The draft key. It names a slot in COMPONENT STATE, not a storage entry —
 * kept as a named constant so the intent survives the next person who greps for
 * `streak_draft` expecting to find a `localStorage.setItem`.
 *
 * TODO(draft-persistence): when the no-storage constraint is lifted, this is
 * the one place that needs to learn about a store.
 */
export const DRAFT_KEY = "streak_draft";

interface Draft {
  form: StreakForm;
  password: string;
  completed: boolean;
}

export function useStreakEditor() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, accessToken } = useAppSelector((s) => s.auth);

  // The demo is built once. Rebuilding it on every render would re-seed the
  // canopy and the poem on every keystroke in the sheet.
  const [demo] = useState<StreakData>(() => makeDemoData());

  const [content, setContent] = useState<StreakData>(demo);
  const [mf, setMf] = useState<StreakForm>(() => emptyForm());
  const [editMode, setEditMode] = useState<EditMode>(null);
  const [pagePassword, setPagePassword] = useState("");
  const [pageId, setPageId] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [isPersonalized, setIsPersonalized] = useState(false);
  const [previewVersion, setPreviewVersion] = useState(0);
  const bumpPreview = useCallback(() => setPreviewVersion((v) => v + 1), []);

  const [showAuth, setShowAuth] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastIdRef = useRef(0);

  // The draft, in memory, under DRAFT_KEY. A plain object rather than a bare
  // value so the shape matches what a storage-backed version would hold.
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const hasWipRef = useRef(false);

  const pendingPublishRef = useRef<{ data: StreakData; password: string } | null>(null);

  // ── AI story fill ──────────────────────────────────────────────────────────
  //
  // THE FORM, NOT THE DATA. Every path in the `streak` schema addresses
  // `StreakForm` — `nameA`, `letters[n].letter`, `microLines[n]` — so the demo
  // baseline is `emptyForm()`, the same thing `mf` is seeded from, and NOT the
  // `StreakData` demo above. Handing it `demo` would make every path miss.
  //
  // NO STORAGE. `useStoryFill` and `StoryStarter` hold everything in React
  // state; nothing added here reads or writes local/sessionStorage, and the
  // template's no-storage rule is unchanged.
  const [fillDemo] = useState<StreakForm>(emptyForm);

  /** Anything a fill writes is work in progress — a re-seed must never eat it. */
  const applyStoryFill = useCallback((next: StreakForm) => {
    hasWipRef.current = true;
    setMf(next);
  }, []);

  const storyFill = useStoryFill<StreakForm>({
    slug: "streak",
    demo: fillDemo,
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
    const delay = toast.type === "publish" ? 1200 : 3500;
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), delay);
  }, []);

  const dismissToast = useCallback(
    (id: number) => setToasts((prev) => prev.filter((t) => t.id !== id)),
    [],
  );

  // ── Load an existing page (?edit=<id>) ──────────────────────────────────────
  useEffect(() => {
    const id = searchParams.get("edit") || searchParams.get("id");
    if (!id || !isAuthenticated || !accessToken) return;
    let cancelled = false;
    fetch(`${BASE}/${id}`, { headers: headers() })
      .then((r) => r.json())
      .then((result) => {
        if (cancelled || !result?.success || !result.data) return;
        // Untrusted input, even from our own API. Everything is clamped and
        // repaired before it can reach a render.
        const d = dbToStreakData(result.data);
        setContent(d);
        setMf(dataToForm(d));
        hasWipRef.current = false;
        setPageId(id);
        setIsPersonalized(true);
        setEditMode("preview");
        bumpPreview();
        if (result.data.isPublished && result.data.shareUrl) {
          setShareUrl(String(result.data.shareUrl));
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, accessToken, searchParams]);

  // ── Auto-resume publish after auth ──────────────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated || !accessToken || !pendingPublishRef.current) return;
    const { data, password } = pendingPublishRef.current;
    pendingPublishRef.current = null;

    setPublishing(true);
    setEditMode("preview");
    (async () => {
      try {
        const res = await fetch(BASE, {
          method: "POST",
          headers: headers(),
          body: JSON.stringify(streakDataToBody(data, password)),
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
          // Never throws, never blocks — the page is already live either way.
          await persistStory();
          setDrafts({});
          track(EVENTS.PUBLISH_SUCCESS, { template: TEMPLATE, source: "auth_deferred" });
          pushToast({ type: "publish", title: "Published 🕯️", message: "Send it to them" });
        } else {
          track(EVENTS.PUBLISH_FAILED, {
            template: TEMPLATE,
            source: "auth_deferred",
            reason: typeof pubResult?.error === "string" ? pubResult.error : "publish_rejected",
          });
          pushToast({ type: "info", title: "Not published yet", message: "Saved — tap Publish to go live" });
        }
      } catch {
        track(EVENTS.PUBLISH_FAILED, { template: TEMPLATE, source: "auth_deferred", reason: "save_error" });
        pushToast({ type: "info", title: "Didn't save", message: "Please try again" });
      } finally {
        setPublishing(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, accessToken]);

  const displayData = editMode === "manual" && isPersonalized ? content : content;

  const updateMf = useCallback(
    <K extends keyof StreakForm>(key: K, val: StreakForm[K]) => {
      hasWipRef.current = true;
      setMf((prev) => {
        const next = { ...prev, [key]: val };
        // Autosave, on every keystroke, into component state under DRAFT_KEY.
        setDrafts((d) => ({ ...d, [DRAFT_KEY]: { form: next, password: pagePassword, completed: false } }));
        return next;
      });
    },
    [pagePassword],
  );

  const updatePassword = useCallback(
    (v: string) => {
      hasWipRef.current = true;
      setPagePassword(v);
      setDrafts((d) => ({
        ...d,
        [DRAFT_KEY]: { form: d[DRAFT_KEY]?.form ?? mf, password: v, completed: false },
      }));
    },
    [mf],
  );

  /** Create tap. A draft in progress is never clobbered by a re-seed. */
  const handleEditClick = useCallback(() => {
    if (!hasWipRef.current && isPersonalized) setMf(dataToForm(content));
    setEditMode("manual");
  }, [isPersonalized, content]);

  const handleEditFromPreview = useCallback(() => {
    if (!hasWipRef.current) setMf(dataToForm(content));
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
    const problem = validateForm(mf);
    if (problem) {
      pushToast({ type: "info", title: problem.title, message: problem.message });
      return;
    }
    // Carry the existing log forward when editing; a new page starts on day one.
    const next = formToData(mf, isPersonalized ? content : undefined);
    setContent(next);
    setIsPersonalized(true);
    setEditMode("preview");
    bumpPreview();
    setDrafts((d) => ({ ...d, [DRAFT_KEY]: { form: mf, password: pagePassword, completed: true } }));
    track(EVENTS.PAGE_SAVED, {
      template: TEMPLATE,
      has_password: Boolean(pagePassword),
      letters: next.milestones.length,
      weekly_lines: next.microLetters.length,
    });
    pushToast({ type: "success", title: "Saved", message: "Have a look, then publish" });
  }, [mf, content, isPersonalized, pagePassword, pushToast, bumpPreview]);

  const create = useCallback(async (): Promise<string | null> => {
    const res = await fetch(BASE, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify(streakDataToBody(content, pagePassword)),
    });
    const result = await res.json();
    if (!result.success) return null;
    setPageId(result.data._id);
    return result.data._id as string;
  }, [content, pagePassword, headers]);

  const update = useCallback(
    async (id: string) => {
      await fetch(`${BASE}/${id}`, {
        method: "PUT",
        headers: headers(),
        body: JSON.stringify(streakDataToBody(content, pagePassword)),
      });
    },
    [content, pagePassword, headers],
  );

  const publish = useCallback(async () => {
    track(EVENTS.PUBLISH_CLICKED, { template: TEMPLATE, is_authenticated: isAuthenticated });

    if (!isPersonalized || !content.pair.a.name.trim() || !content.pair.b.name.trim()) {
      track(EVENTS.PUBLISH_FAILED, { template: TEMPLATE, reason: "incomplete" });
      pushToast({ type: "info", title: "Both names first", message: "They sit above the lights" });
      setEditMode("manual");
      return;
    }

    // AUTH-DEFERRED, never auth-gated. The intent is stashed and the effect
    // above finishes the job the moment the user comes back logged in.
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
      if (pubResult.success) {
        setShareUrl(String(pubResult.data.shareUrl));
        // Never throws, never blocks — the page is already live either way.
        await persistStory();
        setDrafts({});
        track(EVENTS.PUBLISH_SUCCESS, { template: TEMPLATE, source: "direct" });
        pushToast({ type: "publish", title: "Published 🕯️", message: "Send it to them" });
      } else {
        track(EVENTS.PUBLISH_FAILED, {
          template: TEMPLATE,
          source: "direct",
          reason: typeof pubResult?.error === "string" ? pubResult.error : "publish_rejected",
        });
        pushToast({ type: "info", title: "Not published yet", message: "Please try again" });
      }
    } catch {
      track(EVENTS.PUBLISH_FAILED, { template: TEMPLATE, source: "direct", reason: "network_error" });
      pushToast({ type: "info", title: "Not published yet", message: "Please try again" });
    } finally {
      setPublishing(false);
    }
  }, [content, isPersonalized, pagePassword, isAuthenticated, accessToken, pageId, create, update, headers, pushToast, persistStory]);

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
      setTimeout(() => setCopied(false), 2000);
      if (!url) pushToast({ type: "success", title: "Link copied" });
    },
    [shareUrl, pushToast],
  );

  const handleShare = useCallback(() => {
    if (!shareUrl) return;
    openShareSheet({
      // Only a saved page can be consented to, and only by its owner.
      wall: pageId ? { templateType: "streak", pageId } : undefined,
      url: shareUrl,
      password: pagePassword,
      title: "one tap a day, the two of us 🕯️",
      accent: "#b45309",
      slug: "streak",
    });
  }, [shareUrl, pagePassword, pageId]);

  const goBack = useCallback(() => router.push("/templates"), [router]);

  return {
    demo,
    content,
    mf,
    displayData,
    editMode,
    pagePassword,
    pageId,
    shareUrl,
    isPersonalized,
    showAuth,
    saving: false,
    publishing,
    copied,
    toasts,
    previewVersion,
    restoredDraft: Boolean(drafts[DRAFT_KEY]) && !isPersonalized,

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
    pushToast,
    dismissToast,

    showPublish: isPersonalized && !shareUrl && !publishing,
    showShare: Boolean(shareUrl),
    shareLabel: copied ? "Copied" : "Share",
  };
}
