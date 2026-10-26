// ─── The palace gateway, drawn in SVG (replaces the gateway-frame picture) ───
// A Mughal pishtaq in ivory sandstone: a central dome on a drum with arched
// windows and a gold kalash finial, a chhatri on each corner, a scalloped
// parapet, a pietra-dura band of maroon flowers inlaid in gold, a pointed
// (ogee) arch in a double gold line over a cream tympanum with gold arabesques
// in the spandrels, fluted pilasters with gold capitals, and three marble
// steps. Drawn on the old picture's 1246 × 1800 grid so the aperture (the
// jaali doors), the medallion, the toran and the elephants (assets.GATE) still
// land exactly where they did. The doorway itself is a hole in the façade.

const W = 1246;
const H = 1800;
// The doorway (GATE.aperture in px): the jaali screens sit behind this hole.
const AX = 256.5;
const AY = 704;
const AR = 989.5;
const AB = 1580;

/** The scalloped parapet: a row of small arched merlons along the roof line. */
function merlons(x0: number, x1: number, y: number, w = 34, h = 26) {
  let d = `M${x0} ${y}`;
  for (let x = x0; x + w <= x1 + 0.5; x += w) d += ` v-${h * 0.45} a${w / 2} ${h * 0.55} 0 0 1 ${w} 0 v${h * 0.45}`;
  return `${d} Z`;
}

function Chhatri({ cx, base }: { cx: number; base: number }) {
  return (
    <g>
      <rect x={cx - 52} y={base - 8} width={104} height={14} rx={3} fill="url(#pl-gold)" />
      <rect x={cx - 44} y={base + 6} width={14} height={86} fill="url(#pl-stone)" stroke="#D9BE8A" strokeWidth={2} />
      <rect x={cx + 30} y={base + 6} width={14} height={86} fill="url(#pl-stone)" stroke="#D9BE8A" strokeWidth={2} />
      <path d={`M${cx - 30} ${base + 92} V${base + 40} a30 34 0 0 1 60 0 V${base + 92}`} fill="#F3E3C3" opacity={0.7} />
      <path d={`M${cx - 58} ${base - 8} C${cx - 58} ${base - 70} ${cx - 20} ${base - 96} ${cx} ${base - 104} C${cx + 20} ${base - 96} ${cx + 58} ${base - 70} ${cx + 58} ${base - 8} Z`} fill="url(#pl-dome)" stroke="#C9A063" strokeWidth={3} />
      <line x1={cx} y1={base - 104} x2={cx} y2={base - 146} stroke="url(#pl-gold)" strokeWidth={5} strokeLinecap="round" />
      <circle cx={cx} cy={base - 122} r={7} fill="url(#pl-gold)" />
    </g>
  );
}

