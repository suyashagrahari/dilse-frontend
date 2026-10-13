"use client";

// Scenes 8–10: "Will you be mine?", the answer, and the certificate.
//
// How No behaves is the SENDER's choice (extras.answerMode):
//   • "yesOnly" (default): reach for No and it gets shy — it shrinks and hops
//     somewhere else with a new line while YES grows; after five tries it gives
//     up and turns into a second YES.
//   • "noAfterTries": No hops `tries` times (4 or 5), then stops and becomes an
//     honest "Let me think about it 🤍". Pressing it asks once more, kindly;
//     confirming records a gentle "no" (the sender sees it, by email too).
//
// A proposal must never feel like a trap, so the "think" path is warm and
// complete in itself — no guilt-trip.

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { EndingActions, haptic, useReducedMotion, type KeepsakeItem, type KeepsakeLayout } from "../../../_valentine/kit";
import type { AnswerRule } from "../../../_valentine/kit/answer";
import type { WybmPaletteDef } from "../../../_valentine/days/will-you-be-mine";
import type { DayConfig, ValentineDayData } from "../../../_valentine/types";
import { FONTS } from "../../../_valentine/theme";
import { Fireworks, VelvetBox } from "./art";
import { WY_HAND, WY_SCRIPT, WY_SERIF } from "./fonts";
import { useNext, useWy } from "./stage";
import { Head } from "./ui";

const SURRENDER_AT = 5;
const PLEADING = ["are you sure? 🥺", "think again 🙈", "pretty please?", "I'll be so good 🙏", "last chance 🥹"];

// ─── 8 · Will you be mine? ──────────────────────────────────────────────────

