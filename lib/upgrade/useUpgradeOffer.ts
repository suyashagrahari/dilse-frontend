"use client";

// ─── useUpgradeOffer — the premium offer, for any free editor ────────────────
//
// The whole client half of "See it in Premium, free" for one free template,
// so an editor only has to (1) ask it before publishing and (2) render the
// modal it hands back. Build a Bouquet wires the same flow by hand (it came
// first); the birthday editors use this.
//
//   const up = useUpgradeOffer({ from: "birthday-gf", … });
//   // in publish, once signed in:
//   if (await up.intercept(content, password, () => publishNow())) return;
//   // after a successful free publish:
//   up.notePublished(id);
//   // render:
//   {up.modal && <PremiumUpgradeModal {...up.modal} />}
//
// "Publish free" calls the continuation `intercept` was given; "Preview
// Premium" converts the content (server AI) into the premium draft, hands it
// to the premium editor and navigates there; closing does nothing but count.
// `?publishFree=1` (the premium page's "Free" button) sets `publishFreeAsked`:
// the editor publishes once its content is back, and the offer is not shown.

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { templateMedia } from "@/lib/templateMedia";
import {
  clearUpgradeContext,
  convertToPremium,
  fetchUpgradeOffer,
  handDraftTo,
  saveUpgradeContext,
  trackUpgrade,
  type UpgradeOffer,
} from "./offer";
import type { PremiumUpgradeModalProps } from "@/components/upgrade/PremiumUpgradeModal";

export interface UseUpgradeOfferOptions<T> {
  from: string;
  /** False on an editor whose template has no premium path: the hook stays inert. Default true. */
  enabled?: boolean;
  /** There is something to publish and it is not published yet. */
  active: boolean;
  token: string | null | undefined;
  pageId: string | null;
  /** Where the premium page's "Free" button returns: this editor, publishing. */
  backUrl: (pageId: string | null) => string;
  /** What the server converts (photos stripped: they never leave the browser). */
  body: (data: T) => unknown;
  /** The server's answer + their content → the premium draft the editor restores. */
  compose: (res: { to: string; draft?: unknown; patch?: Record<string, unknown> }, data: T) => Promise<unknown>;
  recipientOf: (data: T) => string;
  withRecipient: (data: T, name: string) => T;
  /** Keep the free version restorable for "Free" on the premium page. */
  keepFree: (data: T, password: string) => void;
  /** Closed without choosing (e.g. let an auth-deferred row be adopted again). */
  onDismiss?: () => void;
  /** The modal's words for this template. */
  copy: { sub: string; keep: string; recipientLabel: string; recipientPlaceholder: string };
}

export function useUpgradeOffer<T>(o: UseUpgradeOfferOptions<T>) {
  const router = useRouter();
  const params = useSearchParams();
  const publishFreeAsked = params.get("publishFree") === "1";
  const [offer, setOffer] = useState<UpgradeOffer | null | undefined>(undefined);
  const [held, setHeld] = useState<{ data: T; password: string; cont: () => void } | null>(null);
  const [recipient, setRecipient] = useState("");
  const skipRef = useRef(publishFreeAsked);
  const seenRef = useRef(false);
  const latest = useRef(o);
  useEffect(() => { latest.current = o; });

  // Fetched ahead, once there is something to publish, so the card opens at once.
  useEffect(() => {
    if (o.enabled === false || !o.active || offer !== undefined || skipRef.current) return;
    let live = true;
    void fetchUpgradeOffer(o.from, o.token).then((x) => { if (live) setOffer(x); });
    return () => { live = false; };
  }, [o.enabled, o.active, o.from, o.token, offer]);

  /** True when the offer opened instead of publishing; `cont` is the publish "Publish free" runs. */
  const intercept = useCallback(async (data: T, password: string, cont: () => void): Promise<boolean> => {
    if (o.enabled === false || skipRef.current) return false;
    const x = offer === undefined ? await fetchUpgradeOffer(o.from, o.token) : offer;
    if (offer === undefined) setOffer(x);
    if (!x) return false;
    seenRef.current = true;
    setRecipient(o.recipientOf(data));
    setHeld({ data, password, cont });
    trackUpgrade(o.from, "shown", { token: o.token, pageId: o.pageId, to: x.to });
    return true;
  }, [offer, o]);

  const notePublished = useCallback((id: string | null) => {
    if (!seenRef.current && !skipRef.current) return;
    trackUpgrade(latest.current.from, "free_published", { token: latest.current.token, pageId: id });
    clearUpgradeContext();
  }, []);

  const choose = useCallback(() => {
    if (!held || !offer) return;
    skipRef.current = true;
    trackUpgrade(o.from, "free_chosen", { token: o.token, pageId: o.pageId, to: offer.to });
    setHeld(null);
    held.cont();
  }, [held, offer, o]);

  const dismiss = useCallback(() => {
    trackUpgrade(o.from, "dismissed", { token: o.token, pageId: o.pageId, to: offer?.to });
    setHeld(null);
    o.onDismiss?.();
  }, [o, offer]);

  const tryPremium = useCallback(async () => {
    if (!held || !offer) return;
    const { from, token, pageId } = o;
    trackUpgrade(from, "try_clicked", { token, pageId, to: offer.to });
    const name = recipient.trim().slice(0, 30);
    const data = name && !o.recipientOf(held.data).trim() ? o.withRecipient(held.data, name) : held.data;
    const res = await convertToPremium(from, o.body(data), token, pageId);
    const draft = await o.compose(res, data);
    o.keepFree(data, held.password);
    if (!handDraftTo(res.to, draft)) throw new Error("Your browser storage is full. Please publish the free one, or try again after clearing space.");
    saveUpgradeContext({ from, to: res.to, pageId, backUrl: o.backUrl(pageId) });
    router.push(`/${res.to}?upgrade=${from}`);
  }, [held, offer, o, recipient, router]);

  const modal: PremiumUpgradeModalProps | null =
    offer && held
      ? {
          offer,
          cover: templateMedia(offer.to, "cover-poster.webp"),
          recipient: o.recipientOf(held.data).trim()
            ? null
            : { value: recipient, onChange: setRecipient, label: o.copy.recipientLabel, placeholder: o.copy.recipientPlaceholder },
          sub: o.copy.sub,
          keep: o.copy.keep,
          onTry: tryPremium,
          onFree: choose,
          onClose: dismiss,
        }
      : null;

  return { intercept, notePublished, modal, publishFreeAsked, skipOffer: () => { skipRef.current = true; } };
}
