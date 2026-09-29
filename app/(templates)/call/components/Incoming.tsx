// ─── Screen 1 — the incoming call ────────────────────────────────────────────
//
// The full-screen caller ID: their photo edge to edge, the name at the top,
// the identification card (verified, 0% spam, the crowd tag, the call reason),
// Remind Me / Message / Decline, and "slide to answer" at the bottom where
// every thumb already expects it.
//
// The slider is a real gesture — drag the knob past ~70% — AND a tap on the
// knob answers too, because a template that locks its only way forward behind
// a gesture is a puzzle, not a gift.

"use client";

import { useRef, useState, type PointerEvent as RPointerEvent } from "react";
import { CheckBadgeGlyph, PhoneDownGlyph, PhoneGlyph } from "./icons";
import { Alarm, Bell, Bubble, Crown, Face, Heart, Pic, Pin, SimCard, StatusBar } from "./kit";
import { useCountUp } from "./theme";
import { WORDMARK, spamLabel, type CallData, type CallerTag } from "./types";

export function ringLabel(declines: number, name: string): string {
  const first = name.trim().split(/\s+/)[0] || "they";
  if (declines <= 0) return "Incoming call";
  if (declines === 1) return "Incoming call (2)";
  if (declines === 2) return `Incoming call (3) · ${first} is not going to stop`;
  return `Incoming call (${declines + 1}) · just answer 🙂`;
}

/** The tag under the name: the most-submitted one, ties broken alphabetically. */
export function heroTag(tags: readonly CallerTag[]): CallerTag | null {
  if (tags.length === 0) return null;
  return [...tags].sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))[0];
}

const QUICK_REPLIES = [
  { text: "Can't talk right now 🙈", back: "Seen ✓✓ … still ringing. Obviously." },
  { text: "Call you in 5?", back: "Counter-offer received: now." },
  { text: "I'm in a meeting", back: "The meeting can wait. It said so." },
  { text: "Only if it's about us 🥹", back: "It is. It always is. Pick up." },
];

const REMINDERS = ["In 1 hour", "When I leave", "Never — I'll answer now"];

export interface IncomingProps {
  data: CallData;
  tags: readonly CallerTag[];
  declines: number;
  needsGesture: boolean;
  silent: boolean;
  onToggleSilent: () => void;
  onAnswer: () => void;
  onDecline: () => void;
  onToast: (message: string) => void;
}

