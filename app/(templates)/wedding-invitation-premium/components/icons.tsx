// ─── Gold line icons for the functions + the venue pin (spec P14) ────────────
//
// 48×48, stroke = currentColor (the theme's gold). The first path of each icon
// is its outline and carries pathLength=1 so a card can stroke-draw it once on
// enter (small, ≤ 1 path per icon — spec 3.4); the details fade in after.

export type EventIconId = "haldi" | "mehendi" | "sangeet" | "wedding" | "reception" | "rings";

const ICONS: Record<EventIconId | "pin", { main: string; details: string }> = {
  // a brass pot of turmeric with a mango leaf
  haldi: {
    main: "M15 19h18M17 19c-7 6-7 16 1 21h12c8-5 8-15 1-21",
    details: "M18 15h12l-1 4H19zM24 15c-2-5 1-9 6-10 0 5-2 8-6 10ZM15 30h18M19 34h10",
  },
  // an open palm with a mehendi mandala
  mehendi: {
    main: "M18 41V25c0-2 3-2 3 0v-11c0-2 3-2 3 0v-2c0-2 3-2 3 0v2c0-2 3-2 3 0v13l1-3c1-2 4-1 3 1l-3 8c-1 5-4 8-9 8h-1c-2 0-3-1-3-1Z",
    details: "M24.5 31m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0M24.5 25v1.5M24.5 35.5V37M19.5 31H21M28 31h1.5M22 17h.1M25 15h.1M28 17h.1",
  },
  // a dhol with crossed sticks
  sangeet: {
    main: "M12 20c0-3 24-3 24 0v12c0 3-24 3-24 0Z",
    details: "M12 20c0 3 24 3 24 0M15 22l4 10 4-10 4 10 4-10 3 8M30 15l7-8M18 15l-7-8M37 7c1 0 2 1 1 2M11 7c-1 0-2 1-1 2",
  },
  // a mandap: domed canopy, four posts, swagged garlands
  wedding: {
    main: "M8 19Q24 5 40 19M10 19v21M38 19v21M6 40h36",
    details: "M8 19h32M10 23q7 6 14 0 7 6 14 0M24 8V4M22 4h4M17 40V30M31 40V30M17 30h14",
  },
  // a lit diya on a stand
  reception: {
    main: "M10 30c4 8 24 8 28 0Z",
    details: "M24 28c-4-4-2-10 0-14 2 4 4 10 0 14ZM20 38h8M24 36v2M14 26l-2-2M34 26l2-2M24 10V8",
  },
  rings: {
    main: "M19 28m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0",
    details: "M29 28m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0M26 14l3-4 3 4-3 4Z",
  },
  pin: {
    main: "M24 43S11 30 11 20a13 13 0 0 1 26 0c0 10-13 23-13 23Z",
    details: "M24 20m-4.5 0a4.5 4.5 0 1 0 9 0a4.5 4.5 0 1 0 -9 0M16 46h16",
  },
};

/** Which icon a function's title asks for (English + common Hindi spellings). */
export function iconFor(title: string): EventIconId {
  const t = title.toLowerCase();
  if (/haldi|hald|pithi|ubtan|हल्दी/.test(t)) return "haldi";
  if (/mehe?n?di|mehndi|henna|मेहंदी/.test(t)) return "mehendi";
  if (/sangeet|sangit|music|dj|cocktail|garba|dandiya|संगीत/.test(t)) return "sangeet";
  if (/reception|dinner|party|celebration|रिसेप्शन/.test(t)) return "reception";
  if (/ring|engage|sagai|roka|सगाई/.test(t)) return "rings";
  return "wedding";
}

export function GoldIcon({ id, size = 44, className }: { id: EventIconId | "pin"; size?: number; className?: string }) {
  const ic = ICONS[id];
  return (
    <svg className={`wp2-ic${className ? ` ${className}` : ""}`} width={size} height={size} viewBox="0 0 48 48" aria-hidden>
      <path className="wp2-ic-m" d={ic.main} pathLength={1} />
      <path className="wp2-ic-d" d={ic.details} />
    </svg>
  );
}

export const ICON_CSS = `
.wp2-ic { overflow: visible; color: var(--wk-gold); }
.wp2-ic path { fill: none; stroke: currentColor; stroke-width: 1.7; stroke-linecap: round; stroke-linejoin: round; }
.wp2-draw .wp2-ic-m { stroke-dasharray: 1; stroke-dashoffset: 1; }
.wp2-draw .wp2-ic-d { opacity: 0; }
.wp2-draw.is-in .wp2-ic-m { stroke-dashoffset: 0; transition: stroke-dashoffset .6s cubic-bezier(.22,.61,.36,1) calc(var(--d, 0ms) + 200ms); }
.wp2-draw.is-in .wp2-ic-d { opacity: 1; transition: opacity .5s calc(var(--d, 0ms) + 650ms); }
`;
