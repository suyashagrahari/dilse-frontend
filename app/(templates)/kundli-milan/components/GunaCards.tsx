"use client";

// ─── The eight gunas, decoded ────────────────────────────────────────────────
//
// Each real koota gets an honest-sounding English name for what a couple
// actually argues about, an emoji, both people's attribute, a score bar and
// the reading (the sender's own line, or the engine's).

import { GROTESK, ITALIC, MOON, MOON_FAINT, MOON_SOFT } from "../../date-invitation/components/dateTheme";
import { GOLD } from "./CosmicKit";
import type { KootaName, KootaResult } from "./types";

export const FUN_KOOTA: Record<KootaName, { title: string; emoji: string; about: string; tint: string }> = {
  varna: { title: "Vibe Check", emoji: "✨", about: "soul-level compatibility", tint: "#b59bff" },
  vashya: { title: "Remote Control Rights", emoji: "📺", about: "who's really in charge", tint: "#5cc8ff" },
  tara: { title: "Midnight Snack Health", emoji: "🍜", about: "health & wellbeing", tint: "#ffb03c" },
  yoni: { title: "Spirit Animal Match", emoji: "🦁", about: "your inner animals", tint: "#ff7a5c" },
  grahaMaitri: { title: "Brain Sync", emoji: "🧠", about: "mental wavelength", tint: "#d8ff5c" },
  gana: { title: "Tantrum Meter", emoji: "🌋", about: "temper forecast", tint: "#ff4f8b" },
  bhakoot: { title: "Family Drama Forecast", emoji: "👨‍👩‍👧", about: "the in-laws situation", tint: "#ffd27a" },
  nadi: { title: "Future Kids' Hair Quality", emoji: "👶", about: "genetic compatibility", tint: "#7cf5c8" },
};

const ANIMAL_EMOJI: Record<string, string> = {
  Horse: "🐴", Elephant: "🐘", Goat: "🐐", Serpent: "🐍", Dog: "🐶", Cat: "🐱", Rat: "🐭",
  Cow: "🐮", Buffalo: "🐃", Tiger: "🐯", Deer: "🦌", Monkey: "🐵", Mongoose: "🦦", Lion: "🦁",
};

const CSS = `
.km-gunas { display: grid; grid-template-columns: minmax(0, 1fr); gap: 14px; }
@media (min-width: 640px) { .km-gunas { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (min-width: 1024px) { .km-gunas { grid-template-columns: repeat(4, minmax(0, 1fr)); } }
`;

export default function GunaCards({
  kootas,
  aName,
  bName,
  reduceMotion,
}: {
  kootas: KootaResult[];
  aName: string;
  bName: string;
  reduceMotion: boolean;
}) {
  return (
    <div className="km-gunas">
      <style>{CSS}</style>
      {kootas.map((k, i) => {
        const fun = FUN_KOOTA[k.name];
        const pct = Math.round((k.obtained / k.max) * 100);
        const isYoni = k.name === "yoni";
        const attrA = isYoni ? `${ANIMAL_EMOJI[k.groomAttr] ?? "🐾"} ${k.groomAttr}` : k.groomAttr;
        const attrB = isYoni ? `${ANIMAL_EMOJI[k.brideAttr] ?? "🐾"} ${k.brideAttr}` : k.brideAttr;
        return (
          <article
            key={k.name}
            className={`km-card ${reduceMotion ? "" : "di-pop-in"}`}
            style={{
              animationDelay: `${i * 70}ms`,
              position: "relative",
              borderRadius: 24,
              padding: "18px 16px 16px",
              background: "rgba(255,255,255,.07)",
              border: "1px solid rgba(255,255,255,.14)",
              backdropFilter: "blur(14px)",
              WebkitBackdropFilter: "blur(14px)",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <span
              aria-hidden
              style={{ position: "absolute", right: -30, top: -30, width: 110, height: 110, borderRadius: "50%", background: fun.tint, opacity: 0.16, filter: "blur(10px)" }}
            />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
              <span style={{ fontSize: 30, lineHeight: 1 }} aria-hidden>
                {fun.emoji}
              </span>
              <span
                style={{
                  fontFamily: GROTESK,
                  fontWeight: 800,
                  fontSize: 15,
                  color: "#1a0d26",
                  background: fun.tint,
                  borderRadius: 999,
                  padding: "4px 10px",
                }}
              >
                {k.obtained}/{k.max}
              </span>
            </div>
            <h3 style={{ margin: "12px 0 0", fontFamily: GROTESK, fontWeight: 800, fontSize: 19, letterSpacing: "-0.02em", color: MOON, lineHeight: 1.15 }}>
              {fun.title}
            </h3>
            <p style={{ margin: "3px 0 0", fontFamily: GROTESK, fontSize: 11, fontWeight: 700, letterSpacing: ".16em", textTransform: "uppercase", color: MOON_FAINT }}>
              {k.labelEn} · {fun.about}
            </p>

            <div style={{ marginTop: 12, height: 8, borderRadius: 99, background: "rgba(255,255,255,.12)", overflow: "hidden" }}>
              <span
                style={{
                  display: "block",
                  height: "100%",
                  width: `${pct}%`,
                  borderRadius: 99,
                  background: `linear-gradient(90deg, ${fun.tint}, ${GOLD})`,
                  animation: reduceMotion ? "none" : `km-bar 1.1s cubic-bezier(.2,.9,.3,1) ${300 + i * 90}ms both`,
                }}
              />
            </div>

            <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 6 }}>
              <span style={chip}>
                <b style={{ color: MOON }}>{aName}:</b> {attrA}
              </span>
              <span style={chip}>
                <b style={{ color: MOON }}>{bName}:</b> {attrB}
              </span>
            </div>

            <p style={{ margin: "12px 0 0", fontFamily: ITALIC, fontStyle: "italic", fontSize: 18, lineHeight: 1.35, color: MOON, flex: 1 }}>
              &ldquo;{k.reading}&rdquo;
            </p>
          </article>
        );
      })}
    </div>
  );
}

const chip = {
  fontFamily: GROTESK,
  fontSize: 12,
  fontWeight: 600,
  color: MOON_SOFT,
  background: "rgba(255,255,255,.08)",
  border: "1px solid rgba(255,255,255,.12)",
  borderRadius: 999,
  padding: "4px 10px",
} as const;
