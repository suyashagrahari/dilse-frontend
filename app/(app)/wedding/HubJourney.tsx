"use client";

// ─── /wedding — "The journey of an Indian wedding" ───────────────────────────
//
// Seven functions, told for someone who has never been to one. Every function
// is its own little world: a colour, a couple and a motion layer drawn in CSS
// and SVG (haldi petals falling, a henna mandala drawing itself, sangeet stage
// beams, baraat fireworks, a garland circling the sacred fire, reception
// sparkles). Phones get a snap carousel with a peek of the next card and a
// segmented progress rail; from 768px the art pins in a sticky stage that
// stays still while the functions scroll past on the right.
//
// Motion is transform / opacity / stroke-dashoffset only, pauses whenever the
// section or a card is off-screen, and switches off for reduced motion.

import { memo, useEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type ReactNode } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { JOURNEY, type JourneyStep } from "./content";

type Vars = CSSProperties & Record<`--${string}`, string | number>;

/** Deterministic 0..1 noise, integer-only so server and client render identical styles. */
const rnd = (i: number, k: number) => ((i * 9301 + k * 49297 + 233) % 233280) / 233280;
const r2 = (n: number) => Math.round(n * 100) / 100;

type Range = { t?: number[]; s?: number[]; x?: number[] };
/** n particles spread across the scene: x (%), delay (s, negative so they start mid-flight), duration (s), size (px), turn (deg). */
function particles(n: number, seed: number, { t = [7, 11], s = [8, 14], x = [2, 96] }: Range = {}) {
  return Array.from({ length: n }, (_, i) => {
    const dur = t[0] + rnd(i, seed) * (t[1] - t[0]);
    return {
      x: r2(x[0] + ((i + rnd(i, seed + 3)) / n) * (x[1] - x[0])),
      d: r2(-rnd(i, seed + 1) * dur),
      t: r2(dur),
      s: r2(s[0] + rnd(i, seed + 2) * (s[1] - s[0])),
      r: Math.round(rnd(i, seed + 4) * 360),
    };
  });
}

type P = ReturnType<typeof particles>[number];
const pv = (p: P): Vars => ({ "--x": `${p.x}%`, "--d": `${p.d}s`, "--t": `${p.t}s`, "--s": `${p.s}px`, "--r": `${p.r}deg` });

function Fall({ list, kind }: { list: P[]; kind: string }) {
  return <>{list.map((p, i) => <span key={i} className="whFall" style={pv(p)}><i className={`whBit ${kind} k${i % 3}`} /></span>)}</>;
}
function Rise({ list, kind, glyphs }: { list: P[]; kind: string; glyphs?: string[] }) {
  return <>{list.map((p, i) => <span key={i} className="whRise" style={pv(p)}><i className={`whBit ${kind} k${i % 3}`}>{glyphs?.[i % glyphs.length]}</i></span>)}</>;
}
type Spark = { x: number; y: number; s: number; d: number };
function Twinkle({ list }: { list: Spark[] }) {
  return <>{list.map((p, i) => (
    <svg key={i} className="whStar" viewBox="-10 -10 20 20" style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.s, height: p.s, ["--d" as string]: `${p.d}s` }}>
      <path d="M0-10 2.2-2.2 10 0 2.2 2.2 0 10-2.2 2.2-10 0-2.2-2.2Z" />
    </svg>
  ))}</>;
}

const HALDI_PETALS = particles(14, 11, { t: [6, 10], s: [9, 15] });
const HALDI_BLOOMS = particles(4, 17, { t: [9, 13], s: [18, 24], x: [8, 88] });
const ROKA_PETALS = particles(9, 23, { t: [8, 12], s: [9, 13] });
const MEHNDI_DOTS = particles(8, 29, { t: [8, 12], s: [4, 7] });
const NOTES = particles(7, 31, { t: [6, 9], s: [16, 24], x: [6, 92] });
const CONFETTI = particles(16, 37, { t: [5, 8], s: [6, 10] });
const EMBERS = particles(10, 41, { t: [3.2, 5], s: [3, 6], x: [34, 66] });
const BOKEH = particles(9, 43, { t: [9, 14], s: [14, 30] });
const SPARKS: Spark[] = [
  { x: 10, y: 28, s: 18, d: 0 }, { x: 84, y: 22, s: 14, d: -.8 }, { x: 18, y: 58, s: 12, d: -1.6 }, { x: 80, y: 52, s: 20, d: -2.2 },
  { x: 50, y: 12, s: 12, d: -.4 }, { x: 30, y: 40, s: 10, d: -1.2 }, { x: 70, y: 70, s: 12, d: -2.6 }, { x: 8, y: 80, s: 14, d: -1.9 },
];
const ROKA_SPARKS: Spark[] = [{ x: 22, y: 16, s: 14, d: 0 }, { x: 76, y: 30, s: 12, d: -1.1 }, { x: 14, y: 46, s: 10, d: -2 }, { x: 86, y: 60, s: 12, d: -.6 }];
const FAIRY = Array.from({ length: 11 }, (_, i) => ({ x: 4 + i * 9.2, y: 7 + Math.abs(5 - i) * 1.3 + (i % 2) * 2, d: -(i * 0.37) }));

