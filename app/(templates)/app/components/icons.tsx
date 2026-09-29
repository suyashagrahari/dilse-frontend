// ─── Line icons, drawn by hand ───────────────────────────────────────────────
//
// Thin-stroke glyphs in the system-symbol idiom. Nothing here is a vendor mark:
// every path is original and generic (chevrons, a heart, a person, a globe).

import type { CSSProperties, ReactNode } from "react";

type P = { size?: number; color?: string; style?: CSSProperties; strokeWidth?: number };

function Svg({ size = 20, color = "currentColor", style, children, vb = 24 }: P & { children: ReactNode; vb?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${vb} ${vb}`}
      fill="none"
      stroke={color}
      strokeWidth={1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      style={style}
    >
      {children}
    </svg>
  );
}

export const ChevronLeft = (p: P) => (
  <Svg {...p}>
    <path d="M15 4.5 7.5 12l7.5 7.5" strokeWidth={2.6} />
  </Svg>
);
export const ChevronRight = (p: P) => (
  <Svg {...p}>
    <path d="m9 5 7 7-7 7" strokeWidth={2.4} />
  </Svg>
);
export const ChevronDown = (p: P) => (
  <Svg {...p}>
    <path d="m5 9 7 7 7-7" strokeWidth={2.2} />
  </Svg>
);
export const ShareIcon = (p: P) => (
  <Svg {...p}>
    <path d="M12 3v12M7.5 7.5 12 3l4.5 4.5" />
    <path d="M8 10.5H6.5A1.5 1.5 0 0 0 5 12v7.5A1.5 1.5 0 0 0 6.5 21h11a1.5 1.5 0 0 0 1.5-1.5V12a1.5 1.5 0 0 0-1.5-1.5H16" />
  </Svg>
);
export const PersonIcon = (p: P) => (
  <Svg {...p}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c.8-4.2 4-6.5 8-6.5s7.2 2.3 8 6.5" />
  </Svg>
);
export const PersonSquare = (p: P) => (
  <Svg {...p}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="10" r="3.2" />
    <path d="M6.5 19c1-2.7 3-4 5.5-4s4.5 1.3 5.5 4" />
  </Svg>
);
export const HeartIcon = ({ filled, ...p }: P & { filled?: boolean }) => (
  <Svg {...p}>
    <path
      d="M12 20.5s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 7.5 2.7c0 5.6-7.5 10.2-7.5 10.2z"
      fill={filled ? "currentColor" : "none"}
    />
  </Svg>
);
export const PencilIcon = (p: P) => (
  <Svg {...p}>
    <path d="M4 20h4L19.5 8.5a2.1 2.1 0 0 0-3-3L5 17v3z" />
    <path d="m14.5 7.5 3 3" />
  </Svg>
);
export const HelpIcon = (p: P) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M9.6 9.3a2.5 2.5 0 0 1 4.8.9c0 1.7-2.4 2.2-2.4 3.8" />
    <circle cx="12" cy="17.2" r=".6" fill="currentColor" />
  </Svg>
);
export const CompassIcon = (p: P) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="m15.5 8.5-2 5-5 2 2-5z" />
  </Svg>
);
export const HandIcon = (p: P) => (
  <Svg {...p}>
    <path d="M8 13V6.5a1.5 1.5 0 0 1 3 0V11m0-5.5V5a1.5 1.5 0 0 1 3 0v6m0-4.5a1.5 1.5 0 0 1 3 0V13m-9 0-1.2-1.4a1.6 1.6 0 0 0-2.5 2L7 18c1.3 2 3 3 5.5 3 3.3 0 4.5-2.4 4.5-5.5V9" />
  </Svg>
);
export const EyeTrackIcon = (p: P) => (
  <Svg {...p}>
    <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
    <circle cx="12" cy="12" r="3" />
  </Svg>
);
export const LinkedIcon = (p: P) => (
  <Svg {...p}>
    <circle cx="10" cy="8" r="3.5" />
    <path d="M3.5 20c.7-3.7 3.3-5.8 6.5-5.8 1.2 0 2.3.3 3.2.8" />
    <rect x="14.5" y="14.5" width="6.5" height="5.5" rx="1.2" />
    <path d="M16 14.5v-1.3a1.75 1.75 0 0 1 3.5 0v1.3" />
  </Svg>
);
export const PinIcon = (p: P) => (
  <Svg {...p}>
    <path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11z" />
    <circle cx="12" cy="10" r="2.3" />
  </Svg>
);
export const CupIcon = (p: P) => (
  <Svg {...p}>
    <path d="M5 8h11v6a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5V8z" />
    <path d="M16 10h1.5a2.5 2.5 0 0 1 0 5H16M8 3.5c0 1 1 1 1 2M12 3.5c0 1 1 1 1 2" />
  </Svg>
);
export const SparkIcon = (p: P) => (
  <Svg {...p}>
    <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6" />
  </Svg>
);
export const MusicIcon = (p: P) => (
  <Svg {...p}>
    <path d="M9 18V5.5l11-2V16" />
    <circle cx="6.5" cy="18" r="2.5" />
    <circle cx="17.5" cy="16" r="2.5" />
  </Svg>
);
export const ShirtIcon = (p: P) => (
  <Svg {...p}>
    <path d="M8 3.5 3.5 6l1.8 4 2.2-1V20.5h9V9l2.2 1 1.8-4L16 3.5c-.6 1.5-2 2.5-4 2.5s-3.4-1-4-2.5z" />
  </Svg>
);
export const PeopleIcon = (p: P) => (
  <Svg {...p}>
    <circle cx="8.5" cy="8.5" r="3" />
    <circle cx="16.5" cy="9.5" r="2.5" />
    <path d="M2.5 19c.6-3.3 3-5 6-5s5.4 1.7 6 5M15 14.2c2.6-.2 5.3 1.1 6 4.3" />
  </Svg>
);
export const SearchIcon = (p: P) => (
  <Svg {...p}>
    <circle cx="10.5" cy="10.5" r="6.5" />
    <path d="m15.5 15.5 5 5" />
  </Svg>
);
export const CheckIcon = (p: P) => (
  <Svg {...p}>
    <path d="m5 12.5 4.5 4.5L19 7.5" strokeWidth={2.4} />
  </Svg>
);
export const CloseIcon = (p: P) => (
  <Svg {...p}>
    <path d="M6 6l12 12M18 6 6 18" strokeWidth={2.2} />
  </Svg>
);
export const PhoneIcon = (p: P) => (
  <Svg {...p}>
    <rect x="6.5" y="2.5" width="11" height="19" rx="2.6" />
    <path d="M10.5 5h3" />
  </Svg>
);
export const TabletIcon = (p: P) => (
  <Svg {...p}>
    <rect x="4" y="2.5" width="16" height="19" rx="2.4" />
    <circle cx="12" cy="18.6" r=".6" fill="currentColor" />
  </Svg>
);

/* ── Tab-bar glyphs (filled when active) ───────────────────────────────────── */

export const TabToday = ({ active, ...p }: P & { active?: boolean }) => (
  <Svg {...p} vb={28}>
    <rect x="4" y="4.5" width="20" height="19" rx="4.5" fill={active ? "currentColor" : "none"} />
    <path d="M8 10h12M8 14.5h7" stroke={active ? "#fff" : "currentColor"} />
  </Svg>
);
export const TabUs = ({ active, ...p }: P & { active?: boolean }) => (
  <Svg {...p} vb={28}>
    <path
      d="M11 21.5S4 17.3 4 12.2A3.9 3.9 0 0 1 11 9.8a3.9 3.9 0 0 1 7 2.4"
      fill="none"
    />
    <path
      d="M18 23.5s-6-3.6-6-8a3.3 3.3 0 0 1 6-2 3.3 3.3 0 0 1 6 2c0 4.4-6 8-6 8z"
      fill={active ? "currentColor" : "none"}
    />
  </Svg>
);
export const TabApps = ({ active, ...p }: P & { active?: boolean }) => (
  <Svg {...p} vb={28}>
    <path d="M14 4 4 9l10 5 10-5-10-5z" fill={active ? "currentColor" : "none"} />
    <path d="m4 14 10 5 10-5M4 19l10 5 10-5" />
  </Svg>
);
export const TabDates = ({ active, ...p }: P & { active?: boolean }) => (
  <Svg {...p} vb={28}>
    <rect x="4" y="6" width="20" height="18" rx="4" fill={active ? "currentColor" : "none"} />
    <path d="M9 3.5v5M19 3.5v5" />
    <path
      d="M14 20.2s-3.6-2.1-3.6-4.6a1.8 1.8 0 0 1 3.6-.6 1.8 1.8 0 0 1 3.6.6c0 2.5-3.6 4.6-3.6 4.6z"
      stroke={active ? "#fff" : "currentColor"}
      strokeWidth={1.5}
    />
  </Svg>
);
export const TabSearch = (p: P & { active?: boolean }) => (
  <Svg {...p} vb={28}>
    <circle cx="12.5" cy="12.5" r="7.5" strokeWidth={p.active ? 2.6 : 1.9} />
    <path d="m18.2 18.2 5.8 5.8" strokeWidth={p.active ? 2.6 : 1.9} />
  </Svg>
);

/** Five small stars that fill to an exact fraction. */
export function Stars({
  value,
  size = 12,
  color = "#8A8A8E",
  empty = "#C7C7CC",
  gap = 1,
}: {
  value: number;
  size?: number;
  color?: string;
  empty?: string;
  gap?: number;
}) {
  const d = "M12 2.8l2.7 5.8 6.3.7-4.7 4.3 1.3 6.2L12 16.7l-5.6 3.1 1.3-6.2L3 9.3l6.3-.7z";
  return (
    <span style={{ display: "inline-flex", gap }} aria-label={`${value} out of 5 stars`} role="img">
      {[0, 1, 2, 3, 4].map((i) => {
        const fill = Math.max(0, Math.min(1, value - i));
        return (
          <svg key={i} width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
            <defs>
              <clipPath id={`st-${i}-${Math.round(fill * 100)}`}>
                <rect x="0" y="0" width={24 * fill} height="24" />
              </clipPath>
            </defs>
            <path d={d} fill="none" stroke={fill > 0 ? color : empty} strokeWidth="1.6" strokeLinejoin="round" />
            <path d={d} fill={color} clipPath={`url(#st-${i}-${Math.round(fill * 100)})`} />
          </svg>
        );
      })}
    </span>
  );
}
