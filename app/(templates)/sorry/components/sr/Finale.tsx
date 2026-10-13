"use client";

// Scenes 9–11: "Forgive me?", the answer, and the certificate.
//
// How No behaves is the SENDER's choice (extras.answerMode):
//   • "yesOnly" (default): reach for No and it gets shy — it shrinks, hops
//     somewhere else with a new pleading line while YES grows; after five tries
//     it gives up and turns into a second YES.
//   • "noAfterTries": No hops `tries` times (4 or 5), then stops and becomes an
//     honest "I need a little time 🤍". Pressing it asks once more, kindly;
//     confirming records a gentle "no" (the sender sees "needs a little time").
//
// Research note: pressuring for forgiveness is what makes apologies feel
// fake, so the "time" path is warm and complete in itself — no guilt-trip.

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { EndingActions, haptic, useReducedMotion, type KeepsakeItem, type KeepsakeLayout } from "../../../_valentine/kit";
import type { AnswerRule } from "../../../_valentine/kit/answer";
import type { SorryCoupon, SorryPaletteDef } from "../../../_valentine/days/sorry";
import type { DayConfig, ValentineDayData } from "../../../_valentine/types";
import { FONTS } from "../../../_valentine/theme";
import { MochiBear } from "./art";
import { SR_DISPLAY, SR_HAND } from "./fonts";
import { useNext, useSr } from "./stage";
import { Head } from "./ui";

const SURRENDER_AT = 5;
const PLEADING = ["are you sure? 🥺", "pls pls pls 🥹", "one tiny chance?", "I'll be so good 🙏", "last time I ask 🥺"];

// ─── 9 · Forgive me? ────────────────────────────────────────────────────────

export function Question({
  question,
  yesLabel,
  noLines,
  timeLabel,
  rule,
  onYes,
  onNo,
}: {
  question: string;
  yesLabel: string;
  noLines: readonly string[];
  timeLabel: string;
  rule: AnswerRule;
  onYes: (dodges: number) => void;
  onNo: (dodges: number) => void;
}) {
  const reduced = useReducedMotion();
  const { cue } = useSr();
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
  const noLabel = surrendered ? "Okay fine… yes 💗" : unlocked ? timeLabel : dodges === 0 ? "No" : lines[(dodges - 1) % lines.length];
  const [fit, setFit] = useState(1.3);
  useLayoutEffect(() => {
    const a = arenaRef.current;
    const y = yesRef.current;
    if (!a || !y || !y.offsetWidth) return;
    setFit(Math.max(1, Math.min(1.3, (a.clientWidth - 24) / y.offsetWidth)));
  }, [dodges]);
  const yesScale = tired ? 1 : Math.min(fit, Math.pow(1.06, dodges));
  // The bear gets more and more teary as No runs away.
  const bearScale = 1 + Math.min(dodges, 5) * 0.03;

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
      <Head kicker="The big question" title={question} />
      <div className="sr-q-bear" aria-hidden style={{ transform: `scale(${bearScale})` }}>
        <MochiBear face="sad" size="100%" holding="heart" />
      </div>
      <div ref={arenaRef} className={`sr-q-arena${tired ? " is-settled" : ""}`} data-sr-answer-mode={rule.mode}>
        <motion.button
          ref={yesRef}
          type="button"
          onClick={yes}
          className="sr-q-yes"
          data-sr-yes
          initial={false}
          animate={{ x: "-50%", y: "-50%", scale: yesScale }}
          transition={{ type: "spring", stiffness: 260, damping: 14 }}
        >
          {yesLabel}
        </motion.button>
        <button
          ref={noRef}
          type="button"
          className={`sr-q-no${surrendered ? " is-yes" : ""}${unlocked ? " is-free" : ""}${hopping ? " is-hop" : ""}`}
          data-sr-no={unlocked ? "free" : surrendered ? "yes" : "running"}
          aria-label={surrendered ? "Okay fine, yes" : unlocked ? timeLabel : `No — ${noLabel}`}
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
          <p style={{ margin: 0, font: `700 clamp(15px, 2.3dvh, 18px) ${SR_DISPLAY}`, color: "var(--vw-accent-deep)" }}>
            No ran away ×{dodges} 🥺{canSayNo ? ` · ${limit - dodges} more ${limit - dodges === 1 ? "try" : "tries"}` : ""}
          </p>
        )}
        {unlocked && <p style={{ margin: 0, font: `500 clamp(13px, 2dvh, 15px) ${FONTS.ui}`, color: "var(--vw-ink-soft)" }}>It&apos;s really your choice. Either is okay 🤍</p>}
      </div>

      <AnimatePresence>
        {asking && (
          <motion.div className="sr-q-sure" role="dialog" aria-modal="true" aria-labelledby="sr-q-sure-t" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduced ? 0 : 0.22 }}>
            <motion.div className="sr-q-sure-card" initial={reduced ? false : { y: 24, scale: 0.94 }} animate={{ y: 0, scale: 1 }} exit={reduced ? undefined : { y: 16, scale: 0.96 }} transition={{ type: "spring", stiffness: 320, damping: 24 }}>
              <p className="sr-q-sure-e" aria-hidden>
                🤍
              </p>
              <h3 id="sr-q-sure-t">Need a little time?</h3>
              <p className="sr-q-sure-s">That&apos;s completely okay. They&apos;ll know you read every word, and they&apos;ll wait.</p>
              <button type="button" className="sr-q-sure-back" autoFocus onClick={() => setAsking(false)}>
                Wait, take me back 💗
              </button>
              <button
                type="button"
                className="sr-q-sure-no"
                data-sr-confirm-no
                onClick={() => {
                  setAsking(false);
                  onNo(dodgesRef.current);
                }}
              >
                Yes, I need some time
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

