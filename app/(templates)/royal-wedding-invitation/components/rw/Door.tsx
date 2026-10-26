import { useId } from "react";

// ─── One leaf of the palace doors, drawn in SVG (replaces the jaali picture) ─
// Ivory wood framed in gold: a pointed-arch window of pierced jaali (an
// eight-point star lattice in gold over a warm, translucent cream, so the
// light behind the doors glows through it), a carved panel with a gold
// rosette, a lower panel with a lotus, rows of brass studs on the stiles, and
// a brass ring handle at the meeting edge. The right leaf is the left one
// mirrored. Drawn on a 360 × 880 box (each leaf's aspect on the gateway) and
// stretched to fit (preserveAspectRatio none), so it always fills its slot.

const W = 360;
const H = 880;

export default function Door({ side }: { side: "l" | "r" }) {
  // Unique per instance (the opening and the finale both draw the doors).
  const id = `rw-door-${side}-${useId().replace(/:/g, "")}`;
  // The meeting edge (where the handle and the gold astragal sit) faces the centre.
  const meet = side === "l" ? W - 14 : 14;
  const ringX = side === "l" ? W - 44 : 44;
  return (
    <svg className="rw-door" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden>
      <defs>
        <linearGradient id={`${id}-wood`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFF9EC" />
          <stop offset=".5" stopColor="#F6E8CC" />
          <stop offset="1" stopColor="#EAD3A8" />
        </linearGradient>
        <linearGradient id={`${id}-gold`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#F3DDA8" />
          <stop offset=".35" stopColor="#C9974F" />
          <stop offset=".6" stopColor="#F6E2A6" />
          <stop offset="1" stopColor="#A9743F" />
        </linearGradient>
        <radialGradient id={`${id}-glow`} cx=".5" cy=".55" r=".7">
          <stop offset="0" stopColor="#FFF4D6" stopOpacity=".95" />
          <stop offset="1" stopColor="#F2D49A" stopOpacity=".75" />
        </radialGradient>
        {/* Jaali: interlocking eight-point stars, gold on warm cream. */}
        <pattern id={`${id}-jaali`} width="40" height="40" patternUnits="userSpaceOnUse">
          <rect width="40" height="40" fill={`url(#${id}-glow)`} />
          <g fill="none" stroke="#B88A35" strokeWidth="2.4" strokeLinejoin="round">
            <path d="M20 4 L24 16 L36 20 L24 24 L20 36 L16 24 L4 20 L16 16 Z" />
            <rect x="11" y="11" width="18" height="18" transform="rotate(45 20 20)" />
            <path d="M0 0 L6 6 M40 0 L34 6 M0 40 L6 34 M40 40 L34 34" />
          </g>
          <circle cx="20" cy="20" r="2.6" fill="#D4A24C" />
        </pattern>
        <clipPath id={`${id}-arch`}>
          <path d="M52 380 V196 C52 132 112 92 180 64 C248 92 308 132 308 196 V380 Z" />
        </clipPath>
      </defs>

      {/* The leaf and its gold frame. */}
      <rect x="0" y="0" width={W} height={H} fill={`url(#${id}-wood)`} />
      <rect x="5" y="5" width={W - 10} height={H - 10} fill="none" stroke={`url(#${id}-gold)`} strokeWidth="10" />
      <rect x="22" y="22" width={W - 44} height={H - 44} fill="none" stroke="#C9A063" strokeOpacity=".6" strokeWidth="2" />

      {/* The pointed-arch jaali window. */}
      <path d="M44 388 V194 C44 124 108 82 180 52 C252 82 316 124 316 194 V388 Z" fill={`url(#${id}-gold)`} />
      <g clipPath={`url(#${id}-arch)`}>
        <rect x="40" y="40" width="280" height="360" fill={`url(#${id}-jaali)`} />
      </g>
      <path d="M52 380 V196 C52 132 112 92 180 64 C248 92 308 132 308 196 V380 Z" fill="none" stroke="#8E6A2A" strokeOpacity=".5" strokeWidth="2" />
      {/* a small gold finial on the arch's point */}
      <circle cx="180" cy="40" r="8" fill={`url(#${id}-gold)`} />

      {/* The carved middle panel with a rosette. */}
      <rect x="52" y="420" width="256" height="190" rx="8" fill="#FBF3E2" stroke={`url(#${id}-gold)`} strokeWidth="6" />
      <rect x="66" y="434" width="228" height="162" rx="4" fill="none" stroke="#C9A063" strokeOpacity=".7" strokeWidth="2" />
      <g transform="translate(180 515)">
        {[0, 45, 90, 135, 180, 225, 270, 315].map((r) => (
          <ellipse key={r} rx="10" ry="34" fill="#8E2A3C" fillOpacity=".85" transform={`rotate(${r}) translate(0 -26)`} />
        ))}
        <circle r="20" fill={`url(#${id}-gold)`} />
        <circle r="8" fill="#FFF3D2" />
      </g>

      {/* The lower panel with a lotus. */}
      <rect x="52" y="640" width="256" height="190" rx="8" fill="#FBF3E2" stroke={`url(#${id}-gold)`} strokeWidth="6" />
      <rect x="66" y="654" width="228" height="162" rx="4" fill="none" stroke="#C9A063" strokeOpacity=".7" strokeWidth="2" />
      <g transform="translate(180 770)" fill="none" stroke="#B88A35" strokeWidth="3" strokeLinejoin="round">
        <path d="M0 0 C-14 -30 -12 -60 0 -82 C12 -60 14 -30 0 0 Z" fill="#F6E2A6" />
        <path d="M0 0 C-30 -18 -44 -46 -40 -70 C-20 -58 -6 -32 0 0 Z" fill="#F3DDA8" />
        <path d="M0 0 C30 -18 44 -46 40 -70 C20 -58 6 -32 0 0 Z" fill="#F3DDA8" />
        <path d="M-60 6 H60" />
      </g>

      {/* Brass studs down both stiles. */}
      {Array.from({ length: 12 }, (_, i) => 70 + i * 66).map((y) => (
        <g key={y} fill={`url(#${id}-gold)`}>
          <circle cx="30" cy={y} r="5" />
          <circle cx={W - 30} cy={y} r="5" />
        </g>
      ))}

      {/* The meeting edge: a gold astragal and a brass ring handle. */}
      <rect x={meet - 6} y="0" width="12" height={H} fill={`url(#${id}-gold)`} />
      <circle cx={ringX} cy="470" r="12" fill={`url(#${id}-gold)`} />
      <circle cx={ringX} cy="500" r="18" fill="none" stroke={`url(#${id}-gold)`} strokeWidth="6" />
    </svg>
  );
}
