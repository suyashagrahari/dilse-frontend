"use client";

// ─── /wedding — the cinematic openings, live ─────────────────────────────────
//
// Ten miniature stages built from the same door/window kits the invitations
// use (public/wedding-v3/openings, cut down to /hub/lux). Each one opens when
// it scrolls into view, closes when it leaves (so it plays again), replays on
// hover with a fine pointer, and the round button replays it on a tap.
// Doors and shutters are clipped to their doorway so a sliding screen never
// spills over the carved frame.

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, RotateCcw } from "lucide-react";
import { LUX, OPENING_SHOWCASE, type Box, type DoorKit, type Opening } from "./content";

const pct = (n: number) => `${n}%`;
const boxStyle = ([l, t, w, h]: Box) => ({ left: pct(l), top: pct(t), width: pct(w), height: pct(h) });
/** A piece's box re-expressed inside the doorway clip. */
const inHole = ([l, t, w, h]: Box, [hl, ht, hw, hh]: Box): Box => [((l - hl) / hw) * 100, ((t - ht) / hh) * 100, (w / hw) * 100, (h / hh) * 100];

function Doors({ k }: { k: DoorKit }) {
  return (
    <>
      <span className="whOpHole" style={{ ...boxStyle(k.hole), background: k.sky }}>
        {k.bg && (
          // eslint-disable-next-line @next/next/no-img-element -- scene behind the doors
          <img className="whOpBg" src={k.bg} alt="" loading="lazy" decoding="async" />
        )}
        <span className="whOpGlow" />
        <span className="whOpCard"><i>Save</i> the date</span>
        <span className={`whOpClip ${k.motion}`}>
          {(["l", "r"] as const).map((s) => (
            <span key={s} className={`whOpLeaf ${s}`} style={boxStyle(inHole(k[s].box, k.hole))}>
              {/* eslint-disable-next-line @next/next/no-img-element -- door leaf */}
              <img src={k[s].src} alt="" loading="lazy" decoding="async" />
            </span>
          ))}
        </span>
      </span>
      {/* eslint-disable-next-line @next/next/no-img-element -- carved frame */}
      <img className="whOpFrame" src={k.frame} alt="" loading="lazy" decoding="async" />
      {k.toran && (
        // eslint-disable-next-line @next/next/no-img-element -- toran over the doorway
        <img className="whOpToran" src={k.toran.src} alt="" loading="lazy" decoding="async" style={boxStyle(k.toran.box)} />
      )}
    </>
  );
}

const PETALS = [-62, -40, -18, 0, 18, 40, 62];

function Lotus() {
  return (
    <span className="whLotus">
      <span className="whLotusPond" />
      <span className="whOpCard top"><i>Save</i> the date</span>
      <svg viewBox="0 0 300 400" className="whLotusSvg" aria-hidden focusable="false">
        <defs>
          <linearGradient id="whPetal" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" stopColor="#f6c2cf" />
            <stop offset=".6" stopColor="#fde4ea" />
            <stop offset="1" stopColor="#e57a98" />
          </linearGradient>
          <radialGradient id="whLotusCore" cx=".5" cy=".5" r=".5">
            <stop offset="0" stopColor="#fff3c4" />
            <stop offset="1" stopColor="#f2c14e" stopOpacity="0" />
          </radialGradient>
        </defs>
        <ellipse cx="70" cy="320" rx="70" ry="16" fill="#6fae7a" opacity=".85" />
        <ellipse cx="235" cy="328" rx="62" ry="14" fill="#5d9c6b" opacity=".85" />
        <circle className="whLotusCore" cx="150" cy="250" r="54" fill="url(#whLotusCore)" />
        {PETALS.map((a, i) => (
          <g key={a} className="whPet back" style={{ ["--a" as string]: `${a * 1.25}deg`, ["--d" as string]: `${0.08 * Math.abs(i - 3)}s` }}>
            <path d="M150 300 C 112 262 110 180 150 128 C 190 180 188 262 150 300 Z" fill="url(#whPetal)" opacity=".92" />
          </g>
        ))}
        {PETALS.slice(1, -1).map((a, i) => (
          <g key={`f${a}`} className="whPet" style={{ ["--a" as string]: `${a * 0.8}deg`, ["--d" as string]: `${0.25 + 0.06 * Math.abs(i - 2)}s` }}>
            <path d="M150 304 C 120 272 118 206 150 162 C 182 206 180 272 150 304 Z" fill="url(#whPetal)" />
          </g>
        ))}
      </svg>
    </span>
  );
}

