"use client";

// ─── Kundli Milan — the cosmic love match ────────────────────────────────────
//
// A totally unscientific, very romantic horoscope match, told as a little show:
//
//   intro     two names on a spinning zodiac wheel, "will the stars approve?"
//   scanning  five seconds of silly cosmic computation
//   result    the score reveal, then ONE screen of tappable tiles — photos
//             (each with a little letter), the love letter, the GIFs, the 8
//             gunas, the remedies and the certificate — each opening in a
//             sheet, so nothing is a long scroll away.
//
// Colours come from the chosen theme (./themes) as CSS variables; the numbers
// come from `computeKundliReport()` — deterministic from the two birth dates,
// always warm (28–36/36), never a real reading.

import { useEffect, useMemo, useState } from "react";

import { templateMediaBase } from "@/lib/templateMedia";
import { DATE_FONT_VARS } from "../../date-invitation/components/fonts";
import useReducedMotion from "../../date-invitation/components/useReducedMotion";
import {
  BrandBadge,
  CandyButton,
  Eyebrow,
  GhostButton,
  Glass,
  GradText,
  GROTESK,
  HeartBurst,
  ITALIC,
  LOVE_CSS,
  LoveThemeContext,
  LoveSky,
  SectionHead,
  Sticker,
  Tape,
  ThemeDock,
} from "../../_love/LoveKit";
import MemoryHub, { EmojiArt, type HubTile } from "../../_love/MemoryHub";
import { loveTiles } from "../../_love/Memories";
import { V, pickTheme, themeVars } from "../../_love/theme";
import {
  COSMIC_CSS,
  PhotoOrb,
  ZodiacRing,
  firstName,
  initials,
} from "./CosmicKit";
import GunaCards, { FUN_KOOTA } from "./GunaCards";
import { Certificate } from "./Finale";
import { KUNDLI_THEMES } from "./themes";
import {
  computeKundliReport,
  type KundliMilanTemplateProps,
  type KundliReport,
} from "./types";

const ASSET = templateMediaBase("kundli-milan");
const SCAN_MS = 5600;

type Stage = "intro" | "scanning" | "result";

/** Simple, funny English — the engine's own conclusion is a formal parody. */
function funVerdict(total: number, a: string, b: string): string {
  const lines = [
    `${a} and ${b} matched ${total} of 36 gunas. The universe checked twice, smiled, and said "just marry already".`,
    `${total} out of 36. Even the planets are shipping ${a} and ${b} now. Mars has made a fan account.`,
    `The stars ran the numbers, got ${total}/36, and immediately started planning the sangeet playlist.`,
    `${total}/36 gunas. Scientifically meaningless, emotionally undeniable. ${b} is stuck with ${a}. Congratulations.`,
  ];
  return lines[total % lines.length];
}

function funGrade(total: number): { label: string; emoji: string } {
  if (total >= 36) return { label: "Literally made in heaven", emoji: "😇" };
  if (total >= 33) return { label: "Certified soulmates", emoji: "💞" };
  if (total >= 30) return { label: "Chaotic but perfect", emoji: "🔥" };
  return { label: "Opposites attract, obviously", emoji: "🧲" };
}

const LAYOUT_CSS = `
.km-wrap { position: relative; z-index: 1; width: 100%; max-width: 1080px; margin: 0 auto; padding: 0 16px; }
.km-hero-grid { display: grid; grid-template-columns: minmax(0, 1fr); gap: 14px; align-items: center; }
@media (min-width: 960px) { .km-hero-grid { grid-template-columns: minmax(0, 1fr) minmax(0, 1.15fr); gap: 40px; } }
`;

