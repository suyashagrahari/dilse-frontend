"use client";

// ─── Valentine's Day: the grand gift box, the candlelit letter, the gallery ──

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useMotionValue, useTransform } from "framer-motion";
import { CroppedPhoto, PhotoLightbox, burst, haptic, useReducedMotion } from "../../_valentine/kit";
import { FONTS } from "../../_valentine/theme";
import type { LovePhoto } from "../../_valentine/types";
import { Candle, CreamEnvelope, GoldFrame, MonogramSeal, NIGHT, Starfield, initial } from "./valArt";
import { ghostBtn, goldBtn, headline, kicker } from "./ValOpening";

// ── 4. The grand gift box ────────────────────────────────────────────────────

export function GiftBox({ a, b, sticker, bottomPad, onOpened }: { a: string; b: string; sticker: ReactNode; bottomPad: number; onOpened: () => void }) {
  const reduced = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [risen, setRisen] = useState(false);
  const pull = useMotionValue(0);
  const p = useTransform(pull, [0, 150], [0, 1], { clamp: true });
  const loopScale = useTransform(p, [0, 1], [1, 0.35]);
  const loopL = useTransform(p, [0, 1], [-18, -70]);
  const loopR = useTransform(p, [0, 1], [18, 70]);
  const tailH = useTransform(pull, (v) => 128 + Math.max(0, v));
  const boxRef = useRef<HTMLDivElement>(null);

  const unwrap = () => {
    if (open) return;
    setOpen(true);
    haptic([20, 40, 20, 40, 60]);
    const r = boxRef.current?.getBoundingClientRect();
    const origin = r ? { x: (r.left + r.width / 2) / window.innerWidth, y: (r.top + r.height * 0.3) / window.innerHeight } : { x: 0.5, y: 0.45 };
    burst({ kind: "confetti", origin, colors: ["#F5C66B", "#FFE7A8", "#E8A598", "#FFB347", "#fff"], count: 80, spread: 0.55 });
    burst({ kind: "petals", origin, count: 18, emojis: ["🌹", "🥀", "✨"] });
    window.setTimeout(() => setRisen(true), reduced ? 50 : 650);
  };

  return (
    <div style={{ position: "relative", minHeight: "100dvh", display: "flex", flexDirection: "column", alignItems: "center", padding: `60px 16px ${bottomPad}px`, overflow: "hidden" }}>
      <Starfield count={40} style={{ opacity: 0.7 }} />
      <p style={{ ...kicker, position: "relative" }}>The grand gift</p>
      <h2 style={{ ...headline, position: "relative", marginTop: 6 }}>{open ? "For you, tonight" : "Pull the ribbon"}</h2>

      <div ref={boxRef} style={{ position: "relative", width: "min(74vw, 290px)", aspectRatio: "1 / 1.05", marginTop: 96 }}>
        {/* warm glow from inside */}
        <motion.span aria-hidden initial={false} animate={{ opacity: open ? 1 : 0, scale: open ? 1.2 : 0.6 }} transition={{ duration: 0.8 }} style={{ position: "absolute", left: "-30%", right: "-30%", top: "-50%", height: "120%", borderRadius: "50%", background: "radial-gradient(closest-side, rgba(255,215,140,.6), rgba(245,198,107,.2) 55%, transparent)", pointerEvents: "none" }} />

        {/* box inside (seen once the lid is off) */}
        <div aria-hidden style={{ position: "absolute", left: "6%", right: "6%", top: "33%", height: "12%", borderRadius: 6, background: "linear-gradient(#1C0410, #4A0A24)" }} />

        {/* the envelope inside — rises out */}
        <motion.button
          type="button"
          onClick={() => risen && onOpened()}
          tabIndex={risen ? 0 : -1}
          aria-label="Open the letter"
          initial={false}
          animate={risen ? { y: "-78%", rotate: -3, opacity: 1 } : { y: "0%", rotate: 0, opacity: open ? 1 : 0 }}
          transition={{ type: "spring", stiffness: 70, damping: 13 }}
          style={{ position: "absolute", left: "13%", right: "13%", top: "30%", padding: 0, border: 0, background: "transparent", cursor: risen ? "pointer" : "default", zIndex: 1, filter: "drop-shadow(0 10px 18px rgba(0,0,0,.5))" }}
        >
          <CreamEnvelope>
            <div style={{ position: "absolute", left: "50%", top: "58%", transform: "translate(-50%,-50%)" }}>
              <MonogramSeal a={initial(a)} b={initial(b)} size={52} />
            </div>
          </CreamEnvelope>
        </motion.button>

        {/* box front */}
        <svg viewBox="0 0 240 170" width="100%" style={{ position: "absolute", left: 0, bottom: 0, display: "block", zIndex: 2 }} aria-hidden>
          <defs>
            <linearGradient id="vn-box" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#A0153F" />
              <stop offset=".55" stopColor="#7A1035" />
              <stop offset="1" stopColor="#4A0820" />
            </linearGradient>
            <linearGradient id="vn-rib" x1="0" x2="1">
              <stop offset="0" stopColor="#B8862F" />
              <stop offset=".45" stopColor="#FBE3A6" />
              <stop offset="1" stopColor="#C48F2E" />
            </linearGradient>
            <pattern id="vn-hearts" width="26" height="26" patternUnits="userSpaceOnUse">
              <path d="M13 19 C8 15 6 13 6 10.5 C6 8.8 7.3 7.6 8.9 7.6 C10.4 7.6 11.6 8.4 13 9.8 C14.4 8.4 15.6 7.6 17.1 7.6 C18.7 7.6 20 8.8 20 10.5 C20 13 18 15 13 19 Z" fill="#fff" opacity=".07" />
            </pattern>
          </defs>
          <rect x="12" y="10" width="216" height="158" rx="8" fill="url(#vn-box)" />
          <rect x="12" y="10" width="216" height="158" rx="8" fill="url(#vn-hearts)" />
          <rect x="108" y="10" width="24" height="158" fill="url(#vn-rib)" />
          <rect x="12" y="10" width="216" height="10" fill="#000" opacity=".2" />
        </svg>

        {/* lid + bow */}
        <motion.div
          initial={false}
          animate={open ? (reduced ? { opacity: 0 } : { y: -170, x: 70, rotate: 28, opacity: 0 }) : { y: 0, x: 0, rotate: 0, opacity: 1 }}
          transition={{ duration: 0.9, ease: [0.3, 0.7, 0.4, 1] }}
          style={{ position: "absolute", left: "-3%", right: "-3%", top: "26%", zIndex: 3 }}
        >
          <svg viewBox="0 0 256 50" width="100%" style={{ display: "block", overflow: "visible" }} aria-hidden>
            <rect x="0" y="8" width="256" height="40" rx="8" fill="url(#vn-box)" />
            <rect x="0" y="8" width="256" height="40" rx="8" fill="url(#vn-hearts)" />
            <rect x="0" y="8" width="256" height="10" rx="6" fill="#fff" opacity=".1" />
            <rect x="116" y="8" width="24" height="40" fill="url(#vn-rib)" />
          </svg>
          {/* bow */}
          <div style={{ position: "absolute", left: "50%", top: -26, width: 0, height: 0 }}>
            {[-1, 1].map((side) => (
              <motion.svg
                key={side}
                viewBox="0 0 80 60"
                aria-hidden
                style={{ position: "absolute", width: 74, height: 56, top: -16, left: side < 0 ? -72 : -2, rotate: side < 0 ? loopL : loopR, scale: loopScale, transformOrigin: side < 0 ? "100% 60%" : "0% 60%" }}
              >
                <path d={side < 0 ? "M78 34 C60 4 18 -4 8 18 C0 36 30 52 78 38 Z" : "M2 34 C20 4 62 -4 72 18 C80 36 50 52 2 38 Z"} fill="url(#vn-rib)" stroke="#9C6A1B" strokeWidth="1.5" />
                <path d={side < 0 ? "M70 34 C54 16 28 12 20 22" : "M10 34 C26 16 52 12 60 22"} stroke="#9C6A1B" strokeOpacity=".5" fill="none" />
              </motion.svg>
            ))}
            <span aria-hidden style={{ position: "absolute", left: -13, top: -2, width: 26, height: 26, borderRadius: 8, background: "linear-gradient(135deg, #FBE3A6, #C48F2E)", border: "1.5px solid #9C6A1B", boxShadow: "0 2px 4px rgba(0,0,0,.3)" }} />
          </div>
        </motion.div>

        {/* the pull tail */}
        {!open && (
          <div style={{ position: "absolute", left: "66%", top: "24%", zIndex: 4 }}>
            <motion.div aria-hidden style={{ position: "absolute", left: -8, top: 0, width: 16, height: tailH, transformOrigin: "50% 0", rotate: 0, background: "linear-gradient(90deg, #B8862F, #FBE3A6 45%, #C48F2E)", borderRadius: "0 0 3px 3px", boxShadow: "1px 2px 4px rgba(0,0,0,.35)" }} />
            <motion.div
              drag={reduced ? false : "y"}
              dragConstraints={{ top: 0, bottom: 170 }}
              dragElastic={0.1}
              dragSnapToOrigin
              dragMomentum={false}
              onDrag={(_, info) => {
                pull.set(Math.max(0, info.offset.y));
                if (info.offset.y > 150) unwrap();
              }}
              onDragEnd={(_, info) => {
                if (info.offset.y > 105) unwrap();
                else pull.set(0);
              }}
              onTap={() => haptic(6)}
              role="button"
              tabIndex={0}
              aria-label="Pull the ribbon"
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && unwrap()}
              animate={reduced ? undefined : { rotate: [-2, 3, -2] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{ position: "absolute", left: 0, top: 120, width: 64, height: 64, marginLeft: -32, borderRadius: "50%", display: "grid", placeItems: "center", background: "radial-gradient(circle at 35% 30%, #FFF0C4, #F5C66B 55%, #C48F2E)", boxShadow: "0 8px 20px -6px rgba(0,0,0,.6), 0 0 0 4px rgba(245,198,107,.25)", cursor: "grab", touchAction: "none", font: `800 11px ${FONTS.ui}`, letterSpacing: ".14em", color: NIGHT.midnight }}
            >
              PULL
              <span aria-hidden style={{ position: "absolute", bottom: -24, font: `600 18px ${FONTS.ui}`, color: NIGHT.gold }}>↓</span>
            </motion.div>
          </div>
        )}

        {/* the sticker pops out with the envelope */}
        <AnimatePresence>
          {risen && (
            <motion.div initial={reduced ? false : { scale: 0, y: 40 }} animate={{ scale: 1, y: 0 }} transition={{ type: "spring", stiffness: 260, damping: 13, delay: 0.3 }} style={{ position: "absolute", right: -18, top: "-8%", width: 86, height: 86, zIndex: 5 }}>
              {sticker}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div style={{ minHeight: 70, display: "grid", placeItems: "center", marginTop: 54 }}>
        {!open ? (
          <span style={{ font: `600 14px ${FONTS.ui}`, color: "#E6CFE0" }}>Drag the gold tag down to untie the bow</span>
        ) : risen ? (
          <motion.span initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }} style={{ font: `italic 400 18px ${FONTS.serif}`, color: NIGHT.star }}>
            A letter, sealed just for you.
          </motion.span>
        ) : null}
      </div>
      <div style={{ flex: 1, minHeight: 10 }} />
      {risen ? (
        <button type="button" onClick={onOpened} style={goldBtn}>
          Break the seal 💌
        </button>
      ) : (
        <button type="button" onClick={unwrap} disabled={open} style={{ ...ghostBtn, opacity: open ? 0.4 : 1 }}>
          Untie it for me 🎀
        </button>
      )}
    </div>
  );
}

