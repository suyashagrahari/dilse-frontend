"use client";

// ─── Catch — the playfield ───────────────────────────────────────────────────
//
// Owns the canvas + Engine, and the DOM layers over it: the HUD (written
// straight to the DOM from the engine's per-frame snapshot, never through React
// state), the countdown, the first-run tutorial, the "line caught" toast, the
// level banner, the photo pop and the pause card.

import { useCallback, useEffect, useRef, useState } from "react";
import { cropStyle, photoCrop } from "../../dedication/components/types";
import { sfxCatch, sfxHit, arpeggio } from "@/lib/webAudio";
import { Engine, type Hud, type RunResult } from "./engine";
import { LEVELS } from "./theme";
import type { CatchData } from "./types";
import { markSeenTutorial, readSeenTutorial } from "./storage";

export interface Loaded {
  face: HTMLImageElement | null;
  photos: (HTMLImageElement | null)[];
}

interface Props {
  data: CatchData;
  loaded: Loaded;
  reduced: boolean;
  sound: boolean;
  onPiece: (idx: number) => void;
  onPhoto: (idx: number) => void;
  onEnd: (r: RunResult) => void;
  onQuit: () => void;
  onRestart: () => void;
}

type Toast = { id: number; idx: number };

export default function GameStage({ data, loaded, reduced, sound, onPiece, onPhoto, onEnd, onQuit, onRestart }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Engine | null>(null);

  const scoreRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const livesRef = useRef<HTMLSpanElement>(null);
  const comboRef = useRef<HTMLDivElement>(null);
  const piecesRef = useRef<HTMLSpanElement>(null);
  const photosRef = useRef<HTMLSpanElement>(null);
  const powersRef = useRef<HTMLDivElement>(null);
  const prevHud = useRef<Partial<Hud>>({});

  const [count, setCount] = useState<number>(3);
  const [tutorial] = useState(() => !readSeenTutorial());
  const [toast, setToast] = useState<Toast | null>(null);
  const [level, setLevel] = useState<number | null>(null);
  const [photo, setPhoto] = useState<number | null>(null);
  const [paused, setPaused] = useState(false);

  const cbs = useRef({ onPiece, onPhoto, onEnd, sound });
  useEffect(() => {
    cbs.current = { onPiece, onPhoto, onEnd, sound };
  });

  const writeHud = useCallback((h: Hud) => {
    const p = prevHud.current;
    if (p.score !== h.score && scoreRef.current) {
      scoreRef.current.textContent = h.score.toLocaleString("en-IN");
      scoreRef.current.classList.remove("is-bump");
      void scoreRef.current.offsetWidth;
      scoreRef.current.classList.add("is-bump");
    }
    if (barRef.current) barRef.current.style.transform = `scaleX(${1 - h.progress})`;
    if (p.lives !== h.lives && livesRef.current) {
      livesRef.current.querySelectorAll("i").forEach((el, i) => el.classList.toggle("is-lost", i >= h.lives));
    }
    if ((p.combo !== h.combo || p.mult !== h.mult) && comboRef.current) {
      const el = comboRef.current;
      el.classList.toggle("is-on", h.combo >= 2);
      el.innerHTML = `<b>${h.combo}×</b> combo${h.mult > 1 ? `<em>×${h.mult}</em>` : ""}`;
      el.classList.remove("is-pop");
      void el.offsetWidth;
      el.classList.add("is-pop");
    }
    if (p.pieces !== h.pieces && piecesRef.current) piecesRef.current.textContent = `${h.pieces}/${data.goodItems.length}`;
    if (p.photos !== h.photos && photosRef.current) photosRef.current.textContent = `${h.photos}/${data.photos.length}`;
    if (powersRef.current) {
      const el = powersRef.current;
      const m = el.children[0] as HTMLElement;
      const d = el.children[1] as HTMLElement;
      const s = el.children[2] as HTMLElement;
      m.style.display = h.magnet > 0 ? "" : "none";
      d.style.display = h.double > 0 ? "" : "none";
      s.style.display = h.shield ? "" : "none";
      m.style.setProperty("--p", String(h.magnet));
      d.style.setProperty("--p", String(h.double));
    }
    prevHud.current = h;
  }, [data.goodItems.length, data.photos.length]);

  // ── engine ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const eng = new Engine(
      canvas,
      {
        pieces: data.goodItems.map((g) => ({ emoji: g.emoji })),
        photos: data.photos.map((p, i) => ({ key: `${i}:${p.url.slice(-24)}:${p.cropX}:${p.cropY}:${p.scale}`, img: loaded.photos[i] ?? null, crop: photoCrop(p) })),
        bads: data.badItems.map((b) => ({ emoji: b.emoji, label: b.label })),
        face: { img: loaded.face, crop: { x: data.faceCropX, y: data.faceCropY, scale: data.faceScale } },
        initial: data.recipientName,
        name: data.recipientName,
        durationMs: data.durationMs,
        reduced,
      },
      {
        onPiece: (idx) => {
          setToast({ id: Date.now(), idx });
          cbs.current.onPiece(idx);
          if (cbs.current.sound) sfxCatch(prevHud.current.combo ?? 0);
        },
        onPhoto: (idx) => {
          engineRef.current?.pause();
          setPhoto(idx);
          cbs.current.onPhoto(idx);
          if (cbs.current.sound) arpeggio([0, 4, 7, 12], 523, 70);
        },
        onLevel: (l) => setLevel(l),
        onHit: () => {
          if (cbs.current.sound) sfxHit();
          try {
            navigator.vibrate?.(40);
          } catch {
            /* no haptics */
          }
        },
        onPower: () => {
          if (cbs.current.sound) arpeggio([0, 7, 12], 660, 60);
        },
        onEnd: (r) => cbs.current.onEnd(r),
        onHud: writeHud,
      },
    );
    engineRef.current = eng;
    const ro = new ResizeObserver(() => {
      const r = wrap.getBoundingClientRect();
      eng.resize(r.width, r.height);
    });
    ro.observe(wrap);
    const r = wrap.getBoundingClientRect();
    eng.resize(r.width, r.height);
    eng.idle();
    return () => {
      ro.disconnect();
      eng.destroy();
      engineRef.current = null;
    };
    // The engine is built once per run; the stage is remounted for a new run.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── countdown → start ─────────────────────────────────────────────────────
  useEffect(() => {
    if (count < 0) return;
    const ms = count === 3 && tutorial ? 2200 : count === 0 ? 450 : 620;
    const t = window.setTimeout(() => {
      if (count === 0) {
        engineRef.current?.start();
        if (tutorial) markSeenTutorial();
      }
      setCount((c) => c - 1);
    }, ms);
    return () => window.clearTimeout(t);
  }, [count, tutorial]);

  // ── toasts + banners auto-hide ────────────────────────────────────────────
  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast((x) => (x && x.id === toast.id ? null : x)), 3200);
    return () => window.clearTimeout(t);
  }, [toast]);
  useEffect(() => {
    if (level === null) return;
    const t = window.setTimeout(() => setLevel(null), 1900);
    return () => window.clearTimeout(t);
  }, [level]);

  // ── pause / resume ────────────────────────────────────────────────────────
  const doPause = useCallback(() => {
    const e = engineRef.current;
    if (!e || count >= 0 || photo !== null) return;
    e.pause();
    setPaused(true);
  }, [count, photo]);
  const doResume = useCallback(() => {
    setPaused(false);
    engineRef.current?.resume();
  }, []);
  const closePhoto = useCallback(() => {
    setPhoto(null);
    if (!paused) engineRef.current?.resume();
  }, [paused]);

  useEffect(() => {
    const vis = () => {
      if (document.hidden) doPause();
    };
    document.addEventListener("visibilitychange", vis);
    window.addEventListener("blur", doPause);
    return () => {
      document.removeEventListener("visibilitychange", vis);
      window.removeEventListener("blur", doPause);
    };
  }, [doPause]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.code === "Escape" || e.code === "KeyP") {
        if (photo !== null) closePhoto();
        else if (paused) doResume();
        else doPause();
        return;
      }
      if (photo !== null && (e.code === "Enter" || e.code === "Space")) {
        e.preventDefault();
        closePhoto();
        return;
      }
      if (["ArrowLeft", "ArrowRight", "KeyA", "KeyD"].includes(e.code)) {
        e.preventDefault();
        engineRef.current?.key(e.code, true);
      }
    };
    const up = (e: KeyboardEvent) => engineRef.current?.key(e.code, false);
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [photo, paused, doPause, doResume, closePhoto]);

  const item = toast ? data.goodItems[toast.idx] : null;
  const ph = photo !== null ? data.photos[photo] : null;

  return (
    <div className="ct-stage">
      <div
        ref={wrapRef}
        className="ct-canvasWrap"
        onPointerDown={(e) => {
          (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
          engineRef.current?.pointerDown(e.nativeEvent);
        }}
        onPointerMove={(e) => engineRef.current?.pointerMove(e.nativeEvent)}
        onPointerUp={(e) => engineRef.current?.pointerUp(e.nativeEvent)}
        onPointerCancel={(e) => engineRef.current?.pointerUp(e.nativeEvent)}
      >
        <canvas ref={canvasRef} className="ct-canvas" aria-label="Catch — drag left and right to catch the falling letter" />
      </div>

      {/* HUD */}
      <div className="ct-hud" aria-hidden>
        <div className="ct-hudRow">
          <div className="ct-score">
            <span className="ct-scoreIc">♥</span>
            <span ref={scoreRef} className="ct-scoreN">0</span>
          </div>
          <div className="ct-hudMid">
            <span className="ct-chip"><i>💌</i><span ref={piecesRef}>0/{data.goodItems.length}</span></span>
            {data.photos.length > 0 && (
              <span className="ct-chip"><i>📸</i><span ref={photosRef}>0/{data.photos.length}</span></span>
            )}
          </div>
          <span ref={livesRef} className="ct-lives">
            <i>♥</i>
            <i>♥</i>
            <i>♥</i>
          </span>
          <button type="button" className="ct-pauseBtn" onClick={doPause} aria-label="Pause" onPointerDown={(e) => e.stopPropagation()}>
            <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden>
              <rect x="6" y="5" width="4" height="14" rx="1.5" fill="currentColor" />
              <rect x="14" y="5" width="4" height="14" rx="1.5" fill="currentColor" />
            </svg>
          </button>
        </div>
        <div className="ct-timer">
          <span ref={barRef} className="ct-timerFill" />
        </div>
        <div className="ct-hudRow2">
          <div ref={comboRef} className="ct-combo" />
          <div ref={powersRef} className="ct-powers">
            <span className="ct-pw ct-pw--m" style={{ display: "none" }}>🧲</span>
            <span className="ct-pw ct-pw--d" style={{ display: "none" }}>×2</span>
            <span className="ct-pw ct-pw--s" style={{ display: "none" }}>🛡️</span>
          </div>
        </div>
      </div>

      {/* Line caught */}
      {item && (
        <div key={toast!.id} className="ct-lineToast" role="status" aria-live="polite">
          <span className="ct-ltEmoji">{item.emoji}</span>
          <div className="ct-ltBody">
            <p className="ct-ltKick">
              line {toast!.idx + 1} of {data.goodItems.length}
              {item.label ? <> · {item.label}</> : null}
            </p>
            <p className="ct-ltLine">{item.line}</p>
          </div>
        </div>
      )}

      {/* Level banner */}
      {level !== null && (
        <div key={level} className="ct-level" aria-live="polite">
          <p className="ct-levelN">LEVEL {level + 1}</p>
          <p className="ct-levelName">{LEVELS[level].name}</p>
          <p className="ct-levelSub">{LEVELS[level].sub}</p>
        </div>
      )}

      {/* Countdown + tutorial */}
      {count >= 0 && (
        <div className="ct-count">
          {tutorial && count === 3 ? (
            <div className="ct-tut">
              <div className="ct-tutHand" aria-hidden>
                <span>👆</span>
                <i />
              </div>
              <p className="ct-tutT">drag to move</p>
              <div className="ct-tutLegend">
                <span><b>💌</b> catch letter pieces</span>
                {data.photos.length > 0 && <span><b>📸</b> memories pop open</span>}
                <span><b>💗</b> hearts = points</span>
                {data.badItems.length > 0 && <span><b>💬</b> dodge the ick</span>}
                <span><b>🧲✨🛡️</b> power-ups</span>
              </div>
              <p className="ct-tutKeys">← → keys work too</p>
            </div>
          ) : (
            <span key={count} className="ct-countN">{count === 0 ? "GO!" : count}</span>
          )}
        </div>
      )}

      {/* Photo pop */}
      {ph && (
        <div className="ct-photoPop" role="dialog" aria-modal="true" aria-label={ph.caption || "A memory"} onClick={closePhoto}>
          <div className="ct-ppCard" onClick={(e) => e.stopPropagation()}>
            <span className="ct-ppSticker">MEMORY UNLOCKED</span>
            <div className="ct-ppPic">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={ph.url} alt={ph.caption || "a memory"} draggable={false} style={cropStyle(photoCrop(ph))} />
            </div>
            {ph.caption && <p className="ct-ppCap">{ph.caption}</p>}
            {ph.note && <p className="ct-ppNote">{ph.note}</p>}
            <button type="button" className="ct-btn ct-btn--pink ct-ppGo" onClick={closePhoto} autoFocus>
              keep catching ▶
            </button>
          </div>
        </div>
      )}

      {/* Pause */}
      {paused && (
        <div className="ct-pause" role="dialog" aria-modal="true" aria-label="Paused">
          <div className="ct-pauseCard">
            <p className="ct-pauseT">paused</p>
            <p className="ct-pauseSub">the letter will wait. it always does 💌</p>
            <button type="button" className="ct-btn ct-btn--pink" onClick={doResume} autoFocus>
              ▶ resume
            </button>
            <div className="ct-pauseRow">
              <button type="button" className="ct-btn ct-btn--ghost" onClick={onRestart}>↻ restart</button>
              <button type="button" className="ct-btn ct-btn--ghost" onClick={onQuit}>⌂ title</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

