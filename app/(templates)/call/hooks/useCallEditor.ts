// ─── The editor, all of it ───────────────────────────────────────────────────
//
// One hook owns every piece of state this template has; `page.tsx` is a thin
// renderer over it. Three booleans drive the polymorphic top bar —
// `isPersonalized`, `shareUrl`, `publishing` — exactly as in the reference
// editor (`bouquet-gf`), and the publish is auth-DEFERRED: anybody can open the
// editor and fill the form, and login is only demanded at the Publish tap, at
// which point it resumes by itself.
//
// ── THE ONE THING THAT IS THIS TEMPLATE'S OWN ────────────────────────────────
//
// The AI fill schema declares `callLog` as a list of `kind | time | note`
// STRINGS, because a fill schema can only describe text leaves. `CallData`
// holds `CallLogEntry` objects. `normaliseAiCallData` is the boundary between
// the two and it runs on every filled result, so nothing downstream — the form,
// the preview, the wire body — ever sees a string where an entry belongs.

"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { API_URL, IS_NGROK } from "@/lib/config";
import { EVENTS } from "@/lib/analytics/events";
import { track } from "@/lib/analytics/track";
import { useStoryFill } from "@/hooks/useStoryFill";
import { buildTagLink } from "../components/tagApi";
import {
  CALL_KINDS,
  DEMO_DATA,
  MAX_LOG_ENTRIES,
  MAX_MESSAGE_LINES,
  callDataToBody,
  dbToCallData,
  type CallData,
  type CallKind,
  type CallLogEntry,
} from "../components/types";
import { openShareSheet } from "@/lib/share/shareBus";

/** Slug reported on every analytics event from this editor. */
const TEMPLATE = "call";

const DRAFT_KEY = "call_draft";
const BASE = `${API_URL}/call-pages`;

/** The sheet's state. `null` and `"preview"` both mean "the form is closed". */
export type EditMode = null | "preview" | "manual";

export interface Toast {
  id: number;
  type: "success" | "info" | "publish";
  title: string;
  message?: string;
  shareUrl?: string;
}

/* ── Draft ─────────────────────────────────────────────────────────────────── */

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
    /* private mode, quota, a locked-down webview — a lost draft is survivable */
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

