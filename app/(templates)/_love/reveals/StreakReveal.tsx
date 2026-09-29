"use client";

// ─── streak: the letter arrives as a snap ───────────────────────────────────
//
// The Streak template is a parody camera-chat app, so its main letter opens
// the way a snap does. A lock-screen notification ("sent you a Snap") with the
// question card under it (the runaway "no" included) → the chat row with its
// red "New Snap" square, pressed → the snap itself: full-screen photos, one
// caption band per sentence, the circular timer ring counting down, tap to
// advance. The last snap flips to the conversation: the whole letter as a
// saved message (grey, blue bar, their name in caps), "Saved in Chat 💛", a
// 🔥 badge and a keep-forever button that fires hearts.

import { useMemo, useState, type CSSProperties } from "react";
import { Gate, Shell, Sign, bg, chunk, rnd, useBursts, usePhases, type VProps } from "../LetterReveal";

const FONT = `"Avenir Next", "Avenir", "Nunito Sans", var(--font-outfit), -apple-system, system-ui, sans-serif`;
const RED = "#F23C57";
const BLUE = "#0EADFF";
const YELLOW = "#FFFC00";

function Mark({ size = 34 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden focusable="false">
      <rect width="40" height="40" rx="11" fill={YELLOW} />
      <path d="M20 32c-6.2 0-10-3.9-10-9 0-4.5 3.3-7.2 5.4-10.4.4 2.3 1.6 3.8 3.1 4.5-.3-4.4 1.8-8.1 5.3-10.1-.6 3.5 1 6 3.1 8.3 1.9 2.1 3.1 4.4 3.1 7.7 0 5.1-3.8 9-10 9z" fill="#fff" stroke="#111" strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M20 28.2s-4.2-2.5-4.2-5.4a2.2 2.2 0 0 1 4.2-1 2.2 2.2 0 0 1 4.2 1c0 2.9-4.2 5.4-4.2 5.4z" fill="#FF3B5C" />
    </svg>
  );
}

const initial = (s?: string) => (s?.trim()?.[0] ?? "♥").toUpperCase();

function Face({ P, size }: { P: VProps; size: number }) {
  const pic = P.avatar || P.photos[0];
  return (
    <span className="lrSkFace" style={{ width: size, height: size, ...(pic ? bg(pic) : {}) }}>
      {!pic && initial(P.from)}
    </span>
  );
}

