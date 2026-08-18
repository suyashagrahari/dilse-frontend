"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { useStoryFill } from "@/hooks/useStoryFill";
import { API_URL, IS_NGROK } from "@/lib/config";
import { EVENTS } from "@/lib/analytics/events";
import { track } from "@/lib/analytics/track";
import {
  type FlagsData,
  type EditMode,
  type Toast,
  DEMO_DATA,
  flagsDataToBody,
  dbToFlagsData,
} from "../components/types";
import { openShareSheet } from "@/lib/share/shareBus";

const DRAFT_KEY = "flags_draft";
const BASE = `${API_URL}/flags-pages`;

/** Slug reported on every analytics event from this editor. */
const TEMPLATE = "flags";

// Draft is persisted to localStorage so a refresh (or an accidental tab close)
// keeps everything typed so far. This matters more here than on any other
// template: a full deck is eleven statements and thirty-three responses, and a
// sender who loses that once never comes back. Falls back to sessionStorage.
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
const readDraft = (): { data?: FlagsData; password?: string; completed?: boolean } | null => {
  try {
    const raw = draftStore()?.getItem(DRAFT_KEY) ?? window.sessionStorage.getItem(DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
};

export function useFlagsEditor() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, accessToken } = useAppSelector((s) => s.auth);

  const [content, setContent] = useState<FlagsData>(DEMO_DATA);
  const [mf, setMf] = useState<FlagsData>(() => structuredCloneish(DEMO_DATA));
  const [editMode, setEditMode] = useState<EditMode>(null);
  const [pagePassword, setPagePassword] = useState("");
  const [pageId, setPageId] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [isPersonalized, setIsPersonalized] = useState(false);

  // ── AI story fill ───────────────────────────────────────────────────────────
  // Writes the copy around the mechanic only — card statements and the three
  // responses. `truth`, `kind` and the drag-locked sincere card are not on the
  // schema, so nothing here can change how the deck plays.
  const fill = useStoryFill<FlagsData>({
    slug: "flags",
    demo: DEMO_DATA,
    current: mf,
    onFilled: setMf,
  });

  // Mounted the first time Create is tapped. The starter itself renders nothing
  // when this template has no schema, so this is only ever an extra boolean.
  const [storyStarter, setStoryStarter] = useState(false);

  // Bumped whenever a *new* preview should be shown → remounts the template so
  // the deck restarts from the profile screen with the latest data rather than
  // leaving the sender mid-deck on cards they just rewrote.
  const [previewVersion, setPreviewVersion] = useState(0);
  const bumpPreview = useCallback(() => setPreviewVersion((v) => v + 1), []);

  const [showAuth, setShowAuth] = useState(false);
  const saving = false; // save-to-preview is local/synchronous; kept for EditSheet API parity
  const [publishing, setPublishing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastIdRef = useRef(0);

  // Set to true once the draft has been written at least once, so the EditSheet
  // can show "saved" and the sender can trust closing the tab mid-deck.
  const [draftSavedAt, setDraftSavedAt] = useState<number | null>(null);

  // Holds the payload when the user hits Publish while logged out → auto-resume after login.
  const pendingPublishRef = useRef<{ data: FlagsData; password: string } | null>(null);

  // True once a saved draft has been loaded back into `mf`. Without this, the
  // first click on Create would reset `mf` to the example and the autosave
  // effect would immediately overwrite the stored draft with it — on this
  // template that is thirty-three written responses gone in one tap.
  const restoredDraftRef = useRef(false);

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
            const d = dbToFlagsData(result.data);
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

    // Restore a locally-saved draft. The typed form data always comes back; if it
    // was saved from the preview ("completed") we reopen the preview too.
    const draft = readDraft();
    if (draft?.data) {
      // Re-coerced through dbToFlagsData: a hand-edited or half-written draft in
      // storage must not be able to crash the editor on load.
      const restored = dbToFlagsData(draft.data as unknown as Record<string, unknown>);
      restoredDraftRef.current = true;
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
        const res = await fetch(BASE, { method: "POST", headers: headers(), body: JSON.stringify(flagsDataToBody(data, password)) });
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
          await fill.persistStory();
          clearDraft();
          // The auth-deferred path: Publish was clicked logged out, login happened,
          // and this resumed automatically. Tracked apart from the direct path so
          // the login detour's completion rate stays visible.
          track(EVENTS.PUBLISH_SUCCESS, { template: TEMPLATE, source: "auth_deferred" });
          pushToast({ type: "publish", title: "Published 🚩", message: "Your profile is live" });
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

  // ── Autosave every keystroke while the sheet is open ────────────────────────
  // Not debounced on purpose. The deck is long enough that the sender will leave
  // and come back, and a lost draft here costs thirty-three written responses.
  useEffect(() => {
    if (editMode !== "manual") return;
    saveDraft({ data: mf, password: pagePassword, completed: false });
    setDraftSavedAt(Date.now());
  }, [mf, pagePassword, editMode]);

  const displayData = editMode === "manual" ? mf : content;

  const updateMf = useCallback((key: keyof FlagsData, val: unknown) => setMf((p) => ({ ...p, [key]: val })), []);

  const handleEditClick = useCallback(() => {
    if (isPersonalized) setMf(structuredCloneish(content));
    else if (!restoredDraftRef.current) setMf(structuredCloneish(DEMO_DATA));
    // else: an in-progress draft is already in `mf` — reopen it untouched.
    // The starter goes first, but only while there is a schema to fill from and
    // only until the sender has said no once. Every other path opens the form
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
    setMf(structuredCloneish(content));
    setEditMode("manual");
  }, [content]);

  // Save (locally) & jump to the preview.
  const handleSave = useCallback(() => {
    if (!mf.sender.name.trim()) { pushToast({ type: "info", title: "Add your name first" }); return; }
    const usable = mf.cards.filter((c) => c.statement.trim()).length;
    if (usable === 0) { pushToast({ type: "info", title: "Write at least one card" }); return; }

    setContent(mf);
    setIsPersonalized(true);
    setEditMode("preview");
    bumpPreview();
    saveDraft({ data: mf, password: pagePassword, completed: true });
    track(EVENTS.PAGE_SAVED, { template: TEMPLATE, has_password: Boolean(pagePassword) });

    // Surfaced again at save time, not only inside the sheet: a blank response is
    // the one thing that silently breaks the mechanic, and this is the last
    // moment before it ships.
    const gaps = mf.cards.filter(
      (c) => c.kind === "flag" && c.statement.trim() &&
        (!c.responses.red.trim() || !c.responses.green.trim() || !c.responses.complicated.trim()),
    ).length;
    if (gaps > 0) {
      pushToast({
        type: "info",
        title: `${gaps} card${gaps === 1 ? "" : "s"} still missing an answer`,
        message: "Swipe that way and the card flips to nothing",
      });
    } else {
      pushToast({ type: "success", title: "Saved", message: "Swipe through it, then publish" });
    }
  }, [mf, pagePassword, pushToast, bumpPreview]);

  const create = useCallback(async (): Promise<string | null> => {
    const res = await fetch(BASE, { method: "POST", headers: headers(), body: JSON.stringify(flagsDataToBody(content, pagePassword)) });
    const result = await res.json();
    if (!result.success) return null;
    setPageId(result.data._id);
    return result.data._id as string;
  }, [content, pagePassword, headers]);

  const update = useCallback(async (id: string) => {
    await fetch(`${BASE}/${id}`, { method: "PUT", headers: headers(), body: JSON.stringify(flagsDataToBody(content, pagePassword)) });
  }, [content, pagePassword, headers]);

  const publish = useCallback(async () => {
    // Recorded before any validation or auth check, so this measures *intent*.
    // The gap to PUBLISH_SUCCESS is the entire publish drop-off.
    track(EVENTS.PUBLISH_CLICKED, { template: TEMPLATE, is_authenticated: isAuthenticated });

    if (!content.sender.name.trim()) {
      track(EVENTS.PUBLISH_FAILED, { template: TEMPLATE, reason: "missing_sender_name" });
      pushToast({ type: "info", title: "Add your name first", message: "It's the first thing they see" });
      setMf(structuredCloneish(content));
      setEditMode("manual");
      return;
    }
    if (!isAuthenticated || !accessToken) {
      // The auth wall — deferred, never gating. The intent lives in a ref and the
      // effect above resumes it the moment auth lands.
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
        await fill.persistStory();
        clearDraft();
        track(EVENTS.PUBLISH_SUCCESS, { template: TEMPLATE, source: "direct" });
        pushToast({ type: "publish", title: "Published 🚩", message: "Your profile is live" });
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
      if (!url) pushToast({ type: "success", title: "Link copied" });
    }
  }, [shareUrl, pushToast]);

  const handleShare = useCallback(() => {
    if (!shareUrl) return;
    openShareSheet({
      url: shareUrl,
      password: pagePassword,
      title: "1 profile near you.",
      accent: "#be123c",
      slug: "flags",
    });
  }, [shareUrl, pagePassword]);

  const goBack = useCallback(() => router.push("/templates"), [router]);

  // Always from the server response — never constructed here.
  const shareId = shareUrl ? shareUrl.split("/").pop() ?? null : null;

  return {
    content, mf, displayData, editMode, pagePassword, pageId, shareUrl, shareId,
    isPersonalized, showAuth, saving, publishing, copied, toasts, previewVersion, draftSavedAt,

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

/**
 * Deep-ish clone of the form data.
 *
 * `{ ...DEMO_DATA }` is not enough here: `cards[i].responses` and `sender` are
 * nested objects, and a shallow copy would let the editor mutate the shared
 * DEMO_DATA constant — after which "reset to the example" no longer resets.
 */
function structuredCloneish(d: FlagsData): FlagsData {
  return {
    sender: { ...d.sender },
    recipientName: d.recipientName,
    cards: d.cards.map((c) => ({ ...c, responses: { ...c.responses } })),
    finalCard: d.finalCard,
  };
}
