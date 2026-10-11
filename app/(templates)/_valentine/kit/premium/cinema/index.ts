// The cinema kit — the shared visual baseline for every ✦ Premium page.
// Usage, perf notes and craft rules: ./README.md. Re-exported from ../index.ts.

export { default as ShaderBackdrop, BACKDROP_COLORS, backdropGradient, type BackdropPreset, type ShaderBackdropProps } from "./ShaderBackdrop";
export { FilmGrain, Vignette, LightLeak, CinemaStyles } from "./Overlays";
export { default as TiltCard, type TiltCardProps } from "./TiltCard";
export { default as CinematicPhoto, type CinematicPhotoProps, type PhotoGrade } from "./CinematicPhoto";
export { default as RevealText, type RevealTextProps, type RevealMode } from "./RevealText";
export { PremiumCTA, MagneticButton, HoldToReveal, type PremiumCTAProps, type HoldToRevealProps, type CtaTone } from "./PremiumCTA";
export { default as GlowParticles, GLOW_COLORS, type GlowPreset, type GlowParticlesProps } from "./GlowParticles";
export { default as Fluent3D, FLUENT_KEYS, fluentUrl, type FluentKey, type Fluent3DProps } from "./Fluent3D";
export { default as SceneTransition, type SceneTransitionProps, type TransitionVariant } from "./SceneTransition";
export { useGyroParallax, ParallaxLayer, type GyroParallax, type GyroParallaxOptions } from "./useGyroParallax";
export { requestTiltPermission, EASE_OUT, EASE_IN_OUT, EASE_CSS } from "./shared";
