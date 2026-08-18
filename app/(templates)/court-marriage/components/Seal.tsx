"use client";

/**
 * The Registrar of Hearts seal — a wholly invented mark.
 *
 * Deliberately NOT any real emblem, coat of arms, or state device: the issuing
 * authority is the fictional "REPUBLIC OF US". Two line-art hearts in the
 * centre, two arcs of text, a double ring.
 *
 * The realism comes from four things, in order of importance:
 *   1. It sits HALF ON the photo and half on the paper (positioned by the caller).
 *   2. Semi-transparent ink, so the photo reads through it.
 *   3. Uneven ink density — heavier on one side, via a radial-gradient mask.
 *   4. Irregular edges — feTurbulence + feDisplacementMap at low strength.
 *
 * Every id is namespaced by `uid` because SVG ids are document-global and two
 * seals render on the same certificate.
 */
export default function Seal({
  uid,
  size = 78,
  rotate = -4,
  opacity = 0.72,
  color = "#3f4c8f",
  /** feTurbulence seed — different per impression so the two are not clones. */
  noiseSeed = 7,
  /** Direction of the heavy ink, in the seal's own 0..100 space. */
  inkCenter = { x: 34, y: 30 },
  className,
  style,
}: {
  uid: string;
  size?: number;
  rotate?: number;
  opacity?: number;
  color?: string;
  noiseSeed?: number;
  inkCenter?: { x: number; y: number };
  className?: string;
  style?: React.CSSProperties;
}) {
  const bleed = `cm-bleed-${uid}`;
  const inkGrad = `cm-ink-${uid}`;
  const inkMask = `cm-mask-${uid}`;
  const topArc = `cm-top-${uid}`;
  const botArc = `cm-bot-${uid}`;

  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      aria-hidden
      focusable="false"
      style={{
        transform: `rotate(${rotate}deg)`,
        opacity,
        // The impression is ink, not a sticker: it must not cast a shadow and
        // must let the photo underneath show through.
        mixBlendMode: "multiply",
        pointerEvents: "none",
        ...style,
      }}
    >
      <defs>
        {/* Ink bleed — nudges every edge by a fraction of a pixel so nothing is
            geometrically perfect. Kept low; more than this reads as a glitch. */}
        <filter id={bleed} x="-25%" y="-25%" width="150%" height="150%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={noiseSeed} result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="1.15" xChannelSelector="R" yChannelSelector="G" />
        </filter>

        {/* Uneven ink density — the stamp was pressed harder on one side. */}
        <radialGradient id={inkGrad} cx={`${inkCenter.x}%`} cy={`${inkCenter.y}%`} r="82%">
          <stop offset="0%" stopColor="#fff" stopOpacity="1" />
          <stop offset="45%" stopColor="#fff" stopOpacity="0.92" />
          <stop offset="78%" stopColor="#fff" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0.34" />
        </radialGradient>
        <mask id={inkMask} maskUnits="userSpaceOnUse" x="0" y="0" width="100" height="100">
          <rect x="0" y="0" width="100" height="100" fill={`url(#${inkGrad})`} />
        </mask>

        {/* Text baselines. Top arc runs left→right over the top; the bottom arc
            dips below so its text is right-way-up too. */}
        <path id={topArc} d="M 12,52 A 38,38 0 0 1 88,52" fill="none" />
        <path id={botArc} d="M 16,50 A 34,34 0 0 0 84,50" fill="none" />
      </defs>

      <g mask={`url(#${inkMask})`} filter={`url(#${bleed})`} fill="none" stroke={color}>
        {/* Double concentric ring */}
        <circle cx="50" cy="50" r="47" strokeWidth="2.4" />
        <circle cx="50" cy="50" r="41.5" strokeWidth="0.9" />
        <circle cx="50" cy="50" r="23.5" strokeWidth="0.7" />

        {/* Arced legend — invented authority, no real emblem or motto. */}
        <text
          fill={color}
          stroke="none"
          fontSize="7.4"
          letterSpacing="1.15"
          style={{ fontFamily: "var(--font-tinos), Times, serif", fontWeight: 700 }}
        >
          <textPath href={`#${topArc}`} startOffset="50%" textAnchor="middle">
            REGISTRAR OF HEARTS
          </textPath>
        </text>
        <text
          fill={color}
          stroke="none"
          fontSize="6.6"
          letterSpacing="1.4"
          style={{ fontFamily: "var(--font-tinos), Times, serif", fontWeight: 700 }}
        >
          <textPath href={`#${botArc}`} startOffset="50%" textAnchor="middle">
            REPUBLIC OF US
          </textPath>
        </text>

        {/* Separator stars at 9 and 3 o'clock, between the two legends */}
        <path d="M6.2,50 l2.2,-2.2 l2.2,2.2 l-2.2,2.2 z" fill={color} stroke="none" />
        <path d="M89.4,50 l2.2,-2.2 l2.2,2.2 l-2.2,2.2 z" fill={color} stroke="none" />

        {/* Centre device: two overlapping hearts, line-art, never filled */}
        <g strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M44,44 C40.5,40 34.5,41 34,46 C33.4,52 40,57 45.5,62 C51,57 57.6,52 57,46 C56.5,41 50.5,40 47,44 C46,45.1 45,45.1 44,44 Z" />
          <path d="M55,40 C51.5,36 45.5,37 45,42 C44.4,48 51,53 56.5,58 C62,53 68.6,48 68,42 C67.5,37 61.5,36 58,40 C57,41.1 56,41.1 55,40 Z" />
        </g>

        {/* Tiny impression date band under the hearts — clerks always add one. */}
        <text
          fill={color}
          stroke="none"
          fontSize="4.6"
          letterSpacing="0.6"
          textAnchor="middle"
          x="50"
          y="70.5"
          style={{ fontFamily: "var(--font-courier-prime), monospace" }}
        >
          REGD.
        </text>
      </g>
    </svg>
  );
}
