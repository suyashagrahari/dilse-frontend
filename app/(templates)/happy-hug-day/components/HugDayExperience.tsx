"use client";

// ─── Hug Day — "Jaadu Ki Jhappi Café" ────────────────────────────────────────
//
// café door (bell) → first squish (pinch / drag the two characters into a
// hug — no hold, no meter) → chalkboard Hug Menu, each hug a short distinct
// gesture that stamps the Jhappi Passport → the letter slides out of a
// hoodie pocket → patchwork memory quilt (photos) → tear-off hug coupons that
// open WhatsApp → Jhappi Passport keepsake + ending.

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { getDay } from "../../_valentine/days";
import type { HugExtras } from "../../_valentine/days/happy-hug-day";
import { DayRoot, FloatingParticles, MusicToggle, Sticker, useReducedMotion, useSynthMusic } from "../../_valentine/kit";
import { VW } from "../../_valentine/theme";
import type { ExperienceProps, GifSlot } from "../../_valentine/types";
import CafeDoor from "./hug/CafeDoor";
import { pairOf } from "./hug/Characters";
import Coupons from "./hug/Coupons";
import Ending from "./hug/Ending";
import FirstSquish from "./hug/FirstSquish";
import HoodieLetter from "./hug/HoodieLetter";
import HugMenu, { type MenuItem } from "./hug/HugMenu";
import Quilt from "./hug/Quilt";
import { useSfxEnabled } from "./hug/ui";

const day = getDay("happy-hug-day");

type Step = "door" | "squish" | "menu" | "letter" | "quilt" | "coupons" | "ending";
const STEPS: Step[] = ["door", "squish", "menu", "letter", "quilt", "coupons", "ending"];

const DEFAULT_MENU: MenuItem[] = [
  { name: "Bear Hug", line: "Itni tight ki saari tension nikal jaaye", price: "1 smile" },
  { name: "Back Hug", line: "Peeche se aake… surprise!", price: "free forever" },
  { name: "Sleepy Hug", line: "5 minute aur, please", price: "2 kisses" },
  { name: "Comfort Pat Hug", line: "Main hoon na.", price: "on the house" },
];
const DEFAULT_COUPONS = [
  { title: "One 10-minute Bear Hug", detail: "Redeemable anytime, even mid-fight" },
  { title: "Unlimited Back Hugs", detail: "While you cook. No expiry." },
  { title: "One Airport Hug", detail: "For the day I come back" },
];

const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

