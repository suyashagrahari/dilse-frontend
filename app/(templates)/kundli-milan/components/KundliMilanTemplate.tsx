"use client";

// ─── Kundli Milan — the cosmic love match ────────────────────────────────────
//
// A totally unscientific, very romantic horoscope match, told as a little show:
//
//   intro     two names on a spinning zodiac wheel, "will the stars approve?"
//   scanning  five seconds of silly cosmic computation
//   result    the score reveal, the eight gunas as funny cards, their photos
//             (each with a little letter), their GIFs, the remedies, the love
//             letter and a certificate they can save.
//
// The numbers come from `computeKundliReport()` — deterministic from the two
// birth dates, always warm (28–36/36), never a real reading.

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

import { templateMediaBase } from "@/lib/templateMedia";
import { DATE_FONT_VARS } from "../../date-invitation/components/fonts";
import { GRAD, GROTESK, INK, ITALIC, LIME, MOON, MOON_FAINT, MOON_SOFT, PAPER } from "../../date-invitation/components/dateTheme";
import { CandyButton, Eyebrow, GhostButton, Glass, GradText, HeartBurst, NIGHT_CSS, Tape } from "../../date-invitation/components/NightKit";
import useReducedMotion from "../../date-invitation/components/useReducedMotion";
import { COSMIC_CSS, CosmicSky, GOLD, PhotoOrb, ZodiacRing, firstName, initials } from "./CosmicKit";
import GunaCards from "./GunaCards";
import PhotoWall from "./PhotoWall";
import { Certificate, LoveLetter } from "./Finale";
import { computeKundliReport, type KundliMilanTemplateProps } from "./types";

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
.km-section { margin-top: 64px; }
.km-hero-grid { display: grid; grid-template-columns: minmax(0, 1fr); gap: 20px; align-items: center; }
.km-duo { display: grid; grid-template-columns: minmax(0, 1fr); gap: 16px; }
@media (min-width: 640px) { .km-section { margin-top: 84px; } }
@media (min-width: 960px) {
  .km-hero-grid { grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr); gap: 40px; }
  .km-duo { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 28px; align-items: start; }
}
`;

export default function KundliMilanTemplate({ data, mode }: KundliMilanTemplateProps) {
  const reduceMotion = useReducedMotion();
  const report = useMemo(() => computeKundliReport(data), [data]);
  const [stage, setStage] = useState<Stage>("intro");
  const topRef = useRef<HTMLDivElement>(null);

  const a = firstName(data.groom.name);
  const b = firstName(data.bride.name);
  const grade = funGrade(report.total);
  const hero = data.photos[0];

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
    const id = window.setTimeout(() => setStage("result"), reduceMotion ? 600 : SCAN_MS);
    return () => window.clearTimeout(id);
  }, [stage, reduceMotion]);

  return (
    <div
      ref={topRef}
      className={DATE_FONT_VARS}
      style={{ minHeight: "100dvh", position: "relative", isolation: "isolate", overflowX: "clip", color: MOON, background: "#140a2e", fontFamily: GROTESK }}
    >
      <style>{NIGHT_CSS + COSMIC_CSS + LAYOUT_CSS}</style>
      <CosmicSky reduceMotion={reduceMotion} />

      {mode === "live" && (
        <Link
          href="/templates"
          aria-label="SubhSandesh — make your own"
          className="fixed right-3 top-3 z-[95] inline-flex items-center gap-1.5 rounded-full px-3 py-1.5"
          style={{ background: "rgba(20,10,46,.6)", border: "1px solid rgba(255,255,255,.16)", backdropFilter: "blur(10px)", textDecoration: "none" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.webp" alt="" width={18} height={18} style={{ width: 18, height: 18 }} />
          <span className="text-[11px] font-semibold" style={{ color: MOON }}>
            SubhSandesh
          </span>
        </Link>
      )}

      {stage === "intro" && <Intro data={data} a={a} b={b} onStart={start} reduceMotion={reduceMotion} />}
      {stage === "scanning" && <Scanning data={data} a={a} b={b} lines={scanLines} reduceMotion={reduceMotion} />}

      {stage === "result" && (
        <main className="km-wrap" style={{ paddingTop: 92, paddingBottom: 80 }}>
          {/* ── The reveal ─────────────────────────────────────────────── */}
          <section className="km-hero-grid">
            <div style={{ position: "relative", display: "grid", placeItems: "center" }}>
              {!reduceMotion && <HeartBurst />}
              <ScoreRing total={report.total} reduceMotion={reduceMotion} />
            </div>
            <div className={reduceMotion ? "" : "di-pop-in"} style={{ textAlign: "center" }}>
              <span
                style={{
                  display: "inline-block",
                  padding: "7px 16px",
                  borderRadius: 999,
                  background: LIME,
                  color: "#1a0d26",
                  fontWeight: 800,
                  fontSize: 13,
                  letterSpacing: ".12em",
                  textTransform: "uppercase",
                  transform: "rotate(-2deg)",
                }}
              >
                ✓ the stars have spoken
              </span>
              <h1 style={{ margin: "16px 0 0", fontWeight: 800, fontSize: "clamp(38px, 9vw, 68px)", lineHeight: 0.98, letterSpacing: "-0.04em" }}>
                {a} <GradText>&amp;</GradText> {b}
              </h1>
              <p style={{ margin: "12px 0 0", fontSize: "clamp(22px, 5vw, 30px)", fontWeight: 800, letterSpacing: "-0.02em" }}>
                {grade.label} <span aria-hidden>{grade.emoji}</span>
              </p>
              <p style={{ margin: "12px auto 0", maxWidth: 520, fontFamily: ITALIC, fontStyle: "italic", fontSize: 21, lineHeight: 1.35, color: MOON_SOFT }}>
                {funVerdict(report.total, a, b)}
              </p>
              <div style={{ marginTop: 18, display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
                <Stat label="match" value={`${Math.round((report.total / 36) * 100)}%`} />
                <Stat label="mangal dosha" value="cancelled ✓" />
                <Stat label="pandit ji" value="approved 🙏" />
              </div>
            </div>
          </section>

          <div style={{ margin: "44px 0 0" }}>
            <Tape words={["36 gunas checked", "no refunds", "the universe said yes", "zero red flags (mostly)"]} reduceMotion={reduceMotion} />
          </div>

          {/* ── The eight gunas ────────────────────────────────────────── */}
          <section className="km-section">
            <SectionHead eyebrow="the 8 gunas, decoded" title="How the stars scored you" emoji="🔮" />
            <GunaCards kootas={report.kootas} aName={a} bName={b} reduceMotion={reduceMotion} />
            <Glass style={{ marginTop: 16, padding: "16px 18px", display: "flex", alignItems: "center", gap: 14 }}>
              <span style={{ fontSize: 32 }} aria-hidden>
                🪐
              </span>
              <p style={{ margin: 0, fontSize: 15, lineHeight: 1.5, color: MOON }}>
                <b>Mangal Dosha report:</b> <span style={{ color: MOON_SOFT }}>{report.mangalDosha}</span>
              </p>
            </Glass>
          </section>

          {/* ── Photos, each with a little letter ──────────────────────── */}
          {data.photos.length > 0 && (
            <section className="km-section">
              <SectionHead eyebrow="evidence submitted to the universe" title="Proof you two are cute" emoji="📸" note="tap a photo to read its little letter" />
              <PhotoWall photos={data.photos} reduceMotion={reduceMotion} />
            </section>
          )}

          {/* ── GIF mood board ─────────────────────────────────────────── */}
          {data.gifs.length > 0 && (
            <section className="km-section">
              <SectionHead eyebrow="official mood board" title="This relationship, in GIFs" emoji="🎞️" />
              <div style={{ display: "flex", flexWrap: "wrap", gap: 18, justifyContent: "center" }}>
                {data.gifs.map((g, i) => (
                  <span
                    key={g}
                    className={reduceMotion ? "" : "km-drift"}
                    style={{
                      animationDelay: `${i * 0.8}s`,
                      display: "inline-block",
                      width: "min(220px, 40vw)",
                      aspectRatio: "1 / 1",
                      borderRadius: 26,
                      overflow: "hidden",
                      background: "#fff",
                      border: "5px solid #fff",
                      boxShadow: "0 24px 44px -20px rgba(0,0,0,.85)",
                      transform: `rotate(${[-4, 3, -2][i % 3]}deg)`,
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={g} alt="" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* ── Remedies + letter ──────────────────────────────────────── */}
          <section className="km-section km-duo">
            <div>
              <SectionHead eyebrow="pandit ji prescribes" title="Your cosmic remedies" emoji="💊" align="left" />
              <div style={{ position: "relative", background: PAPER, color: INK, borderRadius: 24, padding: "22px 20px 20px", boxShadow: "0 30px 60px -30px rgba(0,0,0,.8)" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`${ASSET}/remedy-chai.webp`}
                  alt=""
                  width={92}
                  height={92}
                  className={reduceMotion ? "" : "km-wobble"}
                  style={{ position: "absolute", right: 10, top: -38, width: 92, height: 92, objectFit: "contain" }}
                />
                <p style={{ margin: 0, fontSize: 11, fontWeight: 800, letterSpacing: ".2em", textTransform: "uppercase", color: "#d0245f" }}>Rx · take daily, forever</p>
                <ol style={{ margin: "12px 0 0", padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
                  {data.remedies.map((r, i) => (
                    <li key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                      <span style={{ flexShrink: 0, width: 28, height: 28, borderRadius: 10, background: GRAD, color: "#fff", display: "grid", placeItems: "center", fontWeight: 800, fontSize: 13 }}>
                        {i + 1}
                      </span>
                      <span style={{ fontSize: 16, lineHeight: 1.45, fontWeight: 600, paddingTop: 3 }}>{r}</span>
                    </li>
                  ))}
                </ol>
                <p style={{ margin: "16px 0 0", fontFamily: ITALIC, fontStyle: "italic", fontSize: 17, color: "#675f52" }}>— {data.astrologerName}</p>
              </div>
            </div>
            {data.letter.trim() && (
              <div>
                <SectionHead eyebrow="one more thing" title={`A letter for ${b}`} emoji="💌" align="left" />
                <div style={{ paddingTop: 8 }}>
                  <LoveLetter letter={data.letter} from={a} to={b} reduceMotion={reduceMotion} />
                </div>
              </div>
            )}
          </section>

          {/* ── Certificate ────────────────────────────────────────────── */}
          <section className="km-section">
            <SectionHead eyebrow="make it official" title="Your certificate" emoji="📜" />
            <Certificate
              aName={a}
              bName={b}
              total={report.total}
              grade={`${grade.label} ${grade.emoji}`}
              issuedLabel={issuedLabel(data.issuedOn)}
              astrologer={data.astrologerName}
              photo={hero}
            />
          </section>

          <div style={{ marginTop: 56, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
            <GhostButton onClick={replay} style={{ width: "auto", minWidth: 220 }}>
              ↺ consult the stars again
            </GhostButton>
            <p style={{ margin: 0, fontSize: 12, color: MOON_FAINT }}>For fun and love only. No astrologers were harmed. ✨</p>
          </div>
        </main>
      )}
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
    <main className="km-wrap" style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", paddingTop: 96, paddingBottom: 48, textAlign: "center" }}>
      <span
        className={reduceMotion ? "" : "di-pop-in"}
        style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 14px", borderRadius: 999, background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.16)", fontSize: 13, fontWeight: 600, color: MOON_SOFT }}
      >
        🔮 a totally scientific* kundli milan
      </span>
      <h1 style={{ margin: "16px 0 0", fontWeight: 800, fontSize: "clamp(40px, 11vw, 78px)", lineHeight: 0.95, letterSpacing: "-0.04em" }}>
        will the stars
        <br />
        <GradText>approve?</GradText>
      </h1>

      <div style={{ position: "relative", marginTop: 30, width: ring, height: ring }}>
        <div className={reduceMotion ? "" : "km-spin"} style={{ position: "absolute", inset: 0 }}>
          <ZodiacRing size="100%" stroke={GOLD} glyphSize="clamp(14px, 4vw, 20px)" />
        </div>
        <div style={{ position: "absolute", inset: "18%", display: "grid", placeItems: "center" }}>
          <PhotoOrb photo={data.photos[0]} size={170} fallback={`${initials(a)[0]}♥${initials(b)[0]}`} className={reduceMotion ? "" : "km-glow"} />
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
                animation: reduceMotion ? "none" : `km-orbit ${14 + i * 3}s linear ${i * -7}s infinite`,
                transform: reduceMotion ? `translateX(calc((${ring} / 2 - 4px) * ${i ? 1 : -1}))` : undefined,
              } as React.CSSProperties
            }
          >
            <span style={{ display: "grid", placeItems: "center", width: 52, height: 52, borderRadius: "50%", background: i ? "linear-gradient(135deg,#7c5cff,#b59bff)" : GRAD, fontWeight: 800, fontSize: 15, boxShadow: "0 10px 24px -8px rgba(0,0,0,.8)" }}>
              {initials(n)}
            </span>
          </span>
        ))}
      </div>

      <div style={{ marginTop: 26, display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
        <NameChip name={data.groom.name} place={data.groom.pob} tint="#ff4f8b" />
        <span style={{ alignSelf: "center", fontSize: 22 }} aria-hidden>
          ✦
        </span>
        <NameChip name={data.bride.name} place={data.bride.pob} tint="#7c5cff" />
      </div>

      <div style={{ marginTop: 26, width: "100%", maxWidth: 360 }}>
        <CandyButton onClick={onStart}>
          match our kundlis <span aria-hidden>🔮</span>
        </CandyButton>
      </div>
      <p style={{ margin: "12px 0 0", fontSize: 12, color: MOON_FAINT }}>*not scientific at all. extremely romantic though.</p>
    </main>
  );
}

function NameChip({ name, place, tint }: { name: string; place: string; tint: string }) {
  return (
    <span style={{ display: "inline-flex", flexDirection: "column", alignItems: "flex-start", padding: "8px 16px", borderRadius: 18, background: "rgba(255,255,255,.07)", border: `1px solid ${tint}66`, textAlign: "left" }}>
      <b style={{ fontSize: 16 }}>{name}</b>
      {place && <span style={{ fontSize: 12, color: MOON_SOFT }}>📍 {place}</span>}
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
    const t = window.setInterval(() => setI((x) => Math.min(lines.length - 1, x + 1)), step);
    const started = performance.now();
    let raf = 0;
    const tick = () => {
      const p = Math.min(100, Math.round(((performance.now() - started) / SCAN_MS) * 100));
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
    <main className="km-wrap" style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", paddingTop: 90, paddingBottom: 40, textAlign: "center" }} aria-live="polite">
      <div style={{ position: "relative", width: "min(70vw, 300px)", aspectRatio: "1 / 1" }}>
        <div className={reduceMotion ? "" : "km-spin-fast"} style={{ position: "absolute", inset: 0 }}>
          <ZodiacRing size="100%" stroke={GOLD} glyphSize="clamp(13px, 3.6vw, 18px)" />
        </div>
        <div style={{ position: "absolute", inset: "20%", display: "grid", placeItems: "center" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`${ASSET}/computing.webp`} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
        </div>
      </div>
      <Eyebrow style={{ marginTop: 24 }} color={GOLD}>
        consulting the cosmos · {a} × {b}
      </Eyebrow>
      <p key={i} className={reduceMotion ? "" : "di-pop-in"} style={{ margin: "12px 0 0", minHeight: 60, maxWidth: 420, fontSize: "clamp(20px, 5vw, 26px)", fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.2 }}>
        {lines[i]}
      </p>
      <div style={{ marginTop: 18, width: "min(80vw, 360px)", height: 12, borderRadius: 99, background: "rgba(255,255,255,.12)", overflow: "hidden" }}>
        <span style={{ display: "block", height: "100%", width: `${pct}%`, borderRadius: 99, background: `linear-gradient(90deg, #ff4f8b, ${GOLD})` }} />
      </div>
      <p style={{ margin: "10px 0 0", fontWeight: 800, fontSize: 15, color: MOON_SOFT }}>{pct}% · {data.groom.pob && data.bride.pob ? `${data.groom.pob.split(",")[0]} ↔ ${data.bride.pob.split(",")[0]}` : "36 gunas"}</p>
    </main>
  );
}

