"use client";

// The exit · gift shop. Her keepsake: an ADMIT ONE ticket stub stamped "she said YES" + a photobooth strip of their
// photos, the week recap (rose → … → kiss → you), save it as a story-sized PNG, the sealed P.S., the wishing wall
// (ReplyBox) and "ride again".

import { useEffect, useState } from "react";
import { ReplyBox, saveOrSharePoster, usePremium } from "../../../_valentine/kit/premium";
import { CroppedPhoto, type KeepsakeItem, type KeepsakeLayout } from "../../../_valentine/kit";
import { C, GIF, WEEK, daysSince, fmt, fmtDate, pick, weekIcon, type Carnival } from "./model";
import { Gif, PopCard, Polaroid, Puffy, StallHead, Washi, reward, useStall } from "./ui";

function keepsakeLayout(c: Carnival): KeepsakeLayout {
  const items: KeepsakeItem[] = [];
  const p0 = pick(c.photos, 0);
  items.push({ type: "text", text: "★ VALENTINE CARNIVAL ★", x: 540, y: 150, size: 40, face: "ui", weight: 700, color: C.deep, align: "center" });
  items.push({ type: "text", text: `ADMIT ONE · ${c.to}`, x: 540, y: 270, size: 92, face: "script", weight: 700, color: C.primary, align: "center", maxWidth: 960 });
  items.push({ type: "text", text: c.ticketLine, x: 540, y: 340, size: 34, face: "ui", weight: 600, color: C.ink, align: "center", maxWidth: 940 });
  if (p0) items.push({ type: "image", src: p0.url, x: 90, y: 420, w: 560, h: 640, radius: 6, cropX: p0.cropX, cropY: p0.cropY, frame: { pad: 26, bottom: 96, color: "#FFFFFF" }, rotate: -3 });
  for (let i = 0; i < 4; i++) {
    const ph = pick(c.photos, i);
    if (ph) items.push({ type: "image", src: ph.url, x: 730, y: 430 + i * 222, w: 250, h: 190, radius: 4, cropX: ph.cropX, cropY: ph.cropY, frame: { pad: 14, bottom: 14, color: "#FFFFFF" }, rotate: 2 });
  }
  items.push({ type: "text", text: `♥ ${c.to} said YES ♥`, x: 540, y: 1330, size: 58, face: "ui", weight: 700, color: C.deep, align: "center" });
  let y = 1420;
  if (c.since) {
    items.push({ type: "text", text: `Together since ${fmtDate(c.since)} · ${fmt(daysSince(c.since))} days`, x: 540, y, size: 36, face: "ui", weight: 600, color: C.ink, align: "center", maxWidth: 940 });
    y += 64;
  }
  if (c.datePlan) {
    items.push({ type: "text", text: `Next ride: ${c.datePlan}`, x: 540, y, size: 34, face: "ui", weight: 600, color: C.ink, align: "center", maxWidth: 940, maxLines: 2, lineHeight: 1.3 });
    y += 96;
  }
  items.push({ type: "text", text: "rose · ring · chocolate · teddy · promise · hug · kiss → you", x: 540, y, size: 32, face: "ui", weight: 600, color: C.deep, align: "center", maxWidth: 960 });
  y += 90;
  if (c.endLine) items.push({ type: "text", text: c.endLine, x: 540, y, size: 60, face: "script", weight: 700, color: C.primary, align: "center", maxWidth: 940, maxLines: 2, lineHeight: 1.2 });
  items.push({ type: "text", text: `for ${c.to}, from ${c.from} · 14.02.${c.year}`, x: 540, y: 1840, size: 30, face: "ui", weight: 600, color: C.ink, align: "center" });
  return { width: 1080, height: 1920, background: { stops: [[0, "#FFF0F3"], [0.55, "#FFD6E0"], [1, "#EDE3FF"]] }, items };
}

