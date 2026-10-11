"use client";

// ─── Chocolate Day ✦ Premium — "The Sweetheart Chocolate Factory" ──────────────────────────────────────────────
//
// A bright, candy-pastel chocolate factory built for her (research-v3 §D3, "Meethi Si Factory"). She takes the tour
// station by station; every station is one cute game that ends in an "aww" beat (sound + heart burst + haptic) with a
// couple-sticker GIF reacting to what she just did.
//
//  gate     her golden ticket: scratch the gold to see who's invited → the factory gates open, the song starts
//  1 pack   the packing line: six kawaii truffles on a conveyor; tap/drag each into her box → its flavour = a reason
//  2 unwrap the wrapping room: pull the wrapper off a giant bar, tear the foil: the bar is her photo in chocolate relief
//  3 dip    the dipping station: pull each photo down into warm chocolate → it comes up dipped, with its memory
//  4 catch  quality control: a 15 s catch game; every chocolate = one of his "{catchPrize}"
//  5 melt   the melting room: hold the chocolate heart until it melts → his heart line → his letter types itself
//  6 music  the music box: open the lid, a truffle twirls, his voice note plays           (skipped if nothing)
//  7 last   the tasting table: "who gets the last piece?" his name hops away; hers → the bigger half
//  8 finale the chocolate fountain: pull the lever → drop() → on the chorus a chocolate river carries her photos
//           across the screen, sprinkles rain, and they land one by one in the box she filled: a box of us
//  9 exit   the gift shop: the "Box of Us" (save as PNG), his coupon to stamp, the P.S., send a chocolate back, replay
//
// Next appears when the station's interaction lands, or after a while so nobody is stuck; from the 2nd station she
// can skip ahead. Repeat visit: the progress dots become a map. react("opened") at the gate, react("completed") at
// the exit.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DayRoot } from "../../_valentine/kit";
import { PremiumRoot, SceneFade, usePremium } from "../../_valentine/kit/premium";
import { getDay } from "../../_valentine/days";
import type { ExperienceProps } from "../../_valentine/types";
import { FACTORY_FONT_VARS } from "./factory/fonts";
import { GIF, readFactory } from "./factory/model";
import { FACTORY_CSS } from "./factory/styles";
import { Gif, StationCtx, Truffle, ensureFactoryCues, type StationApi } from "./factory/ui";
import { LOOKS } from "./factory/model";
import Gate, { FactorySkyline } from "./factory/Gate";
import PackBox from "./factory/PackBox";
import Unwrap from "./factory/Unwrap";
import Dip from "./factory/Dip";
import Catch from "./factory/Catch";
import Melt from "./factory/Melt";
import MusicBox from "./factory/MusicBox";
import LastPiece from "./factory/LastPiece";
import Fountain from "./factory/Fountain";
import Keepsake from "./factory/Keepsake";

const SLUG = "happy-chocolate-day-premium" as const;
type StationId = "pack" | "unwrap" | "dip" | "catch" | "melt" | "music" | "last" | "finale" | "exit";

const NAME: Record<StationId, string> = {
  pack: "The packing line", unwrap: "The wrapping room", dip: "The dipping station", catch: "Quality control", melt: "The melting room",
  music: "The music box", last: "The tasting table", finale: "The chocolate fountain", exit: "The gift shop",
};
const NEXT_LABEL: Partial<Record<StationId, string>> = {
  pack: "Next station →", unwrap: "Next station →", dip: "Next station →", catch: "Next station →", melt: "Keep going →",
  music: "Keep going →", last: "To the grand finale ✨", finale: "To the gift shop 🎁",
};
/** Never stuck: Next appears after this long even if the game wasn't finished. */
const AUTO_READY: Partial<Record<StationId, number>> = { pack: 22000, unwrap: 16000, dip: 20000, catch: 30000, melt: 16000, music: 10000, last: 20000 };

