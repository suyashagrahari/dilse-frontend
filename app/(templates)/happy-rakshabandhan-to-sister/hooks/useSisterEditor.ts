"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { useStoryFill } from "@/hooks/useStoryFill";
import { API_URL, IS_NGROK } from "@/lib/config";
import { EVENTS } from "@/lib/analytics/events";
import { track } from "@/lib/analytics/track";
import { openShareSheet } from "@/lib/share/shareBus";
import {
  type SisterData,
  type EditMode,
  type Toast,
  SAMPLE,
  DEMO,
  sisterDataToBody,
  dbToSisterData,
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

/** Slug reported on every analytics event from this editor. */
const TEMPLATE = "happy-rakshabandhan-to-sister";
const BASE = `${API_URL}/raksha-bandhan-sister-pages`;

// ─── NO DRAFT STORAGE ────────────────────────────────────────────────────────
//
// Most editors in this codebase autosave a work-in-progress draft to
// localStorage. This one deliberately does not — "no localStorage or
// sessionStorage" is an explicit constraint on this template.
//
// The cost is real and worth stating: if he reloads the tab mid-build, the form
// is empty again. What replaces it is the server — the moment he taps Save the
// page is created and reachable at `?edit=<id>`, so anything he has actually
// finished survives. Only the unsaved half of a session is at risk.

export function useSisterEditor() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, accessToken } = useAppSelector((s) => s.auth);

  // ── DEMO for the preview, SAMPLE for the form ────────────────────────────
  //
  // `content` is what the preview renders, so it starts as the filled demo —
  // otherwise a visitor evaluating this template sees an empty shell and never
  // learns that the cover photo and the polaroids exist at all.
  //
  // `mf` is the form, so it starts as `SAMPLE`, which ships every photo slot
  // empty by design. If these were seeded from the same object he would open the
  // builder holding another family's photographs, one Send away from putting them
  // on his sister's page. They must never be merged.
  const [content, setContent] = useState<SisterData>(DEMO);
  const [mf, setMf] = useState<SisterData>({ ...SAMPLE });
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
  // that decides what counts as HIS words.
  //
  // `demo: SAMPLE`, not `DEMO`, and the distinction matters. `diffTouched`
  // treats "differs from the baseline and is non-empty" as "the sender typed
  // this" and protects it from being overwritten, so the baseline has to be
  // what the form actually opens holding. Passing the filled gallery `DEMO`
  // instead would make Kabir's greeting the baseline and quietly mark a
  // brother's own lines as untouched.
  const fill = useStoryFill<SisterData>({
    slug: TEMPLATE,
    demo: SAMPLE,
    current: mf,
    onFilled: setMf,
    // The composer asks for his name and hers; this says where they land if the
    // model does not write them back itself. `sisterName` gates Save, so without
    // this a fill that dropped it would strand him on a validation error for a
    // name he typed thirty seconds earlier.
    namePaths: { sender: "brotherName", recipient: "sisterName" },
  });

  // Mounted the first time Create is tapped. `StoryStarter` renders nothing at
  // all until the server has a schema for this slug, so this is safe to ship
  // ahead of the server config.
  const [storyStarter, setStoryStarter] = useState(false);

  const [showAuth, setShowAuth] = useState(false);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  /**
   * What the publish is doing right now, e.g. "Uploading photos… 2 of 4".
   *
   * Photos are uploaded at publish rather than at pick, so pressing Send can now
   * mean several megabytes over a phone connection. A spinner with no counter
   * behind it reads as a hang, and the natural response to a hang is to press
   * the button again.
   */
  const [publishStage, setPublishStage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastIdRef = useRef(0);

  /**
   * He pressed Send without an account. Set on the way into the auth modal and
   * consumed by the resume effect below `publish`.
   *
   * A bare flag, not a copy of his data: `publish` reads `content` and
   * `pagePassword` from state, and those are exactly what he was looking at
   * when he pressed the button. Stashing a snapshot here as well meant two
   * sources of truth for the same page, and the snapshot was the one that
   * silently went stale.
   */
  const resumePublishRef = useRef(false);

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
    // The publish toast is the one that stays longest, not the shortest. It used
    // to be pulled after one second, which is less time than it takes to read
    // it — and it is the only confirmation that the page went live, and it now
    // carries a Copy button. Everything else is an acknowledgement of something
    // he just did and can go.
    const delay = toast.type === "publish" ? 7000 : 3500;
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), delay);
  }, []);

  const dismissToast = useCallback(
    (id: number) => setToasts((prev) => prev.filter((t) => t.id !== id)),
    []
  );

  // ── Load an existing page (?edit=<id>) ──
  useEffect(() => {
    const id = searchParams.get("edit") || searchParams.get("id");
    if (!id || !isAuthenticated || !accessToken) return;

    fetch(`${BASE}/${id}`, { headers: headers() })
      .then((r) => r.json())
      .then((result) => {
        if (!result.success || !result.data) return;
        const d = dbToSisterData(result.data);
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

  // ── Resume a publish that the auth modal interrupted ──────────────────────
  //
  // He pressed Send, had no account, signed in. An effect further down runs the
  // moment the token lands and finishes what he asked for.
  //
  // ── WHY THAT EFFECT CALLS `publish()` INSTEAD OF DOING THE WORK ────────────
  //
  // It used to contain its own copy of the create-then-publish sequence, and the
  // two copies had already drifted in a way that costs a real page: that one
  // always POSTed a NEW document, ignoring `pageId`, so resuming after sign-in
  // on a page that had already been saved created a SECOND page and published
  // that one — leaving the first orphaned and the share link pointing at a
  // different document than the editor was holding.
  //
  // Re-entering `publish()` also means the resumed path automatically gets
  // everything the direct path gains later. The media upload, the progress
  // counter and the analytics events are already there; a second implementation
  // would have to remember to copy each one.
  //
  // The resume effect lives further down, immediately after `publish` — it has
  // to depend on `publish`, and a dependency array cannot name a `const`
  // declared below it. Declared up here it was a temporal-dead-zone crash.

  // ── Held photos are resolved HERE and nowhere else ────────────────────────
  //
  // A photo he has picked but not published lives in IndexedDB and is carried
  // in the data as `idb:<id>`. Swapping those for object URLs at this single
  // seam is what lets every screen below keep rendering a plain string: the
  // tie, the polaroid grid and the story card never learn that local media
  // exists. `resolveMedia` returns the same object untouched when there is
  // nothing local, so the published path costs nothing.
  const displayData = useMemo(() => {
    const source = editMode === "manual" || editMode === "choose" ? mf : content;
    return resolveMedia(source);
  }, [editMode, mf, content]);

  // Anything still held belongs to a session whose form state is gone — this
  // template persists no draft, so nothing can reference it. See mediaStore.
  useEffect(() => {
    void purgeLocal();
  }, []);

  const updateMf = useCallback(
    (key: keyof SisterData, val: unknown) => setMf((p) => ({ ...p, [key]: val })),
    []
  );

  const handleEditClick = useCallback(() => {
    setMf(isPersonalized ? { ...content } : { ...SAMPLE });
    setEditMode("manual");
  }, [isPersonalized, content]);

  const handleEditFromPreview = useCallback(() => {
    setMf({ ...content });
    setEditMode("manual");
  }, [content]);

  const handleStartCreate = useCallback(() => {
    handleEditClick();
    setStoryStarter(true);
  }, [handleEditClick]);

  /** "I'll write it myself" from the starter — the form is already behind it. */
  const openManualForm = useCallback(() => setEditMode("manual"), []);

  // There is deliberately no "sign in to add a photo" path any more. Photos are
  // held in IndexedDB until publish, so the whole page can be built signed out
  // and the only thing that needs an account is sending it.

  // The save guard is on HER name, not his. `sisterName` is what the page is
  // addressed to and the largest text on the cover; `brotherName` arrives
  // prefilled as "Bhai", which is a real thing to sign a vow with.
  const handleSave = useCallback(() => {
    if (!mf.sisterName.trim()) {
      pushToast({ type: "info", title: "Add your sister's name first" });
      return;
    }
    setSaving(true);
    setContent(mf);
    setIsPersonalized(true);
    setEditMode("preview");
    bumpPreview();
    setSaving(false);
    pushToast({ type: "success", title: "Saved!", message: "Preview it, then send 🪢" });
  }, [mf, pushToast, bumpPreview]);

  // `create` and `update` take the data explicitly rather than reading `content`
  // off the closure, because at publish time the thing that must be written is
  // the UPLOADED copy — the one whose `idb:` refs have become CDN URLs — and
  // that copy exists as a local value some milliseconds before React has it in
  // state. Reading `content` here would persist the refs instead.
  const create = useCallback(
    async (data: SisterData): Promise<string | null> => {
      const res = await fetch(BASE, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify(sisterDataToBody(data, pagePassword)),
      });
      const result = await res.json();
      if (!result.success) return null;
      setPageId(result.data._id);
      return result.data._id as string;
    },
    [pagePassword, headers]
  );

  const update = useCallback(
    async (id: string, data: SisterData) => {
      await fetch(`${BASE}/${id}`, {
        method: "PUT",
        headers: headers(),
        body: JSON.stringify(sisterDataToBody(data, pagePassword)),
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
   * which resolves for him, for a few minutes, and is a permanently broken
   * image for his sister. There is no way for her to tell that apart from a
   * page he made badly, so a failed upload has to stop the publish and say so.
   */
  const uploadHeld = useCallback(
    async (
      data: SisterData,
      token: string
    ): Promise<{ ok: true; data: SisterData } | { ok: false; error: string }> => {
      const refs = localRefs(data);
      if (refs.length === 0) return { ok: true, data };

      const map = new Map<string, string>();
      for (let i = 0; i < refs.length; i++) {
        const ref = refs[i];
        setPublishStage(
          refs.length === 1
            ? "Uploading your photo…"
            : `Uploading photos… ${i + 1} of ${refs.length}`
        );

        const blob = await getLocal(ref);
        if (!blob) {
          // The record is gone: a purge, a cleared site, a second tab. Nothing
          // to send and nothing to recover, so say which step failed.
          return { ok: false, error: "One of your photos went missing — add it again" };
        }

        // Only two kinds exist: the lifafa carries no QR — see `Lifafa` in
        // `components/types.ts` — so anything that is not the cover photo is one
        // of the memories.
        const kind = ref === data.photoUrl ? "hero" : "memory";
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

  /**
   * Raise the house share sheet for a link.
   *
   * The copy is written from HIS side of the thread — he is sending her a page to
   * tie a rakhi on, which is the reverse of the brother template's "I tied you a
   * rakhi". `slug` and `accent` have to match the registry and
   * `lib/share/accents.ts` or the card renders in the other template's red.
   *
   * ── WHY THIS TAKES THE URL AS AN ARGUMENT ─────────────────────────────────
   *
   * `publish` calls this the instant the server confirms, which is inside the
   * same tick that calls `setShareUrl` — so `shareUrl` in scope is still null.
   * Reading it from state here would open an empty sheet on the one occasion it
   * matters most. The button in the top bar passes the state copy instead.
   */
  const openShare = useCallback(
    (url: string) => {
      openShareSheet({
        url,
        password: pagePassword,
        title: "Happy Raksha Bandhan 🪢",
        text: `${content.sisterName || "Behna"} — tie it. I'm holding up my wrist 🪢`,
        cardTitle: "Happy Raksha Bandhan",
        cardNote: "Scan to tie the rakhi",
        accent: "#A62A5C",
        recipientName: content.sisterName,
        senderName: content.brotherName,
        slug: TEMPLATE,
      });
    },
    [pagePassword, content.sisterName, content.brotherName]
  );

  const publish = useCallback(async () => {
    track(EVENTS.PUBLISH_CLICKED, { template: TEMPLATE, is_authenticated: isAuthenticated });

    if (!content.sisterName.trim()) {
      track(EVENTS.PUBLISH_FAILED, { template: TEMPLATE, reason: "missing_sister_name" });
      pushToast({
        type: "info",
        title: "Add your sister's name",
        message: "Open Edit and fill it in",
      });
      setEditMode("manual");
      setMf({ ...content });
      return;
    }

    if (!isAuthenticated || !accessToken) {
      track(EVENTS.AUTH_REQUIRED, { template: TEMPLATE });
      resumePublishRef.current = true;
      setShowAuth(true);
      return;
    }

    setPublishing(true);
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

      const pubRes = await fetch(`${BASE}/${id}/publish`, { method: "POST", headers: headers() });
      const pubResult = await pubRes.json();
      if (pubResult.success) {
        const url = String(pubResult.data.shareUrl);
        setShareUrl(url);
        track(EVENTS.PUBLISH_SUCCESS, { template: TEMPLATE, source: "direct" });
        pushToast({
          type: "publish",
          title: "Sent! 🪢",
          message: "Her page is live",
          shareUrl: url,
        });
        // ── SAY IT WORKED, WITH THE LINK IN HAND ──────────────────────────────
        //
        // Publishing used to end with a one-second toast and the top-bar button
        // quietly relabelling itself from "Send it" to "Share". Nothing else
        // changed on screen, so the honest reading of the page afterwards was
        // "I don't know whether that worked" — and after signing in mid-publish
        // the page also restarted from the cover, which reads as being thrown
        // back to the beginning.
        //
        // The sheet is the answer to both. It is the same one every other
        // template raises, it names the page and shows the link, and it cannot be
        // mistaken for nothing having happened. He dismisses it and the page is
        // still there, still published, with Share in the bar.
        openShare(url);
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
    openShare,
  ]);

  // ── Resume the publish the auth modal interrupted ─────────────────────────
  //
  // THIS IS THE FIX FOR "I sign in and nothing happens".
  //
  // The old version watched only `[isAuthenticated, accessToken]` and called the
  // `publish` it had captured. But `publish` closes over `accessToken`, so on
  // the commit where the token arrives the captured copy is the PREVIOUS one,
  // built while `accessToken` was still null. The resumed publish therefore hit
  // its own first guard — `if (!isAuthenticated || !accessToken)` — concluded he
  // was not signed in, and returned. No request, no page, no share link, no
  // error: measured as exactly one `/auth/login` call and nothing else.
  //
  // Depending on `publish` is what fixes it. The token landing rebuilds
  // `publish`, which re-runs this effect with a version that can see the token.
  // The ref is a one-shot latch, so re-running whenever `publish` is rebuilt
  // costs nothing.
  //
  // It also has to sit physically below `publish` for the same reason it names
  // it: a dependency array cannot reference a `const` declared later in the
  // body without throwing on first render.
  useEffect(() => {
    if (!resumePublishRef.current || !isAuthenticated || !accessToken) return;
    resumePublishRef.current = false;
    // ── WHY THE REMOUNT IS CONDITIONAL ────────────────────────────────────────
    //
    // `bumpPreview` remounts the template, which restarts it at the cover. That
    // is right when the data underneath is about to change — the stage renders
    // `mf` while the builder is open and `content` once it is closed, and leaving
    // a half-finished page pointing at a different object is how you get a screen
    // that does not match its own progress.
    //
    // It is wrong when he pressed Send from the preview, which is the ordinary
    // path: nothing about the stage changes, so remounting it only throws away
    // the screen he was on. That is the "it sent me back to the start" half of
    // not knowing whether the page published.
    if (editMode !== "preview") {
      setEditMode("preview");
      bumpPreview();
    }
    void publish();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, accessToken, publish]);

  /**
   * He closed the sign-in modal. If he did NOT sign in, the publish he asked
   * for is not going to happen, and saying nothing is the worst version of that:
   * the page still shows "Send it", so it looks like it worked and quietly did
   * not. Drop the intent and tell him what to do next.
   *
   * Guarded on the token rather than on the modal, because `AuthModal` calls
   * `onSuccess` on success and `onClose` only for the backdrop and the X — but
   * a future version calling both must not produce a toast contradicting a
   * publish that is already running.
   */
  const closeAuth = useCallback(() => {
    setShowAuth(false);
    if (resumePublishRef.current && !accessToken) {
      resumePublishRef.current = false;
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
      navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      if (!url) pushToast({ type: "success", title: "Link copied!" });
    },
    [shareUrl, pushToast]
  );

  const handleShare = useCallback(() => {
    if (!shareUrl) return;
    openShare(shareUrl);
  }, [shareUrl, openShare]);

  const goBack = useCallback(() => router.push("/templates"), [router]);

  const shareId = shareUrl ? shareUrl.split("/").pop() ?? null : null;

  return {
    content, mf, displayData, editMode, pagePassword, pageId, shareUrl, shareId,
    isPersonalized, showAuth, saving, publishing, copied, toasts, previewVersion,

    fill, storyStarter, openManualForm, publishStage,

    setEditMode, setPagePassword, updateMf, setMf,
    handleStartCreate, handleEditClick, handleEditFromPreview, handleSave,
    create, update, publish,
    closeAuth, closeAuthSuccess, handleCopy, handleShare, goBack,
    pushToast, dismissToast,

    showPublish: isPersonalized && !shareUrl && !publishing,
    showShare: !!shareUrl,
    shareLabel: copied ? "Copied!" : "Share",
  };
}
