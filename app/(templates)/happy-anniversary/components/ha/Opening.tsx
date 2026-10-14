"use client";

// Rooms 1–2: the ticket booth (she tears the stub off her admission ticket)
// and the clock room (she pulls the lever; years / months / days / hours roll
// up like an odometer, then the fun stats are hung as little placards).

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useMotionValue, useTransform, animate } from "framer-motion";
import { burst, haptic, useReducedMotion } from "../../../_valentine/kit";
import { FONTS } from "../../../_valentine/theme";
import { HA_CAPS, HA_DISPLAY, HA_HAND } from "./fonts";
import { useHa, useNext } from "./stage";
import { Head, big, type Together } from "./ui";

// ─── 1 · The ticket booth ───────────────────────────────────────────────────

/** A torn edge: a zigzag down the right side of the ticket's body. */
const ZIG = (() => {
  const teeth = 14;
  const pts = ["0% 0%", "97% 0%"];
  for (let k = 0; k < teeth; k++) {
    const y0 = (k / teeth) * 100;
    pts.push(`100% ${(y0 + 50 / teeth).toFixed(2)}%`, `97% ${(y0 + 100 / teeth).toFixed(2)}%`);
  }
  pts.push("0% 100%");
  return `polygon(${pts.join(", ")})`;
})();

/** The museum's front: a pediment, columns, banners and a little arched door that opens. */
function Facade({ year, open }: { year: string; open: boolean }) {
  return (
    <svg className="ha-facade" viewBox="0 0 400 236" aria-hidden>
      <defs>
        <linearGradient id="haStone" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="1" stopColor="var(--vw-paper)" />
        </linearGradient>
        <linearGradient id="haGilt" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--ha-gilt-a)" />
          <stop offset=".5" stopColor="#FFF4D6" />
          <stop offset="1" stopColor="var(--ha-gilt-b)" />
        </linearGradient>
      </defs>
      <path d="M18 74 L200 8 L382 74 Z" fill="url(#haStone)" stroke="url(#haGilt)" strokeWidth="5" strokeLinejoin="round" />
      <path d="M62 66 L200 20 L338 66 Z" fill="var(--ha-blush)" />
      <path d="M200 58 C188 49 184 43 186 37 C188 31 196 30 200 36 C204 30 212 31 214 37 C216 43 212 49 200 58 Z" fill="var(--vw-accent)" />
      <rect x="22" y="74" width="356" height="30" rx="3" fill="url(#haStone)" stroke="url(#haGilt)" strokeWidth="3" />
      <text x="200" y="94" textAnchor="middle" style={{ font: `700 13.5px ${HA_CAPS}`, letterSpacing: ".2em" }} fill="var(--ha-deep)">
        THE MUSEUM OF US
      </text>
      {[44, 104, 276, 336].map((x) => (
        <g key={x}>
          <rect x={x} y="104" width="22" height="96" fill="url(#haStone)" stroke="color-mix(in srgb, var(--ha-gilt-b) 60%, #FFFFFF)" strokeWidth="1.5" />
          <path d={`M${x + 6} 110 V194 M${x + 11} 110 V194 M${x + 16} 110 V194`} stroke="color-mix(in srgb, var(--ha-deep) 14%, transparent)" strokeWidth="1.4" />
          <rect x={x - 4} y="104" width="30" height="7" rx="2" fill="url(#haGilt)" />
          <rect x={x - 4} y="194" width="30" height="7" rx="2" fill="url(#haGilt)" />
        </g>
      ))}
      {[74, 306].map((x) => (
        <g key={x}>
          <path d={`M${x - 4} 112 h28 v54 l-14 -9 l-14 9 Z`} fill="var(--vw-accent)" />
          <text x={x + 10} y="138" textAnchor="middle" style={{ font: `700 9px ${HA_CAPS}`, letterSpacing: ".08em" }} fill="#FFFFFF">
            EST.
          </text>
          <text x={x + 10} y="151" textAnchor="middle" style={{ font: `700 10px ${HA_CAPS}` }} fill="#FFFFFF">
            {year}
          </text>
        </g>
      ))}
      <path d="M156 200 V152 a44 44 0 0 1 88 0 V200 Z" fill="color-mix(in srgb, var(--ha-deep) 26%, #FFF6EE)" />
      <g className={`ha-door-l${open ? " is-open" : ""}`}>
        <path d="M161 200 V152 a39 39 0 0 1 39 -39 V200 Z" fill="var(--vw-accent)" stroke="url(#haGilt)" strokeWidth="3" />
        <circle cx="193" cy="168" r="3" fill="url(#haGilt)" />
      </g>
      <g className={`ha-door-r${open ? " is-open" : ""}`}>
        <path d="M239 200 V152 a39 39 0 0 0 -39 -39 V200 Z" fill="var(--vw-accent-deep)" stroke="url(#haGilt)" strokeWidth="3" />
        <circle cx="207" cy="168" r="3" fill="url(#haGilt)" />
      </g>
      <rect x="10" y="200" width="380" height="11" rx="2" fill="url(#haStone)" stroke="color-mix(in srgb, var(--ha-gilt-b) 50%, #FFFFFF)" strokeWidth="1.5" />
      <rect x="0" y="211" width="400" height="12" rx="2" fill="url(#haStone)" stroke="color-mix(in srgb, var(--ha-gilt-b) 50%, #FFFFFF)" strokeWidth="1.5" />
      <path d="M120 211 C140 222 260 222 280 211" fill="var(--vw-accent)" opacity=".8" />
    </svg>
  );
}

