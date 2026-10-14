"use client";

// Scenes 7–10: the golden ticket (scratch it), the pop-up letter (pull the
// card open), the question ("hmm…" spins a wheel that only says yes), the yes
// (and when?) and the stamped birthday passport.

import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { AnimatePresence, animate, motion, useMotionValue, useTransform } from "framer-motion";
import { EndingActions, ScratchCanvas, burst, haptic, useReducedMotion, type KeepsakeItem, type KeepsakeLayout } from "../../../_valentine/kit";
import { BP_PLANS, BP_WHEEL, type BpPaletteDef } from "../../../_valentine/days/birthday-premium";
import type { DayConfig, LovePhoto, ValentineDayData } from "../../../_valentine/types";
import { FONTS } from "../../../_valentine/theme";
import { CroppedPhoto } from "../../../_valentine/kit";
import { BP_DISPLAY, BP_HAND } from "./fonts";
import { useBp, useNext } from "./stage";
import { BpScroll, Head } from "./ui";

// ─── 7 · The golden ticket ──────────────────────────────────────────────────

export function GoldenTicket({ recipient, title, line, sticker, confetti, onNext }: { recipient: string; title: string; line: string; sticker: ReactNode; confetti: readonly string[]; onNext: () => void }) {
  const reduced = useReducedMotion();
  const { cue } = useBp();
  const [shown, setShown] = useState(false);
  const scratched = useRef(0);
  const reveal = () => {
    setShown(true);
    haptic(26);
    cue("chime-cascade", { gain: 0.7 });
    cue("sparkle", { gain: 0.5, at: 0.2 });
    burst({ kind: "confetti", colors: ["#FFD66E", "#F4B73E", "#FFFFFF", ...confetti.slice(0, 3)], origin: { x: 0.5, y: 0.45 }, count: 110 });
  };
  useNext(shown ? "Next chapter" : null, onNext, "letter");
  return (
    <>
      <style>{TICKET_CSS}</style>
      <Head kicker="Chapter seven · your gift" title={shown ? "You found the golden ticket!" : "Scratch the golden ticket"} sub={shown ? "It's real. It's yours. 🎟️" : "There's a real birthday surprise under the gold ✨"} />
      <div className="bp-fill">
        <motion.div className={`bp-ticket${shown ? " is-shown" : ""}`} initial={reduced ? false : { opacity: 0, y: 30, rotate: -4 }} animate={{ opacity: 1, y: 0, rotate: shown ? 0 : -2 }} transition={{ type: "spring", stiffness: 150, damping: 16 }} data-bp-ticket>
          <span className="bp-ticket-k">✦ Admit one ✦</span>
          <span className="bp-ticket-name">{recipient}</span>
          <ScratchCanvas
            className="bp-ticket-scratch"
            cover={["#E9B949", "#FFE39A"]}
            label="Scratch here ✨"
            labelColor="rgba(92,58,8,.8)"
            threshold={0.5}
            brush={24}
            radius={14}
            revealLinkAfterMs={5000}
            onProgress={(p) => {
              if (p - scratched.current > 0.08) {
                scratched.current = p;
                cue("paper-rustle", { gain: 0.25 });
                haptic(4);
              }
            }}
            onReveal={reveal}
          >
            <span className="bp-ticket-gift">
              <b>{title}</b>
              {line && <span>{line}</span>}
            </span>
          </ScratchCanvas>
          <span className="bp-ticket-foot">
            <i>No. 0001</i>
            <i>valid forever</i>
          </span>
          {shown && <span className="bp-ticket-stamp">VALID ✓</span>}
          {shown && <span className="bp-ticket-gif">{sticker}</span>}
        </motion.div>
      </div>
    </>
  );
}

const TICKET_CSS = `
.bp-ticket { position: relative; width: min(92cqw, 380px); display: grid; gap: 8px; justify-items: center; padding: 18px 22px 16px; box-sizing: border-box; color: #5C3A08;
  background: radial-gradient(circle at 0 50%, transparent 14px, #FFF4CF 14.5px) left / 51% 100% no-repeat, radial-gradient(circle at 100% 50%, transparent 14px, #FFF4CF 14.5px) right / 51% 100% no-repeat;
  filter: drop-shadow(0 0 0 #E9B949) drop-shadow(0 0 2px #C99A2E) drop-shadow(0 22px 26px color-mix(in srgb, var(--bp-deep) 30%, transparent)); }
.bp-ticket::before { content: ""; position: absolute; inset: 7px 20px; border: 2px dashed rgba(201,154,46,.6); border-radius: 12px; pointer-events: none; }
.bp-ticket-k { font: 800 12px ${FONTS.ui}; letter-spacing: .26em; text-transform: uppercase; color: #A87612; }
.bp-ticket-name { font: 800 clamp(26px, 4.2dvh, 36px)/1.05 ${BP_DISPLAY}; color: #5C3A08; overflow-wrap: anywhere; text-align: center; max-width: 100%; }
.bp-ticket-scratch { width: 100%; height: clamp(120px, 20dvh, 160px); box-shadow: inset 0 0 0 2px rgba(201,154,46,.5); background: #FFFDF4; }
.bp-ticket-gift { display: grid; gap: 4px; padding: 10px 14px; text-align: center; }
.bp-ticket-gift b { font: 800 clamp(20px, 3dvh, 25px)/1.15 ${BP_DISPLAY}; color: var(--vw-accent-deep); overflow-wrap: anywhere; }
.bp-ticket-gift span { font: 400 clamp(17px, 2.5dvh, 20px)/1.2 ${BP_HAND}; color: #5C3A08; overflow-wrap: anywhere; }
.bp-ticket-foot { width: 100%; display: flex; justify-content: space-between; font: 700 11px ${FONTS.ui}; letter-spacing: .12em; text-transform: uppercase; color: #A87612; }
.bp-ticket-foot i { font-style: normal; }
.bp-ticket.is-shown { animation: bp-shine 2.4s ease-in-out infinite alternate; }
@keyframes bp-shine { from { filter: drop-shadow(0 0 0 #E9B949) drop-shadow(0 0 2px #C99A2E) drop-shadow(0 22px 26px rgba(0,0,0,.12)) } to { filter: drop-shadow(0 0 10px #FFE08A) drop-shadow(0 0 2px #C99A2E) drop-shadow(0 22px 26px rgba(0,0,0,.12)) } }
.bp-ticket-stamp { position: absolute; right: 18px; top: 12px; padding: 3px 9px; border: 3px solid var(--vw-accent-deep); border-radius: 9px; transform: rotate(12deg); font: 800 13px ${FONTS.ui}; letter-spacing: .1em; color: var(--vw-accent-deep); background: rgba(255,255,255,.7); animation: bp-stamp-in .5s cubic-bezier(.3,1.6,.5,1) both; }
@keyframes bp-stamp-in { from { transform: rotate(12deg) scale(2.6); opacity: 0 } to { transform: rotate(12deg) scale(1); opacity: 1 } }
.bp-ticket-gif { position: absolute; left: -8px; top: -58px; pointer-events: none; }
.bp-ticket-gif .bp-stk img { width: clamp(64px, 11dvh, 92px) !important; height: auto !important; }
@media (prefers-reduced-motion: reduce) { .bp-ticket.is-shown, .bp-ticket-stamp { animation: none; } }
`;

