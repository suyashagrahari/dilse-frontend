"use client";

// ─── Miss You ✦ Premium — "two dots on a map, and the distance shrinking" ────
//
// One long-distance day, morning to the next sunrise (the sky behind every
// scene walks through the hours, all pastel):
//   draw the curtains open (a skywriter writes their name) → tune the radio to
//   our frequency (voice notes) → pull the photo-booth strip (only when there
//   are photos) → set up our picnic (drag things onto the blanket) → tear the
//   calendar down to the day we meet (live countdown) → drag the bottle out of
//   the waves, pop the cork (the letter) → tap along till our heartbeats sync
//   → join the stars into our initials (each line lights a thing I miss) →
//   "Video call tonight?" on a tin-can phone → sunrise: the two dots meet, the
//   km run down to 0, an airmail postcard keepsake.
//
// The whole page wears the sender's pick (extras.palette): DayRoot gets the day
// with that palette's theme, the scenes read --vw-* / --mp-* vars. The trail
// top-left shows the two dots creeping together; ‹ goes back a scene.

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import { getDay } from "../../_valentine/days";
import {
  DEFAULT_MISS_THINGS,
  DEFAULT_PICNIC_LINES,
  DEFAULT_VOICE_NOTES,
  MISS_PREM_PALETTES,
  MISS_PREM_TONES,
  PICNIC_ITEMS,
  type MissPremExtras,
  type MissPremPalette,
  type MissPremTone,
  type SkyHour,
} from "../../_valentine/days/miss-you-premium";
import { DayRoot, Sticker, burst, haptic, useReducedMotion } from "../../_valentine/kit";
import type { DayConfig, ExperienceProps, GifSlot } from "../../_valentine/types";
import { kmBetween } from "../../miss-you/components/mu/geo";
import { mpDisplay, mpHand } from "./mp/fonts";
import { Curtains, PhotoBooth, Radio } from "./mp/Opening";
import { MP_STAGE_CSS, MpStage } from "./mp/stage";
import { MP_UI_CSS, Sky, clean, paletteVars } from "./mp/ui";

// The later scenes are their own chunk, fetched while she is on the first ones.
const loadMiddle = () => import("./mp/Middle");
const loadDusk = () => import("./mp/Dusk");
const loadFinale = () => import("./mp/Finale");
const Picnic = dynamic(() => loadMiddle().then((m) => m.Picnic), { ssr: false });
const TearCalendar = dynamic(() => loadMiddle().then((m) => m.TearCalendar), { ssr: false });
const Bottle = dynamic(() => loadMiddle().then((m) => m.Bottle), { ssr: false });
const Heartbeat = dynamic(() => loadDusk().then((m) => m.Heartbeat), { ssr: false });
const Constellation = dynamic(() => loadDusk().then((m) => m.Constellation), { ssr: false });
const Question = dynamic(() => loadFinale().then((m) => m.Question), { ssr: false });
const Answered = dynamic(() => loadFinale().then((m) => m.Answered), { ssr: false });
const Ending = dynamic(() => loadFinale().then((m) => m.Ending), { ssr: false });

const day = getDay("miss-you-premium");

type Step = "window" | "radio" | "photos" | "picnic" | "calendar" | "bottle" | "heart" | "stars" | "question" | "ending";

const HOUR: Record<Step, SkyHour> = {
  window: "morning",
  radio: "morning",
  photos: "noon",
  picnic: "afternoon",
  calendar: "afternoon",
  bottle: "golden",
  heart: "sunset",
  stars: "dusk",
  question: "dusk",
  ending: "sunrise",
};

const TONES = Object.keys(MISS_PREM_TONES) as MissPremTone[];
const isToneDefault = (q: string) => TONES.some((t) => MISS_PREM_TONES[t].question === q);
const isPalette = (p: unknown): p is MissPremPalette => typeof p === "string" && p in MISS_PREM_PALETTES;

/** "YYYY-MM-DD" → local midnight, or null. */
function parseMeet(v: unknown): Date | null {
  const m = typeof v === "string" ? /^(\d{4})-(\d{2})-(\d{2})$/.exec(v.trim()) : null;
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return Number.isNaN(d.getTime()) ? null : d;
}

function initialOf(name: string): string {
  const c = name.normalize("NFD").replace(/[̀-ͯ]/g, "").trim().charAt(0).toUpperCase();
  return /^[A-Z]$/.test(c) ? c : "♥";
}

