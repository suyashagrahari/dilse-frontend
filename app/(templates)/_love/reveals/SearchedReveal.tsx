"use client";

// ─── searched: the letter is the #1 result ──────────────────────────────────
//
// The search engine's "Before you continue" cookie banner is the gate (its
// "Reject all" runs away). Then "I'm Feeling Lucky" rolls through its moods
// and lands, and a one-result page opens — "About 1 result (0.00 seconds)" —
// where an AI Overview writes the letter live, word by word, with their photos
// as its sources. It ends with "Was this helpful?", and 👍 fires hearts.

import { useEffect, useMemo, useState } from "react";
import { Confetti, Gate, Shell, bg, useBursts, usePhases, type VProps } from "../LetterReveal";

const COLORS = ["#3F76EE", "#E8445E", "#F4B42B", "#3F76EE", "#26A160", "#E8445E"];
const ROLL = ["Lucky", "Loved", "Blushy", "Clingy", "Kissable", "Yours", "Lucky"];
const GSF = `var(--font-outfit), "Outfit", "Segoe UI", Roboto, Arial, sans-serif`;
const AR = `Arial, "Helvetica Neue", Helvetica, sans-serif`;

function Word({ name, size }: { name: string; size: number }) {
  return (
    <span className="lrSrWord" style={{ fontSize: size }} aria-label={name}>
      {[...name].map((c, i) => (
        <span key={i} style={{ color: COLORS[i % COLORS.length] }} aria-hidden>{c}</span>
      ))}
    </span>
  );
}

function Spark({ size = 22, spin }: { size?: number; spin?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={spin ? "lrSrSpin" : undefined} aria-hidden>
      <defs>
        <linearGradient id="lrSrG" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3F76EE" />
          <stop offset=".55" stopColor="#9B6BF2" />
          <stop offset="1" stopColor="#E8445E" />
        </linearGradient>
      </defs>
      <path fill="url(#lrSrG)" d="M12 2c.5 4.6 2.9 7.4 8 8.2v.1c-5.1.8-7.5 3.6-8 8.7h-.1c-.5-5.1-2.9-7.9-8-8.7v-.1c5.1-.8 7.5-3.6 8-8.2H12z" />
    </svg>
  );
}

