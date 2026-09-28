"use client";

// ─── Front of pack ───────────────────────────────────────────────────────────
//
// Before anyone reads a label they see the box. So the page opens on the FRONT
// of the carton: a flavour ribbon, a die-cut window showing the product (their
// first photo), the product name set big and heavy like a snack brand, and the
// claim badges every packet shouts ("no added drama*"). The back of the pack —
// the regulatory panel — is one scroll below.

import type { CSSProperties } from "react";

import { cropStyle, photoCrop } from "../../dedication/components/types";
import { GROTESK, ITALIC } from "../../_love/LoveKit";
import { V } from "../../_love/theme";
import type { LovePhoto } from "../../_love/types";
import { P } from "./themes";

const CLAIMS = ["no added drama*", "100% real", "∞ cal", "gluten-free hugs"];

export default function FrontOfPack({
  productName,
  photo,
  legacyPhotoUrl,
  calories,
  servings,
  onFlip,
}: {
  productName: string;
  photo?: LovePhoto;
  legacyPhotoUrl?: string;
  calories: string;
  servings: number;
  onFlip: () => void;
}) {
  const name = productName.trim() || "Your Person";
  const [first, ...rest] = name.split(/\s+/);
  const surname = rest.join(" ");
  const shot = photo ?? (legacyPhotoUrl ? { url: legacyPhotoUrl } : undefined);
  const claims = CLAIMS.map((c) => (c === "∞ cal" ? `${calories || "∞"} cal` : c));
  // A long first name has to fit a 320px carton without wrapping mid-word.
  const nameSize = first.length > 9 ? "clamp(40px, 13vw, 68px)" : "clamp(54px, 17vw, 92px)";

  return (
    <section aria-label={`${name}, front of pack`} className="nf-hero">
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
      <div className="nf-rise" style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 8, marginBottom: 16 }}>
        <Burst>NEW!</Burst>
        <Pill>limited edition · 1 of 1</Pill>
      </div>

      <div className="nf-carton nf-rise" style={{ animationDelay: "80ms" }}>
        {/* Carton flaps — the two folds at the top of a cereal box. */}
        <span aria-hidden className="nf-flap" style={{ left: 0, transform: "skewX(-18deg)", transformOrigin: "bottom left" }} />
        <span aria-hidden className="nf-flap" style={{ right: 0, transform: "skewX(18deg)", transformOrigin: "bottom right" }} />

        <div style={{ position: "relative", background: P.board, borderRadius: 26, padding: "18px 18px 20px", border: `2px solid ${V.paperInk}`, overflow: "hidden", boxShadow: `0 40px 70px -36px ${V.shadow}, inset 0 0 0 6px color-mix(in srgb, ${P.board} 70%, #fff)` }}>
          {/* Printed dot-screen, the halftone every carton has. */}
          <span aria-hidden style={{ position: "absolute", inset: 0, opacity: 0.16, backgroundImage: `radial-gradient(${P.boardInk} 0.8px, transparent 1.2px)`, backgroundSize: "9px 9px", pointerEvents: "none" }} />

          <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
            <span style={{ fontFamily: GROTESK, fontSize: 10.5, fontWeight: 800, letterSpacing: ".2em", textTransform: "uppercase", color: P.boardInk, opacity: 0.8 }}>
              made with love
            </span>
            <span style={{ fontFamily: GROTESK, fontSize: 10.5, fontWeight: 800, letterSpacing: ".12em", color: P.boardInk, opacity: 0.8 }}>NET WT. 1 PERSON</span>
          </div>

          {/* Die-cut window with the product inside. */}
          <div style={{ position: "relative", marginTop: 12, borderRadius: 22, overflow: "hidden", aspectRatio: "4 / 4.3", background: `linear-gradient(145deg, ${P.foil1}, ${P.foil2})`, border: `2px solid ${V.paperInk}`, boxShadow: "inset 0 10px 24px rgba(0,0,0,.28)" }}>
            {shot ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={shot.url} alt={`${name}`} draggable={false} style={cropStyle(photoCrop(shot))} />
            ) : (
              <span aria-hidden style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", fontSize: 96 }}>
                🥫
              </span>
            )}
            {/* Window glare — a strip of cellophane catching the light. */}
            <span aria-hidden className="nf-glare" />
            <span className="nf-stamp" style={{ position: "absolute", right: 10, top: 10 }}>
              <span style={{ fontSize: 9, letterSpacing: ".14em" }}>ONLY</span>
              <span style={{ fontSize: 22, lineHeight: 1 }}>1</span>
              <span style={{ fontSize: 9, letterSpacing: ".14em" }}>IN STOCK</span>
            </span>
          </div>

          {/* Flavour ribbon across the pack. */}
          <div style={{ position: "relative", margin: "-18px -30px 0", transform: "rotate(-4deg)", background: P.ribbon, color: P.ribbonInk, padding: "8px 0", textAlign: "center", fontFamily: GROTESK, fontWeight: 800, fontSize: 12, letterSpacing: ".22em", textTransform: "uppercase", whiteSpace: "nowrap", boxShadow: "0 10px 20px -10px rgba(0,0,0,.45)" }}>
            original flavour · {servings > 0 ? `${servings} servings inside` : "extra sweet"}
          </div>

          <h1 style={{ position: "relative", margin: "16px 0 0", fontFamily: GROTESK, fontWeight: 800, fontSize: nameSize, lineHeight: 0.86, letterSpacing: "-0.055em", textTransform: "uppercase", color: V.paperInk, textAlign: "center", overflowWrap: "anywhere" }}>
            {first}
          </h1>
          {surname ? (
            <p style={{ position: "relative", margin: "6px 0 0", textAlign: "center", fontFamily: ITALIC, fontStyle: "italic", fontSize: 24, lineHeight: 1, color: V.paperInk, opacity: 0.85 }}>{surname}</p>
          ) : null}

          <div style={{ position: "relative", marginTop: 14, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 6 }}>
            {claims.map((c, i) => (
              <span key={c} style={{ ...claim, transform: `rotate(${i % 2 ? 2 : -2}deg)` }}>
                {c}
              </span>
            ))}
          </div>
          <p style={{ position: "relative", margin: "12px 0 0", textAlign: "center", fontFamily: GROTESK, fontSize: 9.5, color: P.boardInk, opacity: 0.65 }}>*drama sold separately. contents may cause smiling.</p>
        </div>
      </div>

      </div>

      <div className="nf-hero-side nf-rise" style={{ animationDelay: "160ms" }}>
        <div className="nf-hero-copy">
          <p style={{ margin: 0, fontFamily: GROTESK, fontSize: 11, fontWeight: 800, letterSpacing: ".24em", textTransform: "uppercase", color: V.a1 }}>now in stores · one store · this one</p>
          <p style={{ margin: "10px 0 0", fontFamily: GROTESK, fontWeight: 800, fontSize: 52, lineHeight: 0.95, letterSpacing: "-0.05em", color: V.ink }}>
            The Nutrition Facts of <span style={{ fontFamily: ITALIC, fontStyle: "italic", fontWeight: 400, letterSpacing: "-0.02em" }}>{first}.</span>
          </p>
          <p style={{ margin: "14px 0 0", fontSize: 16, lineHeight: 1.55, color: V.soft, maxWidth: 400 }}>
            Serving size: 1. Calories: {calories || "∞"}. Every line on the back has a note hidden under it, there are {servings > 0 ? `${servings} servings of us` : "memories"} in the box, and a note folded inside the wrapper.
          </p>
        </div>
        <button type="button" onClick={onFlip} className="nf-flip lv-focus">
          <span aria-hidden className="nf-flip-ico">↻</span> flip the pack
        </button>
      </div>
    </section>
  );
}