// ─── 8 · The pop-up letter ──────────────────────────────────────────────────

export function PopupLetter({ letter, recipient, sender, petName, signOff, onNext }: { letter: string; recipient: string; sender: string; petName: string; signOff: string; onNext: () => void }) {
  const reduced = useReducedMotion();
  const { cue } = useBp();
  const pull = useMotionValue(0);
  const cover = useTransform(pull, (v) => `rotateY(${v * -178}deg)`);
  const shift = useTransform(pull, (v) => `translateX(${(1 - v) * -25}%)`);
  const rise = useTransform(pull, [0.12, 0.75], [0, 1], { clamp: true });
  const [state, setState] = useState<"closed" | "opening" | "reading">("closed");
  const drag = useRef<{ x: number; w: number; id: number; t: number } | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const rustled = useRef(false);

  const open = useCallback(() => {
    if (state !== "closed") return;
    setState("opening");
    haptic(18);
    cue("page-turn", { gain: 0.6 });
    cue("chime", { gain: 0.5, at: 0.35 });
    const go = () => {
      setState("reading");
      cue("sparkle", { gain: 0.4 });
    };
    if (reduced) {
      pull.set(1);
      go();
    } else animate(pull, 1, { type: "spring", stiffness: 90, damping: 16, onComplete: () => window.setTimeout(go, 650) });
  }, [state, cue, reduced, pull]);

  const down = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (state !== "closed") return;
    const w = stageRef.current?.getBoundingClientRect().width ?? 300;
    drag.current = { x: e.clientX, w, id: e.pointerId, t: performance.now() };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const move = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId || state !== "closed") return;
    const v = Math.max(0, Math.min(1, (d.x - e.clientX) / (d.w * 0.6)));
    if (v > 0.05 && !rustled.current) {
      rustled.current = true;
      cue("paper-rustle", { gain: 0.5 });
    }
    pull.set(v);
  };
  const up = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    drag.current = null;
    if (!d || state !== "closed") return;
    const v = pull.get();
    const tap = v < 0.04 && performance.now() - d.t < 400 && Math.abs(d.x - e.clientX) < 8;
    if (tap || v > 0.35) open();
    else animate(pull, 0, { type: "spring", stiffness: 260, damping: 22 });
  };

  useNext(state === "reading" ? "I read every word" : null, onNext, "heart");
  const paras = letter.split(/\n{2,}/).filter((p) => p.trim());

  return (
    <>
      <style>{LETTER_CSS}</style>
      <Head kicker="The last chapter" title={state === "reading" ? `Dear ${petName || recipient},` : "A pop-up card, just for you"} sub={state === "closed" ? "Pull the tab to open it 💌" : undefined} />
      <div className="bp-fill">
        <AnimatePresence mode="wait" initial={false}>
          {state !== "reading" ? (
            <motion.div key="card" ref={stageRef} className="bp-pc-stage" style={{ transform: shift }} exit={reduced ? undefined : { opacity: 0, scale: 1.08, transition: { duration: 0.25 } }} data-bp-popcard>
              <div className="bp-pc-inner">
                <span className="bp-pc-right" aria-hidden>
                  <motion.span className="bp-pc-pop" style={{ scaleY: rise, opacity: rise }}>
                    <span className="bp-pc-arch">
                      <i>♥</i>
                      <i>♥</i>
                      <i>♥</i>
                    </span>
                    <b>for {petName || recipient}</b>
                  </motion.span>
                </span>
              </div>
              <motion.div
                className="bp-pc-cover"
                style={{ transform: cover }}
                onPointerDown={down}
                onPointerMove={move}
                onPointerUp={up}
                onPointerCancel={up}
                role="button"
                tabIndex={0}
                aria-label="Open the pop-up card"
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    open();
                  }
                }}
                data-bp-pull
              >
                <span className="bp-pc-front">
                  <span className="bp-pc-hb">Happy</span>
                  <span className="bp-pc-hb is-2">Birthday</span>
                  <span className="bp-pc-to">to my favourite person</span>
                  <span className="bp-pc-tab">
                    <b>◀</b> pull
                  </span>
                </span>
                <span className="bp-pc-back">
                  <span className="bp-pc-left">
                    <i>love,</i>
                    <b>{sender}</b>
                  </span>
                </span>
              </motion.div>
            </motion.div>
          ) : (
            <motion.article key="read" className="bp-letter" initial={reduced ? false : { opacity: 0, scale: 0.92, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ type: "spring", stiffness: 170, damping: 20 }} data-bp-letter>
              <span className="bp-letter-pop" aria-hidden>
                {["var(--vw-accent)", "var(--vw-gold)", "var(--bp-second)"].map((c, k) => (
                  <motion.i key={k} style={{ color: c }} initial={reduced ? false : { scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ type: "spring", stiffness: 260, damping: 11, delay: 0.15 + k * 0.12 }}>
                    ♥
                  </motion.i>
                ))}
              </span>
              <BpScroll className="bp-letter-scroll" label="The letter">
                <div className="bp-letter-body">
                  {paras.map((para, k) => (
                    <p key={k}>{para}</p>
                  ))}
                  <p className="bp-letter-sign">
                    {signOff}
                    <br />
                    <b>{sender}</b> 💗
                  </p>
                </div>
              </BpScroll>
            </motion.article>
          )}
        </AnimatePresence>
      </div>
      {state === "closed" && (
        <p className="bp-hint">
          <span className="bp-hint-hand" aria-hidden>
            👈
          </span>
          drag the tab left (or tap)
        </p>
      )}
    </>
  );
}

