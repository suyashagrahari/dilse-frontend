"use client";

// Section 4: loves me… loves me not. The bloomed rose seen from above, with
// N pluckable outer petals. The label depends only on HOW MANY have been
// plucked (never which one), and N is picked so the last petal always lands
// on the top label — the game is rigged, and that's the joke and the love note.
//   classic: loves me / loves me not        N = 9  → ends "loves me"
//   desi:    thoda sa / bahut / dil se / pagalpan tak   N = 8 → "pagalpan tak"
//   french:  un peu / beaucoup / passionnément / à la folie  N = 8 → "à la folie"
// Every petal is a focusable button; "Pluck one for me" is the no-aim fallback.

import { useId, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FONTS, VW } from "../../../_valentine/theme";
import { Sticker, burst, haptic } from "../../../_valentine/kit";
import type { DayConfig, ValentineDayData } from "../../../_valentine/types";
import type { RoseExtras } from "../../../_valentine/days/happy-rose-day";
import { CENTER_SPIRAL, GradDefs, LEAF, PLUCK_PETAL, PLUCK_VEIN, roseGrads, shadesFor } from "./art";
import { ghostBtn, kicker, primaryBtn } from "./ui";

const STYLES = {
  classic: { labels: ["loves me", "loves me not"], n: 9, final: "LOVES ME", sub: "obviously." },
  desi: { labels: ["thoda sa", "bahut", "dil se", "pagalpan tak"], n: 8, final: "PAGALPAN TAK", sub: "(to the point of madness)" },
  french: { labels: ["un peu", "beaucoup", "passionnément", "à la folie"], n: 8, final: "À LA FOLIE", sub: "(madly. completely.)" },
} as const;

interface Props {
  day: DayConfig;
  data: ValentineDayData<RoseExtras>;
  reduced: boolean;
  onNext: () => void;
}

interface Flying {
  key: number;
  angle: number;
  dx: number;
  rot: number;
}