const Q_CSS = `
.sr-q-bear { flex: none; width: clamp(120px, 22dvh, calc(200px * var(--vw-s, 1))); transition: transform .3s cubic-bezier(.3,1.6,.5,1); filter: drop-shadow(0 12px 18px color-mix(in srgb, var(--sr-deep) 30%, transparent)); }
.sr-q-bear svg { width: 100%; height: auto; }
.sr-q-arena { position: relative; flex: 1 1 0; min-height: 150px; width: 100%; max-width: calc(420px * var(--vw-s, 1)); max-height: 300px; }
.sr-q-yes { position: absolute; left: 50%; top: 32%; min-width: 150px; max-width: calc(100% - 24px); min-height: 58px; padding: 14px 24px; border-radius: 999px; border: 0; z-index: 2; cursor: pointer; touch-action: manipulation;
  background: linear-gradient(180deg, color-mix(in srgb, var(--vw-accent) 70%, #FFFFFF), var(--vw-accent) 55%, var(--vw-accent-deep)); color: #FFFFFF; font: 800 19px ${SR_DISPLAY};
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; box-shadow: 0 5px 0 var(--sr-deep), 0 0 0 4px color-mix(in srgb, var(--vw-paper) 70%, transparent), 0 16px 30px -12px color-mix(in srgb, var(--sr-deep) 70%, transparent); }
.sr-q-yes:focus-visible { outline: 3px solid var(--vw-ink); outline-offset: 4px; }
.sr-q-no { position: absolute; min-height: 46px; min-width: 84px; max-width: calc(100% - 16px); padding: 11px 18px; border-radius: 999px; z-index: 3; cursor: pointer; touch-action: manipulation;
  border: 2px dashed var(--vw-edge); background: color-mix(in srgb, var(--vw-paper) 80%, transparent); color: var(--vw-ink-soft); font: 700 16px ${FONTS.ui};
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; transition: opacity .25s ease, scale .25s ease, translate .25s ease; }
.sr-q-no.is-hop { opacity: 0; translate: 0 -14px; }
.sr-q-no.is-yes { border: 0; background: linear-gradient(180deg, color-mix(in srgb, var(--vw-accent) 70%, #FFFFFF), var(--vw-accent)); color: #FFFFFF; box-shadow: 0 5px 0 var(--sr-deep); }
.sr-q-no.is-free { border-style: solid; color: var(--vw-ink); font-weight: 600; }
.sr-q-no:focus-visible { outline: 3px solid var(--vw-ink); outline-offset: 4px; }
.sr-q-arena.is-settled .sr-q-yes { top: 36%; }
.sr-q-arena.is-settled .sr-q-no { left: 50%; top: calc(36% + 42px); transform: translateX(-50%); transition: none; scale: none; }
.sr-q-sure { position: fixed; inset: 0; z-index: 90; display: grid; place-items: center; padding: 20px; background: color-mix(in srgb, var(--sr-deep) 35%, transparent); backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px); }
.sr-q-sure-card { width: min(340px, 100%); box-sizing: border-box; padding: 22px 20px 18px; border-radius: 26px; text-align: center; display: grid; gap: 10px; justify-items: center;
  background: var(--vw-paper); color: var(--vw-ink); box-shadow: 0 0 0 3px var(--vw-edge), 0 30px 60px -20px color-mix(in srgb, var(--sr-deep) 70%, transparent); }
.sr-q-sure-e { margin: 0; font-size: 44px; line-height: 1; }
.sr-q-sure-card h3 { margin: 0; font: 800 clamp(26px, 7vw, 32px)/1.1 ${SR_DISPLAY}; }
.sr-q-sure-s { margin: 0 0 6px; font: 500 15px/1.45 ${FONTS.ui}; color: var(--vw-ink-soft); }
.sr-q-sure-back { width: 100%; min-height: 52px; border: 0; border-radius: 999px; cursor: pointer; font: 800 17px ${SR_DISPLAY}; color: #FFFFFF;
  background: linear-gradient(180deg, color-mix(in srgb, var(--vw-accent) 70%, #FFFFFF), var(--vw-accent)); box-shadow: 0 4px 0 var(--sr-deep); }
.sr-q-sure-no { min-height: 44px; padding: 0 18px; border: 0; background: none; cursor: pointer; font: 600 15px ${FONTS.ui}; color: var(--vw-ink-soft); text-decoration: underline; text-underline-offset: 3px; }
.sr-q-sure-back:focus-visible, .sr-q-sure-no:focus-visible { outline: 3px solid var(--vw-ink); outline-offset: 3px; }
@media (prefers-reduced-motion: reduce) { .sr-q-no { transition: none; } }
`;

