"use client";

// Mini-game: a glass jar of folded paper chits, one per promise. Tap the jar
// (or shake the phone where DeviceMotion is allowed) → it wobbles, a chit
// flies out and unfolds. The last chit is always the big promise (gold edge,
// sparkles). Opened chits collect in a row underneath and can be re-read.

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useAnimationControls } from "framer-motion";
import { FONTS, VW } from "../../../_valentine/theme";
import { burst, haptic, useReducedMotion } from "../../../_valentine/kit";
import { Btn, Hint, P, Title, rng, sfx } from "./ui";

const CHIT_COLORS = [P.petal, P.mint, P.butter, "#FFFFFF", P.lilac, "#FFD6C9"];

type DMEStatic = { requestPermission?: () => Promise<"granted" | "denied"> };

export default function PromiseJar({ chits, bigIndex, sticker, onDone }: { chits: string[]; bigIndex: number; sticker: React.ReactNode; onDone: () => void }) {
  const reduced = useReducedMotion();
  const jar = useAnimationControls();
  const [opened, setOpened] = useState(0);
  const [view, setView] = useState<number | null>(null);
  const [shakeOk, setShakeOk] = useState(false);
  /** A real sensor reading arrived (desktop browsers expose the API but never fire). */
  const [motionSeen, setMotionSeen] = useState(false);
  const busy = useRef(false);
  const asked = useRef(false);
  const total = chits.length;
  const all = opened >= total;

  // Stable pile layout inside the jar.
  const pile = useMemo(() => {
    const r = rng(total * 977 + 13);
    return chits.map((_, i) => {
      const row = Math.floor(i / 3);
      const col = i % 3;
      return {
        x: 70 + col * 38 + (r() - 0.5) * 12 - (row % 2) * 10,
        y: 228 - row * 26 + (r() - 0.5) * 8,
        rot: (r() - 0.5) * 70,
        color: i === bigIndex ? "#FFF4D6" : CHIT_COLORS[i % CHIT_COLORS.length],
      };
    });
  }, [chits, total, bigIndex]);

  const pop = () => {
    if (busy.current || opened >= total) return;
    busy.current = true;
    const n = opened;
    haptic(n === bigIndex ? [20, 50, 40] : 14);
    sfx.click(0.7 + n * 0.05);
    if (!reduced) void jar.start({ scaleX: [1, 1.07, 0.96, 1], scaleY: [1, 0.9, 1.05, 1], rotate: [0, -4, 3, 0], transition: { duration: 0.45 } });
    setOpened(n + 1);
    setView(n);
    if (n === bigIndex) {
      window.setTimeout(() => {
        sfx.chime();
        burst({ kind: "sparkles", count: 30, origin: { x: 0.5, y: 0.3 } });
      }, 650);
    }
    window.setTimeout(() => (busy.current = false), reduced ? 120 : 520);
  };

  // Shake to pop: Android fires devicemotion freely; iOS needs a permission
  // asked inside a tap (first jar tap asks once).
  const askMotion = () => {
    if (asked.current || typeof window === "undefined") return;
    asked.current = true;
    const DME = (window as unknown as { DeviceMotionEvent?: DMEStatic }).DeviceMotionEvent;
    if (!DME) return;
    if (typeof DME.requestPermission === "function") {
      DME.requestPermission()
        .then((s) => setShakeOk(s === "granted"))
        .catch(() => {});
    } else setShakeOk(true);
  };

  const popRef = useRef(pop);
  useEffect(() => {
    popRef.current = pop;
  });
  useEffect(() => {
    if (!shakeOk || all) return;
    let last = 0;
    const onMotion = (e: DeviceMotionEvent) => {
      const a = e.acceleration;
      const g = e.accelerationIncludingGravity;
      const mag = a && a.x != null ? Math.hypot(a.x ?? 0, a.y ?? 0, a.z ?? 0) : g ? Math.abs(Math.hypot(g.x ?? 0, g.y ?? 0, g.z ?? 0) - 9.8) : 0;
      if ((a && a.x != null) || (g && g.x != null)) setMotionSeen(true);
      const now = performance.now();
      if (mag > 14 && now - last > 800) {
        last = now;
        popRef.current();
      }
    };
    window.addEventListener("devicemotion", onMotion);
    return () => window.removeEventListener("devicemotion", onMotion);
  }, [shakeOk, all]);

  const current = view != null ? chits[view] : null;
  const isBig = view === bigIndex;

  return (
    <>
      <Title>Vaadon ka jaar</Title>
      <p style={{ margin: "-6px 0 0", font: `600 14px ${FONTS.ui}`, color: VW.inkSoft }} aria-live="polite">
        {opened}/{total} vaade khule
      </p>

      {/* the chit being read */}
      <div style={{ position: "relative", width: "min(100%, calc(360px * var(--vw-s, 1)))", minHeight: 170, display: "grid", placeItems: "center", perspective: 900 }}>
        <AnimatePresence mode="popLayout">
          {current != null ? (
            <motion.div
              key={view}
              initial={reduced ? { opacity: 0 } : { y: 190, scale: 0.18, rotate: -30, opacity: 0.6 }}
              animate={{ y: 0, scale: 1, rotate: isBig ? 0 : view! % 2 ? 1.6 : -1.6, opacity: 1 }}
              exit={reduced ? { opacity: 0 } : { y: -30, opacity: 0, scale: 0.9 }}
              transition={reduced ? { duration: 0.2 } : { type: "spring", stiffness: 210, damping: 19 }}
              style={{ width: "100%", transformStyle: "preserve-3d" }}
            >
              <motion.div
                initial={reduced ? false : { rotateX: -88, scaleY: 0.4 }}
                animate={{ rotateX: 0, scaleY: 1 }}
                transition={{ delay: reduced ? 0 : 0.28, type: "spring", stiffness: 160, damping: 15 }}
                style={{
                  transformOrigin: "50% 0%",
                  position: "relative",
                  padding: isBig ? "26px 22px 22px" : "22px 20px 20px",
                  borderRadius: 6,
                  background: isBig ? "linear-gradient(160deg, #FFF8E6, #FFEFC6)" : pile[view!]?.color === "#FFFFFF" ? "#FFFDF8" : `linear-gradient(160deg, #fff 0%, ${pile[view!]?.color ?? P.petal} 140%)`,
                  boxShadow: isBig ? `0 0 0 2px ${P.gold}, 0 0 0 6px #fff6dc, 0 22px 40px -18px rgba(142,31,74,.5)` : "0 18px 36px -18px rgba(142,31,74,.45)",
                  textAlign: "center",
                }}
              >
                {/* the fold creases */}
                <span aria-hidden style={{ position: "absolute", left: 10, right: 10, top: "50%", height: 1, background: "rgba(142,31,74,.12)" }} />
                <span aria-hidden style={{ position: "absolute", top: 8, bottom: 8, left: "50%", width: 1, background: "rgba(142,31,74,.07)" }} />
                <p style={{ margin: "0 0 8px", font: `700 11px ${FONTS.ui}`, letterSpacing: ".2em", color: isBig ? "#A97A1C" : VW.inkSoft }}>
                  {isBig ? "★ THE BIG ONE ★" : `VAADA #${view! + 1}`}
                </p>
                <p style={{ margin: 0, font: `${isBig ? 700 : 600} ${isBig ? 25 : 23}px/1.3 ${FONTS.script}`, color: P.berryDeep, overflowWrap: "anywhere", position: "relative" }}>{current}</p>
              </motion.div>
            </motion.div>
          ) : (
            <motion.p key="empty" exit={{ opacity: 0 }} style={{ margin: 0, maxWidth: 280, font: `italic 400 17px/1.5 ${FONTS.serif}`, color: VW.inkSoft }}>
              Har chit mein ek vaada hai. The last one is the big one ✨
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* the jar */}
      <div style={{ position: "relative", width: 220, height: 270, zoom: "var(--vw-s, 1)" }}>
        <div style={{ position: "absolute", right: -64, top: 18, zIndex: 2, pointerEvents: "none" }}>{sticker}</div>
        <motion.button
          type="button"
          onClick={() => {
            askMotion();
            pop();
          }}
          disabled={all}
          aria-label={all ? "The jar is empty" : `Tap the jar for promise ${opened + 1} of ${total}`}
          animate={jar}
          whileTap={all || reduced ? undefined : { scale: 0.96 }}
          style={{ position: "absolute", inset: 0, padding: 0, border: 0, background: "transparent", cursor: all ? "default" : "pointer", transformOrigin: "50% 100%", touchAction: "manipulation" }}
        >
          <svg viewBox="0 0 220 270" width="220" height="270" aria-hidden style={{ display: "block", overflow: "visible" }}>
            <defs>
              <linearGradient id="pj-glass" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#fff" stopOpacity=".55" />
                <stop offset=".35" stopColor="#fff" stopOpacity=".18" />
                <stop offset=".8" stopColor="#F7B6C8" stopOpacity=".18" />
                <stop offset="1" stopColor="#fff" stopOpacity=".45" />
              </linearGradient>
              <pattern id="pj-dots" width="12" height="12" patternUnits="userSpaceOnUse">
                <rect width="12" height="12" fill={P.rose} />
                <circle cx="3" cy="3" r="1.8" fill="#fff" opacity=".85" />
                <circle cx="9" cy="9" r="1.8" fill="#fff" opacity=".85" />
              </pattern>
            </defs>
            {/* shadow */}
            <ellipse cx="110" cy="262" rx="80" ry="8" fill="rgba(142,31,74,.16)" />
            {/* back of the glass */}
            <path d="M44 74 h132 q16 0 16 16 v136 q0 34 -34 34 h-96 q-34 0 -34 -34 v-136 q0 -16 16 -16 z" fill="rgba(255,255,255,.35)" />
            {/* chits inside */}
            {pile.map((c, i) =>
              i < opened ? null : (
                <motion.g key={i} initial={false} animate={{ opacity: 1 }} transform={`translate(${c.x} ${c.y}) rotate(${c.rot})`}>
                  <rect x="-19" y="-12.5" width="38" height="25" rx="3" fill={c.color} stroke={i === bigIndex ? P.gold : "rgba(142,31,74,.25)"} strokeWidth={i === bigIndex ? 2 : 1} />
                  <path d="M-19 -12.5 L0 2 L19 -12.5" fill="none" stroke="rgba(142,31,74,.22)" strokeWidth="1" />
                  {i === bigIndex && <path d="M0 6 C-4 3 -4 0 -2 -0.5 C-1 -0.8 0 0 0 0.8 C0 0 1 -0.8 2 -0.5 C4 0 4 3 0 6 Z" fill={P.rose} />}
                </motion.g>
              ),
            )}
            {/* front of the glass */}
            <path d="M44 74 h132 q16 0 16 16 v136 q0 34 -34 34 h-96 q-34 0 -34 -34 v-136 q0 -16 16 -16 z" fill="url(#pj-glass)" stroke="rgba(142,31,74,.35)" strokeWidth="2.5" />
            <path d="M42 100 q-2 60 4 120" fill="none" stroke="#fff" strokeWidth="7" strokeLinecap="round" opacity=".75" />
            <path d="M54 92 q-1 12 0 22" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity=".7" />
            <path d="M184 120 q2 50 -6 100" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity=".45" />
            {/* neck + rim */}
            <rect x="52" y="54" width="116" height="24" rx="8" fill="rgba(255,255,255,.5)" stroke="rgba(142,31,74,.35)" strokeWidth="2.5" />
            {/* fabric lid, tied with twine */}
            <path d="M40 58 C40 30 180 30 180 58 C186 60 188 70 180 72 C170 66 160 76 150 70 C140 76 130 66 120 72 C110 66 100 76 90 70 C80 76 70 66 60 72 C50 76 36 66 40 58 Z" fill="url(#pj-dots)" stroke={P.berry} strokeWidth="2" strokeLinejoin="round" />
            <path d="M44 62 C80 70 140 70 176 62" fill="none" stroke="#C99A5B" strokeWidth="4" />
            <path d="M150 64 c8 -12 22 -8 14 2 c-6 6 -12 2 -14 -2 z M150 64 c-2 14 6 22 10 30 M150 64 c4 10 14 14 18 22" fill="none" stroke="#C99A5B" strokeWidth="3" strokeLinecap="round" />
            {/* tag */}
            <g transform="translate(160 92) rotate(10)">
              <path d="M0 0 h40 l10 12 l-10 12 h-40 z" fill="#FFF8EC" stroke="#C99A5B" strokeWidth="1.5" />
              <circle cx="42" cy="12" r="2.5" fill="#C99A5B" />
              <text x="20" y="16" textAnchor="middle" style={{ font: `700 9.5px ${FONTS.ui}`, letterSpacing: ".08em" }} fill={P.berry}>
                VAADE
              </text>
            </g>
          </svg>
        </motion.button>
      </div>

      {/* opened chits — tap to re-read */}
      {opened > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 8, maxWidth: 340 }}>
          {chits.slice(0, opened).map((_, k) => (
            <motion.button
              key={k}
              type="button"
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: k % 2 ? 4 : -4 }}
              onClick={() => setView(k)}
              aria-label={`Read promise ${k + 1} again`}
              style={{
                width: 44,
                height: 44,
                borderRadius: 6,
                border: view === k ? `2px solid ${P.berry}` : "1px solid rgba(142,31,74,.2)",
                background: k === bigIndex ? "#FFF4D6" : pile[k]?.color,
                color: P.berry,
                font: `700 14px ${FONTS.ui}`,
                cursor: "pointer",
                boxShadow: "0 6px 12px -8px rgba(142,31,74,.5)",
              }}
            >
              {k === bigIndex ? "★" : k + 1}
            </motion.button>
          ))}
        </div>
      )}

      <div style={{ minHeight: 60, display: "grid", placeItems: "center" }}>
        {all ? (
          <Btn onClick={onDone}>Sign the Vachan Patra ✍️</Btn>
        ) : (
          <Hint>{motionSeen ? "Shake your phone or tap the jar 🫙" : "Tap the jar to pull out a vaada"}</Hint>
        )}
      </div>
    </>
  );
}