export default function PluckGame({ day, data, reduced, onNext }: Props) {
  const x = data.extras;
  const sh = shadesFor(x.roseColor);
  const id = useId().replace(/:/g, "");
  const st = STYLES[x.petalStyle] ?? STYLES.classic;
  const N = st.n;
  const angles = useMemo(() => Array.from({ length: N }, (_, i) => (360 / N) * i), [N]);
  const [gone, setGone] = useState<boolean[]>(() => Array(N).fill(false));
  const [flying, setFlying] = useState<Flying[]>([]);
  const [floats, setFloats] = useState<{ key: number; text: string; x: number; y: number }[]>([]);
  const [current, setCurrent] = useState<string | null>(null);
  const plucked = gone.filter(Boolean).length;
  const done = plucked >= N;
  const keyRef = useRef(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const L = st.labels.length;
  // Offset so that pluck #N lands on labels[L-1] … except classic, which ends on labels[0].
  const target = x.petalStyle === "desi" || x.petalStyle === "french" ? L - 1 : 0;
  const off = (((target - (N - 1)) % L) + L) % L;
  const labelFor = (k: number) => st.labels[(k + off) % L];

  const pluck = (i: number) => {
    if (gone[i] || done) return;
    const k = plucked; // this is pluck number k (0-based)
    const last = k === N - 1;
    haptic(last ? [20, 60, 30] : 8);
    setGone((g) => g.map((v, j) => (j === i ? true : v)));
    const key = ++keyRef.current;
    const a = angles[i];
    setFlying((f) => [...f.slice(-6), { key, angle: a, dx: (Math.random() - 0.5) * 140, rot: (Math.random() > 0.5 ? 1 : -1) * (180 + Math.random() * 260) }]);
    const rad = ((a - 90) * Math.PI) / 180;
    const text = last ? `${st.final} ❤️` : labelFor(k);
    setFloats((f) => [...f.slice(-3), { key, text, x: 50 + Math.cos(rad) * 30, y: 50 + Math.sin(rad) * 30 }]);
    setCurrent(text);
    if (last) {
      const r = wrapRef.current?.getBoundingClientRect();
      const origin = r ? { x: (r.left + r.width / 2) / window.innerWidth, y: (r.top + r.height / 2) / window.innerHeight } : undefined;
      window.setTimeout(() => {
        burst({ kind: "hearts", origin, count: 40 });
        burst({ kind: "confetti", origin, colors: [sh.petal, sh.light, "#E8C07D", "#F9D5DC", "#5E8C61"] });
      }, 250);
    }
  };

  const pluckAny = () => {
    const left = gone.map((g, i) => (g ? -1 : i)).filter((i) => i >= 0);
    if (left.length) pluck(left[(plucked * 5 + 3) % left.length]);
  };

  const slot = day.gifSlots[1];
  const nearEnd = plucked === N - 1;
  const almostLine = x.petalStyle === "classic" ? (labelFor(N - 2) === "loves me not" ? "uh-oh… one left 😳" : "one left…") : "the last one decides everything…";

  return (
    <>
      <header style={{ display: "grid", gap: 6, justifyItems: "center" }}>
        <p style={kicker}>The real test</p>
        <h2 style={{ margin: 0, font: `700 30px/1.15 ${FONTS.serif}`, color: VW.ink }}>
          {x.petalStyle === "french" ? (
            <>
              Il m&apos;aime… <i style={{ fontWeight: 500 }}>un peu, beaucoup?</i>
            </>
          ) : x.petalStyle === "desi" ? (
            <>
              Kitna pyaar? <i style={{ fontWeight: 500 }}>Petals batayenge.</i>
            </>
          ) : (
            <>
              Loves me… <i style={{ fontWeight: 500 }}>loves me not?</i>
            </>
          )}
        </h2>
        <p style={{ margin: 0, font: `400 15px ${FONTS.ui}`, color: VW.inkSoft }}>{done ? "The rose has spoken." : "Tap a petal to pluck it"}</p>
      </header>

      <div ref={wrapRef} style={{ position: "relative", width: "min(80vw, calc(320px * var(--vw-s, 1)))", aspectRatio: "1 / 1" }}>
        <svg viewBox="-130 -130 260 260" width="100%" height="100%" style={{ overflow: "visible", display: "block" }} role="group" aria-label={`A rose with ${N - plucked} petals left`}>
          <GradDefs grads={roseGrads(id, sh)} />
          <defs>
            <radialGradient id={`${id}-tp`} cx="50%" cy="100%" r="100%" fx="50%" fy="100%">
              <stop offset="0" stopColor={sh.deep} />
              <stop offset=".35" stopColor={sh.dark} />
              <stop offset=".8" stopColor={sh.petal} />
              <stop offset="1" stopColor={sh.light} />
            </radialGradient>
          </defs>
          {/* leaves behind */}
          {[20, 140, 260].map((a) => (
            <g key={a} transform={`rotate(${a})`}>
              <path d="M0 -40 C -26 -70 -22 -112 0 -124 C 22 -112 26 -70 0 -40 Z" fill={LEAF.mid} />
              <path d="M0 -46 L0 -118" stroke={LEAF.dark} strokeWidth={1.5} />
            </g>
          ))}
          {/* the pluckable petals */}
          {angles.map((a, i) =>
            gone[i] ? null : (
              <g
                key={i}
                transform={`rotate(${a})`}
                role="button"
                tabIndex={0}
                aria-label={`Pluck petal ${i + 1}`}
                onPointerDown={(e) => {
                  e.preventDefault();
                  pluck(i);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    pluck(i);
                  }
                }}
                style={{ cursor: "pointer", outline: "none", touchAction: "manipulation" }}
              >
                <g className={!reduced && plucked === 0 ? "rd-breathe" : undefined} style={{ transformOrigin: "0 0", animationDelay: `${i * 0.12}s` }}>
                  <path d={PLUCK_PETAL} fill={`url(#${id}-tp)`} stroke={sh.dark} strokeWidth={0.8} />
                  <path d={PLUCK_VEIN} stroke="rgba(255,255,255,.28)" strokeWidth={1.4} fill="none" />
                </g>
              </g>
            ),
          )}
          {/* inner bud ring — never plucked */}
          {Array.from({ length: 6 }, (_, i) => (
            <path key={i} d="M0 -6 C -16 -14 -20 -40 -8 -50 C -2 -54 2 -54 8 -50 C 20 -40 16 -14 0 -6 Z" transform={`rotate(${i * 60 + 30})`} fill={sh.dark} stroke={sh.deep} strokeWidth={0.8} />
          ))}
          <circle r={26} fill={`url(#${id}-pc)`} />
          <path d={CENTER_SPIRAL} fill="none" stroke={sh.deep} strokeWidth={2.4} strokeLinecap="round" />
          <path d={CENTER_SPIRAL} fill="none" stroke="rgba(255,255,255,.25)" strokeWidth={1} strokeLinecap="round" transform="translate(-1 -1)" />
          {done && (
            <motion.path
              d="M0 14 C -30 -6 -24 -30 -10 -30 C -4 -30 0 -24 0 -20 C 0 -24 4 -30 10 -30 C 24 -30 30 -6 0 14 Z"
              fill={sh.petal === "#FFF6EE" ? "#E8475F" : sh.light}
              stroke="#fff"
              strokeWidth={2}
              initial={reduced ? false : { scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.5, 1.15], opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.25 }}
              style={{ filter: "drop-shadow(0 4px 8px rgba(90,26,43,.4))" }}
            />
          )}
          {/* falling petals */}
          {flying.map((f) => (
            <g key={f.key} transform={`rotate(${f.angle})`}>
              <motion.g
                initial={{ x: 0, y: 0, rotate: 0, opacity: 1, scale: 1 }}
                animate={reduced ? { opacity: 0 } : { x: [0, f.dx * 0.4, f.dx], y: [0, -40, 30], rotate: [0, f.rot * 0.4, f.rot], opacity: [1, 1, 0], scale: [1, 1.08, 0.8] }}
                transition={{ duration: reduced ? 0.3 : 1.3, ease: "easeOut" }}
                style={{ pointerEvents: "none" }}
              >
                <path d={PLUCK_PETAL} fill={`url(#${id}-tp)`} />
              </motion.g>
            </g>
          ))}
        </svg>
        {/* floating labels */}
        <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          <AnimatePresence>
            {floats.map((f) => (
              <motion.span
                key={f.key}
                initial={{ opacity: 0, y: 0, scale: 0.7 }}
                animate={{ opacity: [0, 1, 1, 0], y: -60, scale: 1 }}
                transition={{ duration: 1.6, ease: "easeOut" }}
                onAnimationComplete={() => setFloats((all) => all.filter((z) => z.key !== f.key))}
                style={{
                  position: "absolute",
                  left: `${f.x}%`,
                  top: `${f.y}%`,
                  transform: "translate(-50%, -50%)",
                  whiteSpace: "nowrap",
                  padding: "4px 10px",
                  borderRadius: 99,
                  background: "rgba(255,255,255,.9)",
                  boxShadow: "0 6px 16px -8px rgba(90,26,43,.5)",
                  font: `600 15px ${FONTS.ui}`,
                  color: VW.ink,
                }}
              >
                {f.text}
              </motion.span>
            ))}
          </AnimatePresence>
        </div>
      </div>

      <div style={{ minHeight: 120, display: "grid", justifyItems: "center", alignContent: "start", gap: 8 }} aria-live="polite">
        {!done ? (
          <>
            <motion.p
              key={current ?? "none"}
              initial={reduced ? false : { scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              style={{ margin: 0, minHeight: 40, font: `700 32px/1.2 ${FONTS.script}`, color: current === "loves me not" ? VW.inkSoft : VW.accent }}
            >
              {current ?? "who knows… 🤭"}
            </motion.p>
            <p style={{ margin: 0, font: `500 14px ${FONTS.ui}`, color: VW.inkSoft }}>
              {nearEnd ? almostLine : `${N - plucked} ${N - plucked === 1 ? "petal" : "petals"} left`}
            </p>
            <button type="button" onClick={pluckAny} style={ghostBtn}>
              Pluck one for me 🌸
            </button>
          </>
        ) : (
          <motion.div
            initial={reduced ? false : { scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 220, damping: 12 }}
            style={{ display: "grid", justifyItems: "center", gap: 6 }}
          >
            {slot && <Sticker slug={day.slug} slot={slot} value={data.gifs[slot.id]} size={96} eager />}
            <p style={{ margin: 0, font: `700 38px/1 ${FONTS.serif}`, color: VW.accent, letterSpacing: ".02em" }}>{st.final} ❤️</p>
            <p style={{ margin: 0, font: `italic 400 16px ${FONTS.serif}`, color: VW.inkSoft }}>{st.sub}</p>
            <p style={{ margin: "4px 0 6px", font: `400 15px/1.45 ${FONTS.ui}`, color: VW.ink, maxWidth: 320 }}>
              The petals never lie, {data.recipientName || "you"}. {data.senderName ? `${data.senderName} checked twice.` : ""}
            </p>
            <button type="button" onClick={onNext} style={primaryBtn}>
              There&apos;s a letter too 💌
            </button>
          </motion.div>
        )}
      </div>
    </>
  );
}
