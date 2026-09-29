// Hand-drawn SVG glyphs in the real app's weight: 2px rounded strokes, filled
// when active. No marks, no logos — the app mark is our own flame-heart.

import type { CSSProperties, ReactNode } from "react";

type P = { size?: number; color?: string; fill?: boolean; style?: CSSProperties; strokeWidth?: number };

function Svg({ size = 24, color = "currentColor", style, children, strokeWidth = 2 }: P & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      focusable="false"
      style={style}
    >
      {children}
    </svg>
  );
}

export const IcMap = (p: P) => (
  <Svg {...p}>
    <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z" fill={p.fill ? p.color ?? "currentColor" : "none"} />
    <circle cx="12" cy="10" r="2.3" fill={p.fill ? "#fff" : "none"} stroke={p.fill ? "#fff" : p.color ?? "currentColor"} />
  </Svg>
);

export const IcChat = (p: P) => (
  <Svg {...p}>
    <path d="M4 5.5h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-9l-5 3.5v-3.5H4a1 1 0 0 1-1-1v-10a1 1 0 0 1 1-1z" fill={p.fill ? p.color ?? "currentColor" : "none"} />
  </Svg>
);

export const IcCamera = (p: P) => (
  <Svg {...p}>
    <path d="M4 8h3l1.6-2.4h6.8L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z" fill={p.fill ? p.color ?? "currentColor" : "none"} />
    <circle cx="12" cy="13.3" r="3.3" stroke={p.fill ? "#000" : p.color ?? "currentColor"} />
  </Svg>
);

export const IcStories = (p: P) => (
  <Svg {...p}>
    <circle cx="9" cy="8" r="3.2" fill={p.fill ? p.color ?? "currentColor" : "none"} />
    <path d="M3 19.5c.4-3.3 2.8-5.5 6-5.5s5.6 2.2 6 5.5z" fill={p.fill ? p.color ?? "currentColor" : "none"} />
    <path d="M15.5 5.2a3.1 3.1 0 0 1 0 5.8M17.5 14.3c2 .7 3.3 2.6 3.5 5.2" />
  </Svg>
);

export const IcSpot = (p: P) => (
  <Svg {...p}>
    <path d="M7 4.5v15l12-7.5z" fill={p.fill ? p.color ?? "currentColor" : "none"} />
  </Svg>
);

export const IcSearch = (p: P) => (
  <Svg {...p}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="M16 16l4.5 4.5" />
  </Svg>
);

export const IcAddFriend = (p: P) => (
  <Svg {...p}>
    <circle cx="10" cy="8" r="3.5" />
    <path d="M3.5 20c.5-3.6 3.1-6 6.5-6 1.5 0 2.8.4 3.9 1.2M18 13v6M15 16h6" />
  </Svg>
);

export const IcNewChat = (p: P) => (
  <Svg {...p}>
    <path d="M4 5.5h9M4 5.5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h2v3.5l5-3.5h9a1 1 0 0 0 1-1V12" />
    <path d="M18.5 3.5l2 2-6.5 6.5-2.8.8.8-2.8z" />
  </Svg>
);

export const IcFlip = (p: P) => (
  <Svg {...p}>
    <path d="M4 12a8 8 0 0 1 13.7-5.6L20 8.5M20 4v4.5h-4.5M20 12a8 8 0 0 1-13.7 5.6L4 15.5M4 20v-4.5h4.5" />
  </Svg>
);

export const IcFlash = (p: P) => (
  <Svg {...p}>
    <path d="M13 3L5.5 13.5H11L10 21l7.5-10.5H12z" fill={p.fill ? p.color ?? "currentColor" : "none"} />
  </Svg>
);

export const IcTimer = (p: P) => (
  <Svg {...p}>
    <circle cx="12" cy="13" r="7.5" />
    <path d="M12 9.5V13l2.5 1.5M9.5 2.8h5" />
  </Svg>
);

