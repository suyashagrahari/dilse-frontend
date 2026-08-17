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
  type RakhiData,
  type EditMode,
  type Toast,
  SAMPLE,
  DEMO,
  rakhiDataToBody,
  dbToRakhiData,
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
const TEMPLATE = "happy-rakshabandhan-to-brother";
const BASE = `${API_URL}/raksha-bandhan-pages`;

// ─── NO DRAFT STORAGE ────────────────────────────────────────────────────────
//
// Most editors in this codebase autosave a work-in-progress draft to
// localStorage. This one deliberately does not — "No localStorage or
// sessionStorage" is an explicit constraint on this template.
//
// The cost is real and worth stating: if she reloads the tab mid-build, the form
// is empty again. What replaces it is the server — the moment she taps Save, the
// page is created and reachable at `?edit=<id>`, so anything she has actually
// finished survives. Only the unsaved half of a session is at risk.

export function useRakhiEditor() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, accessToken } = useAppSelector((s) => s.auth);

  // ── DEMO for the preview, SAMPLE for the form ────────────────────────────
  //
  // `content` is what the preview renders, so it starts as the filled demo —
  // otherwise a visitor evaluating this template sees an empty shell and never
  // learns that photos, memories and the shagun QR exist.
  //
  // `mf` is the form, so it starts as `SAMPLE`, which is empty by design. If
  // these were seeded from the same object she would open the builder holding
  // another family's photograph and their UPI ID, one Publish away from sending
  // it to her brother. They must never be merged.
  const [content, setContent] = useState<RakhiData>(DEMO);
  const [mf, setMf] = useState<RakhiData>({ ...SAMPLE });
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
  // that decides what counts as HER words.
  //
  // `demo: SAMPLE`, not `DEMO`, and the distinction matters. `diffTouched`
  // treats "differs from the baseline and is non-empty" as "the sender typed
  // this", and protects it from being overwritten. `SAMPLE` is what the form
  // actually opens holding, so that comparison is meaningful. Passing the
  // filled gallery `DEMO` instead would make Meher's greeting the baseline and
  // quietly mark a sister's own identical-length lines as untouched.
  const fill = useStoryFill<RakhiData>({
    slug: TEMPLATE,
    demo: SAMPLE,
    current: mf,
    onFilled: setMf,
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

  const pendingPublishRef = useRef<{ data: RakhiData; password: string } | null>(null);

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
    const delay = toast.type === "publish" ? 1000 : 3500;
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
        const d = dbToRakhiData(result.data);
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

  // ── Resume a publish that was interrupted by the auth modal ──
  useEffect(() => {
    if (!isAuthenticated || !accessToken || !pendingPublishRef.current) return;
    const { data, password } = pendingPublishRef.current;
    pendingPublishRef.current = null;

    setPublishing(true);
    setEditMode("preview");
    bumpPreview();

    (async () => {
      try {
        // She signed in BECAUSE she pressed Send, so her photos are still held
        // locally and have to go up before this write — otherwise the resumed
        // publish saves `idb:` refs and her page has no pictures in it.
        const up = await uploadHeld(data, accessToken);
        if (!up.ok) {
          pushToast({ type: "info", title: "Photos didn't upload", message: up.error });
          return;
        }
        const uploaded = up.data;

        const res = await fetch(BASE, {
          method: "POST",
          headers: headers(),
          body: JSON.stringify(rakhiDataToBody(uploaded, password)),
        });
        const result = await res.json();
        if (!result.success) throw new Error("Save failed");

        const savedId = result.data._id as string;
        setPageId(savedId);
        setContent(uploaded);
        setIsPersonalized(true);

        const pubRes = await fetch(`${BASE}/${savedId}/publish`, {
          method: "POST",
          headers: headers(),
        });
        const pubResult = await pubRes.json();
        if (pubResult.success) {
          setShareUrl(String(pubResult.data.shareUrl));
          pushToast({ type: "publish", title: "Sent! 🪢", message: "Your rakhi is live" });
        } else {
          pushToast({ type: "info", title: "Publish failed", message: "Saved — tap Send to go live" });
        }
      } catch {
        pushToast({ type: "info", title: "Save failed", message: "Please try again" });
      } finally {
        setPublishing(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, accessToken]);

  // ── Held photos are resolved HERE and nowhere else ────────────────────────
  //
  // A photo she has picked but not published lives in IndexedDB and is carried
  // in the data as `idb:<id>`. Swapping those for object URLs at this single
  // seam is what lets every screen below keep rendering a plain string: the
  // ritual, the polaroid grid and the story card never learn that local media
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
    (key: keyof RakhiData, val: unknown) => setMf((p) => ({ ...p, [key]: val })),
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

  const handleSave = useCallback(() => {
    if (!mf.brotherName.trim()) {
      pushToast({ type: "info", title: "Add your bhai's name first" });
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
    async (data: RakhiData): Promise<string | null> => {
      const res = await fetch(BASE, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify(rakhiDataToBody(data, pagePassword)),
      });
      const result = await res.json();
      if (!result.success) return null;
      setPageId(result.data._id);
      return result.data._id as string;
    },
    [pagePassword, headers]
  );

  const update = useCallback(
    async (id: string, data: RakhiData) => {
      await fetch(`${BASE}/${id}`, {
        method: "PUT",
        headers: headers(),
        body: JSON.stringify(rakhiDataToBody(data, pagePassword)),
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
   * which resolves for her, for a few minutes, and is a permanently broken
   * image for her brother. There is no way for him to tell that apart from a
   * page she made badly, so a failed upload has to stop the publish and say so.
   */
  const uploadHeld = useCallback(
    async (
      data: RakhiData,
      token: string
    ): Promise<{ ok: true; data: RakhiData } | { ok: false; error: string }> => {
      const refs = localRefs(data);
      if (refs.length === 0) return { ok: true, data };

      const map = new Map<string, string>();
      for (let i = 0; i < refs.length; i++) {
        const ref = refs[i];
        setPublishStage(
          refs.length === 1 ? "Uploading your photo…" : `Uploading photos… ${i + 1} of ${refs.length}`
        );

        const blob = await getLocal(ref);
        if (!blob) {
          // The record is gone: a purge, a cleared site, a second tab. Nothing
          // to send and nothing to recover, so say which step failed.
          return { ok: false, error: "One of your photos went missing — add it again" };
        }

        const kind = ref === data.shagun.qrImageUrl ? "qr" : ref === data.photoUrl ? "hero" : "memory";
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

  const publish = useCallback(async () => {
    track(EVENTS.PUBLISH_CLICKED, { template: TEMPLATE, is_authenticated: isAuthenticated });

    if (!content.brotherName.trim()) {
      track(EVENTS.PUBLISH_FAILED, { template: TEMPLATE, reason: "missing_brother_name" });
      pushToast({ type: "info", title: "Add your bhai's name", message: "Open Edit and fill it in" });
      setEditMode("manual");
      setMf({ ...content });
      return;
    }

    if (!isAuthenticated || !accessToken) {
      track(EVENTS.AUTH_REQUIRED, { template: TEMPLATE });
      pendingPublishRef.current = { data: content, password: pagePassword };
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
        setShareUrl(String(pubResult.data.shareUrl));
        track(EVENTS.PUBLISH_SUCCESS, { template: TEMPLATE, source: "direct" });
        pushToast({ type: "publish", title: "Sent! 🪢", message: "Your rakhi is live" });
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
    // Still read directly, for `pendingPublishRef` when the auth modal
    // interrupts — `create`/`update` take their own copy via their closures.
    pagePassword,
    isAuthenticated,
    accessToken,
    pageId,
    create,
    update,
    uploadHeld,
    headers,
    pushToast,
  ]);

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
    [shareUrl, pushToast]
  );

  const handleShare = useCallback(() => {
    if (!shareUrl) return;
    openShareSheet({
      url: shareUrl,
      password: pagePassword,
      title: "Happy Raksha Bandhan 🪢",
      text: `${content.brotherName || "Bhai"} — I tied you a rakhi 🪢`,
      cardTitle: "Happy Raksha Bandhan",
      cardNote: "Scan to tie your rakhi",
      accent: "#9B2226",
      recipientName: content.brotherName,
      senderName: content.sisterName,
      slug: "happy-rakshabandhan-to-brother",
    });
  }, [shareUrl, content.brotherName, content.sisterName, pagePassword]);

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
