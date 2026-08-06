"use client";

// ─── The report ──────────────────────────────────────────────────────────────
//
// This is PAPER. Nothing on it moves, nothing on it is remote, and nothing on
// it is derived: every number, attribute and sentence arrives already computed
// on the `report` prop. The node rendered here is exactly the node that gets
// captured as a PNG, so anything that cannot survive `html-to-image` — a
// <video>, a cross-origin <img> — must never appear inside it.
//
// Fixed 420px wide at every viewport. The caller scales it; it never reflows.

import { seededInt, seededSpread } from "@/lib/seededRandom";
import AshtakootaTable from "./AshtakootaTable";
import NorthIndianChart from "./NorthIndianChart";
import Stamp from "./Stamp";
import { dotDate, type ChartData, type KundliData, type KundliReport } from "./types";
import { DEVA, DOC_W, INK, MAROON, MONO, PAPER, SAFFRON, SERIF, SOFT_INK } from "./ui";

const CONTENT_W = 384;
const PAD = (DOC_W - CONTENT_W) / 2; // 18

export interface HouseTap {
  who: string;
  house: number;
  planets: string[];
  meaning: string;
}

/* ── small pieces ─────────────────────────────────────────────────────────── */

function Section({
  title,
  hindi,
  children,
  innerRef,
}: {
  title: string;
  hindi?: string;
  children: React.ReactNode;
  innerRef?: React.Ref<HTMLDivElement>;
}) {
  return (
    <div ref={innerRef} style={{ border: `1px solid ${INK}`, marginTop: 8 }}>
      <div
        style={{
          borderBottom: `1px solid ${INK}`,
          background: "rgba(20,17,13,.045)",
          padding: "3px 6px",
          display: "flex",
          alignItems: "baseline",
          gap: 6,
        }}
      >
        <span
          style={{
            fontFamily: SERIF,
            fontSize: 7.4,
            fontWeight: 700,
            letterSpacing: 1.4,
            textTransform: "uppercase",
          }}
        >
          {title}
        </span>
        {hindi && <span style={{ fontFamily: DEVA, fontSize: 7.4, opacity: 0.72 }}>{hindi}</span>}
      </div>
      <div style={{ padding: 8 }}>{children}</div>
    </div>
  );
}

/** Two digits of the report number sit a pixel high — a tired dot-matrix head. */
function ReportNumber({ value, seed }: { value: string; seed: string }) {
  const digitIdx = value.split("").reduce<number[]>((acc, c, i) => {
    if (c >= "0" && c <= "9") acc.push(i);
    return acc;
  }, []);
  const a = digitIdx.length ? digitIdx[seededInt(seed, "hopA", 0, digitIdx.length - 1)] : -1;
  const b = digitIdx.length ? digitIdx[seededInt(seed, "hopB", 0, digitIdx.length - 1)] : -1;
  return (
    <span style={{ fontFamily: MONO, fontSize: 8.5, letterSpacing: 0.3 }}>
      {value.split("").map((c, i) => (
        <span
          key={i}
          style={{ display: "inline-block", transform: i === a || i === b ? "translateY(-1px)" : undefined }}
        >
          {c}
        </span>
      ))}
    </span>
  );
}

/** Geometric line-art flourish. Not floral, not heraldic — just rule work. */
function CornerMotif({ corner, size = 26 }: { corner: 0 | 1 | 2 | 3; size?: number }) {
  const rot = corner * 90;
  const pos: React.CSSProperties =
    corner === 0
      ? { top: 12, left: 12 }
      : corner === 1
        ? { top: 12, right: 12 }
        : corner === 2
          ? { bottom: 12, right: 12 }
          : { bottom: 12, left: 12 };
  return (
    <svg
      viewBox="0 0 30 30"
      width={size}
      height={size}
      aria-hidden
      style={{ position: "absolute", ...pos, transform: `rotate(${rot}deg)`, opacity: 0.55 }}
    >
      <g fill="none" stroke={SAFFRON} strokeWidth="0.9">
        <path d="M0,10 L10,10 L10,0" />
        <path d="M0,16 L16,16 L16,0" />
        <path d="M0,22 L4,22 M22,0 L22,4" />
        <path d="M4,4 L10,10" strokeWidth="0.7" />
        <rect x="1.5" y="1.5" width="5" height="5" strokeWidth="0.7" />
      </g>
    </svg>
  );
}

