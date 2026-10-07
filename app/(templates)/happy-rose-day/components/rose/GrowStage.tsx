"use client";

// Sections 1–3: the empty pot → press-and-hold to grow & bloom → the colour
// meaning card flips in. One hold value drives the stem, the leaves, every
// petal layer, the glow and the progress ring (useHoldProgress). Tapping 5×
// also grows it (the hook's tap fallback); Space/Enter held works too.

import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FONTS, VW } from "../../../_valentine/theme";
import { Sticker, haptic, useHoldProgress } from "../../../_valentine/kit";
import type { DayConfig, ValentineDayData } from "../../../_valentine/types";
import { ROSE_COLORS, ROSE_COUNTS, type RoseExtras } from "../../../_valentine/days/happy-rose-day";
import { Plant, shadesFor } from "./art";
import { EASE, kicker, petalShower, primaryBtn } from "./ui";

interface Props {
  day: DayConfig;
  data: ValentineDayData<RoseExtras>;
  reduced: boolean;
  onNext: () => void;
}

export default function GrowStage({ day, data, reduced, onNext }: Props) {
  const x = data.extras;
  const sh = shadesFor(x.roseColor);
  const id = useId().replace(/:/g, "");
  const stageRef = useRef<HTMLDivElement>(null);
  const [bloomed, setBloomed] = useState(false);
  const [letGo, setLetGo] = useState(false);
  const [dew, setDew] = useState([true, true, true]);
  const hold = useHoldProgress({
    duration: 2600,
    onComplete: () => {
      const r = stageRef.current?.getBoundingClientRect();
      petalShower(sh, r ? { x: (r.left + r.width / 2) / window.innerWidth, y: (r.top + r.height * 0.3) / window.innerHeight } : undefined, 44);
      window.setTimeout(() => setBloomed(true), reduced ? 0 : 650);
    },
  });

  // "aww, keep holding…" after an early let-go.
  const wasHolding = useRef(false);
  useEffect(() => {
    const released = wasHolding.current && !hold.holding && !hold.done;
    wasHolding.current = hold.holding;
    if (!released) return;
    const on = window.setTimeout(() => setLetGo(true), 0);
    const off = window.setTimeout(() => setLetGo(false), 1800);
    return () => {
      window.clearTimeout(on);
      window.clearTimeout(off);
    };
  }, [hold.holding, hold.done]);

  const color = ROSE_COLORS.find((c) => c.value === x.roseColor) ?? ROSE_COLORS[0];
  const count = ROSE_COUNTS.find((c) => c.value === x.roseCount) ?? ROSE_COUNTS[0];
  const name = data.recipientName || "you";
  const p = hold.progress;
  const hint = hold.done
    ? "It bloomed 🌹"
    : hold.holding
      ? p < 0.45
        ? "Keep holding… it's growing 🌱"
        : "Almost… don't let go 🥺"
      : letGo
        ? "aww, keep holding…"
        : p > 0.04
          ? "Hold again — it remembers"
          : "Press & hold to make it bloom";
  const R = 40;
  const C = 2 * Math.PI * R;

  return (
    <>
      <AnimatePresence initial={false}>
        {!bloomed && (
          <motion.header
            key="hdr"
            exit={reduced ? undefined : { opacity: 0, height: 0, marginBottom: -14 }}
            transition={{ duration: 0.5, ease: EASE }}
            style={{ display: "grid", gap: 6, justifyItems: "center", overflow: "hidden" }}
          >
            <p style={kicker}>A rose is waiting for you</p>
            <h1
              style={{
                margin: 0,
                font: `700 ${name.length > 14 ? 38 : 54}px/1.05 ${FONTS.script}`,
                color: VW.ink,
                overflowWrap: "anywhere",
                maxWidth: "100%",
              }}
            >
              {name}
            </h1>
            {data.petName && <p style={{ margin: 0, font: `italic 400 17px ${FONTS.serif}`, color: VW.inkSoft }}>“{data.petName}”</p>}
            <p style={{ margin: "4px 0 0", maxWidth: 330, font: `400 15.5px/1.5 ${FONTS.ui}`, color: VW.inkSoft }}>
              {x.openingLine || "Someone planted this just for you 🌱"}
            </p>
          </motion.header>
        )}
      </AnimatePresence>

      {/* the plant */}
      <div ref={stageRef} style={{ position: "relative", width: "100%", maxWidth: 340, display: "grid", justifyItems: "center" }}>
        <div
          className={hold.holding ? "" : "rd-sway"}
          style={{
            height: bloomed ? "min(36dvh, 300px)" : "min(46dvh, 380px)",
            aspectRatio: "240 / 360",
            transition: reduced ? undefined : "height .7s cubic-bezier(.2,.8,.2,1)",
            transform: hold.holding ? `scale(${1 - 0.02 * Math.sin(p * 40)})` : undefined,
          }}
        >
          <Plant
            progress={p}
            id={id}
            sh={sh}
            dew={hold.done ? dew : undefined}
            onDew={(i) => {
              haptic(6);
              setDew((d) => d.map((v, k) => (k === i ? false : v)));
            }}
          />
        </div>
        {!bloomed && day.gifSlots[0] && (
          <div style={{ position: "absolute", left: 0, bottom: 4 }}>
            <Sticker slug={day.slug} slot={day.gifSlots[0]} value={data.gifs[day.gifSlots[0].id]} size={88} eager />
          </div>
        )}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {!bloomed ? (
          <motion.div key="hold" exit={reduced ? undefined : { opacity: 0, scale: 0.9 }} style={{ display: "grid", justifyItems: "center", gap: 10 }}>
            <button
              type="button"
              {...hold.bind}
              aria-label={`Press and hold to grow ${name}'s rose (or tap it 5 times)`}
              style={{
                ...hold.bind.style,
                position: "relative",
                width: 96,
                height: 96,
                borderRadius: "50%",
                border: 0,
                padding: 0,
                cursor: "pointer",
                background: "transparent",
                display: "grid",
                placeItems: "center",
                transform: `scale(${hold.holding ? 0.94 : 1})`,
                transition: "transform .18s cubic-bezier(.34,1.56,.64,1)",
              }}
            >
              {!hold.holding && p < 0.04 && <span className="rd-ping" style={{ position: "absolute", inset: 8, borderRadius: "50%", border: `2px solid ${sh.petal}` }} />}
              <svg viewBox="0 0 96 96" width={96} height={96} style={{ position: "absolute", inset: 0, transform: "rotate(-90deg)" }} aria-hidden>
                <circle cx={48} cy={48} r={R} fill="rgba(255,255,255,.75)" stroke={VW.edge} strokeWidth={5} />
                <circle cx={48} cy={48} r={R} fill="none" stroke={sh.petal === "#FFF6EE" ? "#E8C07D" : sh.petal} strokeWidth={6} strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - p)} />
              </svg>
              <span
                aria-hidden
                style={{
                  position: "relative",
                  width: 66,
                  height: 66,
                  borderRadius: "50%",
                  display: "grid",
                  placeItems: "center",
                  background: `radial-gradient(circle at 35% 30%, ${sh.light}, ${sh.petal} 60%, ${sh.dark})`,
                  boxShadow: `0 6px 0 ${sh.deep}, 0 14px 24px -10px ${sh.dark}`,
                  font: `600 12px/1.1 ${FONTS.ui}`,
                  color: x.roseColor === "white" || x.roseColor === "yellow" ? "#5A1A2B" : "#fff",
                }}
              >
                {hold.holding ? `${Math.round(p * 100)}%` : "HOLD"}
              </span>
            </button>
            <p aria-live="polite" style={{ margin: 0, minHeight: 22, font: `500 15px ${FONTS.ui}`, color: letGo ? VW.accent : VW.inkSoft }}>
              {hint}
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="meaning"
            initial={reduced ? false : { opacity: 0, rotateY: 80, y: 10 }}
            animate={{ opacity: 1, rotateY: 0, y: 0 }}
            transition={{ type: "spring", stiffness: 140, damping: 16 }}
            style={{ width: "100%", maxWidth: 380, display: "grid", gap: 14, justifyItems: "center", perspective: 800 }}
          >
            <div
              style={{
                width: "100%",
                padding: "20px 20px 18px",
                borderRadius: 22,
                background: VW.paper,
                border: `1px solid ${VW.edge}`,
                boxShadow: "0 22px 44px -26px rgba(90,26,43,.55)",
                display: "grid",
                gap: 8,
                position: "relative",
              }}
            >
              <span style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", padding: "4px 12px", borderRadius: 99, background: sh.petal, color: x.roseColor === "white" || x.roseColor === "yellow" ? "#5A1A2B" : "#fff", font: `600 11.5px ${FONTS.ui}`, letterSpacing: ".14em", textTransform: "uppercase", boxShadow: x.roseColor === "white" ? `inset 0 0 0 1px ${sh.dark}` : undefined, whiteSpace: "nowrap" }}>
                The language of roses
              </span>
              <p style={{ margin: "6px 0 0", font: `500 15px ${FONTS.ui}`, color: VW.inkSoft }}>
                A <b style={{ color: sh.dark === "#EBD9D0" ? VW.ink : sh.dark }}>{color.label.toLowerCase()}</b> rose means
              </p>
              <p style={{ margin: 0, font: `italic 600 22px/1.3 ${FONTS.serif}`, color: VW.paperInk }}>“{color.hint}”</p>
              {x.colorReason && <p style={{ margin: "2px 0 0", font: `400 20px/1.35 ${FONTS.script}`, color: VW.inkSoft, overflowWrap: "anywhere" }}>{x.colorReason}</p>}
              <p style={{ margin: "6px auto 0", padding: "6px 14px", borderRadius: 99, background: VW.soft, font: `600 13.5px ${FONTS.ui}`, color: VW.ink, width: "fit-content", maxWidth: "100%" }}>
                {count.value === "1" ? "1 rose" : `${count.value} roses`} · {count.hint}
              </p>
            </div>
            <button type="button" onClick={onNext} style={primaryBtn}>
              Now, the real test… 🌼
            </button>
            {hold.done && dew.some(Boolean) && <p style={{ margin: 0, font: `400 12.5px ${FONTS.ui}`, color: VW.inkSoft, opacity: 0.8 }}>psst — tap the dew drops on the leaves 💧</p>}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
