"use client";

import Link from "next/link";
import { memo, useEffect, useRef, type ReactNode } from "react";
import { GC, BRAND_GRADIENT, CARD_BORDER, CARD_SHADOW } from "./theme";
import { Rule } from "./Ornaments";

// ─── The pieces every section is built from ──────────────────────────────────
//
// Five of them, declared once. They are here rather than retyped per section
// because they drifted the last time they were not: two headings ended up 2px
// apart in size, which nobody notices individually and which makes a page feel
// assembled rather than designed.

/**
 * Reveal on scroll.
 *
 * ── WHY THIS AND NOT framer-motion's `whileInView` ──────────────────────────
 *
 * `whileInView` is a fine API and it mounts a motion component per element.
 * This page has thirty-odd revealed blocks, and every one of them would be a
 * subscriber to framer's animation loop for a single 620ms opacity-and-translate
 * that never runs again. An IntersectionObserver that adds one class and then
 * unobserves costs one observer entry, hands the animation to the compositor via
 * CSS, and — the part that matters — is switched off wholesale by the
 * `prefers-reduced-motion` block in ganesh.css rather than needing a JS check.
 *
 * Unobserving after the first hit is not optional. A block that re-animates
 * every time it scrolls back into view turns a long page into a flickering one.
 *
 * ── WHY IT HOLDS NO STATE, AND WHY THE HIDING HAPPENS IN AN EFFECT ──────────
 *
 * The obvious shape is `useState(false)` and `opacity: shown ? 1 : 0`. It has
 * two problems, and they pull in opposite directions.
 *
 * If the server renders `opacity: 0`, then a reader with JavaScript disabled or
 * still loading gets a completely blank page — thirty invisible blocks — which
 * is a far worse failure than no animation. And a `useState` initialiser that
 * checks for `IntersectionObserver` renders `true` on the server (where it does
 * not exist) and `false` on the client, which is a hydration mismatch: React
 * throws the server HTML away.
 *
 * So the element renders VISIBLE, always, in the HTML. The effect then hides it
 * — a direct style write, not a state update — and hands it to the observer,
 * which reveals it again. If there is no observer, or no JS at all, the effect
 * never runs and the content simply sits there unanimated, which is the correct
 * degradation. Writing to the DOM is what effects are for, and it keeps this
 * component off React's render path entirely: it never re-renders, once.
 */
export const Reveal = memo(function Reveal({
  children,
  delay = 0,
  as: Tag = "div",
  className,
  style,
}: {
  children: ReactNode;
  /** Seconds. Stagger siblings by 0.08–0.12; more than that reads as lag. */
  delay?: number;
  as?: "div" | "section" | "li" | "p";
  className?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    // Already on screen at mount — everything above the fold. Animate it in
    // right away rather than hiding it and waiting for a scroll that may never
    // come, which is what the observer would otherwise do on a short page.
    const onScreen = el.getBoundingClientRect().top < window.innerHeight * 0.9;
    const play = () => {
      el.style.animationDelay = `${delay}s`;
      el.classList.add("gc-rise");
      el.style.opacity = "";
    };

    if (onScreen) {
      play();
      return;
    }

    el.style.opacity = "0";
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          play();
          io.unobserve(e.target);
        }
      },
      // A little before it arrives, so the reveal is finishing as the reader's
      // eye lands rather than starting.
      { rootMargin: "0px 0px -10% 0px", threshold: 0.06 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [delay]);

  return (
    <Tag ref={ref as React.Ref<never>} className={className} style={style}>
      {children}
    </Tag>
  );
});

/**
 * A section eyebrow, heading and optional standfirst.
 *
 * `centered` rather than a separate component: every section is centred on a
 * phone and about half of them stay centred on a laptop, so the alignment is a
 * property of the heading and not a different heading.
 */
export const SectionHead = memo(function SectionHead({
  eyebrow,
  title,
  sub,
  centered = false,
  rule = true,
}: {
  eyebrow?: string;
  title: string;
  sub?: string;
  centered?: boolean;
  rule?: boolean;
}) {
  return (
    <div style={{ textAlign: centered ? "center" : undefined }}>
      {eyebrow && <p className="gc-eyebrow" style={{ margin: "0 0 12px" }}>{eyebrow}</p>}
      <h2 className="gc-display gc-h2 gc-name" style={{ margin: 0 }}>
        {title}
      </h2>
      {rule && (
        // `gc-rule-wrap` is what lets the stylesheet re-centre this below
        // 1024px. A split section's heading is left-aligned on a laptop and
        // centred while stacked — the text follows that from `.gc-words`, and
        // without the class the rule underneath it stayed stubbornly left,
        // which reads as a misalignment rather than as a choice.
        <div
          className="gc-rule-wrap"
          style={{
            marginTop: 14,
            display: "flex",
            justifyContent: centered ? "center" : "flex-start",
          }}
        >
          <Rule width={centered ? 180 : 140} />
        </div>
      )}
      {sub && (
        <p className="gc-lede" style={{ margin: "14px 0 0", maxWidth: "56ch" }}>
          {sub}
        </p>
      )}
    </div>
  );
});

