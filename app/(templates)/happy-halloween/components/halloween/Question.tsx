"use client";

// Room 7 — The Question. "Will you be my boo?" with a No button that
// literally ghosts them: reach for it and it turns see-through, vanishes and
// reappears somewhere else in the room, muttering "boo… I mean, no?". (The
// kit's RunawayNo idea — a dodge on pointerdown, before the tap lands, plus
// mouse proximity — with a fade-out / fade-in instead of a slide.) After five
// tries it gives up and becomes a second YES. Kids mode: No never runs, it
// just says "maybe later?" and waits.
// YES → the parent warms the night (moon → heart), hearts and bats burst.

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { haptic, useReducedMotion } from "../../../_valentine/kit";
import { FONTS, VW } from "../../../_valentine/theme";
import { Ghost } from "./art";
import { HW_DISPLAY } from "./fonts";
import { HW_GIF, useHw } from "./stage";
import { HW, RoomTitle } from "./ui";

const MAX_DODGES = 5;

export default function Question({
  question,
  yesLabel,
  noLines,
  gentle,
  onYes,
}: {
  question: string;
  yesLabel: string;
  noLines: readonly string[];
  gentle: boolean;
  onYes: (dodges: number) => void;
}) {
  const reduced = useReducedMotion();
  const { cue } = useHw();
  const yes = () => {
    cue("chime", { gain: 0.8 });
    onYes(dodgesRef.current);
  };
  const arenaRef = useRef<HTMLDivElement | null>(null);
  const yesRef = useRef<HTMLButtonElement | null>(null);
  const noRef = useRef<HTMLButtonElement | null>(null);
  const dodgesRef = useRef(0);
  const busy = useRef(false);
  const [dodges, setDodges] = useState(0);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [ghosting, setGhosting] = useState(false);
  const [waitNote, setWaitNote] = useState(false);
  const surrendered = !gentle && dodges >= MAX_DODGES;

  const dodge = useCallback(() => {
    if (gentle) {
      setWaitNote(true);
      haptic(8);
      return;
    }
    if (busy.current || dodgesRef.current >= MAX_DODGES) return;
    busy.current = true;
    dodgesRef.current += 1;
    haptic(12);
    cue("swoosh-soft", { gain: 0.6 });
    setGhosting(true);
    window.setTimeout(
      () => {
        const arena = arenaRef.current?.getBoundingClientRect();
        const no = noRef.current?.getBoundingClientRect();
        const yes = yesRef.current?.getBoundingClientRect();
        if (arena && no) {
          const pad = 8;
          const maxX = Math.max(pad, arena.width - no.width - pad);
          const maxY = Math.max(pad, arena.height - no.height - pad);
          let pick = { x: pad, y: pad };
          for (let i = 0; i < 16; i++) {
            const x = pad + Math.random() * (maxX - pad);
            const y = pad + Math.random() * (maxY - pad);
            pick = { x, y };
            if (!yes) break;
            const yx = yes.left - arena.left;
            const yy = yes.top - arena.top;
            const clear = x > yx + yes.width + 14 || x + no.width + 14 < yx || y > yy + yes.height + 14 || y + no.height + 14 < yy;
            if (clear) break;
          }
          setPos(pick);
        }
        setDodges(dodgesRef.current);
        setGhosting(false);
        busy.current = false;
      },
      reduced ? 0 : 260,
    );
  }, [gentle, reduced, cue]);

  // A longer line can push the ghost past the edge — re-clamp once it has laid out.
  useLayoutEffect(() => {
    const arena = arenaRef.current;
    const no = noRef.current;
    if (!pos || !arena || !no) return;
    const pad = 8;
    const x = Math.min(pos.x, Math.max(pad, arena.clientWidth - no.offsetWidth - pad));
    let y = Math.min(pos.y, Math.max(pad, arena.clientHeight - no.offsetHeight - pad));
    // Never land on the YES button (it grows with every dodge): hop above or below it.
    const yes = yesRef.current?.getBoundingClientRect();
    const a = arena.getBoundingClientRect();
    if (yes) {
      const yt = yes.top - a.top;
      const yb = yes.bottom - a.top;
      const yl = yes.left - a.left;
      const yr = yes.right - a.left;
      const hits = x < yr + 10 && x + no.offsetWidth + 10 > yl && y < yb + 10 && y + no.offsetHeight + 10 > yt;
      if (hits) y = yb + 12 + no.offsetHeight <= arena.clientHeight - pad ? yb + 12 : Math.max(pad, yt - 12 - no.offsetHeight);
    }
    if (x !== pos.x || y !== pos.y) setPos({ x, y });
  }, [pos, dodges]);

  // Mouse proximity on desktop: the ghost drifts off before the cursor arrives.
  useEffect(() => {
    const arena = arenaRef.current;
    if (!arena || gentle || surrendered) return;
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
  }, [dodge, gentle, surrendered]);

  const lines = noLines.length ? noLines : ["boo… I mean, no?"];
  const noLabel = gentle ? "maybe later?" : surrendered ? "Okay fine… YES 👻" : dodges === 0 ? "No" : lines[(dodges - 1) % lines.length];
  const yesScale = gentle ? 1 : Math.min(1.7, Math.pow(1.1, dodges));

  return (
    <>
      <RoomTitle kicker="Room 7 · the moonlit balcony" title={<span style={{ font: "inherit" }}>{question}</span>} />
      <motion.div animate={reduced ? undefined : { y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} style={{ position: "relative", flex: "none", width: "clamp(72px, 14dvh, 120px)" }}>
        {/* three cute bats keeping the ghost company on the balcony */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={HW_GIF.bats} alt="" aria-hidden width={360} height={360} decoding="async" style={{ position: "absolute", left: "96%", top: "2%", width: "100%", height: "auto", pointerEvents: "none" }} />
        <Ghost size="100%" heart mood="shy" />
      </motion.div>

      <div ref={arenaRef} style={{ position: "relative", flex: "1 1 0", minHeight: 150, width: "100%", maxWidth: "calc(420px * var(--vw-s, 1))", maxHeight: 300 }}>
        <motion.button
          ref={yesRef}
          type="button"
          onClick={yes}
          animate={gentle && waitNote && !reduced ? { scale: [1, 1.08, 1] } : { scale: yesScale }}
          transition={gentle && waitNote ? { duration: 1.2, repeat: Infinity } : { type: "spring", stiffness: 260, damping: 14 }}
          style={{
            position: "absolute",
            left: "26%",
            top: "50%",
            marginLeft: -70,
            marginTop: -29,
            minWidth: 140,
            minHeight: 58,
            padding: "14px 22px",
            borderRadius: 999,
            border: 0,
            background: VW.accent,
            color: VW.accentInk,
            font: `700 18px ${FONTS.ui}`,
            boxShadow: `0 5px 0 ${VW.accentDeep}, 0 0 30px -4px rgba(255,138,61,.65)`,
            cursor: "pointer",
            zIndex: 2,
            whiteSpace: "nowrap",
          }}
        >
          {yesLabel}
        </motion.button>
        <button
          ref={noRef}
          type="button"
          aria-label={surrendered ? "Okay fine, yes" : gentle ? "Maybe later" : `No — ${noLabel}`}
          onPointerDown={(e) => {
            if (surrendered || gentle) return;
            e.preventDefault();
            dodge();
          }}
          onKeyDown={(e) => {
            if (!surrendered && !gentle && (e.key === "Enter" || e.key === " ")) {
              e.preventDefault();
              dodge();
            }
          }}
          onClick={() => {
            if (surrendered) yes();
            else if (gentle) dodge();
          }}
          style={{
            position: "absolute",
            left: pos ? pos.x : "74%",
            top: pos ? pos.y : "50%",
            transform: pos ? undefined : "translate(-50%, -50%)",
            minHeight: 48,
            minWidth: 88,
            maxWidth: "calc(100% - 16px)",
            padding: "12px 20px",
            borderRadius: "999px 999px 999px 999px",
            border: surrendered ? 0 : "1.5px dashed rgba(247,243,255,.55)",
            background: surrendered ? VW.accent : "rgba(247,243,255,.16)",
            color: surrendered ? VW.accentInk : HW.ghost,
            font: `700 16px ${FONTS.ui}`,
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
            opacity: ghosting ? 0 : surrendered ? 1 : dodges > 0 ? 0.72 : 1,
            filter: ghosting ? "blur(6px)" : "none",
            scale: ghosting ? "0.6" : "1",
            transition: reduced ? "none" : "opacity .26s ease, filter .26s ease, scale .26s ease",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            cursor: "pointer",
            zIndex: 3,
            touchAction: "manipulation",
          }}
        >
          {dodges > 0 && !surrendered && !gentle ? "👻 " : ""}
          {noLabel}
        </button>
        <span className="vw-sr" aria-live="polite">
          {dodges > 0 && !surrendered ? `The No button ghosted you. ${noLabel}` : ""}
        </span>
      </div>
      <div style={{ flex: "none", minHeight: 28 }}>
        {gentle && waitNote && <p style={{ margin: 0, font: `600 15px ${FONTS.ui}`, color: VW.inkSoft }}>That&apos;s okay. I&apos;ll wait right here 🍭</p>}
        {!gentle && dodges > 0 && !surrendered && (
          <p style={{ margin: 0, font: `400 18px ${HW_DISPLAY}`, color: HW.mint }}>
            The No button ghosted you ×{dodges}
          </p>
        )}
      </div>
    </>
  );
}
