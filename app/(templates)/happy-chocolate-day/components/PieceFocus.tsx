"use client";

// ─── PieceFocus — one chocolate, up close ────────────────────────────────────
//
// wrapped → rub the foil off (canvas, destination-out, shaped like the piece;
// auto-completes at ~50%) — or tap it 3× (each tap tears a chunk) — or the
// "Unwrap for me" button → the foil crumples away in a glitter puff
// → tap to bite (scalloped bite mask, squash-and-stretch, crumbs, crunch)
// → the reason rises on a little card. The 5th piece eaten is the gooey one:
// caramel drips and the first photo appears inside a caramel-dipped frame.

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FONTS } from "../../_valentine/theme";
import { burst, CroppedPhoto, haptic } from "../../_valentine/kit";
import type { LovePhoto } from "../../_valentine/types";
import { BITE_SPOTS, C, ChocoArt, CupArt, GOOEY_FILLING, rnd, SHAPES, type PieceLook } from "./chocoArt";
import { sfx } from "./chocoSfx";
import type { ChocoBoxProps } from "./ChocoBox";

export interface PieceState {
  stage: "wrapped" | "bare" | "bitten";
  bites: number;
  /** Eating order (0-based) once bitten — picks the reason. */
  order: number | null;
}

const STAGE = 232;

