"use client";

// ─── Sharing, calendar, contacts, shagun, live: the guest's practical bits ───
// WhatsApp goes straight to wa.me (the button guests look for); "Share" uses the
// phone's own sheet when there is one. Every link carries the guest's ?to= name,
// so a forwarded copy greets the same family.

import { useEffect, useState, type ReactNode } from "react";
import { DEFAULT_TZ_OFFSET, eventEnd, eventStart, type WeddingEvent } from "../../_wedding";
import { drawInviteCard, type InviteCardInput } from "../lib/inviteCard";
import { displayPhone, normalisePhone, type Contact } from "../lib/model";

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
export const QR = "M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h2v2h-2zM18 14h2v2h-2zM14 18h2v2h-2zM18 18h2v2h-2zM16 16h2v2h-2z";
export const PLAY = "M8 5.5v13l11-6.5z";
export const SHIRT = "M8 3l-5 3 2 4 2-1v12h10V9l2 1 2-4-5-3a4 4 0 0 1-8 0z";
export const HEART = "M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z";
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

export function Btn({ onClick, href, icon, fill, children, kind, small, label, newTab = true }: { onClick?: () => void; href?: string; icon?: string; fill?: boolean; children: ReactNode; kind?: "ghost" | "blush"; small?: boolean; label?: string; newTab?: boolean }) {
  const cls = `c2-btn${kind ? ` is-${kind}` : ""}${small ? " is-sm" : ""}`;
  const inner = (
    <>
      {icon && <Icon d={icon} fill={fill} />}
      <span>{children}</span>
    </>
  );
  if (href)
    return (
      <a className={cls} href={href} {...(newTab ? { target: "_blank", rel: "noopener noreferrer" } : {})} aria-label={label}>
        {inner}
      </a>
    );
  return (
    <button type="button" className={cls} onClick={onClick} aria-label={label}>
      {inner}
    </button>
  );
}

// ── The share bar: WhatsApp · Share · Copy · Download card ──────────────────

export function ShareBar({ shareText, card }: { shareText: string; card: InviteCardInput }) {
  const [flash, setFlash] = useFlash();
  const [busy, setBusy] = useState(false);
  const [canShare, setCanShare] = useState(false);
  const [qr, setQr] = useState<{ d: string; n: number } | null>(null);
  const [qrOpen, setQrOpen] = useState(false);
  const toggleQr = async () => {
    if (qrOpen) return setQrOpen(false);
    setQrOpen(true);
    if (qr) return;
    // The encoder loads only when a guest asks for the code.
    const { encodeQr, qrPath, qrExtent } = await import("@/lib/share/qr");
    const m = encodeQr(pageUrl(), "medium");
    if (m) setQr({ d: qrPath(m, 2), n: qrExtent(m, 2) });
  };
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
      a.download = `${card.first}-${card.second}-wedding-invitation.png`.replace(/[^\w.-]+/g, "-");
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

  return (
    <div className="c2-sharebar">
      <Btn icon={WA} fill onClick={() => openWhatsApp(shareText)}>
        WhatsApp
      </Btn>
      {canShare && (
        <Btn icon={SHARE} kind="ghost" onClick={() => void navigator.share({ title: shareText, text: shareText, url: pageUrl() }).catch(() => undefined)}>
          Share
        </Btn>
      )}
      <Btn icon={LINK} kind="ghost" onClick={() => void copyText(pageUrl()).then((ok) => setFlash(ok ? "copy" : "copy-err"))}>
        {flash === "copy" ? "Link copied ✓" : "Copy link"}
      </Btn>
      <Btn icon={DOWN} kind="ghost" onClick={() => void download()}>
        {busy ? "Drawing the card…" : flash === "card" ? "Card saved ✓" : flash === "card-err" ? "Try again" : "Invitation card"}
      </Btn>
      <Btn icon={QR} kind="ghost" onClick={() => void toggleQr()} label={qrOpen ? "Hide the QR code" : "Show a QR code for this invitation"}>
        {qrOpen ? "Hide QR" : "QR code"}
      </Btn>
      {qrOpen && (
        <div className="c2-card c2-qr" role="figure" aria-label="QR code for this invitation">
          {qr ? (
            <svg viewBox={`0 0 ${qr.n} ${qr.n}`} width="184" height="184" shapeRendering="crispEdges" aria-hidden>
              <rect width={qr.n} height={qr.n} fill="#fff" />
              <path d={qr.d} fill="#34503b" />
            </svg>
          ) : (
            <span className="c2-qr-wait" aria-hidden />
          )}
          <p>Scan to open the invitation — handy for grandparents on another phone.</p>
        </div>
      )}
    </div>
  );
}

