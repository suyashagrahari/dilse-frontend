"use client";

// ─── Hug Day ✦ Premium: "The Hug Passport" (v3) ──────────────────────────────────────────────────────────────
//
// Collect every kind of hug. research §D6 "Jhappi Passport" (.template-factory/premium-v3/research.md). Bright Peach
// Sorbet + mint palette, Fredoka + Caveat (+ Patrick Hand for the letter), the $2 Hug Day's hand-drawn huggers, cute
// GIF stickers in every scene, and a stamp (thunk + hearts + haptic) at the end of every hug. Short gesture hugs with
// jelly physics, never a long timed hold (hold-my-hand already ships that).
//
//  gate      her Hug Passport and a bear with open arms ("Come here, you."); the tap starts the song and the bear
//            runs at the screen
//  bear      stamp 1: pinch the two of them together → a squash-and-stretch bear hug → stamp + photo souvenir
//  back      stamp 2: drag him round behind her → a back hug (chai o'clock)
//  twirl     stamp 3: draw a circle round them → they spin and lift off
//  pat       stamp 4: pat his head three times under a rain cloud → sun, rainbow, a hug
//  far       stamp 5: drag two phones together across the distance (km counts down) → they meet, her photo in a heart
//  letter    hug mail: an airmail envelope with her name; tap → his letter types itself
//  voice     a hug you can hear: a plush that purrs while his voice note plays (or says his caption)
//  coupons   hug coupons she can REDEEM (stamped, and she can tell him on WhatsApp)
//  final     the last stamp: his question, Yes / a pleading runaway No → drop(): THE money moment, the Forever stamp
//            slams down on the chorus and the passport bursts into a wall of hugging couples around her photo
//  passport  the keepsake: her passport (holder page + every stamp), save as a wallpaper, the sealed P.S., send a
//            hug back, replay
//
// Scenes without content are skipped (no letter, no voice + no caption).

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { DayRoot, burst, useReducedMotion } from "../../_valentine/kit";
import { PremiumGate, PremiumRoot, usePremium } from "../../_valentine/kit/premium";
import { getDay } from "../../_valentine/days";
import type { ExperienceProps } from "../../_valentine/types";
import { PASSPORT_FONT_VARS } from "./passport/fonts";
import { PASSPORT_CSS } from "./passport/styles";
import { registerPassportCues } from "./passport/cues";
import { readPassport, type StampKind } from "./passport/util";
import { PassportCover, Slot } from "./passport/art";
import { PassportContext, type PassportCtx } from "./passport/ui";
import { HugScene } from "./passport/HugScene";
import { FarScene } from "./passport/FarScene";
import { LetterScene } from "./passport/LetterScene";
import { VoiceScene } from "./passport/VoiceScene";
import { CouponScene } from "./passport/CouponScene";
import { FinalScene } from "./passport/FinalScene";
import { PassportScene } from "./passport/PassportScene";

const SLUG = "happy-hug-day-premium" as const;
type SceneId = "gate" | "bear" | "back" | "twirl" | "pat" | "far" | "letter" | "voice" | "coupons" | "final" | "passport";

