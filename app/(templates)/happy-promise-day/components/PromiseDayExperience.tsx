"use client";

// ─── Promise Day — "Vaada Pakka" ─────────────────────────────────────────────
//
// envelope (crack the wax seal) → pinky swear (drag to hook) → promise jar
// (tap / shake for chits, last = the big promise) → ₹∞ Pyaar Stamp Paper
// (letter + clauses → fingertip signature → thumbprint → "Notarised by Cupid")
// → polaroids on a fairy-light string → love-lock on the twilight bridge
// (optional) → the signed Vachan Patra keepsake + ending.

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { getDay } from "../../_valentine/days";
import type { PromiseExtras } from "../../_valentine/days/happy-promise-day";
import { DayRoot, FloatingParticles, MusicToggle, Sticker, useReducedMotion, useSynthMusic } from "../../_valentine/kit";
import { VW } from "../../_valentine/theme";
import type { ExperienceProps, GifSlot } from "../../_valentine/types";
import Ending, { type PatraFacts } from "./promise/Ending";
import Envelope from "./promise/Envelope";
import FairyLights from "./promise/FairyLights";
import LoveLock from "./promise/LoveLock";
import PinkySwear from "./promise/PinkySwear";
import PromiseJar from "./promise/PromiseJar";
import VachanPatra from "./promise/VachanPatra";
import { hashStr, initial, useSfxEnabled } from "./promise/ui";

const day = getDay("happy-promise-day");

type Step = "envelope" | "pinky" | "jar" | "patra" | "photos" | "lock" | "ending";

export default function PromiseDayExperience({ data, mode, react }: ExperienceProps) {
  const x = data.extras as PromiseExtras;
  const reduced = useReducedMotion();
  const music = useSynthMusic({ melody: day.melody, enabled: mode === "live" && data.music });
  useSfxEnabled(data.music);

  const recipient = data.recipientName || "You";
  const sender = data.senderName || "Me";

  const clauses = useMemo(() => {
    const list = (Array.isArray(x.promises) ? x.promises : []).map((p) => (typeof p === "string" ? p.trim() : "")).filter(Boolean);
    return list.length ? list : ["I promise to keep choosing you, every single day."];
  }, [x.promises]);
  const bigPromise = (typeof x.bigPromise === "string" ? x.bigPromise.trim() : "") || "";
  // The jar: every promise, then the big one last (or the last promise doubles as the big one).
  const chits = useMemo(() => (bigPromise ? [...clauses, bigPromise] : clauses), [clauses, bigPromise]);
  const date = useMemo(() => new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }), []);
  const seed = useMemo(() => hashStr(`${sender}♥${recipient}`), [sender, recipient]);
  const serial = useMemo(() => `VP-${String(100000 + (seed % 900000))}`, [seed]);
  const engraving = (typeof x.lockEngraving === "string" && x.lockEngraving.trim()) || `${initial(sender, "A")} + ${initial(recipient, "M")} · forever`;
  const [signature, setSignature] = useState<string | null>(null);
  const facts: PatraFacts = { sender, recipient, date, serial, seed, clauses, bigPromise: bigPromise || clauses[clauses.length - 1], signature };

  const steps = useMemo<Step[]>(() => {
    const s: Step[] = ["envelope", "pinky", "jar", "patra", "photos"];
    if (x.lockFinale !== false) s.push("lock");
    s.push("ending");
    return s;
  }, [x.lockFinale]);
  const [i, setI] = useState(0);
  const step = steps[Math.min(i, steps.length - 1)];
  const next = () => setI((v) => Math.min(steps.length - 1, v + 1));
  const replay = () => {
    setSignature(null);
    setI(0);
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
      <FloatingParticles emojis={day.theme.particles} count={10} opacity={0.35} />
      {mode === "live" && <MusicToggle music={music} />}

      <div aria-hidden style={{ position: "fixed", top: 24, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 6, padding: "6px 10px", borderRadius: 99, background: "rgba(255,250,246,.74)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", zIndex: 20 }}>
        {steps.map((s, k) => (
          <span key={s} style={{ width: k === i ? 20 : 7, height: 7, borderRadius: 9, background: k <= i ? VW.accent : VW.edge, opacity: k <= i ? 1 : 0.7, transition: "width .3s" }} />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === "envelope" &&
          screen(
            "envelope",
            <Envelope
              recipient={recipient}
              sender={sender}
              petName={data.petName}
              line={x.envelopeLine || "Ek vaada, sirf tumhare liye"}
              seal={`${initial(sender, "A")}·${initial(recipient, "M")}`}
              sticker={sticker("pr1-envelope", 96)}
              onOpen={next}
            />,
          )}
        {step === "pinky" &&
          screen("pinky", <PinkySwear prompt={x.pinkyPrompt || "Pehle pinky promise karo 🤙"} me={recipient} them={sender} sticker={sticker("pr2-pinky", 92)} onDone={next} />)}
        {step === "jar" && screen("jar", <PromiseJar chits={chits} bigIndex={chits.length - 1} sticker={sticker("pr3-jar", 84)} onDone={next} />)}
        {step === "patra" &&
          screen(
            "patra",
            <VachanPatra
              sender={sender}
              recipient={recipient}
              petName={data.petName}
              letter={data.letter || "I promise."}
              clauses={clauses}
              bigPromise={bigPromise}
              date={date}
              serial={serial}
              seed={seed}
              sticker={sticker("pr4-stamp", 96)}
              onSigned={(s) => setSignature(s.signature)}
              onNext={next}
            />,
            { center: false },
          )}
        {step === "photos" &&
          screen(
            "photos",
            <FairyLights photos={data.photos} fallbackCaptions={clauses} nextLabel={x.lockFinale !== false ? "One last thing… 🔐" : "Our signed Vachan Patra →"} onNext={next} />,
            { center: false },
          )}
        {step === "lock" && screen("lock", <LoveLock engraving={engraving} style={x.lockStyle} sticker={sticker("pr5-lock", 84)} onNext={next} />)}
        {step === "ending" &&
          screen(
            "ending",
            <Ending facts={facts} data={data} mode={mode} sticker={sticker(x.lockFinale !== false ? "pr2-pinky" : "pr5-lock", 110)} onReplay={replay} />,
          )}
      </AnimatePresence>
    </DayRoot>
  );
}
