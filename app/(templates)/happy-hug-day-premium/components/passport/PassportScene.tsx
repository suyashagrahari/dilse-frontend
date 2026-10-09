"use client";

// The keepsake · "Hug Passport: {name}, {VIP hugger}". The passport open on two pages: the holder's page (her photo,
// name, title, issued by him, valid forever, a cute machine-readable line) and the stamps page with every hug she
// collected. "Save my passport" makes a 1080×1920 PNG of the same spread (Web Share → download). Below: the sealed
// P.S., "Send a hug back" (she taps a hug type and the WhatsApp button sends that hug), his ReplyBox, and the
// shell's ending actions (replay, WhatsApp, make one).

import { useMemo, useState } from "react";
import { CroppedPhoto, EndingActions, haptic, type KeepsakeItem, type KeepsakeLayout } from "../../../_valentine/kit";
import { ReplyBox, saveOrSharePoster, usePremium } from "../../../_valentine/kit/premium";
import type { DayConfig, ValentineDayData } from "../../../_valentine/types";
import { Gif, HugEmblem, InkStamp } from "./art";
import { stampDataUrl } from "./stamps";
import { Puffy, Scene, useAww, usePassport, useSfx } from "./ui";
import { ALL_STAMPS, FIXED_GIF, HUG_KINDS, STAMP, photoAt, type Passport, type StampKind } from "./util";

const END = "Hugs on demand. No expiry. 🤗";
const STAMP_SPOTS: { x: number; y: number; r: number }[] = [
  { x: 6, y: 4, r: -10 },
  { x: 36, y: 0, r: 6 },
  { x: 66, y: 6, r: -4 },
  { x: 4, y: 50, r: 8 },
  { x: 35, y: 46, r: -7 },
  { x: 65, y: 50, r: 10 },
];

/** A cute machine-readable line: P<US<<ANANYA<<VIP<HUGGER<<<<<… */
export function mrz(g: Passport): string {
  const clean = (s: string) => s.toUpperCase().replace(/[^A-Z0-9]+/g, "<").replace(/^<|<$/g, "");
  const s = `P<US<<${clean(g.to)}<<${clean(g.hugTitle)}<<${clean(g.from)}`;
  return (s + "<".repeat(44)).slice(0, 44);
}

export function passportKeepsake(g: Passport, data: ValentineDayData, day: DayConfig, date: string): KeepsakeLayout {
  const W = 1080;
  const H = 1920;
  const items: KeepsakeItem[] = [];
  const cx = W / 2;
  // title
  items.push({ type: "text", text: "REPUBLIC OF US", x: cx, y: 112, size: 30, weight: 600, face: "ui", color: "#E0603F" });
  items.push({ type: "text", text: "HUG PASSPORT", x: cx, y: 164, size: 76, weight: 700, face: "ui", color: "#5E3226" });
  // holder's page
  items.push({ type: "rect", x: 92, y: 288, w: 900, h: 640, radius: 44, fill: "rgba(224,96,63,.12)" });
  items.push({ type: "rect", x: 80, y: 272, w: 900, h: 640, radius: 44, fill: "#FFFDF9", stroke: "#FFD3B8", lineWidth: 5 });
  items.push({ type: "rect", x: 80, y: 272, w: 900, h: 70, radius: 44, fill: "#FF8A6B" });
  items.push({ type: "rect", x: 80, y: 312, w: 900, h: 30, fill: "#FF8A6B" });
  items.push({ type: "text", text: "HOLDER · VALID FOREVER", x: cx, y: 290, size: 30, weight: 600, face: "ui", color: "#FFFDF9" });
  const photo = photoAt(g, 0);
  if (photo) items.push({ type: "image", src: photo.url, x: 130, y: 390, w: 330, h: 400, radius: 26, cropX: photo.cropX, cropY: photo.cropY });
  else items.push({ type: "emoji", char: "🤗", x: 295, y: 600, size: 180 });
  const fx = 510;
  const field = (label: string, value: string, y: number, script = false) => {
    items.push({ type: "text", text: label, x: fx, y, size: 24, weight: 600, face: "ui", color: "#B5715B", align: "left" });
    items.push({ type: "text", text: value, x: fx, y: y + (script ? 30 : 34), size: script ? 64 : 40, weight: 700, face: script ? "script" : "ui", color: "#5E3226", align: "left", maxWidth: 430, maxLines: 1 });
  };
  field("NAME", g.to, 396, true);
  field("STATUS", g.hugTitle, 520);
  field("ISSUED BY", g.from, 630);
  field("DATE OF ISSUE", `${date} · Hug Day`, 740);
  items.push({ type: "text", text: mrz(g), x: cx, y: 868, size: 26, weight: 600, face: "ui", color: "rgba(94,50,38,.55)" });
  // stamps page
  items.push({ type: "rect", x: 92, y: 980, w: 900, h: 600, radius: 44, fill: "rgba(224,96,63,.12)" });
  items.push({ type: "rect", x: 80, y: 964, w: 900, h: 600, radius: 44, fill: "#FFFDF9", stroke: "#FFD3B8", lineWidth: 5 });
  items.push({ type: "text", text: "STAMPS · EVERY KIND OF HUG", x: cx, y: 1020, size: 28, weight: 600, face: "ui", color: "#E0603F" });
  ALL_STAMPS.forEach((k, i) => {
    const s = STAMP_SPOTS[i];
    items.push({ type: "image", src: stampDataUrl(k, date, k === "forever" ? g.hugTitle : undefined), x: 110 + (s.x / 100) * 900, y: 1050 + (s.y / 100) * 520, w: 250, h: 250, rotate: s.r });
  });
  // end line + names
  const end = (data.endLine || END).trim();
  items.push({ type: "text", text: end, x: cx, y: 1630, size: 64, weight: 700, face: "script", color: "#5E3226", maxWidth: 880, maxLines: 2, lineHeight: 1.05 });
  items.push({ type: "text", text: `${g.to} ♥ ${g.from}`, x: cx, y: 1790, size: 52, weight: 700, face: "script", color: "#E0603F", maxWidth: 880, maxLines: 1 });
  items.push({ type: "text", text: `Hug Day · ${day.date} ${day.month} · made with love on subhsandesh.in ✦`, x: cx, y: 1868, size: 24, weight: 500, face: "ui", color: "rgba(94,50,38,.55)" });
  return { width: W, height: H, background: { stops: [[0, "#FFF8F1"], [0.6, "#FFEBDD"], [1, "#FFDCC8"]] }, items };
}

