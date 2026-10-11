"use client";

// ─── RunawayNo — the Yes/No everybody knows, made for phones ─────────────────
//
// Phones have no hover, so the "No" dodges on `pointerdown`/`touchstart` (a
// jump BEFORE the tap lands) and, with a mouse, when the pointer comes within
// `proximity` px. Each dodge: No jumps to a random spot inside the arena that
// avoids the Yes button (never off-screen), shrinks ×0.85 and cycles its label;
// Yes grows ×1.15 (capped at 2.2). After `maxDodges` the No gives up and
// becomes a second Yes. Keyboard: Enter/Space on No counts as a dodge.
//
// The arena reserves its own height (`height`, default 240) so nothing moves
// around it. `mode`: "both" | "run" | "shrink".
//
//   <RunawayNo yesLabel="Yes 💍" noLines={extras.noLines} onYes={(dodges) => react("answered", { noDodges: dodges })} />

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { haptic } from "./haptic";
import { useReducedMotion } from "./useReducedMotion";
import { ensureKitCss } from "./kitCss";

export interface RunawayNoProps {
  yesLabel?: string;
  /** The first label of No. */
  noLabel?: string;
  /** Lines No cycles through as it runs (sender-editable). */
  noLines?: readonly string[];
  onYes: (dodges: number) => void;
  onDodge?: (dodges: number) => void;
  /** After this many dodges No turns into a Yes. Default 6. */
  maxDodges?: number;
  /** What No becomes after giving up. */
  surrenderLabel?: string;
  mode?: "both" | "run" | "shrink";
  /** Arena height in px. Default 240. */
  height?: number;
  /** Mouse proximity that triggers a dodge. Default 70. */
  proximity?: number;
  yesStyle?: CSSProperties;
  noStyle?: CSSProperties;
  className?: string;
  style?: CSSProperties;
}

const DEFAULT_LINES = ["Are you sure? 🥺", "Pakka?", "Soch lo ek baar…", "Galti se dab gaya na?", "Okay, I'll ask again 😌"];