// ── Family contacts: tap to call, tap to WhatsApp ───────────────────────────

export function Contacts({ list, couple }: { list: Contact[]; couple: string }) {
  const rows = list.map((c) => ({ ...c, digits: normalisePhone(c.phone) })).filter((c) => c.name && c.digits);
  if (!rows.length) return null;
  return (
    <ul className="c2-contacts">
      {rows.map((c, i) => (
        <li key={i} className="c2-card c2-contact">
          <span className="c2-contact-ini" aria-hidden>
            {c.name.slice(0, 1).toUpperCase()}
          </span>
          <span className="c2-contact-t">
            <b>{c.name}</b>
            {c.relation && <small>{c.relation}</small>}
            <small>{displayPhone(c.digits)}</small>
          </span>
          <span className="c2-contact-a">
            <a className="c2-round" href={`tel:+${c.digits}`} aria-label={`Call ${c.name}`}>
              <Icon d={PHONE} size={18} />
            </a>
            <a className="c2-round is-wa" href={`https://wa.me/${c.digits}?text=${encodeURIComponent(`Hello ${c.name}, about the wedding of ${couple}: `)}`} target="_blank" rel="noopener noreferrer" aria-label={`WhatsApp ${c.name}`}>
              <Icon d={WA} size={18} fill />
            </a>
          </span>
        </li>
      ))}
    </ul>
  );
}

// ── Shagun (UPI), off unless the couple adds an id ──────────────────────────

export function Shagun({ upiId, upiName }: { upiId: string; upiName: string }) {
  const [flash, setFlash] = useFlash();
  const href = `upi://pay?pa=${encodeURIComponent(upiId)}${upiName ? `&pn=${encodeURIComponent(upiName)}` : ""}&cu=INR`;
  return (
    <div className="c2-card c2-shagun">
      <p className="c2-p" style={{ fontSize: 19 }}>
        Your presence and prayers are the greatest gift. If you would still like to bless the couple, you may do so here.
      </p>
      {upiName && <b>{upiName}</b>}
      <code>{upiId}</code>
      <div className="c2-sharebar">
        <a className="c2-btn" href={href}>
          Pay with UPI
        </a>
        <button type="button" className="c2-btn is-ghost" onClick={() => void copyText(upiId).then((ok) => setFlash(ok ? "ok" : "err"))}>
          {flash === "ok" ? "Copied ✓" : "Copy UPI ID"}
        </button>
      </div>
      <p className="c2-small" style={{ margin: 0 }}>
        Paid directly to the couple through your UPI app; this page never handles money.
      </p>
    </div>
  );
}

// ── Livestream: live from 30 minutes before the ceremony until it ends ──────

export function LiveStream({ url, main }: { url: string; main?: WeddingEvent }) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const t = window.setInterval(tick, 30_000);
    return () => window.clearInterval(t);
  }, []);
  const start = main?.date ? eventStart(main.date, main.time || "00:00", DEFAULT_TZ_OFFSET) : null;
  const end = main ? eventEnd(main) : null;
  const on = !start || (now !== null && now >= start.getTime() - 30 * 60_000 && (!end || now <= end.getTime() + 60 * 60_000));
  return (
    <div className="c2-card c2-live">
      <span className={`c2-live-dot${on ? " is-on" : ""}`} aria-hidden />
      {on ? (
        <a className="c2-btn is-blush" href={url} target="_blank" rel="noopener noreferrer">
          <Icon d={PLAY} fill /> <span>Watch the ceremony live</span>
        </a>
      ) : (
        <p className="c2-p" style={{ fontSize: 19 }}>
          Can&apos;t be there? The live stream opens here 30 minutes before the ceremony.
        </p>
      )}
    </div>
  );
}
