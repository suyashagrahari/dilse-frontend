"use client";

// ─── For our guests: good to know, who to call, shagun, the live stream ─────
// Notes are small tags of the stationery suite. Contacts are cards with a
// tap-to-call and a WhatsApp button (Indian guests call an uncle, not a
// form). Shagun is off unless the sender adds a UPI id: upi://pay on phones,
// a copyable id everywhere. "Watch live" opens from 30 minutes before the
// main function until it ends (it re-checks every minute).

import { useEffect, useState } from "react";
import { Reveal, eventEnd, eventStart, type WeddingEvent } from "../_wedding";
import { copyText } from "./guest";
import { WaGlyph } from "./Events";
import type { FwContact } from "./model";
import type { Lang, Strings } from "./types";

function useLiveOpen(main: WeddingEvent | undefined): boolean {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(t);
  }, []);
  if (!main?.date) return true;
  const start = eventStart(main.date, main.time || "00:00");
  const end = eventEnd(main) ?? (start ? new Date(start.getTime() + 6 * 3600_000) : null);
  if (!start || !end) return true;
  return now >= start.getTime() - 30 * 60_000 && now <= end.getTime() + 2 * 3600_000;
}

export interface GuestsProps {
  s: Strings;
  lang: Lang;
  things: { head: string; text: string }[];
  contacts: FwContact[];
  upi: { id: string; name: string } | null;
  liveUrl: string;
  main: WeddingEvent | undefined;
  couple: string;
}

export default function Guests({ s, lang, things, contacts, upi, liveUrl, main, couple }: GuestsProps) {
  const liveOpen = useLiveOpen(main);
  const [copied, setCopied] = useState(false);
  const upiHref = upi ? `upi://pay?pa=${encodeURIComponent(upi.id)}&pn=${encodeURIComponent(upi.name || couple)}&cu=INR&tn=${encodeURIComponent(`Shagun · ${couple}`)}` : "";
  return (
    <div className="fw-guests">
      {things.length > 0 && (
        <ul className="fw-know">
          {things.map((t, i) => (
            <Reveal as="li" key={i} className="fw-tag fw-fold" delay={(i % 3) * 90}>
              <span className="fw-tag-hole" aria-hidden />
              {t.head && <p className="fw-tag-h">{t.head}</p>}
              <p className="fw-tag-t">{t.text}</p>
            </Reveal>
          ))}
        </ul>
      )}

      {contacts.length > 0 && (
        <Reveal className="fw-contacts">
          <p className="fw-sub-h" lang={lang}>
            {s.contacts}
          </p>
          <p className="fw-sub-p" lang={lang}>
            {s.contactsIntro}
          </p>
          <ul className="fw-contact-list">
            {contacts.map((c, i) => (
              <li key={i} className="fw-contact">
                <span className="fw-contact-ini" aria-hidden>
                  {c.name.slice(0, 1).toUpperCase()}
                </span>
                <span className="fw-contact-t">
                  <b>{c.name}</b>
                  {c.relation && <small>{c.relation}</small>}
                </span>
                <a className="fw-chip fw-chip-icon" href={`tel:${c.tel}`} aria-label={`${s.call} ${c.name} (${c.display})`}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M5 4h3.5l1.6 4.2-2.2 1.4a11 11 0 0 0 6.5 6.5l1.4-2.2L20 15.5V19a1.5 1.5 0 0 1-1.6 1.5A16 16 0 0 1 3.5 5.6 1.5 1.5 0 0 1 5 4z" />
                  </svg>
                </a>
                <a className="fw-chip fw-chip-icon" href={`https://wa.me/${c.wa}`} target="_blank" rel="noopener noreferrer" aria-label={`${s.whatsapp} ${c.name}`}>
                  <WaGlyph />
                </a>
              </li>
            ))}
          </ul>
        </Reveal>
      )}

      {(upi || liveUrl) && (
        <div className="fw-extras">
          {liveUrl && (
            <Reveal className="fw-extra" delay={60}>
              <p className="fw-sub-h" lang={lang}>
                <span className="fw-live-dot" aria-hidden /> {s.live}
              </p>
              <p className="fw-sub-p" lang={lang}>
                {s.liveIntro}
              </p>
              {liveOpen ? (
                <a className="wk-btn fw-btn" href={liveUrl} target="_blank" rel="noopener noreferrer" lang={lang}>
                  {s.live}
                </a>
              ) : (
                <p className="fw-extra-note" lang={lang}>
                  {s.liveSoon}
                </p>
              )}
            </Reveal>
          )}
          {upi && (
            <Reveal className="fw-extra" delay={120}>
              <p className="fw-sub-h" lang={lang}>
                {s.shagun}
              </p>
              <p className="fw-sub-p" lang={lang}>
                {s.shagunIntro}
              </p>
              <p className="fw-upi">
                <code>{upi.id}</code>
                {upi.name && <small>{upi.name}</small>}
              </p>
              <div className="fw-extra-actions">
                <a className="wk-btn fw-btn fw-upi-pay" href={upiHref} lang={lang}>
                  {s.payUpi}
                </a>
                <button
                  type="button"
                  className="fw-chip"
                  onClick={async () => {
                    if (await copyText(upi.id)) {
                      setCopied(true);
                      window.setTimeout(() => setCopied(false), 2000);
                    }
                  }}
                  lang={lang}
                >
                  {copied ? "✓" : s.copyUpi}
                </button>
              </div>
            </Reveal>
          )}
        </div>
      )}
    </div>
  );
}
