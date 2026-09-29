// ─── Endorsements — icon set ─────────────────────────────────────────────────
//
// Drawn here, in the genre's 24px solid-glyph style. No icon library and no
// borrowed marks: the "logo" is a heart inside a rounded square.

import type { CSSProperties, ReactNode } from "react";

type P = { size?: number; className?: string; style?: CSSProperties };

function S({ size = 24, className, style, children, vb = "0 0 24 24" }: P & { children: ReactNode; vb?: string }) {
  return (
    <svg width={size} height={size} viewBox={vb} className={className} style={style} aria-hidden="true" focusable="false" fill="currentColor">
      {children}
    </svg>
  );
}

/** The parody mark: a rounded square with a heart. */
export function Mark({ size = 34 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 34 34" aria-hidden="true" focusable="false">
      <rect width="34" height="34" rx="5" fill="#0A66C2" />
      <path d="M17 26.2c-5.6-4-9-7-9-11a4.6 4.6 0 0 1 9-1.5 4.6 4.6 0 0 1 9 1.5c0 4-3.4 7-9 11z" fill="#fff" />
    </svg>
  );
}

export const IHome = (p: P) => (
  <S {...p}><path d="M23 9v2h-2v7a3 3 0 0 1-3 3h-4v-6h-4v6H6a3 3 0 0 1-3-3v-7H1V9l11-7 5 3.2V2h3v5.1z" /></S>
);
export const INetwork = (p: P) => (
  <S {...p}><path d="M12 16v6H3v-6a3 3 0 0 1 3-3h3a3 3 0 0 1 3 3zm5.5-3A3.5 3.5 0 1 0 14 9.5a3.5 3.5 0 0 0 3.5 3.5zm1 2h-2a2.5 2.5 0 0 0-2.5 2.5V22h7v-4.5a2.5 2.5 0 0 0-2.5-2.5zM7.5 2A4.5 4.5 0 1 0 12 6.5 4.49 4.49 0 0 0 7.5 2z" /></S>
);
export const IJobs = (p: P) => (
  <S {...p}><path d="M17 6V5a3 3 0 0 0-3-3h-4a3 3 0 0 0-3 3v1H2v4a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3V6zM9 5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1H9zm10 9a4 4 0 0 0 3-1.38V17a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3v-4.38A4 4 0 0 0 5 14z" /></S>
);
export const IChat = (p: P) => (
  <S {...p}><path d="M16 4H8a7 7 0 0 0 0 14h4v4l8.16-5.39A6.78 6.78 0 0 0 23 11a7 7 0 0 0-7-7zm-8 8.25A1.25 1.25 0 1 1 9.25 11 1.25 1.25 0 0 1 8 12.25zm4 0A1.25 1.25 0 1 1 13.25 11 1.25 1.25 0 0 1 12 12.25zm4 0A1.25 1.25 0 1 1 17.25 11 1.25 1.25 0 0 1 16 12.25z" /></S>
);
export const IBell = (p: P) => (
  <S {...p}><path d="M22 19h-8.28a2 2 0 1 1-3.44 0H2v-1a4.52 4.52 0 0 1 1.17-2.83l1-1.17h15.7l1 1.17A4.42 4.42 0 0 1 22 18zM18.21 7.44A6.27 6.27 0 0 0 12 2a6.27 6.27 0 0 0-6.21 5.44L5 13h14z" /></S>
);
export const IPlusBox = (p: P) => (
  <S {...p}><path d="M18 3H6a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3V6a3 3 0 0 0-3-3zm-1 10h-4v4h-2v-4H7v-2h4V7h2v4h4z" /></S>
);
export const IGrid = (p: P) => (
  <S {...p}><path d="M3 3h4v4H3zm7 4h4V3h-4zm7-4v4h4V3zM3 14h4v-4H3zm7 0h4v-4h-4zm7 0h4v-4h-4zM3 21h4v-4H3zm7 0h4v-4h-4zm7 0h4v-4h-4z" /></S>
);
export const ISearchLg = (p: P) => (
  <S {...p} vb="0 0 16 16"><path d="M14.56 12.44L11.3 9.18a5.51 5.51 0 1 0-2.12 2.12l3.26 3.26a1.5 1.5 0 1 0 2.12-2.12zM3 6.5A3.5 3.5 0 1 1 6.5 10 3.5 3.5 0 0 1 3 6.5z" /></S>
);
export const IPencil = (p: P) => (
  <S {...p}><path d="M21.13 2.86a3 3 0 0 0-4.17 0l-13 13L2 22l6.19-2L21.13 7a3 3 0 0 0 0-4.16zM6.77 18.57l-1.35-1.34L16.64 6 18 7.35z" /></S>
);
export const IPlus = (p: P) => (
  <S {...p}><path d="M21 13h-8v8h-2v-8H3v-2h8V3h2v8h8z" /></S>
);
export const IMore = (p: P) => (
  <S {...p}><path d="M14 12a2 2 0 1 1-2-2 2 2 0 0 1 2 2zM4 10a2 2 0 1 0 2 2 2 2 0 0 0-2-2zm16 0a2 2 0 1 0 2 2 2 2 0 0 0-2-2z" /></S>
);
export const IArrowRt = (p: P) => (
  <S {...p} vb="0 0 16 16"><path d="M11.45 3L15 8l-3.55 5H9l2.84-4H2V7h9.84L9 3z" /></S>
);
export const IChevDown = (p: P) => (
  <S {...p} vb="0 0 16 16"><path d="M8 11L3 6h10z" /></S>
);
export const IChevLeft = (p: P) => (
  <S {...p}><path d="M9 4l-4.87 7.2a1.46 1.46 0 0 0 0 1.6L9 20h2.5l-4.83-7H21v-2H6.67l4.83-7z" /></S>
);
export const IChevR = (p: P) => (
  <S {...p} vb="0 0 16 16"><path d="M5.7 13.7L10.4 8 5.7 2.3 7 1l5.9 7L7 15z" /></S>
);
export const IChevL = (p: P) => (
  <S {...p} vb="0 0 16 16"><path d="M10.3 2.3L5.6 8l4.7 5.7L9 15 3.1 8 9 1z" /></S>
);
export const IClose = (p: P) => (
  <S {...p}><path d="M13.42 12L20 18.58 18.58 20 12 13.42 5.42 20 4 18.58 10.58 12 4 5.42 5.42 4 12 10.58 18.58 4 20 5.42z" /></S>
);
export const IPersonAdd = (p: P) => (
  <S {...p} vb="0 0 16 16"><path d="M9 4a3 3 0 1 1-3-3 3 3 0 0 1 3 3zM6.75 8h-1.5A2.25 2.25 0 0 0 3 10.25V15h6v-4.75A2.25 2.25 0 0 0 6.75 8zM13 8V6h-1v2h-2v1h2v2h1V9h2V8z" /></S>
);
export const IClock = (p: P) => (
  <S {...p} vb="0 0 16 16"><path d="M8 1a7 7 0 1 0 7 7 7 7 0 0 0-7-7zm3 10.3L7.2 8.6V3.5h1.6v4.2l3.1 2.2z" /></S>
);
export const ICheck = (p: P) => (
  <S {...p} vb="0 0 16 16"><path d="M12.57 2H15L6 14 1 8.6l1.6-1.6L6 10.5z" /></S>
);
export const ISend = (p: P) => (
  <S {...p}><path d="M21 3L0 10l7.66 4.26L16 8l-6.26 8.34L14 24l7-21z" /></S>
);
export const ISendSm = (p: P) => (
  <S {...p} vb="0 0 16 16"><path d="M14 2L0 6.67l5 2.64 5.67-3.98L6.7 11l2.63 5L14 2z" /></S>
);
export const IComment = (p: P) => (
  <S {...p}><path d="M7 9h10v1H7zm0 4h7v-1H7zm16-2a6.78 6.78 0 0 1-2.84 5.61L12 22v-4H8A7 7 0 0 1 8 4h8a7 7 0 0 1 7 7zm-2 0a5 5 0 0 0-5-5H8a5 5 0 0 0 0 10h6v2.28L19 15a4.79 4.79 0 0 0 2-4z" /></S>
);
export const IRepost = (p: P) => (
  <S {...p}><path d="M13.96 5H6c-.55 0-1 .45-1 1v10H3V6c0-1.66 1.34-3 3-3h7.96L12 0h2.37L17 4l-2.63 4H12l1.96-3zm5.04 3v10c0 .55-.45 1-1 1h-7.96L12 16H9.63L7 20l2.63 4H12l-1.96-3H18c1.66 0 3-1.34 3-3V8h-2z" /></S>
);
export const ILikeOutline = (p: P) => (
  <S {...p}><path d="M19.46 11l-3.91-3.91a7 7 0 0 1-1.69-2.74l-.49-1.47A2.76 2.76 0 0 0 10.76 1 2.75 2.75 0 0 0 8 3.74v1.12a9.19 9.19 0 0 0 .46 2.85L8.89 9H4.12A2.12 2.12 0 0 0 2 11.12a2.16 2.16 0 0 0 .92 1.76A2.11 2.11 0 0 0 2 14.62a2.14 2.14 0 0 0 1.28 2 2 2 0 0 0-.28 1 2.12 2.12 0 0 0 2 2.12v.14A2.12 2.12 0 0 0 7.12 22h7.49a8.08 8.08 0 0 0 3.58-.84l.31-.16H21V11zM19 19h-1l-.73.37a6.14 6.14 0 0 1-2.69.63H7.72a1 1 0 0 1-1-.72l-.25-.87-.85-.41A1 1 0 0 1 5 17l.17-1-.76-.74A1 1 0 0 1 4.27 14l.66-1.09-.73-1.1a.49.49 0 0 1 .08-.7.48.48 0 0 1 .34-.11h7.05l-1.31-3.92A7 7 0 0 1 10 4.86V3.75a.77.77 0 0 1 .75-.75.75.75 0 0 1 .71.51L12 5a9 9 0 0 0 2.13 3.5l4.5 4.5H19z" /></S>
);
export const IGlobe = (p: P) => (
  <S {...p} vb="0 0 16 16"><path d="M8 1a7 7 0 1 0 7 7 7 7 0 0 0-7-7zM3 8a5 5 0 0 1 1-3l.55.55A1.5 1.5 0 0 1 5 6.62v1.07a.75.75 0 0 0 .22.53l.56.56a.75.75 0 0 0 .53.22H7v.69a.75.75 0 0 0 .22.53l.56.56a.75.75 0 0 1 .22.53V13a5 5 0 0 1-5-5zm6.24 4.83l2-2.46a.75.75 0 0 0 .09-.8l-.58-1.16A.76.76 0 0 0 10 8H7v-.19a.51.51 0 0 1 .28-.45l.38-.19a.74.74 0 0 1 .68 0L9 7.5l.38-.7a1 1 0 0 0 .12-.48v-.85a.78.78 0 0 1 .21-.53l1.07-1.09a5 5 0 0 1-1.54 9z" /></S>
);
export const IEye = (p: P) => (
  <S {...p}><path d="M12 5C6 5 2 12 2 12s4 7 10 7 10-7 10-7-4-7-10-7zm0 11a4 4 0 1 1 4-4 4 4 0 0 1-4 4zm0-6a2 2 0 1 0 2 2 2 2 0 0 0-2-2z" /></S>
);
export const IChart = (p: P) => (
  <S {...p}><path d="M23 20v1H1v-1zM8 9H2v10h6zm7-6H9v16h6zm7 11h-6v5h6z" /></S>
);
export const ISearchPeople = (p: P) => (
  <S {...p}><path d="M21.41 18.59l-5.27-5.28A6.83 6.83 0 0 0 17 10a7 7 0 1 0-7 7 6.83 6.83 0 0 0 3.31-.86l5.28 5.27a2 2 0 0 0 2.82-2.82zM5 10a5 5 0 1 1 5 5 5 5 0 0 1-5-5z" /></S>
);
export const IDiamond = (p: P) => (
  <S {...p} vb="0 0 16 16"><path d="M8 1L1 8l7 7 7-7zm0 11.2L3.8 8 8 3.8 12.2 8z" /></S>
);
export const IExternal = (p: P) => (
  <S {...p} vb="0 0 16 16"><path d="M15 1v6h-2V4.41L7.41 10 6 8.59 11.59 3H9V1zm-4 10a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h2V3H5a3 3 0 0 0-3 3v5a3 3 0 0 0 3 3h5a3 3 0 0 0 3-3V9h-2z" /></S>
);
export const ILock = (p: P) => (
  <S {...p} vb="0 0 16 16"><path d="M12 6V5a4 4 0 0 0-8 0v1a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2zM6 5a2 2 0 0 1 4 0v1H6z" /></S>
);
export const IShield = (p: P) => (
  <S {...p} vb="0 0 16 16"><path d="M8 1L2 3v4.5C2 11 4.5 14 8 15c3.5-1 6-4 6-7.5V3zm-1 10L4 8l1.4-1.4L7 8.2l3.6-3.6L12 6z" /></S>
);
export const IVerified = (p: P) => (
  <S {...p} vb="0 0 24 24"><path d="M12 1l2.6 2.1 3.3-.4 1 3.2 3 1.5-.9 3.2 1.3 3.1-2.7 2 .1 3.3-3.3.6-1.7 2.9L12 20.9l-2.7 1.7-1.7-2.9-3.3-.6.1-3.3-2.7-2 1.3-3.1-.9-3.2 3-1.5 1-3.2 3.3.4z" /><path d="M10.6 15.4l-3.2-3.2 1.3-1.3 1.9 1.9 4.9-4.9 1.3 1.3z" fill="#fff" /></S>
);
export const IHeart = (p: P) => (
  <S {...p}><path d="M12 21.3C5.6 16.7 2 13.3 2 8.9A5.2 5.2 0 0 1 12 6.6a5.2 5.2 0 0 1 10 2.3c0 4.4-3.6 7.8-10 12.4z" /></S>
);
export const IFlag = (p: P) => (
  <S {...p} vb="0 0 16 16"><path d="M13 4l-2 3 2 3H5v5H3V1h2v3z" /></S>
);
export const IDownload = (p: P) => (
  <S {...p} vb="0 0 16 16"><path d="M14 12v3H2v-3h2v1h8v-1zM9 1H7v7.59L4.71 6.29 3.29 7.71 8 12.41l4.71-4.7-1.42-1.42L9 8.59z" /></S>
);
export const IStar = (p: P) => (
  <S {...p} vb="0 0 16 16"><path d="M8 1l2.2 4.5 4.8.7-3.5 3.4.8 4.9L8 12.2l-4.3 2.3.8-4.9L1 6.2l4.8-.7z" /></S>
);

