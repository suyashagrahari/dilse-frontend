"use client";

// ─── ChocoBox — arrival, ribbon, lid, menu card, the tray, the heart truffle ─
//
// One continuous stage so nothing "cuts": the wrapped box (drag the ribbon's
// tagged end to untie it — or tap the tag) → the lid swings up on a hinge and
// shows its lining → the menu card slides out → the tray of foil-wrapped
// pieces (tap one → PieceFocus: peel, bite, reason) → once every piece is
// eaten the centre heart truffle glows; hold it to melt it (tap ×6 fallback).

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { AnimatePresence, animate, motion, useMotionValue, useTransform, type MotionValue } from "framer-motion";
import { FONTS } from "../../_valentine/theme";
import { burst, haptic, useHoldProgress } from "../../_valentine/kit";
import type { LovePhoto } from "../../_valentine/types";
import { C, ChocoArt, CupArt, FoilArt, HEART_CHOCO, pieceLook } from "./chocoArt";
import PieceFocus, { type PieceState } from "./PieceFocus";
import { sfx } from "./chocoSfx";

type Phase = "closed" | "untying" | "opening" | "menu" | "tray";
const MELT_TAPS = 6;

export interface ChocoBoxProps {
  recipientName: string;
  petName: string;
  senderName: string;
  giftTag: string;
  /** 6 or 9 */
  size: number;
  /** One per regular piece, in EATING order (size - 1 of them). */
  reasons: string[];
  photo?: LovePhoto;
  reduced: boolean;
  sound: boolean;
  preview: boolean;
  sticker: (slotId: string, size: number, style?: CSSProperties) => ReactNode;
  onMelted: (eaten: number) => void;
}