export function Ticket({
  recipient,
  sender,
  label,
  since,
  line,
  serial,
  sticker,
  onEnter,
}: {
  recipient: string;
  sender: string;
  label: string;
  since: string;
  line: string;
  serial: string;
  sticker: ReactNode;
  onEnter: () => void;
}) {
  const year = since ? since.slice(-4) : String(new Date().getFullYear());
  const { cue } = useHa();
  const reduced = useReducedMotion();
  const [torn, setTorn] = useState(false);
  const [nudged, setNudged] = useState(0);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform([x, y], ([a, b]: number[]) => Math.max(0, Math.min(28, a * 0.16 + b * 0.22)));
  const rustled = useRef(false);
  const [fall, setFall] = useState({ x: 0, y: 0 });

  const tear = () => {
    if (torn) return;
    setFall({ x: x.get(), y: y.get() });
    setTorn(true);
    haptic(28);
    cue("paper-rustle", { gain: 0.7 });
    cue("chime-cascade", { gain: 0.5, at: 0.22 });
    if (!reduced) burst({ kind: "hearts", origin: { x: 0.62, y: 0.5 }, count: 22, emojis: ["💗", "🎟️", "✨", "🩷"] });
  };

  const nudge = () => {
    if (torn) return;
    haptic(10);
    cue("paper-rustle", { gain: 0.35 });
    if (nudged >= 1 || reduced) return tear();
    setNudged(1);
    animate(x, [0, 26, 18], { duration: 0.35 });
    animate(y, [0, 22, 16], { duration: 0.35 });
  };

  useNext(torn ? "Walk in" : null, onEnter, "door");

  return (
    <>
      <Head kicker="Now open · Admit one" title="Our Little Love Museum" sub={torn ? `Welcome in, ${recipient} 💗` : `A tiny museum about us, ${recipient}. Your ticket's ready.`} />
      <div className="ha-fill">
        <div className="ha-booth ha-zoom">
          <div className="ha-sign" aria-hidden>
            <span className="ha-sign-str" />
            <span className="ha-sign-board">
              <b>Now showing</b>
              <em>
                {sender} &amp; {recipient}
              </em>
            </span>
          </div>
          <Facade year={year} open={torn} />
          <div className="ha-ticket-row">
            <div className={`ha-ticket${torn ? " is-torn" : ""}`} data-ha-ticket={torn ? "torn" : "whole"}>
              <div className="ha-tk-body" style={torn ? { clipPath: ZIG } : undefined}>
                <div className="ha-tk-top">
                  <span>Admit one</span>
                  <span>No. {serial}</span>
                </div>
                <p className="ha-tk-name">Our Little Love Museum</p>
                <p className="ha-tk-who">
                  {sender} &amp; {recipient}
                </p>
                <p className="ha-tk-ex">
                  The {label} Exhibition{since ? <> · since {since}</> : null}
                </p>
                {line && <p className="ha-tk-fine">{line}</p>}
              </div>
              <AnimatePresence>
                  {torn && (
                    <motion.span className="ha-tk-stamp" initial={reduced ? false : { scale: 2.4, opacity: 0, rotate: -30 }} animate={{ scale: 1, opacity: 1, rotate: -12 }} transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.25 }}>
                      Admitted ♡
                    </motion.span>
                  )}
                </AnimatePresence>
              {!torn ? (
                <motion.button
                  type="button"
                  className="ha-tk-stub"
                  style={{ x, y, rotate }}
                  drag
                  dragConstraints={{ left: 0, right: 160, top: 0, bottom: 160 }}
                  dragElastic={0.12}
                  dragMomentum={false}
                  dragSnapToOrigin
                  onDrag={() => {
                    const p = Math.max(x.get(), y.get()) / 80;
                    if (p > 0.45 && !rustled.current) {
                      rustled.current = true;
                      cue("paper-rustle", { gain: 0.35 });
                      haptic(6);
                    }
                    if (p >= 1) tear();
                  }}
                  onDragEnd={() => {
                    rustled.current = false;
                  }}
                  onTap={nudge}
                  aria-label="Tear off the ticket stub"
                  data-ha-stub
                >
                  <span className="ha-stub-in">
                    <span className="ha-stub-heart" aria-hidden>
                      ♥
                    </span>
                    <span className="ha-stub-v">Keep this half</span>
                    <span className="ha-stub-tear" aria-hidden>
                      tear ✂
                    </span>
                  </span>
                </motion.button>
              ) : (
                <motion.span
                  className="ha-tk-stub is-falling"
                  aria-hidden
                  initial={{ x: fall.x, y: fall.y, rotate: 14, opacity: 1 }}
                  animate={reduced ? { opacity: 0 } : { x: fall.x + 70, y: 420, rotate: 70, opacity: 0 }}
                  transition={{ duration: reduced ? 0.2 : 1.1, ease: [0.4, 0, 0.8, 0.6] }}
                >
                  <span className="ha-stub-in">
                    <span className="ha-stub-heart">♥</span>
                    <span className="ha-stub-v">Keep this half</span>
                  </span>
                </motion.span>
              )}
            </div>
            {!torn && (
              <span className="ha-tk-hint" aria-hidden>
                <b>pull the stub</b>
                <svg viewBox="0 0 60 40" width="46" height="30">
                  <path d="M6 6 C24 6 36 14 44 30" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeDasharray="5 6" />
                  <path d="M36 28 L45 32 L47 22" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            )}
          </div>
          <AnimatePresence>
            {torn && (
              <motion.div className="ha-welcome" initial={reduced ? false : { opacity: 0, y: 24, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 16, delay: 0.35 }}>
                {sticker}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <style>{TICKET_CSS}</style>
    </>
  );
}

