// The passport's rubber stamps, drawn once as SVG markup so the page (inline, in the page's own fonts) and the
// keepsake canvas (a data: URL image) print the exact same stamp. Each hug has its own shape and ink: a round bear
// stamp, a square back-hug stamp, a scalloped twirl stamp, a heart-shaped pat-pat stamp, an airmail rectangle for the
// long-distance hug, and the big round "Forever" seal. A seeded speckle mask makes the ink look pressed, not printed.

import { STAMP, rand, type StampKind } from "./util";

const FONT = "var(--font-fredoka), Fredoka, 'Arial Rounded MT Bold', 'Trebuchet MS', sans-serif";
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** The centre drawing of each stamp, in a 64×64 box centred on 0,0, filled with the ink. */
function icon(kind: StampKind, ink: string): string {
  const paper = "#FFFDF9";
  switch (kind) {
    case "bear":
      return `<circle cx="-17" cy="-17" r="9" fill="${ink}"/><circle cx="17" cy="-17" r="9" fill="${ink}"/><circle r="22" fill="${ink}"/>
        <circle cx="-8" cy="-4" r="3" fill="${paper}"/><circle cx="8" cy="-4" r="3" fill="${paper}"/><ellipse cy="7" rx="8" ry="6" fill="${paper}"/>
        <ellipse cy="5" rx="3.4" ry="2.4" fill="${ink}"/>`;
    case "back":
      return `<path d="M-6 16 C-30 2 -30 -16 -18 -19 C-11 -21 -6 -15 -6 -11 C-6 -15 -1 -21 6 -19 C18 -16 18 2 -6 16 Z" fill="none" stroke="${ink}" stroke-width="4"/>
        <path d="M6 24 C-18 10 -18 -8 -6 -11 C1 -13 6 -7 6 -3 C6 -7 11 -13 18 -11 C30 -8 30 10 6 24 Z" fill="${ink}"/>`;
    case "twirl":
      return `<path d="M0 0 C 4 -4 10 0 8 6 C 5 13 -6 13 -10 5 C -15 -6 -5 -18 8 -16 C 22 -13 26 4 18 15 C 8 28 -14 26 -22 13" fill="none" stroke="${ink}" stroke-width="5" stroke-linecap="round"/>
        <path d="M22 -22 l2.4 5 5 2.4 -5 2.4 -2.4 5 -2.4 -5 -5 -2.4 5 -2.4 Z" fill="${ink}"/>`;
    case "pat":
      return `<ellipse cy="9" rx="15" ry="12" fill="${ink}"/><ellipse cx="-17" cy="-6" rx="6" ry="7.5" fill="${ink}"/><ellipse cx="-6" cy="-16" rx="6" ry="7.5" fill="${ink}"/>
        <ellipse cx="6" cy="-16" rx="6" ry="7.5" fill="${ink}"/><ellipse cx="17" cy="-6" rx="6" ry="7.5" fill="${ink}"/>`;
    case "far":
      return `<path d="M-26 4 L22 -14 C28 -16 31 -10 26 -7 L12 2 L4 22 L-2 22 L2 6 L-12 10 L-16 18 L-21 18 L-19 6 Z" fill="${ink}"/>
        <path d="M18 18 C10 13 10 8 13 7 C15 6.5 17 8 17 9.5 C17 8 19 6.5 21 7 C24 8 24 13 18 18 Z" fill="${ink}"/>`;
    case "forever":
      return `<path d="M-20 -10 L-20 -26 L-10 -17 L0 -29 L10 -17 L20 -26 L20 -10 Z" fill="${ink}"/>
        <path d="M0 26 C-28 10 -28 -8 -14 -10 C-7 -11 -1 -6 0 -2 C1 -6 7 -11 14 -10 C28 -8 28 10 0 26 Z" fill="${ink}"/>`;
  }
}

/** A worn-ink mask: a white field with seeded pin-holes. */
function wear(id: string, salt: number): string {
  let holes = "";
  for (let i = 0; i < 46; i++) {
    const x = 6 + rand(i, salt) * 188;
    const y = 6 + rand(i, salt + 3) * 188;
    const r = 0.8 + rand(i, salt + 7) * 2.6;
    holes += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}" fill="#000" opacity="${(0.45 + rand(i, salt + 9) * 0.55).toFixed(2)}"/>`;
  }
  return `<mask id="${id}-w" maskUnits="userSpaceOnUse" x="0" y="0" width="200" height="200"><rect width="200" height="200" fill="#fff"/>${holes}</mask>`;
}

/**
 * The stamp as SVG markup (viewBox 0 0 200 200). `uid` keeps the mask/path ids unique when several are inline on one
 * page. `date` is the small print ("12 FEB"); `top` overrides the label (the Forever stamp carries her title).
 */
