"use client";

// Scenes 9–11: "Will you be mine?", the YES (hearts, then she slides the ring
// onto the hand) and the keepsakes (the "Officially Ours" certificate and the
// save-the-date card).
//
// How No behaves is the SENDER's choice (extras.answerMode):
//   • "yesOnly" (default): every time she reaches for No it WILTS — it droops,
//     sheds a petal, shrinks and shuffles aside with a new pleading line,
//     while YES blooms bigger; after five reaches it has wilted into a seed
//     that sprouts into a second YES.
//   • "noAfterTries": No wilts `tries` times (4 or 5), then stands up straight
//     as an honest "Let me think about it 🤍". Pressing it asks once more,
//     kindly; confirming records a gentle "no" (the sender is emailed).

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, animate, motion, useMotionValue } from "framer-motion";
import { EndingActions, burst, haptic, useReducedMotion, type KeepsakeItem, type KeepsakeLayout } from "../../../_valentine/kit";
import type { AnswerRule } from "../../../_valentine/kit/answer";
import type { ProposalPaletteDef } from "../../../_valentine/days/proposal-premium";
import type { DayConfig, ValentineDayData } from "../../../_valentine/types";
import { FONTS } from "../../../_valentine/theme";
import { HAND_FINGER, Hand, Ring, Sparkle } from "./art";
import { PP_HAND, PP_SCRIPT, PP_SERIF } from "./fonts";
import { useNext, usePp } from "./stage";
import { FitBox, Head } from "./ui";

const WILT_AT = 5;
/** Where the little flowers pop up around YES as No wilts (% of the YES button). */
const BLOOMS: readonly [string, string][] = [["-4%", "8%"], ["104%", "16%"], ["10%", "104%"], ["92%", "100%"], ["50%", "-34%"], ["50%", "132%"]];
const PLEADING = ["are you sure? 🥺", "pls pls pls 🥹", "one tiny chance?", "look at the flowers 🌷", "last time I ask 🥺"];

// ─── 9 · Will you be mine? ──────────────────────────────────────────────────