export default function Incoming({ data, tags, declines, needsGesture, silent, onToggleSilent, onAnswer, onDecline, onToast }: IncomingProps) {
  const { caller } = data;
  const top = heroTag(tags);
  const count = useCountUp(top?.count ?? 0);
  const risk = Math.max(0, Math.min(100, Math.round(data.spamRisk)));
  const [sheet, setSheet] = useState<null | "message" | "remind">(null);
  const portrait = caller.photoUrl ? { url: caller.photoUrl, cropX: caller.cropX, cropY: caller.cropY, scale: caller.scale } : null;
  const first = caller.name.trim().split(/\s+/)[0] || "They";

  return (
    <div className="cxIn" data-stage="incoming">
      <div className="cxInBg" aria-hidden>
        {portrait ? <Pic photo={portrait} className="cxInPhoto" /> : <span className="cxInPhoto cxInPhoto--none" />}
        <span className="cxInShade" />
      </div>

      <StatusBar />

      <button type="button" className={`cxRinger${needsGesture && !silent ? " is-hint" : ""}`} onClick={onToggleSilent} aria-label={silent ? "Unmute ringtone" : "Silence ringtone"} aria-pressed={silent}>
        <Bell size={17} off={silent} />
      </button>

      <header className="cxInHead">
        <p className="cxGoldPill"><Crown size={12} /> {WORDMARK} Gold · caller ID</p>
        <p className="cxInLabel" aria-live="polite">{ringLabel(declines, caller.name)}</p>
        <h1 className="cxInName">{caller.name || "Unknown"}{data.verified && <CheckBadgeGlyph size={24} color="#F4C95D" style={{ display: "inline-block", verticalAlign: "-3px", marginLeft: 8 }} />}</h1>
        <p className="cxInNum">
          <span>{caller.number || "Private number"}</span>
          {caller.carrier && <><i aria-hidden>·</i><SimCard size={13} /><span>{caller.carrier}</span></>}
        </p>
        {caller.location && <p className="cxInLoc"><Pin size={13} /> {caller.location}</p>}
      </header>

      <section className="cxIdCard" aria-label="Caller identification">
        <div className="cxIdTop">
          <Face name={caller.name} photo={portrait} size={42} className="cxIdFace" />
          <div className="cxIdWho">
            <b>{data.savedAs || caller.name}</b>
            <span>{data.verified ? "Verified by " : "Identified by "}{WORDMARK} ✓ · saved in your contacts</span>
          </div>
          <span className={`cxSpamBadge${risk === 0 ? " is-zero" : ""}`}>{risk}%<small>spam</small></span>
        </div>
        {top && (
          <p className="cxIdTag">
            <span className="cxIdTagHead">Saved by <b>{count.toLocaleString("en-IN")}</b> people as</span>
            <span className="cxIdTagLabel">&ldquo;{top.label}&rdquo;</span>
          </p>
        )}
        <div className="cxMeter" role="img" aria-label={spamLabel(data)}>
          <span className="cxMeterTrack"><span className="cxMeterFill" style={{ width: `${Math.max(risk, 0)}%` }} /></span>
          <span className="cxMeterTx">{risk === 0 ? <><Heart size={11} color="#FF5C93" /> {spamLabel(data)} · 1 heart vouches</> : spamLabel(data)}</span>
        </div>
        {data.callReason && (
          <p className="cxReason"><span className="cxReasonK">📌 Call reason</span><span className="cxReasonV">{data.callReason}</span></p>
        )}
      </section>

      <div className="cxInFoot">
        <div className="cxQuick">
          <button type="button" onClick={() => setSheet("remind")}><span><Alarm /></span>Remind me</button>
          <button type="button" onClick={() => setSheet("message")}><span><Bubble /></span>Message</button>
          <button type="button" className="is-decline" onClick={onDecline} aria-label="Decline"><span><PhoneDownGlyph size={22} /></span>Decline</button>
        </div>
        <Slider onAnswer={onAnswer} hint="slide to answer" />
      </div>

      {sheet && (
        <div className="cxSheetWrap" onClick={() => setSheet(null)}>
          <div className="cxSheet" role="dialog" aria-label={sheet === "message" ? "Reply with a message" : "Remind me"} onClick={(e) => e.stopPropagation()}>
            <span className="cxSheetGrab" aria-hidden />
            <p className="cxSheetH">{sheet === "message" ? `Reply to ${first}` : "Remind me to call back"}</p>
            {sheet === "message"
              ? QUICK_REPLIES.map((q) => (
                  <button key={q.text} type="button" className="cxSheetRow" onClick={() => { setSheet(null); onToast(`${q.text} → ${q.back}`); }}>
                    {q.text}
                  </button>
                ))
              : REMINDERS.map((r, i) => (
                  <button key={r} type="button" className="cxSheetRow" onClick={() => { setSheet(null); if (i === 2) onAnswer(); else onToast(`Reminder set: ${r.toLowerCase()}. ${first} set one too: "now".`); }}>
                    {r}
                  </button>
                ))}
            <button type="button" className="cxSheetRow is-cancel" onClick={() => setSheet(null)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── slide to answer ──────────────────────────────────────────────────────── */

function Slider({ onAnswer, hint }: { onAnswer: () => void; hint: string }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; max: number; moved: boolean } | null>(null);
  const [dx, setDx] = useState(0);
  const [live, setLive] = useState(false);
  const [maxW, setMaxW] = useState(260);
  const done = useRef(false);

  const onDown = (e: RPointerEvent<HTMLButtonElement>) => {
    const track = trackRef.current;
    if (!track) return;
    const max = track.clientWidth - e.currentTarget.offsetWidth - 10;
    drag.current = { x: e.clientX, max, moved: false };
    setMaxW(max);
    setLive(true);
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* a synthetic pointer cannot be captured — the drag still works */
    }
  };
  const onMove = (e: RPointerEvent<HTMLButtonElement>) => {
    const d = drag.current;
    if (!d) return;
    const v = Math.max(0, Math.min(d.max, e.clientX - d.x));
    if (v > 4) d.moved = true;
    setDx(v);
  };
  const onUp = () => {
    const d = drag.current;
    drag.current = null;
    setLive(false);
    if (!d) return;
    if (!d.moved || dx >= d.max * 0.7) {
      if (done.current) return;
      done.current = true;
      setDx(d.max);
      window.setTimeout(onAnswer, d.moved ? 140 : 0);
      return;
    }
    setDx(0);
  };

  const p = Math.min(1, dx / Math.max(1, maxW));

  return (
    <div className="cxSlide" ref={trackRef}>
      <span className="cxSlideFill" style={{ width: `calc(${dx}px + 64px)`, transition: live ? "none" : undefined }} aria-hidden />
      <span className="cxSlideTx" style={{ opacity: 1 - p * 1.4 }} aria-hidden>{hint}</span>
      <span className="cxSlideHearts" aria-hidden>
        {[0, 1, 2].map((i) => <i key={i} style={{ animationDelay: `${i * 0.9}s` }}>♥</i>)}
      </span>
      <button
        type="button"
        className="cxSlideKnob"
        style={{ transform: `translateX(${dx}px)`, transition: live ? "none" : undefined }}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={() => { drag.current = null; setLive(false); setDx(0); }}
        // Keyboard and assistive-tech activation arrive as a click with no
        // pointer behind it (detail 0); real taps were already handled above.
        onClick={(e) => { if (e.detail === 0 && !done.current) { done.current = true; onAnswer(); } }}
        aria-label="Answer the call"
      >
        <PhoneGlyph size={26} color="#fff" />
      </button>
    </div>
  );
}
