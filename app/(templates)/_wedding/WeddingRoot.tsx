"use client";
// ─── <WeddingRoot> — theme + fonts + kit CSS for everything inside it ────────
//
//   <WeddingRoot theme={extras.theme}>
//     …tier sections…
//   </WeddingRoot>
//
// Puts the theme's --wk-* tokens and the --font-wk-* faces on one element,
// paints the themed background (wash + fibre texture) and injects the kit's
// stylesheet once per document (React 19 hoists + dedupes <style href>).

import { useEffect, useRef, useSyncExternalStore, type CSSProperties, type ElementType, type ReactNode } from "react";
import { WEDDING_FONT_VARS } from "./fonts";
import { WEDDING_KIT_CSS } from "./kitCss";
import { themeVars, weddingTheme, type WeddingThemeId } from "./themes";

export interface WeddingRootProps {
  theme: WeddingThemeId | string | undefined;
  children: ReactNode;
  /** Paint the themed page background + texture (default true). False = tokens/fonts only (editor panels). */
  background?: boolean;
  /** Set <meta name="theme-color"> to the theme while mounted (default true when `background`). */
  chrome?: boolean;
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
}

/** The kit stylesheet, deduped. Mount it yourself only when rendering kit pieces outside a WeddingRoot. */
export function WeddingKitStyles() {
  return (
    <style href="wedding-kit" precedence="default">
      {WEDDING_KIT_CSS}
    </style>
  );
}

export default function WeddingRoot({ theme, children, background = true, chrome, as: Tag = "div", className, style }: WeddingRootProps) {
  const t = weddingTheme(theme);
  const wantChrome = chrome ?? background;
  useEffect(() => {
    if (!wantChrome) return;
    let meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    const created = !meta;
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "theme-color";
      document.head.appendChild(meta);
    }
    const prev = meta.content;
    meta.content = t.chrome;
    return () => {
      if (created) meta?.remove();
      else if (meta) meta.content = prev;
    };
  }, [t.chrome, wantChrome]);

  return (
    <Tag
      data-wk-root=""
      data-wk-theme={t.id}
      data-wk-dark={t.dark ? "" : undefined}
      className={`wk-root ${WEDDING_FONT_VARS}${background ? " wk-bg" : ""}${className ? ` ${className}` : ""}`}
      style={{ ...themeVars(t.id), ...style }}
    >
      <WeddingKitStyles />
      {children}
    </Tag>
  );
}

// ── Motion helpers ──────────────────────────────────────────────────────────

const RM = "(prefers-reduced-motion: reduce)";
const subRM = (cb: () => void) => {
  const mq = window.matchMedia?.(RM);
  mq?.addEventListener?.("change", cb);
  return () => mq?.removeEventListener?.("change", cb);
};
/** true when the visitor asked for less motion (SSR: false). */
export function useWeddingReducedMotion(): boolean {
  return useSyncExternalStore(subRM, () => !!window.matchMedia?.(RM).matches, () => false);
}

export interface RevealProps {
  children: ReactNode;
  as?: ElementType;
  /** ms before this element starts (stagger siblings by passing 0, 80, 160…). */
  delay?: number;
  /** "rise" (default) · "fade" · "zoom" · "blur". */
  effect?: "rise" | "fade" | "zoom" | "blur";
  className?: string;
  style?: CSSProperties;
}

/**
 * Cinematic entrance on first scroll into view (once). Transform/opacity only.
 * Reduced motion: shown immediately. No re-render: a class flips on the node.
 */
export function Reveal({ children, as: Tag = "div", delay = 0, effect = "rise", className, style }: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia?.(RM).matches || typeof IntersectionObserver === "undefined") {
      el.classList.add("is-in");
      return;
    }
    const io = new IntersectionObserver(
      (es) => {
        if (es.some((e) => e.isIntersecting)) {
          el.classList.add("is-in");
          io.disconnect();
        }
      },
      { threshold: 0.18, rootMargin: "0px 0px -4% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <Tag ref={ref} className={`wk-reveal wk-reveal-${effect}${className ? ` ${className}` : ""}`} style={{ ...style, ["--wk-delay" as string]: `${delay}ms` }}>
      {children}
    </Tag>
  );
}
