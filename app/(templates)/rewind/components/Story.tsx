"use client";

// ─── Rewind — the year-in-review story ───────────────────────────────────────
//
// Full-bleed colour cards, oversized type, kinetic shapes, progress segments
// at the top. Tap right for next, left for back, press and hold to pause,
// swipe down to leave. On a wide screen the story is a centred 9:16 card over a
// blurred photo, with arrow buttons and the keyboard arrows.
//
// Every card sizes its type in container units (cqw) of the story frame, so
// the phone, the tablet card and the desktop card are the same composition at
// different sizes. Backgrounds cut hard — no cross-fade — because the hard cut
// between two saturated colours is the whole signature of the format.
//
// It ends on the summary card: the thing you share. Under it, the hidden
// "bonus track" — the main letter.

import React from "react";
import { exportNodeToPng, fileSlug } from "@/lib/exportPng";
import { unlockAudio } from "@/lib/webAudio";
import { useStoryMachine } from "./useStoryMachine";
import { sfxAdvance, sfxReveal } from "./rewindAudio";
import { fmt, type Year } from "./derive";
import { C, FONT, HeartMark, Pic } from "./theme";
import { IBack, IClose, IFwd, ILock, IPause, IPlay, IReplay, IShare, IVolume } from "./icons";
import type { SlideDef } from "./slideTypes";
import type { LovePhoto, RewindData } from "./types";

// ─── helpers ────────────────────────────────────────────────────────────────

function useReduced(): boolean {
  const [r, setR] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!mq) return;
    const on = () => setR(mq.matches);
    on();
    mq.addEventListener?.("change", on);
    return () => mq.removeEventListener?.("change", on);
  }, []);
  return r;
}

