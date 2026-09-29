// ─── Searched — hand-drawn SVG icons (no brand marks) ────────────────────────

import type { CSSProperties } from "react";

type P = { size?: number; className?: string; style?: CSSProperties };

const S = ({ size = 24, className, style, children, vb = "0 0 24 24" }: P & { children: React.ReactNode; vb?: string }) => (
  <svg viewBox={vb} width={size} height={size} className={className} style={style} aria-hidden focusable="false">
    {children}
  </svg>
);

export const SearchIcon = (p: P) => (
  <S {...p}>
    <path fill="currentColor" d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
  </S>
);

/** The two-tone mic, drawn in the parody palette. */
export const MicIcon = (p: P) => (
  <S {...p}>
    <path fill="#3F76EE" d="M12 15c1.66 0 3-1.31 3-2.97V5.97C15 4.31 13.66 3 12 3S9 4.31 9 5.97v6.06C9 13.69 10.34 15 12 15z" />
    <path fill="#26A160" d="M11 18.08h2V21h-2z" />
    <path fill="#F4B42B" d="M7.05 16.87c-1.27-1.33-2.05-2.83-2.05-4.87h2c0 1.45.56 2.42 1.47 3.38v.32l-1.15 1.18z" />
    <path fill="#E8445E" d="M12 16.93a4.97 5.25 0 0 1-3.54-1.55l-1.41 1.49C8.84 18.54 11.27 19 12 19c3.87 0 7-3 7-7h-2c0 2.8-2.24 4.93-5 4.93z" />
  </S>
);

/** A camera-lens glyph: four rounded corners and a dot. */
export const LensIcon = (p: P) => (
  <S {...p}>
    <circle cx="12" cy="12" r="3.2" fill="#3F76EE" />
    <path fill="none" stroke="#E8445E" strokeWidth="2.2" strokeLinecap="round" d="M4 9V7a3 3 0 0 1 3-3h2" />
    <path fill="none" stroke="#F4B42B" strokeWidth="2.2" strokeLinecap="round" d="M15 4h2a3 3 0 0 1 3 3v2" />
    <path fill="none" stroke="#26A160" strokeWidth="2.2" strokeLinecap="round" d="M20 15v2a3 3 0 0 1-3 3h-2" />
    <path fill="none" stroke="#3F76EE" strokeWidth="2.2" strokeLinecap="round" d="M9 20H7a3 3 0 0 1-3-3v-2" />
  </S>
);

export const CloseIcon = (p: P) => (
  <S {...p}>
    <path fill="currentColor" d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
  </S>
);

export const BackIcon = (p: P) => (
  <S {...p}>
    <path fill="currentColor" d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
  </S>
);

export const AppsIcon = (p: P) => (
  <S {...p}>
    <path fill="currentColor" d="M6 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm6 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm6 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM6 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm6 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm6 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM6 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm6 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm6 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
  </S>
);

export const MenuIcon = (p: P) => (
  <S {...p}>
    <path fill="currentColor" d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
  </S>
);

export const FlaskIcon = (p: P) => (
  <S {...p}>
    <path fill="currentColor" d="M9 3h6v2h-1v4.2l5.2 8.3A2.3 2.3 0 0 1 17.3 21H6.7a2.3 2.3 0 0 1-1.9-3.5L10 9.2V5H9V3zm3 7.1L8.4 16h7.2L12 10.1z" />
  </S>
);

export const GearIcon = (p: P) => (
  <S {...p}>
    <path fill="currentColor" d="M19.14 12.94a7.07 7.07 0 0 0 0-1.88l2.03-1.58-1.92-3.32-2.39.96a7 7 0 0 0-1.62-.94L14.9 3.6h-3.8l-.36 2.58c-.59.24-1.13.56-1.62.94l-2.39-.96-1.92 3.32 2.03 1.58a7.07 7.07 0 0 0 0 1.88l-2.03 1.58 1.92 3.32 2.39-.96c.49.38 1.03.7 1.62.94l.36 2.58h3.8l.36-2.58c.59-.24 1.13-.56 1.62-.94l2.39.96 1.92-3.32-2.03-1.58zM12 15.5A3.5 3.5 0 1 1 12 8.5a3.5 3.5 0 0 1 0 7z" />
  </S>
);

export const DotsIcon = (p: P) => (
  <S {...p}>
    <path fill="currentColor" d="M12 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm0 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm0 6a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />
  </S>
);

export const ChevronDown = (p: P) => (
  <S {...p}>
    <path fill="currentColor" d="M16.59 8.59 12 13.17 7.41 8.59 6 10l6 6 6-6z" />
  </S>
);

