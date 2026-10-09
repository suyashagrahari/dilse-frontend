"use client";

// Chapter III · The Cards. Three tarot cards face down: Past, Present, Future.
// Tap one: it rises to the centre, turns over (nm-flip) and the gold foil
// catches the light (sparkle) — the arcana, a 3D object for it, and the
// sender's fortune. Close it and it lies face up in the spread.

import { useState } from "react";
import { Fluent3D, PremiumCTA, TiltCard, sfx, type FluentKey } from "../../../_valentine/kit/premium";
import { haptic, useReducedMotion } from "../../../_valentine/kit";
import { arcanaNumeral, GILT, type Night } from "./model";
import { Eyebrow, Quiet } from "./ui";
import { BODY, DISPLAY } from "./fonts";

function iconFor(card: string, position: string): FluentKey {
  const k = card.toLowerCase();
  const table: [RegExp, FluentKey][] = [
    [/lovers?/, "two-hearts"], [/moon/, "crescent-moon"], [/sun/, "glowing-star"], [/star/, "star"], [/magician|magic/, "magic-wand"],
    [/wheel|fortune|priestess|seer/, "crystal-ball"], [/hermit|candle/, "candle"], [/fool|death|ghost/, "ghost"], [/devil|cat/, "black-cat"],
    [/world|universe/, "milky-way"], [/empress|rose/, "rose"], [/emperor|key/, "key"], [/chariot|broom|witch/, "broom"],
    [/strength|heart/, "heart-fire"], [/temperance|time|hourglass/, "hourglass"], [/tower|pumpkin/, "jack-o-lantern"], [/hanged|bat/, "bat"],
  ];
  for (const [re, key] of table) if (re.test(k)) return key;
  return position === "Past" ? "hourglass" : position === "Present" ? "crystal-ball" : "glowing-star";
}

export default function Tarot({ n, onNext }: { n: Night; onNext: () => void }) {
  const reduce = useReducedMotion();
  const [read, setRead] = useState<boolean[]>([false, false, false]);
  const [open, setOpen] = useState<number | null>(null);
  const all = read.every(Boolean);

  const turn = (i: number) => {
    setOpen(i);
    haptic(10);
    sfx("nm-flip", { gain: 0.8 });
    sfx("sparkle", { gain: 0.45, at: reduce ? 0.1 : 0.55 });
    setRead((r) => r.map((v, k) => (k === i ? true : v)));
  };
  const close = () => {
    setOpen(null);
    sfx("swoosh-soft", { gain: 0.35 });
  };
  const nextUnread = read.findIndex((v) => !v);

  return (
    <div className="nm-scene nm-tarot">
      <header style={{ display: "grid", justifyItems: "center", gap: 10 }}>
        <Eyebrow n="III">The Cards</Eyebrow>
        <p className="nm-sub" style={{ fontSize: 17 }}>{all ? "The cards have spoken." : "Past, present, future. Turn them over."}</p>
      </header>

      <div className={`nm-spread${open != null ? " is-dim" : ""}`}>
        {n.tarot.map((t, i) => (
          <button key={i} type="button" className={`nm-card${read[i] ? " is-up" : ""}`} onClick={() => (read[i] ? setOpen(i) : turn(i))} aria-label={read[i] ? `${t.card}, your ${t.position.toLowerCase()}` : `Turn over the ${t.position.toLowerCase()} card`} style={{ animationDelay: `${0.15 + i * 0.12}s` }}>
            {read[i] ? (
              <span className="nm-cardSmall">
                <span className="nm-cardNum">{arcanaNumeral(t.card)}</span>
                <Fluent3D name={iconFor(t.card, t.position)} size={56} float={false} shadow={false} />
                <span className="nm-cardName">{t.card}</span>
              </span>
            ) : (
              <CardBack />
            )}
            <span className="nm-cardPos">{t.position}</span>
          </button>
        ))}
      </div>

      {open != null && (
        <div className="nm-reading" onClick={close} role="dialog" aria-label={`${n.tarot[open].card}: ${n.tarot[open].line}`}>
          <div key={open} className="nm-readCard" onClick={(e) => e.stopPropagation()}>
            <TiltCard radius={18} foil max={10} glare={0.4} style={{ width: "100%", height: "100%" }}>
              <div className="nm-face">
                <span className="nm-faceNum">{arcanaNumeral(n.tarot[open].card)}</span>
                <span className="nm-faceArt">
                  <Fluent3D name={iconFor(n.tarot[open].card, n.tarot[open].position)} size={148} glow="#F2B35B" eager />
                </span>
                <span className="nm-faceName">{n.tarot[open].card}</span>
                <span className="nm-facePos">Your {n.tarot[open].position.toLowerCase()}</span>
                <span className="nm-faceLine">{n.tarot[open].line}</span>
              </div>
            </TiltCard>
          </div>
          <div className="nm-readFoot" onClick={(e) => e.stopPropagation()}>
            {nextUnread >= 0 ? (
              <PremiumCTA tone="gold" cue={null} onClick={() => turn(nextUnread)}>
                Turn the {n.tarot[nextUnread].position.toLowerCase()}
              </PremiumCTA>
            ) : (
              <PremiumCTA tone="ember" cue="whoosh" onClick={onNext}>
                Someone&rsquo;s calling
              </PremiumCTA>
            )}
            <Quiet onClick={close}>Back to the spread</Quiet>
          </div>
        </div>
      )}

      <div className="nm-foot">
        {all && open == null && (
          <PremiumCTA tone="ember" cue="whoosh" onClick={onNext}>
            Someone&rsquo;s calling
          </PremiumCTA>
        )}
      </div>
      <style>{TAROT_CSS}</style>
    </div>
  );
}

