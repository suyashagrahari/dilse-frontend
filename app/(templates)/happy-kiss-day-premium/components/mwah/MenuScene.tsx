"use client";

// Scene 2 · Pick a kiss. A little menu of four kiss cards: forehead, cheek,
// nose, hand. Each flips over (3D) to a couple sticker doing exactly that
// kiss and the sender's reason for it. Flip all four and the menu stamps
// itself "all yours".

import { motion } from "framer-motion";
import { useState } from "react";
import { burst, haptic } from "../../../_valentine/kit";
import { sfx } from "../../../_valentine/kit/premium";
import { LipPrint } from "./LipPrint";
import { GIF, type MenuKey, type Mwah } from "./model";
import { Gif, Kicker, Puffy, Scene, Sub, Title, popIn, rise } from "./ui";

const TILT: Record<MenuKey, number> = { forehead: -2, cheek: 2, nose: 1.5, hand: -1.5 };
const TONE: Record<MenuKey, string> = { forehead: "#FFE3EC", cheek: "#FFF1C9", nose: "#DDF6EA", hand: "#EDE3FF" };

export default function MenuScene({ m, onNext }: { m: Mwah; onNext: () => void }) {
  const [open, setOpen] = useState<Set<MenuKey>>(new Set());
  const all = open.size === m.menu.length;

  const flip = (k: MenuKey, el: HTMLElement) => {
    const was = open.has(k);
    const next = new Set(open);
    if (was) next.delete(k);
    else next.add(k);
    setOpen(next);
    sfx(k === "nose" && !was ? "kmw-boop" : "kmw-flip", { gain: 0.8 });
    haptic(10);
    if (!was) {
      const r = el.getBoundingClientRect();
      burst({ kind: "hearts", origin: { x: (r.left + r.width / 2) / window.innerWidth, y: (r.top + r.height / 2) / window.innerHeight }, count: 10, spread: 0.16 });
      if (next.size === m.menu.length) {
        window.setTimeout(() => {
          sfx("kmw-ding", { gain: 0.7 });
          haptic([15, 40, 25]);
          burst({ kind: "confetti", count: 60 });
        }, 450);
      }
    }
  };

  return (
    <Scene label="Pick a kiss" className="km-menu">
      <motion.div {...rise(0)}>
        <Kicker>Today&rsquo;s kiss menu</Kicker>
      </motion.div>
      <motion.div {...rise(1)}>
        <Title>
          Pick a <em>kiss</em>
        </Title>
      </motion.div>
      <motion.div {...rise(2)}>
        <Sub>Flip a card to see why {m.sender} saves that one for you.</Sub>
      </motion.div>

      <div className="km-menuGrid">
        <span className="km-menuGif">
          <Gif src={all ? GIF.heartEyes : GIF.bearsCheek} size={78} tilt={9} eager />
        </span>
        {m.menu.map((c, i) => {
          const isOpen = open.has(c.key);
          return (
            <motion.button
              key={c.key}
              type="button"
              className={`km-card${isOpen ? " is-open" : ""}`}
              style={{ ["--t" as string]: `${TILT[c.key]}deg`, ["--tone" as string]: TONE[c.key] }}
              onClick={(e) => flip(c.key, e.currentTarget)}
              aria-pressed={isOpen}
              aria-label={isOpen ? `${c.label} kiss: ${c.line}` : `${c.label} kiss, ${c.sub}. Tap to flip.`}
              {...popIn(3 + i)}
            >
              <span className="km-cardTilt">
              <span className="km-cardIn">
                <span className="km-cardFace is-front" aria-hidden>
                  <span className="km-cardNo">No. {i + 1}</span>
                  <LipPrint color={m.S.c} lipstick={m.lipstick} size={52} seed={i + 2} style={{ transform: `rotate(${TILT[c.key] * 4}deg)` }} />
                  <span className="km-cardName">{c.label}</span>
                  <span className="km-cardSub">{c.sub}</span>
                  <span className="km-cardTap">tap to flip ↻</span>
                </span>
                <span className="km-cardFace is-back" aria-hidden>
                  {isOpen && <Gif src={c.gif} size={92} float={false} eager className="km-cardGif" />}
                  <span className="km-cardLine">{c.line}</span>
                </span>
              </span>
              </span>
            </motion.button>
          );
        })}
      </div>

      {all && (
        <motion.p className="km-menuDone km-hand" {...popIn(0)}>
          All four are yours. Forever. No expiry date. 💋
        </motion.p>
      )}

      <div className="km-foot">
        {open.size > 0 && (
          <motion.div {...popIn(0)}>
            <Puffy onClick={onNext}>Next: the kiss-cam 📸</Puffy>
          </motion.div>
        )}
      </div>
      <style>{CSS}</style>
    </Scene>
  );
}

