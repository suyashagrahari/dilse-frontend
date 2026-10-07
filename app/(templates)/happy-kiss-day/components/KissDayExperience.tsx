"use client";

// ─── Kiss Day — "Sealed With a Kiss" ─────────────────────────────────────────
//
//  1 arrival   "1 unread kiss" notification + pink envelope with a kiss wax seal → crack it
//  2 ritual    lipstick mode: pick a shade (cap pops, bullet twists up)
//              cute mode (default, family-safe): kiss #1 on a bear cub's forehead/cheek/nose
//  3 jar       SIGNATURE — tap anywhere, kisses fly into a heart jar, sender's notes at milestones
//  4 mwah      WOW — jar overflows, a giant kiss zooms at the lens and smacks the glass
//  5 letter    drag the letter up out of the envelope, kiss-stamped signature
//  6 cam       Kiss-Cam jumbotron of their photos; tap to stamp kisses on them
//  7 coupons   scratch kiss coupons (hidden when the sender left none)
//  8 blow      your turn — hold + swipe up to blow a kiss back
//  9 ending    photobooth strip keepsake + EndingActions (WhatsApp = extras.kissBackText)
//
// GIF slots: k1-shy (envelope) · k2-cheer (jar counter) · k3-mwah (MWAH) ·
// k4-cheek (Kiss-Cam) · k5-blow (your turn).

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { DayRoot, FloatingParticles, MusicToggle, Sticker, useReducedMotion, useSynthMusic, haptic } from "../../_valentine/kit";
import { getDay } from "../../_valentine/days";
import { VW } from "../../_valentine/theme";
import type { ExperienceProps } from "../../_valentine/types";
import type { KissExtras } from "../../_valentine/days/happy-kiss-day";
import { SHADES, type KissStyle, type ShadeId } from "./kissArt";
import KissJarGame from "./KissJarGame";
import KissLetter from "./KissLetter";
import KissCam, { type PhotoKiss } from "./KissCam";
import { Arrival, BlowBack, Coupons, FirstKiss, LipstickPicker, Mwah } from "./KissBeats";
import { KissEnding } from "./KissEnding";

type Step = "arrival" | "ritual" | "jar" | "mwah" | "letter" | "cam" | "coupons" | "blow" | "ending";

