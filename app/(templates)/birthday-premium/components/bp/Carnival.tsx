"use client";

// Scenes 4–6, the carnival in the middle of the book: the claw machine (every
// capsule a reason I love you), the photo booth (a strip that develops while
// they shake it) and the bakery (stack the tiers, frost, sprinkle, topper).

import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CroppedPhoto, burst, haptic, useReducedMotion } from "../../../_valentine/kit";
import type { BpFrosting } from "../../../_valentine/days/birthday-premium";
import type { LovePhoto } from "../../../_valentine/types";
import { FONTS } from "../../../_valentine/theme";
import { Capsule, Claw } from "./art";
import { BP_DISPLAY, BP_HAND } from "./fonts";
import { useBp, useNext } from "./stage";
import { Head } from "./ui";

// ─── 4 · The claw machine ───────────────────────────────────────────────────

type ClawPhase = "idle" | "drop" | "grab" | "lift" | "carry" | "release";

export function ClawMachine({ reasons, pops, sticker, onNext }: { reasons: readonly string[]; pops: readonly string[]; sticker: ReactNode; onNext: () => void }) {
  const reduced = useReducedMotion();
  const { cue } = useBp();
  const n = reasons.length;
  // The pile: two rows along the floor, clear of the prize chute on the left.
  const spots = useMemo(
    () =>
      reasons.map((_, k) => {
        const row = k % 2;
        const col = Math.floor(k / 2);
        const cols = Math.ceil(n / 2);
        const x = 40 + (cols > 1 ? (col / (cols - 1)) * 44 : 24) + (row ? 6 : -2);
        return { x: Math.min(90, x), y: row ? 74 : 84, rot: ((k * 47) % 50) - 25 };
      }),
    [reasons, n],
  );
  const [x, setX] = useState(60);
  const [y, setY] = useState(4);
  const [phase, setPhase] = useState<ClawPhase>("idle");
  const [carry, setCarry] = useState<number | null>(null);
  const [won, setWon] = useState<number[]>([]);
  const [prize, setPrize] = useState<number | null>(null);
  const timers = useRef<number[]>([]);
  const glass = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const ts = timers.current;
    return () => ts.forEach((t) => window.clearTimeout(t));
  }, []);
  const later = (ms: number, fn: () => void) => timers.current.push(window.setTimeout(fn, reduced ? Math.min(ms, 120) : ms));
  const busy = phase !== "idle" || prize !== null;
  const left = reasons.map((_, k) => k).filter((k) => !won.includes(k) && k !== carry);

  const nudge = (dx: number) => {
    if (busy) return;
    haptic(6);
    cue("tick", { gain: 0.3 });
    setX((v) => Math.max(14, Math.min(90, v + dx)));
  };
  const steer = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (busy || (e.pointerType === "mouse" && e.buttons === 0 && e.type === "pointermove")) return;
    const r = glass.current?.getBoundingClientRect();
    if (!r) return;
    setX(Math.max(14, Math.min(90, ((e.clientX - r.left) / r.width) * 100)));
  };

  const grab = () => {
    if (busy || !left.length) return;
    haptic(14);
    cue("whoosh", { gain: 0.35 });
    // The claw is generous today: it always comes up with the capsule nearest to it.
    const target = left.reduce((b, k) => (Math.abs(spots[k].x - x) < Math.abs(spots[b].x - x) ? k : b), left[0]);
    setPhase("drop");
    setX(spots[target].x);
    setY(spots[target].y - 16);
    later(760, () => {
      setPhase("grab");
      cue("snap", { gain: 0.5 });
      haptic(18);
      setCarry(target);
    });
    later(1080, () => {
      setPhase("lift");
      setY(4);
    });
    later(1800, () => {
      setPhase("carry");
      setX(8);
    });
    later(2500, () => {
      setPhase("release");
      cue("pop", { gain: 0.6 });
    });
    later(2950, () => {
      setCarry(null);
      setWon((w) => [...w, target]);
      setPrize(target);
      setPhase("idle");
      cue("chime-cascade", { gain: 0.55 });
      haptic(24);
      burst({ kind: "confetti", colors: [...pops], origin: { x: 0.5, y: 0.5 }, count: 40, spread: 0.5 });
    });
  };

  const need = Math.min(3, n);
  const enough = won.length >= need;
  useNext(enough && prize === null ? "Next chapter" : null, onNext, "photo");
  const closed = phase === "grab" || phase === "lift" || phase === "carry";
  const speed = phase === "drop" ? ".7s" : phase === "lift" ? ".65s" : phase === "carry" ? ".65s" : ".25s";

  return (
    <>
      <style>{CLAW_CSS}</style>
      <Head kicker="Chapter four · the carnival" title="The Love Claw" sub={won.length ? `Prizes won: ${won.length} of ${n} 🧸` : "Every capsule holds a reason I love you"} />
      <div className="bp-fill">
        <div className="bp-claw" data-bp-claw>
          <div className="bp-claw-top">
            <span className="bp-claw-bulbs" aria-hidden>
              {Array.from({ length: 9 }, (_, k) => (
                <i key={k} style={{ animationDelay: `${-k * 0.15}s` }} />
              ))}
            </span>
            <b>LOVE CLAW</b>
          </div>
          <div ref={glass} className="bp-claw-glass" onPointerDown={steer} onPointerMove={steer} data-bp-glass>
            <span className="bp-claw-rail" aria-hidden />
            <span className="bp-claw-chute" aria-hidden>
              <i>PRIZE</i>
            </span>
            <span className="bp-claw-fluff" aria-hidden>
              {["🧸", "⭐", "💗", "🎀", "🌼", "⭐", "💗", "🧸", "🎀"].map((e, k) => (
                <i key={k} style={{ left: `${24 + k * 9}%`, rotate: `${((k * 41) % 50) - 25}deg` }}>
                  {e}
                </i>
              ))}
            </span>
            {reasons.map((_, k) =>
              won.includes(k) || k === carry ? null : (
                <span key={k} className="bp-cap" style={{ left: `${spots[k].x}%`, top: `${spots[k].y}%`, rotate: `${spots[k].rot}deg` }} aria-hidden>
                  <Capsule color={pops[k % pops.length]} />
                </span>
              ),
            )}
            <span className="bp-claw-arm" style={{ left: `${x}%`, transitionDuration: speed }} aria-hidden>
              <span className="bp-claw-cable" style={{ height: `calc(${y}% + 6px)`, transitionDuration: speed }} />
              <span className="bp-claw-head" style={{ top: `${y}%`, transitionDuration: speed }}>
                <Claw closed={closed} />
                {carry !== null && (
                  <span className={`bp-cap bp-cap-held${phase === "release" ? " is-drop" : ""}`}>
                    <Capsule color={pops[carry % pops.length]} />
                  </span>
                )}
              </span>
            </span>
            {won.length > 0 && <span className="bp-claw-gif">{sticker}</span>}
          </div>
          <div className="bp-claw-pad">
            <button type="button" className="bp-claw-dir" onClick={() => nudge(-12)} disabled={busy} aria-label="Move the claw left">
              ◀
            </button>
            <button type="button" className="bp-claw-go" onClick={grab} disabled={busy || !left.length} data-bp-grab>
              {left.length ? "GRAB!" : "ALL WON 💗"}
            </button>
            <button type="button" className="bp-claw-dir" onClick={() => nudge(12)} disabled={busy} aria-label="Move the claw right">
              ▶
            </button>
          </div>
        </div>
        <AnimatePresence>
          {prize !== null && (
            <motion.div key={prize} className="bp-prize" role="dialog" aria-label="Your prize" initial={reduced ? false : { opacity: 0, scale: 0.6, rotate: -6 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} exit={reduced ? undefined : { opacity: 0, scale: 0.8 }} transition={{ type: "spring", stiffness: 220, damping: 16 }} data-bp-prize>
              <span className="bp-prize-cap" aria-hidden>
                <Capsule color={pops[prize % pops.length]} open />
              </span>
              <span className="bp-prize-k">Reason #{prize + 1}</span>
              <p className="bp-prize-t">{reasons[prize]}</p>
              <button
                type="button"
                className="bp-btn"
                onClick={() => {
                  haptic(10);
                  setPrize(null);
                }}
                autoFocus
                data-bp-keep
              >
                {won.length >= n ? "Aww 💗" : "Keep playing 🧸"}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <p className="bp-hint">{busy ? " " : won.length >= n ? "You won every single one 💗" : enough ? "Keep playing for more love 🧸" : "Steer the claw, then GRAB"}</p>
    </>
  );
}

const CLAW_CSS = `
.bp-claw { position: relative; width: min(88cqw, 74cqh, 360px); height: min(100%, calc(min(88cqw, 74cqh, 360px) * 1.32)); display: flex; flex-direction: column; border-radius: 26px 26px 18px 18px; padding: 0 10px 10px; box-sizing: border-box;
  background: linear-gradient(180deg, var(--vw-accent), var(--vw-accent-deep)); box-shadow: inset 0 0 0 3px rgba(255,255,255,.35), 0 8px 0 var(--bp-deep), 0 24px 40px -20px color-mix(in srgb, var(--bp-deep) 70%, transparent); }
.bp-claw-top { flex: none; display: grid; place-items: center; gap: 2px; padding: 8px 0 6px; }
.bp-claw-top b { font: 800 clamp(16px, 2.6dvh, 20px)/1 ${BP_DISPLAY}; letter-spacing: .14em; color: #FFFFFF; text-shadow: 0 2px 0 var(--bp-deep); }
.bp-claw-bulbs { display: flex; gap: 8px; }
.bp-claw-bulbs i { width: 7px; height: 7px; border-radius: 50%; background: var(--vw-gold); box-shadow: 0 0 6px var(--vw-gold); animation: bp-bulb .9s steps(2) infinite; }
@keyframes bp-bulb { 50% { opacity: .35 } }
.bp-claw-glass { position: relative; flex: 1 1 0; min-height: 0; border-radius: 16px; overflow: hidden; touch-action: none; cursor: ew-resize;
  background: linear-gradient(160deg, rgba(255,255,255,.55) 0 18%, transparent 18% 22%, rgba(255,255,255,.25) 22% 26%, transparent 26%), linear-gradient(180deg, var(--bp-blush), var(--vw-paper));
  box-shadow: inset 0 0 0 3px rgba(255,255,255,.7), inset 0 -26px 0 color-mix(in srgb, var(--vw-gold) 35%, #FFFFFF); }
.bp-claw-rail { position: absolute; left: 6px; right: 6px; top: 6px; height: 6px; border-radius: 4px; background: #C9CED8; box-shadow: inset 0 -2px 0 #8A93A3; }
.bp-claw-chute { position: absolute; left: 0; bottom: 0; width: 22%; height: 32%; display: grid; place-items: start center; padding-top: 8px; box-sizing: border-box; z-index: 1;
  background: linear-gradient(180deg, color-mix(in srgb, var(--vw-accent-deep) 55%, #FFF), var(--vw-accent-deep)); border-top-right-radius: 14px; box-shadow: inset -3px 3px 0 rgba(255,255,255,.55), inset 0 -16px 18px -8px rgba(0,0,0,.25); }
.bp-claw-chute i { padding: 2px 6px; border-radius: 6px; background: var(--vw-gold); font: 800 9.5px ${FONTS.ui}; letter-spacing: .1em; color: var(--vw-ink); font-style: normal; }
.bp-claw-fluff { position: absolute; left: 0; right: 0; bottom: 0; height: 13%; background: radial-gradient(60% 100% at 30% 100%, color-mix(in srgb, var(--vw-gold) 40%, #FFF) 98%, transparent), radial-gradient(60% 100% at 80% 100%, color-mix(in srgb, var(--bp-second) 40%, #FFF) 98%, transparent); }
.bp-claw-fluff i { position: absolute; bottom: 18%; font-style: normal; font-size: clamp(16px, 6cqw, 22px); line-height: 1; }
.bp-cap { position: absolute; z-index: 2; width: clamp(40px, 14cqw, 56px); transform: translate(-50%, -50%); filter: drop-shadow(0 4px 4px rgba(0,0,0,.12)); }
.bp-claw-arm { position: absolute; top: 8px; bottom: 0; width: 0; transition-property: left; transition-timing-function: cubic-bezier(.45,.05,.3,1); }
.bp-claw-cable { position: absolute; left: -1px; top: 0; width: 2px; background: #8A93A3; transition-property: height; transition-timing-function: cubic-bezier(.45,.05,.3,1); }
.bp-claw-head { position: absolute; z-index: 3; left: 0; width: clamp(46px, 17cqw, 66px); transform: translateX(-50%); transition-property: top; transition-timing-function: cubic-bezier(.45,.05,.3,1); }
.bp-cap-held { left: 50%; top: 82%; transform: translate(-50%, 0); }
.bp-cap-held.is-drop { animation: bp-cap-drop .4s ease-in forwards; }
@keyframes bp-cap-drop { to { transform: translate(-50%, 260%); opacity: 0 } }
.bp-claw-gif { position: absolute; right: 6px; top: 16px; pointer-events: none; }
.bp-claw-gif .bp-stk { transform: rotate(6deg); }
.bp-claw-gif .bp-stk img { width: clamp(50px, 17cqw, 76px) !important; height: auto !important; }
.bp-claw-pad { flex: none; display: flex; align-items: center; justify-content: center; gap: 12px; padding-top: 10px; }
.bp-claw-dir { width: 48px; height: 48px; border-radius: 50%; border: 0; cursor: pointer; touch-action: manipulation; font: 800 18px ${FONTS.ui}; color: var(--vw-accent-deep); background: radial-gradient(circle at 40% 35%, #FFFFFF, var(--bp-blush)); box-shadow: 0 4px 0 var(--bp-deep); }
.bp-claw-go { min-width: 120px; height: 52px; border-radius: 99px; border: 0; cursor: pointer; touch-action: manipulation; font: 800 19px ${BP_DISPLAY}; letter-spacing: .06em; color: var(--vw-ink);
  background: radial-gradient(circle at 45% 30%, #FFFFFF, var(--vw-gold) 70%); box-shadow: 0 5px 0 color-mix(in srgb, var(--vw-gold) 60%, #8A5A00), 0 0 0 3px rgba(255,255,255,.7); }
.bp-claw-dir:active:not(:disabled), .bp-claw-go:active:not(:disabled) { transform: translateY(3px); box-shadow: none; }
.bp-claw-dir:disabled, .bp-claw-go:disabled { opacity: .55; cursor: default; }
.bp-claw-dir:focus-visible, .bp-claw-go:focus-visible { outline: 3px solid #FFFFFF; outline-offset: 3px; }
.bp-prize { position: absolute; z-index: 5; width: min(86%, 330px); display: grid; gap: 6px; justify-items: center; padding: 30px 18px 16px; border-radius: 24px; background: var(--vw-paper); text-align: center;
  box-shadow: 0 0 0 3px var(--vw-gold), 0 0 0 8px color-mix(in srgb, var(--vw-paper) 70%, transparent), 0 30px 50px -20px color-mix(in srgb, var(--bp-deep) 70%, transparent); }
.bp-prize-cap { position: absolute; top: -30px; width: 60px; }
.bp-prize-k { font: 700 11px ${FONTS.ui}; letter-spacing: .16em; text-transform: uppercase; color: var(--vw-accent-deep); }
.bp-prize-t { margin: 0; font: 400 clamp(22px, 3.3dvh, 27px)/1.2 ${BP_HAND}; color: var(--vw-ink); overflow-wrap: anywhere; }
@media (prefers-reduced-motion: reduce) { .bp-claw-bulbs i { animation: none; } }
@media (min-width: 1100px) { .bp-claw { width: min(80cqw, 74cqh, 400px); } }
`;

// ─── 5 · The photo booth ────────────────────────────────────────────────────

export function PhotoBooth({ photos, placeholders, recipient, sender, pops, onNext }: { photos: LovePhoto[]; placeholders: number; recipient: string; sender: string; pops: readonly string[]; onNext: () => void }) {
  const reduced = useReducedMotion();
  const { cue } = useBp();
  const [phase, setPhase] = useState<"booth" | "shoot" | "strip">("booth");
  const [count, setCount] = useState(3);
  const [flash, setFlash] = useState(0);
  const [dev, setDev] = useState(0);
  const [lean, setLean] = useState(0);
  const [open, setOpen] = useState<number | null>(null);
  const frames = useMemo<(LovePhoto | null)[]>(() => [...Array.from({ length: placeholders }, () => null), ...photos], [photos, placeholders]);
  const strips = frames.length > 4 ? [frames.slice(0, Math.ceil(frames.length / 2)), frames.slice(Math.ceil(frames.length / 2))] : [frames];
  const per = Math.max(...strips.map((s) => s.length));
  const today = useMemo(() => new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }), []);
  const timers = useRef<number[]>([]);
  useEffect(() => {
    const ts = timers.current;
    return () => ts.forEach((t) => window.clearTimeout(t));
  }, []);
  const later = (ms: number, fn: () => void) => timers.current.push(window.setTimeout(fn, ms));

  const shoot = () => {
    if (phase !== "booth") return;
    haptic(12);
    setPhase("shoot");
    if (reduced) {
      setPhase("strip");
      setDev(1);
      return;
    }
    cue("tick", { gain: 0.4 });
    later(700, () => {
      setCount(2);
      cue("tick", { gain: 0.4 });
    });
    later(1400, () => {
      setCount(1);
      cue("tick", { gain: 0.4 });
    });
    const shots = Math.min(4, frames.length);
    for (let k = 0; k < shots; k++)
      later(2100 + k * 380, () => {
        setFlash((f) => f + 1);
        cue("snap", { gain: 0.6 });
        haptic(10);
      });
    later(2100 + shots * 380 + 300, () => {
      setPhase("strip");
      cue("paper-rustle", { gain: 0.6 });
    });
  };

  // It develops slowly on its own; shaking it (dragging side to side) is faster.
  useEffect(() => {
    if (phase !== "strip" || dev >= 1) return;
    const t = window.setTimeout(() => setDev((d) => Math.min(1, d + 0.035)), 260);
    return () => window.clearTimeout(t);
  }, [phase, dev]);
  const lastX = useRef<number | null>(null);
  const shake = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (phase !== "strip" || (e.pointerType === "mouse" && e.buttons === 0)) {
      lastX.current = null;
      return;
    }
    if (lastX.current !== null) {
      const dx = e.clientX - lastX.current;
      setLean((l) => Math.max(-10, Math.min(10, l * 0.7 + dx * 0.35)));
      setDev((d) => Math.min(1, d + Math.abs(dx) / 700));
    }
    lastX.current = e.clientX;
  };
  const developed = dev >= 1;
  useEffect(() => {
    if (developed) {
      cue("sparkle", { gain: 0.5 });
      haptic(16);
    }
  }, [developed, cue]);

  useNext(phase === "strip" && developed && open === null ? "Next chapter" : null, onNext, "cake");

  return (
    <>
      <style>{BOOTH_CSS}</style>
      <Head
        kicker="Chapter five · say cheese"
        title={phase === "strip" ? (developed ? "Look at us 🥹" : "Shake it to develop!") : "The photo booth"}
        sub={phase === "strip" ? (developed ? "Tap a photo to see it bigger" : "Drag the strip side to side 📸") : "Step in, strike a pose"}
      />
      <div className="bp-fill" style={{ ["--k" as string]: per }}>
        <AnimatePresence mode="wait" initial={false}>
          {phase !== "strip" ? (
            <motion.div key="booth" className="bp-booth" exit={reduced ? undefined : { opacity: 0, y: -30, scale: 0.9 }} transition={{ duration: 0.3 }} data-bp-booth>
              <span className="bp-booth-sign">PHOTO BOOTH</span>
              <span className="bp-booth-curtain" style={{ ["--c1" as string]: pops[0], ["--c2" as string]: pops[1] }}>
                {phase === "shoot" && (
                  <span key={count} className="bp-booth-count" aria-live="assertive">
                    {count}
                  </span>
                )}
              </span>
              <span className="bp-booth-slot" aria-hidden />
              <button type="button" className="bp-btn bp-booth-go" onClick={shoot} disabled={phase !== "booth"} data-bp-shoot>
                📸 Strike a pose
              </button>
              {flash > 0 && <span key={flash} className="bp-flash" aria-hidden />}
            </motion.div>
          ) : (
            <motion.div key="strip" className="bp-strips" onPointerMove={shake} onPointerDown={(e) => (lastX.current = e.clientX)} onPointerUp={() => setLean(0)} onPointerLeave={() => setLean(0)} style={{ ["--dev" as string]: dev }} data-bp-strips>
              {strips.map((s, si) => (
                <motion.div
                  key={si}
                  className="bp-strip"
                  initial={reduced ? false : { y: "-60%", opacity: 0 }}
                  animate={{ y: 0, opacity: 1, rotate: lean + (strips.length > 1 ? (si ? 3 : -3) : 0) }}
                  transition={{ y: { type: "spring", stiffness: 70, damping: 14, delay: si * 0.25 }, rotate: { type: "spring", stiffness: 300, damping: 12 } }}
                >
                  {s.map((p, k) => {
                    const idx = (si ? strips[0].length : 0) + k;
                    return (
                      <button key={k} type="button" className="bp-frame" onClick={() => developed && p && setOpen(idx)} disabled={!developed || !p} aria-label={p?.caption ? `Photo: ${p.caption}` : `Photo ${idx + 1}`}>
                        {p ? <CroppedPhoto photo={p} eager={idx < 3} /> : <span className="bp-frame-ph">📸</span>}
                      </button>
                    );
                  })}
                  <span className="bp-strip-foot">
                    {si === 0 ? `${recipient} & ${sender}` : today}
                    <i>✦</i>
                  </span>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {open !== null && frames[open] && (
            <motion.div key="lb" className="bp-lb" initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={reduced ? undefined : { opacity: 0 }} onClick={() => setOpen(null)} role="dialog" aria-label="Photo">
              <motion.figure className="bp-lb-card" initial={reduced ? false : { scale: 0.8, rotate: -4 }} animate={{ scale: 1, rotate: -1.5 }} transition={{ type: "spring", stiffness: 220, damping: 18 }}>
                <div className="bp-lb-img">
                  <CroppedPhoto photo={frames[open]!} eager />
                </div>
                <figcaption>
                  {frames[open]!.caption && <b>{frames[open]!.caption}</b>}
                  {frames[open]!.note && <span>{frames[open]!.note}</span>}
                </figcaption>
              </motion.figure>
              <button type="button" className="bp-ghost bp-lb-x" onClick={() => setOpen(null)} autoFocus>
                Close ✕
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

const BOOTH_CSS = `
.bp-booth { position: relative; width: min(78cqw, 64cqh, 300px); height: min(100%, calc(min(78cqw, 64cqh, 300px) * 1.45)); display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 12px 14px 16px; box-sizing: border-box;
  border-radius: 22px 22px 14px 14px; background: linear-gradient(180deg, var(--vw-paper), var(--bp-blush)); box-shadow: 0 0 0 3px var(--vw-edge), 0 8px 0 var(--vw-edge), 0 26px 40px -22px color-mix(in srgb, var(--bp-deep) 70%, transparent); }
.bp-booth-sign { padding: 6px 16px; border-radius: 10px; background: var(--vw-accent); color: #FFFFFF; font: 800 clamp(15px, 2.4dvh, 19px) ${BP_DISPLAY}; letter-spacing: .14em; box-shadow: 0 0 0 3px var(--vw-gold), 0 4px 0 var(--bp-deep); }
.bp-booth-curtain { position: relative; flex: 1 1 0; width: 100%; min-height: 0; border-radius: 12px; display: grid; place-items: center; overflow: hidden;
  background: radial-gradient(70% 30% at 50% 0, rgba(0,0,0,.12), transparent), repeating-linear-gradient(90deg, var(--c1) 0 18px, color-mix(in srgb, var(--c1) 70%, #FFF) 18px 22px, var(--c2) 22px 40px, color-mix(in srgb, var(--c2) 70%, #FFF) 40px 44px);
  box-shadow: inset 0 -10px 18px -8px rgba(0,0,0,.18); animation: bp-curtain 3s ease-in-out infinite alternate; }
@keyframes bp-curtain { from { background-position: 0 0, 0 0 } to { background-position: 0 0, 10px 0 } }
.bp-booth-count { font: 800 clamp(70px, 26cqw, 110px)/1 ${BP_DISPLAY}; color: #FFFFFF; text-shadow: 0 4px 0 var(--bp-deep), 0 0 30px rgba(255,255,255,.8); animation: bp-count .7s ease-out both; }
@keyframes bp-count { from { transform: scale(2); opacity: 0 } 40% { opacity: 1 } to { transform: scale(1); opacity: 1 } }
.bp-booth-slot { width: 60%; height: 8px; border-radius: 9px; background: color-mix(in srgb, var(--vw-ink) 70%, transparent); box-shadow: inset 0 2px 3px rgba(0,0,0,.4); }
.bp-booth-go { min-height: 50px; }
.bp-flash { position: fixed; inset: 0; z-index: 70; background: #FFFFFF; pointer-events: none; animation: bp-flash .34s ease-out forwards; }
@keyframes bp-flash { from { opacity: .95 } to { opacity: 0 } }
.bp-strips { display: flex; gap: clamp(12px, 4cqw, 26px); align-items: flex-start; justify-content: center; height: 100%; width: 100%; touch-action: pan-y; cursor: ew-resize; padding-top: 4px; box-sizing: border-box; }
.bp-strip { --side: min(36cqw, calc((100cqh - 46px) / var(--k) - 8px), 170px); display: grid; gap: 7px; padding: 8px 8px 0; background: #FFFFFF; border-radius: 4px; transform-origin: 50% 0;
  box-shadow: 0 0 0 1px rgba(0,0,0,.05), 0 18px 30px -16px color-mix(in srgb, var(--bp-deep) 60%, transparent); }
.bp-frame { width: var(--side); height: var(--side); padding: 0; border: 0; border-radius: 2px; overflow: hidden; background: #EEE; cursor: pointer; display: block; position: relative; }
.bp-frame:disabled { cursor: inherit; }
.bp-frame > * { filter: brightness(calc(2.1 - var(--dev) * 1.1)) saturate(var(--dev)) sepia(calc(.6 - var(--dev) * .6)) blur(calc((1 - var(--dev)) * 3px)); transition: filter .25s linear; }
.bp-frame:focus-visible { outline: 3px solid var(--vw-accent); outline-offset: 2px; }
.bp-frame-ph { display: grid; place-items: center; width: 100%; height: 100%; font-size: 30px; background: repeating-linear-gradient(45deg, var(--bp-blush) 0 10px, var(--vw-paper) 10px 20px); }
.bp-strip-foot { display: flex; justify-content: center; gap: 6px; align-items: center; height: 30px; font: 400 16px ${BP_HAND}; color: #4A3A40; white-space: nowrap; overflow: hidden; max-width: var(--side); }
.bp-strip-foot i { font-style: normal; color: var(--vw-accent); font-size: 12px; }
.bp-lb { position: fixed; inset: 0; z-index: 72; display: grid; place-items: center; align-content: center; gap: 14px; padding: 20px; box-sizing: border-box; background: color-mix(in srgb, var(--vw-base) 80%, transparent); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); }
.bp-lb-card { margin: 0; width: min(82vw, 52vh, 360px); padding: 12px 12px 14px; background: #FFFFFF; border-radius: 6px; box-shadow: 0 24px 40px -20px color-mix(in srgb, var(--bp-deep) 70%, transparent); display: grid; gap: 8px; }
.bp-lb-img { width: 100%; aspect-ratio: 1; overflow: hidden; border-radius: 3px; }
.bp-lb-card figcaption { display: grid; gap: 2px; text-align: center; }
.bp-lb-card b { font: 400 22px/1.1 ${BP_HAND}; color: #3A2A30; overflow-wrap: anywhere; }
.bp-lb-card span { font: 500 13.5px/1.35 ${FONTS.ui}; color: #6A5258; overflow-wrap: anywhere; }
@media (prefers-reduced-motion: reduce) { .bp-booth-curtain, .bp-booth-count { animation: none; } }
`;

// ─── 6 · The bakery ─────────────────────────────────────────────────────────

type BakeStep = "stack" | "frost" | "sprinkle" | "top" | "done";
const TIERS = [
  { w: 88, h: 25, b: 7 },
  { w: 68, h: 23, b: 31 },
  { w: 48, h: 21, b: 53 },
] as const;

export function Bakery({ age, frostings, pops, confetti, cakeLine, sticker, onNext }: { age: string; frostings: readonly BpFrosting[]; pops: readonly string[]; confetti: readonly string[]; cakeLine: string; sticker: ReactNode; onNext: () => void }) {
  const reduced = useReducedMotion();
  const { cue } = useBp();
  const [placed, setPlaced] = useState(0);
  const [frost, setFrost] = useState<number | null>(null);
  const [sprinkles, setSprinkles] = useState<{ id: number; t: number; x: number; y: number; c: string; r: number; d: number }[]>([]);
  const [shakes, setShakes] = useState(0);
  const [topper, setTopper] = useState(false);
  const step: BakeStep = placed < 3 ? "stack" : frost === null ? "frost" : shakes < 2 ? "sprinkle" : !topper ? "top" : "done";
  const sid = useRef(0);

  const place = useCallback(() => {
    if (placed >= 3) return;
    haptic(16);
    cue("bubble", { gain: 0.6, detune: placed * 140 });
    setPlaced((p) => p + 1);
  }, [placed, cue]);

  const pickFrost = (k: number) => {
    haptic(12);
    cue("swoosh-soft", { gain: 0.5 });
    setFrost(k);
  };

  const shake = () => {
    haptic(10);
    cue("sparkle", { gain: 0.4 });
    setShakes((s) => s + 1);
    setSprinkles((list) => {
      const add = Array.from({ length: 16 }, () => {
        const t = Math.floor(Math.random() * 3);
        const tier = TIERS[t];
        sid.current += 1;
        return {
          id: sid.current,
          t,
          x: 50 + (Math.random() - 0.5) * (tier.w - 10),
          y: 100 - tier.b - tier.h * (0.15 + Math.random() * 0.75),
          c: pops[sid.current % pops.length],
          r: Math.random() * 180,
          d: Math.random() * 0.35,
        };
      });
      return [...list, ...add].slice(-64);
    });
  };

  const addTopper = () => {
    haptic(22);
    cue("chime-cascade", { gain: 0.65 });
    setTopper(true);
    window.setTimeout(() => burst({ kind: "confetti", colors: confetti, origin: { x: 0.5, y: 0.35 }, count: 90 }), reduced ? 0 : 420);
  };

  useNext(step === "done" ? "Next chapter" : null, onNext, "ticket");
  const f = frost !== null ? frostings[frost] : null;
  const titles: Record<BakeStep, [string, string]> = {
    stack: ["Bake your cake", placed === 0 ? "Drag (or tap) the biggest tier onto the plate" : "Now the next one up"],
    frost: ["Pick the frosting", "Which flavour today, birthday baker?"],
    sprinkle: ["Sprinkles!", "Shake, shake, shake 🎉"],
    top: ["The final touch", age ? `Your ${age} goes on top` : "A little heart on top"],
    done: ["Fresh out of the oven", ""],
  };

  return (
    <>
      <style>{BAKE_CSS}</style>
      <Head kicker="Chapter six · the bakery" title={titles[step][0]} sub={titles[step][1] || undefined} />
      <div className="bp-fill">
        <div className="bp-bake" data-bp-bake={step}>
          {step === "stack" && (
            <div className="bp-tray" aria-label="The tiers">
              {TIERS.map((t, k) =>
                k < placed ? (
                  <span key={k} className="bp-tray-slot" />
                ) : (
                  <motion.button
                    key={k}
                    type="button"
                    className={`bp-tray-tier${k === placed ? " is-next" : ""}`}
                    style={{ width: `${t.w * 0.42}%`, background: "var(--bp-sponge)" }}
                    drag={k === placed && !reduced}
                    dragSnapToOrigin
                    dragElastic={0.6}
                    onDragEnd={(_, info) => {
                      if (k === placed && info.offset.y > 50) place();
                    }}
                    onClick={() => k === placed && place()}
                    disabled={k !== placed}
                    aria-label={k === placed ? `Place tier ${k + 1}` : `Tier ${k + 1}, after the one before`}
                    whileDrag={{ scale: 1.1, rotate: -3 }}
                    data-bp-tier={k}
                  />
                ),
              )}
            </div>
          )}
          <div className="bp-cake" style={{ ["--fr" as string]: f?.color ?? "#FFFFFF", ["--frd" as string]: f?.deep ?? "#FFFFFF" }}>
            <span className="bp-plate" />
            {step === "stack" && placed < 3 && (
              <span className="bp-tier-ghost" style={{ width: `${TIERS[placed].w}%`, height: `${TIERS[placed].h}%`, bottom: `${TIERS[placed].b}%`, left: `${(100 - TIERS[placed].w) / 2}%` }} aria-hidden>
                drop it here
              </span>
            )}
            {TIERS.map((t, k) =>
              k < placed ? (
                <motion.span
                  key={k}
                  className={`bp-tier${f ? " is-frosted" : ""}`}
                  style={{ width: `${t.w}%`, height: `${t.h}%`, bottom: `${t.b}%`, left: `${(100 - t.w) / 2}%` }}
                  initial={reduced ? false : { y: -180, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 13 }}
                >
                  <i className="bp-tier-cap" />
                  <svg className="bp-tier-drip" viewBox="0 0 100 30" preserveAspectRatio="none" aria-hidden>
                    <path d="M0 0 H100 V10 Q96 22 92 10 Q88 6 84 14 Q80 26 76 12 Q72 4 66 12 Q62 20 58 10 Q54 4 50 16 Q46 28 42 12 Q38 4 32 10 Q28 18 24 10 Q20 4 16 16 Q12 26 8 12 Q4 4 0 10 Z" />
                  </svg>
                  <i className="bp-tier-dots" />
                </motion.span>
              ) : null,
            )}
            {sprinkles.map((s) => (
              <span key={s.id} className="bp-spr" style={{ left: `${s.x}%`, top: `${s.y}%`, background: s.c, rotate: `${s.r}deg`, animationDelay: `${s.d}s` }} />
            ))}
            {topper && (
              <span className="bp-topper">
                <motion.span className="bp-topper-in" initial={reduced ? false : { y: -160, opacity: 0, rotate: -20 }} animate={{ y: 0, opacity: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 220, damping: 11 }}>
                  <span className="bp-topper-flame" aria-hidden />
                  <b>{age || "♥"}</b>
                </motion.span>
              </span>
            )}
            {step === "done" && <span className="bp-bake-gif">{sticker}</span>}
          </div>
        </div>
      </div>
      <div className="bp-bake-ctl">
        {step === "frost" || step === "sprinkle" ? (
          <div className="bp-frosts" role="group" aria-label="Frosting">
            {frostings.map((fr, k) => (
              <button key={fr.name} type="button" className={`bp-frost${frost === k ? " is-on" : ""}`} onClick={() => pickFrost(k)} aria-pressed={frost === k} data-bp-frost={k}>
                <i style={{ background: fr.color, boxShadow: `inset 0 -5px 0 ${fr.deep}` }} />
                {fr.name}
              </button>
            ))}
          </div>
        ) : null}
        {step === "sprinkle" && (
          <button type="button" className="bp-btn" onClick={shake} data-bp-shake>
            🧂 Shake the sprinkles {shakes ? `(${shakes})` : ""}
          </button>
        )}
        {step === "top" && (
          <button type="button" className="bp-btn" onClick={addTopper} data-bp-topper>
            ✨ Add the topper
          </button>
        )}
        {step === "done" && (
          <motion.p className="bp-bake-line" initial={reduced ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            {cakeLine}
          </motion.p>
        )}
      </div>
    </>
  );
}

const BAKE_CSS = `
.bp-bake { position: relative; width: min(84cqw, 92cqh, 340px); height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; gap: 6px; }
.bp-tray { flex: none; width: 100%; display: flex; justify-content: center; align-items: center; gap: 12px; min-height: 52px; padding: 6px; box-sizing: border-box; border-radius: 16px; background: color-mix(in srgb, var(--vw-paper) 70%, transparent); box-shadow: inset 0 0 0 2px var(--vw-edge); }
.bp-tray-slot { width: 12%; }
.bp-tray-tier { height: 48px; min-width: 52px; border: 0; border-radius: 9px; cursor: grab; touch-action: none; box-shadow: inset 0 9px 0 #FFFFFF, inset 0 -4px 0 color-mix(in srgb, var(--bp-sponge) 70%, #8A5A2A), 0 6px 10px -6px rgba(0,0,0,.3); opacity: .45; }
.bp-tray-tier.is-next { opacity: 1; animation: bp-wiggle 1.4s ease-in-out infinite; }
.bp-tray-tier:disabled { cursor: default; }
.bp-tray-tier:focus-visible { outline: 3px solid var(--vw-ink); outline-offset: 3px; }
@keyframes bp-wiggle { 0%, 100% { transform: rotate(0) } 25% { transform: rotate(-4deg) } 75% { transform: rotate(4deg) } }
.bp-cake { position: relative; flex: 1 1 0; min-height: 0; width: 100%; max-height: 100%; aspect-ratio: 1 / .95; max-width: 100%; }
.bp-plate { position: absolute; left: 2%; right: 2%; bottom: 0; height: 9%; border-radius: 50%; background: radial-gradient(ellipse at 50% 30%, #FFFFFF, color-mix(in srgb, var(--vw-edge) 70%, #FFF)); box-shadow: 0 8px 14px -8px color-mix(in srgb, var(--bp-deep) 50%, transparent); }
.bp-plate::after { content: ""; position: absolute; left: 50%; bottom: -12px; width: 18%; height: 14px; transform: translateX(-50%); background: color-mix(in srgb, var(--vw-edge) 80%, #FFF); border-radius: 0 0 8px 8px; z-index: -1; }
.bp-tier-ghost { position: absolute; box-sizing: border-box; border: 2.5px dashed color-mix(in srgb, var(--vw-accent) 55%, transparent); border-radius: 12px; display: grid; place-items: center; font: 700 13px ${FONTS.ui}; color: var(--vw-accent-deep); background: color-mix(in srgb, var(--vw-paper) 50%, transparent); animation: bp-pulse 1s ease-in-out infinite alternate; }
.bp-tier { position: absolute; border-radius: 12px 12px 10px 10px; background: var(--bp-sponge); box-shadow: inset 0 -6px 0 color-mix(in srgb, var(--bp-sponge) 70%, #8A5A2A), 0 8px 12px -8px rgba(0,0,0,.25); }
.bp-tier-cap { position: absolute; left: 0; right: 0; top: 0; height: 26%; border-radius: 12px 12px 6px 6px; background: #FFFFFF; transition: background .4s ease; }
.bp-tier-drip { position: absolute; left: 0; top: 20%; width: 100%; height: 40%; fill: var(--fr); opacity: 0; transform-origin: 50% 0; transform: scaleY(0); transition: transform .7s cubic-bezier(.3,1.3,.5,1), opacity .2s ease; }
.bp-tier.is-frosted .bp-tier-cap { background: var(--fr); box-shadow: inset 0 -3px 0 var(--frd); }
.bp-tier.is-frosted .bp-tier-drip { opacity: 1; transform: scaleY(1); }
.bp-tier-dots { position: absolute; left: 6%; right: 6%; bottom: 14%; height: 10px; background: radial-gradient(circle, rgba(255,255,255,.75) 0 2.4px, transparent 3px) 0 0 / 18px 10px repeat-x; }
.bp-spr { position: absolute; width: 3.2%; height: 1.4%; min-width: 7px; min-height: 3px; border-radius: 3px; animation: bp-spr .6s cubic-bezier(.4,0,.6,1.3) both; }
@keyframes bp-spr { from { transform: translateY(-160px); opacity: 0 } 60% { opacity: 1 } to { transform: translateY(0); opacity: 1 } }
.bp-topper { position: absolute; left: 0; right: 0; bottom: 73%; display: flex; justify-content: center; pointer-events: none; }
.bp-topper-in { display: grid; justify-items: center; }
.bp-topper b { display: block; min-width: 40px; padding: 2px 8px; border-radius: 10px; text-align: center; font: 800 clamp(26px, 11cqw, 40px)/1.05 ${BP_DISPLAY}; color: #FFFFFF; background: var(--vw-accent); box-shadow: inset 0 -4px 0 var(--vw-accent-deep), 0 0 0 3px var(--vw-gold); }
.bp-topper-flame { width: 14px; height: 20px; margin-bottom: 2px; border-radius: 50% 50% 45% 45% / 65% 65% 35% 35%; background: radial-gradient(circle at 50% 70%, #FFF6C8, #FFB23E 60%, #FF7A2E); box-shadow: 0 0 14px 4px rgba(255,190,80,.55); animation: bp-flick .5s ease-in-out infinite alternate; transform-origin: 50% 100%; }
@keyframes bp-flick { from { transform: scale(.9, 1) rotate(-5deg) } to { transform: scale(1.06, 1.12) rotate(4deg) } }
.bp-bake-gif { position: absolute; right: -6px; top: 0; pointer-events: none; }
.bp-bake-gif .bp-stk { transform: rotate(7deg); }
.bp-bake-gif .bp-stk img { width: clamp(60px, 22cqw, 92px) !important; height: auto !important; }
.bp-bake-ctl { flex: none; display: grid; gap: 10px; justify-items: center; min-height: 56px; width: 100%; max-width: 440px; }
.bp-frosts { display: flex; gap: 8px; justify-content: center; flex-wrap: wrap; }
.bp-frost { min-height: 44px; display: inline-flex; align-items: center; gap: 7px; padding: 0 14px 0 6px; border-radius: 99px; border: 2px solid var(--vw-edge); background: var(--vw-paper); color: var(--vw-ink); font: 700 14px ${FONTS.ui}; cursor: pointer; touch-action: manipulation; }
.bp-frost i { width: 30px; height: 30px; border-radius: 50%; }
.bp-frost.is-on { border-color: var(--vw-accent); box-shadow: 0 0 0 2px var(--vw-accent); }
.bp-frost:focus-visible { outline: 3px solid var(--vw-ink); outline-offset: 2px; }
.bp-bake-line { margin: 0; padding: 10px 16px; border-radius: 16px; background: var(--vw-paper); box-shadow: 0 0 0 2px var(--vw-edge); font: 400 clamp(20px, 2.9dvh, 24px)/1.2 ${BP_HAND}; color: var(--vw-ink); overflow-wrap: anywhere; }
@media (prefers-reduced-motion: reduce) { .bp-tray-tier.is-next, .bp-topper-flame, .bp-spr { animation: none !important; } .bp-tier-drip { transition: none; } }
`;
