"use client";

// ─── Catch — results + the finale ────────────────────────────────────────────
//
// LEVEL COMPLETE, stars, a score that counts up, NEW BEST, the stats tiles, the
// memories caught, and then the letter assembling itself from the pieces they
// caught — every missed piece still there, blurred, one tap from readable.
// Nothing is ever withheld; the game only decides what order it arrives in.

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { cropStyle, photoCrop } from "../../dedication/components/types";
import type { LovePhoto } from "../../_love/types";
import type { RunResult } from "./engine";
import type { ScoreRow } from "./storage";
import type { CatchData } from "./types";

function useCountUp(to: number, ms: number, run: boolean) {
  const [v, setV] = useState(run ? 0 : to);
  useEffect(() => {
    if (!run) return;
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const k = Math.min(1, (t - t0) / ms);
      setV(Math.round(to * (1 - Math.pow(1 - k, 3))));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, ms, run]);
  return v;
}

export default function Results({
  data,
  result,
  newBest,
  board,
  reduced,
  hasLetter,
  onLetter,
  onAgain,
}: {
  data: CatchData;
  /** null = they skipped the game to just read it. */
  result: RunResult | null;
  newBest: boolean;
  board: ScoreRow[];
  reduced: boolean;
  hasLetter: boolean;
  onLetter: () => void;
  onAgain: () => void;
}) {
  const [revealed, setRevealed] = useState<Set<number>>(() => new Set());
  const [peek, setPeek] = useState<LovePhoto | null>(null);
  const score = useCountUp(result?.score ?? 0, 1400, !!result && !reduced);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, []);

  const caught = new Set(result ? result.pieces : data.goodItems.map((_, i) => i));
  const caughtPh = new Set(result ? result.photos : data.photos.map((_, i) => i));
  const totalBits = data.goodItems.length + data.photos.length;
  const got = caught.size + caughtPh.size;
  const ratio = totalBits ? got / totalBits : 1;
  const stars = !result ? 3 : ratio >= 0.9 ? 3 : ratio >= 0.55 ? 2 : 1;
  const outOfHearts = result?.reason === "hearts";

  const head = !result ? "the whole letter" : outOfHearts ? "so close!" : ratio >= 0.999 ? "PERFECT RUN!" : "LEVEL COMPLETE!";
  const sub = !result
    ? `every piece, no joystick required`
    : outOfHearts
      ? "out of hearts 💔 — but nothing's lost. read it all below."
      : `${data.recipientName || "you"} caught ${got} of ${totalBits}`;

  const sender = data.senderName || "me";
  const rows: { name: string; score: number; you?: boolean; dev?: boolean }[] = [
    { name: `${sender} (made this game)`, score: 99999, dev: true },
    ...board.map((b) => ({ name: data.recipientName || "you", score: b.score, you: !!result && b.score === result.score })),
  ].slice(0, 6);

  return (
    <div className="ct-results" ref={scrollRef}>
      <div className="ct-resHead">
        <div className="ct-stars" aria-label={`${stars} of 3 stars`}>
          {[0, 1, 2].map((i) => (
            <span key={i} className={`ct-star${i < stars ? " is-on" : ""}`} style={{ "--i": i } as CSSProperties}>
              ★
            </span>
          ))}
        </div>
        <h2 className="ct-resTitle">{head}</h2>
        <p className="ct-resSub">{sub}</p>
        {result && (
          <div className="ct-resScore">
            <span className="ct-resScoreN">{score.toLocaleString("en-IN")}</span>
            <span className="ct-resScoreL">score</span>
            {newBest && <span className="ct-newBest">NEW BEST!</span>}
          </div>
        )}
      </div>

      {result && (
        <div className="ct-tiles">
          <div className="ct-tile"><b>💌 {caught.size}/{data.goodItems.length}</b><span>letter pieces</span></div>
          {data.photos.length > 0 && <div className="ct-tile"><b>📸 {caughtPh.size}/{data.photos.length}</b><span>memories</span></div>}
          <div className="ct-tile"><b>🔥 {result.maxCombo}×</b><span>best combo</span></div>
          <div className="ct-tile"><b>💗 {result.hearts}</b><span>hearts</span></div>
        </div>
      )}

      <div className="ct-resActs">
        {hasLetter && (
          <button type="button" className="ct-btn ct-btn--pink ct-resLetter" onClick={onLetter}>
            💌 open your letter
          </button>
        )}
        <button type="button" className="ct-btn ct-btn--grape" onClick={onAgain}>
          ↻ {result ? "play again" : "play the game"}
        </button>
      </div>

      {data.photos.length > 0 && (
        <section className="ct-card">
          <h3 className="ct-cardT">memories caught</h3>
          <div className="ct-gallery">
            {data.photos.map((p, i) => {
              const ok = caughtPh.has(i);
              return (
                <button
                  key={i}
                  type="button"
                  className={`ct-gPol${ok ? "" : " is-missed"}`}
                  style={{ "--r": `${((i % 3) - 1) * 3}deg` } as CSSProperties}
                  onClick={() => setPeek(p)}
                  aria-label={ok ? `Open memory: ${p.caption || i + 1}` : `Missed memory — peek anyway`}
                >
                  <span className="ct-gPic">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.url} alt="" draggable={false} style={cropStyle(photoCrop(p))} />
                  </span>
                  <span className="ct-gCap">{ok ? p.caption || "♥" : "missed · peek"}</span>
                </button>
              );
            })}
          </div>
        </section>
      )}

      <section className="ct-paper">
        <p className="ct-paperKick">your letter, assembled</p>
        <p className="ct-paperTo">{data.recipientName ? `${data.recipientName},` : "hey you,"}</p>
        <ol className="ct-lines">
          {data.goodItems.map((g, i) => {
            const ok = caught.has(i) || revealed.has(i);
            return (
              <li key={g.id || i} className={`ct-lineRow${ok ? "" : " is-missed"}`} style={{ "--i": i } as CSSProperties}>
                <span className="ct-lineEmoji" aria-hidden>{g.emoji}</span>
                {ok ? (
                  <span className="ct-lineTx">
                    {g.line}
                    {!caught.has(i) && <em className="ct-late">caught late 😌</em>}
                  </span>
                ) : (
                  <button type="button" className="ct-lineHidden" onClick={() => setRevealed((s) => new Set(s).add(i))}>
                    <span className="ct-blur" aria-hidden>{g.line}</span>
                    <span className="ct-tapRev">missed this one · tap to read it anyway</span>
                  </button>
                )}
              </li>
            );
          })}
        </ol>
        <p className="ct-closing">{data.closingLine}</p>
        <p className="ct-signed">— {sender} 💗</p>
      </section>

      {result && (
        <section className="ct-card">
          <h3 className="ct-cardT">🏆 high scores</h3>
          <ol className="ct-board">
            {rows.map((r, i) => (
              <li key={i} className={`${r.you ? "is-you" : ""}${r.dev ? " is-dev" : ""}`}>
                <span className="ct-rank">{i + 1}</span>
                <span className="ct-bName">{r.name}</span>
                <span className="ct-bScore">{r.dev ? "∞" : r.score.toLocaleString("en-IN")}</span>
              </li>
            ))}
          </ol>
          <p className="ct-boardNote">scores live on this phone only. {sender} is not beatable, sorry, that&apos;s the rules.</p>
        </section>
      )}

      <div style={{ height: 96 }} />

      {peek && (
        <div className="ct-photoPop" role="dialog" aria-modal="true" aria-label={peek.caption || "A memory"} onClick={() => setPeek(null)}>
          <div className="ct-ppCard" onClick={(e) => e.stopPropagation()}>
            <div className="ct-ppPic">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={peek.url} alt={peek.caption || "a memory"} draggable={false} style={cropStyle(photoCrop(peek))} />
            </div>
            {peek.caption && <p className="ct-ppCap">{peek.caption}</p>}
            {peek.note && <p className="ct-ppNote">{peek.note}</p>}
            <button type="button" className="ct-btn ct-btn--pink ct-ppGo" onClick={() => setPeek(null)} autoFocus>
              close ♥
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
