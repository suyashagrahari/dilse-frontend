"use client";

// ─── <RevealText> — editorial headline reveals that never break a word ───────
//
//   <RevealText text="Every road led to you" />                       // lines slide up from a mask
//   <RevealText text="Aanya" mode="blur" as="h1" style={{ fontSize: 64 }} />  // letters blur in
//   <RevealText text="Forever yours" mode="handwrite" />              // ink draws, then fills
//
// "mask": words are laid out normally, then grouped by the line they landed
// on (measured after layout, re-measured on resize) so every LINE rises as a
// unit — true per-line reveal on any width. "blur": per letter, but letters
// live inside nowrap word spans, so wrapping only ever happens between words.
// "handwrite": SVG text stroked with a dash that runs out, then the fill fades
// in; wraps by words at `maxChars`. Starts when 30% visible (or `play`).
// CSS animations only. Reduced motion: text simply fades in. Screen readers
// get the plain string once (aria-label), never letter soup.

import { Fragment, useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties, type ElementType } from "react";
import { useReducedMotion } from "../../useReducedMotion";
import { EASE_CSS } from "./shared";

export type RevealMode = "mask" | "blur" | "handwrite";

export interface RevealTextProps {
  text: string;
  mode?: RevealMode;
  as?: ElementType;
  /** Seconds before the first line/letter (default 0). */
  delay?: number;
  /** Seconds between lines (mask) or letters (blur). Defaults 0.12 / 0.035. */
  stagger?: number;
  /** Control it yourself instead of on-scroll. */
  play?: boolean;
  /** handwrite: max characters per line before wrapping (default 14). */
  maxChars?: number;
  /** handwrite: ink colour (default currentColor). */
  ink?: string;
  style?: CSSProperties;
  className?: string;
}

const CSS = `
@keyframes cin-rise{from{transform:translate3d(0,108%,0) rotate(2deg)}to{transform:none}}
@keyframes cin-blurin{from{opacity:0;filter:blur(12px);transform:translate3d(0,.25em,0) scale(1.08)}to{opacity:1;filter:blur(0);transform:none}}
@keyframes cin-fadein{from{opacity:0}to{opacity:1}}
@keyframes cin-ink{to{stroke-dashoffset:0}}
@keyframes cin-inkfill{to{fill-opacity:1;stroke-opacity:0}}
@keyframes cin-sweep{from{transform:translateX(0)}to{transform:translateX(var(--d))}}
`;

// `remountKey`: the observed element is replaced when the render branch changes
// (e.g. reduced motion resolving after hydration), so re-observe then.
function useInViewOnce<T extends Element>(ref: React.RefObject<T | null>, enabled: boolean, remountKey: string) {
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    if (!enabled || seen) return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setSeen(true); io.disconnect(); } }, { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, enabled, seen, remountKey]);
  return seen;
}