// ── 5. The letter: 3-fold unfold by candlelight ──────────────────────────────

function splitSignoff(body: string, sender: string): { body: string; signoff: string } {
  const first = sender.trim().split(/\s+/)[0]?.toLowerCase();
  const m = body.match(/\n([^\n]{1,40})\s*$/);
  if (first && m && m[1].toLowerCase().includes(first)) return { body: body.slice(0, m.index).replace(/\s+$/, ""), signoff: m[1].trim().replace(/^[-—–\s]+/, "") };
  return { body, signoff: "" };
}

export function CandleLetter({ letter, ps, a, b, bottomPad, onNext }: { letter: string; ps: string; a: string; b: string; bottomPad: number; onNext: () => void }) {
  const reduced = useReducedMotion();
  const [phase, setPhase] = useState<"sealed" | "unfold" | "read">("sealed");
  const [panelH, setPanelH] = useState(170);
  const [shownAll, setShownAll] = useState(false);

  useEffect(() => {
    setPanelH(Math.floor(Math.min(window.innerHeight * 0.62, 560) / 3));
  }, []);

  const { body, signoff } = useMemo(() => splitSignoff((letter || "").replace(/\r\n/g, "\n").trim(), b), [letter, b]);
  const lines = body.split("\n");
  const stagger = reduced ? 0 : Math.min(0.14, 2.6 / Math.max(1, lines.length));

  useEffect(() => {
    if (phase !== "read") return;
    const t = window.setTimeout(() => setShownAll(true), reduced ? 0 : (lines.length * stagger + 1.2) * 1000);
    return () => window.clearTimeout(t);
  }, [phase, lines.length, stagger, reduced]);

  const unseal = () => {
    if (phase !== "sealed") return;
    haptic([12, 30, 12]);
    setPhase("unfold");
    window.setTimeout(() => setPhase("read"), reduced ? 50 : 1700);
  };

  const H = panelH * 3;
  const paper: React.CSSProperties = { background: "linear-gradient(180deg, #FFF8EA, #FBEFD6)", boxShadow: "inset 0 0 40px rgba(196,143,46,.12)" };

  return (
    <div style={{ position: "relative", minHeight: "100dvh", display: "flex", flexDirection: "column", alignItems: "center", padding: `60px 14px ${bottomPad}px`, overflow: "hidden" }}>
      {/* candlelight on the room */}
      <div aria-hidden className="vn-flicker" style={{ position: "absolute", left: "-30%", bottom: "-10%", width: "110%", aspectRatio: "1", borderRadius: "50%", background: "radial-gradient(circle, rgba(255,179,71,.22), transparent 62%)", pointerEvents: "none" }} />
      <Starfield count={26} style={{ opacity: 0.5 }} />
      <p style={{ ...kicker, position: "relative" }}>By candlelight</p>
      <h2 style={{ ...headline, position: "relative", marginTop: 6, marginBottom: 18 }}>{phase === "sealed" ? "Sealed with our initials" : "Read it slowly"}</h2>

      {phase === "sealed" && (
        <motion.div initial={reduced ? false : { y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 120, damping: 16 }} style={{ position: "relative", width: "min(86vw, 340px)", marginTop: 40 }}>
          <CreamEnvelope style={{ filter: "drop-shadow(0 26px 30px rgba(0,0,0,.55))" }}>
            <motion.button
              type="button"
              onClick={unseal}
              aria-label="Break the seal"
              animate={reduced ? undefined : { scale: [1, 1.06, 1] }}
              transition={{ duration: 1.8, repeat: Infinity }}
              style={{ position: "absolute", left: "50%", top: "58%", width: 92, height: 92, margin: "-46px 0 0 -46px", padding: 0, border: 0, background: "transparent", cursor: "pointer", borderRadius: "50%" }}
            >
              <MonogramSeal a={initial(a)} b={initial(b)} size={92} />
            </motion.button>
          </CreamEnvelope>
          <p style={{ margin: "26px 0 0", textAlign: "center", font: `600 14px ${FONTS.ui}`, color: "#E6CFE0" }}>Tap the wax seal</p>
        </motion.div>
      )}

      {phase === "unfold" && (
        <div style={{ position: "relative", width: "min(100%, 440px)", height: H, perspective: 1800 }}>
          {/* middle panel */}
          <div style={{ position: "absolute", left: 0, right: 0, top: panelH, height: panelH, ...paper, borderTop: "1px solid rgba(160,110,40,.18)", borderBottom: "1px solid rgba(160,110,40,.18)" }} />
          {/* top panel folds down → up */}
          <motion.div
            initial={{ rotateX: -178 }}
            animate={{ rotateX: 0 }}
            transition={{ duration: 0.75, delay: 0.55, ease: [0.3, 0.6, 0.3, 1] }}
            style={{ position: "absolute", left: 0, right: 0, top: 0, height: panelH, transformOrigin: "50% 100%", transformStyle: "preserve-3d", borderRadius: "6px 6px 0 0", ...paper }}
          />
          {/* bottom panel folds up → down */}
          <motion.div
            initial={{ rotateX: 178 }}
            animate={{ rotateX: 0 }}
            transition={{ duration: 0.75, ease: [0.3, 0.6, 0.3, 1] }}
            style={{ position: "absolute", left: 0, right: 0, top: panelH * 2, height: panelH, transformOrigin: "50% 0%", transformStyle: "preserve-3d", borderRadius: "0 0 6px 6px", ...paper }}
          />
        </div>
      )}

      {phase === "read" && (
        <div style={{ position: "relative", width: "min(100%, 440px)" }}>
          <article
            style={{
              position: "relative",
              height: H,
              overflowY: "auto",
              padding: "26px 22px 30px",
              borderRadius: 6,
              ...paper,
              color: "#2A1240",
              font: `400 17px/1.7 ${FONTS.serif}`,
              textAlign: "left",
              boxShadow: "0 30px 60px -28px rgba(0,0,0,.8), inset 0 0 40px rgba(196,143,46,.12)",
              backgroundImage: "linear-gradient(180deg, transparent calc(33.33% - 1px), rgba(160,110,40,.12) 33.33%, transparent calc(33.33% + 1px), transparent calc(66.66% - 1px), rgba(160,110,40,.12) 66.66%, transparent calc(66.66% + 1px)), linear-gradient(180deg, #FFF8EA, #FBEFD6)",
              backgroundAttachment: "local",
              overscrollBehavior: "contain",
            }}
          >
            {lines.map((l, k) => (
              <motion.p
                key={k}
                initial={reduced ? false : { opacity: 0, y: 6, filter: "blur(3px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ delay: k * stagger, duration: 0.7 }}
                style={{ margin: 0, minHeight: l.trim() ? undefined : "0.9em", whiteSpace: "pre-wrap", overflowWrap: "anywhere", ...(k === 0 && l.length < 60 ? { font: `700 28px/1.3 ${FONTS.script}`, color: "#7A1035", marginBottom: 4 } : null) }}
              >
                {l}
              </motion.p>
            ))}
            <motion.div initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: lines.length * stagger + 0.3 }} style={{ marginTop: 14, textAlign: "right", font: `700 28px ${FONTS.script}`, color: "#2A1240", overflowWrap: "anywhere" }}>
              {signoff || `— ${b || "yours"}`}
            </motion.div>
            {ps.trim() && (
              <motion.p initial={reduced ? false : { opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: lines.length * stagger + 1.3 }} style={{ margin: "18px 0 0", font: `italic 400 16px/1.5 ${FONTS.serif}`, color: "#7A1035", overflowWrap: "anywhere" }}>
                {ps.trim().toLowerCase().startsWith("p.s") ? ps.trim() : `P.S. ${ps.trim()}`}
              </motion.p>
            )}
          </article>
          {/* candle-flicker vignette over the paper */}
          <div aria-hidden className="vn-flicker" style={{ position: "absolute", inset: 0, borderRadius: 6, background: "radial-gradient(90% 70% at 0% 100%, rgba(255,170,60,.22), transparent 60%), radial-gradient(120% 90% at 50% 50%, transparent 60%, rgba(60,20,10,.18))", pointerEvents: "none", mixBlendMode: "multiply" }} />
          <div style={{ position: "absolute", left: -6, bottom: -30, zIndex: 2 }}>
            <Candle size={34} />
          </div>
        </div>
      )}

      <div style={{ flex: 1, minHeight: 20 }} />
      {phase === "sealed" ? (
        <button type="button" onClick={unseal} style={goldBtn}>
          Open the letter 💌
        </button>
      ) : (
        <button type="button" onClick={onNext} disabled={phase !== "read"} style={{ ...goldBtn, marginTop: 24, opacity: phase === "read" ? (shownAll ? 1 : 0.75) : 0 }}>
          Walk through our gallery →
        </button>
      )}
    </div>
  );
}

