"use client";

// ─── Valentine's Day ✦ Premium — "Us, Wrapped" (the flagship of the premium tier) ─────────────────────────
//
// Their year in love as a Wrapped-style story: bold colour-blocked slides (each owns one background, a velvet
// shader in that colour behind it), huge kinetic numbers in Bricolage Grotesque, the emotional lines in
// Instrument Serif italic, tap-through progress bars, film grain + vignette on every frame.
//
//  gate      a Wrapped cover (PremiumGate: the tap starts their song)
//  1 intro    "Your 2026 in love."                               tomato
//  2 song     our top song: tilt the cover, ♥ it → their line     lilac
//  3 memories top 3: swipe #3 and #2 away, #1 stays               ink
//  4 stats    stats you didn't know I kept: tap to flip           butter
//  5 trait    your top trait, according to me: scratch the foil   pink
//  6 reasons  fast cuts over their photos: tap, or hold           photos, a new tint per cut
//  7 voice    the voice note (or the caption as a quote)          lilac
//  8 letter   tap to unfold                                       butter
//  9 NUMBER   hold to count → drop(): the days SLAM on the drop, cut to their best photo, the question  ink → photo
// 10 card     the "Us, Wrapped" card: save it, the sealed P.S., write back, watch again   tomato
//
// Slides with nothing to show (no stats, no trait, no reasons, no voice) are skipped.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DayRoot, Sticker } from "../../_valentine/kit";
import { FilmGrain, GlowParticles, PremiumGate, PremiumRoot, SceneTransition, ShaderBackdrop, Vignette, usePremium } from "../../_valentine/kit/premium";
import { getDay } from "../../_valentine/days";
import type { ExperienceProps } from "../../_valentine/types";
import { WRAPPED_FONT_VARS } from "./wrapped/fonts";
import { SW, readWrapped, type Swatch } from "./wrapped/model";
import { WRAPPED_CSS } from "./wrapped/styles";
import { Arrow, Back } from "./wrapped/ui";
import { Intro, Letter, Memories, Stats, Trait, TopSong, Voice, statTiles } from "./wrapped/Slides";
import Reasons from "./wrapped/Reasons";
import TheNumber from "./wrapped/Number";
import WrappedCard from "./wrapped/Card";

const SLUG = "happy-valentines-day-premium" as const;
type SlideId = "intro" | "song" | "memories" | "stats" | "trait" | "reasons" | "voice" | "letter" | "number" | "card";

const SWATCH: Record<SlideId, Swatch> = {
  intro: SW.tomato, song: SW.lilac, memories: SW.ink, stats: SW.butter, trait: SW.pink,
  reasons: SW.ink, voice: SW.lilac, letter: SW.butter, number: SW.ink, card: SW.tomato,
};
const NEXT_LABEL: Partial<Record<SlideId, string>> = { intro: "Let's go", letter: "One more thing", number: "See our Wrapped" };
/** Never stuck: Next appears after this long even if the interaction hasn't happened. */
const AUTO_READY: Partial<Record<SlideId, number>> = { song: 6000, memories: 7000, stats: 8000, trait: 8000, reasons: 9000, voice: 6000, letter: 6000 };

function GateCover({ year }: { year: number }) {
  return (
    <div className="uw-cover" aria-hidden>
      <i className="c1" />
      <i className="c2" />
      <i className="c3" />
      <b>Us,</b>
      <em>wrapped</em>
      <small>{year}</small>
    </div>
  );
}

