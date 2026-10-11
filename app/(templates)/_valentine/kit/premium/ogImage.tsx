// The 1200×630 link preview shared by the nine `-premium` routes (WhatsApp, X,
// iMessage, Slack). Rendered at build time by next/og from each route's
// opengraph-image.tsx, so nothing needs a CDN upload. No emoji: next/og fetches
// emoji images at render time and a build without network would ship blanks.
import { ImageResponse } from "next/og";

export const PREMIUM_OG_SIZE = { width: 1200, height: 630 };

export interface PremiumOg {
  /** "Valentine's Day" */
  day: string;
  /** The concept name, e.g. "Our Film". */
  concept: string;
  /** One sentence on what the recipient does. */
  line: string;
  /** Background gradient, dark → jewel tone. */
  bg: [string, string];
  /** Date chip, e.g. "14 February". */
  date: string;
}

const GOLD = "#F2C46D";

export function premiumOgImage(o: PremiumOg): ImageResponse {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 96px",
          background: `linear-gradient(150deg, ${o.bg[0]} 0%, ${o.bg[0]} 35%, ${o.bg[1]} 100%)`,
          color: "#FBF6EC",
          fontFamily: "serif",
          position: "relative",
        }}
      >
        {/* thin gold frame */}
        <div style={{ position: "absolute", top: 26, left: 26, right: 26, bottom: 26, border: `2px solid ${GOLD}55`, borderRadius: 22, display: "flex" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              display: "flex",
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: 4,
              color: "#2A1A05",
              background: `linear-gradient(135deg, #FFE7A8, ${GOLD} 55%, #B8862E)`,
              padding: "8px 18px",
              alignItems: "center",
              gap: 10,
              borderRadius: 999,
              fontFamily: "sans-serif",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24"><path d="M12 1 L14.6 9.4 L23 12 L14.6 14.6 L12 23 L9.4 14.6 L1 12 L9.4 9.4 Z" fill="#2A1A05" /></svg>
            PREMIUM
          </div>
          <div style={{ display: "flex", fontSize: 22, letterSpacing: 4, color: `${GOLD}`, fontFamily: "sans-serif" }}>{o.date.toUpperCase()}</div>
        </div>
        <div style={{ display: "flex", fontSize: 40, marginTop: 34, color: "#EDE3D0" }}>Happy {o.day}</div>
        <div style={{ display: "flex", fontSize: 92, fontWeight: 700, lineHeight: 1.02, marginTop: 6, color: GOLD, fontStyle: "italic" }}>{o.concept}</div>
        <div style={{ display: "flex", fontSize: 30, lineHeight: 1.4, marginTop: 26, color: "#E6DCCB", maxWidth: 900, fontFamily: "sans-serif" }}>{o.line}</div>
        <div style={{ display: "flex", fontSize: 24, marginTop: 34, color: GOLD, fontWeight: 700, fontFamily: "sans-serif" }}>subhsandesh.in</div>
      </div>
    ),
    PREMIUM_OG_SIZE,
  );
}