export default function HugDayExperience({ data, mode, react }: ExperienceProps) {
  const x = data.extras as HugExtras;
  const reduced = useReducedMotion();
  const music = useSynthMusic({ melody: day.melody, enabled: mode === "live" && data.music });
  useSfxEnabled(data.music);

  const recipient = data.recipientName || "You";
  const sender = data.senderName || "Me";
  const species = pairOf(x.characters);
  const tagMe = str(x.tagMe) || "Me";
  const tagYou = str(x.tagYou) || "You";

  const menu = useMemo<MenuItem[]>(() => {
    const m = (Array.isArray(x.menu) ? x.menu : []).map((it) => ({ name: str(it?.name), line: str(it?.line), price: str(it?.price) })).filter((it) => it.name);
    return (m.length ? m : DEFAULT_MENU).slice(0, 6);
  }, [x.menu]);
  const coupons = useMemo(() => {
    const c = (Array.isArray(x.coupons) ? x.coupons : []).map((it) => ({ title: str(it?.title), detail: str(it?.detail) })).filter((it) => it.title);
    return (c.length ? c : DEFAULT_COUPONS).slice(0, 6);
  }, [x.coupons]);

  const [i, setI] = useState(0);
  const step = STEPS[i];
  const next = () => setI((v) => Math.min(STEPS.length - 1, v + 1));
  const [stamped, setStamped] = useState<number[]>([]);
  const [redeemed, setRedeemed] = useState<number[]>([]);
  const replay = () => {
    setStamped([]);
    setRedeemed([]);
    setI(0);
  };

  useEffect(() => {
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "auto" });
  }, [step]);

  const completed = useRef(false);
  useEffect(() => {
    if (step === "ending" && !completed.current) {
      completed.current = true;
      react("completed", { count: stamped.length });
    }
  }, [step, react, stamped.length]);

  const sticker = (id: string, size = 100): ReactNode => {
    const s: GifSlot | undefined = day.gifSlots.find((g) => g.id === id);
    return s ? <Sticker slug={day.slug} slot={s} value={data.gifs[s.id]} size={size} /> : null;
  };

  const screen = (key: string, children: ReactNode, opts: { center?: boolean } = {}) => (
    <motion.section
      key={key}
      initial={reduced ? false : { opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduced ? undefined : { opacity: 0, y: -14 }}
      transition={{ duration: 0.45, ease: [0.2, 0.8, 0.2, 1] }}
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: opts.center === false ? "flex-start" : "center",
        gap: 16,
        padding: `76px 18px ${mode === "preview" ? 128 : 56}px`,
        textAlign: "center",
        position: "relative",
        zIndex: 1,
        maxWidth: 560,
        margin: "0 auto",
      }}
    >
      {children}
    </motion.section>
  );

  return (
    <DayRoot day={day}>
      <FloatingParticles emojis={day.theme.particles} count={10} opacity={0.32} />
      {mode === "live" && <MusicToggle music={music} />}

      <div aria-hidden style={{ position: "fixed", top: 24, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 6, padding: "6px 10px", borderRadius: 99, background: "rgba(255,250,246,.74)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", zIndex: 20 }}>
        {STEPS.map((s, k) => (
          <span key={s} style={{ width: k === i ? 20 : 7, height: 7, borderRadius: 9, background: k <= i ? VW.accent : VW.edge, opacity: k <= i ? 1 : 0.7, transition: "width .3s" }} />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === "door" &&
          screen("door", <CafeDoor recipient={recipient} petName={data.petName} sign={str(x.cafeSign) || "Jhappi Café · open only for you"} sender={sender} sticker={sticker("h1-welcome", 70)} onEnter={next} />)}
        {step === "squish" &&
          screen("squish", <FirstSquish prompt={str(x.squishPrompt) || "Inhe milao 🥺"} species={species} tagMe={tagMe} tagYou={tagYou} sticker={sticker("h2-hug", 90)} onDone={next} />)}
        {step === "menu" &&
          screen(
            "menu",
            <HugMenu
              menu={menu}
              species={species}
              recipient={recipient}
              stamped={stamped}
              onStamp={(k) => setStamped((s) => (s.includes(k) ? s : [...s, k]))}
              sticker={sticker("h3-cosy", 80)}
              onNext={next}
            />,
            { center: false },
          )}
        {step === "letter" && screen("letter", <HoodieLetter letter={data.letter || "Jhappi."} sender={sender} recipient={recipient} sticker={sticker("h4-far", 80)} onNext={next} />, { center: false })}
        {step === "quilt" && screen("quilt", <Quilt photos={data.photos} onNext={next} />, { center: false })}
        {step === "coupons" &&
          screen("coupons", <Coupons coupons={coupons} sender={sender} redeemed={redeemed} onRedeem={(k) => setRedeemed((r) => (r.includes(k) ? r : [...r, k]))} sticker={sticker("h5-coupon", 80)} onNext={next} />, { center: false })}
        {step === "ending" &&
          screen(
            "ending",
            <Ending data={data} mode={mode} menu={menu} stamped={stamped} species={species} tagMe={tagMe} tagYou={tagYou} recipient={recipient} sender={sender} sticker={sticker("h5-coupon", 100)} onReplay={replay} />,
          )}
      </AnimatePresence>
    </DayRoot>
  );
}
