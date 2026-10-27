"use client";

// ─── The garden (the hero): a watercolour scene the guest scrolls through ───
//
// Back to front, each plane on its own parallax rate (one rAF-throttled scroll
// listener writes --gw-sy on the hero; every plane reads it at its own k):
//   sky (k .45) → drifting clouds (k .35) → banana plants at the edges
//   (k .18) → the chhatri umbrellas flanking the gazebo, the couple standing
//   in it (k .08) → a bunch of pink peonies in each bottom corner (k −.06) →
//   a cherry branch reaching in from each top corner (mirrored, k −.12),
//   petals drifting through all of it, a fine gold frame around the scene.
// The names sit in the sky above the gazebo.
//
// Entrance (`open`): the clouds part, the gazebo rises, the couple appears in
// it, the peonies grow in from the corners. After that the scene
// holds still (the owner wants nothing swinging); only the clouds drift and the
// petals fall, paused whenever the hero is off screen. No parallax under reduced motion or
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
      // A jump back to the top (Home key, an anchor) fires its scroll event while the hero is still
      // "off screen", so re-read the position now or the planes stay parked at the old offset.
      if (on && !still && !raf) raf = requestAnimationFrame(tick);
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
      <span className="gw-frame" aria-hidden />
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
          <img {...gwImg(GW.bananaL, { hi: GW.bananaLHi, sizes: "(min-width: 900px) 40vw, 60vw" })} />
        </span>
        <span className="gw-a gw-banana gw-banana-r">
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img {...gwImg(GW.bananaR, { hi: GW.bananaRHi, sizes: "(min-width: 900px) 40vw, 60vw" })} />
        </span>
      </div>

      <div className="gw-l gw-l-mid" aria-hidden>
        <span className="gw-a gw-chhatri gw-chhatri-l">
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img {...gwImg(GW.chhatri)} />
        </span>
        <span className="gw-a gw-chhatri gw-chhatri-r">
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img {...gwImg(GW.chhatri)} />
        </span>
        <span className="gw-gazebo">
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img className="gw-gazebo-img" {...gwImg(GW.gazebo, { high: true, hi: GW.gazebo2x, sizes: "(min-width: 1024px) 640px, 100vw" })} />
          <span className="gw-couple">
            {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
            <img {...gwImg(GW.couple, { alt: `${first} ${s.and} ${second}` })} />
          </span>
        </span>
      </div>

      <div className="gw-l gw-l-front" aria-hidden>
        <span className="gw-a gw-hcorner gw-hcorner-l">
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img {...gwImg(GW.peonyCorner, { hi: GW.peonyCorner2x, sizes: "(min-width: 900px) 30vw, 46vw" })} />
        </span>
        <span className="gw-a gw-hcorner gw-hcorner-r">
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img {...gwImg(GW.peonyCorner, { hi: GW.peonyCorner2x, sizes: "(min-width: 900px) 30vw, 46vw" })} />
        </span>
      </div>

      <div className="gw-l gw-l-hang" aria-hidden>
        <span className="gw-blossom gw-blossom-l">
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img {...gwImg(GW.blossom)} />
        </span>
        <span className="gw-blossom gw-blossom-r">
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img {...gwImg(GW.blossom)} />
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
