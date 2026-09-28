"use client";

// ─── Challan — the 9:16 share card ───────────────────────────────────────────
//
// A COMPACT RE-COMPOSITION, NOT A SCREENSHOT OF THE NOTICE. The notice is 420px
// wide and several times taller than 640; scaling it into this frame would put
// the evidence box and the offence table at a size nobody can read, which is the
// only reason to share this at all.
//
// ── THE DISCLAIMER IS LOAD-BEARING ───────────────────────────────────────────
//
// `CHALLAN_DISCLAIMER` renders here at a legible size, not at the 6.5px it uses
// in the notice's fine-print block. This image is the thing that travels — it
// gets forwarded out of the conversation that explains it — so the one line
// saying it is not a government document has to survive the trip. It is set
// last, above the watermark, where a reader's eye finishes.
//
// Three traps, same as every share card in this repo:
//   1. FONTS — `exportNodeToPng` awaits `document.fonts.ready`. Never capture
//      on another path.
//   2. MID-ANIMATION FRAMES — this subtree has no animation. `Stamp` is passed
//      `animate={false}` so it is drawn at rest rather than mid-descent.
//   3. SCALE — authored at true 360×640 and mounted offscreen at that size.

import { EvidenceBox } from "./EvidenceBox";
import { Stamp } from "./Stamp";
import { pickTheme, themeVars } from "../../_love/theme";
import { CHALLAN_THEMES, challanVars } from "./themes";
import { CH, chDate } from "./theme";
import { CHALLAN_DISCLAIMER, type ChallanData } from "./types";

export const SHARE_W = 360;
export const SHARE_H = 640;

/** The evidence box is authored against the 420px document. Fit it to the card. */
const EVIDENCE_SCALE = 300 / CH.docW;

