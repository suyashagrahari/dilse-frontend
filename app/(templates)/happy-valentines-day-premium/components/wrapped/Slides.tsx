"use client";

// The quieter chapters of "Us, Wrapped": intro, top song, top 3 memories, stats, top trait, voice, letter.
// Each owns ONE tactile interaction and calls ready() when it has landed (the shell then fills the progress bar
// and shows Next; it also auto-readies after a few seconds so nobody is ever stuck).

import { motion, type PanInfo } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { CinematicPhoto, TiltCard, VoiceNotePlayer, usePremium } from "../../../_valentine/kit/premium";
import { useReducedMotion } from "../../../_valentine/kit";
import { topMemories } from "./model";
import { Heart, Up, type SlideProps } from "./ui";

// ─── 1 · Intro ───────────────────────────────────────────────────────────────
export function Intro({ w, ready }: SlideProps) {
  const { sfx } = usePremium();
  useEffect(() => {
    const ts = [0.15, 0.42, 0.7].map((s, i) => window.setTimeout(() => sfx("snap", { gain: 0.5, detune: i * 200 }), s * 1000));
    const t = window.setTimeout(ready, 1700);
    return () => { ts.forEach(clearTimeout); clearTimeout(t); };
  }, [sfx, ready]);
  return (
    <div className="uw-slide uw-intro">
      <i className="uw-blob b1" aria-hidden />
      <i className="uw-blob b2" aria-hidden />
      <i className="uw-blob b3" aria-hidden />
      <p className="uw-eyebrow uw-fade">{w.from} × {w.to}</p>
      <h1 className="uw-display uw-introStack">
        <Up d={0.1}>Your</Up>
        <Up d={0.36} className="uw-num">{w.year}</Up>
        <Up d={0.62} className="uw-serif">in love.</Up>
      </h1>
      <p className="uw-serif uw-introSub uw-fade" style={{ ["--d" as string]: "1.1s" }}>Let&rsquo;s look back, {w.pet || w.to}.</p>
    </div>
  );
}

// ─── 2 · Our top song ──────────────────────────────────────────────────────────
const clock = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

export function TopSong({ w, ready, isReady }: SlideProps) {
  const { sfx, music } = usePremium();
  const [liked, setLiked] = useState(false);
  const [t, setT] = useState(0);
  const cover = w.photos[4] ?? w.photos[0] ?? null;
  const song = w.song ?? { title: "The one we hum", artist: `${w.to} & ${w.from}` };
  const playing = !!music?.playing && music.mode === "youtube";

  useEffect(() => {
    if (!music || music.mode !== "youtube") return;
    const id = window.setInterval(() => setT(music.currentTime?.() ?? 0), 500);
    return () => clearInterval(id);
  }, [music]);

  const like = () => {
    if (liked) return;
    setLiked(true);
    sfx("pop", { gain: 0.8 });
    sfx("sparkle", { gain: 0.6, at: 0.08 });
    navigator.vibrate?.(12);
    if (!isReady) window.setTimeout(ready, 500);
  };
  return (
    <div className="uw-slide uw-song">
      <p className="uw-eyebrow uw-fade">Our top song</p>
      <div className="uw-songCover uw-fade" style={{ ["--d" as string]: ".15s" }}>
        <TiltCard radius={14} foil max={10}>
          {cover ? (
            <div style={{ aspectRatio: "1 / 1" }}><CinematicPhoto photo={cover} grade="rose" frame="full" caption="" eager alt="" /></div>
          ) : (
            <div style={{ aspectRatio: "1", background: "linear-gradient(135deg,#FF4B3E,#FF7AB6 55%,#FFE7A3)" }} />
          )}
        </TiltCard>
      </div>
      <h2 className="uw-display uw-songTitle"><Up d={0.35}>{song.title}</Up></h2>
      <p className="uw-serif uw-songArtist uw-fade" style={{ ["--d" as string]: ".55s" }}>{song.artist}</p>
      <div className="uw-scrub uw-fade" style={{ ["--d" as string]: ".7s" }} aria-hidden>
        <small>{playing ? clock(t) : "♪"}</small>
        <i><i style={{ transform: `scaleX(${playing ? Math.min(1, (t % 240) / 240) : 0.35})` }} /></i>
        <small>on repeat</small>
      </div>
      <button type="button" className={`uw-like${liked ? " is-on" : ""}`} onClick={like} aria-pressed={liked} aria-label="Like our song">
        <Heart filled={liked} />
        {liked && [0, 60, 120, 180, 240, 300].map((a) => <i key={a} className="uw-spark" style={{ ["--a" as string]: `${a}deg` }} aria-hidden />)}
      </button>
      <p className="uw-serif uw-songNote" aria-live="polite">{liked ? <span className="uw-fade" style={{ display: "inline-block" }}>{w.songNote || "Still my favourite song. Because of you."}</span> : null}</p>
    </div>
  );
}

