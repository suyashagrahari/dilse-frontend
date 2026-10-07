"use client";

// ─── ClawMachine — coin in → lights chase → steer → GRAB → (near-miss) → win ─
//
// Drawn in a fixed 360×650 design space and scaled to fit (so every claw
// coordinate is plain px). Rigged with love: whatever the player does, the
// claw drifts onto *their* teddy on the way down. With `nearMiss` the first
// lift slips at the top ("Arre! Almost…"), the second always wins and drops
// the teddy down the prize chute.
//
// Controls: ◀ ▶ (hold to glide, tap to nudge), drag along the glass, ←/→ keys,
// GRAB (Space/Enter). The 15 s timer only adds tension — at 0 it grabs for
// you. Reduced motion: GRAB wins at once.

import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { AnimatePresence, animate, motion, useMotionValue, useSpring, useTransform, type MotionValue, type ValueAnimationTransition } from "framer-motion";
import { FONTS } from "../../_valentine/theme";
import { burst, haptic } from "../../_valentine/kit";
import { PlushPile, T, Teddy, type Fur, type ItemId } from "./teddyArt";
import { tsfx } from "./teddySfx";

const DW = 360;
const DH = 580;
const GLASS = { x: 36, y: 92, w: 288, h: 268 };
const RAIL_Y = 16;
const X_MIN = 34;
const X_MAX = 254;
const TEDDY_W = 72;
const TEDDY_H = 84;
const TEDDY_REST = { x: 186, y: GLASS.h - TEDDY_H - 6 };
const CHUTE_X = 46;
const CABLE_REST = 34;
const CABLE_GRAB = TEDDY_REST.y - RAIL_Y - 30;
const SLOT = { x: 240, y: 452, w: 76, h: 70 };

type Phase = "coin" | "waking" | "play" | "busy" | "won";

const run = (mv: MotionValue<number>, to: number, opts: ValueAnimationTransition<number> = {}) =>
  new Promise<void>((res) => {
    animate(mv, to, { ...opts, onComplete: () => res() });
  });
const wait = (ms: number) => new Promise((r) => window.setTimeout(r, ms));

