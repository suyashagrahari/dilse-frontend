"use client";

// ─── Valentine's Day ✦ Premium — "Our Film" (the flagship of the premium tier) ──────────────────────────────
//
// Their love story, screened as a film, directed by the sender and starring the recipient.
//
//  1 gate      ADMIT ONE ticket (PremiumGate: the tap starts the song + the projector lamp) → film leader 5-4-3-2
//  2 titles    "{sender} presents" · "a love story" · "starring {recipient}" · the title · "Previously on…" (the week)
//  3 stars     Chapter I — trace the constellation of the night you met; it becomes your initials   (mini-game 1)
//  4 montage   Chapter II — "The Film of Us": photos cut on the chorus, hold to freeze, scrub the strip   (WOW 1)
//  5 voice     Director's commentary — the voice note (or the caption as screenplay dialogue)
//  6 book      Chapter III — a three-chapter book turned by its corner, signed in an animated pen stroke
//  7 numbers   Chapter IV — by the numbers: slot-reel digits, a live seconds counter, their own stats
//  8 question  black and white, the song paused, every No is a take with a clapperboard              (mini-game 2)
//  9 finale    YES → drop(): colour floods from the button, fireworks write the initials, end credits with
//              bloopers, post-credits date plan (+ .ics), deleted scene (P.S.), movie poster, reply   (WOW 2)
//
// Sound: the kit's PremiumRoot/gate/drop + 19 template cues (./film/cues.ts). Music script: 35% under the
// projector → 70% titles → 60% stars → chorus at 100% for the montage → 45% for the book → paused for the
// question → drop() on YES → 30% after the credits (fades are desktop/Android only; iOS keeps full volume).

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DayRoot, Sticker, useReducedMotion } from "../../_valentine/kit";
import { Letterbox, ParticleField, PremiumGate, PremiumRoot, SceneFade, usePremium, type ParticlePreset } from "../../_valentine/kit/premium";
import { getDay } from "../../_valentine/days";
import type { ExperienceProps } from "../../_valentine/types";
import { FILM_FONT_VARS } from "./film/fonts";
import { registerFilmCues } from "./film/cues";
import { FILM_CSS } from "./film/styles";
import { readFilm } from "./film/util";
import { Leader, Ticket } from "./film/Screening";
import Titles from "./film/Titles";
import Stars from "./film/Stars";
import Montage from "./film/Montage";
import Commentary from "./film/Commentary";
import Book from "./film/Book";
import Numbers from "./film/Numbers";
import Question from "./film/Question";
import Finale from "./film/Finale";

registerFilmCues();

const SLUG = "happy-valentines-day-premium" as const;
type Scene = "gate" | "leader" | "titles" | "stars" | "montage" | "voice" | "book" | "numbers" | "question" | "finale";
const LEVEL: Partial<Record<Scene, number>> = { leader: 0.35, titles: 0.7, stars: 0.6, voice: 0.7, book: 0.45, numbers: 0.7 };
const PARTICLES: Partial<Record<Scene, ParticlePreset>> = { leader: "dust", titles: "dust", stars: "sparkles", book: "dust", numbers: "dust" };
const LETTERBOX = new Set<Scene>(["titles", "stars", "montage", "voice", "book", "numbers", "question"]);

