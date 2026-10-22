"use client";

// ─── Garden notes: good to know, the family to call, and shagun ─────────────
// Research P0 #7: Indian guests call an uncle, not a form, so each contact is
// two big buttons (tel: and WhatsApp). P1 #11: shagun stays optional and off
// by default; when the sender adds a UPI id it is offered politely, as a
// upi:// link on phones and a copyable id everywhere. We never handle money.

import { useState } from "react";
import { Reveal } from "../../../_wedding";
import { GW, gwImg } from "../assets";
import { copyText, whatsappUrl } from "./guest";
import type { GwContact, Strings } from "./model";
import { ICON, Icon, WhatsAppGlyph } from "./ShareBar";

export interface NotesProps {
  s: Strings;
  lang: "en" | "hi";
  things: { head: string; text: string }[];
  contacts: GwContact[];
  upiId: string;
  upiName: string;
  couple: string;
}

export default function Notes({ s, lang, things, contacts, upiId, upiName, couple }: NotesProps) {
  const [copied, setCopied] = useState(false);
  const upiLink = upiId ? `upi://pay?pa=${encodeURIComponent(upiId)}${upiName ? `&pn=${encodeURIComponent(upiName)}` : ""}&tn=${encodeURIComponent(`Shagun · ${couple}`)}&cu=INR` : "";
  return (
    <div className="gw-notes">
      {things.length > 0 && (
        <ul className="gw-know">
          {things.map((t, i) => (
            <Reveal as="li" key={i} className="wk-card gw-know-i" delay={(i % 3) * 80}>
              {t.head && <p className="gw-know-h">{t.head}</p>}
              <p className="gw-know-t">{t.text}</p>
            </Reveal>
          ))}
        </ul>
      )}

      {contacts.length > 0 && (
        <Reveal className="gw-contacts">
          <span className="gw-contacts-art" aria-hidden>
            {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
            <img {...gwImg(GW.anthurium, { lazy: true })} />
          </span>
          <h3 className="gw-contacts-h" lang={lang}>
            {s.contacts}
          </h3>
          <p className="gw-contacts-p" lang={lang}>
            {s.contactsIntro}
          </p>
          <ul className="gw-contact-list">
            {contacts.map((c, i) => (
              <li key={i} className="gw-contact">
                <span className="gw-contact-ini" aria-hidden>
                  {c.name.trim().charAt(0).toUpperCase()}
                </span>
                <span className="gw-contact-who">
                  <b>{c.name}</b>
                  {c.relation && <small>{c.relation}</small>}
                </span>
                <span className="gw-contact-btns">
                  <a className="gw-pill" href={`tel:+${c.dial}`} aria-label={`${s.call} ${c.name}`}>
                    <Icon d={ICON.phone} size={16} /> <span lang={lang}>{s.call}</span>
                  </a>
                  <a className="gw-pill gw-pill-wa" href={whatsappUrl(`Namaste ${c.name}, about ${couple}'s wedding: `, c.dial)} target="_blank" rel="noopener noreferrer" aria-label={`${s.chat} ${c.name}`}>
                    <WhatsAppGlyph size={16} /> <span>{s.chat}</span>
                  </a>
                </span>
              </li>
            ))}
          </ul>
        </Reveal>
      )}

      {upiId && (
        <Reveal className="gw-shagun" delay={80}>
          <p className="gw-shagun-k" lang={lang}>
            {s.shagun}
          </p>
          <p className="gw-shagun-p" lang={lang}>
            {s.shagunIntro}
          </p>
          <p className="gw-shagun-id">
            <b>{upiId}</b>
            {upiName && <small>{upiName}</small>}
          </p>
          <div className="gw-shagun-btns">
            <a className="wk-btn wk-btn-sm gw-upi-pay" href={upiLink} lang={lang}>
              <Icon d={ICON.rupee} size={16} /> {s.upiPay}
            </a>
            <button
              type="button"
              className="gw-pill"
              onClick={async () => {
                if (await copyText(upiId)) {
                  setCopied(true);
                  window.setTimeout(() => setCopied(false), 2000);
                }
              }}
              lang={lang}
            >
              <Icon d={copied ? ICON.check : ICON.copy} size={15} /> {copied ? s.upiCopied : s.upiCopy}
            </button>
          </div>
        </Reveal>
      )}
    </div>
  );
}
