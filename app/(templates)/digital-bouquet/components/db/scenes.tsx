"use client";

// The first six scenes:
//   1 · Delivery — a parcel at their door with the courier's note: tap it, then
//       pull the ribbon; the lid flies off and the bouquet rises out.
//   2 · Bloom — it blooms stem by stem, back to front, exactly as arranged.
//   3 · Meanings — tap each flower: its name, what it means, and the sender's line.
//   4 · Water — tip the watering can over it (or hold the button) till it glows.
//   5 · Photos — polaroids tucked between the stems; pull each one out.
//   6 · The card — an envelope tucked into the wrap; it opens into the letter.

import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CroppedPhoto, burst, haptic, useReducedMotion } from "../../../_valentine/kit";
import { FLOWER_BY_ID, type DbHand, type DbPaletteDef, type FlowerId } from "../../../_valentine/days/digital-bouquet";
import type { LovePhoto } from "../../../_valentine/types";
import { Bouquet, FlowerFace, type BouquetLook } from "./Bouquet";
import { pctX, pctY } from "./assets";
import { DB_HAND, DB_SANS, DB_SCRIPT, DB_SERIF, handFace } from "./fonts";
import { kindsOf } from "./model";
import { useDb, useNext } from "./stage";
import { Head, Hint } from "./ui";

interface Common {
  look: BouquetLook;
  palette: DbPaletteDef;
}

// ─── 1 · Delivery ────────────────────────────────────────────────────────────

export function Delivery({ look, palette, recipient, sender, line, sticker, onNext }: Common & { recipient: string; sender: string; line: string; sticker: ReactNode; onNext: () => void }) {
  const { cue } = useDb();
  const reduced = useReducedMotion();
  const [phase, setPhase] = useState<"closed" | "knocked" | "open">("closed");
  const [pull, setPull] = useState(0);
  const drag = useRef<{ y: number; id: number } | null>(null);

  const knock = () => {
    if (phase !== "closed") return;
    cue("knock", { gain: 0.6 });
    haptic([14, 60, 14]);
    setPhase("knocked");
  };
  const open = useCallback(() => {
    setPhase((p) => {
      if (p === "open") return p;
      cue("ribbon", { gain: 0.55 });
      cue("chime-cascade", { gain: 0.35, at: 0.35 });
      haptic([10, 40, 20]);
      window.setTimeout(() => burst({ kind: "petals", emojis: ["🌸", "🌷", "✨", "💗"], origin: { x: 0.5, y: 0.45 }, count: 34 }), 380);
      return "open";
    });
  }, [cue]);

  const down = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (phase === "closed") setPhase("knocked");
    drag.current = { y: e.clientY, id: e.pointerId };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const move = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (!drag.current || drag.current.id !== e.pointerId) return;
    const d = Math.max(0, e.clientY - drag.current.y);
    setPull(Math.min(1, d / 80));
    if (d > 80) {
      drag.current = null;
      open();
    }
  };
  const up = () => {
    if (drag.current) {
      drag.current = null;
      // A plain tap on the tail opens it too (no dragging needed).
      if (pull < 0.15) open();
      else setPull(0);
    }
  };

  useNext(phase === "open" ? "Watch it bloom" : null, onNext, "bouquet");

  return (
    <>
      <Head
        kicker={phase === "open" ? `From ${sender}, with love` : "Ding dong · special delivery"}
        title={
          phase === "open" ? (
            <>
              Flowers for <em>{recipient}</em>
            </>
          ) : (
            <>
              A parcel for <em>{recipient}</em>
            </>
          )
        }
        sub={phase === "closed" ? "Someone left something at your door." : phase === "knocked" ? "Pull the ribbon to open it." : "Still in bud, every stem placed by hand. Let's watch it open."}
      />
      <div className="db-fill">
        <div className="db-box" data-phase={phase}>
          <AnimatePresence>
            {phase === "open" && (
              <motion.div
                key="rise"
                className="db-box-bq"
                initial={reduced ? { opacity: 0 } : { y: "38%", opacity: 0, scale: 0.8 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 90, damping: 15, delay: 0.25 }}
              >
                <Bouquet look={look} palette={palette} sway buds />
              </motion.div>
            )}
          </AnimatePresence>
          <button type="button" className="db-box-body" onClick={knock} aria-label={phase === "closed" ? "Knock on the parcel" : "The parcel"} data-db-box>
            <svg viewBox="0 0 300 250" aria-hidden className="db-box-svg">
              <defs>
                <linearGradient id="db-kraft" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#E6C49A" />
                  <stop offset="1" stopColor="#C99A68" />
                </linearGradient>
              </defs>
              <rect x="34" y="40" width="232" height="200" rx="10" fill="url(#db-kraft)" stroke="#A97C4C" strokeWidth="3" />
              <path d="M34 92 h232" stroke="#B88958" strokeWidth="2" opacity=".5" />
              <rect x="136" y="40" width="28" height="200" fill={palette.theme.accent} opacity={phase === "open" ? 0 : 1} style={{ transition: "opacity .4s" }} />
              <rect x="34" y="122" width="232" height="26" fill={palette.theme.accent} opacity={phase === "open" ? 0 : 1} style={{ transition: "opacity .4s" }} />
              <text x="60" y="222" fontFamily="sans-serif" fontSize="13" fontWeight="700" fill="#8A5E33" opacity=".55">
                FRAGILE · FLOWERS
              </text>
              <text x="228" y="76" fontSize="22" opacity=".5">
                ♡
              </text>
            </svg>
            <motion.span className="db-lid" animate={phase === "open" ? (reduced ? { opacity: 0 } : { y: -260, rotate: -24, opacity: 0 }) : phase === "knocked" ? { y: [0, -10, 0, -6, 0] } : { y: 0 }} transition={phase === "open" ? { duration: 0.8, ease: [0.3, 0.6, 0.3, 1] } : { duration: 0.6 }} aria-hidden>
              <svg viewBox="0 0 300 70">
                <rect x="20" y="20" width="260" height="44" rx="8" fill="#DDB383" stroke="#A97C4C" strokeWidth="3" />
                <rect x="136" y="20" width="28" height="44" fill={palette.theme.accent} />
                <path d="M150 22 C120 -6 92 6 104 22 C112 32 136 28 150 22Z M150 22 C180 -6 208 6 196 22 C188 32 164 28 150 22Z" fill={palette.theme.accent} stroke={palette.theme.accentDeep} strokeWidth="2.5" />
                <circle cx="150" cy="22" r="8" fill={palette.theme.accentDeep} />
              </svg>
            </motion.span>
            <span className="db-note" aria-hidden={phase === "open"}>
              <span className="db-note-k">To: {recipient}</span>
              <span className="db-note-t">{line}</span>
            </span>
          </button>
          {phase !== "open" && (
            <button
              type="button"
              className={`db-pull${phase === "knocked" ? " is-ready" : ""}`}
              style={{ ["--pull" as string]: String(pull) }}
              onPointerDown={down}
              onPointerMove={move}
              onPointerUp={up}
              onPointerCancel={up}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), open())}
              aria-label="Pull the ribbon to open the parcel"
              data-db-pull
            >
              <span className="db-pull-tail" aria-hidden />
              <span className="db-pull-knob" aria-hidden>
                pull
              </span>
            </button>
          )}
          {phase !== "open" && sticker && <span className="db-box-stk">{sticker}</span>}
        </div>
      </div>
      <div className="db-foot">{phase === "closed" ? <Hint>Tap the box</Hint> : phase === "knocked" ? <Hint hand="👇">Pull the ribbon down</Hint> : null}</div>
    </>
  );
}