function Film({ data, mode, react }: ExperienceProps) {
  const day = getDay(SLUG);
  const p = usePremium();
  const reduce = useReducedMotion();
  const film = useMemo(() => readFilm(data), [data]);
  const [scene, setScene] = useState<Scene>("gate");
  const [yes, setYes] = useState<{ takes: number; origin: { x: number; y: number } } | null>(null);
  const [run, setRun] = useState(0);
  const { music, sfx } = p;

  const go = useCallback((s: Scene) => {
    setScene(s);
    window.scrollTo({ top: 0 });
  }, []);

  // The music script, per scene (a no-op where the platform can't fade). Keyed on the scene only: the music
  // object changes identity whenever its state does, and re-applying a level would undo a voice-note duck.
  const musicRef = useRef(music);
  useEffect(() => {
    musicRef.current = music;
  });
  useEffect(() => {
    const lv = LEVEL[scene];
    const m = musicRef.current;
    if (lv !== undefined && m?.canFade) m.fadeTo(lv, 1200);
  }, [scene]);

  // The projector hum under the leader and the titles.
  useEffect(() => {
    if (scene !== "leader" && scene !== "titles") return;
    const h = sfx("projector-loop", { gain: 0.35 });
    return () => h.stop(900);
  }, [scene, sfx]);

  // A voice scene with nothing to say (no note, no caption) is skipped.
  const hasVoice = !!(p.premium.voiceNote || p.premium.voiceCaption);
  const afterMontage = useCallback(() => go(hasVoice ? "voice" : "book"), [go, hasVoice]);

  const slot = (id: string) => day.gifSlots.find((g) => g.id === id)!;
  const sticker = (id: string, size: number) => <Sticker slug={day.slug} slot={slot(id)} value={data.gifs?.[id]} size={size} alt="" eager />;

  const replay = () => {
    setYes(null);
    setRun((r) => r + 1);
    go("titles");
  };

  const grain = scene === "question" ? 0.16 : 0.07;

  return (
    <div className={`fm-root ${FILM_FONT_VARS}${scene === "question" ? " is-bw" : ""}`} style={{ ["--fm-grain" as string]: grain }}>
      <style>{FILM_CSS}</style>
      <div className="fm-curtains" aria-hidden>
        <span className="fm-curtain is-l" />
        <span className="fm-curtain is-r" />
        <span className="fm-valance" />
      </div>
      {PARTICLES[scene] && <ParticleField preset={PARTICLES[scene]!} density={scene === "stars" ? 0.45 : 0.3} colors={scene === "stars" ? undefined : ["rgba(255,231,179,.55)"]} z={1} />}
      {scene !== "gate" && !reduce && <span className="fm-grain" aria-hidden />}
      {scene !== "gate" && <span className="fm-vig" aria-hidden />}
      <Letterbox show={LETTERBOX.has(scene) && !yes} />

      {scene === "gate" && (
        <PremiumGate
          art={<Ticket to={film.to} from={film.from} sticker={sticker("pv1-ticket", 64)} />}
          kicker="Tonight's screening, starring"
          subtitle={
            <span className="fm-gateSub">
              <i>{film.title}</i>
              <small>🎧 Sound on · tap to start the film</small>
            </span>
          }
          sting="film-lamp"
          openLabel="Start the film"
          className={`fm-gateBg ${FILM_FONT_VARS}`}
          bg="#0B0A0C"
          ink="#FFF3DC"
          accent="#D4AF37"
          onOpen={({ quiet }) => {
            if (!quiet && music?.canFade) music.fadeTo(0.35, 400);
            go("leader");
          }}
        />
      )}

      {scene === "leader" && <Leader onDone={() => go(p.repeatVisit ? "stars" : "titles")} />}

      <SceneFade sceneKey={`${run}-${scene}`}>
        {scene === "titles" && <Titles film={film} sticker={sticker("pv2-starring", 96)} onDone={() => go("stars")} />}
        {scene === "stars" && <Stars film={film} sticker={sticker("pv3-stars", 84)} onDone={() => go("montage")} />}
        {scene === "montage" && <Montage photos={data.photos} seed={`${film.to}${film.from}${film.title}`} onDone={afterMontage} />}
        {scene === "voice" && <Commentary film={film} onDone={() => go("book")} />}
        {scene === "book" && <Book film={film} letter={data.letter} onDone={() => go("numbers")} />}
        {scene === "numbers" && <Numbers film={film} onDone={() => go("question")} />}
        {scene === "question" && (
          <Question
            film={film}
            sticker={sticker("pv4-please", 88)}
            onYes={(takes, origin) => {
              react("answered", { noDodges: takes });
              setYes({ takes, origin });
              setScene("finale");
            }}
          />
        )}
      </SceneFade>

      {scene === "finale" && yes && (
        <Finale
          key={run}
          day={day}
          data={data}
          film={film}
          takes={yes.takes}
          origin={yes.origin}
          mode={mode}
          yesSticker={sticker("pv5-yes", 110)}
          creditsSticker={sticker("pv6-credits", 72)}
          onComplete={() => react("completed")}
          onReplay={replay}
        />
      )}
    </div>
  );
}

export default function ValentinesDayPremiumExperience(props: ExperienceProps) {
  const day = getDay(SLUG);
  return (
    <PremiumRoot data={props.data} mode={props.mode} slug={SLUG}>
      <DayRoot day={day} data={props.data} layout="full" dark>
        <Film {...props} />
      </DayRoot>
    </PremiumRoot>
  );
}
