"use client";

// ─── Sharing, calendar, contacts, shagun, live: the guest's practical bits ───
// WhatsApp goes straight to wa.me (the button guests look for); "Share" uses
// the phone's own sheet when there is one. Every link the guest sees carries
// their ?to= name, so a forwarded copy greets the same family.

import { useEffect, useState, type ReactNode } from "react";
import { DEFAULT_TZ_OFFSET, Reveal, downloadWeddingIcs, eventEnd, eventStart, type WeddingEvent } from "../../_wedding";
import { drawInviteCard, type InviteCardInput } from "./inviteCard";
import { displayPhone, normalisePhone } from "./model";
import type { Strings } from "./strings";
import type { Contact } from "./types";

export function Icon({ d, size = 16, fill = false }: { d: string; size?: number; fill?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill ? "currentColor" : "none"} stroke={fill ? "none" : "currentColor"} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={d} />
    </svg>
  );
}
export const PIN = "M12 21s-7-6.1-7-11.5A7 7 0 0 1 19 9.5C19 14.9 12 21 12 21zM12 12.2a2.6 2.6 0 1 0 0-5.2 2.6 2.6 0 0 0 0 5.2z";
export const CAL = "M7 3v3M17 3v3M4 8.5h16M5 5.5h14a1 1 0 0 1 1 1V19a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6.5a1 1 0 0 1 1-1zM8.5 13h3v3h-3z";
export const CLOCK = "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7.5V12l3 2";
export const PHONE = "M5 4h3.5l1.6 4-2.2 1.4a11 11 0 0 0 6.7 6.7l1.4-2.2 4 1.6V19a1.5 1.5 0 0 1-1.6 1.5A16.5 16.5 0 0 1 3.5 5.6 1.5 1.5 0 0 1 5 4z";
export const LINK = "M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1 1M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1-1";
export const DOWN = "M12 4v11M7 10.5l5 5 5-5M5 20h14";
export const SHARE = "M12 15V4M8 8l4-4 4 4M6 12v7a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-7";
export const PLAY = "M8 5.5v13l11-6.5z";
export const HEART = "M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z";
export const QR = "M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h2v2h-2zM18 14h2v2h-2zM14 18h2v2h-2zM18 18h2v2h-2zM6.5 6.5h1v1h-1zM16.5 6.5h1v1h-1zM6.5 16.5h1v1h-1z";
export const WA =
  "M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.3a.5.5 0 0 0 0-.5l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.2 2.2 2.2 0 0 0 .2-1.3c-.1-.1-.3-.2-.6-.3z";

/** The page URL as the guest has it (their ?to= kept, the #hash dropped). */
export function pageUrl(): string {
  if (typeof window === "undefined") return "";
  return window.location.href.split("#")[0];
}

export function openWhatsApp(text: string, url = pageUrl()) {
  window.open(`https://wa.me/?text=${encodeURIComponent(url ? `${text}\n${url}` : text)}`, "_blank", "noopener,noreferrer");
}

export async function copyText(t: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(t);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = t;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      ta.remove();
      return ok;
    } catch {
      return false;
    }
  }
}

export function useFlash(ms = 2200) {
  const [flash, setFlash] = useState<string | null>(null);
  useEffect(() => {
    if (!flash) return;
    const t = window.setTimeout(() => setFlash(null), ms);
    return () => window.clearTimeout(t);
  }, [flash, ms]);
  return [flash, setFlash] as const;
}

export function Btn({ onClick, href, icon, fill, children, ghost, label, className, disabled }: { onClick?: () => void; href?: string; icon?: string; fill?: boolean; children: ReactNode; ghost?: boolean; label?: string; className?: string; disabled?: boolean }) {
  const cls = `rc-btn${ghost ? " is-ghost" : ""}${className ? ` ${className}` : ""}`;
  if (href)
    return (
      <a className={cls} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}>
        {icon && <Icon d={icon} fill={fill} />} <span>{children}</span>
      </a>
    );
  return (
    <button type="button" className={cls} onClick={onClick} aria-label={label} disabled={disabled}>
      {icon && <Icon d={icon} fill={fill} />} <span>{children}</span>
    </button>
  );
}

/** Save every dated part of the evening to the phone's calendar. */
export function SaveDates({ events, couple, s, ghost }: { events: WeddingEvent[]; couple: string; s: Strings; ghost?: boolean }) {
  const [flash, setFlash] = useFlash();
  const dated = events.filter((e) => e.date);
  if (!dated.length) return null;
  return (
    <Btn icon={CAL} ghost={ghost} onClick={() => setFlash(downloadWeddingIcs(dated, { couple, url: pageUrl(), tz: DEFAULT_TZ_OFFSET }, `reception-${couple}`) ? "ok" : "err")}>
      {flash === "ok" ? "Saved ✓" : dated.length > 1 ? s.saveAll : s.saveDate}
    </Btn>
  );
}

// ── The share bar: WhatsApp · Share · Copy · Invitation card · QR ───────────

