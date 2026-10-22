"use client";

// ─── The garden (the hero): a watercolour scene the guest scrolls through ───
//
// Back to front, each plane on its own parallax rate (one rAF-throttled scroll
// listener writes --gw-sy on the hero; every plane reads it at its own k):
//   sky (k .45) → drifting clouds (k .35) → chhatri umbrellas + banana plants
//   at the edges (k .18) → the hedge wall + the gazebo, the couple standing in
//   it (k .08) → the peacock strutting along the hedge → lotus + rocks in the
//   foreground (k −.06) → the cherry branch and lanterns hanging from the top
//   (k −.12), petals drifting through all of it.
// The names sit in the sky above the gazebo.
//
// Entrance (`open`): the clouds part, the gazebo rises, the couple appears in
// it, the peacock walks in from the right and settles, the lanterns swing.
// After that only gentle loops (lantern sway, cloud drift, peacock bob, petals),
// paused whenever the hero is off screen. No parallax under reduced motion or
// on low-end phones (`lite`). Transform/opacity only.

import { useEffect, useRef, type ReactNode } from "react";
import { useWeddingReducedMotion } from "../../../_wedding";
import { GW, gwImg } from "../assets";
import type { Strings } from "./model";
import Petals from "./Petals";

export interface GardenHeroProps {
  open: boolean;
  lite: boolean;
  s: Strings;
  lang: "en" | "hi";
  first: string;
  second: string;
  guest: string;
  invocation: boolean;
  dateLine: string;
  time: string;
  muhurat: string;
  venue: string;
  actions?: ReactNode;
}

export default function GardenHero({ open, lite, s, lang, first, second, guest, invocation, dateLine, time, muhurat, venue, actions }: GardenHeroProps) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useWeddingReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    let on = true;
    const still = reduce || lite;
    const tick = () => {
      raf = 0;
      const y = Math.max(0, Math.min(window.scrollY, el.offsetHeight));
      el.style.setProperty("--gw-sy", `${y.toFixed(1)}px`);
    };
    const onScroll = () => {
      if (on && !raf && !still) raf = requestAnimationFrame(tick);
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
  }, [reduce, lite]);

  return (
    <header ref={ref} className={`gw-hero${open ? " is-open" : ""}`}>
      <div className="gw-l gw-l-sky" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img {...gwImg(GW.sky, { high: true })} />
      </div>
      <div className="gw-l gw-l-clouds" aria-hidden>
        <span className="gw-cloud gw-cloud-a">
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img {...gwImg(GW.cloudA)} />
        </span>
        <span className="gw-cloud gw-cloud-b">
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img {...gwImg(GW.cloudB)} />
        </span>
        <span className="gw-cloud gw-cloud-c">
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img {...gwImg(GW.cloudA)} />
        </span>
      </div>

      <div className="gw-l gw-l-far" aria-hidden>
        <span className="gw-a gw-banana gw-banana-l">
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img {...gwImg(GW.bananaL)} />
        </span>
        <span className="gw-a gw-chhatri gw-chhatri-l">
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img {...gwImg(GW.chhatri)} />
        </span>
        <span className="gw-a gw-chhatri gw-chhatri-r">
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img {...gwImg(GW.chhatri)} />
        </span>
        <span className="gw-a gw-banana gw-banana-r">
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img {...gwImg(GW.bananaR)} />
        </span>
      </div>

      <div className="gw-l gw-l-mid" aria-hidden>
        <span className="gw-a gw-hedge gw-hedge-l">
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img {...gwImg(GW.hedge)} />
        </span>
        <span className="gw-a gw-hedge gw-hedge-r">
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img {...gwImg(GW.hedge)} />
        </span>
        <span className="gw-gazebo">
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img className="gw-gazebo-img" {...gwImg(GW.gazebo, { high: true, hi: GW.gazebo2x, sizes: "(min-width: 1024px) 640px, 100vw" })} />
          <span className="gw-couple">
            {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
            <img {...gwImg(GW.couple, { alt: `${first} ${s.and} ${second}` })} />
          </span>
        </span>
        <span className="gw-peacock">
          <span className="gw-peacock-walk">
            {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
            <img {...gwImg(GW.peacock)} />
          </span>
        </span>
      </div>

      <div className="gw-l gw-l-front" aria-hidden>
        <span className="gw-a gw-lotus-f">
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img {...gwImg(GW.lotus)} />
        </span>
        <span className="gw-a gw-rocks-f">
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img {...gwImg(GW.rocks)} />
        </span>
      </div>

      <div className="gw-l gw-l-hang" aria-hidden>
        <span className="gw-blossom">
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img {...gwImg(GW.blossom)} />
        </span>
        <span className="gw-hang gw-hang-l">
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img {...gwImg(GW.lantern)} />
        </span>
        <span className="gw-hang gw-hang-r">
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img {...gwImg(GW.lanterns)} />
        </span>
      </div>

      {!lite && <Petals mode="drift" count={12} seed={31} className="gw-hero-petals" />}

      <div className="gw-hero-text">
        {invocation && (
          <p className="gw-mantra gw-ht gw-ht-1" lang="hi">
            ॥ श्री गणेशाय नमः ॥
          </p>
        )}
        <p className="wk-eyebrow gw-ht gw-ht-2" lang={lang}>
          {guest ? `${s.dear} ${guest}, ${s.invitedYou}` : s.together}
        </p>
        <h1 className="gw-names gw-ht gw-ht-3">
          <span className="gw-name">{first}</span>
          <span className="gw-amp" aria-label={s.and}>
            &amp;
          </span>
          <span className="gw-name">{second}</span>
        </h1>
        {dateLine && (
          <p className="gw-hdate gw-ht gw-ht-4">
            <span>{dateLine}</span>
            {(time || muhurat) && <small>{[time, muhurat].filter(Boolean).join(" · ")}</small>}
          </p>
        )}
        {venue && <p className="gw-hvenue gw-ht gw-ht-5">{venue}</p>}
        {actions && <div className="gw-ht gw-ht-6">{actions}</div>}
      </div>

      <span className="gw-cue" aria-hidden>
        <b lang={lang}>{s.scroll}</b>
        <i />
      </span>
    </header>
  );
}
