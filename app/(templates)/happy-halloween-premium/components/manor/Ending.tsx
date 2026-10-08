"use client";

// Sunrise over the manor. The keepsake is in-world: their portrait now hangs
// in the manor's gallery — a gilded frame with a brass plaque ("Meera &
// Arjun · Villa Boo-tiful · Halloween 2026") — saved as a 9:16 story or a 4:5
// post. Then the manor's guest book (what happened tonight, in ink), the
// guest-book reply to the sender (ReplyBox), the end line, and the ways out:
// send a reply on WhatsApp, replay, "Haunt someone back ✦".

import Link from "next/link";
import { useState } from "react";
import { sfx, ReplyBox, saveOrSharePoster } from "../../../_valentine/kit/premium";
import { CroppedPhoto, haptic, type KeepsakeItem, type KeepsakeLayout } from "../../../_valentine/kit";
import { suggestionFor } from "../../../_valentine/music/youtube";
import type { DayConfig, ValentineDayData } from "../../../_valentine/types";
import { BOOK, ENGRAVED, SCRIPT } from "./fonts";
import type { Manor } from "./model";
import { Gilded, Kicker, Quiet, Room } from "./ui";

export interface NightStats {
  candles: number;
  portraits: number;
  spirits: number;
}

function portraitLayout(day: DayConfig, data: ValentineDayData, m: Manor, format: "story" | "feed"): KeepsakeLayout {
  const W = 1080;
  const H = format === "feed" ? 1350 : 1920;
  const story = format === "story";
  const year = new Date().getFullYear();
  const fw = story ? 760 : 560;
  const fh = Math.round(fw * 1.25);
  const fx = (W - fw) / 2;
  const fy = story ? 300 : 170;
  const items: KeepsakeItem[] = [];
  items.push({ type: "text", text: "THE MIDNIGHT MANOR · GALLERY", x: W / 2, y: story ? 150 : 70, size: 30, weight: 600, face: "serif", color: "#FFE6B0" });
  // gilded frame: dark shadow, outer gold, inner bevel, liner
  items.push({ type: "rect", x: fx - 46, y: fy - 40, w: fw + 92, h: fh + 92, radius: 10, fill: "rgba(20,10,20,0.55)" });
  items.push({ type: "rect", x: fx - 52, y: fy - 52, w: fw + 104, h: fh + 104, radius: 8, fill: "#B9832E", stroke: "#F4D58D", lineWidth: 6 });
  items.push({ type: "rect", x: fx - 30, y: fy - 30, w: fw + 60, h: fh + 60, radius: 4, fill: "#E9B95A", stroke: "#7A4E14", lineWidth: 5 });
  items.push({ type: "rect", x: fx - 8, y: fy - 8, w: fw + 16, h: fh + 16, radius: 2, fill: "#3A240A" });
  const photo = data.photos.find((ph) => ph && ph.url);
  if (photo) items.push({ type: "image", src: photo.url, x: fx, y: fy, w: fw, h: fh, cropX: photo.cropX, cropY: photo.cropY });
  else {
    items.push({ type: "rect", x: fx, y: fy, w: fw, h: fh, fill: "#1A1633" });
    items.push({ type: "emoji", char: "🕯️", x: W / 2, y: fy + fh / 2, size: 260 });
  }
  // brass plaque
  const py = fy + fh + 90;
  items.push({ type: "rect", x: W / 2 - 330, y: py, w: 660, h: story ? 190 : 150, radius: 12, fill: "#D9AE5C", stroke: "#7A4E14", lineWidth: 4 });
  items.push({ type: "text", text: `${m.recipient} & ${m.sender}`, x: W / 2, y: py + 26, size: story ? 54 : 46, weight: 700, face: "serif", color: "#2A1A06", maxWidth: 600, maxLines: 1 });
  items.push({ type: "text", text: `${m.manorName} · Halloween ${year}`.toUpperCase(), x: W / 2, y: py + (story ? 100 : 86), size: 24, weight: 600, face: "ui", color: "#4A3010", maxWidth: 600, maxLines: 1 });
  if (story) items.push({ type: "text", text: `“${m.nightTitle}”`, x: W / 2, y: py + 140, size: 28, italic: true, face: "serif", color: "#4A3010", maxWidth: 600, maxLines: 1 });
  const ly = py + (story ? 260 : 185);
  if (data.endLine) items.push({ type: "text", text: data.endLine, x: W / 2, y: ly, size: story ? 44 : 36, italic: true, face: "serif", color: "#FFF8EC", maxWidth: 900, maxLines: 2 });
  items.push({ type: "text", text: "✦ made on subhsandesh.in", x: W / 2, y: H - (story ? 90 : 60), size: 26, face: "ui", color: "rgba(255,248,236,0.75)" });
  void day;
  return { width: W, height: H, background: { stops: [[0, "#1A1633"], [0.42, "#4B2F5E"], [0.78, "#D9848D"], [1, "#FFD49A"]] }, items };
}