/** The house card: white-ivory, one hairline, a diffuse shadow. */
export const Card = memo(function Card({
  children,
  pad,
  style,
  className,
}: {
  children: ReactNode;
  pad?: number | string;
  style?: React.CSSProperties;
  className?: string;
}) {
  return (
    <div
      className={className}
      style={{
        background: GC.surface,
        border: CARD_BORDER,
        boxShadow: CARD_SHADOW,
        borderRadius: 20,
        padding: pad ?? "clamp(20px, 3vw, 32px)",
        ...style,
      }}
    >
      {children}
    </div>
  );
});

/**
 * The one button style on the page.
 *
 * A fixed `min-height` rather than padding alone: labels range from "Save" to
 * "Add to your story", and a padding-sized button changes height with its text,
 * so the reader's thumb lands somewhere slightly different each time.
 */
export const Button = memo(function Button({
  onClick,
  children,
  tone = "primary",
  disabled,
  full,
  as,
  href,
}: {
  onClick?: () => void;
  children: ReactNode;
  tone?: "primary" | "quiet";
  disabled?: boolean;
  full?: boolean;
  as?: "a";
  href?: string;
}) {
  const primary = tone === "primary";
  const style: React.CSSProperties = {
    minHeight: 48,
    padding: "0 24px",
    borderRadius: 999,
    fontSize: 14.5,
    fontWeight: 600,
    letterSpacing: 0.1,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    width: full ? "100%" : undefined,
    cursor: disabled ? "default" : "pointer",
    opacity: disabled ? 0.5 : 1,
    textDecoration: "none",
    background: primary ? BRAND_GRADIENT : GC.surface,
    color: primary ? "#FFFDF9" : GC.ink,
    border: primary ? "none" : `1px solid ${GC.hairlineStrong}`,
    boxShadow: primary ? "0 14px 26px -16px rgba(222,138,44,0.7)" : "none",
    transition: "transform 160ms, box-shadow 160ms",
  };

  if (as === "a" && href) {
    return (
      <a href={href} style={style}>
        {children}
      </a>
    );
  }
  return (
    <button type="button" onClick={onClick} disabled={disabled} style={style}>
      {children}
    </button>
  );
});

/**
 * The SubhSandesh badge, top-right, on the recipient's page only.
 *
 * ── IT IS THE "MAKE YOUR OWN" AFFORDANCE, NOT A WATERMARK ───────────────────
 *
 * On a dedicated viewer this is the only route from somebody else's page to
 * making your own, which is why it is a `<Link href="/templates">` rather than
 * an image, and why the wordmark under it is legible rather than decorative. A
 * reader who wants to send one back has exactly one thing to tap.
 *
 * `mode === "live"` only. In the builder the top bar already owns this corner,
 * and two brand marks 40px apart read as a rendering bug.
 */
export const BrandBadge = memo(function BrandBadge() {
  return (
    <Link
      href="/templates"
      aria-label="SubhSandesh — make your own"
      style={{
        position: "fixed",
        top: 14,
        right: 14,
        zIndex: 46,
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "6px 12px 6px 6px",
        borderRadius: 999,
        background: "rgba(255,253,249,0.86)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: `1px solid ${GC.hairline}`,
        boxShadow: "0 10px 26px -18px rgba(46,33,25,0.5)",
        textDecoration: "none",
      }}
    >
      <span
        style={{
          width: 28,
          height: 28,
          borderRadius: 8,
          overflow: "hidden",
          display: "grid",
          placeItems: "center",
        }}
      >
        {/* Plain <img>: next/image would inject a srcset for a 26px icon that is
            already the right size, and this sits on the recipient's first paint. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo.webp"
          alt="SubhSandesh"
          width={26}
          height={26}
          style={{ objectFit: "contain" }}
        />
      </span>
      <span
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.04em",
          color: GC.ink,
          whiteSpace: "nowrap",
        }}
      >
        Make your own
      </span>
    </Link>
  );
});
