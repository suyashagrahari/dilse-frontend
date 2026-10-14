"use client";

// 9 · "Video call tonight?" on a tin-can phone (yes, or an honest "later" if
// the sender allowed it — both are recorded and emailed), the answer, then
// 10 · sunrise: the two dots meet in the middle, the kilometres run down to 0,
// and an airmail postcard keepsake she flips over (PNG, reply on WhatsApp).

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { EndingActions, burst, haptic, useReducedMotion, type KeepsakeItem, type KeepsakeLayout } from "../../../_valentine/kit";
import type { MissPremPaletteDef } from "../../../_valentine/days/miss-you-premium";
import type { DayConfig, ValentineDayData } from "../../../_valentine/types";
import { FONTS } from "../../../_valentine/theme";
import { MP_DISPLAY, MP_HAND } from "./fonts";
import { fmtDistance, useMp, useNext } from "./stage";
import { Head } from "./ui";

// ─── 9 · The tin-can phone ──────────────────────────────────────────────────

function Can({ color, ringing }: { color: string; ringing: boolean }) {
  return (
    <svg viewBox="0 0 60 70" width="100%" height="100%" aria-hidden className={ringing ? "mp-can-ring" : undefined}>
      <ellipse cx="30" cy="12" rx="22" ry="8" fill="#F3F1F6" stroke="#B9B4C6" strokeWidth="2" />
      <path d="M8 12 v44 c0 5 10 9 22 9 s22 -4 22 -9 v-44" fill={color} stroke="#B9B4C6" strokeWidth="2" />
      <path d="M8 24 c0 5 10 9 22 9 s22 -4 22 -9 M8 46 c0 5 10 9 22 9 s22 -4 22 -9" fill="none" stroke="rgba(255,255,255,.6)" strokeWidth="2" />
      <path d="M30 38 c-4 -3 -6 -5 -5 -7 c1 -2 3 -2 5 0 c2 -2 4 -2 5 0 c1 2 -1 4 -5 7 z" fill="#FFFFFF" />
      <ellipse cx="30" cy="12" rx="14" ry="4.5" fill="#D8D4E2" />
    </svg>
  );
}