function CardBack() {
  return (
    <span className="nm-back" aria-hidden>
      <span className="nm-backSigil">☾</span>
    </span>
  );
}

const TAROT_CSS = `
.nm-spread { display: flex; justify-content: center; align-items: center; gap: clamp(10px, 3vw, 28px); margin: auto 0; width: 100%;
  transition: opacity .5s ease, filter .5s ease; perspective: 1200px; }
.nm-spread.is-dim { opacity: .25; filter: blur(2px); }
.nm-card { all: unset; position: relative; cursor: pointer; width: clamp(96px, 28vw, 200px); aspect-ratio: .6; border-radius: 12px;
  -webkit-tap-highlight-color: transparent; animation: nm-deal .9s cubic-bezier(.22,1,.36,1) backwards; transition: transform .4s cubic-bezier(.22,1,.36,1); }
.nm-card:nth-child(1) { transform: rotate(-5deg) translateY(10px); }
.nm-card:nth-child(3) { transform: rotate(5deg) translateY(10px); }
.nm-card:hover, .nm-card:focus-visible { transform: translateY(-8px); }
.nm-card:focus-visible { outline: 2px solid #F2B35B; outline-offset: 4px; }
@keyframes nm-deal { from { opacity: 0; transform: translateY(40px) rotate(0); } }
.nm-back { position: absolute; inset: 0; border-radius: 12px; display: grid; place-items: center; overflow: hidden;
  background:
    radial-gradient(circle at 50% 50%, rgba(242,179,91,.16), transparent 55%),
    radial-gradient(1.2px 1.2px at 20% 30%, rgba(232,207,138,.8), transparent),
    radial-gradient(1px 1px at 75% 22%, rgba(232,207,138,.7), transparent),
    radial-gradient(1.4px 1.4px at 68% 78%, rgba(232,207,138,.8), transparent),
    radial-gradient(1px 1px at 30% 82%, rgba(232,207,138,.6), transparent),
    linear-gradient(160deg, #3a2240, #22122a 60%, #170b1b);
  box-shadow: inset 0 0 0 1px rgba(232,207,138,.75), inset 0 0 0 6px #22122a, inset 0 0 0 7px rgba(232,207,138,.5), 0 22px 34px -14px rgba(0,0,0,.9); }
.nm-backSigil { font: 400 clamp(40px, 11vw, 76px)/1 ${DISPLAY}; background: ${GILT}; -webkit-background-clip: text; background-clip: text; color: transparent;
  filter: drop-shadow(0 0 12px rgba(242,179,91,.4)); }
.nm-cardSmall { position: absolute; inset: 0; border-radius: 12px; display: grid; justify-items: center; align-content: center; gap: 6px; padding: 8px;
  background: linear-gradient(170deg, #efe7d4, #d9ccb0); box-shadow: inset 0 0 0 1px rgba(138,106,47,.9), inset 0 0 0 5px #efe7d4, inset 0 0 0 6px rgba(138,106,47,.6), 0 22px 34px -14px rgba(0,0,0,.9); }
.nm-cardNum { font: 400 13px/1 ${DISPLAY}; color: #8a6a2f; letter-spacing: .1em; }
.nm-cardName { font: 400 clamp(12px, 3.4vw, 17px)/1.1 ${DISPLAY}; color: #2a1712; text-align: center; }
.nm-cardPos { position: absolute; left: 0; right: 0; top: calc(100% + 12px); text-align: center; font: italic 400 14px/1 ${BODY}; color: rgba(232,223,204,.7); }
.nm-reading { position: absolute; inset: 0; z-index: 10; display: grid; grid-template-rows: 1fr auto; justify-items: center; align-items: center;
  padding: calc(var(--vw-top-space, 0px) + 70px) 22px calc(max(22px, env(safe-area-inset-bottom)) + var(--vw-dock-space, 0px)); box-sizing: border-box;
  background: radial-gradient(60% 50% at 50% 45%, rgba(60,30,20,.55), rgba(8,5,10,.88)); animation: nm-fade .4s ease backwards; }
.nm-readCard { width: min(80vw, 34svh, 330px); perspective: 1400px; animation: nm-turn 1.1s cubic-bezier(.22,1,.36,1) backwards; }
@keyframes nm-turn { 0% { transform: translateY(30px) scale(.6) rotateY(180deg); opacity: 0; } 30% { opacity: 1; } 100% { transform: none; } }
.nm-face { position: relative; width: 100%; aspect-ratio: .6; box-sizing: border-box; display: grid; grid-template-rows: auto 1fr auto auto auto; justify-items: center;
  gap: 6px; padding: 22px 20px 26px; text-align: center; border-radius: 18px;
  background: radial-gradient(90% 60% at 50% 32%, rgba(255,226,168,.55), transparent 70%), linear-gradient(170deg, #f3ecdb, #e3d6ba 60%, #cfbf9c);
  box-shadow: inset 0 0 0 1.5px rgba(138,106,47,.95), inset 0 0 0 8px #efe6d1, inset 0 0 0 9px rgba(138,106,47,.6); color: #2a1712; }
.nm-faceNum { font: 400 22px/1 ${DISPLAY}; letter-spacing: .12em; color: #8a6a2f; }
.nm-faceArt { display: grid; place-items: center; align-self: center; }
.nm-faceName { font: 400 clamp(28px, 8vw, 38px)/1 ${DISPLAY}; color: #2a1712; }
.nm-facePos { font: 400 11px/1 ${DISPLAY}; letter-spacing: .28em; text-transform: uppercase; color: #8a6a2f; }
.nm-faceLine { margin-top: 8px; font: italic 400 clamp(17px, 4.6vw, 21px)/1.35 ${BODY}; color: #3a221a; text-wrap: balance; }
.nm-readFoot { display: grid; justify-items: center; gap: 6px; padding-top: 18px; }
@media (prefers-reduced-motion: reduce) {
  .nm-card, .nm-readCard { animation: nm-fade .3s ease backwards; }
}
`;
