// Canvas `ctx.font` does not understand `var(--x)`; an unparseable font string
// is silently ignored (you get 10px sans-serif). These resolve the next/font
// CSS variables from app/layout to real family names at runtime.

const FALLBACK = {
  ui: "Fredoka, system-ui, sans-serif",
  serif: "'Playfair Display', Georgia, serif",
  script: "'Dancing Script', cursive",
} as const;

const VARS = { ui: ["--font-fredoka"], serif: ["--font-vw-serif", "--font-playfair"], script: ["--font-vw-script", "--font-dancing"] } as const;

export type CanvasFace = keyof typeof FALLBACK;

export function canvasFamily(face: CanvasFace): string {
  if (typeof document === "undefined") return FALLBACK[face];
  // The swap faces live on the day's root ([data-vw-day]); the app-wide ones on <html>/<body>.
  const roots = [document.querySelector("[data-vw-day]"), document.documentElement, document.body].filter(Boolean) as Element[];
  let v = "";
  for (const name of VARS[face]) {
    for (const el of roots) {
      v = getComputedStyle(el).getPropertyValue(name).trim();
      if (v) break;
    }
    if (v) break;
  }
  return v ? `${v}, ${FALLBACK[face]}` : FALLBACK[face];
}

/** `canvasFont("ui", 18, 600)` → "600 18px '__Fredoka_x', Fredoka, system-ui, sans-serif" */
export function canvasFont(face: CanvasFace, px: number, weight: number | string = 400, italic = false): string {
  return `${italic ? "italic " : ""}${weight} ${px}px ${canvasFamily(face)}`;
}
