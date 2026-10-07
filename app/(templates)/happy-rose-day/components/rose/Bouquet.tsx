"use client";

// Section 6: the bouquet of memories. A kraft-paper cone with a satin
// ribbon (and a tag with their pet name) holds one rosebud per photo. Tap a
// bud → it blooms → a polaroid rises out of the bouquet with the caption and
// the sender's note → "keep it" tucks it into the little row of collected
// memories below (tap any to open the lightbox). No photos → the buds open
// into illustrated rose-meaning cards instead, so it never breaks.

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FONTS, VW } from "../../../_valentine/theme";
import { CroppedPhoto, PhotoLightbox, Sticker, burst, haptic } from "../../../_valentine/kit";
import type { DayConfig, LovePhoto, ValentineDayData } from "../../../_valentine/types";
import { ROSE_COLORS, type RoseExtras } from "../../../_valentine/days/happy-rose-day";
import { GradDefs, LEAF, RoseHead, roseGrads, shadesFor, type RoseShades } from "./art";
import { EASE, ghostBtn, kicker, primaryBtn } from "./ui";

interface Props {
  day: DayConfig;
  data: ValentineDayData<RoseExtras>;
  reduced: boolean;
  onNext: () => void;
}

interface Memory {
  photo: LovePhoto | null;
  caption: string;
  note: string;
  color: string;
}

const FALLBACK = ["red", "pink", "peach"] as const;

function budSpots(n: number) {
  const out: { x: number; y: number; r: number }[] = [];
  const arc = (count: number, rad: number, a0: number, a1: number, cy: number) => {
    for (let i = 0; i < count; i++) {
      const a = count === 1 ? (a0 + a1) / 2 : a0 + ((a1 - a0) * i) / (count - 1);
      const t = (a * Math.PI) / 180;
      out.push({ x: 150 + Math.cos(t) * rad, y: cy + Math.sin(t) * rad * 0.82, r: (a + 90) * 0.35 });
    }
  };
  if (n <= 3) arc(n, n === 1 ? 40 : 70, n === 1 ? -90 : -140, n === 1 ? -90 : -40, 190);
  else if (n <= 5) arc(n, 92, -160, -20, 196);
  else {
    arc(5, 100, -164, -16, 202);
    arc(n - 5, 50, n - 5 === 1 ? -90 : -134, n - 5 === 1 ? -90 : -46, 186);
  }
  return out;
}

/** One rosebud that blooms when opened (its own little rAF tween). */
function Bud({ id, x, y, r, opened, reduced, index, onOpen, label, hint, small }: { id: string; x: number; y: number; r: number; opened: boolean; reduced: boolean; index: number; onOpen: () => void; label: string; hint: boolean; small: boolean }) {
  const [open, setOpen] = useState(opened ? 1 : 0.04);
  const raf = useRef<number | null>(null);
  useEffect(() => {
    if (!opened) return;
    if (reduced) {
      setOpen(1);
      return;
    }
    const t0 = performance.now();
    const from = open;
    const step = (t: number) => {
      const k = Math.min(1, (t - t0) / 750);
      setOpen(from + (1 - from) * (1 - Math.pow(1 - k, 3)));
      if (k < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened, reduced]);
  const s = (small ? 0.5 : 0.62) + (small ? 0.1 : 0.14) * open;
  return (
    <g
      role="button"
      tabIndex={0}
      aria-label={label}
      aria-pressed={opened}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        }
      }}
      style={{ cursor: "pointer", outline: "none" }}
    >
      {hint && !reduced && (
        <circle cx={x} cy={y - 26} r={22} fill="none" stroke="rgba(200,16,46,.35)" strokeWidth={1.5} className="rd-ping" style={{ transformBox: "fill-box", transformOrigin: "center", animationDelay: `${index * 0.25}s` }} />
      )}
      <RoseHead id={id} open={open} x={x} y={y} s={s} rotate={r} />
      <circle cx={x} cy={y - 30} r={30} fill="transparent" />
    </g>
  );
}