export default function PieceFocus({
  look,
  state,
  total,
  reason,
  nextOrder,
  gooey,
  photo,
  reduced,
  sound,
  preview,
  sticker,
  onPeeled,
  onBite,
  onClose,
}: {
  look: PieceLook;
  state: PieceState;
  total: number;
  reason: string;
  nextOrder: number;
  gooey: boolean;
  photo?: LovePhoto;
  reduced: boolean;
  sound: boolean;
  preview: boolean;
  sticker: ChocoBoxProps["sticker"];
  onPeeled: () => void;
  onBite: () => void;
  onClose: () => void;
}) {
  const pieceRef = useRef<HTMLDivElement>(null);
  const [squash, setSquash] = useState(0);
  const bitten = state.bites > 0;
  const closeRef = useRef<HTMLButtonElement>(null);

  // lock the page behind, Esc closes
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const bite = () => {
    if (state.stage === "wrapped" || state.bites >= 3) return;
    const spot = BITE_SPOTS[Math.min(state.bites, BITE_SPOTS.length - 1)];
    onBite();
    setSquash((n) => n + 1);
    haptic(14);
    sfx.crunch(sound);
    const r = pieceRef.current?.getBoundingClientRect();
    if (r && typeof window !== "undefined") {
      burst({
        kind: "confetti",
        colors: [look.choco.shell[1], look.choco.shell[0], gooey ? GOOEY_FILLING : look.choco.filling, "#3E2214"],
        count: 16,
        spread: 0.14,
        origin: { x: (r.left + (r.width * spot.x) / 100) / window.innerWidth, y: (r.top + (r.height * spot.y) / 100) / window.innerHeight },
      });
    }
    if (!bitten && gooey) window.setTimeout(() => burst({ kind: "hearts", emojis: ["🍯", "💛", "🫠"], count: 10, spread: 0.2, origin: { x: 0.5, y: 0.35 } }), 500);
    if (!bitten) window.setTimeout(() => closeRef.current?.focus({ preventScroll: true }), 900);
  };

  const heading = bitten ? (gooey ? "Ooh, the gooey one 🫠" : `Reason #${(state.order ?? nextOrder) + 1}`) : state.stage === "bare" ? "Now take a bite 😋" : "Unwrap it slowly…";

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label="A chocolate from the box"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      style={{ position: "fixed", inset: 0, zIndex: 90, overflowY: "auto", background: "radial-gradient(90% 60% at 50% 30%, rgba(90,50,32,.94), rgba(30,15,9,.97))", WebkitBackdropFilter: "blur(6px)", backdropFilter: "blur(6px)" }}
    >
      <div style={{ minHeight: "100%", display: "flex", flexDirection: "column", alignItems: "center", padding: `64px 20px ${preview ? 130 : 48}px`, gap: 10, textAlign: "center" }}>
        <p style={{ margin: 0, font: `600 12px ${FONTS.ui}`, letterSpacing: ".22em", textTransform: "uppercase", color: "#C9A68C" }}>
          Piece {(state.order ?? nextOrder) + 1} of {total}
        </p>
        <AnimatePresence mode="wait">
          <motion.h2 key={heading} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} style={{ margin: 0, font: `700 30px/1.15 ${FONTS.script}`, color: C.cream }}>
            {heading}
          </motion.h2>
        </AnimatePresence>

        {/* the piece */}
        <div style={{ position: "relative", width: STAGE + 40, height: STAGE + 30, display: "grid", placeItems: "center", marginTop: 4 }}>
          <CupArt size={STAGE + 34} style={{ position: "absolute", left: 3, top: -2 }} />
          <motion.div
            ref={pieceRef}
            key={squash}
            initial={false}
            animate={squash && !reduced ? { scaleY: [1, 0.84, 1.06, 0.98, 1], scaleX: [1, 1.12, 0.96, 1.01, 1] } : {}}
            transition={{ duration: 0.5, ease: "easeOut" }}
            style={{ position: "relative", width: STAGE, height: STAGE, transformOrigin: "50% 85%" }}
          >
            <button
              type="button"
              onClick={bite}
              disabled={state.stage === "wrapped" || state.bites >= 3}
              aria-label={state.bites >= 3 ? "All gone" : "Take a bite"}
              style={{ position: "absolute", inset: 0, border: 0, padding: 0, background: "transparent", cursor: state.stage !== "wrapped" && state.bites < 3 ? "pointer" : "default" }}
            >
              <ChocoArt shape={look.shape} choco={look.choco} bites={state.bites} gooey={gooey} size={STAGE} />
            </button>
            {bitten && gooey && <GooeyDrips reduced={reduced} />}
            {state.stage === "wrapped" && <FoilCanvas look={look} size={STAGE} reduced={reduced} sound={sound} onPeeled={onPeeled} />}
          </motion.div>
          {bitten && gooey && <div style={{ position: "absolute", right: -18, top: -18 }}>{sticker("c2-gooey", 86)}</div>}
        </div>

        {/* hint */}
        <div style={{ minHeight: 24 }}>
          {state.stage === "wrapped" && <p style={{ margin: 0, font: `500 14px ${FONTS.ui}`, color: "#E9CDB6" }}>Rub the foil off with your finger ✨ (or tap it 3×)</p>}
          {state.stage === "bare" && <p style={{ margin: 0, font: `500 14px ${FONTS.ui}`, color: "#E9CDB6" }}>Tap the chocolate to bite 😋</p>}
          {bitten && state.bites < 3 && <p style={{ margin: 0, font: `500 13px ${FONTS.ui}`, color: "#C9A68C" }}>Another bite? Tap it again 🍫</p>}
          {state.bites >= 3 && <p style={{ margin: 0, font: `500 13px ${FONTS.ui}`, color: "#C9A68C" }}>All gone. Zero regrets.</p>}
        </div>

        {/* reason */}
        <AnimatePresence>
          {bitten && (
            <motion.div
              key="reason"
              initial={reduced ? { opacity: 0 } : { y: 60, opacity: 0, scale: 0.92 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.25 }}
              style={{ width: "min(100%, 360px)" }}
            >
              {gooey ? <GooeyCard reason={reason} photo={photo} /> : <ReasonCard n={(state.order ?? nextOrder) + 1} reason={reason} flavour={look.choco.fillingName} />}
            </motion.div>
          )}
        </AnimatePresence>

        <div style={{ display: "grid", gap: 8, marginTop: 10, width: "min(100%, 320px)" }}>
          {state.stage === "wrapped" && <FoilFallbackButton />}
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            style={
              bitten
                ? { minHeight: 52, borderRadius: 16, border: 0, background: C.rasp, color: "#fff", font: `700 16px ${FONTS.ui}`, boxShadow: `0 4px 0 ${C.raspDeep}`, cursor: "pointer" }
                : { minHeight: 44, borderRadius: 14, border: "1px solid rgba(255,244,230,.2)", background: "transparent", color: "#E9CDB6", font: `500 14px ${FONTS.ui}`, cursor: "pointer" }
            }
          >
            {bitten ? "Back to the box 🍫" : "← Back to the box"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// The foil canvas exposes its "unwrap" through this tiny event bus so the
// fallback button can live in the normal flow under the hint.
const UNWRAP_EVENT = "ck-unwrap";
function FoilFallbackButton() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(UNWRAP_EVENT))}
      style={{ minHeight: 44, borderRadius: 14, border: "1px solid rgba(230,184,92,.45)", background: "rgba(230,184,92,.12)", color: C.goldLight, font: `600 14px ${FONTS.ui}`, cursor: "pointer" }}
    >
      Unwrap it for me ✨
    </button>
  );
}

