"use client";

// ─── Train Ticket — the template ─────────────────────────────────────────────
//
// Two stages:
//
//   check    the PNR status board. The recipient taps "check PNR status" and
//            watches the waitlist flip WL → RAC → CNF (a real poll in live
//            mode — before the chart time the server sends no names, seats,
//            letter or photos at all).
//   ticket   the payoff: a boarding pass with a live departure countdown, then
//            ONE screen of tappable tiles — window-seat memories (photos with
//            little letters), the main letter, the GIF mood board, the journey
//            of us (running status), the fare and the fine print — each opening
//            in a sheet, so nothing is a long scroll away.
//
// Colours come from the chosen theme (./themes) as CSS variables.

import { useState } from "react";

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
  SectionHead,
  Sticker,
  Tape,
  ThemeDock,
} from "../../_love/LoveKit";
import MemoryHub, { EmojiArt, type HubTile } from "../../_love/MemoryHub";
import { loveTiles } from "../../_love/Memories";
import { V, pickTheme, themeVars } from "../../_love/theme";
import { usePrefersReducedMotion } from "../hooks/useTicketClock";
import BoardingPass from "./BoardingPass";
import { FareReceipt, FinePrint, JourneyRoute, RouteArt } from "./JourneyBits";
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

  const tiles: HubTile[] = [
    ...loveTiles({
      photos: t.photos,
      gifs: t.gifs,
      letter: t.letter,
      from,
      to,
      reduceMotion,
      labels: {
        photos: "Window-seat memories",
        photosSub: `${t.photos.length} stops we made · tap for the notes`,
        letter: "Letter on the berth",
        letterSub: `for ${to} · tap to open`,
        gifs: "Platform vibes",
      },
    }),
    {
      id: "fare",
      emoji: "🧾",
      title: "Fare details",
      sub: t.fare[t.fare.length - 1]?.value || "priceless",
      tone: "paper",
      art: <EmojiArt emoji="🧾" />,
      content: () => <FareReceipt data={t} />,
    },
    {
      id: "route",
      emoji: "🗺️",
      title: "The journey of us",
      sub: `${t.stations.length} stations · live running status`,
      size: "wide",
      tone: "glass",
      art: <RouteArt data={t} />,
      sheetTitle: "Running status",
      content: () => <JourneyRoute data={t} />,
    },
    {
      id: "rules",
      emoji: "📜",
      title: "Fine print",
      sub: "non-transferable. obviously.",
      size: "wide",
      tone: "chip",
      art: <EmojiArt emoji="🎫" label="T&C" />,
      sheetTitle: "Terms & conditions",
      content: () => <FinePrint lines={t.finePrint} />,
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

        {stage === "ticket" && (
          <main className="tt-wrap" style={{ paddingTop: 84, paddingBottom: live ? 56 : 112 }}>
            <header className={reduceMotion ? "" : "lv-pop"} style={{ textAlign: "center", marginBottom: 28 }}>
              <Sticker>✓ CNF · it&apos;s official</Sticker>
              <h1 style={{ margin: "14px 0 0", fontWeight: 800, fontSize: "clamp(34px, 8.6vw, 62px)", lineHeight: 0.98, letterSpacing: "-0.04em" }}>
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
              <p style={{ margin: "10px auto 0", maxWidth: 520, fontFamily: ITALIC, fontStyle: "italic", fontSize: 20, lineHeight: 1.35, color: V.soft }}>
                {t.from.name} → {t.to.name}. No more waitlist. Seats together, window side, snacks on me.
              </p>
            </header>

            <BoardingPass data={t} theme={theme} gif={t.gifs[0]} />

            <div style={{ margin: "40px 0 0" }}>
              <Tape
                words={[
                  `train ${t.trainNo} ${t.trainName.toLowerCase()} arriving on platform ♥`,
                  "please mind the gap between us",
                  "no more waitlist",
                  "window seat reserved",
                ]}
                reduceMotion={reduceMotion}
              />
            </div>

            <section style={{ marginTop: 44 }}>
              <SectionHead eyebrow="your journey kit" title="Tap anything to open it" emoji="👇" />
              <MemoryHub tiles={tiles} reduceMotion={reduceMotion} />
            </section>

            <div style={{ marginTop: 40, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
              <GhostButton onClick={again} style={{ width: "auto", minWidth: 220 }}>
                ↺ check the PNR again
              </GhostButton>
              <p style={{ margin: 0, fontSize: 12, color: V.faint }}>Indian Hearts Railway is fictional. The feelings are not. 🚆</p>
            </div>
          </main>
        )}
      </div>
    </LoveThemeContext.Provider>
  );
}
