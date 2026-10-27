"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { API_URL, IS_NGROK } from "@/lib/config";
import { EVENTS } from "@/lib/analytics/events";
import { track } from "@/lib/analytics/track";
import { useStoryFill } from "@/hooks/useStoryFill";

/** Slug reported on every analytics event from this editor. */
const TEMPLATE = "bouquet-gf";
import { type BouquetData, type EditMode, DEMO_DATA, bouquetDataToBody, dbToBouquetData } from "../components/types";
import { openShareSheet } from "@/lib/share/shareBus";
import { ensurePublishAllowed } from "@/lib/paywall/publishRequest";
import { useDraft } from "@/lib/draft/useDraft";
import { useToast } from "@/lib/toast/useToast";
import { persistDraft } from "@/lib/draft/persistDraft";
import { goBackFromTemplate } from "@/lib/backNav";
import {
  clearUpgradeContext,
  convertToPremium,
  fetchUpgradeOffer,
  handDraftTo,
  saveUpgradeContext,
  trackUpgrade,
  type UpgradeOffer,
} from "@/lib/upgrade/offer";

const DRAFT_KEY = "bouquet_draft";
const BASE = `${API_URL}/bouquet-gf-pages`;

const draftStore = (): Storage | null => {
  try { return window.localStorage; } catch { try { return window.sessionStorage; } catch { return null; } }
};
const saveDraft = (payload: unknown) => { try { draftStore()?.setItem(DRAFT_KEY, JSON.stringify(payload)); } catch {} };
const clearDraft = () => {
  try { window.localStorage.removeItem(DRAFT_KEY); } catch {}
  try { window.sessionStorage.removeItem(DRAFT_KEY); } catch {}
};
const readDraft = (): { data?: BouquetData; password?: string; completed?: boolean } | null => {
  try {
    const raw = draftStore()?.getItem(DRAFT_KEY) ?? window.sessionStorage.getItem(DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
};

export function useBouquetEditor() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, accessToken } = useAppSelector((s) => s.auth);

  const [content, setContent] = useState<BouquetData>(DEMO_DATA);
  const [mf, setMf] = useState<BouquetData>({ ...DEMO_DATA });
  const [editMode, setEditMode] = useState<EditMode>(null);
  const [pagePassword, setPagePassword] = useState("");
  const [pageId, setPageId] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [isPersonalized, setIsPersonalized] = useState(false);
  const [previewVersion, setPreviewVersion] = useState(0);
  const bumpPreview = useCallback(() => setPreviewVersion((v) => v + 1), []);

  // ── AI story fill ──────────────────────────────────────────────────────────
  // Completely inert when the server has no schema for this slug: `schema`
  // stays null, StoryStarter renders nothing, and the entry point below falls
  // straight back to the form this editor has always opened.
  const storyFill = useStoryFill<BouquetData>({
    slug: "bouquet-gf",
    demo: DEMO_DATA,
    current: mf,
    onFilled: setMf,
  });
  const { schema: storySchema, setMode: setStoryMode, persistStory } = storyFill;
  const [storyStarted, setStoryStarted] = useState(false);

  const [showAuth, setShowAuth] = useState(false);
  const saving = false;
  const [publishing, setPublishing] = useState(false);
  const { pushToast } = useToast();
  const [copied, setCopied] = useState(false);

  const pendingPublishRef = useRef<{ data: BouquetData; password: string } | null>(null);
  /**
   * True while the auth-deferred publish below is creating the row.
   *
   * Adoption in `useDraft` answers the same event — a token appearing — and
   * used to POST a row of its own, leaving a duplicate behind as a draft. This
   * tells it to stand down. A ref because both effects run in the same commit,
   * so a state flag would still read as the previous render's value.
   */

  const publishInFlightRef = useRef(false);

  // ── The premium offer (lib/upgrade/offer.ts) ────────────────────────────────
  //
  // Publishing opens "Send it in Premium?" first — for a signed-in visitor
  // straight away, for a new one right after they log in. "Publish free" runs
  // the publish this editor always ran; "Try Premium" converts the bouquet into
  // a Digital Bouquet draft and opens it in preview. The offer is fetched ahead
  // (once there is something to publish) so the card opens without a wait.
  // `undefined` = not asked yet, `null` = no offer: publish as usual.
  const [offer, setOffer] = useState<UpgradeOffer | null | undefined>(undefined);
  /** The publish the offer is holding: what to publish and which path it came from. */
  const [offerFor, setOfferFor] = useState<{ data: BouquetData; password: string; source: "direct" | "auth_deferred" } | null>(null);
  const [offerRecipient, setOfferRecipient] = useState("");
  /** Set once they chose the free one (here or from the premium page): no second ask. */
  const skipOfferRef = useRef(searchParams.get("publishFree") === "1");
  const offerSeenRef = useRef(false);

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
            const d = dbToBouquetData(result.data);
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

  useEffect(() => {
    if (!isPersonalized || shareUrl || offer !== undefined || skipOfferRef.current) return;
    let live = true;
    void fetchUpgradeOffer(TEMPLATE, accessToken).then((o) => { if (live) setOffer(o); });
    return () => { live = false; };
  }, [isPersonalized, shareUrl, offer, accessToken]);

  /** True when the offer was opened instead of publishing. */
  const openOfferIfAny = useCallback(
    async (data: BouquetData, password: string, source: "direct" | "auth_deferred"): Promise<boolean> => {
      if (skipOfferRef.current) return false;
      const o = offer === undefined ? await fetchUpgradeOffer(TEMPLATE, accessToken) : offer;
      if (offer === undefined) setOffer(o);
      if (!o) return false;
      offerSeenRef.current = true;
      setOfferRecipient(data.recipientName);
      setOfferFor({ data, password, source });
      trackUpgrade(TEMPLATE, "shown", { token: accessToken, pageId, to: o.to });
      return true;
    },
    [offer, accessToken, pageId],
  );

  /** After a free publish that went through the offer: count it, forget the hand-off. */
  const noteFreePublished = useCallback((id: string | null) => {
    if (!offerSeenRef.current && !skipOfferRef.current) return;
    trackUpgrade(TEMPLATE, "free_published", { token: accessToken, pageId: id });
    clearUpgradeContext();
  }, [accessToken]);

  // ── Auto-resume publish after auth ──
  useEffect(() => {
    if (!isAuthenticated || !accessToken || !pendingPublishRef.current) return;
    const { data, password } = pendingPublishRef.current;
    pendingPublishRef.current = null;
    // We own the row from here; adoption stands down (see useDraft) — also
    // while the premium offer is open, whose "Publish free" lands back here.
    publishInFlightRef.current = true;
    setContent(data);
    setIsPersonalized(true);
    setEditMode("preview");
    void openOfferIfAny(data, password, "auth_deferred").then((opened) => {
      if (!opened) void publishAfterAuth(data, password);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, accessToken]);

  /** The publish an auth-interrupted Publish resumes with: create the row, clear the paywall, publish. */
  const publishAfterAuth = async (data: BouquetData, password: string) => {
    publishInFlightRef.current = true;
    setPublishing(true);
    setEditMode("preview");
    bumpPreview();
      try {
        const res = await fetch(BASE, { method: "POST", headers: headers(), body: JSON.stringify(bouquetDataToBody(data, password)) });
        const result = await res.json();
        if (!result.success) throw new Error("Save failed");
        const savedId = result.data._id as string;
        setPageId(savedId);
        setContent(data);
        setIsPersonalized(true);

        // Clear the paywall BEFORE publishing, so nothing spins behind the sheet,
        // and the publish request is only made when it will succeed.
        const gate = await ensurePublishAllowed(
          { slug: TEMPLATE, templateType: "bouquet-gf", pageId: savedId, templateTitle: "Build a Bouquet" },
          setPublishing,
        );
        if (gate === "cancelled") return;

        const pubRes = await fetch(`${BASE}/${savedId}/publish`, { method: "POST", headers: headers() });
        const pubResult = await pubRes.json();
        if (pubResult.success) {
          setShareUrl(String(pubResult.data.shareUrl));
          noteFreePublished(savedId);
          await persistStory();
          clearDraft();
          pushToast({ type: "publish", title: "Sent! 💐", message: "Tap Share to send it" });
        } else {
          pushToast({ type: "info", title: "Publish failed", message: "Saved — tap Publish to go live" });
        }
      } catch {
        pushToast({ type: "info", title: "Save failed", message: "Please try again" });
      } finally {
        publishInFlightRef.current = false;
        setPublishing(false);
      }
  };

  // ── Auto-save WIP draft while editing ──
  useEffect(() => {
    if (editMode !== "manual" && editMode !== "choose") return;
    saveDraft({ data: mf, password: pagePassword, completed: false });
  }, [mf, pagePassword, editMode]);

  const displayData = editMode === "manual" || editMode === "choose" ? mf : content;

  const updateMf = useCallback((key: keyof BouquetData, val: unknown) => setMf((p) => ({ ...p, [key]: val })), []);

  /** Seeds the form exactly as opening it does, without opening it. */
  const seedManualForm = useCallback(() => {
    setMf(isPersonalized ? { ...content } : { ...DEMO_DATA });
  }, [isPersonalized, content]);

  const handleEditClick = useCallback(() => {
    seedManualForm();
    setEditMode("manual");
  }, [seedManualForm]);

  // ── StoryStarter entry point ────────────────────────────────────────────────
  // `mf` is seeded up front — from the loaded page or the demo, whichever the
  // form would have used — so a generated draft lands on the right base and
  // `onManual` can open the untouched form without re-seeding over the AI's work.
  /** Create. Falls back to today's form when there is no schema. */
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
    if (!mf.senderName.trim()) { pushToast({ type: "info", title: "Add your name first" }); return; }
    setContent(mf);
    setIsPersonalized(true);
    setEditMode("preview");
    bumpPreview();
    saveDraft({ data: mf, password: pagePassword, completed: true });
    pushToast({ type: "success", title: "Saved!", message: "Preview it, then send 💐" });
  }, [mf, pagePassword, pushToast, bumpPreview]);

  const create = useCallback(async (): Promise<string | null> => {
    const res = await fetch(BASE, { method: "POST", headers: headers(), body: JSON.stringify(bouquetDataToBody(content, pagePassword)) });
    const result = await res.json();
    if (!result.success) return null;
    setPageId(result.data._id);
    return result.data._id as string;
  }, [content, pagePassword, headers]);

  const update = useCallback(async (id: string) => {
    await fetch(`${BASE}/${id}`, { method: "PUT", headers: headers(), body: JSON.stringify(bouquetDataToBody(content, pagePassword)) });
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
  // `bouquetDataToBody`, the one description of this template's wire shape.
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
        body: bouquetDataToBody(d, pagePassword),
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


  /** The signed-in publish: save (create or update), clear the paywall, publish. */
  const publishDirect = useCallback(async () => {
    setPublishing(true);
    try {
      let id = pageId;
      if (!id) id = await create();
      else await update(id);
      if (!id) throw new Error("Save failed");

      // Clear the paywall BEFORE publishing, so nothing spins behind the sheet,
      // and the publish request is only made when it will succeed.
      const gate = await ensurePublishAllowed(
        { slug: TEMPLATE, templateType: "bouquet-gf", pageId: id, templateTitle: "Build a Bouquet" },
        setPublishing,
      );
      if (gate === "cancelled") return;

      const pubRes = await fetch(`${BASE}/${id}/publish`, { method: "POST", headers: headers() });
      const pubResult = await pubRes.json();
      if (pubResult.success) {
        setShareUrl(String(pubResult.data.shareUrl));
        noteFreePublished(id);
        await persistStory();
        clearDraft();
        track(EVENTS.PUBLISH_SUCCESS, { template: TEMPLATE, source: "direct" });
        pushToast({ type: "publish", title: "Sent! 💐", message: "Tap Share to send it" });
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
  }, [pageId, create, update, headers, pushToast, persistStory, noteFreePublished]);

  const publish = useCallback(async () => {
    track(EVENTS.PUBLISH_CLICKED, { template: TEMPLATE, is_authenticated: isAuthenticated });
    if (!content.senderName.trim()) {
      track(EVENTS.PUBLISH_FAILED, { template: TEMPLATE, reason: "missing_sender_name" });
      pushToast({ type: "info", title: "Add your name first", message: "Open Edit and fill in your name" });
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
    if (await openOfferIfAny(content, pagePassword, "direct")) return;
    await publishDirect();
  }, [content, pagePassword, isAuthenticated, accessToken, pushToast, openOfferIfAny, publishDirect]);

  // ── The offer's three ways out ──────────────────────────────────────────────

  /** "Publish free": the publish they asked for, never asked again this visit. */
  const offerChooseFree = useCallback(() => {
    const held = offerFor;
    if (!held) return;
    skipOfferRef.current = true;
    trackUpgrade(TEMPLATE, "free_chosen", { token: accessToken, pageId, to: offer?.to });
    setOfferFor(null);
    if (held.source === "auth_deferred") void publishAfterAuth(held.data, held.password);
    else void publishDirect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offerFor, accessToken, pageId, offer, publishDirect]);

  /** Closed without choosing: nothing is published; Publish asks again. */
  const offerDismiss = useCallback(() => {
    trackUpgrade(TEMPLATE, "dismissed", { token: accessToken, pageId, to: offer?.to });
    setOfferFor(null);
    publishInFlightRef.current = false;
  }, [accessToken, pageId, offer]);

  /**
   * "Try Premium": their bouquet → a Digital Bouquet draft, opened in preview.
   * The free bouquet stays saved (as a completed draft, and as its row when it
   * has one), so "Publish the free one instead" on the premium page finds it.
   */
  const offerTryPremium = useCallback(async () => {
    const held = offerFor;
    if (!held || !offer) return;
    trackUpgrade(TEMPLATE, "try_clicked", { token: accessToken, pageId, to: offer.to });
    const data = { ...held.data, recipientName: offerRecipient.trim().slice(0, 30) || held.data.recipientName };
    const res = await convertToPremium<Record<string, unknown>>(TEMPLATE, bouquetDataToBody(data), accessToken, pageId);
    saveDraft({ data, password: held.password, completed: true });
    handDraftTo(res.to, res.draft);
    saveUpgradeContext({
      from: TEMPLATE,
      to: res.to,
      pageId,
      backUrl: pageId ? `/${TEMPLATE}?edit=${pageId}&publishFree=1` : `/${TEMPLATE}?publishFree=1`,
    });
    publishInFlightRef.current = false;
    router.push(`/${res.to}?upgrade=${TEMPLATE}`);
  }, [offerFor, offer, offerRecipient, accessToken, pageId, router]);

  // ── Back from the premium page: "Publish the free one instead" ──────────────
  //
  // `?publishFree=1` publishes as soon as the bouquet is back on screen (the
  // completed draft, or the row `?edit=` loads), without the offer.
  const autoFreeRef = useRef(false);
  useEffect(() => {
    if (autoFreeRef.current || searchParams.get("publishFree") !== "1") return;
    if (!isPersonalized || shareUrl || publishing || !isAuthenticated || !accessToken) return;
    autoFreeRef.current = true;
    skipOfferRef.current = true;
    void publish();
  }, [searchParams, isPersonalized, shareUrl, publishing, isAuthenticated, accessToken, publish]);

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
    const text = "I made you a bouquet 💐";
    openShareSheet({
      url: shareUrl,
      password: pagePassword,
      title: "A bouquet for you 💐",
      text,
      accent: "#ec4899",
      senderName: content.senderName,
      slug: "bouquet-gf",
    });
  }, [shareUrl, content.senderName, pagePassword]);

  const goBack = useCallback(() => goBackFromTemplate(router), [router]);

  const shareId = shareUrl ? shareUrl.split("/").pop() ?? null : null;

  return {
    content, mf, displayData, editMode, pagePassword, pageId, shareUrl, shareId,
    isPersonalized, showAuth, saving, publishing, copied, previewVersion,

    setEditMode, setPagePassword, updateMf, setMf,
    storyFill, storyStarted, handleStartCreate, handleStoryManual,
    handleEditClick, handleEditFromPreview, handleSave,
    create, update, publish,
    closeAuth, closeAuthSuccess, handleCopy, handleShare, goBack,
    upgrade: offer && offerFor
      ? {
          offer,
          recipient: offerFor.data.recipientName.trim() ? null : { value: offerRecipient, onChange: setOfferRecipient },
          onTry: offerTryPremium,
          onFree: offerChooseFree,
          onClose: offerDismiss,
        }
      : null,
    pushToast, showPublish: isPersonalized && !shareUrl && !publishing,
    showShare: !!shareUrl,
    shareLabel: copied ? "Copied!" : "Share",
  };
}