// ── the foil you rub off ─────────────────────────────────────────────────────
function FoilCanvas({ look, size, reduced, sound, onPeeled }: { look: PieceLook; size: number; reduced: boolean; sound: boolean; onPeeled: () => void }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const initial = useRef(0);
  const moves = useRef(0);
  const taps = useRef(0);
  const down = useRef<{ x: number; y: number; moved: boolean } | null>(null);
  const last = useRef<{ x: number; y: number } | null>(null);
  const doneRef = useRef(false);
  const [gone, setGone] = useState(false);
  const dpr = typeof window === "undefined" ? 1 : Math.min(2, window.devicePixelRatio || 1);

  const count = useCallback(() => {
    const cv = ref.current;
    const ctx = cv?.getContext("2d", { willReadFrequently: true } as CanvasRenderingContext2DSettings);
    if (!cv || !ctx) return 0;
    const d = ctx.getImageData(0, 0, cv.width, cv.height).data;
    let n = 0;
    for (let i = 3; i < d.length; i += 4 * 13) if (d[i] > 40) n++;
    return n;
  }, []);

  useEffect(() => {
    const cv = ref.current;
    const ctx = cv?.getContext("2d", { willReadFrequently: true } as CanvasRenderingContext2DSettings);
    if (!cv || !ctx) return;
    cv.width = Math.round(size * dpr);
    cv.height = Math.round(size * dpr);
    const k = (size * dpr) / 100;
    ctx.setTransform(k, 0, 0, k, 0, 0);
    const path = new Path2D(SHAPES[look.shape]);
    const [dark, mid, light] = look.foil.stops;
    ctx.save();
    ctx.clip(path);
    const g = ctx.createLinearGradient(0, 0, 100, 100);
    [mid, light, mid, dark, mid, light, dark].forEach((c, i) => g.addColorStop(i / 6, c));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 100, 100);
    // crinkles
    ctx.lineJoin = "round";
    for (let i = 0; i < 26; i++) {
      ctx.beginPath();
      let x = 10 + rnd(look.seed * 11 + i) * 80;
      let y = 10 + rnd(look.seed * 17 + i * 3) * 80;
      ctx.moveTo(x, y);
      for (let s = 0; s < 4; s++) {
        x += (rnd(i * 7 + s + look.seed) - 0.5) * 22;
        y += (rnd(i * 13 + s * 5 + look.seed) - 0.5) * 22;
        ctx.lineTo(x, y);
      }
      ctx.strokeStyle = i % 2 ? "rgba(255,255,255,.55)" : "rgba(0,0,0,.16)";
      ctx.lineWidth = i % 2 ? 0.7 : 0.5;
      ctx.stroke();
    }
    // sheen + sparkles
    const sh = ctx.createRadialGradient(34, 28, 1, 34, 28, 26);
    sh.addColorStop(0, "rgba(255,255,255,.55)");
    sh.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = sh;
    ctx.fillRect(0, 0, 100, 100);
    ctx.fillStyle = "#fff";
    for (let i = 0; i < 40; i++) {
      ctx.globalAlpha = 0.3 + rnd(i + 99) * 0.6;
      ctx.fillRect(8 + rnd(i * 3 + 1) * 84, 8 + rnd(i * 5 + 2) * 84, 0.7, 0.7);
    }
    ctx.globalAlpha = 1;
    ctx.restore();
    ctx.strokeStyle = "rgba(255,255,255,.45)";
    ctx.lineWidth = 0.8;
    ctx.stroke(path);
    // embossed heart seal
    ctx.fillStyle = "rgba(0,0,0,.18)";
    ctx.fill(new Path2D("M50 58 C43 53 40 50 40 46 C40 43.5 42 42 44.5 42 C47 42 49 43.5 50 45.3 C51 43.5 53 42 55.5 42 C58 42 60 43.5 60 46 C60 50 57 53 50 58 Z"));
    initial.current = count();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- repaint only for a different piece
  }, [look.shape, look.foil, look.seed, size, dpr, count]);

  const finish = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    setGone(true);
    haptic([10, 30, 10]);
    sfx.crinkle(sound);
    const r = ref.current?.getBoundingClientRect();
    if (r) burst({ kind: "sparkles", emojis: ["✨", "⭐", "💫"], count: 14, spread: 0.2, origin: { x: (r.left + r.width / 2) / window.innerWidth, y: (r.top + r.height / 2) / window.innerHeight } });
    window.setTimeout(onPeeled, reduced ? 0 : 560);
  }, [onPeeled, reduced, sound]);

  useEffect(() => {
    const on = () => finish();
    window.addEventListener(UNWRAP_EVENT, on);
    return () => window.removeEventListener(UNWRAP_EVENT, on);
  }, [finish]);

  const progress = () => (initial.current ? 1 - count() / initial.current : 0);

  const erase = (pts: { x: number; y: number }[], width: number) => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalCompositeOperation = "destination-out";
    ctx.strokeStyle = "#000";
    ctx.globalAlpha = 1;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (const p of pts.slice(1)) ctx.lineTo(p.x, p.y);
    if (pts.length === 1) ctx.lineTo(pts[0].x + 0.1, pts[0].y + 0.1);
    ctx.stroke();
    ctx.restore();
  };

  const tear = (x: number, y: number) => {
    // a ragged chunk around the tap
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalCompositeOperation = "destination-out";
    ctx.fillStyle = "#000";
    ctx.globalAlpha = 1;
    ctx.beginPath();
    const R = size * 0.27;
    for (let i = 0; i <= 18; i++) {
      const a = (i / 18) * Math.PI * 2;
      const r = R * (0.7 + rnd(i + taps.current * 19) * 0.45);
      const px = x + Math.cos(a) * r;
      const py = y + Math.sin(a) * r;
      if (i) ctx.lineTo(px, py);
      else ctx.moveTo(px, py);
    }
    ctx.fill();
    ctx.restore();
  };

  const at = (e: React.PointerEvent) => {
    const r = ref.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  return (
    <canvas
      ref={ref}
      aria-hidden
      onPointerDown={(e) => {
        if (doneRef.current) return;
        (e.target as HTMLCanvasElement).setPointerCapture?.(e.pointerId);
        const p = at(e);
        down.current = { ...p, moved: false };
        last.current = p;
        erase([p], 30);
      }}
      onPointerMove={(e) => {
        if (!down.current || doneRef.current) return;
        const p = at(e);
        if (Math.hypot(p.x - down.current.x, p.y - down.current.y) > 8) down.current.moved = true;
        erase([last.current ?? p, p], 34);
        last.current = p;
        moves.current++;
        if (moves.current % 5 === 0) {
          if (moves.current % 15 === 0) sfx.crinkle(sound);
          if (progress() >= 0.5) finish();
        }
      }}
      onPointerUp={(e) => {
        if (!down.current || doneRef.current) return;
        const wasTap = !down.current.moved;
        down.current = null;
        last.current = null;
        if (wasTap) {
          const p = at(e);
          taps.current++;
          tear(p.x, p.y);
          haptic(8);
          sfx.crinkle(sound);
          if (taps.current >= 3) return finish();
        }
        if (progress() >= 0.5) finish();
      }}
      onPointerCancel={() => {
        down.current = null;
        last.current = null;
      }}
      style={
        {
          position: "absolute",
          inset: 0,
          width: size,
          height: size,
          touchAction: "none",
          cursor: "grab",
          transition: reduced ? "opacity .2s" : "transform .55s cubic-bezier(.5,0,.7,.4), opacity .55s ease",
          transform: gone && !reduced ? "translate(90px, -160px) scale(.12) rotate(260deg)" : "none",
          opacity: gone ? 0 : 1,
          pointerEvents: gone ? "none" : "auto",
          filter: "drop-shadow(0 4px 6px rgba(0,0,0,.25))",
        } as CSSProperties
      }
    />
  );
}

