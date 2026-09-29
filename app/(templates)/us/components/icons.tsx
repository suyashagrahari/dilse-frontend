// ─── Us — the icon set ───────────────────────────────────────────────────────
//
// Hand-drawn inline SVG on a 24 grid, 2px round strokes — the optical weight of
// the real app's outline set. Generic forms only (a house, a compass, a paper
// plane, a heart); no brand artwork.

import type { CSSProperties, ReactNode } from "react";

export interface IconProps {
  size?: number;
  color?: string;
  style?: CSSProperties;
  filled?: boolean;
  strokeWidth?: number;
}

function Svg({ size = 24, style, children }: { size?: number; style?: CSSProperties; children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      focusable={false}
      style={{ display: "block", flexShrink: 0, ...style }}
    >
      {children}
    </svg>
  );
}

const st = (c: string, w = 2) => ({ stroke: c, strokeWidth: w, strokeLinecap: "round" as const, strokeLinejoin: "round" as const });

export const HomeIcon = ({ size, color = "#000", style, filled }: IconProps) => (
  <Svg size={size} style={style}>
    <path d="M3.5 10.2 12 3l8.5 7.2V20a1 1 0 0 1-1 1H15v-6.2h-6V21H4.5a1 1 0 0 1-1-1z" {...st(color)} fill={filled ? color : "none"} />
  </Svg>
);
export const SearchIcon = ({ size, color = "#000", style, filled }: IconProps) => (
  <Svg size={size} style={style}>
    <circle cx="10.5" cy="10.5" r="7" {...st(color, filled ? 3 : 2)} />
    <path d="m16 16 5 5" {...st(color, filled ? 3 : 2)} />
  </Svg>
);
export const ExploreIcon = ({ size, color = "#000", style }: IconProps) => (
  <Svg size={size} style={style}>
    <circle cx="12" cy="12" r="9.5" {...st(color)} />
    <path d="m15.8 8.2-2.3 5.3-5.3 2.3 2.3-5.3z" {...st(color)} />
  </Svg>
);
export const ClipsIcon = ({ size, color = "#000", style }: IconProps) => (
  <Svg size={size} style={style}>
    <rect x="2.5" y="2.5" width="19" height="19" rx="5" {...st(color)} />
    <path d="M2.5 8h19M8.5 2.5 11 8M14.5 2.5 17 8" {...st(color)} />
    <path d="m10 11.2 5 3-5 3z" fill={color} {...st(color, 1.4)} />
  </Svg>
);
export const MessagesIcon = ({ size, color = "#000", style }: IconProps) => (
  <Svg size={size} style={style}>
    <path d="M12 2.8c-5.2 0-9.2 3.8-9.2 8.9 0 2.7 1.1 5 2.9 6.6v3.3l3.1-1.7c1 .3 2.1.5 3.2.5 5.2 0 9.2-3.8 9.2-8.8S17.2 2.8 12 2.8z" {...st(color)} />
    <path d="m6.8 14.2 3.3-3.4 2.4 2 3.3-3.4" {...st(color)} />
  </Svg>
);
export const HeartIcon = ({ size, color = "#000", style, filled }: IconProps) => (
  <Svg size={size} style={style}>
    <path
      d="M12 20.6s-8.4-4.9-8.4-11a4.7 4.7 0 0 1 8.4-2.9 4.7 4.7 0 0 1 8.4 2.9c0 6.1-8.4 11-8.4 11z"
      {...st(color)}
      fill={filled ? color : "none"}
    />
  </Svg>
);
export const PlusSquareIcon = ({ size, color = "#000", style }: IconProps) => (
  <Svg size={size} style={style}>
    <rect x="2.5" y="2.5" width="19" height="19" rx="5" {...st(color)} />
    <path d="M12 7.5v9M7.5 12h9" {...st(color)} />
  </Svg>
);
export const MenuIcon = ({ size, color = "#000", style }: IconProps) => (
  <Svg size={size} style={style}>
    <path d="M3.5 5.5h17M3.5 12h17M3.5 18.5h17" {...st(color)} />
  </Svg>
);
export const GridIcon = ({ size, color = "#000", style }: IconProps) => (
  <Svg size={size} style={style}>
    <rect x="3" y="3" width="18" height="18" rx="1" {...st(color)} />
    <path d="M9 3v18M15 3v18M3 9h18M3 15h18" {...st(color)} />
  </Svg>
);
export const TaggedIcon = ({ size, color = "#000", style }: IconProps) => (
  <Svg size={size} style={style}>
    <path d="M9.5 3H4.5A1.5 1.5 0 0 0 3 4.5v15A1.5 1.5 0 0 0 4.5 21h15a1.5 1.5 0 0 0 1.5-1.5v-15A1.5 1.5 0 0 0 19.5 3h-5L12 5.5z" {...st(color)} />
    <circle cx="12" cy="10.5" r="2.8" {...st(color)} />
    <path d="M6.8 21a5.3 5.3 0 0 1 10.4 0" {...st(color)} />
  </Svg>
);
export const ChevronLeft = ({ size, color = "#000", style, strokeWidth = 2 }: IconProps) => (
  <Svg size={size} style={style}>
    <path d="M15 4.5 7.5 12l7.5 7.5" {...st(color, strokeWidth)} />
  </Svg>
);
export const ChevronRight = ({ size, color = "#000", style, strokeWidth = 2 }: IconProps) => (
  <Svg size={size} style={style}>
    <path d="m9 4.5 7.5 7.5L9 19.5" {...st(color, strokeWidth)} />
  </Svg>
);
export const ChevronDown = ({ size, color = "#000", style, strokeWidth = 2 }: IconProps) => (
  <Svg size={size} style={style}>
    <path d="m5 9 7 7 7-7" {...st(color, strokeWidth)} />
  </Svg>
);
export const CloseIcon = ({ size, color = "#000", style, strokeWidth = 2 }: IconProps) => (
  <Svg size={size} style={style}>
    <path d="M5 5l14 14M19 5 5 19" {...st(color, strokeWidth)} />
  </Svg>
);
export const DotsIcon = ({ size, color = "#000", style }: IconProps) => (
  <Svg size={size} style={style}>
    <circle cx="5.5" cy="12" r="1.6" fill={color} />
    <circle cx="12" cy="12" r="1.6" fill={color} />
    <circle cx="18.5" cy="12" r="1.6" fill={color} />
  </Svg>
);
export const CommentIcon = ({ size, color = "#000", style }: IconProps) => (
  <Svg size={size} style={style}>
    <path d="M20.7 16.7A9.3 9.3 0 1 0 17 20.4l4 1.1z" {...st(color)} />
  </Svg>
);
export const SendIcon = ({ size, color = "#000", style }: IconProps) => (
  <Svg size={size} style={style}>
    <path d="M21.5 2.5 10.2 13.8M21.5 2.5 14.6 21l-4.4-7.2L3 9.4z" {...st(color)} />
  </Svg>
);
export const BookmarkIcon = ({ size, color = "#000", style, filled }: IconProps) => (
  <Svg size={size} style={style}>
    <path d="M19.5 21 12 14.2 4.5 21V3.5h15z" {...st(color)} fill={filled ? color : "none"} />
  </Svg>
);
export const StackGlyph = ({ size = 20, color = "#fff", style }: IconProps) => (
  <Svg size={size} style={style}>
    <path d="M7 5.5V4a1.5 1.5 0 0 1 1.5-1.5h11A1.5 1.5 0 0 1 21 4v11a1.5 1.5 0 0 1-1.5 1.5H18" stroke={color} strokeWidth="2" />
    <rect x="3" y="6.5" width="14" height="14" rx="1.5" fill={color} />
  </Svg>
);
export const PlayGlyph = ({ size = 20, color = "#fff", style }: IconProps) => (
  <Svg size={size} style={style}>
    <rect x="2.5" y="2.5" width="19" height="19" rx="5" stroke={color} strokeWidth="2" />
    <path d="M2.5 8h19M8.5 2.5 11 8M14.5 2.5 17 8" stroke={color} strokeWidth="2" />
    <path d="m10 11.2 5 3-5 3z" fill={color} />
  </Svg>
);
export const PinGlyph = ({ size = 18, color = "#fff", style }: IconProps) => (
  <Svg size={size} style={style}>
    <path d="M15 3.5 20.5 9l-2.8.9-3.4 3.4.4 4.3-1.5 1.5-3.7-3.7L4.5 20.5 3.5 19.5l5-5-3.7-3.7L6.3 9.3l4.3.4L14 6.3z" fill={color} />
  </Svg>
);
export const LockIcon = ({ size, color = "#000", style }: IconProps) => (
  <Svg size={size} style={style}>
    <rect x="4.5" y="10.5" width="15" height="10.5" rx="2" {...st(color)} />
    <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" {...st(color)} />
  </Svg>
);
export const PersonPlusIcon = ({ size, color = "#000", style }: IconProps) => (
  <Svg size={size} style={style}>
    <circle cx="9.5" cy="8" r="4" {...st(color)} />
    <path d="M2.5 20.5a7 7 0 0 1 14 0M19.5 8v6M16.5 11h6" {...st(color)} />
  </Svg>
);
export const LinkIcon = ({ size, color = "#000", style }: IconProps) => (
  <Svg size={size} style={style}>
    <path d="M10 14a4.2 4.2 0 0 0 6 0l3-3a4.2 4.2 0 0 0-6-6l-1 1M14 10a4.2 4.2 0 0 0-6 0l-3 3a4.2 4.2 0 0 0 6 6l1-1" {...st(color)} />
  </Svg>
);
export const CameraIcon = ({ size, color = "#000", style }: IconProps) => (
  <Svg size={size} style={style}>
    <path d="M3 8.5A1.5 1.5 0 0 1 4.5 7h2.3l1.6-2.5h7.2L17.2 7h2.3A1.5 1.5 0 0 1 21 8.5v10a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 18.5z" {...st(color)} />
    <circle cx="12" cy="13" r="3.6" {...st(color)} />
  </Svg>
);
export const MicIcon = ({ size, color = "#000", style }: IconProps) => (
  <Svg size={size} style={style}>
    <rect x="9" y="2.5" width="6" height="12" rx="3" {...st(color)} />
    <path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5v4" {...st(color)} />
  </Svg>
);
export const ImageIcon = ({ size, color = "#000", style }: IconProps) => (
  <Svg size={size} style={style}>
    <rect x="3" y="3" width="18" height="18" rx="4" {...st(color)} />
    <circle cx="9" cy="9" r="1.8" {...st(color)} />
    <path d="m3.5 17.5 5-5 4 4 2.5-2.5 5.5 5.5" {...st(color)} />
  </Svg>
);
export const SmileIcon = ({ size, color = "#000", style }: IconProps) => (
  <Svg size={size} style={style}>
    <circle cx="12" cy="12" r="9.5" {...st(color)} />
    <path d="M8 14.5a4.8 4.8 0 0 0 8 0" {...st(color)} />
    <circle cx="9" cy="9.5" r="1.2" fill={color} />
    <circle cx="15" cy="9.5" r="1.2" fill={color} />
  </Svg>
);
export const PhoneIcon = ({ size, color = "#000", style }: IconProps) => (
  <Svg size={size} style={style}>
    <path d="M7.2 3.5h-2a1.5 1.5 0 0 0-1.5 1.7 16.5 16.5 0 0 0 15.1 15.1 1.5 1.5 0 0 0 1.7-1.5v-2a1.5 1.5 0 0 0-1.1-1.4l-3-.8a1.5 1.5 0 0 0-1.5.4l-1 1a12.4 12.4 0 0 1-5.6-5.6l1-1a1.5 1.5 0 0 0 .4-1.5l-.8-3a1.5 1.5 0 0 0-1.4-1.1z" {...st(color)} />
  </Svg>
);
export const VideoIcon = ({ size, color = "#000", style }: IconProps) => (
  <Svg size={size} style={style}>
    <rect x="2.5" y="6" width="13.5" height="12" rx="2.5" {...st(color)} />
    <path d="m16 10.5 5.5-3v9l-5.5-3z" {...st(color)} />
  </Svg>
);
export const GearIcon = ({ size, color = "#000", style }: IconProps) => (
  <Svg size={size} style={style}>
    <circle cx="12" cy="12" r="3.2" {...st(color)} />
    <path d="M19.4 13.5a7.6 7.6 0 0 0 0-3l2-1.6-2-3.4-2.4 1a7.5 7.5 0 0 0-2.6-1.5L14 2.5h-4l-.4 2.5A7.5 7.5 0 0 0 7 6.5l-2.4-1-2 3.4 2 1.6a7.6 7.6 0 0 0 0 3l-2 1.6 2 3.4 2.4-1a7.5 7.5 0 0 0 2.6 1.5l.4 2.5h4l.4-2.5a7.5 7.5 0 0 0 2.6-1.5l2.4 1 2-3.4z" {...st(color, 1.6)} />
  </Svg>
);
/** Our "verified couple" badge — a heart-shaped rosette, not the blue check. */
export const CoupleBadge = ({ size = 16, style }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-label="verified couple" role="img" style={{ display: "inline-block", flexShrink: 0, ...style }}>
    <path
      d="M12 1.8l2.3 1.7 2.8-.3 1.1 2.6 2.6 1.1-.3 2.8 1.7 2.3-1.7 2.3.3 2.8-2.6 1.1-1.1 2.6-2.8-.3L12 22.2l-2.3-1.7-2.8.3-1.1-2.6-2.6-1.1.3-2.8L1.8 12l1.7-2.3-.3-2.8 2.6-1.1 1.1-2.6 2.8.3z"
      fill="#FF3D7F"
    />
    <path d="M12 16.4s-4.2-2.5-4.2-5.4a2.3 2.3 0 0 1 4.2-1.3 2.3 2.3 0 0 1 4.2 1.3c0 2.9-4.2 5.4-4.2 5.4z" fill="#fff" />
  </svg>
);
export const PenIcon = ({ size = 16, color = "currentColor", style }: IconProps) => (
  <Svg size={size} style={style}>
    <path d="M4 20l1-4.5L15.5 5a2.1 2.1 0 0 1 3 3L8 18.5z" {...st(color)} />
  </Svg>
);
export const SpinnerIcon = ({ size = 20, color = "currentColor", style }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden style={{ display: "block", animation: "us-spin .8s linear infinite", ...style }}>
    <circle cx="12" cy="12" r="9" stroke={color} strokeOpacity=".25" strokeWidth="3" fill="none" />
    <path d="M21 12a9 9 0 0 0-9-9" stroke={color} strokeWidth="3" strokeLinecap="round" fill="none" />
  </svg>
);
export const BackArrow = ({ size, color = "#000", style }: IconProps) => (
  <Svg size={size} style={style}>
    <path d="M20 12H4M10.5 5.5 4 12l6.5 6.5" {...st(color)} />
  </Svg>
);
