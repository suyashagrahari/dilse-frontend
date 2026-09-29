"use client";

// ─── catch: LEVEL COMPLETE → the letter, stacked like caught pieces ─────────
//
// The Catch template is a cute arcade game, so its main letter arrives like the
// end of a level: a "CONTINUE?" gate (the runaway "no" included), then LEVEL
// COMPLETE with three stars popping in and a NEW HIGH SCORE of ∞, a quick
// "BONUS STAGE" loading bar, and finally the letter — each paragraph a candy-
// coloured block that falls from the top and lands on the stack with a squash,
// the way the pieces landed in the game. The sign-off lands last, then a
// "keep forever" button that fires hearts.

import { useMemo, useState, type CSSProperties } from "react";
import { Confetti, Gate, Shell, Sign, bg, chunk, rnd, useBursts, usePhases, type VProps } from "../LetterReveal";

const DISPLAY = `var(--font-fredoka), "Baloo 2", system-ui, sans-serif`;
const HAND = `var(--font-lr-hand), "Caveat", cursive`;
const BLOCKS = ["#FFE0EE", "#FFF1B8", "#D6F7EA", "#DDEBFF", "#EAE2FF"];
const EDGES = ["#FF7EB6", "#F5C518", "#2ED3A0", "#6AA8FF", "#9C84FF"];

export default function CatchReveal(P: VProps) {
  const ph = usePhases(!!P.question, [2600, 1500], P.reduce, P.onRead);
  const [kept, setKept] = useState(false);
  const [bursts, fire] = useBursts();
  // Long paragraphs are split so every block reads like one caught piece.
  const pieces = useMemo(() => P.paras.flatMap((p) => chunk(p, 170)), [P.paras]);
  const pics = P.photos.slice(0, 3);
  const to = P.to || "you";

  return (
    <Shell P={P} label={`A letter${P.from ? ` from ${P.from}` : ""}`}>
      <style>{CSS}</style>
      <div className="lrCtSky" aria-hidden>
        {Array.from({ length: 12 }, (_, i) => (
          <i key={i} style={{ left: `${rnd(i, 3) * 100}%`, top: `${rnd(i, 5) * 100}%`, animationDelay: `${rnd(i, 7) * 3}s`, fontSize: `${10 + rnd(i, 9) * 16}px` } as CSSProperties}>
            {i % 3 === 0 ? "✦" : "♥"}
          </i>
        ))}
      </div>

      {ph.p === -1 && (
        <div className="lrCtCenter">
          <Gate
            cls="lrCtGate"
            head={
              <div className="lrCtGateHead" aria-hidden>
                <span className="lrCtCont">CONTINUE?</span>
                <span className="lrCtNine">9</span>
              </div>
            }
            kicker={`player 2 · ${to}`}
            question={P.question}
            note="answer to unlock the final level"
            yes={P.answer}
            no="no"
            onYes={ph.pass}
          />
        </div>
      )}

      {ph.p === 0 && (
        <div className="lrCtCenter lrCtWin">
          <Confetti n={46} colors={["#FF4F9A", "#FFD84D", "#7C5CFF", "#2ED3A0", "#8EC5FF"]} />
          {pics.length > 0 && (
            <div className="lrCtPics" aria-hidden>
              {pics.map((u, i) => (
                <span key={i} className="lrCtPol" style={{ "--i": i, ...bg(u) } as CSSProperties} />
              ))}
            </div>
          )}
          <div className="lrCtStars" aria-hidden>
            {[0, 1, 2].map((i) => (
              <span key={i} style={{ "--i": i } as CSSProperties}>★</span>
            ))}
          </div>
          <h2 className="lrCtBig">
            LEVEL
            <br />
            COMPLETE!
          </h2>
          <p className="lrCtHi">
            <span>NEW HIGH SCORE</span>
            <b>∞</b>
          </p>
        </div>
      )}

      {ph.p === 1 && (
        <div className="lrCtCenter">
          <p className="lrCtBonus">BONUS STAGE</p>
          <p className="lrCtBonusSub">the letter{P.from ? ` from ${P.from}` : ""}</p>
          <div className="lrCtLoad"><i /></div>
          <p className="lrCtTip">tip: there is no way to lose this one 💗</p>
        </div>
      )}

      {ph.p >= ph.n && (
        <div className="lrScroll lrCtPage" data-lr-scroll>
          <div className="lrCtCol">
            <header className="lrCtHead">
              <span className="lrCtBadge">★ ★ ★ &nbsp;final level</span>
              {P.greeting && <h2 className="lrCtGreet">{P.greeting}</h2>}
            </header>
            <ol className="lrCtStack">
              {pieces.map((t, i) => (
                <li
                  key={i}
                  className="lrCtBlock"
                  style={{ "--i": i, "--bg": BLOCKS[i % BLOCKS.length], "--ed": EDGES[i % EDGES.length], "--r": `${(rnd(i, 11) - 0.5) * 2.4}deg` } as CSSProperties}
                >
                  <span className="lrCtNum" aria-hidden>{i + 1}</span>
                  <p>{t}</p>
                </li>
              ))}
              <li className="lrCtBlock lrCtSignBlock" style={{ "--i": pieces.length, "--bg": "#fff", "--ed": "#FF4F9A", "--r": "-1deg" } as CSSProperties}>
                <Sign sign={P.sign} from={P.from} cls="lrSign lrCtSign" />
              </li>
            </ol>
            <div className="lrCtActs" style={{ "--i": pieces.length + 1 } as CSSProperties}>
              <button type="button" className={`lrCtKeep${kept ? " is-on" : ""}`} onClick={() => { setKept(true); fire(50, 72); }}>
                {kept ? "saved to your heart ✓" : "♥ keep forever"}
              </button>
              <p>{pieces.length} pieces · 0 missed · 1 very lucky player</p>
            </div>
          </div>
        </div>
      )}
      {bursts}
    </Shell>
  );
}