function Story({ data, react }: ExperienceProps) {
  const day = getDay(SLUG);
  const p = usePremium();
  const { sfx, music, premium } = p;
  const w = useMemo(() => readWrapped(day, data, music?.title), [day, data, music?.title]);
  const [opened, setOpened] = useState(p.opened);
  const [run, setRun] = useState(0);

  const order = useMemo(() => {
    const o: SlideId[] = ["intro", "song", "memories"];
    if (statTiles(w).length) o.push("stats");
    if (w.trait) o.push("trait");
    if (w.reasons.length) o.push("reasons");
    if (premium.voiceNote || premium.voiceCaption.trim()) o.push("voice");
    if (data.letter.trim()) o.push("letter");
    o.push("number", "card");
    return o;
  }, [w, premium.voiceNote, premium.voiceCaption, data.letter]);

  const [idx, setIdx] = useState(0);
  const [readySet, setReadySet] = useState<Record<string, boolean>>({});
  const [yesSaid, setYesSaid] = useState(false);
  const slide = order[Math.min(idx, order.length - 1)];
  const key = `${run}-${slide}`;
  const isReady = !!readySet[key];
  const sw = SWATCH[slide];

  const ready = useCallback(() => setReadySet((r) => (r[key] ? r : { ...r, [key]: true })), [key]);
  useEffect(() => {
    const ms = AUTO_READY[slide];
    if (!ms || !opened) return;
    const t = window.setTimeout(ready, ms);
    return () => clearTimeout(t);
  }, [slide, ready, opened]);

  const go = useCallback(
    (i: number) => {
      setIdx(Math.max(0, Math.min(order.length - 1, i)));
      sfx("swoosh-soft", { gain: 0.45 });
    },
    [order.length, sfx],
  );
  const next = useCallback(() => go(idx + 1), [go, idx]);
  const back = useCallback(() => go(idx - 1), [go, idx]);

  // Keyboard: → / ← move through the story.
  useEffect(() => {
    if (!opened) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement && /INPUT|TEXTAREA/.test(e.target.tagName)) return;
      if (e.key === "ArrowRight" && isReady && slide !== "card" && (slide !== "number" || yesSaid)) next();
      if (e.key === "ArrowLeft" && idx > 0 && slide !== "number" && slide !== "card") back();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [opened, isReady, slide, idx, next, back, yesSaid]);

  // The song dips under the letter and comes back for the rest; the number slide and the voice note manage
  // their own level (a no-op where the platform can't fade).
  const musicRef = useRef(music);
  useEffect(() => {
    musicRef.current = music;
  });
  useEffect(() => {
    const m = musicRef.current;
    if (!opened || !m?.canFade) return;
    if (slide === "letter") m.fadeTo(0.55, 1200);
    else if (slide !== "number" && slide !== "voice") m.fadeTo(slide === "card" ? 0.7 : 1, 1200);
  }, [slide, opened]);

  const slot = (id: string) => day.gifSlots.find((g) => g.id === id)!;
  const sticker = (id: string, size: number) => <Sticker slug={day.slug} slot={slot(id)} value={data.gifs?.[id]} size={size} alt="" eager />;

  const replay = () => {
    setRun((r) => r + 1);
    setYesSaid(false);
    setIdx(0);
    sfx("whoosh", { gain: 0.5 });
  };

  const props = { w, ready, isReady, next };
  const render = () => {
    switch (slide) {
      case "intro": return <Intro {...props} />;
      case "song": return <TopSong {...props} />;
      case "memories": return <Memories {...props} />;
      case "stats": return <Stats {...props} />;
      case "trait": return <Trait {...props} />;
      case "reasons": return <Reasons {...props} />;
      case "voice": return <Voice {...props} />;
      case "letter": return <Letter {...props} letter={data.letter} />;
      case "number":
        return (
          <TheNumber
            {...props}
            please={sticker("pv4-please", 76)}
            yesSticker={sticker("pv5-yes", 96)}
            onAnswer={(noDodges) => {
              setYesSaid(true);
              react("answered", { noDodges });
            }}
          />
        );
      case "card": return <WrappedCard {...props} onComplete={() => react("completed")} onReplay={replay} />;
    }
  };

  const hearts = yesSaid && (slide === "number" || slide === "card");
  const showNext = opened && isReady && slide !== "card" && (slide !== "number" || yesSaid);
  const showBack = opened && idx > 0 && slide !== "card" && slide !== "number";

  return (
    <div className={`uw-root ${WRAPPED_FONT_VARS}`} style={{ ["--uw-bg" as string]: sw.bg, ["--uw-ink" as string]: sw.ink, ["--uw-accent" as string]: sw.accent, background: "#151018" }}>
      <style>{WRAPPED_CSS}</style>
      <ShaderBackdrop preset="velvet" colors={sw.silk} intensity={0.6} speed={0.45} parallax />
      {hearts && <GlowParticles preset="hearts" colors={["#FF7AB6", "#FF4B3E", "#FFE7A3"]} density={0.35} z={3} />}

      {!opened && (
        <PremiumGate
          art={<GateCover year={w.year} />}
          kicker="Your year in love, wrapped for"
          subtitle={<span>with love, from {w.from}</span>}
          sting="chime-cascade"
          openLabel="Unwrap our year"
          className={`uw-gate ${WRAPPED_FONT_VARS}`}
          bg="#151018"
          ink="#FFF6E8"
          accent="#FF4B3E"
          onOpen={() => setOpened(true)}
        />
      )}

      {opened && (
        <div className="uw-stage">
          {/* On a repeat visit the bars are a chapter menu: tap one to jump straight there. */}
          <div className={`uw-bars${p.repeatVisit ? " is-nav" : ""}`} aria-hidden={!p.repeatVisit || undefined}>
            {order.map((s, i) =>
              p.repeatVisit ? (
                <button type="button" key={s} aria-label={`Go to ${s}`} onClick={() => go(i)} className={`uw-bar${i < idx ? " is-done" : ""}${i === idx ? " is-now" : ""}${i === idx && isReady ? " is-ready" : ""}`}>
                  <i />
                </button>
              ) : (
                <span key={s} className={`uw-bar${i < idx ? " is-done" : ""}${i === idx ? " is-now" : ""}${i === idx && isReady ? " is-ready" : ""}`}>
                  <i />
                </span>
              ),
            )}
          </div>
          <SceneTransition sceneKey={key} variant="flash" duration={0.8} flashColor={sw.accent}>
            {render()}
          </SceneTransition>
          {showBack && (
            <button type="button" className="uw-back" onClick={back} aria-label="Back">
              <Back />
            </button>
          )}
          {showNext && (
            <div className="uw-foot">
              <button type="button" className="uw-next" key={key} onClick={next}>
                {NEXT_LABEL[slide] ?? "Next"} <Arrow />
              </button>
            </div>
          )}
        </div>
      )}

      <Vignette strength={0.36} />
      <FilmGrain opacity={0.08} />
    </div>
  );
}

export default function ValentinesDayPremiumExperience(props: ExperienceProps) {
  const day = getDay(SLUG);
  return (
    <PremiumRoot data={props.data} mode={props.mode} slug={SLUG}>
      <DayRoot day={day} data={props.data} layout="full" dark>
        <Story {...props} />
      </DayRoot>
    </PremiumRoot>
  );
}