export function stampSvg(kind: StampKind, o: { uid: string; date: string; top?: string; standalone?: boolean }): string {
  const s = STAMP[kind];
  const ink = s.ink;
  const id = `hps-${o.uid}`;
  const salt = ALL_SALT[kind];
  const label = esc((o.top ?? s.short).toUpperCase());
  const date = esc(o.date.toUpperCase());
  const ns = o.standalone ? ` xmlns="http://www.w3.org/2000/svg"` : "";
  const text = (body: string, size: number, extra = "") =>
    `<text fill="${ink}" font-family="${FONT}" font-weight="700" font-size="${size}" letter-spacing="1.5" text-anchor="middle"${extra}>${body}</text>`;
  const ico = (scale: number, y = 0) => `<g transform="translate(100 ${100 + y}) scale(${scale})">${icon(kind, ink)}</g>`;
  let body = "";
  if (kind === "bear" || kind === "forever") {
    const big = kind === "forever";
    body = `<path id="${id}-t" d="M 30 100 A 70 70 0 0 1 170 100" fill="none"/><path id="${id}-b" d="M 24 100 A 76 76 0 0 0 176 100" fill="none"/>
      <circle cx="100" cy="100" r="92" fill="none" stroke="${ink}" stroke-width="${big ? 8 : 7}"/>
      <circle cx="100" cy="100" r="${big ? 80 : 78}" fill="none" stroke="${ink}" stroke-width="2.5"${big ? ` stroke-dasharray="4 5"` : ""}/>
      ${text(`<textPath href="#${id}-t" startOffset="50%">${label}</textPath>`, label.length > 12 ? 15 : 18)}
      ${text(`<textPath href="#${id}-b" startOffset="50%">✓ ${date} ✓</textPath>`, 14, ` dominant-baseline="hanging"`)}
      ${ico(big ? 1.45 : 1.3)}`;
  } else if (kind === "twirl") {
    let scallop = "";
    let cPrev: string[] = [];
    const n = 18;
    for (let i = 0; i <= n; i++) {
      const a = (i / n) * Math.PI * 2 - Math.PI / 2;
      const a2 = ((i + 0.5) / n) * Math.PI * 2 - Math.PI / 2;
      const p = [100 + Math.cos(a) * 86, 100 + Math.sin(a) * 86];
      const c = [100 + Math.cos(a2) * 98, 100 + Math.sin(a2) * 98];
      scallop += i === 0 ? `M${p[0].toFixed(1)} ${p[1].toFixed(1)}` : ` Q${cPrev.join(" ")} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`;
      cPrev = [c[0].toFixed(1), c[1].toFixed(1)];
    }
    body = `<path d="${scallop} Z" fill="none" stroke="${ink}" stroke-width="6" stroke-linejoin="round"/>
      <circle cx="100" cy="100" r="70" fill="none" stroke="${ink}" stroke-width="2.5"/>
      <path id="${id}-t" d="M 42 100 A 58 58 0 0 1 158 100" fill="none"/>
      ${text(`<textPath href="#${id}-t" startOffset="50%">${label}</textPath>`, 15)}
      ${ico(1.05, 8)}
      ${text(date, 13, ` x="100" y="160"`)}`;
  } else if (kind === "pat") {
    body = `<path d="M100 180 C 18 128 6 70 40 44 C 64 26 92 40 100 62 C 108 40 136 26 160 44 C 194 70 182 128 100 180 Z" fill="none" stroke="${ink}" stroke-width="7" stroke-linejoin="round"/>
      <path d="M100 166 C 32 122 22 74 48 54 C 68 40 90 52 100 72 C 110 52 132 40 152 54 C 178 74 168 122 100 166 Z" fill="none" stroke="${ink}" stroke-width="2.4" stroke-dasharray="5 4"/>
      ${text(label, 14, ` x="100" y="92"`)}
      ${ico(0.9, 26)}
      ${text(date, 11, ` x="100" y="152"`)}`;
  } else {
    // back + far: a rectangle (far is an airmail label with striped edges)
    const airmail = kind === "far";
    let stripes = "";
    if (airmail) {
      for (let i = 0; i < 14; i++) {
        const x = 14 + i * 13;
        stripes += `<path d="M${x} 32 l8 0 l-6 10 l-8 0 Z M${x} 158 l8 0 l-6 10 l-8 0 Z" fill="${i % 2 ? "#E0603F" : ink}"/>`;
      }
    }
    body = `<rect x="10" y="30" width="180" height="140" rx="${airmail ? 10 : 18}" fill="none" stroke="${ink}" stroke-width="7"/>
      <rect x="22" y="${airmail ? 46 : 42}" width="156" height="${airmail ? 108 : 116}" rx="${airmail ? 4 : 10}" fill="none" stroke="${ink}" stroke-width="2.4"/>
      ${stripes}
      ${text(label, label.length > 11 ? 15 : 18, ` x="100" y="${airmail ? 72 : 68}"`)}
      ${ico(airmail ? 0.95 : 1.05, airmail ? 10 : 8)}
      ${text(airmail ? `BY HUG MAIL · ${date}` : `✓ ${date}`, 12, ` x="100" y="${airmail ? 146 : 150}"`)}`;
  }
  return `<svg${ns} viewBox="0 0 200 200" width="100%" height="100%"><defs>${wear(id, salt)}</defs><g mask="url(#${id}-w)" opacity=".92">${body}</g></svg>`;
}
const ALL_SALT: Record<StampKind, number> = { bear: 3, back: 5, twirl: 7, pat: 11, far: 13, forever: 17 };

/** For the keepsake canvas: the stamp as a data: URL (system fonts stand in for Fredoka there). */
export function stampDataUrl(kind: StampKind, date: string, top?: string): string {
  const svg = stampSvg(kind, { uid: `k-${kind}`, date, top, standalone: true }).replace(/var\(--font-fredoka\), /g, "");
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
