"use client";

// Room 4 — Lipstick on the mirror. A gilded vanity mirror, fogged with steam.
// The letter writes itself across the glass in lipstick (in "cute" mode a
// pink chalk-marker), paragraph by paragraph, each ending in a tiny kiss that
// pops. A light glint drifts over the glass and follows the finger. Tap to
// show it all. Then the voice note left on the vanity (or its typed line) and
// a P.S. tucked into the frame.

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { sfx, usePremium, VoiceNotePlayer } from "../../../_valentine/kit/premium";
import { useReducedMotion } from "../../../_valentine/kit";
import { Lips } from "./art";
import { HAND, SERIF } from "./fonts";
import type { Kisses } from "./model";
import { Kicker, Quiet, Room, Satin, Title } from "./ui";

export default function Mirror({ k, letter, sticker, onNext }: { k: Kisses; letter: string; sticker: ReactNode; onNext: () => void }) {
  const p = usePremium();
  const reduce = useReducedMotion();
  const paras = useMemo(() => letter.split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean), [letter]);
  const [n, setN] = useState(reduce ? paras.length : 0);
  const [psOpen, setPsOpen] = useState(false);
  const [gx, setGx] = useState(30);
  const all = n >= paras.length;
  const ink = k.lipstick ? k.S.c : "#E2557D";

  useEffect(() => {
    if (all) return;
    const len = paras[n]?.length ?? 0;
    sfx("kd-lipstick", { dur: Math.min(1.4, 0.3 + len / 300), gain: 0.55 });
    const t = window.setTimeout(() => {
      setN((v) => v + 1);
      sfx("pop", { gain: 0.5 });
    }, Math.min(4200, 900 + len * 22));
    return () => window.clearTimeout(t);
  }, [n, all, paras]);

  return (
    <Room label="The letter on the mirror" className="kd-mirrorRoom">
      <Kicker>The vanity</Kicker>
      <Title>Written in lipstick</Title>
      <div
        className="kd-mirror"
        onPointerMove={(e) => {
          const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
          setGx(((e.clientX - r.left) / r.width) * 100);
        }}
        onClick={() => !all && setN(paras.length)}
        style={{ ["--gx" as string]: `${gx}%`, ["--ink" as string]: ink }}
      >
        <div className="kd-glass">
          <span className="kd-glint" aria-hidden />
          <span className="kd-steam" aria-hidden />
          <div className="kd-writing" style={{ fontFamily: HAND }}>
            <p className="kd-dear">Dear {k.recipient},</p>
            {paras.map((t, i) => (
              <p key={i} className={`kd-para${i < n ? " is-on" : i === n ? " is-writing" : ""}`} style={{ animationDuration: `${Math.min(4200, 900 + t.length * 22)}ms` }}>
                {t}
                {i < n && (
                  <span className="kd-dot" aria-hidden>
                    <Lips color={ink} size={22} cute={!k.lipstick} />
                  </span>
                )}
              </p>
            ))}
            <p className={`kd-sign${all ? " is-on" : ""}`}>— {k.sender} x</p>
          </div>
        </div>
        <span className="kd-mirrorSticker">{sticker}</span>
      </div>

      {!all ? (
        <Quiet onClick={() => setN(paras.length)}>Show it all</Quiet>
      ) : (
        <>
          <VoiceNotePlayer label={`A voice note on the vanity · ${k.sender}`} accent={k.S.c} className="kd-voice" />
          {p.premium.psLetter && (
            <button type="button" className={`kd-ps${psOpen ? " is-open" : ""}`} onClick={() => { if (!psOpen) { sfx("kd-stamp", { gain: 0.6 }); setPsOpen(true); } }} aria-expanded={psOpen}>
              {psOpen ? (
                <span style={{ fontFamily: HAND }}>{p.premium.psLetter}</span>
              ) : (
                <span className="kd-psShut">
                  <Lips color={k.S.c} size={34} cute={!k.lipstick} />
                  <b style={{ fontFamily: SERIF }}>P.S. — tucked in the frame</b>
                </span>
              )}
            </button>
          )}
          <Satin big onClick={() => { sfx("kd-curtain", { gain: 0.7 }); onNext(); }}>To the kiss booth →</Satin>
        </>
      )}
      <style>{CSS}</style>
    </Room>
  );
}

