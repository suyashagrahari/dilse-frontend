"use client";

// Chapter 3, the money moment: the twenty-second hug.
//
// The sender's photo fills the screen in black and white. The recipient puts a thumb anywhere on it and holds: colour
// blooms outward from under their thumb, a heartbeat ring pulses from it (sfx + Android haptics on every beat) and
// slows from 100 bpm to the sender's own, the song swells (where the platform can fade it), and the sender's lines fade
// in one by one. Letting go pauses everything ("Don't let go yet."). With DROP_RISER_SEC left, drop() fires, so the
// chorus lands exactly as the last of the colour does: "Hug delivered." Space/Enter hold works too, and after a few
// seconds a quiet "Hold it for me" lets it run on its own (no-touch / accessibility path).
//
// Per frame it only writes three CSS variables (mask radius, ring arc, origin) on refs: no React render per frame.

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { CroppedPhoto, haptic, useReducedMotion } from "../../../_valentine/kit";
import { DROP_RISER_SEC, PremiumCTA, sfx, usePremium, useSongDrop } from "../../../_valentine/kit/premium";
import { clock, initialOf, type Hug } from "./model";
import { CTA_STYLE, Eyebrow } from "./ui";

type Phase = "ready" | "holding" | "paused" | "rising" | "delivered";
const RING_R = 46;
const RING_C = 2 * Math.PI * RING_R;

