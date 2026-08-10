"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { useStoryFill } from "@/hooks/useStoryFill";
import { API_URL, IS_NGROK } from "@/lib/config";
import { EVENTS } from "@/lib/analytics/events";
import { track } from "@/lib/analytics/track";
import {
  DEMO_DATA,
  PLAYER,
  dbToLoveflixData,
  loveflixDataToBody,
  validateSceneGraph,
  type Credit,
  type EditMode,
  type LoveflixData,
  type Row,
  type RowItem,
  type Scene,
  type Toast,
} from "../components/types";
import { openShareSheet } from "@/lib/share/shareBus";

const DRAFT_KEY = "loveflix_draft";
const BASE = `${API_URL}/loveflix-pages`;

/** Slug reported on every analytics event from this editor. */
const TEMPLATE = "loveflix";

/* ── Authoring clamps ──────────────────────────────────────────────────────────
   These mirror the ceilings the wire coercer in `types.ts` already enforces.
   They live here so the form can stop the sender BEFORE they write something the
   wire layer would silently throw away — a row 7 that vanishes on publish with
   no explanation is the worst kind of bug. ─────────────────────────────────── */
export const MAX_ROWS = 6;
export const MAX_ITEMS_PER_ROW = 12;
export const MAX_SCENES = 24;
export const MAX_CREDITS = 12;
export const MAX_CHOICES = 2;
export const MIN_CHOICE_SECONDS = 4;
export const MAX_CHOICE_SECONDS = 60;
export const MIN_MATCH_PERCENT = 1;
export const MAX_MATCH_PERCENT = 100;
export const MIN_PROGRESS = 0;
export const MAX_PROGRESS = 100;

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
const readDraft = (): { data?: LoveflixData; password?: string; completed?: boolean } | null => {
  try {
    const raw = draftStore()?.getItem(DRAFT_KEY) ?? window.sessionStorage.getItem(DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
};

/* ── Cleaning ──────────────────────────────────────────────────────────────────
   A work-in-progress draft legitimately contains half-typed rows, blank items
   and scenes with nothing written on them yet. Those are fine to author with and
   never fine to publish, so everything is trimmed and pruned once, on Save, on
   the way from `mf` into `content`. `mf` itself is left untouched — the sender
   goes back into the sheet and finds their blanks exactly where they left them.
─────────────────────────────────────────────────────────────────────────────*/

const clampInt = (raw: unknown, lo: number, hi: number, fallback: number): number => {
  const n = typeof raw === "number" ? raw : Number(raw);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(hi, Math.max(lo, Math.round(n)));
};

const cleanRows = (rows: Row[]): Row[] =>
  (Array.isArray(rows) ? rows : [])
    .map((r) => ({
      title: (r?.title ?? "").trim(),
      kind: r?.kind === "top10" ? ("top10" as const) : ("cards" as const),
      items: (Array.isArray(r?.items) ? r.items : [])
        .filter((it) => (it?.title ?? "").trim().length > 0)
        .map<RowItem>((it) => ({
          title: it.title.trim(),
          imageUrl: (it.imageUrl ?? "").trim(),
          caption: (it.caption ?? "").trim(),
          runtime: (it.runtime ?? "").trim(),
          progress: clampInt(it.progress, MIN_PROGRESS, MAX_PROGRESS, 0),
        }))
        .slice(0, MAX_ITEMS_PER_ROW),
    }))
    .filter((r) => r.title.length > 0 && r.items.length > 0)
    .slice(0, MAX_ROWS);

const cleanScenes = (scenes: Scene[]): Scene[] =>
  (Array.isArray(scenes) ? scenes : [])
    .filter((s) => (s?.id ?? "").trim().length > 0)
    .map<Scene>((s) => {
      const isFinale = s.isFinale === true;
      return {
        id: s.id.trim(),
        imageUrl: (s.imageUrl ?? "").trim(),
        text: (s.text ?? "").replace(/[ \t]+$/gm, "").trim(),
        choices: isFinale
          ? []
          : (Array.isArray(s.choices) ? s.choices : [])
              .slice(0, MAX_CHOICES)
              .map((c) => ({ label: (c?.label ?? "").trim(), nextSceneId: (c?.nextSceneId ?? "").trim() })),
        choiceSeconds: clampInt(s.choiceSeconds, MIN_CHOICE_SECONDS, MAX_CHOICE_SECONDS, PLAYER.defaultChoiceSeconds),
        defaultChoiceIndex: clampInt(s.defaultChoiceIndex, 0, MAX_CHOICES - 1, 0),
        isFinale,
      };
    })
    .slice(0, MAX_SCENES);

const cleanCredits = (credits: Credit[]): Credit[] =>
  (Array.isArray(credits) ? credits : [])
    .map<Credit>((c) => ({ role: (c?.role ?? "").trim(), name: (c?.name ?? "").trim() }))
    .filter((c) => c.role.length > 0)
    .slice(0, MAX_CREDITS);

const cleanData = (d: LoveflixData): LoveflixData => {
  const scenes = cleanScenes(d.scenes);
  return {
    senderName: d.senderName.trim() || DEMO_DATA.senderName,
    senderPhotoUrl: d.senderPhotoUrl.trim(),
    recipientName: d.recipientName.trim(),
    recipientPhotoUrl: d.recipientPhotoUrl.trim(),
    showTitle: d.showTitle.trim(),
    tagline: d.tagline.trim(),
    heroImageUrl: d.heroImageUrl.trim(),
    matchPercent: clampInt(d.matchPercent, MIN_MATCH_PERCENT, MAX_MATCH_PERCENT, 99),
    rating: d.rating.trim(),
    seasons: d.seasons.trim(),
    metYear: d.metYear.trim(),
    rows: cleanRows(d.rows),
    scenes,
    // If the chosen start scene did not survive cleaning, fall back to the first
    // one that did rather than shipping a graph that cannot even begin.
    startSceneId: scenes.some((s) => s.id === d.startSceneId.trim())
      ? d.startSceneId.trim()
      : scenes[0]?.id ?? "",
    finaleText: d.finaleText.trim(),
    finaleQuestion: d.finaleQuestion.trim(),
    credits: cleanCredits(d.credits),
  };
};

/** True once the data carries enough to be worth publishing. */
export const isPublishable = (d: LoveflixData): boolean =>
  d.recipientName.trim().length > 0 &&
  d.showTitle.trim().length > 0 &&
  cleanRows(d.rows).length > 0 &&
  validateSceneGraph(cleanScenes(d.scenes), d.startSceneId).ok;

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
  // The billing copy and `rows[0]` only. `scenes[]` is a branching graph that
  // `validateSceneGraph` checks at load — exactly two choices per non-finale,
  // every nextSceneId resolving, no cycles — and it is deliberately NOT on the
  // schema, so no patch from here can reach it.
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
  const [copied, setCopied] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastIdRef = useRef(0);

  // Holds the draft when the user hits Publish while logged out → auto-resumes after login.
  const pendingPublishRef = useRef<{ data: LoveflixData; password: string } | null>(null);

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
    if (draft?.data && Array.isArray(draft.data.rows) && Array.isArray(draft.data.scenes)) {
      // Restored verbatim, NOT through dbToLoveflixData: a work-in-progress draft
      // legitimately contains blank rows and unwritten scenes, and the wire
      // coercer strips those. They only get cleaned on Save.
      const d = draft.data;
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

        const pubRes = await fetch(`${BASE}/${savedId}/publish`, { method: "POST", headers: headers() });
        const pubResult = await pubRes.json();
        if (pubResult.success) {
          // The share URL is authored by the server — never assembled here.
          setShareUrl(String(pubResult.data.shareUrl));
          await fill.persistStory();
          clearDraft();
          track(EVENTS.PUBLISH_SUCCESS, { template: TEMPLATE, source: "auth_deferred" });
          pushToast({ type: "publish", title: "Published! 🍿", message: "Their episode is live" });
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
    if (!mf.recipientName.trim()) {
      pushToast({ type: "info", title: "Who is this for?", message: "Add their name first" });
      return;
    }
    if (!mf.showTitle.trim()) {
      pushToast({ type: "info", title: "Give the show a title", message: "One or two words is plenty" });
      return;
    }

    const cleaned = cleanData(mf);

    if (cleaned.rows.length === 0) {
      pushToast({ type: "info", title: "The catalogue is empty", message: "Add one row with at least one card" });
      return;
    }

    // The validator is loud on purpose. A branch that dead-ends renders a blank
    // screen with no error, so the first real problem is named here rather than
    // discovered by the recipient.
    const report = validateSceneGraph(cleaned.scenes, cleaned.startSceneId);
    if (!report.ok) {
      pushToast({ type: "info", title: "The episode doesn't join up", message: report.errors[0] });
      return;
    }

    setContent(cleaned);
    setIsPersonalized(true);
    setEditMode("preview");
    bumpPreview(); // fresh run: back to the intro with the new show
    saveDraft({ data: mf, password: pagePassword, completed: true });
    track(EVENTS.PAGE_SAVED, {
      template: TEMPLATE,
      has_password: Boolean(pagePassword),
      rows: cleaned.rows.length,
      scenes: cleaned.scenes.length,
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

  const publish = useCallback(async () => {
    // Recorded before any validation or auth check so this measures *intent*.
    track(EVENTS.PUBLISH_CLICKED, { template: TEMPLATE, is_authenticated: isAuthenticated });

    if (!isPublishable(content)) {
      track(EVENTS.PUBLISH_FAILED, { template: TEMPLATE, reason: "content_incomplete" });
      const report = validateSceneGraph(content.scenes, content.startSceneId);
      pushToast({
        type: "info",
        title: "Finish the show first",
        message: report.ok ? "A name, a title and one row of cards" : report.errors[0],
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

      const pubRes = await fetch(`${BASE}/${id}/publish`, { method: "POST", headers: headers() });
      const pubResult = await pubRes.json();
      if (pubResult.success) {
        setShareUrl(String(pubResult.data.shareUrl));
        await fill.persistStory();
        clearDraft();
        track(EVENTS.PUBLISH_SUCCESS, { template: TEMPLATE, source: "direct" });
        pushToast({ type: "publish", title: "Published! 🍿", message: "Their episode is live" });
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
      title: "I made you something to watch 🍿",
      accent: "#f59e0b",
      slug: "loveflix",
    });
  }, [shareUrl]);

  const goBack = useCallback(() => router.push("/templates"), [router]);

  const shareId = shareUrl ? shareUrl.split("/").pop() ?? null : null;

  return {
    content, mf, displayData, editMode, pagePassword, pageId, shareUrl, shareId,
    isPersonalized, showAuth, saving, publishing, copied, toasts, previewVersion,

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