/** Rolls a number up from zero, decelerating hard at the end. */
function Count({ to, ms = 1800, delay = 250, reduced }: { to: number; ms?: number; delay?: number; reduced: boolean }) {
  const [v, setV] = React.useState(reduced ? to : 0);
  React.useEffect(() => {
    if (reduced) { setV(to); return; }
    let raf = 0;
    const t0 = performance.now() + delay;
    const step = (t: number) => {
      const k = Math.min(1, Math.max(0, (t - t0) / ms));
      const e = k === 1 ? 1 : 1 - Math.pow(2, -10 * k);
      setV(Math.round(to * e));
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [to, ms, delay, reduced]);
  return <span style={{ fontVariantNumeric: "tabular-nums" }}>{fmt(v)}</span>;
}

/** Font size (cqw) so the longest word of `text` fits the card width. */
const fitCqw = (text: string, base: number, k = 150) => {
  const longest = Math.max(1, ...text.split(/\s+/).map((w) => w.length));
  return `${Math.min(base, k / longest).toFixed(2)}cqw`;
};

const d = (ms: number): React.CSSProperties => ({ animationDelay: `${ms}ms` });

/** Floating geometry. Deterministic per card; transform-only animation. */
function Shapes({ set, color, color2 }: { set: number; color: string; color2?: string }) {
  const c2 = color2 ?? color;
  const L = [
    [
      { t: "circle", x: -12, y: 8, s: 46, c: color, a: "rwFloat" },
      { t: "pill", x: 64, y: 72, s: 50, c: c2, a: "rwSpin" },
      { t: "star", x: 74, y: 6, s: 22, c: c2, a: "rwSpinR" },
    ],
    [
      { t: "ring", x: 58, y: -10, s: 60, c: color, a: "rwSpin" },
      { t: "star", x: 4, y: 74, s: 26, c: c2, a: "rwSpin" },
      { t: "circle", x: 70, y: 82, s: 18, c: c2, a: "rwFloat" },
    ],
    [
      { t: "squig", x: -6, y: 70, s: 70, c: color, a: "rwFloat" },
      { t: "circle", x: 72, y: 4, s: 36, c: c2, a: "rwFloat" },
      { t: "star", x: 80, y: 60, s: 16, c: color, a: "rwSpinR" },
    ],
    [
      { t: "pill", x: -18, y: 2, s: 56, c: color, a: "rwSpinR" },
      { t: "ring", x: 60, y: 70, s: 54, c: c2, a: "rwSpin" },
    ],
  ][set % 4];
  return (
    <div className="rwShapes" aria-hidden>
      {L.map((s, i) => (
        <span key={i} className={`rwShape ${s.a}`} style={{ left: `${s.x}%`, top: `${s.y}%`, width: `${s.s}cqw`, height: `${s.s}cqw`, animationDelay: `${i * -2.3}s` }}>
          <svg viewBox="0 0 100 100" width="100%" height="100%" className="rwPop" style={d(80 + i * 120)}>
            {s.t === "circle" && <circle cx="50" cy="50" r="50" fill={s.c} />}
            {s.t === "ring" && <circle cx="50" cy="50" r="40" fill="none" stroke={s.c} strokeWidth="16" />}
            {s.t === "pill" && <rect x="0" y="30" width="100" height="40" rx="20" fill={s.c} />}
            {s.t === "star" && <path d="M50 0l9 36 36-9-27 25 27 26-36-9-9 31-9-31-36 9 27-26L5 27l36 9z" fill={s.c} />}
            {s.t === "squig" && <path d="M5 60c10-30 20-30 30 0s20 30 30 0 20-30 30 0" fill="none" stroke={s.c} strokeWidth="12" strokeLinecap="round" />}
          </svg>
        </span>
      ))}
    </div>
  );
}

const cover = (photos: LovePhoto[], i: number) => (photos.length ? photos[i % photos.length] : undefined);

// ─── the deck ───────────────────────────────────────────────────────────────

const PAL: Record<string, [string, string]> = {
  intro: ["#000000", "#FFFFFF"],
  date: ["#FF4FB4", "#1A0014"],
  minutes: ["#CDF564", "#0B0B0B"],
  seasons: ["#2D46B9", "#FFFFFF"],
  genre: ["#F59B23", "#1F0F00"],
  songs: ["#1E3264", "#FFFFFF"],
  topsong: ["#AF2896", "#FFFFFF"],
  places: ["#509BF5", "#061A33"],
  reasons: ["#E8115B", "#FFFFFF"],
  moments: ["#121212", "#FFFFFF"],
  jokes: ["#7358FF", "#FFFFFF"],
  fan: ["#FFC864", "#1A1200"],
  buildup: ["#000000", "#FFFFFF"],
  aura: ["#0B0B14", "#FFFFFF"],
  outro: ["#FF6437", "#FFFFFF"],
};

export function buildDeck(data: RewindData, y: Year): SlideDef[] {
  const has: Record<string, boolean> = {
    genre: y.genres.length > 0,
    songs: y.songs.length > 1,
    topsong: y.songs.length > 0,
    places: y.places.length > 0,
    reasons: y.reasons.length > 0,
    moments: data.photos.length > 0,
    jokes: y.jokes.length > 0,
  };
  const order: [string, number][] = [
    ["intro", 5000], ["date", 5200], ["minutes", 6500], ["seasons", 5500], ["genre", 6000],
    ["songs", 8500], ["topsong", 6000], ["places", 7500], ["reasons", 9000], ["moments", 6500],
    ["jokes", 9000], ["fan", 6500], ["buildup", 2600], ["aura", 8500], ["outro", 5000],
  ];
  return order
    .filter(([k]) => has[k] !== false)
    .map(([kind, durationMs]) => ({ kind, key: kind, durationMs, bg: PAL[kind][0], fg: PAL[kind][1] }));
}

// ─── the cards ──────────────────────────────────────────────────────────────

function Card({ def, data, y, reduced }: { def: SlideDef; data: RewindData; y: Year; reduced: boolean }) {
  const s = y.stats;
  const P = data.photos;
  switch (def.kind) {
    case "intro":
      return (
        <div className="rwCard rwCenter">
          <div className="rwMarquee" aria-hidden>
            {[0, 1, 2, 3, 4].map((r) => (
              <div key={r} className={`rwMq ${r % 2 ? "rwMqR" : ""}`} style={{ color: r === 2 ? C.lime : undefined }}>
                <span>REWIND {y.year} · REWIND {y.year} · REWIND {y.year} · </span>
                <span>REWIND {y.year} · REWIND {y.year} · REWIND {y.year} · </span>
              </div>
            ))}
          </div>
          <div className="rwIntroBox">
            <p className="rwKick rwUp" style={d(200)}>Your {y.year} Rewind</p>
            <h2 className="rwHuge rwUp" style={{ ...d(350), fontSize: fitCqw(`Hey ${y.to}.`, 17, 170) }}>Hey {y.to}.</h2>
            <p className="rwBody rwUp" style={d(700)}>
              It&apos;s been a year. {y.from} kept the receipts.<br />Let&apos;s rewind it.
            </p>
          </div>
        </div>
      );
    case "date":
      return (
        <div className="rwCard">
          <Shapes set={0} color="#1A0014" color2={C.lime} />
          <div className="rwStack rwBottom">
            <p className="rwKick rwUp" style={d(150)}>It all started on a</p>
            <h2 className="rwHuge rwSlam" style={{ ...d(350), fontSize: fitCqw(s.startWeekday + ".", 24, 132) }}>{s.startWeekday}.</h2>
            <p className="rwBody rwUp" style={d(900)}>
              {s.startDateLabel} {y.startYear}. The day the playlist started — and nobody pressed stop.
            </p>
          </div>
        </div>
      );
    case "minutes":
      return (
        <div className="rwCard">
          <Shapes set={1} color="#0B0B0B" color2="#FF4FB4" />
          <div className="rwStack rwMid">
            <p className="rwKick rwUp" style={d(100)}>{y.to}, you two spent</p>
            <h2 className="rwHuge rwUp" style={{ ...d(250), fontSize: fitCqw(fmt(y.minutes), 20, 118) }}>
              <Count to={y.minutes} reduced={reduced} />
            </h2>
            <p className="rwBig rwUp" style={d(500)}>minutes together.</p>
            <p className="rwBody rwUp" style={d(1500)}>
              That&apos;s {fmt(s.days)} days. {s.isEarly ? "It's early. That's the good part." : "Longer than any album. Better than all of them."}
            </p>
          </div>
        </div>
      );
    case "seasons": {
      const chips = s.isEarly
        ? [`${fmt(s.hours)} hours`, `${fmt(s.days)} days`, "0 skips"]
        : [
            s.winters > 0 && `${s.winters} ${s.winters === 1 ? "winter" : "winters"}`,
            s.monsoons > 0 && `${s.monsoons} ${s.monsoons === 1 ? "monsoon" : "monsoons"}`,
            s.diwalis > 0 && `${s.diwalis} ${s.diwalis === 1 ? "Diwali" : "Diwalis"}`,
            s.holis > 0 && `${s.holis} ${s.holis === 1 ? "Holi" : "Holis"}`,
            `${fmt(s.hours)} hours`,
          ].filter(Boolean) as string[];
      return (
        <div className="rwCard">
          <Shapes set={2} color={C.lime} color2="#FF4FB4" />
          <div className="rwStack rwMid">
            <p className="rwKick rwUp" style={d(100)}>Together through</p>
            <div className="rwChips">
              {chips.map((c, i) => (
                <span key={c} className="rwChip rwPop" style={{ ...d(300 + i * 260), transform: `rotate(${(i % 2 ? 1 : -1) * (2 + i)}deg)` }}>{c}</span>
              ))}
            </div>
            <p className="rwBody rwUp" style={d(400 + chips.length * 260)}>
              {s.isEarly ? "It's early. That's the good part." : "Every season, same person on repeat."}
            </p>
          </div>
        </div>
      );
    }
    case "genre":
      return (
        <div className="rwCard">
          <div className="rwVinyl rwSpin" aria-hidden><i /><i /><i /></div>
          <div className="rwStack rwTop">
            <p className="rwKick rwUp" style={d(100)}>Your top genre was</p>
            <h2 className="rwHuge rwSlam" style={{ ...d(300), fontSize: fitCqw(y.genres[0], 15, 120), lineHeight: 0.92 }}>{y.genres[0]}</h2>
          </div>
          {y.genres.length > 1 && (
            <ol className="rwGenres">
              {y.genres.slice(1).map((g, i) => (
                <li key={g} className="rwLeft" style={d(1100 + i * 220)}>
                  <b>#{i + 2}</b><span>{g}</span>
                </li>
              ))}
            </ol>
          )}
        </div>
      );
    case "songs":
      return (
        <div className="rwCard rwPad">
          <p className="rwKick rwUp" style={d(80)}>Your top songs</p>
          <div className="rwTopArt rwPop" style={d(200)}>
            <Pic photo={cover(P, 0)} label={y.songs[0].title} style={{ width: "100%", height: "100%" }} />
            <span className="rwRank">1</span>
          </div>
          <ol className="rwList">
            {y.songs.slice(0, 5).map((sg, i) => (
              <li key={i} className="rwLeft" style={d(500 + i * 240)}>
                <b className="rwNum">{i + 1}</b>
                <Pic photo={cover(P, i)} label={sg.title} className="rwThumb" />
                <span className="rwLi"><strong>{sg.title}</strong>{sg.artist && <small>{sg.artist}</small>}</span>
              </li>
            ))}
          </ol>
        </div>
      );
    case "topsong": {
      const sg = y.songs[0];
      return (
        <div className="rwCard rwCenter">
          <Shapes set={3} color="#FF4FB4" color2={C.lime} />
          <p className="rwKick rwUp" style={d(80)}>Your #1 song</p>
          <div className="rwDisc rwPop" style={d(200)}>
            <div className="rwDiscSpin">
              <span className="rwDiscLabel"><Pic photo={cover(P, 0)} label={sg.title} style={{ width: "100%", height: "100%", borderRadius: "50%" }} /></span>
            </div>
          </div>
          <h2 className="rwBig rwUp" style={{ ...d(600), fontSize: fitCqw(sg.title, 11, 110), textAlign: "center" }}>{sg.title}</h2>
          {sg.artist && <p className="rwBody rwUp" style={{ ...d(750), textAlign: "center", marginTop: 0 }}>{sg.artist}</p>}
          <p className="rwPill rwPop" style={d(1200)}>played <Count to={y.plays} delay={1200} reduced={reduced} /> times</p>
        </div>
      );
    }
    case "places":
      return (
        <div className="rwCard rwPad">
          <Shapes set={1} color="#061A33" color2="#FFC864" />
          <p className="rwKick rwUp" style={d(80)}>Your top places</p>
          <h2 className="rwBig rwUp" style={{ ...d(200), marginBottom: "4cqw" }}>where you two happened.</h2>
          <ol className="rwList rwListBig">
            {y.places.slice(0, 5).map((pl, i) => (
              <li key={i} className="rwLeft" style={d(500 + i * 260)}>
                <b className="rwNum">{i + 1}</b>
                <Pic photo={cover(P, i + 1)} label={pl} className="rwThumb" />
                <span className="rwLi"><strong>{pl}</strong></span>
              </li>
            ))}
          </ol>
        </div>
      );
    case "reasons": {
      const rs = y.reasons.slice(0, 5);
      return (
        <div className="rwCard rwPad">
          <p className="rwKick rwUp" style={d(80)}>On repeat</p>
          <h2 className="rwBig rwUp" style={{ ...d(200), marginBottom: "3cqw" }}>{rs.length} things about you {y.from} never skips</h2>
          <ol className="rwReasons">
            {rs.map((r, i) => (
              <li key={i} className="rwLeft" style={d(600 + i * 750)}>
                <b>{String(rs.length - i).padStart(2, "0")}</b>
                <span>{r}</span>
              </li>
            ))}
          </ol>
        </div>
      );
    }
    case "moments": {
      const ph = P.slice(0, 5);
      return (
        <div className="rwCard">
          <div className="rwStack rwTop" style={{ zIndex: 3 }}>
            <p className="rwKick rwUp" style={d(80)}>Your top moments</p>
            <h2 className="rwBig rwUp" style={d(200)}>Liked. Saved. Replayed.</h2>
          </div>
          <div className="rwPile">
            {ph.map((p, i) => (
              <figure key={i} className="rwPolar rwDrop" style={{ ...d(400 + i * 420), "--r": `${[-8, 6, -3, 9, -5][i]}deg`, left: `${[8, 30, 14, 36, 20][i]}%`, top: `${[0, 10, 26, 34, 18][i]}%` } as React.CSSProperties}>
                <Pic photo={p} style={{ width: "100%", aspectRatio: "1 / 1" }} />
                {p.caption && <figcaption>{p.caption}</figcaption>}
              </figure>
            ))}
          </div>
        </div>
      );
    }
    case "jokes":
      return (
        <div className="rwCard rwPad">
          <Shapes set={0} color="#5B3FF0" color2={C.lime} />
          <p className="rwKick rwUp" style={d(80)}>The numbers nobody asked for</p>
          <div className="rwJokes">
            {y.jokes.map((j, i) => {
              const n = Number(j.value.replace(/,/g, ""));
              return (
                <div key={j.key || i} className="rwJoke rwUp" style={d(300 + i * 1500)}>
                  <small>{j.label}</small>
                  <b style={{ fontSize: fitCqw(j.value, 17, 90) }}>{Number.isFinite(n) && /^\d[\d,]*$/.test(j.value) ? <Count to={n} delay={300 + i * 1500} ms={1100} reduced={reduced} /> : j.value}</b>
                  {j.sub && <span className="rwJokeSub">{j.sub}</span>}
                </div>
              );
            })}
          </div>
        </div>
      );
    case "fan":
      return (
        <div className="rwCard rwCenter">
          <Shapes set={2} color="#1A1200" color2="#FF4FB4" />
          <div className="rwFanPic rwPop" style={d(150)}>
            <Pic photo={cover(P, 0)} label={y.to} style={{ width: "100%", height: "100%", borderRadius: "50%" }} />
            <span className="rwStamp rwStampIn" style={d(1300)}>#1 FAN</span>
          </div>
          <p className="rwKick rwUp" style={{ ...d(400), textAlign: "center" }}>{y.to}, you were in the</p>
          <h2 className="rwHuge rwSlam" style={{ ...d(600), fontSize: "20cqw", textAlign: "center" }}>top 0.01%</h2>
          <p className="rwBig rwUp" style={{ ...d(900), textAlign: "center" }}>of {y.from}&apos;s fans.</p>
          <p className="rwBody rwUp" style={{ ...d(1600), textAlign: "center" }}>{data.fanLine.trim() || `Nobody has replayed ${y.from} more. Nobody is even close.`}</p>
        </div>
      );
    case "buildup":
      return (
        <div className="rwCard rwCenter">
          <div className="rwOrb" aria-hidden />
          <p className="rwBig rwUp" style={{ ...d(100), textAlign: "center", position: "relative" }}>One more thing.</p>
          <p className="rwBody rwUp" style={{ ...d(700), textAlign: "center", position: "relative" }}>We worked out what kind of couple you are.</p>
        </div>
      );
    case "aura":
      return (
        <div className="rwCard">
          <div className="rwAura" aria-hidden>
            <i style={{ background: y.aura.a }} />
            <i style={{ background: y.aura.b }} />
            <i style={{ background: y.aura.a }} />
          </div>
          <div className="rwStack rwMid" style={{ position: "relative" }}>
            <p className="rwKick rwUp" style={d(150)}>Your couple aura</p>
            <h2 className="rwHuge rwSlam" style={{ ...d(500), fontSize: fitCqw(y.archetype.name, 14, 120), lineHeight: 0.9 }}>{y.archetype.name}</h2>
            <div className="rwAuraWords rwUp" style={d(1100)}>
              <span>{y.aura.words[0]}</span><span>{y.aura.words[1]}</span>
            </div>
            <p className="rwBody rwUp" style={d(1500)}>{y.archetype.line}</p>
          </div>
        </div>
      );
    case "outro":
      return (
        <div className="rwCard rwCenter">
          <Shapes set={3} color="#FFC864" color2="#1A0014" />
          <h2 className="rwHuge rwUp" style={{ ...d(150), fontSize: fitCqw(data.closingLine, 14, 120), textAlign: "center", lineHeight: 0.95 }}>{data.closingLine}</h2>
          <p className="rwBody rwUp" style={{ ...d(800), textAlign: "center" }}>Thanks for listening, {y.to}.<br />— {y.from}</p>
        </div>
      );
    default:
      return null;
  }
}

// ─── the summary card ───────────────────────────────────────────────────────

function Summary({
  data,
  y,
  hasLetter,
  onBonus,
  onReplay,
  shareUrl,
}: {
  data: RewindData;
  y: Year;
  hasLetter: boolean;
  onBonus: () => void;
  onReplay: () => void;
  shareUrl?: string;
}) {
  const cardRef = React.useRef<HTMLDivElement>(null);
  const [msg, setMsg] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const flash = (m: string) => { setMsg(m); window.setTimeout(() => setMsg(""), 3200); };

  const save = async () => {
    const node = cardRef.current;
    if (!node || busy) return;
    setBusy(true);
    const r = await exportNodeToPng(node, { width: node.offsetWidth, height: node.offsetHeight, filename: `rewind-${fileSlug(data.recipientName)}`, backgroundColor: y.aura.a, pixelRatio: 3 });
    setBusy(false);
    flash(r.message);
  };
  const share = async () => {
    const url = shareUrl || window.location.href;
    try {
      if (typeof navigator.share === "function") {
        await navigator.share({ title: `${y.to}'s ${y.year} Rewind`, text: `${fmt(y.minutes)} minutes together. Couple aura: ${y.archetype.name}.`, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      flash("Link copied ✓");
    } catch (e) {
      if ((e as DOMException)?.name !== "AbortError") void save();
    }
  };

  return (
    <div className="rwSum">
      <div ref={cardRef} className="rwSumCard" style={{ background: `linear-gradient(160deg, ${y.aura.a}, ${y.aura.b})` }}>
        <div className="rwSumTop">
          <div className="rwSumArt">
            <Pic photo={data.photos[0]} label={y.to} style={{ width: "100%", height: "100%" }} />
          </div>
          <div className="rwSumBlob" aria-hidden />
        </div>
        <div className="rwSumCols">
          <div>
            <h4>Top Songs</h4>
            <ol>{(y.songs.length ? y.songs.map((s) => s.title) : y.reasons.map((r) => r.split(" ").slice(0, 3).join(" "))).slice(0, 5).map((t, i) => <li key={i}><b>{i + 1}</b><span>{t}</span></li>)}</ol>
          </div>
          <div>
            <h4>{y.places.length ? "Top Places" : "On Repeat"}</h4>
            <ol>{(y.places.length ? y.places : y.reasons).slice(0, 5).map((t, i) => <li key={i}><b>{i + 1}</b><span>{t}</span></li>)}</ol>
          </div>
        </div>
        <div className="rwSumCols">
          <div><h4>Minutes Together</h4><p className="rwSumBig">{fmt(y.minutes)}</p></div>
          <div><h4>{y.genres.length ? "Top Genre" : "Days"}</h4><p className="rwSumMid">{y.genres[0] || fmt(y.stats.days)}</p></div>
        </div>
        <div className="rwSumAura"><h4>Couple Aura</h4><p>{y.archetype.name}</p></div>
        <div className="rwSumFoot">
          <span className="rwSumMark"><HeartMark size={16} color="#000" cut="#fff" /> Lovify</span>
          <span>REWIND {y.year} · {y.to.toUpperCase()} &amp; {y.from.toUpperCase()}</span>
        </div>
      </div>

      <div className="rwSumBtns">
        <button type="button" className="rwBtnW" onClick={() => void share()}><IShare size={18} /> Share this story</button>
        {hasLetter && (
          <button type="button" className="rwBonus" onClick={onBonus}>
            <span className="rwBonusArt"><Pic photo={data.photos[1] ?? data.photos[0]} label="bonus" style={{ width: "100%", height: "100%" }} /><ILock size={14} /></span>
            <span className="rwBonusTx"><small>HIDDEN · TRACK {buildCount(y) + 1}</small><b>Bonus track: a letter</b></span>
            <span className="rwBonusPlay"><IPlay size={16} /></span>
          </button>
        )}
        <div className="rwSumRow">
          <button type="button" className="rwBtnG" onClick={onReplay}><IReplay size={16} /> Replay</button>
          <button type="button" className="rwBtnG" onClick={() => void save()} disabled={busy}>{busy ? "Saving…" : "Save image"}</button>
        </div>
        <p className="rwSumMsg" aria-live="polite">{msg}</p>
      </div>
    </div>
  );
}
const buildCount = (y: Year) => Math.max(5, y.songs.length + y.places.length + y.reasons.length);

// ─── the story shell ────────────────────────────────────────────────────────

export default function Story({
  data,
  y,
  onClose,
  hasLetter,
  onBonus,
  shareUrl,
}: {
  data: RewindData;
  y: Year;
  onClose: () => void;
  hasLetter: boolean;
  onBonus: () => void;
  shareUrl?: string;
}) {
  const reduced = useReduced();
  const slides = React.useMemo(() => buildDeck(data, y), [data, y]);
  const m = useStoryMachine({
    slides,
    reduced,
    onAdvance: React.useCallback(() => sfxAdvance(), []),
    onSlideEnter: React.useCallback((def: SlideDef) => { if (def.kind === "aura") sfxReveal(); }, []),
  });
  const { index, visit, progress, held, exited, containerRef, goNext, goPrev, restart } = m;
  const def = slides[Math.min(index, slides.length - 1)];

  // Audio: the sender's clip, if any, plays under the whole story.
  const audioRef = React.useRef<HTMLAudioElement>(null);
  const [muted, setMuted] = React.useState(false);
  const hasAudio = !!data.audioUrl.trim();
  React.useEffect(() => {
    unlockAudio();
    const a = audioRef.current;
    if (a) void a.play().catch(() => {});
  }, []);
  React.useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    if (held) a.pause();
    else if (!muted) void a.play().catch(() => {});
  }, [held, muted]);

  // Keyboard — works without focusing the card first.
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.closest?.("input, textarea, [contenteditable]")) return;
      if (document.querySelector(".lr")) return; // the letter is open on top
      if (e.key === "ArrowRight") { e.preventDefault(); goNext(); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); goPrev(); }
      else if (e.key === "Escape") { e.preventDefault(); onClose(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goNext, goPrev, onClose]);

  // Lock the page behind the story.
  React.useEffect(() => {
    const h = document.documentElement;
    const prev = h.style.overflow;
    h.style.overflow = "hidden";
    return () => { h.style.overflow = prev; };
  }, []);

  const stop = { onPointerDown: (e: React.PointerEvent) => e.stopPropagation(), onPointerUp: (e: React.PointerEvent) => e.stopPropagation() };
  const bgPhoto = data.photos[0]?.url;

  return (
    <div className={`rwStory ${reduced ? "is-reduced" : ""}`} role="dialog" aria-modal="true" aria-label={`${y.to}'s ${y.year} Rewind`}>
      <div className="rwStoryBack" aria-hidden>
        {bgPhoto ? <div className="rwStoryBlur" style={{ backgroundImage: `url("${bgPhoto.replace(/"/g, "%22")}")` }} /> : null}
        <div className="rwStoryTint" style={{ background: exited ? `radial-gradient(circle at 50% 45%, ${y.aura.a}66, rgba(0,0,0,.55) 80%)` : `radial-gradient(circle at 50% 45%, ${def?.bg}66, rgba(0,0,0,.55) 80%)` }} />
      </div>

      {hasAudio && <audio ref={audioRef} src={data.audioUrl} loop muted={muted} playsInline preload="auto" style={{ display: "none" }} />}

      {!exited && (
        <button type="button" className="rwArrow rwArrowL" onClick={goPrev} aria-label="Previous" disabled={index === 0}><IBack size={22} /></button>
      )}

      <div
        ref={containerRef}
        className="rwFrame"
        tabIndex={-1}
        aria-roledescription="story"
        aria-label={exited ? "Your summary card" : `Card ${index + 1} of ${slides.length}. Tap right for next, left for back, hold to pause.`}
        style={{ background: exited ? "#121212" : def?.bg, color: exited ? "#fff" : def?.fg, touchAction: exited ? "auto" : "none" }}
      >
        {exited ? (
          <Summary data={data} y={y} hasLetter={hasLetter} onBonus={onBonus} onReplay={restart} shareUrl={shareUrl} />
        ) : (
          <>
            {def && y.ready && <Card key={`${def.key}:${visit}`} def={def} data={data} y={y} reduced={reduced} />}
            <div className={`rwChrome ${held ? "is-held" : ""}`}>
              <div className="rwBars">
                {slides.map((s, i) => (
                  <span key={s.key} className="rwBar"><i style={{ transform: `scaleX(${i < index ? 1 : i === index ? progress : 0})` }} /></span>
                ))}
              </div>
              <div className="rwTopRow">
                <span className="rwBrand"><HeartMark size={20} color="currentColor" cut={def?.bg} /> <b>Rewind</b> <small>{y.year}</small></span>
                <span style={{ flex: 1 }} />
                {hasAudio && (
                  <button type="button" {...stop} className="rwIco" onClick={() => setMuted((v) => !v)} aria-label={muted ? "Unmute" : "Mute"}><IVolume size={20} muted={muted} /></button>
                )}
                <button type="button" {...stop} className="rwIco rwIcoPause" aria-hidden tabIndex={-1}>{held ? <IPlay size={18} /> : <IPause size={18} />}</button>
                <button type="button" {...stop} className="rwIco" onClick={onClose} aria-label="Close the story"><IClose size={22} /></button>
              </div>
            </div>
            {held && <div className="rwHeld" aria-hidden>paused</div>}
          </>
        )}
        {exited && (
          <button type="button" className="rwIco rwSumClose" onClick={onClose} aria-label="Close the story"><IClose size={22} /></button>
        )}
      </div>

      {!exited && (
        <button type="button" className="rwArrow rwArrowR" onClick={goNext} aria-label="Next"><IFwd size={22} /></button>
      )}
      <p className="rwHint" aria-hidden>← → to skip · hold to pause · esc to close</p>
      <style>{STORY_CSS}</style>
    </div>
  );
}

const STORY_CSS = `
.rwStory { position: fixed; inset: 0; z-index: 135; display: flex; align-items: center; justify-content: center; gap: 28px; background: #000; font-family: ${FONT};
  -webkit-tap-highlight-color: transparent; animation: rwFadeIn .3s ease both; }
.rwStory *, .rwStory *::before, .rwStory *::after { box-sizing: border-box; }
.rwStoryBack { position: absolute; inset: 0; overflow: hidden; }
.rwStoryBlur { position: absolute; inset: -60px; background: center/cover no-repeat; filter: blur(48px) saturate(1.4) brightness(.7); transform: scale(1.1); }
.rwStoryTint { position: absolute; inset: 0; }
.rwFrame { position: relative; z-index: 1; width: 100%; height: 100%; height: 100dvh; overflow: hidden; container-type: size; outline: none; user-select: none; -webkit-user-select: none; }
.rwArrow, .rwHint { display: none; }
@media (min-width: 700px) and (min-height: 560px) {
  .rwFrame { height: min(calc(100dvh - 72px), 920px); width: calc(min(calc(100dvh - 72px), 920px) * 9 / 16); border-radius: 18px; box-shadow: 0 40px 120px -30px rgba(0,0,0,.9); }
  .rwArrow { position: relative; z-index: 2; display: grid; place-items: center; width: 52px; height: 52px; border-radius: 50%; border: 0; cursor: pointer; background: rgba(255,255,255,.14); color: #fff; transition: transform .2s ease, background .2s ease; }
  .rwArrow:hover { background: rgba(255,255,255,.26); transform: scale(1.08); }
  .rwArrow:disabled { opacity: .3; cursor: default; transform: none; }
  .rwHint { display: block; position: absolute; bottom: 12px; left: 0; right: 0; margin: 0; text-align: center; color: rgba(255,255,255,.5); font-size: 12px; font-weight: 600; letter-spacing: .02em; z-index: 1; }
}
.rwChrome { position: absolute; left: 0; right: 0; top: 0; z-index: 20; padding: calc(10px + env(safe-area-inset-top, 0px)) 10px 0; transition: opacity .2s ease; pointer-events: none; }
.rwChrome.is-held { opacity: 0; }
.rwBars { display: flex; gap: 3px; }
.rwBar { flex: 1; height: 3px; border-radius: 3px; background: color-mix(in srgb, currentColor 32%, transparent); overflow: hidden; }
.rwBar i { display: block; height: 100%; background: currentColor; transform-origin: left; }
.rwTopRow { display: flex; align-items: center; gap: 4px; margin-top: 10px; padding: 0 2px; }
.rwBrand { display: inline-flex; align-items: center; gap: 6px; font-size: 15px; letter-spacing: -.02em; }
.rwBrand b { font-weight: 800; }
.rwBrand small { font-weight: 700; opacity: .7; font-size: 13px; }
.rwIco { pointer-events: auto; width: 40px; height: 40px; display: grid; place-items: center; border: 0; background: transparent; color: inherit; cursor: pointer; border-radius: 50%; }
.rwIco:hover { background: color-mix(in srgb, currentColor 12%, transparent); }
.rwIcoPause { pointer-events: none; opacity: .8; }
.rwHeld { position: absolute; left: 50%; bottom: 7%; transform: translateX(-50%); z-index: 21; padding: 6px 14px; border-radius: 99px; background: rgba(0,0,0,.55); color: #fff; font-size: 13px; font-weight: 700; }

.rwCard { position: absolute; inset: 0; padding: 22cqw 7cqw 9cqw; display: flex; flex-direction: column; overflow: hidden; }
.rwCard.rwCenter { align-items: center; justify-content: center; padding-top: 16cqw; }
.rwCard.rwPad { padding-top: 21cqw; }
.rwStack { position: relative; z-index: 2; display: flex; flex-direction: column; }
.rwStack.rwBottom { margin-top: auto; }
.rwStack.rwMid { margin: auto 0; }
.rwStack.rwTop { margin-top: 2cqw; }
.rwKick { margin: 0 0 2.5cqw; font-size: 5.4cqw; font-weight: 700; letter-spacing: -.01em; line-height: 1.15; }
.rwHuge { margin: 0; font-size: 20cqw; font-weight: 900; line-height: .88; letter-spacing: -.055em; overflow-wrap: anywhere; }
.rwBig { margin: 1cqw 0 0; font-size: 8.6cqw; font-weight: 900; line-height: 1; letter-spacing: -.04em; }
.rwBody { margin: 4cqw 0 0; font-size: 4.5cqw; font-weight: 600; line-height: 1.35; max-width: 82cqw; opacity: .92; }
.rwPill { margin: 5cqw 0 0; padding: 2.4cqw 5cqw; border-radius: 99px; background: #fff; color: #000; font-size: 4.4cqw; font-weight: 800; }
.rwShapes { position: absolute; inset: 0; pointer-events: none; z-index: 0; }
.rwShape { position: absolute; display: block; }
.rwMarquee { position: absolute; inset: 0; display: flex; flex-direction: column; justify-content: center; gap: 1cqw; transform: rotate(-12deg) scale(1.3); opacity: .9; }
.rwMq { white-space: nowrap; font-size: 15cqw; font-weight: 900; letter-spacing: -.05em; line-height: .95; color: transparent; -webkit-text-stroke: .35cqw rgba(255,255,255,.55); animation: rwMq 16s linear infinite; }
.rwMq:nth-child(3) { -webkit-text-stroke: 0; color: ${C.lime}; }
.rwMqR { animation-direction: reverse; }
.rwIntroBox { position: relative; z-index: 2; background: #000; padding: 6cqw 6cqw 7cqw; border-radius: 4cqw; width: 88cqw; box-shadow: 0 0 0 .6cqw ${C.lime}; }
.rwIntroBox .rwKick { color: ${C.lime}; }
.rwChips { display: flex; flex-wrap: wrap; gap: 2.6cqw; margin-top: 2cqw; }
.rwChip { padding: 3cqw 5cqw; border-radius: 99px; background: ${C.lime}; color: #0B0B0B; font-size: 7.4cqw; font-weight: 900; letter-spacing: -.04em; }
.rwChip:nth-child(2n) { background: #FF4FB4; }
.rwChip:nth-child(3n) { background: #fff; }
.rwVinyl { position: absolute; right: -30cqw; bottom: -26cqw; width: 105cqw; height: 105cqw; border-radius: 50%; background: repeating-radial-gradient(circle, #1F0F00 0 1.2cqw, #2c1703 1.2cqw 2.4cqw); animation: rwSpinK 9s linear infinite; }
.rwVinyl i { position: absolute; inset: 36%; border-radius: 50%; background: #FF4FB4; }
.rwVinyl i + i { inset: 47%; background: #F59B23; }
.rwVinyl i + i + i { inset: 49.4%; background: #1F0F00; }
.rwGenres { position: relative; z-index: 2; list-style: none; margin: auto 0 0; padding: 0; display: grid; gap: 2.4cqw; max-width: 64cqw; }
.rwGenres li { display: flex; align-items: baseline; gap: 3cqw; font-size: 5.6cqw; font-weight: 800; letter-spacing: -.02em; background: #1F0F00; color: #F59B23; padding: 2.4cqw 4cqw; border-radius: 3cqw; }
.rwGenres b { font-size: 4.4cqw; opacity: .8; }
.rwTopArt { position: relative; width: 52cqw; height: 52cqw; margin: 2cqw 0 7cqw; box-shadow: 0 4cqw 10cqw -3cqw rgba(0,0,0,.6); }
.rwRank { position: absolute; left: -3cqw; bottom: -4cqw; font-size: 22cqw; font-weight: 900; line-height: .8; color: ${C.lime}; letter-spacing: -.06em; text-shadow: 0 1cqw 4cqw rgba(0,0,0,.4); }
.rwList { list-style: none; margin: 0; padding: 0; display: grid; gap: 3.4cqw; position: relative; z-index: 2; }
.rwList li { display: flex; align-items: center; gap: 3.4cqw; min-width: 0; }
.rwNum { width: 6cqw; font-size: 5.6cqw; font-weight: 900; text-align: right; flex: none; }
.rwThumb { width: 13cqw; height: 13cqw; flex: none; border-radius: 1cqw; }
.rwListBig .rwThumb { width: 14cqw; height: 14cqw; }
.rwLi { display: grid; min-width: 0; }
.rwLi strong { font-size: 5cqw; font-weight: 800; letter-spacing: -.02em; line-height: 1.15; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.rwListBig .rwLi strong { white-space: normal; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
.rwLi small { font-size: 3.8cqw; font-weight: 600; opacity: .72; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.rwDisc { position: relative; z-index: 2; width: 62cqw; height: 62cqw; margin: 3cqw 0 5cqw; }
.rwDiscSpin { width: 100%; height: 100%; border-radius: 50%; background: repeating-radial-gradient(circle, #111 0 .9cqw, #1d1d1d .9cqw 1.8cqw); display: grid; place-items: center; box-shadow: 0 5cqw 14cqw -4cqw rgba(0,0,0,.7); animation: rwSpinK 6s linear infinite; }
.rwDiscLabel { width: 42%; height: 42%; border-radius: 50%; overflow: hidden; box-shadow: 0 0 0 1cqw #AF2896; }
.rwReasons { list-style: none; margin: 0; padding: 0; display: grid; gap: 3cqw; }
.rwReasons li { display: flex; gap: 3.5cqw; align-items: flex-start; }
.rwReasons b { font-size: 9cqw; font-weight: 900; letter-spacing: -.05em; line-height: .9; color: #FFC864; flex: none; width: 13cqw; }
.rwReasons span { font-size: 4.8cqw; font-weight: 700; line-height: 1.22; letter-spacing: -.01em; }
.rwReasons li:last-child span { font-size: 5.6cqw; font-weight: 900; }
.rwPile { position: absolute; left: 0; right: 0; top: 52cqw; bottom: 6cqw; }
.rwPolar { position: absolute; width: 52cqw; margin: 0; padding: 2cqw 2cqw 0; background: #fff; box-shadow: 0 4cqw 10cqw -3cqw rgba(0,0,0,.7); transform: rotate(var(--r)); }
.rwPolar figcaption { color: #111; font-size: 4cqw; font-weight: 800; padding: 2cqw 1cqw 3cqw; letter-spacing: -.02em; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
.rwJokes { display: grid; gap: 4cqw; margin-top: 3cqw; position: relative; z-index: 2; }
.rwJoke { display: grid; gap: .6cqw; }
.rwJoke small { font-size: 4.6cqw; font-weight: 700; opacity: .85; }
.rwJoke b { font-size: 17cqw; font-weight: 900; line-height: .9; letter-spacing: -.055em; color: ${C.lime}; }
.rwJokeSub { font-size: 4.2cqw; font-weight: 600; opacity: .9; line-height: 1.3; }
.rwFanPic { position: relative; z-index: 2; width: 40cqw; height: 40cqw; margin-bottom: 6cqw; border-radius: 50%; box-shadow: 0 0 0 1.4cqw #1A1200; }
.rwStamp { position: absolute; right: -10cqw; bottom: -2cqw; padding: 2cqw 3.4cqw; border-radius: 2cqw; background: #FF4FB4; color: #1A0014; font-size: 5.4cqw; font-weight: 900; letter-spacing: -.02em; transform: rotate(-12deg); box-shadow: 0 2cqw 6cqw -2cqw rgba(0,0,0,.5); }
.rwFan .rwBody, .rwCenter .rwBody { max-width: 80cqw; }
.rwCenter > :not(.rwShapes):not(.rwMarquee):not(.rwOrb) { position: relative; z-index: 2; }
.rwOrb { position: absolute !important; left: 50%; top: 50%; width: 80cqw; height: 80cqw; margin: -40cqw 0 0 -40cqw; border-radius: 50%; background: radial-gradient(circle, #FF4FB4, #7358FF 45%, transparent 70%); filter: blur(6cqw); animation: rwBreathe 2.6s ease-in-out infinite; z-index: 0 !important; }
.rwAura { position: absolute; inset: 0; overflow: hidden; }
.rwAura i { position: absolute; width: 90cqw; height: 90cqw; border-radius: 50%; filter: blur(14cqw); opacity: .9; animation: rwDrift 9s ease-in-out infinite alternate; }
.rwAura i:nth-child(1) { left: -30cqw; top: 10%; }
.rwAura i:nth-child(2) { right: -30cqw; top: 38%; animation-delay: -3s; }
.rwAura i:nth-child(3) { left: 10cqw; bottom: -40cqw; opacity: .6; animation-delay: -6s; }
.rwAuraWords { display: flex; gap: 2.4cqw; margin-top: 4cqw; flex-wrap: wrap; }
.rwAuraWords span { padding: 2cqw 4cqw; border-radius: 99px; background: rgba(255,255,255,.18); border: .4cqw solid rgba(255,255,255,.6); font-size: 4.6cqw; font-weight: 800; }

/* summary */
.rwSum { position: absolute; inset: 0; overflow-y: auto; overflow-x: hidden; padding: 13cqw 7cqw 8cqw; display: flex; flex-direction: column; align-items: center; gap: 4cqw; animation: rwFadeIn .4s ease both; }
.rwSumClose { position: absolute; top: calc(8px + env(safe-area-inset-top, 0px)); right: 8px; z-index: 5; color: #fff; }
.rwSumCard { container-type: inline-size; width: 86cqw; flex: none; border-radius: 3cqw; overflow: hidden; color: #0B0B0B; padding: 0 0 4cqw; animation: rwCardIn .6s cubic-bezier(.2,1,.3,1) both; box-shadow: 0 6cqw 16cqw -6cqw rgba(0,0,0,.8); }
.rwSumTop { position: relative; height: 46cqw; display: grid; place-items: center; overflow: hidden; }
.rwSumArt { position: relative; z-index: 2; width: 40cqw; height: 40cqw; box-shadow: 0 3cqw 8cqw -2cqw rgba(0,0,0,.5); transform: rotate(-3deg); }
.rwSumBlob { position: absolute; inset: -20%; background: radial-gradient(circle at 20% 30%, rgba(255,255,255,.45) 0 12%, transparent 13%), radial-gradient(circle at 85% 70%, rgba(0,0,0,.18) 0 18%, transparent 19%), repeating-linear-gradient(45deg, rgba(0,0,0,.07) 0 3cqw, transparent 3cqw 6cqw); }
.rwSumCols { display: grid; grid-template-columns: 1fr 1fr; gap: 4cqw; padding: 4cqw 6cqw 0; }
.rwSumCard h4 { margin: 0 0 1.4cqw; font-size: 3.4cqw; font-weight: 700; opacity: .75; }
.rwSumCard ol { list-style: none; margin: 0; padding: 0; display: grid; gap: .8cqw; }
.rwSumCard li { display: flex; gap: 1.8cqw; font-size: 3.8cqw; font-weight: 800; letter-spacing: -.02em; min-width: 0; }
.rwSumCard li b { flex: none; width: 2.6cqw; }
.rwSumCard li span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.rwSumBig { margin: 0; font-size: 8.4cqw; font-weight: 900; letter-spacing: -.05em; line-height: 1; }
.rwSumMid { margin: 0; font-size: 5.4cqw; font-weight: 900; letter-spacing: -.03em; line-height: 1.05; }
.rwSumAura { padding: 4cqw 6cqw 0; }
.rwSumAura p { margin: 0; font-size: 6.4cqw; font-weight: 900; letter-spacing: -.04em; line-height: 1; }
.rwSumFoot { display: flex; justify-content: space-between; align-items: center; gap: 3cqw; padding: 5cqw 6cqw 0; font-size: 2.8cqw; font-weight: 800; letter-spacing: .04em; }
.rwSumFoot span:last-child { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.rwSumMark { display: inline-flex; align-items: center; gap: 1.4cqw; font-size: 4cqw; letter-spacing: -.02em; flex: none; }
.rwSumBtns { width: 86cqw; display: grid; gap: 3cqw; flex: none; }
.rwBtnW, .rwBtnG { min-height: 48px; border-radius: 99px; border: 0; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 8px; font: 800 15px ${FONT}; transition: transform .15s ease; }
.rwBtnW { background: #fff; color: #000; }
.rwBtnG { background: transparent; color: #fff; box-shadow: inset 0 0 0 1.5px rgba(255,255,255,.4); flex: 1; }
.rwBtnW:active, .rwBtnG:active, .rwBonus:active { transform: scale(.97); }
.rwSumRow { display: flex; gap: 3cqw; }
.rwBonus { display: flex; align-items: center; gap: 12px; padding: 8px 10px 8px 8px; border-radius: 12px; border: 0; cursor: pointer; text-align: left; color: #fff;
  background: linear-gradient(90deg, rgba(30,215,96,.22), rgba(255,79,180,.18)); box-shadow: inset 0 0 0 1px rgba(30,215,96,.45); animation: rwGlow 2.4s ease-in-out infinite; font-family: ${FONT}; }
.rwBonusArt { position: relative; width: 48px; height: 48px; border-radius: 6px; overflow: hidden; flex: none; }
.rwBonusArt svg { position: absolute; right: 3px; bottom: 3px; color: #fff; filter: drop-shadow(0 1px 2px rgba(0,0,0,.6)); }
.rwBonusTx { display: grid; flex: 1; min-width: 0; }
.rwBonusTx small { font-size: 10.5px; font-weight: 800; letter-spacing: .12em; color: ${C.green}; }
.rwBonusTx b { font-size: 16px; font-weight: 800; letter-spacing: -.01em; }
.rwBonusPlay { width: 40px; height: 40px; border-radius: 50%; background: ${C.green}; color: #000; display: grid; place-items: center; flex: none; }
.rwSumMsg { margin: 0; min-height: 18px; text-align: center; font-size: 13px; font-weight: 700; color: ${C.green}; }

/* motion — from-only keyframes, so the resting state IS the final frame */
.rwUp { animation: rwUp .7s cubic-bezier(.16,1,.3,1) both; }
.rwSlam { animation: rwSlam .75s cubic-bezier(.2,1.3,.4,1) both; }
.rwPop { animation: rwPopK .6s cubic-bezier(.2,1.5,.4,1) both; }
.rwLeft { animation: rwLeftK .6s cubic-bezier(.16,1,.3,1) both; }
.rwDrop { animation: rwDropK .8s cubic-bezier(.2,1.2,.4,1) both; }
.rwStampIn { animation: rwStampK .5s cubic-bezier(.2,1.6,.4,1) both; }
.rwFloat { animation: rwFloatK 6s ease-in-out infinite; }
.rwSpin { animation: rwSpinK 14s linear infinite; }
.rwSpinR { animation: rwSpinK 10s linear infinite reverse; }
@keyframes rwFadeIn { from { opacity: 0; } }
@keyframes rwUp { from { opacity: 0; transform: translateY(9cqw); } }
@keyframes rwSlam { from { opacity: 0; transform: scale(1.5) rotate(-4deg); } }
@keyframes rwPopK { from { opacity: 0; transform: scale(.3); } }
@keyframes rwLeftK { from { opacity: 0; transform: translateX(-14cqw); } }
@keyframes rwDropK { from { opacity: 0; transform: translateY(-80cqw) rotate(calc(var(--r) * -3)); } }
@keyframes rwStampK { from { opacity: 0; transform: scale(2.4) rotate(10deg); } }
@keyframes rwFloatK { 0%,100% { transform: translate(0,0); } 50% { transform: translate(3cqw,-4cqw); } }
@keyframes rwSpinK { to { transform: rotate(360deg); } }
@keyframes rwMq { to { transform: translateX(-50%); } }
@keyframes rwBreathe { 0%,100% { transform: scale(.85); } 50% { transform: scale(1.1); } }
@keyframes rwDrift { to { transform: translate(12cqw, -10cqw) scale(1.15); } }
@keyframes rwCardIn { from { opacity: 0; transform: translateY(10cqw) scale(.94); } }
@keyframes rwGlow { 0%,100% { box-shadow: inset 0 0 0 1px rgba(30,215,96,.45); } 50% { box-shadow: inset 0 0 0 1px rgba(30,215,96,.9), 0 0 24px -6px rgba(30,215,96,.7); } }
.rwStory.is-reduced *, .rwStory.is-reduced *::before { animation-duration: .01ms !important; animation-iteration-count: 1 !important; animation-delay: 0ms !important; }
@media (prefers-reduced-motion: reduce) { .rwStory * { animation-duration: .01ms !important; animation-iteration-count: 1 !important; animation-delay: 0ms !important; } }
`;