const ring = (n: number, d: string, off = 0, delay = 0) =>
  Array.from({ length: n }, (_, k) => (
    <path key={k} d={d} pathLength={1} className="whDraw" transform={`rotate(${off + (360 / n) * k})`} style={{ ["--d" as string]: `${r2(delay + k * 0.06)}s` }} />
  ));
const onCircle = (n: number, r: number, k: number, off = 0) => {
  const a = ((off + (k * 360) / n) * Math.PI) / 180;
  return { cx: r2(Math.sin(a) * r), cy: r2(-Math.cos(a) * r) };
};

/** A henna mandala in a -100..100 box; every stroke draws itself (pathLength = 1). */
function Mandala() {
  return (
    <svg className="whMandala" viewBox="-100 -100 200 200">
      <circle r="12" pathLength={1} className="whDraw" />
      {ring(8, "M0-12C5-18 5-24 0-28-5-24-5-18 0-12Z", 0, 0.2)}
      <circle r="32" pathLength={1} className="whDraw" style={{ ["--d" as string]: ".7s" }} />
      <circle r="36" pathLength={1} className="whDraw thin" style={{ ["--d" as string]: ".8s" }} />
      {ring(12, "M0-38C11-48 12-62 0-74-12-62-11-48 0-38Z", 0, 1)}
      {ring(12, "M0-46C4-52 4-58 0-62-4-58-4-52 0-46Z", 0, 1.3)}
      {ring(12, "M0-72C7-80 7-88 0-96-7-88-7-80 0-72Z", 15, 1.9)}
      <circle r="78" pathLength={1} className="whDraw thin" style={{ ["--d" as string]: "2.4s" }} />
      {Array.from({ length: 24 }, (_, k) => <circle key={k} {...onCircle(24, 86, k)} r="2.2" className="whDot" style={{ ["--d" as string]: `${r2(2.6 + k * 0.04)}s` }} />)}
    </svg>
  );
}

/** A marigold-and-jasmine garland on a red thread, seen from the side as it circles the couple. */
function Garland() {
  return (
    <svg viewBox="-100 -100 200 200">
      <circle r="90" className="whThread" />
      {Array.from({ length: 28 }, (_, k) => <circle key={k} {...onCircle(28, 90, k)} r={k % 2 ? 3.4 : 6} className={k % 2 ? "whJasmine" : "whMarigold"} />)}
    </svg>
  );
}

function Burst({ x, y, s, d }: { x: number; y: number; s: number; d: number }) {
  return (
    <span className="whBurst" style={{ left: `${x}%`, top: `${y}%`, width: `${s}%`, ["--d" as string]: `${d}s` }}>
      <svg viewBox="-20 -20 40 40">
        {Array.from({ length: 12 }, (_, k) => <line key={k} x1="0" y1="-7" x2="0" y2="-15" transform={`rotate(${k * 30})`} />)}
        {Array.from({ length: 12 }, (_, k) => <circle key={k} cx="0" cy="-18" r="1.3" transform={`rotate(${k * 30 + 15})`} />)}
      </svg>
    </span>
  );
}

