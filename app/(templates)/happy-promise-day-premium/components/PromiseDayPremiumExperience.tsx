"use client";

// ─── Promise Day ✦ Premium — "The Pinky Promise Club" ──────────────────────────────────────────────────────────
//
// Little promises, sealed forever (research v3 §D5). Bright peach sorbet with lilac and mint, GIF stickers in every
// scene, a pop/chime + heart burst + haptic on every reveal. A club with exactly two members.
//
//  gate      two pinkies, not quite touching: "Pinky promise? 🤙" (PremiumGate: the tap starts the song)
//  pinky     she drags her pinky up to hook his → click, a heart, his welcome to the club (slot pk-pinky)
//  jar       a jar of folded paper stars: tap (or shake) to pull out his promises, the golden one last (slot pk-jar)
//  rules     "Terms & Cuddle-tions": she signs with her finger, APPROVED 💗 thunks down (slot pk-stamp)
//  bracelet  tap the letter beads in order to spell the word; the knot ties into a bow (slot pk-bracelet)
//  diary     the letter, locked in his diary: a tiny key turns, the cover swings open, it writes itself
//  voice     his voice on a cassette whose reels turn (skipped when there is neither a voice note nor a caption)
//  lane      her photos as polaroids, each with a sticky note to flip: his promise for that memory
//  lock      "Promise me back?": she picks 1–3 promises, then locks the love lock → drop(): on the chorus it snaps
//            shut, the key flies off as a shooting star and every promise floats up as a paper lantern (slot pk-yes)
//  card      her Pinky Promise Club membership card (her signature on it): flip it, save it, send her promises back

import { useCallback, useMemo, useState, type CSSProperties } from "react";
import { DayRoot } from "../../_valentine/kit";
import { PremiumGate, PremiumRoot, SceneFade, usePremium } from "../../_valentine/kit/premium";
import { getDay } from "../../_valentine/days";
import type { ExperienceProps } from "../../_valentine/types";
import { CLUB_FONT_VARS } from "./club/fonts";
import { registerClubCues } from "./club/cues";
import { CLUB_CSS } from "./club/styles";
import { readClub } from "./club/util";
import { DECOR, Gif, PaperStar, Polaroid } from "./club/parts";
import { PinkyArt, PinkyHook } from "./club/Pinky";
import { Jar } from "./club/Jar";
import { Contract } from "./club/Contract";
import { Bracelet } from "./club/Bracelet";
import { Diary, Voice } from "./club/Diary";
import { Lane } from "./club/Lane";
import { Lock } from "./club/Lock";
import { Card } from "./club/Card";

registerClubCues();

const SLUG = "happy-promise-day-premium" as const;
type Scene = "gate" | "pinky" | "jar" | "rules" | "bracelet" | "diary" | "voice" | "lane" | "lock" | "card";
const ORDER: Scene[] = ["pinky", "jar", "rules", "bracelet", "diary", "voice", "lane", "lock", "card"];

const FLOATY = [
  { l: "5%", s: "16px", d: "15s", dl: "0s", c: "#FF8A6B", t: "♥" },
  { l: "17%", s: "13px", d: "19s", dl: "6s", c: "#A07BFF", t: "✦" },
  { l: "30%", s: "19px", d: "17s", dl: "3s", c: "#FFB3D6", t: "♥" },
  { l: "51%", s: "13px", d: "21s", dl: "9s", c: "#FFC53D", t: "★" },
  { l: "66%", s: "18px", d: "16s", dl: "1.5s", c: "#FF8A6B", t: "♥" },
  { l: "79%", s: "12px", d: "20s", dl: "11s", c: "#5CCB9F", t: "★" },
  { l: "91%", s: "17px", d: "18s", dl: "4.5s", c: "#FFB3D6", t: "✦" },
];

function Dots({ scene, skip }: { scene: Scene; skip: Set<Scene> }) {
  const order = ORDER.filter((s) => !skip.has(s));
  const cur = order.indexOf(scene);
  if (cur < 0) return null;
  return (
    <div className="pk-dots" aria-label={`Step ${cur + 1} of ${order.length}`} role="img">
      {order.map((s, k) => (
        <i key={s} className={`${k <= cur ? "on" : ""}${k === cur ? " cur" : ""}`}>
          <PaperStar size={16} color={k <= cur ? "#FFB59E" : "#FFF1E6"} deep={k <= cur ? "#E0603F" : "#FFC9AE"} />
        </i>
      ))}
    </div>
  );
}

