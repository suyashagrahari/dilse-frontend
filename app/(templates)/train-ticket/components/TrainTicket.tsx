"use client";

// ─── Train Ticket — the template ─────────────────────────────────────────────
//
// Two stages:
//
//   check    the PNR status board. The recipient taps "check PNR status" and
//            watches the waitlist flip WL → RAC → CNF (a real poll in live
//            mode — before the chart time the server sends no names, seats,
//            letter or photos at all).
//   ticket   the payoff, told as full-screen chapters (_love/Story):
//              your ticket → the journey of us (tap the train station to
//              station) → window-seat memories (the photo deck) → a sealed
//              letter (locked with a question) → the ticket to keep (save the
//              PNG, the fare, the fine print). Each GIF appears once, as a
//              reaction at one moment.
//
// Colours come from the chosen theme (./themes) as CSS variables.

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { DATE_FONT_VARS } from "../../date-invitation/components/fonts";
import {
  BrandBadge,
  GhostButton,
  GradText,
  GROTESK,
  ITALIC,
  LOVE_CSS,
  LoveSky,
  LoveThemeContext,
  Sticker,
  ThemeDock,
} from "../../_love/LoveKit";
import LockedLetter from "../../_love/LockedLetter";
import PhotoDeck from "../../_love/PhotoDeck";
import LoveStory, { ChapterHead, GifMoment, type Chapter, type StoryApi } from "../../_love/Story";
import { V, pickTheme, themeVars, type LoveTheme } from "../../_love/theme";
import { usePrefersReducedMotion } from "../hooks/useTicketClock";
import BoardingPass from "./BoardingPass";
import { FareReceipt, FinePrint, JourneyRide } from "./JourneyBits";
import StatusCheck from "./StatusCheck";
import { TRAIN_THEMES } from "./themes";
import type { ChartGate, TicketData } from "./types";

type Stage = "check" | "ticket";

const LAYOUT_CSS = `
.tt-wrap { position: relative; z-index: 1; width: 100%; max-width: 1080px; margin: 0 auto; padding-left: 16px; padding-right: 16px; }
@keyframes tt-blink { 50% { opacity: 0 } }
.tt-blink { animation: tt-blink .9s step-end infinite; }
@media (prefers-reduced-motion: reduce) { .tt-blink { animation: none; } }
`;

/** "KIRAN R" → "Kiran". */
const firstName = (n: string): string => {
  const w = n.trim().split(/\s+/)[0] ?? "";
  return w ? w[0].toUpperCase() + w.slice(1).toLowerCase() : "";
};

