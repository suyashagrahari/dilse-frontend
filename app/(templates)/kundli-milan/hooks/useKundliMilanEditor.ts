"use client";

// ─── The kundli-milan editor controller ──────────────────────────────────────
//
// One hook owns every piece of editor state; `page.tsx` is a thin renderer over
// it. Same state machine as `useApologyEditor` / `useLegalNoticeEditor` — the
// only differences are the draft key, the API namespace, the wire mappers and
// the validation, which is date-shaped here rather than text-shaped.

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { useStoryFill } from "@/hooks/useStoryFill";
import { API_URL, IS_NGROK } from "@/lib/config";
import { EVENTS } from "@/lib/analytics/events";
import { track } from "@/lib/analytics/track";
import { isPastDate } from "@/lib/wire";
import { type EditMode, type KootaName, type KundliData, type Person, DEMO_DATA, KOOTA_ORDER, dbToKundliMilanData, kundliMilanDataToBody } from "../components/types";
import { openShareSheet } from "@/lib/share/shareBus";
import { ensurePublishAllowed } from "@/lib/paywall/publishRequest";
import { useDraft } from "@/lib/draft/useDraft";
import { useToast } from "@/lib/toast/useToast";
import { persistDraft } from "@/lib/draft/persistDraft";

const DRAFT_KEY = "kundli-milan_draft";
const BASE = `${API_URL}/kundli-milan-pages`;
const TEMPLATE = "kundli-milan";

/** Remedies are rendered as a numbered upaya list; two is the minimum that reads as a list. */
export const MIN_REMEDIES = 2;
export const MAX_REMEDIES = 4;

