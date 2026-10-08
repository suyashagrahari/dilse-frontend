"use client";

// Room 7 — Hug back. "Your turn." The same glowing handprints, a five-second
// hold (or the hold button), the heat rising from their side this time. Done:
// react("answered"), "Hug sent back to {sender} 🤍". Then the hug passes: tear
// one off and it opens WhatsApp with the redemption, ready to send.

import { useEffect, useRef, useState, type ReactNode } from "react";
import { sfx } from "../../../_valentine/kit/premium";
import { haptic, useHoldProgress } from "../../../_valentine/kit";
import { HAND, SOFT } from "./fonts";
import type { Hug } from "./model";
import { Kicker, Room, Satin, Title } from "./ui";

export default function HugBack({ h, sticker, onSent, onNext }: { h: Hug; sticker: ReactNode; onSent: () => void; onNext: () => void }) {
  const [sent, setSent] = useState(false);
  const [torn, setTorn] = useState<number[]>([]);
  const beats = useRef(0);
  const hold = useHoldProgress({
    duration: 5000,
    taps: 8,
    springBack: 0.1,
    onComplete: () => {
      setSent(true);
      onSent();
      sfx("hg-sent", { gain: 0.9 });
      haptic([30, 60, 30]);
    },
  });
  useEffect(() => {
    const b = Math.floor(hold.progress * 6);
    if (hold.holding && b > beats.current) {
      beats.current = b;
      sfx("hg-lubdub", { gain: 0.7 });
    }
  }, [hold.progress, hold.holding]);

  const tear = (i: number) => {
    if (torn.includes(i)) return;
    setTorn((t) => [...t, i]);
    sfx("hg-tear", { gain: 0.8 });
    haptic(12);
  };

  return (
    <Room label="Hug them back" className="hg-back">
      <Kicker>Your turn</Kicker>
      <Title>{sent ? `Hug sent back to ${h.sender} 🤍` : "Hug me back"}</Title>
      {!sent ? (
        <>
          <button type="button" className={`hg-backPad${hold.holding ? " is-held" : ""}`} {...hold.bind} aria-label="Press and hold for five seconds to hug back" style={{ ...hold.bind.style, ["--p" as string]: String(hold.progress) }}>
            <span className="hg-backGlow" aria-hidden />
            <span className="hg-backTx" style={{ fontFamily: SOFT }}>{hold.holding ? "Holding on…" : "Press and hold"}</span>
            <span className="hg-backBar" aria-hidden><i style={{ width: `${hold.progress * 100}%` }} /></span>
          </button>
          <p className="hg-backHint" style={{ fontFamily: SOFT }}>Five seconds. {h.sender} will feel it.</p>
        </>
      ) : (
        <>
          <span className="hg-backSticker">{sticker}</span>
          {h.passes.length > 0 && (
            <div className="hg-passes">
              <p className="hg-passH" style={{ fontFamily: HAND }}>Hug passes — tear one off to redeem</p>
              {h.passes.map((c, i) => {
                const wa = `https://api.whatsapp.com/send?text=${encodeURIComponent(`Redeeming my hug pass 🤍 “${c.title}”${c.detail ? ` — ${c.detail}` : ""}\n— to ${h.sender}`)}`;
                return (
                  <div key={i} className={`hg-pass${torn.includes(i) ? " is-torn" : ""}`}>
                    <div className="hg-passBody">
                      <b style={{ fontFamily: SOFT }}>{c.title}</b>
                      {c.detail && <small>{c.detail}</small>}
                    </div>
                    <a className="hg-passStub" href={wa} target="_blank" rel="noopener noreferrer" onClick={() => tear(i)}>
                      {torn.includes(i) ? "Sent ✓" : "Tear ✂"}
                    </a>
                  </div>
                );
              })}
            </div>
          )}
          <Satin big onClick={() => { sfx("chime", { gain: 0.5 }); onNext(); }}>Your hug certificate →</Satin>
        </>
      )}
      <style>{CSS}</style>
    </Room>
  );
}

const CSS = `
.hg-back { gap: 12px; }
.hg-backPad { all: unset; position: relative; width: 100%; max-width: 380px; aspect-ratio: 1; border-radius: 50%; display: grid; place-items: center; cursor: pointer; overflow: hidden;
  background: radial-gradient(circle, #46207A, #121634 70%); box-shadow: 0 0 0 3px rgba(255,224,138,.35), 0 30px 60px -30px rgba(217,54,122,.6); -webkit-tap-highlight-color: transparent; }
.hg-backPad:focus-visible { outline: 3px solid #FFE08A; outline-offset: 4px; }
.hg-backGlow { position: absolute; inset: 0; background: radial-gradient(circle at 50% 60%, #FFE08A calc(var(--p) * 25%), #FF8A3D calc(var(--p) * 50%), #D9367A calc(var(--p) * 75%), transparent calc(20% + var(--p) * 80%));
  opacity: calc(.2 + var(--p) * .8); }
.hg-backPad.is-held .hg-backGlow { animation: hg-backPulse .9s ease-in-out infinite; }
@keyframes hg-backPulse { 0%, 100% { transform: scale(1); } 30% { transform: scale(1.04); } }
.hg-backTx { position: relative; font-size: 24px; font-style: italic; color: #FFF6EA; text-shadow: 0 2px 12px rgba(0,0,0,.5); }
.hg-backBar { position: absolute; left: 22%; right: 22%; bottom: 18%; height: 6px; border-radius: 3px; background: rgba(255,255,255,.18); overflow: hidden; }
.hg-backBar i { display: block; height: 100%; background: #FFE08A; }
.hg-backHint { margin: 0; font-size: 17px; font-style: italic; color: var(--vw-ink-soft); }
.hg-backSticker { display: block; }
.hg-passes { display: grid; gap: 10px; width: 100%; max-width: 420px; }
.hg-passH { margin: 0; font-size: 22px; color: #FFE3CC; }
.hg-pass { display: flex; align-items: stretch; border-radius: 12px; overflow: hidden; background: #F4EBDD; color: #4A2C2A; box-shadow: 0 14px 30px -18px rgba(0,0,0,.8); transition: transform .4s, opacity .4s; }
.hg-pass.is-torn { opacity: .75; }
.hg-pass.is-torn .hg-passStub { transform: translateX(10px) rotate(6deg); }
.hg-passBody { flex: 1; display: grid; gap: 2px; padding: 12px 14px; text-align: left; }
.hg-passBody b { font-size: 17px; }
.hg-passBody small { font-size: 13.5px; opacity: .8; }
.hg-passStub { display: grid; place-items: center; min-width: 76px; padding: 0 10px; border-left: 2px dashed rgba(74,44,42,.35); background: #FFE3CC; color: #C2410C; text-decoration: none;
  font: 700 14px/1 var(--vw-font-ui, system-ui), sans-serif; transition: transform .4s cubic-bezier(.3,1.4,.5,1); }
.hg-passStub:focus-visible { outline: 3px solid #FFE08A; outline-offset: -3px; }
@media (prefers-reduced-motion: reduce) { .hg-backPad.is-held .hg-backGlow { animation: none; } }
`;
