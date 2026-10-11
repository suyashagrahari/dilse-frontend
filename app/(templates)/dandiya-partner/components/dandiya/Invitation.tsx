"use client";

// Scene 7 — the invitation itself: a mirror-work ticket with the night's
// details (date, time, venue, dress code — all the sender's), an "Admit two"
// stub with both names, and "Add to calendar" (Google Calendar, or an .ics
// file for Apple / Outlook). Without a date it says "Any night you pick".

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { haptic, useReducedMotion } from "../../../_valentine/kit";
import { FONTS } from "../../../_valentine/theme";
import { DD_DISPLAY } from "./fonts";
import { useDd, useNext } from "./stage";
import { BANDHANI, DD, MIRROR_ROW, RoomTitle, prettyDate } from "./ui";

/** "8:30 PM onwards" → [20, 30]; anything unreadable → 19:30. */
export function parseTime(s: string): [number, number] {
  const m = /(\d{1,2})(?:[:.](\d{2}))?\s*(am|pm|a\.m\.|p\.m\.)?/i.exec(s || "");
  if (!m) return [19, 30];
  let h = Number(m[1]);
  const min = m[2] ? Number(m[2]) : 0;
  const ap = (m[3] || "").toLowerCase();
  if (ap.startsWith("p") && h < 12) h += 12;
  if (ap.startsWith("a") && h === 12) h = 0;
  if (!ap && h < 12 && h >= 1 && h <= 11) h += 12; // a garba night is an evening
  if (h > 23 || min > 59) return [19, 30];
  return [h, min];
}

const pad = (n: number) => String(n).padStart(2, "0");

function eventStamp(date: string, time: string, plusHours = 0): string {
  const [y, mo, d] = date.split("-").map(Number);
  const [h, mi] = parseTime(time);
  const t = new Date(y, mo - 1, d, h + plusHours, mi);
  return `${t.getFullYear()}${pad(t.getMonth() + 1)}${pad(t.getDate())}T${pad(t.getHours())}${pad(t.getMinutes())}00`;
}

