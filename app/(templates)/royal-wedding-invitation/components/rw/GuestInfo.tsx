"use client";

// ─── For our guests: good to know, getting there, who to call, shagun, live ──
// Indian guests call an uncle, not a form: every contact is a tap-to-call and
// a WhatsApp button (44px targets). Shagun is optional and off by default: a
// upi:// link on phones plus a copyable id (we never touch the payment). The
// livestream button lights up from 30 minutes before the main function until
// it ends; before that it says when it opens.

import { useEffect, useState } from "react";
import { DEFAULT_TZ_OFFSET, Reveal, eventEnd, eventStart, type WeddingEvent } from "../../../_wedding";
import type { RwContactRow, Strings } from "./model";

function Icon({ d, size = 18 }: { d: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={d} />
    </svg>
  );
}
const PHONE = "M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z";
const WA = "M3 21l1.6-4.7A8.5 8.5 0 1 1 8 19.6L3 21zM9 8.5c0 3.5 3 6.5 6.5 6.5l1.2-1.6-2.2-1-1 .8a5 5 0 0 1-2.7-2.7l.8-1-1-2.2L9 8.5z";
const COPY = "M9 9h10v10H9zM5 15V5h10";
const LIVE = "M4 7h11a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2zM17 10.5l5-3v9l-5-3";

export function Contacts({ contacts, s, couple }: { contacts: RwContactRow[]; s: Strings; couple: string }) {
  if (!contacts.length) return null;
  return (
    <ul className="rw-contacts">
      {contacts.map((c, i) => (
        <Reveal as="li" key={i} className="rw-contact" delay={i * 80}>
          <span className="rw-contact-ini" aria-hidden>
            {c.name.trim().charAt(0).toUpperCase()}
          </span>
          <span className="rw-contact-who">
            <b>{c.name}</b>
            {c.relation && <small>{c.relation}</small>}
          </span>
          <span className="rw-contact-acts">
            <a className="rw-round" href={`tel:${c.tel}`} aria-label={`${s.call} ${c.name}`}>
              <Icon d={PHONE} />
            </a>
            <a
              className="rw-round is-wa"
              href={`https://wa.me/${c.wa}?text=${encodeURIComponent(`Namaste ${c.name.split(" ")[0]}, about the wedding of ${couple}: `)}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${s.chat} ${c.name}`}
            >
              <Icon d={WA} />
            </a>
          </span>
        </Reveal>
      ))}
    </ul>
  );
}

export function Shagun({ upiId, upiName, couple, s }: { upiId: string; upiName: string; couple: string; s: Strings }) {
  const [copied, setCopied] = useState(false);
  if (!upiId) return null;
  const pay = `upi://pay?${new URLSearchParams({ pa: upiId, pn: upiName || couple, tn: `Shagun for ${couple}`, cu: "INR" }).toString()}`;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(upiId);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {}
  };
  return (
    <Reveal className="rw-shagun wk-paper">
      <p className="rw-shagun-line">{s.shagunLine}</p>
      <p className="rw-shagun-id">
        <span>{upiId}</span>
        {upiName && <small>{upiName}</small>}
      </p>
      <div className="rw-shagun-acts">
        <a className="rw-btn rw-btn-gold rw-only-touch" href={pay}>
          {s.pay}
        </a>
        <button type="button" className="rw-btn rw-btn-ghost" onClick={copy} aria-live="polite">
          <Icon d={COPY} size={16} /> {copied ? s.copied : s.copy}
        </button>
      </div>
    </Reveal>
  );
}

/** "Watch live": enabled from 30 minutes before the main function's start until its end. */
export function LiveButton({ url, main, s }: { url: string; main: WeddingEvent | undefined; s: Strings }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(t);
  }, []);
  if (!url) return null;
  const start = main ? eventStart(main.date, main.time, DEFAULT_TZ_OFFSET) : null;
  const end = main ? eventEnd(main, DEFAULT_TZ_OFFSET) : null;
  const openAt = start ? start.getTime() - 30 * 60_000 : 0;
  const live = !start || (now >= openAt && (!end || now <= end.getTime() + 60 * 60_000));
  return (
    <Reveal className="rw-live">
      {live ? (
        <a className="rw-btn rw-btn-gold rw-live-btn" href={url} target="_blank" rel="noopener noreferrer">
          <span className="rw-live-dot" aria-hidden />
          <Icon d={LIVE} /> {s.live}
        </a>
      ) : (
        <p className="rw-live-soon">
          <Icon d={LIVE} /> {s.liveSoon}
        </p>
      )}
    </Reveal>
  );
}

export function GoodToKnow({ things, gettingThere, s, lang }: { things: { head: string; text: string }[]; gettingThere: string; s: Strings; lang: "en" | "hi" }) {
  if (!things.length && !gettingThere) return null;
  return (
    <ul className="rw-know">
      {things.map((t, i) => (
        <Reveal as="li" key={i} className="rw-know-i" delay={(i % 3) * 80}>
          {t.head && <p className="rw-know-h">{t.head}</p>}
          <p className="rw-know-t">{t.text}</p>
        </Reveal>
      ))}
      {gettingThere && (
        <Reveal as="li" className="rw-know-i rw-know-wide" delay={80}>
          <p className="rw-know-h" lang={lang}>
            {s.gettingThere}
          </p>
          <p className="rw-know-t">{gettingThere}</p>
        </Reveal>
      )}
    </ul>
  );
}
