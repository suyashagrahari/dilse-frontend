// ─── Icons ───────────────────────────────────────────────────────────────────
//
// Every glyph on the watch page, drawn here from primitives on a 24px grid in
// the outlined, 1.6-ish stroke weight a watch page uses. None is traced from
// anybody's icon set, and there is no play-triangle-in-a-rounded-rectangle
// anywhere: our mark is a heart.

import type { CSSProperties, ReactNode } from "react";

export interface IconProps {
  size?: number;
  color?: string;
  filled?: boolean;
  style?: CSSProperties;
  className?: string;
}

function Svg({
  size = 24,
  style,
  className,
  children,
}: {
  size?: number;
  style?: CSSProperties;
  className?: string;
  children: ReactNode;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      className={className}
      style={{ display: "block", flex: "none", ...style }}
    >
      {children}
    </svg>
  );
}

const S = (color: string, w = 1.7) => ({
  fill: "none",
  stroke: color,
  strokeWidth: w,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
});

export const IMenu = ({ size, color = "currentColor", style }: IconProps) => (
  <Svg size={size} style={style}>
    <path d="M3.5 6.5h17M3.5 12h17M3.5 17.5h17" {...S(color)} />
  </Svg>
);

export const ISearch = ({ size, color = "currentColor", style }: IconProps) => (
  <Svg size={size} style={style}>
    <circle cx="10.5" cy="10.5" r="6.3" {...S(color)} />
    <path d="M15.2 15.2l5.3 5.3" {...S(color)} />
  </Svg>
);

export const IMic = ({ size, color = "currentColor", style }: IconProps) => (
  <Svg size={size} style={style}>
    <rect x="9" y="3.5" width="6" height="11" rx="3" {...S(color)} />
    <path d="M5.8 11.5a6.2 6.2 0 0 0 12.4 0M12 17.8v2.7" {...S(color)} />
  </Svg>
);

export const IBell = ({ size, color = "currentColor", filled, style, className }: IconProps) => (
  <Svg size={size} style={style} className={className}>
    <path
      d="M6.5 16.5V11a5.5 5.5 0 0 1 11 0v5.5l1.6 1.7H4.9z"
      {...S(color)}
      fill={filled ? color : "none"}
    />
    <path d="M10 20.3a2.2 2.2 0 0 0 4 0" {...S(color)} />
  </Svg>
);

export const ICast = ({ size, color = "currentColor", style }: IconProps) => (
  <Svg size={size} style={style}>
    <path d="M3.5 8V6.5a1.5 1.5 0 0 1 1.5-1.5h14a1.5 1.5 0 0 1 1.5 1.5v11a1.5 1.5 0 0 1-1.5 1.5h-6" {...S(color)} />
    <path d="M3.5 11.5a7 7 0 0 1 7 7M3.5 15a3.5 3.5 0 0 1 3.5 3.5" {...S(color)} />
    <circle cx="3.9" cy="18.6" r="0.9" fill={color} />
  </Svg>
);

export const IPlus = ({ size, color = "currentColor", style }: IconProps) => (
  <Svg size={size} style={style}>
    <path d="M12 5v14M5 12h14" {...S(color, 1.9)} />
  </Svg>
);

export const IThumb = ({
  size,
  color = "currentColor",
  filled,
  down,
  style,
  className,
}: IconProps & { down?: boolean }) => (
  <Svg size={size} style={down ? { transform: "scaleY(-1)", ...style } : style} className={className}>
    <path
      d="M8 10.2l3.6-6.1c.3-.5.9-.7 1.4-.4 1 .5 1.5 1.6 1.2 2.7L13.6 9.6h4.9a2 2 0 0 1 2 2.4l-1.3 6.2a2.4 2.4 0 0 1-2.4 1.9H8z"
      {...S(color)}
      fill={filled ? color : "none"}
    />
    <rect x="3.5" y="10" width="3.2" height="10" rx="1" {...S(color)} fill={filled ? color : "none"} />
  </Svg>
);