const claim: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  padding: "5px 10px",
  borderRadius: 999,
  background: V.paper,
  color: V.paperInk,
  border: `1.5px solid ${V.paperInk}`,
  fontFamily: GROTESK,
  fontSize: 11.5,
  fontWeight: 800,
  letterSpacing: ".02em",
  whiteSpace: "nowrap",
};

function Burst({ children }: { children: string }) {
  return (
    <span className="lv-wiggle" style={{ display: "inline-grid", placeItems: "center", width: 58, height: 58, background: V.a1, color: "#fff", fontFamily: GROTESK, fontWeight: 800, fontSize: 14, letterSpacing: ".02em", clipPath: "polygon(50% 0,61% 12%,76% 6%,79% 22%,94% 24%,88% 39%,100% 50%,88% 61%,94% 76%,79% 78%,76% 94%,61% 88%,50% 100%,39% 88%,24% 94%,21% 78%,6% 76%,12% 61%,0 50%,12% 39%,6% 24%,21% 22%,24% 6%,39% 12%)" }}>
      {children}
    </span>
  );
}

function Pill({ children }: { children: string }) {
  return (
    <span style={{ alignSelf: "center", padding: "8px 14px", borderRadius: 999, background: V.chip, color: V.chipInk, fontFamily: GROTESK, fontWeight: 800, fontSize: 12, letterSpacing: ".14em", textTransform: "uppercase", transform: "rotate(-2deg)", boxShadow: `0 10px 22px -12px ${V.shadow}` }}>
      {children}
    </span>
  );
}