// ─── 3 · Top 3 memories (fling #3 and #2 away; #1 stays) ─────────────────────
export function Memories({ w, ready }: SlideProps) {
  const { sfx } = usePremium();
  const reduce = useReducedMotion();
  const mems = topMemories(w.photos);
  const n = mems.length;
  const [gone, setGone] = useState(0);
  const [dirs, setDirs] = useState<number[]>([]);
  const top = n - 1 - gone;

  useEffect(() => {
    if (n <= 1) ready();
  }, [n, ready]);

  const fling = (dir: number) => {
    if (top <= 0) return;
    setDirs((d) => { const c = [...d]; c[top] = dir; return c; });
    sfx("swoosh-soft", { gain: 0.7, pan: dir * 0.4 });
    navigator.vibrate?.(8);
    setGone((g) => g + 1);
    if (top - 1 === 0) {
      window.setTimeout(() => sfx("chime", { gain: 0.6 }), 260);
      ready();
    }
  };
  const onEnd = (_: unknown, info: PanInfo) => {
    if (Math.abs(info.offset.x) > 80 || Math.abs(info.velocity.x) > 500) fling(Math.sign(info.offset.x || info.velocity.x) || 1);
  };
  const cur = mems[Math.max(0, top)];
  return (
    <div className="uw-slide uw-mem">
      <p className="uw-eyebrow uw-fade">Your top memories</p>
      <h2 className="uw-display uw-memHead"><Up d={0.15}>Top {n}</Up></h2>
      <div className="uw-memStack">
        {mems.map((p, i) => {
          const out = i > top;
          const depth = top - i;
          const dir = dirs[i] ?? 1;
          return (
            <motion.div
              key={i}
              className="uw-memCard"
              style={{ zIndex: i + 1, pointerEvents: out ? "none" : undefined }}
              aria-hidden={out || undefined}
              drag={i === top && top > 0 ? "x" : false}
              dragSnapToOrigin
              dragElastic={0.6}
              onDragEnd={onEnd}
              onTap={() => i === top && fling(1)}
              initial={reduce ? false : { y: 40, opacity: 0 }}
              animate={
                out
                  ? { x: dir * 520, rotate: dir * 22, opacity: 0 }
                  : { x: 0, y: depth * -12, rotate: depth === 0 ? 0 : depth % 2 ? 4 : -4, scale: 1 - depth * 0.05, opacity: 1 }
              }
              transition={{ duration: reduce ? 0.2 : 0.7, ease: [0.22, 1, 0.36, 1], delay: out ? 0 : reduce ? 0 : 0.15 + (n - i) * 0.08 }}
              role={i === top && top > 0 ? "button" : undefined}
              aria-label={i === top && top > 0 ? "Next memory" : undefined}
            >
              <CinematicPhoto photo={p} grade="warm" caption="" aspect="4 / 5" eager={i >= n - 2} alt={p.caption || ""} style={{ height: "100%" }} />
              <b className="uw-display uw-memRank uw-num" aria-hidden>#{i + 1}</b>
            </motion.div>
          );
        })}
      </div>
      <p className="uw-serif uw-memCap" key={top} aria-live="polite">
        <span className="uw-fade" style={{ display: "inline-block" }}>{cur?.caption || (top === 0 ? "The one I'd relive first." : "")}</span>
      </p>
      <p className="uw-memHint" style={{ visibility: top > 0 ? "visible" : "hidden" }}>Swipe for #{top}</p>
    </div>
  );
}

// ─── 4 · Stats you didn't know I kept (tap to flip) ──────────────────────────
const BACKS = ["#FF4B3E", "#FF7AB6", "#B9A7FF", "#FFFFFF"];

export function statTiles(w: SlideProps["w"]) {
  const t: { label: string; value: string }[] = [];
  if (w.phrase) t.push({ label: "Most-said phrase", value: w.phrase });
  if (w.place) t.push({ label: "Top place", value: w.place });
  return [...t, ...w.stats].slice(0, 4);
}

