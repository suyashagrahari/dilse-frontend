"use client";

// ─── The 9:16 share card ─────────────────────────────────────────────────────
//
// Designed for a phone screen, not cropped out of the report: one huge number,
// two names, the yoni pair, one reading. Same data, same seed, different
// object.
//
// `withMedia` is the export switch. The looping asset is allowed on the card as
// it appears on SCREEN, but a <video> serialises as a blank box, so the copy
// that gets captured is rendered with `withMedia={false}`.

import { seededSpread } from "@/lib/seededRandom";
import { templateMediaBase } from "@/lib/templateMedia";
import { KOOTA_TOTAL, type KundliData, type KundliReport } from "./types";
import { CARD_H, CARD_W, DEVA, INK, MAROON, MONO, PAPER, SAFFRON, SERIF, SOFT_INK } from "./ui";

const ASSET = templateMediaBase("kundli-milan");

export default function ShareCard({
  data,
  report,
  withMedia,
}: {
  data: KundliData;
  report: KundliReport;
  withMedia: boolean;
}) {
  const seed = report.seed;
  const yoni = report.kootas.find((k) => k.name === "yoni");
  const streakLeft = 35 + seededSpread(seed, "cardStreak", 5);
  const tilt = seededSpread(seed, "cardTilt", 0.6);

  return (
    <div
      style={{
        width: CARD_W,
        height: CARD_H,
        background: PAPER,
        color: INK,
        position: "relative",
        overflow: "hidden",
        boxSizing: "border-box",
        padding: 22,
        display: "flex",
        flexDirection: "column",
        backgroundImage:
          "radial-gradient(110% 60% at 50% 0%, rgba(200,137,46,.09) 0%, rgba(253,251,244,0) 62%)",
      }}
    >
      <div
        aria-hidden
        style={{ position: "absolute", inset: 8, border: `4px solid rgba(200,137,46,.15)`, pointerEvents: "none" }}
      />
      <div
        aria-hidden
        style={{ position: "absolute", inset: 15, border: `1px solid rgba(200,137,46,.32)`, pointerEvents: "none" }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: `${streakLeft}%`,
          width: 2,
          background: "#000",
          opacity: 0.05,
          pointerEvents: "none",
        }}
      />

      {/* Head */}
      <div style={{ textAlign: "center", marginTop: 16 }}>
        <div style={{ fontFamily: SERIF, fontSize: 13, fontWeight: 700, letterSpacing: 4 }}>
          ASHTAKOOTA MILAN
        </div>
        <div style={{ fontFamily: DEVA, fontSize: 13, marginTop: 3 }}>अष्टकूट मिलान</div>
        <div style={{ marginTop: 8, borderTop: `2px solid ${INK}` }} />
        <div style={{ marginTop: 2, borderTop: `1px solid ${INK}` }} />
      </div>

      {/* The number */}
      <div style={{ textAlign: "center", marginTop: 26 }}>
        <div
          style={{
            display: "inline-block",
            border: `3px double ${MAROON}`,
            padding: "8px 26px 12px",
            transform: `rotate(${tilt}deg)`,
          }}
        >
          <span
            style={{
              fontFamily: MONO,
              fontSize: 118,
              fontWeight: 700,
              lineHeight: 0.94,
              letterSpacing: 2,
              color: MAROON,
            }}
          >
            {report.total}
          </span>
        </div>
        <div style={{ fontFamily: MONO, fontSize: 17, marginTop: 8, color: SOFT_INK }}>
          out of {KOOTA_TOTAL} gunas
        </div>
        <div style={{ fontFamily: SERIF, fontSize: 15, marginTop: 4, letterSpacing: 1.4 }}>
          {report.grade}
        </div>
      </div>

      {/* Names */}
      <div style={{ textAlign: "center", marginTop: 24 }}>
        <div style={{ borderTop: `1px solid rgba(20,17,13,.4)`, paddingTop: 10 }}>
          <div style={{ fontFamily: MONO, fontSize: 17, lineHeight: 1.45 }}>{data.groom.name}</div>
          <div style={{ fontFamily: SERIF, fontSize: 11, letterSpacing: 3, color: SOFT_INK, margin: "1px 0" }}>
            &amp;
          </div>
          <div style={{ fontFamily: MONO, fontSize: 17, lineHeight: 1.45 }}>{data.bride.name}</div>
        </div>
      </div>

      {/* Yoni pair — the line people screenshot */}
      {yoni && (
        <div
          style={{
            marginTop: 20,
            border: `1px solid ${INK}`,
            padding: "8px 10px",
            textAlign: "center",
          }}
        >
          <div style={{ fontFamily: SERIF, fontSize: 9.5, letterSpacing: 1.6, textTransform: "uppercase" }}>
            Yoni Koota · {yoni.obtained} / {yoni.max}
          </div>
          <div style={{ fontFamily: MONO, fontSize: 13, marginTop: 4 }}>
            {yoni.groomAttr} &nbsp;·&nbsp; {yoni.brideAttr}
          </div>
          <div
            style={{
              fontFamily: SERIF,
              fontStyle: "italic",
              fontSize: 11.5,
              lineHeight: 1.4,
              marginTop: 6,
              color: "#6b4a2a",
            }}
          >
            {yoni.reading}
          </div>
        </div>
      )}

      <div style={{ flex: 1 }} />

      {/* Foot */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 8 }}>
        <div style={{ fontFamily: SERIF, fontSize: 8, color: SOFT_INK, lineHeight: 1.45, maxWidth: 190 }}>
          Office of the Registrar of Hearts
          <br />
          <span style={{ fontFamily: MONO, fontSize: 8 }}>{report.reportNo}</span>
          <br />
          For entertainment. No astrological validity, and not for any actual matrimonial decision.
        </div>
        <div
          style={{
            fontFamily: SERIF,
            fontSize: 9,
            letterSpacing: 1.4,
            color: SAFFRON,
            textAlign: "right",
            whiteSpace: "nowrap",
          }}
        >
          SubhSandesh
        </div>
      </div>

      {/* Screen-only. Excluded from the captured copy by `withMedia`. */}
      {withMedia && (
        <video
          src={`${ASSET}/blessed.webm`}
          autoPlay
          loop
          muted
          playsInline
          aria-hidden
          style={{
            position: "absolute",
            left: 14,
            bottom: 54,
            width: 74,
            height: 74,
            objectFit: "contain",
            pointerEvents: "none",
          }}
        />
      )}
    </div>
  );
}
