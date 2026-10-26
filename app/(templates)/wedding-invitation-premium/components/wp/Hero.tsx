"use client";

// ─── The hero: the Lake Terrace, painted like template6's card, kept quiet ───
// A still watercolour composed like the card: the pack's sky over misty
// hills and a calm lake (./Lake); a banana plant with a peacock perched in it
// behind the couple on their pink sofa at the left; the pink gazebo at the
// right with a peacock on its cornice and a palm behind it; anthuriums and a
// shrub at the front corners; template6's leaves-and-anthurium garland as the
// top border with blossom lanterns hanging from it; the white balustrade along the front. The names sit in rose script
// in the sky above it all. Nothing loops or drifts: each layer fades in once
// after the doors open (.is-on), then the page is still. Phones: words on
// top, the terrace below, all on the first screen.

import type { WeddingEvent } from "../../../_wedding";
import { HeroActions } from "./Actions";
import { img } from "./art";
import Lake from "./Lake";
import type { Motif, Strings } from "./model";

export interface HeroProps {
  open: boolean;
  lite: boolean;
  s: Strings;
  lang: "en" | "hi";
  first: string;
  second: string;
  guest: string;
  motif: Motif;
  dateLine: string;
  time: string;
  muhurat: string;
  place: string;
  main?: WeddingEvent;
  events: WeddingEvent[];
  couple: string;
  shareText: string;
}

export function MotifMark({ motif, className }: { motif: Motif; className?: string }) {
  if (motif === "none") return null;
  if (motif === "ganesha")
    return (
      <p className={`wp-motif wp-motif-text ${className ?? ""}`} lang="hi">
        ॥ श्री गणेशाय नमः ॥
      </p>
    );
  if (motif === "lotus")
    return (
      <span className={`wp-motif ${className ?? ""}`} aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img {...img("lotus")} className="wp-motif-lotus" />
      </span>
    );
  return (
    <span className={`wp-motif ${className ?? ""}`} aria-hidden>
      <svg viewBox="0 0 64 40" width="64" height="40" fill="none" stroke="currentColor" strokeWidth="2.2">
        <circle cx="25" cy="23" r="12" />
        <circle cx="39" cy="23" r="12" />
        <path d="M21 9l4-5 4 5" strokeWidth="1.6" />
      </svg>
    </span>
  );
}

export default function Hero(p: HeroProps) {
  const { open, s, lang } = p;
  const d = (ms: number) => ({ ["--d" as string]: `${ms}ms` });
  // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
  const art = (k: Parameters<typeof img>[0], c: string, lazy = false) => <img key={c} {...img(k, { lazy, high: !lazy })} className={`wp-sc ${c}`} />;
  return (
    <header className={`wp-hero${open ? " is-on" : ""}`}>
      <Lake className="wp-hero-lake" lotus={false} />
      <div className="wp-scene" aria-hidden>
        {art("palmTall", "wp-sc-palm")}
        {art("gazebo", "wp-sc-gazebo")}
        {art("peacockGreen", "wp-sc-peacock-r")}
        {art("bananaA", "wp-sc-banana")}
        {art("peacockGreen", "wp-sc-peacock-l")}
        <span className="wp-sc-rail" />
        {art("shrub", "wp-sc-shrub")}
        {art("couple", "wp-sc-couple")}
        {art("anthurium", "wp-sc-flora")}
      </div>
      {/* The top border: template6's leaves-and-anthurium garland, mirrored into a second half on wide screens. */}
      <div className="wp-garland" aria-hidden>
        <picture>
          <source media="(max-width: 700px)" srcSet={img("garlandSm").src} />
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <img {...img("garland", { high: true })} className="wp-garland-a" />
        </picture>
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img {...img("garland", { lazy: true })} className="wp-garland-b" />
      </div>
      <div className="wp-scene wp-scene-top" aria-hidden>
        {art("lanterns", "wp-sc-lantern is-l", true)}
        {art("lanterns", "wp-sc-lantern is-r", true)}
      </div>

      <div className="wp-hero-words">
        <MotifMark motif={p.motif} className="wp-in" />
        {p.guest && (
          <p className="wp-hero-dear wp-in" style={d(60)} lang={lang}>
            {s.dear} {p.guest},
          </p>
        )}
        <p className="wp-hero-kicker wp-in" style={d(120)} lang={lang}>
          {s.together}
        </p>
        <h1 className="wp-hero-names">
          <span className="wp-in" style={d(220)}>
            {p.first}
          </span>
          <i className="wp-in" style={d(320)}>
            &amp;
          </i>
          <span className="wp-in" style={d(420)}>
            {p.second}
          </span>
        </h1>
        <p className="wp-hero-line wp-in" style={d(540)} lang={lang}>
          {s.inviteLine}
        </p>
        <span className="wp-rule wp-in" style={d(600)} aria-hidden>
          <i />
        </span>
        {(p.dateLine || p.time) && (
          <p className="wp-hero-when wp-in" style={d(660)}>
            {[p.dateLine, p.time].filter(Boolean).join(" · ")}
          </p>
        )}
        {p.muhurat && (
          <p className="wp-hero-muhurat wp-in" style={d(720)}>
            {p.muhurat}
          </p>
        )}
        {p.place && (
          <p className="wp-hero-place wp-in" style={d(780)}>
            {p.place}
          </p>
        )}
        <div className="wp-in" style={d(860)}>
          <HeroActions main={p.main} all={p.events} couple={p.couple} s={s} shareText={p.shareText} />
        </div>
      </div>

      <a className="wp-hero-scroll" href="#invitation" aria-label={s.scroll}>
        <span lang={lang}>{s.scroll}</span>
        <i aria-hidden />
      </a>
    </header>
  );
}
