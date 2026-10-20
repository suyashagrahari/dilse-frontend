// The link preview (WhatsApp, iMessage, X) of ONE sent Digital Bouquet: the
// bouquet exactly as the sender arranged it — the same stems, the same
// placement maths (components/db/assets.ts), the same wrap, ribbon, charms and
// gift tag — so the preview, the page and the studio all show one bouquet.
//
//   /api/og-bouquet?id=<shareId>            (a bare-domain link)
//   /api/og-bouquet?u=<username>&id=<shareId> (a username link)
//
// A page with a password, a sealed page or anything that is not a bouquet gets
// the template's generic preview instead: a locked page never shows what is
// inside in a link preview. Images are PNG at 1200×630.

import { ImageResponse } from "next/og";
import sharp from "sharp";
import type { NextRequest } from "next/server";
import { API_URL, SITE_URL } from "@/lib/config";
import { DB_TONES, DEMO_STEMS, FLOWER_BY_ID, type DbCharm, type DbStem, type FlowerId } from "@/app/(templates)/_valentine/days/digital-bouquet";
import { CHARM_ART, FRAME, GREEN_ART, RIBBON_ART, RIBBON_FILE, STEM_ART, WRAP_FILE, greensFor, headOf, media, placeStem, type StemArt } from "@/app/(templates)/digital-bouquet/components/db/assets";
import { paintOrder, readBouquet } from "@/app/(templates)/digital-bouquet/components/db/model";

export const runtime = "nodejs";

const SIZE = { width: 1200, height: 630 };
/** Where the composed bouquet sits in the 1200×630 card. */
const PIC_H = 612;

const generic = (recipient: string, sender: string) =>
  `${SITE_URL}/api/og?type=digital-bouquet&recipient=${encodeURIComponent(recipient)}&sender=${encodeURIComponent(sender)}`;

interface ShareResponse {
  success?: boolean;
  templateType?: string;
  hasPassword?: boolean;
  data?: { recipientName?: string; senderName?: string; petName?: string; locked?: boolean; extras?: Record<string, unknown> };
}