export default function TrainTicket({
  data,
  gate,
  mode,
  onCheck,
  onThemeChange,
}: {
  data: TicketData;
  /** The server's chart verdict. In preview the sender always sees their own data. */
  gate: ChartGate;
  mode: "preview" | "live";
  onCheck?: () => Promise<{ data: TicketData; gate: ChartGate }>;
  /** Preview only: the floating theme dock calls this. */
  onThemeChange?: (id: string) => void;
}) {
  const live = mode === "live";
  const reduceMotion = usePrefersReducedMotion();
  const theme = pickTheme(TRAIN_THEMES, data.theme);
  const [stage, setStage] = useState<Stage>("check");
  // Live: the freshest server snapshot (the redacted first payload grows once the
  // chart is prepared). Preview: always the sender's current data.
  const [snap, setSnap] = useState<TicketData | null>(null);
  const t = live && snap ? snap : data;

  const openTicket = (s: { data: TicketData; gate: ChartGate }) => {
    setSnap(s.data);
    setStage("ticket");
    window.scrollTo({ top: 0, behavior: "auto" });
  };
  const again = () => {
    setStage("check");
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  };

  const [p1, p2] = t.passengers;
  const a = firstName(p1?.name ?? "");
  const b = firstName(p2?.name ?? "");
  // Who is writing is not recorded, so the letter is addressed seat to seat.
  const to = p1?.seat ? `seat ${p1.seat}` : a || "you";
  const from = p2?.seat ? `seat ${p2.seat}` : b || "me";

  // Each GIF is used once, at one moment: boarding, the end of the photos,
  // the letter unlocking.
  const gif = (i: number) => t.gifs[i];
  const hasPhotos = t.photos.length > 0;
  const hasLetter = t.letter.trim().length > 0;
  const toName = a || "you";

  const chapters: Chapter[] = [
    {
      id: "ticket",
      emoji: "🎫",
      title: "your ticket",
      render: (api) => <TicketChapter t={t} a={a} b={b} theme={theme} gif={gif(0)} reduceMotion={reduceMotion} onLanded={api.complete} />,
    },
    {
      id: "journey",
      emoji: "🗺️",
      title: "the journey of us",
      render: (api) => (
        <>
          <ChapterHead kicker={`${t.trainNo} · ${t.trainName.toLowerCase()} · running status`} title="Ride the journey of us 🚆" note="tap to move the train, one stop at a time" />
          <JourneyRide data={t} reduceMotion={reduceMotion} onArrive={() => api.done(4200)} />
        </>
      ),
    },
    ...(hasPhotos
      ? [
          {
            id: "photos",
            emoji: "📸",
            title: "window-seat memories",
            render: (api: StoryApi) => <PhotosChapter photos={t.photos} gif={gif(1)} reduceMotion={reduceMotion} onDone={() => api.done(2600)} />,
          },
        ]
      : []),
    ...(hasLetter
      ? [
          {
            id: "letter",
            emoji: "💌",
            title: "a sealed letter",
            gated: true,
            render: (api: StoryApi) => (
              <LockedLetter
                letter={t.letter}
                from={from}
                to={to}
                question={t.lockQuestion.trim() || `${toName}, will you board this train with me? 🚆`}
                answer={t.lockAnswer.trim() || "all aboard 💖"}
                gif={gif(2)}
                gifCaption="next stop: forever 🥹"
                reduceMotion={reduceMotion}
                onOpened={api.complete}
              />
            ),
          },
        ]
      : []),
    {
      id: "keep",
      emoji: "🧾",
      title: "a ticket to keep",
      render: () => <KeepChapter t={t} theme={theme} onReplay={again} />,
    },
  ];

  return (
    <LoveThemeContext.Provider value={theme}>
      <div
        className={`${DATE_FONT_VARS} lv-root`}
        style={{ ...themeVars(theme), minHeight: "100dvh", position: "relative", isolation: "isolate", overflowX: "clip", color: V.ink, background: theme.colors.base, fontFamily: GROTESK }}
      >
        <style>{LOVE_CSS + LAYOUT_CSS}</style>
        <LoveSky theme={theme} reduceMotion={reduceMotion} />

        {live && <BrandBadge />}
        {!live && onThemeChange && <ThemeDock themes={TRAIN_THEMES} value={theme.id} onChange={onThemeChange} />}

        {stage === "check" && <StatusCheck data={data} gate={gate} onCheck={onCheck} onOpenTicket={openTicket} demo={!live} />}

        {stage === "ticket" && <LoveStory chapters={chapters} reduceMotion={reduceMotion} />}
      </div>
    </LoveThemeContext.Provider>
  );
}

// ─── Chapters ────────────────────────────────────────────────────────────────

