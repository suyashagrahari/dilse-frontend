"use client";

// ─── Share, save and show ───────────────────────────────────────────────────
//   "hero"   — Save the date (the main function's .ics) + Share
//   "finale" — WhatsApp, Share (OS sheet), Copy link, the invite card PNG,
//              QR, Save all dates
// The shared link never carries the guest's own ?to= greeting.
// (Pattern from garden-wedding-invitation/gw/ShareBar, restyled.)

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { DEFAULT_TZ_OFFSET, downloadWeddingIcs, type WeddingEvent } from "../../../_wedding";
import { encodeQr, qrExtent, qrPath } from "@/lib/share/qr";
import { copyText, shareableUrl, whatsappUrl } from "./guest";
import { deliverCard, drawInviteCard, type InviteCardInput } from "./inviteCard";
import type { Lang, Strings } from "../model";

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
  shirt: "M8 4 4 6.5l2 4 2-1V20h8V9.5l2 1 2-4L16 4c-.5 1.5-2 2.5-4 2.5S8.5 5.5 8 4z",
  replay: "M4 12a8 8 0 1 0 2.3-5.6M4 4v4.5h4.5",
  mic: "M12 15a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3zM6 11.5a6 6 0 0 0 12 0M12 17.5V21",
  upload: "M12 16V4M7.5 8.5 12 4l4.5 4.5M5 16v3a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-3",
  send: "M4 12 20 4l-6 16-3-7z",
} as const;

export function WhatsAppGlyph({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden focusable="false" fill="currentColor">
      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.3a.5.5 0 0 0 0-.5l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.2 2.2 2.2 0 0 0 .2-1.3c-.1-.1-.3-.2-.6-.3z" />
    </svg>
  );
}

function useFlash(): [string | null, (k: string) => void] {
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

export function QrDialog({ url, s, onClose }: { url: string; s: Strings; onClose: () => void }) {
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
    <div className="sc-qr-scrim" role="presentation" onClick={onClose}>
      <div ref={ref} className="sc-qr" role="dialog" aria-modal="true" aria-label={s.qr} onClick={(e) => e.stopPropagation()}>
        <svg viewBox={`0 0 ${ext} ${ext}`} width="240" height="240" role="img" aria-label={s.qrHint} shapeRendering="crispEdges">
          <rect width={ext} height={ext} fill="#fffdf6" />
          <path d={qrPath(qr, 2)} fill="#3d1a0f" />
        </svg>
        <p>{s.qrHint}</p>
        <button type="button" className="sc-pill" onClick={onClose}>
          {s.close}
        </button>
      </div>
    </div>,
    document.body,
  );
}

export interface ShareBarProps {
  variant: "hero" | "finale";
  s: Strings;
  lang: Lang;
  shareText: string;
  couple: string;
  main?: WeddingEvent;
  events: readonly WeddingEvent[];
  card?: Omit<InviteCardInput, "url" | "root" | "qrHint" | "together">;
}

export default function ShareBar({ variant, s, lang, shareText, couple, main, events, card }: ShareBarProps) {
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
      /* closed the sheet */
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
      const blob = await drawInviteCard({ ...card, url: shareableUrl(), root: root.current, qrHint: s.qrHint, together: s.together });
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
      <div ref={root} className="sc-share sc-share-hero">
        {main?.date && (
          <button type="button" className="sc-pill sc-pill-solid" onClick={() => saveDates([main], "date")} lang={lang}>
            <Icon d={flash === "date" ? ICON.check : ICON.cal} size={17} /> {flash === "date" ? s.saved : s.saveDate}
          </button>
        )}
        <button type="button" className="sc-pill" onClick={canShare ? share : whatsapp} lang={lang}>
          {canShare ? <Icon d={ICON.share} size={17} /> : <WhatsAppGlyph size={17} />} {s.share}
        </button>
      </div>
    );
  }

  return (
    <div ref={root} className="sc-share sc-share-finale">
      <button type="button" className="sc-btn sc-btn-wa" onClick={whatsapp} lang={lang}>
        <WhatsAppGlyph /> {s.whatsapp}
      </button>
      <div className="sc-share-row">
        {canShare && (
          <button type="button" className="sc-pill" onClick={share} lang={lang}>
            <Icon d={ICON.share} size={16} /> {s.share}
          </button>
        )}
        <button type="button" className="sc-pill" onClick={copy} lang={lang} aria-live="polite">
          <Icon d={flash === "copy" ? ICON.check : ICON.link} size={16} /> {flash === "copy" ? s.copied : s.copy}
        </button>
        {card && (
          <button type="button" className="sc-pill" onClick={saveCard} disabled={busy} aria-busy={busy} lang={lang}>
            <Icon d={flash === "card" ? ICON.check : ICON.image} size={16} /> {busy ? s.cardMaking : flash === "card" ? s.saved : s.card}
          </button>
        )}
        <button type="button" className="sc-pill" onClick={() => setQr(true)} lang={lang}>
          <Icon d={ICON.qr} size={16} /> {s.qr}
        </button>
        {dated.length > 0 && (
          <button type="button" className="sc-pill" onClick={() => saveDates(dated, "all")} lang={lang}>
            <Icon d={flash === "all" ? ICON.check : ICON.cal} size={16} /> {flash === "all" ? s.saved : dated.length > 1 ? s.saveAll : s.saveDate}
          </button>
        )}
      </div>
      {qr && <QrDialog url={shareableUrl()} s={s} onClose={() => setQr(false)} />}
    </div>
  );
}