const TICKET_CSS = `
.ha-booth { position: relative; width: min(100%, 440px); display: grid; justify-items: center; }
.ha-facade { width: min(100%, 46cqh * 1.7, 440px); height: auto; filter: drop-shadow(0 14px 18px color-mix(in srgb, var(--ha-deep) 16%, transparent)); }
.ha-door-l, .ha-door-r { transition: transform 1s cubic-bezier(.5,0,.2,1); transform-box: fill-box; }
.ha-door-l { transform-origin: 0% 50%; } .ha-door-r { transform-origin: 100% 50%; }
.ha-door-l.is-open { transform: scaleX(.18); } .ha-door-r.is-open { transform: scaleX(.18); }
.ha-sign { display: none; justify-items: center; margin-bottom: 14px; animation: ha-sway 4s ease-in-out infinite; transform-origin: 50% 0; }
@container (min-height: 520px) { .ha-sign { display: grid; } }
@media (min-width: 1000px) { .ha-sign { display: none; } }
@keyframes ha-sway { 0%, 100% { transform: rotate(-1.6deg) } 50% { transform: rotate(1.6deg) } }
.ha-sign-str { width: 120px; height: 26px; border: 2px solid var(--ha-gilt-b); border-bottom: 0; border-radius: 60px 60px 0 0; clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%); }
.ha-sign-board { display: grid; justify-items: center; gap: 1px; padding: 8px 22px 7px; border-radius: 6px; background: linear-gradient(170deg, #FFFDF6, color-mix(in srgb, var(--ha-gilt-a) 40%, #FFFDF6)); box-shadow: 0 0 0 2px var(--ha-gilt-b), 0 10px 18px -10px color-mix(in srgb, var(--ha-deep) 55%, transparent); max-width: 86vw; }
.ha-sign-board b { font: 700 10.5px ${HA_CAPS}; letter-spacing: .24em; text-transform: uppercase; color: var(--ha-deep); }
.ha-sign-board em { font: 700 25px/1.1 ${HA_HAND}; font-style: normal; color: var(--vw-accent-deep); overflow-wrap: anywhere; }
@media (prefers-reduced-motion: reduce) { .ha-sign { animation: none; } }
.ha-ticket-row { margin-top: calc(-1 * clamp(14px, 4cqh, 30px)); }
.ha-ticket-row { position: relative; width: 100%; display: grid; justify-items: center; }
.ha-ticket { position: relative; width: min(100%, 400px); display: grid; grid-template-columns: minmax(0, 1fr) 27%; filter: drop-shadow(0 18px 22px color-mix(in srgb, var(--ha-deep) 26%, transparent)); }
.ha-tk-body { position: relative; box-sizing: border-box; min-height: 168px; padding: 13px 14px 12px 16px; text-align: left; border-radius: 12px 0 0 12px; color: var(--vw-ink);
  background:
    radial-gradient(circle at 18% 120%, color-mix(in srgb, var(--ha-blush) 90%, transparent) 0 30%, transparent 31%),
    repeating-radial-gradient(circle at 100% 50%, transparent 0 9px, color-mix(in srgb, var(--vw-accent) 7%, transparent) 9px 10px),
    linear-gradient(160deg, #FFFFFF, var(--vw-paper));
  box-shadow: inset 0 0 0 5px var(--vw-paper), inset 0 0 0 6.5px color-mix(in srgb, var(--ha-gilt-b) 60%, transparent); display: grid; align-content: start; gap: 3px; transition: transform .5s cubic-bezier(.3,1.4,.5,1); }
.ha-ticket.is-torn .ha-tk-body { transform: rotate(-2deg); }
.ha-tk-top { display: flex; justify-content: space-between; gap: 8px; font: 700 10.5px/1.2 ${HA_CAPS}; letter-spacing: .18em; text-transform: uppercase; color: var(--vw-accent-deep); }
.ha-tk-name { margin: 4px 0 0; font: 700 clamp(22px, 6.2cqw, 28px)/1 ${HA_DISPLAY}; color: var(--vw-ink); }
.ha-tk-who { margin: 2px 0 0; font: 700 clamp(22px, 6cqw, 27px)/1.05 ${HA_HAND}; color: var(--vw-accent-deep); overflow-wrap: anywhere; }
.ha-tk-ex { margin: 2px 0 0; font: 600 12.5px/1.3 ${FONTS.ui}; color: var(--vw-ink-soft); overflow-wrap: anywhere; }
.ha-tk-fine { margin: 3px 0 0; font: 600 italic 14.5px/1.2 ${HA_DISPLAY}; color: var(--vw-ink-soft); overflow-wrap: anywhere; }
.ha-tk-stamp { position: absolute; right: 1%; top: 38%; z-index: 2; padding: 3px 9px; border: 2.5px solid var(--vw-accent); border-radius: 6px; font: 700 12px ${HA_CAPS}; letter-spacing: .12em; text-transform: uppercase; color: var(--vw-accent-deep); background: color-mix(in srgb, var(--vw-paper) 70%, transparent); pointer-events: none; }
.ha-tk-stub { position: relative; box-sizing: border-box; padding: 0; margin: 0; border: 0; cursor: grab; touch-action: none; transform-origin: 0 0; color: #FFFFFF; border-radius: 0 12px 12px 0;
  background: linear-gradient(170deg, color-mix(in srgb, var(--vw-accent) 82%, #FFFFFF), var(--vw-accent-deep));
  -webkit-mask: radial-gradient(circle 9px at 0 0, transparent 98%, #000) top left / 100% 51% no-repeat, radial-gradient(circle 9px at 0 100%, transparent 98%, #000) bottom left / 100% 51% no-repeat;
          mask: radial-gradient(circle 9px at 0 0, transparent 98%, #000) top left / 100% 51% no-repeat, radial-gradient(circle 9px at 0 100%, transparent 98%, #000) bottom left / 100% 51% no-repeat; }
.ha-tk-stub:active { cursor: grabbing; }
.ha-tk-stub::before { content: ""; position: absolute; left: 0; top: 10px; bottom: 10px; border-left: 3px dotted color-mix(in srgb, #FFFFFF 85%, transparent); }
.ha-tk-stub:focus-visible { outline: 3px solid var(--vw-ink); outline-offset: 3px; }
.ha-tk-stub.is-falling { position: absolute; right: 0; top: 0; bottom: 0; width: 27%; pointer-events: none; }
.ha-stub-in { position: absolute; inset: 0; display: grid; grid-template-rows: auto 1fr auto; justify-items: center; align-items: center; padding: 10px 4px; }
.ha-stub-heart { font-size: 22px; line-height: 1; }
.ha-stub-v { writing-mode: vertical-rl; transform: rotate(180deg); font: 700 11px/1 ${HA_CAPS}; letter-spacing: .16em; text-transform: uppercase; }
.ha-stub-tear { font: 700 12px ${FONTS.ui}; letter-spacing: .02em; }
.ha-tk-hint { position: absolute; right: max(0px, calc(50% - 200px)); bottom: -38px; display: inline-flex; align-items: center; gap: 4px; color: var(--vw-accent-deep); pointer-events: none; animation: ha-hint-nudge 1.6s ease-in-out infinite; }
.ha-tk-hint b { font: 700 19px ${HA_HAND}; }
@keyframes ha-hint-nudge { 50% { transform: translate(4px, 3px) } }
.ha-welcome { position: absolute; left: 50%; top: 26%; translate: -50% 0; z-index: 2; }
.ha-welcome .ha-stk { transform: rotate(-3deg); }
.ha-welcome .ha-stk img { width: clamp(88px, 17cqh, 140px) !important; height: auto !important; }
@media (min-width: 1000px) { .ha-booth { --hz: 1.1; width: 440px; } .ha-facade { width: 440px; } }
@media (prefers-reduced-motion: reduce) { .ha-tk-hint { animation: none; } }
`;

