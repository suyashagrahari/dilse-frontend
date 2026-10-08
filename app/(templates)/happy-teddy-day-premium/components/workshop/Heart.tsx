"use client";

// ─── Scenes 3–4: the heart ceremony, then sew it in → the teddy wakes up ─────
//
// Ceremony (each step has a "Next" link): (a) warm it — swipe side to side
// over the heart; (b) drag it to the cheek target (the screen blushes);
// (c) drag it to the ear: the song dips and the heart whispers `heartWhisper`
// letter by letter; (d) make a wish and kiss it (tap). The wish is never
// typed, stored or sent: "Your wish stays here".
// Stitch: the heart drops into the chest (thump, glow + heartbeat), then drag
// down the seam (or tap the needle) to close 5 stitches. The last stitch is
// THE drop: eyes glint open, a stretch, a wave, hearts, the first words.

import { useEffect, useRef, useState, type PointerEvent as RPointerEvent } from "react";
import { burst, haptic, Typewriter } from "../../../_valentine/kit";
import { usePremium, useSongDrop, VoiceNotePlayer } from "../../../_valentine/kit/premium";
import { FabricHeart, STITCH_Y, Teddy } from "./art";
import { fill, type SceneProps } from "./shared";

type Step = "warm" | "cheek" | "ear" | "kiss" | "done";

