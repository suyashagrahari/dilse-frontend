"use client";

// ─── Happy Diwali — "A Diya at Your Door" ────────────────────────────────────
//
// the doorstep (tap the diya: the first gesture, so the music starts here, the
// screen blooms warm, the door opens) → a row of diyas (tap, or drag the flame
// along; each lifts a wish) → the rangoli (pick a colour, tap a ring; the
// initials glow, the owner's rangoli GIF blooms) → the sparkler (swipe to
// write their word in light) → sky lanterns (their photos, lit one by one;
// skipped when there are none) → the crackers playground (pick crackers from
// a tray, light them on the ground or in the sky; fireworks finales) → the
// liffafa (a red-and-gold shagun envelope opens; the letter slides out into
// diya light, paged to fit) → the mithai box → the Shubh Deepavali card +
// "Light a diya for someone".
//
// Tiny diyas in the top-left corner light up scene by scene (tap an earlier one
// to go back). Every scene is ONE screen; the way forward is always the same
// marigold pill at the bottom (./diwali/stage.tsx), tap-only. On wide screens
// the night is full-bleed (./diwali/Atmosphere.tsx) and the scenes sit in a
// comfortable column inside it. Reduced motion keeps every beat still.

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { getDay } from "../../_valentine/days";
import { DIWALI_TONES, type DiwaliExtras, type DiwaliMithai, type DiwaliTone } from "../../_valentine/days/happy-diwali";
import { DayRoot, Sticker, useReducedMotion } from "../../_valentine/kit";
import type { ExperienceProps, GifSlot } from "../../_valentine/types";
import { ART_CSS } from "./diwali/art";
import Atmosphere from "./diwali/Atmosphere";
import DiyaRow from "./diwali/DiyaRow";
import Doorstep from "./diwali/Doorstep";
import Ending from "./diwali/Ending";
import Crackers from "./diwali/Crackers";
import { dwDisplay } from "./diwali/fonts";
import Lanterns from "./diwali/Lanterns";
import Liffafa from "./diwali/Liffafa";
import Mithai from "./diwali/Mithai";
import Rangoli from "./diwali/Rangoli";
import Sparkler, { WAND } from "./diwali/Sparkler";
import { DW_STAGE_CSS, DiyaTrail, DwStage } from "./diwali/stage";
import { clean } from "./diwali/ui";

const day = getDay("happy-diwali");

/** "Meera" + "Arjun" → "M+A" (the rangoli's centre when the sender leaves it empty). */
const initialsOf = (a: string, b: string) => {
  const f = (s: string) => Array.from(s.trim())[0] ?? "";
  const x = f(a);
  const y = f(b);
  return x && y ? `${x}+${y}` : x || y;
};

type Step = "door" | "diyas" | "rangoli" | "sparkler" | "lanterns" | "crackers" | "liffafa" | "mithai" | "ending";
const ALL_STEPS: Step[] = ["door", "diyas", "rangoli", "sparkler", "lanterns", "crackers", "liffafa", "mithai", "ending"];

const TONES = Object.keys(DIWALI_TONES) as DiwaliTone[];
const MITHAI: DiwaliMithai[] = ["laddoo", "kaju-katli", "jalebi", "gulab-jamun", "barfi"];

