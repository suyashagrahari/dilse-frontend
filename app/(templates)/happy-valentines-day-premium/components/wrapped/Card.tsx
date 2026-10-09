"use client";

// ─── 10 · The "Us, Wrapped" card — the keepsake ──────────────────────────────────
// The summary card Wrapped ends on (photo, days, top song, top place, most-said phrase), saved as a 1080×1920
// story image in the same type. Then the sealed P.S. and "write back" in a drawer, so the card stays the one thing
// on screen.

import { useEffect, useState } from "react";
import { CinematicPhoto, ReplyBox, saveOrSharePoster, usePremium } from "../../../_valentine/kit/premium";
import type { KeepsakeItem, KeepsakeLayout } from "../../../_valentine/kit/keepsake";
import { WRAPPED_FAMILIES } from "./fonts";
import { C, daysSince, fmt, type Wrapped } from "./model";
import type { SlideProps } from "./ui";

function cells(w: Wrapped) {
  const out: { label: string; value: string; big?: boolean }[] = [];
  out.push({ label: "Days together", value: w.since ? fmt(daysSince(w.since)) : "∞", big: true });
  out.push({ label: "Top song", value: w.song?.title || "Ours" });
  if (w.place) out.push({ label: "Top place", value: w.place });
  if (w.phrase) out.push({ label: "Most-said", value: w.phrase });
  if (out.length < 4 && w.trait) out.push({ label: "Top trait", value: w.trait });
  if (out.length < 4 && w.datePlan) out.push({ label: "Coming soon", value: w.datePlan });
  return out.slice(0, 4);
}

function posterLayout(w: Wrapped): KeepsakeLayout {
  const W = 1080, H = 1920;
  const items: KeepsakeItem[] = [];
  items.push({ type: "rect", x: 760, y: -160, w: 520, h: 520, radius: 260, fill: C.pink });
  items.push({ type: "rect", x: -120, y: 1500, w: 560, h: 150, radius: 75, fill: C.lilac });
  items.push({ type: "text", text: `US, WRAPPED · ${w.year}`, x: 90, y: 120, size: 34, weight: 800, face: "ui", color: C.ink, align: "left" });
  items.push({ type: "rect", x: 90, y: 230, w: 900, h: 1300, radius: 48, fill: C.ink });
  const p = w.photos[0];
  if (p?.url) items.push({ type: "image", src: p.url, x: 120, y: 260, w: 840, h: 540, radius: 30, cropX: p.cropX, cropY: p.cropY });
  items.push({ type: "text", text: `${w.to} & ${w.from}`, x: 150, y: 850, size: 70, weight: 800, face: "ui", color: "#FFF6E8", align: "left", maxWidth: 780, maxLines: 1 });
  const cs = cells(w);
  cs.forEach((c, i) => {
    const x = i % 2 === 0 ? 150 : 580;
    const y = 1000 + Math.floor(i / 2) * 230;
    items.push({ type: "text", text: c.label.toUpperCase(), x, y, size: 26, weight: 700, face: "ui", color: C.lilac, align: "left" });
    items.push({ type: "text", text: c.value, x, y: y + 44, size: c.big ? 96 : 46, weight: 800, face: "ui", color: c.big ? C.butter : "#FFF6E8", align: "left", maxWidth: 380, maxLines: 2, lineHeight: 1.05 });
  });
  items.push({ type: "rect", x: 150, y: 1440, w: 780, h: 2, fill: "rgba(255,255,255,0.14)" });
  items.push({ type: "text", text: "MADE WITH LOVE ✦ SUBHSANDESH.IN", x: 150, y: 1466, size: 22, weight: 700, face: "ui", color: "rgba(255,246,232,0.7)", align: "left" });
  if (w.endLine) items.push({ type: "text", text: w.endLine, x: W / 2, y: 1640, size: 58, face: "serif", italic: true, color: C.ink, maxWidth: 900, maxLines: 2, lineHeight: 1.1 });
  return { width: W, height: H, background: C.tomato, items };
}

