"use client";

// Scenes 8–10: the big question, the yes (and "when?"), the crown certificate.
//
// No gets shy: reach for it and it shrinks, hops somewhere else with a new
// pleading line while YES grows; after five tries it gives up and turns into a
// second YES. (A birthday question has no honest "no" path — it is a party.)

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { EndingActions, burst, haptic, useReducedMotion, type KeepsakeItem, type KeepsakeLayout } from "../../../_valentine/kit";
import { HB_PLANS, type HbCoupon, type HbPaletteDef } from "../../../_valentine/days/happy-birthday";
import type { DayConfig, ValentineDayData } from "../../../_valentine/types";
import { FONTS } from "../../../_valentine/theme";
import { Crown, PartyBear } from "./art";
import { HB_DISPLAY, HB_HAND } from "./fonts";
import { useHb, useNext } from "./stage";
import { Head } from "./ui";

const SURRENDER_AT = 5;

// ─── 8 · The big question ───────────────────────────────────────────────────

export function Question({ question, yesLabel, noLines, onYes }: { question: string; yesLabel: string; noLines: readonly string[]; onYes: (dodges: number) => void }) {
  const reduced = useReducedMotion();
  const { cue } = useHb();
  const arenaRef = useRef<HTMLDivElement | null>(null);
  const yesRef = useRef<HTMLButtonElement | null>(null);
  const noRef = useRef<HTMLButtonElement | null>(null);
  const dodgesRef = useRef(0);
  const busy = useRef(false);
  const lastDodge = useRef(0);
  const [dodges, setDodges] = useState(0);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [hopping, setHopping] = useState(false);
  const tired = dodges >= SURRENDER_AT;

  const yes = () => {
    cue("chime-cascade", { gain: 0.8 });
    cue("kiss", { gain: 0.6, at: 0.15 });
    onYes(dodgesRef.current);
  };

  const dodge = useCallback(() => {
    if (busy.current || dodgesRef.current >= SURRENDER_AT) return;
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
  }, [reduced, cue]);

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

  const lines = noLines.length ? noLines : ["pls? 🥺"];
  const noLabel = tired ? "Okay fine… yes 💗" : dodges === 0 ? "No" : lines[(dodges - 1) % lines.length];
  const [fit, setFit] = useState(1.3);
  useLayoutEffect(() => {
    const a = arenaRef.current;
    const y = yesRef.current;
    if (!a || !y || !y.offsetWidth) return;
    setFit(Math.max(1, Math.min(1.3, (a.clientWidth - 24) / y.offsetWidth)));
  }, [dodges]);
  const yesScale = tired ? 1 : Math.min(fit, Math.pow(1.06, dodges));
  const bearScale = 1 + Math.min(dodges, 5) * 0.03;

  const pressNo = () => {
    if (performance.now() - lastDodge.current < 450) return;
    if (tired) yes();
  };

  return (
    <>
      <style>{Q_CSS}</style>
      <Head kicker="One more surprise" title={question} />
      <div className="hb-q-bear" aria-hidden style={{ transform: `scale(${bearScale})` }}>
        <PartyBear face={dodges >= 3 ? "wow" : "hopeful"} size="100%" holding="balloon" />
      </div>
      <div ref={arenaRef} className={`hb-q-arena${tired ? " is-settled" : ""}`}>
        <motion.button ref={yesRef} type="button" onClick={yes} className="hb-q-yes" data-hb-yes initial={false} animate={{ x: "-50%", y: "-50%", scale: yesScale }} transition={{ type: "spring", stiffness: 260, damping: 14 }}>
          {yesLabel}
        </motion.button>
        <button
          ref={noRef}
          type="button"
          className={`hb-q-no${tired ? " is-yes" : ""}${hopping ? " is-hop" : ""}`}
          data-hb-no={tired ? "yes" : "running"}
          aria-label={tired ? "Okay fine, yes" : `No — ${noLabel}`}
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
          {dodges > 0 && !tired ? `No ran away. ${noLabel}` : tired ? "No gave up. It now says yes too." : ""}
        </span>
      </div>
      <div style={{ flex: "none", minHeight: 24 }}>
        {dodges > 0 && !tired && <p style={{ margin: 0, font: `700 clamp(15px, 2.3dvh, 18px) ${HB_DISPLAY}`, color: "var(--vw-accent-deep)" }}>No ran away ×{dodges} 🎈</p>}
      </div>
    </>
  );
}

