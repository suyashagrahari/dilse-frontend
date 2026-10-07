"use client";

// The chalkboard Hug Menu (the sender's 4–6 hugs) and the Jhappi Passport.
// Tap a hug → a little stage where that hug is ONE short, distinct gesture:
//   pinch   — Bear Hug: pinch (or drag) them into a tight squeeze
//   behind  — Back Hug: drag one round behind the other
//   blanket — Sleepy Hug: SLOWLY swipe a blanket down over both ("dheere!")
//   twirl   — Twirl/Airport Hug: draw a circle around them, they spin
//   pat     — Comfort Hug: pat-pat-pat, three taps on the back
// Each finished hug stamps the passport. Every stage has "Do it for me".

import { useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FONTS, VW } from "../../../_valentine/theme";
import { burst, haptic, useReducedMotion } from "../../../_valentine/kit";
import { HeartPuffs, Pair, type Species } from "./Characters";
import { Btn, H, Hint, Title, clamp, sfx } from "./ui";

export type MenuItem = { name: string; line: string; price: string };
export type Gesture = "pinch" | "behind" | "blanket" | "twirl" | "pat";

const ORDER: Gesture[] = ["pinch", "behind", "blanket", "twirl", "pat"];
const RULES: [RegExp, Gesture][] = [
  [/back|peeche|piche|behind|surprise|cook|chai/i, "behind"],
  [/sleep|blanket|morning|nap|bed|5 minute|cuddle|razai/i, "blanket"],
  [/twirl|spin|airport|lift|gol|ghuma|reunion|welcome/i, "twirl"],
  [/pat|comfort|bad day|main hoon|sad|cry|okay/i, "pat"],
  [/bear|tight|squeeze|big|jaadu|jhappi/i, "pinch"],
];

export function assignGestures(menu: MenuItem[]): Gesture[] {
  const out: (Gesture | null)[] = menu.map(() => null);
  const used = new Set<Gesture>();
  menu.forEach((m, k) => {
    const hit = RULES.find(([re, g]) => !used.has(g) && re.test(`${m.name} ${m.line}`));
    if (hit) {
      out[k] = hit[1];
      used.add(hit[1]);
    }
  });
  menu.forEach((_, k) => {
    if (out[k]) return;
    const g = ORDER.find((o) => !used.has(o)) ?? ORDER[k % ORDER.length];
    out[k] = g;
    used.add(g);
  });
  return out as Gesture[];
}

export const GESTURE_ICON: Record<Gesture, string> = { pinch: "🐻", behind: "🤗", blanket: "😴", twirl: "💫", pat: "🤲" };
const GESTURE_HINT: Record<Gesture, string> = {
  pinch: "Pinch them together, tight! (or drag one in)",
  behind: "Drag the left one round behind the other →",
  blanket: "Slowly swipe the blanket down over them ↓",
  twirl: "Draw a circle around them with your finger ↻",
  pat: "Pat-pat-pat — tap their back three times",
};
const STAMP_INK = [H.cheek, "#7E5BC2", "#2F8F6B", "#D9822B", "#3D6FB6", H.cocoa];

/** A round rubber stamp. */
export function StampMark({ label, icon, color, size = 64 }: { label: string; icon: string; color: string; size?: number }) {
  const text = `${label.toUpperCase()} ✦ JHAPPI CAFÉ ✦ `;
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden style={{ display: "block", overflow: "visible" }}>
      <defs>
        <path id={`hm-c-${label.length}-${color.slice(1)}`} d="M50,50 m-35,0 a35,35 0 1,1 70,0 a35,35 0 1,1 -70,0" />
      </defs>
      <g opacity=".88">
        <circle cx="50" cy="50" r="46" fill="none" stroke={color} strokeWidth="4" strokeDasharray="1 0" />
        <circle cx="50" cy="50" r="25" fill="none" stroke={color} strokeWidth="2" />
        <text style={{ font: `700 9.5px ${FONTS.ui}`, letterSpacing: "1px" }} fill={color}>
          <textPath href={`#hm-c-${label.length}-${color.slice(1)}`} textLength="214" lengthAdjust="spacingAndGlyphs">
            {text}
          </textPath>
        </text>
        <text x="50" y="59" textAnchor="middle" style={{ fontSize: 24 }}>
          {icon}
        </text>
      </g>
    </svg>
  );
}

// ── One hug's stage ────────────────────────────────────────────────────────