// ─── 10 · The answer ────────────────────────────────────────────────────────

export function YesRoom({ recipient, yesLine, dodges, sticker, onNext }: { recipient: string; yesLine: string; dodges: number; sticker: ReactNode; onNext: () => void }) {
  useNext("Our certificate", onNext, "heart");
  return (
    <div className="sr-fill" style={{ alignContent: "center" }}>
      <div className="sr-zoom" style={{ display: "grid", gap: "clamp(8px, 1.8dvh, 16px)", justifyItems: "center" }}>
        <div style={{ display: "grid", placeItems: "center", height: "min(30cqh, 170px)" }}>{sticker}</div>
        <h2 className="sr-title" style={{ fontSize: "clamp(32px, min(10vw, 5.6dvh), 50px)" }}>
          {recipient} forgave me!! 💗
        </h2>
        <p style={{ margin: "0 auto", maxWidth: 360, font: `400 clamp(19px, 2.8dvh, 23px)/1.35 ${SR_HAND}`, color: "var(--vw-ink)", overflowWrap: "anywhere" }}>
          {yesLine || "Best feeling ever. I owe you the biggest hug in the world 🤗"}
        </p>
        {dodges > 0 && (
          <p style={{ margin: 0, font: `700 clamp(15px, 2.3dvh, 18px) ${SR_DISPLAY}`, color: "var(--vw-accent-deep)" }}>
            …after No ran away {dodges} {dodges === 1 ? "time" : "times"} 🥹
          </p>
        )}
      </div>
    </div>
  );
}

export function TimeRoom({ sender, recipient, onReplay }: { sender: string; recipient: string; onReplay: () => void }) {
  const { go } = useSr();
  const hug = () => {
    const text = `I read all of it, ${sender} 🤍 I need a little time, but thank you for this.`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  };
  useNext(`Tell ${sender}`, hug, "heart", false);
  return (
    <div className="sr-fill" style={{ alignContent: "center" }} data-sr-declined>
      <div className="sr-zoom" style={{ display: "grid", gap: "clamp(10px, 2dvh, 18px)", justifyItems: "center", maxWidth: 420 }}>
        <div style={{ width: "clamp(120px, 20dvh, 170px)" }} aria-hidden>
          <MochiBear face="calm" size="100%" holding="heart" />
        </div>
        <h2 className="sr-title">Take all the time you need 🤍</h2>
        <p style={{ margin: 0, font: `400 clamp(19px, 2.8dvh, 22px)/1.4 ${SR_HAND}`, color: "var(--vw-ink)", overflowWrap: "anywhere" }}>
          Thank you for reading every word, {recipient}. {sender} will be right here. No pressure, no rush.
        </p>
        <p style={{ margin: 0, font: `500 14px/1.4 ${FONTS.ui}`, color: "var(--vw-ink-soft)" }}>{sender} will know you answered, gently.</p>
        <button type="button" onClick={() => go(onReplay)} className="sr-ghost">
          Watch it again 💗
        </button>
      </div>
    </div>
  );
}

// ─── 11 · The certificate ───────────────────────────────────────────────────

