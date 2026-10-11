"use client";

// ─── <PremiumPlaceholder> — a minimal, complete premium page ─────────────────
//
// What every `-premium` route renders until its builder replaces it: the gate
// (song + sting in the tap), the name, a song-drop moment, the voice note (or
// its typed transmission), the letter, the film reel, the sealed P.S., the
// reply box and a poster keepsake. It doubles as a working example of the kit.
// Builders: replace your <X>PremiumExperience with your own scenes; do not
// edit this file (it is shared).

import { useEffect, useState } from "react";
import { getDay } from "../../days";
import type { DaySlug, ExperienceProps } from "../../types";
import DayRoot from "../DayRoot";
import EndingActions from "../EndingActions";
import FilmReel from "./FilmReel";
import KineticName from "./KineticName";
import ParticleField from "./ParticleField";
import PremiumGate from "./PremiumGate";
import PremiumRoot, { usePremium } from "./PremiumRoot";
import ReplyBox from "./ReplyBox";
import { SceneFade, useScenes } from "./scene";
import { posterKeepsake, saveOrSharePoster } from "./poster";
import { useSongDrop } from "./useSongDrop";
import VoiceNotePlayer from "./VoiceNotePlayer";

const ORDER = ["gate", "hello", "voice", "letter", "reel", "finale"] as const;

function Scenes({ slug, data, mode, react }: ExperienceProps & { slug: DaySlug }) {
  const day = getDay(slug);
  const p = usePremium();
  const sc = useScenes(ORDER);
  const { drop, dropped } = useSongDrop();
  const [psOpen, setPsOpen] = useState(false);
  const t = day.theme;

  useEffect(() => {
    if (sc.scene === "finale") react("completed");
  }, [sc.scene, react]);

  const nextBtn = (label: string, cue: Parameters<typeof p.sfx>[0] = "whoosh") => (
    <button
      type="button"
      className="pmx-btn"
      onClick={() => {
        p.sfx(cue);
        sc.next();
      }}
    >
      {label}
    </button>
  );

  return (
    <>
      <ParticleField preset={t.dark ? "sparkles" : "dust"} density={0.35} z={0} />
      {sc.scene === "gate" && (
        <PremiumGate
          art={<div className="pmx-art" aria-hidden>{day.emoji}</div>}
          kicker={`${day.title} · for`}
          subtitle={<span>✦ {day.name} · Premium</span>}
          onOpen={() => sc.go("hello")}
          bg={t.bg}
          ink={t.ink}
          accent={t.accent}
        />
      )}
      <SceneFade sceneKey={sc.scene} className="pmx-scene">
        {sc.scene === "hello" && (
          <section className="pmx-sec">
            <p className="pmx-kick">{data.senderName || "Someone"} made this for</p>
            <KineticName text={data.petName || data.recipientName || "you"} gilt />
            <button type="button" className={`pmx-drop${dropped ? " is-on" : ""}`} onClick={() => drop()}>
              {dropped ? "✦" : "Tap for the drop ✦"}
            </button>
            {nextBtn("Continue →")}
          </section>
        )}
        {sc.scene === "voice" && (
          <section className="pmx-sec">
            <VoiceNotePlayer label={`A message from ${data.senderName || "them"}`} accent={t.accentDeep} />
            {nextBtn("Read the letter →", "paper-rustle")}
          </section>
        )}
        {sc.scene === "letter" && (
          <section className="pmx-sec">
            <article className="pmx-letter">{data.letter}</article>
            {nextBtn(data.photos.length ? "Roll the film →" : "Continue →", "page-turn")}
          </section>
        )}
        {sc.scene === "reel" && (
          <section className="pmx-sec">
            <FilmReel photos={data.photos} aspect={day.photoAspect} title="Now showing" onDone={() => {}} />
            {nextBtn("The end →", "chime")}
          </section>
        )}
        {sc.scene === "finale" && (
          <section className="pmx-sec">
            <p className="pmx-end">{data.endLine}</p>
            {p.premium.psLetter && (
              <button type="button" className="pmx-ps" onClick={() => { p.sfx("wax-crack"); setPsOpen(true); }} aria-expanded={psOpen}>
                {psOpen ? p.premium.psLetter : "✉ A sealed P.S. — tap to open"}
              </button>
            )}
            <ReplyBox accent={t.accentDeep} />
            <button
              type="button"
              className="pmx-btn is-ghost"
              onClick={() => void saveOrSharePoster(posterKeepsake(day, data, { title: day.title }), `${slug}-${data.recipientName}`)}
            >
              Save the poster ✦
            </button>
            <EndingActions day={day} data={data} mode={mode} onReplay={() => sc.go("hello")} />
          </section>
        )}
      </SceneFade>
      <style>{CSS}</style>
    </>
  );
}

