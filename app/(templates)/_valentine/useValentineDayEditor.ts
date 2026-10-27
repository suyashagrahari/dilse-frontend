"use client";

// ─── useValentineDayEditor(slug) — the one editor state machine ──────────────
//
// A line-for-line port of catch/hooks/useCatchEditor.ts, parameterised by the
// day's slug: useStoryFill({ slug }), useDraft + `?edit=`, ensurePublishAllowed
// before publish, persistStory() in BOTH publish paths, pushToast({type:"publish"}),
// openShareSheet, page password. Additionally loads the recipient's
// `reactions` (owner-only) when editing a page, and refreshes them when the tab
// regains focus, so the sender sees "Seen ✓ / Said YES 💍".

import { useState, useCallback, useRef, useEffect } from "react";
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
import { getDay } from "./days";
import {
  demoData,
  fromDb,
  missingForSave,
  parseReactions,
  tidy,
  toBody,
  type DaySlug,
  type EditMode,
  type ValentineDayData,
  type ValentineReactions,
} from "./types";
import { goBackFromTemplate } from "@/lib/backNav";
import { useUpgradeOffer } from "@/lib/upgrade/useUpgradeOffer";
import { composeValentineDraft } from "@/lib/upgrade/compose";

/**
 * Days whose publish first offers a premium sibling, filled from what they
 * wrote (lib/upgrade/useUpgradeOffer; the server decides whether it is on).
 */
const PREMIUM_UPGRADE: Partial<Record<DaySlug, DaySlug>> = {
  "happy-birthday": "birthday-premium",
};

type DraftShape = { data?: ValentineDayData; password?: string; completed?: boolean };