export function Stats({ w, ready }: SlideProps) {
  const { sfx } = usePremium();
  const tiles = statTiles(w);
  const [on, setOn] = useState<boolean[]>(() => tiles.map(() => false));
  const flip = (i: number) => {
    if (on[i]) return;
    const nx = on.map((v, k) => v || k === i);
    setOn(nx);
    sfx("page-turn", { gain: 0.55, detune: i * 120 });
    sfx("tick", { gain: 0.5, at: 0.35 });
    navigator.vibrate?.(8);
    if (nx.every(Boolean)) {
      window.setTimeout(() => sfx("sparkle", { gain: 0.5 }), 500);
      ready();
    }
  };
  const odd = tiles.length % 2 === 1;
  return (
    <div className="uw-slide">
      <p className="uw-eyebrow uw-fade">For your eyes only</p>
      <h2 className="uw-display uw-statsHead">
        <Up d={0.1}>Stats you didn&rsquo;t</Up>
        <Up d={0.22}>know I kept.</Up>
      </h2>
      <div className="uw-tiles">
        {tiles.map((s, i) => (
          <motion.button
            type="button"
            key={i}
            className={`uw-tile${on[i] ? " is-on" : ""}${odd && i === 0 ? " is-wide" : ""}`}
            onClick={() => flip(i)}
            aria-label={on[i] ? `${s.label}: ${s.value}` : `Reveal: ${s.label}`}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.35 + i * 0.09 }}
          >
            <span className="uw-tileIn">
              <span className="uw-face front">
                <small>{s.label}</small>
                <b aria-hidden>?</b>
              </span>
              <span className="uw-face back" style={{ background: BACKS[i % BACKS.length] }}>
                <small>{s.label}</small>
                <b>{s.value}</b>
              </span>
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// ─── 5 · Top trait, according to me (scratch the foil) ───────────────────────
export function Trait({ w, ready }: SlideProps) {
  const { sfx } = usePremium();
  const wrap = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const [done, setDone] = useState(false);
  const doneRef = useRef(false);

  const finish = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    setDone(true);
    sfx("sparkle", { gain: 0.7 });
    sfx("chime", { gain: 0.45, at: 0.1 });
    navigator.vibrate?.(20);
    ready();
  };

  useEffect(() => {
    const c = cv.current;
    const box = wrap.current;
    if (!c || !box) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const r = box.getBoundingClientRect();
    c.width = Math.round(r.width * dpr);
    c.height = Math.round(r.height * dpr);
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    const g = ctx.createLinearGradient(0, 0, r.width, r.height);
    [["#9d8ff0", 0], ["#e9e4ff", 0.28], ["#b9a7ff", 0.5], ["#fbf8ff", 0.68], ["#a596f2", 1]].forEach(([col, o]) => g.addColorStop(o as number, col as string));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, r.width, r.height);
    ctx.globalAlpha = 0.09;
    ctx.strokeStyle = "#151018";
    ctx.lineWidth = 1;
    for (let x = -r.height; x < r.width; x += 7) {
      ctx.beginPath();
      ctx.moveTo(x, r.height);
      ctx.lineTo(x + r.height, 0);
      ctx.stroke();
    }
    ctx.globalAlpha = 0.55;
    ctx.fillStyle = "#151018";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `800 13px ${getComputedStyle(box).getPropertyValue("--uw-sans") || "sans-serif"}, sans-serif`;
    ctx.fillText("S C R A T C H   M E   ✦", r.width / 2, r.height / 2);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "destination-out";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 46;

    let last: { x: number; y: number } | null = null;
    let moves = 0;
    let lastSfx = 0;
    const pt = (e: PointerEvent) => {
      const b = c.getBoundingClientRect();
      return { x: e.clientX - b.left, y: e.clientY - b.top };
    };
    const check = () => {
      const d = ctx.getImageData(0, 0, c.width, c.height).data;
      let clear = 0, all = 0;
      for (let i = 3; i < d.length; i += 4 * 23) { all++; if (d[i] < 100) clear++; }
      if (clear / all > 0.5) finish();
    };
    const down = (e: PointerEvent) => {
      if (doneRef.current) return;
      c.setPointerCapture(e.pointerId);
      last = pt(e);
      ctx.beginPath();
      ctx.arc(last.x, last.y, 23, 0, Math.PI * 2);
      ctx.fill();
    };
    const move = (e: PointerEvent) => {
      if (!last || doneRef.current) return;
      const p = pt(e);
      ctx.beginPath();
      ctx.moveTo(last.x, last.y);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
      last = p;
      const now = performance.now();
      if (now - lastSfx > 230) { lastSfx = now; sfx("paper-rustle", { gain: 0.35 }); }
      if (++moves % 10 === 0) check();
    };
    const up = () => { last = null; if (!doneRef.current) check(); };
    c.addEventListener("pointerdown", down);
    c.addEventListener("pointermove", move);
    c.addEventListener("pointerup", up);
    c.addEventListener("pointercancel", up);
    return () => {
      c.removeEventListener("pointerdown", down);
      c.removeEventListener("pointermove", move);
      c.removeEventListener("pointerup", up);
      c.removeEventListener("pointercancel", up);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="uw-slide uw-trait">
      <p className="uw-eyebrow uw-fade">According to me</p>
      <h2 className="uw-serif uw-traitLead"><Up d={0.1}>Your top personality</Up><Up d={0.2}>trait this year:</Up></h2>
      <div ref={wrap} className={`uw-scratch uw-fade${done ? " is-done" : ""}`} style={{ ["--d" as string]: ".4s" }}>
        <b className="uw-display">{w.trait}</b>
        <canvas ref={cv} aria-hidden />
      </div>
      {!done && <button type="button" className="uw-textBtn" onClick={finish}>Scratch it, or tap to reveal</button>}
    </div>
  );
}

// ─── 7 · Voice note ─────────────────────────────────────────────────────────────
export function Voice({ w, ready }: SlideProps) {
  const { premium } = usePremium();
  const has = !!premium.voiceNote;
  useEffect(() => {
    if (has) return;
    const t = window.setTimeout(ready, 1800);
    return () => clearTimeout(t);
  }, [has, ready]);
  return (
    <div className="uw-slide uw-voice">
      <p className="uw-eyebrow uw-fade">{has ? "Press play" : "A note"}</p>
      <h2 className="uw-display uw-voiceHead"><Up d={0.1}>From {w.from},</Up><Up d={0.22}>for you.</Up></h2>
      <VoiceNotePlayer
        accent="#151018"
        track="rgba(21,16,24,.25)"
        onPlay={ready}
        fallback={
          <div className="uw-fade" style={{ ["--d" as string]: ".45s" }}>
            <p className="uw-serif uw-quote">&ldquo;{premium.voiceCaption}&rdquo;</p>
            <p>— {w.from}</p>
          </div>
        }
      />
    </div>
  );
}

// ─── 8 · The letter (tap to unfold) ──────────────────────────────────────────
/** Drop a trailing sign-off ("Love,\nKabir") — the page signs it itself. */
function stripSignOff(letter: string, from: string): string {
  const lines = letter.replace(/\s+$/, "").split("\n");
  const name = from.trim().toLowerCase();
  const isName = (l: string) => !!name && l.replace(/^[\s—–-]+/, "").replace(/[.!,\s]+$/, "").toLowerCase() === name;
  const isClosing = (l: string) => /^(with )?(all (of )?)?(my )?(love|yours|forever yours|yours always|always yours|always|lots of love|xoxo|forever)[,.!\s]*$/i.test(l.trim());
  let n = 0;
  while (lines.length > 1 && n < 2) {
    const last = lines[lines.length - 1];
    if (!last.trim()) { lines.pop(); continue; }
    if (isName(last) || isClosing(last)) { lines.pop(); n++; continue; }
    break;
  }
  return lines.join("\n").trim();
}

export function Letter({ w, ready, letter }: SlideProps & { letter: string }) {
  const { sfx } = usePremium();
  const [open, setOpen] = useState(false);
  const paras = stripSignOff(letter, w.from).replace(/\r\n?/g, "\n").split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean);
  const unfold = () => {
    setOpen(true);
    sfx("paper-rustle", { gain: 0.8 });
    sfx("page-turn", { gain: 0.4, at: 0.15 });
    window.setTimeout(ready, 1200);
  };
  return (
    <div className="uw-slide uw-letter">
      <p className="uw-eyebrow uw-fade">In my own words</p>
      {!open ? (
        <button type="button" className="uw-fold" onClick={unfold} aria-label={`Open the letter for ${w.to}`}>
          <span>
            <b className="uw-serif">For {w.pet || w.to}</b>
            <small>Tap to unfold</small>
          </span>
        </button>
      ) : (
        <div className="uw-paper uw-paperIn" tabIndex={0} aria-label="The letter">
          {paras.map((p, i) => <p key={i}>{p}</p>)}
          <p className="uw-serif uw-sign">— {w.from}</p>
        </div>
      )}
    </div>
  );
}
