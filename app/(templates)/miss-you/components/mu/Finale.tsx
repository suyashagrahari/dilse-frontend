"use client";

// Scenes 9–11: the question ("Video call tonight?"), the answer, and the
// "See you soon" boarding pass.
//
// How No behaves is the SENDER's choice (extras.answerMode), as on Sorry:
//   • "yesOnly" (default): reach for No and it gets shy — it shrinks and hops
//     away with a new pleading line while YES grows; after five tries it gives
//     up and turns into a second YES.
//   • "noAfterTries": No hops `tries` times (4 or 5), then stops and becomes an
//     honest "Not tonight 🌙". Pressing it asks once more, kindly; confirming
//     records a gentle "no" (the sender sees it on their card and by email).

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { EndingActions, haptic, useReducedMotion, type KeepsakeItem, type KeepsakeLayout } from "../../../_valentine/kit";
import type { AnswerRule } from "../../../_valentine/kit/answer";
import type { MissYouPaletteDef } from "../../../_valentine/days/miss-you";
import type { DayConfig, ValentineDayData } from "../../../_valentine/types";
import { FONTS } from "../../../_valentine/theme";
import { PhoneHeart, Star } from "./art";
import { MU_DISPLAY, MU_HAND } from "./fonts";
import { PlaneGlyph, useMu, useNext } from "./stage";
import { Head } from "./ui";

const SURRENDER_AT = 5;
const PLEADING = ["are you sure? 🥺", "just 5 minutes?", "pls pls pls 🥹", "I miss your face", "last time I ask 🥺"];

// ─── 9 · The question ───────────────────────────────────────────────────────