export const ChevronRight = (p: P) => (
  <S {...p}>
    <path fill="currentColor" d="M10 6 8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
  </S>
);

export const ArrowUpLeft = (p: P) => (
  <S {...p}>
    <path fill="currentColor" d="M6 6h9v2H9.41l9.3 9.29-1.42 1.42L8 9.41V15H6V6z" />
  </S>
);

export const ClockIcon = (p: P) => (
  <S {...p}>
    <path fill="currentColor" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16zm.5-13H11v6l5.2 3.2.8-1.3-4.5-2.7V7z" />
  </S>
);

export const TrendIcon = (p: P) => (
  <S {...p}>
    <path fill="currentColor" d="m16 6 2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6h-6z" />
  </S>
);

/** The AI sparkle — a four-point star in a soft gradient. */
export const Sparkle = ({ size = 20, id = "srSpk", ...p }: P & { id?: string }) => (
  <S size={size} {...p}>
    <defs>
      <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#3F76EE" />
        <stop offset=".55" stopColor="#9B6BF2" />
        <stop offset="1" stopColor="#E8445E" />
      </linearGradient>
    </defs>
    <path fill={`url(#${id})`} d="M12 2c.5 4.6 2.9 7.4 8 8.2v.1c-5.1.8-7.5 3.6-8 8.7h-.1c-.5-5.1-2.9-7.9-8-8.7v-.1c5.1-.8 7.5-3.6 8-8.2H12z" />
  </S>
);

export const ShareIcon = (p: P) => (
  <S {...p}>
    <path fill="currentColor" d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11A2.99 2.99 0 1 0 15 5c0 .24.04.47.09.7L8.04 9.81A2.99 2.99 0 1 0 6 15c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65A2.92 2.92 0 1 0 18 16.08z" />
  </S>
);

export const ThumbUp = (p: P) => (
  <S {...p}>
    <path fill="currentColor" d="M1 21h4V9H1v12zm22-11a2 2 0 0 0-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10a2 2 0 0 0 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z" />
  </S>
);

export const ThumbDown = (p: P) => (
  <S {...p}>
    <path fill="currentColor" d="M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73v2a2 2 0 0 0 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 23l6.59-6.59c.36-.36.58-.86.58-1.41V5a2 2 0 0 0-2-2zm4 0v12h4V3h-4z" />
  </S>
);

export const PlayIcon = (p: P) => (
  <S {...p}>
    <path fill="currentColor" d="M8 5v14l11-7z" />
  </S>
);

export const PauseIcon = (p: P) => (
  <S {...p}>
    <path fill="currentColor" d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
  </S>
);

export const PinIcon = (p: P) => (
  <S {...p}>
    <path fill="currentColor" d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z" />
  </S>
);

export const StarIcon = ({ fill = 1, ...p }: P & { fill?: number }) => (
  <S {...p}>
    <defs>
      <linearGradient id={`srStar${Math.round(fill * 10)}`}>
        <stop offset={fill} stopColor="currentColor" />
        <stop offset={fill} stopColor="currentColor" stopOpacity=".28" />
      </linearGradient>
    </defs>
    <path fill={`url(#srStar${Math.round(fill * 10)})`} d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
  </S>
);

export const HeartIcon = (p: P) => (
  <S {...p}>
    <path fill="currentColor" d="M12 21.35 10.55 20.03C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09A6 6 0 0 1 16.5 3C19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </S>
);

export const DirectionsIcon = (p: P) => (
  <S {...p}>
    <path fill="currentColor" d="m21.71 11.29-9-9a1 1 0 0 0-1.42 0l-9 9a1 1 0 0 0 0 1.42l9 9a1 1 0 0 0 1.42 0l9-9a1 1 0 0 0 0-1.42zM14 14.5V12h-4v3H8v-4c0-.55.45-1 1-1h5V7.5l3.5 3.5-3.5 3.5z" />
  </S>
);

export const MoonIcon = (p: P) => (
  <S {...p}>
    <path fill="currentColor" d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.39 5.39 0 0 1-4.4 2.26 5.4 5.4 0 0 1-3.14-9.8A9.1 9.1 0 0 0 12 3z" />
  </S>
);

export const NewsIcon = (p: P) => (
  <S {...p}>
    <path fill="currentColor" d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm-9 12H5v-2h6v2zm0-4H5v-2h6v2zm8 4h-6V8h6v8zm-8-8H5V8h6v2z" />
  </S>
);
