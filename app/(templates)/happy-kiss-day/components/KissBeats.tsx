"use client";

// ─── Kiss Day beats: arrival, the ritual, MWAH, coupons, blow one back ───────

import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useAnimationControls } from "framer-motion";
import { ScratchCanvas, burst, haptic, useReducedMotion } from "../../_valentine/kit";
import { FONTS, VW } from "../../_valentine/theme";
import { BearCub, EnvelopeBack, EnvelopeFront, KissStamp, Lipstick, SHADES, SPOTS, WaxSeal, kissPalette, kissStampDataUrl, type KissSpot, type KissStyle, type ShadeId } from "./kissArt";

export const primaryBtn: React.CSSProperties = {
  minHeight: 54,
  padding: "14px 28px",
  borderRadius: 18,
  border: 0,
  background: VW.accent,
  color: VW.accentInk,
  font: `700 17px ${FONTS.ui}`,
  boxShadow: `0 5px 0 ${VW.accentDeep}, 0 16px 30px -14px rgba(0,0,0,.4)`,
  cursor: "pointer",
};

const kicker: React.CSSProperties = { margin: 0, font: `600 12px ${FONTS.ui}`, letterSpacing: ".2em", textTransform: "uppercase", color: VW.inkSoft, textAlign: "center" };
const title: React.CSSProperties = { margin: 0, font: `700 clamp(26px, 7.4vw, 34px)/1.12 ${FONTS.serif}`, color: VW.ink, textAlign: "center" };

// ── 1. Arrival: "1 unread kiss" ──────────────────────────────────────────────

