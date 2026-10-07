"use client";

// ─── StarterStory — the engine's placeholder Experience ──────────────────────
//
// names → letter → photos → (optional day beat) → ending, with the day's GIF
// slots, theme, music, ambient particles, keepsake and WhatsApp reply. Each
// day's <Name>Experience.tsx currently renders this with its own copy; day
// builders REPLACE that file with the real interactive experience and are free
// to keep using pieces of this one.
//
// It already honours the whole contract: `react("completed")` on reaching the
// ending (live only — `react` is a no-op in preview), `beat` lets a day insert
// one step (the question days put RunawayNo there and call react("answered")).

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { getDay } from "../days";
import { FONTS, VW } from "../theme";
import type { DaySlug, ExperienceProps, GifSlot } from "../types";
import DayRoot from "./DayRoot";
import Sticker from "./Sticker";
import Typewriter from "./Typewriter";
import CroppedPhoto from "./CroppedPhoto";
import PhotoLightbox from "./PhotoLightbox";
import EndingActions from "./EndingActions";
import { burst, FloatingParticles } from "./Burst";
import { MusicToggle, useSynthMusic } from "./useSynthMusic";
import { defaultKeepsake } from "./keepsake";
import { useReducedMotion } from "./useReducedMotion";
import { haptic } from "./haptic";

export interface StarterStoryProps extends ExperienceProps {
  slug: DaySlug;
  /** Which GIF slot shows at which step (slot ids). */
  slots: { intro: string; letter: string; photos: string; beat?: string; ending: string };
  /** Small line above their name on the first screen. */
  introKicker?: string;
  /** The line under the title on the first screen (an extras field, usually). */
  introLine?: string;
  /** The first screen's button. */
  openLabel?: string;
  /** One extra step after the photos. Call `next()` when it's done. */
  beat?: (next: () => void) => ReactNode;
  /** Headline for the keepsake/ending (e.g. "said YES after 4 dodges"). */
  endingHeadline?: string;
  /** Extra content on the ending screen, above the actions. */
  endingExtra?: ReactNode;
}

type Step = "intro" | "letter" | "photos" | "beat" | "ending";

