"use client";

// ⚠ DEV-ONLY LAB — DELETE BEFORE RELEASE. See ./page.tsx.

import { useState, type CSSProperties, type ReactNode } from "react";
import {
  CinematicPhoto, FilmGrain, Fluent3D, FLUENT_KEYS, GlowParticles, HoldToReveal, LightLeak, ParallaxLayer, PremiumCTA,
  RevealText, SceneTransition, ShaderBackdrop, TiltCard, Vignette, requestTiltPermission, useGyroParallax,
  type BackdropPreset, type CtaTone, type GlowPreset, type TransitionVariant,
} from "../(templates)/_valentine/kit/premium";

const PRESETS: BackdropPreset[] = ["velvet", "aurora", "candle", "nebula", "fog", "bokeh", "rosegold"];
const PARTICLES: GlowPreset[] = ["petals", "embers", "fireflies", "hearts", "sparkles", "snow", "bats"];
const VARIANTS: TransitionVariant[] = ["iris", "ink", "fold", "flash"];
const PHOTO = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=900&h=1125&fit=crop&auto=format";
const PHOTO2 = "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=900&h=1600&fit=crop&auto=format";

const serif = "'Cormorant Garamond', var(--font-playfair, 'Playfair Display'), Georgia, serif";
const ui = "var(--font-vw-ui, 'DM Sans'), system-ui, sans-serif";
const eyebrow: CSSProperties = { font: `500 11px/1 ${ui}`, letterSpacing: ".32em", textTransform: "uppercase", opacity: 0.7, margin: 0 };
const section: CSSProperties = { position: "relative", zIndex: 2, minHeight: "100svh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 28, padding: "72px 24px", textAlign: "center" };

function Chips<T extends string>({ items, value, onPick }: { items: readonly T[]; value: T; onPick: (v: T) => void }) {
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center" }}>
      {items.map((p) => (
        <button key={p} type="button" onClick={() => onPick(p)} style={{ minHeight: 30, padding: "0 12px", borderRadius: 99, border: "1px solid rgba(255,255,255,.25)", background: p === value ? "rgba(255,255,255,.9)" : "rgba(0,0,0,.25)", color: p === value ? "#111" : "#fff", font: `500 12px/1 ${ui}`, cursor: "pointer" }}>
          {p}
        </button>
      ))}
    </div>
  );
}

function Scene({ i }: { i: number }): ReactNode {
  const bgs = ["linear-gradient(160deg,#2a0a14,#7a0f2b)", "linear-gradient(160deg,#081226,#1d4b6b)", "linear-gradient(160deg,#1c0f05,#8a4b12)"];
  const keys = ["love-letter", "crystal-ball", "gift"] as const;
  const words = ["Chapter one", "Chapter two", "Chapter three"];
  return (
    <div style={{ position: "absolute", inset: 0, background: bgs[i % 3], display: "grid", placeItems: "center", alignContent: "center", gap: 10, color: "#fff" }}>
      <Fluent3D name={keys[i % 3]} size={120} />
      <p style={{ font: `italic 500 28px/1.1 ${serif}`, margin: 0 }}>{words[i % 3]}</p>
    </div>
  );
}