export const IShare = ({ size, color = "currentColor", style }: IconProps) => (
  <Svg size={size} style={style}>
    <path d="M14 5.5l6.5 6.2-6.5 6.3v-3.6c-4.6 0-7.8 1.3-10 4.6.8-4.8 3.6-8.7 10-9.6z" {...S(color)} />
  </Svg>
);

export const IDownload = ({ size, color = "currentColor", style }: IconProps) => (
  <Svg size={size} style={style}>
    <path d="M12 4v11M7.2 10.5L12 15.3l4.8-4.8M5 19.5h14" {...S(color)} />
  </Svg>
);

export const IScissors = ({ size, color = "currentColor", style }: IconProps) => (
  <Svg size={size} style={style}>
    <circle cx="6.5" cy="7" r="2.6" {...S(color)} />
    <circle cx="6.5" cy="17" r="2.6" {...S(color)} />
    <path d="M8.6 8.6L20 18M8.6 15.4L20 6" {...S(color)} />
  </Svg>
);

export const ISave = ({ size, color = "currentColor", style }: IconProps) => (
  <Svg size={size} style={style}>
    <path d="M4 6.5h11M4 11h11M4 15.5h7M17.5 13v7M14 16.5h7" {...S(color)} />
  </Svg>
);

export const IMoreH = ({ size, color = "currentColor", style }: IconProps) => (
  <Svg size={size} style={style}>
    {[6, 12, 18].map((x) => (
      <circle key={x} cx={x} cy="12" r="1.6" fill={color} />
    ))}
  </Svg>
);

export const IMoreV = ({ size, color = "currentColor", style }: IconProps) => (
  <Svg size={size} style={style}>
    {[6, 12, 18].map((y) => (
      <circle key={y} cx="12" cy={y} r="1.6" fill={color} />
    ))}
  </Svg>
);

export const IPlay = ({ size, color = "currentColor", style }: IconProps) => (
  <Svg size={size} style={style}>
    <path d="M8 5.2v13.6a.8.8 0 0 0 1.2.7l10.6-6.8a.8.8 0 0 0 0-1.4L9.2 4.5A.8.8 0 0 0 8 5.2z" fill={color} />
  </Svg>
);

export const IPause = ({ size, color = "currentColor", style }: IconProps) => (
  <Svg size={size} style={style}>
    <rect x="6.5" y="5" width="3.6" height="14" rx="1" fill={color} />
    <rect x="13.9" y="5" width="3.6" height="14" rx="1" fill={color} />
  </Svg>
);

export const INext = ({ size, color = "currentColor", style }: IconProps) => (
  <Svg size={size} style={style}>
    <path d="M5.5 5.8v12.4a.7.7 0 0 0 1.1.6l8.6-6.2a.7.7 0 0 0 0-1.2L6.6 5.2a.7.7 0 0 0-1.1.6z" fill={color} />
    <rect x="16.4" y="5" width="2.4" height="14" rx=".8" fill={color} />
  </Svg>
);

export const IPrev = ({ size, color = "currentColor", style }: IconProps) => (
  <Svg size={size} style={{ transform: "scaleX(-1)", ...style }}>
    <path d="M5.5 5.8v12.4a.7.7 0 0 0 1.1.6l8.6-6.2a.7.7 0 0 0 0-1.2L6.6 5.2a.7.7 0 0 0-1.1.6z" fill={color} />
    <rect x="16.4" y="5" width="2.4" height="14" rx=".8" fill={color} />
  </Svg>
);

export const IVolume = ({ size, color = "currentColor", muted, style }: IconProps & { muted?: boolean }) => (
  <Svg size={size} style={style}>
    <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill={color} />
    {muted ? (
      <path d="M15.5 9.5l5 5M20.5 9.5l-5 5" {...S(color, 1.9)} />
    ) : (
      <path d="M15 9a4 4 0 0 1 0 6M17.4 6.5a7.4 7.4 0 0 1 0 11" {...S(color, 1.9)} />
    )}
  </Svg>
);

