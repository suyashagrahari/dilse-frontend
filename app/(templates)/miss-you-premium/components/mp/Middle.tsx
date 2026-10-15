"use client";

// Afternoon to golden hour: 4 · the picnic date (drag things onto the
// blanket), 5 · the tear-off calendar down to the day we meet (a live
// countdown), 6 · the message in a bottle (drag it out of the waves, pop the
// cork, the letter unrolls).

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { burst, haptic, useReducedMotion } from "../../../_valentine/kit";
import { PICNIC_ITEMS } from "../../../_valentine/days/miss-you-premium";
import { FONTS } from "../../../_valentine/theme";
import { MP_DISPLAY, MP_HAND } from "./fonts";
import { useMp, useNext } from "./stage";
import { Head, Hint, MpScroll } from "./ui";

// ─── 4 · A picnic date ──────────────────────────────────────────────────────

const SLOTS = [
  { x: 24, y: 36 },
  { x: 52, y: 26 },
  { x: 76, y: 40 },
  { x: 36, y: 66 },
  { x: 66, y: 68 },
];

export function Picnic({ lines, sticker, onNext }: { lines: readonly string[]; sticker: ReactNode; onNext: () => void }) {
  const { cue } = useMp();
  const reduced = useReducedMotion();
  const blanket = useRef<HTMLDivElement | null>(null);
  const [placed, setPlaced] = useState<string[]>([]);
  const [last, setLast] = useState<number | null>(null);
  const done = placed.length >= PICNIC_ITEMS.length;

  const place = (id: string) => {
    if (placed.includes(id)) return;
    const k = PICNIC_ITEMS.findIndex((p) => p.id === id);
    haptic(14);
    cue("plush-squeak", { gain: 0.45, detune: placed.length * 90 });
    cue("pop", { gain: 0.35, at: 0.08 });
    const n = [...placed, id];
    setPlaced(n);
    setLast(k);
    if (n.length === PICNIC_ITEMS.length) {
      cue("chime-cascade", { gain: 0.6, at: 0.2 });
      if (!reduced) window.setTimeout(() => burst({ kind: "petals", emojis: ["🌸", "🌼", "💗", "🍓"], origin: { x: 0.5, y: 0.45 }, count: 24 }), 250);
    }
  };

  const onDrop = (id: string, pt: { x: number; y: number }) => {
    const r = blanket.current?.getBoundingClientRect();
    if (!r) return;
    const pad = 30;
    if (pt.x > r.left - pad && pt.x < r.right + pad && pt.y > r.top - pad && pt.y < r.bottom + pad) place(id);
  };

  useNext(done ? "Can't wait for it 🧺" : null, onNext, "calendar");
  const line = last !== null ? PICNIC_ITEMS[last] : null;
  return (
    <>
      <style>{PICNIC_CSS}</style>
      <Head kicker="Our next date" title={done ? "Our picnic is planned 🧺" : "Set up our picnic"} sub={done ? undefined : `${placed.length} of ${PICNIC_ITEMS.length} on the blanket`} />
      <div className="mp-fill">
        <div className="mp-pic mp-zoom">
          <div className="mp-pic-say" aria-live="polite">
            <AnimatePresence mode="wait" initial={false}>
              {line ? (
                <motion.p key={line.id} className="mp-pic-bubble" initial={reduced ? false : { opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={reduced ? undefined : { opacity: 0, y: -6 }} transition={{ type: "spring", stiffness: 320, damping: 24 }}>
                  <span className="mp-pic-bubble-e" aria-hidden>
                    {line.emoji}
                  </span>
                  <span>{lines[last ?? 0]}</span>
                </motion.p>
              ) : (
                <motion.p key="empty" className="mp-pic-bubble is-empty" initial={false} animate={{ opacity: 1 }}>
                  Everything you love, packed for two.
                </motion.p>
              )}
            </AnimatePresence>
          </div>
          <div className="mp-pic-ground">
            <div className="mp-blanket" ref={blanket} data-mp-blanket>
              <span className="mp-blanket-cloth" aria-hidden />
              {placed.map((id) => {
                const k = PICNIC_ITEMS.findIndex((p) => p.id === id);
                const s = SLOTS[k];
                return (
                  <motion.button
                    type="button"
                    key={id}
                    className="mp-pic-on"
                    style={{ left: `${s.x}%`, top: `${s.y}%` }}
                    initial={reduced ? false : { scale: 0, y: -40 }}
                    animate={{ scale: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 380, damping: 14 }}
                    onClick={() => setLast(k)}
                    aria-label={`${PICNIC_ITEMS[k].label}: read the line again`}
                  >
                    {PICNIC_ITEMS[k].emoji}
                  </motion.button>
                );
              })}
              {done && sticker && (
                <motion.span className="mp-pic-gif" initial={reduced ? false : { scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: -4 }} transition={{ type: "spring", stiffness: 220, damping: 12, delay: reduced ? 0 : 0.4 }}>
                  {sticker}
                </motion.span>
              )}
            </div>
          </div>
          {done ? (
            <p className="mp-pic-again">Tap anything on the blanket to read it again 💗</p>
          ) : (
          <ul className="mp-pic-tray" aria-label="Picnic things">
            {PICNIC_ITEMS.map((it) => {
              const on = placed.includes(it.id);
              return (
                <li key={it.id}>
                  {on ? (
                    <span className="mp-pic-item is-on" aria-hidden>
                      ✓
                    </span>
                  ) : (
                    <motion.button
                      type="button"
                      className="mp-pic-item"
                      drag
                      dragSnapToOrigin
                      dragElastic={0.9}
                      whileDrag={{ scale: 1.3, zIndex: 20, rotate: -6 }}
                      onDragStart={() => cue("swoosh-soft", { gain: 0.25 })}
                      onDragEnd={(_, info) => onDrop(it.id, { x: info.point.x - window.scrollX, y: info.point.y - window.scrollY })}
                      onTap={() => place(it.id)}
                      aria-label={`Put ${it.label.toLowerCase()} on the blanket`}
                      data-mp-item={it.id}
                    >
                      <span aria-hidden>{it.emoji}</span>
                    </motion.button>
                  )}
                </li>
              );
            })}
          </ul>
          )}
        </div>
      </div>
      <Hint show={!done}>Drag each thing onto the blanket</Hint>
    </>
  );
}

const PICNIC_CSS = `
.mp-pic { width: min(100%, 420px); height: 100%; display: grid; grid-template-rows: auto minmax(0, 1fr) auto; gap: clamp(8px, 1.6dvh, 14px); }
.mp-pic-say { min-height: clamp(58px, 9dvh, 78px); display: grid; align-items: end; }
.mp-pic-bubble { position: relative; margin: 0; display: flex; gap: 10px; align-items: center; text-align: left; padding: 10px 14px; border-radius: 20px; background: #FFFFFF;
  font: 400 clamp(16px, 2.4dvh, 19px)/1.3 ${MP_HAND}; color: var(--vw-ink); overflow-wrap: anywhere; box-shadow: 0 0 0 2px var(--vw-edge), 0 14px 24px -16px color-mix(in srgb, var(--mp-deep) 60%, transparent); }
.mp-pic-bubble::after { content: ""; position: absolute; left: 50%; bottom: -9px; width: 16px; height: 16px; background: #FFFFFF; transform: translateX(-50%) rotate(45deg); box-shadow: 2px 2px 0 0 var(--vw-edge); }
.mp-pic-bubble.is-empty { justify-content: center; color: var(--vw-ink-soft); }
.mp-pic-bubble-e { font-size: 26px; flex: none; }
.mp-pic-ground { position: relative; min-height: 0; border-radius: 50% 50% 24px 24px / 22% 22% 24px 24px; display: grid; place-items: center; padding: 6% 4% 4%;
  background: radial-gradient(120% 90% at 50% 0%, #E5F7D8, #C9EBB5 60%, #B5E0A0); box-shadow: inset 0 6px 0 rgba(255,255,255,.5), 0 18px 30px -20px rgba(60,110,50,.5); }
.mp-blanket { position: relative; width: 92%; height: 82%; max-height: 300px; perspective: 600px; }
.mp-blanket-cloth { position: absolute; inset: 0; border-radius: 10px; transform: rotateX(38deg); transform-origin: 50% 100%;
  background: repeating-conic-gradient(color-mix(in srgb, var(--vw-accent) 55%, #FFFFFF) 0 25%, #FFFFFF 0 50%) 0 0 / 34px 34px;
  box-shadow: 0 0 0 5px color-mix(in srgb, var(--vw-accent) 30%, #FFFFFF), 0 22px 26px -14px rgba(40,80,40,.45); }
.mp-blanket-cloth::after { content: ""; position: absolute; inset: 0; border-radius: inherit; background: repeating-conic-gradient(transparent 0 25%, color-mix(in srgb, var(--vw-accent) 18%, transparent) 0 50%) 17px 17px / 34px 34px; }
.mp-pic-on { position: absolute; transform: translate(-50%, -50%); width: 54px; height: 54px; margin: -27px 0 0 -27px; border: 0; padding: 0; background: none; cursor: pointer; font-size: clamp(34px, 6dvh, 44px); line-height: 1;
  filter: drop-shadow(0 6px 4px rgba(40,60,40,.3)); touch-action: manipulation; }
.mp-pic-on:focus-visible { outline: 3px solid var(--vw-ink); outline-offset: 2px; border-radius: 12px; }
.mp-pic-gif { position: absolute; right: -8%; top: -16%; z-index: 3; pointer-events: none; }
/* Phones: a smaller sticker tucked onto the grass corner, off the blanket the items sit on. */
@media (max-width: 599px), (max-height: 700px) { .mp-pic-gif { top: auto; bottom: -16px; right: -14px; } .mp-pic-gif .mp-stk img { width: clamp(46px, 8dvh, 64px) !important; height: auto !important; } }
.mp-pic-tray { list-style: none; margin: 0; padding: 8px; display: flex; justify-content: center; gap: clamp(6px, 2vw, 12px); border-radius: 22px; background: color-mix(in srgb, var(--vw-paper) 82%, transparent); box-shadow: 0 0 0 2px var(--vw-edge); }
.mp-pic-item { width: clamp(50px, 14vw, 60px); height: clamp(50px, 14vw, 60px); border-radius: 18px; border: 0; padding: 0; cursor: grab; display: grid; place-items: center; font-size: clamp(28px, 7vw, 34px); line-height: 1; touch-action: none;
  background: radial-gradient(circle at 40% 30%, #FFFFFF, var(--mp-blush)); box-shadow: 0 4px 0 color-mix(in srgb, var(--mp-deep) 30%, transparent); position: relative; }
.mp-pic-item:active { cursor: grabbing; }
.mp-pic-item:focus-visible { outline: 3px solid var(--vw-ink); outline-offset: 2px; }
.mp-pic-again { margin: 0; min-height: 60px; display: grid; place-items: center; font: 400 clamp(17px, 2.4dvh, 19px) ${MP_HAND}; color: var(--vw-ink); }
.mp-pic-item.is-on { background: color-mix(in srgb, var(--vw-paper) 60%, transparent); box-shadow: inset 0 0 0 2px var(--vw-edge); color: var(--vw-accent-deep); font: 800 22px ${FONTS.ui}; cursor: default; }
`;

// ─── 5 · Tear the calendar down to the day we meet ──────────────────────────

function useNow(on: boolean) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!on) return;
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, [on]);
  return now;
}