export function Question({
  question,
  yesLabel,
  noLines,
  thinkLabel,
  rule,
  sticker,
  onYes,
  onNo,
}: {
  question: string;
  yesLabel: string;
  noLines: readonly string[];
  thinkLabel: string;
  rule: AnswerRule;
  sticker: ReactNode;
  onYes: (wilts: number) => void;
  onNo: (wilts: number) => void;
}) {
  const reduced = useReducedMotion();
  const { cue } = usePp();
  const arenaRef = useRef<HTMLDivElement | null>(null);
  const noRef = useRef<HTMLButtonElement | null>(null);
  const wiltsRef = useRef(0);
  const lastWilt = useRef(0);
  const [wilts, setWilts] = useState(0);
  const [side, setSide] = useState(1);
  const [drops, setDrops] = useState<number[]>([]);
  const [asking, setAsking] = useState(false);
  const canSayNo = rule.mode === "noAfterTries";
  const limit = canSayNo ? rule.tries : WILT_AT;
  const tired = wilts >= limit;
  const seed = tired && !canSayNo;
  const honest = tired && canSayNo;

  const yes = () => {
    cue("chime-cascade", { gain: 0.8 });
    cue("kiss", { gain: 0.6, at: 0.15 });
    onYes(wiltsRef.current);
  };

  const wilt = useCallback(() => {
    if (wiltsRef.current >= limit || performance.now() - lastWilt.current < 380) return;
    lastWilt.current = performance.now();
    wiltsRef.current += 1;
    const w = wiltsRef.current;
    haptic(12);
    cue("plush-squeak", { gain: 0.55, detune: -w * 90 });
    cue("paper-rustle", { gain: 0.3, at: 0.05 });
    setWilts(w);
    setSide((s) => -s);
    setDrops((d) => [...d, w]);
  }, [cue, limit]);

  useEffect(() => {
    const arena = arenaRef.current;
    if (!arena || tired) return;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const r = noRef.current?.getBoundingClientRect();
      if (!r) return;
      const dx = Math.max(r.left - e.clientX, 0, e.clientX - r.right);
      const dy = Math.max(r.top - e.clientY, 0, e.clientY - r.bottom);
      if (Math.hypot(dx, dy) < 30) wilt();
    };
    arena.addEventListener("pointermove", onMove);
    return () => arena.removeEventListener("pointermove", onMove);
  }, [wilt, tired]);

  const lines = canSayNo ? PLEADING : noLines.length ? noLines : ["pls? 🥺"];
  const noLabel = seed ? "Okay fine… YES 💗" : honest ? thinkLabel : wilts === 0 ? "No" : lines[(wilts - 1) % lines.length];
  const yesScale = Math.min(1.32, Math.pow(1.065, wilts));
  // The wilt: No droops, shrinks and shuffles aside; it stands back up when it turns into a choice.
  const droop = tired ? 0 : Math.min(wilts, 5) * 7 * side;
  const shrink = tired ? 1 : Math.max(0.62, 1 - wilts * 0.08);
  const shift = tired ? 0 : Math.min(wilts, 4) * 14 * side;

  const pressNo = () => {
    if (performance.now() - lastWilt.current < 420) return;
    if (seed) return yes();
    if (honest) {
      haptic(8);
      cue("swoosh-soft", { gain: 0.4 });
      setAsking(true);
    }
  };

  return (
    <>
      <style>{Q_CSS}</style>
      <Head kicker="The big question" title={question} />
      <div className="pp-q-gif" aria-hidden>
        {sticker}
      </div>
      <div ref={arenaRef} className={`pp-q-arena${tired ? " is-settled" : ""}`} data-pp-answer-mode={rule.mode}>
        <div className="pp-q-yes-wrap" style={{ transform: `translate(-50%, -50%) scale(${yesScale})` }}>
          {Array.from({ length: Math.min(wilts, 6) }, (_, k) => (
            <span key={k} className="pp-q-bloom" style={{ left: BLOOMS[k][0], top: BLOOMS[k][1] }} aria-hidden>
              {["🌸", "🌷", "🌼", "🌺", "💮", "🌹"][k]}
            </span>
          ))}
          <button type="button" onClick={yes} className="pp-q-yes" data-pp-yes>
            {yesLabel}
          </button>
        </div>
        <button
          ref={noRef}
          type="button"
          className={`pp-q-no${seed ? " is-yes" : ""}${honest ? " is-free" : ""}`}
          data-pp-no={honest ? "free" : seed ? "yes" : "wilting"}
          aria-label={seed ? "Okay fine, yes" : honest ? thinkLabel : `No — ${noLabel}`}
          onPointerDown={(e) => {
            if (tired) return;
            e.preventDefault();
            wilt();
          }}
          onKeyDown={(e) => {
            if (!tired && (e.key === "Enter" || e.key === " ")) {
              e.preventDefault();
              lastWilt.current = 0;
              wilt();
            }
          }}
          onClick={pressNo}
          style={{ transform: `translateX(calc(-50% + ${shift}px)) rotate(${droop}deg) scale(${shrink})` }}
        >
          {!tired && (
            <span className="pp-q-stem" aria-hidden>
              🥀
            </span>
          )}
          {noLabel}
        </button>
        {!reduced &&
          drops.map((d) => (
            <span key={d} className="pp-q-drop" style={{ left: `calc(50% + ${(d % 2 ? -1 : 1) * 20}px)` }} aria-hidden />
          ))}
        <span className="vw-sr" aria-live="polite">
          {wilts > 0 && !tired ? `No wilted a little. ${noLabel}` : honest ? `No stood back up. It now says: ${thinkLabel}` : ""}
        </span>
      </div>
      <div style={{ flex: "none", minHeight: 24 }}>
        {wilts > 0 && !tired && (
          <p className="pp-q-count">
            No wilted ×{wilts} 🥀{canSayNo ? ` · ${limit - wilts} more ${limit - wilts === 1 ? "try" : "tries"}` : ""}
          </p>
        )}
        {honest && <p className="pp-q-free">It&apos;s really your choice. Either is okay 🤍</p>}
      </div>

      <AnimatePresence>
        {asking && (
          <motion.div className="pp-q-sure" role="dialog" aria-modal="true" aria-labelledby="pp-q-sure-t" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduced ? 0 : 0.22 }}>
            <motion.div className="pp-q-sure-card" initial={reduced ? false : { y: 24, scale: 0.94 }} animate={{ y: 0, scale: 1 }} exit={reduced ? undefined : { y: 16, scale: 0.96 }} transition={{ type: "spring", stiffness: 320, damping: 24 }}>
              <p className="pp-q-sure-e" aria-hidden>
                🤍
              </p>
              <h3 id="pp-q-sure-t">Want a little time?</h3>
              <p className="pp-q-sure-s">That&apos;s completely okay. They&apos;ll know you saw every bit of it, and they&apos;ll wait.</p>
              <button type="button" className="pp-q-sure-back" autoFocus onClick={() => setAsking(false)}>
                Wait, take me back 💗
              </button>
              <button
                type="button"
                className="pp-q-sure-no"
                data-pp-confirm-no
                onClick={() => {
                  setAsking(false);
                  onNo(wiltsRef.current);
                }}
              >
                Yes, let me think about it
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

const Q_CSS = `
.pp-q-gif { flex: none; }
/* The "yes" GIF is sized from the room it has, so on a short phone it never sits on the "said YES!!" line. */
.pp-yes-gif { display: grid; place-items: center; height: min(30cqh, 170px); }
.pp-yes-gif .pp-stk > span, .pp-yes-gif .pp-stk img { width: min(150px, calc(30cqh - 14px)) !important; height: min(150px, calc(30cqh - 14px)) !important; }
.pp-q-gif .pp-stk img { width: clamp(84px, 15dvh, 128px) !important; height: clamp(84px, 15dvh, 128px) !important; }
.pp-q-arena { position: relative; flex: 1 1 0; min-height: 170px; width: 100%; max-width: calc(420px * var(--vw-s, 1)); max-height: 300px; }
.pp-q-yes-wrap { position: absolute; left: 50%; top: 32%; z-index: 2; width: max-content; max-width: 92%; transition: transform .45s cubic-bezier(.3,1.6,.5,1); }
.pp-q-yes { position: relative; min-width: 160px; max-width: min(300px, 80vw); min-height: 60px; padding: 14px 26px; border-radius: 999px; border: 0; cursor: pointer; touch-action: manipulation;
  background: linear-gradient(180deg, color-mix(in srgb, var(--vw-accent) 68%, #FFFFFF), var(--vw-accent) 55%, var(--vw-accent-deep)); color: #FFFFFF; font: 700 20px ${FONTS.ui};
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; text-shadow: 0 1px 0 color-mix(in srgb, var(--pp-deep) 60%, transparent);
  box-shadow: 0 5px 0 var(--pp-deep), 0 0 0 4px #FFFFFF, 0 0 0 6px var(--vw-gold), 0 18px 30px -12px color-mix(in srgb, var(--pp-deep) 70%, transparent); animation: pp-yes-glow 1.8s ease-in-out infinite alternate; }
@keyframes pp-yes-glow { from { filter: brightness(1) } to { filter: brightness(1.08) } }
.pp-q-yes:focus-visible { outline: 3px solid var(--vw-ink); outline-offset: 7px; }
.pp-q-bloom { position: absolute; z-index: 3; font-size: 22px; line-height: 1; pointer-events: none; transform: translate(-50%, -50%);
  animation: pp-bloom-in .5s cubic-bezier(.3,1.8,.5,1) both; }
@keyframes pp-bloom-in { from { opacity: 0; scale: .2 } to { opacity: 1; scale: 1 } }
.pp-q-no { position: absolute; left: 50%; top: 72%; z-index: 3; display: inline-flex; align-items: center; gap: 6px; min-height: 46px; min-width: 84px; max-width: calc(100% - 16px); padding: 10px 18px; border-radius: 999px; cursor: pointer; touch-action: manipulation;
  border: 2px dashed var(--vw-edge); background: color-mix(in srgb, var(--vw-paper) 85%, transparent); color: var(--vw-ink-soft); font: 700 16px ${FONTS.ui}; transform-origin: 50% 0;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; transition: transform .5s cubic-bezier(.3,1.4,.5,1), background .3s ease; }
.pp-q-stem { font-size: 16px; }
.pp-q-no.is-yes { border: 0; background: linear-gradient(180deg, color-mix(in srgb, var(--vw-accent) 68%, #FFFFFF), var(--vw-accent)); color: #FFFFFF; box-shadow: 0 4px 0 var(--pp-deep); animation: pp-sprout .6s cubic-bezier(.3,1.8,.5,1); }
@keyframes pp-sprout { from { scale: .3 } to { scale: 1 } }
.pp-q-no.is-free { border-style: solid; color: var(--vw-ink); font-weight: 600; }
.pp-q-no:focus-visible { outline: 3px solid var(--vw-ink); outline-offset: 4px; }
.pp-q-arena.is-settled .pp-q-no { top: calc(32% + 64px); }
.pp-q-drop { position: absolute; top: 74%; width: 12px; height: 16px; border-radius: 80% 0 80% 0; background: linear-gradient(135deg, #FFFFFF, var(--vw-accent)); pointer-events: none; opacity: 0;
  animation: pp-drop 1.2s ease-in forwards; }
@keyframes pp-drop { 0% { opacity: 1; transform: translate(0, 0) rotate(0) } 100% { opacity: 0; transform: translate(-24px, 90px) rotate(220deg) } }
.pp-q-count { margin: 0; font: 700 clamp(15px, 2.3dvh, 18px) ${FONTS.ui}; color: var(--vw-accent-deep); }
.pp-q-free { margin: 0; font: 500 clamp(13px, 2dvh, 15px) ${FONTS.ui}; color: var(--vw-ink-soft); }
.pp-q-sure { position: fixed; inset: 0; z-index: 90; display: grid; place-items: center; padding: 20px; background: color-mix(in srgb, var(--pp-deep) 30%, transparent); backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px); }
.pp-q-sure-card { width: min(340px, 100%); box-sizing: border-box; padding: 22px 20px 18px; border-radius: 26px; text-align: center; display: grid; gap: 10px; justify-items: center;
  background: var(--vw-paper); color: var(--vw-ink); box-shadow: 0 0 0 3px var(--vw-edge), 0 30px 60px -20px color-mix(in srgb, var(--pp-deep) 70%, transparent); }
.pp-q-sure-e { margin: 0; font-size: 44px; line-height: 1; }
.pp-q-sure-card h3 { margin: 0; font: 700 clamp(28px, 7.5vw, 34px)/1.05 ${PP_SERIF}; }
.pp-q-sure-s { margin: 0 0 6px; font: 500 15px/1.45 ${FONTS.ui}; color: var(--vw-ink-soft); }
.pp-q-sure-back { width: 100%; min-height: 52px; border: 0; border-radius: 999px; cursor: pointer; font: 700 17px ${FONTS.ui}; color: #FFFFFF;
  background: linear-gradient(180deg, color-mix(in srgb, var(--vw-accent) 68%, #FFFFFF), var(--vw-accent-deep)); box-shadow: 0 4px 0 var(--pp-deep); }
.pp-q-sure-no { min-height: 44px; padding: 0 18px; border: 0; background: none; cursor: pointer; font: 600 15px ${FONTS.ui}; color: var(--vw-ink-soft); text-decoration: underline; text-underline-offset: 3px; }
.pp-q-sure-back:focus-visible, .pp-q-sure-no:focus-visible { outline: 3px solid var(--vw-ink); outline-offset: 3px; }
@media (prefers-reduced-motion: reduce) { .pp-q-no, .pp-q-yes-wrap { transition: none; } .pp-q-yes, .pp-q-bloom, .pp-q-no.is-yes { animation: none; } }
`;

// ─── 10 · YES — and the ring goes on ────────────────────────────────────────

export function YesRoom({ recipient, sender, yesLine, wilts, sticker, onNext }: { recipient: string; sender: string; yesLine: string; wilts: number; sticker: ReactNode; onNext: () => void }) {
  const { cue } = usePp();
  const reduced = useReducedMotion();
  const [phase, setPhase] = useState<"cheer" | "ring" | "on">("cheer");
  const handRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLButtonElement | null>(null);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);

  const target = () => {
    const h = handRef.current?.getBoundingClientRect();
    if (!h) return null;
    return { x: h.left + (HAND_FINGER.x / 200) * h.width, y: h.top + (HAND_FINGER.y / 280) * h.height };
  };
  const slideOn = () => {
    const t = target();
    const r = ringRef.current?.getBoundingClientRect();
    if (!t || !r) return;
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height * 0.66;
    const opts = reduced ? { duration: 0 } : { type: "spring" as const, stiffness: 140, damping: 18 };
    animate(rx, rx.get() + (t.x - cx), opts);
    animate(ry, ry.get() + (t.y - cy), opts).then(() => {
      setPhase("on");
      haptic([20, 40, 30]);
      cue("glass-ping", { gain: 0.8 });
      cue("chime-cascade", { gain: 0.7, at: 0.1 });
      if (!reduced) {
        burst({ kind: "sparkles", origin: { x: t.x / window.innerWidth, y: t.y / window.innerHeight }, count: 28, spread: 0.3 });
        window.setTimeout(() => burst({ kind: "hearts", origin: { x: 0.5, y: 0.3 }, count: 30 }), 300);
      }
    });
  };
  const drop = () => {
    const t = target();
    const r = ringRef.current?.getBoundingClientRect();
    if (!t || !r) return;
    const d = Math.hypot(r.left + r.width / 2 - t.x, r.top + r.height * 0.66 - t.y);
    if (d < Math.max(70, r.width)) slideOn();
    else {
      animate(rx, 0, { type: "spring", stiffness: 260, damping: 20 });
      animate(ry, 0, { type: "spring", stiffness: 260, damping: 20 });
    }
  };

  useNext(phase === "cheer" ? "Put the ring on" : phase === "on" ? "Make it official" : null, phase === "cheer" ? () => setPhase("ring") : onNext, phase === "on" ? "heart" : "ring", phase !== "cheer");

  if (phase === "cheer")
    return (
      <div className="pp-fill" style={{ alignContent: "center" }}>
        <div className="pp-zoom" style={{ display: "grid", gap: "clamp(8px, 1.8dvh, 16px)", justifyItems: "center" }}>
          <div className="pp-yes-gif">{sticker}</div>
          <h2 className="pp-title" style={{ fontSize: "clamp(36px, min(11vw, 6dvh), 56px)" }}>
            {recipient} said <em>YES!!</em> 💍
          </h2>
          <p style={{ margin: "0 auto", maxWidth: 360, font: `400 clamp(18px, 2.7dvh, 22px)/1.4 ${PP_HAND}`, color: "var(--vw-ink)", overflowWrap: "anywhere" }}>
            {yesLine || "You just made me the happiest person in the whole world 🥹"}
          </p>
          <p style={{ margin: 0, font: `700 clamp(15px, 2.3dvh, 18px) ${FONTS.ui}`, color: "var(--vw-accent-deep)" }}>
            {wilts > 0 ? `…after No wilted ${wilts} ${wilts === 1 ? "time" : "times"} 🥀` : `— ${sender}, very much in love`}
          </p>
        </div>
      </div>
    );

  return (
    <>
      <Head kicker="One last thing" title={phase === "on" ? <>It <em>fits.</em> Perfectly.</> : "Slide the ring on"} sub={phase === "on" ? "Just like we do 💗" : "Drag the ring onto the ring finger 💍"} />
      <div className="pp-fill">
        <div className={`pp-hand${phase === "on" ? " is-on" : ""}`} ref={handRef}>
          <Hand ring={phase === "on"} />
          {phase !== "on" && <span className="pp-hand-target" style={{ left: `${(HAND_FINGER.x / 200) * 100}%`, top: `${(HAND_FINGER.y / 280) * 100}%` }} aria-hidden />}
          {phase === "on" && (
            <span className="pp-hand-glint" style={{ left: `${(HAND_FINGER.x / 200) * 100}%`, top: `${(HAND_FINGER.y / 280) * 100 - 6}%` }} aria-hidden>
              <Sparkle size={26} color="#FFFFFF" />
            </span>
          )}
        </div>
        {phase !== "on" && (
          <motion.button
            ref={ringRef}
            type="button"
            className="pp-ring-drag"
            drag
            dragMomentum={false}
            style={{ x: rx, y: ry }}
            onDragEnd={drop}
            onTap={slideOn}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                slideOn();
              }
            }}
            aria-label="The ring — drag it onto the ring finger (or press to slide it on)"
            data-pp-ring
          >
            <Ring />
          </motion.button>
        )}
      </div>
      <style>{HAND_CSS}</style>
    </>
  );
}

