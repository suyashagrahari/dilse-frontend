"use client";

// ─── profile: a message request → the thread → a formal recommendation ──────
//
// The Endorsements template clones a professional-network profile, so its main
// letter arrives the way everything on that network does: as a message. The
// optional question is a "message request" card (Accept · the runaway Ignore).
// Then the messaging thread opens — "Active now", a typing indicator, two short
// bubbles and a PDF-style attachment: "Recommendation for <name>". That opens
// into the letter itself, laid out as a formal recommendation — letterhead,
// relationship line, date, "To whom it may concern" — that reads, of course,
// like a love letter. It closes with a hand-signed name, an ENDORSED stamp that
// thumps down, the attached memories, and a sticky bar: Like · Love · Accept
// recommendation (confetti, then "Added to your profile ✓").

import { useMemo, useState, type CSSProperties } from "react";
import { Confetti, Gate, Shell, bg, rnd, useBursts, usePhases, type VProps } from "../LetterReveal";

const FONT = `-apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif`;
const HAND = `var(--font-lr-hand), "Caveat", "Segoe Print", cursive`;
const BLUE = "#0A66C2";

const initial = (s?: string) => (s?.trim()?.[0] ?? "♥").toUpperCase();

function Disc({ name, size, photo }: { name?: string; size: number; photo?: string }) {
  return (
    <span
      className="lrPfDisc"
      style={{ width: size, height: size, fontSize: size * 0.42, ...(photo ? bg(photo) : null) } as CSSProperties}
      aria-hidden
    >
      {photo ? null : initial(name)}
    </span>
  );
}