const LETTER_CSS = `
.bp-pc-stage { position: relative; width: min(100cqw, 100cqh, 540px); aspect-ratio: 2 / 1.5; perspective: 1400px; }
.bp-pc-inner { position: absolute; top: 0; bottom: 0; left: 50%; width: 50%; display: grid; border-radius: 0 12px 12px 0; overflow: hidden; background: var(--vw-paper); box-shadow: 0 0 0 2px var(--vw-edge), 0 24px 40px -22px color-mix(in srgb, var(--bp-deep) 70%, transparent); }
.bp-pc-left { position: absolute; inset: 0; display: grid; place-content: center; gap: 2px; text-align: center; box-shadow: inset -10px 0 14px -10px color-mix(in srgb, var(--bp-deep) 40%, transparent); border-radius: inherit; }
.bp-pc-left i { font: 400 18px ${BP_HAND}; color: var(--vw-ink-soft); font-style: normal; }
.bp-pc-left b { font: 800 clamp(16px, 5cqw, 22px) ${BP_DISPLAY}; color: var(--vw-accent-deep); overflow-wrap: anywhere; padding: 0 8px; }
.bp-pc-right { position: relative; display: grid; place-items: center; background: linear-gradient(180deg, var(--vw-paper), var(--bp-blush)); }
.bp-pc-pop { display: grid; justify-items: center; gap: 4px; transform-origin: 50% 100%; }
.bp-pc-arch { display: flex; align-items: flex-end; gap: 2px; }
.bp-pc-arch i { font-style: normal; font-size: clamp(36px, 12cqw, 60px); line-height: .9; color: var(--vw-accent); filter: drop-shadow(0 3px 0 color-mix(in srgb, var(--bp-deep) 30%, transparent)); }
.bp-pc-arch i:nth-child(2) { font-size: clamp(48px, 17cqw, 84px); color: var(--vw-gold); }
.bp-pc-arch i:nth-child(3) { color: var(--bp-second); }
.bp-pc-pop b { font: 400 clamp(17px, 5cqw, 22px) ${BP_HAND}; color: var(--vw-ink); overflow-wrap: anywhere; padding: 0 8px; }
.bp-pc-cover { position: absolute; left: 50%; top: 0; bottom: 0; width: 50%; transform-origin: 0 50%; transform-style: preserve-3d; cursor: grab; touch-action: none; z-index: 2; }
.bp-pc-front, .bp-pc-back { position: absolute; inset: 0; border-radius: 0 12px 12px 0; backface-visibility: hidden; -webkit-backface-visibility: hidden; }
.bp-pc-front { display: grid; place-content: center; justify-items: center; gap: 0; padding: 10px; text-align: center;
  background: radial-gradient(circle, rgba(255,255,255,.35) 0 2px, transparent 2.6px) 0 0 / 18px 18px, linear-gradient(150deg, color-mix(in srgb, var(--vw-accent) 70%, #FFF), var(--vw-accent-deep));
  box-shadow: inset 6px 0 0 color-mix(in srgb, var(--bp-deep) 30%, transparent), 0 0 0 2px color-mix(in srgb, var(--bp-deep) 30%, transparent); }
.bp-pc-hb { font: 800 clamp(22px, 8cqw, 40px)/1 ${BP_DISPLAY}; color: #FFFFFF; text-shadow: 0 3px 0 var(--bp-deep); }
.bp-pc-hb.is-2 { color: var(--vw-gold); }
.bp-pc-to { margin-top: 6px; font: 400 clamp(14px, 4.2cqw, 19px) ${BP_HAND}; color: #FFFFFF; }
.bp-pc-tab { position: absolute; right: -2px; top: 50%; transform: translate(60%, -50%); min-width: 62px; height: 44px; display: grid; place-items: center; grid-auto-flow: column; gap: 3px; padding: 0 10px 0 8px; border-radius: 0 12px 12px 0; box-sizing: border-box;
  background: var(--vw-gold); color: var(--vw-ink); font: 800 13px ${FONTS.ui}; letter-spacing: .06em; text-transform: uppercase; box-shadow: 0 4px 10px -4px rgba(0,0,0,.3); animation: bp-tug 1.4s ease-in-out infinite; }
@keyframes bp-tug { 0%, 100% { transform: translate(60%, -50%) } 50% { transform: translate(40%, -50%) } }
.bp-pc-back { transform: rotateY(180deg); border-radius: 12px 0 0 12px; background: radial-gradient(circle, color-mix(in srgb, var(--vw-accent) 25%, transparent) 0 2px, transparent 2.6px) 0 0 / 16px 16px, var(--bp-blush); }
.bp-letter { position: relative; width: min(100%, 470px); max-height: 100%; box-sizing: border-box; display: flex; flex-direction: column; padding: 34px 6px 10px 18px; border-radius: 18px;
  background: linear-gradient(180deg, #FFFFFF, var(--vw-paper)); box-shadow: 0 0 0 2px var(--vw-edge), 0 0 0 7px color-mix(in srgb, var(--vw-paper) 60%, transparent), 0 24px 40px -22px color-mix(in srgb, var(--bp-deep) 70%, transparent); }
.bp-letter-pop { position: absolute; left: 50%; top: -30px; transform: translateX(-50%); display: flex; align-items: flex-end; gap: 2px; }
.bp-letter-pop i { display: block; font-style: normal; font-size: 40px; line-height: .9; transform-origin: 50% 100%; filter: drop-shadow(0 3px 0 rgba(0,0,0,.08)); }
.bp-letter-pop i:nth-child(2) { font-size: 54px; }
.bp-letter-scroll { min-height: 0; flex: 1 1 auto; }
.bp-letter-body { text-align: left; padding: 0 4px 6px 0; background: repeating-linear-gradient(180deg, transparent 0 31px, color-mix(in srgb, var(--vw-accent) 16%, transparent) 31px 32px) 0 0 / 100% 32px local; }
.bp-letter-body p { margin: 0 0 32px; font: 400 clamp(20px, 2.8dvh, 23px)/32px ${BP_HAND}; color: var(--vw-ink); overflow-wrap: anywhere; white-space: pre-line; }
.bp-letter-sign { text-align: right; }
.bp-letter-sign b { font: 800 21px ${BP_DISPLAY}; color: var(--vw-accent-deep); }
@media (prefers-reduced-motion: reduce) { .bp-pc-tab { animation: none; } }
`;

