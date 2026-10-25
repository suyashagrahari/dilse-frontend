"use client";

// ─── /wedding — "Celebrate from anywhere" ────────────────────────────────────
//
// One invitation link leaving Jaipur and landing with family in eight cities.
// The map is a stylised dotted globe-lens, not a survey map; the arcs draw in
// once when the section is seen and little envelopes fly them on a loop. The
// clocks are the visitor's real current time in each city (client-only, so
// the server markup carries city names alone and nothing mismatches).

import { useEffect, useMemo, useRef, useState } from "react";
import { Clock3, Coins, Heart, Languages, Link2 } from "lucide-react";
import { CITIES, ORIGIN, WORLD_POINTS } from "./content";

const ICON = {
  link: <Link2 size={20} />,
  currency: <Coins size={20} />,
  clock: <Clock3 size={20} />,
  lang: <Languages size={20} />,
  faith: <Heart size={20} />,
};

function arc(x: number, y: number) {
  const dx = x - ORIGIN.x, dy = y - ORIGIN.y;
  const d = Math.hypot(dx, dy);
  const cx = (ORIGIN.x + x) / 2;
  const cy = Math.min(ORIGIN.y, y) - d * 0.34;
  return `M${ORIGIN.x} ${ORIGIN.y} Q${cx.toFixed(0)} ${cy.toFixed(0)} ${x} ${y}`;
}

function useClock(on: boolean) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    if (!on) return;
    const tick = () => setNow(new Date());
    const first = window.setTimeout(tick, 0);
    const t = window.setInterval(tick, 30_000);
    return () => { window.clearTimeout(first); window.clearInterval(t); };
  }, [on]);
  return now;
}