export function Question({
  question,
  yesLabel,
  noLines,
  thinkLabel,
  rule,
  onYes,
  onNo,
}: {
  question: string;
  yesLabel: string;
  noLines: readonly string[];
  thinkLabel: string;
  rule: AnswerRule;
  onYes: (dodges: number) => void;
  onNo: (dodges: number) => void;
}) {
  const reduced = useReducedMotion();
  const { cue } = useWy();
  const arenaRef = useRef<HTMLDivElement | null>(null);
  const yesRef = useRef<HTMLButtonElement | null>(null);
  const noRef = useRef<HTMLButtonElement | null>(null);
  const dodgesRef = useRef(0);
  const busy = useRef(false);
  const lastDodge = useRef(0);
  const [dodges, setDodges] = useState(0);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [hopping, setHopping] = useState(false);
  const [asking, setAsking] = useState(false);
  const canSayNo = rule.mode === "noAfterTries";
  const limit = canSayNo ? rule.tries : SURRENDER_AT;
  const tired = dodges >= limit;
  const surrendered = tired && !canSayNo;
  const unlocked = tired && canSayNo;

  const yes = () => {
    cue("chime-cascade", { gain: 0.8 });
    cue("firework", { gain: 0.6, at: 0.1 });
    cue("kiss", { gain: 0.5, at: 0.3 });
    onYes(dodgesRef.current);
  };

  const dodge = useCallback(() => {
    if (busy.current || dodgesRef.current >= limit) return;
    busy.current = true;
    lastDodge.current = performance.now();
    dodgesRef.current += 1;
    haptic(12);
    cue("plush-squeak", { gain: 0.6, detune: dodgesRef.current * 80 });
    setHopping(true);
    window.setTimeout(
      () => {
        const arena = arenaRef.current?.getBoundingClientRect();
        const no = noRef.current?.getBoundingClientRect();
        const y = yesRef.current?.getBoundingClientRect();
        if (arena && no) {
          const pad = 8;
          const maxX = Math.max(pad, arena.width - no.width - pad);
          const maxY = Math.max(pad, arena.height - no.height - pad);
          let pick = { x: pad, y: pad };
          for (let i = 0; i < 16; i++) {
            const x = pad + Math.random() * (maxX - pad);
            const yy = pad + Math.random() * (maxY - pad);
            pick = { x, y: yy };
            if (!y) break;
            const yx = y.left - arena.left;
            const yt = y.top - arena.top;
            const clear = x > yx + y.width + 14 || x + no.width + 14 < yx || yy > yt + y.height + 14 || yy + no.height + 14 < yt;
            if (clear) break;
          }
          setPos(pick);
        }
        setDodges(dodgesRef.current);
        setHopping(false);
        busy.current = false;
      },
      reduced ? 0 : 260,
    );
  }, [reduced, cue, limit]);

  useLayoutEffect(() => {
    const arena = arenaRef.current;
    const no = noRef.current;
    if (!pos || !arena || !no) return;
    const pad = 8;
    const x = Math.min(pos.x, Math.max(pad, arena.clientWidth - no.offsetWidth - pad));
    let y = Math.min(pos.y, Math.max(pad, arena.clientHeight - no.offsetHeight - pad));
    const yr = yesRef.current?.getBoundingClientRect();
    const a = arena.getBoundingClientRect();
    if (yr) {
      const yt = yr.top - a.top;
      const yb = yr.bottom - a.top;
      const yl = yr.left - a.left;
      const yrr = yr.right - a.left;
      const hits = x < yrr + 10 && x + no.offsetWidth + 10 > yl && y < yb + 10 && y + no.offsetHeight + 10 > yt;
      if (hits) y = yb + 12 + no.offsetHeight <= arena.clientHeight - pad ? yb + 12 : Math.max(pad, yt - 12 - no.offsetHeight);
    }
    if (x !== pos.x || y !== pos.y) setPos({ x, y });
  }, [pos, dodges]);

  useEffect(() => {
    const arena = arenaRef.current;
    if (!arena || tired) return;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const r = noRef.current?.getBoundingClientRect();
      if (!r) return;
      const dx = Math.max(r.left - e.clientX, 0, e.clientX - r.right);
      const dy = Math.max(r.top - e.clientY, 0, e.clientY - r.bottom);
      if (Math.hypot(dx, dy) < 56) dodge();
    };
    arena.addEventListener("pointermove", onMove);
    return () => arena.removeEventListener("pointermove", onMove);
  }, [dodge, tired]);

  const lines = canSayNo ? PLEADING : noLines.length ? noLines : ["are you sure? 🥺"];
  const noLabel = surrendered ? "Okay fine… YES 💗" : unlocked ? thinkLabel : dodges === 0 ? "No" : lines[(dodges - 1) % lines.length];
  const [fit, setFit] = useState(1.3);
  useLayoutEffect(() => {
    const a = arenaRef.current;
    const y = yesRef.current;
    if (!a || !y || !y.offsetWidth) return;
    setFit(Math.max(1, Math.min(1.34, (a.clientWidth - 24) / y.offsetWidth)));
  }, [dodges]);
  const yesScale = tired ? 1 : Math.min(fit, Math.pow(1.065, dodges));

  const pressNo = () => {
    if (performance.now() - lastDodge.current < 450) return;
    if (surrendered) return yes();
    if (unlocked) {
      haptic(8);
      cue("swoosh-soft", { gain: 0.4 });
      setAsking(true);
    }
  };

  return (
    <>
      <style>{Q_CSS}</style>
      <div className="wy-q-ring" aria-hidden>
        <VelvetBox open ring size="100%" />
      </div>
      <Head kicker="The big question" title={question} />
      <div ref={arenaRef} className={`wy-q-arena${tired ? " is-settled" : ""}`} data-wy-answer-mode={rule.mode}>
        <motion.button
          ref={yesRef}
          type="button"
          onClick={yes}
          className="wy-q-yes"
          data-wy-yes
          initial={false}
          animate={{ x: "-50%", y: "-50%", scale: yesScale }}
          transition={{ type: "spring", stiffness: 260, damping: 14 }}
        >
          {yesLabel}
        </motion.button>
        <button
          ref={noRef}
          type="button"
          className={`wy-q-no${surrendered ? " is-yes" : ""}${unlocked ? " is-free" : ""}${hopping ? " is-hop" : ""}`}
          data-wy-no={unlocked ? "free" : surrendered ? "yes" : "running"}
          aria-label={surrendered ? "Okay fine, yes" : unlocked ? thinkLabel : `No — ${noLabel}`}
          onPointerDown={(e) => {
            if (tired) return;
            e.preventDefault();
            dodge();
          }}
          onKeyDown={(e) => {
            if (!tired && (e.key === "Enter" || e.key === " ")) {
              e.preventDefault();
              dodge();
            }
          }}
          onClick={pressNo}
          style={tired ? undefined : { left: pos ? pos.x : "74%", top: pos ? pos.y : "74%", transform: pos ? undefined : "translate(-50%, -50%)", scale: String(Math.max(0.7, 1 - dodges * 0.06)) }}
        >
          {noLabel}
        </button>
        <span className="vw-sr" aria-live="polite">
          {dodges > 0 && !tired ? `No ran away. ${noLabel}` : unlocked ? `No stopped running. It now says: ${thinkLabel}` : ""}
        </span>
      </div>
      <div className="wy-q-foot">
        {dodges > 0 && !tired && (
          <p className="wy-q-count">
            No ran away ×{dodges} 🙈{canSayNo ? ` · ${limit - dodges} more ${limit - dodges === 1 ? "try" : "tries"}` : ""}
          </p>
        )}
        {unlocked && <p className="wy-q-free">It&apos;s really your choice. Either answer is okay 🤍</p>}
      </div>

      <AnimatePresence>
        {asking && (
          <motion.div className="wy-q-sure" role="dialog" aria-modal="true" aria-labelledby="wy-q-sure-t" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduced ? 0 : 0.22 }}>
            <motion.div className="wy-q-sure-card" initial={reduced ? false : { y: 24, scale: 0.94 }} animate={{ y: 0, scale: 1 }} exit={reduced ? undefined : { y: 16, scale: 0.96 }} transition={{ type: "spring", stiffness: 320, damping: 24 }}>
              <p className="wy-q-sure-e" aria-hidden>
                🤍
              </p>
              <h3 id="wy-q-sure-t">Need some time to think?</h3>
              <p className="wy-q-sure-s">That&apos;s completely okay. Big questions deserve a real answer — they&apos;ll understand.</p>
              <button type="button" className="wy-q-sure-back" autoFocus onClick={() => setAsking(false)}>
                Wait, take me back 💗
              </button>
              <button
                type="button"
                className="wy-q-sure-no"
                data-wy-confirm-no
                onClick={() => {
                  setAsking(false);
                  onNo(dodgesRef.current);
                }}
              >
                Yes, let me think about it
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

const Q_CSS = `
.wy-q-ring { flex: none; width: clamp(110px, 19dvh, calc(170px * var(--vw-s, 1))); margin-bottom: -6px; filter: drop-shadow(0 14px 18px color-mix(in srgb, var(--wy-deep) 40%, transparent)); animation: wy-ring-bob 2.2s ease-in-out infinite alternate; }
.wy-q-ring svg { width: 100%; height: auto; }
@keyframes wy-ring-bob { from { transform: translateY(-4px) rotate(-2deg) } to { transform: translateY(4px) rotate(2deg) } }
.wy-q-arena { position: relative; flex: 1 1 0; min-height: 160px; width: 100%; max-width: calc(420px * var(--vw-s, 1)); max-height: 300px; }
.wy-q-yes { position: absolute; left: 50%; top: 32%; min-width: 160px; max-width: calc(100% - 24px); min-height: 60px; padding: 14px 26px; border-radius: 999px; border: 0; z-index: 2; cursor: pointer; touch-action: manipulation;
  background: linear-gradient(180deg, color-mix(in srgb, var(--vw-accent) 70%, #FFFFFF), var(--vw-accent) 55%, var(--vw-accent-deep)); color: #FFFFFF; font: 700 19px ${FONTS.ui};
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; box-shadow: 0 5px 0 var(--wy-deep), 0 0 0 4px color-mix(in srgb, var(--vw-paper) 70%, transparent), 0 16px 30px -12px color-mix(in srgb, var(--wy-deep) 70%, transparent); }
.wy-q-yes::after { content: ""; position: absolute; inset: 0; border-radius: inherit; background: linear-gradient(105deg, transparent 30%, rgba(255,255,255,.45) 45%, transparent 60%); background-size: 250% 100%; animation: wy-shine 2.6s ease-in-out infinite; pointer-events: none; }
@keyframes wy-shine { 0% { background-position: 130% 0 } 60%, 100% { background-position: -60% 0 } }
.wy-q-yes:focus-visible { outline: 3px solid var(--vw-ink); outline-offset: 4px; }
.wy-q-no { position: absolute; min-height: 46px; min-width: 84px; max-width: calc(100% - 16px); padding: 11px 18px; border-radius: 999px; z-index: 3; cursor: pointer; touch-action: manipulation;
  border: 2px dashed var(--vw-edge); background: color-mix(in srgb, var(--vw-paper) 80%, transparent); color: var(--vw-ink-soft); font: 600 16px ${FONTS.ui};
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; transition: opacity .25s ease, scale .25s ease, translate .25s ease; }
.wy-q-no.is-hop { opacity: 0; translate: 0 -14px; }
.wy-q-no.is-yes { border: 0; background: linear-gradient(180deg, color-mix(in srgb, var(--vw-accent) 70%, #FFFFFF), var(--vw-accent)); color: #FFFFFF; box-shadow: 0 5px 0 var(--wy-deep); }
.wy-q-no.is-free { border-style: solid; color: var(--vw-ink); }
.wy-q-no:focus-visible { outline: 3px solid var(--vw-ink); outline-offset: 4px; }
.wy-q-arena.is-settled .wy-q-yes { top: 36%; }
.wy-q-arena.is-settled .wy-q-no { left: 50%; top: calc(36% + 44px); transform: translateX(-50%); transition: none; scale: none; }
.wy-q-foot { flex: none; min-height: 24px; }
.wy-q-count { margin: 0; font: 600 clamp(15px, 2.3dvh, 18px) ${FONTS.ui}; color: var(--vw-accent-deep); }
.wy-q-free { margin: 0; font: 500 clamp(13px, 2dvh, 15px) ${FONTS.ui}; color: var(--vw-ink-soft); }
.wy-q-sure { position: fixed; inset: 0; z-index: 90; display: grid; place-items: center; padding: 20px; background: color-mix(in srgb, var(--wy-deep) 35%, transparent); backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px); }
.wy-q-sure-card { width: min(340px, 100%); box-sizing: border-box; padding: 22px 20px 18px; border-radius: 26px; text-align: center; display: grid; gap: 10px; justify-items: center;
  background: var(--vw-paper); color: var(--vw-ink); box-shadow: 0 0 0 3px var(--vw-edge), 0 30px 60px -20px color-mix(in srgb, var(--wy-deep) 70%, transparent); }
.wy-q-sure-e { margin: 0; font-size: 44px; line-height: 1; }
.wy-q-sure-card h3 { margin: 0; font: 700 clamp(24px, 6.6vw, 30px)/1.12 ${WY_SERIF}; }
.wy-q-sure-s { margin: 0 0 6px; font: 500 15px/1.45 ${FONTS.ui}; color: var(--vw-ink-soft); }
.wy-q-sure-back { width: 100%; min-height: 52px; border: 0; border-radius: 999px; cursor: pointer; font: 700 17px ${FONTS.ui}; color: #FFFFFF;
  background: linear-gradient(180deg, color-mix(in srgb, var(--vw-accent) 70%, #FFFFFF), var(--vw-accent)); box-shadow: 0 4px 0 var(--wy-deep); }
.wy-q-sure-no { min-height: 44px; padding: 0 18px; border: 0; background: none; cursor: pointer; font: 600 15px ${FONTS.ui}; color: var(--vw-ink-soft); text-decoration: underline; text-underline-offset: 3px; }
.wy-q-sure-back:focus-visible, .wy-q-sure-no:focus-visible { outline: 3px solid var(--vw-ink); outline-offset: 3px; }
@media (prefers-reduced-motion: reduce) { .wy-q-no { transition: none; } .wy-q-ring, .wy-q-yes::after { animation: none; } }
`;

// ─── 9 · The answer ─────────────────────────────────────────────────────────

export function YesRoom({ recipient, yesLine, dodges, sticker, fireworks, onNext }: { recipient: string; yesLine: string; dodges: number; sticker: ReactNode; fireworks: readonly string[]; onNext: () => void }) {
  useNext("Make it official", onNext, "ring");
  return (
    <>
      <Fireworks colors={fireworks} />
      <div className="wy-fill" style={{ alignContent: "center" }}>
        <div className="wy-zoom wy-yes" data-wy-yes-room>
          <div className="wy-yes-gif">{sticker}</div>
          <p className="wy-yes-k">✨ It&apos;s official ✨</p>
          <h2 className="wy-title wy-yes-t">
            {recipient} said <span className="wy-yes-word">YES!</span>
          </h2>
          <p className="wy-yes-l">{yesLine || "Best day of my life. I'm never letting go of your hand 💗"}</p>
          {dodges > 0 && (
            <p className="wy-yes-d">
              …after No ran away {dodges} {dodges === 1 ? "time" : "times"} 🙈
            </p>
          )}
        </div>
      </div>
      <style>{YES_CSS}</style>
    </>
  );
}

const YES_CSS = `
.wy-yes { position: relative; z-index: 1; display: grid; gap: clamp(6px, 1.4dvh, 12px); justify-items: center; }
.wy-yes-gif { display: grid; place-items: center; height: min(30cqh, 180px); }
.wy-yes-gif .wy-stk img { width: min(26cqh, 150px) !important; height: auto !important; }
.wy-yes-k { margin: 0; font: 700 13px ${FONTS.ui}; letter-spacing: .18em; text-transform: uppercase; color: var(--vw-accent-deep); }
.wy-yes-t { font-size: clamp(34px, min(10vw, 5.8dvh), 54px); }
.wy-yes-word { font: 400 1.6em/1.1 ${WY_SCRIPT}; color: var(--vw-accent); display: block; margin-top: .22em; animation: wy-yes-pop .8s cubic-bezier(.3,1.7,.5,1) .2s both; padding: 0 .08em; }
@keyframes wy-yes-pop { from { transform: scale(.2) rotate(-12deg); opacity: 0 } to { transform: none; opacity: 1 } }
.wy-yes-l { margin: 0 auto; max-width: 360px; font: 600 clamp(21px, 3dvh, 25px)/1.3 ${WY_HAND}; color: var(--vw-ink); overflow-wrap: anywhere; }
.wy-yes-d { margin: 0; font: 600 clamp(15px, 2.3dvh, 18px) ${FONTS.ui}; color: var(--vw-accent-deep); }
@media (max-height: 700px) { .wy-yes-gif { height: min(26cqh, 150px); } .wy-yes-gif .wy-stk img { width: min(20cqh, 120px) !important; } .wy-yes { gap: 4px; } }
@media (prefers-reduced-motion: reduce) { .wy-yes-word { animation: none; } }
`;

export function ThinkRoom({ sender, recipient, onReplay }: { sender: string; recipient: string; onReplay: () => void }) {
  const { go } = useWy();
  const tell = () => {
    const text = `I saw all of it, ${sender} 🤍 It was so sweet. Let me think about it — I'll tell you soon.`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  };
  useNext(`Tell ${sender}`, tell, "heart", false);
  return (
    <div className="wy-fill" style={{ alignContent: "center" }} data-wy-declined>
      <div className="wy-zoom" style={{ display: "grid", gap: "clamp(10px, 2dvh, 18px)", justifyItems: "center", maxWidth: 420 }}>
        <div style={{ width: "clamp(110px, 18dvh, 160px)" }} aria-hidden>
          <VelvetBox open={false} size="100%" />
        </div>
        <h2 className="wy-title">Take all the time you need 🤍</h2>
        <p style={{ margin: 0, font: `600 clamp(20px, 2.9dvh, 23px)/1.35 ${WY_HAND}`, color: "var(--vw-ink)", overflowWrap: "anywhere" }}>
          Thank you for seeing every bit of this, {recipient}. The box will stay right here, and so will {sender}. No pressure, no rush.
        </p>
        <p style={{ margin: 0, font: `500 14px/1.4 ${FONTS.ui}`, color: "var(--vw-ink-soft)" }}>{sender} will know you answered, gently.</p>
        <button type="button" onClick={() => go(onReplay)} className="wy-ghost">
          Watch it again 💗
        </button>
      </div>
    </div>
  );
}

// ─── 10 · The certificate ───────────────────────────────────────────────────

export function Ending({
  day,
  data,
  mode,
  palette,
  recipient,
  sender,
  certificate,
  together,
  replyText,
  makeOwnHref,
  onReplay,
}: {
  day: DayConfig;
  data: ValentineDayData;
  mode: "preview" | "live";
  palette: WybmPaletteDef;
  recipient: string;
  sender: string;
  certificate: string;
  together: string;
  replyText: string;
  makeOwnHref: string;
  onReplay: () => void;
}) {
  const reduced = useReducedMotion();
  const [sheet, setSheet] = useState<"cert" | "share">("cert");
  const today = useMemo(() => new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }), []);
  const certNo = useMemo(() => {
    let h = 11;
    for (const ch of `${recipient}${sender}`) h = (h * 31 + ch.charCodeAt(0)) % 99991;
    return `MINE-${String(h).padStart(5, "0")}`;
  }, [recipient, sender]);
  const { go } = useWy();

  const makeOwn = () => {
    haptic(12);
    const link = typeof window !== "undefined" ? `${window.location.origin}${makeOwnHref}` : `https://subhsandesh.in${makeOwnHref}`;
    const text = `Someone asked me “Will you be mine?” with the cutest page ever 🥹💍\nMake one for your own person:\n${link}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  };

  const t = palette.theme;
  const paper = t.dark ? "#FFFDF8" : t.paper;
  const ink = t.dark ? "#2B2340" : t.ink;
  const inkSoft = t.dark ? "#6B6385" : t.inkSoft;
  const keepsake = (): KeepsakeLayout => {
    const W = 1080;
    const items: KeepsakeItem[] = [
      { type: "emoji", char: "💍", x: W / 2, y: 170, size: 110 },
      { type: "text", text: "CERTIFICATE OF LOVE", x: W / 2, y: 290, size: 44, weight: 700, color: t.dark ? t.gold : t.accentDeep, face: "ui" },
      { type: "rect", x: 90, y: 360, w: 900, h: 1330, radius: 56, fill: paper },
      { type: "rect", x: 112, y: 382, w: 856, h: 1286, radius: 44, stroke: t.gold, lineWidth: 8 },
      { type: "emoji", char: "💞", x: W / 2, y: 540, size: 150 },
      { type: "text", text: certificate, x: W / 2, y: 730, size: 80, weight: 700, color: ink, face: "serif", maxWidth: 820, maxLines: 2 },
      { type: "text", text: "This certifies that", x: W / 2, y: 860, size: 38, color: inkSoft, face: "ui" },
      { type: "text", text: `${recipient} & ${sender}`, x: W / 2, y: 980, size: 96, face: "script", weight: 700, color: t.accentDeep, maxWidth: 840, maxLines: 1 },
      { type: "text", text: together, x: W / 2, y: 1080, size: 42, color: ink, face: "ui", maxWidth: 820, maxLines: 1 },
      { type: "text", text: `Since ${today}  ·  ${certNo}`, x: W / 2, y: 1210, size: 30, weight: 600, color: inkSoft, face: "ui" },
      { type: "text", text: "Valid forever · No take-backs", x: W / 2, y: 1280, size: 32, face: "serif", italic: true, color: inkSoft },
      { type: "text", text: "SAID YES ✓", x: W / 2, y: 1460, size: 68, weight: 700, color: t.accent, face: "ui" },
    ];
    if (data.endLine) items.push({ type: "text", text: data.endLine, x: W / 2, y: 1780, size: 40, face: "serif", italic: true, color: t.ink, maxWidth: 940, maxLines: 2 });
    items.push({ type: "text", text: "Made on subhsandesh.in 💗", x: W / 2, y: 1870, size: 30, color: t.inkSoft, face: "ui" });
    return { background: { stops: t.dark ? [[0, palette.sky[1]], [0.5, t.base], [1, palette.sky[0]]] : [[0, t.paper], [0.5, t.base], [1, palette.blush]] }, items };
  };

  useNext(sheet === "cert" ? "Keep it" : "Make your own", sheet === "cert" ? () => setSheet("share") : makeOwn, sheet === "cert" ? "heart" : "sparkle", sheet === "cert");

  if (sheet === "share")
    return (
      <>
        <Head kicker="Officially yours" title={<>Now tell {sender} 💌</>} sub="Save your certificate, then send your answer." />
        <div className="wy-fill">
          <motion.div initial={reduced ? false : { opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", stiffness: 180, damping: 16 }} style={{ width: "min(56cqh, 66cqw, 230px)" }}>
            <VelvetBox open ring size="100%" />
          </motion.div>
        </div>
        <div className="wy-zoom" style={{ flex: "none", width: "100%", maxWidth: 420 }}>
          <EndingActions day={day} data={data} mode={mode} onReplay={() => go(onReplay)} keepsake={keepsake} replyText={replyText} replyLabel={`💬 Say YES to ${sender}`} />
        </div>
      </>
    );

  return (
    <>
      <style>{CERT_CSS}</style>
      <div className="wy-fill">
        <motion.div className="wy-cert wy-zoom" initial={reduced ? false : { opacity: 0, y: 30, rotate: -2 }} animate={{ opacity: 1, y: 0, rotate: 0 }} transition={{ type: "spring", stiffness: 160, damping: 18 }} data-wy-certificate>
          <p className="wy-cert-k">Certificate of love</p>
          <div className="wy-cert-ring" aria-hidden>
            💞
          </div>
          <h2 className="wy-cert-t">{certificate}</h2>
          <p className="wy-cert-s">This certifies that</p>
          <p className="wy-cert-n">
            {recipient} <span>&amp;</span> {sender}
          </p>
          <p className="wy-cert-s">{together}</p>
          <p className="wy-cert-f">
            Since {today} · {certNo}
            <br />
            Valid forever · No take-backs
          </p>
          <span className="wy-cert-stamp" aria-hidden>
            SAID YES 💍
          </span>
          {data.endLine && <p className="wy-cert-end">{data.endLine}</p>}
        </motion.div>
      </div>
    </>
  );
}

const CERT_CSS = `
.wy-cert { position: relative; width: min(100%, 380px); max-height: 100%; box-sizing: border-box; padding: 18px 20px 18px; border-radius: 28px; overflow: hidden;
  background: radial-gradient(120% 60% at 50% 0%, #FFFFFF, #FFFDF8); color: #3F2A30;
  box-shadow: inset 0 0 0 3px var(--vw-gold), inset 0 0 0 9px #FFFFFF, inset 0 0 0 10.5px color-mix(in srgb, var(--vw-gold) 50%, #FFFFFF), 0 28px 50px -24px color-mix(in srgb, var(--wy-deep) 70%, transparent);
  display: grid; justify-items: center; gap: 3px; text-align: center; }
.wy-cert-k { margin: 0; font: 700 11px ${FONTS.ui}; letter-spacing: .2em; text-transform: uppercase; color: var(--vw-accent-deep); }
.wy-cert-ring { font-size: clamp(44px, 8dvh, 64px); line-height: 1.1; }
.wy-cert-t { margin: 0 0 4px; font: 700 clamp(26px, 4dvh, 34px)/1.1 ${WY_SERIF}; font-style: italic; color: #3F2A30; text-wrap: balance; }
.wy-cert-s { margin: 0; font: 500 14px ${FONTS.ui}; color: #7A6068; overflow-wrap: anywhere; }
.wy-cert-n { margin: 2px 0; font: 400 clamp(34px, 5.4dvh, 44px)/1.15 ${WY_SCRIPT}; color: var(--vw-accent-deep); overflow-wrap: anywhere; }
.wy-cert-n span { font: 600 .55em ${WY_SERIF}; font-style: italic; color: var(--vw-gold); }
.wy-cert-f { margin: 8px 0 0; font: 500 12px/1.5 ${FONTS.ui}; color: #7A6068; }
.wy-cert-stamp { position: absolute; right: 12px; top: 50px; padding: 4px 9px; border: 3px solid var(--vw-accent); border-radius: 10px; transform: rotate(14deg);
  font: 700 13px ${FONTS.ui}; letter-spacing: .08em; color: var(--vw-accent); background: rgba(255,255,255,.7); animation: wy-stamp-in .55s cubic-bezier(.3,1.6,.5,1) .6s both; }
@keyframes wy-stamp-in { from { transform: rotate(14deg) scale(2.4); opacity: 0 } to { transform: rotate(14deg) scale(1); opacity: 1 } }
.wy-cert-end { margin: 8px 0 0; font: 600 clamp(19px, 2.7dvh, 22px)/1.25 ${WY_HAND}; color: #3F2A30; overflow-wrap: anywhere; }
@media (prefers-reduced-motion: reduce) { .wy-cert-stamp { animation: none; } }
`;