export default function ChocoBox(p: ChocoBoxProps) {
  const cols = 3;
  const rows = p.size === 6 ? 2 : 3;
  const heartCell = p.size === 6 ? 4 : 4;
  const cells = useMemo(() => Array.from({ length: p.size }, (_, i) => i), [p.size]);
  const regularCount = p.size - 1;

  const [phase, setPhase] = useState<Phase>("closed");
  const [pieces, setPieces] = useState<PieceState[]>(() => cells.map(() => ({ stage: "wrapped", bites: 0, order: null })));
  const [focus, setFocus] = useState<number | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [lockWiggle, setLockWiggle] = useState(0);
  const eaten = pieces.filter((x, i) => i !== heartCell && x.order != null).length;
  const allEaten = eaten >= regularCount;
  const timers = useRef<number[]>([]);
  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms));
  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  // ── ribbon drag ────────────────────────────────────────────────────────────
  const dx = useMotionValue(0);
  const dy = useMotionValue(0);
  const pull = useTransform([dx, dy], ([a, b]: number[]) => Math.min(1, Math.hypot(a, b) / 120));
  const tailPath = useTransform([dx, dy], ([a, b]: number[]) => {
    const ex = a;
    const ey = 64 + b;
    return `M 0 -2 C 0 ${22 + b * 0.15}, ${ex * 0.55} ${ey * 0.55}, ${ex} ${ey}`;
  });
  const loopL = useTransform(pull, [0, 1], [0, -34]);
  const loopR = useTransform(pull, [0, 1], [0, 34]);
  const loopS = useTransform(pull, [0, 1], [1, 0.62]);
  const knotS = useTransform(pull, [0, 1], [1, 0.7]);
  const untieRef = useRef(false);

  const untie = useCallback(() => {
    if (untieRef.current) return;
    untieRef.current = true;
    haptic([12, 40, 18]);
    sfx.pop(p.sound);
    if (p.reduced) {
      setPhase("menu");
      return;
    }
    setPhase("untying");
    animate(dy, 900, { duration: 0.7, ease: [0.5, 0, 0.9, 0.6] });
    burst({ kind: "sparkles", origin: { x: 0.5, y: 0.42 }, count: 18, spread: 0.25, emojis: ["✨", "⭐"] });
    later(() => setPhase("opening"), 620);
    later(() => setPhase("menu"), 1900);
  }, [dy, p.reduced, p.sound]);

  const autoPull = () => {
    if (untieRef.current) return;
    if (p.reduced) return untie();
    animate(dy, 140, { duration: 0.45, ease: "easeIn" }).then(untie);
  };

  // ── pieces ─────────────────────────────────────────────────────────────────
  const update = (cell: number, patch: Partial<PieceState>) => setPieces((prev) => prev.map((x, i) => (i === cell ? { ...x, ...patch } : x)));

  const onBite = (cell: number) => {
    setPieces((prev) => {
      const cur = prev[cell];
      const order = cur.order ?? prev.filter((x, i) => i !== heartCell && x.order != null).length;
      return prev.map((x, i) => (i === cell ? { ...x, stage: "bitten", bites: Math.min(3, x.bites + 1), order } : x));
    });
  };

  const tapCell = (cell: number) => {
    if (phase !== "tray") return;
    if (cell === heartCell) {
      if (!allEaten) {
        setLockWiggle((n) => n + 1);
        setHint(`Save me for last 😌 ${regularCount - eaten} to go`);
        haptic(8);
      } else if (!melted.current) {
        // Our own tap fallback: the kit hook's tap counting loses fast taps
        // (it eases toward each step), so six quick taps always melt it here.
        const next = meltTaps + 1;
        setMeltTaps(next);
        haptic(8);
        if (next >= MELT_TAPS) melt();
      }
      return;
    }
    haptic(8);
    setFocus(cell);
  };

  // ── heart truffle hold ─────────────────────────────────────────────────────
  const melted = useRef(false);
  const [meltTaps, setMeltTaps] = useState(0);
  const melt = () => {
    if (melted.current) return;
    melted.current = true;
    sfx.crunch(p.sound);
    haptic([15, 40, 25]);
    later(() => p.onMelted(eaten), p.reduced ? 100 : 380);
  };
  const hold = useHoldProgress({
    duration: 1800,
    taps: 0,
    disabled: !allEaten || phase !== "tray",
    onComplete: melt,
  });
  const meltP = Math.max(hold.progress, meltTaps / MELT_TAPS);
  useEffect(() => {
    if (!allEaten || phase !== "tray") return;
    if (hold.done || meltTaps >= MELT_TAPS) setHint("Mmm… 🫠");
    else if (hold.holding) setHint("Melting… keep holding ❤️");
    else if (meltTaps > 0) setHint(`Tap tap… ${MELT_TAPS - meltTaps} more 🫠`);
    else if (hold.progress > 0.02) setHint("Patience, meri jaan 🫠 hold a little longer");
    else setHint("Every piece eaten! Hold the heart to melt it ❤️");
  }, [allEaten, phase, hold.done, hold.holding, hold.progress > 0.02, meltTaps]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (phase === "tray" && !allEaten && eaten === 0) setHint("Tap any piece to unwrap it 🍫");
    if (phase === "tray" && !allEaten && eaten > 0) setHint(eaten === regularCount - 1 ? "One more… then the heart 💗" : `${regularCount - eaten} pieces left. Eat slowly.`);
  }, [phase, eaten, allEaten, regularCount]);

  const closed = phase === "closed" || phase === "untying";
  const lidVisible = phase === "closed" || phase === "untying" || phase === "opening";
  const name = p.recipientName || "you";
  const focusPiece = focus != null ? pieces[focus] : null;

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
      {/* ── header (fixed height: no shift between phases) ── */}
      <div style={{ minHeight: 132, width: "100%", maxWidth: 420, position: "relative", display: "grid", placeItems: "end center", marginBottom: 18 }}>
        <AnimatePresence mode="wait" initial={false}>
          {closed ? (
            <motion.div key="hello" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} style={{ textAlign: "center" }}>
              <p style={{ margin: 0, font: `600 12.5px ${FONTS.ui}`, letterSpacing: ".2em", textTransform: "uppercase", color: "#E9CDB6" }}>A box, just for you 🎁</p>
              <h1 style={{ margin: "4px 0 0", font: `700 ${name.length > 18 ? "clamp(30px, 9vw, 40px)" : name.length > 11 ? "clamp(36px, 11vw, 50px)" : "clamp(44px, 13vw, 62px)"}/1.05 ${FONTS.script}`, color: C.cream, overflowWrap: "break-word", textShadow: "0 4px 24px rgba(0,0,0,.35)" }}>{name}</h1>
              {p.petName && <p style={{ margin: "2px 0 0", font: `italic 400 17px ${FONTS.serif}`, color: "#E9CDB6" }}>“{p.petName}”</p>}
            </motion.div>
          ) : (
            <motion.div key="pick" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ textAlign: "center" }}>
              <p style={{ margin: 0, font: `600 12.5px ${FONTS.ui}`, letterSpacing: ".2em", textTransform: "uppercase", color: "#E9CDB6" }}>Ek Dabba Pyaar</p>
              <h1 style={{ margin: "6px 0 10px", font: `700 clamp(30px, 9vw, 40px)/1.1 ${FONTS.serif}`, color: C.cream, overflowWrap: "anywhere" }}>
                {allEaten ? "Save the best for last" : "Pick a piece"}
              </h1>
              <Counter eaten={eaten} total={regularCount} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── the box ── */}
      <div style={{ position: "relative", zIndex: 2, width: "min(86vw, 344px)", aspectRatio: `${cols} / ${rows}`, perspective: 1100, perspectiveOrigin: "50% 0%" }}>
        {/* box walls + tray */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 20,
            padding: 10,
            background: `linear-gradient(160deg, #EE5A8C, ${C.rasp} 45%, ${C.raspDeep})`,
            boxShadow: "0 30px 50px -22px rgba(0,0,0,.7), inset 0 2px 0 rgba(255,255,255,.25), inset 0 -3px 0 rgba(0,0,0,.2)",
          }}
        >
          <div
            style={{
              position: "relative",
              width: "100%",
              height: "100%",
              borderRadius: 13,
              background: "radial-gradient(120% 90% at 50% 20%, #3A2016 0%, #24130C 75%)",
              boxShadow: "inset 0 6px 14px rgba(0,0,0,.6), inset 0 0 0 1.5px rgba(230,184,92,.45)",
              display: "grid",
              gridTemplateColumns: `repeat(${cols}, 1fr)`,
              gridTemplateRows: `repeat(${rows}, 1fr)`,
              padding: 5,
              gap: 2,
            }}
          >
            {cells.map((cell) => (
              <Cell
                key={cell}
                cell={cell}
                isHeart={cell === heartCell}
                state={pieces[cell]}
                interactive={phase === "tray"}
                allEaten={allEaten}
                lockWiggle={cell === heartCell ? lockWiggle : 0}
                onTap={() => tapCell(cell)}
                hold={cell === heartCell ? hold : undefined}
                meltP={cell === heartCell ? meltP : 0}
                reduced={p.reduced}
              />
            ))}
          </div>
        </div>

        {/* lid */}
        <AnimatePresence>
          {lidVisible && (
            // opacity lives on the outer layer: opacity < 1 would flatten the 3D hinge
            <motion.div
              key="lid"
              initial={false}
              animate={{ opacity: phase === "opening" ? [1, 1, 1, 0] : 1 }}
              exit={{ opacity: 0 }}
              transition={phase === "opening" ? { duration: 1.3, times: [0, 0.6, 0.8, 1] } : { duration: 0.3 }}
              style={{ position: "absolute", inset: -6, zIndex: 3, perspective: 1100, perspectiveOrigin: "50% 0%" }}
            >
              <motion.div
                initial={false}
                animate={phase === "opening" ? { rotateX: 172, y: -8 } : { rotateX: 0, y: 0 }}
                transition={{ duration: 1.25, ease: [0.3, 0.6, 0.2, 1] }}
                style={{ position: "absolute", inset: 0, transformOrigin: "50% 0%", transformStyle: "preserve-3d" }}
              >
                <LidFront rows={rows} size={p.size} phase={phase} loopL={loopL} loopR={loopR} loopS={loopS} knotS={knotS} reduced={p.reduced} />
                <LidBack sender={p.senderName} />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ribbon tail + gift tag */}
        {(phase === "closed" || phase === "untying") && (
          <>
            <svg aria-hidden width="2" height="2" style={{ position: "absolute", left: "50%", top: "calc(100% + 6px)", overflow: "visible", zIndex: 4, pointerEvents: "none" }}>
              <defs>
                <linearGradient id="ck-tail" x1="-12" y1="0" x2="12" y2="0" gradientUnits="userSpaceOnUse">
                  <stop offset="0" stopColor="#A67A2A" />
                  <stop offset=".45" stopColor="#FFE7A8" />
                  <stop offset="1" stopColor="#B8862E" />
                </linearGradient>
              </defs>
              <motion.path d={tailPath} stroke="url(#ck-tail)" strokeWidth="19" fill="none" strokeLinecap="butt" />
              <motion.path d={tailPath} stroke="rgba(255,255,255,.35)" strokeWidth="2" fill="none" />
            </svg>
            <motion.div
              drag={phase === "closed"}
              dragMomentum={false}
              dragElastic={0}
              onDragEnd={() => {
                if (Math.hypot(dx.get(), dy.get()) >= 100) untie();
                else {
                  animate(dx, 0, { type: "spring", stiffness: 420, damping: 18 });
                  animate(dy, 0, { type: "spring", stiffness: 420, damping: 18 });
                }
              }}
              onTap={autoPull}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  autoPull();
                }
              }}
              role="button"
              tabIndex={0}
              aria-label="Pull the ribbon to open the box"
              style={{ x: dx, y: dy, position: "absolute", left: "calc(50% - 82px)", top: "calc(100% + 64px)", width: 164, zIndex: 5, cursor: "grab", touchAction: "none" }}
            >
              <GiftTag name={name} line={p.giftTag} sender={p.senderName} swing={phase === "closed"} />
            </motion.div>
          </>
        )}

        {/* the menu card */}
        <AnimatePresence>
          {phase === "menu" && (
            <motion.div
              key="menu"
              initial={p.reduced ? { opacity: 0 } : { y: 70, opacity: 0, rotate: -2 }}
              animate={{ y: 0, opacity: 1, rotate: -1.5 }}
              exit={p.reduced ? { opacity: 0 } : { y: -40, x: 60, opacity: 0, rotate: 8 }}
              transition={{ type: "spring", stiffness: 220, damping: 20 }}
              style={{ position: "absolute", left: "7%", right: "7%", top: rows === 3 ? "10%" : "-6%", zIndex: 6 }}
            >
              <MenuCard size={p.size} onGo={() => setPhase("tray")} sticker={p.sticker} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── hint row (reserved) ── */}
      <div style={{ position: "relative", pointerEvents: "none", minHeight: closed ? 230 : 74, display: "grid", placeItems: "start center", marginTop: closed ? 0 : 22, width: "100%", maxWidth: 380, transition: "min-height .4s" }}>
        {closed ? (
          <div style={{ position: "relative", marginTop: 196, textAlign: "center" }}>
            <p style={{ margin: 0, font: `600 15px ${FONTS.ui}`, color: C.cream }}>Pull the ribbon to untie it 🎀</p>
            <p style={{ margin: "3px 0 0", font: `400 12.5px ${FONTS.ui}`, color: "#C9A68C" }}>or just tap the tag</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {hint && phase === "tray" && (
              <motion.p
                key={hint}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                aria-live="polite"
                style={{ margin: 0, padding: "10px 18px", borderRadius: 99, background: "rgba(255,244,230,.08)", border: "1px solid rgba(230,184,92,.28)", font: `600 14.5px ${FONTS.ui}`, color: C.cream, textAlign: "center" }}
              >
                {hint}
              </motion.p>
            )}
          </AnimatePresence>
        )}
        {phase === "closed" && !p.reduced && (
          <span aria-hidden className="ck-finger" style={{ position: "absolute", top: 76, left: "calc(50% + 84px)", fontSize: 30, zIndex: 6, pointerEvents: "none", ["--ck-fy" as string]: "70px" } as CSSProperties}>
            👆
          </span>
        )}
      </div>

      {focus != null && focusPiece && (
        <PieceFocus
          key={focus}
          look={pieceLook(focus)}
          state={focusPiece}
          total={regularCount}
          reason={focusPiece.order != null ? p.reasons[focusPiece.order] ?? "" : p.reasons[eaten] ?? ""}
          nextOrder={focusPiece.order ?? eaten}
          gooey={(focusPiece.order ?? eaten) === 4}
          photo={p.photo}
          reduced={p.reduced}
          sound={p.sound}
          preview={p.preview}
          sticker={p.sticker}
          onPeeled={() => update(focus, { stage: "bare" })}
          onBite={() => onBite(focus)}
          onClose={() => setFocus(null)}
        />
      )}
    </div>
  );
}

