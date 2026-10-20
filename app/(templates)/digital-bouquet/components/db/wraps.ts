// The bouquet's wrapping paper, drawn in code (replaces the flat cone images).
//
// A florist's wrap is several square sheets folded on the diagonal and fanned
// behind the flowers (their corners make the pointed silhouette), a ruffle of
// sheer tissue inside, and two front flaps crossed over the stems with their
// top edges turned back. Each paper is one recipe of colours + a surface
// (kraft fibres, newsprint columns, a pearl sheen, tissue crinkle).
//
// Same 600×760 frame as the rest of the pack: the stems converge on (300, 730)
// and the ribbon's knot sits at (300, 598), so the cone's waist is there.
// This is the SOURCE of the papers, not what the page loads: the filters take
// seconds to rasterise, so scripts/render-bouquet-wraps.mts renders them once
// to WebP (assets.ts WRAP_FILE) and the page, keepsake and link preview load
// those like the rest of the art.

import type { DbWrap } from "../../../_valentine/days/digital-bouquet";

interface Paper {
  /** Outer sheets: light → dark (top → bottom of the cone). */
  hi: string;
  mid: string;
  lo: string;
  /** The turned-back rim (the paper's reverse side). */
  rim: string;
  /** The inside ruffle. */
  inner: string;
  innerEdge: string;
  innerOpacity: number;
  /** Crease shading strength 0–1. */
  crease: number;
  surface: "tissue" | "kraft" | "news" | "pearl";
}

const PAPERS: Record<DbWrap, Paper> = {
  tissue: { hi: "#FCE1E8", mid: "#F5C1CE", lo: "#E79AAF", rim: "#FFF1F4", inner: "#FFFFFF", innerEdge: "#F6CFD9", innerOpacity: 0.86, crease: 0.9, surface: "tissue" },
  kraft: { hi: "#E3C49D", mid: "#CDA478", lo: "#A87C51", rim: "#EBD3B2", inner: "#FFF7EC", innerEdge: "#E8D6BC", innerOpacity: 0.95, crease: 1, surface: "kraft" },
  newspaper: { hi: "#F4EFE4", mid: "#E9E2D3", lo: "#CFC6B3", rim: "#FBF8F1", inner: "#F7D5DE", innerEdge: "#E7AFBF", innerOpacity: 0.95, crease: 0.8, surface: "news" },
  pearl: { hi: "#FFFFFF", mid: "#F7F1F3", lo: "#E4D8E0", rim: "#FFFFFF", inner: "#FBE9EF", innerEdge: "#EBCAD6", innerOpacity: 0.9, crease: 0.7, surface: "pearl" },
};

const APEX = { x: 300, y: 748 };

/** Pleat lines fanning out of the apex towards a top edge. */
function creases(id: string, from: [number, number], to: [number, number], n: number, k: number, bend: number) {
  let out = "";
  for (let i = 1; i < n; i++) {
    const t = i / n + (((i * 37) % 11) - 5) / 260;
    const x = from[0] + (to[0] - from[0]) * t;
    const y = from[1] + (to[1] - from[1]) * t;
    const cx = (APEX.x + x) / 2 + bend * (i % 2 ? 1 : -1);
    const cy = (APEX.y + y) / 2;
    const d = `M${APEX.x},${APEX.y} Q${cx.toFixed(1)},${cy.toFixed(1)} ${x.toFixed(1)},${y.toFixed(1)}`;
    // A crease is a dark valley next to a light ridge.
    out += `<path d="${d}" stroke="#3A1A12" stroke-opacity="${(0.07 * k).toFixed(3)}" stroke-width="3.2" fill="none" filter="url(#${id}-soft)"/>`;
    out += `<path d="${d}" transform="translate(2.2 0)" stroke="#FFFFFF" stroke-opacity="${(0.32 * k).toFixed(3)}" stroke-width="1.4" fill="none"/>`;
  }
  return out;
}