const HUG_BACK: Record<(typeof HUG_KINDS)[number], string> = {
  bear: "🐻 A bear hug, sent back. Squeezing you this tight.",
  back: "🫶 A back hug, sent back. Sneaking up on you right now.",
  twirl: "💫 A twirl hug, sent back. Spinning you round.",
  pat: "🤲 Pat, pat. A hug sent back for your bad days.",
  far: "✈️ A long-distance hug, sent back. It's on its way.",
};

export function PassportScene({ data, mode, onReplay }: { data: ValentineDayData; mode: "preview" | "live"; onReplay: () => void }) {
  const { g, day, date, got } = usePassport();
  const { premium } = usePremium();
  const sfx = useSfx();
  const aww = useAww();
  const [saving, setSaving] = useState<"idle" | "busy" | "done" | "failed">("idle");
  const [ps, setPs] = useState(false);
  const [back, setBack] = useState<(typeof HUG_KINDS)[number] | null>(null);
  const end = (data.endLine || END).trim();
  const photo = photoAt(g, 0);
  const shown: StampKind[] = useMemo(() => ALL_STAMPS.filter((k) => got.has(k) || k === "forever"), [got]);

  const save = async () => {
    setSaving("busy");
    const r = await saveOrSharePoster(passportKeepsake(g, data, day, date), `${day.slug}-${data.recipientName || "passport"}`, "My hug passport 🤗");
    setSaving(r === "failed" ? "failed" : "done");
    if (r !== "failed") aww({ x: 0.5, y: 0.4 });
  };
  const psText = premium.psLetter.trim();
  const nl = psText.indexOf("\n");
  const psFirst = (nl >= 0 ? psText.slice(0, nl) : psText).trim();
  const psRest = (nl >= 0 ? psText.slice(nl) : "").trim();
  const replyText = back ? `${HUG_BACK[back]}${g.replyLine ? `\n${g.replyLine}` : ""}` : undefined;

  return (
    <Scene id="passport" label="Your hug passport" kicker={`Hug Day · ${day.date} ${day.month}`} title="Passport complete 🛂" sub={`${g.to}, officially: ${g.hugTitle}`}>
      <div className="hp-spread">
        <div className="hp-id">
          <p className="hp-idHead">HUG PASSPORT · REPUBLIC OF US</p>
          <div className="hp-idRow">
            <span className="hp-idPhoto">{photo ? <CroppedPhoto photo={photo} alt={photo.caption ?? ""} /> : <HugEmblem species={g.species} size={100} />}</span>
            <dl className="hp-idFields">
              <dt>Name</dt>
              <dd className="is-name">{g.to}</dd>
              <dt>Status</dt>
              <dd>{g.hugTitle}</dd>
              <dt>Issued by</dt>
              <dd>{g.from}</dd>
              <dt>Valid</dt>
              <dd>forever</dd>
            </dl>
          </div>
          <p className="hp-mrz" aria-hidden>
            {mrz(g)}
          </p>
        </div>
        <div className="hp-stampsPage">
          <p className="hp-idHead">STAMPS · EVERY KIND OF HUG</p>
          <div className="hp-stampsGrid">
            {shown.map((k, i) => (
              <span key={k} className="hp-stampSpot" style={{ left: `${STAMP_SPOTS[i].x}%`, top: `${STAMP_SPOTS[i].y + 10}%`, ["--rot" as string]: `${STAMP_SPOTS[i].r}deg` }}>
                <InkStamp kind={k} size={96} date={date} top={k === "forever" ? g.hugTitle : undefined} uid={`pp-${k}`} />
              </span>
            ))}
          </div>
          <Gif src={FIXED_GIF.cuddle} size={86} className="hp-spreadPeek" tilt={-8} />
        </div>
        <p className="hp-spreadEnd">{end}</p>
        <p className="hp-spreadNames">
          {g.to} <span>♥</span> {g.from}
        </p>
      </div>

      <div className="hp-foot hp-foot--stack is-on">
        <Puffy onClick={save} disabled={saving === "busy"} cue="tick">
          {saving === "busy" ? "Printing it…" : saving === "done" ? "Saved 💗" : saving === "failed" ? "Try again" : "Save my passport 📱"}
        </Puffy>
      </div>

      <div className="hp-endMore">
        {psText && (
          <div className={`hp-ps${ps ? " is-open" : ""}`}>
            <button
              type="button"
              className="hp-seal"
              aria-expanded={ps}
              aria-label={ps ? "The P.S. is open" : `Break the seal: ${psFirst}`}
              onClick={() => {
                if (ps) return;
                setPs(true);
                sfx("wax-crack", { gain: 0.8 });
                haptic([12, 30, 8]);
              }}
            >
              <i className="hp-sealL" aria-hidden />
              <i className="hp-sealR" aria-hidden />
              <b aria-hidden>P.S.</b>
            </button>
            <p className="hp-psFirst">{psFirst}</p>
            {ps && psRest && <p className="hp-psRest">{psRest}</p>}
            {!ps && <span className="hp-psHint">tap the seal</span>}
          </div>
        )}
        <div className="hp-hugBack">
          <Gif src={FIXED_GIF.penguinText} size={80} className="hp-hugBackPeek" tilt={8} />
          <h3>Send a hug back 🤗</h3>
          <p>Pick one. {g.from} gets it on WhatsApp.</p>
          <div className="hp-hugChips" role="radiogroup" aria-label="Which hug to send back">
            {HUG_KINDS.map((k) => (
              <button
                key={k}
                type="button"
                role="radio"
                aria-checked={back === k}
                className={`hp-hugChip${back === k ? " is-on" : ""}`}
                style={{ ["--ink" as string]: STAMP[k].ink }}
                onClick={() => {
                  setBack(k);
                  sfx("plush-squeak", { gain: 0.4, detune: Math.random() * 300 });
                  haptic(12);
                }}
              >
                <span aria-hidden>{STAMP[k].emoji}</span> {STAMP[k].short.toLowerCase().replace("long-distance", "far-away")}
              </button>
            ))}
          </div>
          <ReplyBox title={`Or write ${g.from} a note`} placeholder={`Write ${g.from} a little note back…`} accent="#FF8A6B" className="hp-reply" />
        </div>
        <div className="hp-endKit">
          <EndingActions
            day={day}
            data={data}
            mode={mode}
            onReplay={onReplay}
            keepsake={() => passportKeepsake(g, data, day, date)}
            replyText={replyText}
            replyLabel={back ? `${STAMP[back].emoji} Send ${g.from} this hug on WhatsApp` : "🤗 Send a hug back on WhatsApp"}
          />
        </div>
        <p className="hp-credit">made with SubhSandesh ✦</p>
      </div>
    </Scene>
  );
}