// ─── 2 · Bloom ───────────────────────────────────────────────────────────────

export function BloomRoom({ look, palette, sender, kicker, sticker, onNext }: Common & { sender: string; kicker: string; sticker: ReactNode; onNext: () => void }) {
  const { cue } = useDb();
  const reduced = useReducedMotion();
  const n = look.stems.length;
  const gap = n > 10 ? 0.24 : 0.32;
  const total = reduced ? 600 : (0.4 + n * gap + 0.9) * 1000;
  const [done, setDone] = useState(false);
  useEffect(() => {
    const ts: number[] = [];
    if (!reduced) for (let k = 0; k < n; k += 1) ts.push(window.setTimeout(() => cue("bubble", { gain: 0.16 + (k % 3) * 0.04 }), (0.4 + k * gap) * 1000 + 300));
    ts.push(
      window.setTimeout(() => {
        setDone(true);
        cue("chime", { gain: 0.35 });
        haptic([10, 30, 10]);
        burst({ kind: "petals", emojis: ["🌸", "💗", "✨", "🌷"], origin: { x: 0.5, y: 0.4 }, count: 30 });
      }, total),
    );
    return () => ts.forEach((t) => window.clearTimeout(t));
  }, [n, gap, total, reduced, cue]);

  useNext(done ? "Meet your flowers" : null, onNext, "flower");
  return (
    <>
      <Head kicker={kicker} title={done ? <>It&apos;s all <em>yours</em></> : "Blooming…"} sub={done ? `${n} stems, every one placed by ${sender}.` : "Watch it open, one stem at a time."} />
      <div className="db-fill">
        <div className="db-bq">
          <Bouquet look={look} palette={palette} bloom bloomGap={gap} bloomDelay={0.4} sway />
          {done && sticker && <span className="db-corner-stk">{sticker}</span>}
        </div>
      </div>
      <div className="db-foot" />
    </>
  );
}

// ─── 3 · Meanings ────────────────────────────────────────────────────────────