export default function HoldScene({ h, sticker, onDelivered, onNext }: { h: Hug; sticker: ReactNode; onDelivered: (at: string) => void; onNext: () => void }) {
  const reduce = useReducedMotion();
  const { music } = usePremium();
  const { drop } = useSongDrop();
  const [phase, setPhase] = useState<Phase>("ready");
  const [left, setLeft] = useState(h.seconds);
  const [line, setLine] = useState(-1);
  const [beat, setBeat] = useState(0);
  const [origin, setOrigin] = useState<{ x: number; y: number } | null>(null);
  const [helper, setHelper] = useState(false);
  const [cta, setCta] = useState(false);
  const [at, setAt] = useState("");

  const frameRef = useRef<HTMLDivElement>(null);
  const colRef = useRef<HTMLDivElement>(null);
  const arcRef = useRef<SVGCircleElement>(null);
  const p = useRef(0);
  const holding = useRef(false);
  const auto = useRef(false);
  const rising = useRef(false);
  const doneRef = useRef(false);
  const raf = useRef<number | null>(null);
  const lastT = useRef(0);
  const nextBeat = useRef(0);
  const lineRef = useRef(-1);
  const leftRef = useRef(h.seconds);
  const musicRef = useRef(music);
  useEffect(() => {
    musicRef.current = music;
  });

  const paint = useCallback(() => {
    const v = p.current;
    // The colour reaches the far corners at ~1.0; the soft edge is 24% of the ray.
    // Eased so the bloom takes the whole hold: a warm core early, the far corners only at the very end.
    colRef.current?.style.setProperty("--r", `${(Math.pow(v, 1.7) * 116 - 14).toFixed(2)}%`);
    colRef.current?.style.setProperty("--o", (0.5 + 0.5 * v).toFixed(3));
    arcRef.current?.setAttribute("stroke-dashoffset", (RING_C * (1 - v)).toFixed(1));
  }, []);

  const deliver = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    p.current = 1;
    paint();
    const t = clock();
    setAt(t);
    setPhase("delivered");
    setLeft(0);
    haptic([30, 80, 30, 80, 60]);
    window.setTimeout(() => sfx("chime-cascade", { gain: 0.55 }), 450);
    onDelivered(t);
    window.setTimeout(() => setCta(true), reduce ? 300 : 2200);
  }, [onDelivered, paint, reduce]);

  // The frame loop lives in a ref (refreshed every render) so rAF always runs the latest closure.
  const loopRef = useRef<(t: number) => void>(() => {});
  const frame = useCallback((t: number) => loopRef.current(t), []);
  useEffect(() => {
    loopRef.current = (t: number) => {
      const dt = lastT.current ? Math.min(250, t - lastT.current) : 16;
      lastT.current = t;
      const going = holding.current || auto.current || rising.current;
      if (going && !doneRef.current) {
        p.current = Math.min(1, p.current + dt / (h.seconds * 1000));
        // The drop: its riser starts DROP_RISER_SEC before the end, so the chorus and the last colour arrive together.
        if (!rising.current && p.current >= 1 - DROP_RISER_SEC / h.seconds) {
          rising.current = true;
          setPhase("rising");
          drop(deliver);
        }
        // Heartbeat: 100 bpm at first, settling to the sender's resting rate by two-thirds of the way.
        if (t >= nextBeat.current) {
          const bpm = 100 + (h.bpm - 100) * Math.min(1, p.current * 1.5);
          nextBeat.current = t + 60000 / bpm;
          sfx("heartbeat", { gain: 0.42 + p.current * 0.3 });
          haptic([16, 110, 10]);
          setBeat((b) => b + 1);
          const m = musicRef.current;
          if (m?.canFade && !rising.current) m.fadeTo(0.45 + 0.45 * p.current, 900);
        }
        const li = Math.min(h.lines.length - 1, Math.floor(p.current * (h.lines.length + 0.35)));
        if (li !== lineRef.current) {
          lineRef.current = li;
          setLine(li);
        }
        const s = Math.max(0, Math.ceil(h.seconds * (1 - p.current)));
        if (s !== leftRef.current) {
          leftRef.current = s;
          setLeft(s);
        }
        paint();
      }
      if ((going || holding.current) && !doneRef.current) raf.current = requestAnimationFrame(frame);
      else raf.current = null;
    };
  });

  const run = useCallback(() => {
    if (raf.current == null) {
      lastT.current = 0;
      raf.current = requestAnimationFrame(frame);
    }
  }, [frame]);

  useEffect(() => {
    paint();
    const m = musicRef.current;
    if (m?.canFade) m.fadeTo(0.4, 1400);
    const t = window.setTimeout(() => setHelper(true), 6000);
    return () => {
      window.clearTimeout(t);
      if (raf.current != null) cancelAnimationFrame(raf.current);
      raf.current = null;
    };
  }, [paint]);

  const press = (x?: number, y?: number) => {
    if (doneRef.current || holding.current) return;
    if (!origin) {
      const r = frameRef.current?.getBoundingClientRect();
      if (r && x != null && y != null) {
        const ox = Math.max(4, Math.min(96, ((x - r.left) / r.width) * 100));
        const oy = Math.max(4, Math.min(96, ((y - r.top) / r.height) * 100));
        setOrigin({ x: ox, y: oy });
        colRef.current?.style.setProperty("--x", `${ox}%`);
        colRef.current?.style.setProperty("--y", `${oy}%`);
      } else setOrigin({ x: 50, y: 72 });
    }
    holding.current = true;
    nextBeat.current = performance.now() + 120;
    if (!rising.current) setPhase("holding");
    sfx("hh-press", { gain: 0.6 });
    haptic(12);
    run();
  };
  const release = () => {
    if (!holding.current) return;
    holding.current = false;
    if (doneRef.current || rising.current || auto.current) return;
    setPhase("paused");
    sfx("hh-release", { gain: 0.55 });
    const m = musicRef.current;
    if (m?.canFade) m.fadeTo(0.3, 700);
  };
  const holdForMe = () => {
    if (doneRef.current) return;
    if (!origin) {
      setOrigin({ x: 50, y: 72 });
      colRef.current?.style.setProperty("--x", "50%");
      colRef.current?.style.setProperty("--y", "72%");
    }
    auto.current = true;
    nextBeat.current = performance.now() + 120;
    if (!rising.current) setPhase("holding");
    run();
  };

  const delivered = phase === "delivered";
  const active = phase === "holding" || phase === "rising";
  const ring = origin ?? { x: 50, y: 72 };
  const lineText = phase === "paused" ? "Don't let go yet." : line >= 0 ? h.lines[line] : null;

  return (
    <section
      className={`hh-scene hh-holdScene is-${phase}`}
      aria-label="The twenty-second hug"
      onPointerDown={(e) => {
        if ((e.target as HTMLElement).closest("button, a")) return;
        (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
        press(e.clientX, e.clientY);
      }}
      onPointerUp={release}
      onPointerCancel={release}
      onContextMenu={(e) => e.preventDefault()}
      style={{ touchAction: "none", userSelect: "none", WebkitUserSelect: "none", WebkitTouchCallout: "none" }}
    >
      <div ref={frameRef} className="hh-frame">
        <div className="hh-kb">
          <div className="hh-bw">{h.hero ? <CroppedPhoto photo={h.hero} eager alt="" style={{ background: "#1a130f" }} /> : <NamePlate h={h} />}</div>
          <div ref={colRef} className={`hh-col${origin ? " is-on" : ""}`} style={{ ["--x" as string]: `${ring.x}%`, ["--y" as string]: `${ring.y}%` }}>
            {h.hero ? <CroppedPhoto photo={h.hero} eager alt={h.hero.caption || `${h.from} and ${h.to}`} style={{ background: "#1a130f" }} /> : <NamePlate h={h} warm />}
            <i className="hh-colTint" aria-hidden />
          </div>
        </div>
        <i className="hh-scrim" aria-hidden />
        {delivered && <i className="hh-flash" aria-hidden />}

        <div className="hh-ring" style={{ left: `${ring.x}%`, top: `${ring.y}%` }} aria-hidden>
          {active && !reduce && <i key={beat} className="hh-beat" />}
          {active && !reduce && beat > 0 && <i key={`b${beat}`} className="hh-beat hh-beat2" />}
          <svg viewBox="0 0 100 100" className="hh-arc">
            <circle cx="50" cy="50" r={RING_R} className="hh-arcTrack" />
            <circle ref={arcRef} cx="50" cy="50" r={RING_R} className="hh-arcFill" strokeDasharray={RING_C.toFixed(1)} strokeDashoffset={RING_C.toFixed(1)} />
          </svg>
          <span className="hh-ringCore">{phase === "ready" ? "" : delivered ? "" : left}</span>
        </div>
      </div>

      <div className="hh-holdTop">
        <Eyebrow>{delivered ? `${h.seconds} seconds · ${at}` : phase === "ready" ? "They say a hug works best at twenty seconds" : h.seconds === 20 ? "The twenty-second hug" : `A ${h.seconds}-second hug`}</Eyebrow>
      </div>

      <div className="hh-holdWords" aria-live="polite">
        {phase === "ready" && (
          <p className="hh-holdLine hh-rise">
            Put your thumb on {h.hero ? "us" : "here"}.<br />
            <em>Don&apos;t let go.</em>
          </p>
        )}
        {!delivered && phase !== "ready" && lineText && (
          <p key={`${phase === "paused" ? "p" : line}`} className={`hh-holdLine is-live${phase === "paused" ? " is-paused" : ""}`}>
            {lineText}
          </p>
        )}
        {delivered && (
          <div className="hh-delivered">
            <h2 className="hh-h hh-deliveredH">
              Hug <em>delivered.</em>
            </h2>
            {sticker && <span className="hh-holdSticker">{sticker}</span>}
          </div>
        )}
      </div>

      <div className="hh-holdFoot">
        {delivered ? (
          cta && (
            <span className="hh-rise">
              <PremiumCTA style={CTA_STYLE} tone="pearl" cue="tick" onClick={onNext}>
                Stay a little
              </PremiumCTA>
            </span>
          )
        ) : phase === "ready" || phase === "paused" ? (
          <>
            <button
              type="button"
              className="hh-keyHold"
              onKeyDown={(e) => {
                if ((e.key === " " || e.key === "Enter") && !e.repeat) {
                  e.preventDefault();
                  press();
                }
              }}
              onKeyUp={(e) => {
                if (e.key === " " || e.key === "Enter") release();
              }}
            >
              Press and hold anywhere
            </button>
            {helper && (
              <button type="button" className="hh-quiet" onClick={holdForMe}>
                Can&apos;t hold? Let it play
              </button>
            )}
          </>
        ) : null}
      </div>
      <style>{CSS}</style>
    </section>
  );
}

