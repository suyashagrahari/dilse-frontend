"use client";

// The second act: our firsts on vinyl, the little things on a breakfast tray,
// the memory quilt, and the book.
//
//   • Firsts — a shelf of pastel records; she drags one onto the turntable
//     (or taps it), then drags the tonearm onto the record: it spins and the
//     "first" plays.
//   • Little things — a breakfast tray; tap the mug, the toast, the note…
//     each lifts and shows a small daily habit the sender loves.
//   • Quilt — a heart-shaped quilt of blank patches; she runs a finger across
//     them to stitch them in (photos + reasons), then taps one to look closer.
//   • Book — the letter, hand-bound: drag or tap the page edge to turn the
//     pages in 3D, one paragraph a page.

import { useCallback, useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CroppedPhoto, burst, haptic, useReducedMotion } from "../../../_valentine/kit";
import type { AnniFirst } from "../../../_valentine/days/anniversary-premium";
import type { LovePhoto } from "../../../_valentine/types";
import { AP_HAND, AP_SANS, AP_SCRIPT, AP_SERIF } from "./fonts";
import { useAp, useNext } from "./stage";
import { ApScroll, Head, Hint } from "./ui";

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const VINYL = ["#F3B6C6", "#B9D7F2", "#F6D79B", "#C9B8F0", "#B6E2C8"];

// ─── 4 · Our firsts (vinyl) ─────────────────────────────────────────────────

