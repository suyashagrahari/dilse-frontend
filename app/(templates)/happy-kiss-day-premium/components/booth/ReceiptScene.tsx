"use client";

// Chapter 4: the letter, on a booth receipt. It prints out of the slot line
// by line (thermal chatter), they read it (it scrolls), and at the bottom
// they drag the scissors along the perforation to tear it off. Tear = keep.
// Keyboard / no-drag fallback: "Tear it off".

import { useEffect, useMemo, useRef, useState } from "react";
import { haptic, useReducedMotion } from "../../../_valentine/kit";
import { sfx, usePremium } from "../../../_valentine/kit/premium";
import { fmt, initialOf, receiptDate, type Booth } from "./model";
import { Scene, Slot } from "./ui";

function now() {
  const d = new Date();
  const mon = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"][d.getMonth()];
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getDate()} ${mon} ${d.getFullYear()} · ${p(d.getHours())}:${p(d.getMinutes())}`;
}

/** Deterministic bar widths from the names, so the barcode is "theirs". */
function bars(seed: string) {
  let h = 2166136261;
  for (const ch of seed) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return Array.from({ length: 44 }, () => {
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return 1 + ((h >>> 0) % 3);
  });
}

export default function ReceiptScene({ b, letter, onNext }: { b: Booth; letter: string; onNext: () => void }) {
  const reduce = useReducedMotion();
  const { premium } = usePremium();
  const [printed, setPrinted] = useState(!!reduce);
  const [cut, setCut] = useState(0);
  const [torn, setTorn] = useState(false);
  const row = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x0: number; w: number } | null>(null);
  const lastTick = useRef(0);
  const paras = useMemo(() => letter.split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean), [letter]);
  const code = useMemo(() => bars(`${b.recipient}|${b.sender}`), [b.recipient, b.sender]);
  const [stamp] = useState(now);
  const ps = premium.psLetter.trim();
  const psLines = ps.split(/\n\s*\n/);

  useEffect(() => {
    if (reduce) return;
    const bed = sfx("kpb-thermal", { gain: 0.5 });
    const t = window.setTimeout(() => {
      bed.stop(220);
      setPrinted(true);
    }, 3000);
    return () => {
      window.clearTimeout(t);
      bed.stop(120);
    };
  }, [reduce]);

  const tear = () => {
    if (torn) return;
    setCut(1);
    setTorn(true);
    sfx("kpb-tear", { gain: 0.9 });
    haptic([12, 30, 12]);
    window.setTimeout(onNext, reduce ? 300 : 1100);
  };
  const down = (e: React.PointerEvent) => {
    const r = row.current?.getBoundingClientRect();
    if (!r || torn) return;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    drag.current = { x0: e.clientX - cut * r.width, w: r.width };
  };
  const move = (e: React.PointerEvent) => {
    if (!drag.current || torn) return;
    const v = Math.max(0, Math.min(1, (e.clientX - drag.current.x0) / drag.current.w));
    setCut(v);
    if (Math.abs(v - lastTick.current) > 0.08) {
      lastTick.current = v;
      sfx("kpb-flip", { gain: 0.25, detune: v * 900 });
    }
    if (v > 0.78) {
      drag.current = null;
      tear();
    }
  };
  const up = () => {
    drag.current = null;
  };

  return (
    <Scene label="The letter, on a booth receipt" className="pb-receipt">
      <Slot />
      <div className={`pb-rcptFeed${torn ? " is-torn" : ""}`}>
        <article className={`pb-rcpt${printed ? " is-printed" : ""}`} aria-label={`A receipt with ${b.sender}'s letter to ${b.recipient}`}>
          <header className="pb-rcHead">
            <p className="pb-rcBrand">✦ PHOTO BOOTH ✦</p>
            <p>KISS DAY · {stamp}</p>
          </header>
          <hr />
          <dl className="pb-rcKv">
            <div><dt>FOR</dt><dd>{b.recipient.toUpperCase()}</dd></div>
            <div><dt>FROM</dt><dd>{b.sender.toUpperCase()}</dd></div>
            <div><dt>FRAMES</dt><dd>4</dd></div>
          </dl>
          <hr />
          <div className="pb-rcLetter">
            <p>Dear {b.recipient},</p>
            {paras.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
            <p className="pb-rcSign">— {b.sender} x</p>
          </div>
          <hr />
          <p className="pb-rcLabel">
            <span>KISSES OWED</span>
            <span>QTY</span>
          </p>
          <ul className="pb-rcItems">
            {b.notes.map((n, i) => (
              <li key={i}>
                <span>{n}</span>
                <span>1</span>
              </li>
            ))}
          </ul>
          <hr />
          <dl className="pb-rcKv">
            {b.sinceDays && (
              <>
                <div><dt>TOGETHER SINCE</dt><dd>{receiptDate(b.since)}</dd></div>
                <div><dt>DAYS</dt><dd>{fmt(b.sinceDays)}</dd></div>
              </>
            )}
            <div className="pb-rcTotal"><dt>TOTAL</dt><dd>∞</dd></div>
          </dl>
          {ps && (
            <>
              <hr />
              <div className="pb-rcPs">
                <p className="pb-rcLabel"><span>P.S.</span></p>
                {psLines.map((l, i) => (
                  <p key={i} className={i === 0 ? "pb-rcPsHead" : undefined}>{l.trim()}</p>
                ))}
              </div>
            </>
          )}
          <div className="pb-rcBars" aria-hidden>
            {code.map((w, i) => (
              <i key={i} style={{ width: w * 2, marginRight: ((i * 7) % 3) + 1 }} />
            ))}
          </div>
          <p className="pb-rcBye">
            {initialOf(b.recipient)}+{initialOf(b.sender)} · THANK YOU · KISS AGAIN
          </p>
          <div className="pb-rcTear" ref={row}>
            <span className="pb-rcPerf" style={{ ["--cut" as string]: cut }} aria-hidden />
            <button
              type="button"
              className="pb-rcScissors"
              style={{ left: `calc(${cut * 100}% - ${cut * 44}px)` }}
              onPointerDown={down}
              onPointerMove={move}
              onPointerUp={up}
              onPointerCancel={up}
              onClick={(e) => {
                if (e.detail === 0) tear();
              }}
              aria-label="Tear the receipt off"
            >
              ✂
            </button>
          </div>
        </article>
      </div>
      <div className="pb-foot pb-rcFoot">
        <p className="pb-eyebrow" aria-hidden>Drag the scissors to tear it off</p>
        <button type="button" className="pb-quiet" onClick={tear}>
          Tear it off ›
        </button>
      </div>
      <style>{CSS}</style>
    </Scene>
  );
}

