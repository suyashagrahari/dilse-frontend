"use client";

// ─── Court Marriage — the Registrar of Hearts ────────────────────────────────
//
// A deadpan-official, very romantic "court marriage", told as a little show:
//
//   intro     the token counter: "now serving" their certificate number, the
//             two parties and a portrait taped to the file.
//   ceremony  a live court log — ID check, objections read out and slapped
//             OVERRULED, witnesses' ink drawing in, the registrar's stamp.
//   result    the REGISTERED reveal, then ONE screen of tappable tiles —
//             photos (each with a little letter), the sealed letter, the GIFs,
//             the objections, the register and the official certificate PNG —
//             each opening in a sheet, so nothing is a long scroll away.
//
// Colours come from the chosen theme (./themes) as CSS variables.

import { useCallback, useEffect, useState } from "react";

import { DATE_FONT_VARS } from "../../date-invitation/components/fonts";
import { cropStyle, photoCrop } from "../../dedication/components/types";
import {
  BrandBadge,
  CandyButton,
  Eyebrow,
  GhostButton,
  GradText,
  GROTESK,
  HeartBurst,
  ITALIC,
  LOVE_CSS,
  LoveSky,
  LoveThemeContext,
  SectionHead,
  Sticker,
  Tape,
  ThemeDock,
} from "../../_love/LoveKit";
import MemoryHub, { type HubTile } from "../../_love/MemoryHub";
import { loveTiles } from "../../_love/Memories";
import { V, pickTheme, themeVars } from "../../_love/theme";
import type { LovePhoto } from "../../_love/types";
import { CASE_CSS, Ceremony, ObjectionsList, Register, Signature, Stamp, firstName, objectionsFor, registeredLabel } from "./CaseFile";
import CertificateSheet from "./CertificateSheet";
import { COURT_THEMES } from "./themes";
import { type CertificateData, padWitnesses, portraitOf } from "./types";

/** Honour the OS setting — every looping asset on this template is decorative. */
export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const on = () => setReduced(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return reduced;
}

type Stage = "intro" | "ceremony" | "result";

const LAYOUT_CSS = `
.cm-wrap { position: relative; z-index: 1; width: 100%; max-width: 1080px; margin: 0 auto; padding: 0 16px; }
.cm-hero { display: grid; grid-template-columns: minmax(0, 1fr); gap: 26px; align-items: center; }
.cm-parties { display: grid; grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr); gap: 10px; align-items: stretch; }
@media (min-width: 960px) { .cm-hero { grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr); gap: 48px; } }
`;

