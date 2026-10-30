"use client";

// ─── The hero: the invitation itself, inside the faith's arch ───────────────
// One composition, three faiths (the art comes from the profile):
//   Anand Karaj  the ivory-and-gold arch over Sri Guru Granth Sahib Ji, the
//                Khanda on its gutka stand, gold lanterns; Ik Onkar in gold
//                foil, the Fateh, the names; the Golden Temple, faint, below.
//   Nikah        the sage-and-gold Mughal arch with its two lanterns (their
//                flames breathe); the Bismillah in gold, the names; the couple
//                seated either side of the floral partition, at its foot;
//                gold lanterns, crescents and stars across the top.
//   Holy         the carved stone chapel arch crowned with white lilies, the
//   Matrimony    gold cross, the names, roses and lilies at its foot.
// Nothing hangs or swings: the art is still, only light moves (a slow gold
// sheen across the card, gold motes rising, the lantern glow). The copy lives
// INSIDE the card and its type scales with the card (container units), so no
// name is ever cut. The entrance is staged by `open`; a rAF-throttled scroll
// listener writes --fw-hy for a gentle parallax exit; loops pause off screen.

import { useEffect, useMemo, useRef, type ReactNode } from "react";
import { cdn, useWeddingReducedMotion } from "../_wedding";
import { seeded, useArt, usePic } from "./art";
import type { FaithId, Lang, Strings } from "./types";

/** The invocation image's description, per faith (the art itself is the profile's `invocation`). */
const INVOCATION_ALT: Partial<Record<FaithId, string>> = {
  muslim: "Bismillah ir-Rahman ir-Rahim",
  tamil: "Shri Ganesha",
  telugu: "Shri Ganesha",
  kannada: "Shri Ganesha",
  marathi: "Shri Ganesha",
  malayalam: "The nilavilakku",
};

/** The faith's invocation: Ik Onkar · the cross · or the profile's own image (the Bismillah, Shri Ganesha, the lamp). */
export function Invocation({ faith, className = "" }: { faith: FaithId; className?: string }) {
  const pic = usePic();
  if (faith === "sikh")
    return (
      <span className={`fh-inv is-sikh ${className}`} lang="pa" aria-label="Ik Onkar">
        ੴ
      </span>
    );
  if (faith !== "christian")
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img className={`fh-inv is-${faith} is-img ${className}`} {...pic("invocation", { high: true })} alt={INVOCATION_ALT[faith] ?? ""} />
    );
  return (
    <span className={`fh-inv is-christian ${className}`} aria-hidden>
      <svg viewBox="0 0 64 64" focusable="false">
        <g className="fh-rays">
          {Array.from({ length: 16 }, (_, i) => (
            <line key={i} x1="32" y1="32" x2={32 + 30 * Math.cos((i * Math.PI) / 8)} y2={32 + 30 * Math.sin((i * Math.PI) / 8)} />
          ))}
        </g>
        <path className="fh-cross" d="M29.6 10h4.8v12.4h11.2v4.8H34.4V54h-4.8V27.2H18.4v-4.8h11.2z" />
      </svg>
    </span>
  );
}

export interface HeroSceneProps {
  faith: FaithId;
  s: Strings;
  lang: Lang;
  first: string;
  second: string;
  guest?: string;
  dateLine?: string;
  time?: string;
  venue?: string;
  invocation: boolean;
  /** The finale's copy of the card: lazy art, no greeting. */
  lazy?: boolean;
  /** Heading level for the names. */
  as?: "h1" | "p";
  /** Replaces the copy under the invocation (the finale's goodbye). */
  copy?: ReactNode;
}

/** The invitation's words: the invocation, the greeting, the names, the date and the venue. */
function HeroCopy({ faith, s, lang, first, second, guest, dateLine, time, venue, invocation, as = "h1", copy }: Omit<HeroSceneProps, "lazy">) {
  const Names = as;
  return (
    <>
      {invocation && <Invocation faith={faith} className="fw-hi-1" />}
      {copy ?? (

        <>
          {s.greeting && (
            <p className="fh-greet fw-hi-1" lang={lang}>
              {s.greeting}
            </p>
          )}
          {guest && (
            <p className="fh-dear fw-hi-2" lang={lang}>
              {s.dear} {guest},
            </p>
          )}
          <p className="fh-eyebrow fw-hi-2" lang={lang}>
            {s.togetherWith}
          </p>
          <Names className="fh-names">
            <span className="fh-n fw-hi-3">{first}</span>
            <span className="fh-amp fw-hi-4" aria-label={s.and}>
              &amp;
            </span>
            <span className="fh-n fw-hi-5">{second}</span>
          </Names>
          <p className="fh-sub fw-hi-6" lang={lang}>
            {s.gettingMarried}
          </p>
          {dateLine && (
            <p className="fh-date fw-hi-7">
              <span>{dateLine}</span>
              {time && <small>{time}</small>}
            </p>
          )}
          {venue && <p className="fh-venue fw-hi-8">{venue}</p>}
        </>
      )}
    </>
  );
}

