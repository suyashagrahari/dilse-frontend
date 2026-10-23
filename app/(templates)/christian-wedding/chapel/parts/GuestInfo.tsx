"use client";

// ─── For our guests: good to know, getting there, who to call, livestream, gift
// Elders call a person, not a form: each contact is two big buttons (call and
// WhatsApp). The livestream link wakes 30 minutes before the ceremony and
// sleeps three hours after it. The gift (UPI) block is optional, off by
// default, worded politely, and never handled by us.

import { useState } from "react";
import { Reveal, eventStart, formatEventTime, type WeddingEvent } from "../../../_wedding";
import { useNowSeconds } from "../../../_wedding";
import { phoneOf, type CwData } from "../model";
import { copyText, whatsappUrl } from "./guest";
import { Heading } from "./Blocks";
import { ICON, Icon, WhatsAppGlyph } from "./ShareBar";

function LiveButton({ url, main }: { url: string; main: WeddingEvent | null }) {
  const now = useNowSeconds();
  const start = main?.date ? eventStart(main.date, main.time) : null;
  const opens = start ? start.getTime() - 30 * 60_000 : 0;
  const closes = start ? start.getTime() + 3 * 3600_000 : 0;
  const t = now * 1000;
  const on = !start || (t >= opens && t <= closes);
  const after = !!start && t > closes;
  return (
    <Reveal className="cw-live">
      <span className={`cw-live-dot${on && !after ? " is-on" : ""}`} aria-hidden />
      <div className="cw-live-copy">
        <b>Watch the ceremony live</b>
        <small>{after ? "The livestream has ended — thank you for joining us." : on ? "We are live now" : `The stream opens 30 minutes before ${main?.time ? formatEventTime(main.time, "en-IN") : "the service"}`}</small>
      </div>
      {on && !after ? (
        <a className="cw-btn cw-btn-sm" href={url} target="_blank" rel="noopener noreferrer">
          <Icon d={ICON.live} size={16} /> Watch live
        </a>
      ) : (
        <span className="cw-btn cw-btn-sm is-off" aria-disabled="true">
          <Icon d={ICON.live} size={16} /> {after ? "Ended" : "Soon"}
        </span>
      )}
    </Reveal>
  );
}

export default function GuestInfo({ m, main, couple }: { m: CwData; main: WeddingEvent | null; couple: string }) {
  const [copied, setCopied] = useState(false);
  const contacts = m.contacts.map((c) => ({ ...c, p: phoneOf(c.phone) })).filter((c) => c.name.trim() && c.p);
  const things = m.things.filter((t) => t.text.trim());
  const live = /^https:\/\//i.test(m.liveUrl) ? m.liveUrl : "";
  const upi = m.upiId.trim();
  if (!things.length && !m.gettingThere.trim() && !contacts.length && !live && !upi) return null;
  const upiLink = upi ? `upi://pay?pa=${encodeURIComponent(upi)}${m.upiName ? `&pn=${encodeURIComponent(m.upiName)}` : ""}&tn=${encodeURIComponent(`Wedding gift · ${couple}`)}&cu=INR` : "";
  return (
    <section className="cw-sec cw-info" id="good-to-know" aria-labelledby="cw-info-h">
      <Heading eyebrow="For our guests" title="Good to know" id="cw-info-h" />
      {(things.length > 0 || m.gettingThere.trim()) && (
        <ul className="cw-know">
          {things.map((t, i) => (
            <Reveal as="li" key={i} className="cw-know-i" delay={(i % 3) * 70}>
              {t.head && <p className="cw-know-h">{t.head}</p>}
              <p className="cw-know-t">{t.text}</p>
            </Reveal>
          ))}
          {m.gettingThere.trim() && (
            <Reveal as="li" className="cw-know-i is-travel">
              <p className="cw-know-h">Getting there</p>
              <p className="cw-know-t">{m.gettingThere}</p>
            </Reveal>
          )}
        </ul>
      )}

      {live && <LiveButton url={live} main={main} />}

      {contacts.length > 0 && (
        <Reveal className="cw-contacts">
          <h3 className="cw-h3">Questions? Call us</h3>
          <ul className="cw-contact-list">
            {contacts.map((c, i) => (
              <li key={i} className="cw-contact">
                <span className="cw-contact-ini" aria-hidden>
                  {c.name.trim().charAt(0).toUpperCase()}
                </span>
                <span className="cw-contact-who">
                  <b>{c.name}</b>
                  {c.relation && <small>{c.relation}</small>}
                </span>
                <span className="cw-contact-btns">
                  <a className="cw-pill" href={`tel:${c.p!.tel}`} aria-label={`Call ${c.name}`}>
                    <Icon d={ICON.phone} size={16} /> Call
                  </a>
                  <a className="cw-pill is-wa" href={whatsappUrl(`Hello ${c.name}, about ${couple}'s wedding: `, c.p!.wa)} target="_blank" rel="noopener noreferrer" aria-label={`WhatsApp ${c.name}`}>
                    <WhatsAppGlyph size={16} /> Chat
                  </a>
                </span>
              </li>
            ))}
          </ul>
        </Reveal>
      )}

      {upi && (
        <Reveal className="cw-gift">
          <p className="cw-eyebrow">A gift, if you wish</p>
          <p className="cw-gift-p">Your presence is the greatest gift. If you would like to bless us with something more, you can send it here.</p>
          <p className="cw-gift-id">
            <b>{upi}</b>
            {m.upiName && <small>{m.upiName}</small>}
          </p>
          <div className="cw-gift-btns">
            <a className="cw-btn cw-btn-sm cw-gift-pay" href={upiLink}>
              <Icon d={ICON.rupee} size={16} /> Pay with UPI
            </a>
            <button
              type="button"
              className="cw-pill"
              onClick={async () => {
                if (await copyText(upi)) {
                  setCopied(true);
                  window.setTimeout(() => setCopied(false), 2000);
                }
              }}
            >
              <Icon d={copied ? ICON.check : ICON.copy} size={15} /> {copied ? "Copied" : "Copy UPI ID"}
            </button>
          </div>
        </Reveal>
      )}
    </section>
  );
}