export function Question({
  question,
  yesLabel,
  noLines,
  timeLabel,
  sender,
  rule,
  onYes,
  onNo,
}: {
  question: string;
  yesLabel: string;
  noLines: readonly string[];
  timeLabel: string;
  sender: string;
  rule: AnswerRule;
  onYes: (dodges: number) => void;
  onNo: (dodges: number) => void;
}) {
  const reduced = useReducedMotion();
  const { cue } = useMu();
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
    cue("kiss", { gain: 0.6, at: 0.15 });
    onYes(dodgesRef.current);
  };

  const dodge = useCallback(() => {
    if (busy.current || dodgesRef.current >= limit) return;
    busy.current = true;
    lastDodge.current = performance.now();
    dodgesRef.current += 1;
    haptic(12);
    cue("plush-squeak", { gain: 0.65, detune: dodgesRef.current * 80 });
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

  const lines = canSayNo ? PLEADING : noLines.length ? noLines : ["pls? 🥺"];
  const noLabel = surrendered ? "Okay okay… yes 💗" : unlocked ? timeLabel : dodges === 0 ? "No" : lines[(dodges - 1) % lines.length];
  const [fit, setFit] = useState(1.3);
  useLayoutEffect(() => {
    const a = arenaRef.current;
    const y = yesRef.current;
    if (!a || !y || !y.offsetWidth) return;
    setFit(Math.max(1, Math.min(1.3, (a.clientWidth - 24) / y.offsetWidth)));
  }, [dodges]);
  const yesScale = tired ? 1 : Math.min(fit, Math.pow(1.06, dodges));

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
      <Head kicker="One tiny question" title={question} />
      <div className="mu-q-art" aria-hidden>
        <PhoneHeart size="100%" />
      </div>
      <div ref={arenaRef} className={`mu-q-arena${tired ? " is-settled" : ""}`} data-mu-answer-mode={rule.mode}>
        <motion.button
          ref={yesRef}
          type="button"
          onClick={yes}
          className="mu-q-yes"
          data-mu-yes
          initial={false}
          animate={{ x: "-50%", y: "-50%", scale: yesScale }}
          transition={{ type: "spring", stiffness: 260, damping: 14 }}
        >
          {yesLabel}
        </motion.button>
        <button
          ref={noRef}
          type="button"
          className={`mu-q-no${surrendered ? " is-yes" : ""}${unlocked ? " is-free" : ""}${hopping ? " is-hop" : ""}`}
          data-mu-no={unlocked ? "free" : surrendered ? "yes" : "running"}
          aria-label={surrendered ? "Okay okay, yes" : unlocked ? timeLabel : `No — ${noLabel}`}
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
          {dodges > 0 && !tired ? `No ran away. ${noLabel}` : unlocked ? `No stopped running. It now says: ${timeLabel}` : ""}
        </span>
      </div>
      <div style={{ flex: "none", minHeight: 24 }}>
        {dodges > 0 && !tired && (
          <p style={{ margin: 0, font: `700 clamp(15px, 2.3dvh, 18px) ${MU_DISPLAY}`, color: "var(--mu-kick)" }}>
            No ran away ×{dodges} 🥺{canSayNo ? ` · ${limit - dodges} more ${limit - dodges === 1 ? "try" : "tries"}` : ""}
          </p>
        )}
        {unlocked && <p style={{ margin: 0, font: `500 clamp(13px, 2dvh, 15px) ${FONTS.ui}`, color: "var(--vw-ink-soft)" }}>It&apos;s really your choice. Either is okay 🤍</p>}
      </div>

      <AnimatePresence>
        {asking && (
          <motion.div className="mu-q-sure" role="dialog" aria-modal="true" aria-labelledby="mu-q-sure-t" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduced ? 0 : 0.22 }}>
            <motion.div className="mu-q-sure-card" initial={reduced ? false : { y: 24, scale: 0.94 }} animate={{ y: 0, scale: 1 }} exit={reduced ? undefined : { y: 16, scale: 0.96 }} transition={{ type: "spring", stiffness: 320, damping: 24 }}>
              <p className="mu-q-sure-e" aria-hidden>
                🌙
              </p>
              <h3 id="mu-q-sure-t">Not tonight?</h3>
              <p className="mu-q-sure-s">That&apos;s completely okay. {sender} will understand, and the moon will keep you both company.</p>
              <button type="button" className="mu-q-sure-back" autoFocus onClick={() => setAsking(false)}>
                Wait, let&apos;s talk 💗
              </button>
              <button
                type="button"
                className="mu-q-sure-no"
                data-mu-confirm-no
                onClick={() => {
                  setAsking(false);
                  onNo(dodgesRef.current);
                }}
              >
                Yes, another night
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

const Q_CSS = `
.mu-q-art { flex: none; width: clamp(110px, 19dvh, calc(170px * var(--vw-s, 1))); filter: drop-shadow(0 12px 18px color-mix(in srgb, var(--mu-deep) 30%, transparent)); }
.mu-q-art svg { width: 100%; height: auto; display: block; }
.mu-q-arena { position: relative; flex: 1 1 0; min-height: 150px; width: 100%; max-width: calc(420px * var(--vw-s, 1)); max-height: 300px; }
.mu-q-yes { position: absolute; left: 50%; top: 32%; min-width: 150px; max-width: calc(100% - 24px); min-height: 58px; padding: 14px 24px; border-radius: 999px; border: 0; z-index: 2; cursor: pointer; touch-action: manipulation;
  background: linear-gradient(180deg, color-mix(in srgb, var(--vw-accent) 70%, #FFFFFF), var(--vw-accent) 55%, var(--vw-accent-deep)); color: #FFFFFF; font: 800 19px ${MU_DISPLAY};
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; text-shadow: 0 1px 0 color-mix(in srgb, var(--mu-deep) 60%, transparent);
  box-shadow: 0 5px 0 var(--mu-deep), 0 0 0 4px color-mix(in srgb, var(--vw-paper) 70%, transparent), 0 16px 30px -12px color-mix(in srgb, var(--mu-deep) 70%, transparent); }
.mu-q-yes:focus-visible { outline: 3px solid var(--vw-ink); outline-offset: 4px; }
.mu-q-no { position: absolute; min-height: 46px; min-width: 84px; max-width: calc(100% - 16px); padding: 11px 18px; border-radius: 999px; z-index: 3; cursor: pointer; touch-action: manipulation;
  border: 2px dashed var(--vw-edge); background: color-mix(in srgb, var(--vw-paper) 85%, transparent); color: var(--vw-ink-soft); font: 700 16px ${FONTS.ui};
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; transition: opacity .25s ease, scale .25s ease, translate .25s ease; }
.mu-q-no.is-hop { opacity: 0; translate: 0 -14px; }
.mu-q-no.is-yes { border: 0; background: linear-gradient(180deg, color-mix(in srgb, var(--vw-accent) 70%, #FFFFFF), var(--vw-accent)); color: #FFFFFF; box-shadow: 0 5px 0 var(--mu-deep); }
.mu-q-no.is-free { border-style: solid; color: var(--vw-ink); font-weight: 600; }
.mu-q-no:focus-visible { outline: 3px solid var(--vw-ink); outline-offset: 4px; }
.mu-q-arena.is-settled .mu-q-yes { top: 36%; }
.mu-q-arena.is-settled .mu-q-no { left: 50%; top: calc(36% + 42px); transform: translateX(-50%); transition: none; scale: none; }
.mu-q-sure { position: fixed; inset: 0; z-index: 90; display: grid; place-items: center; padding: 20px; background: color-mix(in srgb, var(--mu-deep) 40%, rgba(0,0,0,.25)); backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px); }
.mu-q-sure-card { width: min(340px, 100%); box-sizing: border-box; padding: 22px 20px 18px; border-radius: 26px; text-align: center; display: grid; gap: 10px; justify-items: center;
  background: var(--vw-paper); color: var(--vw-ink); box-shadow: 0 0 0 3px var(--vw-edge), 0 30px 60px -20px rgba(0,0,0,.5); }
.mu-q-sure-e { margin: 0; font-size: 44px; line-height: 1; }
.mu-q-sure-card h3 { margin: 0; font: 800 clamp(26px, 7vw, 32px)/1.1 ${MU_DISPLAY}; }
.mu-q-sure-s { margin: 0 0 6px; font: 500 15px/1.45 ${FONTS.ui}; color: var(--vw-ink-soft); }
.mu-q-sure-back { width: 100%; min-height: 52px; border: 0; border-radius: 999px; cursor: pointer; font: 800 17px ${MU_DISPLAY}; color: #FFFFFF;
  background: linear-gradient(180deg, color-mix(in srgb, var(--vw-accent) 70%, #FFFFFF), var(--vw-accent)); box-shadow: 0 4px 0 var(--mu-deep); }
.mu-q-sure-no { min-height: 44px; padding: 0 18px; border: 0; background: none; cursor: pointer; font: 600 15px ${FONTS.ui}; color: var(--vw-ink-soft); text-decoration: underline; text-underline-offset: 3px; }
.mu-q-sure-back:focus-visible, .mu-q-sure-no:focus-visible { outline: 3px solid var(--vw-ink); outline-offset: 3px; }
@media (prefers-reduced-motion: reduce) { .mu-q-no { transition: none; } }
`;

// ─── 10 · The answer ────────────────────────────────────────────────────────

export function YesRoom({ recipient, yesLine, dodges, sticker, onNext }: { recipient: string; yesLine: string; dodges: number; sticker: ReactNode; onNext: () => void }) {
  useNext("Your boarding pass", onNext, "ticket");
  return (
    <div className="mu-fill" style={{ alignContent: "center" }}>
      <div className="mu-zoom" style={{ display: "grid", gap: "clamp(8px, 1.8dvh, 16px)", justifyItems: "center" }}>
        <div style={{ display: "grid", placeItems: "center", minHeight: "min(30cqh, 170px)" }}>{sticker ?? <span style={{ fontSize: 80 }}>💗</span>}</div>
        <h2 className="mu-title" style={{ fontSize: "clamp(32px, min(10vw, 5.6dvh), 50px)" }}>
          {recipient} said yes!! 📞💗
        </h2>
        <p style={{ margin: "0 auto", maxWidth: 360, font: `700 clamp(21px, 3.1dvh, 25px)/1.3 ${MU_HAND}`, color: "var(--vw-ink)", overflowWrap: "anywhere" }}>
          {yesLine || "Calling you tonight. Don't fall asleep before I do 🥹"}
        </p>
        {dodges > 0 && (
          <p style={{ margin: 0, font: `700 clamp(15px, 2.3dvh, 18px) ${MU_DISPLAY}`, color: "var(--mu-kick)" }}>
            …after No ran away {dodges} {dodges === 1 ? "time" : "times"} 🥹
          </p>
        )}
      </div>
    </div>
  );
}

export function NightRoom({ sender, recipient, onReplay }: { sender: string; recipient: string; onReplay: () => void }) {
  const { go } = useMu();
  const tell = () => {
    const text = `Saw your page, ${sender} 🥹 Not tonight, but I miss you too. Same moon 🌙`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  };
  useNext(`Tell ${sender}`, tell, "moon", false);
  return (
    <div className="mu-fill" style={{ alignContent: "center" }} data-mu-declined>
      <div className="mu-zoom" style={{ display: "grid", gap: "clamp(10px, 2dvh, 18px)", justifyItems: "center", maxWidth: 420 }}>
        <div style={{ fontSize: "clamp(64px, 11dvh, 92px)", lineHeight: 1 }} aria-hidden>
          🌙
        </div>
        <h2 className="mu-title">Okay, another night 🤍</h2>
        <p style={{ margin: 0, font: `700 clamp(21px, 3dvh, 24px)/1.3 ${MU_HAND}`, color: "var(--vw-ink)", overflowWrap: "anywhere" }}>
          Sleep well, {recipient}. Look up before you do — {sender} is under the same moon, missing you.
        </p>
        <p style={{ margin: 0, font: `500 14px/1.4 ${FONTS.ui}`, color: "var(--vw-ink-soft)" }}>{sender} will know you answered, gently.</p>
        <button type="button" onClick={() => go(onReplay)} className="mu-ghost">
          Watch it again 💗
        </button>
      </div>
    </div>
  );
}

// ─── 11 · The "See you soon" boarding pass ──────────────────────────────────

export function Ending({
  day,
  data,
  mode,
  palette,
  recipient,
  sender,
  fromCity,
  toCity,
  fromCode,
  toCode,
  dateLabel,
  seat,
  replyText,
  onReplay,
}: {
  day: DayConfig;
  data: ValentineDayData;
  mode: "preview" | "live";
  palette: MissYouPaletteDef;
  recipient: string;
  sender: string;
  fromCity: string;
  toCity: string;
  fromCode: string;
  toCode: string;
  dateLabel: string;
  seat: string;
  replyText: string;
  onReplay: () => void;
}) {
  const reduced = useReducedMotion();
  const [sheet, setSheet] = useState<"pass" | "share">("pass");
  const { go } = useMu();
  const bars = useMemo(() => {
    let h = 17;
    for (const ch of `${recipient}${sender}${fromCode}${toCode}`) h = (h * 31 + ch.charCodeAt(0)) % 99991;
    return Array.from({ length: 34 }, (_, k) => 1 + ((h >> k % 13) + k * 7) % 4);
  }, [recipient, sender, fromCode, toCode]);
  const pnr = useMemo(() => {
    let h = 7;
    for (const ch of `${recipient}${sender}`) h = (h * 33 + ch.charCodeAt(0)) % 46655;
    return `MY${h.toString(36).toUpperCase().padStart(3, "0")}143`;
  }, [recipient, sender]);

  const makeOwn = () => {
    haptic(12);
    const link = typeof window !== "undefined" ? `${window.location.origin}/miss-you` : "https://subhsandesh.in/miss-you";
    const text = `Someone sent me the cutest "I miss you" page ever 🥹💗\nMake one for your own person:\n${link}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  };

  const t = palette.theme;
  const ink = "#2E2547";
  const soft = "#7A7095";
  const keepsake = (): KeepsakeLayout => {
    const W = 1080;
    const items: KeepsakeItem[] = [
      { type: "text", text: "SEE YOU SOON", x: W / 2, y: 200, size: 40, weight: 700, color: t.dark ? t.gold : t.accentDeep, face: "ui" },
      { type: "text", text: `${sender} ✈ ${recipient}`, x: W / 2, y: 290, size: 76, weight: 700, color: t.ink, face: "script", maxWidth: 960, maxLines: 1 },
      { type: "rect", x: 90, y: 380, w: 900, h: 1220, radius: 52, fill: "#FFFFFF" },
      { type: "rect", x: 90, y: 380, w: 900, h: 150, radius: 52, fill: t.accent },
      { type: "rect", x: 90, y: 470, w: 900, h: 60, fill: t.accent },
      { type: "text", text: "MISS YOU AIRWAYS  ·  BOARDING PASS", x: W / 2, y: 472, size: 34, weight: 700, color: "#FFFFFF", face: "ui" },
      { type: "text", text: fromCode, x: 270, y: 700, size: 130, weight: 800, color: ink, face: "ui" },
      { type: "text", text: toCode, x: 810, y: 700, size: 130, weight: 800, color: ink, face: "ui" },
      { type: "emoji", char: "✈️", x: W / 2, y: 660, size: 80 },
      { type: "text", text: fromCity, x: 270, y: 770, size: 34, weight: 600, color: soft, face: "ui", maxWidth: 360, maxLines: 1 },
      { type: "text", text: toCity, x: 810, y: 770, size: 34, weight: 600, color: soft, face: "ui", maxWidth: 360, maxLines: 1 },
      { type: "text", text: "PASSENGER", x: 270, y: 900, size: 26, weight: 700, color: soft, face: "ui" },
      { type: "text", text: sender, x: 270, y: 960, size: 48, weight: 700, color: ink, face: "ui", maxWidth: 380, maxLines: 1 },
      { type: "text", text: "DESTINATION", x: 810, y: 900, size: 26, weight: 700, color: soft, face: "ui" },
      { type: "text", text: recipient, x: 810, y: 960, size: 48, weight: 700, color: ink, face: "ui", maxWidth: 380, maxLines: 1 },
      { type: "text", text: "DATE", x: 270, y: 1080, size: 26, weight: 700, color: soft, face: "ui" },
      { type: "text", text: dateLabel, x: 270, y: 1140, size: 44, weight: 700, color: t.accentDeep, face: "ui", maxWidth: 380, maxLines: 1 },
      { type: "text", text: "GATE", x: 810, y: 1080, size: 26, weight: 700, color: soft, face: "ui" },
      { type: "text", text: "Your arms", x: 810, y: 1140, size: 44, weight: 700, color: t.accentDeep, face: "ui" },
      { type: "text", text: "SEAT", x: W / 2, y: 1260, size: 26, weight: 700, color: soft, face: "ui" },
      { type: "text", text: seat, x: W / 2, y: 1320, size: 44, weight: 700, color: ink, face: "ui", maxWidth: 820, maxLines: 1 },
      { type: "rect", x: 150, y: 1410, w: 780, h: 4, fill: "#E4DEF0" },
      { type: "text", text: `PNR ${pnr}  ·  Boarding: as soon as possible`, x: W / 2, y: 1500, size: 30, weight: 600, color: soft, face: "ui" },
    ];
    if (data.endLine) items.push({ type: "text", text: data.endLine, x: W / 2, y: 1720, size: 42, face: "serif", italic: true, color: t.ink, maxWidth: 940, maxLines: 2 });
    items.push({ type: "text", text: "Made on subhsandesh.in 💗", x: W / 2, y: 1860, size: 30, color: t.inkSoft, face: "ui" });
    return { background: { stops: [[0, t.base], [0.55, palette.blush], [1, t.base]] }, items };
  };

  useNext(sheet === "pass" ? "Keep it" : "Make one ✨", sheet === "pass" ? () => setSheet("share") : makeOwn, sheet === "pass" ? "heart" : "sparkle", sheet === "pass");

  if (sheet === "share")
    return (
      <>
        <style>{PASS_CSS}</style>
        <Head kicker="Until then" title={<>See you soon, {recipient} 🥹</>} sub={`Save your boarding pass, then tell ${sender}.`} />
        <div className="mu-fill">
          <motion.div className="mu-bye" initial={reduced ? false : { opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", stiffness: 180, damping: 16 }} aria-hidden>
            <span className="mu-bye-plane">
              <PlaneGlyph size="100%" />
            </span>
            <span className="mu-bye-heart">💗</span>
          </motion.div>
        </div>
        <div className="mu-zoom" style={{ flex: "none", width: "100%", maxWidth: 420 }}>
          <EndingActions day={day} data={data} mode={mode} onReplay={() => go(onReplay)} keepsake={keepsake} replyText={replyText} replyLabel={`💬 Reply to ${sender}`} />
        </div>
      </>
    );

  return (
    <>
      <style>{PASS_CSS}</style>
      <Head kicker="One last thing" title="Your ticket to me" />
      <div className="mu-fill">
        <motion.div className="mu-pass mu-zoom" initial={reduced ? false : { opacity: 0, y: 60, rotate: -4 }} animate={{ opacity: 1, y: 0, rotate: 0 }} transition={{ type: "spring", stiffness: 140, damping: 16 }} data-mu-pass>
          <div className="mu-pass-top">
            <span>✈︎ Miss You Airways</span>
            <span>Boarding pass</span>
          </div>
          <div className="mu-pass-route">
            <div>
              <b>{fromCode}</b>
              <small>{fromCity}</small>
            </div>
            <span className="mu-pass-fly" aria-hidden>
              <i />
              <span className="mu-pass-fly-p">
                <PlaneGlyph size="100%" color="var(--vw-accent)" fold="#FFFFFF" />
              </span>
            </span>
            <div>
              <b>{toCode}</b>
              <small>{toCity}</small>
            </div>
          </div>
          <dl className="mu-pass-grid">
            <div>
              <dt>Passenger</dt>
              <dd>{sender}</dd>
            </div>
            <div>
              <dt>Destination</dt>
              <dd>{recipient}</dd>
            </div>
            <div>
              <dt>Date</dt>
              <dd className="is-hi">{dateLabel}</dd>
            </div>
            <div>
              <dt>Gate</dt>
              <dd className="is-hi">Your arms</dd>
            </div>
            <div className="is-wide">
              <dt>Seat</dt>
              <dd>{seat}</dd>
            </div>
          </dl>
          <div className="mu-pass-tear" aria-hidden />
          <div className="mu-pass-stub">
            <span className="mu-pass-code">
              <span className="mu-pass-bars" aria-hidden>
                {bars.map((w, k) => (
                  <i key={k} style={{ width: w * 1.6 }} />
                ))}
              </span>
              <span className="mu-pass-pnr">PNR {pnr} · Boarding: ASAP</span>
            </span>
            <span className="mu-pass-stamp" aria-hidden>
              <Star size={14} color="currentColor" /> SEE YOU
              <br />
              SOON
            </span>
          </div>
          {data.endLine && <p className="mu-pass-end">{data.endLine}</p>}
        </motion.div>
      </div>
    </>
  );
}

const PASS_CSS = `
.mu-pass { position: relative; width: min(100%, 370px); max-height: 100%; box-sizing: border-box; border-radius: 24px; overflow: hidden; background: #FFFFFF; color: #2E2547; text-align: left;
  box-shadow: 0 0 0 2px var(--vw-edge), 0 30px 50px -24px rgba(0,0,0,.45); display: grid; }
.mu-pass-top { display: flex; justify-content: space-between; gap: 8px; padding: 12px 18px; background: linear-gradient(90deg, var(--vw-accent), var(--vw-accent-deep)); color: #FFFFFF;
  font: 800 12px ${FONTS.ui}; letter-spacing: .12em; text-transform: uppercase; }
.mu-pass-route { display: grid; grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr); align-items: center; gap: 8px; padding: clamp(10px, 2dvh, 16px) 18px 4px; }
.mu-pass-route > div { display: grid; min-width: 0; }
.mu-pass-route > div:last-child { text-align: right; }
.mu-pass-route b { font: 800 clamp(34px, 6dvh, 44px)/1 ${MU_DISPLAY}; letter-spacing: .02em; color: #2E2547; }
.mu-pass-route small { font: 600 12.5px ${FONTS.ui}; color: #7A7095; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.mu-pass-fly { position: relative; width: 74px; height: 26px; }
.mu-pass-fly i { position: absolute; left: 0; right: 0; top: 50%; border-top: 2px dashed #CFC6E4; }
.mu-pass-fly-p { position: absolute; top: -2px; width: 30px; left: 0; animation: mu-pass-fly 2.8s ease-in-out infinite; }
@keyframes mu-pass-fly { 0% { left: 0; opacity: 0 } 15% { opacity: 1 } 85% { opacity: 1 } 100% { left: calc(100% - 30px); opacity: 0 } }
.mu-pass-grid { margin: 0; padding: 8px 18px 12px; display: grid; grid-template-columns: 1fr 1fr; gap: clamp(6px, 1.2dvh, 10px) 12px; }
.mu-pass-grid > div { min-width: 0; }
.mu-pass-grid .is-wide { grid-column: 1 / -1; }
.mu-pass-grid dt { font: 700 10.5px ${FONTS.ui}; letter-spacing: .14em; text-transform: uppercase; color: #9A91B3; }
.mu-pass-grid dd { margin: 1px 0 0; font: 800 clamp(16px, 2.5dvh, 19px)/1.2 ${MU_DISPLAY}; color: #2E2547; overflow-wrap: anywhere; }
.mu-pass-grid dd.is-hi { color: #C2417A; }
.mu-pass-tear { position: relative; height: 0; border-top: 2.5px dashed #DCD5EA; margin: 0 14px; }
.mu-pass-tear::before, .mu-pass-tear::after { content: ""; position: absolute; top: -13px; width: 24px; height: 24px; border-radius: 50%; background: var(--vw-base, #1A1F4B); box-shadow: inset 0 0 0 2px var(--vw-edge); }
.mu-pass-tear::before { left: -27px; } .mu-pass-tear::after { right: -27px; }
.mu-pass-stub { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 12px 18px 14px; }
.mu-pass-code { display: grid; gap: 4px; min-width: 0; }
.mu-pass-bars { display: flex; align-items: stretch; gap: 2px; height: 36px; overflow: hidden; }
.mu-pass-bars i { display: block; background: #2E2547; border-radius: 1px; }
.mu-pass-pnr { font: 700 9.5px/1.3 ${FONTS.ui}; letter-spacing: .08em; color: #7A7095; text-transform: uppercase; white-space: nowrap; }
.mu-pass-stamp { flex: none; display: inline-block; text-align: center; line-height: 1.2; padding: 4px 9px; border: 2.5px solid #C2417A; border-radius: 8px; transform: rotate(-12deg);
  font: 800 12px ${FONTS.ui}; letter-spacing: .1em; color: #C2417A; background: rgba(255,255,255,.85); animation: mu-stamp .55s cubic-bezier(.3,1.6,.5,1) .7s both; }
@keyframes mu-stamp { from { transform: rotate(-12deg) scale(2.4); opacity: 0 } to { transform: rotate(-12deg) scale(1); opacity: 1 } }
.mu-pass-end { margin: 0; padding: 10px 18px 14px; border-top: 1px solid #EEE9F6; font: 700 clamp(19px, 2.8dvh, 22px)/1.2 ${MU_HAND}; color: #2E2547; text-align: center; overflow-wrap: anywhere; background: #FBF9FE; }
.mu-bye { position: relative; width: min(56cqh, 70cqw, 240px); aspect-ratio: 1; display: grid; place-items: center; }
.mu-bye-plane { width: 70%; animation: mu-glide 2.4s ease-in-out infinite; filter: drop-shadow(0 18px 18px color-mix(in srgb, var(--mu-deep) 40%, transparent)); }
.mu-bye-heart { position: absolute; right: 8%; top: 10%; font-size: clamp(30px, 6dvh, 46px); animation: mu-heart-beat .9s ease-in-out infinite; }
@keyframes mu-glide { 0%, 100% { transform: translateY(0) rotate(-12deg) } 50% { transform: translateY(-12px) rotate(-4deg) } }
@media (prefers-reduced-motion: reduce) { .mu-pass-fly-p, .mu-pass-stamp, .mu-bye-plane, .mu-bye-heart { animation: none !important; } }
`;
