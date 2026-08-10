"use client";

// ─── The notice ──────────────────────────────────────────────────────────────
//
// A government form, printed and scanned. It renders at a FIXED width (CH.docW)
// and is scaled by a transform on the wrapper below. There is not one
// breakpoint in this file and there must never be one: a document that reflows
// is a web page, and a web page cannot be believed for the four seconds this
// template needs.
//
// LEGAL — the line this file holds:
//   · The issuing body is invented end to end: "Department of Heart Traffic,
//     Republic of Us". The only insignia drawn anywhere is two overlapping
//     hearts inside a double ring, generated below as inline SVG. No mark
//     belonging to any real authority, force or transport portal appears here,
//     in any form — not in file names, alt text, class names or comments.
//   · This is a NOTICE. It is never an identity document. Nothing on this page
//     places a photograph of a person beside their name and a number in a card
//     layout, and nothing ever should.
//   · CHALLAN_DISCLAIMER prints legibly, on its own line, above the fine print.
//     It is not decoration and it is not optional.
//
// THE TRAP: `data.totalFine` is FREE TEXT. "one date" is a valid total. It is
// printed verbatim. It is never Number()'d, parseFloat()'d, summed from
// `offences[].fine`, compared, or formatted as currency. `NaN` on a challan is
// the one bug that makes the joke stop working.

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { CHALLAN_DISCLAIMER, type ChallanData, type ChallanOffence } from "./types";
import {
  CH,
  CH_BANDING,
  CH_LEADER,
  chDate,
  chDateTime,
  chJitter,
  chRupees,
} from "./theme";
import { EvidenceBox } from "./EvidenceBox";

/* ── The invented seal ───────────────────────────────────────────────────────
   Two overlapping hearts inside a double ring, with tick marks between the
   rings. Drawn, not fetched, and deliberately unlike anything real. */

const HEART =
  "M12 20.6 C12 20.6 3.2 14.2 3.2 8.7 C3.2 5.6 5.6 3.2 8.5 3.2 C10.3 3.2 11.4 4.1 12 5 " +
  "C12.6 4.1 13.7 3.2 15.5 3.2 C18.4 3.2 20.8 5.6 20.8 8.7 C20.8 14.2 12 20.6 12 20.6 Z";

function AuthoritySeal({ size = 56 }: { size?: number }) {
  const ticks = Array.from({ length: 24 }, (_, i) => {
    const a = (i / 24) * Math.PI * 2;
    const r1 = 22.8;
    const r2 = 25.6;
    return (
      <line
        key={i}
        x1={28 + Math.cos(a) * r1}
        y1={28 + Math.sin(a) * r1}
        x2={28 + Math.cos(a) * r2}
        y2={28 + Math.sin(a) * r2}
        stroke={CH.ink}
        strokeWidth={0.7}
      />
    );
  });

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 56 56"
      role="img"
      aria-label="Seal of the Department of Heart Traffic: two overlapping hearts in a double ring"
      style={{ display: "block", margin: "0 auto" }}
    >
      <circle cx={28} cy={28} r={27} fill="none" stroke={CH.ink} strokeWidth={1.7} />
      <circle cx={28} cy={28} r={21.6} fill="none" stroke={CH.ink} strokeWidth={0.9} />
      {ticks}
      <g transform="translate(15.6 19.5) scale(0.7)">
        <path d={HEART} fill="none" stroke={CH.ink} strokeWidth={1.9} strokeLinejoin="round" />
      </g>
      <g transform="translate(23.6 19.5) scale(0.7)">
        <path d={HEART} fill="none" stroke={CH.ink} strokeWidth={1.9} strokeLinejoin="round" />
      </g>
    </svg>
  );
}

/* ── Deterministic typewriter jitter ─────────────────────────────────────────
   Exactly two characters of the challan number sit 1px high, chosen from the
   number itself. No Math.random: the jitter has to survive a re-render and a
   PNG capture, or the document and its own photograph disagree. */

function ChallanNumber({ value }: { value: string }) {
  const jit = useMemo(() => chJitter(value), [value]);
  return (
    <>
      {value.split("").map((c, i) => (
        <span
          key={`${c}-${i}`}
          style={jit.has(i) ? { display: "inline-block", transform: "translateY(-1px)" } : undefined}
        >
          {c}
        </span>
      ))}
    </>
  );
}

