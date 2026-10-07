"use client";

// Sections 1–3 of Propose Day:
//   Curtain  — dark velvet stage, one spotlight; "{Name}, I have something to ask you…"
//   Reasons  — three playing-card reasons flip in, a heartbeat that quickens (60 → 90 → 120 bpm)
//   Timeline — "how we got here": a gold dotted line whose nodes light up as they scroll in,
//              each with a photo that turns from black-and-white to colour when lit

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FONTS } from "../../../_valentine/theme";
import { CroppedPhoto, PhotoLightbox, Sticker, haptic } from "../../../_valentine/kit";
import type { DayConfig, LovePhoto, ValentineDayData } from "../../../_valentine/types";
import type { ProposeExtras } from "../../../_valentine/days/happy-propose-day";
import { GOLD, GOLD_SOFT, PEARL, PLUM, WINE, ghostBtn, goldBtn, kicker } from "./ui";

interface Props {
  day: DayConfig;
  data: ValentineDayData<ProposeExtras>;
  reduced: boolean;
  onNext: () => void;
}

// ─── Curtain ─────────────────────────────────────────────────────────────────

export function Curtain({ day, data, onNext }: Props) {
  const x = data.extras;
  const name = data.recipientName || "You";
  const slot = day.gifSlots[0];
  return (
    <>
      {slot && <Sticker slug={day.slug} slot={slot} value={data.gifs[slot.id]} size={104} eager />}
      <p style={kicker}>Propose Day · a little show</p>
      <h1 style={{ margin: 0, font: `700 ${name.length > 14 ? 40 : 56}px/1.05 ${FONTS.script}`, color: PEARL, overflowWrap: "anywhere", maxWidth: "100%", textShadow: "0 2px 18px rgba(0,0,0,.5)" }}>{name},</h1>
      <p style={{ margin: 0, font: `italic 500 22px/1.35 ${FONTS.serif}`, color: GOLD_SOFT }}>I have something to ask you…</p>
      {x.teaser && <p style={{ margin: 0, maxWidth: 320, font: `400 15.5px/1.5 ${FONTS.ui}`, color: "#E8CFC9", overflowWrap: "anywhere" }}>{x.teaser}</p>}
      <button type="button" onClick={onNext} style={{ ...goldBtn, marginTop: 10 }}>
        Raise the curtain 🎭
      </button>
      <p style={{ margin: 0, font: `400 13px ${FONTS.ui}`, color: "#E8CFC9", opacity: 0.8 }}>from {data.senderName || "someone nervous"}</p>
    </>
  );
}

// ─── Reasons ─────────────────────────────────────────────────────────────────

const DEFAULT_REASONS = ["You laugh at my worst jokes. Every single one.", "You remember the little things — all of them.", "Every version of my future has you in it."];
const BPM = [60, 90, 120];

function Heart({ bpm, reduced }: { bpm: number; reduced: boolean }) {
  // Haptic on each beat (Android only; a bonus).
  useEffect(() => {
    if (reduced) return;
    const t = window.setInterval(() => haptic([16, 90, 12]), (60 / bpm) * 1000);
    return () => window.clearInterval(t);
  }, [bpm, reduced]);
  return (
    <div style={{ display: "grid", justifyItems: "center", gap: 4 }}>
      <svg viewBox="0 0 64 58" width={58} height={52} className="pd-beat" style={{ animationDuration: `${60 / bpm}s`, filter: "drop-shadow(0 0 14px rgba(215,38,61,.7))" }} aria-hidden>
        <defs>
          <radialGradient id="pd-heart" cx="35%" cy="30%" r="75%">
            <stop offset="0" stopColor="#FF8A9B" />
            <stop offset=".6" stopColor="#D7263D" />
            <stop offset="1" stopColor="#7A0A1E" />
          </radialGradient>
        </defs>
        <path d="M32 56 C 6 38 0 24 4 14 C 8 3 24 0 32 12 C 40 0 56 3 60 14 C 64 24 58 38 32 56 Z" fill="url(#pd-heart)" />
        <path d="M14 12 C 18 8 24 9 26 13" stroke="#fff" strokeOpacity=".6" strokeWidth={2.4} fill="none" strokeLinecap="round" />
      </svg>
      <span style={{ font: `600 11px ${FONTS.ui}`, letterSpacing: ".18em", color: "#E8CFC9", opacity: 0.85 }}>{bpm} BPM</span>
    </div>
  );
}