function defs(id: string, p: Paper) {
  const surf =
    p.surface === "kraft"
      ? `<filter id="${id}-tex" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.9 0.035" numOctaves="3" seed="7" result="n"/><feColorMatrix in="n" type="matrix" values="0 0 0 0 0.36  0 0 0 0 0.22  0 0 0 0 0.1  0 0 0 0.9 -0.32" result="c"/><feComposite in="c" in2="SourceGraphic" operator="in" result="f"/><feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="2" seed="3" result="m"/><feColorMatrix in="m" type="matrix" values="0 0 0 0 0.4  0 0 0 0 0.26  0 0 0 0 0.12  0 0 0 0.45 -0.12" result="mc"/><feComposite in="mc" in2="SourceGraphic" operator="in" result="mi"/><feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="mi"/><feMergeNode in="f"/></feMerge></filter>`
      : p.surface === "tissue"
        ? `<filter id="${id}-tex" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.035 0.05" numOctaves="3" seed="11" result="n"/><feColorMatrix in="n" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.75 -0.36" result="c"/><feComposite in="c" in2="SourceGraphic" operator="in" result="f"/><feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="f"/></feMerge></filter>`
        : `<filter id="${id}-tex" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="2" seed="5" result="n"/><feColorMatrix in="n" type="matrix" values="0 0 0 0 0.5  0 0 0 0 0.46  0 0 0 0 0.4  0 0 0 0.22 -0.06" result="c"/><feComposite in="c" in2="SourceGraphic" operator="in" result="f"/><feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="f"/></feMerge></filter>`;
  const news =
    p.surface === "news"
      ? `<pattern id="${id}-print" width="96" height="120" patternUnits="userSpaceOnUse" patternTransform="rotate(-9)"><rect x="4" y="6" width="58" height="9" fill="#2E2A25" opacity=".55"/>${Array.from({ length: 12 }, (_, r) => `<rect x="4" y="${22 + r * 8}" width="${r % 5 === 4 ? 26 : 40}" height="2.6" fill="#3A352E" opacity=".34"/><rect x="50" y="${22 + r * 8}" width="${r % 4 === 3 ? 22 : 40}" height="2.6" fill="#3A352E" opacity=".34"/>`).join("")}</pattern>`
      : "";
  const pearl =
    p.surface === "pearl"
      ? `<linearGradient id="${id}-iri" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFD9E6" stop-opacity=".55"/><stop offset=".3" stop-color="#E6DCFF" stop-opacity=".45"/><stop offset=".55" stop-color="#D9F4EE" stop-opacity=".4"/><stop offset=".8" stop-color="#FFF0D6" stop-opacity=".45"/><stop offset="1" stop-color="#FFD9E6" stop-opacity=".5"/></linearGradient>`
      : "";
  return `<defs>
<linearGradient id="${id}-v" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p.hi}"/><stop offset=".55" stop-color="${p.mid}"/><stop offset="1" stop-color="${p.lo}"/></linearGradient>
<linearGradient id="${id}-hL" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#3A1A12" stop-opacity=".2"/><stop offset=".45" stop-color="#FFFFFF" stop-opacity=".16"/><stop offset=".8" stop-color="#FFFFFF" stop-opacity="0"/><stop offset="1" stop-color="#3A1A12" stop-opacity=".1"/></linearGradient>
<linearGradient id="${id}-hR" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stop-color="#3A1A12" stop-opacity=".24"/><stop offset=".5" stop-color="#FFFFFF" stop-opacity=".1"/><stop offset="1" stop-color="#3A1A12" stop-opacity=".06"/></linearGradient>
<linearGradient id="${id}-rim" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF" stop-opacity=".9"/><stop offset=".5" stop-color="${p.rim}"/><stop offset="1" stop-color="${p.mid}"/></linearGradient>
<linearGradient id="${id}-in" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p.inner}" stop-opacity="${p.innerOpacity}"/><stop offset="1" stop-color="${p.innerEdge}" stop-opacity="${p.innerOpacity}"/></linearGradient>
<linearGradient id="${id}-gap" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3A1A12" stop-opacity=".3"/><stop offset="1" stop-color="#3A1A12" stop-opacity="0"/></linearGradient>
<filter id="${id}-soft" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="1.6"/></filter>
<filter id="${id}-shadow" x="-10%" y="-10%" width="120%" height="120%"><feDropShadow dx="0" dy="3" stdDeviation="5" flood-color="#3A1A12" flood-opacity=".22"/></filter>
${surf}${news}${pearl}
</defs>`;
}

/** Fill one sheet: base colour, surface, side shading, (newsprint / pearl). */
function sheet(id: string, p: Paper, d: string, side: "L" | "R", extra = "") {
  const clip = `${id}-c${Math.abs(hash(d))}`;
  return `<g filter="url(#${id}-shadow)"><clipPath id="${clip}"><path d="${d}"/></clipPath>
<path d="${d}" fill="url(#${id}-v)" filter="url(#${id}-tex)"/>
<g clip-path="url(#${clip})">
${p.surface === "news" ? `<rect x="0" y="0" width="600" height="760" fill="url(#${id}-print)"/>` : ""}
${p.surface === "pearl" ? `<rect x="0" y="0" width="600" height="760" fill="url(#${id}-iri)"/>` : ""}
<rect x="0" y="0" width="600" height="760" fill="url(#${id}-h${side})"/>
${extra}
</g>
<path d="${d}" fill="none" stroke="#FFFFFF" stroke-opacity=".55" stroke-width="1.6"/>
<path d="${d}" fill="none" stroke="#3A1A12" stroke-opacity=".08" stroke-width="1"/></g>`;
}

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return h;
}

/** A soft-cornered sheet outline through points (rounded at every corner). */
function soft(pts: [number, number][], r = 0.18) {
  const n = pts.length;
  let d = "";
  for (let i = 0; i < n; i++) {
    const [x, y] = pts[i];
    const [px, py] = pts[(i - 1 + n) % n];
    const [nx, ny] = pts[(i + 1) % n];
    const a = [x + (px - x) * r, y + (py - y) * r];
    const b = [x + (nx - x) * r, y + (ny - y) * r];
    d += `${i ? " L" : "M"}${a[0].toFixed(1)},${a[1].toFixed(1)} Q${x},${y} ${b[0].toFixed(1)},${b[1].toFixed(1)}`;
  }
  return `${d} Z`;
}

