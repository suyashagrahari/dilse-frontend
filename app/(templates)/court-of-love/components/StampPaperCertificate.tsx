"use client";

import { forwardRef } from "react";
import { dirFor, type CourtOfLoveData } from "./types";

/**
 * The keepsake the winner takes away: a mock ₹100 non-judicial stamp paper.
 *
 * This is the one surface that deliberately leaves the SubhSandesh theme behind.
 * Everything else in the template uses the house cream/indigo/pink tokens, but a
 * certificate has to read as a *document* — aged parchment, deep ink, a serif
 * face, red wax and gold foil. Using the UI palette here would make it look like
 * another card instead of something you'd screenshot and keep.
 *
 * Rendered as real DOM text (never baked into an image) so it stays selectable,
 * indexable and readable by screen readers; html-to-image snapshots this node for
 * the PNG and PDF exports, which is why the ref is forwarded.
 */

const PAPER = "#F6EFDF";
const PAPER_EDGE = "#EADFC6";
const INK = "#2A2118";
const INK_SOFT = "#6B5B45";
const WAX = "#B3261E";
const GOLD = "#C9A84C";

const SERIF = 'ui-serif, "Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif';

const StampPaperCertificate = forwardRef<
  HTMLDivElement,
  {
    data: CourtOfLoveData;
    score: number;
    total: number;
    caseNo: string;
    dateStr: string;
  }
