"use client";

// ─── Propose Day ✦ Premium — "The Little Proposal" ─────────────────────────────────────────────────────────────
//
// A tiny, cute love story with a ring at the end (research v3 §D2). Bright lavender + cherry pink, GIF stickers
// in every scene, a pop/chime + heart burst + haptic on every reveal.
//
//  gate       a little pink door with a heart window: "Knock knock" (PremiumGate: the knock starts the song)
//  hello      knock once more → the door swings open, a shy panda with a rose, the nervous hello (slot pp-door)
//  story      how it started: swipe the polaroid story cards (slot pp-story watches)
//  rehearsal  a 4-panel comic of the sender practising the proposal and failing; tap each panel open
//  ring       find the ring: three gift boxes, a chocolate, a teddy, then the ring (slot pp-peek)
//  letter     the heart-sealed envelope: crack the seal, the letter types itself
//  voice      "Before I ask, listen 🎙" (skipped when there is neither a voice note nor a caption)
//  question   the question over a heart photo and a ring box; No runs (slot pp-please). YES → drop(): on the chorus
//             the ring flies onto the heart photo and a wall of six celebrating stickers pops in (the money moment)
//  cert       "Officially Taken 💍": they sign with a ring-finger tap; save it, say it back, the sealed P.S.

import { useCallback, useMemo, useState, type CSSProperties } from "react";
import { DayRoot } from "../../_valentine/kit";
import { PremiumGate, PremiumRoot, SceneFade, usePremium } from "../../_valentine/kit/premium";
import { getDay } from "../../_valentine/days";
import type { ExperienceProps } from "../../_valentine/types";
import { PROPOSAL_FONT_VARS } from "./proposal/fonts";
import { registerProposalCues } from "./proposal/cues";
import { PROPOSAL_CSS } from "./proposal/styles";
import { readStory } from "./proposal/util";
import { DECOR, Gif, Polaroid } from "./proposal/parts";
import { DoorArt, Hello } from "./proposal/Door";
import { Story } from "./proposal/Story";
import { Rehearsal } from "./proposal/Rehearsal";
import { FindRing } from "./proposal/FindRing";
import { Letter, Voice } from "./proposal/Letter";
import { Question } from "./proposal/Question";
import { Certificate } from "./proposal/Certificate";

registerProposalCues();

const SLUG = "happy-propose-day-premium" as const;
type Scene = "gate" | "hello" | "story" | "rehearsal" | "ring" | "letter" | "voice" | "question" | "cert";
const ORDER: Scene[] = ["hello", "story", "rehearsal", "ring", "letter", "voice", "question", "cert"];

const HEART_MASK =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 92'%3E%3Cpath d='M50 88 C20 66 4 50 4 30 C4 15 15 4 29 4 C38 4 45 9 50 16 C55 9 62 4 71 4 C85 4 96 15 96 30 C96 50 80 66 50 88 Z'/%3E%3C/svg%3E\")";

const FLOATY = [
  { l: "6%", s: "16px", d: "15s", dl: "0s", c: "#FF8FB8", t: "♥" },
  { l: "18%", s: "12px", d: "19s", dl: "6s", c: "#A07BFF", t: "✦" },
  { l: "31%", s: "20px", d: "17s", dl: "3s", c: "#FFB3D6", t: "♥" },
  { l: "52%", s: "13px", d: "21s", dl: "9s", c: "#FFD166", t: "✦" },
  { l: "67%", s: "18px", d: "16s", dl: "1.5s", c: "#FF6F8E", t: "♥" },
  { l: "80%", s: "12px", d: "20s", dl: "11s", c: "#A07BFF", t: "♥" },
  { l: "92%", s: "17px", d: "18s", dl: "4.5s", c: "#FFB3D6", t: "✦" },
];

function Dots({ scene, hasVoice }: { scene: Scene; hasVoice: boolean }) {
  const order = ORDER.filter((s) => hasVoice || s !== "voice");
  const cur = order.indexOf(scene);
  if (cur < 0) return null;
  return (
    <div className="lp-dots" aria-label={`Step ${cur + 1} of ${order.length}`} role="img">
      {order.map((s, k) => (
        <i key={s} className={`${k <= cur ? "on" : ""}${k === cur ? " cur" : ""}`}>
          <svg viewBox="0 0 24 22" aria-hidden>
            <path d="M12 21 C5 15.5 1 12 1 7 C1 3.7 3.6 1 6.8 1 C9 1 10.9 2.2 12 4 C13.1 2.2 15 1 17.2 1 C20.4 1 23 3.7 23 7 C23 12 19 15.5 12 21 Z" fill="currentColor" />
          </svg>
        </i>
      ))}
    </div>
  );
}

