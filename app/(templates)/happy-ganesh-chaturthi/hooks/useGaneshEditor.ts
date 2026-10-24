"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { useStoryFill } from "@/hooks/useStoryFill";
import { API_URL, IS_NGROK } from "@/lib/config";
import { EVENTS } from "@/lib/analytics/events";
import { track } from "@/lib/analytics/track";
import { openShareSheet } from "@/lib/share/shareBus";
import { ensurePublishAllowed } from "@/lib/paywall/publishRequest";
import { useDraft } from "@/lib/draft/useDraft";
import { useToast } from "@/lib/toast/useToast";
import { persistDraft } from "@/lib/draft/persistDraft";
import {
  type GaneshData,
  type EditMode,
  SAMPLE,
  DEMO,
  ganeshDataToBody,
  dbToGaneshData,
} from "../components/types";
import {
  applyUploaded,
  blobToFile,
  dropLocal,
  getLocal,
  localRefs,
  purgeLocal,
  resolveMedia,
} from "../components/mediaStore";
import { uploadImage } from "../components/upload";
import { goBackFromTemplate } from "@/lib/backNav";

/** Slug reported on every analytics event from this editor, and the aiFill key. */
const TEMPLATE = "happy-ganesh-chaturthi";
const BASE = `${API_URL}/ganesh-chaturthi-pages`;

// ─── NO LOCAL DRAFT STORAGE ──────────────────────────────────────────────────
//
// Several editors in this codebase autosave a work-in-progress draft to
// localStorage. This one deliberately does not, and follows the rakhi family
// instead: the SERVER is the draft.
//
// The moment the sender taps Save, `useDraft` below creates a real page and it
// is reachable at `?edit=<id>`, so anything they have actually finished survives
// a reload, a closed tab and a different device. What is at risk is only the
// half of a session between two saves.
//
// A localStorage draft would also have to hold the photos, and the photos are
// the reason it cannot: they live in IndexedDB as `idb:` refs, which are
// meaningless in any other browsing context. A restored draft pointing at refs
// from a purged store is a form that looks complete and publishes with holes in
// it, which is worse than a form that opens empty.

