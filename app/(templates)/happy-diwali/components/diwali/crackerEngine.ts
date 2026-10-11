// The crackers playground's little physics engine (one 2D canvas, no deps).
//
// Five crackers, each its own emitter with its own motion:
//   anar      — a clay flower pot: a gold-white fountain that swells and dies down
//   chakri    — a ground spinner: whirls on the floor, throwing sparks off its rim
//   rocket    — climbs on a spark trail, bursts in a coloured peony + glitter
//   phuljhadi — a sparkler: the burning tip creeps down the wire, crackling streaks
//   pencil    — a colour pencil: pops six coloured stars up one after another
//
// Performance (60 fps on mid phones): particles live in typed arrays (struct of
// arrays, swap-remove, hard cap), they are drawn as rects batched per colour and
// alpha bucket (≈ 30 fills a frame whatever the count), glows are one cached
// sprite drawn with drawImage, the backing store is capped at 1.5× DPR, and the
// loop stops completely when nothing is burning. If frames run long the engine
// halves its emission on its own.

export type CrackerKind = "anar" | "chakri" | "rocket" | "phuljhadi" | "pencil";

const COLORS = [
  "#FFF6DC", // 0 white-gold
  "#FFCF5A", // 1 diya gold
  "#F6A821", // 2 deep gold
  "#FF8A1E", // 3 marigold
  "#FF4D3A", // 4 red
  "#FF5FA2", // 5 rani pink
  "#3FE0C5", // 6 peacock teal
  "#7CFF6B", // 7 chakri green
  "#B98CFF", // 8 violet
] as const;
const NC = COLORS.length;
const ALPHA = [0.35, 0.7, 1] as const;

const MAX = 900;
const F_STREAK = 1;
const F_TWINKLE = 2;
const F_STAR = 4;

interface Emitter {
  kind: CrackerKind;
  x: number;
  y: number;
  /** rocket: target height */
  ty: number;
  t: number;
  dur: number;
  /** chakri: spin angle; rocket: burst done */
  a: number;
  /** pencil: stars fired */
  n: number;
  /** two burst colours (rocket / pencil) */
  c1: number;
  c2: number;
  vx: number;
  done: boolean;
}

/** Outside any component: Math.random is fine here. */
const rnd = (a = 0, b = 1) => a + Math.random() * (b - a);
const pick = <T,>(xs: readonly T[]) => xs[Math.floor(Math.random() * xs.length)];

const FUSE = 0.32;
const DUR: Record<CrackerKind, number> = { anar: 2.8, chakri: 3.2, rocket: 3.2, phuljhadi: 3.8, pencil: 2.9 };

export interface EngineEvents {
  /** a rocket burst / a pencil star popped: for sound + haptics */
  onBoom?: (kind: CrackerKind, x: number, w: number) => void;
}

export interface CrackerEngine {
  place: (kind: CrackerKind, x: number, y: number, ty?: number) => void;
  resize: (w: number, h: number) => void;
  /** how many emitters are burning right now */
  active: () => number;
  destroy: () => void;
}

function glowSprite(): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  const rg = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  rg.addColorStop(0, "rgba(255,240,200,1)");
  rg.addColorStop(0.18, "rgba(255,207,90,.75)");
  rg.addColorStop(0.45, "rgba(246,140,33,.25)");
  rg.addColorStop(1, "rgba(200,40,20,0)");
  g.fillStyle = rg;
  g.fillRect(0, 0, 128, 128);
  return c;
}