function HugStage({ item, gesture, species, onDone, onBack }: { item: MenuItem; gesture: Gesture; species: [Species, Species]; onDone: () => void; onBack: () => void }) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  // shared gesture state
  const [gap, setGap] = useState(gesture === "pinch" ? 130 : gesture === "behind" ? 120 : 76);
  const [lx, setLx] = useState(120);
  const [blanket, setBlanket] = useState(0); // 0 → 1 (covering)
  const [spin, setSpin] = useState(0); // degrees accumulated
  const [pats, setPats] = useState<{ id: number; x: number; y: number }[]>([]);
  const ptrs = useRef(new Map<number, { x: number; y: number }>());
  const s = useRef<{ x: number; y: number; ly: number; t: number; gap: number; lx: number; d?: number; a?: number; b?: number; side?: "l" | "r" } | null>(null);

  const unit = () => {
    const r = ref.current?.getBoundingClientRect();
    return r && r.width ? 360 / r.width : 1;
  };
  const local = (e: React.PointerEvent) => {
    const r = ref.current!.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * 360, y: ((e.clientY - r.top) / r.height) * 280 };
  };

  const doneRef = useRef(false);
  const finish = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    setDone(true);
    ptrs.current.clear();
    s.current = null;
    if (gesture === "pinch") setGap(66);
    if (gesture === "behind") setLx(226);
    if (gesture === "blanket") setBlanket(1);
    if (gesture === "twirl") setSpin(0);
    haptic([40, 30, 80]);
    sfx.squish();
    window.setTimeout(() => {
      sfx.thump();
      haptic(30);
    }, reduced ? 0 : 520);
    const r = ref.current?.getBoundingClientRect();
    burst({ kind: "hearts", count: 18, spread: 0.25, origin: r ? { x: (r.left + r.width / 2) / window.innerWidth, y: (r.top + r.height * 0.4) / window.innerHeight } : undefined });
    window.setTimeout(onDone, reduced ? 900 : 1900);
  };

  const down = (e: React.PointerEvent) => {
    if (done) return;
    e.preventDefault();
    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
    ptrs.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const p = local(e);
    const all = [...ptrs.current.values()];
    s.current = {
      x: e.clientX,
      y: e.clientY,
      ly: e.clientY,
      t: performance.now(),
      gap,
      lx,
      d: all.length >= 2 ? Math.abs(all[0].x - all[1].x) || 1 : undefined,
      a: Math.atan2(p.y - 150, p.x - 180),
      b: blanket,
      side: p.x < 180 ? "l" : "r",
    };
    if (gesture === "pat") {
      const id = performance.now();
      setPats((ps) => [...ps.slice(-4), { id, x: p.x, y: p.y }]);
      const n = pats.length + 1;
      sfx.pop(0.9 + n * 0.12);
      haptic(12);
      if (n >= 3) window.setTimeout(finish, 250);
    }
  };
  const move = (e: React.PointerEvent) => {
    const st = s.current;
    if (done || !st || !ptrs.current.has(e.pointerId)) return;
    ptrs.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const u = unit();
    if (gesture === "pinch") {
      const all = [...ptrs.current.values()];
      let g: number;
      if (all.length >= 2 && st.d) g = (st.gap * Math.abs(all[0].x - all[1].x)) / st.d;
      else {
        const dx = (e.clientX - st.x) * u;
        g = st.gap - Math.max(0, st.side === "l" ? dx : -dx) * 1.2;
      }
      g = clamp(g, 60, 140);
      setGap(g);
      if (g <= 76) finish();
    } else if (gesture === "behind") {
      const v = clamp(st.lx + (e.clientX - st.x) * u, 60, 250);
      setLx(v);
      if (v >= 222) finish();
    } else if (gesture === "blanket") {
      const now = performance.now();
      const dy = (e.clientY - st.y) * u;
      const step = e.clientY - st.ly;
      const vel = step / Math.max(8, now - st.t); // css px per ms, downward
      st.t = now;
      st.ly = e.clientY;
      const b = clamp((st.b ?? 0) + dy / 170, 0, 1);
      if (vel > 1.3 || step > 60) {
        // too fast → the blanket flips back up
        s.current = null;
        setNote("Dheere! Neend toot jaayegi 😴");
        setBlanket(0);
        haptic(10);
        window.setTimeout(() => setNote(null), 1600);
        return;
      }
      setBlanket(b);
      if (b >= 0.98) finish();
    } else if (gesture === "twirl") {
      const p = local(e);
      const a = Math.atan2(p.y - 150, p.x - 180);
      let d = a - (st.a ?? a);
      if (d > Math.PI) d -= Math.PI * 2;
      if (d < -Math.PI) d += Math.PI * 2;
      st.a = a;
      setSpin((v) => {
        const n = v + (d * 180) / Math.PI;
        if (Math.abs(n) >= 360) window.setTimeout(finish, 0);
        return n;
      });
    }
  };
  const up = (e: React.PointerEvent) => {
    ptrs.current.delete(e.pointerId);
    if (done || ptrs.current.size) return;
    s.current = null;
    if (gesture === "pinch") setGap(130);
    if (gesture === "behind") setLx(120);
    if (gesture === "blanket" && blanket < 0.98) setBlanket((b) => (b > 0.6 ? b : 0));
  };

  // pose per gesture
  const pinchSq = gesture === "pinch" ? clamp((130 - gap) / 60, 0, 1) : 0;
  const rx = gesture === "behind" ? 240 : 180 + gap / 2;
  const leftX = gesture === "behind" ? lx : 180 - gap / 2;
  const hugging = done || gesture === "pat";
  const sleepy = gesture === "blanket" && blanket > 0.8;
  const lift = gesture === "twirl" ? Math.min(1, Math.abs(spin) / 60) : 0;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} style={{ width: "min(100%, 440px)", display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
      <div style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button type="button" onClick={onBack} style={{ minHeight: 44, padding: "6px 10px", border: 0, background: "transparent", color: VW.inkSoft, font: `600 14px ${FONTS.ui}`, cursor: "pointer" }}>
          ← Menu
        </button>
        <span style={{ font: `700 12px ${FONTS.ui}`, letterSpacing: ".14em", color: VW.inkSoft }}>{item.price ? `PRICE: ${item.price.toUpperCase()}` : ""}</span>
      </div>
      <h3 style={{ margin: 0, font: `700 32px/1.1 ${FONTS.script}`, color: VW.ink, overflowWrap: "anywhere" }}>
        {GESTURE_ICON[gesture]} {item.name}
      </h3>
      {item.line && <p style={{ margin: 0, maxWidth: 320, font: `italic 400 16px/1.4 ${FONTS.serif}`, color: VW.inkSoft, overflowWrap: "anywhere" }}>“{item.line}”</p>}

      <div
        ref={ref}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "360 / 280",
          borderRadius: 26,
          overflow: "hidden",
          background: gesture === "blanket" ? "linear-gradient(180deg, #E9DEFF, #FFE7EE)" : "linear-gradient(180deg, #FFF6EC, #FFE3D6)",
          boxShadow: "inset 0 0 0 3px rgba(107,66,50,.12), 0 20px 40px -26px rgba(107,66,50,.6)",
          touchAction: "none",
          userSelect: "none",
          cursor: done ? "default" : "pointer",
        }}
      >
        <svg viewBox="0 0 360 280" width="100%" height="100%" aria-hidden style={{ display: "block" }}>
          {/* little room: window + rug */}
          <rect x="250" y="26" width="76" height="62" rx="8" fill={gesture === "blanket" ? "#2E3A6B" : "#CFE9FF"} stroke={H.cocoa} strokeWidth="3" />
          <path d="M288 26 V88 M250 57 H326" stroke={H.cocoa} strokeWidth="2.5" />
          {gesture === "blanket" && <circle cx="306" cy="44" r="8" fill="#FFF3D1" />}
          <ellipse cx="180" cy="250" rx="150" ry="20" fill={gesture === "blanket" ? "#D9C8F7" : "#FFD3BF"} />

          {gesture === "twirl" && !done && (
            <g opacity=".55">
              <circle cx="180" cy="150" r="118" fill="none" stroke={H.strawberry} strokeWidth="3" strokeDasharray="6 9" />
              <motion.path d="M298 150 l-8 -12 M298 150 l10 -10" stroke={H.strawberry} strokeWidth="3" strokeLinecap="round" />
              <circle cx="180" cy="150" r="118" fill="none" stroke={H.cheek} strokeWidth="4" strokeDasharray={`${(Math.min(360, Math.abs(spin)) / 360) * 741} 741`} transform="rotate(-90 180 150)" />
            </g>
          )}

          {/* the twirl: the pair turns on the spot (scaleX = cos) and lifts */}
          <motion.g
            animate={{ scaleX: gesture === "twirl" && !done ? Math.cos((spin * Math.PI) / 180) || 0.02 : 1, y: -lift * 18, rotate: gesture === "twirl" && !done ? Math.sin((spin * Math.PI) / 180) * 6 : 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
            style={{ originX: 0.5, originY: 1 }}
          >
            <Pair
              species={species}
              lx={leftX}
              rx={rx}
              ground={236}
              leftY={gesture === "behind" ? -clamp((lx - 160) / 2.6, 0, 24) : 0}
              left={{ squish: pinchSq, hugging: hugging || (gesture === "behind" && lx > 200), reach: gesture === "behind" ? 34 : 60, armDrop: gesture === "behind" ? 20 : 0, happy: done || pinchSq > 0.5, sleepy }}
              right={{ squish: pinchSq, hugging: hugging && gesture !== "behind", reach: 60, happy: done, sleepy }}
            />
          </motion.g>

          {/* pats */}
          {pats.map((p) => (
            <motion.g key={p.id} initial={{ opacity: 1, y: 0, scale: 0.6 }} animate={{ opacity: 0, y: -30, scale: 1.2 }} transition={{ duration: 0.9 }}>
              <text x={p.x} y={p.y} textAnchor="middle" style={{ font: `700 18px ${FONTS.ui}` }} fill={H.cheek}>
                pat!
              </text>
            </motion.g>
          ))}

          {/* the blanket */}
          {gesture === "blanket" && (
            <g transform={`translate(0 ${-112 + blanket * 282})`}>
              <path d="M8 0 H352 V140 Q330 156 306 142 Q282 158 258 142 Q234 158 210 142 Q186 158 162 142 Q138 158 114 142 Q90 158 66 142 Q42 158 18 142 Q8 146 8 140 Z" fill={H.lavender} stroke={H.cocoa} strokeWidth="3" />
              {[0, 1, 2, 3].map((k) => (
                <rect key={k} x={24 + k * 82} y="16" width="64" height="104" rx="8" fill={k % 2 ? "#E6DAFF" : "#FFE1EA"} stroke="#fff" strokeWidth="2" strokeDasharray="4 4" />
              ))}
              <path d="M150 60 C140 52 140 44 146 43 C149 42.5 151 45 151 47 C151 45 153 42.5 156 43 C162 44 162 52 151 60 Z" fill={H.cheek} />
              {!done && blanket < 0.1 && (
                <text x="180" y="132" textAnchor="middle" style={{ font: `700 12px ${FONTS.ui}` }} fill={H.cocoa}>
                  pull me down ↓
                </text>
              )}
            </g>
          )}
          {sleepy && !reduced && (
            <motion.text x="250" y="120" animate={{ y: [120, 96], opacity: [0, 1, 0] }} transition={{ duration: 2, repeat: Infinity }} style={{ font: `700 18px ${FONTS.ui}` }} fill={H.cocoa}>
              z z z
            </motion.text>
          )}
          <HeartPuffs x={180} y={90} n={4} on={done && !reduced} />
        </svg>

        {/* the stamp lands */}
        <AnimatePresence>
          {done && (
            <motion.div
              initial={reduced ? { opacity: 0 } : { scale: 2.6, opacity: 0, rotate: -30 }}
              animate={{ scale: 1, opacity: 1, rotate: -12 }}
              transition={{ delay: reduced ? 0 : 0.45, type: "spring", stiffness: 420, damping: 20 }}
              style={{ position: "absolute", right: 12, top: 12, pointerEvents: "none" }}
            >
              <StampMark label={item.name} icon={GESTURE_ICON[gesture]} color={H.cheek} size={92} />
            </motion.div>
          )}
        </AnimatePresence>
        {gesture === "pat" && !done && (
          <div aria-hidden style={{ position: "absolute", left: 0, right: 0, bottom: 12, display: "flex", justifyContent: "center", gap: 8 }}>
            {[0, 1, 2].map((k) => (
              <span key={k} style={{ width: 12, height: 12, borderRadius: 9, background: k < pats.length ? H.cheek : "rgba(107,66,50,.18)", transition: "background .2s" }} />
            ))}
          </div>
        )}
      </div>

      <div style={{ minHeight: 92, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
        {done ? (
          <p style={{ margin: 0, font: `700 19px ${FONTS.ui}`, color: VW.accentDeep }}>Stamped in your Jhappi Passport ✓</p>
        ) : (
          <>
            <Hint>{note ?? GESTURE_HINT[gesture]}</Hint>
            <button type="button" onClick={finish} style={{ minHeight: 44, padding: "8px 16px", border: 0, background: "transparent", color: VW.accentDeep, font: `600 14px ${FONTS.ui}`, textDecoration: "underline", textUnderlineOffset: 4, cursor: "pointer" }}>
              Do it for me 🤗
            </button>
          </>
        )}
      </div>
    </motion.div>
  );
}

// ── The menu + passport ────────────────────────────────────────────────────

export default function HugMenu({
  menu,
  species,
  recipient,
  stamped,
  onStamp,
  sticker,
  onNext,
}: {
  menu: MenuItem[];
  species: [Species, Species];
  recipient: string;
  stamped: number[];
  onStamp: (k: number) => void;
  sticker: React.ReactNode;
  onNext: () => void;
}) {
  const reduced = useReducedMotion();
  const gestures = useMemo(() => assignGestures(menu), [menu]);
  const [open, setOpen] = useState<number | null>(null);
  const all = stamped.length >= menu.length;
  const slot = menu.length > 4 ? 36 : 44;

  return (
    <>
      <Title>The Hug Menu</Title>
      <p style={{ margin: "-6px 0 0", font: `600 14px ${FONTS.ui}`, color: VW.inkSoft }}>Order every hug to fill {recipient}&apos;s Jhappi Passport</p>

      {/* passport strip */}
      <div style={{ width: "min(100%, 420px)", padding: "10px 12px", borderRadius: 16, background: "linear-gradient(135deg, #8E3B4E, #6B2A3A)", boxShadow: "0 14px 28px -18px rgba(74,44,32,.8)", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ textAlign: "left", flex: "none" }}>
          <p style={{ margin: 0, font: `800 10px ${FONTS.ui}`, letterSpacing: ".2em", color: H.butter }}>JHAPPI</p>
          <p style={{ margin: 0, font: `800 10px ${FONTS.ui}`, letterSpacing: ".2em", color: H.butter }}>PASSPORT</p>
          <p style={{ margin: "2px 0 0", font: `600 11px ${FONTS.ui}`, color: "#FFD3DE" }} aria-live="polite">
            {stamped.length}/{menu.length}
          </p>
        </div>
        <div style={{ flex: 1, display: "flex", flexWrap: "wrap", gap: menu.length > 4 ? 4 : 6, justifyContent: "flex-end" }}>
          {menu.map((m, k) => (
            <div key={k} style={{ width: slot, height: slot, borderRadius: slot / 2, background: "#FFF6EC", display: "grid", placeItems: "center", boxShadow: "inset 0 0 0 2px rgba(107,66,50,.15)" }}>
              {stamped.includes(k) ? (
                <motion.div initial={reduced ? false : { scale: 2, opacity: 0, rotate: -40 }} animate={{ scale: 1, opacity: 1, rotate: (k % 3) * 9 - 9 }} transition={{ type: "spring", stiffness: 400, damping: 18 }}>
                  <StampMark label={m.name} icon={GESTURE_ICON[gestures[k]]} color={STAMP_INK[k % STAMP_INK.length]} size={slot - 4} />
                </motion.div>
              ) : (
                <span style={{ font: `700 13px ${FONTS.ui}`, color: "rgba(107,66,50,.35)" }}>{k + 1}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {open == null ? (
          <motion.div key="board" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} style={{ position: "relative", width: "min(100%, 420px)" }}>
            <div style={{ position: "absolute", right: -8, top: -46, zIndex: 2, pointerEvents: "none" }}>{sticker}</div>
            {/* chalkboard in a wooden frame */}
            <div style={{ padding: 10, borderRadius: 18, background: `linear-gradient(135deg, #B07A4C, ${H.wood} 50%, #7E5233)`, boxShadow: "0 24px 44px -26px rgba(74,44,32,.85)" }}>
              <div
                style={{
                  borderRadius: 10,
                  padding: "18px 14px 14px",
                  background: `radial-gradient(circle at 30% 20%, #4A4943 0%, ${H.chalk} 60%, #2E2D2A 100%)`,
                  color: "#F7F2E8",
                  textAlign: "left",
                  boxShadow: "inset 0 0 30px rgba(0,0,0,.35)",
                }}
              >
                <p style={{ margin: "0 0 2px", textAlign: "center", font: `700 30px/1 ${FONTS.script}`, color: "#FFF6E0", textShadow: "0 0 1px rgba(255,255,255,.6)" }}>Today&apos;s Jhappis</p>
                <p style={{ margin: "0 0 12px", textAlign: "center", font: `600 11px ${FONTS.ui}`, letterSpacing: ".24em", color: "rgba(247,242,232,.6)" }}>~ SERVED WARM ~</p>
                <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 4 }}>
                  {menu.map((m, k) => {
                    const done = stamped.includes(k);
                    return (
                      <li key={k}>
                        <motion.button
                          type="button"
                          onClick={() => {
                            haptic(8);
                            sfx.pop(1);
                            setOpen(k);
                          }}
                          whileTap={{ scale: 0.97 }}
                          style={{ width: "100%", minHeight: 56, padding: "8px 10px", border: 0, borderRadius: 10, background: done ? "rgba(255,255,255,.06)" : "transparent", color: "inherit", textAlign: "left", cursor: "pointer", display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 10, alignItems: "center" }}
                        >
                          <span style={{ fontSize: 22 }}>{done ? "✅" : GESTURE_ICON[gestures[k]]}</span>
                          <span style={{ minWidth: 0 }}>
                            <span style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                              <span style={{ font: `700 18px/1.2 ${FONTS.ui}`, color: done ? "rgba(255,246,224,.6)" : "#FFF6E0", textDecoration: done ? "line-through" : "none", overflowWrap: "anywhere" }}>{m.name}</span>
                              <span aria-hidden style={{ flex: 1, borderBottom: "2px dotted rgba(247,242,232,.35)", transform: "translateY(-4px)", minWidth: 12 }} />
                            </span>
                            {m.line && <span style={{ display: "block", font: `400 13px/1.35 ${FONTS.ui}`, color: "rgba(247,242,232,.72)", overflowWrap: "anywhere" }}>{m.line}</span>}
                          </span>
                          <span style={{ font: `600 13px ${FONTS.ui}`, color: H.butter, whiteSpace: "nowrap", maxWidth: 96, overflow: "hidden", textOverflow: "ellipsis" }}>{m.price}</span>
                        </motion.button>
                      </li>
                    );
                  })}
                </ul>
                <p style={{ margin: "10px 0 0", textAlign: "center", font: `400 12px ${FONTS.ui}`, color: "rgba(247,242,232,.55)" }}>chalk doodle: ♡ no hug is too small ♡</p>
              </div>
            </div>
          </motion.div>
        ) : (
          <HugStage
            key={`stage-${open}`}
            item={menu[open]}
            gesture={gestures[open]}
            species={species}
            onBack={() => setOpen(null)}
            onDone={() => {
              const k = open;
              onStamp(k);
              setOpen(null);
              if (stamped.length + (stamped.includes(k) ? 0 : 1) >= menu.length) {
                window.setTimeout(() => {
                  sfx.chime();
                  burst({ kind: "confetti", origin: { x: 0.5, y: 0.25 } });
                }, 300);
              }
            }}
          />
        )}
      </AnimatePresence>

      {open == null && (
        <div style={{ minHeight: 70, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
          {all ? (
            <>
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                style={{ maxWidth: 340, padding: "12px 16px", borderRadius: 14, background: "#FFF6EC", border: `2px dashed ${H.cheek}`, font: `600 15px/1.45 ${FONTS.ui}`, color: VW.ink }}
              >
                🎁 Passport complete! Bonus unlocked: <b>one surprise jhappi</b>, delivered in person. No expiry.
              </motion.div>
              <Btn onClick={onNext}>There&apos;s something in the hoodie pocket →</Btn>
            </>
          ) : (
            <>
              <Hint>Tap a hug to order it ☕</Hint>
              {stamped.length > 0 && (
                <button type="button" onClick={onNext} style={{ minHeight: 44, padding: "8px 16px", border: 0, background: "transparent", color: VW.inkSoft, font: `600 13px ${FONTS.ui}`, textDecoration: "underline", textUnderlineOffset: 4, cursor: "pointer" }}>
                  skip ahead to the letter
                </button>
              )}
            </>
          )}
        </div>
      )}
    </>
  );
}