const HAND_CSS = `
.pp-hand { position: relative; height: min(78cqh, 400px); aspect-ratio: 200 / 280; max-width: 70cqw; }
.pp-hand svg { position: relative; width: 100%; height: 100%; }
.pp-hand::before { content: ""; position: absolute; left: 50%; top: 44%; width: 120%; aspect-ratio: 1; transform: translate(-50%, -50%); border-radius: 50%;
  background: radial-gradient(circle, #FFFFFF 0 30%, color-mix(in srgb, var(--pp-blush) 80%, transparent) 55%, transparent 70%); }
.pp-hand-target { position: absolute; width: 15%; aspect-ratio: 1.6; transform: translate(-50%, -50%); border-radius: 50%; border: 2.5px dashed var(--vw-accent-deep); animation: pp-target 1.3s ease-in-out infinite; }
@keyframes pp-target { 0%, 100% { scale: 1; opacity: .9 } 50% { scale: 1.25; opacity: .5 } }
.pp-hand-glint { position: absolute; transform: translate(-50%, -50%); animation: pp-twinkle 1s ease-in-out infinite alternate; }
.pp-hand.is-on { animation: pp-hand-joy .7s cubic-bezier(.3,1.6,.5,1); }
@keyframes pp-hand-joy { 0% { transform: rotate(-4deg) scale(.96) } 100% { transform: none } }
.pp-ring-drag { position: absolute; right: 4%; bottom: 2%; width: clamp(66px, 20cqw, 90px); padding: 0; border: 0; background: none; cursor: grab; touch-action: none; z-index: 3;
  filter: drop-shadow(0 8px 10px color-mix(in srgb, var(--pp-deep) 40%, transparent)); -webkit-tap-highlight-color: transparent; animation: pp-ring-float 1.6s ease-in-out infinite alternate; }
@keyframes pp-ring-float { from { rotate: -6deg } to { rotate: 6deg } }
.pp-ring-drag svg { width: 100%; height: auto; display: block; pointer-events: none; }
.pp-ring-drag:focus-visible { outline: 3px solid var(--vw-ink); outline-offset: 2px; border-radius: 16px; }
@media (prefers-reduced-motion: reduce) { .pp-hand-target, .pp-hand-glint, .pp-ring-drag, .pp-hand.is-on { animation: none; } }
`;

