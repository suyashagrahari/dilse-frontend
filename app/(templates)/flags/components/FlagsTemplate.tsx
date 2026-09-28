"use client";

// ─── Flags ───────────────────────────────────────────────────────────────────
//
// A swipe deck where the direction is the input. Each card carries three
// authored responses and the committed direction picks exactly one of them, so
// LEFT and RIGHT on the same card produce different text.
//
// Screen order: profile (the memories, as a dating profile) → deck →
// scorecard → it's a match (the letter).
//
// Colours come from the picked theme (./themes) as CSS custom properties; the
// sender's preview gets a floating dock to flip between them.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { setMuted, unlockAudio } from "@/lib/webAudio";

import { DATE_FONT_VARS } from "../../date-invitation/components/fonts";
import { BrandBadge, LOVE_CSS, LoveSky, LoveThemeContext, ThemeDock } from "../../_love/LoveKit";
import { V, pickTheme, themeVars } from "../../_love/theme";
import type { LovePhoto } from "../../_love/types";
import { buildDeck, computeScorecard, type FlagsTemplateProps, type SwipeResult } from "./types";
import { GROTESK } from "./flagsTheme";
import CardDeck from "./CardDeck";
import MatchScreen from "./MatchScreen";
import ProfileScreen from "./ProfileScreen";
import ScorecardScreen from "./Scorecard";
import { FLAGS_THEMES, flagVars } from "./themes";
import { useNoOverscroll, useReducedMotion } from "./useEnv";

type Screen = "profile" | "deck" | "score" | "match";

export default function FlagsTemplate({ data, mode, shareId, onThemeChange }: FlagsTemplateProps) {
  const reduced = useReducedMotion();
  useNoOverscroll();
  const live = mode === "live";
  const theme = pickTheme(FLAGS_THEMES, data.theme);

  const [screen, setScreen] = useState<Screen>("profile");
  const [round, setRound] = useState(0);
  const [results, setResults] = useState<SwipeResult[]>([]);
  const [sound, setSound] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const noticeTimer = useRef<number | null>(null);

  useEffect(() => {
    setMuted(true);
  }, []);

  // Seeded so a refresh produces the identical order.
  const seed = live ? `flags-${shareId ?? "shared"}` : "flags-demo";
  const deck = useMemo(() => buildDeck(data.cards, seed), [data.cards, seed]);
  const deckKey = useMemo(() => deck.map((c) => c.id).join("|"), [deck]);
  const score = useMemo(() => computeScorecard(deck, results), [deck, results]);

  // The profile carousel: the memories, else the pre-love-kit profile photo.
  const photos: LovePhoto[] = useMemo(
    () => (data.photos.length ? data.photos : data.sender.photoUrl ? [{ url: data.sender.photoUrl }] : []),
    [data.photos, data.sender.photoUrl],
  );

  const go = useCallback((s: Screen) => {
    setScreen(s);
    window.scrollTo({ top: 0 });
  }, []);

  const begin = useCallback(() => {
    unlockAudio();
    go("deck");
  }, [go]);

  const complete = useCallback(
    (r: SwipeResult[]) => {
      setResults(r);
      go("score");
    },
    [go],
  );

  const replay = useCallback(() => {
    setResults([]);
    setRound((n) => n + 1);
    go("profile");
  }, [go]);

  const toggleSound = useCallback(() => {
    setSound((on) => {
      const next = !on;
      setMuted(!next);
      if (next) unlockAudio();
      return next;
    });
  }, []);

  const flashNotice = useCallback((_ok: boolean, message: string) => {
    setNotice(message);
    if (noticeTimer.current) window.clearTimeout(noticeTimer.current);
    noticeTimer.current = window.setTimeout(() => setNotice(null), 2600);
  }, []);

  useEffect(
    () => () => {
      if (noticeTimer.current) window.clearTimeout(noticeTimer.current);
    },
    [],
  );

  const firstName = (data.sender.name || "they").trim().split(/\s+/)[0] || "they";
  const recipient = (data.recipientName || "you").trim().split(/\s+/)[0] || "you";

  return (
    <LoveThemeContext.Provider value={theme}>
      <div
        className={`${DATE_FONT_VARS} lv-root`}
        style={{
          ...themeVars(theme),
          ...flagVars(theme.id),
          position: "relative",
          isolation: "isolate",
          minHeight: "100dvh",
          display: "flex",
          flexDirection: "column",
          background: theme.colors.base,
          color: V.ink,
          fontFamily: GROTESK,
          overflowX: "clip",
          overscrollBehavior: "none",
        }}
      >
        <style>{LOVE_CSS + "@keyframes fl-fade { from { opacity: 0 } to { opacity: 1 } }"}</style>
        <LoveSky theme={theme} reduceMotion={reduced} />

        {live && <BrandBadge />}
        {!live && onThemeChange && <ThemeDock themes={FLAGS_THEMES} value={theme.id} onChange={onThemeChange} />}

        {/* Opacity only: a transform here would trap the profile's fixed CTA. */}
        <div key={`${screen}-${round}`} style={{ position: "relative", zIndex: 1, flex: 1, display: "flex", flexDirection: "column", animation: reduced ? undefined : "fl-fade .38s ease both" }}>
          {screen === "profile" && (
            <ProfileScreen
              name={data.sender.name}
              age={data.sender.age}
              tagline={data.sender.tagline}
              photos={photos}
              cardCount={deck.filter((c) => c.kind === "flag").length}
              reduced={reduced}
              onBegin={begin}
            />
          )}

          {screen === "deck" && (
            <CardDeck
              key={deckKey}
              deck={deck}
              senderName={firstName}
              reduced={reduced}
              sound={sound}
              onToggleSound={toggleSound}
              sincereGif={data.gifs[2]}
              onComplete={complete}
            />
          )}

          {screen === "score" && (
            <ScorecardScreen
              score={score}
              recipientName={recipient}
              senderName={firstName}
              reduced={reduced}
              gif={data.gifs[0]}
              paperColor={theme.colors.paper}
              onNext={() => go("match")}
              onExport={flashNotice}
            />
          )}

          {screen === "match" && (
            <MatchScreen
              senderName={firstName}
              recipientName={recipient}
              closing={data.finalCard}
              letter={data.letter}
              photos={photos}
              gif={data.gifs[1]}
              lockQuestion={data.lockQuestion}
              lockAnswer={data.lockAnswer}
              live={live}
              reduced={reduced}
              onReplay={replay}
            />
          )}
        </div>

        {notice && (
          <div
            role="status"
            style={{
              position: "fixed",
              left: "50%",
              transform: "translateX(-50%)",
              bottom: "calc(env(safe-area-inset-bottom, 0px) + 18px)",
              zIndex: 70,
              background: V.ink,
              color: V.base,
              borderRadius: 999,
              padding: "11px 18px",
              fontFamily: GROTESK,
              fontWeight: 700,
              fontSize: 13.5,
              whiteSpace: "nowrap",
            }}
          >
            {notice}
          </div>
        )}
      </div>
    </LoveThemeContext.Provider>
  );
}