export default function DiwaliExperience({ data, mode, react }: ExperienceProps) {
  const x = data.extras as DiwaliExtras;
  const reduced = useReducedMotion();

  const tone: DiwaliTone = TONES.includes(x.tone) ? x.tone : "romantic";
  const T = DIWALI_TONES[tone];
  const recipient = data.recipientName || "You";
  const sender = data.senderName || "Me";
  const hasPhotos = data.photos.some((p) => p && p.url);
  const steps = useMemo(() => ALL_STEPS.filter((s) => s !== "lanterns" || hasPhotos), [hasPhotos]);
  const rooms = steps.length - 1;

  const wishes = useMemo(() => {
    const own = (Array.isArray(x.wishes) ? x.wishes : []).map(clean).filter(Boolean).slice(0, 5);
    return own.length >= 1 ? own : [...T.wishes];
  }, [x.wishes, T]);
  const sparkleWord = (clean(x.sparkleWord) || clean(data.petName) || recipient.split(/\s+/)[0] || "YOU").slice(0, 12);
  const mithai: DiwaliMithai = MITHAI.includes(x.mithai) ? x.mithai : "laddoo";

  const [i, setI] = useState(0);
  const step = steps[Math.min(i, steps.length - 1)];
  const next = () => setI((v) => Math.min(steps.length - 1, v + 1));
  const [round, setRound] = useState(0);
  const replay = () => {
    setRound((r) => r + 1);
    setI(0);
  };
  const jumpTo = (k: number) => {
    if (k >= i) return;
    setRound((r) => r + 1);
    setI(k);
  };

  useEffect(() => {
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "auto" });
  }, [step]);

  const completed = useRef(false);
  useEffect(() => {
    if (step === "ending" && !completed.current) {
      completed.current = true;
      react("completed");
    }
  }, [step, react]);

  const sticker = (id: string, size = 96): ReactNode => {
    const s: GifSlot | undefined = day.gifSlots.find((g) => g.id === id);
    return s ? <Sticker slug={day.slug} slot={s} value={data.gifs[s.id]} size={size} alt="" /> : null;
  };

  // The town lights up as she goes.
  const glow = Math.min(1, i / Math.max(1, steps.length - 1));

  const screen = (key: string, children: ReactNode) => (
    <motion.section
      key={`${key}-${round}`}
      className="dw-scene"
      data-dw-scene={key}
      initial={reduced ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduced ? undefined : { opacity: 0, transition: { duration: 0.18 } }}
      transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
    >
      {children}
    </motion.section>
  );

  return (
    <DayRoot day={day} data={data} className={dwDisplay.variable} style={{ paddingBottom: 0 }} layout="full">
      <style>{DW_STAGE_CSS + ART_CSS}</style>
      <Atmosphere glow={glow} />
      <DiyaTrail at={i} rooms={rooms} ending={step === "ending"} onJump={jumpTo} />
      <DwStage round={round}>
        <AnimatePresence mode="wait" initial={false}>
          {step === "door" &&
            screen("door", <Doorstep recipient={recipient} petName={clean(data.petName)} doorNote={clean(x.doorNote) || T.doorNote} sticker={sticker("d1-diya", 52)} onEnter={next} />)}
          {step === "diyas" && screen("diyas", <DiyaRow wishes={wishes} sticker={sticker("d2-wishes", 60)} onNext={next} />)}
          {step === "rangoli" && screen("rangoli", <Rangoli initials={(clean(x.initials) || initialsOf(recipient, sender)).toUpperCase()} sticker={sticker("d3-rangoli", 48)} onNext={next} />)}
          {step === "sparkler" &&
            screen("sparkler", <Sparkler word={sparkleWord} sticker={sticker("d4-sparkler", WAND)} nextLabel={hasPhotos ? "Light lanterns" : "Crackers time!"} onNext={next} />)}
          {step === "lanterns" && screen("lanterns", <Lanterns photos={data.photos} onNext={next} />)}
          {step === "crackers" && screen("crackers", <Crackers onNext={next} />)}
          {step === "liffafa" && screen("liffafa", <Liffafa letter={data.letter || "Happy Diwali."} recipient={recipient} sender={sender} onNext={next} />)}
          {step === "mithai" && screen("mithai", <Mithai kind={mithai} note={clean(x.mithaiNote) || T.mithaiNote} onNext={next} />)}
          {step === "ending" &&
            screen(
              "ending",
              <Ending
                day={day}
                data={data}
                mode={mode}
                recipient={recipient}
                sender={sender}
                blessing={clean(x.blessing) || T.blessing}
                signOff={T.card}
                replyText={T.reply}
                sticker={sticker("d5-blessing", 86)}
                onReplay={replay}
              />,
            )}
        </AnimatePresence>
      </DwStage>
    </DayRoot>
  );
}
