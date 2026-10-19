// ─── Wedding kit — the shared foundation of the three wedding tiers ──────────
// See README.md for usage. Import from "../_wedding" (one entry, stable API).

export { default as WeddingRoot, WeddingKitStyles, Reveal, useWeddingReducedMotion } from "./WeddingRoot";
export type { WeddingRootProps, RevealProps } from "./WeddingRoot";
export { default as ThemePicker } from "./ThemePicker";
export type { ThemePickerProps } from "./ThemePicker";
export * from "./themes";
export { WEDDING_FONT_VARS, wkDisplay, wkCaps, wkScript, wkSans, wkDeva } from "./fonts";

export { default as WeddingMasonry, photoImgStyle } from "./masonry/WeddingMasonry";
export type { WeddingMasonryProps, MasonryMask, MasonryFrame } from "./masonry/WeddingMasonry";
export { default as MasonryEditor } from "./masonry/MasonryEditor";
export type { MasonryEditorProps } from "./masonry/MasonryEditor";
export { default as Lightbox } from "./masonry/Lightbox";
export type { LightboxProps } from "./masonry/Lightbox";
export { layoutMasonry, columnsFor, DEFAULT_COLUMNS } from "./masonry/layout";
export type { ColumnRule, MasonryLayout, MasonryTile } from "./masonry/layout";

export { Ornament, Divider, Corners, ORNAMENTS, DIVIDER_IDS, CORNER_IDS, PARTICLES, TEXTURES, WEDDING_CDN, ornamentUrl, ornamentFoilUrl, particleUrl, textureUrl, isOrnamentId } from "./ornaments";
export type { OrnamentId, DividerId, CornerId, ParticleId, TextureId, OrnamentProps, DividerProps, CornersProps, OrnamentTone } from "./ornaments";

export { Section, WeddingCard } from "./sections/Section";
export type { SectionProps, WeddingCardProps } from "./sections/Section";
export { default as Countdown, useNowSeconds } from "./sections/Countdown";
export type { CountdownProps } from "./sections/Countdown";
export { default as EventsTimeline, mainEventOf } from "./sections/EventsTimeline";
export type { EventsTimelineProps } from "./sections/EventsTimeline";
export { default as VenueCard } from "./sections/VenueCard";
export type { VenueCardProps } from "./sections/VenueCard";
export { default as RSVPBlock } from "./sections/RSVPBlock";
export type { RSVPBlockProps } from "./sections/RSVPBlock";
export { default as BlessingsWall } from "./sections/BlessingsWall";
export type { BlessingsWallProps } from "./sections/BlessingsWall";
export { default as RsvpDashboard } from "./sections/RsvpDashboard";
export type { RsvpDashboardProps } from "./sections/RsvpDashboard";
export { default as PetalBurst } from "./sections/PetalBurst";
export type { PetalBurstProps } from "./sections/PetalBurst";
export { FamiliesBlock, MessageBlock, Monogram, initialOf } from "./sections/Typography";
export type { FamiliesBlockProps, MessageBlockProps, MonogramProps } from "./sections/Typography";

export * from "./types";
export * from "./ics";
export * from "./api";
