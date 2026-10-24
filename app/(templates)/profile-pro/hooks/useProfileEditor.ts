"use client";

// ─── Endorsements — the editor controller ────────────────────────────────────
//
// The house state machine, unchanged: one hook owns everything, `page.tsx` is a
// thin renderer, and three booleans (`isPersonalized`, `shareUrl`, `publishing`)
// drive the polymorphic top-bar button.
//
// Three things here are worth reading before editing:
//
//   1. PUBLISH IS AUTH-DEFERRED, NOT AUTH-GATED. Anyone may open the editor and
//      write a whole profile. Login is asked for at the Publish click, the
//      payload is stashed in a ref, and the effect below resumes the publish by
//      itself once auth lands. `persistStory()` runs in BOTH paths — the one
//      that published directly and the one that resumed — because that is what
//      makes this sender's NEXT template pre-fill itself.
//
//   2. THE AI SCHEMA RETURNS FLAT LISTS FOR TWO FIELDS. `FieldKind` has no
//      array-of-objects member, so `skills` and `certifications` come back as
//      string[]. `applyFilled` below maps them onto the real shapes, and for
//      skills it PRESERVES existing ids and endorsement counts by label — a
//      second run of the fill must never wipe what friends already contributed.
//
//   3. `person.connections` is never parsed. "1 connection" is the demo value.

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { API_URL, IS_NGROK } from "@/lib/config";
import { EVENTS } from "@/lib/analytics/events";
import { track } from "@/lib/analytics/track";
import { useStoryFill } from "@/hooks/useStoryFill";
import DEMO_PROFILE from "../components/demo";
import type {
  EditMode,
  ProfileProData,
  ProfileSkill,
  ProfileCertification,
  ProfileLanguage,
} from "../components/types";
import { dbToProfileData, missingForSave, profileDataToBody, restoreDraft, tidyProfile } from "../components/data";
import { openShareSheet } from "@/lib/share/shareBus";
import { ensurePublishAllowed } from "@/lib/paywall/publishRequest";
import { useDraft } from "@/lib/draft/useDraft";
import { useToast } from "@/lib/toast/useToast";
import { persistDraft } from "@/lib/draft/persistDraft";
import { goBackFromTemplate } from "@/lib/backNav";

/** Slug reported on every analytics event from this editor. */
const TEMPLATE = "profile-pro";

const DRAFT_KEY = "profile_pro_draft";
const BASE = `${API_URL}/profile-pro-pages`;

export type { EditMode };

export interface Toast {
  id: number;
  type: "success" | "info" | "publish";
  title: string;
  message?: string;
}

/* ── Wire mapping ──────────────────────────────────────────────────────────── */

// The one description of the wire shape lives in components/data.ts. Re-exported
// here because the published viewer imports `dbToProfileData` from this file.
export { profileDataToBody, dbToProfileData };

/* ── Draft ─────────────────────────────────────────────────────────────────── */

const draftStore = (): Storage | null => {
  try { return window.localStorage; } catch { try { return window.sessionStorage; } catch { return null; } }
};
const saveDraft = (payload: unknown) => { try { draftStore()?.setItem(DRAFT_KEY, JSON.stringify(payload)); } catch {} };
const clearDraft = () => {
  try { window.localStorage.removeItem(DRAFT_KEY); } catch {}
  try { window.sessionStorage.removeItem(DRAFT_KEY); } catch {}
};
const readDraft = (): { data?: ProfileProData; password?: string; completed?: boolean } | null => {
  try {
    const raw = draftStore()?.getItem(DRAFT_KEY) ?? window.sessionStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { data?: unknown; password?: string; completed?: boolean };
    // Drafts saved before photos / posts / the letter existed get those from the demo.
    const data = restoreDraft(parsed.data) ?? undefined;
    return { data, password: parsed.password, completed: parsed.completed };
  } catch { return null; }
};

/** "…\n\nBest, Aarav" → "…" — the reveal prints its own signature. */
function stripSignOff(letter: string, sender: string): string {
  const paras = letter.trim().split(/\n{2,}/);
  const last = paras[paras.length - 1]?.trim() ?? "";
  const signOff = /^(best|love|yours|with love|regards|warmly|forever|always|xoxo|lots of love)\b[^\n]{0,30}$/i.test(last)
    || (sender && last.length <= sender.length + 12 && last.toLowerCase().includes(sender.toLowerCase()));
  return signOff && paras.length > 1 ? paras.slice(0, -1).join("\n\n") : letter;
}

const DEMO_REC_IDS = new Set(DEMO_PROFILE.recommendations.map((r) => r.id));
const DEMO_SKILL_IDS = new Set(DEMO_PROFILE.skills.map((s) => s.id));
const isDemoSkill = (s: ProfileSkill) => DEMO_SKILL_IDS.has(s.id);

