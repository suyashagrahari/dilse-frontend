// ─── Rewind — hand-drawn icon set (music-app grammar, our own strokes) ───────

import type { CSSProperties } from "react";

type P = { size?: number; style?: CSSProperties; className?: string };

const S = ({ size = 24, style, className, children, fill = "currentColor" }: P & { children: React.ReactNode; fill?: string }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill={fill} aria-hidden focusable="false" style={style} className={className}>
    {children}
  </svg>
);

export const IHome = ({ active, ...p }: P & { active?: boolean }) => (
  <S {...p}>
    {active ? (
      <path d="M13.5 1.5a2.3 2.3 0 0 0-3 0L2 8.8V22h7.5v-6.5a2.5 2.5 0 0 1 5 0V22H22V8.8z" />
    ) : (
      <path d="M12.5 3.2a.8.8 0 0 0-1 0L3.5 10v10.5h4.5v-5a4 4 0 0 1 8 0v5h4.5V10zM10.5 1.5a2.3 2.3 0 0 1 3 0L22 8.8V22h-7.5v-6.5a2.5 2.5 0 0 0-5 0V22H2V8.8z" />
    )}
  </S>
);
export const ISearch = ({ active, ...p }: P & { active?: boolean }) => (
  <S {...p}>
    <path d="M10.5 2a8.5 8.5 0 1 0 5.3 15.2l5 5 1.5-1.5-5-5A8.5 8.5 0 0 0 10.5 2zm0 2a6.5 6.5 0 1 1 0 13 6.5 6.5 0 0 1 0-13z" />
    {active && <circle cx="10.5" cy="10.5" r="4.4" />}
  </S>
);
export const ILibrary = ({ active, ...p }: P & { active?: boolean }) => (
  <S {...p}>
    <path d={active ? "M3 22V2h2.5v20zm5.5 0V2H11v20zM13.6 3.3l2.3-.9 6.6 18.4-2.3.9z" : "M3 22V2h2v20zm5.5 0V2h2v20zM14 3.3l1.9-.7 6.6 18.4-1.9.7z"} />
  </S>
);
export const IPlay = (p: P) => (
  <S {...p}><path d="M7 4.4v15.2a.8.8 0 0 0 1.2.7l12.4-7.6a.8.8 0 0 0 0-1.4L8.2 3.7A.8.8 0 0 0 7 4.4z" /></S>
);
export const IPause = (p: P) => (
  <S {...p}><rect x="5.5" y="4" width="4.2" height="16" rx="1" /><rect x="14.3" y="4" width="4.2" height="16" rx="1" /></S>
);
export const INext = (p: P) => (
  <S {...p}><path d="M17.7 3h2.3v18h-2.3zM4 4.2v15.6a.8.8 0 0 0 1.2.7L16 12.7a.8.8 0 0 0 0-1.4L5.2 3.5a.8.8 0 0 0-1.2.7z" /></S>
);
export const IPrev = (p: P) => (
  <S {...p}><path d="M6.3 3H4v18h2.3zM20 4.2v15.6a.8.8 0 0 1-1.2.7L8 12.7a.8.8 0 0 1 0-1.4l10.8-7.8a.8.8 0 0 1 1.2.7z" /></S>
);
export const IShuffle = (p: P) => (
  <S {...p} fill="none">
    <path d="M3 6h3.5c2 0 3.4 1 4.5 2.8l2 3.4c1.1 1.8 2.5 2.8 4.5 2.8H21M3 18h3.5c1.4 0 2.5-.5 3.4-1.4M21 6h-3.5c-1.4 0-2.5.5-3.4 1.4M18 3l3 3-3 3M18 12l3 3-3 3" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
  </S>
);
export const IRepeat = (p: P) => (
  <S {...p} fill="none">
    <path d="M4 12V9a3 3 0 0 1 3-3h13M17 3l3 3-3 3M20 12v3a3 3 0 0 1-3 3H4M7 21l-3-3 3-3" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
  </S>
);
export const IHeart = ({ filled, ...p }: P & { filled?: boolean }) => (
  <S {...p} fill={filled ? "currentColor" : "none"}>
    <path d="M12 20.3S3.5 15.2 3.5 9.1A4.6 4.6 0 0 1 12 6.6a4.6 4.6 0 0 1 8.5 2.5c0 6.1-8.5 11.2-8.5 11.2z" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round" />
  </S>
);
export const IPlusCircle = (p: P) => (
  <S {...p} fill="none">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
    <path d="M12 7.8v8.4M7.8 12h8.4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </S>
);
export const ICheckCircle = (p: P) => (
  <S {...p}><circle cx="12" cy="12" r="10" /><path d="M7.5 12.2l3 3 6-6" fill="none" stroke="#000" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></S>
);
export const IDots = (p: P) => (
  <S {...p}><circle cx="5" cy="12" r="1.9" /><circle cx="12" cy="12" r="1.9" /><circle cx="19" cy="12" r="1.9" /></S>
);
export const IDown = (p: P) => (
  <S {...p} fill="none"><path d="M5 9l7 7 7-7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></S>
);
export const IBack = (p: P) => (
  <S {...p} fill="none"><path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></S>
);
export const IFwd = (p: P) => (
  <S {...p} fill="none"><path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></S>
);
export const IClose = (p: P) => (
  <S {...p} fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" /></S>
);
export const ILock = (p: P) => (
  <S {...p}><path d="M7 10V7.5a5 5 0 0 1 10 0V10h1a1.5 1.5 0 0 1 1.5 1.5v8A1.5 1.5 0 0 1 18 21H6a1.5 1.5 0 0 1-1.5-1.5v-8A1.5 1.5 0 0 1 6 10zm2 0h6V7.5a3 3 0 0 0-6 0z" /></S>
);
export const IShare = (p: P) => (
  <S {...p} fill="none"><path d="M12 3v12M7.5 7.5L12 3l4.5 4.5M5 12v7.5A1.5 1.5 0 0 0 6.5 21h11a1.5 1.5 0 0 0 1.5-1.5V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></S>
);
export const IVolume = ({ muted, ...p }: P & { muted?: boolean }) => (
  <S {...p}>
    <path d="M3 9.5v5h3.8L12 19V5L6.8 9.5z" />
    {muted ? (
      <path d="M15.5 9.5l5 5M20.5 9.5l-5 5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    ) : (
      <path d="M15 8.5a5 5 0 0 1 0 7M17.8 5.8a9 9 0 0 1 0 12.4" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    )}
  </S>
);
export const IDevices = (p: P) => (
  <S {...p} fill="none"><rect x="3" y="4" width="12" height="16" rx="2" stroke="currentColor" strokeWidth="1.8" /><rect x="17" y="9" width="4" height="11" rx="1.2" stroke="currentColor" strokeWidth="1.8" /><circle cx="9" cy="14.5" r="2.4" stroke="currentColor" strokeWidth="1.6" /></S>
);
export const ILyrics = (p: P) => (
  <S {...p} fill="none"><path d="M13.5 5.5a4 4 0 1 1 5 5L9 20l-4 .5.5-4z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /></S>
);
export const IQueue = (p: P) => (
  <S {...p} fill="none"><path d="M3 6h13M3 11h13M3 16h7M16 14v6l5-3z" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" /></S>
);
export const IDownload = (p: P) => (
  <S {...p} fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" /><path d="M12 7.5v8M8.5 12.5l3.5 3.5 3.5-3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></S>
);
export const IBell = (p: P) => (
  <S {...p} fill="none"><path d="M6 16V10.5a6 6 0 0 1 12 0V16l1.5 2h-15zM10 20.5a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /></S>
);
export const IClock = (p: P) => (
  <S {...p} fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" /><path d="M12 7v5.2l3.2 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></S>
);
export const IPlus = (p: P) => (
  <S {...p} fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></S>
);
export const IReplay = (p: P) => (
  <S {...p} fill="none"><path d="M4 12a8 8 0 1 0 2.4-5.7M4 4v4.5h4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></S>
);
