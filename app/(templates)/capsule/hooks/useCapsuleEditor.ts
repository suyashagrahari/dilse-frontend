"use client";

// ─── Capsule — the editor ────────────────────────────────────────────────────
//
// Same shape as every other template's editor: demo preview → Create → sheet →
// Save → auth-deferred Publish → Share. Two things differ, and both come from
// the seal:
//
//   1. THE DRAFT NEVER TOUCHES STORAGE. Every sibling editor autosaves to
//      localStorage so a refresh does not lose the sender's typing. This one
//      must not: the draft is the only copy of text that nobody — including its
//      author — is supposed to be able to read after sealing, and localStorage
//      is readable by every tab on the origin, survives the session, and is the
//      first place anyone looks. Losing a draft on refresh is a real cost and it
//      is the right trade.
//
//   2. AFTER SEALING, THE EDITOR STOPS HOLDING THE CONTENT. Once `canAmend`
//      returns false the preview is fed a `SealedCapsuleView` built by
//      `projectSealed`, and the full capsule is dropped from state. Not hidden —
//      dropped.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { useStoryFill } from "@/hooks/useStoryFill";
import { API_URL, IS_NGROK } from "@/lib/config";
import { EVENTS } from "@/lib/analytics/events";
import { track } from "@/lib/analytics/track";
import {
  AMEND_WINDOW_MS,
  LIMITS,
  canAmend,
  getServerTime,
  type Capsule,
  type CapsuleView,
} from "../components/types";
import {
  DEMO_CAPSULE,
  blankDraft,
  capsuleToDraft,
  deviceTimezone,
  draftToCapsule,
  type CapsuleDraft,
  type Seat,
} from "../components/capsuleData";
import { capsuleToBody, projectSealed } from "../components/coerce";
import { openShareSheet } from "@/lib/share/shareBus";
import { ensurePublishAllowed } from "@/lib/paywall/publishRequest";
import { useDraft } from "@/lib/draft/useDraft";
import { useToast } from "@/lib/toast/useToast";
import { useResumeDraft } from "@/lib/draft/resume";
import { persistDraft } from "@/lib/draft/persistDraft";

const BASE = `${API_URL}/capsule-pages`;
const TEMPLATE = "capsule";

export interface Toast {
  id: number;
  type: "info" | "success" | "publish";
  title: string;
  message?: string;
}