function NamePlate({ h, warm }: { h: Hug; warm?: boolean }) {
  return (
    <span className={`hh-plate${warm ? " is-warm" : ""}`} aria-hidden>
      <b>
        {initialOf(h.to)} <i>&amp;</i> {initialOf(h.from)}
      </b>
    </span>
  );
}

const CSS = `
.hh-holdScene { overflow: hidden; cursor: pointer; -webkit-tap-highlight-color: transparent; }
.hh-frame { position: absolute; inset: 0; overflow: hidden; background: #120C09; }
.hh-kb { position: absolute; inset: 0; }
.hh-holdScene.is-delivered .hh-kb { animation: hh-kb 16s cubic-bezier(.45,.05,.55,.95) both; }
@keyframes hh-kb { from { transform: scale(1); } to { transform: scale(1.07) translate3d(0,-1.5%,0); } }
.hh-bw, .hh-col { position: absolute; inset: 0; }
.hh-bw { filter: grayscale(1) contrast(1.1) brightness(.82); }
.hh-col { --r: -14%; opacity: 0; filter: saturate(1.12) contrast(1.04) brightness(1.03);
  -webkit-mask-image: radial-gradient(circle at var(--x) var(--y), #000 var(--r), transparent calc(var(--r) + 24%));
  mask-image: radial-gradient(circle at var(--x) var(--y), #000 var(--r), transparent calc(var(--r) + 24%)); }
.hh-col.is-on { opacity: var(--o, .5); }
.hh-colTint { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(255,190,140,.16), rgba(160,80,40,.14)); mix-blend-mode: soft-light; }
.hh-holdScene.is-delivered .hh-col { -webkit-mask-image: none; mask-image: none; opacity: 1; }
.hh-scrim { position: absolute; inset: 0; pointer-events: none;
  background: linear-gradient(180deg, rgba(18,12,9,.72) 0%, rgba(18,12,9,.18) 26%, rgba(18,12,9,0) 46%, rgba(18,12,9,.1) 70%, rgba(18,12,9,.7) 100%); }
.hh-flash { position: absolute; inset: 0; pointer-events: none; background: radial-gradient(circle at 50% 60%, rgba(255,236,214,.95), rgba(242,164,119,.4) 50%, transparent 80%);
  mix-blend-mode: screen; animation: hh-flash 1.6s cubic-bezier(.1,.7,.3,1) both; }
@keyframes hh-flash { 0% { opacity: 0; } 10% { opacity: .9; } 100% { opacity: 0; } }

.hh-ring { position: absolute; width: 108px; height: 108px; margin: -54px 0 0 -54px; pointer-events: none; transition: opacity .8s ease, transform .8s var(--hh-ease); }
.hh-holdScene.is-delivered .hh-ring { opacity: 0; transform: scale(1.6); }
.hh-arc { position: absolute; inset: 0; transform: rotate(-90deg); overflow: visible; }
.hh-arcTrack { fill: rgba(18,12,9,.22); stroke: rgba(250,247,242,.35); stroke-width: 1.2; }
.hh-arcFill { fill: none; stroke: var(--hh-apricot); stroke-width: 3; stroke-linecap: round; filter: drop-shadow(0 0 6px rgba(242,164,119,.8)); }
.hh-ringCore { position: absolute; inset: 22px; border-radius: 50%; display: grid; place-items: center; font: 500 22px/1 var(--hh-ui); font-variant-numeric: tabular-nums; color: var(--hh-cloud);
  background: radial-gradient(circle, rgba(255,226,204,.42), rgba(242,164,119,.12) 60%, transparent 72%); }
.hh-holdScene.is-ready .hh-ringCore { animation: hh-invite 1.9s ease-in-out infinite; }
@keyframes hh-invite { 0%, 100% { transform: scale(.9); opacity: .7; } 50% { transform: scale(1.06); opacity: 1; } }
.hh-holdScene.is-holding .hh-ringCore, .hh-holdScene.is-rising .hh-ringCore { background: radial-gradient(circle, rgba(255,236,214,.75), rgba(242,164,119,.3) 60%, transparent 72%); }
.hh-beat { position: absolute; inset: 0; border-radius: 50%; border: 2px solid rgba(255,214,180,.85); animation: hh-beat 1.1s cubic-bezier(.22,1,.36,1) both; }
.hh-beat2 { animation-delay: .16s; border-width: 1px; border-color: rgba(250,247,242,.6); }
@keyframes hh-beat { from { transform: scale(.85); opacity: .95; } to { transform: scale(2.6); opacity: 0; } }

.hh-holdTop { position: absolute; left: 0; right: 0; top: calc(max(var(--vw-top-space, 0px), 12px) + 66px); display: flex; justify-content: center; padding: 0 24px; pointer-events: none; }
.hh-holdTop .hh-eyebrow { color: rgba(250,247,242,.78); max-width: 30ch; text-wrap: balance; }
.hh-holdWords { position: absolute; left: 0; right: 0; top: 22%; display: flex; justify-content: center; padding: 0 28px; pointer-events: none; }
.hh-holdLine { margin: 0; font: 400 clamp(34px, 9.6vw, 64px)/1.04 var(--hh-display); letter-spacing: -.015em; color: var(--hh-cloud); max-width: 13ch; text-align: center; text-wrap: balance;
  text-shadow: 0 2px 30px rgba(18,12,9,.6); }
.hh-holdLine em { font-style: italic; color: var(--hh-apricot); }
.hh-holdLine.is-live { font-style: italic; animation: hh-line 1.6s var(--hh-ease) both; }
.hh-holdLine.is-paused { color: var(--hh-apricot); }
@keyframes hh-line { from { opacity: 0; transform: translateY(10px); filter: blur(8px); } to { opacity: 1; transform: none; filter: blur(0); } }
.hh-delivered { display: grid; justify-items: center; gap: 14px; animation: hh-up 1.4s .3s var(--hh-ease) both; }
.hh-deliveredH { font-size: clamp(56px, 17vw, 132px); text-shadow: 0 4px 40px rgba(18,12,9,.55); }
.hh-deliveredH em { color: var(--hh-cloud); }
.hh-holdSticker { display: block; }
.hh-holdFoot { position: absolute; left: 0; right: 0; bottom: calc(26px + env(safe-area-inset-bottom, 0px)); display: grid; justify-items: center; gap: 4px; padding: 0 24px; }
.hh-keyHold { all: unset; cursor: pointer; min-height: 44px; padding: 0 16px; border-radius: 99px; font: 700 11px/1 var(--hh-ui); letter-spacing: .26em; text-transform: uppercase; color: rgba(250,247,242,.82); }
.hh-keyHold:focus-visible { outline: 2px solid var(--hh-apricot); outline-offset: 2px; }
.hh-holdScene.is-paused .hh-keyHold { color: var(--hh-apricot); }
.hh-plate { display: grid; place-items: center; width: 100%; height: 100%; background: radial-gradient(circle at 50% 45%, #6b5444, #241913 70%); color: var(--hh-cloud); }
.hh-plate.is-warm { background: radial-gradient(circle at 50% 45%, #F7C3A0, #C9774A 55%, #4B3426); }
.hh-plate b { font: 400 clamp(96px, 30vw, 220px)/1 var(--hh-display); font-style: italic; letter-spacing: -.03em; }
.hh-plate b i { font-size: .5em; opacity: .7; }

@media (min-width: 900px) {
  .hh-frame { inset: auto; left: 50%; top: 50%; height: min(84svh, 820px); aspect-ratio: 4 / 5; transform: translate(-50%, -46%); border-radius: 4px;
    box-shadow: 0 50px 120px -40px rgba(0,0,0,.9), 0 0 0 1px rgba(250,247,242,.06); }
  .hh-holdWords { top: 26%; }
  .hh-holdLine { max-width: 15ch; }
  .hh-deliveredH { font-size: clamp(56px, 8.4vh, 96px); }
}
@media (prefers-reduced-motion: reduce) {
  .hh-holdScene.is-delivered .hh-kb, .hh-holdScene.is-ready .hh-ringCore { animation: none; }
  .hh-holdLine.is-live { animation: hh-fade .4s ease both; }
  .hh-flash { display: none; }
}
`;
