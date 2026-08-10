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
  ProfileProData,
  ProfileSkill,
  ProfileCertification,
} from "../components/types";
import { openShareSheet } from "@/lib/share/shareBus";

/** Slug reported on every analytics event from this editor. */
const TEMPLATE = "profile-pro";

const DRAFT_KEY = "profile_pro_draft";
const BASE = `${API_URL}/profile-pro-pages`;

export type EditMode = null | "choose" | "manual" | "preview";

export interface Toast {
  id: number;
  type: "success" | "info" | "publish";
  title: string;
  message?: string;
  shareUrl?: string;
}

/* ── Wire mapping ──────────────────────────────────────────────────────────── */

/** Everything the server accepts. `contribToken` and the secrets are its business. */
export function profileDataToBody(data: ProfileProData, password?: string): Record<string, unknown> {
  return {
    person: data.person,
    about: data.about,
    experience: data.experience,
    education: data.education,
    skills: data.skills,
    recommendations: data.recommendations,
    certifications: data.certifications ?? [],
    contributorPrompt: data.contributorPrompt,
    ...(password ? { password } : {}),
  };
}

const arr = <T,>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);

export function dbToProfileData(db: Record<string, unknown> | null | undefined): ProfileProData {
  const d = (db ?? {}) as Record<string, unknown>;
  const person = (d.person ?? {}) as ProfileProData["person"];
  return {
    person: {
      name: person.name ?? "",
      headline: person.headline ?? "",
      location: person.location ?? "",
      photoUrl: person.photoUrl ?? "",
      bannerUrl: person.bannerUrl ?? "",
      // String all the way through. Never Number().
      connections: person.connections ?? "",
      degreeNote: person.degreeNote ?? "",
      openTo: person.openTo ?? "",
    },
    about: arr<string>(d.about),
    experience: arr<ProfileProData["experience"][number]>(d.experience),
    education: arr<ProfileProData["education"][number]>(d.education),
    skills: arr<ProfileSkill>(d.skills),
    recommendations: arr<ProfileProData["recommendations"][number]>(d.recommendations),
    certifications: arr<ProfileCertification>(d.certifications),
    contributorPrompt: typeof d.contributorPrompt === "string" ? d.contributorPrompt : "",
  };
}

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
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
};

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
      const next: ProfileProData = { ...prev, ...filled };

      const rawSkills = filled.skills as unknown;
      if (Array.isArray(rawSkills) && rawSkills.some((s) => typeof s === "string")) {
        const byLabel = new Map(prev.skills.map((s) => [s.label.trim().toLowerCase(), s]));
        next.skills = (rawSkills as unknown[])
          .map((s, i) => {
            const label = typeof s === "string" ? s.trim() : "";
            const prior = byLabel.get(label.toLowerCase());
            // Counts and ids are earned. Only the label is the model's to change.
            if (prior) return { ...prior, label };
            return {
              id: slugifySkill(label, i),
              label,
              endorsements: 0,
              topEndorsers: [],
              isTop3: i < 3,
            } as ProfileSkill;
          })
          .filter((s) => s.label.length > 0);
      }

      const rawCerts = filled.certifications as unknown;
      if (Array.isArray(rawCerts) && rawCerts.some((c) => typeof c === "string")) {
        next.certifications = (rawCerts as unknown[])
          .map((c) => {
            const line = typeof c === "string" ? c.trim() : "";
            const idx = line.indexOf(":");
            if (idx === -1) return { name: line, issuer: "", date: "" } as ProfileCertification;
            return {
              name: line.slice(0, idx).trim(),
              issuer: line.slice(idx + 1).trim(),
              date: "",
            } as ProfileCertification;
          })
          .filter((c) => c.name.length > 0);
      }

      // References are contributed by real people through the moderation queue.
      // Whatever the model did or did not say about them, they are not its call.
      next.recommendations = prev.recommendations;

      return next;
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
  const [copied, setCopied] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastIdRef = useRef(0);

  const pendingPublishRef = useRef<{ data: ProfileProData; password: string } | null>(null);

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

        const pubRes = await fetch(`${BASE}/${savedId}/publish`, { method: "POST", headers: headers() });
        const pubResult = await pubRes.json();
        if (pubResult.success) {
          setShareUrl(String(pubResult.data.shareUrl));
          if (typeof pubResult.data.contribToken === "string") setContribToken(pubResult.data.contribToken);
          await persistStory();
          clearDraft();
          track(EVENTS.PUBLISH_SUCCESS, { template: TEMPLATE, source: "auth_resume" });
          pushToast({ type: "publish", title: "Published", message: "The profile is live" });
        } else {
          pushToast({ type: "info", title: "Publish failed", message: "Saved — tap Publish to go live" });
        }
      } catch {
        pushToast({ type: "info", title: "Save failed", message: "Please try again" });
      } finally {
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
    setMf(isPersonalized ? { ...content } : { ...DEMO_PROFILE });
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
    if (!mf.person.name.trim()) { pushToast({ type: "info", title: "Add their name first" }); return; }
    setContent(mf);
    setIsPersonalized(true);
    setEditMode("preview");
    bumpPreview();
    saveDraft({ data: mf, password: pagePassword, completed: true });
    pushToast({ type: "success", title: "Saved", message: "Read it back, then publish" });
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

  const publish = useCallback(async () => {
    track(EVENTS.PUBLISH_CLICKED, { template: TEMPLATE, is_authenticated: isAuthenticated });
    if (!content.person.name.trim()) {
      track(EVENTS.PUBLISH_FAILED, { template: TEMPLATE, reason: "missing_name" });
      pushToast({ type: "info", title: "Add their name first", message: "Open Edit and add their name" });
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

      const pubRes = await fetch(`${BASE}/${id}/publish`, { method: "POST", headers: headers() });
      const pubResult = await pubRes.json();
      if (pubResult.success) {
        setShareUrl(String(pubResult.data.shareUrl));
        if (typeof pubResult.data.contribToken === "string") setContribToken(pubResult.data.contribToken);
        await persistStory();
        clearDraft();
        track(EVENTS.PUBLISH_SUCCESS, { template: TEMPLATE, source: "direct" });
        pushToast({ type: "publish", title: "Published", message: "The profile is live" });
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
    const text = `${content.person.name || "She"} has been endorsed.`;
    openShareSheet({
      url: shareUrl,
      title: "Endorsements",
      text,
      accent: "#0f766e",
      slug: "profile-pro",
    });
  }, [shareUrl, content.person.name]);

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

  const goBack = useCallback(() => router.push("/templates"), [router]);

  const shareId = shareUrl ? shareUrl.split("/").pop() ?? null : null;

  return {
    content, mf, displayData, editMode, pagePassword, pageId, shareUrl, shareId,
    contribToken, endorseUrl, recommendUrl,
    isPersonalized, showAuth, saving, publishing, copied, toasts, previewVersion,

    setEditMode, setPagePassword, updateMf, setMf,
    storyFill, storyStarted, handleStartCreate, handleStoryManual,
    handleEditClick, handleEditFromPreview, handleSave,
    create, update, publish,
    closeAuth, closeAuthSuccess, handleCopy, handleShare, handleNudge, goBack,
    pushToast, dismissToast,

    showPublish: isPersonalized && !shareUrl && !publishing,
    showShare: !!shareUrl,
    shareLabel: copied ? "Copied" : "Share",
  };
}