export function Reasons({ data, reduced, onNext }: Props) {
  const reasons = useMemo(() => {
    const r = (data.extras.reasons ?? []).map((s) => s.trim()).filter(Boolean).slice(0, 3);
    return r.length ? r : DEFAULT_REASONS;
  }, [data.extras.reasons]);
  const [k, setK] = useState(0);
  const last = k >= reasons.length - 1;
  const advance = () => {
    haptic(10);
    if (last) onNext();
    else setK((v) => v + 1);
  };
  return (
    <>
      <header style={{ display: "grid", gap: 6, justifyItems: "center" }}>
        <p style={kicker}>Before I ask…</p>
        <h2 style={{ margin: 0, font: `italic 700 28px/1.2 ${FONTS.serif}`, color: PEARL }}>{reasons.length === 1 ? "One reason" : `${reasons.length} reasons`} I&apos;m asking</h2>
      </header>
      <Heart bpm={BPM[Math.min(k, BPM.length - 1)]} reduced={reduced} />
      <div style={{ position: "relative", width: "min(80vw, calc(300px * var(--vw-s, 1)))", height: "calc(250px * var(--vw-s, 1))", perspective: 1000 }}>
        {/* the deck behind */}
        {reasons.slice(k + 1).map((_, j) => (
          <div key={`d${j}`} aria-hidden style={{ position: "absolute", inset: 0, borderRadius: 18, background: `linear-gradient(160deg, ${WINE}, #3E0818)`, border: `1.5px solid ${GOLD}66`, transform: `translate(${(j + 1) * 6}px, ${(j + 1) * 6}px) rotate(${(j + 1) * 3}deg)`, boxShadow: "0 18px 30px -18px rgba(0,0,0,.8)" }}>
            <div style={{ position: "absolute", inset: 10, borderRadius: 12, border: `1px solid ${GOLD}55`, background: `repeating-linear-gradient(45deg, transparent 0 8px, rgba(230,194,122,.08) 8px 9px)` }} />
          </div>
        ))}
        <AnimatePresence mode="popLayout">
          <motion.button
            key={k}
            type="button"
            onClick={advance}
            drag={reduced ? false : "x"}
            dragSnapToOrigin
            onDragEnd={(_, info) => {
              if (Math.abs(info.offset.x) > 70) advance();
            }}
            initial={reduced ? false : { rotateY: -90, opacity: 0, y: 10 }}
            animate={{ rotateY: 0, opacity: 1, y: 0, rotate: k % 2 ? 1.5 : -1.5 }}
            exit={reduced ? { opacity: 0 } : { x: 260, rotate: 22, opacity: 0, transition: { duration: 0.45 } }}
            transition={{ type: "spring", stiffness: 160, damping: 18 }}
            aria-label={`Reason ${k + 1}: ${reasons[k]}. Tap for the next.`}
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 18,
              border: `1.5px solid ${GOLD}`,
              background: `linear-gradient(170deg, ${PEARL}, #F8E9D6)`,
              boxShadow: "0 26px 44px -20px rgba(0,0,0,.85), inset 0 0 0 6px #FFF6EC, inset 0 0 0 7px rgba(168,130,58,.4)",
              color: PLUM,
              padding: "26px 26px",
              display: "grid",
              alignContent: "center",
              gap: 12,
              cursor: "grab",
              touchAction: "pan-y",
            }}
          >
            <span aria-hidden style={{ position: "absolute", left: 14, top: 10, font: `700 16px/1 ${FONTS.serif}`, color: "#D7263D", textAlign: "center" }}>
              {k + 1}
              <br />♥
            </span>
            <span aria-hidden style={{ position: "absolute", right: 14, bottom: 10, font: `700 16px/1 ${FONTS.serif}`, color: "#D7263D", transform: "rotate(180deg)", textAlign: "center" }}>
              {k + 1}
              <br />♥
            </span>
            <span style={{ font: `600 11.5px ${FONTS.ui}`, letterSpacing: ".2em", textTransform: "uppercase", color: "#A8823A" }}>Reason #{k + 1}</span>
            <span style={{ font: `italic 600 22px/1.35 ${FONTS.serif}`, overflowWrap: "anywhere" }}>{reasons[k]}</span>
          </motion.button>
        </AnimatePresence>
      </div>
      <p style={{ margin: 0, font: `400 13.5px ${FONTS.ui}`, color: "#E8CFC9" }}>{last ? "…and my heart is racing." : "Tap or swipe the card"}</p>
      <button type="button" onClick={advance} style={last ? goldBtn : ghostBtn}>
        {last ? "Okay. Breathe. 🫶" : "Next reason →"}
      </button>
    </>
  );
}

// ─── Timeline ────────────────────────────────────────────────────────────────

const ICONS = ["✨", "☕", "🎬", "🌧️", "🪔", "💍"];

export interface Moment {
  when: string;
  what: string;
  photo: LovePhoto | null;
}

export function moments(data: ValentineDayData<ProposeExtras>): Moment[] {
  const ms = (data.extras.moments ?? []).filter((m) => m && (m.when?.trim() || m.what?.trim()));
  const n = Math.min(6, Math.max(ms.length, data.photos.length));
  return Array.from({ length: n }, (_, i) => ({
    when: ms[i]?.when?.trim() ?? "",
    what: ms[i]?.what?.trim() || data.photos[i]?.caption?.trim() || "",
    photo: data.photos[i] ?? null,
  }));
}

