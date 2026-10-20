// Renders the Digital Bouquet wrapping papers (components/db/wraps.ts, drawn in
// code) to the WebP files the page, the keepsake and the link preview load:
//
//   <out>/wraps/paper-<kind>-<back|front>.webp      600×760
//   <out>/wraps/paper-<kind>-<back|front>@2x.webp   1200×1520
//
// The papers' SVG filters (fibres, crinkle, shadows) take seconds to rasterise,
// so they are rasterised once here instead of on every phone and every preview.
// After a change to wraps.ts: re-run, bump the file names (CDN objects are
// immutable) and upload to s3://subhsandesh-prod/gifts-media/templates/digital-bouquet/.
//
//   npx tsx scripts/render-bouquet-wraps.mts ../media-src/templates/digital-bouquet

import { mkdirSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";
import { WRAP_FILE } from "../app/(templates)/digital-bouquet/components/db/assets";
import { wrapSrc } from "../app/(templates)/digital-bouquet/components/db/wraps";
import type { DbWrap } from "../app/(templates)/_valentine/days/digital-bouquet";

const out = process.argv[2];
if (!out) throw new Error("usage: render-bouquet-wraps.mts <media-src dir>");
mkdirSync(join(out, "wraps"), { recursive: true });

const svg = (kind: DbWrap, part: "back" | "front", scale: number) => {
  const u = wrapSrc(kind, part, scale);
  return Buffer.from(decodeURIComponent(u.slice(u.indexOf(",") + 1)));
};

for (const kind of Object.keys(WRAP_FILE) as DbWrap[]) {
  for (const part of ["back", "front"] as const) {
    const base = join(out, `${WRAP_FILE[kind]}-${part}`);
    await sharp(svg(kind, part, 2)).webp({ quality: 86, alphaQuality: 90, effort: 6 }).toFile(`${base}@2x.webp`);
    await sharp(svg(kind, part, 2)).resize(600, 760).webp({ quality: 86, alphaQuality: 90, effort: 6 }).toFile(`${base}.webp`);
    console.log("wrote", `${base}{,@2x}.webp`);
  }
}
