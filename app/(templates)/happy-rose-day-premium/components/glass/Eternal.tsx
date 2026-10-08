"use client";

// Scene 7 — The Eternal Rose. The rose stands on a walnut base; a glass cloche descends and settles with a clink
// ("gh-clink"), and the base engraves itself letter by letter ("gh-engrave"): "{R} & {S} · since …" and the
// sender's engraving. The glow under the glass pulses at 72 bpm. Tap the dome: it glows brighter and lets go of one
// slow petal that never lands. Then the gardener's note (the voice note, or its caption), a sealed P.S. tied with a
// ribbon, the reply box ("Send a rose back"), and the Eternal Rose keepsake. react("completed") on arrival.

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ReplyBox, saveOrSharePoster, usePremium, VoiceNotePlayer } from "../../../_valentine/kit/premium";
import { EndingActions, haptic, useReducedMotion, type KeepsakeLayout } from "../../../_valentine/kit";
import type { DayConfig, ValentineDayData } from "../../../_valentine/types";
import { DomeScene, roseSvg, svgUrl } from "./art";
import { SHADES, type Glass } from "./util";

export function eternalKeepsake(g: Glass, data: ValentineDayData): KeepsakeLayout {
  const s = SHADES[g.color];
  const W = 1080;
  const rose = svgUrl(roseSvg(g.color, 520, { tilt: 0.7 }));
  const dome = `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="1290" viewBox="0 0 300 430">
<defs><radialGradient id="gl"><stop offset="0" stop-color="rgba(${s.glow},.8)"/><stop offset="1" stop-color="rgba(${s.glow},0)"/></radialGradient>
<linearGradient id="wd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7A4B2C"/><stop offset=".5" stop-color="#5A331C"/><stop offset="1" stop-color="#3A1F10"/></linearGradient>
<linearGradient id="gs" x1="0" x2="1"><stop offset="0" stop-color="rgba(255,255,255,.24)"/><stop offset=".2" stop-color="rgba(255,255,255,.04)"/><stop offset=".8" stop-color="rgba(255,255,255,.02)"/><stop offset="1" stop-color="rgba(255,255,255,.18)"/></linearGradient></defs>
<ellipse cx="150" cy="190" rx="135" ry="135" fill="url(#gl)"/>
<path d="M26 362 L274 362 L266 408 Q150 424 34 408 Z" fill="url(#wd)"/><ellipse cx="150" cy="362" rx="124" ry="20" fill="#8B5A35"/><ellipse cx="150" cy="360" rx="110" ry="14" fill="#6B4026"/>
<path d="M150 358 C146 320 154 280 150 226" stroke="#3E6B3A" stroke-width="5" fill="none" stroke-linecap="round"/>
<path d="M150 312 C132 300 116 302 104 312 C120 322 138 322 150 312 Z" fill="#4F8248"/><path d="M151 282 C168 268 186 270 196 280 C182 292 164 292 151 282 Z" fill="#4F8248"/>
<image href="${rose}" x="78" y="140" width="144" height="144"/>
<path d="M44 360 L44 160 C44 40 256 40 256 160 L256 360 Z" fill="url(#gs)" stroke="rgba(255,255,255,.5)" stroke-width="2"/>
<path d="M64 330 L64 168 C64 96 110 66 150 62" fill="none" stroke="rgba(255,255,255,.5)" stroke-width="5" stroke-linecap="round" opacity=".55"/>
<ellipse cx="150" cy="48" rx="14" ry="7" fill="rgba(255,255,255,.55)"/></svg>`;
  return {
    width: W,
    height: 1920,
    background: { stops: [[0, "#6B4A3E"], [0.35, "#3A3330"], [1, "#121A17"]] },
    items: [
      { type: "text", text: "THE ETERNAL ROSE", x: W / 2, y: 120, size: 30, weight: 700, color: "#F4C27A", face: "ui" },
      { type: "image", src: svgUrl(dome), x: 90, y: 200, w: 900, h: 1290 },
      { type: "text", text: `${g.to} & ${g.from}`, x: W / 2, y: 1500, size: 64, face: "serif", italic: true, color: "#FFF3DE", maxWidth: 960, maxLines: 1 },
      { type: "text", text: g.since ? `since ${g.since}` : "always", x: W / 2, y: 1590, size: 38, face: "script", color: "#F4C27A", maxWidth: 900, maxLines: 1 },
      ...(g.engraving ? [{ type: "text" as const, text: g.engraving, x: W / 2, y: 1660, size: 36, face: "serif" as const, italic: true, color: "rgba(251,243,230,.85)", maxWidth: 900, maxLines: 2 }] : []),
      { type: "text", text: (data.endLine || "This one never wilts.").trim(), x: W / 2, y: 1750, size: 32, face: "serif", color: "rgba(251,243,230,.8)", maxWidth: 940, maxLines: 2 },
      { type: "text", text: "made on subhsandesh.in ✦", x: W / 2, y: 1860, size: 26, color: "rgba(251,243,230,.6)", face: "ui" },
    ],
  };
}