export default function ClawMachine({
  recipientName,
  senderName,
  marquee,
  nearMiss,
  fur,
  worn,
  reduced,
  sound,
  sticker,
  onWin,
}: {
  recipientName: string;
  senderName: string;
  marquee: string;
  nearMiss: boolean;
  fur: Fur;
  worn: ItemId[];
  reduced: boolean;
  sound: boolean;
  sticker: (id: string, size: number, style?: CSSProperties) => ReactNode;
  onWin: () => void;
}) {
  // ── fit the 360-wide design into the column ───────────────────────────────
  const wrapRef = useRef<HTMLDivElement>(null);
  const [k, setK] = useState(1);
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const fit = () => {
      // keep GRAB clear of the editor dock / music player; tall tablets may grow the cabinet a little more
      const dock = parseFloat(getComputedStyle(el).getPropertyValue("--vw-dock-space")) || 0;
      const cap = window.innerWidth >= 768 ? 1.32 : 1.12;
      setK(Math.max(0.72, Math.min(cap, el.clientWidth / DW, (window.innerHeight - 250 - dock) / DH)));
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    window.addEventListener("resize", fit);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", fit);
    };
  }, []);

  const [phase, setPhase] = useState<Phase>("coin");
  const [tries, setTries] = useState(0);
  const [msg, setMsg] = useState<string>("");
  const [time, setTime] = useState(15);
  const [doorOpen, setDoorOpen] = useState(false);
  const [dir, setDir] = useState(0);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  // claw + teddy motion values (design px)
  const cx = useMotionValue(X_MIN + (X_MAX - X_MIN) * 0.35);
  const cable = useMotionValue(CABLE_REST);
  const open = useMotionValue(1);
  const swayTarget = useMotionValue(0);
  const sway = useSpring(swayTarget, { stiffness: 60, damping: 4, mass: 1 });
  const tX = useMotionValue(TEDDY_REST.x);
  const tY = useMotionValue(TEDDY_REST.y);
  const tRot = useMotionValue(0);
  const attached = useRef(false);

  useEffect(() => {
    const follow = () => {
      if (!attached.current) return;
      tX.set(cx.get() - TEDDY_W / 2);
      tY.set(RAIL_Y + cable.get() + 24);
      tRot.set(sway.get() * 0.8);
    };
    const a = cx.on("change", follow);
    const b = cable.on("change", follow);
    const c = sway.on("change", follow);
    return () => {
      a();
      b();
      c();
    };
  }, [cx, cable, sway, tX, tY, tRot]);

  const cableH = useTransform(cable, (v) => v);
  const carriageX = useTransform(cx, (v) => v - 20);
  const prongL = useTransform(open, [0, 1], [8, -26]);
  const prongR = useTransform(open, [0, 1], [-8, 26]);

  // ── coin ──────────────────────────────────────────────────────────────────
  const coinX = useMotionValue(0);
  const coinY = useMotionValue(0);
  const coinScaleX = useMotionValue(1);
  const coinOpacity = useMotionValue(1);
  const coinRef = useRef<HTMLDivElement>(null);
  const slotRef = useRef<HTMLDivElement>(null);
  const inserting = useRef(false);

  const wake = useCallback(async () => {
    setPhase("waking");
    setMsg("");
    haptic([10, 30, 10]);
    if (reduced) {
      setPhase("play");
      setMsg("Pick your teddy ◀ ▶ then GRAB!");
      return;
    }
    await wait(1300);
    if (!mounted.current) return;
    setPhase("play");
    setMsg("Move the claw ◀ ▶ then GRAB!");
  }, [reduced]);

  const insertCoin = useCallback(async () => {
    if (inserting.current) return;
    inserting.current = true;
    const c = coinRef.current?.getBoundingClientRect();
    const s = slotRef.current?.getBoundingClientRect();
    if (c && s && !reduced) {
      // fly to the slot (screen px → the coin's own transform space ÷ k)
      const dx = (s.left + s.width / 2 - (c.left + c.width / 2)) / k + coinX.get();
      const dy = (s.top + s.height / 2 - (c.top + c.height / 2)) / k + coinY.get();
      await Promise.all([run(coinX, dx, { type: "spring", stiffness: 260, damping: 22 }), run(coinY, dy, { type: "spring", stiffness: 260, damping: 22 })]);
      await run(coinScaleX, 0.18, { duration: 0.18 });
      tsfx.coin(sound);
      await Promise.all([run(coinY, dy + 18, { duration: 0.25, ease: "easeIn" }), run(coinOpacity, 0, { duration: 0.25 })]);
    } else {
      coinOpacity.set(0);
      tsfx.coin(sound);
    }
    void wake();
  }, [coinOpacity, coinScaleX, coinX, coinY, k, reduced, sound, wake]);

  // ── moving ────────────────────────────────────────────────────────────────
  const moveRaf = useRef<number | null>(null);
  const canPlay = phase === "play";
  const clampX = (v: number) => Math.max(X_MIN, Math.min(X_MAX, v));
  const startMove = (d: -1 | 1) => {
    if (!canPlay) return;
    setDir(d);
    swayTarget.set(-d * 12);
    cx.set(clampX(cx.get() + d * 10));
    tsfx.whirr(sound, 0.25);
    let last = performance.now();
    const step = (t: number) => {
      const dt = Math.min(48, t - last);
      last = t;
      cx.set(clampX(cx.get() + d * 0.17 * dt));
      moveRaf.current = requestAnimationFrame(step);
    };
    moveRaf.current = requestAnimationFrame(step);
  };
  const stopMove = () => {
    if (moveRaf.current != null) cancelAnimationFrame(moveRaf.current);
    moveRaf.current = null;
    setDir(0);
    swayTarget.set(0);
  };
  useEffect(() => () => stopMove(), []); // eslint-disable-line react-hooks/exhaustive-deps

  // drag along the glass
  const glassRef = useRef<HTMLDivElement>(null);
  const dragging = useRef<number | null>(null);
  const glassPointer = (e: React.PointerEvent) => {
    const r = glassRef.current!.getBoundingClientRect();
    return (e.clientX - r.left) / k;
  };

  // ── grab ──────────────────────────────────────────────────────────────────
  const busy = useRef(false);
  const grab = useCallback(async () => {
    if (busy.current || phase !== "play") return;
    busy.current = true;
    stopMove();
    setPhase("busy");
    setMsg("");
    haptic(12);
    const attempt = tries + 1;
    setTries(attempt);
    if (reduced) {
      setMsg("Got it! 🧸");
      setDoorOpen(true);
      tsfx.win(sound);
      await wait(400);
      onWin();
      return;
    }
    const targetX = TEDDY_REST.x + TEDDY_W / 2;
    tsfx.whirr(sound, 1);
    // descend; the claw "finds" the teddy on the way down
    await Promise.all([run(cable, CABLE_GRAB, { duration: 1.05, ease: [0.4, 0, 0.6, 1] }), run(cx, targetX, { duration: 1.05, ease: [0.3, 0, 0.3, 1] })]);
    tsfx.clack(sound);
    await run(open, 0, { duration: 0.28 });
    attached.current = true;
    tX.set(cx.get() - TEDDY_W / 2);
    haptic(10);
    await wait(150);
    tsfx.whirr(sound, 1);
    await run(cable, CABLE_REST, { duration: 1.0, ease: [0.4, 0, 0.6, 1] });

    if (nearMiss && attempt === 1) {
      // the dramatic slip
      swayTarget.set(16);
      await wait(180);
      swayTarget.set(0);
      await wait(260);
      attached.current = false;
      tsfx.aww(sound);
      haptic([30, 40, 30]);
      void run(open, 1, { duration: 0.3 });
      void animate(tRot, [0, -18, 10, 0], { duration: 0.9 });
      await run(tY, TEDDY_REST.y, { type: "spring", stiffness: 300, damping: 11, velocity: 200 });
      void run(tX, TEDDY_REST.x, { duration: 0.3 });
      if (!mounted.current) return;
      setMsg("Arre! Almost… one more try, on the house 💗");
      setTime(15);
      busy.current = false;
      setPhase("play");
      return;
    }

    // carry to the chute and drop
    tsfx.whirr(sound, 1);
    await run(cx, CHUTE_X, { duration: 1.1, ease: [0.4, 0, 0.4, 1] });
    swayTarget.set(-8);
    await wait(200);
    swayTarget.set(0);
    tsfx.clack(sound);
    await run(open, 1, { duration: 0.25 });
    attached.current = false;
    await run(tY, GLASS.h + 40, { duration: 0.42, ease: "easeIn" });
    tsfx.win(sound);
    setDoorOpen(true);
    setMsg("YOU WON! 🧸");
    haptic([20, 40, 60]);
    const r = slotRef.current?.getBoundingClientRect();
    burst({ kind: "confetti", colors: ["#FF8FB8", "#A8E6CF", "#FFF1B5", "#CDB4DB", "#7FE3FF"], origin: { x: 0.3, y: r ? r.top / window.innerHeight : 0.7 } });
    await wait(650);
    if (mounted.current) onWin();
  }, [cable, cx, nearMiss, onWin, open, phase, reduced, sound, swayTarget, tRot, tX, tY, tries]);

  // ── timer ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== "play" || reduced) return;
    if (time <= 0) {
      void grab();
      return;
    }
    const t = window.setTimeout(() => setTime((v) => v - 1), 1000);
    return () => window.clearTimeout(t);
  }, [phase, time, grab, reduced]);

  // ── keyboard ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== "play") return;
    const down = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (e.key === "ArrowLeft") startMove(-1);
      else if (e.key === "ArrowRight") startMove(1);
    };
    const up = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") stopMove();
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }); // eslint-disable-line react-hooks/exhaustive-deps

  const awake = phase !== "coin";
  const name = recipientName || "you";
  const initial = (senderName || "♥").trim().charAt(0).toUpperCase() || "♥";
  const line = marquee || `1 free play for ${name}`;

  const hint =
    phase === "coin" ? "Drag the heart coin into the slot 💗" : phase === "waking" ? "Ooh, it's waking up…" : msg || (phase === "play" ? "Move the claw ◀ ▶ then GRAB!" : "");

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ minHeight: 64, display: "grid", placeItems: "center", textAlign: "center", marginBottom: 6, padding: "0 8px" }}>
        <AnimatePresence mode="wait">
          <motion.p key={hint} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} aria-live="polite" style={{ margin: 0, font: `600 17px/1.35 ${FONTS.ui}`, color: msg.startsWith("Arre") ? T.butter : T.cream }}>
            {hint}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* the machine (scaled design space) */}
      <div ref={wrapRef} style={{ width: "min(100%, 400px)", height: DH * k, position: "relative" }}>
        <div style={{ position: "absolute", left: "50%", top: 0, width: DW, height: DH, marginLeft: -DW / 2, transform: `scale(${k})`, transformOrigin: "50% 0" }}>
          <Cabinet awake={awake} name={name} line={line} />

          {awake && (
            <motion.div initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 300, damping: 14, delay: 0.5 }} style={{ position: "absolute", right: -6, top: -30, zIndex: 8 }}>
              {sticker("t1-play", 76)}
            </motion.div>
          )}

          {/* glass */}
          <div
            ref={glassRef}
            onPointerDown={(e) => {
              if (!canPlay) return;
              (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
              dragging.current = glassPointer(e);
            }}
            onPointerMove={(e) => {
              if (dragging.current == null || !canPlay) return;
              const x = clampX(glassPointer(e));
              const d = x - cx.get();
              swayTarget.set(Math.max(-14, Math.min(14, -d * 1.2)));
              cx.set(x);
            }}
            onPointerUp={() => {
              dragging.current = null;
              swayTarget.set(0);
            }}
            onPointerCancel={() => {
              dragging.current = null;
              swayTarget.set(0);
            }}
            style={{
              position: "absolute",
              left: GLASS.x,
              top: GLASS.y,
              width: GLASS.w,
              height: GLASS.h,
              borderRadius: 16,
              overflow: "hidden",
              background: "radial-gradient(120% 80% at 50% 0%, #6B5A93 0%, #45386B 55%, #33284F 100%)",
              boxShadow: awake ? "inset 0 0 0 3px rgba(255,255,255,.35), inset 0 0 40px rgba(127,227,255,.35)" : "inset 0 0 0 3px rgba(255,255,255,.2)",
              filter: awake ? "none" : "brightness(.72) saturate(.8)",
              transition: "filter .8s, box-shadow .8s",
              touchAction: canPlay ? "none" : "auto",
              cursor: canPlay ? "ew-resize" : "default",
              zIndex: 2,
            }}
          >
            {/* back wall stars */}
            {[18, 64, 120, 170, 222, 262].map((x, i) => (
              <span key={x} className="td-twinkle" aria-hidden style={{ position: "absolute", left: x, top: 34 + ((i * 37) % 60), width: 4, height: 4, borderRadius: 4, background: "#FFF1B5", animationDelay: `${i * 0.4}s` }} />
            ))}
            {/* rail */}
            <div aria-hidden style={{ position: "absolute", left: 8, right: 8, top: 8, height: 8, borderRadius: 4, background: "linear-gradient(180deg,#E9E2F5,#A99BC7)" }} />
            {/* chute */}
            <div aria-hidden style={{ position: "absolute", left: 4, width: 84, top: GLASS.h - 86, height: 86, borderRadius: "10px 10px 0 0", background: "linear-gradient(180deg, rgba(255,255,255,.18), rgba(255,255,255,.06))", border: "2px solid rgba(255,255,255,.45)", borderBottom: 0, zIndex: 3 }}>
              <span style={{ position: "absolute", top: 6, left: 0, right: 0, textAlign: "center", font: `700 10px ${FONTS.ui}`, letterSpacing: ".18em", color: "rgba(255,255,255,.8)" }}>PRIZE</span>
            </div>
            {/* pile */}
            <div aria-hidden style={{ position: "absolute", left: 92, right: 2, bottom: -2, zIndex: 1 }}>
              <PlushPile />
            </div>
            {/* their teddy */}
            <motion.div aria-hidden style={{ position: "absolute", left: 0, top: 0, x: tX, y: tY, rotate: tRot, width: TEDDY_W, height: TEDDY_H, zIndex: 2, originX: 0.5, originY: 0 }}>
              <Teddy fur={fur} worn={worn} size={TEDDY_W} blink={false} />
              <span style={{ position: "absolute", left: "50%", top: -12, transform: "translateX(-50%)", padding: "1px 7px", borderRadius: 99, background: T.hot, color: "#fff", font: `700 9.5px ${FONTS.ui}`, whiteSpace: "nowrap", maxWidth: 110, overflow: "hidden", textOverflow: "ellipsis", boxShadow: awake ? "0 0 10px rgba(255,111,163,.8)" : "none" }}>
                ♥ {name}
              </span>
            </motion.div>
            {/* claw */}
            <motion.div aria-hidden style={{ position: "absolute", left: 0, top: RAIL_Y - 6, x: carriageX, width: 40, zIndex: 4 }}>
              <div style={{ width: 40, height: 12, borderRadius: 4, background: "linear-gradient(180deg,#FFF,#C9BEE0)", boxShadow: "0 2px 4px rgba(0,0,0,.3)" }} />
              <motion.div style={{ position: "absolute", left: 20, top: 10, rotate: sway, originX: 0, originY: 0 }}>
                <motion.div style={{ position: "absolute", left: -1.5, top: 0, width: 3, height: cableH, background: "linear-gradient(90deg,#9B92B5,#E9E2F5)" }} />
                <motion.div style={{ position: "absolute", left: -20, top: cableH, width: 40 }}>
                  <ClawHead prongL={prongL} prongR={prongR} awake={awake} />
                </motion.div>
              </motion.div>
            </motion.div>
            {/* glass reflections */}
            <div aria-hidden style={{ position: "absolute", inset: 0, background: "linear-gradient(115deg, transparent 0 18%, rgba(255,255,255,.14) 18% 24%, transparent 24% 30%, rgba(255,255,255,.08) 30% 33%, transparent 33%)", pointerEvents: "none", zIndex: 6 }} />
          </div>

          {/* control panel */}
          <Panel awake={awake} time={phase === "play" || phase === "busy" ? time : null} dir={dir} grabbing={phase === "busy"} />

          {/* prize door */}
          <div aria-hidden style={{ position: "absolute", left: 44, top: 448, width: 108, height: 74, borderRadius: 14, background: "#2A1F3D", boxShadow: "inset 0 6px 12px rgba(0,0,0,.6)", perspective: 400, zIndex: 3 }}>
            <motion.div
              animate={doorOpen ? { rotateX: -100 } : { rotateX: 0 }}
              transition={{ type: "spring", stiffness: 160, damping: 12 }}
              style={{ position: "absolute", inset: 0, borderRadius: 14, transformOrigin: "50% 0%", background: "linear-gradient(180deg,#E9E2F5,#BFB1DA)", border: "3px solid #A8E6CF", display: "grid", placeItems: "center", font: `700 12px ${FONTS.ui}`, letterSpacing: ".14em", color: "#5B4B7E" }}
            >
              PUSH ↓
            </motion.div>
          </div>

          {/* coin slot */}
          <div
            ref={slotRef}
            aria-hidden
            style={{ position: "absolute", left: SLOT.x, top: SLOT.y, width: SLOT.w, height: SLOT.h, borderRadius: 14, background: "linear-gradient(180deg,#5A4677,#3B2F57)", boxShadow: "inset 0 3px 8px rgba(0,0,0,.5)", display: "grid", placeItems: "center", zIndex: 3 }}
          >
            <div className={phase === "coin" ? "td-glow" : undefined} style={{ width: 34, height: 34, display: "grid", placeItems: "center", borderRadius: 12 }}>
              <svg viewBox="0 0 40 36" width="34" height="30">
                <path d="M20 34 C8 25 2 19 2 11 C2 5 7 1 12 1 C16 1 19 3 20 6 C21 3 24 1 28 1 C33 1 38 5 38 11 C38 19 32 25 20 34 Z" fill={awake ? "#FF8FB8" : "#FF6FA3"} opacity={awake ? 0.55 : 1} />
                <rect x="17" y="8" width="6" height="18" rx="3" fill="#2A1F3D" />
              </svg>
            </div>
            <span style={{ position: "absolute", bottom: 4, font: `700 8px ${FONTS.ui}`, letterSpacing: ".16em", color: "rgba(255,255,255,.7)" }}>INSERT ♥</span>
          </div>

          {/* the heart coin */}
          <motion.div
            ref={coinRef}
            drag={phase === "coin" && !reduced}
            dragMomentum={false}
            dragElastic={0}
            onDragEnd={() => {
              const c = coinRef.current?.getBoundingClientRect();
              const s = slotRef.current?.getBoundingClientRect();
              if (c && s) {
                const ccx = c.left + c.width / 2;
                const ccy = c.top + c.height / 2;
                if (ccx > s.left - 30 && ccx < s.right + 30 && ccy > s.top - 30 && ccy < s.bottom + 30) return void insertCoin();
              }
              void run(coinX, 0, { type: "spring", stiffness: 300, damping: 20 });
              void run(coinY, 0, { type: "spring", stiffness: 300, damping: 20 });
            }}
            onTap={() => phase === "coin" && void insertCoin()}
            onKeyDown={(e) => {
              if ((e.key === "Enter" || e.key === " ") && phase === "coin") {
                e.preventDefault();
                void insertCoin();
              }
            }}
            role="button"
            tabIndex={phase === "coin" ? 0 : -1}
            aria-label="Insert the heart coin"
            style={{ position: "absolute", left: 164, top: 454, width: 68, height: 68, x: coinX, y: coinY, scaleX: coinScaleX, opacity: coinOpacity, zIndex: 9, touchAction: "none", cursor: phase === "coin" ? "grab" : "default" }}
          >
            <div className={phase === "coin" && !reduced ? "td-float" : undefined} style={{ width: 68, height: 68 }}>
              <svg viewBox="0 0 68 68" width="68" height="68" aria-hidden style={{ filter: "drop-shadow(0 8px 10px rgba(0,0,0,.4))" }}>
                <defs>
                  <radialGradient id="td-coin" cx="35%" cy="30%" r="75%">
                    <stop offset="0" stopColor="#FFF6C9" />
                    <stop offset=".5" stopColor="#FFD25E" />
                    <stop offset="1" stopColor="#D49A1E" />
                  </radialGradient>
                </defs>
                <circle cx="34" cy="34" r="31" fill="url(#td-coin)" stroke="#C48A12" strokeWidth="2.5" />
                <circle cx="34" cy="34" r="24" fill="none" stroke="#FFF1B5" strokeWidth="1.5" strokeDasharray="3 3" />
                <path d="M34 50 C24 43 19 38 19 31 C19 26 23 23 27 23 C30 23 33 25 34 28 C35 25 38 23 41 23 C45 23 49 26 49 31 C49 38 44 43 34 50 Z" fill="#FF6FA3" />
                <text x="34" y="40" textAnchor="middle" fontFamily="system-ui, sans-serif" fontWeight="800" fontSize="14" fill="#fff">
                  {initial}
                </text>
              </svg>
            </div>
          </motion.div>
        </div>
      </div>

      {/* controls */}
      <div style={{ display: "grid", gridTemplateColumns: "64px 1fr 64px", gap: 12, width: "min(100%, 360px)", marginTop: 10, opacity: canPlay ? 1 : 0.45, transition: "opacity .3s" }}>
        <MoveButton label="Move left" disabled={!canPlay} onStart={() => startMove(-1)} onStop={stopMove}>
          ◀
        </MoveButton>
        <button
          type="button"
          onClick={() => void grab()}
          disabled={!canPlay}
          style={{ minHeight: 64, borderRadius: 22, border: 0, background: `radial-gradient(circle at 50% 35%, #FF9EC4, ${T.hot})`, color: "#fff", font: `800 22px ${FONTS.ui}`, letterSpacing: ".12em", boxShadow: "0 6px 0 #C2457A, 0 16px 26px -12px rgba(255,111,163,.8)", cursor: canPlay ? "pointer" : "default" }}
        >
          GRAB
        </button>
        <MoveButton label="Move right" disabled={!canPlay} onStart={() => startMove(1)} onStop={stopMove}>
          ▶
        </MoveButton>
      </div>
      <p style={{ margin: "10px 0 0", minHeight: 18, font: `400 12.5px ${FONTS.ui}`, color: T.lilac, textAlign: "center" }}>
        {canPlay ? "Hold ◀ ▶ or drag on the glass · GRAB when you're over your teddy" : phase === "coin" ? "or tap the coin" : ""}
      </p>
    </div>
  );
}