export function ThinkRoom({ sender, recipient, onReplay }: { sender: string; recipient: string; onReplay: () => void }) {
  const { go } = usePp();
  const tell = () => {
    const text = `I saw everything, ${sender} 🤍 Let me think about it, and thank you for this.`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  };
  useNext(`Tell ${sender}`, tell, "heart", false);
  return (
    <div className="pp-fill" style={{ alignContent: "center" }} data-pp-declined>
      <div className="pp-zoom" style={{ display: "grid", gap: "clamp(10px, 2dvh, 18px)", justifyItems: "center", maxWidth: 420 }}>
        <p style={{ margin: 0, fontSize: 56, lineHeight: 1 }} aria-hidden>
          🌷
        </p>
        <h2 className="pp-title">Take all the time you need 🤍</h2>
        <p style={{ margin: 0, font: `400 clamp(18px, 2.7dvh, 21px)/1.45 ${PP_HAND}`, color: "var(--vw-ink)", overflowWrap: "anywhere" }}>
          Thank you for walking through the whole garden, {recipient}. {sender} will be right here. No pressure, no rush.
        </p>
        <p style={{ margin: 0, font: `500 14px/1.4 ${FONTS.ui}`, color: "var(--vw-ink-soft)" }}>{sender} will know you answered, gently.</p>
        <button type="button" onClick={() => go(onReplay)} className="pp-ghost">
          Walk the garden again 🌷
        </button>
      </div>
    </div>
  );
}

