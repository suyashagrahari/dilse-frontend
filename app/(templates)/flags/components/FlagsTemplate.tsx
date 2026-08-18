"use client";

// ─── Flags ───────────────────────────────────────────────────────────────────
//
// A swipe deck where the direction is the input. Each card carries three
// authored responses and the committed direction picks exactly one of them, so
// LEFT and RIGHT on the same card produce different text. That is the only
// thing separating this from a slideshow with a drag animation bolted on.
//
// Screen order: profile → deck → scorecard → closing card.
//
// Nothing here reproduces the wordmark, colour identity, icon set or interface
// of any real product. The swipe deck is a genre; the look is invented — serif
// type, paper stock, three inks and nothing else.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { setMuted, unlockAudio } from "@/lib/webAudio";

import {
  buildDeck,
  computeScorecard,
  type FlagsTemplateProps,
  type SwipeResult,
} from "./types";
import { CANVAS, HAIRLINE, INK, MONO, PAPER, UI } from "./flagsTheme";
import { InkFilterDefs } from "./InkStamp";
import CardDeck from "./CardDeck";
import FinalCard from "./FinalCard";
import ProfileScreen from "./ProfileScreen";
import ScorecardScreen from "./Scorecard";
import { useFinePointer, useNoOverscroll, useReducedMotion } from "./useEnv";

type Screen = "profile" | "deck" | "score" | "final";

/** The recipient's route to making their own — required on every live viewer. */
function BrandBadge() {
  return (
    <Link
      href="/templates"
      aria-label="Create your own on SubhSandesh"
      style={{
        position: "fixed",
        top: "calc(env(safe-area-inset-top, 0px) + 10px)",
        right: 12,
        zIndex: 60,
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
        padding: "6px 12px 6px 7px",
        borderRadius: 999,
        background: "rgba(250,248,244,0.9)",
        border: `1px solid ${HAIRLINE}`,
        backdropFilter: "blur(12px)",
        textDecoration: "none",
      }}
    >
      <Image src="/logo.webp" alt="" width={20} height={20} style={{ borderRadius: 6 }} />
      <span style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, color: INK, letterSpacing: -0.1 }}>
        SubhSandesh
      </span>
    </Link>
  );
}

export default function FlagsTemplate({ data, mode, shareId }: FlagsTemplateProps) {
  const reduced = useReducedMotion();
  const finePointer = useFinePointer();
  useNoOverscroll();

  const [screen, setScreen] = useState<Screen>("profile");
  const [results, setResults] = useState<SwipeResult[]>([]);
  const [sound, setSound] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const noticeTimer = useRef<number | null>(null);

  // Muted by default. `unlockAudio` needs a real user gesture, which is the tap
  // on the profile screen — there is no earlier one to borrow.
  useEffect(() => {
    setMuted(true);
  }, []);

  // Seeded so a refresh produces the identical order. Reshuffling on reload
  // would let a recipient re-roll a card she didn't like.
  const seed = mode === "live" ? `flags-${shareId ?? "shared"}` : "flags-demo";
  const deck = useMemo(() => buildDeck(data.cards, seed), [data.cards, seed]);
  /** Rebuild only when the card SET changes, not on every text edit. */
  const deckKey = useMemo(() => deck.map((c) => c.id).join("|"), [deck]);

  const score = useMemo(() => computeScorecard(deck, results), [deck, results]);

  const begin = useCallback(() => {
    unlockAudio();
    setScreen("deck");
  }, []);

  const complete = useCallback((r: SwipeResult[]) => {
    setResults(r);
    setScreen("score");
  }, []);

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

  return (
    <div
      style={{
        position: "relative",
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        background: screen === "profile" ? INK : CANVAS,
        overflow: "hidden",
        overscrollBehavior: "none",
      }}
    >
      <InkFilterDefs />
      <style>{`
        @keyframes flagsChevronDrift {
          0%, 100% { transform: rotate(45deg) translate(0px, 0px); opacity: .5; }
          50%      { transform: rotate(45deg) translate(-4px, -4px); opacity: 1; }
        }
        @keyframes flagsFadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {mode === "live" && <BrandBadge />}

      {/* sound toggle — top centre, clear of the Back and Create/brand chrome */}
      <button
        type="button"
        onClick={toggleSound}
        aria-pressed={sound}
        style={{
          position: "fixed",
          top: "calc(env(safe-area-inset-top, 0px) + 10px)",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 60,
          minHeight: 44,
          padding: "0 14px",
          background: "rgba(250,248,244,0.86)",
          border: `1px solid ${HAIRLINE}`,
          borderRadius: 999,
          fontFamily: MONO,
          fontSize: 10.5,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: INK,
          cursor: "pointer",
          backdropFilter: "blur(10px)",
        }}
      >
        {sound ? "sound on" : "sound off"}
      </button>

      <div
        key={screen}
        style={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          animation: reduced ? undefined : "flagsFadeUp 320ms cubic-bezier(0.22,0.61,0.36,1) both",
        }}
      >
        {screen === "profile" && (
          <ProfileScreen
            name={data.sender.name}
            age={data.sender.age}
            photoUrl={data.sender.photoUrl}
            tagline={data.sender.tagline}
            seed={seed}
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
            finePointer={finePointer}
            onComplete={complete}
          />
        )}

        {screen === "score" && (
          <ScorecardScreen
            score={score}
            recipientName={data.recipientName}
            senderName={firstName}
            reduced={reduced}
            onNext={() => setScreen("final")}
            onExport={flashNotice}
          />
        )}

        {screen === "final" && (
          <FinalCard text={data.finalCard} senderName={firstName} reduced={reduced} />
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
            background: INK,
            color: PAPER,
            border: `1px solid ${INK}`,
            borderRadius: 2,
            padding: "10px 14px",
            fontFamily: MONO,
            fontSize: 11.5,
            letterSpacing: "0.08em",
          }}
        >
          {notice}
        </div>
      )}
    </div>
  );
}
