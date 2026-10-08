"use client";

// Room 3 — The Thermal Hug (the wow). Two glowing handprints: hold them with
// both thumbs (one finger, a mouse, or the "Hold me" button also counts). A
// low-resolution metaball field — two heat shapes, one of each of you — is
// mapped through a thermal palette (indigo → violet → magenta → orange →
// white-gold) and smoothly upscaled. While held, the shapes drift together
// and melt into one, swelling on every heartbeat: a synthesised lub-dub that
// starts 20 bpm fast and slows to the sender's resting rate (Android also
// vibrates), under a breathing ring (in 4 · out 4). A line of theirs fades in
// every few seconds. Lifting a thumb pauses — the heat cools slowly, "Stay a
// little longer…" — it never resets. At the end the song's drop lands
// (useSongDrop) and the screen blooms white-gold: "Hug delivered · 20 seconds
// · 11:42 PM". The song is ducked during the hold so the heartbeat leads.
// Reduced motion: no metaballs — a radial glow warming in place.

import { useEffect, useRef, useState, type ReactNode } from "react";
import { sfx, usePremium, useSongDrop } from "../../../_valentine/kit/premium";
import { haptic, useReducedMotion } from "../../../_valentine/kit";
import { SOFT } from "./fonts";
import { thermalLut, type Hug } from "./model";
import { Kicker, Room, Satin, Title } from "./ui";

const COLS = 72;
const ROWS = 96;

function Hand({ side }: { side: "l" | "r" }) {
  return (
    <svg viewBox="0 0 60 70" width="54" height="63" aria-hidden style={{ transform: side === "r" ? "scaleX(-1)" : undefined }}>
      <path d="M30 66 C16 66 10 56 10 44 L10 30 C10 26 16 26 16 30 L16 40 L18 14 C18 9 25 9 25 14 L25 36 L27 8 C27 3 34 3 34 8 L34 36 L37 12 C37 7 44 7 44 12 L43 38 L47 24 C48 19 55 21 53 26 L48 50 C46 60 40 66 30 66 Z" fill="currentColor" />
    </svg>
  );
}