function MoveButton({ children, label, disabled, onStart, onStop }: { children: ReactNode; label: string; disabled: boolean; onStart: () => void; onStop: () => void }) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onPointerDown={(e) => {
        (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
        onStart();
      }}
      onPointerUp={onStop}
      onPointerCancel={onStop}
      onPointerLeave={onStop}
      onContextMenu={(e) => e.preventDefault()}
      style={{ minHeight: 64, borderRadius: 20, border: `2px solid ${T.mint}`, background: "rgba(168,230,207,.14)", color: T.mint, font: `700 22px ${FONTS.ui}`, cursor: disabled ? "default" : "pointer", touchAction: "none", userSelect: "none", WebkitUserSelect: "none" }}
    >
      {children}
    </button>
  );
}

function ClawHead({ prongL, prongR, awake }: { prongL: MotionValue<number>; prongR: MotionValue<number>; awake: boolean }) {
  return (
    <div style={{ position: "relative", width: 40, height: 46 }}>
      <div style={{ position: "absolute", left: 6, top: 0, width: 28, height: 16, borderRadius: "8px 8px 6px 6px", background: "linear-gradient(180deg,#FFFFFF,#C9BEE0)", boxShadow: "0 3px 6px rgba(0,0,0,.35)", zIndex: 2 }}>
        <span style={{ position: "absolute", left: 11, top: 5, width: 6, height: 6, borderRadius: 6, background: awake ? T.hot : "#8F84A8", boxShadow: awake ? `0 0 8px ${T.hot}` : "none" }} />
      </div>
      <motion.div style={{ position: "absolute", left: 6, top: 12, width: 8, height: 30, originX: 0.5, originY: 0, rotate: prongL }}>
        <Prong flip={false} />
      </motion.div>
      <motion.div style={{ position: "absolute", left: 26, top: 12, width: 8, height: 30, originX: 0.5, originY: 0, rotate: prongR }}>
        <Prong flip />
      </motion.div>
    </div>
  );
}