export function Eternal({ day, data, g, mode, sticker, onReplay, onArrive }: {
  day: DayConfig;
  data: ValentineDayData;
  g: Glass;
  mode: "preview" | "live";
  sticker: ReactNode;
  onReplay: () => void;
  onArrive: () => void;
}) {
  const { sfx, premium } = usePremium();
  const reduce = useReducedMotion();
  const [down, setDown] = useState(false);
  const [chars, setChars] = useState(0);
  const [boost, setBoost] = useState(false);
  const [floats, setFloats] = useState<number[]>([]);
  const [psOpen, setPsOpen] = useState(false);
  const [saving, setSaving] = useState<"idle" | "busy" | "done" | "failed">("idle");
  const sprite = useMemo(() => svgUrl(roseSvg(g.color, 300, { tilt: 0.7 })), [g.color]);
  const line1 = `${g.to} & ${g.from}${g.since ? ` · since ${g.since}` : ""}`;
  const line2 = g.engraving;
  const all = line1 + line2;
  const arrive = useRef(onArrive);
  const shade = SHADES[g.color];

  useEffect(() => {
    arrive.current();
    window.scrollTo({ top: 0 });
    const a = window.setTimeout(() => {
      setDown(true);
      sfx("gh-clink");
    }, reduce ? 200 : 900);
    return () => window.clearTimeout(a);
  }, [sfx, reduce]);

  useEffect(() => {
    if (!down || chars >= all.length) return;
    const t = window.setTimeout(() => {
      setChars((c) => c + 1);
      if (chars % 2 === 0) sfx("gh-engrave", { gain: 0.7 });
    }, chars === 0 ? (reduce ? 50 : 2200) : reduce ? 5 : 55);
    return () => window.clearTimeout(t);
  }, [down, chars, all.length, sfx, reduce]);

  const tapDome = () => {
    setBoost(true);
    sfx("glass-ping", { gain: 0.8 });
    sfx("sparkle", { at: 0.1, gain: 0.6 });
    haptic(8);
    setFloats((f) => [...f.slice(-3), Date.now()]);
    window.setTimeout(() => setBoost(false), 1600);
  };

  const save = async () => {
    setSaving("busy");
    const r = await saveOrSharePoster(eternalKeepsake(g, data), `${day.slug}-${data.recipientName}`, "My eternal rose 🌹");
    setSaving(r === "failed" ? "failed" : "done");
  };

  const e1 = line1.slice(0, Math.min(chars, line1.length));
  const e2 = chars > line1.length ? line2.slice(0, chars - line1.length) : "";
  return (
    <section className="gh-scene" aria-label="The eternal rose">
      <p className="gh-kick">The eternal rose</p>
      <h2 className="gh-h" style={{ fontSize: "clamp(28px, 7.6vw, 46px)" }}>This one never wilts.</h2>
      <div className="gh-domeWrap" onClick={tapDome} role="button" tabIndex={0} aria-label="Tap the glass dome" onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); tapDome(); } }}>
        <DomeScene color={g.color} id="gh-dome" domeDown={down} engraved={[e1, e2]} glowBoost={boost} sprite={sprite} />
        {floats.map((f) => <span key={f} className="gh-floatPetal" style={{ ["--pl" as string]: shade.light, ["--pb" as string]: shade.base }} aria-hidden />)}
        <span style={{ position: "absolute", right: -6, top: "8%" }}>{sticker}</span>
      </div>
      <p className="gh-sub gh-in" style={{ marginTop: 12, animationDelay: "3s" }}>{data.endLine || "Neither will I."}</p>
      <div className="gh-endWrap">
        <VoiceNotePlayer label={`A note from the gardener · ${g.from}`} accent="#C98E44" track="#FBF3E6" />
        {premium.psLetter && (
          <button type="button" className="gh-ps" aria-expanded={psOpen} onClick={() => { if (!psOpen) sfx("ribbon"); setPsOpen(true); }}>
            <b>P.S. · tied with a ribbon</b>
            {psOpen ? premium.psLetter : `${premium.psLetter.split("\n")[0].slice(0, 80)} — tap to untie.`}
          </button>
        )}
        <button type="button" className="gh-btn" onClick={save} disabled={saving === "busy"} aria-live="polite">
          {saving === "busy" ? "Pressing it…" : saving === "done" ? "Saved ✦" : saving === "failed" ? "Try again" : "Keep the Eternal Rose 🌹"}
        </button>
        <ReplyBox title="Send a rose back" placeholder="A line back to the gardener…" accent="#A8303E" />
        <EndingActions day={day} data={data} mode={mode} onReplay={onReplay} keepsake={() => eternalKeepsake(g, data)} replyLabel="🌹 Send one back on WhatsApp" />
        <p className="gh-hint" style={{ opacity: 0.6 }}>Made with SubhSandesh ✦ Premium</p>
      </div>
    </section>
  );
}
