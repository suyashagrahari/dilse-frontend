"use client";

// ─── Love kit — the story ────────────────────────────────────────────────────
//
// Every love-kit template is told as a sequence of full-screen chapters, not a
// long scroll. Each chapter says when it is `done()` (all demands answered,
// every photo seen, the letter opened…); the story then plays a short wipe
// with the next chapter's title card and moves on by itself. Story-style
// segments at the bottom show where you are; the back arrow and a tap on any
// earlier segment revisit a chapter. The last chapter is the finale.

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { GROTESK, ITALIC } from "./LoveKit";
import { V } from "./theme";

export interface StoryApi {
  /** The chapter is complete — auto-advance after a beat. */
  done: (delayMs?: number) => void;
  /** The chapter is complete but needs reading time — unlock "next", don't advance. */
  complete: () => void;
  next: () => void;
  back: () => void;
  index: number;
  total: number;
  reduceMotion: boolean;
}

export interface Chapter {
  id: string;
  emoji: string;
  /** "the evidence" — shown on the title card and the segment tooltip. */
  title: string;
  /** Small line above the title on the title card: "chapter 2". Defaults to that. */
  kicker?: string;
  render: (api: StoryApi) => ReactNode;
  /** Hide the next button until the chapter calls done() (e.g. the locked letter). */
  gated?: boolean;
}

const STORY_CSS = `
.lv-chapter { position: relative; z-index: 1; min-height: 100dvh; width: 100%; max-width: 1080px; margin: 0 auto;
  padding: 76px 16px calc(112px + env(safe-area-inset-bottom, 0px)); display: flex; flex-direction: column; justify-content: center; }
@media (min-width: 768px) { .lv-chapter { padding-top: 88px; } }
.lv-seg { flex: 1; height: 5px; border-radius: 99px; background: color-mix(in srgb, var(--lv-ink) 18%, transparent); overflow: hidden; border: 0; padding: 0; cursor: pointer; }
.lv-seg > span { display: block; height: 100%; border-radius: 99px; background: var(--lv-a1); transition: width .5s ease; }
`;

export default function LoveStory({
  chapters,
  reduceMotion,
  startAt = 0,
  resetKey,
}: {
  chapters: Chapter[];
  reduceMotion: boolean;
  startAt?: number;
  /** Changing it restarts the story from `startAt`. */
  resetKey?: unknown;
}) {
  const n = chapters.length;
  const [index, setIndex] = useState(startAt);
  const [doneSet, setDoneSet] = useState<Set<string>>(() => new Set());
  const [card, setCard] = useState<number | null>(null);
  const timers = useRef<number[]>([]);

  const clearTimers = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };

  const [prevReset, setPrevReset] = useState(resetKey);
  if (prevReset !== resetKey) {
    setPrevReset(resetKey);
    setIndex(startAt);
    setDoneSet(new Set());
    setCard(null);
  }

  const goTo = useCallback(
    (to: number) => {
      if (to < 0 || to >= n) return;
      clearTimers();
      if (reduceMotion) {
        setIndex(to);
        window.scrollTo({ top: 0 });
        return;
      }
      // Title card wipes in, the chapter swaps underneath, the card wipes out.
      setCard(to);
      timers.current.push(
        window.setTimeout(() => {
          setIndex(to);
          window.scrollTo({ top: 0 });
        }, 520),
      );
      timers.current.push(window.setTimeout(() => setCard(null), 1450));
    },
    [n, reduceMotion],
  );

  useEffect(() => () => clearTimers(), []);

  const chapter = chapters[Math.min(index, n - 1)];
  const isDone = doneSet.has(chapter.id);

  const api: StoryApi = {
    index,
    total: n,
    reduceMotion,
    next: () => goTo(index + 1),
    back: () => goTo(index - 1),
    complete: () => {
      if (!doneSet.has(chapter.id)) setDoneSet((s) => new Set(s).add(chapter.id));
    },
    done: (delayMs = 1400) => {
      if (doneSet.has(chapter.id)) return;
      setDoneSet((s) => new Set(s).add(chapter.id));
      if (index < n - 1) timers.current.push(window.setTimeout(() => goTo(index + 1), delayMs));
    },
  };

  const showNext = index < n - 1 && (!chapter.gated || isDone);

  return (
    <>
      <style>{STORY_CSS}</style>
      <AnimatePresence mode="wait" initial={false}>
        <motion.section
          key={chapter.id}
          className="lv-chapter"
          aria-label={chapter.title}
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
        >
          {/* `api`'s callbacks touch the timer ref, never the render itself. */}
          {/* eslint-disable-next-line react-hooks/refs */}
          {chapter.render(api)}
        </motion.section>
      </AnimatePresence>

      {/* Bottom bar: back · progress segments · next */}
      <nav
        aria-label="Story navigation"
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 100,
          padding: "10px 12px calc(12px + env(safe-area-inset-bottom, 0px))",
          display: "flex",
          alignItems: "center",
          gap: 10,
          background: "linear-gradient(to top, color-mix(in srgb, var(--lv-base) 92%, transparent) 55%, transparent)",
          fontFamily: GROTESK,
        }}
      >
        <button
          type="button"
          onClick={api.back}
          disabled={index === 0}
          aria-label="Previous chapter"
          className="lv-focus"
          style={{ flexShrink: 0, width: 46, height: 46, borderRadius: "50%", border: `1px solid ${V.edge}`, background: V.glass, color: V.ink, display: "grid", placeItems: "center", cursor: "pointer", opacity: index === 0 ? 0.35 : 1, backdropFilter: "blur(10px)" }}
        >
          <ChevronLeft size={20} />
        </button>
        <div style={{ flex: 1, minWidth: 0, display: "flex", gap: 5 }}>
          {chapters.map((c, i) => (
            <button
              key={c.id}
              type="button"
              className="lv-seg lv-focus"
              aria-label={`Chapter ${i + 1}: ${c.title}${i === index ? " (current)" : ""}`}
              aria-current={i === index ? "step" : undefined}
              onClick={() => i <= index && i !== index && goTo(i)}
              style={{ cursor: i < index ? "pointer" : "default" }}
            >
              <span style={{ width: i < index || (i === index && isDone) ? "100%" : i === index ? "45%" : "0%" }} />
            </button>
          ))}
        </div>
        {showNext ? (
          <button
            type="button"
            onClick={api.next}
            className={`lv-cta lv-focus ${isDone ? "lv-pulse" : ""}`}
            style={{ flexShrink: 0, height: 46, padding: "0 16px 0 18px", borderRadius: 999, border: "none", background: V.grad, color: "#fff", fontWeight: 800, fontSize: 15, display: "inline-flex", alignItems: "center", gap: 4, cursor: "pointer", boxShadow: `0 12px 26px -12px ${V.shadow}` }}
          >
            next <ChevronRight size={18} />
          </button>
        ) : (
          <span style={{ flexShrink: 0, minWidth: 46, textAlign: "center", fontSize: 12, fontWeight: 800, color: V.soft }}>
            {index + 1}/{n}
          </span>
        )}
      </nav>

      {/* The title card between chapters. */}
      <AnimatePresence>
        {card !== null && (
          <motion.div
            key={`card-${card}`}
            aria-hidden
            initial={{ clipPath: "circle(0% at 50% 100%)" }}
            animate={{ clipPath: "circle(150% at 50% 100%)" }}
            exit={{ clipPath: "circle(0% at 50% 0%)" }}
            transition={{ duration: 0.55, ease: [0.7, 0, 0.3, 1] }}
            style={{ position: "fixed", inset: 0, zIndex: 150, background: V.grad, color: "#fff", display: "grid", placeItems: "center", textAlign: "center", fontFamily: GROTESK }}
          >
            <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.25, type: "spring", stiffness: 240, damping: 20 }}>
              <div style={{ fontSize: 76, lineHeight: 1, filter: "drop-shadow(0 12px 18px rgba(0,0,0,.25))" }}>{chapters[card].emoji}</div>
              <p style={{ margin: "16px 0 0", fontSize: 12, fontWeight: 800, letterSpacing: ".3em", textTransform: "uppercase", opacity: 0.85 }}>
                {chapters[card].kicker ?? `chapter ${card + 1} of ${n}`}
              </p>
              <p style={{ margin: "6px 0 0", fontFamily: ITALIC, fontStyle: "italic", fontSize: "clamp(40px, 11vw, 64px)", lineHeight: 1 }}>{chapters[card].title}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/** The heading every chapter opens with. */