export default function KundliMilanTemplate({
  data,
  mode,
  onThemeChange,
}: KundliMilanTemplateProps) {
  const reduceMotion = useReducedMotion();
  const theme = pickTheme(KUNDLI_THEMES, data.theme);
  const report = useMemo(() => computeKundliReport(data), [data]);
  const [stage, setStage] = useState<Stage>("intro");

  const a = firstName(data.groom.name);
  const b = firstName(data.bride.name);
  const grade = funGrade(report.total);

  const scanLines = useMemo(
    () => [
      `Aligning Mars with ${a}'s gym schedule…`,
      `Asking Venus about ${b}'s Swiggy history…`,
      "Consulting a very confused pigeon…",
      "Checking whose turn it is to say sorry…",
      "Measuring the blanket-stealing index…",
      "Negotiating with Saturn (he's being difficult)…",
      "Almost there — Jupiter is buffering…",
    ],
    [a, b],
  );

  const start = () => {
    setStage("scanning");
    window.scrollTo({ top: 0, behavior: "auto" });
  };
  const replay = () => {
    setStage("intro");
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  };

  // The scan is theatre: it always finishes on its own.
  useEffect(() => {
    if (stage !== "scanning") return;
    const id = window.setTimeout(
      () => setStage("result"),
      reduceMotion ? 600 : SCAN_MS,
    );
    return () => window.clearTimeout(id);
  }, [stage, reduceMotion]);

  const tiles: HubTile[] = [
    ...loveTiles({
      photos: data.photos,
      gifs: data.gifs,
      letter: data.letter,
      from: a,
      to: b,
      reduceMotion,
      labels: {
        photos: "Proof you're cute",
        photosSub: `${data.photos.length} photos · tap for their little letters`,
        gifs: "Mood board",
      },
    }),
    {
      id: "remedies",
      emoji: "💊",
      title: "Remedies",
      sub: `${data.remedies.length} cosmic prescriptions`,
      tone: "paper",
      art: <RemedyArt />,
      sheetTitle: "Pandit ji prescribes",
      content: () => (
        <Remedies remedies={data.remedies} astrologer={data.astrologerName} />
      ),
    },
    {
      id: "gunas",
      emoji: "🔮",
      title: "The 8 gunas, decoded",
      sub: "remote control rights, tantrum meter & more",
      size: "wide",
      tone: "glass",
      art: <GunaArt report={report} />,
      wide: true,
      content: () => (
        <>
          <GunaCards
            kootas={report.kootas}
            aName={a}
            bName={b}
            reduceMotion={reduceMotion}
          />
          <Glass
            style={{
              marginTop: 14,
              padding: "16px 18px",
              display: "flex",
              alignItems: "center",
              gap: 14,
            }}
          >
            <span style={{ fontSize: 30 }} aria-hidden>
              🪐
            </span>
            <p style={{ margin: 0, fontSize: 15, lineHeight: 1.5 }}>
              <b>Mangal Dosha report:</b>{" "}
              <span style={{ color: V.soft }}>{report.mangalDosha}</span>
            </p>
          </Glass>
        </>
      ),
    },
    {
      id: "certificate",
      emoji: "📜",
      title: "Your certificate",
      sub: "official-ish · save it as a picture",
      size: "wide",
      tone: "candy",
      art: <EmojiArt emoji="📜" label={`${report.total}/36`} />,
      content: () => (
        <Certificate
          theme={theme}
          aName={a}
          bName={b}
          total={report.total}
          grade={`${grade.label} ${grade.emoji}`}
          issuedLabel={issuedLabel(data.issuedOn)}
          astrologer={data.astrologerName}
          photo={data.photos[0]}
        />
      ),
    },
  ];

  return (
    <LoveThemeContext.Provider value={theme}>
      <div
        className={`${DATE_FONT_VARS} lv-root`}
        style={{
          ...themeVars(theme),
          minHeight: "100dvh",
          position: "relative",
          isolation: "isolate",
          overflowX: "clip",
          color: V.ink,
          background: theme.colors.base,
          fontFamily: GROTESK,
        }}
      >
        <style>{LOVE_CSS + COSMIC_CSS + LAYOUT_CSS}</style>
        <LoveSky theme={theme} reduceMotion={reduceMotion} />
        {/* The template's signature: a giant faint zodiac wheel behind everything. */}
        <div
          aria-hidden
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 0,
            pointerEvents: "none",
            overflow: "hidden",
          }}
        >
          <div
            className={reduceMotion ? "" : "km-spin-rev"}
            style={{
              position: "absolute",
              left: "50%",
              top: "38%",
              width: "140vmin",
              height: "140vmin",
              marginLeft: "-70vmin",
              marginTop: "-70vmin",
              opacity: theme.dark ? 0.1 : 0.14,
            }}
          >
            <ZodiacRing size="100%" stroke={V.a3} glyphSize="5vmin" />
          </div>
        </div>

        {mode === "live" && <BrandBadge />}
        {mode === "demo" && onThemeChange && (
          <ThemeDock
            themes={KUNDLI_THEMES}
            value={theme.id}
            onChange={onThemeChange}
          />
        )}

        {stage === "intro" && (
          <Intro
            data={data}
            a={a}
            b={b}
            onStart={start}
            reduceMotion={reduceMotion}
          />
        )}
        {stage === "scanning" && (
          <Scanning
            data={data}
            a={a}
            b={b}
            lines={scanLines}
            reduceMotion={reduceMotion}
          />
        )}

        {stage === "result" && (
          <main
            className="km-wrap"
            style={{
              paddingTop: 84,
              paddingBottom: mode === "demo" ? 110 : 56,
            }}
          >
            {/* ── The reveal ─────────────────────────────────────────────── */}
            <section className="km-hero-grid">
              <div
                style={{
                  position: "relative",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                {!reduceMotion && <HeartBurst />}
                <ScoreRing total={report.total} reduceMotion={reduceMotion} />
                {data.gifs[0] && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={data.gifs[0]}
                    alt=""
                    className={reduceMotion ? "" : "lv-float"}
                    style={{
                      position: "absolute",
                      right: "max(0px, calc(50% - 190px))",
                      bottom: -6,
                      width: 92,
                      height: 92,
                      objectFit: "contain",
                      borderRadius: 20,
                      background: "#fff",
                      border: "4px solid #fff",
                      boxShadow: `0 16px 30px -14px ${V.shadow}`,
                      transform: "rotate(8deg)",
                    }}
                  />
                )}
              </div>
              <div
                className={reduceMotion ? "" : "lv-pop"}
                style={{ textAlign: "center" }}
              >
                <Sticker>✓ the stars have spoken</Sticker>
                <h1
                  style={{
                    margin: "14px 0 0",
                    fontWeight: 800,
                    fontSize: "clamp(36px, 9vw, 64px)",
                    lineHeight: 0.98,
                    letterSpacing: "-0.04em",
                  }}
                >
                  {a} <GradText>&amp;</GradText> {b}
                </h1>
                <p
                  style={{
                    margin: "10px 0 0",
                    fontSize: "clamp(20px, 5vw, 28px)",
                    fontWeight: 800,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {grade.label} <span aria-hidden>{grade.emoji}</span>
                </p>
                <p
                  style={{
                    margin: "10px auto 0",
                    maxWidth: 520,
                    fontFamily: ITALIC,
                    fontStyle: "italic",
                    fontSize: 20,
                    lineHeight: 1.35,
                    color: V.soft,
                  }}
                >
                  {funVerdict(report.total, a, b)}
                </p>
                <div
                  style={{
                    marginTop: 14,
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 8,
                    justifyContent: "center",
                  }}
                >
                  <Stat
                    label="match"
                    value={`${Math.round((report.total / 36) * 100)}%`}
                  />
                  <Stat label="mangal dosha" value="cancelled ✓" />
                  <Stat label="pandit ji" value="approved 🙏" />
                </div>
              </div>
            </section>

            <div style={{ margin: "34px 0 0" }}>
              <Tape
                words={[
                  "36 gunas checked",
                  "no refunds",
                  "the universe said yes",
                  "zero red flags (mostly)",
                ]}
                reduceMotion={reduceMotion}
              />
            </div>

            {/* ── Everything else, one tap away ─────────────────────────── */}
            <section style={{ marginTop: 44 }}>
              <SectionHead
                eyebrow="the full report"
                title="Tap anything to open it"
                emoji="👇"
              />
              <MemoryHub tiles={tiles} reduceMotion={reduceMotion} />
            </section>

            <div
              style={{
                marginTop: 40,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 10,
              }}
            >
              <GhostButton
                onClick={replay}
                style={{ width: "auto", minWidth: 220 }}
              >
                ↺ consult the stars again
              </GhostButton>
              <p style={{ margin: 0, fontSize: 12, color: V.faint }}>
                For fun and love only. No astrologers were harmed. ✨
              </p>
            </div>
          </main>
        )}
      </div>
    </LoveThemeContext.Provider>
  );
}

// ─── Hub bits ────────────────────────────────────────────────────────────────

function RemedyArt() {
  return (
    <span
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        display: "grid",
        placeItems: "center",
        paddingBottom: 44,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`${ASSET}/remedy-chai.webp`}
        alt=""
        className="km-wobble"
        style={{
          width: "62%",
          maxWidth: 110,
          aspectRatio: "1 / 1",
          objectFit: "contain",
        }}
      />
    </span>
  );
}