function Prong({ flip }: { flip: boolean }) {
  return (
    <svg viewBox="0 0 8 30" width="8" height="30" style={{ display: "block", overflow: "visible", transform: flip ? "scaleX(-1)" : undefined }}>
      <path d="M4 0 L4 18 Q4 28 10 30" stroke="#D9D0EC" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M3 1 L3 18" stroke="#fff" strokeWidth="1.2" opacity=".7" />
    </svg>
  );
}

function Cabinet({ awake, name, line }: { awake: boolean; name: string; line: string }) {
  const bulbs = 18;
  return (
    <>
      {/* body */}
      <div aria-hidden style={{ position: "absolute", left: 12, top: 64, width: 336, height: 486, borderRadius: "36px 36px 20px 20px", background: "linear-gradient(180deg,#FFD3E4 0%,#FFB8D2 55%,#F49DC0 100%)", border: `5px solid ${T.mint}`, boxShadow: "0 30px 50px -20px rgba(0,0,0,.65), inset 0 -10px 0 rgba(0,0,0,.08), inset 10px 0 0 rgba(255,255,255,.25)" }} />
      {/* side stripes */}
      <div aria-hidden style={{ position: "absolute", left: 22, top: 372, width: 316, height: 6, borderRadius: 3, background: "repeating-linear-gradient(90deg,#fff 0 10px, #FF8FB8 10px 20px)", opacity: 0.8 }} />
      {/* base */}
      <div aria-hidden style={{ position: "absolute", left: 24, top: 540, width: 312, height: 26, borderRadius: "0 0 14px 14px", background: "linear-gradient(180deg,#B78FD0,#8E6BB0)" }} />
      <div aria-hidden style={{ position: "absolute", left: 40, top: 562, width: 24, height: 10, borderRadius: 4, background: "#6E528E" }} />
      <div aria-hidden style={{ position: "absolute", left: 296, top: 562, width: 24, height: 10, borderRadius: 4, background: "#6E528E" }} />
      {/* marquee */}
      <div style={{ position: "absolute", left: 22, top: 0, width: 316, height: 82, borderRadius: 24, background: "linear-gradient(180deg,#3B2F57,#2D2440)", border: `4px solid ${T.hot}`, boxShadow: awake ? `0 0 26px rgba(255,111,163,.75), inset 0 0 18px rgba(255,111,163,.35)` : "0 10px 20px -10px rgba(0,0,0,.6)", overflow: "hidden", zIndex: 5, transition: "box-shadow .6s" }}>
        <div style={{ textAlign: "center", marginTop: 9, font: `800 25px/1 ${FONTS.ui}`, letterSpacing: ".08em", color: awake ? "#FFE3EE" : "#C9A8BA", textShadow: awake ? "0 0 6px #FF6FA3, 0 0 16px #FF6FA3" : "none", transition: "all .6s" }}>TEDDY CATCHER</div>
        <div style={{ position: "relative", marginTop: 8, height: 22, overflow: "hidden", borderTop: "1px solid rgba(255,255,255,.12)" }}>
          <div className={awake ? "td-marquee" : undefined} style={{ display: "flex", width: "max-content", whiteSpace: "nowrap", font: `600 13px/22px ${FONTS.ui}`, color: awake ? T.cyan : "#8F84A8", textShadow: awake ? "0 0 8px rgba(127,227,255,.8)" : "none" }}>
            {[0, 1].map((k) => (
              <span key={k} style={{ paddingRight: 24 }}>
                ✦ {line} ✦ for {name} ✦ {line} ✦ for {name}&nbsp;
              </span>
            ))}
          </div>
        </div>
      </div>
      {/* bulbs around the marquee */}
      {Array.from({ length: bulbs }, (_, i) => {
        const t = i / bulbs;
        // walk the rounded rect's perimeter roughly
        const per = 2 * (316 + 82);
        let d = t * per;
        let x = 22;
        let y = 0;
        if (d < 316) {
          x = 22 + d;
          y = 0;
        } else if ((d -= 316) < 82) {
          x = 338;
          y = d;
        } else if ((d -= 82) < 316) {
          x = 338 - d;
          y = 82;
        } else {
          d -= 316;
          x = 22;
          y = 82 - d;
        }
        const col = [T.butter, T.cyan, T.mint, "#fff"][i % 4];
        return (
          <span
            key={i}
            aria-hidden
            className={awake ? "td-bulb" : undefined}
            style={{ position: "absolute", left: x - 4, top: y - 4, width: 8, height: 8, borderRadius: 8, background: col, color: col, opacity: awake ? undefined : 0.35, animationDelay: `${(i % 6) * 0.16}s`, zIndex: 6 }}
          />
        );
      })}
    </>
  );
}