async function fetchPage(u: string, id: string): Promise<ShareResponse | null> {
  try {
    // Same URL + options as the share page's metadata fetch, so this is served
    // from the same cache entry (no second view counted).
    const url = u ? `${API_URL}/share/u/${encodeURIComponent(u)}/${id}` : `${API_URL}/share/${id}`;
    const res = await fetch(url, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return (await res.json()) as ShareResponse;
  } catch {
    return null;
  }
}

/** Frame px the composed picture extends past the 600×760 frame (stems lean out of it on the page too). */
const PAD = { x: 120, top: 120 };
const CANVAS = { w: FRAME.w + PAD.x * 2, h: FRAME.h + PAD.top };

const ART = new Map<string, Promise<Buffer | null>>();
/** A pack image (WebP, the same file the page shows), fetched once per process. */
function art(file: string): Promise<Buffer | null> {
  let p = ART.get(file);
  if (!p) {
    p = fetch(media(`${file}.webp`))
      .then(async (r) => (r.ok ? Buffer.from(await r.arrayBuffer()) : null))
      .catch(() => null);
    ART.set(file, p);
    void p.then((b) => b || ART.delete(file));
  }
  return p;
}

type Layer = { input: Buffer; left: number; top: number; raw?: { width: number; height: number; channels: 4 } };
const STEMS = new Map<string, Promise<{ data: Buffer; info: sharp.OutputInfo }>>();

/** One stem image placed exactly like <Bouquet>'s Stem: its box, rotated about its base. */
async function stemLayer(a: StemArt, hx: number, hy: number, scale: number, tilt: number): Promise<Layer | null> {
  const src = await art(a.file);
  if (!src) return null;
  const p = placeStem(a, hx, hy, scale, tilt);
  const w = Math.max(1, Math.round(p.w));
  const h = Math.max(1, Math.round(p.h));
  const key = `${a.file}|${w}|${h}|${p.deg.toFixed(1)}`;
  let made = STEMS.get(key);
  if (!made) {
    made = sharp(src).resize(w, h, { fit: "fill" }).rotate(p.deg, { background: { r: 0, g: 0, b: 0, alpha: 0 } }).raw().toBuffer({ resolveWithObject: true });
    STEMS.set(key, made);
    if (STEMS.size > 600) STEMS.delete(STEMS.keys().next().value as string);
  }
  const { data, info } = await made;
  // Rotating about the base: the box's centre ends up at base − R·(base − centre).
  const t = (p.deg * Math.PI) / 180;
  const ox = p.ax - (p.left + w / 2);
  const oy = p.ay - (p.top + h / 2);
  const cx = p.ax - (ox * Math.cos(t) - oy * Math.sin(t));
  const cy = p.ay - (ox * Math.sin(t) + oy * Math.cos(t));
  return { input: data, raw: { width: info.width, height: info.height, channels: 4 }, left: Math.round(cx - info.width / 2 + PAD.x), top: Math.round(cy - info.height / 2 + PAD.top) };
}

async function flat(file: string, x: number, y: number, w: number): Promise<Layer | null> {
  const src = await art(file);
  if (!src) return null;
  return { input: await sharp(src).resize(Math.round(w)).png().toBuffer(), left: Math.round(x + PAD.x), top: Math.round(y + PAD.top) };
}

/** Small LRU of finished cards, keyed by everything they show. */
const CARDS = new Map<string, Buffer>();
function remember(key: string, png: Buffer) {
  CARDS.delete(key);
  CARDS.set(key, png);
  while (CARDS.size > 120) CARDS.delete(CARDS.keys().next().value as string);
}

/** The bouquet, back to front in <Bouquet>'s order, as one PNG of `outW`×`outH`. */
async function composeBouquet(bq: ReturnType<typeof readBouquet>, stems: DbStem[], outW: number, outH: number): Promise<Buffer> {
  const rib = RIBBON_FILE[bq.ribbon] ?? RIBBON_FILE.rose;
  const charmAt: Record<DbCharm, { x: number; y: number }> = { heart: FRAME.charm, teddy: { x: 266, y: 606 }, butterfly: { x: 356, y: 600 } };
  const layers = await Promise.all<Layer | null>([
    flat(`${WRAP_FILE[bq.wrap] ?? WRAP_FILE.tissue}-back`, 0, 0, FRAME.w),
    ...greensFor(bq.greenery).map((g) => stemLayer(GREEN_ART[g.id], g.x, g.y, g.scale, 0)),
    ...paintOrder(stems).map((i) => {
      const s = stems[i];
      const h = headOf(s);
      return stemLayer(STEM_ART[s.flower as FlowerId], h.x, h.y, s.scale / 100, s.rot);
    }),
    flat(`${WRAP_FILE[bq.wrap] ?? WRAP_FILE.tissue}-front`, 0, 0, FRAME.w),
    flat(rib.file, FRAME.knot.x - RIBBON_ART.anchor.x * RIBBON_ART.w, FRAME.knot.y - RIBBON_ART.anchor.y * RIBBON_ART.h, RIBBON_ART.w),
    ...bq.charms.map((c) => {
      const a = CHARM_ART[c];
      return flat(a.file, charmAt[c].x - (a.w * a.scale) / 2, charmAt[c].y, a.w * a.scale);
    }),
  ]);
  return sharp({ create: { width: CANVAS.w, height: CANVAS.h, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite(layers.filter((l): l is Layer => !!l))
    .png()
    .toBuffer()
    .then((full) => sharp(full).resize(outW, outH).png().toBuffer());
}

export async function GET(req: NextRequest) {
  const q = new URL(req.url).searchParams;
  const u = (q.get("u") || "").slice(0, 64);
  const id = (q.get("id") || "").slice(0, 64);
  const demo = id === "demo";
  if (!demo && ((u && !/^[\w.-]+$/.test(u)) || !/^[\w-]+$/.test(id))) return Response.redirect(generic("You", "Someone special"), 302);

  const page = demo ? null : await fetchPage(u, id);
  const d = page?.data;
  if (!demo && (!page?.success || page.templateType !== "digital-bouquet" || page.hasPassword || !d || d.locked)) {
    return Response.redirect(generic(d?.recipientName || "You", d?.senderName || "Someone special"), 302);
  }

  const bq = readBouquet((d?.extras ?? {}) as Record<string, unknown>);
  const recipient = (d?.petName || d?.recipientName || "you").slice(0, 30);
  const sender = (d?.senderName || "someone who loves you").slice(0, 30);
  const stems = bq.stems.length >= 3 ? bq.stems : DEMO_STEMS;
  const tag = bq.giftTag || DB_TONES[bq.tone].tag;
  const k = PIC_H / CANVAS.h;
  const picW = Math.round(CANVAS.w * k);
  const picLeft = SIZE.width - picW - 10;
  const picTop = SIZE.height - PIC_H - 8;
  const cacheKey = JSON.stringify([recipient, sender, tag, bq.wrap, bq.ribbon, bq.greenery, bq.charms, stems]);
  const hit = CARDS.get(cacheKey);
  if (hit) return png(hit);
  const kinds = [...new Set(stems.map((s) => s.flower))].slice(0, 3).map((f) => FLOWER_BY_ID[f as FlowerId].name.toLowerCase());

  const card = new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", color: "#4A2231" }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", width: 620, padding: "0 0 0 80px" }}>
          <div style={{ fontSize: 22, letterSpacing: 4, color: "#AE2F57", fontWeight: 700 }}>A BOUQUET, ARRANGED FOR YOU</div>
          <div style={{ fontSize: 78, fontWeight: 700, lineHeight: 1.05, marginTop: 18 }}>{`For ${recipient}`}</div>
          <div style={{ fontSize: 30, lineHeight: 1.4, marginTop: 22, color: "#7D4E5F" }}>
            {`${sender} placed every stem by hand: ${kinds.join(", ")}${stems.length > 3 ? " and more" : ""}. Open it and watch it bloom.`}
          </div>
          <div style={{ display: "flex", marginTop: 34 }}>
            <div style={{ display: "flex", padding: "14px 30px", borderRadius: 99, background: "#D94A75", color: "#FFFFFF", fontSize: 28, fontWeight: 700 }}>Open your flowers</div>
          </div>
        </div>

        {tag && (
          <div
            style={{
              position: "absolute",
              left: picLeft + (392 + PAD.x) * k + 6,
              top: picTop + (606 + PAD.top) * k + 14,
              display: "flex",
              maxWidth: 200,
              padding: "6px 14px 6px 18px",
              borderRadius: "6px 16px 16px 6px",
              background: "#F2DFC2",
              color: "#4A3222",
              fontSize: 17,
              transform: "rotate(-8deg)",
              boxShadow: "0 4px 10px rgba(70,40,20,.3)",
            }}
          >
            {tag.slice(0, 40)}
          </div>
        )}
      </div>
    ),
    SIZE,
  );
  try {
    // Background → bouquet → the text card (with the gift tag) on top.
    const [text, bouquet] = await Promise.all([card.arrayBuffer().then((b) => Buffer.from(b)), composeBouquet(bq, stems, picW, PIC_H)]);
    const out = await sharp(BG)
      .composite([
        { input: bouquet, left: picLeft, top: picTop },
        { input: text, left: 0, top: 0 },
      ])
      .png({ compressionLevel: 8 })
      .toBuffer();
    remember(cacheKey, out);
    return png(out);
  } catch {
    return Response.redirect(generic(recipient, sender), 302);
  }
}

const BG = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE.width}" height="${SIZE.height}"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFF9F6"/><stop offset=".55" stop-color="#FFEFF3"/><stop offset="1" stop-color="#FCDDE6"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#g)"/></svg>`,
);

const png = (b: Buffer) =>
  new Response(new Uint8Array(b), { headers: { "Content-Type": "image/png", "Cache-Control": "public, max-age=300, s-maxage=3600" } });