export function Meanings({ look, palette, notes, hand, onNext }: Common & { notes: Partial<Record<FlowerId, string>>; hand: DbHand; onNext: () => void }) {
  const { cue } = useDb();
  const kinds = useMemo(() => kindsOf(look.stems), [look.stems]);
  const [open, setOpen] = useState<number | null>(null);
  const [seen, setSeen] = useState<ReadonlySet<FlowerId>>(new Set());
  const visited = useMemo(() => new Set(look.stems.map((s, i) => (seen.has(s.flower) ? i : -1)).filter((i) => i >= 0)), [look.stems, seen]);
  const tap = (i: number) => {
    const f = look.stems[i].flower;
    cue("glass-ping", { gain: 0.3 });
    haptic(10);
    setOpen(i);
    setSeen((s) => new Set(s).add(f));
  };
  const flower = open != null ? FLOWER_BY_ID[look.stems[open].flower] : null;
  const all = seen.size >= kinds.length;
  useNext(seen.size ? (all ? "Give them water" : "Give them water") : null, onNext, "water");
  return (
    <>
      <Head kicker="The language of flowers" title={<>Every flower <em>says something</em></>} sub="Tap each one to read what it means, and what it means to them." />
      <div className="db-fill">
        <div className="db-bq">
          <Bouquet look={look} palette={palette} sway onHeadTap={tap} visited={visited} headLabel={(i) => `${FLOWER_BY_ID[look.stems[i].flower].name}: tap to read what it means`} />
        </div>
        <AnimatePresence>
          {flower && (
            <motion.div
              key={flower.id}
              className="db-mean"
              role="dialog"
              aria-label={`${flower.name}: ${flower.word}`}
              initial={{ opacity: 0, y: 30, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 260, damping: 24 }}
              data-db-meaning
            >
              <button type="button" className="db-mean-x" onClick={() => setOpen(null)} aria-label="Close">
                ✕
              </button>
              <span className="db-mean-art" aria-hidden>
                <MeanImg id={flower.id} />
              </span>
              <div className="db-mean-tx">
                <p className="db-mean-k">{flower.name}</p>
                <p className="db-mean-w">{flower.word}</p>
                <p className="db-mean-l">“{flower.line}”</p>
                {notes[flower.id]?.trim() && (
                  <p className="db-mean-n" style={{ fontFamily: handFace(hand) }}>
                    {notes[flower.id]?.trim()}
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="db-foot">
        <Hint>
          {seen.size} of {kinds.length} {kinds.length === 1 ? "flower" : "flowers"} read
        </Hint>
      </div>
    </>
  );
}

function MeanImg({ id }: { id: FlowerId }) {
  return <FlowerFace id={id} />;
}

// ─── 4 · Water ───────────────────────────────────────────────────────────────

export function Water({ look, palette, sticker, hasPhotos, onNext }: Common & { sticker: ReactNode; hasPhotos: boolean; onNext: () => void }) {
  const { cue } = useDb();
  const reduced = useReducedMotion();
  const [level, setLevel] = useState(0);
  const [pouring, setPouring] = useState(false);
  const [can, setCan] = useState<{ x: number; y: number } | null>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const bqRef = useRef<HTMLDivElement>(null);
  const done = level >= 1;
  const doneRef = useRef(false);

  // Fill while pouring.
  useEffect(() => {
    if (!pouring || done) return;
    let raf = 0;
    let last = performance.now();
    let tick = 0;
    const step = (t: number) => {
      const dt = t - last;
      last = t;
      tick += dt;
      if (tick > 420) {
        tick = 0;
        cue("bubble", { gain: 0.12 });
        haptic(4);
      }
      setLevel((v) => Math.min(1, v + dt / 2600));
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [pouring, done, cue]);

  useEffect(() => {
    if (!done || doneRef.current) return;
    doneRef.current = true;
    const t = window.setTimeout(() => {
      setPouring(false);
      cue("chime-cascade", { gain: 0.4 });
      haptic([12, 40, 12, 40, 20]);
      burst({ kind: "sparkles", origin: { x: 0.5, y: 0.4 }, count: 34 });
    }, 0);
    return () => window.clearTimeout(t);
  }, [done, cue]);

  // The can: drag it over the bouquet and it tips and pours.
  const overBouquet = (x: number, y: number) => {
    const r = bqRef.current?.getBoundingClientRect();
    return !!r && x > r.left - 30 && x < r.right + 30 && y > r.top - 80 && y < r.top + r.height * 0.7;
  };
  const canDown = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (done) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const f = fillRef.current?.getBoundingClientRect();
    if (!f) return;
    setCan({ x: e.clientX - f.left, y: e.clientY - f.top });
  };
  const canMove = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (!can || done) return;
    const f = fillRef.current?.getBoundingClientRect();
    if (!f) return;
    setCan({ x: e.clientX - f.left, y: e.clientY - f.top });
    setPouring(overBouquet(e.clientX, e.clientY));
  };
  const canUp = () => {
    setCan(null);
    setPouring(false);
  };

  const label = hasPhotos ? "Look closer" : "There's a card";
  useNext(done ? label : null, onNext, hasPhotos ? "photo" : "letter");

  const canStyle = can ? { left: can.x, top: can.y, transform: `translate(-30%, -60%) rotate(${pouring ? 30 : -6}deg)` } : undefined;
  return (
    <>
      <Head kicker="A little care" title={done ? <>Look how they <em>glow</em></> : <>Give them <em>some water</em></>} sub={done ? "Fresh, happy and blooming. Just like you make me feel." : "Drag the watering can over the flowers, or hold the button."} />
      <div className="db-fill" ref={fillRef}>
        <div className="db-bq" ref={bqRef}>
          <Bouquet look={look} palette={palette} sway glow={level} />
          {done && sticker && <span className="db-corner-stk">{sticker}</span>}
        </div>
        {pouring && !reduced && (
          <span className="db-rain" style={can ? { left: can.x + 34, top: can.y - 6 } : undefined} aria-hidden>
            {Array.from({ length: 12 }, (_, k) => (
              <i key={k} style={{ left: `${(k * 37) % 100}%`, animationDelay: `${(k % 6) * 0.1}s` }} />
            ))}
          </span>
        )}
        {!done && (
          <button
            type="button"
            className={`db-can${can ? " is-held" : ""}${pouring ? " is-pour" : ""}`}
            style={canStyle}
            onPointerDown={canDown}
            onPointerMove={canMove}
            onPointerUp={canUp}
            onPointerCancel={canUp}
            aria-label="Watering can: drag it over the flowers"
            data-db-can
          >
            <svg viewBox="0 0 120 90" aria-hidden>
              <path d="M18 34 h56 v40 a8 8 0 0 1 -8 8 h-40 a8 8 0 0 1 -8 -8z" fill={palette.theme.accent} stroke={palette.theme.accentDeep} strokeWidth="3" />
              <path d="M74 44 L108 22 L112 28 L80 56z" fill={palette.theme.accent} stroke={palette.theme.accentDeep} strokeWidth="3" />
              <ellipse cx="110" cy="24" rx="7" ry="4" fill={palette.blush} stroke={palette.theme.accentDeep} strokeWidth="2.5" transform="rotate(-34 110 24)" />
              <path d="M30 34 C30 10 62 10 62 34" fill="none" stroke={palette.theme.accentDeep} strokeWidth="5" />
              <path d="M26 46 h40" stroke="#FFFFFF" strokeOpacity=".5" strokeWidth="4" strokeLinecap="round" />
              <path d="M40 60 c-4 -6 4 -10 6 -4 c2 -6 10 -2 6 4 l-6 7z" fill="#FFFFFF" opacity=".85" />
            </svg>
          </button>
        )}
      </div>
      <div className="db-foot">
        {!done ? (
          <>
            <span className="db-meter" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(level * 100)} aria-label="Watered">
              <i style={{ width: `${level * 100}%` }} />
            </span>
            <button
              type="button"
              className="db-ghost"
              onPointerDown={() => setPouring(true)}
              onPointerUp={() => setPouring(false)}
              onPointerLeave={() => setPouring(false)}
              onPointerCancel={() => setPouring(false)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setLevel((v) => Math.min(1, v + 0.25));
                }
              }}
              data-db-hold-water
            >
              💧 Hold to water
            </button>
          </>
        ) : null}
      </div>
    </>
  );
}

// ─── 5 · Photos ──────────────────────────────────────────────────────────────

/** Where the polaroids peek out from between the stems (frame px, tilt). */
const TUCKS: readonly [number, number, number][] = [
  [118, 128, -14],
  [482, 136, 12],
  [228, 64, -7],
  [378, 66, 8],
  [64, 250, -20],
  [540, 254, 18],
];

export function Photos({ look, palette, photos, hand, sticker, onNext }: Common & { photos: LovePhoto[]; hand: DbHand; sticker: ReactNode; onNext: () => void }) {
  const { cue } = useDb();
  const [open, setOpen] = useState<number | null>(null);
  const [seen, setSeen] = useState<ReadonlySet<number>>(new Set());
  const list = photos.slice(0, 6);
  const pull = (k: number) => {
    cue("paper-rustle", { gain: 0.45 });
    haptic(10);
    setOpen(k);
    setSeen((s) => new Set(s).add(k));
  };
  useNext(seen.size ? "There's a card" : null, onNext, "letter");
  const between = (
    <>
      {list.map((p, k) => {
        const [x, y, r] = TUCKS[k];
        return (
          <button
            key={k}
            type="button"
            className={`db-tuck${seen.has(k) ? " is-seen" : ""}`}
            style={{ left: pctX(x), top: pctY(y), ["--r" as string]: `${r}deg`, ["--k" as string]: String(k) }}
            onClick={() => pull(k)}
            aria-label={`Photo ${k + 1}${p.caption ? `: ${p.caption}` : ""}. Pull it out.`}
            data-db-tuck={k}
          >
            <span className="db-tuck-pic">
              <CroppedPhoto photo={p} alt="" />
            </span>
          </button>
        );
      })}
    </>
  );
  const ph = open != null ? list[open] : null;
  return (
    <>
      <Head kicker="Tucked between the stems" title={<>Some of <em>our moments</em></>} sub={`${list.length} little photos are hiding in there. Pull each one out.`} />
      <div className="db-fill">
        <div className="db-bq">
          <Bouquet look={look} palette={palette} sway between={between} />
          {sticker && <span className="db-corner-stk is-low">{sticker}</span>}
        </div>
        <AnimatePresence>
          {ph && (
            <motion.div key={open} className="db-lightbox" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(null)}>
              <motion.figure
                className="db-polar"
                role="dialog"
                aria-label={ph.caption || `Photo ${(open ?? 0) + 1}`}
                initial={{ y: 80, rotate: -8, scale: 0.7 }}
                animate={{ y: 0, rotate: -2, scale: 1 }}
                exit={{ y: 40, scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", stiffness: 220, damping: 20 }}
                onClick={(e) => e.stopPropagation()}
                data-db-polaroid
              >
                <span className="db-polar-pic">
                  <CroppedPhoto photo={ph} alt={ph.caption ?? ""} eager />
                </span>
                <figcaption style={{ fontFamily: handFace(hand) }}>
                  {ph.caption && <b>{ph.caption}</b>}
                  {ph.note && <span>{ph.note}</span>}
                </figcaption>
                <button type="button" className="db-polar-x" onClick={() => setOpen(null)} aria-label="Tuck it back">
                  ✕
                </button>
              </motion.figure>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="db-foot">
        <Hint>
          {seen.size} of {list.length} found
        </Hint>
      </div>
    </>
  );
}

// ─── 6 · The card ────────────────────────────────────────────────────────────

export function CardRoom({ look, palette, recipient, sender, petName, letter, hand, sticker, onNext }: Common & { recipient: string; sender: string; petName: string; letter: string; hand: DbHand; sticker: ReactNode; onNext: () => void }) {
  const { cue } = useDb();
  const reduced = useReducedMotion();
  const [state, setState] = useState<"sealed" | "reading" | "read">("sealed");
  const openIt = () => {
    cue("wax-crack", { gain: 0.45 });
    cue("paper-rustle", { gain: 0.4, at: 0.25 });
    haptic([10, 30, 10]);
    setState("reading");
  };
  useNext(state !== "sealed" ? "One small question" : null, onNext, "heart");
  const front = (
    <button type="button" className={`db-env${state !== "sealed" ? " is-open" : ""}`} onClick={openIt} aria-label="Open the card" data-db-envelope>
      <svg viewBox="0 0 200 130" aria-hidden>
        <rect x="4" y="10" width="192" height="116" rx="8" fill="#FFFDF8" stroke={palette.deep} strokeOpacity=".35" strokeWidth="2" />
        <path d="M4 126 L100 62 L196 126" fill="#F8EFE4" stroke={palette.deep} strokeOpacity=".25" strokeWidth="2" />
        <path className="db-env-flap" d="M4 14 L100 78 L196 14 Z" fill="#FBF4EA" stroke={palette.deep} strokeOpacity=".3" strokeWidth="2" />
        <circle cx="100" cy="76" r="15" fill={palette.theme.accent} />
        <path d="M100 84 C92 78 90 74 92 71 C94 68 98 68 100 71 C102 68 106 68 108 71 C110 74 108 78 100 84Z" fill="#FFFFFF" />
      </svg>
      <span className="db-env-to" style={{ fontFamily: DB_HAND }}>
        {recipient}
      </span>
    </button>
  );
  return (
    <>
      <Head kicker="Tucked into the wrap" title={<>And a little <em>card</em></>} sub={state === "sealed" ? "Tap the envelope to open it." : "Read it slowly."} />
      <div className="db-fill">
        <div className="db-bq">
          <Bouquet look={look} palette={palette} sway front={front} />
          {sticker && state === "sealed" && <span className="db-corner-stk">{sticker}</span>}
        </div>
        <AnimatePresence>
          {state === "reading" && (
            <motion.div key="card" className="db-letter-wrap" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <motion.article
                className="db-letter"
                style={{ fontFamily: handFace(hand) }}
                initial={reduced ? { opacity: 0 } : { y: "60%", rotate: 4, opacity: 0 }}
                animate={{ y: 0, rotate: -1, opacity: 1 }}
                exit={{ y: "30%", opacity: 0 }}
                transition={{ type: "spring", stiffness: 140, damping: 18 }}
                aria-label={`A card from ${sender}`}
                data-db-letter
              >
                <div className="db-letter-scroll" tabIndex={0}>
                  <p className="db-letter-to">Dear {petName || recipient},</p>
                  <p className="db-letter-body">{letter}</p>
                  <p className="db-letter-from">
                    With all my love,
                    <br />
                    <span style={{ fontFamily: DB_SCRIPT }}>{sender}</span>
                  </p>
                </div>
                <button type="button" className="db-ghost db-letter-fold" onClick={() => setState("read")}>
                  Fold it back 💌
                </button>
              </motion.article>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="db-foot">{state === "read" && <button type="button" className="db-ghost" onClick={() => setState("reading")}>Read it again</button>}</div>
    </>
  );
}

export const DB_SCENES_CSS = `
/* Delivery */
.db-box { position: relative; width: min(92cqw, 76cqh, 460px); aspect-ratio: 300 / 330; display: grid; }
.db-box-body { position: absolute; left: 0; right: 0; bottom: 0; height: 76%; padding: 0; border: 0; background: none; cursor: pointer; touch-action: manipulation; -webkit-tap-highlight-color: transparent; }
.db-box-body:focus-visible { outline: 3px solid var(--vw-ink); outline-offset: 4px; border-radius: 12px; }
.db-box-svg { position: absolute; inset: 0; width: 100%; height: 100%; filter: drop-shadow(0 22px 22px color-mix(in srgb, var(--db-deep) 30%, transparent)); }
.db-box[data-phase="closed"] .db-box-body { animation: db-wiggle 2.6s ease-in-out 1s infinite; }
@keyframes db-wiggle { 0%, 80%, 100% { transform: rotate(0); } 85% { transform: rotate(-2.5deg); } 90% { transform: rotate(2.5deg); } 95% { transform: rotate(-1.5deg); } }
.db-lid { position: absolute; left: -2%; right: -2%; top: -7%; display: block; z-index: 3; }
.db-lid svg { width: 100%; display: block; filter: drop-shadow(0 8px 10px rgba(80,50,20,.25)); }
.db-note { position: absolute; left: 8%; top: 40%; width: 44%; z-index: 2; padding: 2.4cqw 2.6cqw; display: grid; gap: 2px; text-align: left; transform: rotate(-5deg); border-radius: 4px;
  background: #FFFDF6; box-shadow: 0 6px 14px -8px rgba(80,50,20,.6); transition: opacity .3s; }
.db-box[data-phase="open"] .db-note { opacity: 0; }
.db-box-svg { transition: opacity .6s ease .35s, transform .8s ease .3s; }
.db-box[data-phase="open"] .db-box-svg { opacity: 0; transform: translateY(12%) scale(.92); }
.db-box[data-phase="open"] .db-box-body { pointer-events: none; }
.db-note-k { font: 700 clamp(9px, 2.4cqw, 12px)/1.2 ${DB_SANS}; letter-spacing: .08em; text-transform: uppercase; color: var(--vw-accent-deep); overflow-wrap: anywhere; }
.db-note-t { font: 600 clamp(13px, 3.8cqw, 19px)/1.12 ${DB_HAND}; color: #3F2A22; overflow-wrap: anywhere; }
.db-box-bq { position: absolute; left: 50%; top: 50%; width: min(100%, 76cqh * .714); margin-left: calc(min(100%, 76cqh * .714) / -2); transform-origin: 50% 80%; translate: 0 -50%; z-index: 1; pointer-events: none; }
.db-pull { position: absolute; z-index: 4; left: 52%; top: 26%; width: 64px; height: calc(46% + var(--pull) * 60px); padding: 0; border: 0; background: none; cursor: grab; touch-action: none; display: flex; flex-direction: column; align-items: center; }
.db-pull-tail { width: 12px; flex: 1; border-radius: 0 0 6px 6px; background: linear-gradient(90deg, var(--vw-accent-deep), var(--vw-accent) 50%, var(--vw-accent-deep)); }
.db-pull-knob { flex: none; width: 52px; height: 52px; border-radius: 50%; display: grid; place-items: center; font: 700 12px ${DB_SANS}; letter-spacing: .06em; color: #FFFFFF; text-transform: uppercase;
  background: radial-gradient(circle at 40% 35%, color-mix(in srgb, var(--vw-accent) 60%, #FFFFFF), var(--vw-accent-deep)); box-shadow: 0 0 0 3px #FFFFFF, 0 8px 16px -6px var(--db-deep); }
.db-pull.is-ready .db-pull-knob { animation: db-tug 1.3s ease-in-out infinite; }
@keyframes db-tug { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(9px); } }
.db-pull:focus-visible .db-pull-knob { outline: 3px solid var(--vw-ink); outline-offset: 3px; }
.db-box-stk { position: absolute; right: -6%; bottom: 4%; z-index: 5; transform: rotate(6deg); }
.db-corner-stk { position: absolute; right: -4%; top: -3%; z-index: 30; pointer-events: none; transform: scale(.8); transform-origin: 100% 0; }
.db-corner-stk.is-low { top: auto; bottom: 22%; right: -4%; }
.db-corner-stk img { width: clamp(64px, 18cqw, 104px) !important; height: auto !important; }
.db-box-stk img { width: clamp(64px, 20cqw, 110px) !important; height: auto !important; }

/* Meanings */
.db-mean { position: absolute; left: 0; right: 0; margin: 0 auto; bottom: 0; z-index: 40; width: min(100%, 420px); box-sizing: border-box; display: grid; grid-template-columns: 76px minmax(0, 1fr); gap: 12px; align-items: center;
  padding: 14px 16px; border-radius: 22px; text-align: left; background: color-mix(in srgb, var(--vw-paper) 96%, transparent); box-shadow: 0 22px 40px -22px var(--db-deep), inset 0 0 0 1.5px var(--vw-edge); backdrop-filter: blur(6px); }
.db-mean-x { position: absolute; right: 6px; top: 6px; width: 44px; height: 44px; border-radius: 50%; border: 0; background: transparent; color: var(--vw-ink-soft); font-size: 16px; cursor: pointer; }
.db-mean-x:focus-visible { outline: 2px solid var(--vw-ink); }
.db-mean-art { width: 76px; height: 76px; }
.db-mean-art .dbq-face { width: 100%; height: 100%; }
.db-mean-tx { min-width: 0; padding-right: 28px; }
.db-mean-k { margin: 0; font: 700 11px/1.2 ${DB_SANS}; letter-spacing: .14em; text-transform: uppercase; color: var(--vw-ink-soft); }
.db-mean-w { margin: 1px 0 0; font: 600 26px/1.05 ${DB_SERIF}; font-style: italic; color: var(--vw-accent-deep); }
.db-mean-l { margin: 4px 0 0; font: 500 15px/1.35 ${DB_SERIF}; color: var(--vw-ink); }
.db-mean-n { margin: 6px 0 0; padding-top: 6px; border-top: 1px dashed var(--vw-edge); font-size: 20px; line-height: 1.15; color: var(--vw-accent-deep); overflow-wrap: anywhere; }

/* Water */
.db-can { position: absolute; z-index: 35; right: 2%; top: 4%; width: clamp(92px, 26cqw, 140px); aspect-ratio: 120 / 90; padding: 0; border: 0; background: none; cursor: grab; touch-action: none; transform: rotate(-8deg); transition: transform .2s ease;
  filter: drop-shadow(0 10px 12px color-mix(in srgb, var(--db-deep) 35%, transparent)); animation: db-canhint 2.4s ease-in-out infinite; }
.db-can.is-held { cursor: grabbing; animation: none; transition: transform .15s ease; }
.db-can svg { width: 100%; height: 100%; display: block; }
.db-can:focus-visible { outline: 3px solid var(--vw-ink); outline-offset: 4px; border-radius: 12px; }
@keyframes db-canhint { 0%, 100% { transform: rotate(-8deg) translate(0, 0); } 50% { transform: rotate(-18deg) translate(-8px, 4px); } }
.db-rain { position: absolute; left: 40%; top: 10%; width: 64px; height: 50cqh; pointer-events: none; z-index: 36; }
.db-rain i { position: absolute; top: 0; width: 6px; height: 12px; border-radius: 50% 50% 50% 50% / 30% 30% 70% 70%; background: linear-gradient(180deg, #CDEBFF, #7CC4F2); opacity: 0; animation: db-drop .7s linear infinite; }
@keyframes db-drop { 0% { transform: translateY(0); opacity: 0; } 15% { opacity: .95; } 100% { transform: translateY(40cqh); opacity: 0; } }
.db-meter { display: block; width: min(220px, 50vw); height: 10px; border-radius: 99px; overflow: hidden; background: color-mix(in srgb, var(--vw-accent) 14%, #FFFFFF); box-shadow: inset 0 0 0 1px var(--vw-edge); }
.db-meter i { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg, #8FD3FF, var(--vw-accent)); transition: width .1s linear; }

/* Photos */
.db-tuck { position: absolute; width: 17%; padding: 1.3cqw 1.3cqw 4.2cqw; box-sizing: border-box; border: 0; border-radius: 3px; display: block; cursor: pointer; pointer-events: auto; background: #FFFFFF;
  transform: translate(-50%, -50%) rotate(var(--r)); box-shadow: 0 8px 14px -6px rgba(60,30,30,.45); animation: db-peek 2.8s ease-in-out calc(var(--k) * .3s) infinite; touch-action: manipulation; }
.db-tuck-pic { display: block; width: 100%; aspect-ratio: .86; overflow: hidden; }
.db-tuck.is-seen { opacity: .75; animation: none; }
.db-tuck:focus-visible { outline: 3px solid var(--vw-ink); outline-offset: 3px; }
@keyframes db-peek { 0%, 100% { transform: translate(-50%, -50%) rotate(var(--r)); } 50% { transform: translate(-50%, -62%) rotate(calc(var(--r) * .6)); } }
.db-lightbox { position: fixed; inset: 0; z-index: 80; display: flex; align-items: center; justify-content: center; box-sizing: border-box; padding: 70px 18px 90px; background: color-mix(in srgb, var(--db-deep) 35%, transparent); backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px); }
.db-polar { position: relative; margin: 0; width: min(84vw, 360px, 52dvh); padding: 14px 14px 18px; background: #FFFFFF; border-radius: 4px; box-shadow: 0 30px 60px -24px rgba(40,10,20,.6); }
.db-polar-pic { display: block; width: 100%; aspect-ratio: .86; overflow: hidden; }
.db-polar figcaption { display: grid; gap: 4px; padding-top: 10px; color: #3F2A22; text-align: center; }
.db-polar figcaption b { font-size: 25px; line-height: 1.05; font-weight: 700; overflow-wrap: anywhere; }
.db-polar figcaption span { font-size: 19px; line-height: 1.15; overflow-wrap: anywhere; }
@media (orientation: landscape) and (max-height: 520px) {
  .db-lightbox { padding: 58px 16px 16px; }
  .db-polar { width: min(86vw, 560px); display: grid; grid-template-columns: minmax(0, 52dvh) minmax(0, 1fr); gap: 16px; align-items: center; }
  .db-polar figcaption { padding-top: 0; text-align: left; }
  .db-letter-wrap { padding: 54px 16px 12px calc(16px + 40vw); }
}
.db-polar-x { position: absolute; right: -16px; top: -16px; width: 50px; height: 50px; border-radius: 50%; border: 0; cursor: pointer; background: var(--vw-accent); color: #FFFFFF; font-size: 16px; box-shadow: 0 6px 14px -6px var(--db-deep); }

/* The card */
.db-env { position: absolute; left: 50%; top: 70%; z-index: 20; width: 44%; padding: 0; border: 0; background: none; cursor: pointer; pointer-events: auto; transform: translate(-50%, -50%) rotate(-6deg); touch-action: manipulation;
  filter: drop-shadow(0 12px 14px color-mix(in srgb, var(--db-deep) 35%, transparent)); animation: db-envbob 2.4s ease-in-out infinite; }
.db-env svg { width: 100%; display: block; }
.db-env-flap { transform-origin: 50% 10%; transition: transform .5s ease; }
.db-env.is-open { animation: none; }
.db-env.is-open .db-env-flap { transform: scaleY(-1); }
.db-env-to { position: absolute; left: 50%; bottom: 10%; transform: translateX(-50%); font-size: clamp(13px, 4.2cqw, 22px); color: #3F2A22; white-space: nowrap; max-width: 90%; overflow: hidden; text-overflow: ellipsis; }
.db-env:focus-visible { outline: 3px solid var(--vw-ink); outline-offset: 4px; border-radius: 10px; }
@keyframes db-envbob { 0%, 100% { transform: translate(-50%, -50%) rotate(-6deg); } 50% { transform: translate(-50%, -54%) rotate(-3deg); } }
.db-letter-wrap { position: fixed; inset: 0; z-index: 80; display: flex; align-items: center; justify-content: center; box-sizing: border-box; padding: calc(env(safe-area-inset-top, 0px) + 58px) 14px calc(env(safe-area-inset-bottom, 0px) + 86px); background: color-mix(in srgb, var(--db-deep) 30%, transparent); backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px); }
.db-letter { position: relative; width: min(100%, 520px); max-height: 100%; min-height: 0; box-sizing: border-box; display: flex; flex-direction: column; gap: 10px; padding: 22px 20px 16px; border-radius: 6px; color: #3F2A22; text-align: left;
  background-color: #FFFDF8; background-image: linear-gradient(180deg, #FFFDF8, #FBF3E6); box-shadow: 0 34px 60px -26px rgba(40,10,20,.65), inset 0 0 0 1px rgba(160,120,80,.2); }
.db-letter-scroll { flex: 1; min-height: 0; overflow-y: auto; overscroll-behavior: contain; font-size: clamp(20px, 5.2vw, 24px); line-height: 32px; outline: none; padding-right: 6px; scrollbar-width: thin; scrollbar-color: var(--vw-accent) transparent; }
.db-letter-scroll:focus-visible { box-shadow: 0 0 0 3px var(--vw-accent); border-radius: 6px; }
.db-letter-to { margin: 0 0 4px; }
.db-letter-body { margin: 0; white-space: pre-wrap; overflow-wrap: anywhere; }
.db-letter-from { margin: 14px 0 0; text-align: right; }
.db-letter-from span { font-size: 1.6em; color: var(--vw-accent-deep); }
.db-letter-fold { align-self: center; flex: none; }
`;