export function createCrackerEngine(canvas: HTMLCanvasElement, ev: EngineEvents = {}): CrackerEngine {
  const ctx = canvas.getContext("2d", { alpha: true })!;
  const sprite = glowSprite();
  let W = 300;
  let H = 300;
  let dpr = Math.min(1.5, window.devicePixelRatio || 1);
  /** emission multiplier: drops to .55 when frames run long */
  let q = 1;

  // particles (struct of arrays)
  const px = new Float32Array(MAX);
  const py = new Float32Array(MAX);
  const vx = new Float32Array(MAX);
  const vy = new Float32Array(MAX);
  const life = new Float32Array(MAX);
  const max = new Float32Array(MAX);
  const grav = new Float32Array(MAX);
  const drag = new Float32Array(MAX);
  const size = new Float32Array(MAX);
  const col = new Uint8Array(MAX);
  const flags = new Uint8Array(MAX);
  const bk = new Uint8Array(MAX);
  let n = 0;

  const ems: Emitter[] = [];
  let flash = 0;
  let flashX = 0;
  let flashY = 0;
  let raf: number | null = null;
  let last = 0;
  let slow = 0;
  let destroyed = false;

  /** px/s scale so the show fits any box */
  const S = () => Math.max(0.7, Math.min(1.5, H / 620));

  function spawn(x: number, y: number, vxx: number, vyy: number, l: number, g: number, d: number, s: number, c: number, f = 0) {
    if (n >= MAX) return;
    px[n] = x;
    py[n] = y;
    vx[n] = vxx;
    vy[n] = vyy;
    life[n] = 0;
    max[n] = l;
    grav[n] = g;
    drag[n] = d;
    size[n] = s;
    col[n] = c;
    flags[n] = f;
    n++;
  }

  function burst(x: number, y: number, c1: number, c2: number) {
    const s = S();
    const k = Math.round(130 * q);
    const ring = Math.random() < 0.35;
    for (let i = 0; i < k; i++) {
      const a = (i / k) * Math.PI * 2 + rnd(-0.05, 0.05);
      // a peony: shells of sparks, a little faster ones streak
      const sp = (ring ? rnd(300, 330) : Math.sqrt(Math.random()) * 340 + 60) * s;
      spawn(x, y, Math.cos(a) * sp, Math.sin(a) * sp, rnd(1.2, 1.9), 120 * s, 1.5, rnd(2.2, 3.2), i % 3 === 0 ? c2 : c1, F_TWINKLE | (i % 2 ? F_STREAK : 0));
    }
    // a glitter core
    for (let i = 0; i < 26 * q; i++) {
      const a = rnd(0, Math.PI * 2);
      const sp = rnd(20, 110) * s;
      spawn(x, y, Math.cos(a) * sp, Math.sin(a) * sp, rnd(0.9, 1.6), 60 * s, 2.2, 1.5, 0, F_TWINKLE);
    }
    flash = 1;
    flashX = x;
    flashY = y;
    ev.onBoom?.("rocket", x, W);
  }

  function step(e: Emitter, dt: number) {
    e.t += dt;
    const s = S();
    const t = e.t - FUSE;
    if (t < 0) {
      // the fuse fizzing
      if (Math.random() < 0.6) spawn(e.x + rnd(-2, 2), e.y - 4, rnd(-30, 30), rnd(-60, -20), 0.25, 200, 0, 1.2, 1);
      return;
    }
    const p = t / e.dur;
    if (p >= 1 && e.kind !== "rocket") {
      e.done = true;
      return;
    }
    switch (e.kind) {
      case "anar": {
        const f = Math.pow(Math.sin(Math.PI * Math.min(1, p)), 0.55);
        const rate = 300 * f * q;
        const k = rate * dt + Math.random();
        for (let i = 0; i < k - 1; i++) {
          const a = -Math.PI / 2 + rnd(-0.28, 0.28) * (1.2 - f * 0.4);
          const sp = rnd(300, 560) * s * (0.55 + 0.45 * f);
          spawn(e.x + rnd(-2, 2), e.y - 22 * s, Math.cos(a) * sp, Math.sin(a) * sp, rnd(0.7, 1.25), 560 * s, 0.6, rnd(1.6, 2.6), pick([0, 0, 1, 1, 2, 3]), Math.random() < 0.3 ? F_TWINKLE : 0);
        }
        break;
      }
      case "chakri": {
        const f = Math.min(1, p * 5) * Math.min(1, (1 - p) * 4);
        e.a += dt * (10 + 22 * f);
        e.x += e.vx * dt;
        if (e.x < 20 || e.x > W - 20) e.vx = -e.vx;
        e.vx += rnd(-60, 60) * dt;
        const k = 240 * f * q * dt + Math.random();
        const r = 11 * s;
        for (let i = 0; i < k - 1; i++) {
          const a = e.a + (i % 2) * Math.PI + rnd(-0.15, 0.15);
          const ox = Math.cos(a) * r;
          const oy = Math.sin(a) * r * 0.45;
          const sp = rnd(140, 280) * s;
          // tangent to the spin, a little upward
          spawn(e.x + ox, e.y - 6 + oy, -Math.sin(a) * sp, Math.cos(a) * sp * 0.45 - rnd(40, 140) * s, rnd(0.4, 0.75), 380 * s, 1, rnd(1.4, 2.2), pick([7, 7, 1, 0, e.c1]), F_STREAK);
        }
        break;
      }
      case "rocket": {
        const RISE = 0.85;
        if (t < RISE) {
          const k = Math.min(1, t / RISE);
          const ee = 1 - Math.pow(1 - k, 2.2);
          const y = e.y + (e.ty - e.y) * ee;
          const x = e.x + Math.sin(t * 9) * 2;
          for (let i = 0; i < 3 * q; i++) spawn(x + rnd(-1.5, 1.5), y + 4, rnd(-25, 25), rnd(30, 120), rnd(0.25, 0.5), 160, 1, rnd(1.2, 1.9), pick([1, 2, 0]));
          e.vx = x; // remember the head for drawing
        } else if (!e.a) {
          e.a = 1;
          burst(e.vx || e.x, e.ty, e.c1, e.c2);
        } else if (t > RISE + 0.6 && e.n === 0 && Math.random() < 0.5) {
          // a delayed crackle around the burst
          e.n = 1;
          for (let i = 0; i < 30 * q; i++) {
            const a = rnd(0, Math.PI * 2);
            const r = rnd(30, 90) * s;
            spawn(e.vx + Math.cos(a) * r, e.ty + Math.sin(a) * r + 30 * s, rnd(-10, 10), rnd(0, 20), rnd(0.2, 0.45), 40, 0, 2.2, 0, F_TWINKLE);
          }
        } else if (t > RISE + 0.6) e.n = 1;
        if (t > RISE + 0.8) e.done = true;
        break;
      }
      case "phuljhadi": {
        const L = 74 * s;
        const tipX = e.x + Math.sin(-0.18) * L * (1 - p * 0.75);
        const tipY = e.y - Math.cos(-0.18) * L * (1 - p * 0.75);
        const k = 220 * q * dt + Math.random();
        for (let i = 0; i < k - 1; i++) {
          const a = rnd(0, Math.PI * 2);
          const sp = rnd(60, 260) * s;
          spawn(tipX, tipY, Math.cos(a) * sp, Math.sin(a) * sp, rnd(0.18, 0.45), 260 * s, 2.5, rnd(1.1, 1.8), Math.random() < 0.75 ? 0 : 1, F_STREAK);
        }
        e.vx = tipX;
        e.a = tipY;
        break;
      }
      case "pencil": {
        const every = e.dur / 6.4;
        if (e.n < 6 && t > e.n * every) {
          const c = [e.c1, e.c2, 5, 6, 1, 8][e.n % 6];
          e.n++;
          spawn(e.x, e.y - 30 * s, rnd(-50, 50) * s, -rnd(520, 640) * s, rnd(1.15, 1.4), 420 * s, 0.4, 4.2, c, F_STAR);
          ev.onBoom?.("pencil", e.x, W);
        }
        break;
      }
    }
  }

  function drawBodies() {
    const s = S();
    for (const e of ems) {
      const t = e.t - FUSE;
      const p = Math.max(0, t) / e.dur;
      const fade = e.kind === "rocket" ? 1 : Math.max(0, Math.min(1, (1.25 - p) * 4));
      if (fade <= 0) continue;
      ctx.globalAlpha = fade;
      ctx.globalCompositeOperation = "source-over";
      switch (e.kind) {
        case "anar": {
          const w = 15 * s;
          const h = 22 * s;
          ctx.fillStyle = "#C8321A";
          ctx.beginPath();
          ctx.moveTo(e.x - w, e.y);
          ctx.lineTo(e.x + w, e.y);
          ctx.lineTo(e.x + 4 * s, e.y - h);
          ctx.lineTo(e.x - 4 * s, e.y - h);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = "#FFCF5A";
          ctx.fillRect(e.x - w * 0.7, e.y - h * 0.42, w * 1.4, 3 * s);
          break;
        }
        case "chakri": {
          const r = 11 * s;
          ctx.strokeStyle = "#2E8F4E";
          ctx.lineWidth = 3.5 * s;
          ctx.beginPath();
          ctx.ellipse(e.x, e.y - 6, r, r * 0.45, 0, 0, Math.PI * 2);
          ctx.stroke();
          ctx.strokeStyle = "#FFCF5A";
          ctx.lineWidth = 1.2 * s;
          ctx.beginPath();
          ctx.ellipse(e.x, e.y - 6, r * 0.55, r * 0.25, e.a, 0, Math.PI * 2);
          ctx.stroke();
          break;
        }
        case "rocket": {
          const RISE = 0.85;
          if (t < 0) {
            ctx.fillStyle = "#B3121B";
            ctx.fillRect(e.x - 3.5 * s, e.y - 30 * s, 7 * s, 22 * s);
            ctx.fillStyle = "#FFCF5A";
            ctx.beginPath();
            ctx.moveTo(e.x - 4 * s, e.y - 30 * s);
            ctx.lineTo(e.x, e.y - 40 * s);
            ctx.lineTo(e.x + 4 * s, e.y - 30 * s);
            ctx.fill();
            ctx.fillStyle = "#8A5A2A";
            ctx.fillRect(e.x - 0.8, e.y - 8 * s, 1.6, 8 * s);
          } else if (t < RISE) {
            ctx.globalCompositeOperation = "lighter";
            ctx.fillStyle = "#FFF6DC";
            ctx.fillRect(e.vx - 1.6, e.y + (e.ty - e.y) * (1 - Math.pow(1 - t / RISE, 2.2)) - 3, 3.2, 6);
          }
          break;
        }
        case "phuljhadi": {
          const L = 74 * s;
          const tx = e.x + Math.sin(-0.18) * L;
          const ty = e.y - Math.cos(-0.18) * L;
          ctx.strokeStyle = "#9A8C80";
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.moveTo(e.x, e.y);
          ctx.lineTo(tx, ty);
          ctx.stroke();
          if (t > 0) {
            ctx.strokeStyle = "#3A2A22";
            ctx.lineWidth = 2.4;
            ctx.beginPath();
            ctx.moveTo(e.vx, e.a);
            ctx.lineTo(tx, ty);
            ctx.stroke();
          }
          break;
        }
        case "pencil": {
          const h = 34 * s;
          for (let k = 0; k < 4; k++) {
            ctx.fillStyle = COLORS[[4, 1, 6, 5][k]];
            ctx.fillRect(e.x - 4 * s, e.y - h + (k * h) / 4, 8 * s, h / 4);
          }
          break;
        }
      }
    }
    ctx.globalAlpha = 1;
  }

  function drawGlows() {
    ctx.globalCompositeOperation = "lighter";
    const s = S();
    for (const e of ems) {
      const t = e.t - FUSE;
      let gx = e.x;
      let gy = e.y;
      let r = 0;
      let a = 0;
      const p = t / e.dur;
      if (t < 0) {
        r = 26 * s;
        a = 0.5 + Math.random() * 0.3;
        gy = e.y - 6;
      } else if (e.kind === "anar") {
        const f = Math.pow(Math.sin(Math.PI * Math.min(1, p)), 0.55);
        r = (90 + 70 * f) * s;
        a = 0.75 * f * (0.85 + Math.random() * 0.3);
        gy = e.y - 30 * s;
      } else if (e.kind === "chakri") {
        r = 80 * s;
        a = 0.6 * Math.min(1, p * 5) * Math.min(1, (1 - p) * 4) * (0.85 + Math.random() * 0.3);
      } else if (e.kind === "phuljhadi") {
        gx = e.vx;
        gy = e.a;
        r = 70 * s;
        a = 0.7 * Math.min(1, (1 - p) * 5) * (0.8 + Math.random() * 0.4);
      } else if (e.kind === "rocket" && t < 0.85) {
        gx = e.vx;
        gy = e.y + (e.ty - e.y) * (1 - Math.pow(1 - t / 0.85, 2.2));
        r = 34 * s;
        a = 0.55;
      }
      if (a > 0.01) {
        ctx.globalAlpha = Math.min(1, a);
        ctx.drawImage(sprite, gx - r, gy - r, r * 2, r * 2);
        // light pooling on the floor under ground crackers
        if (e.kind !== "rocket" && t >= 0) {
          ctx.globalAlpha = Math.min(1, a) * 0.5;
          ctx.drawImage(sprite, e.x - r * 1.6, e.y - r * 0.35, r * 3.2, r * 0.7);
        }
      }
    }
    if (flash > 0.02) {
      const r = Math.max(W, H) * 0.7;
      ctx.globalAlpha = flash * 0.55;
      ctx.drawImage(sprite, flashX - r, flashY - r, r * 2, r * 2);
    }
    ctx.globalAlpha = 1;
  }

  function drawParticles() {
    ctx.globalCompositeOperation = "lighter";
    // Stars (pencil) get a glow + a short tail each — there are only a few.
    for (let i = 0; i < n; i++) {
      if (!(flags[i] & F_STAR)) continue;
      const k = 1 - life[i] / max[i];
      ctx.globalAlpha = Math.min(1, k * 1.6) * 0.8;
      const r = 16;
      ctx.drawImage(sprite, px[i] - r, py[i] - r, r * 2, r * 2);
      ctx.strokeStyle = COLORS[col[i]];
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(px[i], py[i]);
      ctx.lineTo(px[i] - vx[i] * 0.05, py[i] - vy[i] * 0.05);
      ctx.stroke();
    }
    // Everything else: batched by colour × alpha bucket (bucket decided once per particle).
    for (let i = 0; i < n; i++) {
      let k = 1 - life[i] / max[i];
      if (flags[i] & F_TWINKLE && Math.random() < 0.25) k *= 0.3;
      bk[i] = flags[i] & F_STAR ? 9 : k > 0.6 ? 2 : k > 0.25 ? 1 : 0;
    }
    for (let c = 0; c < NC; c++) {
      ctx.fillStyle = COLORS[c];
      ctx.strokeStyle = COLORS[c];
      for (let b = 0; b < 3; b++) {
        ctx.globalAlpha = ALPHA[b];
        ctx.beginPath();
        let any = false;
        let streaks = false;
        for (let i = 0; i < n; i++) {
          if (col[i] !== c || bk[i] !== b) continue;
          if (flags[i] & F_STREAK) {
            streaks = true;
            continue;
          }
          const sz = size[i];
          ctx.rect(px[i] - sz / 2, py[i] - sz / 2, sz, sz);
          any = true;
        }
        if (any) ctx.fill();
        if (streaks) {
          ctx.beginPath();
          ctx.lineWidth = 1.8;
          for (let i = 0; i < n; i++) {
            if (col[i] !== c || bk[i] !== b || !(flags[i] & F_STREAK)) continue;
            ctx.moveTo(px[i], py[i]);
            ctx.lineTo(px[i] - vx[i] * 0.028, py[i] - vy[i] * 0.028);
          }
          ctx.stroke();
        }
      }
    }
    ctx.globalAlpha = 1;
  }

  function update(dt: number) {
    for (let i = ems.length - 1; i >= 0; i--) {
      step(ems[i], dt);
      if (ems[i].done) ems.splice(i, 1);
    }
    let i = 0;
    while (i < n) {
      life[i] += dt;
      if (life[i] >= max[i] || py[i] > H + 20) {
        n--;
        px[i] = px[n];
        py[i] = py[n];
        vx[i] = vx[n];
        vy[i] = vy[n];
        life[i] = life[n];
        max[i] = max[n];
        grav[i] = grav[n];
        drag[i] = drag[n];
        size[i] = size[n];
        col[i] = col[n];
        flags[i] = flags[n];
        continue;
      }
      const d = 1 - Math.min(0.5, drag[i] * dt);
      vx[i] *= d;
      vy[i] = vy[i] * d + grav[i] * dt;
      px[i] += vx[i] * dt;
      py[i] += vy[i] * dt;
      // stars pop into a little burst at the top of their arc
      if (flags[i] & F_STAR && vy[i] > -40) {
        const x = px[i];
        const y = py[i];
        const c = col[i];
        life[i] = max[i];
        const s = S();
        for (let k = 0; k < 22 * q; k++) {
          const a = rnd(0, Math.PI * 2);
          const sp = rnd(60, 150) * s;
          spawn(x, y, Math.cos(a) * sp, Math.sin(a) * sp, rnd(0.6, 1), 90 * s, 1.4, 2, c, F_TWINKLE);
        }
        flash = Math.max(flash, 0.35);
        flashX = x;
        flashY = y;
      }
      i++;
    }
    flash *= Math.pow(0.02, dt);
  }

  function frame(now: number) {
    if (destroyed) return;
    const dt = Math.min(0.05, last ? (now - last) / 1000 : 1 / 60);
    last = now;
    // self-tuning: sustained long frames → lighter emission
    slow = slow * 0.95 + (dt > 0.024 ? 1 : 0) * 0.05;
    q = slow > 0.5 ? 0.55 : slow < 0.15 ? 1 : q;
    update(dt);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    drawGlows();
    drawBodies();
    drawParticles();
    if (ems.length || n || flash > 0.02) raf = requestAnimationFrame(frame);
    else {
      raf = null;
      last = 0;
      ctx.clearRect(0, 0, W, H);
    }
  }

  function kick() {
    if (raf == null && !destroyed) raf = requestAnimationFrame(frame);
  }

  return {
    place(kind, x, y, ty) {
      // never more than 14 burning at once: the oldest ground cracker gives way
      if (ems.length >= 14) {
        const k = ems.findIndex((e) => e.kind !== "rocket");
        ems.splice(k < 0 ? 0 : k, 1);
      }
      const c1 = pick([1, 3, 4, 5, 6, 7, 8]);
      let c2 = pick([0, 1, 5, 6, 8]);
      if (c2 === c1) c2 = 0;
      ems.push({ kind, x, y, ty: ty ?? y, t: 0, dur: DUR[kind], a: 0, n: 0, c1, c2, vx: kind === "chakri" ? rnd(-40, 40) : 0, done: false });
      kick();
    },
    resize(w, h) {
      W = w;
      H = h;
      dpr = Math.min(1.5, window.devicePixelRatio || 1);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
    },
    active: () => ems.length,
    destroy() {
      destroyed = true;
      if (raf != null) cancelAnimationFrame(raf);
    },
  };
}