export function TearCalendar({ meet, onNext }: { meet: Date | null; onNext: () => void }) {
  const { cue } = useMp();
  const reduced = useReducedMotion();
  const [torn, setTorn] = useState(0);
  const now = useNow(true);
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const days = meet ? Math.round((meet.getTime() - today.getTime()) / 86400000) : null;
  const pages: { big: string; small: string; emoji: string }[] = [
    { big: "Today", small: "missing you", emoji: "🥺" },
    { big: "Tomorrow", small: "missing you a little more", emoji: "🥹" },
    days !== null && days > 2 ? { big: `${days - 2} more`, small: `sleeps after that`, emoji: "🌙" } : { big: "Every day", small: "until I see you", emoji: "🌙" },
  ];
  const total = pages.length;
  const done = torn >= total;
  const drag = useRef<{ y0: number; x0: number } | null>(null);
  const [lift, setLift] = useState(0);

  const tear = () => {
    if (done) return;
    haptic(16);
    cue("paper-rustle", { gain: 0.6, detune: torn * 60 });
    cue("page-turn", { gain: 0.45, at: 0.05 });
    setLift(0);
    setTorn((t) => t + 1);
    if (torn + 1 === total) {
      cue("chime-cascade", { gain: 0.6, at: 0.3 });
      if (!reduced) window.setTimeout(() => burst({ kind: "confetti", origin: { x: 0.5, y: 0.4 }, count: 50 }), 300);
    }
  };
  const down = (e: ReactPointerEvent<HTMLButtonElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { y0: e.clientY, x0: e.clientX };
  };
  const move = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const d = drag.current;
    if (!d) return;
    setLift(Math.max(0, Math.min(1, (d.y0 - e.clientY) / 90 + Math.abs(e.clientX - d.x0) / 160)));
  };
  const up = () => {
    const d = drag.current;
    drag.current = null;
    if (!d) return;
    tear();
  };

  const ms = meet ? Math.max(0, meet.getTime() - now) : 0;
  const cd = { d: Math.floor(ms / 86400000), h: Math.floor(ms / 3600000) % 24, m: Math.floor(ms / 60000) % 60, s: Math.floor(ms / 1000) % 60 };
  const isToday = days !== null && days <= 0;

  useNext(done ? "Counting down ⏳" : null, onNext, "bottle");
  return (
    <>
      <style>{CAL_CSS}</style>
      <Head kicker="Until I see you" title={done ? (meet ? (isToday ? "It's today!! 🥳" : "This is the day ♥") : "Soon. Very soon ♥") : "Tear the days away"} sub={done ? undefined : `${total - torn} ${total - torn === 1 ? "page" : "pages"} to go`} />
      <div className="mp-fill">
        <div className="mp-cal-wrap mp-zoom">
          <div className="mp-cal">
            <span className="mp-cal-rings" aria-hidden>
              <i />
              <i />
            </span>
            <div className="mp-cal-final" data-mp-meet>
              <span className="mp-cal-mon">{meet ? meet.toLocaleDateString("en-IN", { month: "long", year: "numeric" }) : "Someday soon"}</span>
              <span className="mp-cal-day">
                {meet ? meet.getDate() : "♥"}
                <span className="mp-cal-circle" aria-hidden />
              </span>
              <span className="mp-cal-wd">{meet ? meet.toLocaleDateString("en-IN", { weekday: "long" }) : "the day I see you"}</span>
              <span className="mp-cal-note">I see you 💗</span>
            </div>
            <AnimatePresence>
              {pages.map((pg, k) =>
                k >= torn ? (
                  <motion.button
                    type="button"
                    key={k}
                    className="mp-cal-page"
                    style={{ zIndex: total - k, ["--lift" as string]: k === torn ? String(lift) : "0" }}
                    exit={reduced ? { opacity: 0 } : { y: -260, x: k % 2 ? 90 : -90, rotate: k % 2 ? 28 : -26, opacity: 0, transition: { duration: 0.55, ease: [0.3, 0.6, 0.4, 1] } }}
                    disabled={k !== torn}
                    tabIndex={k === torn ? 0 : -1}
                    onPointerDown={down}
                    onPointerMove={move}
                    onPointerUp={up}
                    onPointerCancel={() => {
                      drag.current = null;
                      setLift(0);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        tear();
                      }
                    }}
                    aria-label={`Tear off: ${pg.big}, ${pg.small}`}
                    data-mp-page={k}
                  >
                    <span className="mp-cal-mon">{k === 0 ? today.toLocaleDateString("en-IN", { month: "long" }) : "…"}</span>
                    <span className="mp-cal-big">{pg.big}</span>
                    <span className="mp-cal-small">
                      {pg.small} {pg.emoji}
                    </span>
                    <span className="mp-cal-perf" aria-hidden />
                  </motion.button>
                ) : null,
              )}
            </AnimatePresence>
          </div>
          <div className={`mp-cd${done ? " is-on" : ""}`} aria-live="polite">
            {done &&
              (meet && !isToday ? (
                <>
                  {(["d", "h", "m", "s"] as const).map((u) => (
                    <span key={u} className="mp-cd-box">
                      <b>{String(cd[u]).padStart(2, "0")}</b>
                      <small>{{ d: "days", h: "hours", m: "mins", s: "secs" }[u]}</small>
                    </span>
                  ))}
                </>
              ) : (
                <p className="mp-cd-soon">{isToday ? "No more countdown. Just us. 🥳" : "No date yet, but I'm counting anyway ⏳"}</p>
              ))}
          </div>
        </div>
      </div>
      <Hint show={!done}>Swipe up (or tap) to tear a page off</Hint>
    </>
  );
}

