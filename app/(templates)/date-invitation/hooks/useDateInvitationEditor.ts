"use client";

// ─── The Invitation — sender-side controller ─────────────────────────────────
//
// One hook owns every piece of editor state; `page.tsx` is a thin renderer and
// `EditSheet.tsx` is a thin form. Mirrors `catch/hooks/useCatchEditor.ts` in
// shape and in the order of concerns — the only things that differ are the
// fields, the validation and the one bug called out below.

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { useStoryFill } from "@/hooks/useStoryFill";
import { API_URL, IS_NGROK } from "@/lib/config";
import { clampNum } from "@/lib/wire";
import { EVENTS } from "@/lib/analytics/events";
import { track } from "@/lib/analytics/track";
import {
  buildDemoData,
  dateInviteDataToBody,
  dbToDateInviteData,
  isPast,
  type DateInviteData,
  type EditMode,
  type Stop,
  type Toast,
} from "../components/types";
import { openShareSheet } from "@/lib/share/shareBus";

/**
 * The ONE draft key for this template. Together with
 * `date-invitation_unlocked_<shareId>` (owned by the viewer) these are the only
 * two browser-storage keys the whole template is allowed to touch.
 */
const DRAFT_KEY = "date-invitation_draft";
const BASE = `${API_URL}/date-invitation-pages`;

/** Slug reported on every analytics event from this editor. */
const TEMPLATE = "date-invitation";

// ── Limits the form and the validator share ──────────────────────────────────

/** An evening with no stops is a text message. One is enough for a real plan. */
export const MIN_STOPS = 1;
/** `dbToDateInviteData` slices at 6, so the UI must refuse the 7th. */
export const MAX_STOPS = 6;

/** Matches the clamp inside the frozen wire coercer, so save === round-trip. */
export const MIN_TOTAL_MINS = 15;
export const MAX_TOTAL_MINS = 1440;
export const MIN_STOP_MINS = 5;
export const MAX_STOP_MINS = 600;

/** Field limits, shared with the sheet so the counters cannot drift. */
export const LIMITS = {
  senderName: 40,
  recipientName: 40,
  dressCode: 70,
  note: 140,
  closingLine: 180,
  placeName: 70,
  address: 140,
  why: 400,
  dressNote: 90,
} as const;