const Q_CSS = `
.hb-q-bear { flex: none; width: clamp(118px, 21dvh, calc(196px * var(--vw-s, 1))); transition: transform .3s cubic-bezier(.3,1.6,.5,1); filter: drop-shadow(0 12px 18px color-mix(in srgb, var(--hb-deep) 30%, transparent)); }
.hb-q-arena { position: relative; flex: 1 1 0; min-height: 150px; width: 100%; max-width: calc(420px * var(--vw-s, 1)); max-height: 300px; }
.hb-q-yes { position: absolute; left: 50%; top: 32%; min-width: 150px; max-width: calc(100% - 24px); min-height: 58px; padding: 14px 24px; border-radius: 999px; border: 0; z-index: 2; cursor: pointer; touch-action: manipulation;
  background: linear-gradient(180deg, color-mix(in srgb, var(--vw-accent) 70%, #FFFFFF), var(--vw-accent) 55%, var(--vw-accent-deep)); color: #FFFFFF; font: 800 19px ${HB_DISPLAY};
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; box-shadow: 0 5px 0 var(--hb-deep), 0 0 0 4px color-mix(in srgb, var(--vw-paper) 70%, transparent), 0 16px 30px -12px color-mix(in srgb, var(--hb-deep) 70%, transparent); }
.hb-q-yes:focus-visible { outline: 3px solid var(--vw-ink); outline-offset: 4px; }
.hb-q-no { position: absolute; min-height: 46px; min-width: 84px; max-width: calc(100% - 16px); padding: 11px 18px; border-radius: 999px; z-index: 3; cursor: pointer; touch-action: manipulation;
  border: 2px dashed var(--vw-edge); background: color-mix(in srgb, var(--vw-paper) 80%, transparent); color: var(--vw-ink-soft); font: 700 16px ${FONTS.ui};
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; transition: opacity .25s ease, scale .25s ease, translate .25s ease; }
.hb-q-no.is-hop { opacity: 0; translate: 0 -14px; }
.hb-q-no.is-yes { border: 0; background: linear-gradient(180deg, color-mix(in srgb, var(--vw-accent) 70%, #FFFFFF), var(--vw-accent)); color: #FFFFFF; box-shadow: 0 5px 0 var(--hb-deep); }
.hb-q-no:focus-visible { outline: 3px solid var(--vw-ink); outline-offset: 4px; }
.hb-q-arena.is-settled .hb-q-yes { top: 36%; }
.hb-q-arena.is-settled .hb-q-no { left: 50%; top: calc(36% + 42px); transform: translateX(-50%); transition: none; scale: none; }
@media (prefers-reduced-motion: reduce) { .hb-q-no { transition: none; } }
`;

// ─── 9 · The yes (and "when?") ──────────────────────────────────────────────