function Panel({ awake, time, dir, grabbing }: { awake: boolean; time: number | null; dir: number; grabbing: boolean }) {
  return (
    <div aria-hidden style={{ position: "absolute", left: 24, top: 382, width: 312, height: 54, borderRadius: 14, background: "linear-gradient(180deg,#5A4677,#3B2F57)", boxShadow: "inset 0 2px 0 rgba(255,255,255,.2), 0 6px 10px -4px rgba(0,0,0,.4)", zIndex: 3 }}>
      {/* joystick */}
      <div style={{ position: "absolute", left: 40, top: 30, width: 30, height: 10, borderRadius: "50%", background: "#2A1F3D" }} />
      <div style={{ position: "absolute", left: 52, top: 8, width: 6, height: 28, borderRadius: 3, background: "#D9D0EC", transformOrigin: "50% 100%", transform: `rotate(${dir * 22}deg)`, transition: "transform .15s" }}>
        <span style={{ position: "absolute", left: -8, top: -12, width: 22, height: 22, borderRadius: 22, background: `radial-gradient(circle at 35% 30%, #FFD3E4, ${T.hot})` }} />
      </div>
      {/* timer */}
      <div style={{ position: "absolute", left: 128, top: 11, width: 58, height: 32, borderRadius: 8, background: "#1A1426", display: "grid", placeItems: "center", font: `700 18px ui-monospace, monospace`, color: awake ? (time != null && time <= 5 ? T.hot : T.mint) : "#3B3350", textShadow: awake ? "0 0 8px currentColor" : "none" }}>
        {time != null ? String(Math.max(0, time)).padStart(2, "0") : awake ? "GO" : "--"}
      </div>
      {/* grab button art */}
      <div style={{ position: "absolute", right: 34, top: 9, width: 36, height: 36, borderRadius: 36, background: `radial-gradient(circle at 40% 35%, #FFB3CF, ${T.hot})`, boxShadow: grabbing ? "0 1px 0 #C2457A" : awake ? "0 4px 0 #C2457A, 0 0 14px rgba(255,111,163,.7)" : "0 4px 0 #C2457A", transform: grabbing ? "translateY(3px)" : "none", transition: "all .15s" }} />
    </div>
  );
}
