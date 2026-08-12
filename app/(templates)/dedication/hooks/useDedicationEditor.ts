"use client";

// ─── Dedication — the editor ─────────────────────────────────────────────────
//
// Same flow as every other template: demo preview → Create → sheet → Save →
// auth-deferred Publish → Share.
//
// ONE DELIBERATE DIFFERENCE. The sibling editors autosave the draft to
// localStorage; this one keeps it in component state ONLY.
//
// The brief forbids both web storages outright, and independently the data
// would not fit: a draft carries the booth recordings as `data:` URLs, which
// are megabytes each and would blow the ~5MB quota on the second take. Failing
// that write is silent, so the sender would be told their work was saved by a
// UI that had quietly dropped it.
//
// (The recordings are data URLs rather than `blob:` object URLs on purpose —
// see `Recording` in Booth.tsx. A blob URL dies with the document that minted
// it, so a draft holding one publishes cleanly and then plays nothing.)

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { useStoryFill } from "@/hooks/useStoryFill";
import { API_URL, IS_NGROK } from "@/lib/config";
import { EVENTS } from "@/lib/analytics/events";
import { track } from "@/lib/analytics/track";
import {
  DEMO_DATA,
  dbToDedicationData,
  dedicationDataToBody,
  type DedicationData,
  type EditMode,
  type Toast,
} from "../components/showData";
import { parseYouTubeId, type Segment } from "../components/types";
import { openShareSheet } from "@/lib/share/shareBus";

const BASE = `${API_URL}/dedication-pages`;
const TEMPLATE = "dedication";

export interface ShowProblem {
  message: string;
}

/**
 * What has to be true before this can go on air.
 *
 * A YouTube link is validated HERE, at save time, off the same `parseYouTubeId`
 * the input field uses — never at playback time. A bad link discovered
 * mid-show is a dead radio, and the sender is long gone by then.
 */
export function validateShow(d: DedicationData): ShowProblem | null {
  if (!d.recipientName.trim()) return { message: "Who is this show for? Their name goes on the slip." };
  if (!d.stationName.trim()) return { message: "Name the station — it's the first thing that lights up." };
  if (d.segments.length === 0) return { message: "A show needs at least one segment." };

  for (let i = 0; i < d.segments.length; i++) {
    const s = d.segments[i];
    if (s.kind === "song") {
      if (!s.youtubeId) return { message: `Segment ${i + 1} has no song link yet.` };
      if (!parseYouTubeId(s.youtubeId)) return { message: `Segment ${i + 1}'s link isn't a YouTube video.` };
      if (!s.dedication.trim()) return { message: `Segment ${i + 1} needs a dedication — that's the card.` };
    } else if (!s.audioUrl && !(s.caption ?? "").trim()) {
      return { message: `Segment ${i + 1} is empty — record a voice intro or write a caption.` };
    }
  }
  return null;
}

/** Trim, drop empties, and re-parse every link one last time before it ships. */
function cleanShow(d: DedicationData): DedicationData {
  const segments: Segment[] = d.segments
    .map((s): Segment | null => {
      if (s.kind === "song") {
        const id = parseYouTubeId(s.youtubeId);
        if (!id) return null;
        return {
          kind: "song",
          youtubeId: id,
          title: s.title.trim(),
          artist: s.artist.trim(),
          dedication: s.dedication.trim(),
          ...(s.startSeconds ? { startSeconds: s.startSeconds } : {}),
          ...(s.endSeconds ? { endSeconds: s.endSeconds } : {}),
        };
      }
      const caption = (s.caption ?? "").trim();
      if (!s.audioUrl && !caption) return null;
      return { kind: "voice", audioUrl: s.audioUrl, durationMs: s.durationMs, caption };
    })
    .filter((s): s is Segment => s !== null);

  return {
    stationName: d.stationName.trim(),
    stationFrequency: d.stationFrequency.trim() || "98.3",
    senderName: d.senderName.trim(),
    senderCity: d.senderCity.trim(),
    recipientName: d.recipientName.trim(),
    recipientCity: d.recipientCity.trim(),
    segments,
    signOff: d.signOff.trim() || DEMO_DATA.signOff,
  };
}

