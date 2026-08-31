"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { useStoryFill } from "@/hooks/useStoryFill";
import { API_URL, IS_NGROK } from "@/lib/config";
import { EVENTS } from "@/lib/analytics/events";
import { track } from "@/lib/analytics/track";
import {
  type CatchData,
  type EditMode,
  type Toast,
  DEMO_DATA,
  catchDataToBody,
  dbToCatchData,
} from "../components/types";
import { openShareSheet } from "@/lib/share/shareBus";
import { publishFetch } from "@/lib/paywall/publishRequest";

const DRAFT_KEY = "catch_draft";
const BASE = `${API_URL}/catch-pages`;

/** Slug reported on every analytics event from this editor. */
const TEMPLATE = "catch";

/** The letter needs enough pieces to pace across `durationMs`. */
export const MIN_GOOD = 8;
export const MAX_GOOD = 14;
export const MIN_BAD = 3;
export const MAX_BAD = 6;

// Draft is persisted to localStorage so a refresh (or an accidental tab close)
// keeps every line the sender wrote. Falls back to sessionStorage if unavailable.
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
const readDraft = (): { data?: CatchData; password?: string; completed?: boolean } | null => {
  try {
    const raw = draftStore()?.getItem(DRAFT_KEY) ?? window.sessionStorage.getItem(DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
};

/** Lines are the letter. An object with no line on it is not a piece of anything. */
export const writtenCount = (d: CatchData) => d.goodItems.filter((g) => g.line.trim()).length;

export function useCatchEditor() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, accessToken } = useAppSelector((s) => s.auth);

  const [content, setContent] = useState<CatchData>(DEMO_DATA);
  const [mf, setMf] = useState<CatchData>({ ...DEMO_DATA });
  const [editMode, setEditMode] = useState<EditMode>(null);
  const [pagePassword, setPagePassword] = useState("");
  const [pageId, setPageId] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [isPersonalized, setIsPersonalized] = useState(false);

  // ── AI story fill ───────────────────────────────────────────────────────────
  // Only the letter around the game: the labels and lines on the good items,
  // the two names and the closing line. Speeds, spawn rates, `badItems` and
  // `durationMs` are not on the schema, so the run itself is untouched.
  const fill = useStoryFill<CatchData>({
    slug: "catch",
    demo: DEMO_DATA,
    current: mf,
    onFilled: setMf,
  });

  // Mounted the first time Create is tapped. The starter renders nothing at all
  // when this template has no schema.
  const [storyStarter, setStoryStarter] = useState(false);

  // Bumped whenever a *new* preview should be shown → remounts the game so the
  // run restarts from the intro with the freshly-written letter.
  const [previewVersion, setPreviewVersion] = useState(0);
  const bumpPreview = useCallback(() => setPreviewVersion((v) => v + 1), []);

  const [showAuth, setShowAuth] = useState(false);
  const saving = false; // save-to-preview is local/synchronous; kept for EditSheet API parity
  const [publishing, setPublishing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastIdRef = useRef(0);

  // Holds the draft when the user hits Publish while logged out → auto-resumes after login.
  const pendingPublishRef = useRef<{ data: CatchData; password: string } | null>(null);

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
            const d = dbToCatchData(result.data);
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

    // Restore a locally-saved draft on refresh. The typed form data (mf) always
    // comes back; if it was saved from the preview ("completed"), reopen the preview.
    const draft = readDraft();
    if (draft?.data && Array.isArray(draft.data.goodItems) && Array.isArray(draft.data.badItems)) {
      // Restored verbatim, NOT through dbToCatchData: a work-in-progress draft
      // legitimately contains half-written objects with empty lines, and the
      // wire coercer strips those. They only get cleaned on Save.
      const d = draft.data;
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

  // ── Auto-resume publish after successful auth ───────────────────────────────
  useEffect(() => {
    if (!isAuthenticated || !accessToken || !pendingPublishRef.current) return;
    const { data, password } = pendingPublishRef.current;
    pendingPublishRef.current = null;

    setPublishing(true);
    setEditMode("preview");
    (async () => {
      try {
        const res = await fetch(BASE, { method: "POST", headers: headers(), body: JSON.stringify(catchDataToBody(data, password)) });
        const result = await res.json();
        if (!result.success) throw new Error("Save failed");
        const savedId = result.data._id as string;
        setPageId(savedId);
        setContent(data);
        setIsPersonalized(true);

        const pubRes = await publishFetch(
          { slug: TEMPLATE, templateType: "catch", pageId: savedId, templateTitle: "Catch" },
          () => fetch(`${BASE}/${savedId}/publish`, { method: "POST", headers: headers() })
        );
        const pubResult = await pubRes.json();
        if (pubResult.success) {
          // The share URL is authored by the server — never assembled here.
          setShareUrl(String(pubResult.data.shareUrl));
          await fill.persistStory();
          clearDraft();
          track(EVENTS.PUBLISH_SUCCESS, { template: TEMPLATE, source: "auth_deferred" });
          pushToast({ type: "publish", title: "Published! 💛", message: "Their letter is in the air" });
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

  // ── Auto-save WIP draft on every keystroke ──────────────────────────────────
  useEffect(() => {
    if (editMode !== "manual") return;
    saveDraft({ data: mf, password: pagePassword, completed: false });
  }, [mf, pagePassword, editMode]);

  const displayData = editMode === "manual" ? mf : content;

  const updateMf = useCallback((key: keyof CatchData, val: unknown) => setMf((p) => ({ ...p, [key]: val })), []);

  const handleEditClick = useCallback(() => {
    setMf(isPersonalized ? { ...content } : { ...DEMO_DATA });
    // The starter goes first, but only while there is a schema to fill from and
    // only until the sender has said no once. Everything else opens the form
    // exactly as it did before.
    if (fill.schema && fill.mode !== "manual") {
      setStoryStarter(true);
      return;
    }
    setEditMode("manual");
  }, [isPersonalized, content, fill.schema, fill.mode]);

  /** The starter's only exit — into the same form Create would have opened. */
  const openManualForm = useCallback(() => setEditMode("manual"), []);

  const handleEditFromPreview = useCallback(() => {
    setMf({ ...content });
    setEditMode("manual");
  }, [content]);

  // Save (locally) & jump to preview
  const handleSave = useCallback(() => {
    if (!mf.senderName.trim()) { pushToast({ type: "info", title: "Add your name first" }); return; }

    const written = writtenCount(mf);
    if (written < MIN_GOOD) {
      const need = MIN_GOOD - written;
      pushToast({
        type: "info",
        title: `${need} more ${need === 1 ? "line" : "lines"} to go`,
        message: `A letter needs at least ${MIN_GOOD} pieces to fall`,
      });
      return;
    }
    if (mf.badItems.length < MIN_BAD) {
      pushToast({ type: "info", title: `Add ${MIN_BAD - mf.badItems.length} more to dodge`, message: "Petty is perfect" });
      return;
    }

    // Only objects that actually carry a line get thrown into the sky.
    const cleaned: CatchData = {
      ...mf,
      goodItems: mf.goodItems.filter((g) => g.line.trim()).slice(0, MAX_GOOD),
      badItems: mf.badItems.slice(0, MAX_BAD),
      closingLine: mf.closingLine.trim() || DEMO_DATA.closingLine,
    };

    setContent(cleaned);
    setIsPersonalized(true);
    setEditMode("preview");
    bumpPreview(); // fresh run: back to the intro screen with the new letter
    saveDraft({ data: mf, password: pagePassword, completed: true });
    track(EVENTS.PAGE_SAVED, { template: TEMPLATE, has_password: Boolean(pagePassword), lines: cleaned.goodItems.length });
    pushToast({ type: "success", title: "Saved!", message: "Play it once, then publish 💛" });
  }, [mf, pagePassword, pushToast, bumpPreview]);

  const create = useCallback(async (): Promise<string | null> => {
    const res = await fetch(BASE, { method: "POST", headers: headers(), body: JSON.stringify(catchDataToBody(content, pagePassword)) });
    const result = await res.json();
    if (!result.success) return null;
    setPageId(result.data._id);
    return result.data._id as string;
  }, [content, pagePassword, headers]);

  const update = useCallback(async (id: string) => {
    await fetch(`${BASE}/${id}`, { method: "PUT", headers: headers(), body: JSON.stringify(catchDataToBody(content, pagePassword)) });
  }, [content, pagePassword, headers]);

  const publish = useCallback(async () => {
    // Recorded before any validation or auth check so this measures *intent*.
    track(EVENTS.PUBLISH_CLICKED, { template: TEMPLATE, is_authenticated: isAuthenticated });

    if (!content.senderName.trim() || writtenCount(content) < MIN_GOOD) {
      track(EVENTS.PUBLISH_FAILED, { template: TEMPLATE, reason: "letter_incomplete" });
      pushToast({ type: "info", title: "Finish the letter first", message: `At least ${MIN_GOOD} lines` });
      setMf({ ...content });
      setEditMode("manual");
      return;
    }

    // AUTH-DEFERRED, never auth-gated: stash the intent and let the effect above
    // finish the job the moment the user comes back logged in.
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

      const pubRes = await publishFetch(
        { slug: TEMPLATE, templateType: "catch", pageId: id, templateTitle: "Catch" },
        () => fetch(`${BASE}/${id}/publish`, { method: "POST", headers: headers() })
      );
      const pubResult = await pubRes.json();
      if (pubResult.success) {
        setShareUrl(String(pubResult.data.shareUrl));
        await fill.persistStory();
        clearDraft();
        track(EVENTS.PUBLISH_SUCCESS, { template: TEMPLATE, source: "direct" });
        pushToast({ type: "publish", title: "Published! 💛", message: "Their letter is in the air" });
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
  }, [content, pagePassword, isAuthenticated, accessToken, pageId, create, update, headers, pushToast, fill]);

  const closeAuth = useCallback(() => { setShowAuth(false); pendingPublishRef.current = null; }, []);
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
    openShareSheet({
      url: shareUrl,
      password: pagePassword,
      title: "I wrote you something. It's in pieces. 💛",
      accent: "#0369a1",
      senderName: content.senderName,
      slug: "catch",
    });
  }, [shareUrl, content.senderName, pagePassword]);

  const goBack = useCallback(() => router.push("/templates"), [router]);

  const shareId = shareUrl ? shareUrl.split("/").pop() ?? null : null;

  return {
    content, mf, displayData, editMode, pagePassword, pageId, shareUrl, shareId,
    isPersonalized, showAuth, saving, publishing, copied, toasts, previewVersion,

    fill, storyStarter, openManualForm,

    setEditMode, setPagePassword, updateMf,
    handleEditClick, handleEditFromPreview, handleSave,
    create, update, publish,
    closeAuth, closeAuthSuccess, handleCopy, handleShare, goBack,
    pushToast, dismissToast,

    showPublish: isPersonalized && !shareUrl && !publishing,
    showShare: !!shareUrl,
    shareLabel: copied ? "Copied!" : "Share",
  };
}