export default function ProfileReveal(P: VProps) {
  const ph = usePhases(!!P.question, [1500, 2600], P.reduce, P.onRead);
  const [accepted, setAccepted] = useState(false);
  const [loved, setLoved] = useState(false);
  const [liked, setLiked] = useState(false);
  const [bursts, fire] = useBursts();
  const from = P.from || "Someone";
  const to = P.to || "you";
  const date = useMemo(() => new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }), []);
  const file = `Recommendation_for_${to.replace(/\s+/g, "_")}.pdf`;
  const pics = P.photos.slice(0, 3);

  return (
    <Shell P={P} label={`A recommendation${P.from ? ` from ${P.from}` : ""}`}>
      <style>{CSS}</style>

      {ph.p === -1 && (
        <div className="lrPfCenter lrPfGrey">
          <div className="lrPfReq">
            <p className="lrPfReqTop">Message request</p>
            <Disc name={from} size={72} />
            <p className="lrPfReqName">
              {from} <span>· 1st</span>
            </p>
            <p className="lrPfReqSub">wants to send you a message</p>
            <Gate cls="lrPfGate" question={P.question} yes={P.answer} no="Ignore" onYes={ph.pass} note="Messages from your 1st-degree connections are always safe to open." />
          </div>
        </div>
      )}

      {ph.p >= 0 && ph.p < ph.n && (
        <div className="lrPfThread">
          <header className="lrPfThreadH">
            <Disc name={from} size={40} />
            <span className="lrPfThreadWho">
              <b>{from}</b>
              <span><i className="lrPfOnline" aria-hidden /> Active now</span>
            </span>
          </header>
          <div className="lrPfMsgs">
            <p className="lrPfDay">TODAY</p>
            {ph.p === 0 && (
              <div className="lrPfRow">
                <Disc name={from} size={32} />
                <span className="lrPfTyping" aria-label={`${from} is typing`}><i /><i /><i /></span>
              </div>
            )}
            {ph.p >= 1 && (
              <>
                <div className="lrPfRow lrPfIn" style={{ "--d": "0ms" } as CSSProperties}>
                  <Disc name={from} size={32} />
                  <div className="lrPfBody">
                    <p className="lrPfMeta"><b>{from}</b> · now</p>
                    <p className="lrPfTx">hey {to} 👋</p>
                  </div>
                </div>
                <div className="lrPfRow lrPfIn lrPfCont" style={{ "--d": "450ms" } as CSSProperties}>
                  <p className="lrPfTx">I was asked to write you a recommendation. It&apos;s official. It&apos;s attached.</p>
                </div>
                <button type="button" className="lrPfFile lrPfIn" style={{ "--d": "900ms" } as CSSProperties} onClick={ph.skip}>
                  <span className="lrPfPdf" aria-hidden>PDF</span>
                  <span className="lrPfFileTx">
                    <b>{file}</b>
                    <span>1 page · tap to open</span>
                  </span>
                </button>
              </>
            )}
          </div>
          <div className="lrPfCompose" aria-hidden>
            <span>Write a message…</span>
          </div>
        </div>
      )}

      {ph.p >= ph.n && (
        <div className="lrScroll lrPfPage" data-lr-scroll>
          {accepted && <Confetti n={60} colors={[BLUE, "#E0457B", "#F5BB5C", "#6DAE4F", "#A872E8"]} />}
          {bursts}
          <header className="lrPfBar">
            <span className="lrPfBarT">Recommendation</span>
          </header>
          <article className="lrPfDoc">
            <div className="lrPfHead">
              <p className="lrPfKick">Recommendation</p>
              <div className="lrPfFrom">
                <Disc name={from} size={64} />
                <div className="lrPfFromTx">
                  <b>
                    {from} <span>· 1st</span>
                  </b>
                  <span>Your person, full-time · Chief Admirer</span>
                </div>
              </div>
              <div className="lrPfFor">
                <Disc name={to} size={28} photo={P.avatar} />
                <span>
                  for <b>{to}</b>
                  {P.title ? <> · {P.title}</> : null}
                </span>
              </div>
              <p className="lrPfDate">
                {date}, {from} loves {to} directly
              </p>
            </div>

            <div className="lrPfLetter">
              <p className="lrPfTwc lrRise" style={{ animationDelay: "120ms" }}>To whom it may concern — and mostly to you,</p>
              {P.greeting && (
                <p className="lrPfGreet lrRise" style={{ animationDelay: "220ms" }}>
                  {P.greeting}
                </p>
              )}
              {P.paras.map((t, i) => (
                <p key={i} className="lrPfP lrRise" style={{ animationDelay: `${320 + i * 160}ms` }}>
                  {t}
                </p>
              ))}
              <div className="lrPfSignW lrRise" style={{ animationDelay: `${420 + P.paras.length * 160}ms` }}>
                <p className="lrPfSignL">{P.sign}</p>
                <p className="lrPfHand">{from}</p>
                <p className="lrPfSignSub">
                  {from} · Recommending {to} for every role, in every timeline
                </p>
                <div className="lrPfStamp" style={{ animationDelay: `${900 + P.paras.length * 160}ms` }} aria-hidden>
                  <svg viewBox="0 0 120 120" width="112" height="112">
                    <defs>
                      <path id="lrPfCirc" d="M60,60 m-44,0 a44,44 0 1,1 88,0 a44,44 0 1,1 -88,0" />
                    </defs>
                    <circle cx="60" cy="60" r="56" fill="none" stroke="currentColor" strokeWidth="3" />
                    <circle cx="60" cy="60" r="34" fill="none" stroke="currentColor" strokeWidth="1.5" />
                    <text fontSize="10.5" fontWeight="800" letterSpacing="2.2" fill="currentColor">
                      <textPath href="#lrPfCirc">ENDORSED · WITHOUT RESERVATION ·</textPath>
                    </text>
                    <path d="M60 76c-9-6.5-14-11-14-17a7 7 0 0 1 14-2.4A7 7 0 0 1 74 59c0 6-5 10.5-14 17z" fill="currentColor" />
                  </svg>
                </div>
              </div>
            </div>

            {pics.length > 0 && (
              <div className="lrPfAtt lrRise" style={{ animationDelay: `${600 + P.paras.length * 160}ms` }}>
                <p className="lrPfAttH">Attachments · {pics.length} {pics.length === 1 ? "memory" : "memories"}</p>
                <div className="lrPfPics">
                  {pics.map((u, i) => (
                    <span key={i} className="lrPfPol" style={{ ...bg(u), "--r": `${(rnd(i, 4) - 0.5) * 8}deg` } as CSSProperties} />
                  ))}
                </div>
              </div>
            )}
          </article>

          <div className="lrPfActs">
            <button type="button" className={`lrPfAct${liked ? " is-like" : ""}`} onClick={() => setLiked((v) => !v)} aria-pressed={liked}>
              <span aria-hidden>👍</span> Like
            </button>
            <button
              type="button"
              className={`lrPfAct${loved ? " is-love" : ""}`}
              aria-pressed={loved}
              onClick={() => {
                setLoved(true);
                fire(30 + rnd(Date.now() % 97, 2) * 40, 70);
              }}
            >
              <span aria-hidden>❤️</span> Love
            </button>
            <button
              type="button"
              className={`lrPfAccept${accepted ? " is-on" : ""}`}
              onClick={() => {
                setAccepted(true);
                fire(50, 60);
              }}
            >
              {accepted ? "Added to your profile ✓" : "Accept recommendation"}
            </button>
          </div>
        </div>
      )}
    </Shell>
  );
}