function TicketChapter({ t, a, b, theme, gif, reduceMotion, onLanded }: { t: TicketData; a: string; b: string; theme: LoveTheme; gif?: string; reduceMotion: boolean; onLanded: () => void }) {
  const [landed, setLanded] = useState(reduceMotion);
  useEffect(() => {
    const id = window.setTimeout(() => {
      setLanded(true);
      onLanded();
    }, reduceMotion ? 0 : 1500);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div className="tt-wrap" style={{ padding: 0 }}>
      <header className={reduceMotion ? "" : "lv-pop"} style={{ textAlign: "center", marginBottom: 16 }}>
        <Sticker>✓ CNF · it&apos;s official</Sticker>
        <h1 style={{ margin: "14px 0 0", fontWeight: 800, fontSize: "clamp(32px, 8.4vw, 60px)", lineHeight: 0.98, letterSpacing: "-0.04em" }}>
          {a && b ? (
            <>
              {a} <GradText>&amp;</GradText> {b}, you&apos;re booked
            </>
          ) : (
            <>
              your seat is <GradText>confirmed</GradText>
            </>
          )}
        </h1>
        <p style={{ margin: "10px auto 0", maxWidth: 520, fontFamily: ITALIC, fontStyle: "italic", fontSize: 19, lineHeight: 1.35, color: V.soft }}>
          {t.from.name} → {t.to.name}. No more waitlist. Seats together, window side, snacks on me.
        </p>
      </header>
      {gif && (
        <div style={{ margin: "-6px 0 14px", minHeight: 92 }}>
          <GifMoment src={gif} caption="all aboard! 🚂" show={landed} size={84} />
        </div>
      )}
      <BoardingPass data={t} theme={theme} hideSave />
    </div>
  );
}

function PhotosChapter({ photos, gif, reduceMotion, onDone }: { photos: TicketData["photos"]; gif?: string; reduceMotion: boolean; onDone: () => void }) {
  const [all, setAll] = useState(false);
  return (
    <>
      <ChapterHead kicker="the stops we made" title="Window-seat memories 📸" />
      <PhotoDeck
        photos={photos}
        reduceMotion={reduceMotion}
        backLabel="a note from the window seat"
        onAllSeen={() => {
          setAll(true);
          onDone();
        }}
      />
      <div style={{ marginTop: 14, minHeight: 20 }}>
        <GifMoment src={gif} caption="best views on this route 🥹" show={all} size={96} />
      </div>
    </>
  );
}

/** The finale: the pass to save, plus the fare and the fine print as two little flaps. */
function KeepChapter({ t, theme, onReplay }: { t: TicketData; theme: LoveTheme; onReplay: () => void }) {
  const [flap, setFlap] = useState<"fare" | "rules" | null>(null);
  const total = t.fare[t.fare.length - 1]?.value || "PRICELESS";
  const toggle = (f: "fare" | "rules") => setFlap((cur) => (cur === f ? null : f));
  return (
    <div className="tt-wrap" style={{ padding: 0 }}>
      <ChapterHead kicker="end of the line (for now)" title="A ticket to keep 🎫" note="save it, frame it, forward it to the family group" />
      <BoardingPass data={t} theme={theme} />
      <div style={{ marginTop: 6, display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
        <FlapButton on={flap === "fare"} onClick={() => toggle("fare")}>
          🧾 fare · <b>{total}</b>
        </FlapButton>
        <FlapButton on={flap === "rules"} onClick={() => toggle("rules")}>
          📜 the fine print
        </FlapButton>
      </div>
      <AnimatePresence mode="wait" initial={false}>
        {flap && (
          <motion.div key={flap} initial={{ opacity: 0, y: -10, height: 0 }} animate={{ opacity: 1, y: 0, height: "auto" }} exit={{ opacity: 0, height: 0 }} style={{ overflow: "hidden" }}>
            <div style={{ position: "relative", paddingTop: 16 }}>
              {flap === "fare" ? <FareReceipt data={t} /> : <FinePrint lines={t.finePrint} />}
              {flap === "fare" && (
                <span className="lv-slap" aria-hidden style={{ position: "absolute", right: "max(8px, calc(50% - 250px))", top: 30, padding: "4px 10px", border: `3px solid ${V.a1}`, borderRadius: 8, color: V.a1, fontWeight: 800, fontSize: 14, letterSpacing: ".12em", background: "color-mix(in srgb, var(--lv-paper) 80%, transparent)" }}>
                  PAID IN HUGS
                </span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div style={{ marginTop: 18, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
        <GhostButton onClick={onReplay} style={{ width: "auto", minWidth: 220 }}>
          ↺ check the PNR again
        </GhostButton>
        <p style={{ margin: 0, fontSize: 12, color: V.faint }}>Indian Hearts Railway is fictional. The feelings are not. 🚆</p>
      </div>
    </div>
  );
}

function FlapButton({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={on}
      className="lv-focus"
      style={{ minHeight: 46, padding: "0 18px", borderRadius: 999, cursor: "pointer", border: on ? "none" : `1.5px solid ${V.edge}`, background: on ? V.grad : V.glass, color: on ? "#fff" : V.ink, fontFamily: GROTESK, fontWeight: 700, fontSize: 14.5 }}
    >
      {children}
    </button>
  );
}
