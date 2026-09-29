// ─── Catch — the game engine ─────────────────────────────────────────────────
//
// Plain TypeScript, no React. One requestAnimationFrame loop, one canvas, fixed
// logical width (400) with a height that follows the playfield's aspect, and
// object pools so nothing is allocated per frame. React only hears about the
// discrete moments (a line caught, a photo caught, a level-up, the end) through
// `events`, plus a cheap per-frame HUD snapshot it diffs into the DOM itself.
//
// THE FEEL, in the order it matters: generous hitboxes (good items are easier
// to catch than they look, bad ones easier to dodge), squash-and-stretch on the
// face, particles + floating "+100" on every catch, a combo counter that shouts,
// hit-stop and screen shake when something rude lands, missed letter pieces that
// come back around, and three levels that speed up and warm the sky.

import type { Crop } from "../../dedication/components/types";
import { COMBO_WORDS, HIT_WORDS, PERFECT_WORDS, SKIES, comboWord } from "./theme";
import {
  SPRITE_RES,
  badSprite,
  cloudSprite,
  displayFont,
  drawCropped,
  heartPath,
  heartSprite,
  pieceSprite,
  polaroidSprite,
  powerSprite,
  type PowerKind,
  type Sprite,
} from "./sprites";

export const W = 400;

type Kind = "piece" | "photo" | "heart" | "bad" | "power";

interface Item {
  on: boolean;
  kind: Kind;
  idx: number;
  power: PowerKind;
  x: number;
  y: number;
  vy: number;
  bx: number;
  sway: number;
  phase: number;
  rot: number;
  vr: number;
  r: number;
  sprite: Sprite | null;
  nearMissed: boolean;
}

interface Particle {
  on: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  size: number;
  color: string;
  shape: 0 | 1 | 2 | 3;
  rot: number;
  vr: number;
}

interface Floater {
  on: boolean;
  text: string;
  x: number;
  y: number;
  life: number;
  max: number;
  color: string;
  size: number;
}

interface Spawn {
  at: number;
  kind: Kind;
  idx: number;
  power?: PowerKind;
  x?: number;
}

export interface Hud {
  score: number;
  lives: number;
  combo: number;
  mult: number;
  progress: number;
  pieces: number;
  photos: number;
  magnet: number;
  double: number;
  shield: boolean;
  level: number;
}

export interface RunResult {
  score: number;
  pieces: number[];
  photos: number[];
  hearts: number;
  maxCombo: number;
  perfects: number;
  livesLeft: number;
  reason: "time" | "hearts";
}

export interface EngineEvents {
  onPiece: (idx: number) => void;
  onPhoto: (idx: number) => void;
  onLevel: (level: number) => void;
  onHit: (lives: number) => void;
  onPower: (kind: PowerKind) => void;
  onEnd: (r: RunResult) => void;
  onHud: (h: Hud) => void;
}

export interface EngineInput {
  pieces: { emoji: string }[];
  photos: { key: string; img: HTMLImageElement | null; crop: Crop }[];
  bads: { emoji: string; label: string }[];
  face: { img: HTMLImageElement | null; crop: Crop };
  initial: string;
  name: string;
  durationMs: number;
  reduced: boolean;
}

const PLAYER_R = 36;
const GOOD_MULT = 1.28;
const BAD_MULT = 0.68;
const MAX_LIVES = 3;
const CONFETTI = ["#FF4F9A", "#FFD84D", "#7C5CFF", "#2ED3A0", "#8EC5FF", "#FF9CC8"];

const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);

/** Small deterministic PRNG so a page plays the same shape of run each time. */
function prng(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return ((s >>> 0) % 100000) / 100000;
  };
}

