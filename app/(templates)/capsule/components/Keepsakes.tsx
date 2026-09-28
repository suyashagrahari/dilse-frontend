"use client";

// ─── SCREEN 7 — what was kept inside ─────────────────────────────────────────
//
// Under the predictions, at the bottom of the capsule, are the things they put
// in on purpose: photos, each one made into a physical object — a polaroid, a
// strip of film, a card with a pressed flower on it — scattered where they
// landed, with a memory written on the back. Tap one and it comes up big; tap
// it again and it turns over.
//
// Under THOSE, flat against the bottom, is the letter. It is sealed with its
// own wax, and it is the last thing anyone reads. It gets its own ceremony:
// the seal breaks, the flap opens, the paper rises out.
//
// Reached from the scorecard and from the solo path alike — the keepsakes are
// not a two-player frame, and nothing here keeps score.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, RotateCw, X } from "lucide-react";
import { HeartBurst } from "../../_love/LoveKit";
import type { LovePhoto } from "../../_love/types";
import { cropStyle, photoCrop } from "../../dedication/components/types";
import { HAND, MONO, PALETTE, SERIF, UI, fmtSealDate, type Capsule } from "./types";
import { PaperTexture, WaxShards, WaxSeal } from "./paper";
import { useCapsuleTheme } from "./themeContext";
import { Frame, Kicker, TapButton, ThemedPortal } from "./ui";
import { useStepTimer } from "./useTick";
import { seededSpread, seededUnit } from "@/lib/seededRandom";
import { burst, sfxPaperSlide, sfxThunk, tone, unlockAudio } from "@/lib/webAudio";

type Kind = "polaroid" | "film" | "flower";
const KINDS: Kind[] = ["polaroid", "film", "flower"];
const kindOf = (i: number): Kind => KINDS[i % KINDS.length];

/** Physical objects keep their own colours in every theme; only the accents follow it. */
const OBJ = {
  polaroid: "#fdfcf7",
  film: "#161311",
  card: "#f6efdf",
  ink: "#2a2420",
  soft: "#6c6258",
  filmInk: "#f1a34a",
};

// ═══════════════════════════════════════════════════════════════════════════
// The objects
// ═══════════════════════════════════════════════════════════════════════════

function Photo({ p, radius = 2 }: { p: LovePhoto; radius?: number | string }) {
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", borderRadius: radius, background: "#ddd" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={p.url} alt="" draggable={false} loading="lazy" decoding="async" style={cropStyle(photoCrop(p))} />
    </div>
  );
}

function Tape({ seed, style }: { seed: string; style?: React.CSSProperties }) {
  return (
    <span
      aria-hidden
      style={{
        position: "absolute",
        top: -9,
        left: "50%",
        width: 62,
        height: 20,
        marginLeft: -31,
        transform: `rotate(${seededSpread(seed, "tape", 8).toFixed(1)}deg)`,
        background: "color-mix(in srgb, var(--lv-a2) 42%, rgba(255,255,255,.55))",
        boxShadow: "0 1px 2px rgba(0,0,0,.12)",
        zIndex: 2,
        ...style,
      }}
    />
  );
}

/** A pressed flower, drawn — five petals, a stem, a leaf. Gone slightly flat. */
function PressedFlower({ seed, size = 46 }: { seed: string; size?: number }) {
  const rot = seededSpread(seed, "flower", 30);
  return (
    <svg aria-hidden width={size} height={size * 1.5} viewBox="0 0 40 60" style={{ transform: `rotate(${rot.toFixed(1)}deg)`, opacity: 0.88 }}>
      <path d="M20 22 C 19 34, 22 44, 18 58" fill="none" strokeWidth="1.3" style={{ stroke: "color-mix(in srgb, var(--lv-a3) 70%, #4a5a2a)" }} />
      <path d="M19.5 40 C 12 36, 9 40, 8 44 C 13 45, 17 44, 19.5 40 Z" style={{ fill: "color-mix(in srgb, var(--lv-a3) 55%, #6c7d3e)" }} />
      {[0, 72, 144, 216, 288].map((a) => (
        <ellipse key={a} cx="20" cy="13" rx="4.6" ry="7.5" transform={`rotate(${a} 20 20)`} style={{ fill: "color-mix(in srgb, var(--lv-a1) 78%, white)", opacity: 0.9 }} />
      ))}
      <circle cx="20" cy="20" r="3.2" style={{ fill: "color-mix(in srgb, var(--lv-a3) 40%, #e7b93c)" }} />
    </svg>
  );
}

