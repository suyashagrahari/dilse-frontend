// The Valentine's-week kit. Import from here in a day Experience:
//
//   import { Sticker, Typewriter, RunawayNo, burst, EndingActions, … } from "../../_valentine/kit";
//
// Full prop docs + one-line examples: .template-factory/valentine-week/02-engine.md.

export { default as Sticker, stickerSources, type StickerProps } from "./Sticker";
export { default as ScratchCanvas, type ScratchCanvasProps } from "./ScratchCanvas";
export { default as RunawayNo, type RunawayNoProps } from "./RunawayNo";
export { default as Typewriter, type TypewriterProps } from "./Typewriter";
export { useHoldProgress, type HoldOptions, type HoldHandle } from "./useHoldProgress";
export { default as Burst, burst, FloatingParticles, type BurstKind, type BurstOptions } from "./Burst";
export { haptic } from "./haptic";
export { useSynthMusic, useSynthEngine, MusicToggle, MusicButton, type SynthMusic, type MelodyId } from "./useSynthMusic";
export { useDayMusic, type DayMusicApi } from "../music/context";
export { renderKeepsake, downloadKeepsake, defaultKeepsake, type KeepsakeLayout, type KeepsakeItem } from "./keepsake";
export { default as EndingActions, type EndingActionsProps } from "./EndingActions";
export { default as PhotoLightbox, type PhotoLightboxProps } from "./PhotoLightbox";
export { default as CroppedPhoto } from "./CroppedPhoto";
export { default as DayRoot, BrandMark } from "./DayRoot";
export { useReducedMotion, prefersReducedMotion } from "./useReducedMotion";
export { canvasFont, canvasFamily } from "./canvasFonts";
export { ensureKitCss } from "./kitCss";
export { default as StarterStory, type StarterStoryProps } from "./StarterStory";
