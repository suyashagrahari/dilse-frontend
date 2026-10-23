"use client";

// ─── Share, save and show ───────────────────────────────────────────────────
//   "hero"   — Save the date (the ceremony's .ics) + Share
//   "finale" — WhatsApp, Share (the OS sheet where there is one), Copy link,
//              Save the invite card (PNG), Show QR, Save all dates
// The shared link never carries the guest's own ?to= greeting.

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { DEFAULT_TZ_OFFSET, downloadWeddingIcs, type WeddingEvent } from "../../../_wedding";
import { encodeQr, qrExtent, qrPath } from "@/lib/share/qr";
import { copyText, shareableUrl, whatsappUrl } from "./guest";
import { deliverCard, drawInviteCard, type InviteCardInput } from "./inviteCard";

export function Icon({ d, size = 18 }: { d: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden focusable="false">
      <path d={d} />
    </svg>
  );
}
export const ICON = {
  cal: "M7 3v3M17 3v3M4 8.5h16M5 5.5h14a1 1 0 0 1 1 1V19a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6.5a1 1 0 0 1 1-1zM8.5 13h3v3h-3z",
  share: "M12 3v12M7.5 7.5 12 3l4.5 4.5M5 12v7a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-7",
  link: "M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1",
  image: "M4 5h16v14H4zM4 15l4.5-4.5 4 4L16 11l4 4M9 9.2a1.2 1.2 0 1 0 0-.1",
  qr: "M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h2v2h-2zM18 14h2M14 18h2v2M18 18h2v2h-2",
  pin: "M12 21s-7-6.1-7-11.5A7 7 0 0 1 19 9.5C19 14.9 12 21 12 21zM12 12.2a2.6 2.6 0 1 0 0-5.2 2.6 2.6 0 0 0 0 5.2z",
  clock: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7.5V12l3 2",
  phone: "M6.6 3.5h2.6l1.4 4-2 1.3a11 11 0 0 0 6.6 6.6l1.3-2 4 1.4v2.6a1.6 1.6 0 0 1-1.7 1.6A16.5 16.5 0 0 1 5 5.2a1.6 1.6 0 0 1 1.6-1.7z",
  play: "M8 5.5v13l11-6.5z",
  copy: "M9 9h10v11H9zM5 15V4h10",
  check: "M5 12.5 10 17l9-10",
  live: "M12 14.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM7.8 16.2a6 6 0 0 1 0-8.4M16.2 7.8a6 6 0 0 1 0 8.4M5 19a10 10 0 0 1 0-14M19 5a10 10 0 0 1 0 14",
  rupee: "M7 5h10M7 9h10M8 5c5 0 6 8 0 8l7 6",
  google: "M20 12.2c0-.6-.1-1.2-.2-1.7H12v3.3h4.5a3.9 3.9 0 0 1-1.7 2.5v2.1h2.7c1.6-1.5 2.5-3.6 2.5-6.2zM12 20.5c2.3 0 4.2-.8 5.5-2.1l-2.7-2.1c-.7.5-1.7.8-2.8.8a4.9 4.9 0 0 1-4.6-3.4H4.6v2.2A8.5 8.5 0 0 0 12 20.5zM7.4 13.7a5 5 0 0 1 0-3.4V8.1H4.6a8.5 8.5 0 0 0 0 7.8zM12 6.9c1.2 0 2.3.4 3.2 1.2l2.4-2.4A8.5 8.5 0 0 0 4.6 8.1l2.8 2.2A4.9 4.9 0 0 1 12 6.9z",
  dress: "M9 3h6l-1 4 4 13H6l4-13zM9 3l3 3 3-3",
  note: "M5 4h14v16H5zM8 8h8M8 12h8M8 16h5",
} as const;

export function WhatsAppGlyph({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden focusable="false" fill="currentColor">
      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.3a.5.5 0 0 0 0-.5l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.2 2.2 2.2 0 0 0 .2-1.3c-.1-.1-.3-.2-.6-.3z" />
    </svg>
  );
}

export function useFlash(): [string | null, (k: string) => void] {
  const [flash, setFlash] = useState<string | null>(null);
  const t = useRef(0);
  useEffect(() => () => window.clearTimeout(t.current), []);
  return [
    flash,
    (k: string) => {
      setFlash(k);
      window.clearTimeout(t.current);
      t.current = window.setTimeout(() => setFlash(null), 2200);
    },
  ];
}

