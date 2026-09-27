"use client";

// ─── Love kit — what the hub's sheets show ───────────────────────────────────
//
//   PhotoStory    one photo at a time, framed exactly as the sender framed it,
//                 with its little letter beside it (below it on a phone);
//                 swipe / arrows / thumbnails to move.
//   LetterReveal  a sealed envelope that opens into the main letter.
//   GifBoard      the GIFs as big tilted stickers.
//
// `loveTiles()` builds the three standard hub tiles from the love-kit fields,
// so every template gets the same photos / letter / GIFs tiles for free and
// only adds its own.

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cropStyle, photoCrop } from "../dedication/components/types";
import { GROTESK, ITALIC } from "./LoveKit";
import { EnvelopeArt, GifArt, PhotoStackArt, type HubTile } from "./MemoryHub";
import { V } from "./theme";
import type { LovePhoto } from "./types";

const TAPES = ["#ffd27a", "#ffb3cc", "#b59bff", "#d8ff5c"];

const STORY_CSS = `
.lv-story { display: grid; grid-template-columns: minmax(0, 1fr); gap: 16px; align-items: start; }
@media (min-width: 768px) { .lv-story { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 22px; align-items: stretch; } }
.lv-thumbs { display: flex; gap: 8px; overflow-x: auto; padding: 4px 2px 6px; scrollbar-width: none; }
.lv-thumbs::-webkit-scrollbar { display: none; }
`;

