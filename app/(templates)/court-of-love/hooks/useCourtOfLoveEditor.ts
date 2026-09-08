"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { useStoryFill } from "@/hooks/useStoryFill";
import { API_URL, IS_NGROK } from "@/lib/config";
import { EVENTS } from "@/lib/analytics/events";
import { track } from "@/lib/analytics/track";
import { type CourtOfLoveData, type EditMode, DEMO_DATA, courtOfLoveDataToBody, dbToCourtOfLoveData } from "../components/types";
import { openShareSheet } from "@/lib/share/shareBus";
import { ensurePublishAllowed } from "@/lib/paywall/publishRequest";
import { useDraft } from "@/lib/draft/useDraft";
import { useToast } from "@/lib/toast/useToast";
import { persistDraft } from "@/lib/draft/persistDraft";

const DRAFT_KEY = "court_of_love_draft";
const BASE = `${API_URL}/court-of-love-pages`;

/** Slug reported on every analytics event from this editor. */
const TEMPLATE = "court-of-love";

// Draft is persisted to localStorage so a page refresh (or accidental tab close)
// keeps everything the user filled in. Falls back to sessionStorage if unavailable.
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
const readDraft = (): {
  data?: CourtOfLoveData;
  password?: string;
  completed?: boolean;
  story?: string;
} | null => {
  try {
    const raw = draftStore()?.getItem(DRAFT_KEY) ?? window.sessionStorage.getItem(DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
};

/** Matches MIN_STORY_CHARS on the server; keeps the button honest before we call. */
const MIN_STORY_CHARS = 20;
export const MAX_STORY_CHARS = 4000;

export function useCourtOfLoveEditor() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, accessToken } = useAppSelector((s) => s.auth);

  const [content, setContent] = useState<CourtOfLoveData>(DEMO_DATA);
  const [mf, setMf] = useState<CourtOfLoveData>({ ...DEMO_DATA });
  const [editMode, setEditMode] = useState<EditMode>(null);
  const [pagePassword, setPagePassword] = useState("");
  const [pageId, setPageId] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [isPersonalized, setIsPersonalized] = useState(false);
  // Bumped whenever a *new* preview should be shown → remounts the trial so it
  // restarts at the summons screen with the latest questions.
  const [previewVersion, setPreviewVersion] = useState(0);
  const bumpPreview = useCallback(() => setPreviewVersion((v) => v + 1), []);

  const [showAuth, setShowAuth] = useState(false);
  const saving = false; // save-to-preview is local/synchronous; kept for EditSheet API parity
  const [publishing, setPublishing] = useState(false);
  const { pushToast } = useToast();
  const [copied, setCopied] = useState(false);

  // Holds draft when user tries to publish while unauthenticated → auto-resume after login.
  const pendingPublishRef = useRef<{ data: CourtOfLoveData; password: string } | null>(null);
  /**
   * True while the auth-deferred publish below is creating the row.
   *
   * Adoption in `useDraft` answers the same event — a token appearing — and
   * used to POST a row of its own, leaving a duplicate behind as a draft. This
   * tells it to stand down. A ref because both effects run in the same commit,
   * so a state flag would still read as the previous render's value.
   */
  const publishInFlightRef = useRef(false);

  // ── AI: the sender's story → a whole case file ─────────────────────────────
  //
  // ── WHY THIS TEMPLATE KEEPS ITS OWN GENERATOR AND HAS NO StoryStarter ──────
  //
  // Court of Love shipped a complete AI flow before the shared one existed: a
  // story box at the top of the EditSheet, backed by `courtOfLoveAi.service`,
  // which writes the whole case file *including the five quiz hearings*. The
  // shared schema for this slug can only declare `questions[0..3]` — four of
  // the five — and does not carry `language`, which is what makes a Hindi or
  // Urdu case file render in the right script. Putting the generic path in
  // front would therefore leave the fifth hearing on demo copy and lose the
  // language: a regression on a working, shipped feature. So the bespoke flow
  // stays exactly as it is, and `useStoryFill` is mounted here for one reason
  // only — `persistStory`, so the paragraph the sender already wrote reaches
  // their profile on publish like it does everywhere else.
  //
  // The story itself lives in `fill`, not in a second `useState`. One box, one
  // piece of state: a sender must never be shown two "tell us your story"
  // fields, and two copies of the text is how that starts.
  const fill = useStoryFill<CourtOfLoveData>({
    slug: "court-of-love",
    demo: DEMO_DATA,
    current: mf,
    onFilled: setMf,
    // OFF, and this is the whole reason the comment above exists.
    //
    // Leaving it on would have quietly reintroduced the generic path that this
    // template deliberately does not use. Auto-apply does not need the sender
    // to press anything, so a signed-in sender with a saved story would get the
    // shared 20-field schema written into `mf` without asking — and that schema
    // declares four hearings where this template runs five, and carries no
    // `language`, so a Hindi case file would render with an English fifth
    // hearing and the wrong script. Deciding not to mount StoryStarter was not
    // enough on its own; the hook runs regardless of what is rendered.
    //
    // `generateFromStory` remains the only thing that writes this form.
    autoApply: false,
  });
  const { story, setStory } = fill;

  const [generating, setGenerating] = useState(false);
  /** Language the last generation came back in, echoed to the sender. */
  const [generatedLanguage, setGeneratedLanguage] = useState<string | null>(null);
  const [hasGenerated, setHasGenerated] = useState(false);
  // Same deferred-auth trick as publish: AI generation needs a login, but we
  // don't want a wall in front of the form, so the intent waits here and the
  // effect below resumes it once the user is authenticated.
  const pendingGenerateRef = useRef<string | null>(null);

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
            const d = dbToCourtOfLoveData(result.data);
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

    // Restore a locally-saved draft on refresh. The typed form data (mf) always comes
    // back; if it was saved from the preview ("completed"), we also reopen the preview.
    const draft = readDraft();
    if (draft?.story) setStory(draft.story);
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

  // ── Auto-resume publish after successful auth ───────────────────────────────
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
        const res = await fetch(BASE, {
          method: "POST",
          headers: headers(),
          body: JSON.stringify(courtOfLoveDataToBody(data, password)),
        });
        const result = await res.json();
        if (!result.success) throw new Error("Save failed");
        const savedId = result.data._id as string;
        setPageId(savedId);
        setContent(data);
        setIsPersonalized(true);

        // Clear the paywall BEFORE publishing, so nothing spins behind the sheet,
        // and the publish request is only made when it will succeed.
        const gate = await ensurePublishAllowed(
          { slug: TEMPLATE, templateType: "court-of-love", pageId: savedId, templateTitle: "The Court of Love" },
          setPublishing,
        );
        if (gate === "cancelled") return;

        const pubRes = await fetch(`${BASE}/${savedId}/publish`, { method: "POST", headers: headers() });
        const pubResult = await pubRes.json();
        if (pubResult.success) {
          setShareUrl(String(pubResult.data.shareUrl));
          await fill.persistStory();
          clearDraft();
          // The auth-deferred path: user hit Publish while logged out, logged in,
          // and this resumed automatically. Tracked separately from the direct
          // path so the login detour's completion rate is visible.
          track(EVENTS.PUBLISH_SUCCESS, { template: TEMPLATE, source: "auth_deferred" });
          pushToast({ type: "publish", title: "Case filed! ⚖️", message: "Tap Share to send it" });
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

  // ── Auto-save WIP draft while editing ───────────────────────────────────────
  useEffect(() => {
    if (editMode !== "manual" && editMode !== "choose") return;
    // The story rides along so a refresh mid-edit doesn't lose what they wrote
    // and they can regenerate without retyping it.
    saveDraft({ data: mf, password: pagePassword, completed: false, story });
  }, [mf, pagePassword, editMode, story]);

  const displayData = editMode === "manual" || editMode === "choose" ? mf : content;

  const updateMf = useCallback(
    (key: keyof CourtOfLoveData, val: unknown) => setMf((p) => ({ ...p, [key]: val })),
    [],
  );

  /** Patch one field of one hearing without disturbing the others. */
  const updateQuestion = useCallback((qIndex: number, patch: Partial<CourtOfLoveData["questions"][number]>) => {
    setMf((p) => ({
      ...p,
      questions: p.questions.map((q, i) => (i === qIndex ? { ...q, ...patch } : q)),
    }));
  }, []);

  /** Patch one option of one hearing. */
  const updateOption = useCallback((qIndex: number, optIndex: number, value: string) => {
    setMf((p) => ({
      ...p,
      questions: p.questions.map((q, i) =>
        i === qIndex ? { ...q, options: q.options.map((o, j) => (j === optIndex ? value : o)) } : q,
      ),
    }));
  }, []);

  /**
   * Ask the server to turn `text` into a case file and drop it into the form.
   *
   * Everything it returns is written into `mf`, not `content`, so it lands in the
   * editable form exactly as if the sender had typed it — they can then change
   * any hearing before saving. The story itself is never sent to the page.
   */
  const runGenerate = useCallback(
    async (text: string) => {
      setGenerating(true);
      try {
        const res = await fetch(`${BASE}/generate`, {
          method: "POST",
          headers: headers(),
          body: JSON.stringify({
            story: text,
            plaintiffName: mf.plaintiffName,
            accusedName: mf.accusedName,
          }),
        });
        const result = await res.json();

        if (!res.ok || !result.success) {
          // Deliberately NOT tracked as PUBLISH_FAILED: that event measures the
          // publish drop-off funnel, and a failed AI draft is not a failed
          // publish. Mixing them would quietly corrupt that metric.
          console.warn("Court of Love AI generation failed:", res.status, result?.error);
          pushToast({
            type: "info",
            title: "Couldn't write the questions",
            message: typeof result?.error === "string" ? result.error : "Please try again.",
          });
          return;
        }

        const d = result.data as {
          language?: string;
          languageName?: string;
          headline?: string;
          oathText?: string;
          secretLetter?: string;
          certificateTitle?: string;
          questions?: CourtOfLoveData["questions"];
        };

        setMf((prev) => ({
          ...prev,
          // Only overwrite what the model actually returned, so a sender who
          // already tweaked a field doesn't silently lose it to a blank.
          headline: d.headline?.trim() || prev.headline,
          oathText: d.oathText?.trim() || prev.oathText,
          secretLetter: d.secretLetter?.trim() || prev.secretLetter,
          certificateTitle: d.certificateTitle?.trim() || prev.certificateTitle,
          questions: Array.isArray(d.questions) && d.questions.length ? d.questions : prev.questions,
          language: d.language?.trim() || prev.language,
        }));

        setGeneratedLanguage(d.languageName?.trim() || d.language?.trim() || null);
        setHasGenerated(true);
        pushToast({
          type: "success",
          title: "Your case file is ready ✨",
          message: d.languageName ? `Written in ${d.languageName}` : "Edit anything you like",
        });
      } catch {
        pushToast({ type: "info", title: "Network error", message: "Couldn't reach the AI. Try again." });
      } finally {
        setGenerating(false);
      }
    },
    [mf.plaintiffName, mf.accusedName, headers, pushToast],
  );

  /** Generate from the story box. Defers to login when needed, then resumes. */
  const generateFromStory = useCallback(() => {
    const text = story.trim();
    if (text.length < MIN_STORY_CHARS) {
      pushToast({
        type: "info",
        title: "Tell us a bit more",
        message: `A sentence or two is enough (${MIN_STORY_CHARS}+ characters).`,
      });
      return;
    }
    if (!isAuthenticated || !accessToken) {
      track(EVENTS.AUTH_REQUIRED, { template: TEMPLATE, source: "ai_generate" });
      pendingGenerateRef.current = text;
      setShowAuth(true);
      return;
    }
    void runGenerate(text);
  }, [story, isAuthenticated, accessToken, runGenerate, pushToast]);

  // Resume a deferred generation once the user logs in.
  useEffect(() => {
    if (!isAuthenticated || !accessToken || !pendingGenerateRef.current) return;
    const text = pendingGenerateRef.current;
    pendingGenerateRef.current = null;
    void runGenerate(text);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, accessToken]);

  const handleEditClick = useCallback(() => {
    setMf(isPersonalized ? { ...content } : { ...DEMO_DATA });
    setEditMode("manual");
  }, [isPersonalized, content]);

  const handleEditFromPreview = useCallback(() => {
    setMf({ ...content });
    setEditMode("manual");
  }, [content]);

  // Save (locally) & jump to preview
  const handleSave = useCallback(() => {
    if (!mf.plaintiffName.trim()) { pushToast({ type: "info", title: "Add your name first" }); return; }
    if (!mf.accusedName.trim()) { pushToast({ type: "info", title: "Who's on trial?", message: "Add their name" }); return; }
    setContent(mf);
    setIsPersonalized(true);
    setEditMode("preview");
    bumpPreview(); // fresh preview: the trial restarts from the summons screen
    saveDraft({ data: mf, password: pagePassword, completed: true });
    track(EVENTS.PAGE_SAVED, { template: TEMPLATE, has_password: Boolean(pagePassword) });
    pushToast({ type: "success", title: "Saved!", message: "Play it through, then publish ⚖️" });
  }, [mf, pagePassword, pushToast, bumpPreview]);

  const create = useCallback(async (): Promise<string | null> => {
    const res = await fetch(BASE, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify(courtOfLoveDataToBody(content, pagePassword)),
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
      body: JSON.stringify(courtOfLoveDataToBody(content, pagePassword)),
    });
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
  // `courtOfLoveDataToBody`, the one description of this template's wire shape.
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
        body: courtOfLoveDataToBody(d, pagePassword),
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
    // The gap between this and PUBLISH_SUCCESS is the entire publish drop-off.
    track(EVENTS.PUBLISH_CLICKED, { template: TEMPLATE, is_authenticated: isAuthenticated });

    if (!content.accusedName.trim()) {
      track(EVENTS.PUBLISH_FAILED, { template: TEMPLATE, reason: "missing_accused_name" });
      pushToast({ type: "info", title: "Who's on trial?", message: "Add their name in Edit" });
      setEditMode("manual");
      setMf({ ...content });
      return;
    }
    if (!isAuthenticated || !accessToken) {
      // The auth wall. The pending intent lives in a ref, so it does not survive
      // the Google subdomain-bridge redirect — this event makes that loss visible.
      // `source` discriminates this from the AI-generate auth wall, so the
      // publish funnel stays countable on its own.
      track(EVENTS.AUTH_REQUIRED, { template: TEMPLATE, source: "publish" });
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
        { slug: TEMPLATE, templateType: "court-of-love", pageId: id, templateTitle: "The Court of Love" },
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
        pushToast({ type: "publish", title: "Case filed! ⚖️", message: "Tap Share to send it" });
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

  // Cancelling the login modal must drop BOTH pending intents, or closing it
  // after an AI prompt would fire a generation the next time they log in.
  const closeAuth = useCallback(() => {
    setShowAuth(false);
    pendingPublishRef.current = null;
    pendingGenerateRef.current = null;
  }, []);
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
      title: "You've been summoned to The Court of Love ⚖️",
      accent: "#7c3aed",
      slug: "court-of-love",
    });
  }, [shareUrl, pagePassword]);

  const goBack = useCallback(() => router.push("/templates"), [router]);

  const shareId = shareUrl ? shareUrl.split("/").pop() ?? null : null;

  return {
    content, mf, displayData, editMode, pagePassword, pageId, shareUrl, shareId,
    isPersonalized, showAuth, saving, publishing, copied, previewVersion,

    // AI story → case file
    story, setStory, generating, generatedLanguage, hasGenerated, generateFromStory,
    // The story they already wrote on another template, offered as a shortcut
    // past the blank box. Null when signed out, so the button never appears to
    // someone who would only be told to sign in after pressing it.
    savedStory: fill.contextSummary,
    savedStoryLabel: fill.contextLabel,

    setEditMode, setPagePassword, updateMf, updateQuestion, updateOption,
    handleEditClick, handleEditFromPreview, handleSave,
    create, update, publish,
    closeAuth, closeAuthSuccess, handleCopy, handleShare, goBack,
    pushToast, showPublish: isPersonalized && !shareUrl && !publishing,
    showShare: !!shareUrl,
    shareLabel: copied ? "Copied!" : "Share",
  };
}