const CAL_CSS = `
.mp-cal-wrap { width: min(100%, 360px); height: 100%; display: grid; grid-template-rows: minmax(0, 1fr) auto; gap: clamp(10px, 2dvh, 18px); justify-items: center; align-items: center; }
.mp-cal { position: relative; width: min(74cqw, 50cqh, 270px); aspect-ratio: 0.86; }
.mp-cal-rings { position: absolute; left: 22%; right: 22%; top: -14px; z-index: 30; display: flex; justify-content: space-between; pointer-events: none; }
.mp-cal-rings i { width: 16px; height: 30px; border-radius: 10px; border: 4px solid color-mix(in srgb, var(--mp-deep) 50%, #999); background: transparent; box-sizing: border-box; }
.mp-cal-final, .mp-cal-page { position: absolute; inset: 0; border-radius: 18px; display: grid; align-content: center; justify-items: center; gap: 2px; box-sizing: border-box; padding: 34px 12px 14px; overflow: hidden; }
.mp-cal-final { background: #FFFFFF; box-shadow: 0 0 0 3px var(--vw-edge), 0 6px 0 -1px #FFFFFF, 0 6px 0 2px var(--vw-edge), 0 12px 0 -2px #FFFFFF, 0 12px 0 1px var(--vw-edge), 0 30px 40px -22px color-mix(in srgb, var(--mp-deep) 70%, transparent); }
.mp-cal-final::before, .mp-cal-page::before { content: ""; position: absolute; left: 0; right: 0; top: 0; height: 26px; background: var(--vw-accent); }
.mp-cal-page { border: 0; cursor: grab; touch-action: none; font: inherit; color: inherit; background: linear-gradient(180deg, #FFFFFF, var(--vw-paper));
  box-shadow: 0 0 0 3px var(--vw-edge), 0 2px 0 3px color-mix(in srgb, var(--vw-edge) 70%, #FFFFFF);
  transform-origin: 50% 0; transform: rotateX(calc(var(--lift) * 34deg)) translateY(calc(var(--lift) * -10px)); transition: transform .12s ease; }
.mp-cal-page:focus-visible { outline: 3px solid var(--vw-ink); outline-offset: 4px; }
.mp-cal-perf { position: absolute; left: 6px; right: 6px; top: 30px; border-top: 2.5px dashed color-mix(in srgb, var(--vw-accent) 35%, transparent); }
.mp-cal-mon { font: 700 12px ${FONTS.ui}; letter-spacing: .14em; text-transform: uppercase; color: var(--vw-ink-soft); }
.mp-cal-big { font: 800 clamp(34px, 11cqw, 48px)/1.05 ${MP_DISPLAY}; color: var(--vw-ink); overflow-wrap: anywhere; }
.mp-cal-small { font: 400 clamp(17px, 5cqw, 21px)/1.25 ${MP_HAND}; color: var(--vw-ink-soft); }
.mp-cal-day { position: relative; font: 800 clamp(70px, 24cqw, 104px)/1 ${MP_DISPLAY}; color: var(--vw-accent-deep); }
.mp-cal-wd { font: 700 15px ${FONTS.ui}; color: var(--vw-ink); }
.mp-cal-day { display: inline-block; padding: 0 .2em; }
.mp-cal-circle { position: absolute; left: 50%; top: 50%; width: calc(100% + .4em); height: 1.08em; transform: translate(-50%, -50%) rotate(-8deg); border: 3.5px solid var(--vw-accent); border-radius: 50%; opacity: .7; pointer-events: none; }
.mp-cal-note { font: 700 clamp(18px, 5cqw, 21px) ${MP_HAND}; color: var(--vw-accent-deep); transform: rotate(-4deg); margin-top: 4px; }
.mp-cd { min-height: 66px; display: flex; gap: 8px; justify-content: center; }
.mp-cd-box { width: 66px; padding: 8px 0 6px; border-radius: 16px; display: grid; justify-items: center; background: #FFFFFF; box-shadow: 0 0 0 2px var(--vw-edge), 0 10px 18px -12px color-mix(in srgb, var(--mp-deep) 60%, transparent); }
.mp-cd-box b { font: 800 26px/1 ${MP_DISPLAY}; color: var(--vw-accent-deep); font-variant-numeric: tabular-nums; }
.mp-cd-box small { font: 700 11px ${FONTS.ui}; letter-spacing: .08em; text-transform: uppercase; color: var(--vw-ink-soft); }
.mp-cd-soon { margin: 0; align-self: center; font: 400 clamp(18px, 2.6dvh, 21px) ${MP_HAND}; color: var(--vw-ink); }
@media (max-width: 359px) { .mp-cd-box { width: 58px; } }
/* Landscape phones: the page and the countdown sit side by side. */
@media (orientation: landscape) and (max-height: 500px) {
  .mp-cal-wrap { width: 100%; grid-template-columns: auto auto; grid-template-rows: minmax(0, 1fr); justify-content: center; gap: 22px; }
  .mp-cal { width: min(40cqw, 70cqh, 220px); }
  .mp-cal-big { font-size: 30px; } .mp-cal-small, .mp-cal-note { font-size: 16px; } .mp-cal-day { font-size: 62px; }
  .mp-cal-final, .mp-cal-page { padding-top: 30px; }
  .mp-cd { flex-wrap: wrap; width: 140px; gap: 8px; }
}
`;