export default function Keepsake({ onComplete, onReplay }: { onComplete: () => void; onReplay: () => void }) {
  const { c, sfx } = useStall();
  const { premium } = usePremium();
  const [ps, setPs] = useState(false);
  const [saving, setSaving] = useState<"idle" | "busy" | "done">("idle");
  const strip = [0, 1, 2, 3].map((i) => pick(c.photos, i));

  useEffect(() => {
    onComplete();
    // Only once, when she reaches the exit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const save = async () => {
    if (saving === "busy") return;
    setSaving("busy");
    sfx("snap", { gain: 0.6 });
    const r = await saveOrSharePoster(keepsakeLayout(c), `valentine-carnival-${c.to}`, `My Valentine carnival ticket 🎟💘`);
    setSaving(r === "failed" ? "idle" : "done");
    if (r !== "failed") reward(sfx, document.querySelector(".vc-stub"), { cue: "chime" });
  };

  return (
    <section className="vc-scene vc-exit" aria-label="Your keepsake">
      <StallHead kicker="Exit · Gift shop" title="Keep your ticket 🎟" hint="Proof you went to the best fair in the world" />
      <div className="vc-keep">
        <article className="vc-stub">
          <span className="vc-stubTop">★ VALENTINE CARNIVAL {c.year} ★</span>
          <b className="vc-stubAdmit">ADMIT ONE</b>
          <span className="vc-stubName">{c.to}</span>
          <div className="vc-stubPic">{strip[0] ? <CroppedPhoto photo={strip[0]} alt="" /> : <span>💖</span>}</div>
          <span className="vc-stubLine">{c.ticketLine}</span>
          {c.since && (
            <span className="vc-stubRow">
              since {fmtDate(c.since)} · <b>{fmt(daysSince(c.since))} days</b>
            </span>
          )}
          {c.datePlan && <span className="vc-stubRow">Next ride: {c.datePlan}</span>}
          <i className="vc-stamp">{c.to} said YES ♥</i>
        </article>
        <div className="vc-strip" aria-label="Photobooth strip">
          {strip.map((ph, i) => (
            <div key={i} className="vc-stripFrame">
              {ph ? <CroppedPhoto photo={ph} alt="" /> : <span>💗</span>}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="vc-stripSticker" src={weekIcon([0, 3, 5, 6][i])} alt="" width={28} height={28} loading="lazy" decoding="async" />
            </div>
          ))}
          <span className="vc-stripFoot">
            {c.to} + {c.from}
          </span>
        </div>
        <Gif src={GIF.penguinsDay} size={74} tilt={-8} float className="vc-exitGif" />
      </div>

      {c.endLine && <p className="vc-endLine">{c.endLine}</p>}

      <div className="vc-recap" aria-label="Our week">
        {WEEK.map((w, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={i} src={weekIcon(i)} alt={w.short} width={30} height={30} loading="lazy" decoding="async" />
        ))}
        <span className="vc-recapArrow">→</span>
        <b className="vc-recapYou">you</b>
      </div>

      <div className="vc-actions">
        <Puffy onClick={save}>{saving === "busy" ? "Printing…" : saving === "done" ? "Saved ✓ Save again" : "Save my ticket 🎟"}</Puffy>
        {premium.psLetter.trim() && (
          <Puffy tone="butter" onClick={() => (setPs(true), sfx("wax-crack", { gain: 0.6 }))}>
            Open the P.S. 💌
          </Puffy>
        )}
      </div>

      <ReplyBox title="Write on the wishing wall 💌" placeholder={`Say it back to ${c.from}: a line, a memory, a yes…`} accent={C.primary} className="vc-reply" onSent={() => reward(sfx, document.querySelector(".vc-reply"), { big: true })} />

      <button type="button" className="vc-link vc-again" onClick={onReplay}>
        Ride again ↺
      </button>

      <PopCard open={ps} onClose={() => setPs(false)} label="The sealed P.S.">
        <div className="vc-ps">
          <Washi rot={-6} style={{ left: 30, top: -10 }} />
          <span className="vc-prizeKick">P.S. ✦</span>
          {premium.psLetter.split(/\n\s*\n/).map((para, i) => (
            <p key={i} className={i === 0 ? "vc-psCond" : undefined}>
              {para}
            </p>
          ))}
          <p className="vc-sign">— {c.from}</p>
          <Polaroid photo={pick(c.photos, 5) ?? strip[1]} caption="" width={120} tilt={5} className="vc-psPic" />
        </div>
      </PopCard>
    </section>
  );
}