export default function Invitation({
  recipient,
  sender,
  date,
  time,
  venue,
  dressCode,
  sticker,
  onNext,
}: {
  recipient: string;
  sender: string;
  date: string;
  time: string;
  venue: string;
  dressCode: string;
  sticker: ReactNode;
  onNext: () => void;
}) {
  const reduced = useReducedMotion();
  const { cue } = useDd();
  const pretty = prettyDate(date, true);
  const title = `Dandiya night with ${sender}`;
  const details = `${recipient} × ${sender} · Navratri Dandiya night${dressCode ? ` · Dress code: ${dressCode}` : ""}`;

  const google = () => {
    haptic(10);
    cue("dd-bells", { gain: 0.5 });
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${eventStamp(date, time)}/${eventStamp(date, time, 4)}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(venue)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };
  const ics = () => {
    haptic(10);
    cue("dd-bells", { gain: 0.5 });
    const esc = (s: string) => s.replace(/([,;\\])/g, "\\$1").replace(/\n/g, "\\n");
    const body = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//SubhSandesh//Dandiya Partner//EN",
      "BEGIN:VEVENT",
      `UID:${eventStamp(date, time)}-${Math.random().toString(36).slice(2)}@subhsandesh.in`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+/, "")}`,
      `DTSTART:${eventStamp(date, time)}`,
      `DTEND:${eventStamp(date, time, 4)}`,
      `SUMMARY:${esc(title)}`,
      `DESCRIPTION:${esc(details)}`,
      venue ? `LOCATION:${esc(venue)}` : "",
      "END:VEVENT",
      "END:VCALENDAR",
    ]
      .filter(Boolean)
      .join("\r\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([body], { type: "text/calendar" }));
    a.download = "dandiya-night.ics";
    document.body.appendChild(a);
    a.click();
    window.setTimeout(() => {
      URL.revokeObjectURL(a.href);
      a.remove();
    }, 1000);
  };

  useNext("Last question", onNext, "heart");

  const rows: [string, string, string][] = [
    ["📅", "Date", pretty || "Any night you pick"],
    ["🕗", "Time", time || "When the dhol starts"],
    ["📍", "Venue", venue || "Wherever the music is"],
    ["👗", "Dress code", dressCode || "Anything that twirls"],
  ];

  return (
    <>
      <style>{INVITE_CSS}</style>
      <RoomTitle kicker="Save the night" title="You're invited" />

      <div className="dd-fill">
        <motion.section
          className="dd-ticket dd-zoom"
          aria-label="Dandiya night invitation"
          initial={reduced ? false : { opacity: 0, y: 30, rotate: -4 }}
          animate={{ opacity: 1, y: 0, rotate: -1 }}
          transition={{ type: "spring", stiffness: 150, damping: 16 }}
        >
          <div className="dd-ticket-head">
            <span className="dd-ticket-k">Navratri special</span>
            <span className="dd-ticket-t">Dandiya Night</span>
          </div>
          <dl className="dd-ticket-rows">
            {rows.map(([ico, k, v]) => (
              <div key={k}>
                <dt>
                  <span aria-hidden>{ico}</span> {k}
                </dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
          <div className="dd-ticket-stub">
            <span>Admit two</span>
            <b>
              {recipient} × {sender}
            </b>
            <span className="dd-ticket-sticker">{sticker}</span>
          </div>
        </motion.section>
      </div>

      <div style={{ flex: "none", display: "flex", gap: 8, flexWrap: "nowrap", justifyContent: "center", minHeight: 44 }}>
        {date ? (
          <>
            <button type="button" className="dd-cal" onClick={google}>
              📅 Google Calendar
            </button>
            <button type="button" className="dd-cal" onClick={ics}>
              🗓️ Apple / Outlook
            </button>
          </>
        ) : (
          <p style={{ margin: 0, alignSelf: "center", font: `400 clamp(15px, 2.3dvh, 18px) ${DD_DISPLAY}`, color: DD.gold }}>Pick the night, I&apos;ll bring the sticks ✨</p>
        )}
      </div>
    </>
  );
}

const INVITE_CSS = `
.dd-ticket { position: relative; width: min(calc(100cqw - 8px), calc(360px * var(--vw-s, 1))); border-radius: 20px; overflow: hidden; color: ${DD.maroon};
  background: linear-gradient(180deg, #FFF9EC, #FFEBC2); box-shadow: 0 0 0 3px #F6D27A, 0 0 0 6px rgba(142,16,34,.9), 0 30px 60px -24px rgba(0,0,0,.85); }
@media (min-width: 1100px) { .dd-ticket { width: min(calc(100cqw / 1.18 - 8px), 360px); } }
.dd-ticket-head { position: relative; display: grid; justify-items: center; padding: clamp(12px, 2.2dvh, 18px) 16px clamp(16px, 2.6dvh, 22px);
  background: ${MIRROR_ROW.replace("0 50% / 14px 14px repeat-x", "0 calc(100% - 3px) / 14px 14px repeat-x")}, ${BANDHANI}, linear-gradient(160deg, #E0324A, #8E1022); color: ${DD.ink}; }
.dd-ticket-k { font: 700 11px ${FONTS.ui}; letter-spacing: .22em; text-transform: uppercase; color: ${DD.gold}; }
.dd-ticket-t { font: 400 clamp(28px, 4.6dvh, 36px)/1.15 ${DD_DISPLAY}; text-shadow: 0 2px 0 rgba(0,0,0,.25); }
.dd-ticket-sticker { position: absolute; right: 4px; bottom: 2px; pointer-events: none; }
.dd-ticket-stub b { padding: 0 54px; }
.dd-ticket-rows { margin: 0; padding: clamp(10px, 2dvh, 16px) 18px 6px; display: grid; gap: clamp(6px, 1.3dvh, 10px); text-align: left; }
.dd-ticket-rows > div { display: grid; grid-template-columns: 104px 1fr; gap: 8px; align-items: baseline; }
.dd-ticket-rows dt { font: 700 11px ${FONTS.ui}; letter-spacing: .12em; text-transform: uppercase; color: #8A5A3A; white-space: nowrap; }
.dd-ticket-rows dd { margin: 0; font: 600 clamp(14.5px, 2.2dvh, 16.5px)/1.3 ${FONTS.ui}; overflow-wrap: anywhere; }
.dd-ticket-stub { position: relative; margin-top: 8px; padding: 10px 18px 14px; border-top: 2px dashed rgba(142,16,34,.35); display: grid; justify-items: center; gap: 0; }
.dd-ticket-stub::before, .dd-ticket-stub::after { content: ""; position: absolute; top: -12px; width: 22px; height: 22px; border-radius: 50%; background: #141C52; }
.dd-ticket-stub::before { left: -11px; } .dd-ticket-stub::after { right: -11px; }
.dd-ticket-stub > span:first-child { font: 700 10.5px ${FONTS.ui}; letter-spacing: .2em; text-transform: uppercase; color: ${DD.kumkum}; }
.dd-ticket-stub b { font: 700 clamp(19px, 3dvh, 23px)/1.2 ${FONTS.script}; color: ${DD.kumkumDeep}; overflow-wrap: anywhere; }
.dd-cal { min-height: 44px; padding: 8px 13px; white-space: nowrap; border-radius: 99px; border: 1.5px solid rgba(246,210,122,.55); background: rgba(255,247,232,.1); color: ${DD.ink};
  font: 700 13.5px ${FONTS.ui}; cursor: pointer; touch-action: manipulation; }
.dd-cal:active { transform: scale(.96); }
.dd-cal:focus-visible { outline: 3px solid #7FD8F2; outline-offset: 3px; }
`;