export default function RunawayNo({
  yesLabel = "Yes 💖",
  noLabel = "No",
  noLines,
  onYes,
  onDodge,
  maxDodges = 6,
  surrenderLabel,
  mode = "both",
  height = 240,
  proximity = 70,
  yesStyle,
  noStyle,
  className,
  style,
}: RunawayNoProps) {
  const reduced = useReducedMotion();
  useEffect(ensureKitCss, []);
  const arenaRef = useRef<HTMLDivElement>(null);
  const yesRef = useRef<HTMLButtonElement>(null);
  const noRef = useRef<HTMLButtonElement>(null);
  const [dodges, setDodges] = useState(0);
  const dodgesRef = useRef(0);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const lastDodge = useRef(0);
  const lines = noLines && noLines.filter((l) => l.trim()).length ? noLines.filter((l) => l.trim()) : DEFAULT_LINES;
  const surrendered = dodges >= maxDodges;
  const runs = mode !== "shrink";
  const shrinks = mode !== "run";

  const dodge = useCallback(() => {
    if (dodgesRef.current >= maxDodges) return;
    const now = performance.now();
    if (now - lastDodge.current < 160) return; // one physical tap = one dodge
    lastDodge.current = now;
    const n = dodgesRef.current + 1;
    dodgesRef.current = n;
    setDodges(n);
    onDodge?.(n);
    haptic(10);
    if (!runs) return;
    const arena = arenaRef.current?.getBoundingClientRect();
    const no = noRef.current?.getBoundingClientRect();
    const yes = yesRef.current?.getBoundingClientRect();
    if (!arena || !no) return;
    const pad = 8;
    const maxX = Math.max(pad, arena.width - no.width - pad);
    const maxY = Math.max(pad, arena.height - no.height - pad);
    // Try a few random spots; keep the first that clears the Yes button.
    for (let i = 0; i < 14; i++) {
      const x = pad + Math.random() * (maxX - pad);
      const y = pad + Math.random() * (maxY - pad);
      if (!yes) return setPos({ x, y });
      const yx = yes.left - arena.left;
      const yy = yes.top - arena.top;
      const overlap = x < yx + yes.width + 12 && x + no.width + 12 > yx && y < yy + yes.height + 12 && y + no.height + 12 > yy;
      if (!overlap || i === 13) return setPos({ x, y });
    }
  }, [maxDodges, onDodge, runs]);

  // The label changes AFTER a jump, so a longer line can push No past the edge.
  // Re-clamp to the arena once the new label has laid out.
  useLayoutEffect(() => {
    const arena = arenaRef.current;
    const no = noRef.current;
    if (!pos || !arena || !no) return;
    const pad = 8;
    const x = Math.min(pos.x, Math.max(pad, arena.clientWidth - no.offsetWidth - pad));
    const y = Math.min(pos.y, Math.max(pad, arena.clientHeight - no.offsetHeight - pad));
    if (x !== pos.x || y !== pos.y) setPos({ x, y });
  }, [pos, dodges]);

  // Mouse proximity (desktop). Touch dodges happen on pointerdown below.
  useEffect(() => {
    const arena = arenaRef.current;
    if (!arena || surrendered) return;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const r = noRef.current?.getBoundingClientRect();
      if (!r) return;
      const dx = Math.max(r.left - e.clientX, 0, e.clientX - r.right);
      const dy = Math.max(r.top - e.clientY, 0, e.clientY - r.bottom);
      if (Math.hypot(dx, dy) < proximity) dodge();
    };
    arena.addEventListener("pointermove", onMove);
    return () => arena.removeEventListener("pointermove", onMove);
  }, [dodge, proximity, surrendered]);

  const yesScale = Math.min(2.2, Math.pow(1.15, dodges));
  const noScale = shrinks ? Math.max(0.45, Math.pow(0.85, dodges)) : 1;
  const label = surrendered ? surrenderLabel ?? yesLabel : dodges === 0 ? noLabel : lines[(dodges - 1) % lines.length];
  const ease = reduced ? "none" : "transform .35s cubic-bezier(.34,1.56,.64,1), left .3s cubic-bezier(.2,.8,.2,1), top .3s cubic-bezier(.2,.8,.2,1)";

  const btn: CSSProperties = {
    minHeight: 48,
    minWidth: 88,
    padding: "12px 22px",
    borderRadius: 999,
    border: 0,
    font: "700 17px var(--vw-font-ui, system-ui)",
    cursor: "pointer",
    touchAction: "manipulation",
    whiteSpace: "nowrap",
    maxWidth: "calc(100% - 16px)",
    overflow: "hidden",
    textOverflow: "ellipsis",
  };

  return (
    <div ref={arenaRef} className={className} style={{ position: "relative", height, width: "100%", ...style }}>
      <button
        ref={yesRef}
        type="button"
        onClick={() => onYes(dodgesRef.current)}
        style={{
          ...btn,
          position: "absolute",
          left: "28%",
          top: "50%",
          transform: `translate(-50%, -50%) scale(${yesScale})`,
          transition: ease,
          background: "var(--vw-accent, #E0245E)",
          color: "var(--vw-accent-ink, #fff)",
          boxShadow: "0 5px 0 var(--vw-accent-deep, #9D174D), 0 12px 30px -10px rgba(0,0,0,.35)",
          zIndex: 2,
          ...yesStyle,
        }}
      >
        {yesLabel}
      </button>
      <button
        ref={noRef}
        type="button"
        aria-label={surrendered ? (surrenderLabel ?? yesLabel) : `No — ${label}`}
        onPointerDown={(e) => {
          if (surrendered) return;
          e.preventDefault();
          dodge();
        }}
        onTouchStart={() => !surrendered && dodge()}
        onKeyDown={(e) => {
          if (!surrendered && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            dodge();
          }
        }}
        onClick={() => surrendered && onYes(dodgesRef.current)}
        style={{
          ...btn,
          position: "absolute",
          left: pos ? pos.x : "72%",
          top: pos ? pos.y : "50%",
          transform: `${pos ? "" : "translate(-50%, -50%) "}scale(${noScale})`,
          transformOrigin: pos ? "top left" : "center",
          transition: ease,
          background: surrendered ? "var(--vw-accent, #E0245E)" : "rgba(255,255,255,.9)",
          color: surrendered ? "var(--vw-accent-ink, #fff)" : "#4a3040",
          boxShadow: "0 3px 0 rgba(0,0,0,.12)",
          zIndex: 3,
          ...noStyle,
        }}
      >
        {label}
      </button>
      <span className="vw-sr" aria-live="polite">
        {dodges > 0 && !surrendered ? `The No button ran away. ${label}` : ""}
      </span>
    </div>
  );
}