// ── gooey extras ─────────────────────────────────────────────────────────────
function GooeyDrips({ reduced }: { reduced: boolean }) {
  const drips = [
    { x: 69, y: 30, l: 26 },
    { x: 77, y: 33, l: 40 },
    { x: 62, y: 34, l: 16 },
  ];
  return (
    <svg aria-hidden viewBox="0 0 100 100" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible", pointerEvents: "none" }}>
      <defs>
        <filter id="ck-goo2">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="b" />
          <feColorMatrix in="b" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" />
        </filter>
      </defs>
      <g filter="url(#ck-goo2)" fill={GOOEY_FILLING}>
        <circle cx="72" cy="28" r="6.5" />
        {drips.map((d, i) => (
          <g key={i} className={reduced ? undefined : "ck-drip"} style={{ animationDelay: `${0.15 + i * 0.25}s` }}>
            <rect x={d.x - 2.2} y={d.y} width="4.4" height={d.l} rx="2.2" />
            <circle cx={d.x} cy={d.y + d.l} r="3.4" />
          </g>
        ))}
      </g>
      <g fill="#FFE2A8" opacity=".7">
        <ellipse cx="71" cy="26" rx="2.4" ry="1.3" />
      </g>
    </svg>
  );
}

function ReasonCard({ n, reason, flavour }: { n: number; reason: string; flavour: string }) {
  return (
    <div style={{ position: "relative", padding: "20px 20px 16px", borderRadius: 18, background: `linear-gradient(180deg, ${C.cream}, #F7E6CF)`, color: C.cocoa, boxShadow: "0 24px 40px -18px rgba(0,0,0,.7), inset 0 0 0 5px #FFF4E6, inset 0 0 0 6.5px rgba(166,122,42,.5)" }}>
      <span aria-hidden style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", padding: "3px 12px", borderRadius: 99, background: C.rasp, color: "#fff", font: `700 11px ${FONTS.ui}`, letterSpacing: ".14em" }}>
        REASON #{n}
      </span>
      <p style={{ margin: "4px 0 0", font: `italic 500 20px/1.45 ${FONTS.serif}`, overflowWrap: "anywhere" }}>{reason}</p>
      <p style={{ margin: "10px 0 0", font: `500 11.5px ${FONTS.ui}`, color: "#A0785E", letterSpacing: ".06em" }}>— {flavour} centre</p>
    </div>
  );
}