export function Arrival({
  recipientName,
  petName,
  senderName,
  openingLine,
  kind,
  shade,
  sticker,
  bottomPad,
  onOpen,
}: {
  recipientName: string;
  petName: string;
  senderName: string;
  openingLine: string;
  kind: KissStyle;
  shade: ShadeId;
  sticker: ReactNode;
  bottomPad: number;
  onOpen: () => void;
}) {
  const reduced = useReducedMotion();
  const [phase, setPhase] = useState<"idle" | "wobble" | "crack">("idle");
  const sealCtl = useAnimationControls();

  const open = async () => {
    if (phase !== "idle") return;
    haptic([12, 40, 18]);
    setPhase("wobble");
    if (!reduced) await sealCtl.start({ rotate: [0, -16, 14, -10, 8, 0], scale: [1, 1.12, 0.92, 1.08, 1], transition: { duration: 0.55 } });
    setPhase("crack");
    window.setTimeout(onOpen, reduced ? 150 : 900);
  };

  return (
    <div style={{ minHeight: "calc(100dvh - var(--vw-dock-space, 0px))", display: "flex", flexDirection: "column", alignItems: "center", padding: `62px 18px ${bottomPad}px`, gap: 10 }}>
      {/* the notification */}
      <motion.button
        type="button"
        onClick={open}
        initial={reduced ? false : { y: -120, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 220, damping: 20, delay: 0.5 }}
        style={{ width: "min(100%, calc(370px * var(--vw-s, 1)))", display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 20, border: "1px solid rgba(255,255,255,.7)", background: "rgba(255,255,255,.72)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)", boxShadow: "0 18px 40px -22px rgba(59,10,30,.5)", textAlign: "left", cursor: "pointer" }}
      >
        <span aria-hidden style={{ flex: "none", width: 42, height: 42, borderRadius: 11, display: "grid", placeItems: "center", background: "linear-gradient(140deg, #FF7AA2, #E0245E)", boxShadow: "inset 0 1px 0 rgba(255,255,255,.5)" }}>
          <svg viewBox="0 0 24 24" width="24" height="24">
            <rect x="2.5" y="5.5" width="19" height="13" rx="2.5" fill="#fff" />
            <path d="M3 7 L12 13 L21 7" stroke="#E0245E" strokeWidth="1.8" fill="none" strokeLinejoin="round" />
          </svg>
        </span>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: "flex", justifyContent: "space-between", font: `600 11px ${FONTS.ui}`, letterSpacing: ".06em", color: "#8a5a6e", textTransform: "uppercase" }}>
            <span>Kiss Mail</span>
            <span style={{ textTransform: "none", letterSpacing: 0 }}>now</span>
          </span>
          <span style={{ display: "block", font: `700 15px ${FONTS.ui}`, color: "#2a0a18", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{senderName || "Someone special"}</span>
          <span style={{ display: "block", font: `400 14px ${FONTS.ui}`, color: "#5a3346", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            sent you 1 kiss {kind === "lipstick" ? "💋" : "😘"} · tap to open
          </span>
        </span>
        <span aria-hidden style={{ flex: "none", minWidth: 22, height: 22, borderRadius: 11, background: "#FF2D55", color: "#fff", font: `700 12px/22px ${FONTS.ui}`, textAlign: "center" }}>1</span>
      </motion.button>

      <p style={{ ...kicker, marginTop: 18 }}>You have 1 unread kiss</p>
      <h1 style={{ margin: 0, font: `700 clamp(44px, 13vw, 66px)/1.05 ${FONTS.script}`, color: VW.ink, textAlign: "center", overflowWrap: "anywhere", maxWidth: "100%" }}>{recipientName || "You"}</h1>
      {petName && <p style={{ margin: "-4px 0 0", font: `italic 400 18px ${FONTS.serif}`, color: VW.inkSoft, textAlign: "center", overflowWrap: "anywhere" }}>“{petName}”</p>}

      {/* the sealed envelope */}
      <div style={{ position: "relative", width: "min(80vw, calc(320px * var(--vw-s, 1)))", aspectRatio: "300 / 200", marginTop: 34 }}>
        <div aria-hidden style={{ position: "absolute", right: -6, top: -54, width: 86, height: 86, transform: "rotate(10deg)" }}>
          {sticker}
        </div>
        <motion.div
          role="button"
          tabIndex={0}
          aria-label="Open the envelope"
          onClick={open}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && open()}
          animate={reduced || phase !== "idle" ? undefined : { y: [0, -6, 0], rotate: [0, -1.2, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          style={{ position: "absolute", inset: 0, cursor: "pointer", filter: "drop-shadow(0 22px 26px rgba(157,23,77,.28))" }}
        >
          <div style={{ position: "absolute", inset: 0 }}>
            <EnvelopeBack open={phase === "crack"} />
          </div>
          <div style={{ position: "absolute", inset: 0 }}>
            <EnvelopeFront closed={phase !== "crack"} />
          </div>
          {openingLine && (
            <span style={{ position: "absolute", left: "8%", right: "8%", bottom: "9%", textAlign: "center", font: `700 clamp(15px, 4.4vw, 19px)/1.2 ${FONTS.script}`, color: "#8A1240", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
              {openingLine}
            </span>
          )}
          {/* the seal, in two halves so it can crack */}
          <div style={{ position: "absolute", left: "50%", top: "59%", width: 0, height: 0 }}>
            <motion.div animate={sealCtl} style={{ position: "absolute", left: -42, top: -42, width: 84, height: 84 }}>
              {(["l", "r"] as const).map((h) => (
                <motion.div
                  key={h}
                  animate={phase === "crack" && !reduced ? { x: h === "l" ? -46 : 46, y: 70, rotate: h === "l" ? -40 : 40, opacity: 0 } : { x: 0, y: 0, rotate: 0, opacity: phase === "crack" ? 0 : 1 }}
                  transition={{ duration: 0.75, ease: [0.3, 0.6, 0.4, 1] }}
                  style={{ position: "absolute", inset: 0, clipPath: h === "l" ? "polygon(0 0, 53% 0, 45% 40%, 55% 62%, 47% 100%, 0 100%)" : "polygon(52% 0, 100% 0, 100% 100%, 46% 100%, 54% 62%, 44% 40%)" }}
                >
                  <WaxSeal kind={kind} shade={shade} size={84} />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </div>

      <div style={{ flex: 1, minHeight: 14 }} />
      <button type="button" onClick={open} style={primaryBtn}>
        Break the seal {kind === "lipstick" ? "💋" : "🙈"}
      </button>
      <p style={{ margin: 0, font: `400 13px ${FONTS.ui}`, color: VW.inkSoft }}>from {senderName || "someone who loves you"}</p>
    </div>
  );
}

// ── 2a. Lipstick mode: pick your shade ───────────────────────────────────────

export function LipstickPicker({ initial, senderName, bottomPad, onPick }: { initial: ShadeId; senderName: string; bottomPad: number; onPick: (s: ShadeId) => void }) {
  const reduced = useReducedMotion();
  const [picked, setPicked] = useState<ShadeId | null>(null);
  const order: ShadeId[] = ["gulabi", "ruby", "berry"];
  const pick = (s: ShadeId) => {
    haptic(12);
    setPicked(s);
  };
  return (
    <div style={{ minHeight: "calc(100dvh - var(--vw-dock-space, 0px))", display: "flex", flexDirection: "column", alignItems: "center", padding: `64px 18px ${bottomPad}px`, gap: 10 }}>
      <p style={kicker}>Getting ready</p>
      <h2 style={title}>Pick your lipstick</h2>
      <p style={{ margin: 0, font: `400 15px/1.4 ${FONTS.ui}`, color: VW.inkSoft, textAlign: "center", maxWidth: 320 }}>Every kiss on this page will be in this shade.</p>

      <div style={{ position: "relative", width: "min(94vw, calc(380px * var(--vw-s, 1)))", marginTop: 26, padding: "0 10px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, alignItems: "end", position: "relative", zIndex: 1 }}>
          {order.map((s) => {
            const on = picked === s;
            return (
              <button
                key={s}
                type="button"
                onClick={() => pick(s)}
                aria-pressed={on}
                aria-label={`${SHADES[s].name}${s === initial ? ` — ${senderName || "their"} pick` : ""}`}
                style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "8px 4px 10px", border: 0, background: "transparent", cursor: "pointer" }}
              >
                <motion.div
                  animate={reduced ? undefined : { y: on ? -18 : 0, rotate: on ? 0 : s === "gulabi" ? -4 : s === "berry" ? 4 : 0 }}
                  transition={{ type: "spring", stiffness: 260, damping: 15 }}
                  style={{ width: "min(20vw, calc(74px * var(--vw-s, 1)))" }}
                >
                  <Lipstick shade={s} up={on ? 1 : 0} capOff={on} />
                </motion.div>
                <span style={{ font: `700 14px ${FONTS.ui}`, color: on ? SHADES[s].deep : VW.ink }}>{SHADES[s].name}</span>
                {s === initial && <span style={{ position: "absolute", top: -22, padding: "2px 8px", borderRadius: 99, background: "#fff", border: `1px solid ${VW.edge}`, font: `600 10.5px ${FONTS.ui}`, color: VW.inkSoft, whiteSpace: "nowrap" }}>{(senderName || "their").slice(0, 14)}&apos;s pick ✨</span>}
              </button>
            );
          })}
        </div>
        {/* vanity shelf */}
        <div aria-hidden style={{ height: 16, marginTop: -6, borderRadius: 8, background: "linear-gradient(180deg, rgba(255,255,255,.95), rgba(246,210,222,.9))", boxShadow: "0 16px 26px -14px rgba(157,23,77,.45)" }} />
      </div>

      <div style={{ minHeight: 64, display: "grid", placeItems: "center" }}>
        <AnimatePresence mode="wait">
          {picked && (
            <motion.div key={picked} initial={reduced ? false : { opacity: 0, scale: 0.6, rotate: -20 }} animate={{ opacity: 1, scale: 1, rotate: -8 }} transition={{ type: "spring", stiffness: 300, damping: 14 }} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <KissStamp kind="lipstick" shade={picked} size={58} />
              <span style={{ font: `700 22px ${FONTS.script}`, color: SHADES[picked].deep }}>{SHADES[picked].name} it is.</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div style={{ flex: 1 }} />
      <button type="button" onClick={() => onPick(picked ?? initial)} style={{ ...primaryBtn, opacity: picked ? 1 : 0.75 }}>
        {picked ? "Fill the kiss jar →" : `Use ${SHADES[initial].name} →`}
      </button>
    </div>
  );
}

// ── 2b. Cute mode: where does the first kiss go? ─────────────────────────────

export function FirstKiss({ shade, bottomPad, onDone }: { shade: ShadeId; bottomPad: number; onDone: () => void }) {
  const reduced = useReducedMotion();
  const [spot, setSpot] = useState<KissSpot | null>(null);
  const faceRef = useRef<HTMLDivElement>(null);
  const kiss = (s: KissSpot) => {
    haptic([10, 30, 10]);
    setSpot(s);
    const r = faceRef.current?.getBoundingClientRect();
    if (r) burst({ kind: "hearts", origin: { x: (r.left + (SPOTS[s].x / 200) * r.width) / window.innerWidth, y: (r.top + (SPOTS[s].y / 200) * r.height) / window.innerHeight }, count: 16, spread: 0.25, emojis: ["💗", "💕", "✨"] });
  };
  const fromPoint = (e: React.MouseEvent) => {
    const r = faceRef.current?.getBoundingClientRect();
    if (!r) return;
    const x = ((e.clientX - r.left) / r.width) * 200;
    const y = ((e.clientY - r.top) / r.height) * 200;
    let best: KissSpot = "cheek";
    let d = Infinity;
    (Object.keys(SPOTS) as KissSpot[]).forEach((k) => {
      const dd = Math.hypot(SPOTS[k].x - x, SPOTS[k].y - y) - (k === "cheek" ? 0 : 6);
      // Either cheek counts as "cheek".
      const dl = k === "cheek" ? Math.min(dd, Math.hypot(200 - SPOTS[k].x - x, SPOTS[k].y - y)) : dd;
      if (dl < d) {
        d = dl;
        best = k;
      }
    });
    kiss(best);
  };
  return (
    <div style={{ minHeight: "calc(100dvh - var(--vw-dock-space, 0px))", display: "flex", flexDirection: "column", alignItems: "center", padding: `64px 18px ${bottomPad}px`, gap: 10 }}>
      <p style={kicker}>Warm-up round</p>
      <h2 style={title}>Where does kiss #1 go?</h2>
      <p style={{ margin: 0, font: `400 15px/1.4 ${FONTS.ui}`, color: VW.inkSoft, textAlign: "center" }}>Tap a spot on this very patient bear.</p>
      <motion.div
        ref={faceRef}
        onClick={fromPoint}
        animate={reduced ? undefined : spot ? { scale: [1, 1.08, 0.97, 1], rotate: [0, -4, 3, 0] } : { y: [0, -5, 0] }}
        transition={spot ? { duration: 0.6 } : { duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
        key={spot ?? "idle"}
        style={{ width: "min(70vw, calc(270px * var(--vw-s, 1)))", aspectRatio: "1", marginTop: 14, cursor: "pointer", filter: "drop-shadow(0 20px 24px rgba(157,23,77,.22))" }}
      >
        <BearCub happy={!!spot} blush={spot ? 1 : 0.2} kissed={spot} kind="cute" shade={shade} />
      </motion.div>
      <div role="group" aria-label="Choose where to kiss" style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 8, marginTop: 6 }}>
        {(Object.keys(SPOTS) as KissSpot[]).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => kiss(k)}
            aria-pressed={spot === k}
            style={{ minHeight: 44, padding: "8px 16px", borderRadius: 999, border: `1.5px solid ${spot === k ? VW.accent : VW.edge}`, background: spot === k ? VW.soft : "rgba(255,255,255,.75)", color: VW.ink, font: `600 15px ${FONTS.ui}`, cursor: "pointer" }}
          >
            {SPOTS[k].emoji} {SPOTS[k].label}
          </button>
        ))}
      </div>
      <div style={{ minHeight: 52, display: "grid", placeItems: "center", maxWidth: 340 }}>
        <AnimatePresence mode="wait">
          {spot && (
            <motion.p key={spot} initial={reduced ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ margin: 0, font: `italic 400 17px/1.4 ${FONTS.serif}`, color: VW.ink, textAlign: "center" }}>
              {SPOTS[spot].line}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
      <div style={{ flex: 1 }} />
      <button type="button" onClick={onDone} style={{ ...primaryBtn, opacity: spot ? 1 : 0.75 }}>
        {spot ? "Now fill the kiss jar →" : "Skip to the kiss jar →"}
      </button>
    </div>
  );
}

// ── 4. MWAH — the giant kiss smacks the glass ────────────────────────────────

export function Mwah({ kind, shade, senderName, count, sticker, bottomPad, onNext }: { kind: KissStyle; shade: ShadeId; senderName: string; count: number; sticker: ReactNode; bottomPad: number; onNext: () => void }) {
  const reduced = useReducedMotion();
  const [smacked, setSmacked] = useState(reduced);
  const shake = useAnimationControls();
  const pal = kissPalette(kind, shade);

  useEffect(() => {
    if (reduced) return;
    const t = window.setTimeout(() => {
      setSmacked(true);
      haptic(60);
      burst({ kind: "confetti", colors: [pal.hex, pal.hi, "#FFE4EC", "#E8B04B", "#fff"], count: 70, origin: { x: 0.5, y: 0.42 } });
      void shake.start({ x: [0, -14, 12, -8, 6, -3, 0], y: [0, 6, -5, 3, -2, 0], transition: { duration: 0.5 } });
    }, 620);
    return () => window.clearTimeout(t);
  }, [reduced, pal.hex, pal.hi, shake]);

  return (
    <motion.div animate={shake} style={{ position: "relative", minHeight: "calc(100dvh - var(--vw-dock-space, 0px))", display: "flex", flexDirection: "column", alignItems: "center", padding: `64px 18px ${bottomPad}px`, overflow: "hidden" }}>
      {/* soft lens vignette */}
      <div aria-hidden className="vw-feather" style={{ position: "absolute", inset: 0, background: `radial-gradient(70% 50% at 50% 42%, transparent 40%, ${pal.hi}33 75%, ${pal.hex}22)`, pointerEvents: "none" }} />
      <p style={{ ...kicker, position: "relative" }}>Jar full · {count} kisses</p>

      <div style={{ position: "relative", width: "min(86vw, calc(380px * var(--vw-s, 1)))", aspectRatio: "1.1", marginTop: 10, display: "grid", placeItems: "center" }}>
        {/* MWAH lettering */}
        <motion.div
          initial={reduced ? false : { scale: 0.2, opacity: 0, rotate: -20 }}
          animate={smacked ? { scale: 1, opacity: 1, rotate: -9 } : { scale: 0.2, opacity: 0 }}
          transition={{ type: "spring", stiffness: 420, damping: 11, delay: reduced ? 0 : 0.08 }}
          style={{ position: "absolute", top: "2%", left: 0, right: 0, textAlign: "center", zIndex: 2, font: `900 clamp(64px, 21vw, 96px)/1 ${FONTS.ui}`, letterSpacing: "-.02em", color: pal.hex, WebkitTextStroke: "3px #fff", paintOrder: "stroke fill", textShadow: `0 6px 0 ${pal.deep}, 0 18px 30px rgba(59,10,30,.3)` }}
        >
          MWAH!
        </motion.div>
        {/* the giant kiss flying at the lens */}
        <motion.div
          initial={reduced ? false : { scale: 5, opacity: 0, filter: "blur(10px)", y: -40 }}
          animate={{ scale: 1, opacity: 1, filter: "blur(0px)", y: 30 }}
          transition={{ duration: 0.62, ease: [0.55, 0, 0.9, 0.4] }}
          style={{ position: "relative", width: "84%", display: "grid", placeItems: "center" }}
        >
          <motion.div
            animate={smacked && !reduced ? { scaleX: [1, 1.18, 0.95, 1], scaleY: [1, 0.82, 1.05, 1] } : undefined}
            transition={{ duration: 0.45 }}
            style={{ width: "100%", display: "grid", placeItems: "center", filter: `drop-shadow(0 18px 24px ${pal.deep}55)` }}
          >
            <KissStamp kind={kind} shade={shade} size={300} style={{ width: "100%", height: "auto" }} />
          </motion.div>
          {/* the shine streak across the glass, masked to the kiss itself */}
          {smacked && !reduced && (
            <span aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none", WebkitMaskImage: `url("${kissStampDataUrl(kind, shade)}")`, maskImage: `url("${kissStampDataUrl(kind, shade)}")`, WebkitMaskSize: "100% 100%", maskSize: "100% 100%", WebkitMaskRepeat: "no-repeat", maskRepeat: "no-repeat", overflow: "hidden" }}>
              <motion.span
                initial={{ x: "-160%", skewX: -20 }}
                animate={{ x: "420%", skewX: -20 }}
                transition={{ duration: 0.85, delay: 0.12, ease: "easeInOut" }}
                style={{ position: "absolute", top: "-20%", bottom: "-20%", left: 0, width: "22%", background: "linear-gradient(90deg, transparent, rgba(255,255,255,.85) 50%, transparent)" }}
              />
            </span>
          )}
        </motion.div>
        {/* glass glints */}
        {smacked && (
          <motion.svg aria-hidden viewBox="0 0 100 100" initial={reduced ? false : { opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} style={{ position: "absolute", right: "4%", top: "26%", width: 54, height: 54 }}>
            <path d="M50 4 L56 44 L96 50 L56 56 L50 96 L44 56 L4 50 L44 44 Z" fill="#fff" />
          </motion.svg>
        )}
      </div>

      <AnimatePresence>
        {smacked && (
          <motion.div initial={reduced ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: reduced ? 0 : 0.5 }} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, position: "relative" }}>
            <div style={{ width: 92, height: 92 }}>{sticker}</div>
            <p style={{ margin: 0, font: `700 24px ${FONTS.serif}`, color: VW.ink }}>Kiss delivered.</p>
            <p style={{ margin: 0, font: `700 26px ${FONTS.script}`, color: VW.accentDeep, maxWidth: 320, textAlign: "center", overflowWrap: "anywhere" }}>Signed: {senderName || "yours"}</p>
          </motion.div>
        )}
      </AnimatePresence>
      <div style={{ flex: 1, minHeight: 16 }} />
      <button type="button" onClick={onNext} style={{ ...primaryBtn, position: "relative", opacity: smacked ? 1 : 0 }}>
        Open your letter 💌
      </button>
    </motion.div>
  );
}

// ── 7. Kiss coupons (scratch) ────────────────────────────────────────────────

export function Coupons({ coupons, kind, shade, senderName, bottomPad, onNext }: { coupons: string[]; kind: KissStyle; shade: ShadeId; senderName: string; bottomPad: number; onNext: () => void }) {
  const reduced = useReducedMotion();
  const [open, setOpen] = useState<boolean[]>(() => coupons.map(() => false));
  const all = open.every(Boolean);
  const pal = kissPalette(kind, shade);
  return (
    <div style={{ minHeight: "calc(100dvh - var(--vw-dock-space, 0px))", display: "flex", flexDirection: "column", alignItems: "center", padding: `64px 16px ${bottomPad}px`, gap: 10 }}>
      <p style={kicker}>Redeemable in real life</p>
      <h2 style={title}>Your kiss coupons</h2>
      <p style={{ margin: 0, font: `400 15px ${FONTS.ui}`, color: VW.inkSoft, textAlign: "center" }}>Scratch each one. Screenshot. Redeem with {senderName || "them"}.</p>
      <div style={{ display: "grid", gap: 14, width: "min(100%, calc(400px * var(--vw-s, 1)))", marginTop: 10 }}>
        {coupons.map((c, k) => (
          <motion.div
            key={k}
            initial={reduced ? false : { opacity: 0, y: 20, rotate: k % 2 ? 1.5 : -1.5 }}
            animate={{ opacity: 1, y: 0, rotate: k % 2 ? 0.8 : -0.8 }}
            transition={{ delay: 0.08 * k, type: "spring", stiffness: 200, damping: 20 }}
            style={{
              position: "relative",
              display: "grid",
              gridTemplateColumns: "74px 1fr",
              minHeight: 92,
              borderRadius: 14,
              background: "#FFF8F1",
              boxShadow: "0 14px 28px -18px rgba(59,10,30,.55)",
              border: `1px solid ${VW.edge}`,
              WebkitMaskImage: "radial-gradient(circle at 74px 0, transparent 9px, #000 9.5px), radial-gradient(circle at 74px 100%, transparent 9px, #000 9.5px)",
              WebkitMaskComposite: "source-in",
              maskImage: "radial-gradient(circle at 74px 0, transparent 9px, #000 9.5px), radial-gradient(circle at 74px 100%, transparent 9px, #000 9.5px)",
              maskComposite: "intersect",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, borderRight: `2px dashed ${VW.edge}`, background: `linear-gradient(160deg, ${pal.hi}55, ${pal.hex}22)` }}>
              <span style={{ font: `700 9.5px ${FONTS.ui}`, letterSpacing: ".18em", color: pal.deep }}>KISS</span>
              <span style={{ font: `700 9.5px ${FONTS.ui}`, letterSpacing: ".18em", color: pal.deep }}>COUPON</span>
              <span style={{ font: `700 20px ${FONTS.serif}`, color: pal.deep }}>№{String(k + 1).padStart(2, "0")}</span>
            </div>
            <div style={{ padding: 8, position: "relative" }}>
              <ScratchCanvas
                height={76}
                radius={10}
                cover={["#F7A9C1", "#FFE6EE"]}
                label={kind === "lipstick" ? "Scratch me 💋" : "Scratch me 😚"}
                labelColor="rgba(120,20,60,.75)"
                brush={20}
                revealLinkAfterMs={3000}
                onReveal={() => setOpen((o) => o.map((v, i) => (i === k ? true : v)))}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 10px", width: "100%" }}>
                  <span style={{ flex: 1, font: `600 16px/1.3 ${FONTS.ui}`, color: VW.paperInk, overflowWrap: "anywhere" }}>{c}</span>
                  <KissStamp kind={kind} shade={shade} size={36} face={false} style={{ transform: "rotate(-14deg)", flex: "none" }} />
                </div>
              </ScratchCanvas>
              {open[k] && (
                <motion.span
                  initial={reduced ? false : { scale: 2, opacity: 0, rotate: -30 }}
                  animate={{ scale: 1, opacity: 0.9, rotate: -12 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                  style={{ position: "absolute", right: 6, top: -10, padding: "2px 8px", border: `2px solid ${pal.deep}`, borderRadius: 6, color: pal.deep, font: `800 10px ${FONTS.ui}`, letterSpacing: ".12em", background: "#FFF8F1" }}
                >
                  VALID FOREVER
                </motion.span>
              )}
            </div>
          </motion.div>
        ))}
      </div>
      <div style={{ flex: 1, minHeight: 10 }} />
      <button type="button" onClick={onNext} style={{ ...primaryBtn, opacity: all ? 1 : 0.8 }}>
        {all ? "Your turn now 😘" : "Next →"}
      </button>
    </div>
  );
}

// ── 8. Your turn: hold + swipe up to blow one back ───────────────────────────

export function BlowBack({ kind, shade, senderName, sticker, bottomPad, onSent }: { kind: KissStyle; shade: ShadeId; senderName: string; sticker: ReactNode; bottomPad: number; onSent: () => void }) {
  const reduced = useReducedMotion();
  const [holding, setHolding] = useState(false);
  const [charge, setCharge] = useState(0);
  const [sent, setSent] = useState(false);
  const [hint, setHint] = useState(false);
  const start = useRef<{ y: number; t: number } | null>(null);
  const raf = useRef<number | null>(null);
  const btnRef = useRef<HTMLDivElement>(null);
  const pal = kissPalette(kind, shade);

  useEffect(() => () => {
    if (raf.current) cancelAnimationFrame(raf.current);
  }, []);

  const send = () => {
    if (sent) return;
    setSent(true);
    setHolding(false);
    haptic([20, 40, 60]);
    const r = btnRef.current?.getBoundingClientRect();
    burst({ kind: "hearts", origin: r ? { x: (r.left + r.width / 2) / window.innerWidth, y: (r.top + r.height / 2) / window.innerHeight } : { x: 0.5, y: 0.6 }, count: 30, emojis: kind === "lipstick" ? ["💋", "💗", "💕"] : ["💗", "😚", "💕"] });
    window.setTimeout(onSent, reduced ? 600 : 1700);
  };

  const tick = () => {
    if (!start.current) return;
    const c = Math.min(1, (performance.now() - start.current.t) / 600);
    setCharge(c);
    if (c < 1) raf.current = requestAnimationFrame(tick);
  };

  return (
    <div style={{ minHeight: "calc(100dvh - var(--vw-dock-space, 0px))", display: "flex", flexDirection: "column", alignItems: "center", padding: `64px 18px ${bottomPad}px`, gap: 8, overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <h2 style={{ ...title, fontSize: "clamp(32px, 9vw, 42px)" }}>Your turn</h2>
        <div style={{ width: 74, height: 74 }}>{sticker}</div>
      </div>
      <p style={{ margin: 0, font: `400 16px/1.45 ${FONTS.ui}`, color: VW.inkSoft, textAlign: "center", maxWidth: 320 }}>
        {sent ? `On its way to ${senderName || "them"}…` : <>Hold the kiss, then <b style={{ color: VW.ink }}>swipe up</b> to blow it back to {senderName || "them"}.</>}
      </p>

      <div style={{ flex: 1, minHeight: 30 }} />
      <div style={{ position: "relative", width: 210, height: 210 }}>
        {/* charge ring */}
        <svg aria-hidden viewBox="0 0 100 100" style={{ position: "absolute", inset: -10, width: 230, height: 230, transform: "rotate(-90deg)" }}>
          <circle cx="50" cy="50" r="46" fill="none" stroke={VW.edge} strokeWidth="3" />
          <circle cx="50" cy="50" r="46" fill="none" stroke={pal.hex} strokeWidth="3.5" strokeLinecap="round" strokeDasharray={`${charge * 289} 289`} />
        </svg>
        <motion.div
          ref={btnRef}
          role="button"
          tabIndex={0}
          aria-label="Blow a kiss back"
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && send()}
          onPointerDown={(e) => {
            if (sent) return;
            (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
            start.current = { y: e.clientY, t: performance.now() };
            setHolding(true);
            setHint(false);
            haptic(8);
            raf.current = requestAnimationFrame(tick);
          }}
          onPointerMove={(e) => {
            if (!start.current || sent) return;
            if (start.current.y - e.clientY > 60) send();
          }}
          onPointerUp={() => {
            const s = start.current;
            start.current = null;
            if (raf.current) cancelAnimationFrame(raf.current);
            if (sent || !s) return;
            if (performance.now() - s.t >= 600) send();
            else {
              setHolding(false);
              setCharge(0);
              setHint(true);
            }
          }}
          onPointerCancel={() => {
            start.current = null;
            setHolding(false);
            setCharge(0);
          }}
          animate={
            sent
              ? reduced
                ? { opacity: 0 }
                : { y: -900, scale: 0.45, rotate: 25, opacity: [1, 1, 0] }
              : holding
                ? { scale: 1.12, y: 0 }
                : reduced
                  ? { scale: 1 }
                  : { scale: [1, 1.05, 1], y: 0 }
          }
          transition={sent ? { duration: 1.2, ease: [0.4, 0, 0.6, 1] } : holding ? { type: "spring", stiffness: 300, damping: 14 } : { duration: 1.6, repeat: Infinity }}
          style={{ position: "absolute", inset: 0, borderRadius: "50%", display: "grid", placeItems: "center", background: `radial-gradient(circle at 35% 30%, #fff, ${pal.hi}66 60%, ${pal.hex}44)`, boxShadow: holding ? `0 0 0 10px ${pal.hex}22, 0 0 60px ${pal.hex}88` : `0 20px 40px -20px ${pal.deep}`, touchAction: "none", cursor: "grab", userSelect: "none" }}
        >
          <KissStamp kind={kind} shade={shade} size={140} />
        </motion.div>
      </div>
      <div style={{ minHeight: 44, display: "grid", placeItems: "center" }}>
        {!sent && (
          <motion.span animate={reduced ? undefined : { y: [0, -6, 0] }} transition={{ duration: 1.2, repeat: Infinity }} style={{ font: `600 14px ${FONTS.ui}`, color: hint ? VW.accent : VW.inkSoft }}>
            {hint ? "Hold a little longer, then swipe ↑" : "↑ hold + swipe up"}
          </motion.span>
        )}
      </div>
      <div style={{ flex: 1, minHeight: 10 }} />
      {!sent && (
        <button type="button" onClick={send} style={{ minHeight: 48, padding: "10px 22px", borderRadius: 999, border: `1.5px solid ${VW.edge}`, background: "rgba(255,255,255,.75)", color: VW.ink, font: `600 15px ${FONTS.ui}`, cursor: "pointer" }}>
          Just send it {kind === "lipstick" ? "💋" : "😚"}
        </button>
      )}
    </div>
  );
}
