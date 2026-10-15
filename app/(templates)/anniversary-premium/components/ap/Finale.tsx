"use client";

// The last act: the question, the yes, and the keepsakes.
//
//   • Question — two hearts: the sender's, big and waiting; hers, small. She
//     drags her heart into his (a golden thread tightens as they get close) and
//     they become one: that is the yes (the owner gets an email).
//   • Yes — petals and the happy sticker.
//   • Ending — the Certificate of Forever (wedding-stationery elegance; the
//     foil catches the light as she moves over it), then the keepsakes: the
//     certificate PNG, an "Our Year in Numbers" story card, the reply.

import { useCallback, useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, animate, motion, useMotionValue } from "framer-motion";
import { EndingActions, downloadKeepsake, haptic, useReducedMotion, type KeepsakeItem, type KeepsakeLayout } from "../../../_valentine/kit";
import type { AnniPaletteDef, AnniStat } from "../../../_valentine/days/anniversary-premium";
import type { DayConfig, ValentineDayData } from "../../../_valentine/types";
import { AP_HAND, AP_SANS, AP_SCRIPT, AP_SERIF } from "./fonts";
import { useAp, useNext } from "./stage";
import { Head, Hint, fmt, ordinal, prettyDay, type Together } from "./ui";

// ─── 11 · The question ──────────────────────────────────────────────────────