export default function ShareCard({
  data,
  paid,
  attach,
}: {
  data: ChallanData;
  paid: boolean;
  attach: (el: HTMLDivElement | null) => void;
}) {
  const offences = data.offences.slice(0, 4);

  return (
    <div
      ref={attach}
      style={{
        // The card lives outside the template root, so it brings its own theme.
        ...themeVars(pickTheme(CHALLAN_THEMES, data.theme)),
        ...challanVars(pickTheme(CHALLAN_THEMES, data.theme)),
        position: "fixed",
        left: -10000,
        top: 0,
        width: SHARE_W,
        height: SHARE_H,
        background: CH.paper,
        color: CH.ink,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        padding: "18px 16px 12px",
        boxSizing: "border-box",
      }}
      aria-hidden="true"
    >
      {/* Header band */}
      <div style={{ textAlign: "center", borderBottom: `3px solid ${CH.edge}`, paddingBottom: 8 }}>
        <svg width={34} height={34} viewBox="0 0 48 48" aria-hidden="true" style={{ display: "block", margin: "0 auto 4px" }}>
          <circle cx="24" cy="24" r="22" fill="none" stroke={CH.ink} strokeWidth="1.2" />
          <circle cx="24" cy="24" r="18.5" fill="none" stroke={CH.ink} strokeWidth="0.7" />
          <path d="M20 20c-2.2 0-4 1.8-4 4 0 4 4.6 7 8 9.4 3.4-2.4 8-5.4 8-9.4 0-2.2-1.8-4-4-4-1.7 0-3.2 1-4 2.5-.8-1.5-2.3-2.5-4-2.5Z"
            fill="none" stroke={CH.ink} strokeWidth="1.1" transform="translate(-3.2 -2)" />
          <path d="M20 20c-2.2 0-4 1.8-4 4 0 4 4.6 7 8 9.4 3.4-2.4 8-5.4 8-9.4 0-2.2-1.8-4-4-4-1.7 0-3.2 1-4 2.5-.8-1.5-2.3-2.5-4-2.5Z"
            fill="none" stroke={CH.ink} strokeWidth="1.1" transform="translate(3.2 -2)" />
        </svg>
        <p style={{ margin: 0, fontFamily: CH.serif, fontSize: 11, fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase" }}>
          {data.authority.name}
        </p>
        <p style={{ margin: "1px 0 0", fontFamily: CH.serif, fontSize: 8, letterSpacing: "0.07em", color: CH.faint }}>
          {data.authority.department} · {data.authority.state}
        </p>
      </div>

      <p style={{ margin: "7px 0 6px", textAlign: "center", fontFamily: CH.serif, fontSize: 13, fontWeight: 700, letterSpacing: "0.22em", textDecoration: "underline" }}>
        E-CHALLAN
      </p>

      <div style={{ display: "flex", fontFamily: CH.mono, fontSize: 8.5, color: CH.faint, marginBottom: 7 }}>
        <span>No: {data.challanNo}</span>
        <span style={{ flex: 1 }} />
        <span>Date: {chDate(data.issuedAt)}</span>
      </div>

      {/* Evidence, scaled to the card but never re-laid-out */}
      <div style={{ height: Math.round(190 * EVIDENCE_SCALE) + 44, overflow: "hidden" }}>
        <div style={{ width: CH.docW, transform: `scale(${EVIDENCE_SCALE})`, transformOrigin: "top left" }}>
          <EvidenceBox evidence={data.evidence} />
        </div>
      </div>

      {/* Offence table */}
      <div style={{ border: `1px solid ${CH.edge}`, marginTop: 8 }}>
        <div style={{ display: "flex", background: CH.head, borderBottom: `1px solid ${CH.edge}`, padding: "3px 6px", fontFamily: CH.serif, fontSize: 8, fontWeight: 700, letterSpacing: "0.06em" }}>
          <span style={{ flex: 1 }}>OFFENCE</span>
          <span>FINE</span>
        </div>
        {offences.map((o, i) => (
          <div
            key={i}
            style={{
              display: "flex", gap: 6, padding: "4px 6px",
              background: i % 2 === 1 ? CH.band : "transparent",
              borderBottom: i === offences.length - 1 ? "none" : `1px solid rgba(17,17,17,.18)`,
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontFamily: CH.mono, fontSize: 9, overflowWrap: "anywhere" }}>{o.description}</p>
              {o.note ? (
                <p style={{ margin: 0, fontFamily: CH.serif, fontSize: 7.5, fontStyle: "italic", color: CH.faint, overflowWrap: "anywhere" }}>{o.note}</p>
              ) : null}
            </div>
            <span style={{ fontFamily: CH.mono, fontSize: 9, flex: "0 0 auto" }}>{o.fine}</span>
          </div>
        ))}
        <div style={{ display: "flex", borderTop: `2px solid ${CH.edge}`, padding: "4px 6px", background: CH.head }}>
          <span style={{ flex: 1, fontFamily: CH.serif, fontSize: 9, fontWeight: 700, letterSpacing: "0.07em" }}>TOTAL</span>
          {/* Free text. Printed exactly as written — never summed from the rows. */}
          <span style={{ fontFamily: CH.mono, fontSize: 10, fontWeight: 700 }}>{data.totalFine}</span>
        </div>
      </div>

      <div style={{ position: "relative", flex: 1, minHeight: 0 }}>
        {paid ? (
          <div style={{ position: "absolute", right: 4, top: 2 }}>
            <Stamp text="PAID" tone="green" animate={false} />
          </div>
        ) : null}
      </div>

      {/* The line that has to survive the forward. Legible, not fine print. */}
      <p
        style={{
          margin: "0 0 6px",
          fontFamily: CH.serif,
          fontSize: 8.5,
          lineHeight: 1.35,
          color: CH.ink,
          borderTop: `1px solid ${CH.edge}`,
          paddingTop: 6,
        }}
      >
        {CHALLAN_DISCLAIMER}
      </p>

      <div style={{ display: "flex", alignItems: "center" }}>
        <div style={{ flex: 1 }} />
        <span style={{ fontFamily: CH.serif, fontSize: 8, color: CH.faint }}>SubhSandesh</span>
      </div>
    </div>
  );
}