export function Ending({
  day,
  data,
  mode,
  palette,
  recipient,
  sender,
  certificate,
  coupon,
  replyText,
  onReplay,
}: {
  day: DayConfig;
  data: ValentineDayData;
  mode: "preview" | "live";
  palette: SorryPaletteDef;
  recipient: string;
  sender: string;
  certificate: string;
  coupon: SorryCoupon | null;
  replyText: string;
  onReplay: () => void;
}) {
  const reduced = useReducedMotion();
  const [sheet, setSheet] = useState<"cert" | "share">("cert");
  const today = useMemo(() => new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }), []);
  const certNo = useMemo(() => {
    let h = 7;
    for (const ch of `${recipient}${sender}`) h = (h * 31 + ch.charCodeAt(0)) % 99991;
    return `FRGV-${String(h).padStart(5, "0")}`;
  }, [recipient, sender]);
  const { go } = useSr();

  const makeOwn = () => {
    haptic(12);
    const link = typeof window !== "undefined" ? `${window.location.origin}/sorry` : "https://subhsandesh.in/sorry";
    const text = `Someone said sorry to me with the cutest page ever 🥺💗\nMake one for your own person:\n${link}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  };

  const t = palette.theme;
  const keepsake = (): KeepsakeLayout => {
    const W = 1080;
    const items: KeepsakeItem[] = [
      { type: "emoji", char: "💗", x: W / 2, y: 170, size: 110 },
      { type: "text", text: "CERTIFICATE OF FORGIVENESS", x: W / 2, y: 290, size: 44, weight: 700, color: t.accentDeep, face: "ui" },
      { type: "rect", x: 90, y: 360, w: 900, h: 1330, radius: 56, fill: t.paper },
      { type: "rect", x: 112, y: 382, w: 856, h: 1286, radius: 44, stroke: t.gold, lineWidth: 8 },
      { type: "emoji", char: "🧸", x: W / 2, y: 560, size: 200 },
      { type: "text", text: certificate, x: W / 2, y: 760, size: 72, weight: 700, color: t.ink, face: "serif", maxWidth: 820, maxLines: 2 },
      { type: "text", text: "This certifies that", x: W / 2, y: 900, size: 38, color: t.inkSoft, face: "ui" },
      { type: "text", text: sender, x: W / 2, y: 1000, size: 92, face: "script", weight: 700, color: t.accentDeep, maxWidth: 820, maxLines: 1 },
      { type: "text", text: `is officially forgiven by ${recipient}`, x: W / 2, y: 1090, size: 40, color: t.ink, face: "ui", maxWidth: 820, maxLines: 1 },
    ];
    if (coupon) items.push({ type: "text", text: `Redeemable: ${coupon.title}`, x: W / 2, y: 1200, size: 40, weight: 700, color: t.accent, face: "ui", maxWidth: 820, maxLines: 1 });
    items.push(
      { type: "text", text: `${today}  ·  ${certNo}`, x: W / 2, y: 1320, size: 30, weight: 600, color: t.inkSoft, face: "ui" },
      { type: "text", text: "Valid forever · Hugs required", x: W / 2, y: 1390, size: 32, face: "serif", italic: true, color: t.inkSoft },
      { type: "text", text: "FORGIVEN ✓", x: W / 2, y: 1530, size: 64, weight: 700, color: t.accent, face: "ui" },
    );
    if (data.endLine) items.push({ type: "text", text: data.endLine, x: W / 2, y: 1780, size: 40, face: "serif", italic: true, color: t.ink, maxWidth: 940, maxLines: 2 });
    items.push({ type: "text", text: "Made on subhsandesh.in 💗", x: W / 2, y: 1870, size: 30, color: t.inkSoft, face: "ui" });
    return { background: { stops: [[0, t.paper], [0.5, t.base], [1, palette.blush]] }, items };
  };

  useNext(sheet === "cert" ? "Keep it" : "Make one ✨", sheet === "cert" ? () => setSheet("share") : makeOwn, sheet === "cert" ? "heart" : "sparkle", sheet === "cert");

  if (sheet === "share")
    return (
      <>
        <Head kicker="All better" title={<>Hug time, {recipient} 🤗</>} sub={`Save your certificate, then tell ${sender}.`} />
        <div className="sr-fill">
          <motion.div initial={reduced ? false : { opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", stiffness: 180, damping: 16 }} style={{ width: "min(56cqh, 70cqw, 240px)" }}>
            <MochiBear face="love" size="100%" holding="heart" />
          </motion.div>
        </div>
        <div className="sr-zoom" style={{ flex: "none", width: "100%", maxWidth: 420 }}>
          <EndingActions day={day} data={data} mode={mode} onReplay={() => go(onReplay)} keepsake={keepsake} replyText={replyText} replyLabel={`💬 Reply to ${sender}`} />
        </div>
      </>
    );

  return (
    <>
      <style>{CERT_CSS}</style>
      <div className="sr-fill">
        <motion.div className="sr-cert sr-zoom" initial={reduced ? false : { opacity: 0, y: 30, rotate: -2 }} animate={{ opacity: 1, y: 0, rotate: 0 }} transition={{ type: "spring", stiffness: 160, damping: 18 }} data-sr-certificate>
          <p className="sr-cert-k">Certificate of forgiveness</p>
          <div className="sr-cert-bear" aria-hidden>
            <MochiBear face="happy" size="100%" />
          </div>
          <h2 className="sr-cert-t">{certificate}</h2>
          <p className="sr-cert-s">This certifies that</p>
          <p className="sr-cert-n">{sender}</p>
          <p className="sr-cert-s">is officially forgiven by {recipient}</p>
          {coupon && <p className="sr-cert-c">🎟️ Redeemable: {coupon.title}</p>}
          <p className="sr-cert-f">
            {today} · {certNo}
            <br />
            Valid forever · Hugs required
          </p>
          <span className="sr-cert-stamp" aria-hidden>
            FORGIVEN 💗
          </span>
          {data.endLine && <p className="sr-cert-end">{data.endLine}</p>}
        </motion.div>
      </div>
    </>
  );
}

const CERT_CSS = `
.sr-cert { position: relative; width: min(100%, 380px); max-height: 100%; box-sizing: border-box; padding: 18px 20px 18px; border-radius: 28px; overflow: hidden;
  background: radial-gradient(120% 60% at 50% 0%, #FFFFFF, var(--vw-paper)); box-shadow: inset 0 0 0 3px var(--vw-gold), inset 0 0 0 9px var(--vw-paper), inset 0 0 0 10.5px var(--vw-edge), 0 28px 50px -24px color-mix(in srgb, var(--sr-deep) 70%, transparent);
  display: grid; justify-items: center; gap: 3px; text-align: center; }
.sr-cert-k { margin: 0; font: 700 11px ${FONTS.ui}; letter-spacing: .2em; text-transform: uppercase; color: var(--vw-accent-deep); }
.sr-cert-bear { width: clamp(80px, 13dvh, 112px); }
.sr-cert-bear svg { width: 100%; height: auto; }
.sr-cert-t { margin: 2px 0 4px; font: 800 clamp(24px, 3.8dvh, 32px)/1.1 ${SR_DISPLAY}; color: var(--vw-ink); text-wrap: balance; }
.sr-cert-s { margin: 0; font: 500 14px ${FONTS.ui}; color: var(--vw-ink-soft); overflow-wrap: anywhere; }
.sr-cert-n { margin: 0; font: 400 clamp(28px, 4.4dvh, 36px)/1.15 ${SR_HAND}; color: var(--vw-accent-deep); overflow-wrap: anywhere; }
.sr-cert-c { margin: 6px 0 0; padding: 6px 12px; border-radius: 99px; background: var(--sr-blush); font: 700 14px ${FONTS.ui}; color: var(--vw-ink); }
.sr-cert-f { margin: 8px 0 0; font: 500 12px/1.5 ${FONTS.ui}; color: var(--vw-ink-soft); }
.sr-cert-stamp { position: absolute; right: 12px; top: 54px; padding: 4px 10px; border: 3px solid var(--vw-accent); border-radius: 10px; transform: rotate(14deg);
  font: 800 14px ${FONTS.ui}; letter-spacing: .1em; color: var(--vw-accent); background: color-mix(in srgb, var(--vw-paper) 60%, transparent); animation: sr-stamp-in .55s cubic-bezier(.3,1.6,.5,1) .6s both; }
@keyframes sr-stamp-in { from { transform: rotate(14deg) scale(2.4); opacity: 0 } to { transform: rotate(14deg) scale(1); opacity: 1 } }
.sr-cert-end { margin: 8px 0 0; font: 400 clamp(17px, 2.5dvh, 20px)/1.3 ${SR_HAND}; color: var(--vw-ink); overflow-wrap: anywhere; }
@media (prefers-reduced-motion: reduce) { .sr-cert-stamp { animation: none; } }
`;