export function Question({ question, yesLabel, datePlan, sender, recipient, onYes }: { question: string; yesLabel: string; datePlan: string; sender: string; recipient: string; onYes: () => void }) {
  const { cue } = useAp();
  const reduced = useReducedMotion();
  const arenaRef = useRef<HTMLDivElement | null>(null);
  const targetRef = useRef<HTMLDivElement | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const [near, setNear] = useState(0);
  const [joined, setJoined] = useState(false);
  const lastBeat = useRef(0);

  const measure = useCallback(() => {
    const a = arenaRef.current?.querySelector("[data-ap-myheart]")?.getBoundingClientRect();
    const t = targetRef.current?.getBoundingClientRect();
    if (!a || !t) return { d: 999, max: 1, dx: 0, dy: 0 };
    const dx = t.left + t.width / 2 - (a.left + a.width / 2);
    const dy = t.top + t.height / 2 - (a.top + a.height / 2);
    const d = Math.hypot(dx, dy);
    return { d, max: Math.max(1, arenaRef.current?.getBoundingClientRect().height ?? 400), dx, dy };
  }, []);

  const join = useCallback(() => {
    if (joined) return;
    setJoined(true);
    haptic([30, 60, 40]);
    cue("heartbeat", { gain: 0.7, count: 2 });
    cue("chime-cascade", { gain: 0.8, at: 0.3 });
    cue("kiss", { gain: 0.5, at: 0.5 });
    const m = measure();
    if (reduced) {
      x.set(x.get() + m.dx);
      y.set(y.get() + m.dy);
    } else {
      animate(x, x.get() + m.dx, { type: "spring", stiffness: 260, damping: 20 });
      animate(y, y.get() + m.dy, { type: "spring", stiffness: 260, damping: 20 });
    }
    window.setTimeout(onYes, reduced ? 200 : 900);
  }, [joined, cue, measure, reduced, x, y, onYes]);

  const onDrag = () => {
    const m = measure();
    const p = Math.max(0, 1 - m.d / (m.max * 0.7));
    setNear(p);
    const now = performance.now();
    if (now - lastBeat.current > 900 - p * 600) {
      lastBeat.current = now;
      cue("heartbeat", { gain: 0.25 + p * 0.4 });
      haptic(6 + Math.round(p * 10));
    }
  };
  const onDragEnd = () => {
    const m = measure();
    const t = targetRef.current?.getBoundingClientRect();
    if (t && m.d < t.width * 0.55) join();
    else {
      setNear(0);
      if (!reduced) {
        animate(x, 0, { type: "spring", stiffness: 200, damping: 18 });
        animate(y, 0, { type: "spring", stiffness: 200, damping: 18 });
      } else {
        x.set(0);
        y.set(0);
      }
    }
  };

  return (
    <>
      <Head kicker="One more thing" title={question} sub={datePlan ? `📍 ${datePlan}` : undefined} />
      <div className="ap-fill">
        <div ref={arenaRef} className={`ap-q${joined ? " is-joined" : ""}`} style={{ ["--near" as string]: near.toFixed(3) }} data-ap-question>
          <div ref={targetRef} className="ap-q-big" aria-hidden>
            <svg viewBox="0 0 100 92">
              <path d="M50 88 C18 66 3 48 5 29 C7 10 33 4 50 24 C67 4 93 10 95 29 C97 48 82 66 50 88 Z" />
            </svg>
            <span className="ap-q-big-name">{sender}</span>
          </div>
          <span className="ap-q-thread" aria-hidden />
          <motion.div
            className="ap-q-mine"
            drag={!joined}
            dragMomentum={false}
            dragElastic={0.2}
            style={{ x, y }}
            onDrag={onDrag}
            onDragEnd={onDragEnd}
            whileDrag={{ scale: 1.08 }}
            data-ap-myheart
            aria-hidden
          >
            <svg viewBox="0 0 100 92">
              <path d="M50 88 C18 66 3 48 5 29 C7 10 33 4 50 24 C67 4 93 10 95 29 C97 48 82 66 50 88 Z" />
            </svg>
            <span>{recipient}</span>
          </motion.div>
          <AnimatePresence>
            {joined && (
              <motion.span className="ap-q-one" initial={reduced ? false : { scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 200, damping: 12, delay: reduced ? 0 : 0.35 }} aria-hidden>
                ♥
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>
      <div className="ap-foot ap-q-foot">
        {!joined && <Hint hand="💗">Drag your heart into mine</Hint>}
        <button type="button" className="ap-q-yes" onClick={join} disabled={joined} data-ap-yes>
          {yesLabel}
        </button>
      </div>
      <style>{Q_CSS}</style>
    </>
  );
}

const Q_CSS = `
.ap-q { position: relative; width: min(100%, 520px); height: 100%; min-height: 220px; }
.ap-q-big { position: absolute; left: 50%; top: 4%; translate: -50% 0; width: min(46cqw, 40cqh, 260px); aspect-ratio: 100 / 92; display: grid; place-items: center; animation: ap-beat calc(1.2s - var(--near) * .7s) ease-in-out infinite; }
.ap-q-big svg { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }
.ap-q-big path { fill: color-mix(in srgb, var(--ap-blush) 70%, #FFFFFF); stroke: var(--ap-foil); stroke-width: 2; stroke-dasharray: 4 5; transition: fill .4s; filter: drop-shadow(0 12px 18px color-mix(in srgb, var(--ap-deep) 25%, transparent)); }
.ap-q.is-joined .ap-q-big path { fill: var(--vw-accent); stroke: #FFFFFF; stroke-dasharray: none; }
.ap-q-big-name { position: relative; margin-top: -8%; font: 400 clamp(22px, 7cqmin, 40px)/1 ${AP_SCRIPT}; color: var(--vw-accent-deep); max-width: 70%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; transition: color .4s; }
.ap-q.is-joined .ap-q-big-name { color: #FFFFFF; }
@keyframes ap-beat { 0%, 100% { transform: scale(1) } 15% { transform: scale(1.07) } 30% { transform: scale(1) } 45% { transform: scale(1.05) } }
.ap-q-mine { position: absolute; left: 50%; bottom: 6%; margin-left: calc(min(26cqw, 22cqh, 140px) / -2); width: min(26cqw, 22cqh, 140px); aspect-ratio: 100 / 92; display: grid; place-items: center; cursor: grab; touch-action: none; z-index: 2; }
.ap-q-mine:active { cursor: grabbing; }
.ap-q-mine svg { position: absolute; inset: 0; width: 100%; height: 100%; }
.ap-q-mine path { fill: var(--ap-rose); stroke: #FFFFFF; stroke-width: 3; filter: drop-shadow(0 10px 14px color-mix(in srgb, var(--ap-deep) 35%, transparent)); }
.ap-q-mine span { position: relative; margin-top: -10%; font: 400 clamp(17px, 5cqmin, 28px)/1 ${AP_SCRIPT}; color: #FFFFFF; max-width: 76%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; text-shadow: 0 1px 2px rgba(0,0,0,.2); }
.ap-q.is-joined .ap-q-mine { opacity: 0; transition: opacity .3s .35s; }
.ap-q-thread { position: absolute; left: 50%; top: 30%; bottom: 20%; width: 2px; translate: -50% 0; background: repeating-linear-gradient(180deg, var(--ap-foil) 0 6px, transparent 6px 12px); opacity: calc(.25 + var(--near) * .75); }
.ap-q.is-joined .ap-q-thread { opacity: 0; }
.ap-q-one { position: absolute; left: 50%; top: 4%; translate: -50% 0; width: min(46cqw, 40cqh, 260px); aspect-ratio: 100 / 92; display: grid; place-items: center; font-size: clamp(30px, 9cqmin, 54px); color: #FFFFFF; pointer-events: none; }
.ap-q-foot { flex-direction: column; gap: 10px; }
.ap-q-yes { min-height: 50px; padding: 0 24px; border: 0; border-radius: 99px; cursor: pointer; touch-action: manipulation; font: italic 600 20px ${AP_SERIF}; color: var(--vw-accent-deep);
  background: color-mix(in srgb, #FFFFFF 80%, transparent); box-shadow: inset 0 0 0 1.5px var(--ap-foil), 0 10px 20px -12px var(--ap-deep); }
.ap-q-yes:disabled { opacity: .5; cursor: default; }
.ap-q-yes:focus-visible { outline: 3px solid var(--vw-ink); outline-offset: 3px; }
@media (prefers-reduced-motion: reduce) { .ap-q-big { animation: none; } }
`;

// ─── 12 · Yes ───────────────────────────────────────────────────────────────

export function YesRoom({ recipient, yesLine, sticker, onNext }: { recipient: string; yesLine: string; sticker: ReactNode; onNext: () => void }) {
  useNext("Our certificate", onNext, "ring");
  return (
    <div className="ap-fill" style={{ alignContent: "center" }}>
      <div style={{ display: "grid", gap: "clamp(8px, 1.8dvh, 16px)", justifyItems: "center", maxWidth: 560 }}>
        <div style={{ display: "grid", placeItems: "center", minHeight: "min(30cqh, 190px)" }}>{sticker}</div>
        <p className="ap-kick">It&apos;s official</p>
        <h2 className="ap-title" style={{ fontSize: "clamp(36px, min(11vw, 6.4dvh), 68px)" }}>
          {recipient} said <em>yes</em>
        </h2>
        <span className="ap-rule" aria-hidden />
        <p style={{ margin: "0 auto", maxWidth: 420, font: `500 clamp(21px, 3dvh, 28px)/1.25 ${AP_HAND}`, color: "var(--vw-ink)", overflowWrap: "anywhere" }}>
          {yesLine || "Best answer, best person, best years. Here's to forever 🥂"}
        </p>
      </div>
    </div>
  );
}

// ─── 13 · The Certificate of Forever + keepsakes ────────────────────────────

const initial = (s: string) => (s.trim()[0] ?? "♥").toUpperCase();

export function Ending({
  day,
  data,
  mode,
  palette,
  recipient,
  sender,
  certificate,
  together,
  datePlan,
  stats,
  ourSong,
  mostSaid,
  chapters,
  firsts,
  replyText,
  sticker,
  onReplay,
}: {
  day: DayConfig;
  data: ValentineDayData;
  mode: "preview" | "live";
  palette: AnniPaletteDef;
  recipient: string;
  sender: string;
  certificate: string;
  together: Together | null;
  datePlan: string;
  stats: AnniStat[];
  ourSong: string;
  mostSaid: string;
  chapters: number;
  firsts: number;
  replyText: string;
  sticker: ReactNode;
  onReplay: () => void;
}) {
  const reduced = useReducedMotion();
  const { go, cue } = useAp();
  const [sheet, setSheet] = useState<"cert" | "keep">("cert");
  const [saving, setSaving] = useState<"idle" | "busy" | "done" | "failed">("idle");
  const today = useMemo(() => new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }), []);
  const certNo = useMemo(() => {
    let h = 11;
    for (const ch of `${recipient}${sender}`) h = (h * 31 + ch.charCodeAt(0)) % 99991;
    return `FVR-${String(h).padStart(5, "0")}`;
  }, [recipient, sender]);
  const nth = together?.nth;
  const span = together
    ? [together.years ? `${together.years} ${together.years === 1 ? "year" : "years"}` : "", `${together.months} ${together.months === 1 ? "month" : "months"}`, `${together.days} ${together.days === 1 ? "day" : "days"}`].filter(Boolean).join(", ")
    : "";

  // The foil catches the light where her finger / cursor is.
  const [light, setLight] = useState({ x: 50, y: 30 });
  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    setLight({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
  };

  const makeOwn = () => {
    haptic(12);
    const link = typeof window !== "undefined" ? `${window.location.origin}/anniversary-premium` : "https://subhsandesh.in/anniversary-premium";
    const text = `Someone made me the most beautiful anniversary book 🥹💗\nMake one for your own person:\n${link}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  };

  const t = palette.theme;
  const W = 1080;
  const certKeepsake = (): KeepsakeLayout => {
    const items: KeepsakeItem[] = [
      { type: "rect", x: 70, y: 150, w: 940, h: 1560, radius: 30, fill: t.paper },
      { type: "rect", x: 92, y: 172, w: 896, h: 1516, radius: 22, stroke: palette.foil, lineWidth: 6 },
      { type: "rect", x: 112, y: 192, w: 856, h: 1476, radius: 16, stroke: palette.foil, lineWidth: 2 },
      { type: "text", text: "❦", x: W / 2, y: 330, size: 90, color: palette.foil, face: "serif" },
      { type: "text", text: "CERTIFICATE OF", x: W / 2, y: 430, size: 40, weight: 700, color: t.accentDeep, face: "ui" },
      { type: "text", text: "Forever", x: W / 2, y: 560, size: 150, color: t.ink, face: "script" },
      { type: "text", text: "This certifies that", x: W / 2, y: 690, size: 40, italic: true, color: t.inkSoft, face: "serif" },
      { type: "text", text: `${recipient} & ${sender}`, x: W / 2, y: 820, size: 104, color: t.accentDeep, face: "script", maxWidth: 840, maxLines: 1 },
      { type: "text", text: span ? `have loved each other for ${span}` : "have loved each other, beautifully", x: W / 2, y: 940, size: 40, color: t.ink, face: "serif", maxWidth: 820, maxLines: 2 },
      { type: "text", text: nth ? `and on their ${ordinal(nth)} anniversary, agreed to forever.` : "and agreed, today, to forever.", x: W / 2, y: 1030, size: 40, color: t.ink, face: "serif", italic: true, maxWidth: 820, maxLines: 2 },
    ];
    if (datePlan) items.push({ type: "text", text: `Next date: ${datePlan}`, x: W / 2, y: 1150, size: 34, weight: 600, color: t.accent, face: "ui", maxWidth: 820, maxLines: 2 });
    items.push(
      { type: "rect", x: W / 2 - 90, y: 1230, w: 180, h: 180, radius: 90, fill: palette.foil },
      { type: "rect", x: W / 2 - 74, y: 1246, w: 148, h: 148, radius: 74, stroke: "#FFFFFF", lineWidth: 4 },
      { type: "text", text: `${initial(recipient)} ♥ ${initial(sender)}`, x: W / 2, y: 1338, size: 48, weight: 700, color: "#FFFFFF", face: "serif" },
      { type: "text", text: recipient, x: 290, y: 1520, size: 60, color: t.ink, face: "script", maxWidth: 360, maxLines: 1 },
      { type: "text", text: sender, x: 790, y: 1520, size: 60, color: t.ink, face: "script", maxWidth: 360, maxLines: 1 },
      { type: "rect", x: 130, y: 1545, w: 320, h: 3, fill: palette.foil },
      { type: "rect", x: 630, y: 1545, w: 320, h: 3, fill: palette.foil },
      { type: "text", text: `${today}  ·  ${certNo}`, x: W / 2, y: 1625, size: 28, weight: 600, color: t.inkSoft, face: "ui" },
    );
    if (data.endLine) items.push({ type: "text", text: data.endLine, x: W / 2, y: 1790, size: 40, face: "serif", italic: true, color: t.ink, maxWidth: 940, maxLines: 2 });
    items.push({ type: "text", text: "Made on subhsandesh.in", x: W / 2, y: 1870, size: 28, color: t.inkSoft, face: "ui" });
    return { background: { stops: [[0, palette.blush], [0.5, t.base], [1, palette.blush]] }, items };
  };

  const numbersKeepsake = (): KeepsakeLayout => {
    const rows: [string, string][] = [];
    if (together) {
      rows.push([fmt(together.totalDays), "days together"]);
      rows.push([fmt(together.hours), "hours, side by side"]);
      rows.push([fmt(together.totalDays), "sunrises we shared"]);
    }
    rows.push([String(chapters), "chapters in our book"]);
    rows.push([String(firsts), "firsts we'll never forget"]);
    for (const s of stats) if (s.num || s.label) rows.push([s.num || "♥", s.label]);
    const list = rows.slice(0, 7);
    const items: KeepsakeItem[] = [
      { type: "text", text: "OUR YEAR IN NUMBERS", x: W / 2, y: 200, size: 44, weight: 700, color: t.accentDeep, face: "ui" },
      { type: "text", text: `${recipient} & ${sender}`, x: W / 2, y: 320, size: 96, color: t.ink, face: "script", maxWidth: 940, maxLines: 1 },
      { type: "text", text: nth ? `${ordinal(nth)} anniversary` : "happy anniversary", x: W / 2, y: 400, size: 42, italic: true, color: t.inkSoft, face: "serif" },
    ];
    let y = 500;
    const rowH = Math.min(150, Math.floor(1000 / Math.max(1, list.length + (ourSong ? 1 : 0) + (mostSaid ? 1 : 0))));
    for (const [n, l] of list) {
      items.push({ type: "rect", x: 110, y, w: 860, h: rowH - 18, radius: 28, fill: "rgba(255,255,255,0.78)" });
      items.push({ type: "text", text: n, x: 300, y: y + rowH / 2 + 14, size: Math.min(72, rowH * 0.5), weight: 700, color: t.accentDeep, face: "serif", maxWidth: 340, maxLines: 1 });
      items.push({ type: "text", text: l, x: 690, y: y + rowH / 2 + 4, size: 34, color: t.ink, face: "ui", maxWidth: 480, maxLines: 2 });
      y += rowH;
    }
    if (ourSong) {
      items.push({ type: "text", text: `Our song: ${ourSong}`, x: W / 2, y: y + 60, size: 40, color: t.ink, face: "serif", italic: true, maxWidth: 900, maxLines: 1 });
      y += 80;
    }
    if (mostSaid) {
      items.push({ type: "text", text: `Most said: ${mostSaid}`, x: W / 2, y: y + 60, size: 40, color: t.ink, face: "serif", italic: true, maxWidth: 900, maxLines: 1 });
      y += 80;
    }
    items.push({ type: "text", text: `Top person of the year: ${recipient}`, x: W / 2, y: Math.max(y + 90, 1700), size: 44, weight: 700, color: t.accent, face: "ui", maxWidth: 940, maxLines: 1 });
    items.push({ type: "text", text: "Made on subhsandesh.in", x: W / 2, y: 1860, size: 28, color: t.inkSoft, face: "ui" });
    return { background: { stops: [[0, palette.sky[0]], [0.55, palette.sky[1]], [1, palette.sky[2]]] }, items };
  };

  const saveNumbers = async () => {
    setSaving("busy");
    haptic(10);
    cue("sparkle", { gain: 0.4 });
    const ok = await downloadKeepsake(numbersKeepsake(), `our-year-in-numbers-${recipient}`);
    setSaving(ok ? "done" : "failed");
  };

  useNext(sheet === "cert" ? "Keep it forever" : "Make one ✨", sheet === "cert" ? () => setSheet("keep") : makeOwn, sheet === "cert" ? "heart" : "sparkle", sheet === "cert");

  if (sheet === "keep")
    return (
      <>
        <Head kicker="The end · and the beginning" title={<>Happy anniversary, <em>{recipient}</em></>} sub={`Save your keepsakes, then tell ${sender}.`} />
        <div className="ap-fill">
          <motion.div initial={reduced ? false : { opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", stiffness: 180, damping: 16 }} className="ap-keep-stk">
            {sticker}
          </motion.div>
        </div>
        <div className="ap-foot" style={{ width: "100%", maxWidth: 400, flexDirection: "column" }}>
          <button type="button" className="ap-keep-btn" onClick={saveNumbers} disabled={saving === "busy"} data-ap-save-numbers>
            {saving === "busy" ? "Making it…" : saving === "done" ? "Saved ✓ Our Year in Numbers" : saving === "failed" ? "Try again" : "⬇ Our Year in Numbers (story card)"}
          </button>
          <EndingActions day={day} data={data} mode={mode} onReplay={() => go(onReplay)} keepsake={certKeepsake} replyText={replyText} replyLabel={`💬 Reply to ${sender}`} />
        </div>
        <style>{CERT_CSS}</style>
      </>
    );

  return (
    <>
      <style>{CERT_CSS}</style>
      <div className="ap-fill">
        <motion.div
          className="ap-cert"
          onPointerMove={onMove}
          style={{ ["--lx" as string]: `${light.x}%`, ["--ly" as string]: `${light.y}%` }}
          initial={reduced ? false : { opacity: 0, y: 40, rotateX: 18 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ type: "spring", stiffness: 140, damping: 18 }}
          data-ap-certificate
        >
          <span className="ap-cert-foil" aria-hidden />
          <span className="ap-cert-corner is-tl" aria-hidden>❦</span>
          <span className="ap-cert-corner is-tr" aria-hidden>❦</span>
          <span className="ap-cert-corner is-bl" aria-hidden>❦</span>
          <span className="ap-cert-corner is-br" aria-hidden>❦</span>
          <p className="ap-cert-k">{certificate.replace(/forever$/i, "").trim() || "Certificate of"}</p>
          <p className="ap-cert-t">Forever</p>
          <p className="ap-cert-s">This certifies that</p>
          <p className="ap-cert-n">
            {recipient} <i>&amp;</i> {sender}
          </p>
          <p className="ap-cert-s">{span ? `have loved each other for ${span}` : "have loved each other, beautifully,"}</p>
          <p className="ap-cert-s is-it">{nth ? `and on their ${ordinal(nth)} anniversary, agreed to forever.` : "and agreed, today, to forever."}</p>
          {datePlan && <p className="ap-cert-plan">📍 Next date: {datePlan}</p>}
          <div className="ap-cert-row">
            <span className="ap-cert-sig">
              <b>{recipient}</b>
              <i />
            </span>
            <span className="ap-cert-seal" aria-hidden>
              <b>
                {initial(recipient)}
                <small>♥</small>
                {initial(sender)}
              </b>
            </span>
            <span className="ap-cert-sig">
              <b>{sender}</b>
              <i />
            </span>
          </div>
          <p className="ap-cert-f">
            {together ? `since ${prettyDay(together.start)} · ` : ""}
            {today} · {certNo}
          </p>
          {data.endLine && <p className="ap-cert-end">{data.endLine}</p>}
        </motion.div>
      </div>
    </>
  );
}

const CERT_CSS = `
.ap-cert { position: relative; width: min(100%, 70cqh, 600px); max-height: 100%; box-sizing: border-box; padding: clamp(18px, 4cqh, 34px) clamp(18px, 5cqw, 36px); border-radius: 10px; overflow: hidden; perspective: 900px;
  background: radial-gradient(120% 70% at 50% 0%, #FFFFFF, var(--vw-paper) 60%, var(--ap-blush));
  box-shadow: inset 0 0 0 2px var(--ap-foil), inset 0 0 0 8px var(--vw-paper), inset 0 0 0 9px color-mix(in srgb, var(--ap-foil) 70%, transparent), 0 34px 60px -30px var(--ap-deep);
  display: grid; justify-items: center; gap: clamp(2px, .7cqh, 6px); text-align: center; }
.ap-cert-foil { position: absolute; inset: 0; pointer-events: none; mix-blend-mode: soft-light; background: radial-gradient(40% 30% at var(--lx) var(--ly), rgba(255,255,255,.9), transparent 70%); transition: background .1s; }
.ap-cert-corner { position: absolute; font: 400 clamp(20px, 4cqh, 30px)/1 ${AP_SERIF}; color: var(--ap-foil); }
.ap-cert-corner.is-tl { left: 16px; top: 12px; }
.ap-cert-corner.is-tr { right: 16px; top: 12px; transform: scaleX(-1); }
.ap-cert-corner.is-bl { left: 16px; bottom: 12px; transform: scaleY(-1); }
.ap-cert-corner.is-br { right: 16px; bottom: 12px; transform: scale(-1); }
.ap-cert-k { margin: 0; font: 700 clamp(10.5px, 1.7cqh, 13px) ${AP_SANS}; letter-spacing: .3em; text-transform: uppercase; color: var(--vw-accent-deep); }
.ap-cert-t { margin: -4px 0 0; font: 400 clamp(52px, 11cqh, 92px)/1 ${AP_SCRIPT};
  background: linear-gradient(100deg, var(--ap-deep), var(--ap-foil) 40%, #FFFFFF 50%, var(--ap-foil) 60%, var(--ap-deep)); background-size: 250% 100%; -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; animation: ap-cert-sweep 4s ease-in-out .4s infinite alternate; padding: 0 12px; }
.ap-cert-s { margin: 0; font: 500 clamp(14px, 2.4cqh, 18px)/1.3 ${AP_SERIF}; color: var(--vw-ink-soft); overflow-wrap: anywhere; }
.ap-cert-s.is-it { font-style: italic; color: var(--vw-ink); }
.ap-cert-n { margin: 2px 0; font: 400 clamp(32px, 6.4cqh, 52px)/1.05 ${AP_SCRIPT}; color: var(--vw-accent-deep); overflow-wrap: anywhere; }
.ap-cert-n i { font: italic 500 .5em ${AP_SERIF}; color: var(--ap-foil); }
.ap-cert-plan { margin: 4px 0 0; padding: 5px 12px; border-radius: 99px; background: color-mix(in srgb, var(--ap-blush) 80%, #FFFFFF); font: 600 clamp(12px, 1.9cqh, 14px)/1.3 ${AP_SANS}; color: var(--vw-ink); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--ap-foil) 50%, transparent); }
.ap-cert-row { width: 100%; display: grid; grid-template-columns: 1fr auto 1fr; align-items: end; gap: 10px; margin-top: clamp(4px, 1.4cqh, 12px); }
.ap-cert-sig { display: grid; gap: 2px; min-width: 0; }
/* Signatures wrap (a hyphenated name breaks at its hyphen) instead of being cut to "Anastasia-…". */
.ap-cert-sig b { font: 400 clamp(17px, min(3.6cqh, 5.6cqw), 30px)/1.05 ${AP_SCRIPT}; color: var(--vw-ink); font-weight: 400; overflow-wrap: break-word; text-wrap: balance; }
.ap-cert-sig i { height: 1.5px; background: var(--ap-foil); }
.ap-cert-seal { width: clamp(64px, 12cqh, 92px); aspect-ratio: 1; border-radius: 50%; display: grid; place-items: center;
  background: repeating-conic-gradient(from 0deg, var(--ap-foil) 0 10deg, color-mix(in srgb, var(--ap-foil) 75%, #FFFFFF) 10deg 20deg);
  box-shadow: 0 6px 14px -6px var(--ap-deep); animation: ap-seal-in .7s cubic-bezier(.3,1.6,.5,1) .6s both; }
.ap-cert-seal b { width: 74%; aspect-ratio: 1; border-radius: 50%; display: grid; grid-auto-flow: column; place-content: center; gap: 2px; align-items: center; background: radial-gradient(circle at 40% 35%, color-mix(in srgb, var(--ap-foil) 60%, #FFFFFF), var(--ap-foil)); box-shadow: inset 0 0 0 2px rgba(255,255,255,.7);
  font: 600 clamp(15px, 2.8cqh, 22px)/1 ${AP_SERIF}; color: #FFFFFF; text-shadow: 0 1px 1px color-mix(in srgb, var(--ap-deep) 60%, transparent); }
.ap-cert-seal small { font-size: .7em; }
@keyframes ap-cert-sweep { from { background-position: 100% 0 } to { background-position: 0 0 } }
@keyframes ap-seal-in { from { transform: scale(2.2) rotate(-30deg); opacity: 0 } to { transform: scale(1) rotate(0); opacity: 1 } }
.ap-cert-f { margin: 6px 0 0; font: 600 clamp(10.5px, 1.6cqh, 12px)/1.4 ${AP_SANS}; letter-spacing: .04em; color: var(--vw-ink-soft); }
.ap-cert-end { margin: 2px 0 0; font: 500 clamp(17px, 2.8cqh, 22px)/1.2 ${AP_HAND}; color: var(--vw-ink); overflow-wrap: anywhere; }
/* Short screens (landscape phones): the certificate turns wide and compact so every line stays inside it. */
@container (max-height: 360px) {
  .ap-cert { width: min(100%, 640px); padding: 10px 28px; gap: 1px; }
  .ap-cert-t { font-size: clamp(34px, 13cqh, 52px); margin: 0; }
  .ap-cert-n { font-size: clamp(24px, 9cqh, 32px); }
  .ap-cert-s { font-size: 13.5px; }
  .ap-cert-plan { margin: 2px 0 0; padding: 3px 10px; }
  .ap-cert-row { margin-top: 2px; }
  .ap-cert-seal { width: clamp(44px, 15cqh, 64px); }
  .ap-cert-sig b { font-size: clamp(17px, 6cqh, 22px); }
  .ap-cert-f { margin: 2px 0 0; }
  .ap-cert-end { font-size: 16px; }
  .ap-cert-corner { font-size: 18px; }
}
/* The goodbye sticker fills whatever room the fill has and steps aside entirely when there is none. */
.ap-keep-stk { display: grid; place-items: center; max-height: 100%; }
.ap-keep-stk .ap-stk > span { width: clamp(60px, calc(100cqh - 30px), 170px) !important; height: auto !important; }
.ap-keep-stk .ap-stk img { width: 100% !important; height: auto !important; }
@container (max-height: 84px) { .ap-keep-stk { display: none; } }
.ap-keep-btn { width: 100%; max-width: 380px; min-height: 50px; padding: 12px 18px; border-radius: 16px; cursor: pointer; font: 700 15px ${AP_SANS}; color: var(--vw-ink);
  border: 1.5px solid var(--ap-foil); background: linear-gradient(180deg, #FFFFFF, var(--ap-blush)); box-shadow: 0 8px 18px -12px var(--ap-deep); }
.ap-keep-btn:focus-visible { outline: 3px solid var(--vw-ink); outline-offset: 3px; }
@media (prefers-reduced-motion: reduce) { .ap-cert-t, .ap-cert-seal { animation: none; } }
`;

