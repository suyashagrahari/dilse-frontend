"use client";

import { forwardRef } from "react";
import Seal from "./Seal";
import {
  type CertificateData,
  inkRotation,
  padWitnesses,
  splitRegisteredOn,
} from "./types";

/**
 * The certificate itself — a pure, fixed-size document node.
 *
 * NOTHING animated, no video, no brand chrome lives in here: this exact node is
 * what `html-to-image` captures, and paper cannot play a GIF. Everything that
 * moves belongs to the surrounding page.
 *
 * It renders at a FIXED 432×576 (3:4) and is scaled by a transform on the
 * caller's wrapper, so it is pixel-identical at every viewport. 432×576 maps
 * exactly onto the 1080×1440 export (canvasWidth 360 × pixelRatio 3).
 */
export const DOC_W = 432;
export const DOC_H = 576;

// ─── Paper ───────────────────────────────────────────────────────────────────
// Fibre texture is generated inline — deliberately not an image file, so the
// page ships no extra request and the export never races an asset load.
const FIBRE = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  "<svg xmlns='http://www.w3.org/2000/svg' width='170' height='170'>" +
    "<filter id='f' x='0' y='0' width='100%' height='100%'>" +
    "<feTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/>" +
    "</filter>" +
    "<rect width='170' height='170' filter='url(#f)' opacity='0.04'/>" +
    "</svg>",
)}")`;

const INK = "#2f2c24";
const INK_SOFT = "#4c4738";
const RULE = "#6d6858";
const PEN = "#2a3a6b";

const serif: React.CSSProperties = { fontFamily: "var(--font-tinos), 'Times New Roman', Times, serif" };
const mono: React.CSSProperties = { fontFamily: "var(--font-courier-prime), 'Courier New', Courier, monospace" };
const deva: React.CSSProperties = { fontFamily: "var(--font-tiro-devanagari), var(--font-tinos), serif" };

// ─── Typed value ─────────────────────────────────────────────────────────────
/**
 * Anything a clerk would have TYPED into a pre-printed form. Courier, and a
 * sub-degree rotation derived from (certificateNo, key) — never Math.random, so
 * two consecutive renders and the export capture are byte-identical.
 */
function Typed({
  seed,
  k,
  children,
  style,
}: {
  seed: string;
  k: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <span
      style={{
        ...mono,
        display: "inline-block",
        transform: `rotate(${inkRotation(seed, k)}deg)`,
        color: INK,
        ...style,
      }}
    >
      {children}
    </span>
  );
}

/** The certificate number, with its 3rd character sitting a pixel high — a
 *  slipped typebar. The single most convincing imperfection on the whole page. */
function CertNo({ value }: { value: string }) {
  return (
    <span style={{ ...mono, display: "inline-block", transform: `rotate(${inkRotation(value, "certno")}deg)` }}>
      {Array.from(value).map((ch, i) => (
        <span
          key={i}
          style={{
            display: "inline-block",
            transform: i === 2 ? "translateY(-1px)" : undefined,
            whiteSpace: "pre",
          }}
        >
          {ch}
        </span>
      ))}
    </span>
  );
}

