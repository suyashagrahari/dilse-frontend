"use client";

// ─── Valentine's Day: the question, the lantern release, the night keepsake ──

import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CroppedPhoto, EndingActions, RunawayNo, burst, haptic, useReducedMotion, type KeepsakeItem, type KeepsakeLayout } from "../../_valentine/kit";
import { FONTS } from "../../_valentine/theme";
import type { DayConfig, ValentineDayData } from "../../_valentine/types";
import { LANTERN_TINTS, Lantern, NIGHT, Starfield, lanternDataUrl } from "./valArt";
import { ghostBtn, headline, kicker, parseSince } from "./ValOpening";

// ── 7. The question ──────────────────────────────────────────────────────────

export function TheQuestion({ recipientName, question, noLines, sticker, bottomPad, onYes }: { recipientName: string; question: string; noLines: string[]; sticker: ReactNode; bottomPad: number; onYes: (dodges: number) => void }) {
  const reduced = useReducedMotion();
  const [dodges, setDodges] = useState(0);
  const [said, setSaid] = useState(false);
  return (
    <div style={{ position: "relative", minHeight: "100dvh", display: "flex", flexDirection: "column", alignItems: "center", padding: `64px 16px ${bottomPad}px`, overflow: "hidden" }}>
      <Starfield count={70} />
      <div aria-hidden style={{ position: "absolute", left: "50%", top: "30%", width: "120%", aspectRatio: "1", transform: "translate(-50%,-50%)", background: "radial-gradient(circle, rgba(232,67,110,.22), transparent 60%)", pointerEvents: "none" }} />
      <p style={{ ...kicker, position: "relative" }}>The real question</p>
      <motion.div animate={reduced ? undefined : { y: [0, -6, 0] }} transition={{ duration: 2.4, repeat: Infinity }} style={{ position: "relative", width: 112, height: 112, marginTop: 12 }}>
        {sticker}
      </motion.div>
      <h1 style={{ position: "relative", margin: "8px 0 0", font: `700 clamp(36px, 11vw, 52px)/1.05 ${FONTS.script}`, color: NIGHT.gold, textAlign: "center", overflowWrap: "anywhere", maxWidth: "100%" }}>{recipientName || "You"},</h1>
      <p style={{ ...headline, position: "relative", marginTop: 8, maxWidth: 360, overflowWrap: "anywhere" }}>{question || "Will you be my Valentine… forever?"}</p>
      <div style={{ position: "relative", width: "min(100%, 400px)", marginTop: 18 }}>
        <RunawayNo
          height={250}
          yesLabel="Yes 💘"
          noLines={noLines}
          maxDodges={Math.max(6, Math.min(10, noLines.length + 1))}
          surrenderLabel="Okay okay, YES 💘"
          onDodge={setDodges}
          onYes={(d) => {
            if (said) return;
            setSaid(true);
            haptic([30, 60, 30, 60, 90]);
            burst({ kind: "confetti", colors: ["#F5C66B", "#E8436E", "#FFB347", "#FFD6E0", "#E8A598"], count: 90 });
            burst({ kind: "hearts", count: 30 });
            window.setTimeout(() => onYes(d), reduced ? 300 : 1100);
          }}
          yesStyle={{ background: "linear-gradient(180deg, #FBE3A6, #F5C66B 55%, #E2AC48)", color: NIGHT.midnight, boxShadow: "0 5px 0 #A9792A, 0 14px 30px -10px rgba(245,198,107,.6)" }}
          noStyle={{ background: "rgba(255,246,229,.92)", color: "#4a2040", width: 150, minWidth: 0, whiteSpace: "normal", lineHeight: 1.15, padding: "10px 12px", fontSize: 14.5 }}
        />
      </div>
      <div style={{ position: "relative", minHeight: 30, font: `500 13px ${FONTS.ui}`, color: "#E6CFE0" }}>
        <AnimatePresence mode="wait">
          {dodges > 0 && !said && (
            <motion.span key={dodges} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              Escape attempts: {dodges} 🏃
            </motion.span>
          )}
          {said && (
            <motion.span key="yes" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} style={{ font: `700 26px ${FONTS.script}`, color: NIGHT.gold }}>
              Best. Answer. Ever. 💘
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ── 8. The lantern sky (canvas, DPR ≤ 2) ─────────────────────────────────────

interface Lan {
  x: number;
  y: number;
  vy: number;
  s: number;
  ph: number;
  sway: number;
  tint: number;
}
interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  c: string;
}

function makeSprite(tint: string, dpr: number): HTMLCanvasElement {
  const W = 64 * dpr;
  const H = 96 * dpr;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const g = c.getContext("2d")!;
  g.scale(dpr, dpr);
  // halo
  const halo = g.createRadialGradient(32, 50, 2, 32, 50, 32);
  halo.addColorStop(0, "rgba(255,190,90,.55)");
  halo.addColorStop(1, "rgba(255,150,60,0)");
  g.fillStyle = halo;
  g.fillRect(0, 10, 64, 80);
  // body (a rounded trapezoid, wider at the top like a sky lantern)
  const body = g.createLinearGradient(14, 0, 50, 0);
  body.addColorStop(0, tint);
  body.addColorStop(0.5, "#FFE3A0");
  body.addColorStop(1, tint);
  g.fillStyle = body;
  g.beginPath();
  g.moveTo(16, 24);
  g.quadraticCurveTo(32, 18, 48, 24);
  g.lineTo(44, 66);
  g.quadraticCurveTo(32, 70, 20, 66);
  g.closePath();
  g.fill();
  // inner flame glow
  const fl = g.createRadialGradient(32, 60, 1, 32, 58, 16);
  fl.addColorStop(0, "rgba(255,255,230,.95)");
  fl.addColorStop(1, "rgba(255,200,120,0)");
  g.fillStyle = fl;
  g.fillRect(14, 36, 36, 34);
  g.strokeStyle = "rgba(120,40,20,.25)";
  g.lineWidth = 1;
  g.beginPath();
  g.moveTo(32, 20);
  g.lineTo(32, 68);
  g.stroke();
  return c;
}

const heartPt = (t: number) => ({ x: 16 * Math.pow(Math.sin(t), 3), y: -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) });

export function LanternSky({ running, reduced }: { running: boolean; reduced: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const runRef = useRef(running);
  runRef.current = running;

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    let W = 0;
    let H = 0;
    let redraw: (() => void) | null = null;
    const resize = () => {
      const r = canvas.getBoundingClientRect();
      if (Math.round(r.width) === Math.round(W) && Math.round(r.height) === Math.round(H)) return;
      W = r.width;
      H = r.height;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      redraw?.();
    };
    resize();
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(resize) : null;
    ro?.observe(canvas);
    const sprites = LANTERN_TINTS.map((t) => makeSprite(t, dpr));
    const lans: Lan[] = [];
    const sparks: Spark[] = [];
    const spawn = (y = H + 40) => lans.push({ x: Math.random() * W, y, vy: 0.25 + Math.random() * 0.75, s: 0.35 + Math.random() * 0.75, ph: Math.random() * 6.28, sway: 0.3 + Math.random() * 0.6, tint: Math.floor(Math.random() * sprites.length) });

    const draw = (t: number) => {
      ctx.clearRect(0, 0, W, H);
      lans.sort((a, b) => a.s - b.s);
      for (const l of lans) {
        const sp = sprites[l.tint];
        const w = 64 * l.s;
        const h = 96 * l.s;
        ctx.globalAlpha = Math.max(0, Math.min(1, (l.y + h) / (H * 0.35))) * (0.75 + 0.25 * Math.sin(t / 140 + l.ph));
        ctx.drawImage(sp, l.x - w / 2 + Math.sin(t / 900 + l.ph) * 10 * l.sway, l.y - h / 2, w, h);
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "lighter";
      for (const p of sparks) {
        const a = Math.max(0, p.life / p.max);
        ctx.fillStyle = p.c;
        ctx.globalAlpha = a;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.6 + a * 1.4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
    };

    if (reduced) {
      // A still sky: lanterns hang where they are, no fireworks.
      for (let i = 0; i < 18; i++) spawn(Math.random() * H * 0.9);
      redraw = () => draw(0);
      draw(0);
      return () => ro?.disconnect();
    }

    let raf = 0;
    let started = 0;
    let lastSpawn = 0;
    let lastFw = 0;
    const firework = () => {
      const cx = W * (0.2 + Math.random() * 0.6);
      const cy = H * (0.14 + Math.random() * 0.3);
      const colors = ["#F5C66B", "#E8436E", "#FFD6E0", "#FFB347", "#FF7AA2"];
      const c = colors[Math.floor(Math.random() * colors.length)];
      const n = 70;
      const scale = Math.min(W, H) * (0.007 + Math.random() * 0.004);
      for (let i = 0; i < n; i++) {
        const hp = heartPt((i / n) * Math.PI * 2);
        sparks.push({ x: cx, y: cy, vx: hp.x * scale * 0.12, vy: hp.y * scale * 0.12, life: 70, max: 70, c });
      }
      for (let i = 0; i < 24; i++) {
        const a = Math.random() * Math.PI * 2;
        const v = Math.random() * 2.4;
        sparks.push({ x: cx, y: cy, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 50, max: 50, c: "#FFF6E5" });
      }
    };
    const tick = (t: number) => {
      if (!started) started = t;
      if (document.visibilityState !== "hidden") {
        if (runRef.current) {
          const age = t - started;
          if (lans.length < 64 && t - lastSpawn > (age < 4000 ? 110 : 420)) {
            spawn();
            lastSpawn = t;
          }
          if (t - lastFw > (age < 8000 ? 950 : 2600)) {
            firework();
            lastFw = t;
          }
        } else started = t;
        for (const l of lans) l.y -= l.vy * (0.6 + l.s);
        for (let i = lans.length - 1; i >= 0; i--) if (lans[i].y < -120) lans.splice(i, 1);
        for (const p of sparks) {
          p.x += p.vx;
          p.y += p.vy;
          p.vx *= 0.975;
          p.vy = p.vy * 0.975 + 0.035;
          p.life--;
        }
        for (let i = sparks.length - 1; i >= 0; i--) if (sparks[i].life <= 0) sparks.splice(i, 1);
        draw(t);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      ro?.disconnect();
    };
  }, [reduced]);

  return <canvas ref={ref} aria-hidden style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }} />;
}

// ── Keepsake ─────────────────────────────────────────────────────────────────

/** Kit workaround: keepsake.ts asks /_next/image for q=80, which Next 16 rejects (default qualities [75]) →
 * every photo was skipped. A path starting with "/" passes through the kit untouched. */
export const keepsakeSrc = (u: string) => (u.startsWith("data:") || u.startsWith("/") ? u : `/_next/image?url=${encodeURIComponent(u)}&w=1080&q=75`);

/** Splits text over two lines of similar length (no one-word orphan) once it is longer than `one` chars. */
function balance(t: string, one: number): string {
  if (t.length <= one) return t;
  const mid = t.length / 2;
  let best = -1;
  for (let i = 0; i < t.length; i++) if (t[i] === " " && (best < 0 || Math.abs(i - mid) < Math.abs(best - mid))) best = i;
  // Prefer a sentence / "·" break when it is still reasonably central.
  for (let i = 1; i < t.length; i++) if (t[i] === " " && /[.!?·,—]/.test(t[i - 1]) && Math.abs(i - mid) < t.length * 0.2 && Math.abs(i - mid) <= Math.abs(best - mid) + t.length * 0.2) { best = i; break; }
  return best < 0 ? t : `${t.slice(0, best)}\n${t.slice(best + 1)}`;
}

export function nightKeepsake(data: ValentineDayData, opts: { dodges: number | null; datePlan: string; togetherSince: string }): KeepsakeLayout {
  const W = 1080;
  const items: KeepsakeItem[] = [];
  for (let i = 0; i < 60; i++) {
    const v = (k: number) => {
      const x = Math.sin((i + 1) * 91.7 + k * 17.3) * 43758.5453;
      return x - Math.floor(x);
    };
    const s = 2 + v(3) * 4;
    items.push({ type: "rect", x: v(1) * W, y: v(2) * 1100, w: s, h: s, radius: s, fill: `rgba(255,246,229,${0.35 + v(4) * 0.6})` });
  }
  const lanterns = [
    [80, 110, 0.6, 0], [1000, 90, 0.7, 4], [100, 720, 0.6, 2], [985, 560, 0.55, 6], [80, 1700, 0.5, 1], [1000, 1660, 0.55, 5],
  ] as const;
  // Decorations stay out of the text bands (title/names ≈ 100–360, lines ≈ 1100–1600, foot ≈ 1640+ is narrowed).
  for (const [x, y, s, t] of lanterns) items.push({ type: "image", src: lanternDataUrl(LANTERN_TINTS[t]), x: x - 60 * s, y: y - 100 * s, w: 120 * s, h: 200 * s });
  items.push({ type: "text", text: "OUR VALENTINE NIGHT", x: W / 2, y: 130, size: 38, weight: 700, color: NIGHT.gold, face: "ui" });
  const names = `${data.recipientName || "You"} & ${data.senderName || "Me"}`;
  const nameSize = names.length <= 18 ? 96 : names.length <= 30 ? 74 : 58;
  items.push({ type: "text", text: names, x: W / 2, y: 190, size: nameSize, weight: 700, color: NIGHT.star, face: "script", maxWidth: 980, maxLines: 2, lineHeight: 1.1 });
  const photo = data.photos[data.photos.length - 1];
  if (photo?.url) {
    items.push({ type: "rect", x: 268, y: 392, w: 556, h: 676, fill: "rgba(0,0,0,.35)", radius: 6 });
    items.push({ type: "image", src: keepsakeSrc(photo.url), x: 262, y: 370, w: 556, h: 676, cropX: photo.cropX, cropY: photo.cropY, rotate: -2, frame: { pad: 26, bottom: 110, color: "#FFF6E5" } });
    if (photo.caption) items.push({ type: "text", text: photo.caption, x: W / 2, y: 960, size: 44, face: "script", color: "#2A1240", maxWidth: 480, maxLines: 1 });
  } else {
    items.push({ type: "image", src: lanternDataUrl(LANTERN_TINTS[0]), x: 390, y: 420, w: 300, h: 500 });
  }
  let y = 1150;
  items.push({ type: "text", text: opts.dodges == null ? "said YES, forever 💘" : opts.dodges > 0 ? `said YES after ${opts.dodges} escape attempt${opts.dodges === 1 ? "" : "s"} 💘` : "said YES on the first try 💘", x: W / 2, y, size: 54, weight: 700, color: NIGHT.blush, face: "ui", maxWidth: 980, maxLines: 2 });
  y += 110;
  const since = parseSince(opts.togetherSince);
  if (since) {
    const days = Math.floor((Date.now() - since.getTime()) / 86400000);
    items.push({ type: "text", text: `${days.toLocaleString("en-IN")} days of us`, x: W / 2, y, size: 64, weight: 700, color: NIGHT.gold, face: "serif", italic: true });
    y += 110;
  }
  if (opts.datePlan.trim()) {
    items.push({ type: "rect", x: 140, y, w: 800, h: 150, radius: 24, fill: "rgba(245,198,107,.12)", stroke: "rgba(245,198,107,.6)", lineWidth: 3 });
    items.push({ type: "text", text: "TONIGHT", x: W / 2, y: y + 24, size: 28, weight: 700, color: NIGHT.gold, face: "ui" });
    items.push({ type: "text", text: balance(opts.datePlan.trim(), 34), x: W / 2, y: y + 66, size: 36, color: NIGHT.star, face: "serif", maxWidth: 760, maxLines: 2, lineHeight: 1.18 });
    y += 190;
  }
  if (data.endLine) items.push({ type: "text", text: balance(data.endLine, 36), x: W / 2, y: Math.max(y, 1640), size: 38, italic: true, color: "#E6CFE0", face: "serif", maxWidth: 760, maxLines: 2 });
  items.push({ type: "text", text: `14 · 02 · ${new Date().getFullYear()}`, x: W / 2, y: 1780, size: 30, weight: 600, color: NIGHT.gold, face: "ui" });
  items.push({ type: "text", text: "made on subhsandesh.in", x: W / 2, y: 1846, size: 26, color: "#B9A3C2", face: "ui" });
  return { background: { stops: [[0, "#12081F"], [0.55, "#2A1240"], [0.85, "#4A1A4F"], [1, "#7A1035"]] }, items };
}

// ── 9. Release our lantern → finale ──────────────────────────────────────────

export function Finale({ day, data, mode, dodges, datePlan, togetherSince, sticker, bottomPad, onReleased, onReplay }: { day: DayConfig; data: ValentineDayData; mode: "preview" | "live"; dodges: number | null; datePlan: string; togetherSince: string; sticker: ReactNode; bottomPad: number; onReleased: () => void; onReplay: () => void }) {
  const reduced = useReducedMotion();
  const [released, setReleased] = useState(false);
  const [show, setShow] = useState(false);
  const firedRef = useRef(false);

  const release = () => {
    if (released) return;
    setReleased(true);
    haptic([20, 50, 20]);
    if (!firedRef.current) {
      firedRef.current = true;
      onReleased();
    }
    window.setTimeout(() => setShow(true), reduced ? 100 : 2200);
  };

  const photo = data.photos[data.photos.length - 1];
  const since = parseSince(togetherSince);
  const days = since ? Math.floor((Date.now() - since.getTime()) / 86400000) : null;

  return (
    <div style={{ position: "relative", minHeight: "100dvh" }}>
      {/* the sky stays pinned while the ending scrolls over it */}
      <div style={{ position: "sticky", top: 0, height: "100dvh", marginBottom: "-100dvh", overflow: "hidden", background: "radial-gradient(130% 80% at 50% 100%, #4A1A4F 0%, #2A1240 45%, #12081F 100%)" }}>
        <Starfield count={80} />
        <LanternSky running={released} reduced={reduced} />
      </div>

      <div style={{ position: "relative", zIndex: 1, minHeight: "100dvh", display: "flex", flexDirection: "column", alignItems: "center", padding: `64px 16px ${bottomPad}px`, textAlign: "center", textShadow: "0 2px 14px rgba(18,8,31,.85)" }}>
        <p style={kicker}>{released ? "Up it goes" : "One more thing"}</p>
        <h2 style={{ ...headline, marginTop: 6 }}>{released ? "Our lantern is in the sky" : "Release our lantern"}</h2>

        {!released && (
          <>
            <div style={{ flex: 1, minHeight: 40 }} />
            <motion.div
              drag={reduced ? false : "y"}
              dragConstraints={{ top: -260, bottom: 0 }}
              dragElastic={0.15}
              dragSnapToOrigin
              onDragEnd={(_, info) => {
                if (info.offset.y < -70 || info.velocity.y < -400) release();
              }}
              role="button"
              tabIndex={0}
              aria-label="Release the lantern"
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && release()}
              animate={reduced ? undefined : { y: [0, -8, 0] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
              style={{ cursor: "grab", touchAction: "none", filter: "drop-shadow(0 0 30px rgba(255,179,71,.6))" }}
            >
              <Lantern tint="#E8436E" lit size={118} glyph={<span style={{ font: `700 ${Math.round(118 * 0.2)}px ${FONTS.script}`, color: "#7A1035" }}>us</span>} />
            </motion.div>
            <motion.p animate={reduced ? undefined : { y: [0, -6, 0] }} transition={{ duration: 1.3, repeat: Infinity }} style={{ margin: "26px 0 0", font: `600 15px ${FONTS.ui}`, color: NIGHT.star }}>
              ↑ swipe up to let it go
            </motion.p>
            <div style={{ flex: 1, minHeight: 24 }} />
            <button type="button" onClick={release} style={ghostBtn}>
              Release it 🏮
            </button>
          </>
        )}

        {released && !show && (
          <motion.div initial={{ y: 0, opacity: 1 }} animate={reduced ? { opacity: 0 } : { y: "-110vh", scale: 0.4, opacity: [1, 1, 0.6] }} transition={{ duration: 2.4, ease: [0.4, 0, 0.7, 1] }} style={{ marginTop: "38dvh" }}>
            <Lantern tint="#E8436E" lit size={118} />
          </motion.div>
        )}

        <AnimatePresence>
          {show && (
            <motion.div initial={reduced ? false : { opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: [0.2, 0.8, 0.2, 1] }} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, width: "100%", marginTop: 18 }}>
              <div style={{ width: 120, height: 120 }}>{sticker}</div>
              <h1 style={{ margin: 0, font: `700 clamp(38px, 11vw, 56px)/1.05 ${FONTS.script}`, color: NIGHT.gold, textShadow: "0 0 26px rgba(245,198,107,.45)", overflowWrap: "anywhere" }}>
                Happy Valentine&apos;s Day, {data.recipientName || "you"}
              </h1>
              <p style={{ margin: 0, font: `700 17px ${FONTS.ui}`, color: NIGHT.blush }}>
                {dodges == null ? "said YES, forever 💘" : dodges > 0 ? `said YES after ${dodges} escape attempt${dodges === 1 ? "" : "s"} 💘` : "said YES on the very first try 💘"}
              </p>
              {days != null && (
                <p style={{ margin: 0, font: `italic 600 20px ${FONTS.serif}`, color: NIGHT.star }}>
                  {days.toLocaleString("en-IN")} days of us · and every one after
                </p>
              )}

              {datePlan.trim() && (
                <motion.div
                  initial={reduced ? false : { rotateX: 90, opacity: 0 }}
                  animate={{ rotateX: 0, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                  style={{ width: "min(100%, 360px)", padding: "16px 18px", borderRadius: 18, background: "linear-gradient(135deg, rgba(245,198,107,.16), rgba(232,67,110,.12))", border: "1.5px dashed rgba(245,198,107,.6)", boxShadow: "0 20px 40px -24px rgba(0,0,0,.8)" }}
                >
                  <div style={{ font: `700 11px ${FONTS.ui}`, letterSpacing: ".24em", color: NIGHT.gold }}>🕯️ TONIGHT&apos;S PLAN</div>
                  <p style={{ margin: "8px 0 0", font: `600 19px/1.35 ${FONTS.serif}`, color: NIGHT.star, overflowWrap: "anywhere" }}>{datePlan}</p>
                </motion.div>
              )}

              {photo && (
                <div style={{ width: "min(56vw, 210px)", padding: "10px 10px 34px", background: "#FFF6E5", borderRadius: 3, transform: "rotate(-3deg)", boxShadow: "0 24px 40px -18px rgba(0,0,0,.8)", position: "relative" }}>
                  <div style={{ aspectRatio: "4 / 5", overflow: "hidden" }}>
                    <CroppedPhoto photo={photo} />
                  </div>
                  <span style={{ position: "absolute", left: 0, right: 0, bottom: 6, font: `700 17px ${FONTS.script}`, color: "#2A1240", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", padding: "0 8px" }}>{photo.caption || "us ♥"}</span>
                </div>
              )}

              {data.endLine && <p style={{ margin: 0, maxWidth: 360, font: `italic 400 19px/1.5 ${FONTS.serif}`, color: NIGHT.star, overflowWrap: "anywhere" }}>{data.endLine}</p>}
              <p style={{ margin: 0, font: `400 26px ${FONTS.script}`, color: "#E6CFE0", overflowWrap: "anywhere" }}>— {data.senderName}</p>
              <EndingActions
                day={day}
                data={data}
                mode={mode}
                onReplay={onReplay}
                keepsake={() => nightKeepsake(data, { dodges, datePlan, togetherSince })}
                style={{ marginTop: 4 }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

