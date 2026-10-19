"use client";
// ─── Families, the invitation message and the monogram ──────────────────────
import type { ReactNode } from "react";
import type { FamilySide } from "../types";
import { Ornament, type OrnamentId } from "../ornaments";
import { Reveal } from "../WeddingRoot";

const hasDeva = (s: string | undefined) => !!s && /[ऀ-ॿ]/.test(s);
const langOf = (s: string | undefined) => (hasDeva(s) ? "hi" : undefined);

// ── FamiliesBlock ───────────────────────────────────────────────────────────

export interface FamiliesBlockProps {
  bride: FamilySide;
  groom: FamilySide;
  /** Line above both cards: "With the blessings of" / "शुभाशीर्वाद". Empty = none. */
  heading?: string;
  /** Which side reads first (Indian convention varies by family). Default "bride". */
  first?: "bride" | "groom";
  /** Show the families' photos when present. */
  photos?: boolean;
}

function FamilyCard({ side, photos, i }: { side: FamilySide; photos: boolean; i: number }) {
  return (
    <Reveal className="wk-card wk-foil-border wk-family" delay={i * 120}>
      {photos && side.photo && (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="wk-family-photo" src={side.photo} alt="" loading="lazy" decoding="async" />
      )}
      <p className="wk-eyebrow" lang={langOf(side.title)}>
        {side.title}
      </p>
      <ul className="wk-family-names">
        {side.names.filter(Boolean).map((n, k) => (
          <li key={k} lang={langOf(n)}>
            {n}
          </li>
        ))}
      </ul>
      {side.note && (
        <p className="wk-family-note" lang={langOf(side.note)}>
          {side.note}
        </p>
      )}
    </Reveal>
  );
}

export function FamiliesBlock({ bride, groom, heading = "With the blessings of", first = "bride", photos = false }: FamiliesBlockProps) {
  const sides = first === "bride" ? [bride, groom] : [groom, bride];
  return (
    <div className="wk-families">
      {heading && (
        <Reveal as="p" className="wk-families-head" effect="fade">
          <span lang={langOf(heading)}>{heading}</span>
        </Reveal>
      )}
      <div className="wk-families-grid">
        {sides.map((s, i) => (
          <FamilyCard key={i} side={s} photos={photos} i={i} />
        ))}
      </div>
    </div>
  );
}

// ── MessageBlock ────────────────────────────────────────────────────────────

export interface MessageBlockProps {
  /** The invitation text (blank lines = paragraphs). */
  text: string;
  /** Optional Hindi version, shown side by side on wide screens (Royal). */
  hindi?: string;
  eyebrow?: ReactNode;
  /** Optional heading in script ("Together with their families"). */
  heading?: ReactNode;
  /** A sign-off line ("— The Sharma & Kapoor families"). */
  signature?: ReactNode;
  /** Ornament above the text. Default "ganesha"; null = none. */
  ornament?: OrnamentId | null;
  align?: "center" | "left";
  /** A foil drop cap on the first paragraph (Latin text only). */
  dropCap?: boolean;
}

const paras = (t: string) =>
  t
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

function Text({ text, dropCap, lang }: { text: string; dropCap: boolean; lang?: string }) {
  return (
    <div className={`wk-msg-text${lang === "hi" ? " is-deva" : ""}`} lang={lang}>
      {paras(text).map((p, i) => (
        <p key={i} className={i === 0 && dropCap && !hasDeva(p) ? "wk-dropcap" : undefined}>
          {p.split("\n").map((line, k, arr) => (
            <span key={k}>
              {line}
              {k < arr.length - 1 && <br />}
            </span>
          ))}
        </p>
      ))}
    </div>
  );
}

export function MessageBlock({ text, hindi, eyebrow, heading, signature, ornament = "ganesha", align = "center", dropCap = false }: MessageBlockProps) {
  const two = !!hindi?.trim();
  return (
    <Reveal className={`wk-msg wk-msg-${align}${two ? " is-two" : ""}`}>
      {ornament && <Ornament id={ornament} width={ornament === "ganesha" ? 64 : 88} className="wk-msg-orn" shimmer />}
      {eyebrow && <p className="wk-eyebrow">{eyebrow}</p>}
      {heading && <h2 className="wk-msg-heading">{heading}</h2>}
      <div className="wk-msg-cols">
        <Text text={text} dropCap={dropCap} lang={langOf(text)} />
        {two && <Text text={hindi as string} dropCap={false} lang="hi" />}
      </div>
      {signature && <p className="wk-msg-sign">{signature}</p>}
    </Reveal>
  );
}

// ── Monogram ────────────────────────────────────────────────────────────────

/** First user-perceived character (a Devanagari conjunct + matra stays whole). */
export function initialOf(name: string): string {
  const s = (name || "").trim();
  if (!s) return "";
  const Seg = (Intl as unknown as { Segmenter?: new (l?: string, o?: { granularity: string }) => { segment: (t: string) => Iterable<{ segment: string }> } }).Segmenter;
  if (Seg) {
    for (const g of new Seg(undefined, { granularity: "grapheme" }).segment(s)) return g.segment.toUpperCase();
  }
  return Array.from(s)[0].toUpperCase();
}

export interface MonogramProps {
  /** Full names; the initials are taken from them. */
  a: string;
  b: string;
  /** "text" — initials and an ampersand; "foil" — foil initials in a ring; "crest" — inside the crest ornament. */
  variant?: "text" | "foil" | "crest";
  /** Rendered size in px (width). Default 160. */
  size?: number;
  /** Small caps line under the monogram (a date: "12 · 12 · 2026"). */
  caption?: string;
  /** Stamp-in animation on reveal. Default true. */
  animate?: boolean;
}

export function Monogram({ a, b, variant = "foil", size = 160, caption, animate = true }: MonogramProps) {
  const A = initialOf(a);
  const B = initialOf(b);
  const deva = hasDeva(A + B);
  const inner = (
    <span className={`wk-mono-letters${deva ? " is-deva" : ""}`} style={{ fontSize: size * (variant === "crest" ? 0.25 : 0.3) }}>
      <span className="wk-mono-a">{A}</span>
      <span className="wk-mono-amp">&amp;</span>
      <span className="wk-mono-b">{B}</span>
    </span>
  );
  return (
    <Reveal effect={animate ? "zoom" : "fade"} className={`wk-mono wk-mono--${variant}`} style={{ width: size }}>
      <div className="wk-mono-box" style={{ width: size, height: variant === "crest" ? size * 1.05 : size }} role="img" aria-label={`${a} and ${b}`}>
        {variant === "crest" && <Ornament id="monogram-crest" width={size} className="wk-mono-crest" shimmer />}
        {variant === "foil" && <Ornament id="monogram-frame" width={size} className="wk-mono-crest" shimmer />}
        {inner}
      </div>
      {caption && <p className="wk-mono-cap">{caption}</p>}
    </Reveal>
  );
}