// ── Counter: little chocolates that fill in ───────────────────────────────────
function Counter({ eaten, total }: { eaten: number; total: number }) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "6px 14px 6px 10px", borderRadius: 99, background: "rgba(255,244,230,.08)", border: "1px solid rgba(230,184,92,.3)" }}>
      <span style={{ display: "inline-flex", gap: 3 }} aria-hidden>
        {Array.from({ length: total }, (_, i) => (
          <motion.span
            key={i}
            animate={{ scale: i < eaten ? 1 : 0.8, background: i < eaten ? C.gold : "rgba(255,244,230,.18)" }}
            transition={{ type: "spring", stiffness: 500, damping: 18 }}
            style={{ width: 9, height: 9, borderRadius: 3 }}
          />
        ))}
      </span>
      <span style={{ font: `600 13.5px ${FONTS.ui}`, color: C.cream }}>
        {eaten}/{total} eaten 🍫
      </span>
    </div>
  );
}

// ── one tray cell ────────────────────────────────────────────────────────────
function Cell({
  cell,
  isHeart,
  state,
  interactive,
  allEaten,
  lockWiggle,
  onTap,
  hold,
  meltP,
  reduced,
}: {
  meltP: number;
  cell: number;
  isHeart: boolean;
  state: PieceState;
  interactive: boolean;
  allEaten: boolean;
  lockWiggle: number;
  onTap: () => void;
  hold?: ReturnType<typeof useHoldProgress>;
  reduced: boolean;
}) {
  const look = pieceLook(cell);
  if (isHeart) {
    const pr = meltP;
    const ready = allEaten && interactive;
    return (
      <button
        type="button"
        onClick={onTap}
        {...(ready && hold ? hold.bind : {})}
        style={{ ...(ready && hold ? hold.bind.style : {}), position: "relative", border: 0, padding: 0, background: "transparent", cursor: interactive ? "pointer" : "default", display: "grid", placeItems: "center", zIndex: ready ? 2 : 1 }}
        aria-label={ready ? "Hold the heart truffle to melt it" : "The heart truffle — save it for last"}
      >
        {ready && <span aria-hidden className="ck-glow" style={{ position: "absolute", inset: "-6%", borderRadius: "50%", background: "radial-gradient(circle, rgba(255,214,140,.65), rgba(224,69,123,.25) 50%, transparent 70%)" }} />}
        <CupArt color="#B8862E" edge="#6B4A16" size="96%" style={{ position: "absolute" }} />
        <motion.div
          key={lockWiggle}
          animate={lockWiggle ? { rotate: [0, -12, 10, -6, 0] } : {}}
          transition={{ duration: 0.5 }}
          style={{ position: "relative", width: "84%", height: "84%", transformOrigin: "50% 85%", transform: `scaleY(${1 - 0.34 * pr}) scaleX(${1 + 0.2 * pr}) translateY(${10 * pr}%)`, filter: ready ? "none" : "saturate(.75) brightness(.85)" }}
        >
          <ChocoArt shape="heart" choco={HEART_CHOCO} size="100%" />
          {/* melt drips */}
          {pr > 0.02 && <MeltDrips p={pr} reduced={reduced} />}
        </motion.div>
        {ready && !reduced && (
          <span aria-hidden style={{ position: "absolute", top: "-22%", left: "50%", width: 30, marginLeft: -15, height: 40, pointerEvents: "none" }}>
            {[0, 1, 2].map((k) => (
              <span key={k} className="ck-steam" style={{ position: "absolute", left: k * 10, bottom: 0, width: 8, height: 22, borderRadius: 8, background: "rgba(255,244,230,.35)", filter: "blur(3px)", animationDelay: `${k * 0.7}s` }} />
            ))}
          </span>
        )}
        {ready && (
          <svg aria-hidden viewBox="0 0 100 100" style={{ position: "absolute", inset: "-4%", width: "108%", height: "108%", transform: "rotate(-90deg)", pointerEvents: "none" }}>
            <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(255,244,230,.15)" strokeWidth="3" />
            <circle cx="50" cy="50" r="46" fill="none" stroke={C.gold} strokeWidth="3.5" strokeLinecap="round" strokeDasharray={`${pr * 289} 289`} />
          </svg>
        )}
        {!allEaten && (
          <span aria-hidden style={{ position: "absolute", bottom: "4%", left: "50%", transform: "translateX(-50%)", padding: "1px 7px", borderRadius: 99, background: "rgba(36,19,12,.8)", border: "1px solid rgba(230,184,92,.5)", font: `600 9.5px ${FONTS.ui}`, color: C.goldLight, letterSpacing: ".08em", whiteSpace: "nowrap" }}>
            LAST ❤️
          </span>
        )}
      </button>
    );
  }

  const eatenUp = state.order != null;
  return (
    <button
      type="button"
      onClick={onTap}
      disabled={!interactive || eatenUp}
      aria-label={eatenUp ? `Piece eaten — reason ${state.order! + 1}` : state.stage === "bare" ? "An unwrapped piece — tap to bite" : "A wrapped piece — tap to unwrap"}
      style={{ position: "relative", border: 0, padding: 0, background: "transparent", cursor: interactive && !eatenUp ? "pointer" : "default", display: "grid", placeItems: "center" }}
    >
      <CupArt size="96%" style={{ position: "absolute" }} />
      <div className={interactive && !eatenUp && !reduced ? "ck-wobble" : undefined} style={{ position: "relative", width: "78%", height: "78%", animationDelay: `${(cell * 0.53) % 4}s` }}>
        <AnimatePresence initial={false}>
          {eatenUp ? (
            <motion.div key="crumbs" initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
              <Crumbs seed={cell} />
              <span style={{ position: "absolute", font: `700 13px ${FONTS.ui}`, color: "rgba(230,184,92,.75)" }}>#{state.order! + 1}</span>
            </motion.div>
          ) : state.stage === "bare" ? (
            <motion.div key="bare" initial={{ scale: 0.8 }} animate={{ scale: 1 }} style={{ position: "absolute", inset: 0 }}>
              <ChocoArt shape={look.shape} choco={look.choco} size="100%" />
            </motion.div>
          ) : (
            <motion.div key="foil" exit={{ opacity: 0, scale: 0.7 }} style={{ position: "absolute", inset: 0 }}>
              <FoilArt shape={look.shape} foil={look.foil} seed={look.seed} size="100%" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </button>
  );
}

function Crumbs({ seed }: { seed: number }) {
  const pts = Array.from({ length: 9 }, (_, i) => ({ x: 30 + (((seed + 1) * 37 + i * 53) % 40), y: 34 + (((seed + 3) * 29 + i * 41) % 34), r: 1.6 + ((i * 7 + seed) % 3) }));
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden>
      {pts.map((q, i) => (
        <circle key={i} cx={q.x} cy={q.y} r={q.r} fill={i % 3 ? "#6E4029" : "#A26A47"} />
      ))}
      <path d="M50 62 C44 58 41 55 41 51.5 C41 49 43 47.5 45 47.5 C47 47.5 49 48.6 50 50.3 C51 48.6 53 47.5 55 47.5 C57 47.5 59 49 59 51.5 C59 55 56 58 50 62 Z" fill="rgba(230,184,92,.0)" />
    </svg>
  );
}

function MeltDrips({ p, reduced }: { p: number; reduced: boolean }) {
  const len = (k: number) => 6 + p * (18 + k * 9);
  return (
    <svg aria-hidden viewBox="0 0 100 140" style={{ position: "absolute", left: 0, top: 0, width: "100%", height: "140%", overflow: "visible", pointerEvents: "none" }}>
      <defs>
        <filter id="ck-goo">
          <feGaussianBlur in="SourceGraphic" stdDeviation={reduced ? 0 : 3} result="b" />
          <feColorMatrix in="b" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -8" />
        </filter>
      </defs>
      <g filter="url(#ck-goo)" fill={HEART_CHOCO.shell[1]}>
        <ellipse cx="50" cy={84} rx={10 + p * 34} ry={3 + p * 6} />
        {[30, 46, 62].map((x, k) => (
          <g key={x}>
            <rect x={x - 3.5} y={68} width={7} height={len(k)} rx={3.5} />
            <circle cx={x} cy={68 + len(k)} r={4.5} />
          </g>
        ))}
      </g>
    </svg>
  );
}

// ── the lid ──────────────────────────────────────────────────────────────────
function LidFront({
  rows,
  size,
  phase,
  loopL,
  loopR,
  loopS,
  knotS,
  reduced,
}: {
  rows: number;
  size: number;
  phase: Phase;
  loopL: MotionValue<number>;
  loopR: MotionValue<number>;
  loopS: MotionValue<number>;
  knotS: MotionValue<number>;
  reduced: boolean;
}) {
  const untying = phase !== "closed";
  const band = "linear-gradient(90deg, #A67A2A, #E6B85C 30%, #FFF0BF 50%, #E6B85C 70%, #A67A2A)";
  const bandH = "linear-gradient(180deg, #A67A2A, #E6B85C 30%, #FFF0BF 50%, #E6B85C 70%, #A67A2A)";
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        borderRadius: 22,
        backfaceVisibility: "hidden",
        WebkitBackfaceVisibility: "hidden",
        background: `radial-gradient(rgba(255,255,255,.13) 1.4px, transparent 1.8px) 0 0 / 16px 16px, linear-gradient(155deg, #F3689A 0%, ${C.rasp} 40%, ${C.raspDeep} 100%)`,
        boxShadow: `0 12px 0 #7A1D40, 0 32px 40px -14px rgba(0,0,0,.75), inset 0 2px 0 rgba(255,255,255,.35)`,
        overflow: "hidden",
      }}
    >
      {/* gold inner border */}
      <div style={{ position: "absolute", inset: 10, borderRadius: 14, border: "1.5px solid rgba(255,231,168,.75)", boxShadow: "inset 0 0 0 4px rgba(255,231,168,.0), inset 0 0 0 5px rgba(255,231,168,.35)" }} />
      {/* brand-free lettering in the quadrants */}
      <div style={{ position: "absolute", left: "8%", bottom: rows === 3 ? "9%" : "8%", width: "38%", textAlign: "left" }}>
        <div style={{ font: `700 clamp(16px, 4.8vw, 20px)/1.05 ${FONTS.script}`, color: C.goldLight, textShadow: "0 1px 0 rgba(0,0,0,.25)" }}>Ek Dabba Pyaar</div>
        <div style={{ marginTop: 5, font: `600 8px ${FONTS.ui}`, letterSpacing: ".14em", color: "rgba(255,231,168,.85)" }}>{size} PIECES · BY HAND</div>
      </div>
      <div aria-hidden style={{ position: "absolute", right: "11%", top: rows === 3 ? "12%" : "10%", font: `400 15px ${FONTS.ui}`, color: "rgba(255,231,168,.8)", letterSpacing: 4 }}>
        ♥ ♡ ♥
      </div>
      {/* ribbons */}
      <motion.div animate={untying && !reduced ? { y: "65%", opacity: 0 } : { y: 0, opacity: 1 }} transition={{ duration: 0.5, delay: 0.12, ease: "easeIn" }} style={{ position: "absolute", top: 0, bottom: 0, left: "50%", width: "11%", marginLeft: "-5.5%", background: band, boxShadow: "0 0 8px rgba(0,0,0,.25)" }} />
      <motion.div animate={untying && !reduced ? { x: "65%", opacity: 0 } : { x: 0, opacity: 1 }} transition={{ duration: 0.5, delay: 0.2, ease: "easeIn" }} style={{ position: "absolute", left: 0, right: 0, top: "50%", height: `${11 * (rows === 3 ? 1 : 1.5)}%`, transform: "translateY(-50%)", background: bandH, boxShadow: "0 0 8px rgba(0,0,0,.25)" }} />
      {/* the bow */}
      <motion.div
        animate={untying && !reduced ? { scale: [1, 1.2, 0.3], y: [0, -6, -90], rotate: [0, 0, 120], opacity: [1, 1, 0] } : {}}
        transition={{ duration: 0.6, ease: "easeOut" }}
        style={{ position: "absolute", left: "50%", top: "50%", width: "50%", marginLeft: "-25%", marginTop: "-17.5%", aspectRatio: "120 / 84", zIndex: 2 }}
      >
        <Bow loopL={loopL} loopR={loopR} loopS={loopS} knotS={knotS} />
      </motion.div>
    </div>
  );
}

