// The ✦ Premium kit. Import from here in a premium Experience:
//
//   import { PremiumRoot, PremiumGate, usePremium, useSongDrop, sfx, FilmReel, VoiceNotePlayer, ReplyBox, … } from "../../_valentine/kit/premium";
//
// API + rules for every builder: .template-factory/premium/PREMIUM-ENGINE.md.

export { default as PremiumRoot, usePremium, usePremiumOptional, useAudioState, type PremiumApi } from "./PremiumRoot";
export { default as PremiumGate, type PremiumGateProps } from "./PremiumGate";
export { useSongDrop, DROP_RISER_SEC } from "./useSongDrop";
export { sfx, registerCue, CUE_IDS, type CueId, type CueOptions, type CueHandle } from "./sfx";
export { unlockAudioInGesture, setAudioMuted, getAudioContext, noiseBuffer, SFX_LEVEL, BED_LEVEL } from "./audio";
export { loadSample, playSample, sampleReady, type SampleOptions } from "./samples";
export { useScare, useUnlockAudioOnFirstTap, BOO_SCARE_URL, SCARE_DUCK_MS, SCARE_HAPTIC, type ScareOptions, type ScareCallOptions } from "./useScare";
export { default as KineticName, type KineticNameProps } from "./KineticName";
export { default as ParticleField, type ParticlePreset, type ParticleFieldProps } from "./ParticleField";
export { default as FilmReel, type FilmReelProps } from "./FilmReel";
export { default as VoiceNotePlayer, type VoiceNotePlayerProps } from "./VoiceNotePlayer";
export { default as ReplyBox, PremiumShareContext, usePremiumShare, sendPremiumReply, type PremiumShareInfo, type ReplyBoxProps } from "./ReplyBox";
export { default as UnlockTeaser, useCountdown } from "./UnlockTeaser";
export { Letterbox, SceneFade, SkipChip, useScenes } from "./scene";
export { posterKeepsake, saveOrSharePoster, type PosterOptions } from "./poster";
export { downloadIcs, icsText, type IcsEvent } from "./ics";
export { default as PremiumPlaceholder } from "./PremiumPlaceholder";
// Cinema kit — shader backdrops, film finish, tilt cards, reveals, 3D objects (./cinema/README.md).
export * from "./cinema";