/** The front of one keepsake. `big` is the lightbox size. */
function KeepsakeFront({ p, i, big = false }: { p: LovePhoto; i: number; big?: boolean }) {
  const kind = kindOf(i);
  const seed = `ks-${i}-${p.url.slice(-10)}`;
  const cap = p.caption?.trim();

  if (kind === "film") {
    const holes = "repeating-linear-gradient(90deg, transparent 0 7px, rgba(250,240,225,.92) 7px 15px, transparent 15px 22px)";
    return (
      <div style={{ position: "relative", background: OBJ.film, padding: big ? "26px 12px 34px" : "18px 7px 24px", borderRadius: 3, boxShadow: "0 14px 26px -14px rgba(0,0,0,.75)" }}>
        <span aria-hidden style={{ position: "absolute", left: 6, right: 6, top: big ? 9 : 6, height: big ? 8 : 6, backgroundImage: holes, borderRadius: 1 }} />
        <span aria-hidden style={{ position: "absolute", left: 6, right: 6, bottom: big ? 20 : 14, height: big ? 8 : 6, backgroundImage: holes, borderRadius: 1 }} />
        <div style={{ position: "relative", aspectRatio: "4 / 3" }}>
          <Photo p={p} radius={2} />
          <span aria-hidden style={{ position: "absolute", inset: 0, boxShadow: "inset 0 0 18px rgba(0,0,0,.35)", borderRadius: 2 }} />
        </div>
        <p
          style={{
            position: "absolute",
            left: 10,
            right: 10,
            bottom: big ? 3 : 1,
            margin: 0,
            fontFamily: MONO,
            fontSize: big ? 12 : 9,
            color: OBJ.filmInk,
            letterSpacing: 1,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          ▸ {String(i + 1).padStart(2, "0")}A{cap ? ` · ${cap}` : ""}
        </p>
      </div>
    );
  }

  if (kind === "flower") {
    return (
      <div style={{ position: "relative", background: OBJ.card, padding: big ? "18px 18px 16px" : "11px 11px 10px", borderRadius: 6, boxShadow: "0 14px 26px -14px rgba(0,0,0,.6)" }}>
        <PaperTexture seed={`${seed}-card`} opacity={0.09} />
        <div style={{ position: "relative", aspectRatio: "4 / 5" }}>
          <Photo p={p} radius="999px 999px 6px 6px" />
          <span aria-hidden style={{ position: "absolute", inset: 0, borderRadius: "999px 999px 6px 6px", boxShadow: "inset 0 0 0 3px rgba(255,255,255,.55)" }} />
        </div>
        <div aria-hidden style={{ position: "absolute", right: big ? -6 : -10, bottom: big ? 8 : 2 }}>
          <PressedFlower seed={seed} size={big ? 44 : 30} />
        </div>
        {cap && (
          <p style={{ position: "relative", margin: big ? "12px 34px 0 0" : "7px 20px 0 0", fontFamily: SERIF, fontStyle: "italic", fontSize: big ? 21 : 14, lineHeight: 1.15, color: OBJ.ink }}>
            {cap}
          </p>
        )}
      </div>
    );
  }

  return (
    <div style={{ position: "relative", background: OBJ.polaroid, padding: big ? "14px 14px 0" : "8px 8px 0", borderRadius: 2, boxShadow: "0 14px 26px -14px rgba(0,0,0,.65)" }}>
      <Tape seed={seed} />
      <div style={{ position: "relative", aspectRatio: "1 / 1" }}>
        <Photo p={p} radius={1} />
      </div>
      <p
        style={{
          margin: 0,
          minHeight: big ? 64 : 38,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          fontFamily: HAND,
          fontWeight: 700,
          fontSize: big ? 27 : 17,
          lineHeight: 1,
          color: OBJ.ink,
          padding: "0 4px",
        }}
      >
        {cap || " "}
      </p>
    </div>
  );
}

/** The back: lined paper, a date stamp, the note in handwriting. */
function KeepsakeBack({ p, i, keptSince }: { p: LovePhoto; i: number; keptSince: string }) {
  const note = p.note?.trim();
  return (
    <div
      className="cp-lined"
      style={{
        position: "relative",
        height: "100%",
        minHeight: 320,
        textAlign: "left",
        background: "#fbf8f0",
        borderRadius: 6,
        padding: "22px 22px 20px",
        boxShadow: "0 18px 34px -16px rgba(0,0,0,.7)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <PaperTexture seed={`back-${i}`} opacity={0.08} />
      {/* The postage-stamp corner. */}
      <span
        aria-hidden
        style={{
          position: "absolute",
          right: 14,
          top: 14,
          width: 44,
          height: 52,
          display: "grid",
          placeItems: "center",
          fontSize: 22,
          background: "color-mix(in srgb, var(--lv-a1) 14%, #fff)",
          border: "2px dashed color-mix(in srgb, var(--lv-a1) 55%, transparent)",
          borderRadius: 3,
          transform: "rotate(6deg)",
        }}
      >
        {String(i + 1).padStart(2, "0")}
      </span>
      <p style={{ position: "relative", margin: 0, fontFamily: MONO, fontSize: 10.5, letterSpacing: 1.6, color: OBJ.soft }}>
        KEPT SINCE {keptSince.toUpperCase()}
      </p>
      {p.caption?.trim() && (
        <p style={{ position: "relative", margin: "8px 56px 0 0", fontFamily: HAND, fontWeight: 700, fontSize: 25, lineHeight: 1.05, color: "var(--lv-a1)" }}>
          {p.caption}
        </p>
      )}
      <p
        style={{
          position: "relative",
          margin: "14px 0 0",
          fontFamily: HAND,
          fontWeight: 500,
          fontSize: 24,
          lineHeight: "30px",
          color: OBJ.ink,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          flex: 1,
        }}
      >
        {note || "(nothing written on this one — some things don't need it)"}
      </p>
    </div>
  );
}

/** A GIF, taped in among the keepsakes like a sticker that won't stop moving. */
function GifSticker({ src, i }: { src: string; i: number }) {
  return (
    <div style={{ position: "relative", background: "#fff", padding: 6, borderRadius: 16, boxShadow: "0 14px 26px -14px rgba(0,0,0,.6)" }}>
      <Tape seed={`gif-${i}`} style={{ width: 44, marginLeft: -22 }} />
      <div style={{ position: "relative", aspectRatio: "1 / 1", borderRadius: 11, overflow: "hidden", background: "#f3f0ea" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt="" loading="lazy" decoding="async" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
      <p style={{ margin: "5px 0 1px", textAlign: "center", fontFamily: HAND, fontWeight: 700, fontSize: 15, color: OBJ.soft }}>still moving ✦</p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// The lightbox
// ═══════════════════════════════════════════════════════════════════════════

function KeepsakeViewer({
  photos,
  index,
  setIndex,
  onClose,
  keptSince,
}: {
  photos: LovePhoto[];
  index: number;
  setIndex: (i: number) => void;
  onClose: () => void;
  keptSince: string;
}) {
  const [flipped, setFlipped] = useState(false);
  const startX = useRef<number | null>(null);
  /** A swipe ends in a click on the card too; that click must not flip it. */
  const swiped = useRef(false);
  const p = photos[index];
  const n = photos.length;

  const go = useCallback(
    (d: number) => {
      unlockAudio();
      sfxPaperSlide();
      setFlipped(false);
      setIndex((index + d + n) % n);
    },
    [index, n, setIndex],
  );

  const flip = useCallback(() => {
    if (swiped.current) {
      swiped.current = false;
      return;
    }
    unlockAudio();
    tone({ freq: 520, toFreq: 700, ms: 90, type: "sine", gain: 0.06 });
    setFlipped((f) => !f);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [go, onClose]);

  if (!p) return null;

  return (
    <ThemedPortal>
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Keepsake ${index + 1} of ${n}`}
      className="fixed inset-0 z-[300] flex flex-col items-center"
      style={{ background: "rgba(12,9,16,.86)", paddingTop: "env(safe-area-inset-top, 0px)", paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="flex w-full items-center justify-between px-3 pt-3" style={{ maxWidth: 520 }}>
        <span style={{ fontFamily: MONO, fontSize: 12, color: "rgba(255,255,255,.75)", letterSpacing: 2, paddingLeft: 8 }}>
          {String(index + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
        </span>
        <button type="button" onClick={onClose} aria-label="Close" className="cp-press grid place-items-center rounded-full" style={{ width: 48, height: 48, color: "#fff", background: "rgba(255,255,255,.1)" }}>
          <X size={20} />
        </button>
      </div>

      <div
        className="flex w-full flex-1 items-center justify-center px-5"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
        onPointerDown={(e) => {
          startX.current = e.clientX;
        }}
        onPointerUp={(e) => {
          if (startX.current === null) return;
          const dx = e.clientX - startX.current;
          startX.current = null;
          if (Math.abs(dx) > 50 && n > 1) {
            swiped.current = true;
            go(dx < 0 ? 1 : -1);
            window.setTimeout(() => {
              swiped.current = false;
            }, 350);
          }
        }}
      >
        <button
          type="button"
          onClick={flip}
          aria-label={flipped ? "Turn back to the photo" : "Turn it over to read the note"}
          className="cp-focus"
          style={{ width: "min(84vw, 380px)", perspective: 1400, background: "none", border: 0, padding: 0, cursor: "pointer", touchAction: "pan-y" }}
        >
          <div key={index} className="cp-rise">
            <div className="cp-flip grid" style={{ transform: flipped ? "rotateY(180deg)" : "none" }}>
              <div className="cp-face" style={{ gridArea: "1 / 1", transform: "rotate(-1.2deg)" }}>
                <KeepsakeFront p={p} i={index} big />
              </div>
              <div className="cp-face" style={{ gridArea: "1 / 1", transform: "rotateY(180deg) rotate(1deg)" }}>
                <KeepsakeBack p={p} i={index} keptSince={keptSince} />
              </div>
            </div>
          </div>
        </button>
      </div>

      <div className="flex w-full items-center justify-center gap-3 px-5 pb-6 pt-2" style={{ maxWidth: 520 }}>
        {n > 1 && (
          <button type="button" onClick={() => go(-1)} aria-label="Previous keepsake" className="cp-press grid place-items-center rounded-full" style={{ width: 52, height: 52, color: "#fff", background: "rgba(255,255,255,.12)" }}>
            <ChevronLeft size={22} />
          </button>
        )}
        <button
          type="button"
          onClick={flip}
          className="cp-press inline-flex flex-1 items-center justify-center gap-2 rounded-full"
          style={{ minHeight: 52, maxWidth: 260, fontFamily: UI, fontWeight: 800, fontSize: 15, color: "#1a1320", background: "linear-gradient(115deg, var(--lv-a3), var(--lv-a2))" }}
        >
          <RotateCw size={16} /> {flipped ? "back to the photo" : "turn it over"}
        </button>
        {n > 1 && (
          <button type="button" onClick={() => go(1)} aria-label="Next keepsake" className="cp-press grid place-items-center rounded-full" style={{ width: 52, height: 52, color: "#fff", background: "rgba(255,255,255,.12)" }}>
            <ChevronRight size={22} />
          </button>
        )}
      </div>
    </div>
    </ThemedPortal>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// The letter
// ═══════════════════════════════════════════════════════════════════════════

type LetterBeat = "sealed" | "breaking" | "opening" | "open";

function SealedLetter({ capsule }: { capsule: Capsule }) {
  const theme = useCapsuleTheme();
  const reduce = useReducedMotion() ?? false;
  const [beat, setBeat] = useState<LetterBeat>("sealed");
  const [splitPx, setSplitPx] = useState(0);
  const [nope, setNope] = useState(false);

  const initials = `${capsule.pair.a.name.charAt(0)}${capsule.pair.b.name.charAt(0)}`;
  const question = capsule.lockQuestion.trim() || "last thing in here. ready?";
  const answer = capsule.lockAnswer.trim() || "break the seal";
  const gif = capsule.gifs[capsule.gifs.length - 1];

  const breakSeal = useCallback(() => {
    unlockAudio();
    sfxThunk();
    burst({ ms: 260, cutoff: 700, toCutoff: 2600, gain: 0.3, attack: 0 });
    setBeat("breaking");
  }, []);

  useStepTimer(beat === "breaking" && splitPx === 0 ? "split" : null, 30, () => setSplitPx(38));
  useStepTimer(beat === "breaking" ? "flap" : null, reduce ? 80 : 850, () => setBeat("opening"));
  useStepTimer(beat === "opening" ? "rise" : null, reduce ? 80 : 700, () => {
    sfxPaperSlide();
    setBeat("open");
  });

  if (beat === "open") {
    return (
      <div className="relative">
        <HeartBurst glyphs={theme.burst} />
        <article
          className="cp-rise relative overflow-hidden"
          style={{
            background: "var(--lv-paper)",
            color: "var(--lv-paper-ink)",
            borderRadius: 10,
            padding: "30px 24px 30px",
            boxShadow: "0 30px 60px -30px rgba(0,0,0,.6), 0 0 0 1px rgba(0,0,0,.05)",
          }}
        >
          <PaperTexture seed="letter-open" opacity={0.08} />
          <div className="relative flex items-start justify-between gap-3">
            <div>
              <p style={{ margin: 0, fontFamily: MONO, fontSize: 10.5, letterSpacing: 1.8, color: "var(--lv-paper-soft)" }}>
                SEALED {fmtSealDate(capsule.sealedOn, capsule.timezone).toUpperCase()}
              </p>
              <p style={{ margin: "3px 0 0", fontFamily: MONO, fontSize: 10.5, letterSpacing: 1.8, color: "var(--lv-paper-soft)" }}>READ LAST</p>
            </div>
            <div style={{ flexShrink: 0, opacity: 0.9 }}>
              <WaxSeal seed={`letter-${capsule.sealedOn}`} size={44} state="split" splitPx={8} initials={initials} />
            </div>
          </div>
          <div aria-hidden className="relative my-5" style={{ height: 1, background: "color-mix(in srgb, var(--lv-paper-ink) 14%, transparent)" }} />
          <p className="relative" style={{ margin: 0, fontFamily: SERIF, fontSize: 20, lineHeight: 1.58, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
            {capsule.letter}
          </p>
          {gif && (
            <div className="relative mt-6 flex justify-end">
              <div style={{ width: 118, transform: "rotate(4deg)" }}>
                <GifSticker src={gif} i={99} />
              </div>
            </div>
          )}
        </article>
      </div>
    );
  }

  const opening = beat === "opening";

  return (
    <div className="flex flex-col items-center">
      <p className="text-center" style={{ margin: "0 0 18px", fontFamily: SERIF, fontStyle: "italic", fontSize: 24, lineHeight: 1.25, color: PALETTE.ink }}>
        {question}
      </p>

      <div className="relative w-full" style={{ maxWidth: 400, aspectRatio: "1.5 / 1", perspective: 900 }}>
        {/* The envelope body. */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ background: "var(--lv-paper)", borderRadius: 10, boxShadow: "0 28px 50px -26px rgba(0,0,0,.65), 0 0 0 1px rgba(0,0,0,.06)" }}
        >
          <PaperTexture seed="envelope" opacity={0.09} />
          {/* The paper inside, peeking up as the flap opens. */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              left: "8%",
              right: "8%",
              top: opening ? "8%" : "22%",
              bottom: 0,
              background: "#fffdf7",
              borderRadius: "6px 6px 0 0",
              boxShadow: "0 -4px 12px -6px rgba(0,0,0,.2)",
              transition: "top 700ms cubic-bezier(.2,.8,.25,1)",
            }}
          >
            <div className="cp-lined" style={{ position: "absolute", inset: "18px 18px 0" }} />
          </div>
          {/* Pocket folds. */}
          <div aria-hidden style={{ position: "absolute", inset: 0, background: "color-mix(in srgb, var(--lv-paper-ink) 7%, var(--lv-paper))", clipPath: "polygon(0 0, 50% 58%, 100% 0, 100% 100%, 0 100%)" }} />
          <div aria-hidden style={{ position: "absolute", inset: 0, background: "color-mix(in srgb, var(--lv-paper-ink) 4%, var(--lv-paper))", clipPath: "polygon(0 100%, 50% 50%, 100% 100%)" }} />
          <p style={{ position: "absolute", left: 0, right: 0, bottom: 16, margin: 0, textAlign: "center", fontFamily: HAND, fontWeight: 700, fontSize: 22, color: "var(--lv-paper-soft)" }}>
            to be read last
          </p>
        </div>

        {/* The flap, hinged at the top. */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            height: "60%",
            transformOrigin: "50% 0%",
            transform: opening ? "rotateX(178deg)" : "none",
            transition: "transform 700ms cubic-bezier(.3,.7,.2,1)",
            zIndex: opening ? 0 : 2,
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "color-mix(in srgb, var(--lv-paper-ink) 11%, var(--lv-paper))",
              clipPath: "polygon(0 0, 100% 0, 50% 100%)",
              filter: "drop-shadow(0 3px 3px rgba(0,0,0,.15))",
            }}
          />
        </div>

        {/* The wax. */}
        {!opening && (
          <div className="absolute" style={{ left: "50%", top: "60%", width: 92, height: 92, marginLeft: -46, marginTop: -46, zIndex: 3 }}>
            <div className={nope ? "cp-nope" : undefined} onAnimationEnd={() => setNope(false)}>
              <WaxSeal seed={`letter-${capsule.sealedOn}`} size={92} state={splitPx > 0 ? "split" : "whole"} splitPx={splitPx} initials={initials} />
            </div>
            {beat === "breaking" && <WaxShards seed={`letter-shards-${capsule.sealedOn}`} reduced={reduce} />}
          </div>
        )}
      </div>

      <div className="mt-7 w-full" style={{ maxWidth: 320 }}>
        <TapButton full tone="wax" onClick={breakSeal} disabled={beat !== "sealed"} ariaLabel={answer}>
          {answer}
        </TapButton>
        <button
          type="button"
          onClick={() => setNope(true)}
          className="mx-auto mt-1 block"
          style={{ minHeight: 44, fontFamily: MONO, fontSize: 11, color: PALETTE.inkSoft, background: "none" }}
        >
          not yet
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// The screen
// ═══════════════════════════════════════════════════════════════════════════

type Cell = { kind: "photo"; i: number } | { kind: "gif"; src: string; g: number };

export default function KeepsakesScreen({
  capsule,
  onBack,
  backLabel,
  footer,
}: {
  capsule: Capsule;
  onBack?: () => void;
  backLabel?: string;
  footer?: React.ReactNode;
}) {
  const theme = useCapsuleTheme();
  const [open, setOpen] = useState<number | null>(null);
  const keptSince = fmtSealDate(capsule.sealedOn, capsule.timezone);
  const photos = capsule.photos;

  // GIFs are taped in among the photos — after the 2nd and the 5th — so the
  // pile reads as one capsule's worth of stuff, not two separate galleries.
  const cells: Cell[] = useMemo(() => {
    const out: Cell[] = [];
    const gifs = capsule.gifs.slice(0, 2);
    photos.forEach((_, i) => {
      out.push({ kind: "photo", i });
      if (i === 1 && gifs[0]) out.push({ kind: "gif", src: gifs[0], g: 0 });
      if (i === 4 && gifs[1]) out.push({ kind: "gif", src: gifs[1], g: 1 });
    });
    gifs.forEach((src, g) => {
      if (!out.some((c) => c.kind === "gif" && c.g === g)) out.push({ kind: "gif", src, g });
    });
    return out;
  }, [photos, capsule.gifs]);

  const confetti = useMemo(
    () =>
      Array.from({ length: 16 }, (_, k) => ({
        k,
        x: Math.round(seededUnit("confetti", `x${k}`) * 96),
        y: Math.round(seededUnit("confetti", `y${k}`) * 96),
        s: 10 + Math.round(seededUnit("confetti", `s${k}`) * 10),
        ch: theme.confetti[k % theme.confetti.length],
      })),
    [theme.confetti],
  );

  const hasLetter = capsule.letter.trim().length > 0;

  return (
    <Frame seed="keepsakes" wide>
      <div className="px-4 pb-14 pt-16 sm:px-8">
        <header className="text-center">
          <Kicker colour="var(--lv-a1)">at the bottom of the capsule</Kicker>
          <h1 style={{ margin: "10px 0 0", fontFamily: UI, fontWeight: 800, fontSize: "clamp(36px, 10vw, 60px)", lineHeight: 0.98, letterSpacing: "-0.045em", color: PALETTE.ink }}>
            things{" "}
            <span style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 400, letterSpacing: "-0.02em", background: "linear-gradient(100deg, var(--lv-a1), var(--lv-a2) 55%, var(--lv-a3))", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", paddingRight: 4 }}>
              kept
            </span>{" "}
            inside.
          </h1>
          {photos.length > 0 && (
            <p style={{ margin: "12px 0 0", fontFamily: MONO, fontSize: 12, letterSpacing: 1, color: PALETTE.inkSoft }}>
              {photos.length} keepsake{photos.length === 1 ? "" : "s"} · tap one to turn it over
            </p>
          )}
        </header>

        {cells.length > 0 && (
          <div
            className="relative mt-8 overflow-hidden"
            style={{
              borderRadius: 30,
              padding: "30px 16px 34px",
              background: `radial-gradient(120% 70% at 50% 0%, color-mix(in srgb, ${PALETTE.metalLo} 70%, #000) 0%, color-mix(in srgb, ${PALETTE.metalLo} 88%, #000) 60%, color-mix(in srgb, ${PALETTE.metalLo} 60%, #000) 100%)`,
              boxShadow: `inset 0 22px 40px -18px rgba(0,0,0,.8), inset 0 0 0 6px color-mix(in srgb, ${PALETTE.metal} 70%, transparent), 0 30px 60px -34px rgba(0,0,0,.7)`,
            }}
          >
            {/* Whatever else fell in. */}
            {confetti.map((c) => (
              <span
                key={c.k}
                aria-hidden
                style={{ position: "absolute", left: `${c.x}%`, top: `${c.y}%`, fontSize: c.s, color: "var(--lv-a3)", opacity: 0.28, pointerEvents: "none" }}
              >
                {c.ch}
              </span>
            ))}

            <div className="relative grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 sm:gap-x-7 sm:gap-y-9">
              {cells.map((c, idx) => {
                const seed = c.kind === "photo" ? `cell-${c.i}` : `gif-${c.g}`;
                const tilt = seededSpread(seed, "tilt", 6.5);
                const dy = idx % 2 ? 14 : 0;
                const style = {
                  "--tilt": `${tilt.toFixed(1)}deg`,
                  animationDelay: `${120 + idx * 90}ms`,
                  marginTop: dy,
                } as React.CSSProperties;
                if (c.kind === "gif") {
                  return (
                    <div key={`g${c.g}`} className="cp-drop" style={{ ...style, padding: "0 8%" }}>
                      <GifSticker src={c.src} i={c.g} />
                    </div>
                  );
                }
                const p = photos[c.i];
                return (
                  <button
                    key={`p${c.i}-${p.url.slice(-12)}`}
                    type="button"
                    onClick={() => {
                      unlockAudio();
                      sfxPaperSlide();
                      setOpen(c.i);
                    }}
                    aria-label={`Keepsake ${c.i + 1}${p.caption ? `: ${p.caption}` : ""}. Open it.`}
                    className="cp-drop cp-focus lv-tile relative block text-left"
                    style={{ ...style, background: "none", border: 0, padding: 0, cursor: "pointer" }}
                  >
                    <KeepsakeFront p={p} i={c.i} />
                    {p.note?.trim() && (
                      <span
                        aria-hidden
                        style={{
                          position: "absolute",
                          right: -6,
                          bottom: -8,
                          padding: "3px 8px",
                          borderRadius: 99,
                          background: "var(--lv-chip)",
                          color: "var(--lv-chip-ink)",
                          fontFamily: UI,
                          fontWeight: 800,
                          fontSize: 10,
                          letterSpacing: ".06em",
                          boxShadow: "0 6px 12px -6px rgba(0,0,0,.5)",
                          transform: "rotate(-4deg)",
                        }}
                      >
                        ↻ note
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {hasLetter && (
          <section className="mx-auto mt-14" style={{ maxWidth: 520 }}>
            <div className="mb-6 text-center">
              <Kicker colour="var(--lv-a1)">one more thing</Kicker>
              <h2 style={{ margin: "8px 0 0", fontFamily: UI, fontWeight: 800, fontSize: "clamp(26px, 7vw, 38px)", lineHeight: 1.02, letterSpacing: "-0.035em", color: PALETTE.ink }}>
                a letter, sealed at the very bottom.
              </h2>
            </div>
            <SealedLetter capsule={capsule} />
          </section>
        )}

        <div className="mx-auto mt-12 flex flex-col items-center gap-2" style={{ maxWidth: 320 }}>
          {onBack && (
            <TapButton full tone="quiet" onClick={onBack}>
              {backLabel ?? "back"}
            </TapButton>
          )}
        </div>
        {footer}
      </div>

      {open !== null && (
        <KeepsakeViewer photos={photos} index={open} setIndex={setOpen} onClose={() => setOpen(null)} keptSince={keptSince} />
      )}
    </Frame>
  );
}

/** Whether a capsule has anything under the predictions at all. Old ones don't. */
export const hasKeepsakes = (c: Capsule): boolean => c.photos.length > 0 || c.gifs.length > 0 || c.letter.trim().length > 0;