export default function KissDayExperience({ data, mode, react }: ExperienceProps) {
  const day = getDay("happy-kiss-day");
  const x = (data.extras ?? {}) as Partial<KissExtras>;
  const reduced = useReducedMotion();
  const kind: KissStyle = x.kissStyle === "lipstick" ? "lipstick" : "cute";
  const senderShade: ShadeId = x.lipShade && x.lipShade in SHADES ? (x.lipShade as ShadeId) : "ruby";
  const target = Math.max(5, Math.min(30, Math.round(Number(x.kissTarget) || 14)));
  const notes = useMemo(() => (Array.isArray(x.kissNotes) ? x.kissNotes.filter((s) => typeof s === "string" && s.trim()) : []), [x.kissNotes]);
  const coupons = useMemo(() => (Array.isArray(x.coupons) ? x.coupons.filter((s) => typeof s === "string" && s.trim()).slice(0, 4) : []), [x.coupons]);

  const steps = useMemo<Step[]>(() => {
    const s: Step[] = ["arrival", "ritual", "jar", "mwah", "letter", "cam"];
    if (coupons.length) s.push("coupons");
    s.push("blow", "ending");
    return s;
  }, [coupons.length]);

  const [i, setI] = useState(0);
  const [shade, setShade] = useState<ShadeId>(senderShade);
  const [jar, setJar] = useState(0);
  const [marks, setMarks] = useState<Record<number, PhotoKiss[]>>({});
  const [run, setRun] = useState(0);
  const step = steps[Math.min(i, steps.length - 1)];
  const music = useSynthMusic({ melody: day.melody, enabled: mode === "live" && data.music });
  const bottomPad = mode === "preview" ? 120 : 40;

  const next = useCallback(() => {
    haptic(8);
    setI((v) => Math.min(steps.length - 1, v + 1));
  }, [steps.length]);

  useEffect(() => {
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "auto" });
  }, [i]);

  useEffect(() => {
    if (step === "ending") react("completed", { count: jar });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const slot = (id: string) => day.gifSlots.find((g) => g.id === id)!;
  const sticker = (id: string, size: number) => <Sticker slug={day.slug} slot={slot(id)} value={data.gifs?.[id]} size={size} alt="" eager />;

  const onFull = useCallback(
    (n: number) => {
      setJar(n);
      next();
    },
    [next],
  );

  const replay = () => {
    setI(0);
    setJar(0);
    setMarks({});
    setShade(senderShade);
    setRun((r) => r + 1);
  };

  let body: React.ReactNode = null;
  switch (step) {
    case "arrival":
      body = (
        <Arrival
          recipientName={data.recipientName}
          petName={data.petName}
          senderName={data.senderName}
          openingLine={x.openingLine || "You have 1 unread kiss… open it 🙈"}
          kind={kind}
          shade={shade}
          sticker={sticker("k1-shy", 86)}
          bottomPad={bottomPad}
          onOpen={next}
        />
      );
      break;
    case "ritual":
      body =
        kind === "lipstick" ? (
          <LipstickPicker
            initial={senderShade}
            senderName={data.senderName}
            bottomPad={bottomPad}
            onPick={(s) => {
              setShade(s);
              next();
            }}
          />
        ) : (
          <FirstKiss shade={shade} bottomPad={bottomPad} onDone={next} />
        );
      break;
    case "jar":
      body = <KissJarGame kind={kind} shade={shade} target={target} notes={notes} sticker={sticker("k2-cheer", 64)} bottomPad={bottomPad} onFull={onFull} />;
      break;
    case "mwah":
      body = <Mwah kind={kind} shade={shade} senderName={data.senderName} count={jar || target} sticker={sticker("k3-mwah", 92)} bottomPad={bottomPad} onNext={next} />;
      break;
    case "letter":
      body = <KissLetter letter={data.letter} recipientName={data.recipientName} senderName={data.senderName} kind={kind} shade={shade} sticker={null} bottomPad={bottomPad} onNext={next} />;
      break;
    case "cam":
      body = (
        <KissCam
          photos={data.photos ?? []}
          kind={kind}
          shade={shade}
          marks={marks}
          onMark={(idx, m) => setMarks((all) => ({ ...all, [idx]: [...(all[idx] ?? []), m] }))}
          sticker={sticker("k4-cheek", 78)}
          bottomPad={bottomPad}
          onNext={next}
        />
      );
      break;
    case "coupons":
      body = <Coupons coupons={coupons} kind={kind} shade={shade} senderName={data.senderName} bottomPad={bottomPad} onNext={next} />;
      break;
    case "blow":
      body = <BlowBack kind={kind} shade={shade} senderName={data.senderName} sticker={sticker("k5-blow", 74)} bottomPad={bottomPad} onSent={next} />;
      break;
    case "ending":
      body = <KissEnding day={day} data={data} mode={mode} kind={kind} shade={shade} marks={marks} jar={jar || target} bottomPad={bottomPad} onReplay={replay} />;
      break;
  }

  return (
    <DayRoot day={day}>
      {/* soft bokeh + drifting kisses */}
      <div aria-hidden style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
        <span style={{ position: "absolute", left: "-20%", top: "8%", width: "70%", aspectRatio: "1", borderRadius: "50%", background: "radial-gradient(circle, rgba(255,122,162,.22), transparent 70%)" }} />
        <span style={{ position: "absolute", right: "-25%", top: "45%", width: "80%", aspectRatio: "1", borderRadius: "50%", background: "radial-gradient(circle, rgba(232,176,75,.14), transparent 70%)" }} />
        <span style={{ position: "absolute", left: "10%", bottom: "-10%", width: "60%", aspectRatio: "1", borderRadius: "50%", background: "radial-gradient(circle, rgba(224,36,94,.10), transparent 70%)" }} />
      </div>
      <FloatingParticles emojis={kind === "lipstick" ? ["💋", "💗", "✨"] : ["💗", "😚", "✨"]} count={12} opacity={0.35} />
      {mode === "live" && <MusicToggle music={music} />}

      <div aria-hidden style={{ position: "fixed", top: 22, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 5, padding: "6px 10px", borderRadius: 99, background: "rgba(255,250,246,.74)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", zIndex: 20 }}>
        {steps.map((s, k) => (
          <span key={s} style={{ width: k === i ? 18 : 6, height: 6, borderRadius: 9, background: k <= i ? VW.accent : VW.edge, opacity: k <= i ? 1 : 0.7, transition: "width .3s" }} />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.section
          key={`${run}-${step}`}
          initial={reduced ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduced ? undefined : { opacity: 0, y: -12, transition: { duration: 0.25 } }}
          transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
          style={{ position: "relative", zIndex: 1 }}
        >
          {body}
        </motion.section>
      </AnimatePresence>
    </DayRoot>
  );
}