export default function MissYouPremiumExperience({ data, mode, react }: ExperienceProps) {
  const x = data.extras as MissPremExtras;
  const reduced = useReducedMotion();

  const palette = MISS_PREM_PALETTES[isPalette(x.palette) ? x.palette : "cottonCandy"];
  const themed = useMemo<DayConfig>(() => ({ ...day, theme: palette.theme }), [palette]);

  const tone: MissPremTone = TONES.includes(x.tone) ? x.tone : "partner";
  const T = MISS_PREM_TONES[tone];
  const recipient = data.recipientName || "You";
  const sender = data.senderName || "Me";
  const question = clean(x.question) && !isToneDefault(clean(x.question)) ? clean(x.question) : T.question;
  const yourCity = clean(x.yourCity);
  const myCity = clean(x.myCity);
  const km = useMemo(() => {
    const n = typeof x.distanceKm === "number" && x.distanceKm > 0 ? x.distanceKm : null;
    return n ?? (yourCity && myCity ? kmBetween(yourCity, myCity) : null);
  }, [x.distanceKm, yourCity, myCity]);
  const unit = x.unit === "mi" ? "mi" : "km";
  const meet = useMemo(() => parseMeet(x.meetDate), [x.meetDate]);
  const notes = useMemo(() => {
    const src = (Array.isArray(x.voiceNotes) ? x.voiceNotes : []).map(clean).filter(Boolean);
    return src.length ? src.slice(0, 3) : [...DEFAULT_VOICE_NOTES];
  }, [x.voiceNotes]);
  const picnicLines = useMemo(() => {
    const src = Array.isArray(x.picnicLines) ? x.picnicLines : [];
    return PICNIC_ITEMS.map((_, k) => clean(src[k]) || DEFAULT_PICNIC_LINES[k]);
  }, [x.picnicLines]);
  const things = useMemo(() => {
    const src = (Array.isArray(x.missThings) ? x.missThings : []).map(clean).filter(Boolean);
    return src.length ? src.slice(0, 6) : [...DEFAULT_MISS_THINGS];
  }, [x.missThings]);
  const heartLine = clean(x.heartLine) || "Two cities, one heartbeat. Yours. 💓";
  const photos = useMemo(() => data.photos.filter((p) => p && p.url), [data.photos]);
  const canLater = x.answerMode !== "yesOnly";

  const steps = useMemo<Step[]>(
    () => ["window", "radio", ...(photos.length || mode === "preview" ? (["photos"] as Step[]) : []), "picnic", "calendar", "bottle", "heart", "stars", "question", "ending"],
    [photos.length, mode],
  );
  const rooms = steps.length - 1;

  const [i, setI] = useState(0);
  const step = steps[Math.min(i, steps.length - 1)];
  const next = () => setI((v) => Math.min(steps.length - 1, v + 1));
  const [said, setSaid] = useState<null | "yes" | "later">(null);
  const [round, setRound] = useState(0);
  const replay = () => {
    setSaid(null);
    setRound((r) => r + 1);
    setI(0);
  };
  const back = () => {
    setRound((r) => r + 1);
    setI((v) => Math.max(0, v - 1));
  };

  useEffect(() => {
    // Warm the later scenes' chunk once the first screen is up.
    const t = window.setTimeout(() => {
      void loadMiddle();
      void loadDusk();
      void loadFinale();
    }, 1200);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "auto" });
  }, [step, said]);

  const completed = useRef(false);
  useEffect(() => {
    if (step === "ending" && !completed.current) {
      completed.current = true;
      react("completed");
    }
  }, [step, react]);

  const sayYes = () => {
    setSaid("yes");
    react("answered", { answer: "yes", noDodges: 0 });
    haptic(30);
    burst({ kind: "confetti", colors: palette.theme.confetti, origin: { x: 0.5, y: 0.4 }, count: 100 });
    burst({ kind: "hearts", emojis: ["💗", "🩵", "💕", "📞", "✨"], origin: { x: 0.5, y: 0.5 }, count: 30 });
    if (!reduced) window.setTimeout(() => burst({ kind: "hearts", emojis: [...palette.floats], origin: { x: 0.5, y: 0.1 }, count: 24, spread: 0.6 }), 650);
  };
  const sayLater = () => {
    setSaid("later");
    react("answered", { answer: "no", noDodges: 0 });
    haptic(8);
  };

  const sticker = (id: string, size = 96): ReactNode => {
    const s: GifSlot | undefined = day.gifSlots.find((g) => g.id === id);
    if (!s || (data.gifs[s.id] ?? "").trim() === "none") return null;
    return (
      <span className="mp-stk" key={`${id}-${round}`}>
        <Sticker slug={day.slug} slot={s} value={data.gifs[s.id]} size={size} alt="" />
      </span>
    );
  };

  const replyText = said === "later" ? T.laterReply : T.reply;

  const screen = (key: string, children: ReactNode, bloom = false) => (
    <motion.section
      key={`${key}-${round}`}
      className="mp-scene"
      data-mp-scene={key}
      initial={reduced ? false : bloom ? { opacity: 0, scale: 0.88 } : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={reduced ? undefined : { opacity: 0, transition: { duration: 0.01 } }}
      transition={bloom ? { type: "spring", stiffness: 170, damping: 18 } : { duration: 0.45, ease: [0.2, 0.8, 0.2, 1] }}
    >
      {children}
    </motion.section>
  );

  return (
    <DayRoot day={themed} data={data} className={`${mpDisplay.variable} ${mpHand.variable}`} style={{ paddingBottom: 0, ...paletteVars(palette) }} layout="full">
      <style>{MP_STAGE_CSS + MP_UI_CSS}</style>
      {/* The engine's music button sits outside DayRoot (no --vw-* vars there): paint it in this palette. */}
      <style>{`body .vm-icon-btn { background: radial-gradient(circle at 50% 38%, ${palette.theme.accent}, ${palette.theme.accentDeep} 72%); } html::-webkit-scrollbar-thumb { background: ${palette.theme.accent}; } html::-webkit-scrollbar-track { background: ${palette.blush}; } html { scrollbar-color: ${palette.theme.accent} ${palette.blush}; }`}</style>
      <Sky palette={palette} hour={HOUR[step]} warm={said === "yes"} />

      <MpStage round={round} trail={{ at: i, rooms, ending: step === "ending", km, unit, onBack: back }}>
        <AnimatePresence mode="wait" initial={false}>
          {step === "window" &&
            screen("window", <Curtains recipient={recipient} petName={clean(data.petName)} sender={sender} openingLine={clean(x.openingLine)} sticker={sticker("p1-hello", 92)} onNext={next} />)}
          {step === "radio" && screen("radio", <Radio notes={notes} sender={sender} sticker={sticker("p2-radio", 74)} onNext={next} />)}
          {step === "photos" && screen("photos", <PhotoBooth photos={photos} placeholders={photos.length ? 0 : 3} onNext={next} />)}
          {step === "picnic" && screen("picnic", <Picnic lines={picnicLines} sticker={sticker("p3-picnic", 78)} onNext={next} />)}
          {step === "calendar" && screen("calendar", <TearCalendar meet={meet} onNext={next} />)}
          {step === "bottle" && screen("bottle", <Bottle letter={data.letter || "I miss you. Every single day."} recipient={recipient} petName={clean(data.petName)} sender={sender} onNext={next} />)}
          {step === "heart" && screen("heart", <Heartbeat recipient={recipient} sender={sender} heartLine={heartLine} sticker={sticker("p4-heart", 80)} onNext={next} />)}
          {step === "stars" && screen("stars", <Constellation a={initialOf(recipient)} b={initialOf(sender)} things={things} sticker={sticker("p5-miss", 78)} onNext={next} />)}
          {step === "question" && said === null &&
            screen("question", <Question question={question} yesLabel={T.yes} laterLabel={T.later} canLater={canLater} recipient={recipient} sender={sender} onYes={sayYes} onLater={sayLater} />)}
          {step === "question" && said !== null &&
            screen("answered", <Answered said={said} recipient={recipient} sender={sender} yesLine={clean(x.yesLine)} sticker={sticker("p6-yes", 140)} onNext={next} />, true)}
          {step === "ending" &&
            screen(
              "ending",
              <Ending day={themed} data={data} mode={mode} palette={palette} recipient={recipient} sender={sender} myCity={myCity} yourCity={yourCity} km={km} unit={unit} stamp={T.stamp} replyText={replyText} onReplay={replay} />,
            )}
        </AnimatePresence>
      </MpStage>
    </DayRoot>
  );
}
