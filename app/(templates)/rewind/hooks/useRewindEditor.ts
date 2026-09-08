"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { useStoryFill } from "@/hooks/useStoryFill";
import { API_URL, IS_NGROK } from "@/lib/config";
import { EVENTS } from "@/lib/analytics/events";
import { track } from "@/lib/analytics/track";
import { type RewindData, type EditMode, DEMO_DATA, deriveStats, rewindDataToBody, dbToRewindData } from "../components/types";
import { openShareSheet } from "@/lib/share/shareBus";
import { ensurePublishAllowed } from "@/lib/paywall/publishRequest";
import { useDraft } from "@/lib/draft/useDraft";
import { useToast } from "@/lib/toast/useToast";
import { persistDraft } from "@/lib/draft/persistDraft";

const DRAFT_KEY = "rewind_draft";
const BASE = `${API_URL}/rewind-pages`;

/** Slug reported on every analytics event from this editor. */
const TEMPLATE = "rewind";

/** Deck limits. The story slides are built to hold exactly this much. */
export const MAX_REASONS = 5;
export const MAX_STATS = 4;
export const MAX_PHOTOS = 8;

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
const readDraft = (): { data?: Partial<RewindData>; password?: string; completed?: boolean } | null => {
  try {
    const raw = draftStore()?.getItem(DRAFT_KEY) ?? window.sessionStorage.getItem(DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
};

/** A reason with nothing written on it is not a reason. */
export const writtenReasons = (d: RewindData): string[] =>
  (Array.isArray(d.topReasons) ? d.topReasons : []).map((r) => (r ?? "").trim()).filter(Boolean);

export interface DateProblem { kind: "missing" | "invalid" | "future"; message: string }

/**
 * The one field the whole deck hangs off. Every number on screen derives from
 * it, so a missing or future date is not a soft warning — it is a blocked save.
 */
export function validateStartDate(startDate: string): DateProblem | null {
  const raw = (startDate ?? "").trim();
  if (!raw) return { kind: "missing", message: "Every number in the story comes from this one date" };
  if (Number.isNaN(Date.parse(raw))) return { kind: "invalid", message: "That date didn't parse — pick it from the calendar" };
  // `deriveStats` already knows what "future" means. Don't re-derive it here.
  if (deriveStats(raw).isFuture) {
    return { kind: "future", message: "That day hasn't happened yet — the story would count backwards" };
  }
  return null;
}

/**
 * Which form data the sheet should open with.
 *
 * THE WHOLE POINT: when there is work in progress — a draft restored from a
 * refresh, or anything the sender has already typed — opening the sheet returns
 * it untouched. The sibling editors seed from DEMO_DATA on every Create tap,
 * which (combined with keystroke autosave) silently destroys a restored draft
 * the instant the user taps Create. This function is the fix, and both open
 * paths go through it.
 */
export function nextFormSeed(
  current: RewindData,
  hasWip: boolean,
  isPersonalized: boolean,
  content: RewindData,
  demo: RewindData,
): RewindData {
  if (hasWip) return current;
  return isPersonalized ? { ...content } : { ...demo };
}

export function useRewindEditor() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, accessToken } = useAppSelector((s) => s.auth);

  const [content, setContent] = useState<RewindData>(DEMO_DATA);
  const [mf, setMf] = useState<RewindData>({ ...DEMO_DATA });
  const [editMode, setEditMode] = useState<EditMode>(null);
  const [pagePassword, setPagePassword] = useState("");
  const [pageId, setPageId] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [isPersonalized, setIsPersonalized] = useState(false);
  // Bumped whenever a *new* preview should be shown → remounts the story so it
  // replays from the cold open with the freshly-written year.
  const [previewVersion, setPreviewVersion] = useState(0);
  const bumpPreview = useCallback(() => setPreviewVersion((v) => v + 1), []);

  const [showAuth, setShowAuth] = useState(false);
  const saving = false; // save-to-preview is local/synchronous; kept for EditSheet API parity
  const [publishing, setPublishing] = useState(false);
  const { pushToast } = useToast();
  const [copied, setCopied] = useState(false);

  // True once `mf` holds something the sender would be upset to lose: a draft
  // restored from storage, or a keystroke. Nothing that opens the sheet is
  // allowed to overwrite `mf` while this is true. Mirrored into state purely so
  // the UI can say "draft restored" — the ref is what the callbacks read, since
  // it must be correct on the very first tap after a restore.
  const hasWipRef = useRef(false);
  const [restoredDraft, setRestoredDraft] = useState(false);

  // Holds the draft when the user hits Publish while logged out → auto-resumes after login.
  const pendingPublishRef = useRef<{ data: RewindData; password: string } | null>(null);

  // ── AI story fill ──────────────────────────────────────────────────────────
  //
  // Inert when the server has no schema for this slug: `schema` stays null,
  // StoryStarter renders nothing and the entry points below fall straight back
  // to the sheet this editor has always shown.
  /** Anything a fill writes is work in progress — `nextFormSeed` must not eat it. */
  const applyStoryFill = useCallback((next: RewindData) => {
    hasWipRef.current = true;
    setMf(next);
  }, []);

  const storyFill = useStoryFill<RewindData>({
    slug: "rewind",
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



  // ── Load existing page (?edit=<id>) or restore a local draft ────────────────
  useEffect(() => {
    const id = searchParams.get("edit") || searchParams.get("id");
    if (id && isAuthenticated && accessToken) {
      fetch(`${BASE}/${id}`, { headers: headers() })
        .then((r) => r.json())
        .then((result) => {
          if (result.success && result.data) {
            const d = dbToRewindData(result.data);
            setContent(d);
            setMf(d);
            // Server data is clean and authoritative — it *is* the baseline, not
            // work in progress, so re-seeding from it later is a no-op.
            hasWipRef.current = false;
            setRestoredDraft(false);
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

    // Restore a locally-saved draft on refresh.
    const draft = readDraft();
    if (draft?.data) {
      // Restored VERBATIM, never through dbToRewindData: a work-in-progress
      // draft legitimately contains blank reason rows, half-typed stats and a
      // partly-answered quiz, and the wire coercer strips exactly those. They
      // only get cleaned on Save.
      const src = draft.data;
      const d: RewindData = {
        ...DEMO_DATA,
        ...src,
        topReasons: Array.isArray(src.topReasons) ? src.topReasons : [],
        stats: Array.isArray(src.stats) ? src.stats : [],
        photos: Array.isArray(src.photos) ? src.photos : [],
        answers: src.answers && typeof src.answers === "object" ? src.answers : {},
      };
      setMf(d);
      // From here on, opening the sheet must hand this back untouched.
      hasWipRef.current = true;
      setRestoredDraft(true);
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
        const res = await fetch(BASE, { method: "POST", headers: headers(), body: JSON.stringify(rewindDataToBody(data, password)) });
        const result = await res.json();
        if (!result.success) throw new Error("Save failed");
        const savedId = result.data._id as string;
        setPageId(savedId);
        setContent(data);
        setIsPersonalized(true);

        // Clear the paywall BEFORE publishing, so nothing spins behind the sheet,
        // and the publish request is only made when it will succeed.
        const gate = await ensurePublishAllowed(
          { slug: TEMPLATE, templateType: "rewind", pageId: savedId, templateTitle: "Rewind" },
          setPublishing,
        );
        if (gate === "cancelled") return;

        const pubRes = await fetch(`${BASE}/${savedId}/publish`, { method: "POST", headers: headers() });
        const pubResult = await pubRes.json();
        if (pubResult.success) {
          // The share URL is authored by the server — never assembled here.
          setShareUrl(String(pubResult.data.shareUrl));
          // Never throws, never blocks — the page is already live either way.
          await persistStory();
          clearDraft();
          track(EVENTS.PUBLISH_SUCCESS, { template: TEMPLATE, source: "auth_deferred" });
          pushToast({ type: "publish", title: "Published! ⏮️", message: "Tap Share to send it" });
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

  const updateMf = useCallback((key: keyof RewindData, val: unknown) => {
    // A keystroke is work in progress from the very first character.
    hasWipRef.current = true;
    setMf((p) => ({ ...p, [key]: val }));
  }, []);

  const updatePassword = useCallback((v: string) => {
    hasWipRef.current = true;
    setPagePassword(v);
  }, []);

  // Create tap. NEVER clobbers a restored draft — see `nextFormSeed`.
  const handleEditClick = useCallback(() => {
    setMf((cur) => nextFormSeed(cur, hasWipRef.current, isPersonalized, content, DEMO_DATA));
    setEditMode("manual");
  }, [isPersonalized, content]);

  // Edit tap from the preview. Same rule: work in progress wins.
  const handleEditFromPreview = useCallback(() => {
    setMf((cur) => nextFormSeed(cur, hasWipRef.current, true, content, DEMO_DATA));
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

  // Save (locally) & jump to the preview
  const handleSave = useCallback(() => {
    if (!mf.recipientName.trim()) {
      pushToast({ type: "info", title: "Who is this for?", message: "Their name opens the story" });
      return;
    }

    const dateProblem = validateStartDate(mf.startDate);
    if (dateProblem) {
      pushToast({
        type: "info",
        title: dateProblem.kind === "future" ? "That date is ahead of us" : "Add the date it started",
        message: dateProblem.message,
      });
      return;
    }

    const reasons = writtenReasons(mf);
    if (reasons.length < 1) {
      pushToast({ type: "info", title: "One reason, at least", message: "The ranked list is the slide people screenshot" });
      return;
    }

    // Half-written rows are fine to keep typing on; they are not fine to publish.
    const cleaned: RewindData = {
      ...mf,
      senderName: mf.senderName.trim(),
      recipientName: mf.recipientName.trim(),
      startDate: mf.startDate.trim(),
      topReasons: reasons.slice(0, MAX_REASONS),
      stats: (mf.stats ?? [])
        .filter((s) => s.value.trim() || s.label.trim())
        .map((s, i) => ({ key: s.key || `s${i + 1}`, label: s.label.trim(), value: s.value.trim(), sub: s.sub.trim() }))
        .slice(0, MAX_STATS),
      photos: (mf.photos ?? []).map((p) => p.trim()).filter(Boolean).slice(0, MAX_PHOTOS),
      songTitle: mf.songTitle.trim(),
      songArtist: mf.songArtist.trim(),
      audioUrl: mf.audioUrl.trim(),
      closingLine: mf.closingLine.trim() || DEMO_DATA.closingLine,
    };

    setContent(cleaned);
    setIsPersonalized(true);
    setEditMode("preview");
    bumpPreview(); // fresh run: back to the cold open with the new year
    // The RAW form (mf), not the cleaned copy — reopening the sheet must give
    // back the blank rows the sender left themselves.
    saveDraft({ data: mf, password: pagePassword, completed: true });
    track(EVENTS.PAGE_SAVED, {
      template: TEMPLATE,
      has_password: Boolean(pagePassword),
      reasons: cleaned.topReasons.length,
      answered: Object.keys(mf.answers ?? {}).length,
    });
    pushToast({ type: "success", title: "Saved!", message: "Play it once, then publish ⏮️" });
  }, [mf, pagePassword, pushToast, bumpPreview]);

  const create = useCallback(async (): Promise<string | null> => {
    const res = await fetch(BASE, { method: "POST", headers: headers(), body: JSON.stringify(rewindDataToBody(content, pagePassword)) });
    const result = await res.json();
    if (!result.success) return null;
    setPageId(result.data._id);
    return result.data._id as string;
  }, [content, pagePassword, headers]);

  const update = useCallback(async (id: string) => {
    await fetch(`${BASE}/${id}`, { method: "PUT", headers: headers(), body: JSON.stringify(rewindDataToBody(content, pagePassword)) });
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
  // `rewindDataToBody`, the one description of this template's wire shape.
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
        body: rewindDataToBody(d, pagePassword),
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
    track(EVENTS.PUBLISH_CLICKED, { template: TEMPLATE, is_authenticated: isAuthenticated });

    const dateProblem = validateStartDate(content.startDate);
    if (!content.recipientName.trim() || dateProblem || writtenReasons(content).length < 1) {
      track(EVENTS.PUBLISH_FAILED, { template: TEMPLATE, reason: dateProblem ? `date_${dateProblem.kind}` : "story_incomplete" });
      pushToast({
        type: "info",
        title: "Finish the story first",
        message: dateProblem ? dateProblem.message : "A name, the date, and one reason",
      });
      // Reopen the sheet on whatever is already there — never on demo data.
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

      // Clear the paywall BEFORE publishing, so nothing spins behind the sheet,
      // and the publish request is only made when it will succeed.
      const gate = await ensurePublishAllowed(
        { slug: TEMPLATE, templateType: "rewind", pageId: id, templateTitle: "Rewind" },
        setPublishing,
      );
      if (gate === "cancelled") return;

      const pubRes = await fetch(`${BASE}/${id}/publish`, { method: "POST", headers: headers() });
      const pubResult = await pubRes.json();
      if (pubResult.success) {
        setShareUrl(String(pubResult.data.shareUrl));
        // Never throws, never blocks — the page is already live either way.
        await persistStory();
        clearDraft();
        track(EVENTS.PUBLISH_SUCCESS, { template: TEMPLATE, source: "direct" });
        pushToast({ type: "publish", title: "Published! ⏮️", message: "Tap Share to send it" });
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
      title: "I ran the numbers on us. ⏮️",
      accent: "#c026d3",
      recipientName: content.recipientName,
      slug: "rewind",
    });
  }, [shareUrl, content.recipientName, pagePassword]);

  const goBack = useCallback(() => router.push("/templates"), [router]);

  const shareId = shareUrl ? shareUrl.split("/").pop() ?? null : null;

  return {
    content, mf, displayData, editMode, pagePassword, pageId, shareUrl, shareId,
    isPersonalized, showAuth, saving, publishing, copied, previewVersion,
    restoredDraft, storyFill, storyStarted,

    setEditMode, setPagePassword: updatePassword, updateMf,
    handleEditClick, handleStartCreate, handleStoryManual, handleEditFromPreview, handleSave,
    create, update, publish,
    closeAuth, closeAuthSuccess, handleCopy, handleShare, goBack,
    pushToast, showPublish: isPersonalized && !shareUrl && !publishing,
    showShare: !!shareUrl,
    shareLabel: copied ? "Copied!" : "Share",
  };
}
