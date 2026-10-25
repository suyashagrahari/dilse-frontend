"use client";

// ─── /wedding — the hero: stepping into an Indian wedding ────────────────────
//
// Full-bleed, a full screen tall, no card. The page opens straight onto a
// terrace at golden hour: a peacock's train
// fans open behind the couple, two more peacocks keep them company, marigold
// strands and gold jhumkas sway from the toran, lanterns glow and petals and
// feathers drift down. Scroll and (on desktop) the pointer move the layers at
// different depths.
//
// Performance: the couple is the LCP element (preloaded at high priority by
// page.tsx), the art is sized variants of public/wedding-v3/hub/lux served
// from the CDN with phone-sized sources, all motion is transform/opacity, the
// parallax writes each layer's translate in one rAF, and everything stops
// off-screen. prefers-reduced-motion gets a still scene.

import { useEffect, useRef, useState } from "react";
import { ArrowRight, CalendarCheck, ChevronDown, Languages, MessageCircle, Music2, Sparkles } from "lucide-react";
import { LUX } from "./content";

/** Deterministic pseudo-random, so the server and the client draw the same petals. */
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const DRIFT = (() => {
  const r = seeded(11);
  return Array.from({ length: 16 }, (_, i) => ({
    kind: i % 5 === 0 ? "feather" : i % 3 === 0 ? "rose" : "marigold",
    left: 2 + r() * 96,
    delay: -r() * 16,
    dur: 13 + r() * 10,
    dx: (r() - 0.5) * 160,
    size: i % 5 === 0 ? 30 + r() * 18 : 12 + r() * 10,
    spin: 180 + r() * 360,
    phone: i < 9,
  }));
})();

/** The peacock feather the train is drawn from: crisp at any size (the raster feather is 108px). */
function FeatherDefs() {
  return (
    <defs>
      <linearGradient id="whVane" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0" stopColor="#2f7d5b" stopOpacity=".15" />
        <stop offset=".45" stopColor="#3f9b6a" stopOpacity=".75" />
        <stop offset="1" stopColor="#7fbf6a" stopOpacity=".95" />
      </linearGradient>
      <radialGradient id="whEye1" cx=".5" cy=".55" r=".6">
        <stop offset="0" stopColor="#b9e07a" />
        <stop offset=".7" stopColor="#d9b85a" />
        <stop offset="1" stopColor="#c58f2c" />
      </radialGradient>
      <radialGradient id="whEye2" cx=".5" cy=".6" r=".6">
        <stop offset="0" stopColor="#1fb3a6" />
        <stop offset="1" stopColor="#0d6f78" />
      </radialGradient>
      <radialGradient id="whEye3" cx=".5" cy=".6" r=".6">
        <stop offset="0" stopColor="#2b4fb8" />
        <stop offset="1" stopColor="#13235f" />
      </radialGradient>
      <g id="whFeather">
        <path d="M0 0 C -6 -120 -40 -250 -58 -340 C -70 -410 -40 -470 0 -478 C 40 -470 70 -410 58 -340 C 40 -250 6 -120 0 0 Z" fill="url(#whVane)" />
        <path d="M0 -20 L-34 -150 M0 -60 L34 -190 M0 -110 L-46 -240 M0 -150 L46 -280 M0 -200 L-52 -320 M0 -240 L52 -350" stroke="#9fd27f" strokeOpacity=".45" strokeWidth="2.2" fill="none" />
        <line x1="0" y1="0" x2="0" y2="-470" stroke="#e9d9a0" strokeWidth="3" strokeLinecap="round" />
        <ellipse cx="0" cy="-392" rx="46" ry="62" fill="url(#whEye1)" />
        <ellipse cx="0" cy="-388" rx="33" ry="46" fill="#7a4a1c" />
        <ellipse cx="0" cy="-386" rx="27" ry="38" fill="url(#whEye2)" />
        <ellipse cx="0" cy="-382" rx="15" ry="22" fill="url(#whEye3)" />
      </g>
      {/* The glint on each eye is drawn by <GlintFan>, a twin svg above this one. */}
      <ellipse id="whGlint" cx="-6" cy="-396" rx="5" ry="8" fill="#fff" fillOpacity=".55" />
    </defs>
  );
}

/**
 * An image with a phone-only source. Phones take `phone` at any pixel ratio —
 * a 3x phone would otherwise pull the desktop file through a w-descriptor
 * srcset — and wider screens take `src`.
 */
function Pic({ phone, ...img }: React.ImgHTMLAttributes<HTMLImageElement> & { phone: string }) {
  return (
    <picture>
      <source media="(max-width: 767px)" srcSet={phone} />
      {/* eslint-disable-next-line jsx-a11y/alt-text -- sized art; alt comes from the caller */}
      <img decoding="async" {...img} />
    </picture>
  );
}

