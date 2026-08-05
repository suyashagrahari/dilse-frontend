"use client";

// ─── The artifact ────────────────────────────────────────────────────────────
// This component is the node handed to html-to-image. Everything in here is
// paper. Nothing animated-for-the-web, nothing with a border radius, nothing
// with a shadow, and above all no <video> — paper cannot play a GIF, and the
// moment it does the whole thing stops reading as a scanned document.
//
// It renders at a FIXED width (DOC_W) and is scaled by a transform on a wrapper
// in LegalNotice.tsx. Never add a breakpoint in this file.

import { memo } from "react";
import {
  type NoticeData,
  type Demand,
  complianceSummary,
  escalatedClause,
  fmtDate,
  formatRemaining,
  hashRef,
  normalizeRecital,
  numeralize,
  serialFromRef,
} from "./types";

/** The document's design width in CSS pixels. Everything else is a scale of this. */
export const DOC_W = 480;

const SERIF = "var(--font-tinos), 'Times New Roman', Times, serif";
const TYPE = "var(--font-courier-prime), 'Courier New', Courier, monospace";
const INK = "#141414";
const RED = "#b02020";
const BAND = "#e8eef2";
const PAPER = "#fdfcf8";

export type RespondFn = (demandId: string, patch: Partial<Pick<Demand, "response" | "grounds" | "complied">>) => void;

interface Props {
  data: NoticeData;
  /** `null` before mount. Keeps SSR and hydration in agreement and stops the
   *  FINAL state firing on the server with a different clock. */
  nowMs: number | null;
  /** Demand ids whose mark should stroke-draw. Only ids that changed this session. */
  drawing: Set<string>;
  /** Omitted on the gallery card / export → no in-document affordances at all. */
  onRespond?: RespondFn;
  /**
   * True for the one frame the PNG is captured on. A printed copy of a notice
   * does not have ACCEPT and CONTEST buttons on it; leaving them in the export
   * is the single fastest way to make the artifact read as a web page.
   */
  exporting?: boolean;
}

/* ── The two marks ────────────────────────────────────────────────────────── */

/**
 * A hand-drawn ink tick, not a Unicode check. Deliberately overshoots the box on
 * both ends — the entry stroke starts to the left of the frame and the exit
 * stroke runs past the top-right corner, the way a pen does when someone is
 * ticking a form quickly. A glyph centred inside the box reads as a UI checkbox.
 */