export const ICC = ({ size, color = "currentColor", style }: IconProps) => (
  <Svg size={size} style={style}>
    <rect x="3" y="5.5" width="18" height="13" rx="2" {...S(color, 1.8)} />
    <path d="M10.3 10.4a2.2 2.2 0 1 0 0 3.2M16.8 10.4a2.2 2.2 0 1 0 0 3.2" {...S(color, 1.6)} />
  </Svg>
);

export const IGear = ({ size, color = "currentColor", style, className }: IconProps) => (
  <Svg size={size} style={style} className={className}>
    <circle cx="12" cy="12" r="3" {...S(color, 1.8)} />
    <path
      d="M12 3.2l1.6 2.2 2.6-.7.6 2.7 2.6 1-1 2.5 1.6 2.2-2.3 1.4.2 2.7-2.7.2-1 2.5-2.4-1.2-2.4 1.2-1-2.5-2.7-.2.2-2.7L4 13.1l1.6-2.2-1-2.5 2.6-1 .6-2.7 2.6.7z"
      {...S(color, 1.6)}
    />
  </Svg>
);

export const ITheatre = ({ size, color = "currentColor", style }: IconProps) => (
  <Svg size={size} style={style}>
    <rect x="2.5" y="7" width="19" height="10" rx="1.6" {...S(color, 1.8)} />
  </Svg>
);

export const IDefaultView = ({ size, color = "currentColor", style }: IconProps) => (
  <Svg size={size} style={style}>
    <rect x="4.5" y="6.5" width="15" height="11" rx="1.6" {...S(color, 1.8)} />
  </Svg>
);

export const IFullscreen = ({ size, color = "currentColor", exit, style }: IconProps & { exit?: boolean }) => (
  <Svg size={size} style={style}>
    {exit ? (
      <path d="M9 4.5V9H4.5M15 4.5V9h4.5M9 19.5V15H4.5M15 19.5V15h4.5" {...S(color, 1.9)} />
    ) : (
      <path d="M4.5 9V4.5H9M19.5 9V4.5H15M4.5 15v4.5H9M19.5 15v4.5H15" {...S(color, 1.9)} />
    )}
  </Svg>
);

export const IMiniplayer = ({ size, color = "currentColor", style }: IconProps) => (
  <Svg size={size} style={style}>
    <rect x="3" y="5" width="18" height="14" rx="1.6" {...S(color, 1.8)} />
    <rect x="12" y="11.5" width="6.5" height="5" rx="1" fill={color} />
  </Svg>
);

export const IChevron = ({ size, color = "currentColor", dir = "down", style }: IconProps & { dir?: "down" | "up" | "right" | "left" }) => {
  const rot = { down: 0, up: 180, right: -90, left: 90 }[dir];
  return (
    <Svg size={size} style={{ transform: `rotate(${rot}deg)`, ...style }}>
      <path d="M6.5 9.5L12 15l5.5-5.5" {...S(color, 1.9)} />
    </Svg>
  );
};

export const ISort = ({ size, color = "currentColor", style }: IconProps) => (
  <Svg size={size} style={style}>
    <path d="M4 7h16M4 12h11M4 17h6" {...S(color, 1.9)} />
  </Svg>
);

export const IPin = ({ size, color = "currentColor", style }: IconProps) => (
  <Svg size={size} style={style}>
    <path d="M9 3.5h6l-1 5.5 3 3v1.5H7V12l3-3zM12 13.5V20" {...S(color, 1.7)} />
  </Svg>
);