function GunaArt({ report }: { report: KundliReport }) {
  return (
    <span
      aria-hidden
      style={{
        position: "absolute",
        inset: "14px 14px 58px",
        display: "grid",
        gridTemplateColumns: "repeat(8, minmax(0, 1fr))",
        gap: 6,
        alignItems: "end",
      }}
    >
      {report.kootas.map((k) => (
        <span
          key={k.name}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
            height: "100%",
            justifyContent: "flex-end",
          }}
        >
          <span
            style={{
              width: "100%",
              maxWidth: 26,
              borderRadius: 8,
              height: `${Math.max(18, Math.round((k.obtained / k.max) * 100))}%`,
              background: FUN_KOOTA[k.name].tint,
              opacity: 0.9,
            }}
          />
          <span style={{ fontSize: 16, lineHeight: 1 }}>
            {FUN_KOOTA[k.name].emoji}
          </span>
        </span>
      ))}
    </span>
  );
}

function Remedies({
  remedies,
  astrologer,
}: {
  remedies: string[];
  astrologer: string;
}) {
  return (
    <div
      style={{
        position: "relative",
        maxWidth: 600,
        margin: "30px auto 0",
        background: V.paper,
        color: V.paperInk,
        borderRadius: 24,
        padding: "24px 20px 20px",
        boxShadow: `0 30px 60px -30px ${V.shadow}`,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`${ASSET}/remedy-chai.webp`}
        alt=""
        width={92}
        height={92}
        className="km-wobble"
        style={{
          position: "absolute",
          right: 10,
          top: -40,
          width: 92,
          height: 92,
          objectFit: "contain",
        }}
      />
      <p
        style={{
          margin: 0,
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: ".2em",
          textTransform: "uppercase",
          color: V.a1,
        }}
      >
        Rx · take daily, forever
      </p>
      <ol
        style={{
          margin: "12px 0 0",
          padding: 0,
          listStyle: "none",
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        {remedies.map((r, i) => (
          <li
            key={i}
            style={{ display: "flex", gap: 12, alignItems: "flex-start" }}
          >
            <span
              style={{
                flexShrink: 0,
                width: 28,
                height: 28,
                borderRadius: 10,
                background: V.grad,
                color: "#fff",
                display: "grid",
                placeItems: "center",
                fontWeight: 800,
                fontSize: 13,
              }}
            >
              {i + 1}
            </span>
            <span
              style={{
                fontSize: 16,
                lineHeight: 1.45,
                fontWeight: 600,
                paddingTop: 3,
              }}
            >
              {r}
            </span>
          </li>
        ))}
      </ol>
      <p
        style={{
          margin: "16px 0 0",
          fontFamily: ITALIC,
          fontStyle: "italic",
          fontSize: 17,
          color: V.paperSoft,
        }}
      >
        — {astrologer}
      </p>
    </div>
  );
}

// ─── Intro ───────────────────────────────────────────────────────────────────

function Intro({
  data,
  a,
  b,
  onStart,
  reduceMotion,
}: {
  data: KundliMilanTemplateProps["data"];
  a: string;
  b: string;
  onStart: () => void;
  reduceMotion: boolean;
}) {
  const ring = "min(78vw, 360px)";
  return (
    <main
      className="km-wrap"
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        paddingTop: 96,
        paddingBottom: 48,
        textAlign: "center",
      }}
    >
      <span
        className={reduceMotion ? "" : "lv-pop"}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "6px 14px",
          borderRadius: 999,
          background: V.glass,
          border: `1px solid ${V.edge}`,
          fontSize: 13,
          fontWeight: 600,
          color: V.soft,
        }}
      >
        🔮 a totally scientific* kundli milan
      </span>
      <h1
        style={{
          margin: "16px 0 0",
          fontWeight: 800,
          fontSize: "clamp(40px, 11vw, 78px)",
          lineHeight: 0.95,
          letterSpacing: "-0.04em",
        }}
      >
        will the stars
        <br />
        <GradText>approve?</GradText>
      </h1>

      <div
        style={{
          position: "relative",
          marginTop: 30,
          width: ring,
          height: ring,
        }}
      >
        <div
          className={reduceMotion ? "" : "km-spin"}
          style={{ position: "absolute", inset: 0 }}
        >
          <ZodiacRing
            size="100%"
            stroke={V.a3}
            glyphSize="clamp(14px, 4vw, 20px)"
          />
        </div>
        <div
          style={{
            position: "absolute",
            inset: "18%",
            display: "grid",
            placeItems: "center",
          }}
        >
          <PhotoOrb
            photo={data.photos[0]}
            size={170}
            fallback={`${initials(a)[0]}♥${initials(b)[0]}`}
            className={reduceMotion ? "" : "km-glow"}
          />
        </div>
        {/* The two of them as planets in orbit. */}
        {[a, b].map((n, i) => (
          <span
            key={n + i}
            className="km-planet"
            style={
              {
                position: "absolute",
                left: "50%",
                top: "50%",
                marginLeft: -26,
                marginTop: -26,
                "--r": `calc(${ring} / 2 - 4px)`,
                animation: reduceMotion
                  ? "none"
                  : `km-orbit ${14 + i * 3}s linear ${i * -7}s infinite`,
                transform: reduceMotion
                  ? `translateX(calc((${ring} / 2 - 4px) * ${i ? 1 : -1}))`
                  : undefined,
              } as React.CSSProperties
            }
          >
            <span
              style={{
                display: "grid",
                placeItems: "center",
                width: 52,
                height: 52,
                borderRadius: "50%",
                background: i
                  ? "linear-gradient(135deg, var(--lv-a2), var(--lv-a3))"
                  : V.grad,
                color: "#fff",
                fontWeight: 800,
                fontSize: 15,
                boxShadow: "0 10px 24px -8px rgba(0,0,0,.8)",
              }}
            >
              {initials(n)}
            </span>
          </span>
        ))}
      </div>

      <div
        style={{
          marginTop: 26,
          display: "flex",
          flexWrap: "wrap",
          gap: 10,
          justifyContent: "center",
        }}
      >
        <NameChip
          name={data.groom.name}
          place={data.groom.pob}
          tint="var(--lv-a1)"
        />
        <span style={{ alignSelf: "center", fontSize: 22 }} aria-hidden>
          ✦
        </span>
        <NameChip
          name={data.bride.name}
          place={data.bride.pob}
          tint="var(--lv-a2)"
        />
      </div>

      <div style={{ marginTop: 26, width: "100%", maxWidth: 360 }}>
        <CandyButton onClick={onStart}>
          match our kundlis <span aria-hidden>🔮</span>
        </CandyButton>
      </div>
      <p style={{ margin: "12px 0 0", fontSize: 12, color: V.faint }}>
        *not scientific at all. extremely romantic though.
      </p>
    </main>
  );
}