function Bow({ loopL, loopR, loopS, knotS }: { loopL: MotionValue<number>; loopR: MotionValue<number>; loopS: MotionValue<number>; knotS: MotionValue<number> }) {
  return (
    <svg viewBox="0 0 120 84" width="100%" height="100%" aria-hidden style={{ overflow: "visible", filter: "drop-shadow(0 6px 6px rgba(0,0,0,.35))" }}>
      <defs>
        <linearGradient id="ck-bow" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFF0BF" />
          <stop offset=".45" stopColor="#E6B85C" />
          <stop offset="1" stopColor="#9A6E22" />
        </linearGradient>
      </defs>
      {/* short tail lying on the lid */}
      <path d="M58 46 L36 80 L44 77 L47 84 L64 48 Z" fill="url(#ck-bow)" />
      <motion.g style={{ rotate: loopL, scale: loopS, originX: "60px", originY: "42px" }}>
        <path d="M60 42 C44 14 8 6 6 30 C4 50 34 56 60 42 Z" fill="url(#ck-bow)" />
        <path d="M58 41 C42 26 20 22 16 32 C14 40 34 46 58 41 Z" fill="#9A6E22" opacity=".45" />
        <path d="M14 22 C24 14 38 16 48 26" stroke="#FFF7DA" strokeWidth="2" fill="none" opacity=".7" strokeLinecap="round" />
      </motion.g>
      <motion.g style={{ rotate: loopR, scale: loopS, originX: "60px", originY: "42px" }}>
        <path d="M60 42 C76 14 112 6 114 30 C116 50 86 56 60 42 Z" fill="url(#ck-bow)" />
        <path d="M62 41 C78 26 100 22 104 32 C106 40 86 46 62 41 Z" fill="#9A6E22" opacity=".45" />
      </motion.g>
      <motion.g style={{ scale: knotS, originX: "60px", originY: "42px" }}>
        <rect x="50" y="31" width="20" height="22" rx="8" fill="url(#ck-bow)" stroke="#9A6E22" strokeWidth="1" />
        <path d="M54 36 Q60 33 66 36" stroke="#FFF7DA" strokeWidth="1.6" fill="none" opacity=".8" />
      </motion.g>
    </svg>
  );
}

