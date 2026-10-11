"use client";

// The promise jar. A glass jar of folded paper stars under a gingham lid. She taps the jar (or turns on shake mode
// and shakes her phone): the jar rattles, one star flies out and unfolds into his promise. Silly first, deep last:
// the final star is golden, the big promise. The bears (slot pk-jar) watch; a blushing bear takes over at the end.

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { burst, haptic } from "../../../_valentine/kit";
import { usePremium } from "../../../_valentine/kit/premium";
import type { DayConfig, ValentineDayData } from "../../../_valentine/types";
import { Btn, DECOR, Gif, Head, LinkBtn, PaperStar, SlotGif } from "./parts";
import { originOf, type Club } from "./util";

export const STAR_COLORS: [string, string][] = [
  ["#FFB59E", "#E0603F"],
  ["#C9B6FF", "#7A52E0"],
  ["#9FE5C8", "#3FA57F"],
  ["#FFB3D6", "#D63F72"],
  ["#FFD27A", "#D9932B"],
];
const GOLD: [string, string] = ["#FFE27A", "#E0A21F"];

/** Where the stars sit inside the jar (% of the jar box). */
const SPOTS = [
  { x: 26, y: 70, r: -12 },
  { x: 52, y: 74, r: 8 },
  { x: 74, y: 68, r: 20 },
  { x: 38, y: 55, r: 14 },
  { x: 63, y: 52, r: -18 },
  { x: 48, y: 38, r: 4 },
  { x: 30, y: 40, r: -6 },
  { x: 70, y: 36, r: 12 },
];

type MotionPermission = { requestPermission?: () => Promise<"granted" | "denied"> };