export default function Ending({ day, data, m, stats, mode, onReplay }: { day: DayConfig; data: ValentineDayData; m: Manor; stats: NightStats; mode: "preview" | "live"; onReplay: () => void }) {
  const [saving, setSaving] = useState<"" | "story" | "feed">("");
  const [saved, setSaved] = useState<string>("");
  const photo = data.photos.find((ph) => ph && ph.url);
  const song = data.musicMode === "youtube" ? suggestionFor(data.musicYoutubeId, day.music?.suggestions) : null;
  const year = new Date().getFullYear();
  const reply = day.copy.replyText;
  const wa = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${reply}${m.sender ? `\n— to ${m.sender}` : ""}`)}`;

  const save = async (format: "story" | "feed") => {
    setSaving(format);
    haptic(10);
    sfx("paper-rustle", { gain: 0.5 });
    const r = await saveOrSharePoster(portraitLayout(day, data, m, format), `midnight-manor-${m.recipient}-${format}`, `${m.recipient} & ${m.sender} · ${m.manorName}`);
    setSaving("");
    setSaved(r === "failed" ? "Couldn't save here — take a screenshot instead 📸" : r === "shared" ? "Shared ✦" : "Saved to your downloads ✦");
    if (r !== "failed") sfx("chime", { gain: 0.6 });
  };

  const ledger: [string, string][] = [
    ["Guest of honour", m.recipient],
    ["Host", m.sender],
    ["Candles lit", String(stats.candles || m.candles.length)],
    ["Portraits awakened", String(stats.portraits)],
    ["Spirits consulted", String(stats.spirits || m.qa.length)],
    ...(m.guest ? ([["Special guest", m.guest]] as [string, string][]) : []),
    ...(song ? ([["The band played", `${song.title} · ${song.artist}`]] as [string, string][]) : []),
    ["The clock struck", "twelve, and they said yes"],
  ];

  return (
    <Room label="Sunrise over the manor" className="mm-ending" top={110}>
      <Kicker>Sunrise · {m.manorName}</Kicker>
      <h2 className="mm-endH" style={{ fontFamily: ENGRAVED }}>Your portrait now hangs in the gallery</h2>

      <figure className="mm-hang">
        <span className="mm-cord" aria-hidden />
        <div className="mm-frame">
          <div className="mm-frameIn">{photo ? <CroppedPhoto photo={photo} eager /> : <span className="mm-frameEmpty">🕯️</span>}</div>
        </div>
        <figcaption className="mm-plaqueBig">
          <b style={{ fontFamily: SCRIPT }}>{m.recipient} &amp; {m.sender}</b>
          <span style={{ fontFamily: ENGRAVED }}>{m.manorName} · Halloween {year}</span>
          <i style={{ fontFamily: BOOK }}>“{m.nightTitle}”</i>
        </figcaption>
      </figure>

      <div className="mm-saveRow">
        <Gilded onClick={() => save("story")} disabled={!!saving}>{saving === "story" ? "Framing it…" : "Save the portrait ✦"}</Gilded>
        <Quiet onClick={() => save("feed")}>{saving === "feed" ? "Framing…" : "4:5 for a post"}</Quiet>
      </div>
      {saved && <p className="mm-saved" role="status">{saved}</p>}

      <section className="mm-ledger" aria-label="The manor's guest book">
        <h3 style={{ fontFamily: ENGRAVED }}>The manor&rsquo;s guest book</h3>
        <dl>
          {ledger.map(([k, v]) => (
            <div key={k}>
              <dt style={{ fontFamily: BOOK }}>{k}</dt>
              <dd style={{ fontFamily: SCRIPT }}>{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      <ReplyBox title={`Sign ${m.sender}'s guest book`} placeholder="Write back — a line, a memory, a yes…" accent="#7A1E2C" className="mm-reply" />

      <p className="mm-endLine" style={{ fontFamily: BOOK }}>{data.endLine || "Happy Halloween. You haunt me in the best way. 🕯️"}</p>

      <div className="mm-actions">
        <a className="mm-wa" href={wa} target="_blank" rel="noopener noreferrer" onClick={() => haptic(10)}>💬 Send a reply on WhatsApp</a>
        <div className="mm-actRow">
          <Quiet onClick={onReplay}>↺ Replay the night</Quiet>
          {mode === "live" && (
            <Link href="/templates" className="mm-haunt">Haunt someone back ✦</Link>
          )}
        </div>
      </div>
      <style>{CSS}</style>
    </Room>
  );
}

const CSS = `
.mm-ending { gap: 14px; padding-bottom: 56px; }
.mm-endH { margin: 0; font-size: clamp(22px, 6vw, 30px); line-height: 1.15; color: #FFF4DA; text-wrap: balance; text-shadow: 0 2px 20px rgba(120,40,60,.5); }
.mm-hang { position: relative; margin: 10px 0 0; display: grid; justify-items: center; gap: 14px; animation: mm-hang 1.4s cubic-bezier(.22,1,.36,1) both; }
@keyframes mm-hang { from { opacity: 0; transform: translateY(-30px) rotate(-2deg); } to { opacity: 1; transform: none; } }
.mm-cord { position: absolute; top: -36px; width: 46%; height: 40px; border: 2px solid #9A6A1F; border-bottom: 0; border-radius: 50% 50% 0 0 / 100% 100% 0 0; }
.mm-frame { width: min(62vw, 250px); padding: 16px; box-sizing: border-box; border-radius: 6px;
  background: linear-gradient(135deg, #F4D58D 0%, #B9832E 22%, #FBE3A0 40%, #8E5D1A 62%, #E9B95A 80%, #7A4E14 100%);
  box-shadow: inset 0 0 0 3px rgba(60,35,8,.55), inset 0 0 0 9px rgba(255,236,180,.35), 0 30px 60px -20px rgba(40,10,30,.85), 0 0 0 1px #3A240A; }
.mm-frameIn { aspect-ratio: 4 / 5; overflow: hidden; background: #1A1633; box-shadow: inset 0 0 0 2px rgba(0,0,0,.6); display: grid; place-items: center; }
.mm-frameEmpty { font-size: 80px; }
.mm-plaqueBig { display: grid; gap: 2px; padding: 10px 22px; border-radius: 8px; background: linear-gradient(180deg, #F4D58D, #C99A4A); color: #2A1A06; box-shadow: 0 10px 22px -8px rgba(0,0,0,.6); max-width: 92%; }
.mm-plaqueBig b { font-size: 26px; line-height: 1.1; }
.mm-plaqueBig span { font-size: 10.5px; font-weight: 700; letter-spacing: .16em; text-transform: uppercase; }
.mm-plaqueBig i { font-size: 15px; }
.mm-saveRow { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; align-items: center; }
.mm-saved { margin: 0; font: 600 13.5px/1.3 var(--vw-font-ui, system-ui), sans-serif; color: #FFF4DA; }
.mm-ledger { width: 100%; max-width: 440px; box-sizing: border-box; padding: 18px 20px; border-radius: 6px; text-align: left; color: #3B2414;
  background: linear-gradient(90deg, rgba(0,0,0,.08), transparent 6%), radial-gradient(120% 90% at 50% 40%, #F7EDD6, #E5D2A8);
  box-shadow: 0 24px 50px -24px rgba(40,10,30,.8); }
.mm-ledger h3 { margin: 0 0 10px; text-align: center; font-size: 13px; letter-spacing: .22em; text-transform: uppercase; color: #6B4A2A; }
.mm-ledger dl { margin: 0; display: grid; gap: 6px; }
.mm-ledger dl > div { display: flex; gap: 10px; align-items: baseline; border-bottom: 1px solid rgba(107,74,42,.25); padding-bottom: 4px; }
.mm-ledger dt { flex: none; font-size: 15px; font-style: italic; color: #6B4A2A; }
.mm-ledger dd { margin: 0; flex: 1; min-width: 0; text-align: right; font-size: 20px; line-height: 1.15; color: #2A1A06; overflow-wrap: anywhere; }
.mm-reply { background: rgba(26,14,30,.55) !important; border-color: rgba(255,214,154,.35) !important; color: #FFF4DA !important; }
.mm-endLine { margin: 6px 0 0; max-width: 30ch; font-size: clamp(21px, 5.6vw, 26px); font-style: italic; line-height: 1.35; color: #FFF8EC; text-wrap: balance; text-shadow: 0 2px 18px rgba(80,20,40,.6); }
.mm-actions { display: grid; gap: 10px; width: 100%; max-width: 380px; }
.mm-wa { display: inline-flex; align-items: center; justify-content: center; min-height: 52px; border-radius: 16px; text-decoration: none; font: 700 16px/1 var(--vw-font-ui, system-ui), sans-serif;
  color: #2b1a03; background: linear-gradient(135deg, #fff1bf, #e9b95a 45%, #9a6a1f); box-shadow: 0 12px 26px -12px rgba(120,60,20,.7); }
.mm-actRow { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; }
.mm-haunt { display: inline-flex; align-items: center; min-height: 44px; padding: 0 16px; border-radius: 99px; text-decoration: none; color: #FFF4DA; font: 700 14px/1 var(--vw-font-ui, system-ui), sans-serif;
  border: 1px solid rgba(255,214,154,.5); background: rgba(122,30,44,.55); }
.mm-wa:focus-visible, .mm-haunt:focus-visible { outline: 3px solid var(--vw-gold); outline-offset: 3px; }
@media (prefers-reduced-motion: reduce) { .mm-hang { animation: none; } }
`;