// ─── 2 · The clock room ─────────────────────────────────────────────────────

const ROLL_EXTRA = 10;

function Wheel({ digit, rolled, delay, reduced }: { digit: number; rolled: boolean; delay: number; reduced: boolean }) {
  const target = rolled ? ROLL_EXTRA + digit : 0;
  return (
    <span className="ha-dw" aria-hidden>
      <motion.span
        className="ha-dw-col"
        initial={false}
        animate={{ y: `${(-target / 20) * 100}%` }}
        transition={reduced ? { duration: 0 } : { duration: 1.3 + delay, ease: [0.25, 0.7, 0.2, 1.02] }}
      >
        {Array.from({ length: 20 }, (_, k) => (
          <i key={k}>{k % 10}</i>
        ))}
      </motion.span>
    </span>
  );
}

export function ClockRoom({ t, funStat, sticker, onNext }: { t: Together; funStat: string; sticker: ReactNode; onNext: () => void }) {
  const { cue } = useHa();
  const reduced = useReducedMotion();
  const [rolled, setRolled] = useState(false);
  const [settled, setSettled] = useState(false);
  const [secs, setSecs] = useState(0);
  const knob = useMotionValue(0);
  const pulled = useRef(false);

  const groups = useMemo(
    () =>
      [
        { v: t.years, label: t.years === 1 ? "Year" : "Years" },
        { v: t.months, label: t.months === 1 ? "Month" : "Months" },
        { v: t.days, label: t.days === 1 ? "Day" : "Days" },
        { v: t.hours, label: t.hours === 1 ? "Hour" : "Hours" },
      ].map((g) => ({ ...g, v: Math.min(99, Math.max(0, g.v)) })),
    [t],
  );

  const pull = () => {
    if (pulled.current) return;
    pulled.current = true;
    haptic(22);
    cue("snap", { gain: 0.5 });
    if (!reduced) for (let k = 0; k < 9; k++) cue("tick", { gain: 0.3, at: 0.15 + k * 0.14, detune: k * 60 });
    cue("chime-cascade", { gain: 0.6, at: reduced ? 0.1 : 1.9 });
    setRolled(true);
    window.setTimeout(() => {
      setSettled(true);
      if (!reduced) burst({ kind: "sparkles", origin: { x: 0.5, y: 0.4 }, count: 18 });
    }, reduced ? 120 : 2000);
  };

  // A tiny live counter: the seconds she's spent in here count too.
  useEffect(() => {
    if (!settled) return;
    const id = window.setInterval(() => setSecs((s) => s + 1), 1000);
    return () => window.clearInterval(id);
  }, [settled]);

  const stats = t.ok
    ? [
        { e: "🌅", v: t.totalDays.toLocaleString("en-IN"), l: "sunrises together" },
        { e: "💓", v: big(t.totalMinutes * 72), l: "heartbeats (all yours)" },
        { e: "☕", v: big(t.totalDays * 2), l: "cups of chai & coffee" },
        { e: "💬", v: big(t.totalDays * 3), l: "“I love you”s, roughly" },
      ]
    : [];

  useNext(settled ? "To the gallery" : null, onNext, "frame");

  return (
    <>
      <Head kicker="Room 1 · The Clock Room" title="How long we've been us" sub={settled ? (t.ok ? `Since ${t.since}, and still counting` : "Since the very first day") : "Pull the lever to wind the clock ⤵"} />
      <div className="ha-fill">
        <div className={`ha-clockroom ha-zoom${settled ? " is-settled" : ""}`}>
          <div className="ha-machine-wrap">
            <div className="ha-machine ha-frame" data-ha-clock={rolled ? "rolled" : "idle"}>
              <div className="ha-machine-in">
                <p className="ha-machine-k">Time together</p>
                {t.ok ? (
                  <div className="ha-groups">
                    {groups.map((g, gi) => {
                      const tens = Math.floor(g.v / 10);
                      const ones = g.v % 10;
                      return (
                        <div className="ha-group" key={g.label}>
                          <span className="ha-digits" role="img" aria-label={rolled ? `${g.v} ${g.label}` : `${g.label}, not wound yet`}>
                            <Wheel digit={tens} rolled={rolled} delay={gi * 0.16} reduced={reduced} />
                            <Wheel digit={ones} rolled={rolled} delay={gi * 0.16 + 0.08} reduced={reduced} />
                          </span>
                          <span className="ha-group-l">{g.label}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="ha-forever">{rolled ? "Forever-ish ♾️" : "· · · · ·"}</p>
                )}
              </div>
            </div>
            <div className="ha-lever" aria-hidden={rolled}>
              <span className="ha-lever-slot" />
              <motion.button
                type="button"
                className="ha-lever-knob"
                style={{ y: knob }}
                drag={rolled ? false : "y"}
                dragConstraints={{ top: 0, bottom: 64 }}
                dragElastic={0.1}
                dragMomentum={false}
                dragSnapToOrigin
                onDrag={() => {
                  if (knob.get() > 44) pull();
                }}
                onTap={() => {
                  if (pulled.current) return;
                  if (!reduced) animate(knob, [0, 64, 0], { duration: 0.6, times: [0, 0.45, 1] });
                  pull();
                }}
                disabled={rolled}
                aria-label="Pull the lever"
                data-ha-lever
              />
            </div>
            <div className="ha-clock-gif">{sticker}</div>
          </div>
          <AnimatePresence>
            {settled && (
              <motion.div className="ha-stats" initial="h" animate="s" variants={{ s: { transition: { staggerChildren: reduced ? 0 : 0.12 } } }}>
                {stats.map((s) => (
                  <motion.div key={s.l} className="ha-stat ha-plaque" variants={{ h: { opacity: 0, y: 14, rotate: -3 }, s: { opacity: 1, y: 0, rotate: 0 } }}>
                    <span className="ha-stat-e" aria-hidden>
                      {s.e}
                    </span>
                    <b>{s.v}</b>
                    <span>{s.l}</span>
                  </motion.div>
                ))}
                {funStat && (
                  <motion.div className="ha-stat ha-plaque is-wide" variants={{ h: { opacity: 0, y: 14 }, s: { opacity: 1, y: 0 } }}>
                    <span className="ha-fun">{funStat}</span>
                  </motion.div>
                )}
                <motion.p className="ha-secs" variants={{ h: { opacity: 0 }, s: { opacity: 1 } }} aria-live="off">
                  …plus the {secs} second{secs === 1 ? "" : "s"} you&apos;ve spent in here. Those count too.
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <style>{CLOCK_CSS}</style>
    </>
  );
}

const CLOCK_CSS = `
.ha-clockroom { width: min(100%, 460px); display: grid; gap: clamp(10px, 2.2cqh, 18px); justify-items: center; align-content: center; }
.ha-machine-wrap { position: relative; display: grid; grid-template-columns: auto auto; align-items: center; gap: 10px; }
.ha-machine { width: auto; }
.ha-machine-in { padding: 10px 12px 12px; border-radius: 3px; background: linear-gradient(180deg, #FFFFFF, var(--vw-paper)); box-shadow: inset 0 0 0 2px color-mix(in srgb, var(--ha-gilt-b) 45%, #FFFFFF); }
.ha-machine-k { margin: 0 0 7px; font: 700 10.5px ${HA_CAPS}; letter-spacing: .22em; text-transform: uppercase; color: var(--ha-deep); }
.ha-groups { display: flex; gap: clamp(6px, 2cqw, 14px); }
.ha-group { display: grid; gap: 4px; justify-items: center; }
.ha-digits { display: flex; gap: 3px; }
.ha-dw { --dh: clamp(40px, min(11cqw, 8.5cqh), 64px); position: relative; display: block; width: calc(var(--dh) * .7); height: var(--dh); overflow: hidden; border-radius: 6px;
  background: linear-gradient(180deg, #E9E2D6, #FFFFFF 30%, #FFFFFF 70%, #E9E2D6); box-shadow: inset 0 0 0 1.5px color-mix(in srgb, var(--ha-gilt-b) 70%, transparent), inset 0 6px 8px -4px rgba(40,25,5,.3), inset 0 -6px 8px -4px rgba(40,25,5,.3); }
.ha-dw-col { position: absolute; left: 0; right: 0; top: 0; display: grid; }
.ha-dw-col i { display: block; height: var(--dh); line-height: var(--dh); font: 700 calc(var(--dh) * .78)/var(--dh) ${HA_DISPLAY}; font-style: normal; color: var(--vw-ink); text-align: center; font-variant-numeric: lining-nums tabular-nums; }
.ha-group-l { font: 700 10px ${HA_CAPS}; letter-spacing: .14em; text-transform: uppercase; color: var(--vw-ink-soft); }
.ha-forever { margin: 6px 18px 4px; font: 700 clamp(34px, 9cqw, 50px)/1.1 ${HA_DISPLAY}; color: var(--vw-accent-deep); }
.ha-lever { position: relative; width: 44px; height: 128px; display: grid; justify-items: center; }
.ha-lever-slot { position: absolute; top: 18px; bottom: 18px; width: 10px; border-radius: 99px; background: linear-gradient(90deg, color-mix(in srgb, var(--ha-gilt-b) 80%, #000), var(--ha-gilt-b), var(--ha-gilt-a)); box-shadow: inset 0 2px 4px rgba(0,0,0,.35); }
.ha-lever-knob { position: absolute; top: 0; width: 44px; height: 44px; padding: 0; border: 0; border-radius: 50%; cursor: grab; touch-action: none;
  background: radial-gradient(circle at 36% 32%, #FFFFFF, color-mix(in srgb, var(--vw-accent) 70%, #FFFFFF) 34%, var(--vw-accent-deep) 100%);
  box-shadow: 0 5px 0 var(--ha-deep), 0 0 0 3px var(--ha-gilt-a), 0 10px 18px -6px color-mix(in srgb, var(--ha-deep) 70%, transparent); }
.ha-lever-knob:not(:disabled) { animation: ha-knob 1.6s ease-in-out infinite; }
@keyframes ha-knob { 0%, 60%, 100% { translate: 0 0 } 75% { translate: 0 10px } }
.ha-lever-knob:disabled { cursor: default; opacity: .7; }
.ha-lever-knob:focus-visible { outline: 3px solid var(--vw-ink); outline-offset: 4px; }
.ha-clock-gif { position: absolute; left: -12px; top: -84px; transform: rotate(-8deg); pointer-events: none; }
.ha-clock-gif .ha-stk img { width: clamp(62px, 12cqh, 92px) !important; height: auto !important; }
.ha-stats { width: 100%; display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.ha-stat { display: grid; grid-template-columns: auto minmax(0, 1fr); grid-template-rows: auto auto; column-gap: 8px; align-items: center; text-align: left; padding: 7px 14px 7px 16px; }
.ha-stat-e { grid-row: 1 / 3; font-size: 22px; line-height: 1; }
.ha-stat b { font: 700 clamp(17px, 2.6cqh, 22px)/1.05 ${HA_DISPLAY}; color: var(--vw-ink); overflow-wrap: anywhere; }
.ha-stat span:not(.ha-stat-e):not(.ha-fun) { font: 600 11.5px/1.2 ${FONTS.ui}; color: #6A5440; overflow-wrap: anywhere; }
.ha-stat.is-wide { grid-column: 1 / -1; grid-template-columns: 1fr; text-align: center; }
.ha-fun { font: 600 clamp(19px, 2.8cqh, 22px)/1.2 ${HA_HAND}; color: var(--vw-ink); overflow-wrap: anywhere; }
.ha-secs { grid-column: 1 / -1; margin: 2px 0 0; font: 600 13px/1.3 ${FONTS.ui}; color: var(--vw-ink-soft); }
@media (min-width: 1000px) {
  .ha-clockroom { --hz: 1.04; width: min(100%, 1040px); grid-template-columns: auto minmax(0, 440px); gap: 30px; align-items: center; justify-content: center; }
  .ha-dw { --dh: 64px; }
  .ha-group-l { font-size: 11.5px; }
  .ha-machine-k { font-size: 12px; }
  .ha-stat { padding: 10px 16px 10px 18px; }
  .ha-stat b { font-size: 25px; }
  .ha-stat span:not(.ha-stat-e):not(.ha-fun) { font-size: 13px; }
  .ha-stat-e { font-size: 28px; }
  .ha-fun { font-size: 24px; }
  .ha-secs { font-size: 14px; }
  .ha-clockroom:not(.is-settled) { grid-template-columns: auto; }
  .ha-stats { gap: 10px; }
}
@media (prefers-reduced-motion: reduce) { .ha-lever-knob:not(:disabled) { animation: none; } }
`;