// ─── 9 · The question ───────────────────────────────────────────────────────

const MAX_SPINS = 3;

export function Question({ question, yesLabel, hmmLines, recipient, sender, onYes }: { question: string; yesLabel: string; hmmLines: readonly string[]; recipient: string; sender: string; onYes: (spins: number) => void }) {
  const reduced = useReducedMotion();
  const { cue } = useBp();
  const [spins, setSpins] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [landed, setLanded] = useState<string | null>(null);
  const rot = useMotionValue(0);
  const wheelT = useTransform(rot, (v) => `rotate(${v}deg)`);
  const seg = 360 / BP_WHEEL.length;

  const yes = () => {
    cue("chime-cascade", { gain: 0.8 });
    cue("kiss", { gain: 0.6, at: 0.15 });
    onYes(spins);
  };
  const spin = () => {
    if (spinning || spins >= MAX_SPINS) return;
    setSpinning(true);
    setLanded(null);
    haptic(12);
    const k = Math.floor(Math.random() * BP_WHEEL.length);
    const base = Math.ceil(rot.get() / 360) * 360;
    const to = base + 360 * 4 - (k * seg + seg / 2);
    const ticks = window.setInterval(() => cue("tick", { gain: 0.25 }), 110);
    const end = () => {
      window.clearInterval(ticks);
      setSpinning(false);
      setSpins((s) => s + 1);
      setLanded(BP_WHEEL[k]);
      cue("glass-ping", { gain: 0.6 });
      haptic(20);
    };
    if (reduced) {
      rot.set(to);
      end();
    } else animate(rot, to, { duration: 2.6, ease: [0.15, 0.6, 0.2, 1], onComplete: end });
  };

  const hmm = hmmLines[Math.min(spins, hmmLines.length - 1)] ?? "Hmm…";
  const yesScale = 1 + Math.min(spins, 3) * 0.08;

  return (
    <>
      <style>{Q_CSS}</style>
      <div className="bp-marquee" data-bp-marquee>
        <span className="bp-marquee-bulbs" aria-hidden>
          {Array.from({ length: 14 }, (_, k) => (
            <i key={k} style={{ animationDelay: `${-(k % 2) * 0.45}s` }} />
          ))}
        </span>
        <p className="bp-kick">One last page</p>
        <h2 className="bp-title">{question}</h2>
      </div>
      <div className="bp-fill">
        <div className={`bp-wheel-wrap${spins || spinning ? " is-on" : ""}`} aria-hidden={!(spins || spinning)}>
          <span className="bp-wheel-pin" aria-hidden />
          <motion.svg className="bp-wheel" viewBox="-100 -100 200 200" style={{ transform: wheelT }} aria-hidden>
            {BP_WHEEL.map((label, k) => {
              const a0 = ((k * seg - 90) * Math.PI) / 180;
              const a1 = (((k + 1) * seg - 90) * Math.PI) / 180;
              const mid = ((k + 0.5) * seg - 90) * (Math.PI / 180);
              return (
                <g key={k}>
                  <path d={`M0 0 L${Math.cos(a0) * 96} ${Math.sin(a0) * 96} A96 96 0 0 1 ${Math.cos(a1) * 96} ${Math.sin(a1) * 96} Z`} fill={k % 2 ? "var(--vw-paper)" : k % 3 === 0 ? "var(--vw-accent)" : "var(--bp-second)"} stroke="#FFFFFF" strokeWidth="2" />
                  <text x={Math.cos(mid) * 60} y={Math.sin(mid) * 60} transform={`rotate(${(k + 0.5) * seg} ${Math.cos(mid) * 60} ${Math.sin(mid) * 60})`} textAnchor="middle" dominantBaseline="middle" className="bp-wheel-t" fill={k % 2 ? "var(--vw-ink)" : "#FFFFFF"}>
                    {label}
                  </text>
                </g>
              );
            })}
            <circle r="96" fill="none" stroke="var(--vw-gold)" strokeWidth="6" />
            <circle r="14" fill="var(--vw-gold)" stroke="#FFFFFF" strokeWidth="3" />
          </motion.svg>
          <p className="bp-wheel-said" aria-live="polite">
            {landed ? (
              <>
                The wheel has spoken: <b>{landed}</b>
              </>
            ) : spinning ? (
              "spinning…"
            ) : (
              ""
            )}
          </p>
        </div>
        {!(spins || spinning) && (
          <motion.div className="bp-q-idle" aria-hidden initial={reduced ? false : { opacity: 0, y: 20, rotate: -8 }} animate={{ opacity: 1, y: 0, rotate: -4 }} transition={{ type: "spring", stiffness: 160, damping: 14, delay: 0.2 }}>
            <span className="bp-q-tix">
              <i>✦ Admit two ✦</i>
              <b>{recipient}</b>
              <em>+</em>
              <b>{sender}</b>
              <i>tonight · one birthday date</i>
            </span>
          </motion.div>
        )}
      </div>
      <div className="bp-q-row">
        <motion.button type="button" className="bp-q-yes" onClick={yes} animate={{ scale: yesScale }} transition={{ type: "spring", stiffness: 260, damping: 14 }} disabled={spinning} data-bp-yes>
          {yesLabel}
        </motion.button>
        {spins < MAX_SPINS && (
          <button type="button" className="bp-ghost bp-q-hmm" onClick={spin} disabled={spinning} data-bp-hmm>
            {hmm}
          </button>
        )}
      </div>
    </>
  );
}