function Node({ m, i, reduced, onPhoto }: { m: Moment; i: number; reduced: boolean; onPhoto: () => void }) {
  const [lit, setLit] = useState(reduced);
  const left = i % 2 === 0;
  return (
    <motion.li
      onViewportEnter={() => {
        if (!lit) {
          setLit(true);
          haptic(6);
        }
      }}
      viewport={{ amount: 0.55, once: true }}
      style={{ listStyle: "none", position: "relative", display: "grid", gridTemplateColumns: "1fr 34px 1fr", alignItems: "center", minHeight: m.photo ? 190 : 96 }}
    >
      {/* node */}
      <span
        aria-hidden
        style={{
          gridColumn: 2,
          justifySelf: "center",
          width: 30,
          height: 30,
          borderRadius: "50%",
          display: "grid",
          placeItems: "center",
          fontSize: 14,
          background: lit ? `radial-gradient(circle at 35% 30%, ${GOLD_SOFT}, ${GOLD})` : "#2A1530",
          border: `2px solid ${lit ? GOLD_SOFT : "rgba(230,194,122,.35)"}`,
          boxShadow: lit ? `0 0 0 6px rgba(230,194,122,.15), 0 0 24px ${GOLD}` : "none",
          transition: "all .6s cubic-bezier(.2,.8,.2,1)",
          zIndex: 1,
        }}
      >
        {lit ? (m.photo ? "♥" : ICONS[i % ICONS.length]) : ""}
      </span>
      <motion.div
        initial={false}
        animate={{ opacity: lit ? 1 : 0.25, x: lit ? 0 : left ? -14 : 14 }}
        transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
        style={{ gridColumn: left ? 1 : 3, gridRow: 1, textAlign: left ? "right" : "left", display: "grid", gap: 6, justifyItems: left ? "end" : "start", padding: left ? "0 8px 0 0" : "0 0 0 8px", minWidth: 0 }}
      >
        {m.photo && (
          <button
            type="button"
            onClick={onPhoto}
            aria-label={`Open photo${m.what ? `: ${m.what}` : ""}`}
            style={{ width: "min(36vw, calc(138px * var(--vw-s, 1)))", padding: "6px 6px 8px", border: 0, borderRadius: 4, background: PEARL, boxShadow: "0 16px 26px -14px rgba(0,0,0,.8)", transform: `rotate(${left ? -3 : 3}deg)`, cursor: "zoom-in" }}
          >
            <span style={{ display: "block", aspectRatio: "4 / 5", overflow: "hidden", borderRadius: 2, filter: lit ? "none" : "grayscale(1) brightness(.7)", transition: "filter 1s ease" }}>
              <CroppedPhoto photo={m.photo} />
            </span>
          </button>
        )}
        {m.when && <span style={{ font: `600 11.5px ${FONTS.ui}`, letterSpacing: ".14em", textTransform: "uppercase", color: GOLD, overflowWrap: "anywhere" }}>{m.when}</span>}
        {m.what && <span style={{ font: `italic 500 15.5px/1.35 ${FONTS.serif}`, color: PEARL, overflowWrap: "anywhere" }}>{m.what}</span>}
      </motion.div>
    </motion.li>
  );
}

export function Timeline({ data, reduced, onNext }: Props) {
  const ms = useMemo(() => moments(data), [data]);
  const [lightbox, setLightbox] = useState<number | null>(null);
  return (
    <>
      <header style={{ display: "grid", gap: 6, justifyItems: "center" }}>
        <p style={kicker}>How we got here</p>
        <h2 style={{ margin: 0, font: `italic 700 28px/1.2 ${FONTS.serif}`, color: PEARL }}>Every little step, to this one</h2>
        <p style={{ margin: 0, font: `400 13.5px ${FONTS.ui}`, color: "#E8CFC9" }}>Scroll — each moment lights up</p>
      </header>
      <ol style={{ position: "relative", margin: "8px 0 0", padding: 0, width: "100%", maxWidth: "calc(400px * var(--vw-s, 1))", display: "grid", gap: 18 }}>
        <span aria-hidden style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 0, borderLeft: `2px dotted ${GOLD}`, opacity: 0.55, transform: "translateX(-1px)" }} />
        {ms.map((m, i) => (
          <Node key={i} m={m} i={i} reduced={reduced} onPhoto={() => m.photo && setLightbox(data.photos.indexOf(m.photo))} />
        ))}
        <li style={{ listStyle: "none", display: "grid", justifyItems: "center", gap: 10, paddingTop: 6, position: "relative" }}>
          <span aria-hidden style={{ width: 46, height: 46, borderRadius: "50%", display: "grid", placeItems: "center", fontSize: 22, background: `radial-gradient(circle at 35% 30%, ${GOLD_SOFT}, ${GOLD})`, boxShadow: `0 0 30px ${GOLD}` }}>
            💍
          </span>
          <span style={{ font: `600 12px ${FONTS.ui}`, letterSpacing: ".16em", textTransform: "uppercase", color: GOLD }}>and now</span>
        </li>
      </ol>
      <button type="button" onClick={onNext} style={{ ...goldBtn, marginTop: 6 }}>
        And now… 💍
      </button>
      <PhotoLightbox photos={data.photos} index={lightbox} onIndex={setLightbox} onClose={() => setLightbox(null)} />
    </>
  );
}