/** The motion layer behind (back) or in front of (front) the couple. */
function Fx({ id, layer }: { id: string; layer: "back" | "front" }) {
  const back = layer === "back";
  let body: ReactNode = null;
  switch (id) {
    case "roka":
      body = back ? (
        <svg className="whRings" viewBox="0 0 200 130">
          <circle cx="76" cy="70" r="50" pathLength={1} className="whDraw" />
          <circle cx="124" cy="70" r="50" pathLength={1} className="whDraw" style={{ ["--d" as string]: ".6s" }} />
          <path d="M76 6l8 8-8 9-8-9Z" pathLength={1} className="whDraw gem" style={{ ["--d" as string]: "1.2s" }} />
        </svg>
      ) : <><Fall list={ROKA_PETALS} kind="rose" /><Twinkle list={ROKA_SPARKS} /></>;
      break;
    case "haldi":
      body = back ? <span className="whRays" /> : <><Fall list={HALDI_PETALS} kind="petal" /><Fall list={HALDI_BLOOMS} kind="bloom" /></>;
      break;
    case "mehndi":
      body = back ? <Mandala /> : <Rise list={MEHNDI_DOTS} kind="dot" />;
      break;
    case "sangeet":
      body = back
        ? <><span className="whBeam b0" /><span className="whBeam b1" /><span className="whBeam b2" /><span className="whBeam b3" /></>
        : <Rise list={NOTES} kind="note" glyphs={["♪", "♫", "♬", "♩"]} />;
      break;
    case "baraat":
      body = back
        ? <><Burst x={4} y={4} s={30} d={0} /><Burst x={62} y={2} s={34} d={-1.4} /><Burst x={36} y={16} s={24} d={-2.6} /></>
        : <Fall list={CONFETTI} kind="confetti" />;
      break;
    case "pheras":
      body = back
        ? <><span className="whFire" /><span className="whOrbit back"><span className="whOrbitSpin"><Garland /></span></span></>
        : <><span className="whOrbit front"><span className="whOrbitSpin"><Garland /></span></span><Rise list={EMBERS} kind="ember" /></>;
      break;
    case "reception":
      body = back
        ? <><Rise list={BOKEH} kind="bokeh" />{FAIRY.map((f, i) => <span key={i} className="whFairy" style={{ left: `${r2(f.x)}%`, top: `${r2(f.y)}%`, ["--d" as string]: `${r2(f.d)}s` }} />)}</>
        : <Twinkle list={SPARKS} />;
      break;
  }
  return <span className={`whFx ${layer} fx-${id}`} aria-hidden>{body}</span>;
}

/** Memoised: a scene never changes, and the section re-renders on every step change. */
const Scene = memo(function Scene({ s }: { s: JourneyStep }) {
  const c = s.couple;
  return (
    <div className={`whJScene sc-${s.id}`} style={{ "--tint": s.tint, "--deep": s.deep, "--glow": s.glow } as Vars}>
      <span className="whJHalo" aria-hidden />
      <Fx id={s.id} layer="back" />
      {s.props.map((p, k) => (
        // eslint-disable-next-line @next/next/no-img-element -- placed prop art
        <img
          key={k}
          src={p.src}
          width={p.w}
          height={p.h}
          alt=""
          aria-hidden
          loading="lazy"
          decoding="async"
          className={`whJProp${p.cls ? ` ${p.cls}` : ""}${p.flip ? " flip" : ""}`}
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: `${p.width}%`, zIndex: p.z ?? 2 }}
        />
      ))}
      <span className="whJCoupleBox" style={{ left: `${c.cx ?? 50}%`, height: `${c.ch ?? 80}%` }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- the couple for this function */}
        <img className="whJCouple" src={c.src} width={c.w} height={c.h} alt={c.alt} loading="lazy" decoding="async" />
      </span>
      <Fx id={s.id} layer="front" />
    </div>
  );
});

/** Gold filigree in the four corners of a frame (one drawing, rotated). */
const Corners = memo(function Corners() {
  return <>{["tl", "tr", "br", "bl"].map((c) => (
    <svg key={c} className={`whJCorner ${c}`} viewBox="0 0 40 40" aria-hidden>
      <path d="M3 36V18C3 9.7 9.7 3 18 3h18M9 36V20c0-6 5-11 11-11h16" />
      <circle cx="15" cy="15" r="2.2" />
    </svg>
  ))}</>;
});

const pad = (n: number) => String(n).padStart(2, "0");

const WIDE = "(min-width: 768px)";
const subscribeWide = (cb: () => void) => {
  const mq = window.matchMedia(WIDE);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};

/**
 * Whether the sticky stage is on screen at all (768px and up). The server and
 * the hydrating render both say no, so the stage's seven scenes (~600 nodes,
 * display:none on phones) are never sent to, or hydrated on, a phone; on a
 * wide screen they mount right after hydration, well before the reader
 * scrolls down to them.
 */
function useWide() {
  return useSyncExternalStore(subscribeWide, () => window.matchMedia(WIDE).matches, () => false);
}