export function YesRoom({
  recipient,
  yesLine,
  dodges,
  sticker,
  askWhen,
  plan,
  onPlan,
  onNext,
}: {
  recipient: string;
  yesLine: string;
  dodges: number;
  sticker: ReactNode;
  askWhen: boolean;
  plan: number | null;
  onPlan: (k: number) => void;
  onNext: () => void;
}) {
  const { cue } = useHb();
  const pick = (k: number) => {
    if (plan !== null) return;
    haptic(18);
    cue("chime", { gain: 0.55 });
    cue("sparkle", { gain: 0.4, at: 0.1 });
    onPlan(k);
  };
  useNext(!askWhen || plan !== null ? "Your crown" : null, onNext, "crown");
  return (
    <div className="hb-fill" style={{ alignContent: "center" }}>
      <div className="hb-zoom hb-yes" data-hb-yes-room>
        <div className="hb-yes-gif">{sticker}</div>
        <h2 className="hb-title" style={{ fontSize: "clamp(30px, min(9.4vw, 5.2dvh), 48px)" }}>
          It&apos;s a date, {recipient}!! 🥳
        </h2>
        <p className="hb-yes-line">{yesLine || "Best birthday gift? You saying yes. Wear something cute 💗"}</p>
        {dodges > 0 && <p className="hb-yes-dodge">…after No ran away {dodges} {dodges === 1 ? "time" : "times"} 🎈</p>}
        {askWhen && (
          <div className="hb-plan" role="group" aria-label="When should we go?">
            <p className="hb-plan-q">{plan === null ? "So… when? 🗓️" : "Locked in 💗"}</p>
            <div className="hb-plan-row">
              {HB_PLANS.map((p, k) => (
                <button key={p.label} type="button" className={`hb-plan-b${plan === k ? " is-on" : ""}${plan !== null && plan !== k ? " is-off" : ""}`} onClick={() => pick(k)} disabled={plan !== null} aria-pressed={plan === k} data-hb-plan={k}>
                  <span aria-hidden>{p.emoji}</span> {p.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      <style>{YES_CSS}</style>
    </div>
  );
}

const YES_CSS = `
.hb-yes { display: grid; gap: clamp(6px, 1.4dvh, 12px); justify-items: center; width: 100%; max-width: 420px; }
.hb-yes-gif { display: grid; place-items: center; }
.hb-yes-gif .hb-stk img { width: clamp(96px, 18dvh, 150px) !important; height: auto !important; }
.hb-yes-line { margin: 0 auto; max-width: 360px; font: 600 clamp(21px, 3dvh, 25px)/1.25 ${HB_HAND}; color: var(--vw-ink); overflow-wrap: anywhere; }
.hb-yes-dodge { margin: 0; font: 700 clamp(14px, 2.1dvh, 17px) ${HB_DISPLAY}; color: var(--vw-accent-deep); }
.hb-plan { width: 100%; display: grid; gap: 8px; justify-items: center; margin-top: 4px; }
.hb-plan-q { margin: 0; font: 800 clamp(17px, 2.5dvh, 20px) ${HB_DISPLAY}; color: var(--vw-ink); }
.hb-plan-row { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; }
.hb-plan-b { min-height: 46px; padding: 0 16px; border-radius: 999px; border: 2px solid var(--vw-edge); background: var(--vw-paper); color: var(--vw-ink); font: 700 15px ${FONTS.ui}; cursor: pointer; touch-action: manipulation;
  box-shadow: 0 6px 14px -10px color-mix(in srgb, var(--hb-deep) 60%, transparent); transition: transform .2s ease, opacity .3s ease, background .2s ease; }
.hb-plan-b:not(:disabled):hover { transform: translateY(-2px); }
.hb-plan-b.is-on { background: var(--vw-accent); border-color: var(--vw-accent-deep); color: #FFFFFF; transform: scale(1.06); }
.hb-plan-b.is-off { opacity: .45; }
.hb-plan-b:disabled { cursor: default; }
.hb-plan-b:focus-visible { outline: 3px solid var(--vw-ink); outline-offset: 3px; }
`;

// ─── 10 · The crown certificate ─────────────────────────────────────────────

const PERKS = ["Unlimited cake 🍰", "Main character all day 🎬", "Every wish granted ✨"];

export function Ending({
  day,
  data,
  mode,
  palette,
  recipient,
  sender,
  crownTitle,
  crownWord,
  coupon,
  plan,
  replyText,
  onReplay,
}: {
  day: DayConfig;
  data: ValentineDayData;
  mode: "preview" | "live";
  palette: HbPaletteDef;
  recipient: string;
  sender: string;
  crownTitle: string;
  crownWord: string;
  coupon: HbCoupon | null;
  plan: string | null;
  replyText: string;
  onReplay: () => void;
}) {
  const reduced = useReducedMotion();
  const [sheet, setSheet] = useState<"cert" | "share">("cert");
  const today = useMemo(() => new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }), []);
  const certNo = useMemo(() => {
    let h = 11;
    for (const ch of `${recipient}${sender}`) h = (h * 31 + ch.charCodeAt(0)) % 99991;
    return `BDAY-${String(h).padStart(5, "0")}`;
  }, [recipient, sender]);
  const { go } = useHb();
  const t = palette.theme;

  useEffect(() => {
    if (reduced) return;
    const a = window.setTimeout(() => burst({ kind: "confetti", colors: t.confetti, origin: { x: 0.5, y: 0.2 }, count: 120, spread: 0.6 }), 500);
    return () => window.clearTimeout(a);
  }, [reduced, t.confetti]);

  const makeOwn = () => {
    haptic(12);
    const link = typeof window !== "undefined" ? `${window.location.origin}/happy-birthday` : "https://subhsandesh.in/happy-birthday";
    const text = `Someone made me the cutest birthday surprise page 🥹🎂\nMake one for your own person:\n${link}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  };

  const keepsake = (): KeepsakeLayout => {
    const W = 1080;
    const items: KeepsakeItem[] = [
      { type: "emoji", char: "👑", x: W / 2, y: 170, size: 120 },
      { type: "text", text: "ROYAL BIRTHDAY DECREE", x: W / 2, y: 300, size: 42, weight: 700, color: t.accentDeep, face: "ui" },
      { type: "rect", x: 90, y: 360, w: 900, h: 1330, radius: 56, fill: t.paper },
      { type: "rect", x: 112, y: 382, w: 856, h: 1286, radius: 44, stroke: t.gold, lineWidth: 8 },
      { type: "emoji", char: "🎂", x: W / 2, y: 540, size: 170 },
      { type: "text", text: `Officially the ${crownTitle}`, x: W / 2, y: 740, size: 66, weight: 700, color: t.ink, face: "serif", maxWidth: 820, maxLines: 2 },
      { type: "text", text: "This certifies that", x: W / 2, y: 880, size: 38, color: t.inkSoft, face: "ui" },
      { type: "text", text: recipient, x: W / 2, y: 985, size: 100, face: "script", weight: 700, color: t.accentDeep, maxWidth: 820, maxLines: 1 },
      { type: "text", text: `is the ${crownWord} of today, and of ${sender}'s heart`, x: W / 2, y: 1080, size: 38, color: t.ink, face: "ui", maxWidth: 820, maxLines: 2 },
      { type: "text", text: PERKS.join("  ·  "), x: W / 2, y: 1190, size: 30, weight: 600, color: t.accent, face: "ui", maxWidth: 840, maxLines: 2 },
    ];
    let y = 1290;
    if (plan) {
      items.push({ type: "text", text: `Birthday date: ${plan}`, x: W / 2, y, size: 36, weight: 700, color: t.ink, face: "ui", maxWidth: 820, maxLines: 1 });
      y += 64;
    }
    if (coupon) {
      items.push({ type: "text", text: `Redeemable: ${coupon.title}`, x: W / 2, y, size: 36, weight: 700, color: t.ink, face: "ui", maxWidth: 820, maxLines: 1 });
      y += 64;
    }
    items.push(
      { type: "text", text: `${today}  ·  ${certNo}  ·  signed, ${sender}`, x: W / 2, y: Math.max(y + 20, 1460), size: 28, weight: 600, color: t.inkSoft, face: "ui", maxWidth: 840, maxLines: 1 },
      { type: "text", text: "HAPPY BIRTHDAY ✓", x: W / 2, y: 1580, size: 60, weight: 700, color: t.accent, face: "ui" },
    );
    if (data.endLine) items.push({ type: "text", text: data.endLine, x: W / 2, y: 1780, size: 40, face: "serif", italic: true, color: t.ink, maxWidth: 940, maxLines: 2 });
    items.push({ type: "text", text: "Made on subhsandesh.in 🎂", x: W / 2, y: 1870, size: 30, color: t.inkSoft, face: "ui" });
    return { background: { stops: [[0, t.paper], [0.5, t.base], [1, palette.blush]] }, items };
  };

  useNext(sheet === "cert" ? "Keep it" : "Make one ✨", sheet === "cert" ? () => setSheet("share") : makeOwn, sheet === "cert" ? "crown" : "sparkle", sheet === "cert");

  if (sheet === "share")
    return (
      <>
        <Head kicker="Happy birthday!" title={<>Best day ever, {recipient} 🎂</>} sub={`Save your crown, then tell ${sender}.`} />
        <div className="hb-fill">
          <motion.div initial={reduced ? false : { opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", stiffness: 180, damping: 16 }} style={{ width: "min(56cqh, 66cqw, 240px)" }}>
            <PartyBear face="love" size="100%" holding="cake" />
          </motion.div>
        </div>
        <div className="hb-zoom" style={{ flex: "none", width: "100%", maxWidth: 420 }}>
          <EndingActions day={day} data={data} mode={mode} onReplay={() => go(onReplay)} keepsake={keepsake} replyText={replyText} replyLabel={`💬 Reply to ${sender}`} />
        </div>
      </>
    );

  return (
    <>
      <style>{CERT_CSS}</style>
      <div className="hb-fill">
        <motion.div className="hb-cert hb-zoom" initial={reduced ? false : { opacity: 0, y: 30, rotate: -2 }} animate={{ opacity: 1, y: 0, rotate: 0 }} transition={{ type: "spring", stiffness: 160, damping: 18 }} data-hb-certificate>
          <p className="hb-cert-k">Royal birthday decree</p>
          <div className="hb-cert-crown" aria-hidden>
            <Crown size="100%" />
          </div>
          <h2 className="hb-cert-t">Officially the {crownTitle}</h2>
          <p className="hb-cert-s">This certifies that</p>
          <p className="hb-cert-n">{recipient}</p>
          <p className="hb-cert-s">
            is the {crownWord} of today, and of {sender}&apos;s heart
          </p>
          <ul className="hb-cert-perks">
            {PERKS.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
          {(plan || coupon) && (
            <p className="hb-cert-c">
              {plan ? `🗓️ Date: ${plan}` : ""}
              {plan && coupon ? " · " : ""}
              {coupon ? `🎟️ ${coupon.title}` : ""}
            </p>
          )}
          <p className="hb-cert-f">
            {today} · {certNo} · signed, {sender}
          </p>
          <span className="hb-cert-stamp" aria-hidden>
            HBD 🎂
          </span>
          {data.endLine && <p className="hb-cert-end">{data.endLine}</p>}
        </motion.div>
      </div>
    </>
  );
}

const CERT_CSS = `
.hb-cert { position: relative; width: min(100%, 380px); max-height: 100%; box-sizing: border-box; padding: 16px 18px 16px; border-radius: 28px; overflow: hidden;
  background: radial-gradient(120% 60% at 50% 0%, #FFFFFF, var(--vw-paper)); box-shadow: inset 0 0 0 3px var(--vw-gold), inset 0 0 0 9px var(--vw-paper), inset 0 0 0 10.5px var(--vw-edge), 0 28px 50px -24px color-mix(in srgb, var(--hb-deep) 70%, transparent);
  display: grid; justify-items: center; gap: 3px; text-align: center; }
.hb-cert-k { margin: 0; font: 700 11px ${FONTS.ui}; letter-spacing: .2em; text-transform: uppercase; color: var(--vw-accent-deep); }
.hb-cert-crown { width: clamp(64px, 10dvh, 92px); margin: 2px 0; animation: hb-crown 2.4s ease-in-out infinite alternate; }
@keyframes hb-crown { from { transform: rotate(-6deg) translateY(0) } to { transform: rotate(6deg) translateY(-3px) } }
.hb-cert-t { margin: 0 0 4px; font: 800 clamp(23px, 3.5dvh, 30px)/1.1 ${HB_DISPLAY}; color: var(--vw-ink); text-wrap: balance; }
.hb-cert-s { margin: 0; font: 500 14px/1.35 ${FONTS.ui}; color: var(--vw-ink-soft); overflow-wrap: anywhere; text-wrap: balance; }
.hb-cert-n { margin: 0; font: 700 clamp(34px, 5.2dvh, 44px)/1.05 ${HB_HAND}; color: var(--vw-accent-deep); overflow-wrap: anywhere; }
.hb-cert-perks { list-style: none; margin: 6px 0 0; padding: 0; display: flex; flex-wrap: wrap; gap: 5px; justify-content: center; }
.hb-cert-perks li { padding: 3px 9px; border-radius: 99px; background: var(--hb-blush); font: 700 12px ${FONTS.ui}; color: var(--vw-ink); }
.hb-cert-c { margin: 6px 0 0; padding: 5px 12px; border-radius: 12px; background: color-mix(in srgb, var(--vw-accent) 14%, var(--vw-paper)); font: 700 13px/1.35 ${FONTS.ui}; color: var(--vw-ink); overflow-wrap: anywhere; }
.hb-cert-f { margin: 8px 0 0; font: 500 11.5px/1.5 ${FONTS.ui}; color: var(--vw-ink-soft); overflow-wrap: anywhere; }
.hb-cert-stamp { position: absolute; right: 14px; top: 46px; padding: 4px 10px; border: 3px solid var(--vw-accent); border-radius: 10px; transform: rotate(14deg);
  font: 800 14px ${FONTS.ui}; letter-spacing: .1em; color: var(--vw-accent); background: color-mix(in srgb, var(--vw-paper) 60%, transparent); animation: hb-stamp-in .55s cubic-bezier(.3,1.6,.5,1) .6s both; }
@keyframes hb-stamp-in { from { transform: rotate(14deg) scale(2.4); opacity: 0 } to { transform: rotate(14deg) scale(1); opacity: 1 } }
.hb-cert-end { margin: 8px 0 0; font: 600 clamp(19px, 2.7dvh, 22px)/1.2 ${HB_HAND}; color: var(--vw-ink); overflow-wrap: anywhere; }
@media (prefers-reduced-motion: reduce) { .hb-cert-stamp, .hb-cert-crown { animation: none; } }
`;