const Q_CSS = `
.bp-marquee { position: relative; flex: none; width: min(100%, 440px); box-sizing: border-box; padding: 18px 18px 16px; border-radius: 22px; display: grid; gap: 4px; justify-items: center;
  background: var(--vw-paper); box-shadow: 0 0 0 4px var(--vw-accent), 0 0 0 9px var(--vw-gold), 0 22px 36px -20px color-mix(in srgb, var(--bp-deep) 70%, transparent); margin-top: 6px; }
.bp-marquee-bulbs { position: absolute; inset: -7px; display: flex; justify-content: space-between; pointer-events: none; padding: 0 16px; }
.bp-marquee-bulbs i { width: 8px; height: 8px; margin-top: -1px; border-radius: 50%; background: #FFFFFF; box-shadow: 0 0 8px 2px #FFF6C8; animation: bp-bulb .9s steps(2) infinite; }
.bp-wheel-wrap { position: relative; display: grid; justify-items: center; gap: 8px; opacity: 0; transform: scale(.7); transition: opacity .35s ease, transform .5s cubic-bezier(.3,1.5,.5,1); pointer-events: none; }
.bp-wheel-wrap.is-on { opacity: 1; transform: none; }
.bp-wheel { width: min(64cqw, 74cqh, 260px); height: auto; filter: drop-shadow(0 14px 18px color-mix(in srgb, var(--bp-deep) 30%, transparent)); }
.bp-wheel-pin { position: absolute; top: -8px; left: 50%; transform: translateX(-50%); width: 0; height: 0; border-left: 13px solid transparent; border-right: 13px solid transparent; border-top: 24px solid var(--vw-accent-deep); z-index: 2; filter: drop-shadow(0 2px 2px rgba(0,0,0,.2)); }
.bp-wheel-t { font: 800 13px ${BP_DISPLAY}; }
.bp-wheel-said { margin: 0; min-height: 24px; font: 700 clamp(15px, 2.2dvh, 18px) ${FONTS.ui}; color: var(--vw-ink-soft); }
.bp-wheel-said b { color: var(--vw-accent-deep); font-family: ${BP_DISPLAY}; font-size: 1.2em; }
.bp-q-idle { position: absolute; inset: 0; display: grid; place-items: center; }
.bp-q-tix { position: relative; display: grid; justify-items: center; gap: 2px; width: min(76cqw, 300px); padding: 18px 26px; box-sizing: border-box; text-align: center; animation: bp-float-b 2.6s ease-in-out infinite alternate;
  background: radial-gradient(circle at 0 50%, transparent 13px, var(--vw-paper) 13.5px) left / 51% 100% no-repeat, radial-gradient(circle at 100% 50%, transparent 13px, var(--vw-paper) 13.5px) right / 51% 100% no-repeat;
  filter: drop-shadow(0 0 1.5px var(--vw-edge)) drop-shadow(0 16px 18px color-mix(in srgb, var(--bp-deep) 25%, transparent)); }
.bp-q-tix::before { content: ""; position: absolute; inset: 8px 22px; border: 2px dashed color-mix(in srgb, var(--vw-accent) 45%, transparent); border-radius: 10px; }
.bp-q-tix i { font: 700 10.5px ${FONTS.ui}; letter-spacing: .16em; text-transform: uppercase; font-style: normal; color: var(--vw-accent-deep); }
.bp-q-tix b { font: 800 clamp(22px, 8cqw, 30px)/1.05 ${BP_DISPLAY}; color: var(--vw-ink); overflow-wrap: anywhere; max-width: 100%; }
.bp-q-tix em { font: 400 22px/1 ${BP_HAND}; color: var(--vw-accent); font-style: normal; }
.bp-q-row { flex: none; display: flex; flex-wrap: wrap; gap: 12px; justify-content: center; align-items: center; min-height: 64px; }
.bp-q-yes { min-width: 160px; min-height: 58px; padding: 0 26px; border-radius: 999px; border: 0; cursor: pointer; touch-action: manipulation; color: #FFFFFF; font: 800 20px ${BP_DISPLAY};
  background: linear-gradient(180deg, color-mix(in srgb, var(--vw-accent) 70%, #FFFFFF), var(--vw-accent) 55%, var(--vw-accent-deep)); box-shadow: 0 5px 0 var(--bp-deep), 0 0 0 4px color-mix(in srgb, var(--vw-paper) 70%, transparent), 0 16px 30px -12px color-mix(in srgb, var(--bp-deep) 70%, transparent); }
.bp-q-yes:focus-visible { outline: 3px solid var(--vw-ink); outline-offset: 5px; }
.bp-q-hmm { min-height: 48px; }
.bp-q-hmm:disabled { opacity: .5; }
@media (prefers-reduced-motion: reduce) { .bp-marquee-bulbs i, .bp-q-tix { animation: none; } .bp-wheel-wrap { transition: none; } }
`;

// ─── 9b · The yes (and "when?") ─────────────────────────────────────────────