export default function RevealText({ text, mode = "mask", as, delay = 0, stagger, play, maxChars = 14, ink, style, className }: RevealTextProps) {
  const Tag = (as ?? "p") as ElementType;
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const seen = useInViewOnce(ref, play === undefined, `${reduce}|${mode}`);
  const go = play ?? seen;
  const words = text.trim().split(/\s+/).filter(Boolean);
  const [lines, setLines] = useState<number[] | null>(null);

  // mask: measure which line each word landed on.
  useLayoutEffect(() => {
    if (mode !== "mask") return;
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const spans = Array.from(el.querySelectorAll<HTMLElement>("[data-w]"));
      let line = -1, lastTop = -Infinity;
      const next = spans.map((s) => {
        const top = s.offsetTop;
        if (top > lastTop + 2) { line++; lastTop = top; }
        return line;
      });
      setLines((prev) => (prev && prev.join() === next.join() ? prev : next));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [mode, text]);

  const base: CSSProperties = { margin: 0, ...style };
  const styles = <style href="cinema-reveal" precedence="default">{CSS}</style>;

  if (reduce) {
    return (
      <Tag
        ref={ref}
        className={className}
        style={{
          ...base,
          ...(mode === "handwrite" ? { fontFamily: "var(--font-script, 'Dancing Script'), cursive", color: ink ?? base.color, textAlign: "center" } : null),
          opacity: go ? 1 : 0, animation: go ? "cin-fadein .6s ease both" : undefined,
        }}
      >
        {styles}
        {text}
      </Tag>
    );
  }

  if (mode === "handwrite") return <Handwrite text={text} go={go} delay={delay} maxChars={maxChars} ink={ink} Tag={Tag} tagRef={ref} style={base} className={className} styles={styles} />;

  if (mode === "blur") {
    const st = stagger ?? 0.035;
    let i = 0;
    return (
      <Tag ref={ref} aria-label={text} className={className} style={base}>
        {styles}
        {words.map((w, wi) => (
          // Spaces sit BETWEEN the nowrap word boxes: lines may break there, never inside a word.
          <Fragment key={wi}>
            <span aria-hidden style={{ display: "inline-block", whiteSpace: "nowrap" }}>
              {Array.from(w).map((ch, ci) => {
                const d = delay + i++ * st;
                return (
                  <span key={ci} style={{ display: "inline-block", opacity: 0, animation: go ? `cin-blurin .9s ${EASE_CSS} ${d}s both` : undefined }}>
                    {ch}
                  </span>
                );
              })}
            </span>
            {wi < words.length - 1 ? " " : null}
          </Fragment>
        ))}
      </Tag>
    );
  }

  const st = stagger ?? 0.12;
  return (
    <Tag ref={ref} aria-label={text} className={className} style={base}>
      {styles}
      {words.map((w, wi) => (
        <Fragment key={wi}>
          {/* The clip box: padding/negative margin give descenders and italics room. */}
          <span aria-hidden data-w style={{ display: "inline-block", overflow: "hidden", verticalAlign: "top", padding: "0 .06em .12em", margin: "0 -.06em -.12em" }}>
            <span
              style={{
                display: "inline-block", transform: "translate3d(0,108%,0)",
                animation: go && lines ? `cin-rise 1.05s ${EASE_CSS} ${delay + (lines[wi] ?? 0) * st + (wi % 3) * 0.015}s both` : undefined,
              }}
            >
              {w}
            </span>
          </span>
          {wi < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </Tag>
  );
}

/** Word-wrap a phrase into lines of ≤ maxChars (a single long word gets its own line). */
function wrapWords(text: string, maxChars: number): string[] {
  const out: string[] = [];
  let cur = "";
  for (const w of text.trim().split(/\s+/)) {
    if (cur && (cur + " " + w).length > maxChars) { out.push(cur); cur = w; }
    else cur = cur ? cur + " " + w : w;
  }
  if (cur) out.push(cur);
  return out;
}

function Handwrite({ text, go, delay, maxChars, ink, Tag, tagRef, style, className, styles }: {
  text: string; go: boolean; delay: number; maxChars: number; ink?: string; Tag: ElementType;
  tagRef: React.RefObject<HTMLElement | null>; style: CSSProperties; className?: string; styles: React.ReactNode;
}) {
  const lines = wrapWords(text, maxChars);
  const longest = Math.max(...lines.map((l) => l.length), 1);
  const lh = 1.15;
  // viewBox in "em-ish" units: 100 per em, width estimated from glyph count (script ≈ .5em/char).
  const vbW = Math.max(200, longest * 52 + 40);
  const vbH = lines.length * 100 * lh + 30;
  const perLine = 1.6; // seconds of ink per line
  const uid = useId().replace(/:/g, "");
  return (
    <Tag ref={tagRef} aria-label={text} className={className} style={{ ...style, lineHeight: 1 }}>
      {styles}
      <svg aria-hidden viewBox={`0 0 ${vbW} ${vbH}`} style={{ width: "100%", maxWidth: `${longest * 0.52 + 0.4}em`, height: "auto", display: "block", margin: "0 auto", overflow: "visible" }}>
        <defs>
          <linearGradient id={`${uid}g`}>
            <stop offset="0" stopColor="#fff" />
            <stop offset=".46" stopColor="#fff" />
            <stop offset=".54" stopColor="#000" />
          </linearGradient>
          {lines.map((_, i) => (
            // A soft-edged wipe that travels left → right while the strokes draw: reads as a pen moving.
            <mask key={i} id={`${uid}m${i}`} maskUnits="userSpaceOnUse" x={0} y={0} width={vbW} height={vbH}>
              <rect
                x={-vbW * 1.1} y={0} width={vbW * 2.2} height={vbH} fill={`url(#${uid}g)`}
                style={{ ["--d" as string]: `${vbW * 1.1}px`, animation: go ? `cin-sweep ${perLine}s linear ${delay + i * perLine * 0.8}s forwards` : undefined } as CSSProperties}
              />
            </mask>
          ))}
        </defs>
        {lines.map((l, i) => (
          <text
            key={i}
            mask={`url(#${uid}m${i})`}
            x={vbW / 2}
            y={100 * lh * (i + 1) - 10}
            textAnchor="middle"
            style={{
              font: "100px/1 var(--font-script, 'Dancing Script'), 'Brush Script MT', cursive",
              fill: ink ?? "currentColor", fillOpacity: 0, stroke: ink ?? "currentColor", strokeWidth: 1.6, strokeOpacity: 1,
              strokeLinecap: "round", strokeLinejoin: "round", strokeDasharray: 600, strokeDashoffset: 600,
              animation: go
                ? `cin-ink ${perLine}s cubic-bezier(.45,.05,.55,.95) ${delay + i * perLine * 0.8}s forwards, cin-inkfill .9s ease ${delay + i * perLine * 0.8 + perLine * 0.7}s forwards`
                : undefined,
            }}
          >
            {l}
          </text>
        ))}
      </svg>
    </Tag>
  );
}