function back(kind: DbWrap) {
  const p = PAPERS[kind];
  const id = `wb${kind}`;
  // Three square sheets folded on the diagonal and fanned: their corners make
  // the pointed silhouette behind the flowers.
  const L = soft([[300, 748], [26, 300], [70, 118], [272, 150]], 0.08);
  const R = soft([[300, 748], [328, 150], [530, 118], [574, 300]], 0.08);
  const C = soft([[300, 748], [140, 170], [300, 18], [460, 170]], 0.08);
  // Two crumpled sheets of sheer tissue inside, corners up.
  const I1 = soft([[300, 700], [60, 300], [128, 196], [236, 224], [318, 150], [356, 236]], 0.22);
  const I2 = soft([[300, 700], [244, 240], [290, 172], [394, 214], [470, 170], [540, 300]], 0.22);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 760" width="600" height="760">${defs(id, p)}
${sheet(id, p, C, "L", creases(id, [150, 168], [450, 168], 4, p.crease, 22))}
${sheet(id, p, L, "L", creases(id, [30, 290], [268, 152], 3, p.crease, 16))}
${sheet(id, p, R, "R", creases(id, [332, 152], [570, 290], 3, p.crease, 16))}
<g filter="url(#${id}-shadow)" opacity=".92"><path d="${I1}" fill="url(#${id}-in)"/>${creases(id, [70, 290], [330, 160], 4, p.crease * 0.5, 14)}<path d="${I1}" fill="none" stroke="${p.innerEdge}" stroke-width="1.2"/></g>
<g filter="url(#${id}-shadow)" opacity=".92"><path d="${I2}" fill="url(#${id}-in)"/>${creases(id, [260, 220], [532, 292], 4, p.crease * 0.5, 14)}<path d="${I2}" fill="none" stroke="${p.innerEdge}" stroke-width="1.2"/></g>
</svg>`;
}

function front(kind: DbWrap) {
  const p = PAPERS[kind];
  const id = `wf${kind}`;
  // Two flaps crossed diagonally over the stems, the left one on top. Each top
  // edge is turned back as a thin lighter band (the paper's other side).
  const Rf = `M300,748 L196,446 Q380,372 578,352 Z`;
  const Lf = `M306,748 L22,352 Q220,372 408,446 Z`;
  const rimR = `M196,446 Q380,372 578,352 L574,368 Q384,390 206,458 Z`;
  const rimL = `M22,352 Q220,372 408,446 L398,458 Q216,388 28,368 Z`;
  // The sheer tissue peeking over the flaps.
  const T = soft([[300, 700], [70, 380], [168, 330], [300, 372], [432, 330], [530, 380]], 0.25);
  // Gathered pleats at the waist, under the ribbon.
  let pleats = "";
  for (let i = 0; i < 7; i++) {
    const x = 270 + i * 10;
    pleats += `<path d="M${x},${560 + (i % 2) * 8} Q${300 + (x - 300) * 0.4},640 300,744" fill="none" stroke="#3A1A12" stroke-opacity=".1" stroke-width="2" filter="url(#${id}-soft)"/>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 760" width="600" height="760">${defs(id, p)}
<path d="${T}" fill="url(#${id}-in)" opacity=".85"/>
${sheet(id, p, Rf, "R", `${creases(id, [210, 440], [570, 356], 4, p.crease, 12)}<path d="M196,446 Q380,372 578,352 L578,420 Q380,430 200,500 Z" fill="url(#${id}-gap)"/>`)}
<path d="${rimR}" fill="url(#${id}-rim)"/>
<path d="M206,458 Q384,390 574,368" fill="none" stroke="#3A1A12" stroke-opacity=".13" stroke-width="1.6"/>
${sheet(id, p, Lf, "L", `${creases(id, [28, 356], [400, 444], 4, p.crease, 12)}<path d="M22,352 Q220,372 408,446 L404,500 Q216,430 22,420 Z" fill="url(#${id}-gap)"/>${pleats}`)}
<path d="${rimL}" fill="url(#${id}-rim)"/>
<path d="M28,368 Q216,388 398,458" fill="none" stroke="#3A1A12" stroke-opacity=".13" stroke-width="1.6"/>
</svg>`;
}

const CACHE = new Map<string, string>();

/**
 * The wrap's back (behind the stems) or front (over them) as a data: URI.
 * `scale` sets the intrinsic size (the canvas keepsake draws it at 1.6×).
 */
export function wrapSrc(kind: DbWrap, part: "back" | "front", scale = 1): string {
  const key = `${kind}-${part}-${scale}`;
  let v = CACHE.get(key);
  if (!v) {
    const k = (PAPERS[kind] ? kind : "tissue") as DbWrap;
    const svg = (part === "back" ? back(k) : front(k)).replace(/\n/g, "").replace('width="600" height="760"', `width="${Math.round(600 * scale)}" height="${Math.round(760 * scale)}"`);
    v = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    CACHE.set(key, v);
  }
  return v;
}