export const IcMusic = (p: P) => (
  <Svg {...p}>
    <path d="M9 18V6l11-2v12" />
    <circle cx="6.5" cy="18" r="2.5" />
    <circle cx="17.5" cy="16" r="2.5" />
  </Svg>
);

export const IcChevDown = (p: P) => (
  <Svg {...p}>
    <path d="M6 9.5l6 6 6-6" />
  </Svg>
);

export const IcBack = (p: P) => (
  <Svg {...p}>
    <path d="M15 5l-7 7 7 7" />
  </Svg>
);

export const IcClose = (p: P) => (
  <Svg {...p}>
    <path d="M6 6l12 12M18 6L6 18" />
  </Svg>
);

export const IcMemories = (p: P) => (
  <Svg {...p}>
    <rect x="6.5" y="3.5" width="12" height="15" rx="2.2" />
    <path d="M4.5 7v12a1.8 1.8 0 0 0 1.8 1.8H15" />
  </Svg>
);

export const IcLens = (p: P) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <circle cx="9" cy="10" r=".9" fill="currentColor" />
    <circle cx="15" cy="10" r=".9" fill="currentColor" />
    <path d="M8.5 14c1 1.4 2.2 2 3.5 2s2.5-.6 3.5-2" />
  </Svg>
);

export const IcPhone = (p: P) => (
  <Svg {...p}>
    <path d="M5 4h3.5l1.5 4-2 1.5a11 11 0 0 0 6.5 6.5l1.5-2 4 1.5V19a1.5 1.5 0 0 1-1.5 1.5A15.5 15.5 0 0 1 3.5 5.5 1.5 1.5 0 0 1 5 4z" />
  </Svg>
);

export const IcVideo = (p: P) => (
  <Svg {...p}>
    <rect x="3" y="6.5" width="12.5" height="11" rx="2" />
    <path d="M15.5 10.5l5-3v9l-5-3" />
  </Svg>
);

export const IcMic = (p: P) => (
  <Svg {...p}>
    <rect x="9" y="3" width="6" height="11" rx="3" />
    <path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21" />
  </Svg>
);

export const IcSticker = (p: P) => (
  <Svg {...p}>
    <path d="M20.5 12.5v-6a3 3 0 0 0-3-3h-11a3 3 0 0 0-3 3v11a3 3 0 0 0 3 3h6z" />
    <path d="M12.5 20.5c0-4.4 3.6-8 8-8" />
    <circle cx="9" cy="10" r=".9" fill="currentColor" />
    <circle cx="14.5" cy="10" r=".9" fill="currentColor" />
  </Svg>
);

export const IcImage = (p: P) => (
  <Svg {...p}>
    <rect x="3.5" y="4.5" width="17" height="15" rx="2.5" />
    <circle cx="9" cy="10" r="1.8" />
    <path d="M20.5 16l-5-5-8.5 8.5" />
  </Svg>
);

export const IcSend = (p: P) => (
  <Svg {...p}>
    <path d="M4 12l16-8-5.5 16-2.8-6.2z" fill={p.fill ? p.color ?? "currentColor" : "none"} />
  </Svg>
);

export const IcGear = (p: P) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
  </Svg>
);

export const IcDots = (p: P) => (
  <Svg {...p}>
    <circle cx="5.5" cy="12" r="1.2" fill="currentColor" />
    <circle cx="12" cy="12" r="1.2" fill="currentColor" />
    <circle cx="18.5" cy="12" r="1.2" fill="currentColor" />
  </Svg>
);

export const IcText = (p: P) => (
  <Svg {...p} strokeWidth={2.4}>
    <path d="M5 5.5h14M12 5.5V19" />
  </Svg>
);

export const IcPen = (p: P) => (
  <Svg {...p}>
    <path d="M4 20l1.2-4.5L16 4.7a2 2 0 0 1 2.8 0l.5.5a2 2 0 0 1 0 2.8L8.5 18.8z" />
  </Svg>
);

export const IcScissors = (p: P) => (
  <Svg {...p}>
    <circle cx="6" cy="6.5" r="2.5" />
    <circle cx="6" cy="17.5" r="2.5" />
    <path d="M8 8l12 10M8 16L20 6" />
  </Svg>
);