/** Ink on paper, not a vector: the faint blur is what sells it. */
function Ink({ d, w, h, strokeWidth = 2 }: { d: string; w: number; h: number; strokeWidth?: number }) {
  return (
    <svg viewBox="0 0 160 48" width={w} height={h} aria-hidden focusable="false" style={{ filter: "blur(0.15px)", display: "block" }}>
      <path d={d} fill="none" stroke={PEN} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** A dot-leader row. The value column is a FIXED width, so the leaders always
 *  stop at the same x no matter how long the value is. */
function LeaderRow({ label, value, seed, index, height }: { label: string; value: string; seed: string; index: number; height: number }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", height }}>
      <span style={{ ...serif, fontSize: 10.6, color: INK, whiteSpace: "nowrap", lineHeight: "14px" }}>{label}</span>
      <span
        aria-hidden
        style={{
          flex: 1,
          minWidth: 10,
          height: 4,
          marginLeft: 5,
          marginRight: 6,
          marginBottom: 2,
          backgroundImage: "radial-gradient(circle at 50% 100%, rgba(80,74,60,.85) 0.55px, rgba(0,0,0,0) 0.75px)",
          backgroundSize: "3.6px 4px",
          backgroundRepeat: "repeat-x",
          backgroundPosition: "left bottom",
        }}
      />
      <span style={{ width: 104, flexShrink: 0, lineHeight: "14px" }}>
        <Typed seed={seed} k={`field-${index}`} style={{ fontSize: 10.6 }}>
          {value}
        </Typed>
      </span>
    </div>
  );
}

function WitnessColumn({ name, path, n, seed }: { name: string; path: string; n: number; seed: string }) {
  return (
    <div style={{ width: 116, textAlign: "center" }}>
      <div style={{ height: 27, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
        {path ? <Ink d={path} w={98} h={27} strokeWidth={1.9} /> : null}
      </div>
      <div style={{ borderTop: `1px solid ${RULE}`, marginTop: 1 }} />
      <div style={{ height: 13, marginTop: 3, lineHeight: "13px", overflow: "hidden" }}>
        {name ? (
          <Typed seed={seed} k={`witness-${n}`} style={{ fontSize: 9.4, lineHeight: "13px" }}>
            {name}
          </Typed>
        ) : null}
      </div>
      <div style={{ ...serif, fontSize: 7, lineHeight: "10px", letterSpacing: 0.9, color: "#8a8272", textTransform: "uppercase", marginTop: 1 }}>
        Witness {n}
      </div>
    </div>
  );
}

// ─── The document ────────────────────────────────────────────────────────────

const Certificate = forwardRef<HTMLDivElement, { data: CertificateData }>(function Certificate({ data }, ref) {
  const seed = data.certificateNo || "RH/0000/000000";
  const { day, month, year } = splitRegisteredOn(data.registeredOn);
  const witnesses = padWitnesses(data.witnesses);
  const provisional = data.certificateState !== "registered";
  const fields = data.fields.slice(0, 6);
  // A clerk types tighter when there is more to fit on the same pre-printed form.
  const rowH = fields.length > 4 ? 15.5 : 17.5;

  return (
    <div
      ref={ref}
      style={{
        width: DOC_W,
        height: DOC_H,
        position: "relative",
        overflow: "hidden",
        background: "#faf6ed",
        border: "2px solid #b8b2a0",
        boxSizing: "border-box",
        color: INK,
        // Column flow with a spacer before the footer: the entries block can be
        // 4 or 6 rows and the body 3 or 4 lines, and the footer still sits on
        // the bottom margin instead of being run into.
        display: "flex",
        flexDirection: "column",
        padding: "22px 26px 17px",
        // A scan is never evenly lit — one side always falls off.
        backgroundImage: `linear-gradient(101deg, rgba(70,58,32,.055) 0%, rgba(70,58,32,0) 34%, rgba(70,58,32,0) 74%, rgba(70,58,32,.038) 100%), ${FIBRE}`,
      }}
    >
      {/* inner rule, inset 6px from the outer border */}
      <div style={{ position: "absolute", inset: 6, border: "1px solid #cdc6b3", pointerEvents: "none" }} />

      {/* two staple punctures, top-left */}
      {[20, 31].map((top) => (
        <div
          key={top}
          style={{
            position: "absolute",
            left: 15,
            top,
            width: 3,
            height: 3,
            borderRadius: "50%",
            background: "radial-gradient(circle at 50% 40%, #302b20 0%, #6d6555 60%, rgba(0,0,0,0) 78%)",
            boxShadow: "0 1px 1.5px rgba(40,34,22,.22)",
          }}
        />
      ))}

      {/* ── Upper block ─────────────────────────────────────────────────── */}
      <div style={{ position: "relative", zIndex: 2 }}>
        <div style={{ position: "relative", minHeight: 98, flexShrink: 0 }}>
          {/* masthead */}
          <div style={{ width: 282 }}>
            <div style={{ ...serif, fontSize: 10, letterSpacing: 2, fontWeight: 700, color: INK }}>✦ REPUBLIC OF US</div>
            <div style={{ ...serif, fontSize: 8.6, fontStyle: "italic", letterSpacing: 0.3, color: INK_SOFT, marginTop: 1 }}>
              Office of the Registrar of Hearts
            </div>
            <div style={{ ...serif, fontSize: 16, fontWeight: 700, letterSpacing: 1.4, marginTop: 9, lineHeight: 1.15 }}>
              CERTIFICATE OF MARRIAGE
            </div>
            <div style={{ ...deva, fontSize: 11.5, color: INK_SOFT, marginTop: 1, lineHeight: 1.35 }}>विवाह प्रमाण पत्र</div>
          </div>

          {/* photo + the seal that bites its bottom-left corner */}
          <div style={{ position: "absolute", right: 0, top: 0, width: 84, height: 96 }}>
            {data.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={data.photoUrl}
                alt="Photograph affixed to the certificate"
                width={84}
                height={96}
                style={{
                  width: 84,
                  height: 96,
                  objectFit: "cover",
                  display: "block",
                  border: "1px solid #9c9584",
                  filter: "sepia(0.12) contrast(1.05) saturate(0.86)",
                }}
              />
            ) : (
              <div
                style={{
                  width: 84,
                  height: 96,
                  border: "1px solid #9c9584",
                  background: "repeating-linear-gradient(135deg, rgba(120,112,92,.05) 0 5px, rgba(120,112,92,0) 5px 10px)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  boxSizing: "border-box",
                  padding: 6,
                }}
              >
                <span style={{ ...serif, fontSize: 7.2, letterSpacing: 0.7, color: "#8f8877", textTransform: "uppercase", lineHeight: 1.5 }}>
                  Affix joint
                  <br />
                  photograph
                </span>
              </div>
            )}

            {/*
              THE detail. The 72px impression is centred 13px inside the photo's
              bottom-left corner on both axes (left −23, top 96−13−36 = 47), so
              roughly 45% of it lands on the photograph and the rest on the
              paper. That is the Indian anti-tamper convention, and it is what
              makes a screenshot read as scanned rather than designed.
            */}
            <Seal
              uid="photo"
              size={72}
              rotate={-4}
              opacity={0.72}
              noiseSeed={7}
              inkCenter={{ x: 32, y: 28 }}
              style={{ position: "absolute", left: -23, top: 47, zIndex: 3 }}
            />
          </div>
        </div>

        {/* certificate number */}
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 6 }}>
          <span style={{ ...serif, fontSize: 9, letterSpacing: 1, textTransform: "uppercase", color: INK_SOFT }}>
            Certificate No.
          </span>
          <span style={{ fontSize: 10.5 }}>
            <CertNo value={seed} />
          </span>
        </div>

        {/* full-width rule (a heavy line over a hairline — the printer's default) */}
        <div style={{ marginTop: 7, borderTop: `1.3px solid ${RULE}` }} />
        <div style={{ marginTop: 1.5, borderTop: "0.5px solid rgba(109,104,88,.55)" }} />

        {/* body */}
        <p
          style={{
            ...serif,
            fontSize: 12.4,
            lineHeight: 1.72,
            textAlign: "justify",
            margin: "10px 0 0",
            color: INK,
            hyphens: "auto",
          }}
        >
          I hereby certify that{" "}
          <Typed seed={seed} k="partyA" style={{ fontSize: 11.6, letterSpacing: 0.2 }}>
            {(data.partyA.name || "—").toUpperCase()}
          </Typed>{" "}
          and{" "}
          <Typed seed={seed} k="partyB" style={{ fontSize: 11.6, letterSpacing: 0.2 }}>
            {(data.partyB.name || "—").toUpperCase()}
          </Typed>{" "}
          appeared before me on the{" "}
          <Typed seed={seed} k="day" style={{ fontSize: 11.6 }}>
            {day}
          </Typed>{" "}
          day of{" "}
          <Typed seed={seed} k="month" style={{ fontSize: 11.6 }}>
            {month}
          </Typed>
          ,{" "}
          <Typed seed={seed} k="year" style={{ fontSize: 11.6 }}>
            {year}
          </Typed>{" "}
          and were duly registered as each other&rsquo;s person.
        </p>

        {/* the two parties, as a form would print them */}
        <div style={{ display: "flex", gap: 18, marginTop: 7 }}>
          {[data.partyA, data.partyB].map((p, i) => (
            <div key={i} style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6, overflow: "hidden", height: 13 }}>
                <span style={{ ...serif, fontSize: 7.6, lineHeight: "12px", letterSpacing: 1.1, textTransform: "uppercase", color: "#8a8272", flexShrink: 0 }}>
                  Party {i === 0 ? "A" : "B"}
                </span>
                <Typed seed={seed} k={`party-line-${i}`} style={{ fontSize: 9.2, lineHeight: "12px", whiteSpace: "nowrap" }}>
                  {`${p.age || "—"} yrs · ${p.city || "—"}`}
                </Typed>
              </div>
              <div style={{ borderTop: "0.7px solid rgba(109,104,88,.5)" }} />
            </div>
          ))}
        </div>

        {/* dot-leader block */}
        <div style={{ marginTop: 8, paddingLeft: 6, paddingRight: 4 }}>
          {fields.map((f, i) => (
            <LeaderRow key={`${f.label}-${i}`} label={f.label} value={f.value} seed={seed} index={i} height={rowH} />
          ))}
        </div>

        {/* the clerk's margin note */}
        <div style={{ textAlign: "right", marginTop: 2, paddingRight: 4 }}>
          <span
            style={{
              ...mono,
              fontSize: 7.8,
              color: "#46578f",
              display: "inline-block",
              transform: "rotate(-1.8deg)",
              opacity: 0.85,
            }}
          >
            obj. {data.objectionCount} &mdash; nil upheld
          </span>
        </div>
      </div>

      {/* Elastic gap — absorbs a 3- vs 4-line body and 4 vs 6 entry rows. */}
      <div style={{ flex: 1, minHeight: 8 }} />

      {/* ── Footer block ─────────────────────────────────────────────────── */}
      <div style={{ position: "relative", zIndex: 2, flexShrink: 0 }}>
        <div style={{ borderTop: `1px solid ${RULE}`, marginBottom: 6 }} />
        <div style={{ ...serif, fontSize: 8.2, letterSpacing: 2.4, textTransform: "uppercase", color: INK_SOFT, marginBottom: 3 }}>
          Witnesses
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 6 }}>
          {witnesses.map((w, i) => (
            <WitnessColumn key={i} name={w.name} path={w.signaturePath} n={i + 1} seed={seed} />
          ))}
        </div>

        {/* registrar (left) + the office seal (right) */}
        <div style={{ position: "relative", marginTop: 9, minHeight: 50 }}>
          <div style={{ width: 150 }}>
            <Ink d={data.registrarSignaturePath} w={128} h={32} strokeWidth={2.1} />
            <div style={{ borderTop: `1px solid ${RULE}`, marginTop: -2 }} />
            <div style={{ ...serif, fontSize: 9, lineHeight: "12px", letterSpacing: 0.8, marginTop: 2 }}>Marriage Officer</div>
            <div style={{ ...serif, fontSize: 7.2, lineHeight: "10px", fontStyle: "italic", color: "#8a8272" }}>
              Office of the Registrar of Hearts
            </div>
          </div>

          <Seal
            uid="office"
            size={84}
            rotate={6.5}
            opacity={0.58}
            noiseSeed={23}
            inkCenter={{ x: 68, y: 62 }}
            style={{ position: "absolute", right: 2, bottom: -2 }}
          />
        </div>

        <div style={{ ...serif, fontSize: 7, color: "#8a8272", marginTop: 5, maxWidth: 250, lineHeight: 1.5 }}>
          {provisional ? "Provisional — pending witness attestation. " : ""}
          Not valid for legal, tax, or visa purposes. Valid for everything that matters.
        </div>
      </div>

      {/*
        Chai-cup ring. Sits ABOVE the print (z-index 5) because a stain lands on
        a document after it is printed, and runs off the edge because a cup does
        not politely stay inside the margin.
      */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          right: -22,
          bottom: 44,
          width: 70,
          height: 70,
          borderRadius: "50%",
          border: "1.6px solid #7a4a1f",
          opacity: 0.07,
          zIndex: 5,
          pointerEvents: "none",
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          right: -14,
          bottom: 52,
          width: 54,
          height: 54,
          borderRadius: "50%",
          border: "1px solid #7a4a1f",
          opacity: 0.045,
          zIndex: 5,
          pointerEvents: "none",
        }}
      />
    </div>
  );
});

export default Certificate;