/** Draw the poster in this template's type: point the canvas faces at Bricolage + Instrument Serif for the save. */
async function savePoster(w: Wrapped) {
  const root = document.querySelector<HTMLElement>("[data-vw-day]") ?? document.documentElement;
  const prev = { ui: root.style.getPropertyValue("--font-fredoka"), serif: root.style.getPropertyValue("--font-vw-serif") };
  root.style.setProperty("--font-fredoka", WRAPPED_FAMILIES.sans);
  root.style.setProperty("--font-vw-serif", WRAPPED_FAMILIES.serif);
  try {
    return await saveOrSharePoster(posterLayout(w), `us-wrapped-${w.to}`, `Our ${w.year}, wrapped 💘`);
  } finally {
    if (prev.ui) root.style.setProperty("--font-fredoka", prev.ui); else root.style.removeProperty("--font-fredoka");
    if (prev.serif) root.style.setProperty("--font-vw-serif", prev.serif); else root.style.removeProperty("--font-vw-serif");
  }
}

export default function WrappedCard({ w, onComplete, onReplay }: SlideProps & { onComplete: () => void; onReplay: () => void }) {
  const { sfx, premium } = usePremium();
  const [drawer, setDrawer] = useState<null | "ps" | "reply">(null);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    onComplete();
    sfx("chime", { gain: 0.5 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const save = async () => {
    if (saving) return;
    setSaving(true);
    sfx("glass-ping", { gain: 0.6 });
    await savePoster(w).catch(() => "failed");
    setSaving(false);
  };
  const openPs = () => {
    setDrawer("ps");
    sfx("wax-crack", { gain: 0.7 });
  };
  const ps = premium.psLetter.trim();
  const [psHead, ...psRest] = ps.split(/\n\s*\n/);
  const p = w.photos[0];

  return (
    <div className="uw-slide uw-card">
      <p className="uw-eyebrow uw-fade">Us, Wrapped · {w.year}</p>
      <div className="uw-sheet">
        <div className="uw-sheetPhoto">
          {p ? <CinematicPhoto photo={p} grade="warm" frame="full" caption="" kenBurns="pan" focusPull={false} eager alt="" style={{ position: "absolute", inset: 0, height: "100%" }} /> : <div style={{ position: "absolute", inset: 0, background: C.pink }} />}
        </div>
        <div className="uw-sheetBody">
          <h3>{w.to} <em>&amp;</em> {w.from}</h3>
          <div className="uw-sheetGrid">
            {cells(w).map((c) => (
              <div key={c.label} className={c.big ? "big" : undefined}>
                <small>{c.label}</small>
                <b>{c.value}</b>
              </div>
            ))}
          </div>
          <div className="uw-sheetFoot"><span>Made with love</span><span>✦ {w.year}</span></div>
        </div>
      </div>
      {w.endLine && <p className="uw-serif uw-endLine uw-fade" style={{ ["--d" as string]: ".5s" }}>{w.endLine}</p>}

      <div className="uw-foot" style={{ flexDirection: "column", gap: 10 }}>
        <button type="button" className="uw-next" onClick={save} disabled={saving}>{saving ? "Wrapping it up…" : "Save our card"}</button>
        <div className="uw-actions">
          {ps && <button type="button" className="uw-chipBtn" onClick={openPs}>Open the P.S. ✦</button>}
          {premium.allowReply && <button type="button" className="uw-chipBtn" onClick={() => { setDrawer("reply"); sfx("paper-rustle", { gain: 0.5 }); }}>Write back</button>}
          <button type="button" className="uw-chipBtn" onClick={onReplay} aria-label="Watch it again">↺</button>
        </div>
      </div>

      {drawer && (
        <>
          <button type="button" className="uw-scrimTap" aria-label="Close" onClick={() => setDrawer(null)} />
          <div className="uw-drawer" role="dialog" aria-modal="true" aria-label={drawer === "ps" ? "P.S." : "Write back"}>
            <button type="button" className="uw-drawerX" onClick={() => setDrawer(null)} aria-label="Close">✕</button>
            {drawer === "ps" ? (
              <>
                <h4>P.S.</h4>
                <p>{psHead}</p>
                {psRest.length > 0 && <p>{psRest.join("\n\n")}</p>}
              </>
            ) : (
              <ReplyBox title={`Write back to ${w.from}`} placeholder="Say it back…" accent={C.tomato} onSent={() => sfx("chime-cascade", { gain: 0.5 })} />
            )}
          </div>
        </>
      )}
    </div>
  );
}
