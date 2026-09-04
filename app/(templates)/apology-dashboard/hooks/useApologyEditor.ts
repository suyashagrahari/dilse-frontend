"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { useStoryFill } from "@/hooks/useStoryFill";
import { API_URL, IS_NGROK } from "@/lib/config";
import { EVENTS } from "@/lib/analytics/events";
import { track } from "@/lib/analytics/track";
import {
  type ApologyData,
  type EditMode,
  type Toast,
  DEMO_DATA,
  apologyDataToBody,
  dbToApologyData,
} from "../components/types";
import { openShareSheet } from "@/lib/share/shareBus";
import { ensurePublishAllowed } from "@/lib/paywall/publishRequest";
import { useDraft } from "@/lib/draft/useDraft";
import { persistDraft } from "@/lib/draft/persistDraft";

/**
 * `persistStory` is being added to `useStoryFill` separately. Typed optional
 * here so this editor compiles on either side of that landing — the call below
 * is simply a no-op until the method exists, and needs no change when it does.
 */
type WithPersistStory = { persistStory?: () => Promise<unknown> };

const DRAFT_KEY = "apology_draft";
const BASE = `${API_URL}/apology-dashboard-pages`;

/** Slug reported on every analytics event from this editor. */
const TEMPLATE = "apology-dashboard";

