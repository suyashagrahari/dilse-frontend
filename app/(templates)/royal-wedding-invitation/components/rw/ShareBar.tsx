"use client";

// ─── Share: WhatsApp, copy link, the invite card, a personal invite ──────────
// WhatsApp uses the system share sheet where there is one (phones), wa.me
// otherwise. The invite card is a PNG for elders and for forwarding as an
// image. "Send a personal invite" turns a name into a ?to= link that opens on
// "Dear <name>, you are warmly invited".

import { useState } from "react";
import type { Strings } from "./model";
import { inviteCardPng, pageUrl, personalUrl, type CardInput } from "./share";

function Icon({ d }: { d: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={d} />
    </svg>
  );
}
const WA = "M3 21l1.6-4.7A8.5 8.5 0 1 1 8 19.6L3 21zM9 8.5c0 3.5 3 6.5 6.5 6.5l1.2-1.6-2.2-1-1 .8a5 5 0 0 1-2.7-2.7l.8-1-1-2.2L9 8.5z";
const LINK = "M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1";
const IMG = "M4 5h16v14H4zM4 16l5-5 4 4 3-3 4 4M15 9.5a1 1 0 1 0 0-.01";

export interface ShareBarProps {
  s: Strings;
  lang: "en" | "hi";
  shareText: string;
  card: Omit<CardInput, "url" | "fontRoot">;
  fontRoot: () => HTMLElement | null;
  /** Show the "send a personal invite" box (the published page, not the editor preview). */
  personal?: boolean;
}

export default function ShareBar({ s, lang, shareText, card, fontRoot, personal = true }: ShareBarProps) {
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [name, setName] = useState("");
  const flash = (t: string) => {
    setNote(t);
    window.setTimeout(() => setNote(""), 2200);
  };
  const url = () => pageUrl();

  const whatsapp = async (link = url(), text = shareText) => {
    const msg = `${text}\n${link}`;
    const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> };
    if (nav.share && window.matchMedia("(pointer: coarse)").matches) {
      try {
        await nav.share({ text, url: link });
        return;
      } catch {
        /* cancelled: fall through to wa.me only when share is missing */
        return;
      }
    }
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank", "noopener,noreferrer");
  };
  const copy = async (link = url()) => {
    try {
      await navigator.clipboard.writeText(link);
      flash(s.copied);
    } catch {
      flash(link);
    }
  };
  const downloadCard = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const blob = await inviteCardPng({ ...card, url: url(), fontRoot: fontRoot() });
      if (!blob) return;
      const file = new File([blob], `invitation-${card.first}-${card.second}.png`.replace(/\s+/g, "-"), { type: "image/png" });
      const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
      if (nav.canShare?.({ files: [file] }) && window.matchMedia("(pointer: coarse)").matches) {
        try {
          await navigator.share({ files: [file], text: shareText });
          return;
        } catch {
          /* fall back to a download */
        }
      }
      const href = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = href;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.setTimeout(() => URL.revokeObjectURL(href), 4000);
    } finally {
      setBusy(false);
    }
  };

  const personalLink = name.trim() ? personalUrl(url(), name) : "";
  return (
    <div className="rw-share">
      <div className="rw-share-row">
        <button type="button" className="rw-btn rw-btn-gold" onClick={() => void whatsapp()} lang={lang}>
          <Icon d={WA} /> WhatsApp
        </button>
        <button type="button" className="rw-btn rw-btn-ghost" onClick={() => void copy()} lang={lang}>
          <Icon d={LINK} /> {s.copyLink}
        </button>
        <button type="button" className="rw-btn rw-btn-ghost" onClick={() => void downloadCard()} disabled={busy} aria-busy={busy} lang={lang}>
          <Icon d={IMG} /> {busy ? s.cardMaking : s.card}
        </button>
      </div>
      {personal && (
        <form
          className="rw-personal"
          onSubmit={(e) => {
            e.preventDefault();
            if (personalLink) void whatsapp(personalLink, `${s.dear} ${name.trim()}, ${shareText}`);
          }}
        >
          <label className="rw-personal-l" htmlFor="rw-personal-name" lang={lang}>
            {s.inviteSomeone}
          </label>
          <div className="rw-personal-row">
            <input id="rw-personal-name" className="wk-input" value={name} maxLength={40} placeholder={s.inviteName} onChange={(e) => setName(e.target.value)} autoComplete="off" />
            <button type="submit" className="rw-btn rw-btn-gold" disabled={!personalLink} lang={lang}>
              <Icon d={WA} /> {s.inviteSend}
            </button>
            <button type="button" className="rw-btn rw-btn-ghost rw-btn-icon" disabled={!personalLink} onClick={() => void copy(personalLink)} aria-label={s.copyLink} title={s.copyLink}>
              <Icon d={LINK} />
            </button>
          </div>
        </form>
      )}
      <p className="rw-share-note" role="status" aria-live="polite">
        {note}
      </p>
    </div>
  );
}