export default function PremiumPlaceholder(props: ExperienceProps & { slug: DaySlug }) {
  const day = getDay(props.slug);
  return (
    <PremiumRoot data={props.data} mode={props.mode} slug={props.slug}>
      <DayRoot day={day} data={props.data}>
        <Scenes {...props} />
      </DayRoot>
    </PremiumRoot>
  );
}

const CSS = `
.pmx-scene { position: relative; z-index: 1; }
.pmx-sec { min-height: calc(100dvh - var(--vw-dock-space, 0px)); display: grid; align-content: center; justify-items: center; gap: 18px; padding: 72px 16px 32px; box-sizing: border-box; text-align: center; }
.pmx-art { font-size: clamp(120px, 34vw, 200px); line-height: 1; filter: drop-shadow(0 20px 40px rgba(0,0,0,.35)); }
.pmx-kick { margin: 0; font-weight: 700; font-size: 12px; letter-spacing: .24em; text-transform: uppercase; opacity: .75; }
.pmx-btn { min-height: 48px; padding: 0 24px; border-radius: 99px; border: 0; cursor: pointer; font: 700 15px/1 var(--vw-font-ui, system-ui), sans-serif;
  color: var(--vw-accent-ink, #fff); background: linear-gradient(135deg, var(--vw-accent), var(--vw-accent-deep)); box-shadow: 0 12px 26px -12px var(--vw-accent-deep); }
.pmx-btn.is-ghost { background: var(--vw-glass); color: var(--vw-ink); border: 1px solid var(--vw-edge); box-shadow: none; }
.pmx-btn:focus-visible, .pmx-drop:focus-visible, .pmx-ps:focus-visible { outline: 3px solid var(--vw-accent); outline-offset: 3px; }
.pmx-drop { min-height: 56px; min-width: 56px; padding: 0 22px; border-radius: 99px; cursor: pointer; border: 2px solid #e2b44a; background: transparent; color: inherit;
  font: 700 15px/1 var(--vw-font-ui, system-ui), sans-serif; transition: transform .4s cubic-bezier(.22,1,.36,1), background .4s; }
.pmx-drop.is-on { transform: scale(1.25); background: #e2b44a; color: #2b1a03; }
.pmx-letter { width: min(100%, 560px); padding: 22px; border-radius: 18px; background: var(--vw-paper); color: var(--vw-paper-ink); text-align: left; white-space: pre-wrap;
  font: 400 17px/1.6 var(--vw-font-serif, serif); box-shadow: 0 20px 50px -30px rgba(0,0,0,.5); user-select: text; -webkit-user-select: text; }
.pmx-end { margin: 0; max-width: 32ch; font: 600 clamp(20px, 5vw, 28px)/1.3 var(--vw-font-serif, serif); }
.pmx-ps { all: unset; cursor: pointer; max-width: 420px; padding: 14px 18px; border-radius: 14px; border: 1px dashed currentColor; font: 500 15px/1.5 var(--vw-font-ui, system-ui), sans-serif; white-space: pre-wrap; }
@media (prefers-reduced-motion: reduce) { .pmx-drop { transition: none; } }
`;
