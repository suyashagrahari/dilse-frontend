"use client";

// ─── <KineticName> — the recipient's name, revealed letter by letter ─────────
//
//   <KineticName text={data.recipientName} size="clamp(44px, 12vw, 96px)" gilt />
//
// SSR-safe (plain spans, CSS keyframes — the name is readable before any JS).
// Per-letter rise + blur-in with a stagger, then an optional gilt shimmer
// sweep. `play={false}` holds it hidden until you flip it (e.g. after the gate).
// Reduced motion: the name simply fades in. Screen readers get the whole name
// once (aria-label), not letter by letter.

import type { CSSProperties } from "react";

export interface KineticNameProps {
  text: string;
  /** CSS font-size. */
  size?: string;
  /** CSS font-family (default: the day's display font var). */
  font?: string;
  color?: string;
  /** A gold shimmer pass after the reveal. */
  gilt?: boolean;
  /** ms between letters (default 55). */
  stagger?: number;
  /** ms before the first letter. */
  delay?: number;
  /** false = hidden until true. Default true. */
  play?: boolean;
  as?: "h1" | "h2" | "p" | "span";
  className?: string;
  style?: CSSProperties;
}

/** Splits letters into words, keeping each letter's index for its stagger. */
function words(letters: string[]): { ch: string; i: number }[][] {
  const out: { ch: string; i: number }[][] = [[]];
  letters.forEach((ch, i) => {
    if (/\s/.test(ch)) {
      if (out[out.length - 1].length) out.push([]);
    } else out[out.length - 1].push({ ch, i });
  });
  return out.filter((w) => w.length);
}

export default function KineticName({ text, size = "clamp(40px, 11vw, 88px)", font, color, gilt = false, stagger = 55, delay = 0, play = true, as: Tag = "h1", className, style }: KineticNameProps) {
  const letters = Array.from(text || "");
  const total = delay + letters.length * stagger + 500;
  return (
    <Tag
      className={`pm-kn${play ? " is-play" : ""}${gilt ? " is-gilt" : ""}${className ? ` ${className}` : ""}`}
      aria-label={text}
      style={{ fontSize: size, fontFamily: font ?? "var(--vw-font-serif, serif)", color, ["--pm-kn-total" as string]: `${total}ms`, ...style }}
    >
      {/* Letters are grouped per word (nowrap) with real spaces between the
          groups: a lone " " in an inline-block span has no width, and
          per-letter spans would otherwise wrap mid-word. */}
      {words(letters).map((w, wi) => (
        <span key={wi}>
          {wi > 0 && " "}
          <span aria-hidden style={{ whiteSpace: "nowrap" }}>
            {w.map(({ ch, i }) => (
              <span key={i} className="pm-knL" style={{ animationDelay: `${delay + i * stagger}ms` }}>
                {ch}
              </span>
            ))}
          </span>
        </span>
      ))}
      <style>{KN_CSS}</style>
    </Tag>
  );
}

const KN_CSS = `
.pm-kn { margin: 0; line-height: 1.02; letter-spacing: -.01em; position: relative; display: inline-block; overflow: hidden; padding: .06em .04em; }
.pm-knL { display: inline-block; opacity: 0; transform: translateY(.35em) scale(.96); filter: blur(6px); will-change: transform, opacity; }
.pm-kn.is-play .pm-knL { animation: pm-knIn .7s cubic-bezier(.22,1,.36,1) forwards; }
.pm-kn.is-gilt::after { content: ""; position: absolute; inset: -6% -4%; pointer-events: none; opacity: 0;
  background: linear-gradient(100deg, transparent 38%, rgba(255,246,214,.85) 50%, transparent 62%); mix-blend-mode: overlay; transform: translateX(-110%); }
.pm-kn.is-gilt.is-play::after { animation: pm-knGilt 1.4s ease-in-out var(--pm-kn-total) 1 both; }
@keyframes pm-knIn { to { opacity: 1; transform: none; filter: none; } }
@keyframes pm-knGilt { 0% { opacity: 0; transform: translateX(-110%); } 12%, 88% { opacity: 1; } 100% { opacity: 0; transform: translateX(110%); } }
@media (prefers-reduced-motion: reduce) {
  .pm-knL { transform: none; filter: none; }
  .pm-kn.is-play .pm-knL { animation: pm-knFade .4s ease forwards; animation-delay: 0ms !important; }
  .pm-kn.is-gilt.is-play::after { animation: none; }
}
@keyframes pm-knFade { to { opacity: 1; } }
`;