export default function CourtMarriageTemplate({
  data,
  mode = "preview",
  shareId,
  onThemeChange,
}: {
  data: CertificateData;
  mode?: "preview" | "live";
  shareId?: string;
  /** Preview only: the floating theme dock calls this. */
  onThemeChange?: (id: string) => void;
}) {
  void shareId;
  const reduceMotion = usePrefersReducedMotion();
  const theme = pickTheme(COURT_THEMES, data.theme);
  const [stage, setStage] = useState<Stage>("intro");

  const a = firstName(data.partyA.name);
  const b = firstName(data.partyB.name);
  const registered = data.certificateState === "registered";
  const witnesses = padWitnesses(data.witnesses);
  const signed = witnesses.filter((w) => w.name.trim() && w.signaturePath).length;
  const portrait: LovePhoto | null = data.photos[0] ?? (portraitOf(data) ? { url: portraitOf(data) as string } : null);

  const begin = () => {
    setStage("ceremony");
    window.scrollTo({ top: 0, behavior: "auto" });
  };
  const finish = useCallback(() => {
    setStage("result");
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);
  const replay = () => {
    setStage("intro");
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  };

  const tiles: HubTile[] = [
    ...loveTiles({
      photos: data.photos,
      gifs: data.gifs,
      letter: data.letter,
      from: a,
      to: b,
      reduceMotion,
      labels: {
        photos: "Exhibit A: us",
        photosSub: `${data.photos.length} photos · each with a little note`,
        letter: "Sealed letter",
        letterSub: `for ${b} · break the seal`,
        gifs: "Court footage",
        gifsSub: `${data.gifs.length} GIF${data.gifs.length === 1 ? "" : "s"} submitted as evidence`,
      },
    }),
    {
      id: "objections",
      emoji: "🙅",
      title: "Objections",
      sub: `${data.objectionCount} received · 0 upheld`,
      tone: "paper",
      art: <ObjectionArt count={data.objectionCount} />,
      sheetTitle: "Objections on record",
      content: () => <ObjectionsList count={data.objectionCount} reduceMotion={reduceMotion} />,
    },
    {
      id: "register",
      emoji: "✍️",
      title: "The register",
      sub: `${signed}/3 witnesses signed · ${data.fields.length} entries`,
      size: "wide",
      tone: "glass",
      art: <RegisterArt data={data} />,
      sheetTitle: "The register & witnesses",
      content: () => <Register data={data} reduceMotion={reduceMotion} />,
    },
    {
      id: "certificate",
      emoji: "📜",
      title: "Official certificate",
      sub: "stamped & sealed · save it as a picture",
      size: "wide",
      tone: "candy",
      art: <CertificateArt no={data.certificateNo} registered={registered} />,
      sheetTitle: "Your certificate",
      content: () => <CertificateSheet data={data} />,
    },
  ];

  return (
    <LoveThemeContext.Provider value={theme}>
      <div
        className={`${DATE_FONT_VARS} lv-root`}
        style={{ ...themeVars(theme), minHeight: "100dvh", position: "relative", isolation: "isolate", overflowX: "clip", color: V.ink, background: theme.colors.base, fontFamily: GROTESK }}
      >
        <style>{LOVE_CSS + CASE_CSS + LAYOUT_CSS}</style>
        <LoveSky theme={theme} reduceMotion={reduceMotion} />

        {mode === "live" && <BrandBadge />}
        {mode !== "live" && onThemeChange && <ThemeDock themes={COURT_THEMES} value={theme.id} onChange={onThemeChange} />}

        {stage === "intro" && (
          <main className="cm-wrap" style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", paddingTop: 92, paddingBottom: mode === "live" ? 48 : 110, textAlign: "center" }}>
            <span
              className={reduceMotion ? "" : "lv-pop"}
              style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 14px", borderRadius: 999, background: V.glass, border: `1px solid ${V.edge}`, fontSize: 13, fontWeight: 700, color: V.soft }}
            >
              🏛️ office of the registrar of hearts
            </span>

            {/* The token counter. */}
            <div style={{ marginTop: 18, display: "inline-flex", alignItems: "center", gap: 12, padding: "10px 16px", borderRadius: 18, background: "#0d0d12", color: "#ff5a3c", boxShadow: `0 16px 34px -18px ${V.shadow}`, border: "2px solid rgba(255,255,255,.08)" }}>
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: ".2em", color: "rgba(255,255,255,.55)", textTransform: "uppercase", lineHeight: 1.2, textAlign: "left" }}>
                now
                <br />
                serving
              </span>
              <span style={{ fontFamily: "var(--font-courier-prime), ui-monospace, monospace", fontWeight: 700, fontSize: "clamp(18px, 5vw, 24px)", letterSpacing: ".06em", textShadow: "0 0 12px rgba(255,90,60,.7)" }}>
                {data.certificateNo || "RH/0001"}
              </span>
              <span className="cm-blink" aria-hidden style={{ width: 9, height: 9, borderRadius: 99, background: "#ff5a3c", boxShadow: "0 0 10px #ff5a3c" }} />
            </div>

            <h1 style={{ margin: "18px 0 0", fontWeight: 800, fontSize: "clamp(38px, 10.5vw, 76px)", lineHeight: 0.95, letterSpacing: "-0.04em" }}>
              you two are
              <br />
              <GradText>getting married</GradText>
            </h1>
            <p style={{ margin: "10px 0 0", fontFamily: ITALIC, fontStyle: "italic", fontSize: 20, color: V.soft }}>(legally-ish. emotionally, extremely.)</p>

            {portrait && (
              <div className={reduceMotion ? "" : "lv-float"} style={{ position: "relative", marginTop: 22 }}>
                <Polaroid photo={portrait} width="min(46vw, 190px)" tilt={-4} />
                {data.gifs[0] && <GifSticker src={data.gifs[0]} style={{ right: -48, bottom: -14, width: 78 }} />}
              </div>
            )}

            <div className="cm-parties" style={{ marginTop: 22, width: "100%", maxWidth: 520 }}>
              <PartyCard label="party A" name={data.partyA.name} age={data.partyA.age} city={data.partyA.city} tint={V.a1} />
              <span style={{ alignSelf: "center", fontSize: 26 }} aria-hidden>
                💍
              </span>
              <PartyCard label="party B" name={data.partyB.name} age={data.partyB.age} city={data.partyB.city} tint={V.a2} />
            </div>

            <div style={{ marginTop: 24, width: "100%", maxWidth: 360 }}>
              <CandyButton onClick={begin}>
                approach the registrar <span aria-hidden>🖋️</span>
              </CandyButton>
            </div>
            <p style={{ margin: "12px 0 0", fontSize: 12, color: V.faint }}>*not valid for legal, tax or visa purposes. valid for everything that matters.</p>
          </main>
        )}

        {stage === "ceremony" && (
          <main className="cm-wrap" style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", justifyContent: "center", paddingTop: 88, paddingBottom: mode === "live" ? 40 : 110 }}>
            <Ceremony data={data} reduceMotion={reduceMotion} onDone={finish} />
            <div style={{ marginTop: 16, textAlign: "center" }}>
              <button type="button" onClick={finish} className="lv-focus" style={{ background: "none", border: "none", color: V.soft, fontFamily: GROTESK, fontWeight: 700, fontSize: 13, cursor: "pointer", padding: 10, textDecoration: "underline", textUnderlineOffset: 3 }}>
                skip to the stamp ▸
              </button>
            </div>
          </main>
        )}

        {stage === "result" && (
          <main className="cm-wrap" style={{ paddingTop: 84, paddingBottom: mode === "live" ? 56 : 110 }}>
            <section className="cm-hero">
              {/* The portrait with the stamp slammed across its corner. */}
              <div style={{ position: "relative", display: "grid", placeItems: "center", paddingTop: 8 }}>
                {!reduceMotion && <HeartBurst glyphs={["💍", "✨", "💖", "📜", "🕊️"]} />}
                <div style={{ position: "relative" }}>
                  {portrait ? (
                    <Polaroid photo={portrait} width="min(62vw, 270px)" tilt={-3} caption={`${a} & ${b}`} />
                  ) : (
                    <div style={{ width: "min(62vw, 270px)", aspectRatio: "4 / 5", borderRadius: 16, background: V.grad, display: "grid", placeItems: "center", fontSize: 72, transform: "rotate(-3deg)", boxShadow: `0 26px 50px -24px ${V.shadow}` }}>💍</div>
                  )}
                  <span style={{ position: "absolute", left: -18, bottom: 34, zIndex: 2 }}>
                    <Stamp label={registered ? "registered" : "pending"} sub={registered ? "registrar of hearts ✓" : "awaiting witnesses"} slap={!reduceMotion} tone={registered ? "a1" : "a3"} size={1.05} tilt={-14} />
                  </span>
                  {data.gifs[0] && <GifSticker src={data.gifs[0]} style={{ right: -34, top: -26, width: 96 }} />}
                </div>
              </div>

              <div className={reduceMotion ? "" : "lv-pop"} style={{ textAlign: "center" }}>
                <Sticker>{registered ? "✓ duly registered" : "⏳ awaiting witnesses"}</Sticker>
                <h1 style={{ margin: "14px 0 0", fontWeight: 800, fontSize: "clamp(36px, 9vw, 64px)", lineHeight: 0.98, letterSpacing: "-0.04em", overflowWrap: "anywhere" }}>
                  {a} <GradText>&amp;</GradText> {b}
                </h1>
                <p style={{ margin: "10px auto 0", maxWidth: 520, fontFamily: ITALIC, fontStyle: "italic", fontSize: "clamp(19px, 4.6vw, 23px)", lineHeight: 1.3, color: V.soft }}>
                  {registered
                    ? "are hereby declared officially, legally-ish, un-returnably married. No refunds. No exchanges."
                    : "are this close to official — the register is open, one more witness and it's done."}
                </p>
                <div style={{ marginTop: 16, display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
                  <Stat label="certificate" value={data.certificateNo || "—"} />
                  <Stat label="registered" value={registeredLabel(data.registeredOn)} />
                  <Stat label="known for" value={`${data.knownSinceDays} days`} />
                  <Stat label="objections" value={`${data.objectionCount} → 0 upheld`} />
                  <Stat label="witnesses" value={`${signed}/3 signed`} />
                </div>
              </div>
            </section>

            <div style={{ margin: "40px 0 0" }}>
              <Tape
                words={["duly registered", `${objectionsFor(data.objectionCount).length ? "objections overruled" : "zero objections"}`, "witnessed & sealed", "no refunds", "valid for everything that matters"]}
                reduceMotion={reduceMotion}
              />
            </div>

            <section style={{ marginTop: 44 }}>
              <SectionHead eyebrow="the case file" title="Tap anything to open it" emoji="👇" />
              <MemoryHub tiles={tiles} reduceMotion={reduceMotion} />
            </section>

            <div style={{ marginTop: 40, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
              <GhostButton onClick={replay} style={{ width: "auto", minWidth: 220 }}>
                ↺ replay the ceremony
              </GhostButton>
              <p style={{ margin: 0, fontSize: 12, color: V.faint, textAlign: "center" }}>Office of the Registrar of Hearts · by the power vested in absolutely nobody ✨</p>
            </div>
          </main>
        )}
      </div>
    </LoveThemeContext.Provider>
  );
}

// ─── Bits ────────────────────────────────────────────────────────────────────

function Polaroid({ photo, width, tilt = 0, caption }: { photo: LovePhoto; width: string; tilt?: number; caption?: string }) {
  return (
    <div style={{ position: "relative", width, background: "#fffdf7", padding: "10px 10px 12px", borderRadius: 6, transform: `rotate(${tilt}deg)`, boxShadow: `0 26px 50px -24px ${V.shadow}` }}>
      <span aria-hidden style={{ position: "absolute", top: -10, left: "50%", width: 70, height: 22, marginLeft: -35, background: "#ffd27a", opacity: 0.9, transform: "rotate(-4deg)", borderRadius: 2, zIndex: 1 }} />
      <div style={{ position: "relative", aspectRatio: "4 / 5", overflow: "hidden", borderRadius: 3, background: "#eee6dc" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photo.url} alt="" draggable={false} style={cropStyle(photoCrop(photo))} />
      </div>
      {caption && <p style={{ margin: "8px 2px 0", fontFamily: ITALIC, fontStyle: "italic", fontSize: 19, lineHeight: 1.1, color: "#241f1b", textAlign: "center", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{caption}</p>}
    </div>
  );
}

function GifSticker({ src, style }: { src: string; style: React.CSSProperties }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      className="lv-wiggle"
      style={{ position: "absolute", zIndex: 3, aspectRatio: "1 / 1", objectFit: "contain", borderRadius: 18, background: "#fff", border: "4px solid #fff", boxShadow: `0 16px 30px -14px ${V.shadow}`, ...style }}
    />
  );
}

function PartyCard({ label, name, age, city, tint }: { label: string; name: string; age: number; city: string; tint: string }) {
  return (
    <div style={{ minWidth: 0, padding: "10px 12px", borderRadius: 18, background: V.glass, border: `1.5px solid ${tint}`, textAlign: "left", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}>
      <Eyebrow style={{ fontSize: 9.5 }}>{label}</Eyebrow>
      <p style={{ margin: "3px 0 0", fontWeight: 800, fontSize: 16, lineHeight: 1.15, overflowWrap: "anywhere" }}>{name || "—"}</p>
      <p style={{ margin: "2px 0 0", fontSize: 12, color: V.soft, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
        {age ? `${age} yrs` : ""}
        {age && city ? " · " : ""}
        {city ? `📍 ${city}` : ""}
      </p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <span style={{ display: "inline-flex", flexDirection: "column", padding: "8px 14px", borderRadius: 16, background: V.glass, border: `1px solid ${V.edge}`, textAlign: "left", maxWidth: "100%" }}>
      <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: ".18em", textTransform: "uppercase", color: V.faint }}>{label}</span>
      <span style={{ fontSize: 15, fontWeight: 800, overflowWrap: "anywhere" }}>{value}</span>
    </span>
  );
}

// ─── Tile arts ───────────────────────────────────────────────────────────────

function ObjectionArt({ count }: { count: number }) {
  return (
    <span aria-hidden style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", paddingBottom: 48 }}>
      <span style={{ position: "relative", display: "grid", placeItems: "center" }}>
        <span style={{ fontSize: 44, lineHeight: 1 }}>🙅</span>
        <span style={{ position: "absolute", top: 34 }}>
          <Stamp label="overruled" size={0.62} tilt={-12} />
        </span>
        <span style={{ position: "absolute", top: -12, right: -34, minWidth: 30, height: 30, padding: "0 8px", borderRadius: 99, background: V.grad, color: "#fff", fontWeight: 800, fontSize: 14, display: "grid", placeItems: "center" }}>{count}</span>
      </span>
    </span>
  );
}

function RegisterArt({ data }: { data: CertificateData }) {
  const w = padWitnesses(data.witnesses);
  return (
    <span aria-hidden style={{ position: "absolute", inset: "18px 18px 62px", display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 14, alignItems: "end", color: V.ink }}>
      {w.map((x, i) => (
        <span key={i} style={{ borderBottom: `1.5px solid ${V.edge}` }}>
          <Signature d={x.name.trim() ? x.signaturePath : ""} draw={false} height={34} />
        </span>
      ))}
    </span>
  );
}

function CertificateArt({ no, registered }: { no: string; registered: boolean }) {
  return (
    <span aria-hidden style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", paddingBottom: 48 }}>
      <span style={{ position: "relative", width: "min(46%, 150px)", aspectRatio: "3 / 4", background: "#faf6ed", borderRadius: 6, transform: "rotate(-5deg)", boxShadow: "0 16px 30px -14px rgba(0,0,0,.5)", padding: 10, display: "flex", flexDirection: "column", gap: 5 }}>
        <span style={{ height: 6, width: "70%", borderRadius: 3, background: "#2f2c24", opacity: 0.8, alignSelf: "center" }} />
        <span style={{ height: 4, width: "50%", borderRadius: 2, background: "#6d6858", opacity: 0.6, alignSelf: "center" }} />
        {[0, 1, 2, 3].map((i) => (
          <span key={i} style={{ height: 3, width: `${88 - i * 9}%`, borderRadius: 2, background: "#6d6858", opacity: 0.35 }} />
        ))}
        <span style={{ marginTop: "auto", fontFamily: "var(--font-courier-prime), monospace", fontSize: 8, color: "#2f2c24" }}>{no}</span>
        <span style={{ position: "absolute", right: -14, bottom: 8, width: 44, height: 44, borderRadius: "50%", border: "2.5px double #b3263a", color: "#b3263a", display: "grid", placeItems: "center", fontSize: 8, fontWeight: 800, transform: "rotate(-16deg)", background: "rgba(250,246,237,.6)" }}>
          {registered ? "OK ✓" : "…"}
        </span>
      </span>
    </span>
  );
}