export default function HubWorld() {
  const ref = useRef<HTMLElement>(null);
  const map = useRef<SVGSVGElement>(null);
  const [seen, setSeen] = useState(false);
  const [motion, setMotion] = useState(false);
  const now = useClock(seen);

  useEffect(() => {
    const el = ref.current;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!el || !("IntersectionObserver" in window)) {
      const t = window.setTimeout(() => setSeen(true), 0);
      return () => clearTimeout(t);
    }
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setSeen(true); setMotion(!reduce); }
      el.classList.toggle("is-live", e.isIntersecting);
      // The envelopes are SMIL, which CSS cannot pause and which re-runs
      // style and paint on every frame: stop the svg's clock off-screen.
      // Its clock is held near zero while the page loads, so skip past the
      // staggered begins (0–2.8s): an envelope before its begin sits at 0,0.
      const svg = map.current;
      if (svg) {
        if (e.isIntersecting) {
          if (svg.getCurrentTime() < 3) svg.setCurrentTime(3);
          svg.unpauseAnimations();
        } else svg.pauseAnimations();
      }
    }, { threshold: 0.2 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const fmt = useMemo(() => {
    const m = new Map<string, Intl.DateTimeFormat>();
    for (const c of [...CITIES, ORIGIN]) m.set(c.tz, new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZone: c.tz }));
    return m;
  }, []);
  const time = (tz: string) => (now ? fmt.get(tz)!.format(now).toLowerCase() : "");
  const paths = useMemo(() => CITIES.map((c) => arc(c.x, c.y)), []);

  return (
    <section ref={ref} className={`whBand whWorld${seen ? " is-seen" : ""}`} aria-labelledby="wh-world">
      <div className="whIn">
        <div className="whHead">
          <p className="whEyebrow">Celebrate from anywhere</p>
          <h2 id="wh-world" className="whH2">One link, <em>every corner</em> of the family</h2>
          <p className="whSub">Half the family is in Jaipur, a cousin is in Toronto and your best friend is in London. Send one invitation, and it opens beautifully on every phone, in every time zone.</p>
        </div>

        <div className="whMap">
          <svg viewBox="0 0 1000 480" className="whMapSvg" role="img" aria-label="An invitation link travelling from Jaipur to San Francisco, Toronto, New York, London, Rome, Dubai, Singapore and Sydney">
            <defs>
              <pattern id="whDots" width="14" height="14" patternUnits="userSpaceOnUse">
                <circle cx="7" cy="7" r="1.6" fill="#b88a3a" />
              </pattern>
              <radialGradient id="whLens" cx=".5" cy=".5" r=".5">
                <stop offset="0" stopColor="#fff" />
                <stop offset=".75" stopColor="#fff" stopOpacity=".6" />
                <stop offset="1" stopColor="#fff" stopOpacity="0" />
              </radialGradient>
              <mask id="whLensMask"><ellipse cx="500" cy="250" rx="520" ry="250" fill="url(#whLens)" /></mask>
              <linearGradient id="whArc" x1="0" x2="1">
                <stop offset="0" stopColor="#c9a84c" />
                <stop offset="1" stopColor="#9b1c2a" />
              </linearGradient>
            </defs>
            <rect width="1000" height="480" fill="url(#whDots)" opacity=".5" mask="url(#whLensMask)" />
            {[110, 190, 270, 350].map((y) => (
              <path key={y} d={`M20 ${y} Q500 ${y - 70} 980 ${y}`} fill="none" stroke="#c9a84c" strokeOpacity=".22" strokeWidth="1.2" />
            ))}
            {[180, 340, 500, 660, 820].map((x) => (
              <path key={x} d={`M${x} 20 Q${x + (x - 500) * 0.18} 240 ${x} 460`} fill="none" stroke="#c9a84c" strokeOpacity=".16" strokeWidth="1.2" />
            ))}
            {paths.map((d, i) => (
              <g key={i}>
                <path d={d} fill="none" stroke="#c9a84c" strokeOpacity=".35" strokeWidth="1.6" strokeDasharray="2 7" strokeLinecap="round" />
                <path d={d} className="whArc" pathLength={1} fill="none" stroke="url(#whArc)" strokeWidth="2.2" strokeLinecap="round" style={{ transitionDelay: `${0.15 * i}s` }} />
              </g>
            ))}
          </svg>
          {/* Everything that moves, on a twin svg in its own layer: the pulses
              and the envelopes repaint every frame, and on their own they no
              longer repaint the masked dot field and the arcs underneath. */}
          <svg ref={map} viewBox="0 0 1000 480" className="whMapFx" aria-hidden focusable="false">
            {seen && motion && paths.map((d, i) => (
              <g key={i} className="whMover">
                <rect x="-8" y="-5.5" width="16" height="11" rx="2" fill="#fffaf2" stroke="#9b1c2a" strokeWidth="1.4" />
                <path d="M-8 -5 L0 1.5 L8 -5" fill="none" stroke="#9b1c2a" strokeWidth="1.3" />
                <animateMotion dur={`${3.6 + (i % 3) * 0.5}s`} begin={`${0.4 * i}s`} repeatCount="indefinite" path={d} rotate="0" keyPoints="0;1" keyTimes="0;1" calcMode="spline" keySplines=".45 0 .25 1" />
              </g>
            ))}
            {CITIES.map((c) => (
              <g key={c.name} transform={`translate(${c.x} ${c.y})`}>
                <circle className="whPulse" r="12" fill="#9b1c2a" fillOpacity=".18" />
                <circle r="5.5" fill="#9b1c2a" stroke="#fffaf2" strokeWidth="2" />
              </g>
            ))}
            <g transform={`translate(${ORIGIN.x} ${ORIGIN.y})`}>
              <circle className="whPulse big" r="22" fill="#c9a84c" fillOpacity=".3" />
              <circle r="10" fill="#c9a84c" stroke="#fffaf2" strokeWidth="3" />
              <path d="M0 -4 C 3 -1 3 2 0 4 C -3 2 -3 -1 0 -4 Z" fill="#9b1c2a" />
            </g>
          </svg>
          {[...CITIES.map((c) => ({ ...c, origin: false })), { ...ORIGIN, side: "b" as const, origin: true }].map((c) => (
            <span
              key={c.name}
              className={`whPin ${c.side}${c.origin ? " origin" : ""}`}
              style={{ left: `${c.x / 10}%`, top: `${(c.y / 480) * 100}%` }}
            >
              <b>{c.name}</b>
              <small suppressHydrationWarning>{c.origin ? "Your invitation" : time(c.tz)}</small>
            </span>
          ))}
        </div>

        <ul className="whClocks" aria-label="The time right now in each city">
          {[ORIGIN, ...CITIES].map((c) => (
            <li key={c.name}><b>{c.name}</b> <span suppressHydrationWarning>{time(c.tz) || "·"}</span></li>
          ))}
        </ul>

        <ul className="whWorldPts">
          {WORLD_POINTS.map((p, k) => (
            <li key={p.title} className="whWPt whR" style={{ transitionDelay: `${(k % 3) * 80}ms` }}>
              <span className="whWPtIc" aria-hidden>{ICON[p.icon]}</span>
              <h3>{p.title}</h3>
              <p>{p.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