>(function StampPaperCertificate({ data, score, total, caseNo, dateStr }, ref) {
  const accused = data.accusedName?.trim() || "The Accused";
  const plaintiff = data.plaintiffName?.trim() || "The Plaintiff";
  const percent = total > 0 ? Math.round((score / total) * 100) : 0;

  return (
    <div
      ref={ref}
      // Mirrors the case's language so a certificate generated from an Urdu or
      // Arabic story reads correctly — including in the PNG and PDF exports,
      // which snapshot this exact node.
      lang={data.language || "en"}
      dir={dirFor(data.language)}
      style={{
        width: "100%",
        maxWidth: 460,
        margin: "0 auto",
        background: PAPER,
        color: INK,
        fontFamily: SERIF,
        border: `1px solid ${PAPER_EDGE}`,
        borderRadius: 6,
        padding: "26px 22px 22px",
        position: "relative",
        overflow: "hidden",
        // Fibrous paper tint. Kept as gradients (no external texture) so the
        // html-to-image snapshot is pixel-identical to what's on screen.
        backgroundImage: `
          radial-gradient(circle at 12% 8%, rgba(201,168,76,.10), transparent 42%),
          radial-gradient(circle at 88% 92%, rgba(179,38,30,.06), transparent 46%),
          repeating-linear-gradient(94deg, rgba(120,95,55,.030) 0 1px, transparent 1px 4px)
        `,
        boxShadow: "0 10px 30px rgba(42,33,24,.14)",
      }}
    >
      {/* double rule frame */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 8,
          border: `1.5px solid ${GOLD}`,
          borderRadius: 3,
          opacity: 0.55,
          pointerEvents: "none",
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 13,
          border: `0.5px solid ${GOLD}`,
          borderRadius: 2,
          opacity: 0.4,
          pointerEvents: "none",
        }}
      />

      <div style={{ position: "relative" }}>
        {/* ── stamp paper header ─────────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 10,
            borderBottom: `1px solid ${PAPER_EDGE}`,
            paddingBottom: 10,
            marginBottom: 14,
          }}
        >
          <div style={{ textAlign: "left" }}>
            <div style={{ fontSize: 7.5, letterSpacing: 1.6, color: INK_SOFT, textTransform: "uppercase" }}>
              Republic of Us · Non-Judicial
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 0.4, marginTop: 2 }}>
              ₹100 STAMP PAPER
            </div>
          </div>
          <div
            style={{
              flexShrink: 0,
              textAlign: "center",
              border: `1px solid ${GOLD}`,
              borderRadius: 4,
              padding: "3px 7px",
              background: "rgba(201,168,76,.10)",
            }}
          >
            <div style={{ fontSize: 6.5, letterSpacing: 1, color: INK_SOFT }}>CASE NO.</div>
            <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: 0.3 }}>{caseNo}</div>
          </div>
        </div>

        {/* ── title ─────────────────────────────────────────────────── */}
        <div style={{ textAlign: "center", marginBottom: 4 }}>
          <span style={{ fontSize: 20, letterSpacing: 2 }}>⚖️</span>
        </div>
        <div
          style={{
            textAlign: "center",
            fontSize: 8,
            letterSpacing: 2.4,
            color: INK_SOFT,
            textTransform: "uppercase",
          }}
        >
          In the Court of Love
        </div>
        <h3
          style={{
            // Pinned, not inherited: a site-wide `h3` rule sets the heading sans,
            // which would quietly re-skin the certificate if that font ever changes.
            fontFamily: SERIF,
            textAlign: "center",
            fontSize: 25,
            lineHeight: 1.15,
            fontWeight: 700,
            margin: "7px 0 3px",
            letterSpacing: 0.2,
          }}
        >
          {data.certificateTitle?.trim() || "Certified Best Partner"}
        </h3>
        <div
          aria-hidden="true"
          style={{ width: 62, height: 1.5, background: GOLD, margin: "9px auto 15px", opacity: 0.7 }}
        />

        {/* ── body ──────────────────────────────────────────────────── */}
        <p style={{ fontSize: 11.5, lineHeight: 1.72, textAlign: "center", margin: 0, color: INK }}>
          This is to certify that
        </p>
        <p
          style={{
            fontSize: 23,
            lineHeight: 1.25,
            fontWeight: 700,
            textAlign: "center",
            margin: "6px 0 7px",
            borderBottom: `1px dashed ${PAPER_EDGE}`,
            paddingBottom: 7,
          }}
        >
          {accused}
        </p>
        <p style={{ fontSize: 11.5, lineHeight: 1.72, textAlign: "center", margin: 0, color: INK }}>
          having appeared before this Court and answered{" "}
          <strong style={{ fontWeight: 700 }}>
            {score} of {total}
          </strong>{" "}
          charges truthfully, is hereby found <strong style={{ fontWeight: 700 }}>GUILTY</strong> of
          loving <strong style={{ fontWeight: 700 }}>{plaintiff}</strong> beyond all reasonable doubt.
        </p>
        <p
          style={{
            fontSize: 10.5,
            lineHeight: 1.7,
            textAlign: "center",
            margin: "9px 0 0",
            color: INK_SOFT,
            fontStyle: "italic",
          }}
        >
          Sentenced to a lifetime of forehead kisses, stolen fries and being told
          &ldquo;I told you so&rdquo;. No appeal shall be entertained.
        </p>

        {/* ── verdict score strip ───────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 22,
            margin: "16px 0 4px",
            padding: "9px 0",
            borderTop: `1px solid ${PAPER_EDGE}`,
            borderBottom: `1px solid ${PAPER_EDGE}`,
          }}
        >
          {[
            { label: "Verdict", value: "WON" },
            { label: "Score", value: `${percent}%` },
            { label: "Dated", value: dateStr },
          ].map((cell) => (
            <div key={cell.label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 6.5, letterSpacing: 1.3, color: INK_SOFT, textTransform: "uppercase" }}>
                {cell.label}
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, marginTop: 2, letterSpacing: 0.2 }}>
                {cell.value}
              </div>
            </div>
          ))}
        </div>

        {/* ── signature + wax seal ──────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: 14,
            marginTop: 16,
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontFamily: "var(--font-caveat), ui-rounded, cursive",
                fontSize: 25,
                lineHeight: 1,
                color: "#1B3A6B",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                transform: "rotate(-3deg)",
                transformOrigin: "left bottom",
                marginBottom: 5,
              }}
            >
              {data.signatureName?.trim() || plaintiff}
            </div>
            <div style={{ borderTop: `1px solid ${INK_SOFT}`, paddingTop: 4, opacity: 0.9 }}>
              <div style={{ fontSize: 7.5, letterSpacing: 1.1, color: INK_SOFT, textTransform: "uppercase" }}>
                Plaintiff &amp; Presiding Judge
              </div>
            </div>
          </div>

          {/* wax seal */}
          <div
            aria-hidden="true"
            style={{
              flexShrink: 0,
              width: 74,
              height: 74,
              borderRadius: "50%",
              background: `radial-gradient(circle at 34% 28%, #D6483E, ${WAX} 58%, #8E1C16)`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              color: "#FFEDE9",
              boxShadow: "inset 0 -2px 6px rgba(0,0,0,.34), 0 3px 8px rgba(142,28,22,.36)",
              transform: "rotate(-7deg)",
              border: "2px dashed rgba(255,237,233,.42)",
            }}
          >
            <div style={{ fontSize: 19, lineHeight: 1 }}>💗</div>
            <div style={{ fontSize: 5.6, letterSpacing: 1, marginTop: 3, fontWeight: 700 }}>SEALED BY</div>
            <div style={{ fontSize: 6.4, letterSpacing: 0.4, fontWeight: 700 }}>THE COURT</div>
          </div>
        </div>

        <div
          style={{
            marginTop: 13,
            paddingTop: 8,
            borderTop: `1px solid ${PAPER_EDGE}`,
            fontSize: 6.8,
            letterSpacing: 0.7,
            color: INK_SOFT,
            textAlign: "center",
          }}
        >
          THIS INSTRUMENT IS BINDING IN ALL MATTERS OF THE HEART · SUBHSANDESH · COURT OF LOVE
        </div>
      </div>
    </div>
  );
});

export default StampPaperCertificate;