export function Jar({ club, day, data, onNext }: { club: Club; day: DayConfig; data: ValentineDayData; onNext: () => void }) {
  const { sfx } = usePremium();
  const total = club.stars.length;
  const [out, setOut] = useState(0);
  const [view, setView] = useState(-1);
  const [wobble, setWobble] = useState(0);
  const [shake, setShake] = useState<"off" | "on" | "na">("off");
  const busy = useRef(false);
  const jar = useRef<HTMLButtonElement | null>(null);
  const note = useRef<HTMLDivElement | null>(null);
  const outRef = useRef(0);
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const done = out >= total;

  const pull = () => {
    if (busy.current || outRef.current >= total) return;
    busy.current = true;
    setWobble((w) => w + 1);
    sfx("pk-rattle");
    haptic(12);
    timers.current.push(
      window.setTimeout(() => {
        const k = outRef.current;
        outRef.current = k + 1;
        setOut(k + 1);
        setView(k);
        const big = k === club.bigIndex;
        sfx("pk-star", { detune: k * 60 });
        sfx("paper-rustle", { at: 0.25, gain: 0.5 });
        if (big) {
          sfx("chime-cascade", { at: 0.35 });
          sfx("sparkle", { at: 0.5 });
        }
        haptic(big ? [20, 30, 20, 30, 40] : 10);
        timers.current.push(
          window.setTimeout(() => {
            burst({ kind: big ? "hearts" : "sparkles", origin: originOf(note.current, 0.4), count: big ? 24 : 10 });
            if (k + 1 >= total) sfx("pk-tada", { at: 0.2 });
            busy.current = false;
          }, 420),
        );
      }, 330),
    );
  };

  // shake mode: opt-in, asked only after a tap (iOS needs the permission prompt inside a gesture)
  const pullRef = useRef(pull);
  useEffect(() => {
    pullRef.current = pull;
  });
  useEffect(() => {
    if (shake !== "on") return;
    let last = 0;
    const on = (e: DeviceMotionEvent) => {
      const a = e.accelerationIncludingGravity ?? e.acceleration;
      if (!a) return;
      const m = Math.hypot(a.x ?? 0, a.y ?? 0, a.z ?? 0);
      const now = Date.now();
      if (m > 22 && now - last > 900) {
        last = now;
        pullRef.current();
      }
    };
    window.addEventListener("devicemotion", on);
    return () => window.removeEventListener("devicemotion", on);
  }, [shake]);
  const canShake = typeof window !== "undefined" && "DeviceMotionEvent" in window && (navigator.maxTouchPoints ?? 0) > 0;
  const askShake = async () => {
    const DM = (window as unknown as { DeviceMotionEvent?: MotionPermission }).DeviceMotionEvent;
    try {
      if (DM?.requestPermission) {
        const r = await DM.requestPermission();
        setShake(r === "granted" ? "on" : "na");
      } else setShake("on");
    } catch {
      setShake("na");
    }
    haptic(10);
  };

  const shown = view >= 0 ? club.stars[view] : "";
  const isBig = view === club.bigIndex;
  const [c, d] = isBig ? GOLD : STAR_COLORS[Math.max(0, view) % STAR_COLORS.length];

  return (
    <div className={`pk-scene pk-jarScene${done ? " is-done" : ""}`}>
      <Head kicker="The promise jar" title={done ? "All yours now 🫶" : "Pull out a promise"} sub={done ? undefined : `${total} paper stars inside. Silly first, deep last.`} />

      <div className="pk-noteZone" ref={note} aria-live="polite">
        <AnimatePresence mode="popLayout">
          {view >= 0 ? (
            <motion.div
              key={view}
              className={`pk-note${isBig ? " is-big" : ""}`}
              initial={{ y: 150, scale: 0.15, rotate: -200, opacity: 0 }}
              animate={{ y: 0, scale: 1, rotate: view % 2 ? 2 : -2, opacity: 1 }}
              exit={{ x: -60, opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
              transition={{ type: "spring", stiffness: 300, damping: 18 }}
            >
              <PaperStar color={c} deep={d} size={36} className="pk-noteStar" />
              <span className="pk-noteNo">{isBig ? "the big one ✨" : `promise ${view + 1} of ${total}`}</span>
              <p className="pk-noteText">{shown}</p>
            </motion.div>
          ) : (
            <motion.p key="empty" className="pk-noteEmpty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              tap the jar ↓
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <div className="pk-jarRow">
        <span className="pk-jarGif">{done ? <Gif src={DECOR.jarDone} size={92} className="pk-pop" eager /> : <SlotGif day={day} data={data} id="pk-jar" size={92} eager />}</span>
        <button ref={jar} type="button" className="pk-jar" onClick={pull} disabled={done} aria-label={done ? "The jar is empty" : "Tap the jar to pull out a promise"}>
          <span className="pk-jarWob" key={wobble}>
            <span className="pk-jarLid" aria-hidden />
            <span className="pk-jarBow" aria-hidden />
            <span className="pk-jarGlass" aria-hidden>
              {club.stars.map((_, k) => {
                if (k < out) return null;
                const s = SPOTS[k % SPOTS.length];
                const [cc, dd] = k === club.bigIndex ? GOLD : STAR_COLORS[k % STAR_COLORS.length];
                return <PaperStar key={k} color={cc} deep={dd} size={k === club.bigIndex ? 34 : 28} className="pk-jarStar" style={{ left: `${s.x}%`, top: `${s.y}%`, transform: `translate(-50%,-50%) rotate(${s.r}deg)` }} />;
              })}
            </span>
            <span className="pk-jarTag" aria-hidden>
              promises
            </span>
          </span>
        </button>
      </div>

      <div className="pk-starRow" aria-label={`${out} of ${total} promises opened`}>
        {club.stars.map((_, k) => {
          const [cc, dd] = k === club.bigIndex ? GOLD : STAR_COLORS[k % STAR_COLORS.length];
          return (
            <button key={k} type="button" className={`pk-starChip${k < out ? " on" : ""}${k === view ? " cur" : ""}`} disabled={k >= out} onClick={() => setView(k)} aria-label={k < out ? `Read promise ${k + 1} again` : `Promise ${k + 1}, still in the jar`}>
              <PaperStar color={k < out ? cc : "#FFF1E6"} deep={k < out ? dd : "#FFD3B8"} size={24} />
            </button>
          );
        })}
      </div>

      <div className="pk-actions">
        {done ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
            <Btn onClick={onNext}>Sign the club rules ✍️</Btn>
          </motion.div>
        ) : (
          <>
            <Btn onClick={pull}>{out ? "Another one ⭐" : "Pull a star ⭐"}</Btn>
            {canShake && shake === "off" && <LinkBtn onClick={() => void askShake()}>📳 or shake your phone</LinkBtn>}
            {shake === "on" && <span className="pk-hint">shake away 📳</span>}
          </>
        )}
      </div>
    </div>
  );
}