export function ShareBar({ s, shareText, card }: { s: Strings; shareText: string; card: InviteCardInput }) {
  const [flash, setFlash] = useFlash();
  const [busy, setBusy] = useState(false);
  const [canShare, setCanShare] = useState(false);
  const [qr, setQr] = useState<string | null>(null);
  useEffect(() => {
    // navigator.share only exists in the browser; read it after mount.
    setCanShare(typeof navigator !== "undefined" && typeof navigator.share === "function");
  }, []);

  const download = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const blob = await drawInviteCard(card);
      if (!blob) throw new Error("no card");
      const a = document.createElement("a");
      const href = URL.createObjectURL(blob);
      a.href = href;
      a.download = `${card.first}-${card.second}-reception-invitation.png`.replace(/[^\w.-]+/g, "-");
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.setTimeout(() => URL.revokeObjectURL(href), 4000);
      setFlash("card");
    } catch {
      setFlash("card-err");
    } finally {
      setBusy(false);
    }
  };

  const showQr = async () => {
    if (qr) return setQr(null);
    try {
      const { qrToPngDataUrl } = await import("@/lib/share/qrPng");
      setQr(await qrToPngDataUrl(pageUrl(), { size: 360, dark: "#3A2A1C", light: "#FFFDF8" }));
    } catch {
      setFlash("qr-err");
    }
  };

  return (
    <div className="rc-sharebar">
      <div className="rc-sharebar-row">
        <Btn icon={WA} fill onClick={() => openWhatsApp(shareText)} className="is-wa">
          {s.whatsapp}
        </Btn>
        {canShare && (
          <Btn icon={SHARE} ghost onClick={() => void navigator.share({ title: shareText, text: shareText, url: pageUrl() }).catch(() => undefined)}>
            {s.shareMore}
          </Btn>
        )}
        <Btn icon={LINK} ghost onClick={() => void copyText(pageUrl()).then((ok) => setFlash(ok ? "copy" : "copy-err"))}>
          {flash === "copy" ? `${s.copied} ✓` : s.copy}
        </Btn>
        <Btn icon={DOWN} ghost onClick={() => void download()}>
          {busy ? s.cardBusy : flash === "card" ? "Downloaded ✓" : flash === "card-err" ? "Try again" : s.card}
        </Btn>
        <Btn icon={QR} ghost onClick={() => void showQr()}>
          {s.qr}
        </Btn>
      </div>
      {qr && (
        <div className="rc-qr">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qr} alt="QR code for this invitation" width={180} height={180} />
          <p>Scan to open the invitation</p>
        </div>
      )}
      <p className="rc-sr" aria-live="polite">
        {flash === "copy" ? "Link copied" : ""}
      </p>
    </div>
  );
}

// ── Family contacts: tap to call, tap to WhatsApp ───────────────────────────

export function Contacts({ list, s, couple }: { list: Contact[]; s: Strings; couple: string }) {
  const rows = list.map((c) => ({ ...c, digits: normalisePhone(c.phone) })).filter((c) => c.name && c.digits);
  if (!rows.length) return null;
  return (
    <ul className="rc-contacts">
      {rows.map((c, i) => (
        <Reveal as="li" key={i} className="rc-contact" delay={i * 80}>
          <span className="rc-contact-ini" aria-hidden>
            {c.name.slice(0, 1).toUpperCase()}
          </span>
          <span className="rc-contact-t">
            <b>{c.name}</b>
            {c.relation && <small>{c.relation}</small>}
            <small className="rc-contact-no">{displayPhone(c.digits)}</small>
          </span>
          <span className="rc-contact-a">
            <a className="rc-round" href={`tel:+${c.digits}`} aria-label={`${s.call} ${c.name}`}>
              <Icon d={PHONE} size={18} />
            </a>
            <a className="rc-round is-wa" href={`https://wa.me/${c.digits}?text=${encodeURIComponent(`Hello ${c.name}, about the reception of ${couple}: `)}`} target="_blank" rel="noopener noreferrer" aria-label={`WhatsApp ${c.name}`}>
              <Icon d={WA} size={18} fill />
            </a>
          </span>
        </Reveal>
      ))}
    </ul>
  );
}

// ── Shagun (UPI), off unless the couple adds an id ──────────────────────────

export function Shagun({ upiId, upiName, s }: { upiId: string; upiName: string; s: Strings }) {
  const [flash, setFlash] = useFlash();
  const href = `upi://pay?pa=${encodeURIComponent(upiId)}${upiName ? `&pn=${encodeURIComponent(upiName)}` : ""}&cu=INR`;
  return (
    <div className="rc-shagun">
      <p className="rc-shagun-p">{s.shagunIntro}</p>
      <p className="rc-shagun-id">
        {upiName && <b>{upiName}</b>}
        <code>{upiId}</code>
      </p>
      <div className="rc-shagun-a">
        <a className="rc-btn rc-upi-pay" href={href}>
          <span>{s.upiPay}</span>
        </a>
        <button type="button" className="rc-btn is-ghost" onClick={() => void copyText(upiId).then((ok) => setFlash(ok ? "ok" : "err"))}>
          <span>{flash === "ok" ? "Copied ✓" : s.upiCopy}</span>
        </button>
      </div>
    </div>
  );
}

// ── Livestream: live from 30 minutes before the main event until it ends ────

export function LiveStream({ url, main, s }: { url: string; main?: WeddingEvent; s: Strings }) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const t = window.setInterval(tick, 30_000);
    return () => window.clearInterval(t);
  }, []);
  const start = main?.date ? eventStart(main.date, main.time || "00:00") : null;
  const end = main ? eventEnd(main) : null;
  const on = !start || (now !== null && now >= start.getTime() - 30 * 60_000 && (!end || now <= end.getTime() + 60 * 60_000));
  return (
    <div className="rc-live">
      <span className={`rc-live-dot${on ? " is-on" : ""}`} aria-hidden />
      {on ? (
        <a className="rc-btn" href={url} target="_blank" rel="noopener noreferrer">
          <Icon d={PLAY} fill /> <span>{s.live}</span>
        </a>
      ) : (
        <p className="rc-live-soon">{s.liveSoon}</p>
      )}
    </div>
  );
}
