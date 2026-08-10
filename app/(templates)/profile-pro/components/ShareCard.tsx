"use client";

// ─── Endorsements — the 9:16 share card ──────────────────────────────────────
//
// The thing that actually gets sent. Three traps, all of which produce a PNG
// that looks subtly wrong rather than one that fails loudly:
//
//   1. FONTS. `exportNodeToPng` awaits `document.fonts.ready` before capturing,
//      so nothing here needs to — but nothing here may capture on its own path
//      either. Always go through that helper.
//
//   2. MID-ANIMATION FRAMES. The live page count-ups and row flashes would be
//      frozen at whatever frame the capture landed on. This card is a separate,
//      static render — it shares tokens with the page and nothing else. There is
//      no animation on this subtree to pause.
//
//   3. SCALE. The card is authored at its true 360×640 and mounted offscreen at
//      that size. It is never the on-screen element scaled up.

import { useMemo } from "react";
import { PP, ACCENT_TINT } from "./theme";
import { Avatar } from "./Avatar";
import type { ProfileProData } from "./types";

export const SHARE_W = 360;
export const SHARE_H = 640;

/** Top skills, most-endorsed first. Zero-count skills are excluded — an empty
 *  count on a share card reads as a bug rather than as an invitation. */
function topSkills(data: ProfileProData, n: number) {
  return [...data.skills]
    .filter((s) => s.endorsements > 0)
    .sort((a, b) => b.endorsements - a.endorsements)
    .slice(0, n);
}

export default function ShareCard({
  data,
  attach,
}: {
  data: ProfileProData;
  attach: (el: HTMLDivElement | null) => void;
}) {
  const skills = useMemo(() => topSkills(data, 5), [data]);
  const { person } = data;

  return (
    <div
      ref={attach}
      style={{
        position: "fixed",
        left: -10000,
        top: 0,
        width: SHARE_W,
        height: SHARE_H,
        background: PP.page,
        fontFamily: PP.font,
        color: PP.ink,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
      aria-hidden="true"
    >
      {/* Profile card */}
      <div style={{ background: PP.card, border: `1px solid ${PP.edge}`, borderRadius: 8, margin: 12, overflow: "hidden" }}>
        <div
          style={{
            height: Math.round((SHARE_W - 24) * (5 / 16)),
            background: person.bannerUrl
              ? `linear-gradient(135deg, ${PP.accent}22, ${PP.accent}55)`
              : `linear-gradient(135deg, ${PP.accent}33, ${PP.accent}77)`,
          }}
        />
        <div style={{ padding: "0 14px 14px", marginTop: -38 }}>
          <div style={{ width: 76, height: 76, borderRadius: "50%", border: "4px solid #FFFFFF", overflow: "hidden", background: "#FFFFFF" }}>
            <Avatar name={person.name} src={person.photoUrl} size={68} />
          </div>
          <p style={{ margin: "8px 0 0", fontSize: 19, fontWeight: 700, lineHeight: 1.2 }}>{person.name}</p>
          <p style={{ margin: "3px 0 0", fontSize: 13, lineHeight: 1.35, color: PP.ink }}>{person.headline}</p>
          <p style={{ margin: "5px 0 0", fontSize: 12, color: PP.inkSoft }}>
            {person.location}
            {person.connections ? <span style={{ color: PP.accent }}>{` · ${person.connections}`}</span> : null}
          </p>
        </div>
      </div>

      {/* Top skills */}
      <div style={{ background: PP.card, border: `1px solid ${PP.edge}`, borderRadius: 8, margin: "0 12px", padding: 14, flex: 1 }}>
        <p style={{ margin: "0 0 10px", fontSize: 15, fontWeight: 600 }}>Skills</p>
        {skills.length === 0 ? (
          <p style={{ margin: 0, fontSize: 12.5, color: PP.inkSoft }}>Endorsements are still coming in.</p>
        ) : (
          skills.map((s, i) => (
            <div
              key={s.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "9px 0",
                borderBottom: i === skills.length - 1 ? "none" : `1px solid ${PP.edge}`,
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: 13.5, fontWeight: 600, overflowWrap: "anywhere" }}>
                  {s.label}
                  {/* Flat treatment: 47 and 2 are set identically. The contrast is the joke. */}
                  <span style={{ fontWeight: 400, color: PP.inkSoft }}>{` (${s.endorsements})`}</span>
                </p>
                {s.topEndorsers.length > 0 ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4 }}>
                    {s.topEndorsers.slice(0, 3).map((n, j) => (
                      <div key={j} style={{ marginLeft: j === 0 ? 0 : -6, border: "2px solid #FFFFFF", borderRadius: "50%", overflow: "hidden" }}>
                        <Avatar name={n} size={18} />
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
              {s.isTop3 ? (
                <span
                  style={{
                    flex: "0 0 auto", fontSize: 10, fontWeight: 600, color: PP.accent,
                    background: ACCENT_TINT, borderRadius: 4, padding: "3px 6px",
                  }}
                >
                  Top skill
                </span>
              ) : null}
            </div>
          ))
        )}
      </div>

      <div style={{ padding: "10px 14px 14px", display: "flex", alignItems: "center" }}>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 10, color: PP.inkSoft }}>SubhSandesh</span>
      </div>
    </div>
  );
}
