// Hand-drawn 24px icons in the streaming app's filled, geometric style.
// No third-party marks — every path here is ours.

import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement> & { size?: number };

const S = ({ size = 24, children, ...rest }: P & { children: React.ReactNode }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden focusable="false" {...rest}>
    {children}
  </svg>
);

export const IcPlay = (p: P) => (
  <S {...p}>
    <path d="M6 3.9v16.2c0 .8.9 1.3 1.6.9l13-8.1a1 1 0 0 0 0-1.8l-13-8.1C6.9 2.6 6 3.1 6 3.9Z" />
  </S>
);
export const IcPause = (p: P) => (
  <S {...p}>
    <rect x="5" y="3" width="4.5" height="18" rx="1" />
    <rect x="14.5" y="3" width="4.5" height="18" rx="1" />
  </S>
);
export const IcInfo = (p: P) => (
  <S {...p}>
    <path fillRule="evenodd" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 2a8 8 0 1 1 0 16 8 8 0 0 1 0-16Zm-1 6.5V17h2v-6.5h-2ZM12 6.6a1.3 1.3 0 1 0 0 2.6 1.3 1.3 0 0 0 0-2.6Z" />
  </S>
);
export const IcPlus = (p: P) => (
  <S {...p}>
    <path d="M11 3h2v8h8v2h-8v8h-2v-8H3v-2h8V3Z" />
  </S>
);
export const IcCheck = (p: P) => (
  <S {...p}>
    <path d="m8.7 17.3-5.1-5.1 1.4-1.4 3.7 3.7 10-10 1.4 1.4L8.7 17.3Z" />
  </S>
);
export const IcThumb = (p: P) => (
  <S {...p}>
    <path d="M10.7 2.3c.5-.4 1.3-.4 1.8.1.9.9 1.2 2.2.9 3.4L12.8 8H19a2 2 0 0 1 2 2.2l-.8 7.6A3 3 0 0 1 17.3 20.5H9V9.4l1.7-7.1ZM3 9.5h4v11H3v-11Z" />
  </S>
);
export const IcHeart = (p: P) => (
  <S {...p}>
    <path d="M12 21s-7.5-4.6-9.5-9.3C1.1 8.4 3 4.5 6.7 4.5c2.1 0 3.6 1.2 4.3 2.4h2c.7-1.2 2.2-2.4 4.3-2.4 3.7 0 5.6 3.9 4.2 7.2C19.5 16.4 12 21 12 21Z" />
  </S>
);
export const IcChevronDown = (p: P) => (
  <S {...p}>
    <path d="m12 16.4-7.7-7.7 1.4-1.4 6.3 6.3 6.3-6.3 1.4 1.4-7.7 7.7Z" />
  </S>
);
export const IcChevronRight = (p: P) => (
  <S {...p}>
    <path d="M8.3 19.7 6.9 18.3l6.3-6.3-6.3-6.3 1.4-1.4 7.7 7.7-7.7 7.7Z" />
  </S>
);
export const IcChevronLeft = (p: P) => (
  <S {...p}>
    <path d="m15.7 19.7-7.7-7.7 7.7-7.7 1.4 1.4-6.3 6.3 6.3 6.3-1.4 1.4Z" />
  </S>
);
export const IcSearch = (p: P) => (
  <S {...p}>
    <path fillRule="evenodd" d="M10.5 3a7.5 7.5 0 1 0 4.6 13.4l4.8 4.8 1.4-1.4-4.8-4.8A7.5 7.5 0 0 0 10.5 3Zm-5.5 7.5a5.5 5.5 0 1 1 11 0 5.5 5.5 0 0 1-11 0Z" />
  </S>
);
export const IcBell = (p: P) => (
  <S {...p}>
    <path d="M12 2.5a6.5 6.5 0 0 0-6.5 6.5v4.3L3.6 16.8a.8.8 0 0 0 .7 1.2h15.4a.8.8 0 0 0 .7-1.2l-1.9-3.5V9A6.5 6.5 0 0 0 12 2.5ZM9.2 19.5a2.9 2.9 0 0 0 5.6 0H9.2Z" />
  </S>
);
export const IcBack = (p: P) => (
  <S {...p}>
    <path d="M9.4 5.3 10.8 6.7 6.5 11H21v2H6.5l4.3 4.3-1.4 1.4L2.7 12l6.7-6.7Z" />
  </S>
);
export const IcClose = (p: P) => (
  <S {...p}>
    <path d="M5.6 4.2 12 10.6l6.4-6.4 1.4 1.4-6.4 6.4 6.4 6.4-1.4 1.4-6.4-6.4-6.4 6.4-1.4-1.4 6.4-6.4-6.4-6.4 1.4-1.4Z" />
  </S>
);
export const IcRewind = (p: P) => (
  <S {...p}>
    <path d="M11.9 2.9 8 5.8l3.9 3V6.9a6.1 6.1 0 1 1-6 6.1H4a8 8 0 1 0 7.9-8.1v-2Z" />
    <text x="12" y="16.6" fontSize="6.4" fontWeight="800" textAnchor="middle" fontFamily="Arial, sans-serif">10</text>
  </S>
);
export const IcForward = (p: P) => (
  <S {...p}>
    <path d="m12.1 2.9 3.9 2.9-3.9 3V6.9a6.1 6.1 0 1 0 6 6.1H20a8 8 0 1 1-7.9-8.1v-2Z" />
    <text x="12" y="16.6" fontSize="6.4" fontWeight="800" textAnchor="middle" fontFamily="Arial, sans-serif">10</text>
  </S>
);
export const IcVolume = (p: P) => (
  <S {...p}>
    <path d="M11 4.5v15l-5-4H2.5v-7H6l5-4Zm4.4 2.4a7 7 0 0 1 0 10.2l-1.4-1.4a5 5 0 0 0 0-7.4l1.4-1.4Zm2.8-2.8a11 11 0 0 1 0 15.8l-1.4-1.4a9 9 0 0 0 0-13l1.4-1.4Z" />
  </S>
);
export const IcMute = (p: P) => (
  <S {...p}>
    <path d="M11 4.5v15l-5-4H2.5v-7H6l5-4Zm5.6 3.6 2.4 2.5 2.5-2.5 1.4 1.4-2.5 2.5 2.5 2.5-1.4 1.4-2.5-2.5-2.4 2.5-1.5-1.4 2.5-2.5-2.5-2.5 1.5-1.4Z" />
  </S>
);
export const IcReplay = (p: P) => (
  <S {...p}>
    <path d="M12 4a8 8 0 1 1-7.7 10.1l1.9-.5A6 6 0 1 0 7.8 7.8L10 10H4V4l2.4 2.4A8 8 0 0 1 12 4Z" />
  </S>
);
export const IcFullscreen = (p: P) => (
  <S {...p}>
    <path d="M3 3h7v2H5v5H3V3Zm11 0h7v7h-2V5h-5V3ZM3 14h2v5h5v2H3v-7Zm16 0h2v7h-7v-2h5v-5Z" />
  </S>
);
export const IcEpisodes = (p: P) => (
  <S {...p}>
    <path d="M8 4h13v2H8V4Zm-5 4h13v12H3V8Zm15 2h3v2h-3v-2Zm0 4h3v2h-3v-2Z" />
  </S>
);
export const IcSubtitles = (p: P) => (
  <S {...p}>
    <path fillRule="evenodd" d="M2 5h20v14H2V5Zm2 2v10h16V7H4Zm2 5h3v2H6v-2Zm5 0h7v2h-7v-2Zm-5-3h9v2H6V9Zm11 0h1v2h-1V9Z" />
  </S>
);
export const IcSpeed = (p: P) => (
  <S {...p}>
    <path d="M12 4a10 10 0 0 0-8.7 15H5.7a8 8 0 1 1 12.6 0h2.4A10 10 0 0 0 12 4Zm4.9 4.7-5.6 4.6a1.5 1.5 0 1 0 2.1 2.1l3.5-6.7Z" />
  </S>
);
export const IcNext = (p: P) => (
  <S {...p}>
    <path d="M4 4.5v15l11-7.5L4 4.5ZM17 4h3v16h-3V4Z" />
  </S>
);
export const IcFlag = (p: P) => (
  <S {...p}>
    <path d="M5 2h2v1h12l-2.5 5 2.5 5H7v9H5V2Z" />
  </S>
);
export const IcDownload = (p: P) => (
  <S {...p}>
    <path d="M11 3h2v10.2l3.3-3.3 1.4 1.4L12 17l-5.7-5.7 1.4-1.4 3.3 3.3V3ZM4 19h16v2H4v-2Z" />
  </S>
);
export const IcCast = (p: P) => (
  <S {...p}>
    <path d="M2 4h20v16h-7v-2h5V6H4v3H2V4Zm0 7a9 9 0 0 1 9 9H9a7 7 0 0 0-7-7v-2Zm0 4a5 5 0 0 1 5 5H5a3 3 0 0 0-3-3v-2Zm0 4a1 1 0 0 1 1 1H2v-1Z" />
  </S>
);
export const IcHome = (p: P) => (
  <S {...p}>
    <path d="M12 2.8 2.5 10v11.5h7v-6.5h5v6.5h7V10L12 2.8Z" />
  </S>
);
export const IcNewHot = (p: P) => (
  <S {...p}>
    <path fillRule="evenodd" d="M4 6h16v14H4V6Zm6 3.5v7l5.5-3.5L10 9.5ZM6 2h12v2H6V2Z" />
  </S>
);
export const IcMenu = (p: P) => (
  <S {...p}>
    <path d="M3 5h18v2H3V5Zm0 6h18v2H3v-2Zm0 6h18v2H3v-2Z" />
  </S>
);
export const IcLock = (p: P) => (
  <S {...p}>
    <path fillRule="evenodd" d="M7 9V7a5 5 0 0 1 10 0v2h2v13H5V9h2Zm2 0h6V7a3 3 0 0 0-6 0v2Zm3 4a1.5 1.5 0 0 0-1 2.6V18h2v-2.4A1.5 1.5 0 0 0 12 13Z" />
  </S>
);
export const IcPencil = (p: P) => (
  <S {...p}>
    <path d="m15.2 3.8 5 5L8.7 20.3H3.7v-5L15.2 3.8Zm0 2.8L5.7 16.1v2.2h2.2l9.5-9.5-2.2-2.2Z" />
  </S>
);
export const IcShare = (p: P) => (
  <S {...p}>
    <path d="M13 3.6 20.4 11 13 18.4V14c-4 0-6.9 1.2-9 4.2.6-4.7 3.2-8.6 9-9.4V3.6Z" />
  </S>
);