export const IcClip = (p: P) => (
  <Svg {...p}>
    <path d="M20 11.5l-8 8a5 5 0 0 1-7-7l8.5-8.5a3.3 3.3 0 0 1 4.7 4.7L9.7 17.2a1.7 1.7 0 0 1-2.4-2.4L15 7" />
  </Svg>
);

export const IcDownload = (p: P) => (
  <Svg {...p}>
    <path d="M12 4v11M7 10.5l5 5 5-5M5 20h14" />
  </Svg>
);

export const IcLock = (p: P) => (
  <Svg {...p}>
    <rect x="5" y="10.5" width="14" height="10" rx="2" />
    <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
  </Svg>
);

export const IcHeart = (p: P) => (
  <Svg {...p}>
    <path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7a4.3 4.3 0 0 1 7.5 2.8C19.5 15.4 12 20 12 20z" fill={p.fill ? p.color ?? "currentColor" : "none"} />
  </Svg>
);

export const IcShare = (p: P) => (
  <Svg {...p}>
    <path d="M14 5l6 6-6 6M20 11H10a6 6 0 0 0-6 6v1" />
  </Svg>
);

export const IcComment = (p: P) => (
  <Svg {...p}>
    <path d="M20.5 11.5a8.5 8.5 0 0 1-12.4 7.6L3.5 20.5l1.4-4.6A8.5 8.5 0 1 1 20.5 11.5z" />
  </Svg>
);

export const IcCrop = (p: P) => (
  <Svg {...p}>
    <path d="M6 2.5V18h15.5M2.5 6H18v15.5" />
  </Svg>
);

/** The parody app mark: a flame curling into a heart, white on yellow. */
export function AppMark({ size = 28, bg = "#FFFC00" }: { size?: number; bg?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden focusable="false">
      <rect width="40" height="40" rx="11" fill={bg} />
      <path
        d="M20 32c-6.2 0-10-3.9-10-9 0-4.5 3.3-7.2 5.4-10.4.4 2.3 1.6 3.8 3.1 4.5-.3-4.4 1.8-8.1 5.3-10.1-.6 3.5 1 6 3.1 8.3 1.9 2.1 3.1 4.4 3.1 7.7 0 5.1-3.8 9-10 9z"
        fill="#fff"
        stroke="#111"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <path d="M20 28.2s-4.2-2.5-4.2-5.4a2.2 2.2 0 0 1 4.2-1 2.2 2.2 0 0 1 4.2 1c0 2.9-4.2 5.4-4.2 5.4z" fill="#FF3B5C" />
    </svg>
  );
}

/**
 * The status glyph left of a chat row's second line — the real app's language:
 * filled square = new snap, outlined = opened, filled arrow = delivered,
 * outlined arrow = opened by them, bubble = new chat.
 */
export function StatusGlyph({ kind, color }: { kind: "new" | "opened" | "sent" | "seen" | "chat" | "chatSeen"; color: string }) {
  if (kind === "new" || kind === "opened") {
    return (
      <svg width="13" height="13" viewBox="0 0 14 14" aria-hidden>
        <rect x="1.5" y="1.5" width="11" height="11" rx="2.2" fill={kind === "new" ? color : "none"} stroke={color} strokeWidth="2" />
      </svg>
    );
  }
  if (kind === "chat" || kind === "chatSeen") {
    return (
      <svg width="14" height="13" viewBox="0 0 16 14" aria-hidden>
        <path d="M2 2h12v8H7l-3.5 2.6V10H2z" fill={kind === "chat" ? color : "none"} stroke={color} strokeWidth="1.9" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg width="14" height="13" viewBox="0 0 16 14" aria-hidden>
      <path d="M2 2l12 5-12 5 2.6-5z" fill={kind === "sent" ? color : "none"} stroke={color} strokeWidth="1.9" strokeLinejoin="round" />
    </svg>
  );
}