// ─── 11 · The keepsakes ─────────────────────────────────────────────────────

export function Ending({
  day,
  data,
  mode,
  palette,
  recipient,
  sender,
  certificate,
  together,
  sinceText,
  datePlan,
  sticker,
  replyText,
  onReplay,
}: {
  day: DayConfig;
  data: ValentineDayData;
  mode: "preview" | "live";
  palette: ProposalPaletteDef;
  recipient: string;
  sender: string;
  certificate: string;
  together: string;
  sinceText: string;
  datePlan: string;
  sticker: ReactNode;
  replyText: string;
  onReplay: () => void;
}) {
  const reduced = useReducedMotion();
  const { go } = usePp();
  const [sheet, setSheet] = useState<"cert" | "date">("cert");
  const now = useMemo(() => new Date(), []);
  const today = now.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  const certNo = useMemo(() => {
    let h = 11;
    for (const ch of `${sender}♡${recipient}`) h = (h * 31 + ch.charCodeAt(0)) % 99991;
    return `OURS-${String(h).padStart(5, "0")}`;
  }, [recipient, sender]);

  useEffect(() => {
    if (reduced) return;
    const t = window.setTimeout(() => burst({ kind: "petals", origin: { x: 0.5, y: 0.1 }, count: 34, spread: 0.7 }), 400);
    return () => window.clearTimeout(t);
  }, [reduced, sheet]);

  const makeOwn = () => {
    haptic(12);
    const link = typeof window !== "undefined" ? `${window.location.origin}/proposal-premium` : "https://subhsandesh.in/proposal-premium";
    const text = `Someone proposed to me with a whole fairytale garden 🥹💍\nMake one for your own person:\n${link}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  };

  const t = palette.theme;
  const keepsake = (): KeepsakeLayout => {
    const W = 1080;
    const items: KeepsakeItem[] = [
      { type: "text", text: "✦  OFFICIALLY OURS  ✦", x: W / 2, y: 150, size: 40, weight: 700, color: t.accentDeep, face: "ui" },
      { type: "rect", x: 90, y: 210, w: 900, h: 1060, radius: 56, fill: t.paper },
      { type: "rect", x: 114, y: 234, w: 852, h: 1012, radius: 42, stroke: t.gold, lineWidth: 7 },
      { type: "emoji", char: "💍", x: W / 2, y: 370, size: 150 },
      { type: "text", text: certificate, x: W / 2, y: 560, size: 84, weight: 700, color: t.ink, face: "serif", maxWidth: 800, maxLines: 2 },
      { type: "text", text: "This certifies that", x: W / 2, y: 680, size: 36, color: t.inkSoft, face: "ui" },
      { type: "text", text: `${sender} & ${recipient}`, x: W / 2, y: 800, size: 96, face: "script", weight: 700, color: t.accentDeep, maxWidth: 820, maxLines: 1 },
      { type: "text", text: together, x: W / 2, y: 900, size: 40, color: t.ink, face: "ui", maxWidth: 820, maxLines: 1 },
      { type: "text", text: `Said yes on ${today}${sinceText ? `  ·  together since ${sinceText}` : ""}`, x: W / 2, y: 990, size: 30, weight: 600, color: t.inkSoft, face: "ui", maxWidth: 820, maxLines: 2 },
      { type: "text", text: certNo, x: W / 2, y: 1080, size: 28, weight: 600, color: t.inkSoft, face: "ui" },
      { type: "text", text: "Valid forever · Hand-holding required", x: W / 2, y: 1170, size: 32, face: "serif", italic: true, color: t.inkSoft },
      { type: "rect", x: 170, y: 1340, w: 740, h: 400, radius: 44, fill: palette.blush },
      { type: "text", text: "SAVE THE DATE", x: W / 2, y: 1430, size: 38, weight: 700, color: t.accentDeep, face: "ui" },
      { type: "text", text: datePlan, x: W / 2, y: 1540, size: 52, face: "script", weight: 700, color: t.ink, maxWidth: 680, maxLines: 2 },
      { type: "text", text: "our first date as us 💗", x: W / 2, y: 1680, size: 32, face: "serif", italic: true, color: t.inkSoft },
    ];
    if (data.endLine) items.push({ type: "text", text: data.endLine, x: W / 2, y: 1810, size: 36, face: "serif", italic: true, color: t.ink, maxWidth: 940, maxLines: 1 });
    items.push({ type: "text", text: "Made on subhsandesh.in 💗", x: W / 2, y: 1880, size: 28, color: t.inkSoft, face: "ui" });
    return { background: { stops: [[0, "#FFFFFF"], [0.45, t.base], [1, palette.sun]] }, items };
  };

  useNext(sheet === "cert" ? "Save the date" : "Make one", sheet === "cert" ? () => setSheet("date") : makeOwn, sheet === "cert" ? "heart" : "sparkle", sheet === "cert");

  if (sheet === "date")
    return (
      <>
        <style>{CERT_CSS}</style>
        <Head kicker="Officially us" title={<>Save the <em>date</em></>} sub={`Keep it, then tell ${sender}.`} />
        <div className="pp-fill">
          <motion.div className="pp-std pp-zoom" initial={reduced ? false : { opacity: 0, y: 24, rotate: 2 }} animate={{ opacity: 1, y: 0, rotate: -1.5 }} transition={{ type: "spring", stiffness: 170, damping: 18 }} data-pp-save-the-date>
            <div className="pp-std-cal" aria-hidden>
              <span className="pp-std-m">{now.toLocaleDateString("en-IN", { month: "short" })}</span>
              <span className="pp-std-d">{now.getDate()}</span>
              <span className="pp-std-c">said yes</span>
            </div>
            <div className="pp-std-txt">
              <p className="pp-std-k">our first date as us</p>
              <p className="pp-std-p">{datePlan}</p>
              <p className="pp-std-n">
                {sender} &amp; {recipient}
              </p>
            </div>
            <span className="pp-std-gif" aria-hidden>
              {sticker}
            </span>
          </motion.div>
        </div>
        <div className="pp-zoom" style={{ flex: "none", width: "100%", maxWidth: 420 }}>
          <EndingActions day={day} data={data} mode={mode} onReplay={() => go(onReplay)} keepsake={keepsake} replyText={replyText} replyLabel={`💬 Reply to ${sender}`} />
        </div>
      </>
    );

  return (
    <>
      <style>{CERT_CSS}</style>
      <div className="pp-fill">
        <FitBox>
          <motion.div className="pp-cert pp-zoom" initial={reduced ? false : { opacity: 0, y: 30, rotate: -2 }} animate={{ opacity: 1, y: 0, rotate: 0 }} transition={{ type: "spring", stiffness: 160, damping: 18 }} data-pp-certificate>
          <span className="pp-cert-corner pp-cert-tl" aria-hidden>
            ❦
          </span>
          <span className="pp-cert-corner pp-cert-br" aria-hidden>
            ❦
          </span>
          <p className="pp-cert-k">Certificate of togetherness</p>
          <p className="pp-cert-ring" aria-hidden>
            💍
          </p>
          <h2 className="pp-cert-t">{certificate}</h2>
          <p className="pp-cert-s">This certifies that</p>
          <p className="pp-cert-n">
            {sender} &amp; {recipient}
          </p>
          <p className="pp-cert-s">{together}</p>
          <p className="pp-cert-f">
            Said yes on {today}
            {sinceText ? (
              <>
                <br />
                Together since {sinceText}
              </>
            ) : null}
            <br />
            {certNo} · Valid forever · Hand-holding required
          </p>
          <span className="pp-cert-stamp" aria-hidden>
            SAID YES ✓
          </span>
          {data.endLine && <p className="pp-cert-end">{data.endLine}</p>}
          </motion.div>
        </FitBox>
      </div>
    </>
  );
}

const CERT_CSS = `
.pp-cert { position: relative; width: min(100%, 390px); max-height: 100%; box-sizing: border-box; padding: 20px 22px 18px; border-radius: 26px; overflow: hidden;
  background: radial-gradient(120% 60% at 50% 0%, #FFFFFF, var(--vw-paper) 70%, var(--pp-blush));
  box-shadow: inset 0 0 0 3px var(--vw-gold), inset 0 0 0 9px #FFFFFF, inset 0 0 0 10.5px var(--vw-edge), 0 28px 50px -24px color-mix(in srgb, var(--pp-deep) 70%, transparent);
  display: grid; justify-items: center; gap: 3px; text-align: center; }
.pp-cert-corner { position: absolute; font-size: 22px; color: var(--vw-gold); }
.pp-cert-tl { left: 18px; top: 14px; } .pp-cert-br { right: 18px; bottom: 12px; transform: rotate(180deg); }
.pp-cert-k { margin: 0; font: 700 11px ${FONTS.ui}; letter-spacing: .2em; text-transform: uppercase; color: var(--vw-accent-deep); }
.pp-cert-ring { margin: 4px 0 0; font-size: clamp(38px, 6dvh, 52px); line-height: 1; }
.pp-cert-t { margin: 4px 0 4px; font: 700 clamp(30px, 4.6dvh, 40px)/1.02 ${PP_SERIF}; color: var(--vw-ink); text-wrap: balance; }
.pp-cert-s { margin: 0; font: 500 14px ${FONTS.ui}; color: var(--vw-ink-soft); overflow-wrap: anywhere; }
.pp-cert-n { margin: 2px 0; font: 700 clamp(30px, 4.6dvh, 40px)/1.15 ${PP_SCRIPT}; color: var(--vw-accent-deep); overflow-wrap: anywhere; }
.pp-cert-f { margin: 8px 0 0; font: 500 13px/1.5 ${FONTS.ui}; color: var(--vw-ink-soft); }
.pp-cert-stamp { position: absolute; right: 10px; top: 64px; padding: 4px 9px; border: 3px solid var(--vw-accent); border-radius: 10px; transform: rotate(14deg);
  font: 800 12px ${FONTS.ui}; letter-spacing: .1em; color: var(--vw-accent-deep); background: color-mix(in srgb, #FFFFFF 70%, transparent); animation: pp-stamp-in .55s cubic-bezier(.3,1.6,.5,1) .6s both; }
@keyframes pp-stamp-in { from { transform: rotate(14deg) scale(2.4); opacity: 0 } to { transform: rotate(14deg) scale(1); opacity: 1 } }
.pp-cert-end { margin: 8px 0 0; font: 400 clamp(16px, 2.4dvh, 19px)/1.35 ${PP_HAND}; color: var(--vw-ink); overflow-wrap: anywhere; }
.pp-std { position: relative; width: min(100%, 380px); box-sizing: border-box; padding: 18px 18px 18px 16px; border-radius: 24px; display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 14px; align-items: center; text-align: left;
  background: linear-gradient(160deg, #FFFFFF, var(--vw-paper) 50%, var(--pp-blush)); box-shadow: 0 0 0 2px var(--vw-gold), 0 0 0 6px #FFFFFF, 0 0 0 7.5px var(--vw-edge), 0 24px 40px -22px color-mix(in srgb, var(--pp-deep) 70%, transparent); }
.pp-std-cal { width: 74px; border-radius: 14px; overflow: hidden; display: grid; text-align: center; background: #FFFFFF; box-shadow: 0 0 0 2px var(--vw-edge), 0 8px 14px -8px color-mix(in srgb, var(--pp-deep) 50%, transparent); }
.pp-std-m { padding: 4px 0; font: 800 13px ${FONTS.ui}; letter-spacing: .12em; text-transform: uppercase; color: #FFFFFF; background: var(--vw-accent-deep); }
.pp-std-c { padding: 0 0 6px; font: 700 10px ${FONTS.ui}; letter-spacing: .08em; text-transform: uppercase; color: var(--vw-accent-deep); }
.pp-std-d { padding: 4px 0 2px; font: 700 36px/1 ${PP_SERIF}; color: var(--vw-ink); }
.pp-std-txt { display: grid; gap: 2px; min-width: 0; padding-right: 50px; }
.pp-std-k { margin: 0; font: 700 11px ${FONTS.ui}; letter-spacing: .16em; text-transform: uppercase; color: var(--vw-accent-deep); }
.pp-std-p { margin: 0; font: 700 clamp(20px, 3dvh, 25px)/1.2 ${PP_SCRIPT}; color: var(--vw-ink); overflow-wrap: anywhere; }
.pp-std-n { margin: 2px 0 0; font: 600 italic 16px ${PP_SERIF}; color: var(--vw-ink-soft); overflow-wrap: anywhere; }
.pp-std-gif { position: absolute; right: -12px; top: -46px; transform: rotate(8deg); }
.pp-std-gif .pp-stk img { width: 72px !important; height: 72px !important; }
/* Phones: the hug GIF tucks into the card's top-right corner instead of climbing over the heading above. */
@media (max-width: 479px) {
  .pp-std-gif { top: 8px; right: 8px; }
  .pp-std-gif .pp-stk > span, .pp-std-gif .pp-stk img { width: 46px !important; height: 46px !important; }
  .pp-std-gif .pp-stk { padding: 4px; border-radius: 16px; }
  .pp-std-txt { padding-right: 52px; }
}
@media (prefers-reduced-motion: reduce) { .pp-cert-stamp { animation: none; } }
`;
