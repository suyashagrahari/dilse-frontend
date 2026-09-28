"use client";

// ─── Side effects may include… ───────────────────────────────────────────────
//
// Every packet has a warning box. This one lists what happens to you after a
// serving of this person — and each side effect is one of the sender's GIFs,
// stuck on like a hazard sticker.

import { GROTESK, ITALIC } from "../../_love/LoveKit";
import { V } from "../../_love/theme";

/** One per GIF slot. The label is the joke; the GIF is the evidence. */
export const SIDE_EFFECTS = ["uncontrollable happy dancing", "sudden, unscheduled hugs", "smiling at your phone in public"];

export default function SideEffects({ gifs }: { gifs: string[] }) {
  if (!gifs.length) return null;
  return (
    <section aria-label="Side effects" style={{ width: "100%", maxWidth: 980, display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div className="nf-warn">
        <span aria-hidden style={{ fontSize: 22 }}>⚠</span>
        <div>
          <p style={{ margin: 0, fontFamily: GROTESK, fontWeight: 800, fontSize: 12, letterSpacing: ".2em", textTransform: "uppercase" }}>warning</p>
          <p style={{ margin: "2px 0 0", fontFamily: GROTESK, fontWeight: 800, fontSize: "clamp(22px, 6vw, 30px)", lineHeight: 1, letterSpacing: "-0.03em" }}>Side effects may include</p>
        </div>
      </div>

      <div style={{ marginTop: 26, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "26px 22px" }}>
        {gifs.map((g, i) => (
          <figure key={g} className="nf-rise" style={{ margin: 0, width: "min(230px, 42vw)", minWidth: 150, transform: `rotate(${[-3, 2.5, -1.5][i % 3]}deg)`, animationDelay: `${i * 90}ms` }}>
            <span style={{ position: "relative", display: "block", aspectRatio: "1 / 1", borderRadius: 22, overflow: "hidden", background: "#fff", border: "6px solid #fff", boxShadow: `0 24px 44px -22px ${V.shadow}` }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={g} alt={SIDE_EFFECTS[i] ?? "side effect"} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
            </span>
            <figcaption className="nf-hazard">
              <span style={{ fontFamily: GROTESK, fontWeight: 800, fontSize: 10, letterSpacing: ".18em" }}>{String(i + 1).padStart(2, "0")}</span>{" "}
              <span style={{ fontFamily: ITALIC, fontStyle: "italic", fontSize: 17, lineHeight: 1.05 }}>{SIDE_EFFECTS[i] ?? "more of the same"}</span>
            </figcaption>
          </figure>
        ))}
      </div>
      <p style={{ margin: "20px 0 0", fontFamily: GROTESK, fontSize: 12, color: V.faint, textAlign: "center" }}>If symptoms persist, that is sort of the point.</p>
    </section>
  );
}
