"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { API_URL, IS_NGROK } from "@/lib/config";
import { EVENTS } from "@/lib/analytics/events";
import { track } from "@/lib/analytics/track";
import {
  type PuzzleData,
  type EditMode,
  type Toast,
  DEMO_DATA,
  GRID,
  normaliseGrid,
  puzzleDataToBody,
  dbToPuzzleData,
} from "../components/types";

const DRAFT_KEY = "photo-puzzle_draft";
const BASE = `${API_URL}/photo-puzzle-pages`;

/** Slug reported on every analytics event from this editor. */
const TEMPLATE = "photo-puzzle";

/**
 * Validation is deliberately thin. A jigsaw that feels like work is a failed
 * build, and a form that argues with you before you have even seen the puzzle
 * is the same failure one screen earlier. Grid, melody, reveal image and the
 * final-piece message all have working defaults, so the only things we insist
 * on are the two names and enough of a letter to be worth assembling.
 */
export const MIN_LINES = 2;
export const MAX_LINES = GRID.maxPieces;

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
const readDraft = (): { data?: PuzzleData; password?: string; completed?: boolean } | null => {
  try {
    const raw = draftStore()?.getItem(DRAFT_KEY) ?? window.sessionStorage.getItem(DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
};

/** Lines with something actually written on them. Blank rows are scaffolding. */
export const writtenLines = (d: PuzzleData) => d.lines.filter((l) => l.trim()).length;

export function usePhotoPuzzleEditor() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, accessToken } = useAppSelector((s) => s.auth);

  const [content, setContent] = useState<PuzzleData>(DEMO_DATA);
  const [mf, setMf] = useState<PuzzleData>({ ...DEMO_DATA });
  const [editMode, setEditMode] = useState<EditMode>(null);
  const [pagePassword, setPagePassword] = useState("");
  const [pageId, setPageId] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [isPersonalized, setIsPersonalized] = useState(false);
  // Bumped whenever a *new* preview should be shown → remounts the puzzle so it
  // recuts with the new grid/photo and starts from an empty board.
  const [previewVersion, setPreviewVersion] = useState(0);
  const bumpPreview = useCallback(() => setPreviewVersion((v) => v + 1), []);

  const [showAuth, setShowAuth] = useState(false);
  const saving = false; // save-to-preview is local/synchronous; kept for EditSheet API parity
  const [publishing, setPublishing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastIdRef = useRef(0);

  /**
   * ── THE BUG WE DO NOT COPY ────────────────────────────────────────────────
   * `useApologyEditor` / `useCatchEditor` do
   *     setMf(isPersonalized ? {...content} : {...DEMO_DATA})
   * inside `handleEditClick`. Combined with keystroke autosave that means: you
   * write half a letter, close the tab, come back, the draft restores into `mf`
   * — and the very first tap on **Create** overwrites it with DEMO_DATA, which
   * the autosave effect then writes straight back over the draft. The work is
   * gone and there is nothing to undo it with.
   *
   * So this hook tracks whether `mf` currently holds restored draft content.
   * If it does, opening the sheet leaves `mf` completely alone. Only a truly
   * untouched editor (no draft, not personalised) gets seeded from DEMO_DATA.
   */
  const hasRestoredDraftRef = useRef(false);

  // Holds the draft when the user hits Publish while logged out → auto-resumes after login.
  const pendingPublishRef = useRef<{ data: PuzzleData; password: string } | null>(null);

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

  // ── Load existing page (?edit=<id>) or restore a local draft ────────────────
  useEffect(() => {
    const id = searchParams.get("edit") || searchParams.get("id");
    if (id && isAuthenticated && accessToken) {
      fetch(`${BASE}/${id}`, { headers: headers() })
        .then((r) => r.json())
        .then((result) => {
          if (result.success && result.data) {
            const d = dbToPuzzleData(result.data);
            setContent(d);
            setMf(d);
            hasRestoredDraftRef.current = true; // server content is real content too
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
    if (draft?.data && Array.isArray(draft.data.lines) && Array.isArray(draft.data.melody)) {
      // Restored verbatim, NOT through dbToPuzzleData: a work-in-progress draft
      // legitimately contains blank lines, and the wire coercer would tidy them
      // away mid-sentence. They only get cleaned on Save.
      const d = draft.data;
      setMf(d);
      hasRestoredDraftRef.current = true;
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
        const res = await fetch(BASE, { method: "POST", headers: headers(), body: JSON.stringify(puzzleDataToBody(data, password)) });
        const result = await res.json();
        if (!result.success) throw new Error("Save failed");
        const savedId = result.data._id as string;
        setPageId(savedId);
        setContent(data);
        setIsPersonalized(true);

        const pubRes = await fetch(`${BASE}/${savedId}/publish`, { method: "POST", headers: headers() });
        const pubResult = await pubRes.json();
        if (pubResult.success) {
          // The share URL is authored by the server — never assembled here.
          setShareUrl(String(pubResult.data.shareUrl));
          clearDraft();
          track(EVENTS.PUBLISH_SUCCESS, { template: TEMPLATE, source: "auth_deferred" });
          pushToast({ type: "publish", title: "Published! 🧩", message: "Send it — you keep the last piece" });
        } else {
          track(EVENTS.PUBLISH_FAILED, {
            template: TEMPLATE,
            source: "auth_deferred",
            reason: typeof pubResult?.error === "string" ? pubResult.error : "publish_rejected",
          });
          pushToast({ type: "info", title: "Publish didn't go through", message: "Saved — tap Publish to go live" });
        }
      } catch {
        track(EVENTS.PUBLISH_FAILED, { template: TEMPLATE, source: "auth_deferred", reason: "save_error" });
        pushToast({ type: "info", title: "Couldn't save that", message: "Please try again" });
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
    // Anything the sheet has written is now worth protecting from a later reset.
    hasRestoredDraftRef.current = true;
  }, [mf, pagePassword, editMode]);

  const displayData = editMode === "manual" ? mf : content;

  const updateMf = useCallback((key: keyof PuzzleData, val: unknown) => setMf((p) => ({ ...p, [key]: val })), []);

  const handleEditClick = useCallback(() => {
    // See `hasRestoredDraftRef` above. A restored draft is never overwritten by
    // opening the sheet; we only seed from DEMO_DATA on a genuinely fresh start.
    if (isPersonalized) setMf({ ...content });
    else if (!hasRestoredDraftRef.current) setMf({ ...DEMO_DATA });
    setEditMode("manual");
  }, [isPersonalized, content]);

  const handleEditFromPreview = useCallback(() => {
    setMf({ ...content });
    setEditMode("manual");
  }, [content]);

  // Save (locally) & jump to preview
  const handleSave = useCallback(() => {
    if (!mf.senderName.trim()) {
      pushToast({ type: "info", title: "Sign it with your name", message: "So they know who kept the last piece" });
      return;
    }
    if (!mf.recipientName.trim()) {
      pushToast({ type: "info", title: "Who is it for?", message: "Add their name and you're set" });
      return;
    }

    const written = writtenLines(mf);
    if (written < MIN_LINES) {
      pushToast({
        type: "info",
        title: written === 0 ? "Write a line or two" : "One more line",
        message: "Each piece hands over a line — two is plenty to start",
      });
      return;
    }

    // Blank rows are scaffolding, not letter. Everything else has a default.
    const grid = normaliseGrid(mf.cols, mf.rows);
    const cleaned: PuzzleData = {
      ...mf,
      cols: grid.cols,
      rows: grid.rows,
      senderName: mf.senderName.trim(),
      recipientName: mf.recipientName.trim(),
      imageUrl: mf.imageUrl.trim(),
      revealImageUrl: mf.revealImageUrl.trim(),
      lines: mf.lines.map((l) => l.trim()).filter(Boolean).slice(0, MAX_LINES),
      melody: (mf.melody.length ? mf.melody : DEMO_DATA.melody).slice(0, GRID.maxPieces),
      finalPieceMessage: mf.finalPieceMessage.trim() || DEMO_DATA.finalPieceMessage,
      closingLine: mf.closingLine.trim() || DEMO_DATA.closingLine,
    };

    setContent(cleaned);
    setIsPersonalized(true);
    setEditMode("preview");
    bumpPreview(); // recut the puzzle with the new grid and photo
    saveDraft({ data: mf, password: pagePassword, completed: true });
    track(EVENTS.PAGE_SAVED, {
      template: TEMPLATE,
      has_password: Boolean(pagePassword),
      lines: cleaned.lines.length,
      pieces: grid.cols * grid.rows,
    });
    pushToast({ type: "success", title: "Saved 🧩", message: "Play it once, then publish" });
  }, [mf, pagePassword, pushToast, bumpPreview]);

  const create = useCallback(async (): Promise<string | null> => {
    const res = await fetch(BASE, { method: "POST", headers: headers(), body: JSON.stringify(puzzleDataToBody(content, pagePassword)) });
    const result = await res.json();
    if (!result.success) return null;
    setPageId(result.data._id);
    return result.data._id as string;
  }, [content, pagePassword, headers]);

  const update = useCallback(async (id: string) => {
    await fetch(`${BASE}/${id}`, { method: "PUT", headers: headers(), body: JSON.stringify(puzzleDataToBody(content, pagePassword)) });
  }, [content, pagePassword, headers]);

  const publish = useCallback(async () => {
    // Recorded before any validation or auth check so this measures *intent*.
    track(EVENTS.PUBLISH_CLICKED, { template: TEMPLATE, is_authenticated: isAuthenticated });

    if (!content.senderName.trim() || !content.recipientName.trim() || writtenLines(content) < MIN_LINES) {
      track(EVENTS.PUBLISH_FAILED, { template: TEMPLATE, reason: "letter_incomplete" });
      pushToast({ type: "info", title: "Almost — a couple of blanks left", message: "Both names and at least two lines" });
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

      const pubRes = await fetch(`${BASE}/${id}/publish`, { method: "POST", headers: headers() });
      const pubResult = await pubRes.json();
      if (pubResult.success) {
        setShareUrl(String(pubResult.data.shareUrl));
        clearDraft();
        track(EVENTS.PUBLISH_SUCCESS, { template: TEMPLATE, source: "direct" });
        pushToast({ type: "publish", title: "Published! 🧩", message: "Send it — you keep the last piece" });
      } else {
        track(EVENTS.PUBLISH_FAILED, {
          template: TEMPLATE,
          source: "direct",
          reason: typeof pubResult?.error === "string" ? pubResult.error : "publish_rejected",
        });
        pushToast({ type: "info", title: "Publish didn't go through", message: "Please try again" });
      }
    } catch {
      track(EVENTS.PUBLISH_FAILED, { template: TEMPLATE, source: "direct", reason: "network_error" });
      pushToast({ type: "info", title: "Publish didn't go through", message: "Please try again" });
    } finally {
      setPublishing(false);
    }
  }, [content, pagePassword, isAuthenticated, accessToken, pageId, create, update, headers, pushToast]);

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
    if (typeof navigator !== "undefined" && "share" in navigator) {
      navigator.share({ title: "I made you something. The last piece is with me. 🧩", url: shareUrl }).catch(() => {});
    } else {
      handleCopy();
    }
  }, [shareUrl, handleCopy]);

  const goBack = useCallback(() => router.push("/templates"), [router]);

  const shareId = shareUrl ? shareUrl.split("/").pop() ?? null : null;

  return {
    content, mf, displayData, editMode, pagePassword, pageId, shareUrl, shareId,
    isPersonalized, showAuth, saving, publishing, copied, toasts, previewVersion,

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
