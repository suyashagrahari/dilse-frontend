"use client";

// ─── The engine ──────────────────────────────────────────────────────────────
//
// One delta-time requestAnimationFrame loop. Everything mutable lives in refs;
// React is told about events (a catch, a hit, the end of the run) and about
// nothing else, so a 45-second run costs ~12 renders instead of ~2700.
//
// Four rules this file exists to enforce:
//
//   1. Delta time, never frame count. A 120 Hz iPad and a 45 Hz budget Android
//      must play the same game. `dt` is clamped so a stall cannot teleport
//      anything, and the tab pausing does not consume the run clock.
//   2. Pooling. `SPAWN.poolSize` items and a fixed particle pool are allocated
//      once, before the loop starts. Nothing inside `frame()` allocates —
//      no array literals, no object literals, no closures, no template strings,
//      no `measureText` (textAlign does the centring instead).
//   3. Asymmetric hitboxes. Good items are caught with a 1.30x radius, bad
//      items only collide at 0.75x. This is the single most important tuning
//      decision in the build and it must never be "fixed" to be symmetrical.
//   4. NOTHING IS EVER TAKEN AWAY. There is no code path in this file that
//      removes an id from `caught`. A hit costs a flinch and 400ms of stun;
//      a miss costs silence and puts the line back in the queue. That is all.
//
// Randomness is seeded (`@/lib/seededRandom`) so a reload of the same share
// link plays the same spawn order — `Math.random()` is banned.

import { useCallback, useEffect, useRef } from "react";
import { rngFrom, seededShuffle } from "@/lib/seededRandom";
import {
  DIFFICULTY,
  FIELD,
  HITBOX,
  PLAYER,
  SPAWN,
  type BadItem,
  type GoodItem,
} from "./types";
import { COOL_BOT, COOL_TOP, WARM_BOT, WARM_TOP, mix } from "./catchTheme";
import { drawCover } from "./useFaceImage";

const TAU = Math.PI * 2;
const DEG = Math.PI / 180;

/** Never advance more than this in one step — covers a GC pause or a tab stall. */
const MAX_STEP_MS = 50;
/** A dt of one 60 Hz frame, the basis for normalising the player LERP. */
const FRAME_MS = 1000 / 60;

const GOOD_R = SPAWN.itemSize / 2;
const BAD_R = (SPAWN.itemSize * 1.15) / 2; // bad items render slightly larger
const GOOD_HIT = PLAYER.radius + GOOD_R * HITBOX.goodMultiplier; // 58.0 — generous
const BAD_HIT = PLAYER.radius + BAD_R * HITBOX.badMultiplier; //  49.3 — forgiving
const PLAYER_Y = FIELD.h - PLAYER.bottomOffset;
const MIN_X = PLAYER.radius + PLAYER.edgeMargin;
const MAX_X = FIELD.w - PLAYER.radius - PLAYER.edgeMargin;

const CATCH_FX_MS = 180;
const SHATTER_FX_MS = 300;
const VIGNETTE_MS = 250;
const END_GRACE_MS = 700;
const PARTICLES_PER_SHATTER = 6;
const PARTICLE_POOL = SPAWN.poolSize * PARTICLES_PER_SHATTER;

/** Difficulty can bend down three notches and no further. */
const MIN_SPEED_MULTIPLIER = Math.pow(DIFFICULTY.missSpeedMultiplier, 3);

const STATE_FALLING = 0;
const STATE_CAUGHT = 1;
const STATE_SHATTERED = 2;

interface PoolItem {
  active: boolean;
  good: boolean;
  idx: number;
  x: number;
  y: number;
  baseX: number;
  phase: number;
  age: number;
  state: number;
  fx: number;
}

interface Particle {
  active: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
}

export interface RunResult {
  caughtIds: string[];
  missedIds: string[];
  dodged: number;
}

export interface GameLoopOptions {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  /** Flip to true to play. Flipping false pauses without destroying state. */
  running: boolean;
  /** Bump to start a fresh run (a replay of only the missed items). */
  roundKey: number;
  goodItems: GoodItem[];
  badItems: BadItem[];
  durationMs: number;
  seed: string;
  faceRef: React.MutableRefObject<HTMLImageElement | null>;
  /** Single letter drawn when there is no usable photo. */
  initial: string;
  faceFillColor: string;
  /** 0..1, how much of the letter has arrived. Drives the warming gradient. */
  warmthRef: React.MutableRefObject<number>;
  onCatch: (item: GoodItem, streak: number) => void;
  onHit: (stunUntilMs: number) => void;
  onEnd: (result: RunResult) => void;
}