export default function HubJourney({ visible }: { visible: Set<string> }) {
  const [active, setActive] = useState(0);
  const wide = useWide();
  const section = useRef<HTMLElement>(null);
  const list = useRef<HTMLOListElement>(null);
  const stage = useRef<HTMLDivElement>(null);

  // The stage's scenes mount one per idle slot after hydration (the one in
  // front at once), so no single task builds all seven.
  const [ready, setReady] = useState(0);
  useEffect(() => {
    if (!wide || ready >= JOURNEY.length) return;
    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 50));
    const cancel = window.cancelIdleCallback ?? window.clearTimeout;
    const id = idle(() => setReady((n) => n + 1));
    return () => cancel(id);
  }, [wide, ready]);

  // A stage scene that has finished fading out is hidden with its loops
  // removed (data-rest), so six invisible scenes cost no layers or frames.
  // Set outside React so a re-render never clears it.
  useEffect(() => {
    const frames = stage.current?.querySelectorAll<HTMLElement>(".whJFrame");
    if (!frames?.length) return;
    frames.forEach((f) => { if (f.classList.contains("is-on")) delete f.dataset.rest; });
    const t = window.setTimeout(() => frames.forEach((f) => { if (!f.classList.contains("is-on")) f.dataset.rest = ""; }), 1500);
    return () => window.clearTimeout(t);
  }, [active, wide, ready]);

  // Which function is in view: the middle of the viewport on wide screens, the snapped card on phones.
  useEffect(() => {
    const el = list.current;
    if (!el || !("IntersectionObserver" in window)) return;
    const wide = window.matchMedia("(min-width: 768px)");
    let io: IntersectionObserver | null = null;
    const wire = () => {
      io?.disconnect();
      io = new IntersectionObserver(
        (entries) => entries.forEach((e) => {
          if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.i));
        }),
        wide.matches ? { rootMargin: "-48% 0px -48% 0px" } : { root: el, threshold: 0.6 },
      );
      el.querySelectorAll(".whJStep").forEach((n) => io!.observe(n));
    };
    wire();
    wide.addEventListener("change", wire);
    return () => { io?.disconnect(); wide.removeEventListener("change", wire); };
  }, []);

  // Every animation in the section pauses while it is off-screen.
  useEffect(() => {
    const el = section.current;
    if (!el) return;
    if (!("IntersectionObserver" in window)) { el.classList.add("is-live"); return; }
    const io = new IntersectionObserver(([e]) => el.classList.toggle("is-live", e.isIntersecting), { rootMargin: "80px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const go = (i: number) => {
    const el = list.current;
    const card = el?.querySelectorAll<HTMLElement>(".whJStep")[i];
    if (el && card) el.scrollTo({ left: card.offsetLeft - el.offsetLeft - 16, behavior: "smooth" });
  };

  const now = JOURNEY[active];

  return (
    <section ref={section} className="whBand whJourney" id="journey" aria-labelledby="wh-journey">
      <div className="whIn">
        <div className="whHead">
          <p className="whEyebrow">The journey of an Indian wedding</p>
          <h2 id="wh-journey" className="whH2">Seven celebrations, <em>one invitation</em></h2>
          <p className="whSub">Never been to an Indian wedding? Here is what happens over the days of celebration, and how one link invites your guests to every moment of it.</p>
        </div>

        <div className="whJ" style={{ "--p": active / (JOURNEY.length - 1), "--deep": now.deep, "--glow": now.glow, "--tint": now.tint } as Vars}>
          <div className="whJStageWrap" aria-hidden>
            <div className="whJStage" ref={stage}>
              {wide && JOURNEY.map((s, i) => (i === active || i < ready) && (
                <div key={s.id} className={`whJFrame${i === active ? " is-on" : ""}`}>
                  <Scene s={s} />
                </div>
              ))}
              <span key={active} className="whJWash" />
              <Corners />
            </div>
            <span className="whJCount"><b>{pad(active + 1)}</b> / {pad(JOURNEY.length)}<em>{now.name}</em></span>
          </div>

          <ol className="whJList" ref={list} data-no-swipe aria-label="The functions of an Indian wedding">
            <span className="whJThread" aria-hidden><i /></span>
            {JOURNEY.map((s, i) => {
              const href = visible.has(s.slug) ? `/${s.slug}` : "#designs";
              return (
                <li key={s.id} className={`whJStep${i === active ? " is-on" : ""}`} data-i={i} style={{ "--deep": s.deep, "--tint": s.tint, "--glow": s.glow } as Vars}>
                  <div className="whJCardArt"><Scene s={s} /><Corners /></div>
                  <div className="whJText">
                    <p className="whJKick"><span className="whJNum">{pad(i + 1)}</span>{s.mood}</p>
                    <h3 className="whJName">{s.name}</h3>
                    <p className="whJLine">{s.line}</p>
                    <p className="whJTip"><b>For guests</b>{s.tip}</p>
                    <Link href={href} className="whJGo"><span>{s.cta}</span><i aria-hidden><ArrowRight size={15} /></i></Link>
                  </div>
                </li>
              );
            })}
          </ol>

          <div className="whJNav">
            <p className="whJNow" aria-live="polite"><b>{pad(active + 1)}</b><span>/ {pad(JOURNEY.length)}</span>{now.name}</p>
            <div className="whJSegs" role="group" aria-label="Jump to a function">
              {JOURNEY.map((s, i) => (
                <button key={s.id} type="button" className={i === active ? "is-on" : i < active ? "is-past" : ""} onClick={() => go(i)} aria-label={`Show ${s.name}`} aria-pressed={i === active}>
                  <i />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