// ── Draft store ──────────────────────────────────────────────────────────────
//
// localStorage first so a refresh (or an accidental tab close) keeps everything
// the sender wrote; sessionStorage only when localStorage is unavailable
// (Safari private mode, storage disabled). Verbatim from the reference hook —
// four templates hand-rolling this is exactly what the helper prevents.
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
const readDraft = (): { data?: DateInviteData; password?: string; completed?: boolean } | null => {
  try {
    const raw = draftStore()?.getItem(DRAFT_KEY) ?? window.sessionStorage.getItem(DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
};

/** A stop with no name is not a stop yet — same rule as catch's line-less items. */
export const namedStops = (d: DateInviteData): Stop[] => d.stops.filter((s) => s.name.trim().length > 0);

export function useDateInvitationEditor() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, accessToken } = useAppSelector((s) => s.auth);

  // `buildDemoData()` is a function, not a frozen const, because the demo date
  // has to stay three days out. Called ONCE per mount and held in state: a
  // module-level singleton in a tab left open over a weekend drifts into the
  // "expired" phase, and re-calling it every render would restart the countdown.
  const [demo] = useState<DateInviteData>(() => buildDemoData());

  const [content, setContent] = useState<DateInviteData>(demo);
  const [mf, setMf] = useState<DateInviteData>(() => ({ ...demo }));
  const [editMode, setEditMode] = useState<EditMode>(null);
  const [pagePassword, setPagePassword] = useState("");
  const [pageId, setPageId] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [isPersonalized, setIsPersonalized] = useState(false);

  // ── AI story fill ───────────────────────────────────────────────────────────
  // The written half of the invitation: the note, the dress code, the reason
  // behind each of the four stops and the closing line. Times, coordinates and
  // the map are not on the schema, so the itinerary itself is untouched.
  //
  // `demo` is the per-mount object above, not the module-level `DEMO_DATA`:
  // that is what `mf` was seeded from, and it is the baseline the "did the
  // sender type here?" diff has to be taken against.
  const fill = useStoryFill<DateInviteData>({
    slug: "date-invitation",
    demo,
    current: mf,
    onFilled: setMf,
  });

  // Mounted the first time Create is tapped. The starter renders nothing at all
  // when this template has no schema.
  const [storyStarter, setStoryStarter] = useState(false);

  // Bumped whenever a *new* preview should be shown → remounts the template so
  // the phase router re-derives from the freshly-written invitation.
  const [previewVersion, setPreviewVersion] = useState(0);
  const bumpPreview = useCallback(() => setPreviewVersion((v) => v + 1), []);

  const [showAuth, setShowAuth] = useState(false);
  const saving = false; // save-to-preview is local/synchronous; kept for EditSheet API parity
  const [publishing, setPublishing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastIdRef = useRef(0);

  /**
   * ── THE BUG THIS HOOK DOES NOT COPY ────────────────────────────────────────
   *
   * `useCatchEditor.handleEditClick` (and every sibling) does:
   *
   *     setMf(isPersonalized ? { ...content } : { ...DEMO_DATA });
   *
   * Combined with the keystroke autosave below, that destroys work: type two
   * fields, refresh (draft restores into `mf`, `isPersonalized` is still false
   * because the draft was never Saved), tap **Create** — `mf` is reset to demo
   * data, the autosave effect immediately writes that reset over the draft, and
   * the two fields are gone from both memory and storage.
   *
   * These two refs are the fix. `dirtyRef` means "`mf` is the sender's work, not
   * the demo seed", set both when a draft is restored and on the first keystroke.
   * `handleEditClick` will not reseed `mf` while it is set.
   */
  const dirtyRef = useRef(false);
  const draftRestoredRef = useRef(false);

  // Holds the payload when the user hits Publish while logged out → the effect
  // below auto-resumes it the moment they come back authenticated.
  const pendingPublishRef = useRef<{ data: DateInviteData; password: string } | null>(null);

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
            const d = dbToDateInviteData(result.data);
            setContent(d);
            setMf(d);
            dirtyRef.current = true; // this is the sender's own invitation, not the demo
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
    if (draft?.data && Array.isArray(draft.data.stops) && typeof draft.data.senderName === "string") {
      // Restored VERBATIM, not through `dbToDateInviteData`: a work-in-progress
      // draft legitimately holds half-typed stops with no name yet, and the wire
      // coercer drops exactly those. They get cleaned in `handleSave`, not here.
      const d = draft.data;
      setMf(d);
      draftRestoredRef.current = true;
      dirtyRef.current = true;
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
        const res = await fetch(BASE, {
          method: "POST",
          headers: headers(),
          body: JSON.stringify(dateInviteDataToBody(data, password)),
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
          // The share URL is authored by the server — never assembled here.
          setShareUrl(String(pubResult.data.shareUrl));
          await fill.persistStory();
          clearDraft();
          track(EVENTS.PUBLISH_SUCCESS, { template: TEMPLATE, source: "auth_deferred" });
          pushToast({ type: "publish", title: "Sent 💌", message: "Now she has to answer it" });
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

  const updateMf = useCallback((key: keyof DateInviteData, val: unknown) => {
    dirtyRef.current = true;
    setMf((p) => ({ ...p, [key]: val }));
  }, []);

  const handleEditClick = useCallback(() => {
    // See the dirtyRef comment above: opening the sheet must NEVER discard work
    // the sender has already done. Only a genuinely untouched editor gets seeded.
    if (isPersonalized) {
      setMf({ ...content });
    } else if (!dirtyRef.current && !draftRestoredRef.current) {
      setMf({ ...demo });
    }
    // The starter goes first, but only while there is a schema to fill from and
    // only until the sender has said no once. Everything else opens the form
    // exactly as it did before.
    if (fill.schema && fill.mode !== "manual") {
      setStoryStarter(true);
      return;
    }
    setEditMode("manual");
  }, [isPersonalized, content, demo, fill.schema, fill.mode]);

  /** The starter's only exit — into the same form Create would have opened. */
  const openManualForm = useCallback(() => setEditMode("manual"), []);

  const handleEditFromPreview = useCallback(() => {
    setMf({ ...content });
    dirtyRef.current = true;
    setEditMode("manual");
  }, [content]);

  // ── Save (locally) & jump back to the preview ───────────────────────────────
  const handleSave = useCallback(() => {
    const senderName = mf.senderName.trim();
    const recipientName = mf.recipientName.trim();

    if (!senderName) { pushToast({ type: "info", title: "Add your name first", message: "It signs the invitation" }); return; }
    if (!recipientName) { pushToast({ type: "info", title: "Who is it for?", message: "Add their name" }); return; }

    if (!mf.startsAt || Number.isNaN(Date.parse(mf.startsAt))) {
      pushToast({ type: "info", title: "Pick a day and a time", message: "It's the one thing she needs to say yes to" });
      return;
    }
    // `isPast` comes from the frozen types so the editor and the phase router
    // agree on the boundary — otherwise you can publish an invitation that
    // renders straight into "expired".
    if (isPast(mf.startsAt)) {
      pushToast({ type: "info", title: "That's already been and gone", message: "Pick a time in the future" });
      return;
    }

    const kept = namedStops(mf).slice(0, MAX_STOPS);
    if (kept.length < MIN_STOPS) {
      pushToast({ type: "info", title: "Add at least one stop", message: "A stop needs a name to exist" });
      return;
    }
    const dropped = mf.stops.length - kept.length;

    const stops: Stop[] = kept.map((s, i) => ({
      ...s,
      // `order` is authoritative and must not rely on array position. Renumbered
      // 1..n on every save so a reorder or a removal can never leave a gap.
      order: i + 1,
      name: s.name.trim().slice(0, LIMITS.placeName),
      address: s.address.trim().slice(0, LIMITS.address),
      lat: clampNum(s.lat, 0, -90, 90),
      lng: clampNum(s.lng, 0, -180, 180),
      durationMins: clampNum(s.durationMins, 45, MIN_STOP_MINS, MAX_STOP_MINS),
      why: s.why.trim().slice(0, LIMITS.why),
      dressNote: s.dressNote.trim().slice(0, LIMITS.dressNote),
      // Surprise is the default. Forgetting to set it must not leak a name.
      surprise: s.surprise !== false,
    }));

    const cleaned: DateInviteData = {
      ...mf,
      senderName: senderName.slice(0, LIMITS.senderName),
      recipientName: recipientName.slice(0, LIMITS.recipientName),
      durationMins: clampNum(mf.durationMins, demo.durationMins, MIN_TOTAL_MINS, MAX_TOTAL_MINS),
      dressCode: mf.dressCode.trim().slice(0, LIMITS.dressCode),
      note: mf.note.trim().slice(0, LIMITS.note),
      closingLine: mf.closingLine.trim().slice(0, LIMITS.closingLine) || demo.closingLine,
      meetingPoint: {
        name: mf.meetingPoint.name.trim().slice(0, LIMITS.placeName),
        address: mf.meetingPoint.address.trim().slice(0, LIMITS.address),
        lat: clampNum(mf.meetingPoint.lat, 0, -90, 90),
        lng: clampNum(mf.meetingPoint.lng, 0, -180, 180),
      },
      stops,
      // Recipient-owned fields. The sender publishes a blank slate, always —
      // otherwise a re-save from the preview could ship a half-walked itinerary.
      rsvp: "pending",
      proposedDate: "",
      currentStopIndex: -1,
      arrivedAt: stops.map(() => ""),
      photos: [],
    };

    setContent(cleaned);
    setIsPersonalized(true);
    setEditMode("preview");
    bumpPreview();
    // The draft keeps the RAW form state, not `cleaned`: reopening the sheet
    // should show the half-typed stop again rather than silently eating it.
    saveDraft({ data: mf, password: pagePassword, completed: true });
    track(EVENTS.PAGE_SAVED, { template: TEMPLATE, has_password: Boolean(pagePassword), stops: stops.length });
    pushToast({
      type: "success",
      title: "Saved!",
      message: dropped > 0
        ? `${dropped} unnamed ${dropped === 1 ? "stop" : "stops"} left out — publish when it looks right`
        : "Have a look, then publish 💌",
    });
  }, [mf, pagePassword, demo, pushToast, bumpPreview]);

  const create = useCallback(async (): Promise<string | null> => {
    const res = await fetch(BASE, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify(dateInviteDataToBody(content, pagePassword)),
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
      body: JSON.stringify(dateInviteDataToBody(content, pagePassword)),
    });
  }, [content, pagePassword, headers]);

  const publish = useCallback(async () => {
    // Recorded before any validation or auth check so this measures *intent*.
    track(EVENTS.PUBLISH_CLICKED, { template: TEMPLATE, is_authenticated: isAuthenticated });

    const incomplete =
      !content.senderName.trim() ||
      !content.recipientName.trim() ||
      !content.startsAt ||
      isPast(content.startsAt) ||
      namedStops(content).length < MIN_STOPS;

    if (incomplete) {
      track(EVENTS.PUBLISH_FAILED, { template: TEMPLATE, reason: "invitation_incomplete" });
      pushToast({ type: "info", title: "Finish the invitation first", message: "Names, a future date, and one stop" });
      setMf({ ...content });
      dirtyRef.current = true;
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
        await fill.persistStory();
        clearDraft();
        track(EVENTS.PUBLISH_SUCCESS, { template: TEMPLATE, source: "direct" });
        pushToast({ type: "publish", title: "Sent 💌", message: "Now she has to answer it" });
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
      // Only a saved page can be consented to, and only by its owner.
      wall: pageId ? { templateType: "date-invitation", pageId } : undefined,
      url: shareUrl,
      password: pagePassword,
      title: "You're invited. Location: you'll find out. 💌",
      accent: "#be123c",
      recipientName: content.recipientName,
      senderName: content.senderName,
      slug: "date-invitation",
    });
  }, [shareUrl, content.senderName, content.recipientName, pagePassword, pageId]);

  const goBack = useCallback(() => router.push("/templates"), [router]);

  const shareId = shareUrl ? shareUrl.split("/").pop() ?? null : null;

  return {
    content, mf, displayData, editMode, pagePassword, pageId, shareUrl, shareId,
    isPersonalized, showAuth, saving, publishing, copied, toasts, previewVersion,

    fill, storyStarter, openManualForm,

    setEditMode, setPagePassword, updateMf, bumpPreview,
    handleEditClick, handleEditFromPreview, handleSave,
    create, update, publish,
    closeAuth, closeAuthSuccess, handleCopy, handleShare, goBack,
    pushToast, dismissToast,

    showPublish: isPersonalized && !shareUrl && !publishing,
    showShare: !!shareUrl,
    shareLabel: copied ? "Copied!" : "Share",
  };
}
