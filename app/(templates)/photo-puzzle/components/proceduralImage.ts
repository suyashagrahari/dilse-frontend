// ─── The default photograph ──────────────────────────────────────────────────
//
// The demo ships with `imageUrl: ""`, so this is not a fallback — it is what
// everyone browsing the gallery actually assembles. It has to look like a
// deliberate piece of art direction, because a twelve-piece jigsaw of a grey
// placeholder is a worse advert than no jigsaw at all.
//
// What it draws: a dusk gradient, a low sun, three ridgelines receding into
// haze, a scatter of birds and a grain pass. Everything is seeded, so the same
// puzzle shows the same picture on every device and after every refresh.

import { rngFrom } from "@/lib/seededRandom";

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Blend two hex colours in sRGB. Good enough, and no allocation per pixel. */
function mix(a: string, b: string, t: number): string {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  const c = pa.map((v, i) => Math.round(lerp(v, pb[i], t)));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
}

/** Five dusk palettes. The seed picks one, so different puzzles differ. */
const PALETTES: { sky: [string, string]; sun: string; ridge: [string, string] }[] = [
  { sky: ["#2A1B4E", "#F5A65B"], sun: "#FFD9A0", ridge: ["#1B1233", "#7C5C9E"] },
  { sky: ["#12304F", "#F0836B"], sun: "#FFE0B2", ridge: ["#0B1B2E", "#5C7FA8"] },
  { sky: ["#3B1F3D", "#FFB37B"], sun: "#FFE9C7", ridge: ["#241428", "#8E5F86"] },
  { sky: ["#16323A", "#EFC27B"], sun: "#FFF2CF", ridge: ["#0D2027", "#4E8079"] },
  { sky: ["#2E1A2F", "#E98A7A"], sun: "#FFD7BE", ridge: ["#1A0F1C", "#7A5470"] },
];

/**
 * Paints a pleasant, seeded, entirely procedural image filling `w`×`h`.
 * Deterministic in `seed` — never `Math.random()`.
 */
export function drawProceduralImage(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  seed: string,
): void {
  const rand = rngFrom(`procedural:${seed}`);
  const pal = PALETTES[Math.floor(rand() * PALETTES.length) % PALETTES.length];

  // ── Sky ──
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, pal.sky[0]);
  sky.addColorStop(0.62, mix(pal.sky[0], pal.sky[1], 0.72));
  sky.addColorStop(1, pal.sky[1]);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  // ── Sun, low and slightly off-centre ──
  const sunX = w * lerp(0.28, 0.72, rand());
  const sunY = h * lerp(0.52, 0.62, rand());
  const sunR = Math.min(w, h) * 0.085;

  const glow = ctx.createRadialGradient(sunX, sunY, sunR * 0.4, sunX, sunY, sunR * 7);
  glow.addColorStop(0, "rgba(255,225,175,0.55)");
  glow.addColorStop(0.45, "rgba(255,200,150,0.16)");
  glow.addColorStop(1, "rgba(255,200,150,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = pal.sun;
  ctx.beginPath();
  ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2);
  ctx.fill();

  // ── Three ridgelines, nearest last, each hazier than the one behind it ──
  //
  // A ridge is a sampled sine sum rather than random points: random points give
  // a jagged sawtooth, sine sums give something that reads as landscape.
  const ridges = 3;
  for (let r = 0; r < ridges; r++) {
    const depth = r / (ridges - 1); // 0 = far, 1 = near
    const baseY = h * lerp(0.6, 0.9, depth);
    const amp = h * lerp(0.05, 0.13, depth);
    const colour = mix(pal.ridge[1], pal.ridge[0], depth);

    const f1 = lerp(1.1, 2.4, rand());
    const f2 = lerp(2.6, 5.2, rand());
    const p1 = rand() * Math.PI * 2;
    const p2 = rand() * Math.PI * 2;

    ctx.beginPath();
    ctx.moveTo(0, h);
    const step = Math.max(2, Math.round(w / 160));
    for (let x = 0; x <= w; x += step) {
      const t = x / w;
      const y =
        baseY -
        Math.sin(t * Math.PI * f1 + p1) * amp -
        Math.sin(t * Math.PI * f2 + p2) * amp * 0.34;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w, h);
    ctx.closePath();

    ctx.globalAlpha = lerp(0.62, 1, depth);
    ctx.fillStyle = colour;
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  // ── Birds. Three or four, small, high, in loose formation ──
  const birds = 3 + Math.floor(rand() * 2);
  ctx.strokeStyle = "rgba(20,16,32,0.44)";
  ctx.lineWidth = Math.max(1, Math.min(w, h) * 0.0035);
  ctx.lineCap = "round";
  const flockX = w * lerp(0.12, 0.6, rand());
  const flockY = h * lerp(0.14, 0.32, rand());
  for (let i = 0; i < birds; i++) {
    const bx = flockX + i * w * 0.055 + (rand() - 0.5) * w * 0.03;
    const by = flockY + (rand() - 0.5) * h * 0.06;
    const s = Math.min(w, h) * lerp(0.012, 0.02, rand());
    ctx.beginPath();
    ctx.moveTo(bx - s, by);
    ctx.quadraticCurveTo(bx - s * 0.4, by - s * 0.62, bx, by - s * 0.1);
    ctx.quadraticCurveTo(bx + s * 0.4, by - s * 0.62, bx + s, by);
    ctx.stroke();
  }

  // ── Grain. Sparse, and the reason it does not read as vector art ──
  const grains = Math.round((w * h) / 900);
  for (let i = 0; i < grains; i++) {
    const gx = rand() * w;
    const gy = rand() * h;
    const a = rand() * 0.05;
    ctx.fillStyle = rand() < 0.5 ? `rgba(255,255,255,${a})` : `rgba(0,0,0,${a})`;
    ctx.fillRect(gx, gy, 1.4, 1.4);
  }

  // ── Vignette, so the outer pieces are not the flattest ones ──
  const vig = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.32, w / 2, h / 2, Math.max(w, h) * 0.78);
  vig.addColorStop(0, "rgba(0,0,0,0)");
  vig.addColorStop(1, "rgba(0,0,0,0.24)");
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, w, h);
}