export function YesRoom({ recipient, yesLine, spins, sticker, askWhen, plan, onPlan, onNext }: { recipient: string; yesLine: string; spins: number; sticker: ReactNode; askWhen: boolean; plan: number | null; onPlan: (k: number) => void; onNext: () => void }) {
  const { cue } = useBp();
  const pick = (k: number) => {
    if (plan !== null) return;
    haptic(18);
    cue("chime", { gain: 0.55 });
    cue("sparkle", { gain: 0.4, at: 0.1 });
    onPlan(k);
  };
  useNext(!askWhen || plan !== null ? "Your passport" : null, onNext, "passport");
  return (
    <div className="bp-fill" style={{ alignContent: "center" }}>
      <div className="bp-yes" data-bp-yes-room>
        <div className="bp-yes-gif">{sticker}</div>
        <h2 className="bp-title" style={{ fontSize: "clamp(30px, min(9.2vw, 5dvh), 48px)" }}>
          It&apos;s a date, {recipient}!! 🥳
        </h2>
        <p className="bp-yes-line">{yesLine || "Best birthday gift? You saying yes. Wear something cute 💗"}</p>
        {spins > 0 && <p className="bp-yes-spin">…after spinning the wheel {spins} {spins === 1 ? "time" : "times"} 🎡</p>}
        {askWhen && (
          <div className="bp-plan" role="group" aria-label="When should we go?">
            <p className="bp-plan-q">{plan === null ? "So… when? 🗓️" : "Locked in 💗"}</p>
            <div className="bp-plan-row">
              {BP_PLANS.map((p, k) => (
                <button key={p.label} type="button" className={`bp-plan-b${plan === k ? " is-on" : ""}${plan !== null && plan !== k ? " is-off" : ""}`} onClick={() => pick(k)} disabled={plan !== null} aria-pressed={plan === k} data-bp-plan={k}>
                  <span aria-hidden>{p.emoji}</span> {p.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      <style>{YES_CSS}</style>
    </div>
  );
}

const YES_CSS = `
.bp-yes { display: grid; gap: clamp(6px, 1.4dvh, 12px); justify-items: center; width: 100%; max-width: 430px; }
.bp-yes-gif .bp-stk img { width: clamp(96px, 18dvh, 150px) !important; height: auto !important; }
.bp-yes-line { margin: 0 auto; max-width: 360px; font: 400 clamp(22px, 3.1dvh, 26px)/1.22 ${BP_HAND}; color: var(--vw-ink); overflow-wrap: anywhere; }
.bp-yes-spin { margin: 0; font: 700 clamp(14px, 2.1dvh, 17px) ${BP_DISPLAY}; color: var(--vw-accent-deep); }
.bp-plan { width: 100%; display: grid; gap: 8px; justify-items: center; margin-top: 4px; }
.bp-plan-q { margin: 0; font: 800 clamp(17px, 2.5dvh, 20px) ${BP_DISPLAY}; color: var(--vw-ink); }
.bp-plan-row { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; }
.bp-plan-b { min-height: 46px; padding: 0 16px; border-radius: 12px; border: 2px dashed var(--vw-edge); background: var(--vw-paper); color: var(--vw-ink); font: 700 15px ${FONTS.ui}; cursor: pointer; touch-action: manipulation;
  box-shadow: 0 6px 14px -10px color-mix(in srgb, var(--bp-deep) 60%, transparent); transition: transform .2s ease, opacity .3s ease, background .2s ease; }
.bp-plan-b:not(:disabled):hover { transform: translateY(-2px) rotate(-1deg); }
.bp-plan-b.is-on { background: var(--vw-accent); border: 2px solid var(--vw-accent-deep); color: #FFFFFF; transform: scale(1.06); }
.bp-plan-b.is-off { opacity: .45; }
.bp-plan-b:disabled { cursor: default; }
.bp-plan-b:focus-visible { outline: 3px solid var(--vw-ink); outline-offset: 3px; }
`;

// ─── 10 · The birthday passport ─────────────────────────────────────────────

export interface PassportStamp {
  label: string;
  sub: string;
}

export function Passport({
  day,
  data,
  mode,
  palette,
  recipient,
  sender,
  petName,
  age,
  days,
  photo,
  stamps,
  plan,
  replyText,
  onReplay,
}: {
  day: DayConfig;
  data: ValentineDayData;
  mode: "preview" | "live";
  palette: BpPaletteDef;
  recipient: string;
  sender: string;
  petName: string;
  age: string;
  days: number | null;
  photo: LovePhoto | null;
  stamps: readonly PassportStamp[];
  plan: string | null;
  replyText: string;
  onReplay: () => void;
}) {
  const reduced = useReducedMotion();
  const { cue, go } = useBp();
  const t = palette.theme;
  const [inked, setInked] = useState(reduced ? stamps.length : 0);
  const [approved, setApproved] = useState(false);
  const [sheet, setSheet] = useState<"page" | "share">("page");
  const today = useMemo(() => new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }), []);
  const year = new Date().getFullYear();
  const mrz = `P<BDAY<<${recipient.toUpperCase().replace(/[^A-Z]/g, "<").slice(0, 16)}<<${(sender.toUpperCase().replace(/[^A-Z]/g, "") || "LOVE").slice(0, 10)}`.padEnd(40, "<").slice(0, 40);

  // The chapter stamps thud on, one after another.
  useEffect(() => {
    if (inked >= stamps.length) return;
    const tm = window.setTimeout(
      () => {
        setInked((n) => n + 1);
        cue("snap", { gain: 0.45, detune: inked * 60 });
        haptic(8);
      },
      inked === 0 ? 700 : 320,
    );
    return () => window.clearTimeout(tm);
  }, [inked, stamps.length, cue]);

  const approve = () => {
    if (approved) return;
    setApproved(true);
    haptic(40);
    cue("snap", { gain: 0.9 });
    cue("chime-cascade", { gain: 0.7, at: 0.2 });
    burst({ kind: "confetti", colors: t.confetti, origin: { x: 0.5, y: 0.35 }, count: 140, spread: 0.7 });
    if (!reduced) window.setTimeout(() => burst({ kind: "hearts", emojis: [...palette.floats], origin: { x: 0.5, y: 0.15 }, count: 24, spread: 0.6 }), 600);
  };

  const makeOwn = () => {
    haptic(12);
    const link = typeof window !== "undefined" ? `${window.location.origin}/birthday-premium` : "https://subhsandesh.in/birthday-premium";
    const text = `Someone made me a whole birthday storybook 🥹📖\nMake one for your own person:\n${link}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  };

  const keepsake = (): KeepsakeLayout => {
    const W = 1080;
    const items: KeepsakeItem[] = [
      { type: "text", text: "✦ BIRTHDAY PASSPORT ✦", x: W / 2, y: 180, size: 46, weight: 700, color: t.accentDeep, face: "ui" },
      { type: "rect", x: 80, y: 250, w: 920, h: 1450, radius: 56, fill: t.paper },
      { type: "rect", x: 80, y: 250, w: 920, h: 150, radius: 56, fill: t.accent },
      { type: "text", text: `REPUBLIC OF ${sender.toUpperCase()}'S HEART`, x: W / 2, y: 335, size: 38, weight: 700, color: "#FFFFFF", face: "ui", maxWidth: 860, maxLines: 1 },
    ];
    if (photo) items.push({ type: "image", src: photo.url, x: 130, y: 450, w: 340, h: 420, cropX: photo.cropX, cropY: photo.cropY, rotate: -2, frame: { pad: 14, bottom: 14, color: "#FFFFFF" } });
    else items.push({ type: "rect", x: 130, y: 450, w: 340, h: 420, radius: 24, fill: palette.blush }, { type: "emoji", char: "🎂", x: 300, y: 660, size: 170 });
    const fx = 530;
    const fields: [string, string][] = [
      ["NAME", recipient],
      ["KNOWN AS", petName || "the birthday star"],
      ["LEVEL", age ? `${age} ✦ level up` : "another year cuter"],
      ["ISSUED", today],
    ];
    if (days) fields.push(["DAYS OF US", days.toLocaleString("en-IN")]);
    fields.forEach(([k, v], i) => {
      items.push({ type: "text", text: k, x: fx, y: 480 + i * 82, size: 24, weight: 700, color: t.inkSoft, face: "ui", align: "left" });
      items.push({ type: "text", text: v, x: fx, y: 518 + i * 82, size: 38, weight: 700, color: t.ink, face: "ui", align: "left", maxWidth: 430, maxLines: 1 });
    });
    stamps.forEach((s, i) => {
      const col = i % 3;
      const row = Math.floor(i / 3);
      const x = 230 + col * 310;
      const y = 1010 + row * 150;
      items.push({ type: "rect", x: x - 130, y: y - 55, w: 260, h: 110, radius: 22, stroke: palette.pops[i % palette.pops.length], lineWidth: 6 });
      items.push({ type: "text", text: s.label, x, y: y - 8, size: 34, weight: 700, color: palette.pops[i % palette.pops.length], face: "ui", maxWidth: 240, maxLines: 1 });
      items.push({ type: "text", text: s.sub, x, y: y + 30, size: 22, weight: 600, color: t.inkSoft, face: "ui", maxWidth: 240, maxLines: 1 });
    });
    let y = 1010 + Math.ceil(stamps.length / 3) * 150 + 20;
    if (plan) {
      items.push({ type: "text", text: `Birthday date: ${plan}`, x: W / 2, y, size: 38, weight: 700, color: t.accentDeep, face: "ui", maxWidth: 860, maxLines: 1 });
      y += 70;
    }
    items.push({ type: "text", text: "APPROVED · ANOTHER YEAR OF US", x: W / 2, y: Math.max(y + 10, 1560), size: 46, weight: 700, color: t.accent, face: "ui", maxWidth: 880, maxLines: 1 });
    items.push({ type: "text", text: mrz, x: W / 2, y: 1650, size: 26, weight: 600, color: t.inkSoft, face: "ui", maxWidth: 880, maxLines: 1 });
    if (data.endLine) items.push({ type: "text", text: data.endLine, x: W / 2, y: 1780, size: 42, face: "serif", italic: true, color: t.ink, maxWidth: 940, maxLines: 2 });
    items.push({ type: "text", text: "Made on subhsandesh.in 📖", x: W / 2, y: 1870, size: 30, color: t.inkSoft, face: "ui" });
    return { background: { stops: [[0, t.paper], [0.5, t.base], [1, palette.blush]] }, items };
  };

  useNext(sheet === "page" ? (approved ? "Keep it" : null) : "Make one ✨", sheet === "page" ? () => setSheet("share") : makeOwn, sheet === "page" ? "sparkle" : "book", sheet === "page");

  if (sheet === "share")
    return (
      <>
        <style>{PASS_CSS}</style>
        <Head kicker="Happy birthday!" title={<>The end… of chapter {age || "one"} 📖</>} sub={`Save your passport, then tell ${sender}.`} />
        <div className="bp-fill">
          <motion.div className="bp-pass-mini" initial={reduced ? false : { opacity: 0, scale: 0.8, rotate: -8 }} animate={{ opacity: 1, scale: 1, rotate: -4 }} transition={{ type: "spring", stiffness: 180, damping: 15 }}>
            <span className="bp-pass-mini-k">✦ Birthday passport ✦</span>
            <b>{recipient}</b>
            <span className="bp-pass-mini-s">APPROVED 💮</span>
          </motion.div>
        </div>
        <div style={{ flex: "none", width: "100%", maxWidth: 420 }}>
          <EndingActions day={day} data={data} mode={mode} onReplay={() => go(onReplay)} keepsake={keepsake} replyText={replyText} replyLabel={`💬 Reply to ${sender}`} />
        </div>
      </>
    );

  return (
    <>
      <style>{PASS_CSS}</style>
      <Head kicker="Your keepsake" title="Your birthday passport" sub={approved ? "Approved for another year of us 💮" : "One last stamp — and it's official"} />
      <div className="bp-fill">
        <motion.div className="bp-pass" initial={reduced ? false : { opacity: 0, y: 40, rotate: 3 }} animate={{ opacity: 1, y: 0, rotate: 0 }} transition={{ type: "spring", stiffness: 150, damping: 17 }} data-bp-passport>
          <div className="bp-pass-band">
            <span>Republic of {sender}&apos;s heart</span>
            <b>{year}</b>
          </div>
          <div className="bp-pass-id">
            <div className="bp-pass-photo">{photo ? <CroppedPhoto photo={photo} eager /> : <span>🎂</span>}</div>
            <dl className="bp-pass-f">
              <dt>Name</dt>
              <dd>{recipient}</dd>
              <dt>Known as</dt>
              <dd>{petName || "the birthday star"}</dd>
              <dt>Level</dt>
              <dd>{age ? `${age} ✦ level up` : "another year cuter"}</dd>
              {days ? (
                <>
                  <dt>Days of us</dt>
                  <dd>{days.toLocaleString("en-IN")}</dd>
                </>
              ) : (
                <>
                  <dt>Issued</dt>
                  <dd>{today}</dd>
                </>
              )}
            </dl>
          </div>
          <ul className="bp-stamps" aria-label="Chapter stamps">
            {stamps.map((s, k) => (
              <li key={s.label} className={k < inked ? "is-in" : undefined} style={{ ["--c" as string]: palette.pops[k % palette.pops.length], ["--r" as string]: `${((k * 37) % 22) - 11}deg` }}>
                <b>{s.label}</b>
                <span>{s.sub}</span>
              </li>
            ))}
          </ul>
          {plan && <p className="bp-pass-plan">🗓️ Birthday date: {plan}</p>}
          {data.endLine && <p className="bp-pass-end">{data.endLine}</p>}
          <p className="bp-pass-mrz" aria-hidden>
            {mrz}
          </p>
          <AnimatePresence>
            {approved && (
              <motion.span className="bp-pass-ok" initial={reduced ? false : { scale: 3, opacity: 0, rotate: -30 }} animate={{ scale: 1, opacity: 1, rotate: -14 }} transition={{ type: "spring", stiffness: 400, damping: 18 }} aria-hidden>
                APPROVED
                <i>another year of us</i>
              </motion.span>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
      {!approved && (
        <button type="button" className="bp-stamp-btn" onClick={approve} disabled={inked < stamps.length} data-bp-approve>
          <span aria-hidden>💮</span> Stamp it: approved!
        </button>
      )}
    </>
  );
}

const PASS_CSS = `
.bp-pass { position: relative; width: min(94cqw, 380px); max-height: 100%; box-sizing: border-box; overflow: hidden; display: flex; flex-direction: column; gap: 8px; padding: 0 0 10px; border-radius: 20px;
  background: radial-gradient(circle at 80% 30%, color-mix(in srgb, var(--vw-gold) 18%, transparent), transparent 40%), repeating-linear-gradient(135deg, transparent 0 14px, color-mix(in srgb, var(--vw-accent) 5%, transparent) 14px 15px), var(--vw-paper);
  box-shadow: 0 0 0 2px var(--vw-edge), 0 0 0 7px color-mix(in srgb, var(--vw-paper) 60%, transparent), 0 26px 44px -22px color-mix(in srgb, var(--bp-deep) 70%, transparent); }
.bp-pass-band { display: flex; justify-content: space-between; align-items: center; gap: 8px; padding: 9px 14px; background: var(--vw-accent); color: #FFFFFF; }
.bp-pass-band span { font: 700 11px ${FONTS.ui}; letter-spacing: .14em; text-transform: uppercase; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.bp-pass-band b { font: 800 15px ${BP_DISPLAY}; }
.bp-pass-id { display: grid; grid-template-columns: clamp(78px, 26cqw, 110px) 1fr; gap: 12px; padding: 0 14px; align-items: start; }
.bp-pass-photo { aspect-ratio: 4 / 5; border-radius: 10px; overflow: hidden; background: var(--bp-blush); display: grid; place-items: center; font-size: 40px; box-shadow: 0 0 0 3px #FFFFFF, 0 0 0 4.5px var(--vw-edge); transform: rotate(-2deg); }
.bp-pass-photo > * { width: 100%; height: 100%; }
.bp-pass-f { margin: 0; display: grid; grid-template-columns: auto 1fr; gap: 1px 10px; text-align: left; align-items: baseline; min-width: 0; }
.bp-pass-f dt { font: 700 9.5px ${FONTS.ui}; letter-spacing: .12em; text-transform: uppercase; color: var(--vw-ink-soft); }
.bp-pass-f dd { margin: 0; font: 800 clamp(14px, 2.1dvh, 17px)/1.25 ${BP_DISPLAY}; color: var(--vw-ink); overflow-wrap: anywhere; min-width: 0; }
.bp-stamps { list-style: none; margin: 0; padding: 4px 12px; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 6px; }
.bp-stamps li { display: grid; justify-items: center; padding: 4px 4px 5px; border: 2.5px solid var(--c); border-radius: 12px; color: var(--c); transform: rotate(var(--r)) scale(2.2); opacity: 0; transition: transform .28s cubic-bezier(.3,1.6,.5,1), opacity .15s ease; background: color-mix(in srgb, var(--vw-paper) 85%, transparent); }
.bp-stamps li:nth-child(even) { border-radius: 50px; }
.bp-stamps li.is-in { transform: rotate(var(--r)) scale(1); opacity: 1; }
.bp-stamps b { font: 800 clamp(12px, 1.8dvh, 14px)/1.1 ${BP_DISPLAY}; letter-spacing: .06em; filter: saturate(1.3) brightness(.8); }
.bp-stamps span { font: 700 9.5px/1.2 ${FONTS.ui}; color: var(--vw-ink-soft); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; }
.bp-pass-plan { margin: 0 14px; padding: 5px 10px; border-radius: 10px; background: color-mix(in srgb, var(--vw-accent) 12%, var(--vw-paper)); font: 700 13px ${FONTS.ui}; color: var(--vw-ink); }
.bp-pass-end { margin: 0 14px; font: 400 clamp(18px, 2.6dvh, 21px)/1.2 ${BP_HAND}; color: var(--vw-ink); overflow-wrap: anywhere; }
.bp-pass-mrz { margin: 0 14px; font: 600 10px/1.2 'Courier New', monospace; letter-spacing: .06em; color: var(--vw-ink-soft); white-space: nowrap; overflow: hidden; }
.bp-pass-ok { position: absolute; left: 50%; top: 46%; translate: -50% -50%; padding: 8px 18px 6px; border: 5px double var(--vw-accent-deep); border-radius: 16px; display: grid; justify-items: center; pointer-events: none;
  font: 800 clamp(28px, 10cqw, 40px)/1 ${BP_DISPLAY}; letter-spacing: .1em; color: var(--vw-accent-deep); background: color-mix(in srgb, var(--vw-paper) 55%, transparent); mix-blend-mode: multiply; }
.bp-pass-ok i { font: 700 11px ${FONTS.ui}; letter-spacing: .18em; text-transform: uppercase; font-style: normal; margin-top: 3px; }
.bp-stamp-btn { flex: none; min-height: 52px; padding: 0 22px; display: inline-flex; gap: 8px; align-items: center; border-radius: 16px; border: 3px solid var(--vw-accent-deep); background: var(--vw-paper); color: var(--vw-accent-deep);
  font: 800 18px ${BP_DISPLAY}; cursor: pointer; touch-action: manipulation; box-shadow: 0 5px 0 var(--vw-accent-deep); animation: bp-pulse 1s ease-in-out infinite alternate; }
.bp-stamp-btn:disabled { opacity: .5; animation: none; cursor: default; }
.bp-stamp-btn:active:not(:disabled) { transform: translateY(4px); box-shadow: 0 1px 0 var(--vw-accent-deep); }
.bp-stamp-btn:focus-visible { outline: 3px solid var(--vw-ink); outline-offset: 3px; }
.bp-pass-mini { width: min(62cqw, 70cqh, 250px); aspect-ratio: 3 / 4; border-radius: 18px; display: grid; place-content: center; justify-items: center; gap: 8px; padding: 14px; box-sizing: border-box; text-align: center;
  background: radial-gradient(circle, rgba(255,255,255,.3) 0 2px, transparent 2.6px) 0 0 / 18px 18px, linear-gradient(150deg, color-mix(in srgb, var(--vw-accent) 70%, #FFF), var(--vw-accent-deep)); color: #FFFFFF;
  box-shadow: inset 10px 0 0 color-mix(in srgb, var(--bp-deep) 30%, transparent), 0 0 0 3px var(--vw-gold), 0 26px 40px -22px color-mix(in srgb, var(--bp-deep) 70%, transparent); }
.bp-pass-mini-k { font: 700 11px ${FONTS.ui}; letter-spacing: .16em; text-transform: uppercase; color: var(--vw-gold); }
.bp-pass-mini b { font: 800 clamp(26px, 9cqw, 36px)/1.05 ${BP_DISPLAY}; overflow-wrap: anywhere; }
.bp-pass-mini-s { padding: 4px 10px; border: 2.5px solid #FFFFFF; border-radius: 10px; transform: rotate(-8deg); font: 800 14px ${FONTS.ui}; letter-spacing: .1em; }
@media (prefers-reduced-motion: reduce) { .bp-stamps li { transition: none; } .bp-stamp-btn { animation: none; } }
`;