export function Firsts({ firsts, sticker, onNext }: { firsts: AnniFirst[]; sticker: ReactNode; onNext: () => void }) {
  const { cue } = useAp();
  const reduced = useReducedMotion();
  const [loaded, setLoaded] = useState<number | null>(null);
  const [arm, setArm] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [played, setPlayed] = useState<Set<number>>(() => new Set());
  const platterRef = useRef<HTMLDivElement | null>(null);
  const pivotRef = useRef<HTMLDivElement | null>(null);
  const PLAY = 30;

  const load = (k: number) => {
    if (loaded === k) return;
    haptic(14);
    cue("whoosh", { gain: 0.3 });
    cue("snap", { gain: 0.3, at: 0.25 });
    setPlaying(false);
    setArm(0);
    setLoaded(k);
  };

  const drop = useCallback(() => {
    if (loaded === null || playing) return;
    setArm(PLAY);
    setPlaying(true);
    haptic([12, 30, 12]);
    cue("static", { gain: 0.25, dur: 0.5 });
    cue("chime", { gain: 0.5, at: 0.35 });
    setPlayed((s) => (s.has(loaded) ? s : new Set(s).add(loaded)));
    if (!reduced) burst({ kind: "sparkles", origin: { x: 0.5, y: 0.45 }, count: 14 });
  }, [loaded, playing, cue, reduced]);

  const armDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (loaded === null || playing) return;
    const pv = pivotRef.current?.getBoundingClientRect();
    if (!pv) return;
    const el = e.currentTarget;
    el.setPointerCapture(e.pointerId);
    const cx = pv.left + pv.width / 2;
    const cy = pv.top + pv.height / 2;
    const base = Math.atan2(e.clientY - cy, e.clientX - cx);
    const start = arm;
    let armNow = arm;
    const sx = e.clientX;
    const sy = e.clientY;
    const move = (ev: PointerEvent) => {
      const a = Math.atan2(ev.clientY - cy, ev.clientX - cx);
      let d = ((a - base) * 180) / Math.PI;
      if (d > 180) d -= 360;
      if (d < -180) d += 360;
      armNow = clamp(start + d, 0, PLAY + 4);
      setArm(armNow);
    };
    const up = (ev: PointerEvent) => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
      const tap = Math.hypot(ev.clientX - sx, ev.clientY - sy) < 6;
      if (tap || armNow > PLAY * 0.6) drop();
      else setArm(0);
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
  };

  const onSleeveDragEnd = (k: number, x: number, y: number) => {
    const r = platterRef.current?.getBoundingClientRect();
    if (r && x > r.left - 20 && x < r.right + 20 && y > r.top - 20 && y < r.bottom + 20) load(k);
  };

  const enough = played.size >= Math.min(firsts.length, 2);
  useNext(enough ? (played.size >= firsts.length ? "The little things" : "The little things") : null, onNext, "heart");
  const cur = loaded !== null ? firsts[loaded] : null;
  return (
    <>
      <Head kicker="Side A · our firsts" title={<>Play our <em>firsts</em></>} sub={loaded === null ? "Every first is a record. Pick one." : playing ? undefined : "Now lower the needle onto the record."} />
      <div className="ap-fill">
        <div className="ap-vinyl">
          <div className="ap-deck">
            <div ref={platterRef} className={`ap-platter${playing ? " is-playing" : ""}`} data-ap-platter>
              <AnimatePresence>
                {loaded !== null && (
                  <motion.div
                    key={loaded}
                    className="ap-record"
                    style={{ ["--vc" as string]: VINYL[loaded % VINYL.length] }}
                    initial={reduced ? false : { x: "-60%", y: "80%", scale: 0.6, opacity: 0 }}
                    animate={{ x: 0, y: 0, scale: 1, opacity: 1 }}
                    exit={reduced ? undefined : { x: "-70%", y: "90%", scale: 0.5, opacity: 0, transition: { duration: 0.3 } }}
                    transition={{ type: "spring", stiffness: 170, damping: 18 }}
                  >
                    <span className="ap-record-label">
                      <b>{firsts[loaded].title}</b>
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
              {loaded === null && <span className="ap-platter-hint">drop a record here</span>}
            </div>
            <div ref={pivotRef} className="ap-arm-pivot" aria-hidden />
            <button
              type="button"
              className={`ap-arm${loaded !== null && !playing ? " is-ready" : ""}`}
              style={{ transform: `rotate(${arm}deg)` }}
              onPointerDown={armDown}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  drop();
                }
              }}
              disabled={loaded === null || playing}
              aria-label="Lower the needle onto the record"
              data-ap-arm
            >
              <span className="ap-arm-rod" />
              <span className="ap-arm-head" />
            </button>
            {playing && (
              <span className="ap-notes" aria-hidden>
                {["♪", "♫", "♬", "♪"].map((n, k) => (
                  <i key={k} style={{ animationDelay: `${k * 0.6}s`, left: `${30 + k * 14}%` }}>
                    {n}
                  </i>
                ))}
              </span>
            )}
            {playing && <div className="ap-vinyl-stk">{sticker}</div>}
          </div>
          <div className="ap-shelf" role="list" aria-label="Records">
            {firsts.map((f, k) => (
              <motion.button
                key={k}
                type="button"
                role="listitem"
                className={`ap-sleeve${loaded === k ? " is-out" : ""}${played.has(k) ? " is-played" : ""}`}
                style={{ ["--vc" as string]: VINYL[k % VINYL.length] }}
                drag
                dragSnapToOrigin
                dragElastic={0.6}
                whileDrag={{ scale: 1.08, rotate: -6, zIndex: 5 }}
                onDragEnd={(_, info) => onSleeveDragEnd(k, info.point.x - window.scrollX, info.point.y - window.scrollY)}
                onTap={() => load(k)}
                aria-label={`Play the record: ${f.title}`}
                data-ap-sleeve={k}
              >
                <span className="ap-sleeve-disc" aria-hidden />
                <span className="ap-sleeve-t">{f.title}</span>
                {played.has(k) && <span className="ap-sleeve-tick" aria-hidden>♥</span>}
              </motion.button>
            ))}
          </div>
        </div>
      </div>
      <div className="ap-foot ap-vinyl-foot">
        <AnimatePresence mode="wait">
          {playing && cur ? (
            <motion.div key={loaded} className="ap-now" initial={reduced ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={reduced ? undefined : { opacity: 0 }} data-ap-now>
              <p className="ap-now-k">♪ Now playing</p>
              <p className="ap-now-t">{cur.title}</p>
              {cur.line && <p className="ap-now-l">{cur.line}</p>}
            </motion.div>
          ) : (
            <motion.div key="hint" initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={reduced ? undefined : { opacity: 0 }}>
              <Hint hand={loaded === null ? "👆" : "🎚️"}>{loaded === null ? "Drag a record onto the turntable" : "Drag the needle onto the record"}</Hint>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <style>{VINYL_CSS}</style>
    </>
  );
}

const VINYL_CSS = `
.ap-vinyl { width: 100%; height: 100%; display: grid; grid-template-rows: minmax(0, 1fr) auto; justify-items: center; align-items: center; gap: clamp(8px, 2cqh, 18px); }
.ap-deck { position: relative; height: min(100%, 78cqw, 560px); aspect-ratio: 1.22; max-width: 100%; border-radius: 26px; box-sizing: border-box;
  background: linear-gradient(160deg, #FFFFFF, var(--ap-blush) 60%, color-mix(in srgb, var(--ap-foil) 40%, var(--ap-blush)));
  box-shadow: inset 0 0 0 1.5px color-mix(in srgb, var(--ap-foil) 70%, transparent), inset 0 -8px 0 color-mix(in srgb, var(--ap-foil) 30%, transparent), 0 28px 50px -28px var(--ap-deep); }
.ap-platter { position: absolute; left: 7%; top: 50%; transform: translateY(-50%); width: 64%; aspect-ratio: 1; border-radius: 50%;
  background: radial-gradient(circle, #FFFFFF 0 6%, color-mix(in srgb, var(--ap-foil) 30%, #EEE) 6.5% 8%, #F4F1EC 8.5%, #E7E2DA 70%, #D9D2C6 71% 73%, #EFEAE2 74%); box-shadow: 0 6px 14px -6px rgba(0,0,0,.25), inset 0 0 0 2px rgba(255,255,255,.7); display: grid; place-items: center; }
.ap-platter-hint { font: 600 clamp(11px, 2.4cqmin, 14px) ${AP_SANS}; color: var(--vw-ink-soft); letter-spacing: .06em; padding: 6px 10px; border-radius: 99px; border: 1.5px dashed color-mix(in srgb, var(--ap-foil) 70%, transparent); background: rgba(255,255,255,.6); }
.ap-record { position: absolute; inset: 2%; border-radius: 50%; display: grid; place-items: center;
  background: repeating-radial-gradient(circle, color-mix(in srgb, var(--vc) 82%, #000) 0 1px, var(--vc) 1.4px 3.4px), var(--vc);
  box-shadow: inset 0 0 0 3px color-mix(in srgb, var(--vc) 70%, #000), 0 4px 10px rgba(0,0,0,.2); }
.ap-record::after { content: ""; position: absolute; inset: 0; border-radius: 50%; background: conic-gradient(from 20deg, rgba(255,255,255,.45), transparent 18%, transparent 50%, rgba(255,255,255,.3) 62%, transparent 76%); }
.ap-platter.is-playing .ap-record { animation: ap-spin 1.8s linear infinite; }
@keyframes ap-spin { to { transform: rotate(360deg) } }
.ap-record-label { position: relative; z-index: 1; width: 40%; aspect-ratio: 1; border-radius: 50%; display: grid; place-items: center; padding: 8%; box-sizing: border-box; text-align: center;
  background: radial-gradient(circle, #111 0 4%, #FFFDF8 5%); box-shadow: inset 0 0 0 2px var(--ap-foil); }
.ap-record-label b { font: 600 clamp(10px, 2.6cqmin, 15px)/1.05 ${AP_SERIF}; color: var(--vw-ink); overflow: hidden; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; }
.ap-arm-pivot { position: absolute; right: 9%; top: 12%; width: 9%; aspect-ratio: 1; border-radius: 50%; background: radial-gradient(circle at 40% 35%, #FFFFFF, var(--ap-foil)); box-shadow: 0 3px 6px rgba(0,0,0,.2); }
.ap-arm { position: absolute; right: calc(9% + 4.5% - 22px); top: calc(12% + 0px); width: 44px; height: 66%; padding: 0; border: 0; background: none; cursor: grab; touch-action: none; transform-origin: 50% calc(4.5cqmin + 0px);
  transform-origin: 22px 22px; transition: transform .35s cubic-bezier(.3,1.3,.5,1); }
.ap-arm:disabled { cursor: default; }
.ap-arm-rod { position: absolute; left: 19px; top: 18px; width: 6px; height: calc(100% - 36px); border-radius: 3px; background: linear-gradient(90deg, #FFFFFF, color-mix(in srgb, var(--ap-foil) 80%, #999)); box-shadow: 1px 2px 3px rgba(0,0,0,.2); }
.ap-arm-head { position: absolute; left: 10px; bottom: 6px; width: 24px; height: 34px; border-radius: 6px; background: linear-gradient(160deg, #FFFFFF, var(--ap-foil)); box-shadow: 0 3px 6px rgba(0,0,0,.25); transform: rotate(18deg); }
.ap-arm.is-ready .ap-arm-head { animation: ap-arm-nudge 1.4s ease-in-out infinite; box-shadow: 0 0 0 3px color-mix(in srgb, var(--vw-accent) 50%, transparent), 0 3px 6px rgba(0,0,0,.25); }
@keyframes ap-arm-nudge { 0%, 100% { transform: rotate(18deg) translateX(0) } 50% { transform: rotate(18deg) translateX(-5px) } }
.ap-arm:focus-visible { outline: 3px solid var(--vw-ink); outline-offset: 2px; border-radius: 10px; }
.ap-notes { position: absolute; inset: 0; pointer-events: none; }
.ap-notes i { position: absolute; top: 40%; font: 600 clamp(18px, 5cqmin, 30px)/1 ${AP_SERIF}; font-style: normal; color: var(--vw-accent); opacity: 0; animation: ap-note 2.4s ease-out infinite; }
@keyframes ap-note { 0% { opacity: 0; transform: translate(0, 0) rotate(-10deg) } 20% { opacity: 1 } 100% { opacity: 0; transform: translate(20px, -120px) rotate(14deg) } }
.ap-vinyl-stk { position: absolute; right: -2%; bottom: -8%; transform: rotate(6deg); pointer-events: none; z-index: 2; }
.ap-vinyl-stk .ap-stk { transform: none; }
/* On a small deck the dancing pair shrinks and steps off the corner so it never sits on the tone arm. */
.ap-vinyl-stk .ap-stk > span { width: clamp(46px, 17cqh, 84px) !important; height: auto !important; }
.ap-vinyl-stk .ap-stk img { width: 100% !important; height: auto !important; }
@container (max-height: 420px) { .ap-vinyl-stk { right: -5%; bottom: -16%; } .ap-vinyl-stk .ap-stk { padding: 4px; border-radius: 16px; } .ap-vinyl-stk .ap-stk img { border-radius: 12px; } }
.ap-shelf { display: flex; gap: clamp(8px, 2cqw, 14px); max-width: 100%; overflow-x: auto; overflow-y: visible; padding: 10px 6px 8px; scrollbar-width: none; }
.ap-shelf::-webkit-scrollbar { display: none; }
.ap-sleeve { position: relative; flex: none; width: clamp(62px, min(19cqw, 15cqh), 120px); aspect-ratio: 1; border: 0; padding: 8px; border-radius: 10px; cursor: grab; touch-action: none; overflow: hidden;
  display: grid; align-content: end; text-align: left; box-sizing: border-box;
  background: linear-gradient(150deg, #FFFFFF, color-mix(in srgb, var(--vc) 55%, #FFFFFF)); box-shadow: inset 0 0 0 1.5px color-mix(in srgb, var(--vc) 70%, #FFF), 0 10px 18px -10px var(--ap-deep); transition: opacity .25s, transform .25s; }
.ap-sleeve-disc { position: absolute; right: -28%; top: -28%; width: 80%; aspect-ratio: 1; border-radius: 50%; background: repeating-radial-gradient(circle, color-mix(in srgb, var(--vc) 80%, #000) 0 1px, var(--vc) 1.4px 3px); opacity: .9; }
.ap-sleeve-t { position: relative; font: 600 clamp(13px, 2cqh, 16px)/1.05 ${AP_SERIF}; color: var(--vw-ink); overflow-wrap: anywhere; }
.ap-sleeve.is-out { opacity: .35; transform: translateY(6px); }
.ap-sleeve-tick { position: absolute; left: 7px; top: 5px; font-size: 13px; color: var(--vw-accent); }
.ap-sleeve:focus-visible { outline: 3px solid var(--vw-ink); outline-offset: 2px; }
.ap-vinyl-foot { min-height: 70px; }
.ap-now { display: grid; gap: 2px; justify-items: center; max-width: 440px; }
.ap-now-k { margin: 0; font: 700 11.5px ${AP_SANS}; letter-spacing: .16em; text-transform: uppercase; color: var(--vw-accent-deep); }
.ap-now-t { margin: 0; font: 600 clamp(20px, 3dvh, 26px)/1.1 ${AP_SERIF}; color: var(--vw-ink); }
.ap-now-l { margin: 0; font: 500 clamp(18px, 2.6dvh, 22px)/1.2 ${AP_HAND}; color: var(--vw-ink-soft); overflow-wrap: anywhere; }
@media (min-width: 1100px) { .ap-now { justify-items: start; text-align: left; } .ap-now-t { font-size: 30px; } .ap-now-l { font-size: 24px; } }
@media (prefers-reduced-motion: reduce) { .ap-platter.is-playing .ap-record { animation-duration: 6s; } .ap-notes, .ap-arm.is-ready .ap-arm-head { animation: none; display: none; } }
`;

// ─── 5 · The little things (breakfast tray) ─────────────────────────────────

type TrayItem = "mug" | "toast" | "note" | "flower" | "jam" | "spoon";
const TRAY: { id: TrayItem; x: number; y: number; w: number; label: string }[] = [
  { id: "mug", x: 23, y: 33, w: 29, label: "the mug" },
  { id: "toast", x: 55, y: 28, w: 30, label: "the toast" },
  { id: "note", x: 82, y: 54, w: 24, label: "the note" },
  { id: "flower", x: 18, y: 66, w: 24, label: "the flower" },
  { id: "jam", x: 43, y: 68, w: 21, label: "the jam" },
  { id: "spoon", x: 64, y: 72, w: 26, label: "the spoon" },
];

function TrayArt({ id }: { id: TrayItem }) {
  switch (id) {
    case "mug":
      return (
        <svg viewBox="0 0 100 100" aria-hidden>
          <path className="ap-steam" d="M40 22 q-6 -8 0 -14 M54 22 q-6 -8 0 -14" />
          <path d="M70 46 q18 0 18 14 t-18 14" fill="none" stroke="var(--ap-foil)" strokeWidth="7" />
          <rect x="18" y="30" width="54" height="56" rx="12" fill="#FFFFFF" stroke="var(--ap-foil)" strokeWidth="3" />
          <ellipse cx="45" cy="32" rx="25" ry="6" fill="#B07A4A" />
          <path d="M45 66 c-6 -5 -9 -8 -8 -11 c1 -4 6 -4 8 -1 c2 -3 7 -3 8 1 c1 3 -2 6 -8 11z" fill="var(--ap-rose)" />
        </svg>
      );
    case "toast":
      return (
        <svg viewBox="0 0 100 100" aria-hidden>
          <path d="M18 44 C10 26 30 12 50 14 C70 12 90 26 82 44 L80 86 L20 86 Z" fill="#E5B477" />
          <path d="M26 46 C20 32 34 22 50 23 C66 22 80 32 74 46 L72 78 L28 78 Z" fill="#FBE3B4" />
          <path d="M40 52 l6 6 M56 48 l4 6 M46 66 l6 4" stroke="#E0A867" strokeWidth="3" strokeLinecap="round" />
          <path d="M70 26 q6 -6 12 0" stroke="#C88B4C" strokeWidth="3" fill="none" />
        </svg>
      );
    case "note":
      return (
        <svg viewBox="0 0 100 100" aria-hidden>
          <rect x="14" y="14" width="72" height="72" rx="4" fill="#FFF6B8" transform="rotate(-6 50 50)" />
          <path d="M28 40 h40 M28 52 h34 M28 64 h24" stroke="#D8C46A" strokeWidth="3" strokeLinecap="round" transform="rotate(-6 50 50)" />
          <path d="M66 66 c-5 -4 -8 -7 -7 -10 c1 -3 5 -3 7 -1 c2 -2 6 -2 7 1 c1 3 -2 6 -7 10z" fill="var(--ap-rose)" />
          <rect x="40" y="8" width="22" height="10" rx="2" fill="color-mix(in srgb, var(--ap-foil) 60%, transparent)" transform="rotate(-6 50 50)" />
        </svg>
      );
    case "flower":
      return (
        <svg viewBox="0 0 100 100" aria-hidden>
          <path d="M50 52 V16" stroke="#7FAF6E" strokeWidth="4" />
          <path d="M50 40 q-14 -6 -18 6 q12 2 18 -6" fill="#9CCB86" />
          <path d="M36 18 C36 4 64 4 64 18 C64 28 56 32 50 32 C44 32 36 28 36 18 Z" fill="var(--ap-rose)" />
          <path d="M50 8 C44 14 44 26 50 32 C56 26 56 14 50 8 Z" fill="color-mix(in srgb, var(--ap-rose) 70%, #FFFFFF)" />
          <path d="M30 52 h40 l-6 38 h-28 Z" fill="color-mix(in srgb, #DDEEF7 70%, transparent)" stroke="#BFD6E4" strokeWidth="2.5" />
        </svg>
      );
    case "jam":
      return (
        <svg viewBox="0 0 100 100" aria-hidden>
          <rect x="22" y="36" width="56" height="52" rx="12" fill="#E2586E" />
          <rect x="26" y="40" width="48" height="10" rx="4" fill="rgba(255,255,255,.35)" />
          <path d="M18 26 h64 l-4 14 h-56 Z" fill="#FFFFFF" />
          <path d="M18 26 h64 l-4 14 h-56 Z" fill="none" stroke="var(--ap-rose)" strokeWidth="2" strokeDasharray="6 4" />
          <rect x="34" y="56" width="32" height="20" rx="4" fill="#FFFDF8" />
          <circle cx="50" cy="66" r="5" fill="#E2586E" />
        </svg>
      );
    case "spoon":
      return (
        <svg viewBox="0 0 100 100" aria-hidden>
          <ellipse cx="28" cy="30" rx="16" ry="20" transform="rotate(-40 28 30)" fill="color-mix(in srgb, var(--ap-foil) 70%, #FFFFFF)" stroke="var(--ap-foil)" strokeWidth="2" />
          <path d="M38 42 L86 88" stroke="var(--ap-foil)" strokeWidth="8" strokeLinecap="round" />
          <path d="M40 40 L84 84" stroke="rgba(255,255,255,.6)" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
  }
}

export function LittleThings({ things, onNext }: { things: string[]; onNext: () => void }) {
  const { cue } = useAp();
  const reduced = useReducedMotion();
  const items = TRAY.slice(0, Math.max(3, Math.min(6, things.length)));
  const [open, setOpen] = useState<Set<number>>(() => new Set());
  const [cur, setCur] = useState<number | null>(null);
  const tap = (k: number) => {
    haptic(12);
    cue(items[k].id === "mug" || items[k].id === "spoon" ? "glass-ping" : "paper-rustle", { gain: 0.5, detune: k * 80 });
    setCur(k);
    setOpen((s) => (s.has(k) ? s : new Set(s).add(k)));
  };
  const all = open.size >= items.length;
  useNext(all ? "Stitch our quilt" : null, onNext, "photo");
  return (
    <>
      <Head kicker="Every morning" title={<>The <em>little</em> things</>} sub="Breakfast in bed, from me. Lift everything on the tray." />
      <div className="ap-fill">
        <div className="ap-tray" data-ap-tray>
          <span className="ap-tray-cloth" aria-hidden />
          {items.map((it, k) => (
            <motion.button
              key={it.id}
              type="button"
              className={`ap-tray-item${open.has(k) ? " is-open" : ""}${cur === k ? " is-cur" : ""}`}
              style={{ left: `${it.x}%`, top: `${it.y}%`, width: `${it.w}%` }}
              onClick={() => tap(k)}
              animate={cur === k && !reduced ? { y: -14, rotate: -4, scale: 1.08 } : { y: 0, rotate: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 14 }}
              aria-label={`Lift ${it.label}`}
              data-ap-tray-item={k}
            >
              <TrayArt id={it.id} />
              {!open.has(k) && <span className="ap-tray-dot" aria-hidden />}
            </motion.button>
          ))}
        </div>
      </div>
      <div className="ap-foot ap-tray-foot">
        {cur !== null ? (
          <motion.div key={cur} className="ap-tray-note" initial={reduced ? false : { opacity: 0, y: 12, rotate: -2 }} animate={{ opacity: 1, y: 0, rotate: -1 }} transition={{ type: "spring", stiffness: 240, damping: 20 }} data-ap-little>
            <p>{things[cur]}</p>
            <span>
              {open.size} / {items.length}
            </span>
          </motion.div>
        ) : (
          <Hint>Tap the mug, the toast, the note…</Hint>
        )}
      </div>
      <style>{TRAY_CSS}</style>
    </>
  );
}

const TRAY_CSS = `
.ap-tray { position: relative; width: min(100cqw, 150cqh, 760px); aspect-ratio: 1.45; border-radius: 48% / 40%; box-sizing: border-box;
  background: radial-gradient(ellipse at 50% 40%, #FFFFFF, color-mix(in srgb, var(--ap-foil) 26%, #FFFFFF) 70%, color-mix(in srgb, var(--ap-foil) 55%, #FFFFFF));
  box-shadow: inset 0 0 0 6px color-mix(in srgb, var(--ap-foil) 70%, #FFFFFF), inset 0 0 0 9px rgba(255,255,255,.8), inset 0 -14px 30px -10px color-mix(in srgb, var(--ap-deep) 25%, transparent), 0 34px 50px -30px var(--ap-deep); }
.ap-tray-cloth { position: absolute; left: 30%; top: 14%; width: 46%; height: 72%; transform: rotate(-8deg); border-radius: 8px; opacity: .55;
  background: repeating-linear-gradient(0deg, color-mix(in srgb, var(--ap-rose) 30%, transparent) 0 10px, transparent 10px 20px), repeating-linear-gradient(90deg, color-mix(in srgb, var(--ap-rose) 30%, transparent) 0 10px, transparent 10px 20px), #FFFFFF; }
.ap-tray-item { position: absolute; transform: translate(-50%, -50%); aspect-ratio: 1; padding: 0; border: 0; background: none; cursor: pointer; touch-action: manipulation; translate: -50% -50%;
  filter: drop-shadow(0 10px 8px color-mix(in srgb, var(--ap-deep) 25%, transparent)); min-width: 48px; }
.ap-tray-item svg { width: 100%; height: 100%; display: block; overflow: visible; }
.ap-tray-item:focus-visible { outline: 3px solid var(--vw-ink); outline-offset: 2px; border-radius: 16px; }
.ap-tray-item.is-open { filter: drop-shadow(0 10px 8px color-mix(in srgb, var(--ap-deep) 25%, transparent)) saturate(1.05); }
.ap-tray-dot { position: absolute; right: 4%; top: 2%; width: 14px; height: 14px; border-radius: 50%; background: var(--vw-accent); box-shadow: 0 0 0 3px #FFFFFF; animation: ap-dot 1.6s ease-in-out infinite; }
@keyframes ap-dot { 0%, 100% { transform: scale(1) } 50% { transform: scale(1.3) } }
.ap-steam { fill: none; stroke: color-mix(in srgb, var(--ap-foil) 60%, #FFFFFF); stroke-width: 3; stroke-linecap: round; animation: ap-steam 2.4s ease-in-out infinite; }
@keyframes ap-steam { 0%, 100% { opacity: .2; transform: translateY(4px) } 50% { opacity: .9; transform: translateY(-4px) } }
.ap-tray-foot { min-height: 84px; }
.ap-tray-note { position: relative; max-width: 420px; padding: 12px 20px 14px; border-radius: 6px; background: #FFFDF2; box-shadow: 0 0 0 1px rgba(0,0,0,.04), 0 14px 24px -14px var(--ap-deep); }
.ap-tray-note::before { content: ""; position: absolute; left: 50%; top: -8px; width: 60px; height: 16px; translate: -50% 0; rotate: 3deg; background: color-mix(in srgb, var(--ap-foil) 50%, transparent); border-radius: 2px; }
.ap-tray-note p { margin: 0; font: 500 clamp(20px, 3dvh, 25px)/1.2 ${AP_HAND}; color: #3E3226; overflow-wrap: anywhere; }
.ap-tray-note span { display: block; margin-top: 4px; font: 700 11px ${AP_SANS}; letter-spacing: .14em; color: #8A7764; }
@media (prefers-reduced-motion: reduce) { .ap-tray-dot, .ap-steam { animation: none; } }
`;

// ─── 6 · The memory quilt ───────────────────────────────────────────────────

/**
 * The quilt is a 6 × 5 grid clipped to a heart (the mask below); these are the
 * cells that touch the heart, with how much of each is inside it (worked out
 * once from the same path). The roomy ones carry the photos and reasons.
 */
const CELLS: readonly [col: number, row: number, fill: number][] = [
  [0, 0, 0.06], [1, 0, 0.33], [2, 0, 0.11], [3, 0, 0.11], [4, 0, 0.33], [5, 0, 0.06],
  [0, 1, 0.63], [1, 1, 1], [2, 1, 0.96], [3, 1, 0.96], [4, 1, 1], [5, 1, 0.63],
  [0, 2, 0.51], [1, 2, 1], [2, 2, 1], [3, 2, 1], [4, 2, 1], [5, 2, 0.51],
  [1, 3, 0.7], [2, 3, 1], [3, 3, 1], [4, 3, 0.7],
  [2, 4, 0.44], [3, 4, 0.44],
];
const HEART_PATH = "M50 88 C18 66 3 48 5 29 C7 10 33 4 50 24 C67 4 93 10 95 29 C97 48 82 66 50 88 Z";
const HEART_MASK = `url("data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 92' preserveAspectRatio='none'><path d='${HEART_PATH}'/></svg>`)}")`;
/** Content goes to the roomiest cells first, from the middle out. */
const ROOMY = CELLS.map((c, k) => ({ k, f: c[2], d: Math.abs(c[0] - 2.5) + Math.abs(c[1] - 1.8) }))
  .filter((c) => c.f >= 0.6)
  .sort((a, b) => a.d - b.d)
  .map((c) => c.k);