function Envelope() {
  return (
    <span className="whEnv">
      <span className="whEnvBack" />
      <span className="whEnvCard">
        <i>You&rsquo;re</i>
        <b>invited</b>
        <small>Shubh Vivah</small>
      </span>
      <span className="whEnvFront" />
      <span className="whEnvFlap" />
      <span className="whEnvSeal">✦</span>
    </span>
  );
}

function Garden() {
  return (
    <span className="whGarden">
      <span className="whGardenSky" />
      {/* eslint-disable-next-line @next/next/no-img-element -- gazebo beyond the gate */}
      <img className="whGardenGazebo" src={`${LUX}/gazebo-700.webp`} alt="" loading="lazy" decoding="async" />
      <span className="whOpCard mid"><i>Save</i> the date</span>
      <span className="whGardenGate">
        <span className="whGardenLeaf l" />
        <span className="whGardenLeaf r" />
      </span>
      <span className="whGardenHedge l" />
      <span className="whGardenHedge r" />
      {/* eslint-disable-next-line @next/next/no-img-element -- floral arch over the gate */}
      <img className="whGardenArch" src={`${LUX}/floral-arch-900.webp`} alt="" loading="lazy" decoding="async" />
    </span>
  );
}

function Tile({ o, href, index }: { o: Opening; href: string; index: number }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLElement>(null);
  const timer = useRef(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      timer.current = window.setTimeout(() => setOpen(true), 0);
      return () => window.clearTimeout(timer.current);
    }
    const io = new IntersectionObserver(([e]) => {
      window.clearTimeout(timer.current);
      if (e.isIntersecting) timer.current = window.setTimeout(() => setOpen(true), 250 + (index % 5) * 140);
      else setOpen(false);
    }, { threshold: 0.6 });
    io.observe(el);
    return () => { io.disconnect(); window.clearTimeout(timer.current); };
  }, [index]);

  const replay = useCallback(() => {
    setOpen(false);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setOpen(true), 650);
  }, []);

  return (
    <article ref={ref} className={`whOp${open ? " is-open" : ""}`} onPointerEnter={(e) => { if (e.pointerType === "mouse") replay(); }}>
      <div className="whOpBox" aria-hidden>
        <div className={`whOpStage k-${o.id}`} style={{ aspectRatio: o.kit.aspect }}>
          {o.kit.kind === "doors" && <Doors k={o.kit} />}
          {o.kit.kind === "lotus" && <Lotus />}
          {o.kit.kind === "envelope" && <Envelope />}
          {o.kit.kind === "garden" && <Garden />}
        </div>
      </div>
      <button type="button" className="whOpReplay" onClick={replay} aria-label={`Play the ${o.name} opening again`}>
        <RotateCcw size={16} aria-hidden />
      </button>
      <div className="whOpBody">
        <h3 className="whOpName">{o.name}</h3>
        <p className="whOpLine">{o.line}</p>
        <Link href={href} className="whOpGo">See the design <ArrowRight size={14} aria-hidden /></Link>
      </div>
    </article>
  );
}

export default function HubOpenings({ visible }: { visible: Set<string> }) {
  return (
    <section className="whBand whOpenings" aria-labelledby="wh-openings">
      <div className="whIn">
        <div className="whHead">
          <p className="whEyebrow">Cinematic openings</p>
          <h2 id="wh-openings" className="whH2">The first tap is <em>the reveal</em></h2>
          <p className="whSub">Every guest opens your invitation to its own little ceremony: palace doors, jali windows, a lotus in bloom, a wax seal breaking. Watch them open.</p>
        </div>
        <div className="whOpRow" data-no-swipe>
          {OPENING_SHOWCASE.map((o, i) => (
            <Tile key={o.id} o={o} index={i} href={visible.has(o.slug) ? `/${o.slug}` : "#designs"} />
          ))}
        </div>
      </div>
    </section>
  );
}