export default function Palace({ className }: { className?: string }) {
  const body = `M120 418 H1126 V${AB} H120 Z M${AX} ${AY} V${AB} H${AR} V${AY} Z`;
  const band = `M146 448 H1100 V${AB} H146 Z M206 508 V${AB} H1040 V508 Z`;
  // The pointed (ogee) arch over the doorway; the medallion sits in its tympanum.
  const arch = `M${AX} ${AY} V646 C${AX} 572 404 536 520 492 C574 470 604 452 623 424 C642 452 672 470 726 492 C842 536 ${AR} 572 ${AR} 646 V${AY} Z`;
  const archInner = `M${AX + 20} ${AY} V650 C${AX + 20} 588 414 556 526 514 C576 494 604 478 623 454 C642 478 670 494 720 514 C832 556 ${AR - 20} 588 ${AR - 20} 650 V${AY}`;
  return (
    <svg className={className} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden>
      <defs>
        <linearGradient id="pl-stone" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FCF4E4" />
          <stop offset=".55" stopColor="#F5E7CC" />
          <stop offset="1" stopColor="#EAD5AE" />
        </linearGradient>
        <linearGradient id="pl-side" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#E8D2A8" />
          <stop offset=".12" stopColor="#F7EBD3" stopOpacity="0" />
          <stop offset=".88" stopColor="#F7EBD3" stopOpacity="0" />
          <stop offset="1" stopColor="#E8D2A8" />
        </linearGradient>
        <linearGradient id="pl-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#F3DDA8" />
          <stop offset=".35" stopColor="#C9974F" />
          <stop offset=".6" stopColor="#F6E2A6" />
          <stop offset="1" stopColor="#A9743F" />
        </linearGradient>
        <radialGradient id="pl-dome" cx=".38" cy=".3" r=".8">
          <stop offset="0" stopColor="#FFFDF7" />
          <stop offset=".6" stopColor="#F6E8CE" />
          <stop offset="1" stopColor="#E3CBA0" />
        </radialGradient>
        <linearGradient id="pl-tymp" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFFAF0" />
          <stop offset="1" stopColor="#F8EBD3" />
        </linearGradient>
        {/* Pietra-dura: a maroon eight-petal flower with a gold heart, inlaid every 46px. */}
        <pattern id="pl-pd" x="146" y="448" width="60" height="60" patternUnits="userSpaceOnUse">
          <rect width="60" height="60" fill="#FBF3E2" />
          <g transform="translate(30 30)">
            {[0, 45, 90, 135].map((r) => (
              <ellipse key={r} rx="6.5" ry="17" fill="#8E2A3C" opacity=".9" transform={`rotate(${r})`} />
            ))}
            <circle r="7" fill="#D4A24C" />
            <circle r="3" fill="#FFF3D2" />
          </g>
          {[0, 60].map((x) => [0, 60].map((y) => <circle key={`${x}-${y}`} cx={x} cy={y} r="4" fill="#C9974F" />))}
        </pattern>
        <filter id="pl-soft" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="14" stdDeviation="16" floodColor="#7A4A20" floodOpacity=".18" />
        </filter>
      </defs>

      <g filter="url(#pl-soft)">
        {/* The central dome on its drum, with a gold kalash. */}
        <rect x="452" y="296" width="342" height="124" fill="url(#pl-stone)" stroke="#D9BE8A" strokeWidth="2" />
        {[488, 556, 624, 692].map((x) => (
          <path key={x} d={`M${x} 404 V352 a26 30 0 0 1 52 0 V404 Z`} fill="#F1DEB9" stroke="#C9A063" strokeWidth="2" />
        ))}
        <rect x="440" y="284" width="366" height="16" rx="4" fill="url(#pl-gold)" />
        <path d="M466 286 C466 166 560 112 623 96 C686 112 780 166 780 286 Z" fill="url(#pl-dome)" stroke="#C9A063" strokeWidth="3" />
        {/* gold ribs on the dome */}
        {["M520 286 C524 200 576 128 623 98", "M726 286 C722 200 670 128 623 98", "M572 286 C576 190 602 126 623 98", "M674 286 C670 190 644 126 623 98"].map((d) => (
          <path key={d} d={d} fill="none" stroke="#D4A24C" strokeOpacity=".75" strokeWidth="3" />
        ))}
        <path d="M498 270 C506 196 560 140 610 112" fill="none" stroke="#FFFFFF" strokeOpacity=".7" strokeWidth="6" strokeLinecap="round" />
        <path d="M466 286 H780" stroke="url(#pl-gold)" strokeWidth="8" />
        <line x1="623" y1="96" x2="623" y2="22" stroke="url(#pl-gold)" strokeWidth="7" strokeLinecap="round" />
        <circle cx="623" cy="70" r="11" fill="url(#pl-gold)" />
        <circle cx="623" cy="40" r="7" fill="url(#pl-gold)" />

        {/* The corner chhatris. */}
        <Chhatri cx={196} base={330} />
        <Chhatri cx={1050} base={330} />

        {/* The façade, with the doorway cut out of it. */}
        <path d={body} fillRule="evenodd" fill="url(#pl-stone)" />
        <path d={body} fillRule="evenodd" fill="url(#pl-side)" />
        {/* Roof cornice and the scalloped parapet. */}
        <path d={merlons(122, 1124, 418)} fill="url(#pl-stone)" stroke="#D9BE8A" strokeWidth="2" />
        <rect x="108" y="410" width="1030" height="18" rx="4" fill="url(#pl-gold)" />

        {/* The pietra-dura band, edged in gold. */}
        <path d={band} fillRule="evenodd" fill="url(#pl-pd)" />
        <path d="M146 1580 V448 H1100 V1580" fill="none" stroke="url(#pl-gold)" strokeWidth="7" />
        <path d="M206 1580 V508 H1040 V1580" fill="none" stroke="url(#pl-gold)" strokeWidth="6" />

        {/* Spandrel arabesques either side of the arch. */}
        {[1, -1].map((s) => (
          <g key={s} transform={s === 1 ? undefined : `translate(${W} 0) scale(-1 1)`} fill="none" stroke="#C9A063" strokeWidth="3" strokeLinecap="round">
            <path d="M232 690 C262 610 334 566 414 552 C364 588 340 624 344 664" />
            <path d="M262 560 C300 540 340 532 380 532" opacity=".7" />
            <circle cx="300" cy="610" r="12" fill="#8E2A3C" stroke="#C9A063" />
            <path d="M300 590 v-14 M300 630 v14 M280 610 h-14 M320 610 h14" strokeWidth="2.4" />
          </g>
        ))}

        {/* The arch: cream tympanum, double gold line. */}
        <path d={arch} fill="url(#pl-tymp)" />
        <path d={arch} fill="none" stroke="url(#pl-gold)" strokeWidth="8" strokeLinejoin="round" />
        <path d={archInner} fill="none" stroke="#B4566E" strokeOpacity=".55" strokeWidth="2.5" />

        {/* Fluted pilasters with gold capitals and bases beside the doorway. */}
        {[AX - 46, AR].map((x) => (
          <g key={x}>
            <rect x={x} y={AY} width="46" height={AB - AY} fill="url(#pl-stone)" stroke="#D9BE8A" strokeWidth="2" />
            {[10, 23, 36].map((f) => (
              <line key={f} x1={x + f} y1={AY + 30} x2={x + f} y2={AB - 30} stroke="#DCC394" strokeWidth="3" />
            ))}
            <rect x={x - 8} y={AY - 18} width="62" height="26" rx="4" fill="url(#pl-gold)" />
            <rect x={x - 8} y={AB - 26} width="62" height="26" rx="4" fill="url(#pl-gold)" />
          </g>
        ))}
        {/* A fine gold line framing the doorway itself. */}
        <rect x={AX} y={AY} width={AR - AX} height={AB - AY} fill="none" stroke="url(#pl-gold)" strokeWidth="6" />

        {/* Three marble steps. */}
        <path d="M196 1580 H1050 L1072 1640 H174 Z" fill="#FBF5EA" stroke="#D9BE8A" strokeWidth="2" />
        <path d="M174 1640 H1072 L1096 1704 H150 Z" fill="#F6ECDB" stroke="#D9BE8A" strokeWidth="2" />
        <path d="M150 1704 H1096 L1122 1772 H124 Z" fill="#F1E3CA" stroke="#D9BE8A" strokeWidth="2" />
        <line x1="196" y1="1582" x2="1050" y2="1582" stroke="url(#pl-gold)" strokeWidth="4" />
      </g>
    </svg>
  );
}
