"use client";

// Scene 8 — the big question. "Will you be my Dandiya partner?" while the
// couple twirls above it. How No behaves is the SENDER's choice (the form's
// "How can they answer?", extras.answerMode):
//
//   • "yesOnly" (default, every older page): reach for No and it spins away
//     (a twirl + fade), lands somewhere else with a new excuse while YES grows;
//     after five tries it gives up and turns into a second YES.
//   • "noAfterTries": No dodges `tries` times (4 or 5) with lines that get more
//     and more pleading, then it stops running and can be pressed. Pressing it
//     asks "Are you sure? 🥺" — "Wait, take me back" (the big button) closes
//     it; "Yes, I'm sure" records a gentle no (onNo).
//
// Keyboard: Enter on No dodges too.

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { haptic, useReducedMotion } from "../../../_valentine/kit";
import type { AnswerRule } from "../../../_valentine/kit/answer";
import { FONTS } from "../../../_valentine/theme";
import { DD_DISPLAY } from "./fonts";
import { DD_GIF, useDd } from "./stage";
import { DD, RoomTitle } from "./ui";

const SURRENDER_AT = 5;

/** The lines No says while it is still running, in "noAfterTries" (they get more pleading). */
const PLEADING = ["are you sure? 🥺", "think of the dhol…", "my sticks are sad 🥢", "one more twirl?", "last chance! 🙏"];