function Show({ data, react }: ExperienceProps) {
  const day = getDay(SLUG);
  const p = usePremium();
  const story = useMemo(() => readStory(data), [data]);
  const [scene, setScene] = useState<Scene>("gate");
  const [run, setRun] = useState(0);
  const [yesAt, setYesAt] = useState<Date | null>(null);
  const hasVoice = !!(p.premium.voiceNote || p.premium.voiceCaption);

  const go = useCallback((s: Scene) => {
    setScene(s);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const replay = () => {
    setRun((r) => r + 1);
    setYesAt(null);
    go("hello");
  };

  const render = (s: Scene) => {
    switch (s) {
      case "gate":
        return null;
      case "hello":
        return <Hello story={story} day={day} data={data} onNext={() => go("story")} onSkipToQuestion={p.repeatVisit || run > 0 ? () => go("question") : undefined} />;
      case "story":
        return <Story story={story} day={day} data={data} onNext={() => go("rehearsal")} />;
      case "rehearsal":
        return <Rehearsal story={story} onNext={() => go("ring")} />;
      case "ring":
        return <FindRing story={story} day={day} data={data} onNext={() => go("letter")} />;
      case "letter":
        return <Letter story={story} letter={data.letter || ""} nextLabel={hasVoice ? "One more thing 🎙" : "Okay, ask me 💍"} onNext={() => go(hasVoice ? "voice" : "question")} />;
      case "voice":
        return <Voice story={story} onNext={() => go("question")} />;
      case "question":
        return (
          <Question
            story={story}
            day={day}
            data={data}
            onAnswer={(d) => {
              setYesAt(new Date());
              react("answered", { noDodges: d });
            }}
            onYes={() => undefined}
            onDone={() => go("cert")}
          />
        );
      case "cert":
        return <Certificate story={story} when={yesAt ?? new Date()} onArrive={() => react("completed")} onReplay={replay} />;
    }
  };

  const wingPhotos = story.photos.slice(0, 2);

  return (
    <div className={`lp-root ${PROPOSAL_FONT_VARS}`} style={{ ["--lp-heart" as string]: HEART_MASK } as CSSProperties}>
      <style>{PROPOSAL_CSS}</style>
      <span className="lp-blob a" aria-hidden />
      <span className="lp-blob b" aria-hidden />
      <span className="lp-blob c" aria-hidden />
      <div className="lp-floaty" aria-hidden>
        {FLOATY.map((f, k) => (
          <i key={k} style={{ left: f.l, ["--s" as string]: f.s, ["--d" as string]: f.d, ["--dl" as string]: f.dl, ["--c" as string]: f.c } as CSSProperties}>
            {f.t}
          </i>
        ))}
      </div>
      {scene !== "gate" && (
        <>
          <aside className="lp-wing l" aria-hidden>
            {wingPhotos.map((ph, k) => (
              <Polaroid key={k} photo={ph} tilt={k ? 5 : -6} tape={k ? "mint" : "lilac"} caption={ph.caption ? <span className="lp-what">{ph.caption}</span> : undefined} />
            ))}
            <Gif src={DECOR.wingLeft} size={120} />
          </aside>
          <Gif src={DECOR.wingLeft} size={100} className="lp-corner a" />
          <Gif src={DECOR.heart} size={90} className="lp-corner b" />
          <aside className="lp-wing r" aria-hidden>
            <Gif src={DECOR.wingRight} size={150} />
            <p className="lp-wing-name">
              for {story.to}
              <br />
              from {story.from}
            </p>
            <p className="lp-wing-line">a little proposal, made by hand 💜</p>
            <Gif src={DECOR.heart} size={86} />
          </aside>
        </>
      )}
      <div className="lp-stage">
        <Dots scene={scene} hasVoice={hasVoice} />
        <SceneFade sceneKey={`${run}-${scene}`} duration={0.45} style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          {render(scene)}
        </SceneFade>
      </div>

      {scene === "gate" && (
        <PremiumGate
          art={<DoorArt sticker={DECOR.gate} />}
          kicker="Knock knock. A little something for"
          subtitle={<span>from {story.from} 💜</span>}
          sting="knock"
          openLabel="Knock knock 🚪"
          sealText={`Hand-made for ${story.to}`}
          openMs={900}
          className={`lp-gate ${PROPOSAL_FONT_VARS}`}
          bg="linear-gradient(160deg, #F8F4FF 0%, #EDE3FF 52%, #FFE3EC 100%)"
          ink="#3B2A63"
          accent="#7A52E0"
          onOpen={() => go("hello")}
        />
      )}
    </div>
  );
}

export default function ProposeDayPremiumExperience(props: ExperienceProps) {
  const day = getDay(SLUG);
  return (
    <PremiumRoot data={props.data} mode={props.mode} slug={SLUG}>
      <DayRoot day={day} data={props.data} layout="full">
        <Show {...props} />
      </DayRoot>
    </PremiumRoot>
  );
}