// Draft is persisted to localStorage so a page refresh (or accidental tab close)
// keeps everything the user filled in. Falls back to sessionStorage if unavailable.
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
const readDraft = (): { data?: ApologyData; password?: string; completed?: boolean } | null => {
  try {
    const raw = draftStore()?.getItem(DRAFT_KEY) ?? window.sessionStorage.getItem(DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
};

export function useApologyEditor() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, accessToken } = useAppSelector((s) => s.auth);

  const [content, setContent] = useState<ApologyData>(DEMO_DATA);
  const [mf, setMf] = useState<ApologyData>({ ...DEMO_DATA });
  const [editMode, setEditMode] = useState<EditMode>(null);

  // ── AI story-fill ───────────────────────────────────────────────────────────
  //
  // `mf` in, `mf` out — the merge is `applyPatch`'s job, and anything already
  // differing from DEMO_DATA is left alone. Until the server has a config for
  // this slug `fill.schema` stays null and every consumer renders nothing, so
  // the editor is unchanged.
  const fill = useStoryFill<ApologyData>({
    slug: TEMPLATE,
    demo: DEMO_DATA,
    current: mf,
    onFilled: setMf,
  });

  // Called on the success path of both publishes. Never allowed to affect the
  // result: a story that failed to save is not a page that failed to publish.
  const persistStory = useCallback(async () => {
    try {
      await (fill as unknown as WithPersistStory).persistStory?.();
    } catch {}
  }, [fill]);
  const [pagePassword, setPagePassword] = useState("");
  const [pageId, setPageId] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [isPersonalized, setIsPersonalized] = useState(false);
  // bumped whenever a *new* preview should be shown → forces the live dashboard to
  // remount so every interaction (scratch, whack, anger, music) starts fresh with the
  // latest form data + selected song.
  const [previewVersion, setPreviewVersion] = useState(0);
  const bumpPreview = useCallback(() => setPreviewVersion((v) => v + 1), []);

  const [showAuth, setShowAuth] = useState(false);
  const saving = false; // save-to-preview is local/synchronous; kept for EditSheet API parity
  const [publishing, setPublishing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastIdRef = useRef(0);

  // Holds draft when user tries to publish while unauthenticated → auto-resume after login.
  const pendingPublishRef = useRef<{ data: ApologyData; password: string } | null>(null);

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
            const d = dbToApologyData(result.data);
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

    // Restore a locally-saved draft on refresh. The typed form data (mf) always comes
    // back; if it was saved from the preview ("completed"), we also reopen the preview.
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
        const res = await fetch(BASE, { method: "POST", headers: headers(), body: JSON.stringify(apologyDataToBody(data, password)) });
        const result = await res.json();
        if (!result.success) throw new Error("Save failed");
        const savedId = result.data._id as string;
        setPageId(savedId);
        setContent(data);
        setIsPersonalized(true);

        // Clear the paywall BEFORE publishing, so nothing spins behind the sheet,
        // and the publish request is only made when it will succeed.
        const gate = await ensurePublishAllowed(
          { slug: TEMPLATE, templateType: "apology-dashboard", pageId: savedId, templateTitle: "Apology Dashboard" },
          setPublishing,
        );
        if (gate === "cancelled") return;

        const pubRes = await fetch(`${BASE}/${savedId}/publish`, { method: "POST", headers: headers() });
        const pubResult = await pubRes.json();
        if (pubResult.success) {
          setShareUrl(String(pubResult.data.shareUrl));
          clearDraft();
          // The auth-deferred path: user hit Publish while logged out, logged in,
          // and this resumed automatically. Tracked separately from the direct
          // path so the login detour's completion rate is visible.
          track(EVENTS.PUBLISH_SUCCESS, { template: TEMPLATE, source: "auth_deferred" });
          pushToast({ type: "publish", title: "Published! 💗", message: "Your apology is now live" });
          await persistStory();
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

  // ── Auto-save WIP draft while editing ───────────────────────────────────────
  useEffect(() => {
    if (editMode !== "manual" && editMode !== "choose") return;
    saveDraft({ data: mf, password: pagePassword, completed: false });
  }, [mf, pagePassword, editMode]);

  const displayData = editMode === "manual" || editMode === "choose" ? mf : content;

  const updateMf = useCallback((key: keyof ApologyData, val: unknown) => setMf((p) => ({ ...p, [key]: val })), []);

  const handleEditClick = useCallback(() => {
    setMf(isPersonalized ? { ...content } : { ...DEMO_DATA });
    setEditMode("manual");
  }, [isPersonalized, content]);

  const handleEditFromPreview = useCallback(() => {
    setMf({ ...content });
    setEditMode("manual");
  }, [content]);

  // Save (locally) & jump to preview
  const handleSave = useCallback(() => {
    if (!mf.senderName.trim()) { pushToast({ type: "info", title: "Add your name first" }); return; }
    setContent(mf);
    setIsPersonalized(true);
    setEditMode("preview");
    bumpPreview(); // fresh preview: re-cover scratch, reset whack/anger, use the chosen song
    saveDraft({ data: mf, password: pagePassword, completed: true });
    // The form was completed and the preview reached — the step before Publish.
    track(EVENTS.PAGE_SAVED, { template: TEMPLATE, has_password: Boolean(pagePassword) });
    pushToast({ type: "success", title: "Saved!", message: "Preview it, then publish 💗" });
  }, [mf, pagePassword, pushToast, bumpPreview]);

  const create = useCallback(async (): Promise<string | null> => {
    const res = await fetch(BASE, { method: "POST", headers: headers(), body: JSON.stringify(apologyDataToBody(content, pagePassword)) });
    const result = await res.json();
    if (!result.success) return null;
    setPageId(result.data._id);
    return result.data._id as string;
  }, [content, pagePassword, headers]);

  const update = useCallback(async (id: string) => {
    await fetch(`${BASE}/${id}`, { method: "PUT", headers: headers(), body: JSON.stringify(apologyDataToBody(content, pagePassword)) });
  }, [content, pagePassword, headers]);

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
  // `apologyDataToBody`, the one description of this template's wire shape.
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
        body: apologyDataToBody(d, pagePassword),
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
    // Recorded before any validation or auth check so this measures *intent*.
    // The gap between this and PUBLISH_SUCCESS is the entire publish drop-off.
    track(EVENTS.PUBLISH_CLICKED, { template: TEMPLATE, is_authenticated: isAuthenticated });

    if (!content.deliveryEmail.trim()) {
      track(EVENTS.PUBLISH_FAILED, { template: TEMPLATE, reason: "missing_delivery_email" });
      pushToast({ type: "info", title: "Delivery email required", message: "Add it in Edit so signed cards reach you" });
      setEditMode("manual");
      setMf({ ...content });
      return;
    }
    if (!isAuthenticated || !accessToken) {
      // The auth wall. Note the pending intent lives in a ref, so it does not
      // survive the Google subdomain-bridge redirect — see FINDINGS.md P3. This
      // event is what makes that loss measurable.
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
        { slug: TEMPLATE, templateType: "apology-dashboard", pageId: id, templateTitle: "Apology Dashboard" },
        setPublishing,
      );
      if (gate === "cancelled") return;

      const pubRes = await fetch(`${BASE}/${id}/publish`, { method: "POST", headers: headers() });
      const pubResult = await pubRes.json();
      if (pubResult.success) {
        setShareUrl(String(pubResult.data.shareUrl));
        clearDraft();
        track(EVENTS.PUBLISH_SUCCESS, { template: TEMPLATE, source: "direct" });
        pushToast({ type: "publish", title: "Published! 💗", message: "Your apology is now live" });
        await persistStory();
      } else {
        // `reason` is what surfaces a server-side gate such as PAYMENT_REQUIRED
        // appearing on a template whose editor cannot handle it (FINDINGS.md P2).
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
      title: "A little apology, just for you 💗",
      accent: "#f43f5e",
      slug: "apology-dashboard",
    });
  }, [shareUrl, pagePassword]);

  const goBack = useCallback(() => router.push("/templates"), [router]);

  const shareId = shareUrl ? shareUrl.split("/").pop() ?? null : null;

  return {
    content, mf, displayData, editMode, pagePassword, pageId, shareUrl, shareId,
    isPersonalized, showAuth, saving, publishing, copied, toasts, previewVersion,
    fill,

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