const readDraft = (): { data?: CallData; password?: string; completed?: boolean } | null => {
  try {
    const raw = draftStore()?.getItem(DRAFT_KEY) ?? window.sessionStorage.getItem(DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

/* ── The AI boundary ───────────────────────────────────────────────────────── */

const KIND_SET = new Set<string>(CALL_KINDS);

/**
 * `"missed | 3:41 AM | 47 calls today"` → one `CallLogEntry`.
 *
 * Tolerant on purpose. A line with no pipes is a note; an unknown kind falls
 * back to `missed`, which is both the commonest and the funniest; an entry with
 * neither a clock nor a day gets one, because `dbToCallData` drops entries that
 * have neither and a silently vanished log line is the worst outcome here.
 */
function parseLogLine(raw: string): CallLogEntry | null {
  const parts = raw.split("|").map((p) => p.trim());
  if (parts.length === 1) {
    const note = parts[0];
    if (!note) return null;
    return { kind: "missed", time: "", ago: "recently", note };
  }

  const kindRaw = (parts[0] ?? "").toLowerCase();
  const kind = (KIND_SET.has(kindRaw) ? kindRaw : "missed") as CallKind;
  const time = parts[1] ?? "";
  const note = parts.slice(2).filter(Boolean).join(" · ");

  const entry: CallLogEntry = { kind, time, ago: time ? "" : "recently" };
  if (note) entry.note = note;
  return entry;
}

/**
 * Everything the model may have written, in the shape the form expects.
 *
 * Runs on every filled result. Anything already well-formed passes through
 * untouched, so this is safe to apply to a form the sender has been editing by
 * hand as well as to a freshly generated one.
 */
export function normaliseAiCallData(next: CallData): CallData {
  const rawLog = next.callLog as unknown;
  const callLog = Array.isArray(rawLog)
    ? rawLog
        .map((item): CallLogEntry | null => {
          if (typeof item === "string") return parseLogLine(item);
          if (item && typeof item === "object") return item as CallLogEntry;
          return null;
        })
        .filter((e): e is CallLogEntry => e !== null)
        .slice(0, MAX_LOG_ENTRIES)
    : next.callLog;

  const rawMessage = next.message as unknown;
  const message =
    typeof rawMessage === "string"
      ? rawMessage.split("\n").map((l) => l.trim()).filter(Boolean).slice(0, MAX_MESSAGE_LINES)
      : next.message;

  return { ...next, callLog, message };
}

/* ── The hook ──────────────────────────────────────────────────────────────── */

export function useCallEditor() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, accessToken } = useAppSelector((s) => s.auth);

  const [content, setContent] = useState<CallData>(DEMO_DATA);
  const [mf, setMf] = useState<CallData>({ ...DEMO_DATA });
  const [editMode, setEditMode] = useState<EditMode>(null);
  const [pagePassword, setPagePassword] = useState("");
  const [pageId, setPageId] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  /** The friends' WRITE link. Owner reads carry it; shared reads never do. */
  const [contribToken, setContribToken] = useState<string | null>(null);
  const [isPersonalized, setIsPersonalized] = useState(false);
  const [previewVersion, setPreviewVersion] = useState(0);
  const bumpPreview = useCallback(() => setPreviewVersion((v) => v + 1), []);

  /** `window.location.origin`, read in an effect so SSR and the first client
   *  render agree. Building the tag link during render would not. */
  const [origin, setOrigin] = useState("");
  useEffect(() => setOrigin(window.location.origin), []);

  // ── AI story fill ──────────────────────────────────────────────────────────
  // Completely inert when the server has no schema for this slug: `schema`
  // stays null, StoryStarter renders nothing, and the entry point below falls
  // straight back to the form this editor has always opened.
  const applyFilled = useCallback((next: CallData) => setMf(normaliseAiCallData(next)), []);

  const storyFill = useStoryFill<CallData>({
    slug: "call",
    demo: DEMO_DATA,
    current: mf,
    onFilled: applyFilled,
  });
  const { schema: storySchema, setMode: setStoryMode, persistStory } = storyFill;
  const [storyStarted, setStoryStarted] = useState(false);

  const [showAuth, setShowAuth] = useState(false);
  const saving = false;
  const [publishing, setPublishing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastIdRef = useRef(0);

  const pendingPublishRef = useRef<{ data: CallData; password: string } | null>(null);

  const headers = useCallback(
    () => ({
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      ...(IS_NGROK ? { "ngrok-skip-browser-warning": "true" } : {}),
    }),
    [accessToken]
  );

  const pushToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = ++toastIdRef.current;
    setToasts((prev) => [...prev, { ...toast, id }]);
    const delay = toast.type === "publish" ? 1200 : 3500;
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), delay);
  }, []);

  const dismissToast = useCallback((id: number) => setToasts((prev) => prev.filter((t) => t.id !== id)), []);

  // ── Load an existing page (?edit=<id>) or restore a draft ──────────────────
  useEffect(() => {
    const id = searchParams.get("edit") || searchParams.get("id");
    if (id && isAuthenticated && accessToken) {
      fetch(`${BASE}/${id}`, { headers: headers() })
        .then((r) => r.json())
        .then((result) => {
          if (!result.success || !result.data) return;
          const d = dbToCallData(result.data);
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
      setMf(normaliseAiCallData(draft.data));
      if (draft.password) setPagePassword(draft.password);
      if (draft.completed) {
        setContent(normaliseAiCallData(draft.data));
        setIsPersonalized(true);
        setEditMode("preview");
        bumpPreview();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, accessToken, searchParams]);

  // ── Auto-resume the publish after login ────────────────────────────────────
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
          body: JSON.stringify(callDataToBody(data, password)),
        });
        const result = await res.json();
        if (!result.success) throw new Error("Save failed");

        const savedId = result.data._id as string;
        setPageId(savedId);
        setContent(data);
        setIsPersonalized(true);
        if (typeof result.data.contribToken === "string") setContribToken(result.data.contribToken);

        const pubRes = await fetch(`${BASE}/${savedId}/publish`, { method: "POST", headers: headers() });
        const pubResult = await pubRes.json();
        if (pubResult.success) {
          setShareUrl(String(pubResult.data.shareUrl));
          await persistStory();
          clearDraft();
          track(EVENTS.PUBLISH_SUCCESS, { template: TEMPLATE, source: "auth_resume" });
          pushToast({ type: "publish", title: "It's ringing", message: "Your call is live" });
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

  // ── Autosave the work in progress ──────────────────────────────────────────
  useEffect(() => {
    if (editMode !== "manual") return;
    saveDraft({ data: mf, password: pagePassword, completed: false });
  }, [mf, pagePassword, editMode]);

  const displayData = editMode === "manual" ? mf : content;

  const updateMf = useCallback(
    (key: keyof CallData, val: unknown) => setMf((p) => ({ ...p, [key]: val }) as CallData),
    []
  );

  /** Seeds the form exactly as opening it does, without opening it. */
  const seedManualForm = useCallback(() => {
    setMf(isPersonalized ? { ...content } : { ...DEMO_DATA });
  }, [isPersonalized, content]);

  const handleEditClick = useCallback(() => {
    seedManualForm();
    setEditMode("manual");
  }, [seedManualForm]);

  // ── StoryStarter entry point ───────────────────────────────────────────────
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
    if (!mf.caller.name.trim()) {
      pushToast({ type: "info", title: "Who is calling?", message: "Add her name first" });
      return;
    }
    const clean = normaliseAiCallData(mf);
    setContent(clean);
    setIsPersonalized(true);
    setEditMode("preview");
    bumpPreview();
    saveDraft({ data: clean, password: pagePassword, completed: true });
    pushToast({ type: "success", title: "Saved", message: "Answer it, then send it" });
  }, [mf, pagePassword, pushToast, bumpPreview]);

  const create = useCallback(async (): Promise<string | null> => {
    const res = await fetch(BASE, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify(callDataToBody(content, pagePassword)),
    });
    const result = await res.json();
    if (!result.success) return null;
    if (typeof result.data.contribToken === "string") setContribToken(result.data.contribToken);
    setPageId(result.data._id);
    return result.data._id as string;
  }, [content, pagePassword, headers]);

  const update = useCallback(
    async (id: string) => {
      const res = await fetch(`${BASE}/${id}`, {
        method: "PUT",
        headers: headers(),
        body: JSON.stringify(callDataToBody(content, pagePassword)),
      });
      const result = await res.json().catch(() => null);
      if (result?.success && typeof result.data?.contribToken === "string") {
        setContribToken(result.data.contribToken);
      }
    },
    [content, pagePassword, headers]
  );

  const publish = useCallback(async () => {
    track(EVENTS.PUBLISH_CLICKED, { template: TEMPLATE, is_authenticated: isAuthenticated });

    if (!content.caller.name.trim()) {
      track(EVENTS.PUBLISH_FAILED, { template: TEMPLATE, reason: "missing_caller_name" });
      pushToast({ type: "info", title: "Who is calling?", message: "Open Edit and add her name" });
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

      const pubRes = await fetch(`${BASE}/${id}/publish`, { method: "POST", headers: headers() });
      const pubResult = await pubRes.json();
      if (pubResult.success) {
        setShareUrl(String(pubResult.data.shareUrl));
        await persistStory();
        clearDraft();
        track(EVENTS.PUBLISH_SUCCESS, { template: TEMPLATE, source: "direct" });
        pushToast({ type: "publish", title: "It's ringing", message: "Your call is live" });
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
      void navigator.clipboard.writeText(link).catch(() => {});
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      if (!url) pushToast({ type: "success", title: "Link copied" });
    },
    [shareUrl, pushToast]
  );

  const handleShare = useCallback(() => {
    if (!shareUrl) return;
    const text = "Incoming call. Pick up.";
    openShareSheet({
      // Only a saved page can be consented to, and only by its owner.
      wall: pageId ? { templateType: "call", pageId } : undefined,
      url: shareUrl,
      password: pagePassword,
      title: "Incoming call",
      text,
      accent: "#059669",
      slug: "call",
    });
  }, [shareUrl, pagePassword, pageId]);

  const shareId = shareUrl ? (shareUrl.split("/").pop() ?? null) : null;

  /**
   * The friends' link, built from `contribToken` and NEVER from `shareId`.
   * One is a write capability for a group chat; the other is a read capability
   * for the one person the page is for.
   */
  const contribLink = useMemo(
    () => (contribToken && origin ? buildTagLink(origin, contribToken, content) : null),
    [contribToken, origin, content]
  );

  const handleCopyTagLink = useCallback(() => {
    if (!contribLink) return;
    void navigator.clipboard.writeText(contribLink).catch(() => {});
    pushToast({ type: "success", title: "Tag link copied", message: "Send it to her friends" });
  }, [contribLink, pushToast]);

  const goBack = useCallback(() => router.push("/templates"), [router]);

  return {
    content,
    mf,
    displayData,
    editMode,
    pagePassword,
    pageId,
    shareUrl,
    shareId,
    contribLink,
    contribToken,
    isPersonalized,
    showAuth,
    saving,
    publishing,
    copied,
    toasts,
    previewVersion,
    isAuthenticated,
    accessToken,

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
    handleCopyTagLink,
    handleShare,
    goBack,
    pushToast,
    dismissToast,

    showPublish: isPersonalized && !shareUrl && !publishing,
    showShare: !!shareUrl,
    shareLabel: copied ? "Copied" : "Share",
  };
}