export function useDedicationEditor() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, accessToken } = useAppSelector((s) => s.auth);

  const [content, setContent] = useState<DedicationData>(DEMO_DATA);
  const [mf, setMf] = useState<DedicationData>({ ...DEMO_DATA });
  const [editMode, setEditMode] = useState<EditMode>(null);
  const [pagePassword, setPagePassword] = useState("");
  const [pageId, setPageId] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [isPersonalized, setIsPersonalized] = useState(false);
  // Bumped on every save/publish so the radio remounts and replays from the
  // tuner. The show machine captures its data at construction, so a remount is
  // the only correct way to swap the running order.
  const [previewVersion, setPreviewVersion] = useState(0);
  const bumpPreview = useCallback(() => setPreviewVersion((v) => v + 1), []);

  const [showAuth, setShowAuth] = useState(false);
  const saving = false; // save-to-preview is local and synchronous; kept for EditSheet API parity
  const [publishing, setPublishing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastIdRef = useRef(0);

  const hasWipRef = useRef(false);
  const pendingPublishRef = useRef<{ data: DedicationData; password: string } | null>(null);

  // ── AI story fill ──────────────────────────────────────────────────────────
  //
  // Inert when the server has no schema for this slug: `schema` stays null,
  // StoryStarter renders nothing and the entry points below fall straight back
  // to the sheet this editor has always shown. The schema declares captions,
  // titles and dedications only — never the booth recordings or the YouTube
  // ids, which are not text and cannot be guessed.
  /** Anything a fill writes is work in progress — a re-seed must never eat it. */
  const applyStoryFill = useCallback((next: DedicationData) => {
    hasWipRef.current = true;
    setMf(next);
  }, []);

  const storyFill = useStoryFill<DedicationData>({
    slug: "dedication",
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
    const delay = toast.type === "publish" ? 1000 : 3500;
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), delay);
  }, []);

  const dismissToast = useCallback((id: number) => setToasts((prev) => prev.filter((t) => t.id !== id)), []);

  // ── Load an existing page (?edit=<id>) ──────────────────────────────────
  useEffect(() => {
    const id = searchParams.get("edit") || searchParams.get("id");
    if (!id || !isAuthenticated || !accessToken) return;
    let cancelled = false;

    fetch(`${BASE}/${id}`, { headers: headers() })
      .then((r) => r.json())
      .then((result) => {
        if (cancelled || !result.success || !result.data) return;
        const d = dbToDedicationData(result.data);
        setContent(d);
        setMf(d);
        hasWipRef.current = false;
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, accessToken, searchParams]);

  // ── Auto-resume publish after a successful login ────────────────────────
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
          body: JSON.stringify(dedicationDataToBody(data, password)),
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
          track(EVENTS.PUBLISH_SUCCESS, { template: TEMPLATE, source: "auth_deferred" });
          pushToast({ type: "publish", title: "On air! 📻", message: "Their station is live" });
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

  const displayData = editMode === "manual" ? mf : content;

  const updateMf = useCallback(<K extends keyof DedicationData>(key: K, val: DedicationData[K]) => {
    hasWipRef.current = true;
    setMf((p) => ({ ...p, [key]: val }));
  }, []);

  const updatePassword = useCallback((v: string) => {
    hasWipRef.current = true;
    setPagePassword(v);
  }, []);

  /** Work in progress always wins over a re-seed. */
  const seedForm = useCallback(
    (personalized: boolean) => {
      setMf((cur) => (hasWipRef.current ? cur : personalized ? { ...content } : { ...DEMO_DATA }));
      setEditMode("manual");
    },
    [content],
  );

  const handleEditClick = useCallback(() => seedForm(isPersonalized), [seedForm, isPersonalized]);
  const handleEditFromPreview = useCallback(() => seedForm(true), [seedForm]);

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
    const problem = validateShow(mf);
    if (problem) {
      pushToast({ type: "info", title: "Not ready to broadcast", message: problem.message });
      return;
    }
    const cleaned = cleanShow(mf);
    setContent(cleaned);
    setIsPersonalized(true);
    setEditMode("preview");
    bumpPreview();
    track(EVENTS.PAGE_SAVED, {
      template: TEMPLATE,
      has_password: Boolean(pagePassword),
      segments: cleaned.segments.length,
      songs: cleaned.segments.filter((s) => s.kind === "song").length,
    });
    pushToast({ type: "success", title: "Saved!", message: "Tune it in once, then publish 📻" });
  }, [mf, pagePassword, pushToast, bumpPreview]);

  const create = useCallback(async (): Promise<string | null> => {
    const res = await fetch(BASE, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify(dedicationDataToBody(content, pagePassword)),
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
        body: JSON.stringify(dedicationDataToBody(content, pagePassword)),
      });
    },
    [content, pagePassword, headers],
  );

  const publish = useCallback(async () => {
    track(EVENTS.PUBLISH_CLICKED, { template: TEMPLATE, is_authenticated: isAuthenticated });

    const problem = validateShow(content);
    if (problem) {
      track(EVENTS.PUBLISH_FAILED, { template: TEMPLATE, reason: "show_incomplete" });
      pushToast({ type: "info", title: "Finish the show first", message: problem.message });
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
      if (pubResult.success) {
        setShareUrl(String(pubResult.data.shareUrl));
        // Never throws, never blocks — the page is already live either way.
        await persistStory();
        track(EVENTS.PUBLISH_SUCCESS, { template: TEMPLATE, source: "direct" });
        pushToast({ type: "publish", title: "On air! 📻", message: "Their station is live" });
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
      setTimeout(() => setCopied(false), 2000);
      if (!url) pushToast({ type: "success", title: "Link copied!" });
    },
    [shareUrl, pushToast],
  );

  const handleShare = useCallback(() => {
    if (!shareUrl) return;
    openShareSheet({
      // Only a saved page can be consented to, and only by its owner.
      wall: pageId ? { templateType: "dedication", pageId } : undefined,
      url: shareUrl,
      password: pagePassword,
      title: "Tune in. This one's for you. 📻",
      accent: "#9a3412",
      slug: "dedication",
    });
  }, [shareUrl, pagePassword, pageId]);

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
    setPagePassword: updatePassword,
    updateMf,
    handleEditClick,
    handleStartCreate,
    handleStoryManual,
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
    dismissToast,

    showPublish: isPersonalized && !shareUrl && !publishing,
    showShare: Boolean(shareUrl),
    shareLabel: copied ? "Copied!" : "Share",
  };
}