// The draft survives a refresh or an accidental tab close. localStorage first,
// sessionStorage as the fallback — with `kundli-milan_unlocked_<shareId>` these
// are the only two browser keys this template owns.
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
const readDraft = (): { data?: KundliData; password?: string; completed?: boolean } | null => {
  try {
    const raw = draftStore()?.getItem(DRAFT_KEY) ?? window.sessionStorage.getItem(DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
};

/** Local `YYYY-MM-DD`. Only ever called from an event handler or an effect, never at module scope. */
const isoDay = (d: Date): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/**
 * The one field that can actually break the report. A blank or future date
 * would still render (the engine is total), but it would render a nonsense
 * chart, so it is stopped at the form instead.
 *
 * Shared with EditSheet so the inline error and the save guard can never
 * disagree about what counts as valid.
 */
export function dobError(p: Person): string {
  if (!p.dob.trim()) return "Date of birth is required";
  if (!isPastDate(p.dob)) return "Use a real date in the past";
  return "";
}

/** Time of birth is optional; the engine defaults a blank to noon and prints "time not stated". */
export function tobError(p: Person): string {
  if (!p.tob.trim()) return "";
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(p.tob) ? "" : "Use 24-hour HH:MM, or leave blank";
}

/** Drop blank overrides so the engine falls back to its own reading for that koota. */
function pruneReadings(src: Partial<Record<KootaName, string>>): Partial<Record<KootaName, string>> {
  const out: Partial<Record<KootaName, string>> = {};
  for (const k of KOOTA_ORDER) {
    const v = src[k];
    if (typeof v === "string" && v.trim()) out[k] = v.trim();
  }
  return out;
}

export function useKundliMilanEditor() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, accessToken } = useAppSelector((s) => s.auth);

  const [content, setContent] = useState<KundliData>(DEMO_DATA);
  const [mf, setMf] = useState<KundliData>({ ...DEMO_DATA });
  const [editMode, setEditMode] = useState<EditMode>(null);
  const [pagePassword, setPagePassword] = useState("");
  const [pageId, setPageId] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [isPersonalized, setIsPersonalized] = useState(false);

  // ── AI story fill ───────────────────────────────────────────────────────────
  // The prose of the report: the eight koota readings, the remedies, the
  // astrologer's name and the two birthplaces. Nothing that the ashtakoota
  // scoring is computed from is on the schema, so the maths is untouched.
  // `customReadings` starts as `{}` — the koota keys are created on write, by
  // design; the object is deliberately not pre-seeded.
  const fill = useStoryFill<KundliData>({
    slug: "kundli-milan",
    demo: DEMO_DATA,
    current: mf,
    onFilled: setMf,
  });

  // Mounted the first time Create is tapped. The starter renders nothing at all
  // when this template has no schema.
  const [storyStarter, setStoryStarter] = useState(false);

  // Bumped whenever a new report should be shown. The template is keyed on it so
  // the computation sequence replays from the top — that reveal is the best part
  // of the template and must not be cached away.
  const [previewVersion, setPreviewVersion] = useState(0);
  const bumpPreview = useCallback(() => setPreviewVersion((v) => v + 1), []);

  const [showAuth, setShowAuth] = useState(false);
  const saving = false; // save-to-preview is local and synchronous
  const [publishing, setPublishing] = useState(false);
  const { pushToast } = useToast();
  const [copied, setCopied] = useState(false);

  // Holds the payload when Publish is pressed while logged out → auto-resumed
  // by the effect on [isAuthenticated, accessToken] once auth lands.
  const pendingPublishRef = useRef<{ data: KundliData; password: string } | null>(null);
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



  // ── Load an existing page (?edit=<id>) or restore a local draft ────────────
  useEffect(() => {
    const id = searchParams.get("edit") || searchParams.get("id");
    if (id && isAuthenticated && accessToken) {
      fetch(`${BASE}/${id}`, { headers: headers() })
        .then((r) => r.json())
        .then((result) => {
          if (result.success && result.data) {
            const d = dbToKundliMilanData(result.data);
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

    const draft = readDraft();
    if (draft?.data) {
      const d: KundliData = { ...DEMO_DATA, ...draft.data };
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

  // ── Auto-resume publish after successful auth ──────────────────────────────
  useEffect(() => {
    if (!isAuthenticated || !accessToken || !pendingPublishRef.current) return;
    const { data, password } = pendingPublishRef.current;
    pendingPublishRef.current = null;
    // We own the row from here; adoption stands down (see useDraft).
    publishInFlightRef.current = true;

    setPublishing(true);
    setEditMode("preview");
    bumpPreview();
    (async () => {
      try {
        const res = await fetch(BASE, { method: "POST", headers: headers(), body: JSON.stringify(kundliMilanDataToBody(data, password)) });
        const result = await res.json();
        if (!result.success) throw new Error("Save failed");
        const savedId = result.data._id as string;
        setPageId(savedId);
        setContent(data);
        setIsPersonalized(true);

        // Clear the paywall BEFORE publishing, so nothing spins behind the sheet,
        // and the publish request is only made when it will succeed.
        const gate = await ensurePublishAllowed(
          { slug: TEMPLATE, templateType: "kundli-milan", pageId: savedId, templateTitle: "Kundli Milan Report" },
          setPublishing,
        );
        if (gate === "cancelled") return;

        const pubRes = await fetch(`${BASE}/${savedId}/publish`, { method: "POST", headers: headers() });
        const pubResult = await pubRes.json();
        if (pubResult.success) {
          // The share URL is the server's to mint — never assembled here.
          setShareUrl(String(pubResult.data.shareUrl));
          await fill.persistStory();
          clearDraft();
          track(EVENTS.PUBLISH_SUCCESS, { template: TEMPLATE, source: "auth_deferred" });
          pushToast({ type: "publish", title: "Report filed 🔮", message: "Tap Share to send it" });
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

  // ── Autosave the WIP draft on every keystroke ──────────────────────────────
  useEffect(() => {
    if (editMode !== "manual") return;
    saveDraft({ data: mf, password: pagePassword, completed: false });
  }, [mf, pagePassword, editMode]);

  const displayData = editMode === "manual" ? mf : content;

  const updateMf = useCallback(
    (key: keyof KundliData, val: unknown) => setMf((p) => ({ ...p, [key]: val })),
    [],
  );

  /**
   * The preview's theme dock. Re-themes what they are looking at and, once the
   * page is theirs, what will be published — the form's picker writes the same
   * field, so the two can never disagree.
   */
  const setTheme = useCallback(
    (id: string) => {
      setContent((p) => {
        const next = { ...p, theme: id };
        if (isPersonalized) saveDraft({ data: next, password: pagePassword, completed: true });
        return next;
      });
      setMf((p) => ({ ...p, theme: id }));
    },
    [isPersonalized, pagePassword],
  );

  const handleEditClick = useCallback(() => {
    // A fresh form starts blank rather than pre-filled with the demo couple:
    // seeing "Rohan Mehta" in your own report is worse than an empty field.
    setMf(
      isPersonalized
        ? { ...content }
        : {
            ...DEMO_DATA,
            groom: { name: "", dob: "", tob: "", pob: "" },
            bride: { name: "", dob: "", tob: "", pob: "" },
            issuedOn: isoDay(new Date()),
            customReadings: {},
            // Their own photos, GIFs and letter — never the demo couple's.
            photos: [],
            gifs: [],
            letter: "",
            // …but the vibe they were just previewing carries over.
            theme: content.theme,
          },
    );
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

  const handleSave = useCallback(() => {
    if (!mf.groom.name.trim() || !mf.bride.name.trim()) {
      pushToast({ type: "info", title: "Both names are needed", message: "Yours and your person's" });
      return;
    }
    const gErr = dobError(mf.groom);
    if (gErr) { pushToast({ type: "info", title: "Your date of birth", message: gErr }); return; }
    const bErr = dobError(mf.bride);
    if (bErr) { pushToast({ type: "info", title: "Their date of birth", message: bErr }); return; }
    if (tobError(mf.groom) || tobError(mf.bride)) {
      pushToast({ type: "info", title: "Check the time of birth", message: "24-hour HH:MM, or leave it blank" });
      return;
    }

    const remedies = mf.remedies.map((r) => r.trim()).filter(Boolean).slice(0, MAX_REMEDIES);
    if (remedies.length < MIN_REMEDIES) {
      pushToast({ type: "info", title: `Add at least ${MIN_REMEDIES} remedies`, message: "The upaya list is half the joke" });
      return;
    }

    const clean: KundliData = {
      ...mf,
      remedies,
      customReadings: pruneReadings(mf.customReadings),
      astrologerName: mf.astrologerName.trim() || DEMO_DATA.astrologerName,
      issuedOn: mf.issuedOn || isoDay(new Date()),
    };

    setContent(clean);
    setMf(clean);
    setIsPersonalized(true);
    setEditMode("preview");
    bumpPreview();
    saveDraft({ data: clean, password: pagePassword, completed: true });
    track(EVENTS.PAGE_SAVED, { template: TEMPLATE, has_password: Boolean(pagePassword) });
    pushToast({ type: "success", title: "Kundlis submitted", message: "Watch the milan, then publish 🔮" });
  }, [mf, pagePassword, pushToast, bumpPreview]);

  const create = useCallback(async (): Promise<string | null> => {
    const res = await fetch(BASE, { method: "POST", headers: headers(), body: JSON.stringify(kundliMilanDataToBody(content, pagePassword)) });
    const result = await res.json();
    if (!result.success) return null;
    setPageId(result.data._id);
    return result.data._id as string;
  }, [content, pagePassword, headers]);

  const update = useCallback(async (id: string) => {
    await fetch(`${BASE}/${id}`, { method: "PUT", headers: headers(), body: JSON.stringify(kundliMilanDataToBody(content, pagePassword)) });
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
  // `kundliMilanDataToBody`, the one description of this template's wire shape.
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
        body: kundliMilanDataToBody(d, pagePassword),
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
    // Recorded before any validation or auth check so this measures intent.
    track(EVENTS.PUBLISH_CLICKED, { template: TEMPLATE, is_authenticated: isAuthenticated });

    if (dobError(content.groom) || dobError(content.bride)) {
      track(EVENTS.PUBLISH_FAILED, { template: TEMPLATE, reason: "invalid_dob" });
      pushToast({ type: "info", title: "Both birth dates are needed", message: "No dates, no milan" });
      setMf({ ...content });
      setEditMode("manual");
      return;
    }

    // AUTH-DEFERRED, never auth-gated: anyone may fill the form; login is asked
    // for only here, and the effect above resumes this publish once it lands.
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
        { slug: TEMPLATE, templateType: "kundli-milan", pageId: id, templateTitle: "Kundli Milan Report" },
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
        pushToast({ type: "publish", title: "Report filed 🔮", message: "Tap Share to send it" });
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
      title: "Your kundlis have been matched 🔮",
      accent: "#b45309",
      slug: "kundli-milan",
    });
  }, [shareUrl, pagePassword]);

  const goBack = useCallback(() => router.push("/templates"), [router]);

  const shareId = shareUrl ? shareUrl.split("/").pop() ?? null : null;

  return {
    content, mf, displayData, editMode, pagePassword, pageId, shareUrl, shareId,
    isPersonalized, showAuth, saving, publishing, copied, previewVersion,

    fill, storyStarter, openManualForm,

    setEditMode, setPagePassword, updateMf, setTheme,
    handleEditClick, handleEditFromPreview, handleSave,
    create, update, publish,
    closeAuth, closeAuthSuccess, handleCopy, handleShare, goBack,
    pushToast, showPublish: isPersonalized && !shareUrl && !publishing,
    showShare: !!shareUrl,
    shareLabel: copied ? "Copied!" : "Share",
  };
}