export default function Question({
  question,
  yesLabel,
  noLines,
  rule,
  onYes,
  onNo,
}: {
  question: string;
  yesLabel: string;
  noLines: readonly string[];
  rule: AnswerRule;
  onYes: (dodges: number) => void;
  onNo: (dodges: number) => void;
}) {
  const reduced = useReducedMotion();
  const { cue } = useDd();
  const arenaRef = useRef<HTMLDivElement | null>(null);
  const yesRef = useRef<HTMLButtonElement | null>(null);
  const noRef = useRef<HTMLButtonElement | null>(null);
  const dodgesRef = useRef(0);
  const busy = useRef(false);
  const lastDodge = useRef(0);
  const [dodges, setDodges] = useState(0);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [asking, setAsking] = useState(false);
  const canSayNo = rule.mode === "noAfterTries";
  const limit = canSayNo ? rule.tries : SURRENDER_AT;
  // yesOnly: No has turned into a second YES · noAfterTries: No has stopped running and can be pressed.
  const tired = dodges >= limit;
  const surrendered = tired && !canSayNo;
  const unlocked = tired && canSayNo;

  const yes = () => {
    cue("chime", { gain: 0.8 });
    cue("dd-dhol", { gain: 1 });
    cue("dd-bells", { gain: 0.8, at: 0.1 });
    onYes(dodgesRef.current);
  };

  const dodge = useCallback(() => {
    if (busy.current || dodgesRef.current >= limit) return;
    busy.current = true;
    lastDodge.current = performance.now();
    dodgesRef.current += 1;
    haptic(12);
    cue("dd-tak", { gain: 0.7, detune: -200 });
    cue("swoosh-soft", { gain: 0.5 });
    setSpinning(true);
    window.setTimeout(
      () => {
        const arena = arenaRef.current?.getBoundingClientRect();
        const no = noRef.current?.getBoundingClientRect();
        const y = yesRef.current?.getBoundingClientRect();
        if (arena && no) {
          const pad = 8;
          const maxX = Math.max(pad, arena.width - no.width - pad);
          const maxY = Math.max(pad, arena.height - no.height - pad);
          let pick = { x: pad, y: pad };
          for (let i = 0; i < 16; i++) {
            const x = pad + Math.random() * (maxX - pad);
            const yy = pad + Math.random() * (maxY - pad);
            pick = { x, y: yy };
            if (!y) break;
            const yx = y.left - arena.left;
            const yt = y.top - arena.top;
            const clear = x > yx + y.width + 14 || x + no.width + 14 < yx || yy > yt + y.height + 14 || yy + no.height + 14 < yt;
            if (clear) break;
          }
          setPos(pick);
        }
        setDodges(dodgesRef.current);
        setSpinning(false);
        busy.current = false;
      },
      reduced ? 0 : 300,
    );
  }, [reduced, cue, limit]);

  // A longer line can push the button past the edge — re-clamp once it has laid out, and never land on YES.
  useLayoutEffect(() => {
    const arena = arenaRef.current;
    const no = noRef.current;
    if (!pos || !arena || !no) return;
    const pad = 8;
    const x = Math.min(pos.x, Math.max(pad, arena.clientWidth - no.offsetWidth - pad));
    let y = Math.min(pos.y, Math.max(pad, arena.clientHeight - no.offsetHeight - pad));
    const yr = yesRef.current?.getBoundingClientRect();
    const a = arena.getBoundingClientRect();
    if (yr) {
      const yt = yr.top - a.top;
      const yb = yr.bottom - a.top;
      const yl = yr.left - a.left;
      const yrr = yr.right - a.left;
      const hits = x < yrr + 10 && x + no.offsetWidth + 10 > yl && y < yb + 10 && y + no.offsetHeight + 10 > yt;
      if (hits) y = yb + 12 + no.offsetHeight <= arena.clientHeight - pad ? yb + 12 : Math.max(pad, yt - 12 - no.offsetHeight);
    }
    if (x !== pos.x || y !== pos.y) setPos({ x, y });
  }, [pos, dodges]);

  // Mouse proximity on desktop: No twirls off before the cursor arrives (while it still runs).
  useEffect(() => {
    const arena = arenaRef.current;
    if (!arena || tired) return;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const r = noRef.current?.getBoundingClientRect();
      if (!r) return;
      const dx = Math.max(r.left - e.clientX, 0, e.clientX - r.right);
      const dy = Math.max(r.top - e.clientY, 0, e.clientY - r.bottom);
      if (Math.hypot(dx, dy) < 56) dodge();
    };
    arena.addEventListener("pointermove", onMove);
    return () => arena.removeEventListener("pointermove", onMove);
  }, [dodge, tired]);

  const lines = canSayNo ? PLEADING : noLines.length ? noLines : ["oops, my sticks slipped"];
  const noLabel = surrendered ? "Okay fine… YES 💛" : unlocked ? "No 😔" : dodges === 0 ? "No" : lines[(dodges - 1) % lines.length];
  const yesScale = Math.min(1.3, Math.pow(1.06, dodges));

  const pressNo = () => {
    // The click that follows the last dodge's pointerdown is not a choice.
    if (performance.now() - lastDodge.current < 450) return;
    if (surrendered) return yes();
    if (unlocked) {
      haptic(8);
      cue("swoosh-soft", { gain: 0.4 });
      setAsking(true);
    }
  };

  return (
    <>
      <style>{Q_CSS}</style>
      <RoomTitle kicker="Nine nights · one question" title={<span style={{ font: "inherit" }}>{question}</span>} />
      <div className="dd-q-couple" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={DD_GIF.couple} alt="" width={500} height={500} decoding="async" />
      </div>

      <div ref={arenaRef} className="dd-q-arena" data-dd-answer-mode={rule.mode}>
        <motion.button
          ref={yesRef}
          type="button"
          onClick={yes}
          className="dd-q-yes"
          data-dd-yes
          animate={{ scale: yesScale }}
          transition={{ type: "spring", stiffness: 260, damping: 14 }}
        >
          {yesLabel}
        </motion.button>
        <button
          ref={noRef}
          type="button"
          className={`dd-q-no${surrendered ? " is-yes" : ""}${unlocked ? " is-free" : ""}${spinning ? " is-spin" : ""}`}
          data-dd-no={unlocked ? "free" : surrendered ? "yes" : "running"}
          aria-label={surrendered ? "Okay fine, yes" : unlocked ? "No" : `No — ${noLabel}`}
          onPointerDown={(e) => {
            if (tired) return;
            e.preventDefault();
            dodge();
          }}
          onKeyDown={(e) => {
            if (!tired && (e.key === "Enter" || e.key === " ")) {
              e.preventDefault();
              dodge();
            }
          }}
          onClick={pressNo}
          style={{ left: pos ? pos.x : "74%", top: pos ? pos.y : "50%", transform: pos ? undefined : "translate(-50%, -50%)" }}
        >
          {dodges > 0 && !tired ? "💫 " : ""}
          {noLabel}
        </button>
        <span className="vw-sr" aria-live="polite">
          {dodges > 0 && !tired ? `The No button twirled away. ${noLabel}` : unlocked ? "The No button stopped running. You can press it now." : ""}
        </span>
      </div>
      <div style={{ flex: "none", minHeight: 28 }}>
        {dodges > 0 && !tired && (
          <p style={{ margin: 0, font: `400 clamp(16px, 2.4dvh, 19px) ${DD_DISPLAY}`, color: "#9FE3FF" }}>
            No twirled away ×{dodges}
            {canSayNo ? ` · ${limit - dodges} more ${limit - dodges === 1 ? "try" : "tries"}` : ""}
          </p>
        )}
        {unlocked && <p style={{ margin: 0, font: `500 clamp(13px, 2dvh, 15px) ${FONTS.ui}`, color: DD.mist }}>It stopped running. It&apos;s really your choice 💛</p>}
      </div>

      <AnimatePresence>
        {asking && (
          <motion.div
            className="dd-q-sure"
            role="dialog"
            aria-modal="true"
            aria-labelledby="dd-q-sure-t"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.22 }}
          >
            <motion.div
              className="dd-q-sure-card"
              initial={reduced ? false : { y: 24, scale: 0.94 }}
              animate={{ y: 0, scale: 1 }}
              exit={reduced ? undefined : { y: 16, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 320, damping: 24 }}
            >
              <p className="dd-q-sure-e" aria-hidden>
                🥺
              </p>
              <h3 id="dd-q-sure-t">Are you sure?</h3>
              <p className="dd-q-sure-s">The No button worked so hard to run away… but it&apos;s okay either way.</p>
              <button type="button" className="dd-q-sure-back" autoFocus onClick={() => setAsking(false)}>
                Wait, take me back 💛
              </button>
              <button
                type="button"
                className="dd-q-sure-no"
                data-dd-confirm-no
                onClick={() => {
                  setAsking(false);
                  onNo(dodgesRef.current);
                }}
              >
                Yes, I&apos;m sure
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

const Q_CSS = `
.dd-q-couple { flex: none; width: clamp(110px, 21dvh, calc(190px * var(--vw-s, 1))); aspect-ratio: 1; display: grid; place-items: center; }
.dd-q-couple img { width: 100%; height: 100%; object-fit: contain; animation: dd-q-sway 1.4s ease-in-out infinite alternate; transform-origin: 50% 90%; filter: drop-shadow(0 10px 18px rgba(30,0,2,.5)); }
@keyframes dd-q-sway { from { transform: rotate(-4deg) } to { transform: rotate(4deg) translateY(-4px) } }
.dd-q-arena { position: relative; flex: 1 1 0; min-height: 150px; width: 100%; max-width: calc(420px * var(--vw-s, 1)); max-height: 300px; }
.dd-q-yes { position: absolute; left: 26%; top: 50%; margin-left: -72px; margin-top: -29px; min-width: 144px; min-height: 58px; padding: 14px 22px; border-radius: 999px; border: 0;
  background: linear-gradient(180deg, #FFE08A, #FFB627 50%, #F08A0C); color: #3A1404; font: 700 18px ${FONTS.ui}; white-space: nowrap; cursor: pointer; z-index: 2;
  box-shadow: 0 5px 0 #A8580A, 0 0 30px -4px rgba(255,182,39,.7); touch-action: manipulation; }
.dd-q-yes:focus-visible { outline: 3px solid #7FD8F2; outline-offset: 4px; }
.dd-q-no { position: absolute; min-height: 48px; min-width: 88px; max-width: calc(100% - 16px); padding: 12px 20px; border-radius: 999px;
  border: 1.5px dashed rgba(255,247,232,.6); background: rgba(255,247,232,.14); color: ${DD.ink}; font: 700 16px ${FONTS.ui};
  backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; cursor: pointer; z-index: 3; touch-action: manipulation;
  transition: opacity .3s ease, rotate .3s ease, scale .3s ease; }
.dd-q-no.is-spin { opacity: 0; rotate: 300deg; scale: .5; }
.dd-q-no.is-yes { border: 0; background: linear-gradient(180deg, #FFE08A, #FFB627 50%, #F08A0C); color: #3A1404; box-shadow: 0 5px 0 #A8580A; }
.dd-q-no.is-free { border-style: solid; border-color: rgba(255,247,232,.45); background: rgba(40,2,4,.35); font-weight: 600; }
.dd-q-no:focus-visible { outline: 3px solid #7FD8F2; outline-offset: 4px; }
.dd-q-sure { position: fixed; inset: 0; z-index: 90; display: grid; place-items: center; padding: 20px; background: rgba(30,2,4,.62); backdrop-filter: blur(3px); -webkit-backdrop-filter: blur(3px); }
.dd-q-sure-card { width: min(340px, 100%); box-sizing: border-box; padding: 22px 20px 18px; border-radius: 24px; text-align: center; display: grid; gap: 10px; justify-items: center;
  background: linear-gradient(180deg, #FFF9EC, #FFEBC2); color: ${DD.maroon}; box-shadow: 0 0 0 3px #F6D27A inset, 0 0 0 6px #FFF4DE inset, 0 0 0 7px #B8862E inset, 0 30px 60px -20px rgba(20,0,2,.8); }
.dd-q-sure-e { margin: 0; font-size: 44px; line-height: 1; }
.dd-q-sure-card h3 { margin: 0; font: 400 clamp(28px, 7vw, 34px)/1.1 ${DD_DISPLAY}; color: ${DD.kumkumDeep}; }
.dd-q-sure-s { margin: 0 0 6px; font: 500 15px/1.45 ${FONTS.ui}; color: #6B3A2A; }
.dd-q-sure-back { width: 100%; min-height: 52px; border: 0; border-radius: 999px; cursor: pointer; font: 700 17px ${FONTS.ui}; color: #3A1404;
  background: linear-gradient(180deg, #FFE08A, #FFB627 50%, #F08A0C); box-shadow: 0 4px 0 #A8580A; }
.dd-q-sure-no { min-height: 44px; padding: 0 18px; border: 0; background: none; cursor: pointer; font: 600 15px ${FONTS.ui}; color: #8A5A3A; text-decoration: underline; text-underline-offset: 3px; }
.dd-q-sure-back:focus-visible, .dd-q-sure-no:focus-visible { outline: 3px solid ${DD.kumkum}; outline-offset: 3px; }
@media (prefers-reduced-motion: reduce) { .dd-q-couple img { animation: none; } .dd-q-no { transition: none; } }
`;