// ─── 6 · A message in a bottle ──────────────────────────────────────────────

export function Bottle({ letter, recipient, petName, sender, onNext }: { letter: string; recipient: string; petName: string; sender: string; onNext: () => void }) {
  const { cue } = useMp();
  const reduced = useReducedMotion();
  const beach = useRef<HTMLDivElement | null>(null);
  const [stage, setStage] = useState<"sea" | "sand" | "open">("sea");
  const [dy, setDy] = useState(0);
  const drag = useRef<{ y0: number; h: number; moved: boolean } | null>(null);
  // Which stage the bottle was in when this press began: the click that ends the drag must not also pop the cork.
  const pressedIn = useRef<"sea" | "sand" | "open">("sea");

  const land = () => {
    if (stage !== "sea") return;
    setStage("sand");
    setDy(0);
    haptic(18);
    cue("swoosh-soft", { gain: 0.5 });
    cue("glass-ping", { gain: 0.4, at: 0.35 });
  };
  const uncork = () => {
    if (stage !== "sand") return;
    haptic([10, 30, 20]);
    cue("pop", { gain: 0.9 });
    cue("paper-rustle", { gain: 0.6, at: 0.3 });
    cue("page-turn", { gain: 0.4, at: 0.55 });
    setStage("open");
    if (!reduced) burst({ kind: "sparkles", origin: { x: 0.5, y: 0.5 }, count: 18, spread: 0.3 });
  };
  const down = (e: ReactPointerEvent<HTMLButtonElement>) => {
    pressedIn.current = stage;
    if (stage !== "sea") return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { y0: e.clientY, h: beach.current?.clientHeight ?? 400, moved: false };
    cue("bubble", { gain: 0.3 });
  };
  const move = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const d = drag.current;
    if (!d) return;
    const v = Math.max(0, e.clientY - d.y0);
    if (v > 6) d.moved = true;
    setDy(v);
    if (v > d.h * 0.3) {
      drag.current = null;
      land();
    }
  };
  const up = () => {
    const d = drag.current;
    drag.current = null;
    if (!d) return;
    if (!d.moved || dy > d.h * 0.18) land();
    else setDy(0);
  };

  useNext(stage === "open" ? "I read every word" : null, onNext, "heart");
  return (
    <>
      <style>{BOTTLE_CSS}</style>
      <Head
        kicker="Washed up for you"
        title={stage === "open" ? `Dear ${petName || recipient},` : stage === "sand" ? "Pop the cork" : "A bottle is floating your way"}
        sub={stage === "open" ? undefined : undefined}
      />
      <div className="mp-fill">
        {stage !== "open" ? (
          <div className="mp-beach mp-zoom" ref={beach}>
            <span className="mp-sea" aria-hidden>
              <svg className="mp-wave is-a" viewBox="0 0 400 40" preserveAspectRatio="none">
                <path d="M0 20 Q 25 6 50 20 T 100 20 T 150 20 T 200 20 T 250 20 T 300 20 T 350 20 T 400 20 V40 H0 Z" />
              </svg>
              <svg className="mp-wave is-b" viewBox="0 0 400 40" preserveAspectRatio="none">
                <path d="M0 20 Q 25 6 50 20 T 100 20 T 150 20 T 200 20 T 250 20 T 300 20 T 350 20 T 400 20 V40 H0 Z" />
              </svg>
              <span className="mp-glint" />
            </span>
            <span className="mp-sand" aria-hidden>
              <span className="mp-shell is-a">🐚</span>
              <span className="mp-shell is-b">⭐</span>
            </span>
            <button
              type="button"
              className={`mp-bottle is-${stage}`}
              style={stage === "sea" ? { transform: `translate(-50%, ${dy}px)` } : undefined}
              onPointerDown={down}
              onPointerMove={move}
              onPointerUp={up}
              onPointerCancel={up}
              onClick={(e) => {
                // detail 0 = keyboard (Enter/Space): it lands the bottle, then pops the cork.
                const kb = e.detail === 0;
                if (stage === "sea" && kb) land();
                else if (stage === "sand" && (kb || pressedIn.current === "sand")) uncork();
              }}
              aria-label={stage === "sea" ? "Pull the bottle out of the waves" : "Pop the cork"}
              data-mp-bottle={stage}
            >
              <BottleArt />
            </button>
            {stage === "sea" && (
              <svg className="mp-wave is-front" viewBox="0 0 400 40" preserveAspectRatio="none" aria-hidden>
                <path d="M0 20 Q 25 6 50 20 T 100 20 T 150 20 T 200 20 T 250 20 T 300 20 T 350 20 T 400 20 V40 H0 Z" />
              </svg>
            )}
          </div>
        ) : (
          <motion.article className="mp-scrollpaper mp-zoom" initial={reduced ? false : { scaleY: 0.1, opacity: 0 }} animate={{ scaleY: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 140, damping: 18 }} data-mp-letter>
            <span className="mp-rod is-top" aria-hidden />
            <MpScroll className="mp-letter-scroll" label="The letter">
              <div className="mp-letter">
                {letter.split(/\n{2,}/).map((para, k) => (
                  <p key={k}>{para}</p>
                ))}
                <p className="mp-letter-sign">
                  Missing you, always,
                  <br />
                  <b>{sender}</b> 💌
                </p>
              </div>
            </MpScroll>
            <span className="mp-rod is-bot" aria-hidden />
          </motion.article>
        )}
      </div>
      <Hint show={stage !== "open"}>{stage === "sea" ? "Drag the bottle down onto the sand" : "Tap the cork to pop it"}</Hint>
    </>
  );
}