function NameChip({
  name,
  place,
  tint,
}: {
  name: string;
  place: string;
  tint: string;
}) {
  return (
    <span
      style={{
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "flex-start",
        padding: "8px 16px",
        borderRadius: 18,
        background: V.glass,
        border: `1.5px solid ${tint}`,
        textAlign: "left",
      }}
    >
      <b style={{ fontSize: 16 }}>{name}</b>
      {place && <span style={{ fontSize: 12, color: V.soft }}>📍 {place}</span>}
    </span>
  );
}

// ─── Scanning ────────────────────────────────────────────────────────────────

function Scanning({
  data,
  a,
  b,
  lines,
  reduceMotion,
}: {
  data: KundliMilanTemplateProps["data"];
  a: string;
  b: string;
  lines: string[];
  reduceMotion: boolean;
}) {
  const [i, setI] = useState(0);
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const step = SCAN_MS / lines.length;
    const t = window.setInterval(
      () => setI((x) => Math.min(lines.length - 1, x + 1)),
      step,
    );
    const started = performance.now();
    let raf = 0;
    const tick = () => {
      const p = Math.min(
        100,
        Math.round(((performance.now() - started) / SCAN_MS) * 100),
      );
      setPct(p);
      if (p < 100) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      window.clearInterval(t);
      cancelAnimationFrame(raf);
    };
  }, [lines.length]);

  return (
    <main
      className="km-wrap"
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        paddingTop: 90,
        paddingBottom: 40,
        textAlign: "center",
      }}
      aria-live="polite"
    >
      <div
        style={{
          position: "relative",
          width: "min(70vw, 300px)",
          aspectRatio: "1 / 1",
        }}
      >
        <div
          className={reduceMotion ? "" : "km-spin-fast"}
          style={{ position: "absolute", inset: 0 }}
        >
          <ZodiacRing
            size="100%"
            stroke={V.a3}
            glyphSize="clamp(13px, 3.6vw, 18px)"
          />
        </div>
        <div
          style={{
            position: "absolute",
            inset: "20%",
            display: "grid",
            placeItems: "center",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`${ASSET}/computing.webp`}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
          />
        </div>
      </div>
      <Eyebrow style={{ marginTop: 24 }} color={V.a3}>
        consulting the cosmos · {a} × {b}
      </Eyebrow>
      <p
        key={i}
        className={reduceMotion ? "" : "lv-pop"}
        style={{
          margin: "12px 0 0",
          minHeight: 60,
          maxWidth: 420,
          fontSize: "clamp(20px, 5vw, 26px)",
          fontWeight: 800,
          letterSpacing: "-0.02em",
          lineHeight: 1.2,
        }}
      >
        {lines[i]}
      </p>
      <div
        style={{
          marginTop: 18,
          width: "min(80vw, 360px)",
          height: 12,
          borderRadius: 99,
          background: "color-mix(in srgb, var(--lv-ink) 12%, transparent)",
          overflow: "hidden",
        }}
      >
        <span
          style={{
            display: "block",
            height: "100%",
            width: `${pct}%`,
            borderRadius: 99,
            background: V.grad,
          }}
        />
      </div>
      <p
        style={{
          margin: "10px 0 0",
          fontWeight: 800,
          fontSize: 15,
          color: V.soft,
        }}
      >
        {pct}% ·{" "}
        {data.groom.pob && data.bride.pob
          ? `${data.groom.pob.split(",")[0]} ↔ ${data.bride.pob.split(",")[0]}`
          : "36 gunas"}
      </p>
    </main>
  );
}