export const IHeart = ({ size, color = "currentColor", filled = true, style, className }: IconProps) => (
  <Svg size={size} style={style} className={className}>
    <path
      d="M12 20.2s-7.7-4.7-7.7-10.2A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.7 10c0 5.5-7.7 10.2-7.7 10.2z"
      {...S(color, 1.7)}
      fill={filled ? color : "none"}
    />
  </Svg>
);

export const IClose = ({ size, color = "currentColor", style }: IconProps) => (
  <Svg size={size} style={style}>
    <path d="M6 6l12 12M18 6L6 18" {...S(color, 1.9)} />
  </Svg>
);

export const IReplay = ({ size, color = "currentColor", style }: IconProps) => (
  <Svg size={size} style={style}>
    <path d="M5 12a7 7 0 1 0 2.1-5M5 4.5V9h4.5" {...S(color, 1.9)} />
  </Svg>
);

export const IReply = ({ size, color = "currentColor", style }: IconProps) => (
  <Svg size={size} style={style}>
    <path d="M4.5 18.5V7a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v7.5a2 2 0 0 1-2 2H8z" {...S(color)} />
  </Svg>
);

export const ICheck = ({ size, color = "currentColor", style }: IconProps) => (
  <Svg size={size} style={style}>
    <path d="M5 12.5l4.5 4.5L19 7.5" {...S(color, 2)} />
  </Svg>
);

/** The little "verified" seal next to a channel name — a heart in a circle. */
export const IVerified = ({ size = 14, color = "currentColor", style }: IconProps) => (
  <Svg size={size} style={style}>
    <circle cx="12" cy="12" r="9.5" fill={color} />
    <path d="M12 16.8s-4.3-2.6-4.3-5.6A2.3 2.3 0 0 1 12 9.9a2.3 2.3 0 0 1 4.3 1.3c0 3-4.3 5.6-4.3 5.6z" fill="#0F0F0F" />
  </Svg>
);

export const ISeekArrows = ({ size, color = "currentColor", back, style }: IconProps & { back?: boolean }) => (
  <Svg size={size} style={back ? { transform: "scaleX(-1)", ...style } : style}>
    {[3, 9, 15].map((x) => (
      <path key={x} d={`M${x} 6.5l6 5.5-6 5.5z`} fill={color} />
    ))}
  </Svg>
);

export const ITranscript = ({ size, color = "currentColor", style }: IconProps) => (
  <Svg size={size} style={style}>
    <rect x="3.5" y="4.5" width="17" height="15" rx="2" {...S(color)} />
    <path d="M7 9.5h2M11 9.5h6M7 13h6M15 13h2M7 16.5h4" {...S(color)} />
  </Svg>
);

export const IChapters = ({ size, color = "currentColor", style }: IconProps) => (
  <Svg size={size} style={style}>
    <path d="M4 6h3M4 12h3M4 18h3M10 6h10M10 12h10M10 18h10" {...S(color)} />
  </Svg>
);

export const ISparkle = ({ size, color = "currentColor", style }: IconProps) => (
  <Svg size={size} style={style}>
    <path d="M12 3l1.8 5.4L19 10l-5.2 1.6L12 17l-1.8-5.4L5 10l5.2-1.6z" fill={color} />
    <path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z" fill={color} />
  </Svg>
);

export const IHome = ({ size, color = "currentColor", style }: IconProps) => (
  <Svg size={size} style={style}>
    <path d="M4 11l8-6.5 8 6.5v8.5a1 1 0 0 1-1 1h-4.5v-6h-5v6H5a1 1 0 0 1-1-1z" {...S(color)} />
  </Svg>
);

export const IMoments = ({ size, color = "currentColor", style }: IconProps) => (
  <Svg size={size} style={style}>
    <rect x="6.5" y="3" width="11" height="18" rx="3" {...S(color)} />
    <path d="M12 15.2s-2.8-1.7-2.8-3.7A1.5 1.5 0 0 1 12 10.7a1.5 1.5 0 0 1 2.8.8c0 2-2.8 3.7-2.8 3.7z" fill={color} />
  </Svg>
);