/** The arched card with its copy (the hero; the finale wears a quieter copy of it). */
export function HeroCard({ faith, s, lang, first, second, guest, dateLine, time, venue, invocation, lazy, as = "h1", copy }: HeroSceneProps) {
  const pic = usePic();
  const art = useArt();
  const high = !lazy;
  return (
    <div className="fh-card">
      {art.heroBgTall ? (
        // Phones get the arch with lengthened pillars, so the doorway runs the full height of the screen.
        <picture>
          <source media="(max-width: 1023px)" srcSet={cdn(art.heroBgTall.src)} width={art.heroBgTall.w} height={art.heroBgTall.h} />
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <img className="fh-card-bg" {...pic("heroBg", { high, lazy, sizes: "(min-width: 1024px) 700px, 100vw" })} />
        </picture>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
        <img className="fh-card-bg" {...pic("heroBg", { high, lazy, sizes: "(min-width: 1024px) 560px, 94vw" })} />
      )}
      {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
      {art.heroCrown && <img className="fh-crown" {...pic("heroCrown", { high, lazy, sizes: "(min-width: 1024px) 620px, 100vw" })} />}
      <span className="fh-glow is-l" aria-hidden />
      <span className="fh-glow is-r" aria-hidden />
      <div className="fh-copy">
        <HeroCopy {...{ faith, s, lang, first, second, guest, dateLine, time, venue, invocation, as, copy }} />
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
      {art.heroFigure && <img className="fh-figure" {...pic("heroFigure", { high, lazy, sizes: "(min-width: 1024px) 420px, 70vw" })} />}
      <i className="fh-sheen" aria-hidden />
    </div>
  );
}

/** The faith's full-screen world behind the arch: the wall, the floor, the flanking arches, urns, garlands
 *  and corner florals (the hero, and the last page, which wears the same scene). */
export function Scene({ lazy }: { lazy?: boolean }) {
  const pic = usePic();
  const art = useArt();
  const L = lazy ? { lazy: true } : {};
  return (
    <>
      <span className="fw-frame" aria-hidden />
      <span className="fh-wall" aria-hidden />
      <span className="fh-floor" aria-hidden />
      <div className="fh-bank" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        {art.heroFlank && <img className="fh-flank is-l" {...pic("heroFlank", { ...L, sizes: "40vw" })} />}
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        {art.heroFlank && <img className="fh-flank is-r" {...pic("heroFlank", { ...L, sizes: "40vw" })} />}
        {/* The illustrated hero's toran repeats across the full width of the top; the others hang one image. */}
        {art.heroTop && art.heroCouple && <span className="fh-toran" style={{ ["--fh-toran" as string]: `url("${cdn(art.heroTop.src)}")` }} />}
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        {art.heroTop && !art.heroCouple && <img className="fh-top" {...pic("heroTop", { ...(lazy ? L : { high: true }), sizes: "100vw" })} />}
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        {art.heroHang && <img className="fh-hang is-l" {...pic("heroHang", { ...L, sizes: "64px" })} />}
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        {art.heroHang && <img className="fh-hang is-r" {...pic("heroHang", { ...L, sizes: "64px" })} />}
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        {art.heroSide && <img className="fh-side is-l" {...pic("heroSide", { ...L, sizes: "22vw" })} />}
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        {art.heroSide && <img className="fh-side is-r" {...pic("heroSide", { ...L, sizes: "22vw" })} />}
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        {art.heroBank && <img className="fh-base" {...pic("heroBank", { ...L, sizes: "100vw" })} />}
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img className="fh-corner is-l" {...pic("corner", { ...L, sizes: "30vw" })} />
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img className="fh-corner is-r" {...pic("cornerR", { ...L, sizes: "30vw" })} />
      </div>

    </>
  );
}

/** One family, shown in a niche of the flanking arches (wide screens). */
export interface FamilyNiche {
  title: string;
  name: string;
  family: string;
}

/** The two families in the side arches of the arcade: a gold medallion with their child's initial, the side, the
 *  name in script and the parents. Wide screens only, and only where the faith has tall flanking arches and a
 *  medallion (the Nikah's jharokhas; the chapel's side arches are too small to hold them). */
export function FamilyNiches({ sides, lang }: { sides: readonly FamilyNiche[]; lang: Lang }) {
  const art = useArt();
  if (!art.heroFlank || !art.medallion || sides.length !== 2) return null;
  return (
    <>
      {sides.map((x, i) => (
        <div key={i} className={`fh-niche is-${i ? "r" : "l"}`}>
          <span className="fh-niche-medal" aria-hidden>
            {art.medallion && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={cdn(art.medallion.src)} width={art.medallion.w} height={art.medallion.h} alt="" loading="lazy" decoding="async" draggable={false} />
            )}
            <b>{x.name.trim().charAt(0).toUpperCase()}</b>
          </span>
          <p className="fh-niche-k" lang={lang}>
            {x.title}
          </p>
          <p className="fh-niche-n">{x.name}</p>
          <span className="fh-niche-rule" aria-hidden />
          {x.family && <p className="fh-niche-f">{x.family}</p>}
        </div>
      ))}
    </>
  );
}