// ─── Bits ────────────────────────────────────────────────────────────────────

function ScoreRing({
  total,
  reduceMotion,
}: {
  total: number;
  reduceMotion: boolean;
}) {
  const [shown, setShown] = useState(reduceMotion ? total : 0);
  useEffect(() => {
    if (reduceMotion) return;
    const started = performance.now();
    let raf = 0;
    const tick = () => {
      const p = Math.min(1, (performance.now() - started) / 1600);
      setShown(Math.round(total * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [total, reduceMotion]);
  const size = 260;
  const r = 110;
  const c = 2 * Math.PI * r;
  const frac = shown / 36;
  return (
    <div
      style={{
        position: "relative",
        width: `min(72vw, ${size}px)`,
        aspectRatio: "1 / 1",
      }}
    >
      <svg
        viewBox={`0 0 ${size} ${size}`}
        style={{ width: "100%", height: "100%", transform: "rotate(-90deg)" }}
        aria-hidden
      >
        <defs>
          <linearGradient id="km-score" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" style={{ stopColor: "var(--lv-a1)" }} />
            <stop offset="60%" style={{ stopColor: "var(--lv-a2)" }} />
            <stop offset="100%" style={{ stopColor: "var(--lv-a3)" }} />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          style={{
            stroke: "color-mix(in srgb, var(--lv-ink) 12%, transparent)",
          }}
          strokeWidth="18"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="url(#km-score)"
          strokeWidth="18"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - frac)}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "grid",
          placeItems: "center",
          textAlign: "center",
        }}
      >
        <div>
          <div
            role="status"
            aria-label={`${total} out of 36 gunas matched`}
            style={{
              fontWeight: 800,
              fontSize: "clamp(64px, 18vw, 92px)",
              lineHeight: 0.9,
              letterSpacing: "-0.05em",
            }}
          >
            {shown}
          </div>
          <div
            style={{
              fontWeight: 800,
              fontSize: 15,
              color: V.soft,
              letterSpacing: ".04em",
            }}
          >
            out of 36 gunas
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <span
      style={{
        display: "inline-flex",
        flexDirection: "column",
        padding: "8px 14px",
        borderRadius: 16,
        background: V.glass,
        border: `1px solid ${V.edge}`,
        textAlign: "left",
      }}
    >
      <span
        style={{
          fontSize: 10,
          fontWeight: 800,
          letterSpacing: ".18em",
          textTransform: "uppercase",
          color: V.faint,
        }}
      >
        {label}
      </span>
      <span style={{ fontSize: 15, fontWeight: 800 }}>{value}</span>
    </span>
  );
}

function issuedLabel(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || "");
  if (!m) return "today";
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `${Number(m[3])} ${months[Number(m[2]) - 1] ?? ""} ${m[1]}`;
}