export default function Lab({ preset: p0, particles: q0, tone: t0 }: { preset?: string; particles?: string; tone?: string }) {
  const [preset, setPreset] = useState<BackdropPreset>(PRESETS.includes(p0 as BackdropPreset) ? (p0 as BackdropPreset) : "velvet");
  const [particles, setParticles] = useState<GlowPreset>(PARTICLES.includes(q0 as GlowPreset) ? (q0 as GlowPreset) : "petals");
  const tone = (["gold", "rose", "ember", "pearl"].includes(t0 ?? "") ? t0 : "gold") as CtaTone;
  const [variant, setVariant] = useState<TransitionVariant>("iris");
  const [scene, setScene] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const par = useGyroParallax();
  const halloween = preset === "fog" || preset === "nebula";

  return (
    <main style={{ position: "relative", color: "#fff8ef", background: "#000", overflowX: "hidden" }}>
      <ShaderBackdrop preset={preset} parallax />
      <GlowParticles preset={particles} density={0.55} z={1} />
      <LightLeak color={halloween ? "#ff7a2f" : "#ff8a7a"} />
      <Vignette strength={0.6} />
      <FilmGrain />

      {/* 1 — hero */}
      <section style={section}>
        <ParallaxLayer par={par} depth={18}>
          <Fluent3D name={halloween ? "jack-o-lantern" : "rose"} size={168} glow={halloween ? "#ff8a3d" : "#ff5c8a"} eager />
        </ParallaxLayer>
        <p style={eyebrow}>For Aanya · 14 February</p>
        <RevealText as="h1" text="Every road led back to you" style={{ font: `italic 400 46px/1.02 ${serif}`, letterSpacing: "-.01em", maxWidth: 340 }} delay={0.3} />
        <PremiumCTA tone={tone} onClick={() => void requestTiltPermission()}>Open your gift</PremiumCTA>
      </section>

      {/* 2 — tilt polaroid */}
      <section style={section}>
        <p style={eyebrow}>The first photo</p>
        <TiltCard radius={4} style={{ width: 280 }}>
          <CinematicPhoto photo={PHOTO} grade="warm" caption="Goa, the day it rained" />
        </TiltCard>
        <TiltCard radius={14} foil style={{ width: 240 }}>
          <div style={{ aspectRatio: "3 / 4", background: "linear-gradient(160deg,#3a0d1c,#8a1c3c 60%,#d9927f)", display: "grid", placeItems: "center", padding: 20 }}>
            <div>
              <p style={{ ...eyebrow, color: "#ffe6c8" }}>Admit two</p>
              <p style={{ font: `italic 500 34px/1 ${serif}`, margin: "14px 0 0", color: "#fff3e0" }}>Forever, row A</p>
            </div>
          </div>
        </TiltCard>
      </section>

      {/* 3 — full-bleed still */}
      <section style={{ position: "relative", zIndex: 2, height: "100svh" }}>
        <CinematicPhoto photo={PHOTO2} frame="full" grade="tealorange" letterbox kenBurns="in" caption="Somewhere above the clouds" />
      </section>

      {/* 4 — type */}
      <section style={section}>
        <p style={eyebrow}>Blur-in · handwriting</p>
        <RevealText as="h2" mode="blur" text="Aanya" style={{ font: `500 72px/1 ${serif}`, letterSpacing: ".02em" }} />
        <RevealText mode="handwrite" text="Forever yours" ink="#ffd9a0" style={{ fontSize: 64, width: "100%", maxWidth: 340 }} delay={0.4} />
        <RevealText text="Some people arrive like weather. You arrived like home — quietly, and all at once." style={{ font: `400 21px/1.45 ${serif}`, maxWidth: 320, opacity: 0.9 }} />
      </section>

      {/* 5 — hold */}
      <section style={section}>
        <p style={eyebrow}>Hold to reveal</p>
        {revealed ? (
          <Fluent3D name={halloween ? "crystal-ball" : "ring"} size={180} glow="#ffd27a" />
        ) : (
          <HoldToReveal label="Hold to open" tone={tone} onComplete={() => setRevealed(true)}>
            <Fluent3D name={halloween ? "candle" : "gift"} size={64} float={false} shadow={false} />
          </HoldToReveal>
        )}
        <PremiumCTA tone="pearl" cue={null} onClick={() => setRevealed(false)}>Reset</PremiumCTA>
      </section>

      {/* 6 — transitions */}
      <section style={section}>
        <p style={eyebrow}>Scene transitions</p>
        <Chips items={VARIANTS} value={variant} onPick={setVariant} />
        <div style={{ width: "100%", maxWidth: 340, height: 440, borderRadius: 18, overflow: "hidden", boxShadow: "0 30px 60px -20px rgba(0,0,0,.6)" }}>
          <SceneTransition sceneKey={String(scene)} variant={variant}>
            <Scene i={scene} />
          </SceneTransition>
        </div>
        <PremiumCTA tone={tone} onClick={() => setScene((s) => s + 1)}>Next chapter</PremiumCTA>
      </section>

      {/* 7 — the Fluent set */}
      <section style={{ ...section, justifyContent: "flex-start" }}>
        <p style={eyebrow}>Fluent 3D · {FLUENT_KEYS.length} objects</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, width: "100%", maxWidth: 360 }}>
          {FLUENT_KEYS.map((k, i) => (
            <div key={k} style={{ display: "grid", justifyItems: "center", gap: 2 }}>
              <Fluent3D name={k} size={64} phase={i * 0.37} shadow={false} />
              <span style={{ font: `400 9px/1.2 ${ui}`, opacity: 0.6 }}>{k}</span>
            </div>
          ))}
        </div>
      </section>

      {/* controls */}
      <div style={{ position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 90, padding: "10px 12px calc(10px + env(safe-area-inset-bottom))", display: "grid", gap: 6, background: "linear-gradient(transparent, rgba(0,0,0,.65))" }}>
        <Chips items={PRESETS} value={preset} onPick={setPreset} />
        <Chips items={PARTICLES} value={particles} onPick={setParticles} />
      </div>
    </main>
  );
}