const PARTICULAR_COLS = "84px 150px 150px";

function ParticularRow({
  label,
  vara,
  vadhu,
  last,
}: {
  label: string;
  vara: string;
  vadhu: string;
  last?: boolean;
}) {
  const cell: React.CSSProperties = {
    padding: "2.5px 5px",
    borderRight: `1px solid ${INK}`,
    borderBottom: last ? "none" : `1px solid rgba(20,17,13,.28)`,
    fontFamily: MONO,
    fontSize: 7.6,
    lineHeight: 1.3,
    overflowWrap: "anywhere",
    boxSizing: "border-box",
  };
  return (
    <>
      <div style={{ ...cell, fontFamily: SERIF, fontSize: 8, background: "rgba(20,17,13,.03)" }}>{label}</div>
      <div style={cell}>{vara}</div>
      <div style={{ ...cell, borderRight: "none" }}>{vadhu}</div>
    </>
  );
}

const timeOf = (c: ChartData): string => (c.timeStated ? `${c.effectiveTob} hrs` : "time not stated");

const FINE_PRINT: string[] = [
  "Ayanamsa: Lahiri",
  "Chart style: North Indian",
  "Computed under the Ashtakoota system, 36 gunas",
  "Guna values, attribute pools and house placements are generated from the stated birth data alone",
  "This report is generated for entertainment. It has no astrological validity and must not be used for any actual matrimonial decision.",
  "The Office of the Registrar of Hearts is a fictional authority and is not affiliated with any government body, court, panchang or astrological service",
  "No planet was consulted",
  "Objections, if any, to be raised in person and over chai",
];

/* ── the document ─────────────────────────────────────────────────────────── */

