"use client";

// ─── Line icons for the listing — drawn here, no icon font, no brand marks ───
//
// Every glyph is a 24-unit viewBox with a 1.8 stroke so the icon row, the tab
// bar and the buy box read as one family, the way a real store's do.

type P = { size?: number; color?: string; fill?: string; strokeWidth?: number; style?: React.CSSProperties };

const base = (size: number, style?: React.CSSProperties): React.SVGProps<SVGSVGElement> => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  "aria-hidden": true,
  focusable: false,
  style: { display: "block", flex: "none", ...style },
});

export function IconHeart({ size = 22, color = "currentColor", fill = "none", strokeWidth = 1.8, style }: P) {
  return (
    <svg {...base(size, style)}>
      <path
        d="M12 20.3s-7.6-4.6-9.2-9.6C1.7 7.3 3.8 4.2 7.1 4.2c2 0 3.6 1.1 4.9 3 1.3-1.9 2.9-3 4.9-3 3.3 0 5.4 3.1 4.3 6.5-1.6 5-9.2 9.6-9.2 9.6z"
        fill={fill}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconShare({ size = 22, color = "currentColor", style }: P) {
  return (
    <svg {...base(size, style)}>
      <path d="M12 3.5v11M7.8 7.4 12 3.5l4.2 3.9" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 10.5H6.2a1.7 1.7 0 0 0-1.7 1.7v6.6a1.7 1.7 0 0 0 1.7 1.7h11.6a1.7 1.7 0 0 0 1.7-1.7v-6.6a1.7 1.7 0 0 0-1.7-1.7H16" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function IconBack({ size = 22, color = "currentColor", style }: P) {
  return (
    <svg {...base(size, style)}>
      <path d="M15 4.5 7.5 12l7.5 7.5" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconChevronRight({ size = 14, color = "currentColor", style }: P) {
  return (
    <svg {...base(size, style)}>
      <path d="m9 5 7 7-7 7" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconSearch({ size = 20, color = "currentColor", style }: P) {
  return (
    <svg {...base(size, style)}>
      <circle cx="10.5" cy="10.5" r="6.3" fill="none" stroke={color} strokeWidth="2" />
      <path d="m15.3 15.3 5.2 5.2" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

export function IconCamera({ size = 20, color = "currentColor", style }: P) {
  return (
    <svg {...base(size, style)}>
      <path d="M4 8.5A1.5 1.5 0 0 1 5.5 7h2.2l1.5-2h5.6l1.5 2h2.2A1.5 1.5 0 0 1 20 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5z" fill="none" stroke={color} strokeWidth="1.8" strokeLinejoin="round" />
      <circle cx="12" cy="13" r="3.2" fill="none" stroke={color} strokeWidth="1.8" />
    </svg>
  );
}

export function IconMic({ size = 20, color = "currentColor", style }: P) {
  return (
    <svg {...base(size, style)}>
      <rect x="9" y="3.5" width="6" height="11" rx="3" fill="none" stroke={color} strokeWidth="1.8" />
      <path d="M6 11.5a6 6 0 0 0 12 0M12 17.5v3" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function IconMenu({ size = 22, color = "currentColor", style }: P) {
  return (
    <svg {...base(size, style)}>
      <path d="M4 6.5h16M4 12h16M4 17.5h16" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function IconHome({ size = 24, color = "currentColor", style }: P) {
  return (
    <svg {...base(size, style)}>
      <path d="M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4.5v-5.5h-5V20H5a1 1 0 0 1-1-1z" fill="none" stroke={color} strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

export function IconUser({ size = 24, color = "currentColor", style }: P) {
  return (
    <svg {...base(size, style)}>
      <circle cx="12" cy="8.5" r="3.8" fill="none" stroke={color} strokeWidth="1.8" />
      <path d="M4.5 20c.9-3.9 3.9-6 7.5-6s6.6 2.1 7.5 6" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function IconUs({ size = 24, color = "currentColor", style }: P) {
  return (
    <svg {...base(size, style)}>
      <circle cx="8.5" cy="8.5" r="3" fill="none" stroke={color} strokeWidth="1.8" />
      <circle cx="15.8" cy="8.5" r="3" fill="none" stroke={color} strokeWidth="1.8" />
      <path d="M3 19c.6-3.2 2.8-5 5.5-5 1.5 0 2.8.5 3.7 1.5.9-1 2.2-1.5 3.6-1.5 2.7 0 4.9 1.8 5.5 5" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function IconCart({ size = 26, color = "currentColor", style }: P) {
  return (
    <svg {...base(size, style)} viewBox="0 0 28 24">
      <path d="M1.8 3h3.6l2.8 11.2h12.3l3-8.3H7" fill="none" stroke={color} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="10.4" cy="19.4" r="1.8" fill={color} />
      <circle cx="18.8" cy="19.4" r="1.8" fill={color} />
    </svg>
  );
}

export function IconCheckCircle({ size = 22, color = "#067D62", style }: P) {
  return (
    <svg {...base(size, style)}>
      <circle cx="12" cy="12" r="10" fill={color} />
      <path d="m7.3 12.4 3.1 3 6.3-6.6" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconCheck({ size = 14, color = "currentColor", style }: P) {
  return (
    <svg {...base(size, style)}>
      <path d="m5 12.5 4.3 4.2L19 7" fill="none" stroke={color} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconSparkle({ size = 16, color = "currentColor", style }: P) {
  return (
    <svg {...base(size, style)}>
      <path d="M12 2.5c.5 4.6 2.9 7 7.5 7.5-4.6.5-7 2.9-7.5 7.5-.5-4.6-2.9-7-7.5-7.5 4.6-.5 7-2.9 7.5-7.5z" fill={color} />
      <path d="M19 15.5c.2 1.8 1.2 2.8 3 3-1.8.2-2.8 1.2-3 3-.2-1.8-1.2-2.8-3-3 1.8-.2 2.8-1.2 3-3z" fill={color} opacity=".7" />
    </svg>
  );
}

export function IconThumb({ size = 16, color = "currentColor", style }: P) {
  return (
    <svg {...base(size, style)}>
      <path d="M7.5 10.5v9h-3v-9zM7.5 10.5 11 3.8c1.4 0 2.4 1.2 2.1 2.6l-.6 3.1h5.3c1.3 0 2.2 1.2 1.9 2.4l-1.5 6c-.2.9-1 1.6-1.9 1.6H7.5" fill="none" stroke={color} strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  );
}

export function IconLock({ size = 14, color = "currentColor", style }: P) {
  return (
    <svg {...base(size, style)}>
      <rect x="4.5" y="10.5" width="15" height="10" rx="2" fill="none" stroke={color} strokeWidth="2" />
      <path d="M8.2 10.5V7.8a3.8 3.8 0 0 1 7.6 0v2.7" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function IconPin({ size = 16, color = "currentColor", style }: P) {
  return (
    <svg {...base(size, style)}>
      <path d="M12 21.5s6.8-6.1 6.8-11.6a6.8 6.8 0 1 0-13.6 0c0 5.5 6.8 11.6 6.8 11.6z" fill="none" stroke={color} strokeWidth="1.8" strokeLinejoin="round" />
      <circle cx="12" cy="9.8" r="2.4" fill="none" stroke={color} strokeWidth="1.8" />
    </svg>
  );
}

export function IconChevronDown({ size = 12, color = "currentColor", style }: P) {
  return (
    <svg {...base(size, style)}>
      <path d="m5 9 7 7 7-7" fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ── The feature-icon row (the circles under the price) ───────────────────── */

export function FeatureIcon({ kind, size = 30 }: { kind: "return" | "truck" | "cash" | "crown" | "shield" | "gift"; size?: number }) {
  const s = { fill: "none", stroke: "#1a7e98", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" focusable="false" style={{ display: "block" }}>
      {kind === "return" && (
        <>
          <path {...s} d="M8 13a8.5 8.5 0 0 1 15.4-3.4M24 19a8.5 8.5 0 0 1-15.4 3.4" />
          <path {...s} d="M23.8 5.5v4.4h-4.4M8.2 26.5v-4.4h4.4" />
          <path d="M16 19.6s-3.6-2.2-3.6-4.3c0-1.2.9-2 2-2 .7 0 1.3.4 1.6 1 .3-.6.9-1 1.6-1 1.1 0 2 .8 2 2 0 2.1-3.6 4.3-3.6 4.3z" fill="#e3336b" />
        </>
      )}
      {kind === "truck" && (
        <>
          <path {...s} d="M3.5 9.5h14v11h-14zM17.5 13.5h5.2l3.8 4v3h-9" />
          <circle {...s} cx="8.5" cy="22.5" r="2.2" />
          <circle {...s} cx="22" cy="22.5" r="2.2" />
          <path d="M10.5 16.8s-2.4-1.5-2.4-2.9c0-.8.6-1.3 1.3-1.3.5 0 .9.3 1.1.7.2-.4.6-.7 1.1-.7.7 0 1.3.5 1.3 1.3 0 1.4-2.4 2.9-2.4 2.9z" fill="#e3336b" />
        </>
      )}
      {kind === "cash" && (
        <>
          <rect {...s} x="4" y="9" width="24" height="14" rx="2" />
          <path d="M16 20.4s-3.4-2.1-3.4-4.1c0-1.1.9-1.9 1.9-1.9.7 0 1.2.4 1.5.9.3-.5.8-.9 1.5-.9 1 0 1.9.8 1.9 1.9 0 2-3.4 4.1-3.4 4.1z" fill="#e3336b" />
          <path {...s} d="M7.5 12.5v0M24.5 19.5v0" strokeWidth={2.4} />
        </>
      )}
      {kind === "crown" && (
        <>
          <path {...s} d="M5 22.5 3.8 10.5l6.4 5L16 7l5.8 8.5 6.4-5L27 22.5z" />
          <path {...s} d="M5.5 26h21" />
        </>
      )}
      {kind === "shield" && (
        <>
          <path {...s} d="M16 4.5 26 8v7.5c0 6-4.3 10.3-10 12-5.7-1.7-10-6-10-12V8z" />
          <path {...s} d="m11.5 16 3.2 3.2 6-6.4" />
        </>
      )}
      {kind === "gift" && (
        <>
          <rect {...s} x="5" y="12" width="22" height="15" rx="1.5" />
          <path {...s} d="M3.8 8.5h24.4V12H3.8zM16 8.5V27" />
          <path {...s} d="M16 8.5c-1.8-3.8-6.5-4.4-6.5-1.6 0 1.6 3.3 1.6 6.5 1.6zM16 8.5c1.8-3.8 6.5-4.4 6.5-1.6 0 1.6-3.3 1.6-6.5 1.6z" />
        </>
      )}
    </svg>
  );
}