export function ChapterHead({ kicker, title, note }: { kicker: string; title: ReactNode; note?: ReactNode }) {
  return (
    <header style={{ textAlign: "center", marginBottom: 18 }}>
      <p style={{ margin: 0, fontFamily: GROTESK, fontSize: 11, fontWeight: 800, letterSpacing: ".24em", textTransform: "uppercase", color: V.a1 }}>{kicker}</p>
      <h2 style={{ margin: "8px 0 0", fontFamily: GROTESK, fontWeight: 800, fontSize: "clamp(28px, 7vw, 46px)", lineHeight: 1, letterSpacing: "-0.035em", color: V.ink }}>{title}</h2>
      {note && <p style={{ margin: "8px 0 0", fontSize: 14, color: V.soft }}>{note}</p>}
    </header>
  );
}

/**
 * One GIF, used at one moment, with a speech bubble — a reaction, not a
 * gallery. Pops in when `show` turns true.
 */
export function GifMoment({ src, caption, show = true, side = "right", size = 120 }: { src?: string; caption?: string; show?: boolean; side?: "left" | "right"; size?: number }) {
  if (!src) return null;
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.4, rotate: side === "right" ? 20 : -20 }}
          animate={{ opacity: 1, scale: 1, rotate: side === "right" ? 6 : -6 }}
          exit={{ opacity: 0, scale: 0.6 }}
          transition={{ type: "spring", stiffness: 320, damping: 18 }}
          style={{ display: "flex", alignItems: "flex-end", gap: 8, flexDirection: side === "right" ? "row" : "row-reverse", justifyContent: "center" }}
        >
          {caption && (
            <span style={{ position: "relative", maxWidth: 190, padding: "10px 14px", borderRadius: 18, background: V.paper, color: V.paperInk, fontFamily: GROTESK, fontWeight: 800, fontSize: 14, lineHeight: 1.25, boxShadow: `0 12px 24px -12px ${V.shadow}` }}>
              {caption}
            </span>
          )}
          <span style={{ width: size, height: size, flexShrink: 0, borderRadius: 22, overflow: "hidden", background: "#fff", border: "4px solid #fff", boxShadow: `0 16px 30px -14px ${V.shadow}` }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
