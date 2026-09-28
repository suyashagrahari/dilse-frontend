"use client";

// ─── The Last Piece — the recipient's experience ─────────────────────────────
//
//   1. hello        — "I turned us into a puzzle", a scrambled preview of the
//                     board with its bottom-right piece missing ("I kept it").
//   2. the puzzle   — a real sliding-tile puzzle (3×3 / 4×4 / 5×5, chosen by
//                     the sender). Solving it flies the last piece into the gap.
//   3. more pieces  — the memory photos snap together as an interlocking
//                     jigsaw; tap one to read the memory behind it.
//   4. the letter   — locked with a question, opens with confetti.
//   5. the picture  — the whole photo, the stats, the GIFs, the sign-off.
//
// Everything paints with the Love Kit's theme variables, so the four themes in
// ./themes recolour it in one style write.

import { useCallback, useMemo, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import { RotateCcw, Sparkles } from "lucide-react";

import { DATE_FONT_VARS } from "../../date-invitation/components/fonts";
import useReducedMotion from "../../date-invitation/components/useReducedMotion";
import {
  BrandBadge,
  CandyButton,
  Eyebrow,
  GhostButton,
  GradText,
  GROTESK,
  ITALIC,
  LOVE_CSS,
  LoveSky,
  LoveThemeContext,
  Sticker,
  Tape,
  ThemeDock,
} from "../../_love/LoveKit";
import LoveStory, { ChapterHead, GifMoment, type Chapter, type StoryApi } from "../../_love/Story";
import LockedLetter from "../../_love/LockedLetter";
import { GifBoard } from "../../_love/Memories";
import { V, pickTheme, themeVars, type LoveTheme } from "../../_love/theme";
import MemoryJigsaw from "./MemoryJigsaw";
import { PhotoLayer, Slice, useImageOk, type PhotoCrop } from "./PhotoSlice";
import SlidingPuzzle, { fmtTime } from "./SlidingPuzzle";
import { boardSkin, PUZZLE_THEMES } from "./themes";
import { emptyId } from "./slidingEngine";
import { usePuzzleGame, type PuzzleGame } from "./usePuzzleGame";
import {
  DEFAULT_LOCK_ANSWER,
  DEFAULT_LOCK_QUESTION,
  DIFFICULTY_META,
  puzzleImage,
  type PhotoPuzzleTemplateProps,
  type PuzzleData,
} from "./types";

export default function PhotoPuzzleTemplate({ data, mode, shareId, onThemeChange }: PhotoPuzzleTemplateProps) {
  const reduceMotion = useReducedMotion();
  const theme = pickTheme(PUZZLE_THEMES, data.theme);
  const meta = DIFFICULTY_META[data.difficulty];
  const n = meta.size;
  const src = puzzleImage(data);
  const crop: PhotoCrop = { x: data.imageCropX, y: data.imageCropY, scale: data.imageScale };
  const game = usePuzzleGame(n, meta.shuffle, `${shareId ?? "demo"}:${src}:${data.senderName}:${data.recipientName}`);

  const [storyKey, setStoryKey] = useState(0);
  const [startAt, setStartAt] = useState(0);
  const replay = useCallback(() => {
    game.reshuffle();
    setStartAt(1);
    setStoryKey((k) => k + 1);
  }, [game]);

  const to = data.recipientName.trim() || "you";
  const from = data.senderName.trim() || "me";
  const gif = (i: number) => data.gifs[i] ?? data.gifs[0];
  const hasPhotos = data.photos.length > 0;
  const hasLetter = data.letter.trim().length > 0;

  const chapters: Chapter[] = [
    {
      id: "hello",
      emoji: "🧩",
      title: "hello",
      render: (api) => <Hello data={data} game={game} src={src} crop={crop} theme={theme} gif={gif(0)} onStart={api.next} reduceMotion={reduceMotion} />,
    },
    {
      id: "puzzle",
      emoji: "🧩",
      title: "the puzzle",
      gated: true,
      render: (api) => (
        <PuzzleChapter api={api} data={data} game={game} src={src} crop={crop} theme={theme} gif={gif(0)} demo={mode === "demo"} reduceMotion={reduceMotion} />
      ),
    },
  ];
  if (hasPhotos) {
    chapters.push({
      id: "memories",
      emoji: "📸",
      title: "more pieces",
      render: (api) => (
        <section>
          <ChapterHead kicker="the rest of the box" title={<>more pieces <GradText>of us</GradText></>} note="tap a piece to read the memory behind it" />
          <MemoryJigsaw photos={data.photos} reduceMotion={reduceMotion} onAllSeen={api.complete} onLetter={hasLetter ? api.next : undefined} hasLetter={hasLetter} seed={shareId ?? from} />
        </section>
      ),
    });
  }
  if (hasLetter) {
    chapters.push({
      id: "letter",
      emoji: "💌",
      title: "the last piece",
      gated: true,
      render: (api) => (
        <section>
          <ChapterHead kicker="the actual last piece" title={<>one more thing, <GradText>{to}</GradText></>} />
          <LockedLetter
            letter={data.letter}
            from={from}
            to={to}
            question={data.lockQuestion.trim() || DEFAULT_LOCK_QUESTION}
            answer={data.lockAnswer.trim() || DEFAULT_LOCK_ANSWER}
            gif={gif(1)}
            gifCaption="knew it 🥹"
            reduceMotion={reduceMotion}
            onOpened={api.complete}
          />
        </section>
      ),
    });
  }
  chapters.push({
    id: "picture",
    emoji: "🖼️",
    title: "the whole picture",
    render: () => <Finale data={data} game={game} src={src} crop={crop} live={mode === "live"} onReplay={replay} reduceMotion={reduceMotion} />,
  });

  const rootStyle = useMemo<CSSProperties>(
    () => ({
      ...themeVars(theme),
      minHeight: "100dvh",
      position: "relative",
      isolation: "isolate",
      overflowX: "clip",
      color: V.ink,
      background: theme.colors.base,
      fontFamily: GROTESK,
    }),
    [theme],
  );

  return (
    <LoveThemeContext.Provider value={theme}>
      <div className={`${DATE_FONT_VARS} lv-root`} style={rootStyle}>
        <style>{LOVE_CSS + LAYOUT_CSS}</style>
        <LoveSky theme={theme} reduceMotion={reduceMotion} />
        {mode === "live" && <BrandBadge />}
        {mode === "demo" && onThemeChange && <ThemeDock themes={PUZZLE_THEMES} value={theme.id} onChange={onThemeChange} />}
        <LoveStory key={storyKey} chapters={chapters} reduceMotion={reduceMotion} startAt={startAt} />
      </div>
    </LoveThemeContext.Provider>
  );
}

const LAYOUT_CSS = `
.lp-hello { display: grid; gap: 26px; align-items: center; justify-items: center; text-align: center; }
.lp-play { display: grid; gap: 18px; justify-items: center; }
.lp-side { width: 100%; max-width: 520px; display: grid; gap: 12px; justify-items: center; text-align: center; }
@media (min-width: 900px) {
  .lp-hello { grid-template-columns: 1.05fr .95fr; text-align: left; justify-items: start; gap: 48px; }
  .lp-hello-art { justify-self: center; transform: scale(1.22); }
  .lp-play { grid-template-columns: minmax(0, 1.25fr) minmax(0, .75fr); align-items: center; gap: 36px; }
  .lp-side { justify-items: start; text-align: left; }
}
`;

// ─── 1 · hello ───────────────────────────────────────────────────────────────

function Hello({
  data,
  game,
  src,
  crop,
  theme,
  gif,
  onStart,
  reduceMotion,
}: {
  data: PuzzleData;
  game: PuzzleGame;
  src: string;
  crop: PhotoCrop;
  theme: LoveTheme;
  gif?: string;
  onStart: () => void;
  reduceMotion: boolean;
}) {
  const meta = DIFFICULTY_META[data.difficulty];
  const n = game.n;
  const ok = useImageOk(src);
  const skin = boardSkin(theme.id);
  const size = 252;
  const t = Math.floor(size / n);
  const S = t * n;
  const g = 2;
  const last = emptyId(n);
  const to = data.recipientName.trim() || "you";
  const from = data.senderName.trim() || "me";

  return (
    <div className="lp-hello">
      <div style={{ display: "grid", gap: 16, justifyItems: "inherit", maxWidth: 520 }}>
        <Sticker tilt={-3}>🧩 a puzzle from {from}</Sticker>
        <h1 style={{ margin: 0, fontFamily: GROTESK, fontWeight: 800, fontSize: "clamp(38px, 10vw, 68px)", lineHeight: 0.95, letterSpacing: "-0.045em", color: V.ink }}>
          <GradText>{to},</GradText>
          <br />I cut us into
          <br />
          <span style={{ fontFamily: ITALIC, fontStyle: "italic", fontWeight: 400, letterSpacing: "-0.02em" }}>{n * n} little pieces.</span>
        </h1>
        <p style={{ margin: 0, fontSize: 16, lineHeight: 1.5, color: V.soft, maxWidth: 420 }}>
          Slide them back where they belong. I kept the <b style={{ color: V.ink }}>last piece</b> — it only shows up once the picture is whole. Then the good stuff unlocks 💌
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "inherit" }}>
          <span style={{ padding: "7px 13px", borderRadius: 999, background: V.glass, border: `1px solid ${V.edge}`, fontWeight: 800, fontSize: 13 }}>
            {meta.emoji} {meta.label} · {n}×{n}
          </span>
          <span style={{ padding: "7px 13px", borderRadius: 999, background: V.glass, border: `1px solid ${V.edge}`, fontWeight: 700, fontSize: 13, color: V.soft }}>
            tap · swipe · arrow keys
          </span>
        </div>
        <div style={{ width: "100%", maxWidth: 360, marginTop: 4 }}>
          <CandyButton onClick={onStart}>
            <Sparkles size={18} /> start the puzzle
          </CandyButton>
        </div>
      </div>

      <div className="lp-hello-art" style={{ position: "relative", padding: "18px 26px 30px" }}>
        <div
          className={reduceMotion ? undefined : "lv-float"}
          style={{ position: "relative", padding: 8, borderRadius: 20, background: skin.frame, transform: "rotate(-4deg)", boxShadow: `0 30px 60px -26px ${V.shadow}` }}
        >
          <div style={{ position: "relative", width: S, height: S, borderRadius: 12, overflow: "hidden", background: skin.well }}>
            {game.board.map((id, pos) => {
              if (id === last) {
                return (
                  <span
                    key="gap"
                    aria-hidden
                    style={{ position: "absolute", left: (pos % n) * t + 4, top: Math.floor(pos / n) * t + 4, width: t - 8, height: t - 8, borderRadius: 8, border: "2px dashed rgba(255,255,255,.5)", display: "grid", placeItems: "center", fontSize: 22 }}
                  >
                    💗
                  </span>
                );
              }
              return (
                <span
                  key={id}
                  aria-hidden
                  style={{ position: "absolute", left: (pos % n) * t + g, top: Math.floor(pos / n) * t + g, width: t - g * 2, height: t - g * 2, borderRadius: 7, overflow: "hidden", boxShadow: skin.tileEdge }}
                >
                  <Slice src={src} crop={crop} n={n} t={t} id={id} inset={g} ok={ok} />
                </span>
              );
            })}
          </div>
        </div>
        {/* The piece the sender kept */}
        <div
          className={reduceMotion ? undefined : "lv-wiggle"}
          style={{ position: "absolute", right: 0, top: 0, width: 74, height: 74, borderRadius: 14, overflow: "hidden", boxShadow: `0 0 0 4px ${V.paper}, 0 18px 30px -12px ${V.shadow}` }}
        >
          <div style={{ position: "absolute", left: 0, top: 0, width: t, height: t, transform: `scale(${74 / t})`, transformOrigin: "0 0" }}>
            <Slice src={src} crop={crop} n={n} t={t} id={last} ok={ok} />
          </div>
        </div>
        <span
          style={{ position: "absolute", right: -6, top: 82, padding: "6px 11px", borderRadius: 14, background: V.paper, color: V.paperInk, fontWeight: 800, fontSize: 12.5, transform: "rotate(5deg)", boxShadow: `0 10px 20px -10px ${V.shadow}` }}
        >
          kept this one 🤫
        </span>
        {gif && (
          <div style={{ position: "absolute", left: -4, bottom: -8 }}>
            <GifMoment src={gif} size={84} side="left" />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── 2 · the puzzle ──────────────────────────────────────────────────────────

function PuzzleChapter({
  api,
  data,
  game,
  src,
  crop,
  theme,
  gif,
  demo,
  reduceMotion,
}: {
  api: StoryApi;
  data: PuzzleData;
  game: PuzzleGame;
  src: string;
  crop: PhotoCrop;
  theme: LoveTheme;
  gif?: string;
  demo: boolean;
  reduceMotion: boolean;
}) {
  const [landed, setLanded] = useState(game.solved);
  const revealRef = useRef<HTMLDivElement>(null);
  const complete = api.complete;
  const onComplete = useCallback(() => {
    setLanded(true);
    complete();
    // On a phone the reveal sits under the board: bring the line + button up.
    window.setTimeout(() => revealRef.current?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "nearest" }), 700);
  }, [complete, reduceMotion]);
  // A reshuffle after solving puts the game back into play.
  const [prevSolved, setPrevSolved] = useState(game.solved);
  if (prevSolved !== game.solved) {
    setPrevSolved(game.solved);
    if (!game.solved) setLanded(false);
  }
  const elapsed = game.startedAt && game.endedAt ? game.endedAt - game.startedAt : 0;

  return (
    <div className="lp-play">
      <div style={{ width: "100%" }}>
        <SlidingPuzzle game={game} src={src} crop={crop} difficulty={data.difficulty} theme={theme} reduceMotion={reduceMotion} onComplete={onComplete} />
      </div>
      <div className="lp-side">
        {!landed ? (
          <>
            <Eyebrow color={V.a1}>chapter · the puzzle</Eyebrow>
            <h2 style={{ margin: 0, fontFamily: GROTESK, fontWeight: 800, fontSize: "clamp(26px, 6.4vw, 42px)", lineHeight: 1, letterSpacing: "-0.035em" }}>
              put <GradText>us</GradText> back together
            </h2>
            <p style={{ margin: 0, color: V.soft, fontSize: 14.5, lineHeight: 1.5, maxWidth: 380 }}>
              Tap a tile next to the gap to slide it in — or swipe, or use the arrow keys. Stuck? <b style={{ color: V.ink }}>peek</b> at the photo.
            </p>
            {demo && (
              <button
                type="button"
                onClick={game.skip}
                className="lv-focus"
                style={{ marginTop: 4, border: "none", background: "transparent", color: V.soft, fontFamily: GROTESK, fontWeight: 700, fontSize: 13, textDecoration: "underline", textUnderlineOffset: 3, cursor: "pointer", minHeight: 40 }}
              >
                preview only: skip to the reveal →
              </button>
            )}
          </>
        ) : (
          <div ref={revealRef} className="lv-pop" style={{ display: "grid", gap: 12, justifyItems: "inherit", scrollMarginBottom: 120 }}>
            <Sticker tilt={-4}>✓ the last piece is in</Sticker>
            <p style={{ margin: 0, fontFamily: ITALIC, fontStyle: "italic", fontSize: "clamp(28px, 7vw, 40px)", lineHeight: 1.08, color: V.ink, maxWidth: 440 }}>
              {data.finalPieceMessage}
            </p>
            <p style={{ margin: 0, fontWeight: 800, fontSize: 14, color: V.soft }}>
              {game.assisted ? "solved (with a little help 🫶)" : `solved in ${game.moves} moves · ${fmtTime(elapsed)}`}
            </p>
            <div style={{ width: "100%", maxWidth: 360 }}>
              <CandyButton onClick={api.next}>open the rest of your gift →</CandyButton>
            </div>
            <GifMoment src={gif} caption="you did it!!" show size={92} />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── 5 · the whole picture ───────────────────────────────────────────────────

function Finale({ data, game, src, crop, live, onReplay, reduceMotion }: { data: PuzzleData; game: PuzzleGame; src: string; crop: PhotoCrop; live: boolean; onReplay: () => void; reduceMotion: boolean }) {
  const ok = useImageOk(src);
  const to = data.recipientName.trim() || "you";
  const from = data.senderName.trim() || "me";
  const elapsed = game.startedAt && game.endedAt ? game.endedAt - game.startedAt : 0;
  return (
    <section style={{ display: "grid", gap: 22, justifyItems: "center", textAlign: "center" }}>
      <ChapterHead kicker="the whole picture" title={<>{from} <GradText>+</GradText> {to}</>} />
      <figure style={{ margin: 0, padding: "12px 12px 16px", background: V.paper, borderRadius: 10, transform: "rotate(-2deg)", boxShadow: `0 34px 60px -30px ${V.shadow}`, width: "min(340px, 86vw)" }}>
        <div style={{ position: "relative", width: "100%", aspectRatio: "1 / 1", overflow: "hidden", borderRadius: 4 }}>
          <PhotoLayer src={src} crop={crop} size="100%" ok={ok} />
        </div>
        <figcaption style={{ marginTop: 10, fontFamily: ITALIC, fontStyle: "italic", fontSize: 22, color: V.paperInk }}>every piece, finally ✨</figcaption>
      </figure>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
        {game.solved && (
          <span style={{ padding: "7px 13px", borderRadius: 999, background: V.chip, color: V.chipInk, fontWeight: 800, fontSize: 13 }}>
            {game.assisted ? "🫶 solved together" : `🧩 ${game.moves} moves · ⏱ ${fmtTime(elapsed)}`}
          </span>
        )}
        <span style={{ padding: "7px 13px", borderRadius: 999, background: V.glass, border: `1px solid ${V.edge}`, fontWeight: 800, fontSize: 13 }}>
          {DIFFICULTY_META[data.difficulty].emoji} {DIFFICULTY_META[data.difficulty].label}
        </span>
      </div>
      <p style={{ margin: 0, maxWidth: 520, fontFamily: ITALIC, fontStyle: "italic", fontSize: "clamp(26px, 6.4vw, 38px)", lineHeight: 1.1 }}>{data.closingLine}</p>
      {data.gifs.length > 0 && <GifBoard gifs={data.gifs} captions={["us 🥹", "me rn", "forever"]} />}
      <div style={{ width: "100%", maxWidth: 380, display: "grid", gap: 10 }}>
        <GhostButton onClick={onReplay}>
          <RotateCcw size={16} /> play the puzzle again
        </GhostButton>
        {live && (
          <Link href="/photo-puzzle" style={{ textAlign: "center", fontWeight: 800, fontSize: 14, color: V.a1, textDecoration: "none", padding: 10 }}>
            make a puzzle for someone 🧩
          </Link>
        )}
      </div>
      <div style={{ width: "100%", overflow: "hidden", paddingBlock: 10 }}>
        <Tape words={["the last piece", `${from} + ${to}`, "complete"]} reduceMotion={reduceMotion} />
      </div>
    </section>
  );
}
