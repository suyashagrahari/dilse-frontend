"use client";

// ─── Scene: the vow — the voice, then the letter stitched in paragraph by
// paragraph (tap the needle), then a red thumbprint sealed by press-and-hold.
// The whole letter is in the DOM from the start (faded), so it stays readable
// to screen readers and "Stitch it all" shows everything at once.

import { useEffect, useMemo, useState } from "react";
import { useHoldProgress } from "../../../_valentine/kit";
import { usePremium, VoiceNotePlayer } from "../../../_valentine/kit/premium";
import type { SceneProps } from "./shared";

function Thumbprint({ p, color }: { p: number; color: string }) {
  const rings = Array.from({ length: 9 }, (_, i) => i);
  return (
    <svg viewBox="0 0 100 120" className="tp-thumb" aria-hidden style={{ opacity: Math.min(1, p * 1.4) }}>
      <g transform={`translate(50 60) scale(${0.4 + 0.6 * p}) translate(-50 -60)`}>
        {rings.map((i) => (
          <ellipse
            key={i}
            cx="50"
            cy={60 + i * 0.6}
            rx={6 + i * 4.6}
            ry={8 + i * 5.6}
            fill="none"
            stroke={color}
            strokeWidth="2.2"
            strokeDasharray={`${18 + i * 6} ${3 + (i % 3) * 2}`}
            transform={`rotate(${i * 9 - 20} 50 60)`}
            opacity={0.55 + 0.04 * i}
          />
        ))}
      </g>
    </svg>
  );
}

export default function Vow({ data, color, reduced, sfx, next }: SceneProps) {
  const p = usePremium();
  const paras = useMemo(() => data.letter.split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean), [data.letter]);
  const [sewn, setSewn] = useState(reduced ? paras.length : 0);
  const [sealed, setSealed] = useState(false);
  useEffect(() => {
    p.music?.fadeTo(0.55, 900);
    return () => p.music?.fadeTo(1, 900);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const stitch = () => {
    if (sewn >= paras.length) return;
    sfx("tp-stitch", { dur: 0.7 });
    setSewn((s) => s + 1);
  };
  const thumb = useHoldProgress({
    duration: 1200,
    onComplete: () => {
      setSealed(true);
      sfx("tp-ink");
    },
  });
  const allSewn = sewn >= paras.length;

  return (
    <section className="tp-sec tp-vowSec">
      <header className="tp-head">
        <p className="tp-kick">The vow</p>
      </header>
      <div className="tp-voice">
        <VoiceNotePlayer
          label={<span className="tp-voiceLbl">Hear it first, in {data.senderName ? `${data.senderName}'s` : "my"} voice</span>}
          accent={color}
          track="rgba(247,241,232,.4)"
          fallback={
            p.premium.voiceCaption ? (
              <div className="tp-voiceNote">
                <span className="tp-voiceLbl">A line before the vow</span>
                <i>“{p.premium.voiceCaption}”</i>
              </div>
            ) : null
          }
        />
      </div>
      <article className="tp-paper">
        {paras.map((t, i) => (
          <div key={i} className={`tp-para${i < sewn ? " is-sewn" : ""}`} style={{ ["--tc" as string]: color }}>
            <span className="tp-stitchLine" aria-hidden />
            <p>{t}</p>
          </div>
        ))}
        <div className={`tp-sigs${allSewn ? " is-on" : ""}`}>
          <div className="tp-sig">
            <b>{data.senderName || "Me"}</b>
            <small>signed</small>
          </div>
          <div className="tp-sig">
            {sealed || thumb.progress > 0 ? <Thumbprint p={sealed ? 1 : thumb.progress} color={color} /> : null}
            <button type="button" className={`tp-thumbBtn${sealed ? " is-done" : ""}`} {...thumb.bind} disabled={!allSewn || sealed} aria-label="Press and hold your thumb to seal the vow">
              {sealed ? `${data.recipientName || "You"} ✓` : "Hold your thumb here"}
            </button>
            <small>{data.recipientName || "you"}</small>
          </div>
        </div>
      </article>
      <div className="tp-actions">
        {!allSewn ? (
          <>
            <button type="button" className="tp-btn" onClick={stitch}>
              <span aria-hidden>🪡</span> Stitch in the next part ({sewn}/{paras.length})
            </button>
            <button type="button" className="tp-link" onClick={() => { sfx("tp-stitch", { dur: 1 }); setSewn(paras.length); }}>
              Stitch it all
            </button>
          </>
        ) : sealed ? (
          <button type="button" className="tp-btn" onClick={() => { sfx("page-turn"); next(); }}>
            One more promise, for later →
          </button>
        ) : (
          <button type="button" className="tp-link" onClick={() => { setSealed(true); sfx("tp-ink"); }}>
            Seal it for me
          </button>
        )}
      </div>
    </section>
  );
}