function BottleArt() {
  return (
    <svg viewBox="0 0 80 150" width="100%" height="100%" aria-hidden>
      <defs>
        <linearGradient id="mpGlass" x1="0" x2="1">
          <stop offset="0" stopColor="#E9FBFF" stopOpacity=".95" />
          <stop offset=".5" stopColor="#BFEFF5" stopOpacity=".7" />
          <stop offset="1" stopColor="#9EDFEA" stopOpacity=".9" />
        </linearGradient>
      </defs>
      <rect className="mp-cork" x="31" y="4" width="18" height="18" rx="4" fill="#D8A878" stroke="#B5845A" strokeWidth="2" />
      <path d="M30 22 h20 v18 c0 8 18 14 18 36 v54 c0 9 -7 14 -14 14 h-28 c-7 0 -14 -5 -14 -14 v-54 c0 -22 18 -28 18 -36 z" fill="url(#mpGlass)" stroke="#7CC6D3" strokeWidth="2.5" />
      <rect x="22" y="66" width="36" height="58" rx="7" fill="#FFF6E2" stroke="#E7CFA6" strokeWidth="2" transform="rotate(-6 40 95)" />
      <path d="M28 78 h22 M28 88 h18 M28 98 h22 M28 108 h14" stroke="#D6B98A" strokeWidth="2" strokeLinecap="round" transform="rotate(-6 40 95)" />
      <path d="M40 112 c-6 -5 -9 -8 -7 -11 c2 -3 5 -2 7 0 c2 -2 5 -3 7 0 c2 3 -1 6 -7 11 z" fill="var(--vw-accent)" transform="rotate(-6 40 95)" />
      <path d="M24 60 q-4 20 0 50" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" fill="none" opacity=".8" />
    </svg>
  );
}