function InkTick({ heavy, draw }: { heavy?: boolean; draw?: boolean }) {
  return (
    <svg
      className={`ln-tick${draw ? " ln-draw" : ""}`}
      width={28}
      height={26}
      viewBox="0 0 28 26"
      fill="none"
      aria-hidden
      style={{ position: "absolute", left: -7, top: -7, pointerEvents: "none", overflow: "visible" }}
    >
      <path
        pathLength={100}
        d="M2.4 12.1 C4.9 13.6 7.2 16.4 9.6 20.3 C13.1 12.4 18.4 5.2 25.6 0.9"
        stroke={INK}
        strokeWidth={heavy ? 2.6 : 1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {heavy && (
        /* The second, heavier pass — a compliance tick is struck twice. */
        <path
          pathLength={100}
          d="M3.6 10.9 C5.9 12.9 8.1 15.6 10.4 19.4 C13.9 11.9 19.2 4.6 26.4 0.2"
          stroke={INK}
          strokeWidth={1.5}
          strokeLinecap="round"
          opacity={0.62}
        />
      )}
    </svg>
  );
}

/* ── Stamp-paper band ─────────────────────────────────────────────────────── */

function StampBand({ refNo, uid }: { refNo: string; uid: string }) {
  return (
    <div
      style={{
        position: "relative",
        background: BAND,
        borderBottom: `3px solid ${INK}`,
        padding: "13px 18px 0",
        height: 128,
        overflow: "hidden",
        zIndex: 2,
      }}
    >
      {/* Guilloche ground. Generated, never an image asset. */}
      <svg
        aria-hidden
        width="100%"
        height="100%"
        preserveAspectRatio="none"
        style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      >
        <defs>
          <pattern id={`ln-guil-${uid}`} width={38} height={38} patternUnits="userSpaceOnUse">
            <path d="M-19 19a19 19 0 0 1 38 0M-19 19a26 26 0 0 1 38 0M-19 19a13 13 0 0 1 38 0M19 19a19 19 0 0 1 38 0"
              fill="none" stroke="#4d7089" strokeWidth={0.45} />
            <path d="M0 0a19 19 0 0 0 38 0M0 38a19 19 0 0 0 38 0"
              fill="none" stroke="#4d7089" strokeWidth={0.35} />
          </pattern>
          <filter id={`ln-band-grain-${uid}`}>
            <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={4} />
            <feColorMatrix type="saturate" values="0" />
          </filter>
        </defs>
        <rect width="100%" height="100%" fill={`url(#ln-guil-${uid})`} opacity={0.3} />
        <rect width="100%" height="100%" filter={`url(#ln-band-grain-${uid})`} opacity={0.05} />
      </svg>

      <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        {/* Issuing authority. Invented — "REPUBLIC OF US". */}
        <div style={{ border: `1px solid ${INK}`, padding: "7px 11px 6px", background: "rgba(255,255,255,.28)" }}>
          <div style={{ fontFamily: SERIF, fontSize: 13, letterSpacing: 2.4, fontWeight: 700, color: INK, lineHeight: 1.15 }}>
            REPUBLIC OF US
          </div>
          <div style={{ fontFamily: SERIF, fontSize: 8.5, letterSpacing: 3.4, color: "#2c4152", marginTop: 3 }}>
            NON-JUDICIAL
          </div>
        </div>

        {/* Denomination. */}
        <div style={{ border: `1px solid ${INK}`, padding: "5px 9px 4px", textAlign: "center", background: "rgba(255,255,255,.28)" }}>
          <div style={{ fontFamily: SERIF, fontSize: 20, fontWeight: 700, color: INK, lineHeight: 1 }}>₹100</div>
          <div style={{ fontFamily: SERIF, fontSize: 5.6, letterSpacing: 1.5, color: "#2c4152", marginTop: 3 }}>
            ONE HUNDRED RUPEES
          </div>
        </div>
      </div>

      <div
        style={{
          position: "relative",
          fontFamily: SERIF, fontSize: 6.8, letterSpacing: 1.9, color: "#2c4152",
          marginTop: 12, textAlign: "center", whiteSpace: "nowrap",
        }}
      >
        IN THE MATTER OF ONE (1) RELATIONSHIP · ISSUED UNDER THE AFFECTIONS ACT
      </div>

      {/* Serial digits, derived from the ref no. so the same notice always carries
          the same serial — a random one changes on every render and looks fake. */}
      <div
        style={{
          position: "absolute", left: 18, right: 18, bottom: 6,
          fontFamily: TYPE, fontSize: 7, letterSpacing: 2.2, color: "#33505f",
          display: "flex", justifyContent: "space-between",
        }}
      >
        <span>{serialFromRef(refNo)}</span>
        <span>{serialFromRef(refNo.split("").reverse().join(""))}</span>
      </div>
    </div>
  );
}

/* ── Advocate's stamp — two overlapping hearts in a double ring ───────────── */

const HEART =
  "M12 20.4s-6.1-4.1-8.5-7.1C1.1 10.2 2.5 6 6.3 6c1.9 0 3.3 1.1 5.7 3.8C14.4 7.1 15.8 6 17.7 6c3.8 0 5.2 4.2 2.8 7.3-2.4 3-8.5 7.1-8.5 7.1z";

function AdvocateStamp({ uid, advocate }: { uid: string; advocate: string }) {
  return (
    <svg
      width={94}
      height={94}
      viewBox="0 0 94 94"
      aria-hidden
      /* Left of the sign-off and riding up over the signature rule — where a
         clerk actually lands the stamp, half on the line and half off it. */
      style={{ position: "absolute", left: 196, bottom: 14, opacity: 0.72, transform: "rotate(-5deg)", pointerEvents: "none" }}
    >
      <defs>
        {/* Uneven ink density — heavier on the upper-left edge, the way a rubber
            stamp lands when a hand presses it at a slight angle. */}
        <radialGradient id={`ln-ink-${uid}`} cx="0.34" cy="0.3" r="0.88">
          <stop offset="0%" stopColor="#fff" stopOpacity="1" />
          <stop offset="55%" stopColor="#fff" stopOpacity="0.92" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0.5" />
        </radialGradient>
        <mask id={`ln-inkmask-${uid}`}>
          <rect width="94" height="94" fill={`url(#ln-ink-${uid})`} />
        </mask>
        <filter id={`ln-wobble-${uid}`} x="-15%" y="-15%" width="130%" height="130%">
          <feTurbulence type="fractalNoise" baseFrequency="0.62" numOctaves={2} seed={11} result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="1.15" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <path id={`ln-arc-${uid}`} d="M11 49A36 36 0 0 1 83 49" fill="none" />
        <path id={`ln-arc2-${uid}`} d="M15 47A32 32 0 0 0 79 47" fill="none" />
      </defs>

      <g mask={`url(#ln-inkmask-${uid})`} filter={`url(#ln-wobble-${uid})`} fill="none" stroke={RED}>
        <circle cx="47" cy="47" r="45" strokeWidth="2.1" />
        <circle cx="47" cy="47" r="38.5" strokeWidth="1.1" />
        {/* Two overlapping hearts. */}
        <g transform="translate(30.5 33) scale(1.02)">
          <path d={HEART} strokeWidth="1.5" />
        </g>
        <g transform="translate(38.5 33) scale(1.02)">
          <path d={HEART} strokeWidth="1.5" />
        </g>
        <text fill={RED} stroke="none" fontFamily={SERIF} fontSize="7.2" letterSpacing="1.6" fontWeight={700}>
          <textPath href={`#ln-arc-${uid}`} startOffset="50%" textAnchor="middle">
            REPUBLIC OF US
          </textPath>
        </text>
        <text fill={RED} stroke="none" fontFamily={SERIF} fontSize="6" letterSpacing="1.3">
          <textPath href={`#ln-arc2-${uid}`} startOffset="50%" textAnchor="middle">
            {advocate.slice(0, 22).toUpperCase()} · ADVOCATE
          </textPath>
        </text>
      </g>
    </svg>
  );
}

/* ── Demands ──────────────────────────────────────────────────────────────── */

function DemandRow({
  demand, index, draw, onRespond, isFinal, exporting,
}: {
  demand: Demand; index: number; draw: boolean; onRespond?: RespondFn; isFinal: boolean; exporting: boolean;
}) {
  const accepted = demand.response === "accepted";
  const contested = demand.response === "contested";

  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 7, marginBottom: 9 }}>
      {/* The box. Nobody looks at one without wanting to tick it. */}
      <span
        style={{
          position: "relative", flex: "0 0 auto", width: 13, height: 13,
          border: `1px solid ${INK}`, marginTop: 2.5, background: "transparent",
        }}
      >
        {accepted && <InkTick draw={draw} heavy={demand.complied} />}
      </span>

      <span style={{ flex: "0 0 auto", fontFamily: TYPE, fontSize: 10.5, color: INK, width: 17, marginTop: 1 }}>
        {index + 1}.
      </span>

      <span style={{ flex: "1 1 auto", minWidth: 0 }}>
        {/* The rule through a contested demand is painted as a background
            gradient rather than an absolutely-positioned bar: a 60-character
            demand wraps, and an absolute bar inside an inline box only ever
            covers the first line fragment. `box-decoration-break: clone` (in
            MARK_CSS) is what makes every wrapped line get struck. */}
        <span
          className={contested ? `ln-struck${draw ? " ln-draw" : ""}` : undefined}
          style={{
            fontFamily: TYPE, fontSize: 10.5, lineHeight: 1.55, color: INK,
            opacity: contested ? 0.68 : 1,
          }}
        >
          {demand.text}
        </span>
        {contested && (
          <span style={{ display: "block", fontFamily: SERIF, fontStyle: "italic", fontSize: 9, color: RED, marginTop: 2 }}>
            Grounds: {demand.grounds.trim() || "not stated"}
          </span>
        )}
      </span>

      {/* Right margin: the rubber stamp, or the affordance while pending. */}
      <span style={{ flex: "0 0 auto", width: 74, textAlign: "right", paddingTop: 1 }}>
        {accepted && (
          <span style={{ display: "inline-block", transform: "rotate(-2deg)" }}>
            <span style={{ fontFamily: SERIF, fontSize: 7.4, letterSpacing: 1.5, fontWeight: 700, color: RED, display: "block" }}>
              ACCEPTED
            </span>
            {demand.complied && (
              <span style={{ fontFamily: TYPE, fontSize: 6.4, letterSpacing: 0.6, color: RED, display: "block", marginTop: 1 }}>
                COMPLIED {fmtDate(demand.compliedOn)}
              </span>
            )}
          </span>
        )}
        {contested && (
          <span style={{ display: "inline-block", transform: "rotate(-2deg)", fontFamily: SERIF, fontSize: 7.4, letterSpacing: 1.5, fontWeight: 700, color: RED }}>
            CONTESTED
          </span>
        )}
        {demand.response === "pending" && onRespond && !exporting && (
          <span style={{ display: "inline-flex", flexDirection: "column", gap: 2, alignItems: "flex-end" }}>
            <button
              type="button"
              onClick={() => onRespond(demand.id, { response: "accepted" })}
              style={{
                fontFamily: TYPE, fontSize: 6.6, letterSpacing: 1, color: INK,
                border: `1px solid ${INK}`, padding: "1.5px 5px", background: "transparent", cursor: "pointer",
              }}
            >
              ACCEPT
            </button>
            <button
              type="button"
              onClick={() => onRespond(demand.id, { response: "contested" })}
              style={{
                fontFamily: TYPE, fontSize: 6.6, letterSpacing: 1, color: INK,
                border: `1px solid ${INK}`, padding: "1.5px 5px", background: "transparent", cursor: "pointer",
              }}
            >
              CONTEST
            </button>
          </span>
        )}
        {demand.response === "pending" && !onRespond && isFinal && (
          <span style={{ fontFamily: SERIF, fontSize: 7, letterSpacing: 1.2, color: RED }}>NO REPLY</span>
        )}
      </span>
    </div>
  );
}

