// The haunted house from the happy-halloween template (Doorstep.tsx), redrawn
// static and light for the promo surfaces: lavender walls with ink outlines, a
// pointed tower with one warm lit window, the round attic window, a bare tree
// and the hill. Inline SVG — paints with its card, no request. Gradient ids are
// prefixed with `uid` so two houses on one page never share defs.

import type { CSSProperties } from "react";
import { HW } from "./halloweenTheme";

export default function HauntedHouseArt({
  uid = "hh", className, style,
}: { uid?: string; className?: string; style?: CSSProperties }) {
  const ink = "#0E0A1C";
  const id = (n: string) => `${uid}-${n}`;
  return (
    <svg viewBox="0 20 380 404" className={className} style={style} aria-hidden preserveAspectRatio="xMidYMax meet">
      <defs>
        <radialGradient id={id("win")} cx="50%" cy="60%" r="75%">
          <stop offset="0" stopColor="#FFF4C2" />
          <stop offset=".55" stopColor={HW.window} />
          <stop offset="1" stopColor={HW.pumpkin} />
        </radialGradient>
        <radialGradient id={id("halo")} cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="rgba(255,195,90,.55)" />
          <stop offset="1" stopColor="rgba(255,195,90,0)" />
        </radialGradient>
        <linearGradient id={id("wall")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={HW.wall} />
          <stop offset="1" stopColor="#3a2c5c" />
        </linearGradient>
        <linearGradient id={id("roof")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={HW.roof} />
          <stop offset="1" stopColor="#241a40" />
        </linearGradient>
      </defs>
      {/* bare tree */}
      <path
        d="M26 404 C36 362 42 322 38 284 C35 258 24 240 6 228 L10 222 C26 232 38 244 44 258 C46 236 40 212 26 194 L32 190 C46 208 52 230 52 252 C58 236 70 226 88 222 L90 228 C72 234 62 246 58 264 C57 300 60 352 68 404 Z"
        fill="#0B0717"
      />
      <path d="M33 214 C26 204 18 200 8 200 M40 196 C38 184 32 176 22 170" stroke="#0B0717" strokeWidth="3" fill="none" strokeLinecap="round" />
      {/* hill */}
      <ellipse cx="200" cy="420" rx="250" ry="40" fill="#110B21" />
      {/* chimney */}
      <path d="M222 108 L244 110 L242 168 L220 166 Z" fill={HW.roof} stroke={ink} strokeWidth="3" />
      {/* walls + roof */}
      <path d="M86 214 L262 206 L268 394 L80 396 Z" fill={`url(#${id("wall")})`} stroke={ink} strokeWidth="3.5" strokeLinejoin="round" />
      <path d="M84 240 L263 233 M82 350 L267 348" stroke={ink} strokeWidth="1.6" opacity=".55" />
      <path d="M62 222 L176 92 L286 212 Z" fill={`url(#${id("roof")})`} stroke={ink} strokeWidth="3.5" strokeLinejoin="round" />
      <path d="M96 184 Q106 190 116 184 Q126 190 136 184 Q146 190 156 184 Q166 190 176 184 Q186 190 196 184 Q206 190 216 184 Q226 190 236 184 Q246 190 254 186"
        stroke={ink} strokeWidth="1.8" fill="none" opacity=".6" />
      {/* attic + windows */}
      <circle cx="178" cy="168" r="19" fill="#150F28" stroke={ink} strokeWidth="3.5" />
      <path d="M178 149 L178 187 M159 168 L197 168" stroke={ink} strokeWidth="2.6" />
      <rect x="104" y="244" width="40" height="48" rx="7" fill="#150F28" stroke={ink} strokeWidth="3.5" />
      <path d="M124 244 L124 292 M104 266 L144 266" stroke={ink} strokeWidth="2.6" />
      <rect x="208" y="240" width="36" height="48" rx="7" fill="#150F28" stroke={ink} strokeWidth="3.5" />
      <path d="M226 240 L226 288 M208 262 L244 262" stroke={ink} strokeWidth="2.6" />
      {/* tower with the lit window */}
      <path d="M250 168 L316 162 L322 396 L250 396 Z" fill={HW.roof} stroke={ink} strokeWidth="3.5" strokeLinejoin="round" />
      <path d="M238 174 L284 44 L332 166 Z" fill={`url(#${id("roof")})`} stroke={ink} strokeWidth="3.5" strokeLinejoin="round" />
      <path d="M284 44 L285 24" stroke={ink} strokeWidth="3" />
      <path d="M285 24 L298 29 L285 34" fill={HW.pumpkin} />
      <circle cx="285" cy="216" r="34" fill={`url(#${id("halo")})`} />
      <path d="M271 234 L271 212 Q285 190 299 212 L299 234 Z" fill={`url(#${id("win")})`} stroke={ink} strokeWidth="3.5" />
      <path d="M285 196 L285 234 M271 218 L299 218" stroke={ink} strokeWidth="2.4" />
      <path d="M274 312 L274 292 Q285 278 296 292 L296 312 Z" fill="#150F28" stroke={ink} strokeWidth="3" />
      {/* porch + door */}
      <path d="M138 300 L178 276 L218 298 Z" fill={HW.roof} stroke={ink} strokeWidth="3" strokeLinejoin="round" />
      <path d="M156 394 L156 330 Q178 298 200 330 L200 394 Z" fill="#6b54a8" stroke={ink} strokeWidth="3" />
      <circle cx="178" cy="368" r="5" fill="none" stroke="#e6c373" strokeWidth="2" />
    </svg>
  );
}