function LidBack({ sender }: { sender: string }) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        borderRadius: 22,
        transform: "rotateX(180deg)",
        backfaceVisibility: "hidden",
        WebkitBackfaceVisibility: "hidden",
        background: `linear-gradient(180deg, ${C.cream}, #F3E1C9)`,
        boxShadow: "inset 0 0 0 8px #EBD5C4, inset 0 0 0 9.5px rgba(166,122,42,.6)",
        display: "grid",
        placeItems: "center",
        textAlign: "center",
        padding: 24,
      }}
    >
      <div>
        <div style={{ font: `700 26px ${FONTS.script}`, color: C.raspDeep }}>Packed by hand, with love</div>
        {sender && <div style={{ marginTop: 6, font: `600 13px ${FONTS.ui}`, color: C.cocoa, letterSpacing: ".1em" }}>— {sender.toUpperCase()}</div>}
      </div>
    </div>
  );
}

// ── gift tag ─────────────────────────────────────────────────────────────────
function GiftTag({ name, line, sender, swing }: { name: string; line: string; sender: string; swing: boolean }) {
  return (
    <div className={swing ? "ck-swing" : undefined} style={{ position: "relative", paddingTop: 10 }}>
      <div
        style={{
          position: "relative",
          padding: "20px 14px 14px",
          borderRadius: 10,
          clipPath: "polygon(16% 0, 84% 0, 100% 14%, 100% 100%, 0 100%, 0 14%)",
          background: `linear-gradient(180deg, ${C.cream}, #F6E4CC)`,
          boxShadow: "0 14px 24px -10px rgba(0,0,0,.6)",
          textAlign: "center",
          userSelect: "none",
        }}
      >
        <span aria-hidden style={{ position: "absolute", top: 6, left: "50%", width: 10, height: 10, marginLeft: -5, borderRadius: "50%", background: "#24130C", boxShadow: "0 0 0 2.5px #E6B85C" }} />
        <div style={{ font: `700 ${name.length > 14 ? 17 : 21}px/1.1 ${FONTS.script}`, color: C.raspDeep, overflowWrap: "break-word" }}>For {name}</div>
        {line && (
          <div style={{ marginTop: 5, font: `500 11.5px/1.35 ${FONTS.ui}`, color: C.cocoa, display: "-webkit-box", WebkitLineClamp: 4, WebkitBoxOrient: "vertical", overflow: "hidden", overflowWrap: "anywhere" }}>{line}</div>
        )}
        {sender && <div style={{ marginTop: 6, font: `600 10px ${FONTS.ui}`, letterSpacing: ".14em", color: "#A0785E" }}>FROM {sender.toUpperCase()}</div>}
      </div>
    </div>
  );
}