export function useGaneshEditor() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, accessToken } = useAppSelector((s) => s.auth);

  // ── DEMO for the preview, SAMPLE for the form ────────────────────────────
  //
  // `content` is what the preview renders, so it starts as the filled demo —
  // otherwise a visitor evaluating this template sees an empty shell and never
  // learns that the photo, the pandal grid and the vargani QR exist.
  //
  // `mf` is the form, so it starts as `SAMPLE`, which is empty in every slot
  // that carries somebody's identity. If these were seeded from the same object
  // the sender would open the builder holding another family's photograph and
  // their UPI ID, one Publish away from sending it. They must never be merged.
  const [content, setContent] = useState<GaneshData>(DEMO);
  const [mf, setMf] = useState<GaneshData>({ ...SAMPLE });
  const [editMode, setEditMode] = useState<EditMode>(null);
  const [pagePassword, setPagePassword] = useState("");
  const [pageId, setPageId] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [isPersonalized, setIsPersonalized] = useState(false);
  const [previewVersion, setPreviewVersion] = useState(0);
  const bumpPreview = useCallback(() => setPreviewVersion((v) => v + 1), []);

  // ── AI story fill ─────────────────────────────────────────────────────────
  //
  // The same hook thirty other editors call. Everything template-specific is
  // right here: the slug the server turns into a field list, and the baseline
  // that decides what counts as the sender's own words.
  //
  // `demo: SAMPLE`, not `DEMO`, and the distinction matters. `diffTouched`
  // treats "differs from the baseline and is non-empty" as "the sender typed
  // this", and protects it from being overwritten. `SAMPLE` is what the form
  // actually opens holding, so that comparison is meaningful. Passing the filled
  // gallery `DEMO` instead would make Rohit's greeting the baseline and quietly
  // mark a sender's own identical-length lines as untouched.
  //
  // Completely inert when the server has no schema for this slug: `schema` stays
  // null, `StoryStarter` renders nothing, and `handleStartCreate` falls straight
  // through to the plain form.
  const fill = useStoryFill<GaneshData>({
    slug: TEMPLATE,
    demo: SAMPLE,
    current: mf,
    onFilled: setMf,
    // The composer asks for their name and the recipient's; this says where they
    // land if the model does not write them back itself. `recipientName` gates
    // Save, so without this a fill that dropped it would strand the sender on a
    // validation error for a name they typed thirty seconds earlier.
    namePaths: { sender: "senderName", recipient: "recipientName" },
  });

  // Mounted the first time Create is tapped. `StoryStarter` renders nothing at
  // all until the server has a schema for this slug, so this is safe to ship
  // ahead of the server config.
  const [storyStarter, setStoryStarter] = useState(false);

  const [showAuth, setShowAuth] = useState(false);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const { pushToast } = useToast();
  /**
   * What the publish is doing right now, e.g. "Uploading photos… 2 of 4".
   *
   * Photos are uploaded at publish rather than at pick, so pressing Send can
   * mean several megabytes over a phone connection. A spinner with no counter
   * behind it reads as a hang, and the natural response to a hang is to press
   * the button again.
   */
  const [publishStage, setPublishStage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  /**
   * They pressed Send without an account. Set on the way into the auth modal and
   * consumed by the resume effect below `publish`.
   *
   * A bare flag, not a copy of the data: `publish` reads `content` and
   * `pagePassword` from state, and those are exactly what the sender was looking
   * at when they pressed the button. Stashing a snapshot here as well meant two
   * sources of truth for the same page, and the snapshot was the one that
   * silently went stale.
   */
  const pendingPublishRef = useRef(false);

  /**
   * The editor is creating the row itself right now — adoption must stand down.
   *
   * ── THIS IS NOT DEFENSIVE, IT IS A MEASURED BUG ───────────────────────────
   *
   * A signed-out sender who presses Send parks the intent and signs in. That one
   * token change wakes TWO writers: the resume effect below, which POSTs a row
   * and publishes it, and adoption inside `useDraft`, which POSTs a row of its
   * own and leaves it as a draft. One piece of work, two rows, every time.
   *
   * Reproduced against a real database while building this template: signing up
   * at the Send click left `ganeshchaturthipages` holding two documents with
   * identical content, one published and one orphaned draft. Production carried
   * 150 such orphans against 3706 published pages before the claim existed — 150
   * of the 152 drafts in the whole database — and it read to the sender as
   * "publishing puts the page live AND leaves the same thing sitting in drafts",
   * which is exactly what it was doing.
   *
   * `useDraft` reads `.current` and returns without marking itself adopted, so a
   * publish that then fails still leaves the held work a home.
   *
   * ── AND WHY THE LATCH IS NAMED `pendingPublishRef` ────────────────────────
   *
   * `scripts/draft-coverage.mjs` only looks for this claim in editors whose hook
   * matches that identifier. This editor was written against the rakhi family,
   * which calls its latch `resumePublishRef` — so `draft:check` skipped this
   * template entirely, reported 44/44, and the duplicate row above was
   * reproduced in a real database regardless.
   *
   * It is named for the convention the check recognises, so the coverage here is
   * real rather than accidental. Rename it and the guard silently stops being
   * enforced.
   *
   * (The rakhi pair still uses the other name and is still unchecked. That is a
   * pre-existing gap in those two templates, not this one.)
   */
  const publishInFlightRef = useRef(false);

  const headers = useCallback(
    () => ({
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      ...(IS_NGROK ? { "ngrok-skip-browser-warning": "true" } : {}),
    }),
    [accessToken]
  );

  // ── Load an existing page (?edit=<id>) ──
  useEffect(() => {
    const id = searchParams.get("edit") || searchParams.get("id");
    if (!id || !isAuthenticated || !accessToken) return;

    fetch(`${BASE}/${id}`, { headers: headers() })
      .then((r) => r.json())
      .then((result) => {
        if (!result.success || !result.data) return;
        const d = dbToGaneshData(result.data);
        setContent(d);
        setMf(d);
        setPageId(id);
        setIsPersonalized(true);
        setEditMode("preview");
        bumpPreview();
        if (result.data.isPublished && result.data.shareUrl) {
          setShareUrl(String(result.data.shareUrl));
        }
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, accessToken, searchParams]);

  // ── Held photos are resolved HERE and nowhere else ────────────────────────
  //
  // A photo picked but not published lives in IndexedDB and is carried in the
  // data as `idb:<id>`. Swapping those for object URLs at this single seam is
  // what lets every screen below keep rendering a plain string: the darshan
  // frame, the polaroid grid and the story card never learn that local media
  // exists. `resolveMedia` returns the same object untouched when there is
  // nothing local, so the published path costs nothing.
  const displayData = useMemo(() => {
    const source = editMode === "manual" || editMode === "choose" ? mf : content;
    return resolveMedia(source);
  }, [editMode, mf, content]);

  // Anything still held belongs to a session whose form state is gone — this
  // template persists no local draft, so nothing can reference it. See
  // mediaStore.
  useEffect(() => {
    void purgeLocal();
  }, []);

  const updateMf = useCallback(
    (key: keyof GaneshData, val: unknown) => setMf((p) => ({ ...p, [key]: val })),
    []
  );

  /** Seeds the form exactly as opening it does, without opening it. */
  const seedManualForm = useCallback(() => {
    setMf(isPersonalized ? { ...content } : { ...SAMPLE });
  }, [isPersonalized, content]);

  const handleEditClick = useCallback(() => {
    seedManualForm();
    setEditMode("manual");
  }, [seedManualForm]);

  const handleEditFromPreview = useCallback(() => {
    setMf({ ...content });
    setEditMode("manual");
  }, [content]);

  /**
   * Create. `mf` is seeded up front — from the loaded page or from `SAMPLE`,
   * whichever the form would have used — so a generated draft lands on the right
   * base and `onManual` can open the untouched form without re-seeding over the
   * AI's work.
   */
  const handleStartCreate = useCallback(() => {
    handleEditClick();
    setStoryStarter(true);
  }, [handleEditClick]);

  /** "I'll write it myself" from the starter — the form is already behind it. */
  const openManualForm = useCallback(() => setEditMode("manual"), []);

  const handleSave = useCallback(() => {
    if (!mf.recipientName.trim()) {
      pushToast({ type: "info", title: "Add their name first" });
      return;
    }
    setSaving(true);
    setContent(mf);
    setIsPersonalized(true);
    setEditMode("preview");
    bumpPreview();
    setSaving(false);
    pushToast({ type: "success", title: "Saved", message: "Scroll it, then send it" });
  }, [mf, pushToast, bumpPreview]);

  // `create` and `update` take the data explicitly rather than reading `content`
  // off the closure, because at publish time the thing that must be written is
  // the UPLOADED copy — the one whose `idb:` refs have become CDN URLs — and
  // that copy exists as a local value some milliseconds before React has it in
  // state. Reading `content` here would persist the refs instead.
  const create = useCallback(
    async (data: GaneshData): Promise<string | null> => {
      const res = await fetch(BASE, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify(ganeshDataToBody(data, pagePassword)),
      });
      const result = await res.json();
      if (!result.success) return null;
      setPageId(result.data._id);
      return result.data._id as string;
    },
    [pagePassword, headers]
  );

  const update = useCallback(
    async (id: string, data: GaneshData) => {
      await fetch(`${BASE}/${id}`, {
        method: "PUT",
        headers: headers(),
        body: JSON.stringify(ganeshDataToBody(data, pagePassword)),
      });
    },
    [pagePassword, headers]
  );

  /**
   * Send every held photo to S3, then hand back the data with CDN URLs.
   *
   * ── ALL OR NOTHING ────────────────────────────────────────────────────────
   *
   * A failure anywhere aborts the publish. The alternative — press on and save
   * what uploaded — writes a document containing a `blob:` URL from this tab,
   * which resolves for the sender, for a few minutes, and is a permanently
   * broken image for whoever they sent it to. There is no way for the recipient
   * to tell that apart from a page made badly, so a failed upload has to stop
   * the publish and say so.
   */
  const uploadHeld = useCallback(
    async (
      data: GaneshData,
      token: string
    ): Promise<{ ok: true; data: GaneshData } | { ok: false; error: string }> => {
      const refs = localRefs(data);
      if (refs.length === 0) return { ok: true, data };

      const map = new Map<string, string>();
      for (let i = 0; i < refs.length; i++) {
        const ref = refs[i];
        setPublishStage(
          refs.length === 1 ? "Uploading your photo…" : `Uploading… ${i + 1} of ${refs.length}`
        );

        const blob = await getLocal(ref);
        if (!blob) {
          // The record is gone: a purge, a cleared site, a second tab. Nothing
          // to send and nothing to recover, so say which step failed.
          return { ok: false, error: "One of your photos went missing — add it again" };
        }

        const kind = ref === data.vargani.qrImageUrl ? "qr" : "hero";
        const r = await uploadImage(blobToFile(blob, kind), token);
        if (!r.ok || !r.url) return { ok: false, error: r.error ?? "A photo failed to upload" };
        map.set(ref, r.url);
      }

      setPublishStage(null);
      // Only now that every one is up: rewrite, then forget the local copies.
      const next = applyUploaded(data, map);
      for (const ref of refs) void dropLocal(ref);
      return { ok: true, data: next };
    },
    []
  );

  // ── Auto-draft ────────────────────────────────────────────────────────────
  //
  // Work built while signed OUT is held in the browser and promoted to a real
  // draft — photos to S3 — the moment the visitor signs up or logs in.
  //
  // This template holds photos as `idb:` refs rather than base64, so it hands
  // adoption its own `getLocal`: nothing outside `mediaStore` can reach that
  // store.
  const draft = useDraft({
    templateType: TEMPLATE,
    content,
    enabled: isPersonalized,
    busy: publishing,
    isAuthenticated,
    accessToken,
    pageId,
    // The claim. Adoption checks this before it POSTs — see the note on the ref.
    publishInFlight: publishInFlightRef,
    resolveLocalRef: getLocal,
    onProgress: setPublishStage,
    persist: (d) =>
      persistDraft({
        base: BASE,
        headers: headers(),
        pageId,
        setPageId,
        body: ganeshDataToBody(d, pagePassword),
      }),
    onAdopted: (d) => {
      setContent(d);
      setMf({ ...d });
      setIsPersonalized(true);
      // ── AND RE-SEAT THE PREVIEW ──────────────────────────────────────────
      //
      // The preview component is keyed on `previewVersion` in page.tsx and
      // seeds its own screen state from `data` when that key changes. Setting
      // `content` alone is invisible: the key does not move, the component does
      // not remount, and it goes on showing the demo it seeded with at mount.
      //
      // That was the bug on the rakhi template. A signed-out visitor who built a
      // page, closed the tab and came back got their work back in the edit sheet
      // — which reads the form directly and is not keyed — while the page behind
      // it still showed the demo names. The data was never lost and would have
      // published correctly; it only looked lost, which is the same thing to the
      // person looking at it.
      bumpPreview();
    },
  });

  // ── The milestones ────────────────────────────────────────────────────────
  //
  // Watching `editMode` rather than calling `saveNow()` from each place that
  // sets it: a transition is impossible to forget in a way a call site is not.
  // Leaving the editor and backgrounding the tab are handled inside the hook.
  useEffect(() => {
    if (editMode === null || editMode === "preview") void draft.saveNow();
  }, [editMode, draft]);

  const publish = useCallback(async () => {
    track(EVENTS.PUBLISH_CLICKED, { template: TEMPLATE, is_authenticated: isAuthenticated });

    if (!content.recipientName.trim()) {
      track(EVENTS.PUBLISH_FAILED, { template: TEMPLATE, reason: "missing_recipient_name" });
      pushToast({ type: "info", title: "Add their name", message: "Open Edit and fill it in" });
      setEditMode("manual");
      setMf({ ...content });
      return;
    }

    if (!isAuthenticated || !accessToken) {
      track(EVENTS.AUTH_REQUIRED, { template: TEMPLATE });
      pendingPublishRef.current = true;
      // Claimed HERE, at the deferral, and not merely inside the resumed
      // publish below. Both writers wake on the same commit — the one where the
      // token lands — and `useDraft`'s effect is declared inside a hook called
      // ABOVE the resume effect, so it flushes first. A claim raised inside the
      // resumed publish is a beat too late by construction; raised here it is
      // already true before the token exists, so the ordering stops mattering.
      // `closeAuth` releases it if they abandon the sign-in.
      publishInFlightRef.current = true;
      setShowAuth(true);
      return;
    }

    setPublishing(true);
    // Claimed BEFORE the upload, not just before the POST: the upload can take
    // several seconds on a phone, and adoption's effect fires the moment the
    // token lands — which is already in the past by the time we get here.
    publishInFlightRef.current = true;
    try {
      // The photos go up first. Everything after this point deals only in URLs.
      const up = await uploadHeld(content, accessToken);
      if (!up.ok) {
        track(EVENTS.PUBLISH_FAILED, { template: TEMPLATE, reason: "media_upload_failed" });
        pushToast({ type: "info", title: "Photos didn't upload", message: up.error });
        return;
      }
      const data = up.data;
      setContent(data);

      let id = pageId;
      if (!id) id = await create(data);
      else await update(id, data);
      if (!id) throw new Error("Save failed");

      // Clear the paywall BEFORE publishing, so nothing spins behind the sheet
      // and the publish request is only made when it will succeed.
      const gate = await ensurePublishAllowed(
        {
          slug: TEMPLATE,
          templateType: "ganesh-chaturthi",
          pageId: id,
          templateTitle: "Happy Ganesh Chaturthi",
        },
        setPublishing
      );
      if (gate === "cancelled") return;

      const pubRes = await fetch(`${BASE}/${id}/publish`, { method: "POST", headers: headers() });
      const pubResult = await pubRes.json();
      if (pubResult.success) {
        setShareUrl(String(pubResult.data.shareUrl));
        // The story goes into their profile HERE, so the next template they make
        // pre-fills itself. It is also in the resume-after-login path below —
        // miss it there and the feature silently degrades for exactly the people
        // who were logged out when they pressed Send, i.e. most first-time
        // senders, i.e. the ones whose story you most wanted.
        await fill.persistStory();
        track(EVENTS.PUBLISH_SUCCESS, { template: TEMPLATE, source: "direct" });
        // ── SAY IT WORKED, AND POINT AT SHARE ─────────────────────────────────
        //
        // No link in this toast, deliberately, and `scripts/feedback-coverage.mjs`
        // fails the build if one appears. A link here is a second door: the
        // sender copies it, never taps Share, and is never asked for feedback.
        // The link lives behind Share alone, so this names the next action rather
        // than trailing off — the top-bar button has just relabelled itself.
        pushToast({ type: "publish", title: "It's live", message: "Tap Share to send the link" });
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
      setPublishStage(null);
      // Released on every path, including the early `return` after a failed
      // upload: a claim that is never dropped means the held work can never be
      // adopted, which turns a duplicated page into a lost one.
      publishInFlightRef.current = false;
    }
  }, [
    content,
    isAuthenticated,
    accessToken,
    pageId,
    create,
    update,
    uploadHeld,
    headers,
    pushToast,
    fill,
  ]);

  // ── Resume the publish the auth modal interrupted ─────────────────────────
  //
  // THIS IS THE FIX FOR "I sign in and nothing happens".
  //
  // The obvious version watches only `[isAuthenticated, accessToken]` and calls
  // the `publish` it captured. But `publish` closes over `accessToken`, so on
  // the commit where the token arrives the captured copy is the PREVIOUS one,
  // built while `accessToken` was still null. The resumed publish therefore hits
  // its own first guard — `if (!isAuthenticated || !accessToken)` — concludes the
  // sender is not signed in, and returns. No request, no page, no share link, no
  // error: measured on the rakhi template as exactly one `/auth/login` call and
  // nothing else.
  //
  // Depending on `publish` is what fixes it. The token landing rebuilds
  // `publish`, which re-runs this effect with a version that can see the token.
  // The ref is a one-shot latch, so re-running whenever `publish` is rebuilt
  // costs nothing.
  //
  // It also re-enters `publish()` rather than carrying its own copy of the
  // create-then-publish sequence. Two copies had already drifted once, in a way
  // that costs a real page: the second one always POSTed a NEW document, ignoring
  // `pageId`, so resuming after sign-in on an already-saved page created a
  // SECOND page and published that — leaving the first orphaned and the share
  // link pointing at a different document than the editor was holding.
  useEffect(() => {
    if (!pendingPublishRef.current || !isAuthenticated || !accessToken) return;
    pendingPublishRef.current = false;
    // Already true from the deferral above; re-asserted because this effect is
    // the one place that is certain to run before the resumed publish does, and
    // a future edit that reaches this effect by some other route still owns the
    // row from here.
    publishInFlightRef.current = true;
    // ── WHY THE REMOUNT IS CONDITIONAL ────────────────────────────────────────
    //
    // `bumpPreview` remounts the template, which restarts the page at the cover.
    // That is right when the data underneath is about to change — the stage
    // renders `mf` while the builder is open and `content` once it is closed, and
    // leaving a half-finished puja pointing at a different object is how you get
    // a screen that does not match its own progress.
    //
    // It is wrong when they pressed Send from the preview, which is the ordinary
    // path: nothing about the stage changes, so remounting it only throws away
    // the screen they were on. That is the "it sent me back to the start" half of
    // not knowing whether the page published.
    if (editMode !== "preview") {
      setEditMode("preview");
      bumpPreview();
    }
    void publish();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, accessToken, publish]);

  /**
   * They closed the sign-in modal. If they did NOT sign in, the publish they
   * asked for is not going to happen, and saying nothing is the worst version of
   * that: the page still shows "Send it", so it looks like it worked and quietly
   * did not. Drop the intent and say what to do next.
   *
   * Guarded on the token rather than on the modal, because `AuthModal` calls
   * `onSuccess` on success and `onClose` only for the backdrop and the X — but a
   * future version calling both must not produce a toast contradicting a publish
   * that is already running.
   */
  const closeAuth = useCallback(() => {
    setShowAuth(false);
    if (pendingPublishRef.current && !accessToken) {
      pendingPublishRef.current = false;
      // The publish is not happening, so the row is no longer ours to create.
      // Left raised, adoption would stand down forever and the work they built
      // signed out would never reach the server at all — a duplicated page
      // traded for a lost one.
      publishInFlightRef.current = false;
      pushToast({
        type: "info",
        title: "Not sent yet",
        message: "Sign in and tap Send it again",
      });
    }
  }, [accessToken, pushToast]);

  const closeAuthSuccess = useCallback(() => setShowAuth(false), []);

  const handleCopy = useCallback(
    (url?: string) => {
      const link = url || shareUrl;
      if (!link) return;
      void navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      if (!url) pushToast({ type: "success", title: "Link copied!" });
    },
    [shareUrl, pushToast]
  );

  /**
   * The one door to the link.
   *
   * `openShareSheet` asks for feedback on this click, holds the sheet until the
   * modal closes, and renders the sheet once for every template through
   * `ShareSheetHost` in the templates layout. Local share state, a local
   * `<ShareSheet>` or a local `requestFeedback` call are three ways to drift
   * from the other forty-three, and `npm run feedback:check` fails the build for
   * each of them.
   */
  const handleShare = useCallback(() => {
    if (!shareUrl) return;
    openShareSheet({
      url: shareUrl,
      password: pagePassword,
      title: "Happy Ganesh Chaturthi",
      text: `${content.recipientName || "For you"} — happy Ganesh Chaturthi`,
      cardTitle: "Happy Ganesh Chaturthi",
      cardNote: "Scan to open the page",
      accent: "#9E2B2B",
      recipientName: content.recipientName,
      senderName: content.senderName,
      slug: TEMPLATE,
    });
  }, [shareUrl, pagePassword, content]);

  const goBack = useCallback(() => goBackFromTemplate(router), [router]);

  const shareId = shareUrl ? shareUrl.split("/").pop() ?? null : null;

  return {
    content, mf, displayData, editMode, pagePassword, pageId, shareUrl, shareId,
    isPersonalized, showAuth, saving, publishing, copied, previewVersion,

    fill, storyStarter, openManualForm, publishStage,

    setEditMode, setPagePassword, updateMf, setMf,
    handleStartCreate, handleEditClick, handleEditFromPreview, handleSave,
    create, update, publish,
    closeAuth, closeAuthSuccess, handleCopy, handleShare, goBack,
    pushToast,
    showPublish: isPersonalized && !shareUrl && !publishing,
    showShare: !!shareUrl,
    shareLabel: copied ? "Copied!" : "Share",
  };
}