const CSS = `
.pb-receipt .pb-in { padding-top: calc(max(var(--vw-top-space, 0px), 12px) + 78px); }
.pb-rcptFeed { width: min(86vw, 400px); margin-top: -7px; transition: transform 1s cubic-bezier(.6,0,.3,1), opacity .9s ease .2s; }
.pb-rcptFeed.is-torn { transform: translateY(-46px) rotate(-3deg); opacity: 0; }
.pb-rcpt { position: relative; box-sizing: border-box; padding: 30px 20px 0; text-align: left; color: #2b2324;
  font: 400 13.5px/1.7 var(--pb-mono); letter-spacing: .01em;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 .3 0 0 0 0 .28 0 0 0 0 .25 0 0 0 .07 0'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)'/%3E%3C/svg%3E"),
    linear-gradient(90deg, rgba(0,0,0,.05), rgba(0,0,0,0) 6%, rgba(0,0,0,0) 94%, rgba(0,0,0,.05)), linear-gradient(180deg, #F2EEE6, #FBF9F4 60px);
  background-color: #FBF9F4;
  box-shadow: 0 50px 80px -40px rgba(0,0,0,.9), 0 14px 30px -18px rgba(0,0,0,.7);
  clip-path: inset(0 0 100% 0); animation: pb-print 3s steps(36, end) forwards; }
.pb-rcpt.is-printed { clip-path: none; animation: none; }
@keyframes pb-print { to { clip-path: inset(0 0 0 0); } }
.pb-rcpt p { margin: 0; }
.pb-rcpt hr { border: 0; border-top: 1.5px dashed rgba(43,35,36,.45); margin: 16px 0; }
.pb-rcHead { text-align: center; display: grid; gap: 4px; font-size: 11.5px; letter-spacing: .14em; }
.pb-rcBrand { font: 700 15px/1.2 var(--pb-mono); letter-spacing: .3em; }
.pb-rcKv { margin: 0; display: grid; gap: 2px; font-size: 12.5px; letter-spacing: .08em; }
.pb-rcKv div { display: flex; gap: 8px; align-items: baseline; }
.pb-rcKv dt { flex: none; }
.pb-rcKv dd { margin: 0 0 0 auto; text-align: right; }
.pb-rcKv div::after { content: none; }
.pb-rcKv dt::after { content: ""; }
.pb-rcTotal { font-weight: 700; font-size: 15px; margin-top: 4px; }
.pb-rcLetter { display: grid; gap: 14px; user-select: text; -webkit-user-select: text; }
.pb-rcSign { text-align: right; }
.pb-rcLabel { display: flex; justify-content: space-between; font-weight: 700; font-size: 12px; letter-spacing: .2em; margin-bottom: 6px !important; }
.pb-rcItems { list-style: none; margin: 0; padding: 0; display: grid; gap: 6px; font-size: 12.5px; line-height: 1.5; }
.pb-rcItems li { display: flex; gap: 14px; justify-content: space-between; }
.pb-rcItems li span:last-child { flex: none; }
.pb-rcPs { display: grid; gap: 10px; }
.pb-rcPsHead { font-weight: 700; }
.pb-rcBars { display: flex; justify-content: center; align-items: stretch; height: 54px; margin: 24px 0 8px; }
.pb-rcBars i { display: block; background: #2b2324; }
.pb-rcBye { text-align: center; font-size: 11px; letter-spacing: .2em; padding-bottom: 18px; }
.pb-rcTear { position: relative; height: 44px; margin: 0 -20px; background: linear-gradient(180deg, transparent 50%, rgba(0,0,0,.03) 50%); }
.pb-rcPerf { position: absolute; left: 0; right: 0; top: 50%; height: 0; border-top: 2px dashed rgba(43,35,36,.5);
  -webkit-mask: linear-gradient(90deg, transparent calc(var(--cut) * 100%), #000 calc(var(--cut) * 100%)); mask: linear-gradient(90deg, transparent calc(var(--cut) * 100%), #000 calc(var(--cut) * 100%)); }
.pb-rcScissors { position: absolute; top: 50%; width: 44px; height: 44px; margin-top: -22px; border-radius: 50%; border: 0; cursor: grab; touch-action: none;
  display: grid; place-items: center; font: 400 20px/1 system-ui, sans-serif; color: #FBF9F4; background: var(--pb-shade); box-shadow: 0 8px 18px -6px rgba(0,0,0,.6);
  transition: left .05s linear; animation: pb-nudge 2.2s var(--pb-ease) 3.2s infinite; }
.pb-rcScissors:active { cursor: grabbing; }
.pb-rcScissors:focus-visible { outline: 3px solid var(--pb-shade-hi); outline-offset: 3px; }
@keyframes pb-nudge { 0%, 70%, 100% { transform: none; } 80% { transform: translateX(14px); } 90% { transform: translateX(4px); } }
.pb-rcFoot { padding-top: 18px; }
@media (prefers-reduced-motion: reduce) { .pb-rcpt { animation: none; clip-path: none; } .pb-rcScissors { animation: none; } .pb-rcptFeed { transition: opacity .3s; } .pb-rcptFeed.is-torn { transform: none; } }
`;
