"use client";

// ─── The courtyard (the hero, spec 6.3 scene 3) ──────────────────────────────
// Five planes, back to front: the palace scene seen through the gates (dimmed
// under the theme wash) and a slowly turning gold mandala → the gold lattice
// jharokha that frames the names → jhoomars swaying from the ceiling and a
// gold-line peacock on each side → caparisoned elephants that walk in from the
// edges → the parapet with lit diyas, the toran above, gold dust drifting.
// The entrance is staged by `open` (CSS transitions with delays); the loops
// pause whenever the hero is off screen; one rAF-throttled scroll listener
// writes --rw-hy for the parallax exit (each plane reads it at its own rate).

import { useEffect, useMemo, useRef } from "react";
import { Monogram, photoImgStyle, useWeddingReducedMotion } from "../../../_wedding";
import type { LovePhoto } from "../../../_love/types";
import Toran from "./Toran";
import { artImg, seeded, type RoyalArt } from "./art";
import type { Strings } from "./model";

export interface CourtyardProps {
  open: boolean;
  look: RoyalArt;
  s: Strings;
  lang: "en" | "hi";
  first: string;
  second: string;
  photo: LovePhoto | null;
  dateLine: string;
  time: string;
  muhurat: string;
  venue: string;
}

export default function Courtyard({ open, look, s, lang, first, second, photo, dateLine, time, muhurat, venue }: CourtyardProps) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useWeddingReducedMotion();
  const dust = useMemo(() => {
    const r = seeded(73);
    return Array.from({ length: 8 }, () => ({ left: 6 + r() * 88, top: 30 + r() * 60, delay: -r() * 12, dur: 9 + r() * 6, dx: (r() - 0.5) * 70, size: 3 + r() * 4 }));
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    let on = true;
    const tick = () => {
      raf = 0;
      const y = Math.max(0, Math.min(window.scrollY, el.offsetHeight));
      el.style.setProperty("--rw-hy", `${y.toFixed(1)}px`);
    };
    const onScroll = () => {
      if (on && !raf && !reduce) raf = requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(([en]) => {
      on = en.isIntersecting;
      el.classList.toggle("is-idle", !on);
    });
    io.observe(el);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [reduce]);

  return (
    <header ref={ref} className={`rw-court${open ? " is-open" : ""}`}>
      <div className="rw-court-back" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img className="rw-court-scene" {...artImg(look.scene, { one: true })} style={{ opacity: look.sceneOpacity }} />
        <span className="rw-court-wash" />
        <span className="rw-court-mandala">
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img {...artImg("gold/gold-mandala-metallic-01", { one: true })} />
        </span>
      </div>

      <Toran className="rw-toran-court" count={13} seed={9} />

      <span className="rw-jhoomar rw-jhoomar-l" aria-hidden>
        <i />
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img {...artImg("royal/jhoomar-chandelier-gold-02")} />
      </span>
      <span className="rw-jhoomar rw-jhoomar-r" aria-hidden>
        <i />
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img {...artImg("royal/jhoomar-chandelier-gold-02")} />
      </span>

      <div className="rw-court-arch">
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img className="rw-court-frame" {...artImg("gold/gold-arch-lattice-frame-01")} />
        <div className="rw-court-in">
          <div className="rw-court-crest">
            {photo ? (
              <span className="rw-portrait">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo.url} alt={`${first} ${s.and} ${second}`} decoding="async" style={photoImgStyle(photo)} />
              </span>
            ) : (
              open && <Monogram a={first} b={second} variant="crest" size={78} />
            )}
          </div>
          <p className="wk-eyebrow rw-court-k" lang={lang}>
            {s.royalOf}
          </p>
          <h1 className="rw-court-names">
            <span className="rw-court-n wk-foil-text wk-shimmer">{first}</span>
            <span className="rw-amp" lang={lang}>
              {s.weds}
            </span>
            <span className="rw-court-n wk-foil-text wk-shimmer">{second}</span>
            <span className="rw-sweep" aria-hidden />
          </h1>
        </div>
      </div>

      <span className="rw-peacock rw-peacock-l" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img {...artImg("royal/peacock-ornate-01")} />
      </span>
      <span className="rw-peacock rw-peacock-r" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img {...artImg("royal/peacock-ornate-01")} />
      </span>

      <div className="rw-court-meta">
        {dateLine && (
          <p className="rw-cartouche">
            <span>{dateLine}</span>
            {time && <small>{time}</small>}
          </p>
        )}
        {muhurat && <p className="rw-court-muhurat">{muhurat}</p>}
        {venue && <p className="rw-court-venue">{venue}</p>}
      </div>

      <span className="rw-eleph rw-eleph-l" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img {...artImg(look.elephant)} />
      </span>
      <span className="rw-eleph rw-eleph-r" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img {...artImg(look.elephant)} />
      </span>

      <div className="rw-parapet" aria-hidden>
        {[0, 1, 2, 3, 4].map((i) => (
          <span key={i} className="rw-diya rw-diya-sm" style={{ ["--i" as string]: i }}>
            {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
            <img {...artImg("royal/diya-clay-flame-01")} />
            <i className="rw-flame" />
          </span>
        ))}
      </div>

      <div className="rw-dust" aria-hidden>
        {dust.map((d, i) => (
          <i key={i} style={{ left: `${d.left}%`, top: `${d.top}%`, width: d.size, height: d.size, animationDelay: `${d.delay}s`, animationDuration: `${d.dur}s`, ["--dx" as string]: `${d.dx}px` }} />
        ))}
      </div>

      <span className="rw-scroll-cue" aria-hidden>
        <i className="rw-bell" />
        <b lang={lang}>{s.scroll}</b>
      </span>
    </header>
  );
}