export function Ceremony({ data, x, reduced, sfx, sticker, next }: SceneProps) {
  const p = usePremium();
  const [step, setStep] = useState<Step>("warm");
  const [warm, setWarm] = useState(0);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [blush, setBlush] = useState(false);
  const [whisper, setWhisper] = useState(false);
  const [kissed, setKissed] = useState(false);
  const stage = useRef<HTMLDivElement>(null);
  const cheekRef = useRef<HTMLDivElement>(null);
  const earRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x0: number; y0: number; dir: number; lastX: number } | null>(null);
  const shh = useRef<{ stop: (ms?: number) => void } | null>(null);
  const timers = useRef<number[]>([]);
  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout);
      shh.current?.stop(200);
      p.music?.fadeTo(1, 600);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  const initial = (x.pawInitial || data.senderName || "").trim().slice(0, 1).toUpperCase();

  const hits = (el: HTMLElement | null, cx: number, cy: number) => {
    const r = el?.getBoundingClientRect();
    return !!r && cx > r.left - 30 && cx < r.right + 30 && cy > r.top - 30 && cy < r.bottom + 30;
  };
  const goWarm = () => {
    setWarm(1);
    sfx("chime", { gain: 0.5 });
    timers.current.push(window.setTimeout(() => setStep("cheek"), 500));
  };
  const goCheek = () => {
    setPos(null);
    setBlush(true);
    sfx("td-blush");
    haptic(12);
    timers.current.push(window.setTimeout(() => setStep("ear"), 1100));
  };
  const goEar = () => {
    setPos(null);
    setWhisper(true);
    p.music?.fadeTo(0.3, 700);
    shh.current = sfx("td-shh");
  };
  const whisperDone = () => {
    shh.current?.stop(900);
    shh.current = null;
    timers.current.push(window.setTimeout(() => setStep("kiss"), 1400));
  };
  const goKiss = () => {
    if (kissed) return;
    setKissed(true);
    sfx("kiss");
    haptic(20);
    p.music?.fadeTo(1, 900);
    timers.current.push(window.setTimeout(() => setStep("done"), 900));
  };

  const down = (e: RPointerEvent<HTMLDivElement>) => {
    if (step === "kiss") return goKiss();
    if (step === "done" || whisper) return;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    drag.current = { x0: e.clientX, y0: e.clientY, dir: 0, lastX: e.clientX };
  };
  const move = (e: RPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    if (step === "warm") {
      const dx = e.clientX - d.lastX;
      if (Math.abs(dx) > 6) {
        const dir = Math.sign(dx);
        if (dir !== d.dir) {
          d.dir = dir;
          sfx("td-rub", { pan: dir * 0.3, detune: Math.random() * 200 });
          setWarm((w) => {
            const n = Math.min(1, w + 0.17);
            if (n >= 1 && w < 1) goWarm();
            return n;
          });
        }
        d.lastX = e.clientX;
      }
      setPos({ x: Math.max(-40, Math.min(40, e.clientX - d.x0)), y: 0 });
      return;
    }
    setPos({ x: e.clientX - d.x0, y: e.clientY - d.y0 });
    if (step === "cheek" && hits(cheekRef.current, e.clientX, e.clientY)) {
      drag.current = null;
      goCheek();
    }
    if (step === "ear" && hits(earRef.current, e.clientX, e.clientY)) {
      drag.current = null;
      goEar();
    }
  };
  const up = () => {
    drag.current = null;
    setPos(null);
  };

  const copy: Record<Step, { k: string; h: string; s: string }> = {
    warm: { k: "Before it goes in · 1 of 4", h: "Warm it in your hands", s: "Rub the heart side to side." },
    cheek: { k: "2 of 4", h: "Touch it to your cheek, for smiles", s: "Drag the heart to the glowing cheek." },
    ear: { k: "3 of 4", h: whisper ? "Shh… it's saying something" : "Hold it to your ear, so he listens", s: whisper ? "" : "Drag the heart to the ear." },
    kiss: { k: "4 of 4", h: "Make a wish, then kiss it", s: "Tap the heart. Your wish stays here." },
    done: { k: "Ready", h: `It's ${data.senderName ? `${data.senderName}'s` : "a whole"} heart. Now it's his.`, s: "" },
  };
  const c = copy[step];
  const nextStep = () => (step === "warm" ? goWarm() : step === "cheek" ? goCheek() : step === "ear" ? (whisper ? setStep("kiss") : goEar()) : step === "kiss" ? goKiss() : next());

  return (
    <section className={`td-sec td-cere${blush ? " is-blush" : ""}${whisper && step === "ear" ? " is-hush" : ""}`}>
      <header className="td-head">
        <p className="td-kick">{c.k}</p>
        <h2 className="td-h">{c.h}</h2>
        {c.s && <p className="td-sub">{c.s}</p>}
      </header>
      <div ref={stage} className={`td-cereStage is-${step}`}>
        {step === "warm" && (
          <>
            <span className="td-hand is-l" aria-hidden />
            <span className="td-hand is-r" aria-hidden />
          </>
        )}
        {step === "cheek" && (
          <div ref={cheekRef} className="td-target is-cheek" aria-hidden>
            <span>☺</span>
            <small>cheek</small>
          </div>
        )}
        {step === "ear" && !whisper && (
          <div ref={earRef} className="td-target is-ear" aria-hidden>
            <span>👂</span>
            <small>ear</small>
          </div>
        )}
        <div
          className={`td-heartGrab${step === "warm" ? " is-warm" : ""}`}
          style={{ transform: pos ? `translate(${pos.x}px, ${pos.y}px)` : undefined, transition: pos ? "none" : "transform .45s cubic-bezier(.3,1.5,.5,1)", ["--warm" as string]: String(warm), touchAction: "none" }}
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerCancel={up}
          role="button"
          tabIndex={0}
          aria-label={step === "kiss" ? "Kiss the heart" : "The fabric heart"}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") nextStep();
          }}
        >
          <FabricHeart initial={initial} kissed={kissed} className={kissed ? "is-kissed" : ""} />
        </div>
        {whisper && (
          <div className="td-whisper" aria-live="polite">
            <Typewriter text={fill(x.heartWhisper || "Whenever you hold him, I'm holding you back.", data)} speed={reduced ? 0 : 55} onDone={whisperDone} />
          </div>
        )}
        {step === "done" && <span className="td-stickC">{sticker("pt2-heart", 80)}</span>}
      </div>
      <div className="td-actions">
        {step === "done" ? (
          <button type="button" className="td-btn" onClick={() => { sfx("whoosh", { gain: 0.5 }); next(); }}>
            Put it inside him →
          </button>
        ) : (
          <button type="button" className="td-link" onClick={nextStep}>
            {step === "kiss" ? "Kiss it" : "Next"}
          </button>
        )}
      </div>
      {blush && <div className="td-blush" aria-hidden />}
    </section>
  );
}

export function Stitch({ data, x, name, look, fluff, reduced, sfx, sticker, next, onPeak }: SceneProps & { onPeak: () => void }) {
  const [dropped, setDropped] = useState(reduced);
  const [n, setN] = useState(0);
  const [awake, setAwake] = useState(false);
  const [talk, setTalk] = useState(false);
  const { drop } = useSongDrop();
  const box = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const nRef = useRef(0);
  const timers = useRef<number[]>([]);
  useEffect(() => {
    if (!reduced) {
      timers.current.push(window.setTimeout(() => { setDropped(true); sfx("td-thump"); haptic([30, 120, 20]); }, 900));
    }
    const t = timers.current;
    return () => t.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const wake = () => {
    setAwake(true);
    onPeak();
    sfx("td-glint");
    sfx("td-squeak", { at: 0.5 });
    if (!reduced) burst({ kind: "hearts", origin: { x: 0.5, y: 0.45 } });
    timers.current.push(window.setTimeout(() => setTalk(true), reduced ? 200 : 1500));
  };
  const close = () => {
    if (!dropped || nRef.current >= 5) return;
    nRef.current += 1;
    const k = nRef.current;
    setN(k);
    sfx("td-needle", { detune: k * 60 });
    sfx("td-thread", { at: 0.06 });
    haptic(10);
    if (k === 5) drop(wake);
  };
  const move = (e: RPointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    const r = box.current?.getBoundingClientRect();
    if (!r) return;
    const y = ((e.clientY - r.top) / r.height) * 250;
    const want = STITCH_Y[nRef.current];
    if (want != null && y >= want - 2) close();
  };

  const words = fill(x.firstWords || `Hi! ${data.senderName || "Someone"} sent me. I'm yours now.`, data);

  return (
    <section className="td-sec">
      <header className="td-head">
        <p className="td-kick">{awake ? `${name} is awake` : dropped ? `Stitch ${Math.min(5, n + 1)} of 5` : "In it goes…"}</p>
        <h2 className="td-h">{awake ? "Hello, you." : dropped ? "Sew him shut" : "Gently…"}</h2>
        {!awake && dropped && <p className="td-sub">Drag down the seam, or tap the needle.</p>}
      </header>
      <div className="td-stitchStage">
        <div
          ref={box}
          className={`td-stitchTeddy${awake ? " is-alive" : ""}`}
          onPointerDown={(e) => { e.currentTarget.setPointerCapture?.(e.pointerId); dragging.current = true; move(e); }}
          onPointerMove={move}
          onPointerUp={() => (dragging.current = false)}
          onPointerCancel={() => (dragging.current = false)}
          style={{ touchAction: "none" }}
        >
          <Teddy {...look} fluff={Math.max(1, fluff)} awake={awake} glow={dropped} stitches={awake ? null : dropped ? n : 0} className={awake ? "td-wake" : ""} />
          {!dropped && <FabricHeart className="td-dropHeart" initial={(x.pawInitial || "").slice(0, 1)} />}
          {talk && (
            <div className="td-bubble" role="status">
              {words}
            </div>
          )}
        </div>
        {!awake && dropped && (
          <button type="button" className="td-needleBtn" onClick={close} aria-label={`Sew stitch ${n + 1} of 5`}>
            <span aria-hidden>🪡</span> {n}/5
          </button>
        )}
      </div>
      {talk && (
        <>
          <span className="td-stick">{sticker("pt3-alive", 70)}</span>
          <div className="td-voice">
            <VoiceNotePlayer
              label={<span className="td-voiceLbl">Press {name}'s paw — there's a voice box inside</span>}
              accent="#FF8FB8"
              track="rgba(255,248,240,.45)"
              fallback={
                <PawNote />
              }
            />
          </div>
          <div className="td-actions">
            <button type="button" className="td-btn" onClick={() => { sfx("td-torch"); next(); }}>
              Lights out →
            </button>
          </div>
        </>
      )}
    </section>
  );
}

function PawNote() {
  const p = usePremium();
  if (!p.premium.voiceCaption) return null;
  return (
    <div className="td-pawNote">
      <span className="td-voiceLbl">A note sewn into his paw</span>
      <i>“{p.premium.voiceCaption}”</i>
    </div>
  );
}