const CSS = `
.lr--profile { background: #F4F2EE; color: rgba(0,0,0,.9); font-family: ${FONT}; }
.lr--profile .lrX { background: rgba(0,0,0,.06); color: rgba(0,0,0,.75); }
.lr .lrPfDisc { display: inline-grid; place-items: center; flex: none; border-radius: 50%; color: #fff; font-weight: 700; background: linear-gradient(135deg, ${BLUE}, #E0457B) center/cover no-repeat; box-shadow: 0 0 0 2px #fff; }
.lr .lrPfCenter { display: grid; place-items: center; padding: 20px; overflow-y: auto; }
.lr .lrPfGrey { background: rgba(0,0,0,.55); }
.lr .lrPfReq { width: min(92vw, 420px); padding: 18px 20px 6px; border-radius: 12px; background: #fff; text-align: center; display: grid; justify-items: center; gap: 4px; box-shadow: 0 24px 60px -20px rgba(0,0,0,.5); animation: lrPfUp .4s cubic-bezier(.2,1.2,.4,1) both; }
.lr .lrPfReqTop { margin: 0 0 8px; justify-self: stretch; text-align: left; padding-bottom: 10px; border-bottom: 1px solid rgba(0,0,0,.08); font-size: 16px; font-weight: 600; }
.lr .lrPfReqName { margin: 6px 0 0; font-size: 18px; font-weight: 600; }
.lr .lrPfReqName span { font-weight: 400; color: rgba(0,0,0,.6); font-size: 15px; }
.lr .lrPfReqSub { margin: 0; font-size: 14px; color: rgba(0,0,0,.6); }
.lr .lrPfGate { width: 100%; margin-top: 8px; }
.lr .lrPfGate .lrGateQ { font-size: 20px; line-height: 1.35; font-weight: 600; margin: 10px 0 6px; }
.lr .lrPfGate .lrGateNote { font-size: 12px; }
.lr .lrPfGate .lrGateYes { min-width: 180px; padding: 10px 24px; border: 0; border-radius: 99px; background: ${BLUE}; color: #fff !important; font-size: 16px; font-weight: 600; box-shadow: 0 6px 16px -8px ${BLUE}; }
.lr .lrPfGate .lrGateYes:hover { background: #004182; }
.lr .lrPfGate .lrGateNo { padding: 7px 18px; border: 0; border-radius: 99px; background: #fff; box-shadow: inset 0 0 0 1px rgba(0,0,0,.6); color: rgba(0,0,0,.75) !important; font-size: 14px; font-weight: 600; }

.lr .lrPfThread { display: flex; flex-direction: column; background: #fff; max-width: 720px; margin: 0 auto; box-shadow: 0 0 0 1px rgba(0,0,0,.08); }
.lr .lrPfThreadH { display: flex; align-items: center; gap: 10px; padding: calc(12px + env(safe-area-inset-top, 0px)) 64px 12px 16px; border-bottom: 1px solid rgba(0,0,0,.08); }
.lr .lrPfThreadWho { display: grid; font-size: 12px; color: rgba(0,0,0,.6); }
.lr .lrPfThreadWho b { font-size: 16px; color: rgba(0,0,0,.9); font-weight: 600; }
.lr .lrPfOnline { display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #01754F; margin-right: 3px; }
.lr .lrPfMsgs { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 6px; }
.lr .lrPfDay { margin: 0 0 8px; text-align: center; font-size: 11px; letter-spacing: .08em; color: rgba(0,0,0,.6); font-weight: 600; }
.lr .lrPfRow { display: flex; gap: 10px; align-items: flex-start; }
.lr .lrPfCont { padding-left: 42px; }
.lr .lrPfBody { display: grid; gap: 2px; min-width: 0; }
.lr .lrPfMeta { margin: 0; font-size: 12px; color: rgba(0,0,0,.6); }
.lr .lrPfMeta b { font-size: 14px; color: rgba(0,0,0,.9); font-weight: 600; }
.lr .lrPfTx { margin: 0; font-size: 15px; line-height: 1.45; overflow-wrap: anywhere; }
.lr .lrPfIn { animation: lrPfUp .45s var(--d, 0ms) cubic-bezier(.2,1.2,.4,1) both; }
.lr .lrPfTyping { display: inline-flex; gap: 4px; padding: 12px 14px; border-radius: 16px; background: #F2F2F2; }
.lr .lrPfTyping i { width: 7px; height: 7px; border-radius: 50%; background: rgba(0,0,0,.45); animation: lrPfDot 1s ease-in-out infinite; }
.lr .lrPfTyping i:nth-child(2) { animation-delay: .15s; } .lrPfTyping i:nth-child(3) { animation-delay: .3s; }
.lr .lrPfFile { margin: 6px 0 0 42px; display: flex; align-items: center; gap: 12px; max-width: 360px; padding: 12px; border: 1px solid rgba(0,0,0,.15); border-radius: 8px; background: #fff; text-align: left; cursor: pointer; transition: box-shadow .2s; }
.lr .lrPfFile:hover { box-shadow: 0 4px 14px rgba(0,0,0,.12); }
.lr .lrPfPdf { flex: none; width: 40px; height: 48px; border-radius: 4px; background: #CB112D; color: #fff; display: grid; place-items: center; font-size: 11px; font-weight: 800; }
.lr .lrPfFileTx { display: grid; min-width: 0; font-size: 12px; color: rgba(0,0,0,.6); }
.lr .lrPfFileTx b { font-size: 14px; color: rgba(0,0,0,.9); font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.lr .lrPfCompose { padding: 12px 16px calc(12px + env(safe-area-inset-bottom, 0px)); border-top: 1px solid rgba(0,0,0,.08); }
.lr .lrPfCompose span { display: block; padding: 10px 14px; border-radius: 8px; background: #F4F2EE; color: rgba(0,0,0,.5); font-size: 14px; }

.lr .lrPfPage { background: #F4F2EE; padding-bottom: calc(96px + env(safe-area-inset-bottom, 0px)); }
.lr .lrPfBar { position: sticky; top: 0; z-index: 5; height: calc(52px + env(safe-area-inset-top, 0px)); padding: env(safe-area-inset-top, 0px) 64px 0 16px; display: flex; align-items: center; background: #fff; border-bottom: 1px solid rgba(0,0,0,.08); }
.lr .lrPfBarT { font-size: 16px; font-weight: 600; }
.lr .lrPfDoc { position: relative; max-width: 720px; margin: 0 auto; background: #fff; animation: lrPfUp .5s cubic-bezier(.2,1,.3,1) both; }
@media (min-width: 768px) { .lr .lrPfDoc { margin: 24px auto 0; border-radius: 8px; box-shadow: 0 0 0 1px rgba(140,140,140,.2), 0 20px 50px -30px rgba(0,0,0,.35); overflow: hidden; } }
.lr .lrPfHead { position: relative; padding: 22px 20px 18px; border-top: 4px solid ${BLUE}; border-bottom: 1px solid rgba(0,0,0,.08); background: linear-gradient(180deg, #F3F8FD, #fff); display: grid; gap: 12px; }
@media (min-width: 768px) { .lr .lrPfHead { padding: 28px 40px 22px; } }
.lr .lrPfKick { margin: 0; font-size: 12px; font-weight: 700; letter-spacing: .16em; text-transform: uppercase; color: ${BLUE}; }
.lr .lrPfFrom { display: flex; align-items: center; gap: 14px; }
.lr .lrPfFromTx { display: grid; gap: 2px; min-width: 0; font-size: 14px; color: rgba(0,0,0,.6); }
.lr .lrPfFromTx b { font-size: 20px; color: rgba(0,0,0,.9); font-weight: 600; }
.lr .lrPfFromTx b span { font-weight: 400; font-size: 15px; color: rgba(0,0,0,.6); }
.lr .lrPfFor { display: flex; align-items: center; gap: 8px; font-size: 14px; color: rgba(0,0,0,.75); min-width: 0; }
.lr .lrPfFor > span:last-child { overflow-wrap: anywhere; }
.lr .lrPfFor b { font-weight: 600; }
.lr .lrPfDate { margin: 0; font-size: 13px; color: rgba(0,0,0,.6); }
.lr .lrPfLetter { position: relative; padding: 22px 20px 26px; }
@media (min-width: 768px) { .lr .lrPfLetter { padding: 30px 40px 34px; } }
.lr .lrPfTwc { margin: 0 0 14px; font-size: 13px; font-style: italic; color: rgba(0,0,0,.55); }
.lr .lrPfGreet { margin: 0 0 14px; font-size: 18px; font-weight: 600; }
.lr .lrPfP { margin: 0 0 14px; font-size: 16px; line-height: 1.7; color: rgba(0,0,0,.85); overflow-wrap: anywhere; }
@media (min-width: 768px) { .lr .lrPfP { font-size: 17px; } }
.lr .lrPfSignW { position: relative; margin-top: 26px; padding-top: 4px; }
.lr .lrPfSignL { margin: 0; font-size: 15px; font-style: italic; color: rgba(0,0,0,.7); }
.lr .lrPfHand { margin: 2px 0 0; font: 700 42px/1.1 ${HAND}; color: ${BLUE}; transform: rotate(-3deg); transform-origin: left; }
.lr .lrPfSignSub { margin: 8px 0 0; padding-top: 8px; border-top: 1px solid rgba(0,0,0,.12); max-width: 360px; font-size: 13px; color: rgba(0,0,0,.6); }
.lr .lrPfStamp { position: absolute; right: -4px; bottom: -6px; color: #E0457B; opacity: .9; animation: lrPfStamp .55s cubic-bezier(.2,1.5,.4,1) both; }
@media (max-width: 480px) { .lr .lrPfStamp svg { width: 88px; height: 88px; } .lrPfStamp { right: -8px; bottom: 30px; } }
.lr .lrPfAtt { padding: 0 20px 24px; }
@media (min-width: 768px) { .lr .lrPfAtt { padding: 0 40px 32px; } }
.lr .lrPfAttH { margin: 0 0 12px; padding-top: 16px; border-top: 1px solid rgba(0,0,0,.08); font-size: 14px; font-weight: 600; }
.lr .lrPfPics { display: flex; gap: 12px; flex-wrap: wrap; }
.lr .lrPfPol { width: 104px; aspect-ratio: 4 / 5; border-radius: 4px; background-size: cover; background-position: center; border: 5px solid #fff; border-bottom-width: 16px; box-shadow: 0 6px 18px -8px rgba(0,0,0,.45), 0 0 0 1px rgba(0,0,0,.06); transform: rotate(var(--r)); }
.lr .lrPfActs { position: fixed; left: 0; right: 0; bottom: 0; z-index: 6; display: flex; gap: 8px; align-items: center; justify-content: center; padding: 10px 12px calc(10px + env(safe-area-inset-bottom, 0px)); background: rgba(255,255,255,.96); border-top: 1px solid rgba(0,0,0,.08); }
.lr .lrPfAct { display: inline-flex; align-items: center; gap: 6px; min-height: 40px; padding: 8px 14px; border: 0; border-radius: 99px; background: none; font-size: 14px; font-weight: 600; color: rgba(0,0,0,.6) !important; cursor: pointer; transition: background .15s, transform .15s; }
.lr .lrPfAct:hover { background: rgba(0,0,0,.05); }
.lr .lrPfAct:active { transform: scale(.94); }
.lr .lrPfAct.is-like { color: ${BLUE} !important; }
.lr .lrPfAct.is-love { color: #B24020 !important; }
.lr .lrPfAccept { min-height: 40px; padding: 8px 20px; border: 0; border-radius: 99px; background: ${BLUE}; color: #fff !important; font-size: 15px; font-weight: 600; cursor: pointer; white-space: nowrap; transition: background .2s, transform .15s; }
.lr .lrPfAccept:active { transform: scale(.96); }
.lr .lrPfAccept.is-on { background: #01754F; }
@media (max-width: 380px) { .lr .lrPfAct { padding: 8px 10px; } .lrPfAccept { padding: 8px 14px; font-size: 14px; } }
@keyframes lrPfUp { from { opacity: 0; transform: translateY(14px); } }
@keyframes lrPfDot { 0%, 100% { transform: translateY(0); opacity: .5; } 50% { transform: translateY(-4px); opacity: 1; } }
@keyframes lrPfStamp { from { opacity: 0; transform: scale(2.2) rotate(-30deg); } to { opacity: .9; transform: rotate(-14deg); } }
.lr--profile.is-reduced .lrPfIn, .lr--profile.is-reduced .lrPfStamp, .lr--profile.is-reduced .lrPfDoc, .lr--profile.is-reduced .lrPfReq { animation: none; }
.lr--profile.is-reduced .lrPfStamp { transform: rotate(-14deg); }
`;