const NEEDED = CELLS.map((c, k) => (c[2] >= 0.3 ? k : -1)).filter((k) => k >= 0);
const FABRIC = ["gingham", "dots", "stripes", "plain", "check", "flowers"] as const;

type Patch = { kind: "photo"; photo: LovePhoto } | { kind: "reason"; text: string } | { kind: "fabric" };

export function Quilt({ photos, reasons, onNext }: { photos: LovePhoto[]; reasons: string[]; onNext: () => void }) {
  const { cue } = useAp();
  const reduced = useReducedMotion();
  const patches = useMemo<Patch[]>(() => {
    const out: Patch[] = CELLS.map(() => ({ kind: "fabric" }));
    const content: Patch[] = [];
    const ps = photos.slice(0, 7);
    const rs = reasons.slice(0, ROOMY.length - Math.min(ps.length, 6));
    for (let k = 0; k < Math.max(ps.length, rs.length); k++) {
      if (ps[k]) content.push({ kind: "photo", photo: ps[k] });
      if (rs[k]) content.push({ kind: "reason", text: rs[k] });
    }
    content.slice(0, ROOMY.length).forEach((c, n) => (out[ROOMY[n]] = c));
    return out;
  }, [photos, reasons]);
  const [sewn, setSewn] = useState<Set<number>>(() => new Set());
  const [look, setLook] = useState<number | null>(null);
  const [latest, setLatest] = useState<number | null>(null);
  const complete = NEEDED.every((k) => sewn.has(k));
  const doneRef = useRef(false);
  const sewnRef = useRef<Set<number>>(new Set());

  const finish = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    // The little slivers at the edge sew themselves in, then the heart puffs up.
    const all = new Set(CELLS.map((_, k) => k));
    sewnRef.current = all;
    window.setTimeout(() => {
      setSewn(all);
      cue("chime-cascade", { gain: 0.7 });
      haptic([20, 40, 30]);
      if (!reduced) burst({ kind: "hearts", emojis: ["💗", "🤍", "✨"], origin: { x: 0.5, y: 0.45 }, count: 30 });
    }, 160);
  }, [cue, reduced]);

  const stitch = useCallback(
    (k: number) => {
      if (sewnRef.current.has(k)) return;
      const n = new Set(sewnRef.current).add(k);
      sewnRef.current = n;
      setSewn(n);
      haptic(8);
      cue("nib-scratch", { gain: 0.35, detune: n.size * 50 });
      if (patches[k].kind !== "fabric") setLatest(k);
      if (NEEDED.every((x) => n.has(x))) finish();
    },
    [cue, patches, finish],
  );

  const sewing = useRef(false);
  const pointerStart = useRef<{ x: number; y: number; k: number | null } | null>(null);
  const hit = (x: number, y: number): number | null => {
    const el = document.elementFromPoint(x, y);
    const p = el?.closest("[data-ap-patch]") as HTMLElement | null;
    return p ? Number(p.dataset.apPatch) : null;
  };
  const onDown = (e: React.PointerEvent<HTMLDivElement>) => {
    sewing.current = true;
    const k = hit(e.clientX, e.clientY);
    pointerStart.current = { x: e.clientX, y: e.clientY, k };
    if (k !== null && !sewnRef.current.has(k)) stitch(k);
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* not capturable (synthetic) */
    }
  };
  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!sewing.current) return;
    const k = hit(e.clientX, e.clientY);
    if (k !== null) stitch(k);
  };
  const onUp = (e: React.PointerEvent<HTMLDivElement>) => {
    sewing.current = false;
    const st = pointerStart.current;
    pointerStart.current = null;
    if (!st || st.k === null || !doneRef.current) return;
    const tap = Math.hypot(e.clientX - st.x, e.clientY - st.y) < 8;
    // Once the quilt is done, a tap on a patch opens it.
    if (tap && patches[st.k].kind !== "fabric") {
      cue("pop", { gain: 0.4 });
      setLook(st.k);
    }
  };

  useNext(complete ? "Read our book" : null, onNext, "book");
  const shown = look !== null ? patches[look] : null;
  const lastPatch = latest !== null ? patches[latest] : null;
  const sewnNeeded = NEEDED.filter((k) => sewn.has(k)).length;
  return (
    <>
      <Head kicker="Patch by patch" title={complete ? <>Every patch is <em>us</em></> : <>Stitch our <em>quilt</em></>} sub={complete ? "Tap a photo or a heart to look closer." : "Run your finger across the patches to sew them in."} />
      <div className="ap-fill">
        <div className={`ap-quilt-wrap${complete ? " is-done" : ""}`}>
          <div
            className="ap-quilt"
            style={{ WebkitMaskImage: HEART_MASK, maskImage: HEART_MASK }}
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={() => (sewing.current = false)}
            data-ap-quilt
          >
            {CELLS.map(([c, r], k) => {
              const pt = patches[k];
              const on = sewn.has(k);
              return (
                <button
                  key={k}
                  type="button"
                  className={`ap-patch is-${FABRIC[(k * 5 + r) % FABRIC.length]}${on ? " is-sewn" : ""}${pt.kind === "photo" ? " is-photo" : ""}${pt.kind === "reason" ? " is-reason" : ""}`}
                  style={{ gridColumn: c + 1, gridRow: r + 1 }}
                  data-ap-patch={k}
                  tabIndex={CELLS[k][2] >= 0.3 ? 0 : -1}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      if (!on) stitch(k);
                      else if (pt.kind !== "fabric") setLook(k);
                    }
                  }}
                  aria-label={on ? (pt.kind === "photo" ? "A photo of us — open it" : pt.kind === "reason" ? `Reason: ${pt.text}` : "A patch of fabric") : "Sew this patch in"}
                >
                  {on && pt.kind === "photo" && (
                    <span className="ap-patch-img">
                      <CroppedPhoto photo={pt.photo} />
                    </span>
                  )}
                  {on && pt.kind === "reason" && <span className="ap-patch-heart" aria-hidden>♥</span>}
                  <span className="ap-patch-stitch" aria-hidden />
                </button>
              );
            })}
          </div>
          <svg className="ap-quilt-edge" viewBox="0 0 100 92" preserveAspectRatio="none" aria-hidden>
            <path d={HEART_PATH} />
          </svg>
          {complete && <span className="ap-quilt-bow" aria-hidden>🎀</span>}
        </div>
        <AnimatePresence>
          {shown && shown.kind !== "fabric" && (
            <motion.div className="ap-look" initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={reduced ? undefined : { opacity: 0 }} onClick={() => setLook(null)} role="dialog" aria-label="A patch, up close">
              <motion.div className="ap-look-card" initial={reduced ? false : { scale: 0.8, rotate: -4 }} animate={{ scale: 1, rotate: -1.5 }} transition={{ type: "spring", stiffness: 240, damping: 18 }}>
                {shown.kind === "photo" ? (
                  <>
                    <span className="ap-look-img">
                      <CroppedPhoto photo={shown.photo} eager />
                    </span>
                    {(shown.photo.caption || shown.photo.note) && (
                      <p className="ap-look-cap">
                        {shown.photo.caption}
                        {shown.photo.note ? <small>{shown.photo.note}</small> : null}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="ap-look-reason">{shown.text}</p>
                )}
                <button type="button" className="ap-ghost" onClick={() => setLook(null)} autoFocus>
                  Back to the quilt
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="ap-foot ap-quilt-foot">
        {lastPatch && lastPatch.kind === "reason" ? (
          <motion.p key={latest} className="ap-quilt-reason" initial={reduced ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} data-ap-reason>
            <span>♥ because</span> {lastPatch.text}
          </motion.p>
        ) : !complete ? (
          <p className="ap-count-chip">
            {sewnNeeded} / {NEEDED.length} patches sewn
          </p>
        ) : null}
      </div>
      <style>{QUILT_CSS}</style>
    </>
  );
}

const QUILT_CSS = `
.ap-quilt-wrap { position: relative; width: min(100cqw, 104cqh, 620px); aspect-ratio: 100 / 92; transition: transform .6s cubic-bezier(.3,1.6,.5,1), filter .6s; filter: drop-shadow(0 18px 26px color-mix(in srgb, var(--ap-deep) 28%, transparent)); }
.ap-quilt-wrap.is-done { transform: scale(1.04); filter: drop-shadow(0 22px 34px color-mix(in srgb, var(--ap-deep) 42%, transparent)); }
.ap-quilt { position: absolute; inset: 0; display: grid; grid-template-columns: repeat(6, 1fr); grid-template-rows: repeat(5, 1fr); gap: 2px; touch-action: none; user-select: none; -webkit-user-select: none;
  -webkit-mask-size: 100% 100%; mask-size: 100% 100%; -webkit-mask-repeat: no-repeat; mask-repeat: no-repeat; background: color-mix(in srgb, var(--vw-paper) 50%, transparent); }
.ap-quilt-edge { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; overflow: visible; }
.ap-quilt-edge path { fill: none; stroke: #FFFFFF; stroke-width: 1.2; stroke-dasharray: 2.2 1.6; vector-effect: non-scaling-stroke; stroke-width: 2.5px; }
.ap-patch { position: relative; border: 0; padding: 0; margin: 0; cursor: pointer; overflow: hidden; touch-action: none; min-width: 0; min-height: 0;
  background: color-mix(in srgb, var(--vw-paper) 70%, transparent); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--ap-foil) 45%, transparent); transition: background .3s; }
.ap-patch::before { content: ""; position: absolute; inset: 0; opacity: .3; transition: opacity .35s; }
.ap-patch.is-gingham::before { background: repeating-linear-gradient(0deg, color-mix(in srgb, var(--vw-accent) 32%, transparent) 0 7px, transparent 7px 14px), repeating-linear-gradient(90deg, color-mix(in srgb, var(--vw-accent) 32%, transparent) 0 7px, transparent 7px 14px), #FFFFFF; }
.ap-patch.is-dots::before { background: radial-gradient(circle, var(--ap-rose) 0 2.5px, transparent 3px) 0 0 / 13px 13px, var(--ap-blush); }
.ap-patch.is-stripes::before { background: repeating-linear-gradient(45deg, color-mix(in srgb, var(--ap-foil) 55%, transparent) 0 5px, #FFFFFF 5px 12px); }
.ap-patch.is-plain::before { background: linear-gradient(135deg, var(--ap-blush), color-mix(in srgb, var(--ap-rose) 45%, #FFFFFF)); }
.ap-patch.is-check::before { background: conic-gradient(color-mix(in srgb, var(--vw-accent) 28%, #FFF) 25%, #FFFFFF 0 50%, color-mix(in srgb, var(--vw-accent) 28%, #FFF) 0 75%, #FFFFFF 0) 0 0 / 16px 16px; }
.ap-patch.is-flowers::before { background: radial-gradient(circle at 30% 30%, #FFFFFF 0 3px, var(--ap-rose) 3.5px 6px, transparent 6.5px) 0 0 / 20px 20px, radial-gradient(circle at 70% 70%, #FFFFFF 0 2px, var(--vw-accent) 2.5px 4.5px, transparent 5px) 0 0 / 20px 20px, var(--ap-blush); }
.ap-patch.is-sewn::before { opacity: 1; }
.ap-patch-stitch { position: absolute; inset: 4px; border-radius: 3px; border: 1.5px dashed color-mix(in srgb, var(--ap-foil) 55%, transparent); pointer-events: none; transition: border-color .3s; }
.ap-patch.is-sewn .ap-patch-stitch { border-color: rgba(255,255,255,.95); animation: ap-sew .45s ease-out; }
@keyframes ap-sew { from { clip-path: inset(0 100% 100% 0) } to { clip-path: inset(0 0 0 0) } }
.ap-patch-img { position: absolute; inset: 0; animation: ap-patch-in .5s ease-out; }
@keyframes ap-patch-in { from { opacity: 0; transform: scale(1.2) } to { opacity: 1; transform: scale(1) } }
.ap-patch-heart { position: absolute; inset: 0; display: grid; place-items: center; font-size: clamp(16px, 5cqmin, 30px); color: #FFFFFF; text-shadow: 0 1px 4px color-mix(in srgb, var(--ap-deep) 50%, transparent); animation: ap-patch-in .5s ease-out; }
.ap-patch.is-reason.is-sewn::before { background: radial-gradient(circle at 50% 45%, color-mix(in srgb, var(--ap-rose) 70%, #FFFFFF), var(--vw-accent)); }
.ap-patch:focus-visible { outline: 3px solid var(--vw-ink); outline-offset: -3px; z-index: 2; }
.ap-quilt-bow { position: absolute; left: 50%; top: 22%; translate: -50% -50%; font-size: clamp(30px, 9cqmin, 56px); animation: ap-bow .7s cubic-bezier(.3,1.6,.5,1); filter: drop-shadow(0 4px 6px rgba(0,0,0,.15)); }
@keyframes ap-bow { from { transform: scale(0) rotate(-40deg) } to { transform: scale(1) rotate(0) } }
.ap-count-chip { margin: 0; padding: 6px 14px; border-radius: 99px; font: 700 13px ${AP_SANS}; letter-spacing: .04em; color: var(--vw-accent-deep); background: color-mix(in srgb, var(--vw-paper) 80%, transparent); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--ap-foil) 55%, transparent); }
.ap-quilt-foot { min-height: 58px; }
.ap-quilt-reason { margin: 0; max-width: 420px; font: 500 clamp(20px, 3dvh, 25px)/1.2 ${AP_HAND}; color: var(--vw-ink); overflow-wrap: anywhere; }
.ap-quilt-reason span { display: block; font: italic 600 15px ${AP_SERIF}; color: var(--vw-accent-deep); }
.ap-look { position: absolute; inset: 0; z-index: 5; display: grid; place-items: center; background: color-mix(in srgb, var(--vw-paper) 55%, transparent); backdrop-filter: blur(3px); -webkit-backdrop-filter: blur(3px); }
.ap-look-card { width: min(88%, 340px); max-height: 96%; box-sizing: border-box; padding: 12px 12px 14px; background: #FFFFFF; border-radius: 8px; display: grid; gap: 8px; justify-items: center; box-shadow: 0 30px 50px -24px var(--ap-deep); overflow: auto; }
.ap-look-img { position: relative; display: block; width: 100%; aspect-ratio: 1; max-height: 56cqh; border-radius: 4px; overflow: hidden; }
.ap-look-cap { margin: 0; display: grid; gap: 2px; font: 500 21px/1.15 ${AP_HAND}; color: #3E3226; }
.ap-look-cap small { font: 500 13px/1.35 ${AP_SANS}; color: #7A6A5A; }
.ap-look-reason { margin: 8px 6px; font: 500 clamp(24px, 4dvh, 32px)/1.2 ${AP_HAND}; color: #3E3226; overflow-wrap: anywhere; }
@media (prefers-reduced-motion: reduce) { .ap-patch.is-sewn .ap-patch-stitch, .ap-quilt-bow, .ap-patch-img, .ap-patch-heart { animation: none; } }
`;

// ─── 7 · The book ───────────────────────────────────────────────────────────

/** Paragraphs → pages (a long paragraph is split at sentence ends). */
export function paginate(letter: string, max = 360): string[] {
  const out: string[] = [];
  for (const para of letter.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean)) {
    if (para.length <= max) {
      out.push(para);
      continue;
    }
    let buf = "";
    for (const s of para.match(/[^.!?]+[.!?]*\s*/g) ?? [para]) {
      if ((buf + s).length > max && buf) {
        out.push(buf.trim());
        buf = "";
      }
      buf += s;
    }
    if (buf.trim()) out.push(buf.trim());
  }
  return out.length ? out : [letter];
}

export function Book({ letter, recipient, sender, petName, sticker, onNext }: { letter: string; recipient: string; sender: string; petName: string; sticker: ReactNode; onNext: () => void }) {
  const { cue } = useAp();
  const pages = useMemo(() => paginate(letter), [letter]);
  // Leaf 0 is the cover; leaves 1…n are the paragraphs; the last leaf is the signature.
  const leaves = pages.length + 2;
  const [at, setAt] = useState(0);
  const [drag, setDrag] = useState<number | null>(null);
  const [reached, setReached] = useState(false);
  const bookRef = useRef<HTMLDivElement | null>(null);

  const atRef = useRef(0);
  const turn = useCallback(
    (dir: 1 | -1) => {
      const a = atRef.current;
      const n = clamp(a + dir, 0, leaves - 1);
      if (n === a) return;
      atRef.current = n;
      setAt(n);
      haptic(10);
      cue("page-turn", { gain: 0.6, detune: Math.random() * 120 - 60 });
      if (n === leaves - 1) setReached(true);
    },
    [leaves, cue],
  );

  const onDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = bookRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const sx = e.clientX;
    const tgt = e.currentTarget;
    tgt.setPointerCapture(e.pointerId);
    let dx = 0;
    const move = (ev: PointerEvent) => {
      dx = ev.clientX - sx;
      if (Math.abs(dx) > 8) setDrag(clamp(dx / r.width, -1, 1));
    };
    const up = (ev: PointerEvent) => {
      tgt.removeEventListener("pointermove", move);
      tgt.removeEventListener("pointerup", up);
      tgt.removeEventListener("pointercancel", up);
      setDrag(null);
      if (Math.abs(dx) > r.width * 0.18) turn(dx < 0 ? 1 : -1);
      else if (Math.abs(dx) < 8) turn(ev.clientX - r.left > r.width * 0.35 ? 1 : -1);
    };
    tgt.addEventListener("pointermove", move);
    tgt.addEventListener("pointerup", up);
    tgt.addEventListener("pointercancel", up);
  };

  useNext(reached ? "Us, wrapped" : null, onNext, "gift");
  const leafContent = (k: number): ReactNode => {
    if (k === 0)
      return (
        <div className="ap-cover">
          <span className="ap-cover-orn" aria-hidden>
            ❦
          </span>
          <p className="ap-cover-t">The Book of Us</p>
          <p className="ap-cover-for">for {petName || recipient}</p>
          <p className="ap-cover-by">bound by hand · {sender}</p>
          <span className="ap-cover-corner is-tl" aria-hidden />
          <span className="ap-cover-corner is-br" aria-hidden />
        </div>
      );
    if (k === leaves - 1)
      return (
        <div className="ap-pg ap-pg-end">
          <div className="ap-pg-stk">{sticker}</div>
          <p className="ap-pg-sign">Forever yours,</p>
          <p className="ap-pg-name">{sender}</p>
          <p className="ap-pg-no">~ fin ~</p>
        </div>
      );
    return (
      <div className="ap-pg">
        {k === 1 && <p className="ap-pg-dear">Dear {petName || recipient},</p>}
        <ApScroll className="ap-pg-scroll">
          <p className={`ap-pg-txt${k === 1 ? " is-first" : ""}`}>{pages[k - 1]}</p>
        </ApScroll>
        <p className="ap-pg-no">— {k} —</p>
      </div>
    );
  };

  return (
    <>
      <Head kicker="Hand-bound, just for you" title={at === 0 ? <>I wrote you a <em>book</em></> : <>Page {Math.min(at, leaves - 2) || 1} of {pages.length}</>} sub={at === 0 ? "Swipe or tap the edge to turn the page." : undefined} />
      <div className="ap-fill">
        <div ref={bookRef} className="ap-book" onPointerDown={onDown} data-ap-book>
          <div className="ap-book-spine" aria-hidden />
          {Array.from({ length: leaves }, (_, k) => {
            const turned = k < at;
            const isTop = k === at;
            let angle = turned ? -178 : 0;
            if (drag !== null) {
              if (drag < 0 && isTop && k < leaves - 1) angle = drag * 178;
              if (drag > 0 && k === at - 1) angle = -178 + drag * 178;
            }
            const show = Math.abs(k - at) <= 1;
            return (
              <div
                key={k}
                className={`ap-leaf${k === 0 ? " is-cover" : ""}${turned ? " is-turned" : ""}${drag !== null ? " is-drag" : ""}`}
                style={{ transform: `rotateY(${angle}deg)`, zIndex: turned ? k : leaves - k, visibility: show ? "visible" : "hidden", opacity: turned && !(drag !== null && drag > 0 && k === at - 1) ? 0 : 1 }}
                aria-hidden={!isTop}
                data-ap-leaf={k}
              >
                <div className="ap-leaf-front">{leafContent(k)}</div>
                <div className="ap-leaf-back" />
              </div>
            );
          })}
        </div>
      </div>
      <div className="ap-foot">
        <button type="button" className="ap-tm-arrow" onClick={() => turn(-1)} disabled={at === 0} aria-label="Previous page">
          ‹
        </button>
        <span className="ap-book-count" aria-live="polite">
          {at === 0 ? "cover" : at === leaves - 1 ? "the end" : `${at} / ${pages.length}`}
        </span>
        <button type="button" className="ap-tm-arrow" onClick={() => turn(1)} disabled={at === leaves - 1} aria-label="Next page" data-ap-page-next>
          ›
        </button>
      </div>
      <style>{BOOK_CSS}</style>
    </>
  );
}