// ── menu card ────────────────────────────────────────────────────────────────
function MenuCard({ size, onGo, sticker }: { size: number; onGo: () => void; sticker: ChocoBoxProps["sticker"] }) {
  return (
    <div style={{ position: "relative", padding: "22px 18px 18px", borderRadius: 16, background: `linear-gradient(180deg, ${C.cream}, #F7E6CF)`, boxShadow: "0 26px 40px -16px rgba(0,0,0,.75), inset 0 0 0 6px #FFF4E6, inset 0 0 0 7.5px rgba(166,122,42,.55)", textAlign: "center", color: C.cocoa }}>
      <div style={{ position: "absolute", right: -14, top: -54 }}>{sticker("c1-box", 84)}</div>
      <div style={{ font: `600 10.5px ${FONTS.ui}`, letterSpacing: ".3em", color: "#A67A2A" }}>— THE MENU —</div>
      <div style={{ margin: "8px 0 4px", font: `700 25px/1.15 ${FONTS.serif}` }}>
        {size} pieces.
        <br />
        {size} reasons.
      </div>
      <div style={{ font: `400 13px/1.45 ${FONTS.ui}`, color: "#6E4A36" }}>Peel the foil · take a bite · read why.</div>
      <div style={{ margin: "6px 0 14px", font: `700 19px ${FONTS.script}`, color: C.raspDeep }}>Save the ❤️ for last. Eat slowly.</div>
      <button
        type="button"
        onClick={onGo}
        autoFocus
        style={{ minHeight: 48, padding: "12px 26px", borderRadius: 16, border: 0, background: C.rasp, color: "#fff", font: `700 16px ${FONTS.ui}`, boxShadow: `0 4px 0 ${C.raspDeep}, 0 14px 24px -12px rgba(168,43,88,.8)`, cursor: "pointer" }}
      >
        Let&apos;s eat 🍫
      </button>
    </div>
  );
}
