// ─── Recharge — hand-drawn icons ─────────────────────────────────────────────
//
// Generic line glyphs drawn here. No icon library, and nothing traced from a
// real operator or payment app.

import type { ReactNode } from "react";

type P = { size?: number; stroke?: number; className?: string };

function Svg({ size = 20, stroke = 1.8, className, children }: P & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

/** The dilpay mark: a heart whose right lobe is a lightning bolt. Filled. */
export function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <rect x="0" y="0" width="32" height="32" rx="10" fill="#F0287A" />
      <path
        d="M16 24.5 9.3 18a4.4 4.4 0 0 1 0-6.3 4.5 4.5 0 0 1 6.4 0l.3.3.3-.3a4.5 4.5 0 0 1 6.4 0 4.4 4.4 0 0 1 0 6.3Z"
        fill="#fff"
      />
      <path d="M17.4 12.2 14.6 17h2.6l-1.6 4.3 3.9-5.6h-2.7l1.4-3.5Z" fill="#E0115F" />
    </svg>
  );
}

export const IconBack = (p: P) => <Svg {...p}><path d="M19 12H5" /><path d="m11 6-6 6 6 6" /></Svg>;
export const IconChevronRight = (p: P) => <Svg {...p}><path d="m9 5 7 7-7 7" /></Svg>;
export const IconChevronDown = (p: P) => <Svg {...p}><path d="m5 9 7 7 7-7" /></Svg>;
export const IconClose = (p: P) => <Svg {...p}><path d="M6 6l12 12M18 6 6 18" /></Svg>;
export const IconSearch = (p: P) => <Svg {...p}><circle cx="11" cy="11" r="6.5" /><path d="m20 20-4.2-4.2" /></Svg>;
export const IconHelp = (p: P) => (
  <Svg {...p}><circle cx="12" cy="12" r="9" /><path d="M9.6 9.4a2.5 2.5 0 0 1 4.8.9c0 1.7-2.4 2.2-2.4 3.7" /><path d="M12 17.2h.01" /></Svg>
);
export const IconDots = (p: P) => <Svg {...p}><circle cx="12" cy="5.5" r=".6" /><circle cx="12" cy="12" r=".6" /><circle cx="12" cy="18.5" r=".6" /></Svg>;
export const IconCheck = (p: P) => <Svg {...p}><path d="m5 12.5 4.5 4.5L19 7.5" /></Svg>;
export const IconCopy = (p: P) => <Svg {...p}><rect x="8.5" y="8.5" width="11" height="11" rx="2.5" /><path d="M15.5 8.5V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7.5a2 2 0 0 0 2 2h2.5" /></Svg>;
export const IconShare = (p: P) => (
  <Svg {...p}><circle cx="18" cy="5.5" r="2.5" /><circle cx="6" cy="12" r="2.5" /><circle cx="18" cy="18.5" r="2.5" /><path d="m8.2 10.8 7.6-4.1M8.2 13.2l7.6 4.1" /></Svg>
);
export const IconLock = (p: P) => <Svg {...p}><rect x="4.5" y="10.5" width="15" height="10" rx="2.5" /><path d="M8 10.5V7.8a4 4 0 0 1 8 0v2.7" /></Svg>;
export const IconShield = (p: P) => <Svg {...p}><path d="M12 3 5 6v5.5c0 4.3 3 7.9 7 9.5 4-1.6 7-5.2 7-9.5V6Z" /><path d="m9 12 2.2 2.2L15.5 10" /></Svg>;
export const IconSignal = (p: P) => <Svg {...p}><path d="M5 19v-3M9.5 19v-6M14 19v-9M18.5 19V5" /></Svg>;
export const IconHeart = (p: P) => (
  <Svg {...p}><path d="M12 20.5 4.6 13.3a4.6 4.6 0 0 1 0-6.5 4.6 4.6 0 0 1 6.5 0l.9.9.9-.9a4.6 4.6 0 0 1 6.5 0 4.6 4.6 0 0 1 0 6.5Z" /></Svg>
);
export const IconHeartFill = ({ size = 16, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false">
    <path fill="currentColor" d="M12 21 4.3 13.5a5 5 0 0 1 0-7.1 5 5 0 0 1 7.1 0l.6.6.6-.6a5 5 0 0 1 7.1 0 5 5 0 0 1 0 7.1Z" />
  </svg>
);
export const IconBolt = (p: P) => <Svg {...p}><path d="M13 3 5 13.5h6L10 21l8-10.5h-6Z" /></Svg>;
export const IconGift = (p: P) => (
  <Svg {...p}><rect x="3.5" y="8.5" width="17" height="4" rx="1" /><path d="M5 12.5v8h14v-8M12 8.5v12" /><path d="M12 8.5C10.5 5 7 4.5 7 6.8S10 8.5 12 8.5c2 0 5 .6 5-1.7S13.5 5 12 8.5Z" /></Svg>
);
export const IconEye = (p: P) => <Svg {...p}><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" /><circle cx="12" cy="12" r="2.8" /></Svg>;
export const IconBackspace = (p: P) => <Svg {...p}><path d="M8.5 5.5H20a1.5 1.5 0 0 1 1.5 1.5v10a1.5 1.5 0 0 1-1.5 1.5H8.5L2.5 12Z" /><path d="m11.5 9.5 5 5M16.5 9.5l-5 5" /></Svg>;
export const IconPhone = (p: P) => <Svg {...p}><rect x="6.5" y="2.5" width="11" height="19" rx="2.5" /><path d="M10.5 18.5h3" /></Svg>;
export const IconSparkle = (p: P) => <Svg {...p}><path d="M12 3.5c.6 4.2 2.3 5.9 6.5 6.5-4.2.6-5.9 2.3-6.5 6.5-.6-4.2-2.3-5.9-6.5-6.5 4.2-.6 5.9-2.3 6.5-6.5Z" /><path d="M19 16.5c.3 1.6.9 2.2 2.5 2.5-1.6.3-2.2.9-2.5 2.5-.3-1.6-.9-2.2-2.5-2.5 1.6-.3 2.2-.9 2.5-2.5Z" /></Svg>;
export const IconCard = (p: P) => <Svg {...p}><rect x="2.8" y="5.5" width="18.4" height="13" rx="2.2" /><path d="M2.8 9.8h18.4M6.2 14.6h4" /></Svg>;
export const IconBank = (p: P) => <Svg {...p}><path d="M3.5 9.5 12 4.5l8.5 5" /><path d="M5.5 10v7M9.8 10v7M14.2 10v7M18.5 10v7" /><path d="M3.5 19.5h17" /></Svg>;
export const IconWallet = (p: P) => <Svg {...p}><rect x="3.5" y="6.5" width="17" height="12" rx="2.5" /><path d="M3.5 10.5h17" /><circle cx="16.5" cy="14.5" r="1.2" /></Svg>;
export const IconHug = (p: P) => (
  <Svg {...p}><circle cx="8.5" cy="6.5" r="2.5" /><circle cx="15.5" cy="6.5" r="2.5" /><path d="M4 20v-4a4.5 4.5 0 0 1 9 0M11 20v-4a4.5 4.5 0 0 1 9 0" /><path d="M7 14.5c2 1.8 8 1.8 10 0" /></Svg>
);
export const IconCalendar = (p: P) => <Svg {...p}><rect x="3.5" y="5" width="17" height="15.5" rx="2.5" /><path d="M3.5 10h17M8 3v4M16 3v4" /></Svg>;
export const IconAlert = (p: P) => <Svg {...p}><path d="M12 4 2.8 19.5h18.4Z" /><path d="M12 10v4.2M12 17h.01" /></Svg>;
export const IconMenu = (p: P) => <Svg {...p}><path d="M4 7h16M4 12h16M4 17h16" /></Svg>;
export const IconBell = (p: P) => <Svg {...p}><path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 2h-15Z" /><path d="M10 20.5a2 2 0 0 0 4 0" /></Svg>;
export const IconTicket = (p: P) => <Svg {...p}><path d="M3.5 8.5V6.5h17v2a2.5 2.5 0 0 0 0 5v2h-17v-2a2.5 2.5 0 0 0 0-5Z" transform="translate(0 1)" /><path d="M14 7.5v10" strokeDasharray="1.5 2" /></Svg>;
export const IconCup = (p: P) => <Svg {...p}><path d="M5 8.5h11v5a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5Z" /><path d="M16 10h1.5a2.5 2.5 0 0 1 0 5H16M8 3.5c-.8 1 .8 2 0 3M12 3.5c-.8 1 .8 2 0 3" /></Svg>;
export const IconMoon = (p: P) => <Svg {...p}><path d="M19.5 14.5A7.5 7.5 0 0 1 9.5 4.5a7.5 7.5 0 1 0 10 10Z" /></Svg>;
export const IconTag = (p: P) => <Svg {...p}><path d="M3.5 12.3V4.5a1 1 0 0 1 1-1h7.8l8.2 8.2a1.4 1.4 0 0 1 0 2l-6.8 6.8a1.4 1.4 0 0 1-2 0Z" /><circle cx="8" cy="8" r="1.4" /></Svg>;
export const IconMail = (p: P) => <Svg {...p}><rect x="3" y="5.5" width="18" height="13" rx="2.5" /><path d="m3.5 7 8.5 6.5L20.5 7" /></Svg>;
export const IconRepeat = (p: P) => (
  <Svg {...p}><path d="M4 12a8 8 0 0 1 13.7-5.6L20 8.5" /><path d="M20 4v4.5h-4.5" /><path d="M20 12a8 8 0 0 1-13.7 5.6L4 15.5" /><path d="M4 20v-4.5h4.5" /></Svg>
);
export const IconUser = (p: P) => <Svg {...p}><circle cx="12" cy="8" r="4" /><path d="M4.5 20.5a7.5 7.5 0 0 1 15 0" /></Svg>;