// ─── reactions: coloured discs, the way the genre draws them ─────────────────

export type ReactionId = "like" | "celebrate" | "support" | "love" | "insightful" | "funny";

export const REACTIONS: { id: ReactionId; label: string; color: string; bg: string }[] = [
  { id: "like", label: "Like", color: "#378FE9", bg: "#378FE9" },
  { id: "celebrate", label: "Celebrate", color: "#44712E", bg: "#6DAE4F" },
  { id: "support", label: "Support", color: "#715E86", bg: "#A872E8" },
  { id: "love", label: "Love", color: "#B24020", bg: "#DF704D" },
  { id: "insightful", label: "Insightful", color: "#915907", bg: "#F5BB5C" },
  { id: "funny", label: "Funny", color: "#1A707E", bg: "#56BBC9" },
];

export function ReactionDisc({ id, size = 16 }: { id: ReactionId; size?: number }) {
  const r = REACTIONS.find((x) => x.id === id) ?? REACTIONS[0];
  const g = (d: ReactNode) => (
    <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden="true" focusable="false" style={{ display: "block" }}>
      <circle cx="8" cy="8" r="8" fill={r.bg} />
      {d}
    </svg>
  );
  switch (id) {
    case "like":
      return g(<path d="M11.6 7.2H9.4l.5-1.7c.2-.8-.2-1.7-1-1.9l-.3-.1-2 3.1v4.8h4.2c.5 0 .9-.3 1-.8l.6-2.3c.2-.6-.3-1.1-.8-1.1zM4 7.2h1.2v4.6H4z" fill="#fff" />);
    case "celebrate":
      return g(<><path d="M4.2 11.8l2-6 4 4z" fill="#FFD66B" /><path d="M9 4.2l.6-1M11 6l1.2-.4M10.2 5l1-1" stroke="#fff" strokeWidth="1" strokeLinecap="round" /></>);
    case "support":
      return g(<path d="M8 12.2S4 9.8 4 7.2a2 2 0 0 1 4-.4 2 2 0 0 1 4 .4c0 2.6-4 5-4 5z" fill="#fff" opacity=".95" />);
    case "love":
      return g(<path d="M8 12.2S3.8 9.6 3.8 6.9A2.1 2.1 0 0 1 8 6a2.1 2.1 0 0 1 4.2.9c0 2.7-4.2 5.3-4.2 5.3z" fill="#fff" />);
    case "insightful":
      return g(<><path d="M8 3.4a3 3 0 0 0-1.8 5.4c.3.3.5.7.5 1.1h2.6c0-.4.2-.8.5-1.1A3 3 0 0 0 8 3.4z" fill="#fff" /><rect x="6.8" y="10.6" width="2.4" height="1.4" rx=".5" fill="#fff" /></>);
    case "funny":
      return g(<><circle cx="8" cy="8" r="4.2" fill="#fff" /><path d="M5.9 8.6a2.2 2.2 0 0 0 4.2 0z" fill={r.bg} /><circle cx="6.6" cy="7" r=".6" fill={r.bg} /><circle cx="9.4" cy="7" r=".6" fill={r.bg} /></>);
  }
}
