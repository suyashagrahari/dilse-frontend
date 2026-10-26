import { useId } from "react";

// ─── A gold jhoomar (palace chandelier), drawn in SVG ────────────────────────
// It hangs on a gold chain from the top of the screen: a canopy and an urn
// stem, a small upper ring of crystal drops, four curled arms carrying lit
// diyas, a wide lower ring beaded with pearls with a fringe of crystal drops
// (longest at the centre), and a long pendant crystal at the foot, all over a
// soft warm glow. The only chandelier picture in the asset pack is a 200px
// thumbnail, so it is drawn instead and stays sharp at any size.
// Drawn on a 320 × 400 box; the chain starts at the box's top edge.

const CX = 160;

/** A crystal teardrop hanging from (x, y), `s` tall-ish. */
const drop = (x: number, y: number, s: number) =>
  `M${x} ${y} C${x + s * 0.55} ${y + s * 0.9} ${x + s * 0.5} ${y + s * 1.55} ${x} ${y + s * 1.75} C${x - s * 0.5} ${y + s * 1.55} ${x - s * 0.55} ${y + s * 0.9} ${x} ${y} Z`;

/** Points along the front half of an ellipse, left to right. */
const front = (cy: number, rx: number, ry: number, n: number) =>
  Array.from({ length: n }, (_, i) => {
    const t = Math.PI - (Math.PI * (i + 0.5)) / n;
    return { x: CX + rx * Math.cos(t), y: cy + ry * Math.sin(t), k: i / (n - 1) };
  });