export const ISubs = ({ size, color = "currentColor", style }: IconProps) => (
  <Svg size={size} style={style}>
    <rect x="3.5" y="8" width="17" height="12" rx="2" {...S(color)} />
    <path d="M6 5.5h12M8 3h8M10.5 11.5v5l4-2.5z" {...S(color)} />
  </Svg>
);

export const IYou = ({ size, color = "currentColor", style }: IconProps) => (
  <Svg size={size} style={style}>
    <circle cx="12" cy="8.5" r="3.8" {...S(color)} />
    <path d="M4.5 20a7.5 7.5 0 0 1 15 0" {...S(color)} />
  </Svg>
);

export const ILock = ({ size, color = "currentColor", style }: IconProps) => (
  <Svg size={size} style={style}>
    <rect x="5" y="10.5" width="14" height="10" rx="2" {...S(color)} />
    <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" {...S(color)} />
  </Svg>
);

export const IImage = ({ size, color = "currentColor", style }: IconProps) => (
  <Svg size={size} style={style}>
    <rect x="3.5" y="4.5" width="17" height="15" rx="2" {...S(color)} />
    <circle cx="9" cy="10" r="1.8" {...S(color)} />
    <path d="M4 17.5l5-4.5 3.5 3 3-2.5 4.5 4" {...S(color)} />
  </Svg>
);

export const IArrow = ({ size, color = "currentColor", dir = "left", style }: IconProps & { dir?: "left" | "right" | "up" | "down" }) => {
  const rot = { left: 0, right: 180, up: 90, down: -90 }[dir];
  return (
    <Svg size={size} style={{ transform: `rotate(${rot}deg)`, ...style }}>
      <path d="M19.5 12h-15M10.5 6l-6 6 6 6" {...S(color, 1.9)} />
    </Svg>
  );
};

export const ITrash = ({ size, color = "currentColor", style }: IconProps) => (
  <Svg size={size} style={style}>
    <path d="M4.5 7h15M9.5 7V4.5h5V7M6.5 7l1 13h9l1-13M10.5 11v5.5M13.5 11v5.5" {...S(color)} />
  </Svg>
);

export const ICrop = ({ size, color = "currentColor", style }: IconProps) => (
  <Svg size={size} style={style}>
    <path d="M6.5 2.5v14a1 1 0 0 0 1 1h14M2.5 6.5h14a1 1 0 0 1 1 1v14" {...S(color)} />
  </Svg>
);

export const IRefresh = ({ size, color = "currentColor", style }: IconProps) => (
  <Svg size={size} style={style}>
    <path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3M19.5 4.5v4h-4" {...S(color)} />
  </Svg>
);

export const IMail = ({ size, color = "currentColor", style }: IconProps) => (
  <Svg size={size} style={style}>
    <rect x="3" y="5.5" width="18" height="13" rx="2" {...S(color)} />
    <path d="M3.5 7l8.5 6.5L20.5 7" {...S(color)} />
  </Svg>
);

/** Our mark: a heart with a small play notch cut into it. Never a rounded rectangle. */
export function Mark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" style={{ display: "block", flex: "none" }}>
      <defs>
        <linearGradient id="wt-mark-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FF6FA5" />
          <stop offset="1" stopColor="#FF2F74" />
        </linearGradient>
      </defs>
      <path
        d="M16 28.5S3 20.6 3 11.4A7.2 7.2 0 0 1 16 7.2a7.2 7.2 0 0 1 13 4.2c0 9.2-13 17.1-13 17.1z"
        fill="url(#wt-mark-g)"
      />
      <path d="M13.3 11.6v8.3a.6.6 0 0 0 .9.5l6.4-4.2a.6.6 0 0 0 0-1l-6.4-4.1a.6.6 0 0 0-.9.5z" fill="#FFFFFF" />
    </svg>
  );
}