export function useCapsuleEditor() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, accessToken } = useAppSelector((s) => s.auth);

  // `Intl` and `Date.now()` in a lazy initialiser: evaluated once, and never
  // rendered directly, so the server/client difference cannot become a
  // hydration mismatch.
  const [draft, setDraft] = useState<CapsuleDraft>(() => blankDraft(deviceTimezone(), new Date().toISOString()));
  const [seat, setSeat] = useState<Seat>("a");
  const [sheetOpen, setSheetOpen] = useState(false);

  /** The sealed capsule, held ONLY while the amend window is open. */
  const [capsule, setCapsule] = useState<Capsule | null>(null);
  const [sealing, setSealing] = useState(false);
  const [ceremony, setCeremony] = useState(false);
  const [previewVersion, setPreviewVersion] = useState(0);

  const [pageId, setPageId] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);
  const { pushToast } = useToast();
  const [copied, setCopied] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const pendingPublishRef = useRef<{ capsule: Capsule } | null>(null);

  const headers = useCallback(
    () => ({
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      ...(IS_NGROK ? { "ngrok-skip-browser-warning": "true" } : {}),
    }),
    [accessToken],
  );



  // ── `seal another` carries the stake forward ────────────────────────────────
  const carriedStake = searchParams.get("stake") ?? "";
  const isNew = searchParams.get("new") === "1";
  useEffect(() => {
    if (!isNew || !carriedStake) return;
    setDraft((d) => (d.stake ? d : { ...d, stake: carriedStake.slice(0, LIMITS.stake) }));
    setSheetOpen(true);
  }, [isNew, carriedStake]);

  const updateDraft = useCallback((patch: Partial<CapsuleDraft>) => {
    setDraft((d) => ({ ...d, ...patch }));
  }, []);

  // ── Sealing ────────────────────────────────────────────────────────────────

  const amendable = capsule ? canAmend(capsule) : false;

  /**
   * THE MOMENT. Once this runs, the draft becomes a `Capsule` and the editor
   * stops being a writing surface.
   *
   * Edge case, verified against `canAmend`: when `opensOn` is less than 24h from
   * here, the amend window is clamped to `opensOn` rather than running past it —
   * so a capsule sealed at 09:00 to open at 15:00 the same day simply never
   * offers an amend window. That is the contract's behaviour and it is correct.
   */
  const seal = useCallback(() => {
    setSealing(true);
    const sealedOn = new Date(getServerTime()).toISOString();
    const built = draftToCapsule(draft, sealedOn);
    setCapsule(built);
    setDraft((d) => ({ ...d, sealedOn, status: "sealed" }));
    setSheetOpen(false);
    setCeremony(true);
    setSealing(false);
    track(EVENTS.PAGE_SAVED, {
      template: TEMPLATE,
      predictions: built.predictions.length,
      has_wildcard: built.predictions.some((p) => p.isWildcard),
    });
  }, [draft]);

  const finishCeremony = useCallback(() => {
    setCeremony(false);
    setPreviewVersion((v) => v + 1);
  }, []);

  /** Amend: re-derive the capsule from the (still open) draft. */
  const saveAmend = useCallback(() => {
    if (!capsule || !canAmend(capsule)) return;
    const next = draftToCapsule(draft, capsule.sealedOn);
    setCapsule(next);
    setSheetOpen(false);
    setPreviewVersion((v) => v + 1);
    pushToast({ type: "success", title: "changed." });
  }, [capsule, draft, pushToast]);

  /**
   * Names and photos never lock — fixing a typo in a name in 2027 is not an
   * integrity question. This writes ONLY `pair`, and it is the only save path
   * available once the amend window has closed.
   */
  const saveNames = useCallback(() => {
    setCapsule((c) =>
      c
        ? {
            ...c,
            pair: {
              a: { ...c.pair.a, name: draft.nameA.trim().slice(0, LIMITS.name) },
              b: { ...c.pair.b, name: draft.nameB.trim().slice(0, LIMITS.name) },
            },
          }
        : c,
    );
    setSheetOpen(false);
    setPreviewVersion((v) => v + 1);
  }, [draft.nameA, draft.nameB]);

  const openWriteSheet = useCallback(() => {
    setSheetOpen(true);
  }, []);

  const openAmendSheet = useCallback(() => {
    if (!capsule || !canAmend(capsule)) return;
    setDraft(capsuleToDraft(capsule));
    setSheetOpen(true);
  }, [capsule]);

  // ── The preview ────────────────────────────────────────────────────────────
  //
  // Demo until they seal. After sealing, the preview is fed the PROJECTION, not
  // the capsule — the same object the server would send — so the editor's own
  // preview cannot show what a recipient could not see.

  const amendUntil = useMemo(() => {
    if (!capsule) return undefined;
    const sealed = Date.parse(capsule.sealedOn);
    const opens = Date.parse(capsule.opensOn);
    if (Number.isNaN(sealed)) return undefined;
    const closes = Number.isNaN(opens) ? sealed + AMEND_WINDOW_MS : Math.min(sealed + AMEND_WINDOW_MS, opens);
    return new Date(closes).toISOString();
  }, [capsule]);

  const view: CapsuleView = useMemo(() => {
    if (!capsule) return projectSealed(DEMO_CAPSULE);
    return projectSealed(capsule, amendUntil);
  }, [capsule, amendUntil]);

  const isPersonalized = capsule !== null;

  /**
   * What the UI is allowed to see.
   *
   * Once the amend window has closed, the prediction text is stripped before it
   * reaches a single component — not hidden with a flag, removed from the value
   * that is handed down. "Not by the partner, not by the author" includes the
   * author's own editor.
   *
   * Honest limitation: the un-stripped draft is still an object in this hook's
   * state for the life of the tab. It is never rendered and never sent, no copy
   * of it exists in localStorage or sessionStorage, and a refresh loses it for
   * good — a reload re-reads the capsule from the server, which returns the
   * sealed projection with no text in it.
   */
  const exposedDraft = useMemo(() => {
    if (!capsule || amendable) return draft;
    return { ...draft, predictions: draft.predictions.map((p) => ({ ...p, text: "" })) };
  }, [draft, capsule, amendable]);

  // ── AI story fill — THE OUTSIDE OF THE CAPSULE ONLY ────────────────────────
  //
  // The schema declares four fields and no more: `nameA`, `nameB`,
  // `opensOnDate`, `stake`. All four are on `SealedCapsuleView`, i.e. all four
  // are already visible on the waiting screen while the capsule is sealed.
  // Everything else — every `predictions[].text`, every `context` line — is
  // absent from that type, is therefore sealed, and belongs to the person who
  // wrote it. Nothing here may write into it.
  //
  // Two things enforce that, and they are independent of the server:
  //
  //   1. `current` is `exposedDraft`, the REDACTED view. The fill machinery
  //      never even holds the sealed text, so it cannot be read, diffed or
  //      round-tripped by anything in this flow. (The form is not transmitted
  //      either — `useStoryFill` posts only the sender's story prose and the
  //      names, never the draft.)
  //
  //   2. `applyStoryFill` below NEVER hands the merged object back wholesale.
  //      `applyPatch` returns a clone of `current`, and merging that clone into
  //      state would write the redacted (blanked) predictions over the real
  //      ones. So exactly four keys are lifted out by name and passed to
  //      `updateDraft`, which merges them into the REAL draft and leaves
  //      `predictions`, `context`, `sealedOn` and `status` untouched.
  //
  // If the schema ever grows a fifth field, this drops it. That is the correct
  // direction to fail in.
  const [fillDemo] = useState<CapsuleDraft>(() => blankDraft(deviceTimezone(), new Date().toISOString()));

  const applyStoryFill = useCallback(
    (next: CapsuleDraft) => {
      updateDraft({
        nameA: next.nameA,
        nameB: next.nameB,
        opensOnDate: next.opensOnDate,
        stake: next.stake,
      });
    },
    [updateDraft],
  );

  const storyFill = useStoryFill<CapsuleDraft>({
    slug: "capsule",
    demo: fillDemo,
    current: exposedDraft,
    onFilled: applyStoryFill,
  });
  const { schema: storySchema, setMode: setStoryMode, persistStory } = storyFill;
  const [storyStarted, setStoryStarted] = useState(false);

  // ── StoryStarter entry points ──────────────────────────────────────────────
  //
  // The writing sheet is opened FIRST, then StoryStarter is laid over it, so
  // "I'll fill it in myself" reveals exactly the sheet this editor has always
  // shown. Never offered once a capsule exists: after the seal there is nothing
  // an AI is allowed to touch.
  const openStoryStarter = useCallback(() => {
    setSheetOpen(true);
    setStoryMode("idle");
    setStoryStarted(true);
  }, [setStoryMode]);

  /** Create tap. With no schema — or once sealed — this is the old Create. */
  const handleStartCreate = useCallback(() => {
    if (!storySchema || capsule) {
      setSheetOpen(true);
      return;
    }
    openStoryStarter();
  }, [storySchema, capsule, openStoryStarter]);

  /** StoryStarter's way out — the normal sheet, every field still editable. */
  const handleStoryManual = useCallback(() => setSheetOpen(true), []);

  // ── Reopening from the profile ────────────────────────────────────────────
  //
  // This editor ignored `?edit=<id>`, so the profile's Edit button opened it on
  // a blank capsule — and sealing from there overwrote the user's page with a
  // new one. Nothing about that was visible: no error, no empty state, just the
  // wrong page.
  //
  // `setDraft(capsuleToDraft(...))` is not optional here. `draft` is the form
  // and `capsule` is the sealed content; setting only the latter would show the
  // right page in preview and an empty sheet the moment they opened Amend.
  useResumeDraft({
    base: BASE,
    editId: searchParams.get("edit"),
    accessToken,
    defaults: DEMO_CAPSULE,
    onLoaded: (data, id) => {
      setCapsule(data);
      setDraft(capsuleToDraft(data));
      setPageId(id);
    },
  });

  // ── Auto-draft ──────────────────────────────────────────────────────────────
  //
  // Work built while signed OUT is held in the browser and promoted to a real
  // draft the moment the visitor signs up or logs in. `doPublish` was the only
  // thing that ever wrote a row here, so a capsule sealed and then abandoned
  // left nothing behind at all.
  //
  // ── WHY THE CONTENT IS `capsule` AND NOT `draft` ──────────────────────────
  //
  // `draft` is the letters being written — a form, changing on every keystroke,
  // and not yet a page. `capsule` is what sealing produces, and `isPersonalized`
  // is already defined as `capsule !== null`. Saving the form would put an
  // unsealed capsule in someone's profile, which is not a thing this template
  // can reopen.
  //
  // Named `autoDraft` because `draft` is taken, by the form.
  const autoDraft = useDraft<Capsule | null>({
    templateType: TEMPLATE,
    content: capsule,
    enabled: isPersonalized,
    busy: publishing || sealing,
    isAuthenticated,
    accessToken,
    pageId,
    persist: (d) =>
      d
        ? persistDraft({
            base: BASE,
            headers: headers(),
            pageId,
            setPageId,
            body: capsuleToBody(d),
          })
        : Promise.resolve(null),
    onAdopted: (d) => setCapsule(d),
  });

  // Sealing is the milestone here — this template has no edit-mode transition,
  // and a sealed capsule with the sheet shut is exactly "worth keeping".
  // Leaving the editor and backgrounding the tab are handled inside the hook.
  useEffect(() => {
    if (capsule && !sheetOpen) void autoDraft.saveNow();
  }, [capsule, sheetOpen, autoDraft]);

  // ── Publish (auth-deferred, never auth-gated) ──────────────────────────────

  const doPublish = useCallback(
    async (payload: Capsule, source: "direct" | "auth_deferred") => {
      setPublishing(true);
      try {
        let id = pageId;
        if (!id) {
          const res = await fetch(BASE, { method: "POST", headers: headers(), body: JSON.stringify(capsuleToBody(payload)) });
          const result = await res.json();
          if (!result?.success) throw new Error("save failed");
          id = String(result.data._id);
          setPageId(id);
        } else {
          await fetch(`${BASE}/${id}`, { method: "PUT", headers: headers(), body: JSON.stringify(capsuleToBody(payload)) });
        }

        // Clear the paywall BEFORE publishing, so nothing spins behind the sheet,
        // and the publish request is only made when it will succeed.
        const gate = await ensurePublishAllowed(
          { slug: TEMPLATE, templateType: "capsule", pageId: id, templateTitle: "Capsule" },
          setPublishing,
        );
        if (gate === "cancelled") return;

        const pubRes = await fetch(`${BASE}/${id}/publish`, { method: "POST", headers: headers() });
        const pubResult = await pubRes.json();
        if (pubResult?.success) {
          setShareUrl(String(pubResult.data.shareUrl));
          // Never throws, never blocks — the capsule is already sealed and live
          // either way. Only the sender's own story prose is saved; nothing
          // from inside the capsule is reachable from here.
          await persistStory();
          track(EVENTS.PUBLISH_SUCCESS, { template: TEMPLATE, source });
          pushToast({ type: "publish", title: "sealed and shared 🕰️", message: "Tap Share to send it"});
        } else {
          track(EVENTS.PUBLISH_FAILED, { template: TEMPLATE, source, reason: "publish_rejected" });
          pushToast({ type: "info", title: "publish failed", message: "saved — try publish again" });
        }
      } catch {
        track(EVENTS.PUBLISH_FAILED, { template: TEMPLATE, source, reason: "network_error" });
        pushToast({ type: "info", title: "publish failed", message: "please try again" });
      } finally {
        setPublishing(false);
      }
    },
    [pageId, headers, pushToast, persistStory],
  );

  // Resumes the publish the moment the user comes back logged in. Every state
  // write happens inside the async body, after an await, never synchronously in
  // the effect.
  useEffect(() => {
    if (!isAuthenticated || !accessToken || !pendingPublishRef.current) return;
    const pending = pendingPublishRef.current;
    pendingPublishRef.current = null;
    void doPublish(pending.capsule, "auth_deferred");
  }, [isAuthenticated, accessToken, doPublish]);

  const publish = useCallback(() => {
    track(EVENTS.PUBLISH_CLICKED, { template: TEMPLATE, is_authenticated: isAuthenticated });
    if (!capsule) {
      pushToast({ type: "info", title: "seal it first", message: "there is nothing to send yet" });
      setSheetOpen(true);
      return;
    }
    if (!isAuthenticated || !accessToken) {
      track(EVENTS.AUTH_REQUIRED, { template: TEMPLATE });
      pendingPublishRef.current = { capsule };
      setShowAuth(true);
      return;
    }
    void doPublish(capsule, "direct");
  }, [capsule, isAuthenticated, accessToken, doPublish, pushToast]);

  const closeAuth = useCallback(() => {
    setShowAuth(false);
    pendingPublishRef.current = null;
  }, []);
  const closeAuthSuccess = useCallback(() => setShowAuth(false), []);

  const handleCopy = useCallback(
    (url?: string) => {
      const link = url || shareUrl;
      if (!link) return;
      void navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      if (!url) pushToast({ type: "success", title: "link copied" });
    },
    [shareUrl, pushToast],
  );

  const handleShare = useCallback(() => {
    if (!shareUrl) return;
    openShareSheet({
      url: shareUrl,
      title: "sealed until next year 🕰️",
      accent: "#991b1b",
      slug: "capsule",
    });
  }, [shareUrl]);

  const goBack = useCallback(() => router.push("/templates"), [router]);

  return {
    draft: exposedDraft,
    updateDraft,
    seat,
    setSeat,
    sheetOpen,
    setSheetOpen,
    openWriteSheet,
    openAmendSheet,
    storyFill,
    storyStarted,
    handleStartCreate,
    handleStoryManual,
    seal,
    saveAmend,
    saveNames,
    sealing,
    ceremony,
    finishCeremony,
    capsule,
    amendable,
    amendUntil,
    view,
    previewVersion,
    isPersonalized,
    publish,
    publishing,
    shareUrl,
    showAuth,
    closeAuth,
    closeAuthSuccess,
    handleCopy,
    handleShare,
    goBack,
    pushToast,
    showPublish: isPersonalized && !shareUrl && !publishing,
    showShare: Boolean(shareUrl),
    shareLabel: copied ? "copied" : "share",
  };
}