/* ── Table primitives ────────────────────────────────────────────────────── */

function DetailRow({
  label,
  value,
  sub,
  band,
  first,
}: {
  label: string;
  value: string;
  sub?: string;
  band: boolean;
  first: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "stretch",
        borderTop: first ? "none" : `1px solid ${CH.edge}`,
        background: band ? CH.band : "transparent",
      }}
    >
      <div
        style={{
          width: "44%",
          flex: "none",
          padding: "5px 7px 4px",
          borderRight: `1px solid ${CH.edge}`,
          display: "flex",
          alignItems: "baseline",
        }}
      >
        <span style={{ fontFamily: CH.serif, fontSize: 9.5, letterSpacing: 0.2, whiteSpace: "nowrap" }}>
          {label}
        </span>
        <span aria-hidden style={CH_LEADER} />
      </div>
      <div style={{ flex: 1, minWidth: 0, padding: "5px 7px 4px" }}>
        <div
          style={{
            fontFamily: CH.mono,
            fontSize: 10.5,
            letterSpacing: 0.2,
            lineHeight: 1.35,
            wordBreak: "break-word",
          }}
        >
          {value || "—"}
        </div>
        {sub ? (
          <div
            style={{
              fontFamily: CH.mono,
              fontSize: 8.6,
              lineHeight: 1.45,
              color: CH.faint,
              marginTop: 2,
              wordBreak: "break-word",
            }}
          >
            {sub}
          </div>
        ) : null}
      </div>
    </div>
  );
}

const OFFENCE_COLS = ["10%", "26%", "42%", "22%"] as const;

function OffenceRow({ n, o, band }: { n: number; o: ChallanOffence; band: boolean }) {
  const cell: React.CSSProperties = {
    padding: "5px 6px",
    borderRight: `1px solid ${CH.edge}`,
    minWidth: 0,
  };
  return (
    <div style={{ display: "flex", borderTop: `1px solid ${CH.edge}`, background: band ? CH.band : "transparent" }}>
      <div style={{ ...cell, width: OFFENCE_COLS[0], flex: "none", fontFamily: CH.mono, fontSize: 10, textAlign: "center" }}>
        {n}
      </div>
      <div style={{ ...cell, width: OFFENCE_COLS[1], flex: "none", fontFamily: CH.mono, fontSize: 8.8, lineHeight: 1.4, wordBreak: "break-word" }}>
        {o.section}
      </div>
      <div style={{ ...cell, width: OFFENCE_COLS[2], flex: "none" }}>
        <div style={{ fontFamily: CH.serif, fontSize: 12, lineHeight: 1.35, wordBreak: "break-word" }}>
          {o.description}
        </div>
        {o.note ? (
          <div
            style={{
              fontFamily: CH.serif,
              fontSize: 11,
              fontStyle: "italic",
              lineHeight: 1.35,
              color: CH.faint,
              marginTop: 2,
              wordBreak: "break-word",
            }}
          >
            {o.note}
          </div>
        ) : null}
      </div>
      <div
        style={{
          width: OFFENCE_COLS[3],
          flex: "none",
          padding: "5px 6px",
          fontFamily: CH.mono,
          fontSize: 10,
          textAlign: "right",
          whiteSpace: "nowrap",
        }}
      >
        {chRupees(o.fine)}
      </div>
    </div>
  );
}

/* ── The document ────────────────────────────────────────────────────────── */