/** Parallax per layer .px0–.px4: [px per unit of pointer x, px per px of scroll, px per unit of pointer y]. Mirrors hero.css.ts. */
const PX: [number, number, number][] = [[0, 0.32, 0], [-8, 0.22, 0], [-12, 0.14, -6], [-18, 0.07, 0], [-26, 0.02, 0]];

const FAN = Array.from({ length: 17 }, (_, i) => -84 + i * 10.5);

/** Every feather of the train, long ones then the short ones in front, each a `<use>` of `href`. */
function Feathers({ href }: { href: string }) {
  return (
    <>
      {FAN.map((a, i) => (
        <g key={a} className="whFea" style={{ ["--a" as string]: `${a}deg`, ["--d" as string]: `${0.2 + Math.abs(i - 8) * 0.06}s` }}>
          <use href={href} x="500" y="500" />
        </g>
      ))}
      {FAN.filter((_, i) => i % 2 === 1).map((a) => (
        <g key={`s${a}`} className="whFea short" style={{ ["--a" as string]: `${a}deg`, ["--d" as string]: ".5s" }}>
          <use href={href} x="500" y="500" />
        </g>
      ))}
    </>
  );
}

/**
 * The peacock's train, fanned open behind the couple. The eye glints pulse on
 * a twin svg laid exactly over it: an opacity animation on an svg root runs on
 * the compositor, while the same animation on 25 shapes inside the train
 * repainted the whole fan every frame.
 */
function Fan() {
  return (
    <>
      <svg className="whFan" viewBox="0 0 1000 520" aria-hidden focusable="false">
        <FeatherDefs />
        <Feathers href="#whFeather" />
      </svg>
      <svg className="whFan whFanGlint" viewBox="0 0 1000 520" aria-hidden focusable="false">
        <Feathers href="#whGlint" />
      </svg>
    </>
  );
}


