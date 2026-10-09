"use client";

// The pinky promise. On the gate two pinkies wait, not quite touching (the tap starts the song). In the first scene
// his hand reaches down from the top; she drags her pinky up to hook it. Click, a heart pops between them, the
// sticker cheers (slot pk-pinky) and his welcome to the club types out.

import { useEffect, useRef, useState, type PointerEvent as RPointerEvent } from "react";
import { motion } from "framer-motion";
import { burst, haptic, useReducedMotion } from "../../../_valentine/kit";
import { usePremium } from "../../../_valentine/kit/premium";
import type { DayConfig, ValentineDayData } from "../../../_valentine/types";
import { Btn, DECOR, Gif, Head, LinkBtn, PinkyHand, SlotGif, Typed } from "./parts";
import { originOf, type Club } from "./util";

export function PinkyArt({ sticker }: { sticker?: string }) {
  return (
    <div className="pk-gateArt">
      {sticker && <Gif src={sticker} size={84} className="pk-gateSticker" eager />}
      <PinkyHand who="him" className="pk-gateHand him" />
      <span className="pk-gateHeart" aria-hidden>
        ♥
      </span>
      <PinkyHand who="her" className="pk-gateHand her" />
    </div>
  );
}

/** How far her hand travels (px) before the pinkies hook. */
const REACH = 114;

export function PinkyHook({ club, day, data, onNext, onSkip }: { club: Club; day: DayConfig; data: ValentineDayData; onNext: () => void; onSkip?: () => void }) {
  const { sfx } = usePremium();
  const reduce = useReducedMotion();
  const [dy, setDy] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [hooked, setHooked] = useState(false);
  const [said, setSaid] = useState(false);
  const start = useRef<{ y: number; d: number } | null>(null);
  const joint = useRef<HTMLSpanElement | null>(null);
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const hook = () => {
    if (hooked) return;
    setHooked(true);
    setDragging(false);
    setDy(-REACH);
    sfx("pk-hook");
    sfx("sparkle", { at: 0.12, gain: 0.6 });
    haptic([15, 40, 25]);
    timers.current.push(
      window.setTimeout(() => burst({ kind: "hearts", origin: originOf(joint.current), count: 20 }), 120),
      window.setTimeout(() => {
        setSaid(true);
        sfx("pk-tada", { gain: 0.8 });
      }, 900),
    );
  };

  const down = (e: RPointerEvent<HTMLDivElement>) => {
    if (hooked) return;
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    start.current = { y: e.clientY, d: dy };
    setDragging(true);
  };
  const move = (e: RPointerEvent<HTMLDivElement>) => {
    if (!start.current || hooked) return;
    const d = Math.max(-REACH, Math.min(0, start.current.d + e.clientY - start.current.y));
    setDy(d);
    if (d <= -REACH * 0.92) {
      start.current = null;
      hook();
    }
  };
  const up = () => {
    if (!start.current || hooked) return;
    start.current = null;
    setDragging(false);
    if (dy <= -REACH * 0.7) hook();
    else setDy(0);
  };

  const p = Math.min(1, -dy / REACH);

  return (
    <div className={`pk-scene pk-pinky${hooked ? " is-hooked" : ""}`}>
      <Head kicker={hooked ? "Pinky promised" : "Rule no. 1"} title={hooked ? "It's official 🤙" : club.pinkyPrompt} sub={hooked ? undefined : "Drag your pinky up to hook mine"} />
      <div className="pk-hookStage">
        <PinkyHand who="him" className="pk-hookHand him" style={{ transform: `rotate(180deg) translateX(${hooked ? -5 : 0}px) rotate(${hooked ? -6 : 0}deg)` }} />
        <div
          className={`pk-hookGrab${dragging ? " is-drag" : ""}`}
          style={{ transform: `translateY(${dy}px) translateX(${hooked ? 5 : 0}px) rotate(${hooked ? -6 : 0}deg)`, transition: dragging ? "none" : "transform .45s cubic-bezier(.34,1.56,.64,1)" }}
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerCancel={up}
          role="button"
          tabIndex={0}
          aria-label="Hook your pinky"
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              hook();
            }
          }}
        >
          <PinkyHand who="her" className="pk-hookHand her" />
        </div>
        <span className="pk-hookTrail" style={{ opacity: hooked ? 0 : 1 - p * 0.7 }} aria-hidden />
        <span ref={joint} className={`pk-joint${hooked ? " on" : ""}`} aria-hidden>
          <svg viewBox="0 0 24 22" width="38" height="36">
            <path d="M12 21 C5 15.5 1 12 1 7 C1 3.7 3.6 1 6.8 1 C9 1 10.9 2.2 12 4 C13.1 2.2 15 1 17.2 1 C20.4 1 23 3.7 23 7 C23 12 19 15.5 12 21 Z" fill="#FF4D6D" stroke="#fff" strokeWidth="2" />
          </svg>
        </span>
        <span className="pk-hookName him">{club.from}</span>
        <span className="pk-hookName her">{club.pet || club.to}</span>
        {!hooked && !reduce && <span className="pk-tapHint">drag up ↑</span>}
        {hooked && <SlotGif day={day} data={data} id="pk-pinky" size={104} className="pk-hookGif pk-pop" eager />}
      </div>
      <div className="pk-say" aria-live="polite">
        {said ? (
          <>
            <motion.p className="pk-bubble" initial={{ opacity: 0, y: 10, scale: 0.85 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: "spring", stiffness: 420, damping: 18 }}>
              <Typed text={club.welcome} speed={30} delay={200} />
            </motion.p>
            <div className="pk-pop" style={{ animationDelay: ".5s" }}>
              <Btn onClick={onNext}>Join the club 🎀</Btn>
            </div>
          </>
        ) : (
          !hooked && (
            <>
              <Gif src={DECOR.hooked} size={64} className="pk-sayGif" />
              <LinkBtn onClick={hook}>hook it for me</LinkBtn>
            </>
          )
        )}
        {onSkip && !hooked && (
          <LinkBtn onClick={onSkip} className="pk-pop">
            Seen it before? Skip to the love lock 🔐
          </LinkBtn>
        )}
      </div>
    </div>
  );
}