export default function Jhoomar({ className }: { className?: string }) {
  const uid = useId().replace(/:/g, "");
  const u = (n: string) => `jh-${n}-${uid}`;
  const upper = front(170, 66, 11, 9);
  const lower = front(244, 122, 22, 15);
  const arms = [
    { x: 46, y: 206 },
    { x: 100, y: 196 },
    { x: 220, y: 196 },
    { x: 274, y: 206 },
  ];
  return (
    <svg className={className} viewBox="0 0 320 400" aria-hidden>
      <defs>
        <linearGradient id={u("gold")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#F6E2A6" />
          <stop offset=".4" stopColor="#C9974F" />
          <stop offset=".65" stopColor="#F3DDA8" />
          <stop offset="1" stopColor="#A9743F" />
        </linearGradient>
        <linearGradient id={u("crystal")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset=".4" stopColor="#FBE9C8" />
          <stop offset="1" stopColor="#D9A964" />
        </linearGradient>
        <radialGradient id={u("glow")} cx=".5" cy=".5" r=".5">
          <stop offset="0" stopColor="#FFDC94" stopOpacity=".9" />
          <stop offset="1" stopColor="#FFE7B0" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={u("flame")} cx=".5" cy=".7" r=".6">
          <stop offset="0" stopColor="#FFF6C8" />
          <stop offset=".55" stopColor="#FFC24A" />
          <stop offset="1" stopColor="#F07A1E" />
        </radialGradient>
      </defs>

      {/* the warm light it throws */}
      <ellipse cx={CX} cy="230" rx="160" ry="120" fill={`url(#${u("glow")})`} />

      {/* the chain */}
      <line x1={CX} y1="0" x2={CX} y2="74" stroke="#B88A35" strokeWidth="2" />
      {Array.from({ length: 7 }, (_, i) => (
        <ellipse key={i} cx={CX} cy={6 + i * 10} rx={i % 2 ? 2.4 : 4} ry="5.5" fill="none" stroke={`url(#${u("gold")})`} strokeWidth="2.4" />
      ))}

      {/* canopy and stem */}
      <path d={`M${CX - 26} 92 C${CX - 22} 76 ${CX - 10} 70 ${CX} 70 C${CX + 10} 70 ${CX + 22} 76 ${CX + 26} 92 Z`} fill={`url(#${u("gold")})`} />
      <rect x={CX - 30} y="90" width="60" height="6" rx="3" fill="#A9743F" />
      {front(96, 28, 4, 7).map((p, i) => (
        <path key={i} d={drop(p.x, p.y + 2, 6)} fill={`url(#${u("crystal")})`} stroke="#A9743F" strokeWidth="1" />
      ))}
      <circle cx={CX} cy="116" r="9" fill={`url(#${u("gold")})`} />
      <path d={`M${CX - 6} 124 H${CX + 6} L${CX + 4} 136 H${CX - 4} Z`} fill="#B88A35" />
      <path d={`M${CX - 20} 158 C${CX - 26} 140 ${CX - 12} 134 ${CX} 134 C${CX + 12} 134 ${CX + 26} 140 ${CX + 20} 158 Z`} fill={`url(#${u("gold")})`} />

      {/* upper ring: back half, then its crystal fringe, then the front */}
      <path d={`M${CX - 66} 170 A66 11 0 0 1 ${CX + 66} 170`} fill="none" stroke="#C9A063" strokeOpacity=".55" strokeWidth="2.5" />
      <rect x={CX - 5} y="156" width="10" height="96" fill={`url(#${u("gold")})`} />
      {upper.map((p, i) => (
        <g key={i}>
          <line x1={p.x} y1={p.y} x2={p.x} y2={p.y + 10} stroke="#B88A35" strokeWidth="1.3" />
          <path d={drop(p.x, p.y + 9, 8)} fill={`url(#${u("crystal")})`} stroke="#A9743F" strokeWidth="1.1" />
        </g>
      ))}
      <path d={`M${CX - 66} 170 A66 11 0 0 0 ${CX + 66} 170`} fill="none" stroke={`url(#${u("gold")})`} strokeWidth="5" />

      {/* the arms with their diyas */}
      {arms.map((a, i) => {
        const s = a.x < CX ? -1 : 1;
        return (
          <g key={i}>
            <path d={`M${CX} 214 C${CX + s * 30} 236 ${a.x - s * 6} 240 ${a.x} ${a.y + 10}`} fill="none" stroke={`url(#${u("gold")})`} strokeWidth="5" strokeLinecap="round" />
            <circle cx={a.x - s * 2} cy={a.y + 18} r="3" fill="#C9974F" />
            <path d={`M${a.x - 12} ${a.y} H${a.x + 12} C${a.x + 10} ${a.y + 10} ${a.x - 10} ${a.y + 10} ${a.x - 12} ${a.y} Z`} fill={`url(#${u("gold")})`} />
            <g className="rw-jh-flame" style={{ animationDelay: `${-i * 0.37}s` }}>
              <circle cx={a.x} cy={a.y - 8} r="12" fill="#FFD27A" opacity=".35" />
              <path d={`M${a.x} ${a.y - 18} C${a.x + 6} ${a.y - 9} ${a.x + 5} ${a.y - 1} ${a.x} ${a.y} C${a.x - 5} ${a.y - 1} ${a.x - 6} ${a.y - 9} ${a.x} ${a.y - 18} Z`} fill={`url(#${u("flame")})`} />
            </g>
          </g>
        );
      })}

      {/* lower ring: back half, crystal fringe (longest at the centre), pearls on the front */}
      <path d={`M${CX - 122} 244 A122 22 0 0 1 ${CX + 122} 244`} fill="none" stroke="#C9A063" strokeOpacity=".5" strokeWidth="3" />
      {lower.map((p, i) => {
        const len = 12 + Math.round(Math.sin(p.k * Math.PI) * 34);
        return (
          <g key={i}>
            <line x1={p.x} y1={p.y} x2={p.x} y2={p.y + len} stroke="#B88A35" strokeWidth="1.3" />
            {len > 24 && <circle cx={p.x} cy={p.y + len * 0.5} r="2.4" fill="#FFF7E6" stroke="#C9A063" strokeWidth=".7" />}
            <path d={drop(p.x, p.y + len - 1, i % 2 ? 9 : 11)} fill={`url(#${u("crystal")})`} stroke="#A9743F" strokeWidth="1.1" />
          </g>
        );
      })}
      <path d={`M${CX - 122} 244 A122 22 0 0 0 ${CX + 122} 244`} fill="none" stroke={`url(#${u("gold")})`} strokeWidth="6.5" />
      {front(244, 122, 22, 24).map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y + 0.5} r="2.2" fill="#FFF8EC" stroke="#A9743F" strokeWidth=".8" />
      ))}

      {/* the foot: an urn, a string of beads and the pendant crystal */}
      <path d={`M${CX - 18} 252 C${CX - 22} 272 ${CX - 8} 284 ${CX} 286 C${CX + 8} 284 ${CX + 22} 272 ${CX + 18} 252 Z`} fill={`url(#${u("gold")})`} />
      {[296, 306, 316, 326].map((y) => (
        <circle key={y} cx={CX} cy={y} r={y === 316 ? 4.5 : 3} fill={y === 316 ? `url(#${u("gold")})` : "#FFF7E6"} stroke="#A9743F" strokeWidth="1" />
      ))}
      <path d={drop(CX, 330, 30)} fill={`url(#${u("crystal")})`} stroke="#B88A35" strokeWidth="1.2" />
      <path d={`M${CX - 4} 350 L${CX} 340 L${CX + 4} 350 L${CX} 372 Z`} fill="#FFFFFF" opacity=".7" />
    </svg>
  );
}