const CSS = `
.lr--catch { font-family: var(--font-outfit), system-ui, sans-serif; color: #2A1640;
  background: linear-gradient(180deg, #9FD3FF 0%, #C8B8FF 50%, #FFD0E8 100%); }
.lr--catch .lrX { background: rgba(255,255,255,.75); color: #2A1640; }
.lrCtSky { position: absolute; inset: 0; pointer-events: none; }
.lrCtSky i { position: absolute; font-style: normal; color: rgba(255,255,255,.75); animation: lrCtTw 3s ease-in-out infinite; }
.lrCtCenter { display: grid; place-content: center; justify-items: center; text-align: center; padding: 24px; }

/* gate */
.lrCtGate { background: #fff; border-radius: 30px; padding: 22px 20px 6px; box-shadow: 0 10px 0 rgba(42,22,64,.12), 0 30px 60px -24px rgba(42,22,64,.5); animation: lrPopIn .45s cubic-bezier(.2,1.5,.4,1) both; }
.lrCtGateHead { display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 10px; }
.lrCtCont { font: 700 26px ${DISPLAY}; color: #FF4F9A; letter-spacing: .04em; text-shadow: 0 3px 0 #2A1640; }
.lrCtNine { width: 40px; height: 40px; border-radius: 12px; display: grid; place-items: center; background: #2A1640; color: #FFD84D; font: 700 24px ${DISPLAY}; animation: lrCtBlink 1s steps(2) infinite; }
.lrCtGate .lrGateKick { font: 700 12px ${DISPLAY}; letter-spacing: .14em; text-transform: uppercase; color: #7C5CFF; }
.lrCtGate .lrGateQ { font: 700 24px/1.2 ${DISPLAY}; color: #2A1640; }
.lrCtGate .lrGateNote { color: #6B5A80; opacity: 1; }
.lrCtGate .lrGateYes { width: 100%; padding: 15px 18px; border: 0; border-radius: 20px; background: #FF4F9A; color: #fff !important; font: 700 19px ${DISPLAY}; box-shadow: 0 6px 0 #D12A72; }
.lrCtGate .lrGateYes:active { transform: translateY(5px); box-shadow: 0 1px 0 #D12A72; }
.lrCtGate .lrGateNo { padding: 10px 20px; border-radius: 16px; border: 2px solid #E5DCF0; background: #fff; font: 600 15px ${DISPLAY}; color: #6B5A80 !important; }

/* level complete */
.lrCtWin { overflow: hidden; }
.lrCtPics { position: relative; width: 220px; height: 120px; margin-bottom: 6px; }
.lrCtPol { position: absolute; left: 50%; top: 0; width: 96px; height: 112px; margin-left: -48px; background: #eee center/cover no-repeat; border: 6px solid #fff; border-bottom-width: 18px; border-radius: 4px;
  box-shadow: 0 14px 24px -12px rgba(42,22,64,.6); transform: rotate(calc((var(--i) - 1) * 14deg)) translateX(calc((var(--i) - 1) * 62px)); animation: lrCtFan .7s cubic-bezier(.2,1.4,.4,1) calc(var(--i) * .1s) both; }
.lrCtStars { display: flex; gap: 4px; align-items: flex-end; position: relative; z-index: 2; }
.lrCtStars span { font-size: 54px; line-height: 1; color: #FFD84D; text-shadow: 0 5px 0 #E8A800, 0 12px 24px rgba(255,180,0,.5); animation: lrCtStar .6s cubic-bezier(.2,1.8,.4,1) calc(.3s + var(--i) * .22s) both; }
.lrCtStars span:nth-child(2) { font-size: 74px; transform: translateY(-10px); animation-name: lrCtStar2; }
.lrCtBig { margin: 10px 0 0; font: 700 clamp(46px, 13vw, 76px)/.95 ${DISPLAY}; color: #fff; position: relative; z-index: 2;
  text-shadow: 0 5px 0 #FF4F9A, 0 11px 0 #2A1640, 0 24px 40px rgba(42,22,64,.35); animation: lrCtBigIn .6s cubic-bezier(.2,1.5,.4,1) .1s both; }
.lrCtHi { position: relative; z-index: 2; display: inline-flex; align-items: center; gap: 10px; margin: 22px 0 0; padding: 8px 18px; border-radius: 16px; background: #2A1640; color: #FFD84D; font: 700 16px ${DISPLAY}; letter-spacing: .1em; animation: lrCtBlink .9s steps(2) 1.2s 3, lrPopIn .4s ease 1s both; }
.lrCtHi b { font-size: 26px; color: #fff; }

/* bonus loading */
.lrCtBonus { margin: 0; font: 700 44px/1 ${DISPLAY}; color: #fff; text-shadow: 0 4px 0 #7C5CFF, 0 9px 0 #2A1640; animation: lrPopIn .4s cubic-bezier(.2,1.5,.4,1) both; }
.lrCtBonusSub { margin: 10px 0 18px; font: 600 17px ${DISPLAY}; color: #2A1640; }
.lrCtLoad { width: min(70vw, 280px); height: 22px; padding: 4px; border-radius: 99px; background: #fff; box-shadow: 0 5px 0 rgba(42,22,64,.15); }
.lrCtLoad i { display: block; height: 100%; border-radius: inherit; background: repeating-linear-gradient(45deg, #FF4F9A 0 12px, #FF7EB6 12px 24px); transform-origin: left; animation: lrFillX 1.3s cubic-bezier(.6,0,.3,1) both; }
.lrCtTip { margin: 14px 0 0; font-size: 13px; color: #6B5A80; }

/* the stacked letter */
.lrCtPage { background: transparent; }
.lrCtCol { max-width: 600px; margin: 0 auto; padding: calc(64px + env(safe-area-inset-top, 0px)) 18px calc(56px + env(safe-area-inset-bottom, 0px)); }
.lrCtHead { text-align: center; }
.lrCtBadge { display: inline-block; padding: 7px 16px; border-radius: 99px; background: #2A1640; color: #FFD84D; font: 700 13px ${DISPLAY}; letter-spacing: .08em; animation: lrPopIn .4s ease both; }
.lrCtGreet { margin: 14px 0 6px; font: 700 clamp(30px, 8vw, 44px)/1.05 ${DISPLAY}; color: #fff; text-shadow: 0 4px 0 #FF4F9A, 0 9px 18px rgba(42,22,64,.3); overflow-wrap: anywhere; animation: lrRise .6s .1s both; }
.lrCtStack { list-style: none; margin: 18px 0 0; padding: 0; display: grid; gap: 12px; }
.lrCtBlock { position: relative; padding: 16px 18px 16px 50px; border-radius: 22px; background: var(--bg); border: 3px solid #fff;
  box-shadow: 0 6px 0 var(--ed), 0 18px 30px -18px rgba(42,22,64,.55); transform: rotate(var(--r));
  animation: lrCtLand .75s cubic-bezier(.3,1.4,.5,1) calc(.35s + var(--i) * .42s) both; }
.lrCtBlock p { margin: 0; font-size: 17px; line-height: 1.55; overflow-wrap: anywhere; }
.lrCtNum { position: absolute; left: 12px; top: 14px; width: 28px; height: 28px; border-radius: 10px; display: grid; place-items: center; background: #fff; color: var(--ed); font: 700 14px ${DISPLAY}; box-shadow: 0 3px 0 var(--ed); }
.lrCtSignBlock { padding: 12px 20px 16px; }
.lrCtSign { margin: 0; font: 700 30px/1.15 ${HAND}; color: #2A1640; text-align: right; font-style: normal; }
.lrCtSign strong { color: #FF4F9A; font-size: 34px; }
.lrCtActs { margin-top: 22px; text-align: center; animation: lrRise .6s ease calc(.6s + var(--i) * .42s) both; }
.lrCtKeep { min-width: 220px; padding: 15px 24px; border: 0; border-radius: 20px; background: #FF4F9A; color: #fff !important; font: 700 18px ${DISPLAY}; cursor: pointer; box-shadow: 0 6px 0 #D12A72, 0 16px 24px -12px rgba(60,10,70,.5); transition: transform .12s, box-shadow .12s; }
.lrCtKeep:active { transform: translateY(5px); box-shadow: 0 1px 0 #D12A72; }
.lrCtKeep.is-on { background: #2ED3A0; box-shadow: 0 6px 0 #14A077; }
.lrCtActs p { margin: 12px 0 0; font: 600 13px ${DISPLAY}; color: #6B5A80; }

@keyframes lrCtTw { 0%, 100% { opacity: .25; transform: scale(.7); } 50% { opacity: 1; transform: scale(1.1); } }
@keyframes lrCtBlink { 50% { opacity: .35; } }
@keyframes lrCtFan { from { opacity: 0; transform: translateY(80px) rotate(0) scale(.5); } }
@keyframes lrCtStar { 0% { opacity: 0; transform: scale(0) rotate(-90deg); } 100% { opacity: 1; transform: scale(1) rotate(0); } }
@keyframes lrCtStar2 { 0% { opacity: 0; transform: translateY(-10px) scale(0) rotate(-90deg); } 100% { opacity: 1; transform: translateY(-10px) scale(1) rotate(0); } }
@keyframes lrCtBigIn { 0% { opacity: 0; transform: scale(2); } 100% { opacity: 1; transform: scale(1); } }
@keyframes lrCtLand { 0% { opacity: 0; transform: translateY(-65vh) rotate(calc(var(--r) * 4)); } 62% { opacity: 1; transform: translateY(0) rotate(var(--r)) scale(1.04, .92); } 78% { transform: translateY(-8px) rotate(var(--r)) scale(.98, 1.03); } 100% { opacity: 1; transform: rotate(var(--r)); } }
@media (min-width: 1100px) and (min-height: 700px) { .lrCtWin > *:not(.lrConfetti) { zoom: 1.2; } }
`;
