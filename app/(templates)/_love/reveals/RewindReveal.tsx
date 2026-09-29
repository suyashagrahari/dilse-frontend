"use client";

// ─── rewind: the letter is the hidden bonus track ───────────────────────────
//
// Found at the end of the Rewind, under the summary card. The gate is dressed
// as a locked hidden track; then a vinyl slides out of its sleeve ("Bonus
// track"); then the letter plays full-screen in the music app's lyrics view —
// big bold lines on the album colour, the current line filling word by word
// karaoke-style, sung lines white, upcoming lines dark — with the photo as the
// album art, a scrubber, play/pause and tap-a-line-to-seek. When the last line
// lands it closes on a summary card: the photo, the couple aura, the minutes.
//
// Props used beyond the basics: `title` = the couple aura name, `handle` =
// "N minutes together" (both passed by the Rewind template).

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { Confetti, Gate, Shell, bg, chunk, usePhases, type VProps } from "../LetterReveal";

const FONT = `var(--font-rw), "Figtree", "Helvetica Neue", Helvetica, Arial, system-ui, sans-serif`;
const GREEN = "#1ED760";
const clock = (ms: number) => {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

export default function RewindReveal(P: VProps) {
  const ph = usePhases(!!P.question, [2300], P.reduce, P.onRead);
  const from = P.from?.trim() || "Someone";
  const to = P.to?.trim() || "you";
  const art = P.photos[0] || P.avatar;
  const art2 = P.photos[1] || art;
  const live = ph.p >= ph.n;

  const lines = useMemo(() => {
    const all = [P.greeting, ...P.paras].filter(Boolean).flatMap((t) => chunk(t, 64));
    return [...all, `${P.sign} ${from}`.trim()];
  }, [P.greeting, P.paras, P.sign, from]);
  const words = useMemo(() => lines.map((l) => l.split(/\s+/).filter(Boolean)), [lines]);
  const durs = useMemo(() => words.map((w) => 1100 + w.length * 340), [words]);
  const starts = useMemo(() => durs.reduce<number[]>((a, _d, i) => [...a, i ? a[i - 1] + durs[i - 1] : 0], []), [durs]);
  const total = (starts[starts.length - 1] ?? 0) + (durs[durs.length - 1] ?? 1);

  const [t, setT] = useState(P.reduce ? total : 0);
  const [playing, setPlaying] = useState(true);
  const [seek, setSeek] = useState(0);
  const [liked, setLiked] = useState(false);
  const [card, setCard] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const ended = t >= total;

  useEffect(() => {
    if (!live || !playing || ended) return;
    let last = performance.now();
    let at = t;
    const id = window.setInterval(() => {
      const now = performance.now();
      at = Math.min(total, at + (now - last));
      last = now;
      setT(at);
    }, 60);
    return () => window.clearInterval(id);
    // `t` seeds the clock only when playback (re)starts or seeks.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [live, playing, ended, total, seek]);

  // The last line lands → a beat → the summary card.
  useEffect(() => {
    if (!ended || !live) return;
    const id = window.setTimeout(() => setCard(true), P.reduce ? 0 : 1400);
    return () => window.clearTimeout(id);
  }, [ended, live, P.reduce, seek]);

  let idx = starts.findIndex((s, i) => t >= s && t < s + durs[i]);
  if (idx === -1) idx = ended ? lines.length - 1 : 0;
  const frac = ended ? 1 : Math.min(1, (t - starts[idx]) / (durs[idx] * 0.86));

  useEffect(() => {
    const box = listRef.current;
    const el = box?.querySelector<HTMLElement>(`[data-l="${idx}"]`);
    if (!box || !el) return;
    box.scrollTo({ top: Math.max(0, el.offsetTop - box.clientHeight * 0.3), behavior: P.reduce ? "auto" : "smooth" });
  }, [idx, P.reduce, live]);

  const jump = (ms: number) => {
    setCard(false);
    setT(Math.max(0, Math.min(total, ms)));
    setSeek((k) => k + 1);
    setPlaying(true);
  };

  const vars = { "--rr-a": P.accent2 || "#FF4FB4" } as CSSProperties;

  return (
    <Shell P={P} dark label={`Bonus track: a letter from ${from}`}>
      <style>{CSS}</style>

      {ph.p === -1 && (
        <div className="rrGateBg" style={vars}>
          {art && <div className="rrBlur" style={bg(art)} />}
          <div className="rrShade" />
          <div className="rrGateCard">
            <div className="rrGateArt" style={bg(art)}>
              <span className="rrLock" aria-hidden>
                <svg viewBox="0 0 24 24" width="26" height="26"><path d="M7 10V7.5a5 5 0 0 1 10 0V10h1a1.5 1.5 0 0 1 1.5 1.5v8A1.5 1.5 0 0 1 18 21H6a1.5 1.5 0 0 1-1.5-1.5v-8A1.5 1.5 0 0 1 6 10zm2 0h6V7.5a3 3 0 0 0-6 0z" fill="#fff" /></svg>
              </span>
            </div>
            <Gate
              cls="rrGate"
              kicker={<>HIDDEN TRACK · {from.toUpperCase()}</>}
              question={P.question}
              note="Answer to unlock the bonus track."
              yes={P.answer}
              no="Skip"
              onYes={ph.pass}
            />
          </div>
        </div>
      )}

      {ph.p === 0 && (
        <div className="rrSting" style={vars}>
          <div className="rrSleeve" style={bg(art)}>
            <div className="rrDisc"><span style={bg(art2)} /></div>
          </div>
          <p className="rrStingK">BONUS TRACK</p>
          <h2 className="rrStingT">a letter</h2>
          <p className="rrStingS">{from} · Rewind</p>
        </div>
      )}

      {live && (
        <div className="rr" style={vars}>
          <div className="rrTop">
            <span className="rrTopTx"><small>PLAYING FROM REWIND</small><b>Bonus track</b></span>
          </div>

          <div className="rrBody">
            <aside className="rrSide">
              <div className="rrArt" style={bg(art)}>{!art && <span>♥</span>}</div>
              <div className="rrMeta">
                <span><b>a letter</b><small>{from}</small></span>
                <button type="button" className={`rrLike ${liked ? "is-on" : ""}`} onClick={() => setLiked((v) => !v)} aria-label="Like">
                  <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden><path d="M12 20.3S3.5 15.2 3.5 9.1A4.6 4.6 0 0 1 12 6.6a4.6 4.6 0 0 1 8.5 2.5c0 6.1-8.5 11.2-8.5 11.2z" fill={liked ? GREEN : "none"} stroke={liked ? GREEN : "currentColor"} strokeWidth="1.9" strokeLinejoin="round" /></svg>
                </button>
              </div>
            </aside>

            <div className="rrLyrics" ref={listRef} data-lr-scroll>
              {lines.map((l, i) => (
                <p key={i} data-l={i} className={`rrLine ${i < idx ? "is-past" : i === idx ? "is-now" : ""}`} onClick={() => jump(starts[i])}>
                  {i === idx ? <span className="rrKara" style={{ "--f": `${Math.round(frac * 100)}%` } as CSSProperties}>{l}</span> : l}
                </p>
              ))}
              <div className="rrPad" />
            </div>
          </div>

          <div className="rrBar">
            <div className="rrScrub">
              <span>{clock(t)}</span>
              <span className="rrTrack" onClick={(e) => { const r = e.currentTarget.getBoundingClientRect(); jump(((e.clientX - r.left) / r.width) * total); }}>
                <i style={{ width: `${(t / total) * 100}%` }} />
              </span>
              <span>-{clock(total - t)}</span>
            </div>
            <div className="rrCtl">
              <button type="button" onClick={() => jump(starts[Math.max(0, idx - 1)])} aria-label="Previous line">
                <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden><path d="M6.3 3H4v18h2.3zM20 4.2v15.6a.8.8 0 0 1-1.2.7L8 12.7a.8.8 0 0 1 0-1.4l10.8-7.8a.8.8 0 0 1 1.2.7z" fill="currentColor" /></svg>
              </button>
              <button type="button" className="rrPlay" onClick={() => (ended ? jump(0) : setPlaying((p) => !p))} aria-label={playing && !ended ? "Pause" : "Play"}>
                {playing && !ended ? (
                  <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden><rect x="5.5" y="4" width="4.2" height="16" rx="1" fill="currentColor" /><rect x="14.3" y="4" width="4.2" height="16" rx="1" fill="currentColor" /></svg>
                ) : (
                  <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden><path d="M7 4.4v15.2a.8.8 0 0 0 1.2.7l12.4-7.6a.8.8 0 0 0 0-1.4L8.2 3.7A.8.8 0 0 0 7 4.4z" fill="currentColor" /></svg>
                )}
              </button>
              <button type="button" onClick={() => jump(idx + 1 < lines.length ? starts[idx + 1] : total)} aria-label="Next line">
                <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden><path d="M17.7 3h2.3v18h-2.3zM4 4.2v15.6a.8.8 0 0 0 1.2.7L16 12.7a.8.8 0 0 0 0-1.4L5.2 3.5a.8.8 0 0 0-1.2.7z" fill="currentColor" /></svg>
              </button>
            </div>
          </div>

          {card && (
            <div className="rrEnd">
              <Confetti n={36} colors={[GREEN, "#FF4FB4", "#CDF564", "#fff", P.accent2 || "#FFC864"]} />
              <div className="rrEndCard">
                <div className="rrEndArt" style={bg(art)} />
                <p className="rrEndK">THAT&apos;S A WRAP · REWIND</p>
                <h3>For {to}, from {from}</h3>
                <div className="rrEndGrid">
                  {P.handle && <div><small>Together</small><b>{P.handle}</b></div>}
                  {P.title && <div><small>Couple aura</small><b>{P.title}</b></div>}
                  <div><small>Bonus track</small><b>a letter · {clock(total)}</b></div>
                  <div><small>Plays</small><b>∞ (on repeat)</b></div>
                </div>
                <div className="rrEndBtns">
                  <button type="button" className="rrBtnW" onClick={() => jump(0)}>Play again</button>
                  <button type="button" className="rrBtnG" onClick={() => setCard(false)}>Read the lyrics</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </Shell>
  );
}

const CSS = `
.lr--rewind { background: #121212; font-family: ${FONT}; }
.lr--rewind .lrX { background: rgba(0,0,0,.35); color: #fff; }
.rrGateBg, .rrSting, .rr { position: absolute; inset: 0; }
.rrBlur { position: absolute; inset: -60px; background: center/cover no-repeat; filter: blur(40px) brightness(.5) saturate(1.3); }
.rrShade { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(0,0,0,.2), #121212 90%); }
.rrGateBg { display: grid; place-items: center; padding: 20px; overflow-y: auto; }
.rrGateCard { position: relative; z-index: 2; display: grid; justify-items: center; gap: 16px; width: min(92vw, 400px); }
.rrGateArt { width: 180px; height: 180px; border-radius: 6px; background: #282828 center/cover no-repeat; box-shadow: 0 24px 60px -20px #000; display: grid; place-items: center; animation: lrRise .6s cubic-bezier(.2,1,.3,1) both; }
.rrLock { width: 56px; height: 56px; border-radius: 50%; background: rgba(0,0,0,.55); display: grid; place-items: center; }
.rrGate { width: 100% !important; color: #fff; }
.rrGate .lrGateKick { font-size: 11px; font-weight: 800; letter-spacing: .16em; color: ${GREEN}; }
.rrGate .lrGateQ { font-size: 26px; font-weight: 900; letter-spacing: -.035em; line-height: 1.12; }
.rrGate .lrGateNote { color: #b3b3b3; opacity: 1; }
.rrGate .lrGateYes { padding: 14px 34px; border-radius: 99px; border: 0; background: ${GREEN}; color: #000 !important; font-weight: 800; font-size: 16px; box-shadow: 0 12px 26px -10px rgba(30,215,96,.7); }
.rrGate .lrGateNo { padding: 10px 20px; border-radius: 99px; border: 1.5px solid rgba(255,255,255,.35); background: transparent; color: #fff; font-weight: 700; font-size: 14px; }

.rrSting { display: grid; place-content: center; justify-items: center; gap: 6px; background: radial-gradient(circle at 50% 40%, color-mix(in srgb, var(--rr-a) 55%, #121212), #000 75%); text-align: center; overflow: hidden; }
.rrSleeve { position: relative; width: 190px; height: 190px; border-radius: 4px; background: #282828 center/cover no-repeat; box-shadow: 0 24px 50px -16px #000; margin-bottom: 26px; animation: rrSleeve 2.3s cubic-bezier(.2,1,.3,1) both; }
.rrDisc { position: absolute; top: 6px; left: 6px; width: 178px; height: 178px; border-radius: 50%; z-index: -1; background: repeating-radial-gradient(circle, #111 0 3px, #1d1d1d 3px 6px); display: grid; place-items: center; animation: rrDisc 2.3s cubic-bezier(.2,1,.3,1) both; }
.rrDisc span { width: 36%; height: 36%; border-radius: 50%; background: var(--rr-a) center/cover no-repeat; box-shadow: 0 0 0 4px var(--rr-a); }
.rrStingK { margin: 0; font-size: 12px; font-weight: 900; letter-spacing: .3em; color: ${GREEN}; animation: lrRise .5s .4s both; }
.rrStingT { margin: 0; font-size: 58px; font-weight: 900; letter-spacing: -.06em; line-height: .95; color: #fff; animation: rrSlam .7s .6s cubic-bezier(.2,1.3,.4,1) both; }
.rrStingS { margin: 0; color: #b3b3b3; font-weight: 600; animation: lrRise .5s .9s both; }

.rr { display: flex; flex-direction: column; background: linear-gradient(180deg, color-mix(in srgb, var(--rr-a) 78%, #000) 0%, color-mix(in srgb, var(--rr-a) 62%, #000) 100%); color: #fff; animation: lrIn .4s ease both; }
.rrTop { display: flex; justify-content: center; padding: calc(14px + env(safe-area-inset-top, 0px)) 60px 6px; }
.rrTopTx { display: grid; text-align: center; }
.rrTopTx small { font-size: 10.5px; letter-spacing: .14em; font-weight: 800; opacity: .8; }
.rrTopTx b { font-size: 14px; font-weight: 800; }
.rrBody { flex: 1; min-height: 0; display: flex; flex-direction: column; width: 100%; max-width: 1100px; margin: 0 auto; }
.rrSide { display: flex; align-items: center; gap: 12px; padding: 8px 22px 6px; }
.rrArt { width: 52px; height: 52px; flex: none; border-radius: 4px; background: #282828 center/cover no-repeat; box-shadow: 0 8px 20px -8px #000; display: grid; place-items: center; font-size: 22px; }
.rrMeta { flex: 1; min-width: 0; display: flex; align-items: center; gap: 8px; }
.rrMeta span { flex: 1; display: grid; min-width: 0; }
.rrMeta b { font-size: 16px; font-weight: 800; }
.rrMeta small { font-size: 13.5px; opacity: .78; }
.rrLike { width: 44px; height: 44px; border: 0; background: transparent; color: #fff; display: grid; place-items: center; cursor: pointer; }
.rrLike.is-on { animation: rrPop .4s cubic-bezier(.2,1.6,.4,1); }
.rrLyrics { flex: 1; min-height: 0; overflow-y: auto; padding: 18px 22px 0; -webkit-mask-image: linear-gradient(180deg, transparent 0, #000 7%, #000 85%, transparent 100%); mask-image: linear-gradient(180deg, transparent 0, #000 7%, #000 85%, transparent 100%); }
.rrLine { margin: 0 0 16px; font-size: clamp(24px, 6.4vw, 38px); font-weight: 900; line-height: 1.18; letter-spacing: -.03em; color: rgba(0,0,0,.62); cursor: pointer; transition: color .35s ease, transform .35s ease; transform-origin: left center; overflow-wrap: anywhere; }
.rrLine.is-past { color: rgba(255,255,255,.62); }
.rrLine.is-now { transform: scale(1.02); }
.rrLine:hover { color: rgba(255,255,255,.85); }
.rrKara { background: linear-gradient(90deg, #fff var(--f), rgba(0,0,0,.62) var(--f)); -webkit-background-clip: text; background-clip: text; color: transparent; }
.rrPad { height: 40vh; }
.rrBar { padding: 10px 22px calc(18px + env(safe-area-inset-bottom, 0px)); width: 100%; max-width: 760px; margin: 0 auto; }
.rrScrub { display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: 10px; font-size: 11.5px; font-variant-numeric: tabular-nums; opacity: .85; }
.rrTrack { position: relative; height: 4px; border-radius: 4px; background: rgba(255,255,255,.3); cursor: pointer; }
.rrTrack i { position: absolute; left: 0; top: 0; bottom: 0; border-radius: 4px; background: #fff; }
.rrCtl { display: flex; align-items: center; justify-content: center; gap: 34px; margin-top: 10px; }
.rrCtl button { border: 0; background: transparent; color: #fff; cursor: pointer; display: grid; place-items: center; width: 48px; height: 48px; }
.rrCtl .rrPlay { width: 64px; height: 64px; border-radius: 50%; background: #fff; color: #000; transition: transform .15s; }
.rrCtl .rrPlay:hover { transform: scale(1.06); }

.rrEnd { position: absolute; inset: 0; z-index: 5; display: grid; place-items: center; padding: 20px; background: rgba(0,0,0,.6); overflow-y: auto; animation: lrIn .3s ease both; }
.rrEndCard { position: relative; z-index: 2; width: min(92vw, 380px); border-radius: 14px; padding: 18px 18px 20px; background: linear-gradient(160deg, ${GREEN}, var(--rr-a)); color: #000; text-align: center; box-shadow: 0 30px 80px -20px #000; animation: rrCard .6s cubic-bezier(.2,1.2,.4,1) both; }
.rrEndArt { width: 150px; height: 150px; margin: 4px auto 14px; border-radius: 6px; background: #282828 center/cover no-repeat; transform: rotate(-3deg); box-shadow: 0 16px 34px -12px rgba(0,0,0,.6); }
.rrEndK { margin: 0; font-size: 11px; font-weight: 900; letter-spacing: .18em; }
.rrEndCard h3 { margin: 4px 0 12px; font-size: 26px; font-weight: 900; letter-spacing: -.04em; line-height: 1.05; }
.rrEndGrid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px 12px; text-align: left; padding: 12px; border-radius: 10px; background: rgba(255,255,255,.35); }
.rrEndGrid small { display: block; font-size: 11px; font-weight: 700; opacity: .75; }
.rrEndGrid b { font-size: 14.5px; font-weight: 900; letter-spacing: -.02em; line-height: 1.15; overflow-wrap: anywhere; }
.rrEndBtns { display: grid; gap: 8px; margin-top: 14px; }
.rrBtnW, .rrBtnG { min-height: 46px; border-radius: 99px; border: 0; cursor: pointer; font: 800 15px ${FONT}; }
.rr .rrBtnW { background: #000; color: #fff; }
.rr .rrBtnG { background: transparent; color: #000; box-shadow: inset 0 0 0 1.5px rgba(0,0,0,.5); }

@media (min-width: 900px) {
  .rrBody { flex-direction: row; gap: 48px; padding: 20px 40px 0; }
  .rrSide { flex-direction: column; align-items: stretch; width: 340px; flex: none; padding: 20px 0; justify-content: center; }
  .rrArt { width: 340px; height: 340px; border-radius: 8px; font-size: 80px; }
  .rrMeta b { font-size: 26px; letter-spacing: -.03em; }
  .rrLyrics { padding-top: 40px; }
  .rrLine { font-size: 40px; margin-bottom: 20px; }
}
@keyframes rrSleeve { 0% { opacity: 0; transform: translateY(40px) scale(.8); } 30% { opacity: 1; transform: none; } 100% { transform: translateX(-40px); } }
@keyframes rrDisc { 0%, 30% { transform: translateX(0) rotate(0); } 100% { transform: translateX(96px) rotate(300deg); } }
@keyframes rrSlam { from { opacity: 0; transform: scale(1.6); } }
@keyframes rrPop { 50% { transform: scale(1.35); } }
@keyframes rrCard { from { opacity: 0; transform: translateY(40px) scale(.9); } }
.lr.is-reduced .rr *, .lr.is-reduced .rrSting * { animation: none !important; transition: none !important; }
`;