export default function StreakReveal(P: VProps) {
  const ph = usePhases(!!P.question, [1900], P.reduce, P.onRead);
  const [i, setI] = useState(0);
  const [kept, setKept] = useState(false);
  const [bursts, fire] = useBursts();
  const from = P.from || "someone";

  // One snap per sentence-ish chunk; the greeting gets its own big opener.
  const snaps = useMemo(() => {
    const out: { text: string; big?: boolean }[] = [];
    if (P.greeting) out.push({ text: P.greeting, big: true });
    for (const p of P.paras) for (const c of chunk(p, 130)) out.push({ text: c });
    return out;
  }, [P.greeting, P.paras]);

  const done = i >= snaps.length;
  const snap = snaps[Math.min(i, snaps.length - 1)];
  const secs = snap ? Math.min(9, Math.round((2.4 + snap.text.length * 0.045) * 10) / 10) : 3;
  const photo = P.photos.length ? P.photos[i % P.photos.length] : undefined;
  const next = () => setI((k) => Math.min(snaps.length, k + 1));
  const prev = () => setI((k) => Math.max(0, k - 1));

  return (
    <Shell P={P} dark label={`A snap${P.from ? ` from ${P.from}` : ""}`}>
      <style>{CSS}</style>

      {ph.p === -1 && (
        <div className="lrSkLock" style={P.photos[0] ? bg(P.photos[0]) : undefined}>
          <div className="lrSkLockVeil" />
          <div className="lrSkLockCol">
            <p className="lrSkClock" aria-hidden>
              9:41
              <small>a very good day</small>
            </p>
            <div className="lrSkNotif">
              <Mark size={36} />
              <div>
                <p className="lrSkNotifTop"><b>Streaks</b><span>now</span></p>
                <p className="lrSkNotifMsg">🔥 {from} sent you a Snap</p>
              </div>
            </div>
            <Gate
              cls="lrSkGate"
              head={
                <div className="lrSkGateHead" aria-hidden>
                  <Face P={P} size={54} />
                  <span className="lrSkGateSq" />
                </div>
              }
              kicker={`${from} wants to know`}
              question={P.question}
              note="answer to open the snap"
              yes={P.answer}
              no="no"
              onYes={ph.pass}
            />
          </div>
        </div>
      )}

      {ph.p === 0 && (
        <div className="lrSkChat">
          <div className="lrSkChatHead">
            <b>Chat</b>
          </div>
          <div className="lrSkRow is-first">
            <Face P={P} size={52} />
            <div className="lrSkRowTx">
              <b>{from}</b>
              <span>
                <i className="lrSkSq" /> <strong>New Snap</strong> · now · 🔥 ∞ 💛
              </span>
            </div>
          </div>
          {Array.from({ length: 4 }, (_, k) => (
            <div key={k} className="lrSkRow is-ghost" style={{ "--k": k } as CSSProperties}>
              <span className="lrSkFace is-ghost" style={{ width: 52, height: 52 }} />
              <div className="lrSkRowTx">
                <i className="lrSkBar" style={{ width: `${Math.round(40 + rnd(k, 3) * 30)}%` }} />
                <i className="lrSkBar is-thin" style={{ width: `${Math.round(20 + rnd(k, 5) * 25)}%` }} />
              </div>
            </div>
          ))}
          <p className="lrSkTap">opening…</p>
          <span className="lrSkPress" aria-hidden />
        </div>
      )}

      {ph.p >= ph.n && !done && snap && (
        <div
          className="lrSkSnap"
          onClick={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            if (e.clientX - r.left < r.width * 0.28) prev();
            else next();
          }}
        >
          {photo ? (
            <div key={`p${i}`} className="lrSkPhoto" style={bg(photo)} />
          ) : (
            <div key={`g${i}`} className="lrSkPhoto" style={{ background: `linear-gradient(${160 + i * 23}deg, #FF7AB6, #A05DCD 55%, #5B8CFF)` }} />
          )}
          <div className="lrSkShade" />
          <div key={`c${i}`} className={`lrSkCap${snap.big ? " is-big" : ""}`}>{snap.text}</div>

          <div className="lrSkTop">
            <Face P={P} size={36} />
            <div className="lrSkWho">
              <b>{from}</b>
              <span>{i === 0 ? "just now" : `${i + 1} of ${snaps.length}`}</span>
            </div>
            <svg key={`r${i}`} className="lrSkRing" width="30" height="30" viewBox="0 0 36 36" aria-hidden>
              <circle cx="18" cy="18" r="15" fill="rgba(0,0,0,.25)" stroke="rgba(255,255,255,.35)" strokeWidth="3.4" />
              <circle
                cx="18"
                cy="18"
                r="15"
                fill="none"
                stroke="#fff"
                strokeWidth="3.4"
                strokeLinecap="round"
                pathLength={100}
                className={`lrSkRun${P.reduce ? " is-still" : ""}`}
                style={{ animationDuration: `${secs}s` }}
                onAnimationEnd={next}
              />
              <text x="18" y="22.5" textAnchor="middle" fontSize="12" fontWeight="800" fill="#fff">{snaps.length - i}</text>
            </svg>
          </div>
          <p className="lrSkHint">tap to keep going →</p>
        </div>
      )}

      {(ph.p === 0 || (ph.p >= ph.n && done)) && <style>{".lr--streak .lrX { background: rgba(0,0,0,.08); color: #16191C; }"}</style>}
      {ph.p >= ph.n && done && (
        <div className="lrScroll lrSkSaved" data-lr-scroll>
          <div className="lrSkSavedCol">
            <div className="lrSkSavedHead">
              <Face P={P} size={40} />
              <div>
                <b>{from}</b>
                <span>🔥 ∞ · Best Friends 💛</span>
              </div>
            </div>
            <p className="lrSkSep">SAVED IN CHAT 💛</p>
            <p className="lrSkName">{from.toUpperCase()}</p>
            <div className="lrSkMsgs">
              <div className="lrSkMsg is-snap"><i className="lrSkSq is-open" /> Opened · a snap you&apos;ll replay</div>
              {P.greeting && <div className="lrSkMsg" style={{ "--d": 0 } as CSSProperties}>{P.greeting}</div>}
              {P.paras.map((t, k) => (
                <div key={k} className="lrSkMsg" style={{ "--d": k + 1 } as CSSProperties}>{t}</div>
              ))}
            </div>
            <Sign sign={P.sign} from={P.from} cls="lrSign lrSkSign" />
            <div className="lrSkBadge" aria-hidden>
              <span>🔥</span>
              <b>streak: forever</b>
              <small>this one never pauses</small>
            </div>
            <div className="lrSkActs">
              <button type="button" className={`lrSkKeep${kept ? " is-on" : ""}`} onClick={() => { setKept(true); fire(50, 78); }}>
                {kept ? "saved forever ✓" : "💛 save in chat forever"}
              </button>
              <button type="button" className="lrSkReplay" onClick={() => setI(0)}>replay snap ↺</button>
            </div>
          </div>
        </div>
      )}
      {bursts}
    </Shell>
  );
}