function Story({ data, react }: ExperienceProps) {
  const day = getDay(SLUG);
  const p = usePremium();
  const { sfx, music, premium } = p;
  const f = useMemo(() => readFactory(day, data, music?.title), [day, data, music?.title]);
  const [opened, setOpened] = useState(p.opened);
  const [run, setRun] = useState(0);
  useEffect(ensureFactoryCues, []);

  const order = useMemo(() => {
    const o: StationId[] = ["pack", "unwrap", "dip", "catch", "melt"];
    if (premium.voiceNote || premium.voiceCaption.trim()) o.push("music");
    o.push("last", "finale", "exit");
    return o;
  }, [premium.voiceNote, premium.voiceCaption]);

  const [idx, setIdx] = useState(0);
  const [doneSet, setDoneSet] = useState<Record<string, boolean>>({});
  const [skipOn, setSkipOn] = useState(false);
  const station = order[Math.min(idx, order.length - 1)];
  const key = `${run}-${station}`;
  const isDone = !!doneSet[key];

  const done = useCallback(() => setDoneSet((r) => (r[key] ? r : { ...r, [key]: true })), [key]);
  useEffect(() => {
    if (!opened) return;
    const ms = AUTO_READY[station];
    const t1 = ms ? window.setTimeout(done, ms) : 0;
    const t2 = window.setTimeout(() => setSkipOn(true), 3500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      setSkipOn(false);
    };
  }, [station, done, opened, run]);

  const go = useCallback(
    (i: number) => {
      setIdx(Math.max(0, Math.min(order.length - 1, i)));
      sfx("swoosh-soft", { gain: 0.45 });
      window.scrollTo({ top: 0 });
    },
    [order.length, sfx],
  );
  const next = useCallback(() => go(idx + 1), [go, idx]);

  // The song dips under the letter and the voice note manages itself; everywhere else it plays full.
  const musicRef = useRef(music);
  useEffect(() => {
    musicRef.current = music;
  });
  useEffect(() => {
    const m = musicRef.current;
    if (!opened || !m?.canFade) return;
    if (station === "melt") m.fadeTo(0.55, 1200);
    else if (station !== "music" && station !== "finale") m.fadeTo(station === "exit" ? 0.75 : 1, 1200);
  }, [station, opened]);

  const replay = () => {
    setRun((r) => r + 1);
    setDoneSet({});
    setIdx(0);
    sfx("whoosh", { gain: 0.5 });
    window.scrollTo({ top: 0 });
  };

  const api: StationApi = { f, data, day, done, isDone, sfx: sfx as StationApi["sfx"], index: idx };

  const render = () => {
    switch (station) {
      case "pack": return <PackBox />;
      case "unwrap": return <Unwrap />;
      case "dip": return <Dip />;
      case "catch": return <Catch />;
      case "melt": return <Melt letter={data.letter} />;
      case "music": return <MusicBox />;
      case "last": return <LastPiece />;
      case "finale": return <Fountain />;
      case "exit": return <Keepsake onComplete={() => react("completed")} onReplay={replay} />;
    }
  };

  const showNext = opened && isDone && station !== "exit";
  const showSkip = opened && !isDone && skipOn && idx >= 1 && station !== "finale" && station !== "exit";

  return (
    <StationCtx.Provider value={api}>
      <div className={`sf-root ${FACTORY_FONT_VARS}`}>
        <style>{FACTORY_CSS}</style>
        <FactoryFloor />

        {!opened && (
          <Gate
            f={f}
            onOpen={() => {
              react("opened");
              setOpened(true);
            }}
          />
        )}

        {opened && (
          <div className={`sf-stage is-${station}`}>
            <nav className={`sf-dots${p.repeatVisit ? " is-map" : ""}`} aria-label="The factory tour">
              {order.map((s, i) =>
                p.repeatVisit ? (
                  <button key={s} type="button" className={`sf-dot${i < idx ? " is-past" : ""}${i === idx ? " is-now" : ""}`} onClick={() => go(i)} aria-label={`Go to ${NAME[s]}`} aria-current={i === idx ? "step" : undefined} />
                ) : (
                  <span key={s} className={`sf-dot${i < idx ? " is-past" : ""}${i === idx ? " is-now" : ""}`} aria-label={i === idx ? `${NAME[s]}, station ${i + 1} of ${order.length}` : undefined} />
                ),
              )}
            </nav>
            <SceneFade sceneKey={key} duration={0.45} className="sf-sceneWrap">
              {/* Each station gets its own context value, so a station still fading out keeps ITS done(). */}
              <StationCtx.Provider value={api}>{render()}</StationCtx.Provider>
            </SceneFade>
            <div className="sf-foot">
              {showNext && (
                <button type="button" className="sf-puffy is-pink sf-next" key={key} onClick={next}>
                  {NEXT_LABEL[station] ?? "Next →"}
                </button>
              )}
              {showSkip && (
                <button type="button" className="sf-skip" onClick={next}>
                  Skip this station ▸
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </StationCtx.Provider>
  );
}

/** The factory floor around the stage: milky blobs and drifting sprinkles everywhere; from 768 px a candy factory,
 *  a giant lollipop, floating truffles and a couple of stickers live in the side space around the centred stage. */
function FactoryFloor() {
  const cols = ["#FF8FAB", "#FFD166", "#9FE5C8", "#C9A7FF", "#B9744D"];
  return (
    <div className="sf-floor" aria-hidden>
      <i className="sf-blob is-a" />
      <i className="sf-blob is-b" />
      <i className="sf-blob is-c" />
      <div className="sf-floaters">
        {Array.from({ length: 12 }, (_, i) => (
          <i key={i} style={{ ["--x" as string]: `${(i * 37) % 100}%`, ["--d" as string]: `${(i * 1.7) % 11}s`, ["--r" as string]: `${(i * 47) % 180}deg`, background: cols[i % cols.length] }} />
        ))}
      </div>
      <div className="sf-side is-left">
        <FactorySkyline className="sf-sideFactory" />
        <Gif src={GIF.penguinBar} size={116} tilt={-6} float className="sf-sideGif" />
      </div>
      <div className="sf-side is-right">
        <div className="sf-sideTruffles">
          {[0, 1, 2].map((i) => (
            <span key={i} style={{ ["--i" as string]: i }}>
              <Truffle look={LOOKS[[1, 5, 3][i]]} size={[70, 56, 64][i]} happy={i === 1} />
            </span>
          ))}
        </div>
        <svg className="sf-sideLolly" viewBox="0 0 120 260">
          <line x1="60" y1="110" x2="60" y2="256" stroke="#fff" strokeWidth="8" strokeLinecap="round" />
          <circle cx="60" cy="60" r="54" fill="#FF8FAB" />
          <path d="M60 60 m-36 0 a36 36 0 1 1 36 36 a24 24 0 1 1 -24 -24 a12 12 0 1 1 12 12" fill="none" stroke="#fff" strokeWidth="8" strokeLinecap="round" />
        </svg>
        <Gif src={GIF.bearsCuddle} size={110} tilt={6} float className="sf-sideGif" />
      </div>
    </div>
  );
}

export default function ChocolateDayPremiumExperience(props: ExperienceProps) {
  const day = getDay(SLUG);
  return (
    <PremiumRoot data={props.data} mode={props.mode} slug={SLUG}>
      <DayRoot day={day} data={props.data} layout="full">
        <Story {...props} />
      </DayRoot>
    </PremiumRoot>
  );
}