export function useValentineDayEditor(slug: DaySlug) {
  const day = getDay(slug);
  const DRAFT_KEY = `${slug}_draft`;
  const BASE = `${API_URL}/${slug}-pages`;
  const TEMPLATE = slug;

  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, accessToken } = useAppSelector((s) => s.auth);

  // Draft persistence (localStorage first, sessionStorage fallback).
  const draftStore = (): Storage | null => {
    try { return window.localStorage; } catch { try { return window.sessionStorage; } catch { return null; } }
  };
  const saveDraft = (payload: DraftShape) => {
    try { draftStore()?.setItem(DRAFT_KEY, JSON.stringify(payload)); } catch {}
  };
  const clearDraft = () => {
    try { window.localStorage.removeItem(DRAFT_KEY); } catch {}
    try { window.sessionStorage.removeItem(DRAFT_KEY); } catch {}
  };
  const readDraft = (): DraftShape | null => {
    try {
      const raw = draftStore()?.getItem(DRAFT_KEY) ?? window.sessionStorage.getItem(DRAFT_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  };

  const [content, setContent] = useState<ValentineDayData>(() => demoData(slug));
  const [mf, setMf] = useState<ValentineDayData>(() => demoData(slug));
  const [editMode, setEditMode] = useState<EditMode>(null);
  const [pagePassword, setPagePassword] = useState("");
  const [pageId, setPageId] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [isPersonalized, setIsPersonalized] = useState(false);
  const [reactions, setReactions] = useState<ValentineReactions | null>(null);

  // ── AI story fill ───────────────────────────────────────────────────────────
  // Paths in server/src/config/aiFill/<slug>.ts address this `mf`.
  const onFilled = useCallback((next: ValentineDayData) => setMf(tidyForFill(next)), []);
  const fill = useStoryFill<ValentineDayData>({ slug, demo: day.demo, current: mf, onFilled });
  const [storyStarter, setStoryStarter] = useState(false);

  const [previewVersion, setPreviewVersion] = useState(0);
  const bumpPreview = useCallback(() => setPreviewVersion((v) => v + 1), []);

  const [showAuth, setShowAuth] = useState(false);
  const saving = false;
  const [publishing, setPublishing] = useState(false);
  const { pushToast } = useToast();
  const [copied, setCopied] = useState(false);

  const pendingPublishRef = useRef<{ data: ValentineDayData; password: string } | null>(null);
  /** See useCatchEditor: stops useDraft's adoption racing the deferred publish. */
  const publishInFlightRef = useRef(false);

  // ── "See it in Premium, free" ───────────────────────────────────────────────
  const upgradeTo = PREMIUM_UPGRADE[slug];
  const up = useUpgradeOffer<ValentineDayData>({
    from: slug,
    enabled: !!upgradeTo,
    active: isPersonalized && !shareUrl,
    token: accessToken,
    pageId,
    backUrl: (id) => (id ? `/${slug}?edit=${id}&publishFree=1` : `/${slug}?publishFree=1`),
    // Photos stay in the browser; only their words go to the server.
    body: (d) => ({ ...toBody(d, ""), photos: d.photos.map((p) => ({ caption: p.caption ?? "", note: p.note ?? "" })) }),
    compose: async (res, d) => {
      const next = await composeValentineDraft(upgradeTo as DaySlug, res.patch ?? {}, {
        recipientName: d.recipientName,
        senderName: d.senderName,
        petName: d.petName,
        photos: d.photos,
      });
      // Their song comes along too.
      if (d.musicMode === "youtube" && d.musicYoutubeId) {
        return { ...next, music: true, musicMode: "youtube" as const, musicYoutubeId: d.musicYoutubeId, musicStart: d.musicStart };
      }
      return next;
    },
    recipientOf: (d) => d.recipientName,
    withRecipient: (d, name) => ({ ...d, recipientName: name }),
    keepFree: (d, password) => saveDraft({ data: d, password, completed: true }),
    onDismiss: () => { publishInFlightRef.current = false; },
    copy: {
      sub: "One tap and we turn your page into a pop-up birthday storybook: your names, your letter, your photos and your song, already in place. Watch exactly how it looks before you decide.",
      keep: "Your birthday page stays saved: you can still publish it from the premium preview.",
      recipientLabel: "Whose birthday is it?",
      recipientPlaceholder: "Their name, e.g. Riya",
    },
  });

  const headers = useCallback(
    () => ({
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      ...(IS_NGROK ? { "ngrok-skip-browser-warning": "true" } : {}),
    }),
    [accessToken],
  );

  const loadOwned = useCallback(
    async (id: string, seed: boolean) => {
      const r = await fetch(`${BASE}/${id}`, { headers: headers() });
      const result = await r.json();
      if (!result.success || !result.data) return;
      setReactions(parseReactions(result.data.reactions));
      if (!seed) return;
      const d = fromDb(slug, result.data, true);
      setContent(d);
      setMf(d);
      setPageId(id);
      setIsPersonalized(true);
      setEditMode("preview");
      bumpPreview();
      if (result.data.isPublished && result.data.shareUrl) setShareUrl(String(result.data.shareUrl));
    },
    [BASE, headers, slug, bumpPreview],
  );

  // ── Load existing page (?edit=<id>) or restore a local draft ────────────────
  useEffect(() => {
    const id = searchParams.get("edit") || searchParams.get("id");
    if (id && isAuthenticated && accessToken) {
      loadOwned(id, true).catch(() => {});
      return;
    }
    const draft = readDraft();
    if (draft?.data && typeof draft.data === "object") {
      // Restored through fromDb(…, false): coerces an old/partial draft, keeps
      // half-typed text, and fills anything missing from the demo.
      const d = { ...fromDb(slug, draft.data as unknown as Record<string, unknown>, false), photos: Array.isArray(draft.data.photos) ? draft.data.photos : day.demo.photos };
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

  // ── Owner sees reactions update when they come back to the tab ──────────────
  useEffect(() => {
    if (!pageId || !shareUrl || !isAuthenticated || !accessToken) return;
    const onVis = () => {
      if (!document.hidden) loadOwned(pageId, false).catch(() => {});
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [pageId, shareUrl, isAuthenticated, accessToken, loadOwned]);

  // ── Auto-resume publish after successful auth ───────────────────────────────
  useEffect(() => {
    if (!isAuthenticated || !accessToken || !pendingPublishRef.current) return;
    const { data, password } = pendingPublishRef.current;
    pendingPublishRef.current = null;
    publishInFlightRef.current = true;

    const run = async () => {
    publishInFlightRef.current = true;
    setPublishing(true);
    setEditMode("preview");
      try {
        const res = await fetch(BASE, { method: "POST", headers: headers(), body: JSON.stringify(toBody(data, password)) });
        const result = await res.json();
        if (!result.success) throw new Error("Save failed");
        const savedId = result.data._id as string;
        setPageId(savedId);
        setContent(data);
        setIsPersonalized(true);

        const gate = await ensurePublishAllowed(
          { slug: TEMPLATE, templateType: TEMPLATE, pageId: savedId, templateTitle: day.name },
          setPublishing,
        );
        if (gate === "cancelled") return;

        const pubRes = await fetch(`${BASE}/${savedId}/publish`, { method: "POST", headers: headers() });
        const pubResult = await pubRes.json();
        if (pubResult.success) {
          setShareUrl(String(pubResult.data.shareUrl));
          clearDraft();
          up.notePublished(savedId);
          // Count the publish (and tell them) BEFORE saving the story to their
          // profile: that save is a model call that can take seconds, and an
          // event behind it is lost whenever they leave the page first.
          track(EVENTS.PUBLISH_SUCCESS, { template: TEMPLATE, source: "auth_deferred" });
          pushToast({ type: "publish", title: `Published! ${day.emoji}`, message: "Tap Share to send it" });
          await fill.persistStory();
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
    };
    // The premium offer first (when this day has one); adoption stands down while it is open.
    setContent(data);
    setIsPersonalized(true);
    setEditMode("preview");
    void up.intercept(data, password, () => void run()).then((opened) => { if (!opened) void run(); });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, accessToken]);

  // ── Auto-save WIP draft on every keystroke ──────────────────────────────────
  useEffect(() => {
    if (editMode !== "manual") return;
    saveDraft({ data: mf, password: pagePassword, completed: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mf, pagePassword, editMode]);

  const displayData = editMode === "manual" ? mf : content;

  const updateMf = useCallback(<K extends keyof ValentineDayData>(key: K, val: ValentineDayData[K]) => setMf((p) => ({ ...p, [key]: val })), []);
  const updateExtra = useCallback((key: string, val: unknown) => setMf((p) => ({ ...p, extras: { ...p.extras, [key]: val } })), []);

  const { schema: storySchema, setMode: setStoryMode } = fill;
  /** Create: the AI questions first when the server has a schema, else the form. */
  const handleEditClick = useCallback(() => {
    setMf(isPersonalized ? { ...content } : demoData(slug));
    // A studio that is the form with its own AI box (StudioForm.ownAi: the wedding tiers) opens the form straight away.
    if (storySchema && !day.studioForm?.ownAi) {
      setStoryMode("idle");
      setStoryStarter(true);
      return;
    }
    setEditMode("manual");
  }, [isPersonalized, content, storySchema, setStoryMode, slug, day.studioForm?.ownAi]);
  /** Alias with the share-page-builder name. */
  const handleStartCreate = handleEditClick;

  /** StoryStarter's exit — into the same form Create would have opened. */
  const openManualForm = useCallback(() => setEditMode("manual"), []);

  /**
   * The form's "✨ Write it for me" card: the same guided StoryStarter, opened
   * OVER the form without resetting what they've typed. Generated text lands in
   * `mf` (onFilled) and every field stays editable.
   */
  const openAiFromForm = useCallback(() => {
    if (!storySchema) return;
    setStoryMode("idle");
    setStoryStarter(true);
  }, [storySchema, setStoryMode]);
  const aiAvailable = Boolean(storySchema);

  /** Close the form throwing away what changed since it opened. */
  const discardEdits = useCallback(() => {
    setMf({ ...content });
    setEditMode("preview");
  }, [content]);

  const handleEditFromPreview = useCallback(() => {
    setMf({ ...content });
    setEditMode("manual");
  }, [content]);

  const handleSave = useCallback(() => {
    const missing = missingForSave(slug, mf);
    if (missing.length) {
      pushToast({ type: "info", title: `Still needed: ${missing.join(", ")}`, message: "Fill those in and save again" });
      return;
    }
    const cleaned = tidy(slug, mf);
    setContent(cleaned);
    setIsPersonalized(true);
    setEditMode("preview");
    bumpPreview();
    saveDraft({ data: mf, password: pagePassword, completed: true });
    track(EVENTS.PAGE_SAVED, { template: TEMPLATE, has_password: Boolean(pagePassword), photos: cleaned.photos.length });
    pushToast({ type: "success", title: "Saved!", message: "Watch it once, then publish 💌" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mf, pagePassword, pushToast, bumpPreview, slug]);

  const create = useCallback(async (): Promise<string | null> => {
    const res = await fetch(BASE, { method: "POST", headers: headers(), body: JSON.stringify(toBody(content, pagePassword)) });
    const result = await res.json();
    if (!result.success) return null;
    setPageId(result.data._id);
    return result.data._id as string;
  }, [BASE, content, pagePassword, headers]);

  const update = useCallback(async (id: string) => {
    await fetch(`${BASE}/${id}`, { method: "PUT", headers: headers(), body: JSON.stringify(toBody(content, pagePassword)) });
  }, [BASE, content, pagePassword, headers]);

  // ── Auto-draft (signed-out work promoted on sign-in) — see useCatchEditor ───
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
        body: toBody(d, pagePassword),
      }),
    onAdopted: (d) => {
      setContent(d);
      setMf({ ...d });
      setIsPersonalized(true);
      bumpPreview();
    },
  });

  useEffect(() => {
    if (editMode === null || editMode === "preview") void draft.saveNow();
  }, [editMode, draft]);

  const publish = useCallback(async () => {
    track(EVENTS.PUBLISH_CLICKED, { template: TEMPLATE, is_authenticated: isAuthenticated });

    const missing = missingForSave(slug, content);
    if (missing.length) {
      track(EVENTS.PUBLISH_FAILED, { template: TEMPLATE, reason: "incomplete" });
      pushToast({ type: "info", title: "Almost there", message: `Still needed: ${missing.join(", ")}` });
      setMf({ ...content });
      setEditMode("manual");
      return;
    }

    if (!isAuthenticated || !accessToken) {
      track(EVENTS.AUTH_REQUIRED, { template: TEMPLATE });
      pendingPublishRef.current = { data: content, password: pagePassword };
      setShowAuth(true);
      return;
    }

    if (await up.intercept(content, pagePassword, () => void publishSignedIn())) return;
    await publishSignedIn();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content, pagePassword, isAuthenticated, accessToken, pushToast, slug, up.intercept]);

  /** The signed-in publish: save (create or update), clear the paywall, publish. */
  const publishSignedIn = async () => {
    setPublishing(true);
    try {
      let id = pageId;
      if (!id) id = await create();
      else await update(id);
      if (!id) throw new Error("Save failed");

      const gate = await ensurePublishAllowed(
        { slug: TEMPLATE, templateType: TEMPLATE, pageId: id, templateTitle: day.name },
        setPublishing,
      );
      if (gate === "cancelled") return;

      const pubRes = await fetch(`${BASE}/${id}/publish`, { method: "POST", headers: headers() });
      const pubResult = await pubRes.json();
      if (pubResult.success) {
        setShareUrl(String(pubResult.data.shareUrl));
        clearDraft();
        up.notePublished(id);
        // Count the publish (and tell them) BEFORE saving the story to their
        // profile: that save is a model call that can take seconds, and an
        // event behind it is lost whenever they leave the page first.
        track(EVENTS.PUBLISH_SUCCESS, { template: TEMPLATE, source: "direct" });
        pushToast({ type: "publish", title: `Published! ${day.emoji}`, message: "Tap Share to send it" });
        await fill.persistStory();
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
  };

  // Back from the premium preview's "Free": publish once the page is back, no offer.
  const autoFreeRef = useRef(false);
  useEffect(() => {
    if (autoFreeRef.current || !up.publishFreeAsked || !upgradeTo) return;
    if (!isPersonalized || shareUrl || publishing || !isAuthenticated || !accessToken) return;
    autoFreeRef.current = true;
    void publish();
  }, [up.publishFreeAsked, upgradeTo, isPersonalized, shareUrl, publishing, isAuthenticated, accessToken, publish]);

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
      title: day.share.title,
      accent: day.share.accent,
      senderName: content.senderName,
      slug,
    });
  }, [shareUrl, content.senderName, pagePassword, day, slug]);

  const goBack = useCallback(() => goBackFromTemplate(router), [router]);
  const shareId = shareUrl ? shareUrl.split("/").pop() ?? null : null;

  return {
    day, slug,
    content, mf, displayData, editMode, pagePassword, pageId, shareUrl, shareId, reactions,
    isPersonalized, showAuth, saving, publishing, copied, previewVersion,
    fill, storyStarter, openManualForm, handleStartCreate, openAiFromForm, aiAvailable,
    setEditMode, setPagePassword, updateMf, updateExtra, setMf,
    handleEditClick, handleEditFromPreview, handleSave, discardEdits,
    create, update, publish,
    closeAuth, closeAuthSuccess, handleCopy, handleShare, goBack,
    upgrade: up.modal,
    pushToast, showPublish: isPersonalized && !shareUrl && !publishing,
    showShare: !!shareUrl,
    shareLabel: copied ? "Copied!" : "Share",
  };
}

/** The AI may caption a demo photo slot; keep the shape, tidy happens on Save. */
function tidyForFill(d: ValentineDayData): ValentineDayData {
  return { ...d, photos: (d.photos ?? []).filter((p) => p && typeof p.url === "string") };
}

export type ValentineEditor = ReturnType<typeof useValentineDayEditor>;