export function Question({
  question,
  yesLabel,
  laterLabel,
  canLater,
  recipient,
  sender,
  onYes,
  onLater,
}: {
  question: string;
  yesLabel: string;
  laterLabel: string;
  canLater: boolean;
  recipient: string;
  sender: string;
  onYes: () => void;
  onLater: () => void;
}) {
  const { cue } = useMp();
  const reduced = useReducedMotion();
  const [pick, setPick] = useState<null | "yes" | "later">(null);
  const [asking, setAsking] = useState(false);

  const yes = () => {
    if (pick) return;
    setPick("yes");
    haptic([20, 40, 20, 40, 20]);
    cue("glass-ping", { gain: 0.6 });
    cue("glass-ping", { gain: 0.5, at: 0.16, detune: 300 });
    cue("chime-cascade", { gain: 0.7, at: 0.4 });
    window.setTimeout(onYes, reduced ? 50 : 900);
  };
  const later = () => {
    if (pick) return;
    setAsking(false);
    setPick("later");
    haptic(10);
    cue("swoosh-soft", { gain: 0.4 });
    window.setTimeout(onLater, reduced ? 50 : 700);
  };

  return (
    <>
      <style>{Q_CSS}</style>
      <Head kicker="One more thing" title={question} sub={`${sender} is holding the other can 📞`} />
      <div className="mp-fill">
        <div className={`mp-tin mp-zoom${pick === "yes" ? " is-taut" : ""}${pick === "later" ? " is-slack" : ""}`}>
          <div className="mp-tin-line">
            <span className="mp-tin-can is-you">
              <Can color="var(--vw-accent)" ringing={pick === "yes"} />
              <b>{recipient}</b>
            </span>
            <svg className="mp-tin-string" viewBox="0 0 200 60" preserveAspectRatio="none" aria-hidden>
              <path className="mp-tin-path" d={pick === "yes" ? "M0 30 Q 100 30 200 30" : pick === "later" ? "M0 30 Q 100 70 200 30" : "M0 30 Q 100 52 200 30"} fill="none" strokeWidth="3" strokeLinecap="round" />
            </svg>
            <span className="mp-tin-can is-me">
              <Can color="var(--mp-pop)" ringing={pick === "yes"} />
              <b>{sender}</b>
            </span>
          </div>
          <div className="mp-tin-btns">
            <motion.button type="button" className="mp-tin-yes" onClick={yes} disabled={!!pick} whileTap={reduced ? undefined : { scale: 0.95 }} data-mp-yes>
              {yesLabel}
            </motion.button>
            {canLater ? (
              <button type="button" className="mp-tin-later" onClick={() => setAsking(true)} disabled={!!pick} data-mp-later>
                {laterLabel}
              </button>
            ) : (
              <p className="mp-tin-only">(there is only one right answer 🙈)</p>
            )}
          </div>
        </div>
      </div>
      <AnimatePresence>
        {asking && (
          <motion.div className="mp-q-sure" role="dialog" aria-modal="true" aria-labelledby="mp-q-sure-t" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="mp-q-sure-card" initial={reduced ? false : { y: 24, scale: 0.94 }} animate={{ y: 0, scale: 1 }} exit={reduced ? undefined : { y: 16, scale: 0.96 }} transition={{ type: "spring", stiffness: 320, damping: 24 }}>
              <p className="mp-q-sure-e" aria-hidden>
                🌙
              </p>
              <h3 id="mp-q-sure-t">Not tonight?</h3>
              <p className="mp-q-sure-s">That&apos;s okay. {sender} will get a soft “later” and wait for your call.</p>
              <button type="button" className="mp-q-sure-back" autoFocus onClick={() => setAsking(false)}>
                Wait, call me tonight 📞
              </button>
              <button type="button" className="mp-q-sure-no" onClick={later} data-mp-confirm-later>
                Yes, later
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

const Q_CSS = `
.mp-tin { width: min(100%, 440px); height: 100%; display: grid; grid-template-rows: auto auto; align-content: center; gap: clamp(28px, 6dvh, 56px); align-items: center; }
.mp-tin-line { position: relative; display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: 0; }
.mp-tin-can { position: relative; z-index: 1; display: grid; justify-items: center; gap: 4px; width: clamp(70px, 22cqw, 110px); }
.mp-tin-can svg { width: 100%; height: auto; filter: drop-shadow(0 10px 10px color-mix(in srgb, var(--mp-deep) 30%, transparent)); }
.mp-tin-can.is-you svg { transform: rotate(14deg); }
.mp-tin-can.is-me svg { transform: rotate(-14deg) scaleX(-1); }
.mp-tin-can b { font: 800 clamp(14px, 2dvh, 17px) ${MP_DISPLAY}; color: var(--vw-ink); max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.mp-tin-string { width: 100%; height: 60px; margin: 0 -8px; }
.mp-tin-path { stroke: color-mix(in srgb, var(--mp-deep) 70%, #FFFFFF); transition: d .5s cubic-bezier(.3,1.6,.5,1); }
.mp-tin.is-taut .mp-tin-string { animation: mp-twang .12s linear 6; }
@keyframes mp-twang { 0%, 100% { transform: translateY(0) } 50% { transform: translateY(2px) } }
.mp-can-ring { animation: mp-ring-can .14s linear 8; }
@keyframes mp-ring-can { 0%, 100% { translate: 0 0 } 25% { translate: -2px 1px } 75% { translate: 2px -1px } }
.mp-tin-btns { display: grid; gap: 10px; justify-items: center; }
.mp-tin-yes { min-width: 210px; max-width: 100%; min-height: 60px; padding: 0 26px; border-radius: 999px; border: 0; cursor: pointer; touch-action: manipulation;
  background: linear-gradient(180deg, color-mix(in srgb, var(--vw-accent) 70%, #FFFFFF), var(--vw-accent) 55%, var(--vw-accent-deep)); color: #FFFFFF; font: 800 20px ${MP_DISPLAY};
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; box-shadow: 0 5px 0 var(--mp-deep), 0 0 0 4px #FFFFFF, 0 16px 30px -12px color-mix(in srgb, var(--mp-deep) 70%, transparent); }
.mp-tin-yes:focus-visible, .mp-tin-later:focus-visible { outline: 3px solid var(--vw-ink); outline-offset: 5px; }
.mp-tin-later { min-height: 48px; padding: 0 20px; border-radius: 999px; cursor: pointer; border: 2px solid var(--vw-edge); background: color-mix(in srgb, var(--vw-paper) 85%, transparent);
  color: var(--vw-ink); font: 700 16px ${FONTS.ui}; touch-action: manipulation; }
.mp-tin-only { margin: 0; font: 500 14px ${FONTS.ui}; color: var(--vw-ink-soft); }
.mp-q-sure { position: fixed; inset: 0; z-index: 90; display: grid; place-items: center; padding: 20px; background: color-mix(in srgb, var(--mp-deep) 30%, transparent); backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px); }
.mp-q-sure-card { width: min(340px, 100%); box-sizing: border-box; padding: 22px 20px 18px; border-radius: 26px; text-align: center; display: grid; gap: 10px; justify-items: center;
  background: var(--vw-paper); color: var(--vw-ink); box-shadow: 0 0 0 3px var(--vw-edge), 0 30px 60px -20px color-mix(in srgb, var(--mp-deep) 70%, transparent); }
.mp-q-sure-e { margin: 0; font-size: 44px; line-height: 1; }
.mp-q-sure-card h3 { margin: 0; font: 800 clamp(26px, 7vw, 32px)/1.1 ${MP_DISPLAY}; }
.mp-q-sure-s { margin: 0 0 6px; font: 500 15px/1.45 ${FONTS.ui}; color: var(--vw-ink-soft); }
.mp-q-sure-back { width: 100%; min-height: 52px; border: 0; border-radius: 999px; cursor: pointer; font: 800 17px ${MP_DISPLAY}; color: #FFFFFF; background: linear-gradient(180deg, color-mix(in srgb, var(--vw-accent) 70%, #FFFFFF), var(--vw-accent)); box-shadow: 0 4px 0 var(--mp-deep); }
.mp-q-sure-no { min-height: 44px; padding: 0 18px; border: 0; background: none; cursor: pointer; font: 600 15px ${FONTS.ui}; color: var(--vw-ink-soft); text-decoration: underline; text-underline-offset: 3px; }
.mp-q-sure-back:focus-visible, .mp-q-sure-no:focus-visible { outline: 3px solid var(--vw-ink); outline-offset: 3px; }
@media (prefers-reduced-motion: reduce) { .mp-tin-path { transition: none; } .mp-tin.is-taut .mp-tin-string, .mp-can-ring { animation: none; } }
`;

// ─── The answer ─────────────────────────────────────────────────────────────

export function Answered({ said, recipient, sender, yesLine, sticker, onNext }: { said: "yes" | "later"; recipient: string; sender: string; yesLine: string; sticker: ReactNode; onNext: () => void }) {
  useNext("Watch the sunrise", onNext, "sun");
  return (
    <div className="mp-fill" style={{ alignContent: "center" }} data-mp-answered={said}>
      <div className="mp-zoom" style={{ display: "grid", gap: "clamp(8px, 1.8dvh, 16px)", justifyItems: "center", maxWidth: 420 }}>
        <div style={{ display: "grid", placeItems: "center", minHeight: 120 }}>{said === "yes" ? sticker : <span style={{ fontSize: 86, lineHeight: 1 }} aria-hidden>🌙</span>}</div>
        <h2 className="mp-title" style={{ fontSize: "clamp(30px, min(9.5vw, 5.4dvh), 48px)" }}>
          {said === "yes" ? <>{recipient} said yes!! 📞</> : <>Later it is 🌙</>}
        </h2>
        <p style={{ margin: 0, font: `400 clamp(19px, 2.8dvh, 23px)/1.35 ${MP_HAND}`, color: "var(--vw-ink)", overflowWrap: "anywhere" }}>
          {said === "yes" ? yesLine || "Phone on loud. Calling you tonight 🥹" : `No pressure at all. ${sender} will keep the phone on loud, whenever you're ready.`}
        </p>
        <p style={{ margin: 0, font: `500 14px/1.4 ${FONTS.ui}`, color: "var(--vw-ink-soft)" }}>{sender} will know you answered 💌</p>
      </div>
    </div>
  );
}

// ─── 10 · Sunrise, and the postcard ─────────────────────────────────────────

export function Ending({
  day,
  data,
  mode,
  palette,
  recipient,
  sender,
  myCity,
  yourCity,
  km,
  unit,
  stamp,
  replyText,
  onReplay,
}: {
  day: DayConfig;
  data: ValentineDayData;
  mode: "preview" | "live";
  palette: MissPremPaletteDef;
  recipient: string;
  sender: string;
  myCity: string;
  yourCity: string;
  km: number | null;
  unit: "km" | "mi";
  stamp: string;
  replyText: string;
  onReplay: () => void;
}) {
  const reduced = useReducedMotion();
  const { go, cue } = useMp();
  const [sheet, setSheet] = useState<"sunrise" | "card" | "share">("sunrise");
  const [flipped, setFlipped] = useState(false);
  const [left, setLeft] = useState(km ?? 0);
  const today = useMemo(() => new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }), []);

  useEffect(() => {
    if (sheet !== "sunrise" || reduced) return;
    const t = window.setTimeout(() => {
      burst({ kind: "petals", emojis: ["🌸", "💗", "🩵", "✨"], origin: { x: 0.5, y: 0.3 }, count: 34, spread: 0.6 });
      burst({ kind: "confetti", colors: palette.theme.confetti, origin: { x: 0.5, y: 0.35 }, count: 70 });
      cue("chime-cascade", { gain: 0.6 });
    }, 2700);
    return () => window.clearTimeout(t);
  }, [sheet, reduced, palette, cue]);

  useEffect(() => {
    if (sheet !== "sunrise" || !km || reduced) return;
    const t0 = performance.now();
    let raf = 0;
    const tick = () => {
      const f = Math.min(1, (performance.now() - t0) / 2600);
      setLeft(km * (1 - (1 - Math.pow(1 - f, 3))));
      if (f < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [sheet, km, reduced]);

  const makeOwn = () => {
    haptic(12);
    const link = typeof window !== "undefined" ? `${window.location.origin}/miss-you-premium` : "https://subhsandesh.in/miss-you-premium";
    const text = `Someone made me a whole long-distance day: radio, picnic, stars and a sunrise 🥹🩵\nMake one for your own person:\n${link}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  };

  const t = palette.theme;
  const keepsake = (): KeepsakeLayout => {
    const W = 1080;
    const items: KeepsakeItem[] = [
      { type: "text", text: "AIR MAIL · PAR AVION", x: W / 2, y: 190, size: 36, weight: 700, color: t.accentDeep, face: "ui" },
      { type: "rect", x: 80, y: 260, w: 920, h: 1420, radius: 36, fill: "#FFFFFF" },
    ];
    // The airmail border: little alternating stripes along the top and bottom edges.
    for (let k = 0; k < 15; k++) {
      const x = 100 + k * 60;
      items.push({ type: "rect", x, y: 278, w: 34, h: 16, radius: 4, fill: k % 2 ? palette.pop : t.accent });
      items.push({ type: "rect", x, y: 1646, w: 34, h: 16, radius: 4, fill: k % 2 ? t.accent : palette.pop });
    }
    items.push(
      { type: "rect", x: 760, y: 330, w: 190, h: 230, radius: 12, fill: palette.blush, stroke: t.accent, lineWidth: 6 },
      { type: "emoji", char: "🩵", x: 855, y: 445, size: 110 },
      { type: "text", text: today, x: 640, y: 470, size: 30, weight: 700, color: t.inkSoft, face: "ui" },
      { type: "emoji", char: "☀️", x: W / 2, y: 690, size: 170 },
      { type: "text", text: stamp, x: W / 2, y: 880, size: 76, weight: 700, color: t.ink, face: "serif", maxWidth: 820, maxLines: 2 },
      { type: "text", text: `${myCity || "my city"}  →  ${yourCity || "your city"}`, x: W / 2, y: 1010, size: 42, weight: 600, color: t.accentDeep, face: "ui", maxWidth: 840, maxLines: 1 },
      { type: "text", text: km ? `${fmtDistance(km, unit)} → 0 💗` : "so far → 0 💗", x: W / 2, y: 1080, size: 38, color: t.inkSoft, face: "ui" },
      { type: "text", text: `To ${recipient}`, x: W / 2, y: 1230, size: 84, face: "script", weight: 700, color: t.accentDeep, maxWidth: 840, maxLines: 1 },
    );
    if (data.endLine) items.push({ type: "text", text: data.endLine, x: W / 2, y: 1370, size: 42, face: "serif", italic: true, color: t.ink, maxWidth: 820, maxLines: 3 });
    items.push(
      { type: "text", text: `— ${sender}`, x: W / 2, y: 1560, size: 56, face: "script", color: t.ink, maxWidth: 820, maxLines: 1 },
      { type: "text", text: "Made on subhsandesh.in 🩵", x: W / 2, y: 1810, size: 30, color: t.inkSoft, face: "ui" },
    );
    return { background: { stops: [[0, palette.skies.sunrise[0]], [0.6, palette.skies.sunrise[1]], [1, palette.blush]] }, items };
  };

  const toCard = () => setSheet("card");
  useNext(
    sheet === "sunrise" ? "Your postcard 💌" : sheet === "card" ? "Keep it" : "Make one ✨",
    sheet === "sunrise" ? toCard : sheet === "card" ? () => setSheet("share") : makeOwn,
    sheet === "sunrise" ? "mail" : sheet === "card" ? "heart" : "sparkle",
    sheet !== "share",
  );

  if (sheet === "sunrise") {
    return (
      <>
        <style>{SUN_CSS}</style>
        <Head kicker="Sunrise, together" title="Distance means nothing" sub={`${myCity || "Here"} and ${yourCity || "there"}, under one sun`} />
        <div className="mp-fill">
          <div className="mp-rise mp-zoom" data-mp-sunrise>
            <span className="mp-rise-sun" aria-hidden />
            <span className="mp-rise-hill is-a" aria-hidden />
            <span className="mp-rise-hill is-b" aria-hidden />
            <span className="mp-rise-dot is-you" aria-hidden />
            <span className="mp-rise-dot is-me" aria-hidden />
            <span className="mp-rise-heart" aria-hidden>
              💗
            </span>
            <p className="mp-rise-km" aria-live="polite">
              {km ? fmtDistance(reduced ? 0 : left, unit) : unit === "mi" ? "0 miles" : "0 km"}
              <small>between us, right now</small>
            </p>
          </div>
        </div>
      </>
    );
  }

  if (sheet === "share")
    return (
      <>
        <Head kicker="Two dots, one heart" title={<>See you soon, {recipient} 🩵</>} sub={`Save your postcard, then tell ${sender}.`} />
        <style>{CARD_CSS}</style>
        <div className="mp-fill">
          <motion.div className="mp-pc is-mini" initial={reduced ? false : { opacity: 0, scale: 0.85, rotate: -8 }} animate={{ opacity: 1, scale: 1, rotate: -4 }} transition={{ type: "spring", stiffness: 180, damping: 16 }} aria-hidden>
            <span className="mp-pc-inner">
              <span className="mp-pc-face is-front">
                <span className="mp-pc-art">
                  <span className="mp-pc-sun" />
                  <span className="mp-pc-hill" />
                  <span className="mp-pc-dots">
                    <i />
                    <b>💗</b>
                    <i />
                  </span>
                </span>
                <span className="mp-pc-greet">Greetings from far away</span>
                <span className="mp-pc-title">{stamp}</span>
              </span>
            </span>
          </motion.div>
        </div>
        <div className="mp-zoom" style={{ flex: "none", width: "100%", maxWidth: 420 }}>
          <EndingActions day={day} data={data} mode={mode} onReplay={() => go(onReplay)} keepsake={keepsake} replyText={replyText} replyLabel={`💬 Reply to ${sender}`} />
        </div>
      </>
    );

  return (
    <>
      <style>{CARD_CSS}</style>
      <Head kicker="Air mail, just for you" title="A postcard to keep" sub={flipped ? undefined : "Tap it to turn it over"} />
      <div className="mp-fill">
        <button
          type="button"
          className={`mp-pc mp-zoom${flipped ? " is-flipped" : ""}`}
          onClick={() => {
            setFlipped((f) => !f);
            haptic(10);
            cue("paper-rustle", { gain: 0.5 });
          }}
          aria-label={flipped ? "Turn the postcard to the front" : "Turn the postcard over"}
          data-mp-postcard={flipped ? "back" : "front"}
        >
          <span className="mp-pc-inner">
            <span className="mp-pc-face is-front">
              <span className="mp-pc-art" aria-hidden>
                <span className="mp-pc-sun" />
                <span className="mp-pc-hill" />
                <span className="mp-pc-dots">
                  <i />
                  <b>💗</b>
                  <i />
                </span>
              </span>
              <span className="mp-pc-greet">Greetings from far away</span>
              <span className="mp-pc-title">{stamp}</span>
              <span className="mp-pc-route">
                {myCity || "my city"} → {yourCity || "your city"}
              </span>
            </span>
            <span className="mp-pc-face is-back">
              <span className="mp-pc-msg">
                <span className="mp-pc-line">{data.endLine || "Distance means so little when someone means so much 💗"}</span>
                <span className="mp-pc-sign">— {sender}</span>
              </span>
              <span className="mp-pc-addr">
                <span className="mp-pc-stamp" aria-hidden>
                  🩵
                </span>
                <span className="mp-pc-postmark" aria-hidden>
                  {today}
                </span>
                <span className="mp-pc-to">To: {recipient}</span>
                <span className="mp-pc-rule">{yourCity || "wherever you are"}</span>
                <span className="mp-pc-rule">{km ? `${fmtDistance(km, unit)} → 0` : "♥"}</span>
              </span>
            </span>
          </span>
        </button>
      </div>
    </>
  );
}

const SUN_CSS = `
.mp-rise { position: relative; width: min(100%, 440px); height: 100%; max-height: 520px; border-radius: 30px; overflow: hidden;
  background: linear-gradient(180deg, color-mix(in srgb, var(--mp-blush) 60%, #FFFFFF), #FFF3DC 70%); box-shadow: 0 0 0 3px #FFFFFF, 0 24px 40px -24px color-mix(in srgb, var(--mp-deep) 60%, transparent); }
.mp-rise-sun { position: absolute; left: 50%; bottom: 18%; width: 44%; aspect-ratio: 1; border-radius: 50%; translate: -50% 0;
  background: radial-gradient(circle, #FFFDF2 0 30%, #FFE7A8 62%, #FFC98A); box-shadow: 0 0 60px 30px rgba(255,220,150,.6), 0 0 140px 60px rgba(255,200,190,.4); animation: mp-sunup 2.8s cubic-bezier(.2,.7,.2,1) both; }
@keyframes mp-sunup { from { transform: translateY(70%) } to { transform: translateY(0) } }
.mp-rise-hill { position: absolute; left: -10%; right: -10%; border-radius: 50% 50% 0 0; }
.mp-rise-hill.is-a { bottom: -14%; height: 40%; background: color-mix(in srgb, var(--vw-accent) 22%, #FFFFFF); }
.mp-rise-hill.is-b { bottom: -24%; height: 40%; left: 20%; right: -30%; background: color-mix(in srgb, var(--mp-pop) 24%, #FFFFFF); }
.mp-rise-dot { position: absolute; top: 34%; width: 26px; height: 26px; margin: -13px; border-radius: 50%; border: 4px solid #FFFFFF; box-shadow: 0 6px 12px -4px rgba(0,0,0,.2); }
.mp-rise-dot.is-you { left: 50%; background: var(--vw-accent); animation: mp-meet-l 2.6s cubic-bezier(.5,0,.3,1) both; }
.mp-rise-dot.is-me { left: 50%; background: var(--mp-pop); animation: mp-meet-r 2.6s cubic-bezier(.5,0,.3,1) both; }
@keyframes mp-meet-l { 0% { transform: translateX(-160px) } 85% { transform: translateX(-12px) } 100% { transform: translateX(-12px) scale(0) } }
@keyframes mp-meet-r { 0% { transform: translateX(160px) } 85% { transform: translateX(12px) } 100% { transform: translateX(12px) scale(0) } }
.mp-rise-heart { position: absolute; left: 50%; top: 34%; font-size: 56px; line-height: 1; translate: -50% -50%; animation: mp-heart-pop 3.4s cubic-bezier(.3,1.6,.5,1) both; }
@keyframes mp-heart-pop { 0%, 72% { transform: scale(0) } 86% { transform: scale(1.3) } 100% { transform: scale(1) } }
.mp-rise-km { position: absolute; left: 0; right: 0; bottom: 6%; margin: 0; display: grid; gap: 2px; font: 800 clamp(30px, 5.4dvh, 44px)/1 ${MP_DISPLAY}; color: var(--vw-ink); font-variant-numeric: tabular-nums; }
.mp-rise-km small { font: 600 14px ${FONTS.ui}; color: var(--vw-ink-soft); }
@media (prefers-reduced-motion: reduce) { .mp-rise-sun, .mp-rise-dot, .mp-rise-heart { animation-duration: .01s !important; } }
`;

const CARD_CSS = `
.mp-pc { position: relative; width: min(100%, 140cqh, 440px); aspect-ratio: 1.42; border: 0; padding: 0; background: none; cursor: pointer; perspective: 1200px; touch-action: manipulation; }
.mp-pc.is-mini { width: min(80%, 120cqh, 300px); cursor: default; }
.mp-pc:focus-visible { outline: 3px solid var(--vw-ink); outline-offset: 6px; border-radius: 14px; }
.mp-pc-inner { position: absolute; inset: 0; transform-style: preserve-3d; transition: transform .8s cubic-bezier(.3,1.2,.4,1); }
.mp-pc.is-flipped .mp-pc-inner { transform: rotateY(180deg); }
.mp-pc-face { position: absolute; inset: 0; backface-visibility: hidden; -webkit-backface-visibility: hidden; border-radius: 12px; overflow: hidden; box-sizing: border-box; background: #FFFDF8;
  box-shadow: 0 0 0 1px rgba(0,0,0,.05), 0 26px 40px -22px color-mix(in srgb, var(--mp-deep) 70%, transparent); }
.mp-pc-face::before { content: ""; position: absolute; inset: 0; border: 7px solid transparent; border-radius: inherit; pointer-events: none;
  border-image: repeating-linear-gradient(135deg, var(--vw-accent) 0 12px, #FFFFFF 12px 20px, var(--mp-pop) 20px 32px, #FFFFFF 32px 40px) 7; }
.mp-pc-face.is-front { display: grid; grid-template-rows: 1fr auto auto auto; justify-items: center; padding: 14px 14px 12px; }
.mp-pc-art { position: relative; width: 100%; height: 100%; min-height: 0; border-radius: 8px; overflow: hidden; background: linear-gradient(180deg, var(--mp-blush), #FFF1D9); }
.mp-pc-sun { position: absolute; left: 50%; bottom: 10%; width: 32%; aspect-ratio: 1; translate: -50% 0; border-radius: 50%; background: radial-gradient(circle, #FFFDF2 0 35%, #FFD88E); box-shadow: 0 0 30px 12px rgba(255,220,150,.55); }
.mp-pc-hill { position: absolute; left: -10%; right: -10%; bottom: -40%; height: 70%; border-radius: 50%; background: color-mix(in srgb, var(--vw-accent) 25%, #FFFFFF); }
.mp-pc-dots { position: absolute; left: 50%; top: 22%; translate: -50% 0; display: flex; align-items: center; gap: 4px; }
.mp-pc-dots i { width: 14px; height: 14px; border-radius: 50%; border: 3px solid #FFFFFF; background: var(--vw-accent); }
.mp-pc-dots i:last-child { background: var(--mp-pop); }
.mp-pc-dots b { font-size: 22px; line-height: 1; }
.mp-pc-greet { margin-top: 6px; font: 700 11px ${FONTS.ui}; letter-spacing: .16em; text-transform: uppercase; color: var(--vw-ink-soft); }
.mp-pc-title { font: 800 clamp(20px, 6cqw, 28px)/1.1 ${MP_DISPLAY}; color: var(--vw-accent-deep); text-wrap: balance; overflow-wrap: anywhere; }
.mp-pc-route { font: 600 13px ${FONTS.ui}; color: var(--vw-ink); overflow-wrap: anywhere; }
.mp-pc-face.is-back { transform: rotateY(180deg); display: grid; grid-template-columns: 1.15fr 1fr; padding: 16px 14px; gap: 10px; text-align: left; }
.mp-pc-msg { display: grid; align-content: center; gap: 8px; padding-right: 10px; border-right: 2px solid color-mix(in srgb, var(--vw-ink) 15%, transparent); min-width: 0; }
.mp-pc-line { font: 400 clamp(15px, 4.4cqw, 19px)/1.3 ${MP_HAND}; color: #3B2A33; overflow-wrap: anywhere; display: -webkit-box; -webkit-line-clamp: 6; -webkit-box-orient: vertical; overflow: hidden; }
.mp-pc-sign { font: 700 clamp(16px, 4.6cqw, 20px) ${MP_HAND}; color: var(--vw-accent-deep); }
.mp-pc-addr { position: relative; display: grid; align-content: end; gap: 8px; min-width: 0; padding-bottom: 6px; }
.mp-pc-stamp { position: absolute; right: 0; top: 0; width: 46px; height: 54px; display: grid; place-items: center; font-size: 26px; background: var(--mp-blush);
  outline: 3px dotted #FFFFFF; outline-offset: -3px; box-shadow: 0 0 0 2px var(--vw-accent); }
.mp-pc-postmark { position: absolute; right: 30px; top: 30px; width: 58px; height: 58px; border-radius: 50%; border: 2px solid color-mix(in srgb, var(--vw-ink) 40%, transparent); display: grid; place-items: center; text-align: center;
  font: 700 8.5px/1.1 ${FONTS.ui}; color: color-mix(in srgb, var(--vw-ink) 55%, transparent); transform: rotate(-14deg); padding: 6px; box-sizing: border-box; }
.mp-pc-to { font: 700 clamp(17px, 5cqw, 21px) ${MP_HAND}; color: #3B2A33; overflow-wrap: anywhere; }
.mp-pc-rule { font: 400 clamp(14px, 4cqw, 17px) ${MP_HAND}; color: #5B4A52; border-bottom: 1.5px solid color-mix(in srgb, var(--vw-ink) 20%, transparent); padding-bottom: 2px; overflow-wrap: anywhere; }
@media (prefers-reduced-motion: reduce) { .mp-pc-inner { transition-duration: .01s; } }
`;
