"use client";

// ─── <SceneTransition> — chapter changes that feel like a cut, not a fade ────
//
//   <div style={{ position: "relative", height: "100svh" }}>
//     <SceneTransition sceneKey={sc.scene} variant="iris">{render(sc.scene)}</SceneTransition>
//   </div>
//
// Variants (the NEW scene is revealed over the old one; both are absolutely
// stacked, so give the parent a size):
//   "iris"  — an aperture opens from the centre (or `origin`), the old scene sinks back;
//   "ink"   — an ink blot bleeds outward (an SVG-turbulence-edged mask);
//   "fold"  — the old scene folds away like a page turning on its left edge;
//   "flash" — a warm light flash dissolves one scene into the next.
// Masks/clip-paths/transforms only. Reduced motion: a 250 ms crossfade.

import { AnimatePresence, motion, type Variant, type Variants } from "framer-motion";
import { useState, type CSSProperties, type ReactNode } from "react";
import { useReducedMotion } from "../../useReducedMotion";
import { EASE_IN_OUT, EASE_OUT } from "./shared";

export type TransitionVariant = "iris" | "ink" | "fold" | "flash";

export interface SceneTransitionProps {
  sceneKey: string;
  variant?: TransitionVariant;
  children: ReactNode;
  /** Seconds (default 1.1; flash 0.9). */
  duration?: number;
  /** iris/ink: where the reveal starts, as CSS position (default "50% 50%"). */
  origin?: string;
  /** flash: the light colour (default warm white). */
  flashColor?: string;
  style?: CSSProperties;
}

// An ink blot as an image mask: a circle with a turbulence-displaced, feathered edge.
const INK_MASK =
  "url(\"data:image/svg+xml;utf8," +
  encodeURIComponent(
    "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'><filter id='f' x='-20%' y='-20%' width='140%' height='140%'><feTurbulence type='fractalNoise' baseFrequency='.035' numOctaves='4' seed='7'/><feDisplacementMap in='SourceGraphic' scale='34'/><feGaussianBlur stdDeviation='1.6'/></filter><circle cx='100' cy='100' r='62' fill='black' filter='url(#f)'/></svg>",
  ) +
  "\")";

const layer: CSSProperties = { position: "absolute", inset: 0 };

export default function SceneTransition({ sceneKey, variant = "iris", children, duration, origin = "50% 50%", flashColor = "#fff4e0", style }: SceneTransitionProps) {
  const reduce = useReducedMotion();
  const d = duration ?? (variant === "flash" ? 0.9 : 1.1);
  const [firstKey] = useState(sceneKey);

  let v: Variants;
  if (reduce) {
    v = { enter: { opacity: 0 }, center: { opacity: 1, transition: { duration: 0.25 } }, exit: { opacity: 0, transition: { duration: 0.25 } } };
  } else if (variant === "iris") {
    v = {
      enter: { clipPath: `circle(0% at ${origin})`, zIndex: 2 },
      center: { clipPath: `circle(${origin === "50% 50%" ? 74 : 150}% at ${origin})`, zIndex: 2, transition: { duration: d, ease: EASE_IN_OUT } },
      exit: { scale: 0.94, opacity: 0.35, filter: "brightness(.6)", zIndex: 1, transition: { duration: d, ease: EASE_IN_OUT } },
    };
  } else if (variant === "ink") {
    v = {
      enter: { WebkitMaskSize: "0%", maskSize: "0%", zIndex: 2 } as Variant,
      center: { WebkitMaskSize: "640%", maskSize: "640%", zIndex: 2, transition: { duration: d * 1.2, ease: [0.5, 0, 0.3, 1] } } as Variant,
      exit: { opacity: 0.6, zIndex: 1, transition: { duration: d * 1.2 } },
    };
  } else if (variant === "fold") {
    v = {
      enter: { opacity: 0.4, scale: 0.97, zIndex: 1 },
      center: { opacity: 1, scale: 1, zIndex: 1, transition: { duration: d, ease: EASE_OUT, delay: d * 0.15 } },
      exit: { rotateY: -96, opacity: 0.9, zIndex: 2, transition: { duration: d, ease: [0.55, 0, 0.45, 1] } },
    };
  } else {
    v = {
      enter: { opacity: 0, zIndex: 2 },
      center: { opacity: 1, zIndex: 2, transition: { duration: d * 0.5, delay: d * 0.4, ease: EASE_OUT } },
      exit: { opacity: 0, zIndex: 1, transition: { duration: d * 0.5, delay: d * 0.35 } },
    };
  }

  const maskStyle: CSSProperties =
    variant === "ink" && !reduce
      ? { WebkitMaskImage: INK_MASK, maskImage: INK_MASK, WebkitMaskRepeat: "no-repeat", maskRepeat: "no-repeat", WebkitMaskPosition: origin, maskPosition: origin }
      : {};

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", isolation: "isolate", perspective: variant === "fold" ? 1400 : undefined, ...style }}>
      <AnimatePresence initial={false}>
        <motion.div
          key={sceneKey}
          variants={v}
          initial="enter"
          animate="center"
          exit="exit"
          style={{ ...layer, ...maskStyle, transformOrigin: variant === "fold" ? "0% 50%" : "50% 50%", backfaceVisibility: "hidden" }}
        >
          {children}
          {variant === "fold" && !reduce && (
            // The fold's shading: a crease shadow that only shows while it turns.
            <motion.span
              aria-hidden
              variants={{ enter: { opacity: 0 }, center: { opacity: 0 }, exit: { opacity: 1, transition: { duration: d } } }}
              style={{ ...layer, pointerEvents: "none", background: "linear-gradient(90deg, rgba(0,0,0,.05), rgba(0,0,0,.45) 85%, rgba(255,255,255,.12))" }}
            />
          )}
        </motion.div>
      </AnimatePresence>
      {variant === "flash" && !reduce && sceneKey !== firstKey && (
        <motion.div
          key={`flash-${sceneKey}`}
          aria-hidden
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.95, 0] }}
          transition={{ duration: d, times: [0, 0.42, 1], ease: "easeInOut" }}
          style={{ ...layer, zIndex: 3, pointerEvents: "none", background: `radial-gradient(circle at ${origin}, #fff, ${flashColor} 40%, ${flashColor}00 100%)`, mixBlendMode: "screen" }}
        />
      )}
    </div>
  );
}