const CSS = `
.km-menuGif { position: absolute; right: -14px; top: -52px; z-index: 3; pointer-events: none; }
.km-menuGrid { position: relative; display: grid; grid-template-columns: 1fr 1fr; gap: 14px; width: min(400px, 100%); margin-top: 8px; perspective: 900px; }
.km-card { all: unset; cursor: pointer; position: relative; aspect-ratio: 5 / 5.7; -webkit-tap-highlight-color: transparent; }
.km-cardTilt { position: absolute; inset: 0; transform: rotate(var(--t)); perspective: 900px; }
.km-card:focus-visible { outline: 3px solid var(--km-primary); outline-offset: 4px; border-radius: 22px; }
.km-cardIn { position: absolute; inset: 0; transform-style: preserve-3d; transition: transform .6s var(--km-spring); }
.km-card.is-open .km-cardIn { transform: rotateY(180deg); }
.km-cardFace { position: absolute; inset: 0; border-radius: 22px; backface-visibility: hidden; -webkit-backface-visibility: hidden; display: grid; justify-items: center; align-content: center; gap: 6px;
  padding: 12px; box-sizing: border-box; box-shadow: 0 0 0 4px #fff, 0 14px 26px -14px rgba(214,63,114,.55); }
.km-cardFace.is-front { background: radial-gradient(circle at 50% 38%, #fff 0 34%, transparent 35%), var(--tone);
  background-image: radial-gradient(circle at 50% 38%, #fff 0 34%, transparent 35%), radial-gradient(rgba(214,63,114,.12) 1.2px, transparent 1.6px); background-size: auto, 12px 12px; background-color: var(--tone); }
.km-cardFace.is-back { transform: rotateY(180deg); background: #fff; align-content: start; padding-top: 8px; gap: 2px; }
.km-cardGif.km-gif { box-shadow: none; background: var(--tone); }
.km-cardNo { position: absolute; left: 12px; top: 10px; font: 600 11px/1 var(--km-ui); letter-spacing: .14em; text-transform: uppercase; color: var(--km-deep); opacity: .7; }
.km-cardName { font: 400 25px/1 var(--km-display); color: var(--km-deep); margin-top: 6px; }
.km-cardSub { font: 600 14px/1.1 var(--km-hand); color: var(--km-ink2); }
.km-cardTap { position: absolute; bottom: 10px; left: 0; right: 0; font: 600 11px/1 var(--km-ui); letter-spacing: .08em; color: var(--km-deep); opacity: .65; }
.km-cardLine { font: 600 14.5px/1.3 var(--km-hand); color: var(--km-ink); text-wrap: balance; }
.km-menuDone { margin: 4px 0 0; font-size: 18px; color: var(--km-deep); max-width: 28ch; }
@media (min-width: 420px) { .km-cardName { font-size: 28px; } .km-cardLine { font-size: 15.5px; } }
@media (prefers-reduced-motion: reduce) { .km-cardIn { transition: none; } .km-card.is-open .km-cardFace.is-front { visibility: hidden; } }
`;
