# Cinema kit — the visual baseline for ✦ Premium pages

Everything here is exported from `../index.ts`, so a premium Experience imports it next to the rest of the kit:

```tsx
import { ShaderBackdrop, FilmGrain, Vignette, Fluent3D, RevealText, PremiumCTA } from "../../_valentine/kit/premium";
```

(The dev-only `/cinema-lab` page that showed every component was removed before release; see commit a5c80ce to restore it.)

## The page stack (z order)

```
ShaderBackdrop (z 0, fixed)  →  GlowParticles (z 1)  →  your scene (z 2+)
→ LightLeak (68) → Vignette (69) → FilmGrain (70)  →  top bar / dock / SkipChip (90+)
```

Mount ONE backdrop and ONE particle layer per page and change their `preset` between scenes; don't mount one per scene.

## Components

**ShaderBackdrop** — full-bleed raw-WebGL fragment shader: `velvet` (silk folds, Valentine), `aurora`, `candle` (breathing low glow, light shafts, dust), `nebula`, `fog` (rolling ground fog, Halloween), `bokeh`, `rosegold` (liquid metal). `colors` is `[deep, mid, highlight]`; defaults live in `BACKDROP_COLORS`.

```tsx
<ShaderBackdrop preset="velvet" />
<ShaderBackdrop preset="fog" colors={["#07060d", "#4a4560", "#ffcf8a"]} intensity={1.2} speed={0.8} parallax />
<ShaderBackdrop preset="candle" fixed={false} />   {/* absolute, inside a relative parent */}
```

Perf: draws at 0.55 × CSS size × min(DPR, 1.5), so the GPU shades about 1/7 of the screen's pixels and the browser upsamples it. Touch devices run it at 30 fps, desktop at 60. If frames keep running long it drops to 0.36 scale by itself. It stops when the tab is hidden or the canvas is off screen. The page never holds more than 2 WebGL contexts: extra backdrops get the CSS gradient instead (`backdropGradient()`). On unmount it calls `WEBGL_lose_context`. With reduced motion it draws one still frame. Without WebGL you get the CSS gradient, which is also what paints first.

**FilmGrain / Vignette / LightLeak** — the "shot on film" finish. They cost no JS per frame: the grain is an SVG-turbulence tile moved by a stepped CSS transform, and the leak is two blurred gradients on an 11 s keyframe. All are `pointer-events: none` and hold still under reduced motion.

```tsx
<LightLeak color="#ff8a7a" corner="top-right" />
<Vignette strength={0.6} />
<FilmGrain opacity={0.07} />
```

**TiltCard** — makes a photo, polaroid, ticket or card feel physical. It tilts toward the pointer (desktop), a finger, or the gyro (phones), with a glare that moves against the tilt, a lift shadow, and an optional holographic `foil`. It sways slowly when idle and pauses off screen. iOS gyro needs `requestTiltPermission()` called **inside** a user gesture (your gate/start button).

```tsx
<PremiumCTA onClick={() => { void requestTiltPermission(); start(); }}>Open</PremiumCTA>
<TiltCard radius={4} style={{ width: 280 }}>
  <CinematicPhoto photo={data.photos[0]} grade="warm" />
</TiltCard>
```

**CinematicPhoto** — a photo treated like a film still. It keeps the sender's crop (`LovePhoto` cropX/cropY/scale via `CroppedPhoto`). On entering view it focus-pulls once (blur → sharp), then drifts slowly (Ken Burns, a CSS transform). It takes a colour `grade` (`warm` · `tealorange` · `noir` · `rose` · `none`), optional 2.39:1 `letterbox` bars, and a caption in Cormorant italic. `frame="framed"` puts it on a paper mat; `frame="full"` bleeds it to the edges with the caption over a scrim.

```tsx
<CinematicPhoto photo={p} grade="rose" caption="Our first trip" />
<section style={{ height: "100svh" }}>
  <CinematicPhoto photo={p} frame="full" letterbox kenBurns="out" grade="tealorange" />
</section>
```

**RevealText** — editorial headline reveals. `mask` measures which line each word landed on and slides each LINE up out of a mask, so it is a true per-line reveal at any width. `blur` brings letters in one by one, but each word is a nowrap box, so lines never break mid-word. `handwrite` draws the stroke while a wipe travels left → right, then fills it; it wraps by words at `maxChars`. Every mode starts at 30% visibility, or when you pass `play`. Screen readers get the plain string.

```tsx
<RevealText as="h1" text="Every road led back to you" style={{ font: "italic 400 46px/1.02 'Cormorant Garamond'" }} />
<RevealText mode="blur" text={name} style={{ fontSize: 72 }} delay={0.3} />
<RevealText mode="handwrite" text="Forever yours" ink="#ffd9a0" style={{ fontSize: 64 }} />
```

**PremiumCTA / MagneticButton / HoldToReveal** — the one primary action per screen. PremiumCTA has a metallic `tone` (`gold` · `rose` · `ember` · `pearl`), an inner highlight, and a shimmer sweep every 4 s. On fine pointers it pulls toward the cursor. Pressing it sinks the button 2 px, fires a haptic tick and plays an sfx `cue` (default `"tick"`; muted pages stay silent). HoldToReveal wraps `useHoldProgress` in a glowing progress ring. Five taps, or holding Space/Enter, also complete it.