function GooeyCard({ reason, photo }: { reason: string; photo?: LovePhoto }) {
  return (
    <div style={{ position: "relative", padding: "18px 18px 16px", borderRadius: 20, background: `linear-gradient(180deg, ${C.cream}, #F7E6CF)`, color: C.cocoa, boxShadow: "0 24px 40px -18px rgba(0,0,0,.7), inset 0 0 0 5px #FFF4E6, inset 0 0 0 6.5px rgba(201,138,75,.6)" }}>
      <div style={{ position: "relative", width: "min(100%, 210px)", margin: "0 auto", aspectRatio: "4 / 5", borderRadius: 16, overflow: "hidden", boxShadow: "0 10px 20px -10px rgba(0,0,0,.5)" }}>
        {photo?.url ? (
          <CroppedPhoto photo={photo} alt={photo.caption || "A favourite memory"} />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "grid", placeItems: "center", background: "radial-gradient(circle at 50% 40%, #FFE2A8, #E0A04F)" }}>
            <svg viewBox="0 0 100 100" width="62%" aria-hidden>
              <path d={SHAPES.heart} fill={C.raspDeep} />
              <ellipse cx="34" cy="30" rx="10" ry="5" fill="#fff" opacity=".35" transform="rotate(-30 34 30)" />
            </svg>
          </div>
        )}
        {/* caramel dripping over the top edge */}
        <svg aria-hidden viewBox="0 0 100 30" preserveAspectRatio="none" style={{ position: "absolute", left: 0, top: 0, width: "100%", height: "22%" }}>
          <path
            d="M0 0 H100 V8 C96 8 95 12 95 16 C95 21 90 21 90 16 C90 11 86 9 82 10 C78 11 78 15 77 20 C76 27 70 27 70 20 C70 13 66 9 60 10 C54 11 56 15 52 15 C48 15 48 10 42 10 C36 10 37 22 32 24 C27 26 26 20 26 15 C26 11 22 9 16 10 C10 11 12 15 8 15 C4 15 4 9 0 9 Z"
            fill={GOOEY_FILLING}
          />
          <path d="M4 4 H40" stroke="#FFE2A8" strokeWidth="1.4" strokeLinecap="round" opacity=".8" />
        </svg>
      </div>
      {photo?.caption && <p style={{ margin: "8px 0 0", font: `600 17px ${FONTS.script}`, color: "#6E4A36" }}>{photo.caption}</p>}
      <p style={{ margin: "10px 0 0", font: `600 12px ${FONTS.ui}`, letterSpacing: ".12em", color: "#A0785E", textTransform: "uppercase" }}>This memory is the gooey centre of my heart</p>
      <p style={{ margin: "6px 0 0", font: `italic 500 19px/1.45 ${FONTS.serif}`, overflowWrap: "anywhere" }}>{reason}</p>
    </div>
  );
}
