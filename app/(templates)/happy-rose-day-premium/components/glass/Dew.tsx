"use client";

// Scene 6 — Dew-drop memories (the photos, in this world's own style). Macro rose petals fill the screen; every
// photo sits inside a dew drop (refracted a little larger than its frame, a specular highlight, a caustic). Tap a
// drop — "gh-drip" — and it swells into a lens over the whole screen with its caption and note.
// Mini-game 2 (easter egg): a TINY dew drop on a bare stem shimmers every 6 s; tapping it reveals the sender's
// secret ("gh-secret") and is reported to them (completed beacon count = 1).

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { usePremium } from "../../../_valentine/kit/premium";
import { CroppedPhoto } from "../../../_valentine/kit";
import type { LovePhoto } from "../../../_valentine/types";
import { SHADES, type Glass } from "./util";

export function Dew({ g, photos, sticker, onFound, onDone }: { g: Glass; photos: LovePhoto[]; sticker: ReactNode; onFound: () => void; onDone: () => void }) {
  const { sfx } = usePremium();
  const list = photos.filter((p) => p && p.url).slice(0, 12);
  const [open, setOpen] = useState<number | null>(null);
  const [secret, setSecret] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const shade = SHADES[g.color];
  const sizes = useMemo(() => list.map((_, i) => ({ d: [132, 108, 120, 96, 126, 104][i % 6], dy: [0, 24, -10, 18, 6, -14][i % 6] })), [list]);
  const petals = useMemo(
    () => [
      { l: "-12%", t: "8%", w: "62vw", h: "48vh", r: -24 },
      { l: "54%", t: "-6%", w: "58vw", h: "44vh", r: 32 },
      { l: "-8%", t: "56%", w: "54vw", h: "50vh", r: 18 },
      { l: "58%", t: "52%", w: "60vw", h: "52vh", r: -36 },
    ],
    [],
  );

  useEffect(() => {
    if (open === null) return;
    closeRef.current?.focus();
    const k = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [open]);

  const shot = open !== null ? list[open] : null;
  return (
    <section className="gh-scene" aria-label="Dew-drop memories">
      <div className="gh-macro" aria-hidden>
        {petals.map((p, i) => <i key={i} style={{ left: p.l, top: p.t, width: p.w, height: p.h, transform: `rotate(${p.r}deg)`, ["--pl" as string]: shade.light, ["--pb" as string]: shade.dark }} />)}
      </div>
      <p className="gh-kick" style={{ position: "relative", zIndex: 4 }}>Dew-drop memories</p>
      <h2 className="gh-h" style={{ position: "relative", zIndex: 4, fontSize: "clamp(28px, 7.4vw, 44px)" }}>Every drop holds a day.</h2>
      <div style={{ position: "relative", zIndex: 4, marginTop: 6 }}>{sticker}</div>
      {list.length ? (
        <div className="gh-drops">
          {list.map((p, i) => (
            <button key={i} type="button" className="gh-drop" style={{ ["--d" as string]: `${sizes[i].d}px`, ["--dy" as string]: `${sizes[i].dy}px`, animationDelay: `${-i * 0.7}s` }}
              onClick={() => { sfx("gh-drip", { detune: (i % 4) * 120 }); setOpen(i); }} aria-label={`Open memory ${i + 1}${p.caption ? `: ${p.caption}` : ""}`}>
              <CroppedPhoto photo={p} alt="" />
            </button>
          ))}
        </div>
      ) : (
        <p className="gh-sub" style={{ position: "relative", zIndex: 4, marginTop: 18 }}>The best memories are still on their way.</p>
      )}
      <button type="button" className="gh-btn" style={{ position: "relative", zIndex: 4, marginTop: 26 }} onClick={onDone}>To the glass dome ▸</button>
      {g.secret && (
        <>
          <button type="button" className="gh-secret" aria-label="A tiny dew drop on a stem" onClick={() => { if (!secret) { sfx("gh-secret"); onFound(); } setSecret(true); }}><i /></button>
          {secret && <p className="gh-secretTip" role="status">{g.secret}</p>}
        </>
      )}
      {shot && (
        <div className="gh-lens" role="dialog" aria-modal="true" aria-label={shot.caption || `Memory ${(open ?? 0) + 1}`} onClick={() => setOpen(null)}>
          <div className="gh-lensIn" onClick={(e) => e.stopPropagation()}>
            <div className="gh-lensPhoto"><CroppedPhoto photo={shot} alt={shot.caption ?? ""} eager /></div>
            {shot.caption && <b>{shot.caption}</b>}
            {shot.note && <p>{shot.note}</p>}
            <div style={{ display: "flex", gap: 10 }}>
              <button ref={closeRef} type="button" className="gh-ghost" onClick={() => setOpen(null)}>◂ Back</button>
              {open !== null && open + 1 < list.length && <button type="button" className="gh-btn" onClick={() => { sfx("gh-drip", { detune: 200 }); setOpen(open + 1); }}>Next drop ▸</button>}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
