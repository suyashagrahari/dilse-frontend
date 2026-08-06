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

const BASE = `${API_URL}/capsule-pages`;
const TEMPLATE = "capsule";

export interface Toast {
  id: number;
  type: "info" | "success" | "publish";
  title: string;
  message?: string;
  shareUrl?: string;
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
  const [copied, setCopied] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastIdRef = useRef(0);
  const pendingPublishRef = useRef<{ capsule: Capsule } | null>(null);

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
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), toast.type === "publish" ? 6000 : 3500);
  }, []);

  const dismissToast = useCallback((id: number) => setToasts((prev) => prev.filter((t) => t.id !== id)), []);

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

        const pubRes = await fetch(`${BASE}/${id}/publish`, { method: "POST", headers: headers() });
        const pubResult = await pubRes.json();
        if (pubResult?.success) {
          setShareUrl(String(pubResult.data.shareUrl));
          track(EVENTS.PUBLISH_SUCCESS, { template: TEMPLATE, source });
          pushToast({ type: "publish", title: "sealed and shared 🕰️", message: "nothing inside is readable yet", shareUrl: String(pubResult.data.shareUrl) });
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
    [pageId, headers, pushToast],
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
    if (typeof navigator !== "undefined" && "share" in navigator) {
      navigator.share({ title: "sealed until next year 🕰️", url: shareUrl }).catch(() => {});
    } else {
      handleCopy();
    }
  }, [shareUrl, handleCopy]);

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
    toasts,
    pushToast,
    dismissToast,
    showPublish: isPersonalized && !shareUrl && !publishing,
    showShare: Boolean(shareUrl),
    shareLabel: copied ? "copied" : "share",
  };
}
