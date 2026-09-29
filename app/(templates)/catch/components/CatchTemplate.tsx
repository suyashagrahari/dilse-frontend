"use client";

// ─── Catch ───────────────────────────────────────────────────────────────────
//
// Screen orchestration: title → play → results, the corner letter, and on wide
// screens the arcade-cabinet side panels. The game itself lives in engine.ts;
// this file only decides which screen is on and remembers what was caught.

import { useCallback, useEffect, useMemo, useState } from "react";
import LetterPop from "../../_love/LetterPop";
import { setMuted, unlockAudio } from "@/lib/webAudio";
import GameStage, { type Loaded } from "./GameStage";
import Results from "./Results";
import { LeftPanel, RightPanel } from "./SidePanels";
import Splash from "./Splash";
import type { RunResult } from "./engine";
import { loadImage } from "./sprites";
import { readBest, readBoard, readStreak, recordRun, touchStreak, type ScoreRow } from "./storage";
import { CATCH_CSS } from "./styles";
import { catchHand } from "./fonts";
import { C } from "./theme";
import type { CatchTemplateProps } from "./types";

type Screen = "title" | "play" | "results";

function useReduced() {
  const [r, setR] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!mq) return;
    const on = () => setR(mq.matches);
    on();
    mq.addEventListener?.("change", on);
    return () => mq.removeEventListener?.("change", on);
  }, []);
  return r;
}

export default function CatchTemplate({ data, mode, shareId, hideLetter, onPlayingChange, shiftForSheet }: CatchTemplateProps) {
  const id = shareId || (mode === "demo" ? "demo" : "page");
  const reduced = useReduced();
  const [screen, setScreen] = useState<Screen>("title");
  const [runKey, setRunKey] = useState(0);
  const [result, setResult] = useState<RunResult | null>(null);
  const [newBest, setNewBest] = useState(false);
  const [board, setBoard] = useState<ScoreRow[]>([]);
  const [best, setBest] = useState(0);
  const [streak, setStreak] = useState(0);
  const [sound, setSound] = useState(false);
  const [livePieces, setLivePieces] = useState<number[]>([]);
  const [livePhotos, setLivePhotos] = useState<number[]>([]);
  const [letterForce, setLetterForce] = useState(false);

  // Local-only stats, read after mount so server and client HTML agree.
  useEffect(() => {
    setBest(readBest(id));
    setBoard(readBoard(id));
    setStreak(readStreak(id).days);
  }, [id]);

  // ── preload face + photos ─────────────────────────────────────────────────
  const photoKey = data.photos.map((p) => p.url).join("|");
  const [loaded, setLoaded] = useState<Loaded & { key: string }>({ face: null, photos: [], key: "" });
  useEffect(() => {
    let alive = true;
    const key = `${data.faceUrl}#${photoKey}`;
    void Promise.all([loadImage(data.faceUrl), ...data.photos.map((p) => loadImage(p.url))]).then(([face, ...photos]) => {
      if (alive) setLoaded({ face, photos, key });
    });
    return () => {
      alive = false;
    };
    // photoKey stands in for data.photos
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.faceUrl, photoKey]);

  useEffect(() => {
    onPlayingChange?.(screen === "play");
  }, [screen, onPlayingChange]);
  useEffect(() => () => onPlayingChange?.(false), [onPlayingChange]);

  const play = useCallback(() => {
    setStreak(touchStreak(id).days);
    setLivePieces([]);
    setLivePhotos([]);
    setResult(null);
    setRunKey((k) => k + 1);
    setScreen("play");
  }, [id]);

  const onEnd = useCallback(
    (r: RunResult) => {
      const rec = recordRun(id, r.score);
      setNewBest(rec.newBest && r.score > 0);
      setBest(rec.best);
      setBoard(rec.board);
      setResult(r);
      setScreen("results");
    },
    [id],
  );

  const readIt = useCallback(() => {
    setResult(null);
    setNewBest(false);
    setScreen("results");
  }, []);

  const openLetter = useCallback(() => {
    setLetterForce(true);
    window.setTimeout(() => setLetterForce(false), 120);
  }, []);

  const toggleSound = useCallback(() => {
    setSound((s) => {
      const next = !s;
      if (next) unlockAudio();
      setMuted(!next);
      return next;
    });
  }, []);

  // LetterPop writes its own "Dear <name>," — drop a salutation the sender put in.
  const letterText = useMemo(() => data.letter.trim().replace(/^(dear\s+)?[^\n,]{1,32},[ \t]*\n+/i, ""), [data.letter]);
  const hasLetter = !!letterText;
  const photoUrls = useMemo(() => data.photos.map((p) => p.url), [data.photos]);

  const playing = screen === "play";
  const livePh = playing ? livePhotos : result ? result.photos : screen === "results" ? data.photos.map((_, i) => i) : [];
  const livePc = playing ? livePieces : result ? result.pieces : screen === "results" ? data.goodItems.map((_, i) => i) : [];

  return (
    <div className={`ct-root ${catchHand.variable}${playing ? " is-playing" : ""}${reduced ? " is-reduced" : ""}${shiftForSheet ? " is-shift" : ""}`}>
      <style>{CATCH_CSS}</style>
      <div className="ct-bgDeco" aria-hidden>
        <i /><i /><i />
      </div>

      <LeftPanel data={data} caught={livePc} playing={playing} />

      <main className="ct-field">
        {screen === "title" && (
          <Splash data={data} best={best} streak={streak} sound={sound} onSound={toggleSound} onPlay={play} onRead={readIt} />
        )}
        {screen === "play" && (
          <GameStage
            key={runKey}
            data={data}
            loaded={loaded}
            reduced={reduced}
            sound={sound}
            onPiece={(i) => setLivePieces((p) => (p.includes(i) ? p : [...p, i]))}
            onPhoto={(i) => setLivePhotos((p) => (p.includes(i) ? p : [...p, i]))}
            onEnd={onEnd}
            onQuit={() => setScreen("title")}
            onRestart={play}
          />
        )}
        {screen === "results" && (
          <Results
            data={data}
            result={result}
            newBest={newBest}
            board={board}
            reduced={reduced}
            hasLetter={hasLetter}
            onLetter={openLetter}
            onAgain={play}
          />
        )}
      </main>

      <RightPanel data={data} photosCaught={livePh} best={best} streak={streak} />

      {hasLetter && !hideLetter && (
        <LetterPop
          letter={letterText}
          from={data.senderName || undefined}
          to={data.recipientName || undefined}
          question={data.lockQuestion || undefined}
          answer={data.lockAnswer || undefined}
          accent={C.pink}
          accent2={C.grape}
          paper={C.cream}
          ink={C.ink}
          bottom={20}
          delay={2600}
          teaser={`${data.senderName || "someone"} left you a letter 💌`}
          sign="player 2, always,"
          zIndex={250}
          forceOpen={letterForce}
          variant="catch"
          photos={photoUrls}
          title="Catch!"
        />
      )}
    </div>
  );
}
