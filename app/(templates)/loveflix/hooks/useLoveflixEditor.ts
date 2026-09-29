"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { useStoryFill } from "@/hooks/useStoryFill";
import { API_URL, IS_NGROK } from "@/lib/config";
import { EVENTS } from "@/lib/analytics/events";
import { track } from "@/lib/analytics/track";
import { DEMO_DATA, LIMITS, dbToLoveflixData, loveflixDataToBody, toCrop, type EditMode, type Episode, type LoveflixData } from "../components/types";
import { openShareSheet } from "@/lib/share/shareBus";
import { ensurePublishAllowed } from "@/lib/paywall/publishRequest";
import { useDraft } from "@/lib/draft/useDraft";
import { useToast } from "@/lib/toast/useToast";
import { persistDraft } from "@/lib/draft/persistDraft";

const DRAFT_KEY = "loveflix_draft";
const BASE = `${API_URL}/loveflix-pages`;

/** Slug reported on every analytics event from this editor. */
const TEMPLATE = "loveflix";

// Draft is persisted to localStorage so a refresh (or an accidental tab close)
// keeps every line the sender wrote. Falls back to sessionStorage if unavailable.
const draftStore = (): Storage | null => {
  try { return window.localStorage; } catch { try { return window.sessionStorage; } catch { return null; } }
};
const saveDraft = (payload: unknown) => {
  const json = JSON.stringify(payload);
  try { draftStore()?.setItem(DRAFT_KEY, json); return; } catch {}
  // Over quota (photos are base64 until publish) — sessionStorage has its own.
  try { window.sessionStorage.setItem(DRAFT_KEY, json); } catch {}
};
const clearDraft = () => {
  try { window.localStorage.removeItem(DRAFT_KEY); } catch {}
  try { window.sessionStorage.removeItem(DRAFT_KEY); } catch {}
};
const readDraft = (): { data?: LoveflixData; password?: string; completed?: boolean } | null => {
  try {
    const raw = draftStore()?.getItem(DRAFT_KEY) ?? window.sessionStorage.getItem(DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
};

/* ── Cleaning ──────────────────────────────────────────────────────────────────
   A work-in-progress draft legitimately contains blank episodes and empty list
   slots. Those are fine to author with and never fine to publish, so everything
   is trimmed and pruned once, on Save, on the way from `mf` into `content`. `mf`
   itself is left untouched.
─────────────────────────────────────────────────────────────────────────────*/

const t = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const tl = (v: unknown, max: number) =>
  typeof v === "string" ? v.replace(/[ \t]+$/gm, "").trim().slice(0, max) : "";
const cleanList = (v: unknown, max: number, each: number) =>
  (Array.isArray(v) ? v : []).map((x) => t(x, each)).filter(Boolean).slice(0, max);

const cleanEpisodes = (eps: Episode[]): Episode[] =>
  (Array.isArray(eps) ? eps : [])
    .filter((e) => t(e?.title, LIMITS.epTitle).length > 0)
    .map((e) => ({
      title: t(e.title, LIMITS.epTitle),
      synopsis: t(e.synopsis, LIMITS.synopsis),
      subtitle: tl(e.subtitle, LIMITS.subtitle),
      imageUrl: t(e.imageUrl, 3_000_000),
      crop: toCrop(e.crop),
    }))
    .slice(0, LIMITS.episodes);

export const cleanData = (d: LoveflixData): LoveflixData => ({
  recipientName: t(d.recipientName, LIMITS.name),
  recipientPhotoUrl: t(d.recipientPhotoUrl, 3_000_000),
  recipientCrop: toCrop(d.recipientCrop),
  senderName: t(d.senderName, LIMITS.name),
  senderPhotoUrl: t(d.senderPhotoUrl, 3_000_000),
  senderCrop: toCrop(d.senderCrop),
  thirdProfile: t(d.thirdProfile, LIMITS.name),
  showTitle: t(d.showTitle, LIMITS.showTitle),
  tagline: t(d.tagline, LIMITS.tagline),
  heroImageUrl: t(d.heroImageUrl, 3_000_000),
  heroCrop: toCrop(d.heroCrop),
  matchPercent: Math.round(Math.min(100, Math.max(1, Number(d.matchPercent) || 99))),
  rating: t(d.rating, LIMITS.rating),
  ratingReason: t(d.ratingReason, LIMITS.ratingReason),
  seasons: t(d.seasons, LIMITS.seasons),
  metYear: t(d.metYear, LIMITS.metYear),
  genres: cleanList(d.genres, LIMITS.genres, LIMITS.genre),
  episodes: cleanEpisodes(d.episodes),
  reasons: cleanList(d.reasons, LIMITS.reasons, LIMITS.reason),
  insideJokes: cleanList(d.insideJokes, LIMITS.jokes, LIMITS.joke),
  plans: cleanList(d.plans, LIMITS.plans, LIMITS.plan),
  finaleText: tl(d.finaleText, LIMITS.finaleText),
  finaleQuestion: t(d.finaleQuestion, LIMITS.finaleQuestion),
  letter: tl(d.letter, LIMITS.letter),
  lockQuestion: t(d.lockQuestion, LIMITS.lockQuestion),
  lockAnswer: t(d.lockAnswer, LIMITS.lockAnswer),
});

/** What still stops this from being publishable, in words. Empty = ready. */
export const missingFields = (d: LoveflixData): string[] => {
  const out: string[] = [];
  if (!t(d.recipientName, LIMITS.name)) out.push("their name");
  if (!t(d.showTitle, LIMITS.showTitle)) out.push("a show title");
  if (cleanEpisodes(d.episodes).length === 0) out.push("one episode with a title");
  return out;
};

/** True once the data carries enough to be worth publishing. */
export const isPublishable = (d: LoveflixData): boolean => missingFields(d).length === 0;

export function useLoveflixEditor() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, accessToken } = useAppSelector((s) => s.auth);

  const [content, setContent] = useState<LoveflixData>(DEMO_DATA);
  const [mf, setMf] = useState<LoveflixData>({ ...DEMO_DATA });
  const [editMode, setEditMode] = useState<EditMode>(null);
  const [pagePassword, setPagePassword] = useState("");
  const [pageId, setPageId] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [isPersonalized, setIsPersonalized] = useState(false);

  // ── AI story fill ───────────────────────────────────────────────────────────
  // Every text leaf is on the server schema; photos and crops never are.
  const fill = useStoryFill<LoveflixData>({
    slug: "loveflix",
    demo: DEMO_DATA,
    current: mf,
    onFilled: setMf,
  });

  // Mounted the first time Create is tapped. The starter renders nothing at all
  // when this template has no schema.
  const [storyStarter, setStoryStarter] = useState(false);

  // Bumped whenever a *new* preview should be shown → remounts the template so
  // the run restarts from the intro with the freshly-written show.
  const [previewVersion, setPreviewVersion] = useState(0);
  const bumpPreview = useCallback(() => setPreviewVersion((v) => v + 1), []);

  const [showAuth, setShowAuth] = useState(false);
  const saving = false; // save-to-preview is local/synchronous; kept for EditSheet API parity
  const [publishing, setPublishing] = useState(false);
  const { pushToast } = useToast();
  const [copied, setCopied] = useState(false);

  // Holds the draft when the user hits Publish while logged out → auto-resumes after login.
  const pendingPublishRef = useRef<{ data: LoveflixData; password: string } | null>(null);
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
            const d = dbToLoveflixData(result.data);
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
    if (draft?.data && Array.isArray(draft.data.episodes)) {
      // Restored verbatim (over the demo so a draft from an older build still has
      // every key), NOT through dbToLoveflixData: a work-in-progress draft
      // legitimately contains blank episodes, and the wire coercer strips those.
      const d = { ...DEMO_DATA, ...draft.data };
      setMf(d);
      if (draft.password) setPagePassword(draft.password);
      if (draft.completed) {
        setContent(cleanData(d));
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
    // We own the row from here; adoption stands down (see useDraft).
    publishInFlightRef.current = true;

    setPublishing(true);
    setEditMode("preview");
    (async () => {
      try {
        const res = await fetch(BASE, { method: "POST", headers: headers(), body: JSON.stringify(loveflixDataToBody(data, password)) });
        const result = await res.json();
        if (!result.success) throw new Error("Save failed");
        const savedId = result.data._id as string;
        setPageId(savedId);
        setContent(data);
        setIsPersonalized(true);

        // Clear the paywall BEFORE publishing, so nothing spins behind the sheet,
        // and the publish request is only made when it will succeed.
        const gate = await ensurePublishAllowed(
          { slug: TEMPLATE, templateType: "loveflix", pageId: savedId, templateTitle: "LoveFlix" },
          setPublishing,
        );
        if (gate === "cancelled") return;

        const pubRes = await fetch(`${BASE}/${savedId}/publish`, { method: "POST", headers: headers() });
        const pubResult = await pubRes.json();
        if (pubResult.success) {
          // The share URL is authored by the server — never assembled here.
          setShareUrl(String(pubResult.data.shareUrl));
          await fill.persistStory();
          clearDraft();
          track(EVENTS.PUBLISH_SUCCESS, { template: TEMPLATE, source: "auth_deferred" });
          pushToast({ type: "publish", title: "Published! 🍿", message: "Tap Share to send it" });
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

  // ── Auto-save WIP draft on every keystroke ──────────────────────────────────
  useEffect(() => {
    if (editMode !== "manual") return;
    saveDraft({ data: mf, password: pagePassword, completed: false });
  }, [mf, pagePassword, editMode]);

  const displayData = editMode === "manual" ? mf : content;

  const updateMf = useCallback((key: keyof LoveflixData, val: unknown) => setMf((p) => ({ ...p, [key]: val })), []);

  /**
   * DELIBERATE DIVERGENCE FROM THE REFERENCE HOOK — do not "fix" this back.
   *
   * `useCatchEditor.handleEditClick` does:
   *
   *     setMf(isPersonalized ? { ...content } : { ...DEMO_DATA });
   *
   * …and that second branch is a live bug. Combined with the keystroke autosave
   * effect above — which starts firing the instant `editMode` flips to "manual"
   * — it destroys a restored in-progress draft on the very first Create tap:
   * the sender refreshes, their half-written episode is restored into `mf`,
   * they tap Create, `mf` is replaced by DEMO_DATA, the effect writes that over
   * the draft, and the work is gone with no undo.
   *
   * There is nothing to re-seed anyway. `mf` is already correct in every state
   * this button can be pressed in:
   *   - cold load                → DEMO_DATA (set in useState)
   *   - after a refresh          → the restored draft
   *   - after a save or ?edit=id → the live content
   *
   * So opening the sheet only opens the sheet. It never writes to `mf`.
   */
  const handleEditClick = useCallback(() => {
    // The starter goes first, but only while there is a schema to fill from and
    // only until the sender has said no once. It writes into `mf` through the
    // same setter the sheet uses, so the "never re-seed" rule above still holds.
    if (fill.schema && fill.mode !== "manual") {
      setStoryStarter(true);
      return;
    }
    setEditMode("manual");
  }, [fill.schema, fill.mode]);

  /** The starter's only exit — into the same sheet Create would have opened. */
  const openManualForm = useCallback(() => setEditMode("manual"), []);

  /**
   * Same reasoning as above. The reference re-seeds `mf` from `content` here,
   * which is lossy in one direction that matters: `content` is the *cleaned*
   * copy, so re-seeding silently deletes the blank row or unwritten scene the
   * sender had just added and was on their way back to fill in. `mf` is always
   * the authoring superset of `content`, so leaving it alone is strictly safer.
   */
  const handleEditFromPreview = useCallback(() => {
    setEditMode("manual");
  }, []);

  // Save (locally) & jump to preview.
  const handleSave = useCallback(() => {
    const missing = missingFields(mf);
    if (missing.length) {
      pushToast({ type: "info", title: "Almost there", message: `Still needs ${missing.join(", ")}` });
      return;
    }
    const cleaned = cleanData(mf);
    setContent(cleaned);
    setIsPersonalized(true);
    setEditMode("preview");
    bumpPreview(); // fresh run: back to the profile picker with the new show
    saveDraft({ data: mf, password: pagePassword, completed: true });
    track(EVENTS.PAGE_SAVED, {
      template: TEMPLATE,
      has_password: Boolean(pagePassword),
      episodes: cleaned.episodes.length,
      has_letter: Boolean(cleaned.letter),
    });
    pushToast({ type: "success", title: "Saved!", message: "Watch it once, then publish" });
  }, [mf, pagePassword, pushToast, bumpPreview]);

  const create = useCallback(async (): Promise<string | null> => {
    const res = await fetch(BASE, { method: "POST", headers: headers(), body: JSON.stringify(loveflixDataToBody(content, pagePassword)) });
    const result = await res.json();
    if (!result.success) return null;
    setPageId(result.data._id);
    return result.data._id as string;
  }, [content, pagePassword, headers]);

  const update = useCallback(async (id: string) => {
    await fetch(`${BASE}/${id}`, { method: "PUT", headers: headers(), body: JSON.stringify(loveflixDataToBody(content, pagePassword)) });
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
  // `loveflixDataToBody`, the one description of this template's wire shape.
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
        body: loveflixDataToBody(d, pagePassword),
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
    track(EVENTS.PUBLISH_CLICKED, { template: TEMPLATE, is_authenticated: isAuthenticated });

    if (!isPublishable(content)) {
      track(EVENTS.PUBLISH_FAILED, { template: TEMPLATE, reason: "content_incomplete" });
      pushToast({
        type: "info",
        title: "Finish the show first",
        message: `Still needs ${missingFields(content).join(", ")}`,
      });
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
        { slug: TEMPLATE, templateType: "loveflix", pageId: id, templateTitle: "LoveFlix" },
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
        pushToast({ type: "publish", title: "Published! 🍿", message: "Tap Share to send it" });
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
      title: "I made you something to watch 🍿",
      accent: "#E62E5C",
      slug: "loveflix",
    });
  }, [shareUrl, pagePassword]);

  const goBack = useCallback(() => router.push("/templates"), [router]);

  const shareId = shareUrl ? shareUrl.split("/").pop() ?? null : null;

  return {
    content, mf, displayData, editMode, pagePassword, pageId, shareUrl, shareId,
    isPersonalized, showAuth, saving, publishing, copied, previewVersion,

    fill, storyStarter, openManualForm,

    setEditMode, setPagePassword, updateMf,
    handleEditClick, handleEditFromPreview, handleSave,
    create, update, publish,
    closeAuth, closeAuthSuccess, handleCopy, handleShare, goBack,
    pushToast, showPublish: isPersonalized && !shareUrl && !publishing,
    showShare: !!shareUrl,
    shareLabel: copied ? "Copied!" : "Share",
  };
}
