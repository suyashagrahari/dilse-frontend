"use client";

// ─── /wedding — the hero: stepping into an Indian wedding ────────────────────
//
// Full-bleed, a full screen tall, no card. A palace door opens on load and the
// visitor walks through it into a terrace at golden hour: a peacock's train
// fans open behind the couple, two more peacocks keep them company, marigold
// strands and gold jhumkas sway from the toran, lanterns glow and petals and
// feathers drift down. Scroll and (on desktop) the pointer move the layers at
// different depths.
//
// Performance: the headline is plain text (the LCP element), the art is sized
// variants from public/wedding-v3/hub/lux with phone-sized sources, all motion
// is transform/opacity, the parallax writes two CSS variables in one rAF, and
// everything stops off-screen. prefers-reduced-motion gets a still scene and
// no door.

import { useCallback, useEffect, useRef, useState } from "react";
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
        <ellipse className="whEyeGlint" cx="-6" cy="-396" rx="5" ry="8" fill="#fff" fillOpacity=".55" />
      </g>
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

const FAN = Array.from({ length: 17 }, (_, i) => -84 + i * 10.5);

/** The peacock's train, fanned open behind the couple. */
function Fan() {
  return (
    <svg className="whFan" viewBox="0 0 1000 520" aria-hidden focusable="false">
      <FeatherDefs />
      {FAN.map((a, i) => (
        <g key={a} className="whFea" style={{ ["--a" as string]: `${a}deg`, ["--d" as string]: `${0.2 + Math.abs(i - 8) * 0.06}s` }}>
          <use href="#whFeather" x="500" y="500" />
        </g>
      ))}
      {FAN.filter((_, i) => i % 2 === 1).map((a) => (
        <g key={`s${a}`} className="whFea short" style={{ ["--a" as string]: `${a}deg`, ["--d" as string]: ".5s" }}>
          <use href="#whFeather" x="500" y="500" />
        </g>
      ))}
    </svg>
  );
}

/** The palace door the page opens with. Once per session at full length; quick after that. */
function Gate({ onGone }: { onGone: () => void }) {
  const [phase, setPhase] = useState<"shut" | "open" | "gone">("shut");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let seen = false;
    try { seen = sessionStorage.getItem("wh-gate") === "1"; } catch { /* private mode */ }
    try { sessionStorage.setItem("wh-gate", "1"); } catch { /* private mode */ }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const t = window.setTimeout(() => { setPhase("gone"); onGone(); }, 0);
      return () => clearTimeout(t);
    }
    const imgs = Array.from(ref.current?.querySelectorAll("img") ?? []);
    const decoded = Promise.all(imgs.map((i) => i.decode().catch(() => undefined)));
    const timeout = new Promise((r) => setTimeout(r, seen ? 250 : 1400));
    let alive = true;
    const timers: number[] = [];
    Promise.race([decoded, timeout]).then(() => {
      if (!alive) return;
      timers.push(window.setTimeout(() => setPhase("open"), seen ? 60 : 380));
    });
    const skip = () => setPhase((p) => (p === "shut" ? "open" : p));
    window.addEventListener("wheel", skip, { passive: true, once: true });
    window.addEventListener("touchstart", skip, { passive: true, once: true });
    window.addEventListener("keydown", skip, { once: true });
    return () => {
      alive = false;
      timers.forEach(clearTimeout);
      window.removeEventListener("wheel", skip);
      window.removeEventListener("touchstart", skip);
      window.removeEventListener("keydown", skip);
    };
  }, [onGone]);

  useEffect(() => {
    if (phase !== "open") return;
    onGone();
    const t = window.setTimeout(() => setPhase("gone"), 2300);
    return () => clearTimeout(t);
  }, [phase, onGone]);

  if (phase === "gone") return null;
  return (
    <div ref={ref} className={`whGate${phase === "open" ? " is-open" : ""}`} aria-hidden onClick={() => setPhase("open")}>
      <span className="whGateWall" />
      <span className="whGateToran" />
      <span className="whGateEle l" />
      <span className="whGateEle r" />
      <span className="whGatePot l" />
      <span className="whGatePot r" />
      <div className="whGateDoor">
        <span className="whGateLight" />
        <span className="whGateRays" />
        {(["l", "r"] as const).map((s) => (
          <span key={s} className={`whGateLeaf ${s}`}>
            {/* Phones get the 820px leaf at any DPR: the door is on screen for two seconds. */}
            <picture>
              <source media="(max-width: 767px)" srcSet={`${LUX}/gate-leaf-${s}-820.webp`} />
              { }
              <img src={`${LUX}/gate-leaf-${s}-1360.webp`} width={352} height={1360} alt="" fetchPriority="high" decoding="async" />
            </picture>
            <i className="whGateShade" />
          </span>
        ))}
        <picture>
          <source media="(max-width: 767px)" srcSet={`${LUX}/gate-wall-900.webp`} />
          { }
          <img className="whGateArch" src={`${LUX}/gate-wall-1500.webp`} width={844} height={1500} alt="" fetchPriority="high" decoding="async" />
        </picture>
        <span className="whGateWelcome"><span lang="hi">स्वागतम्</span> Welcome</span>
      </div>
    </div>
  );
}

export default function HubHero() {
  const hero = useRef<HTMLElement>(null);
  const [entered, setEntered] = useState(false);
  const onGone = useCallback(() => setEntered(true), []);

  // Parallax: scroll depth and (fine pointers only) the pointer, as CSS vars.
  useEffect(() => {
    const el = hero.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    let sy = 0, mx = 0, my = 0, tx = 0, ty = 0;
    let visible = true;
    const paint = () => {
      raf = 0;
      mx += (tx - mx) * 0.12;
      my += (ty - my) * 0.12;
      el.style.setProperty("--sy", sy.toFixed(1));
      el.style.setProperty("--mx", mx.toFixed(3));
      el.style.setProperty("--my", my.toFixed(3));
      if (Math.abs(tx - mx) > 0.002 || Math.abs(ty - my) > 0.002) raf = requestAnimationFrame(paint);
    };
    const kick = () => { if (!raf && visible) raf = requestAnimationFrame(paint); };
    const onScroll = () => { sy = Math.min(window.scrollY, el.offsetHeight); kick(); };
    const fine = window.matchMedia("(pointer: fine)").matches;
    const onMove = (e: PointerEvent) => {
      tx = (e.clientX / window.innerWidth) * 2 - 1;
      ty = (e.clientY / window.innerHeight) * 2 - 1;
      kick();
    };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      el.classList.toggle("is-off", !visible);
    });
    io.observe(el);
    window.addEventListener("scroll", onScroll, { passive: true });
    if (fine) window.addEventListener("pointermove", onMove, { passive: true });
    onScroll();
    return () => {
      io.disconnect();
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

      <Gate onGone={onGone} />
    </section>
  );
}