export default function HubHero() {
  const hero = useRef<HTMLElement>(null);
  const [entered, setEntered] = useState(false);
  // The scene plays its entrance as soon as the page paints: no door intro.
  useEffect(() => {
    const id = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // Parallax: scroll depth and (fine pointers only) the pointer, written as
  // each layer's own inline `translate` in one rAF (the same numbers as the
  // .px0–.px4 rules in hero.css.ts). Writing them as custom properties on the
  // hero restyled every element inside it on every scroll frame. The hero's
  // height is read once per resize, never inside a scroll handler.
  useEffect(() => {
    const el = hero.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const layers = PX.map((k, i) => ({ k, els: Array.from(el.querySelectorAll<HTMLElement>(`.px${i}`)) }));
    let raf = 0;
    let sy = 0, mx = 0, my = 0, tx = 0, ty = 0;
    let visible = true;
    let height = el.offsetHeight;
    const ro = new ResizeObserver(() => { height = el.offsetHeight; });
    ro.observe(el);
    const paint = () => {
      raf = 0;
      // Read in the frame, not in the scroll event: reading scrollY there
      // forces a style + layout pass on every event.
      sy = Math.min(window.scrollY, height);
      mx += (tx - mx) * 0.12;
      my += (ty - my) * 0.12;
      for (const { k, els } of layers) {
        const v = `${(mx * k[0]).toFixed(2)}px ${(sy * k[1] + my * k[2]).toFixed(2)}px`;
        for (const n of els) n.style.translate = v;
      }
      if (Math.abs(tx - mx) > 0.002 || Math.abs(ty - my) > 0.002) raf = requestAnimationFrame(paint);
    };
    const kick = () => { if (!raf && visible) raf = requestAnimationFrame(paint); };
    const onScroll = kick;
    const fine = window.matchMedia("(pointer: fine)").matches;
    const onMove = (e: PointerEvent) => {
      tx = (e.clientX / window.innerWidth) * 2 - 1;
      ty = (e.clientY / window.innerHeight) * 2 - 1;
      kick();
    };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      el.classList.toggle("is-off", !visible);
      if (visible) kick();
    });
    io.observe(el);
    window.addEventListener("scroll", onScroll, { passive: true });
    if (fine) window.addEventListener("pointermove", onMove, { passive: true });
    onScroll();
    return () => {
      io.disconnect();
      ro.disconnect();
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <section ref={hero} className={`whHero${entered ? " is-entered" : ""}`} aria-labelledby="wh-title">
      {/* ── sky, sun, far pavilions ── */}
      <div className="whSky px0" aria-hidden>
        <span className="whRays" />
        <span className="whSun" />
        <span className="whCloud a" />
        <span className="whCloud b" />
        <span className="whCloud c" />
      </div>
      <div className="whFar px1" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element -- distant pavilion */}
        <img className="whGazebo l" src={`${LUX}/gazebo-700.webp`} width={700} height={1113} alt="" loading="lazy" decoding="async" />
        {/* eslint-disable-next-line @next/next/no-img-element -- distant pavilion */}
        <img className="whGazebo r" src={`${LUX}/gazebo-700.webp`} width={700} height={1113} alt="" loading="lazy" decoding="async" />
      </div>

      {/* ── toran, marigold strands, jhumkas, lanterns ── */}
      <div className="whDecor" aria-hidden>
        <span className="whToran" />
        {[[1.5, 96, 210, 0], [9, 64, 130, -1.6], [91, 64, 150, -0.7], [98.5, 96, 220, -2.3]].map(([left, hm, hd, delay], i) => (
          <span key={i} className={`whStrand${i === 1 || i === 2 ? " inner" : ""}`} style={{ left: `${left}%`, ["--hm" as string]: `${hm}px`, ["--hd" as string]: `${hd}px`, animationDelay: `${delay}s` }} />
        ))}
        <span className="whJhumka a" />
        <span className="whJhumka b" />
        <span className="whJhumka c" />
        <span className="whLantern a" />
        <span className="whLantern b" />
      </div>

      <div className="whHeroGrid">
        {/* ── the words ── */}
        <div className="whCopy">
          <p className="whKicker">
            <span lang="hi">शुभ विवाह</span>
            <span aria-hidden className="whKickerDot">✦</span>
            Indian wedding invitations
          </p>
          <h1 id="wh-title" className="whH1">
            The world&rsquo;s most beautiful weddings{" "}
            <span className="whFoil">begin with an invitation</span>
          </h1>
          <p className="whLead">
            An Indian wedding is days of colour, music and family<span className="whLeadMore">: haldi, mehndi, sangeet, the pheras</span>.
            Our invitations carry every moment on one link, for every couple, of any faith, in any country.
          </p>
          <div className="whCtas">
            <a href="#designs" className="whBtn">Explore designs <ArrowRight size={17} aria-hidden /></a>
            <a href="#how" className="whBtn ghost"><Sparkles size={16} aria-hidden /> Fill it with AI</a>
          </div>
          <ul className="whTrust" aria-label="Included in every wedding design">
            <li><CalendarCheck size={14} aria-hidden /> RSVP per function</li>
            <li><Music2 size={14} aria-hidden /> Your music</li>
            <li><Languages size={14} aria-hidden /> Hindi &amp; English</li>
            <li><MessageCircle size={14} aria-hidden /> WhatsApp &amp; QR</li>
          </ul>
        </div>

        {/* ── the scene ── */}
        <div className="whScene">
          <div className="whFanWrap px2" aria-hidden><Fan /></div>
          <span className="whHalo px2" aria-hidden />
          <div className="whPeaFlowers px3" aria-hidden>
            <Pic phone={`${LUX}/peacock-flowers-360.webp`} src={`${LUX}/peacock-flowers-560.webp`} width={304} height={560} alt="" />
          </div>
          <div className="whCoupleBox px3">
            <Pic
              phone={`${LUX}/c-wedding-600.webp`}
              className="whHeroCouple"
              src={`${LUX}/c-wedding-800.webp`}
              width={446}
              height={800}
              // The LCP element on every width (page.tsx preloads the same two files).
              fetchPriority="high"
              alt="Illustrated bride in a red lehenga and groom in a sherwani, standing before a peacock's fanned train"
            />
          </div>
          <div className="whPeaStand px4" aria-hidden>
            <Pic phone={`${LUX}/peacock-stand-320.webp`} src={`${LUX}/peacock-stand-520.webp`} width={520} height={593} alt="" />
          </div>
          <div className="whPeaPerch px4" aria-hidden>
            {/* eslint-disable-next-line @next/next/no-img-element -- peacock perched on the balustrade */}
            <img src={`${LUX}/peacock-perch-560.webp`} width={274} height={560} alt="" loading="lazy" decoding="async" />
          </div>
        </div>
      </div>

      {/* ── terrace, flowers, drifting petals ── */}
      <div className="whTerrace px4" aria-hidden />
      <span className="whPeony l" aria-hidden />
      <span className="whPeony r" aria-hidden />
      <div className="whDrift" aria-hidden>
        {DRIFT.map((p, i) => (
          <i
            key={i}
            className={`${p.kind}${p.phone ? "" : " wide"}`}
            style={{
              left: `${p.left}%`, width: p.size, height: p.size,
              animationDelay: `${p.delay}s`, animationDuration: `${p.dur}s`,
              ["--dx" as string]: `${p.dx}px`, ["--spin" as string]: `${p.spin}deg`,
            }}
          />
        ))}
      </div>
      <a href="#journey" className="whCue">Begin the journey <ChevronDown size={18} aria-hidden /></a>
      <span className="whHeroFade" aria-hidden />

    </section>
  );
}