// ── 6. Gallery of Us — a spotlight follows your finger ───────────────────────

function EmptyArt({ k }: { k: number }) {
  return (
    <svg viewBox="0 0 100 125" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" aria-hidden style={{ display: "block", background: k % 2 ? "#3A1030" : "#2A1240" }}>
      <circle cx="78" cy="26" r="10" fill="#FFE9B8" opacity=".85" />
      <path d="M0 100 Q30 80 50 96 T100 92 V125 H0 Z" fill="#12081F" />
      <path d="M50 74 C40 66 34 61 34 54 C34 49 38 46 42 46 C46 46 48 48 50 51 C52 48 54 46 58 46 C62 46 66 49 66 54 C66 61 60 66 50 74 Z" fill="#E8436E" />
      {[10, 30, 22, 60, 90].map((x, i) => (
        <circle key={i} cx={x} cy={12 + ((i * 17) % 40)} r="1.2" fill="#FFF6E5" />
      ))}
    </svg>
  );
}

export function GalleryWall({ photos, bottomPad, onNext }: { photos: LovePhoto[]; bottomPad: number; onNext: () => void }) {
  const reduced = useReducedMotion();
  const wallRef = useRef<HTMLDivElement>(null);
  const spotRef = useRef<HTMLDivElement>(null);
  const lastPointer = useRef(0);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const items: (LovePhoto | null)[] = photos.length ? photos : [null, null];

  useEffect(() => {
    const wall = wallRef.current;
    const spot = spotRef.current;
    if (!wall || !spot) return;
    const set = (x: number, y: number) => {
      spot.style.setProperty("--sx", `${x}px`);
      spot.style.setProperty("--sy", `${y}px`);
    };
    const r0 = wall.getBoundingClientRect();
    set(r0.width / 2, Math.min(r0.height * 0.2, 260));
    if (reduced) return;
    let raf = 0;
    const loop = (t: number) => {
      if (performance.now() - lastPointer.current > 2200) {
        const r = wall.getBoundingClientRect();
        const cy = Math.max(80, Math.min(r.height - 80, window.innerHeight * 0.5 - r.top));
        set(r.width / 2 + Math.sin(t / 1400) * r.width * 0.28, cy + Math.cos(t / 1900) * 60);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    const onMove = (e: PointerEvent) => {
      const r = wall.getBoundingClientRect();
      lastPointer.current = performance.now();
      set(e.clientX - r.left, e.clientY - r.top);
    };
    wall.addEventListener("pointermove", onMove);
    wall.addEventListener("pointerdown", onMove);
    return () => {
      cancelAnimationFrame(raf);
      wall.removeEventListener("pointermove", onMove);
      wall.removeEventListener("pointerdown", onMove);
    };
  }, [reduced]);

  return (
    <div style={{ position: "relative", minHeight: "100dvh", display: "flex", flexDirection: "column", alignItems: "center", padding: `60px 0 ${bottomPad}px` }}>
      <p style={{ ...kicker, position: "relative" }}>Now on display</p>
      <h2 style={{ ...headline, position: "relative", marginTop: 6 }}>The Gallery of Us</h2>
      <p style={{ position: "relative", margin: "6px 0 0", font: `400 14px ${FONTS.ui}`, color: "#E6CFE0" }}>Move your finger — the spotlight follows</p>

      <div
        ref={wallRef}
        style={{
          position: "relative",
          width: "min(100%, 520px)",
          marginTop: 18,
          padding: "34px 18px 40px",
          background: "radial-gradient(circle at 25% 25%, rgba(255,255,255,.035) 0 2px, transparent 3px) 0 0 / 28px 28px, radial-gradient(circle at 75% 75%, rgba(255,255,255,.035) 0 2px, transparent 3px) 0 0 / 28px 28px, linear-gradient(180deg, #4A0E26, #3A0A1E 60%, #2A0716)",
          boxShadow: "inset 0 18px 30px -12px rgba(0,0,0,.6)",
          touchAction: "pan-y",
        }}
      >
        {/* picture rail */}
        <div aria-hidden style={{ position: "absolute", left: 0, right: 0, top: 12, height: 6, background: "linear-gradient(#C48F2E, #7C561C)", opacity: 0.7 }} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "26px 16px", alignItems: "start" }}>
          {items.map((p, k) => (
            <motion.div key={k} initial={reduced ? false : { opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.6 }} style={{ marginTop: k % 2 ? 34 : 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <span aria-hidden style={{ width: 1, height: 16, background: "rgba(245,198,107,.5)", marginBottom: -8 }} />
              <button
                type="button"
                disabled={!p}
                onClick={() => p && setLightbox(k)}
                aria-label={p ? (p.caption ? `Open photo: ${p.caption}` : `Open photo ${k + 1}`) : "An empty frame"}
                style={{ width: "100%", padding: 0, border: 0, background: "transparent", cursor: p ? "zoom-in" : "default", transform: `rotate(${k % 3 === 1 ? 1.2 : k % 3 === 2 ? -1 : 0}deg)` }}
              >
                <GoldFrame ratio={k % 3 === 2 ? "1 / 1" : "4 / 5"}>{p ? <CroppedPhoto photo={p} eager={k < 2} /> : <EmptyArt k={k} />}</GoldFrame>
              </button>
              <span style={{ maxWidth: "100%", padding: "4px 10px", borderRadius: 3, background: "linear-gradient(180deg, #E8C06A, #B8862F)", color: "#2A1240", font: `600 11.5px/1.25 ${FONTS.ui}`, boxShadow: "0 2px 4px rgba(0,0,0,.4)", textAlign: "center", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflowWrap: "anywhere" }}>
                {p?.caption || (p ? `№ ${k + 1}` : "our next memory")}
              </span>
            </motion.div>
          ))}
          {/* to be continued */}
          <div style={{ gridColumn: "1 / -1", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, marginTop: 10 }}>
            <span aria-hidden style={{ width: 1, height: 16, background: "rgba(245,198,107,.5)", marginBottom: -8 }} />
            <GoldFrame ratio="16 / 9" style={{ width: "72%" }}>
              <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", background: "radial-gradient(circle, #2A1240, #12081F)" }}>
                <span style={{ font: `700 clamp(22px, 6vw, 30px) ${FONTS.script}`, color: NIGHT.gold }}>to be continued…</span>
              </div>
            </GoldFrame>
          </div>
        </div>
        {/* the spotlight */}
        <div
          ref={spotRef}
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background: reduced
              ? "linear-gradient(rgba(6,2,10,.15), rgba(6,2,10,.15))"
              : "radial-gradient(circle 190px at var(--sx, 50%) var(--sy, 200px), rgba(255,236,190,.14) 0%, rgba(255,236,190,.04) 45%, rgba(6,2,10,.78) 100%)",
          }}
        />
      </div>

      <button type="button" onClick={onNext} style={{ ...goldBtn, marginTop: 26 }}>
        One last question… 💘
      </button>
      <PhotoLightbox photos={photos} index={lightbox} onIndex={setLightbox} onClose={() => setLightbox(null)} />
    </div>
  );
}