export default function ThermalHug({ h, sticker, onDelivered, onNext }: { h: Hug; sticker: ReactNode; onDelivered: (at: string) => void; onNext: () => void }) {
  const p = usePremium();
  const reduce = useReducedMotion();
  const { drop } = useSongDrop();
  const cv = useRef<HTMLCanvasElement>(null);
  const [held, setHeld] = useState(false);
  const [secs, setSecs] = useState(0);
  const [done, setDone] = useState(false);
  const [bloom, setBloom] = useState(false);
  const [lifted, setLifted] = useState(false);
  const [beat, setBeat] = useState(0);
  const [at, setAt] = useState("");
  const pressing = useRef(new Set<number | string>());
  const st = useRef({ t: 0, heat: 0.2, pulse: 0, nextBeat: 0, nextBreath: 0, held: false, done: false, ducked: false, sec: 0 });
  const music = p.music;

  const update = () => {
    const on = pressing.current.size > 0 && !st.current.done;
    if (on === st.current.held) return;
    st.current.held = on;
    setHeld(on);
    if (on) {
      setLifted(false);
      if (!st.current.ducked) {
        st.current.ducked = true;
        music?.duck(0.45);
      }
      haptic(10);
    } else if (!st.current.done && st.current.t > 0.3) {
      setLifted(true);
      sfx("hg-cool", { gain: 0.6 });
    }
  };
  const down = (key: number | string) => (e: React.PointerEvent | React.KeyboardEvent) => {
    if ("pointerId" in e) (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    pressing.current.add("pointerId" in e ? `${key}-${e.pointerId}` : key);
    update();
  };
  const up = (key: number | string) => (e: React.PointerEvent | React.KeyboardEvent) => {
    pressing.current.delete("pointerId" in e ? `${key}-${e.pointerId}` : key);
    update();
  };

  // Give the song back if they leave mid-hug.
  useEffect(() => () => { if (st.current.ducked && !st.current.done) music?.unduck(); }, [music]);

  useEffect(() => {
    const canvas = cv.current;
    const g = canvas?.getContext("2d");
    if (!canvas || !g) return;
    canvas.width = COLS;
    canvas.height = ROWS;
    const img = g.createImageData(COLS, ROWS);
    const lut = thermalLut();
    let raf = 0;
    let last = performance.now();
    const holdMs = h.hold * 1000;
    const frame = (now: number) => {
      const s = st.current;
      const dt = Math.min(64, now - last);
      last = now;
      if (s.held && !s.done) {
        s.t += dt;
        if (now >= s.nextBeat) {
          const prog = Math.min(1, s.t / holdMs);
          const bpm = h.bpm + 20 * (1 - prog);
          s.nextBeat = now + 60000 / bpm;
          s.pulse = 1;
          sfx("hg-lubdub", { gain: 0.95 });
          (navigator as Navigator & { vibrate?: (p: number[]) => boolean }).vibrate?.([28, 220, 18]);
          setBeat((b) => b + 1);
        }
        if (now >= s.nextBreath) {
          s.nextBreath = now + 8000;
          sfx("hg-breath", { gain: 0.8 });
        }
        if (s.t >= holdMs) {
          s.done = true;
          s.held = false;
          setHeld(false);
          setDone(true);
          const time = new Date().toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
          setAt(time);
          onDelivered(time);
          music?.unduck();
          drop(() => {
            setBloom(true);
            sfx("hg-delivered", { gain: 0.9 });
            haptic([30, 60, 40]);
          });
        }
      } else if (!s.held) s.nextBeat = Math.max(s.nextBeat, now + 300);
      const targetHeat = s.done ? 1 : s.held ? 0.55 + 0.45 * Math.min(1, s.t / holdMs) : 0.12 + 0.4 * Math.min(1, s.t / holdMs);
      s.heat += (targetHeat - s.heat) * Math.min(1, dt / (s.held ? 300 : 1800));
      s.pulse *= Math.pow(0.9, dt / 16);
      const prog = s.done ? 1 : Math.min(1, s.t / holdMs);
      const sec = Math.min(h.hold, Math.floor(s.t / 1000));
      if (sec !== s.sec) {
        s.sec = sec;
        setSecs(sec);
      }
      if (!reduce) {
        const sep = 0.27 * (1 - prog);
        const x1 = 0.5 - sep;
        const x2 = 0.5 + sep;
        const y1 = 0.48 + Math.sin(now / 1400) * 0.015;
        const y2 = 0.5 + Math.cos(now / 1300) * 0.015;
        const r = 0.15 + 0.04 * prog + 0.025 * s.pulse;
        const k = 0.42 + s.heat * 0.9;
        const d = img.data;
        for (let yy = 0; yy < ROWS; yy++) {
          const fy = yy / ROWS;
          for (let xx = 0; xx < COLS; xx++) {
            const fx = (xx / COLS) * 0.75;
            const a1 = fx - x1 * 0.75;
            const b1 = fy - y1;
            const a2 = fx - x2 * 0.75;
            const b2 = fy - y2;
            const f = (r * r) / (a1 * a1 + b1 * b1 * 0.55 + 0.0004) + (r * r) / (a2 * a2 + b2 * b2 * 0.55 + 0.0004);
            const v = Math.min(255, Math.max(0, Math.floor(f * k * 46 - 14)));
            const o = (yy * COLS + xx) * 4;
            d[o] = lut[v * 3];
            d[o + 1] = lut[v * 3 + 1];
            d[o + 2] = lut[v * 3 + 2];
            d[o + 3] = 255;
          }
        }
        g.putImageData(img, 0, 0);
      }
      canvas.style.setProperty("--heat", s.heat.toFixed(3));
      if (!(s.done && s.heat > 0.99)) raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [h.hold, h.bpm, reduce]);

  const lineIdx = Math.min(h.lines.length - 1, Math.floor(secs / Math.max(3, Math.floor(h.hold / (h.lines.length + 0.5)))));
  const ring = Math.min(1, secs / h.hold);

  return (
    <Room label="The twenty-second hug" className={`hg-thermal${bloom ? " is-bloom" : ""}`}>
      <Kicker>{done ? "Hug delivered" : `${h.hold} seconds`}</Kicker>
      <Title>{done ? (bloom ? "Held." : "…") : held ? "Stay right there" : "Hold me"}</Title>
      <div className={`hg-heat${held ? " is-held" : ""}${reduce ? " is-reduced" : ""}`} onContextMenu={(e) => e.preventDefault()}>
        <canvas ref={cv} className="hg-heatCv" aria-hidden />
        <span className="hg-glowFallback" aria-hidden />
        {!done && <span className={`hg-breath${held ? " is-on" : ""}`} aria-hidden><i>{held ? "breathe" : ""}</i></span>}
        <svg className="hg-ring" viewBox="0 0 100 100" aria-hidden>
          <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(255,255,255,.15)" strokeWidth="3" />
          <circle cx="50" cy="50" r="46" fill="none" stroke="#FFE08A" strokeWidth="3" strokeLinecap="round" strokeDasharray={`${ring * 289} 289`} transform="rotate(-90 50 50)" />
        </svg>
        <p className="hg-line" key={done ? "line-done" : `line-${lineIdx}`} style={{ fontFamily: SOFT }} aria-live="polite">
          {done ? (bloom ? `Hug delivered · ${h.hold} seconds · ${at}` : "") : held || secs > 0 ? h.lines[Math.max(0, lineIdx)] : `${h.sender} is holding out their arms`}
        </p>
        {lifted && !held && !done && <p className="hg-stay" style={{ fontFamily: SOFT }}>Stay a little longer…</p>}
        {!done && (
          <>
            <button type="button" className="hg-hand is-l" onPointerDown={down("l")} onPointerUp={up("l")} onPointerCancel={up("l")} onPointerLeave={up("l")} aria-label="Left hand: press and hold">
              <Hand side="l" />
            </button>
            <button type="button" className="hg-hand is-r" onPointerDown={down("r")} onPointerUp={up("r")} onPointerCancel={up("r")} onPointerLeave={up("r")} aria-label="Right hand: press and hold">
              <Hand side="r" />
            </button>
          </>
        )}
        <span className="hg-count" aria-hidden key={`beat-${beat}`}>{done ? "" : `${secs}s`}</span>
        {bloom && <span className="hg-heldSticker">{sticker}</span>}
      </div>
      {done ? (
        <Satin big onClick={() => { sfx("hg-pop", { gain: 0.5 }); onNext(); }}>Keep me close →</Satin>
      ) : (
        <button
          type="button"
          className="hg-holdBtn"
          onPointerDown={down("btn")}
          onPointerUp={up("btn")}
          onPointerCancel={up("btn")}
          onPointerLeave={up("btn")}
          onKeyDown={(e) => { if ((e.key === " " || e.key === "Enter") && !e.repeat) { e.preventDefault(); down("key")(e); } }}
          onKeyUp={(e) => { if (e.key === " " || e.key === "Enter") up("key")(e); }}
        >
          {held ? "Holding…" : "Put both thumbs on the hands — or hold here"}
        </button>
      )}
      <style>{CSS}</style>
    </Room>
  );
}

const CSS = `
.hg-thermal { gap: 10px; }
.hg-heat { position: relative; width: 100%; max-width: 440px; aspect-ratio: 3 / 4; max-height: 50vh; border-radius: 32px; overflow: hidden; touch-action: none;
  -webkit-user-select: none; user-select: none; -webkit-touch-callout: none; background: #121634; box-shadow: 0 30px 70px -30px rgba(217,54,122,.55); }
.hg-heatCv { position: absolute; inset: 0; width: 100%; height: 100%; image-rendering: auto; filter: blur(2px) saturate(1.1); transform: scale(1.04); }
.hg-glowFallback { display: none; position: absolute; inset: 0; background: radial-gradient(55% 45% at 50% 48%, #FFE08A calc(var(--heat, .2) * 20%), #FF8A3D calc(var(--heat, .2) * 45%), #D9367A calc(var(--heat, .2) * 70%), #121634 100%); }
.hg-heat.is-reduced .hg-heatCv { display: none; }
.hg-heat.is-reduced .hg-glowFallback { display: block; }
.hg-breath { position: absolute; left: 50%; top: 4%; width: 64px; height: 64px; margin-left: -32px; border-radius: 50%; border: 2px solid rgba(255,246,234,.5); display: grid; place-items: center; }
.hg-breath.is-on { animation: hg-breathe 8s ease-in-out infinite; }
.hg-breath i { font: italic 400 12px/1 var(--font-hg-soft), serif; color: #FFF6EA; letter-spacing: .08em; }
@keyframes hg-breathe { 0%, 100% { transform: scale(.8); opacity: .6; } 50% { transform: scale(1.25); opacity: 1; } }
.hg-ring { position: absolute; left: 50%; top: 50%; width: 76%; transform: translate(-50%, -50%); pointer-events: none; opacity: .7; }
.hg-line { position: absolute; left: 8%; right: 8%; top: 21%; margin: 0; text-align: center; font-size: clamp(20px, 5.4vw, 25px); font-style: italic; line-height: 1.25; color: #FFF8EE;
  text-shadow: 0 0 2px rgba(30,8,30,.9), 0 2px 18px rgba(30,8,30,.85); animation: hg-lineIn 1.6s ease both; }
@keyframes hg-lineIn { from { opacity: 0; filter: blur(6px); } to { opacity: 1; filter: none; } }
.hg-stay { position: absolute; left: 0; right: 0; top: 26%; margin: 0; text-align: center; font-size: 17px; font-style: italic; color: #DCE8F2; animation: hg-lineIn 1s ease both; }
.hg-hand { all: unset; position: absolute; bottom: 5%; width: 84px; height: 84px; border-radius: 50%; display: grid; place-items: center; cursor: pointer; touch-action: none;
  color: rgba(255,224,138,.85); background: radial-gradient(circle, rgba(255,224,138,.25), rgba(255,224,138,.05) 70%); box-shadow: 0 0 0 2px rgba(255,224,138,.45), 0 0 30px rgba(255,138,61,.35);
  animation: hg-handPulse 2s ease-in-out infinite; -webkit-tap-highlight-color: transparent; }
.hg-hand.is-l { left: 6%; } .hg-hand.is-r { right: 6%; }
.hg-heat.is-held .hg-hand { animation: none; color: #FFF6EA; background: radial-gradient(circle, rgba(255,224,138,.55), rgba(255,138,61,.15) 70%); }
.hg-hand:focus-visible { outline: 3px solid #FFE08A; outline-offset: 3px; }
@keyframes hg-handPulse { 0%, 100% { box-shadow: 0 0 0 2px rgba(255,224,138,.45), 0 0 18px rgba(255,138,61,.25); } 50% { box-shadow: 0 0 0 4px rgba(255,224,138,.7), 0 0 40px rgba(255,138,61,.55); } }
.hg-count { position: absolute; left: 50%; bottom: 8%; transform: translateX(-50%); font: 600 15px/1 var(--vw-font-ui, system-ui), sans-serif; color: rgba(255,246,234,.75); font-variant-numeric: tabular-nums; }
.hg-thermal.is-bloom .hg-heat::after { content: ""; position: absolute; inset: 0; background: radial-gradient(70% 60% at 50% 50%, rgba(255,250,230,.95), rgba(255,224,138,.5) 50%, transparent 80%);
  animation: hg-bloom 2.4s ease-out both; pointer-events: none; }
@keyframes hg-bloom { 0% { opacity: 0; } 25% { opacity: 1; } 100% { opacity: .35; } }
.hg-thermal.is-bloom .hg-line { z-index: 2; top: auto; bottom: 26%; color: #4A2C2A; text-shadow: 0 1px 10px rgba(255,255,255,.8); font-size: clamp(18px, 4.8vw, 22px); }
.hg-heldSticker { position: absolute; left: 50%; top: 14%; transform: translateX(-50%); z-index: 2; pointer-events: none; }
.hg-holdBtn { min-height: 52px; padding: 0 22px; border-radius: 99px; cursor: pointer; touch-action: none; border: 1px solid rgba(255,224,138,.45); background: rgba(27,35,64,.55);
  color: #FFF6EA; font: 600 14px/1.2 var(--vw-font-ui, system-ui), sans-serif; -webkit-user-select: none; user-select: none; }
.hg-holdBtn:focus-visible { outline: 3px solid #FFE08A; outline-offset: 3px; }
@media (prefers-reduced-motion: reduce) { .hg-breath.is-on, .hg-hand, .hg-line, .hg-stay { animation: none; } }
`;
