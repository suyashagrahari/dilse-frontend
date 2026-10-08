"use client";

// ─── Scenes 5–8: lights out — torchlight letter, star lamp, hide-and-seek, tuck-in

import { useCallback, useEffect, useRef, useState, type PointerEvent as RPointerEvent } from "react";
import { CroppedPhoto, haptic, PhotoLightbox, Typewriter } from "../../../_valentine/kit";
import { SkipChip, usePremium } from "../../../_valentine/kit/premium";
import { Teddy } from "./art";
import { fill, type SceneProps } from "./shared";

// ── Torchlight letter: a dark canvas over the letter; the beam erases it ────
export function Torch({ data, name, look, reduced, sfx, sticker, next }: SceneProps) {
  const p = usePremium();
  const cv = useRef<HTMLCanvasElement>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const [beam, setBeam] = useState<{ x: number; y: number } | null>(null);
  const [clear, setClear] = useState(reduced);
  const last = useRef(0);
  useEffect(() => {
    p.music?.fadeTo(0.7, 900);
    return () => p.music?.fadeTo(1, 900);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    const c = cv.current;
    if (!c || clear) return;
    const w = c.clientWidth, h = c.clientHeight;
    c.width = w;
    c.height = h;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#0b0e1f";
    ctx.fillRect(0, 0, w, h);
    // the first glimpse: a soft circle where the teddy points
    paint(w * 0.5, h * 0.12, 70);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const paint = (x: number, y: number, r = 64) => {
    const ctx = cv.current?.getContext("2d");
    if (!ctx) return;
    ctx.globalCompositeOperation = "destination-out";
    const g = ctx.createRadialGradient(x, y, r * 0.3, x, y, r);
    g.addColorStop(0, "rgba(0,0,0,1)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  };
  const revealed = () => {
    const c = cv.current;
    const ctx = c?.getContext("2d");
    if (!c || !ctx) return 0;
    const d = ctx.getImageData(0, 0, c.width, c.height).data;
    let open = 0, n = 0;
    for (let i = 3; i < d.length; i += 4 * 97) {
      n++;
      if (d[i] < 90) open++;
    }
    return n ? open / n : 0;
  };
  const move = (e: RPointerEvent<HTMLDivElement>) => {
    const r = wrap.current?.getBoundingClientRect();
    if (!r || clear) return;
    const x = e.clientX - r.left, y = e.clientY - r.top;
    setBeam({ x, y });
    if (e.buttons || e.pointerType === "touch") paint(x, y);
    const now = performance.now();
    if (now - last.current > 450) {
      last.current = now;
      if (revealed() > 0.62) readAll();
    }
  };
  const readAll = () => {
    if (clear) return;
    setClear(true);
    sfx("sparkle", { gain: 0.6 });
  };

  return (
    <section className="td-sec td-lightsOut">
      <header className="td-head">
        <p className="td-kick">Lights out · a blanket fort</p>
        <h2 className="td-h">{name} brought a torch</h2>
        <p className="td-sub">{clear ? "" : "Drag the beam over the page to read it."}</p>
      </header>
      <div
        ref={wrap}
        className={`td-page${clear ? " is-clear" : ""}`}
        onPointerDown={(e) => { e.currentTarget.setPointerCapture?.(e.pointerId); move(e); }}
        onPointerMove={move}
        onPointerLeave={() => setBeam(null)}
        style={{ touchAction: clear ? "auto" : "none" }}
      >
        <article className="td-letter">
          <span className="td-doodle is-a" aria-hidden>☆</span>
          <span className="td-doodle is-b" aria-hidden>♡</span>
          <span className="td-doodle is-c" aria-hidden>☾</span>
          <div className="td-letterTx">{data.letter}</div>
          {data.senderName && <p className="td-letterSign">— {data.senderName}</p>}
        </article>
        {!clear && <canvas ref={cv} className="td-dark" aria-hidden />}
        {!clear && beam && <span className="td-beam" style={{ left: beam.x, top: beam.y }} aria-hidden />}
      </div>
      <div className="td-torchTeddy" aria-hidden>
        <Teddy {...look} torch className="td-mini" />
      </div>
      <div className="td-actions">
        {!clear ? (
          <button type="button" className="td-btn is-ghost" onClick={readAll}>
            Read it all
          </button>
        ) : (
          <>
            <span className="td-stick">{sticker("pt4-letter", 70)}</span>
            <button type="button" className="td-btn" onClick={() => { sfx("td-torch"); next(); }}>
              {data.photos.some((ph) => ph?.url) ? "Switch on the star lamp →" : "Play hide and seek →"}
            </button>
          </>
        )}
      </div>
    </section>
  );
}

// ── Star lamp: rotating stars, photos as moons; drag to turn ─────────────────
export function Stars({ data, sfx, next, reduced }: SceneProps) {
  const photos = data.photos.filter((ph) => ph && ph.url).slice(0, 8);
  const [open, setOpen] = useState<number | null>(null);
  const ring = useRef<HTMLDivElement>(null);
  const sky = useRef<HTMLDivElement>(null);
  const rot = useRef(0);
  const vel = useRef(0);
  const drag = useRef<{ x: number } | null>(null);
  useEffect(() => {
    const bed = sfx("td-starlamp");
    let raf = 0;
    let lastT = performance.now();
    const step = (now: number) => {
      const dt = Math.min(0.05, (now - lastT) / 1000);
      lastT = now;
      if (!drag.current) {
        vel.current *= 0.95;
        rot.current += (reduced ? 0 : 4) * dt + vel.current;
      }
      const a = rot.current;
      if (ring.current) {
        ring.current.style.transform = `rotate(${a}deg)`;
        ring.current.style.setProperty("--counter", `${-a}deg`);
      }
      if (sky.current) sky.current.style.transform = `rotate(${a * 0.4}deg)`;
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(raf);
      bed.stop(800);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const n = photos.length;
  return (
    <section className="td-sec td-starsSec">
      <header className="td-head">
        <p className="td-kick">The star lamp</p>
        <h2 className="td-h">Our moons</h2>
        <p className="td-sub">Drag to turn the lamp. Tap a moon.</p>
      </header>
      <div
        className="td-ceiling"
        onPointerDown={(e) => { drag.current = { x: e.clientX }; }}
        onPointerMove={(e) => {
          const d = drag.current;
          if (!d) return;
          const dx = e.clientX - d.x;
          d.x = e.clientX;
          rot.current += dx * 0.35;
          vel.current = dx * 0.05;
        }}
        onPointerUp={() => (drag.current = null)}
        onPointerCancel={() => (drag.current = null)}
        onPointerLeave={() => (drag.current = null)}
        style={{ touchAction: "pan-y" }}
      >
        <div ref={sky} className="td-sky" aria-hidden />
        <div ref={ring} className="td-ring">
          {photos.map((ph, i) => {
            const a = (i / n) * Math.PI * 2;
            const rr = n <= 3 ? 30 : 36;
            return (
              <button
                key={i}
                type="button"
                className="td-moon"
                style={{ left: `${50 + Math.cos(a) * rr}%`, top: `${50 + Math.sin(a) * rr}%` }}
                onClick={() => { sfx("glass-ping", { detune: i * 80 }); setOpen(i); }}
                aria-label={`Photo ${i + 1}${ph.caption ? `: ${ph.caption}` : ""}`}
              >
                <span className="td-moonIn">
                  <CroppedPhoto photo={ph} alt="" />
                </span>
                {ph.caption && <span className="td-moonCap">{ph.caption}</span>}
              </button>
            );
          })}
        </div>
        <span className="td-lampDome" aria-hidden />
      </div>
      <div className="td-actions">
        <button type="button" className="td-btn" onClick={() => { sfx("whoosh", { gain: 0.5 }); next(); }}>
          Hide and seek →
        </button>
      </div>
      {open !== null && <PhotoLightbox photos={photos} index={open} onIndex={setOpen} onClose={() => setOpen(null)} />}
    </section>
  );
}

// ── Hide and seek under three pillows (3 rounds, unlosable) ─────────────────
type SeekPhase = "count" | "hide" | "shuffle" | "pick" | "found";

export function Seek({ look, name, lines, reduced, sfx, sticker, next }: SceneProps) {
  const [round, setRound] = useState(0);
  const [phase, setPhase] = useState<SeekPhase>("count");
  const [slots, setSlots] = useState([0, 1, 2]); // pillow id → slot
  const [hidden, setHidden] = useState(1); // pillow id hiding the teddy
  const [lift, setLift] = useState<number | null>(null);
  const [wrong, setWrong] = useState<number | null>(null);
  const [count, setCount] = useState(3);
  const timers = useRef<number[]>([]);
  const t = useCallback((fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, reduced ? Math.min(ms, 200) : ms)), [reduced]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const startRound = useCallback(() => {
    setPhase("count");
    setLift(null);
    setWrong(null);
    setCount(3);
    t(() => setCount(2), 600);
    t(() => setCount(1), 1200);
    t(() => {
      const h = Math.floor(Math.random() * 3);
      setHidden(h);
      setPhase("hide");
      sfx("td-whump");
      t(() => {
        setPhase("shuffle");
        let s = [0, 1, 2];
        for (let k = 0; k < 3; k++) {
          t(() => {
            const a = Math.floor(Math.random() * 3);
            const b = (a + 1 + Math.floor(Math.random() * 2)) % 3;
            s = [...s];
            const ia = s.indexOf(a), ib = s.indexOf(b);
            [s[ia], s[ib]] = [s[ib], s[ia]];
            setSlots(s.map((_, id) => s.indexOf(id)));
            sfx("td-whump", { detune: k * 100, pan: (a - 1) * 0.5 });
          }, 550 * k + 300);
        }
        t(() => setPhase("pick"), 550 * 3 + 500);
      }, 700);
    }, 1800);
  }, [sfx, t]);
  useEffect(() => {
    startRound();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pick = (id: number) => {
    if (phase !== "pick") return;
    if (id !== hidden) {
      setWrong(id);
      sfx("td-whump", { gain: 0.6 });
      t(() => { setWrong(null); found(); }, 650);
      return;
    }
    found();
  };
  const found = () => {
    setLift(hidden);
    setPhase("found");
    sfx("td-giggle");
    haptic([10, 30, 10]);
  };
  const line = lines[round % Math.max(1, lines.length)] ?? "Found me!";
  const last = round >= 2;
  const posOf = (id: number) => slots[id];

  return (
    <section className="td-sec">
      <header className="td-head">
        <p className="td-kick">Hide and seek · round {round + 1} of 3</p>
        <h2 className="td-h">
          {phase === "count" ? `Count to three… ${count}` : phase === "pick" ? `Where's ${name}?` : phase === "found" ? (wrong === null ? "Found him!" : "Here I am!") : "No peeking…"}
        </h2>
      </header>
      <div className="td-fort">
        {(phase === "count" || phase === "hide") && (
          <div className={`td-seekTeddy${phase === "hide" ? " is-diving" : ""}`} style={{ ["--slot" as string]: String(posOf(hidden)) }} aria-hidden>
            <Teddy {...look} className="td-mini" />
          </div>
        )}
        {[0, 1, 2].map((id) => (
          <button
            key={id}
            type="button"
            className={`td-pillow${lift === id ? " is-lift" : ""}${wrong === id ? " is-wrong" : ""}`}
            style={{ ["--slot" as string]: String(posOf(id)) }}
            onClick={() => pick(id)}
            disabled={phase !== "pick"}
            aria-label={`Pillow ${posOf(id) + 1}`}
          >
            {lift === id && (
              <span className="td-peekTeddy" aria-hidden>
                <Teddy {...look} className="td-mini" />
              </span>
            )}
            <span className="td-pillowCase" aria-hidden />
          </button>
        ))}
      </div>
      <div className="td-seekLine" aria-live="polite">
        {phase === "found" && <p className="td-said">“{line}”</p>}
      </div>
      <div className="td-actions">
        {phase === "found" && !last && (
          <button type="button" className="td-btn" onClick={() => { setRound((r) => r + 1); startRound(); }}>
            Again! →
          </button>
        )}
        {phase === "found" && last && (
          <>
            <span className="td-stick">{sticker("pt5-found", 70)}</span>
            <button type="button" className="td-btn" onClick={next}>
              Bedtime →
            </button>
          </>
        )}
      </div>
      <SkipChip onSkip={next} delay={2500} label="Skip game ▸" />
    </section>
  );
}

// ── Tuck-in: pull the blanket up, the lamp dims, goodnight; squish ──────────
export function Tuck({ data, x, name, look, lines, reduced, sfx, sticker, next, onDim, onSquish }: SceneProps & { onDim: (d: number) => void; onSquish: () => number }) {
  const [p, setP] = useState(0);
  const [done, setDone] = useState(false);
  const [jelly, setJelly] = useState(0);
  const [said, setSaid] = useState<string | null>(null);
  const [count, setCount] = useState(0);
  const drag = useRef<{ y: number; p: number } | null>(null);
  const bed = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const finish = () => {
    if (done) return;
    setP(1);
    setDone(true);
    sfx("td-swish");
    sfx("td-yawn", { at: 0.5 });
    onDim(0.5);
  };
  const squish = () => {
    setJelly((j) => j + 1);
    sfx("td-squish");
    haptic(12);
    const n = onSquish();
    setCount(n);
    setSaid(lines[(n - 1) % Math.max(1, lines.length)] ?? null);
  };
  const goodnight = fill(x.bedtimeLine || `Goodnight, ${data.recipientName || "you"}. ${data.senderName || "I"} ${data.senderName ? "is" : "am"} just a dream away.`, data);

  return (
    <section className="td-sec">
      <header className="td-head">
        <p className="td-kick">{done ? "Lights low" : "Bedtime"}</p>
        <h2 className="td-h">{done ? `${name} is sleepy` : "Tuck him in"}</h2>
        {!done && <p className="td-sub">Pull the blanket up over him.</p>}
      </header>
      <div ref={bed} className="td-bedStage">
        <span className="td-pillowBig" aria-hidden />
        <button type="button" className={`td-sleepy${jelly ? " is-jelly" : ""}`} key={jelly} onClick={done ? squish : undefined} aria-label={done ? `Squish ${name}` : name} tabIndex={done ? 0 : -1}>
          <Teddy {...look} awake={!done} />
        </button>
        <div
          className="td-quilt"
          style={{ transform: `translateY(${(1 - p) * 62}%)`, transition: drag.current ? "none" : "transform .6s cubic-bezier(.22,1,.36,1)", touchAction: "none", pointerEvents: done ? "none" : undefined }}
          onPointerDown={(e) => { if (done) return; e.currentTarget.setPointerCapture?.(e.pointerId); drag.current = { y: e.clientY, p }; }}
          onPointerMove={(e) => {
            const d = drag.current;
            if (!d) return;
            const h = bed.current?.clientHeight ?? 300;
            const np = Math.max(0, Math.min(1, d.p + (d.y - e.clientY) / (h * 0.5)));
            setP(np);
            if (np > 0.85) { drag.current = null; finish(); }
          }}
          onPointerUp={() => { drag.current = null; if (!done) setP((v) => v); }}
          aria-hidden
        >
          {!done && <span className="td-quiltPull">▲ pull ▲</span>}
        </div>
      </div>
      <div className="td-seekLine" aria-live="polite">
        {done && !said && (
          <div className="td-said is-whisper">
            <Typewriter text={goodnight} speed={reduced ? 0 : 45} skippable={false} />
          </div>
        )}
        {said && <p className="td-said">“{said}”</p>}
      </div>
      <div className="td-actions">
        {!done ? (
          <button type="button" className="td-btn is-ghost" onClick={finish}>
            Tuck him in for me
          </button>
        ) : (
          <>
            <span className="td-stick">{sticker("pt6-sleep", 64)}</span>
            <button type="button" className="td-btn is-ghost" onClick={squish}>
              Squish {count > 0 ? `· ${count}×` : ""}
            </button>
            <button type="button" className="td-btn" onClick={next}>
              Goodnight →
            </button>
          </>
        )}
      </div>
    </section>
  );
}
