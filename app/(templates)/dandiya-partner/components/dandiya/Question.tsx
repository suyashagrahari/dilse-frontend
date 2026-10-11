"use client";

// Scene 8 — the big question. "Will you be my Dandiya partner?" while the
// couple twirls above it. The No button "drops its sticks": reach for it and
// it spins away (a twirl + fade) and lands somewhere else in the arena with a
// new excuse, while YES grows a little with every try. After five tries it
// gives up and turns into a second YES. Keyboard: Enter on No dodges too.

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { haptic, useReducedMotion } from "../../../_valentine/kit";
import { FONTS } from "../../../_valentine/theme";
import { DD_DISPLAY } from "./fonts";
import { DD_GIF, useDd } from "./stage";
import { DD, RoomTitle } from "./ui";

const MAX_DODGES = 5;

export default function Question({ question, yesLabel, noLines, onYes }: { question: string; yesLabel: string; noLines: readonly string[]; onYes: (dodges: number) => void }) {
  const reduced = useReducedMotion();
  const { cue } = useDd();
  const arenaRef = useRef<HTMLDivElement | null>(null);
  const yesRef = useRef<HTMLButtonElement | null>(null);
  const noRef = useRef<HTMLButtonElement | null>(null);
  const dodgesRef = useRef(0);
  const busy = useRef(false);
  const [dodges, setDodges] = useState(0);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [spinning, setSpinning] = useState(false);
  const surrendered = dodges >= MAX_DODGES;

  const yes = () => {
    cue("chime", { gain: 0.8 });
    cue("dd-dhol", { gain: 1 });
    cue("dd-bells", { gain: 0.8, at: 0.1 });
    onYes(dodgesRef.current);
  };

  const dodge = useCallback(() => {
    if (busy.current || dodgesRef.current >= MAX_DODGES) return;
    busy.current = true;
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
  }, [reduced, cue]);

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

  // Mouse proximity on desktop: No twirls off before the cursor arrives.
  useEffect(() => {
    const arena = arenaRef.current;
    if (!arena || surrendered) return;
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
  }, [dodge, surrendered]);

  const lines = noLines.length ? noLines : ["oops, my sticks slipped"];
  const noLabel = surrendered ? "Okay fine… YES 💛" : dodges === 0 ? "No" : lines[(dodges - 1) % lines.length];
  const yesScale = Math.min(1.6, Math.pow(1.1, dodges));

  return (
    <>
      <style>{Q_CSS}</style>
      <RoomTitle kicker="Nine nights · one question" title={<span style={{ font: "inherit" }}>{question}</span>} />
      <div className="dd-q-couple" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={DD_GIF.couple} alt="" width={500} height={500} decoding="async" />
      </div>

      <div ref={arenaRef} className="dd-q-arena">
        <motion.button
          ref={yesRef}
          type="button"
          onClick={yes}
          className="dd-q-yes"
          animate={{ scale: yesScale }}
          transition={{ type: "spring", stiffness: 260, damping: 14 }}
        >
          {yesLabel}
        </motion.button>
        <button
          ref={noRef}
          type="button"
          className={`dd-q-no${surrendered ? " is-yes" : ""}${spinning ? " is-spin" : ""}`}
          aria-label={surrendered ? "Okay fine, yes" : `No — ${noLabel}`}
          onPointerDown={(e) => {
            if (surrendered) return;
            e.preventDefault();
            dodge();
          }}
          onKeyDown={(e) => {
            if (!surrendered && (e.key === "Enter" || e.key === " ")) {
              e.preventDefault();
              dodge();
            }
          }}
          onClick={() => {
            if (surrendered) yes();
          }}
          style={{ left: pos ? pos.x : "74%", top: pos ? pos.y : "50%", transform: pos ? undefined : "translate(-50%, -50%)" }}
        >
          {dodges > 0 && !surrendered ? "💫 " : ""}
          {noLabel}
        </button>
        <span className="vw-sr" aria-live="polite">
          {dodges > 0 && !surrendered ? `The No button twirled away. ${noLabel}` : ""}
        </span>
      </div>
      <div style={{ flex: "none", minHeight: 28 }}>
        {dodges > 0 && !surrendered && <p style={{ margin: 0, font: `400 clamp(16px, 2.4dvh, 19px) ${DD_DISPLAY}`, color: "#7FD8F2" }}>No twirled away ×{dodges}</p>}
      </div>
    </>
  );
}

const Q_CSS = `
.dd-q-couple { flex: none; width: clamp(110px, 21dvh, calc(190px * var(--vw-s, 1))); aspect-ratio: 1; display: grid; place-items: center; }
.dd-q-couple img { width: 100%; height: 100%; object-fit: contain; animation: dd-q-sway 1.4s ease-in-out infinite alternate; transform-origin: 50% 90%; filter: drop-shadow(0 10px 18px rgba(0,0,0,.45)); }
@keyframes dd-q-sway { from { transform: rotate(-4deg) } to { transform: rotate(4deg) translateY(-4px) } }
.dd-q-arena { position: relative; flex: 1 1 0; min-height: 150px; width: 100%; max-width: calc(420px * var(--vw-s, 1)); max-height: 300px; }
.dd-q-yes { position: absolute; left: 26%; top: 50%; margin-left: -72px; margin-top: -29px; min-width: 144px; min-height: 58px; padding: 14px 22px; border-radius: 999px; border: 0;
  background: linear-gradient(180deg, #FFE08A, #FFB627 50%, #F08A0C); color: #3A1404; font: 700 18px ${FONTS.ui}; white-space: nowrap; cursor: pointer; z-index: 2;
  box-shadow: 0 5px 0 #A8580A, 0 0 30px -4px rgba(255,182,39,.7); touch-action: manipulation; }
.dd-q-yes:focus-visible { outline: 3px solid #7FD8F2; outline-offset: 4px; }
.dd-q-no { position: absolute; min-height: 48px; min-width: 88px; max-width: calc(100% - 16px); padding: 12px 20px; border-radius: 999px;
  border: 1.5px dashed rgba(255,247,232,.55); background: rgba(255,247,232,.14); color: ${DD.ink}; font: 700 16px ${FONTS.ui};
  backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; cursor: pointer; z-index: 3; touch-action: manipulation;
  transition: opacity .3s ease, rotate .3s ease, scale .3s ease; }
.dd-q-no.is-spin { opacity: 0; rotate: 300deg; scale: .5; }
.dd-q-no.is-yes { border: 0; background: linear-gradient(180deg, #FFE08A, #FFB627 50%, #F08A0C); color: #3A1404; box-shadow: 0 5px 0 #A8580A; }
.dd-q-no:focus-visible { outline: 3px solid #7FD8F2; outline-offset: 4px; }
@media (prefers-reduced-motion: reduce) { .dd-q-couple img { animation: none; } .dd-q-no { transition: none; } }
`;