const BOOK_CSS = `
.ap-book { position: relative; height: min(100cqh, 138cqw, 640px); aspect-ratio: .72; max-width: 100%; perspective: 2200px; touch-action: pan-y; cursor: grab; user-select: none; -webkit-user-select: none; }
.ap-book-spine { position: absolute; left: -10px; top: 1%; bottom: 1%; width: 16px; border-radius: 8px 0 0 8px; background: linear-gradient(90deg, var(--ap-deep), color-mix(in srgb, var(--ap-foil) 60%, var(--ap-deep))); box-shadow: 0 10px 20px -10px var(--ap-deep); }
.ap-leaf { position: absolute; inset: 0; transform-origin: 0 50%; transform-style: preserve-3d; transition: transform .75s cubic-bezier(.45,.05,.25,1), opacity .25s ease; }
.ap-leaf.is-turned { transition: transform .75s cubic-bezier(.45,.05,.25,1), opacity .2s ease .55s; pointer-events: none; }
.ap-leaf.is-drag { transition: none; }
.ap-leaf-front, .ap-leaf-back { position: absolute; inset: 0; backface-visibility: hidden; -webkit-backface-visibility: hidden; border-radius: 4px 14px 14px 4px; overflow: hidden; }
.ap-leaf-front { background: linear-gradient(90deg, color-mix(in srgb, var(--ap-blush) 80%, #E8DCC8) 0%, #FFFDF8 7%, #FFFDF8 94%, color-mix(in srgb, var(--ap-blush) 70%, #FFFFFF) 100%);
  box-shadow: inset 0 0 0 1px rgba(0,0,0,.05), 0 20px 40px -24px var(--ap-deep), 4px 4px 0 -1px #F4EEE3, 7px 7px 0 -2px #EDE5D7; }
.ap-leaf-back { transform: rotateY(180deg); background: linear-gradient(270deg, color-mix(in srgb, var(--ap-blush) 80%, #E8DCC8) 0%, #FBF7EF 8%); box-shadow: inset 0 0 0 1px rgba(0,0,0,.05); }
.ap-leaf.is-cover .ap-leaf-front { background: radial-gradient(120% 80% at 30% 20%, color-mix(in srgb, var(--vw-accent) 55%, #FFFFFF), var(--vw-accent-deep) 80%); box-shadow: inset 0 0 0 1px rgba(255,255,255,.3), 0 24px 44px -24px var(--ap-deep); }
.ap-cover { position: absolute; inset: 0; display: grid; align-content: center; justify-items: center; gap: 8px; padding: 10%; text-align: center; color: #FFFFFF; }
.ap-cover::before { content: ""; position: absolute; inset: 6%; border: 1.5px solid color-mix(in srgb, var(--ap-foil) 80%, #FFFFFF); border-radius: 4px 10px 10px 4px; }
.ap-cover-orn { font: 400 clamp(34px, 9cqh, 64px)/1 ${AP_SERIF}; color: color-mix(in srgb, var(--ap-foil) 50%, #FFFFFF); }
.ap-cover-t { margin: 0; font: 600 clamp(28px, 7cqh, 52px)/1 ${AP_SERIF}; letter-spacing: .02em; text-shadow: 0 2px 0 color-mix(in srgb, var(--ap-deep) 60%, transparent); }
.ap-cover-for { margin: 0; font: 400 clamp(26px, 6.5cqh, 46px)/1.1 ${AP_SCRIPT}; color: color-mix(in srgb, var(--ap-foil) 35%, #FFFFFF); overflow-wrap: anywhere; }
.ap-cover-by { margin: 8px 0 0; font: 700 11px ${AP_SANS}; letter-spacing: .2em; text-transform: uppercase; opacity: .85; }
.ap-cover-corner { position: absolute; width: 16%; aspect-ratio: 1; border: 2px solid color-mix(in srgb, var(--ap-foil) 70%, #FFFFFF); }
.ap-cover-corner.is-tl { left: 9%; top: 9%; border-right: 0; border-bottom: 0; border-radius: 12px 0 0 0; }
.ap-cover-corner.is-br { right: 9%; bottom: 9%; border-left: 0; border-top: 0; border-radius: 0 0 12px 0; }
.ap-pg { position: absolute; inset: 0; display: grid; grid-template-rows: auto minmax(0, 1fr) auto; padding: 9% 9% 6% 12%; box-sizing: border-box; text-align: left; gap: 6px; }
.ap-pg-dear { margin: 0; font: italic 600 clamp(22px, 4.6cqh, 32px)/1.1 ${AP_SERIF}; color: var(--vw-accent-deep); overflow-wrap: anywhere; }
.ap-pg-scroll { align-self: start; }
.ap-pg-txt { margin: 0; font: 500 clamp(19px, 4.1cqh, 28px)/1.42 ${AP_SERIF}; color: #3B2F25; overflow-wrap: anywhere; white-space: pre-line; }
.ap-pg-txt.is-first::first-letter { float: left; font: 600 3.1em/.8 ${AP_SERIF}; color: var(--vw-accent-deep); margin: 6px 6px 0 0; }
.ap-pg-no { margin: 0; text-align: center; font: italic 500 14px ${AP_SERIF}; color: #9A8A78; }
.ap-pg-end { align-content: center; justify-items: center; text-align: center; grid-template-rows: auto auto auto auto; padding: 10%; }
.ap-pg-stk { margin-bottom: 6px; }
.ap-pg-sign { margin: 0; font: italic 500 clamp(20px, 4cqh, 28px) ${AP_SERIF}; color: #6B5A49; }
.ap-pg-name { margin: 0; max-width: 100%; font: 400 clamp(24px, min(9cqh, 12cqw), 64px)/1.1 ${AP_SCRIPT}; color: var(--vw-accent-deep); overflow-wrap: break-word; text-wrap: balance; }
.ap-book-count { min-width: 90px; text-align: center; font: italic 600 17px ${AP_SERIF}; color: var(--vw-ink-soft); }
@media (prefers-reduced-motion: reduce) { .ap-leaf { transition-duration: .01s; } }
`;