const slugifySkill = (label: string, i: number): string =>
  `skill-${i}-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;

export function useProfileEditor() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, accessToken } = useAppSelector((s) => s.auth);

  const [content, setContent] = useState<ProfileProData>(DEMO_PROFILE);
  const [mf, setMf] = useState<ProfileProData>({ ...DEMO_PROFILE });
  const [editMode, setEditMode] = useState<EditMode>(null);
  const [pagePassword, setPagePassword] = useState("");
  const [pageId, setPageId] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [contribToken, setContribToken] = useState<string | null>(null);
  const [isPersonalized, setIsPersonalized] = useState(false);
  const [previewVersion, setPreviewVersion] = useState(0);
  const bumpPreview = useCallback(() => setPreviewVersion((v) => v + 1), []);

  /**
   * Reshapes what the model returned into what the page renders.
   *
   * See note 2 in the file header. The skill mapping is keyed on the lowercased
   * label so a regenerated list that keeps "Being Right" keeps its 47 too.
   */
  const applyFilled = useCallback((filled: ProfileProData) => {
    setMf((prev) => {
      const next: ProfileProData = { ...prev, ...filled, person: { ...prev.person, ...(filled.person ?? {}) } };
      const sender = (next.senderName || "").trim();

      const rawSkills = filled.skills as unknown;
      if (Array.isArray(rawSkills) && rawSkills.some((s) => typeof s === "string")) {
        const byLabel = new Map(prev.skills.map((s) => [s.label.trim().toLowerCase(), s]));
        next.skills = (rawSkills as unknown[])
          .map((s, i) => {
            const label = typeof s === "string" ? s.trim() : "";
            const prior = byLabel.get(label.toLowerCase());
            // Counts and ids are earned. Only the label is the model's to change.
            if (prior && prior.endorsements > 0 && !isDemoSkill(prior)) return { ...prior, label };
            // A new skill starts with the one honest endorsement it has: the sender's.
            return {
              id: slugifySkill(label, i),
              label,
              endorsements: sender ? 1 : 0,
              topEndorsers: sender ? [sender] : [],
              isTop3: i < 3,
            } as ProfileSkill;
          })
          .filter((s) => s.label.length > 0);
      }

      const splitColon = (line: string): [string, string] => {
        const idx = line.indexOf(":");
        return idx === -1 ? [line.trim(), ""] : [line.slice(0, idx).trim(), line.slice(idx + 1).trim()];
      };

      const rawCerts = filled.certifications as unknown;
      if (Array.isArray(rawCerts) && rawCerts.some((c) => typeof c === "string")) {
        next.certifications = (rawCerts as unknown[])
          .map((c, i) => {
            const [name, issuer] = splitColon(typeof c === "string" ? c : "");
            return { name, issuer, date: prev.certifications?.[i]?.date || "No expiry" } as ProfileCertification;
          })
          .filter((c) => c.name.length > 0);
      }

      const rawLangs = filled.languages as unknown;
      if (Array.isArray(rawLangs) && rawLangs.some((c) => typeof c === "string")) {
        next.languages = (rawLangs as unknown[])
          .map((c) => {
            const [name, level] = splitColon(typeof c === "string" ? c : "");
            return { name, level } as ProfileLanguage;
          })
          .filter((c) => c.name.length > 0);
      }

      // Experience rows the model wrote bullets for keep their shape.
      // The model writes role / company / dates / bullets; the chapter's city
      // follows the person's so no demo city is left behind.
      const city = (next.person.location || "").split(",")[0].trim();
      next.experience = (next.experience ?? []).map((e) => ({
        ...e,
        bullets: Array.isArray(e.bullets) ? e.bullets : [],
        location: filled.experience && city ? city : e.location,
      }));

      // The page signs the letter itself; drop a sign-off the model added anyway.
      if (typeof filled.letter === "string") next.letter = stripSignOff(filled.letter, sender);

      // References are contributed by real people through the moderation queue.
      // The demo's are about the demo person — on a fresh page they go.
      next.recommendations = prev.recommendations.filter((r) => !DEMO_REC_IDS.has(r.id));

      return tidyProfile(next);
    });
  }, []);

  // ── AI story fill ──────────────────────────────────────────────────────────
  // Inert until the server has a schema for this slug: `schema` stays null,
  // StoryStarter renders nothing, and Create falls back to the plain form.
  const storyFill = useStoryFill<ProfileProData>({
    slug: "profile-pro",
    demo: DEMO_PROFILE,
    current: mf,
    onFilled: applyFilled,
  });
  const { schema: storySchema, setMode: setStoryMode, persistStory } = storyFill;
  const [storyStarted, setStoryStarted] = useState(false);

  const [showAuth, setShowAuth] = useState(false);
  const saving = false;
  const [publishing, setPublishing] = useState(false);
  const { pushToast } = useToast();
  const [copied, setCopied] = useState(false);

  const pendingPublishRef = useRef<{ data: ProfileProData; password: string } | null>(null);
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


  // ── Load existing page (?edit=<id>) or restore a completed draft ──
  useEffect(() => {
    const id = searchParams.get("edit") || searchParams.get("id");
    if (id && isAuthenticated && accessToken) {
      fetch(`${BASE}/${id}`, { headers: headers() })
        .then((r) => r.json())
        .then((result) => {
          if (result.success && result.data) {
            const d = dbToProfileData(result.data);
            setContent(d);
            setMf(d);
            setPageId(id);
            setIsPersonalized(true);
            setEditMode("preview");
            bumpPreview();
            if (typeof result.data.contribToken === "string") setContribToken(result.data.contribToken);
            if (result.data.isPublished && result.data.shareUrl) setShareUrl(String(result.data.shareUrl));
          }
        })
        .catch(() => {});
      return;
    }
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

  // ── Auto-resume publish after auth ──
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
        const res = await fetch(BASE, { method: "POST", headers: headers(), body: JSON.stringify(profileDataToBody(data, password)) });
        const result = await res.json();
        if (!result.success) throw new Error("Save failed");
        const savedId = result.data._id as string;
        setPageId(savedId);
        setContent(data);
        setIsPersonalized(true);

        // Clear the paywall BEFORE publishing, so nothing spins behind the sheet,
        // and the publish request is only made when it will succeed.
        const gate = await ensurePublishAllowed(
          { slug: TEMPLATE, templateType: "profile-pro", pageId: savedId, templateTitle: "Endorsements" },
          setPublishing,
        );
        if (gate === "cancelled") return;

        const pubRes = await fetch(`${BASE}/${savedId}/publish`, { method: "POST", headers: headers() });
        const pubResult = await pubRes.json();
        if (pubResult.success) {
          setShareUrl(String(pubResult.data.shareUrl));
          if (typeof pubResult.data.contribToken === "string") setContribToken(pubResult.data.contribToken);
          await persistStory();
          clearDraft();
          track(EVENTS.PUBLISH_SUCCESS, { template: TEMPLATE, source: "auth_resume" });
          pushToast({ type: "publish", title: "Published", message: "Tap Share to send it" });
        } else {
          pushToast({ type: "info", title: "Publish failed", message: "Saved — tap Publish to go live" });
        }
      } catch {
        pushToast({ type: "info", title: "Save failed", message: "Please try again" });
      } finally {
        publishInFlightRef.current = false;
        setPublishing(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, accessToken]);

  // ── Auto-save WIP draft while editing ──
  useEffect(() => {
    if (editMode !== "manual" && editMode !== "choose") return;
    saveDraft({ data: mf, password: pagePassword, completed: false });
  }, [mf, pagePassword, editMode]);

  const displayData = editMode === "manual" || editMode === "choose" ? mf : content;

  const updateMf = useCallback((key: keyof ProfileProData, val: unknown) => setMf((p) => ({ ...p, [key]: val })), []);

  /** Seeds the form exactly as opening it does, without opening it. */
  const seedManualForm = useCallback(() => {
    // A fresh page starts without the demo's references — they are about the
    // demo person, and real ones arrive from friends through the queue.
    setMf(isPersonalized ? { ...content } : { ...DEMO_PROFILE, recommendations: [] });
  }, [isPersonalized, content]);

  const handleEditClick = useCallback(() => {
    seedManualForm();
    setEditMode("manual");
  }, [seedManualForm]);

  /** Create. Falls back to the plain form when there is no schema. */
  const handleStartCreate = useCallback(() => {
    if (!storySchema) { handleEditClick(); return; }
    seedManualForm();
    setStoryMode("idle");
    setStoryStarted(true);
  }, [storySchema, handleEditClick, seedManualForm, setStoryMode]);

  /** StoryStarter's way out — the normal form, every field still hand-editable. */
  const handleStoryManual = useCallback(() => {
    setEditMode("manual");
  }, []);

  const handleEditFromPreview = useCallback(() => {
    setMf({ ...content });
    setEditMode("manual");
  }, [content]);

  const handleSave = useCallback(() => {
    const missing = missingForSave(mf);
    if (missing.length) { pushToast({ type: "info", title: `Still needed: ${missing.join(", ")}` }); return; }
    const cleaned = tidyProfile(mf);
    setContent(cleaned);
    setIsPersonalized(true);
    setEditMode("preview");
    bumpPreview();
    saveDraft({ data: mf, password: pagePassword, completed: true });
    track(EVENTS.PAGE_SAVED, { template: TEMPLATE, has_password: Boolean(pagePassword), photos: cleaned.photos.length });
    pushToast({ type: "success", title: "Saved 💙", message: "Read it back, then publish" });
  }, [mf, pagePassword, pushToast, bumpPreview]);

  const create = useCallback(async (): Promise<string | null> => {
    const res = await fetch(BASE, { method: "POST", headers: headers(), body: JSON.stringify(profileDataToBody(content, pagePassword)) });
    const result = await res.json();
    if (!result.success) return null;
    setPageId(result.data._id);
    if (typeof result.data.contribToken === "string") setContribToken(result.data.contribToken);
    return result.data._id as string;
  }, [content, pagePassword, headers]);

  const update = useCallback(async (id: string) => {
    await fetch(`${BASE}/${id}`, { method: "PUT", headers: headers(), body: JSON.stringify(profileDataToBody(content, pagePassword)) });
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
  // `profileDataToBody`, the one description of this template's wire shape.
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
        body: profileDataToBody(d, pagePassword),
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
    track(EVENTS.PUBLISH_CLICKED, { template: TEMPLATE, is_authenticated: isAuthenticated });
    if (missingForSave(content).length) {
      track(EVENTS.PUBLISH_FAILED, { template: TEMPLATE, reason: "missing_fields" });
      pushToast({ type: "info", title: "Almost there", message: `Still needed: ${missingForSave(content).join(", ")}` });
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
      let id = pageId;
      if (!id) id = await create();
      else await update(id);
      if (!id) throw new Error("Save failed");

      // Clear the paywall BEFORE publishing, so nothing spins behind the sheet,
      // and the publish request is only made when it will succeed.
      const gate = await ensurePublishAllowed(
        { slug: TEMPLATE, templateType: "profile-pro", pageId: id, templateTitle: "Endorsements" },
        setPublishing,
      );
      if (gate === "cancelled") return;

      const pubRes = await fetch(`${BASE}/${id}/publish`, { method: "POST", headers: headers() });
      const pubResult = await pubRes.json();
      if (pubResult.success) {
        setShareUrl(String(pubResult.data.shareUrl));
        if (typeof pubResult.data.contribToken === "string") setContribToken(pubResult.data.contribToken);
        await persistStory();
        clearDraft();
        track(EVENTS.PUBLISH_SUCCESS, { template: TEMPLATE, source: "direct" });
        pushToast({ type: "publish", title: "Published", message: "Tap Share to send it" });
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
      if (!url) pushToast({ type: "success", title: "Link copied" });
    }
  }, [shareUrl, pushToast]);

  const handleShare = useCallback(() => {
    if (!shareUrl) return;
    const text = `${content.person.name || "You"}, you have a new message 💼💙`;
    openShareSheet({
      url: shareUrl,
      password: pagePassword,
      title: "You've been endorsed 💼💙",
      text,
      accent: "#0A66C2",
      senderName: content.senderName,
      slug: "profile-pro",
    });
  }, [shareUrl, content.person.name, content.senderName, pagePassword]);

  /**
   * The friends' link — a DIFFERENT secret from `shareUrl`.
   *
   * `shareUrl` is the read link for the person the page is about.
   * `contribToken` is the write link for the group chat. Sending the wrong one
   * hands the recipient's gift to everybody being asked to endorse it.
   */
  const endorseUrl = contribToken && typeof window !== "undefined"
    ? `${window.location.origin}/profile-pro/endorse/${contribToken}`
    : null;
  const recommendUrl = contribToken && typeof window !== "undefined"
    ? `${window.location.origin}/profile-pro/recommend/${contribToken}`
    : null;

  /** The nudge. It is the difference between 4 contributions and 15. */
  const handleNudge = useCallback(() => {
    if (!endorseUrl) return;
    const name = content.person.name || "her";
    const text = `endorse ${name}. one tap, no signup: ${endorseUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  }, [endorseUrl, content.person.name]);

  const goBack = useCallback(() => goBackFromTemplate(router), [router]);

  const shareId = shareUrl ? shareUrl.split("/").pop() ?? null : null;

  return {
    content, mf, displayData, editMode, pagePassword, pageId, shareUrl, shareId,
    contribToken, endorseUrl, recommendUrl,
    isPersonalized, showAuth, saving, publishing, copied, previewVersion,

    setEditMode, setPagePassword, updateMf, setMf,
    storyFill, storyStarted, handleStartCreate, handleStoryManual,
    handleEditClick, handleEditFromPreview, handleSave,
    create, update, publish,
    closeAuth, closeAuthSuccess, handleCopy, handleShare, handleNudge, goBack,
    pushToast, showPublish: isPersonalized && !shareUrl && !publishing,
    showShare: !!shareUrl,
    shareLabel: copied ? "Copied" : "Share",
  };
}