/* ── The page ─────────────────────────────────────────────────────────────── */

function NoticePaperInner({ data, nowMs, drawing, onRespond, exporting = false }: Props) {
  const uid = String(hashRef(data.refNo || "LN") % 100000);
  const isFinal =
    nowMs !== null &&
    !!data.complianceDeadline &&
    nowMs > Date.parse(data.complianceDeadline) &&
    !(data.demands.length > 0 &&
      data.demands.every((d) => d.response === "contested" || (d.response === "accepted" && d.complied)));

  const sum = complianceSummary(data.demands);
  const remaining = formatRemaining(data.complianceDeadline, nowMs);
  /** One recital's numeral sits a pixel low. Deterministic, so the same notice is
   *  always imperfect in the same place. */
  const lowIdx = data.recitals.length ? hashRef(data.refNo || "LN") % data.recitals.length : -1;

  const dated = fmtDate(data.datedOn);
  const since = fmtDate(data.relationshipSince);

  const para: React.CSSProperties = {
    fontFamily: SERIF, fontSize: 11.5, lineHeight: 1.7, color: INK,
    textAlign: "justify", hyphens: "none", margin: 0,
  };

  return (
    <div
      style={{
        width: DOC_W, background: PAPER, color: INK,
        position: "relative", overflow: "hidden",
        border: "1px solid #d8d4c8",
      }}
    >
      {/* Two staple holes, punched through the top-left corner. */}
      <span aria-hidden style={{ position: "absolute", left: 15, top: 12, width: 3, height: 3, borderRadius: "50%", background: "radial-gradient(circle, #6c6c6c 40%, rgba(0,0,0,.25) 100%)", zIndex: 4 }} />
      <span aria-hidden style={{ position: "absolute", left: 15, top: 24, width: 3, height: 3, borderRadius: "50%", background: "radial-gradient(circle, #6c6c6c 40%, rgba(0,0,0,.25) 100%)", zIndex: 4 }} />

      <StampBand refNo={data.refNo} uid={uid} />

      {/* FINAL NOTICE overprint. Sits behind the body copy so the text stays
          readable — an overprint that hides the document defeats the joke. */}
      {isFinal && (
        <div
          aria-hidden
          style={{
            position: "absolute", inset: 0, zIndex: 1,
            display: "flex", alignItems: "center", justifyContent: "center",
            pointerEvents: "none", overflow: "hidden",
          }}
        >
          <span
            style={{
              fontFamily: SERIF, fontSize: 74, fontWeight: 700, letterSpacing: 12,
              color: RED, opacity: 0.16, whiteSpace: "nowrap",
              transform: "rotate(-22deg)",
            }}
          >
            FINAL NOTICE
          </span>
        </div>
      )}

      {/* A faint toner streak across the lower third. Feathered at both ends —
          a hard-edged 2px rule reads as a seam in the layout, not as a flaw in
          the printing, which is the opposite of the intended effect. */}
      <span
        aria-hidden
        style={{
          position: "absolute", left: 0, right: 0, top: "71%", height: 2, zIndex: 3, pointerEvents: "none",
          background: "linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(0,0,0,.05) 18%, rgba(0,0,0,.035) 62%, rgba(0,0,0,0) 100%)",
        }}
      />

      {/* Red FINAL box, stamped over the header. */}
      {isFinal && (
        <span
          aria-hidden
          style={{
            position: "absolute", right: 20, top: 74, zIndex: 5,
            border: `2px solid ${RED}`, color: RED, padding: "2px 9px",
            fontFamily: SERIF, fontSize: 12, fontWeight: 700, letterSpacing: 3,
            transform: "rotate(4deg)", opacity: 0.85, background: "rgba(253,252,248,.55)",
          }}
        >
          FINAL
        </span>
      )}

      <div style={{ position: "relative", zIndex: 2, padding: "22px 34px 16px" }}>
        {/* Letterhead. */}
        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: SERIF, fontSize: 14, fontWeight: 700, letterSpacing: 0.6, color: INK }}>
            {data.advocateName || "—"}, Advocate
          </div>
          <div style={{ fontFamily: SERIF, fontSize: 9.2, color: "#3b3b3b", marginTop: 2 }}>
            {data.advocateChamber}
          </div>
          <div style={{ fontFamily: TYPE, fontSize: 8.4, color: "#3b3b3b", marginTop: 2, letterSpacing: 0.3 }}>
            Enrolment No. {data.advocateEnrollment}
          </div>
        </div>
        <div style={{ height: 1, background: "#4a4a4a", marginTop: 9 }} />

        {/*
          Everything below sits one pixel to the right of the letterhead. Real
          two-pass printing never registers perfectly, and this is the cheapest
          tell that the page was run through a machine rather than laid out.
        */}
        <div style={{ marginLeft: 1 }}>
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
            <div style={{ textAlign: "right", fontFamily: TYPE, fontSize: 8.8, lineHeight: 1.65, color: INK }}>
              <div>Ref. No. {data.refNo}</div>
              <div>Dated: {dated || "—"}</div>
            </div>
          </div>

          <div style={{ marginTop: 6 }}>
            <div style={{ fontFamily: SERIF, fontSize: 9.6, fontWeight: 700, letterSpacing: 1.1, textDecoration: "underline", textUnderlineOffset: 2 }}>
              WITHOUT PREJUDICE
            </div>
            <div style={{ fontFamily: SERIF, fontSize: 9, fontStyle: "italic", color: "#3b3b3b", marginTop: 1 }}>
              By WhatsApp &amp; Registered Post
            </div>
          </div>

          <div style={{ marginTop: 11 }}>
            <div style={{ fontFamily: SERIF, fontSize: 11, color: INK }}>To,</div>
            <div style={{ marginLeft: 22, marginTop: 2, fontFamily: TYPE, fontSize: 10, lineHeight: 1.62, color: INK, wordBreak: "break-word" }}>
              <div>{data.addresseeName || "—"}</div>
              {data.addresseeCity && <div>{data.addresseeCity}</div>}
            </div>
          </div>

          <div style={{ textAlign: "center", marginTop: 15 }}>
            <span style={{ fontFamily: SERIF, fontSize: 13, fontWeight: 700, letterSpacing: 5, textDecoration: "underline", textUnderlineOffset: 4 }}>
              LEGAL NOTICE
            </span>
          </div>

          <div style={{ fontFamily: SERIF, fontSize: 11, marginTop: 14 }}>Madam/Sir,</div>

          <p style={{ ...para, marginTop: 7 }}>
            Under instructions from and on behalf of my client,{" "}
            <span style={{ fontFamily: TYPE, fontSize: 10.4 }}>{data.senderName || "—"}</span>
            {data.senderCity && (
              <>
                {" "}of <span style={{ fontFamily: TYPE, fontSize: 10.4 }}>{data.senderCity}</span>
              </>
            )}
            , I hereby serve upon you the following notice in the matter of the relationship
            subsisting between the parties since{" "}
            <span style={{ fontFamily: TYPE, fontSize: 10.4 }}>{since || "—"}</span>:
          </p>

          {/* Numbered recitals. Hanging indent, justified, every one opening with
              "That " — this construction IS the realism. */}
          <div style={{ marginTop: 11 }}>
            {data.recitals.map((r, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", marginBottom: 7 }}>
                <span
                  style={{
                    flex: "0 0 auto", width: 24, fontFamily: SERIF, fontSize: 11.5, lineHeight: 1.7,
                    position: "relative", top: i === lowIdx ? 1 : 0,
                  }}
                >
                  {i + 1}.
                </span>
                {/* Normalised at render, not just on the wire: the editor preview
                    renders straight from local form state, and a recital that
                    does not open with "That " breaks the one construction the
                    whole document rests on. */}
                <p style={{ ...para, flex: "1 1 auto", minWidth: 0 }}>{numeralize(normalizeRecital(r))}</p>
              </div>
            ))}
          </div>

          <p style={{ ...para, marginTop: 11 }}>
            NOW THEREFORE, TAKE NOTICE that you are hereby called upon to comply with the following
            within a period of seven (7) days from the date of receipt hereof:
          </p>

          {/* Live compliance strip. */}
          <div
            style={{
              marginTop: 12, borderTop: `1px solid ${INK}`, borderBottom: `1px solid ${INK}`,
              padding: "4px 0", display: "flex", flexWrap: "wrap", gap: 6,
              fontFamily: TYPE, fontSize: 8, letterSpacing: 0.6, color: INK,
            }}
          >
            <span style={{ fontWeight: 700 }}>COMPLIANCE STATUS:</span>
            <span>{sum.satisfied} of {sum.satisfiable} satisfied</span>
            {sum.contested > 0 && <><span>·</span><span>{sum.contested} contested</span></>}
            <span>·</span>
            <span style={{ color: isFinal ? RED : INK }}>{remaining ?? "no period stipulated"}</span>
          </div>

          <div style={{ marginTop: 11 }}>
            {data.demands.map((d, i) => (
              <DemandRow
                key={d.id}
                demand={d}
                index={i}
                draw={drawing.has(d.id)}
                onRespond={onRespond}
                isFinal={isFinal}
                exporting={exporting}
              />
            ))}
            {data.demands.length === 0 && (
              <p style={{ ...para, fontStyle: "italic", color: "#555" }}>
                That no specific relief is presently pressed, my client reserving liberty to press hereafter.
              </p>
            )}
          </div>

          <p style={{ ...para, marginTop: 13 }}>
            {isFinal ? escalatedClause(data.complianceDeadline) : data.escalationClause}
          </p>

          {/* Sign-off. */}
          <div style={{ marginTop: 18, display: "flex", justifyContent: "flex-end" }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: SERIF, fontSize: 11 }}>Yours faithfully,</div>
              <div style={{ fontFamily: TYPE, fontSize: 11.5, marginTop: 14, letterSpacing: 0.4 }}>
                {data.advocateName}
              </div>
              <div style={{ width: 132, height: 1, background: INK, marginLeft: "auto", marginTop: 2 }} />
              <div style={{ fontFamily: SERIF, fontSize: 9.4, letterSpacing: 1.4, marginTop: 2 }}>Advocate</div>
            </div>
          </div>

          {/* The stamp overlaps the signature line. */}
          <div style={{ position: "relative", height: 78 }}>
            <AdvocateStamp uid={uid} advocate={data.advocateName} />
          </div>

          <div style={{ height: 1, background: "#8a8a8a", marginTop: 2 }} />
          <div
            style={{
              fontFamily: SERIF, fontSize: 6.5, lineHeight: 1.45, color: "#3f3f3f",
              marginTop: 5, textAlign: "justify", hyphens: "none",
            }}
          >
            {data.finePrint.join(" · ")}
          </div>
          <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 7, color: "#5a5a5a", marginTop: 6 }}>
            Copy kept in office for record.
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(NoticePaperInner);
