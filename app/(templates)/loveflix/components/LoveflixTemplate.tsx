"use client";

// The app shell and its state machine:
//
//   profiles ──tap── sting ──── browse ⇄ details
//                                  │
//                                player → finale → credits → browse (+ letter)
//
// It owns everything the screens share (My List, likes, what's been watched,
// the snackbar), the browser-back behaviour inside the player, and the
// LetterPop that waits in the corner from the catalogue onward.

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import LetterPop from "../../_love/LetterPop";
import Browse, { type View } from "./Browse";
import { LfContext, titleKey, type LfApi, type Title } from "./context";
import DetailsModal from "./DetailsModal";
import IntroSting from "./IntroSting";
import Player from "./Player";
import ProfilePicker from "./ProfilePicker";
import { LF_CSS } from "./styles";
import { ACCENT, Z } from "./theme";
import { assertBrandSafe, type LoveflixTemplateProps } from "./types";
import { useReducedMotion } from "./useReducedMotion";
import { useCanHover, useViewport } from "./useViewport";

type Phase = "profiles" | "sting" | "browse" | "player";

export default function LoveflixTemplate({ data, mode, topInset = 0 }: LoveflixTemplateProps) {
  const reduced = useReducedMotion();
  const vp = useViewport();
  const canHover = useCanHover();

  const [phase, setPhase] = useState<Phase>("profiles");
  const [view, setView] = useState<View>("home");
  const [details, setDetails] = useState<Title | null>(null);
  const [startEp, setStartEp] = useState(0);
  const [myList, setMyList] = useState<Set<string>>(() => new Set());
  const [liked, setLiked] = useState<Set<string>>(() => new Set());
  const [watched, setWatched] = useState<Set<number>>(() => new Set());
  const [snack, setSnack] = useState<{ id: number; text: string; icon?: string } | null>(null);
  const [letterOpen, setLetterOpen] = useState(0);
  const snackTimer = useRef<number | null>(null);

  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;
    const hits = assertBrandSafe(data);
    if (hits.length) console.error("[loveflix] brand safety:", hits);
  }, [data]);

  // Audio can only start inside a gesture; the first tap anywhere unlocks it.
  const unlocked = useRef(false);
  const unlock = useCallback(() => {
    if (unlocked.current) return;
    unlocked.current = true;
    void import("@/lib/webAudio").then((m) => m.unlockAudio());
  }, []);

  const toast = useCallback((text: string, icon?: string) => {
    setSnack((s) => ({ id: (s?.id ?? 0) + 1, text, icon }));
    if (snackTimer.current) window.clearTimeout(snackTimer.current);
    snackTimer.current = window.setTimeout(() => setSnack(null), 2800);
  }, []);
  useEffect(() => () => { if (snackTimer.current) window.clearTimeout(snackTimer.current); }, []);

  const toggleIn = (set: React.Dispatch<React.SetStateAction<Set<string>>>) => (t: Title) =>
    set((s) => {
      const n = new Set(s);
      const k = titleKey(t);
      if (n.has(k)) n.delete(k);
      else n.add(k);
      return n;
    });

  const toggleList = useCallback(
    (t: Title) => {
      const k = titleKey(t);
      const adding = !myList.has(k);
      toggleIn(setMyList)(t);
      toast(adding ? "Added to My List" : "Removed from My List", adding ? "✓" : "–");
    },
    [myList, toast],
  );
  const toggleLike = useCallback((t: Title) => toggleIn(setLiked)(t), []);

  const play = useCallback((i = 0) => {
    unlock();
    setDetails(null);
    setStartEp(i);
    setPhase("player");
  }, [unlock]);

  const exitPlayer = useCallback((finished: boolean, upTo: number) => {
    setWatched((w) => {
      const n = new Set(w);
      for (let i = 0; i <= upTo; i++) n.add(i);
      return n;
    });
    setPhase("browse");
    if (finished && data.letter.trim()) setLetterOpen((n) => n + 1);
  }, [data.letter]);

  // Browser back inside the player returns to the catalogue.
  useEffect(() => {
    if (phase !== "player") return;
    window.history.pushState({ loveflix: "player" }, "");
    const onPop = () => setPhase("browse");
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [phase]);

  const api: LfApi = useMemo(
    () => ({
      data,
      mode,
      vp,
      canHover,
      reduced,
      toast,
      openDetails: (t: Title) => {
        unlock();
        setDetails(t);
      },
      play,
      myList,
      toggleList,
      liked,
      toggleLike,
      watched,
    }),
    [data, mode, vp, canHover, reduced, toast, unlock, play, myList, toggleList, liked, toggleLike, watched],
  );

  const phone = vp === "phone";
  const rootStyle = { "--lf-top": `${topInset}px` } as CSSProperties;

  return (
    <LfContext.Provider value={api}>
      <div className={`lf-root${reduced ? " is-reduced" : ""}`} style={rootStyle} onPointerDown={unlock}>
        <style>{LF_CSS}</style>

        {phase === "profiles" && (
          <ProfilePicker data={data} live={mode === "live"} toast={toast} onFirstGesture={unlock} onPick={() => setPhase("sting")} />
        )}
        {phase === "sting" && <IntroSting reduced={reduced} onDone={() => setPhase("browse")} />}
        {(phase === "browse" || phase === "player") && (
          <div style={phase === "player" ? { visibility: "hidden", height: 0, overflow: "hidden" } : undefined} aria-hidden={phase === "player"}>
            <Browse view={view} setView={setView} />
          </div>
        )}
        {phase === "player" && <Player data={data} startIndex={startEp} reduced={reduced} toast={toast} onExit={exitPlayer} />}
        {details && phase === "browse" && <DetailsModal key={titleKey(details)} t={details} onClose={() => setDetails(null)} />}

        {snack && (
          <div key={snack.id} className={`lf-snack${phone && phase === "browse" ? " is-tabs" : ""}`} role="status">
            {snack.icon && <span className="lf-snack-ic">{snack.icon}</span>}
            {snack.text}
          </div>
        )}

        {(phase === "browse" || phase === "player") && data.letter.trim() && (
          <LetterPop
            letter={data.letter}
            from={data.senderName}
            to={data.recipientName}
            question={data.lockQuestion}
            answer={data.lockAnswer || undefined}
            accent={ACCENT}
            accent2="#FF7A9C"
            paper="#FFF8F4"
            ink="#2A1418"
            bottom={phone ? 76 : 28}
            right={phone ? 14 : 28}
            delay={2600}
            teaser={`a letter from ${data.senderName || "someone"} 💌`}
            sign="yours, every season —"
            zIndex={Z.letter}
            forceOpen={letterOpen > 0}
          />
        )}
      </div>
    </LfContext.Provider>
  );
}