const BOTTLE_CSS = `
.mp-beach { position: relative; width: min(100%, 420px); height: 100%; max-height: 560px; border-radius: 28px; overflow: hidden;
  box-shadow: 0 0 0 3px #FFFFFF, 0 24px 40px -24px color-mix(in srgb, var(--mp-deep) 60%, transparent); }
.mp-sea { position: absolute; left: 0; right: 0; top: 0; height: 56%; background: linear-gradient(180deg, #BFE6F2 0%, #9ED7E8 60%, #8BCFE0 100%); }
.mp-glint { position: absolute; left: 20%; right: 20%; top: 18%; height: 30%; background: radial-gradient(closest-side, rgba(255,240,200,.75), transparent); filter: blur(4px); }
.mp-wave { position: absolute; left: -50%; width: 200%; height: 34px; }
.mp-wave path { fill: #FFFFFF; }
.mp-wave.is-a { bottom: -8px; opacity: .9; animation: mp-wave-x 7s linear infinite; }
.mp-wave.is-b { bottom: 14px; opacity: .45; animation: mp-wave-x 11s linear infinite reverse; }
@keyframes mp-wave-x { from { transform: translateX(0) } to { transform: translateX(25%) } }
.mp-sand { position: absolute; left: 0; right: 0; bottom: 0; height: 44%; background: radial-gradient(140% 100% at 50% 100%, #FFE2B8, #FFF0D3 70%, #FFF6E4);
  background-image: radial-gradient(circle, rgba(200,150,90,.25) 1px, transparent 1.5px), radial-gradient(140% 100% at 50% 100%, #FFE2B8, #FFF0D3 70%, #FFF6E4); background-size: 14px 14px, 100% 100%; }
.mp-shell { position: absolute; font-size: 22px; }
.mp-shell.is-a { left: 12%; bottom: 18%; } .mp-shell.is-b { right: 14%; bottom: 30%; font-size: 18px; }
.mp-bottle { position: absolute; left: 50%; width: clamp(64px, 13dvh, 92px); aspect-ratio: 80 / 150; border: 0; padding: 0; background: none; cursor: grab; touch-action: none;
  filter: drop-shadow(0 10px 8px rgba(40,90,110,.3)); transition: top .7s cubic-bezier(.3,1.3,.5,1), transform .7s cubic-bezier(.3,1.3,.5,1); }
.mp-bottle.is-sea { top: 13%; animation: mp-bob-sea 2.6s ease-in-out infinite; transition: none; }
@keyframes mp-bob-sea { 0%, 100% { rotate: -62deg; translate: 0 0 } 50% { rotate: -48deg; translate: 0 -10px } }
.mp-wave.is-front { top: calc(56% - 46px); bottom: auto; height: 40px; opacity: .92; pointer-events: none; animation: mp-wave-x 9s linear infinite; }
.mp-wave.is-front path { fill: #A9DCEA; }
.mp-bottle.is-sand { top: 56%; transform: translate(-50%, 0) rotate(72deg); cursor: pointer; animation: mp-wiggle-sand 1.6s ease-in-out 1s infinite; }
@keyframes mp-wiggle-sand { 0%, 100% { rotate: 0deg } 10% { rotate: -6deg } 20% { rotate: 5deg } 30% { rotate: 0deg } }
.mp-bottle:focus-visible { outline: 3px solid var(--vw-ink); outline-offset: 4px; border-radius: 16px; }
.mp-scrollpaper { position: relative; width: min(100%, 440px); max-height: 100%; height: 100%; display: grid; grid-template-rows: auto minmax(0, 1fr) auto; transform-origin: 50% 50%; }
.mp-rod { height: 18px; border-radius: 99px; margin: 0 -10px; background: linear-gradient(180deg, #E7C08F, #C99A62 60%, #A97A45); box-shadow: 0 4px 8px -4px rgba(0,0,0,.3); position: relative; z-index: 2; }
.mp-letter-scroll { background: linear-gradient(180deg, #FFF8E8, #FFF3DA); box-shadow: inset 12px 0 18px -14px rgba(160,110,50,.4), inset -12px 0 18px -14px rgba(160,110,50,.4); }
.mp-letter-scroll .mp-scroll-view { padding: 4px 22px 6px 20px; }
.mp-letter-scroll .mp-scroll-rail { right: 6px; }
.mp-letter { text-align: left; padding: 10px 2px 14px; }
.mp-letter p { margin: 0 0 14px; font: 400 clamp(18px, 2.6dvh, 21px)/1.5 ${MP_HAND}; color: #4A3326; overflow-wrap: anywhere; white-space: pre-line; }
.mp-letter-sign { text-align: right; }
.mp-letter-sign b { font: 800 22px ${MP_DISPLAY}; color: var(--vw-accent-deep); }
@media (prefers-reduced-motion: reduce) { .mp-wave, .mp-bottle.is-sea, .mp-bottle.is-sand { animation: none !important; } }
`;
