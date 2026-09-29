"use client";

// ─── call: the letter arrives as a voicemail ────────────────────────────────
//
// The caller-ID app's assistant "screened" the call: a runaway-decline gate
// dressed as an incoming call, a beat of "connecting…", and then the letter
// plays as a live voicemail transcript — word by word, with a breathing
// waveform, a ticking timer, speed control and skip — over their photos. It
// ends the way every call with them ends: "Call ended · Duration: forever",
// hearts, and a Call back button that fires more hearts.

import { useEffect, useMemo, useRef, useState } from "react";
import { Confetti, Gate, Shell, bg, chunk, useBursts, usePhases, type VProps } from "../LetterReveal";

const initial = (s?: string) => (s?.trim()?.[0] ?? "♥").toUpperCase();
const clock = (ms: number) => {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};
const SPEEDS = [1, 1.5, 2] as const;

function Avatar({ src, name, size, cls = "" }: { src?: string; name?: string; size: number; cls?: string }) {
  return (
    <span className={`lrClAv ${cls}`} style={{ width: size, height: size, fontSize: size * 0.4, ...bg(src) }} aria-hidden>
      {!src && initial(name)}
    </span>
  );
}

function Tick({ size = 16 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden style={{ display: "inline-block", verticalAlign: "-2px", marginLeft: 6 }}>
      <path d="M12 2.5l2.4 1.8 3-.2.9 2.9 2.5 1.7-.9 2.9.9 2.9-2.5 1.7-.9 2.9-3-.2L12 21.5l-2.4-1.8-3 .2-.9-2.9-2.5-1.7.9-2.9-.9-2.9 2.5-1.7.9-2.9 3 .2z" fill="#F4C95D" />
      <path d="M8.3 12.2l2.5 2.5 5-5" fill="none" stroke="#2A1D05" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const PHONE = "M5.6 3.4c1.2-1 2.9-.8 3.7.4l1.5 2.1c.6.9.4 2.2-.6 2.8l-.8.5c.9 1.9 2.5 3.5 4.4 4.4l.5-.8c.6-1 1.9-1.2 2.8-.6l2.1 1.5c1.2.8 1.4 2.5.4 3.7l-.9 1c-1 1.1-2.6 1.4-3.9.8-5-2.1-9-6.1-11.1-11.1-.6-1.3-.3-2.9.8-3.9z";

export default function CallReveal(P: VProps) {
  const ph = usePhases(!!P.question, [2600], P.reduce, P.onRead);
  const from = P.from?.trim() || "Someone";
  const first = from.split(/\s+/)[0];
  const avatar = P.avatar || P.photos[0];

  const lines = useMemo(() => {
    const all = [P.greeting, ...P.paras].filter(Boolean).flatMap((t) => chunk(t, 150));
    return [...all, `${P.sign} ${from}`.trim()];
  }, [P.greeting, P.paras, P.sign, from]);
  const words = useMemo(() => lines.map((l) => l.split(/\s+/).filter(Boolean)), [lines]);
  const durs = useMemo(() => words.map((w) => 900 + w.length * 250), [words]);
  const starts = useMemo(() => durs.reduce<number[]>((a, _d, i) => [...a, i ? a[i - 1] + durs[i - 1] : 0], []), [durs]);
  const total = starts.length ? starts[starts.length - 1] + durs[durs.length - 1] : 1;

  const [t, setT] = useState(P.reduce ? total : 0);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(0);
  const [seek, setSeek] = useState(0);
  const [called, setCalled] = useState(false);
  const [bursts, fire] = useBursts();
  const listRef = useRef<HTMLOListElement>(null);
  const live = ph.p >= ph.n;
  const ended = t >= total;

  useEffect(() => {
    if (!live || !playing || ended) return;
    let last = performance.now();
    let at = t;
    const rate = SPEEDS[speed];
    const id = window.setInterval(() => {
      const now = performance.now();
      at = Math.min(total, at + (now - last) * rate);
      last = now;
      setT(at);
    }, 80);
    return () => window.clearInterval(id);
    // `t` seeds the clock only when playback (re)starts, changes speed or seeks.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [live, playing, ended, total, speed, seek]);

  let idx = starts.findIndex((s, i) => t >= s && t < s + durs[i]);
  if (idx === -1) idx = t >= total ? lines.length - 1 : 0;
  const shownWords = ended ? words[idx].length : Math.max(1, Math.ceil(((t - starts[idx]) / durs[idx]) * words[idx].length));

  // Keep the line being spoken in view, inside the transcript only.
  useEffect(() => {
    const list = listRef.current;
    const el = list?.children[idx] as HTMLElement | undefined;
    if (!list || !el) return;
    list.scrollTo({ top: Math.max(0, el.offsetTop - list.clientHeight * 0.45), behavior: P.reduce ? "auto" : "smooth" });
  }, [idx, P.reduce]);

  const jump = (ms: number) => {
    setT(Math.max(0, Math.min(total, ms)));
    setSeek((k) => k + 1);
    setPlaying(true);
  };
  const photo = P.photos.length ? P.photos[idx % P.photos.length] : avatar;

  return (
    <Shell P={P} dark label={`A voicemail from ${from}`}>
      <style>{CSS}</style>

      {ph.p === -1 && (
        <div className="lrClRing">
          {avatar && <div className="lrClBlur" style={bg(avatar)} />}
          <div className="lrClShade" />
          <div className="lrClRingTop">
            <p className="lrClPill">✓ Sacch Assistant screened this call</p>
            <Avatar src={avatar} name={from} size={104} cls="lrClAv--ring" />
            <h2 className="lrClName">{from}<Tick size={22} /></h2>
            <p className="lrClSub">calling {P.to || "you"} · 0% spam · verified</p>
          </div>
          <Gate
            cls="lrClGate"
            kicker="Before you pick up"
            question={P.question}
            yes={P.answer}
            no="Decline"
            onYes={ph.pass}
          />
        </div>
      )}

      {ph.p === 0 && (
        <div className="lrClRing">
          {avatar && <div className="lrClBlur" style={bg(avatar)} />}
          <div className="lrClShade" />
          <div className="lrClRingTop lrClMid">
            <span className="lrClAvWrap">
              <span className="lrClRipple" aria-hidden><i /><i /><i /></span>
              <Avatar src={avatar} name={from} size={120} cls="lrClAv--ring" />
            </span>
            <h2 className="lrClName">{from}<Tick size={22} /></h2>
            <p className="lrClSub lrClDots">1 new voicemail · connecting<span>.</span><span>.</span><span>.</span></p>
            <p className="lrClPriv">🔒 private · only for {P.to || "you"}</p>
          </div>
        </div>
      )}

      {live && (
        <div className="lrCl">
          <div className="lrClBack" aria-hidden>
            {photo && <div key={photo} className="lrClBlur lrClKen" style={bg(photo)} />}
            <div className="lrClShade" />
          </div>

          <div className="lrClCol">
            <header className="lrClHead">
              <Avatar src={avatar} name={from} size={46} />
              <div className="lrClWho">
                <b>{from}<Tick size={15} /></b>
                <small><i className={playing && !ended ? "is-live" : ""} /> Voicemail · {clock(Math.min(t, total))} / {clock(total)}</small>
              </div>
              <button type="button" className="lrClSpeed" onClick={() => setSpeed((s) => (s + 1) % SPEEDS.length)} aria-label={`Playback speed ${SPEEDS[speed]}x`}>
                {SPEEDS[speed]}×
              </button>
            </header>

            <div className="lrClHero" aria-hidden>
              <span className="lrClAvWrap">
                <span className={`lrClRipple${playing && !ended ? "" : " is-still"}`}><i /><i /><i /></span>
                <Avatar src={avatar} name={from} size={104} cls="lrClAv--ring" />
              </span>
              <p>Voicemail from {first}{P.to ? ` · for ${P.to}` : ""}</p>
            </div>

            <div className={`lrClWave${playing && !ended ? " is-on" : ""}`} aria-hidden>
              {Array.from({ length: 44 }, (_, i) => (
                <i
                  key={i}
                  className={i / 44 <= t / total ? "is-done" : ""}
                  style={{ height: `${22 + ((i * 47) % 78)}%`, animationDelay: `${((i * 131) % 800) / 1000}s` }}
                />
              ))}
            </div>

            <ol className="lrClTx" ref={listRef} data-lr-scroll aria-live="polite">
              {lines.map((l, i) => {
                if (i > idx) return null;
                const isSign = i === lines.length - 1;
                const text = i === idx ? words[i].slice(0, shownWords).join(" ") : l;
                return (
                  <li key={i} className={`lrClLine${i === idx ? " is-now" : ""}${isSign ? " is-sign" : ""}${i === 0 && P.greeting ? " is-hi" : ""}`}>
                    <button type="button" onClick={() => jump(starts[i])}>
                      {!isSign && <time>{clock(starts[i])}</time>}
                      <span>
                        {text}
                        {i === idx && !ended && shownWords < words[i].length && <em className="lrClCaret" aria-hidden />}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>

            <div className="lrClCtl">
              <button type="button" className="lrClMini" onClick={() => jump(starts[Math.max(0, idx - 1)])} aria-label="Previous line">
                <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden><path d="M6 5v14M19 5.5v13L9 12z" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /></svg>
              </button>
              <button type="button" className="lrClPlay" onClick={() => (ended ? jump(0) : setPlaying((v) => !v))} aria-label={ended ? "Play again" : playing ? "Pause" : "Play"}>
                {ended ? (
                  <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden><path d="M12 5V2L7 6l5 4V7a5 5 0 1 1-5 5H5a7 7 0 1 0 7-7z" fill="currentColor" /></svg>
                ) : playing ? (
                  <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden><path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" fill="currentColor" /></svg>
                ) : (
                  <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden><path d="M8 5v14l11-7z" fill="currentColor" /></svg>
                )}
              </button>
              <button type="button" className="lrClMini" onClick={() => jump(idx + 1 < lines.length ? starts[idx + 1] : total)} aria-label="Next line">
                <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden><path d="M18 5v14M5 5.5v13L15 12z" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /></svg>
              </button>
            </div>
          </div>

          {ended && (
            <div className="lrClEnd" role="status">
              <Confetti n={34} colors={["#F4C95D", "#FF5C93", "#4ADE95", "#FFFFFF"]} />
              <div className="lrClEndCard">
                <p className="lrClEndK">Call ended · {clock(total)}</p>
                <Avatar src={avatar} name={from} size={72} cls="lrClAv--ring" />
                <h3>Duration: forever <span>∞</span></h3>
                <p className="lrClEndS">{called ? `Ringing… ${first} picked up on the first ring. Obviously.` : `${first} is still on the line. They always are.`}</p>
                <div className="lrClEndBtns">
                  <button type="button" className="lrClBack2" onClick={() => jump(0)}>Play again</button>
                  <button
                    type="button"
                    className="lrClCallBack"
                    onClick={() => {
                      setCalled(true);
                      fire(50, 42);
                      window.setTimeout(() => fire(30, 60), 180);
                      window.setTimeout(() => fire(70, 58), 340);
                    }}
                  >
                    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden><path d={PHONE} fill="currentColor" /></svg>
                    Call back ❤️
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      {bursts}
    </Shell>
  );
}

const SF = `-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, system-ui, sans-serif`;
const HAND = `var(--font-lr-hand), "Caveat", "Segoe Print", cursive`;

const CSS = `
.lr--call { font-family: ${SF}; background: #07090C; color: #fff; }
.lrClAv { position: relative; display: inline-grid; place-items: center; flex: none; border-radius: 50%; color: #fff; font-weight: 700;
  background: linear-gradient(135deg, #1DA362, #F4C95D) center/cover no-repeat; }
.lrClAv--ring { box-shadow: 0 0 0 4px rgba(7,9,12,.6), 0 0 0 7px #F4C95D, 0 18px 44px -12px rgba(244,201,93,.6); }
.lrClBlur { position: absolute; inset: -60px; background: #1b2229 center/cover no-repeat; filter: blur(40px) saturate(1.3) brightness(.62); }
.lrClKen { animation: lrClFadeIn 1.2s ease both; }
.lrClShade { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(7,9,12,.55), rgba(7,9,12,.35) 40%, rgba(7,9,12,.92)); }

/* gate + connecting */
.lrClRing { display: flex; flex-direction: column; align-items: center; justify-content: space-between; padding: calc(64px + env(safe-area-inset-top, 0px)) 18px calc(14px + env(safe-area-inset-bottom, 0px)); overflow: hidden; }
.lrClRingTop { position: relative; z-index: 2; display: grid; justify-items: center; text-align: center; gap: 8px; }
.lrClMid { margin: auto 0; }
.lrClPill { margin: 0 0 18px; padding: 6px 12px; border-radius: 99px; font-size: 12px; font-weight: 700; color: #CFE9DA; background: rgba(29,163,98,.18); border: 1px solid rgba(74,222,149,.3); animation: lrRise .5s both; }
.lrClName { margin: 14px 0 0; font-size: clamp(28px, 8vw, 38px); font-weight: 700; letter-spacing: -.02em; overflow-wrap: anywhere; animation: lrRise .6s .1s both; }
.lrClSub { margin: 0; font-size: 15px; color: rgba(255,255,255,.75); animation: lrRise .6s .2s both; }
.lrClPriv { margin: 10px 0 0; font-size: 12.5px; color: rgba(255,255,255,.55); }
.lrClDots span { animation: lrClDot 1.2s infinite; }
.lrClDots span:nth-child(2) { animation-delay: .2s; } .lrClDots span:nth-child(3) { animation-delay: .4s; }
.lrClAvWrap { position: relative; display: grid; place-items: center; }
.lrClRipple { position: absolute; inset: 0; pointer-events: none; }
.lrClRipple i { position: absolute; inset: 0; border-radius: 50%; border: 2px solid rgba(244,201,93,.6); animation: lrClRip 2s ease-out infinite; }
.lrClRipple i:nth-child(2) { animation-delay: .65s; } .lrClRipple i:nth-child(3) { animation-delay: 1.3s; }
.lrClGate { width: min(100%, 420px); padding: 18px 16px 0; border-radius: 26px; background: rgba(16,20,26,.82); border: 1px solid rgba(244,201,93,.3); box-shadow: 0 30px 60px -24px rgba(0,0,0,.9); animation: lrUp .5s .15s cubic-bezier(.2,1,.3,1) both; }
.lrClGate .lrGateKick { font-size: 11px; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; color: #F4C95D; }
.lrClGate .lrGateQ { font-size: 21px; line-height: 1.28; }
.lrClGate .lrGateYes { display: inline-flex; align-items: center; justify-content: center; gap: 8px; width: 100%; padding: 16px; border: none; border-radius: 99px; background: linear-gradient(145deg, #2BC47A, #148A4B); color: #fff; font-weight: 800; font-size: 17px; animation: lrClGlow 1.8s ease-in-out infinite; }
.lrClGate .lrGateNo { padding: 11px 22px; border: none; border-radius: 99px; background: #E5484D; color: #fff; font-weight: 700; font-size: 14px; box-shadow: 0 10px 22px -10px rgba(229,72,77,.9); }

/* live voicemail */
.lrCl { overflow: hidden; }
.lrClBack { position: absolute; inset: 0; overflow: hidden; }
.lrClCol { position: absolute; inset: 0; z-index: 2; display: flex; flex-direction: column; width: 100%; max-width: 620px; margin: 0 auto; padding: calc(14px + env(safe-area-inset-top, 0px)) 16px calc(18px + env(safe-area-inset-bottom, 0px)); }
.lrClHead { display: flex; align-items: center; gap: 11px; padding-right: 50px; animation: lrRise .5s both; }
.lrClWho { min-width: 0; flex: 1; display: grid; gap: 1px; }
.lrClWho b { font-size: 16.5px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.lrClWho small { display: inline-flex; align-items: center; gap: 6px; font-size: 12.5px; color: rgba(255,255,255,.72); font-variant-numeric: tabular-nums; }
.lrClWho small i { width: 7px; height: 7px; border-radius: 50%; background: #9AA4AE; }
.lrClWho small i.is-live { background: #FF4D5E; animation: lrClPing 1.4s infinite; }
.lrClSpeed { flex: none; min-width: 48px; height: 34px; border-radius: 99px; border: 1px solid rgba(255,255,255,.2); background: rgba(255,255,255,.08); font-weight: 800; font-size: 13px; cursor: pointer; }
.lrClHero { display: none; }
@media (min-height: 760px) {
  .lrClHero { display: grid; justify-items: center; gap: 14px; margin: 30px 0 0; animation: lrRise .6s both; }
  .lrClHero p { margin: 0; font-size: 13px; font-weight: 600; color: rgba(255,255,255,.7); letter-spacing: .01em; }
}
.lrClRipple.is-still i { animation: none; opacity: 0; }
.lrClWave { display: flex; align-items: center; gap: 3px; height: 64px; margin: 20px 4px 12px; }
.lrClWave i { flex: 1; border-radius: 99px; background: rgba(255,255,255,.22); transform: scaleY(.3); transition: background .3s; }
.lrClWave i.is-done { background: linear-gradient(180deg, #4ADE95, #F4C95D); }
.lrClWave.is-on i { animation: lrClBar .8s ease-in-out infinite alternate; }
.lrClTx { list-style: none; margin: 0; padding: 6px 2px 30px; flex: 1; min-height: 0; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; scrollbar-width: none; overscroll-behavior: contain;
  -webkit-mask-image: linear-gradient(180deg, transparent, #000 6%, #000 88%, transparent); mask-image: linear-gradient(180deg, transparent, #000 6%, #000 88%, transparent); }
.lrClTx::-webkit-scrollbar { display: none; }
.lrClLine { animation: lrClMsg .45s cubic-bezier(.2,1,.3,1) both; }
.lrClLine button { display: flex; gap: 10px; align-items: flex-start; width: 100%; padding: 11px 13px; border: 0; border-radius: 4px 18px 18px 18px; background: rgba(255,255,255,.08); text-align: left; cursor: pointer; opacity: .62; transition: opacity .4s, background .4s; }
.lrClLine.is-now button { opacity: 1; background: rgba(29,163,98,.22); box-shadow: inset 0 0 0 1px rgba(74,222,149,.3); }
.lrClLine time { flex: none; margin-top: 4px; font-size: 11px; font-weight: 700; color: #4ADE95; font-variant-numeric: tabular-nums; }
.lrClLine span { font-size: 17px; line-height: 1.5; overflow-wrap: anywhere; }
.lrClLine.is-hi span { font-family: ${HAND}; font-size: 27px; line-height: 1.2; color: #F4C95D; }
.lrClLine.is-sign button { background: transparent; box-shadow: none; justify-content: flex-end; text-align: right; }
.lrClLine.is-sign span { font-family: ${HAND}; font-size: 26px; line-height: 1.25; color: #F4C95D; }
.lrClCaret { display: inline-block; width: 2px; height: 1em; margin-left: 3px; vertical-align: -2px; background: #4ADE95; animation: lrClBlink .8s steps(1) infinite; }
.lrClCtl { display: flex; justify-content: center; align-items: center; gap: 28px; padding-top: 10px; }
.lrClMini { width: 48px; height: 48px; border-radius: 50%; border: 0; background: rgba(255,255,255,.1); display: grid; place-items: center; cursor: pointer; }
.lrClPlay { width: 70px; height: 70px; border-radius: 50%; border: 0; display: grid; place-items: center; cursor: pointer; color: #2A1D05 !important; background: linear-gradient(135deg, #FCE7A8, #F4C95D 55%, #D9A13B); box-shadow: 0 16px 36px -14px rgba(244,201,93,.85); transition: transform .15s; }
.lrClPlay:active { transform: scale(.92); }
.lrClEnd { position: absolute; inset: 0; z-index: 5; display: grid; place-items: end center; background: rgba(0,0,0,.4); animation: lrClFadeIn .4s both; padding: 0 12px calc(12px + env(safe-area-inset-bottom, 0px)); }
.lrClEndCard { position: relative; z-index: 2; width: min(100%, 440px); display: grid; justify-items: center; gap: 8px; text-align: center; padding: 22px 20px 20px; border-radius: 28px; background: #12171D; border: 1px solid rgba(244,201,93,.32); box-shadow: 0 30px 70px -20px #000; animation: lrUp .55s cubic-bezier(.2,1.1,.3,1) both; }
@media (min-width: 700px) { .lrClEnd { place-items: center; } }
.lrClEndK { margin: 0 0 6px; font-size: 12.5px; color: #9AA4AE; font-variant-numeric: tabular-nums; }
.lrClEndCard h3 { margin: 10px 0 0; font-size: 26px; font-weight: 800; letter-spacing: -.01em; }
.lrClEndCard h3 span { color: #F4C95D; }
.lrClEndS { margin: 0; font-size: 14px; line-height: 1.45; color: rgba(255,255,255,.74); max-width: 320px; }
.lrClEndBtns { display: flex; gap: 10px; width: 100%; margin-top: 12px; }
.lrClEndBtns button { flex: 1; min-height: 50px; border-radius: 99px; border: 0; font-weight: 800; font-size: 15px; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 7px; }
.lrClBack2 { background: rgba(255,255,255,.1); }
.lrClCallBack { background: linear-gradient(145deg, #2BC47A, #148A4B); box-shadow: 0 14px 30px -12px rgba(29,163,98,.9); }
@media (min-width: 900px) { .lrClLine span { font-size: 18px; } .lrClCol { padding-top: 40px; } }
@keyframes lrClRip { from { transform: scale(1); opacity: .9; } to { transform: scale(1.9); opacity: 0; } }
@keyframes lrClDot { 0%, 100% { opacity: .2; } 50% { opacity: 1; } }
@keyframes lrClBar { from { transform: scaleY(.2); } to { transform: scaleY(1); } }
@keyframes lrClMsg { from { opacity: 0; transform: translateY(12px) scale(.97); } }
@keyframes lrClBlink { 50% { opacity: 0; } }
@keyframes lrClPing { 0% { box-shadow: 0 0 0 0 rgba(255,77,94,.7); } 100% { box-shadow: 0 0 0 8px rgba(255,77,94,0); } }
@keyframes lrClFadeIn { from { opacity: 0; } }
@keyframes lrClGlow { 0%, 100% { box-shadow: 0 14px 30px -12px rgba(29,163,98,.9), 0 0 0 0 rgba(74,222,149,.45); } 50% { box-shadow: 0 14px 30px -12px rgba(29,163,98,.9), 0 0 0 10px rgba(74,222,149,0); } }
.lr--call.is-reduced *, .lr--call.is-reduced *::before { animation-duration: .01ms !important; animation-iteration-count: 1 !important; }
@media (prefers-reduced-motion: reduce) { .lr--call * { animation-duration: .01ms !important; animation-iteration-count: 1 !important; } }
`;
