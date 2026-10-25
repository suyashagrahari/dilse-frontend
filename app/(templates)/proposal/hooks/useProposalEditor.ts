"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { useStoryFill } from "@/hooks/useStoryFill";
import { API_URL, IS_NGROK } from "@/lib/config";
import { EVENTS } from "@/lib/analytics/events";
import { track } from "@/lib/analytics/track";
import { type ProposalData, type Memory, type EditMode, DEMO_DATA, MIN_MEMORIES, MAX_MEMORIES, proposalDataToBody, dbToProposalData } from "../components/types";
import { applyPerspective, isPerspective } from "../components/copy";
import { openShareSheet } from "@/lib/share/shareBus";
import { ensurePublishAllowed } from "@/lib/paywall/publishRequest";
import { useDraft } from "@/lib/draft/useDraft";
import { useToast } from "@/lib/toast/useToast";
import { persistDraft } from "@/lib/draft/persistDraft";
import { goBackFromTemplate } from "@/lib/backNav";

const DRAFT_KEY = "proposal_draft";
const BASE = `${API_URL}/proposal-pages`;

/** Slug reported on every analytics event from this editor. */
const TEMPLATE = "proposal";

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
const readDraft = (): { data?: ProposalData; password?: string; completed?: boolean } | null => {
  try {
    const raw = draftStore()?.getItem(DRAFT_KEY) ?? window.sessionStorage.getItem(DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
};

/**
 * Ceiling for the combined weight of the uploaded polaroids.
 *
 * The API runs `express.json({ limit: "15mb" })`. Base64 inflates a file by ~33%,
 * so six unprocessed 2MB photos would arrive as ~16MB of JSON and the publish
 * request would 413 — at the worst possible moment, right after the sender logs
 * in. 10MB keeps a comfortable margin for the rest of the body, and the canvas
 * downscale in EditSheet means almost nobody reaches this backstop.
 */
export const MAX_MEMORY_PAYLOAD_BYTES = 10 * 1024 * 1024;

/** Data URLs are ASCII, so their character length *is* their cost in the JSON body. */
export function memoryPayloadBytes(memories: Memory[]): number {
  return memories.reduce((sum, m) => sum + (m.imageUrl.startsWith("data:") ? m.imageUrl.length : 0), 0);
}

const mb = (bytes: number) => (bytes / (1024 * 1024)).toFixed(1);

/** Which fields block Save/Publish. Optional fields never appear here. */
export interface ProposalErrors {
  recipientName?: string;
  memories?: string;
  payload?: string;
}

function validate(d: ProposalData): ProposalErrors {
  const errs: ProposalErrors = {};
  if (!d.recipientName.trim()) errs.recipientName = "Who are you asking? Add their name.";
  const usable = d.memories.filter((m) => m.imageUrl.trim().length > 0).length;
  if (usable < MIN_MEMORIES) {
    errs.memories =
      MIN_MEMORIES === 1
        ? "Add at least one photo for the scrapbook."
        : `Add at least ${MIN_MEMORIES} photos for the scrapbook.`;
  }
  const bytes = memoryPayloadBytes(d.memories);
  if (bytes > MAX_MEMORY_PAYLOAD_BYTES) {
    errs.payload =
      `These photos add up to ${mb(bytes)} MB — a bit too heavy to send. ` +
      `Try removing one or picking smaller pictures.`;
  }
  return errs;
}

/** First blocking problem, in the order a sender would naturally fix them. */
const firstError = (e: ProposalErrors) => e.recipientName ?? e.memories ?? e.payload;

export function useProposalEditor() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, accessToken } = useAppSelector((s) => s.auth);

  const [content, setContent] = useState<ProposalData>(DEMO_DATA);
  const [mf, setMf] = useState<ProposalData>({ ...DEMO_DATA });
  const [editMode, setEditMode] = useState<EditMode>(null);
  const [pagePassword, setPagePassword] = useState("");
  const [pageId, setPageId] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [isPersonalized, setIsPersonalized] = useState(false);

  // ── AI story fill ───────────────────────────────────────────────────────────
  // The words around the proposal: the gate, the scrapbook captions, the ask,
  // the celebration and the secret note. The photos themselves are not on the
  // schema, so the sender still brings those.
  const fill = useStoryFill<ProposalData>({
    slug: "proposal",
    demo: DEMO_DATA,
    current: mf,
    onFilled: setMf,
  });

  // Mounted the first time Create is tapped. The starter renders nothing at all
  // when this template has no schema.
  const [storyStarter, setStoryStarter] = useState(false);

  // Bumped whenever a *new* preview should be shown → remounts the template so it
  // replays from the audio gate with the latest content.
  const [previewVersion, setPreviewVersion] = useState(0);
  const bumpPreview = useCallback(() => setPreviewVersion((v) => v + 1), []);

  const [showAuth, setShowAuth] = useState(false);
  const saving = false; // save-to-preview is local/synchronous; kept for EditSheet API parity
  const [publishing, setPublishing] = useState(false);
  const { pushToast } = useToast();
  const [copied, setCopied] = useState(false);

  // Inline errors stay quiet until the sender first tries to leave the form.
  const [showErrors, setShowErrors] = useState(false);
  const errors = useMemo(() => validate(mf), [mf]);

  // Holds draft when user tries to publish while unauthenticated → auto-resume after login.
  const pendingPublishRef = useRef<{ data: ProposalData; password: string } | null>(null);
  /**
   * True while the auth-deferred publish below is creating the row.
   *
   * Adoption in `useDraft` answers the same event — a token appearing — and
   * used to POST a row of its own, leaving a duplicate behind as a draft. This
   * tells it to stand down. A ref because both effects run in the same commit,
   * so a state flag would still read as the previous render's value.
   */
  const publishInFlightRef = useRef(false);

  const headers = useCallback(
    () => ({
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      ...(IS_NGROK ? { "ngrok-skip-browser-warning": "true" } : {}),
    }),
    [accessToken],
  );



  // ── Load existing page (?edit=<id>) or restore a completed local draft ──────
  useEffect(() => {
    const id = searchParams.get("edit") || searchParams.get("id");
    if (id && isAuthenticated && accessToken) {
      fetch(`${BASE}/${id}`, { headers: headers() })
        .then((r) => r.json())
        .then((result) => {
          if (result.success && result.data) {
            const d = dbToProposalData(result.data);
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
      const d = dbToProposalData(draft.data as unknown as Record<string, unknown>);
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
    // Cleared BEFORE any await: this effect re-runs on every auth change, and a
    // ref that is still populated when it does would publish the page twice.
    pendingPublishRef.current = null;
    // We own the row from here; adoption stands down (see useDraft).
    publishInFlightRef.current = true;

    setPublishing(true);
    setEditMode("preview");
    bumpPreview();
    (async () => {
      try {
        const res = await fetch(BASE, {
          method: "POST",
          headers: headers(),
          body: JSON.stringify(proposalDataToBody(data, password)),
        });
        const result = await res.json();
        if (!result.success) throw new Error("Save failed");
        const savedId = result.data._id as string;
        setPageId(savedId);
        setContent(data);
        setIsPersonalized(true);

        // Clear the paywall BEFORE publishing, so nothing spins behind the sheet,
        // and the publish request is only made when it will succeed.
        const gate = await ensurePublishAllowed(
          { slug: TEMPLATE, templateType: "proposal", pageId: savedId, templateTitle: "Will You Marry Me?" },
          setPublishing,
        );
        if (gate === "cancelled") return;

        const pubRes = await fetch(`${BASE}/${savedId}/publish`, { method: "POST", headers: headers() });
        const pubResult = await pubRes.json();
        if (pubResult.success) {
          // The share URL is always the server's — never rebuilt on the client.
          setShareUrl(String(pubResult.data.shareUrl));
          await fill.persistStory();
          clearDraft();
          // The auth-deferred path: user hit Publish while logged out, logged in,
          // and this resumed automatically. Tracked separately from the direct
          // path so the login detour's completion rate is visible.
          track(EVENTS.PUBLISH_SUCCESS, { template: TEMPLATE, source: "auth_deferred" });
          pushToast({ type: "publish", title: "It's live! 💍", message: "Tap Share to send it"});
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
        publishInFlightRef.current = false;
        setPublishing(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, accessToken]);

  // ── Auto-save WIP draft while editing ───────────────────────────────────────
  useEffect(() => {
    if (editMode !== "manual") return;
    saveDraft({ data: mf, password: pagePassword, completed: false });
  }, [mf, pagePassword, editMode]);

  const displayData = useMemo<ProposalData>(() => {
    const d = editMode === "manual" ? mf : content;
    // While a sender is mid-edit the scrapbook can legitimately be empty. The
    // preview keeps showing the demo polaroids rather than an empty section —
    // the EditSheet is where the "add a photo" error lives.
    return d.memories.length ? d : { ...d, memories: DEMO_DATA.memories };
  }, [editMode, mf, content]);

  /**
   * One setter for every field, with one special case.
   *
   * Changing `perspective` is not just changing a field: it is changing which
   * of two sets of words the template speaks, and the sender is looking at
   * those words in the form. `applyPerspective` rewrites only the strings that
   * still hold the OTHER perspective's default — anything they typed
   * themselves, including a letter they spent ten minutes on, survives the
   * switch untouched. Flipping the toggle to see what it looks like must never
   * be the thing that eats their writing.
   */
  const updateMf = useCallback(
    (key: keyof ProposalData, val: unknown) =>
      setMf((p) =>
        key === "perspective" && isPerspective(val)
          ? applyPerspective(p, val)
          : { ...p, [key]: val },
      ),
    [],
  );

  // ── Memory lane (repeatable list) ───────────────────────────────────────────
  const updateMemory = useCallback((index: number, patch: Partial<Memory>) => {
    setMf((p) => ({
      ...p,
      memories: p.memories.map((m, i) => (i === index ? { ...m, ...patch } : m)),
    }));
  }, []);

  const addMemory = useCallback(() => {
    setMf((p) =>
      p.memories.length >= MAX_MEMORIES
        ? p
        : { ...p, memories: [...p.memories, { imageUrl: "", caption: "" }] },
    );
  }, []);

  const removeMemory = useCallback((index: number) => {
    setMf((p) => ({ ...p, memories: p.memories.filter((_, i) => i !== index) }));
  }, []);

  /** Nudge a polaroid up or down the scrapbook. No-ops at the ends. */
  const moveMemory = useCallback((index: number, dir: -1 | 1) => {
    setMf((p) => {
      const to = index + dir;
      if (to < 0 || to >= p.memories.length) return p;
      const next = [...p.memories];
      [next[index], next[to]] = [next[to], next[index]];
      return { ...p, memories: next };
    });
  }, []);

  const handleEditClick = useCallback(() => {
    setMf(isPersonalized ? { ...content } : { ...DEMO_DATA });
    setShowErrors(false);
    track(EVENTS.EDIT_STARTED, { template: TEMPLATE });
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
    const errs = validate(mf);
    const problem = firstError(errs);
    if (problem) {
      setShowErrors(true);
      pushToast({ type: "info", title: "Almost there", message: problem });
      return;
    }
    setContent(mf);
    setIsPersonalized(true);
    setEditMode("preview");
    bumpPreview(); // fresh preview: the proposal replays from the audio gate
    saveDraft({ data: mf, password: pagePassword, completed: true });
    track(EVENTS.PAGE_SAVED, { template: TEMPLATE, has_password: Boolean(pagePassword) });
    pushToast({ type: "success", title: "Saved!", message: "Play it through, then publish 💍" });
  }, [mf, pagePassword, pushToast, bumpPreview]);

  const create = useCallback(async (): Promise<string | null> => {
    const res = await fetch(BASE, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify(proposalDataToBody(content, pagePassword)),
    });
    const result = await res.json();
    if (!result.success) return null;
    setPageId(result.data._id);
    return result.data._id as string;
  }, [content, pagePassword, headers]);

  const update = useCallback(async (id: string) => {
    await fetch(`${BASE}/${id}`, {
      method: "PUT",
      headers: headers(),
      body: JSON.stringify(proposalDataToBody(content, pagePassword)),
    });
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
  // `proposalDataToBody`, the one description of this template's wire shape.
  const draft = useDraft({
    publishInFlight: publishInFlightRef,
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
        body: proposalDataToBody(d, pagePassword),
      }),
    onAdopted: (d) => {
      // The adopted payload carries CDN URLs where the browser held base64, so
      // the form has to be told — otherwise the next save sends the base64 back
      // and re-uploads it.
      setContent(d);
      setMf({ ...d });
      setIsPersonalized(true);
      // ── AND RE-SEAT THE PREVIEW ──────────────────────────────────────────
      //
      // The preview component is keyed on `previewVersion` in page.tsx and
      // seeds its own state from `data` when that key changes. Setting
      // `content` alone is invisible: the key does not move, the component does
      // not remount, and it goes on showing the demo it seeded with at mount.
      //
      // That was the bug. A signed-out visitor who built a page, closed the tab
      // and came back got their work back in the edit sheet — which reads the
      // form directly and is not keyed — while the page behind it still showed
      // the demo names. The data was never lost and would have published
      // correctly; it only looked lost, which is the same thing to the person
      // looking at it.
      bumpPreview();
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

    const errs = validate(content);
    const problem = firstError(errs);
    if (problem) {
      track(EVENTS.PUBLISH_FAILED, {
        template: TEMPLATE,
        reason: errs.recipientName
          ? "missing_recipient_name"
          : errs.memories
            ? "missing_memories"
            : "payload_too_large",
      });
      pushToast({ type: "info", title: "Almost there", message: problem });
      setMf({ ...content });
      setShowErrors(true);
      setEditMode("manual");
      return;
    }
    if (!isAuthenticated || !accessToken) {
      // The auth wall. The pending intent lives in a ref, so it does not survive
      // the Google subdomain-bridge redirect — this event makes that loss visible.
      track(EVENTS.AUTH_REQUIRED, { template: TEMPLATE, source: "publish" });
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
        { slug: TEMPLATE, templateType: "proposal", pageId: id, templateTitle: "Will You Marry Me?" },
        setPublishing,
      );
      if (gate === "cancelled") return;

      const pubRes = await fetch(`${BASE}/${id}/publish`, { method: "POST", headers: headers() });
      const pubResult = await pubRes.json();
      if (pubResult.success) {
        setShareUrl(String(pubResult.data.shareUrl));
        await fill.persistStory();
        clearDraft();
        track(EVENTS.PUBLISH_SUCCESS, { template: TEMPLATE, source: "direct" });
        pushToast({ type: "publish", title: "It's live! 💍", message: "Tap Share to send it"});
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

  /** Cancelling the login modal drops the pending intent, so nothing fires later. */
  const closeAuth = useCallback(() => {
    setShowAuth(false);
    pendingPublishRef.current = null;
  }, []);
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
      title: "I have something to ask you 💍",
      accent: "#db2777",
      slug: "proposal",
    });
  }, [shareUrl, pagePassword]);

  const goBack = useCallback(() => goBackFromTemplate(router), [router]);

  const shareId = shareUrl ? shareUrl.split("/").pop() ?? null : null;

  return {
    content, mf, displayData, editMode, pagePassword, pageId, shareUrl, shareId,
    isPersonalized, showAuth, saving, publishing, copied, previewVersion,
    errors, showErrors,
    /** Live weight of the uploaded polaroids, so the form can warn before Save. */
    memoryBytes: memoryPayloadBytes(mf.memories),
    maxMemoryBytes: MAX_MEMORY_PAYLOAD_BYTES,

    fill, storyStarter, openManualForm,

    setEditMode, setPagePassword, updateMf,
    updateMemory, addMemory, removeMemory, moveMemory,
    handleEditClick, handleEditFromPreview, handleSave,
    create, update, publish,
    closeAuth, closeAuthSuccess, handleCopy, handleShare, goBack,
    pushToast, showPublish: isPersonalized && !shareUrl && !publishing,
    showShare: !!shareUrl,
    shareLabel: copied ? "Copied!" : "Share",
  };
}