export default function StarterStory({ slug, data, mode, react, slots, introKicker, introLine, openLabel, beat, endingHeadline, endingExtra }: StarterStoryProps) {
  const day = getDay(slug);
  const reduced = useReducedMotion();
  const steps = useMemo<Step[]>(() => {
    const s: Step[] = ["intro", "letter"];
    if (data.photos.length) s.push("photos");
    if (beat) s.push("beat");
    s.push("ending");
    return s;
  }, [data.photos.length, beat]);
  const [i, setI] = useState(0);
  const [letterDone, setLetterDone] = useState(false);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const step = steps[Math.min(i, steps.length - 1)];
  const music = useSynthMusic({ melody: day.melody, enabled: mode === "live" && data.music });

  const slot = (id?: string): GifSlot | undefined => day.gifSlots.find((g) => g.id === id);
  const sticker = (id: string | undefined, size = 110) => {
    const s = slot(id);
    return s ? <Sticker slug={day.slug} slot={s} value={data.gifs[s.id]} size={size} /> : null;
  };

  const next = () => {
    haptic(8);
    setI((x) => Math.min(steps.length - 1, x + 1));
  };

  useEffect(() => {
    if (step !== "ending") return;
    react("completed");
    burst({ kind: "hearts", origin: { x: 0.5, y: 0.4 }, emojis: day.theme.particles });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const btn: React.CSSProperties = {
    minHeight: 54,
    padding: "14px 28px",
    borderRadius: 18,
    border: 0,
    background: VW.accent,
    color: VW.accentInk,
    font: `700 17px ${FONTS.ui}`,
    boxShadow: `0 5px 0 ${VW.accentDeep}, 0 16px 30px -14px rgba(0,0,0,.45)`,
    cursor: "pointer",
  };

  const screen = (key: string, children: ReactNode) => (
    <motion.section
      key={key}
      initial={reduced ? false : { opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduced ? undefined : { opacity: 0, y: -14 }}
      transition={{ duration: 0.45, ease: [0.2, 0.8, 0.2, 1] }}
      style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 18, padding: `72px 20px ${mode === "preview" ? 120 : 48}px`, textAlign: "center", position: "relative", zIndex: 1 }}
    >
      {children}
    </motion.section>
  );

  return (
    <DayRoot day={day}>
      <FloatingParticles emojis={day.theme.particles} count={12} opacity={day.theme.dark ? 0.55 : 0.45} />
      {mode === "live" && <MusicToggle music={music} />}

      {/* progress dots */}
      <div aria-hidden style={{ position: "fixed", top: 22, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 6, zIndex: 20 }}>
        {steps.map((s, k) => (
          <span key={s} style={{ width: k === i ? 20 : 7, height: 7, borderRadius: 9, background: k <= i ? VW.accent : VW.edge, opacity: k <= i ? 1 : 0.6, transition: "width .3s" }} />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === "intro" &&
          screen(
            "intro",
            <>
              {sticker(slots.intro, 130)}
              <p style={{ margin: 0, font: `600 13px ${FONTS.ui}`, letterSpacing: ".18em", textTransform: "uppercase", color: VW.inkSoft }}>
                {introKicker ?? `Happy ${day.name} ${day.emoji}`}
              </p>
              <h1 style={{ margin: 0, font: `700 clamp(46px, 14vw, 72px)/1.05 ${FONTS.script}`, color: VW.ink, overflowWrap: "anywhere" }}>{data.recipientName || "You"}</h1>
              {data.petName && <p style={{ margin: "-6px 0 0", font: `italic 400 19px ${FONTS.serif}`, color: VW.inkSoft }}>“{data.petName}”</p>}
              <p style={{ margin: "6px 0 0", font: `600 18px ${FONTS.serif}`, color: VW.ink }}>{day.title}</p>
              {introLine && <p style={{ margin: 0, maxWidth: 340, font: `400 16px/1.5 ${FONTS.ui}`, color: VW.inkSoft }}>{introLine}</p>}
              <button type="button" onClick={next} style={{ ...btn, marginTop: 10 }}>
                {openLabel ?? `Open ${day.emoji}`}
              </button>
              <p style={{ margin: 0, font: `400 13px ${FONTS.ui}`, color: VW.inkSoft }}>from {data.senderName || "someone who loves you"}</p>
            </>,
          )}

        {step === "letter" &&
          screen(
            "letter",
            <>
              {sticker(slots.letter, 96)}
              <article
                style={{
                  width: "min(100%, 460px)",
                  maxHeight: "62dvh",
                  overflowY: "auto",
                  padding: "26px 22px",
                  borderRadius: 22,
                  background: VW.paper,
                  color: VW.paperInk,
                  textAlign: "left",
                  boxShadow: "0 24px 50px -24px rgba(0,0,0,.45)",
                  font: `400 17px/1.65 ${FONTS.serif}`,
                }}
              >
                <Typewriter text={data.letter} onDone={() => setLetterDone(true)} caretColor={day.theme.accent} />
              </article>
              <button type="button" onClick={next} style={{ ...btn, opacity: letterDone ? 1 : 0.55 }}>
                {letterDone ? "Next →" : "Skip to next →"}
              </button>
            </>,
          )}

        {step === "photos" &&
          screen(
            "photos",
            <>
              {sticker(slots.photos, 92)}
              <h2 style={{ margin: 0, font: `700 26px ${FONTS.serif}`, color: VW.ink }}>Our moments</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 14, width: "min(100%, 420px)" }}>
                {data.photos.map((p, k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setLightbox(k)}
                    aria-label={p.caption ? `Open photo: ${p.caption}` : `Open photo ${k + 1}`}
                    style={{ padding: "8px 8px 10px", border: 0, borderRadius: 6, background: "#fff", boxShadow: "0 12px 26px -14px rgba(0,0,0,.5)", transform: `rotate(${k % 2 ? 2.2 : -2.2}deg)`, cursor: "pointer" }}
                  >
                    <span style={{ display: "block", aspectRatio: "4 / 5", borderRadius: 3, overflow: "hidden" }}>
                      <CroppedPhoto photo={p} />
                    </span>
                    {p.caption && <span style={{ display: "block", marginTop: 6, font: `600 15px/1.2 ${FONTS.script}`, color: "#4a3a3a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.caption}</span>}
                  </button>
                ))}
              </div>
              <button type="button" onClick={next} style={btn}>
                Next →
              </button>
              <PhotoLightbox photos={data.photos} index={lightbox} onIndex={setLightbox} onClose={() => setLightbox(null)} />
            </>,
          )}

        {step === "beat" && beat && screen("beat", <>{sticker(slots.beat, 104)}{beat(next)}</>)}

        {step === "ending" &&
          screen(
            "ending",
            <>
              {sticker(slots.ending, 140)}
              <h2 style={{ margin: 0, font: `700 clamp(34px, 10vw, 52px)/1.1 ${FONTS.script}`, color: VW.ink }}>
                Happy {day.name}, {data.recipientName || "you"}
              </h2>
              {endingHeadline && <p style={{ margin: 0, font: `700 18px ${FONTS.ui}`, color: VW.accent }}>{endingHeadline}</p>}
              {data.endLine && <p style={{ margin: 0, maxWidth: 360, font: `italic 400 19px/1.5 ${FONTS.serif}`, color: VW.ink }}>{data.endLine}</p>}
              <p style={{ margin: 0, font: `400 22px ${FONTS.script}`, color: VW.inkSoft }}>— {data.senderName}</p>
              {endingExtra}
              <EndingActions
                day={day}
                data={data}
                mode={mode}
                onReplay={() => {
                  setI(0);
                  setLetterDone(false);
                }}
                keepsake={() => defaultKeepsake(day, data, { headline: endingHeadline })}
                style={{ marginTop: 6 }}
              />
            </>,
          )}
      </AnimatePresence>
    </DayRoot>
  );
}
