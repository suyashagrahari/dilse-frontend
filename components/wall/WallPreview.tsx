import { wallPalette, wallCaption } from "@/lib/wall/format";
import type { WallEntry } from "@/lib/wall/types";

// ─── The preview card ────────────────────────────────────────────────────────
//
// Drawn from type and the template's own gradient. It is NOT a thumbnail of the
// creation, and there is no code path here that could make it one: this
// component receives two first names and a slug, and has nothing else to draw.
//
// That constraint turned out to be a design gift rather than a limitation. A
// screenshot of a love letter is unreadable at 240px wide; two names set large
// on the template's own colour is legible at any size, loads instantly, needs no
// image pipeline, and cannot leak a photo.

export default function WallPreview({
  entry,
  size = "md",
}: {
  entry: WallEntry;
  size?: "md" | "lg";
}) {
  const p = wallPalette(entry.templateSlug, entry.templateName);
  const c = wallCaption(entry);
  const lg = size === "lg";

  return (
    <div
      style={{
        position: "relative",
        aspectRatio: "4 / 5",
        borderRadius: 12,
        overflow: "hidden",
        background: p.bgGradient,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        padding: lg ? 28 : 18,
        isolation: "isolate",
      }}
    >
      {/*
        The template's emoji, centred in the upper half at full opacity.

        This started as a low-opacity corner watermark and it looked like a
        rendering fault: almost every template's `bgGradient` is a pale pastel
        meant to sit behind a whole page, so a 16%-opacity mark on top of it is
        very nearly invisible and the card reads as a large empty rectangle.
        Centred and opaque, the same glyph gives the card a subject.
      */}
      <span
        aria-hidden
        style={{
          position: "absolute",
          // Centred with a transform rather than `left: 0; right: 0` plus
          // `text-align: center`. The stretched-inset version depends on the
          // span resolving its static position against the padding box, which
          // is exactly the thing a flex-column parent makes unreliable — it
          // rendered hard against the right edge. Pinning the centre point and
          // pulling back by half the element's own size has no such dependency.
          left: "50%",
          top: "26%",
          transform: "translate(-50%, -50%)",
          fontSize: lg ? 76 : 52,
          lineHeight: 1,
          pointerEvents: "none",
          userSelect: "none",
          filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.10))",
        }}
      >
        {p.emoji}
      </span>

      {/* A soft floor so the names stay legible over any gradient, however
          light the template's palette is at the bottom edge. */}
      <span
        aria-hidden
        style={{
          position: "absolute",
          inset: "42% 0 0 0",
          background: "linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0.86) 72%)",
          pointerEvents: "none",
        }}
      />

      <div style={{ position: "relative" }}>
        <div
          style={{
            fontSize: lg ? 12 : 10,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            fontWeight: 600,
            color: p.color,
            opacity: 0.85,
            marginBottom: lg ? 10 : 7,
          }}
        >
          {p.title}
        </div>
        <div
          style={{
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontSize: lg ? 30 : 20,
            lineHeight: 1.18,
            color: "#2a0a0e",
            // A long pair of names wraps rather than being clipped — a card
            // showing half a name is worse than a card that is a line taller.
            overflowWrap: "anywhere",
          }}
        >
          {c.lead}
          <span style={{ opacity: 0.55 }}>{c.joiner === " & " ? " & " : " · "}</span>
          {c.trail}
        </div>
      </div>
    </div>
  );
}