const CSS = `
.lr--streak { font-family: ${FONT}; background: #000; color: #fff; }
.lrSkFace { display: inline-grid; place-items: center; flex: none; border-radius: 50%; background: #FFE3EC center/cover no-repeat; color: #16191C; font-weight: 800; font-size: 18px; border: 2px solid #fff; }
.lrSkFace.is-ghost { background: #EFEFF1; border-color: #EFEFF1; }

/* lock screen + gate */
.lrSkLock { display: grid; place-items: center; background: #1a0f24 center/cover no-repeat; overflow-y: auto; }
.lrSkLockVeil { position: absolute; inset: -30px; background: rgba(18,8,28,.55); backdrop-filter: blur(22px) saturate(1.3); -webkit-backdrop-filter: blur(22px) saturate(1.3); }
.lrSkLockCol { position: relative; z-index: 2; width: min(92vw, 400px); display: flex; flex-direction: column; align-items: center; gap: 14px; padding: 20px 0; }
.lrSkClock { margin: 0 0 8px; text-align: center; font-size: clamp(54px, 16vw, 76px); font-weight: 700; line-height: 1; letter-spacing: -.02em; animation: lrRise .6s ease both; }
.lrSkClock small { display: block; font-size: 15px; font-weight: 600; letter-spacing: 0; opacity: .85; margin-top: 8px; }
.lrSkNotif { width: 100%; display: flex; gap: 12px; align-items: center; padding: 12px 14px; border-radius: 22px; background: rgba(255,255,255,.84); color: #111; box-shadow: 0 18px 40px -20px rgba(0,0,0,.6); animation: lrSkDrop .55s cubic-bezier(.2,1.4,.4,1) .2s both; text-align: left; }
.lrSkNotif > div { flex: 1; min-width: 0; }
.lrSkNotifTop { margin: 0; display: flex; justify-content: space-between; font-size: 13px; }
.lrSkNotifTop span { color: #6B6E73; }
.lrSkNotifMsg { margin: 2px 0 0; font-size: 15px; font-weight: 600; }
.lrSkGate { width: 100%; background: #fff; color: #16191C; border-radius: 26px; padding: 18px 18px 4px; box-shadow: 0 24px 60px -24px rgba(0,0,0,.7); animation: lrPopIn .45s cubic-bezier(.2,1.4,.4,1) .45s both; }
.lrSkGateHead { position: relative; display: inline-block; margin-bottom: 6px; }
.lrSkGateSq { position: absolute; right: -4px; bottom: 2px; width: 18px; height: 18px; border-radius: 5px; background: ${RED}; border: 3px solid #fff; animation: lrSkPulse 1.4s ease-in-out infinite; }
.lrSkGate .lrGateKick { font-size: 12.5px; font-weight: 800; color: ${BLUE}; text-transform: lowercase; }
.lrSkGate .lrGateQ { font-size: 22px; line-height: 1.25; color: #16191C; margin: 6px 0 8px; }
.lrSkGate .lrGateNote { color: #6B6E73; opacity: 1; }
.lrSkGate .lrGateYes { width: 100%; height: 52px; border: 0; border-radius: 99px; background: ${YELLOW}; color: #111 !important; font-size: 17px; font-weight: 800; box-shadow: 0 10px 24px -10px rgba(230,200,0,.9); transition: transform .12s; }
.lrSkGate .lrGateYes:active { transform: scale(.96); }
.lrSkGate .lrGateNo { padding: 10px 20px; border-radius: 99px; border: 0; background: #F0F0F2; color: #5E6167 !important; font-size: 15px; font-weight: 700; }

/* chat row → press */
.lrSkChat { background: #fff; color: #16191C; padding: calc(16px + env(safe-area-inset-top, 0px)) 0 0; }
.lrSkChatHead { text-align: center; font-size: 20px; padding: 6px 0 14px; }
.lrSkRow { display: flex; align-items: center; gap: 12px; padding: 10px 16px; border-bottom: 1px solid #F3F3F4; max-width: 560px; margin: 0 auto; animation: lrRise .4s ease both; }
.lrSkRow.is-first { background: #FFF6F7; animation: lrSkRowPress 1.9s ease both; }
.lrSkRow.is-ghost { animation-delay: calc(var(--k) * 60ms); opacity: .7; }
.lrSkRowTx { flex: 1; display: flex; flex-direction: column; gap: 5px; min-width: 0; }
.lrSkRowTx b { font-size: 17px; }
.lrSkRowTx span { font-size: 13.5px; color: ${RED}; display: flex; align-items: center; gap: 4px; white-space: nowrap; }
.lrSkRowTx strong { font-weight: 800; }
.lrSkSq { display: inline-block; width: 13px; height: 13px; border-radius: 3px; background: ${RED}; animation: lrSkPulse 1.1s ease-in-out infinite; }
.lrSkSq.is-open { background: transparent; border: 2px solid ${RED}; animation: none; }
.lrSkBar { display: block; height: 10px; border-radius: 6px; background: #EFEFF1; }
.lrSkBar.is-thin { height: 8px; }
.lrSkTap { text-align: center; color: #8A8D91; font-size: 13px; font-weight: 700; margin-top: 18px; }
.lrSkPress { position: absolute; left: 50%; top: calc(110px + env(safe-area-inset-top, 0px)); width: 0; height: 0; }
.lrSkPress::after { content: ""; position: absolute; left: -40px; top: -40px; width: 80px; height: 80px; border-radius: 50%; background: rgba(242,60,87,.35); animation: lrSkRipple 1.2s ease-out .7s both; }

/* the snap */
.lrSkSnap { cursor: pointer; overflow: hidden; background: #000; }
.lrSkPhoto { position: absolute; inset: -3%; background: #222 center/cover no-repeat; animation: lrSkKen 9s ease-out both; }
.lrSkShade { position: absolute; inset: 0; background: linear-gradient(to bottom, rgba(0,0,0,.4), transparent 22%, transparent 70%, rgba(0,0,0,.4)); }
.lrSkCap { position: absolute; left: 0; right: 0; top: 56%; padding: 11px 20px; background: rgba(0,0,0,.56); text-align: center; font-size: clamp(16px, 4.4vw, 21px); line-height: 1.38; font-weight: 600; overflow-wrap: anywhere; animation: lrSkCapIn .45s cubic-bezier(.2,1,.3,1) both; }
.lrSkCap.is-big { top: 40%; background: none; font-size: clamp(34px, 10vw, 58px); font-weight: 800; line-height: 1.05; text-shadow: 0 4px 24px rgba(0,0,0,.45); }
@media (min-width: 900px) { .lrSkCap { left: 50%; right: auto; width: min(760px, 90vw); transform: translateX(-50%); border-radius: 14px; animation-name: lrSkCapInW; } .lrSkCap.is-big { width: 90vw; } }
.lrSkTop { position: absolute; top: calc(18px + env(safe-area-inset-top, 0px)); left: 14px; right: 64px; display: flex; align-items: center; gap: 10px; z-index: 3; }
.lrSkWho { flex: 1; display: flex; flex-direction: column; min-width: 0; text-shadow: 0 1px 4px rgba(0,0,0,.5); }
.lrSkWho b { font-size: 15px; }
.lrSkWho span { font-size: 12px; opacity: .85; font-weight: 600; }
.lrSkRing { transform: rotate(-90deg); flex: none; filter: drop-shadow(0 1px 3px rgba(0,0,0,.4)); }
.lrSkRing text { transform: rotate(90deg); transform-origin: 18px 18px; }
.lrSkRun { stroke-dasharray: 100; stroke-dashoffset: 0; animation: lrSkDeplete linear forwards; }
.lrSkRun.is-still { animation: none !important; }
.lrSkHint { position: absolute; left: 0; right: 0; bottom: calc(22px + env(safe-area-inset-bottom, 0px)); margin: 0; text-align: center; font-size: 13px; font-weight: 700; opacity: .75; animation: lrRise .5s ease 1.2s both; }

/* saved in chat */
.lrSkSaved { background: #fff; color: #16191C; }
.lrSkSavedCol { max-width: 620px; margin: 0 auto; padding: calc(64px + env(safe-area-inset-top, 0px)) 0 calc(48px + env(safe-area-inset-bottom, 0px)); }
.lrSkSavedHead { display: flex; align-items: center; gap: 12px; padding: 0 16px 14px; border-bottom: 1px solid #ECEDEE; animation: lrRise .4s ease both; }
.lrSkSavedHead b { display: block; font-size: 17px; }
.lrSkSavedHead span { font-size: 12.5px; color: #8A8D91; font-weight: 700; }
.lrSkSep { margin: 18px 0 8px; text-align: center; font-size: 11.5px; font-weight: 800; letter-spacing: .07em; color: #8A8D91; }
.lrSkName { margin: 0 16px 3px; font-size: 12px; font-weight: 900; color: ${BLUE}; letter-spacing: .03em; }
.lrSkMsgs { margin-left: 16px; border-left: 2.5px solid ${BLUE}; }
.lrSkMsg { padding: 7px 16px 7px 12px; background: #EFEFF1; font-size: 16.5px; line-height: 1.55; overflow-wrap: anywhere; animation: lrRise .5s ease calc(.15s + var(--d, 0) * .18s) both; }
.lrSkMsg + .lrSkMsg { border-top: 2px solid #fff; }
.lrSkMsg.is-snap { background: #fff; color: ${RED}; font-weight: 800; font-size: 14px; display: flex; align-items: center; gap: 8px; }
.lrSkSign { margin: 22px 20px 0; font: 700 30px/1.15 var(--font-lr-hand), "Caveat", cursive; color: #16191C; text-align: right; font-style: normal; }
.lrSkSign strong { color: ${RED}; font-size: 34px; }
.lrSkBadge { margin: 26px auto 0; width: fit-content; display: flex; flex-direction: column; align-items: center; gap: 2px; padding: 14px 26px; border-radius: 22px; background: linear-gradient(135deg, #FFF6B8, #FFB37A); color: #16191C; animation: lrPopIn .5s cubic-bezier(.2,1.5,.4,1) 1s both; }
.lrSkBadge span { font-size: 40px; animation: lrSkFlick 1.4s ease-in-out infinite; }
.lrSkBadge b { font-size: 17px; }
.lrSkBadge small { font-size: 12px; font-weight: 700; opacity: .7; }
.lrSkActs { display: flex; flex-direction: column; align-items: center; gap: 10px; margin-top: 22px; padding: 0 16px; animation: lrRise .5s ease 1.2s both; }
.lrSkKeep { min-width: 240px; height: 54px; border: 0; border-radius: 99px; background: ${YELLOW}; color: #111 !important; font-size: 16.5px; font-weight: 800; cursor: pointer; box-shadow: 0 12px 28px -12px rgba(230,200,0,.9); transition: transform .12s; }
.lrSkKeep:active { transform: scale(.96); }
.lrSkKeep.is-on { background: ${BLUE}; color: #fff !important; box-shadow: 0 12px 28px -12px rgba(14,173,255,.8); }
.lrSkReplay { border: 0; background: none; color: #5E6167 !important; font-weight: 700; font-size: 14px; cursor: pointer; padding: 8px; }

@keyframes lrSkDrop { from { opacity: 0; transform: translateY(-30px) scale(.96); } }
@keyframes lrSkPulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.18); } }
@keyframes lrSkRowPress { 0%, 55% { transform: scale(1); background: #FFF6F7; } 70% { transform: scale(.97); background: #FFE3E8; } 100% { transform: scale(1.02); background: #FFE3E8; } }
@keyframes lrSkRipple { from { transform: scale(.2); opacity: 1; } to { transform: scale(3.2); opacity: 0; } }
@keyframes lrSkKen { from { transform: scale(1.12); } to { transform: scale(1.02); } }
@keyframes lrSkCapIn { from { opacity: 0; transform: translateY(12px); } }
@keyframes lrSkCapInW { from { opacity: 0; transform: translate(-50%, 12px); } }
@keyframes lrSkDeplete { from { stroke-dashoffset: 0; } to { stroke-dashoffset: 100; } }
@keyframes lrSkFlick { 0%, 100% { transform: scale(1) rotate(-3deg); } 50% { transform: scale(1.1) rotate(3deg); } }
.lr--streak.is-reduced .lrSkPhoto, .lr--streak.is-reduced .lrSkRow.is-first { animation: none; }
`;