export default function ReportPaper({
  data,
  report,
  uid,
  mangalRef,
  remediesRef,
  onHouseTap,
  onYoniTap,
}: {
  data: KundliData;
  report: KundliReport;
  /** Namespaces the SVG ids — the paper can be on screen twice during export. */
  uid: string;
  mangalRef?: React.Ref<HTMLDivElement>;
  remediesRef?: React.Ref<HTMLDivElement>;
  onHouseTap?: (tap: HouseTap) => void;
  onYoniTap?: () => void;
}) {
  const seed = report.seed;
  // Every imperfection below is seeded, so the screen and the PNG agree and a
  // reload never moves anything.
  const streakLeft = 35 + seededSpread(seed, "streak", 4);
  const g = report.groomChart;
  const b = report.brideChart;

  return (
    <div
      style={{
        width: DOC_W,
        background: PAPER,
        color: INK,
        position: "relative",
        padding: `${PAD}px`,
        boxSizing: "border-box",
        // A faint paper tint. The one permitted gradient.
        backgroundImage:
          "radial-gradient(120% 80% at 20% 0%, rgba(200,137,46,.055) 0%, rgba(253,251,244,0) 60%)",
      }}
    >
      {/* Saffron border band — the one colour accent these reports always have */}
      <div
        aria-hidden
        style={{ position: "absolute", inset: 5, border: `3px solid rgba(200,137,46,.15)`, pointerEvents: "none" }}
      />
      <div
        aria-hidden
        style={{ position: "absolute", inset: 10, border: `1px solid rgba(200,137,46,.3)`, pointerEvents: "none" }}
      />
      <CornerMotif corner={0} />
      <CornerMotif corner={1} />
      <CornerMotif corner={2} />
      <CornerMotif corner={3} />

      {/* A tired toner cartridge leaves one faint vertical stripe. */}
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

      {/* 1 ── header band. Sits 1px left of the body; the sheet fed crooked. */}
      <div style={{ textAlign: "center", marginLeft: -1, paddingTop: 12 }}>
        <div style={{ fontFamily: SERIF, fontSize: 15, fontWeight: 700, letterSpacing: 3.4 }}>
          KUNDLI MILAN REPORT
        </div>
        <div style={{ fontFamily: DEVA, fontSize: 12.5, marginTop: 2, letterSpacing: 0.4 }}>
          कुण्डली मिलान रिपोर्ट
        </div>
        <div style={{ fontFamily: SERIF, fontSize: 8.5, marginTop: 4, color: SOFT_INK }}>
          Office of the Registrar of Hearts · Report No.{" "}
          <ReportNumber value={report.reportNo} seed={seed} />
        </div>
      </div>
      <div style={{ marginTop: 6, borderTop: `2px solid ${INK}` }} />
      <div style={{ marginTop: 2, borderTop: `1px solid ${INK}` }} />

      {/* 2 ── the two rashi charts */}
      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        {[
          { c: g, who: "VARA", person: data.groom },
          { c: b, who: "VADHU", person: data.bride },
        ].map(({ c, who, person }) => (
          <div key={who} style={{ width: 188, border: `1px solid ${INK}`, boxSizing: "border-box" }}>
            <div
              style={{
                borderBottom: `1px solid ${INK}`,
                background: "rgba(20,17,13,.045)",
                padding: "2px 5px",
                fontFamily: SERIF,
                fontSize: 7,
                fontWeight: 700,
                letterSpacing: 1.2,
              }}
            >
              RASHI CHAKRA
            </div>
            <div style={{ padding: 6, display: "flex", justifyContent: "center" }}>
              <NorthIndianChart
                chart={c}
                size={174}
                whoLabel={who}
                onHouseTap={
                  onHouseTap
                    ? (house, planets, meaning) => onHouseTap({ who, house, planets, meaning })
                    : undefined
                }
              />
            </div>
            <div
              style={{
                borderTop: `1px solid rgba(20,17,13,.3)`,
                padding: "3px 5px",
                textAlign: "center",
              }}
            >
              <span style={{ fontFamily: SERIF, fontSize: 8 }}>{who} — </span>
              <span style={{ fontFamily: MONO, fontSize: 8 }}>{c.lagna}</span>
              <span style={{ fontFamily: SERIF, fontSize: 8 }}> Lagna</span>
              <div style={{ fontFamily: MONO, fontSize: 7, opacity: 0.75, marginTop: 1 }}>
                {person.name}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 3 ── particulars */}
      <Section title="Particulars" hindi="विवरण">
        <div style={{ display: "grid", gridTemplateColumns: PARTICULAR_COLS, border: `1px solid ${INK}` }}>
          <div
            style={{
              padding: "2.5px 5px",
              borderRight: `1px solid ${INK}`,
              borderBottom: `1px solid ${INK}`,
              fontFamily: SERIF,
              fontSize: 7,
              fontWeight: 700,
              letterSpacing: 1,
              textTransform: "uppercase",
              background: "rgba(20,17,13,.045)",
            }}
          >
            Item
          </div>
          <div
            style={{
              padding: "2.5px 5px",
              borderRight: `1px solid ${INK}`,
              borderBottom: `1px solid ${INK}`,
              fontFamily: SERIF,
              fontSize: 7,
              fontWeight: 700,
              letterSpacing: 1,
              textTransform: "uppercase",
              background: "rgba(20,17,13,.045)",
            }}
          >
            Vara (groom)
          </div>
          <div
            style={{
              padding: "2.5px 5px",
              borderBottom: `1px solid ${INK}`,
              fontFamily: SERIF,
              fontSize: 7,
              fontWeight: 700,
              letterSpacing: 1,
              textTransform: "uppercase",
              background: "rgba(20,17,13,.045)",
            }}
          >
            Vadhu (bride)
          </div>

          <ParticularRow label="Name" vara={data.groom.name} vadhu={data.bride.name} />
          <ParticularRow label="Date of Birth" vara={dotDate(data.groom.dob)} vadhu={dotDate(data.bride.dob)} />
          <ParticularRow label="Time of Birth" vara={timeOf(g)} vadhu={timeOf(b)} />
          <ParticularRow label="Place" vara={data.groom.pob} vadhu={data.bride.pob} />
          <ParticularRow label="Nakshatra" vara={g.nakshatra} vadhu={b.nakshatra} />
          <ParticularRow label="Charan" vara={String(g.charan)} vadhu={String(b.charan)} />
          <ParticularRow label="Rashi" vara={g.rashi} vadhu={b.rashi} />
          <ParticularRow label="Gana" vara={g.gana} vadhu={b.gana} />
          <ParticularRow label="Yoni" vara={g.yoni} vadhu={b.yoni} />
          <ParticularRow label="Nadi" vara={g.nadi} vadhu={b.nadi} />
          <ParticularRow label="Varna" vara={g.varna} vadhu={b.varna} last />
        </div>
      </Section>

      {/* 4 ── the centrepiece */}
      <Section title="Ashtakoota Milan" hindi="अष्टकूट मिलान">
        <AshtakootaTable report={report} onYoniTap={onYoniTap} />
      </Section>

      {/* 5 ── mangal dosha, always in a resolved state */}
      <Section title="Mangal Dosha" hindi="मंगल दोष" innerRef={mangalRef}>
        <div style={{ fontFamily: MONO, fontSize: 8.4, lineHeight: 1.5 }}>{report.mangalDosha}</div>
      </Section>

      {/* 6 ── conclusion */}
      <Section title="Conclusion" hindi="निष्कर्ष">
        <div style={{ fontFamily: SERIF, fontSize: 9.4, lineHeight: 1.55, textAlign: "justify" }}>
          {report.conclusion}
        </div>
      </Section>

      {/* 7 ── remedies */}
      <Section title="Remedies (Upaya)" hindi="उपाय" innerRef={remediesRef}>
        <ol style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {data.remedies.map((r, i) => (
            <li
              key={i}
              style={{
                display: "flex",
                gap: 6,
                marginTop: i === 0 ? 0 : 4,
                fontFamily: MONO,
                fontSize: 8.4,
                lineHeight: 1.45,
              }}
            >
              <span style={{ minWidth: 14, flex: "0 0 auto" }}>{i + 1}.</span>
              <span>{r}</span>
            </li>
          ))}
        </ol>
      </Section>

      {/* 8 ── sign-off, with the impression across the ruled line */}
      <div style={{ position: "relative", marginTop: 14, display: "flex", justifyContent: "space-between" }}>
        <div style={{ fontFamily: SERIF, fontSize: 8, color: SOFT_INK, alignSelf: "flex-end" }}>
          Issued on{" "}
          <span style={{ fontFamily: MONO, fontSize: 8 }}>{dotDate(data.issuedOn)}</span>
          <div style={{ marginTop: 2 }}>Place: Office of the Registrar of Hearts</div>
        </div>

        <div style={{ width: 180, textAlign: "center" }}>
          <div style={{ height: 26 }} />
          <div style={{ borderTop: `1px solid ${INK}`, paddingTop: 3 }}>
            <div style={{ fontFamily: MONO, fontSize: 9 }}>{data.astrologerName}</div>
            <div style={{ fontFamily: SERIF, fontSize: 7.6, color: SOFT_INK, marginTop: 1 }}>
              Jyotish Acharya · Registrar of Hearts
            </div>
          </div>
        </div>

        <div style={{ position: "absolute", right: 6, bottom: -14 }}>
          <Stamp uid={uid} seed={seed} size={92} />
        </div>
      </div>

      {/* 9 ── fine print */}
      <div
        style={{
          marginTop: 30,
          borderTop: `1px solid rgba(20,17,13,.35)`,
          paddingTop: 4,
          fontFamily: SERIF,
          fontSize: 6.5,
          lineHeight: 1.5,
          color: SOFT_INK,
          textAlign: "justify",
        }}
      >
        {FINE_PRINT.join(" · ")}
      </div>
      <div
        style={{
          marginTop: 3,
          fontFamily: MONO,
          fontSize: 6.5,
          color: MAROON,
          letterSpacing: 0.2,
        }}
      >
        {report.reportNo} · guna {report.total}/36 · not valid for any actual matrimonial decision
      </div>
    </div>
  );
}