export default function SearchedReveal(P: VProps) {
  const ph = usePhases(!!P.question, [2600], P.reduce, P.onRead);
  const to = (P.to || "you").trim().split(/\s+/)[0];
  const from = (P.from || "").trim();
  const fromFirst = from.split(/\s+/)[0] || "";
  const brand = to || "Love";
  const query = `a letter for ${to}`;

  // intro: the Lucky roll
  const [roll, setRoll] = useState(0);
  useEffect(() => {
    if (ph.p !== 0) return;
    const ids = ROLL.map((_, i) => window.setTimeout(() => setRoll(i), 250 + i * 190 + i * i * 14));
    return () => ids.forEach((id) => window.clearTimeout(id));
  }, [ph.p]);

  // the letter, streamed
  const paras = useMemo(() => [P.greeting, ...P.paras].filter(Boolean), [P.greeting, P.paras]);
  const words = useMemo(() => paras.map((p) => p.split(/\s+/).filter(Boolean)), [paras]);
  const total = words.reduce((a, w) => a + w.length, 0);
  const live = ph.p >= ph.n;
  const [thinking, setThinking] = useState(!P.reduce);
  const [n, setN] = useState(P.reduce ? total : 0);
  const [vote, setVote] = useState<"up" | "down" | null>(null);
  const [bursts, fire] = useBursts();

  useEffect(() => {
    if (!live || !thinking) return;
    const t = window.setTimeout(() => setThinking(false), 1300);
    return () => window.clearTimeout(t);
  }, [live, thinking]);

  useEffect(() => {
    if (!live || thinking || n >= total) return;
    const t = window.setTimeout(() => setN((v) => Math.min(total, v + 1 + (v % 3 === 0 ? 1 : 0))), 55);
    return () => window.clearTimeout(t);
  }, [live, thinking, n, total]);

  const done = n >= total;
  const starts = words.map((_, i) => words.slice(0, i).reduce((a, w) => a + w.length, 0));
  const shown = words.map((w, i) => w.slice(0, Math.max(0, Math.min(w.length, n - starts[i]))).join(" "));
  let lastIdx = -1;
  shown.forEach((s, i) => {
    if (s) lastIdx = i;
  });
  const photos = P.photos.slice(0, 4);

  return (
    <Shell P={P} label={`A letter${from ? ` from ${from}` : ""}`}>
      <style>{CSS}</style>

      {ph.p === -1 && (
        <div className="lrSrGateBg">
          <div className="lrSrGateCard">
            <Gate
              cls="lrSrGate"
              head={
                <div className="lrSrGateHead">
                  <Word name={brand} size={30} />
                </div>
              }
              kicker={`Before you continue to ${brand} Search`}
              question={P.question}
              note={<>We use cookies and data to deliver one very specific letter, measure how much you blush, and remember that {fromFirst || "someone"} loves you.</>}
              yes={P.answer}
              no="Reject all"
              onYes={ph.pass}
            />
            <p className="lrSrGateFoot">Privacy · Terms · More options</p>
          </div>
        </div>
      )}

      {ph.p === 0 && (
        <div className="lrSrIntro">
          <Word name={brand} size={64} />
          <div className="lrSrIntroBox">
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden>
              <path fill="#9aa0a6" d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
            </svg>
            <span className="lrSrType" style={{ ["--ch" as string]: `${query.length}ch` }}>{query}</span>
          </div>
          <div className="lrSrLucky is-pressed">
            I&apos;m Feeling <span className="lrSrRoll" key={roll}>{ROLL[roll]}</span>
          </div>
        </div>
      )}

      {live && (
        <div className="lrScroll lrSrPage" data-lr-scroll>
          <header className="lrSrHead">
            <Word name={brand} size={26} />
            <div className="lrSrHBox"><span>{query}</span></div>
          </header>
          <nav className="lrSrTabs" aria-hidden>
            <span className="is-on"><Spark size={15} /> AI Mode</span>
            <span>All</span>
            <span>Images</span>
            <span>News</span>
          </nav>
          <main className="lrSrMain">
            <p className="lrSrCount">About 1 result (0.00 seconds)</p>

            <section className="lrSrAio">
              <div className="lrSrAioHead"><Spark spin={thinking} /> AI Overview</div>
              {thinking ? (
                <div className="lrSrSkel" aria-label="Generating">
                  <i style={{ width: "88%" }} />
                  <i style={{ width: "100%" }} />
                  <i style={{ width: "72%" }} />
                </div>
              ) : (
                <div className="lrSrAioGrid">
                  <div className="lrSrLetter">
                    {shown.map((s, i) =>
                      s ? (
                        <p key={i} className={i === 0 && P.greeting ? "lrSrGreet" : undefined}>
                          {s}
                          {!done && i === lastIdx && <span className="lrSrCaret" aria-hidden />}
                        </p>
                      ) : null,
                    )}
                    {done && (
                      <p className="lrSrSign lrRise">
                        {P.sign}
                        {from && (
                          <>
                            <br />
                            <strong>{from}</strong>
                          </>
                        )}
                      </p>
                    )}
                  </div>
                  {photos.length > 0 && (
                    <div className="lrSrSrc" aria-label="Sources">
                      {photos.map((u, i) => (
                        <div key={i} className="lrSrCard" style={{ animationDelay: `${300 + i * 150}ms` }}>
                          <span className="lrSrCardTx">
                            <b>{["the first time", "the best time", "every time", "next time"][i]}</b>
                            <small>memories.love</small>
                          </span>
                          <span className="lrSrCardPic" style={bg(u)} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {!thinking && !done && (
                <button type="button" className="lrSrSkip" onClick={() => setN(total)}>Show all</button>
              )}
              {done && (
                <div className="lrSrFoot lrRise">
                  <span>Was this helpful?</span>
                  <span className="lrSrVote">
                    <button
                      type="button"
                      className={vote === "up" ? "is-on" : ""}
                      aria-label="Yes, helpful"
                      onClick={(e) => {
                        setVote("up");
                        const r = e.currentTarget.getBoundingClientRect();
                        fire(((r.left + r.width / 2) / window.innerWidth) * 100, (r.top / window.innerHeight) * 100);
                        window.setTimeout(() => fire(50, 40), 250);
                      }}
                    >
                      👍
                    </button>
                    <button type="button" className={vote === "down" ? "is-on" : ""} aria-label="Not helpful" onClick={() => setVote("down")}>👎</button>
                  </span>
                </div>
              )}
              {vote && (
                <p className="lrSrThanks lrRise">
                  {vote === "up"
                    ? `Feedback sent to ${fromFirst || "the author"}. They're smiling at their phone now.`
                    : "Feedback rejected. This overview is 100% accurate. 💅"}
                </p>
              )}
            </section>

            {done && (
              <div className="lrSrResult lrRise">
                <span className="lrSrSite">
                  <span className="lrSrFav">{(from[0] || "♥").toUpperCase()}</span>
                  <span>
                    <b>{fromFirst ? `${fromFirst}'s heart` : "a heart"}</b>
                    <small>{(fromFirst || "heart").toLowerCase()}.love › letters › for-{to.toLowerCase()}</small>
                  </span>
                </span>
                <h3>The only result that matters</h3>
                <p>No other results found. There were never going to be any.</p>
              </div>
            )}
          </main>
          {vote === "up" && <Confetti n={46} colors={COLORS} />}
        </div>
      )}
      {bursts}
    </Shell>
  );
}

const CSS = `
.lr--searched { font-family: ${AR}; background: #fff; color: #1f1f1f; }
.lrSrWord { display: inline-flex; font-family: ${GSF}; font-weight: 500; letter-spacing: -.02em; line-height: 1; white-space: nowrap; }

.lrSrGateBg { display: grid; place-items: center; padding: 16px; background: radial-gradient(60% 50% at 50% 30%, #fde7ec, transparent), #eef0f3; }
.lrSrGateCard { position: relative; width: min(92vw, 520px); max-height: 94%; overflow-y: auto; background: #fff; border-radius: 28px; padding: 26px 24px 16px; box-shadow: 0 24px 60px -20px rgba(0,0,0,.35); animation: lrSrUp .4s cubic-bezier(.2,.9,.3,1) both; }
.lrSrGate { width: 100%; text-align: left; }
.lrSrGateHead { margin-bottom: 14px; }
.lrSrGate .lrGateKick { font: 400 24px/1.25 ${GSF}; color: #1f1f1f; }
.lrSrGate .lrGateNote { font-size: 14px; line-height: 1.5; color: #444746; opacity: 1; margin: 10px 0 14px; }
.lrSrGate .lrGateQ { font: 700 17px/1.4 ${AR}; color: #1f1f1f; margin: 4px 0 18px; padding: 12px 14px; border-radius: 14px; background: #f0f4f9; }
.lrSrGate .lrGateYesRow { justify-content: stretch; }
.lrSrGate .lrGateYes { width: 100%; height: 44px; border: 0; border-radius: 99px; background: #0b57d0; color: #fff; font: 500 15px/1 ${GSF}; box-shadow: 0 6px 16px -8px rgba(11,87,208,.8); }
.lrSrGate .lrGateNoRow { height: 90px; }
.lrSrGate .lrGateNo { height: 40px; padding: 0 22px; border: 1px solid #747775; border-radius: 99px; background: #fff; color: #0b57d0; font: 500 14px/1 ${GSF}; }
.lrSrGateFoot { font-size: 12px; color: #70757a; text-align: center; margin: 0; }

.lrSrIntro { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 26px; padding: 20px; }
.lrSrIntroBox { display: flex; align-items: center; gap: 12px; width: min(560px, 88vw); height: 48px; padding: 0 18px; border-radius: 24px; box-shadow: 0 1px 6px rgba(32,33,36,.28); font-size: 16px; }
.lrSrType { display: inline-block; overflow: hidden; white-space: nowrap; border-right: 2px solid #1f1f1f; width: 0; animation: lrSrTyping 1s steps(22) .1s forwards, lrSrBlinkB .7s steps(2) infinite; }
@keyframes lrSrTyping { to { width: calc(var(--ch) + 2px); } }
@keyframes lrSrBlinkB { 50% { border-color: transparent; } }
.lrSrLucky { height: 38px; padding: 0 20px; display: inline-flex; align-items: center; gap: 4px; border-radius: 8px; background: #f8f9fa; border: 1px solid #dadce0; color: #3c4043; font-size: 14px; overflow: hidden; }
.lrSrLucky.is-pressed { animation: lrSrPress .3s 1.9s ease both; }
@keyframes lrSrPress { 50% { transform: scale(.94); background: #eef3fd; } }
.lrSrRoll { display: inline-block; font-weight: 700; color: #E8445E; animation: lrSrRollIn .16s ease both; }
@keyframes lrSrRollIn { from { transform: translateY(90%); opacity: 0; } }

.lrSrPage { background: #fff; }
.lrSrHead { display: flex; align-items: center; gap: 18px; padding: calc(16px + env(safe-area-inset-top, 0px)) 64px 10px 20px; flex-wrap: wrap; }
.lrSrHBox { flex: 1; min-width: 200px; max-width: 690px; height: 44px; display: flex; align-items: center; padding: 0 18px; border-radius: 24px; border: 1px solid #dfe1e5; box-shadow: 0 2px 5px 1px rgba(64,60,67,.08); font-size: 16px; }
.lrSrTabs { display: flex; gap: 22px; padding: 0 20px; border-bottom: 1px solid #ebebeb; font: 400 14px/44px ${GSF}; color: #4d5156; overflow-x: auto; }
.lrSrTabs span { display: inline-flex; align-items: center; gap: 6px; white-space: nowrap; }
.lrSrTabs .is-on { color: #1f1f1f; font-weight: 600; box-shadow: inset 0 -3px 0 #1f1f1f; }
@media (min-width: 900px) { .lrSrHead { padding-left: 28px; } .lrSrHead .lrSrWord { width: 132px; } .lrSrTabs, .lrSrMain { padding-left: 178px !important; } }
.lrSrMain { max-width: 1040px; padding: 0 18px 60px; }
.lrSrCount { font-size: 14px; color: #70757a; margin: 14px 0 10px; }
.lrSrAio { position: relative; max-width: 820px; padding: 18px 18px 14px; border-radius: 22px; background: linear-gradient(135deg, #eef3fd, #fdf0f4); animation: lrSrUp .5s ease both; }
.lrSrAioHead { display: flex; align-items: center; gap: 8px; font: 500 17px/1 ${GSF}; margin-bottom: 14px; }
.lrSrSpin { animation: lrSrSpinK 1.4s linear infinite; }
@keyframes lrSrSpinK { to { transform: rotate(360deg); } }
.lrSrSkel { display: grid; gap: 10px; padding-bottom: 10px; }
.lrSrSkel i { display: block; height: 14px; border-radius: 8px; background: linear-gradient(90deg, rgba(63,118,238,.18), rgba(232,68,94,.24), rgba(63,118,238,.18)); background-size: 200% 100%; animation: lrSrShim 1.1s linear infinite; }
@keyframes lrSrShim { to { background-position: -200% 0; } }
.lrSrAioGrid { display: grid; gap: 16px; }
@media (min-width: 900px) { .lrSrAioGrid { grid-template-columns: minmax(0, 1fr) 200px; } }
.lrSrLetter p { margin: 0 0 14px; font-size: 17px; line-height: 1.7; color: #1f1f1f; white-space: pre-wrap; overflow-wrap: anywhere; }
.lrSrLetter .lrSrGreet { font: 500 20px/1.4 ${GSF}; }
.lrSrCaret { display: inline-block; width: 9px; height: 18px; margin-left: 3px; vertical-align: -3px; border-radius: 2px; background: linear-gradient(#3F76EE, #E8445E); animation: lrSrBlink .8s steps(2) infinite; }
@keyframes lrSrBlink { 50% { opacity: 0; } }
.lrSrLetter .lrSrSign { text-align: right; font-family: var(--font-lr-hand), "Caveat", cursive; font-size: 26px; line-height: 1.2; color: #E8445E; }
.lrSrSign strong { color: #1f1f1f; font-weight: 700; }
.lrSrSrc { display: flex; gap: 8px; overflow-x: auto; align-content: start; }
@media (min-width: 900px) { .lrSrSrc { flex-direction: column; } }
.lrSrCard { flex: none; width: 200px; display: flex; gap: 8px; align-items: center; padding: 8px 8px 8px 12px; border-radius: 14px; background: #fff; animation: lrSrUp .5s ease both; }
.lrSrCardTx { flex: 1; display: grid; gap: 2px; font-size: 13px; }
.lrSrCardTx small { color: #70757a; font-size: 11px; }
.lrSrCardPic { width: 52px; height: 52px; border-radius: 10px; flex: none; background: #f1f3f4 center/cover no-repeat; }
.lrSrSkip { margin-top: 4px; height: 36px; padding: 0 18px; border: 0; border-radius: 99px; background: #fff; color: #0b57d0 !important; font: 500 14px/1 ${GSF} !important; cursor: pointer; box-shadow: 0 1px 3px rgba(0,0,0,.12); }
.lrSrFoot { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding-top: 12px; border-top: 1px solid rgba(0,0,0,.08); font-size: 14px; color: #444746; }
.lrSrVote { display: flex; gap: 6px; }
.lrSrVote button { width: 44px; height: 44px; border-radius: 50%; border: 1px solid #dadce0; background: #fff; font-size: 20px; cursor: pointer; transition: transform .2s; }
.lrSrVote button:hover { transform: scale(1.08); }
.lrSrVote button.is-on { background: #fde7ec; border-color: #E8445E; animation: lrSrPop .4s ease; }
@keyframes lrSrPop { 40% { transform: scale(1.3); } }
.lrSrThanks { margin: 10px 0 0; font-size: 14px; color: #1f1f1f; }
.lrSrResult { max-width: 652px; margin-top: 26px; }
.lrSrSite { display: flex; align-items: center; gap: 12px; }
.lrSrSite > span:last-child { display: grid; }
.lrSrSite b { font-weight: 400; font-size: 14px; }
.lrSrSite small { font-size: 12px; color: #4d5156; }
.lrSrFav { width: 26px; height: 26px; border-radius: 50%; display: grid; place-items: center; background: #E8445E; color: #fff; font: 700 12px/1 ${GSF}; }
.lrSrResult h3 { margin: 6px 0 4px; font: 400 20px/1.3 ${AR}; color: #1f15ab; }
.lrSrResult p { margin: 0; font-size: 14px; line-height: 22px; color: #4d5156; }
@keyframes lrSrUp { from { opacity: 0; transform: translateY(14px); } }
.lr--searched .lrX { background: #f1f3f4; }
`;