export function ChallanNotice({
  data,
  overdue,
  remaining,
  onPay,
  onContest,
  paid,
  capture,
}: {
  data: ChallanData;
  overdue: boolean;
  remaining: string;
  onPay: () => void;
  onContest: () => void;
  paid?: boolean;
  capture?: boolean;
}) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const paperRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(1);
  const [paperH, setPaperH] = useState(0);

  // The scale wrapper. One fixed-width document, transformed to fit — never a
  // reflow. The measured height is mirrored onto the outer box so the page
  // below it does not sit under a scaled element's untransformed footprint.
  //
  // `offsetHeight`, not `getBoundingClientRect()` — the rect is post-transform,
  // so feeding it back in would compound the scale on every measurement.
  useEffect(() => {
    const wrap = wrapRef.current;
    const paper = paperRef.current;
    if (!wrap || !paper) return;
    const measure = () => {
      const w = wrap.clientWidth;
      if (w > 0) setScale(Math.min(w / CH.docW, 1));
      setPaperH(paper.offsetHeight);
    };
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(measure);
    ro.observe(wrap);
    ro.observe(paper);
    return () => ro.disconnect();
  }, []);

  const still = !!capture;

  // Never show negative time. `remaining` is pre-formatted upstream, but a
  // clock that has just crossed the due moment can hand us a leading "-" one
  // tick before `overdue` flips, and a challan counting backwards is a bug the
  // reader will spot instantly.
  const safeRemaining = remaining.trim();
  const showCountdown = !overdue && safeRemaining.length > 0 && !safeRemaining.startsWith("-");

  const finePrint = [
    "Computer-generated notice; no signature is required.",
    "Fines under this Act are payable in kind and are non-refundable.",
    "Objections may be filed by the party concerned within the period stated above.",
    "Retain this notice for your records; a duplicate will not be issued.",
    `Issued by the ${data.authority.department}, ${data.authority.state}.`,
    "E. & O.E.",
  ].join(" · ");

  return (
    <div ref={wrapRef} style={{ width: "100%", display: "flex", justifyContent: "center" }}>
      <style>{`
        @keyframes ch-pulse-${uid} { 0%,100% { opacity: 1; } 50% { opacity: .25; } }
        .ch-live-${uid} { animation: ch-pulse-${uid} 1.1s ease-in-out infinite; }
        .ch-still-${uid} .ch-live-${uid} { animation: none !important; opacity: 1 !important; }
        @media (prefers-reduced-motion: reduce) {
          .ch-live-${uid} { animation: none !important; opacity: 1 !important; }
        }
      `}</style>

      <div style={{ width: CH.docW * scale, height: paperH ? paperH * scale : undefined }}>
        <div
          ref={paperRef}
          className={still ? `ch-still-${uid}` : undefined}
          style={{
            width: CH.docW,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            position: "relative",
            overflow: "hidden",
            background: CH.paper,
            backgroundImage: CH_BANDING,
            color: CH.ink,
            border: "1px solid #d9d5c9",
          }}
        >
          {/* Two staple holes, punched through the top-left corner. */}
          <span
            aria-hidden
            style={{
              position: "absolute", left: 14, top: 11, width: 3, height: 3, borderRadius: "50%",
              background: "radial-gradient(circle, #6a6a6a 40%, rgba(0,0,0,.25) 100%)", zIndex: 4,
            }}
          />
          <span
            aria-hidden
            style={{
              position: "absolute", left: 14, top: 23, width: 3, height: 3, borderRadius: "50%",
              background: "radial-gradient(circle, #6a6a6a 40%, rgba(0,0,0,.25) 100%)", zIndex: 4,
            }}
          />

          {/* A vertical toner streak down the drum, ~30% from the left.
              Feathered at both ends — a hard-edged rule reads as a seam in the
              layout, which is the opposite of a flaw in the printing. */}
          <span
            aria-hidden
            style={{
              position: "absolute", left: "30%", top: 0, bottom: 0, width: 2, zIndex: 3,
              pointerEvents: "none",
              background:
                "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,.05) 12%, rgba(0,0,0,.04) 74%, rgba(0,0,0,0) 100%)",
            }}
          />

          {/* Overdue overprint. Behind the body copy — an overprint that hides
              the document defeats the joke. */}
          {overdue && !paid ? (
            <div
              aria-hidden
              style={{
                position: "absolute", inset: 0, zIndex: 1, display: "flex",
                alignItems: "center", justifyContent: "center", pointerEvents: "none", overflow: "hidden",
              }}
            >
              <span
                style={{
                  fontFamily: CH.serif, fontSize: 58, fontWeight: 700, letterSpacing: 8,
                  color: CH.red, opacity: 0.13, whiteSpace: "nowrap", transform: "rotate(-24deg)",
                }}
              >
                PERIOD EXPIRED
              </span>
            </div>
          ) : null}

          <div style={{ position: "relative", zIndex: 2, padding: "18px 20px 16px" }}>
            {/* ── Header band. Sits 1px left of the body — the sheet went
                through the feeder very slightly crooked. ─────────────────── */}
            <header style={{ marginLeft: -1, textAlign: "center" }}>
              <AuthoritySeal size={56} />
              <div
                style={{
                  fontFamily: CH.serif, fontSize: 13.5, fontWeight: 700, letterSpacing: 3.2,
                  textTransform: "uppercase", marginTop: 7, lineHeight: 1.25,
                }}
              >
                {data.authority.name}
              </div>
              <div
                style={{
                  fontFamily: CH.serif, fontSize: 8.2, letterSpacing: 2.4,
                  textTransform: "uppercase", marginTop: 3, color: "#2a2a2a", lineHeight: 1.4,
                }}
              >
                {data.authority.department} &middot; {data.authority.state}
              </div>
              <div
                style={{
                  fontFamily: CH.deva, fontSize: 9.5, letterSpacing: 0.6,
                  marginTop: 4, color: "#333333", lineHeight: 1.5,
                }}
              >
                {data.authority.motto}
              </div>

              <div style={{ height: 2.5, background: CH.edge, margin: "9px 0 8px" }} />

              <div
                style={{
                  fontFamily: CH.serif, fontSize: 14, fontWeight: 700, letterSpacing: 5.5,
                  textTransform: "uppercase", textDecoration: "underline",
                  textUnderlineOffset: 3, lineHeight: 1.2,
                }}
              >
                E-Challan
              </div>
            </header>

            <div style={{ marginTop: 9, textAlign: "right", lineHeight: 1.6 }}>
              <div style={{ fontFamily: CH.serif, fontSize: 9.5 }}>
                Challan No:{" "}
                <span style={{ fontFamily: CH.mono, fontSize: 10.5, letterSpacing: 0.6 }}>
                  <ChallanNumber value={data.challanNo} />
                </span>
              </div>
              <div style={{ fontFamily: CH.serif, fontSize: 9.5 }}>
                Date:{" "}
                <span style={{ fontFamily: CH.mono, fontSize: 10.5, letterSpacing: 0.6 }}>
                  {chDate(data.issuedAt)}
                </span>
              </div>
            </div>

            <div style={{ height: 1, background: CH.edge, margin: "9px 0 12px" }} />

            {/* ── Evidence ─────────────────────────────────────────────────── */}
            <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <EvidenceBox evidence={data.evidence} />
              <div style={{ flex: 1, minWidth: 0, paddingTop: 2 }}>
                <div
                  style={{
                    fontFamily: CH.serif, fontSize: 7.4, letterSpacing: 2,
                    textTransform: "uppercase", borderBottom: `1px solid ${CH.edge}`,
                    paddingBottom: 3, marginBottom: 6,
                  }}
                >
                  Photographic Evidence
                </div>
                <div style={{ fontFamily: CH.serif, fontSize: 9, lineHeight: 1.55, color: "#2b2b2b" }}>
                  Frame captured by an unattended enforcement camera and retained on record.
                  The party concerned is not required to agree with it.
                </div>
                <div style={{ marginTop: 8, display: "flex", alignItems: "baseline" }}>
                  <span style={{ fontFamily: CH.serif, fontSize: 8.4 }}>Cam</span>
                  <span aria-hidden style={CH_LEADER} />
                  <span style={{ fontFamily: CH.mono, fontSize: 9 }}>{data.officer.id}</span>
                </div>
                <div style={{ display: "flex", alignItems: "baseline", marginTop: 3 }}>
                  <span style={{ fontFamily: CH.serif, fontSize: 8.4 }}>Frames</span>
                  <span aria-hidden style={CH_LEADER} />
                  <span style={{ fontFamily: CH.mono, fontSize: 9 }}>01 / 01</span>
                </div>
              </div>
            </div>

            {/* ── Details ──────────────────────────────────────────────────── */}
            <div style={{ marginTop: 13, border: `1px solid ${CH.edge}` }}>
              <DetailRow
                first
                band={false}
                label="Name of Owner"
                value={data.accused.name}
                sub={data.accused.address}
              />
              <DetailRow first={false} band label="Vehicle No" value={data.accused.vehicleNo} />
              <DetailRow first={false} band={false} label="Place of Offence" value={data.location} />
              <DetailRow first={false} band label="Date & Time" value={chDateTime(data.issuedAt)} />
              <DetailRow first={false} band={false} label="Detected By" value={`${data.officer.name} (${data.officer.id})`} />
              <DetailRow first={false} band label="Designation" value={data.officer.post} />
            </div>

            {/* ── Offences ─────────────────────────────────────────────────── */}
            <div style={{ marginTop: 13, border: `1px solid ${CH.edge}` }}>
              <div style={{ display: "flex", background: CH.head }}>
                {(["S.No", "Section", "Offence", "Fine"] as const).map((h, i) => (
                  <div
                    key={h}
                    style={{
                      width: OFFENCE_COLS[i],
                      flex: "none",
                      padding: "4px 6px",
                      borderRight: i === 3 ? "none" : `1px solid ${CH.edge}`,
                      fontFamily: CH.serif,
                      fontSize: 8.4,
                      fontWeight: 700,
                      letterSpacing: 1.4,
                      textTransform: "uppercase",
                      textAlign: i === 3 ? "right" : i === 0 ? "center" : "left",
                    }}
                  >
                    {h}
                  </div>
                ))}
              </div>

              {data.offences.map((o, i) => (
                <OffenceRow key={`${o.section}-${i}`} n={i + 1} o={o} band={i % 2 === 1} />
              ))}

              {/* TOTAL. `totalFine` is FREE TEXT and is printed exactly as
                  given — never summed from the column above it, never parsed,
                  never given a currency symbol it did not ask for. */}
              <div style={{ display: "flex", borderTop: `2px solid ${CH.edge}`, background: CH.head }}>
                <div
                  style={{
                    width: "78%", // S.No + Section + Offence
                    flex: "none",
                    padding: "6px 7px",
                    borderRight: `1px solid ${CH.edge}`,
                    fontFamily: CH.serif,
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: 2.6,
                    textTransform: "uppercase",
                    textAlign: "right",
                  }}
                >
                  Total
                </div>
                <div
                  style={{
                    width: OFFENCE_COLS[3],
                    flex: "none",
                    padding: "6px 7px",
                    fontFamily: CH.mono,
                    fontSize: 11,
                    fontWeight: 700,
                    textAlign: "right",
                    wordBreak: "break-word",
                  }}
                >
                  {data.totalFine}
                </div>
              </div>
            </div>

            {/* ── Consequence ──────────────────────────────────────────────── */}
            <div
              style={{
                marginTop: 13,
                border: `1px solid ${CH.red}`,
                background: CH.tint,
                padding: "8px 9px",
                display: "flex",
                gap: 10,
                alignItems: "stretch",
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontFamily: CH.serif, fontSize: 8.6, fontWeight: 700, letterSpacing: 1.8,
                    textTransform: "uppercase", color: CH.red, marginBottom: 4,
                  }}
                >
                  {overdue ? "Notice of Consequence — Period Expired" : "Notice of Consequence"}
                </div>
                <div style={{ fontFamily: CH.serif, fontSize: 10, lineHeight: 1.55, color: "#3a1c1a" }}>
                  {overdue ? (
                    <>
                      This challan was not settled within the period stated. The matter has been
                      referred to the {data.authority.department}, and the fine has stood doubled
                      since the hour of expiry. Settlement is still accepted, and still preferred.
                    </>
                  ) : (
                    <>
                      This challan must be settled within the period stated. Failure to settle
                      shall cause the matter to be referred to the {data.authority.department},
                      and the fine shall stand doubled without further notice.
                    </>
                  )}
                </div>
              </div>

              <div
                style={{
                  flex: "none",
                  width: 112,
                  border: `1px solid ${CH.red}`,
                  background: "rgba(255,255,255,.6)",
                  padding: "6px 5px",
                  textAlign: "center",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    fontFamily: CH.serif, fontSize: 6.8, letterSpacing: 1.8,
                    textTransform: "uppercase", color: CH.red, marginBottom: 4,
                  }}
                >
                  {showCountdown ? "Time Remaining" : "Status"}
                </div>
                {showCountdown ? (
                  <div
                    style={{
                      fontFamily: CH.mono, fontSize: 10, fontWeight: 700, lineHeight: 1.35,
                      color: CH.red, wordBreak: "break-word",
                    }}
                  >
                    <span aria-hidden className={`ch-live-${uid}`} style={{ marginRight: 4 }}>
                      &bull;
                    </span>
                    {safeRemaining}
                  </div>
                ) : (
                  <div
                    style={{
                      fontFamily: CH.mono, fontSize: 10, fontWeight: 700, letterSpacing: 1,
                      color: CH.red, lineHeight: 1.35,
                    }}
                  >
                    {overdue ? "PERIOD EXPIRED" : "—"}
                  </div>
                )}
              </div>
            </div>

            {/* ── Disclaimer + fine print ──────────────────────────────────── */}
            <div style={{ marginTop: 12, borderTop: `1px solid ${CH.edge}`, paddingTop: 7 }}>
              <div
                style={{
                  fontFamily: CH.serif,
                  fontSize: 9,
                  fontWeight: 700,
                  lineHeight: 1.5,
                  letterSpacing: 0.2,
                  color: CH.ink,
                }}
              >
                {CHALLAN_DISCLAIMER}
              </div>
              <div
                style={{
                  fontFamily: CH.serif,
                  fontSize: 6.5,
                  lineHeight: 1.6,
                  letterSpacing: 0.1,
                  color: "#3d3d3d",
                  marginTop: 4,
                  textAlign: "justify",
                }}
              >
                {finePrint}
              </div>
            </div>

            {/* ── Actions ─────────────────────────────────────────────────── */}
            <div style={{ display: "flex", gap: 9, marginTop: 13 }}>
              <button
                type="button"
                onClick={onPay}
                disabled={paid}
                style={{
                  flex: 1,
                  minHeight: CH.btnH,
                  border: `1px solid ${CH.green}`,
                  borderRadius: 0,
                  background: CH.green,
                  color: CH.paper,
                  fontFamily: CH.mono,
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: 1.6,
                  cursor: paid ? "default" : "pointer",
                  opacity: paid ? 0.45 : 1,
                  boxShadow: "none",
                }}
              >
                [ PAY NOW ]
              </button>
              <button
                type="button"
                onClick={onContest}
                disabled={paid}
                style={{
                  flex: 1,
                  minHeight: CH.btnH,
                  border: `1px solid ${CH.edge}`,
                  borderRadius: 0,
                  background: "transparent",
                  color: CH.ink,
                  fontFamily: CH.mono,
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: 1.6,
                  cursor: paid ? "default" : "pointer",
                  opacity: paid ? 0.45 : 1,
                  boxShadow: "none",
                }}
              >
                [ CONTEST THIS ]
              </button>
            </div>
          </div>

          {/* ── PAID stamp ───────────────────────────────────────────────────
              Over everything, struck crooked, in the one green. */}
          {paid ? (
            <div
              aria-label="Paid"
              role="img"
              style={{
                position: "absolute", inset: 0, zIndex: 6, display: "flex",
                alignItems: "center", justifyContent: "center", pointerEvents: "none",
              }}
            >
              <div
                style={{
                  border: `3px solid ${CH.green}`,
                  outline: `1px solid ${CH.green}`,
                  outlineOffset: 3,
                  padding: "8px 26px 10px",
                  transform: "rotate(-13deg)",
                  opacity: 0.82,
                  background: "rgba(253,251,246,.35)",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontFamily: CH.serif, fontSize: 44, fontWeight: 700, letterSpacing: 9,
                    color: CH.green, lineHeight: 1,
                  }}
                >
                  PAID
                </div>
                <div
                  style={{
                    fontFamily: CH.mono, fontSize: 9, letterSpacing: 2.6,
                    color: CH.green, marginTop: 5,
                  }}
                >
                  SETTLED IN FULL
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default ChallanNotice;