export function useGameLoop(opts: GameLoopOptions) {
  const {
    canvasRef,
    running,
    roundKey,
    goodItems,
    badItems,
    durationMs,
    seed,
    faceRef,
    initial,
    faceFillColor,
    warmthRef,
  } = opts;

  // Callbacks and data live behind refs so a parent re-render never restarts
  // the loop. Both are refreshed in an effect declared BEFORE the loop effect —
  // effects run in declaration order, so by the time a new `roundKey` reaches
  // `reset()` the round's items are already in `dataRef`.
  const cbRef = useRef({ onCatch: opts.onCatch, onHit: opts.onHit, onEnd: opts.onEnd });
  const dataRef = useRef({ goodItems, badItems, durationMs, seed, initial, faceFillColor });

  const { onCatch, onHit, onEnd } = opts;
  useEffect(() => {
    cbRef.current.onCatch = onCatch;
    cbRef.current.onHit = onHit;
    cbRef.current.onEnd = onEnd;
    dataRef.current.goodItems = goodItems;
    dataRef.current.badItems = badItems;
    dataRef.current.durationMs = durationMs;
    dataRef.current.seed = seed;
    dataRef.current.initial = initial;
    dataRef.current.faceFillColor = faceFillColor;
  });

  // ── Pools, allocated once for the lifetime of the component ────────────────
  const poolRef = useRef<PoolItem[] | null>(null);
  if (poolRef.current === null) {
    const pool: PoolItem[] = [];
    for (let i = 0; i < SPAWN.poolSize; i++) {
      pool.push({
        active: false,
        good: true,
        idx: 0,
        x: 0,
        y: 0,
        baseX: 0,
        phase: 0,
        age: 0,
        state: STATE_FALLING,
        fx: 0,
      });
    }
    poolRef.current = pool;
  }
  const partRef = useRef<Particle[] | null>(null);
  if (partRef.current === null) {
    const parts: Particle[] = [];
    for (let i = 0; i < PARTICLE_POOL; i++) {
      parts.push({ active: false, x: 0, y: 0, vx: 0, vy: 0, life: 0 });
    }
    partRef.current = parts;
  }

  // ── Mutable run state ──────────────────────────────────────────────────────
  const S = useRef({
    started: false,
    elapsed: 0,
    lastTs: 0,
    raf: 0,
    // player
    px: FIELD.w / 2,
    targetX: FIELD.w / 2,
    stunUntil: 0,
    catchFx: 0,
    hitFx: 0,
    vignette: 0,
    // spawn
    spawnTimer: 0,
    goodSinceBad: 0,
    badCursor: 0,
    pending: [] as number[],
    inFlight: [] as boolean[],
    badOrder: [] as number[],
    rng: (() => 0) as () => number,
    // difficulty (never surfaced)
    speedMul: 1,
    ratio: SPAWN.goodToBadRatio as number,
    missStreak: 0,
    catchStreak: 0,
    // outcome
    caught: [] as string[],
    dodged: 0,
    endAt: 0,
    ended: false,
    // render cache
    scale: 1,
    gradKey: -1,
    grad: null as CanvasGradient | null,
    labelFont: "500 10px system-ui, sans-serif",
    emojiFont: `${SPAWN.itemSize}px system-ui, sans-serif`,
    emojiFontBad: `${Math.round(SPAWN.itemSize * 1.15)}px system-ui, sans-serif`,
    initialFont: "700 30px system-ui, sans-serif",
  });

  // ── Reset for a new round ──────────────────────────────────────────────────
  const reset = useCallback(() => {
    const s = S.current;
    const d = dataRef.current;
    const pool = poolRef.current!;
    const parts = partRef.current!;
    for (let i = 0; i < pool.length; i++) pool[i].active = false;
    for (let i = 0; i < parts.length; i++) parts[i].active = false;

    s.elapsed = 0;
    s.lastTs = 0;
    s.px = FIELD.w / 2;
    s.targetX = FIELD.w / 2;
    s.stunUntil = 0;
    s.catchFx = 0;
    s.hitFx = 0;
    s.vignette = 0;
    s.spawnTimer = 420;
    s.goodSinceBad = 0;
    s.badCursor = 0;
    s.speedMul = 1;
    s.ratio = SPAWN.goodToBadRatio;
    s.missStreak = 0;
    s.catchStreak = 0;
    s.dodged = 0;
    s.endAt = 0;
    s.ended = false;
    s.gradKey = -1;
    s.grad = null;

    s.caught.length = 0;
    s.inFlight.length = 0;
    s.pending.length = 0;

    // Seeded spawn order — same link, same run, every time.
    s.rng = rngFrom(`${d.seed}:catch:${roundKey}`);
    const order = seededShuffle(`${d.seed}:order:${roundKey}`, d.goodItems.map((_, i) => i));
    for (let i = 0; i < order.length; i++) s.pending.push(order[i]);
    for (let i = 0; i < d.goodItems.length; i++) s.inFlight.push(false);

    s.badOrder.length = 0;
    if (d.badItems.length > 0) {
      const b = seededShuffle(`${d.seed}:bad:${roundKey}`, d.badItems.map((_, i) => i));
      for (let i = 0; i < b.length; i++) s.badOrder.push(b[i]);
    }
  }, [roundKey]);

  // ── Canvas sizing: fixed logical field, device pixels underneath ───────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const apply = () => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width < 2) return;
      const dpr = Math.min(typeof window === "undefined" ? 1 : window.devicePixelRatio || 1, 3);
      const s = (rect.width / FIELD.w) * dpr;
      const w = Math.round(FIELD.w * s);
      const h = Math.round(FIELD.h * s);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      S.current.scale = s;
      S.current.gradKey = -1; // gradient is in device space, rebuild it
    };

    // Resolve the real family names once, out of the loop — canvas fonts
    // cannot read CSS custom properties.
    try {
      const cs = getComputedStyle(canvas);
      const serif = cs.getPropertyValue("--font-tinos").trim() || "Georgia";
      const sans = cs.getPropertyValue("--font-outfit").trim() || "system-ui";
      S.current.labelFont = `500 10px ${sans}, system-ui, sans-serif`;
      S.current.initialFont = `700 30px ${sans}, system-ui, sans-serif`;
      S.current.emojiFont = `${SPAWN.itemSize}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",${serif},sans-serif`;
      S.current.emojiFontBad = `${Math.round(
        SPAWN.itemSize * 1.15,
      )}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",${serif},sans-serif`;
    } catch {
      /* keep the defaults */
    }

    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(canvas);
    // Rotation: the observer fires, state in refs is untouched, nothing restarts.
    window.addEventListener("orientationchange", apply);
    return () => {
      ro.disconnect();
      window.removeEventListener("orientationchange", apply);
    };
  }, [canvasRef]);

  // ── Input: first active pointer only, plus arrow keys ──────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let activeId: number | null = null;

    const toLogical = (clientX: number) => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width < 2) return FIELD.w / 2;
      return ((clientX - rect.left) / rect.width) * FIELD.w;
    };
    const aim = (clientX: number) => {
      const s = S.current;
      // Input is ignored while stunned — the flinch has to cost something.
      if (performance.now() < s.stunUntil) return;
      const x = toLogical(clientX);
      s.targetX = x < MIN_X ? MIN_X : x > MAX_X ? MAX_X : x;
    };

    const down = (e: PointerEvent) => {
      if (activeId !== null) return; // rapid multi-touch: first pointer wins
      activeId = e.pointerId;
      try {
        canvas.setPointerCapture(e.pointerId);
      } catch {
        /* capture is a nicety */
      }
      aim(e.clientX);
    };
    const move = (e: PointerEvent) => {
      if (activeId !== e.pointerId) return;
      aim(e.clientX);
    };
    const up = (e: PointerEvent) => {
      if (activeId !== e.pointerId) return;
      activeId = null;
    };
    const key = (e: KeyboardEvent) => {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      const s = S.current;
      if (performance.now() < s.stunUntil) return;
      e.preventDefault();
      const next = s.targetX + (e.key === "ArrowLeft" ? -28 : 28);
      s.targetX = next < MIN_X ? MIN_X : next > MAX_X ? MAX_X : next;
    };

    canvas.addEventListener("pointerdown", down);
    canvas.addEventListener("pointermove", move);
    canvas.addEventListener("pointerup", up);
    canvas.addEventListener("pointercancel", up);
    window.addEventListener("keydown", key);
    return () => {
      canvas.removeEventListener("pointerdown", down);
      canvas.removeEventListener("pointermove", move);
      canvas.removeEventListener("pointerup", up);
      canvas.removeEventListener("pointercancel", up);
      window.removeEventListener("keydown", key);
    };
  }, [canvasRef]);

  // ── The loop ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!running) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    reset();
    const s = S.current;
    const pool = poolRef.current!;
    const parts = partRef.current!;
    let stopped = false;

    // ── helpers that mutate pooled objects, never allocate ───────────────────
    function freeItem(): PoolItem | null {
      for (let i = 0; i < pool.length; i++) if (!pool[i].active) return pool[i];
      return null;
    }
    function activeCount(): number {
      let n = 0;
      for (let i = 0; i < pool.length; i++) if (pool[i].active && pool[i].state === STATE_FALLING) n++;
      return n;
    }
    function launch(good: boolean, idx: number) {
      const it = freeItem();
      if (!it) return;
      const r = good ? GOOD_R : BAD_R;
      it.active = true;
      it.good = good;
      it.idx = idx;
      it.baseX = r + 6 + s.rng() * (FIELD.w - (r + 6) * 2);
      it.phase = s.rng() * TAU;
      it.x = it.baseX;
      it.y = -r - 10;
      it.age = 0;
      it.state = STATE_FALLING;
      it.fx = 0;
      if (good) s.inFlight[idx] = true;
    }
    function shatter(x: number, y: number) {
      let made = 0;
      for (let i = 0; i < parts.length && made < PARTICLES_PER_SHATTER; i++) {
        const p = parts[i];
        if (p.active) continue;
        const a = -Math.PI / 2 + (made / PARTICLES_PER_SHATTER - 0.5) * 2.2;
        const sp = 90 + s.rng() * 80;
        p.active = true;
        p.x = x;
        p.y = y;
        p.vx = Math.cos(a) * sp;
        p.vy = Math.sin(a) * sp;
        p.life = 0;
        made++;
      }
    }

    // ── silent dynamic difficulty ────────────────────────────────────────────
    function registerCatch() {
      s.missStreak = 0;
      s.catchStreak++;
      // Recover gradually from any earlier mercy.
      if (s.ratio > SPAWN.goodToBadRatio) s.ratio -= 1;
      if (s.speedMul < 1) s.speedMul = Math.min(1, s.speedMul + (1 - s.speedMul) * 0.34);
      if (s.catchStreak % DIFFICULTY.catchStreakTrigger === 0) {
        s.speedMul = Math.min(
          DIFFICULTY.maxSpeedMultiplier,
          s.speedMul * DIFFICULTY.catchSpeedMultiplier,
        );
      }
    }
    function registerMiss() {
      s.catchStreak = 0;
      s.missStreak++;
      if (s.missStreak % DIFFICULTY.missStreakTrigger === 0) {
        s.speedMul = Math.max(MIN_SPEED_MULTIPLIER, s.speedMul * DIFFICULTY.missSpeedMultiplier);
        s.ratio = DIFFICULTY.missGoodToBadRatio;
      }
    }

    function finish() {
      if (s.ended) return;
      s.ended = true;
      const d = dataRef.current;
      const missed: string[] = [];
      for (let i = 0; i < d.goodItems.length; i++) {
        const id = d.goodItems[i].id;
        if (s.caught.indexOf(id) === -1) missed.push(id);
      }
      cbRef.current.onEnd({ caughtIds: s.caught.slice(), missedIds: missed, dodged: s.dodged });
    }

    // ── simulate ─────────────────────────────────────────────────────────────
    function step(dt: number, now: number) {
      const d = dataRef.current;
      s.elapsed += dt;

      // Player LERP, normalised by delta time so 120 Hz and 45 Hz feel alike.
      // Deliberately laggy: PLAYER.lerp is per 60 Hz frame, not per second.
      const t = 1 - Math.pow(1 - PLAYER.lerp, dt / FRAME_MS);
      s.px += (s.targetX - s.px) * t;
      if (s.px < MIN_X) s.px = MIN_X;
      if (s.px > MAX_X) s.px = MAX_X;

      if (s.catchFx > 0) s.catchFx = Math.max(0, s.catchFx - dt);
      if (s.hitFx > 0) s.hitFx = Math.max(0, s.hitFx - dt);
      if (s.vignette > 0) s.vignette = Math.max(0, s.vignette - dt);

      // Spawn cadence tightens across the run.
      const prog = d.durationMs > 0 ? Math.min(1, s.elapsed / d.durationMs) : 1;
      const interval =
        SPAWN.startIntervalMs + (SPAWN.endIntervalMs - SPAWN.startIntervalMs) * prog;
      s.spawnTimer -= dt;
      if (s.spawnTimer <= 0) {
        s.spawnTimer += interval;
        if (activeCount() < SPAWN.maxConcurrent) {
          const wantBad = d.badItems.length > 0 && s.goodSinceBad >= s.ratio;
          let spawnedGood = false;
          if (!wantBad) {
            // Each good item is in flight at most once, and a caught one never
            // comes back — the letter has a fixed number of lines.
            for (let i = 0; i < s.pending.length; i++) {
              const idx = s.pending[i];
              const cand = d.goodItems[idx];
              if (!cand) continue; // the editor deleted it mid-run
              if (s.inFlight[idx]) continue;
              if (s.caught.indexOf(cand.id) !== -1) continue;
              // Manual removal: Array#splice returns a new array, and nothing
              // inside this loop is allowed to allocate.
              for (let k = i; k < s.pending.length - 1; k++) s.pending[k] = s.pending[k + 1];
              s.pending.pop();
              launch(true, idx);
              s.goodSinceBad++;
              spawnedGood = true;
              break;
            }
          }
          if (!spawnedGood && d.badItems.length > 0) {
            launch(false, s.badOrder[s.badCursor % s.badOrder.length]);
            s.badCursor++;
            s.goodSinceBad = 0;
          }
        }
      }

      const stunned = now < s.stunUntil;
      const py = PLAYER_Y;

      for (let i = 0; i < pool.length; i++) {
        const it = pool[i];
        if (!it.active) continue;

        if (it.state !== STATE_FALLING) {
          it.fx += dt;
          if (it.fx >= (it.state === STATE_CAUGHT ? CATCH_FX_MS : SHATTER_FX_MS)) it.active = false;
          continue;
        }

        it.age += dt;
        it.y += SPAWN.fallSpeed * s.speedMul * (dt / 1000);
        // Sine sway, phase seeded per item — nothing falls in a straight line.
        it.x = it.baseX + Math.sin((it.age / SPAWN.swayPeriodMs) * TAU + it.phase) * SPAWN.swayAmplitude;

        const r = it.good ? GOOD_R : BAD_R;
        const dx = it.x - s.px;
        const dy = it.y - py;
        const reach = it.good ? GOOD_HIT : BAD_HIT;
        // The editor can delete an item between frames; retire the sprite
        // rather than dereferencing a hole.
        const src = it.good ? d.goodItems[it.idx] : d.badItems[it.idx];
        if (!src) {
          it.active = false;
          if (it.good) s.inFlight[it.idx] = false;
          continue;
        }

        if (dx * dx + dy * dy <= reach * reach) {
          if (it.good) {
            // A catch always lands, even mid-stun. Being hit must never cost
            // them a line.
            const item = d.goodItems[it.idx];
            if (s.caught.indexOf(item.id) === -1) s.caught.push(item.id);
            s.inFlight[it.idx] = false;
            registerCatch();
            it.state = STATE_CAUGHT;
            it.fx = 0;
            s.catchFx = PLAYER.catchRecoverMs;
            // The parent owns `warmthRef` — progress is measured against the
            // whole letter, not just this round's subset.
            cbRef.current.onCatch(item, s.catchStreak);
            if (s.caught.length >= d.goodItems.length && s.endAt === 0) {
              s.endAt = s.elapsed + END_GRACE_MS;
            }
            continue;
          }
          if (!stunned) {
            it.state = STATE_SHATTERED;
            it.fx = 0;
            shatter(it.x, it.y);
            s.stunUntil = now + PLAYER.stunMs;
            s.hitFx = PLAYER.stunMs;
            s.vignette = VIGNETTE_MS;
            cbRef.current.onHit(s.stunUntil);
            // NOTHING is removed from `s.caught` here. By design.
            continue;
          }
        }

        if (it.y - r > FIELD.h) {
          it.active = false;
          if (it.good) {
            s.inFlight[it.idx] = false;
            s.pending.push(it.idx); // back in the queue — lines are never lost
            registerMiss();
          } else {
            s.dodged++;
          }
        }
      }

      for (let i = 0; i < parts.length; i++) {
        const p = parts[i];
        if (!p.active) continue;
        p.life += dt;
        if (p.life >= SHATTER_FX_MS) {
          p.active = false;
          continue;
        }
        p.x += p.vx * (dt / 1000);
        p.y += p.vy * (dt / 1000);
        p.vy += 620 * (dt / 1000);
      }

      if (s.endAt > 0 && s.elapsed >= s.endAt) finish();
      else if (d.durationMs > 0 && s.elapsed >= d.durationMs) finish();
    }

    // ── draw ─────────────────────────────────────────────────────────────────
    function draw(now: number) {
      const d = dataRef.current;
      const sc = s.scale;
      ctx!.setTransform(sc, 0, 0, sc, 0, 0);

      // Background warms continuously as lines arrive. Gradient is cached and
      // only rebuilt when the warmth bucket moves — no allocation per frame.
      const bucket = Math.round(warmthRef.current * 24);
      if (s.gradKey !== bucket || s.grad === null) {
        const w = warmthRef.current;
        const g = ctx!.createLinearGradient(0, 0, 0, FIELD.h);
        g.addColorStop(0, mix(COOL_TOP, WARM_TOP, w));
        g.addColorStop(1, mix(COOL_BOT, WARM_BOT, w));
        s.grad = g;
        s.gradKey = bucket;
      }
      ctx!.fillStyle = s.grad;
      ctx!.fillRect(0, 0, FIELD.w, FIELD.h);

      // Items.
      ctx!.textAlign = "center";
      ctx!.textBaseline = "middle";
      for (let i = 0; i < pool.length; i++) {
        const it = pool[i];
        if (!it.active) continue;
        if (it.state === STATE_SHATTERED) continue;
        const src = it.good ? d.goodItems[it.idx] : d.badItems[it.idx];
        if (!src) continue;

        const caughtP = it.state === STATE_CAUGHT ? it.fx / CATCH_FX_MS : 0;
        const scale = it.state === STATE_CAUGHT ? 1 + 0.4 * caughtP : 1;
        const alpha = it.state === STATE_CAUGHT ? 1 - caughtP : 1;

        ctx!.save();
        ctx!.globalAlpha = alpha;
        ctx!.translate(it.x, it.y);
        if (scale !== 1) ctx!.scale(scale, scale);

        if (!it.good) {
          ctx!.fillStyle = "rgba(196,85,63,0.16)";
          ctx!.beginPath();
          ctx!.arc(0, 0, BAD_R + 5, 0, TAU);
          ctx!.fill();
        }
        ctx!.font = it.good ? s.emojiFont : s.emojiFontBad;
        ctx!.fillStyle = "#2c2a26";
        ctx!.fillText(src.emoji, 0, 0);

        // The label is what makes an object theirs rather than generic.
        const label = src.label;
        if (label) {
          ctx!.font = s.labelFont;
          ctx!.fillStyle = it.good ? "rgba(44,42,38,0.62)" : "rgba(150,58,42,0.75)";
          ctx!.fillText(label, 0, (it.good ? GOOD_R : BAD_R) + 11);
        }
        ctx!.restore();
      }

      // Shatter particles.
      ctx!.fillStyle = "rgba(196,85,63,0.7)";
      for (let i = 0; i < parts.length; i++) {
        const p = parts[i];
        if (!p.active) continue;
        ctx!.globalAlpha = 1 - p.life / SHATTER_FX_MS;
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, 3, 0, TAU);
        ctx!.fill();
      }
      ctx!.globalAlpha = 1;

      // Player.
      const stunned = now < s.stunUntil;
      let sx = 1;
      let sy = 1;
      if (s.catchFx > 0) {
        const p = 1 - s.catchFx / PLAYER.catchRecoverMs;
        const k = Math.cos(p * Math.PI * 1.5) * (1 - p); // recover with overshoot
        sx = 1 + (PLAYER.catchScaleX - 1) * k;
        sy = 1 + (PLAYER.catchScaleY - 1) * k;
      }
      let rot = 0;
      let shake = 0;
      if (s.hitFx > 0) {
        const p = s.hitFx / PLAYER.stunMs;
        rot = Math.sin((1 - p) * 26) * PLAYER.hitRotateDeg * DEG * p;
        shake = Math.sin((1 - p) * 48) * PLAYER.hitShakePx * p;
      }

      ctx!.save();
      ctx!.translate(s.px + shake, PLAYER_Y);
      if (rot !== 0) ctx!.rotate(rot);
      ctx!.scale(sx, sy);

      ctx!.beginPath();
      ctx!.arc(0, 0, PLAYER.radius + 3, 0, TAU);
      ctx!.fillStyle = "rgba(255,253,247,0.92)";
      ctx!.fill();

      ctx!.save();
      ctx!.beginPath();
      ctx!.arc(0, 0, PLAYER.radius, 0, TAU);
      ctx!.clip();
      if (stunned) ctx!.filter = "saturate(0.4)";
      const img = faceRef.current;
      if (img) {
        drawCover(ctx!, img, -PLAYER.radius, -PLAYER.radius, PLAYER.radius * 2);
      } else {
        // Default path, not an error path: a warm disc with their initial.
        ctx!.fillStyle = d.faceFillColor;
        ctx!.fillRect(-PLAYER.radius, -PLAYER.radius, PLAYER.radius * 2, PLAYER.radius * 2);
        ctx!.fillStyle = "rgba(255,253,247,0.95)";
        ctx!.font = s.initialFont;
        ctx!.textAlign = "center";
        ctx!.textBaseline = "middle";
        ctx!.fillText(d.initial, 0, 1);
      }
      ctx!.filter = "none";
      ctx!.restore();

      ctx!.beginPath();
      ctx!.arc(0, 0, PLAYER.radius, 0, TAU);
      ctx!.lineWidth = 2;
      ctx!.strokeStyle = stunned ? "rgba(196,85,63,0.85)" : "rgba(44,42,38,0.28)";
      ctx!.stroke();
      ctx!.restore();

      // Red screen-edge vignette on a hit.
      if (s.vignette > 0) {
        const a = (s.vignette / VIGNETTE_MS) * 0.5;
        ctx!.save();
        ctx!.globalAlpha = a;
        ctx!.strokeStyle = "#c4553f";
        for (let i = 0; i < 5; i++) {
          ctx!.globalAlpha = a * (1 - i / 5) * 0.55;
          ctx!.lineWidth = 6;
          ctx!.strokeRect(i * 5 + 3, i * 5 + 3, FIELD.w - (i * 5 + 3) * 2, FIELD.h - (i * 5 + 3) * 2);
        }
        ctx!.restore();
        ctx!.globalAlpha = 1;
      }

      // HUD: a thin draining bar, top-right. No numbers, no score, no combo.
      const total = d.durationMs > 0 ? d.durationMs : 1;
      const left = Math.max(0, 1 - s.elapsed / total);
      ctx!.fillStyle = "rgba(44,42,38,0.14)";
      ctx!.fillRect(FIELD.w - 118, 16, 100, 4);
      ctx!.fillStyle = "rgba(44,42,38,0.42)";
      ctx!.fillRect(FIELD.w - 118, 16, 100 * left, 4);
    }

    function frame(ts: number) {
      if (stopped) return;
      if (s.lastTs === 0) s.lastTs = ts;
      let dt = ts - s.lastTs;
      s.lastTs = ts;
      // A stall (GC, backgrounded tab, a slow paint) must not teleport anything.
      if (dt < 0) dt = 0;
      if (dt > MAX_STEP_MS) dt = MAX_STEP_MS;
      if (!s.ended) step(dt, ts);
      draw(ts);
      if (!s.ended) s.raf = requestAnimationFrame(frame);
    }

    // Backgrounding: stop the loop and drop the timestamp, so returning starts
    // a fresh delta instead of one worth however long they were away.
    const onVis = () => {
      if (document.hidden) {
        cancelAnimationFrame(s.raf);
        s.raf = 0;
      } else if (!stopped && !s.ended) {
        s.lastTs = 0;
        // Stun should not survive being away.
        if (s.stunUntil > performance.now()) s.stunUntil = performance.now() + 80;
        s.raf = requestAnimationFrame(frame);
      }
    };
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("pagehide", onVis);

    s.raf = requestAnimationFrame(frame);
    return () => {
      stopped = true;
      cancelAnimationFrame(s.raf);
      s.raf = 0;
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("pagehide", onVis);
    };
  }, [running, roundKey, reset, canvasRef, faceRef, warmthRef]);
}