export function QrDialog({ url, onClose }: { url: string; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const qr = encodeQr(url, "medium");
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    ref.current?.querySelector<HTMLButtonElement>("button")?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      prev?.focus?.();
    };
  }, [onClose]);
  if (!qr || typeof document === "undefined") return null;
  const ext = qrExtent(qr, 2);
  return createPortal(
    <div className="cw-qr-scrim" role="presentation" onClick={onClose}>
      <div ref={ref} className="cw-qr" role="dialog" aria-modal="true" aria-label="QR code of the invitation" onClick={(e) => e.stopPropagation()}>
        <svg viewBox={`0 0 ${ext} ${ext}`} width="240" height="240" role="img" aria-label="Scan to open the invitation" shapeRendering="crispEdges">
          <rect width={ext} height={ext} fill="#fffdf8" />
          <path d={qrPath(qr, 2)} fill="#3b342c" />
        </svg>
        <p>Scan to open the invitation</p>
        <button type="button" className="cw-pill" onClick={onClose}>
          Close
        </button>
      </div>
    </div>,
    document.body,
  );
}

export interface ShareBarProps {
  variant: "hero" | "finale";
  shareText: string;
  couple: string;
  main?: WeddingEvent | null;
  events: readonly WeddingEvent[];
  card?: Omit<InviteCardInput, "url" | "root" | "qrHint">;
}

export default function ShareBar({ variant, shareText, couple, main, events, card }: ShareBarProps) {
  const [flash, setFlash] = useFlash();
  const [qr, setQr] = useState(false);
  const [busy, setBusy] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const canShare = typeof navigator !== "undefined" && typeof navigator.share === "function";
  const dated = events.filter((e) => e.date);

  const saveDates = (list: readonly WeddingEvent[], key: string) => {
    if (!list.length) return;
    const ok = downloadWeddingIcs(list, { couple, url: shareableUrl(), tz: DEFAULT_TZ_OFFSET }, list.length > 1 ? `wedding-${couple}` : `${list[0].title || "wedding"}-${couple}`);
    if (ok) setFlash(key);
  };
  const share = async () => {
    try {
      await navigator.share({ title: couple, text: shareText, url: shareableUrl() });
    } catch {
      /* the guest closed the sheet */
    }
  };
  const whatsapp = () => window.open(whatsappUrl(`${shareText}\n${shareableUrl()}`), "_blank", "noopener,noreferrer");
  const copy = async () => {
    if (await copyText(shareableUrl())) setFlash("copy");
  };
  const saveCard = async () => {
    if (!card || busy) return;
    setBusy(true);
    try {
      const blob = await drawInviteCard({ ...card, url: shareableUrl(), root: root.current, qrHint: "Scan to open the invitation" });
      if (blob) {
        await deliverCard(blob, `${couple.replace(/[^\p{L}\p{N}]+/gu, "-")}-invitation.png`);
        setFlash("card");
      }
    } finally {
      setBusy(false);
    }
  };

  if (variant === "hero") {
    return (
      <div ref={root} className="cw-share cw-share-hero">
        {main?.date && (
          <button type="button" className="cw-pill" onClick={() => saveDates([main], "date")}>
            <Icon d={flash === "date" ? ICON.check : ICON.cal} size={16} /> {flash === "date" ? "Saved" : "Save the date"}
          </button>
        )}
        <button type="button" className="cw-pill" onClick={canShare ? share : whatsapp}>
          {canShare ? <Icon d={ICON.share} size={16} /> : <WhatsAppGlyph size={16} />} Share
        </button>
      </div>
    );
  }

  return (
    <div ref={root} className="cw-share cw-share-finale">
      <button type="button" className="cw-btn cw-btn-wa" onClick={whatsapp}>
        <WhatsAppGlyph /> Send on WhatsApp
      </button>
      <div className="cw-share-row">
        {canShare && (
          <button type="button" className="cw-pill" onClick={share}>
            <Icon d={ICON.share} size={16} /> Share
          </button>
        )}
        <button type="button" className="cw-pill" onClick={copy} aria-live="polite">
          <Icon d={flash === "copy" ? ICON.check : ICON.link} size={16} /> {flash === "copy" ? "Link copied" : "Copy link"}
        </button>
        {card && (
          <button type="button" className="cw-pill" onClick={saveCard} disabled={busy} aria-busy={busy}>
            <Icon d={flash === "card" ? ICON.check : ICON.image} size={16} /> {busy ? "Making the card…" : flash === "card" ? "Saved" : "Invite card"}
          </button>
        )}
        <button type="button" className="cw-pill" onClick={() => setQr(true)}>
          <Icon d={ICON.qr} size={16} /> QR code
        </button>
        {dated.length > 0 && (
          <button type="button" className="cw-pill" onClick={() => saveDates(dated, "all")}>
            <Icon d={flash === "all" ? ICON.check : ICON.cal} size={16} /> {flash === "all" ? "Saved" : dated.length > 1 ? "Save all dates" : "Save the date"}
          </button>
        )}
      </div>
      {qr && <QrDialog url={shareableUrl()} onClose={() => setQr(false)} />}
    </div>
  );
}