export interface HeroProps extends Omit<HeroSceneProps, "lazy" | "as"> {
  open: boolean;
  /** The two families for the side arches (bride's and groom's, in the printed order). */
  sides?: readonly FamilyNiche[];
}

export default function Hero(p: HeroProps) {
  const { open, faith, s } = p;
  const art = useArt();
  const pic = usePic();
  const ref = useRef<HTMLElement>(null);
  const reduce = useWeddingReducedMotion();
  const motes = useMemo(() => {
    const r = seeded([...faith].reduce((n, ch) => n + ch.charCodeAt(0), 0));
    return Array.from({ length: 14 }, () => ({ left: 3 + r() * 94, delay: -r() * 16, dur: 12 + r() * 9, dx: (r() - 0.5) * 70, size: 2.5 + r() * 3.5 }));
  }, [faith]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    let on = true;
    const tick = () => {
      raf = 0;
      const y = Math.max(0, Math.min(window.scrollY, el.offsetHeight));
      el.style.setProperty("--fw-hy", `${y.toFixed(1)}px`);
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
    <header ref={ref} className={`fw-hero fh-hero is-${faith}${art.heroCouple ? " is-split" : ""}${open ? " is-open" : ""}`}>
      <Scene />
      {p.sides && <FamilyNiches sides={p.sides} lang={p.lang} />}

      {art.heroCouple ? (
        // The illustrated hero (South weddings): the couple on the left under a faint arch, the words on the right; stacked on phones.
        <div className="fh-split">
          <div className="fh-cpl fh-par">
            {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
            {art.heroHalo && <img className="fh-halo" {...pic("heroHalo", { high: true, sizes: "(min-width: 1024px) 560px, 80vw" })} />}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="fh-cpl-img" {...pic("heroCouple", { high: true, sizes: "(min-width: 1024px) 520px, 70vw" })} alt={`${p.first} & ${p.second}`} />
            {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
            {art.heroFoot && <img className="fh-foot is-l" {...pic("heroFoot", { sizes: "(min-width: 1024px) 200px, 30vw" })} />}
            {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
            {art.heroFoot && <img className="fh-foot is-r" {...pic("heroFoot", { sizes: "(min-width: 1024px) 200px, 30vw" })} />}
          </div>
          <div className="fh-scopy">
            <div className="fh-copy">
              <HeroCopy {...p} />
            </div>
          </div>
        </div>
      ) : (
        <div className="fh-stage">
          <div className="fh-par">
            <HeroCard {...p} />
          </div>
        </div>
      )}

      <div className="fh-motes" aria-hidden>
        {motes.map((m, i) => (
          <i
            key={i}
            style={{
              left: `${m.left}%`,
              width: m.size,
              height: m.size,
              animationDelay: `${m.delay}s`,
              animationDuration: `${m.dur}s`,
              ["--dx" as string]: `${m.dx}px`,
            }}
          />
        ))}
      </div>

      <a className="fw-cue" href="#invitation" aria-label={s.scroll}>
        <i aria-hidden />
      </a>
    </header>
  );
}