export default function Bouquet({ day, data, reduced, onNext }: Props) {
  const x = data.extras;
  const sh = shadesFor(x.roseColor);
  const uid = useId().replace(/:/g, "");
  const memories: Memory[] = useMemo(
    () =>
      data.photos.length
        ? data.photos.map((p) => ({ photo: p, caption: p.caption ?? "", note: p.note ?? "", color: x.roseColor }))
        : FALLBACK.map((c) => {
            const m = ROSE_COLORS.find((k) => k.value === c)!;
            return { photo: null, caption: `a ${m.label.toLowerCase()} rose`, note: m.hint, color: c };
          }),
    [data.photos, x.roseColor],
  );
  const n = memories.length;
  const spots = useMemo(() => budSpots(n), [n]);
  const [opened, setOpened] = useState<number[]>([]);
  const [showing, setShowing] = useState<number | null>(null);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const all = opened.length >= n;
  const slot = day.gifSlots[3];
  // A shade per bud (photos all use the chosen rose; fallback cards their own).
  const shadeIds = useMemo(() => Array.from(new Set(memories.map((m) => m.color))), [memories]);

  const openBud = (i: number) => {
    haptic(10);
    if (!opened.includes(i)) setOpened((o) => [...o, i]);
    window.setTimeout(() => setShowing(i), reduced ? 0 : 420);
  };

  const keep = () => {
    setShowing(null);
    if (opened.length >= n) burst({ kind: "hearts", origin: { x: 0.5, y: 0.55 }, count: 26 });
  };

  const m = showing != null ? memories[showing] : null;

  return (
    <>
      <header style={{ display: "grid", gap: 4, justifyItems: "center", position: "relative" }}>
        <p style={kicker}>Bouquet of memories</p>
        <h2 style={{ margin: 0, font: `700 26px/1.2 ${FONTS.serif}`, color: VW.ink, maxWidth: 320 }}>Every rose in here is a memory</h2>
        <p style={{ margin: 0, font: `400 14.5px ${FONTS.ui}`, color: VW.inkSoft }}>{all ? "All of them, collected 💗" : "Tap a bud to make it bloom"}</p>
      </header>

      <div style={{ position: "relative", width: "min(80vw, 300px)", aspectRatio: "300 / 330" }}>
        {slot && (
          <div style={{ position: "absolute", right: -28, top: -6, zIndex: 3 }}>
            <Sticker slug={day.slug} slot={slot} value={data.gifs[slot.id]} size={74} />
          </div>
        )}
        <svg viewBox="0 0 300 330" width="100%" height="100%" style={{ display: "block", overflow: "visible" }} role="group" aria-label={`A bouquet of ${n} rosebuds`}>
          {shadeIds.map((c) => (
            <GradDefs key={c} grads={roseGrads(`${uid}${c}`, shadesFor(c))} />
          ))}
          <defs>
            <linearGradient id={`${uid}-kraft`} x1="0" x2="1">
              <stop offset="0" stopColor="#C99B6B" />
              <stop offset=".5" stopColor="#E0BC8F" />
              <stop offset="1" stopColor="#B88A5C" />
            </linearGradient>
          </defs>
          {/* tissue paper behind */}
          <path d="M44 186 C 18 110 78 52 150 66 C 222 52 282 110 256 186 Z" fill="#FBE3E8" />
          <path d="M44 186 C 34 140 52 104 86 88 L 150 186 Z" fill="#F7D3DB" />
          <path d="M256 186 C 266 140 248 104 214 88 L 150 186 Z" fill="#F7D3DB" />
          {/* stems + baby's breath */}
          {spots.map((s, i) => (
            <path key={i} d={`M${s.x.toFixed(1)} ${s.y.toFixed(1)} Q ${((s.x + 150) / 2).toFixed(1)} ${(s.y + 60).toFixed(1)} 150 260`} stroke={LEAF.stem} strokeWidth={3.2} fill="none" />
          ))}
          {[[70, 140], [230, 136], [104, 104], [196, 100], [150, 90]].map(([cx, cy], i) => (
            <g key={i} fill="#fff" opacity=".9">
              <circle cx={cx} cy={cy} r={3} />
              <circle cx={cx + 6} cy={cy + 4} r={2.4} />
              <circle cx={cx - 5} cy={cy + 5} r={2.2} />
            </g>
          ))}
          {[[64, 176, -40], [236, 176, 40], [92, 168, -20], [208, 168, 20], [120, 160, -8], [182, 160, 10], [150, 150, 0]].map(([lx, ly, a], i) => (
            <path key={i} d="M0 0 C -6 -16 -4 -34 0 -44 C 4 -34 6 -16 0 0 Z" fill={i % 2 ? LEAF.mid : LEAF.dark} transform={`translate(${lx} ${ly}) rotate(${a})`} />
          ))}
          {/* buds */}
          {spots.map((s, i) => (
            <Bud
              key={i}
              id={`${uid}${memories[i].color}`}
              x={s.x}
              y={s.y}
              r={s.r}
              index={i}
              opened={opened.includes(i)}
              reduced={reduced}
              onOpen={() => openBud(i)}
              label={`Memory ${i + 1}${memories[i].caption ? `: ${memories[i].caption}` : ""}`}
              hint={!opened.includes(i) && i === memories.findIndex((_, k) => !opened.includes(k))}
              small={n > 5}
            />
          ))}
          {/* the kraft cone */}
          <path d="M58 178 L242 178 L158 326 L142 326 Z" fill={`url(#${uid}-kraft)`} />
          <path d="M58 178 Q150 214 242 178 L214 214 Q150 240 86 214 Z" fill="#E7C79F" />
          <path d="M150 196 L150 326 M104 200 L146 324 M196 200 L154 324" stroke="rgba(110,70,30,.18)" strokeWidth={1.2} />
          {/* ribbon */}
          <path d="M108 254 Q150 264 192 254 L188 270 Q150 280 112 270 Z" fill={sh.seal} />
          <path d="M150 262 C 120 236 98 246 104 262 C 110 280 134 274 150 262 Z" fill={sh.seal} />
          <path d="M150 262 C 180 236 202 246 196 262 C 190 280 166 274 150 262 Z" fill={sh.seal} />
          <path d="M150 264 L 132 314 L 142 310 L 150 268 Z M150 264 L 168 314 L 158 310 L 150 268 Z" fill={sh.deep} opacity=".9" />
          <circle cx={150} cy={262} r={7} fill={sh.deep} />
          {/* tag */}
          <path d="M150 268 L 196 300" stroke="#A88A6A" strokeWidth={1} />
          <g transform="translate(196 300) rotate(-8)">
            <rect x={-6} y={-4} width={86} height={28} rx={5} fill="#FFFBF3" stroke="#E2CDB4" />
            <circle cx={0} cy={10} r={2.4} fill="#E2CDB4" />
            <text x={38} y={15} textAnchor="middle" dominantBaseline="middle" style={{ font: `700 13px ${FONTS.script}` }} fill="#5A1A2B">
              {(data.petName || data.recipientName || "for you").slice(0, 14)}
            </text>
          </g>
        </svg>

        {/* the risen polaroid */}
        <AnimatePresence>
          {m && showing != null && (
            <motion.div
              key={showing}
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: 70, scale: 0.35, rotate: -14 }}
              animate={{ opacity: 1, y: 0, scale: 1, rotate: showing % 2 ? 2.5 : -2.5 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, y: 220, scale: 0.25, transition: { duration: 0.45, ease: EASE } }}
              transition={{ type: "spring", stiffness: 170, damping: 17 }}
              style={{ position: "absolute", left: "50%", top: -14, marginLeft: -116, width: 232, zIndex: 10 }}
            >
              <div aria-hidden style={{ position: "absolute", inset: "-60px -80px", background: "radial-gradient(closest-side, rgba(255,248,240,.95), rgba(255,248,240,0))", zIndex: -1 }} />
              <Polaroid m={m} sh={shadesFor(m.color)} onOpen={m.photo ? () => setLightbox(data.photos.indexOf(m.photo!)) : undefined} />
              <button type="button" onClick={keep} style={{ ...primaryBtn, marginTop: 14, minHeight: 46, padding: "10px 22px", fontSize: 15 }}>
                Keep it 💗
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* collected row */}
      <div style={{ display: "grid", gap: 8, justifyItems: "center", minHeight: 86 }}>
        <div style={{ display: "flex", gap: n > 6 ? 6 : 8, flexWrap: "wrap", justifyContent: "center", maxWidth: 360 }}>
          {memories.map((mem, i) => {
            const got = opened.includes(i) && showing !== i;
            return (
              <button
                key={i}
                type="button"
                disabled={!got}
                onClick={() => (mem.photo ? setLightbox(data.photos.indexOf(mem.photo)) : setShowing(i))}
                aria-label={got ? `Open memory ${i + 1}` : `Memory ${i + 1} not opened yet`}
                style={{
                  width: n > 6 ? 32 : 40,
                  height: n > 6 ? 40 : 48,
                  padding: 3,
                  paddingBottom: 9,
                  border: 0,
                  borderRadius: 3,
                  background: got ? "#fff" : "rgba(255,255,255,.4)",
                  boxShadow: got ? "0 6px 12px -8px rgba(90,26,43,.6)" : "inset 0 0 0 1.5px rgba(200,16,46,.15)",
                  transform: `rotate(${i % 2 ? 4 : -4}deg)`,
                  cursor: got ? "pointer" : "default",
                  transition: "background .3s, box-shadow .3s",
                }}
              >
                {got && (
                  <span style={{ display: "block", width: "100%", height: "100%", overflow: "hidden", borderRadius: 2, background: VW.soft }}>
                    {mem.photo ? <CroppedPhoto photo={mem.photo} /> : <MiniRose color={mem.color} />}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <p style={{ margin: 0, font: `600 13px ${FONTS.ui}`, color: VW.inkSoft }}>
          {opened.length}/{n} memories opened
        </p>
      </div>

      <div style={{ minHeight: 100, display: "grid", gap: 8, justifyItems: "center" }}>
        {all && showing == null ? (
          <motion.div initial={reduced ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: "grid", gap: 12, justifyItems: "center" }}>
            <p style={{ margin: 0, maxWidth: 320, font: `italic 500 18px/1.45 ${FONTS.serif}`, color: VW.ink }}>You&apos;ve collected all of them. Just like you collected my heart.</p>
            <button type="button" onClick={onNext} style={primaryBtn}>
              One last rose 🌹
            </button>
          </motion.div>
        ) : opened.length > 0 && showing == null ? (
          <button type="button" onClick={onNext} style={{ ...ghostBtn, border: 0, background: "transparent" }}>
            Skip to the end →
          </button>
        ) : null}
      </div>

      <PhotoLightbox photos={data.photos} index={lightbox} onIndex={setLightbox} onClose={() => setLightbox(null)} />
    </>
  );
}

function MiniRose({ color }: { color: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="-60 -100 120 120" width="100%" height="100%" style={{ display: "block" }} aria-hidden>
      <GradDefs grads={roseGrads(id, shadesFor(color))} />
      <RoseHead id={id} open={1} x={0} y={8} s={0.95} />
    </svg>
  );
}

function Polaroid({ m, sh, onOpen }: { m: Memory; sh: RoseShades; onOpen?: () => void }) {
  return (
    <div style={{ background: "#fff", padding: "10px 10px 12px", borderRadius: 4, boxShadow: "0 26px 40px -18px rgba(90,26,43,.6)", textAlign: "center" }}>
      <button
        type="button"
        onClick={onOpen}
        disabled={!onOpen}
        aria-label={onOpen ? "Open this photo full screen" : undefined}
        style={{ display: "block", width: "100%", aspectRatio: "4 / 5", padding: 0, border: 0, borderRadius: 2, overflow: "hidden", background: `radial-gradient(circle at 50% 40%, ${sh.light}55, #FFF4F0)`, cursor: onOpen ? "zoom-in" : "default" }}
      >
        {m.photo ? <CroppedPhoto photo={m.photo} eager /> : <MiniRose color={m.color} />}
      </button>
      {m.caption && <p style={{ margin: "8px 0 0", font: `700 19px/1.15 ${FONTS.script}`, color: "#4a2a32", overflowWrap: "anywhere" }}>{m.caption}</p>}
      {m.note && <p style={{ margin: "4px 0 0", font: `400 13px/1.4 ${FONTS.ui}`, color: "#7a5a62", overflowWrap: "anywhere" }}>{m.note}</p>}
    </div>
  );
}