// ─── Bits ────────────────────────────────────────────────────────────────────

function ScoreRing({ total, reduceMotion }: { total: number; reduceMotion: boolean }) {
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
    <div style={{ position: "relative", width: `min(72vw, ${size}px)`, aspectRatio: "1 / 1" }}>
      <svg viewBox={`0 0 ${size} ${size}`} style={{ width: "100%", height: "100%", transform: "rotate(-90deg)" }} aria-hidden>
        <defs>
          <linearGradient id="km-score" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ff4f8b" />
            <stop offset="60%" stopColor="#ffb03c" />
            <stop offset="100%" stopColor={GOLD} />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,.1)" strokeWidth="18" />
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
      <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", textAlign: "center" }}>
        <div>
          <div role="status" aria-label={`${total} out of 36 gunas matched`} style={{ fontWeight: 800, fontSize: "clamp(64px, 18vw, 92px)", lineHeight: 0.9, letterSpacing: "-0.05em" }}>
            {shown}
          </div>
          <div style={{ fontWeight: 800, fontSize: 15, color: MOON_SOFT, letterSpacing: ".04em" }}>out of 36 gunas</div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <span style={{ display: "inline-flex", flexDirection: "column", padding: "8px 14px", borderRadius: 16, background: "rgba(255,255,255,.07)", border: "1px solid rgba(255,255,255,.14)", textAlign: "left" }}>
      <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: ".18em", textTransform: "uppercase", color: MOON_FAINT }}>{label}</span>
      <span style={{ fontSize: 15, fontWeight: 800 }}>{value}</span>
    </span>
  );
}

function SectionHead({ eyebrow, title, emoji, note, align = "center" }: { eyebrow: string; title: string; emoji: string; note?: string; align?: "center" | "left" }) {
  return (
    <header style={{ textAlign: align, marginBottom: 22 }}>
      <Eyebrow color={GOLD}>{eyebrow}</Eyebrow>
      <h2 style={{ margin: "8px 0 0", fontWeight: 800, fontSize: "clamp(28px, 7vw, 44px)", lineHeight: 1.02, letterSpacing: "-0.035em" }}>
        {title} <span aria-hidden>{emoji}</span>
      </h2>
      {note && <p style={{ margin: "8px 0 0", fontSize: 14, color: MOON_SOFT }}>{note}</p>}
    </header>
  );
}

function issuedLabel(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || "");
  if (!m) return "today";
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${Number(m[3])} ${months[Number(m[2]) - 1] ?? ""} ${m[1]}`;
}
