// The landing's alekhan corner, in all four corners of a card. The parent
// needs `position: relative` and `overflow: hidden`; size, tone and opacity
// come from the props so one component dresses a dark card in gold and a
// cream card in maroon. Styles live in app/globals.css (`.cc…`).

const ALEKHAN = "https://cdn.subhsandesh.in/gifts-media/indianFestival/alekhancorner2.svg";
const FLIPS = { tl: "scaleY(-1)", tr: "scale(-1,-1)", bl: "none", br: "scaleX(-1)" } as const;

export default function CardCorners({
  size,
  tone = "gold",
  opacity,
  breathe = true,
  className = "",
}: {
  /** px; omit to size it from CSS via `--cc-size` (e.g. per breakpoint). */
  size?: number;
  tone?: "gold" | "maroon" | "rose";
  opacity?: number;
  breathe?: boolean;
  className?: string;
}) {
  return (
    <span
      className={`cc cc-${tone}${breathe ? " cc-breathe" : ""} ${className}`}
      style={{ ...(size !== undefined ? { ["--cc-size" as string]: `${size}px` } : {}), ...(opacity !== undefined ? { ["--cc-op" as string]: opacity } : {}) }}
      aria-hidden
    >
      {(Object.keys(FLIPS) as (keyof typeof FLIPS)[]).map((k, i) => (
        <span key={k} className={`cc-c cc-${k}`} style={{ animationDelay: `${i * 0.5}s` }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={ALEKHAN} alt="" loading="lazy" decoding="async" style={{ transform: FLIPS[k] }} />
        </span>
      ))}
    </span>
  );
}