```tsx
<PremiumCTA tone="rose" cue="chime" onClick={next}>Read the letter</PremiumCTA>
<HoldToReveal label="Hold to light the candle" tone="ember" onComplete={light}>
  <Fluent3D name="candle" size={64} float={false} shadow={false} />
</HoldToReveal>
```

**GlowParticles** — depth-of-field particles: `petals` · `embers` · `fireflies` · `hearts` · `sparkles` · `snow` · `bats`. Each sprite (soft glow, shaded petal, glossy heart, 4-frame bat) is pre-rendered once per colour to an offscreen canvas, so a frame is only `drawImage` calls. Particles sit on three depth layers drawn on two canvases. A blurred canvas holds the far layer plus a few huge foreground bokeh particles. A sharp canvas holds the mid layer. Glowing presets draw additively. Use the older `ParticleField` only when you want the flat look.

```tsx
<GlowParticles preset="petals" density={0.55} />
<GlowParticles preset="embers" colors={["#ffb067", "#ff7a2f"]} speed={0.8} />
```

Budget: up to 90 sprites on phones and up to 160 from 1024 px, scaled by `density`. DPR is capped at 2. It stops when hidden or off screen; under reduced motion it draws one still frame.

**Fluent3D** — real 3D-rendered objects (Microsoft Fluent UI Emoji "3D", MIT) instead of flat hand-drawn SVG. Each is a 256 px WebP of about 5 KB on the CDN, with a composited float/bob, a breathing contact shadow and an optional `glow`. Keep `size` ≤ 200 px for crispness at DPR 2. `FLUENT_KEYS` lists the 56 keys and `fluentUrl(key)` gives the URL.

```tsx
<Fluent3D name="rose" size={168} glow="#ff5c8a" eager />
<Fluent3D name="jack-o-lantern" size={180} period={6.2} phase={1.3} />
```

**SceneTransition** — chapter changes that feel like a cut: `iris` (an aperture opens while the old scene sinks back), `ink` (a turbulence-edged ink blot bleeds out), `fold` (the old scene turns away like a page on its left edge) and `flash` (a warm light flash). It uses masks, clip-paths and transforms only. Both scenes are absolutely stacked, so **give the parent a size**. Reduced motion gets a 250 ms crossfade.

```tsx
<div style={{ position: "relative", height: "100svh" }}>
  <SceneTransition sceneKey={sc.scene} variant="ink" origin="50% 70%">{render(sc.scene)}</SceneTransition>
</div>
```

**useGyroParallax / ParallaxLayer** — layered depth from the mouse or the gyro, exposed as spring-smoothed framer-motion values in −1…1. The page shares a single listener, and reduced motion holds the values at 0.

```tsx
const par = useGyroParallax();
<ParallaxLayer par={par} depth={6}><Moon /></ParallaxLayer>          {/* far: small shift */}
<ParallaxLayer par={par} depth={24} rotate={6}><Fluent3D name="ghost" /></ParallaxLayer>
```

## Perf rules

- One backdrop, one particle layer, at most 2 WebGL contexts per page. Switch presets instead of stacking more.
- Animate only transforms and opacity. The only blur that animates is CinematicPhoto's one-shot focus pull. Don't animate `filter` on big layers in a loop.
- Every rAF loop here pauses off screen and when the tab is hidden. Copy that pattern if you write your own.
- Target 390×844 on a mid-range Android: 50–60 fps with the full stack (backdrop + particles + overlays) mounted.

## Craft rules

- **Type:** two typefaces at most: a display serif (Cormorant Garamond italic, or the template's) and one UI sans (DM Sans). Scale: 11 px tracked caps eyebrow (letter-spacing .3em) / 19–21 px body serif / 44–72 px display. Display line-height 1.0–1.05; body 1.45.
- **Words:** never more than ~25 words on screen at once. One headline, one line of support, one action.
- **Space:** generous negative space. Keep 24 px side gutters and at least 28 px between blocks; let the backdrop breathe.
- **Focus:** one focal object per screen (a Fluent3D object, a photo, or a name), centred or on a third, with everything else quieter.
- **Easing:** `cubic-bezier(.22,1,.36,1)` (`EASE_OUT`) for entrances, `cubic-bezier(.65,0,.35,1)` (`EASE_IN_OUT`) for wipes and exits. Durations: 0.6–1.2 s for reveals, 0.25 s for UI feedback. Nothing bounces unless it's a toy.
- **Sound:** every primary interaction has a cue (PremiumCTA does it for you) and every cue has a visual twin.
- **Colour:** three colours per scene (deep, mid, highlight) and pass the same triple to the backdrop, particles and CTA tone. Finish every screen with grain + vignette.
- **Motion budget:** one hero motion at a time. When the headline reveals, the object floats quietly; when the CTA appears, nothing else enters.

## Fluent3D assets

The source PNGs are `github.com/microsoft/fluentui-emoji/assets/<Folder Name>/3D/<folder_name>_3d.png`. They were converted to 256 px WebP into `media-src/templates/_premium/fluent/<key>.webp` and uploaded with:

```sh
AWS_PROFILE=subhsandesh aws s3 cp media-src/templates/_premium/fluent/ \
  s3://subhsandesh-prod/gifts-media/templates/_premium/fluent/ --recursive \
  --cache-control "public, max-age=31536000, immutable" --content-type image/webp
```

They are served from `https://cdn.subhsandesh.in/gifts-media/templates/_premium/fluent/<key>.webp` (`templateMedia("_premium/fluent", …)`). To add a key, convert and upload the new file the same way, then add the key to `FLUENT_KEYS`.