export function PhotoStory({ photos, reduceMotion, start = 0 }: { photos: LovePhoto[]; reduceMotion: boolean; start?: number }) {
  const n = photos.length;
  const [i, setI] = useState(Math.min(start, Math.max(0, n - 1)));
  const [dir, setDir] = useState(1);
  const go = useCallback(
    (d: number) => {
      setDir(d);
      setI((x) => (x + d + n) % n);
    },
    [n],
  );
  const jump = (to: number) => {
    setDir(to > i ? 1 : -1);
    setI(to);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  // Swipe: a horizontal drag of 50px moves one photo.
  const startX = useRef<number | null>(null);
  const onDown = (e: React.PointerEvent) => (startX.current = e.clientX);
  const onUp = (e: React.PointerEvent) => {
    if (startX.current === null) return;
    const dx = e.clientX - startX.current;
    startX.current = null;
    if (Math.abs(dx) > 50 && n > 1) go(dx < 0 ? 1 : -1);
  };

  if (!n) return <Empty text="No photos yet — add a few in the form 📸" />;
  const p = photos[i];

  return (
    <div>
      <style>{STORY_CSS}</style>
      <AnimatePresence mode="wait" initial={false} custom={dir}>
        <motion.div
          key={i}
          custom={dir}
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, x: dir * 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: dir * -40 }}
          transition={{ duration: 0.22 }}
          className="lv-story"
        >
          <div onPointerDown={onDown} onPointerUp={onUp} style={{ touchAction: "pan-y", position: "relative", background: "#fffdf7", padding: "12px 12px 14px", borderRadius: 8, transform: "rotate(-1deg)", boxShadow: `0 26px 50px -24px ${V.shadow}`, maxWidth: 440, width: "100%", justifySelf: "center" }}>
            <span aria-hidden style={{ position: "absolute", top: -10, left: "50%", width: 76, height: 22, marginLeft: -38, background: TAPES[i % TAPES.length], opacity: 0.9, transform: "rotate(-4deg)", borderRadius: 2, zIndex: 1 }} />
            <div style={{ position: "relative", aspectRatio: "4 / 5", overflow: "hidden", borderRadius: 4, background: "#eee6dc" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.url} alt={p.caption || `Photo ${i + 1}`} draggable={false} style={cropStyle(photoCrop(p))} />
              {n > 1 && (
                <span style={{ position: "absolute", top: 8, right: 8, padding: "3px 9px", borderRadius: 999, background: "rgba(0,0,0,.55)", color: "#fff", fontFamily: GROTESK, fontSize: 12, fontWeight: 800 }}>
                  {i + 1}/{n}
                </span>
              )}
            </div>
            <p style={{ margin: "10px 2px 0", fontFamily: ITALIC, fontStyle: "italic", fontSize: 21, lineHeight: 1.15, color: "#241f1b" }}>{p.caption || "a moment ✨"}</p>
          </div>

          <div
            style={{
              position: "relative",
              borderRadius: 20,
              padding: "20px 20px 18px",
              background: `repeating-linear-gradient(${"var(--lv-paper)"} 0 31px, color-mix(in srgb, var(--lv-paper-soft) 28%, var(--lv-paper)) 31px 32px)`,
              color: V.paperInk,
              boxShadow: `0 26px 50px -24px ${V.shadow}`,
              display: "flex",
              flexDirection: "column",
              minHeight: 180,
            }}
          >
            <p style={{ margin: 0, fontFamily: GROTESK, fontSize: 11, fontWeight: 800, letterSpacing: ".2em", textTransform: "uppercase", color: V.a1 }}>💌 a little letter</p>
            <p style={{ margin: "10px 0 0", fontFamily: ITALIC, fontStyle: "italic", fontSize: 22, lineHeight: "32px", whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>
              {p.note || "No words needed for this one. Just look at us. 🥹"}
            </p>
            {n > 1 && (
              <div style={{ marginTop: "auto", paddingTop: 16, display: "flex", gap: 10 }}>
                <NavBtn label="Previous photo" onClick={() => go(-1)}>
                  <ChevronLeft size={20} />
                </NavBtn>
                <NavBtn label="Next photo" onClick={() => go(1)} wide>
                  next memory <ChevronRight size={18} />
                </NavBtn>
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {n > 1 && (
        <div className="lv-thumbs" style={{ marginTop: 16 }} role="tablist" aria-label="All photos">
          {photos.map((ph, k) => (
            <button
              key={`${k}-${ph.url.slice(-12)}`}
              type="button"
              role="tab"
              aria-selected={k === i}
              aria-label={`Photo ${k + 1}${ph.caption ? `: ${ph.caption}` : ""}`}
              onClick={() => jump(k)}
              className="lv-focus"
              style={{
                position: "relative",
                flexShrink: 0,
                width: 58,
                aspectRatio: "4 / 5",
                overflow: "hidden",
                borderRadius: 10,
                padding: 0,
                cursor: "pointer",
                border: k === i ? `3px solid ${V.a1}` : `2px solid ${V.edge}`,
                opacity: k === i ? 1 : 0.7,
                background: "#eee6dc",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={ph.url} alt="" loading="lazy" draggable={false} style={cropStyle(photoCrop(ph))} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function NavBtn({ label, onClick, wide, children }: { label: string; onClick: () => void; wide?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="lv-focus"
      style={{
        flex: wide ? 1 : "0 0 auto",
        minWidth: 48,
        height: 48,
        borderRadius: 999,
        border: "none",
        cursor: "pointer",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        background: wide ? V.grad : "rgba(0,0,0,.07)",
        color: wide ? "#fff" : V.paperInk,
        fontFamily: GROTESK,
        fontWeight: 800,
        fontSize: 15,
      }}
    >
      {children}
    </button>
  );
}

// ─── The main letter ─────────────────────────────────────────────────────────

export function LetterReveal({ letter, from, to, reduceMotion, sign }: { letter: string; from: string; to: string; reduceMotion: boolean; sign?: string }) {
  const [open, setOpen] = useState(reduceMotion);
  useEffect(() => {
    if (open) return;
    const t = window.setTimeout(() => setOpen(true), 900);
    return () => window.clearTimeout(t);
  }, [open]);

  if (!letter.trim()) return <Empty text="No letter yet — write one in the form 💌" />;

  return (
    <div style={{ maxWidth: 620, margin: "0 auto" }}>
      <AnimatePresence initial={false} mode="wait">
        {!open ? (
          <motion.button
            key="env"
            type="button"
            onClick={() => setOpen(true)}
            exit={{ opacity: 0, y: -30, scale: 0.9 }}
            aria-label="Open the letter"
            style={{ display: "block", position: "relative", width: "100%", height: 220, border: "none", background: "transparent", cursor: "pointer" }}
          >
            <EnvelopeArt to={to} />
          </motion.button>
        ) : (
          <motion.article
            key="paper"
            initial={reduceMotion ? false : { opacity: 0, y: 40, rotate: -1.5 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 22 }}
            style={{
              position: "relative",
              borderRadius: 20,
              padding: "26px 22px 24px",
              background: `repeating-linear-gradient(var(--lv-paper) 0 33px, color-mix(in srgb, var(--lv-paper-soft) 26%, var(--lv-paper)) 33px 34px)`,
              color: V.paperInk,
              boxShadow: `0 30px 60px -28px ${V.shadow}`,
            }}
          >
            <span aria-hidden style={{ position: "absolute", right: 16, top: -18, width: 48, height: 48, borderRadius: "50%", background: V.grad, color: "#fff", display: "grid", placeItems: "center", fontSize: 20, boxShadow: "0 8px 18px rgba(0,0,0,.25)" }}>
              ♥
            </span>
            <p style={{ margin: 0, fontFamily: GROTESK, fontSize: 11, fontWeight: 800, letterSpacing: ".2em", textTransform: "uppercase", color: V.a1 }}>
              from {from} · to {to}
            </p>
            <p style={{ margin: "14px 0 0", fontFamily: ITALIC, fontStyle: "italic", fontSize: "clamp(21px, 4.6vw, 25px)", lineHeight: "34px", whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{letter}</p>
            {sign && <p style={{ margin: "18px 0 0", textAlign: "right", fontFamily: ITALIC, fontStyle: "italic", fontSize: 22, color: V.paperSoft }}>{sign}</p>}
          </motion.article>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── GIFs ────────────────────────────────────────────────────────────────────

export function GifBoard({ gifs, captions }: { gifs: string[]; captions?: string[] }) {
  if (!gifs.length) return <Empty text="No GIFs yet — pick a few in the form 🎞️" />;
  const tilts = [-4, 3, -2];
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 22, justifyContent: "center", padding: "10px 0 6px" }}>
      {gifs.map((g, i) => (
        <figure key={g} style={{ margin: 0, width: "min(260px, 76vw)", transform: `rotate(${tilts[i % 3]}deg)` }}>
          <span style={{ display: "block", aspectRatio: "1 / 1", borderRadius: 24, overflow: "hidden", background: "#fff", border: "6px solid #fff", boxShadow: `0 24px 44px -20px ${V.shadow}` }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={g} alt="" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
          </span>
          {captions?.[i] && <figcaption style={{ marginTop: 8, textAlign: "center", fontFamily: ITALIC, fontStyle: "italic", fontSize: 19, color: V.ink }}>{captions[i]}</figcaption>}
        </figure>
      ))}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <p style={{ margin: "24px 0", textAlign: "center", fontSize: 15, color: V.soft }}>{text}</p>;
}

// ─── The three standard tiles ────────────────────────────────────────────────

export function loveTiles({
  photos,
  gifs,
  letter,
  from,
  to,
  reduceMotion,
  labels = {},
}: {
  photos: LovePhoto[];
  gifs: string[];
  letter: string;
  from: string;
  to: string;
  reduceMotion: boolean;
  /** Per-template copy: "Exhibit A: photos", "Travel diary"… */
  labels?: { photos?: string; letter?: string; gifs?: string; photosSub?: string; letterSub?: string; gifsSub?: string };
}): HubTile[] {
  const out: HubTile[] = [];
  if (photos.length)
    out.push({
      id: "photos",
      emoji: "📸",
      title: labels.photos ?? "Our photos",
      sub: labels.photosSub ?? `${photos.length} ${photos.length === 1 ? "memory" : "memories"} · each with a note`,
      size: "big",
      tone: "glass",
      art: <PhotoStackArt photos={photos} />,
      wide: true,
      content: () => <PhotoStory photos={photos} reduceMotion={reduceMotion} />,
    });
  if (letter.trim())
    out.push({
      id: "letter",
      emoji: "💌",
      title: labels.letter ?? "The letter",
      sub: labels.letterSub ?? `for ${to} · tap to open`,
      size: "tall",
      tone: "paper",
      art: <EnvelopeArt />,
      content: () => <LetterReveal letter={letter} from={from} to={to} reduceMotion={reduceMotion} />,
    });
  if (gifs.length)
    out.push({
      id: "gifs",
      emoji: "🎞️",
      title: labels.gifs ?? "Mood board",
      sub: labels.gifsSub ?? `${gifs.length} GIF${gifs.length === 1 ? "" : "s"} of pure us`,
      size: "one",
      tone: "candy",
      art: <GifArt gifs={gifs} />,
      content: () => <GifBoard gifs={gifs} />,
    });
  return out;
}