export class Engine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private input: EngineInput;
  private ev: EngineEvents;
  private rnd = prng(Date.now());

  private H = 700;
  private scale = 1;
  private dpr = 1;
  private cssW = 400;

  private items: Item[] = [];
  private parts: Particle[] = [];
  private floats: Floater[] = [];
  private queue: Spawn[] = [];
  private nextHeart = 0;
  private nextBad = 0;

  // player
  private px = W / 2;
  private target = W / 2;
  private vx = 0;
  private squash = 0;
  private stun = 0;
  private blush = 0;
  private mood = "";
  private moodT = 0;
  private keys = { l: false, r: false };
  private drag: { id: number; sx: number; spx: number } | null = null;

  // run state
  private t = 0;
  private running = false;
  private paused = false;
  private ended = false;
  private raf = 0;
  private last = 0;
  private freeze = 0;
  private trauma = 0;
  private flash = 0;
  private flashColor = "255,77,94";
  private level = 0;
  private skyFrom = 0;
  private skyMix = 1;

  score = 0;
  private lives = MAX_LIVES;
  private combo = 0;
  private maxCombo = 0;
  private hearts = 0;
  private perfects = 0;
  private caughtPieces: number[] = [];
  private caughtPhotos: number[] = [];
  private magnet = 0;
  private double = 0;
  private shield = false;
  private lastNear = 0;

  private clouds: { x: number; y: number; s: number; v: number }[] = [];
  private bgHearts: { x: number; y: number; s: number; v: number; p: number }[] = [];
  private skyCache: { key: string; g: CanvasGradient }[] = [];
  private font = "system-ui";

  constructor(canvas: HTMLCanvasElement, input: EngineInput, ev: EngineEvents) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d", { alpha: false })!;
    this.input = input;
    this.ev = ev;
    this.font = displayFont();
    for (let i = 0; i < 28; i++) this.items.push(this.blankItem());
    for (let i = 0; i < 240; i++) this.parts.push({ on: false, x: 0, y: 0, vx: 0, vy: 0, life: 0, max: 1, size: 4, color: "#fff", shape: 0, rot: 0, vr: 0 });
    for (let i = 0; i < 24; i++) this.floats.push({ on: false, text: "", x: 0, y: 0, life: 0, max: 1, color: "#fff", size: 20 });
    for (let i = 0; i < 5; i++) this.clouds.push({ x: this.rnd() * W, y: 40 + this.rnd() * 380, s: 0.5 + this.rnd() * 0.7, v: 6 + this.rnd() * 10 });
    for (let i = 0; i < 9; i++) this.bgHearts.push({ x: this.rnd() * W, y: this.rnd() * 800, s: 8 + this.rnd() * 14, v: 10 + this.rnd() * 18, p: this.rnd() * 6 });
    this.buildQueue();
  }

  // ── sizing ────────────────────────────────────────────────────────────────
  resize(cssW: number, cssH: number) {
    this.cssW = Math.max(1, cssW);
    this.dpr = Math.min(2, window.devicePixelRatio || 1);
    this.canvas.width = Math.round(cssW * this.dpr);
    this.canvas.height = Math.round(cssH * this.dpr);
    this.scale = (cssW * this.dpr) / W;
    this.H = (W * cssH) / Math.max(1, cssW);
    this.skyCache = [];
    if (!this.running) this.draw();
  }

  private get py() {
    return this.H - Math.max(118, this.H * 0.15);
  }

  // ── timeline ──────────────────────────────────────────────────────────────
  private buildQueue() {
    const T = this.input.durationMs / 1000;
    const q: Spawn[] = [];
    const n = this.input.pieces.length;
    for (let i = 0; i < n; i++) {
      const gap = (0.82 * T) / Math.max(1, n);
      q.push({ at: 1.2 + 0.82 * T * (i / Math.max(1, n)) + (this.rnd() - 0.5) * gap * 0.35, kind: "piece", idx: i });
    }
    const m = this.input.photos.length;
    for (let j = 0; j < m; j++) {
      q.push({ at: 3.2 + 0.8 * T * ((j + 0.5) / Math.max(1, m)), kind: "photo", idx: j });
    }
    const powers: [number, PowerKind][] = [
      [0.26, "double"],
      [0.5, "shield"],
      [0.7, "magnet"],
    ];
    for (const [f, k] of powers) q.push({ at: f * T, kind: "power", idx: 0, power: k });
    q.sort((a, b) => a.at - b.at);
    this.queue = q;
    this.nextHeart = 0.6;
    this.nextBad = 3.2;
  }

  private blankItem(): Item {
    return { on: false, kind: "heart", idx: 0, power: "double", x: 0, y: 0, vy: 0, bx: 0, sway: 0, phase: 0, rot: 0, vr: 0, r: 16, sprite: null, nearMissed: false };
  }

  private fallSpeed() {
    // Seconds to cross the screen, by level; reduced motion is gentler.
    const secs = [3.9, 3.2, 2.65][this.level] * (this.input.reduced ? 1.25 : 1);
    return this.H / secs;
  }

  private laneX(avoid?: number): number {
    for (let i = 0; i < 6; i++) {
      const x = 34 + this.rnd() * (W - 68);
      if (avoid === undefined || Math.abs(x - avoid) > 110) return x;
    }
    return avoid !== undefined ? (avoid > W / 2 ? 50 : W - 50) : W / 2;
  }

  private lastGoodX = W / 2;

  private spawn(s: Spawn) {
    const it = this.items.find((i) => !i.on);
    if (!it) return;
    it.on = true;
    it.kind = s.kind;
    it.idx = s.idx;
    it.nearMissed = false;
    const speed = this.fallSpeed();
    it.vy = speed * (0.92 + this.rnd() * 0.16);
    it.phase = this.rnd() * Math.PI * 2;
    it.rot = (this.rnd() - 0.5) * 0.4;
    it.vr = (this.rnd() - 0.5) * 0.8;
    it.sway = 10 + this.rnd() * 14;
    switch (s.kind) {
      case "piece":
        it.sprite = pieceSprite(this.input.pieces[s.idx]?.emoji || "💌");
        it.r = 26;
        it.vy *= 0.9;
        break;
      case "photo": {
        const p = this.input.photos[s.idx];
        it.sprite = polaroidSprite(p?.key ?? String(s.idx), p?.img ?? null, p?.crop ?? { x: 50, y: 50, scale: 100 });
        it.r = 32;
        it.vy *= 0.82;
        it.vr = (this.rnd() - 0.5) * 1.4;
        break;
      }
      case "heart":
        it.sprite = heartSprite();
        it.r = 15;
        it.sway = 18;
        break;
      case "bad": {
        const b = this.input.bads[s.idx];
        it.sprite = badSprite(b.emoji, b.label, this.font);
        it.r = 20;
        it.rot = 0;
        it.vr = 0;
        it.sway = 6;
        it.vy *= 1.05;
        break;
      }
      case "power":
        it.power = s.power ?? "double";
        it.sprite = powerSprite(it.power);
        it.r = 22;
        it.vy *= 0.85;
        break;
    }
    const good = s.kind !== "bad";
    const x = s.x ?? (good ? this.laneX() : this.laneX(this.lastGoodX));
    if (good && s.kind !== "heart") this.lastGoodX = x;
    // Keep the whole sprite (plus its sway) on screen — wide chat bubbles included.
    const half = (it.sprite ? it.sprite.width / SPRITE_RES / 2 : 30) + it.sway + 4;
    it.bx = clamp(x, Math.min(half, W / 2), Math.max(W - half, W / 2));
    it.x = it.bx;
    it.y = -40;
  }

  // ── input ─────────────────────────────────────────────────────────────────
  private toLogical(clientX: number) {
    const rect = this.canvas.getBoundingClientRect();
    return ((clientX - rect.left) / Math.max(1, rect.width)) * W;
  }
  pointerDown(e: PointerEvent) {
    const lx = this.toLogical(e.clientX);
    this.drag = { id: e.pointerId, sx: lx, spx: this.target };
    // A tap far from the face on a touch screen jumps there; a drag near it is relative.
    if (Math.abs(lx - this.px) > 90) {
      this.target = clamp(lx, PLAYER_R, W - PLAYER_R);
      this.drag.spx = this.target;
    }
  }
  pointerMove(e: PointerEvent) {
    const lx = this.toLogical(e.clientX);
    if (this.drag && this.drag.id === e.pointerId) {
      this.target = clamp(this.drag.spx + (lx - this.drag.sx) * 1.2, PLAYER_R, W - PLAYER_R);
    } else if (e.pointerType === "mouse") {
      this.target = clamp(lx, PLAYER_R, W - PLAYER_R);
    }
  }
  pointerUp(e: PointerEvent) {
    if (this.drag && this.drag.id === e.pointerId) this.drag = null;
  }
  key(code: string, down: boolean) {
    if (code === "ArrowLeft" || code === "KeyA") this.keys.l = down;
    if (code === "ArrowRight" || code === "KeyD") this.keys.r = down;
  }

  // ── lifecycle ─────────────────────────────────────────────────────────────
  start() {
    if (this.running) return;
    this.running = true;
    this.paused = false;
    this.last = performance.now();
    this.raf = requestAnimationFrame(this.frame);
  }
  pause() {
    if (!this.running || this.paused || this.ended) return;
    this.paused = true;
    cancelAnimationFrame(this.raf);
    this.draw();
  }
  resume() {
    if (!this.running || !this.paused || this.ended) return;
    this.paused = false;
    this.keys.l = this.keys.r = false;
    this.last = performance.now();
    this.raf = requestAnimationFrame(this.frame);
  }
  get isPaused() {
    return this.paused;
  }
  destroy() {
    this.running = false;
    cancelAnimationFrame(this.raf);
  }
  /** Idle render for the countdown: sky, clouds and the face, nothing falling. */
  idle() {
    this.draw();
  }

  private frame = (ts: number) => {
    if (!this.running || this.paused) return;
    const dt = Math.min(0.05, Math.max(0, (ts - this.last) / 1000));
    this.last = ts;
    this.step(dt);
    this.draw();
    if (this.running && !this.paused) this.raf = requestAnimationFrame(this.frame);
  };

  // ── simulation ────────────────────────────────────────────────────────────
  private step(dt: number) {
    // Ambient motion runs even during hit-stop so the world never looks frozen.
    for (const c of this.clouds) {
      c.x += c.v * dt;
      if (c.x > W + 80) c.x = -140;
    }
    for (const h of this.bgHearts) {
      h.y -= h.v * dt;
      if (h.y < -20) {
        h.y = this.H + 20;
        h.x = this.rnd() * W;
      }
    }
    this.stepParticles(dt);
    this.skyMix = Math.min(1, this.skyMix + dt * 0.8);
    this.flash = Math.max(0, this.flash - dt * 3);
    this.trauma = Math.max(0, this.trauma - dt * 1.6);
    this.moodT = Math.max(0, this.moodT - dt);

    if (this.freeze > 0) {
      this.freeze -= dt;
      return;
    }
    if (this.ended) return;

    this.t += dt;
    const T = this.input.durationMs / 1000;

    // level
    const lvl = this.t < T / 3 ? 0 : this.t < (2 * T) / 3 ? 1 : 2;
    if (lvl !== this.level) {
      this.skyFrom = this.level;
      this.skyMix = 0;
      this.level = lvl;
      this.ev.onLevel(lvl);
      this.burst(W / 2, this.H * 0.35, 26, "confetti");
    }

    // spawns
    while (this.queue.length && this.queue[0].at <= this.t) this.spawn(this.queue.shift()!);
    if (this.t >= this.nextHeart && this.t < T - 1) {
      this.spawn({ at: this.t, kind: "heart", idx: 0 });
      this.nextHeart = this.t + [0.75, 0.62, 0.5][this.level] + this.rnd() * 0.35;
    }
    if (this.input.bads.length && this.t >= this.nextBad && this.t < T - 1.5) {
      this.spawn({ at: this.t, kind: "bad", idx: Math.floor(this.rnd() * this.input.bads.length) });
      this.nextBad = this.t + [2.1, 1.45, 1.05][this.level] + this.rnd() * 0.6;
    }

    // player
    if (this.keys.l) this.target = clamp(this.target - 460 * dt, PLAYER_R, W - PLAYER_R);
    if (this.keys.r) this.target = clamp(this.target + 460 * dt, PLAYER_R, W - PLAYER_R);
    const prev = this.px;
    const k = 1 - Math.exp(-dt * (this.stun > 0 ? 7 : 20));
    this.px += (this.target - this.px) * k;
    this.vx = (this.px - prev) / Math.max(dt, 1e-3);
    this.squash *= Math.exp(-dt * 9);
    this.stun = Math.max(0, this.stun - dt);
    this.blush = Math.max(0, this.blush - dt * 1.4);
    this.magnet = Math.max(0, this.magnet - dt);
    this.double = Math.max(0, this.double - dt);

    // items
    const py = this.py;
    for (const it of this.items) {
      if (!it.on) continue;
      it.y += it.vy * dt;
      it.phase += dt * 2.2;
      it.rot += it.vr * dt;
      if (this.magnet > 0 && it.kind !== "bad" && it.y > py - 300 && it.y < py + 10) {
        it.bx += (this.px - it.bx) * Math.min(1, dt * 5);
        it.x = it.bx;
      } else {
        it.x = it.bx + Math.sin(it.phase) * it.sway;
      }
      const dx = it.x - this.px;
      const dy = it.y - py;
      const reach = PLAYER_R + it.r * (it.kind === "bad" ? BAD_MULT : GOOD_MULT);
      if (dx * dx + dy * dy < reach * reach && this.stun <= 0.25) {
        it.on = false;
        this.collect(it, dx);
        continue;
      }
      if (it.kind === "bad" && !it.nearMissed && it.y > py && Math.abs(dx) < reach + 22) {
        it.nearMissed = true;
        if (this.t - this.lastNear > 3) {
          this.lastNear = this.t;
          this.float("close one 😮‍💨", this.px, py - 70, "#fff", 16);
        }
      }
      if (it.y > this.H + 50) {
        it.on = false;
        this.miss(it);
      }
    }

    this.ev.onHud(this.hud());

    if (this.t >= T) this.finish("time");
  }

  private hud(): Hud {
    const T = this.input.durationMs / 1000;
    return {
      score: this.score,
      lives: this.lives,
      combo: this.combo,
      mult: this.mult(),
      progress: clamp(this.t / T, 0, 1),
      pieces: this.caughtPieces.length,
      photos: this.caughtPhotos.length,
      magnet: this.magnet / 7,
      double: this.double / 8,
      shield: this.shield,
      level: this.level,
    };
  }

  private mult() {
    return (1 + Math.min(3, Math.floor(this.combo / 5)) * 0.5) * (this.double > 0 ? 2 : 1);
  }

  private add(points: number, x: number, y: number, color = "#fff") {
    const p = Math.round(points * this.mult());
    this.score += p;
    this.float(`+${p}`, x, y, color, 22);
  }

  private collect(it: Item, dx: number) {
    const py = this.py;
    if (it.kind === "bad") {
      if (this.shield) {
        this.shield = false;
        this.float("blocked! 🛡️", this.px, py - 64, "#2ED3A0", 22);
        this.burst(this.px, py, 18, "spark");
        this.trauma = Math.min(1, this.trauma + 0.25);
        return;
      }
      this.lives -= 1;
      this.combo = 0;
      this.stun = 0.5;
      this.freeze = 0.08;
      this.trauma = Math.min(1, this.trauma + 0.7);
      this.flash = this.input.reduced ? 0 : 0.5;
      this.flashColor = "255,77,94";
      this.setMood("😵‍💫");
      this.float(HIT_WORDS[Math.floor(this.rnd() * HIT_WORDS.length)], this.px, py - 70, "#FF4D5E", 24);
      this.burst(this.px, py - 10, 10, "shard");
      this.ev.onHit(this.lives);
      if (this.lives <= 0) this.finish("hearts");
      return;
    }

    this.squash = 1;
    this.combo += 1;
    this.maxCombo = Math.max(this.maxCombo, this.combo);
    const perfect = Math.abs(dx) < 11 && it.kind !== "heart";
    const cw = comboWord(this.combo);

    switch (it.kind) {
      case "heart":
        this.hearts += 1;
        this.add(10, it.x, py - 50, "#FFE3F0");
        this.burst(it.x, py - 16, 7, "heart");
        // Every 12 hearts buys a life back — the game leans towards letting them win.
        if (this.hearts % 12 === 0 && this.lives < MAX_LIVES) {
          this.lives += 1;
          this.float("+1 life ♥", W / 2, this.H * 0.45, "#FF9CC8", 28);
        }
        break;
      case "piece":
        this.caughtPieces.push(it.idx);
        this.add(100, it.x, py - 56, "#FFF3A8");
        this.burst(it.x, py - 20, 22, "confetti");
        this.blush = 1;
        this.setMood("🥹");
        this.ev.onPiece(it.idx);
        break;
      case "photo":
        this.caughtPhotos.push(it.idx);
        this.add(250, it.x, py - 60, "#FFF3A8");
        this.burst(it.x, py - 20, 30, "heart");
        this.blush = 1;
        this.setMood("😍");
        this.freeze = 0.12;
        this.flash = this.input.reduced ? 0 : 0.35;
        this.flashColor = "255,255,255";
        // The photo pops open; the stage pauses the run until it's closed.
        this.ev.onPhoto(it.idx);
        break;
      case "power":
        this.add(50, it.x, py - 50, "#fff");
        this.burst(it.x, py - 20, 20, "spark");
        if (it.power === "magnet") {
          this.magnet = 7;
          this.float("MAGNET 🧲", W / 2, this.H * 0.4, "#C9B8FF", 30);
        } else if (it.power === "double") {
          this.double = 8;
          this.float("DOUBLE POINTS ✨", W / 2, this.H * 0.4, "#FFE27A", 28);
        } else {
          this.shield = true;
          this.float("SHIELD UP 🛡️", W / 2, this.H * 0.4, "#9CF5D8", 28);
        }
        this.ev.onPower(it.power);
        break;
    }
    if (perfect) {
      this.perfects += 1;
      this.score += 50;
      this.float(PERFECT_WORDS[this.perfects % PERFECT_WORDS.length], this.px, py - 96, "#FFD84D", 20);
    }
    if (cw) {
      this.float(`${this.combo}× ${cw}`, W / 2, this.H * 0.3, "#FF9CC8", this.combo >= 12 ? 34 : 28);
      this.burst(W / 2, this.H * 0.3, 16, "spark");
      if (this.combo >= COMBO_WORDS[1][0]) this.setMood("😎");
    }
  }

  private miss(it: Item) {
    if (it.kind === "piece" || it.kind === "photo") {
      this.combo = 0;
      const T = this.input.durationMs / 1000;
      // Missed pieces come back around while there's time. Nothing is lost.
      if (this.t < T - 3.2) {
        this.queue.push({ at: this.t + 1.1 + this.rnd() * 0.8, kind: it.kind, idx: it.idx });
        this.queue.sort((a, b) => a.at - b.at);
        this.float("↺ coming back", it.x, this.H - 30, "#fff", 15);
      }
    }
  }

  private finish(reason: "time" | "hearts") {
    if (this.ended) return;
    this.ended = true;
    this.freeze = 0;
    for (const it of this.items) it.on = false;
    this.burst(W / 2, this.H * 0.4, 50, "confetti");
    this.ev.onHud(this.hud());
    const r: RunResult = {
      score: this.score,
      pieces: [...new Set(this.caughtPieces)],
      photos: [...new Set(this.caughtPhotos)],
      hearts: this.hearts,
      maxCombo: this.maxCombo,
      perfects: this.perfects,
      livesLeft: Math.max(0, this.lives),
      reason,
    };
    // Let the confetti fly for a beat before handing over.
    window.setTimeout(() => {
      this.running = false;
      cancelAnimationFrame(this.raf);
      this.ev.onEnd(r);
    }, 900);
  }

  private setMood(m: string) {
    this.mood = m;
    this.moodT = 0.9;
  }

  // ── fx ────────────────────────────────────────────────────────────────────
  private burst(x: number, y: number, n: number, type: "confetti" | "heart" | "spark" | "shard") {
    const count = this.input.reduced ? Math.ceil(n / 3) : n;
    for (let i = 0; i < count; i++) {
      const p = this.parts.find((q) => !q.on);
      if (!p) return;
      const a = this.rnd() * Math.PI * 2;
      const sp = (type === "spark" ? 160 : 120) + this.rnd() * 180;
      p.on = true;
      p.x = x;
      p.y = y;
      p.vx = Math.cos(a) * sp;
      p.vy = Math.sin(a) * sp - (type === "heart" ? 160 : 120);
      p.life = 0;
      p.max = 0.6 + this.rnd() * 0.6;
      p.rot = this.rnd() * 6;
      p.vr = (this.rnd() - 0.5) * 10;
      if (type === "heart") {
        p.shape = 0;
        p.size = 7 + this.rnd() * 7;
        p.color = this.rnd() > 0.4 ? "#FF4F9A" : "#FF9CC8";
      } else if (type === "spark") {
        p.shape = 3;
        p.size = 5 + this.rnd() * 5;
        p.color = this.rnd() > 0.5 ? "#FFD84D" : "#FFFFFF";
      } else if (type === "shard") {
        p.shape = 1;
        p.size = 3 + this.rnd() * 4;
        p.color = "#8A7AA0";
      } else {
        p.shape = 2;
        p.size = 4 + this.rnd() * 4;
        p.color = CONFETTI[i % CONFETTI.length];
      }
    }
  }

  private stepParticles(dt: number) {
    for (const p of this.parts) {
      if (!p.on) continue;
      p.life += dt;
      if (p.life >= p.max) {
        p.on = false;
        continue;
      }
      p.vy += 520 * dt;
      p.vx *= 1 - dt * 1.5;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rot += p.vr * dt;
    }
    for (const f of this.floats) {
      if (!f.on) continue;
      f.life += dt;
      f.y -= 42 * dt;
      if (f.life >= f.max) f.on = false;
    }
  }

  private float(text: string, x: number, y: number, color: string, size: number) {
    const f = this.floats.find((q) => !q.on) ?? this.floats[0];
    f.on = true;
    f.text = text;
    f.x = clamp(x, 60, W - 60);
    f.y = y;
    f.life = 0;
    f.max = 1.05;
    f.color = color;
    f.size = size;
  }

  // ── render ────────────────────────────────────────────────────────────────
  private sky(level: number): CanvasGradient {
    const key = `${level}:${Math.round(this.H)}`;
    const hit = this.skyCache.find((s) => s.key === key);
    if (hit) return hit.g;
    const [a, b, c] = SKIES[level];
    const g = this.ctx.createLinearGradient(0, 0, 0, this.H);
    g.addColorStop(0, a);
    g.addColorStop(0.55, b);
    g.addColorStop(1, c);
    this.skyCache.push({ key, g });
    return g;
  }

  private draw() {
    const ctx = this.ctx;
    const H = this.H;
    ctx.setTransform(this.scale, 0, 0, this.scale, 0, 0);

    // sky (cross-fades between levels)
    ctx.fillStyle = this.sky(this.skyFrom);
    ctx.fillRect(0, 0, W, H);
    if (this.skyMix < 1 || this.skyFrom !== this.level) {
      ctx.globalAlpha = this.skyMix;
      ctx.fillStyle = this.sky(this.level);
      ctx.fillRect(0, 0, W, H);
      ctx.globalAlpha = 1;
      if (this.skyMix >= 1) this.skyFrom = this.level;
    }

    // screen shake
    if (this.trauma > 0 && !this.input.reduced) {
      const s = this.trauma * this.trauma * 9;
      ctx.translate((this.rnd() - 0.5) * 2 * s, (this.rnd() - 0.5) * 2 * s);
    }

    // stars in the last level
    if (this.level === 2) {
      ctx.fillStyle = "rgba(255,255,255,.8)";
      for (let i = 0; i < 18; i++) {
        const x = (i * 97) % W;
        const y = (i * 53) % (H * 0.5);
        const tw = 0.5 + 0.5 * Math.sin(this.t * 3 + i);
        ctx.globalAlpha = tw * 0.8;
        ctx.fillRect(x, y, 2, 2);
      }
      ctx.globalAlpha = 1;
    }

    // clouds + drifting background hearts
    const cloud = cloudSprite();
    for (const c of this.clouds) {
      ctx.globalAlpha = 0.55 + c.s * 0.3;
      ctx.drawImage(cloud, c.x, c.y, 140 * c.s, 64 * c.s);
    }
    ctx.globalAlpha = 1;
    ctx.fillStyle = "rgba(255,255,255,.35)";
    for (const h of this.bgHearts) {
      heartPath(ctx, h.x + Math.sin(this.t + h.p) * 8, h.y, h.s);
      ctx.fill();
    }

    // hills
    const hy = this.py + PLAYER_R + 18;
    ctx.fillStyle = "rgba(255,255,255,.35)";
    ctx.beginPath();
    ctx.moveTo(0, hy + 10);
    ctx.quadraticCurveTo(W * 0.25, hy - 26, W * 0.5, hy + 4);
    ctx.quadraticCurveTo(W * 0.78, hy + 30, W, hy - 12);
    ctx.lineTo(W, H);
    ctx.lineTo(0, H);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,.5)";
    ctx.beginPath();
    ctx.moveTo(0, hy + 30);
    ctx.quadraticCurveTo(W * 0.4, hy + 4, W * 0.7, hy + 26);
    ctx.quadraticCurveTo(W * 0.88, hy + 38, W, hy + 22);
    ctx.lineTo(W, H);
    ctx.lineTo(0, H);
    ctx.fill();

    // items
    for (const it of this.items) {
      if (!it.on || !it.sprite) continue;
      const sw = it.sprite.width / SPRITE_RES;
      const sh = it.sprite.height / SPRITE_RES;
      ctx.save();
      ctx.translate(it.x, it.y);
      if (it.rot) ctx.rotate(it.rot);
      if (it.kind === "power" || it.kind === "photo") {
        const pulse = 1 + Math.sin(it.phase * 2.4) * 0.06;
        ctx.scale(pulse, pulse);
        // glow ring
        ctx.globalAlpha = 0.35 + Math.sin(it.phase * 2.4) * 0.15;
        ctx.fillStyle = it.kind === "photo" ? "#FFF3A8" : "#fff";
        ctx.beginPath();
        ctx.arc(0, 0, it.r + 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
      ctx.drawImage(it.sprite, -sw / 2, -sh / 2, sw, sh);
      ctx.restore();
    }

    this.drawPlayer();

    // particles
    for (const p of this.parts) {
      if (!p.on) continue;
      const a = 1 - p.life / p.max;
      ctx.globalAlpha = a;
      ctx.fillStyle = p.color;
      if (p.shape === 0) {
        heartPath(ctx, p.x, p.y, p.size);
        ctx.fill();
      } else if (p.shape === 1) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.shape === 2) {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillRect(-p.size / 2, -p.size / 3, p.size, p.size * 0.66);
        ctx.restore();
      } else {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        const s = p.size;
        ctx.beginPath();
        ctx.moveTo(0, -s);
        ctx.quadraticCurveTo(0, 0, s, 0);
        ctx.quadraticCurveTo(0, 0, 0, s);
        ctx.quadraticCurveTo(0, 0, -s, 0);
        ctx.quadraticCurveTo(0, 0, 0, -s);
        ctx.fill();
        ctx.restore();
      }
    }
    ctx.globalAlpha = 1;

    // floating texts
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.lineJoin = "round";
    for (const f of this.floats) {
      if (!f.on) continue;
      const t = f.life / f.max;
      const pop = t < 0.15 ? 0.6 + (t / 0.15) * 0.55 : t < 0.25 ? 1.15 - ((t - 0.15) / 0.1) * 0.15 : 1;
      ctx.globalAlpha = t > 0.7 ? 1 - (t - 0.7) / 0.3 : 1;
      ctx.font = `700 ${Math.round(f.size * pop)}px ${this.font}`;
      ctx.lineWidth = 6;
      ctx.strokeStyle = "rgba(60,20,80,.75)";
      ctx.strokeText(f.text, f.x, f.y);
      ctx.fillStyle = f.color;
      ctx.fillText(f.text, f.x, f.y);
    }
    ctx.globalAlpha = 1;

    // flash
    if (this.flash > 0) {
      ctx.setTransform(this.scale, 0, 0, this.scale, 0, 0);
      ctx.fillStyle = `rgba(${this.flashColor},${this.flash * 0.45})`;
      ctx.fillRect(0, 0, W, H);
    }
  }

  private drawPlayer() {
    const ctx = this.ctx;
    const x = this.px;
    const y = this.py;
    const R = PLAYER_R;
    const tilt = clamp(this.vx * 0.0006, -0.28, 0.28);
    const sq = this.squash;
    const sx = 1 + sq * 0.2;
    const sy = 1 - sq * 0.16;

    // shadow
    ctx.fillStyle = "rgba(60,20,80,.18)";
    ctx.beginPath();
    ctx.ellipse(x, y + R + 12, R * 0.85 * sx, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.translate(x, y + R * (1 - sy));
    ctx.rotate(tilt);
    ctx.scale(sx, sy);
    if (this.stun > 0 && Math.floor(this.stun * 20) % 2 === 0) ctx.globalAlpha = 0.55;

    // magnet aura
    if (this.magnet > 0) {
      ctx.strokeStyle = "rgba(124,92,255,.55)";
      ctx.lineWidth = 3;
      for (let i = 0; i < 2; i++) {
        const rr = R + 14 + ((this.t * 40 + i * 14) % 28);
        ctx.globalAlpha = 1 - ((this.t * 40 + i * 14) % 28) / 28;
        ctx.beginPath();
        ctx.arc(0, 0, rr, Math.PI * 1.1, Math.PI * 1.9);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }

    // outer ring
    ctx.fillStyle = this.double > 0 ? "#FFD84D" : "#FF4F9A";
    ctx.beginPath();
    ctx.arc(0, 0, R + 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(0, 0, R + 2, 0, Math.PI * 2);
    ctx.fill();

    // face
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, R - 1, 0, Math.PI * 2);
    ctx.clip();
    const img = this.input.face.img;
    if (img) {
      drawCropped(ctx, img, -R, -R, R * 2, R * 2, this.input.face.crop);
    } else {
      const g = ctx.createLinearGradient(-R, -R, R, R);
      g.addColorStop(0, "#FFB3D4");
      g.addColorStop(1, "#B9A4FF");
      ctx.fillStyle = g;
      ctx.fillRect(-R, -R, R * 2, R * 2);
      // kawaii face
      ctx.fillStyle = "#2A1640";
      if (this.stun > 0) {
        ctx.strokeStyle = "#2A1640";
        ctx.lineWidth = 3;
        for (const ex of [-11, 11]) {
          ctx.beginPath();
          ctx.moveTo(ex - 4, -6);
          ctx.lineTo(ex + 4, 2);
          ctx.moveTo(ex + 4, -6);
          ctx.lineTo(ex - 4, 2);
          ctx.stroke();
        }
      } else {
        for (const ex of [-11, 11]) {
          ctx.beginPath();
          ctx.ellipse(ex, -3, 4, 5.5, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#fff";
          ctx.beginPath();
          ctx.arc(ex + 1.5, -5, 1.6, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#2A1640";
        }
      }
      ctx.strokeStyle = "#2A1640";
      ctx.lineWidth = 2.6;
      ctx.lineCap = "round";
      ctx.beginPath();
      if (this.squash > 0.3) ctx.arc(0, 8, 6, 0, Math.PI);
      else ctx.arc(0, 6, 5, 0.15 * Math.PI, 0.85 * Math.PI);
      ctx.stroke();
      ctx.fillStyle = "rgba(255,79,154,.45)";
      ctx.beginPath();
      ctx.ellipse(-19, 8, 6, 3.5, 0, 0, Math.PI * 2);
      ctx.ellipse(19, 8, 6, 3.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = `700 13px ${this.font}`;
    }
    ctx.restore();

    // blush on catch (over photos too)
    if (this.blush > 0 && img) {
      ctx.fillStyle = `rgba(255,79,154,${0.4 * this.blush})`;
      ctx.beginPath();
      ctx.ellipse(-17, 12, 8, 4.5, 0, 0, Math.PI * 2);
      ctx.ellipse(17, 12, 8, 4.5, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    // hurt tint
    if (this.stun > 0) {
      ctx.fillStyle = "rgba(255,77,94,.28)";
      ctx.beginPath();
      ctx.arc(0, 0, R, 0, Math.PI * 2);
      ctx.fill();
    }

    // shield bubble
    if (this.shield) {
      const g = ctx.createRadialGradient(-10, -12, 4, 0, 0, R + 14);
      g.addColorStop(0, "rgba(255,255,255,.55)");
      g.addColorStop(0.7, "rgba(126,240,203,.12)");
      g.addColorStop(1, "rgba(46,211,160,.45)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(0, 0, R + 13, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,.8)";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    ctx.restore();

    // name tag
    const name = this.input.name.length > 14 ? `${this.input.name.slice(0, 13)}…` : this.input.name;
    if (name) {
      ctx.font = `700 12px ${this.font}`;
      const tw = ctx.measureText(name).width + 16;
      ctx.fillStyle = "rgba(42,22,64,.78)";
      ctx.beginPath();
      const ty = y + R + 18;
      ctx.roundRect?.(x - tw / 2, ty - 9, tw, 18, 9);
      if (!ctx.roundRect) ctx.rect(x - tw / 2, ty - 9, tw, 18);
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(name, x, ty + 0.5);
    }

    // mood bubble
    if (this.moodT > 0 && this.mood) {
      const a = Math.min(1, this.moodT * 3);
      const bob = (1 - this.moodT) * 10;
      ctx.globalAlpha = a;
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(x + R * 0.9, y - R - 8 - bob, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = `20px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(this.mood, x + R * 0.9, y - R - 7 - bob);
      ctx.globalAlpha = 1;
    }
  }
}