const CSS = `
.kd-mirrorRoom { gap: 12px; }
.kd-mirror { position: relative; width: 100%; max-width: 440px; padding: 14px; box-sizing: border-box; border-radius: 220px 220px 22px 22px; cursor: text;
  background: linear-gradient(135deg, #F3DC8A, #B88A1E 30%, #F7E7AE 50%, #9C7216 75%, #E9CB6A);
  box-shadow: 0 34px 70px -30px rgba(90,15,36,.6), inset 0 0 0 2px rgba(255,255,255,.4); }
.kd-glass { position: relative; overflow: hidden; border-radius: 208px 208px 12px 12px; padding: 64px 24px 30px; text-align: left; min-height: 340px;
  background: linear-gradient(160deg, #E9EEF2 0%, #CDD6DE 45%, #E6ECF0 100%); box-shadow: inset 0 0 40px rgba(40,50,70,.25); }
.kd-glint { position: absolute; top: -20%; bottom: -20%; left: var(--gx); width: 70px; transform: translateX(-50%) skewX(-14deg); pointer-events: none;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,.75), transparent); transition: left .35s ease; animation: kd-glint 7s ease-in-out infinite alternate; }
@keyframes kd-glint { from { margin-left: -30px; } to { margin-left: 30px; } }
.kd-steam { position: absolute; inset: 0; pointer-events: none; background: radial-gradient(70% 50% at 50% 100%, rgba(255,255,255,.55), transparent 70%),
  radial-gradient(40% 30% at 15% 10%, rgba(255,255,255,.5), transparent 70%), radial-gradient(40% 30% at 85% 15%, rgba(255,255,255,.45), transparent 70%);
  animation: kd-steam 9s ease-in-out infinite alternate; }
@keyframes kd-steam { from { opacity: .7; } to { opacity: 1; } }
.kd-writing { position: relative; color: var(--ink); text-shadow: 0 1px 0 rgba(255,255,255,.45), 0 0 1px var(--ink); }
.kd-dear { margin: 0 0 10px; font-size: 30px; font-weight: 700; text-align: center; }
.kd-para { margin: 0 0 14px; font-size: 23px; line-height: 1.22; font-weight: 500; white-space: pre-wrap; overflow-wrap: anywhere; opacity: .07; }
.kd-para.is-on { opacity: 1; }
.kd-para.is-writing { opacity: 1; -webkit-mask-image: linear-gradient(170deg, #000 45%, transparent 55%); mask-image: linear-gradient(170deg, #000 45%, transparent 55%);
  -webkit-mask-size: 100% 300%; mask-size: 100% 300%; animation-name: kd-write; animation-timing-function: linear; animation-fill-mode: both; }
@keyframes kd-write { from { -webkit-mask-position: 0 100%; mask-position: 0 100%; } to { -webkit-mask-position: 0 0; mask-position: 0 0; } }
.kd-dot { display: inline-block; vertical-align: middle; margin-left: 6px; animation: kd-dotPop .5s cubic-bezier(.3,1.6,.5,1) both; }
@keyframes kd-dotPop { from { transform: scale(0) rotate(-20deg); } to { transform: scale(1) rotate(-8deg); } }
.kd-sign { margin: 6px 0 0; text-align: right; font-size: 30px; font-weight: 700; opacity: 0; transition: opacity .8s; }
.kd-sign.is-on { opacity: 1; }
.kd-mirrorSticker { position: absolute; right: -6px; top: 34%; pointer-events: none; }
.kd-voice { margin-top: 6px; }
.kd-ps { all: unset; cursor: pointer; width: min(100%, 440px); box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
.kd-ps:focus-visible { outline: 3px solid var(--vw-accent); outline-offset: 3px; border-radius: 14px; }
.kd-ps > span { display: block; padding: 16px 18px; border-radius: 14px; background: #FFFDF8; color: var(--vw-ink); text-align: left; font-size: 22px; line-height: 1.3; white-space: pre-wrap;
  box-shadow: 0 16px 30px -18px rgba(90,15,36,.6); transform: rotate(-1.2deg); }
.kd-psShut { display: flex !important; align-items: center; gap: 12px; }
.kd-psShut b { font-size: 16px; font-style: italic; font-weight: 600; }
@media (prefers-reduced-motion: reduce) { .kd-glint, .kd-steam, .kd-dot { animation: none; } .kd-para.is-writing { animation: none; -webkit-mask-image: none; mask-image: none; } }
`;