function Passport({ data, mode, react }: ExperienceProps) {
  const day = getDay(SLUG);
  const p = usePremium();
  const reduce = useReducedMotion();
  const g = useMemo(() => readPassport(data), [data]);
  const [scene, setScene] = useState<SceneId>(p.opened ? "bear" : "gate");
  const [run, setRun] = useState(0);
  const [got, setGot] = useState<ReadonlySet<StampKind>>(() => new Set());
  const hasLetter = !!data.letter?.trim();
  const hasVoice = !!p.premium.voiceNote || !!p.premium.voiceCaption.trim();

  useEffect(registerPassportCues, []);

  const order = useMemo(() => {
    const o: SceneId[] = ["bear", "back", "twirl", "pat", "far"];
    if (hasLetter) o.push("letter");
    if (hasVoice) o.push("voice");
    o.push("coupons", "final", "passport");
    return o;
  }, [hasLetter, hasVoice]);

  const next = useCallback(
    (from: SceneId) => {
      const i = order.indexOf(from);
      setScene(order[Math.min(order.length - 1, i + 1)]);
    },
    [order],
  );

  useEffect(() => {
    if (scene !== "gate" && typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "auto" });
  }, [scene]);

  // The song sits a little lower under the letter (where the platform lets us fade it).
  const musicRef = useRef(p.music);
  useEffect(() => {
    musicRef.current = p.music;
  });
  useEffect(() => {
    const m = musicRef.current;
    if (!m?.canFade || scene === "gate") return;
    m.fadeTo(scene === "letter" ? 0.6 : 1, 1200);
  }, [scene]);

  const reactRef = useRef(react);
  useEffect(() => {
    reactRef.current = react;
  });
  useEffect(() => {
    if (scene === "passport") reactRef.current("completed");
  }, [scene]);

  const stamp = useCallback((k: StampKind) => {
    setGot((s) => {
      if (s.has(k)) return s;
      const n = new Set(s);
      n.add(k);
      return n;
    });
  }, []);
  const date = `${day.date} ${String(day.month).slice(0, 3).toUpperCase()}`;
  const ctx: PassportCtx = useMemo(() => ({ g, day, gifs: data.gifs, got, stamp, date }), [g, day, data.gifs, got, stamp, date]);

  const replay = () => {
    setRun((r) => r + 1);
    setScene("bear");
  };

  const render = (s: SceneId) => {
    switch (s) {
      case "gate":
        return null;
      case "bear":
      case "back":
      case "twirl":
      case "pat":
        return <HugScene kind={s} onDone={() => next(s)} />;
      case "far":
        return <FarScene hasLetter={hasLetter} onDone={() => next("far")} />;
      case "letter":
        return <LetterScene letter={data.letter} hasMore={hasVoice} onDone={() => next("letter")} />;
      case "voice":
        return <VoiceScene onDone={() => next("voice")} />;
      case "coupons":
        return <CouponScene onDone={() => next("coupons")} />;
      case "final":
        return <FinalScene onAnswered={(d) => react("answered", { noDodges: d })} onDone={() => next("final")} />;
      case "passport":
        return <PassportScene data={data} mode={mode} onReplay={replay} />;
    }
  };

  return (
    <PassportContext.Provider value={ctx}>
      <div
        className="hp-root"
        // The bear runs at the screen in the same tap that starts the song.
        onClickCapture={
          scene === "gate"
            ? (e) => {
                const t = e.target as HTMLElement;
                if (t.closest(".pm-gateCta, .pm-gateArt")) burst({ kind: "hearts", origin: { x: 0.5, y: 0.45 }, emojis: ["🧡", "💗", "🤗", "✨"], count: 26, spread: 0.42 });
              }
            : undefined
        }
      >
        <style>{PASSPORT_CSS}</style>
        <div className="hp-bg" aria-hidden>
          <i className="hp-blob hp-blob--a" />
          <i className="hp-blob hp-blob--b" />
          <i className="hp-blob hp-blob--c" />
          {!reduce && (
            <span className="hp-bubbles">
              {Array.from({ length: 8 }, (_, k) => (
                <i key={k} style={{ left: `${6 + k * 12}%`, animationDelay: `${(k * 1.7) % 9}s`, animationDuration: `${11 + (k % 3) * 3}s` }} />
              ))}
            </span>
          )}
        </div>

        {scene === "gate" && (
          <PremiumGate
            art={<PassportCover name={g.to} species={g.species} opening={g.opening} peek={<Slot day={day} gifs={data.gifs} id="hp1-run" size={96} tilt={-8} eager />} />}
            kicker="A hug passport, issued to"
            subtitle={<span className="hp-gateSub">{g.pet ? `${g.pet} · ` : ""}Hug Day · sound on 🎧</span>}
            sting="chime-cascade"
            openLabel="Come here 🤗"
            sealText="Valid for unlimited hugs"
            className="hp-gate"
            bg="transparent"
            ink="#5E3226"
            accent="#FF8A6B"
            openMs={reduce ? 250 : 1150}
            onOpen={() => {
              react("opened");
              setScene("bear");
            }}
          />
        )}

        <AnimatePresence mode="wait" initial={false}>
          {scene !== "gate" && (
            <motion.div
              key={`${scene}-${run}`}
              className="hp-sceneWrap"
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24, scaleX: 1.06, scaleY: 0.94 }}
              animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, scaleX: 1, scaleY: 1, transition: { type: "spring", stiffness: 260, damping: 18 } }}
              exit={reduce ? { opacity: 0, transition: { duration: 0.15 } } : { opacity: 0, y: -12, scale: 0.96, transition: { duration: 0.25 } }}
            >
              {render(scene)}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PassportContext.Provider>
  );
}

export default function HugDayPremiumExperience(props: ExperienceProps) {
  const day = getDay(SLUG);
  return (
    <PremiumRoot data={props.data} mode={props.mode} slug={SLUG}>
      <DayRoot
        day={day}
        data={props.data}
        layout="column"
        className={PASSPORT_FONT_VARS}
        style={{ ["--font-vw-script" as string]: "var(--hp-hand)", ["--vw-font-script" as string]: "var(--hp-hand), 'Caveat', cursive" }}
      >
        <Passport {...props} />
      </DayRoot>
    </PremiumRoot>
  );
}