function Show({ data, react }: ExperienceProps) {
  const day = getDay(SLUG);
  const p = usePremium();
  const club = useMemo(() => readClub(data), [data]);
  const [scene, setScene] = useState<Scene>("gate");
  const [run, setRun] = useState(0);
  const [ink, setInk] = useState<string | null>(null);
  const [picks, setPicks] = useState<string[]>([]);
  const [sky, setSky] = useState(false);
  const hasVoice = !!(p.premium.voiceNote || p.premium.voiceCaption);
  const skip = useMemo(() => {
    const s = new Set<Scene>();
    if (!hasVoice) s.add("voice");
    if (!club.lane.length) s.add("lane");
    return s;
  }, [hasVoice, club.lane.length]);
  const after = (s: Scene): Scene => {
    const order = ORDER.filter((x) => !skip.has(x));
    return order[Math.min(order.length - 1, order.indexOf(s) + 1)];
  };

  const go = useCallback((s: Scene) => {
    setScene(s);
    setSky(false);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const replay = () => {
    setRun((r) => r + 1);
    setPicks([]);
    go("pinky");
  };

  const render = (s: Scene) => {
    switch (s) {
      case "gate":
        return null;
      case "pinky":
        return <PinkyHook club={club} day={day} data={data} onNext={() => go("jar")} onSkip={p.repeatVisit || run > 0 ? () => go("lock") : undefined} />;
      case "jar":
        return <Jar club={club} day={day} data={data} onNext={() => go("rules")} />;
      case "rules":
        return <Contract club={club} day={day} data={data} onSigned={setInk} onNext={() => go("bracelet")} />;
      case "bracelet":
        return <Bracelet club={club} day={day} data={data} onNext={() => go("diary")} />;
      case "diary":
        return <Diary club={club} letter={data.letter || ""} nextLabel={hasVoice ? "Press play on this 📼" : club.lane.length ? "Our photos next 📸" : "One last thing… 🔐"} onNext={() => go(after("diary"))} />;
      case "voice":
        return <Voice club={club} onNext={() => go(after("voice"))} />;
      case "lane":
        return <Lane club={club} onNext={() => go("lock")} />;
      case "lock":
        return (
          <Lock
            club={club}
            day={day}
            data={data}
            onSkyChange={setSky}
            onLocked={(ps) => {
              setPicks(ps);
              react("answered", { count: ps.length });
            }}
            onDone={() => go("card")}
          />
        );
      case "card":
        return <Card club={club} picks={picks} ink={ink} onArrive={() => react("completed")} onReplay={replay} />;
    }
  };

  const wingPhotos = club.photos.slice(0, 2);

  return (
    <div className={`pk-root ${CLUB_FONT_VARS}${sky ? " is-sky" : ""}`}>
      <style>{CLUB_CSS}</style>
      <span className="pk-blob a" aria-hidden />
      <span className="pk-blob b" aria-hidden />
      <span className="pk-blob c" aria-hidden />
      <span className="pk-dusk" aria-hidden />
      <div className="pk-floaty" aria-hidden>
        {FLOATY.map((f, k) => (
          <i key={k} style={{ left: f.l, ["--s" as string]: f.s, ["--d" as string]: f.d, ["--dl" as string]: f.dl, ["--c" as string]: f.c } as CSSProperties}>
            {f.t}
          </i>
        ))}
      </div>
      {scene !== "gate" && (
        <>
          <aside className="pk-wing l" aria-hidden>
            {wingPhotos.map((ph, k) => (
              <Polaroid key={k} photo={ph} tilt={k ? 5 : -6} tape={k ? "mint" : "lilac"} caption={ph.caption ? <span className="pk-cap">{ph.caption}</span> : undefined} />
            ))}
            <Gif src={DECOR.wingLeft} size={120} />
          </aside>
          <Gif src={DECOR.wingLeft} size={100} className="pk-corner a" />
          <Gif src={DECOR.heart} size={90} className="pk-corner b" />
          <aside className="pk-wing r" aria-hidden>
            <Gif src={DECOR.wingRight} size={150} />
            <p className="pk-wing-name">
              for {club.to}
              <br />
              from {club.from}
            </p>
            <p className="pk-wing-line">a very small club · members: 2</p>
            <Gif src={DECOR.heart} size={86} />
          </aside>
        </>
      )}
      <div className="pk-stage">
        <Dots scene={scene} skip={skip} />
        <SceneFade sceneKey={`${run}-${scene}`} duration={0.45} style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          {render(scene)}
        </SceneFade>
      </div>

      {scene === "gate" && (
        <PremiumGate
          art={<PinkyArt sticker={DECOR.gate} />}
          kicker="The Pinky Promise Club invites"
          subtitle={
            <span className="pk-gateSub">
              {club.invite}
              <small>from {club.from} 🤙</small>
            </span>
          }
          sting="chime-cascade"
          openLabel="Pinky promise? 🤙"
          sealText={`Hand-made for ${club.to}`}
          openMs={900}
          className={`pk-gate ${CLUB_FONT_VARS}`}
          bg="linear-gradient(160deg, #FFF8F1 0%, #FFE4D2 55%, #FFE3EC 100%)"
          ink="#5E3226"
          accent="#E0603F"
          onOpen={() => go("pinky")}
        />
      )}
    </div>
  );
}

export default function PromiseDayPremiumExperience(props: ExperienceProps) {
  const day = getDay(SLUG);
  return (
    <PremiumRoot data={props.data} mode={props.mode} slug={SLUG}>
      <DayRoot day={day} data={props.data} layout="full">
        <Show {...props} />
      </DayRoot>
    </PremiumRoot>
  );
}
